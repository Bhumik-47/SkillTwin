'use client';

import React from 'react';
import { Skill, NodeStatus } from '../../lib/types';
import {
  CheckCircle2,
  Lock,
  Zap,
  Clock,
  Play
} from 'lucide-react';

interface SkillNodeCardProps {
  skill: Skill;
  masteryProb: number;
  status: NodeStatus;
  isSelected: boolean;
  onClick: () => void;
  style?: React.CSSProperties;
}

export default function SkillNodeCard({
  skill,
  masteryProb,
  status,
  isSelected,
  onClick,
  style,
}: SkillNodeCardProps) {
  const isMastered = masteryProb >= 0.80 || status === 'completed';
  const isInProgress = status === 'in_progress';
  const isReady = status === 'ready';
  const isLocked = status === 'locked';

  let borderColor = 'dark:border-white/10 border-slate-200';
  let bgColor = 'dark:bg-surface-200/95 bg-white/95';
  let glowStyle = 'shadow-md';
  let statusBadge = null;

  if (isMastered) {
    borderColor = 'border-emerald-500/60';
    bgColor = 'dark:bg-emerald-950/30 bg-emerald-50/80';
    glowStyle = 'shadow-[0_0_15px_rgba(16,185,129,0.15)]';
    statusBadge = (
      <span className="flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-300 border border-emerald-500/30">
        <CheckCircle2 className="h-3 w-3" />
        Mastered
      </span>
    );
  } else if (isInProgress) {
    borderColor = 'border-amber-500/70';
    bgColor = 'dark:bg-amber-950/30 bg-amber-50/80';
    glowStyle = 'shadow-[0_0_20px_rgba(245,158,11,0.25)] animate-pulse-glow';
    statusBadge = (
      <span className="flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-300 border border-amber-500/30">
        <Zap className="h-3 w-3 text-amber-500" />
        In Progress
      </span>
    );
  } else if (isReady) {
    borderColor = 'border-cyan-500/60';
    bgColor = 'dark:bg-cyan-950/20 bg-cyan-50/70';
    glowStyle = 'shadow-[0_0_15px_rgba(6,182,212,0.15)]';
    statusBadge = (
      <span className="flex items-center gap-1 rounded-full bg-cyan-500/15 px-2 py-0.5 text-[10px] font-bold text-cyan-600 dark:text-cyan-300 border border-cyan-500/30">
        <Play className="h-2.5 w-2.5" />
        Ready
      </span>
    );
  } else {
    // Locked
    borderColor = 'dark:border-slate-700/60 border-slate-300';
    bgColor = 'dark:bg-slate-900/60 bg-slate-100/80 opacity-60 hover:opacity-100';
    statusBadge = (
      <span className="flex items-center gap-1 rounded-full dark:bg-slate-800 bg-slate-200 px-2 py-0.5 text-[10px] font-medium dark:text-slate-400 text-slate-600 border dark:border-slate-700 border-slate-300">
        <Lock className="h-3 w-3" />
        Locked
      </span>
    );
  }

  if (isSelected) {
    borderColor = 'border-brand-500 ring-2 ring-brand-500/50';
    glowStyle = 'shadow-[0_0_25px_rgba(99,102,241,0.4)]';
  }

  return (
    <div
      onClick={onClick}
      style={style}
      className={`group relative cursor-pointer rounded-2xl border ${borderColor} ${bgColor} ${glowStyle} p-3.5 backdrop-blur-xl transition-all duration-200 hover:scale-[1.02] hover:border-brand-400 active:scale-[0.99] select-none`}
    >
      {/* Top row: Status & Difficulty */}
      <div className="flex items-center justify-between gap-2">
        {statusBadge}
        <span className="text-[10px] font-medium dark:text-slate-400 text-slate-500 capitalize">
          {skill.difficulty}
        </span>
      </div>

      {/* Skill Name */}
      <h4 className="mt-2 text-xs font-bold dark:text-white text-slate-900 tracking-tight line-clamp-2 group-hover:text-brand-500 dark:group-hover:text-brand-200 transition-colors">
        {skill.name}
      </h4>

      {/* Skill Short Description */}
      <p className="mt-1 text-[11px] dark:text-slate-400 text-slate-500 line-clamp-2 leading-relaxed">
        {skill.description}
      </p>

      {/* Footer: Mastery Probability Bar & Duration */}
      <div className="mt-3 border-t dark:border-white/10 border-slate-200 pt-2.5">
        <div className="flex items-center justify-between text-[10px]">
          <span className="dark:text-slate-400 text-slate-500 font-mono">
            P(L) = <strong className={isMastered ? 'text-emerald-500' : isInProgress ? 'text-amber-500' : 'dark:text-slate-300 text-slate-800'}>{(masteryProb * 100).toFixed(0)}%</strong>
          </span>
          <span className="flex items-center gap-1 dark:text-slate-400 text-slate-500">
            <Clock className="h-2.5 w-2.5" />
            {skill.estimated_duration_minutes}m
          </span>
        </div>

        {/* Progress gauge */}
        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full dark:bg-surface-300/80 bg-slate-200">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isMastered
                ? 'bg-emerald-500 shadow-[0_0_8px_#34d399]'
                : isInProgress
                ? 'bg-amber-500 shadow-[0_0_8px_#fbbf24]'
                : 'bg-cyan-500'
            }`}
            style={{ width: `${Math.max(5, masteryProb * 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
