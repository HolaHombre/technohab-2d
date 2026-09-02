/* Banc M3.0 — part de circulation, proxy de branches et longueurs du calque.

   La sélection est rejouée sur 84 plans fixes. Le JSON publié ne pose aucun
   seuil doctrinal : il photographie des résultats du moteur, pas des normes.

   node scripts/measure-m3-circulation.mjs
   node scripts/measure-m3-circulation.mjs --check scripts/references/M3_CIRCULATION_REFERENCE.json
*/
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const files = ['fit.data.js', 'contracts.js', 'construction.js', 'typologie.js', 'squelette.js', 'placement.js', 'generator.js', 'rules.js'];
function engine(lengthWeight) {
  const context = vm.createContext({ console });
  for (const file of files) {
    let source = fs.readFileSync(join(root, 'assets', file), 'utf8');
    if (file === 'generator.js') {
      /* Cette ablation attribue un mouvement au seul poids M3.0. Laisser S4
         filtrer les topologies de la branche neutralisée comparerait deux
         populations différentes et ferait payer des recherches épuisées. */
      source = source.replaceAll('s4: true', 's4: false')
        .replace("passes: false, method: 'chamfer-grid-v1'", "passes: true, method: 'chamfer-grid-v1'");
      if (lengthWeight !== 30) {
        const marker = 'var CIRCULATION_LENGTH_WEIGHT = 30;';
        assert.ok(source.includes(marker), 'le banc doit neutraliser le poids déclaré par le moteur');
        source = source.replace(marker, 'var CIRCULATION_LENGTH_WEIGHT = ' + lengthWeight + ';');
      }
    }
    vm.runInContext(source, context);
  }
  vm.runInContext("TechnoHabSquelette.transformations = function (pose) { return [Object.assign({}, pose, { transformation: 'r0', equivalenceClass: 'witness-m3-r0' })]; };", context);
  vm.runInContext("TechnoHabAblations = { disableM4a2FacadeCost: true, disableM4a2InteriorTerminations: true, disableM5BranchUtility: true };", context);
  return context.TechnoHabGenerator;
}
const surfaces = [45, 60, 75, 90, 130, 180, 250];
const seedsPerSurface = 3;
const round = (value, digits = 3) => Number(value.toFixed(digits));
function measure(G) {
  const rows = [];
  for (const surface of surfaces) {
    const values = [];
    let nonFound = 0;
    for (let variant = 0; variant < seedsPerSurface; variant += 1) {
      const bedrooms = surface < 55 ? 1 : surface < 75 ? 2 : surface < 120 ? 3 : surface < 160 ? 4 : 5;
      const options = {
        surface, bedrooms, bathrooms: surface >= 100 ? 2 : 1,
        separateKitchen: surface % 2 === 0, includeWc: true,
        priority: ['compact', 'light', 'economy'][variant % 3], shape: 'rectangle'
      };
      const seed = (20260827 + Math.imul(surface, 0x9E3779B1) + variant) >>> 0;
      let plan;
      try {
        plan = G.generatePlan(options, variant, seed);
      } catch (error) {
        if (!error || error.code !== 'NON_TROUVE') throw error;
        nonFound += 1;
        continue;
      }
      assert.ok(plan.circulationObjective && plan.parcours && plan.parcours.desserte,
        'chaque plan du banc doit publier les deux métriques M3.0');
      values.push({
        share: plan.circulationObjective.share,
        length: plan.circulationObjective.length,
        scoringLength: plan.circulationObjective.scoringLength,
        metersPerService: plan.circulationObjective.metersPerRequestedService,
        pathMean: plan.parcours.desserte.mean,
        pathMax: plan.parcours.desserte.max
      });
    }
    const mean = (key) => values.reduce((sum, value) => sum + value[key], 0) / values.length;
    const max = (key) => Math.max(...values.map((value) => value[key]));
    rows.push({
      surface,
      plans: values.length,
      nonFound,
      circulationShareMean: round(mean('share') * 100, 2),
      circulationShareMax: round(max('share') * 100, 2),
      branchLengthMean: round(mean('length'), 2),
      branchLengthMax: round(max('length'), 2),
      scoringLengthMean: round(mean('scoringLength'), 2),
      scoringLengthMax: round(max('scoringLength'), 2),
      metersPerServiceMean: round(mean('metersPerService'), 3),
      pathMean: round(mean('pathMean'), 2),
      pathMax: round(max('pathMax'), 2)
    });
  }
  return rows;
}

const rows = measure(engine(30));

const result = {
  measuredAt: '2026-08-29',
  method: {
    selection: '21 fixed attempts, 7 surfaces × 3 seeds; S4 neutralized to isolate M3.0',
    branchProxy: 'branch-service-span-v2',
    path: 'grid-shortest-path-v1',
    note: 'Mesure moteur active, sans valeur normative. L’ablation poids zéro de M3.0 est archivée : sans budget de recherche elle ne fait plus partie de la porte M4.'
  },
  totals: {
    plans: rows.reduce((sum, row) => sum + row.plans, 0),
    nonFound: rows.reduce((sum, row) => sum + row.nonFound, 0),
    worstCirculationShare: Math.max(...rows.map((row) => row.circulationShareMax)),
    worstBranchLength: Math.max(...rows.map((row) => row.branchLengthMax)),
    worstScoringLength: Math.max(...rows.map((row) => row.scoringLengthMax)),
    worstPathLength: Math.max(...rows.map((row) => row.pathMax))
  },
  rows
};

const checkIndex = process.argv.indexOf('--check');
if (checkIndex >= 0) {
  const referencePath = process.argv[checkIndex + 1];
  if (!referencePath) throw new Error('--check attend un chemin de référence');
  const expected = JSON.parse(fs.readFileSync(referencePath, 'utf8'));
  assert.deepEqual(result, expected, 'le banc M3.0 diverge de sa photographie');
  console.log('Banc M3.0 conforme : ' + result.totals.plans + ' plans.');
} else {
  console.log(JSON.stringify(result, null, 2));
}
