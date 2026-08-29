'use client';

import React, { useState, useRef, useMemo } from 'react';
import { useSkillTwin } from '../../lib/state/store';
import { Skill, NodeStatus } from '../../lib/types';
import { validateAndToposort, evaluateNodeStatus } from '../../lib/engine/planner';
import SkillNodeCard from './SkillNodeCard';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Search,
  CheckCircle2,
  Lock,
  Zap,
  Play
} from 'lucide-react';

export default function DAGCanvas() {
  const {
    skills,
    dependencies,
    masteryMap,
    selectedSkillId,
    setSelectedSkillId
  } = useSkillTwin();

  const [zoom, setZoom] = useState<number>(0.85);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 50, y: 30 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | NodeStatus>('all');

  const containerRef = useRef<HTMLDivElement>(null);

  // Compute topological hierarchy layers
  const { levels } = useMemo(() => {
    return validateAndToposort(skills, dependencies);
  }, [skills, dependencies]);

  // Layout node coordinates (hierarchical Sugiyama-style rank grid)
  const { nodePositions, totalWidth, totalHeight } = useMemo(() => {
    const NODE_WIDTH = 220;
    const NODE_HEIGHT = 160;
    const HORIZONTAL_GAP = 100;
    const VERTICAL_GAP = 40;

    // Group nodes by level
    const levelGroups = new Map<number, Skill[]>();
    skills.forEach(skill => {
      const lvl = levels.get(skill.id) || 0;
      if (!levelGroups.has(lvl)) levelGroups.set(lvl, []);
      levelGroups.get(lvl)!.push(skill);
    });

    const positions = new Map<string, { x: number; y: number; width: number; height: number; level: number }>();

    let maxLevel = 0;
    let maxGroupSize = 0;

    levelGroups.forEach((group, lvl) => {
      maxLevel = Math.max(maxLevel, lvl);
      maxGroupSize = Math.max(maxGroupSize, group.length);

      group.forEach((skill, indexInGroup) => {
        const x = lvl * (NODE_WIDTH + HORIZONTAL_GAP) + 60;
        const y = indexInGroup * (NODE_HEIGHT + VERTICAL_GAP) + 60;
        positions.set(skill.id, {
          x,
          y,
          width: NODE_WIDTH,
          height: NODE_HEIGHT,
          level: lvl,
        });
      });
    });

    const calcWidth = (maxLevel + 1) * (NODE_WIDTH + HORIZONTAL_GAP) + 200;
    const calcHeight = maxGroupSize * (NODE_HEIGHT + VERTICAL_GAP) + 200;

    return {
      nodePositions: positions,
      totalWidth: Math.max(1400, calcWidth),
      totalHeight: Math.max(800, calcHeight),
    };
  }, [skills, levels]);

  // Build edge connector paths
  const edgePaths = useMemo(() => {
    return dependencies.map(dep => {
      const srcPos = nodePositions.get(dep.source_skill_id);
      const tgtPos = nodePositions.get(dep.target_skill_id);
      if (!srcPos || !tgtPos) return null;

      const startX = srcPos.x + srcPos.width;
      const startY = srcPos.y + srcPos.height / 2;
      const endX = tgtPos.x;
      const endY = tgtPos.y + tgtPos.height / 2;

      // Cubic Bezier curve
      const dx = endX - startX;
      const controlX1 = startX + Math.max(40, dx * 0.45);
      const controlY1 = startY;
      const controlX2 = endX - Math.max(40, dx * 0.45);
      const controlY2 = endY;

      const pathData = `M ${startX} ${startY} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${endX} ${endY}`;

      const isRelatedToSelected =
        selectedSkillId === dep.source_skill_id || selectedSkillId === dep.target_skill_id;

      return {
        id: `${dep.source_skill_id}->${dep.target_skill_id}`,
        source: dep.source_skill_id,
        target: dep.target_skill_id,
        pathData,
        dependencyType: dep.dependency_type,
        isRelatedToSelected,
      };
    }).filter(Boolean);
  }, [dependencies, nodePositions, selectedSkillId]);

  // Mouse pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.group')) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Zoom handlers
  const handleZoomIn = () => setZoom(z => Math.min(1.4, z + 0.15));
  const handleZoomOut = () => setZoom(z => Math.max(0.4, z - 0.15));
  const handleResetFit = () => {
    setZoom(0.85);
    setPan({ x: 50, y: 30 });
  };

  // Filter skills
  const filteredSkills = useMemo(() => {
    return skills.filter(skill => {
      const matchesSearch =
        skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        skill.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        skill.id.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (statusFilter === 'all') return true;

      const mProb = masteryMap.get(skill.id) ?? 0.10;
      const directPrereqs = dependencies
        .filter(d => d.target_skill_id === skill.id)
        .map(d => d.source_skill_id);
      const status = evaluateNodeStatus(skill.id, mProb, directPrereqs, masteryMap, 0.80);

      return status === statusFilter;
    });
  }, [skills, searchQuery, statusFilter, masteryMap, dependencies]);

  return (
    <div className="relative h-[calc(100vh-140px)] w-full overflow-hidden rounded-3xl border dark:border-white/10 border-slate-300 dark:bg-[#070b12] bg-slate-100 shadow-sm transition-colors">
      
      {/* Background Subtle Grid Pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03] dark:opacity-[0.07]"
        style={{
          backgroundImage: `radial-gradient(#6366f1 1px, transparent 1px)`,
          backgroundSize: '24px 24px'
        }}
      />

      {/* Control Bar: Search & Status Filters */}
      <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 dark:text-slate-400 text-slate-500" />
          <input
            type="text"
            placeholder="Search topics..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="h-9 w-60 rounded-xl border dark:border-white/10 border-slate-300 dark:bg-[#090f1b] bg-white pl-9 pr-3 text-xs dark:text-white text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:outline-none shadow-sm transition-all"
          />
        </div>

        {/* Status Filter */}
        <div className="flex rounded-xl dark:bg-[#090f1b] bg-white border dark:border-white/10 border-slate-300 p-0.5 text-xs shadow-sm">
          {(['all', 'completed', 'in_progress', 'ready', 'locked'] as const).map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold capitalize transition-all ${
                statusFilter === st
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'dark:text-slate-400 text-slate-600 hover:dark:text-white hover:text-slate-900'
              }`}
            >
              {st === 'all' ? 'All Topics' : st === 'completed' ? 'Mastered' : st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Floating Canvas Zoom/Pan Controls */}
      <div className="absolute bottom-6 right-6 z-20 flex flex-col gap-1 rounded-2xl border dark:border-white/10 border-slate-300 dark:bg-[#090f1b] bg-white p-1.5 shadow-xl">
        <button
          onClick={handleZoomIn}
          title="Zoom In"
          className="flex h-8 w-8 items-center justify-center rounded-xl dark:text-slate-300 text-slate-700 hover:dark:bg-white/10 hover:bg-slate-100 transition-all active:scale-[0.95]"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
        <button
          onClick={handleZoomOut}
          title="Zoom Out"
          className="flex h-8 w-8 items-center justify-center rounded-xl dark:text-slate-300 text-slate-700 hover:dark:bg-white/10 hover:bg-slate-100 transition-all active:scale-[0.95]"
        >
          <ZoomOut className="h-4 w-4" />
        </button>
        <button
          onClick={handleResetFit}
          title="Reset View"
          className="flex h-8 w-8 items-center justify-center rounded-xl dark:text-slate-300 text-slate-700 hover:dark:bg-white/10 hover:bg-slate-100 transition-all active:scale-[0.95]"
        >
          <Maximize2 className="h-4 w-4" />
        </button>
      </div>

      {/* Legend Badge */}
      <div className="absolute bottom-6 left-6 z-20 hidden md:flex items-center gap-3.5 rounded-2xl border dark:border-white/10 border-slate-300 dark:bg-[#090f1b] bg-white px-4 py-2 text-[11px] font-medium dark:text-slate-300 text-slate-700 shadow-md">
        <span className="flex items-center gap-1.5 text-emerald-500">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          Mastered (≥ 80%)
        </span>
        <span className="flex items-center gap-1.5 text-amber-500">
          <span className="h-2 w-2 rounded-full bg-amber-400" />
          In Progress
        </span>
        <span className="flex items-center gap-1.5 text-cyan-500">
          <span className="h-2 w-2 rounded-full bg-cyan-400" />
          Ready Next
        </span>
        <span className="flex items-center gap-1.5 dark:text-slate-400 text-slate-500">
          <span className="h-2 w-2 rounded-full bg-slate-400" />
          Locked
        </span>
      </div>

      {/* Main Graph Canvas (SVG + HTML overlay) */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className={`h-full w-full select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
      >
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
            width: `${totalWidth}px`,
            height: `${totalHeight}px`,
            transition: isDragging ? 'none' : 'transform 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
          className="relative"
        >
          {/* SVG Arrow Connectors */}
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
            style={{ width: totalWidth, height: totalHeight }}
          >
            <defs>
              <marker
                id="arrow-cyan"
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#06b6d4" />
              </marker>
              <marker
                id="arrow-violet"
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#8b5cf6" />
              </marker>
              <marker
                id="arrow-slate"
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#94a3b8" />
              </marker>
            </defs>

            {edgePaths.map(edge => {
              if (!edge) return null;
              const isSelected = edge.isRelatedToSelected;
              let strokeColor = '#64748b';
              let marker = 'url(#arrow-slate)';
              let strokeDasharray = 'none';

              if (edge.dependencyType === 'hard_prerequisite') {
                strokeColor = isSelected ? '#38bdf8' : '#0369a1';
                marker = 'url(#arrow-cyan)';
              } else if (edge.dependencyType === 'soft_prerequisite') {
                strokeColor = isSelected ? '#c084fc' : '#7e22ce';
                marker = 'url(#arrow-violet)';
                strokeDasharray = '4 4';
              } else {
                strokeDasharray = '2 4';
              }

              return (
                <path
                  key={edge.id}
                  d={edge.pathData}
                  fill="none"
                  stroke={isSelected ? '#38bdf8' : strokeColor}
                  strokeWidth={isSelected ? 2.5 : 1.5}
                  strokeDasharray={strokeDasharray}
                  markerEnd={marker}
                />
              );
            })}
          </svg>

          {/* Node Cards */}
          {skills.map(skill => {
            const pos = nodePositions.get(skill.id);
            if (!pos) return null;

            const isMatch = filteredSkills.some(s => s.id === skill.id);
            if (!isMatch) return null;

            const mProb = masteryMap.get(skill.id) ?? 0.10;
            const directPrereqs = dependencies
              .filter(d => d.target_skill_id === skill.id)
              .map(d => d.source_skill_id);
            const status = evaluateNodeStatus(skill.id, mProb, directPrereqs, masteryMap, 0.80);

            return (
              <div
                key={skill.id}
                style={{
                  position: 'absolute',
                  left: `${pos.x}px`,
                  top: `${pos.y}px`,
                  width: `${pos.width}px`,
                  height: `${pos.height}px`,
                }}
              >
                <SkillNodeCard
                  skill={skill}
                  masteryProb={mProb}
                  status={status}
                  isSelected={selectedSkillId === skill.id}
                  onClick={() => setSelectedSkillId(selectedSkillId === skill.id ? null : skill.id)}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
