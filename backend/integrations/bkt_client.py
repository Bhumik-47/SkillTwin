"""
Typed Integration Interface for Bayesian Knowledge Tracing (BKT)
Delegates to /ml/bkt.py if implemented, with standard BKT contract fallback.
Strictly adheres to /shared/schema.md Section 5.
"""
from dataclasses import dataclass
from typing import Optional
import math
import logging

logger = logging.getLogger("skilltwin.integrations.bkt")

# Check if ml.bkt module is present in the codebase
try:
    import ml.bkt as ml_bkt
    HAS_ML_BKT = True
except ImportError:
    ml_bkt = None
    HAS_ML_BKT = False


@dataclass
class BKTUpdateResult:
    prior_mastery: float
    posterior_mastery: float
    is_mastered: bool
    confidence_score: float
    p_transit: float
    p_slip: float
    p_guess: float
    source: str


class BKTIntegrationClient:
    """
    Standard typed interface for Bayesian Knowledge Tracing updates.
    """
    MASTERY_THRESHOLD = 0.80
    DEFAULT_P_TRANSIT = 0.15
    DEFAULT_P_SLIP = 0.10
    DEFAULT_P_GUESS = 0.20

    @classmethod
    def compute_update(
        cls,
        prior_mastery: float,
        is_correct: bool,
        total_attempts: int,
        p_transit: Optional[float] = None,
        p_slip: Optional[float] = None,
        p_guess: Optional[float] = None,
    ) -> BKTUpdateResult:
        """
        Execute forward Bayesian Knowledge Tracing update step.
        """
        p_trans = p_transit if p_transit is not None else cls.DEFAULT_P_TRANSIT
        p_sl = p_slip if p_slip is not None else cls.DEFAULT_P_SLIP
        p_gu = p_guess if p_guess is not None else cls.DEFAULT_P_GUESS

        # Clamp prior to valid probability range (0.001 - 0.999 to avoid division by zero)
        p_l = max(0.001, min(0.999, float(prior_mastery)))

        # If ml/bkt.py exists and provides update_bkt or forward_step, delegate to it
        if HAS_ML_BKT and hasattr(ml_bkt, "update_bkt"):
            try:
                res = ml_bkt.update_bkt(
                    p_l=p_l,
                    is_correct=is_correct,
                    p_transit=p_trans,
                    p_slip=p_sl,
                    p_guess=p_gu,
                    total_attempts=total_attempts
                )
                return BKTUpdateResult(
                    prior_mastery=round(p_l, 4),
                    posterior_mastery=round(res["mastery_prob"], 4),
                    is_mastered=res["mastery_prob"] >= cls.MASTERY_THRESHOLD,
                    confidence_score=round(res.get("confidence_score", 0.8), 4),
                    p_transit=p_trans,
                    p_slip=p_sl,
                    p_guess=p_gu,
                    source="ml.bkt"
                )
            except Exception as e:
                logger.warning(f"ml.bkt invocation failed: {e}. Falling back to internal BKT formula.")

        # Standard BKT Mathematical Formulation (shared/schema.md Section 5)
        # 1. Observation Update P(L_t | Evidence)
        if is_correct:
            numerator = p_l * (1.0 - p_sl)
            denominator = numerator + ((1.0 - p_l) * p_gu)
        else:
            numerator = p_l * p_sl
            denominator = numerator + ((1.0 - p_l) * (1.0 - p_gu))

        p_l_given_obs = numerator / max(denominator, 1e-9)

        # 2. Learning Transition Step P(L_{t+1})
        posterior = p_l_given_obs + ((1.0 - p_l_given_obs) * p_trans)
        posterior = max(0.0, min(1.0, posterior))

        # 3. Confidence score estimation based on total evidence count
        # As total attempts increase, confidence asymptotically approaches 1.0
        confidence = 1.0 - math.exp(-0.6 * (total_attempts + 1))
        confidence = round(max(0.1, min(0.99, confidence)), 4)

        return BKTUpdateResult(
            prior_mastery=round(p_l, 4),
            posterior_mastery=round(posterior, 4),
            is_mastered=posterior >= cls.MASTERY_THRESHOLD,
            confidence_score=confidence,
            p_transit=p_trans,
            p_slip=p_sl,
            p_guess=p_gu,
            source="ml_bkt_integration_client"
        )
