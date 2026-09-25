/* Catalogue local des équipements et pièces. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(join(root, 'index.html'), 'utf8');
const app = readFileSync(join(root, 'assets', 'app.js'), 'utf8');
const css = readFileSync(join(root, 'assets', 'styles.css'), 'utf8');
new Function(readFileSync(join(root, 'assets', 'fit.data.js'), 'utf8'))();

assert.match(html, /id="catalog-open"[^>]+href="#catalogue"/);
assert.match(html, /id="catalog-page"[^>]+hidden/);
assert.match(html, /id="catalog-equipment-list"/);
assert.match(html, /id="catalog-room-list"/);
assert.match(html, /class="catalog-nav"/);
assert.match(html, /class="catalog-return" href="#atelier"/);
assert.match(app, /root\.TechnoHabFit\.envelopes/);
assert.match(app, /window\.addEventListener\('hashchange', routePage\)/);
assert.match(app, /catalogOpen\.addEventListener\('click'/,
  'le lien du catalogue doit ouvrir la page même si hashchange ne suffit pas en file://');
assert.match(app, /classList\.toggle\('catalog-mode', catalogActive\)/);
assert.match(app, /classList\.toggle\('catalog-route', catalogActive\)/);
assert.match(app, /Défini, pas encore activable/);
assert.match(app, /implemented: 'Implémenté', progress: 'En cours', planned: 'Prévu'/);
assert.match(app, /equipmentDevelopmentStatus/);
assert.match(css, /\.catalog-grid/);
assert.match(css, /data-status="progress"/);
assert.match(css, /\.catalog-mode > \.topbar/);
assert.match(css, /html\.catalog-route body \{ height: auto; min-height: 100%; overflow: visible; \}/);

const equipmentIds = new Set();
Object.values(globalThis.TechnoHabFit.envelopes).forEach((room) => {
  Object.values(room.catalogs || {}).forEach((catalog) => {
    (catalog.equipments || []).forEach((equipment) => equipmentIds.add(equipment.id));
  });
});
assert.ok(equipmentIds.size > 12, `le catalogue doit dépasser le premier écran (${equipmentIds.size} équipements)`);

console.log(`Catalogue : navigation, défilement, ${equipmentIds.size} équipements et pièces vérifiés.`);
