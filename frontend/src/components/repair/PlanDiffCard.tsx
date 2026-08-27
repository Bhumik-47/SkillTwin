'use client';

import React, { useState } from 'react';
import { useSkillTwin } from '../../lib/state/store';
import { PathRepairDiff, LearningPathNode } from '../../lib/types';
import {
  GitCompare,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  X,
  Calculator,
  Lock,
  Layers
} from 'lucide-react';

export default function PlanDiffCard() {
  const { activeRepairDiff, dismissDiffCard, openBktModal, openAssessment } = useSkillTwin();
  const [viewMode, setViewMode] = useState<'side_by_side' | 'unified'>('side_by_side');

  if (!activeRepairDiff) return null;

  const diff = activeRepairDiff;
  const isFailureTrigger = diff.trigger_event === 'assessment_failed';

  return (
    <div className="relative overflow-hidden rounded-3xl border border-rose-500/40 dark:bg-[#0c1220]/95 bg-white/95 p-6 shadow-2xl backdrop-blur-2xl transition-all duration-300">
      
      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-rose-500/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-brand-500/15 blur-3xl" />

      {/* Header Banner */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 border-b dark:border-white/10 border-slate-200 pb-5">
        <div className="flex items-center gap-3.5">
          <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border shadow-lg ${
            isFailureTrigger
              ? 'border-rose-500/50 bg-rose-500/20 text-rose-500 dark:text-rose-300 shadow-rose-500/20'
              : 'border-emerald-500/50 bg-emerald-500/20 text-emerald-500 dark:text-emerald-300 shadow-emerald-500/20'
          }`}>
            <GitCompare className="h-6 w-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold dark:text-white text-slate-900 tracking-tight">
                Your Roadmap Just Adapted!
              </h3>
              <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide border ${
                isFailureTrigger
                  ? 'bg-rose-500/20 text-rose-600 dark:text-rose-300 border-rose-500/40'
                  : 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border-emerald-500/40'
              }`}>
                {diff.trigger_event.replace('_', ' ')}
              </span>
            </div>
            <p className="text-xs dark:text-slate-300 text-slate-500 mt-0.5">
              Local Subgraph Repair Engine (v{diff.previous_version} → v{diff.new_version})
            </p>
          </div>
        </div>

        {/* Action / View Switches */}
        <div className="flex items-center gap-2">
          <div className="flex rounded-xl dark:bg-surface-200 bg-slate-100 border dark:border-white/10 border-slate-200 p-0.5 text-xs">
            <button
              onClick={() => setViewMode('side_by_side')}
              className={`rounded-lg px-3 py-1 font-medium transition-all ${
                viewMode === 'side_by_side' ? 'bg-brand-600 text-white shadow-sm' : 'dark:text-slate-400 text-slate-600 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Side-by-Side
            </button>
            <button
              onClick={() => setViewMode('unified')}
              className={`rounded-lg px-3 py-1 font-medium transition-all ${
                viewMode === 'unified' ? 'bg-brand-600 text-white shadow-sm' : 'dark:text-slate-400 text-slate-600 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Unified Diff
            </button>
          </div>

          <button
            onClick={() => openBktModal()}
            className="flex items-center gap-1 rounded-xl border border-cyan-500/40 bg-cyan-500/15 px-3 py-1.5 text-xs font-semibold text-cyan-600 dark:text-cyan-300 hover:bg-cyan-500/25 transition-all"
          >
            <Calculator className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Inspect BKT Math</span>
          </button>

          <button
            onClick={dismissDiffCard}
            title="Dismiss notification"
            className="rounded-xl border dark:border-white/10 border-slate-200 dark:bg-surface-200/80 bg-slate-100 p-1.5 dark:text-slate-400 text-slate-600 hover:text-slate-900 dark:hover:text-white transition-all"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Metrics Strip */}
      <div className="relative z-10 my-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border dark:border-white/10 border-slate-200 dark:bg-surface-200/60 bg-slate-50 p-3">
          <span className="text-[10px] font-semibold uppercase tracking-wider dark:text-slate-400 text-slate-500">Touched Nodes</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-xl font-extrabold dark:text-white text-slate-900">{diff.metrics.touched_node_count}</span>
            <span className="text-xs dark:text-slate-400 text-slate-500">/ {diff.metrics.total_node_count} nodes</span>
          </div>
          <span className="text-[10px] text-brand-500 dark:text-brand-300 font-medium">Minimally affected subgraph</span>
        </div>

        <div className="rounded-2xl border dark:border-white/10 border-slate-200 dark:bg-surface-200/60 bg-slate-50 p-3">
          <span className="text-[10px] font-semibold uppercase tracking-wider dark:text-slate-400 text-slate-500">Repair Ratio</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-xl font-extrabold text-emerald-500 dark:text-emerald-400">
              {(diff.metrics.repair_ratio * 100).toFixed(1)}%
            </span>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-300/80 font-medium">Localized</span>
          </div>
          <span className="text-[10px] dark:text-slate-400 text-slate-500">Lower is more targeted</span>
        </div>

        <div className="rounded-2xl border dark:border-white/10 border-slate-200 dark:bg-surface-200/60 bg-slate-50 p-3">
          <span className="text-[10px] font-semibold uppercase tracking-wider dark:text-slate-400 text-slate-500">Inserted Remedial</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-xl font-extrabold text-rose-500 dark:text-rose-400">{diff.inserted_nodes.length}</span>
            <span className="text-xs dark:text-slate-400 text-slate-500">modules</span>
          </div>
          <span className="text-[10px] text-rose-500 dark:text-rose-300 font-medium">Reinforces gap</span>
        </div>

        <div className="rounded-2xl border dark:border-white/10 border-slate-200 dark:bg-surface-200/60 bg-slate-50 p-3">
          <span className="text-[10px] font-semibold uppercase tracking-wider dark:text-slate-400 text-slate-500">Preserved Unchanged</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-xl font-extrabold dark:text-slate-200 text-slate-800">{diff.metrics.unchanged_node_count}</span>
            <span className="text-xs dark:text-slate-400 text-slate-500">nodes</span>
          </div>
          <span className="text-[10px] dark:text-slate-400 text-slate-500">Prerequisites stable</span>
        </div>
      </div>

      {/* Grounded Explanation Box */}
      <div className="relative z-10 mb-5 rounded-2xl border dark:border-brand-500/30 border-brand-200 dark:bg-brand-950/40 bg-brand-50/70 p-4">
        <div className="flex items-start gap-3">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
          <div className="flex-1 text-xs">
            <span className="font-semibold dark:text-brand-200 text-brand-700">Grounded AI Rationale: </span>
            <span className="dark:text-slate-200 text-slate-700 leading-relaxed">{diff.explanation}</span>
          </div>
        </div>
      </div>

      {/* Visual Diff: Old Path vs New Path */}
      {viewMode === 'side_by_side' ? (
        <div className="relative z-10 grid grid-cols-1 gap-4 lg:grid-cols-2">
          
          {/* Old Path Snapshot (v1) */}
          <div className="rounded-2xl border dark:border-white/10 border-slate-200 dark:bg-surface-300/40 bg-slate-50 p-4">
            <div className="flex items-center justify-between border-b dark:border-white/10 border-slate-200 pb-2 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider dark:text-slate-400 text-slate-600 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                Previous Roadmap (v{diff.previous_version})
              </span>
              <span className="text-[10px] dark:text-slate-400 text-slate-500">{diff.old_path.length} steps</span>
            </div>

            <div className="space-y-2">
              {diff.old_path.map((node) => {
                const isTrigger = node.skill_id === diff.trigger_skill_id;
                return (
                  <div
                    key={node.node_id}
                    className={`flex items-center justify-between rounded-xl border p-2.5 text-xs transition-all ${
                      isTrigger
                        ? 'border-rose-500/50 bg-rose-500/10 text-rose-600 dark:text-rose-200'
                        : 'dark:border-white/5 border-slate-200 dark:bg-surface-200/50 bg-white text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full dark:bg-white/10 bg-slate-200 text-[10px] font-bold dark:text-slate-300 text-slate-700">
                        {node.step_order}
                      </span>
                      <span className="font-medium truncate">{node.skill_name || node.skill_id}</span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${
                        node.status === 'completed'
                          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300'
                          : node.status === 'in_progress'
                          ? 'bg-amber-500/15 text-amber-600 dark:text-amber-300'
                          : 'dark:bg-slate-800 bg-slate-200 dark:text-slate-400 text-slate-600'
                      }`}>
                        {node.status}
                      </span>
                      <span className="font-mono text-[11px] dark:text-slate-400 text-slate-500">
                        P(L)={node.mastery_prob?.toFixed(2) ?? '0.10'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* New Repaired Path (v2) */}
          <div className="rounded-2xl border dark:border-brand-500/40 border-brand-200 dark:bg-brand-950/20 bg-indigo-50/30 p-4">
            <div className="flex items-center justify-between border-b dark:border-white/10 border-slate-200 pb-2 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-300 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-brand-500" />
                Repaired Roadmap (v{diff.new_version})
              </span>
              <span className="text-[10px] font-semibold text-brand-600 dark:text-brand-400">{diff.new_path.length} steps</span>
            </div>

            <div className="space-y-2">
              {diff.new_path.map((node) => {
                const isInserted = diff.inserted_nodes.some(n => n.node_id === node.node_id);
                const isReordered = diff.reordered_nodes.some(r => r.node_id === node.node_id);

                return (
                  <div
                    key={node.node_id}
                    className={`flex items-center justify-between rounded-xl border p-2.5 text-xs transition-all ${
                      isInserted
                        ? 'border-rose-500/60 bg-rose-500/20 text-rose-700 dark:text-rose-100 shadow-md shadow-rose-500/10'
                        : isReordered
                        ? 'border-amber-500/50 bg-amber-500/15 text-amber-700 dark:text-amber-100'
                        : 'dark:border-white/5 border-slate-200 dark:bg-surface-200/50 bg-white text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                        isInserted
                          ? 'bg-rose-500 text-white'
                          : isReordered
                          ? 'bg-amber-500 text-slate-950'
                          : 'dark:bg-white/10 bg-slate-200 dark:text-slate-300 text-slate-700'
                      }`}>
                        {node.step_order}
                      </span>
                      <span className="font-medium truncate">{node.skill_name || node.skill_id}</span>
                      {isInserted && (
                        <span className="rounded bg-rose-500/40 px-1.5 py-0.5 text-[9px] font-bold text-white uppercase tracking-wider">
                          ✨ Inserted
                        </span>
                      )}
                      {isReordered && !isInserted && (
                        <span className="rounded bg-amber-500/30 px-1.5 py-0.5 text-[9px] font-bold text-amber-600 dark:text-amber-300 uppercase tracking-wider">
                          ⚡ Shifted
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${
                        node.status === 'completed'
                          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300'
                          : node.status === 'in_progress'
                          ? 'bg-amber-500/15 text-amber-600 dark:text-amber-300'
                          : 'dark:bg-slate-800 bg-slate-200 dark:text-slate-400 text-slate-600'
                      }`}>
                        {node.status}
                      </span>
                      <span className="font-mono text-[11px] dark:text-slate-400 text-slate-500">
                        P(L)={node.mastery_prob?.toFixed(2) ?? '0.10'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* Unified Diff View */
        <div className="relative z-10 rounded-2xl border dark:border-white/10 border-slate-200 dark:bg-surface-300/40 bg-slate-50 p-4 space-y-2">
          {diff.new_path.map((node) => {
            const isInserted = diff.inserted_nodes.some(n => n.node_id === node.node_id);
            const isReordered = diff.reordered_nodes.some(r => r.node_id === node.node_id);
            const oldReorder = diff.reordered_nodes.find(r => r.node_id === node.node_id);

            return (
              <div
                key={node.node_id}
                className={`flex items-center justify-between rounded-xl border p-3 text-xs ${
                  isInserted
                    ? 'border-rose-500/60 bg-rose-500/15 text-rose-700 dark:text-rose-100'
                    : isReordered
                    ? 'border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-100'
                    : 'dark:border-white/5 border-slate-200 dark:bg-surface-200/50 bg-white text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`font-mono font-bold text-sm ${
                    isInserted ? 'text-rose-500' : isReordered ? 'text-amber-500' : 'text-slate-400'
                  }`}>
                    {isInserted ? '+ ' : isReordered ? '~ ' : '  '}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold dark:text-white text-slate-900">{node.skill_name || node.skill_id}</span>
                      {isInserted && <span className="text-[10px] font-bold text-rose-500">[REMEDIAL INTERVENTION]</span>}
                      {isReordered && !isInserted && (
                        <span className="text-[10px] font-bold text-amber-500">
                          [ORDER CHANGED: Step {oldReorder?.old_step_order} → Step {oldReorder?.new_step_order}]
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] dark:text-slate-400 text-slate-500 mt-0.5">
                      Estimated Duration: {node.estimated_minutes} mins • Status: {node.status}
                    </p>
                  </div>
                </div>

                <div className="font-mono text-xs dark:text-slate-300 text-slate-700 font-semibold">
                  Mastery: {node.mastery_prob?.toFixed(2)}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer Controls */}
      <div className="relative z-10 mt-5 flex flex-wrap items-center justify-between gap-3 border-t dark:border-white/10 border-slate-200 pt-4">
        <span className="text-xs dark:text-slate-400 text-slate-500">
          Triggered by node: <strong className="dark:text-white text-slate-900">{diff.trigger_skill_id}</strong>
        </span>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (diff.inserted_nodes.length > 0) {
                openAssessment(diff.inserted_nodes[0].skill_id);
              } else {
                openAssessment(diff.trigger_skill_id);
              }
            }}
            className="flex items-center gap-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-brand-500/25 transition-all"
          >
            <Zap className="h-3.5 w-3.5" />
            <span>Practice Remedial Node</span>
          </button>
          
          <button
            onClick={dismissDiffCard}
            className="rounded-xl border dark:border-white/10 border-slate-200 dark:bg-surface-200 bg-slate-100 px-3.5 py-2 text-xs font-medium dark:text-slate-300 text-slate-700 hover:dark:bg-surface-100 hover:bg-slate-200 dark:hover:text-white transition-all"
          >
            Accept & Continue
          </button>
        </div>
      </div>
    </div>
  );
}
