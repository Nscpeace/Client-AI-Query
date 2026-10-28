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
  Download,
  MessageSquare,
  Mail,
  AlertTriangle,
  History,
  FileText
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
  const [leftContextTab, setLeftContextTab] = useState<'client' | 'history'>('client');

  // Sync state when query changes
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
    <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-hidden">
      {/* Top Header Bar */}
      <div className="px-6 py-3.5 border-b border-slate-200 bg-white flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap text-xs">
            <span className="font-semibold text-slate-900">
              {query.clientCompany}
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-slate-500">{query.category}</span>
            <span className="text-slate-300">·</span>
            <span className={`px-2 py-0.5 rounded font-mono tabular-nums text-[11px] ${sla.severityClass}`}>
              <Clock className="w-3 h-3 inline mr-1 -mt-0.5" />
              {sla.text}
            </span>
            {query.isConfidential && (
              <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded flex items-center gap-1">
                <ShieldAlert className="w-3 h-3 text-amber-600" />
                Confidential Client
              </span>
            )}
          </div>
          <h2 className="text-base font-semibold text-slate-900 truncate">
            {query.subject}
          </h2>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Reassign Dropdown */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5">
            <User className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-500 font-medium">Assigned:</span>
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

          {/* Slack / Teams Alert Button */}
          <button
            onClick={() => setIsSlackModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 rounded-md border border-slate-200 transition-colors cursor-pointer shadow-2xs"
            title="Dispatch alert to Slack or Microsoft Teams channel"
          >
            <MessageSquare className="w-3.5 h-3.5 text-[#4A154B]" />
            <span>Escalate Alert</span>
          </button>

          {/* Re-triage Button */}
          <button
            onClick={() => onRetriage(query.id)}
            disabled={isRetriaging}
            title="Re-run Gemini AI Triage on this thread"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isRetriaging ? 'animate-spin text-blue-600' : 'text-slate-400'}`} />
            <span>{isRetriaging ? 'Triaging...' : 'Re-triage'}</span>
          </button>
        </div>
      </div>

      {/* Main Two-Column Reading & Response Studio */}
      <div className="flex-1 grid grid-cols-1 xl:grid-cols-2 gap-4 p-5 overflow-y-auto">
        
        {/* ================= LEFT COLUMN: INBOUND MESSAGE & ACCOUNT CONTEXT ================= */}
        <div className="flex flex-col gap-4">
          
          {/* Overdue Warning Callout (if overdue) */}
          {sla.isOverdue && (
            <div className={`p-3.5 rounded-xl border text-xs ${
              sla.daysOverdue >= 7 
                ? 'bg-red-50/80 border-red-300 text-red-900' 
                : 'bg-amber-50/80 border-amber-300 text-amber-900'
            }`}>
              <div className="flex items-center justify-between mb-1 font-bold">
                <span className="flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>SLA Breached ({sla.text})</span>
                </span>
                <button
                  onClick={() => setIsSlackModalOpen(true)}
                  className="text-xs font-semibold text-red-700 hover:text-red-900 underline cursor-pointer"
                >
                  Escalate to On-Call
                </button>
              </div>
              <p className="text-[11px] leading-relaxed opacity-90">
                This query has passed the {client?.slaResponseHours || 1}h contractual response window. The grounded response below is staged for immediate human sign-off.
              </p>
            </div>
          )}

          {/* Original Inbound Email Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col flex-1 min-h-[300px]">
            {/* Email Header */}
            <div className="p-4 bg-slate-50/60 border-b border-slate-200 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                {query.senderAvatar ? (
                  <img
                    src={query.senderAvatar}
                    alt={query.senderName}
                    referrerPolicy="no-referrer"
                    className="w-9 h-9 rounded-full object-cover shrink-0 border border-slate-200"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm shrink-0">
                    {query.senderName.charAt(0)}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-slate-900 truncate">
                    {query.senderName}
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono truncate">
                    {query.senderEmail}
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[11px] text-slate-500 font-mono block">
                  {new Date(query.receivedAt).toLocaleDateString()} {new Date(query.receivedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <span className="text-[10px] text-slate-400">
                  via Shared Inbox
                </span>
              </div>
            </div>

            {/* Email Body Prose */}
            <div className="p-5 flex-1 overflow-y-auto bg-white">
              <div className="text-xs sm:text-sm text-slate-800 font-sans leading-relaxed whitespace-pre-wrap select-text">
                {query.body}
              </div>
            </div>
          </div>

          {/* Bottom Accordion: Client Account & Contract vs. Audit Trail */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            {/* Tab Header */}
            <div className="px-4 py-2.5 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold">
                <button
                  onClick={() => setLeftContextTab('client')}
                  className={`px-2.5 py-1 rounded transition-colors cursor-pointer flex items-center gap-1.5 ${
                    leftContextTab === 'client'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Building className="w-3.5 h-3.5 text-blue-600" />
                  <span>Client Record & Contract</span>
                </button>
                <button
                  onClick={() => setLeftContextTab('history')}
                  className={`px-2.5 py-1 rounded transition-colors cursor-pointer flex items-center gap-1.5 ${
                    leftContextTab === 'history'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <History className="w-3.5 h-3.5 text-slate-500" />
                  <span>Audit Trail ({query.routingHistory.length})</span>
                </button>
              </div>

              <span className="text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                {client?.tier || 'Enterprise'} Tier
              </span>
            </div>

            {/* Tab Body */}
            <div className="p-4">
              {leftContextTab === 'client' ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium">Annual Value</span>
                      <span className="text-xs font-bold text-slate-900 mt-0.5 block">{client?.annualValue || '$180,000/yr'}</span>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium">SLA Target</span>
                      <span className="text-xs font-bold text-slate-900 mt-0.5 block">{client?.slaResponseHours || 1} Hour Commitment</span>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium">Dedicated CSM</span>
                      <span className="text-xs font-bold text-slate-900 mt-0.5 block">{client?.assignedCSM || 'Sarah Jenkins'}</span>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium">Renewal Date</span>
                      <span className="text-xs font-bold text-slate-900 mt-0.5 block">{client?.renewalDate || 'Nov 2026'}</span>
                    </div>
                  </div>

                  {client?.notes && (
                    <div className="text-xs text-slate-600 bg-slate-50/60 p-2.5 rounded-lg border border-slate-100 italic">
                      "{client.notes}"
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2 text-xs">
                  {query.routingHistory.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 py-1">
                      <span className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0"></span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-semibold text-slate-900">{step.action}</span>
                          <span className="text-slate-400 font-mono">{step.timestamp}</span>
                        </div>
                        <div className="text-slate-500 text-[11px] mt-0.5">
                          By <span className="font-medium text-slate-700">{step.actor}</span>: {step.note}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ================= RIGHT COLUMN: AI INTELLIGENCE & DRAFT REPLY STUDIO ================= */}
        <div className="flex flex-col gap-4">
          
          {/* AI Intelligence & Citation Grounding Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  AI Triage & Context Grounding
                </h3>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-600">
                <span>Sentiment: <strong className="text-slate-900">{query.sentiment}</strong></span>
                <span className="text-slate-300">·</span>
                <span>Confidence: <strong className="text-slate-900 font-mono">{query.draftReply?.confidenceScore || 95}%</strong></span>
              </div>
            </div>

            {/* AI Reasoning Text */}
            <p className="text-xs text-slate-700 leading-relaxed bg-blue-50/40 p-3 rounded-lg border border-blue-100">
              {query.aiReasoning || 'Assessed urgency and matched runbook procedures based on customer contract.'}
            </p>

            {/* Grounded KB Citations */}
            {query.draftReply?.citations && query.draftReply.citations.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                    <span>Knowledge Base Citations ({query.draftReply.citations.length})</span>
                  </span>
                  <span className="text-[10px] text-slate-400">Click to expand</span>
                </div>

                <div className="space-y-2">
                  {query.draftReply.citations.map((c, i) => (
                    <div
                      key={i}
                      onClick={() => setSelectedCitation(selectedCitation === c.sectionCode ? null : c.sectionCode)}
                      className="p-2.5 bg-slate-50/70 hover:bg-slate-50 rounded-lg border border-slate-200 text-xs transition-colors cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-blue-700">
                          {c.sectionCode}: {c.title}
                        </span>
                        <span className="text-[10px] font-mono font-medium text-slate-500 tabular-nums">
                          {c.confidence}% match
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-1 line-clamp-2 italic">
                        "{c.relevantExcerpt}"
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Staged Draft Reply Workspace Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col flex-1 min-h-[380px]">
            {/* Tone Selector & Copy Bar */}
            <div className="p-3 bg-slate-50/80 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2.5">
              {/* Tone Controls */}
              <div className="flex items-center gap-1.5 text-xs">
                <span className="font-semibold text-slate-600 mr-1">Tone:</span>
                {(['technical', 'empathetic', 'concise', 'executive'] as DraftTone[]).map((tone) => (
                  <button
                    key={tone}
                    onClick={() => handleToneChange(tone)}
                    disabled={isChangingTone}
                    className={`px-2.5 py-1 capitalize text-xs rounded-md transition-colors cursor-pointer ${
                      activeTone === tone
                        ? 'bg-blue-600 text-white font-semibold shadow-xs'
                        : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {tone}
                  </button>
                ))}
                {isChangingTone && (
                  <span className="text-[11px] text-blue-600 animate-pulse ml-1">
                    Regenerating...
                  </span>
                )}
              </div>

              {/* Utility Export Buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleCopyDraft}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-colors cursor-pointer"
                  title="Copy message body only"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>

                <button
                  onClick={handleCopyRFCHeaders}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-colors cursor-pointer"
                  title="Copy full RFC email headers (To, Subject, In-Reply-To)"
                >
                  {copiedHeaders ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Mail className="w-3.5 h-3.5 text-slate-400" />}
                  <span>{copiedHeaders ? 'Copied RFC' : 'RFC Headers'}</span>
                </button>

                <button
                  onClick={handleDownloadEml}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-colors cursor-pointer"
                  title="Download editable .eml draft file for Outlook or Apple Mail"
                >
                  <Download className="w-3.5 h-3.5 text-slate-400" />
                  <span>.eml file</span>
                </button>
              </div>
            </div>

            {/* Editable Draft Textarea */}
            <div className="p-4 flex-1 flex flex-col bg-white">
              <textarea
                value={draftText}
                onChange={(e) => {
                  setDraftText(e.target.value);
                  onUpdateDraft(query.id, e.target.value, isApproved);
                }}
                placeholder="Draft reply content..."
                className="w-full flex-1 min-h-[220px] resize-none text-xs sm:text-sm font-sans text-slate-900 leading-relaxed focus:outline-none placeholder-slate-400"
              />
            </div>

            {/* Safeguard & Word Count Bar */}
            <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
              <div className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-[11px]">
                  <strong>Zero-Auto-Send Policy:</strong> Human sign-off required before dispatch.
                </span>
              </div>
              <span className="text-slate-400 font-mono text-[11px] tabular-nums">
                {draftText.split(/\s+/).filter(Boolean).length} words
              </span>
            </div>

            {/* Action Row: Primary Approval + Deep Links */}
            <div className="p-3 bg-white border-t border-slate-200 flex items-center justify-between gap-2.5 flex-wrap">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleOpenInOutlook}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-md transition-colors cursor-pointer shadow-2xs"
                  title="Open directly in Microsoft Outlook Web Draft Compose"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-[#0078D4]" />
                  <span>Outlook Web</span>
                </button>

                <button
                  onClick={handleOpenInGmail}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-md transition-colors cursor-pointer shadow-2xs"
                  title="Open directly in Gmail Web Draft Compose"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-red-600" />
                  <span>{isSavedToGmail ? 'Saved to Gmail' : 'Gmail Web'}</span>
                </button>
              </div>

              {/* Primary Approval CTA */}
              <button
                onClick={handleApprove}
                className={`flex items-center gap-2 px-5 py-2 text-xs font-semibold rounded-md shadow-xs transition-colors cursor-pointer ${
                  isApproved
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-blue-600 hover:bg-blue-500 text-white'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isApproved ? 'Approved & Ready' : 'Approve Draft Reply'}</span>
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Slack & Microsoft Teams Dispatcher Modal */}
      <SlackTeamsModal
        isOpen={isSlackModalOpen}
        onClose={() => setIsSlackModalOpen(false)}
        query={query}
        onDispatchSuccess={() => {
          onUpdateDraft(query.id, draftText, isApproved);
        }}
      />
    </div>
  );
};
