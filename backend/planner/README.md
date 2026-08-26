# DAG Path Planner & Local Path Repair Engine

The `backend/planner/` package contains the algorithmic core responsible for generating personalized curriculum paths from prerequisite knowledge graphs and performing **localized sub-graph repairs** when learner evidence arrives.

---

## 🧭 Core Responsibilities

1. **Initial Learning Path Planning (`/learning-path/generate`)**:
   - Takes a learner's target goal and candidate skill IDs.
   - Traverses the prerequisite DAG in `/data/skill_graph.json`.
   - Generates a valid topological sequence of `LearningPathNode` items respecting all `hard_prerequisite` and `recommended` dependencies.
   - Marks nodes as `completed`, `in_progress`, `ready`, or `locked` based on real-time BKT mastery state.

2. **Local Subgraph Path Repair (`/adapt-path`)**:
   - Triggered automatically on assessment completion or upon manual request.
   - Identifies the specific sub-tree affected by the changed skill mastery.
   - Dynamically inserts targeted remedial checkpoints or unlocks unblocked downstream steps **without regenerating unaffected parts of the curriculum**.
   - Calculates key localization metrics:
     $$\text{repair\_ratio} = \frac{\text{touched\_node\_count}}{\text{total\_node\_count}}$$
   - Returns structured `PathRepairDiff` payloads.

---

## 🔒 Contract Invariants

- **Cycle Prevention**: Prerequisite graphs and generated paths must strictly remain Directed Acyclic Graphs (DAGs).
- **Localization Guarantee**: Nodes upstream of the triggering skill or on independent graph branches must remain untouched (`unchanged_nodes`).
- **Audit Trace**: Every repair produces an incremented path version and a verifiable `PathRepairDiff`.
