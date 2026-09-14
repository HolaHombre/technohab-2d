// Chantier 8 — d'où vient le dépassement de TH2D-CIRC-004.
//
// La règle plafonne la circulation à 10 % du plan ; `buildProgram()` lui en
// alloue davantage sur 22 configurations sur 23. Avant de trancher, il faut
// savoir ce que devient réellement cette surface entre l'allocation et le
// plan fini — la cession de `carveCirculation()` est censée en rendre une
// partie aux pièces longées.
//
// Quatre grandeurs par configuration :
//   minimum   ce que la desserte exige : 1,20 m × (pièces desservies) × 0,95
//   alloue    ce que buildProgram() accorde (targetArea)
//   final     ce qu'il reste après cession, et c'est ce que la règle mesure
//   seuil     10 % de la surface du plan
//
//   node scripts/diagnostic-circulation.mjs
import fs from 'fs';
import vm from 'vm';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const A = join(dirname(fileURLToPath(import.meta.url)), '..', 'assets');
for (const f of ['fit.data.js', 'contracts.js', 'construction.js', 'typologie.js', 'squelette.js', 'generator.js', 'rules.js']) {
  vm.runInThisContext(fs.readFileSync(join(A, f), 'utf8'));
}
const G = globalThis.TechnoHabGenerator;

const GRAINE = 20260818;
const N = 30;
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
const graineDe = (i, v) => (Math.imul(GRAINE ^ (i * 0x9E3779B1), 0x85EBCA6B) + v * 0x27D4EB2F) >>> 0;

console.log('config           pieces | minimum | alloue | final moy | seuil 10% | > seuil | final/min');
console.log('-'.repeat(98));

let totalPlans = 0, totalDepasse = 0, totalAuMinimum = 0;
const ratios = [];

CONFIGS.forEach((c, i) => {
  const opts = {
    surface: c[0], bedrooms: c[1], bathrooms: c[2],
    separateKitchen: c[3], includeWc: c[4], priority: c[5], shape: 'rectangle'
  };
  const prog = G.buildProgram(opts);
  const modele = prog.rooms.find((r) => r.id === 'circulation');
  if (!modele) return;

  let sommeFinale = 0, depasse = 0, auMinimum = 0;
  for (let v = 0; v < N; v += 1) {
    const plan = G.generatePlan(opts, v, graineDe(i, v));
    const circ = plan.rooms.filter((r) => r.type === 'circulation')
      .reduce((s, r) => s + r.area, 0);
    sommeFinale += circ;
    totalPlans += 1;
    if (circ > plan.boundary.area * 0.10 + 0.000001) { depasse += 1; totalDepasse += 1; }
    // « Au minimum » : la cession a rendu tout ce qu'elle pouvait rendre, la
    // circulation est retombée à ce que la desserte exige, à 5 % près.
    if (circ <= modele.minArea * 1.05) { auMinimum += 1; totalAuMinimum += 1; }
    ratios.push(circ / modele.minArea);
  }
  const moyenne = sommeFinale / N;
  console.log(
    (c[0] + 'm² ' + c[1] + 'ch').padEnd(16) +
    String(prog.rooms.length).padStart(6) + ' | ' +
    modele.minArea.toFixed(2).padStart(7) + ' | ' +
    modele.targetArea.toFixed(2).padStart(6) + ' | ' +
    moyenne.toFixed(2).padStart(9) + ' | ' +
    (c[0] * 0.10).toFixed(2).padStart(9) + ' | ' +
    (depasse + '/' + N).padStart(7) + ' | ' +
    (moyenne / modele.minArea).toFixed(2).padStart(9)
  );
});

ratios.sort((a, b) => a - b);
const quantile = (q) => ratios[Math.min(ratios.length - 1, Math.floor(ratios.length * q))];
const mediane = quantile(0.5);
console.log('\n--- lecture ---');
console.log('plans dont la circulation depasse 10 % : ' + totalDepasse + '/' + totalPlans +
  ' (' + (totalDepasse / totalPlans * 100).toFixed(1) + ' %)');
console.log('plans dont la circulation est retombee au minimum de desserte : ' + totalAuMinimum +
  '/' + totalPlans + ' (' + (totalAuMinimum / totalPlans * 100).toFixed(1) + ' %)');
console.log('rapport circulation finale / minimum de desserte : mediane ' + mediane.toFixed(2) +
  ', min ' + ratios[0].toFixed(2) + ', max ' + ratios[ratios.length - 1].toFixed(2));
// Les quantiles hauts sont ce qui sert à calibrer un plafond relatif : un
// seuil placé au 90e laisse passer neuf plans sur dix et n'attrape que la
// queue. C'est la seule façon non arbitraire de choisir `k` (§5 de
// DOCTRINE_CIRCULATION.md).
console.log('quantiles du rapport : q75 ' + quantile(0.75).toFixed(2) +
  ' | q90 ' + quantile(0.90).toFixed(2) +
  ' | q95 ' + quantile(0.95).toFixed(2) +
  ' | q99 ' + quantile(0.99).toFixed(2));
