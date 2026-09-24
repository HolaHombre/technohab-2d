/* I1/L1 — activation déclarative du bureau dans le produit complet. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const assets = [
  'canonical-values.data.js', 'canonical-values.js', 'fit.data.js',
  'construction.js', 'contracts.js', 'typologie.js', 'squelette.js',
  'generator.js', 'socle.data.js', 'room-model.js', 'placement.js',
  'rules.js', 'relaxation.data.js', 'relaxation.js'
];
assets.forEach((file) => {
  new Function(readFileSync(join(root, 'assets', file), 'utf8'))();
});

const G = globalThis.TechnoHabGenerator;
const fit = globalThis.TechnoHabFit;

const childOffice = fit.resolveProgram('bedroom', 'enfant', {
  area: 11, upgradeSizes: true, includeOptional: true
});
assert.deepEqual(childOffice.equipments.filter((item) => ['desk', 'office_chair'].includes(item.id))
  .map((item) => item.id), ['desk', 'office_chair'],
'le bureau de chambre est un couple plateau + chaise');
assert.equal(childOffice.equipments.find((item) => item.id === 'office_chair').usage[0].face, 'back');

assert.deepEqual(
  G.normalizeOptions({ officeType: 'convertible' }),
  {
    surface: 75, bedrooms: 0, bathrooms: 1, separateKitchen: false,
    includeWc: true, offices: 1, officeVariant: 'convertible',
    shape: 'rectangle',
    // Cumul des modes, 24 septembre 2026 : `priorities` (tableau) fait foi,
    // `priority` (singulier) n'en reste que la primaire — voir
    // PONDERATION_AGENCEMENT.md et normalizeOptions() dans generator.js.
    priorities: ['compact'], priority: 'compact'
  }
);
assert.equal(G.normalizeOptions({ officeType: 'none', offices: 1 }).offices, 0);
assert.equal(G.normalizeOptions({ offices: 1, officeVariant: 'compact' }).offices, 1);

const absent = G.buildProgram({ surface: 110, bedrooms: 2, officeType: 'none' });
assert.equal(absent.rooms.some((room) => room.type === 'bureau'), false);

const refusedProgram = G.generateResult({
  surface: 35, bedrooms: 5, bathrooms: 2, separateKitchen: true,
  includeWc: true, officeType: 'convertible'
}, 1, 74000);
assert.equal(refusedProgram.status, 'IMPOSSIBLE');
assert.equal(refusedProgram.failure.code, 'MINIMUM_AREA_EXCEEDS_INTENT');

for (const officeVariant of ['compact', 'convertible']) {
  const program = G.buildProgram({
    surface: 145, bedrooms: 2, bathrooms: 1, includeWc: true,
    separateKitchen: false, officeType: officeVariant, shape: 'rectangle'
  });
  const office = program.rooms.find((room) => room.type === 'bureau');
  assert.ok(office, officeVariant + ' doit activer la pièce bureau');
  assert.equal(office.id, 'bureau');
  assert.equal(office.variant, officeVariant);
  assert.ok(office.minArea >= (officeVariant === 'compact' ? 5 : 9));
}

let generated = 0;
for (const seed of [74101, 74102, 74103]) {
  const plan = G.generatePlan({
    surface: 145, bedrooms: 2, bathrooms: 1, includeWc: true,
    separateKitchen: false, officeType: 'compact', shape: 'rectangle'
  }, 1, seed);
  const office = plan.rooms.find((room) => room.type === 'bureau');
  assert.ok(office, 'le plan doit contenir le bureau');
  assert.equal(office.variant, 'compact');
  assert.deepEqual(office.equipmentProgram.resolved.map((item) => item.id).slice(0, 2),
    ['desk', 'office_chair']);
  assert.ok(office.placements.some((item) => item.equipmentId === 'desk'));
  assert.ok(office.placements.some((item) => item.equipmentId === 'office_chair'));
  assert.ok(plan.profiles.some((profile) => profile.id === 'BUREAU'));
  assert.ok(plan.adjacencyRequirements.some((edge) => edge.a === 'bureau' || edge.b === 'bureau'));
  generated += 1;
}

const html = readFileSync(join(root, 'index.html'), 'utf8');
const app = readFileSync(join(root, 'assets/app.js'), 'utf8');
assert.match(html, /select name="officeType"/);
assert.match(html, /value="compact"/);
assert.match(html, /value="convertible"/);
assert.match(app, /officeType: data\.get\('officeType'\)/);

console.log('I1/L1-bureau : activation déclarative, interface et ' + generated + ' plans complets vérifiés.');
