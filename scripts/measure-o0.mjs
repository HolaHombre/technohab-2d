/* O0 — instrument versionné du constat ROADMAP §9.1.

   Il mesure la pièce qui absorbe le résidu (le WC), les formes subies et le
   budget réellement consommé sur trente graines fixes. Les durées restent
   affichées mais sont exclues de la photographie : elles caractérisent la
   machine, pas le moteur. */
import fs from 'node:fs';
import vm from 'node:vm';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
for (const file of ['fit.data.js', 'placement.js', 'contracts.js', 'construction.js', 'typologie.js', 'squelette.js', 'generator.js', 'rules.js']) {
  let source = fs.readFileSync(join(root, 'assets', file), 'utf8');
  if (file === 'generator.js') {
    source = source.replaceAll('s4: true', 's4: false')
      .replace("passes: false, method: 'chamfer-grid-v1'", "passes: true, method: 'chamfer-grid-v1'");
  }
  vm.runInThisContext(source);
}
/* Témoin O0 : attribuer les mouvements à l'allocation, pas à la pose D4
   ajoutée plus tard par M4a. L'audit M4a exerce séparément ces symétries. */
globalThis.TechnoHabSquelette.transformations = (pose) => [Object.assign({}, pose, {
  transformation: 'r0', equivalenceClass: 'witness-o0-r0'
})];
globalThis.TechnoHabAblations = {
  disableM4a2FacadeCost: true,
  disableM4a2InteriorTerminations: true,
  disableM5BranchUtility: true
};

const generator = globalThis.TechnoHabGenerator;
const SEEDS = [
  0x1F2E3D4C, 0x7A9B0C1D, 0x2468ACE0, 0xDEADBEEF, 0x0BADF00D,
  0x5EED1234, 0xA1B2C3D4, 0x13579BDF, 0xC0FFEE11, 0x8BADF00D,
  0x00FF00FF, 0x9E3779B9, 0x6D2B79F5, 0x3C3C3C3C, 0xFEEDFACE,
  0x10203040, 0x55667788, 0xCAFEBABE, 0x31415926, 0x27182818,
  0xABCDEF01, 0x12345678, 0x87654321, 0x42424242, 0xB16B00B5,
  0xD15EA5E0, 0x600DCAFE, 0xF00DBAAD, 0x89ABCDEF, 0x76543210
].map((seed) => seed >>> 0);

const CASES = [
  { surface: 45, bedrooms: 1, bathrooms: 1 },
  { surface: 90, bedrooms: 3, bathrooms: 1 },
  { surface: 250, bedrooms: 5, bathrooms: 1 }
];
const round = (value, digits = 3) => Number(value.toFixed(digits));
const mean = (values) => values.reduce((sum, value) => sum + value, 0) / values.length;
function generateWithRetry(options, variant, baseSeed) {
  for (let retry = 0; retry < 1; retry += 1) {
    const seed = (baseSeed + Math.imul(retry, 0x9E3779B1)) >>> 0;
    try {
      return { plan: generator.generatePlan(options, variant + retry, seed), seed, attempts: retry + 1 };
    } catch (error) {
      if (!error || error.code !== 'NON_TROUVE') throw error;
    }
  }
  return null;
}

const rows = CASES.map((entry) => {
  const options = {
    ...entry, separateKitchen: true, includeWc: true,
    priority: 'compact', shape: 'rectangle'
  };
  const program = generator.buildProgram(options);
  const wcProgram = program.rooms.find((room) => room.id === 'wc');
  const samples = SEEDS.map((seed, index) => {
    const started = process.hrtime.bigint();
    const generated = generateWithRetry(options, index + 1, seed);
    const milliseconds = Number(process.hrtime.bigint() - started) / 1e6;
    if (!generated) return { seed, milliseconds, attempts: 1, failure: true };
    const plan = generated.plan;
    const wc = plan.rooms.find((room) => room.id === 'wc');
    const rectangle = wc.usableRect;
    const width = rectangle.x1 - rectangle.x0;
    const height = rectangle.y1 - rectangle.y0;
    return {
      seed: generated.seed, milliseconds, attempts: generated.attempts, area: wc.usableArea,
      nonRect: wc.edgeCount > 4,
      shortSide: Math.min(width, height),
      longSide: Math.max(width, height),
      candidate: plan.candidate
    };
  });
  const valid = samples.filter((sample) => !sample.failure);
  const worst = valid.length
    ? valid.reduce((current, sample) => sample.area > current.area ? sample : current)
    : null;
  return {
    surface: entry.surface,
    programmedArea: round(wcProgram.targetArea),
    generated: valid.length,
    nonFound: samples.length - valid.length,
    meanArea: valid.length ? round(mean(valid.map((sample) => sample.area))) : null,
    maxArea: worst ? round(worst.area) : null,
    nonRect: valid.filter((sample) => sample.nonRect).length,
    worstSeed: worst ? worst.seed : null,
    worstUsable: worst ? [round(worst.shortSide), round(worst.longSide)] : null,
    candidates: valid.length ? [
      Math.min(...valid.map((sample) => sample.candidate)),
      Math.max(...valid.map((sample) => sample.candidate))
    ] : null,
    retries: samples.reduce((sum, sample) => sum + sample.attempts - 1, 0),
    meanMilliseconds: round(mean(samples.map((sample) => sample.milliseconds)), 1)
  };
});

console.log('=== O0 — ALLOCATION ET QUALITÉ D’USAGE, 30 GRAINES FIXES ===');
console.log('surface | WC programmé | WC moyen / max | non rect. | pire rectangle utile | candidats | ms');
for (const row of rows) {
  console.log(
    String(row.surface).padStart(7) + ' | ' +
    row.programmedArea.toFixed(2).padStart(12) + ' | ' +
    (row.meanArea === null ? '—' : row.meanArea.toFixed(2) + ' / ' + row.maxArea.toFixed(2)).padStart(14) + ' | ' +
    (row.nonRect + '/' + row.generated).padStart(9) + ' | ' +
    (row.worstUsable ? row.worstUsable[0].toFixed(2) + ' × ' + row.worstUsable[1].toFixed(2) : '—').padStart(21) + ' | ' +
    (row.candidates ? row.candidates[0] + '..' + row.candidates[1] : '—').padStart(10) + ' | ' +
    row.meanMilliseconds.toFixed(1).padStart(4)
  );
}

const snapshot = {
  format: 'technohab-o0-reference-v1',
  seeds: SEEDS.length,
  rows: rows.map(({ meanMilliseconds, ...stable }) => stable)
};
if (process.argv.includes('--snapshot')) console.log('\nO0_SNAPSHOT=' + JSON.stringify(snapshot, null, 2));

const checkFlag = process.argv.indexOf('--check');
if (checkFlag !== -1) {
  const referencePath = process.argv[checkFlag + 1];
  if (!referencePath) throw new Error('--check attend le chemin de la référence O0.');
  const reference = JSON.parse(fs.readFileSync(referencePath, 'utf8'));
  if (JSON.stringify(snapshot) !== JSON.stringify(reference)) {
    console.error('\nRéférence O0 différente. Actuel :\n' + JSON.stringify(snapshot, null, 2));
    process.exitCode = 1;
  } else {
    console.log('\nRéférence O0 conforme à ' + referencePath + '.');
  }
}
