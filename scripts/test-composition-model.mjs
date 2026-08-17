import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
['fit.data.js', 'generator.js', 'socle.data.js', 'room-model.js', 'placement.js'].forEach(function (file) {
  new Function(readFileSync(join(root, 'assets', file), 'utf8'))();
});

const generator = globalThis.TechnoHabGenerator;
const socle = globalThis.TechnoHabSocle;
const model = globalThis.TechnoHabRoomModel;
const placement = globalThis.TechnoHabPlacement;

function roomContext(room, plan) {
  const rectangle = room.usableRect || room;
  const width = rectangle.x1 - rectangle.x0;
  const height = rectangle.y1 - rectangle.y0;
  const openings = [];
  const blocked = [];

  function add(opening, kind) {
    const x = opening.x - rectangle.x0;
    const y = opening.y - rectangle.y0;
    const span = opening.largeur || 0.8;
    if (x < -0.02 || y < -0.02 || x > width + 0.02 || y > height + 0.02) return;
    openings.push({ x: x, y: y, width: span, axis: opening.axe, kind: kind });
    if (kind === 'window') return;
    if (opening.debattement && opening.ouvreVers === room.id) {
      blocked.push({
        x0: Math.max(0, opening.debattement.x0 - rectangle.x0),
        y0: Math.max(0, opening.debattement.y0 - rectangle.y0),
        x1: Math.min(width, opening.debattement.x1 - rectangle.x0),
        y1: Math.min(height, opening.debattement.y1 - rectangle.y0)
      });
      return;
    }
    const depth = kind === 'entry' ? 1 : 0.25;
    if (opening.axe === 'vertical') {
      blocked.push({
        x0: x <= width / 2 ? 0 : Math.max(0, width - depth),
        x1: x <= width / 2 ? Math.min(width, depth) : width,
        y0: Math.max(0, y - span / 2), y1: Math.min(height, y + span / 2)
      });
    } else {
      blocked.push({
        x0: Math.max(0, x - span / 2), x1: Math.min(width, x + span / 2),
        y0: y <= height / 2 ? 0 : Math.max(0, height - depth),
        y1: y <= height / 2 ? Math.min(height, depth) : height
      });
    }
  }

  (plan.portes || []).filter(function (door) {
    return (door.entre || []).indexOf(room.id) !== -1;
  }).forEach(function (door) { add(door, 'door'); });
  if (plan.entree && (plan.entree.entre || []).indexOf(room.id) !== -1) add(plan.entree, 'entry');
  (plan.fenetres || []).filter(function (windowOpening) {
    return windowOpening.room === room.id;
  }).forEach(function (windowOpening) { add(windowOpening, 'window'); });
  return { openings: openings, blocked: blocked };
}

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
    const rectangle = room.usableRect || room;
    const dimensions = { w: rectangle.x1 - rectangle.x0, h: rectangle.y1 - rectangle.y0 };
    const context = roomContext(room, plan);
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
