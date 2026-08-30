"""
Learning Path Planning & Local Path Repair Route Controllers
Handles /learning-path/generate (POST) and /adapt-path (POST).
Strictly adheres to /shared/schema.md Sections 3.4 and 3.6.
"""
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from backend.db.session import get_db
from backend.db.models import User
from backend.auth.dependencies import get_current_user
from backend.schemas.planner import (
    LearningPathGenerateRequest,
    LearningPathResponse
)
from backend.schemas.repair import (
    PathAdaptRequest,
    PathRepairDiff
)
from backend.services.planner_service import PlannerService
from backend.services.repair_service import RepairService

router = APIRouter(tags=["Learning Path & Repair"])


@router.post(
    "/learning-path/generate",
    response_model=LearningPathResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Generate personalized topological learning path",
    description="Generates an ordered curriculum sequence respecting prerequisite DAG topological constraints, prior mastery, and study time budgets."
)
async def generate_path(
    payload: LearningPathGenerateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Enforce multi-tenant user isolation
    effective_user_id = current_user.id
    if payload.user_id and payload.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot generate learning paths on behalf of another user"
        )

    try:
        return await PlannerService.generate_learning_path(
            db=db,
            user_id=effective_user_id,
            goal_title=payload.goal_title,
            target_skill_ids=payload.target_skill_ids,
            weekly_hours_budget=payload.weekly_hours_budget or 10
        )
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(ve)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Path generation failed: {str(e)}"
        )


@router.post(
    "/adapt-path",
    response_model=PathRepairDiff,
    status_code=status.HTTP_200_OK,
    summary="Execute localized learning path repair",
    description="Adapts only the affected subgraph of a curriculum roadmap following new learner evidence, minimizing touched nodes."
)
async def adapt_path(
    payload: PathAdaptRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Enforce multi-tenant user isolation
    effective_user_id = current_user.id
    if payload.user_id and payload.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot adapt learning paths belonging to another user"
        )

    try:
        return await RepairService.adapt_learning_path(
            db=db,
            user_id=effective_user_id,
            path_id=payload.path_id,
            trigger_skill_id=payload.trigger_skill_id,
            trigger_event=payload.reason or "manual_repair"
        )
    except ValueError as ve:
        err_msg = str(ve)
        status_code = status.HTTP_404_NOT_FOUND if "not found" in err_msg.lower() else status.HTTP_400_BAD_REQUEST
        raise HTTPException(status_code=status_code, detail=err_msg)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Path adaptation failed: {str(e)}"
        )


@router.get(
    "/paths/gap-analysis",
    status_code=status.HTTP_200_OK,
    summary="Compute 4-stage gap-first analysis for target role",
    description="Returns current skills, required target role skills, missing gap diff, and sequenced path recommendations."
)
async def get_gap_analysis(
    target_role: Optional[str] = None,
    domain: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    try:
        from backend.services.gap_service import GapService
        return await GapService.compute_gap_analysis(
            db=db,
            user_id=current_user.id,
            target_role=target_role,
            domain=domain
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Gap analysis failed: {str(e)}"
        )


from pydantic import BaseModel

class GoalAnalyzePayload(BaseModel):
    prompt: str
    domain: Optional[str] = "backend_engineering"


@router.post(
    "/goals/analyze",
    status_code=status.HTTP_200_OK,
    summary="Analyze learner natural language learning goal",
    description="Extracts target skills and generates goal summary."
)
async def analyze_goal(
    payload: GoalAnalyzePayload,
    db: AsyncSession = Depends(get_db)
):
    try:
        from sqlalchemy import select
        from backend.db.models import Skill
        
        prompt_lower = payload.prompt.lower()
        domain = payload.domain or "backend_engineering"

        # Search existing skills for this domain
        skill_res = await db.execute(select(Skill).where(Skill.domain == domain))
        domain_skills = list(skill_res.scalars().all())
        domain_skill_ids = [s.id for s in domain_skills]

        matched = [s.id for s in domain_skills if s.name.lower() in prompt_lower or s.id in prompt_lower]
        if not matched:
            matched = domain_skill_ids[:6] if domain_skill_ids else ["http_basics", "tcp_ip_sockets", "relational_data_modeling"]

        return {
            "intent_summary": f"Curriculum focused on {payload.prompt.strip()}",
            "target_skill_ids": matched,
            "weekly_hours_budget": 10,
            "domain": domain
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Goal analysis failed: {str(e)}"
        )


