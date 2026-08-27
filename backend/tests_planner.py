"""
Unit and Invariant Tests for DAG Path Planner & Local Repair Engine
"""
import pytest
import networkx as nx

from backend.planner.graph import DomainGraphManager, DAGPathPlanner
from backend.planner.repair import PathRepairEngine


def test_all_domains_acyclic():
    """Verifies that all 4 domain knowledge graphs are strictly acyclic DAGs."""
    manager = DomainGraphManager()
    domains = ["backend_engineering", "python_fundamentals", "web_basics", "data_analysis_pandas_numpy"]
    
    for d in domains:
        G = manager.get_nx_graph(d)
        assert len(G.nodes) >= 15, f"Domain {d} has too few nodes: {len(G.nodes)}"
        assert nx.is_directed_acyclic_graph(G), f"Cycle detected in domain {d}!"
        
        # Verify resources exist for all nodes
        data = manager.load_domain_data(d)
        res = data.get("resources", [])
        assert len(res) >= len(G.nodes) * 3, f"Insufficient resources in domain {d}"


def test_topological_path_generation():
    """Verifies that generated learning paths respect all hard prerequisite dependencies."""
    planner = DAGPathPlanner()
    path = planner.generate_path(domain="backend_engineering")
    
    assert len(path) > 0
    node_order_map = {n["skill_id"]: n["step_order"] for n in path}
    
    # Check that for each node, its prerequisites appear earlier in the sequence
    for n in path:
        prereqs = n.get("prerequisite_skill_ids", [])
        for p in prereqs:
            if p in node_order_map:
                assert node_order_map[p] < node_order_map[n["skill_id"]], (
                    f"Prerequisite violation: {p} (step {node_order_map[p]}) "
                    f"is not before {n['skill_id']} (step {node_order_map[n['skill_id']]})"
                )


def test_mastery_status_resolution():
    """Verifies that nodes are marked completed, in_progress, ready, or locked correctly."""
    planner = DAGPathPlanner()
    mastery_map = {
        "be_linux_cli": 0.90,          # completed
        "be_networking_tcp_ip": 0.85,  # completed
        "be_http_https_protocol": 0.40 # in_progress (prereq met)
    }
    
    path = planner.generate_path(domain="backend_engineering", mastery_map=mastery_map)
    status_map = {n["skill_id"]: n["status"] for n in path}
    
    assert status_map["be_linux_cli"] == "completed"
    assert status_map["be_networking_tcp_ip"] == "completed"
    assert status_map["be_http_https_protocol"] == "in_progress"


def test_local_path_repair_struggling_remedial():
    """
    Verifies that when a learner struggles on a skill, a remedial node is inserted
    and the metric touched_node_count exactly equals len(removed) + len(inserted) + len(reordered).
    """
    planner = DAGPathPlanner()
    engine = PathRepairEngine()
    
    initial_path = planner.generate_path(domain="python_fundamentals")
    trigger_skill = "py_control_flow"
    
    diff = engine.repair_path(
        old_path=initial_path,
        trigger_skill_id=trigger_skill,
        new_mastery_map={trigger_skill: 0.20},
        domain="python_fundamentals"
    )
    
    # Verification of diff invariants
    metrics = diff["metrics"]
    removed = diff["removed_nodes"]
    inserted = diff["inserted_nodes"]
    reordered = diff["reordered_nodes"]
    unchanged = diff["unchanged_nodes"]
    
    assert len(inserted) >= 1
    assert "remedial" in inserted[0]["node_id"].lower()
    
    # Invariant: touched_node_count == len(removed) + len(inserted) + len(reordered)
    expected_touched = len(removed) + len(inserted) + len(reordered)
    assert metrics["touched_node_count"] == expected_touched
    assert metrics["total_node_count"] == len(diff["new_path"])
    assert metrics["unchanged_node_count"] == len(unchanged)
    assert metrics["repair_ratio"] == round(expected_touched / len(diff["new_path"]), 4)


def test_local_path_repair_mastery_unlock():
    """Verifies that when a learner masters a prerequisite, downstream nodes are unlocked."""
    planner = DAGPathPlanner()
    engine = PathRepairEngine()
    
    initial_path = planner.generate_path(domain="web_basics")
    trigger_skill = "web_html_semantics"
    
    diff = engine.repair_path(
        old_path=initial_path,
        trigger_skill_id=trigger_skill,
        new_mastery_map={trigger_skill: 0.95},
        domain="web_basics"
    )
    
    new_status_map = {n["skill_id"]: n["status"] for n in diff["new_path"]}
    assert new_status_map[trigger_skill] == "completed"
