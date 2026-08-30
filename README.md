# 🚀 SkillTwin: Adaptive Cognitive Twin & Dynamic Learning Path Orchestrator

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat&logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=flat&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=flat&logo=python)](https://python.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat&logo=docker)](https://www.docker.com/)
[![Google Gemini](https://img.shields.io/badge/Google%20Gemini-2.0%20Flash-4285F4?style=flat&logo=google)](https://ai.google.dev/)

**SkillTwin** is an AI-powered adaptive learning intelligence platform. It constructs a real-time cognitive digital twin of a learner's knowledge state using **Bayesian Knowledge Tracing (BKT)**, generates personalized curriculum sequences via **Directed Acyclic Graph (DAG) Path Planning**, executes **Localized Subgraph Repair** upon evidence arrival, and delivers **Multi-Modal Study Resources** tailored to individual learning preferences.

---

## ✨ Key Features & Capabilities

### 🧠 1. Bayesian Knowledge Tracing (BKT) Engine
- Computes real-time posterior mastery probabilities $P(L)$ from quiz results, coding drills, and project attempts.
- Dynamically models Slip $P(S)$, Guess $P(G)$, and Transition $P(T)$ parameters.
- Validates mastery thresholds ($P(L) \ge 0.80$) with confidence intervals and calibrated skill levels.

### 🗺️ 2. Dynamic DAG Path Planning & Local Repair
- Traverses domain knowledge graphs (Backend Engineering, Python Fundamentals, Web Basics, Data Analysis) to synthesize optimal topological roadmaps.
- When assessments indicate learning gaps, triggers **local subgraph repair** to insert prerequisite review chapters without regenerating the entire path.
- Tracks audit metrics including `touched_node_count` and `repair_ratio`.

### 📚 3. Multi-Modal Learning Preferences (Striver-Style)
Supports 4 distinct learning styles, automatically reordering and prioritizing study resources:
- 🎬 **Video First**: Curated topic-wise video lectures (Hussein Nasser, Corey Schafer, Traversy Media, Fireship) prioritized at the top.
- 📖 **Deep Reading**: Institutional articles and guides with **Core Key Takeaways & Transcript Highlights** prominently displayed.
- 💻 **Hands-On**: Interactive coding challenges (HackerRank, LeetCode, Kaggle, freeCodeCamp) prioritized first.
- 🔀 **Mixed Mode**: Balanced Striver progression (*Read Concept → Watch Lecture → Solve Coding Problem → In-Depth Blog*).
- **Verified Platform Whitelist**: All linked resources are authenticated from trusted platforms (GeeksforGeeks, MDN, W3Schools, YouTube verified creators, RealPython, etc.) with a **✓ Verified** badge.

### 🎨 4. UIverse-Inspired Interactive Study Cards
- Full-width interactive study resource grid featuring animated gradient borders, ambient hover glow orbs, and smooth micro-lift transitions.
- Category filter tabs (`[All]`, `[Articles]`, `[Videos]`, `[Practice]`, `[Blogs]`) with live count badges.

### 📈 5. Dedicated Learner Profile & Trajectory Analytics
- Full-page **Learner Profile** with LeetCode-contest-style **Skill Mastery Trajectory Area Chart** (Recharts).
- 7-Day active streak counter with daily activity checkpoints.
- Zero-baseline initialization for new sign-ups with pre-assessment calibration (Resume text intake or GitHub profile connection).

### 🤖 6. Resizable Floating AI Chat Tutor
- Google Gemini-powered conversational tutor with zero-hallucination grounding in verified learner state.
- Top-left drag-to-resize handle, preset sizes (`Standard`, `Large`, `Fullscreen`), backdrop overlay, and `Escape` key support (safely constrained below navigation).

---

## 📁 Repository Structure

```text
SkillTwin/
├── backend/                  # FastAPI Application Service
│   ├── agents/               # Gemini AI explanation & diagnostic agents
│   ├── auth/                 # JWT authentication, password hashing & schemas
│   ├── db/                   # SQLAlchemy async models, session management & SQLite/Postgres support
│   ├── planner/              # DAG Path Planning & Local Subgraph Repair Engine
│   ├── routers/              # API Route Controllers (Auth, Graph, Paths, Assessments)
│   ├── services/             # Core business logic (BKT assessment, repair, recommendations)
│   └── requirements.txt      # Python backend dependencies
├── data/                     # Domain knowledge graphs & curated question banks
├── frontend/                 # Next.js 15 App Router + React Interface
│   ├── src/
│   │   ├── app/              # Next.js pages, layout, and global styles
│   │   ├── components/       # Modular UI components (Dashboard, Graph, Profile, AI Chat, etc.)
│   │   ├── data/             # Curated multi-modal topic resources & domain DAG schemas
│   │   ├── lib/              # State management (React Context Store) & API clients
│   │   └── tests/            # Automated Node.js engine tests (BKT & DAG acyclicity)
│   └── package.json          # Node dependencies & Next.js scripts
├── ml/                       # Bayesian Knowledge Tracing (BKT) Python engine & scoring
├── shared/                   # Shared API contracts & schema specifications
├── docker-compose.yml        # Full-stack container orchestration
├── .env.example              # Environment variables template
└── README.md                 # Project documentation
```

---

## 🚀 Getting Started & Setup Guide

### 📋 Prerequisites
Ensure you have the following installed on your machine:
- **Python 3.11+** ([Download Python](https://www.python.org/downloads/))
- **Node.js 18.18+ or 20+** & **npm** ([Download Node.js](https://nodejs.org/))
- **Git** ([Download Git](https://git-scm.com/))
- *(Optional)* **Docker Desktop** ([Download Docker](https://www.docker.com/products/docker-desktop/))

---

### ⚙️ Step 1: Clone the Repository & Configure Environment

```bash
# 1. Clone the repository
git clone https://github.com/Bhumik-47/SkillTwin.git
cd SkillTwin

# 2. Copy the environment template
cp .env.example .env
```

Open `.env` and fill in your keys:

| Environment Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `GEMINI_API_KEY` | **Required for AI Tutor & Agents** — Google AI Studio API Key | `AIzaSy...` |
| `SECRET_KEY` / `JWT_SECRET_KEY` | **Required for JWT** — Cryptographic secret string | `your-secure-random-secret-key-32-chars` |
| `DATABASE_URL` | Async database connection string | `sqlite+aiosqlite:///./skilltwin.db` *(SQLite)* or `postgresql+asyncpg://postgres:postgrespassword@localhost:5432/skilltwin` *(Postgres)* |
| `SYNC_DATABASE_URL` | Sync database connection string for migrations | `sqlite:///./skilltwin.db` *(SQLite)* or `postgresql://postgres:postgrespassword@localhost:5432/skilltwin` *(Postgres)* |
| `NEXT_PUBLIC_API_URL` | Backend URL accessible by the frontend | `http://localhost:8000` |

> 💡 **Zero-Config SQLite**: By default, SkillTwin runs out-of-the-box with SQLite (`skilltwin.db`) without requiring an external database server to be installed.

---

### 🐳 Method A: Run with Docker Compose (Recommended)

Docker sets up PostgreSQL, the FastAPI backend, and the Next.js frontend with one command:

```bash
# Build and launch all services
docker compose up --build
```

- 🌐 **Learner Web Interface**: [http://localhost:3000](http://localhost:3000)
- 📚 **FastAPI Swagger Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
- 💓 **Health Check Endpoint**: [http://localhost:8000/health](http://localhost:8000/health)

---

### 💻 Method B: Run Locally on Host Machine

If you prefer running directly in your terminal:

#### 1. Start the FastAPI Backend
In the project root directory:

```bash
# Create and activate a Python virtual environment
python -m venv venv

# On Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# On Linux/macOS:
source venv/bin/activate

# Install Python backend dependencies
pip install -r backend/requirements.txt

# Start the FastAPI server with hot-reload
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```
- API will be active at: `http://127.0.0.1:8000`
- Interactive API Docs: `http://127.0.0.1:8000/docs`

#### 2. Start the Next.js Frontend
Open a **new terminal** and navigate to the `frontend/` directory:

```bash
cd frontend

# Install Node dependencies
npm install

# Start Next.js development server
npm run dev
```
- Frontend application will be live at: `http://localhost:3000`

---

## 🧪 Automated Testing & Validation

SkillTwin includes automated test suites for both mathematical and architectural invariants:

```bash
# 1. Run Backend Pytest Suite (BKT, Subgraph Repair, Auth & API endpoints)
pytest

# 2. Run Frontend Engine Tests (BKT mastery updates & DAG acyclicity for all 4 domains)
cd frontend
node --test src/tests/engine.test.mjs

# 3. Verify Production Frontend Build
npm run build
```

---

## 🗺️ Supported Domains & Curricula

SkillTwin comes pre-loaded with curated domain DAGs:
1. **Backend Engineering & Distributed Systems** (HTTP, Sockets, DNS, TLS, Concurrency, Caching, DB Indexing, Sharding)
2. **Python Programming Fundamentals** (Data Types, Control Flow, Iterators, Decorators, Closures, OOP)
3. **Web Basics & Modern JavaScript** (Semantic HTML5, CSS Grid, Flexbox, Async/Await, DOM, Event Delegation)
4. **Data Analysis with Pandas & NumPy** (ndarrays, Broadcasting, Slicing, DataFrame transformations, Aggregations)

---

## 📄 License
This project is open-source under the [MIT License](LICENSE).
