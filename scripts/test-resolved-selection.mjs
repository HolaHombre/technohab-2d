/* M5.2d — sélection du programme résolu avec réemploi du premier VALID. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
['canonical-values.data.js', 'canonical-values.js', 'fit.data.js', 'placement.js',
  'contracts.js', 'relaxation.data.js', 'relaxation.js', 'construction.js',
  'typologie.js', 'squelette.js', 'generator.js', 'rules.js']
  .forEach((file) => new Function(readFileSync(join(root, 'assets', file), 'utf8'))());

const G = globalThis.TechnoHabGenerator;
const C = globalThis.TechnoHabContracts;

function validResult(options, variant, seed, index, score = index) {
  const rawProgram = G.buildProgram(options);
  const intent = C.intent(G.normalizeOptions(options), variant, seed);
  const program = C.program(rawProgram, C.profileManifest(rawProgram));
  const plan = {
    boundary: { width: 1, height: 1 },
    rooms: [],
    edges: [],
    score,
    topologyFamily: 'family-' + index,
    topologyStrategy: 'strategy-' + index,
    topologyEquivalenceClass: 'class-' + index
  };
  return C.generationResult({
    status: 'VALID', intent, program,
    builtPlan: C.builtPlan(plan, Object.freeze([])),
    verdict: C.verdict({ summary: { hard: 0, guideline: 0 }, violations: [], limites: [] }),
    failure: null
  });
}

function exactResolution(options, result) {
  return C.programResolution({
    status: 'EXACT',
    requestedIntent: C.intent(G.normalizeOptions(options), 1, 100),
    requestedProgram: result.program,
    resolvedIntent: result.intent,
    resolvedProgram: result.program,
    level: 'R0_EXACT',
    changes: [],
    attempts: [{ level: 'R0_EXACT', variant: 1, seed: 100, status: 'VALID', failureCode: null }],
    result
  });
}

const options = {
  surface: 75, bedrooms: 2, bathrooms: 1,
  separateKitchen: false, includeWc: true, shape: 'rectangle'
};
const first = validResult(options, 1, 100, 0, 0);
const resolution = exactResolution(options, first);
const generatedCalls = [];
const resolved = G.resolveSelection(options, 1, 100, 3, {
  resolveProgram: () => resolution,
  selectionGenerateResult(candidateOptions, variant, seed) {
    generatedCalls.push({ options: structuredClone(candidateOptions), variant, seed });
    return validResult(candidateOptions, variant, seed, generatedCalls.length, generatedCalls.length * 10);
  }
});

assert.equal(resolved.kind, 'ResolvedSelection');
assert.equal(resolved.resolution, resolution);
assert.equal(resolved.reusedResult, true);
assert.equal(resolved.generatedAttempts, 11);
assert.equal(resolved.selection.attempts, 12, 'le budget total M5 reste inchangé');
assert.equal(generatedCalls.length, 11, 'le premier VALID ne doit pas être repayé');
assert.ok(generatedCalls.every((call) => !(call.variant === first.intent.variant && call.seed === first.intent.seed)));
assert.equal(resolved.selection.status, 'COMPLETE');
assert.equal(resolved.selection.results[0], first, 'le résultat réemployé participe réellement au pool');
assert.ok(resolved.selection.results.every((result) =>
  JSON.stringify(result.program) === JSON.stringify(resolution.resolvedProgram)));

/* Une résolution relaxée alimente tous les appels avec le programme servi. */

const requestedOptions = { ...options, separateKitchen: true, includeWc: true };
const relaxedOptions = { ...options, separateKitchen: false, includeWc: false };
const relaxedFirst = validResult(relaxedOptions, 2, 200, 0, 0);
const requestedRaw = G.buildProgram(requestedOptions);
const relaxedResolution = C.programResolution({
  status: 'RELAXED',
  requestedIntent: C.intent(G.normalizeOptions(requestedOptions), 1, 100),
  requestedProgram: C.program(requestedRaw, C.profileManifest(requestedRaw)),
  resolvedIntent: relaxedFirst.intent,
  resolvedProgram: relaxedFirst.program,
  level: 'R1_FUSION',
  changes: [
    { field: 'separateKitchen', from: true, to: false, reason: 'Cuisine ouverte.', severity: 'FUNCTION_PRESERVED' },
    { field: 'includeWc', from: true, to: false, reason: 'WC intégré.', severity: 'FUNCTION_PRESERVED' }
  ],
  attempts: [
    { level: 'R0_EXACT', variant: 1, seed: 100, status: 'NON_TROUVE', failureCode: 'STRATEGIES_EXHAUSTED' },
    { level: 'R1_FUSION', variant: 2, seed: 200, status: 'VALID', failureCode: null }
  ],
  result: relaxedFirst
});
const relaxedCalls = [];
const relaxedSelection = G.resolveSelection(requestedOptions, 1, 100, 2, {
  resolveProgram: () => relaxedResolution,
  selectionGenerateResult(candidateOptions, variant, seed) {
    relaxedCalls.push(structuredClone(candidateOptions));
    return validResult(candidateOptions, variant, seed, relaxedCalls.length, relaxedCalls.length + 1);
  }
});
assert.equal(relaxedSelection.resolution.status, 'RELAXED');
assert.ok(relaxedCalls.every((call) => call.separateKitchen === false && call.includeWc === false));
assert.ok(relaxedSelection.selection.results.every((result) =>
  result.program.options.separateKitchen === false && result.program.options.includeWc === false));

/* Une résolution sans résultat ne lance aucune recherche de diversité. */

const unresolvedProgram = first.program;
const unresolved = C.programResolution({
  status: 'UNRESOLVED',
  requestedIntent: first.intent,
  requestedProgram: unresolvedProgram,
  resolvedIntent: null,
  resolvedProgram: null,
  level: null,
  changes: [],
  attempts: [{
    level: 'R0_EXACT', variant: 1, seed: 100,
    status: 'NON_TROUVE', failureCode: 'STRATEGIES_EXHAUSTED'
  }],
  result: null
});
let forbiddenCalls = 0;
const empty = G.resolveSelection(options, 1, 100, 3, {
  resolveProgram: () => unresolved,
  selectionGenerateResult() { forbiddenCalls += 1; }
});
assert.equal(empty.selection, null);
assert.equal(empty.reusedResult, false);
assert.equal(empty.generatedAttempts, 0);
assert.equal(forbiddenCalls, 0);

/* Le vrai pipeline rend une sélection valide sans adaptation de test. */

const integrated = G.resolveSelection(options, 1, 505001, 2);
assert.equal(integrated.resolution.status, 'EXACT');
assert.ok(['COMPLETE', 'PARTIAL'].includes(integrated.selection.status));
assert.ok(integrated.selection.results.every((result) =>
  result.status === 'VALID' && result.verdict.hard === 0));

console.log('M5.2d : premier VALID réemployé, programme résolu partagé et sélection contractuelle vérifiés.');
