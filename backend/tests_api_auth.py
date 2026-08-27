"""
Integration Tests for FastAPI Auth & Profile Endpoints
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
async def test_auth_and_profile_flow():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Health check
        res = await client.get("/health")
        assert res.status_code == 200
        assert res.json() == {"status": "healthy"}

        # 2. Signup User
        signup_payload = {
            "email": "learner@skilltwin.dev",
            "password": "Password123!",
            "full_name": "Jordan Lee",
            "target_role": "Backend Engineer",
            "weekly_hours_budget": 12,
            "preferred_learning_style": "hands_on",
            "prior_experience_level": "beginner"
        }
        signup_res = await client.post("/auth/signup", json=signup_payload)
        assert signup_res.status_code == 201
        data = signup_res.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert data["user"]["email"] == "learner@skilltwin.dev"
        assert data["user"]["full_name"] == "Jordan Lee"
        assert data["user"]["profile"]["target_role"] == "Backend Engineer"
        token = data["access_token"]

        # 3. Duplicate Signup prevention
        dup_res = await client.post("/auth/signup", json=signup_payload)
        assert dup_res.status_code == 400

        # 4. Login with correct credentials
        login_res = await client.post("/auth/login", json={
            "email": "learner@skilltwin.dev",
            "password": "Password123!"
        })
        assert login_res.status_code == 200
        assert "access_token" in login_res.json()

        # 5. Login with invalid password
        bad_login = await client.post("/auth/login", json={
            "email": "learner@skilltwin.dev",
            "password": "WrongPassword"
        })
        assert bad_login.status_code == 401

        # 6. Access /auth/me with Bearer token
        headers = {"Authorization": f"Bearer {token}"}
        me_res = await client.get("/auth/me", headers=headers)
        assert me_res.status_code == 200
        assert me_res.json()["email"] == "learner@skilltwin.dev"

        # 7. Get Learner Profile
        prof_res = await client.get("/profile", headers=headers)
        assert prof_res.status_code == 200
        assert prof_res.json()["weekly_hours_budget"] == 12

        # 8. Update Learner Profile
        update_res = await client.put("/profile", json={
            "target_role": "Senior ML Engineer",
            "weekly_hours_budget": 15,
            "prior_experience_level": "intermediate"
        }, headers=headers)
        assert update_res.status_code == 200
        updated = update_res.json()
        assert updated["target_role"] == "Senior ML Engineer"
        assert updated["weekly_hours_budget"] == 15
        assert updated["prior_experience_level"] == "intermediate"
