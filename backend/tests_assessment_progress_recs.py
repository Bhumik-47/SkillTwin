"""
Unit and Integration Tests for Assessments, Progress Analytics, and Recommendations
"""
import pytest
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker

from backend.db.session import Base
from backend.db.models import (
    User,
    LearnerProfile,
    Goal,
    Skill,
    SkillDependency,
    Resource,
    LearnerSkillState,
    LearningPath,
    generate_id
)
from backend.schemas.assessment import AssessmentSubmitRequest
from backend.services.assessment_service import AssessmentService
from backend.services.progress_service import ProgressService
from backend.services.recommendation_service import RecommendationService
from backend.services.planner_service import PlannerService


@pytest.fixture
def anyio_backend():
    return 'asyncio'


@pytest.fixture
async def setup_env():
    engine = create_async_engine("sqlite+aiosqlite:///:memory:", echo=False)
    session_factory = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with session_factory() as session:
        # Users A and B
        u_a = User(id="usr_alice", email="alice@test.com", hashed_password="pw", full_name="Alice A")
        prof_a = LearnerProfile(id="prof_alice", user_id="usr_alice", target_role="Backend Dev", weekly_hours_budget=10)
        
        u_b = User(id="usr_bob", email="bob@test.com", hashed_password="pw", full_name="Bob B")
        prof_b = LearnerProfile(id="prof_bob", user_id="usr_bob", target_role="Data Engineer", weekly_hours_budget=8)
        session.add_all([u_a, prof_a, u_b, prof_b])

        # Skills & Dependencies
        s1 = Skill(id="py_basics", name="Python Basics", domain="programming", description="Syntax")
        s2 = Skill(id="sql_basics", name="SQL Basics", domain="databases", description="Queries")
        session.add_all([s1, s2])

        r1 = Resource(id="res_py_quiz", skill_id="py_basics", title="Python Quiz", type="quiz", duration_minutes=15)
        session.add(r1)

        await session.commit()
        yield session

    await engine.dispose()


@pytest.mark.asyncio
async def test_assessment_bkt_update_flow(setup_env: AsyncSession):
    session = setup_env

    # Initial submit: perfect score
    req = AssessmentSubmitRequest(
        user_id="usr_alice",
        skill_id="py_basics",
        resource_id="res_py_quiz",
        evidence_type="quiz_result",
        score=1.0,
        time_spent_seconds=60,
        auto_trigger_repair=False
    )
    res = await AssessmentService.submit_assessment(session, "usr_alice", req)

    assert res.attempt.is_correct is True
    assert res.attempt.score == 1.0
    assert res.skill_state.mastery_prob > 0.10  # Increased from default prior
    assert res.skill_state.total_attempts == 1
    assert res.skill_state.successful_attempts == 1

    # Second submit: failure
    req_fail = AssessmentSubmitRequest(
        user_id="usr_alice",
        skill_id="py_basics",
        resource_id="res_py_quiz",
        evidence_type="quiz_result",
        score=0.20,
        time_spent_seconds=90,
        auto_trigger_repair=False
    )
    res2 = await AssessmentService.submit_assessment(session, "usr_alice", req_fail)

    assert res2.attempt.is_correct is False
    assert res2.skill_state.total_attempts == 2
    assert res2.skill_state.successful_attempts == 1
    # Mastery after incorrect response is lower than after first correct attempt
    assert res2.skill_state.mastery_prob < res.skill_state.mastery_prob


@pytest.mark.asyncio
async def test_progress_tracking_and_isolation(setup_env: AsyncSession):
    session = setup_env

    # Alice has mastered py_basics
    alice_state = LearnerSkillState(
        id=generate_id("lss"),
        user_id="usr_alice",
        skill_id="py_basics",
        mastery_prob=0.90,
        is_mastered=True,
        total_attempts=2,
        successful_attempts=2
    )
    session.add(alice_state)
    await session.commit()

    # Progress for Alice
    prog_a = await ProgressService.get_learner_progress(session, "usr_alice")
    assert "py_basics" in prog_a.completed_skill_ids
    assert prog_a.overall_completion_pct > 0.0

    # Progress for Bob (should be empty, no cross-user pollution)
    prog_b = await ProgressService.get_learner_progress(session, "usr_bob")
    assert "py_basics" not in prog_b.completed_skill_ids
    assert prog_b.overall_completion_pct == 0.0


@pytest.mark.asyncio
async def test_recommendations_generation(setup_env: AsyncSession):
    session = setup_env

    recs_res = await RecommendationService.get_recommendations(session, "usr_alice", limit=2)
    assert len(recs_res.recommendations) > 0
    
    rec = recs_res.recommendations[0]
    assert rec.user_id == "usr_alice"
    assert rec.action_type in ["learn", "reinforce", "assess", "skip"]
    assert rec.grounded_explanation is not None
    assert rec.grounding_metadata is not None
    assert rec.grounding_metadata.bkt_evidence_summary is not None
