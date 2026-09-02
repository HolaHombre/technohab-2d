/* Porte A — une seule commande pour tests, schéma, instrument O0 et banc fixe. */
import { readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const scripts = join(root, 'scripts');
const tests = readdirSync(scripts)
  .filter((file) => /^test-.*\.mjs$/.test(file))
  .sort()
  .map((file) => join(scripts, file));

const stages = [
  ...tests.map((file) => ({ label: file.slice(scripts.length + 1), args: [file] })),
  {
    label: 'instrument O0',
    args: [join(scripts, 'measure-o0.mjs'), '--check', join(scripts, 'references', 'O0_REFERENCE.json')]
  },
  {
    label: 'banc M3.0 circulation',
    args: [join(scripts, 'measure-m3-circulation.mjs'), '--check',
      join(scripts, 'references', 'M3_CIRCULATION_REFERENCE.json')]
  },
  {
    label: 'banc M3 topologies',
    args: [join(scripts, 'measure-m3-topologies.mjs'), '--check',
      join(scripts, 'references', 'M3_TOPOLOGIES_REFERENCE.json')]
  },
  {
    label: 'banc fixe de 360 plans',
    args: [join(scripts, 'scan-seeds.mjs'), '--check', join(scripts, 'references', 'M0_BENCHMARK.json')]
  }
];

const started = Date.now();
for (const [index, stage] of stages.entries()) {
  console.log('\n[' + (index + 1) + '/' + stages.length + '] ' + stage.label);
  const result = spawnSync(process.execPath, stage.args, { cwd: root, stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status || 1);
}

console.log('\nPorte A validée : ' + tests.length + ' tests ciblés (' + stages.length +
  ' étapes), schéma 3.1, O0, 19 plans M3.0, 48 plans M3 et 360 tentatives conformes (' +
  ((Date.now() - started) / 1000).toFixed(1) + ' s).');
