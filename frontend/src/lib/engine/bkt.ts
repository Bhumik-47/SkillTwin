export const DEFAULT_BKT_PARAMS = {
  p_transit: 0.15,
  p_slip: 0.10,
  p_guess: 0.20,
  threshold: 0.80
};

export function bktStep(
  priorPL: number,
  isCorrect: boolean,
  params = DEFAULT_BKT_PARAMS
): { posteriorGivenEvidence: number; posterior: number } {
  const pL = Math.max(0.01, Math.min(0.99, priorPL));
  const { p_transit: pT, p_slip: pS, p_guess: pG } = params;

  let posteriorGivenEvidence: number;
  if (isCorrect) {
    const num = pL * (1 - pS);
    const den = num + (1 - pL) * pG;
    posteriorGivenEvidence = num / den;
  } else {
    const num = pL * pS;
    const den = num + (1 - pL) * (1 - pG);
    posteriorGivenEvidence = num / den;
  }

  const posteriorAfterTransition = posteriorGivenEvidence + (1 - posteriorGivenEvidence) * pT;
  const posterior = Math.round(posteriorAfterTransition * 100) / 100;

  return {
    posteriorGivenEvidence: Math.round(posteriorGivenEvidence * 100) / 100,
    posterior
  };
}

export function calculateConfidenceScore(attempts: number, masteryProb: number): number {
  const stability = Math.min(1.0, attempts / 5.0);
  const certainty = Math.abs(masteryProb - 0.5) * 2.0;
  return Math.round((0.6 * stability + 0.4 * certainty) * 100) / 100;
}
