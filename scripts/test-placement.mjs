import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import '../assets/placement.js';

const technohabRoot = join(dirname(fileURLToPath(import.meta.url)), '..');

new Function(readFileSync(join(technohabRoot, 'assets/socle.data.js'), 'utf8'))();
new Function(readFileSync(join(technohabRoot, 'assets/fit.data.js'), 'utf8'))();

const placement = globalThis.TechnoHabPlacement;
const socle = globalThis.TechnoHabSocle;
const cache = globalThis.TechnoHabFit;
const roomTypes = Object.keys(socle.rooms);

assert.equal(roomTypes.length, 13, 'la suite doit couvrir les 13 préréglages');

let variantsTested = 0;
let verdictsTested = 0;

roomTypes.forEach(function (type) {
  socle.variantsOf(type).forEach(function (variant) {
    const variantName = variant || 'base';
    const equipments = socle.requiredEquipments(type, variant).slice().sort(function (a, b) {
      return (b.footprint.w * b.footprint.d) - (a.footprint.w * a.footprint.d);
    });
    const expectedEnvelope = cache.envelopes[type].variants[variantName];
    const actualEnvelope = equipments.length
      ? placement.envelope(equipments)
      : [[placement.minimumSideCentimeters, placement.minimumSideCentimeters]];

    assert.deepEqual(actualEnvelope, expectedEnvelope, type + '/' + variantName + ' diverge du cache');

    const dimensions = new Set([placement.minimumSideCentimeters, placement.maximumSideCentimeters]);
    expectedEnvelope.forEach(function (pair) {
      pair.forEach(function (value) {
        dimensions.add(value);
        if (value - placement.stepCentimeters >= placement.minimumSideCentimeters) {
          dimensions.add(value - placement.stepCentimeters);
        }
        if (value + placement.stepCentimeters <= placement.maximumSideCentimeters) {
          dimensions.add(value + placement.stepCentimeters);
        }
      });
    });

    const samples = Array.from(dimensions).sort(function (a, b) { return a - b; });
    samples.forEach(function (width) {
      samples.forEach(function (height) {
        const expected = cache.fits(type, width / 100, height / 100, variant || undefined);
        const actual = placement.solve(equipments, { w: width / 100, h: height / 100 }).fits;
        assert.equal(actual, expected, type + '/' + variantName + ' à ' + width + ' × ' + height + ' cm');
        verdictsTested += 1;
      });
    });
    variantsTested += 1;
  });
});

const bedroom = socle.rooms.bedroom.equipments;
const washer = socle.rooms.buanderie.equipments.find(function (equipment) { return equipment.id === 'washer'; });
const singleBed = bedroom.find(function (equipment) { return equipment.id === 'bed_90'; });
const wardrobe = bedroom.find(function (equipment) { return equipment.id === 'wardrobe'; });
const composition = [singleBed, Object.assign({}, singleBed), wardrobe, washer];

const accepted = placement.solve(composition, { w: 5, h: 5 });
assert.equal(accepted.fits, true, 'la composition libre doit obtenir un verdict positif');
assert.equal(accepted.placements.length, composition.length, 'chaque équipement doit avoir une pose');

const refused = placement.solve(composition, { w: 2, h: 2 });
assert.equal(refused.fits, false, 'la composition libre doit obtenir un verdict négatif');
assert.equal(refused.reason.code, 'EQUIPMENT_CANNOT_BE_PLACED');
assert.ok(refused.reason.equipmentId, 'le refus doit identifier un équipement bloquant');

const orientationCases = [
  { id: 'd', rotation: 0, wall: 'S', inward: { x: 0, y: 1 }, w: 0.5, h: 0.3 },
  { id: 'a', rotation: 90, wall: 'E', inward: { x: -1, y: 0 }, w: 0.3, h: 0.5 },
  { id: 'b', rotation: 180, wall: 'N', inward: { x: 0, y: -1 }, w: 0.5, h: 0.3 },
  { id: 'c', rotation: 270, wall: 'W', inward: { x: 1, y: 0 }, w: 0.3, h: 0.5 }
];

orientationCases.forEach(function (expected) {
  const equipment = {
    id: expected.id,
    label: 'Équipement ' + expected.id,
    footprint: { w: 0.5, d: 0.3 },
    anchor: 'wall',
    usage: []
  };
  const pose = placement.solve([equipment], { w: 3, h: 3 }).placements[0];
  assert.equal(pose.rotation, expected.rotation, expected.id + ' doit conserver son angle');
  assert.equal(pose.wall, expected.wall, expected.id + ' doit conserver sa paroi');
  assert.deepEqual(pose.inward, expected.inward, expected.id + ' doit conserver son sens intérieur');
  assert.ok(Math.abs((pose.footprint.x1 - pose.footprint.x0) - expected.w) < 1e-9,
    expected.id + ' doit tourner sa largeur calculée');
  assert.ok(Math.abs((pose.footprint.y1 - pose.footprint.y0) - expected.h) < 1e-9,
    expected.id + ' doit tourner sa profondeur calculée');
});

const appSource = readFileSync(join(technohabRoot, 'assets/app.js'), 'utf8');
assert.match(appSource, /Number\.isFinite\(pose\.rotation\)/, 'le rendu doit lire la rotation du solveur');
assert.match(appSource, /attrs\.transform = 'rotate\('/, 'le rendu doit appliquer une rotation SVG');

console.log('Placement : ' + roomTypes.length + ' préréglages, ' + variantsTested +
  ' variantes, ' + verdictsTested + ' verdicts conformes au cache et ' +
  orientationCases.length + ' orientations cardinales vérifiées.');
