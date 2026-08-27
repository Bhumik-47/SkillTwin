'use client';

import React from 'react';
import { useSkillTwin } from '../../lib/state/store';
import { DEFAULT_BKT_PARAMS } from '../../lib/engine/bkt';
import {
  Calculator,
  X
} from 'lucide-react';

export default function BKTFormulaVisualizer() {
  const { isBktModalOpen, closeBktModal, latestBktResult, selectedSkillId, masteryMap, skills } = useSkillTwin();

  if (!isBktModalOpen) return null;

  const currentSkill = skills.find(s => s.id === selectedSkillId) || skills[0];
  const priorPL = latestBktResult?.prior_p_l ?? (masteryMap.get(currentSkill?.id || '') ?? 0.40);
  const posteriorPL = latestBktResult?.posterior_after_transition ?? 0.22;
  const isCorrect = latestBktResult?.is_correct ?? false;

  const { p_transit, p_slip, p_guess, threshold } = DEFAULT_BKT_PARAMS;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border dark:border-cyan-500/30 border-cyan-200 dark:bg-[#0c1322] bg-white p-6 shadow-2xl backdrop-blur-2xl transition-colors">
        
        {/* Background glow */}
        <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-cyan-500/15 blur-3xl" />

        {/* Header */}
        <div className="flex items-center justify-between border-b dark:border-white/10 border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border dark:border-cyan-500/40 border-cyan-300 dark:bg-cyan-500/10 bg-cyan-50 text-cyan-600 dark:text-cyan-300">
              <Calculator className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold dark:text-white text-slate-900">
                Bayesian Knowledge Tracing (BKT) Engine
              </h3>
              <p className="text-xs dark:text-slate-400 text-slate-500">
                Cognitive Learner Modeling • Exact Mathematical Breakdown
              </p>
            </div>
          </div>

          <button
            onClick={closeBktModal}
            className="rounded-xl border dark:border-white/10 border-slate-200 dark:bg-surface-200 bg-slate-100 p-1.5 dark:text-slate-400 text-slate-600 hover:text-slate-900 dark:hover:text-white transition-all"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Step-by-Step Bayes Equations */}
        <div className="mt-5 space-y-4 text-xs">
          
          {/* 1. Evidence Step */}
          <div className="rounded-2xl border dark:border-white/10 border-slate-200 dark:bg-surface-300/40 bg-slate-50 p-4">
            <span className="font-semibold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 text-[10px]">
              Step 1: Posterior Likelihood from Evidence
            </span>
            <p className="dark:text-slate-300 text-slate-700 mt-1">
              Observation: <strong className={isCorrect ? 'text-emerald-500' : 'text-rose-500'}>{isCorrect ? 'Correct Response (Pass)' : 'Incorrect Response (Miss)'}</strong>
            </p>

            <div className="mt-3 rounded-xl border dark:border-white/10 border-slate-200 dark:bg-[#080d19] bg-slate-900 p-3 font-mono text-[11px] text-slate-200">
              {isCorrect ? (
                <div>
                  <p className="text-cyan-300">P(L_t+1 | Correct) = [P(L) × (1 - P(S))] / [P(L) × (1 - P(S)) + (1 - P(L)) × P(G)]</p>
                  <p className="text-slate-400 mt-1">
                    = [{priorPL} × (1 - {p_slip})] / [{priorPL} × (1 - {p_slip}) + (1 - {priorPL}) × {p_guess}]
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-rose-300">P(L_t+1 | Incorrect) = [P(L) × P(S)] / [P(L) × P(S) + (1 - P(L)) × (1 - P(G))]</p>
                  <p className="text-slate-400 mt-1">
                    = [{priorPL} × {p_slip}] / [{priorPL} × {p_slip} + (1 - {priorPL}) × (1 - {p_guess})]
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* 2. Transition Step */}
          <div className="rounded-2xl border dark:border-white/10 border-slate-200 dark:bg-surface-300/40 bg-slate-50 p-4">
            <span className="font-semibold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 text-[10px]">
              Step 2: Learning Transition Opportunity
            </span>
            <p className="dark:text-slate-300 text-slate-700 mt-1">
              Accounting for skill acquisition probability $P(T) = {p_transit}$:
            </p>

            <div className="mt-3 rounded-xl border dark:border-white/10 border-slate-200 dark:bg-[#080d19] bg-slate-900 p-3 font-mono text-[11px] text-slate-200">
              <p className="text-brand-300">P(L_t+1) = P(L_t+1 | Evidence) + (1 - P(L_t+1 | Evidence)) × P(T)</p>
              <p className="text-slate-400 mt-1">
                Final Posterior = <strong className="text-white">{posteriorPL.toFixed(2)}</strong> (Threshold: {threshold.toFixed(2)})
              </p>
            </div>
          </div>

          {/* Parameters Table */}
          <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
            <div className="rounded-xl border dark:border-white/10 border-slate-200 dark:bg-surface-200/60 bg-slate-50 p-2">
              <span className="dark:text-slate-400 text-slate-500 block">P(L_0) Prior</span>
              <strong className="dark:text-white text-slate-900 text-xs">{priorPL.toFixed(2)}</strong>
            </div>
            <div className="rounded-xl border dark:border-white/10 border-slate-200 dark:bg-surface-200/60 bg-slate-50 p-2">
              <span className="dark:text-slate-400 text-slate-500 block">P(T) Transit</span>
              <strong className="dark:text-white text-slate-900 text-xs">{p_transit.toFixed(2)}</strong>
            </div>
            <div className="rounded-xl border dark:border-white/10 border-slate-200 dark:bg-surface-200/60 bg-slate-50 p-2">
              <span className="dark:text-slate-400 text-slate-500 block">P(S) Slip</span>
              <strong className="dark:text-white text-slate-900 text-xs">{p_slip.toFixed(2)}</strong>
            </div>
            <div className="rounded-xl border dark:border-white/10 border-slate-200 dark:bg-surface-200/60 bg-slate-50 p-2">
              <span className="dark:text-slate-400 text-slate-500 block">P(G) Guess</span>
              <strong className="dark:text-white text-slate-900 text-xs">{p_guess.toFixed(2)}</strong>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={closeBktModal}
            className="rounded-xl bg-brand-600 px-5 py-2 text-xs font-semibold text-white shadow-md hover:bg-brand-500 transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
