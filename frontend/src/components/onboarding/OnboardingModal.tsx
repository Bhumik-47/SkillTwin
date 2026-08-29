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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl overflow-hidden rounded-3xl border dark:border-white/15 border-slate-300 dark:bg-[#0b101b] bg-white p-6 shadow-2xl animate-modal-reveal">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b dark:border-white/10 border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-sm">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                Step {step} of 3 • Set Up Your Plan
              </span>
              <h3 className="text-base sm:text-lg font-bold dark:text-white text-slate-900 leading-tight">
                Personalize Your Learning Experience
              </h3>
            </div>
          </div>

          <button
            onClick={() => setIsOnboardingOpen(false)}
            className="rounded-xl border dark:border-white/10 border-slate-200 dark:bg-surface-50 bg-slate-100 p-1.5 dark:text-slate-400 text-slate-600 hover:dark:text-white hover:text-slate-900 transition-all active:scale-[0.95]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Step 1: Select Domain & Role */}
        {step === 1 && (
          <div className="mt-5 space-y-4">
            <div>
              <label className="text-xs font-bold dark:text-white text-slate-900 block mb-2">Select Course Track</label>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {domainsList.map(dom => {
                  const isSelected = selectedDomain === dom.id;
                  return (
                    <div
                      key={dom.id}
                      onClick={() => setSelectedDomain(dom.id)}
                      className={`cursor-pointer rounded-2xl border p-3.5 transition-all duration-150 active:scale-[0.98] ${
                        isSelected
                          ? 'border-brand-500 bg-brand-500/15 dark:text-white text-slate-900 shadow-sm ring-1 ring-brand-500 font-semibold'
                          : 'dark:border-white/10 border-slate-200 dark:bg-surface-100 bg-slate-50 dark:text-slate-300 text-slate-700 hover:bg-slate-100 dark:hover:bg-surface-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold">{dom.name}</span>
                        {isSelected && <CheckCircle2 className="h-4 w-4 text-brand-500" />}
                      </div>
                      <span className="inline-block mt-2 text-[10px] dark:text-slate-400 text-slate-500">
                        {dom.nodeCount} Topics
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold dark:text-white text-slate-900 block mb-1.5">Target Career Goal or Role</label>
              <input
                type="text"
                value={targetRole}
                onChange={e => setTargetRole(e.target.value)}
                placeholder="e.g. Senior Backend Engineer"
                className="w-full rounded-xl border dark:border-white/10 border-slate-300 dark:bg-surface-100 bg-slate-50 px-3.5 py-2.5 text-xs dark:text-white text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:outline-none transition-all"
              />
            </div>
          </div>
        )}

        {/* Step 2: Time Commitment & Learning Style */}
        {step === 2 && (
          <div className="mt-5 space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs font-bold dark:text-white text-slate-900 mb-1.5">
                <label>Weekly Study Commitment</label>
                <span className="font-mono text-brand-600 dark:text-brand-300">{weeklyHours} hrs / week</span>
              </div>
              <input
                type="range"
                min="2"
                max="30"
                step="1"
                value={weeklyHours}
                onChange={e => setWeeklyHours(parseInt(e.target.value))}
                className="w-full accent-brand-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] dark:text-slate-400 text-slate-500 mt-1">
                <span>2 hrs (Casual)</span>
                <span>10 hrs (Standard)</span>
                <span>30 hrs (Intensive)</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold dark:text-white text-slate-900 block mb-2">Preferred Learning Style</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'hands_on', label: '🛠️ Hands-on Projects' },
                  { id: 'video', label: '🎬 Video Lessons' },
                  { id: 'reading', label: '📖 Documentation & Guides' },
                  { id: 'mixed', label: '⚡ Mixed Hybrid' },
                ].map(style => (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => setLearningStyle(style.id as LearningStyle)}
                    className={`rounded-xl border p-3 text-left text-xs font-semibold transition-all duration-150 active:scale-[0.98] ${
                      learningStyle === style.id
                        ? 'border-brand-500 bg-brand-500/15 dark:text-white text-slate-900 shadow-xs ring-1 ring-brand-500/40'
                        : 'dark:border-white/10 border-slate-200 dark:bg-surface-100 bg-slate-50 dark:text-slate-300 text-slate-700 hover:bg-slate-100 dark:hover:bg-surface-50'
                    }`}
                  >
                    {style.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Experience Level */}
        {step === 3 && (
          <div className="mt-5 space-y-4">
            <div>
              <label className="text-xs font-bold dark:text-white text-slate-900 block mb-1">
                Your Current Experience Level
              </label>
              <p className="text-[11px] dark:text-slate-400 text-slate-500 mb-3">
                We will calibrate your starting roadmap based on your current comfort level.
              </p>

              <div className="space-y-2">
                {[
                  { id: 'beginner', title: 'Beginner', desc: 'Starting from first principles with guided step-by-step topics.' },
                  { id: 'intermediate', title: 'Intermediate', desc: 'Comfortable with foundational concepts; ready to build projects.' },
                  { id: 'advanced', title: 'Advanced', desc: 'Experienced in the fundamentals; focusing on deep architecture and scale.' },
                ].map(tier => (
                  <div
                    key={tier.id}
                    onClick={() => setExperienceLevel(tier.id as ExperienceLevel)}
                    className={`cursor-pointer rounded-2xl border p-3.5 transition-all duration-150 active:scale-[0.98] ${
                      experienceLevel === tier.id
                        ? 'border-brand-500 bg-brand-500/15 dark:text-white text-slate-900 ring-1 ring-brand-500 shadow-xs font-semibold'
                        : 'dark:border-white/10 border-slate-200 dark:bg-surface-100 bg-slate-50 dark:text-slate-300 text-slate-700 hover:bg-slate-100 dark:hover:bg-surface-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">{tier.title}</span>
                      {experienceLevel === tier.id && <CheckCircle2 className="h-4 w-4 text-brand-500" />}
                    </div>
                    <p className="text-[11px] dark:text-slate-400 text-slate-500 mt-1 font-normal">{tier.desc}</p>
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
              className="rounded-xl border dark:border-white/10 border-slate-300 dark:bg-surface-100 bg-slate-100 px-4 py-2 text-xs font-semibold dark:text-slate-300 text-slate-700 hover:bg-slate-200 dark:hover:text-white transition-all btn-tactile"
            >
              Back
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="flex items-center gap-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 px-5 py-2 text-xs font-bold text-white shadow-sm transition-all btn-tactile"
            >
              <span>Continue</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          ) : (
            <button
              onClick={handleComplete}
              className="flex items-center gap-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 px-6 py-2.5 text-xs font-bold text-white shadow-sm transition-all btn-tactile"
            >
              <Sparkles className="h-4 w-4" />
              <span>Create My Study Plan</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
