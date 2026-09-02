/* M5.0 — un bras de circulation doit desservir, et le L doit être un vrai
 * producteur orientable plutôt qu'un T amputé ou un couloir de façade. */
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
const S = globalThis.TechnoHabSquelette;
const R = globalThis.TechnoHabRules;
const VALUE_ID = 'VAL-CIRC-DEAD-LENGTH-WEIGHT-001';

const pilotOptions = {
  surface: 180, bedrooms: 5, bathrooms: 2,
  separateKitchen: true, includeWc: true, priority: 'compact', shape: 'rectangle'
};
const program = G.buildProgram(pilotOptions);
let coude = null;
for (let seed = 1; seed <= 100 && !coude; seed += 1) {
  const candidate = S.produire(program, pilotOptions.surface, seed, 'coude');
  if (candidate && candidate.pieces) coude = candidate;
}
assert.ok(coude, 'le producteur coude doit converger sur le pilote');
assert.equal(coude.famille, 'L');
assert.equal(coude.branches, 2);
const circulation = coude.pieces.find((piece) => piece.id === 'circulation');
assert.ok(circulation && circulation.parts.length === 2,
  'le coude doit porter deux parties logiques');
assert.ok(circulation.parts.some((part) => part.x1 - part.x0 > part.y1 - part.y0));
assert.ok(circulation.parts.some((part) => part.y1 - part.y0 > part.x1 - part.x0));
for (const transform of S.transformationIds) {
  const transformed = S.transformer(coude, transform);
  assert.equal(transformed.famille, 'L');
  assert.equal(transformed.branches, 2, transform + ' doit conserver le L à deux bras');
}

const witnesses = [[90, 15], [130, 18], [180, 9], [250, 18]];
function optionsFor(surface, variant) {
  return {
    surface,
    bedrooms: surface < 120 ? 3 : surface < 160 ? 4 : 5,
    bathrooms: surface >= 130 ? 2 : 1,
    separateKitchen: variant % 2 === 0,
    includeWc: true,
    priority: ['compact', 'light', 'economy'][variant % 3],
    shape: 'rectangle'
  };
}
function generate(surface, variant) {
  const seed = (20260829 + Math.imul(surface, 0x9E3779B1) + variant) >>> 0;
  return G.generatePlan(optionsFor(surface, variant), variant, seed);
}

globalThis.TechnoHabAblations = { disableM5BranchUtility: true };
const withoutM5 = witnesses.map(([surface, variant]) => generate(surface, variant));
globalThis.TechnoHabAblations = {};
const withM5 = witnesses.map(([surface, variant]) => generate(surface, variant));

const totals = (plans) => plans.reduce((sum, plan) => ({
  empty: sum.empty + plan.circulationObjective.emptyArmCount,
  dead: sum.dead + plan.circulationObjective.deadLength
}), { empty: 0, dead: 0 });
const ablated = totals(withoutM5);
const active = totals(withM5);
assert.ok(active.empty < ablated.empty,
  'M5 doit réduire les bras vides sur ses témoins problématiques');
assert.ok(active.dead < ablated.dead,
  'M5 doit raccourcir le reliquat sans desserte sur ses témoins problématiques');
assert.ok(withM5.some((plan) => plan.topologyFamily === 'L' && plan.topologyStrategy === 'coude'),
  'le L intérieur doit atteindre les plans publiés sans quota de famille');

for (const plan of withM5) {
  const objective = plan.circulationObjective;
  assert.equal(objective.branchMethod, 'door-incidence-logical-arms-v1');
  assert.equal(objective.armCount, objective.arms.length);
  assert.equal(objective.emptyArmCount,
    objective.arms.filter((arm) => arm.serviceCount === 0).length);
  const summed = objective.arms.reduce((sum, arm) => sum + arm.deadLength, 0);
  assert.ok(Math.abs(objective.deadLength - summed) < 0.02);
  assert.equal(objective.deadLengthCostValueId, VALUE_ID);
  assert.equal(plan.scoreBreakdown.circulationDeadLength, objective.deadLengthCost);
  assert.ok(plan.canonicalValues.some((reference) => reference.id === VALUE_ID));
  assert.equal(plan.s4.passes, true);
  assert.deepEqual(plan.wallDiagnostics.disconnectedUsableRooms, []);
  assert.ok(plan.rooms.every((room) => room.furnishable !== false));
  assert.equal(R.evaluatePlan(plan).summary.hard, 0);
}

console.log('M5.0 : L intérieur D4 et utilité des bras vérifiés · témoins ' +
  ablated.empty + '→' + active.empty + ' bras vides · ' +
  ablated.dead.toFixed(2) + '→' + active.dead.toFixed(2) + ' m sans desserte.');
