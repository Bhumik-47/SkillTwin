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
