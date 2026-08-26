"""
Unit and Integration Tests for Skill Graph and DAG Validation
"""
import pytest
import networkx as nx
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker

from backend.db.session import Base
from backend.db.models import Skill, SkillDependency, LearnerSkillState, User, generate_id
from backend.services.graph_service import GraphService


@pytest.fixture
def anyio_backend():
    return 'asyncio'


@pytest.fixture
async def async_db():
    engine = create_async_engine("sqlite+aiosqlite:///:memory:", echo=False)
    session_factory = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    async with session_factory() as session:
        yield session
    await engine.dispose()


@pytest.mark.asyncio
async def test_valid_dag_construction(async_db: AsyncSession):
    # Seed skills
    s1 = Skill(id="py_basics", name="Python Basics", domain="programming", description="Syntax")
    s2 = Skill(id="ctrl_flow", name="Control Flow", domain="programming", description="Loops")
    s3 = Skill(id="pandas_df", name="Pandas", domain="data_science", description="DataFrames")
    async_db.add_all([s1, s2, s3])

    # Seed dependencies: py_basics -> ctrl_flow -> pandas_df
    d1 = SkillDependency(source_skill_id="py_basics", target_skill_id="ctrl_flow", dependency_type="hard_prerequisite")
    d2 = SkillDependency(source_skill_id="ctrl_flow", target_skill_id="pandas_df", dependency_type="hard_prerequisite")
    async_db.add_all([d1, d2])
    await async_db.commit()

    # Retrieve graph
    graph_res = await GraphService.get_skill_graph(async_db)
    assert len(graph_res.skills) == 3
    assert len(graph_res.dependencies) == 2

    # Check NetworkX DAG properties
    G = GraphService.build_networkx_dag([s1, s2, s3], [d1, d2])
    assert nx.is_directed_acyclic_graph(G)
    topo = list(nx.topological_sort(G))
    assert topo == ["py_basics", "ctrl_flow", "pandas_df"]


@pytest.mark.asyncio
async def test_cycle_detection():
    # Construct circular dependency: A -> B -> C -> A
    s1 = Skill(id="a", name="A", domain="test", description="")
    s2 = Skill(id="b", name="B", domain="test", description="")
    s3 = Skill(id="c", name="C", domain="test", description="")
    d1 = SkillDependency(source_skill_id="a", target_skill_id="b")
    d2 = SkillDependency(source_skill_id="b", target_skill_id="c")
    d3 = SkillDependency(source_skill_id="c", target_skill_id="a")

    with pytest.raises(ValueError) as excinfo:
        GraphService.build_networkx_dag([s1, s2, s3], [d1, d2, d3])
    assert "circular prerequisite cycle" in str(excinfo.value)


@pytest.mark.asyncio
async def test_learner_state_enrichment(async_db: AsyncSession):
    # Create User
    user_id = generate_id("usr")
    user = User(id=user_id, email="alex@test.com", hashed_password="pw", full_name="Alex Chen")
    async_db.add(user)

    # Create Skill
    s1 = Skill(id="py_basics", name="Python Basics", domain="programming", description="Syntax")
    async_db.add(s1)

    # Create BKT State
    state = LearnerSkillState(
        id=generate_id("lss"),
        user_id=user_id,
        skill_id="py_basics",
        mastery_prob=0.85,
        confidence_score=0.92,
        is_mastered=True,
        total_attempts=4
    )
    async_db.add(state)
    await async_db.commit()

    # Query with learner state
    graph_res = await GraphService.get_skill_graph(async_db, user_id=user_id, include_learner_state=True)
    skill_item = next(s for s in graph_res.skills if s.id == "py_basics")
    assert skill_item.learner_state is not None
    assert skill_item.learner_state.mastery_prob == 0.85
    assert skill_item.learner_state.is_mastered is True
    assert skill_item.learner_state.confidence_score == 0.92
    assert skill_item.learner_state.total_attempts == 4
