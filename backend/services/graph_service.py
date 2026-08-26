"""
Skill Graph Service using NetworkX
Validates DAG properties, detects cycles, and provides enriched graph representations.
"""
from typing import Optional, List, Dict, Any, Tuple
import networkx as nx
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from backend.db.models import Skill, SkillDependency, LearnerSkillState
from backend.schemas.graph import (
    SkillGraphResponse,
    SkillItem,
    SkillDependencyItem,
    LearnerStateSummary
)


class GraphService:
    """
    Service for loading, validating, and enriching prerequisite skill graphs.
    """

    @staticmethod
    def build_networkx_dag(
        skills: List[Skill],
        dependencies: List[SkillDependency]
    ) -> nx.DiGraph:
        """
        Construct and validate a NetworkX Directed Graph.
        Ensures the graph is strictly acyclic (DAG).
        """
        G = nx.DiGraph()
        
        # Add nodes with metadata
        for skill in skills:
            G.add_node(
                skill.id,
                name=skill.name,
                domain=skill.domain,
                description=skill.description,
                difficulty=skill.difficulty,
                estimated_duration_minutes=skill.estimated_duration_minutes,
                resource_ids=skill.resource_ids or []
            )

        # Add directed prerequisite edges
        for dep in dependencies:
            if dep.source_skill_id in G and dep.target_skill_id in G:
                G.add_edge(
                    dep.source_skill_id,
                    dep.target_skill_id,
                    dependency_type=dep.dependency_type,
                    weight=dep.weight
                )

        # Validate DAG condition
        if not nx.is_directed_acyclic_graph(G):
            try:
                cycle = list(nx.find_cycle(G, orientation="original"))
                cycle_str = " -> ".join([f"{u}->{v}" for u, v, _ in cycle])
            except Exception:
                cycle_str = "Unknown circular prerequisite"
            raise ValueError(f"Skill graph contains circular prerequisite cycle: {cycle_str}")

        return G

    @classmethod
    async def get_skill_graph(
        cls,
        db: AsyncSession,
        user_id: Optional[str] = None,
        domain: Optional[str] = None,
        include_learner_state: bool = True
    ) -> SkillGraphResponse:
        """
        Fetch all skills and prerequisite dependencies from database.
        Optionally enriches nodes with the learner's current BKT mastery state.
        """
        # Fetch Skills
        skill_query = select(Skill)
        if domain:
            skill_query = skill_query.where(Skill.domain == domain)
        skill_query = skill_query.order_by(Skill.id)
        skill_result = await db.execute(skill_query)
        skills = list(skill_result.scalars().all())

        # Fetch Dependencies
        dep_query = select(SkillDependency).order_by(
            SkillDependency.source_skill_id,
            SkillDependency.target_skill_id
        )
        dep_result = await db.execute(dep_query)
        dependencies = list(dep_result.scalars().all())

        # Build & Validate NetworkX DAG
        cls.build_networkx_dag(skills, dependencies)

        # Fetch learner mastery states if authenticated
        learner_states_map: Dict[str, LearnerSkillState] = {}
        if user_id and include_learner_state:
            state_query = select(LearnerSkillState).where(LearnerSkillState.user_id == user_id)
            state_result = await db.execute(state_query)
            for state in state_result.scalars().all():
                learner_states_map[state.skill_id] = state

        # Assemble Skill Items
        skill_items: List[SkillItem] = []
        for s in skills:
            state_summary = None
            if s.id in learner_states_map:
                ls = learner_states_map[s.id]
                state_summary = LearnerStateSummary(
                    mastery_prob=ls.mastery_prob,
                    is_mastered=ls.is_mastered,
                    confidence_score=ls.confidence_score,
                    total_attempts=ls.total_attempts
                )
            
            skill_items.append(SkillItem(
                id=s.id,
                name=s.name,
                domain=s.domain,
                description=s.description,
                difficulty=s.difficulty,
                estimated_duration_minutes=s.estimated_duration_minutes,
                resource_ids=s.resource_ids or [],
                learner_state=state_summary
            ))

        # Assemble Dependency Items
        dependency_items = [
            SkillDependencyItem(
                source_skill_id=d.source_skill_id,
                target_skill_id=d.target_skill_id,
                dependency_type=d.dependency_type,
                weight=d.weight
            )
            for d in dependencies
        ]

        return SkillGraphResponse(
            skills=skill_items,
            dependencies=dependency_items
        )
