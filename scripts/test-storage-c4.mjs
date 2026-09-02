/* C-P2 — les STORAGE_UNIT et STORAGE_BAY sont deux objets distincts. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
['canonical-values.data.js', 'canonical-values.js', 'fit.data.js', 'contracts.js',
  'construction.js', 'typologie.js', 'squelette.js', 'generator.js',
  'socle.data.js', 'room-model.js', 'placement.js', 'rules.js']
  .forEach((file) => { new Function(readFileSync(join(root, 'assets', file), 'utf8'))(); });

const canonical = globalThis.TechnoHabCanonicalValues;
const contracts = globalThis.TechnoHabContracts;
const generator = globalThis.TechnoHabGenerator;
const rules = globalThis.TechnoHabRules;
const socle = globalThis.TechnoHabSocle;
const bayShape = rules.rules.find((rule) => rule.id === 'TH2D-RANGEMENT-001');
const bayAttachment = rules.rules.find((rule) => rule.id === 'TH2D-RANGEMENT-002');
const bedroomStorage = rules.rules.find((rule) => rule.id === 'TH2D-RANGEMENT-003');

assert.equal(contracts.profiles.storage.maturity, 'C4');
assert.deepEqual(socle.storageBay, {
  minDepth: 0.45,
  maxDepthLengthRatio: 0.6,
  canonicalValues: {
    minDepth: 'VAL-STORAGE-BAY-DEPTH-MIN-001',
    maxDepthLengthRatio: 'VAL-STORAGE-BAY-DEPTH-LENGTH-RATIO-MAX-001'
  }
});
for (const id of ['VAL-STORAGE-BAY-DEPTH-MIN-001', 'VAL-STORAGE-BAY-DEPTH-LENGTH-RATIO-MAX-001']) {
  assert.ok(canonical.get(id));
}

const baseRoom = {
  id: 'bedroom_1', type: 'bedroom', label: 'Chambre 1',
  usableRect: { x0: 0, y0: 0, x1: 4, y1: 3 },
  placements: [{ equipmentId: 'wardrobe', label: 'Penderie coulissante' }]
};
function withBay(part) {
  return { rooms: [Object.assign({}, baseRoom, { parts: [baseRoom.usableRect, part] })] };
}
assert.equal(bayShape.evaluate(withBay({ role: 'storage', x0: 4, y0: 0, x1: 4.5, y1: 2 })).length, 0);
assert.equal(bayAttachment.evaluate(withBay({ role: 'storage', x0: 4, y0: 0, x1: 4.5, y1: 2 })).length, 0);
assert.equal(bayShape.evaluate(withBay({ role: 'storage', x0: 4, y0: 0, x1: 4.4, y1: 2 })).length, 1,
  'une STORAGE_BAY sous 0,45 m est refusée');
assert.equal(bayAttachment.evaluate(withBay({ role: 'storage', x0: 5, y0: 0, x1: 5.5, y1: 2 })).length, 1,
  'une STORAGE_BAY détachée est refusée');
assert.equal(bedroomStorage.evaluate({ rooms: [baseRoom] }).length, 0,
  'la présence de la penderie est jugée sur le STORAGE_UNIT, sans exiger de baie');
assert.equal(bedroomStorage.evaluate({ rooms: [Object.assign({}, baseRoom, { placements: [] })] }).length, 1,
  'une chambre sans penderie réellement posée est signalée');
assert.equal(rules.limites['TH2D-RANGEMENT-003'], undefined,
  'la règle de penderie n’est plus une limite d’implémentation');

const built = generator.generatePlan({
  surface: 90, bedrooms: 3, bathrooms: 1,
  separateKitchen: false, includeWc: true, shape: 'rectangle'
}, 1, 20260921);
for (const bedroom of built.rooms.filter((room) => room.type === 'bedroom')) {
  assert.ok(bedroom.placements.some((placement) => placement.equipmentId === 'wardrobe'),
    bedroom.id + ' doit porter une penderie réellement posée');
}
assert.equal(bedroomStorage.evaluate(built).length, 0);
const program = generator.buildProgram({
  surface: 90, bedrooms: 3, bathrooms: 1,
  separateKitchen: false, includeWc: true
});
assert.ok(contracts.profileManifest(program).some((profile) => profile.id === 'STORAGE'),
  'le profil STORAGE doit être enrôlé par la penderie, avant toute baie géométrique');

console.log('C-P2 rangements C4 : unité, baie, canon, rattachement et penderies vérifiés.');
