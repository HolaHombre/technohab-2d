// PROTOTYPE v2 — couloirs NON traversants.
//
// La v1 posait des couloirs sur toute la largeur du plan. Adjacences à 100 %,
// mais `TH2D-CIRC-004` sur tous les plans bi-couloir : un couloir traversant
// est plus long que sa desserte ne l'exige, et la surface de circulation
// explose.
//
// Le plan de référence dessiné à la main ne fait pas cela. Son dégagement
// s'arrête contre le séjour — 1,30 × 5,50 m pour cinq dessertes. C'est cette
// disposition que la v2 reprend :
//
//   ┌──────────────────┬──────────┐
//   │   bande 0        │          │
//   ├──────────────────┤          │
//   │   COULOIR 1      │          │
//   ├──────────────────┤  SÉJOUR  │
//   │   bande 1        │          │
//   ├──────────────────┤          │
//   │   COULOIR 2      │          │
//   ├──────────────────┤          │
//   │   bande 2        │          │
//   └──────────────────┴──────────┘
//
// Le séjour occupe une colonne pleine hauteur. Chaque couloir bute contre
// elle : il touche donc le séjour par son extrémité, sur 1,20 m — au-delà de
// la desserte due. Les couloirs ne se touchent pas entre eux, conformément à
// l'arbitrage « circulations isolées », et l'accessibilité passe par le
// séjour, jamais par une pièce privative.
//
// N couloirs demandent N+1 bandes. Une bande intermédiaire borde deux
// couloirs, ce qui ne gêne pas : l'arête demandée est satisfaite dès qu'un
// contact suffisant existe avec le couloir nommé par le graphe.

const MIN_COULOIR = 1.20;
const MIN_DESSERTE = 1.00;

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

/** Profondeur donnant exactement cette largeur de bande, ou null hors domaine. */
function profondeurPour(pieces, largeur) {
  if (!pieces.length) return null;
  let bas = profondeurMinimale(pieces);
  let haut = bas;
  for (let i = 0; i < 40 && largeurBande(pieces, haut) > largeur; i += 1) haut *= 1.35;
  if (largeurBande(pieces, bas) < largeur - 1e-9) return null;
  if (largeurBande(pieces, haut) > largeur + 1e-9) return null;
  for (let i = 0; i < 60; i += 1) {
    const milieu = (bas + haut) / 2;
    if (largeurBande(pieces, milieu) > largeur) bas = milieu; else haut = milieu;
  }
  return (bas + haut) / 2;
}

function poserBande(pieces, x0, y0, largeur, profondeur) {
  if (!pieces.length) return [];
  let x = x0;
  return pieces.map((p, i) => {
    const w = i === pieces.length - 1
      ? (x0 + largeur) - x
      : Math.max(p.minLargeur, p.aire / profondeur);
    const boite = { id: p.id, parts: [{ role: 'main', x0: x, y0, x1: x + w, y1: y0 + profondeur }] };
    x += w;
    return boite;
  });
}

/** Répartit en `n` groupes d'aires équilibrées (LPT), tirage optionnel. */
function repartir(pieces, n, random) {
  const groupes = Array.from({ length: n }, () => []);
  const charges = new Array(n).fill(0);
  const ordre = random
    ? [...pieces].sort((a, b) => (b.aire * (0.75 + random() * 0.5)) - (a.aire * (0.75 + random() * 0.5)))
    : [...pieces].sort((a, b) => b.aire - a.aire);
  for (const p of ordre) {
    let m = 0;
    for (let k = 1; k < n; k += 1) if (charges[k] < charges[m]) m = k;
    groupes[m].push(p); charges[m] += p.aire;
  }
  return groupes;
}

function transposer(pieces) {
  return pieces.map((p) => ({
    id: p.id,
    parts: p.parts.map((q) => ({ role: q.role, x0: q.y0, y0: q.x0, x1: q.y1, y1: q.x1 }))
  }));
}

/* --- Ailes autour d'une colonne centrale -------------------------------------

   Deuxième correction de la disposition, et retour à l'idée écartée au départ.

   Empiler N+1 bandes et coller la colonne du séjour à droite ne tient pas :
   avec deux couloirs, trois bandes de chambres portent la hauteur à près de
   dix mètres, et la colonne du séjour tombe alors sous ses 3,00 m de côté —
   30 refus sur 30, sur tous les programmes sauf le plus grand.

   La bonne disposition met le séjour AU CENTRE et les couloirs de part et
   d'autre. Chaque couloir n'a plus que deux bandes à porter, la hauteur
   retombe à sept mètres environ, et la colonne retrouve sa largeur.

     ┌──────┬──────┬────────┬──────┬──────┐
     │  bande nord │        │ bande nord  │
     ├─────────────┤ SÉJOUR ├─────────────┤
     │  COULOIR 1  │        │  COULOIR 2  │
     ├─────────────┤        ├─────────────┤
     │  bande sud  │        │ bande sud   │
     └──────┴──────┴────────┴──────┴──────┘

   Chaque couloir bute contre la colonne : il touche le séjour sur 1,20 m,
   au-delà de la desserte due. Les couloirs ne se touchent pas — l'arbitrage
   « circulations isolées » — et l'accessibilité passe par le séjour, jamais
   par une pièce privative. Un couloir ne traverse plus le plan : il ne fait
   que la largeur de son aile, ce qui était tout l'objet de la correction. */

/** Largeur d'aile dont les deux bandes totalisent exactement `hauteurUtile`. */
function largeurAile(bandeNord, bandeSud, hauteurUtile) {
  const somme = (W) => {
    const a = profondeurPour(bandeNord, W);
    const b = profondeurPour(bandeSud, W);
    return a === null || b === null ? null : a + b;
  };
  let bas = Math.max(
    bandeNord.reduce((s, p) => s + p.minLargeur, 0),
    bandeSud.reduce((s, p) => s + p.minLargeur, 0)
  );
  let haut = Math.min(
    largeurBande(bandeNord, profondeurMinimale(bandeNord)),
    largeurBande(bandeSud, profondeurMinimale(bandeSud))
  );
  if (bas > haut) return null;
  const sBas = somme(bas), sHaut = somme(haut);
  if (sBas === null || sHaut === null) return null;
  // La somme des profondeurs décroît quand l'aile s'élargit.
  if (hauteurUtile > sBas || hauteurUtile < sHaut) return null;
  for (let i = 0; i < 60; i += 1) {
    const m = (bas + haut) / 2;
    const v = somme(m);
    if (v === null) return null;
    if (v > hauteurUtile) bas = m; else haut = m;
  }
  return (bas + haut) / 2;
}

/**
 * Pose N couloirs non traversants autour d'une colonne de séjour centrale.
 *
 * @param programme    sortie de buildProgram()
 * @param cibleForcee  surface visée, corrigée par `viser()`
 * @param graine       tirage rejouable ; absent = disposition déterministe
 */
function poserUneFois(programme, cibleForcee, random) {
  const couloirs = programme.rooms.filter((r) => r.type === 'circulation');
  if (!couloirs.length) return { pieces: null, motif: 'aucune circulation au programme' };

  const sejour = programme.rooms.find((r) => r.type === 'living');
  if (!sejour) return { pieces: null, motif: 'pas de séjour : la colonne de liaison manque' };
  const colonne = contraintes(sejour);

  const cuisine = programme.rooms.find((r) => r.type === 'kitchen');
  const desservies = programme.rooms
    .filter((r) => r.type !== 'circulation' && r.type !== 'living')
    .map(contraintes);
  if (desservies.length < couloirs.length * 2) {
    return { pieces: null, motif: `trop peu de pièces (${desservies.length}) pour ${couloirs.length} couloir(s)` };
  }

  const cibleProgramme = programme.rooms.reduce((s, r) => s + r.targetArea, 0);
  const cible = Number.isFinite(cibleForcee) && cibleForcee > 0 ? cibleForcee : cibleProgramme;
  const facteur = cible / cibleProgramme;
  [...desservies, colonne].forEach((p) => { p.aire *= facteur; });

  /* Répartition entre ailes : LUE dans le graphe demandé quand il la porte.
     Leçon de la v1 — deux endroits qui décident séparément d'une même chose
     se désaccordent dès qu'un tirage entre en jeu, et les adjacences tombent
     de 100 % à 63 %. */
  const aRepartir = desservies.filter((p) => p.type !== 'kitchen');
  let parAile;
  if (couloirs.length === 1) {
    parAile = [aRepartir];
  } else {
    parAile = couloirs.map((c) => {
      const ids = new Set();
      for (const e of programme.desiredEdges || []) {
        if (e.a === c.id) ids.add(e.b);
        else if (e.b === c.id) ids.add(e.a);
      }
      return aRepartir.filter((p) => ids.has(p.id));
    });
    if (parAile.some((g) => g.length < 2)) parAile = repartir(aRepartir, couloirs.length, random);
  }
  if (parAile.some((g) => g.length < 2)) {
    return { pieces: null, motif: 'une aile n’aurait pas de quoi border son couloir des deux côtés' };
  }

  // Chaque aile se scinde en deux bandes, de part et d'autre de son couloir.
  let ailes = parAile.map((groupe) => {
    const [n, s2] = repartir(groupe, 2, random);
    if (!n.length || !s2.length) return null;
    return random ? [melange(n, random), melange(s2, random)] : [n, s2];
  });
  if (ailes.some((a) => a === null)) return { pieces: null, motif: 'une bande resterait vide' };

  /* La cuisine séparée doit toucher le séjour — c'est la corde du graphe. La
     colonne se pose APRÈS la première aile : pour l'aile 0 le contact se fait
     donc par la fin de bande, pour les suivantes par le début. Poser la
     cuisine toujours en fin coûtait les adjacences `living~kitchen` de l'aile
     droite (88 à 93 % au lieu de 100). */
  const cuisineAile = cuisine ? (random ? Math.floor(random() * ailes.length) : 0) : -1;
  const cuisineBande = cuisine ? (random ? Math.floor(random() * 2) : 0) : -1;
  if (cuisine) {
    const cC = desservies.find((p) => p.id === cuisine.id);
    const b = ailes[cuisineAile][cuisineBande];
    ailes[cuisineAile][cuisineBande] = cuisineAile === 0 ? [...b, cC] : [cC, ...b];
  }

  /* Le séjour occupe toute la hauteur : on balaye celle-ci, et chaque aile
     s'élargit jusqu'à ce que ses deux bandes la remplissent exactement. */
  /* Les deux ailes doivent partager la même hauteur, et chacune n'en admet
     qu'un intervalle. Leur intersection peut être vide pour une répartition
     donnée sans l'être pour une autre — d'où le refus de vingt à trente plans
     sur trente à la première version, qui n'en essayait qu'une.

     La plage de hauteurs est large et le balayage fin : une hauteur de plan
     va de trois mètres et demi à une quinzaine, et rien ne justifie de la
     borner plus étroitement. */
  const hMin = Math.max(colonne.minProfondeur, MIN_COULOIR + 2 * 1.2);
  const hMax = hMin * 4;
  const PAS = 160;
  const candidats = [];
  for (let i = 0; i <= PAS; i += 1) {
    const H = hMin + (hMax - hMin) * (i / PAS);
    const largeurs = ailes.map(([n, s2]) => largeurAile(n, s2, H - MIN_COULOIR));
    if (largeurs.some((w) => w === null)) continue;
    const Ws = colonne.aire / H;
    if (Ws + 1e-9 < colonne.minLargeur) continue;
    const surface = (largeurs.reduce((a, b) => a + b, 0) + Ws) * H;
    // Un couloir occupe la largeur de son aile : c'est cette somme qui décide
    // de la surface de circulation, et donc de TH2D-CIRC-004.
    const circulation = largeurs.reduce((a, b) => a + b, 0) * MIN_COULOIR;
    candidats.push({ H, largeurs, Ws, surface, circulation, ecart: Math.abs(surface - cible) });
  }
  if (!candidats.length) {
    return { pieces: null, motif: `aucune hauteur ne concilie ${ailes.length} aile(s) et la colonne du séjour` };
  }

  /* Deux passes, et l'ordre compte. La surface demandée n'est pas négociable :
     on retient d'abord les hauteurs qui la servent, puis, parmi elles, celle
     qui donne le moins de circulation.

     Sans cette seconde passe, `TH2D-CIRC-004` se déclenchait sur tous les
     grands logements — plusieurs hauteurs donnent la bonne surface, et rien ne
     départageait celle qui étire les ailes de celle qui les resserre. */
  const ecartMin = Math.min(...candidats.map((c) => c.ecart));
  const acceptables = candidats.filter((c) => c.ecart <= ecartMin + Math.max(0.5, cible * 0.01));
  const meilleur = acceptables.reduce((a, b) => (b.circulation < a.circulation ? b : a), acceptables[0]);

  const { H, largeurs, Ws } = meilleur;
  let pieces = [];
  let x = 0;
  // La colonne se glisse après la première aile : elle est centrale dès qu'il
  // y a deux couloirs, à droite quand il n'y en a qu'un.
  ailes.forEach(([bandeN, bandeS], k) => {
    const W = largeurs[k];
    const pN = profondeurPour(bandeN, W);
    pieces.push(...poserBande(bandeN, x, 0, W, pN));
    pieces.push({ id: couloirs[k].id, parts: [{ role: 'main', x0: x, y0: pN, x1: x + W, y1: pN + MIN_COULOIR }] });
    pieces.push(...poserBande(bandeS, x, pN + MIN_COULOIR, W, H - pN - MIN_COULOIR));
    x += W;
    if (k === 0) {
      pieces.push({ id: sejour.id, parts: [{ role: 'main', x0: x, y0: 0, x1: x + Ws, y1: H }] });
      x += Ws;
    }
  });

  if (random && random() < 0.5) pieces = transposer(pieces);
  return { pieces, motif: null, largeur: x, hauteur: H, surface: meilleur.surface, cible };
}

/** Rejoue la pose avec une cible corrigée jusqu'à ce que l'habitable tombe juste. */
export function viser(programme, poseur, surfaceVoulue, assembler, essais = 12) {
  let cible = surfaceVoulue;
  let dernier = null;
  for (let i = 0; i < essais; i += 1) {
    const pose = poseur(programme, cible);
    if (!pose.pieces) return pose;
    const plan = assembler(pose.pieces);
    dernier = { pose, plan };
    if (Math.abs(plan.habitableArea - surfaceVoulue) < 0.002) return { ...pose, plan };
    cible *= surfaceVoulue / plan.habitableArea;
  }
  return dernier ? { ...dernier.pose, plan: dernier.plan } : { pieces: null, motif: 'la mise à la cible ne converge pas' };
}

/* --- Repli : disposition en bandes, sans colonne ----------------------------

   La colonne centrale suppose un séjour assez grand pour tenir toute la
   hauteur du plan à 3,00 m de large au moins. Sous 50 m², il ne l'est pas —
   un T2 de 45 m² a un séjour de treize mètres carrés, il lui faudrait une
   colonne de 2,40 m. Le refus était donc structurel, et il aurait interdit au
   moteur de servir les petits programmes.

   Un petit logement n'a de toute façon pas de distribution centrale : il a un
   dégagement, et les pièces autour. On retombe alors sur des bandes empilées,
   séjour compris, le couloir traversant la largeur. Ce qui coûtait
   `TH2D-CIRC-004` sur les grands plans est sans effet ici : à cette taille le
   couloir est court, et son plafond n'est jamais atteint.

   Ce n'est pas un mélange de méthodes — c'est la même famille, avec ou sans
   colonne selon que le séjour peut en porter une. */
function poserEnBandes(programme, cibleForcee, random) {
  const couloirs = programme.rooms.filter((r) => r.type === 'circulation');
  if (!couloirs.length) return { pieces: null, motif: 'aucune circulation au programme' };

  const cuisine = programme.rooms.find((r) => r.type === 'kitchen');
  const sejour = programme.rooms.find((r) => r.type === 'living');
  const desservies = programme.rooms.filter((r) => r.type !== 'circulation').map(contraintes);
  const nbBandes = couloirs.length + 1;
  if (desservies.length < nbBandes) return { pieces: null, motif: 'trop peu de pièces pour les bandes' };

  const cibleProgramme = programme.rooms.reduce((s, r) => s + r.targetArea, 0);
  const cible = Number.isFinite(cibleForcee) && cibleForcee > 0 ? cibleForcee : cibleProgramme;
  const facteur = cible / cibleProgramme;
  desservies.forEach((p) => { p.aire *= facteur; });

  let bandes = repartir(desservies, nbBandes, random);
  if (bandes.some((b) => !b.length)) return { pieces: null, motif: 'une bande resterait vide' };

  // La cuisine se pose contre le séjour : même bande, juste après lui.
  if (cuisine && sejour) {
    const cC = desservies.find((p) => p.id === cuisine.id);
    const sC = desservies.find((p) => p.id === sejour.id);
    bandes = bandes.map((b) => b.filter((p) => p !== cC));
    const iB = bandes.findIndex((b) => b.includes(sC));
    if (iB < 0) return { pieces: null, motif: 'séjour introuvable dans les bandes' };
    bandes[iB] = [...bandes[iB].slice(0, bandes[iB].indexOf(sC) + 1), cC, ...bandes[iB].slice(bandes[iB].indexOf(sC) + 1)];
  }
  if (bandes.some((b) => !b.length)) return { pieces: null, motif: 'une bande resterait vide' };

  const domaines = bandes.map((b) => ({
    min: b.reduce((s, p) => s + p.minLargeur, 0),
    max: largeurBande(b, profondeurMinimale(b))
  }));
  const wMin = Math.max(...domaines.map((d) => d.min));
  const wMax = Math.min(...domaines.map((d) => d.max));
  if (wMin > wMax) return { pieces: null, motif: 'domaines de bande incompatibles' };

  const candidats = [];
  const PAS = 90;
  for (let i = 0; i <= PAS; i += 1) {
    const W = wMin + (wMax - wMin) * (i / PAS);
    const profondeurs = bandes.map((b) => profondeurPour(b, W));
    if (profondeurs.some((p) => p === null)) continue;
    const H = profondeurs.reduce((a, b) => a + b, 0) + couloirs.length * MIN_COULOIR;
    const surface = W * H;
    candidats.push({ W, profondeurs, surface, circulation: W * MIN_COULOIR * couloirs.length, ecart: Math.abs(surface - cible) });
  }
  if (!candidats.length) return { pieces: null, motif: 'aucune largeur ne dimensionne les bandes' };
  const ecartMin = Math.min(...candidats.map((c) => c.ecart));
  const acceptables = candidats.filter((c) => c.ecart <= ecartMin + Math.max(0.5, cible * 0.01));
  const meilleur = acceptables.reduce((a, b) => (b.circulation < a.circulation ? b : a), acceptables[0]);

  const { W, profondeurs } = meilleur;
  let pieces = [];
  let y = 0;
  bandes.forEach((bande, k) => {
    pieces.push(...poserBande(bande, 0, y, W, profondeurs[k]));
    y += profondeurs[k];
    if (k < couloirs.length) {
      pieces.push({ id: couloirs[k].id, parts: [{ role: 'main', x0: 0, y0: y, x1: W, y1: y + MIN_COULOIR }] });
      y += MIN_COULOIR;
    }
  });
  if (random && random() < 0.5) pieces = transposer(pieces);
  return { pieces, motif: null, largeur: W, hauteur: y, surface: meilleur.surface, cible };
}

/* Une répartition qui échoue n'est pas un programme impossible.

   Les deux ailes doivent partager une hauteur, et chacune n'en admet qu'un
   intervalle ; l'intersection peut être vide pour une répartition et pleine
   pour une autre. La version qui n'en essayait qu'une refusait vingt et un
   plans sur trente à 100 m² — non parce que le programme ne tenait pas, mais
   parce qu'un seul découpage avait été tenté.

   Huit essais, dérivés de la graine, donc rejouables. Le refus final n'est
   prononcé qu'après les avoir tous épuisés, et il porte alors le motif du
   dernier — c'est le critère « sait dire l'impossible », qui n'a de valeur que
   s'il ne se déclenche pas trop tôt. */
export function couloirsDesservants(programme, cibleForcee, graine) {
  if (!Number.isFinite(graine)) {
    const direct = poserUneFois(programme, cibleForcee, null);
    return direct.pieces ? direct : poserEnBandes(programme, cibleForcee, null);
  }
  let motif = null;
  for (let essai = 0; essai < 8; essai += 1) {
    const random = randomFrom((graine + Math.imul(essai, 0x9E3779B1)) >>> 0);
    const pose = poserUneFois(programme, cibleForcee, random);
    if (pose.pieces) return pose;
    motif = pose.motif;
  }
  /* Le repli n'intervient qu'après avoir épuisé les huit essais en colonne.
     Le placer dans la boucle le déclenchait dès le premier découpage
     malheureux — et il servait alors des plans en bandes là où une colonne
     était possible, faisant tomber les adjacences de 100 % à 96,9 % et
     rallumant `TH2D-FACADE-001`. Un repli qui passe devant n'est plus un
     repli. */
  for (let essai = 0; essai < 8; essai += 1) {
    const random = randomFrom((graine + Math.imul(essai, 0x85EBCA6B)) >>> 0);
    const bandes = poserEnBandes(programme, cibleForcee, random);
    if (bandes.pieces) return bandes;
    motif = bandes.motif;
  }
  return { pieces: null, motif };
}
