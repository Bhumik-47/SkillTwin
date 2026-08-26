"""
Typed Integration Interface for AI Grounded Explanation Agents
Delegates to backend/agents/explainer.py if present, with strict zero-hallucination templates.
"""
from typing import Optional, Dict, Any, List
import logging

logger = logging.getLogger("skilltwin.integrations.agent")

try:
    import backend.agents.explainer as explainer_module
    HAS_EXPLAINER_AGENT = True
except ImportError:
    explainer_module = None
    HAS_EXPLAINER_AGENT = False


class AgentIntegrationClient:
    """
    Interface for generating pedagogically grounded explanations for path planning,
    path adaptations, and next-step recommendations.
    """

    @classmethod
    def generate_path_explanation(
        cls,
        goal_title: str,
        target_skills: List[str],
        total_nodes: int,
        mastered_skills: List[str]
    ) -> str:
        """Generate explanation for initial topological path generation."""
        if HAS_EXPLAINER_AGENT and hasattr(explainer_module, "explain_initial_path"):
            try:
                return explainer_module.explain_initial_path(goal_title, target_skills, total_nodes, mastered_skills)
            except Exception as e:
                logger.warning(f"Agent explanation failed: {e}. Falling back to grounded template.")

        if mastered_skills:
            return (
                f"Generated an optimal {total_nodes}-step topological learning path for '{goal_title}'. "
                f"Completed prerequisites ({', '.join(mastered_skills)}) have been marked complete based on verified mastery."
            )
        return (
            f"Generated an optimal {total_nodes}-step topological learning path for '{goal_title}' "
            f"respecting all prerequisite dependencies."
        )

    @classmethod
    def generate_repair_explanation(
        cls,
        trigger_skill_name: str,
        trigger_event: str,
        prior_mastery: float,
        posterior_mastery: float,
        touched_node_count: int,
        inserted_count: int
    ) -> str:
        """Generate explanation for localized path repair."""
        if HAS_EXPLAINER_AGENT and hasattr(explainer_module, "explain_path_repair"):
            try:
                return explainer_module.explain_path_repair(
                    trigger_skill_name, trigger_event, prior_mastery, posterior_mastery, touched_node_count
                )
            except Exception as e:
                logger.warning(f"Agent repair explanation failed: {e}. Falling back to grounded template.")

        if trigger_event == "assessment_failed" or posterior_mastery < 0.80:
            return (
                f"Mastery for {trigger_skill_name} updated from {prior_mastery:.2f} to {posterior_mastery:.2f}. "
                f"Inserted {inserted_count} targeted remedial practice step(s) and adjusted {touched_node_count} nodes "
                f"without modifying unaffected curriculum branches."
            )
        else:
            return (
                f"Mastery for {trigger_skill_name} advanced to {posterior_mastery:.2f} (>= 0.80 threshold). "
                f"Unlocked unblocked downstream prerequisite nodes ({touched_node_count} node(s) updated)."
            )

    @classmethod
    def generate_recommendation_explanation(
        cls,
        skill_name: str,
        mastery_prob: float,
        action_type: str,
        prerequisite_names: List[str]
    ) -> str:
        """Generate explanation for next-best-action recommendations."""
        if HAS_EXPLAINER_AGENT and hasattr(explainer_module, "explain_recommendation"):
            try:
                return explainer_module.explain_recommendation(skill_name, mastery_prob, action_type, prerequisite_names)
            except Exception as e:
                logger.warning(f"Agent recommendation explanation failed: {e}. Falling back to grounded template.")

        if action_type == "reinforce":
            return (
                f"Your current mastery for {skill_name} is {mastery_prob:.2f}. "
                f"Completing this focused exercise will raise your mastery above the 0.80 threshold required for subsequent modules."
            )
        elif action_type == "learn":
            if prerequisite_names:
                prereq_str = ", ".join(prerequisite_names)
                return f"You have satisfied prerequisites ({prereq_str}). {skill_name} is your highest-priority next learning objective."
            return f"{skill_name} is ready for study and directly aligns with your target goal."
        elif action_type == "assess":
            return f"Validate your proficiency in {skill_name} (current estimate: {mastery_prob:.2f}) through an assessment checkpoint."
        else:
            return f"Review the recommended resource for {skill_name} to maintain topic mastery."
