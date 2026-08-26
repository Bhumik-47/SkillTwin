# Knowledge Graph & Curated Curriculum Datasets

The `data/` directory contains the foundational static datasets that define the SkillTwin domain knowledge graphs, skill prerequisite DAGs, and curated educational resources.

---

## 📊 Datasets Specification

### 1. `skill_graph.json`
Defines the competency nodes and directed prerequisite edges across learning domains (e.g., Python Programming, Data Science, Machine Learning Foundations).

- **`skills` Array**:
  - `id` (e.g. `"python_basics"`, `"pandas_dataframes"`, `"linear_regression"`)
  - `name`: Human-readable skill name
  - `domain`: Domain classification (`"programming"`, `"data_science"`, `"machine_learning"`)
  - `description`: Summary of competencies covered
  - `difficulty`: `"beginner" | "intermediate" | "advanced"`
  - `estimated_duration_minutes`: Estimated learning time
  - `resource_ids`: Linked learning resources
- **`dependencies` Array**:
  - `source_skill_id`: Prerequisite skill ID
  - `target_skill_id`: Dependent downstream skill ID
  - `dependency_type`: `"hard_prerequisite" | "soft_prerequisite" | "recommended"`
  - `weight`: Prerequisite importance weight ($0.0 - 1.0$)

---

### 2. `resources.json`
Catalog of curated learning materials, interactive quizzes, and coding assessments linked to specific skills in the graph.

- **Fields**:
  - `id` (e.g. `"res_py_basics_01"`, `"res_ctrl_flow_quiz_01"`)
  - `skill_id`: Target skill addressed by this resource
  - `title`: Resource headline
  - `type`: `"quiz" | "coding_exercise" | "video" | "article" | "project"`
  - `url`: Content or evaluation link
  - `duration_minutes`: Expected completion time
  - `difficulty`: Resource difficulty tier

---

## 🔍 Validation Rules

- All `source_skill_id` and `target_skill_id` values in dependencies must exist in `skills`.
- The graph formed by dependencies must be strictly acyclic (no circular dependencies).
- Every resource in `resources.json` must map to a valid `skill_id`.
