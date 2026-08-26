"""
Bayesian Knowledge Tracing (BKT) Engine
Implements real-time latent cognitive mastery tracking with exact Bayes inference
and optional pyBKT dataset calibration.
"""
from dataclasses import dataclass, field
from typing import List, Dict, Any, Optional, Tuple, Union
import numpy as np

try:
    from pyBKT.models import Model as PyBKTModel
    HAS_PYBKT = True
except Exception:
    HAS_PYBKT = False


@dataclass
class BKTParameters:
    """
    Standard Bayesian Knowledge Tracing 4-parameter model configuration.
    """
    p_init: float = 0.10     # P(L_0): Prior probability of knowing the skill before observation
    p_transit: float = 0.15  # P(T): Transition/learning probability per opportunity
    p_slip: float = 0.10     # P(S): Probability of slip (incorrect answer despite knowing skill)
    p_guess: float = 0.20    # P(G): Probability of guess (correct answer without knowing skill)
    mastery_threshold: float = 0.80  # tau: Posterior probability threshold to classify as mastered

    def validate(self) -> None:
        """Validate parameter boundaries."""
        for name, val in [
            ("p_init", self.p_init),
            ("p_transit", self.p_transit),
            ("p_slip", self.p_slip),
            ("p_guess", self.p_guess),
            ("mastery_threshold", self.mastery_threshold)
        ]:
            if not (0.0 <= val <= 1.0):
                raise ValueError(f"BKT parameter {name} must be in [0.0, 1.0], got {val}")
        if self.p_guess + (1.0 - self.p_slip) <= 0.0:
            raise ValueError("Degenerate BKT parameters: slip and guess prevent inference.")


def update_mastery(
    prior: float,
    evidence: Union[bool, int, float],
    guess: float = 0.20,
    slip: float = 0.10,
    transit: float = 0.15
) -> float:
    """
    Computes single-step posterior mastery P(L_{t+1}) from observation evidence.

    Mathematical Formulation:
    1. Posterior given Observation (Bayes Rule):
       - If Correct (evidence == True or score >= 0.70):
         P(L_t | Correct) = [P(L_t) * (1 - P(S))] / [P(L_t) * (1 - P(S)) + (1 - P(L_t)) * P(G)]
       - If Incorrect (evidence == False or score < 0.70):
         P(L_t | Incorrect) = [P(L_t) * P(S)] / [P(L_t) * P(S) + (1 - P(L_t)) * (1 - P(G))]

    2. Learning Transition to Next Step:
       P(L_{t+1}) = P(L_t | Obs) + (1 - P(L_t | Obs)) * P(T)

    Returns:
        float: Posterior mastery probability in range [0.0, 1.0]
    """
    # Normalize evidence to boolean
    is_correct = bool(evidence >= 0.70) if isinstance(evidence, (int, float)) and not isinstance(evidence, bool) else bool(evidence)
    
    # Clamp prior to safe range to prevent division by zero
    p_l = float(np.clip(prior, 1e-6, 1.0 - 1e-6))
    p_s = float(np.clip(slip, 1e-6, 1.0 - 1e-6))
    p_g = float(np.clip(guess, 1e-6, 1.0 - 1e-6))
    p_t = float(np.clip(transit, 0.0, 1.0))

    if is_correct:
        numerator = p_l * (1.0 - p_s)
        denominator = numerator + (1.0 - p_l) * p_g
    else:
        numerator = p_l * p_s
        denominator = numerator + (1.0 - p_l) * (1.0 - p_g)

    # Posterior given evidence
    p_l_given_obs = numerator / denominator if denominator > 0 else p_l

    # Transition update (opportunity to learn)
    p_l_next = p_l_given_obs + (1.0 - p_l_given_obs) * p_t

    return float(np.clip(p_l_next, 0.0, 1.0))


def batch_update_mastery(
    prior: float,
    evidences: List[Union[bool, int, float]],
    params: Optional[BKTParameters] = None
) -> List[float]:
    """
    Computes sequential mastery trajectory across a list of assessment attempts.
    Returns the step-by-step posterior probabilities.
    """
    cfg = params or BKTParameters()
    current_p = prior
    trajectory = [current_p]

    for obs in evidences:
        current_p = update_mastery(
            prior=current_p,
            evidence=obs,
            guess=cfg.p_guess,
            slip=cfg.p_slip,
            transit=cfg.p_transit
        )
        trajectory.append(current_p)

    return trajectory


def compute_confidence_score(
    total_attempts: int,
    mastery_prob: float,
    target_evidence_count: int = 5
) -> float:
    """
    Computes confidence metric in the latent mastery estimate.
    Combines sample volume with distance from maximum entropy (0.50).
    """
    if total_attempts <= 0:
        return 0.0
    
    # Volume term (saturates smoothly at target_evidence_count)
    volume_factor = min(1.0, total_attempts / target_evidence_count)
    
    # Distance from uncertainty (0.50 is maximum uncertainty)
    certainty_factor = abs(mastery_prob - 0.50) * 2.0  # Scale to [0.0, 1.0]
    
    # Weighted confidence
    confidence = 0.6 * volume_factor + 0.4 * certainty_factor
    return float(np.clip(confidence, 0.0, 1.0))


class BKTEngine:
    """
    High-level BKT Cognitive Twin Orchestrator.
    Maintains per-skill parameter calibrations, runs updates, and formats grounding diagnostics.
    """
    def __init__(self, default_params: Optional[BKTParameters] = None):
        self.default_params = default_params or BKTParameters()
        self.skill_params: Dict[str, BKTParameters] = {}

    def set_skill_parameters(self, skill_id: str, params: BKTParameters) -> None:
        """Register calibrated parameters for a specific skill."""
        params.validate()
        self.skill_params[skill_id] = params

    def get_skill_parameters(self, skill_id: str) -> BKTParameters:
        """Retrieve parameters for a skill, falling back to defaults."""
        return self.skill_params.get(skill_id, self.default_params)

    def evaluate_attempt(
        self,
        skill_id: str,
        prior_mastery_prob: float,
        score: float,
        total_attempts_prior: int = 0
    ) -> Dict[str, Any]:
        """
        Evaluate a learner attempt and compute posterior cognitive state.
        
        Returns:
            dict matching schema.md specifications:
            - is_correct (bool)
            - prior_mastery_prob (float)
            - posterior_mastery_prob (float)
            - is_mastered (bool)
            - confidence_score (float)
            - bkt_evidence_summary (str)
        """
        params = self.get_skill_parameters(skill_id)
        is_correct = bool(score >= 0.70)
        
        posterior = update_mastery(
            prior=prior_mastery_prob,
            evidence=score,
            guess=params.p_guess,
            slip=params.p_slip,
            transit=params.p_transit
        )

        is_mastered = bool(posterior >= params.mastery_threshold)
        total_attempts = total_attempts_prior + 1
        confidence = compute_confidence_score(total_attempts, posterior)

        summary = (
            f"Prior P(L)={prior_mastery_prob:.2f} -> Posterior P(L)={posterior:.2f} "
            f"(Score={score:.2f}, Result={'PASS' if is_correct else 'FAIL'}, "
            f"Params: T={params.p_transit:.2f}, S={params.p_slip:.2f}, G={params.p_guess:.2f})"
        )

        return {
            "skill_id": skill_id,
            "is_correct": is_correct,
            "score": float(score),
            "prior_mastery_prob": round(float(prior_mastery_prob), 4),
            "posterior_mastery_prob": round(float(posterior), 4),
            "is_mastered": is_mastered,
            "confidence_score": round(float(confidence), 4),
            "total_attempts": total_attempts,
            "bkt_p_transit": params.p_transit,
            "bkt_p_slip": params.p_slip,
            "bkt_p_guess": params.p_guess,
            "bkt_evidence_summary": summary
        }
