import React from 'react';
import { Search, AlertTriangle, ShieldCheck, Mail, Sparkles, Clock } from 'lucide-react';
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
      subtitle: 'Triage Queue, SLA Deadlines & Staged Drafts',
    },
    digest: {
      title: 'Executive Daily Summary',
      subtitle: 'SLA Breach Risk, Open Queries & Response Velocity',
    },
    workflow: {
      title: 'Automation Canvas (n8n)',
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
    <header className="h-14 bg-white border-b border-slate-200 px-5 flex items-center justify-between gap-4 shrink-0 z-10">
      {/* Breadcrumb / Title */}
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-xs font-medium text-slate-500 hidden sm:inline">
          ClientPulse
        </span>
        <span className="text-slate-300 hidden sm:inline">/</span>
        <h1 className="text-sm font-semibold text-slate-900 truncate">
          {current.title}
        </h1>
        <span className="text-xs text-slate-400 hidden lg:inline truncate ml-1">
          · {current.subtitle}
        </span>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Search Input (only shown in inbox tab) */}
        {activeTab === 'inbox' && (
          <div className="relative w-44 sm:w-60">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter queries, clients..."
              className="w-full text-xs pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 placeholder-slate-400 transition-colors"
            />
          </div>
        )}

        {/* Quiet Live Indicators */}
        <div className="hidden md:flex items-center gap-3 text-xs text-slate-600 pl-2 border-l border-slate-200">
          {overdueCount > 0 && (
            <div className="flex items-center gap-1.5 font-medium text-red-700 tabular-nums">
              <span className="w-2 h-2 rounded-full bg-red-600"></span>
              <span>{overdueCount} Overdue</span>
            </div>
          )}

          {p1UrgentCount > 0 && (
            <div className="flex items-center gap-1.5 font-medium text-amber-800 tabular-nums">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span>{p1UrgentCount} P1</span>
            </div>
          )}
        </div>

        {/* Primary Action Button */}
        <button
          onClick={onOpenNewEmail}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md shadow-xs transition-colors cursor-pointer whitespace-nowrap shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          <span>Simulate Query</span>
        </button>
      </div>
    </header>
  );
};
