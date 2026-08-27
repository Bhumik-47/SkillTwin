"""
Unit and Grounding Invariant Tests for AI Agents
"""
import pytest
import os
import json

from backend.agents.goal_analyst import GoalAnalystAgent
from backend.agents.explainer import (
    PathExplainerAgent,
    explain_initial_path,
    explain_path_repair,
    explain_recommendation
)
from backend.agents.recommendation_agent import RecommendationAgent


@pytest.mark.asyncio
async def test_goal_analyst_agent_grounding():
    """
    Verifies that Goal Analyst maps unstructured text strictly to valid domain graph node IDs.
    Zero hallucination invariant.
    """
    agent = GoalAnalystAgent()
    domain = "data_analysis_pandas_numpy"
    valid_skills = agent._load_skills_for_domain(domain)
    valid_skill_ids = {s["id"] for s in valid_skills}
    
    prompt = "I want to become a Data Analyst and master pandas dataframes, groupby aggregations, and data cleaning in 15 hours a week."
    result = await agent.analyze_goal(prompt=prompt, domain=domain)
    
    assert result["domain"] == domain
    assert result["weekly_hours_budget"] == 15
    assert len(result["target_skill_ids"]) > 0
    
    # Grounding check: Every single skill ID returned MUST exist in the domain graph
    for s_id in result["target_skill_ids"]:
        assert s_id in valid_skill_ids, f"Hallucinated skill ID found: {s_id}"


def test_path_explainer_agent_grounding_invariants():
    """
    Verifies that the Path Explainer strictly cites provided numerical values without inventing numbers.
    """
    agent = PathExplainerAgent()
    
    # 1. Path Generation explanation
    gen_exp = agent.explain_path_generation(
        domain="backend_engineering",
        total_nodes=25,
        target_role="Cloud Architect",
        weekly_hours=12,
        mastered_count=4
    )
    assert "25" in gen_exp
    assert "12" in gen_exp
    assert "4" in gen_exp
    
    # 2. Path Repair explanation
    metrics = {
        "touched_node_count": 3,
        "total_node_count": 10,
        "unchanged_node_count": 7,
        "repair_ratio": 0.30
    }
    repair_exp = agent.explain_path_repair(
        trigger_skill_id="py_functions_scope",
        prior_mastery=0.45,
        posterior_mastery=0.25,
        score=0.35,
        metrics=metrics,
        inserted_nodes=[{"skill_name": "Functions Scope Remedial"}],
        unchanged_count=7
    )
    assert "0.45" in repair_exp or "0.25" in repair_exp or "3" in repair_exp


def test_functional_explainer_interfaces():
    """
    Verifies that top-level functional helpers used by AgentIntegrationClient work correctly.
    """
    init_exp = explain_initial_path("Backend Engineer", ["be_linux_cli"], 10, ["be_linux_cli"])
    assert "Backend Engineer" in init_exp
    assert "10" in init_exp

    repair_exp = explain_path_repair("SQL Indexing", "assessment_failed", 0.40, 0.22, 2)
    assert "SQL Indexing" in repair_exp
    assert "0.40" in repair_exp
    assert "0.22" in repair_exp

    rec_exp = explain_recommendation("Docker Containers", 0.65, "learn", ["Linux Basics"])
    assert "Docker Containers" in rec_exp


def test_recommendation_agent_grounded_output():
    """
    Verifies that the Recommendation Agent ranks actions using ResourceScorer
    and populates verifiable grounding_metadata.
    """
    agent = RecommendationAgent()
    domain = "python_fundamentals"
    mastery_map = {
        "py_syntax_vars": 0.85,
        "py_operators_expressions": 0.50
    }
    
    recs = agent.get_recommendations(
        user_id="usr_test_eval_01",
        domain=domain,
        mastery_map=mastery_map,
        limit=3
    )
    
    assert len(recs) <= 3
    assert len(recs) > 0
    
    for r in recs:
        assert "id" in r
        assert "next_skill_id" in r
        assert "action_type" in r
        assert r["action_type"] in ["learn", "reinforce", "assess", "skip"]
        assert "grounded_explanation" in r
        assert "grounding_metadata" in r
        
        meta = r["grounding_metadata"]
        assert "current_mastery_prob" in meta
        assert "target_goal_relevance_score" in meta
        assert "bkt_evidence_summary" in meta
