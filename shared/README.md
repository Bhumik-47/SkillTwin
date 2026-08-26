# Shared Data Contracts & Schemas

The `shared/` directory contains the authoritative schemas, data models, and API specifications that bind all SkillTwin sub-systems together.

---

## 📖 Single Source of Truth

👉 **[`schema.md`](file:///d:/skilltwin/shared/schema.md)** is the authoritative contract for SkillTwin.

All sub-systems (**Frontend**, **Backend**, **ML/BKT Engine**, **DAG Path Planner**, and **AI Agents**) must conform strictly to the entities, field names, data types, and API signatures defined in `schema.md`.

---

## 📋 Schema Overview

- **Core Entities**:
  - `User`, `LearnerProfile`, `Goal`
  - `Skill`, `SkillDependency`, `Resource`
  - `LearnerSkillState`, `Attempt`, `Progress`
  - `LearningPath`, `LearningPathNode`, `PathRepairDiff`, `Recommendation`
- **API Contracts**:
  - `/auth/signup`, `/auth/login`
  - `/profile` (GET, PUT)
  - `/skill-graph` (GET)
  - `/learning-path/generate` (POST), `/adapt-path` (POST)
  - `/assessment/submit` (POST)
  - `/progress` (GET)
  - `/recommendations` (GET)
- **Frontend Display Contract for Path Repair**:
  - Phased comparison structure for live demonstrations.
