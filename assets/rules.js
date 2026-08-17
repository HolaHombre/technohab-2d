(function (root) {
  'use strict';

  var EPSILON = 0.03;
  var MIN_CIRCULATION_WIDTH = 1.2;
  var MAX_CIRCULATION_WIDTH = 1.8;
  var MIN_STORAGE_DEPTH = 0.45;
  var MAX_STORAGE_DEPTH_RATIO = 0.6;
  var CONTACT = 0.02;

  // Une pièce peut être un rectangle ou une forme en L : sa surface est celle
  // de ses parties, mais tout contrôle de proportion se mesure sur le
  // rectangle utile — un rapport de forme n'a pas de sens sur un L.
  function parts(room) {
    return room.parts && room.parts.length ? room.parts : [room];
  }
  function usable(room) { return room.usableRect || parts(room)[0]; }
  function rectArea(r) { return Math.abs((r.x1 - r.x0) * (r.y1 - r.y0)); }
  function roomArea(room) {
    if (typeof room.area === 'number') return room.area;
    return parts(room).reduce(function (sum, part) { return sum + rectArea(part); }, 0);
  }
  function storageParts(room) {
    return parts(room).filter(function (part) { return part.role === 'storage'; });
  }
  // Rangements et décrochements obéissent aux mêmes bornes : un décrochement
  // hors bornes n'est pas une forme, c'est un défaut.
  function securedParts(room) {
    return parts(room).filter(function (part) { return part.role === 'storage' || part.role === 'notch'; });
  }
  function edgeCount(room) {
    return typeof room.edgeCount === 'number' ? room.edgeCount : 4 + 2 * (parts(room).length - 1);
  }
  function narrowestSide(room) {
    var rect = usable(room);
    return Math.min(Math.abs(rect.x1 - rect.x0), Math.abs(rect.y1 - rect.y0));
  }
  function touches(a, b) {
    var overlapX = Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0);
    var overlapY = Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0);
    var contactX = Math.abs(a.x1 - b.x0) < CONTACT || Math.abs(b.x1 - a.x0) < CONTACT;
    var contactY = Math.abs(a.y1 - b.y0) < CONTACT || Math.abs(b.y1 - a.y0) < CONTACT;
    return (contactX && overlapY > 0) || (contactY && overlapX > 0);
  }
  /* L'extérieur est un nœud du graphe mais n'est pas un espace desservi :
     une circulation qui longe la façade ne dessert pas la rue. Les fonctions
     qui raisonnent en pièces doivent donc l'ignorer. */
  function estPiece(plan, id) {
    return plan.rooms.some(function (room) { return room.id === id; });
  }
  function degree(plan, roomId) {
    return plan.edges.filter(function (edge) {
      if (edge.a !== roomId && edge.b !== roomId) return false;
      var autre = edge.a === roomId ? edge.b : edge.a;
      return estPiece(plan, autre);
    }).length;
  }
  /* Une adjacence n'est pas une desserte. Deux pièces qui se touchent sur
     24 cm sont adjacentes et ne peuvent porter aucune porte : il faut
     environ 1,00 m de mur commun — 0,80 m de vantail plus les tableaux.
     Juger sur le contact surévaluait la conformité d'environ neuf points. */
  function edgeServing(edges, requested, minimum) {
    var found = null;
    edges.forEach(function (edge) {
      var match = (edge.a === requested.a && edge.b === requested.b) ||
        (edge.a === requested.b && edge.b === requested.a);
      if (match) found = edge;
    });
    if (!found) return { exists: false, contact: 0 };
    var contact = typeof found.contact === 'number' ? found.contact : minimum;
    return { exists: contact + 0.005 >= minimum, contact: contact };
  }
  function reachable(plan) {
    if (!plan.rooms.some(function (room) { return room.id === 'living'; })) {
      return {};
    }
    var neighbors = {};
    plan.rooms.forEach(function (room) { neighbors[room.id] = []; });
    // On ne traverse pas par l'extérieur : deux pièces qui donnent sur la
    // même façade ne communiquent pas pour autant.
    plan.edges.forEach(function (edge) {
      if (!neighbors[edge.a] || !neighbors[edge.b]) return;
      neighbors[edge.a].push(edge.b); neighbors[edge.b].push(edge.a);
    });
    var visited = { living: true };
    var queue = ['living'];
    while (queue.length) {
      var current = queue.shift();
      (neighbors[current] || []).forEach(function (next) {
        if (!visited[next]) { visited[next] = true; queue.push(next); }
      });
    }
    return visited;
  }

  var RULES = [
    {
      id: 'TH2D-PROJECT-001', level: 'HARD', label: 'Surface du programme compatible',
      evaluate: function (plan) {
        return plan.minimumRequiredArea <= plan.boundary.area + EPSILON ? [] : [{ entityId: 'project', message: 'Le programme demande au moins ' + plan.minimumRequiredArea + ' m² pour ' + plan.boundary.area + ' m² disponibles.' }];
      }
    },
    {
      /* La surface minimale n'est plus un verdict. Surface et meublabilité
         sont la même question posée à deux moments : la première est un
         filtre bon marché, la seconde tranche. Une pièce sous son minimum
         mais qui reçoit son mobilier n'a pas de défaut — c'est le minimum
         qui était mal posé.

         Elle reste évaluée parce qu'elle est presque gratuite et qu'elle
         signale les cas où le calcul coûteux confirmera sans doute. */
      id: 'TH2D-ROOM-001', level: 'GUIDELINE', label: 'Surface sous le minimum indicatif',
      evaluate: function (plan) {
        return plan.rooms.filter(function (room) { return roomArea(room) + EPSILON < room.minArea; }).map(function (room) {
          return {
            entityId: room.id, mesure: roomArea(room), seuil: room.minArea,
            message: room.label + ' fait ' + roomArea(room).toFixed(1) + ' m² pour un minimum indicatif de ' +
              room.minArea + ' m². C’est la meublabilité qui tranche, pas ce chiffre.'
          };
        });
      }
    },
    {
      id: 'TH2D-GRAPH-001', level: 'HARD', label: 'Adjacences desservies',
      evaluate: function (plan) {
        var minimum = plan.minDesserte || 1.0;
        var violations = [];
        plan.requestedEdges.forEach(function (requested) {
          var lien = edgeServing(plan.edges, requested, minimum);
          if (lien.exists) return;
          violations.push({
            entityId: requested.a + ':' + requested.b,
            mesure: lien.contact, seuil: minimum,
            message: lien.contact
              ? 'L’adjacence ' + requested.a + ' ↔ ' + requested.b + ' n’offre que ' +
                lien.contact.toFixed(2) + ' m de mur commun : aucune porte n’y tient.'
              : 'L’adjacence ' + requested.a + ' ↔ ' + requested.b + ' n’a pas pu être obtenue.'
          });
        });
        return violations;
      }
    },
    {
      /* La contrainte de placement la plus structurante, et la dernière à
         avoir été absente. Elle ne vient pas d'un goût mais de l'aération :
         les entrées d'air se font dans toutes les pièces principales, par la
         façade (arrêté du 24 mars 1982). Les pièces de service s'extraient
         par conduit et n'y sont pas tenues.

         Son absence expliquait qu'une chambre puisse se retrouver sans aucun
         mur extérieur — donc sans fenêtre, sans air, et sans que rien ne le
         signale. */
      id: 'TH2D-FACADE-001', level: 'HARD', label: 'Pièce principale en façade',
      evaluate: function (plan) {
        var PRINCIPALES = ['living', 'bedroom', 'kitchen', 'dining', 'bureau'];
        if (!plan.facades) return [];
        return plan.rooms.filter(function (room) {
          if (PRINCIPALES.indexOf(room.type) < 0) return false;
          return !plan.edges.some(function (edge) {
            return edge.b === 'exterior' && edge.a === room.id;
          });
        }).map(function (room) {
          return {
            entityId: room.id, mesure: 0, seuil: 1,
            message: room.label + ' ne touche aucune façade : ni fenêtre, ni entrée d’air possible.'
          };
        });
      }
    },
    {
      id: 'TH2D-GRAPH-002', level: 'HARD', label: 'Toutes les pièces accessibles',
      evaluate: function (plan) {
        var visited = reachable(plan);
        return plan.rooms.filter(function (room) { return !visited[room.id]; }).map(function (room) {
          return { entityId: room.id, message: room.label + ' n’est pas reliée au séjour.' };
        });
      }
    },
    {
      id: 'TH2D-SIZING-001', level: 'GUIDELINE', label: 'Séjour confortable',
      evaluate: function (plan) {
        return plan.rooms.filter(function (room) { return room.type === 'living' && roomArea(room) < 24; }).map(function (room) {
          return { entityId: room.id, mesure: roomArea(room), seuil: 24, message: 'Le séjour gagnerait à atteindre 24 m².' };
        });
      }
    },
    {
      id: 'TH2D-CIRC-001', level: 'HARD', label: 'Largeur de circulation praticable',
      evaluate: function (plan) {
        var minimum = plan.minCirculationWidth || MIN_CIRCULATION_WIDTH;
        return plan.rooms.filter(function (room) {
          return room.type === 'circulation' && narrowestSide(room) + 0.005 < minimum;
        }).map(function (room) {
          return {
            entityId: room.id, mesure: narrowestSide(room), seuil: minimum,
            message: room.label + ' ne fait que ' + narrowestSide(room).toFixed(2) +
              ' m de large, pour un minimum de ' + minimum.toFixed(2) + ' m.'
          };
        });
      }
    },
    {
      id: 'TH2D-CIRC-002', level: 'HARD', label: 'Circulation desservante',
      evaluate: function (plan) {
        return plan.rooms.filter(function (room) {
          return room.type === 'circulation' && degree(plan, room.id) < 2;
        }).map(function (room) {
          return { entityId: room.id, message: room.label + ' ne dessert pas au moins deux espaces.' };
        });
      }
    },
    {
      id: 'TH2D-CIRC-003', level: 'HARD', label: 'Largeur de circulation contenue',
      evaluate: function (plan) {
        var maximum = plan.maxCirculationWidth || MAX_CIRCULATION_WIDTH;
        return plan.rooms.filter(function (room) {
          return room.type === 'circulation' && narrowestSide(room) > maximum + 0.005;
        }).map(function (room) {
          return {
            entityId: room.id, mesure: narrowestSide(room), seuil: maximum,
            message: room.label + ' fait ' + narrowestSide(room).toFixed(2) +
              ' m de large : au-delà de ' + maximum.toFixed(2) + ' m, ce n’est plus un couloir mais une pièce.'
          };
        });
      }
    },
    {
      id: 'TH2D-CIRC-004', level: 'GUIDELINE', label: 'Part de circulation raisonnable',
      evaluate: function (plan) {
        var total = plan.rooms.filter(function (room) { return room.type === 'circulation'; })
          .reduce(function (sum, room) { return sum + roomArea(room); }, 0);
        if (!total || total <= plan.boundary.area * 0.10 + EPSILON) return [];
        return [{
          entityId: 'project', mesure: total, seuil: plan.boundary.area * 0.10,
          message: 'La circulation occupe ' + (total / plan.boundary.area * 100).toFixed(1) +
            ' % du plan, au-delà des 10 % visés.'
        }];
      }
    },
    {
      id: 'TH2D-RANGEMENT-001', level: 'HARD', label: 'Proportions du rangement',
      evaluate: function (plan) {
        var minimum = plan.minStorageDepth || MIN_STORAGE_DEPTH;
        var ratio = plan.maxStorageDepthRatio || MAX_STORAGE_DEPTH_RATIO;
        var violations = [];
        plan.rooms.forEach(function (room) {
          securedParts(room).forEach(function (part) {
            var width = Math.abs(part.x1 - part.x0);
            var height = Math.abs(part.y1 - part.y0);
            var depth = Math.min(width, height);
            var length = Math.max(width, height);
            if (depth + 0.005 < minimum) {
              violations.push({ entityId: room.id, message: 'Le rangement de ' + room.label + ' n’a que ' + depth.toFixed(2) + ' m de profondeur.' });
            } else if (depth > ratio * length + 0.005) {
              violations.push({ entityId: room.id, message: 'Le rangement de ' + room.label + ' est trop profond pour sa longueur : ce n’est plus une bande.' });
            }
          });
        });
        return violations;
      }
    },
    {
      id: 'TH2D-RANGEMENT-002', level: 'HARD', label: 'Rangement rattaché à sa pièce',
      evaluate: function (plan) {
        var violations = [];
        plan.rooms.forEach(function (room) {
          var main = usable(room);
          storageParts(room).forEach(function (part) {
            if (!touches(main, part)) {
              violations.push({ entityId: room.id, message: 'Le rangement de ' + room.label + ' n’est pas attenant à la pièce.' });
            }
          });
        });
        return violations;
      }
    },
    {
      id: 'TH2D-RANGEMENT-003', level: 'GUIDELINE', label: 'Rangement en chambre',
      evaluate: function (plan) {
        var bedrooms = plan.rooms.filter(function (room) { return room.type === 'bedroom'; });
        var without = bedrooms.filter(function (room) { return !storageParts(room).length; });
        if (!without.length) return [];
        // Un message unique plutôt qu'un par chambre : la même remarque
        // répétée quatre fois noie le reste du rapport.
        return [{
          entityId: 'project',
          message: without.length + ' chambre(s) sur ' + bedrooms.length + ' sans rangement.'
        }];
      }
    },
    {
      id: 'TH2D-FORME-001', level: 'HARD', label: 'Complexité de forme contenue',
      evaluate: function (plan) {
        // Un polygone à angles droits a toujours un nombre pair d'arêtes :
        // coins convexes moins coins rentrants vaut toujours quatre.
        var maximum = plan.maxEdges || 6;
        return plan.rooms.filter(function (room) {
          return edgeCount(room) > maximum || edgeCount(room) % 2 !== 0;
        }).map(function (room) {
          return {
            entityId: room.id,
            message: room.label + ' compte ' + edgeCount(room) + ' arêtes, pour un maximum de ' + maximum + '.'
          };
        });
      }
    },
    {
      id: 'TH2D-ROOM-002', level: 'HARD', label: 'Pièce meublable',
      evaluate: function (plan) {
        // Le verdict vient du socle d'agencement, via le solveur hors ligne :
        // le rectangle utile doit pouvoir recevoir les équipements requis.
        // Aucune convention de largeur ici — une valeur inventée serait soit
        // plus sévère que le socle, soit plus laxiste, jamais juste.
        var fit = root.TechnoHabFit;
        if (!fit || !fit.fits) return [];
        return plan.rooms.filter(function (room) {
          var main = usable(room);
          return !fit.fits(room.type, main.x1 - main.x0, main.y1 - main.y0);
        }).map(function (room) {
          var main = usable(room);
          var need = fit.smallest(room.type);
          return {
            entityId: room.id,
            message: room.label + ' mesure ' + (main.x1 - main.x0).toFixed(2) + ' × ' +
              (main.y1 - main.y0).toFixed(2) + ' m et ne peut pas recevoir son mobilier' +
              (need ? ' — il faut au moins ' + need.w.toFixed(2) + ' × ' + need.h.toFixed(2) + ' m.' : '.')
          };
        });
      }
    },
    {
      id: 'TH2D-RESERVE-001', level: 'HARD', label: 'Aucune surface sans propriétaire',
      prerequisite: true,
      evaluate: function (plan) {
        var violations = [];

        // Contrôle de surface : une réserve oubliée se voit à la somme.
        var attributed = plan.rooms.reduce(function (sum, room) { return sum + roomArea(room); }, 0);
        var gap = Math.abs(attributed - plan.boundary.area);
        var tolerance = Math.max(0.05, plan.rooms.length * 0.005);
        if (gap > tolerance) {
          violations.push({
            entityId: 'project', mesure: gap, seuil: tolerance,
            message: 'Écart de ' + gap.toFixed(2) + ' m² entre la surface attribuée et l’enveloppe : une réserve est restée sans propriétaire.'
          });
        }

        // Contrôle géométrique : deux parties peuvent se chevaucher sans que
        // la somme des aires le révèle — un trou ailleurs compenserait.
        // C'est le seul contrôle qui regarde les rectangles eux-mêmes.
        var parts = [];
        plan.rooms.forEach(function (room) {
          (room.parts && room.parts.length ? room.parts : [room]).forEach(function (part) {
            parts.push({ room: room, rect: part });
          });
        });
        for (var i = 0; i < parts.length; i += 1) {
          for (var j = i + 1; j < parts.length; j += 1) {
            var a = parts[i].rect, b = parts[j].rect;
            var overlapX = Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0);
            var overlapY = Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0);
            var surface = overlapX > 0.01 && overlapY > 0.01 ? overlapX * overlapY : 0;
            if (surface > 0.01) {
              violations.push({
                entityId: parts[i].room.id, mesure: surface, seuil: 0.01,
                message: parts[i].room.label + ' et ' + parts[j].room.label + ' se recouvrent sur ' +
                  surface.toFixed(2) + ' m².'
              });
            }
          }
        }
        return violations;
      }
    }
  ];

  /* --- Limites connues du moteur ------------------------------------------
     Une règle que la génération ne sait pas tenir n'est pas rétrogradée : son
     exigence reste réelle, et une pièce injoignable reste un défaut bloquant
     quoi qu'en dise le moteur. Mais son manquement n'est pas de même nature
     qu'une violation ordinaire — c'est une dette d'implémentation, pas un
     défaut du plan proposé.

     Les confondre a deux effets, tous deux mauvais : ou bien on impute à
     l'utilisateur un échec qui n'est pas le sien, ou bien on masque la dette
     en déclassant la règle. On les sépare donc, en disant laquelle est
     laquelle et sur quelle mesure on se fonde.

     `mesure` cite le relevé de scripts/scan-capacites.mjs qui a établi la
     limite. Une limite sans mesure n'a pas à figurer ici. */
  var LIMITES = {
    'TH2D-GRAPH-001': {
      depuis: '2026-08-15',
      cause: 'La découpe ne consulte pas le graphe : les adjacences sont favorisées par le score, jamais garanties par construction.',
      mesure: '206 manquements sur 360 plans, 24 configurations — scripts/scan-seeds.mjs, 2026-08-17. Le relevé précédent (264 sur 720) précédait la correction du champ `contact` dans actualEdges() : la pénalité de desserte était alors constante et la recherche n’arbitrait rien. Le reliquat se concentre sur les grands programmes, 5 chambres et plus.',
      suite: 'Découpe pilotée par le graphe, ou typologies — voir APPROCHES_GENERATION.md'
    },
    'TH2D-CIRC-003': {
      depuis: '2026-08-15',
      cause: 'La cession du surplus de couloir échoue lorsqu’un de ses côtés n’est pas entièrement bordé : elle est alors refusée pour ne pas laisser de surface sans propriétaire.',
      mesure: '70 manquements sur 360 plans, 24 configurations — scripts/scan-seeds.mjs, 2026-08-17',
      suite: 'Autoriser une cession partielle, ce qui suppose un couloir non rectangulaire'
    },
    'TH2D-RANGEMENT-003': {
      depuis: '2026-08-15',
      cause: 'Le rangement produit aujourd’hui est une bande cédée par le couloir ; seules les chambres qui le bordent peuvent en recevoir une. La penderie relève de la couche mobilier, non encore posée.',
      mesure: '320 signalements sur 360 plans — la règle mesure une absence attendue (scripts/scan-seeds.mjs, 2026-08-17)',
      suite: 'Poser les équipements dans la pièce, socle §5.3'
    }
  };

  /* Gravité — l'écart rapporté au seuil. Une chambre à 8,99 m² pour 9 exigés
     et une à 3 m² enfreignent la même règle ; sans gravité, elles s'affichent
     à égalité. Une règle qui ne fournit pas de mesure chiffrable n'a pas de
     gravité : mieux vaut l'absence qu'un nombre inventé. */
  function graviter(item) {
    if (typeof item.mesure !== 'number' || typeof item.seuil !== 'number' || !item.seuil) return null;
    return Math.round(Math.abs(item.mesure - item.seuil) / Math.abs(item.seuil) * 1000) / 1000;
  }

  function evaluatePlan(plan) {
    var violations = [];
    var limites = [];

    /* Préalable : un plan troué ou dont deux pièces se recouvrent n'est pas
       un plan un peu faux, c'est un plan qui n'existe pas. Les autres règles
       y perdraient leur sens — une pièce peut être meublable dans une surface
       occupée deux fois. On s'arrête donc là. */
    var prealables = RULES.filter(function (rule) { return rule.prerequisite; });
    var echecPrealable = [];
    prealables.forEach(function (rule) {
      rule.evaluate(plan).forEach(function (item) {
        echecPrealable.push(Object.assign({
          ruleId: rule.id, level: rule.level, label: rule.label, gravite: graviter(item)
        }, item));
      });
    });

    var evaluees = echecPrealable.length
      ? prealables
      : RULES;

    if (echecPrealable.length) violations = echecPrealable;
    else {
      RULES.forEach(function (rule) {
        var limite = LIMITES[rule.id];
        rule.evaluate(plan).forEach(function (item) {
          var entree = Object.assign({
            ruleId: rule.id, level: rule.level, label: rule.label, gravite: graviter(item)
          }, item);
          if (limite) limites.push(Object.assign(entree, { limite: limite }));
          else violations.push(entree);
        });
      });
    }

    // Le plus grave d'abord ; à gravité égale ou inconnue, le bloquant prime.
    var trier = function (liste) {
      return liste.sort(function (a, b) {
        if (a.level !== b.level) return a.level === 'HARD' ? -1 : 1;
        return (b.gravite === null ? -1 : b.gravite) - (a.gravite === null ? -1 : a.gravite);
      });
    };
    trier(violations); trier(limites);

    var compte = function (liste, niveau) {
      return liste.filter(function (item) { return item.level === niveau; }).length;
    };
    return {
      profile: 'mvp-local-graph-2d-v1',
      evaluatedRules: evaluees.length, skippedRules: RULES.length - evaluees.length,
      // Signalé explicitement : un rapport tronqué ne doit pas se lire comme
      // un rapport complet où tout le reste serait satisfait.
      prealableRompu: echecPrealable.length > 0,
      summary: {
        count: violations.length,
        hard: compte(violations, 'HARD'),
        guideline: compte(violations, 'GUIDELINE'),
        graviteMax: violations.reduce(function (max, item) {
          return item.gravite !== null && item.gravite > max ? item.gravite : max;
        }, 0),
        // Comptées à part : elles ne disent rien du plan, elles disent où en
        // est le moteur.
        limites: limites.length,
        limitesHard: compte(limites, 'HARD'),
        reglesLimitees: Object.keys(LIMITES).length
      },
      violations: violations,
      limites: limites
    };
  }

  root.TechnoHabRules = { evaluatePlan: evaluatePlan, rules: RULES, limites: LIMITES };
})(typeof globalThis !== 'undefined' ? globalThis : this);
