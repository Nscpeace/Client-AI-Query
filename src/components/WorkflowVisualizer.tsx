import React, { useState } from 'react';
import { 
  Play, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Code2, 
  Zap, 
  ShieldCheck, 
  FileText, 
  Sparkles, 
  Mail, 
  UserCheck, 
  Database,
  Layers,
  ChevronRight,
  TrendingDown,
  Lock
} from 'lucide-react';
import { WORKFLOW_NODES } from '../data/mockData';
import { WorkflowNode } from '../types/inbox';

export const WorkflowVisualizer: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<WorkflowNode>(WORKFLOW_NODES[3]); // default to Gemini node
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [runLogs, setRunLogs] = useState<string[]>([
    'Pipeline initialized: 6 nodes active and monitoring shared inbox.',
    'Webhook listener ready on https://api.acmecloud.io/v1/inbox/webhook',
  ]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'Mail': return Mail;
      case 'ShieldCheck': return ShieldCheck;
      case 'Database': return Database;
      case 'Sparkles': return Sparkles;
      case 'FileText': return FileText;
      case 'UserCheck': return UserCheck;
      default: return Zap;
    }
  };

  // Simulate step-by-step pipeline execution
  const handleTestRun = async () => {
    setIsRunning(true);
    setRunLogs(['Starting live pipeline trace for sample incoming query...']);

    for (let i = 1; i <= WORKFLOW_NODES.length; i++) {
      setActiveStep(i);
      const node = WORKFLOW_NODES[i - 1];
      setSelectedNode(node);
      setRunLogs((prev) => [
        ...prev,
        `[Step ${i}/6] Executing ${node.label} (${node.service})...`,
      ]);
      await new Promise((r) => setTimeout(r, 650));
      setRunLogs((prev) => [
        ...prev,
        `✓ [Step ${i}/6] Completed in ${node.avgLatencyMs}ms (Status: Success 200 OK)`,
      ]);
    }

    setRunLogs((prev) => [
      ...prev,
      '🎉 Pipeline execution complete. Draft reply safely staged in queue with zero auto-send risk.',
    ]);
    setIsRunning(false);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-hidden">
      {/* Top Banner / Metrics */}
      <div className="p-4 bg-white border-b border-slate-200 shrink-0">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" />
              <span>n8n / Serverless Workflow Canvas</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Production orchestration diagram showing message ingestion, AI classification, context enrichment, and draft generation.
            </p>
          </div>

          <button
            onClick={handleTestRun}
            disabled={isRunning}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-md shadow-xs transition-all cursor-pointer ${
              isRunning
                ? 'bg-amber-500 text-white animate-pulse'
                : 'bg-blue-600 hover:bg-blue-500 text-white'
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            <span>{isRunning ? 'Tracing Pipeline...' : 'Test Run Pipeline'}</span>
          </button>
        </div>

        {/* Operational ROI Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-3 border-t border-slate-100 text-xs">
          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/80">
            <span className="text-[11px] text-slate-500 block">Avg Preparation Latency</span>
            <div className="text-base font-bold text-slate-900 tabular-nums flex items-center gap-1 mt-0.5">
              <span>1.8 min</span>
              <span className="text-[10px] font-normal text-emerald-600 flex items-center">
                <TrendingDown className="w-3 h-3" /> -82% vs manual
              </span>
            </div>
          </div>

          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/80">
            <span className="text-[11px] text-slate-500 block">SLA Compliance Rate</span>
            <div className="text-base font-bold text-emerald-700 tabular-nums mt-0.5">
              99.4%
            </div>
          </div>

          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/80">
            <span className="text-[11px] text-slate-500 block">Citation Grounding</span>
            <div className="text-base font-bold text-blue-700 tabular-nums mt-0.5">
              100% Verified
            </div>
          </div>

          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/80">
            <span className="text-[11px] text-slate-500 block">Accidental Auto-Sends</span>
            <div className="text-base font-bold text-slate-800 tabular-nums flex items-center gap-1 mt-0.5">
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              <span>0 (Hard Enforced)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Split: Left Workflow Graph, Right Inspector Drawer */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* Left Column: Visual Pipeline Nodes (7 cols) */}
        <div className="lg:col-span-7 p-6 overflow-y-auto space-y-4">
          <div className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
            Execution Flow Sequence (Step 1 to 6)
          </div>

          <div className="relative space-y-3">
            {WORKFLOW_NODES.map((node, index) => {
              const Icon = getIcon(node.iconType);
              const isSelected = selectedNode.id === node.id;
              const isStepActive = activeStep === node.stepNumber;

              return (
                <div key={node.id} className="relative">
                  <div
                    onClick={() => setSelectedNode(node)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer bg-white relative ${
                      isStepActive
                        ? 'ring-2 ring-blue-500 border-blue-400 shadow-md bg-blue-50/20'
                        : isSelected
                        ? 'border-blue-500 shadow-xs ring-1 ring-blue-500/20'
                        : 'border-slate-200 hover:border-slate-300 hover:shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                            isStepActive
                              ? 'bg-blue-600 text-white animate-pulse'
                              : isSelected
                              ? 'bg-blue-50 text-blue-600 border border-blue-200'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700">
                              Node 0{node.stepNumber}
                            </span>
                            <span className="text-xs font-semibold text-slate-900">
                              {node.label}
                            </span>
                          </div>
                          <div className="text-[11px] text-blue-600 font-medium mt-0.5">
                            {node.service}
                          </div>
                          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                            {node.description}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[10px] font-mono text-slate-400 tabular-nums block">
                          ~{node.avgLatencyMs}ms
                        </span>
                        <span className="text-[10px] font-medium text-emerald-600 tabular-nums">
                          {node.successRate}% OK
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Connecting Arrow between nodes */}
                  {index < WORKFLOW_NODES.length - 1 && (
                    <div className="flex justify-center my-1 text-slate-300">
                      <ArrowRight className="w-4 h-4 rotate-90" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Node Inspector & Execution Logs (5 cols) */}
        <div className="lg:col-span-5 p-4 bg-white border-l border-slate-200 flex flex-col h-full overflow-y-auto space-y-4">
          {/* Node Header */}
          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Node Inspector
              </span>
              <span className="text-xs font-mono text-blue-600 font-semibold tabular-nums">
                Node ID: {selectedNode.id}
              </span>
            </div>
            <h3 className="text-sm font-semibold text-slate-900">
              {selectedNode.label}
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Service: <strong className="text-slate-800">{selectedNode.service}</strong>
            </p>
          </div>

          {/* Prompt Template (if AI node) */}
          {selectedNode.promptTemplate && (
            <div className="border border-slate-200 rounded-lg p-3 bg-white">
              <div className="text-xs font-semibold text-slate-900 mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Prompt / System Instruction</span>
              </div>
              <p className="text-[11px] text-slate-600 font-mono bg-slate-50 p-2 rounded border border-slate-100 leading-relaxed">
                {selectedNode.promptTemplate}
              </p>
            </div>
          )}

          {/* Sample JSON Input */}
          <div className="border border-slate-200 rounded-lg p-3 bg-white">
            <div className="text-xs font-semibold text-slate-900 mb-1 flex items-center gap-1.5">
              <Code2 className="w-3.5 h-3.5 text-slate-500" />
              <span>Sample Input Payload</span>
            </div>
            <pre className="text-[11px] font-mono text-slate-700 bg-slate-900 text-slate-200 p-2.5 rounded overflow-x-auto max-h-40">
              {JSON.stringify(selectedNode.sampleInput, null, 2)}
            </pre>
          </div>

          {/* Sample JSON Output */}
          <div className="border border-slate-200 rounded-lg p-3 bg-white">
            <div className="text-xs font-semibold text-slate-900 mb-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Sample Output Payload</span>
            </div>
            <pre className="text-[11px] font-mono text-emerald-300 bg-slate-900 p-2.5 rounded overflow-x-auto max-h-44">
              {JSON.stringify(selectedNode.sampleOutput, null, 2)}
            </pre>
          </div>

          {/* Live Execution Logs */}
          <div className="flex-1 flex flex-col min-h-[140px] border border-slate-200 rounded-lg p-3 bg-slate-950 text-slate-300 font-mono text-[10px]">
            <div className="text-slate-400 font-bold mb-1 flex items-center justify-between">
              <span>Pipeline Runtime Log</span>
              {isRunning && <span className="text-amber-400 animate-pulse">Running...</span>}
            </div>
            <div className="flex-1 overflow-y-auto space-y-1">
              {runLogs.map((log, i) => (
                <div key={i} className="leading-tight text-slate-300">
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
