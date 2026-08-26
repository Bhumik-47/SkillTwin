"""
Multi-Factor Resource & Candidate Skill Ranking Engine
Implements mathematically grounded recommendation ranking with inspectable scoring terms.
"""
from dataclasses import dataclass, field, asdict
from typing import List, Dict, Any, Optional, Tuple, Literal
import numpy as np


@dataclass
class ScoringWeights:
    """
    Tunable weights for multi-factor resource ranking.
    Formula:
      Score = w1*skill_gap + w2*prereq_readiness + w3*preference_match
            + w4*predicted_gain + w5*resource_quality + w6*goal_relevance
            - w7*redundancy
    """
    w_skill_gap: float = 0.25          # w1: Distance to mastery (1.0 - P(L))
    w_prereq_readiness: float = 0.20   # w2: Prerequisites readiness [0.0, 1.0]
    w_preference_match: float = 0.15   # w3: Learning style / modality alignment
    w_predicted_gain: float = 0.15     # w4: Expected delta mastery (1 - P(L)) * P(T)
    w_resource_quality: float = 0.10   # w5: Curated baseline quality & duration fit
    w_goal_relevance: float = 0.15     # w6: Direct relevance to learner's active target goal
    w_redundancy: float = 0.10         # w7: Penalty for excessive repeated exposures

    def normalize(self) -> "ScoringWeights":
        """Ensure positive weights normalize to 1.0 before redundancy penalty."""
        pos_sum = (
            self.w_skill_gap + self.w_prereq_readiness + self.w_preference_match +
            self.w_predicted_gain + self.w_resource_quality + self.w_goal_relevance
        )
        if pos_sum > 0:
            return ScoringWeights(
                w_skill_gap=self.w_skill_gap / pos_sum,
                w_prereq_readiness=self.w_prereq_readiness / pos_sum,
                w_preference_match=self.w_preference_match / pos_sum,
                w_predicted_gain=self.w_predicted_gain / pos_sum,
                w_resource_quality=self.w_resource_quality / pos_sum,
                w_goal_relevance=self.w_goal_relevance / pos_sum,
                w_redundancy=self.w_redundancy
            )
        return self


@dataclass
class CandidateSkillContext:
    """Cognitive and graph context for a candidate skill."""
    skill_id: str
    current_mastery_prob: float  # P(L)
    prereq_readiness: float      # Fraction of prerequisites mastered in DAG [0.0, 1.0]
    is_in_goal: bool             # Is skill directly in learner's target goals?
    goal_relevance: float        # Relevance score [0.0, 1.0]
    prior_attempt_count: int = 0
    p_transit: float = 0.15      # BKT P(T) for predicted gain


@dataclass
class CandidateResourceContext:
    """Metadata for a learning resource or assessment item."""
    resource_id: str
    skill_id: str
    resource_type: str           # quiz, coding_exercise, video, article, project
    difficulty: str              # beginner, intermediate, advanced
    duration_minutes: int = 30
    quality_score: float = 0.85  # Curated content baseline [0.0, 1.0]


@dataclass
class ScoringBreakdown:
    """Inspectable components of the calculated ranking score."""
    total_score: float
    skill_gap_term: float
    prereq_term: float
    preference_term: float
    gain_term: float
    quality_term: float
    goal_term: float
    redundancy_penalty: float
    metadata: Dict[str, Any] = field(default_factory=dict)

    def to_grounding_dict(self) -> Dict[str, Any]:
        """Format for LLM agent grounding metadata (zero-hallucination policy)."""
        return {
            "total_score": round(self.total_score, 4),
            "skill_gap_score": round(self.skill_gap_term, 4),
            "prereq_readiness_score": round(self.prereq_term, 4),
            "preference_match_score": round(self.preference_term, 4),
            "predicted_gain_score": round(self.gain_term, 4),
            "goal_relevance_score": round(self.goal_term, 4),
            "redundancy_penalty": round(self.redundancy_penalty, 4)
        }


class ResourceScorer:
    """
    Calculates multi-objective scores for candidate (skill, resource) pairs.
    """
    def __init__(self, weights: Optional[ScoringWeights] = None):
        self.weights = (weights or ScoringWeights()).normalize()

    def compute_preference_match(
        self,
        preferred_style: str,
        resource_type: str,
        prior_level: str,
        resource_difficulty: str
    ) -> float:
        """
        Calculates compatibility between learner style and resource modality/difficulty.
        """
        # Style compatibility matrix
        style_affinity = {
            "hands_on": {"coding_exercise": 1.0, "project": 0.95, "quiz": 0.75, "video": 0.40, "article": 0.35},
            "video": {"video": 1.0, "coding_exercise": 0.65, "quiz": 0.70, "project": 0.60, "article": 0.40},
            "reading": {"article": 1.0, "quiz": 0.80, "coding_exercise": 0.70, "project": 0.60, "video": 0.40},
            "mixed": {"coding_exercise": 0.90, "quiz": 0.90, "project": 0.90, "video": 0.85, "article": 0.85}
        }
        
        affinities = style_affinity.get(preferred_style.lower(), style_affinity["mixed"])
        style_score = affinities.get(resource_type.lower(), 0.60)

        # Difficulty alignment bonus
        level_order = {"beginner": 1, "intermediate": 2, "advanced": 3}
        l_num = level_order.get(prior_level.lower(), 1)
        r_num = level_order.get(resource_difficulty.lower(), 2)
        diff_penalty = abs(l_num - r_num) * 0.15

        match_score = max(0.0, style_score - diff_penalty)
        return float(np.clip(match_score, 0.0, 1.0))

    def score(
        self,
        skill: CandidateSkillContext,
        resource: CandidateResourceContext,
        preferred_learning_style: str = "hands_on",
        prior_experience_level: str = "beginner",
        recent_exposures_count: int = 0
    ) -> Tuple[float, ScoringBreakdown]:
        """
        Computes the unified recommendation score and transparent breakdown.
        """
        # 1. Skill Gap (higher when unmastered, drops when mastered)
        skill_gap = max(0.0, 1.0 - skill.current_mastery_prob)

        # 2. Prerequisite Readiness (strict DAG gating)
        prereq_readiness = float(np.clip(skill.prereq_readiness, 0.0, 1.0))

        # 3. Preference Match
        pref_match = self.compute_preference_match(
            preferred_style=preferred_learning_style,
            resource_type=resource.resource_type,
            prior_level=prior_experience_level,
            resource_difficulty=resource.difficulty
        )

        # 4. Predicted Gain: (1 - P(L)) * P(T)
        predicted_gain = skill_gap * skill.p_transit

        # 5. Resource Quality
        res_quality = float(np.clip(resource.quality_score, 0.0, 1.0))

        # 6. Goal Relevance
        goal_rel = float(np.clip(skill.goal_relevance if skill.is_in_goal else skill.goal_relevance * 0.5, 0.0, 1.0))

        # 7. Redundancy Penalty (diminishing returns on repeated exposure)
        redundancy_penalty = min(1.0, recent_exposures_count * 0.25)

        # Calculate weighted terms
        t_gap = self.weights.w_skill_gap * skill_gap
        t_prereq = self.weights.w_prereq_readiness * prereq_readiness
        t_pref = self.weights.w_preference_match * pref_match
        t_gain = self.weights.w_predicted_gain * predicted_gain
        t_qual = self.weights.w_resource_quality * res_quality
        t_goal = self.weights.w_goal_relevance * goal_rel
        t_red = self.weights.w_redundancy * redundancy_penalty

        raw_score = t_gap + t_prereq + t_pref + t_gain + t_qual + t_goal - t_red
        final_score = float(np.clip(raw_score, 0.0, 1.0))

        breakdown = ScoringBreakdown(
            total_score=final_score,
            skill_gap_term=t_gap,
            prereq_term=t_prereq,
            preference_term=t_pref,
            gain_term=t_gain,
            quality_term=t_qual,
            goal_term=t_goal,
            redundancy_penalty=t_red,
            metadata={
                "skill_id": skill.skill_id,
                "resource_id": resource.resource_id,
                "mastery_prob": skill.current_mastery_prob,
                "prereq_readiness": prereq_readiness,
                "preference_match": pref_match
            }
        )

        return final_score, breakdown

    def rank_candidates(
        self,
        candidates: List[Tuple[CandidateSkillContext, CandidateResourceContext]],
        preferred_learning_style: str = "hands_on",
        prior_experience_level: str = "beginner",
        exposure_counts: Optional[Dict[str, int]] = None
    ) -> List[Tuple[float, CandidateSkillContext, CandidateResourceContext, ScoringBreakdown]]:
        """
        Ranks candidate pairs in descending order of recommendation score.
        """
        exposures = exposure_counts or {}
        scored_list = []

        for skill, resource in candidates:
            exp_count = exposures.get(resource.resource_id, 0)
            score_val, breakdown = self.score(
                skill=skill,
                resource=resource,
                preferred_learning_style=preferred_learning_style,
                prior_experience_level=prior_experience_level,
                recent_exposures_count=exp_count
            )
            scored_list.append((score_val, skill, resource, breakdown))

        # Sort descending by score
        scored_list.sort(key=lambda x: x[0], reverse=True)
        return scored_list
