(function (root) {
  'use strict';

  var CURRENT_SCHEMA_VERSION = '3.1';

  /* --- Définition des pièces -----------------------------------------------
     Ce module n'en tient plus la table. Elle vit dans socle.data.js — libellé,
     rôle, agrément, planchers de programme, plafond, critère d'existence — et
     `npm run fit:build` la compile dans fit.data.js avec les enveloppes.

     Motif : le moteur portait `minArea`, `minSide` et `weight` en dur, le
     socle portait les équipements, et rien ne garantissait que les deux
     parlent de la même pièce. Une seule source les décrit désormais.

     Motif du passage par fit.data.js plutôt que par le socle : index.html
     charge fit.data.js au premier octet, tandis que socle.data.js reste
     différé jusqu'au premier usage du solveur. Lire le socle ici casserait le
     chargement paresseux (CLAUDE.md §2).

     Le plancher retenu — `TechnoHabFit.floorOf` — est le plus exigeant de
     deux grandeurs qu'un seul nombre confondait jusqu'ici : ce que la pièce
     doit mesurer pour recevoir son mobilier (calculé par le solveur), et ce
     qu'elle doit mesurer pour mériter son nom (convention assumée). Un séjour
     se meuble dès 3,24 m² et reste absurde à cette taille. */

  function definitionDe(type) {
    var fit = root.TechnoHabFit;
    return (fit && fit.envelopes && fit.envelopes[type]) || null;
  }

  function plancherDe(type, variant) {
    var fit = root.TechnoHabFit;
    return fit && fit.floorOf ? fit.floorOf(type, variant) : { area: 0, side: MIN_CIRCULATION_WIDTH };
  }

  /* --- Poids de répartition ------------------------------------------------
     Le poids décide de la part de surface distribuable qui revient à une
     pièce. Il était décrété — 4,5 pour le séjour, 0,55 pour le WC — sans que
     personne sache d'où venaient ces nombres.

     Il se déduit désormais de deux termes, l'un calculé, l'autre assumé :

       poids = aire du plus petit rectangle meublable × agrément

     Le premier vient du socle, par le solveur hors ligne : c'est le besoin
     réel de la pièce, et il suit automatiquement toute évolution des
     équipements. Le second dit combien un mètre carré supplémentaire profite
     à cette pièce — un séjour en tire du confort, un WC n'en tire rien. Il
     est déclaré par la pièce elle-même (`agrement`), plus par une table
     tenue ici.

     Ce n'est donc plus une convention opaque mais une convention **nommée**,
     et réduite à ce qu'aucun calcul ne tranchera : l'agrément. */
  var poidsCache = {};
  function poidsDe(type) {
    if (poidsCache[type] !== undefined) return poidsCache[type];
    var fit = root.TechnoHabFit;
    var besoin = null;
    if (fit && fit.smallest) {
      var plus_petit = fit.smallest(type);
      if (plus_petit) besoin = plus_petit.w * plus_petit.h;
    }
    poidsCache[type] = besoin !== null
      ? round(besoin * (fit.agrementOf ? fit.agrementOf(type) : 0.6), 2)
      : 1;   // hors socle : aucune raison de préférer cette pièce à une autre
    return poidsCache[type];
  }

  // C-P2 — la largeur dépend de la desserte. 0,90 m sert un passage simple ;
  // à partir de trois espaces, le croisement probable exige 1,20 m.
  var SIMPLE_CIRCULATION_WIDTH = valeurCanonique('VAL-CIRC-CLEAR-WIDTH-SIMPLE-MIN-001', 0.9);
  var MIN_CIRCULATION_WIDTH = valeurCanonique('VAL-CIRC-CLEAR-WIDTH-CROSSING-MIN-001', 1.2);
  var CIRCULATION_CROSSING_SERVICES = valeurCanonique('VAL-CIRC-CROSSING-SERVICE-COUNT-001', 3);
  /* Nombre d'espaces qu'un seul dégagement sait desservir. Calibré par le plan
     de référence dessiné à la main, qui en dessert cinq — et non au jugé : une
     valeur de quatre a été refusée par `test-instrument.mjs`, qui aurait alors
     exigé deux dégagements là où les règles de l'art n'en demandent qu'un. */
  var DESSERTES_PAR_COULOIR = 5;
  /* Marge sur la surface demandée. Un plan n'a pas à servir 70 m² au
     centimètre : la demande est un ordre de grandeur, pas une cote. Servir
     exactement 70,00 revient à ne retenir qu'un seul dimensionnement — et
     c'est mesuré : le moteur plafonnait alors à seize plans distincts sur un
     T3 de 55 m², quel que soit le nombre de graines tirées. La surface exacte
     n'était pas une qualité du modèle, c'était ce qui supprimait ses
     variantes.

     ±6 % : 70 m² demandés autorisent 65,8 à 74,2 m². Le plan porte la surface
     réellement servie, et les règles jugent l'écart à cette marge, non à la
     demande nue. */
  var MARGE_SURFACE = 0.06;
  /* Plafond de circulation rapporté au besoin de desserte, gelé le 19 août
     2026 au 90e centile mesuré. `rules.js` porte la même valeur : la
     recherche et le rapport doivent viser le même seuil, sans quoi le moteur
     optimiserait un critère que la règle ne juge pas. Voir
     DOCTRINE_CIRCULATION.md. */
  /* M3.0 — poids d'un ratio de longueur de desserte au carré. Ce n'est pas
     un seuil de conformité : aucune longueur n'est déclarée « bonne » par ce
     nombre. Il sert uniquement à classer deux candidats, et le banc versionné
     `measure-m3-circulation.mjs` en publie l'ablation à graines fixes. */
  var CIRCULATION_LENGTH_WEIGHT = 30;
  var CIRCULATION_FACADE_VALUE_ID = 'VAL-CIRC-FACADE-EXCESS-WEIGHT-001';
  var CIRCULATION_FACADE_WEIGHT_FALLBACK = 18;
  var CIRCULATION_DEAD_LENGTH_VALUE_ID = 'VAL-CIRC-DEAD-LENGTH-WEIGHT-001';
  var CIRCULATION_DEAD_LENGTH_WEIGHT_FALLBACK = 18;
  var USAGE_TARGET_MISS_VALUE_ID = 'VAL-USAGE-TARGET-MISS-WEIGHT-001';
  var USAGE_TARGET_MISS_WEIGHT_FALLBACK = 6;
  var USAGE_COMFORT_MISS_VALUE_ID = 'VAL-USAGE-COMFORT-MISS-WEIGHT-001';
  var USAGE_COMFORT_MISS_WEIGHT_FALLBACK = 2;
  // Au-delà, ce n'est plus une circulation mais une pièce : la surface passe
  // en volume perdu au lieu de s'allonger pour desservir.
  var MAX_CIRCULATION_WIDTH = valeurCanonique('VAL-CIRC-CLEAR-WIDTH-MAX-001', 1.8);
  // Bornes d'un rangement. La profondeur maximale est corrélée à la longueur
  // pour qu'un rangement reste une bande et ne devienne jamais une pièce.
  var MIN_STORAGE_DEPTH = valeurCanonique('VAL-STORAGE-BAY-DEPTH-MIN-001', 0.45);
  var MAX_STORAGE_DEPTH_RATIO = valeurCanonique('VAL-STORAGE-BAY-DEPTH-LENGTH-RATIO-MAX-001', 0.6);
  var CONTACT = 0.012;
  // Seuil géométrique : les deux pièces se touchent. Sert aussi à repérer
  // les pièces bordant le couloir pour la cession — le relever casserait
  // l'absorption des rangements.
  var MIN_OVERLAP = 0.24;
  /* Seuil fonctionnel : l'adjacence peut porter son ouverture. Une porte
     intérieure demande 0,80 m de vantail (VAL-PMR-007) plus ses tableaux,
     soit environ 1,00 m de mur commun. Seule TH2D-GRAPH-001 le consulte.
     Convention pour la part de tableau ; la largeur de vantail est
     réglementaire. */
  var MIN_DESSERTE = 1.0;

  function round(value, precision) {
    var factor = Math.pow(10, precision === undefined ? 3 : precision);
    return Math.round((value + Number.EPSILON) * factor) / factor;
  }

  // La graine est une donnée du plan, affichée et réutilisable : une référence
  // courte suffit à rejouer une génération sans conserver le plan lui-même.
  function encodeSeed(value) {
    return (value >>> 0).toString(36).toUpperCase().padStart(7, '0').slice(-7);
  }

  function decodeSeed(text) {
    var parsed = parseInt(String(text).trim().toUpperCase(), 36);
    return Number.isFinite(parsed) ? parsed >>> 0 : null;
  }

  function narrowestSide(box) {
    return Math.min(Math.abs(box.x1 - box.x0), Math.abs(box.y1 - box.y0));
  }

  /* CLASSIFICATION_LOGEMENT §2 — un logement porte désormais son type et sa
     classe, lisibles à l'export. Rien n'en dépend encore : ni un poids de
     PONDERATION, ni un refus de programme. C'est le §2.3 du document qui le
     dit — publier la donnée n'est pas l'exploiter, et l'exploiter demande
     une Table B/C que personne n'a encore sourcée.

     Typologie — sans risque : `T = bedrooms + 1` est la convention
     immobilière française usuelle, pas une invention du projet, et elle
     couvre exactement la plage 0-5 déjà bornée par normalizeOptions().
     Classe de taille — provisoire, assumée comme telle : trois seuils
     canoniques, tous `PROVISIONAL`, faute de Table B sourcée. */
  function classificationLogement(surface, bedrooms) {
    var typologie = 'T' + (Math.max(0, Math.min(5, Math.trunc(bedrooms))) + 1);
    var seuilPetit = valeurCanonique('VAL-CLASSE-PETIT-MIN-001', 55);
    var seuilMoyen = valeurCanonique('VAL-CLASSE-MOYEN-MIN-001', 90);
    var seuilGrand = valeurCanonique('VAL-CLASSE-GRAND-MIN-001', 140);
    var classe = surface < seuilPetit ? 'petit'
      : surface < seuilMoyen ? 'moyen'
      : surface < seuilGrand ? 'grand'
      : 'tres_grand';
    return {
      typologie: typologie,
      classe: classe,
      method: 'bedrooms-plus-one-v1',
      statut: 'classe non exploitée — voir CLASSIFICATION_LOGEMENT.md §2.3'
    };
  }

  function normalizeOptions(input) {
    input = input || {};
    var officeVariant = ['compact', 'convertible'].indexOf(input.officeVariant) >= 0
      ? input.officeVariant : 'compact';
    var offices = Math.min(1, Math.max(0, Math.trunc(Number(input.offices) || 0)));
    if (['compact', 'convertible'].indexOf(input.officeType) >= 0) {
      offices = 1;
      officeVariant = input.officeType;
    } else if (input.officeType === 'none') {
      offices = 0;
    }
    return {
      surface: Math.min(250, Math.max(35, Number(input.surface) || 75)),
      bedrooms: Math.min(5, Math.max(0, Math.trunc(Number(input.bedrooms) || 0))),
      bathrooms: Math.min(2, Math.max(1, Math.trunc(Number(input.bathrooms) || 1))),
      separateKitchen: Boolean(input.separateKitchen),
      includeWc: input.includeWc !== false,
      offices: offices,
      officeVariant: officeVariant,
      // Chantier 1 — la forme de l'enveloppe est une donnée du projet, pas un
      // sous-produit de la surface. Trois familles : primitive (carré,
      // rectangle), soustractive (L, U, un quartier retiré du rectangle
      // englobant), additive — celle-ci pas encore servie.
      shape: ['square', 'rectangle', 'lShape', 'uShape'].indexOf(input.shape) >= 0 ? input.shape : 'rectangle',
      priorities: normalizePriorities(input),
      // Rétrocompatibilité et portée assumée : `priority` (singulier) reste
      // lu par l'enveloppe (`envelopeAspect`) et la découpe (`layout`), qui
      // précèdent ce champ et choisissaient déjà entre trois formes de
      // silhouette incompatibles entre elles — élancée (light) contre
      // carrée (economy). Les cumuler à ce niveau tranchierait une question
      // de géométrie que PONDERATION_AGENCEMENT.md n'a jamais posée : le
      // chantier n'active que le SCORE (décision 3, DECISIONS_REGLES.md),
      // pas la forme de l'enveloppe. `priority` reste donc la première
      // priorité choisie, primaire par construction de la liste ci-dessous.
      priority: normalizePriorities(input)[0]
    };
  }

  var VALID_PRIORITIES = ['compact', 'light', 'economy'];

  /* PONDERATION — les préférences de score (regroupement technique,
     façade lumineuse, gamme et confort compacts, adjacences économiques)
     portent sur des critères indépendants : rien n'empêche de les cumuler,
     choix de l'utilisateur. Accepte `priorities` (tableau, nouveau) et
     `priority` (chaîne, historique) ; les deux formes cohabitent tant que
     l'interface n'expose qu'un radio. */
  function normalizePriorities(input) {
    var source = Array.isArray(input.priorities) ? input.priorities
      : VALID_PRIORITIES.indexOf(input.priority) >= 0 ? [input.priority] : [];
    var kept = [];
    source.forEach(function (value) {
      if (VALID_PRIORITIES.indexOf(value) >= 0 && kept.indexOf(value) < 0) kept.push(value);
    });
    return kept.length ? kept : ['compact'];
  }

  function createRoom(type, index, explicitVariant) {
    var definition = definitionDe(type);
    var variant = explicitVariant !== undefined ? explicitVariant
      : type === 'bedroom' ? (index === 1 ? 'parentale' : 'enfant') : null;
    var plancher = plancherDe(type, variant);
    var fit = root.TechnoHabFit;
    var agrement = fit && fit.agrementOf ? fit.agrementOf(type) : 0.6;
    var maxRatio = fit && fit.maxRatioOf ? fit.maxRatioOf(type) : null;
    var besoin = coutReel(type);
    var numbered = type === 'bedroom' || type === 'bath' || (index !== undefined && index !== null && index > 1);
    var label = definition ? definition.label : type;
    return {
      id: numbered ? type + '_' + index : type,
      type: type,
      variant: variant,
      label: numbered ? label + ' ' + index : label,
      // Ni l'un ni l'autre n'est écrit ici : voir `plancherDe`.
      minArea: plancher.area,
      minSide: plancher.side,
      agrement: agrement,
      weight: poidsDe(type),
      // O1 — l'enveloppe de surface est portée par le programme. Le plafond
      // reste relatif au besoin meublable calculé, jamais à une aire absolue.
      maxRatio: maxRatio,
      maxArea: maxRatio === null ? null : round(Math.max(plancher.area, besoin * maxRatio), 2)
    };
  }

  /* --- Fusion de pièces ------------------------------------------------------
     Une option qui retire une pièce du programme ne doit pas retirer la
     fonction du plan : elle la verse à la pièce qui l'absorbe. La pièce
     composée garde un identifiant, un contour et une étiquette uniques, mais
     porte les deux programmes — côté équipements par `TechnoHabRoomModel`,
     côté surface ici.

     Le minimum composé n'est pas la somme des minima. Un `minArea` porte la
     marge de confort de sa pièce ; les additionner demande deux fois la même
     chose, et c'est mesuré : le séjour passe à 27 m², la salle d'eau cesse
     d'être meublable dès 75 m² avec deux chambres. À surface totale fixe,
     durcir un minimum se paie sur les autres pièces.

     Le minimum garantit une seule chose — que la pièce se meuble. Le
     composé vaut donc le plancher de confort de la pièce d'accueil, ou la
     somme des **plus petits rectangles meublables** du socle si elle est
     plus exigeante. Même source que les poids, même raison : ce qui se
     calcule ne se décrète pas.

     En pratique : séjour + cuisine = max(20 ; 3,24 + 2,52) → 20, le séjour
     était déjà assez grand. Salle d'eau + WC = max(3 ; 1,98 + 1,05) → 3,03,
     et cette fois le supplément est réel. */
  function coutReel(type) {
    var fit = root.TechnoHabFit;
    var plus_petit = fit && fit.smallest ? fit.smallest(type) : null;
    return plus_petit ? plus_petit.w * plus_petit.h : plancherDe(type).area;
  }

  function composeInto(room, type, label) {
    var addition = definitionDe(type);
    if (!room || !addition) return room;
    room.label = label;
    room.minArea = round(Math.max(room.minArea, coutReel(room.type) + coutReel(type)), 2);
    room.minSide = Math.max(room.minSide, plancherDe(type).side);
    // Le poids ne s'additionne pas. Il dit ce qu'un mètre carré *de plus*
    // apporte à la pièce, pas ce qu'elle doit contenir — ce besoin est déjà
    // porté par `minArea`. Le cumuler ferait deux fois la même demande, et
    // c'est mesuré : la salle d'eau cesse alors d'être meublable à 75 m².
    room.weight = Math.max(room.weight, poidsDe(type));
    room.agrement = Math.max(room.agrement, root.TechnoHabFit.agrementOf(type));
    room.composedWith = (room.composedWith || []).concat([type]);
    return room;
  }

  /* O1 — allocation par enveloppe cible.

     Chaque pièce reçoit d'abord son plancher fonctionnel. Le reliquat ne va
     ensuite qu'aux pièces auxquelles un mètre carré supplémentaire apporte
     réellement quelque chose, au prorata de cet agrément déjà pondéré par le
     besoin meublable (`weight`). Lorsqu'un plafond est atteint, la pièce est
     retirée du tour suivant et sa part est redistribuée aux autres.

     La fonction reste indépendante de la géométrie et des contrats : elle
     transforme un programme en programme, ce qui la rend testable isolément
     et permet à M2 de faire évoluer les poseurs sans réécrire la doctrine. */
  function allocateTargetAreas(rooms, surface) {
    var minimumTotal = rooms.reduce(function (sum, room) { return sum + room.minArea; }, 0);
    var compression = minimumTotal > surface ? surface / minimumTotal : 1;
    var allocated = rooms.map(function (room) {
      return Object.assign({}, room, {
        targetArea: round(room.minArea * compression)
      });
    });

    if (minimumTotal <= surface) {
      var remaining = Math.max(0, surface - minimumTotal);
      var active = allocated.filter(function (room) {
        return room.agrement > 0 && room.weight > 0 &&
          (room.maxArea === null || room.targetArea < room.maxArea - 0.0005);
      });

      while (remaining > 0.0005 && active.length) {
        var totalWeight = active.reduce(function (sum, room) { return sum + room.weight; }, 0);
        var distributed = 0;
        active.forEach(function (room) {
          var share = remaining * room.weight / totalWeight;
          var capacity = room.maxArea === null ? share : Math.max(0, room.maxArea - room.targetArea);
          var addition = Math.min(share, capacity);
          room.targetArea += addition;
          distributed += addition;
        });
        remaining -= distributed;
        if (distributed < 0.0005) break;
        active = active.filter(function (room) {
          return room.maxArea === null || room.targetArea < room.maxArea - 0.0005;
        });
      }
    }

    allocated.forEach(function (room) { room.targetArea = round(room.targetArea); });
    var residual = round(surface - allocated.reduce(function (sum, room) { return sum + room.targetArea; }, 0));
    if (Math.abs(residual) > 0.0005) {
      var receivers = allocated.filter(function (room) {
        return room.agrement > 0 && room.weight > 0 &&
          (room.maxArea === null || room.targetArea + residual <= room.maxArea + 0.0005);
      });
      if (receivers.length) {
        var receiver = receivers.reduce(function (a, b) { return b.weight > a.weight ? b : a; });
        receiver.targetArea = round(receiver.targetArea + residual);
      }
    }
    return allocated;
  }

  /* --- Typologies de logement -------------------------------------------------

     Une typologie de logement n'est pas une liste de pièces : c'est un jeu de
     règles qui contredit certaines options. Un studio n'a pas de WC séparé ni
     de cuisine fermée — non parce que l'utilisateur ne les a pas demandés,
     mais parce que la typologie ne les admet pas. Le programme doit donc
     pouvoir **imposer** en plus de proposer.

     `impose`  options écrasées, quel que soit ce qui a été coché.
     `verse`   programmes supplémentaires versés à une pièce hôte : ils
               ajoutent leurs équipements sans créer de pièce.

     Première entrée, le studio. Les autres typologies suivront ; la table
     existe pour qu'elles s'ajoutent sans rouvrir `buildProgram()`. */
  var TYPOLOGIES_LOGEMENT = [
    {
      id: 'studio',
      label: 'Studio',
      // Aucune chambre demandée : le séjour porte le couchage.
      quand: function (options) { return options.bedrooms === 0; },
      impose: { separateKitchen: false, includeWc: false },
      // Le couchage rejoint le séjour, avec le repas et la cuisine. La salle
      // d'eau reçoit le WC — c'est `includeWc: false` qui s'en charge.
      verse: [{ hote: 'living', programme: 'bedroom', label: 'Studio' }]
    }
  ];

  var CONTACT_PAR_NATURE = {
    porte: 1.00,
    ouverture: 1.20,
    ouverture_large: 1.50,
    separation: 0,
    interdite: 0
  };

  /* O4/M3 — nature et degré sont orthogonaux. `kind: opening` reste présent
     pour les lecteurs 1.0 ; le moteur courant lit `nature`, `degre` et le
     contact propre à la relation. */
  function adjacency(a, b, nature, degre) {
    return {
      a: a, b: b,
      kind: 'opening',
      nature: nature,
      degre: degre,
      contact: CONTACT_PAR_NATURE[nature] || 0
    };
  }

  function typologieDe(options) {
    for (var i = 0; i < TYPOLOGIES_LOGEMENT.length; i += 1) {
      if (TYPOLOGIES_LOGEMENT[i].quand(options)) return TYPOLOGIES_LOGEMENT[i];
    }
    return null;
  }

  function buildProgram(rawOptions) {
    var options = normalizeOptions(rawOptions);
    var typologie = typologieDe(options);
    if (typologie && typologie.impose) {
      Object.keys(typologie.impose).forEach(function (cle) {
        options[cle] = typologie.impose[cle];
      });
    }

    var rooms = [createRoom('living')];
    var index;
    if (options.separateKitchen) rooms.push(createRoom('kitchen'));
    else composeInto(rooms[0], 'kitchen', 'Séjour avec cuisine ouverte');
    for (index = 1; index <= options.bedrooms; index += 1) rooms.push(createRoom('bedroom', index));
    for (index = 1; index <= options.bathrooms; index += 1) rooms.push(createRoom('bath', index));
    if (options.includeWc) rooms.push(createRoom('wc'));
    else composeInto(rooms.find(function (room) { return room.id === 'bath_1'; }), 'wc',
      options.bathrooms > 1 ? 'Salle d’eau 1 avec WC' : 'Salle d’eau avec WC');

    /* L1 — les pièces additionnelles entrent par leur déclaration `trigger`.
       Le générateur ne connaît ni le bureau ni les futurs types : un trigger
       `count` nomme seulement le champ d'option et, si nécessaire, celui de
       la variante. */
    var coreTypes = { living: true, kitchen: true, bedroom: true, bath: true, wc: true, circulation: true };
    var declaredRooms = root.TechnoHabSocle && root.TechnoHabSocle.rooms
      ? root.TechnoHabSocle.rooms : {};
    Object.keys(declaredRooms).forEach(function (type) {
      var trigger = declaredRooms[type].trigger;
      if (coreTypes[type] || !trigger || trigger.kind !== 'count') return;
      var count = Math.max(0, Math.trunc(Number(options[trigger.from]) || 0));
      var variant = trigger.variantFrom ? options[trigger.variantFrom] : undefined;
      for (var triggeredIndex = 1; triggeredIndex <= count; triggeredIndex += 1) {
        rooms.push(createRoom(type, triggeredIndex, variant));
      }
    });

    /* Les versements de la typologie viennent après la composition ordinaire :
       le séjour d'un studio porte déjà sa cuisine, il reçoit ensuite le
       couchage. `composeInto()` cumule les programmes sur une même pièce, et
       le solveur d'agencement les additionne — un studio doit loger canapé,
       lit et linéaire de cuisine dans le même volume. */
    if (typologie && typologie.verse) {
      typologie.verse.forEach(function (versement) {
        var hote = rooms.find(function (room) { return room.id === versement.hote; });
        if (hote) composeInto(hote, versement.programme, versement.label || hote.label);
      });
    }
    if (rooms.length >= 4) {
      // Une circulation qui dessert huit pièces n'est pas une circulation qui
      // en dessert deux : sa surface doit suivre ce qu'elle relie, sinon le
      // graphe demandé est géométriquement irréalisable (ROADMAP §3.2).
      var served = 1 + rooms.length - (options.separateKitchen ? 2 : 1);
      /* Le NOMBRE de dégagements est désormais une donnée du programme, et non
         plus un invariant du moteur. Décision du 21 août 2026.

         Le seuil ne vient pas d'un jugement : le plan de référence dessiné à
         la main dessert **cinq** espaces avec un seul dégagement, et
         `test-instrument.mjs` a déjà refusé une valeur plus sévère. Au-delà,
         un couloir unique n'est plus une distribution mais un corridor.

         Deux tentatives antérieures ont échoué à produire ces circulations,
         non parce que le programme ne savait pas les demander, mais parce que
         la découpe en guillotine ne savait pas les border. C'est la typologie
         qui les rend réalisables — voir DECOUPE_ET_GRAPHE.md §7. */
      /* Le besoin de desserte donne un nombre souhaitable de dégagements. La
         surface décide s'il est tenable : un second couloir coûte sa propre
         emprise, et l'imposer à un logement qui ne l'a pas revient à demander
         une géométrie qui n'existe pas — mesuré, un T4 de 70 m² à qui on
         imposait deux dégagements n'admettait plus aucune disposition.

         On retient donc le plus grand nombre de couloirs dont les minima
         cumulés tiennent encore dans la surface demandée. Ce n'est pas un
         seuil décrété : c'est la même somme de minima que la répartition
         utilise juste après. */
      var branchesSouhaitees = Math.max(1, Math.ceil(served / DESSERTES_PAR_COULOIR));
      /* M3 remplace plusieurs pseudo-pièces `circulation_1..n` par un réseau
         connexe unique, dont les branches sont la propriété topologique. Le
         programme et le poseur parlent enfin du même objet. `couloirsMax: 0`
         conserve le cas de desserte intégrée ; toute valeur positive autorise
         le réseau unique. */
      var nbCouloirs = rawOptions && Number.isFinite(rawOptions.couloirsMax) && rawOptions.couloirsMax <= 0 ? 0 : 1;
      /* Le critère des minima est nécessaire, pas suffisant : il ignore la
         marge que la disposition réclame en plus des surfaces. Un T4 de 70 m²
         y satisfait — 66,5 m² de minima pour 70 — et n'admet pourtant aucune
         géométrie à deux dégagements.
         C'est donc `generatePlan()` qui redescend d'un cran quand la typologie
         ne trouve rien, plutôt qu'un seuil de surface inventé ici. */
      for (var ic = 0; ic < nbCouloirs; ic += 1) {
        var corridor = createRoom('circulation');
        var part = served;
        corridor.minArea = round(Math.max(corridor.minArea, MIN_CIRCULATION_WIDTH * part * 0.95), 2);
        corridor.weight = round(corridor.weight + part * 0.22, 2);
        corridor.serves = part;
        corridor.requestedBranches = branchesSouhaitees;
        rooms.push(corridor);
      }
    }

    var minimumTotal = rooms.reduce(function (sum, room) { return sum + room.minArea; }, 0);
    var allocated = allocateTargetAreas(rooms, options.surface);

    // Le créneau de la circulation reste volontairement généreux : c'est de
    // ce surplus que naissent les rangements, et un couloir étroit dès
    // l'allocation touche moins de pièces, donc dessert moins bien.
    // Mesuré : le plafonner dégrade les adjacences plus qu'il ne réduit la
    // largeur, la cession géométrique fait mieux le travail.

    /* Le graphe demandé reste une étoile — mesuré sur 840 plans sur 840, sans
       exception (DECOUPE_ET_GRAPHE.md §1.1) — mais elle peut désormais avoir
       plusieurs centres. Chaque pièce se rattache à UN dégagement, chaque
       dégagement au séjour.

       Aucune arête n'est demandée entre deux circulations : arbitrage du
       21 août, « circulations isolées ». L'accessibilité passe par le séjour,
       que la typologie place au contact de chacune d'elles. */
    var circulations = allocated.filter(function (room) { return room.type === 'circulation'; });
    var desiredEdges = [];
    if (options.separateKitchen) desiredEdges.push(adjacency('living', 'kitchen', 'porte', 'obligatoire'));
    if (circulations.length) {
      circulations.forEach(function (couloir) {
        desiredEdges.push(adjacency('living', couloir.id, 'ouverture', 'obligatoire'));
      });
      /* Réparties par aires équilibrées, la plus grande d'abord. La typologie
         LIT cette répartition au lieu d'en refaire une : deux endroits qui
         décident séparément d'une même chose se désaccordent dès qu'un tirage
         entre en jeu, et les adjacences tombent alors de 100 % à 63 % — c'est
         mesuré, et c'est le défaut même qu'on reprochait à la guillotine. */
      var aDesservir = allocated.filter(function (room) {
        return room.type !== 'circulation' && room.id !== 'living' && room.id !== 'kitchen';
      }).slice().sort(function (a, b) { return b.targetArea - a.targetArea; });
      var charges = circulations.map(function () { return 0; });
      var groupes = circulations.map(function () { return []; });
      aDesservir.forEach(function (room) {
        var moins = 0;
        for (var k = 1; k < charges.length; k += 1) if (charges[k] < charges[moins]) moins = k;
        groupes[moins].push(room);
        charges[moins] += room.targetArea;
      });
      groupes.forEach(function (groupe, k) {
        groupe.forEach(function (room) {
          desiredEdges.push(adjacency(circulations[k].id, room.id, 'porte', 'obligatoire'));
        });
      });
    } else if (options.shape === 'uShape') {
      /* Une desserte intégrée en U n'est pas une étoile : le séjour touche le
         pied des deux ailes, puis chaque pièce touche la suivante dans sa
         colonne. Le programme décrit ce graphe réellement constructible au
         lieu d'exiger que toutes les pièces touchent directement le séjour.
         La répartition reproduit celle de `sansBranche()` sur l'aire de pose. */
      var autresU = allocated.filter(function (room) { return room.id !== 'living'; });
      var ailesU = [[], []], chargesU = [0, 0];
      autresU.slice().sort(function (a, b) {
        var aireA = a.agrement === 0 && Number.isFinite(a.maxArea) ? a.maxArea : a.targetArea;
        var aireB = b.agrement === 0 && Number.isFinite(b.maxArea) ? b.maxArea : b.targetArea;
        return aireB - aireA || a.id.localeCompare(b.id);
      }).forEach(function (room) {
        var aire = room.agrement === 0 && Number.isFinite(room.maxArea) ? room.maxArea : room.targetArea;
        var aile = chargesU[0] <= chargesU[1] ? 0 : 1;
        ailesU[aile].push(room); chargesU[aile] += aire;
      });
      var cuisineU = allocated.find(function (room) { return room.type === 'kitchen'; });
      if (cuisineU) {
        ailesU.forEach(function (aile) {
          var position = aile.indexOf(cuisineU);
          if (position >= 0) { aile.splice(position, 1); aile.push(cuisineU); }
        });
      }
      ailesU.forEach(function (aile) {
        var bains = aile.filter(function (room) { return room.type === 'bath'; });
        var milieu = aile.filter(function (room) { return room.type !== 'bath' && room !== cuisineU; });
        var ordonnee = bains.concat(milieu, aile.indexOf(cuisineU) >= 0 ? [cuisineU] : []);
        aile.splice.apply(aile, [0, aile.length].concat(ordonnee));
      });
      ailesU.forEach(function (aile) {
        if (!aile.length) return;
        var pied = aile[aile.length - 1];
        if (!cuisineU || pied.id !== cuisineU.id) {
          desiredEdges.push(adjacency('living', pied.id, 'porte', 'obligatoire'));
        }
        for (var ui = 1; ui < aile.length; ui += 1) {
          desiredEdges.push(adjacency(aile[ui - 1].id, aile[ui].id, 'porte', 'obligatoire'));
        }
      });
    } else {
      allocated.forEach(function (room) {
        if (room.id !== 'living' && room.id !== 'kitchen') {
          desiredEdges.push(adjacency('living', room.id, 'porte', 'obligatoire'));
        }
      });
    }
    var adjacencyRequirements = desiredEdges.slice();
    var wc = allocated.find(function (room) { return room.type === 'wc'; });
    if (wc && circulations.length) {
      adjacencyRequirements.push(adjacency('living', wc.id, 'porte', 'interdite'));
      if (options.separateKitchen) {
        adjacencyRequirements.push(adjacency('kitchen', wc.id, 'separation', 'deconseillee'));
      }
    }
    var bedrooms = allocated.filter(function (room) { return room.type === 'bedroom'; });
    for (var ba = 0; ba < bedrooms.length; ba += 1) {
      for (var bb = ba + 1; bb < bedrooms.length; bb += 1) {
        adjacencyRequirements.push(adjacency(bedrooms[ba].id, bedrooms[bb].id, 'separation', 'deconseillee'));
      }
    }
    return {
      options: options,
      construction: root.TechnoHabConstruction.normalize(rawOptions && rawOptions.construction),
      rooms: allocated,
      desiredEdges: desiredEdges,
      adjacencies: adjacencyRequirements,
      minimumTotal: round(minimumTotal)
    };
  }

  function hash(text) {
    var value = 2166136261;
    for (var index = 0; index < text.length; index += 1) {
      value ^= text.charCodeAt(index);
      value = Math.imul(value, 16777619);
    }
    return value >>> 0;
  }

  function randomFrom(seed) {
    var value = seed >>> 0;
    return function () {
      value += 0x6D2B79F5;
      var result = value;
      result = Math.imul(result ^ result >>> 15, result | 1);
      result ^= result + Math.imul(result ^ result >>> 7, result | 61);
      return ((result ^ result >>> 14) >>> 0) / 4294967296;
    };
  }

  function shuffled(items, random) {
    var result = items.slice();
    for (var index = result.length - 1; index > 0; index -= 1) {
      var target = Math.floor(random() * (index + 1));
      var current = result[index];
      result[index] = result[target];
      result[target] = current;
    }
    return result;
  }

  function generationError(code, message) {
    var error = new Error(message);
    error.code = code;
    return error;
  }

  // Isole la circulation contre une frontière. Une fois le couloir réduit à
  // une bande, tout groupe recoupé perpendiculairement voit chacune de ses
  // pièces border cette bande : c'est la topologie en peigne, celle qui
  // satisfait un graphe en étoile sans que le hasard ait à la trouver.
  function hubSplit(items) {
    /* Avec plusieurs circulations dans la même tranche, on coupe ENTRE deux
       d'entre elles : chaque moitié garde alors la sienne et peut desservir
       ce qu'elle contient. Couper ailleurs laisserait une moitié sans
       dégagement, et ses pièces sans desserte possible. */
    var hubs = [];
    for (var h = 0; h < items.length; h += 1) {
      if (items[h].type === 'circulation') hubs.push(h);
    }
    if (hubs.length > 1) return hubs[Math.floor(hubs.length / 2)];
    for (var i = 0; i < items.length; i += 1) {
      if (items[i].type === 'circulation') {
        if (i === 0) return 1;
        if (i === items.length - 1) return i;
        return null;   // le hub est au milieu : on le laisse au centre
      }
    }
    return null;
  }

  function chooseSplit(items, random) {
    var total = items.reduce(function (sum, item) { return sum + item.targetArea; }, 0);
    var running = 0;
    var choices = [];
    for (var index = 1; index < items.length; index += 1) {
      running += items[index - 1].targetArea;
      // Perturbation centrée sur zéro : une perturbation toujours positive ne
      // pouvait déplacer la coupe que d'un seul côté de l'équilibre.
      choices.push({ index: index, distance: Math.abs(total / 2 - running) + (random() - 0.5) * total * 0.34 });
    }
    choices.sort(function (a, b) { return a.distance - b.distance; });
    return choices[0].index;
  }

  function layout(items, bounds, depth, priority, random, output) {
    if (items.length === 1) {
      output.push(Object.assign({}, items[0], {
        x0: round(bounds.x), y0: round(bounds.y),
        x1: round(bounds.x + bounds.width), y1: round(bounds.y + bounds.height)
      }));
      return;
    }
    var split = hubSplit(items) || chooseSplit(items, random);
    var first = items.slice(0, split);
    var second = items.slice(split);
    var total = items.reduce(function (sum, item) { return sum + item.targetArea; }, 0);
    var firstTotal = first.reduce(function (sum, item) { return sum + item.targetArea; }, 0);
    var ratio = firstTotal / total;
    // Largeur minimale exigée par le contenu des pièces d'un groupe.
    var need = function (group) {
      return group.reduce(function (max, item) { return Math.max(max, item.minSide || 0); }, 0);
    };
    var needFirst = need(first);
    var needSecond = need(second);
    // Une coupe est praticable si aucune des deux tranches ne devient plus
    // étroite que ce que ses pièces doivent contenir. C'est le seul endroit
    // où la découpe consulte le programme au lieu de le subir — sans cela,
    // aucun tirage ne rattrape un séjour de 1,86 m de profond.
    var fitsVertical = bounds.width * ratio >= needFirst && bounds.width * (1 - ratio) >= needSecond
      && bounds.height >= Math.max(needFirst, needSecond);
    var fitsHorizontal = bounds.height * ratio >= needFirst && bounds.height * (1 - ratio) >= needSecond
      && bounds.width >= Math.max(needFirst, needSecond);

    /* --- Le peigne, retiré le 21 août 2026 ---------------------------------
       Il recoupait perpendiculairement tout groupe déjà détaché du couloir,
       pour que chacune de ses pièces borde la coupe parente et touche donc le
       dégagement. Le raisonnement est juste ; l'effet était l'inverse.

       Mesuré par ablation à graines fixes, sur 840 plans : le peigne
       **coûtait** 2,1 points de desserte et 2,6 points de porte, pour une
       diversité rigoureusement identique (815 signatures) et 14 % de temps en
       plus. `hubSplit()`, lui, en rend 3,7 — les deux effets sont additifs et
       indépendants, ce sont bien deux mécanismes distincts.

       Cause : il forçait `vertical = !parentVertical` dès que la coupe
       perpendiculaire était praticable, confisquant aux lignes ci-dessous le
       choix de direction qu'elles calculent sur les largeurs réellement
       disponibles. Il achetait une adjacence locale au prix de tranches mal
       proportionnées, qui en faisaient perdre davantage plus bas.

       Banc complet après retrait : aucune règle HARD dégradée, et deux
       améliorées — `TH2D-ROOM-002` de 49 à 45, `TH2D-FACADE-001` de 1 à 0.
       `TH2D-ROOM-001` passe de 489 à 456 ; seul `TH2D-CIRC-004`, un conseil,
       se dégrade, de 50 à 74. Empreinte `520b8ebb` → `5bd33591`.

       Ne pas le rétablir sans refaire l'ablation : son raisonnement est
       convaincant et faux. Voir DECOUPE_ET_GRAPHE.md §1.4. */

    var vertical;
    if (priority === 'light' && depth === 0 && fitsHorizontal) vertical = false;
    else if (priority === 'economy' && depth < 2 && fitsVertical) vertical = true;
    else if (fitsVertical !== fitsHorizontal) vertical = fitsVertical;
    else vertical = random() < 0.5 ? bounds.width >= bounds.height : random() < 0.5;

    if (vertical) {
      var width = bounds.width * ratio;
      layout(first, { x: bounds.x, y: bounds.y, width: width, height: bounds.height }, depth + 1, priority, random, output);
      layout(second, { x: bounds.x + width, y: bounds.y, width: bounds.width - width, height: bounds.height }, depth + 1, priority, random, output);
    } else {
      var height = bounds.height * ratio;
      layout(first, { x: bounds.x, y: bounds.y, width: bounds.width, height: height }, depth + 1, priority, random, output);
      layout(second, { x: bounds.x, y: bounds.y + height, width: bounds.width, height: bounds.height - height }, depth + 1, priority, random, output);
    }
  }

  // Après cession et décrochements, la géométrie n'est plus celle qui a servi
  // à calculer les adjacences : deux pièces peuvent s'être mises en contact,
  // ou l'avoir perdu. Le graphe doit être relu sur les parties réelles, sinon
  // il décrit un plan qui n'est plus affiché.
  /* Chaque arête porte désormais sa **longueur de mur commun**. Sans elle,
     une adjacence de 24 cm comptait comme une desserte, alors qu'aucune
     porte n'y tient : le taux de conformité s'en trouvait surévalué de neuf
     points environ.

     Le contact reste le seuil géométrique — les deux pièces se touchent. La
     desserte est autre chose, et se juge sur cette longueur. */
  function edgesFromParts(boxes) {
    var edges = [];
    for (var i = 0; i < boxes.length; i += 1) {
      for (var j = i + 1; j < boxes.length; j += 1) {
        var longueur = 0;
        boxes[i].parts.forEach(function (a) {
          boxes[j].parts.forEach(function (b) {
            var verticalContact = Math.abs(a.x1 - b.x0) < CONTACT || Math.abs(b.x1 - a.x0) < CONTACT;
            var horizontalContact = Math.abs(a.y1 - b.y0) < CONTACT || Math.abs(b.y1 - a.y0) < CONTACT;
            var yOverlap = Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0);
            var xOverlap = Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0);
            if (verticalContact && yOverlap > longueur) longueur = yOverlap;
            if (horizontalContact && xOverlap > longueur) longueur = xOverlap;
          });
        });
        if (longueur > MIN_OVERLAP) {
          edges.push({
            id: 'edge_' + (edges.length + 1), a: boxes[i].id, b: boxes[j].id,
            kind: 'opening', contact: round(longueur, 2)
          });
        }
      }
    }
    return edges;
  }

  /* Le graphe des boîtes nues, avant découpe en parties : une boîte est une
     pièce d'une seule partie. Cette fonction dupliquait edgesFromParts() sans
     en poser le champ `contact` — que scoreCandidate() lit pourtant pour
     doser la pénalité de desserte. Le contact valait donc toujours 0 et la
     pénalité restait à son maximum quelle que soit la géométrie : la
     recherche optimisait une constante. Passer par la même fonction garantit
     que la recherche et le verdict lisent la même définition d'adjacence, et
     que les deux mesurent la même longueur de mur commun. */
  function actualEdges(boxes) {
    return edgesFromParts(boxes.map(function (box) {
      return { id: box.id, parts: [{ x0: box.x0, y0: box.y0, x1: box.x1, y1: box.y1 }] };
    }));
  }

  /* D1 — l'entrée était posée après coup, sur le candidat déjà retenu : rien
     dans la recherche ne poussait une pièce éligible vers l'enveloppe. La
     circulation finissait enclavée et l'entrée redescendait la chaîne
     d'éligibilité vers le séjour ou la cuisine, quand elle ne renvoyait pas
     `null`. Le contact de façade devient donc un critère de sélection.

     Deux peines distinctes, et l'écart entre elles est voulu : un plan sans
     entrée n'est pas un logement, un plan dont l'entrée ouvre sur la cuisine
     en est un, simplement moins bon. */
  function rangEntree(type) {
    var rang = ENTREE_ORDRE.indexOf(type);
    return rang < 0 ? ENTREE_ORDRE.length : rang;
  }

  function valeurCanonique(id, fallback) {
    var registry = root.TechnoHabCanonicalValues;
    var entry = registry && registry.get ? registry.get(id) : null;
    return entry && Number.isFinite(entry.value) ? entry.value : fallback;
  }

  /* PONDERATION §3.3 — regroupement technique. Spécifié en préférence dans
     le référentiel d'origine (PLACEMENT_ET_ADJACENCES.md §2.4), jamais
     câblé : « les pièces partageant un réseau gagnent à se toucher ». Pas de
     prérequis manquant, contrairement à l'orientation (§2.3) — calculable
     sur les centroïdes, avec ce que le plan connaît déjà.

     La liste reprend exactement la catégorie « humide » du document, pas le
     champ `services` de room-model.js : celui-ci varie avec le mobilier
     retenu (un lave-vaisselle ajoute `evacuation` à une cuisine qui ne
     l'avait pas) et scoreCandidateDetails() score la géométrie du candidat,
     avant que l'équipement ne soit résolu. Router par le type de pièce est
     ce que la doctrine demande, pas une approximation de ce qu'elle demande. */
  var PIECES_HUMIDES = ['kitchen', 'bath', 'wc', 'buanderie'];
  var SERVICES_DISTANCE_THRESHOLD_ID = 'VAL-SCORE-SERVICES-DISTANCE-THRESHOLD-001';
  var SERVICES_DISTANCE_THRESHOLD_FALLBACK = 3.5;
  var SERVICES_DISTANCE_WEIGHT_ID = 'VAL-SCORE-SERVICES-DISTANCE-EXCESS-WEIGHT-001';
  var SERVICES_DISTANCE_WEIGHT_FALLBACK = 10;

  function centroid(box) {
    return { x: (box.x0 + box.x1) / 2, y: (box.y0 + box.y1) / 2 };
  }

  /* Préférence, jamais un blocage : contrairement à `TH2D-ADJ-002`, deux
     pièces humides éloignées ne rendent aucun plan invalide, elles perdent
     seulement du terrain face à un candidat qui les groupe. Le malus croît
     avec l'excédent au-delà du seuil, jamais avec la distance brute — deux
     pièces déjà groupées ne se disputent pas un mètre de plus. */
  function penaliteRegroupementTechnique(boxes) {
    var humides = boxes.filter(function (box) { return PIECES_HUMIDES.indexOf(box.type) >= 0; });
    if (humides.length < 2) return 0;
    var seuil = valeurCanonique(SERVICES_DISTANCE_THRESHOLD_ID, SERVICES_DISTANCE_THRESHOLD_FALLBACK);
    var poids = valeurCanonique(SERVICES_DISTANCE_WEIGHT_ID, SERVICES_DISTANCE_WEIGHT_FALLBACK);
    var score = 0;
    for (var i = 0; i < humides.length; i += 1) {
      var a = centroid(humides[i]);
      for (var j = i + 1; j < humides.length; j += 1) {
        var b = centroid(humides[j]);
        var distance = Math.hypot(a.x - b.x, a.y - b.y);
        if (distance > seuil) score += (distance - seuil) * poids;
      }
    }
    return score;
  }

  /* Les pièces où l'on vit doivent toucher la façade : sans elle, ni fenêtre
     ni entrée d'air. `TH2D-FACADE-001` le juge en HARD, mais la recherche
     l'ignorait — exactement le défaut de D1, sur une autre règle. Mesuré en
     corrigeant l'entrée seule : pousser un hôte vers l'enveloppe prend de la
     façade aux chambres et fait passer cette règle de 39 à 53 violations sur
     720 plans. Deux critères qui se disputent le même bord doivent être
     arbitrés dans le score, pas l'un après l'autre. */
  var PIECES_EN_FACADE = ['living', 'bedroom', 'kitchen', 'dining', 'bureau'];

  function penaliteFacade(boxes, enveloppe) {
    var parId = {};
    var rangIdeal = -1;
    boxes.forEach(function (box) {
      parId[box.id] = box;
      if (ENTREE_INTERDITE.indexOf(box.type) >= 0) return;
      var rang = rangEntree(box.type);
      if (rangIdeal < 0 || rang < rangIdeal) rangIdeal = rang;
    });
    var meilleurRang = -1;
    var enFacade = {};
    facadeSegments(boxes, enveloppe).forEach(function (segment) {
      var box = parId[segment.room];
      if (!box) return;
      enFacade[box.id] = true;
      if (ENTREE_INTERDITE.indexOf(box.type) >= 0) return;
      if (segment.longueur < PORTE_ENTREE) return;
      var rang = rangEntree(box.type);
      if (meilleurRang < 0 || rang < meilleurRang) meilleurRang = rang;
    });
    var score = 0;
    boxes.forEach(function (box) {
      if (PIECES_EN_FACADE.indexOf(box.type) >= 0 && !enFacade[box.id]) score += 100;
    });
    // Aucune pièce éligible en façade : le plan n'a pas d'entrée possible.
    // La peine vaut deux adjacences manquées, parce que le défaut est pire.
    if (meilleurRang < 0) return score + 220;
    // Sinon, on paie l'écart au meilleur hôte que *ce programme* permet. La
    // référence est relative, sans quoi un plan sans pièce d'entrée dédiée —
    // c'est-à-dire tous aujourd'hui — ne pourrait jamais atteindre un score
    // nul, et la recherche perdrait sa sortie anticipée.
    // 18 par rang : assez pour départager deux plans par ailleurs
    // équivalents, trop peu pour sacrifier une desserte (110) ou la façade
    // d'une chambre (100).
    return score + Math.max(0, meilleurRang - Math.max(0, rangIdeal)) * 18;
  }

  /* PONDERATION §3.4 — lumière, sans ce qu'elle demanderait vraiment.

     Remplace un proxy binaire — le séjour touche-t-il le nord du plan,
     indépendamment de toute façade réelle — par la longueur de façade
     effectivement obtenue par chaque pièce principale.

     Ce n'est PAS un compte d'ouvertures. `scoreCandidateDetails()` est
     appelée depuis `candidatDepuisPieces()` sur des `boxes` nues, avant que
     `poserFenetres()` ne place la moindre baie — la trame l'annonçait à
     tort, corrigé ici après lecture du point d'appel. Ce que le score peut
     lire à ce stade, c'est le mètre linéaire de mur donnant sur l'extérieur
     que `facadeSegments()` calcule déjà pour `penaliteFacade()` : la matière
     première d'une baie, pas la baie elle-même. Compter les fenêtres posées
     exigerait de déplacer ce critère après construction — hors périmètre de
     ce chantier, qui n'active que ce que le moteur sait déjà faire.

     N'agit qu'en mode `light`, choisi par l'utilisateur : ce n'est pas une
     déduction du moteur sur ce qui serait mieux, c'est une préférence
     demandée, au sens de la décision 3 (`DECISIONS_REGLES.md` §3). */
  function penaliteLumiere(boxes, enveloppe, priorities) {
    if ((priorities || []).indexOf('light') < 0) return 0;
    var reference = valeurCanonique('VAL-SCORE-LIGHT-FACADE-REFERENCE-001', 2.0);
    var poids = valeurCanonique('VAL-SCORE-LIGHT-FACADE-SHORTFALL-WEIGHT-001', 8);
    var longueurParPiece = {};
    facadeSegments(boxes, enveloppe).forEach(function (segment) {
      longueurParPiece[segment.room] = (longueurParPiece[segment.room] || 0) + segment.longueur;
    });
    var score = 0;
    boxes.forEach(function (box) {
      if (PIECES_EN_FACADE.indexOf(box.type) < 0) return;
      var longueur = longueurParPiece[box.id] || 0;
      if (longueur < reference) score += (reference - longueur) * poids;
    });
    return score;
  }

  /* M4a.2 — la façade nécessaire à une entrée et la façade consommée par un
     couloir ne sont plus le même critère. Une circulation peut garder la
     largeur d'une porte si elle est le meilleur hôte ; le surplus reçoit une
     peine N3 nommée, jamais une invalidation. */
  function longueursFacadeUniques(segments) {
    var groupes = {};
    segments.forEach(function (segment) {
      var horizontal = segment.cote === 'nord' || segment.cote === 'sud';
      var ligne = horizontal ? segment.y0 : segment.x0;
      var debut = horizontal ? Math.min(segment.x0, segment.x1) : Math.min(segment.y0, segment.y1);
      var fin = horizontal ? Math.max(segment.x0, segment.x1) : Math.max(segment.y0, segment.y1);
      var cle = segment.room + '|' + segment.cote + '|' + round(ligne, 3);
      (groupes[cle] || (groupes[cle] = [])).push([debut, fin]);
    });
    var longueurs = [];
    Object.keys(groupes).forEach(function (cle) {
      var intervalles = groupes[cle].sort(function (a, b) { return a[0] - b[0]; });
      var courant = intervalles[0].slice();
      for (var i = 1; i < intervalles.length; i += 1) {
        if (intervalles[i][0] <= courant[1] + CONTACT) courant[1] = Math.max(courant[1], intervalles[i][1]);
        else { longueurs.push(courant[1] - courant[0]); courant = intervalles[i].slice(); }
      }
      longueurs.push(courant[1] - courant[0]);
    });
    return longueurs;
  }

  function circulationFacadeMetrics(boxes, enveloppe, entreeSurCirculation) {
    var circulationIds = {};
    boxes.filter(function (box) { return box.type === 'circulation'; })
      .forEach(function (box) { circulationIds[box.id] = true; });
    var segments = facadeSegments(boxes, enveloppe).filter(function (segment) {
      return circulationIds[segment.room];
    });
    var longueurs = longueursFacadeUniques(segments);
    var length = longueurs.reduce(function (sum, longueur) { return sum + longueur; }, 0);
    var canHostEntrance = longueurs.some(function (longueur) {
      return longueur + 0.005 >= PORTE_ENTREE;
    });
    // Après construction, la porte posée fait foi même si le contour utile a
    // fragmenté son segment hôte en sous-segments. Avant construction, la
    // capacité géométrique reste le seul proxy disponible.
    var allowance = entreeSurCirculation === true
      ? PORTE_ENTREE
      : (entreeSurCirculation === false ? 0 : (canHostEntrance ? PORTE_ENTREE : 0));
    var excess = Math.max(0, length - allowance);
    var weight = root.TechnoHabAblations && root.TechnoHabAblations.disableM4a2FacadeCost
      ? 0
      : valeurCanonique(CIRCULATION_FACADE_VALUE_ID, CIRCULATION_FACADE_WEIGHT_FALLBACK);
    return {
      method: 'entry-allowance-then-excess-v1',
      length: round(length, 2),
      entryAllowance: round(allowance, 2),
      excess: round(excess, 2),
      cost: round(excess * weight, 2),
      valueId: CIRCULATION_FACADE_VALUE_ID,
      weight: weight
    };
  }

  /* M5.0 — un réseau globalement court peut encore porter un bras vide. Les
     rectangles de branche sont donc scindés à leurs jonctions en bras
     logiques. La mesure construite affecte ensuite chaque porte à un seul bras
     et compte le reliquat situé au-delà de la dernière ouverture. */
  function circulationArms(rooms) {
    var arms = [];
    (rooms || []).filter(function (room) { return room.type === 'circulation'; })
      .forEach(function (room) {
        var parts = room.parts && room.parts.length ? room.parts : [room];
        parts.forEach(function (part, partIndex) {
          var horizontal = Math.abs(part.x1 - part.x0) >= Math.abs(part.y1 - part.y0);
          var axis0 = horizontal ? part.x0 : part.y0;
          var axis1 = horizontal ? part.x1 : part.y1;
          var junctions = [];
          parts.forEach(function (other, otherIndex) {
            if (otherIndex === partIndex) return;
            var x0 = Math.max(part.x0, other.x0), x1 = Math.min(part.x1, other.x1);
            var y0 = Math.max(part.y0, other.y0), y1 = Math.min(part.y1, other.y1);
            var xOverlap = x1 - x0, yOverlap = y1 - y0;
            /* Certaines branches se recouvrent au coude, d'autres se
               raccordent exactement bord à bord. Les deux sont une jonction ;
               ignorer le second cas fusionnerait les deux bras d'une barre de
               T en un seul segment et masquerait précisément les bras morts. */
            if (xOverlap >= -CONTACT && yOverlap >= -CONTACT &&
                (xOverlap > CONTACT || yOverlap > CONTACT)) {
              var j0 = horizontal ? Math.max(part.x0, Math.min(part.x1, other.x0))
                : Math.max(part.y0, Math.min(part.y1, other.y0));
              var j1 = horizontal ? Math.max(part.x0, Math.min(part.x1, other.x1))
                : Math.max(part.y0, Math.min(part.y1, other.y1));
              junctions.push([Math.min(j0, j1), Math.max(j0, j1)]);
            }
          });
          function addArm(a0, a1, originAt, suffix) {
            if (a1 - a0 <= 0.08) return;
            arms.push({
              id: room.id + ':p' + partIndex + ':' + suffix,
              room: room.id, horizontal: horizontal,
              x0: horizontal ? a0 : part.x0,
              y0: horizontal ? part.y0 : a0,
              x1: horizontal ? a1 : part.x1,
              y1: horizontal ? part.y1 : a1,
              axis0: a0, axis1: a1, originAt: originAt,
              length: a1 - a0
            });
          }
          if (!junctions.length) {
            addArm(axis0, axis1, 'free', 'whole');
            return;
          }
          var junction0 = Math.min.apply(null, junctions.map(function (item) { return item[0]; }));
          var junction1 = Math.max.apply(null, junctions.map(function (item) { return item[1]; }));
          addArm(axis0, junction0, 'end', 'start');
          addArm(junction1, axis1, 'start', 'end');
        });
      });
    return arms;
  }

  function distanceOuvertureBras(opening, arm) {
    var x = opening.x, y = opening.y;
    if (!Number.isFinite(x) || !Number.isFinite(y)) return Infinity;
    var distance = Infinity;
    if (y >= arm.y0 - 0.22 && y <= arm.y1 + 0.22) {
      distance = Math.min(distance, Math.abs(x - arm.x0), Math.abs(x - arm.x1));
    }
    if (x >= arm.x0 - 0.22 && x <= arm.x1 + 0.22) {
      distance = Math.min(distance, Math.abs(y - arm.y0), Math.abs(y - arm.y1));
    }
    return distance;
  }

  function circulationBranchUtilityMetrics(rooms, portes, entree) {
    var circulationIds = {};
    (rooms || []).filter(function (room) { return room.type === 'circulation'; })
      .forEach(function (room) { circulationIds[room.id] = true; });
    var arms = circulationArms(rooms);
    var openings = (portes || []).filter(function (opening) {
      return (opening.entre || []).some(function (id) { return circulationIds[id]; });
    });
    if (entree && (entree.entre || []).some(function (id) { return circulationIds[id]; })) {
      openings.push(entree);
    }
    var assigned = arms.map(function () { return []; });
    openings.forEach(function (opening) {
      var best = -1, bestDistance = Infinity;
      arms.forEach(function (arm, index) {
        var distance = distanceOuvertureBras(opening, arm);
        if (distance < bestDistance) { best = index; bestDistance = distance; }
      });
      if (best >= 0 && bestDistance <= 0.22) assigned[best].push(opening);
    });
    var armResults = arms.map(function (arm, index) {
      var services = assigned[index];
      var deadLength = 0;
      if (!services.length) deadLength = arm.length;
      else if (arm.originAt !== 'free') {
        var farthest = services.reduce(function (maximum, opening) {
          var coordinate = arm.horizontal ? opening.x : opening.y;
          var distance = arm.originAt === 'start'
            ? coordinate - arm.axis0
            : arm.axis1 - coordinate;
          var halfWidth = (opening.largeur || opening.bayWidth || 0.8) / 2;
          return Math.max(maximum, Math.min(arm.length, distance + halfWidth));
        }, 0);
        deadLength = Math.max(0, arm.length - farthest);
      } else if (services.length >= 2) {
        var coordinates = services.map(function (opening) {
          return arm.horizontal ? opening.x : opening.y;
        });
        var first = Math.min.apply(null, coordinates);
        var last = Math.max.apply(null, coordinates);
        var half = Math.max.apply(null, services.map(function (opening) {
          return (opening.largeur || opening.bayWidth || 0.8) / 2;
        }));
        deadLength = Math.max(0, first - arm.axis0 - half) +
          Math.max(0, arm.axis1 - last - half);
      }
      return {
        id: arm.id,
        direction: arm.horizontal ? 'horizontal' : 'vertical',
        length: round(arm.length, 2),
        serviceCount: services.length,
        servesEntrance: services.some(function (opening) { return opening.kind === 'entree'; }),
        deadLength: round(deadLength, 2)
      };
    });
    var deadLength = armResults.reduce(function (sum, arm) { return sum + arm.deadLength; }, 0);
    var weight = root.TechnoHabAblations && root.TechnoHabAblations.disableM5BranchUtility
      ? 0
      : valeurCanonique(CIRCULATION_DEAD_LENGTH_VALUE_ID, CIRCULATION_DEAD_LENGTH_WEIGHT_FALLBACK);
    return {
      method: 'door-incidence-logical-arms-v1',
      armCount: armResults.length,
      emptyArmCount: armResults.filter(function (arm) { return arm.serviceCount === 0; }).length,
      deadLength: round(deadLength, 2),
      cost: round(deadLength * weight, 2),
      valueId: CIRCULATION_DEAD_LENGTH_VALUE_ID,
      weight: weight,
      arms: armResults
    };
  }

  /* M3.0 — proxy disponible avant construction des portes et du calque.

     La longueur est la somme des axes longs des branches de circulation ; le
     besoin est le nombre de relations demandées qui touchent un dégagement.
     Le rapport s'exprime donc en mètres par desserte. Contrairement à l'aire,
     il ne récompense pas un couloir qui s'allonge sous prétexte qu'il reste
     étroit. Les longueurs réelles entrée → pièces, calculées plus tard par le
     calque, voyagent séparément dans `plan.parcours.desserte`.

     Les parties se recouvrant aux articulations d'un futur L/T, retrancher
     exactement les recouvrements demandera le graphe de branches de M3. Le
     champ `method` rend cette approximation opposable jusque-là. */
  function circulationDesserteMetrics(boxes, edges, desiredEdges) {
    var circulations = boxes.filter(function (room) { return room.type === 'circulation'; });
    var ids = {};
    circulations.forEach(function (room) { ids[room.id] = true; });
    var branches = [];
    circulations.forEach(function (room) {
      var roomParts = room.parts && room.parts.length ? room.parts : [room];
      roomParts.forEach(function (part) {
        branches.push(Math.max(Math.abs(part.x1 - part.x0), Math.abs(part.y1 - part.y0)));
      });
    });
    var requested = (desiredEdges || []).filter(function (edge) { return ids[edge.a] || ids[edge.b]; }).length;
    var served = (edges || []).filter(function (edge) {
      return (ids[edge.a] || ids[edge.b]) && (edge.contact || 0) + 0.005 >= MIN_DESSERTE;
    }).length;
    var length = branches.reduce(function (sum, value) { return sum + value; }, 0);
    return {
      method: 'branch-service-span-v2',
      length: round(length, 2),
      longestBranch: round(branches.reduce(function (maximum, value) { return Math.max(maximum, value); }, 0), 2),
      scoringLength: round(length * 0.25 +
        branches.reduce(function (maximum, value) { return Math.max(maximum, value); }, 0) * 0.75, 2),
      requestedServices: requested,
      servedServices: served,
      metersPerRequestedService: round((length * 0.25 +
        branches.reduce(function (maximum, value) { return Math.max(maximum, value); }, 0) * 0.75) /
        Math.max(1, requested), 3)
    };
  }

  function scoreCandidateDetails(boxes, edges, program, enveloppe) {
    var breakdown = {};
    function add(criterion, amount) {
      if (!(amount > 0)) return;
      breakdown[criterion] = (breakdown[criterion] || 0) + amount;
    }
    add('facade', penaliteFacade(boxes, enveloppe));
    add('servicesProximity', penaliteRegroupementTechnique(boxes));
    var circulationFacade = circulationFacadeMetrics(boxes, enveloppe);
    add('circulationFacade', circulationFacade.cost);
    /* La recherche vise la desserte, non le simple contact : sinon elle
       optimiserait un critère que la règle ne juge pas, et un contact de
       24 cm passerait pour un succès. La pénalité décroît avec la longueur
       obtenue — rater de peu coûte moins que ne rien toucher. */
    program.desiredEdges.forEach(function (requested) {
      var lien = null;
      edges.forEach(function (edge) {
        if ((edge.a === requested.a && edge.b === requested.b) ||
            (edge.a === requested.b && edge.b === requested.a)) lien = edge;
      });
      var contact = lien && typeof lien.contact === 'number' ? lien.contact : 0;
      var requiredContact = Number.isFinite(requested.contact) ? requested.contact : MIN_DESSERTE;
      if (contact + 0.005 < requiredContact) {
        add('adjacency', 110 * (1 - Math.min(1, contact / Math.max(0.01, requiredContact)) * 0.6));
      }
    });
    (program.adjacencies || []).forEach(function (relation) {
      if (relation.degre === 'obligatoire') return;
      var actual = edges.find(function (edge) {
        return (edge.a === relation.a && edge.b === relation.b) ||
          (edge.a === relation.b && edge.b === relation.a);
      });
      var realized = Boolean(actual && (actual.contact || 0) > CONTACT);
      // Toujours des peines, jamais des primes : un souhait réalisé vaut zéro.
      if (relation.degre === 'souhaitable' && !realized) add('desiredAdjacency', 28);
      if (relation.degre === 'deconseillee' && realized) add('discouragedAdjacency', 18);
      /* Une interdiction de porte ne peut pas être jugée sur un mur commun :
         à ce stade le candidat ne porte encore aucune ouverture. Le verdict
         construit la jugera sur `plan.portes`. Les interdictions de
         contiguïté (`separation`) restent, elles, calculables ici. */
      if (relation.degre === 'interdite' && relation.nature !== 'porte' && realized) {
        add('forbiddenAdjacency', 220);
      }
    });
    boxes.forEach(function (room) {
      var width = Math.abs(room.x1 - room.x0);
      var height = Math.abs(room.y1 - room.y0);
      var ratio = Math.min(width, height) / Math.max(width, height);
      /* Chantier 6 §6.3 — DÉFAUT CONNU, NON CORRIGÉ, et la raison est mesurée.

         Cette peine s'applique aussi à la circulation, et elle ne devrait
         pas : un couloir est allongé par définition. Le test de l'instrument
         l'a établi — le plan de référence dessiné à la main obtient 15,05
         points quand les trente plans générés de la même configuration
         obtiennent 0, et ces 15,05 sont *entièrement* imputables au ratio de
         son dégagement de 1,30 × 5,50 m.

         L'exemption a été écrite, mesurée, puis retirée. Elle coûte plus
         qu'elle ne rapporte : sur 600 pièces meublées, les pièces que le
         solveur complet ne sait plus meubler passent de **4 à 12**, presque
         toutes des salles d'eau composées. Le mécanisme est identifié — un
         couloir plus long longe plus de pièces, `carveCirculation()` leur
         cède plus de bandes, et le solveur, encore rectangulaire, sert une
         pièce en L par sa seule partie principale (limite ouverte de D2).

         La cause profonde n'est pas dans cette ligne : `scoreCandidate()`
         s'exécute **avant** la cession, il ne peut donc pas arbitrer sur ses
         conséquences. La corriger demande de revoir la boucle de recherche,
         pas d'ajouter une condition ici.

         La peine est donc laissée en place, en sachant qu'elle est fausse et
         pourquoi on la garde. `scripts/test-instrument.mjs` porte l'écart de
         15,05 comme limite consignée et échoue s'il s'aggrave. */
      // Le ratio d'une circulation est jugé par la longueur de desserte
      // ci-dessous. Lui appliquer aussi une proportion de pièce ferait payer
      // deux fois la même grandeur et maintiendrait le faux critère de M2.
      if (room.type !== 'circulation' && ratio < 0.32) add('roomProportion', (0.32 - ratio) * 180);
      // Une pièce qui ne peut pas recevoir son mobilier n'est pas une pièce
      // mal proportionnée, elle est inutilisable. Le verdict vient du socle,
      // pas d'une convention de largeur.
      if (!roomFits(room.type, width, height, roomVariant(room))) add('furnishability', 95);
      // Une circulation trop étroite est infranchissable : la pénalité doit
      // peser autant qu'une adjacence manquante, sans quoi le moteur la
      // déclare conforme (voir ROADMAP §3.2).
      if (room.type === 'circulation') {
        var clear = narrowestSide(room);
        if (clear < MIN_CIRCULATION_WIDTH) add('circulationWidth', (MIN_CIRCULATION_WIDTH - clear) * 320);
        // Pas de pénalité de largeur maximale ici : le surplus est cédé aux
        // pièces longées par carveCirculation(), et c'est justement d'un
        // créneau généreux que naît la bande de rangement.
        var served = edges.filter(function (edge) { return edge.a === room.id || edge.b === room.id; }).length;
        if (served < 2) add('circulationService', (2 - served) * 90);
      }
    });
    var circulation = circulationDesserteMetrics(boxes, edges, program.desiredEdges);
    if (circulation.length > 0 && circulation.requestedServices > 0) {
      add('circulationLength', Math.pow(circulation.metersPerRequestedService, 2) * CIRCULATION_LENGTH_WEIGHT);
    }
    add('lightPriority', penaliteLumiere(boxes, enveloppe, program.options.priorities));
    if ((program.options.priorities || []).indexOf('economy') >= 0) add('economyPriority', edges.length * 0.4);
    var total = Object.keys(breakdown).reduce(function (sum, key) { return sum + breakdown[key]; }, 0);
    Object.keys(breakdown).forEach(function (key) { breakdown[key] = round(breakdown[key], 2); });
    return {
      total: total, breakdown: breakdown, circulation: circulation,
      circulationFacade: circulationFacade
    };
  }

  function scoreCandidate(boxes, edges, program, enveloppe) {
    return scoreCandidateDetails(boxes, edges, program, enveloppe).total;
  }

  function mandatoryAdjacenciesHeld(candidate, program) {
    return program.desiredEdges.every(function (requested) {
      var required = Number.isFinite(requested.contact) ? requested.contact : MIN_DESSERTE;
      return candidate.edges.some(function (edge) {
        var same = (edge.a === requested.a && edge.b === requested.b) ||
          (edge.a === requested.b && edge.b === requested.a);
        return same && (edge.contact || 0) + 0.005 >= required;
      });
    });
  }

  // --- Doctrine du rangement et de la réserve (ROADMAP §5 ter) -------------
  // Le créneau attribué à la circulation par la découpe est plus large que ce
  // qu'un couloir demande. Le surplus n'est pas supprimé, il est cédé aux
  // pièces longées : la surface totale est conservée, la couverture du plan
  // reste complète, et les pièces qui reçoivent une bande deviennent des L.

  // Projection sur l'axe long du couloir : `a` suit sa longueur, `c` sa
  // largeur. Écrire l'algorithme une seule fois pour les deux orientations.
  function project(rect, horizontal) {
    return horizontal
      ? { a0: rect.x0, a1: rect.x1, c0: rect.y0, c1: rect.y1 }
      : { a0: rect.y0, a1: rect.y1, c0: rect.x0, c1: rect.x1 };
  }

  function unproject(p, horizontal) {
    return horizontal
      ? { x0: p.a0, y0: p.c0, x1: p.a1, y1: p.c1 }
      : { x0: p.c0, y0: p.a0, x1: p.c1, y1: p.a1 };
  }

  function partsBounds(parts) {
    return {
      x0: Math.min.apply(null, parts.map(function (p) { return p.x0; })),
      y0: Math.min.apply(null, parts.map(function (p) { return p.y0; })),
      x1: Math.max.apply(null, parts.map(function (p) { return p.x1; })),
      y1: Math.max.apply(null, parts.map(function (p) { return p.y1; }))
    };
  }

  // Nombre d'arêtes du contour. Une partie qui longe un côté entier du
  // rectangle principal ne crée aucun coin rentrant — la pièce reste un
  // rectangle. Les autres en créent un, soit deux arêtes.
  function countEdges(parts) {
    if (parts.length < 2) return 4;
    var main = parts[0];
    return parts.slice(1).reduce(function (total, part) {
      var flushX = Math.abs(part.x0 - main.x0) < 0.02 && Math.abs(part.x1 - main.x1) < 0.02;
      var flushY = Math.abs(part.y0 - main.y0) < 0.02 && Math.abs(part.y1 - main.y1) < 0.02;
      return total + (flushX || flushY ? 0 : 2);
    }, 4);
  }

  function partsArea(parts) {
    return parts.reduce(function (sum, p) { return sum + (p.x1 - p.x0) * (p.y1 - p.y0); }, 0);
  }

  /* D2 — une pièce dont les parties pavent exactement leur boîte englobante
     est un rectangle, quel que soit le nombre de morceaux qui l'ont produite.
     La découpe est un moyen ; la pièce est ce qui en sort. Tant qu'on servait
     `parts[0]` au rendu et au solveur, une pièce rectangulaire née d'une
     cession se dessinait avec un trait de refend au milieu et se meublait sur
     une fraction de sa surface. */
  function unionEstRectangle(parts) {
    if (parts.length < 2) return true;
    var bounds = partsBounds(parts);
    var pave = (bounds.x1 - bounds.x0) * (bounds.y1 - bounds.y0);
    return Math.abs(pave - partsArea(parts)) < 0.005;
  }

  // Les pièces bordant un côté du couloir, avec la portion de longueur que
  // chacune couvre. Une bande ne peut être cédée que si ces portions couvrent
  // tout le côté : sinon une part resterait sans propriétaire, et la
  // couverture du plan cesserait d'être complète.
  function borderingRooms(boxes, corridor, horizontal, side) {
    var slot = project(corridor.parts[0], horizontal);
    var edge = side === 'low' ? slot.c0 : slot.c1;
    return boxes.filter(function (box) {
      // O1 — une bande est encore de la surface : une enveloppe déjà fermée
      // ne redevient pas variable d'ajustement pendant la cession.
      return box !== corridor && box.maxArea === null;
    }).map(function (box) {
      var other = project(box.parts[0], horizontal);
      var touches = side === 'low'
        ? Math.abs(other.c1 - edge) < CONTACT
        : Math.abs(other.c0 - edge) < CONTACT;
      if (!touches) return null;
      var a0 = Math.max(other.a0, slot.a0);
      var a1 = Math.min(other.a1, slot.a1);
      return a1 - a0 > MIN_OVERLAP ? { box: box, a0: a0, a1: a1, full: other } : null;
    }).filter(Boolean).sort(function (x, y) { return x.a0 - y.a0; });
  }

  function coversSide(neighbours, slot) {
    if (!neighbours.length) return false;
    var cursor = slot.a0;
    for (var i = 0; i < neighbours.length; i += 1) {
      if (neighbours[i].a0 > cursor + CONTACT) return false;
      cursor = Math.max(cursor, neighbours[i].a1);
    }
    return cursor >= slot.a1 - CONTACT;
  }

  // Cède au maximum une bande d'un côté du couloir. Renvoie le nombre de
  // rangements créés et de réserves attribuées, ou null si aucune cession
  // n'est possible — auquel cas le couloir reste tel quel.
  function carveSide(boxes, corridor, horizontal, side, targetWidth) {
    var slot = project(corridor.parts[0], horizontal);
    var neighbours = borderingRooms(boxes, corridor, horizontal, side);
    if (!coversSide(neighbours, slot)) return null;

    var depth = (slot.c1 - slot.c0) - targetWidth;
    // La profondeur est uniforme sur toute la bande, sinon le couloir cesse
    // d'être un rectangle. Elle est donc bornée par le segment le plus court.
    var shortest = Math.min.apply(null, neighbours.map(function (n) { return n.a1 - n.a0; }));
    depth = Math.min(depth, MAX_STORAGE_DEPTH_RATIO * shortest);
    if (depth < MIN_STORAGE_DEPTH) return null;

    var stripC0 = side === 'low' ? slot.c0 : slot.c1 - depth;
    var stripC1 = side === 'low' ? slot.c0 + depth : slot.c1;
    var storages = 0;
    var reserves = 0;

    neighbours.forEach(function (n) {
      var segment = unproject({ a0: n.a0, a1: n.a1, c0: stripC0, c1: stripC1 }, horizontal);
      var main = n.box.parts[0];
      var length = n.a1 - n.a0;
      // Une bande dans les bornes du rangement est un rangement, qu'elle
      // couvre toute la façade ou non : une bande de 60 cm le long d'un mur
      // de chambre est un placard, pas un agrandissement anonyme. Ce n'est
      // que hors bornes qu'elle se fond dans la pièce, en réserve.
      if (depth >= MIN_STORAGE_DEPTH && depth <= MAX_STORAGE_DEPTH_RATIO * length) {
        segment.role = 'storage';
        n.box.parts.push(segment);
        storages += 1;
      } else {
        if (horizontal) { if (side === 'low') main.y1 = segment.y1; else main.y0 = segment.y0; }
        else { if (side === 'low') main.x1 = segment.x1; else main.x0 = segment.x0; }
        reserves += 1;
      }
    });

    var corridorMain = corridor.parts[0];
    if (horizontal) {
      if (side === 'low') corridorMain.y0 = stripC1; else corridorMain.y1 = stripC0;
    } else {
      if (side === 'low') corridorMain.x0 = stripC1; else corridorMain.x1 = stripC0;
    }
    return { storages: storages, reserves: reserves, depth: round(depth) };
  }

  /* Toutes les circulations cèdent leur surplus, pas seulement la première.
     Le `find()` d'origine était juste tant que le programme n'en produisait
     qu'une ; avec plusieurs, il aurait laissé les suivantes garder un créneau
     entier — donc des couloirs larges et aucune bande de rangement de leur
     côté. */
  function carveCirculation(boxes) {
    var couloirs = boxes.filter(function (box) { return box.type === 'circulation'; });
    if (!couloirs.length) return null;
    var cumul = { storages: 0, reserves: 0, passes: 0, sides: [] };
    couloirs.forEach(function (couloir) {
      var partiel = carveUnCouloir(boxes, couloir);
      if (!partiel) return;
      cumul.storages += partiel.storages;
      cumul.reserves += partiel.reserves;
      cumul.passes += partiel.passes;
      cumul.sides = cumul.sides.concat(partiel.sides);
    });
    return cumul.passes ? cumul : null;
  }

  function carveUnCouloir(boxes, corridor) {
    var main = corridor.parts[0];
    var horizontal = (main.x1 - main.x0) >= (main.y1 - main.y0);
    var long = Math.max(main.x1 - main.x0, main.y1 - main.y0);
    // Largeur dont le couloir a réellement besoin pour desservir : le reste
    // du créneau est du surplus.
    var needed = Math.min(MAX_CIRCULATION_WIDTH,
      Math.max(MIN_CIRCULATION_WIDTH, (corridor.minArea || 0) / long));

    // La profondeur cessible d'un côté est bornée par le segment le plus
    // court qui le borde. Un seul côté ne suffit donc pas toujours à ramener
    // le couloir sous sa largeur maximale : on reprend de l'autre côté.
    var total = { storages: 0, reserves: 0, passes: 0, sides: [] };
    for (var pass = 0; pass < 3; pass += 1) {
      var narrow = Math.min(main.x1 - main.x0, main.y1 - main.y0);
      if (narrow - needed < MIN_STORAGE_DEPTH) break;
      var slot = project(main, horizontal);
      var ranked = ['low', 'high'].map(function (side) {
        var neighbours = borderingRooms(boxes, corridor, horizontal, side);
        return { side: side, covered: neighbours.reduce(function (sum, n) { return sum + (n.a1 - n.a0); }, 0) };
      }).sort(function (x, y) { return y.covered - x.covered; });

      var done = null;
      for (var i = 0; i < ranked.length && !done; i += 1) {
        done = carveSide(boxes, corridor, horizontal, ranked[i].side, needed);
        if (done) total.sides.push(ranked[i].side);
      }
      if (!done) break;
      total.storages += done.storages;
      total.reserves += done.reserves;
      total.passes += 1;
    }
    return total.passes ? total : null;
  }

  // --- Décrochements entre pièces voisines --------------------------------
  // La découpe en guillotine ne produit que des rectangles. Un échange de
  // coin entre deux pièces mitoyennes transforme les deux en L : la première
  // cède un bloc d'angle, la seconde le reçoit. La surface est conservée,
  // comme pour la cession du couloir, et les bornes du rangement s'appliquent
  // au décrochement — un décrochement trop fin ou trop profond n'est pas une
  // forme, c'est un défaut.

  /* Largeur minimale d'une pièce lors d'une cession de bande. Le solveur donne
     le plus petit côté qui reçoit encore le mobilier dans un rectangle vide ;
     le programme porte le plancher qui laisse aussi la pièce mériter son nom.
     Le façonnage intervient avant murs et portes : descendre sous ce second
     plancher produit une pièce qui passe le cache puis échoue dès que son accès
     est posé — cas mesuré par test-composition-model sur bath_1. On retient
     donc le plus exigeant des deux. */
  var fitSideCache = {};
  function minSideOf(box) {
    var type = box.type;
    if (fitSideCache[type] === undefined) {
      var fit = root.TechnoHabFit;
      var value = fit && fit.narrowest ? fit.narrowest(type) : null;
      fitSideCache[type] = value !== null ? value : MIN_CIRCULATION_WIDTH;
    }
    return Math.max(fitSideCache[type], box.minSide || 0);
  }

  // Le rectangle utile peut-il recevoir ce que la pièce doit contenir ?
  function roomFits(type, width, height, variant) {
    var fit = root.TechnoHabFit;
    return fit && fit.fits ? fit.fits(type, width, height, variant) : true;
  }

  var usageValidationCache = {};

  function roomVariant(room) {
    if (room.variant) return room.variant;
    if (room.type === 'bedroom') return room.variant || (room.id === 'bedroom_1' ? 'parentale' : 'enfant');
    return null;
  }

  /* M4c est volontairement borné aux profils C4 déjà consolidés. Les
     autres pièces continuent de consommer leur programme minimal compilé :
     déclarer un optionnel dans le socle ne suffit jamais à l'activer dans un
     profil encore C0-C3. */
  var M4C_RESOLVED_TYPES = { living: true, bedroom: true, bureau: true };

  function resolvedArea(room) {
    return Number.isFinite(room.area) ? room.area
      : Number.isFinite(room.targetArea) ? room.targetArea
      : Number.isFinite(room.minArea) ? room.minArea : null;
  }

  function programForType(type, variant, room, resolution) {
    var fit = root.TechnoHabFit;
    var enhanced = M4C_RESOLVED_TYPES[type] && fit.resolveProgram;
    if (!enhanced) return fit.programOf(type, variant);
    return fit.resolveProgram(type, variant, {
      area: resolvedArea(room),
      upgradeSizes: !resolution || resolution.upgradeSizes !== false,
      includeOptional: !resolution || resolution.includeOptional !== false
    });
  }

  function compiledRoomProgram(room, resolution) {
    var fit = root.TechnoHabFit;
    if (!fit || !fit.programOf) return { equipments: [], relations: [], facingClearance: null, accessClearance: null, maxFurnitureRatio: null };
    var programs = [{ type: room.type, value: programForType(room.type, roomVariant(room), room, resolution) }];
    (room.composedWith || []).forEach(function (type) {
      programs.push({ type: type, value: programForType(type, type === 'bedroom' ? 'enfant' : null, room, resolution) });
    });
    var equipments = [], relations = [], ids = {};
    programs.forEach(function (entry) {
      (entry.value.equipments || []).forEach(function (equipment) {
        if (!ids[equipment.id]) { ids[equipment.id] = true; equipments.push(equipment); }
      });
    });
    programs.forEach(function (entry) {
      (entry.value.relations || []).forEach(function (relation) {
        var references = [relation.subject, relation.target].concat(relation.targets || []).filter(Boolean);
        if (references.every(function (id) { return ids[id]; })) relations.push(relation);
      });
    });
    return {
      equipments: equipments,
      relations: relations,
      programs: programs.map(function (entry) { return entry.type; }),
      resolution: {
        method: equipments.some(function (equipment) { return M4C_RESOLVED_TYPES[equipment.program]; })
          ? 'm4c-canonical-v1' : 'minimum-v1',
        area: resolvedArea(room),
        upgradeSizes: !resolution || resolution.upgradeSizes !== false,
        includeOptional: !resolution || resolution.includeOptional !== false
      },
      facingClearance: programs.reduce(function (maximum, entry) {
        return Math.max(maximum, entry.value.facingClearance || 0);
      }, 0) || null,
      accessClearance: programs.reduce(function (maximum, entry) {
        return Math.max(maximum, entry.value.accessClearance || 0);
      }, 0) || null,
      // Une limite d'occupation porte sur la zone fonctionnelle. Dans une
      // composition ouverte, l'absence de zones interdit de l'appliquer à la
      // boîte séjour+cuisine comme si elle était un séjour autonome.
      maxFurnitureRatio: programs.length === 1 ? programs[0].value.maxFurnitureRatio : null
    };
  }

  function programSignature(program) {
    return program.equipments.map(function (equipment) {
      return [equipment.program, equipment.id, equipment.size || equipment.id].join(':');
    }).join('|');
  }

  /* Replis M4c, du moins destructeur au plus : gamme plancher, puis retrait
     des optionnels. Les doublons sont supprimés pour les pièces sans gamme. */
  function compiledRoomPrograms(room) {
    var candidates = [
      compiledRoomProgram(room, { upgradeSizes: true, includeOptional: true }),
      compiledRoomProgram(room, { upgradeSizes: false, includeOptional: true }),
      compiledRoomProgram(room, { upgradeSizes: false, includeOptional: false })
    ];
    var signatures = {};
    return candidates.filter(function (program) {
      var signature = programSignature(program);
      if (signatures[signature]) return false;
      signatures[signature] = true;
      return true;
    });
  }

  function validateResolvedPrograms(room, rectangle, options) {
    options = options || {};
    var placement = root.TechnoHabPlacement;
    var programs = compiledRoomPrograms(room);
    var requested = programs[0] || compiledRoomProgram(room);
    var last = { result: { fits: false, placements: [] }, program: requested };
    for (var index = 0; index < programs.length; index += 1) {
      var program = programs[index];
      var enhancedAttempt = options.boundedEnhanced && index < programs.length - 1;
      var validation = placement.validate(program.equipments, rectangle, {
        relations: program.relations,
        context: options.context || null,
        facingClearance: program.facingClearance,
        s4: options.s4,
        fast: options.fast || enhancedAttempt,
        candidateLimit: enhancedAttempt ? 12 : undefined,
        maxNodes: enhancedAttempt ? 400 : undefined
      });
      var result = validation;
      /* Une recherche rapide peut rater une pose pourtant réalisable. Avant
         le dernier repli, qui retire tous les optionnels, confirmer donc
         l'échec sur le même programme avec la recherche complète. Cette règle
         est générique : un bureau de chambre, un fauteuil ou tout futur
         optionnel ne disparaît plus sur le seul verdict du budget rapide. */
      var nextProgram = programs[index + 1];
      var removesOptionalsNext = nextProgram && program.resolution.includeOptional &&
        !nextProgram.resolution.includeOptional;
      if (!result.fits && enhancedAttempt && removesOptionalsNext) {
        validation = placement.validate(program.equipments, rectangle, {
          relations: program.relations,
          context: options.context || null,
          facingClearance: program.facingClearance,
          s4: options.s4
        });
        result = validation;
        enhancedAttempt = false;
      }
      if (!validation.fits && options.optimizeS4 && !enhancedAttempt && validation.reason &&
          validation.reason.code === 'S4_CANNOT_BE_SATISFIED') {
        result = placement.optimize(program.equipments, rectangle, {
          relations: program.relations,
          context: options.context || null,
          facingClearance: program.facingClearance,
          s4: options.s4,
          validation: validation,
          seed: options.seed,
          attempts: options.attempts || 8
        });
      }
      last = { result: result, program: program };
      if (result.fits) {
        return {
          result: result,
          program: program,
          requestedProgram: requested,
          attempts: index + 1,
          fallback: {
            sizeDowngraded: requested.resolution.upgradeSizes && !program.resolution.upgradeSizes,
            optionalRemoved: requested.resolution.includeOptional && !program.resolution.includeOptional
          }
        };
      }
    }
    return {
      result: last.result,
      program: last.program,
      requestedProgram: requested,
      attempts: programs.length,
      fallback: { sizeDowngraded: false, optionalRemoved: false }
    };
  }

  /* O2 — après le filtre de Pareto, le solveur commun confirme le programme
     et rend une qualité graduée. La clé centimétrique évite de repayer une
     géométrie identique pendant les corrections de surface. */
  function usageCost(room, width, height, context, exhaustiveFallback) {
    var placement = root.TechnoHabPlacement;
    if (!placement || !placement.validate) return roomFits(room.type, width, height, roomVariant(room)) ? 0 : 95;
    /* O2 reste un préclassement rapide sur le plancher. Le programme M4c
       complet porte le verdict du BuiltPlan quelques étapes plus tard ; le
       résoudre pour chaque boîte candidate paierait optionnels et replis des
       centaines de fois sans renforcer cette autorité finale. */
    var program = compiledRoomProgram(room, { upgradeSizes: false, includeOptional: false });
    if (!program.equipments.length) return 0;
    var contextKey = context && context.blocked ? JSON.stringify(context.blocked) : '';
    var ratio = Math.min(width, height) / Math.max(width, height);
    var key = [room.type, roomVariant(room) || 'base', (room.composedWith || []).join('+'),
      // Les corrections de surface conservent la disposition : le classement
      // agrège donc sa qualité par classe de proportion. Le verdict final,
      // lui, reste recalculé aux dimensions exactes avec les portes.
      Math.round(ratio * 4), exhaustiveFallback ? 'exact' : 'fast', contextKey].join(':');
    if (usageValidationCache[key] !== undefined) return usageValidationCache[key];
    var validation = placement.validate(program.equipments, { w: width, h: height }, {
      relations: program.relations, context: context || null,
      facingClearance: program.facingClearance, fast: !context
    });
    if (!validation.fits && exhaustiveFallback && !context) {
      validation = placement.validate(program.equipments, { w: width, h: height }, {
        relations: program.relations,
        facingClearance: program.facingClearance
      });
    }
    if (!validation.fits) return (usageValidationCache[key] = 95);
    var quality = placement.assess(validation.placements, { w: width, h: height },
      program.relations, context || null).score;
    return (usageValidationCache[key] = (100 - quality) * 0.45);
  }

  function rankCandidatesWithUsage(candidates, limit) {
    var maximum = Math.max(1, limit || 2);
    var ordered = candidates.slice().sort(function (a, b) { return a.score - b.score; });
    /* Les témoins antérieurs à M5 conservent leur sélection purement
       ordonnée : l'ablation doit enlever le levier entier, pas seulement
       mettre son poids final à zéro. */
    if (root.TechnoHabAblations &&
        (root.TechnoHabAblations.disableM5BranchUtility || root.TechnoHabAblations.disableM5Search)) {
      ordered = ordered.slice(0, maximum);
      ordered.forEach(function (candidate) {
        var before = candidate.score;
        candidate.boxes.forEach(function (room) {
          candidate.score += usageCost(room,
            Math.abs(room.x1 - room.x0), Math.abs(room.y1 - room.y0), null,
            ordered.length === 1);
        });
        candidate.usageCost = round(candidate.score - before, 2);
        candidate.usageCandidatesCompared = ordered.length;
        candidate.scoreBreakdown = Object.assign({}, candidate.scoreBreakdown || {}, {
          usage: candidate.usageCost
        });
      });
      return ordered.sort(function (a, b) { return a.score - b.score; });
    }
    var selected = [];
    var families = {};
    /* M5.0 : l'évaluation d'usage coûte cher, mais ne doit pas être réservée
       aux trois stratégies T arrivées en tête du pré-score. On garde d'abord
       le meilleur représentant de chaque famille, puis on complète au score. */
    ordered.forEach(function (candidate) {
      var family = candidate.topologyFamily;
      if (!family || selected.length >= maximum || families[family]) return;
      families[family] = true;
      selected.push(candidate);
    });
    ordered.forEach(function (candidate) {
      if (selected.length < maximum && selected.indexOf(candidate) < 0) selected.push(candidate);
    });
    selected.forEach(function (candidate) {
      var before = candidate.score;
      candidate.boxes.forEach(function (room) {
        candidate.score += usageCost(room,
          Math.abs(room.x1 - room.x0), Math.abs(room.y1 - room.y0), null,
          selected.length === 1);
      });
      candidate.usageCost = round(candidate.score - before, 2);
      candidate.usageCandidatesCompared = selected.length;
      candidate.scoreBreakdown = Object.assign({}, candidate.scoreBreakdown || {}, {
        usage: candidate.usageCost
      });
    });
    return selected.sort(function (a, b) { return a.score - b.score; });
  }

  function roomAreaOf(box) { return partsArea(box.parts); }

  // Tente un échange de coin entre deux pièces mitoyennes : la première cède
  // un bloc d'angle, la seconde le reçoit, et les deux passent à six arêtes.
  //
  // Le bloc doit être calé sur un angle **commun** aux deux pièces. Calé sur
  // le seul angle du donneur, il creuserait le receveur en son milieu et y
  // produirait une forme à huit arêtes — hors du cadre retenu ici.
  function swapCorner(giver, taker, random) {
    if (giver.parts.length !== 1 || taker.parts.length !== 1) return false;
    if (giver.type === 'circulation' || taker.type === 'circulation') return false;
    var g = giver.parts[0];
    var t = taker.parts[0];

    var giverAbove = Math.abs(g.y1 - t.y0) < CONTACT;
    var giverBelow = Math.abs(t.y1 - g.y0) < CONTACT;
    var giverLeft = Math.abs(g.x1 - t.x0) < CONTACT;
    var giverRight = Math.abs(t.x1 - g.x0) < CONTACT;
    var horizontal = giverAbove || giverBelow;
    if (!horizontal && !giverLeft && !giverRight) return false;

    // Angles alignés entre les deux pièces, le long du mur mitoyen.
    var lowAligned = horizontal ? Math.abs(g.x0 - t.x0) < CONTACT : Math.abs(g.y0 - t.y0) < CONTACT;
    var highAligned = horizontal ? Math.abs(g.x1 - t.x1) < CONTACT : Math.abs(g.y1 - t.y1) < CONTACT;
    if (!lowAligned && !highAligned) return false;
    var atLow = lowAligned && (!highAligned || random() < 0.5);

    var wallStart = horizontal ? Math.max(g.x0, t.x0) : Math.max(g.y0, t.y0);
    var wallEnd = horizontal ? Math.min(g.x1, t.x1) : Math.min(g.y1, t.y1);
    var span = wallEnd - wallStart;
    var giverDepth = horizontal ? (g.y1 - g.y0) : (g.x1 - g.x0);
    var takerDepth = horizontal ? (t.y1 - t.y0) : (t.x1 - t.x0);
    if (span <= 0 || takerDepth < minSideOf(taker)) return false;

    // Bornes du rangement, et le donneur doit rester utilisable.
    var maxDepth = Math.min(MAX_STORAGE_DEPTH_RATIO * span, giverDepth - minSideOf(giver), giverDepth * 0.34);
    if (maxDepth < MIN_STORAGE_DEPTH) return false;
    var depth = MIN_STORAGE_DEPTH + random() * (maxDepth - MIN_STORAGE_DEPTH);

    // Le bloc cédé doit tenir les bornes, mais le reliquat laissé au donneur
    // aussi : c'est lui aussi un décrochement, et un reliquat trop court
    // produirait une lame inexploitable.
    var giverExtent = horizontal ? (g.x1 - g.x0) : (g.y1 - g.y0);
    var minNotch = depth / MAX_STORAGE_DEPTH_RATIO;
    var maxLength = Math.min(span * 0.85, giverExtent - minNotch);
    var minLength = Math.max(minNotch, span * 0.25);
    if (minLength > maxLength) return false;
    var length = minLength + random() * (maxLength - minLength);
    if (roomAreaOf(giver) - depth * length < giver.minArea) return false;

    // Le bloc court depuis l'angle commun, sur le bord du donneur qui touche
    // le receveur.
    var b0 = atLow ? wallStart : wallEnd - length;
    var b1 = atLow ? wallStart + length : wallEnd;
    var block, kept;
    if (horizontal) {
      var yLo = giverAbove ? g.y1 - depth : g.y0;
      var yHi = giverAbove ? g.y1 : g.y0 + depth;
      block = { x0: b0, x1: b1, y0: yLo, y1: yHi };
      kept = [
        { role: 'main', x0: g.x0, y0: giverAbove ? g.y0 : yHi, x1: g.x1, y1: giverAbove ? yLo : g.y1 },
        { role: 'notch', x0: atLow ? b1 : g.x0, y0: yLo, x1: atLow ? g.x1 : b0, y1: yHi }
      ];
    } else {
      var xLo = giverLeft ? g.x1 - depth : g.x0;
      var xHi = giverLeft ? g.x1 : g.x0 + depth;
      block = { y0: b0, y1: b1, x0: xLo, x1: xHi };
      kept = [
        { role: 'main', x0: giverLeft ? g.x0 : xHi, y0: g.y0, x1: giverLeft ? xLo : g.x1, y1: g.y1 },
        { role: 'notch', x0: xLo, y0: atLow ? b1 : g.y0, x1: xHi, y1: atLow ? g.y1 : b0 }
      ];
    }

    kept = kept.filter(function (r) { return (r.x1 - r.x0) > 0.05 && (r.y1 - r.y0) > 0.05; });
    if (kept.length !== 2) return false;
    // La partie principale doit rester une pièce, pas un couloir.
    if (Math.min(kept[0].x1 - kept[0].x0, kept[0].y1 - kept[0].y0) < minSideOf(giver)) return false;
    /* Le donneur doit rester MEUBLABLE, pas seulement assez large. Ce contrôle
       n'existait pas : `roomFits()` n'était consulté que par `scoreCandidate()`,
       qui pénalisait un candidat et laissait la recherche en trouver un autre.
       La typologie ne cherche plus — elle pose une seule fois — et plus rien ne
       filtrait alors les décrochements nuisibles : 57 pièces non meublables
       sont réapparues dès que le façonnage a été rendu.
       Un décrochement est un agrément ; il ne se paie pas en habitabilité. */
    if (!roomFits(giver.type, kept[0].x1 - kept[0].x0, kept[0].y1 - kept[0].y0,
      roomVariant(giver))) return false;
    // Garde-fou : la découpe doit conserver exactement la surface.
    if (Math.abs(partsArea(kept) + (block.x1 - block.x0) * (block.y1 - block.y0) - partsArea([g])) > 0.01) return false;

    giver.parts = kept;
    taker.parts.push({ role: 'notch', x0: block.x0, y0: block.y0, x1: block.x1, y1: block.y1 });
    return true;
  }

  function shapeRooms(boxes, edges, random, maxSwaps) {
    var applied = 0;
    var pairs = shuffled(edges.slice(), random);
    for (var i = 0; i < pairs.length && applied < maxSwaps; i += 1) {
      var a = boxes.find(function (b) { return b.id === pairs[i].a; });
      var b = boxes.find(function (x) { return x.id === pairs[i].b; });
      if (!a || !b) continue;
      // On fait céder la plus grande des deux : elle supporte le retrait.
      var giver = roomAreaOf(a) >= roomAreaOf(b) ? a : b;
      var taker = giver === a ? b : a;
      // O1 — un décrochement est un supplément de surface. Une pièce dont
      // l'agrément est nul a déjà été servie par son enveloppe fonctionnelle :
      // elle ne redevient pas variable d'ajustement après l'allocation.
      if (!(taker.agrement > 0) || taker.maxArea !== null) continue;
      if (taker.parts.length > 1) continue;
      if (swapCorner(giver, taker, random)) applied += 1;
    }
    return applied;
  }

  /* O1 — une poche partage sa profondeur entre toutes ses pièces. Quand le
     côté minimal d'une pièce plafonnée domine, cette profondeur peut lui
     attribuer un rectangle plus grand que son enveloppe malgré une aire cible
     correcte. Le surplus reste dans le logement : il devient un décrochement
     d'une pièce latérale à agrément positif.

     Le segment conservé reste du côté de la desserte demandée lorsqu'elle se
     trouve à une extrémité. Cette opération précède les autres façonnages ; la
     pièce plafonnée ne peut ensuite recevoir ni bande ni décrochement. */
  function transfererSurplusPlafonne(boxes, desiredEdges) {
    var transfers = 0;
    boxes.forEach(function (room) {
      if (room.agrement !== 0 || !Number.isFinite(room.maxArea) || room.parts.length !== 1) return;
      var rect = room.parts[0];
      var width = rect.x1 - rect.x0;
      var height = rect.y1 - rect.y0;
      if (width * height <= room.maxArea + 0.005) return;
      var vertical = height >= width;
      var short = vertical ? width : height;
      var keptLength = room.maxArea / short;
      var long = vertical ? height : width;
      if (keptLength >= long - 0.005 || keptLength < room.minSide) return;

      var accessIds = desiredEdges.filter(function (edge) {
        return edge.a === room.id || edge.b === room.id;
      }).map(function (edge) { return edge.a === room.id ? edge.b : edge.a; });

      function touchesEnd(candidate, atStart) {
        return candidate.parts.some(function (part) {
          if (vertical) {
            var axis = atStart ? rect.y0 : rect.y1;
            return (Math.abs(part.y1 - axis) < CONTACT || Math.abs(part.y0 - axis) < CONTACT) &&
              Math.min(part.x1, rect.x1) - Math.max(part.x0, rect.x0) > MIN_OVERLAP;
          }
          var axis = atStart ? rect.x0 : rect.x1;
          return (Math.abs(part.x1 - axis) < CONTACT || Math.abs(part.x0 - axis) < CONTACT) &&
            Math.min(part.y1, rect.y1) - Math.max(part.y0, rect.y0) > MIN_OVERLAP;
        });
      }

      var accessAtStart = boxes.some(function (candidate) {
        return accessIds.indexOf(candidate.id) !== -1 && touchesEnd(candidate, true);
      });
      var accessAtEnd = boxes.some(function (candidate) {
        return accessIds.indexOf(candidate.id) !== -1 && touchesEnd(candidate, false);
      });
      var keepStartFirst = accessAtStart || !accessAtEnd;

      function option(keepStart) {
        var block = vertical
          ? { role: 'reserve', x0: rect.x0, x1: rect.x1,
              y0: keepStart ? rect.y0 + keptLength : rect.y0,
              y1: keepStart ? rect.y1 : rect.y1 - keptLength }
          : { role: 'reserve', y0: rect.y0, y1: rect.y1,
              x0: keepStart ? rect.x0 + keptLength : rect.x0,
              x1: keepStart ? rect.x1 : rect.x1 - keptLength };
        var candidates = boxes.filter(function (candidate) {
          if (candidate === room || !(candidate.agrement > 0) || candidate.maxArea !== null) return false;
          return candidate.parts.some(function (part) {
            if (vertical) {
              var side = Math.abs(part.x1 - rect.x0) < CONTACT || Math.abs(part.x0 - rect.x1) < CONTACT;
              return side && part.y0 <= block.y0 + CONTACT && part.y1 >= block.y1 - CONTACT;
            }
            var side = Math.abs(part.y1 - rect.y0) < CONTACT || Math.abs(part.y0 - rect.y1) < CONTACT;
            return side && part.x0 <= block.x0 + CONTACT && part.x1 >= block.x1 - CONTACT;
          });
        }).sort(function (a, b) { return b.weight - a.weight; });
        return candidates.length ? { keepStart: keepStart, block: block, receiver: candidates[0] } : null;
      }

      var chosen = option(keepStartFirst) || option(!keepStartFirst);
      if (!chosen) return;
      if (vertical) {
        if (chosen.keepStart) rect.y1 = rect.y0 + keptLength;
        else rect.y0 = rect.y1 - keptLength;
      } else {
        if (chosen.keepStart) rect.x1 = rect.x0 + keptLength;
        else rect.x0 = rect.x1 - keptLength;
      }
      chosen.receiver.parts.push(chosen.block);
      transfers += 1;
    });
    return transfers;
  }

  /* --- Façades et extérieur ------------------------------------------------
     Trois documents butaient sur le même manque : sans bord extérieur, ni le
     contact façade, ni la règle d'entrée, ni le gradient d'intimité ne sont
     calculables. C'est peu de code pour ce qu'il débloque.

     Convention d'orientation : le plan affiche le nord en haut, donc y = 0
     est au nord et y = H au sud. Ce n'est pas une orientation réelle — le
     questionnaire ne décrit pas le terrain — mais un repère cohérent avec le
     dessin, et le seul qu'on puisse tenir honnêtement aujourd'hui. */
  /* La façade n'est plus le bord d'un rectangle : avec les formes en L et en
     U, l'encoche est extérieure elle aussi. Un segment de mur est en façade
     lorsque, juste au-delà, il n'y a aucun volume de l'enveloppe. Le test
     porte sur des sous-segments découpés aux abscisses et ordonnées des
     volumes, pour qu'un mur partiellement mitoyen ne compte que pour sa part
     libre.

     Accepte aussi bien les pièces découpées en parties que les rectangles
     bruts de la boucle de recherche : la façade doit se mesurer avant la
     sélection du candidat, pas seulement sur le gagnant (D1). */
  function dansLEnveloppe(volumes, x, y) {
    return volumes.some(function (v) {
      return x > v.x + CONTACT && x < v.x + v.width - CONTACT &&
        y > v.y + CONTACT && y < v.y + v.height - CONTACT;
    });
  }

  function coupures(a0, a1, valeurs) {
    var points = [a0, a1];
    valeurs.forEach(function (valeur) {
      if (valeur > a0 + CONTACT && valeur < a1 - CONTACT) points.push(valeur);
    });
    points.sort(function (x, y) { return x - y; });
    var segments = [];
    for (var i = 1; i < points.length; i += 1) {
      if (points[i] - points[i - 1] > MIN_OVERLAP) segments.push([points[i - 1], points[i]]);
    }
    return segments;
  }

  function facadeSegments(boxes, enveloppe) {
    var volumes = enveloppe && enveloppe.volumes
      ? enveloppe.volumes
      : [{ x: 0, y: 0, width: enveloppe.width, height: enveloppe.height }];
    var absc = [], ordo = [];
    volumes.forEach(function (v) {
      absc.push(v.x, v.x + v.width);
      ordo.push(v.y, v.y + v.height);
    });
    var segments = [];
    boxes.forEach(function (box) {
      (box.parts && box.parts.length ? box.parts : [box]).forEach(function (part) {
        [
          { cote: 'nord', axe: 'h', ligne: part.y0, a0: part.x0, a1: part.x1, dehors: -1 },
          { cote: 'sud', axe: 'h', ligne: part.y1, a0: part.x0, a1: part.x1, dehors: 1 },
          { cote: 'ouest', axe: 'v', ligne: part.x0, a0: part.y0, a1: part.y1, dehors: -1 },
          { cote: 'est', axe: 'v', ligne: part.x1, a0: part.y0, a1: part.y1, dehors: 1 }
        ].forEach(function (cote) {
          var horizontal = cote.axe === 'h';
          coupures(cote.a0, cote.a1, horizontal ? absc : ordo).forEach(function (segment) {
            var milieu = (segment[0] + segment[1]) / 2;
            var dehors = cote.ligne + cote.dehors * 2 * CONTACT;
            var x = horizontal ? milieu : dehors;
            var y = horizontal ? dehors : milieu;
            if (dansLEnveloppe(volumes, x, y)) return;
            segments.push({
              room: box.id, cote: cote.cote, longueur: round(segment[1] - segment[0], 2),
              x0: round(horizontal ? segment[0] : cote.ligne),
              y0: round(horizontal ? cote.ligne : segment[0]),
              x1: round(horizontal ? segment[1] : cote.ligne),
              y1: round(horizontal ? cote.ligne : segment[1])
            });
          });
        });
      });
    });
    return segments;
  }

  /* L'extérieur devient un nœud du graphe, au même titre qu'une pièce. Une
     arête pièce ↔ extérieur existe dès que la pièce a de la façade, et porte
     la longueur cumulée — de quoi dire plus tard si une porte d'entrée ou une
     baie y tient, sans rien ajouter au modèle. */
  function edgesToExterior(segments) {
    var parPiece = {};
    segments.forEach(function (segment) {
      parPiece[segment.room] = (parPiece[segment.room] || 0) + segment.longueur;
    });
    return Object.keys(parPiece).map(function (room, index) {
      return {
        id: 'facade_' + (index + 1), a: room, b: 'exterior',
        kind: 'facade', contact: round(parPiece[room], 2)
      };
    });
  }

  /* --- Portes et parcours ---------------------------------------------------
     Une adjacence dit que deux pièces se touchent ; une porte dit par où l'on
     passe. Sans elle, le cheminement ne peut pas exister : un plan sans porte
     est une mosaïque, pas un logement.

     Les cotes viennent du socle : 0,80 m de vantail pour une porte
     intérieure (VAL-PMR-007), 0,90 m pour l'entrée (VAL-PMR-005). */
  var PORTE_INTERIEURE = 0.83;
  var VANTAIL_INTERIEUR = 0.80;
  var PORTE_ENTREE = valeurCanonique('VAL-ENTRY-DOOR-BAY-WIDTH-001', 0.90);
  var VANTAIL_ENTREE = valeurCanonique('VAL-ENTRY-DOOR-LEAF-WIDTH-001', 0.83);
  var PASSAGE_ENTREE = valeurCanonique('VAL-ENTRY-CLEAR-WIDTH-001', 0.83);
  var ENTREE_ARRIVAL_WIDTH = valeurCanonique('VAL-ENTRY-ARRIVAL-WIDTH-MIN-001', 1.20);
  var ENTREE_ARRIVAL_DEPTH = valeurCanonique('VAL-ENTRY-ARRIVAL-DEPTH-MIN-001', 1.20);
  /* La largeur de cheminement est celle du point le plus étroit, et ce point
     est la porte : 0,77 m de passage utile pour un vantail de 0,80
     (VAL-PMR-008). Exiger les 0,90 m de la circulation partout rendrait toute
     porte infranchissable — c'est le couloir qui fait 0,90, pas ce qu'on
     traverse. */
  var PASSAGE_LIBRE = 0.77;

  /* Éligibilité à recevoir l'entrée principale, par ordre de préférence.
     Une chambre ou une pièce d'eau ne peut pas être le seuil du logement,
     quelle que soit la géométrie — voir SOCLE_AGENCEMENT.md §7. */
  var ENTREE_ORDRE = ['entree', 'circulation', 'living', 'dining', 'cellier', 'buanderie', 'kitchen'];
  var ENTREE_INTERDITE = ['bedroom', 'bath', 'wc', 'bureau', 'garage'];

  function wallConnects(wall, a, b) {
    return (wall.between[0] === a && wall.between[1] === b) ||
      (wall.between[0] === b && wall.between[1] === a);
  }

  function wallRange(wall) {
    return wall.orientation === 'vertical'
      ? { start: wall.axis.y0, end: wall.axis.y1 }
      : { start: wall.axis.x0, end: wall.axis.x1 };
  }

  function openingInterval(opening, wall) {
    var center = wall.orientation === 'vertical' ? opening.y : opening.x;
    var width = opening.bayWidth || opening.largeur;
    return { start: center - width / 2, end: center + width / 2 };
  }

  function availableSlots(wall, width, placed) {
    var clearance = root.TechnoHabConstruction.openingJunctionClearance;
    var range = wallRange(wall);
    var blocked = placed.filter(function (opening) { return opening.wallId === wall.id; })
      .map(function (opening) {
        var interval = openingInterval(opening, wall);
        return { start: interval.start - clearance, end: interval.end + clearance };
      }).sort(function (a, b) { return a.start - b.start; });
    var gaps = [];
    var cursor = range.start + clearance;
    blocked.forEach(function (interval) {
      if (interval.start > cursor) gaps.push({ start: cursor, end: interval.start });
      cursor = Math.max(cursor, interval.end);
    });
    if (cursor < range.end - clearance) gaps.push({ start: cursor, end: range.end - clearance });
    var centers = [];
    gaps.filter(function (gap) { return gap.end - gap.start >= width - 0.001; })
      .sort(function (a, b) { return (b.end - b.start) - (a.end - a.start); })
      .forEach(function (gap) {
        // Le centre minimise en moyenne les parcours depuis le seuil. Les
        // extrémités restent des replis possibles pour un futur arbitrage
        // conjoint avec le mobilier, mais ne doivent pas biaiser tous les
        // plans au seul motif de préserver du linéaire de mur.
        [(gap.start + gap.end) / 2, gap.start + width / 2,
          gap.end - width / 2].forEach(function (center) {
          if (!centers.some(function (value) { return Math.abs(value - center) < 0.005; })) centers.push(center);
        });
      });
    return centers;
  }

  function availableSlot(wall, width, placed) {
    var candidates = availableSlots(wall, width, placed);
    return candidates.length ? candidates[0] : null;
  }

  function positionOnWall(wall, center) {
    return wall.orientation === 'vertical'
      ? { x: wall.axis.x0, y: center }
      : { x: center, y: wall.axis.y0 };
  }

  function exteriorSide(wall) {
    var exteriorNegative = wall.between[0] === 'exterior';
    if (wall.orientation === 'vertical') return exteriorNegative ? 'ouest' : 'est';
    return exteriorNegative ? 'nord' : 'sud';
  }

  function chooseWall(walls, a, b, width, placed) {
    var candidates = walls.filter(function (wall) { return wallConnects(wall, a, b); })
      .sort(function (x, y) { return y.length - x.length; });
    for (var index = 0; index < candidates.length; index += 1) {
      var center = availableSlot(candidates[index], width, placed);
      if (center !== null) return { wall: candidates[index], center: center };
    }
    return null;
  }

  function rectangleInsideRoom(rectangle, room) {
    return (room.parts || [room]).some(function (part) {
      return rectangle.x0 >= part.x0 - 0.005 && rectangle.y0 >= part.y0 - 0.005 &&
        rectangle.x1 <= part.x1 + 0.005 && rectangle.y1 <= part.y1 + 0.005;
    });
  }

  function roomAcceptsSwing(room, swing, existing) {
    if (!swing || !rectangleInsideRoom(swing, room)) return false;
    var placement = root.TechnoHabPlacement;
    if (!placement || !placement.validate) return false;
    /* La porte se résout sur le programme plancher. Les optionnels M4c ne
       doivent pas être payés pour chaque orientation de battant ; le verdict
       construit les confronte ensuite à la porte réellement retenue et replie
       le confort si nécessaire. */
    var program = compiledRoomProgram(room, { upgradeSizes: false, includeOptional: false });
    if (!program.equipments.length) return true;
    var bounds = partsBounds(room.parts || [room]);
    var context = { blocked: (existing || []).concat([swing]).map(function (blocked) {
      return {
        x0: blocked.x0 - bounds.x0, y0: blocked.y0 - bounds.y0,
        x1: blocked.x1 - bounds.x0, y1: blocked.y1 - bounds.y0
      };
    }) };
    return placement.validate(program.equipments, {
      w: bounds.x1 - bounds.x0, h: bounds.y1 - bounds.y0
    }, {
      relations: program.relations, context: context,
      facingClearance: program.facingClearance
    }).fits;
  }

  function slidingFits(wall, center, width) {
    var range = wallRange(wall);
    return center - width / 2 - range.start >= width - 0.005 ||
      range.end - (center + width / 2) >= width - 0.005;
  }

  /* O3 — hiérarchie résolue, jamais déduite du type : ouvrir hors de la
     pièce desservie, y compris vers une circulation assez large, puis
     coulisser si le mur le permet, puis ouvrir dedans.
     Chaque battant est testé comme zone exclusive par le solveur de mobilier. */
  function solveDoorOpening(opening, wall, a, b, blockedByRoom) {
    var roleA = root.TechnoHabFit.roleOf(a.type);
    var roleB = root.TechnoHabFit.roleOf(b.type);
    var served = roleA === 'service' && roleB !== 'service' ? a
      : roleB === 'service' && roleA !== 'service' ? b
      : partsArea(a.parts) <= partsArea(b.parts) ? a : b;
    var outside = served === a ? b : a;
    var swing;
    opening.ouvreVers = outside.id;
    opening.kind = 'porte';
    swing = root.TechnoHabConstruction.swingFromFace(opening, wall);
    if (roomAcceptsSwing(outside, swing, blockedByRoom[outside.id])) {
      opening.openingMode = 'outward';
      opening.s3Passed = true;
      opening.equipment = { id: opening.id + '_leaf', kind: 'door-leaf', usage: [{ exclusive: true }] };
      (blockedByRoom[outside.id] || (blockedByRoom[outside.id] = [])).push(swing);
      return;
    }
    if (slidingFits(wall, wall.orientation === 'vertical' ? opening.y : opening.x, opening.bayWidth)) {
      opening.kind = 'porte-coulissante';
      opening.ouvreVers = null;
      opening.openingMode = 'sliding';
      opening.s3Passed = true;
      opening.equipment = { id: opening.id + '_leaf', kind: 'sliding-door', usage: [] };
      return;
    }
    opening.kind = 'porte';
    opening.ouvreVers = served.id;
    swing = root.TechnoHabConstruction.swingFromFace(opening, wall);
    if (roomAcceptsSwing(served, swing, blockedByRoom[served.id])) {
      opening.openingMode = 'inward';
      opening.s3Passed = true;
      opening.equipment = { id: opening.id + '_leaf', kind: 'door-leaf', usage: [{ exclusive: true }] };
      (blockedByRoom[served.id] || (blockedByRoom[served.id] = [])).push(swing);
      return;
    }
    opening.kind = 'porte-coulissante';
    opening.ouvreVers = null;
    opening.openingMode = 'sliding-fallback';
    opening.s3Passed = false;
    opening.equipment = { id: opening.id + '_leaf', kind: 'sliding-door', usage: [] };
  }

  /* Une porte par adjacence demandée et réalisée. Le mur M1 est désormais la
     source : sa segmentation porte les jonctions, ses faces portent le sens
     d'ouverture, et sa réservation porte la baie. */
  function poserPortes(boxes, requestedEdges, walls, placed) {
    var parId = {};
    boxes.forEach(function (box) { parId[box.id] = box; });
    var portes = [];
    var blockedByRoom = {};
    requestedEdges.forEach(function (demande) {
      var a = parId[demande.a], b = parId[demande.b];
      if (!a || !b) return;
      var chosen = chooseWall(walls, demande.a, demande.b, PORTE_INTERIEURE, placed);
      if (!chosen) return;
      var position = positionOnWall(chosen.wall, chosen.center);
      var opening = {
        id: 'porte_' + (portes.length + 1), entre: [demande.a, demande.b],
        kind: 'porte',
        largeur: PORTE_INTERIEURE, bayWidth: PORTE_INTERIEURE,
        leafWidth: VANTAIL_INTERIEUR, clearWidth: PASSAGE_LIBRE,
        axe: chosen.wall.orientation, x: round(position.x), y: round(position.y),
        mur: chosen.wall.length, wallId: chosen.wall.id,
        ouvreVers: null,
        debattement: null
      };
      solveDoorOpening(opening, chosen.wall, a, b, blockedByRoom);
      portes.push(opening);
      placed.push(opening);
    });
    return portes;
  }

  function centeredInterval(center, size, minimum, maximum) {
    if (maximum - minimum < size - 0.005) return null;
    var start = Math.max(minimum, Math.min(center - size / 2, maximum - size));
    return { start: start, end: start + size };
  }

  /* C-P2 — l'entrée est une fonction hébergée, pas nécessairement une pièce.
     Sa zone d'arrivée est donc réservée dans la circulation ou la pièce qui
     reçoit le seuil. Elle doit tenir avant que la façade soit retenue : une
     porte seule, coincée contre le mobilier, ne suffit pas à faire une entrée. */
  function entryArrivalZone(room, wall, center) {
    var bounds = partsBounds(room.parts || [room]);
    var side = exteriorSide(wall);
    var interval, zone;
    if (wall.orientation === 'vertical') {
      interval = centeredInterval(center, ENTREE_ARRIVAL_WIDTH, bounds.y0, bounds.y1);
      if (!interval) return null;
      zone = side === 'ouest'
        ? { x0: bounds.x0, y0: interval.start, x1: bounds.x0 + ENTREE_ARRIVAL_DEPTH, y1: interval.end }
        : { x0: bounds.x1 - ENTREE_ARRIVAL_DEPTH, y0: interval.start, x1: bounds.x1, y1: interval.end };
    } else {
      interval = centeredInterval(center, ENTREE_ARRIVAL_WIDTH, bounds.x0, bounds.x1);
      if (!interval) return null;
      zone = side === 'nord'
        ? { x0: interval.start, y0: bounds.y0, x1: interval.end, y1: bounds.y0 + ENTREE_ARRIVAL_DEPTH }
        : { x0: interval.start, y0: bounds.y1 - ENTREE_ARRIVAL_DEPTH, x1: interval.end, y1: bounds.y1 };
    }
    return rectangleInsideRoom(zone, room) ? zone : null;
  }

  /* L'entrée principale suit la chaîne de repli : la circulation la prend si
     elle donne sur la façade, sinon la première pièce éligible. Une pièce
     interdite ne la reçoit jamais, même si c'est la seule en façade — le plan
     est alors déclaré sans entrée, ce qui est le verdict juste. */
  function poserEntree(boxes, walls, placed) {
    var parId = {};
    boxes.forEach(function (box) { parId[box.id] = box; });
    var candidates = walls.filter(function (wall) {
      if (wall.kind !== 'exterior') return false;
      var roomId = wall.between[0] === 'exterior' ? wall.between[1] : wall.between[0];
      var box = parId[roomId];
      return box && ENTREE_INTERDITE.indexOf(box.type) < 0;
    });
    if (!candidates.length) return null;
    candidates.sort(function (x, y) {
      var xRoom = x.between[0] === 'exterior' ? x.between[1] : x.between[0];
      var yRoom = y.between[0] === 'exterior' ? y.between[1] : y.between[0];
      var rx = ENTREE_ORDRE.indexOf(parId[xRoom].type);
      var ry = ENTREE_ORDRE.indexOf(parId[yRoom].type);
      if (rx !== ry) return (rx < 0 ? 99 : rx) - (ry < 0 ? 99 : ry);
      return y.length - x.length;
    });
    for (var index = 0; index < candidates.length; index += 1) {
      var chosen = candidates[index];
      var roomId = chosen.between[0] === 'exterior' ? chosen.between[1] : chosen.between[0];
      var centers = availableSlots(chosen, PORTE_ENTREE, placed);
      var center = null, arrivalZone = null;
      for (var slot = 0; slot < centers.length; slot += 1) {
        arrivalZone = entryArrivalZone(parId[roomId], chosen, centers[slot]);
        if (arrivalZone) { center = centers[slot]; break; }
      }
      if (center === null) continue;
      var position = positionOnWall(chosen, center);
      var opening = {
        id: 'entree', entre: [roomId, 'exterior'], kind: 'entree',
        largeur: PORTE_ENTREE, bayWidth: PORTE_ENTREE,
        leafWidth: VANTAIL_ENTREE, clearWidth: PASSAGE_ENTREE,
        cote: exteriorSide(chosen), axe: chosen.orientation,
        x: round(position.x), y: round(position.y),
        mur: chosen.length, wallId: chosen.id, ouvreVers: 'exterior',
        openingMode: 'outward',
        s3Passed: true,
        arrivalZone: arrivalZone,
        canonicalValues: {
          bayWidth: 'VAL-ENTRY-DOOR-BAY-WIDTH-001',
          leafWidth: 'VAL-ENTRY-DOOR-LEAF-WIDTH-001',
          clearWidth: 'VAL-ENTRY-CLEAR-WIDTH-001',
          arrivalWidth: 'VAL-ENTRY-ARRIVAL-WIDTH-MIN-001',
          arrivalDepth: 'VAL-ENTRY-ARRIVAL-DEPTH-MIN-001'
        },
        equipment: { id: 'entree_leaf', kind: 'door-leaf', usage: [{ exclusive: true }] },
        deconseille: parId[roomId].type === 'kitchen'
      };
      placed.push(opening);
      return opening;
    }
    return null;
  }

  function poserFenetres(boxes, walls, placed) {
    var habitables = ['living', 'bedroom', 'kitchen', 'dining', 'bureau'];
    var parId = {};
    boxes.forEach(function (box) { parId[box.id] = box; });
    var exteriorByRoom = {};
    walls.forEach(function (wall) {
      if (wall.kind !== 'exterior') return;
      var roomId = wall.between[0] === 'exterior' ? wall.between[1] : wall.between[0];
      var room = parId[roomId];
      if (!room || habitables.indexOf(room.type) === -1) return;
      if (!exteriorByRoom[roomId]) exteriorByRoom[roomId] = [];
      exteriorByRoom[roomId].push(wall);
    });
    var windows = [];
    Object.keys(exteriorByRoom).sort().forEach(function (roomId) {
      var candidates = exteriorByRoom[roomId].sort(function (a, b) { return b.length - a.length; });
      for (var index = 0; index < candidates.length; index += 1) {
        var wall = candidates[index];
        var width = round(Math.min(1.8, Math.max(0.8, wall.length * 0.45)), 2);
        var center = availableSlot(wall, width, placed);
        if (center === null && width > 0.8) {
          width = 0.8;
          center = availableSlot(wall, width, placed);
        }
        if (center === null) continue;
        var position = positionOnWall(wall, center);
        var opening = {
          id: 'fenetre_' + (windows.length + 1), room: roomId,
          entre: [roomId, 'exterior'], kind: 'fenetre', cote: exteriorSide(wall),
          largeur: width, bayWidth: width, clearWidth: null,
          axe: wall.orientation, x: round(position.x), y: round(position.y),
          mur: wall.length, wallId: wall.id, ouvreVers: null
        };
        windows.push(opening);
        placed.push(opening);
        break;
      }
    });
    return windows;
  }

  function pointInRing(point, ring) {
    var inside = false;
    for (var index = 0, previous = ring.length - 1; index < ring.length; previous = index, index += 1) {
      var a = ring[index], b = ring[previous];
      var crosses = (a.y > point.y) !== (b.y > point.y) &&
        point.x < (b.x - a.x) * (point.y - a.y) / (b.y - a.y) + a.x;
      if (crosses) inside = !inside;
    }
    return inside;
  }

  function pointInUsableRoom(room, x, y) {
    if (!room.usablePolygon || !room.usablePolygon.length) {
      return room.parts.some(function (part) {
        return x >= part.x0 && x <= part.x1 && y >= part.y0 && y <= part.y1;
      });
    }
    return room.usablePolygon.reduce(function (inside, ring) {
      return pointInRing({ x: x, y: y }, ring) ? !inside : inside;
    }, false);
  }

  /* Le cheminement. Un chemin est une ligne, et une ligne passe partout : ce
     qu'il faut prouver, c'est qu'un corps passe. On maille la surface, on
     retire ce qui bloque, puis on érode de la moitié de la largeur exigée —
     s'il reste un chemin, le passage existe à pleine largeur.

     Ne tient pas encore compte du mobilier : le générateur ne connaît pas les
     poses, calculées à l'affichage. C'est la prochaine étape, et elle rendra
     le verdict réellement probant. */
  function cheminement(boxes, portes, entree, width, height, obstacles, walls, reservations) {
    if (!entree) return null;
    var PAS = 0.1;
    var nx = Math.ceil(width / PAS), ny = Math.ceil(height / PAS);
    var piece = new Int16Array(nx * ny).fill(-1);

    /* Chaque cellule reçoit l'indice de sa surface utile. Le vide laissé entre
       deux surfaces est le volume du mur : il reste infranchissable, sauf là
       où M3 a créé une réservation. Le repli sur les parties conserve la
       lecture des anciens plans dépourvus de géométrie utile. */
    boxes.forEach(function (box, index) {
      var bounds = box.usableBounds || box.usableRect || box;
      for (var i = Math.max(0, Math.floor(bounds.x0 / PAS)); i < Math.ceil(bounds.x1 / PAS) && i < nx; i += 1) {
        for (var j = Math.max(0, Math.floor(bounds.y0 / PAS)); j < Math.ceil(bounds.y1 / PAS) && j < ny; j += 1) {
          if (pointInUsableRoom(box, (i + 0.5) * PAS, (j + 0.5) * PAS)) piece[j * nx + i] = index;
        }
      }
    });

    var roomIndex = {};
    boxes.forEach(function (box, index) { roomIndex[box.id] = index; });
    (reservations || []).forEach(function (reservation) {
      var wall = (walls || []).find(function (candidate) { return candidate.id === reservation.wallId; });
      if (!wall) return;
      var owner = wall.between.find(function (space) { return roomIndex[space] !== undefined; });
      if (owner === undefined) return;
      var volume = reservation.volume;
      for (var i = Math.max(0, Math.floor(volume.x0 / PAS)); i < Math.ceil(volume.x1 / PAS) && i < nx; i += 1) {
        for (var j = Math.max(0, Math.floor(volume.y0 / PAS)); j < Math.ceil(volume.y1 / PAS) && j < ny; j += 1) {
          piece[j * nx + i] = roomIndex[owner];
        }
      }
    });

    /* Le mobilier bloque, le débattement non : on traverse une porte en
       l'ouvrant. Les avoir confondus rendait tout plan impraticable — le
       battant condamnait le passage qu'il sert.

       Le débattement est une contrainte de **pose**, pas de circulation :
       c'est la règle S3 du socle, et elle s'adresse au solveur de mobilier,
       qui ne doit rien y placer. */
    (obstacles || []).forEach(function (rect) {
      for (var i = Math.max(0, Math.floor(rect.x0 / PAS)); i < Math.ceil(rect.x1 / PAS) && i < nx; i += 1) {
        for (var j = Math.max(0, Math.floor(rect.y0 / PAS)); j < Math.ceil(rect.y1 / PAS) && j < ny; j += 1) {
          piece[j * nx + i] = -1;
        }
      }
    });

    // Érosion sur le sol praticable : ce qui survit garantit la largeur.
    var rayon = Math.max(0, Math.round(PASSAGE_LIBRE / 2 / PAS) - 1);
    var large = new Uint8Array(nx * ny);
    for (var i2 = 0; i2 < nx; i2 += 1) for (var j2 = 0; j2 < ny; j2 += 1) {
      var ok = true;
      for (var di = -rayon; di <= rayon && ok; di += 1) for (var dj = -rayon; dj <= rayon && ok; dj += 1) {
        var ii = i2 + di, jj = j2 + dj;
        if (ii < 0 || jj < 0 || ii >= nx || jj >= ny || piece[jj * nx + ii] < 0) ok = false;
      }
      if (ok) large[j2 * nx + i2] = 1;
    }

    var passages = portes.concat([entree]);
    var franchissable = function (x, y) {
      return passages.some(function (porte) {
        return Math.abs(x - porte.x) <= porte.largeur / 2 + PAS &&
          Math.abs(y - porte.y) <= porte.largeur / 2 + PAS;
      });
    };

    var vus = new Uint8Array(nx * ny);
    var distances = new Int32Array(nx * ny);
    distances.fill(-1);
    var depart = [Math.min(nx - 1, Math.max(0, Math.round(entree.x / PAS))),
      Math.min(ny - 1, Math.max(0, Math.round(entree.y / PAS)))];
    /* Une cellule entière suffit dans la file. Les couples `[x, y]` et le
       tableau de quatre directions alloués à chaque pas dominaient le coût
       du calque sur les grands plans. */
    var file = new Int32Array(nx * ny);
    var fileLength = 0;
    for (var r = 0; r < 15 && !fileLength; r += 1) {
      for (var da = -r; da <= r; da += 1) for (var db = -r; db <= r; db += 1) {
        var a0 = depart[0] + da, b0 = depart[1] + db;
        if (a0 >= 0 && b0 >= 0 && a0 < nx && b0 < ny && large[b0 * nx + a0] && !vus[b0 * nx + a0]) {
          var startCell = b0 * nx + a0;
          file[fileLength++] = startCell; vus[startCell] = 1; distances[startCell] = 0;
        }
      }
    }
    // Un curseur conserve le coût linéaire du parcours ; `shift()` déplaçait
    // le tableau entier à chaque cellule et rendait le calque inutilement
    // quadratique sur les grandes surfaces.
    var cursor = 0;
    var directions = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    while (cursor < fileLength) {
      var currentCell = file[cursor++];
      var currentX = currentCell % nx;
      var currentY = Math.floor(currentCell / nx);
      var pCur = piece[currentCell];
      for (var directionIndex = 0; directionIndex < directions.length; directionIndex += 1) {
        var direction = directions[directionIndex];
        var a = currentX + direction[0], b = currentY + direction[1];
        if (a < 0 || b < 0 || a >= nx || b >= ny) continue;
        var neighborCell = b * nx + a;
        if (!large[neighborCell] || vus[neighborCell]) continue;
        // Changer de pièce demande une porte ; rester dans la sienne est libre.
        var pVoisin = piece[neighborCell];
        if (pVoisin !== pCur && !franchissable((a + 0.5) * PAS, (b + 0.5) * PAS)) continue;
        vus[neighborCell] = 1;
        distances[neighborCell] = distances[currentCell] + 1;
        file[fileLength++] = neighborCell;
      }
    }

    var atteintes = {};
    var longueurs = {};
    boxes.forEach(function (box, index) {
      for (var i3 = 0; i3 < nx; i3 += 1) for (var j3 = 0; j3 < ny; j3 += 1) {
        var cell = j3 * nx + i3;
        if (piece[cell] !== index || !vus[cell]) continue;
        atteintes[box.id] = true;
        var metres = distances[cell] * PAS;
        if (longueurs[box.id] === undefined || metres < longueurs[box.id]) longueurs[box.id] = metres;
      }
    });
    var desservies = boxes.filter(function (box) {
      return box.type !== 'circulation' && longueurs[box.id] !== undefined;
    });
    var valeurs = desservies.map(function (box) { return longueurs[box.id]; });
    return {
      largeur: PASSAGE_LIBRE, atteintes: atteintes,
      avecMobilier: Boolean(obstacles && obstacles.length),
      /* Pas 1 de DOCTRINE_CIRCULATION §9.6 : le calque ne disparaît plus
         derrière un booléen. On publie sa synthèse stable plutôt que ses
         dizaines de milliers de cellules : résolution, longueur minimale de
         l'entrée à chaque pièce, moyenne et pire desserte. */
      calque: { method: 'grid-shortest-path-v1', resolution: PAS, reachableCells: fileLength },
      longueurs: Object.keys(longueurs).reduce(function (result, id) {
        result[id] = round(longueurs[id], 2); return result;
      }, {}),
      desserte: {
        roomCount: valeurs.length,
        mean: round(valeurs.reduce(function (sum, value) { return sum + value; }, 0) / Math.max(1, valeurs.length), 2),
        max: round(valeurs.reduce(function (maximum, value) { return Math.max(maximum, value); }, 0), 2)
      }
    };
  }

  // Budget adaptatif : l'espace de recherche croît beaucoup plus vite que le
  // nombre de pièces, un budget linéaire laissait les grands programmes sans
  // solution conforme. La sortie anticipée sur score nul fait que ce plafond
  // n'est atteint que par les programmes qui en ont réellement besoin.
  function generationBudget(roomCount) {
    return Math.max(96, Math.min(6000, roomCount * roomCount * 70));
  }

  // À surface donnée, la proportion de l'enveloppe était calculée et donc
  // toujours identique. On explore désormais une plage autour de la valeur
  // de référence, sans sortir des limites de la priorité choisie.
  function envelopeAspect(priority, random) {
    var base = priority === 'light' ? 1.45 : priority === 'economy' ? 1.12 : 1;
    return base * (1 + (random() - 0.5) * 0.44);
  }

  /* --- Formes d'enveloppe (chantier 1) --------------------------------------
     Une enveloppe est une liste de volumes rectangulaires jointifs qui pavent
     exactement la surface demandée. Le carré et le rectangle en ont un ; le L
     en a deux, le U trois. Ce choix n'est pas qu'une commodité de calcul : il
     laisse la découpe en guillotine intacte, chaque volume étant découpé comme
     l'était l'enveloppe entière. Le moteur gagne des formes sans changer
     d'algorithme.

     Les formes soustractives se construisent dans leur rectangle englobant —
     on retire un quartier à un angle (L) ou au milieu d'un côté (U). Le
     rectangle englobant est donc plus grand que la surface du projet, et
     c'est la surface bâtie, elle, qui reste celle demandée. */

  /* Deux exigences distinctes, et les confondre stérilise les formes.
     Le corps de bâtiment doit loger la pièce la plus large du programme — le
     séjour, presque toujours. Une aile n'a qu'à loger la moins exigeante :
     `repartirProgramme()` y envoie les petites pièces et garde les grandes
     dans le volume principal. Exiger partout la largeur du séjour rendait le
     L et le U impossibles avant 130 m² (TH2D-BOUNDARY-007). */
  function largeurCorpsMinimale(rooms) {
    return rooms.reduce(function (max, room) { return Math.max(max, room.minSide || 0); }, MIN_CIRCULATION_WIDTH);
  }

  // Les pièces servantes ne justifient pas une aile : une aile large comme un
  // WC est un couloir avec une fenêtre. La borne vient donc de la plus étroite
  // des pièces qui se vivent — mesuré, la retenir évite des ailes de 1,30 m.
  var SERVANTES = ['circulation', 'wc'];

  function largeurAileMinimale(rooms) {
    var candidates = rooms.filter(function (room) { return SERVANTES.indexOf(room.type) < 0; });
    if (!candidates.length) return MIN_CIRCULATION_WIDTH;
    return candidates.reduce(function (min, room) {
      return Math.min(min, room.minSide || Infinity);
    }, Infinity);
  }

  /* Les volumes ne sont pas arrondis : ils entrent tels quels dans la découpe,
     et arrondir ici décalerait les pièces d'un millimètre pour rien. L'arrondi
     appartient à la sortie, pas au calcul. */
  function volumeRect(x, y, width, height) {
    return { x: x, y: y, width: width, height: height };
  }

  function enveloppePrimitive(options, random, shape) {
    var aspect = shape === 'square' ? 1 : envelopeAspect(options.priority, random);
    var largeur = Math.sqrt(options.surface * aspect);
    var hauteur = options.surface / largeur;
    return {
      width: largeur, height: hauteur, shape: shape,
      volumes: [volumeRect(0, 0, largeur, hauteur)]
    };
  }

  /* Une forme soustractive n'existe pas à toute surface : sous un certain
     seuil, ses ailes deviennent plus étroites que la pièce la plus exigeante
     du programme. Plutôt que de produire une aile inhabitable ou de ne rien
     rendre, on tente plusieurs proportions, puis on rabat sur le rectangle en
     le disant — `demandee` conserve le choix de l'utilisateur, `degradee` dit
     que le moteur n'a pas pu le tenir. Un plan faux serait pire qu'un plan
     honnête sur sa forme. */
  var ESSAIS_FORME = 8;

  function construireEnveloppe(options, rooms, random) {
    if (options.shape === 'square' || options.shape === 'rectangle') {
      return enveloppePrimitive(options, random, options.shape);
    }
    for (var essai = 0; essai < ESSAIS_FORME; essai += 1) {
      var candidate = enveloppeSoustractive(options, rooms, random);
      if (candidate) return candidate;
    }
    var repli = enveloppePrimitive(options, random, 'rectangle');
    repli.demandee = options.shape;
    repli.degradee = true;
    return repli;
  }

  /* Chaque volume secondaire doit pouvoir recevoir une pièce *distincte* : une
     aile n'est pas un espace, c'est un lieu de vie. Vérifier qu'il en existe
     une assez étroite ne suffit pas — il en faut autant que d'ailes. Mesuré :
     sans cet appariement, un 60 m² à deux chambres mettait sa salle d'eau
     dans une aile et laissait l'autre vide, 28 plans sur 720.

     Appariement glouton, du volume le plus étroit vers le plus large, avec la
     plus petite pièce qui convient : sur des listes de trois éléments, il
     donne le même résultat qu'un appariement optimal pour un coût nul. */
  function volumesTousHabitables(volumes, rooms, principal) {
    var candidates = rooms.filter(function (room) {
      return room.type !== 'circulation';
    }).sort(function (a, b) { return (a.minSide || 0) - (b.minSide || 0); });
    var prises = {};
    var secondaires = volumes.map(function (volume, index) { return index; })
      .filter(function (index) { return index !== principal; })
      .sort(function (a, b) {
        return Math.min(volumes[a].width, volumes[a].height) - Math.min(volumes[b].width, volumes[b].height);
      });
    return secondaires.every(function (index) {
      var volume = volumes[index];
      var etroit = Math.min(volume.width, volume.height);
      var aire = volume.width * volume.height;
      for (var i = 0; i < candidates.length; i += 1) {
        var room = candidates[i];
        if (prises[room.id]) continue;
        if ((room.minSide || 0) > etroit + 0.01) continue;
        if (room.minArea > aire + 0.01) continue;
        prises[room.id] = true;
        return true;
      }
      return false;
    });
  }

  function indexPrincipal(volumes) {
    var aires = volumes.map(function (v) { return v.width * v.height; });
    return aires.indexOf(Math.max.apply(null, aires));
  }

  function enveloppeSoustractive(options, rooms, random) {
    // Un volume sans pièce est une part d'enveloppe sans propriétaire. Une
    // forme ne peut donc pas avoir plus de volumes que le programme n'a de
    // pièces : un logement de deux pièces ne se met pas en U, il se met en
    // rectangle. Mesuré : sans ce garde-fou, 60 plans sur 720 laissaient une
    // aile vide et déclenchaient TH2D-RESERVE-001.
    var volumesRequis = options.shape === 'uShape' ? 3 : 2;
    if (rooms.length < volumesRequis) return null;
    var surface = options.surface;
    var aile = largeurAileMinimale(rooms);
    var corps = largeurCorpsMinimale(rooms);
    var aspect = envelopeAspect(options.priority, random);

    // Le retrait est borné : trop faible, la forme se confond avec un
    // rectangle ; trop fort, les ailes deviennent des couloirs.
    var retrait = 0.18 + random() * 0.16;
    var englobante = surface / (1 - retrait);
    var W = Math.sqrt(englobante * aspect);
    var H = englobante / W;

    if (options.shape === 'lShape') {
      // Bande pleine en bas, aile partielle au-dessus : le quartier retiré est
      // l'angle haut-droit du rectangle englobant.
      var h1 = H * (0.45 + random() * 0.2);
      var w2 = (surface - W * h1) / (H - h1);
      if (!(w2 >= corps && W - w2 >= aile && h1 >= corps && H - h1 >= aile)) return null;
      var volumesL = [volumeRect(0, 0, W, h1), volumeRect(0, h1, w2, H - h1)];
      if (!volumesTousHabitables(volumesL, rooms, indexPrincipal(volumesL))) return null;
      return { width: W, height: H, shape: 'lShape', volumes: volumesL };
    }

    // U : une bande pleine et deux ailes symétriques, l'encoche au milieu du
    // côté opposé. Symétriques par construction — un U dissymétrique est un
    // L avec un appendice, pas un U.
    var base = H * (0.38 + random() * 0.18);
    var aileLargeur = (surface - W * base) / (2 * (H - base));
    var encoche = W - 2 * aileLargeur;
    if (!(aileLargeur >= aile && encoche >= aile && base >= corps && H - base >= aile)) return null;
    var volumesU = [
      volumeRect(0, 0, W, base),
      volumeRect(0, base, aileLargeur, H - base),
      volumeRect(W - aileLargeur, base, aileLargeur, H - base)
    ];
    if (!volumesTousHabitables(volumesU, rooms, indexPrincipal(volumesU))) return null;
    return { width: W, height: H, shape: 'uShape', volumes: volumesU };
  }

  /* Le programme se répartit entre les volumes au prorata de leur surface. La
     circulation va dans le plus grand : c'est le volume qui touche tous les
     autres dans un L comme dans un U, donc le seul depuis lequel le graphe de
     desserte reste réalisable. */
  function repartirProgramme(rooms, volumes, random) {
    if (volumes.length === 1) return [rooms.slice()];
    var aires = volumes.map(function (v) { return v.width * v.height; });
    var principal = indexPrincipal(volumes);
    var groupes = volumes.map(function () { return []; });
    var restant = aires.slice();
    var ordre = shuffled(rooms, random).sort(function (a, b) { return b.targetArea - a.targetArea; });

    /* Chaque volume reçoit d'abord une pièce, la plus grande qui y tienne :
       distribuer au seul prorata des surfaces laisserait parfois une aile
       vide, donc une part d'enveloppe sans propriétaire. On sème, puis on
       répartit. */
    var places = {};
    volumes.forEach(function (volume, index) {
      if (index === principal) return;
      var etroit = Math.min(volume.width, volume.height);
      for (var i = 0; i < ordre.length; i += 1) {
        var candidate = ordre[i];
        if (places[candidate.id] || candidate.type === 'circulation') continue;
        if ((candidate.minSide || 0) > etroit + 0.01) continue;
        if (candidate.minArea > aires[index] + 0.01) continue;
        places[candidate.id] = true;
        groupes[index].push(candidate);
        restant[index] -= candidate.targetArea;
        break;
      }
    });

    ordre.forEach(function (room) {
      if (places[room.id]) return;
      var cible = room.type === 'circulation' ? principal : -1;
      if (cible < 0) {
        // Le volume qui garde le plus de place, à condition d'y tenir — en
        // surface comme en largeur. Une chambre de 2,50 m de côté minimal
        // n'entre pas dans une aile de 1,80 m, quelle que soit sa longueur.
        var meilleur = -1;
        restant.forEach(function (place, index) {
          if (place + 0.01 < room.minArea) return;
          var volume = volumes[index];
          if (Math.min(volume.width, volume.height) + 0.01 < (room.minSide || 0)) return;
          if (meilleur < 0 || place > restant[meilleur]) meilleur = index;
        });
        cible = meilleur >= 0 ? meilleur : restant.indexOf(Math.max.apply(null, restant));
      }
      groupes[cible].push(room);
      restant[cible] -= room.targetArea;
    });
    return groupes;
  }

  /* Chaque volume est découpé pour la surface qu'il porte réellement, qui
     diffère de la somme des cibles de ses pièces. L'écart est réparti au
     prorata : sans cela, la découpe déborderait ou laisserait un vide, et la
     couverture cesserait d'être complète. */
  function ajusterAuVolume(groupe, volume, volumes) {
    // Enveloppe primitive : la somme des cibles vaut déjà la surface, et
    // rééchelonner n'introduirait qu'un bruit de virgule — assez pour changer
    // les rapports de découpe, donc les plans, sans rien corriger.
    if (volumes.length === 1) return groupe;
    var aire = volume.width * volume.height;
    var somme = groupe.reduce(function (total, room) { return total + room.targetArea; }, 0);
    if (!somme) return groupe;
    var facteur = aire / somme;
    return groupe.map(function (room) {
      return Object.assign({}, room, { targetArea: round(room.targetArea * facteur) });
    });
  }

  /* --- Génération -------------------------------------------------------------

     Le moteur ne cherche plus sa disposition, il la pose. Jusqu'au 21 août
     2026 cette fonction tirait jusqu'à six mille découpes en guillotine et
     retenait la moins mauvaise au score ; elle réalisait 93,8 % des adjacences
     demandées, et jamais la totalité.

     La bascule tient à une mesure : le graphe demandé est une étoile sur 840
     plans sur 840, sans une exception (DECOUPE_ET_GRAPHE.md §1.1). La forme de
     la réponse était donc connue d'avance, et le budget de recherche servait à
     redécouvrir à chaque tirage une disposition connue depuis un siècle — le
     couloir desservant.

     Ce qui reste de hasard porte sur ce que la topologie laisse libre :
     répartition des pièces entre bandes, ordre dans une bande, côté de chaque
     aile, orientation du plan. Aucune de ces libertés ne touche aux
     adjacences, puisqu'une pièce borde son couloir quelle que soit sa place.
     La graine reste donc rejouable, et la diversité mesurée reste au-dessus du
     seuil (§7.2).

     `faconner` vaut désormais false : cession de circulation et décrochements
     étaient des rattrapages d'une découpe qui ne visait pas juste. Une
     disposition posée n'a rien à rattraper. */
  function attachContractMetadata(plan, program) {
    var contracts = root.TechnoHabContracts;
    if (!contracts || !plan) return plan;
    var profiles = contracts.profileManifest(program, plan);
    plan.contractVersion = contracts.version;
    plan.profiles = profiles.map(function (profile) {
      return { id: profile.id, maturity: profile.maturity, version: profile.version, source: profile.source };
    });
    plan.profileMaturity = contracts.profileMaturity(profiles);
    plan.canonicalValueSchemaVersion = root.TechnoHabCanonicalValues
      ? root.TechnoHabCanonicalValues.schemaVersion
      : null;
    plan.canonicalValues = contracts.canonicalValueManifest(profiles).map(function (reference) {
      return { id: reference.id, version: reference.version };
    });
    var facadeValue = root.TechnoHabCanonicalValues &&
      root.TechnoHabCanonicalValues.get(CIRCULATION_FACADE_VALUE_ID);
    if (facadeValue && !plan.canonicalValues.some(function (reference) {
      return reference.id === facadeValue.id;
    })) {
      plan.canonicalValues.push({ id: facadeValue.id, version: facadeValue.version });
    }
    var branchValue = root.TechnoHabCanonicalValues &&
      root.TechnoHabCanonicalValues.get(CIRCULATION_DEAD_LENGTH_VALUE_ID);
    if (branchValue && !plan.canonicalValues.some(function (reference) {
      return reference.id === branchValue.id;
    })) {
      plan.canonicalValues.push({ id: branchValue.id, version: branchValue.version });
    }
    [USAGE_TARGET_MISS_VALUE_ID, USAGE_COMFORT_MISS_VALUE_ID].forEach(function (id) {
      var value = root.TechnoHabCanonicalValues && root.TechnoHabCanonicalValues.get(id);
      if (value && !plan.canonicalValues.some(function (reference) {
        return reference.id === value.id;
      })) plan.canonicalValues.push({ id: value.id, version: value.version });
    });
    return plan;
  }

  /* O1 se juge sur le plan matérialisé, pas seulement sur sa promesse de
     programme. Un plafond peut être reperdu lors de la découpe, et un
     arrangement choisi pour le tenir ne doit pas casser la desserte. */
  function respecteEnveloppesO1(plan, program) {
    var plafonds = {};
    program.rooms.forEach(function (room) {
      if (room.agrement === 0 && Number.isFinite(room.maxArea)) plafonds[room.id] = room.maxArea;
    });
    var surfaceTenue = plan.rooms.every(function (room) {
      return plafonds[room.id] === undefined || room.area <= plafonds[room.id] + 0.05;
    });
    return surfaceTenue;
  }

  function hardCountForSelection(plan) {
    if (root.TechnoHabAblations &&
        (root.TechnoHabAblations.disableM5BranchUtility || root.TechnoHabAblations.disableM5HardFilter)) {
      return 0;
    }
    var rules = root.TechnoHabRules;
    /* Sans solveur de placement, le générateur tourne en mode instrument
       historique : le BuiltPlan ne porte pas encore le mobilier ni S4 et ne
       peut donc pas recevoir honnêtement le filtre M5. `generateResult` en
       production charge toujours les deux dépendances. */
    if (!root.TechnoHabPlacement || !rules || !rules.evaluatePlan) return 0;
    try {
      var report = rules.evaluatePlan(plan);
      return report && report.summary ? Number(report.summary.hard || 0) : 0;
    } catch (_) {
      // `generateResult` possède le statut INVALIDE_DEBUG pour une panne du
      // juge. La recherche ne transforme pas une panne en rejet silencieux.
      return 0;
    }
  }

  function generatePlan(rawOptions, variant, requestedSeed) {
    var program = buildProgram(rawOptions);
    var seed = typeof requestedSeed === 'number'
      ? requestedSeed >>> 0
      : hash(JSON.stringify(program.options) + ':' + (variant || 1));
    var typologie = root.TechnoHabTypologie;
    if (!typologie || !typologie.poser) {
      throw generationError('DEPENDENCY_MISSING',
        'generatePlan : TechnoHabTypologie doit être chargé avant le générateur.');
    }

    /* Le programme demande un nombre de dégagements ; la géométrie a le
       dernier mot. On repart d'un cran plus bas plutôt que de rendre la main
       sans plan — un T4 de 70 m² se contente d'un seul couloir. */
    /* Le squelette pose une circulation unique et connexe — barre, L ou T —
       et les pièces dans ses poches. Il rend des organisations que le poseur
       en bandes ne trouve pas, mais il refuse plus souvent : la typologie en
       bandes reste donc en repli, et c'est elle qui sert les studios, les
       programmes saturés et tout ce que le squelette ne sait pas loger. */
    var parSquelette = poserParSquelette(rawOptions, variant, requestedSeed);
    if (parSquelette) return attachContractMetadata(parSquelette, program);

    /* Le levier M5 ne transforme pas un programme historiquement servi en
       NON_TROUVE. Si sa sélection diversifiée s'épuise, un unique passage
       avec l'ordre antérieur reste disponible ; la mesure branche→porte et
       son coût restent actifs dans le plan publié. */
    if (!(root.TechnoHabAblations && root.TechnoHabAblations.disableM5BranchUtility)) {
      var ablationsPrecedentes = root.TechnoHabAblations;
      root.TechnoHabAblations = Object.assign({}, ablationsPrecedentes || {}, {
        disableM5Search: true
      });
      try {
        parSquelette = poserParSquelette(rawOptions, variant, requestedSeed);
      } finally {
        root.TechnoHabAblations = ablationsPrecedentes;
      }
      if (parSquelette) {
        parSquelette.circulationObjective.branchSearchFallback = 'legacy-ranking-v1';
        return attachContractMetadata(parSquelette, program);
      }
    }

    var couloirsVoulus = program.rooms.filter(function (r) { return r.type === 'circulation'; }).length;
    /* Le plancher est zéro, pas un : un studio n'a aucune circulation — le
       séjour dessert — et une boucle qui s'arrêtait à un ne s'exécutait alors
       jamais. C'était la cause des 224 programmes sans plan. */
    for (var plafond = couloirsVoulus; plafond >= 0; plafond -= 1) {
      var tentative = poserAvecTypologie(rawOptions, plafond, variant, requestedSeed);
      if (tentative) return attachContractMetadata(tentative, program);
    }
    throw generationError('NON_TROUVE', 'generatePlan : aucune disposition ne sert ce programme.');
  }

  /* Réaffecte chaque pièce au dégagement qu'elle borde réellement le mieux.
     Les arêtes séjour↔dégagement et séjour↔cuisine sont conservées telles
     quelles : elles ne sont pas interchangeables. */
  function rattacherAuxDegagements(program, best) {
    var couloirs = best.boxes.filter(function (b) { return b.type === 'circulation'; });
    if (couloirs.length < 2) return;
    var seuil = program.minDesserte || MIN_DESSERTE;
    var contactAvec = function (roomId, couloirId) {
      var lien = best.edges.find(function (e) {
        return (e.a === roomId && e.b === couloirId) || (e.a === couloirId && e.b === roomId);
      });
      return lien ? (lien.contact || 0) : 0;
    };
    program.desiredEdges = program.desiredEdges.map(function (edge) {
      var couloirId = couloirs.some(function (c) { return c.id === edge.a; }) ? edge.a
        : (couloirs.some(function (c) { return c.id === edge.b; }) ? edge.b : null);
      if (!couloirId) return edge;
      var autre = edge.a === couloirId ? edge.b : edge.a;
      if (autre === 'living') return edge;
      // Le dégagement le mieux en contact l'emporte ; à défaut, on n'y touche pas.
      var meilleur = couloirId, meilleurContact = contactAvec(autre, couloirId);
      couloirs.forEach(function (c) {
        var contact = contactAvec(autre, c.id);
        if (contact > meilleurContact + 0.01) { meilleur = c.id; meilleurContact = contact; }
      });
      if (meilleur === couloirId || meilleurContact < seuil) return edge;
      return Object.assign({}, edge, { a: meilleur, b: autre });
    });
    /* Les relations obligatoires voyagent aussi dans le registre complet.
       Réécrire les mêmes couples y évite que le score et le verdict lisent
       deux dégagements différents après la réaffectation géométrique. */
    program.adjacencies = program.desiredEdges.concat((program.adjacencies || []).filter(function (edge) {
      return edge.degre !== 'obligatoire';
    }));
  }

  /* Pose par squelette. Rend `null` si aucune famille ne sert le programme —
     l'appelant bascule alors sur la typologie en bandes.

     Le programme est ramené à UNE circulation : le squelette en fait un réseau
     connexe dont les branches se touchent, et plusieurs pièces de circulation
     n'auraient plus de sens. C'est le chantier « circulations multiples » qui
     se résout ici, en cessant de compter les couloirs pour compter les
     branches. */
  function poserParSquelette(rawOptions, variant, requestedSeed) {
    var squelette = root.TechnoHabSquelette;
    if (!squelette || !squelette.poser) return null;
    var forme = normalizeOptions(rawOptions).shape;
    // Une enveloppe en U a besoin d'une encoche réellement extérieure. Une
    // branche de circulation posée entre ses deux ailes reboucherait cette
    // encoche et rendrait un rectangle étiqueté U. Dans les formes
    // soustractives, le séjour assume donc la desserte intégrée ; carré et
    // rectangle gardent leur squelette à une branche.
    var couloirsSquelette = forme === 'uShape' ? 0 : 1;
    var program = buildProgram(Object.assign({}, rawOptions, { couloirsMax: couloirsSquelette }));
    var seed = typeof requestedSeed === 'number'
      ? requestedSeed >>> 0
      : hash(JSON.stringify(program.options) + ':' + (variant || 1));

    var demandee = program.options.surface;
    var tirage = randomFrom(seed ^ 0x5BD1E995);
    program.surfaceVisee = round(demandee * (1 + (tirage() * 2 - 1) * MARGE_SURFACE), 2);

    /* M3 — chaque stratégie produit le même contrat de candidat. Une famille
       n'est plus choisie au hasard avant le score : barre, L, T, hall et
       jour/nuit sont proposées ensemble, puis le barème M3.0 et le coût
       d'usage M2 les départagent. Plusieurs lots de graines conservent la
       capacité d'explorer une autre répartition sans cacher son origine. */
    var strategies = squelette.strategiesPour
      ? squelette.strategiesPour(program)
      : [{ id: 'squelette', famille: null, repartition: 'libre' }];
    var branchFallback = null;
    var hardRejected = 0;
    /* C-P1.2a ajoute le pied du lit et le plancher parental : deux
       répartitions ne suffisaient plus à servir un des témoins en L à
       110 m². Quatre gardent les douze formes sans relâcher le programme. */
    var repartitionsMax = root.TechnoHabAblations && root.TechnoHabAblations.disableM5BranchUtility
      ? 6 : 4;
    for (var repartition = 0; repartition < repartitionsMax; repartition += 1) {
      var cible = program.surfaceVisee;
      for (var essai = 0; essai < 16; essai += 1) {
        var ranked = [];
        for (var strategyIndex = 0; strategyIndex < strategies.length; strategyIndex += 1) {
          var strategy = strategies[strategyIndex];
          var repartitionIndex = repartition * strategies.length + strategyIndex;
          var poseSeed = repartitionIndex === 0 ? seed
            : (seed ^ Math.imul(repartitionIndex, 0x9E3779B1)) >>> 0;
          var pose = squelette.produire
            ? squelette.produire(program, cible, poseSeed, strategy.id)
            : squelette.poser(program, cible, poseSeed);
          if (!pose || !pose.pieces) continue;
          /* M4a : le nord du fichier ne doit pas devenir une propriété
             architecturale par accident. La classe est classée dans sa vue
             canonique ; sa vue ensemencée n'est matérialisée que pour le
             candidat choisi. On évite ainsi de résoudre huit fois le même
             mobilier sous huit repères. */
          var posesTransformees = squelette.transformations
            ? squelette.transformations(pose, poseSeed)
            : [Object.assign({}, pose, { transformation: 'r0', equivalenceClass: 'legacy-r0' })];
          if (!posesTransformees.length) continue;
          var poseTransformee = posesTransformees[0];
          /* La silhouette demandée reste une contrainte de contrat. Une
             famille T peut dessiner trois poches extérieures et une barre-L
             presque pleine peut fusionner son retrait : ni l'une ni l'autre
             ne doit être publiée comme `lShape`, qui porte exactement deux
             volumes. Le repli typologique reste disponible si aucun
             producteur M3 ne tient cette cardinalité. */
          if (forme === 'lShape' && (!pose.volumes || pose.volumes.length !== 2)) continue;
          if (forme === 'uShape' && (!pose.volumes || pose.volumes.length !== 3)) continue;
          try {
            var candidate = candidatDepuisPieces(program, pose.pieces, {
              shape: program.options.shape, volumes: pose.volumes
            });
            candidate.topologyStrategy = pose.strategy || strategy.id;
            candidate.topologyFamily = pose.famille || strategy.famille || 'non-renseignee';
            candidate.topologyBranches = pose.branches || 0;
            candidate.topologyTransform = poseTransformee.transformation || 'r0';
            candidate.topologyEquivalenceClass = poseTransformee.equivalenceClass || 'non-renseignee';
            candidate.topologyTransformationsAvailable = poseTransformee.transformationsAvailable || posesTransformees.length;
            candidate.topologyTerminationMethod = poseTransformee.terminationMethod || 'none';
            candidate.topologyTerminations = (poseTransformee.terminations || []).map(function (termination) {
              return Object.assign({}, termination);
            });
            candidate.topologyTransformedPose = poseTransformee;
            // Contrat M3 : une stratégie ne propose pas un graphe obligatoire
            // « presque tenu ». Elle rend un candidat conforme par
            // construction ou ne rend rien ; les préférences seules vont au score.
            if (mandatoryAdjacenciesHeld(candidate, program)) ranked.push(candidate);
          } catch (_) { /* candidat incomplet : le suivant reste comparable */ }
        }
        if (!ranked.length) break;
        var comparedStrategies = ranked.map(function (candidate) { return candidate.topologyStrategy; });
        var producedCandidates = ranked.length;
        ranked = rankCandidatesWithUsage(ranked,
          root.TechnoHabAblations &&
          (root.TechnoHabAblations.disableM5BranchUtility || root.TechnoHabAblations.disableM5Search) ? 2 : 3);
        var correctionPlan = null;
        var convergeNonMeublable = false;
        var viablePlans = [];
        for (var choix = 0; choix < ranked.length; choix += 1) {
          var best = ranked[choix];
          if (best.topologyTransformedPose && best.topologyTransform !== 'r0') {
            var rankedBest = best;
            best = candidatDepuisPieces(program, rankedBest.topologyTransformedPose.pieces, {
              shape: program.options.shape,
              volumes: rankedBest.topologyTransformedPose.volumes
            });
            best.score += rankedBest.usageCost || 0;
            best.usageCost = rankedBest.usageCost || 0;
            best.usageCandidatesCompared = rankedBest.usageCandidatesCompared;
            best.scoreBreakdown = Object.assign({}, best.scoreBreakdown || {}, {
              usage: best.usageCost
            });
            best.topologyStrategy = rankedBest.topologyStrategy;
            best.topologyFamily = rankedBest.topologyFamily;
            best.topologyBranches = rankedBest.topologyBranches;
            best.topologyTransform = rankedBest.topologyTransform;
            best.topologyEquivalenceClass = rankedBest.topologyEquivalenceClass;
            best.topologyTransformationsAvailable = rankedBest.topologyTransformationsAvailable;
            best.topologyTerminationMethod = rankedBest.topologyTerminationMethod;
            best.topologyTerminations = rankedBest.topologyTerminations;
          }
          rattacherAuxDegagements(program, best);
          // Le squelette porte déjà la silhouette. Lui appliquer en plus les
          // décrochements correctifs de l'ancienne typologie peut ne laisser
          // qu'un contact ponctuel après retrait des cloisons, donc une pièce
          // utile déconnectée. La cession de circulation reste active ; seul ce
          // façonnage tardif est écarté.
          var plan = finaliserPlan(program, best, seed, variant,
            repartition * 16 + essai + 1, 'carve-only');
          plan.topologyStrategy = best.topologyStrategy;
          plan.topologyFamily = best.topologyFamily;
          plan.topologyBranches = best.topologyBranches;
          plan.topologyTransform = best.topologyTransform;
          plan.topologyEquivalenceClass = best.topologyEquivalenceClass;
          plan.topologyTransformationsAvailable = best.topologyTransformationsAvailable;
          plan.topologyTerminationMethod = best.topologyTerminationMethod || 'none';
          plan.topologyTerminations = (best.topologyTerminations || []).map(function (termination) {
            return Object.assign({}, termination);
          });
          plan.topologyCandidatesCompared = producedCandidates;
          plan.topologyStrategiesCompared = comparedStrategies;
          var enveloppeTenue = respecteEnveloppesO1(plan, program);
          var surfacesUtilesConnexes = best.topologyTerminationMethod !== 'interior-room-cap-v1' ||
            !plan.wallDiagnostics ||
            !(plan.wallDiagnostics.disconnectedUsableRooms || []).length;
          if (Math.abs(plan.habitableArea - program.surfaceVisee) < 0.004 &&
              enveloppeTenue && surfacesUtilesConnexes) {
            validatePlanUsage(plan);
            if (plan.rooms.every(function (room) { return room.furnishable !== false; })) {
              var hardCount = hardCountForSelection(plan);
              if (hardCount > 0) {
                hardRejected += 1;
                continue;
              }
              plan.hardCandidatesRejected = hardRejected;
              if (root.TechnoHabAblations &&
                  (root.TechnoHabAblations.disableM5BranchUtility || root.TechnoHabAblations.disableM5Search)) {
                return plan;
              }
              viablePlans.push(plan);
              continue;
            }
            convergeNonMeublable = true;
          } else if (!surfacesUtilesConnexes) {
            // Une jonction de partition peut disparaître après retrait des
            // faces de murs. Le BuiltPlan fait foi : cette topologie n'est
            // jamais publiée, même si ses rectangles étaient connexes.
            convergeNonMeublable = true;
          } else if (!correctionPlan) {
            correctionPlan = { plan: plan, enveloppeTenue: enveloppeTenue };
          }
        }
        if (viablePlans.length) {
          viablePlans.sort(function (a, b) {
            if (!(root.TechnoHabAblations && root.TechnoHabAblations.disableM5BranchUtility)) {
              var emptyDifference = a.circulationObjective.emptyArmCount -
                b.circulationObjective.emptyArmCount;
              if (emptyDifference) return emptyDifference;
            }
            return a.score - b.score || a.topologyFamily.localeCompare(b.topologyFamily);
          });
          var winner = viablePlans[0];
          winner.hardCandidatesRejected = hardRejected;
          if ((root.TechnoHabAblations && root.TechnoHabAblations.disableM5BranchUtility) ||
              winner.circulationObjective.emptyArmCount === 0) return winner;
          if (!branchFallback || winner.circulationObjective.emptyArmCount <
              branchFallback.circulationObjective.emptyArmCount ||
              (winner.circulationObjective.emptyArmCount === branchFallback.circulationObjective.emptyArmCount &&
               winner.score < branchFallback.score)) {
            branchFallback = winner;
          }
          // La cible est convergée : seule une autre répartition peut donner
          // une porte au bras vide. On ne répète pas seize fois la même pose.
          break;
        }
        /* À géométrie convergée mais inutilisable, répéter la même cible
           reproduirait les mêmes portes et les mêmes pièces. Le lot de
           répartition suivant doit pouvoir proposer une autre organisation. */
        if (convergeNonMeublable) break;
        if (!correctionPlan) break;
        // La construction ramène toujours l'habitable à la cible ; en cas de
        // plafond dépassé, répéter exactement la même aire ne change donc
        // rien. Élargir légèrement la cible de partition explore un autre
        // rapport largeur/profondeur sans relâcher le plafond utile.
        if (!correctionPlan.enveloppeTenue) cible *= 1.10;
        cible *= program.surfaceVisee / correctionPlan.plan.habitableArea;
      }
    }
    if (branchFallback) branchFallback.hardCandidatesRejected = hardRejected;
    return branchFallback;
  }

  function poserAvecTypologie(rawOptions, couloirsMax, variant, requestedSeed) {
    var program = buildProgram(Object.assign({}, rawOptions, { couloirsMax: couloirsMax }));
    var seed = typeof requestedSeed === 'number'
      ? requestedSeed >>> 0
      : hash(JSON.stringify(program.options) + ':' + (variant || 1));
    var typologie = root.TechnoHabTypologie;
    if (!typologie || !typologie.poser) {
      throw generationError('DEPENDENCY_MISSING',
        'generatePlan : TechnoHabTypologie doit être chargé avant le générateur.');
    }

    /* Mise à la surface demandée. La typologie raisonne en surface de
       partition ; la demande porte sur l'habitable, que seules les cloisons
       permettent de connaître — donc après `finaliserPlan()`. On corrige la
       cible et on repose, plutôt que de mettre le plan à l'échelle : une
       largeur réglementaire ne se met pas à l'échelle, et un couloir
       homothétié tombe sous 1,20 m. */
    var demandee = program.options.surface;
    /* La surface servie est tirée dans la marge, et c'est une source de
       diversité à part entière : deux graines ne donnent plus seulement deux
       dispositions, mais deux tailles de logement. */
    var tirage = randomFrom(seed ^ 0x5BD1E995);
    program.surfaceVisee = round(demandee * (1 + (tirage() * 2 - 1) * MARGE_SURFACE), 2);

    var cible = program.surfaceVisee;
    var refus = null, hardRejected = 0;
    for (var essai = 0; essai < 12; essai += 1) {
      // Même graine à chaque essai : seule la cible bouge, sans quoi la
      // disposition changerait sous la correction et la boucle ne convergerait
      // pas.
      var ranked = [];
      for (var rank = 0; rank < 2; rank += 1) {
        var candidateSeed = rank === 0 ? seed : (seed ^ Math.imul(rank, 0x9E3779B1)) >>> 0;
        var pose = typologie.poser(program, cible, candidateSeed);
        if (!pose.pieces) { refus = pose.motif; continue; }
        ranked.push(candidatDepuisPieces(program, pose.pieces, {
          shape: 'rectangle',
          demandee: program.options.shape,
          degradee: program.options.shape !== 'rectangle'
        }));
      }
      if (!ranked.length) break;
      ranked = rankCandidatesWithUsage(ranked, 2);
      var best = ranked[0];
      /* Le graphe enregistre ce que la disposition a fait. La typologie est
         libre de rattacher une pièce au dégagement qu'elle veut ; l'exigence
         est qu'elle en touche UN, pas un dégagement nommé d'avance. Réécrire
         ici évite que `buildProgram()` et la typologie décident séparément —
         le défaut qui avait fait tomber les adjacences à 63 %. */
      rattacherAuxDegagements(program, best);
      /* `faconner` réactivé le 21 août. Il porte la cession de circulation —
         qui rend les bandes de rangement — et les décrochements entre pièces
         mitoyennes. Coupé lors de la bascule sur la typologie au motif qu'une
         disposition posée n'a rien à rattraper, ce qui était vrai pour les
         adjacences et faux pour tout le reste : sans lui, plus un seul placard,
         et toutes les pièces à quatre arêtes exactement. */
      var plan = finaliserPlan(program, best, seed, variant, essai + 1, true);
      plan.topologyStrategy = 'typologie';
      plan.topologyFamily = 'bandes';
      plan.topologyBranches = plan.rooms.filter(function (room) { return room.type === 'circulation'; }).length;
      plan.topologyTransform = 'r0';
      plan.topologyEquivalenceClass = 'legacy-bandes';
      plan.topologyTransformationsAvailable = 1;
      plan.topologyTerminationMethod = 'none';
      plan.topologyTerminations = [];
      plan.topologyCandidatesCompared = ranked.length;
      plan.topologyStrategiesCompared = ['typologie'];
      var enveloppeTenue = respecteEnveloppesO1(plan, program);
      if (Math.abs(plan.habitableArea - program.surfaceVisee) < 0.002 && enveloppeTenue) {
        validatePlanUsage(plan);
        if (plan.rooms.every(function (room) { return room.furnishable !== false; }) &&
          (!plan.s4 || plan.s4.passes)) {
          var hardCount = hardCountForSelection(plan);
          if (hardCount > 0) {
            hardRejected += 1;
          } else {
            plan.hardCandidatesRejected = hardRejected;
            return plan;
          }
        }
      }
      if (!enveloppeTenue) cible *= 1.10;
      cible *= program.surfaceVisee / plan.habitableArea;
    }
    return null;   // la typologie n'a rien trouvé : l'appelant retirera un couloir
  }

  function scaleEnvelope(envelope, factor) {
    return Object.assign({}, envelope, {
      width: envelope.width * factor,
      height: envelope.height * factor,
      volumes: envelope.volumes.map(function (volume) {
        return volumeRect(
          volume.x * factor,
          volume.y * factor,
          volume.width * factor,
          volume.height * factor
        );
      })
    });
  }

  function equipmentProgramRecord(equipment) {
    return {
      id: equipment.id,
      sizeId: equipment.size || equipment.id,
      label: equipment.label,
      required: Boolean(equipment.required),
      program: equipment.program || null,
      footprint: { w: equipment.footprint.w, d: equipment.footprint.d },
      activation: equipment.required ? 'required' : 'area-threshold',
      minRoomArea: Number.isFinite(equipment.minRoomArea) ? equipment.minRoomArea : null
    };
  }

  function equipmentProgramManifest(requested, resolved, fallback, attempts) {
    return {
      version: 'm4c-v1', authority: 'BuiltPlan', method: resolved.resolution.method,
      area: resolved.resolution.area,
      programs: resolved.programs.slice(),
      requested: requested.equipments.map(equipmentProgramRecord),
      resolved: resolved.equipments.map(equipmentProgramRecord),
      fallback: {
        attempts: attempts,
        sizeDowngraded: Boolean(fallback.sizeDowngraded),
        optionalRemoved: Boolean(fallback.optionalRemoved)
      }
    };
  }

  function validatePlanUsage(plan) {
    var placement = root.TechnoHabPlacement;
    if (!placement || !placement.validate) return plan;
    var usagePlan = { portes: plan.portes || [], entree: plan.entree, fenetres: plan.fenetres || [] };
    var swingConflictByRoom = {};
    var clearanceTotals = {
      targetRequired: 0, targetMet: 0, comfortRequired: 0, comfortMet: 0
    };
    // PONDERATION §3.1 — un équipement n'est « surdimensionné » que si
    // resolveSize() a retenu une taille de gamme au-delà du plancher
    // (room-model.js) : `sizeId` diffère alors de `equipmentId`. Seuls deux
    // équipements du socle déclarent une gamme aujourd'hui (`bed_140`,
    // `sofa`) ; le compte reste à 0 partout ailleurs, ce qui est correct,
    // pas un défaut de couverture.
    var oversizedCount = 0;
    var s4Rooms = [], furnitureObstacles = [];
    plan.rooms.forEach(function (room) {
      var program = compiledRoomProgram(room);
      var rectangularGeometry = placement.polygonIsRectangle
        ? placement.polygonIsRectangle(room.usablePolygon) : !(room.usablePolygon || []).length;
      room.placementGeometry = {
        kind: rectangularGeometry ? 'rectangle' : 'polygon',
        method: rectangularGeometry ? 'rectangle-v1' : 'orthogonal-polygon-v1',
        cacheAuthority: rectangularGeometry ? 'fit.data.js' : 'none'
      };
      if (!program.equipments.length) {
        room.placements = [];
        room.equipmentProgram = equipmentProgramManifest(program, program,
          { sizeDowngraded: false, optionalRemoved: false }, 1);
        return;
      }
      var rectangle = room.usableBounds || room.usableRect;
      var spatial = placement.roomContext(room, usagePlan);
      var context = spatial.context;
      context.accessClearance = program.accessClearance;
      var resolved = validateResolvedPrograms(room, {
        w: rectangle.x1 - rectangle.x0, h: rectangle.y1 - rectangle.y0
      }, {
        context: context, s4: true, optimizeS4: true, boundedEnhanced: true,
        seed: String(plan.seed || plan.seedValue || plan.variant) + ':' + room.id,
        attempts: 8
      });
      var result = resolved.result;
      program = resolved.program;
      if (!result.fits && (context.blocked || []).length) {
        var withoutSwing = placement.validate(program.equipments, {
          w: rectangle.x1 - rectangle.x0, h: rectangle.y1 - rectangle.y0
        }, {
          relations: program.relations,
          context: Object.assign({}, context, { blocked: [] }),
          facingClearance: program.facingClearance, s4: true
        });
        // S3 ne doit porter que la causalité du battant. Une pièce déjà
        // impossible sans porte reste un échec de meublabilité, pas un double
        // échec artificiellement imputé à la porte.
        swingConflictByRoom[room.id] = withoutSwing.fits;
      }
      if (result.fits) swingConflictByRoom[room.id] = false;
      room.furnishable = result.fits;
      room.equipmentProgram = equipmentProgramManifest(resolved.requestedProgram,
        program, resolved.fallback, resolved.attempts);
      room.placements = result.fits ? result.placements.map(function (pose) {
        return {
          equipmentId: pose.equipment.id,
          sizeId: pose.equipment.size || pose.equipment.id,
          label: pose.equipment.label,
          required: Boolean(pose.equipment.required),
          program: pose.equipment.program || null,
          nominalFootprint: {
            w: pose.equipment.footprint.w,
            d: pose.equipment.footprint.d
          },
          anchor: pose.equipment.anchor || 'free',
          wallId: pose.wallId || pose.wall || null,
          faceId: pose.faceId || null,
          footprint: pose.footprint,
          usage: pose.usage,
          rotation: pose.rotation,
          inward: pose.inward
        };
      }) : [];
      room.placements.forEach(function (pose) {
        if (pose.sizeId !== pose.equipmentId) oversizedCount += 1;
      });
      room.furnitureOccupancy = result.fits && placement.assessOccupancy
        ? placement.assessOccupancy(result.placements, {
          w: rectangle.x1 - rectangle.x0, h: rectangle.y1 - rectangle.y0
        }, program.maxFurnitureRatio) : null;
      room.s4 = result.s4 || {
        passes: false, method: 'chamfer-grid-v1', resolution: 0.05,
        clearance: program.accessClearance || 0.60, accessCount: 0, anchoredAccessCount: 0,
        requiredUsageZones: 0, reachableUsageZones: 0,
        disconnected: [], componentCount: 0, accessibleArea: 0
      };
      s4Rooms.push({ roomId: room.id, passes: Boolean(room.s4.passes),
        requiredUsageZones: room.s4.requiredUsageZones,
        reachableUsageZones: room.s4.reachableUsageZones });
      if (result.fits) result.placements.forEach(function (pose) {
        furnitureObstacles.push({
          x0: spatial.origin.x + pose.footprint.x0,
          y0: spatial.origin.y + pose.footprint.y0,
          x1: spatial.origin.x + pose.footprint.x1,
          y1: spatial.origin.y + pose.footprint.y1
        });
      });
      room.usageValidation = {
        fits: result.fits,
        reason: result.reason || null,
        geometry: result.geometry || {
          kind: 'rectangle', method: 'rectangle-v1', cacheAuthority: 'fit.data.js'
        },
        quality: result.fits
          ? placement.assess(result.placements, {
            w: rectangle.x1 - rectangle.x0, h: rectangle.y1 - rectangle.y0
          }, program.relations, context, result.s4).score
          : 0,
        optimization: result.optimization || null,
        clearance: result.fits && placement.assessClearanceLevels
          ? placement.assessClearanceLevels(result.placements, {
            w: rectangle.x1 - rectangle.x0, h: rectangle.y1 - rectangle.y0
          }, context)
          : null
      };
      if (room.usageValidation.clearance) {
        ['targetRequired', 'targetMet', 'comfortRequired', 'comfortMet'].forEach(function (key) {
          clearanceTotals[key] += room.usageValidation.clearance[key] || 0;
        });
      }
      room.placementGeometry = room.usageValidation.geometry;
    });
    (plan.portes || []).concat(plan.entree ? [plan.entree] : []).forEach(function (door) {
      if (!door.debattement || !door.ouvreVers || door.ouvreVers === 'exterior') {
        door.s3Passed = true;
        return;
      }
      door.s3Passed = !swingConflictByRoom[door.ouvreVers];
    });
    plan.s4 = {
      passes: s4Rooms.every(function (room) { return room.passes; }),
      method: 'room-required-usage-connectivity-v1',
      evaluatedRooms: s4Rooms.length,
      failedRooms: s4Rooms.filter(function (room) { return !room.passes; }).map(function (room) { return room.roomId; }),
      requiredUsageZones: s4Rooms.reduce(function (sum, room) { return sum + room.requiredUsageZones; }, 0),
      reachableUsageZones: s4Rooms.reduce(function (sum, room) { return sum + room.reachableUsageZones; }, 0)
    };
    plan.parcours = cheminement(plan.rooms, plan.portes || [], plan.entree,
      plan.boundary.width, plan.boundary.height, furnitureObstacles,
      plan.walls || [], plan.reservations || []);
    if (plan.circulationObjective && plan.parcours && plan.parcours.desserte) {
      plan.circulationObjective.pathMean = plan.parcours.desserte.mean;
      plan.circulationObjective.pathMax = plan.parcours.desserte.max;
    }
    var preferencesDisabled = root.TechnoHabAblations &&
      (root.TechnoHabAblations.disableM5BranchUtility || root.TechnoHabAblations.disableM5Preferences);
    // PONDERATION §3.2 — en mode compact, poursuivre le confort et le
    // pénaliser une fois atteint serait contradictoire : les deux
    // coexisteraient et puniraient toute pose, qu'elle atteigne le confort
    // ou non. Le mode compact REMPLACE l'objectif de confort par son
    // inverse (plus bas), il ne s'y ajoute pas. La cible, elle, reste
    // poursuivie : viser en dessous du raisonnable n'est pas ce que compact
    // demande, seulement renoncer au superflu.
    var compactActive = Boolean(plan.options && plan.options.priorities &&
      plan.options.priorities.indexOf('compact') >= 0);
    var targetWeight = preferencesDisabled ? 0
      : valeurCanonique(USAGE_TARGET_MISS_VALUE_ID, USAGE_TARGET_MISS_WEIGHT_FALLBACK);
    var comfortWeight = (preferencesDisabled || compactActive) ? 0
      : valeurCanonique(USAGE_COMFORT_MISS_VALUE_ID, USAGE_COMFORT_MISS_WEIGHT_FALLBACK);
    var targetMissed = clearanceTotals.targetRequired - clearanceTotals.targetMet;
    var comfortMissed = clearanceTotals.comfortRequired - clearanceTotals.comfortMet;
    var targetCost = round(targetMissed * targetWeight, 2);
    var comfortCost = round(comfortMissed * comfortWeight, 2);
    plan.preferenceObjective = {
      method: 'declared-clearance-fixed-placement-v1',
      targetRequired: clearanceTotals.targetRequired,
      targetMet: clearanceTotals.targetMet,
      targetMissed: targetMissed,
      targetCost: targetCost,
      targetValueId: USAGE_TARGET_MISS_VALUE_ID,
      comfortRequired: clearanceTotals.comfortRequired,
      comfortMet: clearanceTotals.comfortMet,
      comfortMissed: comfortMissed,
      comfortCost: comfortCost,
      comfortValueId: USAGE_COMFORT_MISS_VALUE_ID
    };
    plan.scoreBreakdown = plan.scoreBreakdown || {};
    delete plan.scoreBreakdown.usageTarget;
    delete plan.scoreBreakdown.usageComfort;
    if (targetCost > 0) plan.scoreBreakdown.usageTarget = targetCost;
    if (comfortCost > 0) plan.scoreBreakdown.usageComfort = comfortCost;

    // PONDERATION §3.1 et §3.2 — actifs seulement en mode compact, sur des
    // totaux que la boucle ci-dessus vient de calculer pour d'autres raisons :
    // aucune donnée nouvelle n'est demandée au moteur, seulement un jugement
    // inverse de celui que targetCost/comfortCost portent déjà en mode normal.
    var compact = compactActive && !preferencesDisabled;
    var oversizeWeight = compact
      ? valeurCanonique('VAL-SCORE-COMPACT-OVERSIZE-WEIGHT-001', 6) : 0;
    var compactComfortWeight = compact
      ? valeurCanonique('VAL-SCORE-COMPACT-COMFORT-WEIGHT-001', 2) : 0;
    var oversizeCost = round(oversizedCount * oversizeWeight, 2);
    var compactComfortCost = round(clearanceTotals.comfortMet * compactComfortWeight, 2);
    plan.compactObjective = {
      method: 'gamme-and-comfort-inverse-v1',
      active: compact,
      oversizedCount: oversizedCount,
      oversizeCost: oversizeCost,
      oversizeValueId: 'VAL-SCORE-COMPACT-OVERSIZE-WEIGHT-001',
      comfortAchieved: clearanceTotals.comfortMet,
      comfortCost: compactComfortCost,
      comfortValueId: 'VAL-SCORE-COMPACT-COMFORT-WEIGHT-001'
    };
    delete plan.scoreBreakdown.compactOversize;
    delete plan.scoreBreakdown.compactComfort;
    if (oversizeCost > 0) plan.scoreBreakdown.compactOversize = oversizeCost;
    if (compactComfortCost > 0) plan.scoreBreakdown.compactComfort = compactComfortCost;

    plan.score = round((plan.score || 0) + targetCost + comfortCost + oversizeCost + compactComfortCost, 2);
    return plan;
  }

  /* Chantier 6 §6.3 — tout ce qui suit la découpe : cession de circulation,
     décrochements, graphe, façades, portes, fenêtres et cheminement. C'était
     la queue de `generatePlan()`, et elle y est restée jusqu'à ce qu'un plan
     dessiné à la main doive emprunter le même aval.

     `faconner` distingue les deux usages, et c'est le seul écart : un plan
     posé à la main est déjà dessiné, lui appliquer la cession et les
     décrochements reviendrait à mesurer le moteur au lieu du plan. Le reste
     — graphe, façades, portes, parcours, rapport — est identique, sans quoi
     l'instrument ne testerait pas ce qu'il prétend tester. */
  function finaliserPlan(program, best, seed, variant, budget, faconner) {
    // La cession n'est appliquée qu'au candidat retenu : elle ne change pas
    // les adjacences — elle ne fait qu'agrandir des pièces déjà voisines —
    // et la faire dans la boucle coûterait le budget entier pour rien.
    var carved = best.boxes.map(function (room) {
      return Object.assign({}, room, {
        parts: room.parts && room.parts.length
          ? room.parts.map(function (part) { return Object.assign({}, part); })
          : [{ role: 'main', x0: room.x0, y0: room.y0, x1: room.x1, y1: room.y1 }]
      });
    });
    var cappedTransfers = faconner ? transfererSurplusPlafonne(carved, program.desiredEdges) : 0;
    var carving = faconner ? carveCirculation(carved) : null;
    // Puis les décrochements entre pièces mitoyennes, pour sortir du tout
    // rectangle. Bornés : au-delà, un plan devient illisible.
    var shaping = faconner === true
      ? shapeRooms(carved, best.edges, randomFrom(seed ^ 0x9E3779B9), Math.max(2, Math.round(carved.length / 1.6)))
      : null;
    // M2 — la surface demandée est habitable, pas une surface abstraite de
    // partition. Une homothétie conserve la topologie choisie par le moteur
    // et ajoute juste la matière nécessaire aux cloisons intérieures. Les
    // murs extérieurs se développent ensuite vers l'extérieur.
    /* La surface visée peut s'écarter de la demande dans la marge : c'est elle
       que la construction doit servir, pas la demande nue. */
    var surfaceVisee = Number.isFinite(program.surfaceVisee)
      ? program.surfaceVisee
      : program.options.surface;
    var fitted = root.TechnoHabConstruction.fitHabitable(
      carved,
      surfaceVisee,
      program.construction
    );
    carved = fitted.rooms;
    var construction = fitted.construction;
    var finalEnvelope = scaleEnvelope(best.enveloppe, fitted.scale);
    // Le graphe est relu sur la géométrie finale, parties comprises.
    var finalEdges = edgesFromParts(carved);
    // La façade et l'extérieur, calculés sur la géométrie finale : le
    // décrochement d'une pièce peut lui donner ou lui retirer du bord.
    var facades = facadeSegments(carved, finalEnvelope);
    var exterieur = edgesToExterior(facades);
    var placedOpenings = [];
    var portes = poserPortes(carved, program.desiredEdges, construction.walls, placedOpenings);
    var entree = poserEntree(carved, construction.walls, placedOpenings);
    var fenetres = poserFenetres(carved, construction.walls, placedOpenings);
    var openingResult = root.TechnoHabConstruction.reserveOpenings(
      construction.walls,
      portes.concat(entree ? [entree] : [], fenetres)
    );
    portes = portes.filter(function (door) { return Boolean(door.reservationId); });
    if (entree && !entree.reservationId) entree = null;
    fenetres = fenetres.filter(function (windowOpening) { return Boolean(windowOpening.reservationId); });
    construction.diagnostics.rejectedOpenings = openingResult.rejected;
    var roomPlans = carved.map(function (room) {
      var parts = room.parts.map(function (part) {
        return { role: part.role, x0: round(part.x0), y0: round(part.y0), x1: round(part.x1), y1: round(part.y1) };
      });
      var bounds = partsBounds(parts);
      var usableGeometry = construction.rooms[room.id];
      var legacyUsable = unionEstRectangle(parts) ? bounds : parts[0];
      return {
        id: room.id, type: room.type, label: room.label,
        variant: roomVariant(room) || undefined,
        composedWith: room.composedWith ? room.composedWith.slice() : undefined,
        minArea: room.minArea, minSide: room.minSide, targetArea: room.targetArea,
        area: usableGeometry.usableArea,
        usableArea: usableGeometry.usableArea,
        partitionArea: round(partsArea(parts)),
        usablePolygon: usableGeometry.usablePolygon,
        usableBounds: usableGeometry.usableBounds,
        wallFaces: root.TechnoHabConstruction.facesForRoom(room.id, construction.walls),
        storageArea: round(partsArea(parts.filter(function (p) { return p.role === 'storage'; }))),
        edgeCount: countEdges(parts),
        parts: parts,
        // Contrat historique conservé pour les anciens exports. Les calculs
        // M4 prennent `usableBounds` et `usablePolygon`, jamais cet alias.
        usableRect: { x0: legacyUsable.x0, y0: legacyUsable.y0, x1: legacyUsable.x1, y1: legacyUsable.y1 },
        x0: bounds.x0, y0: bounds.y0, x1: bounds.x1, y1: bounds.y1
      };
    });
    /* M4 calcule le seul parcours qui fasse foi après la pose du mobilier.
       Garder ici le parcours vide doublerait le maillage pour jeter aussitôt
       son résultat. Le repli demeure pour les instruments qui chargent le
       générateur sans le solveur de placement. */
    var parcours = root.TechnoHabPlacement ? null
      : cheminement(roomPlans, portes, entree, finalEnvelope.width, finalEnvelope.height,
        null, construction.walls, openingResult.reservations);
    var circulationObjective = circulationDesserteMetrics(roomPlans, finalEdges, program.desiredEdges);
    var entreeSurCirculation = Boolean(entree && roomPlans.some(function (room) {
      return room.type === 'circulation' && (entree.entre || []).indexOf(room.id) !== -1;
    }));
    var facadeObjective = circulationFacadeMetrics(roomPlans, finalEnvelope, entreeSurCirculation);
    var branchObjective = circulationBranchUtilityMetrics(roomPlans, portes, entree);
    circulationObjective.area = round(roomPlans.filter(function (room) { return room.type === 'circulation'; })
      .reduce(function (sum, room) { return sum + room.area; }, 0), 2);
    circulationObjective.share = round(circulationObjective.area / Math.max(0.01, surfaceVisee), 4);
    circulationObjective.pathMean = parcours && parcours.desserte ? parcours.desserte.mean : null;
    circulationObjective.pathMax = parcours && parcours.desserte ? parcours.desserte.max : null;
    circulationObjective.ruleStatus = 'SUSPENDED_M3_0_AWAITING_EXTERNAL_CORPUS';
    circulationObjective.facadeMethod = facadeObjective.method;
    circulationObjective.facadeLength = facadeObjective.length;
    circulationObjective.entryFacadeAllowance = facadeObjective.entryAllowance;
    circulationObjective.facadeExcess = facadeObjective.excess;
    circulationObjective.facadeCost = facadeObjective.cost;
    circulationObjective.facadeCostValueId = facadeObjective.valueId;
    circulationObjective.branchMethod = branchObjective.method;
    circulationObjective.armCount = branchObjective.armCount;
    circulationObjective.emptyArmCount = branchObjective.emptyArmCount;
    circulationObjective.deadLength = branchObjective.deadLength;
    circulationObjective.deadLengthCost = branchObjective.cost;
    circulationObjective.deadLengthCostValueId = branchObjective.valueId;
    circulationObjective.arms = branchObjective.arms;
    circulationObjective.terminationMethod = best.topologyTerminationMethod || 'none';
    circulationObjective.terminationCount = (best.topologyTerminations || []).length;
    circulationObjective.terminationReceivers = (best.topologyTerminations || []).map(function (termination) {
      return termination.receiver;
    });

    var finalScoreBreakdown = Object.assign({}, best.scoreBreakdown || {});
    if (branchObjective.cost > 0) finalScoreBreakdown.circulationDeadLength = branchObjective.cost;
    return {
      schemaVersion: CURRENT_SCHEMA_VERSION,
      schema: 'PLAN_SCHEMA.json', generator: 'technohab-local-graph-2d', variant: variant || 1,
      seed: encodeSeed(seed), seedValue: seed >>> 0,
      candidate: best.attempt + 1, budget: budget, score: round(best.score + branchObjective.cost, 2),
      scoreBreakdown: Object.keys(finalScoreBreakdown).reduce(function (result, key) {
        result[key] = round(finalScoreBreakdown[key], 2); return result;
      }, {}),
      hardCandidatesRejected: 0,
      topologyTerminationMethod: best.topologyTerminationMethod || 'none',
      topologyTerminations: (best.topologyTerminations || []).map(function (termination) {
        return Object.assign({}, termination);
      }),
      circulationObjective: circulationObjective,
      usageObjective: {
        cost: round(best.usageCost || 0, 2),
        candidatesCompared: best.usageCandidatesCompared || 0,
        validator: 'placement.validate',
        cacheScope: 'rectangle-only'
      },
      boundary: {
        /* L'aire de référence est la surface RÉELLEMENT servie, non la demande
           nue. Depuis que le plan s'autorise une marge, les deux diffèrent —
           et `TH2D-RESERVE-001`, qui compare la somme des pièces à cette aire,
           signalait une réserve fantôme sur tout plan tombant hors de la
           demande au centimètre. La demande reste lisible dans
           `surfaceDemandee` ; c'est à `TH2D-PROJECT-001` de juger l'écart. */
        width: round(finalEnvelope.width), height: round(finalEnvelope.height), area: round(surfaceVisee, 2),
        partitionArea: construction.metrics.partitionArea,
        grossFloorArea: construction.metrics.grossFloorArea,
        // La forme et ses volumes voyagent avec le plan : le rendu, les règles
        // d'enveloppe et le cheminement en ont tous besoin (chantier 1).
        shape: finalEnvelope.shape,
        // Forme demandée et forme obtenue peuvent différer : sous une certaine
        // surface, un L ou un U n'a plus d'aile habitable.
        demandee: finalEnvelope.demandee || finalEnvelope.shape,
        degradee: Boolean(finalEnvelope.degradee),
        volumes: finalEnvelope.volumes.map(function (v) {
          return { x0: v.x, y0: v.y, x1: round(v.x + v.width), y1: round(v.y + v.height) };
        })
      },
      options: program.options,
      classification: classificationLogement(program.options.surface, program.options.bedrooms),
      construction: construction.settings,
      constructionBounds: root.TechnoHabConstruction.constructionBounds(construction.walls),
      walls: construction.walls, wallDiagnostics: construction.diagnostics,
      reservations: openingResult.reservations,
      targetHabitableArea: construction.metrics.targetHabitableArea,
      // Ce que l'utilisateur a demandé, et la latitude qu'on s'autorise.
      surfaceDemandee: program.options.surface,
      surfaceVisee: round(surfaceVisee, 2),
      margeSurface: MARGE_SURFACE,
      habitableArea: construction.metrics.habitableArea,
      wallArea: construction.metrics.wallArea,
      grossFloorArea: construction.metrics.grossFloorArea,
      partitionArea: construction.metrics.partitionArea,
      surfaceConservationError: construction.metrics.conservationError,
      surfaceCoverageError: construction.metrics.surfaceCoverageError,
      habitableTargetError: construction.metrics.targetError,
      constructionScale: round(fitted.scale, 6),
      minimumRequiredArea: program.minimumTotal,
      minCirculationWidth: SIMPLE_CIRCULATION_WIDTH,
      crossingCirculationWidth: MIN_CIRCULATION_WIDTH,
      circulationCrossingServices: CIRCULATION_CROSSING_SERVICES,
      minDesserte: MIN_DESSERTE, maxCirculationWidth: MAX_CIRCULATION_WIDTH,
      minStorageDepth: MIN_STORAGE_DEPTH, maxStorageDepthRatio: MAX_STORAGE_DEPTH_RATIO,
      carving: carving, shaping: shaping, cappedTransfers: cappedTransfers,
      maxEdges: 6,
      rooms: roomPlans,
      facades: facades, portes: portes, entree: entree, fenetres: fenetres, parcours: parcours,
      passageLibre: PASSAGE_LIBRE,
      requestedEdges: program.desiredEdges,
      adjacencyRequirements: program.adjacencies || program.desiredEdges,
      // L'extérieur est un nœud comme un autre : les arêtes de façade
      // rejoignent le graphe au lieu de vivre à côté.
      edges: finalEdges.concat(exterieur)
    };
  }

  /* D2 — contour extérieur d'un ensemble de rectangles à axes alignés.
     Une pièce est une pièce : elle se dessine d'un seul trait, sans le refend
     que laissait un rectangle par partie.

     Méthode : les abscisses et ordonnées présentes découpent un damier ; une
     cellule appartient à la pièce si une partie la couvre ; une arête de
     cellule est au contour si sa voisine n'y appartient pas. Il ne reste qu'à
     chaîner ces arêtes. Peu de cellules — deux ou trois parties — donc le
     coût est négligeable devant la découpe elle-même. */
  function contourParties(parts) {
    if (!parts || !parts.length) return [];
    var xs = [], ys = [];
    parts.forEach(function (part) {
      if (xs.indexOf(part.x0) < 0) xs.push(part.x0);
      if (xs.indexOf(part.x1) < 0) xs.push(part.x1);
      if (ys.indexOf(part.y0) < 0) ys.push(part.y0);
      if (ys.indexOf(part.y1) < 0) ys.push(part.y1);
    });
    xs.sort(function (a, b) { return a - b; });
    ys.sort(function (a, b) { return a - b; });

    function couverte(i, j) {
      if (i < 0 || j < 0 || i >= xs.length - 1 || j >= ys.length - 1) return false;
      var cx = (xs[i] + xs[i + 1]) / 2, cy = (ys[j] + ys[j + 1]) / 2;
      return parts.some(function (part) {
        return cx > part.x0 && cx < part.x1 && cy > part.y0 && cy < part.y1;
      });
    }

    // Arêtes orientées : le contour extérieur tourne dans un sens, un trou
    // dans l'autre. L'orientation vient du côté plein de l'arête.
    var aretes = [];
    for (var i = 0; i < xs.length - 1; i += 1) {
      for (var j = 0; j < ys.length - 1; j += 1) {
        if (!couverte(i, j)) continue;
        if (!couverte(i, j - 1)) aretes.push([xs[i], ys[j], xs[i + 1], ys[j]]);
        if (!couverte(i + 1, j)) aretes.push([xs[i + 1], ys[j], xs[i + 1], ys[j + 1]]);
        if (!couverte(i, j + 1)) aretes.push([xs[i + 1], ys[j + 1], xs[i], ys[j + 1]]);
        if (!couverte(i - 1, j)) aretes.push([xs[i], ys[j + 1], xs[i], ys[j]]);
      }
    }

    var boucles = [];
    var cle = function (x, y) { return x.toFixed(4) + ',' + y.toFixed(4); };
    var restantes = aretes.slice();
    while (restantes.length) {
      var depart = restantes.shift();
      var boucle = [[depart[0], depart[1]], [depart[2], depart[3]]];
      var courant = cle(depart[2], depart[3]);
      var securite = restantes.length + 2;
      while (courant !== cle(depart[0], depart[1]) && securite > 0) {
        securite -= 1;
        var index = -1;
        for (var k = 0; k < restantes.length; k += 1) {
          if (cle(restantes[k][0], restantes[k][1]) === courant) { index = k; break; }
        }
        if (index < 0) break;
        var suivante = restantes.splice(index, 1)[0];
        boucle.push([suivante[2], suivante[3]]);
        courant = cle(suivante[2], suivante[3]);
      }
      boucles.push(boucle);
    }
    return boucles;
  }

  // Les points alignés sont retirés : un contour de pièce rectangulaire doit
  // avoir quatre sommets, pas les six que laisse le damier.
  function cheminContour(parts) {
    return contourParties(parts).map(function (boucle) {
      var points = boucle.slice(0, -1).filter(function (point, index, tous) {
        var avant = tous[(index - 1 + tous.length) % tous.length];
        var apres = tous[(index + 1) % tous.length];
        var alignéX = Math.abs(avant[0] - point[0]) < 0.0005 && Math.abs(apres[0] - point[0]) < 0.0005;
        var alignéY = Math.abs(avant[1] - point[1]) < 0.0005 && Math.abs(apres[1] - point[1]) < 0.0005;
        return !alignéX && !alignéY;
      });
      return 'M' + points.map(function (p) { return p[0] + ' ' + p[1]; }).join('L') + 'Z';
    }).join(' ');
  }

  /* Chantier 6 §6.3 — le test de l'instrument.

     Prend un plan *dessiné à la main* — une liste de rectangles nommés — et
     lui fait subir exactement ce que subit un plan produit par le moteur :
     mêmes portes, mêmes façades, même cheminement, donc même rapport de
     règles. C'est la condition pour que le verdict porte sur les critères et
     non sur la façon dont le plan est arrivé jusqu'à eux.

     Les métadonnées de programme — `minArea`, `minSide`, `targetArea`,
     `label` — viennent de `buildProgram()` et ne sont pas recopiées dans le
     plan de référence : elles sont dérivées des options, et les redonner à la
     main permettrait de dessiner un plan qui satisfait ses propres seuils.

     Un `id` du plan manuel qui ne correspond à aucune pièce du programme est
     une erreur, pas un cas limite : le rapport comparerait alors deux
     programmes différents. On échoue tout de suite et bruyamment. */
  /* Transforme des rectangles nommés en candidat prêt pour `finaliserPlan()`.
     Partagé par le plan dessiné à la main et par la typologie : tous deux
     posent leur géométrie au lieu de la chercher, et doivent emprunter
     exactement le même aval, sans quoi l'un mesurerait autre chose que
     l'autre. */
  function candidatDepuisPieces(program, pieces, meta) {
    meta = meta || {};
    var restants = {};
    program.rooms.forEach(function (room) { restants[room.id] = room; });

    var boxes = (pieces || []).map(function (piece) {
      var modele = restants[piece.id];
      if (!modele) {
        throw new Error('La pièce « ' + piece.id + ' » n’existe pas dans le programme (' +
          Object.keys(restants).join(', ') + ')');
      }
      delete restants[piece.id];
      var parts = (piece.parts && piece.parts.length ? piece.parts : [piece]).map(function (part) {
        return {
          role: part.role || 'main',
          x0: Math.min(part.x0, part.x1), y0: Math.min(part.y0, part.y1),
          x1: Math.max(part.x0, part.x1), y1: Math.max(part.y0, part.y1)
        };
      });
      var bounds = partsBounds(parts);
      return Object.assign({}, modele, {
        x0: bounds.x0, y0: bounds.y0, x1: bounds.x1, y1: bounds.y1, parts: parts
      });
    });

    var oubliees = Object.keys(restants);
    if (oubliees.length) {
      throw new Error('Le programme attend encore ' + oubliees.join(', ') +
        '. Un plan incomplet ne se compare à rien.');
    }

    // L'enveloppe est déduite du dessin, pas tirée au sort : le plan porte ses
    // propres dimensions, et une enveloppe calculée ne coïnciderait pas.
    var largeur = Math.max.apply(null, boxes.map(function (b) { return b.x1; }));
    var hauteur = Math.max.apply(null, boxes.map(function (b) { return b.y1; }));
    var volumes = meta.volumes && meta.volumes.length
      ? meta.volumes.map(function (v) { return volumeRect(v.x0, v.y0, v.x1 - v.x0, v.y1 - v.y0); })
      : [volumeRect(0, 0, largeur, hauteur)];
    var enveloppe = {
      width: largeur, height: hauteur, shape: meta.shape || 'rectangle', volumes: volumes,
      demandee: meta.demandee,
      degradee: Boolean(meta.degradee)
    };

    var edges = edgesFromParts(boxes);
    var scoreDetails = scoreCandidateDetails(boxes, edges, program, enveloppe);
    return {
      boxes: boxes, edges: edges,
      score: scoreDetails.total,
      scoreBreakdown: scoreDetails.breakdown,
      circulationObjective: scoreDetails.circulation,
      attempt: 0, width: largeur, height: hauteur, enveloppe: enveloppe
    };
  }

  function assemblerPlan(rawOptions, pieces, meta) {
    var program = buildProgram(rawOptions);
    meta = meta || {};
    var best = rankCandidatesWithUsage([candidatDepuisPieces(program, pieces, meta)], 1)[0];
    var plan = finaliserPlan(program, best, 0, meta.variant || 1, 1, false);
    // Un plan dessiné à la main n'a pas de graine : lui en inventer une
    // laisserait croire qu'il se rejoue, alors qu'il se relit.
    plan.seed = null;
    plan.seedValue = null;
    plan.generator = meta.generator || 'technohab-plan-manuel';
    plan.source = meta.source || 'manuel';
    plan.topologyStrategy = 'manuel';
    plan.topologyFamily = 'manuel';
    plan.topologyBranches = plan.rooms.filter(function (room) { return room.type === 'circulation'; })
      .reduce(function (sum, room) { return sum + (room.parts || []).length; }, 0);
    plan.topologyTransform = 'r0';
    plan.topologyEquivalenceClass = 'manuel';
    plan.topologyTransformationsAvailable = 1;
    plan.topologyTerminationMethod = 'none';
    plan.topologyTerminations = [];
    plan.topologyCandidatesCompared = 1;
    plan.topologyStrategiesCompared = ['manuel'];
    return attachContractMetadata(validatePlanUsage(plan), program);
  }

  /* M1 — API honnête de génération.

     `generatePlan()` reste le raccourci historique qui rend un plan ou lève
     une exception. Cette API nomme chaque frontière et ne confond plus une
     impossibilité prouvée, une recherche épuisée et un plan construit que le
     juge invalide. `runtime` sert aux tests isolés des statuts ; le produit
     utilise les dépendances globales chargées par index.html. */
  function generateResult(rawOptions, variant, requestedSeed, runtime) {
    var contracts = root.TechnoHabContracts;
    if (!contracts) {
      throw generationError('DEPENDENCY_MISSING',
        'generateResult : TechnoHabContracts doit être chargé avant le générateur.');
    }
    runtime = runtime || {};
    var normalized = normalizeOptions(rawOptions);
    var intent = contracts.intent(normalized, variant, requestedSeed);
    var rawProgram;
    try {
      rawProgram = buildProgram(rawOptions);
    } catch (error) {
      return contracts.generationResult({
        status: contracts.statuses.INVALIDE_DEBUG,
        intent: intent,
        failure: contracts.failure('PROGRAM_BUILD_FAILED', 'program', error.message)
      });
    }
    var programProfiles = contracts.profileManifest(rawProgram);
    var program = contracts.program(rawProgram, programProfiles);

    // Seule impossibilité déclarée ici : la somme des planchers fonctionnels
    // excède même la borne haute de la marge autorisée. Elle est prouvée avant
    // toute géométrie ; les
    // autres échecs restent NON_TROUVE tant qu'aucun solveur ne les prouve.
    var maximumAllowedArea = normalized.surface * (1 + MARGE_SURFACE);
    if (rawProgram.minimumTotal > maximumAllowedArea + 0.005) {
      return contracts.generationResult({
        status: contracts.statuses.IMPOSSIBLE,
        intent: intent,
        program: program,
        failure: contracts.failure('MINIMUM_AREA_EXCEEDS_INTENT', 'program',
          'Les planchers du programme dépassent même la surface maximale autorisée.', {
            minimumArea: rawProgram.minimumTotal,
            requestedArea: normalized.surface,
            maximumAllowedArea: round(maximumAllowedArea, 2)
          })
      });
    }

    var plan;
    try {
      plan = (runtime.generatePlan || generatePlan)(rawOptions, variant, requestedSeed);
    } catch (error) {
      var exhausted = error && error.code === 'NON_TROUVE';
      return contracts.generationResult({
        status: exhausted ? contracts.statuses.NON_TROUVE : contracts.statuses.INVALIDE_DEBUG,
        intent: intent,
        program: program,
        failure: contracts.failure(exhausted ? 'STRATEGIES_EXHAUSTED' : (error.code || 'GENERATION_FAILED'),
          exhausted ? 'topology' : 'generation', error && error.message ? error.message : String(error))
      });
    }

    var profiles = contracts.profileManifest(rawProgram, plan);
    attachContractMetadata(plan, rawProgram);
    var candidate = contracts.topologyCandidate(plan, plan.topologyStrategy);
    var built = contracts.builtPlan(plan, profiles);
    var evaluate = runtime.evaluate || (root.TechnoHabRules && root.TechnoHabRules.evaluatePlan);
    if (!evaluate) {
      return contracts.generationResult({
        status: contracts.statuses.INVALIDE_DEBUG,
        intent: intent, program: program, topologyCandidate: candidate, builtPlan: built,
        failure: contracts.failure('VERDICT_UNAVAILABLE', 'verdict',
          'Aucun juge n’est chargé : le plan construit ne peut pas être déclaré valide.')
      });
    }
    var report;
    try {
      report = evaluate(plan);
    } catch (error) {
      return contracts.generationResult({
        status: contracts.statuses.INVALIDE_DEBUG,
        intent: intent, program: program, topologyCandidate: candidate, builtPlan: built,
        failure: contracts.failure('VERDICT_FAILED', 'verdict', error.message)
      });
    }
    var judged = contracts.verdict(report);
    return contracts.generationResult({
      status: judged.valid ? contracts.statuses.VALID : contracts.statuses.INVALIDE_DEBUG,
      intent: intent,
      program: program,
      topologyCandidate: candidate,
      builtPlan: built,
      verdict: judged,
      failure: judged.valid ? null : contracts.failure('HARD_VIOLATION', 'verdict',
        'Le plan construit porte une ou plusieurs violations bloquantes.', { hard: judged.hard })
    });
  }

  function deriveResolutionSeed(baseSeed, levelIndex, attemptIndex) {
    if (levelIndex === 0 && attemptIndex === 0) return baseSeed >>> 0;
    return (baseSeed
      + Math.imul(levelIndex + 1, 0x9E3779B1)
      + Math.imul(attemptIndex + 1, 0x85EBCA77)) >>> 0;
  }

  /* M5.2c — orchestration bornée de la résolution graduée.

     Chaque candidat de la politique repasse par generateResult() : Program,
     profils, poseurs et verdict sont donc reconstruits par le chemin normal.
     Trois NON_TROUVE épuisent un niveau ; IMPOSSIBLE le saute immédiatement ;
     INVALIDE_DEBUG arrête la chaîne afin qu'une panne ne soit jamais maquillée
     en programme utilisateur trop ambitieux. */
  function resolveProgram(rawOptions, variant, requestedSeed, runtime) {
    var contracts = root.TechnoHabContracts;
    var relaxation = root.TechnoHabRelaxation;
    if (!contracts || !contracts.programResolution || !relaxation) {
      throw generationError('DEPENDENCY_MISSING',
        'resolveProgram : contrats 1.1 et politique de résolution doivent être chargés.');
    }
    runtime = runtime || {};
    var firstVariant = Number.isFinite(variant) ? variant : 1;
    var normalized = normalizeOptions(rawOptions);
    var baseSeed = Number.isFinite(requestedSeed)
      ? requestedSeed >>> 0
      : hash(JSON.stringify(normalized) + ':resolution-v1:' + firstVariant);
    var requestedIntent = contracts.intent(normalized, firstVariant, requestedSeed);
    var requestedRawProgram = buildProgram(rawOptions);
    var requestedProgram = contracts.program(requestedRawProgram,
      contracts.profileManifest(requestedRawProgram));
    // Les options imposées par une typologie (studio notamment) sont déjà
    // effectives à R0. Les réinjecter évite de tracer comme concession M5.2
    // une fusion que le programme exact avait déjà réalisée.
    var policyOptions = Object.assign({}, rawOptions || {}, requestedRawProgram.options);
    var candidates = relaxation.candidates(policyOptions, runtime.relaxationContext);
    var attempts = [];
    var runGeneration = runtime.generateResult || generateResult;

    for (var levelOffset = 0; levelOffset < candidates.length; levelOffset += 1) {
      var candidate = candidates[levelOffset];
      var levelIndex = relaxation.levels.indexOf(candidate.level);
      for (var attemptIndex = 0; attemptIndex < relaxation.attemptsPerLevel; attemptIndex += 1) {
        var attemptVariant = firstVariant + attemptIndex;
        var attemptSeed = deriveResolutionSeed(baseSeed, levelIndex, attemptIndex);
        var result = runGeneration(candidate.options, attemptVariant, attemptSeed, runtime);
        if (!result || Object.values(contracts.statuses).indexOf(result.status) < 0) {
          throw generationError('INVALID_GENERATION_RESULT',
            'resolveProgram : une tentative ne porte pas de statut M1 connu.');
        }
        attempts.push({
          level: candidate.level,
          variant: attemptVariant,
          seed: attemptSeed,
          status: result.status,
          failureCode: result.failure ? result.failure.code : null
        });

        if (result.status === contracts.statuses.VALID) {
          return contracts.programResolution({
            status: candidate.level === 'R0_EXACT'
              ? contracts.resolutionStatuses.EXACT : contracts.resolutionStatuses.RELAXED,
            requestedIntent: requestedIntent,
            requestedProgram: requestedProgram,
            resolvedIntent: result.intent,
            resolvedProgram: result.program,
            level: candidate.level,
            changes: candidate.changes,
            attempts: attempts,
            result: result
          });
        }
        if (result.status === contracts.statuses.INVALIDE_DEBUG) {
          return contracts.programResolution({
            status: contracts.resolutionStatuses.UNRESOLVED,
            requestedIntent: requestedIntent,
            requestedProgram: requestedProgram,
            resolvedIntent: null,
            resolvedProgram: null,
            level: null,
            changes: [],
            attempts: attempts,
            result: null
          });
        }
        if (result.status === contracts.statuses.IMPOSSIBLE) break;
      }
    }

    return contracts.programResolution({
      status: contracts.resolutionStatuses.UNRESOLVED,
      requestedIntent: requestedIntent,
      requestedProgram: requestedProgram,
      resolvedIntent: null,
      resolvedProgram: null,
      level: null,
      changes: [],
      attempts: attempts,
      result: null
    });
  }

  function comparisonSignature(plan) {
    var graph = (plan.edges || []).filter(function (edge) {
      return edge.a !== 'exterior' && edge.b !== 'exterior' && (edge.contact || 0) > 0.02;
    }).map(function (edge) {
      return [edge.a, edge.b].sort().join('~');
    }).sort().join(',');
    return [plan.topologyFamily || 'none', plan.topologyEquivalenceClass || 'none', graph].join('|');
  }

  /* M5 — produit une décision comparable, pas trois appels sans relation.
     Le score choisit le premier plan. Les rangs suivants favorisent ensuite
     une famille puis une stratégie encore absentes, avant de revenir au
     score : cette diversité est une politique de présentation explicite, pas
     une prime cachée dans la qualité architecturale. */
  function buildSelection(rawOptions, variant, requestedSeed, requestedCount, runtime, initialResults, runGeneration) {
    var contracts = root.TechnoHabContracts;
    if (!contracts || !contracts.planSelection) {
      throw generationError('DEPENDENCY_MISSING',
        'generateSelection : le contrat PlanSelection doit être chargé.');
    }
    var requested = Math.max(1, Math.min(5, Math.round(requestedCount || 3)));
    var firstVariant = Number.isFinite(variant) ? variant : 1;
    var baseSeed = Number.isFinite(requestedSeed)
      ? requestedSeed >>> 0
      : hash(JSON.stringify(normalizeOptions(rawOptions)) + ':selection:' + firstVariant);
    var attemptBudget = Math.max(8, requested * 4);
    var pool = [], seen = {}, rejected = {};
    var reused = Array.isArray(initialResults) ? initialResults.slice(0, 1) : [];
    reused.forEach(function (result) {
      if (!result || result.status !== contracts.statuses.VALID || !result.builtPlan || !result.verdict.valid) {
        throw generationError('INVALID_INITIAL_RESULT',
          'buildSelection : le résultat réemployé doit être VALID.');
      }
      var signature = comparisonSignature(result.builtPlan.plan);
      seen[signature] = true;
      pool.push({ result: result, signature: signature });
    });
    // En mode unitaire, resolveSelection a déjà payé et validé le premier
    // plan. Ne pas lancer silencieusement sept candidats supplémentaires.
    if (requested === 1 && reused.length) attemptBudget = 1;
    var generatedAttempts = 0;
    for (var attempt = reused.length; attempt < attemptBudget; attempt += 1) {
      var seed = attempt === 0 ? baseSeed
        : (baseSeed ^ Math.imul(attempt, 0x9E3779B1)) >>> 0;
      var result = runGeneration(rawOptions, firstVariant + attempt, seed, runtime);
      generatedAttempts += 1;
      if (result.status !== contracts.statuses.VALID) {
        rejected[result.status] = (rejected[result.status] || 0) + 1;
        continue;
      }
      var signature = comparisonSignature(result.builtPlan.plan);
      if (seen[signature]) {
        rejected.DUPLICATE = (rejected.DUPLICATE || 0) + 1;
        continue;
      }
      seen[signature] = true;
      pool.push({ result: result, signature: signature });
    }

    var selected = [], usedFamilies = {}, usedStrategies = {};
    while (pool.length && selected.length < requested) {
      pool.sort(function (a, b) {
        if (!selected.length) return a.result.builtPlan.plan.score - b.result.builtPlan.plan.score;
        var aFamily = usedFamilies[a.result.builtPlan.plan.topologyFamily] ? 0 : 1;
        var bFamily = usedFamilies[b.result.builtPlan.plan.topologyFamily] ? 0 : 1;
        if (aFamily !== bFamily) return bFamily - aFamily;
        var aStrategy = usedStrategies[a.result.builtPlan.plan.topologyStrategy] ? 0 : 1;
        var bStrategy = usedStrategies[b.result.builtPlan.plan.topologyStrategy] ? 0 : 1;
        if (aStrategy !== bStrategy) return bStrategy - aStrategy;
        return a.result.builtPlan.plan.score - b.result.builtPlan.plan.score;
      });
      var choice = pool.shift();
      selected.push(choice);
      usedFamilies[choice.result.builtPlan.plan.topologyFamily] = true;
      usedStrategies[choice.result.builtPlan.plan.topologyStrategy] = true;
    }
    selected.forEach(function (choice, index) {
      choice.result.builtPlan.plan.comparison = {
        rank: index + 1,
        signature: choice.signature,
        method: 'score-then-family-strategy-diversity-v1'
      };
    });
    var results = selected.map(function (choice) { return choice.result; });
    var status = results.length === requested ? 'COMPLETE' : results.length ? 'PARTIAL' : 'EMPTY';
    return {
      generatedAttempts: generatedAttempts,
      selection: contracts.planSelection({
        status: status,
        requested: requested,
        method: 'score-then-family-strategy-diversity-v1',
        attempts: attemptBudget,
        results: results,
        rejected: rejected,
        diversity: {
          signatures: results.length,
          families: Object.keys(usedFamilies).sort(),
          strategies: Object.keys(usedStrategies).sort()
        }
      })
    };
  }

  function generateSelection(rawOptions, variant, requestedSeed, requestedCount, runtime) {
    runtime = runtime || {};
    return buildSelection(rawOptions, variant, requestedSeed, requestedCount, runtime, [],
      runtime.selectionGenerateResult || generateResult).selection;
  }

  /* M5.2d — la résolution et la comparaison partagent le premier résultat.

     Le budget M5 reste identique, mais l'appel VALID déjà payé par M5.2c
     occupe la première place du pool. Les autres plans sont reconstruits avec
     les options réellement résolues, jamais avec la demande non concédée. */
  function resolveSelection(rawOptions, variant, requestedSeed, requestedCount, runtime) {
    var contracts = root.TechnoHabContracts;
    if (!contracts || !contracts.resolvedSelection) {
      throw generationError('DEPENDENCY_MISSING',
        'resolveSelection : le contrat ResolvedSelection doit être chargé.');
    }
    runtime = runtime || {};
    var runResolution = runtime.resolveProgram || resolveProgram;
    var resolution = runResolution(rawOptions, variant, requestedSeed, runtime);
    if (resolution.status === contracts.resolutionStatuses.UNRESOLVED) {
      return contracts.resolvedSelection({
        resolution: resolution,
        selection: null,
        reusedResult: false,
        generatedAttempts: 0
      });
    }

    var resolvedOptions = Object.assign({}, rawOptions || {}, resolution.resolvedProgram.options, {
      construction: resolution.resolvedProgram.construction
    });
    resolution.changes.forEach(function (item) { resolvedOptions[item.field] = item.to; });
    var selectionBuild = buildSelection(
      resolvedOptions,
      resolution.result.intent.variant,
      resolution.result.intent.seed,
      requestedCount,
      runtime,
      [resolution.result],
      runtime.selectionGenerateResult || generateResult
    );
    return contracts.resolvedSelection({
      resolution: resolution,
      selection: selectionBuild.selection,
      reusedResult: true,
      generatedAttempts: selectionBuild.generatedAttempts
    });
  }

  function exportDocument(plan, rulesReport, appVersion, programResolution) {
    return {
      $schema: './PLAN_SCHEMA.json',
      schemaVersion: CURRENT_SCHEMA_VERSION,
      appVersion: appVersion || null,
      exportedAt: new Date().toISOString(),
      plan: plan,
      rulesReport: rulesReport || null,
      programResolution: programResolution || null
    };
  }

  function readExportDocument(document) {
    if (!document || typeof document !== 'object') throw new TypeError('Export TechnoHab illisible.');
    var plan = document.plan || document;
    if (!plan.rooms || !plan.boundary) throw new TypeError('Export TechnoHab incomplet : plan, pièces ou emprise absents.');
    return {
      schemaVersion: document.schemaVersion || plan.schemaVersion || 'legacy',
      plan: plan,
      rulesReport: document.rulesReport || null,
      programResolution: document.programResolution || null,
      legacy: !(document.schemaVersion || plan.schemaVersion)
    };
  }

  root.TechnoHabGenerator = {
    buildProgram: buildProgram, generatePlan: generatePlan, generateResult: generateResult,
    resolveProgram: resolveProgram, generateSelection: generateSelection,
    resolveSelection: resolveSelection,
    allocateTargetAreas: allocateTargetAreas,
    // Instruments M3.0 : le banc et les tests lisent la même décomposition
    // que la recherche, sans recopier le barème dans les scripts.
    scoreCandidateDetails: scoreCandidateDetails,
    circulationDesserteMetrics: circulationDesserteMetrics,
    normalizeOptions: normalizeOptions,
    classificationLogement: classificationLogement,
    // Chantier 6 §6.3 — un plan posé à la main passe par le même aval que
    // les plans générés, sinon le test de l'instrument ne teste rien.
    assemblerPlan: assemblerPlan,
    // Exposé pour le rendu : le contour est une propriété de la pièce, pas
    // une affaire de dessin (D2).
    cheminContour: cheminContour,
    /* Instrument public pour tester d'autres jeux d'obstacles. Le plan rendu
       porte déjà le parcours avec les poses canoniques retenues par M4. */
    cheminementAvecObstacles: function (plan, obstacles) {
      return cheminement(plan.rooms, plan.portes || [], plan.entree,
        plan.boundary.width, plan.boundary.height, obstacles,
        plan.walls || [], plan.reservations || []);
    },
    exportDocument: exportDocument,
    readExportDocument: readExportDocument,
    schemaVersion: CURRENT_SCHEMA_VERSION,
    /* `definitions` a été retiré avec la table qu'il exposait : la définition
       des pièces se lit désormais dans `TechnoHabFit.envelopes`, compilée
       depuis socle.data.js. Aucun appelant ne le consommait. */
    encodeSeed: encodeSeed, decodeSeed: decodeSeed,
    minCirculationWidth: SIMPLE_CIRCULATION_WIDTH,
    crossingCirculationWidth: MIN_CIRCULATION_WIDTH,
    circulationCrossingServices: CIRCULATION_CROSSING_SERVICES
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
