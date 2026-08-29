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
  Zap,
  HelpCircle
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
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border dark:border-white/15 border-slate-300 dark:bg-[#0b101b] bg-white p-6 shadow-2xl animate-modal-reveal">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b dark:border-white/10 border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-brand-500/40 bg-brand-500/10 text-brand-500 shadow-sm">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                Chapter Practice Quiz
              </span>
              <h3 className="text-base sm:text-lg font-bold dark:text-white text-slate-900 leading-tight">
                {skill.name}
              </h3>
            </div>
          </div>

          <button
            onClick={closeAssessment}
            className="rounded-xl border dark:border-white/10 border-slate-200 dark:bg-surface-50 bg-slate-100 p-1.5 dark:text-slate-400 text-slate-600 hover:text-slate-900 dark:hover:text-white transition-all active:scale-[0.95]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Prior Mastery Strip */}
        <div className="my-4 flex items-center justify-between rounded-2xl border dark:border-white/10 border-slate-200 dark:bg-surface-100 bg-slate-50 px-4 py-2.5 text-xs dark:text-slate-300 text-slate-700">
          <span>Starting Skill Level: <strong className="font-bold dark:text-white text-slate-900">{Math.round(currentPrior * 100)}%</strong></span>
          <span className="text-[11px] dark:text-slate-400 text-slate-500">Target to Pass: <strong>80%</strong></span>
        </div>

        {/* Questions Body */}
        {isLoadingQuestions ? (
          <div className="py-12 text-center text-xs dark:text-slate-400 text-slate-500">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent mb-2" />
            Preparing quiz questions...
          </div>
        ) : !isSubmitted ? (
          <div className="space-y-6 mt-4">
            {questions.map((q, qIndex) => (
              <div key={q.id} className="space-y-3">
                <div className="flex items-start gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-500/20 text-[11px] font-mono font-bold text-brand-600 dark:text-brand-400">
                    {qIndex + 1}
                  </span>
                  <p className="text-xs sm:text-sm font-semibold dark:text-slate-100 text-slate-900 leading-relaxed">
                    {q.prompt || q.question}
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
                        className={`w-full text-left rounded-xl border p-3 text-xs transition-all flex items-start gap-3 active:scale-[0.98] ${
                          isSelected
                            ? 'border-brand-500 bg-brand-500/15 dark:text-white text-slate-900 shadow-xs font-semibold ring-1 ring-brand-500/40'
                            : 'dark:border-white/10 border-slate-200 dark:bg-surface-100 bg-slate-50 dark:text-slate-300 text-slate-700 hover:bg-slate-100 dark:hover:bg-surface-50'
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
                className="rounded-xl border dark:border-white/10 border-slate-300 dark:bg-surface-100 bg-slate-100 px-4 py-2 text-xs font-semibold dark:text-slate-300 text-slate-700 hover:bg-slate-200 dark:hover:text-white transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={Object.keys(selectedAnswers).length < questions.length || isSubmitting}
                className="flex items-center gap-2 rounded-xl bg-brand-600 hover:bg-brand-500 px-6 py-2.5 text-xs font-bold text-white shadow-sm disabled:opacity-50 transition-all btn-tactile"
              >
                <Zap className="h-4 w-4" />
                <span>Submit Quiz</span>
              </button>
            </div>
          </div>
        ) : (
          /* Submission Results */
          <div className="space-y-5 mt-4">
            <div className={`rounded-2xl border p-5 text-center ${
              submissionResult?.attempt?.is_correct
                ? 'border-emerald-500/40 dark:bg-emerald-950/30 bg-emerald-50/80'
                : 'border-rose-500/40 dark:bg-rose-950/30 bg-rose-50/80'
            }`}>
              <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border shadow-sm ${
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
                {submissionResult?.attempt?.is_correct ? 'Chapter Mastered!' : 'Needs a Little More Practice'}
              </h4>
              <p className="text-xs dark:text-slate-300 text-slate-600 mt-1 max-w-md mx-auto leading-relaxed">
                {submissionResult?.attempt?.is_correct
                  ? `You scored ${Math.round(submissionResult.attempt.score * 100)}%! You have reached the 80% target and unlocked the next topics in your roadmap.`
                  : `You scored ${Math.round(submissionResult.attempt.score * 100)}%. We added an extra practice chapter to your plan to help you build confidence.`}
              </p>

              {/* Score Transition */}
              <div className="mt-5 grid grid-cols-2 gap-3 max-w-sm mx-auto text-left">
                <div className="rounded-xl border dark:border-white/10 border-slate-200 dark:bg-surface-100 bg-white p-3">
                  <span className="text-[10px] dark:text-slate-400 text-slate-500 block">Starting Level</span>
                  <span className="text-lg font-bold dark:text-slate-300 text-slate-800">
                    {Math.round(currentPrior * 100)}%
                  </span>
                </div>
                <div className={`rounded-xl border p-3 ${
                  submissionResult?.attempt?.is_correct
                    ? 'border-emerald-500/30 bg-emerald-500/10'
                    : 'border-rose-500/30 bg-rose-500/10'
                }`}>
                  <span className="text-[10px] dark:text-slate-400 text-slate-500 block">Updated Skill Score</span>
                  <span className={`text-lg font-bold ${
                    submissionResult?.attempt?.is_correct ? 'text-emerald-500' : 'text-rose-500'
                  }`}>
                    {Math.round((submissionResult?.bktResult?.posterior_after_transition ?? 0) * 100)}%
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
                className="flex items-center gap-1.5 text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:underline"
              >
                <HelpCircle className="h-3.5 w-3.5" />
                <span>How was my score calculated?</span>
              </button>

              <button
                onClick={() => {
                  closeAssessment();
                  setActiveTab('repair_studio');
                }}
                className="flex items-center gap-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 px-4 py-2 text-xs font-bold text-white shadow-sm transition-all btn-tactile"
              >
                <GitCompare className="h-3.5 w-3.5" />
                <span>See what changed in your plan</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
