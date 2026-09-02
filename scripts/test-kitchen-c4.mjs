/* C-P1.2c — dossier isolé de la cuisine C4. */
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
const fit = globalThis.TechnoHabFit;
const generator = globalThis.TechnoHabGenerator;
const model = globalThis.TechnoHabRoomModel;
const placement = globalThis.TechnoHabPlacement;

assert.equal(contracts.profiles.kitchen.maturity, 'C4');
assert.deepEqual(fit.floorOf('kitchen'), { area: 7, side: 1.85 });
const minimal = fit.programOf('kitchen');
assert.deepEqual(minimal.equipments.map((item) => item.id),
  ['sink', 'hob', 'worktop', 'fridge']);
assert.equal(minimal.facingClearance, 1.2);
assert.equal(minimal.relations.find((relation) => relation.code === 'KITCHEN-SEQUENCE-001').level, 'HARD');
const triangle = minimal.relations.find((relation) => relation.code === 'KITCHEN-TRIANGLE-001');
assert.equal(triangle.kind, 'perimeter-max');
assert.equal(triangle.level, 'GUIDELINE', 'le triangle classe une pose sans inventer un refus réglementaire');
assert.equal(triangle.max, 6.5);

const medium = model.designate('kitchen', null, { area: 9 });
assert.equal(medium.valid, true);
assert.deepEqual(medium.equipments.map((item) => item.id),
  ['sink', 'hob', 'worktop', 'fridge', 'dishwasher']);
assert.ok(medium.services.includes('ventilation'), 'l’extraction appartient à la pièce, pas à un appareil');
assert.equal(medium.equipments.find((item) => item.id === 'dishwasher').usage[0].min, 1.2,
  'le lave-vaisselle ouvert réserve un passage complet');

for (const rectangle of [{ w: 5, h: 4 }, { w: 4, h: 3 }]) {
  const validation = placement.validate(medium.equipments, rectangle, {
    relations: medium.relations, facingClearance: 1.2
  });
  const result = validation.fits ? validation : placement.optimize(medium.equipments, rectangle, {
    relations: medium.relations, facingClearance: 1.2,
    validation, seed: 'kitchen-c4-' + rectangle.w, attempts: 16
  });
  assert.equal(result.fits, true, 'la cuisine moyenne tient dans ' + rectangle.w + ' × ' + rectangle.h);
  const indexed = Object.fromEntries(result.placements.map((pose) => [pose.equipment.id, pose]));
  assert.equal(placement.relationSatisfied(medium.relations.find((relation) =>
    relation.code === 'KITCHEN-SEQUENCE-001'), indexed), true);
  assert.equal(placement.relationSatisfied(medium.relations.find((relation) =>
    relation.code === 'KITCHEN-TRIANGLE-001'), indexed), true);
}

const refused = placement.validate(minimal.equipments, { w: 1.5, h: 1.5 }, {
  relations: minimal.relations, facingClearance: 1.2
});
assert.equal(refused.fits, false, 'une boîte incapable de loger les quatre pôles est refusée');

const room = {
  id: 'kitchen', usableBounds: { x0: 0, y0: 0, x1: 5, y1: 4 },
  usablePolygon: [], wallFaces: []
};
const spatial = placement.roomContext(room, {
  portes: [{
    id: 'door', entre: ['kitchen', 'living'], x: -0.05, y: 2,
    axe: 'vertical', bayWidth: 0.83, ouvreVers: 'living'
  }],
  fenetres: [{
    id: 'window', entre: ['kitchen', 'exterior'], x: 2.5, y: -0.15,
    axe: 'horizontal', bayWidth: 1.2
  }]
});
const withOpenings = placement.validate(medium.equipments, spatial.rectangle, {
  relations: medium.relations, context: spatial.context, facingClearance: 1.2, s4: true
});
assert.equal(withOpenings.fits, true);
assert.equal(withOpenings.s4.passes, true);
assert.equal(withOpenings.s4.accessCount, 1, 'la fenêtre ne devient pas un accès');

const open = model.designate('living', null, { area: 30, openKitchen: true });
assert.deepEqual(open.programs, ['living', 'kitchen']);
for (const id of ['sink', 'hob', 'worktop', 'fridge', 'dishwasher']) {
  assert.equal(open.equipments.filter((item) => item.id === id).length, 1,
    id + ' survit une seule fois à la composition ouverte');
}

const separatePlan = generator.generatePlan({
  surface: 90, bedrooms: 3, bathrooms: 1,
  separateKitchen: true, includeWc: true, shape: 'rectangle'
}, 1, 20260901);
const generatedKitchen = separatePlan.rooms.find((candidate) => candidate.type === 'kitchen');
assert.ok(generatedKitchen);
assert.equal(generatedKitchen.equipmentProgram.authority, 'BuiltPlan');
assert.deepEqual(generatedKitchen.placements.map((pose) => pose.equipmentId).sort(),
  ['fridge', 'hob', 'sink', 'worktop']);

const openPlan = generator.generatePlan({
  surface: 75, bedrooms: 2, bathrooms: 1,
  separateKitchen: false, includeWc: true, shape: 'rectangle'
}, 1, 831201);
const generatedLiving = openPlan.rooms.find((candidate) => candidate.type === 'living');
assert.ok(generatedLiving.equipmentProgram.programs.includes('kitchen'));
for (const id of ['sink', 'hob', 'worktop', 'fridge']) {
  assert.equal(generatedLiving.placements.filter((pose) => pose.equipmentId === id).length, 1);
}

for (const id of [
  'VAL-KITCHEN-PROGRAM-AREA-MIN-001', 'VAL-KITCHEN-PROGRAM-SIDE-MIN-001',
  'VAL-KITCHEN-FACING-CLEARANCE-MIN-001', 'VAL-KITCHEN-SINK-FOOTPRINT-001',
  'VAL-KITCHEN-HOB-FOOTPRINT-001', 'VAL-KITCHEN-WORKTOP-FOOTPRINT-MIN-001',
  'VAL-KITCHEN-FRIDGE-FOOTPRINT-001', 'VAL-KITCHEN-APPLIANCE-CLEARANCE-MIN-001',
  'VAL-KITCHEN-DISHWASHER-ACTIVATION-AREA-001', 'VAL-KITCHEN-DISHWASHER-FOOTPRINT-001',
  'VAL-KITCHEN-DISHWASHER-SWING-CLEARANCE-MIN-001',
  'VAL-KITCHEN-TRIANGLE-PERIMETER-MAX-001'
]) assert.ok(canonical.get(id), id + ' doit être inscrit au canon');

console.log('C-P1.2c : cuisine C4, pôles, passage, triangle, optionnel, réseaux, ouvrants et composition vérifiés.');
