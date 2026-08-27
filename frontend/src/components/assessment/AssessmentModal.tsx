'use client';

import React, { useState, useEffect } from 'react';
import { useSkillTwin } from '../../lib/state/store';
import { SkillTwinAPI } from '../../lib/api';
import confetti from 'canvas-confetti';
import {
  Activity,
  X,
  CheckCircle2,
  AlertCircle,
  Calculator,
  GitCompare,
  Zap
} from 'lucide-react';
import { AssessmentQuestion } from '../../lib/types';

export default function AssessmentModal() {
  const {
    isAssessmentOpen,
    assessmentSkillId,
    closeAssessment,
    skills,
    masteryMap,
    submitAssessmentEvidence,
    openBktModal,
    setActiveTab,
    currentDomain
  } = useSkillTwin();

  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [submissionResult, setSubmissionResult] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState<boolean>(true);

  const skill = skills.find(s => s.id === assessmentSkillId) || skills[0];

  useEffect(() => {
    if (isAssessmentOpen && skill) {
      setIsLoadingQuestions(true);
      setSelectedAnswers({});
      setIsSubmitted(false);
      setSubmissionResult(null);

      SkillTwinAPI.getQuestionsForSkill(skill.id, skill.name, currentDomain)
        .then(qList => {
          setQuestions(qList);
          setIsLoadingQuestions(false);
        })
        .catch(() => {
          setIsLoadingQuestions(false);
        });
    }
  }, [isAssessmentOpen, skill, currentDomain]);

  if (!isAssessmentOpen || !skill) return null;

  const currentPrior = masteryMap.get(skill.id) ?? 0.10;

  const handleSelectOption = (questionId: string, optionId: string) => {
    if (isSubmitted) return;
    setSelectedAnswers(prev => ({ ...prev, [questionId]: optionId }));
  };

  const handleSubmit = async () => {
    if (isSubmitting || questions.length === 0) return;
    setIsSubmitting(true);

    let correctCount = 0;
    questions.forEach(q => {
      const chosenOptionId = selectedAnswers[q.id];
      const correctOpt = q.options.find((o: any) => o.is_correct);
      if (chosenOptionId && correctOpt && chosenOptionId === correctOpt.id) {
        correctCount++;
      }
    });

    const score = questions.length > 0 ? correctCount / questions.length : 0.5;
    const res = await submitAssessmentEvidence(skill.id, score, 60, selectedAnswers);

    if (score >= 0.70) {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    }

    setSubmissionResult(res);
    setIsSubmitted(true);
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border dark:border-white/15 border-slate-300 dark:bg-[#0c1220] bg-white p-6 shadow-2xl backdrop-blur-2xl transition-colors">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b dark:border-white/10 border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-brand-500/40 bg-brand-500/10 text-brand-500">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-500 dark:text-brand-400">
                Cognitive Evidence Assessment
              </span>
              <h3 className="text-base font-bold dark:text-white text-slate-900 leading-tight">
                {skill.name}
              </h3>
            </div>
          </div>

          <button
            onClick={closeAssessment}
            className="rounded-xl border dark:border-white/10 border-slate-200 dark:bg-surface-200 bg-slate-100 p-1.5 dark:text-slate-400 text-slate-600 hover:text-slate-900 dark:hover:text-white transition-all"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Prior Mastery Strip */}
        <div className="my-4 flex items-center justify-between rounded-2xl border dark:border-white/10 border-slate-200 dark:bg-surface-300/40 bg-slate-50 px-4 py-2.5 text-xs dark:text-slate-300 text-slate-700">
          <span>Current BKT Mastery: <strong className="font-mono dark:text-white text-slate-900">{(currentPrior * 100).toFixed(0)}%</strong></span>
          <span className="text-[11px] dark:text-slate-400 text-slate-500">Mastery Threshold: <strong>80%</strong></span>
        </div>

        {/* Questions Body */}
        {isLoadingQuestions ? (
          <div className="py-12 text-center text-xs dark:text-slate-400 text-slate-500">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent mb-2" />
            Loading assessment questions...
          </div>
        ) : !isSubmitted ? (
          <div className="space-y-6 mt-4">
            {questions.map((q, qIndex) => (
              <div key={q.id} className="space-y-3">
                <div className="flex items-start gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-500/20 text-[11px] font-bold text-brand-500">
                    {qIndex + 1}
                  </span>
                  <p className="text-xs sm:text-sm font-semibold dark:text-slate-100 text-slate-900 leading-relaxed">
                    {q.prompt}
                  </p>
                </div>

                <div className="space-y-2 pl-7">
                  {q.options.map((opt: any) => {
                    const isSelected = selectedAnswers[q.id] === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleSelectOption(q.id, opt.id)}
                        className={`w-full text-left rounded-xl border p-3 text-xs transition-all flex items-start gap-3 ${
                          isSelected
                            ? 'border-brand-500 bg-brand-500/15 dark:text-white text-slate-900 shadow-sm font-semibold'
                            : 'dark:border-white/10 border-slate-200 dark:bg-surface-200/60 bg-slate-50 dark:text-slate-300 text-slate-700 hover:bg-slate-100 dark:hover:bg-surface-100'
                        }`}
                      >
                        <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                          isSelected ? 'bg-brand-500 text-white' : 'dark:bg-white/10 bg-slate-200 dark:text-slate-400 text-slate-600'
                        }`}>
                          {opt.id.toUpperCase()}
                        </span>
                        <span className="flex-1 leading-relaxed">{opt.text}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Submit Action */}
            <div className="mt-6 flex justify-end gap-3 border-t dark:border-white/10 border-slate-200 pt-4">
              <button
                onClick={closeAssessment}
                className="rounded-xl border dark:border-white/10 border-slate-300 dark:bg-surface-200 bg-slate-100 px-4 py-2 text-xs font-semibold dark:text-slate-300 text-slate-700 hover:bg-slate-200 dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={Object.keys(selectedAnswers).length < questions.length || isSubmitting}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-brand-500/25 disabled:opacity-50 transition-all active:scale-95"
              >
                <Zap className="h-4 w-4" />
                <span>Submit Assessment</span>
              </button>
            </div>
          </div>
        ) : (
          /* Submission Results & BKT Transition Display */
          <div className="space-y-5 mt-4">
            <div className={`rounded-2xl border p-5 text-center ${
              submissionResult?.attempt?.is_correct
                ? 'border-emerald-500/40 dark:bg-emerald-950/30 bg-emerald-50/80'
                : 'border-rose-500/40 dark:bg-rose-950/30 bg-rose-50/80'
            }`}>
              <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border shadow-lg ${
                submissionResult?.attempt?.is_correct
                  ? 'border-emerald-500/50 bg-emerald-500/20 text-emerald-600 dark:text-emerald-300'
                  : 'border-rose-500/50 bg-rose-500/20 text-rose-600 dark:text-rose-300'
              }`}>
                {submissionResult?.attempt?.is_correct ? (
                  <CheckCircle2 className="h-6 w-6" />
                ) : (
                  <AlertCircle className="h-6 w-6" />
                )}
              </div>

              <h4 className="text-base font-bold dark:text-white text-slate-900 mt-3">
                {submissionResult?.attempt?.is_correct ? 'Mastery Verified!' : 'Knowledge Gap Identified'}
              </h4>
              <p className="text-xs dark:text-slate-300 text-slate-600 mt-1 max-w-md mx-auto">
                {submissionResult?.attempt?.is_correct
                  ? `Your score of ${(submissionResult.attempt.score * 100).toFixed(0)}% elevated your latent mastery above the 0.80 threshold.`
                  : `Score of ${(submissionResult.attempt.score * 100).toFixed(0)}% updated your posterior probability and patched your curriculum path.`}
              </p>

              {/* BKT Transition Comparison */}
              <div className="mt-5 grid grid-cols-2 gap-3 max-w-sm mx-auto text-left">
                <div className="rounded-xl border dark:border-white/10 border-slate-200 dark:bg-surface-300/80 bg-white p-3 shadow-xs">
                  <span className="text-[10px] dark:text-slate-400 text-slate-500 font-mono block">Prior P(L)</span>
                  <span className="text-lg font-bold dark:text-slate-300 text-slate-800">
                    {(currentPrior * 100).toFixed(0)}%
                  </span>
                </div>
                <div className={`rounded-xl border p-3 shadow-xs ${
                  submissionResult?.attempt?.is_correct
                    ? 'border-emerald-500/30 bg-emerald-500/10'
                    : 'border-rose-500/30 bg-rose-500/10'
                }`}>
                  <span className="text-[10px] dark:text-slate-400 text-slate-500 font-mono block">Posterior P(L_next)</span>
                  <span className={`text-lg font-bold ${
                    submissionResult?.attempt?.is_correct ? 'text-emerald-500' : 'text-rose-500'
                  }`}>
                    {((submissionResult?.bktResult?.posterior_after_transition ?? 0) * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t dark:border-white/10 border-slate-200 pt-4">
              <button
                onClick={() => {
                  closeAssessment();
                  openBktModal();
                }}
                className="flex items-center gap-1.5 rounded-xl border border-cyan-500/40 dark:bg-cyan-500/20 bg-cyan-50 px-4 py-2 text-xs font-semibold text-cyan-600 dark:text-cyan-300 hover:bg-cyan-100 dark:hover:bg-cyan-500/30"
              >
                <Calculator className="h-3.5 w-3.5" />
                <span>View BKT Formula Math</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    closeAssessment();
                    setActiveTab('repair_studio');
                  }}
                  className="flex items-center gap-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 px-4 py-2 text-xs font-bold text-white shadow-md transition-all"
                >
                  <GitCompare className="h-3.5 w-3.5" />
                  <span>Inspect Plan Repair Diff</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
