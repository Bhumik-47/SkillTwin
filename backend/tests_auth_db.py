"""
Unit and Integration Tests for Database Models and Auth Module
"""
import pytest
import asyncio
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy import select

from backend.db.session import Base
from backend.db.models import (
    User,
    LearnerProfile,
    Goal,
    Skill,
    SkillDependency,
    Resource,
    LearnerSkillState,
    Attempt,
    LearningPath,
    PathRepairDiffRecord,
    Recommendation,
    ProgressRecord,
    generate_id
)
from backend.auth.security import get_password_hash, verify_password
from backend.auth.jwt import create_access_token, decode_access_token


@pytest.fixture
def anyio_backend():
    return 'asyncio'


@pytest.mark.asyncio
async def test_password_hashing():
    raw_pass = "SuperSecret123!"
    hashed = get_password_hash(raw_pass)
    assert hashed != raw_pass
    assert verify_password(raw_pass, hashed) is True
    assert verify_password("WrongPassword", hashed) is False


@pytest.mark.asyncio
async def test_jwt_token_flow():
    user_id = "usr_test123"
    email = "tester@skilltwin.dev"
    token = create_access_token({"sub": user_id, "email": email})
    assert isinstance(token, str)
    assert len(token) > 20

    payload = decode_access_token(token)
    assert payload is not None
    assert payload["sub"] == user_id
    assert payload["email"] == email
    assert "exp" in payload


@pytest.mark.asyncio
async def test_database_models_lifecycle():
    # Setup in-memory SQLite database
    engine = create_async_engine("sqlite+aiosqlite:///:memory:", echo=False)
    async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with async_session() as session:
        # 1. Create User
        user_id = generate_id("usr")
        user = User(
            id=user_id,
            email="alex@skilltwin.ai",
            hashed_password=get_password_hash("securepass123"),
            full_name="Alex Chen",
            is_active=True
        )
        session.add(user)

        # 2. Create LearnerProfile
        profile = LearnerProfile(
            id=generate_id("prof"),
            user_id=user_id,
            target_role="ML Engineer",
            weekly_hours_budget=10,
            preferred_learning_style="hands_on",
            prior_experience_level="intermediate"
        )
        session.add(profile)

        # 3. Create Skills
        py_skill = Skill(
            id="python_basics",
            name="Python Programming Fundamentals",
            domain="programming",
            description="Core syntax, control flow, functions",
            difficulty="beginner",
            estimated_duration_minutes=60,
            resource_ids=["res_py_01"]
        )
        pandas_skill = Skill(
            id="pandas_dataframes",
            name="Pandas DataFrames",
            domain="data_science",
            description="Tabular data manipulation",
            difficulty="intermediate",
            estimated_duration_minutes=90,
            resource_ids=["res_pandas_01"]
        )
        session.add_all([py_skill, pandas_skill])

        # 4. Create Prerequisite Dependency
        dep = SkillDependency(
            source_skill_id="python_basics",
            target_skill_id="pandas_dataframes",
            dependency_type="hard_prerequisite",
            weight=1.0
        )
        session.add(dep)

        # 5. Create Resource
        res = Resource(
            id="res_py_01",
            skill_id="python_basics",
            title="Python Basics Interactive Quiz",
            type="quiz",
            duration_minutes=20,
            difficulty="beginner"
        )
        session.add(res)

        # 6. Create Goal
        goal = Goal(
            id=generate_id("goal"),
            user_id=user_id,
            title="Master Data Science",
            target_skill_ids=["pandas_dataframes"],
            status="in_progress"
        )
        session.add(goal)

        # 7. Create LearnerSkillState (BKT)
        bkt_state = LearnerSkillState(
            id=generate_id("lss"),
            user_id=user_id,
            skill_id="python_basics",
            mastery_prob=0.85,
            bkt_p_transit=0.15,
            bkt_p_slip=0.10,
            bkt_p_guess=0.20,
            confidence_score=0.92,
            is_mastered=True,
            total_attempts=3,
            successful_attempts=3
        )
        session.add(bkt_state)

        # 8. Create Attempt
        att = Attempt(
            id=generate_id("att"),
            user_id=user_id,
            skill_id="python_basics",
            resource_id="res_py_01",
            attempt_type="quiz",
            score=1.0,
            is_correct=True,
            time_spent_seconds=120,
            prior_mastery_prob=0.65,
            posterior_mastery_prob=0.85
        )
        session.add(att)

        # 9. Create LearningPath
        path = LearningPath(
            id=generate_id("path"),
            user_id=user_id,
            goal_id=goal.id,
            version=1,
            nodes=[
                {"node_id": "node_py", "step_order": 1, "skill_id": "python_basics", "status": "completed"},
                {"node_id": "node_pandas", "step_order": 2, "skill_id": "pandas_dataframes", "status": "ready"}
            ],
            total_estimated_minutes=150,
            status="active"
        )
        session.add(path)

        # 10. Create PathRepairDiffRecord
        diff = PathRepairDiffRecord(
            id=generate_id("rep"),
            path_id=path.id,
            user_id=user_id,
            trigger_skill_id="python_basics",
            previous_version=1,
            new_version=2,
            old_path=[{"skill_id": "python_basics"}],
            new_path=[{"skill_id": "python_basics"}, {"skill_id": "pandas_dataframes"}],
            removed_nodes=[],
            unchanged_nodes=[{"skill_id": "python_basics"}],
            inserted_nodes=[{"skill_id": "pandas_dataframes"}],
            reordered_nodes=[],
            metrics={"touched_node_count": 1, "total_node_count": 2, "repair_ratio": 0.5},
            explanation="Unlocked Pandas DataFrames following verified mastery of Python Basics."
        )
        session.add(diff)

        # 11. Create Recommendation
        rec = Recommendation(
            id=generate_id("rec"),
            user_id=user_id,
            next_skill_id="pandas_dataframes",
            resource_id="res_pandas_01",
            action_type="learn",
            grounded_explanation="You mastered Python Basics with 0.85 mastery. Pandas is your next unblocked step.",
            grounding_metadata={"current_mastery_prob": 0.85, "prerequisite_skills_mastered": ["python_basics"]}
        )
        session.add(rec)

        await session.commit()

        # Query & Verify Relations
        fetched_user = await session.get(User, user_id)
        assert fetched_user is not None
        assert fetched_user.email == "alex@skilltwin.ai"
        assert fetched_user.full_name == "Alex Chen"

        # Verify BKT State
        stmt = select(LearnerSkillState).where(LearnerSkillState.user_id == user_id)
        res = await session.execute(stmt)
        state = res.scalar_one()
        assert state.mastery_prob == 0.85
        assert state.is_mastered is True

    await engine.dispose()
