import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
for (const file of ['fit.data.js', 'placement.js', 'contracts.js', 'construction.js',
  'typologie.js', 'squelette.js', 'generator.js', 'rules.js']) {
  new Function(readFileSync(join(root, 'assets', file), 'utf8'))();
}

const fit = globalThis.TechnoHabFit;
const placement = globalThis.TechnoHabPlacement;
const generator = globalThis.TechnoHabGenerator;
const rules = globalThis.TechnoHabRules;

for (const type of Object.keys(fit.envelopes)) {
  const program = fit.programOf(type);
  assert.ok(Array.isArray(program.equipments), type + ' compile ses équipements');
  assert.ok(Array.isArray(program.relations), type + ' compile ses relations');
}
assert.equal(fit.programOf('kitchen').facingClearance, 1.2,
  'le passage entre linéaires opposés voyage dans le compilé');
assert.equal(placement.facingClearanceSatisfied([
  { footprint: { x0: 0, y0: 0, x1: 0.6, y1: 0.6 }, inward: { x: 1, y: 0 } },
  { footprint: { x0: 1.5, y0: 0, x1: 2.1, y1: 0.6 }, inward: { x: -1, y: 0 } }
], 1.2), false, '0,90 m entre deux linéaires opposés est refusé');
assert.equal(placement.facingClearanceSatisfied([
  { footprint: { x0: 0, y0: 0, x1: 0.6, y1: 0.6 }, inward: { x: 1, y: 0 } },
  { footprint: { x0: 1.8, y0: 0, x1: 2.4, y1: 0.6 }, inward: { x: -1, y: 0 } }
], 1.2), true, '1,20 m entre deux linéaires opposés est admis');

const modesWc = new Set();
let plans = 0;
for (const seed of [41, 42, 43, 44, 45, 46]) {
  const plan = generator.generatePlan({
    surface: 90, bedrooms: 3, bathrooms: 1,
    separateKitchen: true, includeWc: true, shape: 'rectangle'
  }, 1, seed);
  assert.equal(plan.usageObjective.validator, 'placement.validate');
  assert.ok(plan.usageObjective.candidatesCompared >= 1);
  assert.ok(plan.rooms.filter((room) => room.type !== 'circulation')
    .every((room) => room.usageValidation && typeof room.usageValidation.quality === 'number'),
  'le verdict final de chaque pièce équipée porte sa qualité d’usage');
  for (const door of plan.portes) {
    assert.ok(door.equipment && door.equipment.id, door.id + ' est un équipement');
    assert.ok(door.openingMode, door.id + ' porte le résultat du solveur d’ouverture');
    assert.equal(door.s3Passed, true, door.id + ' satisfait S3');
    if (door.entre.includes('wc')) modesWc.add(door.openingMode);
  }
  assert.equal(rules.evaluatePlan(plan).summary.hard, 0, 'le plan M2 reste sans violation HARD');
  plans += 1;
}
assert.ok(modesWc.has('inward') || modesWc.has('outward'),
  'le WC n’est plus condamné à une porte coulissante par son type');

const witness = generator.generatePlan({ surface: 75, bedrooms: 2, bathrooms: 1 }, 1, 7042);
witness.portes[0].s3Passed = false;
const s3 = rules.rules.find((rule) => rule.id === 'TH2D-DOOR-004');
assert.equal(s3.evaluate(witness).length, 1, 'la règle S3 détecte un débattement invalide');

console.log(`M2 : ${plans} plans · programmes compilés · objectif d’usage · portes objets · S3 vérifiée.`);
