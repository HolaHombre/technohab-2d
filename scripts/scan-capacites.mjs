// Banc de capacités : 24 configurations × 30 tirages, conformité, diversité,
// meublabilité, écart de surface et durée.
//
// D4 — les graines sont DÉTERMINISTES par défaut. Elles ont longtemps été
// tirées avec Math.random(), et deux exécutions du même code donnaient alors
// 7 puis 12 signatures distinctes sur la même configuration : le banc ne
// pouvait pas servir de contrôle de non-régression, ce qu'il est pourtant
// censé être pour chaque lot du chantier 7.
//
//   node technohab/scripts/scan-capacites.mjs              graine 20260818
//   node technohab/scripts/scan-capacites.mjs --seed=1234  autre graine
//   node technohab/scripts/scan-capacites.mjs --random     tirage libre
//
// Une mesure ne se compare qu'à une mesure de même graine : le tableau
// l'affiche en tête pour qu'un résultat collé ailleurs reste interprétable.
import fs from 'fs';
import vm from 'vm';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const A = join(dirname(fileURLToPath(import.meta.url)), '..', 'assets');
for (const f of ['fit.data.js', 'generator.js', 'rules.js']) vm.runInThisContext(fs.readFileSync(join(A, f), 'utf8'));
const G = globalThis.TechnoHabGenerator, R = globalThis.TechnoHabRules, F = globalThis.TechnoHabFit;

// La forme reste le rectangle par défaut : c'est elle qui porte l'historique
// des empreintes. `--shape=lShape` mesure une famille sans brouiller la série.
const argShape = process.argv.find((a) => a.startsWith('--shape='));
const forme = argShape ? argShape.slice(8) : 'rectangle';

const GRAINE_PAR_DEFAUT = 20260818;
const argSeed = process.argv.find((a) => a.startsWith('--seed='));
const aleatoire = process.argv.includes('--random');
const graineBase = aleatoire
  ? (Math.random() * 4294967296) >>> 0
  : (Number(argSeed ? argSeed.slice(7) : GRAINE_PAR_DEFAUT) >>> 0);

// Décorrélation par multiplication impaire : deux configurations voisines ne
// doivent pas recevoir des suites de graines voisines, sinon la diversité
// mesurée serait celle des graines, pas celle du moteur.
function graineDe(indexConfig, variante) {
  return (Math.imul(graineBase ^ (indexConfig * 0x9E3779B1), 0x85EBCA6B) + variante * 0x27D4EB2F) >>> 0;
}

// 24 configurations balayant surface, programme, priorité.
const CONFIGS = [
  [35, 0, 1, false, false, 'compact'], [35, 0, 1, true, true, 'compact'],
  [40, 1, 1, false, true, 'compact'], [45, 1, 1, true, true, 'compact'],
  [50, 1, 1, false, true, 'light'], [55, 2, 1, false, true, 'compact'],
  [60, 2, 1, false, false, 'economy'], [65, 2, 1, false, false, 'compact'],
  [70, 2, 1, true, true, 'compact'], [75, 2, 1, false, true, 'compact'],
  [75, 3, 1, false, false, 'light'], [80, 3, 1, false, true, 'compact'],
  [85, 3, 1, true, true, 'economy'], [90, 3, 1, false, true, 'light'],
  [100, 3, 2, true, true, 'compact'], [110, 3, 1, true, true, 'compact'],
  [120, 4, 2, true, true, 'compact'], [130, 4, 1, false, true, 'light'],
  [140, 4, 2, true, true, 'economy'], [150, 5, 1, true, true, 'compact'],
  [150, 5, 2, true, true, 'compact'], [180, 5, 2, true, true, 'light'],
  [220, 5, 2, true, true, 'compact'], [250, 5, 2, true, true, 'economy'],
];

const N = 30;
const ruleTotals = {}, fitFail = {};
let rows = [];

CONFIGS.forEach(([surface, bedrooms, bathrooms, sepK, wc, priority], indexConfig) => {
  const opts = { surface, bedrooms, bathrooms, separateKitchen: sepK, includeWc: wc, priority, shape: forme };
  const prog = G.buildProgram(opts);
  const saturation = prog.minimumTotal / surface;
  let hard = 0, sigs = new Set(), worst = 0, roomsTot = 0, fitOk = 0, nonRect = 0, ms = 0, t0 = Date.now();
  const by = {};
  for (let v = 0; v < N; v++) {
    const p = G.generatePlan(opts, v, graineDe(indexConfig, v));
    const rep = R.evaluatePlan(p);
    if (rep.summary.hard) hard++;
    rep.violations.forEach(x => { by[x.ruleId] = (by[x.ruleId] || 0) + 1; ruleTotals[x.ruleId] = (ruleTotals[x.ruleId] || 0) + 1; });
    sigs.add(p.rooms.map(r => r.id + ':' + r.x0.toFixed(1) + ',' + r.y0.toFixed(1)).sort().join('|'));
    worst = Math.max(worst, Math.abs(p.rooms.reduce((s, r) => s + r.area, 0) - p.boundary.area));
    for (const r of p.rooms) {
      roomsTot++;
      if (r.edgeCount > 4) nonRect++;
      const u = r.usableRect;
      const ok = F.fits(r.type, u.x1 - u.x0, u.y1 - u.y0);
      if (ok) fitOk++; else fitFail[r.type] = (fitFail[r.type] || 0) + 1;
    }
  }
  ms = Math.round((Date.now() - t0) / N);
  rows.push({
    label: `${surface}m² ${bedrooms}ch ${bathrooms}sdb ${sepK ? 'K' : '-'}${wc ? 'W' : '-'} ${priority.slice(0, 4)}`,
    sat: saturation, hard, div: sigs.size, fit: fitOk / roomsTot, nonRect: nonRect / roomsTot, worst, ms, by
  });
});

console.log('forme : ' + forme);
console.log('graine de base : ' + graineBase + (aleatoire ? ' (tirage libre, non rejouable)' : ' (rejouable)'));
console.log('configuration                  | satur | HARD  | div   | meublable | formes L | ecart | ms');
console.log('-'.repeat(100));
for (const r of rows) {
  console.log(
    r.label.padEnd(30) + ' | ' +
    (r.sat * 100).toFixed(0).padStart(4) + '% | ' +
    (r.hard + '/' + N).padStart(5) + ' | ' +
    (r.div + '/' + N).padStart(5) + ' | ' +
    (r.fit * 100).toFixed(0).padStart(8) + '% | ' +
    (r.nonRect * 100).toFixed(0).padStart(7) + '% | ' +
    r.worst.toFixed(3).padStart(5) + ' | ' + String(r.ms).padStart(3)
  );
}
// Empreinte des seules colonnes de résultat. La durée en est exclue : c'est
// une mesure de la machine, pas du moteur, et elle varie d'un passage à
// l'autre. Deux empreintes égales à graine égale = aucune régression ; c'est
// la preuve n°4 exigée de chaque lot du chantier 7, en une ligne.
const empreinte = rows.map((r) => [r.sat.toFixed(4), r.hard, r.div, r.fit.toFixed(4), r.nonRect.toFixed(4), r.worst.toFixed(3)].join(','))
  .join(';')
  .split('')
  .reduce((h, c) => (Math.imul(h ^ c.charCodeAt(0), 0x01000193) >>> 0), 0x811C9DC5)
  .toString(16)
  .padStart(8, '0');
console.log('\nempreinte des résultats (hors durées) : ' + empreinte);

console.log('\n--- regles declenchees, tous scenarios confondus ---');
Object.entries(ruleTotals).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => console.log('  ' + k.padEnd(22) + String(v).padStart(5)));
console.log('\n--- pieces non meublables selon le socle (fits) ---');
Object.entries(fitFail).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => console.log('  ' + k.padEnd(22) + String(v).padStart(5)));
