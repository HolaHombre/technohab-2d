/* C-P2 — contrat C4 et largeur conditionnée de la circulation. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
['canonical-values.data.js', 'canonical-values.js', 'fit.data.js', 'contracts.js',
  'construction.js', 'typologie.js', 'squelette.js', 'generator.js',
  'socle.data.js', 'room-model.js', 'placement.js', 'rules.js']
  .forEach((file) => { new Function(readFileSync(join(root, 'assets', file), 'utf8'))(); });

const canonical = globalThis.TechnoHabCanonicalValues;
const contracts = globalThis.TechnoHabContracts;
const generator = globalThis.TechnoHabGenerator;
const rules = globalThis.TechnoHabRules;
const circulationRule = rules.rules.find((rule) => rule.id === 'TH2D-CIRC-001');

assert.equal(contracts.profiles.circulation.maturity, 'C4');
assert.equal(generator.minCirculationWidth, 0.9);
assert.equal(generator.crossingCirculationWidth, 1.2);
assert.equal(generator.circulationCrossingServices, 3);
for (const id of [
  'VAL-CIRC-PROGRAM-AREA-MIN-001', 'VAL-CIRC-CLEAR-WIDTH-SIMPLE-MIN-001',
  'VAL-CIRC-CLEAR-WIDTH-CROSSING-MIN-001', 'VAL-CIRC-CROSSING-SERVICE-COUNT-001',
  'VAL-CIRC-CLEAR-WIDTH-MAX-001'
]) assert.ok(canonical.get(id), id + ' doit appartenir au canon C4');

function plan(width, served) {
  const rooms = [{
    id: 'circulation', type: 'circulation', label: 'Circulation',
    parts: [{ x0: 0, y0: 0, x1: 4, y1: width }]
  }];
  const edges = [];
  for (let index = 0; index < served; index += 1) {
    const id = 'room_' + index;
    rooms.push({ id, type: 'bedroom', label: id });
    edges.push({ a: 'circulation', b: id });
  }
  return {
    rooms, edges, minCirculationWidth: 0.9, crossingCirculationWidth: 1.2,
    circulationCrossingServices: 3
  };
}

assert.equal(circulationRule.evaluate(plan(0.95, 2)).length, 0,
  '0,95 m suffit à une desserte simple de deux espaces');
assert.equal(circulationRule.evaluate(plan(0.85, 2))[0].seuil, 0.9,
  'une desserte simple est refusée sous 0,90 m');
assert.equal(circulationRule.evaluate(plan(0.95, 3))[0].seuil, 1.2,
  'trois dessertes déclenchent la largeur de croisement');
assert.equal(circulationRule.evaluate(plan(1.2, 3)).length, 0,
  '1,20 m satisfait une circulation à croisement probable');

for (const [index, shape] of ['rectangle', 'l', 't'].entries()) {
  const built = generator.generatePlan({
    surface: 100, bedrooms: 3, bathrooms: 1,
    separateKitchen: false, includeWc: true, shape
  }, index + 1, 20260910 + index);
  assert.ok(built.topologyFamily, 'la famille topologique doit être publiée');
  const circulation = built.rooms.filter((room) => room.type === 'circulation');
  assert.ok(circulation.length, 'le programme doit produire une circulation');
  assert.equal(circulation.flatMap((room) => circulationRule.evaluate(built)).length, 0,
    'la circulation générée doit satisfaire sa largeur conditionnée');
  assert.ok((built.portes || []).filter((door) => (door.entre || []).some((id) =>
    circulation.some((room) => room.id === id))).every((door) => door.s3Passed !== false),
  'les portes de desserte doivent participer au verdict S3');
}

console.log('C-P2 circulation C4 : largeur conditionnée, canon, formes et portes vérifiés.');
