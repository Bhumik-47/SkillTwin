'use client';

import React, { useState, useMemo } from 'react';
import { useSkillTwin } from '../../lib/state/store';
import { LearningPathNode } from '../../lib/types';
import MilestoneHero from './MilestoneHero';
import PlanDiffCard from '../repair/PlanDiffCard';
import {
  CheckCircle2,
  Lock,
  Zap,
  Play,
  Clock,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  Layers,
  Search,
  Filter,
  Activity,
  Compass,
  GitCompare,
  Target,
  UserCheck,
  SplitSquareVertical,
  Check,
  AlertCircle
} from 'lucide-react';

export default function RoadmapView() {
  const {
    currentPath,
    activeRepairDiff,
    masteryMap,
    skills,
    dependencies,
    openAssessment,
    setSelectedSkillId,
    setActiveTab,
    currentDomain
  } = useSkillTwin();

  // 4-Stage Flow Step state: 1 (Current), 2 (Required), 3 (The Gap), 4 (Roadmap)
  const [activeStep, setActiveStep] = useState<number>(4);
  const [searchFilter, setSearchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const nodes = currentPath?.nodes || [];
  const targetRole = currentDomain ? currentDomain.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : "Software Engineer";

  // Identify active node: first node that is not mastered
  const activeNode = useMemo(() => {
    if (nodes.length === 0) return null;
    return nodes.find(n => {
      const prob = masteryMap.get(n.skill_id) ?? (n.mastery_prob ?? 0.10);
      return prob < 0.80;
    }) || nodes[0];
  }, [nodes, masteryMap]);

  // Current possessed skills (mastery >= 0.40 or completed)
  const currentSkillsList = useMemo(() => {
    return skills.filter(s => {
      const m = masteryMap.get(s.id) ?? 0.10;
      return m >= 0.35;
    }).map(s => ({
      ...s,
      mastery: masteryMap.get(s.id) ?? 0.10,
      isMastered: (masteryMap.get(s.id) ?? 0.10) >= 0.80
    }));
  }, [skills, masteryMap]);

  // Required skills for role (all skills in roadmap)
  const requiredSkillsList = useMemo(() => {
    return nodes.map(n => {
      const skill = skills.find(s => s.id === n.skill_id);
      const m = masteryMap.get(n.skill_id) ?? 0.10;
      return {
        id: n.skill_id,
        name: n.skill_name || skill?.name || n.skill_id,
        difficulty: skill?.difficulty || 'intermediate',
        mastery: m,
        isMastered: m >= 0.80
      };
    });
  }, [nodes, skills, masteryMap]);

  // Gap skills (required skills with mastery < 0.70)
  const gapSkillsList = useMemo(() => {
    return requiredSkillsList.filter(s => !s.isMastered);
  }, [requiredSkillsList]);

  // Filter nodes for Stage 4
  const filteredNodes = useMemo(() => {
    return nodes.filter(node => {
      const skill = skills.find(s => s.id === node.skill_id);
      const name = node.skill_name || skill?.name || node.skill_id;
      const desc = skill?.description || '';
      
      const matchesSearch =
        name.toLowerCase().includes(searchFilter.toLowerCase()) ||
        desc.toLowerCase().includes(searchFilter.toLowerCase()) ||
        node.skill_id.toLowerCase().includes(searchFilter.toLowerCase());

      if (!matchesSearch) return false;

      const prob = masteryMap.get(node.skill_id) ?? (node.mastery_prob ?? 0.10);
      const isMastered = prob >= 0.80;
      const isRemedial = activeRepairDiff?.inserted_nodes?.some((i: any) => i.skill_id === node.skill_id);

      if (statusFilter === 'all') return true;
      if (statusFilter === 'mastered') return isMastered;
      if (statusFilter === 'active') return node.skill_id === activeNode?.skill_id;
      if (statusFilter === 'remedial') return isRemedial;
      if (statusFilter === 'ready') return node.status === 'ready';
      if (statusFilter === 'locked') return node.status === 'locked';

      return true;
    });
  }, [nodes, searchFilter, statusFilter, skills, masteryMap, activeRepairDiff, activeNode]);

  const totalMinutes = useMemo(() => {
    return nodes.reduce((acc, n) => acc + (n.estimated_minutes || 45), 0);
  }, [nodes]);

  const masteredCount = useMemo(() => {
    return nodes.filter(n => (masteryMap.get(n.skill_id) ?? 0) >= 0.80).length;
  }, [nodes, masteryMap]);

  const handleInspectGraph = (skillId?: string) => {
    if (skillId) setSelectedSkillId(skillId);
    setActiveTab('graph');
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Active Adaptation Notice if plan was adjusted */}
      {activeRepairDiff && <PlanDiffCard />}

      {/* Top Milestone Hero */}
      <MilestoneHero
        activeNode={activeNode}
        onLaunchAssessment={openAssessment}
        onInspectGraph={() => handleInspectGraph(activeNode?.skill_id)}
      />

      {/* ========================================================================= */}
      {/* 4-STAGE GAP-FIRST RECOMMENDATION FLOW STEPPER                             */}
      {/* ========================================================================= */}
      <div className="rounded-3xl border dark:border-white/10 border-slate-200 dark:bg-[#070c18] bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded-md border border-brand-500/20">
              Personalized Guidance Flow
            </span>
          </div>
          <span className="text-xs font-mono dark:text-slate-400 text-slate-500">
            Target Role: <strong className="text-slate-900 dark:text-white">{targetRole}</strong>
          </span>
        </div>

        {/* 4 Step Pills */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[
            { step: 1, title: 'Your Current Skills', subtitle: `${currentSkillsList.length} skills possessed`, icon: UserCheck },
            { step: 2, title: `Required for ${targetRole}`, subtitle: `${requiredSkillsList.length} total competencies`, icon: Target },
            { step: 3, title: 'The Skill Gap', subtitle: `${gapSkillsList.length} topics missing`, icon: SplitSquareVertical },
            { step: 4, title: 'What to Learn Next', subtitle: 'Curated roadmap sequence', icon: Sparkles }
          ].map(s => {
            const Icon = s.icon;
            const isCurrent = activeStep === s.step;
            return (
              <button
                key={s.step}
                onClick={() => setActiveStep(s.step)}
                className={`flex items-start gap-2.5 p-3 rounded-2xl border text-left transition-all btn-tactile ${
                  isCurrent
                    ? 'border-brand-500 dark:bg-brand-950/30 bg-indigo-50/80 ring-1 ring-brand-500/40 shadow-xs'
                    : 'dark:border-white/5 border-slate-200 dark:bg-surface-100 bg-slate-50/70 hover:border-slate-300 dark:hover:border-white/10'
                }`}
              >
                <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${
                  isCurrent ? 'bg-brand-600 text-white' : 'dark:bg-surface-50 bg-slate-200 dark:text-slate-400 text-slate-600'
                }`}>
                  {s.step}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold dark:text-white text-slate-900 truncate">
                    {s.title}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {s.subtitle}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Guided Step Panels */}
        {activeStep === 1 && (
          <div className="mt-4 pt-4 border-t dark:border-white/5 border-slate-100 animate-in fade-in duration-150">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5">
              <UserCheck className="h-4 w-4 text-brand-500" />
              Step 1: Your Current Starting Skills
            </h4>
            {currentSkillsList.length === 0 ? (
              <p className="text-xs dark:text-slate-400 text-slate-500">
                No prior skills logged yet. Upload your resume or connect GitHub in Profile to detect existing skills automatically!
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {currentSkillsList.map(s => (
                  <div key={s.id} className="flex items-center justify-between p-2.5 rounded-xl border dark:border-white/5 border-slate-200 dark:bg-surface-50 bg-slate-50 text-xs">
                    <span className="font-semibold dark:text-slate-200 text-slate-800 truncate pr-2">{s.name}</span>
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">
                      {Math.round(s.mastery * 100)}%
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeStep === 2 && (
          <div className="mt-4 pt-4 border-t dark:border-white/5 border-slate-100 animate-in fade-in duration-150">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5">
              <Target className="h-4 w-4 text-emerald-500" />
              Step 2: Core Competencies Required for {targetRole}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {requiredSkillsList.map(s => (
                <div key={s.id} className="flex items-center justify-between p-2.5 rounded-xl border dark:border-white/5 border-slate-200 dark:bg-surface-50 bg-slate-50 text-xs">
                  <span className="font-semibold dark:text-slate-200 text-slate-800 truncate pr-2">{s.name}</span>
                  <span className="text-[10px] uppercase font-bold text-slate-400">
                    {s.difficulty}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeStep === 3 && (
          <div className="mt-4 pt-4 border-t dark:border-white/5 border-slate-100 animate-in fade-in duration-150">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5">
              <SplitSquareVertical className="h-4 w-4 text-amber-500" />
              Step 3: The Gap (What You Have vs. What You Need)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Left: What You Have */}
              <div className="rounded-2xl border border-emerald-500/20 dark:bg-emerald-950/10 bg-emerald-50/40 p-3.5 space-y-2">
                <div className="flex items-center justify-between font-bold text-emerald-600 dark:text-emerald-400">
                  <span>Skills You Have ({currentSkillsList.length})</span>
                  <Check className="h-4 w-4" />
                </div>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {currentSkillsList.map(s => (
                    <div key={s.id} className="flex items-center justify-between py-1 border-b dark:border-white/5 border-slate-200/50 text-[11px]">
                      <span className="dark:text-slate-200 text-slate-800">{s.name}</span>
                      <span className="text-emerald-500 font-bold">{Math.round(s.mastery * 100)}%</span>
                    </div>
                  ))}
                  {currentSkillsList.length === 0 && (
                    <p className="text-slate-400 text-[11px]">No skills mastered yet.</p>
                  )}
                </div>
              </div>

              {/* Right: What's Missing */}
              <div className="rounded-2xl border border-amber-500/20 dark:bg-amber-950/10 bg-amber-50/40 p-3.5 space-y-2">
                <div className="flex items-center justify-between font-bold text-amber-600 dark:text-amber-400">
                  <span>Missing Skills to Learn ({gapSkillsList.length})</span>
                  <AlertCircle className="h-4 w-4" />
                </div>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {gapSkillsList.map(s => (
                    <div key={s.id} className="flex items-center justify-between py-1 border-b dark:border-white/5 border-slate-200/50 text-[11px]">
                      <span className="dark:text-slate-200 text-slate-800">{s.name}</span>
                      <span className="text-amber-500 font-semibold">Ready to Study</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-3 text-right">
              <button
                onClick={() => setActiveStep(4)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 text-white font-bold text-xs shadow-sm hover:bg-brand-500 transition-all btn-tactile"
              >
                <span>View Sequenced Roadmap</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* STAGE 4: SEQUENCED CHAPTER ROADMAP WITH VISIBLE REASONS                   */}
      {/* ========================================================================= */}
      
      {/* Roadmap Controls: Search & Simple Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border dark:border-white/10 border-slate-200 dark:bg-[#090f1b] bg-white p-4 shadow-sm">
        
        {/* Left Metrics */}
        <div className="flex items-center gap-3 text-xs">
          <span className="font-bold dark:text-white text-slate-900">
            Step 4: Sequenced Curriculum:
          </span>
          <span className="font-bold text-brand-500">
            {masteredCount} of {nodes.length} Completed
          </span>
          <span className="hidden sm:inline text-slate-400">•</span>
          <span className="hidden sm:inline dark:text-slate-400 text-slate-500">
            ~{(totalMinutes / 60).toFixed(1)} hrs total
          </span>
        </div>

        {/* Right Search & Filter Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search chapters..."
              value={searchFilter}
              onChange={e => setSearchFilter(e.target.value)}
              className="h-8.5 w-48 sm:w-56 rounded-xl border dark:border-white/10 border-slate-300 dark:bg-surface-100 bg-slate-50 pl-8.5 pr-3 text-xs dark:text-white text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:outline-none transition-all"
            />
          </div>

          <div className="flex rounded-xl dark:bg-surface-100 bg-slate-100 p-0.5 border dark:border-white/10 border-slate-200 text-xs">
            {[
              { id: 'all', label: 'All' },
              { id: 'active', label: 'Current' },
              { id: 'remedial', label: 'Extra Practice' },
              { id: 'mastered', label: 'Completed' },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setStatusFilter(f.id)}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all ${
                  statusFilter === f.id
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'dark:text-slate-400 text-slate-600 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chronological Chapters List */}
      <div className="space-y-3">
        {filteredNodes.map((node, index) => {
          const skill = skills.find(s => s.id === node.skill_id);
          const masteryProb = masteryMap.get(node.skill_id) ?? (node.mastery_prob ?? 0.10);
          const isMastered = masteryProb >= 0.80;
          const isActive = node.skill_id === activeNode?.skill_id;
          const isRemedial = activeRepairDiff?.inserted_nodes?.some((i: any) => i.skill_id === node.skill_id);

          // Calculate downstream dependent skills for grounded reason display
          const downstreamDeps = dependencies.filter(d => d.source_skill_id === node.skill_id);
          const downstreamNames = downstreamDeps.map(d => skills.find(s => s.id === d.target_skill_id)?.name || d.target_skill_id);
          
          const defaultReason = downstreamNames.length > 0
            ? `You should learn ${node.skill_name || skill?.name || node.skill_id} because it's required for ${downstreamNames.length} skill${downstreamNames.length > 1 ? 's' : ''} in your target ${targetRole} role: ${downstreamNames.slice(0, 3).join(', ')}.`
            : `You should learn ${node.skill_name || skill?.name || node.skill_id} because it is a core required competency for your target ${targetRole} role.`;

          const displayReason = node.reason || defaultReason;

          // Direct prerequisites for this card
          const prereqDeps = dependencies.filter(d => d.target_skill_id === node.skill_id);
          const prereqSkills = prereqDeps.map(d => {
            const s = skills.find(sk => sk.id === d.source_skill_id);
            const m = masteryMap.get(d.source_skill_id) ?? 0.10;
            return { id: d.source_skill_id, name: s?.name || d.source_skill_id, mastery: m, isMastered: m >= 0.80 };
          });
          const cardGradient = isRemedial
            ? 'from-rose-500/30 via-rose-500/10 to-transparent hover:from-rose-500/70 hover:via-rose-400/50 hover:to-orange-500/30 hover:shadow-rose-500/10'
            : isActive
            ? 'from-brand-500/40 via-cyan-500/20 to-transparent hover:from-brand-500/80 hover:via-cyan-400/60 hover:to-indigo-500/40 hover:shadow-cyan-500/15 ring-1 ring-brand-500/40'
            : isMastered
            ? 'from-emerald-500/20 via-teal-500/10 to-transparent hover:from-emerald-500/60 hover:via-teal-400/40 hover:to-cyan-500/30 hover:shadow-emerald-500/10'
            : 'from-slate-500/15 via-brand-500/5 to-transparent hover:from-brand-500/50 hover:via-cyan-500/30 hover:to-indigo-500/20 hover:shadow-brand-500/10';

          const glowColor = isRemedial
            ? 'bg-rose-500/15'
            : isActive
            ? 'bg-cyan-500/20'
            : isMastered
            ? 'bg-emerald-500/15'
            : 'bg-brand-500/15';

          return (
            <div
              key={`roadmap_node_${node.node_id || node.skill_id}_step_${node.step_order || index}_${index}`}
              className={`relative group rounded-3xl p-[1px] bg-gradient-to-b ${cardGradient} transition-all duration-500 hover:-translate-y-1 hover:shadow-xl`}
            >
              {/* Card Interior */}
              <div className="relative rounded-[23px] dark:bg-[#0c1424]/95 bg-white/95 backdrop-blur-xl p-5 sm:p-6 overflow-hidden border dark:border-white/5 border-slate-200/80">
                
                {/* Ambient Glow Orb on hover */}
                <div className={`absolute -top-12 -right-12 w-36 h-36 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none ${glowColor}`} />

                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  
                  {/* Step Marker & Title */}
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    
                    {/* Step Order Badge */}
                    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border text-xs font-bold font-mono shadow-xs ${
                      isRemedial
                        ? 'border-rose-500/50 bg-rose-500/20 text-rose-400'
                        : isMastered
                        ? 'border-emerald-500/50 bg-emerald-500/20 text-emerald-400'
                        : isActive
                        ? 'border-brand-500 bg-brand-600 text-white shadow-brand-500/25'
                        : 'dark:border-white/10 border-slate-300 dark:bg-surface-50 bg-slate-200 dark:text-slate-400 text-slate-600'
                    }`}>
                      {isMastered ? <CheckCircle2 className="h-5 w-5" /> : node.step_order}
                    </div>

                    {/* Metadata & Headline */}
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-semibold text-slate-400">
                          Chapter {node.step_order}
                        </span>

                        {isRemedial && (
                          <span className="rounded-full bg-rose-500/20 px-2.5 py-0.5 text-[10px] font-bold text-rose-400 border border-rose-500/40">
                            Extra Practice Added
                          </span>
                        )}

                        {isActive && !isRemedial && (
                          <span className="rounded-full bg-brand-500/20 px-2.5 py-0.5 text-[10px] font-bold text-brand-600 dark:text-brand-300 border border-brand-500/40">
                            Current Chapter
                          </span>
                        )}

                        <span className="text-xs dark:text-slate-400 text-slate-500">
                          ⏱️ ~{node.estimated_minutes || 45} mins
                        </span>
                      </div>

                      <h3 className="text-base sm:text-lg font-extrabold dark:text-white text-slate-900 truncate group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-brand-400 group-hover:to-cyan-400 transition-all duration-300">
                        {node.skill_name || skill?.name || node.skill_id}
                      </h3>

                      <p className="text-xs dark:text-slate-300 text-slate-600 line-clamp-2 leading-relaxed">
                        {skill?.description || 'Learn and practice key concepts to progress toward your goals.'}
                      </p>

                      {/* Grounded Plain-Language Reason (Feature 2 & 4: Always visible) */}
                      <div className="mt-2 rounded-2xl border border-brand-500/20 dark:bg-brand-950/20 bg-brand-50/50 p-3 text-xs text-brand-700 dark:text-brand-300 flex items-start gap-2">
                        <Sparkles className="h-4 w-4 shrink-0 mt-0.5 text-brand-500" />
                        <span className="leading-relaxed">
                          <strong>Why this topic:</strong> {displayReason}
                        </span>
                      </div>

                      {/* Required Earlier Topics */}
                      {prereqSkills.length > 0 && (
                        <div className="mt-2.5 flex flex-wrap items-center gap-1.5 pt-1">
                          <span className="text-[10.5px] font-medium text-slate-400 mr-1">
                            Prerequisites to finish first:
                          </span>
                          {prereqSkills.map((pr, prIdx) => (
                            <button
                              key={`roadmap_prereq_${node.skill_id}_${pr.id}_${prIdx}`}
                              onClick={() => setSelectedSkillId(pr.id)}
                              className="inline-flex items-center gap-1 rounded-lg border dark:border-white/5 border-slate-200 dark:bg-white/[0.04] bg-slate-100 px-2 py-0.5 text-[10.5px] dark:text-slate-300 text-slate-700 hover:border-brand-500/40 transition-all"
                            >
                              {pr.isMastered ? (
                                <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                              ) : (
                                <Lock className="h-3 w-3 text-slate-400" />
                              )}
                              <span className="truncate max-w-[120px]">{pr.name}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Progress & Action Buttons */}
                  <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-3 shrink-0 border-t md:border-t-0 dark:border-white/5 border-slate-200 pt-3 md:pt-0">
                    
                    {/* Skill Level % */}
                    <div className="text-left md:text-right">
                      <div className="flex items-center gap-2 md:justify-end">
                        <span className="text-[11px] dark:text-slate-400 text-slate-500">Skill Level</span>
                        <strong className={`font-mono text-xs font-bold ${isMastered ? 'text-emerald-400' : 'text-brand-500'}`}>
                          {Math.round(masteryProb * 100)}%
                        </strong>
                      </div>
                      <div className="mt-1 h-1.5 w-28 overflow-hidden rounded-full dark:bg-surface-50 bg-slate-200">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            isMastered ? 'bg-emerald-500' : 'bg-brand-600'
                          }`}
                          style={{ width: `${Math.round(masteryProb * 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleInspectGraph(node.skill_id)}
                        title="View in Learning Map"
                        className="flex h-9 w-9 items-center justify-center rounded-xl border dark:border-white/10 border-slate-200 dark:bg-surface-50 bg-slate-100 hover:border-brand-500/40 dark:text-slate-300 text-slate-700 transition-all btn-tactile"
                      >
                        <Compass className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => openAssessment(node.skill_id)}
                        className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all shadow-sm btn-tactile ${
                          isMastered
                            ? 'border dark:border-white/10 border-slate-200 dark:bg-surface-50 bg-white hover:border-brand-500/40 text-slate-700 dark:text-slate-200'
                            : isRemedial
                            ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-500/20'
                            : 'bg-brand-600 hover:bg-brand-500 text-white shadow-brand-500/20'
                        }`}
                      >
                        <Play className="h-3.5 w-3.5 fill-current" />
                        <span>{isMastered ? 'Retake Quiz' : isRemedial ? 'Start Practice' : 'Start Chapter'}</span>
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
