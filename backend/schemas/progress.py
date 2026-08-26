"""
Progress & Diagnostic Schemas matching /shared/schema.md Sections 2.9 and 3.7
"""
from typing import Optional, List
from pydantic import BaseModel, ConfigDict, Field
from backend.schemas.assessment import AttemptResponse


class ProgressResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    user_id: str
    goal_id: Optional[str] = None
    completed_skill_ids: List[str] = Field(default_factory=list, description="Skills with is_mastered == True")
    in_progress_skill_ids: List[str] = Field(default_factory=list, description="Active skills under study")
    locked_skill_ids: List[str] = Field(default_factory=list, description="Skills with unfulfilled prerequisites")
    overall_completion_pct: float = Field(ge=0.0, le=100.0, description="Percentage of goal skills mastered")
    average_mastery: float = Field(ge=0.0, le=1.0, description="Mean mastery across active goal skills")
    last_active_at: Optional[str] = None
    recent_attempts: Optional[List[AttemptResponse]] = None
