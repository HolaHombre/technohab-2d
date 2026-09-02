// Chantier 9 — pourquoi le peigne échoue.
//
// `DOCTRINE_CIRCULATION.md` §5 ter impute la desserte manquante à une découpe
// « qui ne consulte pas le graphe ». C'est trop absolu : `layout()` porte deux
// mécanismes écrits exprès pour lui — `hubSplit()`, qui isole la circulation
// contre une frontière, et le peigne (`comb`), qui recoupe perpendiculairement
// tout groupe déjà séparé du couloir pour que chacune de ses pièces le borde.
//
// La question n'est donc pas « pourquoi la découpe ignore-t-elle le graphe »
// mais « dans quels cas ces deux mécanismes ne s'appliquent pas ». Ce script
// répond en ventilant l'échec par forme d'enveloppe, par type de pièce et par
// taille de programme — les trois suspects.
//
//   node technohab/scripts/diagnostic-desserte.mjs
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

/* Une pièce est desservie si elle ouvre sur un dégagement — circulation ou
   séjour. Le séjour compte : dans un logement sans couloir il EST le
   dégagement, et la cuisine y ouvre légitimement (c'est le programme qui le
   demande). Ce qu'on traque est la desserte par traversée d'une pièce
   privative : une chambre sur laquelle on débouche depuis une autre chambre. */
const estDegagement = (type) => type === 'circulation' || type === 'living';

function analyser(plan) {
  const parId = new Map(plan.rooms.map((r) => [r.id, r]));
  const seuil = plan.minDesserte || 1.0;
  const resultats = [];
  for (const room of plan.rooms) {
    if (estDegagement(room.type)) continue;
    if (room.type === 'kitchen') continue;   // ouvre sur le séjour, par programme

    const contact = plan.edges.some((e) => {
      const autre = e.a === room.id ? e.b : (e.b === room.id ? e.a : null);
      if (!autre) return false;
      const voisin = parId.get(autre);
      return voisin && estDegagement(voisin.type) && (e.contact || 0) >= seuil;
    });
    const porte = (plan.portes || []).some((p) => {
      if (!p.entre || p.entre.indexOf(room.id) === -1) return false;
      const autre = p.entre[0] === room.id ? p.entre[1] : p.entre[0];
      const voisin = parId.get(autre);
      return voisin && estDegagement(voisin.type);
    });
    resultats.push({ type: room.type, contact, porte });
  }
  return resultats;
}

// Le graphe demandé est-il l'étoile que APPROCHES_GENERATION.md §4 décrit ?
function formeDuGraphe(plan) {
  const degres = new Map();
  for (const e of plan.requestedEdges) {
    degres.set(e.a, (degres.get(e.a) || 0) + 1);
    degres.set(e.b, (degres.get(e.b) || 0) + 1);
  }
  const sommets = degres.size;
  const aretes = plan.requestedEdges.length;
  const centre = [...degres.entries()].sort((a, b) => b[1] - a[1])[0];
  /* Test direct plutôt qu'arithmétique : on retire le sommet de plus haut
     degré et on compte ce qui reste. Une étoile ne laisse rien ; une étoile
     à une corde laisse une arête — c'est le cas `living–kitchen`. */
  const restantes = plan.requestedEdges.filter((e) => e.a !== centre[0] && e.b !== centre[0]).length;
  return {
    sommets, aretes, centre: centre[0],
    etoile: restantes === 0,
    quasiEtoile: restantes === 1,
    cordes: restantes
  };
}

const parForme = new Map(FORMES.map((f) => [f, { total: 0, sansContact: 0, sansPorte: 0 }]));
const parType = new Map();
const parTaille = new Map();
let graphesEtoile = 0, graphesQuasi = 0, graphesAutres = 0, totalPlans = 0;

for (const forme of FORMES) {
  CONFIGS.forEach((c, i) => {
    const opts = {
      surface: c[0], bedrooms: c[1], bathrooms: c[2],
      separateKitchen: c[3], includeWc: c[4], priority: c[5], shape: forme
    };
    for (let v = 0; v < N; v += 1) {
      let plan;
      try { plan = G.generatePlan(opts, v, graineDe(i, v)); } catch (_) { continue; }
      totalPlans += 1;

      const g = formeDuGraphe(plan);
      if (g.etoile) graphesEtoile += 1;
      else if (g.quasiEtoile) graphesQuasi += 1;
      else graphesAutres += 1;

      const nbPieces = plan.rooms.length;
      const seau = nbPieces <= 5 ? '3-5' : nbPieces <= 7 ? '6-7' : nbPieces <= 9 ? '8-9' : '10+';
      if (!parTaille.has(seau)) parTaille.set(seau, { total: 0, sansContact: 0, sansPorte: 0 });

      for (const r of analyser(plan)) {
        for (const bucket of [parForme.get(forme), parTaille.get(seau)]) {
          bucket.total += 1;
          if (!r.contact) bucket.sansContact += 1;
          if (!r.porte) bucket.sansPorte += 1;
        }
        if (!parType.has(r.type)) parType.set(r.type, { total: 0, sansContact: 0, sansPorte: 0 });
        const t = parType.get(r.type);
        t.total += 1;
        if (!r.contact) t.sansContact += 1;
        if (!r.porte) t.sansPorte += 1;
      }
    }
  });
}

const pc = (n, d) => d ? (n / d * 100).toFixed(1) + ' %' : '—';
const ligne = (nom, b) =>
  nom.padEnd(14) + String(b.total).padStart(7) + ' | ' +
  pc(b.sansContact, b.total).padStart(11) + ' | ' + pc(b.sansPorte, b.total).padStart(10);

console.log(`${totalPlans} plans, ${N} graines × ${CONFIGS.length} configurations × ${FORMES.length} formes.\n`);

console.log('--- structure du graphe demande ---');
console.log('  etoile pure          : ' + graphesEtoile + '/' + totalPlans);
console.log('  etoile + une corde   : ' + graphesQuasi + '/' + totalPlans);
console.log('  autre                : ' + graphesAutres + '/' + totalPlans);

console.log('\n--- desserte, par forme d\'enveloppe ---');
console.log('forme'.padEnd(14) + 'pieces'.padStart(7) + ' | sans contact | sans porte');
console.log('-'.repeat(50));
for (const f of FORMES) console.log(ligne(f, parForme.get(f)));

console.log('\n--- desserte, par type de piece ---');
console.log('type'.padEnd(14) + 'pieces'.padStart(7) + ' | sans contact | sans porte');
console.log('-'.repeat(50));
for (const [t, b] of [...parType.entries()].sort((a, b) => b[1].sansPorte / b[1].total - a[1].sansPorte / a[1].total)) {
  console.log(ligne(t, b));
}

console.log('\n--- desserte, par taille de programme ---');
console.log('pieces'.padEnd(14) + 'pieces'.padStart(7) + ' | sans contact | sans porte');
console.log('-'.repeat(50));
for (const k of ['3-5', '6-7', '8-9', '10+']) {
  if (parTaille.has(k)) console.log(ligne(k, parTaille.get(k)));
}

const global = [...parForme.values()].reduce((a, b) => ({
  total: a.total + b.total, sansContact: a.sansContact + b.sansContact, sansPorte: a.sansPorte + b.sansPorte
}), { total: 0, sansContact: 0, sansPorte: 0 });
console.log('\n--- ensemble ---');
console.log(ligne('toutes', global));
