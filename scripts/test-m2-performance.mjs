import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
for (const file of ['fit.data.js', 'placement.js', 'contracts.js', 'construction.js',
  'typologie.js', 'squelette.js', 'generator.js']) {
  new Function(readFileSync(join(root, 'assets', file), 'utf8'))();
}

const durations = [];
const signatures = new Set();
for (let index = 0; index < 30; index += 1) {
  const start = performance.now();
  const plan = globalThis.TechnoHabGenerator.generatePlan({
    surface: 90, bedrooms: 3, bathrooms: 1,
    separateKitchen: true, includeWc: true, shape: 'rectangle'
  }, 1, 20260827 + index);
  durations.push(performance.now() - start);
  signatures.add(JSON.stringify(plan.rooms.map((room) => [room.id, room.parts])));
}

durations.sort((a, b) => a - b);
const mean = durations.reduce((sum, duration) => sum + duration, 0) / durations.length;
const p90 = durations[Math.ceil(durations.length * 0.9) - 1];
// C-P1.2b a fait entrer une table basse libre dans chaque verdict de séjour.
// M4c ajoute une tentative bornée avec gammes et optionnels, puis la cuisine
// C4 relève son côté court à 1,85 m. Le budget est relevé de 180 à 300 ms
// pour absorber les graines pathologiques ; l'ablation M4c appariée reste
// publiée avec la mesure de livraison pour ne
// pas attribuer au seul poseur ce qui vient aussi de la recherche de forme.
// Le p90 et le max restent publiés pour rendre visibles les graines pathologiques.
assert.ok(mean < 300, `moyenne ${mean.toFixed(1)} ms, budget 300 ms`);
assert.ok(signatures.size >= 20, `${signatures.size} signatures, minimum 20`);
console.log(`Performance M2 : moyenne ${mean.toFixed(1)} ms · p90 ${p90.toFixed(1)} ms · ` +
  `max ${durations.at(-1).toFixed(1)} ms · ${signatures.size}/30 signatures.`);
