/* M4 — une pose n'entre dans le BuiltPlan que si S4 relie ses usages requis. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
['fit.data.js', 'contracts.js', 'construction.js', 'typologie.js', 'squelette.js',
  'generator.js', 'socle.data.js', 'room-model.js', 'placement.js', 'rules.js']
  .forEach((file) => { new Function(readFileSync(join(root, 'assets', file), 'utf8'))(); });

const placement = globalThis.TechnoHabPlacement;
const generator = globalThis.TechnoHabGenerator;
const rules = globalThis.TechnoHabRules;

const rectangle = { w: 4, h: 3 };
const context = {
  openings: [{ x: 0, y: 1.5, width: 0.83, axis: 'vertical', kind: 'door' }],
  blocked: [], usablePolygon: [], faces: []
};
const target = {
  equipment: { id: 'target', required: true },
  footprint: { x0: 3.2, y0: 1.1, x1: 3.8, y1: 1.9 },
  usage: [{ x0: 2.45, y0: 1.05, x1: 3.15, y1: 1.95 }]
};
assert.equal(placement.assessS4([target], rectangle, context).passes, true,
  'une zone d’usage ouverte rejoint la porte');

const barrier = {
  equipment: { id: 'barrier', required: true },
  footprint: { x0: 1.7, y0: 0, x1: 2.3, y1: 3 }, usage: []
};
const disconnected = placement.assessS4([barrier, target], rectangle, context);
assert.equal(disconnected.passes, false, 'une emprise traversante coupe S4');
assert.equal(disconnected.disconnected[0].equipmentId, 'target');

const room = {
  id: 'test', usableBounds: { x0: 0, y0: 0, x1: 4, y1: 3 },
  usablePolygon: [], wallFaces: []
};
const spatial = placement.roomContext(room, {
  portes: [{ id: 'door', entre: ['test', 'hall'], x: -0.05, y: 1.5, axe: 'vertical', bayWidth: 0.83 }],
  fenetres: [{ id: 'window', entre: ['test', 'exterior'], x: 2, y: -0.15, axe: 'horizontal', bayWidth: 1.2 }]
});
assert.equal(spatial.context.openings.length, 2, 'les axes au milieu des murs sont projetés sur le contour utile');
assert.equal(spatial.context.blocked.length, 2, 'porte et fenêtre réservent leur baie au mobilier');
assert.ok(spatial.context.blocked.every((zone) => zone.footprintOnly),
  'la réservation protège une emprise sans interdire une zone d’usage traversable');

// C-P1.2b renforce le programme du séjour ; la même graine reste productible
// dans les trois enveloppes et isole mieux la variable de forme.
for (const [shape, seed] of [['rectangle', 830001], ['lShape', 830001], ['uShape', 830001]]) {
  const plan = generator.generatePlan({
    surface: 110, bedrooms: 3, bathrooms: 1,
    separateKitchen: true, includeWc: true, shape
  }, 1, seed);
  assert.equal(plan.s4.passes, true, shape + ' satisfait S4 avant son retour');
  assert.equal(plan.s4.requiredUsageZones, plan.s4.reachableUsageZones);
  assert.equal(plan.parcours.avecMobilier, true, shape + ' porte son parcours meublé canonique');
  assert.ok(plan.rooms.every((item) => Array.isArray(item.placements)), 'chaque pièce porte une liste de poses');
  assert.equal(rules.evaluatePlan(plan).violations.some((item) => item.ruleId === 'TH2D-PATH-004'), false);

  const broken = structuredClone(plan);
  const furnished = broken.rooms.find((item) => item.s4);
  furnished.s4.passes = false;
  furnished.s4.reachableUsageZones = Math.max(0, furnished.s4.requiredUsageZones - 1);
  broken.s4.passes = false;
  broken.s4.failedRooms = [furnished.id];
  assert.ok(rules.evaluatePlan(broken).violations.some((item) =>
    item.ruleId === 'TH2D-PATH-004' && item.level === 'HARD'), 'une rupture S4 déclenche la règle HARD');
}

const appSource = readFileSync(join(root, 'assets', 'app.js'), 'utf8');
assert.doesNotMatch(appSource, /delete room\.placements/, 'masquer le calque ne détruit pas les poses canoniques');
assert.doesNotMatch(appSource, /plan\.parcoursMeuble\s*=/, 'le rendu ne recalcule pas une seconde vérité de parcours');

console.log('M4/S4 : connexité locale, seuils réservés, poses et parcours canoniques, règle HARD vérifiés.');
