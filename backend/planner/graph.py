"""
DAG Knowledge Graph Loader & Topological Path Planner
Domain-agnostic NetworkX graph traversal and roadmap generator.
"""
import os
import json
import logging
from typing import Dict, List, Optional, Set, Tuple, Any
import networkx as nx

logger = logging.getLogger("skilltwin.planner.graph")

DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "data"))
GRAPHS_DIR = os.path.join(DATA_DIR, "graphs")


class DomainGraphManager:
    """Manages and caches multi-domain skill graphs and resource datasets."""

    def __init__(self, data_dir: str = DATA_DIR):
        self.data_dir = data_dir
        self.graphs_dir = os.path.join(data_dir, "graphs")
        self._graph_cache: Dict[str, Dict[str, Any]] = {}
        self._nx_graphs: Dict[str, nx.DiGraph] = {}

    def get_available_domains(self) -> List[str]:
        """Returns list of registered domain graph keys."""
        if not os.path.exists(self.graphs_dir):
            return ["backend_engineering"]
        domains = []
        for fname in os.listdir(self.graphs_dir):
            if fname.endswith(".json"):
                domains.append(fname[:-5])
        return domains if domains else ["backend_engineering"]

    def load_domain_data(self, domain: str = "backend_engineering") -> Dict[str, Any]:
        """Loads and caches full JSON dataset for a domain."""
        if domain in self._graph_cache:
            return self._graph_cache[domain]

        domain_file = os.path.join(self.graphs_dir, f"{domain}.json")
        if not os.path.exists(domain_file):
            # Fallback to root skill_graph.json + resources.json
            skill_graph_file = os.path.join(self.data_dir, "skill_graph.json")
            resources_file = os.path.join(self.data_dir, "resources.json")
            if os.path.exists(skill_graph_file):
                with open(skill_graph_file, "r", encoding="utf-8") as f:
                    sg = json.load(f)
                res = []
                if os.path.exists(resources_file):
                    with open(resources_file, "r", encoding="utf-8") as f:
                        res = json.load(f)
                data = {
                    "domain": sg.get("domain", domain),
                    "domain_name": sg.get("domain_name", "Skill Domain"),
                    "skills": sg.get("skills", []),
                    "dependencies": sg.get("dependencies", []),
                    "resources": res
                }
                self._graph_cache[domain] = data
                return data
            raise FileNotFoundError(f"Domain graph dataset '{domain}' not found at {domain_file}")

        with open(domain_file, "r", encoding="utf-8") as f:
            data = json.load(f)

        self._graph_cache[domain] = data
        return data

    def get_nx_graph(self, domain: str = "backend_engineering") -> nx.DiGraph:
        """Constructs or returns cached NetworkX DiGraph."""
        if domain in self._nx_graphs:
            return self._nx_graphs[domain]

        data = self.load_domain_data(domain)
        G = nx.DiGraph()

        for skill in data.get("skills", []):
            G.add_node(
                skill["id"],
                name=skill["name"],
                domain=skill.get("domain", domain),
                description=skill.get("description", ""),
                difficulty=skill.get("difficulty", "intermediate"),
                estimated_duration_minutes=skill.get("estimated_duration_minutes", 45),
                resource_ids=skill.get("resource_ids", [])
            )

        for dep in data.get("dependencies", []):
            G.add_edge(
                dep["source_skill_id"],
                dep["target_skill_id"],
                dependency_type=dep.get("dependency_type", "hard_prerequisite"),
                weight=dep.get("weight", 1.0)
            )

        self._nx_graphs[domain] = G
        return G


# Global default instance
graph_manager = DomainGraphManager()


class DAGPathPlanner:
    """
    Topological Sort DAG Path Planner.
    Generates personalized learning sequences respecting prerequisites, BKT mastery, and time budgets.
    """

    def __init__(self, manager: Optional[DomainGraphManager] = None):
        self.manager = manager or graph_manager

    def generate_path(
        self,
        domain: str = "backend_engineering",
        target_skill_ids: Optional[List[str]] = None,
        mastery_map: Optional[Dict[str, float]] = None,
        mastery_threshold: float = 0.80,
        weekly_hours_budget: int = 10,
        max_duration_minutes: Optional[int] = None
    ) -> List[Dict[str, Any]]:
        """
        Generates a valid, prerequisite-respecting topological learning path.
        """
        G = self.manager.get_nx_graph(domain)
        data = self.manager.load_domain_data(domain)
        resources_by_skill = {}
        for r in data.get("resources", []):
            resources_by_skill.setdefault(r["skill_id"], []).append(r)

        mastery = mastery_map or {}

        # 1. Identify target subgraph
        if target_skill_ids:
            # Collect target skills and all their transitive ancestors (prerequisites)
            required_nodes: Set[str] = set()
            for target_id in target_skill_ids:
                if target_id in G:
                    required_nodes.add(target_id)
                    ancestors = nx.ancestors(G, target_id)
                    required_nodes.update(ancestors)
            subgraph = G.subgraph(required_nodes)
        else:
            subgraph = G

        # 2. Compute topological ordering
        try:
            topo_order = list(nx.topological_sort(subgraph))
        except nx.NetworkXUnfeasible:
            raise ValueError(f"Cycle detected in prerequisite graph for domain {domain}")

        # 3. Assemble ordered nodes and assign status based on mastery
        completed_set: Set[str] = set()
        path_nodes: List[Dict[str, Any]] = []
        cumulative_minutes = 0

        # First pass to register already-mastered nodes
        for node_id in topo_order:
            node_mastery = mastery.get(node_id, 0.10)
            if node_mastery >= mastery_threshold:
                completed_set.add(node_id)

        step_order = 1
        for node_id in topo_order:
            node_data = G.nodes[node_id]
            node_mastery = mastery.get(node_id, 0.10)
            prereqs = list(G.predecessors(node_id))
            hard_prereqs = [p for p in prereqs if G.edges[p, node_id].get("dependency_type") == "hard_prerequisite"]

            # Determine status
            if node_mastery >= mastery_threshold:
                status = "completed"
            else:
                # Check if all hard prerequisites are completed
                all_prereqs_met = all(p in completed_set for p in hard_prereqs)
                if all_prereqs_met:
                    if node_mastery > 0.15:
                        status = "in_progress"
                    else:
                        status = "ready"
                else:
                    status = "locked"

            # Select best recommended resource
            node_resources = resources_by_skill.get(node_id, [])
            rec_res_id = node_resources[0]["id"] if node_resources else f"res_{node_id}_01"

            est_minutes = node_data.get("estimated_duration_minutes", 45)
            cumulative_minutes += est_minutes

            path_nodes.append({
                "node_id": f"node_{node_id}",
                "step_order": step_order,
                "skill_id": node_id,
                "skill_name": node_data.get("name", node_id),
                "recommended_resource_id": rec_res_id,
                "status": status,
                "mastery_prob": round(node_mastery, 4),
                "prerequisite_skill_ids": hard_prereqs,
                "estimated_minutes": est_minutes
            })
            step_order += 1

            if max_duration_minutes and cumulative_minutes >= max_duration_minutes:
                break

        return path_nodes
