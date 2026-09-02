// Banc complémentaire de scan-capacites.mjs : 15 seeds FIXES, gardés en clair.
// Objectif : mesurer la dispersion inter-seed, pas la moyenne. Le banc
// principal agrège 30 tirages en un seul chiffre par configuration ; ici on
// garde le détail par seed pour répondre à « le seed change-t-il quelque
// chose ? ».
//
// Depuis D4 (18 août 2026), le banc principal est lui aussi rejouable : sa
// graine de base est fixe par défaut et affichée en tête de tableau. Ces deux
// bancs ne s'opposent plus par le déterminisme, mais par la question posée —
// la moyenne d'un côté, la dispersion de l'autre.
import fs from 'fs';
import vm from 'vm';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const A = join(dirname(fileURLToPath(import.meta.url)), '..', 'assets');
for (const f of ['fit.data.js', 'placement.js', 'contracts.js', 'construction.js', 'typologie.js', 'squelette.js', 'generator.js', 'rules.js']) {
  let source = fs.readFileSync(join(A, f), 'utf8');
  if (f === 'generator.js') {
    source = source.replaceAll('s4: true', 's4: false')
      .replace("passes: false, method: 'chamfer-grid-v1'", "passes: true, method: 'chamfer-grid-v1'");
  }
  vm.runInThisContext(source);
}
/* Photographie historique M0 : les symétries M4a sont neutralisées. Leur
   diversité et leur innocuité sont mesurées par le test et l'audit dédiés. */
globalThis.TechnoHabSquelette.transformations = (pose) => [Object.assign({}, pose, {
  transformation: 'r0', equivalenceClass: 'witness-m0-r0'
})];
globalThis.TechnoHabAblations = {
  disableM4a2FacadeCost: true,
  disableM4a2InteriorTerminations: true,
  disableM5BranchUtility: true
};
const G = globalThis.TechnoHabGenerator, R = globalThis.TechnoHabRules, F = globalThis.TechnoHabFit;

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

// 15 seeds fixes, tirés une fois puis figés : rejouables d'une exécution à
// l'autre, et sans rapport avec le hash(options+variante) du mode par défaut.
const SEEDS = [
  0x1F2E3D4C, 0x7A9B0C1D, 0x2468ACE0, 0xDEADBEEF, 0x0BADF00D,
  0x5EED1234, 0xA1B2C3D4, 0x13579BDF, 0xC0FFEE11, 0x8BADF00D,
  0x00FF00FF, 0x9E3779B9, 0x6D2B79F5, 0x3C3C3C3C, 0xFEEDFACE,
].map((s) => s >>> 0);

const sd = (xs) => {
  if (xs.length < 2) return 0;
  const m = xs.reduce((a, b) => a + b, 0) / xs.length;
  return Math.sqrt(xs.reduce((a, b) => a + (b - m) * (b - m), 0) / (xs.length - 1));
};
const mean = (xs) => xs.reduce((a, b) => a + b, 0) / xs.length;

const ruleTotals = {}, fitFail = {}, rows = [];

for (const [surface, bedrooms, bathrooms, sepK, wc, priority] of CONFIGS) {
  const opts = { surface, bedrooms, bathrooms, separateKitchen: sepK, includeWc: wc, priority };
  const prog = G.buildProgram(opts);
  const per = [];        // une entrée par seed
  const sigs = new Set();
  let worst = 0;
  const by = {};

  for (const seed of SEEDS) {
    const t0 = process.hrtime.bigint();
    let p;
    try {
      p = G.generatePlan(opts, 1, seed);
    } catch (error) {
      if (!error || (error.code !== 'NON_TROUVE' && error.code !== 'IMPOSSIBLE')) throw error;
      const ms = Number(process.hrtime.bigint() - t0) / 1e6;
      per.push({
        seed, ms, nonFound: 1, hard: 0, dette: 0, viol: 0, guideline: 0,
        manquantes: 0, demandees: prog.desiredEdges.length,
        score: 0, candidate: 0, budget: 0, solved: 0,
        fit: 0, nonRect: 0, rooms: prog.rooms.length,
        fitFailures: 0, nonRectRooms: 0, carving: 0, shaping: 0,
        living: 0, aspect: 0
      });
      continue;
    }
    const ms = Number(process.hrtime.bigint() - t0) / 1e6;
    const rep = R.evaluatePlan(p);
    // Les manquements aux regles inscrites dans LIMITES sont routes vers
    // rep.limites et n'apparaissent PAS dans rep.violations ni dans
    // summary.hard. Les compter separement, sinon la colonne HARD mesure
    // « zero violation hors dette connue », ce qui n'est pas « conforme ».
    [...rep.violations, ...rep.limites].forEach((x) => {
      by[x.ruleId] = (by[x.ruleId] || 0) + 1;
      ruleTotals[x.ruleId] = (ruleTotals[x.ruleId] || 0) + 1;
    });

    // Verdict independant du moteur de regles : on relit le graphe final et
    // on compte les adjacences demandees par le programme qui n'y sont pas.
    const manquantes = p.requestedEdges.filter((r) => !p.edges.some(
      (e) => (e.a === r.a && e.b === r.b) || (e.a === r.b && e.b === r.a))).length;

    let roomsTot = 0, fitOk = 0, nonRect = 0;
    for (const r of p.rooms) {
      roomsTot += 1;
      if (r.edgeCount > 4) nonRect += 1;
      const u = r.usableRect;
      if (F.fits(r.type, u.x1 - u.x0, u.y1 - u.y0)) fitOk += 1;
      else fitFail[r.type] = (fitFail[r.type] || 0) + 1;
    }
    worst = Math.max(worst, Math.abs(p.rooms.reduce((s, r) => s + r.area, 0) - p.boundary.area));
    sigs.add(p.rooms.map((r) => r.id + ':' + r.x0.toFixed(1) + ',' + r.y0.toFixed(1)).sort().join('|'));

    per.push({
      seed, ms, nonFound: 0,
      hard: rep.summary.hard ? 1 : 0,
      dette: rep.summary.limitesHard ? 1 : 0,
      viol: rep.violations.length,
      guideline: rep.violations.filter((v) => v.level === 'GUIDELINE').length,
      manquantes, demandees: p.requestedEdges.length,
      score: p.score,
      // Rang du candidat retenu dans le budget : 1 = trouvé du premier coup,
      // budget = la recherche n'a jamais atteint un score nul.
      candidate: p.candidate, budget: p.budget,
      solved: p.score === 0 ? 1 : 0,
      fit: fitOk / roomsTot,
      nonRect: nonRect / roomsTot,
      rooms: roomsTot,
      fitFailures: roomsTot - fitOk,
      nonRectRooms: nonRect,
      carving: p.carving ? 1 : 0, shaping: p.shaping,
      // Aire du séjour : indicateur géométrique continu, pour voir si la
      // géométrie bouge même quand les indicateurs binaires ne bougent pas.
      living: (p.rooms.find((r) => r.id === 'living') || {}).area || 0,
      aspect: p.boundary.width / p.boundary.height,
    });
  }

  rows.push({
    label: `${surface}m² ${bedrooms}ch ${bathrooms}sdb ${sepK ? 'K' : '-'}${wc ? 'W' : '-'} ${priority.slice(0, 4)}`,
    sat: prog.minimumTotal / surface, rooms: prog.rooms.length,
    per, sigs: sigs.size, worst, by,
  });
}

const N = SEEDS.length;
console.log('=== BANC 15 SEEDS FIXES — ' + CONFIGS.length + ' configurations, ' + (CONFIGS.length * N) + ' plans ===\n');
console.log('configuration                  | satur | HARD  | DETTE | adj. manquantes  | div   | meublable   | formes L | score moy (ec) | cand. moy | budget | resolu | ms');
console.log('-'.repeat(160));
for (const r of rows) {
  const p = r.per;
  const fits = p.map((x) => x.fit), scores = p.map((x) => x.score), cands = p.map((x) => x.candidate);
  const manq = p.map((x) => x.manquantes);
  console.log(
    r.label.padEnd(30) + ' | ' +
    (r.sat * 100).toFixed(0).padStart(4) + '% | ' +
    (p.reduce((s, x) => s + x.hard, 0) + '/' + N).padStart(5) + ' | ' +
    (p.reduce((s, x) => s + x.dette, 0) + '/' + N).padStart(5) + ' | ' +
    (mean(manq).toFixed(1) + '/' + p[0].demandees + ' [' + Math.min(...manq) + '..' + Math.max(...manq) + ']').padStart(16) + ' | ' +
    (r.sigs + '/' + N).padStart(5) + ' | ' +
    ((mean(fits) * 100).toFixed(0) + '%±' + (sd(fits) * 100).toFixed(0)).padStart(11) + ' | ' +
    (mean(p.map((x) => x.nonRect)) * 100).toFixed(0).padStart(7) + '% | ' +
    (mean(scores).toFixed(1) + ' (' + sd(scores).toFixed(1) + ')').padStart(14) + ' | ' +
    mean(cands).toFixed(0).padStart(9) + ' | ' +
    String(p[0].budget).padStart(6) + ' | ' +
    (p.reduce((s, x) => s + x.solved, 0) + '/' + N).padStart(6) + ' | ' +
    mean(p.map((x) => x.ms)).toFixed(0).padStart(4)
  );
}

console.log('\n--- dispersion inter-seed, par configuration ---');
console.log('configuration                  | sejour m2 min..max (ec)     | aspect min..max | L formes | carving | shaping | viol. GUIDELINE');
console.log('-'.repeat(140));
for (const r of rows) {
  const p = r.per;
  const liv = p.map((x) => x.living), asp = p.map((x) => x.aspect), nr = p.map((x) => x.nonRect);
  console.log(
    r.label.padEnd(30) + ' | ' +
    (Math.min(...liv).toFixed(1) + '..' + Math.max(...liv).toFixed(1) + ' (' + sd(liv).toFixed(2) + ')').padStart(27) + ' | ' +
    (Math.min(...asp).toFixed(2) + '..' + Math.max(...asp).toFixed(2)).padStart(15) + ' | ' +
    ((Math.min(...nr) * 100).toFixed(0) + '..' + (Math.max(...nr) * 100).toFixed(0) + '%').padStart(8) + ' | ' +
    (Math.min(...p.map((x) => x.carving)) + '..' + Math.max(...p.map((x) => x.carving))).padStart(7) + ' | ' +
    (Math.min(...p.map((x) => x.shaping)) + '..' + Math.max(...p.map((x) => x.shaping))).padStart(7) + ' | ' +
    (Math.min(...p.map((x) => x.guideline)) + '..' + Math.max(...p.map((x) => x.guideline))).padStart(15)
  );
}

console.log('\n--- regles declenchees, tous scenarios confondus ---');
Object.entries(ruleTotals).sort((a, b) => b[1] - a[1])
  .forEach(([k, v]) => console.log('  ' + k.padEnd(24) + String(v).padStart(5) + '  (' + (v / (CONFIGS.length * N) * 100).toFixed(0) + '% des plans)'));
if (!Object.keys(ruleTotals).length) console.log('  aucune');

console.log('\n--- pieces non meublables selon le socle (fits) ---');
Object.entries(fitFail).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => console.log('  ' + k.padEnd(24) + String(v).padStart(5)));
if (!Object.keys(fitFail).length) console.log('  aucune');

const allSolved = rows.reduce((s, r) => s + r.per.reduce((a, x) => a + x.solved, 0), 0);
console.log('\n--- synthese ---');
console.log('  plans a score nul (objectif de recherche entierement satisfait) : ' + allSolved + '/' + (CONFIGS.length * N));
console.log('  ecart de surface max sur tout le banc : ' + Math.max(...rows.map((r) => r.worst)).toFixed(4) + ' m2');

/* Photographie M0 : uniquement des grandeurs déterministes. Les durées sont
   affichées plus haut mais volontairement exclues du témoin — elles dépendent
   de la machine, pas du moteur. */
const snapshot = {
  format: 'technohab-m0-benchmark-v1',
  configurations: CONFIGS.length,
  seeds: SEEDS.length,
  plans: CONFIGS.length * N,
  nonFoundPlans: rows.reduce((sum, row) => sum + row.per.reduce((n, item) => n + item.nonFound, 0), 0),
  hardPlans: rows.reduce((sum, row) => sum + row.per.reduce((n, item) => n + item.hard, 0), 0),
  debtPlans: rows.reduce((sum, row) => sum + row.per.reduce((n, item) => n + item.dette, 0), 0),
  missingAdjacencies: rows.reduce((sum, row) => sum + row.per.reduce((n, item) => n + item.manquantes, 0), 0),
  fitFailures: rows.reduce((sum, row) => sum + row.per.reduce((n, item) => n + item.fitFailures, 0), 0),
  nonRectRooms: rows.reduce((sum, row) => sum + row.per.reduce((n, item) => n + item.nonRectRooms, 0), 0),
  zeroScorePlans: allSolved,
  maxSurfaceError: Number(Math.max(...rows.map((r) => r.worst)).toFixed(4)),
  triggeredRules: Object.fromEntries(Object.entries(ruleTotals).sort(([a], [b]) => a.localeCompare(b))),
  signatures: Object.fromEntries(rows.map((row) => [row.label, row.sigs]))
};

const snapshotFlag = process.argv.indexOf('--snapshot');
if (snapshotFlag !== -1) console.log('\nM0_SNAPSHOT=' + JSON.stringify(snapshot, null, 2));

const checkFlag = process.argv.indexOf('--check');
if (checkFlag !== -1) {
  const referencePath = process.argv[checkFlag + 1];
  if (!referencePath) throw new Error('--check attend le chemin de la photographie M0.');
  const reference = JSON.parse(fs.readFileSync(referencePath, 'utf8'));
  if (JSON.stringify(snapshot) !== JSON.stringify(reference)) {
    console.error('\nPhotographie M0 différente. Actuel :\n' + JSON.stringify(snapshot, null, 2));
    process.exitCode = 1;
  } else {
    console.log('\nPhotographie M0 conforme à ' + referencePath + '.');
  }
}
