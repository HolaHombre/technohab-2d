// PROTOTYPE — diversité et conformité de la double distribution.
// Deux circulations au programme, patch en mémoire (voir essai-typologie.mjs).
//   node technohab/scripts/proto/mesure-bi.mjs
import fs from 'fs';
import vm from 'vm';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { couloirsDesservants, viser } from './typologie2.mjs';

const A = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'assets');
const lire = (f) => fs.readFileSync(join(A, f), 'utf8');

const ANCRE_CREATION = `      var corridor = createRoom('circulation');
      corridor.minArea = round(Math.max(corridor.minArea, MIN_CIRCULATION_WIDTH * served * 0.95), 2);
      corridor.weight = round(corridor.weight + served * 0.22, 2);
      corridor.serves = served;
      rooms.push(corridor);`;
const PATCH_CREATION = `      for (var ic = 0; ic < 2; ic += 1) {
        var corridor = createRoom('circulation');
        corridor.id = 'circulation_' + (ic + 1); corridor.label = 'Circulation ' + (ic + 1);
        corridor.minArea = round(Math.max(corridor.minArea, MIN_CIRCULATION_WIDTH * (served / 2) * 0.95), 2);
        corridor.weight = round(corridor.weight + (served / 2) * 0.22, 2);
        corridor.serves = served / 2;
        rooms.push(corridor);
      }`;
const ANCRE_EDGES = `      desiredEdges.push({ a: 'living', b: circulations[0].id, kind: 'opening' });`;
const PATCH_EDGES = `      circulations.forEach(function (c) { desiredEdges.push({ a: 'living', b: c.id, kind: 'opening' }); });
      var aD = allocated.filter(function (r) { return r.type !== 'circulation' && r.type !== 'living' && r.type !== 'kitchen'; })
        .slice().sort(function (a, b) { return b.targetArea - a.targetArea; });
      var ch = circulations.map(function () { return 0; });
      var gr = circulations.map(function () { return []; });
      aD.forEach(function (r) {
        var m = 0; for (var k = 1; k < ch.length; k += 1) if (ch[k] < ch[m]) m = k;
        gr[m].push(r); ch[m] += r.targetArea;
      });
      gr.forEach(function (g, k) {
        g.forEach(function (r) { desiredEdges.push({ a: circulations[k].id, b: r.id, kind: 'opening' }); });
      });
      if (false)`;

for (const f of ['fit.data.js', 'construction.js', 'typologie.js', 'squelette.js']) vm.runInThisContext(lire(f));
let src = lire('generator.js');
for (const [nom, ancre] of [['création', ANCRE_CREATION], ['arêtes', ANCRE_EDGES]]) {
  if (!src.includes(ancre)) { console.error(`Ancre « ${nom} » introuvable.`); process.exit(1); }
}
vm.runInThisContext(src.replace(ANCRE_CREATION, PATCH_CREATION).replace(ANCRE_EDGES, PATCH_EDGES));
vm.runInThisContext(lire('rules.js'));
const G = globalThis.TechnoHabGenerator, R = globalThis.TechnoHabRules;

const CONFIGS = [
  [65, 2, 1, false, false], [75, 2, 1, false, true], [90, 3, 1, false, true],
  [100, 3, 2, true, true], [120, 4, 2, true, true], [150, 5, 2, true, true],
  [180, 5, 2, true, true], [250, 5, 2, true, true]
];
const N = 30;

console.log('Couloirs NON traversants — deux circulations, 30 graines par programme.\n');
console.log('programme     | signatures/30 | adjacences | sans HARD | couloirs | regles');
console.log('-'.repeat(88));

let totalDues = 0, totalFaites = 0, totalSansHard = 0, totalPlans = 0;
for (const c of CONFIGS) {
  const opts = { surface: c[0], bedrooms: c[1], bathrooms: c[2], separateKitchen: c[3], includeWc: c[4], priority: 'compact' };
  const prog = G.buildProgram(opts);
  const nbCouloirs = prog.rooms.filter((r) => r.type === 'circulation').length;
  const sigs = new Set();
  const regles = new Map();
  let dues = 0, faites = 0, sansHard = 0, ok = 0, refus = 0;

  for (let v = 0; v < N; v += 1) {
    const graine = (Math.imul(20260821 ^ (c[0] * 0x9E3779B1), 0x85EBCA6B) + v * 0x27D4EB2F) >>> 0;
    const r = viser(prog, (p, cible) => couloirsDesservants(p, cible, graine), c[0],
      (pieces) => G.assemblerPlan(opts, pieces, { shape: 'rectangle', source: 'proto-bi' }));
    if (!r.plan) { refus += 1; continue; }
    ok += 1; totalPlans += 1;
    const plan = r.plan, seuil = plan.minDesserte || 1.0;
    dues += plan.requestedEdges.length;
    faites += plan.requestedEdges.filter((e) => plan.edges.some((x) =>
      ((x.a === e.a && x.b === e.b) || (x.a === e.b && x.b === e.a)) && (x.contact || 0) >= seuil)).length;
    const rep = R.evaluatePlan(plan);
    if (!rep.summary.hard) { sansHard += 1; totalSansHard += 1; }
    rep.violations.forEach((x) => regles.set(x.ruleId, (regles.get(x.ruleId) || 0) + 1));
    sigs.add(plan.rooms.map((r2) => r2.id + ':' + r2.x0.toFixed(1) + ',' + r2.y0.toFixed(1)).sort().join('|'));
  }
  totalDues += dues; totalFaites += faites;
  const tri = [...regles.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3)
    .map(([r, n]) => r.replace('TH2D-', '') + '×' + n).join(' ');
  console.log(
    (c[0] + 'm² ' + c[1] + 'ch').padEnd(14) + '| ' + String(sigs.size).padStart(13) + ' | ' +
    ((dues ? (faites / dues * 100).toFixed(1) : '—') + ' %').padStart(10) + ' | ' +
    (sansHard + '/' + ok).padStart(9) + ' | ' + String(nbCouloirs).padStart(8) + ' | ' + tri +
    (refus ? '  (' + refus + ' refus)' : ''));
}

console.log('\n--- ensemble ---');
console.log('adjacences realisees : ' + (totalFaites / totalDues * 100).toFixed(1) + ' %');
console.log('plans sans violation bloquante : ' + totalSansHard + '/' + totalPlans);
