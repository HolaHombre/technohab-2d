/* BED-WET-WALL-001 — la tête de lit ne s'adosse pas à un WC ou une salle d'eau
   (profils/chambre.md §6, `UNDESIRABLE`, acoustique). La tête se déduit de
   l'ancrage : un lit `anchor: 'wall'` s'adosse par sa tête au mur qui le porte.
   Mesuré le 6 octobre 2026 sur 90 plans (45, 90 et 250 m², 30 graines) :
   25 lits sur 258 étaient adossés à une pièce humide, aucun après. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
[
  'canonical-values.data.js', 'canonical-values.js', 'programme-bandes.data.js',
  'fit.data.js', 'construction.js', 'contracts.js', 'typologie.js', 'squelette.js',
  'generator.js', 'socle.data.js', 'room-model.js', 'placement.js', 'rules.js',
  'relaxation.data.js', 'relaxation.js'
].forEach((file) => new Function(readFileSync(join(root, 'assets', file), 'utf8'))());

const G = globalThis.TechnoHabGenerator;
const P = globalThis.TechnoHabPlacement;
const fit = globalThis.TechnoHabFit;

// 1. La règle arrive jusqu'au programme résolu des deux variantes de chambre.
for (const variant of ['enfant', 'parentale']) {
  const program = fit.resolveProgram('bedroom', variant, { area: 12 });
  const relation = program.relations.find((entry) => entry.code === 'BED-WET-WALL-001');
  assert.ok(relation, 'BED-WET-WALL-001 présente pour la chambre ' + variant);
  assert.equal(relation.kind, 'not-against-room');
  assert.deepEqual(relation.rooms, ['wc', 'bath']);
  assert.ok(program.equipments.some((equipment) => equipment.id === relation.subject),
    'le sujet est le lit réellement programmé');
}

// 2. Le jugement : mur partagé avec une pièce humide, ou non.
const relation = { code: 'BED-WET-WALL-001', kind: 'not-against-room', subject: 'bed_90', rooms: ['wc', 'bath'], weight: 1.4 };
const bed = (wall) => ({
  equipment: { id: 'bed_90' }, wall, inward: { x: 0, y: 1 },
  footprint: { x0: 0.2, y0: 0, x1: 1.1, y1: 1.9 }
});
const context = { faces: [
  { wallId: 'w-bath', neighborType: 'bath' },
  { wallId: 'w-circ', neighborType: 'circulation' }
] };
assert.equal(P.againstRoomViolations([bed('w-bath')], [relation], context), 1, 'adossé à la salle d’eau');
assert.equal(P.againstRoomViolations([bed('w-circ')], [relation], context), 0, 'adossé à la circulation');

// Sans murs construits, la relation est neutre : elle ne pèse pas sur la note.
const rectangle = { w: 3, h: 3 };
const sansMurs = P.assess([bed('S')], rectangle, [relation], {}).score;
const sansRelation = P.assess([bed('S')], rectangle, [], {}).score;
assert.equal(sansMurs, sansRelation, 'pré-classement inchangé tant que les murs n’existent pas');
// Avec les murs, la pose adossée à la salle d'eau est moins bien notée.
assert.ok(P.assess([bed('w-bath')], rectangle, [relation], context).score <
  P.assess([bed('w-circ')], rectangle, [relation], context).score);

// 3. Un plan réel qui adossait le lit à la salle d'eau avant la règle.
const plan = G.generatePlan({
  surface: 45, bedrooms: 1, bathrooms: 1, separateKitchen: true, includeWc: true,
  priority: 'compact', shape: 'rectangle'
}, 3, 0x2468ACE0);
const types = Object.fromEntries(plan.rooms.map((room) => [room.id, room.type]));
const bedroom = plan.rooms.find((room) => room.type === 'bedroom');
const placedBed = bedroom.placements.find((pose) => /^bed_/.test(pose.equipmentId));
const wall = plan.walls.find((candidate) => candidate.id === placedBed.wallId);
const other = Object.keys(wall.faces).find((space) => space !== bedroom.id);
assert.ok(!['wc', 'bath'].includes(types[other]),
  'le lit de la graine 0x2468ACE0 ne s’adosse plus à ' + types[other]);
assert.notEqual(bedroom.furnishable, false);
// L'ameublement final ne touche pas au score qui a classé le plan : son écart
// est consigné à part (une préférence d'ameublement ne choisit pas le plan).
assert.equal(plan.finalFurnishing.method, 'neighbor-relations-after-selection-v1');
assert.ok(Number.isFinite(plan.finalFurnishing.scoreDelta));

console.log('BED-WET-WALL-001 : règle compilée, jugement des murs, neutralité avant construction et plan témoin vérifiés.');
