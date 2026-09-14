#!/usr/bin/env node
// Recopie les sprites SVG de TechnoHab dans index.html.
//
// Le sprite doit être inline : `<use href="fichier.svg#id">` ne résout pas en
// file://, et le site reste consultable sans serveur (AGENTS.md § 2). Le fichier
// SVG reste la source de vérité éditable ; ce script propage, il ne génère pas.
//
// Usage : node scripts/inline-sprite.mjs [--check]

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const pagePath = join(root, 'index.html');
const sources = [
  { name: 'furniture', file: 'furniture.svg' },
  { name: 'room-icons', file: 'room-icons.svg' }
];

let next = await readFile(pagePath, 'utf8');
let total = 0;
for (const source of sources) {
  const spritePath = join(root, 'assets', 'icons', source.file);
  const open = `    <!-- ${source.name}:start — généré depuis assets/icons/${source.file}, ne pas éditer ici -->`;
  const close = `    <!-- ${source.name}:end -->`;
  const sprite = (await readFile(spritePath, 'utf8')).trim()
    .split('\n')
    .map((line) => (line ? `    ${line}` : line))
    .join('\n');
  const start = next.indexOf(open);
  const end = next.indexOf(close);
  if (start === -1 || end === -1) {
    console.error(`Marqueurs ${source.name} absents de ${pagePath}`);
    process.exit(1);
  }
  next = next.slice(0, start) + open + '\n' + sprite + '\n' + next.slice(end);
  total += (sprite.match(/<symbol /g) || []).length;
}

const page = await readFile(pagePath, 'utf8');

if (process.argv.includes('--check')) {
  if (next !== page) {
    console.error('index.html ne reflète pas room-icons.svg — relancer sans --check.');
    process.exit(1);
  }
  console.log('Sprites à jour.');
} else {
  await writeFile(pagePath, next, 'utf8');
  console.log(`${total} symboles injectés dans index.html`);
}
