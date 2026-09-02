/* D1 — l'entrée est un critère de sélection, pas une conclusion.
   Elle était posée après coup sur le candidat déjà retenu : rien ne poussait
   une pièce éligible vers l'enveloppe. Voir ROADMAP.md §5.1. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
['canonical-values.data.js', 'canonical-values.js', 'fit.data.js', 'contracts.js',
  'construction.js', 'typologie.js', 'squelette.js', 'generator.js',
  'socle.data.js', 'room-model.js', 'placement.js', 'rules.js'].forEach(function (file) {
  new Function(readFileSync(join(root, 'assets', file), 'utf8'))();
});

const generator = globalThis.TechnoHabGenerator;
const rules = globalThis.TechnoHabRules;
const contracts = globalThis.TechnoHabContracts;

assert.equal(contracts.profiles.entry.maturity, 'C4');

const CONFIGS = [
  [35, 0, 1, false, false], [45, 1, 1, true, true], [60, 2, 1, false, false],
  [75, 2, 1, false, true], [90, 3, 1, false, true], [110, 3, 1, true, true],
  [150, 5, 1, true, true], [220, 5, 2, true, true]
];

/* 1. Tout plan produit possède une entrée, et elle tient un vantail -------- */

const hotes = {};
let plans = 0;
let nonTrouves = 0;
CONFIGS.forEach(([surface, bedrooms, bathrooms, separateKitchen, includeWc], index) => {
  let succesConfiguration = 0;
  for (let variante = 0; variante < 12; variante += 1) {
    let plan;
    try {
      plan = generator.generatePlan(
        { surface, bedrooms, bathrooms, separateKitchen, includeWc, priority: 'compact' },
        variante, (index * 8191 + variante * 131 + 5000) >>> 0);
    } catch (error) {
      assert.equal(error.code, 'NON_TROUVE', 'seul l’épuisement honnête des candidats est admis');
      nonTrouves += 1;
      continue;
    }
    plans += 1;
    succesConfiguration += 1;
    assert.ok(plan.entree, 'chaque plan doit recevoir une entrée depuis l’extérieur');
    assert.ok(plan.entree.mur + 0.005 >= plan.entree.largeur,
      'la façade d’accueil doit pouvoir porter le vantail d’entrée');
    const accueil = plan.rooms.find((room) => (plan.entree.entre || []).includes(room.id));
    assert.ok(accueil, 'l’entrée désigne une pièce du plan');
    assert.ok(!['bedroom', 'bath', 'wc'].includes(accueil.type),
      'une chambre ou une pièce d’eau ne peut pas être le seuil du logement');
    assert.ok(plan.entree.arrivalZone, 'le seuil doit réserver une zone d’arrivée');
    const zone = plan.entree.arrivalZone;
    assert.ok(Math.abs(zone.x1 - zone.x0) >= 1.195 && Math.abs(zone.y1 - zone.y0) >= 1.195,
      'la zone d’arrivée doit mesurer 1,20 × 1,20 m');
    const entreeReport = rules.evaluatePlan(plan);
    assert.equal(entreeReport.violations.filter((violation) =>
      violation.ruleId === 'TH2D-ENTREE-001' || violation.ruleId === 'TH2D-ENTREE-002').length, 0,
    'l’entrée construite doit satisfaire accès et arrivée libre');
    hotes[accueil.type] = (hotes[accueil.type] || 0) + 1;
  }
  assert.ok(succesConfiguration >= 2,
    'la zone d’arrivée ne doit pas éliminer entièrement une classe de programme');
});
assert.ok(plans >= CONFIGS.length * 12 * 0.8,
  'au moins 80 % du corpus doit rester générable après réservation de l’arrivée');

/* 2. L'entrée arrive sur les hôtes préférés ------------------------------- */

const prefere = (hotes.circulation || 0) + (hotes.entree || 0);
assert.ok(prefere >= plans * 0.35,
  'la circulation doit accueillir l’entrée dans une part notable des plans, mesuré à ' +
  Math.round((100 * prefere) / plans) + ' %');
assert.equal(hotes.kitchen || 0, 0,
  'la cuisine ne doit plus recevoir l’entrée quand un meilleur hôte existe');

/* 3. La règle refuse un plan sans accès ----------------------------------- */

const regle = rules.rules.find((entry) => entry.id === 'TH2D-ENTREE-001');
const regleArrivee = rules.rules.find((entry) => entry.id === 'TH2D-ENTREE-002');
assert.ok(regle, 'TH2D-ENTREE-001 doit exister');
assert.equal(regle.level, 'HARD', 'un logement sans accès n’est pas un conseil, c’est un refus');
assert.equal(regle.evaluate({ rooms: [], entree: null }).length, 1,
  'un plan sans entrée doit être signalé');
assert.equal(
  regle.evaluate({
    rooms: [{ id: 'living', label: 'Séjour' }],
    entree: { entre: ['living', 'exterior'], largeur: 0.9, mur: 0.7 }
  }).length, 1, 'une façade trop courte pour le vantail doit être signalée');
assert.equal(
  regle.evaluate({
    rooms: [{ id: 'living', label: 'Séjour' }],
    entree: { entre: ['living', 'exterior'], largeur: 0.9, mur: 2.4 }
  }).length, 0, 'une façade suffisante ne déclenche rien');

assert.equal(regleArrivee.level, 'HARD');
assert.equal(regleArrivee.evaluate({
  rooms: [{ id: 'living', label: 'Séjour', placements: [], usableBounds: { x0: 0, y0: 0, x1: 4, y1: 4 } }],
  entree: { entre: ['living', 'exterior'] }
}).length, 1, 'une entrée sans zone d’arrivée doit être refusée');
assert.equal(regleArrivee.evaluate({
  rooms: [{
    id: 'living', label: 'Séjour', usableBounds: { x0: 0, y0: 0, x1: 4, y1: 4 },
    placements: [{ equipmentId: 'sofa', label: 'Canapé', footprint: { x0: 0.4, y0: 0.4, x1: 1.4, y1: 1.2 } }]
  }],
  entree: { entre: ['living', 'exterior'], arrivalZone: { x0: 0, y0: 0, x1: 1.2, y1: 1.2 } }
}).length, 1, 'un meuble dans la zone d’arrivée doit être refusé');

console.log('Entrée C4 : ' + plans + ' plans valides, ' + nonTrouves +
  ' NON_TROUVE honnêtes ; hôtes ' + JSON.stringify(hotes) + '.');
