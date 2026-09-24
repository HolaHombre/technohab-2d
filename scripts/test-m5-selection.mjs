/* M5 — filtre HARD, préférences target/comfort et tri-sélection contractuelle. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
['canonical-values.data.js', 'canonical-values.js', 'fit.data.js', 'placement.js',
  'contracts.js', 'construction.js', 'typologie.js', 'squelette.js',
  'generator.js', 'rules.js'].forEach((file) => {
  new Function(readFileSync(join(root, 'assets', file), 'utf8'))();
});

const G = globalThis.TechnoHabGenerator;
const P = globalThis.TechnoHabPlacement;
const R = globalThis.TechnoHabRules;
const options = {
  // PONDERATION §3.2 (24 septembre 2026) : le mode compact inverse
  // désormais l'objectif de confort au lieu de s'y ajouter — voir
  // generator.js, validatePlanUsage(). Ce fichier teste le mécanisme
  // GÉNÉRAL target/comfort, pas le compact ; 'compact' n'avait ici qu'une
  // valeur arbitraire et entrait en conflit avec ce nouveau comportement.
  // 'economy' garde l'intention du test intacte.
  surface: 90, bedrooms: 3, bathrooms: 1,
  separateKitchen: true, includeWc: true, priority: 'economy', shape: 'rectangle'
};

const clearance = P.assessClearanceLevels([{
  equipment: {
    id: 'pilot', required: true,
    usage: [{ face: 'front', min: 0.4, target: 0.6, comfort: 1.0 }]
  },
  footprint: { x0: 0, y0: 0, x1: 0.4, y1: 0.4 },
  inward: { x: 1, y: 0 }
}], { w: 1.2, h: 1.2 }, {});
assert.equal(clearance.targetRequired, 1);
assert.equal(clearance.targetMet, 1);
assert.equal(clearance.comfortRequired, 1);
assert.equal(clearance.comfortMet, 0,
  'comfort doit rester une préférence mesurée quand son agrandissement sort de la pièce');

const plan = G.generatePlan(options, 1, 20260830);
assert.equal(R.evaluatePlan(plan).summary.hard, 0);
assert.ok(plan.preferenceObjective.targetRequired > 0);
assert.ok(plan.preferenceObjective.comfortRequired > 0);
assert.equal(plan.preferenceObjective.targetMissed,
  plan.preferenceObjective.targetRequired - plan.preferenceObjective.targetMet);
assert.equal(plan.preferenceObjective.comfortMissed,
  plan.preferenceObjective.comfortRequired - plan.preferenceObjective.comfortMet);
assert.equal(plan.preferenceObjective.targetCost,
  plan.preferenceObjective.targetMissed * 6);
assert.equal(plan.preferenceObjective.comfortCost,
  plan.preferenceObjective.comfortMissed * 2);
assert.ok(plan.canonicalValues.some((entry) => entry.id === 'VAL-USAGE-TARGET-MISS-WEIGHT-001'));
assert.ok(plan.canonicalValues.some((entry) => entry.id === 'VAL-USAGE-COMFORT-MISS-WEIGHT-001'));

const originalEvaluate = R.evaluatePlan;
let verdictCalls = 0;
R.evaluatePlan = (candidate) => {
  verdictCalls += 1;
  if (verdictCalls === 1) {
    return { summary: { hard: 1, guideline: 0 }, violations: [{ ruleId: 'M5-PILOT-HARD' }], limites: [] };
  }
  return originalEvaluate(candidate);
};
const filtered = G.generatePlan(options, 2, 20260831);
R.evaluatePlan = originalEvaluate;
assert.ok(verdictCalls >= 2, 'le juge doit être rappelé après le candidat HARD');
assert.ok(filtered.hardCandidatesRejected >= 1,
  'le plan doit publier le nombre de BuiltPlan HARD écartés avant lui');
assert.equal(originalEvaluate(filtered).summary.hard, 0);

const selection = G.generateSelection(options, 1, 20260830, 3);
assert.equal(selection.kind, 'PlanSelection');
assert.equal(selection.status, 'COMPLETE');
assert.equal(selection.complete, true);
assert.equal(selection.results.length, 3);
assert.equal(new Set(selection.results.map((result) =>
  result.builtPlan.plan.comparison.signature)).size, 3);
assert.ok(selection.results.every((result) =>
  result.status === 'VALID' && result.verdict.hard === 0));
assert.ok(selection.results[0].builtPlan.plan.score <=
  Math.min(...selection.results.slice(1).map((result) => result.builtPlan.plan.score)),
  'le premier rang reste le meilleur score global');
assert.equal(selection.diversity.signatures, 3);

console.log('M5 : filtre HARD · target/comfort décomposés · 3 plans VALID et distincts.');
