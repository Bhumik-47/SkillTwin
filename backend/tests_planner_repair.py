"""
Unit and Integration Tests for Learning Path Planning & Local Subgraph Path Repair
"""
import pytest
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker

from backend.db.session import Base
from backend.db.models import (
    User,
    LearnerProfile,
    Skill,
    SkillDependency,
    Resource,
    LearnerSkillState,
    LearningPath,
    generate_id
)
from backend.services.planner_service import PlannerService
from backend.services.repair_service import RepairService


@pytest.fixture
def anyio_backend():
    return 'asyncio'


@pytest.fixture
async def seeded_db():
    engine = create_async_engine("sqlite+aiosqlite:///:memory:", echo=False)
    session_factory = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with session_factory() as session:
        # 1. User & Profile
        user_id = generate_id("usr")
        user = User(id=user_id, email="curriculum_learner@skilltwin.ai", hashed_password="pw", full_name="Jordan Lee")
        profile = LearnerProfile(id=generate_id("prof"), user_id=user_id, target_role="ML Engineer", weekly_hours_budget=10)
        session.add_all([user, profile])

        # 2. Skills: python_basics -> control_flow -> pandas_dataframes -> linear_regression
        skills = [
            Skill(id="python_basics", name="Python Basics", domain="programming", description="Syntax", estimated_duration_minutes=45),
            Skill(id="control_flow", name="Control Flow", domain="programming", description="Loops", estimated_duration_minutes=45),
            Skill(id="pandas_dataframes", name="Pandas", domain="data_science", description="DataFrames", estimated_duration_minutes=60),
            Skill(id="linear_regression", name="Linear Regression", domain="machine_learning", description="ML", estimated_duration_minutes=90),
        ]
        session.add_all(skills)

        # 3. Dependencies
        deps = [
            SkillDependency(source_skill_id="python_basics", target_skill_id="control_flow", dependency_type="hard_prerequisite"),
            SkillDependency(source_skill_id="control_flow", target_skill_id="pandas_dataframes", dependency_type="hard_prerequisite"),
            SkillDependency(source_skill_id="pandas_dataframes", target_skill_id="linear_regression", dependency_type="recommended"),
        ]
        session.add_all(deps)

        # 4. Resources
        resources = [
            Resource(id="res_py_01", skill_id="python_basics", title="Python 101", type="coding_exercise", duration_minutes=30),
            Resource(id="res_ctrl_01", skill_id="control_flow", title="Control Flow Quiz", type="quiz", duration_minutes=30),
            Resource(id="res_pandas_01", skill_id="pandas_dataframes", title="Pandas Tutorial", type="coding_exercise", duration_minutes=45),
            Resource(id="res_linreg_01", skill_id="linear_regression", title="Linear Regression Project", type="project", duration_minutes=60),
        ]
        session.add_all(resources)

        # 5. Prior Mastery: python_basics is already mastered (0.85)
        py_mastery = LearnerSkillState(
            id=generate_id("lss"),
            user_id=user_id,
            skill_id="python_basics",
            mastery_prob=0.85,
            is_mastered=True,
            confidence_score=0.90,
            total_attempts=3
        )
        session.add(py_mastery)

        await session.commit()
        yield session, user_id

    await engine.dispose()


@pytest.mark.asyncio
async def test_path_generation_flow(seeded_db):
    session, user_id = seeded_db

    # Generate path for linear_regression
    response = await PlannerService.generate_learning_path(
        db=session,
        user_id=user_id,
        goal_title="Master ML Foundations",
        target_skill_ids=["linear_regression"],
        weekly_hours_budget=10
    )

    path = response.path
    assert path.status == "active"
    assert path.version == 1
    assert len(path.nodes) == 4

    # Node 1: python_basics should be "completed" because mastery >= 0.80
    assert path.nodes[0].skill_id == "python_basics"
    assert path.nodes[0].status == "completed"
    assert path.nodes[0].mastery_prob == 0.85

    # Node 2: control_flow should be "in_progress" (first unblocked ready node)
    assert path.nodes[1].skill_id == "control_flow"
    assert path.nodes[1].status == "in_progress"
    assert path.nodes[1].prerequisite_skill_ids == ["python_basics"]

    # Nodes 3 and 4 should be "locked" because control_flow is not yet mastered
    assert path.nodes[2].skill_id == "pandas_dataframes"
    assert path.nodes[2].status == "locked"
    assert path.nodes[3].skill_id == "linear_regression"
    assert path.nodes[3].status == "locked"

    # Total duration calculation
    assert path.total_estimated_minutes == 45 + 45 + 60 + 90
    assert response.explanation is not None


@pytest.mark.asyncio
async def test_localized_path_repair_on_failure(seeded_db):
    session, user_id = seeded_db

    # 1. Generate initial path
    init_res = await PlannerService.generate_learning_path(
        db=session,
        user_id=user_id,
        goal_title="Master ML Foundations",
        target_skill_ids=["linear_regression"]
    )
    path_id = init_res.path.id

    # 2. Simulate poor assessment score on control_flow (mastery drops to 0.25)
    ctrl_state = LearnerSkillState(
        id=generate_id("lss"),
        user_id=user_id,
        skill_id="control_flow",
        mastery_prob=0.25,
        is_mastered=False,
        total_attempts=1
    )
    session.add(ctrl_state)
    await session.commit()

    # 3. Trigger localized path adaptation
    repair_diff = await RepairService.adapt_learning_path(
        db=session,
        user_id=user_id,
        path_id=path_id,
        trigger_skill_id="control_flow",
        trigger_event="assessment_failed"
    )

    assert repair_diff.previous_version == 1
    assert repair_diff.new_version == 2
    assert repair_diff.trigger_event == "assessment_failed"
    assert repair_diff.trigger_skill_id == "control_flow"

    # Verify inserted remedial node
    assert len(repair_diff.inserted_nodes) == 1
    remedial_node = repair_diff.inserted_nodes[0]
    assert remedial_node["skill_id"] == "control_flow"
    assert "remedial" in remedial_node["node_id"]

    # Verify touched node metrics
    metrics = repair_diff.metrics
    assert metrics.touched_node_count > 0
    assert metrics.total_node_count == 5  # 4 original + 1 inserted remedial
    assert metrics.repair_ratio > 0.0
    assert metrics.repair_ratio <= 1.0

    # Downstream nodes (pandas and linreg) must remain locked
    new_nodes_by_id = {n["skill_id"]: n for n in repair_diff.new_path}
    assert new_nodes_by_id["pandas_dataframes"]["status"] == "locked"
    assert new_nodes_by_id["linear_regression"]["status"] == "locked"


@pytest.mark.asyncio
async def test_localized_path_repair_on_success(seeded_db):
    session, user_id = seeded_db

    # 1. Generate path
    init_res = await PlannerService.generate_learning_path(
        db=session,
        user_id=user_id,
        goal_title="Master ML Foundations",
        target_skill_ids=["linear_regression"]
    )
    path_id = init_res.path.id

    # 2. Simulate mastery achieved for control_flow (0.88)
    ctrl_state = LearnerSkillState(
        id=generate_id("lss"),
        user_id=user_id,
        skill_id="control_flow",
        mastery_prob=0.88,
        is_mastered=True,
        total_attempts=2
    )
    session.add(ctrl_state)
    await session.commit()

    # 3. Adapt path
    repair_diff = await RepairService.adapt_learning_path(
        db=session,
        user_id=user_id,
        path_id=path_id,
        trigger_skill_id="control_flow",
        trigger_event="assessment_passed"
    )

    assert repair_diff.new_version == 2
    new_nodes_by_skill = {n["skill_id"]: n for n in repair_diff.new_path}

    # control_flow is now completed
    assert new_nodes_by_skill["control_flow"]["status"] == "completed"

    # pandas_dataframes should now be unlocked to ready
    assert new_nodes_by_skill["pandas_dataframes"]["status"] == "ready"

    # linear_regression still locked because pandas is not yet mastered
    assert new_nodes_by_skill["linear_regression"]["status"] == "locked"
