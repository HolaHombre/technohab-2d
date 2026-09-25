#!/usr/bin/env node
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (...parts) => readFileSync(join(root, ...parts), 'utf8');
const loadAsset = (name) => {
  vm.runInThisContext(read('assets', name), { filename: name });
};

loadAsset('socle.data.js');
loadAsset('catalogue.data.js');
loadAsset('icon-provenance.data.js');

const socle = globalThis.TechnoHabSocle;
const catalogue = globalThis.TechnoHabCatalogue;
const provenance = globalThis.TechnoHabIconProvenance;
const sprite = read('assets', 'icons', 'furniture.svg');
const page = read('index.html');

const symbolIds = new Set([...sprite.matchAll(/<symbol\s+id="([^"]+)"/g)].map((m) => m[1]));
const inlineIds = new Set([...page.matchAll(/<symbol\s+id="([^"]+)"/g)].map((m) => m[1]));
const provenanceBySymbol = new Map(provenance.icons.map((icon) => [icon.symbolId, icon]));
const sharedByEquipment = new Map((provenance.sharedSymbols || []).map((item) => [item.equipmentId, item]));
const sourceIds = new Set(Object.keys(provenance.sources));
const validStatuses = new Set(['original', 'mapped', 'adapted', 'imported']);

const equipmentIds = new Set();
const sizeIds = new Set();
Object.values(socle.rooms).forEach((room) => {
  (room.equipments || []).forEach((equipment) => {
    equipmentIds.add(equipment.id);
    (equipment.sizes || []).forEach((size) => sizeIds.add(size.id));
  });
});

const catalogueIds = new Set();
catalogue.entrees.forEach((entry) => {
  (entry.moteur || []).forEach((id) => catalogueIds.add(id));
});

function fail(message) {
  assert.fail(message);
}

for (const symbolId of symbolIds) {
  if (!symbolId.startsWith('furn-')) continue;
  const record = provenanceBySymbol.get(symbolId);
  if (!record) fail(`${symbolId} : absent de TechnoHabIconProvenance`);
  assert.ok(validStatuses.has(record.status), `${symbolId} : statut de provenance inconnu`);
  assert.ok(sourceIds.has(record.source), `${symbolId} : source inconnue « ${record.source} »`);
  assert.ok(record.license, `${symbolId} : licence absente`);
  assert.ok(record.label, `${symbolId} : libellé absent`);
  assert.equal(inlineIds.has(symbolId), true, `${symbolId} : absent du sprite inline file://`);
  if (record.status === 'adapted' || record.status === 'imported') {
    for (const field of ['sourceUrl', 'sourceRevision', 'author', 'modifications']) {
      assert.ok(record[field], `${symbolId} : ${field} requis pour une icône ${record.status}`);
    }
  }
}

for (const record of provenance.icons) {
  assert.ok(symbolIds.has(record.symbolId), `${record.symbolId} : provenance orpheline, symbole absent`);
  if (record.preferredExternalSource) {
    assert.ok(sourceIds.has(record.preferredExternalSource), `${record.symbolId} : source externe préférée inconnue`);
  }
}

for (const id of equipmentIds) {
  assert.ok(symbolIds.has('furn-' + id), `${id} : équipement du socle sans symbole`);
  assert.ok(provenanceBySymbol.has('furn-' + id), `${id} : équipement du socle sans provenance`);
}

for (const id of sizeIds) {
  const directSymbol = 'furn-' + id;
  const shared = sharedByEquipment.get(id);
  assert.ok(symbolIds.has(directSymbol) || shared, `${id} : taille de gamme sans symbole propre ni partage explicite`);
  if (shared) {
    assert.ok(symbolIds.has(shared.symbolId), `${id} : partage vers un symbole absent (${shared.symbolId})`);
    assert.ok(provenanceBySymbol.has(shared.symbolId), `${id} : partage vers un symbole sans provenance (${shared.symbolId})`);
    assert.ok(shared.reason, `${id} : partage de symbole sans justification`);
  } else {
    assert.ok(provenanceBySymbol.has(directSymbol), `${id} : taille de gamme sans provenance`);
  }
}

for (const id of catalogueIds) {
  assert.ok(symbolIds.has('furn-' + id), `${id} : équipement exposé au catalogue sans symbole`);
}

console.log(`Icônes mobilier : ${symbolIds.size} symboles, ${equipmentIds.size} équipements du socle, ${sizeIds.size} tailles de gamme, traçabilité complète.`);
