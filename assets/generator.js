(function (root) {
  'use strict';

  // `minSide` est la largeur en deçà de laquelle la pièce ne peut plus
  // recevoir ce qu'elle doit contenir. Elle se déduit du socle d'agencement
  // et non d'une convention : une chambre demande 1,90 m de lit plus 0,60 m
  // de dégagement, un séjour un canapé de 0,90 m plus 0,90 m de passage et
  // de quoi poser une table basse, une cuisine 0,60 m de plan de travail
  // plus 1,20 m de passage.
  var DEFINITIONS = {
    living: { label: 'Séjour', minArea: 20, minSide: 3.0, weight: 4.5 },
    bedroom: { label: 'Chambre', minArea: 9, minSide: 2.5, weight: 2.2 },
    bath: { label: 'Salle d’eau', minArea: 3, minSide: 1.7, weight: 1.2 },
    wc: { label: 'WC', minArea: 1.5, minSide: 0.9, weight: 0.55 },
    kitchen: { label: 'Cuisine', minArea: 7, minSide: 1.8, weight: 1.5 },
    circulation: { label: 'Circulation', minArea: 3, minSide: 1.2, weight: 0.8 }
  };

  /* --- Poids de répartition ------------------------------------------------
     Le poids décide de la part de surface distribuable qui revient à une
     pièce. Il était décrété — 4,5 pour le séjour, 0,55 pour le WC — sans que
     personne sache d'où venaient ces nombres.

     Il se déduit désormais de deux termes, l'un calculé, l'autre assumé :

       poids = aire du plus petit rectangle meublable × agrément

     Le premier vient du socle, par le solveur hors ligne : c'est le besoin
     réel de la pièce, et il suit automatiquement toute évolution des
     équipements. Le second dit combien un mètre carré supplémentaire profite
     à cette pièce — un séjour en tire du confort, un WC n'en tire rien.

     Ce n'est donc plus une convention opaque mais une convention **nommée**,
     et réduite à ce qu'aucun calcul ne tranchera : l'agrément.

     Les valeurs reproduisent l'agrément implicite des anciens poids, mesuré
     à 1,39 pour le séjour et 0,52 à 0,61 pour le reste. */
  var AGREMENT = {
    living: 1.4,        // le seul espace où le surplus devient de l'usage
    bedroom: 0.6,
    kitchen: 0.6,
    bath: 0.6,
    wc: 0.5,            // un WC plus grand n'apporte rien
    circulation: 0.6    // majoré ensuite par ce qu'il dessert
  };

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
      ? round(besoin * (AGREMENT[type] || 0.6), 2)
      : (DEFINITIONS[type] && DEFINITIONS[type].weight) || 1;   // repli hors socle
    return poidsCache[type];
  }

  // Largeur libre minimale d'une circulation, en mètres. Plus exigeant que le
  // référentiel d'origine (1 m) : voir ROADMAP §5 bis.
  var MIN_CIRCULATION_WIDTH = 1.2;
  // Au-delà, ce n'est plus une circulation mais une pièce : la surface passe
  // en volume perdu au lieu de s'allonger pour desservir.
  var MAX_CIRCULATION_WIDTH = 1.8;
  // Bornes d'un rangement. La profondeur maximale est corrélée à la longueur
  // pour qu'un rangement reste une bande et ne devienne jamais une pièce.
  var MIN_STORAGE_DEPTH = 0.45;
  var MAX_STORAGE_DEPTH_RATIO = 0.6;
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

  function normalizeOptions(input) {
    input = input || {};
    return {
      surface: Math.min(250, Math.max(35, Number(input.surface) || 75)),
      bedrooms: Math.min(5, Math.max(0, Math.trunc(Number(input.bedrooms) || 0))),
      bathrooms: Math.min(2, Math.max(1, Math.trunc(Number(input.bathrooms) || 1))),
      separateKitchen: Boolean(input.separateKitchen),
      includeWc: input.includeWc !== false,
      // Chantier 1 — la forme de l'enveloppe est une donnée du projet, pas un
      // sous-produit de la surface. Trois familles : primitive (carré,
      // rectangle), soustractive (L, U, un quartier retiré du rectangle
      // englobant), additive — celle-ci pas encore servie.
      shape: ['square', 'rectangle', 'lShape', 'uShape'].indexOf(input.shape) >= 0 ? input.shape : 'rectangle',
      priority: ['compact', 'light', 'economy'].indexOf(input.priority) >= 0 ? input.priority : 'compact'
    };
  }

  function createRoom(type, index) {
    var definition = DEFINITIONS[type];
    var numbered = type === 'bedroom' || type === 'bath';
    return {
      id: numbered ? type + '_' + index : type,
      type: type,
      label: numbered ? definition.label + ' ' + index : definition.label,
      minArea: definition.minArea,
      minSide: definition.minSide,
      // Déduit du socle, non plus décrété : voir AGREMENT.
      weight: poidsDe(type)
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
    return plus_petit ? plus_petit.w * plus_petit.h : DEFINITIONS[type].minArea;
  }

  function composeInto(room, type, label) {
    var addition = DEFINITIONS[type];
    if (!room || !addition) return room;
    room.label = label;
    room.minArea = round(Math.max(room.minArea, coutReel(room.type) + coutReel(type)), 2);
    room.minSide = Math.max(room.minSide, addition.minSide);
    // Le poids ne s'additionne pas. Il dit ce qu'un mètre carré *de plus*
    // apporte à la pièce, pas ce qu'elle doit contenir — ce besoin est déjà
    // porté par `minArea`. Le cumuler ferait deux fois la même demande, et
    // c'est mesuré : la salle d'eau cesse alors d'être meublable à 75 m².
    room.weight = Math.max(room.weight, poidsDe(type));
    room.composedWith = (room.composedWith || []).concat([type]);
    return room;
  }

  function buildProgram(rawOptions) {
    var options = normalizeOptions(rawOptions);
    var rooms = [createRoom('living')];
    var index;
    if (options.separateKitchen) rooms.push(createRoom('kitchen'));
    else composeInto(rooms[0], 'kitchen', 'Séjour avec cuisine ouverte');
    for (index = 1; index <= options.bedrooms; index += 1) rooms.push(createRoom('bedroom', index));
    for (index = 1; index <= options.bathrooms; index += 1) rooms.push(createRoom('bath', index));
    if (options.includeWc) rooms.push(createRoom('wc'));
    else composeInto(rooms.find(function (room) { return room.id === 'bath_1'; }), 'wc',
      options.bathrooms > 1 ? 'Salle d’eau 1 avec WC' : 'Salle d’eau avec WC');
    if (rooms.length >= 4) {
      // Une circulation qui dessert huit pièces n'est pas une circulation qui
      // en dessert deux : sa surface doit suivre ce qu'elle relie, sinon le
      // graphe demandé est géométriquement irréalisable (ROADMAP §3.2).
      var served = 1 + rooms.length - (options.separateKitchen ? 2 : 1);
      var corridor = createRoom('circulation');
      corridor.minArea = round(Math.max(corridor.minArea, MIN_CIRCULATION_WIDTH * served * 0.95), 2);
      corridor.weight = round(corridor.weight + served * 0.22, 2);
      corridor.serves = served;
      rooms.push(corridor);
    }

    var minimumTotal = rooms.reduce(function (sum, room) { return sum + room.minArea; }, 0);
    var distributable = Math.max(0, options.surface - minimumTotal);
    var totalWeight = rooms.reduce(function (sum, room) { return sum + room.weight; }, 0);
    var compression = minimumTotal > options.surface ? options.surface / minimumTotal : 1;
    var allocated = rooms.map(function (room) {
      var targetArea = minimumTotal > options.surface
        ? room.minArea * compression
        : room.minArea + distributable * (room.weight / totalWeight);
      return Object.assign({}, room, { targetArea: round(targetArea) });
    });
    var delta = round(options.surface - allocated.reduce(function (sum, room) { return sum + room.targetArea; }, 0));
    allocated.forEach(function (room) { room.targetArea = round(room.targetArea + delta * (room.weight / totalWeight)); });
    var residual = round(options.surface - allocated.reduce(function (sum, room) { return sum + room.targetArea; }, 0));
    var heaviest = allocated.reduce(function (a, b) { return b.weight > a.weight ? b : a; });
    heaviest.targetArea = round(heaviest.targetArea + residual);

    // Le créneau de la circulation reste volontairement généreux : c'est de
    // ce surplus que naissent les rangements, et un couloir étroit dès
    // l'allocation touche moins de pièces, donc dessert moins bien.
    // Mesuré : le plafonner dégrade les adjacences plus qu'il ne réduit la
    // largeur, la cession géométrique fait mieux le travail.

    var hasCirculation = allocated.some(function (room) { return room.id === 'circulation'; });
    var hub = hasCirculation ? 'circulation' : 'living';
    var desiredEdges = [];
    if (hasCirculation) desiredEdges.push({ a: 'living', b: 'circulation', kind: 'opening' });
    if (options.separateKitchen) desiredEdges.push({ a: 'living', b: 'kitchen', kind: 'opening' });
    if (hasCirculation) {
      allocated.forEach(function (room) {
        if (room.id !== hub && room.id !== 'living' && room.id !== 'kitchen') {
          desiredEdges.push({ a: hub, b: room.id, kind: 'opening' });
        }
      });
    } else {
      allocated.forEach(function (room) {
        if (room.id !== 'living' && room.id !== 'kitchen') {
          desiredEdges.push({ a: 'living', b: room.id, kind: 'opening' });
        }
      });
    }
    return { options: options, rooms: allocated, desiredEdges: desiredEdges, minimumTotal: round(minimumTotal) };
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

  // Isole la circulation contre une frontière. Une fois le couloir réduit à
  // une bande, tout groupe recoupé perpendiculairement voit chacune de ses
  // pièces border cette bande : c'est la topologie en peigne, celle qui
  // satisfait un graphe en étoile sans que le hasard ait à la trouver.
  function hubSplit(items) {
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

  function layout(items, bounds, depth, priority, random, output, parentVertical) {
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

    // Un groupe sans circulation a déjà été détaché d'elle par la coupe
    // parente : le recouper perpendiculairement fait border cette coupe à
    // chacune de ses pièces, donc toucher le couloir. C'est la dent du
    // peigne, et c'est ce qui satisfait le graphe par construction plutôt
    // que par tirage.
    var hasHub = items.some(function (item) { return item.type === 'circulation'; });
    var comb = !hasHub && parentVertical !== undefined
      && (parentVertical ? fitsHorizontal : fitsVertical);

    var vertical;
    if (comb) vertical = !parentVertical;
    else if (priority === 'light' && depth === 0 && fitsHorizontal) vertical = false;
    else if (priority === 'economy' && depth < 2 && fitsVertical) vertical = true;
    else if (fitsVertical !== fitsHorizontal) vertical = fitsVertical;
    else vertical = random() < 0.5 ? bounds.width >= bounds.height : random() < 0.5;

    if (vertical) {
      var width = bounds.width * ratio;
      layout(first, { x: bounds.x, y: bounds.y, width: width, height: bounds.height }, depth + 1, priority, random, output, true);
      layout(second, { x: bounds.x + width, y: bounds.y, width: bounds.width - width, height: bounds.height }, depth + 1, priority, random, output, true);
    } else {
      var height = bounds.height * ratio;
      layout(first, { x: bounds.x, y: bounds.y, width: bounds.width, height: height }, depth + 1, priority, random, output, false);
      layout(second, { x: bounds.x, y: bounds.y + height, width: bounds.width, height: bounds.height - height }, depth + 1, priority, random, output, false);
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

  function scoreCandidate(boxes, edges, program, enveloppe) {
    var score = penaliteFacade(boxes, enveloppe);
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
      if (contact + 0.005 < MIN_DESSERTE) {
        score += 110 * (1 - Math.min(1, contact / MIN_DESSERTE) * 0.6);
      }
    });
    boxes.forEach(function (room) {
      var width = Math.abs(room.x1 - room.x0);
      var height = Math.abs(room.y1 - room.y0);
      var ratio = Math.min(width, height) / Math.max(width, height);
      if (ratio < 0.32) score += (0.32 - ratio) * 180;
      // Une pièce qui ne peut pas recevoir son mobilier n'est pas une pièce
      // mal proportionnée, elle est inutilisable. Le verdict vient du socle,
      // pas d'une convention de largeur.
      if (!roomFits(room.type, width, height)) score += 95;
      // Une circulation trop étroite est infranchissable : la pénalité doit
      // peser autant qu'une adjacence manquante, sans quoi le moteur la
      // déclare conforme (voir ROADMAP §3.2).
      if (room.type === 'circulation') {
        var clear = narrowestSide(room);
        if (clear < MIN_CIRCULATION_WIDTH) score += (MIN_CIRCULATION_WIDTH - clear) * 320;
        // Pas de pénalité de largeur maximale ici : le surplus est cédé aux
        // pièces longées par carveCirculation(), et c'est justement d'un
        // créneau généreux que naît la bande de rangement.
        var served = edges.filter(function (edge) { return edge.a === room.id || edge.b === room.id; }).length;
        if (served < 2) score += (2 - served) * 90;
      }
    });
    if (program.options.priority === 'light') {
      var living = boxes.find(function (room) { return room.id === 'living'; });
      if (living && living.y0 > 0.012) score += 28;
    }
    if (program.options.priority === 'economy') score += edges.length * 0.4;
    return score;
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
    return boxes.filter(function (box) { return box !== corridor; }).map(function (box) {
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

  function carveCirculation(boxes) {
    var corridor = boxes.find(function (box) { return box.type === 'circulation'; });
    if (!corridor) return null;
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

  // Largeur minimale d'une pièce. La valeur fait autorité si le solveur du
  // socle est chargé — elle est alors le plus petit côté d'un rectangle
  // réellement meublable, calculé hors ligne à partir des équipements. La
  // table `DEFINITIONS.minSide` n'est qu'un repli, et ses valeurs sont des
  // conventions : le socle prime sur la convention.
  var fitSideCache = {};
  function minSideOf(box) {
    var type = box.type;
    if (fitSideCache[type] === undefined) {
      var value = null;
      var fit = root.TechnoHabFit;
      if (fit && fit.envelopes && fit.envelopes[type]) {
        var variants = fit.envelopes[type].variants || {};
        Object.keys(variants).forEach(function (name) {
          variants[name].forEach(function (pair) {
            var side = Math.min(pair[0], pair[1]) / 100;
            if (value === null || side < value) value = side;
          });
        });
      }
      fitSideCache[type] = value !== null ? value
        : ((DEFINITIONS[type] && DEFINITIONS[type].minSide) || 1.2);
    }
    return fitSideCache[type];
  }

  // Le rectangle utile peut-il recevoir ce que la pièce doit contenir ?
  function roomFits(type, width, height) {
    var fit = root.TechnoHabFit;
    return fit && fit.fits ? fit.fits(type, width, height) : true;
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
      if (taker.parts.length > 1) continue;
      if (swapCorner(giver, taker, random)) applied += 1;
    }
    return applied;
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
  var PORTE_INTERIEURE = 0.80;
  var PORTE_ENTREE = 0.90;
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

  // Le segment de mur commun à deux parties, s'il est assez long.
  function murCommun(a, b) {
    var vertical = Math.abs(a.x1 - b.x0) < CONTACT || Math.abs(b.x1 - a.x0) < CONTACT;
    var horizontal = Math.abs(a.y1 - b.y0) < CONTACT || Math.abs(b.y1 - a.y0) < CONTACT;
    if (vertical) {
      var y0 = Math.max(a.y0, b.y0), y1 = Math.min(a.y1, b.y1);
      var x = Math.abs(a.x1 - b.x0) < CONTACT ? a.x1 : a.x0;
      return y1 - y0 > 0 ? { axe: 'vertical', x: x, d0: y0, d1: y1 } : null;
    }
    if (horizontal) {
      var x0 = Math.max(a.x0, b.x0), x1 = Math.min(a.x1, b.x1);
      var y = Math.abs(a.y1 - b.y0) < CONTACT ? a.y1 : a.y0;
      return x1 - x0 > 0 ? { axe: 'horizontal', y: y, d0: x0, d1: x1 } : null;
    }
    return null;
  }

  /* Une porte par adjacence demandée et réalisée, centrée sur le mur commun.
     Le centrage est provisoire : le placement définitif devra tenir compte
     du mobilier et des débattements, ce que le moteur ne sait pas encore. */
  function poserPortes(boxes, requestedEdges) {
    var parId = {};
    boxes.forEach(function (box) { parId[box.id] = box; });
    var portes = [];
    requestedEdges.forEach(function (demande) {
      var a = parId[demande.a], b = parId[demande.b];
      if (!a || !b) return;
      var meilleur = null;
      a.parts.forEach(function (pa) {
        b.parts.forEach(function (pb) {
          var mur = murCommun(pa, pb);
          if (mur && (!meilleur || mur.d1 - mur.d0 > meilleur.d1 - meilleur.d0)) meilleur = mur;
        });
      });
      if (!meilleur || meilleur.d1 - meilleur.d0 < PORTE_INTERIEURE) return;
      var milieu = (meilleur.d0 + meilleur.d1) / 2;
      /* Le battant ouvre vers la pièce, jamais vers la circulation : une
         porte qui s'ouvre dans un couloir le condamne le temps du passage.
         Le débattement est approché par un carré du côté du vantail — un
         quart de disque à la maille de dix centimètres n'apporterait rien. */
      var x = meilleur.axe === 'vertical' ? round(meilleur.x) : round(milieu);
      var y = meilleur.axe === 'vertical' ? round(milieu) : round(meilleur.y);
      var versA = b.type === 'circulation' || (a.type !== 'circulation' && a.area >= b.area);
      var piece = versA ? a : b;
      var ref = piece.parts[0];
      var dedans = meilleur.axe === 'vertical'
        ? (ref.x0 + ref.x1) / 2 > x ? 1 : -1
        : (ref.y0 + ref.y1) / 2 > y ? 1 : -1;
      var demi = PORTE_INTERIEURE / 2;
      var coulissante = a.type === 'wc' || b.type === 'wc';
      portes.push({
        id: 'porte_' + (portes.length + 1), entre: [demande.a, demande.b],
        kind: coulissante ? 'porte-coulissante' : 'porte', largeur: PORTE_INTERIEURE,
        axe: meilleur.axe, x: x, y: y,
        mur: round(meilleur.d1 - meilleur.d0, 2),
        ouvreVers: coulissante ? null : piece.id,
        debattement: coulissante ? null : meilleur.axe === 'vertical'
          ? { x0: round(dedans > 0 ? x : x - PORTE_INTERIEURE), y0: round(y - demi),
              x1: round(dedans > 0 ? x + PORTE_INTERIEURE : x), y1: round(y + demi) }
          : { x0: round(x - demi), y0: round(dedans > 0 ? y : y - PORTE_INTERIEURE),
              x1: round(x + demi), y1: round(dedans > 0 ? y + PORTE_INTERIEURE : y) }
      });
    });
    return portes;
  }

  /* L'entrée principale suit la chaîne de repli : la circulation la prend si
     elle donne sur la façade, sinon la première pièce éligible. Une pièce
     interdite ne la reçoit jamais, même si c'est la seule en façade — le plan
     est alors déclaré sans entrée, ce qui est le verdict juste. */
  function poserEntree(boxes, facades) {
    var parId = {};
    boxes.forEach(function (box) { parId[box.id] = box; });
    var candidates = facades.filter(function (segment) {
      var box = parId[segment.room];
      return box && ENTREE_INTERDITE.indexOf(box.type) < 0 && segment.longueur >= PORTE_ENTREE;
    });
    if (!candidates.length) return null;
    candidates.sort(function (x, y) {
      var rx = ENTREE_ORDRE.indexOf(parId[x.room].type);
      var ry = ENTREE_ORDRE.indexOf(parId[y.room].type);
      if (rx !== ry) return (rx < 0 ? 99 : rx) - (ry < 0 ? 99 : ry);
      return y.longueur - x.longueur;
    });
    var choisi = candidates[0];
    var horizontal = choisi.cote === 'nord' || choisi.cote === 'sud';
    return {
      id: 'entree', entre: [choisi.room, 'exterior'], kind: 'entree',
      largeur: PORTE_ENTREE, cote: choisi.cote,
      axe: horizontal ? 'horizontal' : 'vertical',
      x: round(horizontal ? (choisi.x0 + choisi.x1) / 2 : choisi.x0),
      y: round(horizontal ? choisi.y0 : (choisi.y0 + choisi.y1) / 2),
      mur: choisi.longueur,
      deconseille: parId[choisi.room].type === 'kitchen'
    };
  }

  function poserFenetres(boxes, facades) {
    var habitables = ['living', 'bedroom', 'kitchen', 'dining', 'bureau'];
    var parId = {};
    boxes.forEach(function (box) { parId[box.id] = box; });
    var meilleureFacade = {};
    facades.forEach(function (segment) {
      var room = parId[segment.room];
      if (!room || habitables.indexOf(room.type) === -1 || segment.longueur < 0.8) return;
      if (!meilleureFacade[room.id] || segment.longueur > meilleureFacade[room.id].longueur) {
        meilleureFacade[room.id] = segment;
      }
    });
    return Object.keys(meilleureFacade).map(function (roomId, index) {
      var segment = meilleureFacade[roomId];
      var horizontal = segment.cote === 'nord' || segment.cote === 'sud';
      return {
        id: 'fenetre_' + (index + 1), room: roomId, kind: 'fenetre', cote: segment.cote,
        largeur: round(Math.min(1.8, Math.max(0.8, segment.longueur * 0.45)), 2),
        axe: horizontal ? 'horizontal' : 'vertical',
        x: round(horizontal ? (segment.x0 + segment.x1) / 2 : segment.x0),
        y: round(horizontal ? segment.y0 : (segment.y0 + segment.y1) / 2)
      };
    });
  }

  /* Le cheminement. Un chemin est une ligne, et une ligne passe partout : ce
     qu'il faut prouver, c'est qu'un corps passe. On maille la surface, on
     retire ce qui bloque, puis on érode de la moitié de la largeur exigée —
     s'il reste un chemin, le passage existe à pleine largeur.

     Ne tient pas encore compte du mobilier : le générateur ne connaît pas les
     poses, calculées à l'affichage. C'est la prochaine étape, et elle rendra
     le verdict réellement probant. */
  function cheminement(boxes, portes, entree, width, height, obstacles) {
    if (!entree) return null;
    var PAS = 0.1;
    var nx = Math.ceil(width / PAS), ny = Math.ceil(height / PAS);
    var piece = new Int16Array(nx * ny).fill(-1);

    /* Chaque cellule reçoit l'indice de sa pièce. Les murs ne sont pas des
       cellules : ils n'ont aucune épaisseur dans ce modèle, et les marquer
       comme obstacles amputait chaque pièce de vingt centimètres — un WC de
       1,40 m disparaissait sous l'érosion alors qu'il était accessible.
       C'est la **transition** entre deux pièces qui est bloquée, pas le sol. */
    boxes.forEach(function (box, index) {
      box.parts.forEach(function (part) {
        for (var i = Math.max(0, Math.floor(part.x0 / PAS)); i < Math.ceil(part.x1 / PAS) && i < nx; i += 1) {
          for (var j = Math.max(0, Math.floor(part.y0 / PAS)); j < Math.ceil(part.y1 / PAS) && j < ny; j += 1) {
            piece[j * nx + i] = index;
          }
        }
      });
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
    var depart = [Math.min(nx - 1, Math.max(0, Math.round(entree.x / PAS))),
      Math.min(ny - 1, Math.max(0, Math.round(entree.y / PAS)))];
    var file = [];
    for (var r = 0; r < 15 && !file.length; r += 1) {
      for (var da = -r; da <= r; da += 1) for (var db = -r; db <= r; db += 1) {
        var a0 = depart[0] + da, b0 = depart[1] + db;
        if (a0 >= 0 && b0 >= 0 && a0 < nx && b0 < ny && large[b0 * nx + a0] && !vus[b0 * nx + a0]) {
          file.push([a0, b0]); vus[b0 * nx + a0] = 1;
        }
      }
    }
    while (file.length) {
      var cur = file.shift();
      var pCur = piece[cur[1] * nx + cur[0]];
      [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (d) {
        var a = cur[0] + d[0], b = cur[1] + d[1];
        if (a < 0 || b < 0 || a >= nx || b >= ny) return;
        if (!large[b * nx + a] || vus[b * nx + a]) return;
        // Changer de pièce demande une porte ; rester dans la sienne est libre.
        var pVoisin = piece[b * nx + a];
        if (pVoisin !== pCur && !franchissable((a + 0.5) * PAS, (b + 0.5) * PAS)) return;
        vus[b * nx + a] = 1; file.push([a, b]);
      });
    }

    var atteintes = {};
    boxes.forEach(function (box, index) {
      for (var i3 = 0; i3 < nx; i3 += 1) for (var j3 = 0; j3 < ny; j3 += 1) {
        if (piece[j3 * nx + i3] === index && vus[j3 * nx + i3]) atteintes[box.id] = true;
      }
    });
    return {
      largeur: PASSAGE_LIBRE, atteintes: atteintes,
      avecMobilier: Boolean(obstacles && obstacles.length)
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

  function generatePlan(rawOptions, variant, requestedSeed) {
    var program = buildProgram(rawOptions);
    var seed = typeof requestedSeed === 'number'
      ? requestedSeed >>> 0
      : hash(JSON.stringify(program.options) + ':' + (variant || 1));
    var budget = generationBudget(program.rooms.length);
    var best = null;
    for (var attempt = 0; attempt < budget; attempt += 1) {
      var random = randomFrom(seed + attempt * 2654435761);
      var enveloppe = construireEnveloppe(program.options, program.rooms, random);
      var width = enveloppe.width, height = enveloppe.height;
      var boxes = [];
      repartirProgramme(program.rooms, enveloppe.volumes, random).forEach(function (groupe, index) {
        if (!groupe.length) return;
        var volume = enveloppe.volumes[index];
        // Le séjour n'est plus placé en tête : il appartenait alors toujours à
        // la première tranche de la découpe, donc au même angle, quelle que
        // soit la variante (voir ROADMAP §3.2).
        var order = shuffled(ajusterAuVolume(groupe, volume, enveloppe.volumes), random);
        // La découpe sépare le tableau en deux tranches contiguës : une pièce
        // placée au milieu borde les deux moitiés. C'est la position qui donne
        // à la circulation le plus de voisins, donc le plus de chances de
        // desservir ce qu'elle doit desservir.
        var hub = order.findIndex(function (room) { return room.type === 'circulation'; });
        if (hub >= 0) {
          var middle = Math.floor(order.length / 2) + (random() < 0.5 ? 0 : -1);
          order.splice(middle, 0, order.splice(hub, 1)[0]);
        }
        layout(order, { x: volume.x, y: volume.y, width: volume.width, height: volume.height },
          0, program.options.priority, random, boxes);
      });
      var edges = actualEdges(boxes);
      var score = scoreCandidate(boxes, edges, program, enveloppe);
      if (!best || score < best.score) {
        best = {
          boxes: boxes, edges: edges, score: score, attempt: attempt,
          width: width, height: height, enveloppe: enveloppe
        };
      }
      if (best.score === 0) break;
    }

    // La cession n'est appliquée qu'au candidat retenu : elle ne change pas
    // les adjacences — elle ne fait qu'agrandir des pièces déjà voisines —
    // et la faire dans la boucle coûterait le budget entier pour rien.
    var carved = best.boxes.map(function (room) {
      return Object.assign({}, room, {
        parts: [{ role: 'main', x0: room.x0, y0: room.y0, x1: room.x1, y1: room.y1 }]
      });
    });
    var carving = carveCirculation(carved);
    // Puis les décrochements entre pièces mitoyennes, pour sortir du tout
    // rectangle. Bornés : au-delà, un plan devient illisible.
    var shaping = shapeRooms(carved, best.edges, randomFrom(seed ^ 0x9E3779B9),
      Math.max(2, Math.round(carved.length / 1.6)));
    // Le graphe est relu sur la géométrie finale, parties comprises.
    var finalEdges = edgesFromParts(carved);
    // La façade et l'extérieur, calculés sur la géométrie finale : le
    // décrochement d'une pièce peut lui donner ou lui retirer du bord.
    var facades = facadeSegments(carved, best.enveloppe);
    var exterieur = edgesToExterior(facades);
    var portes = poserPortes(carved, program.desiredEdges);
    var entree = poserEntree(carved, facades);
    var fenetres = poserFenetres(carved, facades);
    var parcours = cheminement(carved, portes, entree, best.width, best.height);

    return {
      schemaVersion: '2.3', generator: 'technohab-local-graph-2d', variant: variant || 1,
      seed: encodeSeed(seed), seedValue: seed >>> 0,
      candidate: best.attempt + 1, budget: budget, score: round(best.score, 2),
      boundary: {
        width: round(best.width), height: round(best.height), area: program.options.surface,
        // La forme et ses volumes voyagent avec le plan : le rendu, les règles
        // d'enveloppe et le cheminement en ont tous besoin (chantier 1).
        shape: best.enveloppe.shape,
        // Forme demandée et forme obtenue peuvent différer : sous une certaine
        // surface, un L ou un U n'a plus d'aile habitable.
        demandee: best.enveloppe.demandee || best.enveloppe.shape,
        degradee: Boolean(best.enveloppe.degradee),
        volumes: best.enveloppe.volumes.map(function (v) {
          return { x0: v.x, y0: v.y, x1: round(v.x + v.width), y1: round(v.y + v.height) };
        })
      },
      options: program.options, minimumRequiredArea: program.minimumTotal,
      minCirculationWidth: MIN_CIRCULATION_WIDTH, minDesserte: MIN_DESSERTE, maxCirculationWidth: MAX_CIRCULATION_WIDTH,
      minStorageDepth: MIN_STORAGE_DEPTH, maxStorageDepthRatio: MAX_STORAGE_DEPTH_RATIO,
      carving: carving, shaping: shaping,
      maxEdges: 6,
      rooms: carved.map(function (room) {
        var parts = room.parts.map(function (part) {
          return { role: part.role, x0: round(part.x0), y0: round(part.y0), x1: round(part.x1), y1: round(part.y1) };
        });
        var bounds = partsBounds(parts);
        // Le rectangle utile est la boîte englobante quand les parties la
        // pavent : la pièce est alors rectangulaire, et la servir en morceaux
        // la ferait dessiner et meubler plus petite qu'elle n'est (D2).
        var usable = unionEstRectangle(parts) ? bounds : parts[0];
        return {
          id: room.id, type: room.type, label: room.label,
          // Les programmes absorbés voyagent avec la pièce : sans eux, une
          // règle ou un rendu la jugerait sur son seul type et manquerait la
          // moitié de ce qu'elle doit contenir (D3).
          composedWith: room.composedWith ? room.composedWith.slice() : undefined,
          minArea: room.minArea, minSide: room.minSide, targetArea: room.targetArea,
          area: round(partsArea(parts)),
          storageArea: round(partsArea(parts.filter(function (p) { return p.role === 'storage'; }))),
          // Une partie accolée sur toute la longueur d'un côté prolonge le
          // rectangle sans créer de coin rentrant : la pièce reste à quatre
          // arêtes. Toute autre partie en ajoute deux.
          edgeCount: countEdges(parts),
          parts: parts, usableRect: { x0: usable.x0, y0: usable.y0, x1: usable.x1, y1: usable.y1 },
          x0: bounds.x0, y0: bounds.y0, x1: bounds.x1, y1: bounds.y1
        };
      }),
      facades: facades, portes: portes, entree: entree, fenetres: fenetres, parcours: parcours,
      passageLibre: PASSAGE_LIBRE,
      requestedEdges: program.desiredEdges,
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

  root.TechnoHabGenerator = {
    buildProgram: buildProgram, generatePlan: generatePlan, normalizeOptions: normalizeOptions,
    // Exposé pour le rendu : le contour est une propriété de la pièce, pas
    // une affaire de dessin (D2).
    cheminContour: cheminContour,
    /* Rejouable avec des obstacles : le générateur ignore le mobilier, dont
       les poses sont calculées à l'affichage. L'interface recalcule donc le
       parcours une fois les meubles connus — sans quoi le verdict porte sur
       un logement vide, ce qui ne prouve pas grand-chose. */
    cheminementAvecObstacles: function (plan, obstacles) {
      return cheminement(plan.rooms, plan.portes || [], plan.entree,
        plan.boundary.width, plan.boundary.height, obstacles);
    },
    definitions: DEFINITIONS, encodeSeed: encodeSeed, decodeSeed: decodeSeed,
    minCirculationWidth: MIN_CIRCULATION_WIDTH
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
