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

### 📋 Prerequisites
- **Python 3.11+**
- **Node.js 18.18+ or 20+** & **npm**
- *(Optional)* **Docker Desktop** (for containerized execution)
- **Google Gemini API Key** (for grounded AI agents and personalized explanations)

---

### ⚙️ Step 1: Configure Environment Variables

Create your local `.env` file by copying the template:

```bash
cp .env.example .env
```

Open `.env` and configure the following required variables:

| Variable | Description | Example / Default |
| :--- | :--- | :--- |
| `GEMINI_API_KEY` | **Required for AI Agents** — Your Google Gemini API Key | `AIzaSy...` |
| `SECRET_KEY` / `JWT_SECRET_KEY` | **Required for Auth** — Cryptographic secret used for signing JWT tokens | `your-secure-random-secret-key` |
| `DATABASE_URL` | **Database Connection** — Async DB connection string | `sqlite+aiosqlite:///./skilltwin.db` *(SQLite)* or `postgresql+asyncpg://postgres:postgrespassword@localhost:5432/skilltwin` *(Postgres)* |
| `SYNC_DATABASE_URL` | Sync database connection string for migrations/scripts | `sqlite:///./skilltwin.db` *(SQLite)* or `postgresql://postgres:postgrespassword@localhost:5432/skilltwin` *(Postgres)* |

> 💡 **Zero-Config SQLite Note**: By default, the application runs out-of-the-box with SQLite (`skilltwin.db`) without requiring an external database server. If using PostgreSQL or Docker, use the PostgreSQL connection strings.

---

### 🐳 Method A: Run with Docker Compose (Recommended)

Docker runs the entire stack (**PostgreSQL + FastAPI Backend + Next.js Frontend**) in isolated containers with one command:

```bash
docker compose up --build
```

- 🌐 **Learner Dashboard (Frontend)**: [http://localhost:3000](http://localhost:3000)
- 📚 **Interactive Swagger API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
- 💓 **Backend Health Check**: [http://localhost:8000/health](http://localhost:8000/health)

---

### 💻 Method B: Run Locally on Host Machine

If you prefer running the backend and frontend directly on your local system without Docker:

#### 1. Start the FastAPI Backend
Open a terminal in the root repository directory:

```bash
# Install Python dependencies
pip install -r backend/requirements.txt

# Start FastAPI server
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```
- API will be live at: [http://localhost:8000](http://localhost:8000)
- OpenAPI Swagger Docs: [http://localhost:8000/docs](http://localhost:8000/docs)

#### 2. Start the Next.js Frontend
Open a second terminal:

```bash
cd frontend

# Install Node dependencies
npm install

# Start Next.js development server
npm run dev
```
- Web Application will be live at: [http://localhost:3000](http://localhost:3000)

---

### 🧪 Automated Tests & Validation

Run the automated test suites to verify system integrity:

```bash
# Run Backend Pytest Suite (BKT, DAG Planner, Subgraph Repair, API Endpoints)
pytest

# Run Frontend Engine & Invariant Tests
cd frontend
node --test src/tests/engine.test.mjs

# Run End-to-End Scenario Demo
python demo/scenario_demo.py
```

