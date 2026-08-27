# SkillTwin Machine Learning & Bayesian Knowledge Tracing (BKT) Engine

This directory houses the mathematical, statistical, and probabilistic engine powering **SkillTwin**. It models a learner's latent cognitive knowledge state from discrete assessment outcomes and computes multi-factor recommendation rankings.

---

## 1. Mathematical Formulation (Judge Q&A Reference)

Bayesian Knowledge Tracing (Corbett & Anderson) models student learning as a Hidden Markov Model (HMM) with two latent knowledge states: **Mastered ($L$)** and **Unmastered ($\neg L$)**.

### 1.1 Bayesian Evidence Update Step (Posterior Calculation)

When a student attempts a quiz or exercise at step $t$, the system receives binary evidence $E_t \in \{\text{Correct}, \text{Incorrect}\}$ (or continuous score normalized to $\text{Correct} \iff \text{score} \ge 0.70$).

The posterior probability of knowing the skill *at the moment of the attempt* is computed via Bayes' theorem:

$$\begin{aligned}
P(L_t \mid \text{Correct}) &= \frac{P(L_{t-1}) \cdot (1 - P(S))}{P(L_{t-1}) \cdot (1 - P(S)) + (1 - P(L_{t-1})) \cdot P(G)} \\[8pt]
P(L_t \mid \text{Incorrect}) &= \frac{P(L_{t-1}) \cdot P(S)}{P(L_{t-1}) \cdot P(S) + (1 - P(L_{t-1})) \cdot (1 - P(G))}
\end{aligned}$$

### 1.2 Learning Transition Step (Opportunity to Learn)

After the attempt (and review of explanations), the student has an opportunity to transition from the unmastered state to the mastered state with probability $P(T)$:

$$P(L_{t}) = P(L_t \mid \text{Evidence}) + \Big(1 - P(L_t \mid \text{Evidence})\Big) \cdot P(T)$$

---

## 2. Core Model Parameters

| Parameter | Symbol | Default | Description |
| :--- | :---: | :---: | :--- |
| **Prior Mastery** | $P(L_0)$ | `0.10` | Baseline probability of knowing a skill before any study/testing |
| **Transition / Learn Rate** | $P(T)$ | `0.15` | Probability of learning the skill during each practice opportunity |
| **Slip Probability** | $P(S)$ | `0.10` | Probability of answering incorrectly despite knowing the skill |
| **Guess Probability** | $P(G)$ | `0.20` | Probability of answering correctly by chance without knowing the skill |
| **Mastery Threshold** | $\tau$ | `0.80` | Posterior threshold to certify mastery (`is_mastered = true`) |

---

## 3. Multi-Factor Recommendation Scoring (`ml/scoring.py`)

Candidate resources and skills are ranked using a multi-factor formula that balances learning gain, graph readiness, and student preference:

$$\text{Score} = w_1 \cdot \text{SkillGap} + w_2 \cdot \text{PrereqReadiness} + w_3 \cdot \text{PreferenceMatch} + w_4 \cdot \text{PredictedGain} + w_5 \cdot \text{Quality} + w_6 \cdot \text{GoalRelevance} - w_7 \cdot \text{Redundancy}$$

### Weight Breakdown:
- $w_1 = 0.25$ (**Skill Gap**): Priority on unmastered topics $(1 - P(L))$.
- $w_2 = 0.20$ (**Prerequisite Readiness**): DAG prerequisite fulfillment fraction.
- $w_3 = 0.15$ (**Preference Match**): Modality alignment (`hands_on`, `video`, `reading`).
- $w_4 = 0.15$ (**Predicted Gain**): Expected improvement $\Delta P(L) = (1 - P(L)) \cdot P(T)$.
- $w_5 = 0.10$ (**Resource Quality**): Baseline quality and curated difficulty alignment.
- $w_6 = 0.15$ (**Goal Relevance**): Inclusion in active target goal.
- $w_7 = 0.10$ (**Redundancy Penalty**): Avoids repetitive suggestions for recent items.

---

## 4. Synthetic Learner Simulator & Evaluation (`ml/synthetic_data.py`)

To empirically validate the BKT engine without relying on live learner logs during hackathon judging, `synthetic_data.py` simulates cohorts of learners with hidden ground-truth abilities:

- **Metrics Evaluated**:
  - **RMSE**: Root Mean Squared Error between predicted $P(L)$ and true latent knowledge.
  - **MAE**: Mean Absolute Error.
  - **AUC-ROC**: Discrimination ability between mastered vs unmastered states.
  - **Calibration Curve**: Grouped decile bins comparing predicted probabilities to empirical accuracy.

---

## 5. Judge Q&A Cheatsheet

1. **Q: Why BKT instead of a standard Deep Knowledge Tracing (DKT / LSTM / Transformer)?**
   - *Answer*: BKT provides **exact Bayesian explainability**. Every posterior probability update can be decomposed into an exact mathematical fraction ($P(S)$, $P(G)$, $P(T)$), which allows our Gemini explanation agents to generate **zero-hallucination grounded justifications**. Neural models are black boxes that cannot guarantee numerical explainability.
2. **Q: How does BKT handle guessing and slipping?**
   - *Answer*: If a novice gets a question right, $P(G)=0.20$ dampens the increase so one lucky answer doesn't falsely certify mastery. If an expert gets a question wrong, $P(S)=0.10$ prevents their mastery from crashing immediately to zero.
3. **Q: How does the ML engine integrate with the DAG Planner?**
   - *Answer*: When BKT computes $P(L) \ge 0.80$, the node is marked `is_mastered = true`, which unlocks downstream prerequisite edges in the NetworkX graph and triggers localized path repair.
