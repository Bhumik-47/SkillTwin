"""
Explanation Agent alias for backward compatibility and clean modular imports.
"""
from backend.agents.explainer import PathExplainerAgent, path_explainer_agent

ExplanationAgent = PathExplainerAgent
explanation_agent = path_explainer_agent

__all__ = ["PathExplainerAgent", "path_explainer_agent", "ExplanationAgent", "explanation_agent"]
