import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
['fit.data.js', 'contracts.js', 'construction.js', 'typologie.js', 'squelette.js', 'generator.js', 'socle.data.js', 'room-model.js', 'placement.js'].forEach(function (file) {
  new Function(readFileSync(join(root, 'assets', file), 'utf8'))();
});

const generator = globalThis.TechnoHabGenerator;
const socle = globalThis.TechnoHabSocle;
const model = globalThis.TechnoHabRoomModel;
const placement = globalThis.TechnoHabPlacement;

const options = {
  surface: 75, bedrooms: 2, bathrooms: 1,
  separateKitchen: false, includeWc: true, priority: 'compact'
};
let furnishedRooms = 0;
let openKitchens = 0;
let optionalFallbacks = 0;
const scores = new Set();
const families = new Set();

for (let variant = 1; variant <= 10; variant += 1) {
  const plan = generator.generatePlan(options, variant, 51000 + variant);
  assert.ok(plan.fenetres.length > 0, 'chaque plan doit matérialiser ses fenêtres de façade');
  plan.rooms.forEach(function (room) {
    const definition = socle.rooms[room.type];
    if (!definition) return;
    const selectedVariant = (definition.variants || [null])[0];
    const programContext = {
      area: room.area || room.targetArea,
      openKitchen: room.type === 'living' && !plan.options.separateKitchen,
      includeOptional: true
    };
    let designation = model.designate(room.type, room.variant || selectedVariant, programContext);
    if (!designation.equipments.length) return;
    furnishedRooms += 1;
    if (room.type === 'living') {
      assert.ok(designation.programs.includes('kitchen'), 'le séjour doit intégrer le programme de cuisine ouverte');
      openKitchens += 1;
    }
    const spatial = placement.roomContext(room, plan);
    const dimensions = spatial.rectangle;
    const context = spatial.context;
    let validation = placement.validate(designation.equipments, dimensions, {
      relations: designation.relations, context: context
    });
    if (!validation.fits && designation.equipments.some(function (equipment) { return !equipment.required; })) {
      programContext.includeOptional = false;
      designation = model.designate(room.type, room.variant || selectedVariant, programContext);
      validation = placement.validate(designation.equipments, dimensions, {
        relations: designation.relations, context: context
      });
      optionalFallbacks += 1;
    }
    /* Une montée en gamme reste un agrément, jamais une nouvelle obligation.
       Si la taille choisie par la surface ne tient pas dans la proportion
       réelle, le programme revient au plancher sans changer d'identité. */
    if (!validation.fits && designation.equipments.some(function (equipment) { return equipment.size; })) {
      programContext.upgradeSizes = false;
      designation = model.designate(room.type, room.variant || selectedVariant, programContext);
      validation = placement.validate(designation.equipments, dimensions, {
        relations: designation.relations, context: context
      });
      optionalFallbacks += 1;
    }
    const result = placement.optimize(designation.equipments, dimensions, {
      relations: designation.relations, context: context, validation: validation,
      seed: plan.seed + ':' + room.id, attempts: 12
    });
    assert.equal(result.fits, true, plan.seed + '/' + room.id + ' doit rester meublable avec ses accès');
    assert.ok(result.optimization.score >= 0 && result.optimization.score <= 100,
      'la note doit être normalisée sur 100');
    assert.ok(result.optimization.breakdown.access >= 0, 'le détail de la note doit exposer l’accès');
    scores.add(result.optimization.score);
    families.add(result.optimization.family);
  });
}

assert.equal(furnishedRooms, 50, 'les dix plans doivent fournir cinquante pièces meublées');
assert.equal(openKitchens, 10, 'les dix séjours doivent recevoir leur cuisine ouverte');
assert.ok(scores.size >= 10, 'la fonction objectif doit discriminer les placements');
assert.ok(families.size >= 3, 'plusieurs familles structurées doivent pouvoir gagner');

console.log('Composition : ' + furnishedRooms + ' pièces, ' + openKitchens +
  ' cuisines ouvertes, ' + scores.size + ' notes et ' + families.size +
  ' familles gagnantes; ' + optionalFallbacks + ' replis de confort.');
