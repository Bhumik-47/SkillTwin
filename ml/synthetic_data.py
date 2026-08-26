"""
Synthetic Learner Trajectory Simulator & BKT Calibration Engine
Generates synthetic learner cohorts with hidden ground-truth mastery states
to evaluate BKT estimation accuracy, RMSE, AUC-ROC, and reliability calibration curves.
"""
from dataclasses import dataclass, field
from typing import List, Dict, Any, Optional, Tuple
import json
import numpy as np

from ml.bkt import update_mastery, BKTParameters


@dataclass
class SyntheticLearner:
    """Simulated student with latent learning ability and ground-truth knowledge states."""
    learner_id: str
    base_ability: float                          # Learning rate scalar [0.05, 0.35]
    true_initial_mastery: Dict[str, bool]        # Ground-truth initial state per skill
    true_current_mastery: Dict[str, bool]        # Ground-truth evolving state per skill
    attempt_history: List[Dict[str, Any]] = field(default_factory=list)


@dataclass
class CalibrationBin:
    """Decile reliability calibration data point."""
    bin_lower: float
    bin_upper: float
    predicted_mean_prob: float
    observed_true_rate: float
    sample_count: int


@dataclass
class EvaluationReport:
    """Comprehensive evaluation metrics comparing BKT predictions to hidden ground truth."""
    total_predictions: int
    rmse: float
    mae: float
    auc_roc: float
    accuracy_at_threshold: float
    bkt_calibration_bins: List[CalibrationBin]

    def to_dict(self) -> Dict[str, Any]:
        return {
            "total_predictions": self.total_predictions,
            "rmse": round(self.rmse, 4),
            "mae": round(self.mae, 4),
            "auc_roc": round(self.auc_roc, 4),
            "accuracy_at_threshold": round(self.accuracy_at_threshold, 4),
            "calibration_curve": [
                {
                    "bin_range": f"{b.bin_lower:.1f}-{b.bin_upper:.1f}",
                    "predicted_prob": round(b.predicted_mean_prob, 3),
                    "empirical_accuracy": round(b.observed_true_rate, 3),
                    "count": b.sample_count
                }
                for b in self.bkt_calibration_bins if b.sample_count > 0
            ]
        }


class SyntheticLearnerGenerator:
    """
    Simulates realistic student learning trajectories over prerequisite skill graphs.
    """
    def __init__(self, seed: Optional[int] = 42):
        self.rng = np.random.default_rng(seed)

    def generate_cohort(
        self,
        num_learners: int = 100,
        skill_ids: Optional[List[str]] = None,
        attempts_per_skill: int = 5,
        default_bkt_params: Optional[BKTParameters] = None
    ) -> List[SyntheticLearner]:
        """
        Generates a cohort of synthetic learners and simulates their assessment responses.
        """
        skills = skill_ids or [
            "python_basics",
            "control_flow",
            "data_structures",
            "pandas_dataframes",
            "numpy_arrays",
            "linear_regression"
        ]
        params = default_bkt_params or BKTParameters()
        cohort: List[SyntheticLearner] = []

        for i in range(num_learners):
            learner_id = f"sim_usr_{i+1:03d}"
            # Ability varies across learners (affects transition probability P(T))
            ability = float(self.rng.beta(2, 5) * 0.4 + 0.05)
            
            # Initial mastery state sampled from prior P(L_0)
            initial_mastery = {
                s: bool(self.rng.random() < params.p_init)
                for s in skills
            }
            current_mastery = initial_mastery.copy()

            learner = SyntheticLearner(
                learner_id=learner_id,
                base_ability=ability,
                true_initial_mastery=initial_mastery,
                true_current_mastery=current_mastery
            )

            # Simulate practice attempts across skills
            for step, s in enumerate(skills):
                for att_idx in range(attempts_per_skill):
                    knows_skill = learner.true_current_mastery[s]
                    
                    # Compute response probability based on Slip and Guess
                    if knows_skill:
                        # Correct with prob (1 - Slip)
                        p_correct = 1.0 - params.p_slip
                    else:
                        # Correct with prob Guess
                        p_correct = params.p_guess

                    is_correct = bool(self.rng.random() < p_correct)
                    score = 1.0 if is_correct else float(self.rng.uniform(0.1, 0.5))

                    learner.attempt_history.append({
                        "learner_id": learner_id,
                        "skill_id": s,
                        "attempt_index": att_idx + 1,
                        "is_correct": is_correct,
                        "score": score,
                        "true_mastery_before": knows_skill
                    })

                    # Learning transition opportunity (student learns with prob P(T) * ability)
                    if not knows_skill:
                        p_learn = min(0.95, params.p_transit * (ability / 0.15))
                        if self.rng.random() < p_learn:
                            learner.true_current_mastery[s] = True

            cohort.append(learner)

        return cohort


def evaluate_bkt_calibration(
    cohort: List[SyntheticLearner],
    bkt_params: Optional[BKTParameters] = None
) -> EvaluationReport:
    """
    Evaluates BKT engine estimation accuracy against the hidden ground truth of synthetic learners.
    Computes RMSE, MAE, AUC-ROC, and reliability calibration curve.
    """
    params = bkt_params or BKTParameters()
    predictions: List[float] = []
    ground_truth: List[int] = []

    for learner in cohort:
        # Track estimated mastery per skill as learner submits attempts
        estimated_p: Dict[str, float] = {s: params.p_init for s in learner.true_initial_mastery}

        for att in learner.attempt_history:
            skill = att["skill_id"]
            true_state = 1 if att["true_mastery_before"] else 0
            prior_est = estimated_p[skill]

            # Record prediction before observation
            predictions.append(prior_est)
            ground_truth.append(true_state)

            # Update BKT estimate
            posterior = update_mastery(
                prior=prior_est,
                evidence=att["is_correct"],
                guess=params.p_guess,
                slip=params.p_slip,
                transit=params.p_transit
            )
            estimated_p[skill] = posterior

    y_pred = np.array(predictions)
    y_true = np.array(ground_truth)

    # 1. Error Metrics
    rmse = float(np.sqrt(np.mean((y_pred - y_true) ** 2)))
    mae = float(np.mean(np.abs(y_pred - y_true)))

    # 2. Threshold Classification Accuracy (tau = 0.80)
    binary_pred = (y_pred >= params.mastery_threshold).astype(int)
    acc = float(np.mean(binary_pred == y_true))

    # 3. AUC-ROC (Mann-Whitney U rank statistic or sklearn)
    try:
        from sklearn.metrics import roc_auc_score
        auc = float(roc_auc_score(y_true, y_pred))
    except Exception:
        # Fallback AUC calculation
        pos = y_pred[y_true == 1]
        neg = y_pred[y_true == 0]
        if len(pos) > 0 and len(neg) > 0:
            auc = float(np.mean([p > n for p in pos for n in neg] + [0.5 * (p == n) for p in pos for n in neg]))
        else:
            auc = 0.50

    # 4. Decile Calibration Curve
    bin_edges = np.linspace(0.0, 1.0, 11)
    bins: List[CalibrationBin] = []

    for idx in range(len(bin_edges) - 1):
        low, high = bin_edges[idx], bin_edges[idx + 1]
        mask = (y_pred >= low) & (y_pred <= high if idx == len(bin_edges) - 2 else y_pred < high)
        sample_count = int(np.sum(mask))

        if sample_count > 0:
            mean_pred = float(np.mean(y_pred[mask]))
            obs_rate = float(np.mean(y_true[mask]))
        else:
            mean_pred = (low + high) / 2.0
            obs_rate = 0.0

        bins.append(CalibrationBin(
            bin_lower=float(low),
            bin_upper=float(high),
            predicted_mean_prob=mean_pred,
            observed_true_rate=obs_rate,
            sample_count=sample_count
        ))

    return EvaluationReport(
        total_predictions=len(predictions),
        rmse=rmse,
        mae=mae,
        auc_roc=auc,
        accuracy_at_threshold=acc,
        bkt_calibration_bins=bins
    )


def generate_synthetic_benchmark(
    num_learners: int = 50,
    output_json_path: Optional[str] = None
) -> Dict[str, Any]:
    """
    Generates a full synthetic benchmark cohort and evaluation report.
    Optionally saves the report to disk.
    """
    generator = SyntheticLearnerGenerator(seed=42)
    cohort = generator.generate_cohort(num_learners=num_learners, attempts_per_skill=5)
    report = evaluate_bkt_calibration(cohort)

    result = {
        "evaluation_summary": report.to_dict(),
        "cohort_size": num_learners,
        "sample_learner_preview": {
            "learner_id": cohort[0].learner_id,
            "ability": round(cohort[0].base_ability, 3),
            "attempts_count": len(cohort[0].attempt_history)
        }
    }

    if output_json_path:
        with open(output_json_path, "w", encoding="utf-8") as f:
            json.dump(result, f, indent=2)

    return result


if __name__ == "__main__":
    benchmark = generate_synthetic_benchmark(num_learners=100)
    print("=== BKT Calibration & Evaluation Benchmark ===")
    print(json.dumps(benchmark["evaluation_summary"], indent=2))
