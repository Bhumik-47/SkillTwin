'use client';

import React, { useState } from 'react';
import { useSkillTwin } from '../../lib/state/store';
import {
  Sparkles,
  ChevronDown,
  Activity,
  Bot,
  User as UserIcon,
  Sun,
  Moon,
  Database,
  Code2,
  Globe,
  BarChart3,
  CheckCircle2
} from 'lucide-react';

export default function Header() {
  const {
    currentDomain,
    domainsList,
    switchDomain,
    backendOnline,
    openAssessment,
    isAIChatOpen,
    setIsAIChatOpen,
    setIsProfileModalOpen,
    theme,
    toggleTheme,
    user
  } = useSkillTwin();

  const [isDomainDropdownOpen, setIsDomainDropdownOpen] = useState(false);

  const activeDomainMeta = domainsList.find(d => d.id === currentDomain) || domainsList[0];

  return (
    <header className="sticky top-0 z-40 w-full border-b dark:border-white/10 border-slate-200 dark:bg-[#090d16]/90 bg-white/90 backdrop-blur-xl transition-colors">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Brand Logo & Domain Selector */}
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.location.reload()}>
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-cyan-500 shadow-lg shadow-brand-500/25">
              <Sparkles className="h-5 w-5 text-white animate-pulse" />
              <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-emerald-400 border-2 dark:border-[#090d16] border-white" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight dark:text-white text-slate-900">SkillTwin</span>
              <p className="text-[11px] dark:text-slate-400 text-slate-500 font-medium hidden sm:block">
                Adaptive Learning Path Recommender
              </p>
            </div>
          </div>

          {/* Domain Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsDomainDropdownOpen(!isDomainDropdownOpen)}
              className="flex items-center gap-2.5 rounded-xl border dark:border-white/10 border-slate-200 dark:bg-surface-200/80 bg-slate-100 px-3.5 py-1.5 text-xs font-semibold dark:text-slate-200 text-slate-700 hover:border-brand-500/50 hover:dark:bg-surface-100 hover:bg-slate-200 transition-all shadow-sm"
            >
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: activeDomainMeta.color }} />
              <span className="max-w-[140px] truncate sm:max-w-none">{activeDomainMeta.name}</span>
              <span className="hidden md:inline text-[10px] dark:text-slate-400 text-slate-500 font-normal">({activeDomainMeta.nodeCount} nodes)</span>
              <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform ${isDomainDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isDomainDropdownOpen && (
              <div className="absolute left-0 mt-2 w-80 rounded-2xl border dark:border-white/15 border-slate-200 dark:bg-surface-200 bg-white p-2 shadow-2xl backdrop-blur-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-2 border-b dark:border-white/10 border-slate-200">
                  <p className="text-[11px] font-semibold uppercase tracking-wider dark:text-slate-400 text-slate-500">Curriculum Domain</p>
                  <p className="text-[10px] text-slate-400">Generic DAG graph datasets</p>
                </div>
                <div className="mt-1 space-y-1">
                  {domainsList.map(domain => {
                    const isSelected = domain.id === currentDomain;
                    return (
                      <button
                        key={domain.id}
                        onClick={() => {
                          switchDomain(domain.id);
                          setIsDomainDropdownOpen(false);
                        }}
                        className={`w-full text-left rounded-xl p-2.5 transition-all flex items-start gap-3 ${
                          isSelected
                            ? 'bg-brand-500/15 border border-brand-500/40 dark:text-white text-slate-900 font-semibold'
                            : 'hover:bg-slate-100 dark:hover:bg-white/5 dark:text-slate-300 text-slate-600'
                        }`}
                      >
                        <div
                          className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border dark:border-white/10 border-slate-200"
                          style={{ backgroundColor: `${domain.color}20`, color: domain.color }}
                        >
                          {domain.id === 'backend_engineering' && <Database className="h-4 w-4" />}
                          {domain.id === 'python_fundamentals' && <Code2 className="h-4 w-4" />}
                          {domain.id === 'web_basics' && <Globe className="h-4 w-4" />}
                          {domain.id === 'data_analysis' && <BarChart3 className="h-4 w-4" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold truncate">{domain.name}</span>
                            {isSelected && <CheckCircle2 className="h-3.5 w-3.5 text-brand-500 shrink-0" />}
                          </div>
                          <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{domain.description}</p>
                          <span className="inline-block mt-1 text-[9px] font-medium px-1.5 py-0.2 rounded dark:bg-white/5 bg-slate-100 text-slate-500 border border-slate-200 dark:border-white/5">
                            {domain.badge}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Controls & User Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Backend Status Indicator */}
          <div className="hidden xl:flex items-center gap-2 rounded-full border dark:border-white/10 border-slate-200 dark:bg-surface-200/60 bg-slate-100 px-3 py-1 text-[11px] font-medium dark:text-slate-300 text-slate-700">
            <span className={`h-2 w-2 rounded-full ${backendOnline ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-cyan-400 shadow-[0_0_8px_#22d3ee]'}`} />
            <span>{backendOnline ? 'FastAPI Connected' : 'Engine Ready'}</span>
          </div>

          {/* Theme Switcher Toggle */}
          <button
            onClick={toggleTheme}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            className="flex h-9 w-9 items-center justify-center rounded-xl border dark:border-white/10 border-slate-200 dark:bg-surface-200/80 bg-slate-100 dark:text-amber-400 text-slate-700 hover:border-brand-500/40 hover:scale-105 transition-all shadow-sm"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {/* Assessment Trigger */}
          <button
            onClick={() => openAssessment()}
            className="flex items-center gap-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 px-3.5 py-1.5 text-xs font-semibold text-white shadow-md shadow-brand-500/20 transition-all active:scale-95"
          >
            <Activity className="h-3.5 w-3.5" />
            <span>Test Skill</span>
          </button>

          {/* TwinAI Chat Toggle Button */}
          <button
            onClick={() => setIsAIChatOpen(!isAIChatOpen)}
            className={`relative flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all ${
              isAIChatOpen
                ? 'border-cyan-400/60 bg-cyan-500/20 text-cyan-500 shadow-md shadow-cyan-500/20'
                : 'dark:border-white/10 border-slate-200 dark:bg-surface-200/80 bg-slate-100 dark:text-slate-300 text-slate-700 hover:border-cyan-500/40'
            }`}
          >
            <Bot className="h-3.5 w-3.5 text-cyan-500" />
            <span className="hidden md:inline">TwinAI</span>
            <span className="flex h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />
          </button>

          {/* USER PROFILE OPTION BUTTON */}
          <button
            onClick={() => setIsProfileModalOpen(true)}
            title="Open User Profile & Settings"
            className="flex items-center gap-2 rounded-xl border dark:border-white/10 border-slate-200 dark:bg-surface-200/80 bg-slate-100 hover:border-brand-500/50 p-1.5 sm:px-2.5 sm:py-1.5 text-xs font-semibold dark:text-slate-200 text-slate-700 transition-all shadow-sm"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-tr from-brand-600 to-cyan-500 text-white text-[10px] font-bold">
              {user.full_name.split(' ').map(n => n[0]).join('')}
            </div>
            <span className="hidden lg:inline max-w-[90px] truncate">{user.full_name}</span>
            <UserIcon className="h-3.5 w-3.5 text-slate-400" />
          </button>
        </div>
      </div>
    </header>
  );
}
