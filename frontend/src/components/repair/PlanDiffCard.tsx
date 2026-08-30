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
  Layers,
  HelpCircle
} from 'lucide-react';

export default function PlanDiffCard() {
  const { activeRepairDiff, dismissDiffCard, openAssessment } = useSkillTwin();
  const [viewMode, setViewMode] = useState<'side_by_side' | 'unified'>('side_by_side');

  if (!activeRepairDiff) return null;

  const diff: PathRepairDiff = activeRepairDiff;
  const isFailureTrigger = diff.trigger_event === 'assessment_failed';

  // Defensive fallbacks to prevent runtime crashes
  const oldPath = diff.old_path || [];
  const newPath = diff.new_path || [];
  const insertedNodes = diff.inserted_nodes || [];
  const unchangedNodes = diff.unchanged_nodes || [];
  const triggerSkillName = (diff.trigger_skill_id || 'recent chapter').replace(/_/g, ' ');

  const metrics = diff.metrics || {
    touched_node_count: insertedNodes.length || 1,
    total_node_count: newPath.length || 1,
    unchanged_node_count: unchangedNodes.length || Math.max(0, newPath.length - insertedNodes.length),
    repair_ratio: 0.2
  };

  return (
    <div className={`relative overflow-hidden rounded-3xl border p-6 shadow-xl transition-all ${
      isFailureTrigger
        ? 'border-rose-500/40 dark:bg-[#0c1220] bg-white'
        : 'border-emerald-500/40 dark:bg-[#09151c] bg-white'
    }`}>
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b dark:border-white/10 border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <div className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${
            isFailureTrigger
              ? 'border-rose-500/40 bg-rose-500/15 text-rose-500'
              : 'border-emerald-500/40 bg-emerald-500/15 text-emerald-500'
          }`}>
            {isFailureTrigger ? <Sparkles className="h-6 w-6" /> : <CheckCircle2 className="h-6 w-6" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${
                isFailureTrigger
                  ? 'bg-rose-500/20 text-rose-600 dark:text-rose-300 border-rose-500/30'
                  : 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border-emerald-500/30'
              }`}>
                {isFailureTrigger ? 'Plan Adjusted' : '🎉 Quiz Passed'}
              </span>
              <span className="text-xs dark:text-slate-400 text-slate-500">
                Version {diff.previous_version || 1} → {diff.new_version || 2}
              </span>
            </div>
            <h3 className="text-lg font-bold dark:text-white text-slate-900 mt-0.5 tracking-tight">
              {isFailureTrigger ? 'Extra Practice Chapter Added' : 'Next Chapters Unlocked'}
            </h3>
          </div>
        </div>

        {/* View Switcher & Actions */}
        <div className="flex items-center gap-2">
          <div className="flex rounded-xl border dark:border-white/10 border-slate-200 dark:bg-surface-100 bg-slate-100 p-1">
            <button
              onClick={() => setViewMode('side_by_side')}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition-all ${
                viewMode === 'side_by_side'
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'dark:text-slate-400 text-slate-600 hover:dark:text-white hover:text-slate-900'
              }`}
            >
              Side-by-Side
            </button>
            <button
              onClick={() => setViewMode('unified')}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition-all ${
                viewMode === 'unified'
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'dark:text-slate-400 text-slate-600 hover:dark:text-white hover:text-slate-900'
              }`}
            >
              Summary List
            </button>
          </div>

          <button
            onClick={dismissDiffCard}
            className="rounded-xl border dark:border-white/10 border-slate-200 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 transition-all"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Quick Summary Cards */}
      <div className="my-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-2xl border dark:border-white/5 border-slate-200 dark:bg-surface-100 bg-slate-50 p-3">
          <span className="text-[11px] uppercase tracking-wider dark:text-slate-400 text-slate-500 font-semibold block">
            Topics Adjusted
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-extrabold text-rose-500 font-mono">
              {metrics.touched_node_count || 1}
            </span>
            <span className="text-xs dark:text-slate-400 text-slate-500">
              of {metrics.total_node_count || newPath.length} total
            </span>
          </div>
        </div>

        <div className="rounded-2xl border dark:border-white/5 border-slate-200 dark:bg-surface-100 bg-slate-50 p-3">
          <span className="text-[11px] uppercase tracking-wider dark:text-slate-400 text-slate-500 font-semibold block">
            Unchanged Chapters
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-extrabold text-emerald-500 font-mono">
              {metrics.unchanged_node_count ?? 0}
            </span>
            <span className="text-xs dark:text-slate-400 text-slate-500">
              preserved
            </span>
          </div>
        </div>

        <div className="rounded-2xl border dark:border-white/5 border-slate-200 dark:bg-surface-100 bg-slate-50 p-3">
          <span className="text-[11px] uppercase tracking-wider dark:text-slate-400 text-slate-500 font-semibold block">
            Extra Practice Added
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-extrabold text-amber-500 font-mono">
              {insertedNodes.length}
            </span>
            <span className="text-xs dark:text-slate-400 text-slate-500">
              new chapter
            </span>
          </div>
        </div>

        <div className="rounded-2xl border dark:border-white/5 border-slate-200 dark:bg-surface-100 bg-slate-50 p-3">
          <span className="text-[11px] uppercase tracking-wider dark:text-slate-400 text-slate-500 font-semibold block">
            Plan Progress
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-extrabold text-cyan-400 font-mono">
              {metrics.total_node_count ? Math.round(((metrics.unchanged_node_count || 0) / metrics.total_node_count) * 100) : 100}%
            </span>
            <span className="text-xs dark:text-slate-400 text-slate-500">
              on track
            </span>
          </div>
        </div>
      </div>

      {/* Why your plan was updated notice */}
      <div className="mb-5 rounded-2xl border border-brand-500/20 dark:bg-brand-950/30 bg-indigo-50/70 p-4">
        <div className="flex items-center gap-2 text-xs font-bold text-brand-600 dark:text-brand-300 mb-1">
          <Sparkles className="h-4 w-4 text-brand-500" />
          <span>Why your plan was updated</span>
        </div>
        <p className="text-xs dark:text-slate-300 text-slate-700 leading-relaxed">
          {diff.explanation || 'Based on your recent quiz results, we inserted an extra practice topic to help you build mastery before moving on to harder concepts.'}
        </p>
      </div>

      {/* Plan Visualizer (Side by Side or Summary) */}
      {viewMode === 'side_by_side' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Previous Plan */}
          <div className="rounded-2xl border dark:border-white/10 border-slate-200 dark:bg-surface-100 bg-slate-50 p-4">
            <div className="flex items-center justify-between border-b dark:border-white/10 border-slate-200 pb-2 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider dark:text-slate-400 text-slate-600 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                Previous Plan (v{diff.previous_version || 1})
              </span>
              <span className="text-[11px] dark:text-slate-400 text-slate-500">{oldPath.length} chapters</span>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {oldPath.map((node: LearningPathNode, idx: number) => {
                const isTrigger = node.skill_id === diff.trigger_skill_id;
                return (
                  <div
                    key={`old_${node.node_id || node.skill_id}_${idx}`}
                    className={`flex items-center justify-between rounded-xl border p-2.5 text-xs transition-all ${
                      isTrigger
                        ? 'border-rose-500/50 bg-rose-500/15 text-rose-700 dark:text-rose-200'
                        : 'dark:border-white/5 border-slate-200 dark:bg-surface-50 bg-white text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full dark:bg-white/10 bg-slate-200 text-[10px] font-bold">
                        {node.step_order || idx + 1}
                      </span>
                      <span className="font-medium truncate">{node.skill_name || node.skill_id}</span>
                    </div>

                    <span className="text-[11px] dark:text-slate-400 text-slate-500 font-semibold">
                      {Math.round((node.mastery_prob || 0.1) * 100)}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Updated Plan */}
          <div className="rounded-2xl border dark:border-brand-500/30 border-brand-200 dark:bg-brand-950/20 bg-indigo-50/30 p-4">
            <div className="flex items-center justify-between border-b dark:border-white/10 border-slate-200 pb-2 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-300 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-brand-500" />
                Updated Plan (v{diff.new_version || 2})
              </span>
              <span className="text-[11px] font-semibold text-brand-600 dark:text-brand-400">{newPath.length} chapters</span>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {newPath.map((node: LearningPathNode, idx: number) => {
                const isInserted = insertedNodes.some((n: any) => n.node_id === node.node_id || n.skill_id === node.skill_id);

                return (
                  <div
                    key={`new_${node.node_id || node.skill_id}_${idx}`}
                    className={`flex items-center justify-between rounded-xl border p-2.5 text-xs transition-all ${
                      isInserted
                        ? 'border-rose-500/60 bg-rose-500/20 text-rose-700 dark:text-rose-100 font-semibold'
                        : 'dark:border-white/5 border-slate-200 dark:bg-surface-50 bg-white text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                        isInserted
                          ? 'bg-rose-500 text-white'
                          : 'dark:bg-white/10 bg-slate-200 dark:text-slate-300 text-slate-700'
                      }`}>
                        {node.step_order || idx + 1}
                      </span>
                      <span className="font-medium truncate">{node.skill_name || node.skill_id}</span>
                      {isInserted && (
                        <span className="rounded bg-rose-500/30 px-1.5 py-0.2 text-[9px] font-bold text-rose-600 dark:text-rose-300 uppercase">
                          + Added
                        </span>
                      )}
                    </div>

                    <span className="text-[11px] dark:text-slate-400 text-slate-500 font-semibold">
                      {Math.round((node.mastery_prob || 0.1) * 100)}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* Summary List */
        <div className="rounded-2xl border dark:border-white/10 border-slate-200 dark:bg-surface-100 bg-slate-50 p-4 space-y-2 max-h-80 overflow-y-auto">
          {newPath.map((node: LearningPathNode, idx: number) => {
            const isInserted = insertedNodes.some((n: any) => n.node_id === node.node_id || n.skill_id === node.skill_id);

            return (
              <div
                key={`summary_${node.node_id || node.skill_id}_${idx}`}
                className={`flex items-center justify-between rounded-xl border p-3 text-xs ${
                  isInserted
                    ? 'border-rose-500/60 bg-rose-500/15 text-rose-700 dark:text-rose-100'
                    : 'dark:border-white/5 border-slate-200 dark:bg-surface-50 bg-white text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`font-bold text-sm ${isInserted ? 'text-rose-500' : 'text-slate-400'}`}>
                    {isInserted ? '+ ' : '  '}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold dark:text-white text-slate-900">{node.skill_name || node.skill_id}</span>
                      {isInserted && <span className="text-[10px] font-bold text-rose-500">[NEW PRACTICE ADDED]</span>}
                    </div>
                    <p className="text-[11px] dark:text-slate-400 text-slate-500 mt-0.5">
                      Estimated Duration: ~{node.estimated_minutes || 45} mins
                    </p>
                  </div>
                </div>

                <div className="text-xs dark:text-slate-300 text-slate-700 font-semibold">
                  Skill Level: {Math.round((node.mastery_prob || 0.1) * 100)}%
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer Controls */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t dark:border-white/10 border-slate-200 pt-4">
        <span className="text-xs dark:text-slate-400 text-slate-500">
          Triggered by: <strong className="dark:text-white text-slate-900">{triggerSkillName}</strong>
        </span>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (insertedNodes.length > 0) {
                openAssessment(insertedNodes[0].skill_id);
              } else if (diff.trigger_skill_id) {
                openAssessment(diff.trigger_skill_id);
              } else {
                openAssessment();
              }
            }}
            className="flex items-center gap-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all btn-tactile"
          >
            <Zap className="h-3.5 w-3.5" />
            <span>Practice This Topic</span>
          </button>
          
          <button
            onClick={dismissDiffCard}
            className="rounded-xl border dark:border-white/10 border-slate-200 dark:bg-surface-100 bg-slate-100 px-3.5 py-2 text-xs font-medium dark:text-slate-300 text-slate-700 hover:bg-slate-200 dark:hover:bg-surface-50 transition-all btn-tactile"
          >
            Accept & Continue
          </button>
        </div>
      </div>
    </div>
  );
}
