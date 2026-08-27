"""
Unit Tests for Machine Learning & Bayesian Knowledge Tracing (BKT) Engine
"""
import pytest
import numpy as np

from ml.bkt import (
    BKTParameters,
    update_mastery,
    batch_update_mastery,
    compute_confidence_score,
    BKTEngine
)
from ml.scoring import (
    ResourceScorer,
    ScoringWeights,
    CandidateSkillContext,
    CandidateResourceContext
)
from ml.synthetic_data import (
    SyntheticLearnerGenerator,
    evaluate_bkt_calibration,
    generate_synthetic_benchmark
)


def test_bkt_correct_attempt_increases_mastery():
    prior = 0.20
    posterior = update_mastery(prior, evidence=True, guess=0.20, slip=0.10, transit=0.15)
    
    # Mathematical calculation:
    # P(L | Correct) = (0.20 * 0.90) / (0.20 * 0.90 + 0.80 * 0.20) = 0.18 / (0.18 + 0.16) = 0.18 / 0.34 ≈ 0.5294
    # P(L_next) = 0.5294 + (1 - 0.5294) * 0.15 ≈ 0.5294 + 0.07059 = 0.60
    assert posterior > prior
    assert 0.55 < posterior < 0.65


def test_bkt_incorrect_attempt_decreases_or_dampens_mastery():
    prior = 0.70
    posterior = update_mastery(prior, evidence=False, guess=0.20, slip=0.10, transit=0.15)
    
    # Mathematical calculation:
    # P(L | Incorrect) = (0.70 * 0.10) / (0.70 * 0.10 + 0.30 * 0.80) = 0.07 / (0.07 + 0.24) = 0.07 / 0.31 ≈ 0.2258
    # P(L_next) = 0.2258 + (1 - 0.2258) * 0.15 ≈ 0.3419
    assert posterior < prior


def test_bkt_asymptotic_convergence_to_mastery():
    # 5 consecutive correct answers starting from prior=0.10
    trajectory = batch_update_mastery(
        prior=0.10,
        evidences=[True, True, True, True, True],
        params=BKTParameters(p_init=0.10, p_transit=0.15, p_slip=0.10, p_guess=0.20)
    )
    assert len(trajectory) == 6
    assert trajectory[0] == 0.10
    # Mastery should strictly increase monotonically and exceed 0.80
    for i in range(len(trajectory) - 1):
        assert trajectory[i + 1] > trajectory[i]
    assert trajectory[-1] >= 0.80


def test_bkt_engine_evaluation_diagnostics():
    engine = BKTEngine()
    result = engine.evaluate_attempt(
        skill_id="python_basics",
        prior_mastery_prob=0.30,
        score=0.90,
        total_attempts_prior=1
    )
    assert result["is_correct"] is True
    assert result["posterior_mastery_prob"] > 0.30
    assert result["total_attempts"] == 2
    assert "bkt_evidence_summary" in result
    assert "P(L)" in result["bkt_evidence_summary"]


def test_confidence_score_growth():
    c0 = compute_confidence_score(total_attempts=0, mastery_prob=0.50)
    c1 = compute_confidence_score(total_attempts=1, mastery_prob=0.50)
    c5 = compute_confidence_score(total_attempts=5, mastery_prob=0.95)
    
    assert c0 == 0.0
    assert c1 > c0
    assert c5 > c1
    assert c5 <= 1.0


def test_scoring_weights_and_ranking():
    scorer = ResourceScorer()

    # High readiness skill vs locked skill
    ready_skill = CandidateSkillContext(
        skill_id="python_basics",
        current_mastery_prob=0.30,
        prereq_readiness=1.0,
        is_in_goal=True,
        goal_relevance=1.0
    )
    locked_skill = CandidateSkillContext(
        skill_id="deep_learning",
        current_mastery_prob=0.05,
        prereq_readiness=0.0,
        is_in_goal=True,
        goal_relevance=1.0
    )
    resource = CandidateResourceContext(
        resource_id="res_01",
        skill_id="python_basics",
        resource_type="coding_exercise",
        difficulty="beginner"
    )

    score_ready, breakdown_ready = scorer.score(ready_skill, resource, preferred_learning_style="hands_on")
    score_locked, breakdown_locked = scorer.score(locked_skill, resource, preferred_learning_style="hands_on")

    assert score_ready > score_locked
    assert breakdown_ready.prereq_term > breakdown_locked.prereq_term
    assert breakdown_ready.to_grounding_dict()["total_score"] == round(score_ready, 4)


def test_synthetic_cohort_generation_and_calibration():
    generator = SyntheticLearnerGenerator(seed=42)
    cohort = generator.generate_cohort(num_learners=20, attempts_per_skill=4)
    
    assert len(cohort) == 20
    assert len(cohort[0].attempt_history) > 0

    report = evaluate_bkt_calibration(cohort)
    assert report.total_predictions > 0
    assert 0.0 <= report.rmse <= 1.0
    assert 0.0 <= report.mae <= 1.0
    assert report.auc_roc > 0.50  # Must perform substantially better than random guess (0.50)
    assert len(report.bkt_calibration_bins) == 10


def test_synthetic_benchmark_json_output(tmp_path):
    out_file = tmp_path / "benchmark.json"
    benchmark = generate_synthetic_benchmark(num_learners=10, output_json_path=str(out_file))
    
    assert out_file.exists()
    assert "evaluation_summary" in benchmark
    assert "calibration_curve" in benchmark["evaluation_summary"]
