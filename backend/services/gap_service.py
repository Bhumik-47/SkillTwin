"""
Gap-First Recommendation Service
Implements the 4-stage gap analysis flow:
Stage 1: Current Skills
Stage 2: Target Role Requirements
Stage 3: The Gap (Missing competencies)
Stage 4: Recommended Learning Sequence to Close the Gap
"""
import logging
from typing import Dict, List, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from backend.db.models import User, Skill, SkillDependency, LearnerSkillState, LearnerProfile, Goal
from backend.services.graph_service import GraphService
from backend.integrations.agent_client import AgentIntegrationClient

logger = logging.getLogger("skilltwin.services.gap")


class GapService:
    """
    Computes grounded 4-stage gap analysis comparing learner competencies against target role requirements.
    """

    @classmethod
    async def compute_gap_analysis(
        cls,
        db: AsyncSession,
        user_id: str,
        target_role: Optional[str] = None,
        domain: Optional[str] = None
    ) -> Dict[str, Any]:
        # 1. Fetch Learner Profile
        prof_stmt = select(LearnerProfile).where(LearnerProfile.user_id == user_id)
        prof_res = await db.execute(prof_stmt)
        profile = prof_res.scalar_one_or_none()

        role = target_role or (profile.target_role if profile else "Backend Engineer")
        
        # 2. Fetch all Skills in Domain / Graph
        all_skills_stmt = select(Skill)
        if domain:
            all_skills_stmt = all_skills_stmt.where(Skill.domain == domain)
        skills_res = await db.execute(all_skills_stmt)
        skills = skills_res.scalars().all()
        skills_by_id = {s.id: s for s in skills}

        # 3. Fetch Learner's Skill States
        states_stmt = select(LearnerSkillState).where(LearnerSkillState.user_id == user_id)
        states_res = await db.execute(states_stmt)
        skill_states = {s.skill_id: s for s in states_res.scalars().all()}

        # 4. Fetch Graph & Topological Dependencies
        deps_stmt = select(SkillDependency)
        deps_res = await db.execute(deps_stmt)
        deps = deps_res.scalars().all()

        G = GraphService.build_graph(skills, deps)

        # Stage 1: Current Skills (already possessing non-zero mastery or confirmed)
        current_skills: List[Dict[str, Any]] = []
        for s_id, s_obj in skills_by_id.items():
            state = skill_states.get(s_id)
            mastery = state.mastery_prob if state else 0.10
            is_mastered = (state.is_mastered if state else False) or mastery >= 0.80
            source = getattr(state, "source", "self_report") if state else "self_report"
            evidence = getattr(state, "evidence_snippet", None) if state else None

            if mastery >= 0.35 or is_mastered:
                current_skills.append({
                    "skill_id": s_id,
                    "name": s_obj.name,
                    "mastery_pct": round(mastery * 100),
                    "is_verified": is_mastered,
                    "source": source,
                    "evidence_snippet": evidence,
                    "status_label": "Verified Mastered" if is_mastered else ("Estimated from Resume/GitHub" if source in ["resume", "github"] else "In-Progress")
                })

        # Stage 2: Required Skills for Target Role
        required_skills: List[Dict[str, Any]] = []
        for s_id, s_obj in skills_by_id.items():
            required_skills.append({
                "skill_id": s_id,
                "name": s_obj.name,
                "difficulty": s_obj.difficulty,
                "estimated_minutes": s_obj.estimated_duration_minutes,
                "is_critical": True
            })

        # Stage 3: The Gap (Skills where mastery < 0.70)
        gap_skills: List[Dict[str, Any]] = []
        for s_id, s_obj in skills_by_id.items():
            state = skill_states.get(s_id)
            mastery = state.mastery_prob if state else 0.10
            if mastery < 0.70:
                prereqs = list(G.predecessors(s_id)) if s_id in G else []
                prereq_names = [skills_by_id[p].name for p in prereqs if p in skills_by_id]
                gap_skills.append({
                    "skill_id": s_id,
                    "name": s_obj.name,
                    "current_mastery_pct": round(mastery * 100),
                    "missing_pct": round((1.0 - mastery) * 100),
                    "prerequisites": prereq_names,
                    "estimated_minutes": s_obj.estimated_duration_minutes
                })

        # Stage 4: What to Learn Next (Topological Roadmap closing the gap)
        import networkx as nx
        try:
            topo = list(nx.topological_sort(G))
        except Exception:
            topo = list(skills_by_id.keys())

        recommended_path: List[Dict[str, Any]] = []
        step_order = 1
        for s_id in topo:
            if s_id not in skills_by_id:
                continue
            s_obj = skills_by_id[s_id]
            state = skill_states.get(s_id)
            mastery = state.mastery_prob if state else 0.10
            is_mastered = (state.is_mastered if state else False) or mastery >= 0.80

            downstream = [skills_by_id[succ].name for succ in G.successors(s_id) if succ in skills_by_id]
            reason = AgentIntegrationClient.explain_role_alignment(
                skill_name=s_obj.name,
                target_role=role,
                dependent_skill_names=downstream
            )

            recommended_path.append({
                "step_order": step_order,
                "skill_id": s_id,
                "name": s_obj.name,
                "difficulty": s_obj.difficulty,
                "status": "completed" if is_mastered else ("ready" if step_order == 1 else "locked"),
                "mastery_pct": round(mastery * 100),
                "reason": reason,
                "estimated_minutes": s_obj.estimated_duration_minutes
            })
            step_order += 1

        return {
            "target_role": role,
            "current_skills": current_skills,
            "required_skills": required_skills,
            "gap_skills": gap_skills,
            "recommended_path": recommended_path,
            "summary": {
                "total_required": len(required_skills),
                "mastered_count": len(current_skills),
                "gap_count": len(gap_skills),
                "readiness_pct": round((len(current_skills) / max(1, len(required_skills))) * 100)
            }
        }
