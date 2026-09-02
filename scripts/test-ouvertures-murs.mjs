/* M3 — portes et fenêtres appartiennent à un mur réellement percé. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
['fit.data.js', 'contracts.js', 'construction.js', 'typologie.js', 'squelette.js', 'generator.js', 'rules.js'].forEach(function (file) {
  new Function(readFileSync(join(root, 'assets', file), 'utf8'))();
});

const construction = globalThis.TechnoHabConstruction;
const generator = globalThis.TechnoHabGenerator;
const wallRule = globalThis.TechnoHabRules.rules.find((rule) => rule.id === 'TH2D-WALL-005');
const rect = (x0, y0, x1, y1) => ({ role: 'main', x0, y0, x1, y1 });
const close = (actual, expected, tolerance, message) => {
  assert.ok(Math.abs(actual - expected) <= tolerance,
    message + ' — attendu ' + expected + ', obtenu ' + actual);
};

/* 1. Réservation unitaire, jonction et chevauchement --------------------- */

const extracted = construction.extract([
  { id: 'a', parts: [rect(0, 0, 4, 4)] },
  { id: 'b', parts: [rect(4, 0, 8, 4)] }
]);
const shared = extracted.walls.find((wall) => wall.kind === 'interior');
const valid = {
  id: 'valid', kind: 'porte', entre: ['a', 'b'], wallId: shared.id,
  largeur: 0.83, bayWidth: 0.83, leafWidth: 0.80, clearWidth: 0.77,
  x: 4, y: 2, ouvreVers: 'a'
};
const nearJunction = {
  id: 'junction', kind: 'porte', wallId: shared.id,
  largeur: 0.83, x: 4, y: 0.40, ouvreVers: 'a'
};
const tooClose = {
  id: 'overlap', kind: 'porte', wallId: shared.id,
  largeur: 0.83, x: 4, y: 2.90, ouvreVers: 'b'
};
const missingWall = {
  id: 'missing', kind: 'fenetre', wallId: 'wall_absent',
  largeur: 1.20, x: 0, y: 0
};
const reserved = construction.reserveOpenings(extracted.walls,
  [valid, nearJunction, tooClose, missingWall]);

assert.equal(reserved.reservations.length, 1, 'seule la baie contenue et isolée est réservée');
assert.deepEqual(reserved.rejected.map((item) => item.reason),
  ['JUNCTION_CLEARANCE', 'OPENING_OVERLAP', 'WALL_NOT_FOUND'],
  'les refus distinguent jonction, chevauchement et mur absent');
assert.equal(valid.reservationId, 'reservation_valid');
assert.equal(valid.crossedThickness, shared.thickness, 'la réservation traverse toute la cloison');
assert.deepEqual(valid.faceIds.sort(), Object.values(shared.faces).map((face) => face.id).sort(),
  'l’ouverture expose les deux faces du mur');
assert.equal(valid.faceId, shared.faces.a.id, 'la porte référence la face de sa pièce d’ouverture');
assert.equal(valid.debattement.x1, shared.faces.a.axis.x0,
  'le débattement démarre sur la face intérieure, pas sur l’axe du mur');
close(reserved.reservations[0].volume.x1 - reserved.reservations[0].volume.x0,
  shared.thickness, 0.001, 'le volume réservé traverse l’épaisseur complète');
close(shared.solidSegments.reduce((sum, segment) => sum + segment.end - segment.start, 0) + valid.bayWidth,
  shared.length, 0.001, 'le plein restant et la baie recomposent le mur');

/* 2. Plans générés : toutes les ouvertures ont un mur et une baie -------- */

let plans = 0;
let openings = 0;
for (const shape of ['rectangle', 'lShape', 'uShape']) {
  for (const thickness of [
    { exteriorWallThickness: 0.30, interiorWallThickness: 0.10 },
    { exteriorWallThickness: 0.42, interiorWallThickness: 0.16 }
  ]) {
    for (let variant = 1; variant <= 4; variant += 1) {
      const plan = generator.generatePlan({
        surface: 110,
        bedrooms: 3,
        bathrooms: 1,
        separateKitchen: true,
        includeWc: true,
        shape,
        construction: thickness
      }, variant, 303000 + variant);
      const walls = Object.fromEntries(plan.walls.map((wall) => [wall.id, wall]));
      const reservations = Object.fromEntries(plan.reservations.map((reservation) => [reservation.id, reservation]));
      const planOpenings = plan.portes.concat(plan.entree ? [plan.entree] : [], plan.fenetres);

      assert.ok(planOpenings.length > 0, shape + ' produit des ouvertures');
      assert.deepEqual(plan.wallDiagnostics.rejectedOpenings, [], shape + ' ne rejette aucune baie placée');
      assert.deepEqual(wallRule.evaluate(plan), [], 'TH2D-WALL-005 passe sur ' + shape);

      planOpenings.forEach((opening) => {
        const wall = walls[opening.wallId];
        const reservation = reservations[opening.reservationId];
        assert.ok(wall, opening.id + ' référence un mur existant');
        assert.ok(reservation, opening.id + ' référence une réservation existante');
        assert.equal(reservation.wallId, wall.id, opening.id + ' et sa réservation partagent le mur');
        assert.equal(reservation.openingId, opening.id, opening.id + ' possède sa propre réservation');
        assert.ok(opening.entre.every((space) => wall.between.includes(space)),
          opening.id + ' traverse les espaces annoncés');
        close(reservation.bayWidth, opening.bayWidth, 0.001, opening.id + ' conserve sa largeur de baie');
        close(reservation.crossedThickness, wall.thickness, 0.001,
          opening.id + ' traverse toute l’épaisseur du mur');
        assert.ok(reservation.start - (wall.orientation === 'vertical' ? wall.axis.y0 : wall.axis.x0) >= 0.079,
          opening.id + ' reste à distance de la première jonction');
        assert.ok((wall.orientation === 'vertical' ? wall.axis.y1 : wall.axis.x1) - reservation.end >= 0.079,
          opening.id + ' reste à distance de la seconde jonction');
        if (opening.kind === 'fenetre' || opening.kind === 'porte-coulissante') {
          assert.equal(opening.debattement, null, opening.id + ' n’a aucun débattement battant');
        } else {
          const face = wall.faces[opening.ouvreVers];
          assert.equal(opening.faceId, face.id, opening.id + ' ouvre depuis la bonne face');
          const faceCoordinate = wall.orientation === 'vertical' ? face.axis.x0 : face.axis.y0;
          const swingCoordinates = wall.orientation === 'vertical'
            ? [opening.debattement.x0, opening.debattement.x1]
            : [opening.debattement.y0, opening.debattement.y1];
          assert.ok(swingCoordinates.includes(faceCoordinate), opening.id + ' part de la face intérieure');
        }
        openings += 1;
      });

      plan.walls.forEach((wall) => {
        const solid = wall.solidSegments.reduce((sum, segment) => sum + segment.end - segment.start, 0);
        const bays = wall.reservations.reduce((sum, reservation) => sum + reservation.bayWidth, 0);
        close(solid + bays, wall.length, 0.003, wall.id + ' est exactement décomposé en plein et baies');
      });
      plans += 1;
    }
  }
}

/* 3. La règle détecte aussi une référence croisée incohérente ------------ */

const checkedPlan = generator.generatePlan({ surface: 75, bedrooms: 2, bathrooms: 1, shape: 'rectangle' }, 1, 42);
const corruptOpening = checkedPlan.portes[0];
const originalWallId = checkedPlan.reservations.find((item) => item.id === corruptOpening.reservationId).wallId;
checkedPlan.reservations.find((item) => item.id === corruptOpening.reservationId).wallId = 'wall_corrompu';
assert.ok(wallRule.evaluate(checkedPlan).some((violation) => violation.entityId === corruptOpening.id),
  'TH2D-WALL-005 refuse une réservation croisée avec un autre mur');
checkedPlan.reservations.find((item) => item.id === corruptOpening.reservationId).wallId = originalWallId;

console.log('Ouvertures M3 : refus aux jonctions, faces, débattements et ' + plans +
  ' plans vérifiés · ' + openings + ' baies rattachées à leurs murs.');
