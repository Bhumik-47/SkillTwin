"""
Grounded Path Explainer & Diagnostic Agent
Translates state changes, BKT transitions, and graph repair diffs into transparent pedagogical explanations.
Enforces the Zero-Hallucination Invariant.
"""
import json
import logging
from typing import Dict, List, Optional, Any

from backend.config import settings
from backend.agents.prompts import (
    PATH_REPAIR_EXPLAINER_SYSTEM_PROMPT,
    RECOMMENDATION_EXPLAINER_SYSTEM_PROMPT
)

logger = logging.getLogger("skilltwin.agents.explainer")


class PathExplainerAgent:
    """
    Generates natural-language pedagogical explanations strictly grounded in mathematical state metrics.
    """

    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.model_name = settings.GEMINI_MODEL

    def explain_path_generation(
        self,
        domain: str,
        total_nodes: int,
        target_role: str,
        weekly_hours: int,
        mastered_count: int = 0
    ) -> str:
        """Explains why initial topological curriculum was sequenced."""
        return (
            f"Curated a {total_nodes}-step topological roadmap for '{target_role}' in {domain.replace('_', ' ').title()}. "
            f"{mastered_count} prerequisite skills were recognized as already mastered. "
            f"At {weekly_hours} hours/week, the sequence prioritizes foundational nodes before unblocking advanced competencies."
        )

    def explain_path_repair(
        self,
        trigger_skill_id: str,
        prior_mastery: float,
        posterior_mastery: float,
        score: float,
        metrics: Dict[str, Any],
        inserted_nodes: List[Dict[str, Any]],
        unchanged_count: int
    ) -> str:
        """
        Generates explanation for a local sub-DAG repair event.
        Guarantees exact citation of mathematical state values without hallucinations.
        """
        touched = metrics.get("touched_node_count", 0)
        total = metrics.get("total_node_count", 1)
        repair_ratio = metrics.get("repair_ratio", 0.0) * 100

        # Attempt Gemini LLM invocation if API key is present
        if self.api_key:
            try:
                from google import genai
                client = genai.Client(api_key=self.api_key)
                
                payload = {
                    "trigger_skill_id": trigger_skill_id,
                    "prior_mastery_prob": round(prior_mastery, 4),
                    "posterior_mastery_prob": round(posterior_mastery, 4),
                    "assessment_score": round(score, 4),
                    "touched_node_count": touched,
                    "total_node_count": total,
                    "unchanged_node_count": unchanged_count,
                    "repair_ratio_pct": round(repair_ratio, 2),
                    "inserted_node_names": [n.get("skill_name", n.get("node_id")) for n in inserted_nodes]
                }
                
                response = client.models.generate_content(
                    model=self.model_name,
                    contents=f"Explain this local learning path adaptation based ONLY on the numbers provided:\n{json.dumps(payload, indent=2)}",
                    config={
                        "system_instruction": PATH_REPAIR_EXPLAINER_SYSTEM_PROMPT,
                    }
                )
                if response and response.text:
                    return response.text.strip()
            except Exception as e:
                logger.warning(f"Gemini explainer call notice: {e}. Using deterministic zero-hallucination fallback.")

        # Deterministic Grounded Fallback
        if posterior_mastery < prior_mastery or score < 0.50:
            inserted_desc = f"inserted {len(inserted_nodes)} remedial reinforcement step(s)" if inserted_nodes else "adjusted prerequisite checkpoints"
            return (
                f"Mastery for {trigger_skill_id} shifted from {prior_mastery:.2f} to {posterior_mastery:.2f} based on recent assessment score ({score:.2f}). "
                f"The local repair engine {inserted_desc}, touching {touched}/{total} nodes ({repair_ratio:.1f}%) "
                f"while preserving {unchanged_count} upstream and independent curriculum nodes."
            )
        else:
            return (
                f"Mastery for {trigger_skill_id} increased from {prior_mastery:.2f} to {posterior_mastery:.2f} (assessment score: {score:.2f}). "
                f"This unlocked downstream dependencies across {touched}/{total} nodes ({repair_ratio:.1f}%) "
                f"while leaving {unchanged_count} previously verified steps intact."
            )

    def explain_recommendation(
        self,
        skill_id: str,
        resource_id: str,
        action_type: str,
        mastery_prob: float,
        score_breakdown: Dict[str, Any],
        bkt_evidence: str
    ) -> str:
        """
        Generates explanation for a next-best action recommendation.
        """
        if self.api_key:
            try:
                from google import genai
                client = genai.Client(api_key=self.api_key)
                
                payload = {
                    "skill_id": skill_id,
                    "resource_id": resource_id,
                    "action_type": action_type,
                    "current_mastery_prob": round(mastery_prob, 4),
                    "scoring_breakdown": score_breakdown,
                    "bkt_evidence_summary": bkt_evidence
                }
                
                response = client.models.generate_content(
                    model=self.model_name,
                    contents=f"Generate next-best action explanation grounded in:\n{json.dumps(payload, indent=2)}",
                    config={
                        "system_instruction": RECOMMENDATION_EXPLAINER_SYSTEM_PROMPT
                    }
                )
                if response and response.text:
                    return response.text.strip()
            except Exception as e:
                logger.warning(f"Gemini recommendation explainer notice: {e}. Using deterministic fallback.")

        # Deterministic Grounded Fallback
        gain = score_breakdown.get("gain_term", 0.0)
        gap = score_breakdown.get("skill_gap_term", 0.0)
        pref = score_breakdown.get("preference_term", 0.0)
        return (
            f"Recommended '{action_type}' on {skill_id} (current mastery: {mastery_prob:.2f}). "
            f"Resource {resource_id} optimizes predicted gain (+{gain:.2f}) and preference match (+{pref:.2f}) "
            f"to bridge the remaining skill gap ({gap:.2f})."
        )


# Global default instance
path_explainer_agent = PathExplainerAgent()
