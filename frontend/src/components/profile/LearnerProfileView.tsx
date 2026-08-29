'use client';

import React, { useState } from 'react';
import { useSkillTwin } from '../../lib/state/store';
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
  HelpCircle
} from 'lucide-react';
import { bktStep, DEFAULT_BKT_PARAMS } from '../../lib/engine/bkt';

export default function LearnerProfileView() {
  const {
    user,
    profile,
    updateProfile,
    skills,
    masteryMap,
    selfReportedMap,
    attemptsHistory,
    openBktModal
  } = useSkillTwin();

  const [isEditing, setIsEditing] = useState(false);
  const [showSandbox, setShowSandbox] = useState(false);
  const [weeklyHours, setWeeklyHours] = useState(profile.weekly_hours_budget);
  const [learningStyle, setLearningStyle] = useState(profile.preferred_learning_style);

  // Interactive BKT Sandbox States
  const [sandboxPrior, setSandboxPrior] = useState<number>(0.40);
  const [sandboxIsCorrect, setSandboxIsCorrect] = useState<boolean>(true);
  const [sandboxTransit, setSandboxTransit] = useState<number>(0.15);
  const [sandboxSlip, setSandboxSlip] = useState<number>(0.10);
  const [sandboxGuess, setSandboxGuess] = useState<number>(0.20);

  const sandboxResult = bktStep(
    sandboxPrior,
    sandboxIsCorrect,
    {
      p_transit: sandboxTransit,
      p_slip: sandboxSlip,
      p_guess: sandboxGuess,
      threshold: 0.80
    }
  );

  const avgVerifiedMastery = masteryMap.size > 0
    ? Math.round((Array.from(masteryMap.values()).reduce((a, b) => a + b, 0) / masteryMap.size) * 100)
    : 0;

  const avgSelfReported = selfReportedMap.size > 0
    ? Math.round((Array.from(selfReportedMap.values()).reduce((a, b) => a + b, 0) / selfReportedMap.size) * 100)
    : 0;

  const calibrationDelta = avgSelfReported - avgVerifiedMastery;

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Banner: Profile Overview */}
      <div className="rounded-3xl border dark:border-white/10 border-slate-200 dark:bg-[#090f1b] bg-white p-6 sm:p-8 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-600 text-xl font-bold text-white shadow-sm">
              {user.full_name.split(' ').map(n => n[0]).join('')}
              <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 border-2 dark:border-[#090f1b] border-white text-white">
                <CheckCircle2 className="h-3 w-3" />
              </div>
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold dark:text-white text-slate-900 tracking-tight">{user.full_name}</h2>
                <span className="rounded-full bg-brand-500/15 px-2.5 py-0.5 text-[10px] font-bold uppercase text-brand-600 dark:text-brand-300 border border-brand-500/30">
                  {profile.prior_experience_level.toUpperCase()}
                </span>
              </div>
              <p className="text-xs sm:text-sm dark:text-slate-300 text-slate-600">{profile.target_role} • {user.email}</p>
              <div className="flex flex-wrap items-center gap-3 text-xs dark:text-slate-400 text-slate-500 pt-1">
                <span>⏱️ {profile.weekly_hours_budget} hrs/week commitment</span>
                <span>•</span>
                <span>🎨 Style: {profile.preferred_learning_style.replace('_', ' ')}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-2 rounded-xl border dark:border-white/10 border-slate-300 dark:bg-surface-50 bg-white hover:bg-slate-50 dark:hover:bg-surface-100 px-4 py-2 text-xs font-semibold dark:text-slate-200 text-slate-700 transition-all btn-tactile"
            >
              <Edit3 className="h-3.5 w-3.5" />
              <span>{isEditing ? 'Close Settings' : 'Edit Study Preferences'}</span>
            </button>
          </div>
        </div>

        {/* Quick Preference Editor */}
        {isEditing && (
          <div className="mt-5 rounded-2xl border dark:border-white/10 border-slate-200 dark:bg-surface-100 bg-white p-4 animate-in fade-in">
            <h4 className="text-xs font-bold dark:text-white text-slate-900 mb-3 uppercase tracking-wider">
              Update Preferences
            </h4>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs dark:text-slate-300 text-slate-700 block mb-1">Weekly Study Commitment (Hours)</label>
                <input
                  type="number"
                  min="2"
                  max="40"
                  value={weeklyHours}
                  onChange={e => setWeeklyHours(parseInt(e.target.value) || 10)}
                  className="w-full rounded-xl border dark:border-white/10 border-slate-300 dark:bg-surface-50 bg-slate-50 px-3.5 py-2 text-xs dark:text-white text-slate-900 focus:border-brand-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs dark:text-slate-300 text-slate-700 block mb-1">Preferred Learning Style</label>
                <select
                  value={learningStyle}
                  onChange={e => setLearningStyle(e.target.value as any)}
                  className="w-full rounded-xl border dark:border-white/10 border-slate-300 dark:bg-surface-50 bg-slate-50 px-3.5 py-2 text-xs dark:text-white text-slate-900 focus:border-brand-500 focus:outline-none"
                >
                  <option value="hands_on">Hands-on Exercises & Projects</option>
                  <option value="video">Video Lectures & Walkthroughs</option>
                  <option value="reading">Deep Technical Documentation</option>
                  <option value="mixed">Mixed Hybrid Approach</option>
                </select>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => {
                  updateProfile({ weekly_hours_budget: weeklyHours, preferred_learning_style: learningStyle });
                  setIsEditing(false);
                }}
                className="rounded-xl bg-brand-600 hover:bg-brand-500 px-4 py-1.5 text-xs font-bold text-white shadow-sm btn-tactile"
              >
                Save Changes
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Confidence vs. Reality: Your Actual Skill Level */}
      <div className="rounded-3xl border dark:border-white/10 border-slate-200 dark:bg-[#090f1b] bg-white p-6 sm:p-8 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b dark:border-white/10 border-slate-200 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-cyan-500/15 px-2.5 py-0.5 text-[10px] font-bold uppercase text-cyan-600 dark:text-cyan-300 border border-cyan-500/30">
                Skill Breakdown
              </span>
              <h3 className="text-base sm:text-lg font-bold dark:text-white text-slate-900">
                Confidence vs. Reality: Your Actual Skill Level
              </h3>
            </div>
            <p className="text-xs dark:text-slate-400 text-slate-500">
              Comparing what you thought you knew against your verified practice quiz scores.
            </p>
          </div>

          <div className="rounded-2xl border dark:border-white/10 border-slate-200 dark:bg-surface-100 bg-slate-50 px-4 py-2 text-right">
            <span className="text-[10px] dark:text-slate-400 text-slate-500 uppercase tracking-wider block">Comparison</span>
            <span className={`text-xs font-bold ${
              calibrationDelta > 15 ? 'text-amber-500' : 'text-emerald-500'
            }`}>
              {calibrationDelta > 0 ? `+${calibrationDelta}% Higher Confidence` : 'Accurately Calibrated'}
            </span>
          </div>
        </div>

        {/* Dual Bar Skill Rows */}
        <div className="mt-6 space-y-4">
          {skills.slice(0, 8).map(skill => {
            const verified = Math.round((masteryMap.get(skill.id) ?? 0.10) * 100);
            const selfReported = Math.round((selfReportedMap.get(skill.id) ?? 0.30) * 100);
            const isMastered = verified >= 80;

            return (
              <div key={skill.id} className="rounded-2xl border dark:border-white/5 border-slate-200 dark:bg-surface-50/50 bg-slate-50 p-4">
                <div className="flex items-center justify-between text-xs mb-2">
                  <div className="flex items-center gap-2 truncate">
                    <span className="font-bold dark:text-white text-slate-900 truncate">{skill.name}</span>
                    {isMastered && (
                      <span className="rounded bg-emerald-500/15 px-2 py-0.2 text-[9px] font-bold text-emerald-600 dark:text-emerald-300 border border-emerald-500/30">
                        ✓ Verified Mastered
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-[11px]">
                    <span className="dark:text-slate-400 text-slate-500">Self-estimate: <strong className="dark:text-slate-200 text-slate-700">{selfReported}%</strong></span>
                    <span className="dark:text-slate-400 text-slate-500">Quiz Score: <strong className={isMastered ? 'text-emerald-500 font-bold' : 'text-brand-500 font-bold'}>{verified}%</strong></span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  {/* Self Estimated Bar */}
                  <div className="flex items-center gap-2">
                    <span className="w-24 text-[10px] dark:text-slate-400 text-slate-500 text-right">Self Estimate</span>
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full dark:bg-surface-100 bg-slate-200">
                      <div className="h-full bg-slate-400 dark:bg-slate-500 rounded-full" style={{ width: `${selfReported}%` }} />
                    </div>
                  </div>

                  {/* Quiz Score Bar */}
                  <div className="flex items-center gap-2">
                    <span className="w-24 text-[10px] text-cyan-600 dark:text-cyan-400 text-right font-semibold">Quiz Verified</span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full dark:bg-surface-100 bg-slate-200">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isMastered ? 'bg-emerald-500' : 'bg-brand-600'
                        }`}
                        style={{ width: `${verified}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Optional Bayesian Simulator Sandbox (Collapsible) */}
      <div className="rounded-3xl border dark:border-white/10 border-slate-200 dark:bg-[#090f1b] bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Sliders className="h-4 w-4 text-cyan-500" />
            <h4 className="text-sm font-bold dark:text-white text-slate-900">
              Interactive Skill Score Simulator (Optional)
            </h4>
          </div>
          <button
            onClick={() => setShowSandbox(!showSandbox)}
            className="text-xs font-semibold text-brand-500 hover:underline flex items-center gap-1"
          >
            <span>{showSandbox ? 'Hide simulator' : 'Try simulator'}</span>
            {showSandbox ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
        </div>

        {showSandbox && (
          <div className="mt-5 pt-4 border-t dark:border-white/10 border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-6 items-center animate-in fade-in">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="dark:text-slate-300 text-slate-700">Starting Skill Level</span>
                  <span className="font-mono text-cyan-500 font-bold">{Math.round(sandboxPrior * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.95"
                  step="0.05"
                  value={sandboxPrior}
                  onChange={e => setSandboxPrior(parseFloat(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              <div>
                <label className="text-xs font-semibold dark:text-slate-300 text-slate-700 block mb-2">Simulate Quiz Answer</label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setSandboxIsCorrect(true)}
                    className={`rounded-xl border p-2.5 text-xs font-bold transition-all ${
                      sandboxIsCorrect
                        ? 'border-emerald-500 bg-emerald-500/20 text-emerald-500'
                        : 'dark:border-white/10 border-slate-200 dark:bg-surface-50 bg-slate-100 dark:text-slate-400 text-slate-600'
                    }`}
                  >
                    ✓ Correct Answer
                  </button>
                  <button
                    type="button"
                    onClick={() => setSandboxIsCorrect(false)}
                    className={`rounded-xl border p-2.5 text-xs font-bold transition-all ${
                      !sandboxIsCorrect
                        ? 'border-rose-500 bg-rose-500/20 text-rose-500'
                        : 'dark:border-white/10 border-slate-200 dark:bg-surface-50 bg-slate-100 dark:text-slate-400 text-slate-600'
                    }`}
                  >
                    ✗ Incorrect Answer
                  </button>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border dark:border-white/10 border-slate-200 dark:bg-surface-50 bg-slate-100 p-5 text-center space-y-3">
              <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                Updated Skill Score
              </span>
              <div className="flex items-center justify-center gap-3">
                <span className="text-lg font-bold text-slate-400">{Math.round(sandboxPrior * 100)}%</span>
                <span className="text-xl text-brand-500 font-bold">→</span>
                <strong className={`text-3xl font-extrabold ${sandboxResult.posterior >= 0.80 ? 'text-emerald-500' : 'text-cyan-500'}`}>
                  {Math.round(sandboxResult.posterior * 100)}%
                </strong>
              </div>
              <p className="text-xs text-slate-400">
                {sandboxResult.posterior >= 0.80
                  ? '✓ Target achieved! Future chapters unlocked.'
                  : 'Needs more practice before unlocking next topics.'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Recent Quiz Attempts Log */}
      <div className="rounded-3xl border dark:border-white/10 border-slate-200 dark:bg-[#090f1b] bg-white p-6 sm:p-8 shadow-sm">
        <h3 className="text-base font-bold dark:text-white text-slate-900 mb-3">Recent Practice Quiz Results</h3>
        {attemptsHistory.length === 0 ? (
          <p className="text-xs dark:text-slate-400 text-slate-500 italic">No quiz scores recorded yet. Take a practice quiz from the Roadmap to see your progress history here.</p>
        ) : (
          <div className="space-y-2">
            {attemptsHistory.map(att => (
              <div
                key={att.id}
                className="flex items-center justify-between rounded-xl border dark:border-white/5 border-slate-200 dark:bg-surface-50 bg-slate-50 p-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className={`flex h-7 w-7 items-center justify-center rounded-lg border ${
                    att.is_correct
                      ? 'border-emerald-500/40 bg-emerald-500/20 text-emerald-600 dark:text-emerald-300'
                      : 'border-rose-500/40 bg-rose-500/20 text-rose-600 dark:text-rose-300'
                  }`}>
                    {att.is_correct ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                  </div>
                  <div>
                    <span className="font-bold dark:text-white text-slate-900">{att.skill_id.replace(/_/g, ' ')}</span>
                    <span className="block text-[11px] dark:text-slate-400 text-slate-500">Score: {Math.round(att.score * 100)}% • Duration: {att.duration_seconds || 60}s</span>
                  </div>
                </div>

                <div className="text-right font-mono text-xs">
                  <span className="dark:text-slate-400 text-slate-500">{Math.round((att.prior_mastery_prob ?? 0.1) * 100)}% → </span>
                  <strong className={att.is_correct ? 'text-emerald-500 font-bold' : 'text-rose-500 font-bold'}>
                    {Math.round((att.posterior_mastery_prob ?? 0.8) * 100)}%
                  </strong>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
