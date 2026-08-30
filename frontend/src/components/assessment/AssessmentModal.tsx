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
  GitCompare,
  Zap,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Award,
  BookOpen,
  TrendingUp,
  Check,
  Flame,
  ShieldCheck,
  RotateCcw
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
    currentDomain,
    activeRepairDiff,
    currentPath
  } = useSkillTwin();

  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [submissionResult, setSubmissionResult] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState<boolean>(true);
  const [visibleHints, setVisibleHints] = useState<Record<string, boolean>>({});
  const [expandedReviewId, setExpandedReviewId] = useState<string | null>(null);

  const skill = skills.find(s => s.id === assessmentSkillId) || skills[0];
  const isRemedialNode = !!activeRepairDiff?.inserted_nodes?.some((i: any) => i.skill_id === skill?.id) ||
    !!currentPath?.nodes?.some(n => n.skill_id === skill?.id && n.is_remedial);

  useEffect(() => {
    if (isAssessmentOpen && skill) {
      setIsLoadingQuestions(true);
      setCurrentQIndex(0);
      setSelectedAnswers({});
      setIsSubmitted(false);
      setSubmissionResult(null);
      setVisibleHints({});
      setExpandedReviewId(null);

      const currentMastery = masteryMap.get(skill.id) ?? 0.10;

      SkillTwinAPI.getQuestionsForSkill(skill.id, {
        skillName: skill.name,
        domain: currentDomain,
        isRemedial: isRemedialNode,
        masteryProb: currentMastery,
        attemptCount: isRemedialNode ? 1 : 0
      })
        .then(qList => {
          setQuestions(qList);
          setIsLoadingQuestions(false);
        })
        .catch(() => {
          setIsLoadingQuestions(false);
        });
    }
  }, [isAssessmentOpen, assessmentSkillId, currentDomain]);

  if (!isAssessmentOpen || !skill) return null;

  const currentPrior = masteryMap.get(skill.id) ?? 0.10;
  const currentQ = questions[currentQIndex];
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(selectedAnswers).length;
  const progressPct = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;

  const handleSelectOption = (questionId: string, optionId: string) => {
    if (isSubmitted) return;
    setSelectedAnswers(prev => ({ ...prev, [questionId]: optionId }));
  };

  const toggleHint = (questionId: string) => {
    setVisibleHints(prev => ({ ...prev, [questionId]: !prev[questionId] }));
  };

  const handleNext = () => {
    if (currentQIndex < totalQuestions - 1) {
      setCurrentQIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentQIndex > 0) {
      setCurrentQIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting || totalQuestions === 0) return;
    setIsSubmitting(true);

    let correctCount = 0;
    const answeredMap = { ...selectedAnswers };

    questions.forEach(q => {
      const chosenOptionId = answeredMap[q.id];
      const correctOpt = q.options.find((o: any) => o.is_correct);
      if (chosenOptionId && correctOpt && chosenOptionId === correctOpt.id) {
        correctCount++;
      }
    });

    const score = totalQuestions > 0 ? correctCount / totalQuestions : 0.0;
    const res = await submitAssessmentEvidence(skill.id, score, 60, answeredMap);

    // Confetti on passing scores
    if (score >= 1.0) {
      confetti({ particleCount: 100, spread: 90, origin: { y: 0.6 } });
    } else if (score >= 0.75) {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    }

    setSubmissionResult({
      ...res,
      correctCount,
      totalCount: totalQuestions,
      scorePct: Math.round(score * 100),
      recordedAnswers: answeredMap
    });
    setIsSubmitted(true);
    setIsSubmitting(false);
  };

  const handleRetakeQuiz = () => {
    setSelectedAnswers({});
    setCurrentQIndex(0);
    setIsSubmitted(false);
    setSubmissionResult(null);
    setVisibleHints({});
  };

  const handleStartRemedialQuiz = () => {
    setIsLoadingQuestions(true);
    setSelectedAnswers({});
    setCurrentQIndex(0);
    setIsSubmitted(false);
    setSubmissionResult(null);
    setVisibleHints({});

    SkillTwinAPI.getQuestionsForSkill(skill.id, {
      skillName: skill.name,
      domain: currentDomain,
      isRemedial: true,
      masteryProb: 0.15,
      attemptCount: 1
    })
      .then(qList => {
        setQuestions(qList);
        setIsLoadingQuestions(false);
      })
      .catch(() => setIsLoadingQuestions(false));
  };

  const handleStartAdvancedChallenge = () => {
    setIsLoadingQuestions(true);
    setSelectedAnswers({});
    setCurrentQIndex(0);
    setIsSubmitted(false);
    setSubmissionResult(null);
    setVisibleHints({});

    SkillTwinAPI.getQuestionsForSkill(skill.id, {
      skillName: skill.name,
      domain: currentDomain,
      isAdvanced: true,
      masteryProb: 0.95,
      attemptCount: 1
    })
      .then(qList => {
        setQuestions(qList);
        setIsLoadingQuestions(false);
      })
      .catch(() => setIsLoadingQuestions(false));
  };

  const getOutcomeTier = (scorePct: number) => {
    if (scorePct >= 100) {
      return {
        tier: 'perfect',
        title: '🏆 Perfect 100% Score! Advanced Topics Unlocked',
        desc: 'Exceptional mastery! You answered all 4 questions correctly. Advanced challenge topics and downstream chapters have been unlocked on your roadmap.',
        badge: '🏆 Level 4 • Mastered Pro (100%)',
        badgeColor: 'text-emerald-500 bg-emerald-500/15 border-emerald-500/40',
        borderColor: 'border-emerald-500/40 dark:bg-emerald-950/25 bg-emerald-50/90',
        iconColor: 'border-emerald-500/50 bg-emerald-500/20 text-emerald-600 dark:text-emerald-300'
      };
    } else if (scorePct >= 75) {
      return {
        tier: 'passed',
        title: '🎉 Chapter Passed (75%)! Next Chapter Unlocked',
        desc: 'Competency verified! You scored 75% (3/4 correct), meeting the required benchmark to advance along your active learning roadmap.',
        badge: '🎯 Level 3 • Competent (75%)',
        badgeColor: 'text-cyan-500 bg-cyan-500/15 border-cyan-500/40',
        borderColor: 'border-cyan-500/40 dark:bg-cyan-950/25 bg-cyan-50/90',
        iconColor: 'border-cyan-500/50 bg-cyan-500/20 text-cyan-600 dark:text-cyan-300'
      };
    } else if (scorePct >= 50) {
      return {
        tier: 'retry',
        title: '🔄 Needs Reinforcement (50%) • Passing Score is 75%',
        desc: 'You scored 50% (2/4 correct). A minimum score of 75% is required to unlock the next chapter. Review the explanations below and repeat this chapter quiz to advance.',
        badge: '⚡ Level 2 • Basic (50%)',
        badgeColor: 'text-amber-500 bg-amber-500/15 border-amber-500/40',
        borderColor: 'border-amber-500/40 dark:bg-amber-950/25 bg-amber-50/90',
        iconColor: 'border-amber-500/50 bg-amber-500/20 text-amber-600 dark:text-amber-300'
      };
    } else {
      return {
        tier: 'remedial',
        title: '🌱 Prerequisite Gap Detected • Remedial Quiz Scheduled',
        desc: `You scored ${scorePct}% (${Math.round((scorePct / 100) * 4)}/4 correct). A foundational prerequisite gap was detected. A focused remedial practice quiz has been scheduled to help you master the core building blocks.`,
        badge: '🌱 Level 1 • Foundational Review',
        badgeColor: 'text-rose-500 bg-rose-500/15 border-rose-500/40',
        borderColor: 'border-rose-500/40 dark:bg-rose-950/25 bg-rose-50/90',
        iconColor: 'border-rose-500/50 bg-rose-500/20 text-rose-600 dark:text-rose-300'
      };
    }
  };

  const getStageBadge = (stage?: number) => {
    switch (stage) {
      case 1:
        return { label: '🌱 Level 1 • Foundational Concept', color: 'text-amber-600 dark:text-amber-300 bg-amber-500/10 border-amber-500/30' };
      case 2:
        return { label: '⚡ Level 2 • Core Syntax & Usage', color: 'text-sky-600 dark:text-sky-300 bg-sky-500/10 border-sky-500/30' };
      case 3:
        return { label: '🎯 Level 3 • Real-World Diagnostic', color: 'text-indigo-600 dark:text-indigo-300 bg-indigo-500/10 border-indigo-500/30' };
      case 4:
        return { label: '🏆 Level 4 • Advanced Mastery Challenge', color: 'text-emerald-600 dark:text-emerald-300 bg-emerald-500/10 border-emerald-500/30' };
      default:
        return { label: '🎯 Chapter Practice', color: 'text-brand-600 dark:text-brand-300 bg-brand-500/10 border-brand-500/30' };
    }
  };

  const getMasteryLevelBadge = (posterior: number) => {
    if (posterior >= 0.80) {
      return { level: 4, name: 'Level 4: Mastered Pro', desc: 'Expert mastery achieved! Downstream topics unlocked.', color: 'text-emerald-500 bg-emerald-500/15 border-emerald-500/40' };
    } else if (posterior >= 0.60) {
      return { level: 3, name: 'Level 3: Competent Developer', desc: 'Solid working competency! Passed quiz standard.', color: 'text-cyan-500 bg-cyan-500/15 border-cyan-500/40' };
    } else if (posterior >= 0.35) {
      return { level: 2, name: 'Level 2: Basic Practitioner', desc: 'Good start. Reinforce core syntax to build mastery.', color: 'text-sky-500 bg-sky-500/15 border-sky-500/40' };
    } else {
      return { level: 1, name: 'Level 1: Foundational Explorer', desc: 'Focus on core building blocks with remedial practice.', color: 'text-amber-500 bg-amber-500/15 border-amber-500/40' };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[92vh] overflow-hidden rounded-3xl border dark:border-white/15 border-slate-300 dark:bg-[#0b101b] bg-white shadow-2xl flex flex-col animate-modal-reveal">
        
        {/* ========================================================= */}
        {/* Top Header & Progress                                     */}
        {/* ========================================================= */}
        <div className="border-b dark:border-white/10 border-slate-200 p-5 pb-4 bg-slate-50/50 dark:bg-surface-100/40">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`flex h-11 w-11 items-center justify-center rounded-2xl border shadow-sm ${
                isRemedialNode
                  ? 'border-amber-500/40 bg-amber-500/10 text-amber-500'
                  : 'border-brand-500/40 bg-brand-500/10 text-brand-500'
              }`}>
                {isRemedialNode ? <Flame className="h-6 w-6" /> : <Activity className="h-6 w-6" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                    isRemedialNode
                      ? 'bg-amber-500/15 text-amber-600 dark:text-amber-300 border-amber-500/30'
                      : 'bg-brand-500/15 text-brand-600 dark:text-brand-300 border-brand-500/30'
                  }`}>
                    {isRemedialNode ? '🌱 Foundation Reinforcement' : 'Interactive Chapter Quiz'}
                  </span>
                  <span className="text-xs dark:text-slate-400 text-slate-500 font-medium">
                    Starting: <strong>{Math.round(currentPrior * 100)}%</strong>
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold dark:text-white text-slate-900 leading-tight mt-0.5">
                  {skill.name}
                </h3>
              </div>
            </div>

            <button
              onClick={closeAssessment}
              className="rounded-xl border dark:border-white/10 border-slate-200 dark:bg-surface-50 bg-slate-100 p-2 dark:text-slate-400 text-slate-600 hover:text-slate-900 dark:hover:text-white transition-all active:scale-[0.95]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Question Navigator Dots & Progress Bar */}
          {!isLoadingQuestions && !isSubmitted && totalQuestions > 0 && (
            <div className="mt-4 pt-3 border-t dark:border-white/5 border-slate-200/80 flex flex-wrap items-center justify-between gap-3">
              
              {/* Question Step Numbers (GFG / TutorialsPoint Style) */}
              <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                {questions.map((q, idx) => {
                  const isCurrent = idx === currentQIndex;
                  const isAnswered = selectedAnswers[q.id] !== undefined;

                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => setCurrentQIndex(idx)}
                      className={`h-7 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                        isCurrent
                          ? 'bg-brand-600 text-white shadow-md ring-2 ring-brand-400 scale-105'
                          : isAnswered
                          ? 'dark:bg-cyan-950/40 bg-cyan-50 text-cyan-700 dark:text-cyan-300 border border-cyan-500/40'
                          : 'dark:bg-surface-50 bg-slate-100 dark:text-slate-400 text-slate-600 border dark:border-white/5 border-slate-200 hover:border-brand-500/40'
                      }`}
                    >
                      <span>Q{idx + 1}</span>
                      {isAnswered && <span className="h-1.5 w-1.5 rounded-full bg-cyan-500 dark:bg-cyan-400 inline-block" />}
                    </button>
                  );
                })}
              </div>

              {/* Progress Count */}
              <div className="text-[11px] font-semibold dark:text-slate-400 text-slate-600">
                <span className="text-brand-500 font-bold">{answeredCount}</span> of {totalQuestions} answered
              </div>
            </div>
          )}

          {/* Thin Progress bar indicator */}
          {!isLoadingQuestions && !isSubmitted && (
            <div className="w-full bg-slate-200 dark:bg-surface-50 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-brand-500 h-full transition-all duration-300 rounded-full"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* Main Body: Question Page OR Result Page                  */}
        {/* ========================================================= */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-7">
          
          {isLoadingQuestions ? (
            <div className="py-16 text-center text-xs dark:text-slate-400 text-slate-500">
              <div className="mx-auto h-9 w-9 animate-spin rounded-full border-3 border-brand-500 border-t-transparent mb-3" />
              Loading multi-tier calibrated quiz questions...
            </div>
          ) : !isSubmitted && currentQ ? (
            
            /* ------------------------------------------------------- */
            /* Active Question Card                                    */
            /* ------------------------------------------------------- */
            <div key={currentQ.id} className="space-y-5 animate-in fade-in duration-200">
              
              {/* Question Meta Badge & Difficulty Stage */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className={`text-[11px] font-bold px-3 py-1 rounded-full border ${getStageBadge(currentQ.stage).color}`}>
                  {getStageBadge(currentQ.stage).label}
                </span>

                <span className="text-[11px] font-mono font-semibold dark:text-slate-400 text-slate-500">
                  Question {currentQIndex + 1} of {totalQuestions}
                </span>
              </div>

              {/* Concept Primer (Learning First before Assessment) */}
              {currentQ.concept_primer && (
                <div className="rounded-2xl border border-brand-500/25 dark:bg-brand-950/20 bg-indigo-50/70 p-4 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-brand-600 dark:text-brand-300 mb-1">
                    <Sparkles className="h-4 w-4" />
                    <span>Concept Primer</span>
                  </div>
                  <p className="dark:text-slate-200 text-slate-700 leading-relaxed">
                    {currentQ.concept_primer}
                  </p>
                </div>
              )}

              {/* Question Prompt Title */}
              <div className="space-y-2">
                <h4 className="text-sm sm:text-base font-bold dark:text-white text-slate-900 leading-relaxed">
                  {currentQ.prompt || currentQ.question}
                </h4>

                {/* Interactive Hint Dropdown */}
                {currentQ.hint && (
                  <div>
                    <button
                      type="button"
                      onClick={() => toggleHint(currentQ.id)}
                      className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:underline inline-flex items-center gap-1.5 transition-all"
                    >
                      <HelpCircle className="h-3.5 w-3.5" />
                      <span>{visibleHints[currentQ.id] ? 'Hide Hint' : 'Need a hint?'}</span>
                    </button>
                    {visibleHints[currentQ.id] && (
                      <div className="mt-2 text-xs text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-surface-100 p-3 rounded-2xl border dark:border-white/5 border-slate-200 animate-in fade-in">
                        🔍 <strong>Hint:</strong> {currentQ.hint}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Option Choices */}
              <div className="space-y-2.5 pt-1">
                {currentQ.options.map((opt: any) => {
                  const isSelected = selectedAnswers[currentQ.id] === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleSelectOption(currentQ.id, opt.id)}
                      className={`w-full text-left rounded-2xl border p-4 text-xs sm:text-sm transition-all flex items-start gap-3.5 active:scale-[0.99] ${
                        isSelected
                          ? 'border-brand-500 bg-brand-500/15 dark:text-white text-slate-900 font-semibold ring-2 ring-brand-500/40 shadow-sm'
                          : 'dark:border-white/10 border-slate-200 dark:bg-surface-100 bg-slate-50 dark:text-slate-300 text-slate-700 hover:bg-slate-100 dark:hover:bg-surface-50'
                      }`}
                    >
                      <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-xl text-xs font-bold transition-all ${
                        isSelected
                          ? 'bg-brand-600 text-white shadow-xs'
                          : 'dark:bg-white/10 bg-slate-200 dark:text-slate-400 text-slate-600'
                      }`}>
                        {opt.id.toUpperCase()}
                      </span>
                      <span className="flex-1 leading-relaxed mt-0.5">{opt.text}</span>
                    </button>
                  );
                })}
              </div>

            </div>
          ) : isSubmitted && submissionResult ? (
            
            /* ------------------------------------------------------- */
            /* TutorialsPoint / GFG Style Rich Score & Review Screen   */
            /* ------------------------------------------------------- */
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* Score & Mastery Level Banner (4-Tier Progression System) */}
              {(() => {
                const outcome = getOutcomeTier(submissionResult.scorePct);
                const finalPosterior = submissionResult?.bktResult?.posterior_after_transition ?? (submissionResult.scorePct >= 75 ? 0.80 : 0.40);
                const levelInfo = getMasteryLevelBadge(finalPosterior);

                return (
                  <div className={`rounded-3xl border p-6 text-center relative overflow-hidden ${outcome.borderColor}`}>
                    <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border shadow-md ${outcome.iconColor}`}>
                      {outcome.tier === 'perfect' ? (
                        <Award className="h-8 w-8 text-emerald-500" />
                      ) : outcome.tier === 'passed' ? (
                        <CheckCircle2 className="h-8 w-8 text-cyan-500" />
                      ) : outcome.tier === 'retry' ? (
                        <RotateCcw className="h-8 w-8 text-amber-500" />
                      ) : (
                        <Flame className="h-8 w-8 text-rose-500" />
                      )}
                    </div>

                    <div className="mt-3 flex items-center justify-center gap-2">
                      <span className={`text-[11px] font-bold px-3 py-0.5 rounded-full border ${outcome.badgeColor}`}>
                        {outcome.badge}
                      </span>
                    </div>

                    <h4 className="text-lg font-bold dark:text-white text-slate-900 mt-2">
                      {outcome.title}
                    </h4>

                    <p className="text-xs sm:text-sm dark:text-slate-300 text-slate-600 mt-1 max-w-lg mx-auto leading-relaxed">
                      {outcome.desc}
                    </p>

                    {/* 4-Level Gauge Breakdown */}
                    <div className="mt-5 max-w-md mx-auto rounded-2xl border dark:border-white/10 border-slate-200 dark:bg-surface-100 bg-white p-4 text-left space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Mastery Classification</span>
                        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${levelInfo.color}`}>
                          {levelInfo.name}
                        </span>
                      </div>
                      <p className="text-xs dark:text-slate-300 text-slate-600 leading-relaxed">
                        {levelInfo.desc}
                      </p>

                      <div className="grid grid-cols-2 gap-3 pt-1 border-t dark:border-white/5 border-slate-100">
                        <div>
                          <span className="text-[10px] text-slate-400 block">Starting Skill Level</span>
                          <span className="text-base font-bold dark:text-slate-200 text-slate-800">
                            {Math.round(currentPrior * 100)}%
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block">Updated Skill Score</span>
                          <span className={`text-base font-bold ${
                            submissionResult.scorePct >= 75 ? 'text-emerald-500' : submissionResult.scorePct >= 50 ? 'text-amber-500' : 'text-rose-500'
                          }`}>
                            {Math.round(finalPosterior * 100)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Detailed Question Review & Explanations Accordion */}
              <div className="space-y-3">
                <h5 className="text-xs font-bold uppercase tracking-wider dark:text-slate-400 text-slate-600 flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4" />
                  Detailed Question Review & Explanations
                </h5>

                <div className="space-y-3">
                  {questions.map((q, idx) => {
                    const chosenId = submissionResult?.recordedAnswers?.[q.id] ?? selectedAnswers[q.id];
                    const chosenOpt = q.options.find((o: any) => o.id === chosenId);
                    const correctOpt = q.options.find((o: any) => o.is_correct);
                    const isRight = chosenId && correctOpt && chosenId === correctOpt.id;

                    return (
                      <div
                        key={q.id}
                        className={`rounded-2xl border p-4 text-xs transition-all ${
                          isRight
                            ? 'border-emerald-500/30 dark:bg-emerald-950/15 bg-emerald-50/50'
                            : 'border-rose-500/30 dark:bg-rose-950/15 bg-rose-50/50'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-2.5">
                            <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                              isRight ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                            }`}>
                              {isRight ? '✓' : '✗'}
                            </span>
                            <div>
                              <span className="text-[10px] font-mono font-bold dark:text-slate-400 text-slate-500 block mb-0.5">
                                Question {idx + 1} ({getStageBadge(q.stage).label})
                              </span>
                              <p className="font-semibold dark:text-slate-200 text-slate-800 leading-relaxed">
                                {q.prompt || q.question}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Options List in Review Mode */}
                        <div className="mt-3 pl-7 space-y-2 text-xs">
                          <div className="space-y-1.5">
                            {q.options.map((opt: any) => {
                              const isThisChosen = chosenId === opt.id;
                              const isThisCorrect = opt.is_correct;

                              let optStyle = 'dark:border-white/5 border-slate-200 dark:bg-surface-50/40 bg-white/60 dark:text-slate-400 text-slate-600';
                              let badge = null;

                              if (isThisCorrect) {
                                optStyle = 'border-emerald-500/50 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200 font-semibold';
                                badge = (
                                  <span className="ml-auto text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                                    <Check className="h-2.5 w-2.5 stroke-[3]" />
                                    Correct Answer
                                  </span>
                                );
                              } else if (isThisChosen && !isThisCorrect) {
                                optStyle = 'border-rose-500/50 bg-rose-500/10 text-rose-800 dark:text-rose-200 font-semibold';
                                badge = (
                                  <span className="ml-auto text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-500/15 px-2 py-0.5 rounded-full border border-rose-500/30 flex items-center gap-1">
                                    <X className="h-2.5 w-2.5 stroke-[3]" />
                                    Your Choice (Incorrect)
                                  </span>
                                );
                              }

                              return (
                                <div
                                  key={opt.id}
                                  className={`rounded-xl border p-2.5 flex items-center justify-between gap-2 transition-all ${optStyle}`}
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-lg text-[10px] font-mono font-bold bg-black/5 dark:bg-white/5">
                                      {opt.id.toUpperCase()}
                                    </span>
                                    <span className="leading-tight">{opt.text}</span>
                                  </div>
                                  {badge}
                                </div>
                              );
                            })}
                          </div>

                          {correctOpt?.explanation && (
                            <div className="mt-2.5 text-[11px] dark:text-slate-300 text-slate-700 bg-white dark:bg-surface-50 p-3 rounded-xl border dark:border-white/5 border-slate-200">
                              <span className="font-bold text-brand-600 dark:text-brand-300 block mb-0.5">
                                💡 Explanation & Core Principle:
                              </span>
                              <p className="leading-relaxed">{correctOpt.explanation}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          ) : null}

        </div>

        {/* ========================================================= */}
        {/* Bottom Action Bar                                         */}
        {/* ========================================================= */}
        <div className="border-t dark:border-white/10 border-slate-200 p-4 px-6 bg-slate-50 dark:bg-surface-100/50 flex flex-wrap items-center justify-between gap-3">
          
          {!isSubmitted ? (
            <>
              <button
                type="button"
                onClick={handlePrev}
                disabled={currentQIndex === 0 || isLoadingQuestions}
                className="flex items-center gap-1.5 rounded-xl border dark:border-white/10 border-slate-300 dark:bg-surface-50 bg-white px-4 py-2 text-xs font-bold dark:text-slate-300 text-slate-700 hover:bg-slate-100 dark:hover:text-white disabled:opacity-30 transition-all active:scale-[0.97]"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Previous</span>
              </button>

              <div className="flex items-center gap-2">
                {currentQIndex < totalQuestions - 1 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="flex items-center gap-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition-all btn-tactile"
                  >
                    <span>Next Question</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={answeredCount < totalQuestions || isSubmitting}
                    className="flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-6 py-2.5 text-xs font-bold text-white shadow-md disabled:opacity-40 transition-all btn-tactile"
                  >
                    <Zap className="h-4 w-4" />
                    <span>Submit & Grade Quiz</span>
                  </button>
                )}
              </div>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  closeAssessment();
                  openBktModal();
                }}
                className="flex items-center gap-1.5 text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:underline"
              >
                <HelpCircle className="h-4 w-4" />
                <span>Inspect BKT Mastery Calculation</span>
              </button>

              <div className="flex items-center gap-2">
                {submissionResult.scorePct === 50 ? (
                  <button
                    onClick={handleRetakeQuiz}
                    className="flex items-center gap-2 rounded-xl bg-amber-600 hover:bg-amber-500 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition-all btn-tactile"
                  >
                    <RotateCcw className="h-4 w-4" />
                    <span>Repeat Chapter Quiz (Target 75%+)</span>
                  </button>
                ) : submissionResult.scorePct <= 25 ? (
                  <button
                    onClick={handleStartRemedialQuiz}
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition-all btn-tactile"
                  >
                    <Flame className="h-4 w-4" />
                    <span>Start Remedial Quiz (Level 1 Concepts)</span>
                  </button>
                ) : submissionResult.scorePct >= 100 ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleStartAdvancedChallenge}
                      className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-600 hover:from-amber-400 hover:to-emerald-500 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-all btn-tactile"
                    >
                      <Sparkles className="h-4 w-4" />
                      <span>Take Advanced Challenge</span>
                    </button>
                    <button
                      onClick={() => {
                        closeAssessment();
                        setActiveTab('roadmap');
                      }}
                      className="flex items-center gap-2 rounded-xl bg-brand-600 hover:bg-brand-500 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition-all btn-tactile"
                    >
                      <span>Continue Next Chapter</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      closeAssessment();
                      setActiveTab('roadmap');
                    }}
                    className="flex items-center gap-2 rounded-xl bg-brand-600 hover:bg-brand-500 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition-all btn-tactile"
                  >
                    <span>Continue Next Chapter</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            </>
          )}

        </div>

      </div>
    </div>
  );
}
