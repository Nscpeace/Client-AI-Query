import React, { useState } from 'react';
import { 
  Check, 
  Copy, 
  ExternalLink, 
  Sparkles, 
  ShieldAlert, 
  BookOpen, 
  Clock, 
  Building, 
  User, 
  RotateCcw,
  CheckCircle2,
  Lock,
  ChevronDown,
  Download,
  MessageSquare,
  Mail,
  AlertTriangle,
  Share2
} from 'lucide-react';
import { ClientQuery, ClientRecord, DraftTone, KnowledgeArticle } from '../types/inbox';
import { formatSlaStatus } from '../utils/sla';
import { SlackTeamsModal } from './SlackTeamsModal';

interface QueryDetailProps {
  query: ClientQuery;
  client?: ClientRecord;
  knowledgeBase: KnowledgeArticle[];
  onUpdateDraft: (queryId: string, updatedDraft: string, isApproved: boolean) => void;
  onReassign: (queryId: string, newAssignee: string, newRole: string) => void;
  onRetriage: (queryId: string) => void;
  isRetriaging: boolean;
}

export const QueryDetail: React.FC<QueryDetailProps> = ({
  query,
  client,
  knowledgeBase,
  onUpdateDraft,
  onReassign,
  onRetriage,
  isRetriaging,
}) => {
  const [draftText, setDraftText] = useState(query.draftReply?.body || '');
  const [activeTone, setActiveTone] = useState<DraftTone>(query.draftReply?.tone || 'technical');
  const [isChangingTone, setIsChangingTone] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedHeaders, setCopiedHeaders] = useState(false);
  const [selectedCitation, setSelectedCitation] = useState<string | null>(null);
  const [isSavedToGmail, setIsSavedToGmail] = useState(query.draftReply?.isSavedToGmailDrafts || false);
  const [isApproved, setIsApproved] = useState(query.draftReply?.isApproved || false);
  const [isSlackModalOpen, setIsSlackModalOpen] = useState(false);

  // Sync draftText when query changes
  React.useEffect(() => {
    setDraftText(query.draftReply?.body || '');
    setActiveTone(query.draftReply?.tone || 'technical');
    setIsApproved(query.draftReply?.isApproved || false);
    setIsSavedToGmail(query.draftReply?.isSavedToGmailDrafts || false);
  }, [query.id, query.draftReply]);

  // Tone Switcher using backend API
  const handleToneChange = async (tone: DraftTone) => {
    setActiveTone(tone);
    setIsChangingTone(true);
    try {
      const res = await fetch('/api/generate-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: query.subject,
          body: query.body,
          tone,
          clientName: query.clientCompany,
          clientTier: client?.tier,
          matchedCitations: query.draftReply?.citations || [],
          currentDraft: draftText,
        }),
      });
      const data = await res.json();
      if (data.draftBody) {
        setDraftText(data.draftBody);
        onUpdateDraft(query.id, data.draftBody, isApproved);
      }
    } catch (err) {
      console.error('Tone shift error:', err);
    } finally {
      setIsChangingTone(false);
    }
  };

  const handleCopyDraft = () => {
    navigator.clipboard.writeText(draftText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyRFCHeaders = () => {
    const subject = query.draftReply?.subject || `Re: ${query.subject}`;
    const rfcBlock = [
      `To: ${query.senderName} <${query.senderEmail}>`,
      `Subject: ${subject}`,
      `Date: ${new Date().toUTCString()}`,
      `In-Reply-To: <${query.id}@clientpulse.io>`,
      `Content-Type: text/plain; charset=UTF-8`,
      '',
      draftText,
    ].join('\n');

    navigator.clipboard.writeText(rfcBlock);
    setCopiedHeaders(true);
    setTimeout(() => setCopiedHeaders(false), 2000);
  };

  const handleApprove = () => {
    const nextApproved = !isApproved;
    setIsApproved(nextApproved);
    onUpdateDraft(query.id, draftText, nextApproved);
  };

  const handleOpenInGmail = () => {
    const to = encodeURIComponent(query.senderEmail);
    const subject = encodeURIComponent(query.draftReply?.subject || `Re: ${query.subject}`);
    const body = encodeURIComponent(draftText);
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${to}&su=${subject}&body=${body}`;
    window.open(gmailUrl, '_blank', 'noopener,noreferrer');
    setIsSavedToGmail(true);
  };

  const handleOpenInOutlook = () => {
    const to = encodeURIComponent(query.senderEmail);
    const subject = encodeURIComponent(query.draftReply?.subject || `Re: ${query.subject}`);
    const body = encodeURIComponent(draftText);
    const outlookUrl = `https://outlook.office.com/mail/deeplink/compose?to=${to}&subject=${subject}&body=${body}`;
    window.open(outlookUrl, '_blank', 'noopener,noreferrer');
  };

  const handleDownloadEml = () => {
    const subject = query.draftReply?.subject || `Re: ${query.subject}`;
    const emlContent = [
      'X-Unsent: 1',
      `To: ${query.senderName} <${query.senderEmail}>`,
      `Subject: ${subject}`,
      'Content-Type: text/plain; charset=UTF-8',
      `Date: ${new Date().toUTCString()}`,
      `In-Reply-To: <${query.id}@clientpulse.io>`,
      '',
      draftText,
    ].join('\r\n');

    const blob = new Blob([emlContent], { type: 'message/rfc822' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Draft_${query.clientCompany.replace(/\s+/g, '_')}_${query.id}.eml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const sla = formatSlaStatus(query.slaDeadline);

  return (
    <div className="flex-1 flex flex-col h-full bg-white overflow-hidden">
      {/* Header Bar */}
      <div className="p-4 border-b border-slate-200 bg-white flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded">
              {query.category}
            </span>
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded border tabular-nums ${sla.severityClass}`}>
              <Clock className="w-3 h-3 inline mr-1 -mt-0.5" />
              {sla.text}
            </span>
            {query.isConfidential && (
              <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded flex items-center gap-1">
                <ShieldAlert className="w-3 h-3 text-amber-600" />
                Confidential Client Policy
              </span>
            )}
          </div>
          <h2 className="text-sm font-semibold text-slate-900 truncate">
            {query.subject}
          </h2>
        </div>

        {/* Reassign, Slack/Teams Alert & Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Slack / Teams Alert Button */}
          <button
            onClick={() => setIsSlackModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded border border-slate-200 transition-colors cursor-pointer"
            title="Dispatch alert to Slack or Microsoft Teams channel"
          >
            <MessageSquare className="w-3.5 h-3.5 text-[#4A154B]" />
            <span>Alert Slack / Teams</span>
          </button>

          <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded px-2.5 py-1">
            <User className="w-3.5 h-3.5 text-slate-400" />
            <span>Assigned:</span>
            <select
              value={query.assignedTo}
              onChange={(e) => onReassign(query.id, e.target.value, query.assignedRole)}
              className="bg-transparent font-medium text-slate-900 focus:outline-none cursor-pointer"
            >
              <option value="Sarah Jenkins">Sarah Jenkins (Solutions Lead)</option>
              <option value="Elena Rostova">Elena Rostova (Operations Lead)</option>
              <option value="Marcus Vance">Marcus Vance (FinTech Director)</option>
              <option value="Executive On-Call">Executive On-Call</option>
            </select>
          </div>

          <button
            onClick={() => onRetriage(query.id)}
            disabled={isRetriaging}
            title="Re-run Gemini AI Triage on this thread"
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isRetriaging ? 'animate-spin text-blue-600' : 'text-slate-400'}`} />
            <span>{isRetriaging ? 'Triaging...' : 'Re-triage'}</span>
          </button>
        </div>
      </div>

      {/* Main Split View */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* Left Column: Email Thread & Client Card (5 cols) */}
        <div className="lg:col-span-5 p-4 border-r border-slate-200 overflow-y-auto space-y-4 bg-slate-50/50">
          {/* Overdue Warning Callout (if overdue) */}
          {sla.isOverdue && (
            <div className={`p-3 rounded-lg border text-xs ${
              sla.daysOverdue >= 7 
                ? 'bg-red-50 border-red-300 text-red-900' 
                : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}>
              <div className="flex items-center justify-between mb-1 font-bold">
                <span className="flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <span>SLA Breached ({sla.text})</span>
                </span>
                <button
                  onClick={() => setIsSlackModalOpen(true)}
                  className="text-[11px] underline font-semibold text-red-700 hover:text-red-900 cursor-pointer"
                >
                  Escalate Now
                </button>
              </div>
              <p className="text-[11px] leading-relaxed opacity-90">
                This query has exceeded the client's {client?.slaResponseHours || 1}h contractual SLA deadline. Grounded draft is prepared below for immediate review.
              </p>
            </div>
          )}

          {/* Client Profile Card */}
          <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded bg-blue-50 border border-blue-200 flex items-center justify-center font-bold text-xs text-blue-700">
                  <Building className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-900">{query.clientCompany}</div>
                  <div className="text-[11px] text-slate-500">{query.senderEmail}</div>
                </div>
              </div>
              <span className="text-[10px] font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
                {client?.tier || 'Enterprise'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-[11px]">
              <div>
                <span className="text-slate-400 block">Annual ARR:</span>
                <span className="font-semibold text-slate-800">{client?.annualValue || '$180,000/yr'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Contract SLA:</span>
                <span className="font-semibold text-slate-800">{client?.slaResponseHours || 1} Hour Target</span>
              </div>
              <div>
                <span className="text-slate-400 block">Dedicated CSM:</span>
                <span className="font-semibold text-slate-800">{client?.assignedCSM || 'Sarah Jenkins'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Renewal:</span>
                <span className="font-semibold text-slate-800">{client?.renewalDate || 'Nov 2026'}</span>
              </div>
            </div>

            {client?.notes && (
              <div className="mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500 italic">
                "{client.notes}"
              </div>
            )}
          </div>

          {/* Original Inbound Email */}
          <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-xs text-slate-700">
                  {query.senderName.charAt(0)}
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-900">{query.senderName}</div>
                  <div className="text-[11px] text-slate-500">{query.senderEmail}</div>
                </div>
              </div>
              <span className="text-[10px] text-slate-400 tabular-nums">
                {new Date(query.receivedAt).toLocaleString()}
              </span>
            </div>

            <div className="text-xs text-slate-800 font-normal leading-relaxed whitespace-pre-wrap font-sans">
              {query.body}
            </div>
          </div>

          {/* Routing History Audit Trail */}
          <div className="bg-white rounded-lg border border-slate-200 p-3 shadow-xs">
            <div className="text-xs font-semibold text-slate-900 mb-2 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Automated Audit Trail</span>
            </div>
            <div className="space-y-2 text-[11px]">
              {query.routingHistory.map((step, idx) => (
                <div key={idx} className="flex items-start gap-2 text-slate-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1 shrink-0"></span>
                  <div className="min-w-0">
                    <span className="font-semibold text-slate-800">{step.action}</span>
                    <span className="text-slate-400"> by {step.actor}</span>
                    <div className="text-slate-500">{step.note}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: AI Triage & Grounded Draft Workspace (7 cols) */}
        <div className="lg:col-span-7 flex flex-col h-full bg-white overflow-y-auto p-4 space-y-4">
          {/* AI Triage Card */}
          <div className="bg-blue-50/50 border border-blue-200/80 rounded-lg p-3.5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-900">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>AI Triage Analysis & Reasoning</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-blue-700">
                  Sentiment: <strong>{query.sentiment}</strong>
                </span>
                <span className="text-slate-300">·</span>
                <span className="text-[11px] text-blue-700">
                  Confidence: <strong>{query.draftReply?.confidenceScore || 95}%</strong>
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              {query.aiReasoning || 'Assessed urgency and matched runbook procedures based on customer contract.'}
            </p>
          </div>

          {/* Grounded Source Citations */}
          {query.draftReply?.citations && query.draftReply.citations.length > 0 && (
            <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/60">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                  <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                  <span>Grounded Knowledge Base Citations</span>
                </div>
                <span className="text-[10px] text-slate-500">
                  {query.draftReply.citations.length} verified references
                </span>
              </div>

              <div className="space-y-1.5">
                {query.draftReply.citations.map((c, i) => (
                  <div
                    key={i}
                    onClick={() => setSelectedCitation(selectedCitation === c.sectionCode ? null : c.sectionCode)}
                    className="p-2 bg-white rounded border border-slate-200 text-xs hover:border-blue-300 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-blue-700">{c.sectionCode}: {c.title}</div>
                      <span className="text-[10px] text-slate-400 tabular-nums">Match {c.confidence}%</span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-1 line-clamp-2 italic">
                      "{c.relevantExcerpt}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Draft Reply Workspace */}
          <div className="flex-1 flex flex-col min-h-[300px] border border-slate-200 rounded-lg bg-white overflow-hidden shadow-xs">
            {/* Tone Selector & Bar */}
            <div className="p-2.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1 text-xs">
                <span className="font-medium text-slate-600 mr-1">Tone:</span>
                {(['technical', 'empathetic', 'concise', 'executive'] as DraftTone[]).map((tone) => (
                  <button
                    key={tone}
                    onClick={() => handleToneChange(tone)}
                    disabled={isChangingTone}
                    className={`px-2 py-0.5 capitalize text-[11px] font-medium rounded transition-colors cursor-pointer ${
                      activeTone === tone
                        ? 'bg-blue-600 text-white font-semibold'
                        : 'bg-white text-slate-700 hover:bg-slate-200/70 border border-slate-200'
                    }`}
                  >
                    {tone}
                  </button>
                ))}
                {isChangingTone && (
                  <span className="text-[10px] text-blue-600 animate-pulse ml-1">
                    Adjusting tone...
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleCopyDraft}
                  className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded hover:bg-slate-50 transition-colors cursor-pointer"
                  title="Copy message body only"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                  <span>{copied ? 'Copied Body' : 'Copy Body'}</span>
                </button>

                <button
                  onClick={handleCopyRFCHeaders}
                  className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded hover:bg-slate-50 transition-colors cursor-pointer"
                  title="Copy full RFC email headers (To, Subject, In-Reply-To)"
                >
                  {copiedHeaders ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Mail className="w-3.5 h-3.5 text-slate-400" />}
                  <span>{copiedHeaders ? 'Copied Full RFC' : 'Copy Email + Headers'}</span>
                </button>

                <button
                  onClick={handleDownloadEml}
                  className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded hover:bg-slate-50 transition-colors cursor-pointer"
                  title="Download editable .eml draft file for Outlook or Apple Mail"
                >
                  <Download className="w-3.5 h-3.5 text-slate-400" />
                  <span>Download .eml</span>
                </button>
              </div>
            </div>

            {/* Editable Draft Textarea */}
            <div className="flex-1 p-3">
              <textarea
                value={draftText}
                onChange={(e) => {
                  setDraftText(e.target.value);
                  onUpdateDraft(query.id, e.target.value, isApproved);
                }}
                placeholder="Draft reply content..."
                className="w-full h-full min-h-[220px] resize-none text-xs font-sans text-slate-800 leading-relaxed focus:outline-none placeholder-slate-400"
              />
            </div>

            {/* Safeguard Notice */}
            <div className="p-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-600">
              <div className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
                <span>
                  <strong>Safe Guardrail:</strong> Draft is staged for human review. Never auto-sent.
                </span>
              </div>
              <span className="text-slate-400 tabular-nums">
                {draftText.split(/\s+/).filter(Boolean).length} words
              </span>
            </div>
          </div>

          {/* Action Row: Gmail Web, Outlook Web, and Approve Button */}
          <div className="flex items-center justify-between gap-3 pt-1 flex-wrap">
            <div className="flex items-center gap-2">
              <button
                onClick={handleOpenInGmail}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-md transition-colors cursor-pointer shadow-2xs"
                title="Open directly in Gmail Web Draft Compose"
              >
                <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                <span>{isSavedToGmail ? 'Saved in Gmail' : 'Open in Gmail Web'}</span>
              </button>

              <button
                onClick={handleOpenInOutlook}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-md transition-colors cursor-pointer shadow-2xs"
                title="Open directly in Microsoft Outlook Web Draft Compose"
              >
                <ExternalLink className="w-3.5 h-3.5 text-[#0078D4]" />
                <span>Open in Outlook Web</span>
              </button>
            </div>

            <button
              onClick={handleApprove}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-md shadow-xs transition-colors cursor-pointer ${
                isApproved
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-blue-600 hover:bg-blue-500 text-white'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isApproved ? 'Approved & Ready for Dispatch' : 'Approve Draft Reply'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Slack & Microsoft Teams Dispatcher Modal */}
      <SlackTeamsModal
        isOpen={isSlackModalOpen}
        onClose={() => setIsSlackModalOpen(false)}
        query={query}
        onDispatchSuccess={(ch, lead) => {
          onUpdateDraft(query.id, draftText, isApproved);
        }}
      />
    </div>
  );
};
