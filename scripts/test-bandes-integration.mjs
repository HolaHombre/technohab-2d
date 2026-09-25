/* PROGRAMME-BANDES étape 4 — le moteur AVEC la table, comme dans le produit
   (index.html charge assets/programme-bandes.data.js). Les autres tests de la
   suite ne la chargent pas : ils éprouvent des mécanismes. Celui-ci éprouve ce
   que l'utilisateur obtient. Chaque seuil vient d'une mesure du 26 septembre 2026. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
['canonical-values.data.js', 'canonical-values.js', 'programme-bandes.data.js', 'socle.data.js', 'fit.data.js',
  'contracts.js', 'construction.js', 'typologie.js', 'squelette.js', 'relaxation.data.js', 'relaxation.js',
  'placement.js', 'room-model.js', 'generator.js', 'rules.js'].forEach((file) => {
  new Function(readFileSync(join(root, 'assets', file), 'utf8'))();
});
const G = globalThis.TechnoHabGenerator;
const T = globalThis.TechnoHabProgrammeBandes;
const plan = (o, seed) => {
  const r = G.generateResult({ bathrooms: 1, separateKitchen: true, includeWc: true, ...o }, 1, seed);
  return r;
};

/* 1. Les chambres tiennent la cible de la table (usable), là où elle est définie. */
for (const [surface, bedrooms] of [[60, 1], [75, 2], [90, 2], [110, 3]]) {
  for (let i = 0; i < 3; i += 1) {
    const r = plan({ surface, bedrooms }, (20260926 + i * 7919 + surface) >>> 0);
    assert.equal(r.status, 'VALID', surface + ' m², ' + bedrooms + ' ch doit rester valide');
    r.builtPlan.plan.rooms.filter((room) => room.type === 'bedroom').forEach((room) => {
      assert.ok(room.area >= T.target('chambre', surface) - 0.05,
        surface + ' m² : ' + room.id + ' à ' + room.area.toFixed(1) + ' m², cible ' + T.target('chambre', surface));
    });
  }
}

/* 2. La salle à manger autonome tient sa cible (marge de 20 % mesurée). */
for (let i = 0; i < 3; i += 1) {
  const r = plan({ surface: 110, bedrooms: 3 }, (20260926 + i * 7919 + 110) >>> 0);
  assert.equal(r.status, 'VALID');
  const salle = r.builtPlan.plan.rooms.find((room) => room.type === 'dining');
  assert.ok(salle, '110 m² : salle à manger dédiée');
  assert.ok(salle.area >= T.target('salle_a_manger', 110) - 0.05,
    'salle à manger à ' + salle.area.toFixed(1) + ' m², cible ' + T.target('salle_a_manger', 110));
}

/* 3. Le repas suit le contrat chambre : minima trop serrés → hébergé, sans échec.
      90 m² à 3 chambres échouait 3 fois sur 6 avec une salle dédiée (97 % de la surface). */
const serre = G.buildProgram({ surface: 90, bedrooms: 3, bathrooms: 1, separateKitchen: true, includeWc: true });
assert.equal(serre.options.separateDining, false, '90 m², 3 chambres : le repas reste hébergé');
assert.equal(serre.options.diningFallback, 'minima-trop-serres');
const forcee = G.buildProgram({ surface: 90, bedrooms: 3, bathrooms: 1, separateKitchen: true, includeWc: true, diningMode: 'separate' });
assert.equal(forcee.options.separateDining, true, 'une demande explicite n’est jamais retirée');
for (let i = 0; i < 3; i += 1) {
  assert.equal(plan({ surface: 90, bedrooms: 3 }, (20260926 + i * 7919 + 90) >>> 0).status, 'VALID',
    '90 m², 3 chambres, repli du repas : valide');
}

/* 4. Repas hébergé : table à 4 places requise dès 50 m², 2 places en dessous. */
const r60 = plan({ surface: 60, bedrooms: 1 }, 20260926);
assert.equal(r60.status, 'VALID');
const sejour60 = r60.builtPlan.plan.rooms.find((room) => room.type === 'living');
assert.ok(sejour60.placements.some((p) => p.equipmentId === 'dining_table_4'), '60 m² : table 4 places posée');
const r45 = plan({ surface: 45, bedrooms: 1 }, 20260926);
if (r45.status === 'VALID') {
  const sejour45 = r45.builtPlan.plan.rooms.find((room) => room.type === 'living');
  assert.ok(!sejour45.placements.some((p) => p.equipmentId === 'dining_table_4'),
    '45 m² : pas de table 4 places requise — le studio/T1 attend son mode dédié');
}

console.log('Table de programme dans le moteur : chambre, salle à manger, repli du repas et table 4 places vérifiés.');
