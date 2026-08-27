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
  Edit3
} from 'lucide-react';

export default function LearnerProfileView() {
  const {
    user,
    profile,
    updateProfile,
    skills,
    masteryMap,
    selfReportedMap,
    attemptsHistory
  } = useSkillTwin();

  const [isEditing, setIsEditing] = useState(false);
  const [weeklyHours, setWeeklyHours] = useState(profile.weekly_hours_budget);
  const [learningStyle, setLearningStyle] = useState(profile.preferred_learning_style);

  const avgVerifiedMastery = masteryMap.size > 0
    ? Math.round((Array.from(masteryMap.values()).reduce((a, b) => a + b, 0) / masteryMap.size) * 100)
    : 0;

  const avgSelfReported = selfReportedMap.size > 0
    ? Math.round((Array.from(selfReportedMap.values()).reduce((a, b) => a + b, 0) / selfReportedMap.size) * 100)
    : 0;

  const calibrationDelta = avgSelfReported - avgVerifiedMastery;

  return (
    <div className="space-y-6">
      
      {/* Top Banner: Profile Overview */}
      <div className="rounded-3xl border dark:border-white/10 border-slate-200 dark:bg-gradient-to-r dark:from-surface-200/90 dark:via-surface-200/60 dark:to-surface-300/40 bg-gradient-to-r from-indigo-50/70 via-white to-sky-50/50 p-6 backdrop-blur-xl shadow-xl transition-colors">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-600 to-cyan-500 text-xl font-bold text-white shadow-xl shadow-brand-500/25">
              {user.full_name.split(' ').map(n => n[0]).join('')}
              <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 border-2 dark:border-[#090d16] border-white text-white">
                <CheckCircle2 className="h-3.5 w-3.5" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold dark:text-white text-slate-900">{user.full_name}</h2>
                <span className="rounded-full bg-brand-500/15 px-2.5 py-0.5 text-[10px] font-bold text-brand-600 dark:text-brand-300 border border-brand-500/30">
                  {profile.prior_experience_level.toUpperCase()}
                </span>
              </div>
              <p className="text-xs dark:text-slate-400 text-slate-600 mt-0.5">{profile.target_role} • {user.email}</p>
              <p className="text-[11px] dark:text-slate-400 text-slate-500 mt-1 flex items-center gap-2">
                <span>⏱️ {profile.weekly_hours_budget} hrs/week budget</span>
                <span>•</span>
                <span>🎨 Style: {profile.preferred_learning_style.replace('_', ' ')}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-1.5 rounded-xl border dark:border-white/10 border-slate-300 dark:bg-surface-100 bg-white hover:bg-slate-50 dark:hover:bg-white/10 px-3.5 py-2 text-xs font-semibold dark:text-slate-300 text-slate-700 transition-all shadow-sm"
            >
              <Edit3 className="h-3.5 w-3.5" />
              <span>{isEditing ? 'Close Settings' : 'Edit Preferences'}</span>
            </button>
          </div>
        </div>

        {/* Quick Preference Editor */}
        {isEditing && (
          <div className="mt-5 rounded-2xl border dark:border-white/10 border-slate-200 dark:bg-surface-300/80 bg-white p-4 shadow-sm animate-in fade-in duration-150">
            <h4 className="text-xs font-bold dark:text-white text-slate-900 mb-3">Update Study Configuration</h4>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="text-[11px] dark:text-slate-400 text-slate-600 block mb-1">Weekly Hours Commitment</label>
                <input
                  type="number"
                  min="2"
                  max="40"
                  value={weeklyHours}
                  onChange={e => setWeeklyHours(parseInt(e.target.value) || 10)}
                  className="w-full rounded-xl border dark:border-white/10 border-slate-300 dark:bg-surface-200 bg-slate-50 px-3 py-2 text-xs dark:text-white text-slate-900"
                />
              </div>
              <div>
                <label className="text-[11px] dark:text-slate-400 text-slate-600 block mb-1">Preferred Learning Style</label>
                <select
                  value={learningStyle}
                  onChange={e => setLearningStyle(e.target.value as any)}
                  className="w-full rounded-xl border dark:border-white/10 border-slate-300 dark:bg-surface-200 bg-slate-50 px-3 py-2 text-xs dark:text-white text-slate-900"
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
                className="rounded-xl bg-brand-600 hover:bg-brand-500 px-4 py-1.5 text-xs font-bold text-white shadow-md"
              >
                Save Changes
              </button>
            </div>
          </div>
        )}
      </div>

      {/* CORE FEATURE: Self-Reported vs Verified BKT Side-by-Side Calibration */}
      <div className="rounded-3xl border dark:border-white/10 border-slate-200 dark:bg-surface-200/60 bg-white p-6 shadow-sm backdrop-blur-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b dark:border-white/10 border-slate-200 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-cyan-500/15 px-2.5 py-0.5 text-[10px] font-extrabold uppercase text-cyan-600 dark:text-cyan-300 border border-cyan-500/30">
                Cognitive Ground Truth
              </span>
              <h3 className="text-base font-bold dark:text-white text-slate-900">
                Self-Reported vs. Verified Latent Skill Calibration
              </h3>
            </div>
            <p className="text-xs dark:text-slate-400 text-slate-500 mt-1">
              SkillTwin contrasts what learners claim during onboarding against verified posterior mastery inferred from evidence.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-xl border dark:border-white/10 border-slate-200 dark:bg-surface-300/80 bg-slate-50 px-3.5 py-2 text-right">
              <span className="text-[10px] dark:text-slate-400 text-slate-500 block">Calibration Gap</span>
              <span className={`font-mono text-xs font-bold ${
                calibrationDelta > 15 ? 'text-rose-500' : 'text-emerald-500'
              }`}>
                {calibrationDelta > 0 ? `+${calibrationDelta}% Overconfident` : 'Well Calibrated'}
              </span>
            </div>
          </div>
        </div>

        {/* Side-by-Side Comparison Bars per Skill */}
        <div className="mt-6 space-y-4">
          {skills.slice(0, 8).map(skill => {
            const verified = Math.round((masteryMap.get(skill.id) ?? 0.10) * 100);
            const selfReported = Math.round((selfReportedMap.get(skill.id) ?? 0.30) * 100);
            const isMastered = verified >= 80;

            return (
              <div key={skill.id} className="rounded-2xl border dark:border-white/5 border-slate-200 dark:bg-surface-300/40 bg-slate-50 p-4">
                <div className="flex items-center justify-between text-xs mb-2">
                  <div className="flex items-center gap-2 truncate">
                    <span className="font-semibold dark:text-white text-slate-900 truncate">{skill.name}</span>
                    {isMastered && (
                      <span className="rounded bg-emerald-500/15 px-1.5 py-0.2 text-[9px] font-bold text-emerald-600 dark:text-emerald-300 border border-emerald-500/30">
                        Verified Mastered
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 font-mono text-[11px]">
                    <span className="dark:text-slate-400 text-slate-500">Claimed: <strong className="dark:text-slate-200 text-slate-700">{selfReported}%</strong></span>
                    <span className="dark:text-slate-400 text-slate-500">Verified BKT: <strong className={isMastered ? 'text-emerald-500' : 'text-brand-500'}>{verified}%</strong></span>
                  </div>
                </div>

                {/* Comparative Double Bar */}
                <div className="space-y-1.5">
                  {/* Self Reported Bar */}
                  <div className="flex items-center gap-2">
                    <span className="w-16 text-[10px] dark:text-slate-400 text-slate-500 text-right">Self</span>
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full dark:bg-surface-100 bg-slate-200">
                      <div
                        className="h-full bg-slate-400 dark:bg-slate-500 rounded-full"
                        style={{ width: `${selfReported}%` }}
                      />
                    </div>
                  </div>

                  {/* Verified BKT Bar */}
                  <div className="flex items-center gap-2">
                    <span className="w-16 text-[10px] text-cyan-600 dark:text-cyan-400 text-right font-medium">BKT Real</span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full dark:bg-surface-100 bg-slate-200">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isMastered ? 'bg-emerald-500 shadow-[0_0_8px_#34d399]' : 'bg-gradient-to-r from-brand-500 to-cyan-400'
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

      {/* Assessment Evidence Log */}
      <div className="rounded-3xl border dark:border-white/10 border-slate-200 dark:bg-surface-200/60 bg-white p-6 shadow-sm backdrop-blur-xl">
        <h3 className="text-base font-bold dark:text-white text-slate-900 mb-3">Recent Evidence & Assessment Logs</h3>
        {attemptsHistory.length === 0 ? (
          <p className="text-xs dark:text-slate-400 text-slate-500 italic">No quiz evidence submitted yet in this session. Take an assessment to view live Bayesian tracking logs.</p>
        ) : (
          <div className="space-y-2">
            {attemptsHistory.map(att => (
              <div
                key={att.id}
                className="flex items-center justify-between rounded-xl border dark:border-white/5 border-slate-200 dark:bg-surface-300/40 bg-slate-50 p-3 text-xs"
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
                    <span className="font-semibold dark:text-white text-slate-900">{att.skill_id.replace(/_/g, ' ')}</span>
                    <span className="block text-[10px] dark:text-slate-400 text-slate-500">Score: {(att.score * 100).toFixed(0)}% • Time: {att.time_spent_seconds}s</span>
                  </div>
                </div>

                <div className="text-right font-mono text-[11px]">
                  <span className="dark:text-slate-400 text-slate-500">{att.prior_mastery_prob.toFixed(2)} → </span>
                  <strong className={att.is_correct ? 'text-emerald-500' : 'text-rose-500'}>
                    {att.posterior_mastery_prob.toFixed(2)}
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
