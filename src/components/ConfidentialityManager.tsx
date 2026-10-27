import React, { useState } from 'react';
import { ShieldAlert, Plus, Check, Lock, AlertTriangle, ShieldCheck, User } from 'lucide-react';
import { ConfidentialRule } from '../types/inbox';

interface ConfidentialityManagerProps {
  rules: ConfidentialRule[];
  onToggleRule: (id: string) => void;
  onAddRule: (rule: ConfidentialRule) => void;
}

export const ConfidentialityManager: React.FC<ConfidentialityManagerProps> = ({
  rules,
  onToggleRule,
  onAddRule,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [domain, setDomain] = useState('');
  const [clientName, setClientName] = useState('');
  const [reason, setReason] = useState('');
  const [lead, setLead] = useState('Sarah Jenkins (Enterprise Lead)');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!domain || !clientName) return;

    const newRule: ConfidentialRule = {
      id: `crule_${Date.now()}`,
      domainPattern: domain.toLowerCase().trim(),
      clientName: clientName.trim(),
      reason: reason || 'Enterprise NDA / Regulated data sovereignty mandate.',
      action: 'bypass_ai_and_route',
      assignedLead: lead,
      enabled: true,
      createdAt: new Date().toISOString().split('T')[0],
    };

    onAddRule(newRule);
    setIsAdding(false);
    setDomain('');
    setClientName('');
    setReason('');
  };

  return (
    <div className="flex-1 p-6 bg-slate-50 overflow-y-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-600" />
            <span>Confidential Client Guardrail & AI Exclusion Registry</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Organizations with strict NDA, HIPAA, or banking compliance requirements are automatically shielded from third-party AI processing. Matching incoming messages bypass external models and route directly to human team leads.
          </p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{isAdding ? 'Close Form' : 'Register Excluded Domain'}</span>
        </button>
      </div>

      {/* Add New Rule Form */}
      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-white p-5 rounded-xl border border-slate-200 space-y-3.5 shadow-2xs">
          <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
            Add Excluded Domain Rule
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">
                Domain or Pattern (e.g. novapay.io or *.medtech.org)
              </label>
              <input
                type="text"
                required
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="domain.com"
                className="w-full text-xs p-2 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">Client Entity Name</label>
              <input
                type="text"
                required
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Client Organization Name"
                className="w-full text-xs p-2 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">Direct Routing Human Lead</label>
              <select
                value={lead}
                onChange={(e) => setLead(e.target.value)}
                className="w-full text-xs p-2 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="Sarah Jenkins (Enterprise Lead)">Sarah Jenkins (Enterprise Lead)</option>
                <option value="Marcus Vance (Senior FinTech Director)">Marcus Vance (Senior FinTech Director)</option>
                <option value="Elena Rostova (Operations Lead)">Elena Rostova (Operations Lead)</option>
                <option value="Executive On-Call Lead">Executive On-Call Lead</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">Compliance / Legal Justification</label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Clinical Trial Patient Data NDA"
                className="w-full text-xs p-2 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
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
              Enforce Exclusion Rule
            </button>
          </div>
        </form>
      )}

      {/* Rules Registry List */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-900">
            Active Exclusion Rules ({rules.filter((r) => r.enabled).length} of {rules.length} enabled)
          </span>
          <span className="text-[11px] text-slate-400">
            Zero data transmitted to external LLMs for matching accounts
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {rules.map((rule) => (
            <div key={rule.id} className="p-4 flex flex-wrap items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    {rule.domainPattern}
                  </span>
                  <span className="text-slate-300">·</span>
                  <span className="text-xs font-semibold text-slate-800">
                    {rule.clientName}
                  </span>
                  {rule.enabled ? (
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5" />
                      Protected
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded">
                      Disabled
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Reason: {rule.reason}
                </p>

                <div className="text-[11px] text-slate-600 mt-1 flex items-center gap-1.5">
                  <User className="w-3 h-3 text-slate-400" />
                  <span>Assigned Human Lead: <strong className="text-slate-800">{rule.assignedLead}</strong></span>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => onToggleRule(rule.id)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer border ${
                    rule.enabled
                      ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {rule.enabled ? 'Disable Shield' : 'Enable Shield'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
