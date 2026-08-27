'use client';

import React from 'react';
import { useSkillTwin } from '../../lib/state/store';
import {
  GitFork,
  Compass,
  GitCompare,
  FlaskConical,
  UserCheck
} from 'lucide-react';

export default function TabNav() {
  const { activeTab, setActiveTab, activeRepairDiff } = useSkillTwin();

  const tabs = [
    {
      id: 'roadmap' as const,
      label: 'Curriculum Roadmap',
      icon: Compass,
      badge: null,
    },
    {
      id: 'graph' as const,
      label: 'Interactive DAG Graph',
      icon: GitFork,
      badge: 'DAG',
    },
    {
      id: 'repair_studio' as const,
      label: 'Plan Repair Diff Studio',
      icon: GitCompare,
      badge: activeRepairDiff ? 'DIFF ACTIVE' : 'DEMO',
      badgeColor: activeRepairDiff
        ? 'bg-rose-500/20 text-rose-500 dark:text-rose-300 border-rose-500/40 animate-pulse'
        : 'bg-brand-500/15 text-brand-600 dark:text-brand-300 border-brand-500/40',
    },
    {
      id: 'assessment' as const,
      label: 'BKT Assessment Lab',
      icon: FlaskConical,
      badge: 'MATH',
    },
    {
      id: 'profile' as const,
      label: 'Verified vs Self-Reported',
      icon: UserCheck,
      badge: 'CALIBRATION',
    },
  ];

  return (
    <div className="w-full border-b dark:border-white/10 border-slate-200 dark:bg-[#0b101d] bg-slate-100/80 transition-colors">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-2 overflow-x-auto py-2.5 no-scrollbar">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group flex items-center gap-2.5 rounded-xl px-4 py-2 text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'dark:bg-gradient-to-r dark:from-brand-600/30 dark:to-indigo-600/30 bg-white text-brand-600 dark:text-white border dark:border-brand-500/50 border-brand-200 shadow-sm shadow-brand-500/10'
                    : 'dark:text-slate-400 text-slate-600 hover:dark:bg-white/5 hover:bg-white/60 hover:dark:text-slate-200 hover:text-slate-900 border border-transparent'
                }`}
              >
                <Icon className={`h-4 w-4 transition-colors ${isActive ? 'text-brand-500' : 'dark:text-slate-400 text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold border ${tab.badgeColor || 'dark:bg-white/10 bg-slate-200 dark:text-slate-300 text-slate-700 dark:border-white/10 border-slate-300'}`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
