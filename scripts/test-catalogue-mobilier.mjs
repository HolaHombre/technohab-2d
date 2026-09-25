/* Registre du mobilier (assets/catalogue.data.js).
   Il ne pilote rien : ce test garde son inventaire cohérent avec le socle, pour
   que la page « Équipements & pièces » ne mente ni par omission ni par doublon. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const load = (name) => new Function(readFileSync(join(root, 'assets', name), 'utf8'))();
load('socle.data.js');
load('catalogue.data.js');
const socle = globalThis.TechnoHabSocle;
const registre = globalThis.TechnoHabCatalogue;

const idsSocle = new Set();
Object.values(socle.rooms).forEach((room) => (room.equipments || []).forEach((e) => idsSocle.add(e.id)));

const statuts = new Set(registre.statuts.map((s) => s.id));
const rubriques = new Set(registre.rubriques.map((r) => r.id));
const vus = new Set();
const references = new Set();
const ZONES = new Set(['portee', 'specifiee', 'absente', 'sans-objet']);

registre.entrees.forEach((entree) => {
  assert.ok(!vus.has(entree.id), `identifiant en double : ${entree.id}`);
  vus.add(entree.id);
  assert.ok(entree.label, `${entree.id} : libellé absent`);
  assert.ok(statuts.has(entree.statut), `${entree.id} : statut inconnu « ${entree.statut} »`);
  assert.ok(entree.rubriques.length > 0, `${entree.id} : aucune rubrique`);
  entree.rubriques.forEach((r) => assert.ok(rubriques.has(r), `${entree.id} : rubrique inconnue « ${r} »`));
  if (entree.zone) assert.ok(ZONES.has(entree.zone), `${entree.id} : zone inconnue « ${entree.zone} »`);

  (entree.moteur || []).forEach((id) => {
    assert.ok(idsSocle.has(id), `${entree.id} : « ${id} » n'existe pas au socle`);
    references.add(id);
  });
  // Un équipement du socle porte sa cote : la redoubler créerait une seconde vérité.
  if (entree.moteur) assert.ok(!entree.dims, `${entree.id} : cote redoublée, elle se lit du socle`);
  if (entree.dims) assert.equal(entree.dims.niveau, 'N3', `${entree.id} : une cote hors socle est une convention N3`);

  if (entree.statut === 'implemente' || entree.statut === 'partiel') {
    assert.ok(entree.moteur && entree.moteur.length, `${entree.id} : « ${entree.statut} » sans équipement du socle`);
  }
  if (entree.statut === 'manquant') assert.ok(!entree.moteur, `${entree.id} : manquant mais lié au socle`);
  if (entree.statut === 'ecarte') assert.ok(entree.note, `${entree.id} : un écart sans motif n'est pas un choix`);
  if (entree.statut === 'ecarte') assert.ok(!entree.moteur, `${entree.id} : écarté mais lié au socle`);
});

// Invariant de visibilité : rien de ce que le moteur sert ne peut manquer à la page.
idsSocle.forEach((id) => assert.ok(references.has(id), `équipement du socle absent du registre : ${id}`));

const par = registre.entrees.reduce((acc, e) => (acc[e.statut] = (acc[e.statut] || 0) + 1, acc), {});
console.log(`Registre du mobilier : ${registre.entrees.length} types, ${idsSocle.size} équipements du socle tous référencés — ` +
  registre.statuts.map((s) => `${s.court} ${par[s.id] || 0}`).join(', ') + '.');
