"""
Recommendations, Goal Analysis & Progress Routers
Exposes AI Grounded Agents for next-best actions, intent parsing, and learner telemetry.
"""
from datetime import datetime, timezone
from typing import Dict, List, Optional, Any
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from backend.db.session import get_db
from backend.db.models import (
    LearnerProfile,
    LearnerSkillState,
    LearningPath,
    Goal,
    Recommendation,
    ProgressRecord,
    generate_id
)
from backend.agents.goal_analyst import goal_analyst_agent
from backend.agents.recommendation_agent import recommendation_agent

router = APIRouter(prefix="", tags=["Recommendations & Diagnostics"])


class AnalyzeGoalRequest(BaseModel):
    prompt: str = Field(..., min_length=3, description="Free text user intent, target role, and constraints")
    domain: Optional[str] = None


@router.post("/goals/analyze")
async def analyze_learner_goal(payload: AnalyzeGoalRequest):
    """
    Translates free-text learner goals into a structured JSON roadmap specification
    grounded strictly in valid domain graph node IDs.
    """
    try:
        structured_goal = await goal_analyst_agent.analyze_goal(
            prompt=payload.prompt,
            domain=payload.domain
        )
        return structured_goal
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Goal analysis failed: {str(e)}")


@router.get("/recommendations")
async def get_next_best_recommendations(
    user_id: str = Query(..., description="Learner user ID"),
    domain: Optional[str] = Query(default="backend_engineering"),
    limit: Optional[int] = Query(default=3, ge=1, le=10),
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieves next-best actions grounded strictly in real numerical state values,
    multi-factor ranking scores, and BKT mastery transitions.
    """
    # 1. Fetch learner profile
    prof_res = await db.execute(
        select(LearnerProfile).where(LearnerProfile.user_id == user_id)
    )
    profile = prof_res.scalars().first()
    style = profile.preferred_learning_style if profile else "hands_on"
    level = profile.prior_experience_level if profile else "beginner"

    # 2. Fetch active path
    path_res = await db.execute(
        select(LearningPath)
        .where(LearningPath.user_id == user_id, LearningPath.status == "active")
        .order_by(LearningPath.created_at.desc())
    )
    active_path = path_res.scalars().first()
    nodes = active_path.nodes if active_path else []

    # 3. Fetch skill states
    states_res = await db.execute(
        select(LearnerSkillState).where(LearnerSkillState.user_id == user_id)
    )
    states = states_res.scalars().all()
    mastery_map = {s.skill_id: s.mastery_prob for s in states}

    # 4. Generate recommendations via RecommendationAgent
    recs = recommendation_agent.get_recommendations(
        user_id=user_id,
        domain=domain or "backend_engineering",
        path_nodes=nodes,
        mastery_map=mastery_map,
        preferred_learning_style=style,
        prior_experience_level=level,
        limit=limit or 3
    )

    # 5. Persist recommendations
    for r in recs:
        db_rec = Recommendation(
            id=r["id"],
            user_id=user_id,
            next_skill_id=r["next_skill_id"],
            resource_id=r.get("resource_id"),
            action_type=r["action_type"],
            grounded_explanation=r["grounded_explanation"],
            grounding_metadata=r["grounding_metadata"]
        )
        db.add(db_rec)
    
    await db.commit()

    return {"recommendations": recs}


@router.get("/progress")
async def get_learner_progress(
    user_id: Optional[str] = Query(default=None),
    goal_id: Optional[str] = Query(default=None),
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieves progress metrics, completion percentages, and mastery summaries.
    """
    query = select(LearnerSkillState)
    if user_id:
        query = query.where(LearnerSkillState.user_id == user_id)

    states_res = await db.execute(query)
    states = states_res.scalars().all()

    completed_skills = [s.skill_id for s in states if s.is_mastered or s.mastery_prob >= 0.80]
    in_progress_skills = [s.skill_id for s in states if 0.15 < s.mastery_prob < 0.80]
    total_tracked = max(1, len(states))
    avg_mastery = sum(s.mastery_prob for s in states) / total_tracked if states else 0.0
    completion_pct = round((len(completed_skills) / total_tracked) * 100.0, 2) if states else 0.0

    return {
        "user_id": user_id or "all",
        "goal_id": goal_id or "active_goal",
        "completed_skill_ids": completed_skills,
        "in_progress_skill_ids": in_progress_skills,
        "locked_skill_ids": [],
        "overall_completion_pct": completion_pct,
        "average_mastery": round(avg_mastery, 4),
        "last_active_at": datetime.now(timezone.utc).isoformat()
    }
