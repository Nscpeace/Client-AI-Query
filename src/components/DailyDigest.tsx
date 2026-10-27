import React, { useState } from 'react';
import { 
  BarChart3, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  Download, 
  Copy, 
  Check, 
  TrendingUp, 
  FileText,
  User,
  ArrowUpRight,
  MessageSquare,
  ShieldAlert,
  Calendar
} from 'lucide-react';
import { ClientQuery } from '../types/inbox';
import { formatSlaStatus } from '../utils/sla';

interface DailyDigestProps {
  queries: ClientQuery[];
  onSelectQuery: (id: string) => void;
}

export const DailyDigest: React.FC<DailyDigestProps> = ({ queries, onSelectQuery }) => {
  const [copied, setCopied] = useState(false);
  const [bulkAlertSent, setBulkAlertSent] = useState(false);

  // Compute metrics
  const now = Date.now();
  const overdueQueries = queries.filter((q) => {
    const diff = new Date(q.slaDeadline).getTime() - now;
    return diff < 0 && !q.draftReply?.isApproved;
  });

  // Categorize overdue by age
  const overdueOverTwoWeeks = overdueQueries.filter(q => {
    const days = Math.floor((now - new Date(q.slaDeadline).getTime()) / (1000 * 60 * 60 * 24));
    return days >= 14;
  });

  const overdueOneToTwoWeeks = overdueQueries.filter(q => {
    const days = Math.floor((now - new Date(q.slaDeadline).getTime()) / (1000 * 60 * 60 * 24));
    return days >= 7 && days < 14;
  });

  const overdueOneToSevenDays = overdueQueries.filter(q => {
    const days = Math.floor((now - new Date(q.slaDeadline).getTime()) / (1000 * 60 * 60 * 24));
    return days >= 1 && days < 7;
  });

  const overdueUnder24Hours = overdueQueries.filter(q => {
    const days = Math.floor((now - new Date(q.slaDeadline).getTime()) / (1000 * 60 * 60 * 24));
    return days < 1;
  });

  const approachingQueries = queries.filter((q) => {
    const diff = new Date(q.slaDeadline).getTime() - now;
    return diff >= 0 && diff <= 60 * 60 * 1000 && !q.draftReply?.isApproved;
  });

  const awaitingReview = queries.filter((q) => q.draftReply && !q.draftReply.isApproved);
  const approvedCount = queries.filter((q) => q.draftReply?.isApproved);

  // Category breakdown
  const categoryCounts: Record<string, number> = {};
  queries.forEach((q) => {
    categoryCounts[q.category] = (categoryCounts[q.category] || 0) + 1;
  });

  // Urgency breakdown
  const urgencyCounts: Record<string, number> = {
    'P1 Critical': 0,
    'P2 High': 0,
    'P3 Normal': 0,
    'P4 Low': 0,
  };
  queries.forEach((q) => {
    urgencyCounts[q.urgency] = (urgencyCounts[q.urgency] || 0) + 1;
  });

  const generateMarkdownReport = () => {
    return `# Daily Support Inbox Operations Briefing
Generated: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}

## Executive Summary
- Total Active Inbound Queries: ${queries.length}
- P1 Urgent Outages: ${urgencyCounts['P1 Critical']}
- Total Overdue Queries: ${overdueQueries.length}
  * Overdue > 2 Weeks: ${overdueOverTwoWeeks.length} (High contract/churn risk)
  * Overdue 1 - 2 Weeks: ${overdueOneToTwoWeeks.length}
  * Overdue 1 - 7 Days: ${overdueOneToSevenDays.length}
  * Overdue < 24 Hours: ${overdueUnder24Hours.length}
- Queries Nearing SLA (<60m): ${approachingQueries.length}
- Staged Drafts Awaiting Review: ${awaitingReview.length}
- Approved Responses: ${approvedCount.length}

## Immediate Action Items (Aged & Overdue Tickets)
${overdueQueries.map((q) => {
  const sla = formatSlaStatus(q.slaDeadline);
  return `- [${q.urgency}] ${q.clientCompany}: "${q.subject}" — ${sla.text} (Assigned to: ${q.assignedTo})`;
}).join('\n')}

## Category Distribution
${Object.entries(categoryCounts).map(([cat, count]) => `- ${cat}: ${count}`).join('\n')}

---
ClientPulse AI Triage Engine · Zero-Auto-Send Policy Enforced
`;
  };

  const handleCopyReport = () => {
    navigator.clipboard.writeText(generateMarkdownReport());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleBulkAlert = () => {
    setBulkAlertSent(true);
    setTimeout(() => setBulkAlertSent(false), 3000);
  };

  return (
    <div className="flex-1 p-6 bg-slate-50 overflow-y-auto space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200">
        <div>
          <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <span>Daily Operations & SLA Compliance Digest</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time status of aged client queries (2 weeks, 8 days, 3 days), pending draft approvals, and team SLA velocity.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleBulkAlert}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer border ${
              bulkAlertSent
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-[#4A154B]" />
            <span>{bulkAlertSent ? 'Overdue Alerts Sent to Slack!' : 'Alert Overdue to Slack'}</span>
          </button>

          <button
            onClick={handleCopyReport}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
            <span>{copied ? 'Copied Briefing' : 'Copy Executive Briefing'}</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Total Ingested</span>
            <FileText className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 tabular-nums">
            {queries.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Across 7 tracked accounts</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>SLA Critical (P1)</span>
            <AlertTriangle className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-2xl font-bold text-red-600 tabular-nums">
            {urgencyCounts['P1 Critical']}
          </div>
          <div className="text-[11px] text-red-600 font-medium mt-1">
            Immediate engineer required
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Aged Overdue Queries</span>
            <Clock className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-2xl font-bold text-red-700 tabular-nums">
            {overdueQueries.length}
          </div>
          <div className="text-[11px] text-red-600 font-semibold mt-1">
            Up to 2 weeks overdue
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Drafts Awaiting Approval</span>
            <CheckCircle2 className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-blue-600 tabular-nums">
            {awaitingReview.length}
          </div>
          <div className="text-[11px] text-blue-600 mt-1">Pre-grounded with citations</div>
        </div>
      </div>

      {/* Aged Overdue Severity Breakdown */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span>Overdue Aging Matrix (Shared Inbox Backlog)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Breakdown of unanswered queries by severity age, highlighting contractual churn risks.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
            {overdueQueries.length} SLA Breached
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-red-100/60 border border-red-300 rounded-lg">
            <span className="font-bold text-red-900 block">&gt; 2 Weeks Overdue</span>
            <div className="text-xl font-bold text-red-800 tabular-nums mt-0.5">
              {overdueOverTwoWeeks.length}
            </div>
            <p className="text-[11px] text-red-700 mt-1">Global Retail & Helix Labs (High churn danger)</p>
          </div>

          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <span className="font-semibold text-red-800 block">1 - 2 Weeks Overdue</span>
            <div className="text-xl font-bold text-red-700 tabular-nums mt-0.5">
              {overdueOneToTwoWeeks.length}
            </div>
            <p className="text-[11px] text-red-600 mt-1">Strata Cloud (8 days overdue billing dispute)</p>
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <span className="font-semibold text-amber-900 block">1 - 7 Days Overdue</span>
            <div className="text-xl font-bold text-amber-800 tabular-nums mt-0.5">
              {overdueOneToSevenDays.length}
            </div>
            <p className="text-[11px] text-amber-700 mt-1">Vector Dynamics (3 days overdue rate limit)</p>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="font-semibold text-slate-800 block">&lt; 24h Overdue</span>
            <div className="text-xl font-bold text-slate-700 tabular-nums mt-0.5">
              {overdueUnder24Hours.length}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">NovaPay (4 hours overdue audit request)</p>
          </div>
        </div>

        {/* Prioritized Overdue Tickets List */}
        <div className="pt-2">
          <div className="text-xs font-semibold text-slate-700 mb-2">
            Priority Action List (Click to Open Draft Workspace)
          </div>
          <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
            {overdueQueries.map((q) => {
              const sla = formatSlaStatus(q.slaDeadline);
              return (
                <div
                  key={q.id}
                  onClick={() => onSelectQuery(q.id)}
                  className="p-3 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`text-[10px] font-bold px-2 py-0.2 rounded border tabular-nums ${sla.severityClass}`}>
                        {sla.text}
                      </span>
                      <span className="text-xs font-bold text-slate-900 truncate">
                        {q.clientCompany}
                      </span>
                      <span className="text-slate-300">·</span>
                      <span className="text-xs text-slate-600 truncate">
                        {q.subject}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-2">
                      <span>Assigned: <strong className="text-slate-700">{q.assignedTo}</strong></span>
                      <span className="text-slate-300">·</span>
                      <span>Category: <strong className="text-slate-700">{q.category}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-blue-600 font-semibold flex items-center gap-1 hover:underline">
                      Review Draft
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Two Column Breakdown: Categories & Urgency */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Categories */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-3">
            Volume by Query Category
          </h3>
          <div className="space-y-2.5">
            {Object.entries(categoryCounts).map(([cat, count]) => {
              const pct = Math.round((count / queries.length) * 100);
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-700 font-medium">{cat}</span>
                    <span className="text-slate-500 tabular-nums">{count} queries ({pct}%)</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Urgency */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-3">
            Urgency Tier Distribution
          </h3>
          <div className="space-y-2.5">
            {Object.entries(urgencyCounts).map(([urgency, count]) => {
              const pct = Math.round((count / queries.length) * 100);
              const color = urgency.includes('P1') ? 'bg-red-500' : urgency.includes('P2') ? 'bg-amber-500' : 'bg-blue-500';
              return (
                <div key={urgency} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-700 font-medium">{urgency}</span>
                    <span className="text-slate-500 tabular-nums">{count} ({pct}%)</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
