"""
SkillTwin FastAPI Main Application Entrypoint
Production Ready with PostgreSQL & Neon
"""
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.config import settings
from backend.db.init_db import init_db, seed_all_defaults
from backend.routers.auth import router as auth_router
from backend.routers.profile import router as profile_router
from backend.routers.skills import router as skills_router
from backend.routers.paths import router as paths_router
from backend.routers.assessments import router as assessments_router
from backend.routers.progress import router as progress_router
from backend.routers.recommendations import router as recommendations_router
from backend.routers.integrations import router as integrations_router
from backend.routers.ai_chat import router as ai_chat_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("skilltwin.app")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown lifecycle handler."""
    logger.info("Starting SkillTwin Backend Service...")
    # Initialize database tables and seed domain skill graphs
    try:
        await init_db()
        await seed_all_defaults()
        logger.info("Database initialized and domain graphs seeded successfully.")
    except Exception as e:
        logger.warning(f"Database auto-init notice: {e}")
    
    yield
    
    logger.info("Shutting down SkillTwin Backend Service.")


app = FastAPI(
    title="SkillTwin Adaptive Cognitive Twin API",
    description="Adaptive Learning Intelligence Platform powered by BKT, DAG Path Planning, and Grounded Gemini Explanations.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_origin_regex=r"^https?://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers
app.include_router(auth_router)
app.include_router(profile_router)
app.include_router(skills_router)
app.include_router(paths_router)
app.include_router(assessments_router)
app.include_router(progress_router)
app.include_router(recommendations_router)
app.include_router(integrations_router)
app.include_router(ai_chat_router)


@app.api_route("/", methods=["GET", "HEAD"], tags=["Health"])
async def root():
    """Service status and meta endpoint."""
    return {
        "service": "SkillTwin Backend API",
        "version": settings.APP_VERSION,
        "status": "operational",
        "docs": "/docs",
        "contract": "/shared/schema.md"
    }


@app.api_route("/health", methods=["GET", "HEAD"], tags=["Health"])
async def health_check():
    """Liveness & Database connection health probe."""
    db_status = "connected"
    db_dialect = "unknown"
    error_msg = None
    try:
        from backend.db.session import async_engine
        from sqlalchemy import text
        async with async_engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
            db_dialect = async_engine.dialect.name
    except Exception as e:
        db_status = "disconnected"
        error_msg = str(e)

    return {
        "status": "healthy" if db_status == "connected" else "degraded",
        "database": {
            "status": db_status,
            "dialect": db_dialect,
            "error": error_msg
        }
    }
