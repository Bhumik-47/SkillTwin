"""
Typed Integration Interface for Multi-Factor Resource Scoring
Delegates to /ml/scoring.py if implemented, with structured feature calculation fallback.
"""
from dataclasses import dataclass
from typing import Optional, List, Dict, Any
import logging

logger = logging.getLogger("skilltwin.integrations.scoring")

try:
    import ml.scoring as ml_scoring
    HAS_ML_SCORING = True
except ImportError:
    ml_scoring = None
    HAS_ML_SCORING = False


@dataclass
class ScoredResource:
    resource_id: str
    skill_id: str
    skill_gap: float
    prerequisite_readiness: float
    preference_match: float
    predicted_gain: float
    resource_quality: float
    goal_relevance: float
    redundancy: float
    final_score: float


class ScoringIntegrationClient:
    """
    Evaluates candidate learning resources using a multi-factor scoring model.
    """
    STYLE_AFFINITY_MAP = {
        "hands_on": {"coding_exercise": 1.0, "project": 0.95, "quiz": 0.85, "video": 0.6, "article": 0.5},
        "video": {"video": 1.0, "quiz": 0.8, "coding_exercise": 0.7, "article": 0.6, "project": 0.5},
        "reading": {"article": 1.0, "quiz": 0.85, "coding_exercise": 0.75, "video": 0.5, "project": 0.6},
        "mixed": {"coding_exercise": 0.9, "video": 0.9, "quiz": 0.9, "article": 0.9, "project": 0.9}
    }

    @classmethod
    def score_resource(
        cls,
        resource_id: str,
        skill_id: str,
        resource_type: str,
        current_mastery: float,
        prerequisite_readiness: float,
        preferred_style: str = "hands_on",
        goal_relevance: float = 1.0,
        completed_resource_ids: Optional[List[str]] = None
    ) -> ScoredResource:
        """
        Compute multi-factor score for a resource.
        """
        if HAS_ML_SCORING and hasattr(ml_scoring, "score_resource"):
            try:
                res_dict = ml_scoring.score_resource(
                    resource_id=resource_id,
                    skill_id=skill_id,
                    resource_type=resource_type,
                    current_mastery=current_mastery,
                    prerequisite_readiness=prerequisite_readiness,
                    preferred_style=preferred_style,
                    goal_relevance=goal_relevance
                )
                return ScoredResource(**res_dict)
            except Exception as e:
                logger.warning(f"ml.scoring invocation failed: {e}. Falling back to standard multi-factor scoring.")

        skill_gap = max(0.0, 1.0 - current_mastery)
        affinity_subtable = cls.STYLE_AFFINITY_MAP.get(preferred_style, cls.STYLE_AFFINITY_MAP["hands_on"])
        preference_match = affinity_subtable.get(resource_type, 0.75)
        resource_quality = 0.90
        
        # Redundancy penalty if completed previously
        is_completed = completed_resource_ids and resource_id in completed_resource_ids
        redundancy = 0.80 if is_completed else 0.0

        # Predicted gain is higher when skill gap is high and prerequisites are satisfied
        predicted_gain = round(skill_gap * (0.5 + 0.5 * prerequisite_readiness), 4)

        # Weighted combination formula
        final_score = (
            (0.30 * skill_gap) +
            (0.25 * prerequisite_readiness) +
            (0.20 * preference_match) +
            (0.15 * goal_relevance) +
            (0.10 * resource_quality) -
            (0.40 * redundancy)
        )
        final_score = round(max(0.01, min(1.0, final_score)), 4)

        return ScoredResource(
            resource_id=resource_id,
            skill_id=skill_id,
            skill_gap=round(skill_gap, 4),
            prerequisite_readiness=round(prerequisite_readiness, 4),
            preference_match=round(preference_match, 4),
            predicted_gain=predicted_gain,
            resource_quality=resource_quality,
            goal_relevance=round(goal_relevance, 4),
            redundancy=round(redundancy, 4),
            final_score=final_score
        )
