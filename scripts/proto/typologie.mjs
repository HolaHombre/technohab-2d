// PROTOTYPE — jetable. Essai typologie, protocole APPROCHES_GENERATION.md §8.
//
// Ce fichier n'est pas une implémentation : il répond à une question et se
// jette. La question est : « les adjacences passent-elles à 100 % ? »
//
// Il ne tire rien au hasard. Il pose une disposition connue — le couloir
// desservant de part et d'autre — et calcule ses dimensions. C'est tout
// l'objet de l'essai : DECOUPE_ET_GRAPHE.md §1.1 a établi que le graphe
// demandé est une étoile sur 840 plans sur 840, donc que la forme de la
// réponse est connue d'avance et n'a pas à être cherchée.
//
// Sortie : le tableau `pieces` attendu par `assemblerPlan()`, ou `null` avec
// un motif. Rendre `null` n'est pas un échec du prototype — c'est le critère
// « sait dire l'impossible » du protocole, qu'aucune méthode par tirage ne
// sait honorer.

const MIN_COULOIR = 1.20;

/* Largeur minimale de contact pour qu'une porte tienne — `minDesserte` du
   moteur, 0,80 m de vantail plus ses tableaux.

   Il faut la distinguer de `minSide`, et l'essai l'a appris à ses dépens : un
   WC a 0,90 m de côté minimal, donc une largeur de bande de 0,90 m suffit à
   le meubler — mais elle ne suffit pas à le desservir. Posé à sa largeur
   minimale, il touche le couloir sur 0,90 m et aucune porte n'y entre.

   Une pièce qui borde un couloir a donc DEUX minima, et ils ne portent pas
   sur la même chose : `minSide` en profondeur, `max(minSide, MIN_DESSERTE)`
   en largeur. Le moteur actuel ne fait pas cette distinction — il ne place
   pas les pièces en connaissance du graphe, donc la question ne s'y pose
   jamais explicitement. */
const MIN_DESSERTE = 1.00;

// Deux minima distincts par pièce : celui qui la rend meublable, et celui qui
// la rend desservable.
function contraintes(room) {
  const minSide = room.minSide || 0;
  return {
    id: room.id, type: room.type, aire: room.targetArea,
    minProfondeur: minSide,
    minLargeur: Math.max(minSide, MIN_DESSERTE)
  };
}

/* --- Diversité --------------------------------------------------------------

   Une typologie est déterministe : un programme donne un plan, toujours le
   même. C'est le cas n°2 pré-enregistré au protocole §8 — « adjacences à
   100 % mais diversité effondrée » — et il ne se répare pas en changeant de
   méthode, mais en faisant varier ce que la topologie laisse libre.

   Quatre libertés, aucune ne touche aux adjacences puisque aucune ne change
   le fait qu'une pièce borde son couloir :
     - la répartition des pièces entre les deux bandes ;
     - leur ordre dans une bande ;
     - l'échange des deux bandes ;
     - la transposition du plan, qui rend le couloir vertical.

   Le tirage est rejouable (D4) : même graine, même plan. */
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

/* Répartit les pièces en deux bandes d'aires aussi proches que possible.
   Glouton par aire décroissante (LPT) : sur trois à dix pièces, il est
   optimal ou à un cheveu de l'être, et son coût est nul.

   Avec un tirage, l'ordre de passage est perturbé — ce qui donne d'autres
   répartitions, toutes admissibles. L'équilibre exact n'a jamais été le but :
   c'est la contrainte de côté minimal qui tranche. */
function deuxBandes(pieces, random) {
  const nord = [], sud = [];
  let aireNord = 0, aireSud = 0;
  const ordre = random
    ? [...pieces].sort((a, b) => (b.aire * (0.75 + random() * 0.5)) - (a.aire * (0.75 + random() * 0.5)))
    : [...pieces].sort((a, b) => b.aire - a.aire);
  for (const p of ordre) {
    if (aireNord <= aireSud) { nord.push(p); aireNord += p.aire; }
    else { sud.push(p); aireSud += p.aire; }
  }
  return { nord, sud, aireNord, aireSud };
}

/** Transpose un plan : le couloir passe de l'horizontale à la verticale. */
function transposer(pieces) {
  return pieces.map((p) => ({
    id: p.id,
    parts: p.parts.map((q) => ({ role: q.role, x0: q.y0, y0: q.x0, x1: q.y1, y1: q.x1 }))
  }));
}

/* --- Dimensionner une bande -----------------------------------------------

   Première version : largeur au prorata de l'aire cible, à profondeur
   constante. Elle ne tient pas, et l'échec est instructif — un WC de 1,5 m²
   dans une bande de 3,20 m de profond devient une lamelle de 47 cm. Les aires
   d'un programme vont de 1,5 à 30 m² ; leur imposer la même profondeur rend
   les petites pièces impraticables.

   Ce que fait un plan réel : la profondeur de bande est commune, et une pièce
   trop petite pour cette profondeur **prend plus que sa part** plutôt que de
   s'amincir. C'est le domaine contraint dont parle APPROCHES_GENERATION.md
   §2.C : une fois la topologie fixée, les aires ne sont plus libres.

   D'où la largeur retenue :  ℓ = max(minSide, aire / profondeur)

   La somme des ℓ décroît quand la profondeur augmente, entre deux bornes :
   Σ minSide quand la profondeur tend vers l'infini, et Σ ℓ(profondeur
   minimale) à l'autre bout. Pour une largeur d'enveloppe donnée et comprise
   entre les deux, la profondeur se trouve par dichotomie. */

function largeurBande(pieces, profondeur) {
  return pieces.reduce((s, p) => s + Math.max(p.minLargeur, p.aire / profondeur), 0);
}

// La profondeur ne peut pas descendre sous le côté minimal de la pièce la
// plus exigeante : c'est elle qui borne la bande.
function profondeurMinimale(pieces) {
  return pieces.reduce((m, p) => Math.max(m, p.minProfondeur), 0);
}

/** Profondeur donnant exactement cette largeur, ou null si hors domaine. */
function profondeurPour(pieces, largeur) {
  if (!pieces.length) return null;
  let bas = profondeurMinimale(pieces);
  let haut = bas;
  // La largeur décroît avec la profondeur : on cherche d'abord une profondeur
  // assez grande pour passer sous la cible.
  for (let i = 0; i < 40 && largeurBande(pieces, haut) > largeur; i += 1) haut *= 1.35;
  if (largeurBande(pieces, bas) < largeur) return null;   // bande trop courte même au plus serré
  if (largeurBande(pieces, haut) > largeur) return null;  // bande trop large même au plus profond
  for (let i = 0; i < 60; i += 1) {
    const milieu = (bas + haut) / 2;
    if (largeurBande(pieces, milieu) > largeur) bas = milieu; else haut = milieu;
  }
  return (bas + haut) / 2;
}

/* Pose une bande : chaque pièce occupe toute la profondeur et borde donc le
   couloir sur toute sa largeur. L'adjacence n'est pas espérée, elle est une
   propriété de la disposition — c'est tout l'objet de l'essai. */
function poserBande(pieces, x0, y0, largeur, profondeur) {
  if (!pieces.length) return [];
  let x = x0;
  return pieces.map((p, i) => {
    // La dernière absorbe l'arrondi : sans quoi le pavage laisserait un filet
    // sans propriétaire, que TH2D-RESERVE-001 signalerait.
    const w = i === pieces.length - 1
      ? (x0 + largeur) - x
      : Math.max(p.minLargeur, p.aire / profondeur);
    const boite = { id: p.id, parts: [{ role: 'main', x0: x, y0, x1: x + w, y1: y0 + profondeur }] };
    x += w;
    return boite;
  });
}

/**
 * Couloir desservant traversant, pièces de part et d'autre.
 *
 *   ┌─────────┬────────┬────────┐
 *   │  bande nord               │
 *   ├───────────────────────────┤
 *   │  COULOIR                  │
 *   ├─────────┬────────┬────────┤
 *   │  bande sud                │
 *   └─────────┴────────┴────────┘
 *
 * @param programme  sortie de buildProgram()
 * @param ratio      allongement de l'enveloppe, largeur / hauteur
 */
/* --- Viser la bonne surface -------------------------------------------------

   `fitHabitable()` ne sait qu'AGRANDIR (`Math.max(1, factor)`) : un plan dont
   l'habitable dépasse déjà la cible n'est jamais ramené, et
   `TH2D-RESERVE-001` le refuse. Or la typologie dépasse par construction —
   imposer 1,00 m de contact à un WC de 1,5 m² lui fait prendre 3,5 m².

   Première correction essayée : une homothétie du plan posé. **Fausse**, et
   la mesure l'a dit tout de suite — elle rétrécit aussi le couloir, qui passe
   sous 1,20 m, et `TH2D-CIRC-001` se déclenche sur trois programmes. Une
   largeur réglementaire ne se met pas à l'échelle.

   La bonne façon est de rejouer la typologie avec une cible corrigée : les
   cotes minimales restent ce qu'elles sont, seules les aires cibles bougent.
   C'est `viser()`, qui itère jusqu'à ce que l'habitable tombe juste. */
export function viser(programme, poseur, surfaceVoulue, assembler, essais = 12) {
  let cible = surfaceVoulue;
  let dernier = null;
  for (let i = 0; i < essais; i += 1) {
    const pose = poseur(programme, cible);
    if (!pose.pieces) return pose;
    const plan = assembler(pose.pieces);
    dernier = { pose, plan };
    const ecart = plan.habitableArea - surfaceVoulue;
    /* Tolérance serrée : `TH2D-WALL-004` refuse un écart de 0,02 m² et
       `TH2D-RESERVE-001` de 0,09. Une convergence approximative ne produit
       pas un plan approximatif, elle produit un plan refusé. */
    if (Math.abs(ecart) < 0.002) return { ...pose, plan };
    // L'habitable réagit à peu près proportionnellement à la cible : une
    // correction multiplicative converge en deux ou trois passes.
    cible *= surfaceVoulue / plan.habitableArea;
  }
  return dernier ? { ...dernier.pose, plan: dernier.plan } : { pieces: null, motif: 'la mise à la cible ne converge pas' };
}

export function couloirDesservant(programme, cibleForcee, graine) {
  const random = Number.isFinite(graine) ? randomFrom(graine) : null;
  const couloirs = programme.rooms.filter((r) => r.type === 'circulation');
  if (couloirs.length !== 1) return { pieces: null, motif: 'typologie mono-couloir : le programme n’en demande pas un seul' };

  const desservies = programme.rooms
    .filter((r) => r.type !== 'circulation')
    .map(contraintes);
  if (desservies.length < 2) return { pieces: null, motif: 'moins de deux pièces à desservir' };

  /* La cible peut être imposée par `viser()`, qui la corrige jusqu'à ce que
     la surface habitable tombe juste. À défaut, c'est celle du programme. */
  const cibleProgramme = programme.rooms.reduce((s, r) => s + r.targetArea, 0);
  const cible = Number.isFinite(cibleForcee) && cibleForcee > 0 ? cibleForcee : cibleProgramme;
  // Les aires cibles suivent la correction, jamais les cotes minimales.
  const facteur = cible / cibleProgramme;
  desservies.forEach((p) => { p.aire *= facteur; });

  const { nord, sud } = deuxBandes(desservies, random);
  if (!nord.length || !sud.length) return { pieces: null, motif: 'une seule bande : rien à desservir de l’autre côté' };

  /* La corde du graphe. `DECOUPE_ET_GRAPHE.md` §1.1 : le graphe demandé est
     une étoile PLUS, une fois sur deux, l'arête `living–kitchen`. L'étoile est
     satisfaite par la disposition ; la corde ne l'est pas, et l'essai l'a
     montré en laissant `living~kitchen` manquante sur tous les programmes à
     cuisine séparée.

     Il suffit de poser la cuisine dans la même bande que le séjour et
     immédiatement à côté : deux pièces voisines d'une même bande partagent
     toute la profondeur de celle-ci, soit bien plus que la desserte due. */
  const cuisine = desservies.find((p) => p.type === 'kitchen');
  const sejour = desservies.find((p) => p.type === 'living');
  if (cuisine && sejour) {
    for (const bande of [nord, sud]) {
      const iC = bande.indexOf(cuisine);
      if (iC >= 0) bande.splice(iC, 1);
    }
    const bandeSejour = nord.includes(sejour) ? nord : sud;
    bandeSejour.splice(bandeSejour.indexOf(sejour) + 1, 0, cuisine);
  }
  if (!nord.length || !sud.length) return { pieces: null, motif: 'une seule bande après regroupement séjour-cuisine' };

  /* L'enveloppe se déduit de la disposition, elle n'est pas tirée : c'est le
     sens de « la typologie porte sa propre enveloppe » (arbitrage du 21 août).

     Le domaine des largeurs admissibles est l'intersection de ceux des deux
     bandes. On le balaye et on retient la largeur dont la surface totale
     approche le mieux le programme — la topologie est fixée, seule la
     dimension reste à choisir. */
  /* L'ordre dans une bande est libre : chaque pièce borde le couloir quelle
     que soit sa place. Seule exception, la cuisine reste collée au séjour —
     c'est la corde du graphe, posée juste au-dessus. */
  let bandeA = nord, bandeB = sud;
  if (random) {
    const brasser = (bande) => {
      const iS = bande.findIndex((p) => p.type === 'living');
      if (iS < 0) return melange(bande, random);
      // Séjour et cuisine forment un bloc insécable qu'on déplace ensemble.
      const bloc = bande.slice(iS, iS + (bande[iS + 1] && bande[iS + 1].type === 'kitchen' ? 2 : 1));
      const reste = melange(bande.filter((p) => !bloc.includes(p)), random);
      const at = Math.floor(random() * (reste.length + 1));
      return [...reste.slice(0, at), ...bloc, ...reste.slice(at)];
    };
    bandeA = brasser(nord); bandeB = brasser(sud);
    if (random() < 0.5) { const t = bandeA; bandeA = bandeB; bandeB = t; }
  }

  const domaine = (bande) => ({
    min: bande.reduce((s, p) => s + p.minLargeur, 0),
    max: largeurBande(bande, profondeurMinimale(bande))
  });
  const dN = domaine(bandeA), dS = domaine(bandeB);
  const wMin = Math.max(dN.min, dS.min);
  const wMax = Math.min(dN.max, dS.max);
  if (wMin > wMax) {
    return {
      pieces: null,
      motif: `domaines incompatibles : la bande nord admet ${dN.min.toFixed(2)}–${dN.max.toFixed(2)} m, la sud ${dS.min.toFixed(2)}–${dS.max.toFixed(2)} m`
    };
  }

  let meilleur = null;
  const PAS = 60;
  for (let i = 0; i <= PAS; i += 1) {
    const W = wMin + (wMax - wMin) * (i / PAS);
    const pN = profondeurPour(bandeA, W);
    const pS = profondeurPour(bandeB, W);
    if (pN === null || pS === null) continue;

    const surface = W * (pN + MIN_COULOIR + pS);
    const ecart = Math.abs(surface - cible);
    if (!meilleur || ecart < meilleur.ecart) meilleur = { W, pN, pS, surface, ecart };
  }

  if (!meilleur) {
    const coupable = desservies.reduce((pire, p) => (p.minProfondeur > pire.minProfondeur ? p : pire), desservies[0]);
    return {
      pieces: null,
      motif: `aucune largeur ne dimensionne les deux bandes : ${coupable.id} exige ${coupable.minProfondeur.toFixed(2)} m de côté`
    };
  }

  const { W, pN, pS } = meilleur;
  let pieces = [
    ...poserBande(bandeA, 0, 0, W, pN),
    { id: couloirs[0].id, parts: [{ role: 'main', x0: 0, y0: pN, x1: W, y1: pN + MIN_COULOIR }] },
    ...poserBande(bandeB, 0, pN + MIN_COULOIR, W, pS)
  ];
  // Transposer met le couloir à la verticale : même topologie, autre plan.
  if (random && random() < 0.5) pieces = transposer(pieces);
  return {
    pieces, motif: null,
    largeur: W, hauteur: pN + MIN_COULOIR + pS,
    // Écart au programme : la topologie contraint les aires, elle ne les sert
    // pas librement. C'est une grandeur à mesurer, pas un défaut à cacher.
    surface: meilleur.surface, cible, ecart: meilleur.ecart
  };
}

/**
 * Double distribution, séjour central — la réponse à « plusieurs espaces de
 * circulation », arbitrage du 21 août.
 *
 *   ┌───────┬────────┬───────┐
 *   │  bande nord            │
 *   ├───────────────────────-┤
 *   │  COULOIR 1             │
 *   ├───────┬────────┬───────┤
 *   │  bande centrale : SÉJOUR (et cuisine)   │
 *   ├───────────────────────-┤
 *   │  COULOIR 2             │
 *   ├───────┬────────┬───────┤
 *   │  bande sud             │
 *   └───────┴────────┴───────┘
 *
 * Les deux couloirs ne se touchent pas — l'arbitrage ne demande aucune
 * adjacence entre eux. Ils bordent tous deux la bande centrale, donc le
 * séjour : `TH2D-GRAPH-002` est satisfaite sans qu'un dégagement dépende
 * d'une pièce privative, et sans exiger la mitoyenneté couloir↔couloir qui a
 * fait échouer les deux tentatives dans la guillotine.
 *
 * Une première version plaçait deux ailes de part et d'autre d'un séjour en
 * colonne. Abandonnée : elle multipliait les domaines à faire coïncider — deux
 * ailes, deux bandes chacune, une colonne centrale — là où empiler cinq bandes
 * réutilise à l'identique le dimensionnement déjà éprouvé du mono-couloir.
 */
export function doubleDistribution(programme, cibleForcee, graine) {
  const random = Number.isFinite(graine) ? randomFrom(graine) : null;
  const couloirs = programme.rooms.filter((r) => r.type === 'circulation');
  if (couloirs.length !== 2) {
    return { pieces: null, motif: `typologie bi-couloir : le programme en demande ${couloirs.length}, pas deux` };
  }

  const centre = programme.rooms.filter((r) => r.type === 'living' || r.type === 'kitchen').map(contraintes);
  if (!centre.length) return { pieces: null, motif: 'pas de séjour pour relier les deux distributions' };

  const desservies = programme.rooms
    .filter((r) => r.type !== 'circulation' && r.type !== 'living' && r.type !== 'kitchen')
    .map(contraintes);
  if (desservies.length < 2) return { pieces: null, motif: 'moins de deux pièces à répartir sur deux distributions' };

  const cibleProgramme = programme.rooms.reduce((s, r) => s + r.targetArea, 0);
  const cible = Number.isFinite(cibleForcee) && cibleForcee > 0 ? cibleForcee : cibleProgramme;
  const facteur = cible / cibleProgramme;
  [...centre, ...desservies].forEach((p) => { p.aire *= facteur; });

  /* La répartition entre les deux distributions est LUE dans le graphe
     demandé, elle n'est pas redevinée.

     Première version : `deuxBandes()` la recalculait de son côté. Tant que
     les deux suivaient la même règle déterministe, elles coïncidaient — mais
     dès que le tirage a perturbé l'une, les adjacences sont tombées de 100 %
     à 63 %. La géométrie plaçait une chambre au nord pendant que le graphe la
     rattachait au couloir du sud.

     C'est le défaut même qu'on reproche à la guillotine, reproduit à
     l'identique : deux endroits décidant séparément d'une même chose. Le
     graphe fait autorité, la disposition l'exécute. */
  const groupe = (couloirId) => {
    const ids = new Set();
    for (const e of programme.desiredEdges || []) {
      if (e.a === couloirId) ids.add(e.b);
      else if (e.b === couloirId) ids.add(e.a);
    }
    return desservies.filter((p) => ids.has(p.id));
  };
  let g0 = groupe(couloirs[0].id);
  let g1 = groupe(couloirs[1].id);
  if (!g0.length || !g1.length) {
    // Aucun graphe exploitable : on retombe sur l'équilibrage par aires.
    const eq = deuxBandes(desservies);
    g0 = eq.nord; g1 = eq.sud;
  }

  /* Reste libre : l'ordre dans chaque bande, et le côté où chaque couloir se
     pose. Aucune des deux ne change la desserte — un couloir reste avec le
     groupe qu'il dessert. */
  let bA = g0, bB = g1, bC = centre;
  let cA = couloirs[0], cB = couloirs[1];
  if (random) {
    bA = melange(g0, random); bB = melange(g1, random);
    bC = melange(centre, random);
    if (random() < 0.5) {
      const tb = bA; bA = bB; bB = tb;
      const tc = cA; cA = cB; cB = tc;
    }
  }
  const bandes = [bA, bC, bB];
  const domaines = bandes.map((b) => ({
    min: b.reduce((s, p) => s + p.minLargeur, 0),
    max: largeurBande(b, profondeurMinimale(b))
  }));
  const wMin = Math.max(...domaines.map((d) => d.min));
  const wMax = Math.min(...domaines.map((d) => d.max));
  if (wMin > wMax) {
    return { pieces: null, motif: `domaines incompatibles entre les trois bandes (${wMin.toFixed(2)} > ${wMax.toFixed(2)} m)` };
  }

  let meilleur = null;
  const PAS = 60;
  for (let i = 0; i <= PAS; i += 1) {
    const W = wMin + (wMax - wMin) * (i / PAS);
    const profondeurs = bandes.map((b) => profondeurPour(b, W));
    if (profondeurs.some((p) => p === null)) continue;
    const surface = W * (profondeurs.reduce((s, p) => s + p, 0) + 2 * MIN_COULOIR);
    const ecart = Math.abs(surface - cible);
    if (!meilleur || ecart < meilleur.ecart) meilleur = { W, profondeurs, surface, ecart };
  }
  if (!meilleur) return { pieces: null, motif: 'aucune largeur ne dimensionne les trois bandes' };

  const { W, profondeurs } = meilleur;
  const [pN, pC, pS] = profondeurs;
  let y = 0;
  let pieces = [];
  pieces.push(...poserBande(bA, 0, y, W, pN)); y += pN;
  pieces.push({ id: cA.id, parts: [{ role: 'main', x0: 0, y0: y, x1: W, y1: y + MIN_COULOIR }] }); y += MIN_COULOIR;
  pieces.push(...poserBande(bC, 0, y, W, pC)); y += pC;
  pieces.push({ id: cB.id, parts: [{ role: 'main', x0: 0, y0: y, x1: W, y1: y + MIN_COULOIR }] }); y += MIN_COULOIR;
  pieces.push(...poserBande(bB, 0, y, W, pS)); y += pS;
  if (random && random() < 0.5) pieces = transposer(pieces);

  return { pieces, motif: null, largeur: W, hauteur: y, surface: meilleur.surface, cible };
}
