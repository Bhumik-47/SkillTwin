'use client';

import React from 'react';
import { useSkillTwin } from '../../lib/state/store';
import { DEFAULT_BKT_PARAMS } from '../../lib/engine/bkt';
import {
  Calculator,
  X,
  HelpCircle,
  Sparkles
} from 'lucide-react';

export default function BKTFormulaVisualizer() {
  const { isBktModalOpen, closeBktModal, latestBktResult, selectedSkillId, masteryMap, skills } = useSkillTwin();

  if (!isBktModalOpen) return null;

  const currentSkill = skills.find(s => s.id === selectedSkillId) || skills[0];
  const priorPL = latestBktResult?.prior_p_l ?? (masteryMap.get(currentSkill?.id || '') ?? 0.40);
  const posteriorPL = latestBktResult?.posterior_after_transition ?? 0.85;
  const isCorrect = latestBktResult?.is_correct ?? true;

  const { p_transit, p_slip, p_guess, threshold } = DEFAULT_BKT_PARAMS;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border dark:border-white/15 border-slate-300 dark:bg-[#0b101b] bg-white p-6 shadow-2xl animate-modal-reveal">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b dark:border-white/10 border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border dark:border-cyan-500/40 border-cyan-300 dark:bg-cyan-500/10 bg-cyan-50 text-cyan-600 dark:text-cyan-300 shadow-sm">
              <Calculator className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold dark:text-white text-slate-900 tracking-tight">
                How Your Skill Score is Calculated
              </h3>
              <p className="text-xs dark:text-slate-400 text-slate-500 font-medium">
                Transparent Adaptive Progress Tracking
              </p>
            </div>
          </div>

          <button
            onClick={closeBktModal}
            className="rounded-xl border dark:border-white/10 border-slate-200 dark:bg-surface-50 bg-slate-100 p-1.5 dark:text-slate-400 text-slate-600 hover:text-slate-900 dark:hover:text-white transition-all active:scale-[0.95]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Plain Language Summary */}
        <div className="mt-4 rounded-2xl border border-brand-500/20 dark:bg-brand-950/20 bg-indigo-50/70 p-4 text-xs space-y-2">
          <div className="flex items-center gap-2 font-bold text-brand-600 dark:text-brand-300">
            <Sparkles className="h-4 w-4 text-brand-500" />
            <span>Plain English Summary</span>
          </div>
          <p className="dark:text-slate-300 text-slate-700 leading-relaxed">
            Whenever you submit a quiz, SkillTwin evaluates whether you got the question right, checks for lucky guesses or small slips, and updates your estimated skill score. Once your score reaches <strong>80%</strong>, the topic is marked as mastered and downstream chapters unlock.
          </p>
        </div>

        {/* Step-by-Step Bayes Equations */}
        <div className="mt-4 space-y-3.5 text-xs">
          
          {/* 1. Evidence Step */}
          <div className="rounded-2xl border dark:border-white/10 border-slate-200 dark:bg-surface-100 bg-slate-50 p-4">
            <span className="font-semibold text-cyan-600 dark:text-cyan-400 text-xs">
              Step 1: Evaluating Your Answer
            </span>
            <p className="dark:text-slate-300 text-slate-700 mt-1">
              Result: <strong className={isCorrect ? 'text-emerald-500' : 'text-rose-500'}>{isCorrect ? 'Correct Answer (Pass)' : 'Incorrect Answer (Miss)'}</strong>
            </p>

            <div className="mt-2.5 rounded-xl border dark:border-white/10 border-slate-200 dark:bg-[#070b12] bg-slate-900 p-3 font-mono text-[11px] text-slate-200 leading-relaxed">
              <p className="text-cyan-300">
                Starting Level: {Math.round(priorPL * 100)}% → Evidence Weight Applied: {isCorrect ? 'Positive Gain' : 'Practice Needed'}
              </p>
            </div>
          </div>

          {/* 2. Transition Step */}
          <div className="rounded-2xl border dark:border-white/10 border-slate-200 dark:bg-surface-100 bg-slate-50 p-4">
            <span className="font-semibold text-cyan-600 dark:text-cyan-400 text-xs">
              Step 2: Skill Growth Update
            </span>
            <p className="dark:text-slate-300 text-slate-700 mt-1">
              Accounting for learning progress and practice:
            </p>

            <div className="mt-2.5 rounded-xl border dark:border-white/10 border-slate-200 dark:bg-[#070b12] bg-slate-900 p-3 font-mono text-[11px] text-slate-200 leading-relaxed">
              <p className="text-slate-300">
                Updated Skill Score = <strong className="text-white font-bold text-sm">{Math.round(posteriorPL * 100)}%</strong> (Target to unlock: {Math.round(threshold * 100)}%)
              </p>
            </div>
          </div>

          {/* Parameters Table */}
          <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
            <div className="rounded-xl border dark:border-white/10 border-slate-200 dark:bg-surface-100 bg-slate-50 p-2">
              <span className="dark:text-slate-400 text-slate-500 block">Starting Score</span>
              <strong className="dark:text-white text-slate-900 text-xs">{Math.round(priorPL * 100)}%</strong>
            </div>
            <div className="rounded-xl border dark:border-white/10 border-slate-200 dark:bg-surface-100 bg-slate-50 p-2">
              <span className="dark:text-slate-400 text-slate-500 block">Growth Rate</span>
              <strong className="dark:text-white text-slate-900 text-xs">{Math.round(p_transit * 100)}%</strong>
            </div>
            <div className="rounded-xl border dark:border-white/10 border-slate-200 dark:bg-surface-100 bg-slate-50 p-2">
              <span className="dark:text-slate-400 text-slate-500 block">Careless Slip</span>
              <strong className="dark:text-white text-slate-900 text-xs">{Math.round(p_slip * 100)}%</strong>
            </div>
            <div className="rounded-xl border dark:border-white/10 border-slate-200 dark:bg-surface-100 bg-slate-50 p-2">
              <span className="dark:text-slate-400 text-slate-500 block">Guess Chance</span>
              <strong className="dark:text-white text-slate-900 text-xs">{Math.round(p_guess * 100)}%</strong>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5 flex justify-end">
          <button
            onClick={closeBktModal}
            className="rounded-xl bg-brand-600 px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-brand-500 transition-all btn-tactile"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
