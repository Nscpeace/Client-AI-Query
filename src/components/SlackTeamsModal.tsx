import React, { useState } from 'react';
import { 
  X, 
  Send, 
  Check, 
  Copy, 
  AlertTriangle, 
  MessageSquare, 
  Clock, 
  User, 
  Building,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { ClientQuery } from '../types/inbox';
import { formatSlaStatus } from '../utils/sla';

interface SlackTeamsModalProps {
  isOpen: boolean;
  onClose: () => void;
  query: ClientQuery;
  onDispatchSuccess?: (channel: string, targetLead: string) => void;
}

export const SlackTeamsModal: React.FC<SlackTeamsModalProps> = ({
  isOpen,
  onClose,
  query,
  onDispatchSuccess,
}) => {
  const [platform, setPlatform] = useState<'slack' | 'teams'>('slack');
  const [channel, setChannel] = useState('#support-p1-escalations');
  const [targetLead, setTargetLead] = useState(query.assignedTo);
  const [priorityNote, setPriorityNote] = useState(
    query.urgency === 'P1 Critical' 
      ? 'Critical P1 production incident — requires immediate engineer acknowledgment.'
      : 'Ticket is overdue. Please review staged draft reply.'
  );
  const [isDispatching, setIsDispatching] = useState(false);
  const [dispatched, setDispatched] = useState(false);
  const [copiedPayload, setCopiedPayload] = useState(false);

  if (!isOpen) return null;

  const sla = formatSlaStatus(query.slaDeadline);

  // Generate payload
  const slackPayload = {
    channel,
    text: `🚨 *[${query.urgency}] ${query.clientCompany}*: ${query.subject}`,
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `🚨 Urgent Support Query Escaped: ${query.urgency}`,
          emoji: true,
        },
      },
      {
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: `*Client:* ${query.clientCompany}` },
          { type: 'mrkdwn', text: `*SLA Status:* ${sla.text}` },
          { type: 'mrkdwn', text: `*Assigned Lead:* <@${targetLead}>` },
          { type: 'mrkdwn', text: `*Category:* ${query.category}` },
        ],
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Subject:* ${query.subject}\n*Snippet:* "${query.snippet}"\n\n*Internal Lead Note:* ${priorityNote}`,
        },
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: { type: 'plain_text', text: 'Review Grounded Draft in ClientPulse' },
            style: 'primary',
            url: `https://app.clientpulse.io/inbox/${query.id}`,
          },
        ],
      },
    ],
  };

  const teamsCardPayload = {
    type: 'message',
    attachments: [
      {
        contentType: 'application/vnd.microsoft.card.adaptive',
        content: {
          $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
          type: 'AdaptiveCard',
          version: '1.4',
          body: [
            {
              type: 'TextBlock',
              size: 'Medium',
              weight: 'Bolder',
              color: query.urgency.includes('P1') ? 'Attention' : 'Warning',
              text: `🚨 [${query.urgency}] Query Escalation: ${query.clientCompany}`,
            },
            {
              type: 'FactSet',
              facts: [
                { title: 'SLA Timing:', value: sla.text },
                { title: 'Recipient Lead:', value: targetLead },
                { title: 'Category:', value: query.category },
                { title: 'Sender:', value: query.senderEmail },
              ],
            },
            {
              type: 'TextBlock',
              text: `Subject: ${query.subject}`,
              wrap: true,
              weight: 'Bolder',
            },
            {
              type: 'TextBlock',
              text: query.snippet,
              wrap: true,
              isSubtle: true,
            },
            {
              type: 'TextBlock',
              text: `Internal Lead Note: ${priorityNote}`,
              wrap: true,
              color: 'Attention',
            },
          ],
          actions: [
            {
              type: 'Action.OpenUrl',
              title: 'Open Draft in ClientPulse AI',
              url: `https://app.clientpulse.io/inbox/${query.id}`,
            },
          ],
        },
      },
    ],
  };

  const activePayload = platform === 'slack' ? slackPayload : teamsCardPayload;

  const handleDispatch = async () => {
    setIsDispatching(true);
    // Simulate real webhook transmission latency
    await new Promise((r) => setTimeout(r, 650));
    setIsDispatching(false);
    setDispatched(true);
    if (onDispatchSuccess) {
      onDispatchSuccess(channel, targetLead);
    }
    setTimeout(() => {
      setDispatched(false);
      onClose();
    }, 1500);
  };

  const handleCopyPayload = () => {
    navigator.clipboard.writeText(JSON.stringify(activePayload, null, 2));
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded flex items-center justify-center font-bold text-xs text-white ${
              platform === 'slack' ? 'bg-[#4A154B]' : 'bg-[#464EB8]'
            }`}>
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Dispatch Alert to {platform === 'slack' ? 'Slack' : 'Microsoft Teams'}
              </h3>
              <p className="text-[11px] text-slate-500">
                Route urgent queries and notify the designated team lead in real time.
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Platform Tabs */}
        <div className="p-3 bg-white border-b border-slate-100 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 p-0.5 bg-slate-100 rounded-md">
            <button
              onClick={() => {
                setPlatform('slack');
                setChannel('#support-p1-escalations');
              }}
              className={`px-3 py-1 text-xs font-semibold rounded transition-colors cursor-pointer ${
                platform === 'slack' ? 'bg-[#4A154B] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Slack Channel
            </button>
            <button
              onClick={() => {
                setPlatform('teams');
                setChannel('Client Escalations (Channel)');
              }}
              className={`px-3 py-1 text-xs font-semibold rounded transition-colors cursor-pointer ${
                platform === 'teams' ? 'bg-[#464EB8] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Microsoft Teams
            </button>
          </div>

          <span className={`text-[11px] font-bold px-2 py-0.5 rounded border tabular-nums ${sla.severityClass}`}>
            <Clock className="w-3 h-3 inline mr-1 -mt-0.5" />
            {sla.text}
          </span>
        </div>

        {/* Content Form */}
        <div className="p-4 space-y-3.5 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-600 font-medium block mb-1">Target Channel / Webhook</label>
              <input
                type="text"
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
                className="w-full p-2 border border-slate-200 rounded-md text-slate-800 font-mono text-[11px] focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="text-slate-600 font-medium block mb-1">Tag Designated Specialist</label>
              <select
                value={targetLead}
                onChange={(e) => setTargetLead(e.target.value)}
                className="w-full p-2 border border-slate-200 rounded-md text-slate-800 font-medium text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="Sarah Jenkins">Sarah Jenkins (Solutions Lead)</option>
                <option value="Elena Rostova">Elena Rostova (Operations Lead)</option>
                <option value="Marcus Vance">Marcus Vance (FinTech Lead)</option>
                <option value="Executive On-Call">Executive On-Call Lead</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-slate-600 font-medium block mb-1">Urgency Context / Reason</label>
            <input
              type="text"
              value={priorityNote}
              onChange={(e) => setPriorityNote(e.target.value)}
              className="w-full p-2 border border-slate-200 rounded-md text-slate-800 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Interactive Live Message Card Preview */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Live Card Preview
              </span>
              <button
                type="button"
                onClick={handleCopyPayload}
                className="text-[11px] text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
              >
                {copiedPayload ? 'Copied JSON' : 'Copy JSON Webhook Payload'}
              </button>
            </div>

            <div className={`p-3.5 rounded-lg border text-xs leading-relaxed ${
              platform === 'slack' 
                ? 'bg-slate-50 border-slate-200 font-sans' 
                : 'bg-[#F5F5F5] border-[#E1DFDD] font-sans'
            }`}>
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-2 mb-2">
                <span className="font-bold text-slate-900">
                  🚨 [{query.urgency}] Escalation Notice
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {platform === 'slack' ? '#support-p1-escalations' : 'Teams Channel'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] mb-2 font-medium">
                <div>Client: <strong className="text-slate-800">{query.clientCompany}</strong></div>
                <div>Timing: <strong className="text-red-700">{sla.text}</strong></div>
                <div>Tag: <span className="text-blue-700 bg-blue-50 px-1 py-0.2 rounded font-mono">@{targetLead}</span></div>
                <div>Category: <span className="text-slate-700">{query.category}</span></div>
              </div>

              <div className="text-[11px] text-slate-700 font-medium line-clamp-1 mb-1">
                Subject: {query.subject}
              </div>
              <div className="text-[11px] text-slate-500 italic line-clamp-2 mb-2">
                "{query.snippet}"
              </div>

              <div className="bg-white p-2 rounded border border-slate-200 text-[11px] text-amber-800 font-medium">
                ⚡ Note: {priorityNote}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Triggers webhook route via n8n integration
          </span>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 rounded-md cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleDispatch}
              disabled={isDispatching || dispatched}
              className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-md text-white transition-all cursor-pointer shadow-xs ${
                dispatched
                  ? 'bg-emerald-600'
                  : platform === 'slack'
                  ? 'bg-[#4A154B] hover:bg-[#3B113C]'
                  : 'bg-[#464EB8] hover:bg-[#3B429F]'
              }`}
            >
              {dispatched ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Dispatched to Channel!</span>
                </>
              ) : isDispatching ? (
                <span>Transmitting...</span>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Send to {platform === 'slack' ? 'Slack' : 'Teams'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
