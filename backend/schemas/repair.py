"""
Local Path Repair Schemas matching /shared/schema.md Sections 2.13 and 3.6
"""
from typing import Optional, List, Dict, Any, Literal
from pydantic import BaseModel, ConfigDict, Field


class PathRepairMetrics(BaseModel):
    touched_node_count: int = Field(ge=0, description="Count of nodes inserted, removed, or reordered")
    total_node_count: int = Field(ge=0, description="Total nodes in the repaired path")
    unchanged_node_count: int = Field(ge=0, description="Count of nodes unaffected by repair")
    repair_ratio: float = Field(ge=0.0, le=1.0, description="touched_node_count / total_node_count")


class ReorderedNodeSchema(BaseModel):
    node_id: str
    skill_id: str
    old_step_order: int
    new_step_order: int


class PathRepairDiff(BaseModel):
    repair_id: str = Field(description="Unique repair identifier (rep_*)")
    path_id: str = Field(description="ID of repaired path")
    previous_version: int
    new_version: int
    trigger_event: Literal["assessment_failed", "assessment_passed", "skill_skipped", "manual_repair"]
    trigger_skill_id: str
    old_path: List[Dict[str, Any]] = Field(description="Full previous path snapshot")
    removed_nodes: List[Dict[str, Any]] = Field(default_factory=list, description="Nodes removed in repair")
    unchanged_nodes: List[Dict[str, Any]] = Field(default_factory=list, description="Nodes preserved")
    inserted_nodes: List[Dict[str, Any]] = Field(default_factory=list, description="Remedial or bridge nodes added")
    reordered_nodes: List[Dict[str, Any]] = Field(default_factory=list, description="Shifted step order nodes")
    new_path: List[Dict[str, Any]] = Field(description="Full new repaired path snapshot")
    metrics: PathRepairMetrics
    explanation: str = Field(description="Grounded explanation for why the path was repaired")
    timestamp: str = Field(description="ISO 8601 repair timestamp")


class PathAdaptRequest(BaseModel):
    user_id: Optional[str] = Field(default=None, description="Learner user ID (defaults to authenticated user)")
    path_id: str = Field(description="Target path ID to adapt")
    trigger_skill_id: str = Field(description="Skill ID causing adaptation")
    reason: Optional[str] = Field(default="learner_requested_review", description="Adaptation trigger reason")
