# Bayesian Knowledge Tracing (BKT) & ML Engine

The `ml/` directory contains the mathematical and probabilistic engine powering SkillTwin's cognitive learner modeling. It implements **Bayesian Knowledge Tracing (BKT)** to infer a learner's latent mastery state from discrete assessment outcomes.

---

## 🧮 Mathematical Formulation

For each skill, the model maintains a latent mastery probability $P(L_t) \in [0.0, 1.0]$. Upon receiving new evidence (e.g. quiz submission or exercise evaluation), the model updates posterior mastery using Bayes' theorem:

### 1. Evidence Update (Posterior Calculation)

$$\begin{aligned}
P(L_{t+1} \mid \text{Correct}) &= \frac{P(L_t) \cdot (1 - P(S))}{P(L_t) \cdot (1 - P(S)) + (1 - P(L_t)) \cdot P(G)} \\
P(L_{t+1} \mid \text{Incorrect}) &= \frac{P(L_t) \cdot P(S)}{P(L_t) \cdot P(S) + (1 - P(L_t)) \cdot (1 - P(G))}
\end{aligned}$$

### 2. Learning Transition Step

$$P(L_{t+1}) = P(L_{t+1} \mid \text{Evidence}) + \Big(1 - P(L_{t+1} \mid \text{Evidence})\Big) \cdot P(T)$$

---

## ⚙️ Core Parameters

| Parameter | Symbol | Default | Description |
| :--- | :--- | :--- | :--- |
| **Initial Mastery** | $P(L_0)$ | `0.10` | Prior probability of knowing the skill before study |
| **Transition Probability** | $P(T)$ | `0.15` | Probability of learning the skill during a practice opportunity |
| **Slip Probability** | $P(S)$ | `0.10` | Probability of answering incorrectly despite having mastered the skill |
| **Guess Probability** | $P(G)$ | `0.20` | Probability of answering correctly by chance without knowing the skill |
| **Mastery Threshold** | $\tau$ | `0.80` | Minimum $P(L)$ required to classify skill as mastered (`is_mastered = true`) |

---

## 📂 Key Components

- **`bkt.py`**: Pure Python implementation of BKT forward step, batch update, and confidence score calculation.
- **`calibration.py`**: Parameter fitting and calibration utilities.
- **`evaluation.py`**: Accuracy, AUC-ROC, and Root Mean Squared Error (RMSE) validation against synthetic and benchmark learner response logs.
