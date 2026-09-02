/* M3 — producteurs interchangeables, graphe obligatoire et relations O4. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const assets = join(root, 'assets');
for (const file of ['fit.data.js', 'contracts.js', 'construction.js', 'typologie.js', 'squelette.js', 'placement.js', 'generator.js', 'rules.js']) {
  vm.runInThisContext(fs.readFileSync(join(assets, file), 'utf8'));
}

const G = globalThis.TechnoHabGenerator;
const S = globalThis.TechnoHabSquelette;
const R = globalThis.TechnoHabRules;
const options = {
  surface: 180, bedrooms: 5, bathrooms: 2, separateKitchen: true,
  includeWc: true, priority: 'compact', shape: 'rectangle'
};
const program = G.buildProgram(options);
const strategies = S.strategiesPour(program);

assert.deepEqual(strategies.map((strategy) => strategy.id), ['barre', 'l', 'coude', 't', 'hall', 'jour-nuit']);
assert.equal(program.rooms.filter((room) => room.type === 'circulation').length, 1,
  'les branches appartiennent à un réseau de circulation unique');
assert.ok(program.rooms.find((room) => room.type === 'circulation').requestedBranches >= 2,
  'le besoin de ramification reste explicite dans le programme');

for (const strategy of strategies) {
  let pose = null;
  let last = null;
  for (let seed = 1; seed <= 80 && !pose; seed += 1) {
    const candidate = S.produire(program, options.surface, seed, strategy.id);
    last = candidate;
    if (candidate && candidate.pieces) pose = candidate;
  }
  assert.ok(pose, 'la stratégie ' + strategy.id + ' doit produire sur le programme pilote (' +
    (last && last.motif ? last.motif : 'sans motif') + ')');
  assert.equal(pose.strategy, strategy.id);
  assert.ok(pose.branches >= 1);
}

const plan = G.generatePlan(options, 1, 20260828);
assert.ok(['barre', 'l', 'coude', 't', 'hall', 'jour-nuit', 'typologie'].includes(plan.topologyStrategy));
assert.ok(plan.topologyFamily);
assert.ok(plan.topologyCandidatesCompared >= 1);
assert.ok(plan.topologyStrategiesCompared.length >= 1);

const mandatory = plan.adjacencyRequirements.filter((relation) => relation.degre === 'obligatoire');
for (const relation of mandatory) {
  const edge = plan.edges.find((candidate) =>
    (candidate.a === relation.a && candidate.b === relation.b) ||
    (candidate.a === relation.b && candidate.b === relation.a));
  assert.ok(edge && edge.contact + 0.005 >= relation.contact,
    'le producteur ne doit livrer qu’un graphe obligatoire tenu');
}

const roomIds = plan.rooms.map((room) => room.id);
const existing = plan.edges.find((edge) => roomIds.includes(edge.a) && roomIds.includes(edge.b) && edge.contact > 0.02);
assert.ok(existing, 'le pilote doit contenir une adjacence réalisée');
const doorPair = plan.portes.find((porte) => porte.entre && porte.entre.length === 2 &&
  roomIds.includes(porte.entre[0]) && roomIds.includes(porte.entre[1]));
assert.ok(doorPair, 'le pilote doit contenir une communication intérieure construite');
let missing = null;
for (let a = 0; a < roomIds.length && !missing; a += 1) {
  for (let b = a + 1; b < roomIds.length && !missing; b += 1) {
    const found = plan.edges.some((edge) =>
      (edge.a === roomIds[a] && edge.b === roomIds[b]) ||
      (edge.a === roomIds[b] && edge.b === roomIds[a]));
    if (!found) missing = { a: roomIds[a], b: roomIds[b] };
  }
}
assert.ok(missing, 'le pilote doit aussi contenir une paire non adjacente');

function violationsFor(relation) {
  const specimen = Object.assign({}, plan, { adjacencyRequirements: [relation] });
  return R.evaluatePlan(specimen).violations;
}
const relation = (pair, nature, degre, contact = 0) =>
  ({ a: pair.a, b: pair.b, kind: 'opening', nature, degre, contact });

assert.ok(!violationsFor(relation(existing, 'porte', 'obligatoire', Math.min(1, existing.contact)))
  .some((item) => item.ruleId === 'TH2D-ADJ-001'));
assert.ok(violationsFor(relation(missing, 'porte', 'obligatoire', 1))
  .some((item) => item.ruleId === 'TH2D-ADJ-001'));
assert.ok(violationsFor(relation({ a: doorPair.entre[0], b: doorPair.entre[1] }, 'porte', 'interdite'))
  .some((item) => item.ruleId === 'TH2D-ADJ-002'));
assert.ok(violationsFor(relation(missing, 'separation', 'souhaitable'))
  .some((item) => item.ruleId === 'TH2D-ADJ-003'));
assert.ok(violationsFor(relation(existing, 'separation', 'deconseillee'))
  .some((item) => item.ruleId === 'TH2D-ADJ-004'));

const scoringBoxes = [
  { id: 'a', type: 'living', x0: 0, y0: 0, x1: 4, y1: 4 },
  { id: 'b', type: 'bedroom', x0: 4, y0: 0, x1: 8, y1: 4 }
];
const scoringEdges = [{ a: 'a', b: 'b', contact: 4 }];
const scoringEnvelope = { width: 8, height: 4, volumes: [{ x: 0, y: 0, width: 8, height: 4 }] };
function scoreRelation(adjacencies, edges = scoringEdges) {
  return G.scoreCandidateDetails(scoringBoxes, edges, {
    desiredEdges: [], adjacencies, options: { priority: 'compact' }
  }, scoringEnvelope).breakdown;
}
const scoringPair = { a: 'a', b: 'b' };
assert.equal(scoreRelation([relation(scoringPair, 'separation', 'deconseillee')]).discouragedAdjacency, 18);
assert.equal(scoreRelation([relation(scoringPair, 'separation', 'interdite')]).forbiddenAdjacency, 220);
assert.equal(scoreRelation([relation(scoringPair, 'separation', 'souhaitable')], []).desiredAdjacency, 28);

console.log('M3/M5.0 : 6 stratégies, réseau ramifié, graphe obligatoire et 4 degrés O4 vérifiés.');
