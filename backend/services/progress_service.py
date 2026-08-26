"""
Progress & Learning Analytics Service
Aggregates goal completion rates, mastery heatmaps, and diagnostic metrics.
"""
from typing import Optional, List, Dict, Any, Set
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from backend.db.models import (
    User,
    LearnerProfile,
    Goal,
    Skill,
    LearnerSkillState,
    Attempt,
    LearningPath
)
from backend.schemas.progress import ProgressResponse
from backend.schemas.assessment import AttemptResponse


class ProgressService:
    """
    Service for aggregating and computing multi-dimensional learner progress.
    """

    @classmethod
    async def get_learner_progress(
        cls,
        db: AsyncSession,
        user_id: str,
        goal_id: Optional[str] = None
    ) -> ProgressResponse:
        """
        Compute progress summary against active or specified goal.
        """
        # 1. Resolve Goal
        target_goal = None
        if goal_id:
            goal_stmt = select(Goal).where(Goal.id == goal_id, Goal.user_id == user_id)
            target_goal = (await db.execute(goal_stmt)).scalar_one_or_none()
        else:
            # Check active goal from profile
            prof_stmt = select(LearnerProfile).where(LearnerProfile.user_id == user_id)
            profile = (await db.execute(prof_stmt)).scalar_one_or_none()
            if profile and profile.active_goal_id:
                goal_stmt = select(Goal).where(Goal.id == profile.active_goal_id, Goal.user_id == user_id)
                target_goal = (await db.execute(goal_stmt)).scalar_one_or_none()
            
            if not target_goal:
                # Fallback to latest user goal
                goal_stmt = select(Goal).where(Goal.user_id == user_id).order_by(desc(Goal.created_at)).limit(1)
                target_goal = (await db.execute(goal_stmt)).scalar_one_or_none()

        # 2. Fetch all user skill states
        states_stmt = select(LearnerSkillState).where(LearnerSkillState.user_id == user_id)
        all_states = list((await db.execute(states_stmt)).scalars().all())
        states_by_skill = {s.skill_id: s for s in all_states}

        # 3. Fetch active learning path nodes if available
        path_stmt = select(LearningPath).where(
            LearningPath.user_id == user_id,
            LearningPath.status == "active"
        ).order_by(desc(LearningPath.version)).limit(1)
        active_path = (await db.execute(path_stmt)).scalar_one_or_none()

        completed_skill_ids: List[str] = []
        in_progress_skill_ids: List[str] = []
        locked_skill_ids: List[str] = []

        if active_path and active_path.nodes:
            # Categorize from path nodes
            for node in active_path.nodes:
                s_id = node.get("skill_id")
                st = node.get("status", "ready")
                if st == "completed" or (s_id in states_by_skill and states_by_skill[s_id].is_mastered):
                    if s_id not in completed_skill_ids:
                        completed_skill_ids.append(s_id)
                elif st in ["in_progress", "ready"]:
                    if s_id not in in_progress_skill_ids:
                        in_progress_skill_ids.append(s_id)
                elif st == "locked":
                    if s_id not in locked_skill_ids:
                        locked_skill_ids.append(s_id)
        else:
            # Fallback to direct state inspection
            for s_id, s in states_by_skill.items():
                if s.is_mastered or s.mastery_prob >= 0.80:
                    completed_skill_ids.append(s_id)
                elif s.total_attempts > 0 or s.mastery_prob > 0.0:
                    in_progress_skill_ids.append(s_id)
                else:
                    locked_skill_ids.append(s_id)

        # 4. Compute metrics
        total_relevant_skills = len(completed_skill_ids) + len(in_progress_skill_ids) + len(locked_skill_ids)
        if total_relevant_skills > 0:
            overall_completion_pct = round((len(completed_skill_ids) / total_relevant_skills) * 100.0, 1)
        else:
            overall_completion_pct = 0.0

        if states_by_skill:
            average_mastery = round(sum(s.mastery_prob for s in states_by_skill.values()) / len(states_by_skill), 2)
        else:
            average_mastery = 0.0

        # 5. Fetch Recent Attempts
        att_stmt = select(Attempt).where(Attempt.user_id == user_id).order_by(desc(Attempt.timestamp)).limit(5)
        recent_attempts_db = list((await db.execute(att_stmt)).scalars().all())
        recent_attempts = [
            AttemptResponse(
                id=a.id,
                user_id=a.user_id,
                skill_id=a.skill_id,
                resource_id=a.resource_id,
                attempt_type=a.attempt_type,
                score=a.score,
                is_correct=a.is_correct,
                time_spent_seconds=a.time_spent_seconds,
                prior_mastery_prob=a.prior_mastery_prob,
                posterior_mastery_prob=a.posterior_mastery_prob,
                timestamp=a.timestamp.isoformat() if a.timestamp else datetime.now(timezone.utc).isoformat()
            )
            for a in recent_attempts_db
        ]

        last_active_at = recent_attempts_db[0].timestamp.isoformat() if recent_attempts_db and recent_attempts_db[0].timestamp else datetime.now(timezone.utc).isoformat()

        return ProgressResponse(
            user_id=user_id,
            goal_id=target_goal.id if target_goal else None,
            completed_skill_ids=completed_skill_ids,
            in_progress_skill_ids=in_progress_skill_ids,
            locked_skill_ids=locked_skill_ids,
            overall_completion_pct=overall_completion_pct,
            average_mastery=average_mastery,
            last_active_at=last_active_at,
            recent_attempts=recent_attempts
        )
