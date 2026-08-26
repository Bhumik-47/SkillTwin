# Database Layer & Persistence Models

The `backend/db/` package manages relational database connections, connection pooling, and ORM entity models for SkillTwin using **SQLAlchemy** (or SQLModel) with asynchronous database drivers (`asyncpg` / `aiosqlite`).

---

## 🗄️ Core Entities & Schema Alignment

All models in this directory strictly implement the schemas specified in [`shared/schema.md`](file:///d:/skilltwin/shared/schema.md):

- **`User` (`usr_*`)**: Core user account entity.
- **`LearnerProfile`**: Target role, weekly study hours, preferred style, experience level, and active goal reference.
- **`Goal` (`goal_*`)**: Target competencies and target completion dates.
- **`LearnerSkillState`**: Per-user BKT mastery probability ($P(L)$), transit/slip/guess parameters, and attempt counters.
- **`Attempt` (`att_*`)**: Detailed history of individual quiz, exercise, and project submissions with score and prior/posterior mastery snapshots.
- **`LearningPath` (`path_*`)**: Versioned sequence of ordered `LearningPathNode` records.
- **`PathRepairDiff` (`rep_*`)**: Historical audit log of localized path adaptations, metrics (`touched_node_count`, `repair_ratio`), and grounded agent explanations.

---

## 📂 Key Components

- **`session.py`**: Async database engine, sessionmaker, and dependency yielders (`get_db`).
- **`models.py`**: SQLAlchemy table definitions and relational mappings.
- **`migrations/`**: Alembic database schema migration scripts.
