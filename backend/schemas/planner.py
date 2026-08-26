"""
Learning Path Planning Schemas matching /shared/schema.md Sections 2.10, 2.11, and 3.4
"""
from typing import Optional, List, Literal, Any, Dict
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class LearningPathNodeSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    node_id: str = Field(description="Unique node identifier in path (e.g. node_py_basics)")
    step_order: int = Field(ge=1, description="Sequential execution order (1-indexed)")
    skill_id: str = Field(description="Skill ID corresponding to graph node")
    skill_name: str = Field(description="Human-readable skill title")
    recommended_resource_id: Optional[str] = Field(default=None, description="Primary recommended resource")
    status: Literal["completed", "in_progress", "ready", "locked"] = Field(
        default="ready",
        description="Execution status based on mastery and prerequisites"
    )
    mastery_prob: float = Field(default=0.0, ge=0.0, le=1.0, description="Current mastery probability")
    prerequisite_skill_ids: List[str] = Field(default_factory=list, description="Direct prerequisite skill IDs")
    estimated_minutes: int = Field(default=45, ge=1, description="Estimated time to complete node")


class LearningPathGenerateRequest(BaseModel):
    user_id: Optional[str] = Field(default=None, description="Learner ID (defaults to authenticated user)")
    goal_title: str = Field(default="Master SkillTwin Curriculum", min_length=1)
    target_skill_ids: List[str] = Field(min_length=1, description="Target end skill IDs required for goal")
    weekly_hours_budget: Optional[int] = Field(default=10, ge=1, le=100)


class LearningPathSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    user_id: str
    goal_id: str
    version: int = 1
    total_estimated_minutes: int = 0
    status: str = "active"
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
    nodes: List[LearningPathNodeSchema]


class LearningPathResponse(BaseModel):
    path: LearningPathSchema
    explanation: Optional[str] = Field(
        default=None,
        description="Grounded explanation of generated sequence"
    )
