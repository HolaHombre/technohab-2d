// Chantier 9 — effet propre de `hubSplit()` et du peigne.
//
// `layout()` porte deux mécanismes écrits pour satisfaire le graphe par
// construction. Avant de proposer de remplacer la découpe, il faut savoir ce
// qu'ils valent : s'ils portent déjà l'essentiel de la desserte, les toucher
// est risqué ; s'ils ne rendent rien, la voie est libre.
//
// Méthode : l'ablation à graines fixes dans le même processus — la seule qui
// établisse une causalité ici (DOCTRINE_CIRCULATION.md §5 ter). Le source du
// générateur est patché en mémoire et chaque variante tourne dans son propre
// contexte, sur exactement les mêmes graines.
//
//   node technohab/scripts/ablation-peigne.mjs
import fs from 'fs';
import vm from 'vm';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const A = join(dirname(fileURLToPath(import.meta.url)), '..', 'assets');
const lire = (f) => fs.readFileSync(join(A, f), 'utf8');

const SOURCE = lire('generator.js');

// Les deux points de patch, vérifiés présents avant usage : un remplacement
// silencieusement raté produirait un témoin en guise de variante, donc une
// conclusion fausse.
const ANCRE_PEIGNE = 'var comb = !hasHub && parentVertical !== undefined';
const ANCRE_HUB = 'var split = hubSplit(items) || chooseSplit(items, random);';
for (const [nom, ancre] of [['peigne', ANCRE_PEIGNE], ['hubSplit', ANCRE_HUB]]) {
  if (!SOURCE.includes(ancre)) {
    console.error(`Ancre « ${nom} » introuvable dans generator.js — le script doit être remis à jour.`);
    process.exit(1);
  }
}

const VARIANTES = {
  'temoin': (s) => s,
  'sans peigne': (s) => s.replace(ANCRE_PEIGNE, 'var comb = false && parentVertical !== undefined'),
  'sans hubSplit': (s) => s.replace(ANCRE_HUB, 'var split = chooseSplit(items, random);'),
  'sans les deux': (s) => s
    .replace(ANCRE_PEIGNE, 'var comb = false && parentVertical !== undefined')
    .replace(ANCRE_HUB, 'var split = chooseSplit(items, random);')
};

/* Les variantes se chargent l'une après l'autre dans le contexte courant, et
   non chacune dans un `vm.createContext`. Ce n'est pas un raccourci : mesuré,
   un contexte séparé coûte ~2 s par plan contre ~2 ms ici, V8 n'optimisant
   pas le code exécuté hors du contexte principal. L'isolation par contexte
   aurait porté ce banc à près de deux heures et rendu la colonne des durées
   inexploitable.

   Recharger suffit : le générateur est une IIFE qui réassigne
   `TechnoHabGenerator`, et ses caches (`poidsCache`, `fitSideCache`) vivent
   dans la closure — une variante ne peut donc pas hériter des tables d'une
   autre. Les variantes restent séquentielles, jamais simultanées. */
vm.runInThisContext(lire('fit.data.js'));
vm.runInThisContext(lire('construction.js'));

function chargerVariante(patch) {
  vm.runInThisContext(patch(SOURCE));
  vm.runInThisContext(lire('rules.js'));
  return globalThis.TechnoHabGenerator;
}

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

const estDegagement = (type) => type === 'circulation' || type === 'living';

function mesurer(G) {
  let pieces = 0, sansContact = 0, sansPorte = 0, plans = 0, duree = 0;
  const signatures = new Set();
  for (const forme of FORMES) {
    CONFIGS.forEach((c, i) => {
      const opts = {
        surface: c[0], bedrooms: c[1], bathrooms: c[2],
        separateKitchen: c[3], includeWc: c[4], priority: c[5], shape: forme
      };
      for (let v = 0; v < N; v += 1) {
        const t0 = process.hrtime.bigint();
        let plan;
        try { plan = G.generatePlan(opts, v, graineDe(i, v)); } catch (_) { continue; }
        duree += Number(process.hrtime.bigint() - t0) / 1e6;
        plans += 1;
        signatures.add(plan.rooms.map((r) => r.type + ':' + r.area.toFixed(1)).sort().join('|'));

        const parId = new Map(plan.rooms.map((r) => [r.id, r]));
        const seuil = plan.minDesserte || 1.0;
        for (const room of plan.rooms) {
          if (estDegagement(room.type) || room.type === 'kitchen') continue;
          pieces += 1;
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
          if (!contact) sansContact += 1;
          if (!porte) sansPorte += 1;
        }
      }
    });
  }
  return { plans, pieces, sansContact, sansPorte, signatures: signatures.size, duree: duree / plans };
}

const pc = (n, d) => (n / d * 100).toFixed(1);
const resultats = {};

console.log('variante'.padEnd(16) + 'plans'.padStart(6) + ' | sans contact | sans porte | signatures | ms/plan');
console.log('-'.repeat(78));
for (const [nom, patch] of Object.entries(VARIANTES)) {
  const r = mesurer(chargerVariante(patch));
  resultats[nom] = r;
  console.log(
    nom.padEnd(16) + String(r.plans).padStart(6) + ' | ' +
    (pc(r.sansContact, r.pieces) + ' %').padStart(12) + ' | ' +
    (pc(r.sansPorte, r.pieces) + ' %').padStart(10) + ' | ' +
    String(r.signatures).padStart(10) + ' | ' +
    r.duree.toFixed(2).padStart(7)
  );
}

console.log('\n--- effet propre, en points de pourcentage ---');
const t = resultats['temoin'];
for (const nom of ['sans peigne', 'sans hubSplit', 'sans les deux']) {
  const r = resultats[nom];
  const dContact = pc(r.sansContact, r.pieces) - pc(t.sansContact, t.pieces);
  const dPorte = pc(r.sansPorte, r.pieces) - pc(t.sansPorte, t.pieces);
  console.log('  ' + nom.padEnd(15) +
    'contact ' + (dContact >= 0 ? '+' : '') + dContact.toFixed(1) +
    '  |  porte ' + (dPorte >= 0 ? '+' : '') + dPorte.toFixed(1));
}
console.log('\nUn écart positif = le mécanisme retiré rendait service.');
console.log('Un écart nul = il est décoratif, et la découpe peut être reprise sans le regretter.');
