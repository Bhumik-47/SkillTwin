"""
Recommendations Route Controller (/recommendations GET)
Strictly adheres to /shared/schema.md Section 3.8.
"""
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from backend.db.session import get_db
from backend.db.models import User
from backend.auth.dependencies import get_current_user
from backend.schemas.recommendation import RecommendationResponse
from backend.services.recommendation_service import RecommendationService

router = APIRouter(prefix="/recommendations", tags=["Recommendations"])


@router.get(
    "",
    response_model=RecommendationResponse,
    summary="Get next-best-action learning recommendations",
    description="Returns prioritized recommendations with verifiable grounding metrics and explanations."
)
async def get_recommendations(
    limit: int = Query(default=3, ge=1, le=10, description="Max recommendations to return"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    try:
        return await RecommendationService.get_recommendations(
            db=db,
            user_id=current_user.id,
            limit=limit
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch recommendations: {str(e)}"
        )
