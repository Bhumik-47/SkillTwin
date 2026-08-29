'use client';

import React from 'react';
import { useSkillTwin } from '../../lib/state/store';
import { TabType } from '../../lib/types';
import {
  LayoutDashboard,
  Map,
  Network,
  GitCompare,
  UserCheck,
  Zap
} from 'lucide-react';

interface TabItem {
  id: TabType;
  label: string;
  sublabel: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeType?: 'brand' | 'rose' | 'emerald' | 'cyan';
}

export default function TabNav() {
  const { activeTab, setActiveTab, activeRepairDiff, skills } = useSkillTwin();

  const tabs: TabItem[] = [
    {
      id: 'dashboard',
      label: 'Overview',
      sublabel: 'Today\'s focus',
      icon: LayoutDashboard,
    },
    {
      id: 'roadmap',
      label: 'Roadmap',
      sublabel: `${skills.length} Chapters`,
      icon: Map,
    },
    {
      id: 'graph',
      label: 'Learning Map',
      sublabel: 'Visual connections',
      icon: Network,
    },
    {
      id: 'profile',
      label: 'Skill Progress',
      sublabel: 'Your skill level',
      icon: UserCheck,
    },
    {
      id: 'repair_studio',
      label: 'Plan Updates',
      sublabel: activeRepairDiff ? 'Changes ready' : 'History & adjustments',
      icon: GitCompare,
      badge: activeRepairDiff ? 'Updated' : undefined,
      badgeType: 'rose',
    },
  ];

  return (
    <div className="w-full my-4">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-2 overflow-x-auto rounded-2xl border dark:border-white/[0.08] border-slate-200 dark:bg-[#090f1b] bg-white p-1.5 shadow-sm no-scrollbar">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex flex-1 min-w-[140px] items-center gap-2.5 rounded-xl px-3.5 py-2 text-left transition-all duration-150 select-none btn-tactile ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-sm font-bold'
                    : 'dark:text-slate-400 text-slate-600 hover:dark:text-slate-100 hover:text-slate-900 hover:dark:bg-white/[0.04] hover:bg-slate-100'
                }`}
              >
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-transform ${
                    isActive
                      ? 'border-white/30 bg-white/20 text-white'
                      : 'dark:border-white/10 border-slate-200 dark:bg-surface-50 bg-slate-100 dark:text-slate-300 text-slate-700'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </div>

                <div className="flex-1 min-w-0">
                  <span className="block text-xs font-bold truncate tracking-tight">{tab.label}</span>
                  <span className={`block text-[10px] truncate ${isActive ? 'text-indigo-100' : 'dark:text-slate-500 text-slate-400 font-normal'}`}>
                    {tab.sublabel}
                  </span>
                </div>

                {tab.badge && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider shrink-0 border ${
                      isActive
                        ? 'bg-white/25 text-white border-white/40'
                        : 'bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
