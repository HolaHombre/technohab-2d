(function (root) {
  'use strict';

  /* Squelette de circulation — la circulation d'abord, les pièces ensuite.

     Renversement de méthode adopté le 25 août 2026. Le poseur précédent
     empilait des bandes de pièces et glissait un couloir entre deux d'entre
     elles : la circulation était ce qui restait. Ici on pose d'abord le
     squelette, et les pièces remplissent les poches qu'il laisse.

     Ce que ce renversement a rendu, mesuré :

       - le couloir se coude. Un L, un T : les branches se touchent parce
         qu'elles appartiennent à la même pièce, sans mécanisme de contact ;
       - l'enveloppe se décroche. Deux poches de longueurs différentes laissent
         un retrait, et ce retrait EST la forme en L ;
       - la diversité devient réelle. L'ancienne méthode donnait 200 signatures
         géométriques pour 4 organisations distinctes — les mêmes plans
         redimensionnés. Le squelette en donne 45 sur un T4 de 100 m², à
         adjacences pleines et sans violation bloquante.

     Une POCHE est une bande de pièces bordant une branche sur toute sa
     longueur. Sa largeur et sa profondeur lui sont propres. L'adjacence n'est
     jamais cherchée : elle est une propriété de la disposition.

     Ce fichier ne dépend que de lui-même : il reçoit un programme, il rend des
     rectangles et les volumes de l'enveloppe. */

  const MIN_COULOIR = 1.20;
  const MIN_DESSERTE = 1.00;
  const TOLERANCE = 0.06;
  /* M4a.2 — une terminaison doit être lisible, sans devenir une nouvelle
     pièce. 45 cm est le minimum déjà retenu pour une bande de rangement ;
     75 cm rend le geste visible tout en conservant la desserte terminale. */
  const TERMINAISON_MIN = 0.45;
  const TERMINAISON_CIBLE = 0.75;
  // Les minima du programme décrivent l'espace utile, tandis que le
  // squelette pose la partition avant cloisons. Deux faces intérieures de
  // 10 cm retirent ensemble 10 cm à une pièce ; cette réserve évite qu'une
  // salle d'eau posée à 1,70 m ne tombe à 1,60 m une fois construite.
  const RESERVE_CLOISONS = 0.10;

  function contraintes(room) {
    const minSide = room.minSide || 0;
    /* O1 distingue l'aire programmée de l'enveloppe de pose. Une pièce à
       agrément nul reste programmée à son plancher, mais le squelette doit
       réserver jusqu'à son plafond pour ne pas fabriquer une lame impossible
       dans les ailes d'un U. Le surplus géométrique est ensuite transféré par
       le générateur ; il n'est jamais rendu à `targetArea`. */
    const aireDePose = room.agrement === 0 && Number.isFinite(room.maxArea)
      ? room.maxArea
      : room.targetArea;
    return {
      id: room.id, type: room.type, aire: aireDePose,
      agrement: room.agrement, maxArea: room.maxArea,
      minProfondeur: minSide + RESERVE_CLOISONS,
      minLargeur: Math.max(minSide + RESERVE_CLOISONS, MIN_DESSERTE)
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
    // Vingt-cinq dichotomies donnent une précision très inférieure au
    // millimètre ; les suivantes ne survivaient jamais à l'arrondi du
    // plan et alourdissaient surtout le premier appel à froid.
    for (let i = 0; i < 25; i += 1) {
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

  /* M5.0 — coude intérieur. Le premier L longeait toute une façade : depuis
     que M4a.2 valorise celle-ci, il ne pouvait raisonnablement plus gagner.
     Ce producteur pose le retour entre deux poches et réserve au groupe public
     la bande basse. Le réseau ne rencontre l'enveloppe que par ses deux bouts,
     comme un vrai dégagement coudé, sans quota ni prime de famille. */
  function enLInterieur(W, groupes) {
    const [ouest, est, publicGroup] = groupes;
    const minOuest = profondeurMinimale(ouest);
    const minEst = profondeurMinimale(est);
    if (minOuest + MIN_COULOIR + minEst > W) return null;
    const profondeurPublic = profondeurPour(publicGroup, W);
    if (profondeurPublic === null) return null;
    let meilleur = null;
    for (let i = 0; i <= 24; i += 1) {
      const disponible = W - MIN_COULOIR - minOuest - minEst;
      const profondeurOuest = minOuest + disponible * i / 24;
      const profondeurEst = W - MIN_COULOIR - profondeurOuest;
      if (profondeurEst + 0.001 < minEst) continue;
      const longueurEst = largeurBande(est, profondeurEst);
      const longueurOuest = longueurEst + MIN_COULOIR;
      if (largeurBande(ouest, profondeurOuest) > longueurOuest + 0.001) continue;
      const aireOuest = ouest.reduce((sum, piece) => sum + piece.aire, 0);
      const aireEst = est.reduce((sum, piece) => sum + piece.aire, 0);
      const ecart = Math.abs(profondeurOuest * longueurOuest - aireOuest) +
        Math.abs(profondeurEst * longueurEst - aireEst);
      if (!meilleur || ecart < meilleur.ecart) {
        meilleur = { profondeurOuest, profondeurEst, longueurOuest, longueurEst, ecart };
      }
    }
    if (!meilleur) return null;
    const m = meilleur;
    const H = m.longueurOuest + profondeurPublic;
    return {
      famille: 'L', W, H, aire: W * H,
      branches: [
        { x0: m.profondeurOuest, y0: 0,
          x1: m.profondeurOuest + MIN_COULOIR, y1: m.longueurOuest },
        { x0: m.profondeurOuest + MIN_COULOIR, y0: m.longueurEst,
          x1: W, y1: m.longueurOuest }
      ],
      volumes: [{ x0: 0, y0: 0, x1: W, y1: H }],
      poser: () => [
        ...poserPoche(ouest, {
          x0: m.profondeurOuest, y0: 0, largeur: m.longueurOuest,
          horizontal: false, vers: -1
        }, m.profondeurOuest),
        ...poserPoche(est, {
          x0: m.profondeurOuest + MIN_COULOIR, y0: 0, largeur: m.longueurEst,
          horizontal: false, vers: 1
        }, m.profondeurEst),
        ...poserPoche(publicGroup, {
          x0: 0, y0: m.longueurOuest, largeur: W,
          horizontal: true, vers: 1
        }, profondeurPublic)
      ]
    };
  }

  /* T : une barre, plus un retour au milieu. Trois poches.

     Les deux poches hautes n'ont plus à partager leur profondeur : c'était
     l'impasse de la première version. Chacune prend la sienne, et l'écart entre
     les deux devient un décrochement d'enveloppe — un escalier, pas un défaut.
     Le retour descend de la plus profonde jusqu'à la barre, donc il borde les
     deux. */
  function enTPlein(W, groupes) {
    const [gauche, droite, bas] = groupes;
    const domaineG = domaine(gauche), domaineD = domaine(droite);
    const longueurMin = Math.max(domaineG.min, domaineD.min);
    const longueurMax = Math.min(domaineG.max, domaineD.max);
    if (!(longueurMax >= longueurMin)) return null;
    let meilleur = null;
    /* Sept échantillons suffisent : la boucle extérieure explore déjà 35
       largeurs d'enveloppe. Le premier jet en balayait 61 à chaque largeur et
       faisait tripler le temps de génération sans changer la famille retenue. */
    for (let i = 0; i <= 6; i += 1) {
      const longueur = longueurMin + (longueurMax - longueurMin) * i / 6;
      const profondeurG = profondeurPour(gauche, longueur);
      const profondeurD = profondeurPour(droite, longueur);
      if (profondeurG === null || profondeurD === null) continue;
      const largeur = profondeurG + MIN_COULOIR + profondeurD;
      const profondeurB = profondeurPour(bas, largeur);
      if (profondeurB === null) continue;
      const ecart = Math.abs(largeur - W);
      if (!meilleur || ecart < meilleur.ecart) {
        meilleur = { longueur, profondeurG, profondeurD, profondeurB, largeur, ecart };
      }
    }
    if (!meilleur) return null;
    const m = meilleur;
    const H = m.longueur + MIN_COULOIR + m.profondeurB;
    return {
      famille: 'T', W: m.largeur, H,
      aire: m.largeur * H,
      branches: [
        { x0: m.profondeurG, y0: 0, x1: m.profondeurG + MIN_COULOIR, y1: m.longueur },
        { x0: 0, y0: m.longueur, x1: m.largeur, y1: m.longueur + MIN_COULOIR }
      ],
      volumes: [{ x0: 0, y0: 0, x1: m.largeur, y1: H }],
      poser: () => [
        ...poserPoche(gauche, {
          x0: m.profondeurG, y0: 0, largeur: m.longueur, horizontal: false, vers: -1
        }, m.profondeurG),
        ...poserPoche(droite, {
          x0: m.profondeurG + MIN_COULOIR, y0: 0, largeur: m.longueur, horizontal: false, vers: 1
        }, m.profondeurD),
        ...poserPoche(bas, {
          x0: 0, y0: m.longueur + MIN_COULOIR, largeur: m.largeur, horizontal: true, vers: 1
        }, m.profondeurB)
      ]
    };
  }

  function enT(W, groupes, retrait) {
    if (!(retrait > 0.05)) return enTPlein(W, groupes);
    const [gauche, droite, bas] = groupes;
    let Wb = largeurProche(bas, W);
    if (Wb === null) return null;
    const utile = W - MIN_COULOIR;
    if (utile <= 0) return null;
    // Le retour se place là où les deux poches hautes trouvent chacune une
    // largeur admissible ; le partage suit leurs aires.
    const aireG = gauche.reduce((s, p) => s + p.aire, 0);
    const aireD = droite.reduce((s, p) => s + p.aire, 0);
    const part = aireG / (aireG + aireD);
    let Wg = largeurProche(gauche, utile * part);
    let Wd = largeurProche(droite, (utile - (Wg === null ? 0 : Wg)) * (1 - (retrait || 0)));
    if (Wg === null || Wd === null) return null;
    let pG = profondeurPour(gauche, Wg);
    let pD = profondeurPour(droite, Wd);
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

  /* --- Desserte sans branche ---------------------------------------------------

     Un dégagement n'a pas à être une pièce. Dans un studio, le séjour EST le
     dégagement ; dans un petit T2, une pièce traversante peut l'être aussi.
     Le projet connaît déjà ce geste — la cuisine ouverte est versée au séjour,
     le WC à la salle d'eau — et la circulation n'a pas de raison d'y échapper.

     Première réaction devant les 60 `TH2D-GRAPH-002` : refuser le squelette
     quand le programme n'a pas de circulation, et rendre la main. C'était un
     contournement. Le squelette réservait l'espace d'une branche qui
     n'appartenait à personne, et séparait ainsi la salle d'eau du séjour ; il
     fallait lui apprendre à ne pas en réserver, pas à renoncer.

     Ici l'hôte occupe une poche entière et les autres pièces la bordent toutes
     par la frontière commune. Aucune branche, aucun mètre carré perdu en
     couloir, et des pièces moins linéaires — un séjour qui dessert est plus
     large qu'une bande longeant un corridor. */
  function sansBranche(W, groupes, retrait, formeVoulue) {
    const [hote, autres] = groupes;
    if (hote.length !== 1) return null;   // l'hôte dessert seul, il occupe sa poche
    const Wh = largeurProche(hote, W);
    if (Wh === null) return null;

    /* Sans couloir, la pièce hôte forme le socle de l'enveloppe et dessert les
       autres par son bord. La version initiale imposait deux bandes de même
       largeur : L et U demandés étaient alors étiquetés comme tels tout en
       restant rectangulaires. Le décrochement porte maintenant réellement sur
       la bande opposée ; pour un U, elle est scindée autour de l'encoche. */
    if (formeVoulue === 'uShape') {
      if (autres.length < 2) return null;
      const gauche = [], droite = [];
      let aireG = 0, aireD = 0;
      [...autres].sort((a, b) => b.aire - a.aire || a.id.localeCompare(b.id)).forEach((piece) => {
        if (aireG <= aireD) { gauche.push(piece); aireG += piece.aire; }
        else { droite.push(piece); aireD += piece.aire; }
      });
      /* Une cuisine séparée porte déjà la corde obligatoire séjour↔cuisine.
         En U, seule la dernière pièce de chaque colonne borde le séjour : la
         cuisine est donc calée au pied de son aile, et les autres pièces se
         desservent en chaîne le long de celle-ci. */
      const cuisine = autres.find((piece) => piece.type === 'kitchen');
      [gauche, droite].forEach((aile) => {
        const bains = aile.filter((piece) => piece.type === 'bath');
        const milieu = aile.filter((piece) => piece.type !== 'bath' && piece !== cuisine);
        const ordonnee = bains.concat(milieu, aile.includes(cuisine) ? [cuisine] : []);
        aile.splice(0, aile.length, ...ordonnee);
      });
      // Les pièces se rangent dans la longueur des ailes, pas côte à côte :
      // additionner toutes leurs largeurs minimales rendait un U impossible
      // dès trois chambres. La largeur d'une aile est le maximum des minima
      // de ses pièces ; leur aire décide ensuite de leur longueur.
      const Wg = profondeurMinimale(gauche);
      const Wd = profondeurMinimale(droite);
      if (Wg + Wd + MIN_DESSERTE > Wh) return null;
      const pH = profondeurPour(hote, Wh);
      const pG = gauche.reduce((s, p) => s + p.aire / Wg, 0);
      const pD = droite.reduce((s, p) => s + p.aire / Wd, 0);
      if (pH === null || gauche.some((p) => p.aire / Wg < p.minLargeur) ||
        droite.some((p) => p.aire / Wd < p.minLargeur)) return null;
      const haut = Math.max(pG, pD);
      const poserColonne = (pieces, x0, largeur, profondeur) => {
        let y = haut - profondeur;
        return pieces.map((p, index) => {
          const longueur = index === pieces.length - 1 ? haut - y : p.aire / largeur;
          const rect = { id: p.id, parts: [{ role: 'main', x0, y0: y, x1: x0 + largeur, y1: y + longueur }] };
          y += longueur;
          return rect;
        });
      };
      return {
        famille: 'desserte-integree-U', W: Wh, H: pH + haut,
        aire: Wh * pH + Wg * pG + Wd * pD,
        branches: [],
        volumes: [
          { x0: 0, y0: haut, x1: Wh, y1: haut + pH },
          { x0: 0, y0: haut - pG, x1: Wg, y1: haut },
          { x0: Wh - Wd, y0: haut - pD, x1: Wh, y1: haut }
        ],
        poser: () => [
          ...poserPoche(hote, { x0: 0, y0: haut, largeur: Wh, horizontal: true, vers: 1 }, pH),
          ...poserColonne(gauche, 0, Wg, pG),
          ...poserColonne(droite, Wh - Wd, Wd, pD)
        ]
      };
    }

    const Wa = largeurProche(autres,
      formeVoulue === 'lShape' ? Wh * (1 - (retrait || 0.24)) : Wh);
    if (Wa === null) return null;
    // Les deux poches doivent border la même frontière sur toute sa longueur,
    // sans quoi une pièce se retrouverait sans contact avec l'hôte.
    const large = formeVoulue === 'lShape' ? Math.max(Wh, Wa) : Math.min(Wh, Wa);
    const largeurHote = formeVoulue === 'lShape' ? Wh : large;
    const pH = profondeurPour(hote, largeurHote);
    const pA = profondeurPour(autres, Wa);
    if (pH === null || pA === null) return null;
    const H = pH + pA;
    const decroche = formeVoulue === 'lShape' && Math.abs(Wh - Wa) > 0.01;
    return {
      famille: decroche ? 'desserte-integree-L' : 'desserte-integree', W: large, H,
      aire: largeurHote * pH + Wa * pA,
      branches: [],
      volumes: decroche
        ? [{ x0: 0, y0: 0, x1: Wa, y1: pA }, { x0: 0, y0: pA, x1: largeurHote, y1: H }]
        : [{ x0: 0, y0: 0, x1: large, y1: H }],
      poser: () => [
        ...poserPoche(autres, { x0: 0, y0: pA, largeur: Wa, horizontal: true, vers: -1 }, pA),
        ...poserPoche(hote, { x0: 0, y0: pA, largeur: largeurHote, horizontal: true, vers: 1 }, pH)
      ]
    };
  }

  const FAMILLES = [
    { nom: 'barre', poches: 2, branche: true, construire: barre },
    { nom: 'L', poches: 2, branche: true, construire: enL },
    { nom: 'L-interieur', poches: 3, branche: true, construire: enLInterieur },
    { nom: 'T', poches: 3, branche: true, construire: enT },
    // `branche: false` — la desserte est assumée par une pièce, pas par un
    // couloir. Voir `sansBranche()`.
    { nom: 'desserte-integree', poches: 2, branche: false, construire: sansBranche }
  ];

  /* M3 — une stratégie n'est plus un tirage caché dans `poser()`. Elle nomme
     la famille géométrique et, lorsque nécessaire, la politique qui répartit
     les pièces dans ses poches. Barre, L et T explorent librement ; hall et
     jour/nuit partagent un squelette en T mais produisent deux organisations
     différentes et vérifiables. */
  const STRATEGIES = [
    { id: 'barre', famille: 'barre', repartition: 'libre' },
    { id: 'l', famille: 'L', repartition: 'libre' },
    { id: 'coude', famille: 'L-interieur', repartition: 'coude' },
    { id: 't', famille: 'T', repartition: 'libre' },
    { id: 'hall', famille: 'T', repartition: 'hall' },
    { id: 'jour-nuit', famille: 'T', repartition: 'jour-nuit' }
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

  function equilibrer(pieces, groupes) {
    const charges = groupes.map((g) => g.reduce((sum, p) => sum + p.aire, 0));
    pieces.slice().sort((a, b) => b.aire - a.aire).forEach((piece) => {
      let cible = 0;
      for (let i = 1; i < groupes.length; i += 1) if (charges[i] < charges[cible]) cible = i;
      groupes[cible].push(piece); charges[cible] += piece.aire;
    });
    return groupes;
  }

  /* Hall : le séjour et la cuisine forment le front public au pied de la
     jonction ; les autres pièces se répartissent sur les deux ailes. La
     jonction courte joue le rôle de hall sans inventer un nouveau type de
     pièce ni dépasser la largeur maximale d'une circulation. */
  function repartirHall(pieces, n, random) {
    if (n !== 3) return null;
    const publicGroup = pieces.filter((p) => p.type === 'living' || p.type === 'kitchen');
    const autres = pieces.filter((p) => !publicGroup.includes(p));
    if (!publicGroup.length || autres.length < 2) return null;
    const ailes = equilibrer(random ? melange(autres, random) : autres, [[], []]);
    if (ailes.some((g) => !g.length)) return null;
    return [ailes[0], ailes[1], publicGroup];
  }

  /* Jour/nuit : le public occupe le pied du T ; les deux ailes portent la
     zone privée et son sous-groupe de services. Un T plein impose aux ailes
     une longueur commune. Si le groupe des chambres est trop large pour celui
     des pièces d'eau, les plus petites chambres passent dans la seconde aile :
     elles restent du côté nuit, sans rendre la stratégie géométriquement
     muette sur les grands programmes. Le séjour et la cuisine ne sont jamais
     séparés. */
  function repartirJourNuit(pieces, n, random) {
    if (n !== 3) return null;
    const jour = pieces.filter((p) => p.type === 'living' || p.type === 'kitchen' || p.type === 'dining');
    const nuit = pieces.filter((p) => p.type === 'bedroom' || p.type === 'bureau');
    const classes = new Set([...jour, ...nuit]);
    const service = pieces.filter((p) => !classes.has(p));
    if (!jour.length || !nuit.length) return null;
    if (!service.length && nuit.length > 1) {
      nuit.sort((a, b) => b.aire - a.aire);
      service.push(nuit.pop());
    }
    if (!service.length) return null;
    function domainesSeCroisent(a, b) {
      const da = domaine(a), db = domaine(b);
      return Math.max(da.min, db.min) <= Math.min(da.max, db.max);
    }
    while (nuit.length > 1 && !domainesSeCroisent(nuit, service)) {
      nuit.sort((a, b) => a.aire - b.aire);
      service.push(nuit.shift());
    }
    if (!domainesSeCroisent(nuit, service)) return null;
    return [random ? melange(nuit, random) : nuit,
      random ? melange(service, random) : service,
      random ? melange(jour, random) : jour];
  }

  function repartirSelon(pieces, n, random, politique) {
    if (politique === 'hall') return repartirHall(pieces, n, random);
    if (politique === 'coude') return repartirHall(pieces, n, random);
    if (politique === 'jour-nuit') return repartirJourNuit(pieces, n, random);
    return repartir(pieces, n, random);
  }

  /** Réduit à un seul volume ceux qui pavent exactement leur boîte englobante. */
  function fusionnerVolumes(volumes) {
    if (!volumes || volumes.length < 2) return volumes;
    const boite = volumes.reduce((acc, v) => ({
      x0: Math.min(acc.x0, v.x0), y0: Math.min(acc.y0, v.y0),
      x1: Math.max(acc.x1, v.x1), y1: Math.max(acc.y1, v.y1)
    }), { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity });
    const somme = volumes.reduce((s, v) => s + (v.x1 - v.x0) * (v.y1 - v.y0), 0);
    const pleine = (boite.x1 - boite.x0) * (boite.y1 - boite.y0);
    return Math.abs(somme - pleine) < 0.01 ? [boite] : volumes;
  }

  /* M4a.2 — ferme une extrémité extérieure du réseau par une pièce qui la
     bordait déjà. La pièce reçoit le capuchon de circulation : elle devient
     éventuellement polygonale, mais ne perd ni sa connexité ni son contact
     avec le dégagement conservé. Tous les voisins terminaux gardent au moins
     MIN_DESSERTE de mur commun, donc le graphe obligatoire reste vrai par
     construction. La stratégie `hall` est la première famille qui porte ce
     geste ; les autres restent témoins sans terminaison. */
  function terminerBranchesInterieures(boites, branches, volumes, pieces) {
    if (root.TechnoHabAblations && root.TechnoHabAblations.disableM4a2InteriorTerminations) {
      return [];
    }
    const parId = new Map(pieces.map((piece) => [piece.id, piece]));
    const priorite = ['living', 'dining', 'kitchen', 'bureau', 'bedroom'];
    const terminaisons = [];
    const receveursUtilises = new Set();

    function dansVolumes(x, y) {
      return (volumes || []).some((volume) =>
        x > volume.x0 + 0.01 && x < volume.x1 - 0.01 &&
        y > volume.y0 + 0.01 && y < volume.y1 - 0.01);
    }

    function estExterieure(branche, horizontal, debut) {
      const marge = 0.04;
      const x = horizontal
        ? (debut ? branche.x0 - marge : branche.x1 + marge)
        : (branche.x0 + branche.x1) / 2;
      const y = horizontal
        ? (branche.y0 + branche.y1) / 2
        : (debut ? branche.y0 - marge : branche.y1 + marge);
      return !dansVolumes(x, y);
    }

    function contacts(branche, horizontal, debut) {
      const axe0 = horizontal ? branche.x0 : branche.y0;
      const axe1 = horizontal ? branche.x1 : branche.y1;
      return boites.flatMap((boite) => (boite.parts || []).map((part) => {
        const touche = horizontal
          ? Math.abs(part.y1 - branche.y0) < TOLERANCE || Math.abs(part.y0 - branche.y1) < TOLERANCE
          : Math.abs(part.x1 - branche.x0) < TOLERANCE || Math.abs(part.x0 - branche.x1) < TOLERANCE;
        if (!touche) return null;
        const p0 = horizontal ? part.x0 : part.y0;
        const p1 = horizontal ? part.x1 : part.y1;
        const a0 = Math.max(axe0, p0), a1 = Math.min(axe1, p1);
        const terminale = debut ? a0 <= axe0 + TOLERANCE : a1 >= axe1 - TOLERANCE;
        return terminale && a1 - a0 >= MIN_DESSERTE
          ? { boite, part, longueur: a1 - a0 }
          : null;
      })).filter(Boolean);
    }

    branches.forEach((branche, brancheIndex) => {
      const horizontal = (branche.x1 - branche.x0) >= (branche.y1 - branche.y0);
      [true, false].forEach((debut) => {
        if (!estExterieure(branche, horizontal, debut)) return;
        const voisins = contacts(branche, horizontal, debut);
        if (!voisins.length) return;
        const receveurs = voisins.filter((contact) => {
          const piece = parId.get(contact.boite.id);
          return piece && !receveursUtilises.has(piece.id) && piece.agrement > 0 &&
            piece.maxArea === null && priorite.includes(piece.type);
        }).sort((a, b) => {
          const pa = priorite.indexOf(parId.get(a.boite.id).type);
          const pb = priorite.indexOf(parId.get(b.boite.id).type);
          return pa - pb || b.longueur - a.longueur || a.boite.id.localeCompare(b.boite.id);
        });
        if (!receveurs.length) return;
        const longueurDisponible = Math.min(...voisins.map((contact) => contact.longueur - MIN_DESSERTE));
        const longueurBranche = horizontal ? branche.x1 - branche.x0 : branche.y1 - branche.y0;
        const coupe = Math.min(TERMINAISON_CIBLE, longueurDisponible, longueurBranche * 0.22);
        if (coupe < TERMINAISON_MIN) return;

        const capuchon = horizontal
          ? {
              role: 'termination',
              x0: debut ? branche.x0 : branche.x1 - coupe,
              y0: branche.y0,
              x1: debut ? branche.x0 + coupe : branche.x1,
              y1: branche.y1
            }
          : {
              role: 'termination',
              x0: branche.x0,
              y0: debut ? branche.y0 : branche.y1 - coupe,
              x1: branche.x1,
              y1: debut ? branche.y0 + coupe : branche.y1
            };
        if (horizontal) {
          if (debut) branche.x0 += coupe; else branche.x1 -= coupe;
        } else {
          if (debut) branche.y0 += coupe; else branche.y1 -= coupe;
        }
        receveurs[0].boite.parts.push(capuchon);
        receveursUtilises.add(receveurs[0].boite.id);
        terminaisons.push({
          branch: brancheIndex,
          end: debut ? 'start' : 'end',
          receiver: receveurs[0].boite.id,
          length: Number(coupe.toFixed(3))
        });
      });
    });
    return terminaisons;
  }

  /**
   * Pose un plan par squelette de circulation.
   *
   * @param programme    sortie de buildProgram()
   * @param cible        surface de partition visée
   * @param graine       tirage rejouable ; absent = première famille, sans tirage
   * @param familleVoulue nom de famille imposé, pour mesurer une famille seule
   */
  function poserParSquelette(programme, cible, graine, familleVoulue, politique) {
    const random = Number.isFinite(graine) ? randomFrom(graine) : null;
    const pieces = programme.rooms
      .filter((r) => r.type !== 'circulation')
      .map(contraintes);
    if (pieces.length < 2) return { pieces: null, motif: 'moins de deux pièces à loger' };

    const cibleProgramme = programme.rooms.reduce((s, r) => s + r.targetArea, 0);
    const facteur = (cible || cibleProgramme) / cibleProgramme;
    pieces.forEach((p) => { p.aire *= facteur; });

    /* Sans circulation au programme, seule la desserte intégrée s'applique :
       les autres familles réserveraient une branche que personne ne possède.
       Avec circulation, l'inverse — l'intégrée n'a pas d'hôte désigné. */
    const aCirculation = programme.rooms.some((r) => r.type === 'circulation');
    const applicables = FAMILLES.filter((f) => Boolean(f.branche) === aCirculation);
    const familles = familleVoulue
      ? applicables.filter((f) => f.nom === familleVoulue)
      : (random ? melange(applicables, random) : applicables);

    let motif = 'aucune famille de squelette ne sert ce programme';
    for (const famille of familles) {
      if (pieces.length < famille.poches) continue;
      const groupes = repartirSelon(pieces, famille.poches, random, politique);
      if (!groupes) continue;
      if (groupes.some((g) => !g.length)) continue;
      let ordonnes = random ? groupes.map((g) => melange(g, random)) : groupes;

      // La desserte intégrée n'a pas un hôte quelconque : le séjour porte le
      // parcours et toutes les autres pièces bordent sa frontière. Le laisser
      // au répartiteur aléatoire rendait presque toujours le premier groupe
      // pluriel, donc cette famille se déclarait elle-même infaisable.
      if (!famille.branche) {
        const hote = pieces.find((p) => p.type === 'living');
        if (!hote) continue;
        const autres = pieces.filter((p) => p !== hote);
        ordonnes = [[hote], random ? melange(autres, random) : autres];
      }

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
      if (famille.branche && sejour && cuisine) {
        ordonnes = ordonnes.map((g) => g.filter((p) => p !== cuisine));
        const poche = ordonnes.find((g) => g.includes(sejour));
        if (!poche) continue;
        /* Le bloc public est calé à l'extrémité de sa poche : séjour et
           cuisine conservent leur corde obligatoire, et le séjour n'a pas de
           second voisin direct susceptible d'être le WC interdit par O4. */
        const autres = poche.filter((p) => p !== sejour);
        poche.splice(0, poche.length, sejour, cuisine, ...autres);
        if (ordonnes.some((g) => !g.length)) continue;
      }

      /* Deux paramètres libres désormais : la largeur d'enveloppe et le retrait
         de la poche haute. Le second décide de la silhouette — nul pour un
         rectangle, marqué pour un L. Il est tiré, donc deux graines ne donnent
         plus seulement deux dimensionnements mais deux formes de bâti. */
      /* Le retrait est la silhouette, et c'est lui qui répond à la forme
       demandée par l'utilisateur — jusqu'ici sans effet, le moteur servant
       toujours un rectangle.

         rectangle, square  aucun retrait, enveloppe pleine
         lShape, uShape     un retrait franc, enveloppe décrochée

       Le carré se distingue du rectangle par l'allongement visé, pas par le
       retrait : tous deux ont une enveloppe pleine. */
    const formeVoulue = (programme.options && programme.options.shape) || 'rectangle';
    const decroche = formeVoulue === 'lShape' || formeVoulue === 'uShape';
    const paliers = decroche ? [0.24, 0.3, 0.36, 0.42] : [0, 0, 0, 0];
    const retrait = random ? paliers[Math.floor(random() * paliers.length)] : paliers[0];
      const aireUtile = pieces.reduce((s, p) => s + p.aire, 0);
      // Un carré se demande par l'allongement visé : 1 au lieu de 1,4.
    const allongement = formeVoulue === 'square' ? 1.0 : 1.4;
    const base = Math.sqrt(aireUtile * allongement);
      let meilleur = null;
      for (let k = -14; k <= 20; k += 1) {
        const W = base * (1 + k * 0.05);
        if (W <= MIN_COULOIR * 2) continue;
        const forme = famille.construire(W, ordonnes, retrait, formeVoulue);
        if (!forme) continue;
        /* La surface d'un plan décroché n'est pas celle de son rectangle
           englobant. Calculée en `W × H`, elle surestimait de tout le
           décrochement et rejetait chaque forme en L comme « hors tolérance ». */
        const surface = forme.aire;

        /* La forme demandée est une contrainte, pas une préférence.

           Sans ce filtre, `rectangle` rendait une enveloppe décrochée vingt
           fois sur vingt : les familles `L` et `T` portent un retour vertical,
           et leurs rangées n'ont aucune raison de s'aligner d'elles-mêmes. Le
           sélecteur de forme restait donc sans effet — le grief d'origine. */
        const pleine = Math.abs(surface - forme.W * forme.H) < 0.01;
        if (!decroche && !pleine) continue;
        if (decroche && pleine) continue;

        /* Le carré se juge sur l'allongement, et il faut le peser : le seul
           écart de surface retenait des plans de rapport 1,75 là où on visait
           1,0. La pénalité est homogène à une surface, pour rester comparable
           au terme qu'elle rejoint. */
        const rapport = forme.W / forme.H;
        const penalite = formeVoulue === 'square'
          ? Math.abs(Math.max(rapport, 1 / rapport) - 1) * (cible || cibleProgramme) * 0.5
          : 0;
        const ecart = Math.abs(surface - (cible || cibleProgramme)) + penalite;
        if (!meilleur || ecart < meilleur.ecart) meilleur = { forme, ecart, surface };
      }
      if (!meilleur) { motif = `famille ${famille.nom} : aucune largeur ne convient`; continue; }
      /* Les répartitions sémantiques ont moins de degrés de liberté que le
         tirage libre. Le générateur recale ensuite la surface habitable par
         construction, sur la même topologie ; leur donner deux fois la bande
         de convergence évite de les déclarer impossibles avant ce recalage. */
      const bandeConvergence = politique && politique !== 'libre' ? 6 : 3;
      if (meilleur.ecart > (cible || cibleProgramme) * TOLERANCE * bandeConvergence) {
        motif = `famille ${famille.nom} : surface hors tolérance`;
        continue;
      }

      const forme = meilleur.forme;
      const couloirs = programme.rooms.filter((r) => r.type === 'circulation');
      const boites = forme.poser();
      const branches = forme.branches.map((branche) => Object.assign({}, branche));
      /* M5.0 — le coude intérieur partage le geste du hall. Les familles
         libres restent témoins sans mutation : généraliser la reprise à toute
         barre a produit des surfaces utiles déconnectées et un NON_TROUVE. */
      const terminaisons = politique === 'hall' || politique === 'coude'
        ? terminerBranchesInterieures(boites, branches, forme.volumes, pieces)
        : [];
      /* Toutes les branches forment UNE circulation : c'est le point du
         chantier. S'il y a plusieurs circulations au programme, la première
         porte le squelette et les autres n'ont pas lieu d'être — le squelette
         les remplace par ses branches. */
      if (couloirs.length) {
        boites.push({
          id: couloirs[0].id,
          parts: branches.map((b) => Object.assign({ role: 'main' }, b))
        });
      }
      /* Une enveloppe pleine ne déclare qu'UN volume. Les familles en
         produisent deux ou trois par construction — une rangée par poche — et
         les laisser tels quels ferait dire au plan qu'il est décroché alors
         qu'il ne l'est pas. On les fusionne quand ils pavent exactement leur
         rectangle englobant. */
      // `T` décrit ses deux poches hautes avec un recouvrement sur la branche
      // verticale. La somme naïve de ses volumes ne sait donc pas reconnaître
      // qu'ils pavent une enveloppe pleine. Le verdict `pleine`, calculé sur
      // l'aire géométrique de la forme, est déjà établi ci-dessus : carré et
      // rectangle portent directement leur unique volume canonique.
      const formePleine = Math.abs(meilleur.surface - forme.W * forme.H) < 0.01;
      const volumes = !decroche && formePleine
        ? [{ x0: 0, y0: 0, x1: forme.W, y1: forme.H }]
        : fusionnerVolumes(forme.volumes);
      return {
        pieces: boites, motif: null, famille: forme.famille,
        largeur: forme.W, hauteur: forme.H, surface: meilleur.surface,
        branches: branches.length,
        terminationMethod: terminaisons.length ? 'interior-room-cap-v1' : 'none',
        terminations: terminaisons,
        // Les volumes décrivent l'enveloppe réelle, décrochements compris. Sans
        // eux `assemblerPlan()` retomberait sur le rectangle englobant et les
        // façades seraient calculées sur une enveloppe qui n'existe pas.
        volumes: volumes, retrait: retrait
      };
    }
    return { pieces: null, motif };
  }

  function strategiesPour(programme) {
    const avecCirculation = programme.rooms.some((room) => room.type === 'circulation');
    if (!avecCirculation) {
      return [{ id: 'desserte-integree', famille: 'desserte-integree', repartition: 'libre' }];
    }
    const sansM5 = root.TechnoHabAblations &&
      (root.TechnoHabAblations.disableM5BranchUtility || root.TechnoHabAblations.disableM5Search);
    return STRATEGIES.filter((strategy) => !(sansM5 && strategy.id === 'coude'))
      .map((strategy) => Object.assign({}, strategy));
  }

  function produire(programme, cible, graine, strategyId) {
    const strategy = strategiesPour(programme).find((candidate) => candidate.id === strategyId);
    if (!strategy) return { pieces: null, motif: 'stratégie ' + strategyId + ' non applicable' };
    const pose = poserParSquelette(programme, cible, graine, strategy.famille, strategy.repartition);
    pose.strategy = strategy.id;
    pose.repartition = strategy.repartition;
    return pose;
  }

  /* M4a — les producteurs décrivent une topologie, pas un nord implicite.

     Les huit isométries du rectangle sont exposées ici comme des POSES d'une
     même topologie. Elles ne deviennent jamais huit stratégies ni huit
     variantes produit : `equivalenceClass` permet au classement de les
     reconnaître comme une seule organisation tant qu'aucun contexte de site
     (nord, accès, vue) ne les départage. */
  const TRANSFORMATIONS = ['r0', 'r90', 'r180', 'r270', 'mx', 'mx-r90', 'mx-r180', 'mx-r270'];

  function dimensionsTransformees(W, H, transformation) {
    return transformation === 'r90' || transformation === 'r270' ||
      transformation === 'mx-r90' || transformation === 'mx-r270'
      ? { W: H, H: W }
      : { W, H };
  }

  function transformerPoint(x, y, W, H, transformation) {
    if (transformation === 'r90') return { x: H - y, y: x };
    if (transformation === 'r180') return { x: W - x, y: H - y };
    if (transformation === 'r270') return { x: y, y: W - x };
    if (transformation === 'mx') return { x: W - x, y };
    if (transformation === 'mx-r90') return { x: H - y, y: W - x };
    if (transformation === 'mx-r180') return { x, y: H - y };
    if (transformation === 'mx-r270') return { x: y, y: x };
    return { x, y };
  }

  function transformerRectangle(rect, W, H, transformation) {
    const points = [
      transformerPoint(rect.x0, rect.y0, W, H, transformation),
      transformerPoint(rect.x1, rect.y0, W, H, transformation),
      transformerPoint(rect.x1, rect.y1, W, H, transformation),
      transformerPoint(rect.x0, rect.y1, W, H, transformation)
    ];
    return {
      x0: Math.min(...points.map((point) => point.x)),
      y0: Math.min(...points.map((point) => point.y)),
      x1: Math.max(...points.map((point) => point.x)),
      y1: Math.max(...points.map((point) => point.y))
    };
  }

  function signaturePose(pose) {
    const nombre = (value) => Number(value.toFixed(4));
    return JSON.stringify((pose.pieces || []).map((piece) => ({
      id: piece.id,
      parts: (piece.parts || []).map((part) => ({
        x0: nombre(part.x0), y0: nombre(part.y0),
        x1: nombre(part.x1), y1: nombre(part.y1)
      })).sort((a, b) => a.x0 - b.x0 || a.y0 - b.y0 || a.x1 - b.x1 || a.y1 - b.y1)
    })).sort((a, b) => a.id.localeCompare(b.id)));
  }

  function empreinteCourte(value) {
    let hash = 2166136261;
    for (let i = 0; i < value.length; i += 1) {
      hash ^= value.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return 'd4-' + (hash >>> 0).toString(36);
  }

  function transformerPose(pose, transformation) {
    if (!pose || !pose.pieces) return pose;
    const W = pose.largeur, H = pose.hauteur;
    const dimensions = dimensionsTransformees(W, H, transformation);
    return Object.assign({}, pose, {
      largeur: dimensions.W,
      hauteur: dimensions.H,
      pieces: pose.pieces.map((piece) => ({
        id: piece.id,
        parts: (piece.parts || []).map((part) => Object.assign(
          { role: part.role || 'main' },
          transformerRectangle(part, W, H, transformation)
        ))
      })),
      volumes: (pose.volumes || []).map((volume) =>
        transformerRectangle(volume, W, H, transformation)),
      transformation
    });
  }

  function transformationsDe(pose, graineDeVue) {
    if (!pose || !pose.pieces) return [];
    /* `pose` vient toujours du producteur dans sa vue r0. Sa signature est
       donc la signature canonique de la classe, avant toute transformation ;
       inutile de recalculer une matrice quadratique sur le chemin chaud. */
    const equivalenceClass = empreinteCourte(signaturePose(pose));
    /* Le chemin chaud n'a besoin que de la vue ensemencée. L'API sans graine
       continue d'exposer et dédupliquer les huit vues pour les tests et les
       futurs contextes de site. */
    if (Number.isFinite(graineDeVue)) {
      const transformation = TRANSFORMATIONS[(graineDeVue >>> 0) % TRANSFORMATIONS.length];
      return [Object.assign(transformerPose(pose, transformation), {
        equivalenceClass,
        transformationsAvailable: TRANSFORMATIONS.length
      })];
    }
    const toutes = TRANSFORMATIONS.map((transformation) => transformerPose(pose, transformation));
    const signatures = toutes.map(signaturePose);
    const vues = [];
    const dejaVues = new Set();
    toutes.forEach((candidate, index) => {
      if (dejaVues.has(signatures[index])) return;
      dejaVues.add(signatures[index]);
      vues.push(Object.assign(candidate, { equivalenceClass }));
    });
    return vues;
  }


  root.TechnoHabSquelette = {
    poser: poserParSquelette,
    produire: produire,
    transformer: transformerPose,
    transformations: transformationsDe,
    strategiesPour: strategiesPour,
    transformationIds: TRANSFORMATIONS.slice(),
    familles: FAMILLES.map(function (f) { return f.nom; }),
    strategies: STRATEGIES.map(function (strategy) { return strategy.id; })
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
