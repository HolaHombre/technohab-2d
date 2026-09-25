/* PROGRAMME-BANDES étape 2 — la table est une donnée saine, et elle tient
   l'ancrage réglementaire. Lue par le moteur depuis l'étape 4. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
['canonical-values.data.js', 'canonical-values.js', 'programme-bandes.data.js'].forEach((file) => {
  new Function(readFileSync(join(root, 'assets', file), 'utf8'))();
});
const T = globalThis.TechnoHabProgrammeBandes;
const V = globalThis.TechnoHabCanonicalValues;

assert.equal(T.consumedByEngine, true, 'lue par le moteur depuis l’étape 4 : le dire tant que c’est vrai');
assert.deepEqual(T.bands, [...T.bands].sort((a, b) => a - b), 'bandes croissantes');
assert.equal(T.bands[0], T.minimumSurface, 'la première bande est la surface minimale visée (12 m²)');
Object.entries(T.rooms).forEach(([id, room]) => {
  assert.equal(room.values.length, T.bands.length, id + ' : une cellule par bande');
  room.values.forEach((v) => assert.ok(v === null || (Number.isFinite(v) && v > 0), id + ' : valeur positive ou vide'));
});

/* Marches : la valeur d'une bande vaut jusqu'à la suivante. */
assert.equal(T.target('sejour', 12), 9);
assert.equal(T.target('sejour', 34), 9, 'entre 25 et 35 m², la valeur de la bande 25');
assert.equal(T.target('sejour', 35), 15);
assert.equal(T.target('sejour', 250), 20, 'au-delà de 80 m², la dernière valeur');
assert.equal(T.target('chambre', 15), null, 'chambre non définie sous 20 m²');
assert.equal(T.target('garage', 79), null, 'garage non défini avant 80 m²');
assert.equal(T.target('garage', 80), 15);
assert.equal(T.target('inconnue', 50), null);

/* Déblocages annoncés. */
assert.equal(T.unlocked('wc_separe', 24), false);
assert.equal(T.unlocked('wc_separe', 25), true);
assert.equal(T.unlocked('salle_a_manger_separee', 34), false);
assert.equal(T.unlocked('salle_a_manger_separee', 35), true);

/* Ancrage réglementaire : à chaque bande, au moins une pièce principale atteint
   la surface minimale du décret 2002-120 (art. 4). */
const regulatory = V.get('VAL-REG-MAIN-ROOM-AREA-MIN-001');
assert.equal(regulatory.source.kind, 'regulatory');
assert.equal(regulatory.status, 'ADOPTED');
T.bands.forEach((band) => {
  const principals = ['sejour', 'chambre'].map((id) => T.target(id, band)).filter((v) => v !== null);
  assert.ok(Math.max(...principals) >= regulatory.value,
    band + ' m² : aucune pièce principale n’atteint ' + regulatory.value + ' m²');
});

/* Salle de bain : séparer le WC coûte de la place, c'est une règle et non un accident. */
assert.ok(T.target('salle_de_bain_sans_wc', 25) + T.target('wc', 25) > T.target('salle_de_bain_totale', 25));

console.log('Programme par bandes : ' + Object.keys(T.rooms).length + ' pièces × ' + T.bands.length +
  ' bandes, marches et déblocages vérifiés, ancrage réglementaire tenu.');
