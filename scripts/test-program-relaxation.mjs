/* M5.2a-b — politique pure et contrat ProgramResolution. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
['relaxation.data.js', 'relaxation.js', 'canonical-values.data.js', 'canonical-values.js',
  'fit.data.js', 'placement.js', 'contracts.js', 'construction.js', 'typologie.js',
  'squelette.js', 'generator.js', 'rules.js']
  .forEach((file) => new Function(readFileSync(join(root, 'assets', file), 'utf8'))());

const policy = globalThis.TechnoHabRelaxation;
const policyData = globalThis.TechnoHabRelaxationData;
const contracts = globalThis.TechnoHabContracts;
const generator = globalThis.TechnoHabGenerator;

assert.equal(policy.attemptsPerLevel, 3);
assert.deepEqual(policy.levels, contracts.resolutionLevels);
assert.deepEqual(Object.values(policy.changeSeverities), contracts.changeSeverities);
assert.ok(Object.isFrozen(policyData.levels[1].mutations[0]));

/* 1. Les concessions sont cumulatives, ordonnées et immuables. ---------- */

const original = {
  surface: 82,
  bedrooms: 3,
  bathrooms: 2,
  separateKitchen: true,
  includeWc: true,
  includeOffice: true
};
const untouched = structuredClone(original);
const candidates = policy.candidates(original, {
  relaxableFunctions: [{
    id: 'office',
    field: 'includeOffice',
    activeValue: true,
    inactiveValue: false,
    relaxable: true,
    relaxationPriority: 20
  }]
});

assert.deepEqual(original, untouched, 'la demande source ne doit jamais être mutée');
assert.deepEqual(candidates.map((candidate) => candidate.level), [
  'R0_EXACT', 'R1_FUSION', 'R2_BATHROOMS', 'R3_OPTIONAL_ROOM', 'R4_BEDROOM'
]);
assert.equal(candidates[1].options.separateKitchen, false);
assert.equal(candidates[1].options.includeWc, false);
assert.equal(candidates[1].changes.length, 2);
assert.ok(candidates[1].changes.every((item) => item.severity === 'FUNCTION_PRESERVED'));
assert.equal(candidates[2].options.bathrooms, 1);
assert.equal(candidates[2].changes.at(-1).severity, 'FUNCTION_REDUCED');
assert.equal(candidates[3].options.includeOffice, false);
assert.equal(candidates[3].changes.at(-1).field, 'includeOffice');
assert.equal(candidates[4].options.bedrooms, 2);
assert.equal(candidates[4].changes.length, 5);
assert.ok(Object.isFrozen(candidates));
assert.ok(Object.isFrozen(candidates[4].options));
assert.ok(Object.isFrozen(candidates[4].changes[0]));

/* 2. Les niveaux sans effet et les fonctions non déclarées sont sautés. -- */

assert.deepEqual(policy.candidates({
  bedrooms: 0, bathrooms: 1, separateKitchen: false, includeWc: false
}).map((candidate) => candidate.level), ['R0_EXACT']);

const guarded = policy.candidates({ bedrooms: 1, bathrooms: 1, includeOffice: true }, {
  relaxableFunctions: [{
    id: 'office', field: 'includeOffice', relaxable: false, relaxationPriority: 1
  }]
});
assert.deepEqual(guarded.map((candidate) => candidate.level), ['R0_EXACT', 'R4_BEDROOM']);
assert.equal(guarded[0].options.includeOffice, true);

const prioritized = policy.candidates({
  bedrooms: 0, bathrooms: 1, includeOffice: true, includeWorkshop: true
}, {
  relaxableFunctions: [
    { id: 'office', field: 'includeOffice', relaxable: true, relaxationPriority: 20 },
    { id: 'workshop', field: 'includeWorkshop', relaxable: true, relaxationPriority: 10 }
  ]
});
assert.equal(prioritized[1].level, 'R3_OPTIONAL_ROOM');
assert.equal(prioritized[1].changes[0].field, 'includeWorkshop');
assert.equal(prioritized[1].options.includeOffice, true, 'R3 retire une seule fonction par passage');

/* 3. Le contrat distingue exact, relaxé et non résolu. ------------------ */

const exactResult = generator.generateResult({
  surface: 75, bedrooms: 2, bathrooms: 1, separateKitchen: false, includeWc: true
}, 1, 505001);
assert.equal(exactResult.status, 'VALID');

const exact = contracts.programResolution({
  status: 'EXACT',
  requestedIntent: exactResult.intent,
  requestedProgram: exactResult.program,
  resolvedIntent: exactResult.intent,
  resolvedProgram: exactResult.program,
  level: 'R0_EXACT',
  changes: [],
  attempts: [{ level: 'R0_EXACT', variant: 1, seed: 505001, status: 'VALID', failureCode: null }],
  result: exactResult
});
assert.equal(exact.status, 'EXACT');
assert.ok(Object.isFrozen(exact));
assert.ok(Object.isFrozen(exact.attempts[0]));

const relaxedResult = generator.generateResult({
  surface: 75, bedrooms: 2, bathrooms: 1, separateKitchen: false, includeWc: true
}, 2, 505002);
assert.equal(relaxedResult.status, 'VALID');
const relaxed = contracts.programResolution({
  status: 'RELAXED',
  requestedIntent: exactResult.intent,
  requestedProgram: exactResult.program,
  resolvedIntent: relaxedResult.intent,
  resolvedProgram: relaxedResult.program,
  level: 'R1_FUSION',
  changes: [{
    field: 'separateKitchen', from: true, to: false,
    reason: 'Cuisine ouverte.', severity: 'FUNCTION_PRESERVED'
  }],
  attempts: [{ level: 'R1_FUSION', variant: 2, seed: 505002, status: 'VALID', failureCode: null }],
  result: relaxedResult
});
assert.equal(relaxed.level, 'R1_FUSION');
assert.ok(Object.isFrozen(relaxed.changes[0]));

const unresolved = contracts.programResolution({
  status: 'UNRESOLVED',
  requestedIntent: exactResult.intent,
  requestedProgram: exactResult.program,
  resolvedIntent: null,
  resolvedProgram: null,
  level: null,
  changes: [],
  attempts: [{
    level: 'R0_EXACT', variant: 1, seed: 9, status: 'NON_TROUVE', failureCode: 'SEARCH_EXHAUSTED'
  }],
  result: null
});
assert.equal(unresolved.result, null);

assert.throws(() => contracts.programResolution({
  status: 'RELAXED',
  requestedIntent: exactResult.intent,
  requestedProgram: exactResult.program,
  resolvedIntent: relaxedResult.intent,
  resolvedProgram: relaxedResult.program,
  level: 'R1_FUSION',
  changes: [],
  attempts: [],
  result: relaxedResult
}), /RELAXED exige/);

assert.throws(() => contracts.programResolution({
  status: 'UNRESOLVED',
  requestedIntent: exactResult.intent,
  requestedProgram: exactResult.program,
  resolvedIntent: exactResult.intent,
  resolvedProgram: exactResult.program,
  level: 'R0_EXACT',
  changes: [],
  attempts: [],
  result: exactResult
}), /UNRESOLVED/);

console.log('M5.2a-b : 5 niveaux purs, concessions cumulatives et ProgramResolution 1.1 vérifiés.');
