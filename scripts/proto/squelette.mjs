// PROTOTYPE — forme libre de circulation. Jetable.
//
// Renversement de méthode. Jusqu'ici : on empile des bandes de pièces et on
// glisse un couloir entre deux d'entre elles — la circulation est ce qui reste.
// Ici : on pose d'abord le SQUELETTE de circulation, et les pièces remplissent
// les poches qu'il laisse.
//
// Ce que ce renversement débloque, et qu'aucun réglage de l'autre ne donnait :
//
//   - le couloir se coude. Un L, un T : deux branches qui se touchent par
//     construction, donc plus de « circulations isolées » à raccorder ;
//   - la topologie change vraiment. Mesuré sur l'ancienne méthode, 200
//     signatures géométriques ne portaient que 4 organisations distinctes :
//     les mêmes plans redimensionnés. Une famille de squelette est une
//     organisation, pas une cote ;
//   - `TH2D-CIRC-003` est classée « limite connue » depuis le 15 août avec ce
//     motif : « autoriser une cession partielle, ce qui suppose un couloir non
//     rectangulaire ». C'est cette cession qui rendait les rangements.
//
// Une POCHE est une bande de pièces bordant une branche sur toute sa longueur.
// Sa largeur est imposée par le squelette ; sa profondeur se déduit des aires
// à loger. L'adjacence n'est jamais cherchée : elle est une propriété de la
// disposition.

const MIN_COULOIR = 1.20;
const MIN_DESSERTE = 1.00;
const TOLERANCE = 0.06;

function contraintes(room) {
  const minSide = room.minSide || 0;
  return {
    id: room.id, type: room.type, aire: room.targetArea,
    minProfondeur: minSide,
    minLargeur: Math.max(minSide, MIN_DESSERTE)
  };
}

function randomFrom(graine) {
  let v = graine >>> 0;
  return function () {
    v += 0x6D2B79F5;
    let r = v;
    r = Math.imul(r ^ (r >>> 15), r | 1);
    r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function melange(items, random) {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    const t = out[i]; out[i] = out[j]; out[j] = t;
  }
  return out;
}

function largeurBande(pieces, profondeur) {
  return pieces.reduce((s, p) => s + Math.max(p.minLargeur, p.aire / profondeur), 0);
}
function profondeurMinimale(pieces) {
  return pieces.reduce((m, p) => Math.max(m, p.minProfondeur), 0);
}

/** Profondeur d'une poche dont la largeur est imposée. Null si hors domaine. */
function profondeurPour(pieces, largeur) {
  if (!pieces.length) return null;
  let bas = profondeurMinimale(pieces);
  let haut = bas;
  for (let i = 0; i < 40 && largeurBande(pieces, haut) > largeur; i += 1) haut *= 1.35;
  if (largeurBande(pieces, bas) < largeur - 1e-9) return null;
  if (largeurBande(pieces, haut) > largeur + 1e-9) return null;
  for (let i = 0; i < 60; i += 1) {
    const m = (bas + haut) / 2;
    if (largeurBande(pieces, m) > largeur) bas = m; else haut = m;
  }
  return (bas + haut) / 2;
}

/* Pose une poche le long d'un axe. `horizontal` dit si les pièces se rangent
   selon x (bande au-dessus ou au-dessous d'une branche horizontale) ou selon
   y. `vers` vaut +1 si la poche s'étend dans le sens croissant depuis l'axe. */
function poserPoche(pieces, poche, profondeur) {
  const { x0, y0, largeur, horizontal, vers } = poche;
  let curseur = 0;
  return pieces.map((p, i) => {
    const l = i === pieces.length - 1
      ? largeur - curseur
      : Math.max(p.minLargeur, p.aire / profondeur);
    const a = curseur, b = curseur + l;
    let rect;
    if (horizontal) {
      rect = vers > 0
        ? { x0: x0 + a, y0: y0, x1: x0 + b, y1: y0 + profondeur }
        : { x0: x0 + a, y0: y0 - profondeur, x1: x0 + b, y1: y0 };
    } else {
      rect = vers > 0
        ? { x0: x0, y0: y0 + a, x1: x0 + profondeur, y1: y0 + b }
        : { x0: x0 - profondeur, y0: y0 + a, x1: x0, y1: y0 + b };
    }
    curseur += l;
    return { id: p.id, parts: [Object.assign({ role: 'main' }, rect)] };
  });
}

/* --- Les familles de squelette ---------------------------------------------

   Chacune décrit, pour une largeur d'enveloppe W donnée :
     branches  les rectangles de circulation, connexes entre eux
     poches    les bandes à remplir, chacune bordant une branche

   Une famille est une ORGANISATION. C'est là que naît la diversité que le
   redimensionnement ne donnait pas. */

/* --- Largeurs de poche indépendantes ----------------------------------------

   Première version : toutes les poches à la largeur de l'enveloppe. Trois
   conséquences, toutes mesurées :

     - l'enveloppe est TOUJOURS un rectangle. Carré, L et U demandés par
       l'interface n'avaient aucun effet — le moteur les ignorait ;
     - le T ne converge pas. Ses deux poches hautes bordent la même barre ;
       à largeur commune imposée, il faudrait que leurs profondeurs coïncident
       par hasard, ce qui n'arrive pas ;
     - une seule silhouette possible, donc peu d'organisations.

   Libérer la largeur de chaque poche règle les trois d'un coup : deux poches
   de longueurs différentes laissent un décrochement, et ce décrochement EST la
   forme en L. Une branche prend la largeur de la plus longue des poches
   qu'elle borde, sans quoi elle ne les toucherait pas toutes les deux. */

/** Domaine de largeur d'une poche : entre sa somme de minima et son étalement maximal. */
function domaine(pieces) {
  return {
    min: pieces.reduce((s, p) => s + p.minLargeur, 0),
    max: largeurBande(pieces, profondeurMinimale(pieces))
  };
}

/** Largeur admissible la plus proche d'une cible. */
function largeurProche(pieces, cible) {
  const d = domaine(pieces);
  if (d.min > d.max) return null;
  return Math.min(d.max, Math.max(d.min, cible));
}

/* `retrait` dit de combien la poche haute est plus courte que la basse, en
   fraction. 0 donne un rectangle, 0,3 un L franc. C'est le seul paramètre qui
   sépare les silhouettes. */
function barre(W, groupes, retrait) {
  const [nord, sud] = groupes;
  const Ws = largeurProche(sud, W);
  const Wn = largeurProche(nord, W * (1 - (retrait || 0)));
  if (Ws === null || Wn === null) return null;
  const pN = profondeurPour(nord, Wn);
  const pS = profondeurPour(sud, Ws);
  if (pN === null || pS === null) return null;
  const large = Math.max(Wn, Ws);
  const H = pN + MIN_COULOIR + pS;
  return {
    famille: retrait > 0.05 ? 'barre-L' : 'barre', W: large, H,
    aire: Wn * pN + large * MIN_COULOIR + Ws * pS,
    branches: [{ x0: 0, y0: pN, x1: large, y1: pN + MIN_COULOIR }],
    volumes: [
      { x0: 0, y0: 0, x1: Wn, y1: pN },
      { x0: 0, y0: pN, x1: large, y1: H }
    ],
    poser: () => [
      ...poserPoche(nord, { x0: 0, y0: pN, largeur: Wn, horizontal: true, vers: -1 }, pN),
      ...poserPoche(sud, { x0: 0, y0: pN + MIN_COULOIR, largeur: Ws, horizontal: true, vers: 1 }, pS)
    ]
  };
}

/** L de squelette : une barre, plus un retour vertical en bout. */
function enL(W, groupes, retrait) {
  const [haut, bas] = groupes;
  const Wb = largeurProche(bas, W);
  if (Wb === null) return null;
  const cibleHaute = (W - MIN_COULOIR) * (1 - (retrait || 0));
  const Wh = largeurProche(haut, cibleHaute);
  if (Wh === null || Wh <= 0) return null;
  const pH = profondeurPour(haut, Wh);
  const pB = profondeurPour(bas, Wb);
  if (pH === null || pB === null) return null;
  const large = Math.max(Wh + MIN_COULOIR, Wb);
  const H = pH + MIN_COULOIR + pB;
  return {
    famille: retrait > 0.05 ? 'L-decroche' : 'L', W: large, H,
    aire: Wh * pH + MIN_COULOIR * pH + large * MIN_COULOIR + Wb * pB,
    branches: [
      { x0: 0, y0: 0, x1: MIN_COULOIR, y1: pH },
      { x0: 0, y0: pH, x1: large, y1: pH + MIN_COULOIR }
    ],
    volumes: [
      { x0: 0, y0: 0, x1: Wh + MIN_COULOIR, y1: pH },
      { x0: 0, y0: pH, x1: large, y1: H }
    ],
    poser: () => [
      ...poserPoche(haut, { x0: MIN_COULOIR, y0: pH, largeur: Wh, horizontal: true, vers: -1 }, pH),
      ...poserPoche(bas, { x0: 0, y0: pH + MIN_COULOIR, largeur: Wb, horizontal: true, vers: 1 }, pB)
    ]
  };
}

/* T : une barre, plus un retour au milieu. Trois poches.

   Les deux poches hautes n'ont plus à partager leur profondeur : c'était
   l'impasse de la première version. Chacune prend la sienne, et l'écart entre
   les deux devient un décrochement d'enveloppe — un escalier, pas un défaut.
   Le retour descend de la plus profonde jusqu'à la barre, donc il borde les
   deux. */
function enT(W, groupes, retrait) {
  const [gauche, droite, bas] = groupes;
  const Wb = largeurProche(bas, W);
  if (Wb === null) return null;
  const utile = W - MIN_COULOIR;
  if (utile <= 0) return null;
  // Le retour se place là où les deux poches hautes trouvent chacune une
  // largeur admissible ; le partage suit leurs aires.
  const aireG = gauche.reduce((s, p) => s + p.aire, 0);
  const aireD = droite.reduce((s, p) => s + p.aire, 0);
  const part = aireG / (aireG + aireD);
  const Wg = largeurProche(gauche, utile * part);
  const Wd = largeurProche(droite, (utile - (Wg === null ? 0 : Wg)) * (1 - (retrait || 0)));
  if (Wg === null || Wd === null) return null;
  const pG = profondeurPour(gauche, Wg);
  const pD = profondeurPour(droite, Wd);
  const pB = profondeurPour(bas, Wb);
  if (pG === null || pD === null || pB === null) return null;
  const haut = Math.max(pG, pD);
  const large = Math.max(Wg + MIN_COULOIR + Wd, Wb);
  const H = haut + MIN_COULOIR + pB;
  return {
    famille: 'T', W: large, H,
    aire: Wg * pG + Wd * pD + MIN_COULOIR * haut + large * MIN_COULOIR + Wb * pB,
    branches: [
      { x0: Wg, y0: haut - Math.min(pG, pD) === 0 ? 0 : 0, x1: Wg + MIN_COULOIR, y1: haut },
      { x0: 0, y0: haut, x1: large, y1: haut + MIN_COULOIR }
    ],
    volumes: [
      { x0: 0, y0: haut - pG, x1: Wg + MIN_COULOIR, y1: haut },
      { x0: Wg, y0: haut - pD, x1: Wg + MIN_COULOIR + Wd, y1: haut },
      { x0: 0, y0: haut, x1: large, y1: H }
    ],
    poser: () => [
      ...poserPoche(gauche, { x0: 0, y0: haut, largeur: Wg, horizontal: true, vers: -1 }, pG),
      ...poserPoche(droite, { x0: Wg + MIN_COULOIR, y0: haut, largeur: Wd, horizontal: true, vers: -1 }, pD),
      ...poserPoche(bas, { x0: 0, y0: haut + MIN_COULOIR, largeur: Wb, horizontal: true, vers: 1 }, pB)
    ]
  };
}

const FAMILLES = [
  { nom: 'barre', poches: 2, construire: barre },
  { nom: 'L', poches: 2, construire: enL },
  { nom: 'T', poches: 3, construire: enT }
];

/* Répartit en `n` groupes.

   L'équilibrage par aires (LPT) est le choix sûr, mais il est très
   déterministe : la plus grande pièce part toujours seule d'un côté et le
   reste s'agglutine de l'autre. Mesuré sur un T3 de 75 m², il ne produisait
   que deux organisations distinctes sur cent tirages, alors que quatre
   familles de squelette étaient bien atteintes — la silhouette changeait, pas
   l'organisation.

   Un tirage libre une fois sur deux casse ce biais. Il donne des répartitions
   déséquilibrées, souvent infaisables — mais l'infaisable est écarté par le
   dimensionnement, qui rend `null`, et ce qui reste est une variété que
   l'équilibrage ne trouve jamais. */
function repartir(pieces, n, random) {
  const groupes = Array.from({ length: n }, () => []);
  if (random && random() < 0.5) {
    // Tirage libre : chaque pièce va où le sort la met, chaque groupe garde au
    // moins une pièce.
    const melangees = melange(pieces, random);
    melangees.forEach((p, i) => { groupes[i < n ? i : Math.floor(random() * n)].push(p); });
    if (groupes.every((g) => g.length)) return groupes;
    groupes.forEach((g) => { g.length = 0; });
  }
  const charges = new Array(n).fill(0);
  const ordre = random
    ? [...pieces].sort((a, b) => (b.aire * (0.7 + random() * 0.6)) - (a.aire * (0.7 + random() * 0.6)))
    : [...pieces].sort((a, b) => b.aire - a.aire);
  for (const p of ordre) {
    let m = 0;
    for (let k = 1; k < n; k += 1) if (charges[k] < charges[m]) m = k;
    groupes[m].push(p); charges[m] += p.aire;
  }
  return groupes;
}

/**
 * Pose un plan par squelette de circulation.
 *
 * @param programme    sortie de buildProgram()
 * @param cible        surface de partition visée
 * @param graine       tirage rejouable ; absent = première famille, sans tirage
 * @param familleVoulue nom de famille imposé, pour mesurer une famille seule
 */
export function poserParSquelette(programme, cible, graine, familleVoulue) {
  const random = Number.isFinite(graine) ? randomFrom(graine) : null;
  const pieces = programme.rooms
    .filter((r) => r.type !== 'circulation')
    .map(contraintes);
  if (pieces.length < 2) return { pieces: null, motif: 'moins de deux pièces à loger' };

  const cibleProgramme = programme.rooms.reduce((s, r) => s + r.targetArea, 0);
  const facteur = (cible || cibleProgramme) / cibleProgramme;
  pieces.forEach((p) => { p.aire *= facteur; });

  const familles = familleVoulue
    ? FAMILLES.filter((f) => f.nom === familleVoulue)
    : (random ? melange(FAMILLES, random) : FAMILLES);

  let motif = 'aucune famille de squelette ne sert ce programme';
  for (const famille of familles) {
    if (pieces.length < famille.poches) continue;
    const groupes = repartir(pieces, famille.poches, random);
    if (groupes.some((g) => !g.length)) continue;
    let ordonnes = random ? groupes.map((g) => melange(g, random)) : groupes;

    /* La corde du graphe. Le graphe demandé est une étoile PLUS, une fois sur
       deux, l'arête `living–kitchen`. Le squelette satisfait l'étoile par
       construction — chaque pièce borde une branche — mais ignorait la corde :
       mesuré, elle représentait 87 des 87 adjacences manquantes, soit la
       totalité des 9 % perdus.

       Deux pièces voisines d'une même poche partagent toute la profondeur de
       celle-ci, bien au-delà de la desserte due. Il suffit donc de les rendre
       voisines. */
    const sejour = pieces.find((p) => p.type === 'living');
    const cuisine = pieces.find((p) => p.type === 'kitchen');
    if (sejour && cuisine) {
      ordonnes = ordonnes.map((g) => g.filter((p) => p !== cuisine));
      const poche = ordonnes.find((g) => g.includes(sejour));
      if (!poche) continue;
      poche.splice(poche.indexOf(sejour) + 1, 0, cuisine);
      if (ordonnes.some((g) => !g.length)) continue;
    }

    /* Deux paramètres libres désormais : la largeur d'enveloppe et le retrait
       de la poche haute. Le second décide de la silhouette — nul pour un
       rectangle, marqué pour un L. Il est tiré, donc deux graines ne donnent
       plus seulement deux dimensionnements mais deux formes de bâti. */
    const retrait = random ? [0, 0, 0.12, 0.22, 0.32][Math.floor(random() * 5)] : 0;
    const aireUtile = pieces.reduce((s, p) => s + p.aire, 0);
    const base = Math.sqrt(aireUtile * 1.4);
    let meilleur = null;
    for (let k = -14; k <= 20; k += 1) {
      const W = base * (1 + k * 0.05);
      if (W <= MIN_COULOIR * 2) continue;
      const forme = famille.construire(W, ordonnes, retrait);
      if (!forme) continue;
      /* La surface d'un plan décroché n'est pas celle de son rectangle
         englobant. Calculée en `W × H`, elle surestimait de tout le
         décrochement et rejetait chaque forme en L comme « hors tolérance ». */
      const surface = forme.aire;
      const ecart = Math.abs(surface - (cible || cibleProgramme));
      if (!meilleur || ecart < meilleur.ecart) meilleur = { forme, ecart, surface };
    }
    if (!meilleur) { motif = `famille ${famille.nom} : aucune largeur ne convient`; continue; }
    if (meilleur.ecart > (cible || cibleProgramme) * TOLERANCE * 3) {
      motif = `famille ${famille.nom} : surface hors tolérance`;
      continue;
    }

    const forme = meilleur.forme;
    const couloirs = programme.rooms.filter((r) => r.type === 'circulation');
    const boites = forme.poser();
    /* Toutes les branches forment UNE circulation : c'est le point du
       chantier. S'il y a plusieurs circulations au programme, la première
       porte le squelette et les autres n'ont pas lieu d'être — le squelette
       les remplace par ses branches. */
    if (couloirs.length) {
      boites.push({
        id: couloirs[0].id,
        parts: forme.branches.map((b) => Object.assign({ role: 'main' }, b))
      });
    }
    return {
      pieces: boites, motif: null, famille: forme.famille,
      largeur: forme.W, hauteur: forme.H, surface: meilleur.surface,
      branches: forme.branches.length,
      // Les volumes décrivent l'enveloppe réelle, décrochements compris. Sans
      // eux `assemblerPlan()` retomberait sur le rectangle englobant et les
      // façades seraient calculées sur une enveloppe qui n'existe pas.
      volumes: forme.volumes, retrait: retrait
    };
  }
  return { pieces: null, motif };
}

export const familles = FAMILLES.map((f) => f.nom);
