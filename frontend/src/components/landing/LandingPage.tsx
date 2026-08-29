'use client';

import React, { useState, useEffect } from 'react';
import { useSkillTwin } from '../../lib/state/store';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Lock,
  Zap,
  Bot,
  Compass,
  Layers,
  Database,
  Code2,
  Globe,
  BarChart3,
  ShieldCheck,
  UserCheck,
  Play,
  X,
  LogIn,
  UserPlus,
  Sun,
  Moon,
  ChevronRight,
  Activity,
  Check,
  HelpCircle,
  RotateCcw,
  BookOpen,
  Cpu,
  Workflow,
  Target,
  Flame,
  Clock,
  Award
} from 'lucide-react';

interface LandingPageProps {
  onEnterApp: () => void;
}

export default function LandingPage({ onEnterApp }: LandingPageProps) {
  const {
    loginUser,
    signupUser,
    domainsList,
    switchDomain,
    theme,
    toggleTheme
  } = useSkillTwin();

  // Auth Modal state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signup' | 'login'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [targetRole, setTargetRole] = useState('Senior Backend Engineer');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Interactive Hero Simulator state
  const [simulatedScore, setSimulatedScore] = useState<number>(45);
  const [simulatedQuizAnswer, setSimulatedQuizAnswer] = useState<'correct' | 'incorrect' | null>(null);
  const [interactiveQuizChoice, setInteractiveQuizChoice] = useState<number | null>(null);
  const [interactiveQuizSubmitted, setInteractiveQuizSubmitted] = useState<boolean>(false);

  // Active track preview in tracks section
  const [selectedTrackId, setSelectedTrackId] = useState<string>('backend_engineering');

  const handleSimulateQuiz = (result: 'correct' | 'incorrect') => {
    setSimulatedQuizAnswer(result);
    if (result === 'correct') {
      setSimulatedScore(prev => Math.min(95, prev + 25));
    } else {
      setSimulatedScore(prev => Math.max(30, prev - 15));
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsSubmitting(true);

    try {
      if (authMode === 'signup') {
        await signupUser({
          email,
          password,
          full_name: fullName || 'New Learner',
          target_role: targetRole,
          weekly_hours_budget: 10,
          preferred_learning_style: 'hands_on',
          prior_experience_level: 'beginner'
        });
      } else {
        await loginUser({ email, password });
      }
      setIsAuthModalOpen(false);
      onEnterApp();
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openAuth = (mode: 'signup' | 'login') => {
    setAuthMode(mode);
    setAuthError(null);
    setIsAuthModalOpen(true);
  };

  const activeTrackMeta = domainsList.find(d => d.id === selectedTrackId) || domainsList[0];

  const trackCurricula: Record<string, Array<{ step: number; title: string; time: string; tag: string }>> = {
    backend_engineering: [
      { step: 1, title: 'HTTP/1.1 & HTTP/2 Protocols', time: '45m', tag: 'Networking' },
      { step: 2, title: 'OS Threads & Process Memory Models', time: '60m', tag: 'Systems' },
      { step: 3, title: 'Non-blocking Async I/O & Event Loops', time: '60m', tag: 'Concurrency' },
      { step: 4, title: 'B-Tree & LSM Database Indexing', time: '60m', tag: 'Databases' },
      { step: 5, title: 'Redis In-Memory Caching & Eviction', time: '45m', tag: 'Architecture' }
    ],
    python_fundamentals: [
      { step: 1, title: 'Python Memory & Object References', time: '40m', tag: 'Core' },
      { step: 2, title: 'Decorators, Closures & Wrappers', time: '50m', tag: 'Advanced' },
      { step: 3, title: 'Generators & Memory-Efficient Streams', time: '45m', tag: 'Performance' },
      { step: 4, title: 'Asyncio & Cooperative Multitasking', time: '60m', tag: 'Async' }
    ],
    web_basics: [
      { step: 1, title: 'Semantic HTML5 & DOM Tree Anatomy', time: '35m', tag: 'Structure' },
      { step: 2, title: 'CSS Grid vs. Flexbox Alignment', time: '45m', tag: 'Layout' },
      { step: 3, title: 'JavaScript Promises & Event Loop', time: '50m', tag: 'JS Engine' },
      { step: 4, title: 'REST Fetching & State Synchronization', time: '40m', tag: 'Frontend' }
    ],
    data_analysis: [
      { step: 1, title: 'NumPy C-Contiguous Arrays & Vectorization', time: '45m', tag: 'NumPy' },
      { step: 2, title: 'Pandas DataFrame Filtering & Multi-Indexing', time: '50m', tag: 'Pandas' },
      { step: 3, title: 'GroupBy Aggregations & Window Functions', time: '60m', tag: 'Analysis' },
      { step: 4, title: 'Exploratory Data Analysis (EDA) Pipeline', time: '45m', tag: 'EDA' }
    ]
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#040711] text-slate-900 dark:text-slate-100 selection:bg-brand-500 selection:text-white transition-colors duration-200 overflow-x-hidden font-sans">
      
      {/* Background Ambient Glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[650px] w-[900px] rounded-full bg-brand-500/10 dark:bg-brand-500/15 blur-[160px]" />
        <div className="absolute top-[35%] -left-32 h-[500px] w-[500px] rounded-full bg-cyan-500/8 dark:bg-cyan-500/10 blur-[140px]" />
        <div className="absolute top-[65%] -right-32 h-[500px] w-[500px] rounded-full bg-indigo-500/8 dark:bg-indigo-500/10 blur-[140px]" />
      </div>

      {/* ------------------------------------------------------------- */}
      {/* Floating Island Header                                        */}
      {/* ------------------------------------------------------------- */}
      <div className="sticky top-4 z-40 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <header className="mx-auto flex h-14 max-w-5xl items-center justify-between rounded-full border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-[#070c18]/80 px-4 sm:px-6 backdrop-blur-xl shadow-lg shadow-slate-900/5 dark:shadow-black/40 transition-all">
          
          {/* Logo */}
          <div className="flex items-center gap-2.5 cursor-pointer select-none" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-brand-600 to-cyan-500 text-white shadow-sm shadow-brand-500/30">
              <Sparkles className="h-4 w-4 animate-pulse" />
              <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-400 border border-white dark:border-[#070c18]" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white">
                SkillTwin
              </span>
              <span className="rounded-full bg-brand-500/10 dark:bg-brand-500/20 px-2 py-0.5 text-[10px] font-bold text-brand-600 dark:text-brand-300 border border-brand-500/20">
                AI 2.0
              </span>
            </div>
          </div>

          {/* Quick Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <a href="#how-it-works" className="hover:text-brand-600 dark:hover:text-white transition-colors">How It Adapts</a>
            <a href="#tracks" className="hover:text-brand-600 dark:hover:text-white transition-colors">Curriculum Tracks</a>
            <a href="#interactive-demo" className="hover:text-brand-600 dark:hover:text-white transition-colors">Live Quiz Demo</a>
            <a href="#comparison" className="hover:text-brand-600 dark:hover:text-white transition-colors">Why SkillTwin</a>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={toggleTheme}
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-surface-100 text-slate-700 dark:text-amber-400 hover:border-brand-500/40 transition-all active:scale-[0.95]"
            >
              {theme === 'dark' ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
            </button>

            <button
              onClick={() => openAuth('login')}
              className="hidden sm:inline-block text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-brand-600 dark:hover:text-brand-400 px-3 py-1.5 transition-colors"
            >
              Sign In
            </button>

            <button
              onClick={() => openAuth('signup')}
              className="group flex items-center gap-1.5 rounded-full bg-brand-600 hover:bg-brand-500 px-4 py-1.5 text-xs font-bold text-white shadow-md shadow-brand-500/25 transition-all btn-tactile"
            >
              <span>Get Started</span>
              <div className="flex h-4 w-4 items-center justify-center rounded-full bg-white/20 group-hover:translate-x-0.5 transition-transform">
                <ArrowRight className="h-2.5 w-2.5" />
              </div>
            </button>
          </div>

        </header>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* Hero Section: Dynamic Typography & Live Interactive Simulator  */}
      {/* ------------------------------------------------------------- */}
      <section className="relative z-10 pt-16 pb-20 sm:pt-20 sm:pb-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          {/* Hero Header */}
          <div className="text-center max-w-4xl mx-auto space-y-6">
            
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 dark:bg-brand-500/15 px-4 py-1.5 text-xs font-semibold text-brand-700 dark:text-brand-300 shadow-xs backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-brand-500 animate-spin" />
              <span>Next-Generation Adaptive Learning Engine</span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-slate-950 dark:text-white leading-[1.1]">
              Stop Repeating What You Know.{' '}
              <span className="bg-gradient-to-r from-brand-500 via-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                Master Tech Faster.
              </span>
            </h1>

            <p className="mx-auto max-w-2xl text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
              Traditional courses lock you into rigid playlists. SkillTwin continuously estimates your true skill mastery through quick practice quizzes and automatically reschedules your study plan in real-time.
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              <button
                onClick={() => openAuth('signup')}
                className="group flex items-center gap-3 rounded-2xl bg-brand-600 hover:bg-brand-500 px-8 py-4 text-sm font-bold text-white shadow-xl shadow-brand-500/30 transition-all btn-tactile"
              >
                <span>Create Free Account</span>
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 group-hover:translate-x-1 transition-transform">
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </button>

              <button
                onClick={onEnterApp}
                className="flex items-center gap-2.5 rounded-2xl border border-slate-300 dark:border-white/15 bg-white/80 dark:bg-[#070d1a]/80 hover:bg-slate-100 dark:hover:bg-surface-100 px-7 py-4 text-sm font-bold text-slate-800 dark:text-slate-200 shadow-sm backdrop-blur-md transition-all btn-tactile"
              >
                <Play className="h-4 w-4 fill-current text-cyan-500 dark:text-cyan-400" />
                <span>Explore Live Demo (No Sign In)</span>
              </button>
            </div>

            {/* Micro Feature Tickers */}
            <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                No credit card required
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                100% Non-destructive updates
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                Live AI Assistant
              </span>
            </div>

          </div>

          {/* ----------------------------------------------------------- */}
          {/* Interactive Live Hero Simulation Component (Machined Bezel) */}
          {/* ----------------------------------------------------------- */}
          <div className="mt-14 max-w-5xl mx-auto">
            <div className="rounded-[2.5rem] border border-slate-200 dark:border-white/10 bg-slate-200/50 dark:bg-white/[0.03] p-2 sm:p-3 shadow-2xl backdrop-blur-xl">
              <div className="rounded-[2rem] border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#090f1e] p-6 sm:p-8 shadow-inner relative overflow-hidden">
                
                {/* Header of Simulator */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-white/10 pb-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-500/15 text-brand-500 border border-brand-500/30">
                      <Workflow className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                          Live Roadmap Simulation
                        </h3>
                        <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Try simulating a practice quiz to see how the study plan adapts instantly
                      </p>
                    </div>
                  </div>

                  {/* Simulator Trigger Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleSimulateQuiz('correct')}
                      className="flex items-center gap-1.5 rounded-xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 px-3 py-1.5 text-xs font-bold hover:bg-emerald-500/25 transition-all active:scale-[0.96]"
                    >
                      <Check className="h-3.5 w-3.5" />
                      <span>Simulate: Passed Quiz (+25%)</span>
                    </button>
                    <button
                      onClick={() => handleSimulateQuiz('incorrect')}
                      className="flex items-center gap-1.5 rounded-xl bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30 px-3 py-1.5 text-xs font-bold hover:bg-rose-500/25 transition-all active:scale-[0.96]"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      <span>Simulate: Stumbled (-15%)</span>
                    </button>
                  </div>
                </div>

                {/* Body of Simulator */}
                <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                  
                  {/* Left Column: Simulated Chapter Card (7 Cols) */}
                  <div className="lg:col-span-7 space-y-4">
                    <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-surface-50 p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                          Active Chapter Milestone
                        </span>
                        <span className="rounded-full bg-slate-200 dark:bg-surface-100 px-2.5 py-0.5 text-[10px] font-semibold text-slate-700 dark:text-slate-300">
                          Estimated: 45 mins
                        </span>
                      </div>

                      <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                        OS Threads & Process Memory Models
                      </h4>

                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        Understanding context switching, shared heap vs isolated stack memory, and concurrency primitives before tackling asynchronous event loops.
                      </p>

                      {/* Dynamic Adaptivity Banner */}
                      <div className={`rounded-xl p-3 text-xs flex items-center gap-2.5 transition-all duration-300 ${
                        simulatedScore >= 80
                          ? 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-200 border border-emerald-500/30'
                          : simulatedQuizAnswer === 'incorrect'
                          ? 'bg-amber-500/15 text-amber-800 dark:text-amber-200 border border-amber-500/30'
                          : 'bg-brand-500/10 text-brand-800 dark:text-brand-200 border border-brand-500/20'
                      }`}>
                        <Sparkles className="h-4 w-4 shrink-0" />
                        <span>
                          {simulatedScore >= 80
                            ? '🎉 Target 80% Mastery Achieved! Unlocking next advanced milestone: "Non-blocking Async I/O".'
                            : simulatedQuizAnswer === 'incorrect'
                            ? '⚡ SkillTwin dynamically inserted a 15-minute reinforcement exercise before harder topics.'
                            : 'Score at least 80% on practice quizzes to automatically unlock subsequent chapters.'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Live Bayesian Gauge (5 Cols) */}
                  <div className="lg:col-span-5 flex flex-col items-center justify-center p-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-surface-50">
                    <div className="text-center space-y-1 mb-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Live Mastery Estimation
                      </span>
                    </div>

                    <div className="relative flex h-32 w-32 items-center justify-center">
                      <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 100 100">
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          className="stroke-slate-200 dark:stroke-surface-100"
                          strokeWidth="8"
                          fill="transparent"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          className={simulatedScore >= 80 ? 'stroke-emerald-500' : 'stroke-brand-600'}
                          strokeWidth="8"
                          strokeDasharray={`${2 * Math.PI * 40}`}
                          strokeDashoffset={`${2 * Math.PI * 40 * (1 - simulatedScore / 100)}`}
                          strokeLinecap="round"
                          fill="transparent"
                          style={{ transition: 'stroke-dashoffset 0.6s cubic-bezier(0.16, 1, 0.3, 1)' }}
                        />
                      </svg>
                      <div className="absolute flex flex-col items-center justify-center text-center">
                        <span className="text-3xl font-black font-mono tracking-tight text-slate-900 dark:text-white">
                          {simulatedScore}%
                        </span>
                        <span className="text-[9px] uppercase font-bold text-slate-400">
                          {simulatedScore >= 80 ? 'Mastered' : 'Skill Level'}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between w-full text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-white/5 pt-2">
                      <span>Threshold: 80%</span>
                      <span className="font-semibold text-brand-600 dark:text-brand-400">Continuous Tracking</span>
                    </div>
                  </div>

                </div>

              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* Metrics Ribbon                                                */}
      {/* ------------------------------------------------------------- */}
      <section className="border-y border-slate-200 dark:border-white/[0.08] bg-white/60 dark:bg-[#060a15]/60 py-10 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                99.4%
              </div>
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Roadmap Precision
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-black text-brand-600 dark:text-brand-400 tracking-tight">
                3.8x
              </div>
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Faster Concept Mastery
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                100%
              </div>
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Non-Destructive Updates
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-black text-cyan-600 dark:text-cyan-400 tracking-tight">
                4 Tracks
              </div>
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Curated Career Paths
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* Asymmetrical Bento Grid: Core Innovation Pillars              */}
      {/* ------------------------------------------------------------- */}
      <section id="how-it-works" className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-600 dark:text-brand-400">
              Engineered for Real Comprehension
            </span>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-950 dark:text-white">
              Why SkillTwin Outperforms Static Courses
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">
              Four interconnected intelligence systems working continuously behind your screen to personalize your learning trajectory.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Bento Card 1: Confidence vs. Reality (7 cols) */}
            <div className="md:col-span-7 rounded-[2rem] border border-slate-200 dark:border-white/10 bg-white dark:bg-[#090f1e] p-7 sm:p-9 shadow-sm space-y-5 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/15 text-brand-600 dark:text-brand-400 border border-brand-500/30">
                  <UserCheck className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Confidence vs. Reality Breakdown
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Most learners suffer from an *illusion of competence* after passively watching video tutorials. SkillTwin pairs self-reported ratings with verified quiz evidence to expose unseen gaps before technical interviews.
                </p>
              </div>

              {/* Visual Demo Bar */}
              <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-surface-50 p-4 space-y-3">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-600 dark:text-slate-400">What You Felt You Knew</span>
                    <span className="text-amber-600 font-mono font-bold">85% (High Confidence)</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-200 dark:bg-surface-100 overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: '85%' }} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-600 dark:text-slate-400">Verified Quiz Evidence</span>
                    <span className="text-brand-600 dark:text-brand-400 font-mono font-bold">42% (Needs Reinforcement)</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-200 dark:bg-surface-100 overflow-hidden">
                    <div className="h-full bg-brand-500 rounded-full" style={{ width: '42%' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Bento Card 2: Smart Plan Updates (5 cols) */}
            <div className="md:col-span-5 rounded-[2rem] border border-slate-200 dark:border-white/10 bg-white dark:bg-[#090f1e] p-7 sm:p-9 shadow-sm space-y-5 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                  <Zap className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Non-Destructive Plan Updates
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  If you stumble on a tricky question, SkillTwin schedules targeted practice exercises right before harder chapters. Your previous achievements and finished topics remain 100% untouched.
                </p>
              </div>

              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2.5">
                <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-500" />
                <span>Zero course resets. Every completed chapter is permanently preserved.</span>
              </div>
            </div>

            {/* Bento Card 3: 24/7 AI Learning Tutor (5 cols) */}
            <div className="md:col-span-5 rounded-[2rem] border border-slate-200 dark:border-white/10 bg-white dark:bg-[#090f1e] p-7 sm:p-9 shadow-sm space-y-5 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30">
                  <Bot className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  24/7 AI Learning Tutor
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Ask deep conceptual questions at any point. Get formatted explanations, code examples, Big-O comparisons, and personalized study tips tailored specifically to your active roadmap.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-surface-50 p-3.5 space-y-2 text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Quick Prompt Preview:</span>
                <div className="flex flex-wrap gap-1.5">
                  <span className="rounded-lg bg-white dark:bg-surface-100 border border-slate-200 dark:border-white/5 px-2.5 py-1 text-[11px] text-slate-600 dark:text-slate-300">
                    "FastAPI vs Django"
                  </span>
                  <span className="rounded-lg bg-white dark:bg-surface-100 border border-slate-200 dark:border-white/5 px-2.5 py-1 text-[11px] text-slate-600 dark:text-slate-300">
                    "Explain Redis caching"
                  </span>
                </div>
              </div>
            </div>

            {/* Bento Card 4: Topological Career Roadmaps (7 cols) */}
            <div className="md:col-span-7 rounded-[2rem] border border-slate-200 dark:border-white/10 bg-white dark:bg-[#090f1e] p-7 sm:p-9 shadow-sm space-y-5 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30">
                  <Compass className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Strict Prerequisite Dependency Ordering
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  You never encounter concepts before their foundational prerequisites. Every topic is topologically sequenced so you build robust, production-grade understanding step by step.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center text-xs">
                <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-surface-50 p-3 space-y-1">
                  <div className="font-bold text-slate-900 dark:text-white">Foundations</div>
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">100% Unlocked</div>
                </div>
                <div className="rounded-xl border border-brand-500/40 bg-brand-500/10 p-3 space-y-1">
                  <div className="font-bold text-brand-600 dark:text-brand-300">Current Chapter</div>
                  <div className="text-[10px] text-brand-500 font-semibold">In Progress</div>
                </div>
                <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-surface-50 p-3 space-y-1 opacity-70">
                  <div className="font-bold text-slate-700 dark:text-slate-400">Advanced Modules</div>
                  <div className="text-[10px] text-slate-400 font-semibold">Unlocks next</div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* Interactive Quick Quiz Demo Section (Experience the Platform)  */}
      {/* ------------------------------------------------------------- */}
      <section id="interactive-demo" className="py-20 border-t border-slate-200 dark:border-white/[0.08] bg-slate-100/70 dark:bg-[#060a14]/80">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
              Interactive Test Drive
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-950 dark:text-white">
              Try a Quick 30-Second Practice Question
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              See how instant feedback and transparent score tracking feel in action.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-300 dark:border-white/15 bg-white dark:bg-[#090f1e] p-6 sm:p-8 shadow-xl space-y-6">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-3">
              <span className="rounded-full bg-brand-500/15 text-brand-600 dark:text-brand-300 px-3 py-1 text-xs font-bold border border-brand-500/30">
                Topic: OS Threads & Memory Models
              </span>
              <span className="text-xs font-semibold text-slate-400">Question 1 of 1</span>
            </div>

            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-snug">
              Why do multiple threads within the same process share heap memory while maintaining separate stack frames?
            </h3>

            <div className="space-y-3">
              {[
                {
                  id: 1,
                  text: 'To allow shared access to global data structures and objects while keeping local function executions and variables isolated.',
                  isCorrect: true,
                  explanation: 'Correct! The shared heap facilitates inter-thread communication, while private stacks prevent local variable collision during concurrent function calls.'
                },
                {
                  id: 2,
                  text: 'Because heap memory is significantly faster to read than stack memory.',
                  isCorrect: false,
                  explanation: 'Incorrect. Stack memory access is typically faster due to CPU cache locality and simple pointer adjustments.'
                },
                {
                  id: 3,
                  text: 'Threads cannot share any memory at all; they require IPC pipes for communication.',
                  isCorrect: false,
                  explanation: 'Incorrect. Separate processes require IPC; threads naturally share the process address space.'
                }
              ].map(opt => (
                <div
                  key={opt.id}
                  onClick={() => {
                    if (!interactiveQuizSubmitted) {
                      setInteractiveQuizChoice(opt.id);
                    }
                  }}
                  className={`rounded-2xl border p-4 text-xs font-medium cursor-pointer transition-all ${
                    interactiveQuizChoice === opt.id
                      ? interactiveQuizSubmitted
                        ? opt.isCorrect
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-900 dark:text-emerald-200'
                          : 'border-rose-500 bg-rose-500/10 text-rose-900 dark:text-rose-200'
                        : 'border-brand-500 bg-brand-500/10 text-brand-900 dark:text-brand-200'
                      : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-surface-50 hover:border-slate-300 dark:hover:border-white/20'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[11px] font-bold ${
                      interactiveQuizChoice === opt.id
                        ? 'border-brand-500 bg-brand-600 text-white'
                        : 'border-slate-300 dark:border-white/20 text-slate-500'
                    }`}>
                      {String.fromCharCode(64 + opt.id)}
                    </div>
                    <div className="space-y-1">
                      <p className="leading-relaxed">{opt.text}</p>
                      {interactiveQuizSubmitted && interactiveQuizChoice === opt.id && (
                        <p className={`text-[11px] font-semibold mt-2 pt-2 border-t ${opt.isCorrect ? 'border-emerald-500/30 text-emerald-600 dark:text-emerald-300' : 'border-rose-500/30 text-rose-600 dark:text-rose-300'}`}>
                          {opt.explanation}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => {
                  setInteractiveQuizChoice(null);
                  setInteractiveQuizSubmitted(false);
                }}
                className="text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                Reset Question
              </button>

              <button
                disabled={interactiveQuizChoice === null || interactiveQuizSubmitted}
                onClick={() => setInteractiveQuizSubmitted(true)}
                className="rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-40 px-6 py-2.5 text-xs font-bold text-white shadow-sm transition-all btn-tactile"
              >
                {interactiveQuizSubmitted ? 'Answer Evaluated ✓' : 'Submit Practice Answer'}
              </button>
            </div>

          </div>

        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* Curated Career Tracks Explorer                                */}
      {/* ------------------------------------------------------------- */}
      <section id="tracks" className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-600 dark:text-brand-400">
              Curated Curriculum
            </span>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-950 dark:text-white">
              Choose Your Target Specialization
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">
              Explore meticulously mapped competencies with strict prerequisites and verified skill milestones.
            </p>
          </div>

          {/* Track Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {domainsList.map(dom => (
              <button
                key={dom.id}
                onClick={() => setSelectedTrackId(dom.id)}
                className={`flex items-center gap-2 rounded-2xl px-5 py-3 text-xs sm:text-sm font-bold transition-all ${
                  selectedTrackId === dom.id
                    ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/25 scale-[1.02]'
                    : 'border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-50 text-slate-700 dark:text-slate-300 hover:border-brand-500/40'
                }`}
              >
                {dom.id === 'backend_engineering' && <Database className="h-4 w-4" />}
                {dom.id === 'python_fundamentals' && <Code2 className="h-4 w-4" />}
                {dom.id === 'web_basics' && <Globe className="h-4 w-4" />}
                {dom.id === 'data_analysis' && <BarChart3 className="h-4 w-4" />}
                <span>{dom.name}</span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] ${
                  selectedTrackId === dom.id ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-surface-100 text-slate-500'
                }`}>
                  {dom.nodeCount} Topics
                </span>
              </button>
            ))}
          </div>

          {/* Selected Track Preview Card */}
          <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#090f1e] p-6 sm:p-8 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-white/10 pb-5">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {activeTrackMeta.name} Roadmap Preview
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {activeTrackMeta.description}
                </p>
              </div>

              <button
                onClick={() => {
                  switchDomain(selectedTrackId as any);
                  onEnterApp();
                }}
                className="flex items-center gap-2 rounded-xl bg-brand-600 hover:bg-brand-500 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition-all btn-tactile"
              >
                <span>Launch This Track</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Sequence Steps */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {(trackCurricula[selectedTrackId] || trackCurricula.backend_engineering).map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-surface-50 p-4 space-y-3 relative overflow-hidden"
                >
                  <div className="flex items-center justify-between">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-brand-500/15 text-brand-600 dark:text-brand-300 font-mono text-xs font-bold">
                      {item.step}
                    </span>
                    <span className="rounded-full bg-slate-200 dark:bg-surface-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                      {item.tag}
                    </span>
                  </div>

                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-snug line-clamp-2">
                    {item.title}
                  </h4>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-200 dark:border-white/5 pt-2">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {item.time}
                    </span>
                    <span className="font-semibold text-brand-600 dark:text-brand-400">Prerequisite Ready</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* Comparison Matrix: Static Courses vs SkillTwin                */}
      {/* ------------------------------------------------------------- */}
      <section id="comparison" className="py-20 border-t border-slate-200 dark:border-white/[0.08] bg-slate-100/60 dark:bg-[#060a14]/60">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
              Direct Comparison
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-950 dark:text-white">
              Why Linear Learning Fails in Tech
            </h2>
          </div>

          <div className="overflow-hidden rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#090f1e] shadow-xl">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-surface-50">
                <tr>
                  <th className="p-4 sm:p-6 font-bold text-slate-900 dark:text-white">Capability</th>
                  <th className="p-4 sm:p-6 font-bold text-slate-400">Traditional Video Courses</th>
                  <th className="p-4 sm:p-6 font-bold text-brand-600 dark:text-brand-400">SkillTwin Adaptive Twin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                <tr>
                  <td className="p-4 sm:p-6 font-semibold text-slate-800 dark:text-slate-200">Study Path Sequencing</td>
                  <td className="p-4 sm:p-6 text-slate-500">Rigid 1-to-N fixed playlist for everyone</td>
                  <td className="p-4 sm:p-6 text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    Topological DAG tailored to your role
                  </td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-6 font-semibold text-slate-800 dark:text-slate-200">When You Stumble</td>
                  <td className="p-4 sm:p-6 text-slate-500">You are left behind or forced to restart</td>
                  <td className="p-4 sm:p-6 text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    Targeted practice inserted non-destructively
                  </td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-6 font-semibold text-slate-800 dark:text-slate-200">Skill Verification</td>
                  <td className="p-4 sm:p-6 text-slate-500">Passive video completion checkmarks</td>
                  <td className="p-4 sm:p-6 text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    Continuous Bayesian Knowledge Tracing (BKT)
                  </td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-6 font-semibold text-slate-800 dark:text-slate-200">Conceptual Q&A</td>
                  <td className="p-4 sm:p-6 text-slate-500">Slow forum replies or none</td>
                  <td className="p-4 sm:p-6 text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    24/7 Context-Aware AI Learning Tutor
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* Bottom CTA Banner                                             */}
      {/* ------------------------------------------------------------- */}
      <section className="py-20 sm:py-28 relative">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="rounded-[2.5rem] border border-brand-500/30 bg-gradient-to-b from-brand-500/15 to-cyan-500/10 dark:from-brand-500/20 dark:to-cyan-500/5 p-8 sm:p-14 shadow-2xl relative overflow-hidden backdrop-blur-xl space-y-6">
            
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-white/60 dark:bg-black/40 px-4 py-1 text-xs font-semibold text-brand-700 dark:text-brand-300">
              <Flame className="h-3.5 w-3.5 text-amber-500" />
              <span>Ready to upgrade your tech learning?</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-black text-slate-950 dark:text-white tracking-tight">
              Build Your Personalized Study Path in Seconds
            </h2>

            <p className="mx-auto max-w-xl text-sm sm:text-base text-slate-600 dark:text-slate-300">
              Join thousands of software engineers learning faster with an adaptive curriculum that respects your time.
            </p>

            <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={() => openAuth('signup')}
                className="flex items-center gap-2 rounded-2xl bg-brand-600 hover:bg-brand-500 px-8 py-4 text-sm font-bold text-white shadow-xl shadow-brand-500/30 transition-all btn-tactile"
              >
                <Sparkles className="h-4 w-4" />
                <span>Start Learning Free</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                onClick={onEnterApp}
                className="flex items-center gap-2 rounded-2xl border border-slate-300 dark:border-white/20 bg-white dark:bg-surface-50 px-6 py-4 text-sm font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 transition-all btn-tactile"
              >
                <Play className="h-4 w-4 fill-current text-cyan-500" />
                <span>Explore Guest Demo</span>
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-white/[0.08] py-8 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="mx-auto max-w-7xl px-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 dark:text-white">SkillTwin</span>
            <span>— Personalized Adaptive Learning Platform</span>
          </div>
          <div>
            <span>© {new Date().getFullYear()} SkillTwin Inc. All rights reserved.</span>
          </div>
        </div>
      </footer>

      {/* ------------------------------------------------------------- */}
      {/* Auth Modal (Sign Up & Sign In)                                */}
      {/* ------------------------------------------------------------- */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-slate-300 dark:border-white/15 bg-white dark:bg-[#0b101b] p-6 shadow-2xl animate-modal-reveal">
            
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-600 text-white font-bold">
                  <Sparkles className="h-4 w-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {authMode === 'signup' ? 'Create Free Account' : 'Sign In to SkillTwin'}
                </h3>
              </div>

              <button
                onClick={() => setIsAuthModalOpen(false)}
                className="rounded-xl border border-slate-200 dark:border-white/10 p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Switch Tabs */}
            <div className="mt-4 flex rounded-xl bg-slate-100 dark:bg-surface-100 p-1 text-xs">
              <button
                type="button"
                onClick={() => setAuthMode('signup')}
                className={`flex-1 rounded-lg py-1.5 font-semibold transition-all ${
                  authMode === 'signup'
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Create Account
              </button>
              <button
                type="button"
                onClick={() => setAuthMode('login')}
                className={`flex-1 rounded-lg py-1.5 font-semibold transition-all ${
                  authMode === 'login'
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Sign In
              </button>
            </div>

            {authError && (
              <div className="mt-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-2.5 text-xs text-rose-600 dark:text-rose-300">
                {authError}
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="mt-4 space-y-3 text-xs">
              {authMode === 'signup' && (
                <>
                  <div>
                    <label className="text-slate-700 dark:text-slate-300 block mb-1 font-semibold">Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Alex Rivera"
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-surface-50 px-3 py-2 text-slate-900 dark:text-white focus:border-brand-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-slate-700 dark:text-slate-300 block mb-1 font-semibold">Target Role / Goal</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Senior Backend Engineer"
                      value={targetRole}
                      onChange={e => setTargetRole(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-surface-50 px-3 py-2 text-slate-900 dark:text-white focus:border-brand-500 focus:outline-none"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="text-slate-700 dark:text-slate-300 block mb-1 font-semibold">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-surface-50 px-3 py-2 text-slate-900 dark:text-white focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-700 dark:text-slate-300 block mb-1 font-semibold">Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-surface-50 px-3 py-2 text-slate-900 dark:text-white focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand-600 hover:bg-brand-500 py-2.5 text-xs font-bold text-white shadow-sm transition-all btn-tactile disabled:opacity-50"
                >
                  {authMode === 'signup' ? <UserPlus className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
                  <span>{isSubmitting ? 'Processing...' : authMode === 'signup' ? 'Create Account & Enter' : 'Sign In & Enter'}</span>
                </button>
              </div>
            </form>

            <div className="mt-4 text-center">
              <button
                onClick={() => {
                  setIsAuthModalOpen(false);
                  onEnterApp();
                }}
                className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                Or continue with instant demo mode →
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
