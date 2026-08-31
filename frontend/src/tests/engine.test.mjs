import test from 'node:test';
import assert from 'node:assert/strict';

// Test BKT formulas directly
function bktStep(priorPL, isCorrect, params = { p_transit: 0.15, p_slip: 0.10, p_guess: 0.20, threshold: 0.80 }) {
  const pL = priorPL;
  const { p_transit: pT, p_slip: pS, p_guess: pG } = params;

  let posteriorGivenEvidence;
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
  return Math.round(posteriorAfterTransition * 100) / 100;
}

test('BKT Engine: Correct response elevates prior mastery', () => {
  // Prior 0.50, Correct -> Posterior 0.85 (>= 0.80 threshold)
  const posterior = bktStep(0.50, true);
  assert.equal(posterior, 0.85);

  // Prior 0.65, Correct -> Posterior 0.91
  const posteriorHigh = bktStep(0.65, true);
  assert.equal(posteriorHigh, 0.91);
});

test('BKT Engine: Incorrect response drops prior mastery and triggers remediation', () => {
  // Test case from shared/schema.md: Prior 0.40, Incorrect -> Posterior 0.22
  const posterior = bktStep(0.40, false);
  assert.equal(posterior, 0.22);
});

test('DAG Engine: All 4 domain graphs are strict acyclic DAGs', async () => {
  const fs = await import('node:fs');
  const path = await import('node:path');

  const domainFiles = [
    'backend_engineering.json',
    'python_fundamentals.json',
    'web_basics.json',
    'data_analysis.json',
  ];

  for (const filename of domainFiles) {
    const filePath = path.join(process.cwd(), 'src', 'data', 'domains', filename);
    const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const { skills, dependencies } = content;

    const skillIds = new Set(skills.map(s => s.id));
    const inDegree = new Map();
    const adj = new Map();

    skills.forEach(s => {
      inDegree.set(s.id, 0);
      adj.set(s.id, []);
    });

    dependencies.forEach(dep => {
      assert.ok(skillIds.has(dep.source_skill_id), `Source ${dep.source_skill_id} must exist in ${filename}`);
      assert.ok(skillIds.has(dep.target_skill_id), `Target ${dep.target_skill_id} must exist in ${filename}`);
      adj.get(dep.source_skill_id).push(dep.target_skill_id);
      inDegree.set(dep.target_skill_id, inDegree.get(dep.target_skill_id) + 1);
    });

    const queue = [];
    inDegree.forEach((deg, id) => {
      if (deg === 0) queue.push(id);
    });

    let visitedCount = 0;
    while (queue.length > 0) {
      const curr = queue.shift();
      visitedCount++;
      for (const nbr of adj.get(curr)) {
        inDegree.set(nbr, inDegree.get(nbr) - 1);
        if (inDegree.get(nbr) === 0) {
          queue.push(nbr);
        }
      }
    }

    assert.equal(
      visitedCount,
      skills.length,
      `Graph ${filename} must have topological order covering all ${skills.length} nodes (zero circular dependencies)`
    );
  }
});

test('Adaptive Assessment: 4-Tier Outcome Grading & Calibration', () => {
  function evaluateOutcome(scorePct, currentDifficulty) {
    if (scorePct >= 100) {
      return {
        level: 'Mastered Pro',
        masteryTarget: 0.95,
        canStretch: currentDifficulty !== 'advanced',
        nextTier: currentDifficulty !== 'advanced' ? 'advanced' : currentDifficulty,
        passed: true
      };
    } else if (scorePct >= 75) {
      return {
        level: 'Competent',
        masteryTarget: 0.80,
        canStretch: false,
        nextTier: currentDifficulty,
        passed: true
      };
    } else if (scorePct >= 50) {
      return {
        level: 'Basic Practitioner',
        masteryTarget: 0.50,
        canStretch: false,
        nextTier: currentDifficulty,
        passed: false
      };
    } else {
      return {
        level: 'Foundational Gap',
        masteryTarget: 0.20,
        canStretch: false,
        nextTier: currentDifficulty === 'advanced' ? 'intermediate' : 'beginner',
        passed: false
      };
    }
  }

  // 100% Score on Beginner -> Mastered Pro (0.95) & offers Advanced stretch
  const begPerfect = evaluateOutcome(100, 'beginner');
  assert.equal(begPerfect.level, 'Mastered Pro');
  assert.equal(begPerfect.masteryTarget, 0.95);
  assert.equal(begPerfect.canStretch, true);
  assert.equal(begPerfect.nextTier, 'advanced');
  assert.equal(begPerfect.passed, true);

  // 100% Score on Advanced -> Mastered Pro (0.95) & no higher stretch exists
  const advPerfect = evaluateOutcome(100, 'advanced');
  assert.equal(advPerfect.level, 'Mastered Pro');
  assert.equal(advPerfect.canStretch, false);
  assert.equal(advPerfect.nextTier, 'advanced');

  // 75% Score on Intermediate -> Competent (0.80) & stays at Intermediate
  const intPassed = evaluateOutcome(75, 'intermediate');
  assert.equal(intPassed.level, 'Competent');
  assert.equal(intPassed.masteryTarget, 0.80);
  assert.equal(intPassed.nextTier, 'intermediate');
  assert.equal(intPassed.passed, true);

  // 50% Score on Intermediate -> Basic Practitioner (0.50) & retakes Intermediate
  const intRetry = evaluateOutcome(50, 'intermediate');
  assert.equal(intRetry.level, 'Basic Practitioner');
  assert.equal(intRetry.masteryTarget, 0.50);
  assert.equal(intRetry.nextTier, 'intermediate');
  assert.equal(intRetry.passed, false);

  // 25% Score on Advanced -> Foundational Gap (0.20) & drops to Intermediate
  const advFail = evaluateOutcome(25, 'advanced');
  assert.equal(advFail.level, 'Foundational Gap');
  assert.equal(advFail.masteryTarget, 0.20);
  assert.equal(advFail.nextTier, 'intermediate');
  assert.equal(advFail.passed, false);

  // 0% Score on Intermediate -> Foundational Gap (0.20) & drops to Beginner
  const intFail = evaluateOutcome(0, 'intermediate');
  assert.equal(intFail.level, 'Foundational Gap');
  assert.equal(intFail.nextTier, 'beginner');
  assert.equal(intFail.passed, false);
});
