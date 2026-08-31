"""
Database Session & Connection Management for SkillTwin
Supports async SQLAlchemy 2.0 with PostgreSQL (asyncpg) and SQLite (aiosqlite fallback).
"""
import logging
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy import create_engine

from backend.config import settings

logger = logging.getLogger("skilltwin.db")

# Create Base class for SQLAlchemy ORM models
Base = declarative_base()

# Resolve database URLs
db_url = settings.DATABASE_URL
sync_db_url = settings.SYNC_DATABASE_URL or db_url.replace("+asyncpg", "").replace("+aiosqlite", "")

# Normalize SQLite paths to absolute project root to avoid CWD mismatch errors
if "sqlite" in db_url and ("./" in db_url or "skilltwin.db" in db_url):
    from pathlib import Path
    project_root = Path(__file__).resolve().parent.parent.parent
    db_file = (project_root / "skilltwin.db").as_posix()
    db_url = f"sqlite+aiosqlite:///{db_file}"
    sync_db_url = f"sqlite:///{db_file}"
else:
    # Ensure SQLite URL is properly formatted for async
    if db_url.startswith("sqlite:///"):
        db_url = db_url.replace("sqlite:///", "sqlite+aiosqlite:///")
    elif db_url.startswith("postgresql://") or db_url.startswith("postgresql+asyncpg://"):
        if db_url.startswith("postgresql://"):
            db_url = db_url.replace("postgresql://", "postgresql+asyncpg://", 1)
        from urllib.parse import urlparse, parse_qsl, urlencode, urlunparse
        parsed = urlparse(db_url)
        # asyncpg uses ssl=... instead of libpq's sslmode=... and does not accept channel_binding
        filtered_queries = []
        for k, v in parse_qsl(parsed.query):
            if k == "sslmode" and v in ("require", "verify-ca", "verify-full"):
                filtered_queries.append(("ssl", "require"))
            elif k == "ssl":
                filtered_queries.append(("ssl", v))
            elif k not in ("channel_binding", "sslmode"):
                filtered_queries.append((k, v))
        db_url = urlunparse(parsed._replace(query=urlencode(filtered_queries)))

# Silence raw SQL query echoing from SQLAlchemy engine
logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)

# Engine options
engine_kwargs = {"echo": False}
if "sqlite" in db_url:
    engine_kwargs["connect_args"] = {"check_same_thread": False}
else:
    engine_kwargs["pool_size"] = 10
    engine_kwargs["max_overflow"] = 20
    engine_kwargs["pool_pre_ping"] = True

# Async Engine & Session
async_engine = create_async_engine(db_url, **engine_kwargs)
AsyncSessionLocal = async_sessionmaker(
    bind=async_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)

# Sync Engine (for table creation scripts or background seeds)
sync_engine_kwargs = {"echo": False}
if "sqlite" in sync_db_url:
    sync_engine_kwargs["connect_args"] = {"check_same_thread": False}
sync_engine = create_engine(sync_db_url, **sync_engine_kwargs)
SyncSessionLocal = sessionmaker(bind=sync_engine, autocommit=False, autoflush=False)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    FastAPI dependency yielding an async database session per request.
    Automatically handles rollback on error and session cleanup.
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except Exception as e:
            await session.rollback()
            logger.error(f"Database session error: {e}")
            raise
        finally:
            await session.close()
