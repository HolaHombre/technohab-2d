/* PONDERATION §3.4 — lumière, sur ce que le score peut réellement lire.
   Remplace le proxy binaire (le séjour touche-t-il le nord) par la longueur
   de façade obtenue par pièce principale. Ce test prouve :

     1. le critère est inerte hors mode `light` — c'est une préférence
        demandée, pas une déduction ;
     2. il pénalise une pièce principale à façade courte, pas une pièce à
        façade nulle seulement — sinon TH2D-FACADE-001 suffirait déjà ;
     3. une façade déjà généreuse ne coûte rien ;
     4. il reste borné sous le regroupement technique (§3.3) : une préférence
        explicitement choisie peut peser plus qu'une déduction implicite du
        moteur, mais jamais plus qu'une adjacence demandée. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const assets = join(dirname(fileURLToPath(import.meta.url)), '..', 'assets');
for (const file of [
  'canonical-values.data.js', 'canonical-values.js', 'fit.data.js', 'contracts.js',
  'construction.js', 'typologie.js', 'squelette.js', 'placement.js', 'generator.js', 'rules.js'
]) {
  vm.runInThisContext(fs.readFileSync(join(assets, file), 'utf8'));
}

const G = globalThis.TechnoHabGenerator;
const baseOptions = {
  surface: 90, bedrooms: 2, bathrooms: 1, separateKitchen: true,
  includeWc: true, shape: 'rectangle'
};
const program = (priority) => G.buildProgram(Object.assign({}, baseOptions, { priority }));
const envelope = { width: 20, height: 20, volumes: [{ x: 0, y: 0, width: 20, height: 20 }] };
const empty = [];
const room = (id, type, x0, y0, x1, y1) => ({ id, type, x0, y0, x1, y1 });

/* Un séjour dont un seul côté touche l'enveloppe, sur 1 m — en façade au
   sens de TH2D-FACADE-001 (contact non nul), mais court au sens de §3.4.
   Décalé de l'angle (5,0) plutôt que (0,0) : à l'angle, la pièce toucherait
   deux bords de l'enveloppe et cumulerait une façade largement suffisante —
   ce serait alors le test qui se tromperait, pas le critère. */
const facadeCourte = [room('living', 'living', 5, 0, 6, 1)];

/* Un séjour d'angle : deux côtés sur l'enveloppe, largement au-delà du
   seuil cumulé. */
const facadeGenereuse = [room('living', 'living', 0, 0, 3, 3)];

/* 1. Inerte hors mode light --------------------------------------------- */
const compact = G.scoreCandidateDetails(facadeCourte, empty, program('compact'), envelope);
assert.equal(compact.breakdown.lightPriority, undefined,
  'le critère ne doit rien coûter hors mode lumineux');

/* 2. Pénalise une façade courte en mode light ---------------------------- */
const light = G.scoreCandidateDetails(facadeCourte, empty, program('light'), envelope);
assert.ok(light.breakdown.lightPriority > 0,
  'une pièce principale à façade courte doit coûter en mode lumineux');

/* 3. Une façade généreuse ne coûte rien ---------------------------------- */
const genereux = G.scoreCandidateDetails(facadeGenereuse, empty, program('light'), envelope);
assert.equal(genereux.breakdown.lightPriority, undefined,
  'une façade déjà généreuse (deux côtés) ne doit porter aucun malus');

/* 4. Toujours sous le poids d'une adjacence de circulation demandée ------ */
const registry = globalThis.TechnoHabCanonicalValues;
const poidsLumiere = registry.get('VAL-SCORE-LIGHT-FACADE-SHORTFALL-WEIGHT-001').value;
const poidsFacadeCirculation = registry.get('VAL-CIRC-FACADE-EXCESS-WEIGHT-001').value;
assert.ok(poidsLumiere < poidsFacadeCirculation,
  'le poids de la préférence lumière doit rester sous celui d’une adjacence demandée');

console.log('PONDERATION §3.4 : lumière sur façade réelle, préférence inerte hors mode — OK '
  + '(courte=' + light.breakdown.lightPriority.toFixed(1) + ', généreuse=0)');
