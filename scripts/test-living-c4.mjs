/* C-P1.2b — dossier isolé du séjour C4. */
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
const model = globalThis.TechnoHabRoomModel;
const placement = globalThis.TechnoHabPlacement;
const rules = globalThis.TechnoHabRules;

assert.equal(contracts.profiles.living.maturity, 'C4');
assert.deepEqual(fit.floorOf('living'), { area: 20, side: 3 });
const minimal = fit.programOf('living');
assert.deepEqual(minimal.equipments.map((item) => item.id), ['sofa', 'coffee_table']);
assert.equal(minimal.accessClearance, 0.7);
assert.equal(minimal.maxFurnitureRatio, 0.5);
assert.equal(minimal.relations.find((relation) => relation.code === 'LIVING-TABLE-001').kind, 'gap-range');

for (const rectangle of [{ w: 5, h: 4 }, { w: 3.2, h: 6.25 }]) {
  const result = placement.validate(minimal.equipments, rectangle, { relations: minimal.relations });
  assert.equal(result.fits, true, 'le séjour minimal tient dans ' + rectangle.w + ' × ' + rectangle.h);
  const occupancy = placement.assessOccupancy(result.placements, rectangle, minimal.maxFurnitureRatio);
  assert.equal(occupancy.passes, true);
  assert.ok(occupancy.ratio < 0.5);
}

const refused = placement.validate(minimal.equipments, { w: 1.5, h: 1.5 }, { relations: minimal.relations });
assert.equal(refused.fits, false, 'un carré de 2,25 m² ne sert pas le groupe canapé-table');

const extended = model.designate('living', null, { area: 22 });
assert.deepEqual(extended.equipments.map((item) => item.id), ['sofa', 'coffee_table', 'tv_unit', 'armchair']);
assert.ok(extended.relations.some((relation) => relation.code === 'LIVING-FOCAL-001'));
assert.ok(extended.relations.some((relation) => relation.code === 'LIVING-CONVERSATION-001'));
const extendedPose = placement.optimize(extended.equipments, { w: 6, h: 4 }, {
  relations: extended.relations, seed: 'living-c4', attempts: 12
});
assert.equal(extendedPose.fits, true, 'le média et le fauteuil optionnels disposent d’un témoin');
const indexed = Object.fromEntries(extendedPose.placements.map((pose) => [pose.equipment.id, pose]));
for (const relation of extended.relations) {
  assert.equal(placement.relationSatisfied(relation, indexed), true, relation.code + ' est géométriquement tenue');
}

const room = {
  id: 'living', usableBounds: { x0: 0, y0: 0, x1: 5, y1: 4 },
  usablePolygon: [], wallFaces: []
};
const spatial = placement.roomContext(room, {
  portes: [
    { id: 'door-west', entre: ['living', 'entry'], x: -0.05, y: 2, axe: 'vertical', bayWidth: 0.83 },
    { id: 'door-east', entre: ['living', 'bedroom_1'], x: 5.05, y: 2, axe: 'vertical', bayWidth: 0.83 }
  ],
  fenetres: [{ id: 'window', entre: ['living', 'exterior'], x: 2.5, y: -0.15, axe: 'horizontal', bayWidth: 1.2 }]
});
spatial.context.accessClearance = minimal.accessClearance;
const firstPassing = placement.validate(minimal.equipments, spatial.rectangle, {
  relations: minimal.relations, context: spatial.context, s4: true
});
const passing = firstPassing.fits ? firstPassing : placement.optimize(minimal.equipments, spatial.rectangle, {
  relations: minimal.relations, context: spatial.context, s4: true,
  validation: firstPassing, seed: 'living-through-c4', attempts: 16
});
assert.equal(passing.fits, true, 'le séjour minimal accepte deux accès et une fenêtre : ' + JSON.stringify(passing.reason));
assert.equal(passing.s4.passes, true);
assert.equal(passing.s4.accessCount, 2, 'la fenêtre ne devient pas un accès');
assert.equal(passing.s4.clearance, 0.7, 'la traversée consomme le seuil propre au séjour');
const occupancyRule = rules.rules.find((rule) => rule.id === 'TH2D-LIVING-001');
assert.equal(occupancyRule.level, 'GUIDELINE');
assert.equal(occupancyRule.canonicalValueId, 'VAL-LIVING-FURNITURE-RATIO-MAX-001');
assert.equal(occupancyRule.evaluate({ rooms: [{
  id: 'living', type: 'living', furnitureOccupancy: { passes: false, ratio: 0.56, maximum: 0.5 }
}] }).length, 1, 'un séjour sur-occupé devient visible sans devenir un refus HARD');

for (const id of [
  'VAL-LIVING-PROGRAM-AREA-MIN-001', 'VAL-LIVING-PROGRAM-SIDE-MIN-001',
  'VAL-LIVING-ACCESS-CLEARANCE-MIN-001', 'VAL-LIVING-FURNITURE-RATIO-MAX-001',
  'VAL-LIVING-SOFA-FOOTPRINT-001', 'VAL-LIVING-COFFEE-TABLE-FOOTPRINT-001',
  'VAL-LIVING-TABLE-GAP-MIN-001', 'VAL-LIVING-TABLE-GAP-MAX-001',
  'VAL-LIVING-CONVERSATION-MIN-001', 'VAL-LIVING-CONVERSATION-MAX-001'
]) assert.ok(canonical.get(id), id + ' doit être inscrit au canon');

console.log('C-P1.2b : séjour C4, fonctions différées, relations, occupation, refus, ouvrants et traversée vérifiés.');
