/* M3.0 — le score vise une longueur par besoin, et le calque la rend. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const assets = join(dirname(fileURLToPath(import.meta.url)), '..', 'assets');
for (const file of ['fit.data.js', 'contracts.js', 'construction.js', 'typologie.js', 'squelette.js', 'placement.js', 'generator.js', 'rules.js']) {
  vm.runInThisContext(fs.readFileSync(join(assets, file), 'utf8'));
}

const G = globalThis.TechnoHabGenerator;
const R = globalThis.TechnoHabRules;
const options = {
  surface: 60, bedrooms: 2, bathrooms: 1, separateKitchen: false,
  includeWc: false, priority: 'compact', shape: 'rectangle'
};
const program = G.buildProgram(options);
const circulation = program.rooms.find((room) => room.type === 'circulation');
assert.ok(circulation, 'le programme pilote doit demander une circulation');

const requested = program.desiredEdges.filter((edge) => edge.a === circulation.id || edge.b === circulation.id);
const edges = requested.map((edge) => ({ a: edge.a, b: edge.b, contact: 1 }));
const box = (length) => [{
  id: circulation.id, type: 'circulation', minArea: circulation.minArea,
  x0: 0, y0: 0, x1: length, y1: 1.2
}];
const envelope = { width: 12, height: 8, volumes: [{ x: 0, y: 0, width: 12, height: 8 }] };
const short = G.scoreCandidateDetails(box(4), edges, program, envelope);
const long = G.scoreCandidateDetails(box(8), edges, program, envelope);

assert.ok(short.breakdown.circulationLength > 0, 'la longueur doit être un critère explicite');
assert.ok(long.breakdown.circulationLength > short.breakdown.circulationLength * 3.9,
  'doubler la longueur doit coûter quadratiquement, à besoin constant');
assert.equal(short.circulation.requestedServices, long.circulation.requestedServices,
  'le besoin doit rester indépendant de la géométrie proposée');

// C-P1.2b modifie le classement d'usage : 20260827 choisit désormais une
// desserte directe sans pièce de circulation. La graine suivante conserve un
// témoin construit de la famille que ce test doit exercer.
const plan = G.generatePlan(options, 1, 20260828);
assert.equal(plan.circulationObjective.method, 'branch-service-span-v2');
assert.ok(plan.circulationObjective.longestBranch > 0);
assert.ok(plan.circulationObjective.scoringLength > 0);
assert.ok(plan.circulationObjective.share > 0 && plan.circulationObjective.share < 1);
assert.equal(plan.parcours.calque.method, 'grid-shortest-path-v1');
assert.ok(plan.parcours.calque.reachableCells > 0);
assert.ok(plan.parcours.desserte.max >= plan.parcours.desserte.mean);
assert.ok(Object.keys(plan.parcours.longueurs).length > 0);

const report = R.evaluatePlan(plan);
assert.ok(report.limites.some((item) => item.ruleId === 'TH2D-CIRC-004'),
  'la suspension de TH2D-CIRC-004 doit être visible comme limite');
assert.ok(!report.violations.some((item) => item.ruleId === 'TH2D-CIRC-004'),
  'une règle sans seuil externe ne doit pas juger le plan');

console.log('M3.0 : score de longueur, synthèse du calque et suspension explicite vérifiés.');
