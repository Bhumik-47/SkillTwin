import { Skill, SkillDependency, NodeStatus } from '../types';

export interface ToposortResult {
  sorted: string[];
  levels: Map<string, number>;
  isAcyclic: boolean;
  [Symbol.iterator](): IterableIterator<string>;
}

export function validateAndToposort(skills: Skill[], dependencies: SkillDependency[]): ToposortResult {
  const skillIds = new Set(skills.map(s => s.id));
  const inDegree = new Map<string, number>();
  const adj = new Map<string, string[]>();
  const prereqsOf = new Map<string, string[]>();

  skills.forEach(s => {
    inDegree.set(s.id, 0);
    adj.set(s.id, []);
    prereqsOf.set(s.id, []);
  });

  dependencies.forEach(dep => {
    if (skillIds.has(dep.source_skill_id) && skillIds.has(dep.target_skill_id)) {
      adj.get(dep.source_skill_id)!.push(dep.target_skill_id);
      prereqsOf.get(dep.target_skill_id)!.push(dep.source_skill_id);
      inDegree.set(dep.target_skill_id, (inDegree.get(dep.target_skill_id) || 0) + 1);
    }
  });

  const queue: string[] = [];
  const levels = new Map<string, number>();

  inDegree.forEach((deg, id) => {
    if (deg === 0) {
      queue.push(id);
      levels.set(id, 0);
    }
  });

  const sorted: string[] = [];
  while (queue.length > 0) {
    const curr = queue.shift()!;
    sorted.push(curr);
    const currLevel = levels.get(curr) || 0;

    for (const nbr of adj.get(curr) || []) {
      const nextLevel = Math.max(levels.get(nbr) || 0, currLevel + 1);
      levels.set(nbr, nextLevel);

      const newDeg = (inDegree.get(nbr) || 1) - 1;
      inDegree.set(nbr, newDeg);
      if (newDeg === 0) {
        queue.push(nbr);
      }
    }
  }

  const isAcyclic = sorted.length === skills.length;
  const finalSorted = isAcyclic ? sorted : skills.map(s => s.id);

  if (!isAcyclic) {
    skills.forEach((s, idx) => {
      if (!levels.has(s.id)) levels.set(s.id, Math.floor(idx / 3));
    });
  }

  return {
    sorted: finalSorted,
    levels,
    isAcyclic,
    [Symbol.iterator]: function* () {
      yield* finalSorted;
    }
  };
}

export function evaluateNodeStatus(
  skillId: string,
  masteryProb: number,
  prereqSkillIds: string[],
  masteryMap: any,
  threshold = 0.80
): NodeStatus {
  if (masteryProb >= threshold) {
    return 'completed';
  }

  const getMastery = (id: string): number => {
    if (!masteryMap) return 0.10;
    if (typeof masteryMap.get === 'function') {
      return masteryMap.get(id) ?? 0.10;
    }
    return masteryMap[id] ?? 0.10;
  };

  const allPrereqsMet = prereqSkillIds.every(
    prereqId => getMastery(prereqId) >= threshold
  );

  if (!allPrereqsMet) {
    return 'locked';
  }

  if (masteryProb > 0.15) {
    return 'in_progress';
  }

  return 'ready';
}
