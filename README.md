# 🚀 SkillTwin: Adaptive Cognitive Twin & Dynamic Learning Path Orchestrator

[![Live App](https://img.shields.io/badge/Live_App-skill--twin--zeta.vercel.app-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://skill-twin-zeta.vercel.app/)
[![Live API](https://img.shields.io/badge/Live_Backend-skilltwin--vaga.onrender.com-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://skilltwin-vaga.onrender.com/)
[![Database](https://img.shields.io/badge/Database-Neon_PostgreSQL-00E599?style=for-the-badge&logo=postgresql&logoColor=white)](https://neon.tech/)

[![Next.js](https://img.shields.io/badge/Next.js-15.1-black?style=flat&logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=flat&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=flat&logo=python)](https://python.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat&logo=docker)](https://www.docker.com/)
[![Google Gemini](https://img.shields.io/badge/Google%20Gemini-Flash-4285F4?style=flat&logo=google)](https://ai.google.dev/)

**SkillTwin** is an AI-powered adaptive learning intelligence platform. It constructs a real-time cognitive digital twin of a learner's knowledge state using **Bayesian Knowledge Tracing (BKT)**, generates personalized curriculum sequences via **Directed Acyclic Graph (DAG) Path Planning**, executes **Localized Subgraph Repair** upon evidence arrival, and delivers **Multi-Modal Study Resources** tailored to individual learning preferences.

---

## 🌐 Live Production Deployments

| Component | Platform | Live URL / Endpoint |
| :--- | :--- | :--- |
| **Frontend Web App** | Vercel | [https://skill-twin-zeta.vercel.app/](https://skill-twin-zeta.vercel.app/) |
| **Backend API Service** | Render | [https://skilltwin-vaga.onrender.com](https://skilltwin-vaga.onrender.com) |
| **Interactive API Documentation** | Swagger UI | [https://skilltwin-vaga.onrender.com/docs](https://skilltwin-vaga.onrender.com/docs) |
| **System Health Probe** | FastAPI Health Check | [https://skilltwin-vaga.onrender.com/health](https://skilltwin-vaga.onrender.com/health) |
| **Cloud Database** | Neon | Serverless PostgreSQL with Async Engine (`asyncpg`) |

---

## ✨ Key Features & Capabilities

### 🧠 1. Bayesian Knowledge Tracing (BKT) Engine
- Computes real-time posterior mastery probabilities $P(L)$ from quiz results, coding drills, and project attempts.
- Dynamically models Slip $P(S)$, Guess $P(G)$, and Transition $P(T)$ parameters.
- Validates mastery thresholds ($P(L) \ge 0.80$) with confidence intervals and calibrated skill levels.

### 🗺️ 2. Dynamic DAG Path Planning & Local Repair
- Traverses domain knowledge graphs (Backend Engineering, Python Fundamentals, Web Basics, Data Analysis) to synthesize optimal topological roadmaps.
- When assessments indicate learning gaps, triggers **local subgraph repair** to insert prerequisite review chapters without regenerating or resetting the entire path.
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

### 🤖 6. 24/7 Grounded AI Learning Tutor (SkillTwin Tutor)
- Google Gemini-powered conversational tutor with zero-hallucination grounding in verified learner state.
- Top-left drag-to-resize handle, preset sizes (`Standard`, `Large`, `Fullscreen`), backdrop overlay, and `Escape` key support (safely constrained below navigation).

---

## 📁 Repository Structure

```text
SkillTwin/
├── backend/                  # FastAPI Application Service
│   ├── agents/               # Gemini AI explanation & diagnostic agents
│   ├── auth/                 # JWT authentication, password hashing & security
│   ├── db/                   # SQLAlchemy async models, session management & SQLite/Postgres support
│   ├── planner/              # DAG Path Planning & Local Subgraph Repair Engine
│   ├── routers/              # API Route Controllers (Auth, Graph, Paths, Assessments, Progress)
│   ├── schemas/              # Pydantic validation schemas & request models
│   ├── services/             # Core business logic (BKT assessment, repair, recommendations)
│   └── requirements.txt      # Python backend dependencies
├── data/                     # Domain knowledge graphs & curated question banks
│   ├── graphs/               # Domain-specific DAG definitions (JSON)
│   ├── skill_graph.json      # Complete skill graph dataset
│   └── resources.json        # Curated study resources
├── frontend/                 # Next.js 15 App Router + React Interface
│   ├── public/               # Static assets & SVG brand logos
│   ├── src/
│   │   ├── app/              # Next.js App Router pages, layout, and global styles
│   │   ├── components/       # Modular UI components (Dashboard, Graph, Profile, AI Chat, etc.)
│   │   ├── data/             # Curated multi-modal topic resources & question banks
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

## 🛠️ Complete Local Setup & Execution Guide

### 📋 Prerequisites
Ensure you have the following installed on your machine:
* **Python 3.11+** ([Download Python](https://www.python.org/downloads/))
* **Node.js 18.18+ or 20+** & **npm** ([Download Node.js](https://nodejs.org/))
* **Git** ([Download Git](https://git-scm.com/))
* *(Optional)* **Docker Desktop** ([Download Docker](https://www.docker.com/products/docker-desktop/))

---

### ⚙️ Step 1: Clone the Repository & Configure Environment

```bash
# 1. Clone the repository
git clone https://github.com/Bhumik-47/SkillTwin.git
cd SkillTwin

# 2. Copy the environment template
# On Windows (PowerShell):
Copy-Item .env.example .env

# On Linux/macOS:
cp .env.example .env
```

Open `.env` and configure your keys:

```env
# Application Settings
ENVIRONMENT=development
PORT=8000
DEBUG=True

# Database Settings
# Option A: Zero-Config SQLite (Default - No external server needed)
DATABASE_URL=sqlite+aiosqlite:///./skilltwin.db
SYNC_DATABASE_URL=sqlite:///./skilltwin.db

# Option B: Neon / PostgreSQL Cloud (Uncomment to use Neon)
# DATABASE_URL="postgresql+asyncpg://your_user:your_password@your_neon_host.neon.tech/neondb?ssl=require"
# SYNC_DATABASE_URL="postgresql://your_user:your_password@your_neon_host.neon.tech/neondb?ssl=require"

# JWT Authentication & Security
SECRET_KEY=skilltwin-super-secret-development-key-change-in-production-2026
JWT_SECRET_KEY=skilltwin-super-secret-development-key-change-in-production-2026
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Google Gemini AI API (Required for AI Chat Tutor & Explanations)
# Get a free key at: https://aistudio.google.com/app/apikey
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-3.6-flash

# Frontend API Base URL
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

### 💻 Method A: Run Locally on Host Machine (Recommended)

Run the backend and frontend in **two separate terminal windows**:

#### 🔹 Terminal 1: Start the FastAPI Backend
From the project root directory (`SkillTwin/`):

```bash
# 1. Create and activate a Python virtual environment
python -m venv venv

# On Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# On Linux/macOS:
source venv/bin/activate

# 2. Install Python backend dependencies
pip install -r backend/requirements.txt

# 3. Start the FastAPI server with hot-reload
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```

* 🚀 **API Server Running:** `http://127.0.0.1:8000`
* 📚 **Interactive Swagger API Docs:** `http://127.0.0.1:8000/docs`
* 💓 **Health Check Probe:** `http://127.0.0.1:8000/health`

#### 🔹 Terminal 2: Start the Next.js Frontend
Open a **new terminal window** and navigate to `frontend/`:

```bash
cd frontend

# 1. Install Node dependencies
npm install

# 2. Start Next.js development server
npm run dev
```

* 🌐 **Web Application Live:** `http://localhost:3000`

---

### 🐳 Method B: Run with Docker Compose (One Command)

Docker sets up PostgreSQL, the FastAPI backend, and the Next.js frontend with one command:

```bash
docker compose up --build
```

- 🌐 **Learner Web Interface**: [http://localhost:3000](http://localhost:3000)
- 📚 **FastAPI Swagger Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
- 💓 **Health Check Endpoint**: [http://localhost:8000/health](http://localhost:8000/health)

*(To stop all containers, press `Ctrl + C` or run `docker compose down`)*

---

## 🧪 Automated Testing & Validation

SkillTwin includes automated test suites for mathematical, algorithmic, and architectural invariants:

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

SkillTwin comes pre-loaded with curated domain DAGs and question banks:
1. **Backend Engineering & Distributed Systems** (HTTP/2, TCP Sockets, DNS, TLS, Concurrency, Caching, B-Tree DB Indexing, Sharding)
2. **Python Programming Fundamentals** (Data Types, Control Flow, Iterators, yield Generators, Decorators, Closures, OOP)
3. **Web Basics & Modern JavaScript** (Semantic HTML5, CSS Grid & Flexbox, Async/Await, DOM, Event Delegation)
4. **Data Analysis with Pandas & NumPy** (ndarrays, Vectorized Operations, Broadcasting, DataFrame transformations, Aggregations)

---

## ❓ Troubleshooting & FAQ

* **Issue: `Scripts is disabled on this system` (PowerShell Virtualenv)**
  * *Fix:* Run `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` in your PowerShell window, then run `.\venv\Scripts\Activate.ps1` again.
* **Issue: `Address already in use` (Port 8000 or 3000)**
  * *Fix:* Another process is occupying the port. Terminate the existing process or run FastAPI on another port using `--port 8001`.
* **Issue: AI Chat returns offline fallback answers**
  * *Fix:* Ensure a valid Google Gemini API key is set in your `.env` (`GEMINI_API_KEY=AIzaSy...`). You can obtain a free key at [Google AI Studio](https://aistudio.google.com/app/apikey).

---

## 🤝 Contributing & Community

Contributions are welcome! Please check out our community standards:
- 📖 [Contributing Guidelines](CONTRIBUTING.md) — Workflow, branching, schema contracts, and PR instructions.
- 📜 [Code of Conduct](CODE_OF_CONDUCT.md) — Community standards and expectations.
- 🛡️ [Security Policy](SECURITY.md) — Vulnerability reporting and credential guidelines.

---

## 📄 License
This project is open-source under the [MIT License](LICENSE).
