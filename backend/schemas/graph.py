"""
Skill Graph Schemas matching /shared/schema.md Section 3.3
"""
from typing import Optional, List, Literal
from pydantic import BaseModel, ConfigDict, Field


class LearnerStateSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    mastery_prob: float = Field(ge=0.0, le=1.0, description="Posterior mastery probability")
    is_mastered: bool = Field(description="True if mastery_prob >= 0.80")
    confidence_score: float = Field(ge=0.0, le=1.0, description="Confidence in estimate")
    total_attempts: int = Field(ge=0, description="Count of attempts on this skill")


class SkillItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str = Field(description="Unique snake_case skill identifier")
    name: str = Field(description="Human readable skill name")
    domain: str = Field(default="backend_engineering", description="Knowledge domain")
    description: str = Field(default="", description="Skill description")
    difficulty: Literal["beginner", "intermediate", "advanced"] = "intermediate"
    estimated_duration_minutes: int = Field(default=60, ge=1)
    resource_ids: List[str] = Field(default_factory=list)
    learner_state: Optional[LearnerStateSummary] = Field(
        default=None,
        description="Enriched learner mastery state if authenticated"
    )


class SkillDependencyItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    source_skill_id: str = Field(description="Prerequisite skill ID")
    target_skill_id: str = Field(description="Dependent skill ID")
    dependency_type: Literal["hard_prerequisite", "soft_prerequisite", "recommended"] = "hard_prerequisite"
    weight: float = Field(default=1.0, ge=0.0, le=1.0)


class SkillGraphResponse(BaseModel):
    skills: List[SkillItem]
    dependencies: List[SkillDependencyItem]
