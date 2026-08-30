'use client';

import React, { useState, useMemo } from 'react';
import { useSkillTwin } from '../../lib/state/store';
import { getStudyResourcesForSkill, getPrioritizedStudyResources, type LearningPreference, type ResourceCategory } from '../../data/topic_resources';
import { computeWeeklyStreak } from '../../lib/streak';
import {
  Sparkles,
  Zap,
  CheckCircle2,
  Clock,
  ArrowRight,
  BookOpen,
  HelpCircle,
  ChevronRight,
  AlertCircle,
  Play,
  RotateCcw,
  Compass,
  ExternalLink,
  Brain,
  Target,
  FileText,
  Flame,
  Award,
  Check,
  TrendingUp,
  Activity,
  Bot,
  Layers,
  BarChart2,
  Calendar,
  Lightbulb,
  Code,
  ShieldAlert,
  ChevronDown,
  Video,
  PenTool,
  ShieldCheck
} from 'lucide-react';

export default function DashboardView() {
  const {
    user,
    profile,
    currentPath,
    masteryMap,
    selfReportedMap,
    skills,
    openAssessment,
    setActiveTab,
    activeRepairDiff,
    setSelectedSkillId,
    setIsAIChatOpen,
    openBktModal,
    attemptsHistory
  } = useSkillTwin();

  const [expandedWhyId, setExpandedWhyId] = useState<string | null>(null);
  const [activeResourceTab, setActiveResourceTab] = useState<ResourceCategory | 'all'>('all');
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState<number>(0);
  const [isFlashcardFlipped, setIsFlashcardFlipped] = useState<boolean>(false);

  const nodes = currentPath?.nodes || [];

  // Identify current active topic (< 0.80 mastery)
  const activeNode = nodes.find(n => {
    const prob = masteryMap.get(n.skill_id) ?? (n.mastery_prob ?? 0.10);
    return prob < 0.80;
  }) || nodes[0];

  const activeSkill = skills.find(s => s.id === activeNode?.skill_id);

  // Overall course progress %
  const masteredCount = nodes.filter(n => (masteryMap.get(n.skill_id) ?? 0) >= 0.80).length;
  const overallProgressPercent = nodes.length > 0 ? Math.round((masteredCount / nodes.length) * 100) : 0;

  // Next up queue (3 upcoming topics)
  const upcomingNodes = nodes.filter(n => n.skill_id !== activeNode?.skill_id && (masteryMap.get(n.skill_id) ?? 0) < 0.80).slice(0, 3);

  // Active skill mastery score
  const activeMastery = activeNode ? (masteryMap.get(activeNode.skill_id) ?? 0.10) : 0.10;
  const activeMasteryPercent = Math.round(activeMastery * 100);

  // Calendar-synced weekly streak calculation
  const weeklyStreak = useMemo(() => computeWeeklyStreak(attemptsHistory), [attemptsHistory]);

  // Curated Learner-Friendly Resources (prioritized by learning preference)
  const learningPref: LearningPreference = (profile?.preferred_learning_style as LearningPreference) || 'mixed';
  const prioritizedResources = useMemo(() => {
    if (!activeNode) return [];
    return getPrioritizedStudyResources(activeNode.skill_id, activeNode.skill_name || activeSkill?.name || '', learningPref);
  }, [activeNode, activeSkill, learningPref]);

  const displayResources = useMemo(() => {
    if (activeResourceTab === 'all') return prioritizedResources;
    return prioritizedResources.filter(r => r.category === activeResourceTab);
  }, [prioritizedResources, activeResourceTab]);

  // Flash Knowledge Cards for quick drills
  const flashcards = useMemo(() => [
    {
      topic: 'Concurrency',
      front: 'What is the difference between Preemptive and Cooperative Multitasking?',
      back: 'In Preemptive multitasking, the OS scheduler forcefully interrupts threads via timer interrupts. In Cooperative multitasking (like Python asyncio or Node.js), routines voluntarily yield control using await/yield.'
    },
    {
      topic: 'Databases',
      front: 'What is the "Thundering Herd" problem in caching?',
      back: 'When a popular cached key expires, thousands of simultaneous incoming requests all miss the cache at the exact same moment and slam the database backend with redundant queries.'
    },
    {
      topic: 'Networking',
      front: 'Why does HTTP/2 use binary framing instead of plaintext HTTP/1.1?',
      back: 'Binary framing enables multiplexing multiple concurrent requests/responses over a single TCP connection without Head-of-Line (HoL) blocking at the application layer.'
    },
    {
      topic: 'Systems',
      front: 'What is an idempotent API operation?',
      back: 'An operation that produces the exact same server state whether executed once or repeated 100 times (e.g. GET, PUT, DELETE with unique ID).'
    }
  ], []);

  const handleNextFlashcard = () => {
    setIsFlashcardFlipped(false);
    setCurrentFlashcardIndex((prev) => (prev + 1) % flashcards.length);
  };

  const handleStartChapter = (skillId: string) => {
    openAssessment(skillId);
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* ------------------------------------------------------------- */}
      {/* 1. Plan Update Banner (if recent repair was triggered)        */}
      {/* ------------------------------------------------------------- */}
      {activeRepairDiff && (
        <div className={`flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-4 transition-all animate-in fade-in ${
          activeRepairDiff.trigger_event === 'assessment_passed'
            ? 'border-emerald-500/30 dark:bg-emerald-950/20 bg-emerald-50'
            : 'border-rose-500/30 dark:bg-rose-950/20 bg-rose-50'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
              activeRepairDiff.trigger_event === 'assessment_passed'
                ? 'bg-emerald-500/20 text-emerald-500'
                : 'bg-rose-500/20 text-rose-500'
            }`}>
              {activeRepairDiff.trigger_event === 'assessment_passed' ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
            </div>
            <div>
              <p className={`text-xs sm:text-sm font-semibold ${
                activeRepairDiff.trigger_event === 'assessment_passed'
                  ? 'dark:text-emerald-200 text-emerald-800'
                  : 'dark:text-rose-200 text-rose-800'
              }`}>
                {activeRepairDiff.trigger_event === 'assessment_passed'
                  ? '🎉 Quiz Passed! Time to move to the next concept.'
                  : 'Plan updated: We added an extra practice topic to help you strengthen your foundation.'}
              </p>
              <p className={`text-xs leading-relaxed max-w-2xl ${
                activeRepairDiff.trigger_event === 'assessment_passed'
                  ? 'dark:text-emerald-300/80 text-emerald-600'
                  : 'dark:text-rose-300/80 text-rose-600'
              }`}>
                {activeRepairDiff.trigger_event === 'assessment_passed'
                  ? 'Great job! The next chapter in your roadmap is unlocked and ready to start.'
                  : (activeRepairDiff.explanation || `${activeRepairDiff.inserted_nodes?.length || 1} new practice chapter added before moving forward.`)}
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveTab(activeRepairDiff.trigger_event === 'assessment_passed' ? 'roadmap' : 'repair_studio')}
            className={`flex items-center gap-1 text-xs font-bold hover:underline ${
              activeRepairDiff.trigger_event === 'assessment_passed'
                ? 'text-emerald-600 dark:text-emerald-300'
                : 'text-rose-600 dark:text-rose-300'
            }`}
          >
            <span>{activeRepairDiff.trigger_event === 'assessment_passed' ? 'View Roadmap' : 'See what changed'}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2. Main Focus Banner: Current Chapter + Progress Overview     */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Focus Card: Current Chapter (8 cols) */}
        <div className="lg:col-span-8 rounded-3xl border dark:border-white/10 border-slate-200 dark:bg-[#090f1b] bg-white p-6 sm:p-8 shadow-sm relative overflow-hidden flex flex-col justify-between">
          
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-brand-500/15 px-3 py-0.5 text-xs font-bold text-brand-600 dark:text-brand-300 border border-brand-500/30">
                  Active Milestone • Step {activeNode?.step_order || 1} of {nodes.length}
                </span>
                <span className="text-xs dark:text-slate-400 text-slate-500 font-medium flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  ~{activeNode?.estimated_minutes || 45} mins
                </span>
              </div>

              {/* Verified Score Chip */}
              <div className="flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-surface-50 border dark:border-white/5 border-slate-200 px-3 py-1 text-xs">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Skill Level:</span>
                <span className={`font-mono font-bold ${activeMasteryPercent >= 80 ? 'text-emerald-500' : 'text-brand-600 dark:text-brand-400'}`}>
                  {activeMasteryPercent}%
                </span>
              </div>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold dark:text-white text-slate-900 tracking-tight">
                {activeNode?.skill_name || activeSkill?.name || 'Getting Started'}
              </h2>
              <p className="text-sm dark:text-slate-300 text-slate-600 mt-2 leading-relaxed max-w-2xl">
                {activeSkill?.description || 'Learn and practice key concepts to unlock the next chapter in your plan.'}
              </p>
            </div>

            {/* Quick Context Pill */}
            <div className="rounded-2xl border border-brand-500/20 bg-brand-500/5 p-3.5 flex items-center justify-between text-xs text-brand-900 dark:text-brand-200">
              <div className="flex items-center gap-2.5">
                <Brain className="h-4 w-4 text-brand-500 shrink-0" />
                <span>
                  {activeMasteryPercent >= 80
                    ? 'Target 80% mastery attained! You can advance to subsequent chapters or practice for perfection.'
                    : 'Complete a quick 3-minute quiz to test your comprehension and calibrate your study plan.'}
                </span>
              </div>
              <button
                onClick={openBktModal}
                className="hidden sm:inline-flex text-[11px] font-bold underline hover:opacity-80 shrink-0 ml-2"
              >
                Inspect Score Math →
              </button>
            </div>

          </div>

          {/* Action Buttons */}
          <div className="pt-6 flex flex-wrap items-center gap-3 border-t dark:border-white/5 border-slate-100 mt-6">
            <button
              onClick={() => activeNode && handleStartChapter(activeNode.skill_id)}
              className="flex items-center gap-2 rounded-xl bg-brand-600 hover:bg-brand-500 px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-md shadow-brand-500/20 transition-all btn-tactile"
            >
              <Play className="h-4 w-4 fill-white" />
              <span>Start Practice Quiz</span>
            </button>

            <button
              onClick={() => {
                if (activeNode) setSelectedSkillId(activeNode.skill_id);
                setActiveTab('roadmap');
              }}
              className="flex items-center gap-2 rounded-xl border dark:border-white/10 border-slate-300 dark:bg-surface-50 bg-slate-100 hover:bg-slate-200 dark:hover:bg-surface-100 px-4 py-3 text-xs sm:text-sm font-semibold dark:text-slate-200 text-slate-700 transition-all btn-tactile"
            >
              <Compass className="h-4 w-4" />
              <span>View in Roadmap</span>
            </button>

            <button
              onClick={() => setIsAIChatOpen(true)}
              className="flex items-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 px-4 py-3 text-xs sm:text-sm font-semibold text-cyan-700 dark:text-cyan-300 transition-all btn-tactile"
            >
              <Bot className="h-4 w-4" />
              <span>Ask AI Tutor</span>
            </button>
          </div>

        </div>

        {/* Right Card: Overall Course Progress (4 cols) */}
        <div className="lg:col-span-4 rounded-3xl border dark:border-white/10 border-slate-200 dark:bg-[#090f1b] bg-white p-6 sm:p-8 shadow-sm flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider dark:text-slate-400 text-slate-500">
                Course Progress
              </span>
              <span className="rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold">
                Adaptive Track
              </span>
            </div>
            
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-black dark:text-white text-slate-900 font-mono">
                {overallProgressPercent}%
              </span>
              <span className="text-xs dark:text-slate-400 text-slate-500 font-medium">
                ({masteredCount} of {nodes.length} mastered)
              </span>
            </div>

            {/* Progress Bar */}
            <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full dark:bg-surface-50 bg-slate-200">
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand-600 to-cyan-500 transition-all duration-500"
                style={{ width: `${overallProgressPercent}%` }}
              />
            </div>

            <div className="mt-4 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                <span>Target Role:</span>
                <strong className="dark:text-white text-slate-900 font-semibold">{profile.target_role}</strong>
              </div>
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                <span>Weekly Commitment:</span>
                <strong className="dark:text-white text-slate-900 font-semibold">{profile.weekly_hours_budget} hrs / week</strong>
              </div>
            </div>
          </div>

          {/* 7-Day Calendar-Synced Study Streak */}
          <div className="border-t dark:border-white/5 border-slate-200 pt-4 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Flame className={`h-3.5 w-3.5 ${weeklyStreak.consecutiveStreakDays > 0 ? 'text-amber-500 fill-amber-500' : 'text-slate-400'}`} />
                <span>Weekly Study Streak</span>
              </span>
              <span className="text-amber-500 font-bold font-mono">
                {weeklyStreak.consecutiveStreakDays > 0
                  ? `${weeklyStreak.consecutiveStreakDays} Day${weeklyStreak.consecutiveStreakDays > 1 ? 's' : ''} Streak`
                  : '0 Days (Start Today)'}
              </span>
            </div>

            {/* Calendar Days Grid (Mon - Sun) */}
            <div className="grid grid-cols-7 gap-1 text-center">
              {weeklyStreak.days.map((d) => (
                <div
                  key={d.dateString}
                  className={`rounded-xl py-1 px-0.5 transition-all flex flex-col items-center justify-center relative ${
                    d.isActive
                      ? 'bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/50 shadow-xs'
                      : d.isToday
                      ? 'dark:bg-surface-100 bg-slate-100 dark:text-white text-slate-900 border border-brand-500/50 ring-1 ring-brand-500/30'
                      : d.isFuture
                      ? 'dark:bg-surface-50/40 bg-slate-50/50 text-slate-400 opacity-60'
                      : 'dark:bg-surface-50 bg-slate-100 text-slate-400'
                  }`}
                >
                  <span className="text-[9px] font-bold uppercase tracking-wider">{d.shortLetter}</span>
                  <span className="text-[11px] font-mono font-extrabold mt-0.5">{d.dayNumber}</span>
                  {d.isToday && (
                    <span className="text-[7px] font-bold text-brand-500 uppercase leading-none mt-0.5">Today</span>
                  )}
                  {d.isActive && (
                    <span className="absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full bg-amber-500 text-[8px] font-bold text-white shadow">
                      ✓
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. Focused Curated Study Resources (UIverse-Inspired Cards)    */}
      {/* ------------------------------------------------------------- */}
      <div className="rounded-3xl border dark:border-white/10 border-slate-200 dark:bg-[#090f1b] bg-white p-6 sm:p-8 shadow-sm space-y-6">
        
        {/* Section Header & Preference Filter Tabs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b dark:border-white/10 border-slate-200 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-brand-500/15 text-brand-600 dark:text-brand-300 border border-brand-500/30">
                <BookOpen className="h-4 w-4" />
              </div>
              <h3 className="text-lg font-extrabold dark:text-white text-slate-900 tracking-tight">
                Curated Study Resources
              </h3>
              <span className="rounded-full bg-brand-500/10 dark:bg-brand-400/10 border border-brand-500/20 px-2.5 py-0.5 text-[10px] font-bold text-brand-600 dark:text-brand-300">
                {activeNode?.skill_name || 'Active Chapter'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {learningPref === 'video'
                ? '🎬 Video-First Mode active: High-yield video lectures and visual walk-throughs prioritized.'
                : learningPref === 'hands_on'
                ? '💻 Hands-On Mode active: Coding labs, challenges, and sandbox exercises prioritized.'
                : learningPref === 'reading'
                ? '📖 Deep Reading Mode active: In-depth technical articles and key takeaway notes prioritized.'
                : '🔀 Mixed Mode active: Balanced Striver-style curriculum (Read → Watch → Practice).'}
            </p>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl dark:bg-surface-50 bg-slate-100 border dark:border-white/5 border-slate-200 overflow-x-auto">
            {[
              { key: 'all' as const, label: 'All', icon: <Zap className="h-3 w-3 text-amber-400" /> },
              { key: 'reading' as const, label: 'Articles', icon: <BookOpen className="h-3 w-3" /> },
              { key: 'video' as const, label: 'Videos', icon: <Video className="h-3 w-3" /> },
              { key: 'exercise' as const, label: 'Practice', icon: <Code className="h-3 w-3" /> },
              { key: 'blog' as const, label: 'Blogs', icon: <PenTool className="h-3 w-3" /> },
            ].map(tab => {
              const count = tab.key === 'all'
                ? prioritizedResources.length
                : prioritizedResources.filter(r => r.category === tab.key).length;

              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveResourceTab(tab.key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    activeResourceTab === tab.key
                      ? 'bg-brand-600 text-white shadow-sm shadow-brand-500/20'
                      : 'dark:text-slate-400 text-slate-600 hover:dark:text-white hover:text-slate-900'
                  } ${count === 0 ? 'opacity-40 cursor-not-allowed' : ''}`}
                  disabled={count === 0}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                  {count > 0 && (
                    <span className={`text-[9px] rounded-full px-1.5 py-0.2 font-mono ${
                      activeResourceTab === tab.key ? 'bg-white/20' : 'dark:bg-white/5 bg-slate-200'
                    }`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Resources Grid — UIverse-Inspired Glow & Lift Cards */}
        {displayResources.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400 italic">
            No resources available in this category for the active chapter.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {displayResources.map((res, idx) => {
              const isTopMatch = activeResourceTab === 'all' && idx === 0;

              const platformColor = (() => {
                switch (res.platform) {
                  case 'GeeksforGeeks': return { badge: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30', glow: 'bg-emerald-500/15' };
                  case 'W3Schools': return { badge: 'bg-green-500/15 text-green-700 dark:text-green-300 border-green-500/30', glow: 'bg-green-500/15' };
                  case 'YouTube': return { badge: 'bg-red-500/15 text-red-700 dark:text-red-300 border-red-500/30', glow: 'bg-red-500/15' };
                  case 'HackerRank': case 'LeetCode': return { badge: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30', glow: 'bg-amber-500/15' };
                  case 'Dev.to': return { badge: 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30', glow: 'bg-indigo-500/15' };
                  case 'RealPython': return { badge: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30', glow: 'bg-blue-500/15' };
                  case 'MDN Web Docs': return { badge: 'bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30', glow: 'bg-sky-500/15' };
                  case 'freeCodeCamp': return { badge: 'bg-teal-500/15 text-teal-700 dark:text-teal-300 border-teal-500/30', glow: 'bg-teal-500/15' };
                  case 'Kaggle': return { badge: 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-cyan-500/30', glow: 'bg-cyan-500/15' };
                  case 'TutorialsPoint': return { badge: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30', glow: 'bg-amber-500/15' };
                  default: return { badge: 'bg-brand-500/15 text-brand-700 dark:text-brand-300 border-brand-500/30', glow: 'bg-brand-500/15' };
                }
              })();

              return (
                <div
                  key={idx}
                  className="relative group rounded-3xl p-[1px] bg-gradient-to-b from-brand-500/20 via-cyan-500/10 to-transparent hover:from-brand-500/60 hover:via-cyan-400/50 hover:to-indigo-500/40 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-cyan-500/10"
                >
                  {/* Card Interior */}
                  <div className="relative rounded-[23px] dark:bg-[#0c1424]/95 bg-white/95 backdrop-blur-xl p-6 flex flex-col justify-between h-full overflow-hidden border dark:border-white/5 border-slate-200">
                    
                    {/* Ambient Glow Orb on hover */}
                    <div className={`absolute -top-12 -right-12 w-32 h-32 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none ${platformColor.glow}`} />

                    <div className="space-y-4 relative z-10">
                      
                      {/* Meta Top Header */}
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${platformColor.badge}`}>
                            {res.platform}
                          </span>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            • {res.category}
                          </span>
                          {res.verified && (
                            <span className="flex items-center gap-0.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full border border-emerald-500/20">
                              <ShieldCheck className="h-3 w-3" />
                              Verified
                            </span>
                          )}
                          {isTopMatch && (
                            <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded-full border border-amber-500/30">
                              ⭐ Top Match
                            </span>
                          )}
                        </div>

                        <span className="text-slate-400 font-medium flex items-center gap-1 text-[11px]">
                          <Clock className="h-3 w-3" />
                          {res.duration}
                        </span>
                      </div>

                      {/* Title with Gradient Hover */}
                      <a
                        href={res.url}
                        target="_blank"
                        rel="noreferrer"
                        className="block text-sm sm:text-base font-extrabold dark:text-white text-slate-900 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-brand-400 group-hover:to-cyan-400 transition-all duration-300 line-clamp-2"
                      >
                        {res.title}
                      </a>

                      {/* Summary */}
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                        {res.summary}
                      </p>

                      {/* Core Key Takeaways / Transcript Bullet Highlights */}
                      {res.keyPoints && res.keyPoints.length > 0 && (
                        <div className="rounded-2xl p-3 dark:bg-surface-50/70 bg-slate-50 border dark:border-white/5 border-slate-200/80 space-y-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 flex items-center gap-1">
                            <Sparkles className="h-3 w-3 text-amber-400" />
                            <span>Core Key Takeaways:</span>
                          </span>
                          <ul className="space-y-1">
                            {res.keyPoints.slice(0, 3).map((pt, pIdx) => (
                              <li key={pIdx} className="text-[11px] dark:text-slate-300 text-slate-600 flex items-start gap-1.5">
                                <span className="text-cyan-500 font-bold leading-tight">•</span>
                                <span className="leading-tight">{pt}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                    </div>

                    {/* Action Footer */}
                    <div className="pt-4 mt-4 border-t dark:border-white/5 border-slate-200 flex items-center justify-between text-xs relative z-10">
                      <span className="text-[11px] font-semibold text-slate-400">
                        Level: <strong className="dark:text-slate-200 text-slate-700">{res.difficulty}</strong>
                      </span>
                      <a
                        href={res.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 font-bold px-3.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white shadow-sm shadow-brand-500/20 text-xs transition-all duration-200 group/btn"
                      >
                        <span>{res.category === 'video' ? 'Watch Lecture' : res.category === 'exercise' ? 'Solve Problem' : 'Open Resource'}</span>
                        <ArrowRight className="h-3 w-3 group-hover/btn:translate-x-1 transition-transform" />
                      </a>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* ------------------------------------------------------------- */}
      {/* 4. Interactive Conceptual Flashcard Drill                     */}
      {/* ------------------------------------------------------------- */}
      <div className="rounded-3xl border dark:border-white/10 border-slate-200 dark:bg-[#090f1b] bg-white p-6 sm:p-8 shadow-sm space-y-6">
        
        <div className="flex flex-wrap items-center justify-between gap-3 border-b dark:border-white/10 border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-cyan-500/15 text-cyan-600 dark:text-cyan-300 border border-cyan-500/30">
              <Lightbulb className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold dark:text-white text-slate-900">
                Interactive Concept Flash Drill
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Reinforce high-frequency tech concepts right from your dashboard
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="font-mono text-slate-400 font-semibold">
              Card {currentFlashcardIndex + 1} of {flashcards.length}
            </span>
            <button
              onClick={handleNextFlashcard}
              className="rounded-xl border dark:border-white/10 border-slate-200 px-3 py-1.5 font-bold hover:bg-slate-100 dark:hover:bg-surface-50 transition-colors"
            >
              Next Concept →
            </button>
          </div>
        </div>

        {/* The Flashcard Body */}
        <div className="max-w-3xl mx-auto">
          <div
            onClick={() => setIsFlashcardFlipped(!isFlashcardFlipped)}
            className={`cursor-pointer rounded-2xl border p-6 sm:p-8 min-h-[160px] flex flex-col justify-between transition-all duration-300 ${
              isFlashcardFlipped
                ? 'border-emerald-500/40 bg-emerald-500/5 dark:bg-emerald-950/15 shadow-md'
                : 'border-slate-300 dark:border-white/15 bg-slate-50 dark:bg-surface-50 hover:border-brand-500/50'
            }`}
          >
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="rounded-full bg-slate-200 dark:bg-surface-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-700 dark:text-slate-300">
                {flashcards[currentFlashcardIndex].topic}
              </span>
              <span className="text-[11px] font-semibold text-brand-600 dark:text-brand-400">
                {isFlashcardFlipped ? 'Answer Revealed ✓' : 'Click to Flip & Reveal'}
              </span>
            </div>

            <div className="py-2">
              {isFlashcardFlipped ? (
                <div className="space-y-1 animate-in fade-in duration-200">
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                    Answer Breakdown:
                  </span>
                  <p className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white leading-relaxed">
                    {flashcards[currentFlashcardIndex].back}
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Concept Question:
                  </span>
                  <p className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-relaxed">
                    {flashcards[currentFlashcardIndex].front}
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 border-t dark:border-white/5 border-slate-200 pt-2 mt-2">
              <span>Press to flip</span>
              <span className="text-brand-500 font-bold">Try to recall before flipping</span>
            </div>
          </div>
        </div>

      </div>

      {/* ------------------------------------------------------------- */}
      {/* 5. Up Next in Your Roadmap (Sequenced Chapters)               */}
      {/* ------------------------------------------------------------- */}
      <div className="rounded-3xl border dark:border-white/10 border-slate-200 dark:bg-[#090f1b] bg-white p-6 sm:p-8 shadow-sm space-y-5">
        
        <div className="flex items-center justify-between border-b dark:border-white/10 border-slate-200 pb-4">
          <div>
            <h3 className="text-base sm:text-lg font-bold dark:text-white text-slate-900">
              Up Next in Your Curriculum
            </h3>
            <p className="text-xs dark:text-slate-400 text-slate-500 mt-0.5">
              These chapters will unlock automatically as you complete foundational prerequisites.
            </p>
          </div>

          <button
            onClick={() => setActiveTab('roadmap')}
            className="text-xs font-bold text-brand-500 hover:underline flex items-center gap-1"
          >
            <span>View Full Roadmap</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {upcomingNodes.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-4">You have completed all chapters in this path!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {upcomingNodes.map(node => {
              const skill = skills.find(s => s.id === node.skill_id);
              const isExpanded = expandedWhyId === node.skill_id;

              return (
                <div
                  key={node.skill_id}
                  className="rounded-2xl border dark:border-white/5 border-slate-200 dark:bg-surface-50/50 bg-slate-50 p-4 flex flex-col justify-between space-y-3 hover:border-brand-500/30 transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-mono text-[10px] text-slate-400 uppercase">
                        Step {node.step_order}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        ⏱️ {node.estimated_minutes || 45} mins
                      </span>
                    </div>

                    <h4 className="text-sm font-bold dark:text-white text-slate-900 line-clamp-1">
                      {node.skill_name || skill?.name || node.skill_id}
                    </h4>

                    <p className="text-xs dark:text-slate-400 text-slate-600 line-clamp-2 mt-1">
                      {skill?.description || 'Foundational topic sequenced for optimal learning.'}
                    </p>
                  </div>

                  {/* Why this recommendation toggle */}
                  <div className="border-t dark:border-white/5 border-slate-200 pt-2 text-xs">
                    <button
                      onClick={() => setExpandedWhyId(isExpanded ? null : node.skill_id)}
                      className="flex items-center gap-1 text-[11px] font-semibold text-cyan-600 dark:text-cyan-400 hover:underline"
                    >
                      <HelpCircle className="h-3 w-3" />
                      <span>{isExpanded ? 'Hide explanation' : 'Why this chapter?'}</span>
                    </button>

                    {isExpanded && (
                      <p className="mt-2 rounded-xl dark:bg-surface-100 bg-white p-2.5 text-[11px] dark:text-slate-300 text-slate-700 leading-relaxed border dark:border-white/5 border-slate-200">
                        This topic builds directly on what you learn in Chapter {node.step_order - 1} and is required for your target goal of <strong>{profile.target_role}</strong>.
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* ------------------------------------------------------------- */}
      {/* 6. Quick AI Tutor Question Starters                          */}
      {/* ------------------------------------------------------------- */}
      <div className="rounded-3xl border border-cyan-500/20 bg-gradient-to-r from-cyan-500/5 to-brand-500/5 dark:bg-[#070e1c] p-6 sm:p-8 shadow-sm space-y-4">
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Bot className="h-5 w-5 text-cyan-500" />
            <h3 className="text-sm sm:text-base font-bold dark:text-white text-slate-900">
              Need help studying {activeNode?.skill_name || 'this chapter'}?
            </h3>
          </div>
          <button
            onClick={() => setIsAIChatOpen(true)}
            className="text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:underline"
          >
            Open Full Chat Panel →
          </button>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          Click any prompt below to get instant formatted explanations and code examples from your AI learning assistant:
        </p>

        <div className="flex flex-wrap gap-2 pt-1">
          {[
            `Explain ${activeNode?.skill_name || 'this topic'} with a real-world code example`,
            `What are the most common interview pitfalls for ${activeNode?.skill_name || 'this topic'}?`,
            'What should I study next in my roadmap?',
            'Explain Big-O time and space complexity'
          ].map((promptText, idx) => (
            <button
              key={idx}
              onClick={() => setIsAIChatOpen(true)}
              className="rounded-xl border dark:border-white/10 border-slate-200 bg-white dark:bg-surface-50 hover:border-cyan-500 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 transition-all text-left shadow-2xs hover:scale-[1.01]"
            >
              💬 "{promptText}"
            </button>
          ))}
        </div>

      </div>

    </div>
  );
}
