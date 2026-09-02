// La largeur d'une circulation se mesure branche par branche.
//
// Préalable au chantier « forme libre de circulation ». Tant que la largeur
// se lisait sur la boîte englobante, deux règles dures se trompaient dès
// qu'un couloir se coudait — et dans les deux sens :
//
//   TH2D-CIRC-001  cessait de voir un couloir trop étroit  (faux négatif)
//   TH2D-CIRC-003  refusait tout couloir en L               (faux positif)
//
// Le défaut était latent : aucune circulation n'avait plusieurs parties. Ce
// test le rend visible avant qu'on produise des L, et il échouera si la
// mesure retourne un jour à la boîte englobante.
//
//   node technohab/scripts/test-circulation-coudee.mjs
import assert from 'node:assert/strict';
import fs from 'fs';
import vm from 'vm';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const A = join(dirname(fileURLToPath(import.meta.url)), '..', 'assets');
for (const f of ['fit.data.js', 'contracts.js', 'construction.js', 'typologie.js', 'squelette.js', 'generator.js', 'rules.js']) {
  vm.runInThisContext(fs.readFileSync(join(A, f), 'utf8'));
}
const R = globalThis.TechnoHabRules;

/* Un plan minimal, posé à la main : le contrôle porte sur la mesure, pas sur
   la génération.

   L'enveloppe suit l'aire de la pièce, faute de quoi `TH2D-RESERVE-001` —
   déclarée `prerequisite` — échoue et empêche toute autre règle d'être
   évaluée. Le premier jet de ce test l'ignorait et rendait zéro violation
   partout, ce qui aurait pu passer pour une réussite. */
function planAvec(circulation) {
  return {
    rooms: [circulation],
    edges: [], requestedEdges: [], portes: [],
    boundary: { width: 10, height: 10, area: circulation.area },
    minCirculationWidth: 0.9, crossingCirculationWidth: 1.2,
    circulationCrossingServices: 3, maxCirculationWidth: 1.8
  };
}
/* `TH2D-CIRC-003` est déclarée « limite connue » depuis le 15 août : ses
   signalements sont rangés dans `limites` et non dans `violations`. Son motif
   dit déjà où était la solution — « autoriser une cession partielle, ce qui
   suppose un couloir non rectangulaire ». On lit donc les deux listes. */
function verdicts(plan, id) {
  const rapport = R.evaluatePlan(plan);
  return [].concat(rapport.violations, rapport.limites || [])
    .filter((v) => v.ruleId === id);
}

/* --- 1. Un L de largeur correcte est accepté ------------------------------
   Deux branches de 1,40 m formant un L d'emprise 6 × 5. La boîte englobante
   dirait « 5 m de large » et `TH2D-CIRC-003` refuserait le plan. */
const coudeCorrect = planAvec({
  id: 'circulation', type: 'circulation', label: 'Circulation',
  area: 14.84, usableRect: { x0: 0, y0: 0, x1: 6, y1: 5 },
  parts: [
    { role: 'main', x0: 0, y0: 0, x1: 6, y1: 1.4 },
    { role: 'main', x0: 0, y0: 1.4, x1: 1.4, y1: 5 }
  ]
});
assert.deepEqual(verdicts(coudeCorrect, 'TH2D-CIRC-003'), [],
  'un couloir en L de 1,40 m ne doit pas être vu comme large de 5 m');
assert.deepEqual(verdicts(coudeCorrect, 'TH2D-CIRC-001'), [],
  'un couloir en L de 1,40 m est praticable');

/* --- 2. Une branche trop étroite est vue ----------------------------------
   La branche verticale tombe à 0,80 m. La boîte englobante ne le montrerait
   pas : c'est le faux négatif que la correction supprime. */
const coudeEtrangle = planAvec({
  id: 'circulation', type: 'circulation', label: 'Circulation',
  area: 11.28, usableRect: { x0: 0, y0: 0, x1: 6, y1: 5 },
  parts: [
    { role: 'main', x0: 0, y0: 0, x1: 6, y1: 1.4 },
    { role: 'main', x0: 0, y0: 1.4, x1: 0.8, y1: 5 }
  ]
});
const etroit = verdicts(coudeEtrangle, 'TH2D-CIRC-001');
assert.equal(etroit.length, 1, 'une branche de 0,80 m doit être signalée');
assert.ok(etroit[0].mesure < 1.2, 'la mesure doit être celle de la branche étroite, pas de la boîte');

/* --- 3. Une branche trop large reste signalée -----------------------------
   La correction ne doit pas rendre la règle aveugle dans l'autre sens : une
   branche de 2,40 m n'est plus un couloir. */
const coudeEnfle = planAvec({
  id: 'circulation', type: 'circulation', label: 'Circulation',
  area: 19.44, usableRect: { x0: 0, y0: 0, x1: 6, y1: 5 },
  parts: [
    { role: 'main', x0: 0, y0: 0, x1: 6, y1: 2.4 },
    { role: 'main', x0: 0, y0: 2.4, x1: 1.4, y1: 5 }
  ]
});
assert.equal(verdicts(coudeEnfle, 'TH2D-CIRC-003').length, 1,
  'une branche de 2,40 m doit rester signalée');

/* --- 4. Le cas rectangulaire est inchangé ---------------------------------
   La correction ne vaut rien si elle déplace le comportement sur les couloirs
   droits, qui sont tout ce que le moteur produit aujourd'hui. */
const barre = planAvec({
  id: 'circulation', type: 'circulation', label: 'Circulation',
  area: 7.2, usableRect: { x0: 0, y0: 0, x1: 6, y1: 1.2 },
  parts: [{ role: 'main', x0: 0, y0: 0, x1: 6, y1: 1.2 }]
});
assert.deepEqual(verdicts(barre, 'TH2D-CIRC-001'), [], 'une barre de 1,20 m passe');
assert.deepEqual(verdicts(barre, 'TH2D-CIRC-003'), [], 'une barre de 1,20 m n’est pas trop large');

const barreEtroite = planAvec({
  id: 'circulation', type: 'circulation', label: 'Circulation',
  area: 5.4, usableRect: { x0: 0, y0: 0, x1: 6, y1: 0.9 },
  parts: [{ role: 'main', x0: 0, y0: 0, x1: 6, y1: 0.9 }]
});
assert.deepEqual(verdicts(barreEtroite, 'TH2D-CIRC-001'), [],
  'une barre de 0,90 m à desserte simple est admise par C-P2');

console.log('circulation coudée : 4 cas, largeur mesurée branche par branche.');
