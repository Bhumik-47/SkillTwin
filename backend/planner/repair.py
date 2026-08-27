"""
Local Sub-DAG Path Repair Engine
Performs localized surgical repairs on existing learning paths upon learner assessment evidence,
preserving upstream and independent nodes.
"""
import copy
from datetime import datetime, timezone
import logging
from typing import Dict, List, Optional, Set, Any
import networkx as nx

from backend.planner.graph import graph_manager, DAGPathPlanner

logger = logging.getLogger("skilltwin.planner.repair")


class PathRepairEngine:
    """
    Local Subgraph Path Repair Engine.
    Diffs old vs new required curriculum, patches affected nodes, and generates a structured PathRepairDiff.
    """

    def __init__(self, manager=None):
        self.manager = manager or graph_manager
        self.planner = DAGPathPlanner(self.manager)

    def repair_path(
        self,
        old_path: List[Dict[str, Any]],
        trigger_skill_id: str,
        new_mastery_map: Dict[str, float],
        domain: str = "backend_engineering",
        mastery_threshold: float = 0.80,
        force_remedial: bool = False
    ) -> Dict[str, Any]:
        """
        Executes localized sub-DAG repair on old_path given new evidence for trigger_skill_id.
        """
        G = self.manager.get_nx_graph(domain)
        data = self.manager.load_domain_data(domain)
        resources_by_skill = {}
        for r in data.get("resources", []):
            resources_by_skill.setdefault(r["skill_id"], []).append(r)

        trigger_mastery = new_mastery_map.get(trigger_skill_id, 0.10)
        is_struggling = force_remedial or (trigger_mastery < 0.50)

        # Clone old path for manipulation
        old_path_copy = copy.deepcopy(old_path)
        old_step_map = {n["node_id"]: n for n in old_path_copy}
        old_skill_order = [n["skill_id"] for n in old_path_copy]

        # 1. Identify trigger index in old path
        trigger_idx = -1
        for idx, node in enumerate(old_path_copy):
            if node["skill_id"] == trigger_skill_id:
                trigger_idx = idx
                break

        # 2. Identify downstream dependent nodes in old path
        descendants = nx.descendants(G, trigger_skill_id) if trigger_skill_id in G else set()

        inserted_nodes: List[Dict[str, Any]] = []
        removed_nodes: List[Dict[str, Any]] = []
        reordered_nodes: List[Dict[str, Any]] = []
        unchanged_nodes: List[Dict[str, Any]] = []
        new_path: List[Dict[str, Any]] = []

        # Determine all mastered skills up to date
        mastered_skills: Set[str] = {
            s_id for s_id, m in new_mastery_map.items() if m >= mastery_threshold
        }

        # Build modified node sequence
        if is_struggling and trigger_idx != -1:
            # Insert targeted remedial practice right after/before the struggling checkpoint
            trigger_node = old_path_copy[trigger_idx]
            remedial_node_id = f"node_{trigger_skill_id}_remedial"
            
            # Check if remedial resource exists or pick resource 2
            skill_res = resources_by_skill.get(trigger_skill_id, [])
            remedial_res_id = skill_res[1]["id"] if len(skill_res) > 1 else f"res_{trigger_skill_id}_02"

            remedial_node = {
                "node_id": remedial_node_id,
                "step_order": trigger_node["step_order"],
                "skill_id": trigger_skill_id,
                "skill_name": f"{trigger_node['skill_name']} (Remedial Reinforcement)",
                "recommended_resource_id": remedial_res_id,
                "status": "in_progress",
                "mastery_prob": round(trigger_mastery, 4),
                "prerequisite_skill_ids": trigger_node.get("prerequisite_skill_ids", []),
                "estimated_minutes": max(20, trigger_node.get("estimated_minutes", 40) // 2)
            }
            inserted_nodes.append(remedial_node)

            # Reconstruct sequence:
            # 1. Keep nodes before trigger
            current_step = 1
            for node in old_path_copy[:trigger_idx]:
                n = copy.deepcopy(node)
                n["step_order"] = current_step
                new_path.append(n)
                current_step += 1

            # 2. Add inserted remedial node
            remedial_node["step_order"] = current_step
            new_path.append(remedial_node)
            current_step += 1

            # 3. Update trigger node and shift
            updated_trigger = copy.deepcopy(trigger_node)
            updated_trigger["step_order"] = current_step
            updated_trigger["mastery_prob"] = round(trigger_mastery, 4)
            updated_trigger["status"] = "ready"
            new_path.append(updated_trigger)
            current_step += 1

            # 4. Shift downstream nodes and update their lock status
            for node in old_path_copy[trigger_idx + 1:]:
                n = copy.deepcopy(node)
                old_order = n["step_order"]
                n["step_order"] = current_step
                # If it depends on trigger_skill_id, ensure locked
                if n["skill_id"] in descendants:
                    n["status"] = "locked"
                new_path.append(n)
                current_step += 1
        else:
            # Learner improved or mastered skill: update node in place and unlock downstream
            current_step = 1
            for node in old_path_copy:
                n = copy.deepcopy(node)
                s_id = n["skill_id"]
                node_mastery = new_mastery_map.get(s_id, n.get("mastery_prob", 0.10))
                n["mastery_prob"] = round(node_mastery, 4)
                
                # Check status
                if node_mastery >= mastery_threshold:
                    n["status"] = "completed"
                    mastered_skills.add(s_id)
                else:
                    # Check prerequisites
                    prereqs = n.get("prerequisite_skill_ids", [])
                    if all(p in mastered_skills for p in prereqs):
                        n["status"] = "in_progress" if node_mastery > 0.15 else "ready"
                    else:
                        n["status"] = "locked"

                n["step_order"] = current_step
                new_path.append(n)
                current_step += 1

        # 3. Classify diff elements: unchanged, reordered, removed
        new_node_ids = {n["node_id"] for n in new_path}
        for old_node in old_path_copy:
            if old_node["node_id"] not in new_node_ids:
                removed_nodes.append(old_node)

        for new_node in new_path:
            n_id = new_node["node_id"]
            if n_id in old_step_map:
                old_node = old_step_map[n_id]
                if old_node["step_order"] != new_node["step_order"]:
                    reordered_nodes.append({
                        "node_id": n_id,
                        "skill_id": new_node["skill_id"],
                        "old_step_order": old_node["step_order"],
                        "new_step_order": new_node["step_order"]
                    })
                elif (old_node["status"] == new_node["status"] and 
                      old_node.get("mastery_prob") == new_node.get("mastery_prob")):
                    unchanged_nodes.append(new_node)

        # 4. Calculate repair metrics
        # Contract: touched_node_count = len(removed) + len(inserted) + len(reordered)
        touched_node_count = len(removed_nodes) + len(inserted_nodes) + len(reordered_nodes)
        total_node_count = max(1, len(new_path))
        unchanged_node_count = len(unchanged_nodes)
        repair_ratio = round(touched_node_count / total_node_count, 4)

        metrics = {
            "touched_node_count": touched_node_count,
            "total_node_count": total_node_count,
            "unchanged_node_count": unchanged_node_count,
            "repair_ratio": repair_ratio
        }

        explanation = (
            f"Mastery for {trigger_skill_id} updated to {trigger_mastery:.2f}. "
            f"Localized repair touched {touched_node_count}/{total_node_count} nodes "
            f"({repair_ratio*100:.1f}%), leaving {unchanged_node_count} upstream/independent nodes unchanged."
        )

        return {
            "trigger_skill_id": trigger_skill_id,
            "removed_nodes": removed_nodes,
            "unchanged_nodes": unchanged_nodes,
            "inserted_nodes": inserted_nodes,
            "reordered_nodes": reordered_nodes,
            "old_path": old_path_copy,
            "new_path": new_path,
            "metrics": metrics,
            "explanation": explanation,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }


# Global default instance
path_repair_engine = PathRepairEngine()
