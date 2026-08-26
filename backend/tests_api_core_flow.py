"""
Full End-to-End Integration Test for SkillTwin Core Flow via FastAPI Test Client
Tests the entire lifecycle: Auth -> Skill Graph -> Path Gen -> Assessment -> Path Repair -> Progress -> Recommendations
"""
import pytest
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker

from backend.main import app
from backend.db.session import Base, get_db
from backend.db.models import Skill, SkillDependency, Resource

TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"
test_engine = create_async_engine(TEST_DATABASE_URL, echo=False)
TestSessionLocal = async_sessionmaker(test_engine, class_=AsyncSession, expire_on_commit=False)


async def override_get_db():
    async with TestSessionLocal() as session:
        yield session


@pytest.fixture(autouse=True)
async def setup_test_database():
    app.dependency_overrides[get_db] = override_get_db
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # Seed core skills and dependencies
    async with TestSessionLocal() as session:
        s1 = Skill(id="python_basics", name="Python Basics", domain="programming", description="Syntax", estimated_duration_minutes=45)
        s2 = Skill(id="control_flow", name="Control Flow", domain="programming", description="Loops", estimated_duration_minutes=45)
        s3 = Skill(id="pandas_dataframes", name="Pandas", domain="data_science", description="DataFrames", estimated_duration_minutes=60)
        session.add_all([s1, s2, s3])

        d1 = SkillDependency(source_skill_id="python_basics", target_skill_id="control_flow", dependency_type="hard_prerequisite")
        d2 = SkillDependency(source_skill_id="control_flow", target_skill_id="pandas_dataframes", dependency_type="hard_prerequisite")
        session.add_all([d1, d2])

        r1 = Resource(id="res_ctrl_quiz", skill_id="control_flow", title="Control Flow Quiz", type="quiz", duration_minutes=20)
        session.add(r1)

        await session.commit()

    yield

    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_complete_skilltwin_core_flow():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Step 1: User Signup
        signup_res = await client.post("/auth/signup", json={
            "email": "alex.core@skilltwin.dev",
            "password": "Password123!",
            "full_name": "Alex Core",
            "target_role": "Backend Engineer",
            "weekly_hours_budget": 10,
            "preferred_learning_style": "hands_on",
            "prior_experience_level": "beginner"
        })
        assert signup_res.status_code == 201
        token = signup_res.json()["access_token"]
        user_id = signup_res.json()["user"]["id"]
        headers = {"Authorization": f"Bearer {token}"}

        # Step 2: Query Skill Graph (public & enriched with auth)
        graph_res = await client.get("/skill-graph", headers=headers)
        assert graph_res.status_code == 200
        graph_data = graph_res.json()
        assert len(graph_data["skills"]) == 3
        assert len(graph_data["dependencies"]) == 2

        # Step 3: Generate Learning Path for target 'pandas_dataframes'
        gen_res = await client.post("/learning-path/generate", json={
            "goal_title": "Master Pandas",
            "target_skill_ids": ["pandas_dataframes"],
            "weekly_hours_budget": 10
        }, headers=headers)
        assert gen_res.status_code == 201
        path_data = gen_res.json()["path"]
        path_id = path_data["id"]
        assert len(path_data["nodes"]) == 3
        assert path_data["nodes"][0]["skill_id"] == "python_basics"
        assert path_data["nodes"][1]["skill_id"] == "control_flow"
        assert path_data["nodes"][2]["skill_id"] == "pandas_dataframes"

        # Step 4: Submit Assessment Evidence (Failing score on control_flow)
        assess_res = await client.post("/assessment/submit", json={
            "skill_id": "control_flow",
            "resource_id": "res_ctrl_quiz",
            "evidence_type": "quiz_result",
            "score": 0.25,
            "time_spent_seconds": 90,
            "auto_trigger_repair": True
        }, headers=headers)
        assert assess_res.status_code == 200
        assess_data = assess_res.json()
        assert assess_data["attempt"]["is_correct"] is False
        assert assess_data["skill_state"]["mastery_prob"] < 0.50
        # Auto path repair was triggered
        assert assess_data["repair_diff"] is not None
        assert assess_data["repair_diff"]["previous_version"] == 1
        assert assess_data["repair_diff"]["new_version"] == 2
        assert len(assess_data["repair_diff"]["inserted_nodes"]) == 1

        # Step 5: Direct Path Adaptation
        adapt_res = await client.post("/adapt-path", json={
            "path_id": path_id,
            "trigger_skill_id": "control_flow",
            "reason": "manual_repair"
        }, headers=headers)
        assert adapt_res.status_code == 200
        adapt_data = adapt_res.json()
        assert adapt_data["new_version"] == 3
        assert adapt_data["metrics"]["touched_node_count"] >= 0

        # Step 6: Query Learner Progress
        prog_res = await client.get("/progress", headers=headers)
        assert prog_res.status_code == 200
        prog_data = prog_res.json()
        assert prog_data["user_id"] == user_id
        assert len(prog_data["recent_attempts"]) >= 1

        # Step 7: Query Grounded Recommendations
        rec_res = await client.get("/recommendations?limit=3", headers=headers)
        assert rec_res.status_code == 200
        recs = rec_res.json()["recommendations"]
        assert len(recs) > 0
        assert recs[0]["grounding_metadata"]["bkt_evidence_summary"] is not None

        # Step 8: Multi-Tenant Security Guard (Rejection of Cross-User Access)
        other_user_res = await client.post("/learning-path/generate", json={
            "user_id": "usr_attacker",
            "goal_title": "Hijack",
            "target_skill_ids": ["pandas_dataframes"]
        }, headers=headers)
        assert other_user_res.status_code == 403
