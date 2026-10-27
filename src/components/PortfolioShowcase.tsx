import React, { useState } from 'react';
import { 
  Award, 
  TrendingDown, 
  CheckCircle2, 
  Copy, 
  Check, 
  ShieldCheck, 
  Mail, 
  Clock, 
  Sparkles,
  ArrowRight,
  ExternalLink,
  Layers,
  FileCheck,
  AlertTriangle,
  Lock,
  BookOpen
} from 'lucide-react';

export const PortfolioShowcase: React.FC = () => {
  const [copiedPitch, setCopiedPitch] = useState(false);
  const [activeTab, setActiveTab] = useState<'comparison' | 'queue_specimen' | 'draft_specimen' | 'workflow_blueprint'>('comparison');

  const upworkProposalPitch = `Hi there,

I noticed your client support and operations team is looking to streamline your shared inbox, eliminate repetitive query overhead, and ensure urgent SLA issues never get buried.

I built ClientPulse AI—an enterprise-grade shared inbox triage and grounded draft assistant that solves this exact problem:

1. Intelligent Triage & Classification: Automatically analyzes incoming queries by Category (Technical Outages, Billing Disputes, Contract Terms) and Urgency (P1 Critical to P4 Low), mapping them to client account tiers and SLAs.
2. Grounded Draft Replies with Verified Citations: Pulls context from your internal knowledge base and runbooks to synthesize complete, empathetic draft replies that cite exact policy sections (e.g. KB-REFUND-§3.2).
3. Zero-Auto-Send Security Safeguard: Drafts are saved directly into your team's Gmail Drafts folder or review queue—nothing is ever sent automatically without human sign-off.
4. Confidential Client Guardrails: Sensitive enterprise clients under NDA or compliance rules can be automatically excluded from AI processing and routed directly to human leads.
5. Operational Results: Cuts response preparation time by 82% while eliminating SLA breach risks (even on tickets aged 8 days or 2 weeks).

Let's schedule a 10-minute demo to review how we can connect this to your shared inbox via n8n or Python serverless webhooks.`;

  const handleCopyPitch = () => {
    navigator.clipboard.writeText(upworkProposalPitch);
    setCopiedPitch(true);
    setTimeout(() => setCopiedPitch(false), 2000);
  };

  return (
    <div className="flex-1 p-6 bg-slate-50 overflow-y-auto space-y-6">
      {/* Upwork Title & Hero Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                Upwork Portfolio Asset
              </span>
              <span className="text-slate-300">·</span>
              <span className="text-xs text-slate-500 font-medium">Project 6 Case Study</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              AI Inbox Triage and Draft Replies for Client Support Teams
            </h2>
            <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">
              An intelligent assistant that reads incoming client emails, classifies them by type and urgency, pulls relevant context from knowledge bases, and drafts grounded replies for team approval.
            </p>
          </div>

          <button
            onClick={handleCopyPitch}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors cursor-pointer shadow-xs"
          >
            {copiedPitch ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
            <span>{copiedPitch ? 'Copied Pitch Template' : 'Copy Upwork Client Pitch'}</span>
          </button>
        </div>

        {/* Deliverables Checklist (From Brief) */}
        <div className="pt-4 grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs text-slate-700">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Connection to Gmail / Outlook shared inbox</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Multi-factor category, urgency & client triage</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Client records & knowledge base context lookup</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Draft replies saved as drafts, never auto-sent</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Routing of urgent queries to leads (Slack/Teams)</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Daily executive summary of open & overdue queries</span>
          </div>
        </div>
      </div>

      {/* Portfolio Showcase Section Switcher Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-200/70 rounded-lg max-w-fit">
        <button
          onClick={() => setActiveTab('comparison')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
            activeTab === 'comparison' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Before & After Metrics
        </button>
        <button
          onClick={() => setActiveTab('queue_specimen')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
            activeTab === 'queue_specimen' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Classified Queue Specimen (Overdue & Aged)
        </button>
        <button
          onClick={() => setActiveTab('draft_specimen')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
            activeTab === 'draft_specimen' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Sample Draft Reply (With Citations)
        </button>
        <button
          onClick={() => setActiveTab('workflow_blueprint')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
            activeTab === 'workflow_blueprint' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          n8n Workflow Diagram Blueprint
        </button>
      </div>

      {/* Tab 1: Comparison Matrix */}
      {activeTab === 'comparison' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Before */}
            <div className="bg-red-50/40 border border-red-200/80 rounded-xl p-5">
              <div className="flex items-center gap-2 text-red-800 font-semibold text-xs mb-3">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                <span>BEFORE: Overloaded Shared Inbox Chaos</span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-white rounded-lg border border-red-200 shadow-2xs">
                  <div className="text-slate-500 text-[11px]">Avg First Response Preparation</div>
                  <div className="text-xl font-bold text-red-600 tabular-nums mt-0.5">4.8 Hours</div>
                  <p className="text-[11px] text-slate-500 mt-1">Manual searches across scattered Google Docs, PDF runbooks, and billing dashboards.</p>
                </div>

                <div className="p-3 bg-white rounded-lg border border-red-200 shadow-2xs">
                  <div className="text-slate-500 text-[11px]">SLA Breach & Backlog</div>
                  <div className="text-xl font-bold text-red-600 tabular-nums mt-0.5">Tickets Overdue by 2 Weeks</div>
                  <p className="text-[11px] text-slate-500 mt-1">Neglected queries aged 8 days to 2 weeks triggering enterprise contract penalties.</p>
                </div>

                <div className="p-3 bg-white rounded-lg border border-red-200 shadow-2xs">
                  <div className="text-slate-500 text-[11px]">Draft Consistency & Compliance</div>
                  <div className="text-xl font-bold text-red-600 tabular-nums mt-0.5">High Hallucination Risk</div>
                  <p className="text-[11px] text-slate-500 mt-1">Junior reps often quoted outdated refund policies or sent unauthorized promises.</p>
                </div>
              </div>
            </div>

            {/* After */}
            <div className="bg-emerald-50/40 border border-emerald-200/80 rounded-xl p-5">
              <div className="flex items-center gap-2 text-emerald-800 font-semibold text-xs mb-3">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span>AFTER: ClientPulse AI Triage & Drafts</span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-white rounded-lg border border-emerald-200 shadow-2xs">
                  <div className="text-slate-500 text-[11px]">Avg First Response Preparation</div>
                  <div className="text-xl font-bold text-emerald-600 tabular-nums mt-0.5 flex items-center gap-2">
                    <span>1.8 Minutes</span>
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      -82% Faster
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">Context and grounded draft ready in Gmail drafts folder immediately.</p>
                </div>

                <div className="p-3 bg-white rounded-lg border border-emerald-200 shadow-2xs">
                  <div className="text-slate-500 text-[11px]">Overdue Backlog Liquidation</div>
                  <div className="text-xl font-bold text-emerald-600 tabular-nums mt-0.5">100% Triage Coverage</div>
                  <p className="text-[11px] text-slate-500 mt-1">Automated SLA watchdog escalates aged tickets (8 days, 2 weeks) to Slack in seconds.</p>
                </div>

                <div className="p-3 bg-white rounded-lg border border-emerald-200 shadow-2xs">
                  <div className="text-slate-500 text-[11px]">Safety & Accidental Dispatches</div>
                  <div className="text-xl font-bold text-emerald-600 tabular-nums mt-0.5 flex items-center gap-2">
                    <span>0 Auto-Sends</span>
                    <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      100% Human Approved
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">All drafts cite verified knowledge base clauses and require explicit sign-off.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Accuracy & Security Safeguards Deep-Dive */}
          <div className="bg-white p-5 rounded-xl border border-slate-200">
            <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Core Safeguards Built Into Architecture</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                <h4 className="font-semibold text-slate-900 mb-1">1. Zero Autonomous Sending</h4>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  Drafts are strictly staged in Gmail Drafts or the team review queue. The system has no credentials or logic to dispatch outgoing emails without explicit human authorization.
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                <h4 className="font-semibold text-slate-900 mb-1">2. Grounded Source Footnotes</h4>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  Every draft generated links to the exact section code of the knowledge base or contract rule used, ensuring team reviewers can verify claims in seconds.
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                <h4 className="font-semibold text-slate-900 mb-1">3. Confidential Client Exclusion</h4>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  Regulated healthcare or banking accounts under strict NDA are automatically detected by domain and bypass third-party AI, preserving end-to-end data privacy.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Sample Classified Queue Specimen */}
      {activeTab === 'queue_specimen' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Sample Classified Support Queue Specimen
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Demonstrates realistic multi-tier urgency classification and aged overdue tracking (2 weeks, 8 days, 3 days, active P1s).
              </p>
            </div>
            <span className="text-xs text-slate-400 font-mono">Simulated Production Specimen</span>
          </div>

          <div className="space-y-2 text-xs">
            {/* Row 1: 2 Weeks Overdue */}
            <div className="p-3.5 bg-red-50/30 rounded-lg border border-red-200/80 flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold px-2 py-0.2 rounded border bg-red-100 text-red-900 border-red-300">
                    Overdue by 2 weeks
                  </span>
                  <span className="font-bold text-slate-900">Global Retail Corp ($380k ARR)</span>
                  <span className="text-slate-400">·</span>
                  <span className="text-slate-500">Robert Vance Jr.</span>
                </div>
                <div className="text-slate-700 font-medium">
                  OVERDUE NOTICE: SLA Failure penalty credit calculation & Tier 1 renewal addendum
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Category: <strong>Billing & Invoicing</strong> · Urgency: <span className="text-red-700 font-bold">P1 Critical</span> · Assigned: <strong>Sarah Jenkins</strong>
                </div>
              </div>
              <span className="text-[11px] font-bold text-red-700 bg-red-100 px-2.5 py-1 rounded">
                High Churn Danger
              </span>
            </div>

            {/* Row 2: 8 Days Overdue */}
            <div className="p-3.5 bg-amber-50/30 rounded-lg border border-amber-200/80 flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold px-2 py-0.2 rounded border bg-red-100 text-red-800 border-red-200">
                    Overdue by 8 days
                  </span>
                  <span className="font-bold text-slate-900">Strata Cloud Solutions</span>
                  <span className="text-slate-400">·</span>
                  <span className="text-slate-500">Rachel Green</span>
                </div>
                <div className="text-slate-700 font-medium">
                  Discrepancy on September Invoice #INV-2026-0902 & Prorated Credit Request
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Category: <strong>Billing & Invoicing</strong> · Urgency: <span className="text-amber-700 font-bold">P2 High</span> · Assigned: <strong>Elena Rostova</strong>
                </div>
              </div>
              <span className="text-[11px] font-medium text-amber-800 bg-amber-100 px-2.5 py-1 rounded">
                Payment Freeze Staged
              </span>
            </div>

            {/* Row 3: Active P1 Critical (35m left) */}
            <div className="p-3.5 bg-white rounded-lg border border-slate-200 flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold px-2 py-0.2 rounded border bg-amber-100 text-amber-900 border-amber-300 animate-pulse">
                    35m left
                  </span>
                  <span className="font-bold text-slate-900">Apex Global Logistics ($240k ARR)</span>
                  <span className="text-slate-400">·</span>
                  <span className="text-slate-500">David Chen</span>
                </div>
                <div className="text-slate-700 font-medium">
                  URGENT: European webhook endpoint throwing 504 timeouts on dispatch queue
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Category: <strong>Technical Incident</strong> · Urgency: <span className="text-red-700 font-bold">P1 Critical</span> · Grounded in: <strong>KB-INCIDENT-§7.1</strong>
                </div>
              </div>
              <span className="text-[11px] font-medium text-blue-700 bg-blue-50 px-2.5 py-1 rounded">
                Draft Ready (96% Conf)
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Sample Grounded Draft Specimen */}
      {activeTab === 'draft_specimen' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-600" />
                <span>Sample Grounded Draft Specimen (Citations & Verification)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Demonstrates how Gemini synthesizes responses referencing specific knowledge base clauses.
              </p>
            </div>
            <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
              Confidence Score: 98%
            </span>
          </div>

          <div className="p-3.5 bg-blue-50/50 rounded-lg border border-blue-200 text-xs">
            <div className="font-semibold text-blue-900 mb-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Grounded Knowledge Footnotes</span>
            </div>
            <div className="space-y-1 text-[11px] text-slate-700">
              <div>• <strong>[KB-INCIDENT-§7.1]:</strong> Webhook Retries & European Cluster Runbook (72h exponential backoff guarantee)</div>
              <div>• <strong>[KB-SLA-§1.1]:</strong> Enterprise SLA Platinum Matrix (60-minute engineer acknowledgment)</div>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs font-sans leading-relaxed text-slate-800 whitespace-pre-wrap">
{`Hi David,

Thank you for reaching out, and we recognize the critical nature of this dispatch disruption for Apex Logistics.

Our core infrastructure on-call team is already investigating the elevated 504 gateway timeout rates on the EU-West webhook cluster. 

To address your immediate concern regarding event safety: under our webhook delivery architecture (referenced in Runbook KB-INCIDENT-§7.1), all unacknowledged dispatch notifications are preserved in our durable Kafka buffer and will automatically retry with exponential backoff for up to 72 hours. No shipment event payloads are being dropped.

Temporary Mitigation:
If you need immediate relief while the European cluster pod scaling finishes, you can toggle our Redundant Failover Gateway in your Apex dashboard (Settings -> Webhooks -> Redundant Failover Gateway) to route incoming payloads across our Frankfurt backup instance.

We will provide our next operational status update within 30 minutes, or as soon as latency metrics stabilize below 80ms.

Sincerely,
Sarah Jenkins
Enterprise Solutions & Support Engineering`}
          </div>
        </div>
      )}

      {/* Tab 4: Workflow Blueprint */}
      {activeTab === 'workflow_blueprint' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-600" />
                <span>Full n8n / Serverless Workflow Blueprint</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Modular architecture connecting Gmail/Outlook API, Guardrails, Gemini Flash, and Slack/Teams dispatch.
              </p>
            </div>
            <span className="text-xs text-slate-500 font-mono">Production Pipeline</span>
          </div>

          <div className="p-4 bg-slate-900 text-emerald-300 font-mono text-xs rounded-lg overflow-x-auto leading-relaxed">
{`[Gmail Inbound Webhook] ──► (1. DKIM/SPF Security & Domain Parser)
                                    │
                                    ▼
                          [2. Confidentiality Filter]
                                    │
                ┌───────────────────┴───────────────────┐
                ▼ (If Matched NDA)                      ▼ (Standard Accounts)
    [Bypass External AI]                    [3. Vector DB & CRM Enrichment]
    [Direct Human Escalation]               (Fetch ARR, Contract SLA, Runbooks)
                                                        │
                                                        ▼
                                            [4. Gemini Flash Multi-Factor Triage]
                                            (Category, Urgency P1-P4, SLA Countdown)
                                                        │
                                                        ▼
                                            [5. Grounded Draft Synthesizer]
                                            (Footnotes citations: KB-BILLING, KB-INCIDENT)
                                                        │
                                                        ▼
                                            [6. Human Sign-Off Gate]
                                            (Open in Gmail/Outlook or Slack Alert)
                                            * ZERO AUTONOMOUS SENDS *`}
          </div>
        </div>
      )}
    </div>
  );
};
