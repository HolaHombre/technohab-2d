(function (root) {
  'use strict';

  /* Typologie de plan — le moteur ne cherche plus sa disposition, il la pose.
     Portage du prototype `scripts/proto/typologie2.mjs` ; DECOUPE_ET_GRAPHE.md
     §7 porte les mesures qui ont conduit à l'adopter.

     Le fondement tient en une mesure : le graphe demandé est une étoile sur
     840 plans sur 840 (§1.1). La forme de la réponse est donc connue d'avance —
     c'est le couloir desservant — et la chercher par tirage revenait à
     redécouvrir à chaque fois une disposition connue depuis un siècle.

     Ce fichier ne dépend que de lui-même : il reçoit un programme, il rend des
     rectangles. Aucune règle, aucune géométrie de mur, aucun tirage global.
     La mise à la surface demandée n'est pas ici — elle appartient au moteur,
     qui seul sait ce que les cloisons retirent. */

  const MIN_COULOIR = 1.20;
  const MIN_DESSERTE = 1.00;
  // Le programme exprime des cotes utiles ; la typologie pose la partition.
  // Même réserve que le squelette, afin qu'une chambre de 2,50 m ne tombe
  // pas à 2,40 m après extraction des faces intérieures.
  const RESERVE_CLOISONS = 0.10;

  /* Latitude de dimensionnement. Le plan n'a pas à servir la surface demandée
     au centimètre : une marge donne au modèle le jeu sans lequel il ne produit
     qu'une poignée de plans. Elle est ici plus serrée que celle du moteur, qui
     l'élargit encore en tirant lui-même la surface visée. */
  const TOLERANCE_SURFACE = 0.03;

  /* Paliers d'assouplissement, du plus au moins exigeant. On élargit d'abord
     ce qu'on peut se permettre — la surface — avant de toucher à la desserte.
     Les cotes de meublabilité, elles, ne bougent jamais. */
  const TOLERANCES = [0.03, 0.10, 0.25, 0.50];

  /* `relache` abandonne la largeur de desserte et ne garde que le côté
     meublable. Un plan très contraint — 45 m² pour deux chambres, cuisine
     séparée, WC et salle d'eau — n'admet parfois aucune disposition où chaque
     pièce offre encore 1,00 m de mur au couloir.

     On sert alors le plan sans cette garantie, et les règles le disent :
     `TH2D-GRAPH-001` signalera les dessertes trop courtes. Servir un plan
     imparfait en le signalant vaut mieux que ne rien servir — le moteur ne
     doit jamais rester sans réponse sur un programme que l'interface a
     accepté. */
  /* Un seul relâchement possible, et il ne touche PAS aux cotes de
     meublabilité : `minSide` reste opposable en toutes circonstances.

     Une version antérieure descendait jusqu'à un « plancher absolu » de
     0,60 m quand rien d'autre ne passait. Mesuré, cela produisait un WC de
     0,61 × 3,06 m, une cuisine de 0,99 × 7,79 et un séjour de 1,64 × 13,46 —
     67 pièces impraticables sur 1080. La hiérarchie était fausse : une pièce
     où l'on ne peut pas vivre est pire qu'une surface approximative.

     Ce qui se relâche désormais est la SURFACE (voir `TOLERANCES`), et en
     dernier ressort la largeur de desserte — celle qui laisse entrer une
     porte, non celle qui laisse poser un lit. */
  /* Fraction du côté minimal retenue en tout dernier ressort, quand aucune
     disposition ne sert un programme que sa propre surface condamne — cinq
     chambres dans 35 m². Ce n'est pas un plancher absolu : une version
     antérieure fixait 0,60 m pour toutes les pièces et produisait un séjour
     de 1,64 × 13,46 m. Une proportion garde au contraire les rapports entre
     pièces, et le plan reste lisible même s'il n'est pas conforme.
     `TH2D-ROOM-002` le signalera, comme le faisait l'ancien moteur. */
  const FRACTION_ULTIME = 0.6;

  function contraintes(room, relache) {
    const minSide = room.minSide || 0;
    if (relache >= 2) {
      /* Même dégradé, un rectangle ne descend pas sous le plus petit côté que
         le solveur d'agencement admette — `fit.narrowest()`, calculé depuis
         les équipements. Sans cette borne, la fraction produisait des WC de
         0,57 m : plus étroits que la cuvette qu'ils doivent contenir. Un plan
         dégradé reste un plan ; un plan impossible n'en est pas un. */
      const fit = root.TechnoHabFit;
      const petit = fit && fit.smallest ? fit.smallest(room.type) : null;
      /* On abandonne le plancher de DIGNITÉ D'USAGE — la convention qui veut
         qu'un séjour mérite 20 m² — mais jamais celui de MEUBLABILITÉ, que le
         solveur calcule depuis les équipements. C'est exactement la distinction
         posée dans `socle.data.js`, et c'est ici qu'elle sert : le premier est
         négociable quand la surface manque, le second ne l'est pas.

         Le rectangle doit dominer une paire admissible, pas seulement en
         égaler un côté : une borne prise sur le seul petit côté produisait
         encore des WC de 0,57 m. */
      const cote = petit ? Math.min(petit.w, petit.h) : minSide * FRACTION_ULTIME;
      const profond = petit ? Math.max(petit.w, petit.h) : minSide * FRACTION_ULTIME;
      return {
        id: room.id, type: room.type, aire: room.targetArea,
        minProfondeur: Math.min(profond, minSide) + RESERVE_CLOISONS,
        minLargeur: Math.min(cote, minSide) + RESERVE_CLOISONS
      };
    }
    return {
      id: room.id, type: room.type, aire: room.targetArea,
      minProfondeur: minSide + RESERVE_CLOISONS,
      minLargeur: (relache ? minSide : Math.max(minSide, MIN_DESSERTE)) + RESERVE_CLOISONS
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
  function poserUneFois(programme, cibleForcee, random, relache, tolerance) {
    const couloirs = programme.rooms.filter((r) => r.type === 'circulation');
    if (!couloirs.length) return { pieces: null, motif: 'aucune circulation au programme' };

    const sejour = programme.rooms.find((r) => r.type === 'living');
    if (!sejour) return { pieces: null, motif: 'pas de séjour : la colonne de liaison manque' };
    const colonne = contraintes(sejour, relache);

    const cuisine = programme.rooms.find((r) => r.type === 'kitchen');
    const desservies = programme.rooms
      .filter((r) => r.type !== 'circulation' && r.type !== 'living')
      .map(function (r) { return contraintes(r, relache); });
    if (desservies.length < couloirs.length * 2) {
      return { pieces: null, motif: `trop peu de pièces (${desservies.length}) pour ${couloirs.length} couloir(s)` };
    }

    const cibleProgramme = programme.rooms.reduce((s, r) => s + r.targetArea, 0);
    const cible = Number.isFinite(cibleForcee) && cibleForcee > 0 ? cibleForcee : cibleProgramme;
    const facteur = cible / cibleProgramme;
    [...desservies, colonne].forEach((p) => { p.aire *= facteur; });

    /* Répartition entre ailes : LIBRE, et c'est le moteur qui enregistrera
       ensuite quelle pièce a été rattachée à quel dégagement.

       Elle était auparavant lue dans le graphe demandé, lui-même calculé par
       `buildProgram()` en équilibrant les aires. Ce partage figé produisait
       toujours les mêmes groupes — une répartition jour/nuit imposée d'avance,
       identique d'un tirage à l'autre : les plans changeaient de cotes sans
       changer d'organisation, et la diversité mesurée était en trompe-l'œil.

       Le graphe n'exige pas qu'une chambre ouvre sur CE dégagement, seulement
       qu'elle ouvre sur UN dégagement. Cette latitude appartient donc à la
       disposition. La leçon de la v1 tient toujours — deux endroits ne peuvent
       pas décider séparément de la même chose — mais elle se respecte en
       faisant SUIVRE le graphe, non en figeant la géométrie. */
    const aRepartir = desservies.filter((p) => p.type !== 'kitchen');
    const parAile = couloirs.length === 1
      ? [aRepartir]
      : repartir(aRepartir, couloirs.length, random);
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
    /* Deux passes, et l'ordre compte. La surface d'abord, la circulation
       ensuite — sans quoi `TH2D-CIRC-004` se déclenchait sur tous les grands
       logements.

       Mais retenir UN seul dimensionnement, celui qui colle au mètre carré
       près, étrangle la diversité : mesuré, le moteur plafonnait à seize plans
       distincts sur un T3 de 55 m², quel que soit le nombre de graines. La
       surface exacte n'était pas une qualité, c'était la contrainte qui
       supprimait toutes les variantes.

       La tolérance rend cette latitude au tirage : tous les dimensionnements
       qui servent la surface à `TOLERANCE` près sont admissibles, et la graine
       en choisit un — en préférant, à égalité, ceux qui économisent la
       circulation. */
    const ecartMin = Math.min(...candidats.map((c) => c.ecart));
    const marge = Math.max(0.5, cible * (tolerance || TOLERANCE_SURFACE));
    const acceptables = candidats.filter((c) => c.ecart <= Math.max(ecartMin, marge));
    acceptables.sort((a, b) => a.circulation - b.circulation);
    // Tirage biaisé vers le début : la moitié la plus économe est privilégiée,
    // sans que l'autre soit exclue.
    const meilleur = random
      ? acceptables[Math.floor(Math.pow(random(), 1.6) * acceptables.length)]
      : acceptables[0];

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
  function poserEnBandes(programme, cibleForcee, random, relache, tolerance) {
    // Zéro couloir est un cas légitime ici, à la différence de la colonne :
    // c'est la disposition des studios et petits T2, où le séjour dessert.
    const couloirs = programme.rooms.filter((r) => r.type === 'circulation');

    const cuisine = programme.rooms.find((r) => r.type === 'kitchen');
    const sejour = programme.rooms.find((r) => r.type === 'living');
    const desservies = programme.rooms.filter((r) => r.type !== 'circulation').map(function (r) { return contraintes(r, relache); });
    /* Sans couloir — studios et petits T2 — le séjour EST le dégagement. Deux
       bandes suffisent : lui d'un côté, tout le reste de l'autre, et chaque
       pièce le borde. `buildProgram()` ne crée de circulation qu'à partir de
       quatre pièces ; sans ce cas, le moteur ne savait plus servir les
       programmes qui n'en ont pas. */
    const nbBandes = couloirs.length ? couloirs.length + 1 : 2;
    if (desservies.length < nbBandes) return { pieces: null, motif: 'trop peu de pièces pour les bandes' };

    const cibleProgramme = programme.rooms.reduce((s, r) => s + r.targetArea, 0);
    const cible = Number.isFinite(cibleForcee) && cibleForcee > 0 ? cibleForcee : cibleProgramme;
    const facteur = cible / cibleProgramme;
    desservies.forEach((p) => { p.aire *= facteur; });

    let bandes;
    if (!couloirs.length) {
      const sC = desservies.find((p) => p.type === 'living');
      if (!sC) return { pieces: null, motif: 'pas de séjour pour desservir sans couloir' };
      const autres = desservies.filter((p) => p !== sC);
      if (!autres.length) return { pieces: null, motif: 'rien à desservir' };
      bandes = [[sC], random ? melange(autres, random) : autres];
    } else {
      bandes = repartir(desservies, nbBandes, random);
    }
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
    /* Deux passes, et l'ordre compte. La surface d'abord, la circulation
       ensuite — sans quoi `TH2D-CIRC-004` se déclenchait sur tous les grands
       logements.

       Mais retenir UN seul dimensionnement, celui qui colle au mètre carré
       près, étrangle la diversité : mesuré, le moteur plafonnait à seize plans
       distincts sur un T3 de 55 m², quel que soit le nombre de graines. La
       surface exacte n'était pas une qualité, c'était la contrainte qui
       supprimait toutes les variantes.

       La tolérance rend cette latitude au tirage : tous les dimensionnements
       qui servent la surface à `TOLERANCE` près sont admissibles, et la graine
       en choisit un — en préférant, à égalité, ceux qui économisent la
       circulation. */
    const ecartMin = Math.min(...candidats.map((c) => c.ecart));
    const marge = Math.max(0.5, cible * (tolerance || TOLERANCE_SURFACE));
    const acceptables = candidats.filter((c) => c.ecart <= Math.max(ecartMin, marge));
    acceptables.sort((a, b) => a.circulation - b.circulation);
    // Tirage biaisé vers le début : la moitié la plus économe est privilégiée,
    // sans que l'autre soit exclue.
    const meilleur = random
      ? acceptables[Math.floor(Math.pow(random(), 1.6) * acceptables.length)]
      : acceptables[0];

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
  /* Ordre des tentatives, du plus exigeant au moins exigeant. Il compte, et
     chaque palier a été posé après une mesure :

     1. colonne centrale, cotes strictes, surface serrée — la bonne
        disposition, celle qui donne 100 % d'adjacences ;
     2. bandes empilées, mêmes exigences — repli de disposition. Il
        n'intervient qu'APRÈS les huit essais en colonne : placé dans la
        boucle, il servait des bandes là où une colonne était possible, et les
        adjacences tombaient de 100 % à 96,9 % ;
     3. les mêmes, avec une tolérance de surface élargie par paliers. C'est ce
        qu'on peut céder sans abîmer un plan ;
     4. en dernier ressort seulement, la largeur de desserte — celle qui laisse
        entrer une porte. `TH2D-GRAPH-001` le signalera.

     Les cotes de meublabilité ne sont à aucun moment relâchées : un plan qu'on
     ne peut pas habiter n'est pas un plan dégradé, c'est un plan faux. */
  /* --- Filet de sécurité ------------------------------------------------------
     Pose sans aucune contrainte : bandes de profondeur proportionnelle à
     l'aire, couloirs intercalés, séjour en tête. Ne peut pas échouer.

     Il existe parce qu'un générateur ne doit jamais rendre la main sans plan :
     l'interface a accepté la demande, et c'est aux règles de dire ce qui ne va
     pas. Mesuré, 224 programmes sur 1344 n'aboutissaient pas sans lui —
     surtout des surfaces trop petites pour leur programme, que les paliers
     précédents refusent tous à juste titre.

     Le plan qu'il produit est mauvais, et il doit le rester : aucune
     amélioration ne doit être tentée ici, sans quoi il se mettrait à passer
     devant les dispositions justes. */
  function poserSecours(programme, cible) {
    const couloirs = programme.rooms.filter((r) => r.type === 'circulation');
    const autres = programme.rooms.filter((r) => r.type !== 'circulation');
    if (!autres.length) return { pieces: null, motif: 'programme vide' };

    const aire = Math.max(1, cible || autres.reduce((s, r) => s + r.targetArea, 0));
    const W = Math.sqrt(aire * 1.4);
    const parBande = Math.max(1, Math.ceil(autres.length / (couloirs.length + 1)));
    const bandes = [];
    for (let i = 0; i < autres.length; i += parBande) bandes.push(autres.slice(i, i + parBande));

    const pieces = [];
    let y = 0;
    bandes.forEach((bande, k) => {
      const aireBande = bande.reduce((s, r) => s + r.targetArea, 0);
      const prof = Math.max(0.6, aireBande / W);
      let x = 0;
      bande.forEach((room, i) => {
        const w = i === bande.length - 1 ? W - x : Math.max(0.6, room.targetArea / prof);
        pieces.push({ id: room.id, parts: [{ role: 'main', x0: x, y0: y, x1: Math.max(x + 0.6, x + w), y1: y + prof }] });
        x += w;
      });
      y += prof;
      if (k < couloirs.length) {
        pieces.push({ id: couloirs[k].id, parts: [{ role: 'main', x0: 0, y0: y, x1: W, y1: y + MIN_COULOIR }] });
        y += MIN_COULOIR;
      }
    });
    // Les couloirs qu'aucune bande n'a intercalés se posent à la suite.
    for (let k = bandes.length - 1; k < couloirs.length; k += 1) {
      if (k < 0) continue;
      if (pieces.some((pc) => pc.id === couloirs[k].id)) continue;
      pieces.push({ id: couloirs[k].id, parts: [{ role: 'main', x0: 0, y0: y, x1: W, y1: y + MIN_COULOIR }] });
      y += MIN_COULOIR;
    }
    return { pieces, motif: null, largeur: W, hauteur: y, secours: true };
  }

  function couloirsDesservants(programme, cibleForcee, graine) {
    if (!Number.isFinite(graine)) {
      const direct = poserUneFois(programme, cibleForcee, null, false, TOLERANCES[0]);
      if (direct.pieces) return direct;
      return poserEnBandes(programme, cibleForcee, null, false, TOLERANCES[0]);
    }

    let motif = null;
    const tenter = (poseur, essais, sel, relache, tolerance) => {
      for (let essai = 0; essai < essais; essai += 1) {
        const random = randomFrom((graine + Math.imul(essai + 1, sel)) >>> 0);
        const pose = poseur(programme, cibleForcee, random, relache, tolerance);
        if (pose.pieces) return pose;
        motif = pose.motif;
      }
      return null;
    };

    let pose = tenter(poserUneFois, 8, 0x9E3779B1, false, TOLERANCES[0]);
    if (pose) return pose;
    pose = tenter(poserEnBandes, 8, 0x85EBCA6B, false, TOLERANCES[0]);
    if (pose) return pose;

    for (let i = 1; i < TOLERANCES.length; i += 1) {
      pose = tenter(poserUneFois, 4, 0xC2B2AE35 + i, false, TOLERANCES[i]);
      if (pose) return pose;
      pose = tenter(poserEnBandes, 4, 0x27D4EB2F + i, false, TOLERANCES[i]);
      if (pose) return pose;
    }

    // Avant-dernier ressort : la largeur de desserte cède — celle qui laisse
    // entrer une porte, pas celle qui laisse poser un lit.
    for (let i = 0; i < TOLERANCES.length; i += 1) {
      pose = tenter(poserUneFois, 3, 0x165667B1 + i, 1, TOLERANCES[i]);
      if (pose) return pose;
      pose = tenter(poserEnBandes, 3, 0x9E3779B9 + i, 1, TOLERANCES[i]);
      if (pose) return pose;
    }

    /* Dernier ressort, réservé aux programmes que leur surface condamne. Le
       moteur doit rendre un plan : l'interface a accepté la demande, et c'est
       aux règles de dire pourquoi elle ne tient pas — pas au générateur de
       rester muet. */
    for (let i = 0; i < TOLERANCES.length; i += 1) {
      pose = tenter(poserUneFois, 3, 0x2545F491 + i, 2, TOLERANCES[i]);
      if (pose) return pose;
      pose = tenter(poserEnBandes, 3, 0x94D049BB + i, 2, TOLERANCES[i]);
      if (pose) return pose;
    }
    const secours = poserSecours(programme, cibleForcee);
    return secours.pieces ? secours : { pieces: null, motif };
  }

  root.TechnoHabTypologie = {
    poser: couloirsDesservants,
    minCouloir: MIN_COULOIR,
    minDesserte: MIN_DESSERTE
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
