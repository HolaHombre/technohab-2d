import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const technohabRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
['fit.data.js', 'generator.js', 'socle.data.js', 'room-model.js', 'placement.js'].forEach(function (file) {
  new Function(readFileSync(join(technohabRoot, 'assets', file), 'utf8'))();
});

const socle = globalThis.TechnoHabSocle;
const model = globalThis.TechnoHabRoomModel;
const placement = globalThis.TechnoHabPlacement;
const generator = globalThis.TechnoHabGenerator;

assert.equal(model.existenceRules.length, 4, 'quatre règles génériques d’existence sont attendues');
assert.equal(model.designate('inconnue').valid, false, 'un type inconnu doit être refusé par le modèle');

let designations = 0;
Object.keys(socle.rooms).forEach(function (type) {
  socle.rooms[type].equipments.forEach(function (equipment) {
    assert.ok(equipment.footprint && equipment.footprint.w > 0 && equipment.footprint.d > 0,
      type + '/' + equipment.id + ' doit déclarer une emprise');
    assert.ok(['wall', 'corner', 'free'].includes(equipment.anchor || 'free'),
      type + '/' + equipment.id + ' doit déclarer un ancrage reconnu');
    assert.ok(Array.isArray(equipment.usage), type + '/' + equipment.id + ' doit déclarer son usage minimal');
  });
  socle.variantsOf(type).forEach(function (variant) {
    const designation = model.designate(type, variant);
    assert.equal(designation.valid, true, type + '/' + (variant || 'base') + ' doit être cohérent');
    assert.equal(designation.requirements.length, designation.equipments.length,
      'chaque équipement requis doit devenir une exigence minimale');
    designations += 1;
  });
});

const kitchen = model.designate('kitchen');
const kitchenValidation = placement.validate(kitchen.equipments, { w: 4, h: 3 }, { relations: kitchen.relations });
assert.equal(kitchenValidation.fits, true, 'la cuisine témoin doit satisfaire sa relation dure');
const kitchenById = Object.fromEntries(kitchenValidation.placements.map(function (pose) { return [pose.equipment.id, pose]; }));
assert.equal(kitchenById.sink.wall, kitchenById.worktop.wall, 'le plan de travail doit partager le mur de l’évier');
assert.equal(kitchenById.hob.wall, kitchenById.worktop.wall, 'le plan de travail doit partager le mur de la plaque');
const kitchenAxis = kitchenById.worktop.wall === 'S' || kitchenById.worktop.wall === 'N' ? 'x' : 'y';
const center = function (pose, axis) { return (pose.footprint[axis + '0'] + pose.footprint[axis + '1']) / 2; };
const worktopPosition = center(kitchenById.worktop, kitchenAxis);
assert.ok(worktopPosition >= Math.min(center(kitchenById.sink, kitchenAxis), center(kitchenById.hob, kitchenAxis)) &&
  worktopPosition <= Math.max(center(kitchenById.sink, kitchenAxis), center(kitchenById.hob, kitchenAxis)),
  'le plan de travail doit être compris entre évier et plaque');

const bedroom = model.designate('bedroom', 'enfant');
const signature = function (result) {
  return result.placements.map(function (pose) {
    return pose.equipment.id + ':' + pose.wall + ':' + pose.rotation + '@' + pose.footprint.x0 + ',' + pose.footprint.y0;
  }).join('|');
};
const replayA = placement.optimize(bedroom.equipments, { w: 4, h: 3.5 }, { relations: bedroom.relations, seed: 'replay', attempts: 6 });
const replayB = placement.optimize(bedroom.equipments, { w: 4, h: 3.5 }, { relations: bedroom.relations, seed: 'replay', attempts: 6 });
assert.equal(signature(replayA), signature(replayB), 'une même graine doit rejouer la même disposition');
const varied = new Set();
for (let index = 0; index < 8; index += 1) {
  const result = placement.optimize(bedroom.equipments, { w: 4, h: 3.5 }, {
    relations: bedroom.relations, seed: 'variation-' + index, attempts: 6
  });
  assert.equal(result.fits, true, 'chaque variation doit rester faisable');
  varied.add(signature(result));
}
assert.ok(varied.size >= 4, 'les graines doivent produire plusieurs dispositions possibles');

const options = { surface: 85, bedrooms: 3, bathrooms: 1, separateKitchen: true, includeWc: true, priority: 'compact' };
let generatedRooms = 0;
for (let variant = 1; variant <= 8; variant += 1) {
  const plan = generator.generatePlan(options, variant, 10000 + variant);
  plan.rooms.forEach(function (room) {
    const definition = socle.rooms[room.type];
    const selectedVariant = (definition.variants || [null])[0];
    const designation = model.designate(room.type, room.variant || selectedVariant);
    if (!designation.equipments.length) return;
    const rectangle = room.usableRect || room;
    const result = placement.validate(designation.equipments, {
      w: rectangle.x1 - rectangle.x0,
      h: rectangle.y1 - rectangle.y0
    }, { relations: designation.relations });
    assert.equal(result.fits, true, 'la pièce générée ' + room.id + ' doit recevoir ses exigences minimales');
    generatedRooms += 1;
  });
}

console.log('Modèle : ' + designations + ' désignations, ' + generatedRooms +
  ' pièces générées et ' + varied.size + ' dispositions ensemencées vérifiées.');
