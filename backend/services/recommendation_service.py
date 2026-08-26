"""
Recommendations Service
Curates next-best learning actions grounded strictly in verifiable learner state metrics.
"""
from typing import Optional, List, Dict, Any, Set
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from backend.db.models import (
    User,
    LearnerProfile,
    Skill,
    SkillDependency,
    Resource,
    LearnerSkillState,
    LearningPath,
    Recommendation,
    generate_id
)
from backend.schemas.recommendation import (
    RecommendationResponse,
    RecommendationItem,
    GroundingMetadata
)
from backend.integrations.scoring_client import ScoringIntegrationClient
from backend.integrations.agent_client import AgentIntegrationClient


class RecommendationService:
    """
    Service for generating deterministic, grounded next-best-action recommendations.
    """

    @classmethod
    async def get_recommendations(
        cls,
        db: AsyncSession,
        user_id: str,
        limit: int = 3
    ) -> RecommendationResponse:
        """
        Produce top-N recommended learning actions for the authenticated user.
        """
        # 1. Fetch User Profile
        prof_stmt = select(LearnerProfile).where(LearnerProfile.user_id == user_id)
        profile = (await db.execute(prof_stmt)).scalar_one_or_none()
        preferred_style = profile.preferred_learning_style if profile else "hands_on"

        # 2. Fetch User Skill States
        states_stmt = select(LearnerSkillState).where(LearnerSkillState.user_id == user_id)
        all_states = list((await db.execute(states_stmt)).scalars().all())
        states_by_skill = {s.skill_id: s for s in all_states}
        mastered_skill_ids = [s.skill_id for s in all_states if s.is_mastered or s.mastery_prob >= 0.80]

        # 3. Fetch Active Learning Path
        path_stmt = select(LearningPath).where(
            LearningPath.user_id == user_id,
            LearningPath.status == "active"
        ).order_by(desc(LearningPath.version)).limit(1)
        active_path = (await db.execute(path_stmt)).scalar_one_or_none()

        # 4. Fetch All Skills & Dependencies
        all_skills = list((await db.execute(select(Skill))).scalars().all())
        skills_by_id = {s.id: s for s in all_skills}

        all_deps = list((await db.execute(select(SkillDependency))).scalars().all())
        prereqs_by_skill: Dict[str, List[str]] = {}
        for d in all_deps:
            prereqs_by_skill.setdefault(d.target_skill_id, []).append(d.source_skill_id)

        # 5. Identify Candidate Skills
        candidate_specs: List[Dict[str, Any]] = []

        if active_path and active_path.nodes:
            for node in active_path.nodes:
                s_id = node.get("skill_id")
                st = node.get("status")
                node_mastery = node.get("mastery_prob", 0.0)

                if st == "in_progress":
                    if node_mastery < 0.50 and (s_id in states_by_skill and states_by_skill[s_id].total_attempts > 0):
                        candidate_specs.append({"skill_id": s_id, "action_type": "reinforce"})
                    else:
                        candidate_specs.append({"skill_id": s_id, "action_type": "learn"})
                elif st == "ready":
                    candidate_specs.append({"skill_id": s_id, "action_type": "learn"})

        # If no active path or few candidates, find unblocked skills in graph
        if len(candidate_specs) < limit:
            for s in all_skills:
                s_id = s.id
                if s_id in mastered_skill_ids:
                    continue
                if any(c["skill_id"] == s_id for c in candidate_specs):
                    continue

                prereqs = prereqs_by_skill.get(s_id, [])
                prereqs_satisfied = all(p in mastered_skill_ids for p in prereqs)
                if prereqs_satisfied:
                    state = states_by_skill.get(s_id)
                    if state and state.total_attempts > 0 and not state.is_mastered:
                        candidate_specs.append({"skill_id": s_id, "action_type": "reinforce"})
                    else:
                        candidate_specs.append({"skill_id": s_id, "action_type": "learn"})

        # 6. Fetch Resources for Candidate Skills
        candidate_skill_ids = [c["skill_id"] for c in candidate_specs]
        res_stmt = select(Resource).where(Resource.skill_id.in_(candidate_skill_ids))
        all_resources = list((await db.execute(res_stmt)).scalars().all())
        resources_by_skill: Dict[str, List[Resource]] = {}
        for r in all_resources:
            resources_by_skill.setdefault(r.skill_id, []).append(r)

        # 7. Assemble Grounded Recommendations
        recommendations: List[RecommendationItem] = []
        now_iso = datetime.now(timezone.utc).isoformat()

        for spec in candidate_specs[:limit]:
            s_id = spec["skill_id"]
            action_type = spec["action_type"]
            skill_obj = skills_by_id.get(s_id)
            if not skill_obj:
                continue

            state = states_by_skill.get(s_id)
            mastery_prob = round(state.mastery_prob if state else 0.0, 2)
            total_att = state.total_attempts if state else 0

            # Direct prerequisites
            prereqs = prereqs_by_skill.get(s_id, [])
            mastered_prereqs = [p for p in prereqs if p in mastered_skill_ids]
            prereq_readiness = len(mastered_prereqs) / max(1, len(prereqs)) if prereqs else 1.0

            # Score and pick resource
            avail_res = resources_by_skill.get(s_id, [])
            best_res_id = None
            if avail_res:
                scored = [
                    ScoringIntegrationClient.score_resource(
                        resource_id=r.id,
                        skill_id=s_id,
                        resource_type=r.type,
                        current_mastery=mastery_prob,
                        prerequisite_readiness=prereq_readiness,
                        preferred_style=preferred_style,
                        goal_relevance=1.0
                    )
                    for r in avail_res
                ]
                scored.sort(key=lambda x: x.final_score, reverse=True)
                best_res_id = scored[0].resource_id
            elif skill_obj.resource_ids:
                best_res_id = skill_obj.resource_ids[0]

            # Grounding Metadata
            bkt_summary = (
                f"Posterior mastery {mastery_prob:.2f} from {total_att} attempt(s)"
                if total_att > 0
                else f"Prior mastery {mastery_prob:.2f}, 0 attempts"
            )
            grounding_meta = GroundingMetadata(
                current_mastery_prob=mastery_prob,
                prerequisite_skills_mastered=mastered_prereqs,
                target_goal_relevance_score=1.0,
                bkt_evidence_summary=bkt_summary
            )

            # Grounded Explanation
            prereq_names = [skills_by_id[p].name for p in mastered_prereqs if p in skills_by_id]
            explanation = AgentIntegrationClient.generate_recommendation_explanation(
                skill_name=skill_obj.name,
                mastery_prob=mastery_prob,
                action_type=action_type,
                prerequisite_names=prereq_names
            )

            rec_id = generate_id("rec")
            recommendations.append(RecommendationItem(
                id=rec_id,
                user_id=user_id,
                next_skill_id=s_id,
                resource_id=best_res_id,
                action_type=action_type,
                grounded_explanation=explanation,
                grounding_metadata=grounding_meta,
                created_at=now_iso
            ))

        return RecommendationResponse(recommendations=recommendations)
