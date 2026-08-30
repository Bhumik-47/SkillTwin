"""
Learning Path Planning Service
Performs topological sorting on prerequisite DAGs, evaluates BKT mastery,
scores resources, and constructs deterministic learning roadmaps.
"""
from typing import Optional, List, Dict, Any, Set
from datetime import datetime, timezone
import networkx as nx
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from backend.db.models import (
    User,
    LearnerProfile,
    Goal,
    Skill,
    SkillDependency,
    Resource,
    LearnerSkillState,
    LearningPath,
    generate_id
)
from backend.schemas.planner import (
    LearningPathNodeSchema,
    LearningPathSchema,
    LearningPathResponse
)
from backend.services.graph_service import GraphService
from backend.integrations.scoring_client import ScoringIntegrationClient
from backend.integrations.agent_client import AgentIntegrationClient


class PlannerService:
    """
    Service for deterministic learning path generation and goal curriculum planning.
    """

    @classmethod
    async def generate_learning_path(
        cls,
        db: AsyncSession,
        user_id: str,
        goal_title: str,
        target_skill_ids: List[str],
        weekly_hours_budget: int = 10
    ) -> LearningPathResponse:
        """
        Generate an optimal, topologically sorted learning path to achieve target skills.
        """
        # 1. Verify User exists
        user = await db.get(User, user_id)
        if not user:
            raise ValueError(f"User {user_id} not found")

        # 2. Fetch User Profile for learning preferences
        prof_stmt = select(LearnerProfile).where(LearnerProfile.user_id == user_id)
        prof_res = await db.execute(prof_stmt)
        profile = prof_res.scalar_one_or_none()
        preferred_style = profile.preferred_learning_style if profile else "hands_on"
        target_role = profile.target_role if profile and profile.target_role else goal_title

        # 3. Fetch All Skills and Dependencies
        skill_res = await db.execute(select(Skill))
        all_skills = list(skill_res.scalars().all())
        skills_by_id = {s.id: s for s in all_skills}

        # Verify target skills exist
        for target_id in target_skill_ids:
            if target_id not in skills_by_id:
                raise ValueError(f"Target skill ID '{target_id}' does not exist in skill graph")

        dep_res = await db.execute(select(SkillDependency))
        all_deps = list(dep_res.scalars().all())

        # 4. Build Full NetworkX DAG
        G = GraphService.build_networkx_dag(all_skills, all_deps)

        # 5. Determine Prerequisite Closure for Target Skills
        required_nodes: Set[str] = set(target_skill_ids)
        for target_id in target_skill_ids:
            ancestors = nx.ancestors(G, target_id)
            required_nodes.update(ancestors)

        subgraph = G.subgraph(required_nodes)

        # 6. Topological Sort (Deterministic ordering)
        # Using sorted nodes as tie-breaker for deterministic sequence
        topo_order = list(nx.topological_sort(subgraph))

        # 7. Fetch Learner's Existing BKT Skill States
        state_stmt = select(LearnerSkillState).where(
            LearnerSkillState.user_id == user_id,
            LearnerSkillState.skill_id.in_(required_nodes)
        )
        state_res = await db.execute(state_stmt)
        learner_states = {s.skill_id: s for s in state_res.scalars().all()}

        # 8. Fetch Resources for Required Skills
        res_stmt = select(Resource).where(Resource.skill_id.in_(required_nodes))
        res_result = await db.execute(res_stmt)
        resources_by_skill: Dict[str, List[Resource]] = {}
        for r in res_result.scalars().all():
            resources_by_skill.setdefault(r.skill_id, []).append(r)

        # 9. Build Ordered Learning Path Nodes
        nodes: List[LearningPathNodeSchema] = []
        mastered_skill_set: Set[str] = {
            s_id for s_id, s in learner_states.items() if s.is_mastered or s.mastery_prob >= 0.80
        }
        
        first_unmastered_assigned = False
        total_estimated_minutes = 0

        for step_idx, skill_id in enumerate(topo_order, start=1):
            skill_obj = skills_by_id[skill_id]
            direct_prereqs = list(subgraph.predecessors(skill_id))
            
            # Prerequisite readiness: fraction of direct prerequisites mastered
            if direct_prereqs:
                prereqs_mastered_count = sum(1 for p in direct_prereqs if p in mastered_skill_set)
                prereq_readiness = prereqs_mastered_count / len(direct_prereqs)
                all_prereqs_satisfied = prereqs_mastered_count == len(direct_prereqs)
            else:
                prereq_readiness = 1.0
                all_prereqs_satisfied = True

            state = learner_states.get(skill_id)
            current_mastery = state.mastery_prob if state else 0.0
            is_mastered = (state.is_mastered if state else False) or current_mastery >= 0.80

            # Determine Node Status
            if is_mastered:
                status = "completed"
            elif all_prereqs_satisfied:
                if not first_unmastered_assigned:
                    status = "in_progress"
                    first_unmastered_assigned = True
                else:
                    status = "ready"
            else:
                status = "locked"

            # Select Best Recommended Resource via Multi-Factor Scoring
            available_resources = resources_by_skill.get(skill_id, [])
            recommended_resource_id = None
            
            if available_resources:
                scored_res_list = [
                    ScoringIntegrationClient.score_resource(
                        resource_id=r.id,
                        skill_id=skill_id,
                        resource_type=r.type,
                        current_mastery=current_mastery,
                        prerequisite_readiness=prereq_readiness,
                        preferred_style=preferred_style,
                        goal_relevance=1.0 if skill_id in target_skill_ids else 0.85
                    )
                    for r in available_resources
                ]
                scored_res_list.sort(key=lambda x: x.final_score, reverse=True)
                recommended_resource_id = scored_res_list[0].resource_id
            elif skill_obj.resource_ids:
                recommended_resource_id = skill_obj.resource_ids[0]

            node_duration = skill_obj.estimated_duration_minutes or 45
            total_estimated_minutes += node_duration

            # Downstream dependent skill names in target role roadmap
            downstream_ids = [succ for succ in G.successors(skill_id) if succ in skills_by_id]
            downstream_names = [skills_by_id[succ].name for succ in downstream_ids]
            
            node_reason = AgentIntegrationClient.explain_role_alignment(
                skill_name=skill_obj.name,
                target_role=target_role,
                dependent_skill_names=downstream_names
            ) if hasattr(AgentIntegrationClient, "explain_role_alignment") else (
                f"You should learn {skill_obj.name} because it's required for {len(downstream_names)} skill{'s' if len(downstream_names) > 1 else ''} in your target {target_role} role: {', '.join(downstream_names[:3])}."
                if downstream_names else f"You should learn {skill_obj.name} because it is a core required competency for your target {target_role} role."
            )

            node_schema = LearningPathNodeSchema(
                node_id=f"node_{skill_id}",
                step_order=step_idx,
                skill_id=skill_id,
                skill_name=skill_obj.name,
                recommended_resource_id=recommended_resource_id,
                status=status,
                mastery_prob=round(current_mastery, 4),
                prerequisite_skill_ids=direct_prereqs,
                estimated_minutes=node_duration,
                reason=node_reason
            )
            nodes.append(node_schema)

        # 10. Persist Goal in Database
        goal_id = generate_id("goal")
        goal = Goal(
            id=goal_id,
            user_id=user_id,
            title=goal_title,
            target_skill_ids=target_skill_ids,
            status="in_progress"
        )
        db.add(goal)

        # 11. Supersede any existing active paths for this user/goal
        existing_path_stmt = select(LearningPath).where(
            LearningPath.user_id == user_id,
            LearningPath.status == "active"
        )
        existing_paths = list((await db.execute(existing_path_stmt)).scalars().all())
        for old_p in existing_paths:
            old_p.status = "superseded"

        # 12. Create LearningPath record
        path_id = generate_id("path")
        now_str = datetime.now(timezone.utc).isoformat()
        learning_path = LearningPath(
            id=path_id,
            user_id=user_id,
            goal_id=goal_id,
            version=1,
            nodes=[n.model_dump() for n in nodes],
            total_estimated_minutes=total_estimated_minutes,
            status="active"
        )
        db.add(learning_path)

        # Update profile active goal ID
        if profile:
            profile.active_goal_id = goal_id

        await db.commit()

        # 13. Generate Grounded Explanation
        explanation = AgentIntegrationClient.generate_path_explanation(
            goal_title=goal_title,
            target_skills=[skills_by_id[t].name for t in target_skill_ids],
            total_nodes=len(nodes),
            mastered_skills=[skills_by_id[s].name for s in mastered_skill_set if s in skills_by_id]
        )

        return LearningPathResponse(
            path=LearningPathSchema(
                id=path_id,
                user_id=user_id,
                goal_id=goal_id,
                version=1,
                total_estimated_minutes=total_estimated_minutes,
                status="active",
                created_at=now_str,
                updated_at=now_str,
                nodes=nodes
            ),
            explanation=explanation
        )
