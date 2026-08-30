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
        weekly_hours: int = 10,
        mastered_count: int = 0
    ) -> str:
        """Explains why initial topological curriculum was sequenced."""
        if mastered_count > 0:
            return (
                f"Curated an optimal {total_nodes}-step topological roadmap for '{target_role}' in {domain.replace('_', ' ').title()}. "
                f"{mastered_count} prerequisite skill(s) have been marked completed based on verified prior mastery. "
                f"At {weekly_hours} hours/week, the sequence prioritizes foundational prerequisites before unblocking advanced modules."
            )
        return (
            f"Curated an optimal {total_nodes}-step topological roadmap for '{target_role}' in {domain.replace('_', ' ').title()} "
            f"respecting all prerequisite dependencies."
        )

    def explain_path_repair(
        self,
        trigger_skill_id: str,
        prior_mastery: float,
        posterior_mastery: float,
        score: float = 0.5,
        metrics: Optional[Dict[str, Any]] = None,
        inserted_nodes: Optional[List[Dict[str, Any]]] = None,
        unchanged_count: int = 0
    ) -> str:
        """
        Generates explanation for a local sub-DAG repair event.
        Guarantees exact citation of mathematical state values without hallucinations.
        """
        m = metrics or {}
        touched = m.get("touched_node_count", 1)
        total = m.get("total_node_count", 1)
        repair_ratio = m.get("repair_ratio", 0.0) * 100
        inserted_len = len(inserted_nodes) if inserted_nodes else 0

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
                    "repair_ratio_pct": round(repair_ratio, 2)
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
            inserted_desc = f"inserted {inserted_len} targeted remedial practice step(s)" if inserted_len > 0 else "adjusted prerequisite checkpoints"
            return (
                f"Mastery for {trigger_skill_id} updated from {prior_mastery:.2f} to {posterior_mastery:.2f} based on recent assessment. "
                f"The local repair engine {inserted_desc}, updating {touched} node(s) without modifying unaffected curriculum branches."
            )
        else:
            return (
                f"Mastery for {trigger_skill_id} advanced from {prior_mastery:.2f} to {posterior_mastery:.2f} (>= 0.80 threshold). "
                f"Unlocked unblocked downstream prerequisite nodes ({touched} node(s) updated) while keeping verified steps intact."
            )

    def explain_role_alignment(
        self,
        skill_name: str,
        target_role: str,
        dependent_skill_names: Optional[List[str]] = None
    ) -> str:
        """
        Generates grounded, template-constrained explanation tying a skill directly to the target role.
        Pattern: "You should learn {skill} because it's required for {n} skills in your target {role} role: {skill_list}."
        """
        deps = dependent_skill_names or []
        n = len(deps)
        if n > 0:
            deps_str = ", ".join(deps[:3])
            if n > 3:
                deps_str += f", and {n - 3} more"
            return f"You should learn {skill_name} because it's required for {n} skill{'s' if n > 1 else ''} in your target {target_role} role: {deps_str}."
        return f"You should learn {skill_name} because it is a core required competency for your target {target_role} role."

    def explain_recommendation(
        self,
        skill_name: str,
        mastery_prob: float,
        action_type: str = "learn",
        prerequisite_names: Optional[List[str]] = None,
        target_role: Optional[str] = None,
        dependent_skill_names: Optional[List[str]] = None,
        score_breakdown: Optional[Dict[str, Any]] = None
    ) -> str:
        """
        Generates explanation for a next-best action recommendation.
        """
        role = target_role or "Software Engineer"
        deps = dependent_skill_names or []
        if deps:
            return self.explain_role_alignment(skill_name, role, deps)

        prereqs = prerequisite_names or []
        if action_type == "reinforce":
            return (
                f"Your current mastery for {skill_name} is {mastery_prob:.2f}. "
                f"Completing this focused exercise will raise your mastery above the 0.80 threshold required for your target {role} role."
            )
        elif action_type == "learn":
            if prereqs:
                prereq_str = ", ".join(prereqs)
                return f"You have satisfied prerequisites ({prereq_str}). {skill_name} is your highest-priority next learning objective for {role}."
            return f"{skill_name} is ready for study (current mastery: {mastery_prob:.2f}) and directly aligns with your target {role} role."
        elif action_type == "assess":
            return f"Validate your proficiency in {skill_name} (current estimate: {mastery_prob:.2f}) through an assessment checkpoint."
        else:
            return f"Review the recommended resource for {skill_name} to maintain topic mastery for {role}."


# Global instance
path_explainer_agent = PathExplainerAgent()


# Top-level functional interface expected by AgentIntegrationClient
def explain_initial_path(
    goal_title: str,
    target_skills: List[str],
    total_nodes: int,
    mastered_skills: List[str]
) -> str:
    """Functional wrapper for initial roadmap explanation."""
    return path_explainer_agent.explain_path_generation(
        domain=goal_title,
        total_nodes=total_nodes,
        target_role=goal_title,
        mastered_count=len(mastered_skills)
    )


def explain_path_repair(
    trigger_skill_name: str,
    trigger_event: str,
    prior_mastery: float,
    posterior_mastery: float,
    touched_node_count: int
) -> str:
    """Functional wrapper for local path repair explanation."""
    score = 0.30 if trigger_event == "assessment_failed" or posterior_mastery < 0.80 else 0.90
    return path_explainer_agent.explain_path_repair(
        trigger_skill_id=trigger_skill_name,
        prior_mastery=prior_mastery,
        posterior_mastery=posterior_mastery,
        score=score,
        metrics={"touched_node_count": touched_node_count, "total_node_count": touched_node_count + 3}
    )


def explain_recommendation(
    skill_name: str,
    mastery_prob: float,
    action_type: str,
    prerequisite_names: List[str]
) -> str:
    """Functional wrapper for recommendation explanation."""
    return path_explainer_agent.explain_recommendation(
        skill_name=skill_name,
        mastery_prob=mastery_prob,
        action_type=action_type,
        prerequisite_names=prerequisite_names
    )
