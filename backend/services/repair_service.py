"""
Local Path Repair Service
Executes minimal-mutation localized path adaptation, computes touched node metrics,
and produces verifiable structured before/after diffs.
"""
from typing import Optional, List, Dict, Any, Set
from datetime import datetime, timezone
import networkx as nx
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from backend.db.models import (
    LearningPath,
    PathRepairDiffRecord,
    Skill,
    SkillDependency,
    LearnerSkillState,
    Resource,
    generate_id
)
from backend.schemas.repair import (
    PathRepairDiff,
    PathRepairMetrics
)
from backend.services.graph_service import GraphService
from backend.integrations.agent_client import AgentIntegrationClient


class RepairService:
    """
    Core engine for Local Subgraph Path Repair (Path Adaptation).
    """

    @classmethod
    async def adapt_learning_path(
        cls,
        db: AsyncSession,
        user_id: str,
        path_id: str,
        trigger_skill_id: str,
        trigger_event: str = "manual_repair"
    ) -> PathRepairDiff:
        """
        Execute localized repair on an existing learning path following evidence updates.
        """
        # 1. Fetch LearningPath and verify ownership
        path = await db.get(LearningPath, path_id)
        if not path or path.user_id != user_id:
            raise ValueError(f"Learning path '{path_id}' not found for user '{user_id}'")

        # Snapshot old path nodes
        old_nodes: List[Dict[str, Any]] = [dict(n) for n in (path.nodes or [])]
        old_version = path.version
        new_version = old_version + 1

        # 2. Fetch Skill and Dependencies for graph context
        trigger_skill = await db.get(Skill, trigger_skill_id)
        if not trigger_skill:
            raise ValueError(f"Trigger skill '{trigger_skill_id}' not found in database")

        # 3. Fetch Learner's BKT state for trigger skill
        state_stmt = select(LearnerSkillState).where(
            LearnerSkillState.user_id == user_id,
            LearnerSkillState.skill_id == trigger_skill_id
        )
        state_res = await db.execute(state_stmt)
        trigger_state = state_res.scalar_one_or_none()
        current_mastery = trigger_state.mastery_prob if trigger_state else 0.10
        is_mastered = (trigger_state.is_mastered if trigger_state else False) or current_mastery >= 0.80

        # Fetch all learner states for nodes in path
        path_skill_ids = [n["skill_id"] for n in old_nodes]
        all_states_stmt = select(LearnerSkillState).where(
            LearnerSkillState.user_id == user_id,
            LearnerSkillState.skill_id.in_(path_skill_ids)
        )
        all_states_res = await db.execute(all_states_stmt)
        learner_states_map = {s.skill_id: s for s in all_states_res.scalars().all()}

        # 4. Fetch Graph dependencies to identify affected downstream subgraphs
        dep_res = await db.execute(select(SkillDependency))
        all_deps = list(dep_res.scalars().all())
        skill_res = await db.execute(select(Skill))
        all_skills = list(skill_res.scalars().all())
        G = GraphService.build_networkx_dag(all_skills, all_deps)

        # Downstream dependent skills in the DAG
        downstream_skills: Set[str] = set(nx.descendants(G, trigger_skill_id)) if trigger_skill_id in G else set()

        # 5. Local Subgraph Mutation Logic
        new_nodes: List[Dict[str, Any]] = []
        inserted_nodes: List[Dict[str, Any]] = []
        removed_nodes: List[Dict[str, Any]] = []

        remedial_node_id = f"node_{trigger_skill_id}_remedial"
        has_existing_remedial = any(n["node_id"] == remedial_node_id for n in old_nodes)

        # Scenario A: Skill is NOT mastered (e.g. assessment failed or mastery dropped)
        if not is_mastered:
            for node in old_nodes:
                s_id = node["skill_id"]
                n_id = node["node_id"]

                # If this is the trigger node and we need a remedial step
                if s_id == trigger_skill_id and not has_existing_remedial and not n_id.endswith("_remedial"):
                    # Insert remedial practice node before the checkpoint node
                    remedial_node = {
                        "node_id": remedial_node_id,
                        "step_order": len(new_nodes) + 1,
                        "skill_id": trigger_skill_id,
                        "skill_name": f"{trigger_skill.name} Remedial Practice",
                        "recommended_resource_id": f"res_{trigger_skill_id}_remedial_01",
                        "status": "in_progress",
                        "mastery_prob": round(current_mastery, 4),
                        "prerequisite_skill_ids": node.get("prerequisite_skill_ids", []),
                        "estimated_minutes": 30
                    }
                    new_nodes.append(remedial_node)
                    inserted_nodes.append(remedial_node)

                    # Update current node status to ready checkpoint
                    updated_node = dict(node)
                    updated_node["status"] = "ready"
                    updated_node["mastery_prob"] = round(current_mastery, 4)
                    new_nodes.append(updated_node)
                elif s_id in downstream_skills:
                    # Downstream dependent nodes become locked because prerequisite is not mastered
                    updated_node = dict(node)
                    updated_node["status"] = "locked"
                    new_nodes.append(updated_node)
                elif s_id == trigger_skill_id:
                    updated_node = dict(node)
                    updated_node["mastery_prob"] = round(current_mastery, 4)
                    new_nodes.append(updated_node)
                else:
                    # Preserved node on untouched graph branch
                    new_nodes.append(dict(node))

        # Scenario B: Skill IS mastered (e.g. assessment passed)
        else:
            for node in old_nodes:
                s_id = node["skill_id"]
                n_id = node["node_id"]

                # If there was a remedial node for this skill, it is now satisfied / removed
                if s_id == trigger_skill_id and n_id.endswith("_remedial"):
                    removed_nodes.append(dict(node))
                    continue

                if s_id == trigger_skill_id:
                    updated_node = dict(node)
                    updated_node["status"] = "completed"
                    updated_node["mastery_prob"] = round(current_mastery, 4)
                    new_nodes.append(updated_node)
                elif s_id in downstream_skills:
                    # Check if all prerequisites of this downstream node are now mastered
                    prereqs = node.get("prerequisite_skill_ids", [])
                    all_prereqs_done = True
                    for p in prereqs:
                        if p == trigger_skill_id:
                            continue
                        p_state = learner_states_map.get(p)
                        if not p_state or (not p_state.is_mastered and p_state.mastery_prob < 0.80):
                            all_prereqs_done = False
                            break

                    updated_node = dict(node)
                    if all_prereqs_done:
                        updated_node["status"] = "ready"
                    new_nodes.append(updated_node)
                else:
                    new_nodes.append(dict(node))

        # 6. Re-sequence step orders
        reordered_nodes: List[Dict[str, Any]] = []
        old_step_map = {n["node_id"]: n.get("step_order", i + 1) for i, n in enumerate(old_nodes)}

        for idx, node in enumerate(new_nodes, start=1):
            n_id = node["node_id"]
            old_step = old_step_map.get(n_id)
            node["step_order"] = idx
            if old_step is not None and old_step != idx:
                reordered_nodes.append({
                    "node_id": n_id,
                    "skill_id": node["skill_id"],
                    "old_step_order": old_step,
                    "new_step_order": idx
                })

        # 7. Identify Unchanged Nodes
        inserted_ids = {n["node_id"] for n in inserted_nodes}
        reordered_ids = {r["node_id"] for r in reordered_nodes}
        old_nodes_dict = {n["node_id"]: n for n in old_nodes}

        unchanged_nodes: List[Dict[str, Any]] = []
        for n in new_nodes:
            n_id = n["node_id"]
            if n_id not in inserted_ids and n_id not in reordered_ids:
                old_matching = old_nodes_dict.get(n_id)
                if old_matching and old_matching.get("status") == n.get("status"):
                    unchanged_nodes.append(n)

        # 8. Compute Exact Metrics
        touched_node_count = len(inserted_nodes) + len(removed_nodes) + len(reordered_nodes)
        total_node_count = len(new_nodes)
        unchanged_node_count = len(unchanged_nodes)
        repair_ratio = round(touched_node_count / max(1, total_node_count), 4)

        metrics = PathRepairMetrics(
            touched_node_count=touched_node_count,
            total_node_count=total_node_count,
            unchanged_node_count=unchanged_node_count,
            repair_ratio=repair_ratio
        )

        # 9. Grounded Explanation
        now_ts = datetime.now(timezone.utc).isoformat()
        prior_mastery = trigger_state.mastery_prob if trigger_state else 0.10
        explanation = AgentIntegrationClient.generate_repair_explanation(
            trigger_skill_name=trigger_skill.name,
            trigger_event=trigger_event,
            prior_mastery=prior_mastery,
            posterior_mastery=current_mastery,
            touched_node_count=touched_node_count,
            inserted_count=len(inserted_nodes)
        )

        # 10. Persist Updates to Database
        path.version = new_version
        path.nodes = new_nodes
        path.total_estimated_minutes = sum(n.get("estimated_minutes", 30) for n in new_nodes)
        path.updated_at = datetime.now(timezone.utc)

        repair_id = generate_id("rep")
        diff_record = PathRepairDiffRecord(
            id=repair_id,
            path_id=path.id,
            user_id=user_id,
            trigger_skill_id=trigger_skill_id,
            previous_version=old_version,
            new_version=new_version,
            old_path=old_nodes,
            new_path=new_nodes,
            removed_nodes=removed_nodes,
            unchanged_nodes=unchanged_nodes,
            inserted_nodes=inserted_nodes,
            reordered_nodes=reordered_nodes,
            metrics=metrics.model_dump(),
            explanation=explanation
        )
        db.add(diff_record)
        await db.commit()

        return PathRepairDiff(
            repair_id=repair_id,
            path_id=path.id,
            previous_version=old_version,
            new_version=new_version,
            trigger_event=trigger_event if trigger_event in ["assessment_failed", "assessment_passed", "skill_skipped", "manual_repair"] else "manual_repair",
            trigger_skill_id=trigger_skill_id,
            old_path=old_nodes,
            removed_nodes=removed_nodes,
            unchanged_nodes=unchanged_nodes,
            inserted_nodes=inserted_nodes,
            reordered_nodes=reordered_nodes,
            new_path=new_nodes,
            metrics=metrics,
            explanation=explanation,
            timestamp=now_ts
        )
