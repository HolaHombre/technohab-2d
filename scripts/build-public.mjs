import { cp, mkdir, readdir, rm, stat } from 'node:fs/promises';
import { dirname, extname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../', import.meta.url));
const OUTPUT = join(ROOT, 'dist-public');

// Frontière publique à défaut fermé : un fichier n'est servi que s'il est nommé
// ici. Le moteur est un site statique sans dépendance d'exécution ; ce qui sort
// du dépôt est donc exactement la page et ses scripts classiques. Restent hors
// ligne les 41 Mo du jeu de plans de référence, les documents de doctrine, les
// profils, les scripts de mesure et l'historique Git.
const ROOT_FILES = [
  'index.html',
  '_headers',
];

const PUBLIC_TREES = new Map([
  ['assets', new Set(['.js', '.css'])],
]);

async function copyFile(path) {
  const source = join(ROOT, path);
  const destination = join(OUTPUT, path);
  await mkdir(dirname(destination), { recursive: true });
  await cp(source, destination);
}

async function copyTree(directory, extensions) {
  const base = join(ROOT, directory);
  const entries = await readdir(base, { recursive: true, withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isFile() || entry.name.startsWith('.')) continue;
    const sourcePath = join(entry.parentPath, entry.name);
    if (!extensions.has(extname(entry.name).toLowerCase())) continue;
    const path = join(directory, relative(base, sourcePath));
    await copyFile(path);
  }
}

await rm(OUTPUT, { recursive: true, force: true });
await mkdir(OUTPUT, { recursive: true });

for (const file of ROOT_FILES) {
  const info = await stat(join(ROOT, file));
  if (!info.isFile()) throw new Error(`Fichier public absent : ${file}`);
  await copyFile(file);
}

for (const [directory, extensions] of PUBLIC_TREES) {
  await copyTree(directory, extensions);
}

const built = await readdir(OUTPUT, { recursive: true });
console.log(`Artefact public construit : ${built.length} entrées dans dist-public/`);
