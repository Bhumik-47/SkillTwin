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
  Compass
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
    setActiveTab
  } = useSkillTwin();

  const [searchFilter, setSearchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const nodes = currentPath?.nodes || [];

  // Identify active node: first node that is not mastered
  const activeNode = useMemo(() => {
    if (nodes.length === 0) return null;
    return nodes.find(n => {
      const prob = masteryMap.get(n.skill_id) ?? (n.mastery_prob ?? 0.10);
      return prob < 0.80;
    }) || nodes[0];
  }, [nodes, masteryMap]);

  // Filter nodes
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

  // Overall path metrics
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

      {/* Roadmap Controls: Search & Simple Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border dark:border-white/10 border-slate-200 dark:bg-[#090f1b] bg-white p-4 shadow-sm">
        
        {/* Left Metrics */}
        <div className="flex items-center gap-3 text-xs">
          <span className="font-bold dark:text-white text-slate-900">
            Course Roadmap:
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

          // Direct prerequisites for this card
          const prereqDeps = dependencies.filter(d => d.target_skill_id === node.skill_id);
          const prereqSkills = prereqDeps.map(d => {
            const s = skills.find(sk => sk.id === d.source_skill_id);
            const m = masteryMap.get(d.source_skill_id) ?? 0.10;
            return { id: d.source_skill_id, name: s?.name || d.source_skill_id, mastery: m, isMastered: m >= 0.80 };
          });

          return (
            <div
              key={node.node_id || `${node.skill_id}_${index}`}
              className={`rounded-2xl border transition-all p-5 ${
                isRemedial
                  ? 'border-rose-500/40 dark:bg-rose-950/15 bg-rose-50/50'
                  : isActive
                  ? 'border-brand-500/60 dark:bg-brand-950/20 bg-indigo-50/50 ring-1 ring-brand-500/30'
                  : isMastered
                  ? 'dark:border-white/5 border-slate-200 dark:bg-[#090f1b]/70 bg-white'
                  : 'dark:border-white/5 border-slate-200 dark:bg-[#060a14]/50 bg-slate-50/50'
              }`}
            >
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                
                {/* Step Marker & Title */}
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  
                  {/* Step Order Badge */}
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border text-xs font-bold font-mono ${
                    isRemedial
                      ? 'border-rose-500/50 bg-rose-500/20 text-rose-400'
                      : isMastered
                      ? 'border-emerald-500/50 bg-emerald-500/20 text-emerald-400'
                      : isActive
                      ? 'border-brand-500 bg-brand-600 text-white'
                      : 'dark:border-white/10 border-slate-300 dark:bg-surface-50 bg-slate-200 dark:text-slate-400 text-slate-600'
                  }`}>
                    {isMastered ? <CheckCircle2 className="h-5 w-5" /> : node.step_order}
                  </div>

                  {/* Metadata & Headline */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold text-slate-400">
                        Chapter {node.step_order}
                      </span>

                      {isRemedial && (
                        <span className="rounded-md bg-rose-500/20 px-2 py-0.5 text-[10px] font-bold text-rose-400 border border-rose-500/40">
                          Extra Practice Added
                        </span>
                      )}

                      {isActive && !isRemedial && (
                        <span className="rounded-md bg-brand-500/20 px-2 py-0.5 text-[10px] font-bold text-brand-600 dark:text-brand-300 border border-brand-500/40">
                          Current Chapter
                        </span>
                      )}

                      <span className="text-xs dark:text-slate-400 text-slate-500">
                        ⏱️ ~{node.estimated_minutes || 45} mins
                      </span>
                    </div>

                    <h3 className="mt-1 text-base font-bold dark:text-white text-slate-900 truncate">
                      {node.skill_name || skill?.name || node.skill_id}
                    </h3>

                    <p className="mt-1 text-xs dark:text-slate-300 text-slate-600 line-clamp-2 leading-relaxed">
                      {skill?.description || 'Learn and practice key concepts to progress toward your goals.'}
                    </p>

                    {/* Required Earlier Topics */}
                    {prereqSkills.length > 0 && (
                      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                        <span className="text-[10.5px] font-medium text-slate-400 mr-1">
                          You&apos;ll need to finish first:
                        </span>
                        {prereqSkills.map(pr => (
                          <button
                            key={pr.id}
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
                      className="flex h-8.5 w-8.5 items-center justify-center rounded-xl border dark:border-white/10 border-slate-200 dark:bg-surface-50 bg-slate-100 hover:border-brand-500/40 dark:text-slate-300 text-slate-700 transition-all btn-tactile"
                    >
                      <Compass className="h-4 w-4" />
                    </button>

                    <button
                      onClick={() => openAssessment(node.skill_id)}
                      className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all btn-tactile ${
                        isActive
                          ? 'bg-brand-600 text-white shadow-sm'
                          : isMastered
                          ? 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20'
                          : 'border dark:border-white/10 border-slate-300 dark:bg-surface-50 bg-slate-100 dark:text-slate-200 text-slate-800 hover:border-brand-500/40'
                      }`}
                    >
                      <Zap className="h-3.5 w-3.5" />
                      <span>{isMastered ? 'Retake Quiz' : 'Practice'}</span>
                    </button>
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
