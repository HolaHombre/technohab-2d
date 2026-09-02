/* M4 — mobilier sur faces utiles et parcours à travers les seules baies. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
['fit.data.js', 'contracts.js', 'construction.js', 'typologie.js', 'squelette.js', 'generator.js', 'socle.data.js', 'room-model.js', 'placement.js', 'rules.js']
  .forEach(function (file) { new Function(readFileSync(join(root, 'assets', file), 'utf8'))(); });

const generator = globalThis.TechnoHabGenerator;
const model = globalThis.TechnoHabRoomModel;
const placement = globalThis.TechnoHabPlacement;
const rules = globalThis.TechnoHabRules;

function pointInRing(point, ring) {
  let inside = false;
  for (let index = 0, previous = ring.length - 1; index < ring.length; previous = index, index += 1) {
    const a = ring[index], b = ring[previous];
    if ((a.y > point.y) !== (b.y > point.y) &&
      point.x < (b.x - a.x) * (point.y - a.y) / (b.y - a.y) + a.x) inside = !inside;
  }
  return inside;
}
function inPolygon(point, polygon) {
  return polygon.reduce((inside, ring) => pointInRing(point, ring) ? !inside : inside, false);
}
function rectangleSamples(rectangle) {
  const inset = 0.003;
  return [
    { x: rectangle.x0 + inset, y: rectangle.y0 + inset },
    { x: rectangle.x1 - inset, y: rectangle.y0 + inset },
    { x: rectangle.x1 - inset, y: rectangle.y1 - inset },
    { x: rectangle.x0 + inset, y: rectangle.y1 - inset },
    { x: (rectangle.x0 + rectangle.x1) / 2, y: (rectangle.y0 + rectangle.y1) / 2 }
  ];
}

/* 1. Les murs transmettent leurs seules portions pleines ------------------ */

const reference = generator.generatePlan({
  surface: 110, bedrooms: 3, bathrooms: 1,
  separateKitchen: true, includeWc: true, shape: 'lShape'
}, 1, 1234);
const wallById = Object.fromEntries(reference.walls.map((wall) => [wall.id, wall]));
reference.rooms.forEach((room) => {
  assert.ok(room.wallFaces.length > 0, room.id + ' reçoit ses faces intérieures');
  room.wallFaces.forEach((face) => {
    const wall = wallById[face.wallId];
    assert.ok(wall, face.id + ' référence un mur existant');
    assert.equal(face.faceId, wall.faces[room.id].id, face.id + ' appartient bien à la pièce');
    const faceStart = face.orientation === 'vertical' ? face.axis.y0 : face.axis.x0;
    const faceEnd = face.orientation === 'vertical' ? face.axis.y1 : face.axis.x1;
    wall.reservations.forEach((reservation) => {
      assert.ok(faceEnd <= reservation.start + 0.001 || faceStart >= reservation.end - 0.001,
        face.id + ' ne recouvre aucune baie');
    });
  });
});

/* 2. Le solveur emploie ces faces et reste dans le polygone utile -------- */

let plans = 0;
let anchored = 0;
let corners = 0;
for (const shape of ['rectangle', 'lShape', 'uShape']) {
  for (let variant = 1; variant <= 4; variant += 1) {
    const plan = generator.generatePlan({
      surface: 110, bedrooms: 3, bathrooms: 1,
      separateKitchen: true, includeWc: true, shape
    }, variant, 404000 + variant);
    for (const room of plan.rooms) {
      const programContext = {
        area: room.usableArea,
        openKitchen: room.type === 'living' && !plan.options.separateKitchen,
        integratedWc: room.id === 'bath_1' && !plan.options.includeWc,
        includeOptional: false
      };
      let designation = model.designate(room.type, room.variant, programContext);
      if (!designation.equipments.length) continue;
      const spatial = placement.roomContext(room, plan);
      let result = placement.validate(designation.equipments, spatial.rectangle, {
        relations: designation.relations, context: spatial.context, s4: true
      });
      if (!result.fits && designation.equipments.some((equipment) => equipment.size)) {
        designation = model.designate(room.type, room.variant,
          { ...programContext, upgradeSizes: false });
        result = placement.validate(designation.equipments, spatial.rectangle, {
          relations: designation.relations, context: spatial.context, s4: true
        });
      }
      if (!result.fits && result.reason && result.reason.code === 'S4_CANNOT_BE_SATISFIED') {
        result = placement.optimize(designation.equipments, spatial.rectangle, {
          relations: designation.relations, context: spatial.context, s4: true,
          validation: result, seed: String(plan.seed || plan.seedValue || plan.variant) + ':' + room.id,
          attempts: 8
        });
      }
      assert.equal(result.fits, true, plan.seed + '/' + room.id + ' reste meublable sur sa surface utile');
      const faces = Object.fromEntries(room.wallFaces.map((face) => [face.id, face]));
      result.placements.forEach((pose) => {
        const globalFootprint = {
          x0: spatial.origin.x + pose.footprint.x0, y0: spatial.origin.y + pose.footprint.y0,
          x1: spatial.origin.x + pose.footprint.x1, y1: spatial.origin.y + pose.footprint.y1
        };
        rectangleSamples(globalFootprint).forEach((point) => {
          assert.ok(inPolygon(point, room.usablePolygon), room.id + '/' + pose.equipment.id + ' reste dans le polygone utile');
        });
        if ((pose.equipment.anchor || 'free') !== 'free') {
          assert.ok(faces[pose.faceId], room.id + '/' + pose.equipment.id + ' référence une face disponible');
          assert.equal(faces[pose.faceId].wallId, pose.wallId,
            room.id + '/' + pose.equipment.id + ' porte le véritable identifiant du mur');
          anchored += 1;
          if (pose.equipment.anchor === 'corner') corners += 1;
        }
      });
    }
    plans += 1;
  }
}
assert.ok(corners > 0, 'les ancrages corner utilisent eux aussi les faces et le contour utile');

const relationRectangle = { w: 4, h: 4 };
const basePose = (id, wallId, x) => ({
  equipment: { id }, wall: wallId, wallAxis: 'x', wallSpan: 4, wallOffset: x,
  footprint: { x0: x - 0.2, y0: 0, x1: x + 0.2, y1: 0.4 }, usage: [], inward: { x: 0, y: 1 }
});
const aligned = [basePose('a', 'wall_reel_1', 1), basePose('b', 'wall_reel_1', 2)];
const separated = [basePose('a', 'wall_reel_1', 1), basePose('b', 'wall_reel_2', 2)];
assert.equal(placement.assess(aligned, relationRectangle,
  [{ kind: 'same-wall', subject: 'a', target: 'b' }]).breakdown.relations, 100,
  'same-wall compare les identifiants réels des murs');
assert.equal(placement.assess(separated, relationRectangle,
  [{ kind: 'different-wall', subject: 'a', target: 'b' }]).breakdown.relations, 100,
  'different-wall compare les identifiants réels des murs');

/* 3. Un mur bloque le parcours ; sa réservation seule le rouvre ---------- */

const roomA = {
  id: 'a', parts: [{ x0: 0, y0: 0, x1: 3, y1: 3 }],
  usableBounds: { x0: 0, y0: 0, x1: 3, y1: 3 },
  usablePolygon: [[{ x: 0, y: 0 }, { x: 3, y: 0 }, { x: 3, y: 3 }, { x: 0, y: 3 }]]
};
const roomB = {
  id: 'b', parts: [{ x0: 3.2, y0: 0, x1: 6.2, y1: 3 }],
  usableBounds: { x0: 3.2, y0: 0, x1: 6.2, y1: 3 },
  usablePolygon: [[{ x: 3.2, y: 0 }, { x: 6.2, y: 0 }, { x: 6.2, y: 3 }, { x: 3.2, y: 3 }]]
};
const entry = { id: 'entree', entre: ['a', 'exterior'], x: 0, y: 1.5, largeur: 1.2, axe: 'vertical' };
const door = { id: 'door', entre: ['a', 'b'], x: 3.1, y: 1.5, largeur: 1.2, axe: 'vertical' };
const wall = { id: 'shared', between: ['a', 'b'] };
const reservation = { id: 'bay', wallId: 'shared', volume: { x0: 3, y0: 0.9, x1: 3.2, y1: 2.1 } };
const basePathPlan = {
  rooms: [roomA, roomB], portes: [], entree: entry,
  boundary: { width: 6.2, height: 3 }, walls: [wall], reservations: []
};
const blockedPath = generator.cheminementAvecObstacles(basePathPlan, []);
assert.equal(Boolean(blockedPath.atteintes.b), false, 'le parcours ne traverse pas un mur plein');
const openPath = generator.cheminementAvecObstacles({
  ...basePathPlan, portes: [door], reservations: [reservation]
}, []);
assert.equal(openPath.atteintes.b, true, 'le parcours franchit le mur par sa réservation');

/* 4. Les règles M4 portent sur utile et face réelle ----------------------- */

const roomRule = rules.rules.find((rule) => rule.id === 'TH2D-ROOM-002');
const faceRule = rules.rules.find((rule) => rule.id === 'TH2D-WALL-006');
assert.ok(roomRule && faceRule, 'les deux règles M4 sont enregistrées');
const tooSmall = {
  rooms: [{
    id: 'bedroom_1', type: 'bedroom', label: 'Chambre',
    x0: 0, y0: 0, x1: 5, y1: 5,
    usableRect: { x0: 0.1, y0: 0.1, x1: 1.5, y1: 1.5 },
    parts: [{ x0: 0, y0: 0, x1: 5, y1: 5 }]
  }]
};
assert.equal(roomRule.evaluate(tooSmall).length, 1,
  'TH2D-ROOM-002 refuse la petite surface utile malgré une grande partition historique');
const facePlan = structuredClone(reference);
const faceRoom = facePlan.rooms.find((room) => room.wallFaces.length);
faceRoom.placements = [{ equipmentId: 'test', anchor: 'wall', wallId: 'inconnu', faceId: 'inconnue' }];
assert.equal(faceRule.evaluate(facePlan).length, 1, 'TH2D-WALL-006 refuse un ancrage sans face intérieure');
faceRoom.placements[0].wallId = faceRoom.wallFaces[0].wallId;
faceRoom.placements[0].faceId = faceRoom.wallFaces[0].id;
assert.deepEqual(faceRule.evaluate(facePlan), [], 'TH2D-WALL-006 accepte une face disponible cohérente');

console.log('M4 : ' + plans + ' plans meublés sur leurs polygones utiles · ' + anchored +
  ' équipements ancrés sur une face, dont ' + corners + ' en angle · murs infranchissables hors réservation.');
