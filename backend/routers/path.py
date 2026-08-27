"""
Learning Path & Graph Routers
Handles initial topological path generation, local sub-DAG repair, and skill graph queries.
"""
from typing import Dict, List, Optional, Any
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from backend.db.session import get_db
from backend.db.models import LearningPath, PathRepairDiffRecord, LearnerSkillState, Goal, Skill, generate_id
from backend.planner.graph import graph_manager, DAGPathPlanner
from backend.planner.repair import path_repair_engine
from backend.agents.explainer import path_explainer_agent

router = APIRouter(prefix="", tags=["Path Planning & Graph"])


class GeneratePathRequest(BaseModel):
    user_id: str
    goal_id: Optional[str] = None
    domain: Optional[str] = "backend_engineering"
    target_skill_ids: Optional[List[str]] = None
    weekly_hours_budget: Optional[int] = 10
    preferred_learning_style: Optional[str] = "hands_on"
    prior_experience_level: Optional[str] = "beginner"


class AdaptPathRequest(BaseModel):
    user_id: str
    path_id: Optional[str] = None
    trigger_skill_id: str
    reason: Optional[str] = "learner_requested_review"
    force_remedial: Optional[bool] = False


@router.get("/skill-graph")
async def get_skill_graph(domain: Optional[str] = Query(default="backend_engineering")):
    """Returns domain skill nodes and prerequisite dependency edges."""
    try:
        data = graph_manager.load_domain_data(domain)
        return {
            "domain": data.get("domain", domain),
            "domain_name": data.get("domain_name", "Skill Domain"),
            "skills": data.get("skills", []),
            "dependencies": data.get("dependencies", [])
        }
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Domain graph '{domain}' not found: {str(e)}")


@router.post("/learning-path/generate", status_code=status.HTTP_201_CREATED)
async def generate_learning_path(
    payload: GeneratePathRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Generates a personalized topological learning path respecting prerequisites,
    BKT mastery states, and time budget.
    """
    domain = payload.domain or "backend_engineering"
    
    # 1. Fetch learner's current mastery states
    result = await db.execute(
        select(LearnerSkillState).where(LearnerSkillState.user_id == payload.user_id)
    )
    skill_states = result.scalars().all()
    mastery_map = {s.skill_id: s.mastery_prob for s in skill_states}

    # 2. Plan path via DAGPathPlanner
    planner = DAGPathPlanner(graph_manager)
    try:
        path_nodes = planner.generate_path(
            domain=domain,
            target_skill_ids=payload.target_skill_ids,
            mastery_map=mastery_map,
            weekly_hours_budget=payload.weekly_hours_budget or 10
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Path generation error: {str(e)}")

    total_est_minutes = sum(n.get("estimated_minutes", 45) for n in path_nodes)
    goal_id = payload.goal_id or f"goal_{generate_id('g')}"

    # 3. Persist LearningPath in database
    new_path = LearningPath(
        id=generate_id("path"),
        user_id=payload.user_id,
        goal_id=goal_id,
        version=1,
        nodes=path_nodes,
        total_estimated_minutes=total_est_minutes,
        status="active"
    )
    db.add(new_path)
    await db.commit()
    await db.refresh(new_path)

    mastered_count = sum(1 for n in path_nodes if n.get("status") == "completed")
    explanation = path_explainer_agent.explain_path_generation(
        domain=domain,
        total_nodes=len(path_nodes),
        target_role=payload.domain.replace("_", " ").title(),
        weekly_hours=payload.weekly_hours_budget or 10,
        mastered_count=mastered_count
    )

    return {
        "id": new_path.id,
        "user_id": new_path.user_id,
        "goal_id": new_path.goal_id,
        "version": new_path.version,
        "nodes": new_path.nodes,
        "total_estimated_minutes": new_path.total_estimated_minutes,
        "status": new_path.status,
        "explanation": explanation,
        "created_at": new_path.created_at.isoformat(),
        "updated_at": new_path.updated_at.isoformat()
    }


@router.post("/adapt-path")
async def adapt_learning_path(
    payload: AdaptPathRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Performs local sub-DAG repair on an existing learning path,
    generating a verifiable PathRepairDiff without invalidating unaffected nodes.
    """
    # 1. Fetch active path
    if payload.path_id:
        result = await db.execute(
            select(LearningPath).where(LearningPath.id == payload.path_id)
        )
    else:
        result = await db.execute(
            select(LearningPath)
            .where(LearningPath.user_id == payload.user_id, LearningPath.status == "active")
            .order_by(LearningPath.created_at.desc())
        )
    current_path = result.scalars().first()

    if not current_path:
        raise HTTPException(status_code=404, detail="No active learning path found to adapt.")

    # 2. Fetch current mastery map
    m_res = await db.execute(
        select(LearnerSkillState).where(LearnerSkillState.user_id == payload.user_id)
    )
    states = m_res.scalars().all()
    mastery_map = {s.skill_id: s.mastery_prob for s in states}

    # 3. Execute localized repair
    old_nodes = current_path.nodes or []
    diff = path_repair_engine.repair_path(
        old_path=old_nodes,
        trigger_skill_id=payload.trigger_skill_id,
        new_mastery_map=mastery_map,
        force_remedial=payload.force_remedial or False
    )

    # 4. Generate grounded explanation
    prior_m = mastery_map.get(payload.trigger_skill_id, 0.40)
    posterior_m = prior_m
    explanation = path_explainer_agent.explain_path_repair(
        trigger_skill_id=payload.trigger_skill_id,
        prior_mastery=prior_m,
        posterior_mastery=posterior_m,
        score=0.40 if payload.force_remedial else 0.85,
        metrics=diff["metrics"],
        inserted_nodes=diff["inserted_nodes"],
        unchanged_count=diff["metrics"]["unchanged_node_count"]
    )
    diff["explanation"] = explanation

    # 5. Update DB record
    prev_version = current_path.version
    current_path.version += 1
    current_path.nodes = diff["new_path"]
    current_path.total_estimated_minutes = sum(n.get("estimated_minutes", 45) for n in diff["new_path"])

    # Audit record
    diff_record = PathRepairDiffRecord(
        id=generate_id("rep"),
        path_id=current_path.id,
        user_id=payload.user_id,
        trigger_skill_id=payload.trigger_skill_id,
        previous_version=prev_version,
        new_version=current_path.version,
        old_path=diff["old_path"],
        new_path=diff["new_path"],
        removed_nodes=diff["removed_nodes"],
        unchanged_nodes=diff["unchanged_nodes"],
        inserted_nodes=diff["inserted_nodes"],
        reordered_nodes=diff["reordered_nodes"],
        metrics=diff["metrics"],
        explanation=explanation
    )
    db.add(diff_record)
    await db.commit()

    return {
        "diff_id": diff_record.id,
        "path_id": current_path.id,
        "previous_version": prev_version,
        "new_version": current_path.version,
        "trigger_skill_id": payload.trigger_skill_id,
        "removed_nodes": diff["removed_nodes"],
        "unchanged_nodes": diff["unchanged_nodes"],
        "inserted_nodes": diff["inserted_nodes"],
        "reordered_nodes": diff["reordered_nodes"],
        "old_path": diff["old_path"],
        "new_path": diff["new_path"],
        "metrics": diff["metrics"],
        "explanation": explanation,
        "timestamp": diff["timestamp"]
    }
