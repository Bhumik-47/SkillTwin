'use client';

import React from 'react';
import { useSkillTwin } from '../../lib/state/store';
import PlanDiffCard from './PlanDiffCard';
import {
  GitCompare,
  RotateCcw,
  ShieldCheck,
  Code
} from 'lucide-react';

export default function RepairStudio() {
  const {
    currentPath,
    activeRepairDiff,
    resetDomainState,
    openAssessment
  } = useSkillTwin();

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="rounded-3xl border dark:border-brand-500/30 border-brand-200 dark:bg-gradient-to-r dark:from-brand-950/40 dark:via-surface-200/60 dark:to-surface-200/40 bg-gradient-to-r from-brand-50/70 via-white to-sky-50/40 p-6 backdrop-blur-xl shadow-xl transition-colors">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-brand-500/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-600 dark:text-brand-300 border border-brand-500/30">
                Path Adaptation
              </span>
              <span className="text-xs dark:text-slate-400 text-slate-500 font-mono">Local Subgraph Repair</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight dark:text-white text-slate-900 mt-1">
              Curriculum Adaptation & Repair
            </h2>
            <p className="text-xs dark:text-slate-300 text-slate-600 mt-1 leading-relaxed">
              When assessment evidence updates your latent skill mastery, the planner performs localized repair to insert remedial practice or unlock downstream milestones without discarding the existing plan.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => openAssessment()}
              className="rounded-xl bg-brand-600 hover:bg-brand-500 px-4 py-2 text-xs font-bold text-white shadow-md shadow-brand-500/20 transition-all active:scale-95"
            >
              Take Assessment
            </button>
            <button
              onClick={resetDomainState}
              title="Reset state to initial domain layout"
              className="flex h-9 w-9 items-center justify-center rounded-xl border dark:border-white/10 border-slate-200 dark:bg-surface-200 bg-white dark:text-slate-400 text-slate-600 hover:text-slate-900 dark:hover:text-white transition-all shadow-sm"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Active Diff Card */}
      {activeRepairDiff ? (
        <PlanDiffCard />
      ) : (
        <div className="rounded-3xl border dark:border-white/10 border-slate-200 dark:bg-surface-200/40 bg-white p-8 text-center backdrop-blur-xl shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-brand-500/30 bg-brand-500/10 text-brand-500 shadow-inner">
            <GitCompare className="h-7 w-7" />
          </div>
          <h3 className="text-base font-bold dark:text-white text-slate-900 mt-4">Current Roadmap is Optimal</h3>
          <p className="text-xs dark:text-slate-400 text-slate-500 mt-1 max-w-md mx-auto">
            Take an assessment to submit new evidence. If your mastery probability shifts, the local repair engine will display the exact path diff here.
          </p>
          <div className="mt-5 flex justify-center gap-3">
            <button
              onClick={() => openAssessment()}
              className="rounded-xl bg-brand-600 hover:bg-brand-500 px-4 py-2 text-xs font-bold text-white shadow-md"
            >
              Start Practice Quiz
            </button>
          </div>
        </div>
      )}

      {/* Comparison Matrix */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        
        {/* Local Repair Strategy */}
        <div className="rounded-3xl border dark:border-white/10 border-slate-200 dark:bg-surface-200/60 bg-white p-5 backdrop-blur-xl shadow-sm">
          <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400 text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldCheck className="h-4 w-4" />
            <span>Topological Invariant</span>
          </div>
          <h4 className="text-sm font-bold dark:text-white text-slate-900">Local Subgraph Surgery</h4>
          <p className="text-xs dark:text-slate-300 text-slate-600 mt-2 leading-relaxed">
            Standard course recommenders regenerate the entire roadmap when a learner struggles. SkillTwin isolates the affected node's reachable subgraph, inserting targeted remedial drills while preserving stable milestones.
          </p>
          <div className="mt-4 rounded-xl border dark:border-white/10 border-slate-200 dark:bg-surface-300/50 bg-slate-100 p-3 text-[11px] font-mono dark:text-slate-300 text-slate-700">
            <code>touched_nodes = removed + inserted + reordered</code>
          </div>
        </div>

        {/* Live Repair Diff JSON Inspector */}
        <div className="rounded-3xl border dark:border-white/10 border-slate-200 dark:bg-surface-200/60 bg-white p-5 backdrop-blur-xl shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between border-b dark:border-white/10 border-slate-200 pb-3 mb-3">
            <div className="flex items-center gap-2">
              <Code className="h-4 w-4 text-cyan-500" />
              <h4 className="text-xs font-bold uppercase tracking-wider dark:text-slate-200 text-slate-700">
                `PathRepairDiff` Object Payload
              </h4>
            </div>
            <span className="text-[10px] dark:text-slate-400 text-slate-500 font-mono">
              /shared/schema.md § 2.13
            </span>
          </div>

          <div className="rounded-2xl border dark:border-white/10 border-slate-200 dark:bg-surface-300/90 bg-slate-900 p-3 font-mono text-[11px] text-slate-300 max-h-56 overflow-y-auto">
            <pre>
              {JSON.stringify(
                activeRepairDiff || {
                  repair_id: null,
                  path_id: currentPath?.id || null,
                  status: "standing_by",
                  message: "Take an assessment to generate live adaptation diff"
                },
                null,
                2
              )}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
