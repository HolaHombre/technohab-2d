/* M4a.2 — terminaison intérieure et coût de façade distinct de l'entrée. */
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

const options = {
  surface: 180, bedrooms: 5, bathrooms: 2,
  separateKitchen: true, includeWc: true, priority: 'compact', shape: 'rectangle'
};
const program = G.buildProgram(options);
let hall = null;
for (let seed = 1; seed <= 100 && !hall; seed += 1) {
  const candidate = S.produire(program, options.surface, seed, 'hall');
  if (candidate.pieces && candidate.terminations.length) hall = candidate;
}
assert.ok(hall, 'la stratégie hall doit produire une terminaison intérieure');
assert.equal(hall.terminationMethod, 'interior-room-cap-v1');
assert.equal(new Set(hall.terminations.map((termination) => termination.receiver)).size,
  hall.terminations.length, 'une pièce ne reçoit jamais deux terminaisons');
hall.terminations.forEach((termination) => {
  const receiver = hall.pieces.find((piece) => piece.id === termination.receiver);
  assert.ok(receiver.parts.some((part) => part.role === 'termination'),
    termination.receiver + ' doit recevoir le capuchon retiré au réseau');
});
const partitionArea = hall.pieces.reduce((sum, piece) => sum + piece.parts.reduce((area, part) =>
  area + (part.x1 - part.x0) * (part.y1 - part.y0), 0), 0);
assert.ok(Math.abs(partitionArea - hall.surface) < 0.02,
  'la terminaison doit conserver exactement la surface de partition');

for (const transform of S.transformationIds) {
  const transformed = S.transformer(hall, transform);
  assert.equal(transformed.terminations.length, hall.terminations.length,
    transform + ' doit conserver la nature topologique des terminaisons');
}

const envelope = { width: 6, height: 6, volumes: [{ x: 0, y: 0, width: 6, height: 6 }] };
const common = [
  { id: 'living', type: 'living', x0: 0, y0: 0, x1: 6, y1: 2 },
  { id: 'bedroom_1', type: 'bedroom', x0: 0, y0: 3, x1: 6, y1: 6 }
];
const scoringProgram = { desiredEdges: [], adjacencies: [], options: { priority: 'compact' } };
const facade = G.scoreCandidateDetails(common.concat([
  { id: 'circulation', type: 'circulation', x0: 0, y0: 2, x1: 6, y1: 3 }
]), [], scoringProgram, envelope).circulationFacade;
const interior = G.scoreCandidateDetails(common.concat([
  { id: 'circulation', type: 'circulation', x0: 1, y0: 2, x1: 5, y1: 3 }
]), [], scoringProgram, envelope).circulationFacade;
assert.equal(facade.valueId, 'VAL-CIRC-FACADE-EXCESS-WEIGHT-001');
assert.equal(facade.entryAllowance, 0.9,
  'une seule largeur d’entrée est neutralisée dans le coût de façade');
assert.ok(facade.excess > 0 && facade.cost > 0,
  'la façade de circulation au-delà de l’entrée doit coûter au classement');
assert.equal(interior.cost, 0, 'une circulation intérieure ne consomme aucune façade');

let witnessed = null;
for (const surface of [90, 130, 180, 250]) {
  for (let variant = 0; variant < 25 && !witnessed; variant += 1) {
    const plan = G.generatePlan({
      surface,
      bedrooms: surface >= 180 ? 5 : surface >= 130 ? 4 : 3,
      bathrooms: surface >= 130 ? 2 : 1,
      separateKitchen: variant % 2 === 0,
      includeWc: true,
      priority: ['compact', 'light', 'economy'][variant % 3],
      shape: 'rectangle'
    }, variant, (20260829 + Math.imul(surface, 0x9E3779B1) + variant) >>> 0);
    if (plan.topologyTerminationMethod === 'interior-room-cap-v1' &&
        plan.circulationObjective.facadeLength === 0) witnessed = plan;
  }
}
assert.ok(witnessed, 'au moins un plan publié doit terminer tout son réseau à l’intérieur');
assert.ok(witnessed.topologyTerminations.length > 0);
assert.equal(witnessed.circulationObjective.terminationCount, witnessed.topologyTerminations.length);
assert.equal(witnessed.circulationObjective.facadeCost, 0);
assert.equal(witnessed.s4.passes, true);
assert.deepEqual(witnessed.wallDiagnostics.disconnectedUsableRooms, []);
assert.ok(witnessed.rooms.every((room) => room.furnishable !== false));
assert.equal(R.evaluatePlan(witnessed).summary.hard, 0,
  'la terminaison intérieure ne doit casser ni graphe, ni porte, ni S4, ni meublabilité');
assert.ok(witnessed.canonicalValues.some((reference) =>
  reference.id === 'VAL-CIRC-FACADE-EXCESS-WEIGHT-001'));

console.log('M4a.2 : hall intérieur, coût N3 de façade, D4 et plan construit sans HARD vérifiés.');
