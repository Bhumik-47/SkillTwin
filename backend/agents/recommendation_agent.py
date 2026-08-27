"""
Recommendation Agent
Coordinates ResourceScorer, BKTEngine, and PathExplainerAgent to curate next-best actions.
"""
from datetime import datetime, timezone
import logging
from typing import Dict, List, Optional, Any

from ml.scoring import (
    ResourceScorer,
    CandidateSkillContext,
    CandidateResourceContext,
    ScoringWeights
)
from ml.bkt import BKTEngine
from backend.planner.graph import graph_manager
from backend.agents.explainer import path_explainer_agent, PathExplainerAgent

logger = logging.getLogger("skilltwin.agents.recommendation")

# Backward-compatible aliases
MultiFactorScorer = ResourceScorer
bkt_engine = BKTEngine()


class RecommendationAgent:
    """
    Curates top-N next-best learning actions grounded in BKT state and multi-factor scoring.
    """

    def __init__(
        self,
        scorer: Optional[ResourceScorer] = None,
        explainer: Optional[PathExplainerAgent] = None,
        manager=None
    ):
        self.scorer = scorer or ResourceScorer()
        self.explainer = explainer or path_explainer_agent
        self.manager = manager or graph_manager

    def get_recommendations(
        self,
        user_id: str,
        domain: str = "backend_engineering",
        path_nodes: Optional[List[Dict[str, Any]]] = None,
        mastery_map: Optional[Dict[str, float]] = None,
        preferred_learning_style: str = "hands_on",
        prior_experience_level: str = "beginner",
        limit: int = 3
    ) -> List[Dict[str, Any]]:
        """
        Computes and ranks next-best actions for a learner.
        """
        mastery = mastery_map or {}
        nodes = path_nodes or []
        domain_data = self.manager.load_domain_data(domain)
        resources = domain_data.get("resources", [])
        res_by_skill: Dict[str, List[Dict[str, Any]]] = {}
        for r in resources:
            res_by_skill.setdefault(r["skill_id"], []).append(r)

        # 1. Gather candidate skills from active roadmap
        candidate_skills = []
        if nodes:
            for node in nodes:
                status = node.get("status", "locked")
                s_id = node.get("skill_id")
                if status in ["in_progress", "ready"] or "remedial" in node.get("node_id", ""):
                    candidate_skills.append((s_id, node))
        
        # If path is empty, gather initial foundational skills
        if not candidate_skills:
            G = self.manager.get_nx_graph(domain)
            for s in domain_data.get("skills", [])[:5]:
                candidate_skills.append((s["id"], {"skill_id": s["id"], "mastery_prob": mastery.get(s["id"], 0.10), "prerequisite_skill_ids": list(G.predecessors(s["id"]))}))

        # 2. Build candidate pairs for multi-factor ranking
        candidates = []
        for s_id, node in candidate_skills:
            cur_mastery = mastery.get(s_id, node.get("mastery_prob", 0.10))
            prereqs = node.get("prerequisite_skill_ids", [])
            mastered_prereqs = [p for p in prereqs if mastery.get(p, 0.0) >= 0.80]
            prereq_readiness = (len(mastered_prereqs) / len(prereqs)) if prereqs else 1.0

            skill_ctx = CandidateSkillContext(
                skill_id=s_id,
                current_mastery_prob=cur_mastery,
                p_transit=0.15,
                prereq_readiness=prereq_readiness,
                goal_relevance=1.0,
                is_in_goal=True
            )

            skill_resources = res_by_skill.get(s_id, [])
            if not skill_resources:
                # Synthetic fallback resource
                skill_resources = [{
                    "id": f"res_{s_id}_01",
                    "skill_id": s_id,
                    "title": f"Core Guide for {s_id}",
                    "type": "article",
                    "duration_minutes": 30,
                    "difficulty": "intermediate",
                    "quality_score": 0.85
                }]

            for r in skill_resources:
                res_ctx = CandidateResourceContext(
                    resource_id=r["id"],
                    skill_id=s_id,
                    resource_type=r.get("type", "article"),
                    difficulty=r.get("difficulty", "intermediate"),
                    duration_minutes=r.get("duration_minutes", 30),
                    quality_score=r.get("quality_score", 0.85)
                )
                candidates.append((skill_ctx, res_ctx))

        if not candidates:
            return []

        # 3. Rank candidates with ResourceScorer
        ranked = self.scorer.rank_candidates(
            candidates=candidates,
            preferred_learning_style=preferred_learning_style,
            prior_experience_level=prior_experience_level
        )

        # 4. Formulate grounded recommendation output objects
        recommendations = []
        seen_skills = set()

        for idx, (score_val, skill_ctx, res_ctx, breakdown) in enumerate(ranked):
            # Prioritize distinct skills in top recommendations
            if skill_ctx.skill_id in seen_skills and len(recommendations) < limit:
                continue
            seen_skills.add(skill_ctx.skill_id)

            # Determine action type
            m_prob = skill_ctx.current_mastery_prob
            if m_prob >= 0.80:
                action_type = "skip"
            elif m_prob >= 0.65:
                action_type = "assess"
            elif m_prob < 0.40 and "remedial" in res_ctx.resource_id:
                action_type = "reinforce"
            else:
                action_type = "learn"

            bkt_summary = f"P(L)={m_prob:.2f}, transit=0.15, slip=0.10, guess=0.20"
            
            explanation = self.explainer.explain_recommendation(
                skill_id=skill_ctx.skill_id,
                resource_id=res_ctx.resource_id,
                action_type=action_type,
                mastery_prob=m_prob,
                score_breakdown={
                    "total_score": round(score_val, 4),
                    "gain_term": round(breakdown.gain_term, 4),
                    "skill_gap_term": round(breakdown.skill_gap_term, 4),
                    "preference_term": round(breakdown.preference_term, 4),
                    "prereq_term": round(breakdown.prereq_term, 4)
                },
                bkt_evidence=bkt_summary
            )

            rec_obj = {
                "id": f"rec_{user_id[:8]}_{idx+1:03d}",
                "user_id": user_id,
                "next_skill_id": skill_ctx.skill_id,
                "resource_id": res_ctx.resource_id,
                "action_type": action_type,
                "grounded_explanation": explanation,
                "grounding_metadata": {
                    "current_mastery_prob": round(m_prob, 4),
                    "prerequisite_skills_mastered": [p for p in getattr(skill_ctx, "skill_id", "") if mastery.get(p, 0.0) >= 0.80],
                    "target_goal_relevance_score": round(skill_ctx.goal_relevance, 2),
                    "bkt_evidence_summary": bkt_summary,
                    "scoring_total": round(score_val, 4)
                },
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            recommendations.append(rec_obj)

            if len(recommendations) >= limit:
                break

        return recommendations


# Global default instance
recommendation_agent = RecommendationAgent()
