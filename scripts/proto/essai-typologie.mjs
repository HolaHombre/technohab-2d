// PROTOTYPE — essai typologie, protocole APPROCHES_GENERATION.md §8.
//
// Compare, sur le même banc et les mêmes programmes :
//   témoin      le moteur actuel, générateur stochastique
//   mono        typologie couloir desservant, une circulation
//   bi          typologie double distribution, deux circulations
//
// Les critères et leur ordre ont été arrêtés AVANT le premier essai (§8) :
// adjacences réalisées, diversité, meublabilité, capacité à dire l'impossible,
// durée. Ils ne sont pas renégociés ici.
//
//   node technohab/scripts/proto/essai-typologie.mjs
import fs from 'fs';
import vm from 'vm';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

import { couloirDesservant, doubleDistribution, viser } from './typologie.mjs';

const A = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'assets');
const lire = (f) => fs.readFileSync(join(A, f), 'utf8');

/* --- Deux circulations au programme ----------------------------------------
   `buildProgram()` n'en crée qu'une, sans boucle ni drapeau. Le prototype la
   patche en mémoire — même méthode que l'ablation du peigne, ancres vérifiées
   avant usage pour qu'un remplacement raté ne passe pas pour un résultat.

   La répartition des dessertes entre les deux couloirs reprend exactement la
   règle de `deuxBandes()` : tri par aire décroissante, affectation au groupe
   le moins chargé. Les deux doivent coïncider, sans quoi le graphe demandé
   décrirait une desserte que la disposition ne réalise pas. */
const ANCRE_CREATION = `      var corridor = createRoom('circulation');
      corridor.minArea = round(Math.max(corridor.minArea, MIN_CIRCULATION_WIDTH * served * 0.95), 2);
      corridor.weight = round(corridor.weight + served * 0.22, 2);
      corridor.serves = served;
      rooms.push(corridor);`;
const ANCRE_EDGES = `      desiredEdges.push({ a: 'living', b: circulations[0].id, kind: 'opening' });`;

const PATCH_CREATION = `      var nbCouloirs = (typeof globalThis.__PROTO_COULOIRS === 'number') ? globalThis.__PROTO_COULOIRS : 1;
      for (var ic = 0; ic < nbCouloirs; ic += 1) {
        var corridor = createRoom('circulation');
        if (nbCouloirs > 1) { corridor.id = 'circulation_' + (ic + 1); corridor.label = 'Circulation ' + (ic + 1); }
        corridor.minArea = round(Math.max(corridor.minArea, MIN_CIRCULATION_WIDTH * (served / nbCouloirs) * 0.95), 2);
        corridor.weight = round(corridor.weight + (served / nbCouloirs) * 0.22, 2);
        corridor.serves = served / nbCouloirs;
        rooms.push(corridor);
      }`;

const PATCH_EDGES = `      circulations.forEach(function (c) { desiredEdges.push({ a: 'living', b: c.id, kind: 'opening' }); });
      var aDesservir = allocated.filter(function (r) {
        return r.type !== 'circulation' && r.type !== 'living' && r.type !== 'kitchen';
      }).slice().sort(function (a, b) { return b.targetArea - a.targetArea; });
      var charges = circulations.map(function () { return 0; });
      var groupes = circulations.map(function () { return []; });
      aDesservir.forEach(function (r) {
        var moins = 0;
        for (var k = 1; k < charges.length; k += 1) if (charges[k] < charges[moins]) moins = k;
        groupes[moins].push(r); charges[moins] += r.targetArea;
      });
      groupes.forEach(function (groupe, k) {
        groupe.forEach(function (r) { desiredEdges.push({ a: circulations[k].id, b: r.id, kind: 'opening' }); });
      });
      if (false)`;

function charger() {
  for (const f of ['fit.data.js', 'construction.js', 'typologie.js', 'squelette.js']) vm.runInThisContext(lire(f));
  let src = lire('generator.js');
  for (const [nom, ancre] of [['création', ANCRE_CREATION], ['arêtes', ANCRE_EDGES]]) {
    if (!src.includes(ancre)) {
      console.error(`Ancre « ${nom} » introuvable dans generator.js : le patch ne mesurerait rien.`);
      process.exit(1);
    }
  }
  src = src.replace(ANCRE_CREATION, PATCH_CREATION).replace(ANCRE_EDGES, PATCH_EDGES);
  vm.runInThisContext(src);
  vm.runInThisContext(lire('rules.js'));
  return { G: globalThis.TechnoHabGenerator, R: globalThis.TechnoHabRules };
}

const { G, R } = charger();

const CONFIGS = [
  [45, 1, 1, true, true, 'compact'], [55, 2, 1, false, true, 'compact'],
  [65, 2, 1, false, false, 'compact'], [75, 2, 1, false, true, 'compact'],
  [80, 3, 1, false, true, 'compact'], [90, 3, 1, false, true, 'light'],
  [100, 3, 2, true, true, 'compact'], [110, 3, 1, true, true, 'compact'],
  [120, 4, 2, true, true, 'compact'], [130, 4, 1, false, true, 'light'],
  [150, 5, 2, true, true, 'compact'], [180, 5, 2, true, true, 'light'],
  [220, 5, 2, true, true, 'compact'], [250, 5, 2, true, true, 'economy'],
];
const options = (c, shape) => ({
  surface: c[0], bedrooms: c[1], bathrooms: c[2],
  separateKitchen: c[3], includeWc: c[4], priority: c[5], shape
});
const graineDe = (i, v) => (Math.imul(20260821 ^ (i * 0x9E3779B1), 0x85EBCA6B) + v * 0x27D4EB2F) >>> 0;

function auditer(plan) {
  const seuil = plan.minDesserte || 1.0;
  const dues = plan.requestedEdges.length;
  const faites = plan.requestedEdges.filter((e) => plan.edges.some((r) =>
    ((r.a === e.a && r.b === e.b) || (r.a === e.b && r.b === e.a)) && (r.contact || 0) >= seuil)).length;
  const rapport = R.evaluatePlan(plan);
  return {
    dues, faites,
    hard: rapport.violations.filter((v) => v.level === 'HARD'),
    conseils: rapport.violations.filter((v) => v.level !== 'HARD'),
    signature: plan.rooms.map((r) => r.type + ':' + r.area.toFixed(1)).sort().join('|')
  };
}

const cumul = { temoin: neuf(), mono: neuf(), bi: neuf() };
function neuf() {
  return { plans: 0, dues: 0, faites: 0, hard: 0, planssansHard: 0, impossibles: 0, ms: 0, signatures: new Set(), regles: new Map() };
}
function verser(bilan, audit, ms) {
  bilan.plans += 1; bilan.dues += audit.dues; bilan.faites += audit.faites;
  bilan.hard += audit.hard.length; bilan.ms += ms;
  if (!audit.hard.length) bilan.planssansHard += 1;
  bilan.signatures.add(audit.signature);
  for (const v of [...audit.hard, ...audit.conseils]) {
    bilan.regles.set(v.ruleId, (bilan.regles.get(v.ruleId) || 0) + 1);
  }
}

console.log('Essai typologie — 14 programmes.\n');
console.log('programme      | temoin adj  HARD | mono adj  HARD | bi adj  HARD');
console.log('-'.repeat(74));

CONFIGS.forEach((c, i) => {
  const nom = `${c[0]}m² ${c[1]}ch${c[3] ? ' K' : ''}`;
  const ligne = [nom.padEnd(14)];

  // --- témoin : trois graines, on retient la meilleure conformité
  globalThis.__PROTO_COULOIRS = 1;
  let meilleur = null;
  for (let v = 0; v < 3; v += 1) {
    const t0 = process.hrtime.bigint();
    const plan = G.generatePlan(options(c, 'rectangle'), v, graineDe(i, v));
    const ms = Number(process.hrtime.bigint() - t0) / 1e6;
    const audit = auditer(plan);
    verser(cumul.temoin, audit, ms);
    if (!meilleur || audit.faites / audit.dues > meilleur.faites / meilleur.dues) meilleur = audit;
  }
  ligne.push(`| ${String(meilleur.faites + '/' + meilleur.dues).padStart(6)} ${String(meilleur.hard.length).padStart(4)}`);

  // --- typologie mono
  globalThis.__PROTO_COULOIRS = 1;
  {
    const opts = options(c, 'rectangle');
    const t0 = process.hrtime.bigint();
    const prog = G.buildProgram(opts);
    const r = viser(prog, (p, cible) => couloirDesservant(p, cible), c[0],
      (pieces) => G.assemblerPlan(opts, pieces, { shape: 'rectangle', source: 'proto-mono' }));
    const ms = Number(process.hrtime.bigint() - t0) / 1e6;
    if (r.plan) {
      const audit = auditer(r.plan);
      verser(cumul.mono, audit, ms);
      ligne.push(`| ${String(audit.faites + '/' + audit.dues).padStart(6)} ${String(audit.hard.length).padStart(4)}`);
    } else {
      cumul.mono.impossibles += 1;
      ligne.push(`| ${'refus'.padStart(6)} ${'—'.padStart(4)}`);
    }
  }

  // --- typologie bi : seulement là où un couloir sature (plus de 5 dessertes)
  globalThis.__PROTO_COULOIRS = 2;
  {
    const opts = options(c, 'rectangle');
    const t0 = process.hrtime.bigint();
    const prog = G.buildProgram(opts);
    const couloirs = prog.rooms.filter((r) => r.type === 'circulation').length;
    if (couloirs !== 2) {
      ligne.push(`| ${'s.o.'.padStart(6)} ${'—'.padStart(4)}`);
    } else {
      const r = viser(prog, (p, cible) => doubleDistribution(p, cible), c[0],
        (pieces) => G.assemblerPlan(opts, pieces, { shape: 'rectangle', source: 'proto-bi' }));
      const ms = Number(process.hrtime.bigint() - t0) / 1e6;
      if (r.plan) {
        const audit = auditer(r.plan);
        verser(cumul.bi, audit, ms);
        ligne.push(`| ${String(audit.faites + '/' + audit.dues).padStart(6)} ${String(audit.hard.length).padStart(4)}`);
      } else {
        cumul.bi.impossibles += 1;
        ligne.push(`| ${'refus'.padStart(6)} ${'—'.padStart(4)}`);
      }
    }
  }
  globalThis.__PROTO_COULOIRS = 1;
  console.log(ligne.join(' '));
});

console.log('\n--- bilan, critères du protocole §8 ---');
console.log('methode | plans | adjacences | plans sans HARD | signatures | refus motives | ms/plan');
console.log('-'.repeat(92));
for (const [nom, b] of Object.entries(cumul)) {
  if (!b.plans && !b.impossibles) continue;
  console.log(
    nom.padEnd(8) + '| ' + String(b.plans).padStart(5) + ' | ' +
    ((b.dues ? (b.faites / b.dues * 100).toFixed(1) : '—') + ' %').padStart(10) + ' | ' +
    (b.plans ? `${b.planssansHard}/${b.plans} (${(b.planssansHard / b.plans * 100).toFixed(0)} %)` : '—').padStart(15) + ' | ' +
    String(b.signatures.size).padStart(10) + ' | ' +
    String(b.impossibles).padStart(13) + ' | ' +
    (b.plans ? (b.ms / b.plans).toFixed(1) : '—').padStart(7)
  );
}

for (const [nom, b] of Object.entries(cumul)) {
  if (!b.plans) continue;
  const tri = [...b.regles.entries()].sort((x, y) => y[1] - x[1]);
  console.log(`\n${nom} — règles déclenchées : ` + (tri.length
    ? tri.map(([r, n]) => r.replace('TH2D-', '') + ' ×' + n).join(', ')
    : 'aucune'));
}
