/* Moniteur de diversité — CLASSIFICATION_LOGEMENT.md §3 (24 septembre 2026).
   Ne juge pas la qualité : compte ce que le moteur produit, par typologie et
   par classe, à graines fixes. C'est la base observée des futures Tables B/C
   (DATASOURCE_EQUIPEMENTS.md) — des fréquences mesurées, pas des cotes
   sourcées, et elles se lisent ainsi.

     node scripts/monitor-diversite.mjs [--seed=20260924] [--n=6]

   Deux empreintes en pied de tableau : comparer deux exécutions de même
   graine remplace la lecture ligne à ligne, comme pour scan-capacites. */
import fs from 'fs';
import vm from 'vm';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const A = join(dirname(fileURLToPath(import.meta.url)), '..', 'assets');
const arg = (k, d) => { const m = process.argv.find((a) => a.startsWith('--' + k + '=')); return m ? Number(m.split('=')[1]) : d; };
const BASE = arg('seed', 20260924);
const N = arg('n', 6);

for (const f of ['canonical-values.data.js', 'canonical-values.js', 'programme-bandes.data.js', 'socle.data.js', 'fit.data.js', 'contracts.js',
  'construction.js', 'typologie.js', 'squelette.js', 'relaxation.data.js', 'relaxation.js', 'placement.js',
  'room-model.js', 'generator.js', 'rules.js']) {
  try { vm.runInThisContext(fs.readFileSync(join(A, f), 'utf8')); } catch (e) { void e; }
}
const G = globalThis.TechnoHabGenerator;
const socleTypes = Object.keys(globalThis.TechnoHabSocle.rooms);

const CONFIGS = [];
for (const [surface, bedrooms] of [[35, 0], [45, 1], [60, 1], [75, 2], [90, 2], [110, 3], [130, 3], [160, 4], [200, 4], [250, 5]]) {
  for (const officeType of ['none', 'compact']) {
    CONFIGS.push({ surface, bedrooms, bathrooms: bedrooms >= 4 ? 2 : 1, separateKitchen: surface >= 45,
      includeWc: true, officeType });
  }
}

function fnv(s) { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619) >>> 0; } return h.toString(16).padStart(8, '0'); }

const rows = [], lines = [];
const seenTypes = new Set(), seenEquip = new Map();
for (const cfg of CONFIGS) {
  let valid = 0, maxMs = 0, repas = 0; const types = new Set(); const equip = new Set(); let classif = null;
  for (let i = 0; i < N; i += 1) {
    const t0 = Date.now();
    const r = G.generateResult(cfg, 1, (BASE + i * 7919 + cfg.surface) >>> 0);
    maxMs = Math.max(maxMs, Date.now() - t0);
    if (r.status !== 'VALID') continue;
    valid += 1;
    const plan = r.builtPlan.plan; classif = plan.classification;
    if (plan.rooms.some((room) => (room.placements || []).some((p) => /^dining_table/.test(p.equipmentId)))) repas += 1;
    plan.rooms.forEach((room) => { types.add(room.type); seenTypes.add(room.type);
      (room.placements || []).forEach((p) => { equip.add(p.equipmentId); seenEquip.set(p.equipmentId, (seenEquip.get(p.equipmentId) || 0) + 1); }); });
  }
  const row = [cfg.surface + ' m²', cfg.bedrooms + ' ch', cfg.officeType === 'none' ? '—' : 'bureau',
    classif ? classif.typologie + '/' + classif.classe : '?', valid + '/' + N, [...types].sort().length, [...equip].length, repas + '/' + valid + (types.has('dining') ? ' salle' : ''), maxMs + ' ms max'];
  rows.push(row); lines.push(row.slice(0, 7).join('|') + '|' + [...types].sort().join(',') + '|' + [...equip].sort().join(','));
}
console.log('graine de base', BASE, '· tirages par configuration', N);
console.log('surface | ch | bureau | typo/classe | valides | types | équipements distincts | repas posé | plus long tirage');
rows.forEach((r) => console.log(r.join(' | ')));
console.log('\nTypes de pièce du socle jamais générés :', socleTypes.filter((t) => !seenTypes.has(t)).join(', ') || 'aucun');
console.log('Équipements posés (occurrences) :', [...seenEquip].sort((a, b) => b[1] - a[1]).map(([k, v]) => k + ':' + v).join(' '));
console.log('empreinte', fnv(lines.join('\n')));
