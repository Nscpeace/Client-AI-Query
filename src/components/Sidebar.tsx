import React from 'react';
import { 
  Inbox, 
  BarChart3, 
  GitFork, 
  BookOpen, 
  ShieldAlert, 
  Award, 
  PlusCircle, 
  RefreshCw,
  Mail,
  Lock
} from 'lucide-react';

export type ActiveTab = 'inbox' | 'digest' | 'workflow' | 'knowledge' | 'confidentiality' | 'portfolio';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  unhandledCount: number;
  p1UrgentCount: number;
  onOpenNewEmail: () => void;
  onResetData: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  unhandledCount,
  p1UrgentCount,
  onOpenNewEmail,
  onResetData,
}) => {
  const navItems: { id: ActiveTab; label: string; icon: React.ElementType; badge?: number; badgeColor?: string }[] = [
    { 
      id: 'inbox', 
      label: 'Triage Queue & Drafts', 
      icon: Inbox, 
      badge: unhandledCount,
      badgeColor: p1UrgentCount > 0 ? 'bg-red-500 text-white' : 'bg-slate-200 text-slate-800'
    },
    { id: 'digest', label: 'Executive Daily Digest', icon: BarChart3 },
    { id: 'workflow', label: 'Automation Canvas (n8n)', icon: GitFork },
    { id: 'knowledge', label: 'Knowledge Base & Rules', icon: BookOpen },
    { id: 'confidentiality', label: 'Confidentiality Shield', icon: ShieldAlert },
    { id: 'portfolio', label: 'Upwork Case Study', icon: Award },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-200 flex flex-col shrink-0 border-r border-slate-800 select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white text-base shadow-sm">
            CP
          </div>
          <div>
            <div className="font-semibold text-white text-sm tracking-tight leading-none">
              ClientPulse AI
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Inbox Triage & Drafts
            </div>
          </div>
        </div>
      </div>

      {/* Primary Action Button */}
      <div className="p-3">
        <button
          onClick={onOpenNewEmail}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-md shadow-sm transition-colors cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Simulate Inbound Email</span>
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-2 py-1 space-y-0.5 overflow-y-auto">
        <div className="px-2 pt-2 pb-1 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
          Operations
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                isActive
                  ? 'bg-slate-800 text-white font-semibold'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full tabular-nums ${item.badgeColor}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Guardrail Status Card */}
      <div className="p-3 mx-2 mb-2 bg-slate-800/60 rounded-md border border-slate-700/60 text-xs">
        <div className="flex items-center gap-1.5 text-slate-300 font-semibold mb-1">
          <Lock className="w-3.5 h-3.5 text-emerald-400" />
          <span>Zero-Auto-Send Enforced</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Draft replies are saved for human team review. No emails are ever dispatched autonomously.
        </p>
      </div>

      {/* Footer Info & Reset */}
      <div className="p-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-1.5 text-[11px]">
          <Mail className="w-3.5 h-3.5 text-blue-400" />
          <span className="truncate max-w-[130px]">support@acme.io</span>
        </div>
        <button
          onClick={onResetData}
          title="Reset sample queries & scenarios"
          className="p-1 hover:text-white rounded hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
};
