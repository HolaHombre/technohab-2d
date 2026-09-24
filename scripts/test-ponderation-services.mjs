/* PONDERATION §3.3 — regroupement technique. Spécifié en préférence par
   PLACEMENT_ET_ADJACENCES.md §2.4, jamais implémenté avant ce chantier :
   « les pièces partageant un réseau gagnent à se toucher ». Ce test prouve
   trois choses, dans l'ordre où elles peuvent se tromper :

     1. le critère existe et pèse dans le score, comme les autres postes ;
     2. il croît avec l'écart réel au seuil, pas avec la distance brute —
        deux pièces déjà groupées ne se disputent pas un mètre de plus ;
     3. il reste une PRÉFÉRENCE : jamais assez lourd pour l'emporter sur une
        adjacence demandée (`circulationLength`) à écart comparable, sans
        quoi une préférence deviendrait un blocage déguisé — exactement ce
        que `PLACEMENT_ET_ADJACENCES.md` §2.4 interdit. */
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
const options = {
  surface: 90, bedrooms: 2, bathrooms: 1, separateKitchen: true,
  includeWc: true, priority: 'compact', shape: 'rectangle'
};
const program = G.buildProgram(options);
const envelope = { width: 20, height: 20, volumes: [{ x: 0, y: 0, width: 20, height: 20 }] };
const empty = [];

const room = (id, type, x0, y0, x1, y1) => ({ id, type, x0, y0, x1, y1 });

/* 1. Deux pièces humides déjà groupées (mur commun) ne coûtent rien -------- */
const groupees = [
  room('kitchen', 'kitchen', 0, 0, 3, 3),
  room('bath_1', 'bath', 3, 0, 6, 3)
];
const scoreGroupe = G.scoreCandidateDetails(groupees, empty, program, envelope);
assert.equal(scoreGroupe.breakdown.servicesProximity, undefined,
  'deux pièces humides mur commun ne doivent porter aucun malus');

/* 2. Deux pièces humides éloignées coûtent, et l'écart croît avec la
      distance réelle — pas un forfait fixe dès qu'elles se séparent. ------- */
const proches = [
  room('kitchen', 'kitchen', 0, 0, 3, 3),
  room('bath_1', 'bath', 5, 0, 8, 3)
];
const scoreProche = G.scoreCandidateDetails(proches, empty, program, envelope);
assert.ok(scoreProche.breakdown.servicesProximity > 0,
  'deux pièces humides au-delà du seuil doivent porter un malus');

const loin = [
  room('kitchen', 'kitchen', 0, 0, 3, 3),
  room('bath_1', 'bath', 15, 15, 18, 18)
];
const scoreLoin = G.scoreCandidateDetails(loin, empty, program, envelope);
assert.ok(scoreLoin.breakdown.servicesProximity > scoreProche.breakdown.servicesProximity,
  'éloigner encore les deux pièces doit encore alourdir le malus');

/* 3. Une pièce sèche adjacente à une pièce humide ne compte pas ------------ */
const seche = [
  room('kitchen', 'kitchen', 0, 0, 3, 3),
  room('bedroom_1', 'bedroom', 15, 15, 18, 18)
];
const scoreSeche = G.scoreCandidateDetails(seche, empty, program, envelope);
assert.equal(scoreSeche.breakdown.servicesProximity, undefined,
  'une chambre éloignée de la cuisine n’est pas une pièce humide : aucun critère de ce nom');

/* 4. Trois pièces humides comptent chaque paire, pas seulement des voisines
      immédiates — c'est ce que « gagnent à se toucher » veut dire au pluriel. */
const trois = [
  room('kitchen', 'kitchen', 0, 0, 3, 3),
  room('bath_1', 'bath', 15, 0, 18, 3),
  room('wc', 'wc', 0, 15, 2, 17)
];
const scoreTrois = G.scoreCandidateDetails(trois, empty, program, envelope);
assert.ok(scoreTrois.breakdown.servicesProximity > scoreLoin.breakdown.servicesProximity,
  'trois pièces humides doivent cumuler leurs trois paires, pas retenir la pire seule');

/* 5. Reste une préférence : mesuré sur un écart de distance égal, elle ne
      doit jamais dépasser une adjacence explicitement demandée. Comparaison
      au poids déjà canonique de la façade de circulation (18 pts/m), qui
      sert de repère : `PLACEMENT_ET_ADJACENCES.md` §2.4 range ce critère
      sous une adjacence obligatoire, jamais au-dessus. ---------------------- */
const registry = globalThis.TechnoHabCanonicalValues;
const poidsServices = registry.get('VAL-SCORE-SERVICES-DISTANCE-EXCESS-WEIGHT-001').value;
const poidsFacadeCirculation = registry.get('VAL-CIRC-FACADE-EXCESS-WEIGHT-001').value;
assert.ok(poidsServices < poidsFacadeCirculation,
  'le poids du regroupement technique doit rester sous celui d’une adjacence de circulation');

console.log('PONDERATION §3.3 : regroupement technique câblé, préférence bornée — OK '
  + '(groupé=0, proche=' + scoreProche.breakdown.servicesProximity.toFixed(1)
  + ', loin=' + scoreLoin.breakdown.servicesProximity.toFixed(1)
  + ', trois pièces=' + scoreTrois.breakdown.servicesProximity.toFixed(1) + ')');
