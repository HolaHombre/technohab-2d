/* Porte B — schéma consommable et doctrine HARD N3 explicite. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const load = (file) => new Function(readFileSync(join(root, 'assets', file), 'utf8'))();
load('canonical-values.data.js');
load('canonical-values.js');
load('socle.data.js');

const schema = JSON.parse(readFileSync(join(root, 'CANONICAL_VALUE_SCHEMA.json'), 'utf8'));
const registry = globalThis.TechnoHabCanonicalValues;
const socle = globalThis.TechnoHabSocle;
const facadeWeight = registry.get('VAL-CIRC-FACADE-EXCESS-WEIGHT-001');
const deadLengthWeight = registry.get('VAL-CIRC-DEAD-LENGTH-WEIGHT-001');
const targetMissWeight = registry.get('VAL-USAGE-TARGET-MISS-WEIGHT-001');
const comfortMissWeight = registry.get('VAL-USAGE-COMFORT-MISS-WEIGHT-001');

assert.equal(schema.$schema, 'https://json-schema.org/draft/2020-12/schema');
assert.equal(schema.properties.schemaVersion.const, registry.schemaVersion);
assert.deepEqual(registry.validate(globalThis.TechnoHabCanonicalValueData), []);
assert.equal(new Set(registry.values.map((value) => value.id)).size, registry.values.length);
assert.equal(facadeWeight.quantity, 'score-weight');
assert.equal(facadeWeight.unit, 'points-per-meter');
assert.equal(facadeWeight.source.level, 'N3');
assert.ok(facadeWeight.source.rationale.length > 40,
  'le coût de façade N3 doit rester explicitement justifié');
assert.equal(deadLengthWeight.quantity, 'score-weight');
assert.equal(deadLengthWeight.unit, 'points-per-meter');
assert.equal(deadLengthWeight.status, 'PROVISIONAL');
assert.equal(deadLengthWeight.ruleLevel, 'PREFERENCE');
assert.equal(deadLengthWeight.source.level, 'N3');
assert.ok(deadLengthWeight.source.rationale.length > 40,
  'le coût des branches mortes N3 doit rester explicitement justifié');
for (const weight of [targetMissWeight, comfortMissWeight]) {
  assert.equal(weight.quantity, 'score-weight');
  assert.equal(weight.unit, 'points-per-requirement');
  assert.equal(weight.status, 'PROVISIONAL');
  assert.equal(weight.ruleLevel, 'PREFERENCE');
  assert.equal(weight.source.level, 'N3');
  assert.ok(weight.source.rationale.length > 40);
}
assert.ok(targetMissWeight.value > comfortMissWeight.value,
  'manquer target doit coûter davantage que manquer comfort');

function expectInvalid(change, message) {
  const copy = structuredClone(globalThis.TechnoHabCanonicalValueData);
  change(copy);
  assert.ok(registry.validate(copy).length > 0, message);
}

const hardN3Index = globalThis.TechnoHabCanonicalValueData.values.findIndex((value) =>
  value.ruleLevel === 'HARD' && value.source.level === 'N3');

expectInvalid((copy) => copy.values.push(structuredClone(copy.values[0])), 'un identifiant dupliqué doit être refusé');
expectInvalid((copy) => { copy.values[0].unit = 'cm'; }, 'une unité inconnue doit être refusée');
expectInvalid((copy) => { copy.values[0].scope.roomProfiles = []; }, 'une portée vide doit être refusée');
expectInvalid((copy) => { delete copy.values[hardN3Index].source.rationale; }, 'un HARD N3 muet doit être refusé');
expectInvalid((copy) => {
  copy.values[hardN3Index].status = 'UNRESOLVED';
  copy.values[hardN3Index].source = { level: 'UNRESOLVED', kind: 'unresolved', reference: 'question ouverte' };
}, 'une valeur non résolue ne doit jamais gouverner un HARD');

function checkDimensions(id, footprint) {
  const canonical = registry.get(id);
  assert.deepEqual(canonical.value, { width: footprint.w, depth: footprint.d }, id + ' doit refléter le socle');
}

const wc = socle.rooms.wc;
assert.equal(registry.get(wc.canonicalValues.minProgramArea).value, wc.minProgramArea);
assert.equal(registry.get(wc.canonicalValues.minProgramSide).value, wc.minProgramSide);
assert.equal(registry.get(wc.canonicalValues.maxRatio).value, wc.maxRatio);
const wcPan = wc.equipments.find((equipment) => equipment.id === 'wc_pan');
checkDimensions(wcPan.canonicalValues.footprint, wcPan.footprint);
assert.equal(registry.get(wcPan.canonicalValues.usageMin).value, wcPan.usage[0].min);
assert.equal(registry.get(wcPan.canonicalValues.usageWidth).value, wcPan.usage[0].width);
assert.equal(registry.get(wcPan.canonicalValues.usageTarget).value, wcPan.usage[0].target);
assert.equal(registry.get(wcPan.canonicalValues.usageComfort).value, wcPan.usage[0].comfort);
assert.equal(registry.get(wcPan.canonicalValues.sideMin).value, wcPan.usage[1].min);
assert.equal(registry.get(wcPan.canonicalValues.sideTarget).value, wcPan.usage[1].target);
const handbasin = wc.equipments.find((equipment) => equipment.id === 'handbasin');
assert.equal(registry.get(handbasin.canonicalValues.activationArea).value, handbasin.minRoomArea);

const bath = socle.rooms.bath;
assert.equal(registry.get(bath.canonicalValues.minProgramArea).value, bath.minProgramArea);
assert.equal(registry.get(bath.canonicalValues.minProgramSide).value, bath.minProgramSide);
for (const equipment of bath.equipments) {
  checkDimensions(equipment.canonicalValues.footprint, equipment.footprint);
  if (equipment.canonicalValues.usageMin) {
    assert.equal(registry.get(equipment.canonicalValues.usageMin).value, equipment.usage[0].min);
  }
  if (equipment.canonicalValues.usageTarget) {
    assert.equal(registry.get(equipment.canonicalValues.usageTarget).value, equipment.usage[0].target);
  }
  if (equipment.canonicalValues.usageComfort) {
    assert.equal(registry.get(equipment.canonicalValues.usageComfort).value, equipment.usage[0].comfort);
  }
}

const separate = registry.referencesForProfiles([{ id: 'TOILET_SEPARATE' }]);
const integrated = registry.referencesForProfiles([{ id: 'BATHROOM_WITH_TOILET' }]);
assert.ok(separate.some((reference) => reference.id === 'VAL-WC-PAN-FOOTPRINT-001'));
assert.ok(integrated.some((reference) => reference.id === 'VAL-WC-PAN-FOOTPRINT-001'),
  'le profil composé doit consommer le même canon WC que le WC séparé');
assert.ok(integrated.some((reference) => reference.id === 'VAL-EQ-031'),
  'le profil composé doit aussi consommer le canon de la salle d’eau');

console.log('Valeurs canoniques : schéma 1.0 · ' + registry.values.length +
  ' valeurs pilotes · HARD N3 justifié · bindings WC/bain conformes.');
