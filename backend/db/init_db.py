"""
Database Initialization & Seeding Script
Creates tables and seeds initial skill graphs and resources from JSON datasets.
"""
import os
import json
import logging
from pathlib import Path
from sqlalchemy.ext.asyncio import AsyncEngine
from sqlalchemy import select

from backend.db.session import Base, async_engine, sync_engine, AsyncSessionLocal
from backend.db.models import Skill, SkillDependency, Resource

logger = logging.getLogger("skilltwin.init_db")


async def init_db(engine: AsyncEngine = async_engine) -> None:
    """Create all database tables asynchronously."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database tables verified / created successfully.")


def init_db_sync() -> None:
    """Create all database tables synchronously."""
    Base.metadata.create_all(bind=sync_engine)
    logger.info("Database tables created via sync engine.")


async def seed_domain_graph(graph_file_path: str, resources_file_path: str = None) -> None:
    """
    Seed a domain skill graph and associated resources into the database.
    Idempotent: updates or inserts without duplicating records.
    """
    if not os.path.exists(graph_file_path):
        logger.warning(f"Graph file not found: {graph_file_path}")
        return

    with open(graph_file_path, "r", encoding="utf-8") as f:
        graph_data = json.load(f)

    async with AsyncSessionLocal() as session:
        # Seed Skills
        skills_data = graph_data.get("skills", [])
        for item in skills_data:
            skill_id = item["id"]
            existing = await session.get(Skill, skill_id)
            if not existing:
                skill = Skill(
                    id=skill_id,
                    name=item.get("name", skill_id.replace("_", " ").title()),
                    domain=item.get("domain", "backend_engineering"),
                    description=item.get("description", ""),
                    difficulty=item.get("difficulty", "intermediate"),
                    estimated_duration_minutes=item.get("estimated_duration_minutes", 60),
                    resource_ids=item.get("resource_ids", [])
                )
                session.add(skill)

        await session.commit()

        # Seed Dependencies
        deps_data = graph_data.get("dependencies", [])
        for dep in deps_data:
            source_id = dep["source_skill_id"]
            target_id = dep["target_skill_id"]
            
            # Check if edge already exists
            stmt = select(SkillDependency).where(
                SkillDependency.source_skill_id == source_id,
                SkillDependency.target_skill_id == target_id
            )
            res = await session.execute(stmt)
            if not res.scalar_one_or_none():
                dep_row = SkillDependency(
                    source_skill_id=source_id,
                    target_skill_id=target_id,
                    dependency_type=dep.get("dependency_type", "hard_prerequisite"),
                    weight=dep.get("weight", 1.0)
                )
                session.add(dep_row)

        await session.commit()

        # Seed Resources if provided
        if resources_file_path and os.path.exists(resources_file_path):
            with open(resources_file_path, "r", encoding="utf-8") as rf:
                res_data = json.load(rf)
                resources_list = res_data.get("resources", res_data if isinstance(res_data, list) else [])
                for r in resources_list:
                    r_id = r["id"]
                    existing_r = await session.get(Resource, r_id)
                    if not existing_r:
                        resource = Resource(
                            id=r_id,
                            skill_id=r["skill_id"],
                            title=r["title"],
                            type=r.get("type", "quiz"),
                            url=r.get("url"),
                            duration_minutes=r.get("duration_minutes", 30),
                            difficulty=r.get("difficulty", "intermediate"),
                            content_payload=r.get("content_payload")
                        )
                        session.add(resource)
            await session.commit()

        logger.info(f"Seeded domain graph from {graph_file_path}")


if __name__ == "__main__":
    import asyncio
    logging.basicConfig(level=logging.INFO)
    asyncio.run(init_db())
