import React from 'react';
import { Search, AlertTriangle, ShieldCheck, Mail, Sparkles } from 'lucide-react';
import { ActiveTab } from './Sidebar';

interface HeaderProps {
  activeTab: ActiveTab;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  p1UrgentCount: number;
  confidentialCount: number;
  overdueCount?: number;
  onOpenNewEmail: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  searchQuery,
  setSearchQuery,
  p1UrgentCount,
  confidentialCount,
  overdueCount = 0,
  onOpenNewEmail,
}) => {
  const tabTitles: Record<ActiveTab, { title: string; subtitle: string }> = {
    inbox: {
      title: 'Shared Support Inbox',
      subtitle: 'Triage Queue, SLA Deadlines & Draft Approvals',
    },
    digest: {
      title: 'Executive Daily Summary',
      subtitle: 'SLA Breach Risk, Open Queries & Response Velocity',
    },
    workflow: {
      title: 'n8n Automation Architecture',
      subtitle: 'End-to-End Visual Pipeline & Node Runtime Traces',
    },
    knowledge: {
      title: 'Knowledge Base & Runbooks',
      subtitle: 'Standard Operating Procedures & Cited Policy Clauses',
    },
    confidentiality: {
      title: 'Confidentiality Shield',
      subtitle: 'Domain Exclusions, Regulated Accounts & PII Safeguards',
    },
    portfolio: {
      title: 'Upwork Portfolio Asset',
      subtitle: 'Before & After Metrics, Case Study & Client ROI',
    },
  };

  const current = tabTitles[activeTab];

  return (
    <header className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between gap-6 shrink-0 z-10">
      {/* Breadcrumb / Title */}
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-xs font-medium text-slate-600 hidden sm:inline">
          Workspace
        </span>
        <span className="text-slate-400 hidden sm:inline">/</span>
        <h1 className="text-sm font-semibold text-slate-900 truncate">
          {current.title}
        </h1>
        <span className="text-xs text-slate-500 hidden md:inline truncate ml-1">
          · {current.subtitle}
        </span>
      </div>

      {/* Middle & Right Controls */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Search Input */}
        {activeTab === 'inbox' && (
          <div className="relative w-48 sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search clients, subjects, keywords..."
              className="w-full text-xs pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 placeholder-slate-400"
            />
          </div>
        )}

        {/* Live Counters */}
        {overdueCount > 0 && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-red-100 border border-red-300 rounded-md text-[11px] font-bold text-red-900 tabular-nums">
            <span className="w-2 h-2 rounded-full bg-red-600"></span>
            <span>{overdueCount} Overdue (2w, 8d…)</span>
          </div>
        )}

        {p1UrgentCount > 0 && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-red-50 border border-red-200 rounded-md text-[11px] font-semibold text-red-700 tabular-nums hidden sm:flex">
            <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0" />
            <span>{p1UrgentCount} P1 Critical</span>
          </div>
        )}

        {confidentialCount > 0 && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-md text-[11px] font-medium text-amber-800 tabular-nums hidden lg:flex">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>{confidentialCount} Confidential Protected</span>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={onOpenNewEmail}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md shadow-xs transition-colors cursor-pointer whitespace-nowrap shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          <span>Ingest Query</span>
        </button>
      </div>
    </header>
  );
};
