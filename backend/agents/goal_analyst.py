"""
Goal Analyst Agent
Translates unstructured learner intent into structured goal JSON grounded in real domain skill DAGs.
"""
import json
import logging
import re
from typing import Dict, List, Optional, Any

from backend.config import settings
from backend.planner.graph import graph_manager
from backend.agents.prompts import GOAL_ANALYST_SYSTEM_PROMPT

logger = logging.getLogger("skilltwin.agents.goal_analyst")


class GoalAnalystAgent:
    """
    Analyzes learner aspirations and maps them to verified knowledge graph nodes.
    Guarantees zero hallucinated skill IDs.
    """

    def __init__(self, manager=None):
        self.manager = manager or graph_manager
        self.api_key = settings.GEMINI_API_KEY
        self.model_name = settings.GEMINI_MODEL

    def _detect_domain(self, prompt: str) -> str:
        """Heuristically detects target domain from prompt keywords if unspecified."""
        prompt_lower = prompt.lower()
        if any(w in prompt_lower for w in ["pandas", "numpy", "data analysis", "data cleaning", "eda", "dataframe", "matplotlib", "seaborn"]):
            return "data_analysis_pandas_numpy"
        if any(w in prompt_lower for w in ["html", "css", "dom", "frontend", "web", "flexbox", "grid", "javascript", "browser"]):
            return "web_basics"
        if any(w in prompt_lower for w in ["python", "syntax", "oop", "decorator", "generator", "comprehension", "tuple"]):
            return "python_fundamentals"
        return "backend_engineering"

    def _fallback_parse(self, prompt: str, domain: str, valid_skills: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Deterministic lexical/semantic matcher fallback ensuring valid graph node grounding.
        """
        prompt_lower = prompt.lower()
        matched_skill_ids = []

        # Match skills by name/description tokens
        for s in valid_skills:
            s_name = s["name"].lower()
            s_id = s["id"].lower()
            tokens = [t for t in re.split(r"[\s,\-\_]+", s_name) if len(t) > 3]
            if s_id in prompt_lower or any(token in prompt_lower for token in tokens):
                matched_skill_ids.append(s["id"])

        # If no specific skills matched, pick the top foundational or milestone skills
        if not matched_skill_ids:
            matched_skill_ids = [s["id"] for s in valid_skills[:min(8, len(valid_skills))]]

        # Extract hours
        hours_match = re.search(r"(\d+)\s*(?:hours?|hrs?|h)\b", prompt_lower)
        hours = int(hours_match.group(1)) if hours_match else 10
        hours = max(3, min(40, hours))

        # Detect experience
        level = "beginner"
        if "advanced" in prompt_lower or "senior" in prompt_lower:
            level = "advanced"
        elif "intermediate" in prompt_lower or "experienced" in prompt_lower:
            level = "intermediate"

        # Detect style
        style = "hands_on"
        if "video" in prompt_lower or "visual" in prompt_lower:
            style = "visual"
        elif "read" in prompt_lower or "book" in prompt_lower or "doc" in prompt_lower:
            style = "reading"
        elif "quiz" in prompt_lower or "interactive" in prompt_lower:
            style = "interactive"

        role_match = re.search(r"(?:become|as|for)\s+an?\s+([a-zA-Z\s]+?)(?:focusing|in|\.|\,|$)", prompt, re.IGNORECASE)
        role = role_match.group(1).strip().title() if role_match else f"{domain.replace('_', ' ').title()} Practitioner"

        return {
            "target_role": role,
            "domain": domain,
            "target_skill_ids": matched_skill_ids,
            "weekly_hours_budget": hours,
            "preferred_learning_style": style,
            "prior_experience_level": level,
            "intent_summary": f"Targeted roadmap for {role} focusing on {len(matched_skill_ids)} key competencies in {domain}."
        }

    async def analyze_goal(self, prompt: str, domain: Optional[str] = None) -> Dict[str, Any]:
        """
        Parses learner prompt into structured goal JSON grounded in graph node IDs.
        """
        chosen_domain = domain or self._detect_domain(prompt)
        domain_data = self.manager.load_domain_data(chosen_domain)
        valid_skills = domain_data.get("skills", [])
        valid_skill_ids = {s["id"] for s in valid_skills}
        skill_catalog_summary = [{"id": s["id"], "name": s["name"], "difficulty": s["difficulty"]} for s in valid_skills]

        # Attempt Gemini LLM invocation if API key is present
        if self.api_key:
            try:
                from google import genai
                client = genai.Client(api_key=self.api_key)
                
                content_payload = f"""
Domain: {chosen_domain}
Available Valid Skill Catalog:
{json.dumps(skill_catalog_summary, indent=2)}

Learner Free-Text Intent:
"{prompt}"
"""
                response = client.models.generate_content(
                    model=self.model_name,
                    contents=content_payload,
                    config={
                        "system_instruction": GOAL_ANALYST_SYSTEM_PROMPT,
                        "response_mime_type": "application/json"
                    }
                )
                
                if response and response.text:
                    parsed = json.loads(response.text)
                    # Defense-in-depth: Filter out any hallucinated skill IDs
                    filtered_targets = [s_id for s_id in parsed.get("target_skill_ids", []) if s_id in valid_skill_ids]
                    if not filtered_targets:
                        filtered_targets = [s["id"] for s in valid_skills[:min(8, len(valid_skills))]]
                    
                    parsed["domain"] = chosen_domain
                    parsed["target_skill_ids"] = filtered_targets
                    parsed["weekly_hours_budget"] = max(3, min(40, parsed.get("weekly_hours_budget", 10)))
                    return parsed
            except Exception as e:
                logger.warning(f"Gemini API call encountered notice: {e}. Falling back to deterministic grounded parser.")

        return self._fallback_parse(prompt, chosen_domain, valid_skills)


# Global default instance
goal_analyst_agent = GoalAnalystAgent()
