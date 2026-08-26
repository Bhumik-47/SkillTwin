"""
SkillTwin Machine Learning & Cognitive Modeling Package
Implements Bayesian Knowledge Tracing (BKT), multi-factor recommendation scoring,
and synthetic learner simulation for calibration and evaluation.
"""
from ml.bkt import (
    BKTEngine,
    BKTParameters,
    update_mastery,
    batch_update_mastery,
    compute_confidence_score
)
from ml.scoring import (
    ResourceScorer,
    ScoringWeights,
    CandidateSkillContext,
    CandidateResourceContext,
    CandidateSkillContext as CandidateSkill,
    CandidateResourceContext as CandidateResource,
    ScoringBreakdown
)
from ml.synthetic_data import (
    SyntheticLearnerGenerator,
    SyntheticLearner,
    CalibrationBin,
    EvaluationReport,
    generate_synthetic_benchmark,
    evaluate_bkt_calibration
)
from ml.calibration import BKTCalibrator

__all__ = [
    "BKTEngine",
    "BKTParameters",
    "update_mastery",
    "batch_update_mastery",
    "compute_confidence_score",
    "ResourceScorer",
    "ScoringWeights",
    "CandidateSkillContext",
    "CandidateResourceContext",
    "CandidateSkill",
    "CandidateResource",
    "ScoringBreakdown",
    "SyntheticLearnerGenerator",
    "SyntheticLearner",
    "CalibrationBin",
    "EvaluationReport",
    "generate_synthetic_benchmark",
    "evaluate_bkt_calibration",
    "BKTCalibrator"
]
