// Chantier 6 §6.4 — premier usage du journal d'évaluation.
//
// Répond à une seule question, et c'est la plus importante que ce chantier
// puisse poser : **`scoreCandidate()` a-t-il un rapport avec le jugement
// humain ?** Si la corrélation est nulle, le moteur optimise du bruit depuis
// le début, et c'est le résultat le plus utile qu'on puisse obtenir.
//
// L'apprentissage ne vient qu'après, et à volume suffisant. Quelques dizaines
// d'avis ne permettent d'entraîner quoi que ce soit ; prétendre le contraire
// ferait de ce journal un ornement. Ce script refuse donc de conclure sous le
// seuil, au lieu d'afficher un coefficient qui aurait l'air d'une réponse.
//
//   node scripts/correlation-avis.mjs eval/avis.eval.json
import fs from 'fs';

const SEUIL_CONCLUSION = 50;

const chemin = process.argv[2];
if (!chemin) {
  console.error('usage : node scripts/correlation-avis.mjs <fichier.eval.json>');
  console.error('Le fichier s’obtient par le bouton « Exporter les avis » de la page.');
  process.exit(2);
}

const brut = JSON.parse(fs.readFileSync(chemin, 'utf8'));
const entrees = Array.isArray(brut) ? brut : (brut.entrees || []);
if (!entrees.length) {
  console.error('Journal vide : rien à corréler.');
  process.exit(2);
}

/* Corrélation bisériale ponctuelle : la note d'habitabilité est binaire
   (oui/non) et le score interne est continu. C'est le coefficient de Pearson
   appliqué à ce cas, et il n'exige aucune bibliothèque. */
function pearson(xs, ys) {
  const n = xs.length;
  if (n < 2) return null;
  const mx = xs.reduce((a, b) => a + b, 0) / n;
  const my = ys.reduce((a, b) => a + b, 0) / n;
  let num = 0, dx = 0, dy = 0;
  for (let i = 0; i < n; i += 1) {
    const a = xs[i] - mx, b = ys[i] - my;
    num += a * b; dx += a * a; dy += b * b;
  }
  if (dx === 0 || dy === 0) return { r: null, degenere: dx === 0 ? 'score' : 'reponses' };
  return { r: num / Math.sqrt(dx * dy), degenere: null };
}

// Les avis sont groupés par version de moteur : mélanger des jugements
// portant sur des plans que le code ne produit plus donnerait un chiffre
// dénué de sens. C'est la raison d'être du champ `versionMoteur`.
const parVersion = {};
entrees.forEach((e) => {
  const v = e.versionMoteur || 'inconnue';
  (parVersion[v] = parVersion[v] || []).push(e);
});

console.log('journal : ' + entrees.length + ' avis, ' + Object.keys(parVersion).length + ' version(s) de moteur');
if (brut.avertissement) console.log('rappel  : ' + brut.avertissement);

function analyser(libelle, lot) {
  const utiles = lot.filter((e) => e.reponses && (e.reponses.habiterais === 'oui' || e.reponses.habiterais === 'non'));
  console.log('\n=== ' + libelle + ' — ' + lot.length + ' avis, ' + utiles.length + ' exploitables ===');
  if (!utiles.length) { console.log('  aucune reponse a « y habiteriez-vous ? »'); return; }

  const oui = utiles.filter((e) => e.reponses.habiterais === 'oui').length;
  console.log('  y habiteriez-vous  : ' + oui + ' oui / ' + (utiles.length - oui) + ' non');

  const surprenants = utiles.filter((e) => e.reponses.pense === 'non' && e.reponses.habiterais === 'oui');
  console.log('  inspirants (non a « y auriez-vous pense » ET oui a « y habiteriez-vous ») : ' +
    surprenants.length + ' / ' + utiles.length +
    (utiles.length ? ' — ' + (surprenants.length / utiles.length * 100).toFixed(0) + ' %' : ''));

  const scores = utiles.map((e) => e.metriques && typeof e.metriques.scoreInterne === 'number' ? e.metriques.scoreInterne : null);
  if (scores.some((s) => s === null)) { console.log('  score interne absent de certaines entrees : correlation impossible'); return; }
  const notes = utiles.map((e) => (e.reponses.habiterais === 'oui' ? 1 : 0));

  const res = pearson(scores, notes);
  if (res.degenere === 'score') {
    // Cas rencontré dès la première mesure sur les petits programmes : la
    // recherche s'arrête au premier candidat à score nul, donc tous les
    // plans retenus valent 0. Une constante ne corrèle avec rien — ce n'est
    // pas un résultat faible, c'est une mesure impossible, et il faut le
    // dire ainsi plutôt que d'afficher zéro.
    console.log('  CORRELATION IMPOSSIBLE : le score interne est constant (' + scores[0] +
      ') sur tout le lot.');
    console.log('  Le moteur s’arrete au premier candidat de score nul : sur ces programmes,');
    console.log('  le score ne distingue plus les plans retenus, donc il ne peut rien predire.');
    return;
  }
  if (res.degenere === 'reponses') {
    console.log('  CORRELATION IMPOSSIBLE : toutes les reponses sont identiques.');
    return;
  }

  console.log('  correlation score interne / habitabilite : r = ' + res.r.toFixed(3));
  console.log('    (le score est une penalite : un r NEGATIF signifie que le moteur va');
  console.log('     dans le bon sens — moins de penalite, plus d’envie d’y habiter)');
  if (utiles.length < SEUIL_CONCLUSION) {
    console.log('  NE PAS CONCLURE : ' + utiles.length + ' avis pour un seuil de ' + SEUIL_CONCLUSION + '.');
    console.log('  Ce coefficient est affiche pour suivre sa stabilite, pas pour etre interprete.');
  }
}

analyser('tous moteurs confondus', entrees);
Object.keys(parVersion).sort().forEach((v) => analyser('moteur ' + v, parVersion[v]));

// Les mots libres, dépouillés bruts. C'est ce comptage qui alimentera la
// liste fermée de l'étape 2 du quiz : construire les options à partir des
// mots réellement employés est la façon la moins arbitraire de les choisir.
const mots = {};
entrees.forEach((e) => {
  const m = e.reponses && e.reponses.defaut;
  if (m) mots[m] = (mots[m] || 0) + 1;
});
const classement = Object.entries(mots).sort((a, b) => b[1] - a[1]);
console.log('\n=== defauts cites, ' + classement.length + ' mot(s) distinct(s) ===');
if (!classement.length) console.log('  aucun');
classement.forEach(([mot, n]) => console.log('  ' + mot.padEnd(20) + String(n).padStart(4)));
