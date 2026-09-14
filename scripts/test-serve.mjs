#!/usr/bin/env node

import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import path from 'node:path';
import { setTimeout as attendre } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const port = 18124;
const serveur = spawn(process.execPath, ['scripts/serve.mjs', String(port)], {
  cwd: root,
  stdio: ['ignore', 'ignore', 'pipe'],
});
let erreur = '';
serveur.stderr.on('data', (morceau) => { erreur += morceau; });

try {
  let charge = null;
  for (let tentative = 0; tentative < 20 && charge === null; tentative += 1) {
    await attendre(100);
    try {
      const reponse = await fetch(`http://127.0.0.1:${port}/api/status`);
      if (reponse.ok) charge = await reponse.json();
    } catch {
      // Le port peut ne pas encore écouter ; la boucle reste bornée à 2 s.
    }
  }
  assert.ok(charge, `La sonde locale ne répond pas. ${erreur}`);
  assert.deepEqual(charge, {
    project: 'TechnoHab',
    service: 'local-preview',
    port,
  });
  console.log('Serveur local : contrat /api/status vérifié.');
} finally {
  serveur.kill('SIGTERM');
  await Promise.race([once(serveur, 'exit'), attendre(2000)]);
}

