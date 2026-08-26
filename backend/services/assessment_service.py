"""
Assessment & Evidence Submission Service
Persists learner attempts, calculates Bayesian Knowledge Tracing updates,
and triggers automatic local path repair when mastery changes.
"""
from typing import Optional, Dict, Any
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from backend.db.models import (
    User,
    Skill,
    Resource,
    LearnerSkillState,
    Attempt,
    LearningPath,
    generate_id
)
from backend.schemas.assessment import (
    AssessmentSubmitRequest,
    AssessmentSubmitResponse,
    AttemptResponse,
    LearnerSkillStateResponse
)
from backend.integrations.bkt_client import BKTIntegrationClient
from backend.services.repair_service import RepairService


class AssessmentService:
    """
    Service for processing learner assessment evidence and updating cognitive state.
    """

    PASSING_THRESHOLD = 0.70

    @classmethod
    async def submit_assessment(
        cls,
        db: AsyncSession,
        user_id: str,
        payload: AssessmentSubmitRequest
    ) -> AssessmentSubmitResponse:
        """
        Record assessment attempt, compute BKT posterior mastery update,
        and optionally adapt active learning path.
        """
        # 1. Verify Skill exists
        skill = await db.get(Skill, payload.skill_id)
        if not skill:
            raise ValueError(f"Skill '{payload.skill_id}' does not exist in skill graph")

        # 2. Fetch existing LearnerSkillState or initialize default
        state_stmt = select(LearnerSkillState).where(
            LearnerSkillState.user_id == user_id,
            LearnerSkillState.skill_id == payload.skill_id
        )
        state_res = await db.execute(state_stmt)
        skill_state = state_res.scalar_one_or_none()

        prior_mastery = skill_state.mastery_prob if skill_state else 0.10
        total_attempts = skill_state.total_attempts if skill_state else 0
        successful_attempts = skill_state.successful_attempts if skill_state else 0

        # 3. Determine Correctness
        is_correct = payload.score >= cls.PASSING_THRESHOLD

        # 4. Compute BKT Bayesian Update via ML Integration Client
        bkt_result = BKTIntegrationClient.compute_update(
            prior_mastery=prior_mastery,
            is_correct=is_correct,
            total_attempts=total_attempts,
            p_transit=skill_state.bkt_p_transit if skill_state else None,
            p_slip=skill_state.bkt_p_slip if skill_state else None,
            p_guess=skill_state.bkt_p_guess if skill_state else None
        )

        now_dt = datetime.now(timezone.utc)
        now_iso = now_dt.isoformat()

        # 5. Persist or Update LearnerSkillState
        if not skill_state:
            skill_state = LearnerSkillState(
                id=generate_id("lss"),
                user_id=user_id,
                skill_id=payload.skill_id,
                mastery_prob=bkt_result.posterior_mastery,
                bkt_p_transit=bkt_result.p_transit,
                bkt_p_slip=bkt_result.p_slip,
                bkt_p_guess=bkt_result.p_guess,
                confidence_score=bkt_result.confidence_score,
                is_mastered=bkt_result.is_mastered,
                total_attempts=total_attempts + 1,
                successful_attempts=successful_attempts + (1 if is_correct else 0),
                last_assessed_at=now_dt
            )
            db.add(skill_state)
        else:
            skill_state.mastery_prob = bkt_result.posterior_mastery
            skill_state.is_mastered = bkt_result.is_mastered
            skill_state.confidence_score = bkt_result.confidence_score
            skill_state.total_attempts += 1
            if is_correct:
                skill_state.successful_attempts += 1
            skill_state.last_assessed_at = now_dt

        # 6. Persist Attempt
        attempt_id = generate_id("att")
        attempt = Attempt(
            id=attempt_id,
            user_id=user_id,
            skill_id=payload.skill_id,
            resource_id=payload.resource_id,
            attempt_type=payload.evidence_type,
            score=payload.score,
            is_correct=is_correct,
            time_spent_seconds=payload.time_spent_seconds,
            response_payload=payload.answers,
            prior_mastery_prob=bkt_result.prior_mastery,
            posterior_mastery_prob=bkt_result.posterior_mastery,
            timestamp=now_dt
        )
        db.add(attempt)
        await db.flush()

        # 7. Check if active learning path is affected and trigger local repair if requested
        repair_diff = None
        if payload.auto_trigger_repair:
            # Find active learning path containing this skill
            path_stmt = select(LearningPath).where(
                LearningPath.user_id == user_id,
                LearningPath.status == "active"
            )
            paths = list((await db.execute(path_stmt)).scalars().all())
            active_path = None
            for p in paths:
                node_skills = [n.get("skill_id") for n in (p.nodes or [])]
                if payload.skill_id in node_skills:
                    active_path = p
                    break

            if active_path:
                trigger_event = "assessment_passed" if is_correct else "assessment_failed"
                try:
                    repair_diff = await RepairService.adapt_learning_path(
                        db=db,
                        user_id=user_id,
                        path_id=active_path.id,
                        trigger_skill_id=payload.skill_id,
                        trigger_event=trigger_event
                    )
                except Exception as e:
                    # Log repair error without failing the assessment submission
                    pass

        await db.commit()

        return AssessmentSubmitResponse(
            attempt=AttemptResponse(
                id=attempt_id,
                user_id=user_id,
                skill_id=payload.skill_id,
                resource_id=payload.resource_id,
                attempt_type=payload.evidence_type,
                score=payload.score,
                is_correct=is_correct,
                time_spent_seconds=payload.time_spent_seconds,
                prior_mastery_prob=bkt_result.prior_mastery,
                posterior_mastery_prob=bkt_result.posterior_mastery,
                timestamp=now_iso
            ),
            skill_state=LearnerSkillStateResponse(
                user_id=user_id,
                skill_id=payload.skill_id,
                mastery_prob=bkt_result.posterior_mastery,
                bkt_p_transit=bkt_result.p_transit,
                bkt_p_slip=bkt_result.p_slip,
                bkt_p_guess=bkt_result.p_guess,
                confidence_score=bkt_result.confidence_score,
                is_mastered=bkt_result.is_mastered,
                total_attempts=skill_state.total_attempts,
                successful_attempts=skill_state.successful_attempts,
                last_assessed_at=now_iso
            ),
            repair_diff=repair_diff
        )
