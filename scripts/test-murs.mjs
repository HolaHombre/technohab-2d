/* M1 — une limite de pièce devient un mur unique et mesurable.
   Les tests portent sur la couche constructive seule, puis sur son branchement
   au plan généré. Ils ne préjugent ni des surfaces utiles (M2), ni des
   réservations d'ouvertures (M3). */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
['fit.data.js', 'contracts.js', 'construction.js', 'typologie.js', 'squelette.js', 'generator.js'].forEach(function (file) {
  new Function(readFileSync(join(root, 'assets', file), 'utf8'))();
});

const construction = globalThis.TechnoHabConstruction;
const generator = globalThis.TechnoHabGenerator;
const room = (id, parts) => ({ id, parts });
const rect = (x0, y0, x1, y1, role = 'main') => ({ role, x0, y0, x1, y1 });
const interior = (result) => result.walls.filter((wall) => wall.kind === 'interior');
const exterior = (result) => result.walls.filter((wall) => wall.kind === 'exterior');
const pair = (wall) => wall.between.filter((id) => id !== 'exterior').sort().join(':');

/* 1. Configuration constructive ------------------------------------------ */

assert.deepEqual(construction.normalize(), {
  exteriorWallThickness: 0.30,
  interiorWallThickness: 0.10
}, 'les épaisseurs du cadrage sont les valeurs par défaut');
assert.deepEqual(construction.normalize({ exteriorWallThickness: '', interiorWallThickness: null }), {
  exteriorWallThickness: 0.30,
  interiorWallThickness: 0.10
}, 'un champ vide conserve les valeurs par défaut');
assert.deepEqual(construction.normalize({
  exteriorWallThickness: 2,
  interiorWallThickness: 0.01
}), {
  exteriorWallThickness: 1,
  interiorWallThickness: 0.04
}, 'les épaisseurs hors plage sont ramenées aux bornes admises');

/* 2. Rectangle partagé : un seul mur intérieur --------------------------- */

const rectangle = construction.extract([
  room('living', [rect(0, 0, 4, 3)]),
  room('bedroom_1', [rect(4, 0, 7, 3)])
]);
assert.equal(interior(rectangle).length, 1, 'un contact continu donne un mur intérieur unique');
assert.equal(interior(rectangle)[0].length, 3, 'le mur conserve sa longueur géométrique');
assert.equal(interior(rectangle)[0].thickness, 0.10, 'une cloison prend l’épaisseur intérieure');
assert.ok(exterior(rectangle).every((wall) => wall.thickness === 0.30),
  'toute façade prend l’épaisseur extérieure');

/* 3. Pièce en L : aucune paroi entre ses propres parties ----------------- */

const lShape = construction.extract([
  room('living', [rect(0, 0, 4, 2), rect(0, 2, 2, 5, 'notch')]),
  room('bedroom_1', [rect(2, 2, 4, 5)])
]);
assert.equal(interior(lShape).length, 2,
  'la chambre dans le creux du L touche réellement ses deux côtés');
assert.ok(interior(lShape).every((wall) => pair(wall) === 'bedroom_1:living'));
assert.ok(!lShape.walls.some((wall) => wall.orientation === 'horizontal' &&
  wall.axis.y0 === 2 && wall.axis.x0 === 0 && wall.axis.x1 === 2),
  'la couture entre les deux parties du séjour ne devient pas un mur');
assert.deepEqual(lShape.diagnostics.overlaps, [], 'le pavage en L ne contient aucun chevauchement');

/* 4. Jonction en T : les trois contacts restent trois murs ---------------- */

const junction = construction.extract([
  room('a', [rect(0, 0, 4, 6)]),
  room('b', [rect(4, 0, 8, 3)]),
  room('c', [rect(4, 3, 8, 6)])
]);
assert.deepEqual(interior(junction).map(pair).sort(), ['a:b', 'a:c', 'b:c'],
  'une jonction en T est découpée au nœud, sans fusionner deux murs distincts');
assert.equal(new Set(junction.walls.map((wall) => wall.id)).size, junction.walls.length,
  'chaque mur possède un identifiant unique');
assert.deepEqual(
  junction.walls.map((wall) => wall.id),
  construction.extract([
    room('c', [rect(4, 3, 8, 6)]),
    room('a', [rect(0, 0, 4, 6)]),
    room('b', [rect(4, 0, 8, 3)])
  ]).walls.map((wall) => wall.id),
  'les identifiants sont stables quel que soit l’ordre des pièces'
);

/* 5. Contact d’angle : aucun mur partagé --------------------------------- */

const corner = construction.extract([
  room('a', [rect(0, 0, 2, 2)]),
  room('b', [rect(2, 2, 4, 4)])
]);
assert.equal(interior(corner).length, 0, 'deux pièces qui se touchent en un point ne partagent aucun mur');

/* 6. Le plan exporte systématiquement M1 --------------------------------- */

let plans = 0;
for (const shape of ['rectangle', 'lShape', 'uShape']) {
  for (let variant = 1; variant <= 4; variant += 1) {
    const plan = generator.generatePlan({
      surface: 110,
      bedrooms: 3,
      bathrooms: 1,
      separateKitchen: true,
      includeWc: true,
      shape,
      construction: { exteriorWallThickness: 0.36, interiorWallThickness: 0.12 }
    }, variant, 9100 + variant);
    assert.deepEqual(plan.construction, {
      exteriorWallThickness: 0.36,
      interiorWallThickness: 0.12
    }, 'la configuration constructive voyage avec le plan');
    assert.ok(plan.walls.length > 0, shape + ' doit exporter ses murs');
    assert.deepEqual(plan.wallDiagnostics.overlaps, [], shape + ' ne doit superposer aucune pièce');
    assert.equal(new Set(plan.walls.map((wall) => wall.id)).size, plan.walls.length,
      shape + ' ne doit produire aucun mur en double');
    plan.walls.forEach((wall) => {
      assert.ok(wall.between[0] !== wall.between[1], wall.id + ' ne sépare jamais une pièce d’elle-même');
      assert.ok(wall.length > 0, wall.id + ' a une longueur mesurable');
    });
    plans += 1;
  }
}

console.log('Murs M1 : rectangle, L, angle et T vérifiés · ' + plans +
  ' plans générés avec référentiel constructif stable.');
