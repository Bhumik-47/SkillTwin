'use client';

import React from 'react';
import { useSkillTwin } from '../../lib/state/store';
import MilestoneHero from './MilestoneHero';
import PlanDiffCard from '../repair/PlanDiffCard';
import {
  CheckCircle2,
  Lock,
  Zap,
  Clock,
  ChevronRight
} from 'lucide-react';

export default function RoadmapView() {
  const {
    currentPath,
    activeRepairDiff,
    masteryMap,
    openAssessment,
    setSelectedSkillId
  } = useSkillTwin();

  if (!currentPath) {
    return (
      <div className="flex h-64 items-center justify-center rounded-3xl border dark:border-white/10 border-slate-200 dark:bg-surface-200 bg-white">
        <p className="text-sm dark:text-slate-400 text-slate-500">Loading personalized learning path...</p>
      </div>
    );
  }

  const completedCount = currentPath.nodes.filter(n => n.status === 'completed').length;
  const progressPct = currentPath.nodes.length > 0
    ? Math.round((completedCount / currentPath.nodes.length) * 100)
    : 0;

  return (
    <div className="space-y-8">
      
      {/* 1. Dynamic Plan Diff Card (if adaptation occurred) */}
      {activeRepairDiff && <PlanDiffCard />}

      {/* 2. Hero Spotlight for Active Milestone */}
      <MilestoneHero />

      {/* 3. Full Sequenced Learning Timeline */}
      <div className="rounded-3xl border dark:border-white/10 border-slate-200 dark:bg-surface-200/50 bg-white p-6 shadow-sm backdrop-blur-xl transition-colors">
        
        {/* Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b dark:border-white/10 border-slate-200 pb-4">
          <div>
            <h3 className="text-lg font-bold dark:text-white text-slate-900 tracking-tight">
              Topological Learning Path (Version {currentPath.version})
            </h3>
            <p className="text-xs dark:text-slate-400 text-slate-500 mt-0.5">
              Guaranteed zero circular prerequisite violations • Total estimated time: {currentPath.total_estimated_minutes} mins
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-xs font-semibold dark:text-slate-300 text-slate-700">
                {completedCount} of {currentPath.nodes.length} Mastered
              </span>
              <span className="block font-mono text-[11px] text-brand-500 dark:text-brand-300 font-bold">
                {progressPct}% Completion
              </span>
            </div>
            <div className="h-10 w-10 rounded-full border-2 border-brand-500/40 p-0.5 flex items-center justify-center">
              <span className="text-[11px] font-bold dark:text-white text-slate-900">{progressPct}%</span>
            </div>
          </div>
        </div>

        {/* Timeline Sequence */}
        <div className="mt-6 space-y-4">
          {currentPath.nodes.map((node, index) => {
            const mastery = masteryMap.get(node.skill_id) ?? node.mastery_prob ?? 0.10;
            const isCompleted = node.status === 'completed' || mastery >= 0.80;
            const isInProgress = node.status === 'in_progress';
            const isReady = node.status === 'ready';
            const isLocked = node.status === 'locked';

            return (
              <div key={node.node_id} className="relative">
                
                {/* Connecting Line */}
                {index < currentPath.nodes.length - 1 && (
                  <div className="absolute left-6 top-14 bottom-0 -mb-4 w-0.5 bg-gradient-to-b dark:from-white/15 dark:to-white/5 from-slate-300 to-slate-200 z-0" />
                )}

                {/* Node Step Card */}
                <div className={`relative z-10 flex flex-wrap sm:flex-nowrap items-start justify-between gap-4 rounded-2xl border p-4 backdrop-blur-xl transition-all duration-200 ${
                  node.is_inserted
                    ? 'border-rose-500/60 dark:bg-rose-950/20 bg-rose-50/70 shadow-md shadow-rose-500/10'
                    : isInProgress
                    ? 'border-amber-500/60 dark:bg-amber-950/20 bg-amber-50/70 shadow-md shadow-amber-500/10 ring-1 ring-amber-500/30'
                    : isCompleted
                    ? 'border-emerald-500/40 dark:bg-emerald-950/15 bg-emerald-50/50'
                    : isReady
                    ? 'border-cyan-500/40 dark:bg-cyan-950/10 bg-cyan-50/50'
                    : 'dark:border-white/5 border-slate-200 dark:bg-surface-300/30 bg-slate-50 opacity-70'
                }`}>
                  
                  {/* Left: Step badge + info */}
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border font-mono text-xs font-bold ${
                      isCompleted
                        ? 'border-emerald-500/50 bg-emerald-500/20 text-emerald-600 dark:text-emerald-300'
                        : isInProgress
                        ? 'border-amber-500/50 bg-amber-500/20 text-amber-600 dark:text-amber-300 animate-pulse'
                        : isReady
                        ? 'border-cyan-500/50 bg-cyan-500/20 text-cyan-600 dark:text-cyan-300'
                        : 'dark:border-slate-700 border-slate-300 dark:bg-slate-800 bg-slate-200 dark:text-slate-400 text-slate-600'
                    }`}>
                      {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : node.step_order}
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4
                          onClick={() => setSelectedSkillId(node.skill_id)}
                          className="text-sm font-bold dark:text-white text-slate-900 hover:text-brand-500 dark:hover:text-brand-300 cursor-pointer truncate transition-colors"
                        >
                          {node.skill_name}
                        </h4>

                        {/* Badges */}
                        {node.is_inserted && (
                          <span className="rounded bg-rose-500/20 px-2 py-0.5 text-[9px] font-extrabold uppercase text-rose-600 dark:text-rose-300 border border-rose-500/40">
                            ✨ Remedial Patch
                          </span>
                        )}
                        {node.is_reordered && !node.is_inserted && (
                          <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[9px] font-bold text-amber-600 dark:text-amber-300 border border-amber-500/30">
                            ⚡ Reordered
                          </span>
                        )}
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${
                          isCompleted
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300'
                            : isInProgress
                            ? 'bg-amber-500/15 text-amber-600 dark:text-amber-300'
                            : isReady
                            ? 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-300'
                            : 'dark:bg-slate-800 bg-slate-200 dark:text-slate-400 text-slate-600'
                        }`}>
                          {node.status.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="mt-1 flex flex-wrap items-center gap-3 text-xs dark:text-slate-400 text-slate-500">
                        <span className="flex items-center gap-1 font-mono">
                          P(L) = <strong className={isCompleted ? 'text-emerald-500' : 'dark:text-slate-200 text-slate-800'}>{(mastery * 100).toFixed(0)}%</strong>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {node.estimated_minutes} mins
                        </span>
                        {node.prerequisite_skill_ids.length > 0 && (
                          <>
                            <span>•</span>
                            <span className="text-[11px] dark:text-slate-400 text-slate-500">
                              Prereqs: {node.prerequisite_skill_ids.join(', ')}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 shrink-0 self-center">
                    {!isLocked && (
                      <button
                        onClick={() => openAssessment(node.skill_id)}
                        className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold shadow-md transition-all active:scale-95 ${
                          isInProgress
                            ? 'bg-brand-600 hover:bg-brand-500 text-white shadow-brand-500/25'
                            : 'border dark:border-white/15 border-slate-300 dark:bg-surface-100 bg-white hover:bg-slate-50 dark:hover:bg-white/10 dark:text-slate-200 text-slate-700'
                        }`}
                      >
                        <Zap className="h-3.5 w-3.5" />
                        <span>{isCompleted ? 'Re-Assess' : 'Start Quiz'}</span>
                      </button>
                    )}

                    <button
                      onClick={() => setSelectedSkillId(node.skill_id)}
                      className="flex h-8 w-8 items-center justify-center rounded-xl border dark:border-white/10 border-slate-200 dark:bg-surface-200 bg-white dark:text-slate-400 text-slate-500 hover:text-brand-500 dark:hover:text-white transition-all"
                      title="Inspect Node Details"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
