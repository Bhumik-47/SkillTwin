# SkillTwin Shared Data Schema & API Contracts

> **SINGLE SOURCE OF TRUTH**  
> This document is the authoritative shared contract between all SkillTwin sub-systems:  
> **Frontend (Next.js)**, **Backend (FastAPI)**, **ML / BKT Engine**, **DAG Path Planner**, **Database (PostgreSQL / SQLite)**, and **LLM Explanation Agents (Gemini)**.  
> No component should introduce new fields, change data types, or alter ID formats without updating this file first.

---

## 1. Design Principles & Conventions

1. **Consistent ID Formats**:
   - `user_id`: String with prefix `usr_` (e.g., `"usr_01h9a8b"`)
   - `skill_id`: Snake_case string matching nodes in `/data/skill_graph.json` (e.g., `"python_basics"`, `"pandas_dataframes"`, `"linear_regression"`)
   - `resource_id`: Snake_case string matching resources in `/data/resources.json` (e.g., `"res_py_basics_01"`, `"res_py_quiz_01"`)
   - `goal_id`: String with prefix `goal_` (e.g., `"goal_ml_engineer_01"`)
   - `path_id`: String with prefix `path_` (e.g., `"path_77a1b2"`)
   - `node_id`: String with prefix `node_` (e.g., `"node_py_basics"`, `"node_pandas"`)
   - `attempt_id`: String with prefix `att_` (e.g., `"att_9812a"`)
   - `repair_id`: String with prefix `rep_` (e.g., `"rep_55a9c"`)
2. **Mastery Representation**:
   - `mastery_prob` is strictly a floating-point number in the range `[0.0, 1.0]`.
   - Mastery threshold default: `0.80` (values `>= 0.80` mark a skill as mastered).
3. **Data Provenance**:
   - Every field is explicitly categorized by source: `[Learner]`, `[ML Engine]`, `[Planner]`, `[Agent]`, or `[System/Static Data]`.
4. **Local Path Repair & Touch Count**:
   - When new evidence arrives, the planner repairs only affected subgraph nodes rather than regenerating from scratch.
   - `touched_node_count` is a critical evaluation and demo metric exposed directly in `PathRepairDiff`.

---

## 2. Core Entities

### 2.1 User
Represents an authenticated account in the SkillTwin system.

| Field | Type | Origin | Required | Description | Example Value |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `string` | `[System]` | Yes | Unique user identifier | `"usr_01h9a8b"` |
| `email` | `string` | `[Learner]` | Yes | User's login email | `"alex.chen@example.com"` |
| `full_name` | `string` | `[Learner]` | Yes | Display name | `"Alex Chen"` |
| `created_at` | `string` (ISO 8601) | `[System]` | Yes | Timestamp of registration | `"2026-08-25T14:30:00Z"` |
| `updated_at` | `string` (ISO 8601) | `[System]` | Yes | Last update timestamp | `"2026-08-25T14:30:00Z"` |

---

### 2.2 LearnerProfile
Represents learner preferences, career targets, and study configuration.

| Field | Type | Origin | Required | Description | Example Value |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `user_id` | `string` | `[System]` | Yes | Reference to `User.id` | `"usr_01h9a8b"` |
| `target_role` | `string` | `[Learner]` | Yes | Target career or learning role | `"Machine Learning Engineer"` |
| `weekly_hours_budget` | `integer` | `[Learner]` | Yes | Available study hours per week | `8` |
| `preferred_learning_style` | `enum (string)` | `[Learner]` | Yes | `hands_on`, `video`, `reading`, `mixed` | `"hands_on"` |
| `prior_experience_level` | `enum (string)` | `[Learner]` | Yes | `beginner`, `intermediate`, `advanced` | `"beginner"` |
| `active_goal_id` | `string` | `[System]` | No | Reference to active `Goal.id` | `"goal_ml_engineer_01"` |
| `updated_at` | `string` (ISO 8601) | `[System]` | Yes | Last modification timestamp | `"2026-08-25T14:32:00Z"` |

---

### 2.3 Goal
A learning target chosen by or configured for the learner.

| Field | Type | Origin | Required | Description | Example Value |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `string` | `[System]` | Yes | Goal identifier | `"goal_ml_engineer_01"` |
| `user_id` | `string` | `[System]` | Yes | Owner user ID | `"usr_01h9a8b"` |
| `title` | `string` | `[Learner/System]` | Yes | Goal name | `"Master ML Foundations"` |
| `target_skill_ids` | `array[string]` | `[Learner/System]` | Yes | End skills required for this goal | `["linear_regression", "model_evaluation"]` |
| `target_date` | `string` (ISO 8601) | `[Learner]` | No | Optional deadline | `"2026-11-01T00:00:00Z"` |
| `status` | `enum (string)` | `[System]` | Yes | `in_progress`, `completed`, `paused`, `archived` | `"in_progress"` |
| `created_at` | `string` (ISO 8601) | `[System]` | Yes | Creation timestamp | `"2026-08-25T14:35:00Z"` |

---

### 2.4 Skill
A discrete competency in the skill knowledge graph (`/data/skill_graph.json`).

| Field | Type | Origin | Required | Description | Example Value |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `string` | `[Static Data]` | Yes | Unique skill key (snake_case) | `"pandas_dataframes"` |
| `name` | `string` | `[Static Data]` | Yes | Human-readable title | `"Pandas DataFrames & Series"` |
| `domain` | `string` | `[Static Data]` | Yes | Domain category | `"data_science"` |
| `description` | `string` | `[Static Data]` | Yes | Concise skill description | `"Manipulating tabular data using Pandas"` |
| `difficulty` | `enum (string)` | `[Static Data]` | Yes | `beginner`, `intermediate`, `advanced` | `"intermediate"` |
| `estimated_duration_minutes` | `integer` | `[Static Data]` | Yes | Average time to learn | `60` |
| `resource_ids` | `array[string]` | `[Static Data]` | Yes | Associated learning resources | `["res_pandas_01", "res_pandas_quiz_01"]` |

---

### 2.5 SkillDependency
A directed prerequisite edge in the DAG (`source_skill_id` $\rightarrow$ `target_skill_id`).

| Field | Type | Origin | Required | Description | Example Value |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `source_skill_id` | `string` | `[Static Data]` | Yes | Prerequisite skill ID | `"python_basics"` |
| `target_skill_id` | `string` | `[Static Data]` | Yes | Dependent skill ID | `"pandas_dataframes"` |
| `dependency_type` | `enum (string)` | `[Static Data]` | Yes | `hard_prerequisite`, `soft_prerequisite`, `recommended` | `"hard_prerequisite"` |
| `weight` | `float` (0.0–1.0) | `[Static Data]` | Yes | Prerequisite importance weight | `1.0` |

---

### 2.6 Resource
A curated learning material or assessment item (`/data/resources.json`).

| Field | Type | Origin | Required | Description | Example Value |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `string` | `[Static Data]` | Yes | Unique resource ID | `"res_pandas_01"` |
| `skill_id` | `string` | `[Static Data]` | Yes | Primary skill taught/tested | `"pandas_dataframes"` |
| `title` | `string` | `[Static Data]` | Yes | Resource title | `"Pandas Data Wrangling Tutorial"` |
| `type` | `enum (string)` | `[Static Data]` | Yes | `quiz`, `coding_exercise`, `video`, `article`, `project` | `"coding_exercise"` |
| `url` | `string` | `[Static Data]` | No | Link to external or internal content | `"https://content.skilltwin.internal/pandas-01"` |
| `duration_minutes` | `integer` | `[Static Data]` | Yes | Expected time to complete | `25` |
| `difficulty` | `enum (string)` | `[Static Data]` | Yes | `beginner`, `intermediate`, `advanced` | `"intermediate"` |

---

### 2.7 LearnerSkillState
Tracks the learner's estimated latent mastery for a skill using Bayesian Knowledge Tracing (BKT).

| Field | Type | Origin | Required | Description | Example Value |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `user_id` | `string` | `[System]` | Yes | User ID | `"usr_01h9a8b"` |
| `skill_id` | `string` | `[System]` | Yes | Skill ID | `"python_basics"` |
| `mastery_prob` | `float` (0.0–1.0) | `[ML Engine]` | Yes | Current posterior mastery estimate $P(L)$ | `0.85` |
| `bkt_p_transit` | `float` (0.0–1.0) | `[ML Engine]` | Yes | Learned transition probability $P(T)$ | `0.15` |
| `bkt_p_slip` | `float` (0.0–1.0) | `[ML Engine]` | Yes | Slip probability $P(S)$ | `0.10` |
| `bkt_p_guess` | `float` (0.0–1.0) | `[ML Engine]` | Yes | Guess probability $P(G)$ | `0.20` |
| `confidence_score` | `float` (0.0–1.0) | `[ML Engine]` | Yes | Confidence in estimate (based on evidence volume) | `0.92` |
| `is_mastered` | `boolean` | `[ML Engine]` | Yes | True if `mastery_prob >= 0.80` | `true` |
| `total_attempts` | `integer` | `[System]` | Yes | Count of attempts on this skill | `4` |
| `successful_attempts` | `integer` | `[System]` | Yes | Count of successful attempts | `3` |
| `last_assessed_at` | `string` (ISO 8601) | `[System]` | No | Timestamp of latest attempt | `"2026-08-25T15:10:00Z"` |

---

### 2.8 Attempt
An individual quiz, project, or exercise result submitted by the learner and evaluated by the system.

| Field | Type | Origin | Required | Description | Example Value |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `string` | `[System]` | Yes | Attempt identifier | `"att_9812a"` |
| `user_id` | `string` | `[System]` | Yes | Learner user ID | `"usr_01h9a8b"` |
| `skill_id` | `string` | `[Learner]` | Yes | Skill tested | `"python_basics"` |
| `resource_id` | `string` | `[Learner]` | No | Assessment resource ID | `"res_py_quiz_01"` |
| `attempt_type` | `enum (string)` | `[Learner]` | Yes | `quiz`, `project`, `exercise` | `"quiz"` |
| `score` | `float` (0.0–1.0) | `[System]` | Yes | Assessment score ($1.0 = 100\%$) | `1.0` |
| `is_correct` | `boolean` | `[System]` | Yes | Pass indicator ($score \ge 0.70$) | `true` |
| `time_spent_seconds` | `integer` | `[Learner]` | No | Seconds spent on attempt | `90` |
| `response_payload` | `object` | `[Learner]` | No | Question answers / code submitted | `{"q1": "a", "q2": "c"}` |
| `prior_mastery_prob` | `float` (0.0–1.0) | `[ML Engine]` | Yes | Mastery prob before attempt | `0.65` |
| `posterior_mastery_prob` | `float` (0.0–1.0) | `[ML Engine]` | Yes | Mastery prob after BKT update | `0.85` |
| `timestamp` | `string` (ISO 8601) | `[System]` | Yes | Submission timestamp | `"2026-08-25T15:10:00Z"` |

---

### 2.9 Progress
Aggregated progress summary for a learner against an active goal.

| Field | Type | Origin | Required | Description | Example Value |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `user_id` | `string` | `[System]` | Yes | User ID | `"usr_01h9a8b"` |
| `goal_id` | `string` | `[System]` | Yes | Goal ID | `"goal_ml_engineer_01"` |
| `completed_skill_ids` | `array[string]` | `[System]` | Yes | Skills with `is_mastered == true` | `["python_basics"]` |
| `in_progress_skill_ids` | `array[string]` | `[System]` | Yes | Current active skills being studied | `["pandas_dataframes"]` |
| `locked_skill_ids` | `array[string]` | `[Planner]` | Yes | Skills with unfulfilled prerequisites | `["linear_regression"]` |
| `overall_completion_pct` | `float` (0.0–100.0) | `[System]` | Yes | Percentage of goal skills mastered | `33.3` |
| `average_mastery` | `float` (0.0–1.0) | `[ML Engine]` | Yes | Mean mastery across all goal skills | `0.62` |
| `last_active_at` | `string` (ISO 8601) | `[System]` | Yes | Last learner activity timestamp | `"2026-08-25T15:10:00Z"` |

---

### 2.10 LearningPathNode
An individual step in a topological learning path.

| Field | Type | Origin | Required | Description | Example Value |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `node_id` | `string` | `[Planner]` | Yes | Node identifier in path | `"node_pandas"` |
| `step_order` | `integer` | `[Planner]` | Yes | Sequential execution order (1-indexed) | `2` |
| `skill_id` | `string` | `[Planner]` | Yes | Skill ID | `"pandas_dataframes"` |
| `skill_name` | `string` | `[System]` | Yes | Readable skill name | `"Pandas DataFrames & Series"` |
| `recommended_resource_id` | `string` | `[Planner]` | Yes | Primary resource assigned for node | `"res_pandas_01"` |
| `status` | `enum (string)` | `[Planner]` | Yes | `completed`, `in_progress`, `ready`, `locked` | `"ready"` |
| `mastery_prob` | `float` (0.0–1.0) | `[ML Engine]` | Yes | Current learner mastery for this skill | `0.30` |
| `prerequisite_skill_ids` | `array[string]` | `[System]` | Yes | Direct prerequisite skill IDs | `["python_basics"]` |
| `estimated_minutes` | `integer` | `[System]` | Yes | Estimated time to finish step | `60` |

---

### 2.11 LearningPath
A full ordered sequence of steps to achieve a `Goal`.

| Field | Type | Origin | Required | Description | Example Value |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `string` | `[System]` | Yes | Learning path ID | `"path_77a1b2"` |
| `user_id` | `string` | `[System]` | Yes | User ID | `"usr_01h9a8b"` |
| `goal_id` | `string` | `[System]` | Yes | Target Goal ID | `"goal_ml_engineer_01"` |
| `version` | `integer` | `[System]` | Yes | Path version (increments on repair) | `1` |
| `nodes` | `array[LearningPathNode]` | `[Planner]` | Yes | Ordered path nodes | `[...]` |
| `total_estimated_minutes` | `integer` | `[Planner]` | Yes | Total duration of path | `240` |
| `status` | `enum (string)` | `[System]` | Yes | `active`, `completed`, `superseded` | `"active"` |
| `created_at` | `string` (ISO 8601) | `[System]` | Yes | Creation timestamp | `"2026-08-25T14:40:00Z"` |
| `updated_at` | `string` (ISO 8601) | `[System]` | Yes | Last update timestamp | `"2026-08-25T14:40:00Z"` |

---

### 2.12 Recommendation
Actionable next-step recommendation with LLM explanation strictly grounded in verifiable system values.

| Field | Type | Origin | Required | Description | Example Value |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `string` | `[System]` | Yes | Recommendation ID | `"rec_001"` |
| `user_id` | `string` | `[System]` | Yes | User ID | `"usr_01h9a8b"` |
| `next_skill_id` | `string` | `[Planner]` | Yes | Recommended next skill | `"pandas_dataframes"` |
| `resource_id` | `string` | `[Planner]` | Yes | Recommended resource | `"res_pandas_01"` |
| `action_type` | `enum (string)` | `[Planner]` | Yes | `learn`, `reinforce`, `assess`, `skip` | `"learn"` |
| `grounded_explanation` | `string` | `[Agent]` | Yes | LLM explanation backed strictly by real values | `"You completed Python Basics with 0.85 mastery. Pandas DataFrames is your next unblocked prerequisite."` |
| `grounding_metadata` | `object` | `[Agent/System]` | Yes | Verifiable numbers used for grounding | *See sub-table below* |
| `created_at` | `string` (ISO 8601) | `[System]` | Yes | Recommendation generation timestamp | `"2026-08-25T15:11:00Z"` |

#### `grounding_metadata` Object:
| Field | Type | Origin | Required | Description | Example Value |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `current_mastery_prob` | `float` (0.0–1.0) | `[ML Engine]` | Yes | Current skill mastery | `0.30` |
| `prerequisite_skills_mastered` | `array[string]` | `[System]` | Yes | Mastered prerequisite skill IDs | `["python_basics"]` |
| `target_goal_relevance_score` | `float` (0.0–1.0) | `[Planner]` | Yes | Relevance to active goal | `0.95` |
| `bkt_evidence_summary` | `string` | `[ML Engine]` | Yes | Short BKT evidence string | `"Posterior mastery 0.85 from 4 attempts"` |

---

### 2.13 PathRepairDiff
The core schema representing **local path repair**. When learner evidence alters mastery, the planner modifies only affected nodes.

| Field | Type | Origin | Required | Description | Example Value |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `repair_id` | `string` | `[System]` | Yes | Repair event ID | `"rep_55a9c"` |
| `path_id` | `string` | `[System]` | Yes | ID of repaired path | `"path_77a1b2"` |
| `previous_version` | `integer` | `[System]` | Yes | Old version number | `1` |
| `new_version` | `integer` | `[System]` | Yes | New version number | `2` |
| `trigger_event` | `enum (string)` | `[System]` | Yes | `assessment_failed`, `assessment_passed`, `skill_skipped`, `manual_repair` | `"assessment_failed"` |
| `trigger_skill_id` | `string` | `[System]` | Yes | Skill ID that caused the repair | `"python_basics"` |
| `old_path` | `array[LearningPathNode]` | `[System]` | Yes | Full previous path snapshot | `[...]` |
| `removed_nodes` | `array[LearningPathNode]` | `[Planner]` | Yes | Nodes removed in repair | `[]` |
| `unchanged_nodes` | `array[LearningPathNode]` | `[Planner]` | Yes | Nodes unaffected by repair | `[...]` |
| `inserted_nodes` | `array[LearningPathNode]` | `[Planner]` | Yes | New remedial or bridge nodes added | `[...]` |
| `reordered_nodes` | `array[object]` | `[Planner]` | Yes | Nodes whose sequence order changed | `[{"node_id": "node_pandas", "old_step_order": 2, "new_step_order": 3}]` |
| `new_path` | `array[LearningPathNode]` | `[Planner]` | Yes | Full new repaired path snapshot | `[...]` |
| `metrics` | `object` | `[Planner]` | Yes | Evaluation & Demo metrics | *See sub-table below* |
| `explanation` | `string` | `[Agent]` | Yes | LLM grounded explanation for repair | `"Remediation inserted for Control Flow due to mastery dropping below threshold."` |
| `timestamp` | `string` (ISO 8601) | `[System]` | Yes | Repair timestamp | `"2026-08-25T15:12:00Z"` |

#### `metrics` Object in `PathRepairDiff`:
| Field | Type | Origin | Required | Description | Example Value |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `touched_node_count` | `integer` | `[Planner]` | Yes | Number of nodes added, removed, or reordered | `2` |
| `total_node_count` | `integer` | `[Planner]` | Yes | Total nodes in the new path | `6` |
| `unchanged_node_count` | `integer` | `[Planner]` | Yes | Nodes preserved without mutation | `4` |
| `repair_ratio` | `float` (0.0–1.0) | `[Planner]` | Yes | $\frac{\text{touched\_node\_count}}{\text{total\_node\_count}}$ (lower is more localized) | `0.333` |

---

### 2.14 Assessment / Evidence Submission
The payload sent when a learner completes an assessment, quiz, or exercise.

| Field | Type | Origin | Required | Description | Example Value |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `user_id` | `string` | `[Learner]` | Yes | Submitting user ID | `"usr_01h9a8b"` |
| `skill_id` | `string` | `[Learner]` | Yes | Target skill ID | `"python_basics"` |
| `resource_id` | `string` | `[Learner]` | No | Optional resource identifier | `"res_py_quiz_01"` |
| `evidence_type` | `enum (string)` | `[Learner]` | Yes | `quiz_result`, `code_submission`, `project_eval` | `"quiz_result"` |
| `score` | `float` (0.0–1.0) | `[Learner/Client]` | Yes | Score achieved | `0.40` |
| `time_spent_seconds` | `integer` | `[Learner]` | No | Time taken | `110` |
| `answers` | `object` | `[Learner]` | No | Raw response answers | `{"q1": "a", "q2": "b"}` |
| `auto_trigger_repair`| `boolean` | `[Learner/Client]` | No | Automatically run `/adapt-path` if mastery changes (default `true`) | `true` |

---

## 3. API Contracts

### 3.1 Authentication

#### `POST /auth/signup`
Creates a new learner account and initializes an empty profile.

**Request Body:**
```json
{
  "email": "alex.chen@example.com",
  "password": "SecurePassword123!",
  "full_name": "Alex Chen",
  "target_role": "Machine Learning Engineer",
  "weekly_hours_budget": 10,
  "preferred_learning_style": "hands_on",
  "prior_experience_level": "beginner"
}
```

**Response Body (`201 Created`):**
```json
{
  "user": {
    "id": "usr_01h9a8b",
    "email": "alex.chen@example.com",
    "full_name": "Alex Chen",
    "created_at": "2026-08-25T14:30:00Z",
    "updated_at": "2026-08-25T14:30:00Z"
  },
  "profile": {
    "user_id": "usr_01h9a8b",
    "target_role": "Machine Learning Engineer",
    "weekly_hours_budget": 10,
    "preferred_learning_style": "hands_on",
    "prior_experience_level": "beginner",
    "active_goal_id": null,
    "updated_at": "2026-08-25T14:30:00Z"
  },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

---

#### `POST /auth/login`
Authenticates a user and returns a bearer token.

**Request Body:**
```json
{
  "email": "alex.chen@example.com",
  "password": "SecurePassword123!"
}
```

**Response Body (`200 OK`):**
```json
{
  "user": {
    "id": "usr_01h9a8b",
    "email": "alex.chen@example.com",
    "full_name": "Alex Chen",
    "created_at": "2026-08-25T14:30:00Z",
    "updated_at": "2026-08-25T14:30:00Z"
  },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

---

### 3.2 Learner Profile

#### `GET /profile`
Retrieves the authenticated user's profile and active skill state summary.

**Response Body (`200 OK`):**
```json
{
  "user_id": "usr_01h9a8b",
  "email": "alex.chen@example.com",
  "full_name": "Alex Chen",
  "target_role": "Machine Learning Engineer",
  "weekly_hours_budget": 10,
  "preferred_learning_style": "hands_on",
  "prior_experience_level": "beginner",
  "active_goal_id": "goal_ml_engineer_01",
  "mastered_skills_count": 1,
  "in_progress_skills_count": 1,
  "updated_at": "2026-08-25T14:32:00Z"
}
```

#### `PUT /profile`
Updates learner preferences and target configuration.

**Request Body:**
```json
{
  "target_role": "AI Research Assistant",
  "weekly_hours_budget": 15,
  "preferred_learning_style": "mixed",
  "prior_experience_level": "intermediate"
}
```

**Response Body (`200 OK`):**
```json
{
  "user_id": "usr_01h9a8b",
  "target_role": "AI Research Assistant",
  "weekly_hours_budget": 15,
  "preferred_learning_style": "mixed",
  "prior_experience_level": "intermediate",
  "active_goal_id": "goal_ml_engineer_01",
  "updated_at": "2026-08-25T15:00:00Z"
}
```

---

### 3.3 Skill Graph

#### `GET /skill-graph`
Returns the entire prerequisite DAG with node metadata and directed edges, optionally enriched with the learner's current mastery levels.

**Query Parameters:**
- `include_learner_state` (boolean, optional, default: `true`): If true and authenticated, populates `learner_state` on each node.

**Response Body (`200 OK`):**
```json
{
  "skills": [
    {
      "id": "python_basics",
      "name": "Python Basics",
      "domain": "programming",
      "description": "Variables, syntax, and foundational types",
      "difficulty": "beginner",
      "estimated_duration_minutes": 45,
      "resource_ids": ["res_py_basics_01", "res_py_quiz_01"],
      "learner_state": {
        "mastery_prob": 0.85,
        "is_mastered": true,
        "confidence_score": 0.92,
        "total_attempts": 4
      }
    },
    {
      "id": "control_flow",
      "name": "Control Flow & Loops",
      "domain": "programming",
      "description": "If-else conditions, loops, and comprehensions",
      "difficulty": "beginner",
      "estimated_duration_minutes": 45,
      "resource_ids": ["res_ctrl_flow_01"],
      "learner_state": {
        "mastery_prob": 0.40,
        "is_mastered": false,
        "confidence_score": 0.70,
        "total_attempts": 1
      }
    },
    {
      "id": "pandas_dataframes",
      "name": "Pandas DataFrames & Series",
      "domain": "data_science",
      "description": "Manipulating tabular datasets",
      "difficulty": "intermediate",
      "estimated_duration_minutes": 60,
      "resource_ids": ["res_pandas_01"],
      "learner_state": {
        "mastery_prob": 0.15,
        "is_mastered": false,
        "confidence_score": 0.30,
        "total_attempts": 0
      }
    },
    {
      "id": "linear_regression",
      "name": "Linear Regression & Gradients",
      "domain": "machine_learning",
      "description": "Cost functions and simple gradient descent",
      "difficulty": "intermediate",
      "estimated_duration_minutes": 90,
      "resource_ids": ["res_linreg_01"],
      "learner_state": {
        "mastery_prob": 0.05,
        "is_mastered": false,
        "confidence_score": 0.10,
        "total_attempts": 0
      }
    }
  ],
  "dependencies": [
    {
      "source_skill_id": "python_basics",
      "target_skill_id": "control_flow",
      "dependency_type": "hard_prerequisite",
      "weight": 1.0
    },
    {
      "source_skill_id": "control_flow",
      "target_skill_id": "pandas_dataframes",
      "dependency_type": "hard_prerequisite",
      "weight": 1.0
    },
    {
      "source_skill_id": "pandas_dataframes",
      "target_skill_id": "linear_regression",
      "dependency_type": "recommended",
      "weight": 0.8
    }
  ]
}
```

---

### 3.4 Learning Path Generation

#### `POST /learning-path/generate`
Generates a topological learning path respecting prerequisite DAG ordering and current learner mastery.

**Request Body:**
```json
{
  "user_id": "usr_01h9a8b",
  "goal_title": "Master ML Foundations",
  "target_skill_ids": ["linear_regression"],
  "weekly_hours_budget": 10
}
```

**Response Body (`201 Created`):**
```json
{
  "path": {
    "id": "path_77a1b2",
    "user_id": "usr_01h9a8b",
    "goal_id": "goal_ml_engineer_01",
    "version": 1,
    "total_estimated_minutes": 195,
    "status": "active",
    "created_at": "2026-08-25T14:40:00Z",
    "updated_at": "2026-08-25T14:40:00Z",
    "nodes": [
      {
        "node_id": "node_py_basics",
        "step_order": 1,
        "skill_id": "python_basics",
        "skill_name": "Python Basics",
        "recommended_resource_id": "res_py_basics_01",
        "status": "completed",
        "mastery_prob": 0.85,
        "prerequisite_skill_ids": [],
        "estimated_minutes": 45
      },
      {
        "node_id": "node_ctrl_flow",
        "step_order": 2,
        "skill_id": "control_flow",
        "skill_name": "Control Flow & Loops",
        "recommended_resource_id": "res_ctrl_flow_01",
        "status": "in_progress",
        "mastery_prob": 0.40,
        "prerequisite_skill_ids": ["python_basics"],
        "estimated_minutes": 45
      },
      {
        "node_id": "node_pandas",
        "step_order": 3,
        "skill_id": "pandas_dataframes",
        "skill_name": "Pandas DataFrames & Series",
        "recommended_resource_id": "res_pandas_01",
        "status": "locked",
        "mastery_prob": 0.15,
        "prerequisite_skill_ids": ["control_flow"],
        "estimated_minutes": 60
      },
      {
        "node_id": "node_linreg",
        "step_order": 4,
        "skill_id": "linear_regression",
        "skill_name": "Linear Regression & Gradients",
        "recommended_resource_id": "res_linreg_01",
        "status": "locked",
        "mastery_prob": 0.05,
        "prerequisite_skill_ids": ["pandas_dataframes"],
        "estimated_minutes": 90
      }
    ]
  },
  "explanation": "Learning path generated using topological sort on prerequisites for Linear Regression. Python Basics is marked complete due to 0.85 verified mastery."
}
```

---

### 3.5 Assessment / Evidence Submission

#### `POST /assessment/submit`
Receives quiz, exercise, or project results. Executes BKT update to compute new posterior mastery probability and optionally triggers local path adaptation.

**Request Body:**
```json
{
  "user_id": "usr_01h9a8b",
  "skill_id": "control_flow",
  "resource_id": "res_ctrl_flow_quiz_01",
  "evidence_type": "quiz_result",
  "score": 0.30,
  "time_spent_seconds": 120,
  "answers": {
    "q1": "for_loop",
    "q2": "wrong_branch"
  },
  "auto_trigger_repair": true
}
```

**Response Body (`200 OK`):**
```json
{
  "attempt": {
    "id": "att_9812a",
    "user_id": "usr_01h9a8b",
    "skill_id": "control_flow",
    "resource_id": "res_ctrl_flow_quiz_01",
    "attempt_type": "quiz",
    "score": 0.30,
    "is_correct": false,
    "time_spent_seconds": 120,
    "prior_mastery_prob": 0.40,
    "posterior_mastery_prob": 0.22,
    "timestamp": "2026-08-25T15:10:00Z"
  },
  "skill_state": {
    "user_id": "usr_01h9a8b",
    "skill_id": "control_flow",
    "mastery_prob": 0.22,
    "bkt_p_transit": 0.15,
    "bkt_p_slip": 0.10,
    "bkt_p_guess": 0.20,
    "confidence_score": 0.78,
    "is_mastered": false,
    "total_attempts": 2,
    "successful_attempts": 0,
    "last_assessed_at": "2026-08-25T15:10:00Z"
  },
  "repair_diff": {
    "repair_id": "rep_55a9c",
    "path_id": "path_77a1b2",
    "previous_version": 1,
    "new_version": 2,
    "trigger_event": "assessment_failed",
    "trigger_skill_id": "control_flow",
    "old_path": [
      {
        "node_id": "node_py_basics",
        "step_order": 1,
        "skill_id": "python_basics",
        "status": "completed"
      },
      {
        "node_id": "node_ctrl_flow",
        "step_order": 2,
        "skill_id": "control_flow",
        "status": "in_progress"
      },
      {
        "node_id": "node_pandas",
        "step_order": 3,
        "skill_id": "pandas_dataframes",
        "status": "locked"
      },
      {
        "node_id": "node_linreg",
        "step_order": 4,
        "skill_id": "linear_regression",
        "status": "locked"
      }
    ],
    "removed_nodes": [],
    "unchanged_nodes": [
      {
        "node_id": "node_py_basics",
        "step_order": 1,
        "skill_id": "python_basics",
        "status": "completed"
      },
      {
        "node_id": "node_pandas",
        "step_order": 4,
        "skill_id": "pandas_dataframes",
        "status": "locked"
      },
      {
        "node_id": "node_linreg",
        "step_order": 5,
        "skill_id": "linear_regression",
        "status": "locked"
      }
    ],
    "inserted_nodes": [
      {
        "node_id": "node_ctrl_flow_remedial",
        "step_order": 2,
        "skill_id": "control_flow",
        "skill_name": "Control Flow Remedial Practice",
        "recommended_resource_id": "res_ctrl_flow_remedial_01",
        "status": "in_progress",
        "mastery_prob": 0.22,
        "prerequisite_skill_ids": ["python_basics"],
        "estimated_minutes": 30
      }
    ],
    "reordered_nodes": [
      {
        "node_id": "node_ctrl_flow",
        "skill_id": "control_flow",
        "old_step_order": 2,
        "new_step_order": 3
      },
      {
        "node_id": "node_pandas",
        "skill_id": "pandas_dataframes",
        "old_step_order": 3,
        "new_step_order": 4
      },
      {
        "node_id": "node_linreg",
        "skill_id": "linear_regression",
        "old_step_order": 4,
        "new_step_order": 5
      }
    ],
    "new_path": [
      {
        "node_id": "node_py_basics",
        "step_order": 1,
        "skill_id": "python_basics",
        "skill_name": "Python Basics",
        "recommended_resource_id": "res_py_basics_01",
        "status": "completed",
        "mastery_prob": 0.85,
        "prerequisite_skill_ids": [],
        "estimated_minutes": 45
      },
      {
        "node_id": "node_ctrl_flow_remedial",
        "step_order": 2,
        "skill_id": "control_flow",
        "skill_name": "Control Flow Remedial Practice",
        "recommended_resource_id": "res_ctrl_flow_remedial_01",
        "status": "in_progress",
        "mastery_prob": 0.22,
        "prerequisite_skill_ids": ["python_basics"],
        "estimated_minutes": 30
      },
      {
        "node_id": "node_ctrl_flow",
        "step_order": 3,
        "skill_id": "control_flow",
        "skill_name": "Control Flow & Loops Checkpoint",
        "recommended_resource_id": "res_ctrl_flow_01",
        "status": "ready",
        "mastery_prob": 0.22,
        "prerequisite_skill_ids": ["python_basics"],
        "estimated_minutes": 45
      },
      {
        "node_id": "node_pandas",
        "step_order": 4,
        "skill_id": "pandas_dataframes",
        "skill_name": "Pandas DataFrames & Series",
        "recommended_resource_id": "res_pandas_01",
        "status": "locked",
        "mastery_prob": 0.15,
        "prerequisite_skill_ids": ["control_flow"],
        "estimated_minutes": 60
      },
      {
        "node_id": "node_linreg",
        "step_order": 5,
        "skill_id": "linear_regression",
        "skill_name": "Linear Regression & Gradients",
        "recommended_resource_id": "res_linreg_01",
        "status": "locked",
        "mastery_prob": 0.05,
        "prerequisite_skill_ids": ["pandas_dataframes"],
        "estimated_minutes": 90
      }
    ],
    "metrics": {
      "touched_node_count": 2,
      "total_node_count": 5,
      "unchanged_node_count": 3,
      "repair_ratio": 0.40
    },
    "explanation": "Mastery for Control Flow dropped to 0.22 after scoring 0.30 on Quiz 1. Inserted targeted remedial exercise without invalidating downstream Pandas and Linear Regression nodes.",
    "timestamp": "2026-08-25T15:10:05Z"
  }
}
```

---

### 3.6 Local Path Repair / Adaptation

#### `POST /adapt-path`
Explicitly triggers local repair on an existing learning path.

**Request Body:**
```json
{
  "user_id": "usr_01h9a8b",
  "path_id": "path_77a1b2",
  "trigger_skill_id": "control_flow",
  "reason": "learner_requested_review"
}
```

**Response Body (`200 OK`):**
Returns a `PathRepairDiff` object with `OLD PATH`, `removed_nodes`, `unchanged_nodes`, `inserted_nodes`, `reordered_nodes`, `NEW PATH`, and `metrics`.

---

### 3.7 Progress & Diagnostics

#### `GET /progress`
Retrieves mastery stats and goal progress.

**Query Parameters:**
- `goal_id` (string, optional): Filter by goal.

**Response Body (`200 OK`):**
```json
{
  "user_id": "usr_01h9a8b",
  "goal_id": "goal_ml_engineer_01",
  "completed_skill_ids": ["python_basics"],
  "in_progress_skill_ids": ["control_flow"],
  "locked_skill_ids": ["pandas_dataframes", "linear_regression"],
  "overall_completion_pct": 25.0,
  "average_mastery": 0.41,
  "last_active_at": "2026-08-25T15:10:00Z"
}
```

---

### 3.8 Recommendations & Grounded Explanations

#### `GET /recommendations`
Retrieves next-best actions grounded strictly in real numerical state values.

**Query Parameters:**
- `user_id` (string, required): Learner user ID.
- `limit` (integer, optional, default: `3`): Max recommendations.

**Response Body (`200 OK`):**
```json
{
  "recommendations": [
    {
      "id": "rec_001",
      "user_id": "usr_01h9a8b",
      "next_skill_id": "control_flow",
      "resource_id": "res_ctrl_flow_remedial_01",
      "action_type": "reinforce",
      "grounded_explanation": "Your Control Flow mastery is 0.22 based on your recent quiz score of 0.30. Completing this 30-minute practice will raise your mastery above the 0.80 threshold required to unlock Pandas.",
      "grounding_metadata": {
        "current_mastery_prob": 0.22,
        "prerequisite_skills_mastered": ["python_basics"],
        "target_goal_relevance_score": 1.0,
        "bkt_evidence_summary": "P(L)=0.22, transit=0.15, slip=0.10, guess=0.20"
      },
      "created_at": "2026-08-25T15:11:00Z"
    }
  ]
}
```

---

## 4. Frontend Display Contract for Path Repair

To satisfy hackathon evaluation and live demo requirements, the frontend renders `PathRepairDiff` in visual phases:

```
[OLD PATH] (v1)
    ├── [✓ Completed] Python Basics (0.85)
    ├── [⏳ In Progress] Control Flow & Loops (0.40)
    ├── [🔒 Locked] Pandas DataFrames & Series
    └── [🔒 Locked] Linear Regression & Gradients

[REPAIR DIFF SUMMARY]
    ├── Touched Nodes: 2 / 5 (Repair Ratio: 40.0%)
    ├── Removed Nodes: None
    ├── Inserted Nodes: 1 (Control Flow Remedial Practice)
    └── Reordered Nodes: 3 nodes shifted

[NEW PATH] (v2)
    ├── [✓ Completed] Python Basics (0.85)
    ├── [✨ INSERTED - ⏳ In Progress] Control Flow Remedial Practice (0.22)
    ├── [⚡ REORDERED - ⏳ Ready] Control Flow Checkpoint (0.22)
    ├── [🔒 Unchanged / Shifted] Pandas DataFrames & Series
    └── [🔒 Unchanged / Shifted] Linear Regression & Gradients
```

---

## 5. Summary Check & Contract Invariants

1. **Deterministic BKT Mapping**: Every assessment score maps to updated `mastery_prob` via Bayesian Knowledge Tracing formulas:
   $$P(L_{t+1}|Evidence) = \begin{cases} \frac{P(L_t)(1-P(S))}{P(L_t)(1-P(S)) + (1-P(L_t))P(G)} & \text{if Correct} \\ \frac{P(L_t)P(S)}{P(L_t)P(S) + (1-P(L_t))(1-P(G))} & \text{if Incorrect} \end{cases}$$
   $$P(L_{t+1}) = P(L_{t+1}|Evidence) + (1 - P(L_{t+1}|Evidence)) \cdot P(T)$$
2. **DAG Integrity**: A learning path must never contain cycles and must respect all `hard_prerequisite` edges in `/data/skill_graph.json`.
3. **Local Repair Guarantee**: A path repair must only mutate the sub-DAG downstream or remedial to the triggering `skill_id`. The metric `touched_node_count` must always equal `len(removed_nodes) + len(inserted_nodes) + len(reordered_nodes)`.
4. **No Hallucinated Explanations**: All Gemini / LLM explanations must contain only values present in `grounding_metadata`.
