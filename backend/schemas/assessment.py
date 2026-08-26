"""
Assessment & Evidence Submission Schemas matching /shared/schema.md Sections 2.8, 2.14, and 3.5
"""
from typing import Optional, Dict, Any, Literal
from pydantic import BaseModel, ConfigDict, Field
from backend.schemas.repair import PathRepairDiff


class AssessmentSubmitRequest(BaseModel):
    user_id: Optional[str] = Field(default=None, description="Learner ID (defaults to authenticated user)")
    skill_id: str = Field(description="Target skill ID being evaluated")
    resource_id: Optional[str] = Field(default=None, description="Optional assessment resource ID")
    evidence_type: str = Field(
        default="quiz_result",
        description="Type of evidence: quiz_result, code_submission, project_eval, quiz, exercise"
    )
    score: float = Field(ge=0.0, le=1.0, description="Normalized score between 0.0 and 1.0")
    time_spent_seconds: Optional[int] = Field(default=None, ge=0)
    answers: Optional[Dict[str, Any]] = Field(default=None, description="Answers or code submission payload")
    auto_trigger_repair: Optional[bool] = Field(default=True, description="Automatically adapt active path if mastery changed")


class AttemptResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    user_id: str
    skill_id: str
    resource_id: Optional[str] = None
    attempt_type: str
    score: float
    is_correct: bool
    time_spent_seconds: Optional[int] = None
    prior_mastery_prob: float
    posterior_mastery_prob: float
    timestamp: str


class LearnerSkillStateResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    user_id: str
    skill_id: str
    mastery_prob: float
    bkt_p_transit: float
    bkt_p_slip: float
    bkt_p_guess: float
    confidence_score: float
    is_mastered: bool
    total_attempts: int
    successful_attempts: int
    last_assessed_at: Optional[str] = None


class AssessmentSubmitResponse(BaseModel):
    attempt: AttemptResponse
    skill_state: LearnerSkillStateResponse
    repair_diff: Optional[PathRepairDiff] = Field(
        default=None,
        description="Path adaptation diff if repair was triggered"
    )
