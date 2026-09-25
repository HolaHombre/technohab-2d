/* DIVERS-1 — le repas : coin adossé hébergé, salle autonome par la classe,
   et la borne du solveur qui a fait diverger un cas de 45 m² (25 septembre
   2026). Chaque assertion porte une mesure du moniteur, pas une intention. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
['canonical-values.data.js', 'canonical-values.js', 'socle.data.js', 'fit.data.js', 'contracts.js',
  'construction.js', 'typologie.js', 'squelette.js', 'relaxation.data.js', 'relaxation.js', 'placement.js',
  'room-model.js', 'generator.js', 'rules.js'].forEach((file) => {
  new Function(readFileSync(join(root, 'assets', file), 'utf8'))();
});
const G = globalThis.TechnoHabGenerator;
const opts = (o) => G.normalizeOptions(o);

/* 1. Le défaut suit la classe, l'utilisateur garde la main ---------------- */
assert.equal(opts({ surface: 75 }).separateDining, false, '75 m² (moyen) : coin repas');
assert.equal(opts({ surface: 90 }).separateDining, true, '90 m² (grand) : salle dédiée');
assert.equal(opts({ surface: 110, shape: 'lShape' }).separateDining, false,
  'un L à 110 m² reste en coin repas : la salle dédiée le rend intenable (test-formes)');
assert.equal(opts({ surface: 140, shape: 'lShape' }).separateDining, true, 'un L dès 140 m²');
assert.equal(opts({ surface: 75, diningMode: 'separate' }).separateDining, true, 'forcé séparé');
assert.equal(opts({ surface: 200, diningMode: 'hosted' }).separateDining, false, 'forcé hébergé');
assert.equal(opts({ diningMode: 'nimporte' }).diningMode, 'auto', 'valeur inconnue → automatique');

/* 2. Salle autonome : pièce, table requise, plan valide ------------------- */
const salle = G.generateResult({ surface: 130, bedrooms: 3, bathrooms: 1, separateKitchen: true, includeWc: true }, 1, 20260924);
assert.equal(salle.status, 'VALID');
const room = salle.builtPlan.plan.rooms.find((r) => r.type === 'dining');
assert.ok(room, 'la salle à manger est une pièce du plan à 130 m²');
assert.ok(room.placements.some((p) => p.equipmentId === 'dining_table_4'), 'sa table 4 places est posée');
const living = salle.builtPlan.plan.rooms.find((r) => r.type === 'living');
assert.ok(!(living.composedWith || []).includes('dining'), 'le séjour n’héberge plus le repas');

/* 3. Coin repas adossé : hébergé, table 2 places contre un mur ------------- */
const coin = G.generateResult({ surface: 75, bedrooms: 2, bathrooms: 1, separateKitchen: true, includeWc: true }, 1, 20260924);
assert.equal(coin.status, 'VALID');
const sejour = coin.builtPlan.plan.rooms.find((r) => r.type === 'living');
assert.ok((sejour.composedWith || []).includes('dining'), 'le séjour héberge le coin repas');
const table = sejour.placements.find((p) => /^dining_table/.test(p.equipmentId));
assert.ok(table, 'une table est posée dans le séjour de 75 m²');
assert.equal(table.anchor === 'wall' || table.sizeId === 'dining_table_4', true,
  'adossée contre un mur, ou 4 places libre quand la place existe');

/* 4. Liveness : un cas qui ne se terminait pas doit rendre la main -------- */
const t0 = Date.now();
const borne = G.generateResult({ surface: 45, bedrooms: 1, bathrooms: 1, separateKitchen: true, includeWc: true,
  officeType: 'none' }, 1, 20260959);
const ms = Date.now() - t0;
assert.ok(ms < 20000, 'la recherche est bornée (mesuré : ~1,5 s ; plus de 45 s avant la borne, avec un repas requis) — obtenu ' + ms + ' ms');

assert.ok(['VALID', 'NON_TROUVE'].includes(borne.status), 'un refus borné est un résultat, pas une panne');
/* 5. La graine ne suffit pas : le plan porte la révision du moteur qui l'a produit. */
assert.equal(typeof G.engineRevision, 'string');
assert.equal(salle.builtPlan.plan.engineRevision, G.engineRevision,
  'un plan archivé doit pouvoir dire par quel moteur il a été produit');
console.log('Repas : défaut par classe, salle dédiée, coin adossé et borne du solveur vérifiés (' + ms + ' ms).');
