# SkillTwin Frontend Web Application

The `frontend/` directory contains the modern **Next.js** / **React** web application for SkillTwin. It provides an intuitive, high-performance, and visually rich interface for learners to explore skill graphs, execute personalized curriculum paths, and interact with live adaptive path repairs.

---

## 🎨 Key Features & UI Components

1. **Interactive DAG Knowledge Graph Visualizer**:
   - Renders interactive skill graphs with dynamic color-coded nodes reflecting real-time mastery probabilities $P(L)$ (Mastered, In Progress, Ready, Locked).

2. **Learning Path Timeline**:
   - Displays sequenced curriculum milestones, estimated durations, and assigned learning resources.

3. **Visual Path Repair Diff Component**:
   - Renders live path adaptation events matching Section 4 of [`shared/schema.md`](file:///d:/skilltwin/shared/schema.md):
     - **`[OLD PATH]`**: Prior state before assessment.
     - **`[REPAIR DIFF SUMMARY]`**: Metrics overview (`touched_node_count`, `repair_ratio`, `inserted_nodes`, `reordered_nodes`).
     - **`[NEW PATH]`**: Updated path highlighting inserted remedial tasks and newly unlocked modules.

4. **Assessment & Practice Runner**:
   - Interactive quiz and coding exercise interface that submits evidence to `/assessment/submit` and displays animated BKT mastery updates.

5. **Grounded AI Recommendations & Explanations**:
   - Actionable cards presenting Gemini-generated rationales with verifiable grounding metric tooltips.

---

## 🛠️ Tech Stack & Tooling

- **Framework**: Next.js (App Router / React)
- **Styling**: Modern Design System with responsive layout & smooth micro-animations
- **Data Visualization**: React Flow / Cytoscape / D3.js for DAG rendering
- **State Management & Data Fetching**: React Query / SWR / Zustand
