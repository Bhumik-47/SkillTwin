"""
Assessment & Evidence Submission Route Controller (/assessment/submit POST)
Strictly adheres to /shared/schema.md Section 3.5.
"""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from backend.db.session import get_db
from backend.db.models import User
from backend.auth.dependencies import get_current_user
from backend.schemas.assessment import (
    AssessmentSubmitRequest,
    AssessmentSubmitResponse
)
from backend.services.assessment_service import AssessmentService

router = APIRouter(tags=["Assessments & Evidence"])


@router.post(
    "/assessment/submit",
    response_model=AssessmentSubmitResponse,
    status_code=status.HTTP_200_OK,
    summary="Submit quiz, project, or exercise result",
    description="Evaluates assessment result, updates latent skill mastery via Bayesian Knowledge Tracing (BKT), and auto-triggers path adaptation if required."
)
@router.post(
    "/assessments/submit",
    response_model=AssessmentSubmitResponse,
    status_code=status.HTTP_200_OK,
    include_in_schema=False
)
async def submit_assessment(
    payload: AssessmentSubmitRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Enforce multi-tenant user isolation
    effective_user_id = current_user.id
    if payload.user_id and payload.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot submit assessment evidence for another user"
        )

    try:
        return await AssessmentService.submit_assessment(
            db=db,
            user_id=effective_user_id,
            payload=payload
        )
    except ValueError as ve:
        err_msg = str(ve)
        status_code = status.HTTP_404_NOT_FOUND if "not found" in err_msg.lower() else status.HTTP_400_BAD_REQUEST
        raise HTTPException(status_code=status_code, detail=err_msg)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Assessment submission failed: {str(e)}"
        )


@router.get(
    "/assessments/questions",
    status_code=status.HTTP_200_OK,
    summary="Fetch multi-tier questions for a skill"
)
@router.get(
    "/assessment/questions",
    status_code=status.HTTP_200_OK,
    include_in_schema=False
)
async def get_assessment_questions(
    skill_id: str,
    difficulty: Optional[str] = "beginner",
    db: AsyncSession = Depends(get_db)
):
    try:
        # Load resource or question bank for this skill
        return {
            "skill_id": skill_id,
            "difficulty": difficulty or "beginner",
            "status": "ready",
            "questions": []
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch questions: {str(e)}"
        )

