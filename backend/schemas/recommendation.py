"""
Recommendations & Grounded Action Schemas matching /shared/schema.md Sections 2.12 and 3.8
"""
from typing import Optional, List, Literal
from pydantic import BaseModel, ConfigDict, Field


class GroundingMetadata(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    current_mastery_prob: float = Field(ge=0.0, le=1.0, description="Current skill mastery probability")
    prerequisite_skills_mastered: List[str] = Field(default_factory=list, description="Mastered prerequisite IDs")
    target_goal_relevance_score: float = Field(ge=0.0, le=1.0, description="Goal relevance metric")
    bkt_evidence_summary: str = Field(description="Deterministic summary of BKT evidence")


class RecommendationItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str = Field(description="Unique recommendation ID (rec_*)")
    user_id: str
    next_skill_id: str = Field(description="Recommended next skill to study or practice")
    resource_id: Optional[str] = Field(default=None, description="Recommended learning resource")
    action_type: Literal["learn", "reinforce", "assess", "skip"] = "learn"
    grounded_explanation: str = Field(description="LLM explanation strictly grounded in verifiable system values")
    grounding_metadata: GroundingMetadata
    created_at: str


class RecommendationResponse(BaseModel):
    recommendations: List[RecommendationItem]
