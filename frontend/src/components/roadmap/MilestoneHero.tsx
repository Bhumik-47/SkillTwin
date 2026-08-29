'use client';

import React, { useState } from 'react';
import { useSkillTwin } from '../../lib/state/store';
import { LearningPathNode } from '../../lib/types';
import {
  Sparkles,
  Zap,
  CheckCircle2,
  Clock,
  ArrowRight,
  Calculator,
  Compass,
  Bot,
  Activity,
  Layers,
  ShieldCheck,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Play
} from 'lucide-react';
import { DEFAULT_BKT_PARAMS } from '../../lib/engine/bkt';

interface MilestoneHeroProps {
  activeNode: LearningPathNode | null;
  onLaunchAssessment: (skillId?: string) => void;
  onInspectGraph: () => void;
}

export default function MilestoneHero({
  activeNode,
  onLaunchAssessment,
  onInspectGraph,
}: MilestoneHeroProps) {
  const {
    currentPath,
    masteryMap,
    skills,
    dependencies,
    openBktModal,
    setIsAIChatOpen,
    setSelectedSkillId
  } = useSkillTwin();

  const [showDetails, setShowDetails] = useState(false);

  if (!activeNode) return null;

  const activeSkill = skills.find(s => s.id === activeNode.skill_id);
  const masteryProb = masteryMap.get(activeNode.skill_id) ?? (activeNode.mastery_prob ?? 0.10);
  const masteryPercent = Math.round(masteryProb * 100);
  const isMastered = masteryProb >= 0.80;

  // Direct prerequisites for this skill
  const prereqDeps = dependencies.filter(d => d.target_skill_id === activeNode.skill_id);
  const prereqs = prereqDeps.map(d => {
    const s = skills.find(sk => sk.id === d.source_skill_id);
    const m = masteryMap.get(d.source_skill_id) ?? 0.10;
    return { id: d.source_skill_id, name: s?.name || d.source_skill_id, mastery: m, isMet: m >= 0.80 };
  });

  return (
    <div className="relative overflow-hidden rounded-3xl border dark:border-white/10 border-slate-200 dark:bg-[#090f1b] bg-white p-6 sm:p-8 shadow-sm transition-all">
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left Column: Chapter Info & Actions (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Status Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-brand-500/15 px-3 py-0.5 text-xs font-semibold text-brand-600 dark:text-brand-300 border border-brand-500/30">
              Chapter {activeNode.step_order} of {currentPath?.nodes.length || skills.length}
            </span>

            <span className={`rounded-full px-3 py-0.5 text-xs font-semibold border ${
              isMastered
                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border-emerald-500/30'
                : 'bg-amber-500/15 text-amber-600 dark:text-amber-300 border-amber-500/30'
            }`}>
              {isMastered ? '✓ Mastered' : '⚡ In Progress'}
            </span>

            <span className="text-xs dark:text-slate-400 text-slate-500">
              Est: ~{activeNode.estimated_minutes || 45} mins
            </span>
          </div>

          {/* Headline & Description */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight dark:text-white text-slate-900 leading-tight">
              {activeNode.skill_name || activeSkill?.name || activeNode.skill_id}
            </h1>
            <p className="mt-2 text-xs sm:text-sm dark:text-slate-300 text-slate-600 leading-relaxed max-w-2xl">
              {activeSkill?.description || 'Learn and practice key concepts to unlock the next chapter in your roadmap.'}
            </p>
          </div>

          {/* Required Earlier Topics */}
          {prereqs.length > 0 && (
            <div className="rounded-2xl border dark:border-white/5 border-slate-200 dark:bg-surface-50/50 bg-slate-50 p-3.5 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold dark:text-slate-300 text-slate-700">
                <span>You&apos;ll need to finish these first ({prereqs.length}):</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {prereqs.map(pr => (
                  <div
                    key={pr.id}
                    onClick={() => setSelectedSkillId(pr.id)}
                    className="flex items-center justify-between rounded-xl border dark:border-white/5 border-slate-200 dark:bg-surface-100 bg-white p-2 text-xs cursor-pointer hover:border-brand-400 transition-all"
                  >
                    <div className="flex items-center gap-2 truncate">
                      {pr.isMet ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
                      )}
                      <span className="truncate dark:text-slate-200 text-slate-800 font-medium">{pr.name}</span>
                    </div>
                    <span className="text-[11px] dark:text-slate-400 text-slate-500 font-semibold shrink-0">
                      {Math.round(pr.mastery * 100)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              onClick={() => onLaunchAssessment(activeNode.skill_id)}
              className="flex items-center gap-2 rounded-xl bg-brand-600 hover:bg-brand-500 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm transition-all btn-tactile"
            >
              <Zap className="h-4 w-4 text-amber-300" />
              <span>Take Quick Practice Quiz</span>
            </button>

            <button
              onClick={onInspectGraph}
              className="flex items-center gap-2 rounded-xl border dark:border-white/10 border-slate-300 dark:bg-surface-50 bg-slate-100 px-4 py-2.5 text-xs sm:text-sm font-semibold dark:text-slate-200 text-slate-700 hover:bg-slate-200 dark:hover:bg-surface-100 transition-all btn-tactile"
            >
              <Compass className="h-4 w-4 text-cyan-500" />
              <span>Explore in Learning Map</span>
            </button>

            <button
              onClick={() => setIsAIChatOpen(true)}
              className="flex items-center gap-1.5 rounded-xl border border-cyan-500/30 dark:bg-cyan-500/10 bg-cyan-50 px-3.5 py-2.5 text-xs font-semibold text-cyan-600 dark:text-cyan-300 hover:bg-cyan-100 transition-all btn-tactile"
            >
              <Bot className="h-4 w-4 text-cyan-500" />
              <span>Ask AI Tutor</span>
            </button>
          </div>

        </div>

        {/* Right Column: Skill Level Summary (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-center">
          <div className="rounded-2xl border dark:border-white/10 border-slate-200 dark:bg-surface-50/50 bg-slate-50 p-6 space-y-4">
            
            <div className="flex items-center justify-between border-b dark:border-white/10 border-slate-200 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider dark:text-slate-300 text-slate-700">
                Your Skill Level
              </span>
              <span className="text-xs font-bold text-brand-500">
                Target: 80%
              </span>
            </div>

            {/* Circular Gauge */}
            <div className="flex items-center gap-5 justify-center py-1">
              <div className="relative flex h-28 w-28 items-center justify-center">
                <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    className="stroke-slate-200 dark:stroke-surface-100"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    className={isMastered ? 'stroke-emerald-500' : 'stroke-brand-600'}
                    strokeWidth="8"
                    strokeDasharray={`${2 * Math.PI * 38}`}
                    strokeDashoffset={`${2 * Math.PI * 38 * (1 - masteryProb)}`}
                    strokeLinecap="round"
                    fill="transparent"
                    style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-2xl font-black font-mono tracking-tight dark:text-white text-slate-900">
                    {masteryPercent}%
                  </span>
                  <span className="text-[9px] uppercase font-semibold text-slate-400">
                    {isMastered ? 'Mastered' : 'Progress'}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 flex-1 text-xs">
                <p className="dark:text-slate-300 text-slate-700 font-medium leading-relaxed">
                  {isMastered
                    ? 'Great job! You have verified this chapter. You can proceed to subsequent topics.'
                    : `Score at least 80% on practice quizzes to unlock next chapters automatically.`}
                </p>

                {/* Collapsible Details Toggle */}
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-[11px] font-semibold text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1 pt-1"
                >
                  <HelpCircle className="h-3 w-3" />
                  <span>{showDetails ? 'Hide technical details' : 'How is this calculated?'}</span>
                </button>
              </div>
            </div>

            {/* Optional Collapsed Calculation Details */}
            {showDetails && (
              <div className="rounded-xl dark:bg-surface-100 bg-white p-3 text-[11px] dark:text-slate-300 text-slate-600 space-y-1.5 border dark:border-white/5 border-slate-200 animate-in fade-in">
                <p className="font-semibold text-xs dark:text-white text-slate-900">Adaptive Progress Model</p>
                <p className="leading-relaxed">
                  SkillTwin uses Bayesian probability to estimate how well you understand each concept based on your quiz answers, question difficulty, and learning progress.
                </p>
                <div className="pt-1 flex justify-end">
                  <button
                    onClick={openBktModal}
                    className="text-[10.5px] font-bold text-brand-500 hover:underline"
                  >
                    View math formula breakdown →
                  </button>
                </div>
              </div>
            )}

            {/* Friendly Next Step Card */}
            <div className="rounded-xl border border-brand-500/20 dark:bg-brand-950/20 bg-indigo-50/70 p-3 flex items-start gap-2 text-xs">
              <Sparkles className="h-4 w-4 text-brand-500 shrink-0 mt-0.5" />
              <p className="dark:text-slate-300 text-slate-700 leading-relaxed">
                <strong>Recommended Next Step:</strong> Take a quick practice quiz to test your knowledge and advance your study plan.
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
