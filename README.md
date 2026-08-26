# SkillTwin: Adaptive Cognitive Twin & Dynamic Learning Path Orchestrator

SkillTwin is an AI-powered adaptive learning intelligence platform that builds a real-time cognitive digital twin of a learner's knowledge state using **Bayesian Knowledge Tracing (BKT)**, constructs personalized curriculum sequences via **Directed Acyclic Graph (DAG) Path Planning**, executes **Localized Path Repair** upon evidence arrival, and delivers **Zero-Hallucination Explanations** grounded in verifiable system metrics using Gemini models.

---

## 🌟 Key Capabilities

1. **Bayesian Knowledge Tracing (BKT) Engine**:
   - Computes posterior mastery probabilities $P(L)$ from quiz, coding exercise, and project attempts.
   - Tracks slip $P(S)$, guess $P(G)$, and transition $P(T)$ parameters dynamically.
   - Determines mastery status ($P(L) \ge 0.80$) and confidence intervals.

2. **DAG Prerequisite Path Planner & Local Repair**:
   - Traverses domain knowledge graphs to construct optimal topological learning paths.
   - When assessment performance alters mastery, performs **local subgraph repairs** rather than full path regenerations.
   - Tracks demo and evaluation metrics like `touched_node_count` and `repair_ratio`.

3. **Grounded AI Explanation Agents**:
   - Generates next-best-action guidance and path adaptation rationale powered by Google Gemini.
   - Enforces strict grounding invariants: explanations only reference verified numerical states and metrics.

4. **Interactive Learner Dashboard**:
   - Next.js frontend with visual DAG rendering, real-time mastery heatmaps, and step-by-step path repair diff visualizations.

---

## 📁 Repository Structure

```text
skilltwin/
├── backend/                  # FastAPI Application Service
│   ├── agents/               # Gemini-powered explanation & diagnostic agents
│   ├── auth/                 # JWT authentication and user security
│   ├── db/                   # Database models, schemas, and session management
│   ├── planner/              # DAG Path Planner & Local Subgraph Repair Engine
│   ├── routers/              # API Route Controllers (Auth, Graph, Paths, Assessments)
│   └── README.md             # Backend architecture documentation
├── data/                     # Knowledge graph definitions & curated resources
│   └── README.md             # Data schemas for skill_graph.json & resources.json
├── frontend/                 # Next.js / React interactive learner interface
│   └── README.md             # Frontend components & UI architecture
├── ml/                       # Bayesian Knowledge Tracing (BKT) model engine
│   └── README.md             # BKT formulas, parameter calibration & interfaces
├── shared/                   # Shared schema definitions & API contracts
│   ├── schema.md             # SINGLE SOURCE OF TRUTH: API & Data Schema Contract
│   └── README.md             # Contract invariants & guidelines
├── docker-compose.yml        # Multi-service container orchestration
├── .env.example              # Environment variables template
├── .gitignore                # Git exclusions
└── README.md                 # Project root documentation (this file)
```

---

## 📜 Single Source of Truth

All data models, API request/response contracts, ID naming conventions, and system invariants are defined authoritatively in:
👉 [`shared/schema.md`](file:///d:/skilltwin/shared/schema.md)

---

## 🚀 Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+ & npm / pnpm
- Docker & Docker Compose (optional)
- Google Gemini API Key

### Configuration
Copy the template environment file:
```bash
cp .env.example .env
```
Populate `.env` with your database credentials and `GEMINI_API_KEY`.
