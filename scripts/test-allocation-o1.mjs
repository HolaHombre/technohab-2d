/* O1 — la surface suit l'enveloppe fonctionnelle et l'agrément. */
import assert from 'node:assert/strict';

import '../assets/fit.data.js';
import '../assets/construction.js';
import '../assets/typologie.js';
import '../assets/squelette.js';
import '../assets/generator.js';
import '../assets/rules.js';

const generator = globalThis.TechnoHabGenerator;
const round = (value) => Number(value.toFixed(3));
const sum = (rooms) => round(rooms.reduce((total, room) => total + room.targetArea, 0));

// Un plafond atteint rend sa part au prochain bénéficiaire : ce n'est pas un
// prorata calculé une seule fois puis tronqué.
const waterfilled = generator.allocateTargetAreas([
  { id: 'borne', minArea: 10, agrement: 1, weight: 1, maxArea: 12 },
  { id: 'utile', minArea: 10, agrement: 1, weight: 1, maxArea: null }
], 30);
assert.equal(waterfilled[0].targetArea, 12);
assert.equal(waterfilled[1].targetArea, 18);
assert.equal(sum(waterfilled), 30);

// Agrément nul : plancher, puis fermeture. Le reliquat va à une pièce utile.
const closed = generator.allocateTargetAreas([
  { id: 'wc', minArea: 1.5, agrement: 0, weight: 0, maxArea: 2.08 },
  { id: 'living', minArea: 20, agrement: 1.4, weight: 10, maxArea: null }
], 40);
assert.equal(closed[0].targetArea, 1.5);
assert.equal(closed[1].targetArea, 38.5);
assert.equal(sum(closed), 40);

// Le comportement historique des demandes sous les planchers reste explicite
// tant que le contrat d'impossibilité ne prend pas la main : compression
// proportionnelle, sans privilégier une pièce.
const compressed = generator.allocateTargetAreas([
  { id: 'a', minArea: 10, agrement: 1, weight: 1, maxArea: null },
  { id: 'b', minArea: 20, agrement: 1, weight: 1, maxArea: null }
], 15);
assert.deepEqual(compressed.map((room) => room.targetArea), [5, 10]);

for (const surface of [45, 90, 250]) {
  const program = generator.buildProgram({
    surface,
    bedrooms: surface === 45 ? 1 : surface === 90 ? 3 : 5,
    bathrooms: 1,
    separateKitchen: true,
    includeWc: true
  });
  const wc = program.rooms.find((room) => room.id === 'wc');
  assert.equal(wc.agrement, 0);
  if (program.minimumTotal > surface) {
    assert.ok(wc.targetArea <= wc.minArea,
      `${surface} m² : un programme comprimé ne doit pas avantager le WC.`);
  } else {
    assert.equal(wc.targetArea, wc.minArea,
      `${surface} m² : le WC ne doit pas absorber le reliquat du programme.`);
  }
  assert.equal(wc.maxArea, 3.64,
    `${surface} m² : le plafond doit rester dérivé du besoin meublable.`);
  assert.equal(sum(program.rooms), surface,
    `${surface} m² : l'allocation doit conserver la surface demandée.`);
}

const ceilingRule = globalThis.TechnoHabRules.rules.find((rule) => rule.id === 'TH2D-ROOM-003');
assert.ok(ceilingRule, 'le plafond canonique doit participer au verdict HARD');
assert.equal(ceilingRule.canonicalValueId, 'VAL-WC-PROGRAM-AREA-MAX-RATIO-001');
assert.equal(ceilingRule.evaluate({
  rooms: [{ id: 'wc', type: 'wc', label: 'WC', area: 3.50, composedWith: [] }]
}).length, 0);
assert.equal(ceilingRule.evaluate({
  rooms: [{ id: 'wc', type: 'wc', label: 'WC', area: 3.80, composedWith: [] }]
}).length, 1);

for (const shape of ['square', 'rectangle', 'lShape', 'uShape']) {
  const plan = generator.generatePlan({
    surface: 110, bedrooms: 3, bathrooms: 1,
    separateKitchen: true, includeWc: true, shape
  }, 1, 700);
  const wc = plan.rooms.find((room) => room.id === 'wc');
  assert.ok(wc.area <= 3.69,
    `${shape} : la matérialisation ne doit pas reperdre le plafond du WC (${wc.area} m²).`);
  assert.equal(ceilingRule.evaluate(plan).length, 0,
    `${shape} : le verdict HARD doit confirmer l'enveloppe matérialisée.`);
}

console.log('O1 : water-filling plafonné · agrément nul fermé · surface conservée.');
