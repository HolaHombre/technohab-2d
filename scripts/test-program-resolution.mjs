/* M5.2c — orchestration déterministe autour de generateResult(). */
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

function generationResult(options, variant, seed, status) {
  const rawProgram = G.buildProgram(options);
  const intent = C.intent(G.normalizeOptions(options), variant, seed);
  const program = C.program(rawProgram, C.profileManifest(rawProgram));
  if (status === 'VALID') {
    const plan = { boundary: { width: 1, height: 1 }, rooms: [] };
    const builtPlan = C.builtPlan(plan, Object.freeze([]));
    const verdict = C.verdict({ summary: { hard: 0, guideline: 0 }, violations: [], limites: [] });
    return C.generationResult({
      status, intent, program, builtPlan, verdict,
      topologyCandidate: null, failure: null
    });
  }
  return C.generationResult({
    status,
    intent,
    program,
    failure: C.failure(
      status === 'IMPOSSIBLE' ? 'MINIMUM_AREA_EXCEEDS_INTENT'
        : status === 'NON_TROUVE' ? 'STRATEGIES_EXHAUSTED' : 'GENERATION_FAILED',
      status === 'IMPOSSIBLE' ? 'program' : 'topology',
      'Résultat simulé pour la preuve M5.2c.'
    )
  });
}

function runtimeFor(statuses, calls = []) {
  let index = 0;
  return {
    calls,
    generateResult(options, variant, seed) {
      calls.push({ options: structuredClone(options), variant, seed });
      const status = statuses[Math.min(index, statuses.length - 1)];
      index += 1;
      return generationResult(options, variant, seed, status);
    }
  };
}

const base = {
  surface: 82, bedrooms: 3, bathrooms: 2,
  separateKitchen: true, includeWc: true, shape: 'rectangle'
};

/* 1. Deux échecs ne relaxent rien ; le troisième essai exact peut réussir. */

const exactRuntime = runtimeFor(['NON_TROUVE', 'NON_TROUVE', 'VALID']);
const exact = G.resolveProgram(base, 4, 1200, exactRuntime);
assert.equal(exact.status, 'EXACT');
assert.equal(exact.level, 'R0_EXACT');
assert.equal(exact.attempts.length, 3);
assert.deepEqual(exact.attempts.map((attempt) => attempt.status), [
  'NON_TROUVE', 'NON_TROUVE', 'VALID'
]);
assert.deepEqual(exact.attempts.map((attempt) => attempt.variant), [4, 5, 6]);
assert.equal(exact.attempts[0].seed, 1200);
assert.equal(new Set(exact.attempts.map((attempt) => attempt.seed)).size, 3);
assert.equal(exact.changes.length, 0);
assert.equal(exact.requestedIntent.seed, 1200);
assert.equal(exact.resolvedIntent.seed, exact.attempts[2].seed);

const repeated = G.resolveProgram(base, 4, 1200,
  runtimeFor(['NON_TROUVE', 'NON_TROUVE', 'VALID']));
assert.deepEqual(repeated.attempts, exact.attempts, 'la trace doit être rejouable');

/* 2. Trois NON_TROUVE ouvrent R1, qui reconstruit le programme fusionné. -- */

const source = structuredClone(base);
const relaxedRuntime = runtimeFor(['NON_TROUVE', 'NON_TROUVE', 'NON_TROUVE', 'VALID']);
const relaxed = G.resolveProgram(source, 1, 9001, relaxedRuntime);
assert.deepEqual(source, base, 'resolveProgram ne mute pas la demande');
assert.equal(relaxed.status, 'RELAXED');
assert.equal(relaxed.level, 'R1_FUSION');
assert.equal(relaxed.attempts.length, 4);
assert.equal(relaxedRuntime.calls[3].options.separateKitchen, false);
assert.equal(relaxedRuntime.calls[3].options.includeWc, false);
assert.equal(relaxed.requestedProgram.options.separateKitchen, true);
assert.equal(relaxed.resolvedProgram.options.separateKitchen, false);
assert.deepEqual(relaxed.changes.map((item) => item.field), ['separateKitchen', 'includeWc']);

/* 3. IMPOSSIBLE saute le solde du niveau ; INVALIDE_DEBUG arrête tout. ---- */

const impossibleRuntime = runtimeFor(['IMPOSSIBLE', 'VALID']);
const reducedBath = G.resolveProgram({
  surface: 70, bedrooms: 0, bathrooms: 2,
  separateKitchen: false, includeWc: false
}, 1, 77, impossibleRuntime);
assert.equal(reducedBath.status, 'RELAXED');
assert.equal(reducedBath.level, 'R2_BATHROOMS');
assert.equal(reducedBath.attempts.length, 2, 'IMPOSSIBLE ne paie pas deux essais identiques');
assert.equal(impossibleRuntime.calls[1].options.bathrooms, 1);

const debugRuntime = runtimeFor(['NON_TROUVE', 'INVALIDE_DEBUG', 'VALID']);
const debug = G.resolveProgram(base, 1, 88, debugRuntime);
assert.equal(debug.status, 'UNRESOLVED');
assert.equal(debug.result, null);
assert.equal(debug.attempts.length, 2);
assert.deepEqual(debug.attempts.map((attempt) => attempt.status), ['NON_TROUVE', 'INVALIDE_DEBUG']);
assert.equal(debugRuntime.calls.length, 2, 'une panne ne devient jamais une concession');

/* 4. L'épuisement est borné et une graine absente reste rejouable. -------- */

const exactOnly = {
  surface: 45, bedrooms: 0, bathrooms: 1,
  separateKitchen: false, includeWc: false
};
const exhaustedRuntime = runtimeFor(['NON_TROUVE']);
const exhausted = G.resolveProgram(exactOnly, 2, 99, exhaustedRuntime);
assert.equal(exhausted.status, 'UNRESOLVED');
assert.equal(exhausted.attempts.length, 3);
assert.equal(exhaustedRuntime.calls.length, 3);

const seededA = G.resolveProgram(exactOnly, 2, null, runtimeFor(['VALID']));
const seededB = G.resolveProgram(exactOnly, 2, null, runtimeFor(['VALID']));
assert.equal(seededA.requestedIntent.seed, null, 'une graine absente n’est pas inventée dans la demande');
assert.deepEqual(seededA.attempts, seededB.attempts, 'les graines de travail sont néanmoins déterministes');

assert.throws(() => G.resolveProgram(exactOnly, 1, 1, {
  generateResult: () => ({ status: 'INCONNU' })
}), /statut M1 connu/);

/* 5. Le chemin réel reconstruit et juge un BuiltPlan sans adaptation. ----- */

const integrated = G.resolveProgram({
  surface: 75, bedrooms: 2, bathrooms: 1,
  separateKitchen: false, includeWc: true, shape: 'rectangle'
}, 1, 505001);
assert.equal(integrated.status, 'EXACT');
assert.equal(integrated.result.status, 'VALID');
assert.equal(integrated.result.verdict.hard, 0);
assert.ok(integrated.result.builtPlan.plan.rooms.length > 0);

console.log('M5.2c : trois essais exacts, sauts IMPOSSIBLE, arrêt debug et traces rejouables vérifiés.');
