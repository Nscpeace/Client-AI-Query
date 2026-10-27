import React, { useState } from 'react';
import { X, Sparkles, Send, Mail, Building, AlertCircle } from 'lucide-react';
import { ClientQuery, KnowledgeArticle, ClientRecord } from '../types/inbox';

interface NewEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onIngestQuery: (query: ClientQuery) => void;
  knowledgeBase: KnowledgeArticle[];
  clients: ClientRecord[];
}

export const NewEmailModal: React.FC<NewEmailModalProps> = ({
  isOpen,
  onClose,
  onIngestQuery,
  knowledgeBase,
  clients,
}) => {
  const [selectedClientId, setSelectedClientId] = useState(clients[0]?.id || 'client_apex');
  const [senderName, setSenderName] = useState('David Chen');
  const [senderEmail, setSenderEmail] = useState('dchen@apexlogistics.com');
  const [subject, setSubject] = useState('Critical dispatch API timeout on cluster');
  const [body, setBody] = useState(`Hi Team,\n\nOur production dispatch service has been experiencing 504 gateway timeouts for the last 15 minutes. We currently have over 800 manifests delayed. As an Enterprise client, please investigate immediately and confirm whether our retry queue is safe.`);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // Presets
  const applyPreset = (presetType: 'outage' | 'billing' | 'limits' | 'confidential') => {
    if (presetType === 'outage') {
      setSelectedClientId('client_apex');
      setSenderName('David Chen');
      setSenderEmail('dchen@apexlogistics.com');
      setSubject('URGENT: Webhook dispatch queue reporting 504 timeouts');
      setBody(`Hi Support Team,\n\nOur European dispatch automation is hitting 504 gateway timeouts on /v2/events/dispatch. Over 1,200 shipment notices are queued in our buffer. Is our event buffer safe, and what is the ETA for mitigation?`);
    } else if (presetType === 'billing') {
      setSelectedClientId('client_strata');
      setSenderName('Rachel Green');
      setSenderEmail('rachel@stratacloud.tech');
      setSubject('Invoice #INV-2026-0902 missing promotional credit');
      setBody(`Hello,\n\nWe noticed our September invoice was billed for $680 without our agreed promotional credit for 2 worker slots. Could you please review and issue a revised invoice before Friday's wire transfer?`);
    } else if (presetType === 'limits') {
      setSelectedClientId('client_vector');
      setSenderName('Liam Sato');
      setSenderEmail('liam@vectordynamics.ai');
      setSubject('Hitting 429 rate limits on batch embedding runs');
      setBody(`Hi team,\n\nOur nightly embedding pipeline tripped HTTP 429 Too Many Requests errors. We have an investor demo next week—can we activate a temporary burst multiplier while we prepare our tier upgrade?`);
    } else if (presetType === 'confidential') {
      setSelectedClientId('client_biotech');
      setSenderName('Dr. Aris Thorne');
      setSenderEmail('athorne@helixlabs.org');
      setSubject('CONFIDENTIAL: Prometheus Cohort 4 data ingestion security review');
      setBody(`CONFIDENTIAL Under Master Clinical NDA.\n\nWe need Sarah Jenkins to review our custom encryption payload structure prior to tomorrow's ingestion. Confirm automated AI tools are bypassed per Section 4.`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !body) return;

    setIsSubmitting(true);
    const client = clients.find((c) => c.id === selectedClientId) || clients[0];

    try {
      // Call server triage endpoint
      const response = await fetch('/api/triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          body,
          senderEmail,
          clientTier: client.tier,
          clientName: client.name,
          knowledgeBase,
        }),
      });

      const data = await response.json();
      const triage = data.result;

      // Check confidentiality rule
      const isConfidential = client.isConfidential || senderEmail.includes('helix') || senderEmail.includes('novapay');

      // Create new client query
      const newQuery: ClientQuery = {
        id: `query_${Date.now()}`,
        source: 'simulator',
        threadId: `th_${Date.now()}`,
        senderName,
        senderEmail,
        clientCompany: client.name,
        clientId: client.id,
        subject,
        snippet: body.substring(0, 120) + '...',
        body,
        receivedAt: new Date().toISOString(),
        slaDeadline: new Date(Date.now() + client.slaResponseHours * 60 * 60 * 1000).toISOString(),
        category: (triage.category as any) || 'Technical Incident',
        urgency: (triage.urgency as any) || (client.tier === 'Enterprise' ? 'P1 Critical' : 'P2 High'),
        sentiment: (triage.sentiment as any) || 'Urgent',
        status: isConfidential ? 'confidential_routed' : 'draft_ready',
        isConfidential,
        confidentialReason: isConfidential ? 'Client domain flagged under Confidential Accounts Policy.' : undefined,
        assignedTo: triage.suggestedRole ? client.assignedCSM : 'Sarah Jenkins',
        assignedRole: triage.suggestedRole || 'Enterprise Support Engineer',
        aiReasoning: triage.reasoning,
        draftReply: {
          id: `draft_${Date.now()}`,
          queryId: `query_${Date.now()}`,
          subject: triage.draftSubject || `Re: ${subject}`,
          body: triage.draftBody || 'Thank you for contacting support...',
          tone: 'technical',
          confidenceScore: triage.confidenceScore || 94,
          generatedAt: new Date().toISOString(),
          isApproved: false,
          isSavedToGmailDrafts: false,
          citations: (triage.matchedSectionCodes || []).map((code: string) => {
            const kb = knowledgeBase.find((k) => k.sectionCode === code);
            return {
              articleId: kb?.id || 'kb_ref',
              sectionCode: code,
              title: kb?.title || 'Knowledge Base Runbook',
              relevantExcerpt: kb?.summary || 'Standard operating procedure',
              confidence: 95,
            };
          }),
        },
        routingHistory: [
          {
            timestamp: new Date().toLocaleTimeString(),
            action: isConfidential ? 'Confidential Human Route' : 'Gemini AI Ingestion & Triage',
            actor: isConfidential ? 'Security Shield' : 'ClientPulse Pipeline',
            note: isConfidential ? 'Bypassed LLM per NDA' : `Assigned ${triage.urgency} and staged grounded draft`,
          },
        ],
      };

      onIngestQuery(newQuery);
      onClose();
    } catch (err) {
      console.error('Ingest error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Simulate Inbound Client Query</h3>
              <p className="text-[11px] text-slate-500">Trigger live Gemini AI categorization, SLA analysis, and draft synthesis.</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Presets Strip */}
        <div className="p-3 bg-slate-100/70 border-b border-slate-200 flex items-center gap-2 flex-wrap text-xs">
          <span className="text-slate-500 text-[11px] font-medium mr-1">Load Preset:</span>
          <button
            type="button"
            onClick={() => applyPreset('outage')}
            className="px-2 py-0.5 bg-white hover:bg-slate-50 border border-slate-200 rounded text-[11px] font-medium text-red-700 cursor-pointer"
          >
            P1 Outage (504s)
          </button>
          <button
            type="button"
            onClick={() => applyPreset('billing')}
            className="px-2 py-0.5 bg-white hover:bg-slate-50 border border-slate-200 rounded text-[11px] font-medium text-amber-700 cursor-pointer"
          >
            Billing Credit Dispute
          </button>
          <button
            type="button"
            onClick={() => applyPreset('limits')}
            className="px-2 py-0.5 bg-white hover:bg-slate-50 border border-slate-200 rounded text-[11px] font-medium text-blue-700 cursor-pointer"
          >
            Rate Limit 429
          </button>
          <button
            type="button"
            onClick={() => applyPreset('confidential')}
            className="px-2 py-0.5 bg-white hover:bg-slate-50 border border-slate-200 rounded text-[11px] font-medium text-slate-700 cursor-pointer"
          >
            Confidential NDA
          </button>
        </div>

        {/* Ingest Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">Client Account</label>
              <select
                value={selectedClientId}
                onChange={(e) => {
                  setSelectedClientId(e.target.value);
                  const cl = clients.find((c) => c.id === e.target.value);
                  if (cl) {
                    setSenderEmail(`contact@${cl.domain}`);
                  }
                }}
                className="w-full text-xs p-2 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.tier})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">Sender Name</label>
              <input
                type="text"
                required
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                className="w-full text-xs p-2 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-700 block mb-1">Sender Email</label>
            <input
              type="email"
              required
              value={senderEmail}
              onChange={(e) => setSenderEmail(e.target.value)}
              className="w-full text-xs p-2 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-700 block mb-1">Subject Line</label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full text-xs p-2 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-700 block mb-1">Email Body Content</label>
            <textarea
              required
              rows={5}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full text-xs p-2.5 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-slate-400">
              ⚡ Processed via Gemini Flash with verified citations
            </span>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-md cursor-pointer shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Triaging with Gemini...' : 'Ingest & Triage Query'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
