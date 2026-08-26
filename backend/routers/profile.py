"""
Learner Profile Route Controllers (/profile GET, PUT)
"""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy import select

from backend.db.session import get_db
from backend.db.models import User, LearnerProfile
from backend.auth.schemas import LearnerProfileResponse, LearnerProfileUpdate
from backend.auth.dependencies import get_current_user

router = APIRouter(prefix="/profile", tags=["Learner Profile"])


@router.get("", response_model=LearnerProfileResponse)
async def get_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieve the active learner profile for the authenticated user.
    """
    stmt = select(LearnerProfile).where(LearnerProfile.user_id == current_user.id)
    res = await db.execute(stmt)
    profile = res.scalar_one_or_none()

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Learner profile not found"
        )

    return LearnerProfileResponse.model_validate(profile)


@router.put("", response_model=LearnerProfileResponse)
async def update_profile(
    payload: LearnerProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Update learner preferences, study hours budget, learning style, and experience tier.
    """
    stmt = select(LearnerProfile).where(LearnerProfile.user_id == current_user.id)
    res = await db.execute(stmt)
    profile = res.scalar_one_or_none()

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Learner profile not found"
        )

    # Update only provided fields
    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(profile, field, value)

    await db.commit()
    await db.refresh(profile)

    return LearnerProfileResponse.model_validate(profile)
