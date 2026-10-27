import React, { useState, useMemo } from 'react';
import { 
  AlertCircle, 
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
import { ClientQuery, QueryCategory, UrgencyLevel, QueryStatus } from '../types/inbox';
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

  // Filter tabs
  const now = Date.now();
  const overdueCount = queries.filter(q => new Date(q.slaDeadline).getTime() < now && !q.draftReply?.isApproved).length;

  const filterTabs = [
    { id: 'all', label: 'All Queries', count: queries.length },
    { 
      id: 'overdue', 
      label: 'Overdue (2w, 8d…)', 
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
      label: 'Awaiting Review', 
      count: queries.filter(q => q.draftReply && !q.draftReply.isApproved).length 
    },
    { 
      id: 'approved', 
      label: 'Approved Drafts', 
      count: queries.filter(q => q.draftReply?.isApproved).length 
    },
    { 
      id: 'confidential', 
      label: 'Confidential Shield', 
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
        // Most overdue first: smallest deadline timestamp (oldest deadline) comes first
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

  const getUrgencyBadge = (urgency: UrgencyLevel) => {
    switch (urgency) {
      case 'P1 Critical':
        return <span className="text-[11px] font-bold text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded">P1 Critical</span>;
      case 'P2 High':
        return <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">P2 High</span>;
      case 'P3 Normal':
        return <span className="text-[11px] font-medium text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded">P3 Normal</span>;
      case 'P4 Low':
        return <span className="text-[11px] font-normal text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">P4 Low</span>;
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 border-r border-slate-200">
      {/* Filter Tabs Bar */}
      <div className="p-2.5 bg-white border-b border-slate-200 overflow-x-auto shrink-0">
        <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-md min-w-max">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1 ${
                statusFilter === tab.id
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] tabular-nums font-semibold px-1 py-0.2 rounded-full ${
                tab.highlight && tab.count > 0 
                  ? 'bg-red-100 text-red-800' 
                  : 'text-slate-400'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Sorting & Category Secondary Bar */}
      <div className="px-3 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-2 shrink-0 text-xs">
        {/* Sort Order Selector */}
        <div className="flex items-center gap-1.5 text-slate-600">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="text-[11px] font-medium text-slate-500">Sort:</span>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as SortOrder)}
            className="text-[11px] font-medium bg-white border border-slate-200 rounded px-2 py-0.5 text-slate-800 focus:outline-none cursor-pointer"
          >
            <option value="most_overdue">Most Overdue First</option>
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
      <div className="flex-1 overflow-y-auto divide-y divide-slate-200">
        {sortedQueries.length === 0 ? (
          <div className="p-10 text-center text-slate-500">
            <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            <p className="text-xs font-medium">No client queries match the current filter.</p>
          </div>
        ) : (
          sortedQueries.map((q) => {
            const isSelected = selectedQueryId === q.id;
            const sla = formatSlaStatus(q.slaDeadline);

            return (
              <div
                key={q.id}
                onClick={() => onSelectQuery(q.id)}
                className={`p-3.5 transition-all cursor-pointer border-l-3 ${
                  isSelected
                    ? 'bg-white border-l-blue-600 shadow-xs'
                    : sla.isOverdue && sla.daysOverdue >= 7
                    ? 'bg-red-50/20 border-l-red-600 hover:bg-red-50/40'
                    : q.urgency === 'P1 Critical'
                    ? 'bg-white border-l-red-500 hover:bg-slate-100/70'
                    : 'bg-white/80 border-l-transparent hover:bg-white'
                }`}
              >
                {/* Top Row: Sender & Realistic SLA Badge */}
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    {q.senderAvatar ? (
                      <img
                        src={q.senderAvatar}
                        alt={q.senderName}
                        referrerPolicy="no-referrer"
                        className="w-5 h-5 rounded-full object-cover shrink-0 border border-slate-200"
                      />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-700 shrink-0">
                        {q.senderName.charAt(0)}
                      </div>
                    )}
                    <span className="text-xs font-semibold text-slate-900 truncate">
                      {q.senderName}
                    </span>
                    <span className="text-slate-300">·</span>
                    <span className="text-[11px] text-slate-500 truncate">
                      {q.clientCompany}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className={`text-[10px] px-2 py-0.5 rounded border tabular-nums ${sla.severityClass}`}>
                      <Clock className="w-2.5 h-2.5 inline mr-1 -mt-0.5" />
                      {sla.text}
                    </span>
                  </div>
                </div>

                {/* Subject */}
                <div className="text-xs font-medium text-slate-900 line-clamp-1 mb-1">
                  {q.isConfidential && (
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-600 inline mr-1 -mt-0.5" />
                  )}
                  {q.subject}
                </div>

                {/* Snippet */}
                <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed mb-2.5">
                  {q.snippet}
                </p>

                {/* Bottom Row: Metadata Tags (Unboxed / Clean) */}
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                  <div className="flex items-center gap-2 flex-wrap">
                    {getUrgencyBadge(q.urgency)}
                    <span className="text-slate-700 font-medium">{q.category}</span>
                    <span className="text-slate-300">·</span>
                    <span>Assigned: <strong className="text-slate-700 font-medium">{q.assignedTo}</strong></span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {q.draftReply ? (
                      q.draftReply.isApproved ? (
                        <span className="text-[10px] font-medium text-emerald-700 flex items-center gap-1">
                          <FileCheck className="w-3 h-3 text-emerald-600" />
                          Approved
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium text-blue-700 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                          Draft Ready
                        </span>
                      )
                    ) : (
                      <span className="text-[10px] text-slate-400">Triaging...</span>
                    )}
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
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
