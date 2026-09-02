/* M5.2f — mesure versionnée de la résolution graduée.

   Le banc force des programmes domestiques volontairement comprimés et garde
   deux témoins exacts. Quatre demandes représentatives appellent ensuite
   resolveSelection() en réemployant la résolution déjà payée, comme dans le
   contrat produit. Les durées caractérisent la machine mais restent exclues
   de la référence.

   Usage :
     node scripts/measure-program-resolution.mjs
     node scripts/measure-program-resolution.mjs --snapshot
     node scripts/measure-program-resolution.mjs --check scripts/references/M5_2_RESOLUTION_REFERENCE.json
*/
import fs from 'node:fs';
import vm from 'node:vm';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const assetNames = [
  'canonical-values.data.js', 'canonical-values.js', 'fit.data.js',
  'placement.js', 'contracts.js', 'relaxation.data.js', 'relaxation.js',
  'construction.js', 'typologie.js', 'squelette.js', 'generator.js',
  'socle.data.js', 'room-model.js', 'rules.js'
];
for (const name of assetNames) {
  vm.runInThisContext(fs.readFileSync(join(root, 'assets', name), 'utf8'), { filename: name });
}

const generator = globalThis.TechnoHabGenerator;
const rules = globalThis.TechnoHabRules;

const CONFIGURATIONS = [
  { id: 'C35-1-2', group: 'compressed', surface: 35, bedrooms: 1, bathrooms: 2 },
  { id: 'C40-1-2', group: 'compressed', surface: 40, bedrooms: 1, bathrooms: 2 },
  { id: 'C45-2-2', group: 'compressed', surface: 45, bedrooms: 2, bathrooms: 2 },
  { id: 'C50-2-2', group: 'compressed', surface: 50, bedrooms: 2, bathrooms: 2 },
  { id: 'C55-3-2', group: 'compressed', surface: 55, bedrooms: 3, bathrooms: 2 },
  { id: 'C60-3-2', group: 'compressed', surface: 60, bedrooms: 3, bathrooms: 2 },
  { id: 'C70-4-2', group: 'compressed', surface: 70, bedrooms: 4, bathrooms: 2 },
  { id: 'C85-5-2', group: 'compressed', surface: 85, bedrooms: 5, bathrooms: 2 },
  {
    id: 'E75-2-1', group: 'exact-control', surface: 75, bedrooms: 2, bathrooms: 1,
    separateKitchen: false, includeWc: true
  },
  {
    id: 'E90-3-1', group: 'exact-control', surface: 90, bedrooms: 3, bathrooms: 1,
    separateKitchen: false, includeWc: true
  }
];
const SEEDS = [0x5EED5201, 0x5EED5202, 0x5EED5203].map((seed) => seed >>> 0);
const SELECTION_CONFIGURATIONS = new Set(['C35-1-2', 'C45-2-2', 'C85-5-2', 'E75-2-1']);

const round = (value, digits = 2) => Number(value.toFixed(digits));
const sum = (values) => values.reduce((total, value) => total + value, 0);
const mean = (values) => values.length ? sum(values) / values.length : 0;
const percentile = (values, ratio) => {
  if (!values.length) return 0;
  const sorted = values.slice().sort((left, right) => left - right);
  return sorted[Math.max(0, Math.ceil(sorted.length * ratio) - 1)];
};
const increment = (object, key, amount = 1) => {
  object[key] = (object[key] || 0) + amount;
};

const samples = [];
for (const configuration of CONFIGURATIONS) {
  for (const seed of SEEDS) {
    const options = {
      surface: configuration.surface,
      bedrooms: configuration.bedrooms,
      bathrooms: configuration.bathrooms,
      separateKitchen: configuration.separateKitchen !== undefined
        ? configuration.separateKitchen : true,
      includeWc: configuration.includeWc !== undefined ? configuration.includeWc : true,
      priority: 'compact',
      shape: 'rectangle'
    };
    const resolutionStarted = process.hrtime.bigint();
    const resolution = generator.resolveProgram(options, 1, seed);
    const resolutionMilliseconds = Number(process.hrtime.bigint() - resolutionStarted) / 1e6;
    const selectionMeasured = seed === SEEDS[0] && SELECTION_CONFIGURATIONS.has(configuration.id);
    const selectionStarted = process.hrtime.bigint();
    const resolvedSelection = selectionMeasured
      ? generator.resolveSelection(options, 1, seed, 3, { resolveProgram: () => resolution })
      : null;
    const selectionMilliseconds = selectionMeasured
      ? Number(process.hrtime.bigint() - selectionStarted) / 1e6 : 0;
    const selection = resolvedSelection ? resolvedSelection.selection : null;
    const relaxedAttempts = resolution.attempts.filter((attempt) => attempt.level !== 'R0_EXACT');
    const selectedResults = selection ? selection.results : [];
    const publishedResults = selection ? selectedResults : resolution.result ? [resolution.result] : [];
    const hardViolations = publishedResults.reduce((total, result) =>
      total + rules.evaluatePlan(result.builtPlan.plan).summary.hard, 0);

    samples.push({
      configuration: configuration.id,
      seed,
      status: resolution.status,
      level: resolution.level,
      attempts: resolution.attempts.length,
      relaxedAttempts: relaxedAttempts.length,
      relaxedNonFound: relaxedAttempts.filter((attempt) => attempt.status === 'NON_TROUVE').length,
      changes: resolution.changes.map((change) => ({
        field: change.field,
        from: change.from,
        to: change.to,
        severity: change.severity
      })),
      hardViolations,
      selectionMeasured,
      selectionStatus: selection ? selection.status : null,
      selectedPlans: selectedResults.length,
      selectionGeneratedAttempts: resolvedSelection ? resolvedSelection.generatedAttempts : 0,
      totalGenerationCalls: resolution.attempts.length +
        (resolvedSelection ? resolvedSelection.generatedAttempts : 0),
      signatures: selection ? selection.diversity.signatures : 0,
      families: selection ? selection.diversity.families.length : 0,
      strategies: selection ? selection.diversity.strategies.length : 0,
      resolutionMilliseconds: round(resolutionMilliseconds, 1),
      selectionMilliseconds: round(selectionMilliseconds, 1)
    });
    console.log('mesure ' + samples.length + '/' + (CONFIGURATIONS.length * SEEDS.length) +
      ' : ' + configuration.id + ' ' + seed.toString(16).toUpperCase() + ' → ' +
      resolution.status + (resolution.level ? ' ' + resolution.level : '') +
      ', ' + resolution.attempts.length + ' appels' + (selectionMeasured ? ', sélection mesurée' : ''));
  }
}

const statusCounts = {};
const levelCounts = {};
const changeFields = {};
const changeSeverities = {};
const selectionStatuses = {};
const selectionSamples = samples.filter((sample) => sample.selectionMeasured);
samples.forEach((sample) => {
  increment(statusCounts, sample.status);
  increment(levelCounts, sample.level || 'UNRESOLVED');
  if (sample.selectionMeasured) increment(selectionStatuses, sample.selectionStatus || 'NONE');
  sample.changes.forEach((change) => {
    increment(changeFields, change.field);
    increment(changeSeverities, change.severity);
  });
});

const resolutionCosts = samples.map((sample) => sample.attempts);
const selectionCosts = selectionSamples.map((sample) => sample.selectionGeneratedAttempts);
const combinedCosts = selectionSamples.map((sample) => sample.totalGenerationCalls);
const resolutionDurations = samples.map((sample) => sample.resolutionMilliseconds);
const selectionDurations = selectionSamples.map((sample) => sample.selectionMilliseconds);
const resolvedSamples = samples.filter((sample) => sample.status !== 'UNRESOLVED');
const relaxedSamples = samples.filter((sample) => sample.status === 'RELAXED');
const unresolvedAfterRelaxation = samples.filter((sample) =>
  sample.status === 'UNRESOLVED' && sample.relaxedAttempts > 0).length;
const byConfiguration = Object.fromEntries(CONFIGURATIONS.map((configuration) => {
  const configurationSamples = samples.filter((sample) => sample.configuration === configuration.id);
  const statuses = {};
  const levels = {};
  const fields = {};
  configurationSamples.forEach((sample) => {
    increment(statuses, sample.status);
    increment(levels, sample.level || 'UNRESOLVED');
    sample.changes.forEach((change) => increment(fields, change.field));
  });
  return [configuration.id, {
    group: configuration.group,
    statuses,
    levels,
    attempts: configurationSamples.map((sample) => sample.attempts),
    changeFields: fields
  }];
}));

const snapshot = {
  format: 'technohab-m5.2-resolution-v1',
  configurations: CONFIGURATIONS.length,
  compressedConfigurations: CONFIGURATIONS.filter((configuration) =>
    configuration.group === 'compressed').length,
  exactControls: CONFIGURATIONS.filter((configuration) =>
    configuration.group === 'exact-control').length,
  seeds: SEEDS.length,
  requests: samples.length,
  statusCounts,
  levelCounts,
  coveragePercent: round(100 * resolvedSamples.length / samples.length, 1),
  relaxedCoveragePercent: round(100 * relaxedSamples.length / samples.length, 1),
  changeFields,
  changeSeverities,
  resolutionAttempts: {
    mean: round(mean(resolutionCosts), 2),
    p90: percentile(resolutionCosts, 0.9),
    max: Math.max(...resolutionCosts)
  },
  relaxedNonFoundAttempts: sum(samples.map((sample) => sample.relaxedNonFound)),
  unresolvedAfterRelaxation,
  hardViolations: sum(samples.map((sample) => sample.hardViolations)),
  selection: {
    measuredRequests: selectionSamples.length,
    statuses: selectionStatuses,
    meanPlans: round(mean(selectionSamples.map((sample) => sample.selectedPlans)), 2),
    meanSignatures: round(mean(selectionSamples.map((sample) => sample.signatures)), 2),
    meanFamilies: round(mean(selectionSamples.map((sample) => sample.families)), 2),
    meanStrategies: round(mean(selectionSamples.map((sample) => sample.strategies)), 2),
    additionalCalls: {
      mean: round(mean(selectionCosts), 2),
      p90: percentile(selectionCosts, 0.9),
      max: Math.max(...selectionCosts)
    },
    combinedCalls: {
      mean: round(mean(combinedCosts), 2),
      p90: percentile(combinedCosts, 0.9),
      max: Math.max(...combinedCosts)
    }
  },
  byConfiguration
};

console.log('=== M5.2f — RÉSOLUTION GRADUÉE, BANC COMPRIMÉ + TÉMOINS EXACTS ===');
console.log(CONFIGURATIONS.length + ' configurations × ' + SEEDS.length + ' graines = ' + samples.length + ' demandes');
console.log('statuts     : ' + JSON.stringify(statusCounts));
console.log('niveaux     : ' + JSON.stringify(levelCounts));
console.log('couverture  : ' + resolvedSamples.length + '/' + samples.length + ' (' + snapshot.coveragePercent +
  ' %), dont ' + relaxedSamples.length + ' relaxées');
console.log('concessions : champs ' + JSON.stringify(changeFields) + ', sévérités ' + JSON.stringify(changeSeverities));
console.log('résolution  : ' + snapshot.resolutionAttempts.mean + ' appels en moyenne, p90 ' +
  snapshot.resolutionAttempts.p90 + ', max ' + snapshot.resolutionAttempts.max);
console.log('avec choix  : ' + snapshot.selection.combinedCalls.mean + ' appels en moyenne, p90 ' +
  snapshot.selection.combinedCalls.p90 + ', max ' + snapshot.selection.combinedCalls.max +
  ' sur ' + snapshot.selection.measuredRequests + ' demandes représentatives');
console.log('sélection   : ' + JSON.stringify(selectionStatuses) + ', ' + snapshot.selection.meanSignatures +
  ' signatures et ' + snapshot.selection.meanFamilies + ' familles en moyenne');
console.log('échecs      : ' + snapshot.relaxedNonFoundAttempts + ' tentatives relaxées NON_TROUVE, ' +
  unresolvedAfterRelaxation + ' demandes non résolues après repli, ' + snapshot.hardViolations + ' HARD publié');
console.log('durée       : résolution ' + round(mean(resolutionDurations), 1) + ' ms/demande, p90 ' +
  percentile(resolutionDurations, 0.9).toFixed(1) + ' ms ; sélection +' +
  round(mean(selectionDurations), 1) + ' ms/demande mesurée ; total ' +
  round((sum(resolutionDurations) + sum(selectionDurations)) / 1000, 1) + ' s (hors témoin)');

console.log('\nconfiguration | graine     | statut     | niveau             | rés. | total | plans | sig. | familles | ms');
console.log('-'.repeat(112));
samples.forEach((sample) => {
  console.log(
    sample.configuration.padEnd(13) + ' | ' +
    sample.seed.toString(16).toUpperCase().padStart(10, '0') + ' | ' +
    sample.status.padEnd(10) + ' | ' +
    String(sample.level || '—').padEnd(18) + ' | ' +
    String(sample.attempts).padStart(4) + ' | ' +
    String(sample.totalGenerationCalls).padStart(5) + ' | ' +
    String(sample.selectedPlans).padStart(5) + ' | ' +
    String(sample.signatures).padStart(4) + ' | ' +
    String(sample.families).padStart(8) + ' | ' +
    (sample.resolutionMilliseconds + sample.selectionMilliseconds).toFixed(1).padStart(7)
  );
});

if (process.argv.includes('--snapshot')) {
  console.log('\nM5_2_RESOLUTION_SNAPSHOT=' + JSON.stringify(snapshot, null, 2));
}

const checkIndex = process.argv.indexOf('--check');
if (checkIndex !== -1) {
  const referencePath = process.argv[checkIndex + 1];
  if (!referencePath) throw new Error('--check attend le chemin de la référence M5.2.');
  const reference = JSON.parse(fs.readFileSync(referencePath, 'utf8'));
  if (JSON.stringify(snapshot) !== JSON.stringify(reference)) {
    console.error('\nRéférence M5.2 différente. Actuel :\n' + JSON.stringify(snapshot, null, 2));
    process.exitCode = 1;
  } else {
    console.log('\nRéférence M5.2 conforme à ' + referencePath + '.');
  }
}
