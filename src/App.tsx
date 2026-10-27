/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { Header } from './components/Header';
import { TriageQueue } from './components/TriageQueue';
import { QueryDetail } from './components/QueryDetail';
import { WorkflowVisualizer } from './components/WorkflowVisualizer';
import { DailyDigest } from './components/DailyDigest';
import { KnowledgeBaseManager } from './components/KnowledgeBaseManager';
import { ConfidentialityManager } from './components/ConfidentialityManager';
import { PortfolioShowcase } from './components/PortfolioShowcase';
import { NewEmailModal } from './components/NewEmailModal';

import { 
  SAMPLE_QUERIES, 
  INITIAL_CLIENTS, 
  KNOWLEDGE_BASE, 
  INITIAL_CONFIDENTIAL_RULES 
} from './data/mockData';
import { ClientQuery, ClientRecord, KnowledgeArticle, ConfidentialRule } from './types/inbox';

export default function App() {
  const [queries, setQueries] = useState<ClientQuery[]>(() => {
    try {
      const saved = localStorage.getItem('clientpulse_queries_v4');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 7) {
          return parsed;
        }
      }
    } catch (e) {
      // ignore
    }
    return SAMPLE_QUERIES;
  });

  const [clients] = useState<ClientRecord[]>(INITIAL_CLIENTS);
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeArticle[]>(KNOWLEDGE_BASE);
  const [confidentialRules, setConfidentialRules] = useState<ConfidentialRule[]>(INITIAL_CONFIDENTIAL_RULES);

  const [activeTab, setActiveTab] = useState<ActiveTab>('inbox');
  const [selectedQueryId, setSelectedQueryId] = useState<string | null>(SAMPLE_QUERIES[0]?.id || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isNewEmailModalOpen, setIsNewEmailModalOpen] = useState(false);
  const [isRetriaging, setIsRetriaging] = useState(false);

  // Sync to local storage
  React.useEffect(() => {
    localStorage.setItem('clientpulse_queries_v4', JSON.stringify(queries));
  }, [queries]);

  // Derived filtered query list
  const filteredQueries = useMemo(() => {
    const now = Date.now();
    return queries.filter((q) => {
      // Search filter
      if (searchQuery.trim()) {
        const term = searchQuery.toLowerCase();
        const matches =
          q.subject.toLowerCase().includes(term) ||
          q.clientCompany.toLowerCase().includes(term) ||
          q.senderName.toLowerCase().includes(term) ||
          q.body.toLowerCase().includes(term);
        if (!matches) return false;
      }

      // Status filter
      if (statusFilter === 'overdue') {
        const isOverdue = new Date(q.slaDeadline).getTime() < now && !q.draftReply?.isApproved;
        if (!isOverdue) return false;
      }
      if (statusFilter === 'p1_urgent' && q.urgency !== 'P1 Critical') return false;
      if (statusFilter === 'awaiting_approval' && (!q.draftReply || q.draftReply.isApproved)) return false;
      if (statusFilter === 'approved' && !q.draftReply?.isApproved) return false;
      if (statusFilter === 'confidential' && !q.isConfidential) return false;

      // Category filter
      if (categoryFilter !== 'all' && q.category !== categoryFilter) return false;

      return true;
    });
  }, [queries, searchQuery, statusFilter, categoryFilter]);

  // Selected query object
  const selectedQuery = useMemo(() => {
    return queries.find((q) => q.id === selectedQueryId) || queries[0] || null;
  }, [queries, selectedQueryId]);

  // Selected query's client record
  const selectedClient = useMemo(() => {
    if (!selectedQuery) return undefined;
    return clients.find((c) => c.id === selectedQuery.clientId || c.name === selectedQuery.clientCompany);
  }, [clients, selectedQuery]);

  // Update draft handler
  const handleUpdateDraft = (queryId: string, updatedDraft: string, isApproved: boolean) => {
    setQueries((prev) =>
      prev.map((q) => {
        if (q.id === queryId && q.draftReply) {
          return {
            ...q,
            status: isApproved ? 'approved' : 'draft_ready',
            draftReply: {
              ...q.draftReply,
              body: updatedDraft,
              isApproved,
              lastEditedAt: new Date().toISOString(),
            },
            routingHistory: [
              ...q.routingHistory,
              {
                timestamp: new Date().toLocaleTimeString(),
                action: isApproved ? 'Draft Approved by Human' : 'Draft Edited',
                actor: 'Reviewing Specialist',
                note: isApproved ? 'Ready for one-click dispatch' : 'Updated draft body',
              },
            ],
          };
        }
        return q;
      })
    );
  };

  // Reassign query
  const handleReassign = (queryId: string, newAssignee: string, newRole: string) => {
    setQueries((prev) =>
      prev.map((q) => {
        if (q.id === queryId) {
          return {
            ...q,
            assignedTo: newAssignee,
            assignedRole: newRole,
            routingHistory: [
              ...q.routingHistory,
              {
                timestamp: new Date().toLocaleTimeString(),
                action: 'Reassigned Specialist',
                actor: 'Team Lead',
                note: `Transferred ownership to ${newAssignee}`,
              },
            ],
          };
        }
        return q;
      })
    );
  };

  // Re-triage query using Gemini backend
  const handleRetriage = async (queryId: string) => {
    const target = queries.find((q) => q.id === queryId);
    if (!target) return;

    setIsRetriaging(true);
    const client = clients.find((c) => c.id === target.clientId) || clients[0];

    try {
      const res = await fetch('/api/triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: target.subject,
          body: target.body,
          senderEmail: target.senderEmail,
          clientTier: client?.tier,
          clientName: target.clientCompany,
          knowledgeBase,
        }),
      });

      const data = await res.json();
      const triage = data.result;

      setQueries((prev) =>
        prev.map((q) => {
          if (q.id === queryId) {
            return {
              ...q,
              category: (triage.category as any) || q.category,
              urgency: (triage.urgency as any) || q.urgency,
              sentiment: (triage.sentiment as any) || q.sentiment,
              aiReasoning: triage.reasoning,
              draftReply: q.draftReply
                ? {
                    ...q.draftReply,
                    subject: triage.draftSubject || q.draftReply.subject,
                    body: triage.draftBody || q.draftReply.body,
                    confidenceScore: triage.confidenceScore || q.draftReply.confidenceScore,
                  }
                : undefined,
              routingHistory: [
                ...q.routingHistory,
                {
                  timestamp: new Date().toLocaleTimeString(),
                  action: 'Re-triaged via Gemini Flash',
                  actor: 'Gemini AI',
                  note: `Assessed as ${triage.urgency} (${triage.confidenceScore}% confidence)`,
                },
              ],
            };
          }
          return q;
        })
      );
    } catch (err) {
      console.error('Re-triage error:', err);
    } finally {
      setIsRetriaging(false);
    }
  };

  // Ingest newly simulated query
  const handleIngestQuery = (newQuery: ClientQuery) => {
    setQueries((prev) => [newQuery, ...prev]);
    setSelectedQueryId(newQuery.id);
    setActiveTab('inbox');
  };

  // Reset demo queries
  const handleResetData = () => {
    if (confirm('Reset queries to default test scenarios?')) {
      localStorage.removeItem('clientpulse_queries');
      localStorage.removeItem('clientpulse_queries_v3');
      localStorage.removeItem('clientpulse_queries_v4');
      setQueries(SAMPLE_QUERIES);
      setSelectedQueryId(SAMPLE_QUERIES[0].id);
    }
  };

  // Toggle confidential rule
  const handleToggleRule = (id: string) => {
    setConfidentialRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    );
  };

  const handleAddRule = (rule: ConfidentialRule) => {
    setConfidentialRules((prev) => [rule, ...prev]);
  };

  const handleAddArticle = (article: KnowledgeArticle) => {
    setKnowledgeBase((prev) => [article, ...prev]);
  };

  // Metrics
  const now = Date.now();
  const unhandledCount = queries.filter((q) => q.draftReply && !q.draftReply.isApproved).length;
  const p1UrgentCount = queries.filter((q) => q.urgency === 'P1 Critical').length;
  const confidentialCount = queries.filter((q) => q.isConfidential).length;
  const overdueCount = queries.filter((q) => new Date(q.slaDeadline).getTime() < now && !q.draftReply?.isApproved).length;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100 font-sans antialiased text-slate-900">
      {/* Left Navigation Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        unhandledCount={unhandledCount}
        p1UrgentCount={p1UrgentCount}
        onOpenNewEmail={() => setIsNewEmailModalOpen(true)}
        onResetData={handleResetData}
      />

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        {/* Top Header */}
        <Header
          activeTab={activeTab}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          p1UrgentCount={p1UrgentCount}
          confidentialCount={confidentialCount}
          overdueCount={overdueCount}
          onOpenNewEmail={() => setIsNewEmailModalOpen(true)}
        />

        {/* Tab Viewport */}
        <main className="flex-1 overflow-hidden relative">
          {activeTab === 'inbox' && (
            <div className="flex h-full w-full overflow-hidden">
              {/* Triage Queue (Left Sub-column, width 380px - 440px) */}
              <div className="w-full sm:w-[380px] lg:w-[420px] shrink-0 h-full overflow-hidden border-r border-slate-200">
                <TriageQueue
                  queries={filteredQueries}
                  selectedQueryId={selectedQueryId}
                  onSelectQuery={(id) => setSelectedQueryId(id)}
                  statusFilter={statusFilter}
                  setStatusFilter={setStatusFilter}
                  categoryFilter={categoryFilter}
                  setCategoryFilter={setCategoryFilter}
                />
              </div>

              {/* Detail Workspace (Right Sub-column) */}
              <div className="flex-1 h-full overflow-hidden hidden sm:flex">
                {selectedQuery ? (
                  <QueryDetail
                    query={selectedQuery}
                    client={selectedClient}
                    knowledgeBase={knowledgeBase}
                    onUpdateDraft={handleUpdateDraft}
                    onReassign={handleReassign}
                    onRetriage={handleRetriage}
                    isRetriaging={isRetriaging}
                  />
                ) : (
                  <div className="flex-1 flex items-center justify-center text-slate-400 text-xs">
                    Select a query from the queue to review draft.
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'digest' && (
            <DailyDigest
              queries={queries}
              onSelectQuery={(id) => {
                setSelectedQueryId(id);
                setActiveTab('inbox');
              }}
            />
          )}

          {activeTab === 'workflow' && <WorkflowVisualizer />}

          {activeTab === 'knowledge' && (
            <KnowledgeBaseManager
              articles={knowledgeBase}
              onAddArticle={handleAddArticle}
            />
          )}

          {activeTab === 'confidentiality' && (
            <ConfidentialityManager
              rules={confidentialRules}
              onToggleRule={handleToggleRule}
              onAddRule={handleAddRule}
            />
          )}

          {activeTab === 'portfolio' && <PortfolioShowcase />}
        </main>
      </div>

      {/* New Inbound Email Ingest Modal */}
      <NewEmailModal
        isOpen={isNewEmailModalOpen}
        onClose={() => setIsNewEmailModalOpen(false)}
        onIngestQuery={handleIngestQuery}
        knowledgeBase={knowledgeBase}
        clients={clients}
      />
    </div>
  );
}
