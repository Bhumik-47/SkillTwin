'use client';

import React, { useState } from 'react';
import { useSkillTwin } from '../../lib/state/store';
import { DomainId, ExperienceLevel, LearningStyle } from '../../lib/types';
import {
  Sparkles,
  X,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

export default function OnboardingModal() {
  const {
    isOnboardingOpen,
    setIsOnboardingOpen,
    domainsList,
    currentDomain,
    switchDomain,
    profile,
    updateProfile
  } = useSkillTwin();

  const [step, setStep] = useState<number>(1);
  const [selectedDomain, setSelectedDomain] = useState<DomainId>(currentDomain);
  const [targetRole, setTargetRole] = useState<string>(profile.target_role);
  const [weeklyHours, setWeeklyHours] = useState<number>(profile.weekly_hours_budget);
  const [learningStyle, setLearningStyle] = useState<LearningStyle>(profile.preferred_learning_style);
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>(profile.prior_experience_level);

  if (!isOnboardingOpen) return null;

  const handleComplete = () => {
    switchDomain(selectedDomain);
    updateProfile({
      target_role: targetRole,
      weekly_hours_budget: weeklyHours,
      preferred_learning_style: learningStyle,
      prior_experience_level: experienceLevel,
    });
    setIsOnboardingOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-brand-500/40 dark:bg-[#0c1220] bg-white p-6 shadow-2xl backdrop-blur-2xl transition-colors">
        
        {/* Background glow */}
        <div className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full bg-brand-500/15 blur-3xl" />

        {/* Header */}
        <div className="flex items-center justify-between border-b dark:border-white/10 border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-600 to-cyan-500 text-white shadow-lg shadow-brand-500/25">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-500 dark:text-brand-400">
                Step {step} of 3 • SkillTwin Setup
              </span>
              <h3 className="text-base font-bold dark:text-white text-slate-900 leading-tight">
                Personalize Your Cognitive Twin
              </h3>
            </div>
          </div>

          <button
            onClick={() => setIsOnboardingOpen(false)}
            className="rounded-xl border dark:border-white/10 border-slate-200 dark:bg-surface-200 bg-slate-100 p-1.5 dark:text-slate-400 text-slate-600 hover:dark:text-white hover:text-slate-900 transition-all"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Step 1: Select Domain & Role */}
        {step === 1 && (
          <div className="mt-5 space-y-4">
            <div>
              <label className="text-xs font-bold dark:text-white text-slate-900 block mb-2">Select Curriculum Domain</label>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {domainsList.map(dom => {
                  const isSelected = selectedDomain === dom.id;
                  return (
                    <div
                      key={dom.id}
                      onClick={() => setSelectedDomain(dom.id)}
                      className={`cursor-pointer rounded-2xl border p-3.5 transition-all ${
                        isSelected
                          ? 'border-brand-500 bg-brand-500/15 dark:text-white text-slate-900 shadow-md shadow-brand-500/15 ring-1 ring-brand-500 font-semibold'
                          : 'dark:border-white/10 border-slate-200 dark:bg-surface-200/60 bg-slate-50 dark:text-slate-300 text-slate-700 hover:bg-slate-100 dark:hover:bg-surface-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold">{dom.name}</span>
                        {isSelected && <CheckCircle2 className="h-4 w-4 text-brand-500" />}
                      </div>
                      <span className="inline-block mt-2 text-[10px] dark:text-slate-400 text-slate-500 font-mono">
                        {dom.badge}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold dark:text-white text-slate-900 block mb-1.5">Target Career Goal / Role</label>
              <input
                type="text"
                value={targetRole}
                onChange={e => setTargetRole(e.target.value)}
                placeholder="e.g. Backend Distributed Systems Engineer"
                className="w-full rounded-xl border dark:border-white/10 border-slate-300 dark:bg-surface-200 bg-slate-50 px-3.5 py-2.5 text-xs dark:text-white text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* Step 2: Time Commitment & Learning Style */}
        {step === 2 && (
          <div className="mt-5 space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs font-bold dark:text-white text-slate-900 mb-1.5">
                <label>Weekly Study Budget</label>
                <span className="font-mono text-brand-600 dark:text-brand-300">{weeklyHours} hrs / week</span>
              </div>
              <input
                type="range"
                min="2"
                max="30"
                step="1"
                value={weeklyHours}
                onChange={e => setWeeklyHours(parseInt(e.target.value))}
                className="w-full accent-brand-500"
              />
              <div className="flex justify-between text-[10px] dark:text-slate-400 text-slate-500 mt-1">
                <span>2 hrs (Casual)</span>
                <span>10 hrs (Standard)</span>
                <span>30 hrs (Bootcamp)</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold dark:text-white text-slate-900 block mb-2">Preferred Learning Modality</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'hands_on', label: '🛠️ Hands-on Projects' },
                  { id: 'video', label: '🎬 Video Deep Dives' },
                  { id: 'reading', label: '📖 Deep Documentation' },
                  { id: 'mixed', label: '⚡ Mixed Hybrid' },
                ].map(style => (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => setLearningStyle(style.id as LearningStyle)}
                    className={`rounded-xl border p-3 text-left text-xs font-semibold transition-all ${
                      learningStyle === style.id
                        ? 'border-brand-500 bg-brand-500/15 dark:text-white text-slate-900 shadow-xs'
                        : 'dark:border-white/10 border-slate-200 dark:bg-surface-200/60 bg-slate-50 dark:text-slate-300 text-slate-700 hover:bg-slate-100 dark:hover:bg-surface-100'
                    }`}
                  >
                    {style.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Self-Assessed Experience Level */}
        {step === 3 && (
          <div className="mt-5 space-y-4">
            <div>
              <label className="text-xs font-bold dark:text-white text-slate-900 block mb-1">
                Self-Reported Experience Level
              </label>
              <p className="text-[11px] dark:text-slate-400 text-slate-500 mb-3">
                SkillTwin will record your claim and contrast it with real Bayesian evidence.
              </p>

              <div className="space-y-2">
                {[
                  { id: 'beginner', title: 'Beginner', desc: 'Starting from first principles; need guided steps.' },
                  { id: 'intermediate', title: 'Intermediate', desc: 'Familiar with core syntax; building real systems.' },
                  { id: 'advanced', title: 'Advanced / Architect', desc: 'Comfortable with internals, performance, and distributed scale.' },
                ].map(tier => (
                  <div
                    key={tier.id}
                    onClick={() => setExperienceLevel(tier.id as ExperienceLevel)}
                    className={`cursor-pointer rounded-2xl border p-3.5 transition-all ${
                      experienceLevel === tier.id
                        ? 'border-brand-500 bg-brand-500/15 dark:text-white text-slate-900 ring-1 ring-brand-500'
                        : 'dark:border-white/10 border-slate-200 dark:bg-surface-200/60 bg-slate-50 dark:text-slate-300 text-slate-700 hover:bg-slate-100 dark:hover:bg-surface-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">{tier.title}</span>
                      {experienceLevel === tier.id && <CheckCircle2 className="h-4 w-4 text-brand-500" />}
                    </div>
                    <p className="text-[11px] dark:text-slate-400 text-slate-500 mt-1">{tier.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Footer Navigation */}
        <div className="mt-6 flex items-center justify-between border-t dark:border-white/10 border-slate-200 pt-4">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="rounded-xl border dark:border-white/10 border-slate-300 dark:bg-surface-200 bg-slate-100 px-4 py-2 text-xs font-semibold dark:text-slate-300 text-slate-700 hover:bg-slate-200 dark:hover:text-white"
            >
              Back
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="flex items-center gap-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 px-5 py-2 text-xs font-bold text-white shadow-md shadow-brand-500/25 transition-all"
            >
              <span>Continue</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          ) : (
            <button
              onClick={handleComplete}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-600 to-cyan-600 hover:from-brand-500 hover:to-cyan-500 px-6 py-2.5 text-xs font-bold text-white shadow-xl shadow-brand-500/25 transition-all active:scale-95"
            >
              <Sparkles className="h-4 w-4" />
              <span>Generate Curriculum Path</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
