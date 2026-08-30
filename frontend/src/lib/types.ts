export type DomainId = 'backend_engineering' | 'python_fundamentals' | 'web_basics' | 'data_analysis';

export type LearningStyle = 'hands_on' | 'reading' | 'visual' | 'interactive';

export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';

export type NodeStatus = 'completed' | 'in_progress' | 'ready' | 'locked';

export type TabType = 'dashboard' | 'roadmap' | 'graph' | 'repair_studio' | 'profile';

export interface DomainMeta {
  id: DomainId;
  name: string;
  label: string;
  description: string;
  badge: string;
  nodeCount: number;
  color: string;
  iconName: string;
}

export interface Skill {
  id: string;
  name: string;
  domain: string;
  description: string;
  difficulty: string;
  estimated_duration_minutes: number;
  resource_ids: string[];
}

export interface SkillDependency {
  source_skill_id: string;
  target_skill_id: string;
  dependency_type: string;
  weight: number;
}

export interface LearningPathNode {
  node_id: string;
  step_order: number;
  skill_id: string;
  skill_name: string;
  recommended_resource_id?: string;
  status: NodeStatus;
  mastery_prob: number;
  prerequisite_skill_ids: string[];
  estimated_minutes: number;
  reason?: string;
  is_remedial?: boolean;
  is_inserted?: boolean;
  is_reordered?: boolean;
}

export interface LearningPath {
  id: string;
  user_id: string;
  goal_id: string;
  version: number;
  nodes: LearningPathNode[];
  total_estimated_minutes: number;
  status: string;
  explanation?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PathRepairDiff {
  repair_id: string;
  path_id: string;
  previous_version: number;
  new_version: number;
  trigger_event: string;
  trigger_skill_id: string;
  metrics: {
    touched_node_count: number;
    unchanged_node_count: number;
    total_node_count: number;
    repair_ratio: number;
  };
  explanation: string;
  old_path: LearningPathNode[];
  new_path: LearningPathNode[];
  inserted_nodes: LearningPathNode[];
  unchanged_nodes?: LearningPathNode[];
  removed_nodes: LearningPathNode[];
  reordered_nodes: Array<{ node_id: string; old_step_order: number; new_step_order: number }>;
}

export interface LearnerProfile {
  user_id?: string;
  full_name?: string;
  target_role: string;
  weekly_hours_budget: number;
  preferred_learning_style: LearningStyle;
  prior_experience_level: ExperienceLevel;
  interests?: string[];
}

export interface Recommendation {
  id: string;
  skill_id: string;
  skill_name: string;
  action: 'learn' | 'reinforce' | 'assess' | 'skip';
  rationale: string;
  reason?: string;
  score: number;
  factors?: Record<string, number>;
}

export interface SkillProgressSnapshot {
  date: string;
  mastery_pct: number;
  skills_completed: number;
}

export interface DetectedSkillItem {
  skill_id: string;
  skill_name: string;
  estimated_mastery: number;
  confidence: number;
  source: 'resume' | 'github' | 'self_report' | 'verified';
  evidence_snippet?: string;
}

export interface AssessmentQuestion {
  id: string;
  skill_id: string;
  stage?: 1 | 2 | 3 | 4;
  difficulty?: 'foundational' | 'basic' | 'intermediate' | 'advanced';
  tier?: 'remedial_1' | 'remedial_2' | 'standard' | 'challenge';
  concept_primer?: string;
  hint?: string;
  prompt?: string;
  question?: string;
  options: Array<{
    id: string;
    text: string;
    is_correct?: boolean;
    explanation?: string;
  }>;
  explanation?: string;
}
