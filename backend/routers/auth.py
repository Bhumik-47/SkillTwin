"""
Authentication Route Controllers (/auth/signup, /auth/login, /auth/me)
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy import select

from backend.db.session import get_db
from backend.db.models import User, LearnerProfile, generate_id
from backend.auth.schemas import UserCreate, UserLogin, UserResponse, TokenResponse
from backend.auth.security import get_password_hash, verify_password
from backend.auth.jwt import create_access_token
from backend.auth.dependencies import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/signup", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def signup(payload: UserCreate, db: AsyncSession = Depends(get_db)):
    """
    Register a new learner account.
    - Validates email uniqueness
    - Hashes password securely
    - Bootstraps initial LearnerProfile
    - Generates JWT bearer access token
    """
    # Check if user already exists
    stmt = select(User).where(User.email == payload.email)
    res = await db.execute(stmt)
    if res.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists"
        )

    # Create new User
    user_id = generate_id("usr")
    new_user = User(
        id=user_id,
        email=payload.email,
        hashed_password=get_password_hash(payload.password),
        full_name=payload.full_name,
        is_active=True
    )
    db.add(new_user)

    # Create default LearnerProfile
    profile = LearnerProfile(
        id=generate_id("prof"),
        user_id=user_id,
        target_role=payload.target_role or "Backend Engineer",
        weekly_hours_budget=payload.weekly_hours_budget or 8,
        preferred_learning_style=payload.preferred_learning_style or "hands_on",
        prior_experience_level=payload.prior_experience_level or "beginner"
    )
    db.add(profile)

    await db.commit()
    
    # Reload user with profile
    stmt = select(User).options(selectinload(User.profile)).where(User.id == user_id)
    result = await db.execute(stmt)
    created_user = result.scalar_one()

    # Generate JWT
    token = create_access_token(data={"sub": user_id, "email": created_user.email})

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(created_user)
    )


@router.post("/login", response_model=TokenResponse)
async def login(payload: UserLogin, db: AsyncSession = Depends(get_db)):
    """
    Authenticate learner credentials and issue a signed JWT access token.
    """
    stmt = select(User).options(selectinload(User.profile)).where(User.email == payload.email)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is deactivated"
        )

    token = create_access_token(data={"sub": user.id, "email": user.email})

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    """
    Get authenticated user profile and account details.
    """
    return UserResponse.model_validate(current_user)
