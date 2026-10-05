/* Pièces de service : le WC ne prend plus toute la profondeur de sa poche.
   Mesuré le 25 septembre 2026 sur 60 plans : 34 WC sur 45 à 3:1 ou plus avant
   (0,9 × 3,6 m), aucun après (2,4 au plus). */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
[
  'canonical-values.data.js', 'canonical-values.js', 'programme-bandes.data.js',
  'fit.data.js', 'construction.js', 'contracts.js', 'typologie.js', 'squelette.js',
  'generator.js', 'socle.data.js', 'room-model.js', 'placement.js', 'rules.js',
  'relaxation.data.js', 'relaxation.js'
].forEach((file) => new Function(readFileSync(join(root, 'assets', file), 'utf8'))());

const G = globalThis.TechnoHabGenerator;
const fit = globalThis.TechnoHabFit;
assert.equal(fit.maxAspectOf('wc'), 3.0);
assert.equal(fit.maxAspectOf('bath'), 3.0);
assert.equal(fit.maxAspectOf('living'), null, 'seules les pièces de service sont bornées');

const allongement = (room) => {
  const xs = room.parts.flatMap((part) => [part.x0, part.x1]);
  const ys = room.parts.flatMap((part) => [part.y0, part.y1]);
  const w = Math.max(...xs) - Math.min(...xs);
  const h = Math.max(...ys) - Math.min(...ys);
  return Math.max(w, h) / Math.min(w, h);
};

let wc = 0;
for (const [surface, bedrooms] of [[100, 3], [130, 4], [160, 4]]) {
  for (const seed of [4101, 4102, 4103, 4104]) {
    const plan = G.generatePlan({
      surface, bedrooms, bathrooms: 1, separateKitchen: false, includeWc: true, shape: 'rectangle'
    }, 1, seed);
    plan.rooms.filter((room) => room.type === 'wc').forEach((room) => {
      assert.ok(allongement(room) <= 3.0 + 0.05,
        `WC de ${surface} m² (graine ${seed}) : allongement ${allongement(room).toFixed(2)}`);
      wc += 1;
    });
  }
}
assert.ok(wc >= 8, 'le test doit exercer au moins huit WC');

console.log('Pièces de service : plafond d’allongement déclaré, ' + wc + ' WC vérifiés.');
