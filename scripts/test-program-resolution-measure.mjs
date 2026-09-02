/* M5.2f — invariants de la photographie de résolution graduée. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const reference = JSON.parse(readFileSync(
  join(root, 'scripts', 'references', 'M5_2_RESOLUTION_REFERENCE.json'), 'utf8'));
const measureSource = readFileSync(join(root, 'scripts', 'measure-program-resolution.mjs'), 'utf8');

assert.equal(reference.format, 'technohab-m5.2-resolution-v1');
assert.equal(reference.requests, reference.configurations * reference.seeds);
assert.equal(reference.compressedConfigurations + reference.exactControls,
  reference.configurations);
assert.equal(Object.values(reference.statusCounts).reduce((sum, count) => sum + count, 0),
  reference.requests);
assert.equal(Object.values(reference.levelCounts).reduce((sum, count) => sum + count, 0),
  reference.requests);
assert.ok(reference.statusCounts.EXACT > 0 && reference.statusCounts.RELAXED > 0,
  'la photographie doit exercer le chemin exact et le chemin relaxé');
assert.ok(reference.levelCounts.R1_FUSION > 0);
assert.ok(reference.levelCounts.R2_BATHROOMS > 0);
assert.ok(reference.levelCounts.R4_BEDROOM > 0);
assert.equal(reference.levelCounts.R3_OPTIONAL_ROOM, undefined,
  'R3 reste inapplicable tant qu’aucune fonction du socle n’est relaxable');
assert.equal(reference.unresolvedAfterRelaxation, 0);
assert.equal(reference.hardViolations, 0);
assert.ok(reference.relaxedNonFoundAttempts > 0,
  'le banc doit distinguer les tentatives NON_TROUVE d’une demande finalement irrésolue');
assert.equal(reference.selection.statuses.COMPLETE, reference.selection.measuredRequests);
assert.equal(reference.selection.meanPlans, 3);
assert.equal(reference.selection.meanSignatures, 3);

const attempts = Object.values(reference.byConfiguration).flatMap((entry) => entry.attempts);
const sorted = attempts.slice().sort((left, right) => left - right);
const mean = attempts.reduce((sum, value) => sum + value, 0) / attempts.length;
assert.equal(Number(mean.toFixed(2)), reference.resolutionAttempts.mean);
assert.equal(sorted[Math.ceil(sorted.length * 0.9) - 1], reference.resolutionAttempts.p90);
assert.equal(Math.max(...attempts), reference.resolutionAttempts.max);

assert.match(measureSource, /generator\.resolveProgram\(/);
assert.match(measureSource, /generator\.resolveSelection\(/);
assert.match(measureSource, /process\.hrtime\.bigint\(\)/);
assert.match(measureSource, /--check/);

console.log('M5.2f : référence exacte/relaxée, coût, concessions, sélection et zéro HARD vérifiés.');
