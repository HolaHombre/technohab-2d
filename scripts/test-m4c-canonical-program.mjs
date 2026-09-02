/* M4c — programme mobilier canonique dans le BuiltPlan, périmètre C4. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
['canonical-values.data.js', 'canonical-values.js', 'fit.data.js', 'contracts.js',
  'construction.js', 'typologie.js', 'squelette.js', 'generator.js',
  'placement.js', 'rules.js']
  .forEach((file) => { new Function(readFileSync(join(root, 'assets', file), 'utf8'))(); });

const fit = globalThis.TechnoHabFit;
const generator = globalThis.TechnoHabGenerator;

assert.deepEqual(fit.programOf('living').equipments.map((item) => item.id),
  ['sofa', 'coffee_table'], 'le cache de faisabilité reste minimal');
assert.deepEqual(fit.resolveProgram('living', null, { area: 22 }).equipments.map((item) => item.id),
  ['sofa', 'coffee_table', 'tv_unit', 'armchair'],
  'le catalogue compilé active les optionnels sans charger le socle');
assert.equal(fit.resolveProgram('bedroom', 'parentale', { area: 16 }).equipments[0].size,
  'bed_180', 'la gamme est résolue dans le runtime chargé au démarrage');

function assertCanonical(room) {
  assert.equal(room.equipmentProgram.authority, 'BuiltPlan');
  assert.equal(room.equipmentProgram.version, 'm4c-v1');
  const resolved = Object.fromEntries(room.equipmentProgram.resolved.map((item) => [item.id, item]));
  assert.deepEqual(room.placements.map((pose) => pose.equipmentId).sort(),
    room.equipmentProgram.resolved.map((item) => item.id).sort(),
    room.id + ' dessine exactement le programme qui a participé au verdict');
  for (const pose of room.placements) {
    const equipment = resolved[pose.equipmentId];
    assert.equal(pose.sizeId, equipment.sizeId);
    assert.deepEqual(pose.nominalFootprint, equipment.footprint);
  }
}

const generous = generator.generatePlan({
  // C-P2 réserve désormais 1,20 × 1,20 m à l'arrivée. Ce témoin généreux
  // prouve que la gamme haute survit encore après cette contrainte réelle.
  surface: 120, bedrooms: 3, bathrooms: 1,
  separateKitchen: true, includeWc: true, shape: 'lShape'
}, 1, 55);
const living = generous.rooms.find((room) => room.type === 'living');
assertCanonical(living);
assert.deepEqual(living.equipmentProgram.resolved.map((item) => item.id),
  ['sofa', 'coffee_table', 'tv_unit', 'armchair']);
assert.equal(living.equipmentProgram.resolved[0].sizeId, 'sofa_angle');
const sofa = living.placements.find((pose) => pose.equipmentId === 'sofa');
assert.deepEqual(sofa.nominalFootprint, { w: 2.2, d: 2.2 },
  'le canapé d’angle participe avec sa vraie emprise');

const constrained = generator.generatePlan({
  surface: 55, bedrooms: 1, bathrooms: 1,
  separateKitchen: false, includeWc: true, shape: 'rectangle'
}, 1, 9002);
const constrainedLiving = constrained.rooms.find((room) => room.type === 'living');
assertCanonical(constrainedLiving);
assert.deepEqual(constrainedLiving.equipmentProgram.fallback, {
  attempts: 3, sizeDowngraded: true, optionalRemoved: true
}, 'le repli rabat la gamme avant de retirer les optionnels');
assert.ok(constrainedLiving.equipmentProgram.requested.some((item) => item.id === 'armchair'));
assert.ok(!constrainedLiving.equipmentProgram.resolved.some((item) => item.id === 'armchair'));
assert.ok(constrainedLiving.equipmentProgram.resolved.some((item) => item.program === 'kitchen'),
  'retirer les optionnels du séjour ne fait pas disparaître la cuisine ouverte requise');

const bedrooms = generous.rooms.filter((room) => room.type === 'bedroom');
bedrooms.forEach(assertCanonical);
const parent = bedrooms.find((room) => room.id === 'bedroom_1');
assert.equal(parent.equipmentProgram.requested[0].sizeId, 'bed_180');
assert.equal(parent.equipmentProgram.resolved[0].sizeId, 'bed_140');
assert.equal(parent.equipmentProgram.fallback.sizeDowngraded, true,
  'la chambre revient au lit plancher si sa proportion refuse le king');

const app = readFileSync(join(root, 'assets', 'app.js'), 'utf8');
assert.ok(app.indexOf("manifest.authority === 'BuiltPlan'") < app.indexOf('modele.designate(room.type'),
  'le rendu consomme le BuiltPlan avant d’envisager le repli historique');
assert.match(app, /record\.sizeId !== record\.id/,
  'le rendu joint le symbole à la taille réellement retenue');

const furnitureSprite = readFileSync(join(root, 'assets', 'icons', 'furniture.svg'), 'utf8');
const page = readFileSync(join(root, 'index.html'), 'utf8');
for (const id of ['sofa_3', 'sofa_angle', 'bed_160', 'bed_180', 'armchair']) {
  assert.match(furnitureSprite, new RegExp(`id="furn-${id}"`), `${id} existe dans le sprite source`);
  assert.match(page, new RegExp(`id="furn-${id}"`), `${id} reste disponible en file://`);
}

console.log('M4c : catalogue compilé, gammes, optionnels, replis et parité BuiltPlan/rendu vérifiés.');
