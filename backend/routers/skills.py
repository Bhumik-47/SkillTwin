"""
Skill Graph Route Controller (/skill-graph GET)
Strictly adheres to /shared/schema.md Section 3.3.
"""
from typing import Optional
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from backend.db.session import get_db
from backend.db.models import User
from backend.auth.dependencies import get_optional_user
from backend.schemas.graph import SkillGraphResponse
from backend.services.graph_service import GraphService

router = APIRouter(tags=["Skill Graph"])


@router.get(
    "/skill-graph",
    response_model=SkillGraphResponse,
    summary="Get prerequisite DAG and skill metadata",
    description="Returns all skills, directed prerequisite dependencies, and optionally enriches nodes with authenticated learner BKT mastery."
)
async def get_skill_graph(
    include_learner_state: bool = Query(default=True, description="Whether to include personalized mastery states"),
    domain: Optional[str] = Query(default=None, description="Optional domain category filter"),
    current_user: Optional[User] = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db)
):
    try:
        user_id = current_user.id if current_user else None
        return await GraphService.get_skill_graph(
            db=db,
            user_id=user_id,
            domain=domain,
            include_learner_state=include_learner_state
        )
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(ve)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve skill graph: {str(e)}"
        )
