// Chantier 9 — l'échec de desserte est-il heuristique, ou géométrique ?
//
// La distinction commande le choix de méthode. Si le couloir avait la
// longueur nécessaire et que la découpe n'a pas su en profiter, changer de
// méthode de découpe suffit. S'il ne l'avait pas, c'est l'allocation de
// surface qui est en cause et aucune typologie n'y changera rien.
//
// ---
//
// Au passage, une clarification qui change le cadre théorique. Le dual
// rectangulaire (APPROCHES_GENERATION.md §2.C) cherche une partition dont le
// graphe d'adjacence est **exactement** le graphe donné. Ce n'est pas ce dont
// ce projet a besoin, et c'est heureux : dans un couloir desservant, deux
// chambres voisines partagent forcément un mur, donc le graphe réalisé
// contient toujours strictement plus que l'étoile demandée. Exiger l'égalité
// rendrait le problème insoluble dès quatre ou cinq pièces.
//
// Ce que le moteur exige réellement est un **sur-graphe** : toute arête
// demandée est réalisée, les autres sont tolérées. Pour une étoile, cela se
// réduit à une condition de capacité, vérifiable par le calcul :
//
//     longueur de bordure offerte par le couloir  >=  somme des dessertes dues
//
// La capacité retenue ici est optimiste — les deux grands côtés du couloir,
// sans déduire ni les façades ni les angles. Une infaisabilité constatée
// sous une borne optimiste est donc une infaisabilité certaine.
//
//   node scripts/capacite-desserte.mjs
import fs from 'fs';
import vm from 'vm';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const A = join(dirname(fileURLToPath(import.meta.url)), '..', 'assets');
for (const f of ['fit.data.js', 'contracts.js', 'construction.js', 'typologie.js', 'squelette.js', 'generator.js', 'rules.js']) {
  vm.runInThisContext(fs.readFileSync(join(A, f), 'utf8'));
}
const G = globalThis.TechnoHabGenerator;

const GRAINE = 20260820;
const N = 15;
const FORMES = ['rectangle', 'square', 'lShape', 'uShape'];
const CONFIGS = [
  [50, 1, 1, false, true, 'light'], [55, 2, 1, false, true, 'compact'],
  [65, 2, 1, false, false, 'compact'], [75, 2, 1, false, true, 'compact'],
  [80, 3, 1, false, true, 'compact'], [90, 3, 1, false, true, 'light'],
  [100, 3, 2, true, true, 'compact'], [110, 3, 1, true, true, 'compact'],
  [120, 4, 2, true, true, 'compact'], [130, 4, 1, false, true, 'light'],
  [150, 5, 2, true, true, 'compact'], [180, 5, 2, true, true, 'light'],
  [220, 5, 2, true, true, 'compact'], [250, 5, 2, true, true, 'economy'],
];
const graineDe = (i, v) => (Math.imul(GRAINE ^ (i * 0x9E3779B1), 0x85EBCA6B) + v * 0x27D4EB2F) >>> 0;

// Capacité de bordure d'un couloir : ses deux grands côtés. Une pièce en
// plusieurs parties additionne les siennes.
function capaciteDe(room) {
  return (room.parts || [{ x0: room.x0, y0: room.y0, x1: room.x1, y1: room.y1 }])
    .reduce((somme, p) => somme + 2 * Math.max(p.x1 - p.x0, p.y1 - p.y0), 0);
}

const seaux = new Map();
let plans = 0;

for (const forme of FORMES) {
  CONFIGS.forEach((c, i) => {
    const opts = {
      surface: c[0], bedrooms: c[1], bathrooms: c[2],
      separateKitchen: c[3], includeWc: c[4], priority: c[5], shape: forme
    };
    for (let v = 0; v < N; v += 1) {
      let plan;
      try { plan = G.generatePlan(opts, v, graineDe(i, v)); } catch (_) { continue; }
      plans += 1;

      const seuil = plan.minDesserte || 1.0;
      const parId = new Map(plan.rooms.map((r) => [r.id, r]));
      const circulations = plan.rooms.filter((r) => r.type === 'circulation');
      const capacite = circulations.reduce((s, r) => s + capaciteDe(r), 0);

      // Ce que le graphe demande au couloir, et ce qu'il en a obtenu.
      const dues = plan.requestedEdges.filter((e) => {
        const a = parId.get(e.a), b = parId.get(e.b);
        return (a && a.type === 'circulation') || (b && b.type === 'circulation');
      });
      const besoin = dues.length * seuil;

      const manquees = dues.filter((e) => !plan.edges.some((r) =>
        ((r.a === e.a && r.b === e.b) || (r.a === e.b && r.b === e.a)) && (r.contact || 0) >= seuil));

      const seau = capacite >= besoin ? 'capacite suffisante' : 'capacite insuffisante';
      if (!seaux.has(seau)) seaux.set(seau, { plans: 0, dues: 0, manquees: 0, parfaits: 0 });
      const s = seaux.get(seau);
      s.plans += 1;
      s.dues += dues.length;
      s.manquees += manquees.length;
      if (manquees.length === 0) s.parfaits += 1;
    }
  });
}

console.log(`${plans} plans.\n`);
console.log('cas'.padEnd(24) + 'plans'.padStart(6) + ' | dessertes dues | manquees | plans complets');
console.log('-'.repeat(78));
for (const [nom, s] of seaux) {
  console.log(
    nom.padEnd(24) + String(s.plans).padStart(6) + ' | ' +
    String(s.dues).padStart(14) + ' | ' +
    (s.manquees + ' (' + (s.manquees / s.dues * 100).toFixed(1) + ' %)').padStart(8) + ' | ' +
    (s.parfaits + '/' + s.plans + ' (' + (s.parfaits / s.plans * 100).toFixed(0) + ' %)').padStart(14)
  );
}

const suffisante = seaux.get('capacite suffisante');
console.log('\n--- lecture ---');
if (suffisante && suffisante.manquees > 0) {
  console.log('Des dessertes manquent alors que le couloir avait la longueur requise :');
  console.log('l\'echec est HEURISTIQUE. La decoupe ne sait pas exploiter une capacite');
  console.log('dont elle dispose — c\'est la methode de partition qu\'il faut reprendre,');
  console.log('pas l\'allocation de surface.');
} else {
  console.log('Aucune desserte manquee la ou la capacite suffisait : l\'echec serait');
  console.log('alors geometrique, et c\'est l\'allocation qu\'il faudrait revoir.');
}
