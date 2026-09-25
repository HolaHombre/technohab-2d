/* PROGRAMME-BANDES étape 3 — le moniteur compare. Pour chaque configuration,
   surface utile (`room.area`) de chaque pièce générée contre la cible de la
   table de programme (assets/programme-bandes.data.js, marches). Ne juge rien :
   mesure l'écart, à graines fixes, avant tout changement du moteur.

     node scripts/compare-table.mjs [--seed=20260926] [--n=4]  */
import fs from 'fs';
import vm from 'vm';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const A = join(dirname(fileURLToPath(import.meta.url)), '..', 'assets');
const arg = (k, d) => { const m = process.argv.find((a) => a.startsWith('--' + k + '=')); return m ? Number(m.split('=')[1]) : d; };
const BASE = arg('seed', 20260926), N = arg('n', 4);
for (const f of ['canonical-values.data.js', 'canonical-values.js', 'programme-bandes.data.js', 'socle.data.js', 'fit.data.js',
  'contracts.js', 'construction.js', 'typologie.js', 'squelette.js', 'relaxation.data.js', 'relaxation.js', 'placement.js',
  'room-model.js', 'generator.js', 'rules.js']) {
  try { vm.runInThisContext(fs.readFileSync(join(A, f), 'utf8')); } catch (e) { void e; }
}
const G = globalThis.TechnoHabGenerator, T = globalThis.TechnoHabProgrammeBandes;

function tableId(room) {
  if (room.type === 'living') return 'sejour';
  if (room.type === 'bedroom') return 'chambre';
  if (room.type === 'kitchen') return 'cuisine';
  if (room.type === 'bath') return (room.composedWith || []).includes('wc') ? 'salle_de_bain_totale' : 'salle_de_bain_sans_wc';
  if (room.type === 'wc') return 'wc';
  if (room.type === 'bureau') return 'bureau';
  if (room.type === 'dining') return 'salle_a_manger';
  return null;
}
const round = (v) => Math.round(v * 10) / 10;
const stats = {}; // id -> {surface -> [ratios]}
const produced = new Set();
const CONFIGS = [[35, 0], [45, 1], [60, 1], [75, 2], [90, 2], [110, 3], [130, 3], [160, 4], [200, 4], [250, 5]];
console.log('graine de base', BASE, '· tirages', N, '· cible = table v0, marches\n');
console.log('surface | pièce | cible | moyenne | min | sous la cible');
const lines = [];
for (const [surface, bedrooms] of CONFIGS) {
  const byRoom = {};
  for (let i = 0; i < N; i += 1) {
    const r = G.generateResult({ surface, bedrooms, bathrooms: bedrooms >= 4 ? 2 : 1, separateKitchen: surface >= 45, includeWc: true },
      1, (BASE + i * 7919 + surface) >>> 0);
    if (r.status !== 'VALID') continue;
    r.builtPlan.plan.rooms.forEach((room) => {
      const id = tableId(room); if (!id) return;
      produced.add(id);
      (byRoom[id] = byRoom[id] || []).push(room.area);
    });
  }
  for (const [id, areas] of Object.entries(byRoom)) {
    const cible = T.target(id, surface);
    const mean = areas.reduce((a, b) => a + b, 0) / areas.length;
    const under = cible === null ? '—' : areas.filter((a) => a < cible - 0.05).length + '/' + areas.length;
    const line = [surface + ' m²', id, cible === null ? '—' : cible, round(mean), round(Math.min(...areas)), under].join(' | ');
    lines.push(line); console.log(line);
  }
}
const missing = Object.keys(T.rooms).filter((id) => !produced.has(id));
console.log('\nPièces de la table jamais générées :', missing.join(', ') || 'aucune');
let h = 2166136261; for (const c of lines.join('\n')) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619) >>> 0; }
console.log('empreinte', h.toString(16).padStart(8, '0'));
