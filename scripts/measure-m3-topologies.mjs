/* Banc M3 — sélection des stratégies et tenue du graphe obligatoire.

   node scripts/measure-m3-topologies.mjs
   node scripts/measure-m3-topologies.mjs --check scripts/references/M3_TOPOLOGIES_REFERENCE.json
*/
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
for (const file of ['fit.data.js', 'contracts.js', 'construction.js', 'typologie.js', 'squelette.js', 'placement.js', 'generator.js', 'rules.js']) {
  vm.runInThisContext(fs.readFileSync(join(root, 'assets', file), 'utf8'));
}
/* Photographie M3 : une seule pose canonique. M4a possède son propre témoin
   métamorphique et ne doit pas réécrire rétroactivement la sélection M3. */
globalThis.TechnoHabSquelette.transformations = (pose) => [Object.assign({}, pose, {
  transformation: 'r0', equivalenceClass: 'witness-m3-r0'
})];
globalThis.TechnoHabAblations = {
  disableM4a2FacadeCost: true,
  disableM4a2InteriorTerminations: true,
  disableM5BranchUtility: true
};
const G = globalThis.TechnoHabGenerator;
const R = globalThis.TechnoHabRules;
const surfaces = [90, 130, 180, 250];
const seedsPerSurface = 12;
const round = (value, digits = 2) => Number(value.toFixed(digits));

const rows = surfaces.map((surface) => {
  const strategies = {};
  const families = {};
  let hardPlans = 0;
  let mandatoryMisses = 0;
  let branches = 0;
  let candidates = 0;
  for (let variant = 0; variant < seedsPerSurface; variant += 1) {
    const options = {
      surface,
      bedrooms: surface < 120 ? 3 : surface < 160 ? 4 : 5,
      bathrooms: surface >= 130 ? 2 : 1,
      separateKitchen: variant % 2 === 0,
      includeWc: true,
      priority: ['compact', 'light', 'economy'][variant % 3],
      shape: 'rectangle'
    };
    const seed = (20260828 + Math.imul(surface, 0x9E3779B1) + variant) >>> 0;
    const plan = G.generatePlan(options, variant, seed);
    const report = R.evaluatePlan(plan);
    strategies[plan.topologyStrategy] = (strategies[plan.topologyStrategy] || 0) + 1;
    families[plan.topologyFamily] = (families[plan.topologyFamily] || 0) + 1;
    branches += plan.topologyBranches;
    candidates += plan.topologyCandidatesCompared;
    if (report.summary.hard) hardPlans += 1;
    mandatoryMisses += report.violations.filter((item) => item.ruleId === 'TH2D-ADJ-001').length;
  }
  return {
    surface,
    plans: seedsPerSurface,
    strategies,
    families,
    hardPlans,
    mandatoryMisses,
    branchMean: round(branches / seedsPerSurface),
    candidatesComparedMean: round(candidates / seedsPerSurface)
  };
});

const large = rows.filter((row) => row.surface >= 180);
const result = {
  measuredAt: '2026-08-28',
  method: {
    selection: '48 fixed plans, 4 surfaces × 12 seeds',
    note: 'Photographie moteur ; les cinq producteurs sont testés isolément par test-m3-topologies.mjs.'
  },
  totals: {
    plans: rows.reduce((sum, row) => sum + row.plans, 0),
    hardPlans: rows.reduce((sum, row) => sum + row.hardPlans, 0),
    mandatoryMisses: rows.reduce((sum, row) => sum + row.mandatoryMisses, 0),
    tFamilyOnLargePrograms: large.reduce((sum, row) => sum + (row.families.T || 0), 0),
    selectedStrategies: Array.from(new Set(rows.flatMap((row) => Object.keys(row.strategies)))).sort()
  },
  rows
};

assert.equal(result.totals.mandatoryMisses, 0,
  'M3 ne peut publier un candidat qui manque une relation obligatoire');
assert.ok(result.totals.tFamilyOnLargePrograms > 0,
  'la famille T doit pouvoir gagner sur les grands programmes sans bonus de stratégie');

const checkIndex = process.argv.indexOf('--check');
if (checkIndex >= 0) {
  const referencePath = process.argv[checkIndex + 1];
  if (!referencePath) throw new Error('--check attend un chemin de référence');
  assert.deepEqual(result, JSON.parse(fs.readFileSync(referencePath, 'utf8')),
    'le banc M3 diverge de sa photographie');
  console.log('Banc M3 conforme : ' + result.totals.plans + ' plans, graphe obligatoire tenu.');
} else {
  console.log(JSON.stringify(result, null, 2));
}
