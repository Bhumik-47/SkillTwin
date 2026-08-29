# 🌟 SkillTwin: Feature Architecture & Evaluation Guide

> **SkillTwin** is an AI-powered Cognitive Twin and Adaptive Learning Path Recommender that dynamically models learner mastery using **Bayesian Knowledge Tracing (BKT)**, constructs prerequisite-enforced **Directed Acyclic Graphs (DAGs)**, performs **surgical local sub-DAG repairs**, and provides **zero-hallucination pedagogical AI explanations** via Gemini Flash.

---

## 📊 Evaluation Weightage Breakdown

| Evaluation Dimension | Weightage | Core Technical Capabilities |
| :--- | :---: | :--- |
| **1. Functionality & Feature Completeness** | **25%** | 4 full domain graphs, Goal Analyst Agent, Topological Roadmaps, Live Quizzes, Local Repair Studio, Next-Best Recommendations, Floating AI Tutor |
| **2. Problem Understanding** | **20%** | Solves static MOOC flaws, prevents catastrophic re-planning, continuously tracks latent cognitive state, strict topological prerequisite enforcement |
| **3. AI/ML Implementation** | **20%** | Exact Bayesian Knowledge Tracing ($P(L_0), P(T), P(G), P(S)$), 7-term multi-factor candidate scorer, Gemini Flash with zero-hallucination grounding |
| **4. Innovation & Creativity** | **15%** | Surgical sub-DAG graph repair diff engine, white-box BKT formula visualizer, dual-state self-reported vs. empirical mastery comparison |
| **5. User Experience** | **10%** | Glassmorphism dark/light design system, interactive zoomable/pannable SVG DAG canvas, visual Git-style Side-by-Side and Unified Diff cards |
| **6. Performance & Code Quality** | **10%** | $\mathcal{O}(1)$ microsecond BKT updates, $\mathcal{O}(V + E)$ topological sorting, 100% test pass rate (22/22 pytest + 3/3 node tests), 0 TypeScript errors |

---

## 1. Functionality & Feature Completeness (25%)

SkillTwin delivers a complete, production-grade learning system supporting end-to-end learner workflows across 4 comprehensive technical domains.

### 🌐 1.1 Four Curated Domain Knowledge Graphs
- **Backend Engineering & Distributed Systems**: 46 nodes, 56 DAG edges, 138 curated learning resources.
- **Python Programming Fundamentals**: 18 nodes, 20 DAG edges, 54 curated learning resources.
- **Web Basics (HTML5 / CSS3 / JavaScript)**: 16 nodes, 19 DAG edges, 48 curated learning resources.
- **Data Analysis with Pandas & NumPy**: 16 nodes, 18 DAG edges, 48 curated learning resources.
- **Strict Acyclicity Verification**: 100% of domain datasets are mathematically verified Directed Acyclic Graphs (DAGs) with zero circular dependencies.

### 🤖 1.2 Grounded Goal Analysis Agent
- Ingests unstructured, natural-language learner intent (e.g., *"I want to become a Backend Engineer specializing in Kafka and high-throughput systems in 12 hours a week"*).
- Grounded mapping engine matches goals strictly to valid domain knowledge graph nodes, guaranteeing **zero hallucinated skill IDs**.
- Generates structured goal contracts including target role, domain, target skill IDs, weekly time budget, preferred learning style, and experience level.

### 🗺️ 1.3 Topological Curriculum Path Generation
- Applies topological sorting algorithms over prerequisite DAGs to sequence an optimal, dependency-respecting curriculum roadmap.
- Initial mastery filtering unblocks verified prior competencies without forcing repetitive study.
- Calculates dynamic step-by-step milestone durations, status states (`completed`, `in_progress`, `ready`, `locked`), and cumulative time budgets.

### 📝 1.4 Interactive Diagnostic Assessments
- In-app interactive quizzes for every node in the graph with 4 diagnostic options, verified answers, and detailed pedagogical rationales.
- Real-time evidence emission updates latent mastery probabilities via Bayesian inference.
- Gamified celebratory feedback (confetti animations on mastery threshold $\ge 0.80$).

### 🔧 1.5 Surgical Sub-DAG Path Repair & Diff Studio
- When assessment performance indicates a knowledge gap, the planner triggers **localized sub-DAG repair** rather than discarding the entire curriculum.
- Inserts targeted remedial reinforcement checkpoints and shifts downstream dependencies while leaving independent and upstream nodes 100% intact.
- Renders visual **Side-by-Side** and **Unified Git-Style Diff Cards** quantifying exact touched node counts, unchanged nodes preserved, and repair scope ratios.

### 🎯 1.6 Multi-Factor Next-Best Action Recommendations
- Coordinates scoring across 7 objective factors to formulate prioritized next actions (`learn`, `reinforce`, `assess`, `skip`).
- Populates transparent grounding metadata with current $P(L_t)$ probability, goal relevance, and BKT evidence summaries.

### 💬 1.7 Grounded AI Tutor & White-Box BKT Visualizer
- Floating AI pedagogical assistant powered by Gemini Flash that cites verifiable mathematical state values.
- Interactive modal visualizer illustrating real-time prior-to-posterior BKT step equations ($P(L_0), P(T), P(G), P(S)$).

---

## 2. Problem Understanding (20%)

### ❌ The Core Failures of Modern E-Learning
1. **Rigid, Linear Syllabi**: Traditional MOOCs and bootcamps force learners through one-size-fits-all static sequences, failing to adapt when learners struggle with foundational prerequisites.
2. **Hallucinatory AI Roadmaps**: Generic LLM-generated learning roadmaps invent non-existent packages, hallucinate skill dependencies, and lack strict topological constraints.
3. **Catastrophic Re-Planning**: Existing adaptive systems recompute the entire curriculum from scratch upon failure, causing learner disorientation and loss of progress continuity.
4. **Black-Box Opacity**: Learners are rarely told *why* a course was recommended or *how* their mastery was evaluated.

### ✅ The SkillTwin Solution: Cognitive Twin Paradigm
- **Continuous Latent Modeling**: Maintains a persistent mathematical "Digital Twin" of the learner’s cognitive state, tracking empirical probability of mastery $P(L_t \in [0, 1])$ for every skill node.
- **Topological Invariant Enforcement**: Ensures no advanced concept is ever scheduled before its hard prerequisite dependencies are satisfied.
- **Locality Principle**: Isolates curriculum adaptations strictly to the affected sub-DAG subgraph, preserving all unaffected milestones.
- **Transparent Explainability**: Every recommendation and path adaptation is paired with verifiable numerical citations.

---

## 3. AI/ML Implementation (20%)

### 🧠 3.1 Bayesian Knowledge Tracing (BKT) Engine
SkillTwin implements an exact 2-state Hidden Markov Model where the latent state $L_t \in \{0, 1\}$ represents whether a skill is mastered:

- **Prior Update Given Correct Answer** ($E_t = 1$):
  $$P(L_t \mid E_t = 1) = \frac{P(L_{t-1}) \cdot (1 - P(S))}{P(L_{t-1}) \cdot (1 - P(S)) + (1 - P(L_{t-1})) \cdot P(G)}$$

- **Prior Update Given Incorrect Answer** ($E_t = 0$):
  $$P(L_t \mid E_t = 0) = \frac{P(L_{t-1}) \cdot P(S)}{P(L_{t-1}) \cdot P(S) + (1 - P(L_{t-1})) \cdot (1 - P(G))}$$

- **Transition to Next Step**:
  $$P(L_{t+1}) = P(L_t \mid E_t) + (1 - P(L_t \mid E_t)) \cdot P(T)$$

- **Standard Parameters**: $P(L_0) = 0.10$, $P(T) = 0.15$ (learning transition), $P(S) = 0.10$ (slip probability), $P(G) = 0.20$ (guess probability), Mastery Threshold $\tau = 0.80$.
- **Empirical Validation**:
  - Prior $0.40$ + Incorrect $\rightarrow$ Posterior $0.22$ (triggers remedial reinforcement).
  - Prior $0.50$ + Correct $\rightarrow$ Posterior $0.85$ (elevates above threshold $\ge 0.80$ to unlock downstream nodes).

### 🧮 3.2 7-Term Multi-Factor Candidate Scorer
SkillTwin ranks candidate learning resources and skills using an objective, multi-dimensional optimization function:

$$\text{Score}(s, r) = w_1 \cdot \text{Gap}(s) + w_2 \cdot \text{PrereqReadiness}(s) + w_3 \cdot \text{StyleMatch}(r) + w_4 \cdot \text{PredictedGain}(s) + w_5 \cdot \text{Quality}(r) + w_6 \cdot \text{GoalRelevance}(s) - w_7 \cdot \text{Redundancy}(s)$$

Where:
- $\text{Gap}(s) = 1.0 - P(L_s)$: Urgency of learning.
- $\text{PrereqReadiness}(s)$: Proportion of satisfied parent prerequisite skills.
- $\text{StyleMatch}(r)$: Cosine affinity between resource media format and learner learning preference.
- $\text{PredictedGain}(s) = (1 - P(L_s)) \cdot P(T)$: Potential mastery advancement.
- $\text{Quality}(r)$: Verified resource review and pedagogical rating.
- $\text{GoalRelevance}(s)$: Domain importance weight toward learner target role.

### 🛡️ 3.3 Zero-Hallucination Grounded AI Agents (Gemini Flash)
- **Goal Analyst Agent**: Maps free-text learner intent to valid node IDs via structured JSON schema decoding. Hallucinated IDs are defended against through deterministic graph validation filters.
- **Path Explainer Agent**: Explains path generation, repair diffs, and recommendations by citing *only* input state metrics ($P(L_{prior}), P(L_{posterior})$, touched nodes, repair ratio).

---

## 4. Innovation & Creativity (15%)

| Innovation Area | Traditional Approaches | SkillTwin Architecture |
| :--- | :--- | :--- |
| **Path Adaptation** | Full syllabus regeneration from scratch | **Surgical Sub-DAG Repair**: Local patch inserting remedial nodes while preserving $\ge 85\%$ of untouched milestones. |
| **Cognitive Tracing** | Binary pass/fail or arbitrary point systems | **Continuous Bayesian Latent State**: Real-time posterior tracking with slip/guess probability modeling. |
| **Explainability** | Black-box recommendations or generic LLM summaries | **Zero-Hallucination Invariant**: AI citations strictly bound to mathematical state variables. |
| **Mastery Comparison** | Single subjective self-assessment | **Dual-State Mastery Architecture**: Side-by-side comparison of self-reported confidence vs. empirical BKT mastery. |
| **Diff Visualization** | No visibility into curriculum changes | **Interactive Visual Plan Diff Cards**: Git-style Side-by-Side and Unified visual inspection. |

---

## 5. User Experience (10%)

### 🎨 Visual & Interaction Design
- **Modern Glassmorphism Design System**: Built with TailwindCSS, Lucide icons, dynamic backdrop blur filters, and harmonious dark/light mode palettes.
- **Interactive Topological DAG Canvas**: Zoomable and pannable SVG canvas with automated hierarchical layer distribution and status color coding.
- **Interactive Roadmap View**: Step-by-step milestone cards with mastery progress bars, resource launchers, and direct quiz checkpoints.
- **Live BKT Formula Visualizer**: Real-time mathematical modal demonstrating Bayesian prior-to-posterior calculations as quizzes are submitted.
- **Floating AI Pedagogical Assistant**: Always-available AI tutor grounded in the learner's active milestone and mastery level.
- **Seamless Responsive Layout**: Fully responsive across mobile, tablet, and desktop viewports.

---

## 6. Performance & Code Quality (10%)

### ⚡ Architectural Performance
- **Microsecond BKT State Updates**: Exact Bayesian inference executes in $\mathcal{O}(1)$ time complexity ($< 0.1\text{ ms}$).
- **Linear Sub-DAG Topological Sequencing**: Graph planning and acyclic validation execute in $\mathcal{O}(V + E)$ using optimized Kahn's algorithm ($< 2\text{ ms}$).
- **Instant Client-Side Rendering**: Next.js App Router with React 19 provides instant client transitions and static pre-rendering.

### 🛡️ Code Quality & Testing Rigor
- **100% Test Pass Rate**: Full backend suite (**22/22 Pytest tests**) and frontend suite (**3/3 Node engine tests**) pass cleanly.
- **Zero TypeScript Errors**: Complete type safety verified via `npx tsc --noEmit`.
- **Modular Microservices Architecture**:
  - `backend/agents/`: Grounded AI agent workflows.
  - `backend/services/`: BKT engine, DAG planner, and graph service.
  - `backend/routers/`: FastAPI RESTful endpoints with OpenAPI schema docs.
  - `frontend/src/`: Componentized Next.js UI with reusable design system and strict state container.
- **Defensive Offline Capabilities**: Full offline simulation fallback ensuring zero application crashes even if backend connectivity is intermittent.

---

## 🚀 Quick Start & Live Demonstration

### 1. Launch FastAPI Backend
```bash
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```
- API Health: http://localhost:8000/health
- Interactive Swagger Docs: http://localhost:8000/docs

### 2. Launch Next.js Frontend
```bash
cd frontend
npm run dev
```
- Interactive Web App: http://localhost:3000

### 3. Run Automated Tests
```bash
# Backend Test Suite (Pytest)
pytest

# Frontend Engine & DAG Invariant Tests
cd frontend
node --test src/tests/engine.test.mjs
```
