/* Audit M5 — complétude et diversité de la tri-sélection publique. */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
['canonical-values.data.js', 'canonical-values.js', 'fit.data.js', 'placement.js',
  'contracts.js', 'construction.js', 'typologie.js', 'squelette.js',
  'generator.js', 'rules.js'].forEach((file) => {
  new Function(readFileSync(join(root, 'assets', file), 'utf8'))();
});

const G = globalThis.TechnoHabGenerator;
const surfaces = [90, 130, 180, 250];
const selectionsPerSurface = 3;
const result = {
  measuredAt: '2026-08-30',
  method: '4 surfaces × 3 demandes · 12 tentatives maximum par tri-sélection',
  requestedSelections: surfaces.length * selectionsPerSurface,
  completeSelections: 0,
  partialSelections: 0,
  emptySelections: 0,
  plans: 0,
  invalidPlans: 0,
  duplicateSelections: 0,
  selectionsWithMultipleFamilies: 0,
  selectionsWithMultipleStrategies: 0,
  families: {},
  strategies: {},
  rejected: {}
};
const increment = (record, key, amount = 1) => { record[key] = (record[key] || 0) + amount; };

for (const surface of surfaces) {
  for (let variant = 0; variant < selectionsPerSurface; variant += 1) {
    const options = {
      surface,
      bedrooms: surface < 120 ? 3 : surface < 160 ? 4 : 5,
      bathrooms: surface >= 130 ? 2 : 1,
      separateKitchen: variant % 2 === 0,
      includeWc: true,
      priority: ['compact', 'light', 'economy'][variant],
      shape: 'rectangle'
    };
    const seed = (20260830 + Math.imul(surface, 0x9E3779B1) + variant) >>> 0;
    const selection = G.generateSelection(options, variant, seed, 3);
    increment(result, selection.status === 'COMPLETE' ? 'completeSelections'
      : selection.status === 'PARTIAL' ? 'partialSelections' : 'emptySelections');
    result.plans += selection.results.length;
    if (new Set(selection.results.map((entry) => entry.builtPlan.plan.comparison.signature)).size !==
        selection.results.length) result.duplicateSelections += 1;
    if (selection.diversity.families.length > 1) result.selectionsWithMultipleFamilies += 1;
    if (selection.diversity.strategies.length > 1) result.selectionsWithMultipleStrategies += 1;
    selection.results.forEach((entry) => {
      if (entry.status !== 'VALID' || entry.verdict.hard) result.invalidPlans += 1;
      increment(result.families, entry.builtPlan.plan.topologyFamily);
      increment(result.strategies, entry.builtPlan.plan.topologyStrategy);
    });
    Object.entries(selection.rejected).forEach(([key, count]) => increment(result.rejected, key, count));
  }
}

console.log(JSON.stringify(result, null, 2));
