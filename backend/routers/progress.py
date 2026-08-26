"""
Progress & Diagnostics Route Controller (/progress GET)
Strictly adheres to /shared/schema.md Section 3.7.
"""
from typing import Optional
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from backend.db.session import get_db
from backend.db.models import User
from backend.auth.dependencies import get_current_user
from backend.schemas.progress import ProgressResponse
from backend.services.progress_service import ProgressService

router = APIRouter(prefix="/progress", tags=["Progress & Analytics"])


@router.get(
    "",
    response_model=ProgressResponse,
    summary="Get learner progress and goal mastery",
    description="Retrieves aggregate completion percentage, average mastery, locked/completed skills, and recent attempt history."
)
async def get_progress(
    goal_id: Optional[str] = Query(default=None, description="Optional goal ID filter"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    try:
        return await ProgressService.get_learner_progress(
            db=db,
            user_id=current_user.id,
            goal_id=goal_id
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch learner progress: {str(e)}"
        )
