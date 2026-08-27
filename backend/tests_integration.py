"""
End-to-End Integration Tests for SkillTwin
Covers complete flow: Auth -> Goal Analysis -> Path Generation -> Quiz Assessment -> BKT Update -> Local Repair Diff -> Recommendations -> Progress.
"""
import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker

from backend.main import app
from backend.db.session import Base, get_db

TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"
test_engine = create_async_engine(TEST_DATABASE_URL, echo=False)
TestSessionLocal = async_sessionmaker(test_engine, class_=AsyncSession, expire_on_commit=False)


async def override_get_db():
    async with TestSessionLocal() as session:
        yield session


@pytest_asyncio.fixture(autouse=True)
async def prepare_database():
    app.dependency_overrides[get_db] = override_get_db
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    app.dependency_overrides.pop(get_db, None)


@pytest.mark.asyncio
async def test_full_skilltwin_lifecycle():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Health and Meta Check
        health_res = await client.get("/health")
        assert health_res.status_code == 200
        assert health_res.json()["status"] == "healthy"

        root_res = await client.get("/")
        assert root_res.status_code == 200
        assert "domains" in root_res.json()

        # 2. Signup Learner
        signup_res = await client.post("/auth/signup", json={
            "email": "e2e_learner@skilltwin.dev",
            "password": "SecurePassword2026!",
            "full_name": "Taylor Alex",
            "target_role": "Backend Engineer",
            "weekly_hours_budget": 10,
            "preferred_learning_style": "hands_on",
            "prior_experience_level": "beginner"
        })
        assert signup_res.status_code == 201
        user_data = signup_res.json()
        user_id = user_data["user"]["id"]
        token = user_data["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 3. Analyze Learner Goal with AI Agent
        goal_prompt = "I want to master Python fundamentals including functions, decorators, and data structures in 12 hours a week."
        goal_res = await client.post("/goals/analyze", json={
            "prompt": goal_prompt,
            "domain": "python_fundamentals"
        })
        assert goal_res.status_code == 200
        goal_data = goal_res.json()
        assert goal_data["domain"] == "python_fundamentals"
        assert len(goal_data["target_skill_ids"]) > 0

        # 4. Generate Topological Learning Path
        gen_res = await client.post("/learning-path/generate", json={
            "user_id": user_id,
            "domain": "python_fundamentals",
            "target_skill_ids": goal_data["target_skill_ids"],
            "weekly_hours_budget": 12
        })
        assert gen_res.status_code == 201
        path_data = gen_res.json()
        assert path_data["user_id"] == user_id
        assert len(path_data["nodes"]) > 0
        path_id = path_data["id"]
        assert path_data["version"] == 1

        # 5. Query Domain Skill Graph
        graph_res = await client.get("/skill-graph?domain=python_fundamentals")
        assert graph_res.status_code == 200
        graph_data = graph_res.json()
        assert len(graph_data["skills"]) >= 15
        assert len(graph_data["dependencies"]) >= 15

        # 6. Submit Assessment with Failure (score 0.30) -> Triggers BKT Update & Auto Path Repair
        quiz_submit_res = await client.post("/assessments/submit", json={
            "user_id": user_id,
            "skill_id": "py_control_flow",
            "resource_id": "res_py_control_flow_02",
            "attempt_type": "quiz",
            "score": 0.30,
            "time_spent_seconds": 240
        })
        assert quiz_submit_res.status_code == 200
        quiz_data = quiz_submit_res.json()
        assert quiz_data["is_correct"] is False
        assert quiz_data["bkt_transition"]["posterior_mastery_prob"] < 0.50
        assert quiz_data["path_adapted"] is True

        repair_diff = quiz_data["path_repair_diff"]
        assert repair_diff is not None
        assert len(repair_diff["inserted_nodes"]) >= 1
        assert repair_diff["metrics"]["touched_node_count"] > 0
        assert "explanation" in repair_diff

        # 7. Submit Passing Assessment (score 0.95)
        pass_res = await client.post("/assessments/submit", json={
            "user_id": user_id,
            "skill_id": "py_syntax_vars",
            "resource_id": "res_py_syntax_vars_02",
            "attempt_type": "quiz",
            "score": 0.95,
            "time_spent_seconds": 120
        })
        assert pass_res.status_code == 200
        pass_data = pass_res.json()
        assert pass_data["is_correct"] is True
        assert pass_data["bkt_transition"]["posterior_mastery_prob"] > 0.40

        # 8. Query Next-Best Recommendations
        rec_res = await client.get(f"/recommendations?user_id={user_id}&domain=python_fundamentals&limit=3")
        assert rec_res.status_code == 200
        recs = rec_res.json()["recommendations"]
        assert len(recs) > 0
        for r in recs:
            assert "grounded_explanation" in r
            assert "grounding_metadata" in r

        # 9. Query Progress Telemetry
        prog_res = await client.get(f"/progress?user_id={user_id}")
        assert prog_res.status_code == 200
        prog = prog_res.json()
        assert "overall_completion_pct" in prog
        assert "average_mastery" in prog
