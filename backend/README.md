# SkillTwin Backend Service

The `backend/` directory houses the core **FastAPI** web service powering SkillTwin. It orchestrates user authentication, learner state persistence, knowledge graph querying, topological learning path generation, localized path repair, and Gemini-based grounded explanations.

---

## 🏛️ Architecture & Directory Structure

```text
backend/
├── agents/                   # Gemini AI agents for grounded explanations & recommendations
│   └── README.md             # Agent architecture & zero-hallucination grounding specs
├── auth/                     # JWT authentication, password hashing & security helpers
│   └── README.md             # Auth schemas & security protocols
├── db/                       # SQLAlchemy / asyncpg database layer & entity models
│   └── README.md             # Data models & connection lifecycle
├── planner/                  # DAG Path Planner & Local Path Repair algorithms
│   └── README.md             # Topological sort & minimal subgraph repair logic
├── routers/                  # FastAPI APIRouter endpoints matching shared/schema.md
│   └── README.md             # Endpoint specifications & request handlers
└── README.md                 # Backend overview (this file)
```

---

## 🔌 Core API Endpoints

The backend implements the API contracts defined in [`shared/schema.md`](file:///d:/skilltwin/shared/schema.md):

| Router | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/auth/signup` | Register user & initialize profile |
| **Auth** | `POST` | `/auth/login` | Authenticate & issue JWT bearer token |
| **Profile** | `GET` | `/profile` | Retrieve learner profile and active stats |
| **Profile** | `PUT` | `/profile` | Update learner targets and preferences |
| **Skills** | `GET` | `/skill-graph` | Fetch prerequisite DAG + learner mastery |
| **Planner** | `POST` | `/learning-path/generate` | Generate topological learning path |
| **Planner** | `POST` | `/adapt-path` | Perform localized repair on existing path |
| **Assess** | `POST` | `/assessment/submit` | Submit quiz/code evidence, run BKT update |
| **Progress**| `GET` | `/progress` | Aggregate goal mastery & completion % |
| **Recs** | `GET` | `/recommendations` | Get Gemini grounded next-best actions |

---

## ⚙️ Dependencies & Tech Stack

- **Framework**: FastAPI + Uvicorn (async ASGI)
- **Database**: PostgreSQL / SQLite with SQLAlchemy & Alembic
- **ML Integration**: Direct in-memory / module calls to `ml/` BKT engine
- **AI Integration**: Google GenAI SDK (Gemini 2.5/3.x) for grounded explanation agents
- **Data Serialization**: Pydantic v2 schemas strict-aligned with `shared/schema.md`
