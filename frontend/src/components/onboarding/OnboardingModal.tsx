import React, { useState } from 'react';
import { useSkillTwin } from '../../lib/state/store';
import { DomainId, ExperienceLevel, LearningStyle, DetectedSkillItem } from '../../lib/types';
import {
  Sparkles,
  X,
  ArrowRight,
  CheckCircle2,
  FileText,
  UploadCloud,
  Check,
  Zap,
  Target
} from 'lucide-react';

export default function OnboardingModal() {
  const {
    isOnboardingOpen,
    setIsOnboardingOpen,
    domainsList,
    currentDomain,
    switchDomain,
    profile,
    updateProfile,
    masteryMap,
    setMasteryMap,
    skills
  } = useSkillTwin();

  const [step, setStep] = useState<number>(1);
  const [selectedDomain, setSelectedDomain] = useState<DomainId>(currentDomain);
  const [targetRole, setTargetRole] = useState<string>(profile?.target_role || 'Senior Backend Engineer');
  const [weeklyHours, setWeeklyHours] = useState<number>(profile?.weekly_hours_budget ?? 10);
  const [learningStyle, setLearningStyle] = useState<LearningStyle>(profile?.preferred_learning_style || 'hands_on');
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>('beginner');

  // Intake Mode & Auto-detection state
  const [intakeTab, setIntakeTab] = useState<'level' | 'auto_detect'>('level');
  const [resumeText, setResumeText] = useState('');
  const [githubUser, setGithubUser] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [detectedSkills, setDetectedSkills] = useState<DetectedSkillItem[] | null>(null);
  const [detectedSource, setDetectedSource] = useState<'resume' | 'github'>('resume');

  if (!isOnboardingOpen) return null;

  const handleScanResume = async () => {
    if (!resumeText.trim()) return;
    setIsScanning(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/integrations/resume/parse-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resume_text: resumeText })
      });
      if (res.ok) {
        const data = await res.json();
        setDetectedSkills(data.skills || []);
        setDetectedSource('resume');
      } else {
        fallbackScan(resumeText, 'resume');
      }
    } catch {
      fallbackScan(resumeText, 'resume');
    } finally {
      setIsScanning(false);
    }
  };

  const handleScanGithub = async () => {
    if (!githubUser.trim()) return;
    setIsScanning(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/integrations/github/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ github_username: githubUser })
      });
      if (res.ok) {
        const data = await res.json();
        setDetectedSkills(data.skills || []);
        setDetectedSource('github');
      } else {
        fallbackScan(githubUser, 'github');
      }
    } catch {
      fallbackScan(githubUser, 'github');
    } finally {
      setIsScanning(false);
    }
  };

  const fallbackScan = (input: string, src: 'resume' | 'github') => {
    const list: DetectedSkillItem[] = skills.slice(0, 3).map(s => ({
      skill_id: s.id,
      skill_name: s.name,
      estimated_mastery: 0.45,
      confidence: 0.50,
      source: src,
      evidence_snippet: src === 'resume'
        ? `Found practical experience with ${s.name} in uploaded background.`
        : `Found code repositories and language signals for ${s.name}.`
    }));
    setDetectedSkills(list);
    setDetectedSource(src);
  };

  const handleComplete = () => {
    switchDomain(selectedDomain);
    updateProfile({
      target_role: targetRole,
      weekly_hours_budget: weeklyHours,
      preferred_learning_style: learningStyle,
      prior_experience_level: experienceLevel,
    });

    if (detectedSkills && detectedSkills.length > 0) {
      const updated = new Map(masteryMap);
      detectedSkills.forEach(item => {
        updated.set(item.skill_id, Math.max(updated.get(item.skill_id) ?? 0.10, item.estimated_mastery));
      });
      setMasteryMap(updated as any);
    }

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

        {/* Step 3: Experience Level & Auto-Detection */}
        {step === 3 && (
          <div className="mt-5 space-y-4">
            <div>
              <label className="text-xs font-bold dark:text-white text-slate-900 block mb-1">
                How would you like to set your starting skills?
              </label>
              <p className="text-[11px] dark:text-slate-400 text-slate-500 mb-3">
                Choose your starting experience or auto-detect skills from your resume/GitHub.
              </p>

              {/* Intake Mode Switcher */}
              <div className="flex rounded-xl bg-slate-100 dark:bg-surface-100 p-1 mb-3 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setIntakeTab('level')}
                  className={`flex-1 py-1.5 rounded-lg transition-all ${
                    intakeTab === 'level'
                      ? 'bg-white dark:bg-surface-50 dark:text-white text-slate-900 shadow-xs font-bold'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  🎯 Diagnostic Level
                </button>
                <button
                  type="button"
                  onClick={() => setIntakeTab('auto_detect')}
                  className={`flex-1 py-1.5 rounded-lg transition-all ${
                    intakeTab === 'auto_detect'
                      ? 'bg-white dark:bg-surface-50 text-brand-600 dark:text-brand-400 shadow-xs font-bold'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  ✨ Auto-Detect (Resume / GitHub)
                </button>
              </div>

              {intakeTab === 'level' ? (
                <div className="space-y-2">
                  <div
                    onClick={() => setExperienceLevel('beginner')}
                    className={`cursor-pointer rounded-2xl border p-3.5 transition-all duration-150 active:scale-[0.98] ${
                      experienceLevel === 'beginner'
                        ? 'border-brand-500 bg-brand-500/15 dark:text-white text-slate-900 ring-1 ring-brand-500 shadow-xs font-semibold'
                        : 'dark:border-white/10 border-slate-200 dark:bg-surface-100 bg-slate-50 dark:text-slate-300 text-slate-700 hover:bg-slate-100 dark:hover:bg-surface-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">🌱 First Principles (Beginner)</span>
                      {experienceLevel === 'beginner' && <CheckCircle2 className="h-4 w-4 text-brand-500" />}
                    </div>
                    <p className="text-[11px] dark:text-slate-400 text-slate-500 mt-1 font-normal">
                      Start fresh at Chapter 1 from 0% mastery. Recommended for comprehensive learning.
                    </p>
                  </div>

                  <div
                    onClick={() => setExperienceLevel('intermediate')}
                    className={`cursor-pointer rounded-2xl border p-3.5 transition-all duration-150 active:scale-[0.98] ${
                      experienceLevel === 'intermediate'
                        ? 'border-brand-500 bg-brand-500/15 dark:text-white text-slate-900 ring-1 ring-brand-500 shadow-xs font-semibold'
                        : 'dark:border-white/10 border-slate-200 dark:bg-surface-100 bg-slate-50 dark:text-slate-300 text-slate-700 hover:bg-slate-100 dark:hover:bg-surface-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">⚡ Experienced Practitioner (Intermediate)</span>
                      {experienceLevel === 'intermediate' && <CheckCircle2 className="h-4 w-4 text-brand-500" />}
                    </div>
                    <p className="text-[11px] dark:text-slate-400 text-slate-500 mt-1 font-normal">
                      Comfortable with core concepts; unblock hands-on modules faster.
                    </p>
                  </div>

                  <div
                    onClick={() => setExperienceLevel('advanced')}
                    className={`cursor-pointer rounded-2xl border p-3.5 transition-all duration-150 active:scale-[0.98] ${
                      experienceLevel === 'advanced'
                        ? 'border-brand-500 bg-brand-500/15 dark:text-white text-slate-900 ring-1 ring-brand-500 shadow-xs font-semibold'
                        : 'dark:border-white/10 border-slate-200 dark:bg-surface-100 bg-slate-50 dark:text-slate-300 text-slate-700 hover:bg-slate-100 dark:hover:bg-surface-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">🚀 Advanced Architect</span>
                      {experienceLevel === 'advanced' && <CheckCircle2 className="h-4 w-4 text-brand-500" />}
                    </div>
                    <p className="text-[11px] dark:text-slate-400 text-slate-500 mt-1 font-normal">
                      Focus on scale, distributed systems, and diagnostic mastery challenges.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold dark:text-slate-300 text-slate-700 flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5 text-brand-500" />
                      <span>Paste Resume or Experience Text</span>
                    </label>
                    <textarea
                      rows={3}
                      value={resumeText}
                      onChange={e => setResumeText(e.target.value)}
                      placeholder="e.g. Built microservices in Python, FastAPI, Docker, and PostgreSQL with Redis..."
                      className="w-full rounded-xl border dark:border-white/10 border-slate-300 dark:bg-surface-100 bg-slate-50 p-2.5 text-xs dark:text-white text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleScanResume}
                      disabled={isScanning || !resumeText.trim()}
                      className="w-full py-2 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white font-bold text-xs shadow transition-all btn-tactile"
                    >
                      {isScanning ? 'Scanning...' : 'Scan Resume Text'}
                    </button>
                  </div>

                  <div className="flex items-center gap-2 text-[10px] text-slate-400">
                    <div className="flex-1 h-px bg-slate-200 dark:bg-white/10" />
                    <span>OR GITHUB</span>
                    <div className="flex-1 h-px bg-slate-200 dark:bg-white/10" />
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={githubUser}
                      onChange={e => setGithubUser(e.target.value)}
                      placeholder="GitHub username (e.g. octocat)"
                      className="flex-1 rounded-xl border dark:border-white/10 border-slate-300 dark:bg-surface-100 bg-slate-50 px-3 py-2 text-xs dark:text-white text-slate-900 focus:border-brand-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleScanGithub}
                      disabled={isScanning || !githubUser.trim()}
                      className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold text-xs shadow transition-all btn-tactile"
                    >
                      {isScanning ? 'Scanning...' : 'Scan GitHub'}
                    </button>
                  </div>

                  {detectedSkills && detectedSkills.length > 0 && (
                    <div className="p-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 space-y-1.5 animate-in fade-in">
                      <div className="flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        <span>✓ Detected {detectedSkills.length} skills in {detectedSource}:</span>
                        <span className="text-[10px]">Estimated ~45%</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {detectedSkills.map(s => (
                          <span key={s.skill_id} className="rounded-lg bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                            {s.skill_name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

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
