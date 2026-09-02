/* C-P0.2 — audit d'intégration C5 des deux profils pilotes. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
[
  'canonical-values.data.js', 'canonical-values.js', 'fit.data.js',
  'placement.js', 'contracts.js', 'construction.js', 'typologie.js',
  'squelette.js', 'generator.js', 'rules.js', 'socle.data.js', 'room-model.js'
].forEach((file) => new Function(readFileSync(join(root, 'assets', file), 'utf8'))());

const audit = JSON.parse(readFileSync(
  join(root, 'scripts/references/C_P0_INTEGRATION_AUDIT.json'), 'utf8'));
const generator = globalThis.TechnoHabGenerator;
const contracts = globalThis.TechnoHabContracts;
const canonical = globalThis.TechnoHabCanonicalValues;
const model = globalThis.TechnoHabRoomModel;

function ids(entries) {
  return new Set(entries.map((entry) => entry.id));
}

function generate(includeWc, seed) {
  const result = generator.generateResult({
    surface: 90, bedrooms: 3, bathrooms: 1,
    separateKitchen: true, includeWc, shape: 'rectangle'
  }, 1, seed);
  assert.equal(result.status, 'VALID');
  assert.equal(result.verdict.hard, 0);
  return result;
}

function assertCommonIntegration(result, room, profileId, requiredEquipmentIds) {
  const plan = result.builtPlan.plan;
  const profileIds = ids(plan.profiles);
  assert.ok(profileIds.has(profileId), profileId + ' figure dans le manifeste du plan');

  const expectedCanonical = canonical.referencesForProfiles([{ id: profileId }]);
  const actualCanonical = ids(plan.canonicalValues);
  expectedCanonical.forEach((reference) => {
    assert.ok(actualCanonical.has(reference.id), reference.id + ' suit le profil dans le BuiltPlan');
  });

  assert.equal(room.furnishable, true);
  const placementIds = ids(room.placements.map((placement) => ({ id: placement.equipmentId })));
  requiredEquipmentIds.forEach((equipmentId) => {
    assert.ok(placementIds.has(equipmentId), equipmentId + ' est posé avant verdict');
  });
  assert.equal(room.s4.passes, true, room.id + ' satisfait S4');
  assert.equal(room.s4.requiredUsageZones, room.s4.reachableUsageZones,
    room.id + ' relie chaque zone requise');

  const doors = (plan.portes || []).filter((door) => (door.entre || []).includes(room.id));
  assert.ok(doors.length > 0, room.id + ' possède une porte construite');
  assert.ok(doors.every((door) => door.s3Passed === true), room.id + ' satisfait S3');
  room.placements.filter((placement) => placement.anchor !== 'free').forEach((placement) => {
    assert.ok(placement.wallId && placement.faceId,
      placement.equipmentId + ' conserve son mur et sa face intérieure');
  });
}

const separate = generate(true, 68102);
const separateRoom = separate.builtPlan.plan.rooms.find((room) => room.id === 'wc');
assertCommonIntegration(separate, separateRoom, 'TOILET_SEPARATE', ['wc_pan']);

const expectedWc = model.designate('wc', null, {
  area: separateRoom.area, includeOptional: true
});
assert.ok(expectedWc.equipments.some((equipment) => equipment.id === 'handbasin'),
  'le profil active le lave-mains à la surface du WC construit');
assert.ok(!separateRoom.placements.some((placement) => placement.equipmentId === 'handbasin'),
  'C5-P0-01 reste mesuré : le programme compilé omet cet optionnel actif');

const integrated = generate(false, 68103);
const integratedRoom = integrated.builtPlan.plan.rooms.find((room) => room.id === 'bath_1');
assert.deepEqual(integratedRoom.composedWith, ['wc']);
assertCommonIntegration(integrated, integratedRoom, 'BATHROOM_WITH_TOILET',
  ['shower', 'washbasin', 'wc_pan']);
assert.ok(ids(integrated.builtPlan.plan.profiles).has('BATHROOM'),
  'la composition expose honnêtement son profil hôte C2');
assert.ok(!integratedRoom.placements.some((placement) => placement.equipmentId === 'bathtub'),
  'C5-P0-02 reste mesuré : la génération ne sélectionne pas la variante bain');

for (const room of [separateRoom, integratedRoom]) {
  assert.equal(room.services, undefined, 'C5-P0-04 : les services ne sont pas transportés');
  assert.equal(room.placementRules, undefined,
    'C5-P0-03 : S1 à S6 ne sont pas encore publiées pièce par pièce');
}

assert.equal(contracts.profiles.wc.maturity,
  audit.profiles.TOILET_SEPARATE.currentMaturity);
assert.equal(contracts.profiles.bath_wc.maturity,
  audit.profiles.BATHROOM_WITH_TOILET.currentMaturity);
assert.equal(audit.profiles.TOILET_SEPARATE.decision, 'REMAIN_C4');
assert.equal(audit.profiles.BATHROOM_WITH_TOILET.decision, 'REMAIN_C4');
assert.ok(audit.profiles.TOILET_SEPARATE.blockers.length > 0);
assert.ok(audit.profiles.BATHROOM_WITH_TOILET.blockers.length > 0);

console.log('C-P0.2 : trajet construit prouvé · WC et salle d’eau intégrée restent C4 avec 7 blocages C5 attribués.');
