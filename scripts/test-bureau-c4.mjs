/* C-P4b — contrat C4 du bureau autonome, activé par L1. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
['canonical-values.data.js', 'canonical-values.js', 'fit.data.js', 'contracts.js',
  'socle.data.js', 'room-model.js', 'placement.js']
  .forEach((file) => { new Function(readFileSync(join(root, 'assets', file), 'utf8'))(); });

const canonical = globalThis.TechnoHabCanonicalValues;
const contracts = globalThis.TechnoHabContracts;
const fit = globalThis.TechnoHabFit;
const model = globalThis.TechnoHabRoomModel;
const placement = globalThis.TechnoHabPlacement;
const socle = globalThis.TechnoHabSocle;

assert.equal(contracts.profiles.bureau.maturity, 'C4');
assert.deepEqual(socle.rooms.bureau.trigger,
  { kind: 'count', from: 'offices', variantFrom: 'officeVariant' });
assert.deepEqual(fit.floorOf('bureau', 'compact'), { area: 5, side: 1.8 });
assert.deepEqual(fit.floorOf('bureau', 'convertible'), { area: 9, side: 2.5 });

const compact = model.designate('bureau', 'compact', { area: 5 });
assert.equal(compact.valid, true);
assert.deepEqual(compact.equipments.map((item) => item.id), ['desk', 'office_chair']);
assert.deepEqual(compact.equipments[0].footprint, { w: 1.2, d: 0.6 });
assert.deepEqual(compact.equipments[1].footprint, { w: 0.5, d: 0.5 });
assert.deepEqual(compact.equipments[1].usage[0], {
  face: 'back', min: 0.6, target: 0.8, comfort: 0.9
});
assert.equal(compact.relations.filter((relation) => relation.level === 'HARD').length, 1);
assert.equal(compact.relations[0].kind, 'workstation');

const medium = model.designate('bureau', 'compact', { area: 7 });
assert.deepEqual(medium.equipments.map((item) => item.id), ['desk', 'office_chair', 'bookcase']);
assert.equal(medium.equipments[0].size, 'desk_140');
const large = model.designate('bureau', 'compact', { area: 10 });
assert.equal(large.equipments[0].size, 'desk_180');

for (const rectangle of [{ w: 1.8, h: 2.8 }, { w: 2, h: 2.5 }]) {
  assert.equal(placement.validate(compact.equipments, rectangle, {
    relations: compact.relations
  }).fits, true, 'le bureau compact tient dans ' + rectangle.w + ' × ' + rectangle.h);
}
const refused = placement.validate(compact.equipments, { w: 1.1, h: 1.1 }, {
  relations: compact.relations
});
assert.equal(refused.fits, false, 'un local sans recul de siège doit être refusé');
assert.equal(refused.reason.code, 'EQUIPMENT_CANNOT_BE_PLACED');

// La variante convertible doit pouvoir recevoir séparément le programme de
// travail et le programme minimal d'une chambre enfant dans la même enveloppe.
const convertibleRect = { w: 2.5, h: 3.6 };
const convertibleOffice = model.designate('bureau', 'convertible', { area: 9 });
const childBedroom = model.designate('bedroom', 'enfant', { area: 9 });
assert.equal(placement.validate(convertibleOffice.equipments, convertibleRect, {
  relations: convertibleOffice.relations
}).fits, true);
assert.equal(placement.validate(childBedroom.equipments, convertibleRect, {
  relations: childBedroom.relations
}).fits, true,
'convertible signifie que la même enveloppe accepte aussi le programme chambre, sans les cumuler');

// Porte, battant, fenêtre et parcours S4 sont contrôlés sur le cas compact.
const room = {
  id: 'bureau', usableBounds: { x0: 0, y0: 0, x1: 2.5, y1: 2.8 },
  usablePolygon: [], wallFaces: []
};
const spatial = placement.roomContext(room, {
  portes: [{
    id: 'door', entre: ['bureau', 'circulation'], x: -0.05, y: 1.4,
    axe: 'vertical', bayWidth: 0.83, ouvreVers: 'bureau',
    debattement: { x0: 0, y0: 0.985, x1: 0.83, y1: 1.815 }
  }],
  fenetres: [{
    id: 'window', entre: ['bureau', 'exterior'], x: 1.25, y: -0.15,
    axe: 'horizontal', bayWidth: 1.2
  }]
});
const first = placement.validate(compact.equipments, spatial.rectangle, {
  relations: compact.relations, context: spatial.context, s4: true
});
const passing = first.fits ? first : placement.optimize(compact.equipments, spatial.rectangle, {
  relations: compact.relations, context: spatial.context, s4: true,
  validation: first, seed: 'bureau-c4', attempts: 16
});
assert.equal(passing.fits, true);
assert.equal(passing.s4.passes, true, 'la porte rejoint la zone d’usage du poste');
assert.equal(spatial.context.openings.some((opening) => opening.kind === 'window'), true);
const deskPlacement = passing.placements.find((item) => item.equipment.id === 'desk');
const chairPlacement = passing.placements.find((item) => item.equipment.id === 'office_chair');
const deskCenter = {
  x: (deskPlacement.footprint.x0 + deskPlacement.footprint.x1) / 2,
  y: (deskPlacement.footprint.y0 + deskPlacement.footprint.y1) / 2
};
const chairCenter = {
  x: (chairPlacement.footprint.x0 + chairPlacement.footprint.x1) / 2,
  y: (chairPlacement.footprint.y0 + chairPlacement.footprint.y1) / 2
};
const axialOffset = Math.abs((chairCenter.x - deskCenter.x) * -deskPlacement.inward.y +
  (chairCenter.y - deskCenter.y) * deskPlacement.inward.x);
assert.ok(axialOffset <= 0.155, 'la chaise doit rester dans l’axe du plateau');
assert.ok(chairPlacement.usage.length > 0, 'la chaise doit conserver son recul arrière');

for (const id of [
  'VAL-OFFICE-PROGRAM-AREA-MIN-COMPACT-001',
  'VAL-OFFICE-PROGRAM-AREA-MIN-CONVERTIBLE-001',
  'VAL-OFFICE-DESK-FOOTPRINT-001', 'VAL-OFFICE-CHAIR-FOOTPRINT-001',
  'VAL-OFFICE-CHAIR-CLEARANCE-BACK-MIN-001',
  'VAL-OFFICE-BOOKCASE-FOOTPRINT-001'
]) assert.ok(canonical.get(id), id + ' doit être inscrit au canon');

console.log('C-P4b : bureau C4, variantes, gammes, refus, ouvrants, fenêtre et S4 vérifiés.');
