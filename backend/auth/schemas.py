"""
Pydantic v2 Schemas for Authentication & User Profile
Aligned with /shared/schema.md specifications.
"""
from typing import Optional, List, Dict, Any, Literal
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, ConfigDict


# ----------------------------------------------------
# Profile Schemas
# ----------------------------------------------------
class LearnerProfileBase(BaseModel):
    target_role: str = Field(default="Backend Engineer", description="Target learning or career role")
    weekly_hours_budget: int = Field(default=8, ge=1, le=100, description="Available study hours per week")
    preferred_learning_style: Literal["hands_on", "video", "reading", "mixed"] = "hands_on"
    prior_experience_level: Literal["beginner", "intermediate", "advanced"] = "beginner"
    active_goal_id: Optional[str] = None


class LearnerProfileCreate(LearnerProfileBase):
    pass


class LearnerProfileUpdate(BaseModel):
    target_role: Optional[str] = None
    weekly_hours_budget: Optional[int] = Field(default=None, ge=1, le=100)
    preferred_learning_style: Optional[Literal["hands_on", "video", "reading", "mixed"]] = None
    prior_experience_level: Optional[Literal["beginner", "intermediate", "advanced"]] = None
    active_goal_id: Optional[str] = None


class LearnerProfileResponse(LearnerProfileBase):
    model_config = ConfigDict(from_attributes=True)
    user_id: str
    updated_at: Optional[datetime] = None


# ----------------------------------------------------
# User & Auth Schemas
# ----------------------------------------------------
class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6, description="Password at least 6 characters")
    full_name: str = Field(min_length=1, description="Learner display name")
    target_role: Optional[str] = "Backend Engineer"
    weekly_hours_budget: Optional[int] = 8
    preferred_learning_style: Optional[Literal["hands_on", "video", "reading", "mixed"]] = "hands_on"
    prior_experience_level: Optional[Literal["beginner", "intermediate", "advanced"]] = "beginner"


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    email: str
    full_name: str
    is_active: bool
    created_at: datetime
    profile: Optional[LearnerProfileResponse] = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class TokenPayload(BaseModel):
    sub: str
    email: Optional[str] = None
    exp: Optional[int] = None
