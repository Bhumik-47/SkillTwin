# FastAPI Route Handlers & Controllers

The `backend/routers/` directory contains modular FastAPI route definitions matching the authoritative API contracts defined in [`shared/schema.md`](file:///d:/skilltwin/shared/schema.md).

---

## 🚦 Router Modules & Endpoints

| Router Module | Prefix | Handled Endpoints | Description |
| :--- | :--- | :--- | :--- |
| **`auth.py`** | `/auth` | `POST /signup`, `POST /login` | User registration, credential validation, JWT token issuance |
| **`profile.py`** | `/profile` | `GET /profile`, `PUT /profile` | Learner goals, preference updates, active stats |
| **`skills.py`** | `/skill-graph` | `GET /skill-graph` | Prerequisite DAG nodes, edge weights, personalized mastery overlay |
| **`paths.py`** | `/learning-path` | `POST /generate`, `POST /adapt-path` | Initial topological plan generation & localized path repair |
| **`assessments.py`** | `/assessment` | `POST /submit` | Quiz / exercise evidence submission, triggering BKT mastery updates & path repair |
| **`progress.py`** | `/progress` | `GET /progress` | Goal completion metrics, average mastery, timeline stats |
| **`recommendations.py`** | `/recommendations` | `GET /recommendations` | Gemini grounded next-best action recommendations |

---

## 🛡️ Validation & Serialization

All request and response models leverage Pydantic v2 schemas to ensure strict data validation, automatic OpenAPI doc generation (`/docs`), and full adherence to the contracts in `shared/schema.md`.
