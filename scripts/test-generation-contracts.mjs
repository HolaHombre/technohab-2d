/* M1 — frontières nommées et statuts d'échec honnêtes. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
['canonical-values.data.js', 'canonical-values.js', 'fit.data.js', 'placement.js', 'contracts.js', 'construction.js', 'typologie.js', 'squelette.js', 'generator.js', 'rules.js']
  .forEach((file) => new Function(readFileSync(join(root, 'assets', file), 'utf8'))());

const generator = globalThis.TechnoHabGenerator;
const contracts = globalThis.TechnoHabContracts;
const manifest = JSON.parse(readFileSync(join(root, 'GENERATION_CONTRACTS.json'), 'utf8'));
const base = {
  surface: 75, bedrooms: 2, bathrooms: 1,
  separateKitchen: false, includeWc: true, shape: 'rectangle'
};

assert.equal(contracts.version, manifest.contractVersion);
assert.deepEqual(Object.values(contracts.statuses), manifest.statuses);
assert.deepEqual(Object.values(contracts.resolutionStatuses), manifest.resolutionStatuses);
assert.deepEqual(contracts.resolutionLevels, manifest.resolutionLevels);
assert.deepEqual(contracts.changeSeverities, manifest.changeSeverities);

/* 1. Le chemin nominal transporte les six contrats ---------------------- */

const valid = generator.generateResult(base, 1, 505001);
assert.equal(valid.status, 'VALID');
assert.equal(valid.intent.kind, 'Intent');
assert.equal(valid.program.kind, 'Program');
assert.equal(valid.topologyCandidate.kind, 'TopologyCandidate');
assert.equal(valid.builtPlan.kind, 'BuiltPlan');
assert.equal(valid.verdict.kind, 'Verdict');
assert.equal(valid.kind, 'GenerationResult');
assert.equal(valid.failure, null);
assert.ok(Object.isFrozen(valid), 'GenerationResult est un relevé, pas un état mutable');
assert.ok(valid.builtPlan.plan.profiles.length > 0, 'le plan porte les profils qui ont participé');
assert.ok(valid.builtPlan.plan.profiles.every((profile) => /^C[0-6]$/.test(profile.maturity)));
assert.equal(valid.builtPlan.maturity, 'C2');
assert.equal(valid.builtPlan.plan.profileMaturity, valid.builtPlan.maturity,
  'le plan prend la maturité de son profil le plus faible');
assert.ok(valid.program.profiles.every((profile) => profile.version && profile.source));
assert.equal(valid.program.canonicalValueSchemaVersion, '1.0');
assert.ok(valid.program.canonicalValues.length > 0, 'le programme expose les valeurs canoniques des profils pilotes');
assert.deepEqual(valid.program.canonicalValues, valid.builtPlan.canonicalValues);
assert.deepEqual(valid.builtPlan.plan.canonicalValues, valid.builtPlan.canonicalValues);
assert.ok(valid.builtPlan.canonicalValues.every((reference) => reference.id && reference.version));
assert.ok(['barre', 'l', 'coude', 't', 'hall', 'jour-nuit', 'typologie']
  .includes(valid.topologyCandidate.strategy));
assert.ok(valid.topologyCandidate.family);
assert.ok(Number.isInteger(valid.topologyCandidate.branches));
assert.ok(valid.topologyCandidate.candidatesCompared >= 1);
assert.ok(valid.topologyCandidate.strategiesCompared.length >= 1);
assert.equal(contracts.profiles.wc.maturity, 'C4');
assert.equal(contracts.profiles.bath_wc.maturity, 'C4');

const selection = generator.generateSelection(base, 1, 505001, 3);
assert.equal(selection.kind, 'PlanSelection');
assert.equal(selection.status, 'COMPLETE');
assert.equal(selection.results.length, 3);

const resolution = contracts.programResolution({
  status: 'EXACT',
  requestedIntent: valid.intent,
  requestedProgram: valid.program,
  resolvedIntent: valid.intent,
  resolvedProgram: valid.program,
  level: 'R0_EXACT',
  changes: [],
  attempts: [{
    level: 'R0_EXACT', variant: valid.intent.variant, seed: valid.intent.seed,
    status: valid.status, failureCode: null
  }],
  result: valid
});
assert.equal(resolution.kind, 'ProgramResolution');
assert.ok(Object.isFrozen(resolution.attempts[0]));
const resolvedSelection = contracts.resolvedSelection({
  resolution,
  selection,
  reusedResult: true,
  generatedAttempts: selection.attempts - 1
});
assert.equal(resolvedSelection.kind, 'ResolvedSelection');

for (const [kind, definition] of Object.entries(manifest.contracts)) {
  const value = kind === 'GenerationResult' ? valid
    : kind === 'PlanSelection' ? selection
    : kind === 'ProgramResolution' ? resolution
    : kind === 'ResolvedSelection' ? resolvedSelection
    : valid[kind.charAt(0).toLowerCase() + kind.slice(1)];
  assert.ok(value, kind + ' doit être présent dans le résultat nominal');
  definition.required.forEach((key) => assert.ok(Object.prototype.hasOwnProperty.call(value, key),
    kind + '.' + key + ' est requis par le manifeste'));
}

/* 2. Impossible est prouvé avant la recherche --------------------------- */

const impossible = generator.generateResult({
  surface: 35, bedrooms: 5, bathrooms: 2,
  separateKitchen: true, includeWc: true
}, 1, 42, {
  generatePlan: () => { throw new Error('ne doit pas être appelé'); }
});
assert.equal(impossible.status, 'IMPOSSIBLE');
assert.equal(impossible.failure.code, 'MINIMUM_AREA_EXCEEDS_INTENT');
assert.equal(impossible.builtPlan, null);
assert.ok(impossible.failure.details.minimumArea > impossible.failure.details.maximumAllowedArea);

/* 3. Possible mais non trouvé reste distinct ---------------------------- */

const exhaustedError = new Error('stratégies épuisées');
exhaustedError.code = 'NON_TROUVE';
const notFound = generator.generateResult(base, 1, 43, {
  generatePlan: () => { throw exhaustedError; }
});
assert.equal(notFound.status, 'NON_TROUVE');
assert.equal(notFound.failure.stage, 'topology');
assert.equal(notFound.builtPlan, null);

/* 4. Une panne et un verdict HARD ne deviennent jamais NON_TROUVE ------- */

const crashed = generator.generateResult(base, 1, 44, {
  generatePlan: () => { throw new TypeError('défaut interne'); }
});
assert.equal(crashed.status, 'INVALIDE_DEBUG');
assert.equal(crashed.failure.code, 'GENERATION_FAILED');

const hard = generator.generateResult(base, 1, 505001, {
  evaluate: () => ({ summary: { hard: 1, guideline: 0 }, violations: [{ ruleId: 'TEST-HARD' }], limites: [] })
});
assert.equal(hard.status, 'INVALIDE_DEBUG');
assert.equal(hard.failure.code, 'HARD_VIOLATION');
assert.ok(hard.builtPlan, 'le plan invalide reste disponible uniquement pour le diagnostic');
assert.equal(hard.verdict.valid, false);

console.log('Contrats M1/M5.2 : 9 objets versionnés · résolution et sélection réemployée vérifiées.');
