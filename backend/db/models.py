"""
SQLAlchemy 2.0 Database Models for SkillTwin
Strictly adheres to /shared/schema.md as the authoritative Single Source of Truth.
"""
import uuid
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any

from sqlalchemy import (
    Column,
    String,
    Integer,
    Float,
    Boolean,
    DateTime,
    ForeignKey,
    Text,
    JSON,
    Index,
    UniqueConstraint
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from backend.db.session import Base


def generate_id(prefix: str) -> str:
    """Generate deterministic prefixed entity IDs like usr_01a2b3, goal_77f8a9, etc."""
    unique_hex = uuid.uuid4().hex[:8]
    return f"{prefix}_{unique_hex}"


class User(Base):
    """Authenticated user entity."""
    __tablename__ = "users"

    id = Column(String(64), primary_key=True, default=lambda: generate_id("usr"))
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    profile = relationship("LearnerProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    goals = relationship("Goal", back_populates="user", cascade="all, delete-orphan")
    skill_states = relationship("LearnerSkillState", back_populates="user", cascade="all, delete-orphan")
    attempts = relationship("Attempt", back_populates="user", cascade="all, delete-orphan")
    learning_paths = relationship("LearningPath", back_populates="user", cascade="all, delete-orphan")
    recommendations = relationship("Recommendation", back_populates="user", cascade="all, delete-orphan")
    repair_diffs = relationship("PathRepairDiffRecord", back_populates="user", cascade="all, delete-orphan")


class LearnerProfile(Base):
    """Learner preferences, career targets, and study configuration."""
    __tablename__ = "learner_profiles"

    id = Column(String(64), primary_key=True, default=lambda: generate_id("prof"))
    user_id = Column(String(64), ForeignKey("users.id", ondelete="CASCADE"), unique=True, index=True, nullable=False)
    target_role = Column(String(255), default="Backend Engineer", nullable=False)
    weekly_hours_budget = Column(Integer, default=8, nullable=False)
    preferred_learning_style = Column(String(64), default="hands_on", nullable=False)  # hands_on, video, reading, mixed
    prior_experience_level = Column(String(64), default="beginner", nullable=False)  # beginner, intermediate, advanced
    active_goal_id = Column(String(64), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    user = relationship("User", back_populates="profile")


class Goal(Base):
    """A target learning outcome or milestone chosen by the learner."""
    __tablename__ = "goals"

    id = Column(String(64), primary_key=True, default=lambda: generate_id("goal"))
    user_id = Column(String(64), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    title = Column(String(255), nullable=False)
    target_skill_ids = Column(JSON, default=list, nullable=False)  # List of target skill IDs
    target_date = Column(DateTime(timezone=True), nullable=True)
    status = Column(String(64), default="in_progress", nullable=False)  # in_progress, completed, paused, archived
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    user = relationship("User", back_populates="goals")
    learning_paths = relationship("LearningPath", back_populates="goal", cascade="all, delete-orphan")


class Skill(Base):
    """A discrete competency in the domain knowledge graph."""
    __tablename__ = "skills"

    id = Column(String(128), primary_key=True)  # snake_case, e.g. "pandas_dataframes"
    name = Column(String(255), nullable=False)
    domain = Column(String(128), index=True, default="backend_engineering", nullable=False)
    description = Column(Text, nullable=False)
    difficulty = Column(String(64), default="intermediate", nullable=False)  # beginner, intermediate, advanced
    estimated_duration_minutes = Column(Integer, default=60, nullable=False)
    resource_ids = Column(JSON, default=list, nullable=False)  # Associated resource IDs
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    resources = relationship("Resource", back_populates="skill", cascade="all, delete-orphan")
    learner_states = relationship("LearnerSkillState", back_populates="skill", cascade="all, delete-orphan")


class SkillDependency(Base):
    """Directed prerequisite edge in the DAG (source -> target)."""
    __tablename__ = "skill_dependencies"

    id = Column(Integer, primary_key=True, autoincrement=True)
    source_skill_id = Column(String(128), ForeignKey("skills.id", ondelete="CASCADE"), index=True, nullable=False)
    target_skill_id = Column(String(128), ForeignKey("skills.id", ondelete="CASCADE"), index=True, nullable=False)
    dependency_type = Column(String(64), default="hard_prerequisite", nullable=False)  # hard_prerequisite, soft_prerequisite, recommended
    weight = Column(Float, default=1.0, nullable=False)

    __table_args__ = (
        UniqueConstraint("source_skill_id", "target_skill_id", name="uq_skill_dependency"),
    )


class Resource(Base):
    """A curated learning asset or assessment item."""
    __tablename__ = "resources"

    id = Column(String(128), primary_key=True)  # e.g. "res_py_basics_01"
    skill_id = Column(String(128), ForeignKey("skills.id", ondelete="CASCADE"), index=True, nullable=False)
    title = Column(String(255), nullable=False)
    type = Column(String(64), nullable=False)  # quiz, coding_exercise, video, article, project
    url = Column(String(512), nullable=True)
    duration_minutes = Column(Integer, default=30, nullable=False)
    difficulty = Column(String(64), default="intermediate", nullable=False)
    content_payload = Column(JSON, nullable=True)  # questions, test cases, code snippets

    # Relationships
    skill = relationship("Skill", back_populates="resources")


class LearnerSkillState(Base):
    """Latent mastery state tracked via Bayesian Knowledge Tracing (BKT)."""
    __tablename__ = "learner_skill_states"

    id = Column(String(64), primary_key=True, default=lambda: generate_id("lss"))
    user_id = Column(String(64), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    skill_id = Column(String(128), ForeignKey("skills.id", ondelete="CASCADE"), index=True, nullable=False)
    mastery_prob = Column(Float, default=0.10, nullable=False)  # Posterior P(L)
    bkt_p_transit = Column(Float, default=0.15, nullable=False)  # P(T)
    bkt_p_slip = Column(Float, default=0.10, nullable=False)     # P(S)
    bkt_p_guess = Column(Float, default=0.20, nullable=False)    # P(G)
    confidence_score = Column(Float, default=0.0, nullable=False)
    is_mastered = Column(Boolean, default=False, nullable=False)
    source = Column(String(64), default="self_report", nullable=False)  # verified, self_report, resume, github
    evidence_snippet = Column(Text, nullable=True)  # Quote from resume/code repo supporting the estimate
    total_attempts = Column(Integer, default=0, nullable=False)
    successful_attempts = Column(Integer, default=0, nullable=False)
    last_assessed_at = Column(DateTime(timezone=True), nullable=True)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    __table_args__ = (
        UniqueConstraint("user_id", "skill_id", name="uq_user_skill_state"),
    )

    # Relationships
    user = relationship("User", back_populates="skill_states")
    skill = relationship("Skill", back_populates="learner_states")


class Attempt(Base):
    """An individual quiz, project, or exercise result evaluated by the system."""
    __tablename__ = "attempts"

    id = Column(String(64), primary_key=True, default=lambda: generate_id("att"))
    user_id = Column(String(64), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    skill_id = Column(String(128), ForeignKey("skills.id", ondelete="CASCADE"), index=True, nullable=False)
    resource_id = Column(String(128), ForeignKey("resources.id", ondelete="SET NULL"), nullable=True)
    attempt_type = Column(String(64), default="quiz", nullable=False)  # quiz, project, exercise
    score = Column(Float, nullable=False)  # 0.0 - 1.0
    is_correct = Column(Boolean, nullable=False)
    time_spent_seconds = Column(Integer, nullable=True)
    response_payload = Column(JSON, nullable=True)
    prior_mastery_prob = Column(Float, nullable=False)
    posterior_mastery_prob = Column(Float, nullable=False)
    timestamp = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), index=True, nullable=False)

    # Relationships
    user = relationship("User", back_populates="attempts")


class LearningPath(Base):
    """A versioned topological learning sequence to achieve a Goal."""
    __tablename__ = "learning_paths"

    id = Column(String(64), primary_key=True, default=lambda: generate_id("path"))
    user_id = Column(String(64), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    goal_id = Column(String(64), ForeignKey("goals.id", ondelete="CASCADE"), index=True, nullable=False)
    version = Column(Integer, default=1, nullable=False)
    nodes = Column(JSON, nullable=False)  # Ordered array of LearningPathNode objects
    total_estimated_minutes = Column(Integer, default=0, nullable=False)
    status = Column(String(64), default="active", nullable=False)  # active, completed, superseded
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    user = relationship("User", back_populates="learning_paths")
    goal = relationship("Goal", back_populates="learning_paths")
    repair_diffs = relationship("PathRepairDiffRecord", back_populates="path", cascade="all, delete-orphan")


class PathRepairDiffRecord(Base):
    """Historical audit log of local path repair events."""
    __tablename__ = "path_repair_diffs"

    id = Column(String(64), primary_key=True, default=lambda: generate_id("rep"))
    path_id = Column(String(64), ForeignKey("learning_paths.id", ondelete="CASCADE"), index=True, nullable=False)
    user_id = Column(String(64), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    trigger_skill_id = Column(String(128), ForeignKey("skills.id", ondelete="SET NULL"), nullable=True)
    previous_version = Column(Integer, nullable=False)
    new_version = Column(Integer, nullable=False)
    old_path = Column(JSON, nullable=False)
    new_path = Column(JSON, nullable=False)
    removed_nodes = Column(JSON, default=list, nullable=False)
    unchanged_nodes = Column(JSON, default=list, nullable=False)
    inserted_nodes = Column(JSON, default=list, nullable=False)
    reordered_nodes = Column(JSON, default=list, nullable=False)
    metrics = Column(JSON, nullable=False)  # touched_node_count, total_node_count, repair_ratio, etc.
    explanation = Column(Text, nullable=False)
    timestamp = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    user = relationship("User", back_populates="repair_diffs")
    path = relationship("LearningPath", back_populates="repair_diffs")


class Recommendation(Base):
    """Next-best action recommendation grounded in verifiable metrics."""
    __tablename__ = "recommendations"

    id = Column(String(64), primary_key=True, default=lambda: generate_id("rec"))
    user_id = Column(String(64), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    next_skill_id = Column(String(128), ForeignKey("skills.id", ondelete="CASCADE"), nullable=False)
    resource_id = Column(String(128), ForeignKey("resources.id", ondelete="SET NULL"), nullable=True)
    action_type = Column(String(64), default="learn", nullable=False)  # learn, reinforce, assess, skip
    grounded_explanation = Column(Text, nullable=False)
    reason = Column(String(512), nullable=True)  # Plain-language grounded one-sentence reason
    grounding_metadata = Column(JSON, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    user = relationship("User", back_populates="recommendations")


class ProgressRecord(Base):
    """Persistent snapshot of learner progress against an active goal."""
    __tablename__ = "progress_records"

    id = Column(String(64), primary_key=True, default=lambda: generate_id("prog"))
    user_id = Column(String(64), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    goal_id = Column(String(64), ForeignKey("goals.id", ondelete="CASCADE"), index=True, nullable=False)
    completed_skill_ids = Column(JSON, default=list, nullable=False)
    in_progress_skill_ids = Column(JSON, default=list, nullable=False)
    locked_skill_ids = Column(JSON, default=list, nullable=False)
    overall_completion_pct = Column(Float, default=0.0, nullable=False)
    average_mastery = Column(Float, default=0.0, nullable=False)
    last_active_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)


class SkillProgressSnapshot(Base):
    """Timestamped historical snapshot for LeetCode-contest-style progress curve."""
    __tablename__ = "skill_progress_snapshots"

    id = Column(String(64), primary_key=True, default=lambda: generate_id("snap"))
    user_id = Column(String(64), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    date = Column(String(32), nullable=False)  # YYYY-MM-DD or session label
    overall_mastery_pct = Column(Float, default=0.0, nullable=False)  # 0.0 - 100.0
    skills_mastered_count = Column(Integer, default=0, nullable=False)
    total_skills_count = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

