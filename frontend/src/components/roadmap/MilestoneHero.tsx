'use client';

import React from 'react';
import { useSkillTwin } from '../../lib/state/store';
import {
  Compass,
  Sparkles,
  Zap,
  Clock,
  CheckCircle2,
  Lock,
  ArrowRight
} from 'lucide-react';

export default function MilestoneHero() {
  const {
    currentPath,
    masteryMap,
    openAssessment,
    setSelectedSkillId,
    recommendations,
    skills
  } = useSkillTwin();

  if (!currentPath || currentPath.nodes.length === 0) return null;

  // Find active in-progress node
  const activeNode = currentPath.nodes.find(n => n.status === 'in_progress') || currentPath.nodes.find(n => n.status === 'ready') || currentPath.nodes[0];
  const skill = skills.find(s => s.id === activeNode.skill_id);
  const masteryProb = masteryMap.get(activeNode.skill_id) ?? activeNode.mastery_prob ?? 0.10;

  const topRec = recommendations[0];

  return (
    <div className="relative overflow-hidden rounded-3xl border dark:border-brand-500/30 border-brand-200 dark:bg-gradient-to-br dark:from-[#12192e] dark:via-surface-200 dark:to-[#0b101e] bg-gradient-to-br from-indigo-50/70 via-white to-sky-50/50 p-6 shadow-xl backdrop-blur-xl transition-colors">
      
      {/* Background radial accent glow */}
      <div className="pointer-events-none absolute top-0 right-0 h-96 w-96 rounded-full bg-brand-500/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />

      <div className="relative z-10 grid grid-cols-1 gap-6 lg:grid-cols-3">
        
        {/* Left: Active Milestone Info */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-full bg-brand-500/15 px-3 py-1 text-[11px] font-bold text-brand-600 dark:text-brand-300 border border-brand-500/30">
              <Compass className="h-3.5 w-3.5 text-brand-500" />
              Current Milestone • Step {activeNode.step_order} of {currentPath.nodes.length}
            </span>
            {activeNode.is_remedial && (
              <span className="rounded-full bg-rose-500/20 px-2.5 py-0.5 text-[10px] font-extrabold uppercase text-rose-500 dark:text-rose-300 border border-rose-500/40 animate-pulse">
                Remedial Intervention
              </span>
            )}
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold dark:text-white text-slate-900 tracking-tight">
              {activeNode.skill_name}
            </h2>
            <p className="mt-2 text-xs sm:text-sm dark:text-slate-300 text-slate-600 leading-relaxed max-w-xl">
              {skill?.description || 'Core competency in current learning sequence.'}
            </p>
          </div>

          {/* Prerequisites Status Bar */}
          <div className="flex flex-wrap items-center gap-2 text-xs dark:text-slate-400 text-slate-500 pt-1">
            <span className="font-medium dark:text-slate-300 text-slate-700">Prerequisites:</span>
            {activeNode.prerequisite_skill_ids.length === 0 ? (
              <span className="text-emerald-500 font-medium">None (Root Topic)</span>
            ) : (
              activeNode.prerequisite_skill_ids.map(prId => {
                const prMastery = masteryMap.get(prId) ?? 0.10;
                const isPrMastered = prMastery >= 0.80;
                return (
                  <span
                    key={prId}
                    className={`inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[11px] border ${
                      isPrMastered
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border-emerald-500/30'
                        : 'dark:bg-slate-800 bg-slate-200 dark:text-slate-400 text-slate-600 border-slate-300 dark:border-slate-700'
                    }`}
                  >
                    {isPrMastered ? <CheckCircle2 className="h-3 w-3 text-emerald-500" /> : <Lock className="h-3 w-3" />}
                    {prId.replace(/_/g, ' ')}
                  </span>
                );
              })
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => openAssessment(activeNode.skill_id)}
              className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 px-5 py-3 text-xs font-bold text-white shadow-xl shadow-brand-500/25 transition-all active:scale-95"
            >
              <Zap className="h-4 w-4" />
              <span>Verify & Take Milestone Quiz</span>
            </button>

            <button
              onClick={() => setSelectedSkillId(activeNode.skill_id)}
              className="flex items-center gap-1.5 rounded-2xl border dark:border-white/15 border-slate-300 dark:bg-surface-200/80 bg-white hover:bg-slate-50 dark:hover:bg-white/10 px-4 py-3 text-xs font-semibold dark:text-slate-200 text-slate-700 transition-all shadow-sm"
            >
              <span>Explore Knowledge DAG</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Right: BKT Mastery Gauge & Top AI Recommendation */}
        <div className="flex flex-col justify-between rounded-2xl border dark:border-white/10 border-slate-200 dark:bg-surface-300/60 bg-white/80 p-5 backdrop-blur-xl">
          <div>
            <div className="flex items-center justify-between border-b dark:border-white/10 border-slate-200 pb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider dark:text-slate-400 text-slate-500">
                Latent Mastery $P(L)$
              </span>
              <span className="font-mono text-xl font-black text-brand-600 dark:text-brand-300">
                {(masteryProb * 100).toFixed(0)}%
              </span>
            </div>

            <div className="mt-3">
              <div className="flex justify-between text-[11px] dark:text-slate-400 text-slate-500 mb-1">
                <span>Current Posterior</span>
                <span>Threshold: 80%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full dark:bg-surface-100 bg-slate-200">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-brand-500 to-cyan-400 transition-all duration-500"
                  style={{ width: `${Math.max(8, masteryProb * 100)}%` }}
                />
              </div>
            </div>

            {/* AI Grounded Next Step */}
            {topRec && (
              <div className="mt-4 rounded-xl border dark:border-brand-500/20 border-brand-200 dark:bg-brand-950/30 bg-brand-50/50 p-3">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-brand-600 dark:text-brand-300">
                  <Sparkles className="h-3 w-3 text-brand-500" />
                  <span>Next Recommended Action</span>
                </div>
                <p className="mt-1 text-[11px] dark:text-slate-300 text-slate-600 line-clamp-3 leading-relaxed">
                  {topRec.grounded_explanation}
                </p>
              </div>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between text-[11px] dark:text-slate-400 text-slate-500 border-t dark:border-white/10 border-slate-200 pt-3">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              Est. Duration: {activeNode.estimated_minutes}m
            </span>
            <span className="dark:text-slate-300 text-slate-700 font-medium">Path v{currentPath.version}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
