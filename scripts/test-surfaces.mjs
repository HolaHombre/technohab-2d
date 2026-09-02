/* M2 — les murs consomment une surface réelle et la demande reste une
   surface habitable. Le rendu et les ouvertures ne sont pas concernés ici. */
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
const rules = globalThis.TechnoHabRules;
const rect = (x0, y0, x1, y1) => ({ role: 'main', x0, y0, x1, y1 });
const close = (actual, expected, tolerance, message) => {
  assert.ok(Math.abs(actual - expected) <= tolerance,
    message + ' — attendu ' + expected + ', obtenu ' + actual);
};
const ringArea = (ring) => ring.reduce((area, point, index) => {
  const next = ring[(index + 1) % ring.length];
  return area + point.x * next.y - next.x * point.y;
}, 0) / 2;
const polygonArea = (polygon) => Math.abs(polygon.reduce((area, ring) => area + ringArea(ring), 0));

/* 1. Deux pièces et une cloison ------------------------------------------ */

const rooms = [
  { id: 'living', parts: [rect(0, 0, 4, 3)] },
  { id: 'bedroom_1', parts: [rect(4, 0, 7, 3)] }
];
const measured = construction.analyze(rooms);
close(measured.rooms.living.usableArea, 11.85, 0.001,
  'le séjour perd une demi-cloison de 5 cm sur 3 m');
close(measured.rooms.bedroom_1.usableArea, 8.85, 0.001,
  'la chambre perd l’autre demi-cloison');
close(measured.metrics.interiorWallArea, 0.30, 0.001,
  'la cloison de 10 cm sur 3 m consomme 0,30 m²');
close(measured.metrics.exteriorWallArea, 6.36, 0.001,
  'le mur extérieur inclut le périmètre et les quatre angles');
close(measured.metrics.grossFloorArea, 27.36, 0.001,
  'l’emprise brute ajoute les murs extérieurs à la partition');
close(measured.metrics.wallArea, 6.66, 0.001,
  'la surface de murs réunit extérieur et cloison');
assert.deepEqual(measured.rooms.living.usablePolygon, [[
  { x: 0, y: 0 }, { x: 3.95, y: 0 }, { x: 3.95, y: 3 }, { x: 0, y: 3 }
]], 'le contour utile suit la face intérieure de la cloison');

/* 2. La partition s’agrandit pour préserver la demande ------------------ */

const fitted = construction.fitHabitable(rooms, 21);
assert.ok(fitted.scale > 1, 'la matière intérieure exige une partition légèrement plus grande');
close(fitted.construction.metrics.habitableArea, 21, 0.01,
  'la surface habitable demandée est récupérée après dimensionnement');
close(
  fitted.construction.metrics.grossFloorArea,
  fitted.construction.metrics.habitableArea + fitted.construction.metrics.wallArea,
  0.01,
  'l’invariant emprise brute = habitable + murs est tenu'
);

/* 3. Plans générés : rectangles, L et U ---------------------------------- */

let plans = 0;
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
      }, variant, 202600 + variant);

      close(plan.habitableArea, plan.targetHabitableArea, 0.01,
        shape + ' conserve la surface habitable demandée');
      close(plan.grossFloorArea, plan.habitableArea + plan.wallArea, 0.01,
        shape + ' conserve les surfaces constructives');
      close(plan.rooms.reduce((sum, room) => sum + room.usableArea, 0), plan.habitableArea, 0.01,
        shape + ' attribue toute la surface habitable aux pièces');
      close(plan.rooms.reduce((sum, room) => sum + room.partitionArea, 0), plan.partitionArea, 0.02,
        shape + ' attribue toute la partition');
      assert.ok(plan.partitionArea > plan.habitableArea,
        shape + ' réserve une surface mesurable aux cloisons');
      assert.ok(plan.grossFloorArea > plan.partitionArea,
        shape + ' ajoute les murs extérieurs hors de la partition habitable');
      assert.deepEqual(plan.wallDiagnostics.overlaps, [], shape + ' ne superpose aucune pièce');
      assert.deepEqual(plan.wallDiagnostics.disconnectedUsableRooms, [],
        shape + ' conserve une surface utile connexe par pièce');

      plan.rooms.forEach((room) => {
        assert.ok(room.usablePolygon.length >= 1, room.id + ' exporte son polygone utile');
        room.usablePolygon.forEach((ring) => assert.ok(ring.length >= 4,
          room.id + ' : chaque anneau utile a au moins quatre sommets'));
        close(polygonArea(room.usablePolygon), room.usableArea, 0.02,
          room.id + ' : le polygone et sa surface racontent la même géométrie');
      });

      ['TH2D-WALL-001', 'TH2D-WALL-002', 'TH2D-WALL-003', 'TH2D-WALL-004'].forEach((id) => {
        const rule = rules.rules.find((candidate) => candidate.id === id);
        assert.ok(rule, id + ' doit être enregistré');
        assert.deepEqual(rule.evaluate(plan), [], id + ' doit passer sur ' + shape);
      });
      plans += 1;
    }
  }
}

console.log('Surfaces M2 : géométrie utile, conservation et ' + plans +
  ' plans rectangle/L/U vérifiés sur deux systèmes d’épaisseurs.');
