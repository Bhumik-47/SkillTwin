'use client';

import React, { useState } from 'react';
import { useSkillTwin } from '../../lib/state/store';
import {
  User as UserIcon,
  X,
  CheckCircle2,
  Clock,
  Award,
  Zap,
  BarChart2,
  ShieldCheck,
  Moon,
  Sun,
  Edit3,
  LogOut,
  Sliders,
  Compass,
  ArrowRight,
  KeyRound,
  UserPlus,
  LogIn
} from 'lucide-react';
import { LearningStyle, ExperienceLevel } from '../../lib/types';

export default function UserProfileModal() {
  const {
    isProfileModalOpen,
    setIsProfileModalOpen,
    user,
    profile,
    updateProfile,
    masteryMap,
    skills,
    theme,
    toggleTheme,
    setActiveTab,
    resetDomainState,
    token,
    isAuthenticated,
    loginUser,
    signupUser,
    logoutUser,
    backendOnline
  } = useSkillTwin();

  const [activeTabMode, setActiveTabMode] = useState<'profile' | 'auth'>('profile');
  const [weeklyHours, setWeeklyHours] = useState(profile.weekly_hours_budget);
  const [learningStyle, setLearningStyle] = useState<LearningStyle>(profile.preferred_learning_style);
  const [targetRole, setTargetRole] = useState(profile.target_role);
  const [isEditing, setIsEditing] = useState(false);

  // Auth form states
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authFullName, setAuthFullName] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false);

  if (!isProfileModalOpen) return null;

  const masteredCount = skills.filter(s => (masteryMap.get(s.id) ?? 0) >= 0.80).length;
  const inProgressCount = skills.filter(s => {
    const m = masteryMap.get(s.id) ?? 0;
    return m > 0.15 && m < 0.80;
  }).length;

  const avgMastery = masteryMap.size > 0
    ? Math.round((Array.from(masteryMap.values()).reduce((a, b) => a + b, 0) / masteryMap.size) * 100)
    : 0;

  const handleSaveProfile = async () => {
    await updateProfile({
      target_role: targetRole,
      weekly_hours_budget: weeklyHours,
      preferred_learning_style: learningStyle,
    });
    setIsEditing(false);
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsSubmittingAuth(true);

    try {
      if (authMode === 'login') {
        await loginUser({ email: authEmail, password: authPassword });
      } else {
        await signupUser({
          email: authEmail,
          password: authPassword,
          full_name: authFullName || 'Learner',
          target_role: targetRole,
          weekly_hours_budget: weeklyHours,
          preferred_learning_style: learningStyle,
          prior_experience_level: profile.prior_experience_level
        });
      }
      setActiveTabMode('profile');
      setAuthPassword('');
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed');
    } finally {
      setIsSubmittingAuth(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border dark:border-white/15 border-slate-300 dark:bg-[#0b101b] bg-white p-6 shadow-2xl animate-modal-reveal max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b dark:border-white/10 border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 text-white font-bold text-lg shadow-sm">
              {user.full_name ? user.full_name.split(' ').map(n => n[0]).join('') : 'U'}
              <div className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 border-2 dark:border-[#0b101b] border-white text-white">
                <CheckCircle2 className="h-3 w-3" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold dark:text-white text-slate-900">{user.full_name}</h3>
                <span className="rounded-full bg-brand-500/20 px-2 py-0.2 text-[9px] font-bold uppercase text-brand-500 border border-brand-500/30">
                  {profile.prior_experience_level.toUpperCase()}
                </span>
              </div>
              <p className="text-xs dark:text-slate-400 text-slate-500 mt-0.5">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
              className="flex h-8 w-8 items-center justify-center rounded-xl border dark:border-white/10 border-slate-200 dark:bg-surface-50 bg-slate-100 dark:text-amber-400 text-slate-700 hover:scale-105 transition-all duration-150 active:scale-[0.95]"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button
              onClick={() => setIsProfileModalOpen(false)}
              className="rounded-xl border dark:border-white/10 border-slate-200 dark:bg-surface-50 bg-slate-100 p-1.5 dark:text-slate-400 text-slate-600 hover:text-brand-500 transition-all active:scale-[0.95]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="mt-4 flex rounded-xl dark:bg-surface-100 bg-slate-100 p-1 border dark:border-white/10 border-slate-200 text-xs">
          <button
            onClick={() => setActiveTabMode('profile')}
            className={`flex-1 rounded-lg py-1.5 font-semibold transition-all ${
              activeTabMode === 'profile'
                ? 'bg-brand-600 text-white shadow-xs'
                : 'dark:text-slate-400 text-slate-600 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Study Profile & Goals
          </button>
          <button
            onClick={() => setActiveTabMode('auth')}
            className={`flex-1 rounded-lg py-1.5 font-semibold transition-all ${
              activeTabMode === 'auth'
                ? 'bg-brand-600 text-white shadow-xs'
                : 'dark:text-slate-400 text-slate-600 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Account & Sign In
          </button>
        </div>

        {activeTabMode === 'profile' ? (
          <>
            {/* User Stats Grid */}
            <div className="mt-4 grid grid-cols-3 gap-2.5 text-center text-xs">
              <div className="rounded-2xl border dark:border-white/10 border-slate-200 dark:bg-surface-100 bg-slate-50 p-3">
                <span className="text-[10px] uppercase dark:text-slate-400 text-slate-500 font-semibold block">Mastered</span>
                <strong className="text-lg font-bold text-emerald-500 font-mono">{masteredCount}</strong>
                <span className="text-[10px] dark:text-slate-500 text-slate-400 block">/ {skills.length} chapters</span>
              </div>

              <div className="rounded-2xl border dark:border-white/10 border-slate-200 dark:bg-surface-100 bg-slate-50 p-3">
                <span className="text-[10px] uppercase dark:text-slate-400 text-slate-500 font-semibold block">In Progress</span>
                <strong className="text-lg font-bold text-amber-500 font-mono">{inProgressCount}</strong>
                <span className="text-[10px] dark:text-slate-500 text-slate-400 block">active topics</span>
              </div>

              <div className="rounded-2xl border dark:border-white/10 border-slate-200 dark:bg-surface-100 bg-slate-50 p-3">
                <span className="text-[10px] uppercase dark:text-slate-400 text-slate-500 font-semibold block">Skill Level</span>
                <strong className="text-lg font-bold text-brand-500 font-mono">{avgMastery}%</strong>
                <span className="text-[10px] dark:text-slate-500 text-slate-400 block">average score</span>
              </div>
            </div>

            {/* Target Profile Details */}
            <div className="mt-4 rounded-2xl border dark:border-white/10 border-slate-200 dark:bg-surface-100 bg-slate-50 p-4">
              <div className="flex items-center justify-between border-b dark:border-white/10 border-slate-200 pb-2 mb-3">
                <span className="text-xs font-bold uppercase tracking-wider dark:text-slate-400 text-slate-600">
                  Study Preferences
                </span>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="text-xs font-semibold text-brand-500 hover:text-brand-400 flex items-center gap-1 active:scale-[0.95] transition-all"
                >
                  <Edit3 className="h-3 w-3" />
                  <span>{isEditing ? 'Cancel' : 'Edit'}</span>
                </button>
              </div>

              {!isEditing ? (
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="dark:text-slate-400 text-slate-500">Target Goal:</span>
                    <span className="font-semibold dark:text-white text-slate-800">{profile.target_role}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="dark:text-slate-400 text-slate-500">Weekly Commitment:</span>
                    <span className="font-semibold dark:text-white text-slate-800">{profile.weekly_hours_budget} hrs / week</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="dark:text-slate-400 text-slate-500">Learning Style:</span>
                    <span className="font-semibold capitalize dark:text-white text-slate-800">{profile.preferred_learning_style.replace('_', ' ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="dark:text-slate-400 text-slate-500">Experience Tier:</span>
                    <span className="font-semibold capitalize dark:text-white text-slate-800">{profile.prior_experience_level}</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="dark:text-slate-400 text-slate-600 block mb-1">Target Role / Goal</label>
                    <input
                      type="text"
                      value={targetRole}
                      onChange={e => setTargetRole(e.target.value)}
                      className="w-full rounded-xl border dark:border-white/10 border-slate-300 dark:bg-surface-50 bg-white px-3 py-1.5 dark:text-white text-slate-900 focus:border-brand-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="dark:text-slate-400 text-slate-600 block mb-1">Weekly Commitment (Hours)</label>
                    <input
                      type="number"
                      min="2"
                      max="40"
                      value={weeklyHours}
                      onChange={e => setWeeklyHours(parseInt(e.target.value) || 10)}
                      className="w-full rounded-xl border dark:border-white/10 border-slate-300 dark:bg-surface-50 bg-white px-3 py-1.5 dark:text-white text-slate-900 focus:border-brand-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="dark:text-slate-400 text-slate-600 block mb-1">Preferred Style</label>
                    <select
                      value={learningStyle}
                      onChange={e => setLearningStyle(e.target.value as any)}
                      className="w-full rounded-xl border dark:border-white/10 border-slate-300 dark:bg-surface-50 bg-white px-3 py-1.5 dark:text-white text-slate-900 focus:border-brand-500 focus:outline-none"
                    >
                      <option value="hands_on">Hands-on Exercises</option>
                      <option value="video">Video Courses</option>
                      <option value="reading">Documentation & Guides</option>
                      <option value="mixed">Mixed Hybrid</option>
                    </select>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={handleSaveProfile}
                      className="rounded-xl bg-brand-600 hover:bg-brand-500 px-4 py-1.5 text-xs font-bold text-white shadow-sm active:scale-[0.97] transition-all"
                    >
                      Save Preferences
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          /* Authentication Tab */
          <div className="mt-4 space-y-4 text-xs">
            <div className="rounded-2xl border dark:border-white/10 border-slate-200 dark:bg-surface-100 bg-slate-50 p-4">
              <div className="flex items-center justify-between border-b dark:border-white/10 border-slate-200 pb-2 mb-3">
                <span className="font-bold dark:text-slate-400 text-slate-600 flex items-center gap-1.5">
                  <KeyRound className="h-3.5 w-3.5 text-cyan-500" />
                  Account Status
                </span>
                <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
                  backendOnline ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30' : 'bg-slate-500/15 text-slate-500'
                }`}>
                  {backendOnline ? 'Cloud Synced' : 'Guest / Demo Mode'}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="dark:text-slate-400 text-slate-500">Session Status:</span>
                  <span className="font-semibold dark:text-white text-slate-800">
                    {isAuthenticated ? 'Signed In' : 'Guest Session'}
                  </span>
                </div>
                {isAuthenticated && (
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={logoutUser}
                      className="flex items-center gap-1 text-rose-500 hover:text-rose-400 text-xs font-semibold"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Login / Sign-up Form */}
            <div className="rounded-2xl border dark:border-white/10 border-slate-200 dark:bg-surface-100 bg-slate-50 p-4">
              <div className="flex items-center justify-between border-b dark:border-white/10 border-slate-200 pb-2 mb-3">
                <span className="font-bold dark:text-white text-slate-900">
                  {authMode === 'login' ? 'Sign In to Your Account' : 'Create New Account'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode(authMode === 'login' ? 'signup' : 'login');
                    setAuthError(null);
                  }}
                  className="text-brand-500 hover:text-brand-400 font-semibold text-[11px]"
                >
                  {authMode === 'login' ? 'Need an account? Sign up' : 'Already registered? Sign in'}
                </button>
              </div>

              {authError && (
                <div className="mb-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-2.5 text-rose-600 dark:text-rose-300 text-[11px]">
                  {authError}
                </div>
              )}

              <form onSubmit={handleAuthSubmit} className="space-y-3">
                {authMode === 'signup' && (
                  <div>
                    <label className="dark:text-slate-400 text-slate-600 block mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Alex Rivera"
                      value={authFullName}
                      onChange={e => setAuthFullName(e.target.value)}
                      className="w-full rounded-xl border dark:border-white/10 border-slate-300 dark:bg-surface-50 bg-white px-3 py-1.5 dark:text-white text-slate-900 focus:border-brand-500 focus:outline-none"
                    />
                  </div>
                )}

                <div>
                  <label className="dark:text-slate-400 text-slate-600 block mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="learner@skilltwin.ai"
                    value={authEmail}
                    onChange={e => setAuthEmail(e.target.value)}
                    className="w-full rounded-xl border dark:border-white/10 border-slate-300 dark:bg-surface-50 bg-white px-3 py-1.5 dark:text-white text-slate-900 focus:border-brand-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="dark:text-slate-400 text-slate-600 block mb-1">Password</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="••••••••"
                    value={authPassword}
                    onChange={e => setAuthPassword(e.target.value)}
                    className="w-full rounded-xl border dark:border-white/10 border-slate-300 dark:bg-surface-50 bg-white px-3 py-1.5 dark:text-white text-slate-900 focus:border-brand-500 focus:outline-none"
                  />
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    disabled={isSubmittingAuth}
                    className="flex items-center gap-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 px-4 py-2 text-xs font-bold text-white shadow-sm transition-all active:scale-[0.97] disabled:opacity-50"
                  >
                    {authMode === 'login' ? <LogIn className="h-3.5 w-3.5" /> : <UserPlus className="h-3.5 w-3.5" />}
                    <span>{isSubmittingAuth ? 'Processing...' : authMode === 'login' ? 'Sign In' : 'Create Account'}</span>
                  </button>
                </div>

                <p className="mt-2 text-center text-[11px] text-slate-400 dark:text-slate-500">
                  Default profile: <span className="font-mono">email = 123@gmail.com</span>, <span className="font-mono">password = 123456</span>
                </p>
              </form>
            </div>
          </div>
        )}

        {/* Footer actions */}
        <div className="mt-5 flex items-center justify-between border-t dark:border-white/10 border-slate-200 pt-4">
          <button
            onClick={() => {
              setIsProfileModalOpen(false);
              setActiveTab('profile');
            }}
            className="flex items-center gap-1.5 text-xs font-bold text-brand-500 hover:text-brand-400"
          >
            <span>View Detailed Skill Progress</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>

          <button
            onClick={() => {
              setIsProfileModalOpen(false);
              resetDomainState();
            }}
            className="rounded-xl border dark:border-white/10 border-slate-200 dark:bg-surface-50 bg-slate-100 px-3.5 py-1.5 text-xs font-medium dark:text-slate-300 text-slate-700 hover:bg-slate-200 dark:hover:bg-surface-50/80 transition-all"
          >
            Reset Plan
          </button>
        </div>
      </div>
    </div>
  );
}
