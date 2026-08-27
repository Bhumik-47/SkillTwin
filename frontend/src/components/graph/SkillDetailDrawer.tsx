'use client';

import React from 'react';
import { useSkillTwin } from '../../lib/state/store';
import {
  X,
  CheckCircle2,
  Lock,
  Zap,
  Clock,
  ArrowRight,
  Calculator,
  Bot
} from 'lucide-react';
import { DEFAULT_BKT_PARAMS } from '../../lib/engine/bkt';

export default function SkillDetailDrawer() {
  const {
    selectedSkillId,
    setSelectedSkillId,
    skills,
    dependencies,
    masteryMap,
    openAssessment,
    openBktModal,
    setIsAIChatOpen
  } = useSkillTwin();

  if (!selectedSkillId) return null;

  const skill = skills.find(s => s.id === selectedSkillId);
  if (!skill) return null;

  const masteryProb = masteryMap.get(skill.id) ?? 0.10;
  const isMastered = masteryProb >= 0.80;

  const prereqDeps = dependencies.filter(d => d.target_skill_id === skill.id);
  const downstreamDeps = dependencies.filter(d => d.source_skill_id === skill.id);

  const prereqSkills = prereqDeps.map(d => {
    const s = skills.find(sk => sk.id === d.source_skill_id);
    const m = masteryMap.get(d.source_skill_id) ?? 0.10;
    return { skill: s, dep: d, mastery: m, isMastered: m >= 0.80 };
  });

  const downstreamSkills = downstreamDeps.map(d => {
    const s = skills.find(sk => sk.id === d.target_skill_id);
    const m = masteryMap.get(d.target_skill_id) ?? 0.10;
    return { skill: s, dep: d, mastery: m };
  });

  return (
    <div className="absolute right-4 top-4 bottom-4 z-30 w-96 rounded-3xl border dark:border-white/15 border-slate-300 dark:bg-surface-200/95 bg-white/95 p-6 shadow-2xl backdrop-blur-2xl overflow-y-auto animate-in slide-in-from-right duration-200 transition-colors">
      
      {/* Header */}
      <div className="flex items-start justify-between gap-3 border-b dark:border-white/10 border-slate-200 pb-4">
        <div>
          <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${
            isMastered
              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border-emerald-500/40'
              : masteryProb > 0.15
              ? 'bg-amber-500/15 text-amber-600 dark:text-amber-300 border-amber-500/40'
              : 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-300 border-cyan-500/40'
          }`}>
            {isMastered ? 'Mastered' : masteryProb > 0.15 ? 'In Progress' : 'Ready'}
          </span>
          <h3 className="mt-2 text-base font-bold dark:text-white text-slate-900 leading-snug">
            {skill.name}
          </h3>
        </div>

        <button
          onClick={() => setSelectedSkillId(null)}
          className="rounded-xl border dark:border-white/10 border-slate-200 dark:bg-surface-100 bg-slate-100 p-1.5 dark:text-slate-400 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Description */}
      <p className="mt-3 text-xs dark:text-slate-300 text-slate-600 leading-relaxed">
        {skill.description}
      </p>

      {/* BKT Latent Mastery HUD */}
      <div className="mt-5 rounded-2xl border dark:border-white/10 border-slate-200 dark:bg-surface-300/60 bg-slate-50 p-4">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="font-semibold dark:text-slate-200 text-slate-700">BKT Mastery Estimate</span>
          <span className="font-mono font-bold text-sm text-brand-600 dark:text-brand-300">
            {(masteryProb * 100).toFixed(0)}%
          </span>
        </div>

        {/* Bar */}
        <div className="h-2 w-full overflow-hidden rounded-full dark:bg-surface-100 bg-slate-200">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isMastered ? 'bg-emerald-500' : 'bg-brand-500'
            }`}
            style={{ width: `${Math.max(5, masteryProb * 100)}%` }}
          />
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[10px] dark:text-slate-400 text-slate-500 border-t dark:border-white/5 border-slate-200 pt-2">
          <div>
            <span className="block font-mono dark:text-white text-slate-900 font-bold">{(DEFAULT_BKT_PARAMS.p_transit * 100).toFixed(0)}%</span>
            <span>Transit P(T)</span>
          </div>
          <div>
            <span className="block font-mono dark:text-white text-slate-900 font-bold">{(DEFAULT_BKT_PARAMS.p_slip * 100).toFixed(0)}%</span>
            <span>Slip P(S)</span>
          </div>
          <div>
            <span className="block font-mono dark:text-white text-slate-900 font-bold">{(DEFAULT_BKT_PARAMS.p_guess * 100).toFixed(0)}%</span>
            <span>Guess P(G)</span>
          </div>
        </div>

        <button
          onClick={() => openBktModal()}
          className="mt-3 w-full flex items-center justify-center gap-1.5 rounded-xl border dark:border-white/10 border-slate-300 dark:bg-surface-200/80 bg-white py-1.5 text-[11px] font-semibold dark:text-slate-200 text-slate-700 hover:dark:bg-white/5 hover:bg-slate-100 transition-all shadow-sm"
        >
          <Calculator className="h-3 w-3 text-cyan-500" />
          <span>Inspect Formula Breakdown</span>
        </button>
      </div>

      {/* Prerequisites Chain */}
      <div className="mt-5">
        <h4 className="text-[11px] font-bold uppercase tracking-wider dark:text-slate-400 text-slate-500 mb-2">
          Direct Prerequisites ({prereqSkills.length})
        </h4>
        {prereqSkills.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No prerequisites — foundational root topic.</p>
        ) : (
          <div className="space-y-1.5">
            {prereqSkills.map(({ skill: prSkill, dep, mastery, isMastered: prMastered }) => (
              <div
                key={dep.source_skill_id}
                onClick={() => setSelectedSkillId(dep.source_skill_id)}
                className="flex items-center justify-between rounded-xl border dark:border-white/5 border-slate-200 dark:bg-surface-300/40 bg-slate-50 p-2 text-xs cursor-pointer hover:border-brand-400 transition-all"
              >
                <div className="flex items-center gap-2 truncate">
                  {prMastered ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  ) : (
                    <Lock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  )}
                  <span className="truncate dark:text-slate-200 text-slate-800">{prSkill?.name || dep.source_skill_id}</span>
                </div>
                <span className="font-mono text-[10px] dark:text-slate-400 text-slate-500">
                  {(mastery * 100).toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Downstream Unlocks */}
      <div className="mt-5">
        <h4 className="text-[11px] font-bold uppercase tracking-wider dark:text-slate-400 text-slate-500 mb-2">
          Unlocks Downstream ({downstreamSkills.length})
        </h4>
        {downstreamSkills.length === 0 ? (
          <p className="text-xs text-slate-400 italic">Terminal capstone competency.</p>
        ) : (
          <div className="space-y-1.5">
            {downstreamSkills.map(({ skill: dsSkill, dep }) => (
              <div
                key={dep.target_skill_id}
                onClick={() => setSelectedSkillId(dep.target_skill_id)}
                className="flex items-center justify-between rounded-xl border dark:border-white/5 border-slate-200 dark:bg-surface-300/40 bg-slate-50 p-2 text-xs cursor-pointer hover:border-brand-400 transition-all"
              >
                <div className="flex items-center gap-2 truncate">
                  <ArrowRight className="h-3 w-3 text-brand-500 shrink-0" />
                  <span className="truncate dark:text-slate-200 text-slate-800">{dsSkill?.name || dep.target_skill_id}</span>
                </div>
                <span className="text-[10px] dark:text-slate-500 text-slate-400 capitalize">{dep.dependency_type.replace('_', ' ')}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Primary Actions */}
      <div className="mt-6 space-y-2 border-t dark:border-white/10 border-slate-200 pt-4">
        <button
          onClick={() => openAssessment(skill.id)}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 py-2.5 text-xs font-bold text-white shadow-lg shadow-brand-500/25 transition-all active:scale-95"
        >
          <Zap className="h-4 w-4" />
          <span>Launch Skill Assessment</span>
        </button>

        <button
          onClick={() => setIsAIChatOpen(true)}
          className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-cyan-500/30 dark:bg-cyan-500/10 bg-cyan-50 hover:bg-cyan-100 dark:hover:bg-cyan-500/20 py-2 text-xs font-semibold text-cyan-600 dark:text-cyan-300 transition-all"
        >
          <Bot className="h-3.5 w-3.5 text-cyan-500" />
          <span>Ask TwinAI About This Topic</span>
        </button>
      </div>
    </div>
  );
}
