/* C-P1.2a — dossier isolé de la chambre C4. */
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
const placement = globalThis.TechnoHabPlacement;
const socle = globalThis.TechnoHabSocle;
const model = globalThis.TechnoHabRoomModel;

assert.equal(contracts.profiles.bedroom.maturity, 'C4');
assert.deepEqual(socle.programFloor('bedroom', 'enfant'), { area: 9, side: 2.5 });
assert.deepEqual(socle.programFloor('bedroom', 'parentale'), { area: 11, side: 2.7 });
assert.deepEqual(fit.floorOf('bedroom', 'enfant'), { area: 9, side: 2.5 });
assert.deepEqual(fit.floorOf('bedroom', 'parentale'), { area: 11, side: 2.7 });

const generatedProgram = generator.buildProgram({
  surface: 75, bedrooms: 2, bathrooms: 1, separateKitchen: false, includeWc: true
});
const generatedBedrooms = generatedProgram.rooms.filter((room) => room.type === 'bedroom');
assert.deepEqual(generatedBedrooms.map((room) => [room.variant, room.minArea, room.minSide]), [
  ['parentale', 11, 2.7], ['enfant', 9, 2.5]
], 'le moteur consomme les planchers propres aux variantes');
const built = generator.generatePlan({
  surface: 75, bedrooms: 2, bathrooms: 1, separateKitchen: false,
  includeWc: true, shape: 'rectangle'
}, 1, 831201);
assert.deepEqual(built.rooms.filter((room) => room.type === 'bedroom')
  .sort((a, b) => a.id.localeCompare(b.id)).map((room) => [room.id, room.variant]), [
  ['bedroom_1', 'parentale'], ['bedroom_2', 'enfant']
], 'le BuiltPlan conserve la variante consommée');

const child = fit.programOf('bedroom', 'enfant');
const parent = fit.programOf('bedroom', 'parentale');
assert.deepEqual(child.equipments.map((item) => item.id), ['bed_90', 'wardrobe']);
assert.deepEqual(parent.equipments.map((item) => item.id), ['bed_140', 'wardrobe']);
assert.equal(parent.equipments.find((item) => item.id === 'wardrobe').opening, 'sliding');
assert.ok(parent.equipments.find((item) => item.id === 'bed_140').usage.some((usage) =>
  usage.face === 'foot' && usage.min === 0.6 && usage.target === 0.7 && usage.comfort === 0.9));
assert.equal(model.designate('bedroom', 'parentale', { area: 12 }).equipments[0].size, 'bed_160');
assert.equal(model.designate('bedroom', 'parentale', { area: 16 }).equipments[0].size, 'bed_180');
assert.equal(model.designate('bedroom', 'parentale', { area: 16, upgradeSizes: false })
  .equipments[0].size, undefined, 'une montée en gamme peut revenir au lit 140 si la proportion la refuse');

// Deux variantes et deux proportions chacune : le domaine n'impose aucune orientation.
for (const [program, rectangles] of [
  [child, [{ w: 3, h: 3 }, { w: 2.5, h: 3.6 }]],
  [parent, [{ w: 3.2, h: 3.5 }, { w: 2.7, h: 4.1 }]]
]) {
  for (const rectangle of rectangles) {
    assert.equal(placement.validate(program.equipments, rectangle, {
      relations: program.relations
    }).fits, true, 'la variante tient dans ' + rectangle.w + ' × ' + rectangle.h);
  }
}

const refused = placement.validate(parent.equipments, { w: 3, h: 3 }, {
  relations: parent.relations
});
assert.equal(refused.fits, false, 'un carré de 9 m² ne sert pas la fonction parentale consolidée');
assert.equal(refused.reason.code, 'EQUIPMENT_CANNOT_BE_PLACED');

// Porte intérieure, débattement, fenêtre et chemin S4 sont jugés ensemble.
const room = {
  id: 'bedroom_1', usableBounds: { x0: 0, y0: 0, x1: 3.5, y1: 3.8 },
  usablePolygon: [], wallFaces: []
};
const spatial = placement.roomContext(room, {
  portes: [{
    id: 'door', entre: ['bedroom_1', 'circulation'], x: -0.05, y: 1.9,
    axe: 'vertical', bayWidth: 0.83, ouvreVers: 'bedroom_1',
    debattement: { x0: 0, y0: 1.485, x1: 0.83, y1: 2.315 }
  }],
  fenetres: [{
    id: 'window', entre: ['bedroom_1', 'exterior'], x: 1.75, y: -0.15,
    axe: 'horizontal', bayWidth: 1.2
  }]
});
assert.equal(spatial.context.blocked.filter((zone) => !zone.footprintOnly).length, 1,
  'le débattement intérieur est une réservation S3');
assert.equal(spatial.context.openings.filter((opening) => opening.kind === 'window').length, 1);
const passing = placement.validate(parent.equipments, spatial.rectangle, {
  relations: parent.relations, context: spatial.context, s4: true
});
assert.equal(passing.fits, true);
assert.equal(passing.s4.passes, true, 'la porte rejoint toutes les zones requises');
for (const item of passing.placements) {
  for (const blocked of spatial.context.blocked) {
    const footprint = item.footprint;
    assert.equal(footprint.x0 < blocked.x1 && footprint.x1 > blocked.x0 &&
      footprint.y0 < blocked.y1 && footprint.y1 > blocked.y0, false,
    'aucune emprise ne recouvre baie ou débattement');
  }
}

const quality = placement.assessClearanceLevels(passing.placements, spatial.rectangle, spatial.context);
assert.ok(quality.targetRequired >= 3 && quality.comfortRequired >= 3,
  'minimum, cible et confort restent trois verdicts distincts');

for (const id of [
  'VAL-BED-PROGRAM-AREA-MIN-CHILD-001', 'VAL-BED-PROGRAM-AREA-MIN-PARENT-001',
  'VAL-EQ-001', 'VAL-EQ-002', 'VAL-BED-SIDE-MIN-001', 'VAL-BED-FOOT-MIN-001',
  'VAL-BED-WARDROBE-FOOTPRINT-001', 'VAL-BED-WARDROBE-CLEARANCE-MIN-001'
]) assert.ok(canonical.get(id), id + ' doit être inscrit au canon');
assert.equal(canonical.get('VAL-BED-PROGRAM-AREA-MIN-PARENT-001').value, 11);
assert.equal(canonical.get('VAL-BED-FOOT-TARGET-001').value, 0.7);
assert.equal(canonical.get('VAL-BED-WARDROBE-CLEARANCE-MIN-001').value, 0.7);

console.log('C-P1.2a : chambre C4, variantes, refus, ouvrants, fenêtre, porte et S4 vérifiés.');
