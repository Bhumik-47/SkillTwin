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
  CheckCircle2,
  Zap,
  BookOpen,
  LogOut
} from 'lucide-react';

export default function Header() {
  const {
    currentDomain,
    domainsList,
    switchDomain,
    backendOnline,
    openAssessment,
    isAssessmentOpen,
    isAIChatOpen,
    setIsAIChatOpen,
    setIsProfileModalOpen,
    theme,
    toggleTheme,
    user,
    setShowLandingPage,
    setActiveTab,
    logoutUser
  } = useSkillTwin();

  const [isDomainDropdownOpen, setIsDomainDropdownOpen] = useState(false);

  const activeDomainMeta = domainsList.find(d => d.id === currentDomain) || domainsList[0];

  return (
    <header className={`sticky top-0 z-40 w-full border-b dark:border-white/[0.08] border-slate-200 dark:bg-[#060a14] bg-white shadow-sm transition-all duration-300 ease-in-out ${
      isAssessmentOpen
        ? '-translate-y-full opacity-0 pointer-events-none -mb-16'
        : 'translate-y-0 opacity-100'
    }`}>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Brand Logo & Course Selector */}
        <div className="flex items-center gap-4 sm:gap-6">
          <div
            className="flex items-center gap-3 cursor-pointer select-none"
            onClick={() => setShowLandingPage(true)}
            title="View Landing Page"
          >
            <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-brand-600 to-cyan-500 shadow-md shadow-brand-500/20 text-white">
              <Sparkles className="h-5 w-5" />
              <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-emerald-400 border-2 dark:border-[#060a14] border-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight dark:text-white text-slate-900">
                  SkillTwin
                </span>
                <span className="rounded-full bg-brand-500/15 px-2.5 py-0.5 text-[10px] font-semibold text-brand-600 dark:text-brand-300 border border-brand-500/30">
                  Smart Learning
                </span>
              </div>
              <p className="text-[11px] dark:text-slate-400 text-slate-500 hidden sm:block">
                Personalized study path tailored to your pace
              </p>
            </div>
          </div>

          {/* Course Selection Dropdown - Solid Background, High Z-Index, Crisp Contrast */}
          <div className="relative">
            <button
              onClick={() => setIsDomainDropdownOpen(!isDomainDropdownOpen)}
              className="flex items-center gap-2.5 rounded-xl border dark:border-white/15 border-slate-300 dark:bg-[#0d1525] bg-slate-100 px-3.5 py-1.5 text-xs font-semibold dark:text-white text-slate-800 hover:dark:bg-[#141e33] hover:bg-slate-200 transition-all duration-150 shadow-sm active:scale-[0.98]"
            >
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{
                  backgroundColor:
                    activeDomainMeta.color === 'emerald'
                      ? '#10b981'
                      : activeDomainMeta.color === 'sky'
                      ? '#0ea5e9'
                      : activeDomainMeta.color === 'amber'
                      ? '#f59e0b'
                      : '#a855f7',
                }}
              />
              <span className="max-w-[130px] truncate sm:max-w-none font-bold">
                {activeDomainMeta.name}
              </span>
              <span className="hidden md:inline text-[11px] dark:text-slate-400 text-slate-500 font-normal">
                ({activeDomainMeta.nodeCount} topics)
              </span>
              <ChevronDown
                className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-150 ${
                  isDomainDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Solid, Opaque Dropdown Menu */}
            {isDomainDropdownOpen && (
              <>
                {/* Backdrop Click Dismiss */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsDomainDropdownOpen(false)}
                />

                <div className="absolute left-0 mt-2 w-84 rounded-2xl border dark:border-white/20 border-slate-300 dark:bg-[#0d1525] bg-white p-2 shadow-2xl z-50 animate-dropdown-reveal">
                  <div className="px-3 py-2 border-b dark:border-white/10 border-slate-200 flex items-center justify-between">
                    <p className="text-[11px] font-bold uppercase tracking-wider dark:text-slate-400 text-slate-500">
                      Choose Learning Course
                    </p>
                    <span className="text-[10px] text-brand-500 font-medium">4 Courses</span>
                  </div>

                  <div className="mt-1.5 space-y-1">
                    {domainsList.map(domain => {
                      const isSelected = domain.id === currentDomain;
                      return (
                        <button
                          key={domain.id}
                          onClick={() => {
                            switchDomain(domain.id);
                            setIsDomainDropdownOpen(false);
                          }}
                          className={`w-full text-left rounded-xl p-3 transition-all duration-150 flex items-start gap-3 ${
                            isSelected
                              ? 'dark:bg-brand-500/20 bg-indigo-50 border dark:border-brand-500/50 border-brand-300 dark:text-white text-slate-900 font-semibold'
                              : 'hover:bg-slate-100 dark:hover:bg-white/5 dark:text-slate-300 text-slate-700 border border-transparent'
                          }`}
                        >
                          <div
                            className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border dark:border-white/10 border-slate-200 shadow-sm"
                            style={{
                              backgroundColor: `${
                                domain.color === 'emerald'
                                  ? '#10b981'
                                  : domain.color === 'sky'
                                  ? '#0ea5e9'
                                  : domain.color === 'amber'
                                  ? '#f59e0b'
                                  : '#a855f7'
                              }25`,
                              color:
                                domain.color === 'emerald'
                                  ? '#10b981'
                                  : domain.color === 'sky'
                                  ? '#0ea5e9'
                                  : domain.color === 'amber'
                                  ? '#f59e0b'
                                  : '#a855f7',
                            }}
                          >
                            {domain.id === 'backend_engineering' && <Database className="h-4 w-4" />}
                            {domain.id === 'python_fundamentals' && <Code2 className="h-4 w-4" />}
                            {domain.id === 'web_basics' && <Globe className="h-4 w-4" />}
                            {domain.id === 'data_analysis' && <BarChart3 className="h-4 w-4" />}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold truncate">{domain.name}</span>
                              {isSelected && <CheckCircle2 className="h-4 w-4 text-brand-500 shrink-0" />}
                            </div>
                            <p className="text-[11px] dark:text-slate-400 text-slate-500 mt-0.5 line-clamp-1">
                              {domain.description}
                            </p>
                            <span className="inline-block mt-1 text-[10px] font-medium px-2 py-0.5 rounded-md dark:bg-white/5 bg-slate-200 dark:text-slate-400 text-slate-600">
                              {domain.nodeCount} Topics
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right Actions & Profile */}
        <div className="flex items-center gap-2.5">
          
          {/* Status Indicator */}
          <div className="hidden xl:flex items-center gap-2 rounded-full border dark:border-white/10 border-slate-200 dark:bg-surface-100 bg-slate-100 px-3 py-1 text-[11px] font-medium dark:text-slate-300 text-slate-700">
            <span
              className={`h-2 w-2 rounded-full ${
                backendOnline ? 'bg-emerald-400' : 'bg-cyan-400'
              }`}
            />
            <span>{backendOnline ? 'Cloud Synced' : 'Ready'}</span>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            className="flex h-9 w-9 items-center justify-center rounded-xl border dark:border-white/10 border-slate-200 dark:bg-surface-100 bg-slate-100 dark:text-amber-400 text-slate-700 hover:border-brand-500/40 transition-all active:scale-[0.95]"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {/* Quick Skill Quiz Button */}
          <button
            onClick={() => openAssessment()}
            className="flex items-center gap-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 px-3.5 py-2 text-xs font-bold text-white shadow-sm transition-all active:scale-[0.97]"
          >
            <Activity className="h-3.5 w-3.5" />
            <span>Practice Quiz</span>
          </button>

          {/* AI Learning Assistant */}
          <button
            onClick={() => setIsAIChatOpen(!isAIChatOpen)}
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition-all active:scale-[0.97] ${
              isAIChatOpen
                ? 'border-cyan-400 bg-cyan-500/20 text-cyan-400'
                : 'dark:border-white/10 border-slate-200 dark:bg-surface-100 bg-slate-100 dark:text-slate-300 text-slate-700 hover:border-cyan-500/40'
            }`}
          >
            <Bot className="h-3.5 w-3.5 text-cyan-400" />
            <span className="hidden sm:inline">AI Tutor</span>
          </button>

          {/* Profile Trigger - Routes to dedicated Profile Page */}
          <button
            onClick={() => setActiveTab('profile')}
            title="View Profile & Settings"
            className="flex items-center gap-2 rounded-xl border dark:border-white/10 border-slate-200 dark:bg-surface-100 bg-slate-100 p-1 sm:px-2.5 sm:py-1.5 text-xs font-semibold dark:text-slate-200 text-slate-700 hover:border-brand-500/40 transition-all active:scale-[0.97]"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-600 text-white text-[11px] font-bold">
              {user.full_name.split(' ').map(n => n[0]).join('')}
            </div>
            <span className="hidden lg:inline font-bold max-w-[90px] truncate">{user.full_name}</span>
          </button>

          {/* Quick Log Out Action */}
          <button
            onClick={logoutUser}
            title="Log Out / Switch Account"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-rose-500/20 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 transition-all active:scale-[0.95]"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>

      </div>
    </header>
  );
}
