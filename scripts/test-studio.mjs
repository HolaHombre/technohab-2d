/* Studio (PROGRAMME-BANDES, étape 5) : le séjour porte le lit, la cuisine et
   la table ; le canapé convertible doit tenir dans ses deux états. */
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
const S = globalThis.TechnoHabSocle;
const fit = globalThis.TechnoHabFit;

/* 1. Le solveur : le lit déplié est une exigence, pas un décor. */
const lit = S.requiredEquipments('living', 'studio').filter((item) => item.id === 'sofa_bed');
assert.equal(lit.length, 1, 'le séjour studio exige le canapé convertible');
assert.equal(P.solve(lit, { w: 2.0, h: 1.4 }).fits, false, 'lit déplié impossible dans 2,0 × 1,4 m');
assert.equal(P.solve(lit, { w: 2.5, h: 1.5 }).fits, true, 'lit déplié possible dans 2,5 × 1,5 m');

/* 2. Le séjour ordinaire ne connaît pas le studio. */
assert.ok(!S.requiredEquipments('living', 'sejour').some((item) => item.id === 'sofa_bed'));
assert.ok(fit.smallest('living').variant === 'sejour', 'sans variante nommée, le plus petit séjour n’est pas le studio');
assert.ok(fit.smallest('kitchen').variant === 'cuisine', 'ni la kitchenette la plus petite cuisine');

/* 3. Le seuil : studio sous 35 m² sans chambre, jamais au-dessus. */
assert.equal(G.normalizeOptions({ surface: 12, bedrooms: 0 }).studioMode, true);
assert.equal(G.normalizeOptions({ surface: 12, bedrooms: 0 }).surface, 12);
assert.equal(G.normalizeOptions({ surface: 34, bedrooms: 0 }).studioMode, true);
assert.equal(G.normalizeOptions({ surface: 35, bedrooms: 0 }).studioMode, false);
assert.equal(G.normalizeOptions({ surface: 20, bedrooms: 1 }).studioMode, false);
assert.equal(G.normalizeOptions({ surface: 20, bedrooms: 1 }).surface, 35, 'avec chambre, le plancher reste 35 m²');

/* 4. Le programme : un séjour composé, une salle d'eau, rien d'autre. */
const program = G.buildProgram({ surface: 20, bedrooms: 0, bathrooms: 1, separateKitchen: false, includeWc: false });
assert.deepEqual(program.rooms.map((room) => room.id).sort(), ['bath_1', 'living']);
const living = program.rooms.find((room) => room.id === 'living');
assert.equal(living.variant, 'studio');
assert.ok(living.composedWith.includes('kitchen') && living.composedWith.includes('dining'));

/* 5. La génération : fiable dès 18 m² (16 m² réussit 6 graines sur 6 à la mesure, mais la
   recherche est bornée par budget : le test ne parie pas sur la limite), et le plan porte les trois meubles. */
let generes = 0;
for (const surface of [18, 20, 28, 34]) {
  for (const seed of [90101, 90102, 90103]) {
    const plan = G.generatePlan({ surface, bedrooms: 0, bathrooms: 1, separateKitchen: false, includeWc: false }, 1, seed);
    const sejour = plan.rooms.find((room) => room.id === 'living');
    const ids = sejour.placements.map((item) => item.equipmentId);
    for (const id of ['sofa_bed', 'kitchenette', 'dining_table_2']) {
      assert.ok(ids.includes(id), `${id} posé dans le studio de ${surface} m² (graine ${seed})`);
    }
    generes += 1;
  }
}

/* 6. La forme demandée est tenue : le carré est carré, et aucun studio n'est
   une lanière (rapport de l'enveloppe ≤ 1,8, alors qu'il montait à 3,5). */
const rapport = (plan) => {
  const xs = plan.rooms.flatMap((room) => [room.x0, room.x1]);
  const ys = plan.rooms.flatMap((room) => [room.y0, room.y1]);
  const w = Math.max(...xs) - Math.min(...xs);
  const h = Math.max(...ys) - Math.min(...ys);
  return Math.max(w, h) / Math.min(w, h);
};
for (const surface of [18, 20, 30]) {
  for (const seed of [90201, 90202, 90203, 90204]) {
    const base = { surface, bedrooms: 0, bathrooms: 1, separateKitchen: false, includeWc: false };
    assert.ok(rapport(G.generatePlan({ ...base, shape: 'square' }, 1, seed)) <= 1.15,
      `studio carré de ${surface} m² (graine ${seed}) : enveloppe carrée`);
    assert.ok(rapport(G.generatePlan({ ...base, shape: 'rectangle' }, 1, seed)) <= 1.8,
      `studio rectangle de ${surface} m² (graine ${seed}) : pas de lanière`);
  }
}

console.log('Studio : lit à deux états, seuil de surface, programme et ' + generes + ' plans complets vérifiés.');
