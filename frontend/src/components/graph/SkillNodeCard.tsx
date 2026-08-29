'use client';

import React from 'react';
import { Skill, NodeStatus } from '../../lib/types';
import {
  CheckCircle2,
  Lock,
  Zap,
  Play,
  Layers,
  ArrowRight,
  Clock,
  Sparkles
} from 'lucide-react';

interface SkillNodeCardProps {
  skill: Skill;
  masteryProb: number;
  status: NodeStatus;
  isSelected: boolean;
  onClick: () => void;
}

export default function SkillNodeCard({
  skill,
  masteryProb,
  status,
  isSelected,
  onClick,
}: SkillNodeCardProps) {
  const masteryPercent = Math.round(masteryProb * 100);
  const isMastered = masteryProb >= 0.80;

  let statusBorder = 'border-slate-300 dark:border-white/10';
  let statusGlow = '';
  let statusBg = 'dark:bg-[#0b1322]/95 bg-white/95';
  let badgeColor = 'bg-slate-500/15 text-slate-400 border-slate-500/30';
  let badgeText = 'Locked';

  if (status === 'completed' || isMastered) {
    statusBorder = 'border-emerald-500/50';
    statusGlow = 'shadow-[0_0_20px_rgba(52,211,153,0.25)]';
    statusBg = 'dark:bg-emerald-950/25 bg-emerald-50/70';
    badgeColor = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
    badgeText = 'Mastered';
  } else if (status === 'in_progress' || (masteryProb > 0.15 && masteryProb < 0.80)) {
    statusBorder = 'border-amber-500/50';
    statusGlow = 'shadow-[0_0_20px_rgba(245,158,11,0.25)]';
    statusBg = 'dark:bg-amber-950/25 bg-amber-50/70';
    badgeColor = 'bg-amber-500/20 text-amber-400 border-amber-500/40';
    badgeText = 'In Progress';
  } else if (status === 'ready') {
    statusBorder = 'border-cyan-500/50';
    statusGlow = 'shadow-[0_0_20px_rgba(6,182,212,0.25)]';
    statusBg = 'dark:bg-cyan-950/25 bg-cyan-50/70';
    badgeColor = 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40';
    badgeText = 'Ready';
  }

  if (isSelected) {
    statusBorder = 'border-brand-500 ring-2 ring-brand-500/50';
    statusGlow = 'shadow-[0_0_30px_rgba(99,102,241,0.4)]';
  }

  return (
    <div
      onClick={onClick}
      className={`group relative flex h-full w-full flex-col justify-between rounded-2xl border p-3.5 backdrop-blur-xl transition-all duration-200 cursor-pointer select-none btn-tactile ${statusBorder} ${statusGlow} ${statusBg} shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)]`}
    >
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between gap-1.5 mb-1.5">
          <span className={`rounded-full px-2 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider border ${badgeColor}`}>
            {badgeText}
          </span>
          <span className="text-[10px] font-mono dark:text-slate-400 text-slate-500 uppercase tracking-wider">
            {skill.difficulty || 'Core'}
          </span>
        </div>

        <h4 className="text-xs font-bold leading-snug dark:text-white text-slate-900 group-hover:text-brand-500 line-clamp-2 transition-colors">
          {skill.name}
        </h4>

        <p className="mt-1 text-[10.5px] dark:text-slate-400 text-slate-500 line-clamp-2 leading-tight">
          {skill.description}
        </p>
      </div>

      {/* Bottom Latent Mastery Bar */}
      <div className="mt-3 border-t dark:border-white/5 border-slate-200 pt-2">
        <div className="flex items-center justify-between text-[10px] mb-1">
          <span className="dark:text-slate-400 text-slate-500 font-medium">Skill Level</span>
          <strong className={`font-bold font-mono ${isMastered ? 'text-emerald-400' : 'text-brand-500'}`}>
            {masteryPercent}%
          </strong>
        </div>

        <div className="h-1.5 w-full overflow-hidden rounded-full dark:bg-surface-50 bg-slate-200">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isMastered ? 'bg-emerald-400 shadow-[0_0_6px_#34d399]' : 'bg-brand-500'
            }`}
            style={{ width: `${masteryPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
