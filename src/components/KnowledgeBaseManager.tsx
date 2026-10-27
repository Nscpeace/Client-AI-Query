import React, { useState } from 'react';
import { BookOpen, Plus, Tag, Search, Check, ExternalLink } from 'lucide-react';
import { KnowledgeArticle, QueryCategory } from '../types/inbox';

interface KnowledgeBaseManagerProps {
  articles: KnowledgeArticle[];
  onAddArticle: (article: KnowledgeArticle) => void;
}

export const KnowledgeBaseManager: React.FC<KnowledgeBaseManagerProps> = ({
  articles,
  onAddArticle,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<KnowledgeArticle>(articles[0]);
  const [isAdding, setIsAdding] = useState(false);

  // New article form
  const [newTitle, setNewTitle] = useState('');
  const [newSection, setNewSection] = useState('KB-POLICY-§1.0');
  const [newCategory, setNewCategory] = useState<QueryCategory>('Technical Incident');
  const [newSummary, setNewSummary] = useState('');
  const [newContent, setNewContent] = useState('');

  const filtered = articles.filter(
    (a) =>
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.sectionCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSaveNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newContent) return;

    const created: KnowledgeArticle = {
      id: `kb_custom_${Date.now()}`,
      title: newTitle,
      sectionCode: newSection,
      category: newCategory,
      summary: newSummary || newTitle,
      content: newContent,
      lastUpdated: new Date().toISOString().split('T')[0],
      tags: ['custom', newCategory.toLowerCase().replace(/\s+/g, '_')],
    };

    onAddArticle(created);
    setSelectedArticle(created);
    setIsAdding(false);
    setNewTitle('');
    setNewContent('');
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-hidden">
      {/* Top Bar */}
      <div className="p-4 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-600" />
            <span>Knowledge Base & Policy Grounding Repository</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Internal procedures, SLA clauses, and operational runbooks cited in AI draft replies.
          </p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-md transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{isAdding ? 'Cancel' : 'Add Policy Article'}</span>
        </button>
      </div>

      {/* Main Split */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* Left: Article List (5 cols) */}
        <div className="lg:col-span-5 border-r border-slate-200 bg-white flex flex-col h-full overflow-hidden">
          <div className="p-3 border-b border-slate-100">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search runbooks & section codes..."
                className="w-full text-xs pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filtered.map((article) => {
              const isSelected = selectedArticle?.id === article.id;
              return (
                <div
                  key={article.id}
                  onClick={() => {
                    setSelectedArticle(article);
                    setIsAdding(false);
                  }}
                  className={`p-3.5 transition-colors cursor-pointer ${
                    isSelected ? 'bg-blue-50/70 border-l-3 border-l-blue-600' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.2 rounded">
                      {article.sectionCode}
                    </span>
                    <span className="text-[10px] text-slate-400 tabular-nums">
                      {article.lastUpdated}
                    </span>
                  </div>
                  <h4 className="text-xs font-semibold text-slate-900 line-clamp-1">
                    {article.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {article.summary}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Article Reader / Editor (7 cols) */}
        <div className="lg:col-span-7 p-6 bg-slate-50 overflow-y-auto flex flex-col h-full">
          {isAdding ? (
            <form onSubmit={handleSaveNew} className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
              <h3 className="text-sm font-semibold text-slate-900">Add New Grounded Article</h3>

              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. SOC 2 Data Retention & Audit Protocol"
                  className="w-full text-xs p-2 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">Section Citation Code</label>
                  <input
                    type="text"
                    required
                    value={newSection}
                    onChange={(e) => setNewSection(e.target.value)}
                    placeholder="e.g. KB-SECURITY-§1.2"
                    className="w-full text-xs p-2 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as QueryCategory)}
                    className="w-full text-xs p-2 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="Technical Incident">Technical Incident</option>
                    <option value="Billing & Invoicing">Billing & Invoicing</option>
                    <option value="Account & Contract">Account & Contract</option>
                    <option value="Feature Request">Feature Request</option>
                    <option value="General Inquiry">General Inquiry</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">Summary</label>
                <input
                  type="text"
                  value={newSummary}
                  onChange={(e) => setNewSummary(e.target.value)}
                  placeholder="Short 1-line summary for AI semantic matching..."
                  className="w-full text-xs p-2 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">Policy Content & Clauses</label>
                <textarea
                  required
                  rows={6}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Exact policy terms, resolution steps, SLA commitments, or refund rules..."
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-md"
                >
                  Save Policy Article
                </button>
              </div>
            </form>
          ) : (
            <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                    {selectedArticle.sectionCode}
                  </span>
                  <h3 className="text-base font-semibold text-slate-900 mt-2">
                    {selectedArticle.title}
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-slate-400 block">Category</span>
                  <span className="text-xs font-medium text-slate-700">{selectedArticle.category}</span>
                </div>
              </div>

              <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 font-medium">
                Summary: {selectedArticle.summary}
              </div>

              <div className="text-xs text-slate-800 leading-relaxed whitespace-pre-wrap font-sans bg-white pt-2">
                {selectedArticle.content}
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Tag className="w-3 h-3 text-slate-400" />
                  <span>Tags: {selectedArticle.tags.join(', ')}</span>
                </div>
                <span>Last revised: {selectedArticle.lastUpdated}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
