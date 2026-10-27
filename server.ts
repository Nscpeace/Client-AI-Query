import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Server-side Gemini Client
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.warn('Gemini AI initialization notice:', err);
  }
}

// 1. Triage Endpoint
app.post('/api/triage', async (req: Request, res: Response) => {
  try {
    const { subject, body, senderEmail, clientTier, clientName, knowledgeBase } = req.body;

    if (!subject || !body) {
      return res.status(400).json({ error: 'Subject and body are required' });
    }

    // If Gemini client is available and key is configured, run grounded structured triage
    if (ai && process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY') {
      try {
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Gemini timeout')), 4000)
        );
        const kbContext = (knowledgeBase || [])
          .map((kb: any) => `[${kb.sectionCode}] ${kb.title}\n${kb.content}`)
          .join('\n\n');

        const prompt = `You are an elite B2B client support operations specialist.
Analyze the following incoming client query and triage it accurately.

CLIENT CONTEXT:
- Client Name: ${clientName || 'Unknown'}
- Domain/Email: ${senderEmail || 'unknown@client.com'}
- Account Tier: ${clientTier || 'Startup'}

KNOWLEDGE BASE & RUNBOOKS:
${kbContext}

INCOMING EMAIL:
Subject: ${subject}
Body:
${body}

YOUR TASK:
1. Classify category: 'Technical Incident' | 'Billing & Invoicing' | 'Account & Contract' | 'Feature Request' | 'Onboarding & Setup' | 'General Inquiry'
2. Assess Urgency: 'P1 Critical' (complete outage/severe revenue risk) | 'P2 High' (major feature degraded/payment blocked) | 'P3 Normal' (standard issue) | 'P4 Low' (routine question/feedback)
3. Detect Sentiment: 'Frustrated' | 'Urgent' | 'Neutral' | 'Inquisitive'
4. Provide reasoning grounded in the client's tier, SLA requirements, and the query severity.
5. Identify the top 1 or 2 relevant knowledge base section codes (e.g. KB-INCIDENT-§7.1) that apply.
6. Suggest the ideal team role to handle this query (e.g. 'Senior Solutions Engineer', 'Billing Operations Specialist', 'Enterprise CSM').
7. Draft an initial professional, grounded reply (under 250 words) that directly cites the relevant section code(s), reassures the customer, offers actionable next steps or resolution, and adheres to a zero-auto-send draft policy.`;

        const geminiCall = ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                category: {
                  type: Type.STRING,
                  description: 'Category of the query',
                },
                urgency: {
                  type: Type.STRING,
                  description: 'Urgency tier (P1 Critical, P2 High, P3 Normal, P4 Low)',
                },
                sentiment: {
                  type: Type.STRING,
                  description: 'Detected customer sentiment',
                },
                reasoning: {
                  type: Type.STRING,
                  description: 'Detailed analysis of why this category and urgency were chosen',
                },
                suggestedRole: {
                  type: Type.STRING,
                  description: 'Ideal support role to route to',
                },
                matchedSectionCodes: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'Knowledge base section codes that substantiate the reply',
                },
                draftSubject: {
                  type: Type.STRING,
                  description: 'Subject line for the draft reply (usually Re: ...)',
                },
                draftBody: {
                  type: Type.STRING,
                  description: 'Polite, grounded draft response text with citations',
                },
                confidenceScore: {
                  type: Type.NUMBER,
                  description: 'Confidence score from 70 to 100',
                },
              },
              required: [
                'category',
                'urgency',
                'sentiment',
                'reasoning',
                'suggestedRole',
                'matchedSectionCodes',
                'draftSubject',
                'draftBody',
                'confidenceScore',
              ],
            },
          },
        });

        const response = (await Promise.race([geminiCall, timeoutPromise])) as any;
        const parsed = JSON.parse(response.text || '{}');
        return res.json({
          source: 'gemini_flash',
          result: parsed,
        });
      } catch (geminiError: any) {
        console.warn('Gemini call failed, falling back to rule-based triage:', geminiError?.message);
      }
    }

    // High-fidelity fallback heuristic triage
    const lowerBody = (subject + ' ' + body).toLowerCase();
    let category = 'General Inquiry';
    let urgency = 'P3 Normal';
    let sentiment = 'Neutral';
    let suggestedRole = 'Customer Success Lead';
    let matchedCodes: string[] = [];

    if (lowerBody.includes('504') || lowerBody.includes('outage') || lowerBody.includes('timeout') || lowerBody.includes('down')) {
      category = 'Technical Incident';
      urgency = clientTier === 'Enterprise' ? 'P1 Critical' : 'P2 High';
      sentiment = 'Urgent';
      suggestedRole = 'Senior Solutions Engineer';
      matchedCodes = ['KB-INCIDENT-§7.1', 'KB-SLA-§1.1'];
    } else if (lowerBody.includes('invoice') || lowerBody.includes('bill') || lowerBody.includes('credit') || lowerBody.includes('refund') || lowerBody.includes('charge')) {
      category = 'Billing & Invoicing';
      urgency = 'P2 High';
      sentiment = 'Inquisitive';
      suggestedRole = 'Billing Operations Specialist';
      matchedCodes = ['KB-BILLING-§3.2'];
    } else if (lowerBody.includes('429') || lowerBody.includes('rate limit') || lowerBody.includes('quota') || lowerBody.includes('burst')) {
      category = 'Technical Incident';
      urgency = 'P3 Normal';
      sentiment = 'Inquisitive';
      suggestedRole = 'Technical Account Specialist';
      matchedCodes = ['KB-TECH-§4.4'];
    } else if (lowerBody.includes('contract') || lowerBody.includes('nda') || lowerBody.includes('audit') || lowerBody.includes('confidential')) {
      category = 'Account & Contract';
      urgency = clientTier === 'Enterprise' ? 'P1 Critical' : 'P2 High';
      sentiment = 'Urgent';
      suggestedRole = 'Enterprise Account Director';
      matchedCodes = ['KB-SECURITY-§9.0', 'KB-SLA-§1.1'];
    }

    const fallbackDraft = `Hi there,\n\nThank you for reaching out to Acme Cloud Support.\n\nWe have received your inquiry regarding "${subject}" and our team is actively reviewing your account details. Under our standard operating policy (${matchedCodes[0] || 'KB-SLA-§1.1'}), we are working on the required configuration and will provide a comprehensive status update shortly.\n\nIf you have any urgent attachments or error timestamps, please reply to this thread.\n\nBest regards,\n${suggestedRole}\nAcme Cloud Support`;

    return res.json({
      source: 'heuristic_fallback',
      result: {
        category,
        urgency,
        sentiment,
        reasoning: `Classified as ${category} (${urgency}) based on inbound query keywords and ${clientTier || 'Standard'} account SLA thresholds.`,
        suggestedRole,
        matchedSectionCodes: matchedCodes,
        draftSubject: subject.startsWith('Re:') ? subject : `Re: ${subject}`,
        draftBody: fallbackDraft,
        confidenceScore: 90,
      },
    });
  } catch (error: any) {
    console.error('Error in /api/triage:', error);
    res.status(500).json({ error: error.message || 'Internal triage error' });
  }
});

// 2. Draft Tone Regeneration Endpoint
app.post('/api/generate-draft', async (req: Request, res: Response) => {
  try {
    const { subject, body, tone, clientName, clientTier, matchedCitations, currentDraft } = req.body;

    const toneInstructions: Record<string, string> = {
      empathetic: 'Warm, highly understanding, apologetic for delays or friction, and reassuring.',
      concise: 'Direct, bulleted, action-oriented, under 100 words, no fluff.',
      technical: 'Deep technical detail, explaining root cause, log timestamps, Kafka buffers, and system mitigation architecture.',
      executive: 'Formal, strategic, polished, referencing contract agreements, SLAs, and enterprise partnership guarantees.',
    };

    const instruction = toneInstructions[tone] || toneInstructions.empathetic;

    if (ai && process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY') {
      try {
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Draft timeout')), 4000)
        );

        const prompt = `You are a client support engineer rewriting an email draft reply.
Target tone: ${tone.toUpperCase()} (${instruction})

CUSTOMER: ${clientName || 'Valued Client'} (${clientTier || 'Growth Tier'})
ORIGINAL EMAIL SUBJECT: ${subject}
ORIGINAL EMAIL BODY:
${body}

CITATIONS / POLICIES TO PRESERVE:
${(matchedCitations || []).map((c: any) => `[${c.sectionCode}]: ${c.relevantExcerpt || c.title}`).join('\n')}

CURRENT DRAFT VERSION:
${currentDraft || ''}

Write a revised draft response matching the ${tone} tone. Keep citations intact where appropriate. Do not hallucinate policies. Output only the draft email text without preamble.`;

        const geminiCall = ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
        });

        const response = (await Promise.race([geminiCall, timeoutPromise])) as any;

        return res.json({
          source: 'gemini_flash',
          draftBody: response.text?.trim(),
        });
      } catch (err: any) {
        console.warn('Gemini regeneration failed, using tone template fallback:', err?.message);
      }
    }

    // Heuristic fallback for tone adjustment
    let adjusted = currentDraft || '';
    if (tone === 'concise') {
      adjusted = `Hi ${clientName || 'there'},\n\nRegarding ${subject}:\n- Our engineering team is currently addressing the issue.\n- Your events and queues are protected and will retry automatically.\n- Next update will be provided within 30 minutes.\n\nBest,\nAcme Cloud Support`;
    } else if (tone === 'executive') {
      adjusted = `Dear ${clientName || 'Client'},\n\nWe appreciate you bringing this matter to our immediate attention. As part of our Enterprise SLA commitment, our senior leadership and solutions team have prioritized your request.\n\nWe have initiated immediate protocol reviews and will maintain continuous communication until full resolution.\n\nSincerely,\nExecutive Client Operations\nAcme Cloud`;
    }

    return res.json({
      source: 'heuristic_fallback',
      draftBody: adjusted,
    });
  } catch (error: any) {
    console.error('Error in /api/generate-draft:', error);
    res.status(500).json({ error: error.message || 'Draft generation failed' });
  }
});

// Server setup: Vite middleware in dev, static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`ClientPulse AI server running on port ${PORT}`);
  });
}

startServer();
