"""
SkillTwin Backend Configuration Settings
Loads configuration from environment variables or .env file.
"""
from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # Application Info
    APP_NAME: str = "SkillTwin Backend"
    APP_VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    PORT: int = 8000
    HOST: str = "0.0.0.0"

    # Database Configuration
    # Supports PostgreSQL (async/sync) or fallback to SQLite
    DATABASE_URL: str = Field(
        default="sqlite+aiosqlite:///./skilltwin.db",
        description="Async database connection string. e.g. postgresql+asyncpg://postgres:postgres@localhost:5432/skilltwin"
    )
    SYNC_DATABASE_URL: Optional[str] = Field(
        default="sqlite:///./skilltwin.db",
        description="Sync database connection string for migrations/scripts. e.g. postgresql://postgres:postgres@localhost:5432/skilltwin"
    )

    # Authentication & Security
    SECRET_KEY: str = Field(
        default="skilltwin-super-secret-development-key-change-in-production-2026",
        description="JWT secret signing key"
    )
    JWT_SECRET_KEY: Optional[str] = Field(
        default=None,
        description="Alias for JWT secret signing key"
    )
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    # Google Gemini AI API
    GEMINI_API_KEY: Optional[str] = Field(
        default=None,
        description="Google Gemini API key for grounded agents"
    )
    GEMINI_MODEL: str = "gemini-3.6-flash"

    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ]

    # Domain Graph Paths
    DEFAULT_GRAPH_DOMAIN: str = "backend_engineering"


settings = Settings()
