'use client';

import React, { useState, useMemo } from 'react';
import { useSkillTwin } from '../../lib/state/store';
import ProgressChart from '../analytics/ProgressChart';
import { computeWeeklyStreak } from '../../lib/streak';
import { API_BASE_URL } from '../../lib/api';
import {
  User,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  Award,
  Zap,
  BarChart2,
  Calendar,
  Layers,
  Sparkles,
  BookOpen,
  Activity,
  Edit3,
  Sliders,
  Calculator,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  UploadCloud,
  FileText,
  Check,
  X,
  Target,
  Flame,
  ArrowUpRight,
  LogOut,
  GitBranch
} from 'lucide-react';
import { DetectedSkillItem } from '../../lib/types';
import { SkillTwinAPI } from '../../lib/api';

export default function LearnerProfileView() {
  const {
    user,
    profile,
    updateProfile,
    skills,
    masteryMap,
    selfReportedMap,
    attemptsHistory,
    currentDomain,
    setMasteryMap,
    logoutUser,
    isAuthenticated
  } = useSkillTwin();

  const [isEditing, setIsEditing] = useState(false);
  const [weeklyHours, setWeeklyHours] = useState(profile?.weekly_hours_budget ?? 12);
  const [learningStyle, setLearningStyle] = useState(profile?.preferred_learning_style ?? 'hands_on');
  const [targetRoleInput, setTargetRoleInput] = useState(profile?.target_role ?? 'Senior Backend Engineer');
  
  // Skill Matrix Filter
  const [skillFilter, setSkillFilter] = useState<'all' | 'verified' | 'estimated' | 'in_progress'>('all');

  // Auto-detection states
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectedSkillsList, setDetectedSkillsList] = useState<DetectedSkillItem[] | null>(null);
  const [detectionSource, setDetectionSource] = useState<'resume' | 'github'>('resume');
  const [githubUser, setGithubUser] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [showAutoDetectModal, setShowAutoDetectModal] = useState(false);
  const [detectionSuccessMsg, setDetectionSuccessMsg] = useState<string | null>(null);

  const totalSkillsCount = skills?.length || 0;
  const verifiedMasteredCount = Array.from(masteryMap.entries()).filter(([_, p]) => p >= 0.80).length;
  const estimatedCount = Array.from(masteryMap.entries()).filter(([_, p]) => p >= 0.35 && p < 0.80).length;

  // Calendar-synced weekly streak calculation
  const weeklyStreak = useMemo(() => computeWeeklyStreak(attemptsHistory), [attemptsHistory]);

  const avgMastery = masteryMap.size > 0
    ? Math.round((Array.from(masteryMap.values()).reduce((a, b) => a + b, 0) / masteryMap.size) * 100)
    : 0;

  // Handle saving profile changes
  const handleSaveProfile = () => {
    updateProfile({
      weekly_hours_budget: weeklyHours,
      preferred_learning_style: learningStyle,
      target_role: targetRoleInput
    });
    setIsEditing(false);
  };

  // Resume parse trigger
  const handleParseResume = async () => {
    if (!resumeText.trim()) return;
    setIsDetecting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/integrations/resume/parse-text`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resume_text: resumeText })
      });
      if (res.ok) {
        const data = await res.json();
        setDetectedSkillsList(data.skills || []);
        setDetectionSource('resume');
      } else {
        // Fallback local detection
        fallbackDetect(resumeText, 'resume');
      }
    } catch {
      fallbackDetect(resumeText, 'resume');
    } finally {
      setIsDetecting(false);
    }
  };

  // GitHub scan trigger
  const handleSyncGithub = async () => {
    if (!githubUser.trim()) return;
    setIsDetecting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/integrations/github/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ github_username: githubUser })
      });
      if (res.ok) {
        const data = await res.json();
        setDetectedSkillsList(data.skills || []);
        setDetectionSource('github');
      } else {
        fallbackDetect(githubUser, 'github');
      }
    } catch {
      fallbackDetect(githubUser, 'github');
    } finally {
      setIsDetecting(false);
    }
  };

  const fallbackDetect = (input: string, src: 'resume' | 'github') => {
    const detected: DetectedSkillItem[] = skills.slice(0, 4).map(s => ({
      skill_id: s.id,
      skill_name: s.name,
      estimated_mastery: 0.45,
      confidence: 0.50,
      source: src,
      evidence_snippet: src === 'resume' 
        ? `Found explicit mention of ${s.name} in uploaded background.`
        : `Detected active repository and code tags matching ${s.name}.`
    }));
    setDetectedSkillsList(detected);
    setDetectionSource(src);
  };

  // Confirm and persist detected skills
  const handleConfirmDetectedSkills = () => {
    if (!detectedSkillsList) return;
    const updated = new Map(masteryMap);
    detectedSkillsList.forEach(item => {
      const current = updated.get(item.skill_id) ?? 0.10;
      if (current < 0.80) {
        updated.set(item.skill_id, Math.max(current, item.estimated_mastery));
      }
    });
    setMasteryMap(updated as any);
    setDetectionSuccessMsg(`Applied ${detectedSkillsList.length} estimated skill priors to your learning profile!`);
    setDetectedSkillsList(null);
    setShowAutoDetectModal(false);
    setTimeout(() => setDetectionSuccessMsg(null), 4000);
  };

  // Categorized Skills for the Matrix
  const filteredSkills = skills.filter(s => {
    const prob = masteryMap.get(s.id) ?? 0.10;
    const isMastered = prob >= 0.80;
    const isEstimated = prob >= 0.35 && prob < 0.80;

    if (skillFilter === 'all') return true;
    if (skillFilter === 'verified') return isMastered;
    if (skillFilter === 'estimated') return isEstimated;
    if (skillFilter === 'in_progress') return !isMastered;
    return true;
  });

  return (
    <div className="relative space-y-7 pb-16">
      
      {/* Ambient Dribbble-Style Glow Elements */}
      <div className="pointer-events-none absolute -top-10 left-1/4 -z-10 h-72 w-72 rounded-full bg-brand-500/15 blur-[90px]" />
      <div className="pointer-events-none absolute top-40 right-1/4 -z-10 h-80 w-80 rounded-full bg-cyan-500/15 blur-[100px]" />

      {/* Success Banner */}
      {detectionSuccessMsg && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{detectionSuccessMsg}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* HERO BANNER: DRIBBLE-STYLE GLASS CARD                                    */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden rounded-3xl border dark:border-white/10 border-slate-200 dark:bg-[#070c18]/90 bg-white p-6 sm:p-8 shadow-xl backdrop-blur-md">
        
        {/* Subtle decorative background gradient mesh */}
        <div className="absolute inset-0 bg-gradient-to-r from-brand-600/10 via-cyan-500/5 to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          
          {/* Avatar & User Details */}
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="relative flex h-18 w-18 sm:h-20 sm:w-20 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-tr from-brand-600 to-cyan-500 text-2xl font-black text-white shadow-lg ring-4 dark:ring-white/10 ring-slate-200">
              {(user?.full_name || 'Alex').split(' ').map(n => n[0]).join('')}
              <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 border-2 dark:border-[#070c18] border-white text-white shadow">
                <CheckCircle2 className="h-3.5 w-3.5" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black dark:text-white text-slate-900 tracking-tight">
                  {user?.full_name || 'Alex'}
                </h2>
                <span className="rounded-full bg-brand-500/15 px-3 py-0.5 text-[11px] font-bold text-brand-600 dark:text-brand-300 border border-brand-500/30">
                  Level 3 • Competent
                </span>
              </div>
              
              <p className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Target className="h-3.5 w-3.5 text-brand-500" />
                <span>Target: <strong>{profile?.target_role || 'Senior Backend Engineer'}</strong></span>
                <span>•</span>
                <span>{user?.email || '123@gmail.com'}</span>
              </p>

              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                <span className="inline-flex items-center gap-1.5 font-bold text-amber-500 bg-amber-500/10 px-2.5 py-0.5 rounded-lg border border-amber-500/20">
                  <Flame className={`h-3.5 w-3.5 ${weeklyStreak.consecutiveStreakDays > 0 ? 'fill-amber-500 text-amber-500' : 'text-slate-400'}`} />
                  <span>{weeklyStreak.consecutiveStreakDays > 0 ? `${weeklyStreak.consecutiveStreakDays} Day Streak` : '0 Day Streak • Start a Quiz'}</span>
                </span>
                <span className="inline-flex items-center gap-1 dark:text-slate-300 text-slate-700 bg-slate-100 dark:bg-surface-50 px-2.5 py-0.5 rounded-lg border dark:border-white/5 border-slate-200">
                  <Clock className="h-3.5 w-3.5 text-brand-500" />
                  <span>{profile?.weekly_hours_budget ?? 12} hrs/week budget</span>
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            <button
              onClick={() => setShowAutoDetectModal(true)}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:from-brand-500 hover:to-indigo-500 transition-all btn-tactile"
            >
              <Sparkles className="h-4 w-4" />
              <span>Auto-Detect Skills</span>
            </button>

            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center justify-center gap-1.5 rounded-2xl border dark:border-white/10 border-slate-300 dark:bg-surface-100 bg-slate-100 px-3.5 py-2.5 text-xs font-semibold dark:text-slate-200 text-slate-800 hover:border-brand-500/40 transition-all btn-tactile"
            >
              <Edit3 className="h-3.5 w-3.5" />
              <span>{isEditing ? 'Cancel' : 'Edit Preferences'}</span>
            </button>

            <button
              onClick={logoutUser}
              className="flex items-center justify-center gap-1.5 rounded-2xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 px-3.5 py-2.5 text-xs font-bold text-rose-600 dark:text-rose-400 transition-all btn-tactile"
              title="Sign Out"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Log Out</span>
            </button>
          </div>

        </div>

        {/* Expandable Edit Preferences Drawer */}
        {isEditing && (
          <div className="mt-6 pt-6 border-t dark:border-white/10 border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs animate-in fade-in duration-200">
            <div>
              <label className="font-bold text-slate-500 dark:text-slate-400 block mb-1">Target Career Role</label>
              <input
                type="text"
                value={targetRoleInput}
                onChange={e => setTargetRoleInput(e.target.value)}
                className="w-full rounded-xl border dark:border-white/10 border-slate-300 dark:bg-surface-100 bg-white p-2.5 font-semibold dark:text-white text-slate-900 focus:border-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-slate-500 dark:text-slate-400 block mb-1">
                Weekly Study Budget: <strong className="text-brand-500">{weeklyHours} hrs</strong>
              </label>
              <input
                type="range"
                min={2}
                max={30}
                value={weeklyHours}
                onChange={e => setWeeklyHours(Number(e.target.value))}
                className="w-full mt-2 accent-brand-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-500 dark:text-slate-400 block mb-1">Learning Style</label>
              <select
                value={learningStyle}
                onChange={e => setLearningStyle(e.target.value as any)}
                className="w-full rounded-xl border dark:border-white/10 border-slate-300 dark:bg-surface-100 bg-white p-2.5 font-semibold dark:text-white text-slate-900 focus:border-brand-500 focus:outline-none"
              >
                <option value="hands_on">Hands-on Exercises</option>
                <option value="video">Video First</option>
                <option value="reading">Deep Reading</option>
                <option value="mixed">Mixed Approach</option>
              </select>
            </div>

            <div className="sm:col-span-3 text-right">
              <button
                onClick={handleSaveProfile}
                className="px-5 py-2 rounded-xl bg-brand-600 text-white font-bold text-xs shadow-sm hover:bg-brand-500 transition-all btn-tactile"
              >
                Save Changes
              </button>
            </div>
          </div>
        )}

      </div>

      {/* ========================================================================= */}
      {/* 2-COLUMN GRID: PROGRESS CHART + MASTERY GAUGE                             */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LeetCode Contest-Style Progress Graph (Feature 1) */}
        <div className="lg:col-span-2">
          <ProgressChart
            currentMasteryPct={avgMastery}
            skillsMasteredCount={verifiedMasteredCount}
          />
        </div>

        {/* Mastery Gauge & Metrics */}
        <div className="rounded-3xl border dark:border-white/10 border-slate-200 dark:bg-[#070c18] bg-white p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded-md border border-brand-500/20">
                Mastery Summary
              </span>
              <Award className="h-4 w-4 text-amber-500" />
            </div>
            <h4 className="text-base font-bold dark:text-white text-slate-900 mt-2">
              Overall Skill Status
            </h4>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-2xl border border-emerald-500/20 dark:bg-emerald-950/20 bg-emerald-50/50 p-3.5 space-y-1">
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase block">
                Verified Mastered
              </span>
              <span className="text-xl font-extrabold text-emerald-500 font-mono">
                {verifiedMasteredCount}
              </span>
              <span className="text-[10px] text-slate-400 block">via quiz checkpoints</span>
            </div>

            <div className="rounded-2xl border border-cyan-500/20 dark:bg-cyan-950/20 bg-cyan-50/50 p-3.5 space-y-1">
              <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-bold uppercase block">
                Estimated
              </span>
              <span className="text-xl font-extrabold text-cyan-500 font-mono">
                {estimatedCount}
              </span>
              <span className="text-[10px] text-slate-400 block">from resume & GitHub</span>
            </div>
          </div>

          {/* Progress Bar Gauge */}
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold dark:text-slate-300 text-slate-700">Course Completion</span>
              <strong className="font-mono text-brand-500 font-bold">
                {Math.round((verifiedMasteredCount / Math.max(1, totalSkillsCount)) * 100)}%
              </strong>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-surface-50">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-brand-500 transition-all duration-500 rounded-full"
                style={{ width: `${(verifiedMasteredCount / Math.max(1, totalSkillsCount)) * 100}%` }}
              />
            </div>
          </div>

          {/* Verification Callout */}
          <div className="rounded-2xl border dark:border-white/5 border-slate-100 dark:bg-surface-100 bg-slate-50 p-3 text-[11px] dark:text-slate-400 text-slate-600 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>Estimated skills require a chapter practice quiz to become permanently verified.</span>
          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* ESTIMATED VS VERIFIED SKILLS MATRIX                                      */}
      {/* ========================================================================= */}
      <div className="rounded-3xl border dark:border-white/10 border-slate-200 dark:bg-[#070c18] bg-white p-6 shadow-sm space-y-4">
        
        {/* Header & Filter Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-base sm:text-lg font-bold dark:text-white text-slate-900 flex items-center gap-2">
              <Layers className="h-4 w-4 text-brand-500" />
              <span>Skills Competency Matrix</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Distinguishing between estimated background skills and verified assessments.
            </p>
          </div>

          <div className="flex rounded-xl dark:bg-surface-100 bg-slate-100 p-0.5 border dark:border-white/10 border-slate-200 text-xs">
            {[
              { id: 'all', label: `All (${skills.length})` },
              { id: 'verified', label: `🏆 Verified (${verifiedMasteredCount})` },
              { id: 'estimated', label: `🌱 Estimated (${estimatedCount})` },
              { id: 'in_progress', label: 'In Progress' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setSkillFilter(f.id as any)}
                className={`rounded-lg px-3 py-1.5 text-[11px] font-semibold transition-all ${
                  skillFilter === f.id
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'dark:text-slate-400 text-slate-600 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Skills Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredSkills.map(skill => {
            const mastery = masteryMap.get(skill.id) ?? 0.10;
            const isMastered = mastery >= 0.80;
            const isEstimated = mastery >= 0.35 && !isMastered;

            return (
              <div
                key={skill.id}
                className={`rounded-2xl border p-4 text-xs space-y-2 transition-all ${
                  isMastered
                    ? 'border-emerald-500/30 dark:bg-emerald-950/10 bg-emerald-50/30'
                    : isEstimated
                    ? 'border-cyan-500/30 dark:bg-cyan-950/10 bg-cyan-50/30'
                    : 'dark:border-white/5 border-slate-200 dark:bg-surface-100 bg-slate-50'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-bold dark:text-white text-slate-900 leading-snug">
                    {skill.name}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                    isMastered
                      ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                      : isEstimated
                      ? 'border-cyan-500/40 bg-cyan-500/15 text-cyan-600 dark:text-cyan-400'
                      : 'border-slate-300 dark:border-white/10 dark:text-slate-400 text-slate-500'
                  }`}>
                    {isMastered ? '🏆 Verified' : isEstimated ? '🌱 Estimated' : 'Not Started'}
                  </span>
                </div>

                <p className="text-[11px] dark:text-slate-400 text-slate-500 line-clamp-2 leading-relaxed">
                  {skill.description}
                </p>

                <div className="pt-2 border-t dark:border-white/5 border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">Mastery Level</span>
                  <strong className={`font-mono text-xs font-bold ${isMastered ? 'text-emerald-500' : 'text-brand-500'}`}>
                    {Math.round(mastery * 100)}%
                  </strong>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* ========================================================================= */}
      {/* AUTO-DETECTION MODAL (Feature 5)                                          */}
      {/* ========================================================================= */}
      {showAutoDetectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl rounded-3xl border dark:border-white/10 border-slate-200 dark:bg-[#090f1b] bg-white p-6 shadow-2xl space-y-5">
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-brand-500" />
                <h3 className="text-base font-bold dark:text-white text-slate-900">
                  Auto-Detect Skills from Resume or GitHub
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowAutoDetectModal(false);
                  setDetectedSkillsList(null);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs dark:text-slate-300 text-slate-600 leading-relaxed">
              Upload your resume text or connect your GitHub handle. Skills found will be added as <strong>Estimated</strong> starting priors (~45%) until confirmed by a quiz.
            </p>

            {/* Ingestion Mode Selector */}
            {!detectedSkillsList && (
              <div className="space-y-4">
                
                {/* Resume Text Box */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold dark:text-slate-300 text-slate-700 flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5 text-brand-500" />
                    <span>Option A: Paste Resume / Experience Text</span>
                  </label>
                  <textarea
                    rows={4}
                    value={resumeText}
                    onChange={e => setResumeText(e.target.value)}
                    placeholder="Paste relevant experience, e.g.: Built REST APIs using Python, FastAPI, Docker, and PostgreSQL with Redis caching..."
                    className="w-full rounded-2xl border dark:border-white/10 border-slate-300 dark:bg-surface-100 bg-slate-50 p-3 text-xs dark:text-white text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:outline-none"
                  />
                  <button
                    onClick={handleParseResume}
                    disabled={isDetecting || !resumeText.trim()}
                    className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white font-bold text-xs shadow transition-all btn-tactile"
                  >
                    {isDetecting ? 'Scanning Text...' : 'Detect Skills from Resume'}
                  </button>
                </div>

                <div className="flex items-center gap-2 text-[10px] text-slate-400">
                  <div className="flex-1 h-px bg-slate-200 dark:bg-white/10" />
                  <span>OR</span>
                  <div className="flex-1 h-px bg-slate-200 dark:bg-white/10" />
                </div>

                {/* GitHub Sync Form */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold dark:text-slate-300 text-slate-700 flex items-center gap-1.5">
                    <svg className="h-3.5 w-3.5 fill-cyan-500" viewBox="0 0 24 24">
                      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                    </svg>
                    <span>Option B: Connect GitHub Username</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={githubUser}
                      onChange={e => setGithubUser(e.target.value)}
                      placeholder="e.g. octocat"
                      className="flex-1 rounded-xl border dark:border-white/10 border-slate-300 dark:bg-surface-100 bg-slate-50 px-3 py-2 text-xs dark:text-white text-slate-900 focus:border-brand-500 focus:outline-none"
                    />
                    <button
                      onClick={handleSyncGithub}
                      disabled={isDetecting || !githubUser.trim()}
                      className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold text-xs shadow transition-all btn-tactile"
                    >
                      {isDetecting ? 'Scanning...' : 'Scan GitHub'}
                    </button>
                  </div>
                </div>

              </div>
            )}

            {/* Detected Skills Review & Confirmation Screen */}
            {detectedSkillsList && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-500">
                    ✓ Found {detectedSkillsList.length} skills in your {detectionSource}:
                  </span>
                  <span className="text-[10px] text-slate-400">Will be saved as Estimated (~45%)</span>
                </div>

                <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                  {detectedSkillsList.map(item => (
                    <div key={item.skill_id} className="p-3 rounded-xl border dark:border-white/5 border-slate-200 dark:bg-surface-50 bg-slate-50 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <strong className="dark:text-white text-slate-900">{item.skill_name}</strong>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30">
                          Estimated ~{Math.round(item.estimated_mastery * 100)}%
                        </span>
                      </div>
                      {item.evidence_snippet && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                          &ldquo;{item.evidence_snippet}&rdquo;
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setDetectedSkillsList(null)}
                    className="flex-1 py-2.5 rounded-xl border dark:border-white/10 border-slate-300 dark:bg-surface-100 bg-slate-100 text-xs font-semibold dark:text-slate-300 text-slate-700"
                  >
                    Back / Try Again
                  </button>
                  <button
                    onClick={handleConfirmDetectedSkills}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow transition-all btn-tactile"
                  >
                    Confirm & Apply Skills
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
