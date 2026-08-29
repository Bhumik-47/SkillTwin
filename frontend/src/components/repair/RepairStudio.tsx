'use client';

import React, { useState } from 'react';
import { useSkillTwin } from '../../lib/state/store';
import PlanDiffCard from './PlanDiffCard';
import {
  GitCompare,
  RotateCcw,
  ShieldCheck,
  Code,
  Zap,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Layers,
  Activity,
  HelpCircle
} from 'lucide-react';

export default function RepairStudio() {
  const {
    currentPath,
    activeRepairDiff,
    resetDomainState,
    openAssessment,
    submitAssessmentEvidence,
    skills
  } = useSkillTwin();

  const [showDeveloperJson, setShowDeveloperJson] = useState(false);

  // Simulation helpers for immediate live demo
  const handleSimulateFailure = async () => {
    const targetSkill = skills[2] || skills[0];
    await submitAssessmentEvidence(targetSkill.id, 0.0, 45, {});
  };

  const handleSimulatePass = async () => {
    const targetSkill = skills[0];
    await submitAssessmentEvidence(targetSkill.id, 1.0, 30, {});
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Banner: Plan Updates Overview */}
      <div className="rounded-3xl border dark:border-white/10 border-slate-200 dark:bg-[#090f1b] bg-white p-6 sm:p-8 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-6">
          
          <div className="max-w-2xl space-y-2">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-brand-500/15 px-3 py-0.5 text-xs font-semibold text-brand-600 dark:text-brand-300 border border-brand-500/30">
                Adaptive Study Plan
              </span>
              <span className="text-xs dark:text-slate-400 text-slate-500">Continuous Progress Tracking</span>
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight dark:text-white text-slate-900">
              Plan Updates & Adjustments
            </h2>
            
            <p className="text-xs sm:text-sm dark:text-slate-300 text-slate-600 leading-relaxed">
              When quiz results indicate you need extra help on a concept, SkillTwin automatically inserts reinforcement topics into your plan without resetting your overall progress.
            </p>
          </div>

          {/* Practice Simulation Sandbox */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full lg:w-auto">
            <button
              onClick={handleSimulateFailure}
              title="Test how your plan inserts reinforcement topics when extra practice is needed"
              className="flex items-center justify-center gap-2 rounded-xl bg-rose-600 hover:bg-rose-500 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-all btn-tactile"
            >
              <AlertTriangle className="h-4 w-4" />
              <span>Simulate Needing Extra Practice</span>
            </button>

            <button
              onClick={handleSimulatePass}
              title="Test how your plan unlocks future topics after passing a quiz"
              className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-all btn-tactile"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Simulate Quiz Success</span>
            </button>

            <button
              onClick={resetDomainState}
              title="Reset state to initial course layout"
              className="flex items-center justify-center gap-1.5 rounded-xl border dark:border-white/10 border-slate-300 dark:bg-surface-50 bg-white hover:bg-slate-100 dark:hover:bg-surface-100 px-3.5 py-2.5 text-xs font-semibold dark:text-slate-200 text-slate-700 transition-all btn-tactile"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Reset Plan</span>
            </button>
          </div>

        </div>
      </div>

      {/* Active Diff Card */}
      {activeRepairDiff ? (
        <PlanDiffCard />
      ) : (
        <div className="rounded-3xl border dark:border-white/10 border-slate-200 dark:bg-[#090f1b] bg-white p-8 sm:p-12 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-brand-500/30 bg-brand-500/10 text-brand-500">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <h3 className="text-base sm:text-lg font-bold dark:text-white text-slate-900 mt-4 tracking-tight">
            Your Study Plan is Up to Date
          </h3>
          <p className="text-xs sm:text-sm dark:text-slate-400 text-slate-500 mt-1.5 max-w-md mx-auto leading-relaxed">
            Take a practice quiz anytime. If you ever struggle with a topic, your plan will automatically adapt and show the updates right here.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <button
              onClick={() => openAssessment()}
              className="rounded-xl bg-brand-600 hover:bg-brand-500 px-6 py-2.5 text-xs font-bold text-white shadow-sm btn-tactile"
            >
              Start Quick Practice Quiz
            </button>
          </div>
        </div>
      )}

      {/* Explanatory Cards */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        
        {/* How Adaptive Planning Works */}
        <div className="rounded-3xl border dark:border-white/10 border-slate-200 dark:bg-[#090f1b] bg-white p-6 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="h-4 w-4" />
            <span>Smart Adaptation Guarantee</span>
          </div>
          <h4 className="text-base font-bold dark:text-white text-slate-900">How Your Plan Updates Work</h4>
          <p className="text-xs dark:text-slate-300 text-slate-600 leading-relaxed">
            Traditional courses make you repeat whole modules or fail. SkillTwin pinpoints exactly which concept you missed, schedules a quick focused review, and keeps all other completed chapters safe.
          </p>
        </div>

        {/* Developer Diagnostics (Collapsible) */}
        <div className="rounded-3xl border dark:border-white/10 border-slate-200 dark:bg-[#090f1b] bg-white p-6 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
              <Code className="h-4 w-4" />
              <span>Technical Data Payload</span>
            </div>
            <button
              onClick={() => setShowDeveloperJson(!showDeveloperJson)}
              className="text-xs font-semibold text-brand-500 hover:underline"
            >
              {showDeveloperJson ? 'Hide JSON' : 'Show JSON'}
            </button>
          </div>

          {!showDeveloperJson ? (
            <p className="text-xs dark:text-slate-400 text-slate-500 leading-relaxed">
              Raw system logs and schema payloads are collapsed by default to keep your study view clean. Click &quot;Show JSON&quot; if you want to inspect technical change metrics.
            </p>
          ) : (
            <div className="rounded-2xl border dark:border-white/10 border-slate-200 dark:bg-[#040711] bg-slate-900 p-3.5 font-mono text-[11px] text-slate-300 max-h-48 overflow-y-auto">
              <pre>
                {JSON.stringify(
                  activeRepairDiff || {
                    status: "up_to_date",
                    message: "Current plan sequence is optimal"
                  },
                  null,
                  2
                )}
              </pre>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
