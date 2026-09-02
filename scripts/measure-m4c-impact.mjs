import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { performance } from 'node:perf_hooks';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const files = ['fit.data.js', 'placement.js', 'contracts.js', 'construction.js',
  'typologie.js', 'squelette.js', 'generator.js'];
const programs = [
  { surface: 90, bedrooms: 3, bathrooms: 1 },
  { surface: 130, bedrooms: 4, bathrooms: 1 },
  { surface: 180, bedrooms: 5, bathrooms: 2 }
].map((program) => ({
  ...program, separateKitchen: true, includeWc: true, shape: 'rectangle'
}));

function loadEngine(m4c) {
  const context = vm.createContext({ console, performance });
  for (const file of files) {
    let source = readFileSync(join(root, 'assets', file), 'utf8');
    if (file === 'generator.js' && !m4c) {
      source = source.replace(
        'var M4C_RESOLVED_TYPES = { living: true, bedroom: true };',
        'var M4C_RESOLVED_TYPES = {};'
      );
    }
    new vm.Script(source, { filename: file }).runInContext(context);
  }
  return context.TechnoHabGenerator;
}

function signature(plan) {
  return JSON.stringify(plan.rooms.map((room) => [room.id, room.parts]));
}

function measure(engine) {
  for (let index = 0; index < 3; index += 1) {
    engine.generatePlan(programs[index], 1, 20260820 + index);
  }
  const durations = [];
  const plans = [];
  for (let index = 0; index < 30; index += 1) {
    const start = performance.now();
    const plan = engine.generatePlan(programs[Math.floor(index / 10)], 1, 20260827 + index);
    durations.push(performance.now() - start);
    plans.push(plan);
  }
  durations.sort((a, b) => a - b);
  const manifests = plans.flatMap((plan) => plan.rooms)
    .map((room) => room.equipmentProgram).filter(Boolean);
  const placements = plans.flatMap((plan) => plan.rooms)
    .flatMap((room) => room.placements || []);
  return {
    meanMs: durations.reduce((sum, value) => sum + value, 0) / durations.length,
    p90Ms: durations[Math.ceil(durations.length * 0.9) - 1],
    maxMs: durations.at(-1),
    signatures: plans.map(signature),
    optionalPlacements: placements.filter((placement) => placement.required === false).length,
    sizedPlacements: placements.filter((placement) => placement.sizeId && placement.sizeId !== placement.equipmentId).length,
    fallbackRooms: manifests.filter((manifest) => manifest.fallback &&
      (manifest.fallback.sizeDowngraded || manifest.fallback.optionalRemoved)).length
  };
}

const baseline = measure(loadEngine(false));
const m4c = measure(loadEngine(true));
const changedTopologies = m4c.signatures.reduce((count, value, index) =>
  count + (value === baseline.signatures[index] ? 0 : 1), 0);
const round = (value) => Number(value.toFixed(1));
const result = {
  method: 'paired-process-v1, 3 warmups + 30 fixed seeds (10 × 90/130/180 m²) per arm',
  baseline: {
    meanMs: round(baseline.meanMs), p90Ms: round(baseline.p90Ms), maxMs: round(baseline.maxMs),
    optionalPlacements: baseline.optionalPlacements, sizedPlacements: baseline.sizedPlacements,
    fallbackRooms: baseline.fallbackRooms
  },
  m4c: {
    meanMs: round(m4c.meanMs), p90Ms: round(m4c.p90Ms), maxMs: round(m4c.maxMs),
    optionalPlacements: m4c.optionalPlacements, sizedPlacements: m4c.sizedPlacements,
    fallbackRooms: m4c.fallbackRooms
  },
  deltaMeanMs: round(m4c.meanMs - baseline.meanMs),
  changedTopologies
};

console.log(JSON.stringify(result, null, 2));
