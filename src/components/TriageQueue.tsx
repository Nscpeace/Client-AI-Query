import React, { useState, useMemo } from 'react';
import { 
  Clock, 
  FileCheck, 
  ShieldAlert, 
  User, 
  CheckCircle2, 
  ChevronRight,
  Filter,
  ArrowUpDown,
  AlertTriangle
} from 'lucide-react';
import { ClientQuery, QueryCategory, UrgencyLevel } from '../types/inbox';
import { formatSlaStatus } from '../utils/sla';

interface TriageQueueProps {
  queries: ClientQuery[];
  selectedQueryId: string | null;
  onSelectQuery: (queryId: string) => void;
  statusFilter: string;
  setStatusFilter: (filter: string) => void;
  categoryFilter: string;
  setCategoryFilter: (filter: string) => void;
}

export type SortOrder = 'most_overdue' | 'urgency' | 'newest' | 'oldest';

export const TriageQueue: React.FC<TriageQueueProps> = ({
  queries,
  selectedQueryId,
  onSelectQuery,
  statusFilter,
  setStatusFilter,
  categoryFilter,
  setCategoryFilter,
}) => {
  const [sortOrder, setSortOrder] = useState<SortOrder>('most_overdue');

  const now = Date.now();
  const overdueCount = queries.filter(q => new Date(q.slaDeadline).getTime() < now && !q.draftReply?.isApproved).length;

  const filterTabs = [
    { id: 'all', label: 'All', count: queries.length },
    { 
      id: 'overdue', 
      label: 'Overdue', 
      count: overdueCount,
      highlight: overdueCount > 0,
    },
    { 
      id: 'p1_urgent', 
      label: 'P1 Urgent', 
      count: queries.filter(q => q.urgency === 'P1 Critical').length 
    },
    { 
      id: 'awaiting_approval', 
      label: 'Needs Review', 
      count: queries.filter(q => q.draftReply && !q.draftReply.isApproved).length 
    },
    { 
      id: 'approved', 
      label: 'Approved', 
      count: queries.filter(q => q.draftReply?.isApproved).length 
    },
    { 
      id: 'confidential', 
      label: 'Confidential', 
      count: queries.filter(q => q.isConfidential).length 
    },
  ];

  // Sorting
  const sortedQueries = useMemo(() => {
    return [...queries].sort((a, b) => {
      const aDeadline = new Date(a.slaDeadline).getTime();
      const bDeadline = new Date(b.slaDeadline).getTime();
      const aReceived = new Date(a.receivedAt).getTime();
      const bReceived = new Date(b.receivedAt).getTime();

      if (sortOrder === 'most_overdue') {
        return aDeadline - bDeadline;
      } else if (sortOrder === 'urgency') {
        const orderMap: Record<string, number> = {
          'P1 Critical': 1,
          'P2 High': 2,
          'P3 Normal': 3,
          'P4 Low': 4,
        };
        return (orderMap[a.urgency] || 5) - (orderMap[b.urgency] || 5);
      } else if (sortOrder === 'newest') {
        return bReceived - aReceived;
      } else if (sortOrder === 'oldest') {
        return aReceived - bReceived;
      }
      return 0;
    });
  }, [queries, sortOrder]);

  const getUrgencyIndicator = (urgency: UrgencyLevel) => {
    switch (urgency) {
      case 'P1 Critical':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-700">
            <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
            P1 Critical
          </span>
        );
      case 'P2 High':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            P2 High
          </span>
        );
      case 'P3 Normal':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
            P3 Normal
          </span>
        );
      case 'P4 Low':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
            P4 Low
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 border-r border-slate-200 select-none">
      {/* Top Filter Bar */}
      <div className="p-2.5 bg-white border-b border-slate-200 overflow-x-auto shrink-0">
        <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg min-w-max">
          {filterTabs.map((tab) => {
            const isActive = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-2.5 py-1 text-xs rounded-md transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900 font-medium'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] tabular-nums font-semibold px-1.5 py-0.2 rounded-full ${
                    tab.highlight && tab.count > 0
                      ? 'bg-red-100 text-red-800'
                      : isActive
                      ? 'bg-slate-100 text-slate-700'
                      : 'text-slate-400'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Secondary Sort & Category Strip */}
      <div className="px-3 py-2 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between gap-2 shrink-0 text-xs">
        {/* Sort Selector */}
        <div className="flex items-center gap-1.5 text-slate-600">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="text-[11px] text-slate-500 font-medium">Sort:</span>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as SortOrder)}
            className="text-[11px] font-medium bg-white border border-slate-200 rounded px-2 py-0.5 text-slate-800 focus:outline-none cursor-pointer"
          >
            <option value="most_overdue">Most Overdue</option>
            <option value="urgency">Urgency (P1 first)</option>
            <option value="newest">Newest Inbound</option>
            <option value="oldest">Oldest Inbound</option>
          </select>
        </div>

        {/* Category Dropdown */}
        <div className="flex items-center gap-1.5">
          <Filter className="w-3 h-3 text-slate-400 shrink-0" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-[11px] bg-white border border-slate-200 rounded px-2 py-0.5 text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="all">All Categories</option>
            <option value="Technical Incident">Technical Incident</option>
            <option value="Billing & Invoicing">Billing & Invoicing</option>
            <option value="Account & Contract">Account & Contract</option>
            <option value="Feature Request">Feature Request</option>
            <option value="General Inquiry">General Inquiry</option>
          </select>
        </div>
      </div>

      {/* Query List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
        {sortedQueries.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            <p className="text-xs font-medium text-slate-600">No queries match this filter</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Try resetting the filter tabs above</p>
          </div>
        ) : (
          sortedQueries.map((q) => {
            const isSelected = selectedQueryId === q.id;
            const sla = formatSlaStatus(q.slaDeadline);

            return (
              <div
                key={q.id}
                onClick={() => onSelectQuery(q.id)}
                className={`p-3.5 transition-colors cursor-pointer relative ${
                  isSelected
                    ? 'bg-blue-50/60 ring-1 ring-blue-500/20 z-1'
                    : 'bg-white hover:bg-slate-50/80'
                }`}
              >
                {/* Active Indicator Bar on the left */}
                {isSelected && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-r"></div>
                )}

                {/* Top Row: Client Name + SLA Badge */}
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-xs font-semibold text-slate-900 truncate">
                      {q.clientCompany}
                    </span>
                    {q.isConfidential && (
                      <span title="Confidential Client (AI Bypassed)">
                        <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      </span>
                    )}
                  </div>

                  {/* SLA Badge */}
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono tabular-nums shrink-0 ${sla.severityClass}`}>
                    <Clock className="w-2.5 h-2.5 inline mr-1 -mt-0.5" />
                    {sla.text}
                  </span>
                </div>

                {/* Subject Line */}
                <div className="text-xs font-medium text-slate-800 line-clamp-1 mb-1">
                  {q.subject}
                </div>

                {/* Sender & Snippet */}
                <div className="text-[11px] text-slate-500 line-clamp-1 mb-2">
                  <span className="text-slate-600 font-medium">{q.senderName}:</span>{' '}
                  {q.snippet}
                </div>

                {/* Bottom Metadata Strip */}
                <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-slate-100/80 text-slate-500">
                  <div className="flex items-center gap-2">
                    {getUrgencyIndicator(q.urgency)}
                    <span className="text-slate-300">·</span>
                    <span className="truncate max-w-[110px]">{q.category}</span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {q.draftReply?.isApproved ? (
                      <span className="text-[10px] font-semibold text-emerald-700 flex items-center gap-1 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                        <FileCheck className="w-3 h-3 text-emerald-600" />
                        Approved
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium text-blue-700 flex items-center gap-1 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                        Draft Ready
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
