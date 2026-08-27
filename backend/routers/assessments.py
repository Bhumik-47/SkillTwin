"""
Assessment Submission & Real-Time BKT Updating Router
Evaluates quizzes/exercises, updates latent skill states via BKT, and triggers adaptive path repairs.
"""
from datetime import datetime, timezone
from typing import Dict, List, Optional, Any
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from backend.db.session import get_db
from backend.db.models import (
    LearnerSkillState,
    Attempt,
    LearningPath,
    PathRepairDiffRecord,
    generate_id
)
from ml.bkt import update_mastery, compute_confidence_score, BKTEngine
from backend.planner.repair import path_repair_engine
from backend.agents.explainer import path_explainer_agent

router = APIRouter(prefix="", tags=["Assessments & Evidence"])


class AssessmentSubmissionRequest(BaseModel):
    user_id: str
    skill_id: str
    resource_id: Optional[str] = None
    attempt_type: Optional[str] = "quiz"
    score: float = Field(..., ge=0.0, le=1.0, description="Normalized assessment score (0.0 to 1.0)")
    time_spent_seconds: Optional[int] = 180
    response_payload: Optional[Dict[str, Any]] = None


@router.post("/assessments/submit", status_code=status.HTTP_200_OK)
async def submit_assessment(
    payload: AssessmentSubmissionRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Submits an assessment score, calculates Bayesian Knowledge Tracing posterior,
    updates learner mastery state, and automatically repairs active learning paths on failure/unlock.
    """
    is_correct = payload.score >= 0.70

    # 1. Fetch or initialize LearnerSkillState
    result = await db.execute(
        select(LearnerSkillState).where(
            LearnerSkillState.user_id == payload.user_id,
            LearnerSkillState.skill_id == payload.skill_id
        )
    )
    skill_state = result.scalars().first()

    if not skill_state:
        skill_state = LearnerSkillState(
            id=generate_id("lss"),
            user_id=payload.user_id,
            skill_id=payload.skill_id,
            mastery_prob=0.10,
            bkt_p_transit=0.15,
            bkt_p_slip=0.10,
            bkt_p_guess=0.20,
            confidence_score=0.0,
            is_mastered=False,
            total_attempts=0,
            successful_attempts=0
        )
        db.add(skill_state)

    prior_mastery = skill_state.mastery_prob

    # 2. Compute BKT posterior mastery with exact keyword arguments
    posterior_mastery = update_mastery(
        prior=prior_mastery,
        evidence=is_correct,
        guess=skill_state.bkt_p_guess,
        slip=skill_state.bkt_p_slip,
        transit=skill_state.bkt_p_transit
    )

    # 3. Update skill state record
    skill_state.mastery_prob = round(posterior_mastery, 4)
    skill_state.total_attempts += 1
    if is_correct:
        skill_state.successful_attempts += 1
    skill_state.is_mastered = (posterior_mastery >= 0.80)
    skill_state.confidence_score = compute_confidence_score(
        total_attempts=skill_state.total_attempts,
        mastery_prob=posterior_mastery
    )
    skill_state.last_assessed_at = datetime.now(timezone.utc)

    # 4. Log Attempt
    attempt = Attempt(
        id=generate_id("att"),
        user_id=payload.user_id,
        skill_id=payload.skill_id,
        resource_id=payload.resource_id,
        attempt_type=payload.attempt_type or "quiz",
        score=payload.score,
        is_correct=is_correct,
        time_spent_seconds=payload.time_spent_seconds,
        response_payload=payload.response_payload,
        prior_mastery_prob=prior_mastery,
        posterior_mastery_prob=posterior_mastery
    )
    db.add(attempt)

    # 5. Check if learner has active path for auto-repair
    path_res = await db.execute(
        select(LearningPath)
        .where(LearningPath.user_id == payload.user_id, LearningPath.status == "active")
        .order_by(LearningPath.created_at.desc())
    )
    active_path = path_res.scalars().first()

    repair_diff = None
    if active_path and active_path.nodes:
        # Fetch full mastery map for the user
        all_states_res = await db.execute(
            select(LearnerSkillState).where(LearnerSkillState.user_id == payload.user_id)
        )
        all_states = all_states_res.scalars().all()
        mastery_map = {s.skill_id: s.mastery_prob for s in all_states}
        mastery_map[payload.skill_id] = posterior_mastery

        # Execute local repair
        diff = path_repair_engine.repair_path(
            old_path=active_path.nodes,
            trigger_skill_id=payload.skill_id,
            new_mastery_map=mastery_map,
            force_remedial=(not is_correct and posterior_mastery < 0.50)
        )

        explanation = path_explainer_agent.explain_path_repair(
            trigger_skill_id=payload.skill_id,
            prior_mastery=prior_mastery,
            posterior_mastery=posterior_mastery,
            score=payload.score,
            metrics=diff["metrics"],
            inserted_nodes=diff["inserted_nodes"],
            unchanged_count=diff["metrics"]["unchanged_node_count"]
        )
        diff["explanation"] = explanation

        # Apply update
        prev_version = active_path.version
        active_path.version += 1
        active_path.nodes = diff["new_path"]
        active_path.total_estimated_minutes = sum(n.get("estimated_minutes", 45) for n in diff["new_path"])

        diff_record = PathRepairDiffRecord(
            id=generate_id("rep"),
            path_id=active_path.id,
            user_id=payload.user_id,
            trigger_skill_id=payload.skill_id,
            previous_version=prev_version,
            new_version=active_path.version,
            old_path=diff["old_path"],
            new_path=diff["new_path"],
            removed_nodes=diff["removed_nodes"],
            unchanged_nodes=diff["unchanged_nodes"],
            inserted_nodes=diff["inserted_nodes"],
            reordered_nodes=diff["reordered_nodes"],
            metrics=diff["metrics"],
            explanation=explanation
        )
        db.add(diff_record)
        repair_diff = diff

    await db.commit()

    return {
        "attempt_id": attempt.id,
        "user_id": payload.user_id,
        "skill_id": payload.skill_id,
        "score": payload.score,
        "is_correct": is_correct,
        "bkt_transition": {
            "prior_mastery_prob": prior_mastery,
            "posterior_mastery_prob": posterior_mastery,
            "is_mastered": skill_state.is_mastered,
            "confidence_score": skill_state.confidence_score,
            "total_attempts": skill_state.total_attempts
        },
        "path_adapted": repair_diff is not None,
        "path_repair_diff": repair_diff,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
