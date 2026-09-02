(function (root) {
  'use strict';

  var EPSILON = 0.03;
  function canonicalNumber(id, fallback) {
    var registry = root.TechnoHabCanonicalValues;
    var value = registry && registry.get ? registry.get(id) : null;
    return value && Number.isFinite(value.value) ? value.value : fallback;
  }
  var MIN_CIRCULATION_WIDTH = canonicalNumber('VAL-CIRC-CLEAR-WIDTH-SIMPLE-MIN-001', 0.9);
  var CROSSING_CIRCULATION_WIDTH = canonicalNumber('VAL-CIRC-CLEAR-WIDTH-CROSSING-MIN-001', 1.2);
  var CIRCULATION_CROSSING_SERVICES = canonicalNumber('VAL-CIRC-CROSSING-SERVICE-COUNT-001', 3);
  var MAX_CIRCULATION_WIDTH = canonicalNumber('VAL-CIRC-CLEAR-WIDTH-MAX-001', 1.8);
  var MIN_STORAGE_DEPTH = canonicalNumber('VAL-STORAGE-BAY-DEPTH-MIN-001', 0.45);
  var MAX_STORAGE_DEPTH_RATIO = canonicalNumber('VAL-STORAGE-BAY-DEPTH-LENGTH-RATIO-MAX-001', 0.6);
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
  /* --- Largeur d'une circulation ---------------------------------------------

     Une circulation n'est pas forcément une barre. Dès qu'elle se coude — un L,
     un T, une barre à extension — sa largeur ne se lit plus sur sa boîte
     englobante mais sur chacune de ses BRANCHES.

     La mesure précédente — `narrowestSide()`, retirée avec cette correction —
     prenait le rectangle utile, donc la boîte. Sur un L de
     1,20 m de large et d'emprise 6 × 5, elle répond « 5 m ». Deux règles dures
     s'en trouvaient faussées, et dans les deux sens : `TH2D-CIRC-001` cessait
     de voir un couloir trop étroit, `TH2D-CIRC-003` refusait tout couloir
     coudé. Le défaut était latent — aucune circulation n'a plusieurs parties
     aujourd'hui — et se serait déclaré au premier L produit.

     Les parties d'une pièce sont déjà exprimées en cotes utiles — vérifié :
     sur un couloir droit, l'emprise et le rectangle utile coïncident au
     millimètre. Elles se lisent donc telles quelles.

     Un premier jet retranchait de chaque branche l'écart entre la boîte
     englobante et `usableRect`, croyant y voir l'épaisseur des cloisons. Sur
     une barre l'écart est nul et rien ne se voyait ; sur un L, dont la boîte
     englobante couvre tout le plan, il rabotait les branches jusqu'à les faire
     passer sous 1,20 m — la correction fabriquait le défaut qu'elle devait
     détecter. */
  function branchesUtiles(room) {
    var liste = parts(room);
    return liste.length < 2 ? [usable(room)] : liste;
  }

  // Largeur d'une branche : son petit côté. C'est ce qu'on y traverse.
  function largeurBranche(rect) {
    return Math.min(Math.abs(rect.x1 - rect.x0), Math.abs(rect.y1 - rect.y0));
  }

  /** La branche la plus étroite — celle qui décide si l'on passe. */
  function largeurCirculationMin(room) {
    return branchesUtiles(room).reduce(function (min, rect) {
      return Math.min(min, largeurBranche(rect));
    }, Infinity);
  }

  /** La branche la plus large — celle qui décide si c'est encore un couloir. */
  function largeurCirculationMax(room) {
    return branchesUtiles(room).reduce(function (max, rect) {
      return Math.max(max, largeurBranche(rect));
    }, 0);
  }
  function touches(a, b) {
    var overlapX = Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0);
    var overlapY = Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0);
    var contactX = Math.abs(a.x1 - b.x0) < CONTACT || Math.abs(b.x1 - a.x0) < CONTACT;
    var contactY = Math.abs(a.y1 - b.y0) < CONTACT || Math.abs(b.y1 - a.y0) < CONTACT;
    return (contactX && overlapY > 0) || (contactY && overlapX > 0);
  }
  function rectanglesOverlap(a, b) {
    return Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0) > 0.005 &&
      Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0) > 0.005;
  }
  /* Depuis D2, le rectangle utile d'une pièce dont les parties pavent leur
     boîte englobante est cette boîte : la bande de rangement s'y trouve alors
     *incluse* au lieu d'être accolée. Une bande incluse est rattachée, et
     mieux que si elle était en contact — exiger un contact d'arête ferait
     échouer la règle sur les pièces les plus régulières. */
  function rattache(main, part) {
    var inclus = part.x0 >= main.x0 - CONTACT && part.x1 <= main.x1 + CONTACT &&
      part.y0 >= main.y0 - CONTACT && part.y1 <= main.y1 + CONTACT;
    return inclus || touches(main, part);
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
  function adjacencyRequirements(plan) {
    return plan.adjacencyRequirements || plan.requestedEdges || [];
  }
  function adjacencyRealized(plan, requested) {
    /* Une porte interdite est une communication interdite, pas l'interdiction
       de partager un mur. O4 donne enfin assez d'information pour distinguer
       les deux ; le candidat nu conserve le contact comme proxy de score,
       tandis que le verdict construit lit l'ouverture réellement posée. */
    if (requested.degre === 'interdite' && requested.nature === 'porte' && Array.isArray(plan.portes)) {
      return plan.portes.some(function (porte) {
        var entre = porte.entre || [];
        return entre.indexOf(requested.a) >= 0 && entre.indexOf(requested.b) >= 0;
      });
    }
    return plan.edges.some(function (edge) {
      var same = (edge.a === requested.a && edge.b === requested.b) ||
        (edge.a === requested.b && edge.b === requested.a);
      return same && (edge.contact || 0) > CONTACT;
    });
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
      id: 'TH2D-WALL-001', level: 'HARD', label: 'Référentiel de murs sans doublon',
      evaluate: function (plan) {
        if (!plan.walls) return [];
        var seen = {};
        var violations = [];
        plan.walls.forEach(function (wall) {
          if (seen[wall.id]) violations.push({ entityId: wall.id, message: 'Le mur ' + wall.id + ' est exporté plusieurs fois.' });
          seen[wall.id] = true;
          if (wall.between && wall.between[0] === wall.between[1]) {
            violations.push({ entityId: wall.id, message: 'Le mur ' + wall.id + ' sépare une pièce d’elle-même.' });
          }
        });
        (plan.wallDiagnostics && plan.wallDiagnostics.overlaps || []).forEach(function (pair) {
          violations.push({ entityId: pair, message: 'Les pièces ' + pair + ' se chevauchent : leur frontière ne peut pas devenir un mur unique.' });
        });
        return violations;
      }
    },
    {
      id: 'TH2D-WALL-002', level: 'HARD', label: 'Épaisseurs constructives admises',
      evaluate: function (plan) {
        if (!plan.construction) return [];
        var limits = root.TechnoHabConstruction && root.TechnoHabConstruction.limits;
        if (!limits) return [];
        var violations = [];
        ['exteriorWallThickness', 'interiorWallThickness'].forEach(function (key) {
          var value = plan.construction[key];
          var range = limits[key];
          if (value < range.min - EPSILON || value > range.max + EPSILON) {
            violations.push({
              entityId: 'construction', mesure: value, seuil: range.min + '–' + range.max,
              message: key + ' vaut ' + value + ' m, hors de la plage ' + range.min + '–' + range.max + ' m.'
            });
          }
        });
        return violations;
      }
    },
    {
      id: 'TH2D-WALL-003', level: 'HARD', label: 'Murs hors des surfaces utiles',
      evaluate: function (plan) {
        if (!plan.wallDiagnostics) return [];
        var overlap = plan.wallDiagnostics.usableWallOverlapArea || 0;
        var roomOverlaps = plan.wallDiagnostics.usableOverlaps || [];
        var violations = roomOverlaps.map(function (pair) {
          return { entityId: pair, message: 'Les surfaces utiles de ' + pair + ' se chevauchent.' };
        });
        if (overlap > 0.005) {
          violations.push({
            entityId: 'construction', mesure: overlap, seuil: 0.005,
            message: overlap.toFixed(3) + ' m² de mur chevauchent encore une surface utile.'
          });
        }
        return violations;
      }
    },
    {
      id: 'TH2D-WALL-004', level: 'HARD', label: 'Conservation des surfaces constructives',
      evaluate: function (plan) {
        if (typeof plan.grossFloorArea !== 'number') return [];
        var conservation = Math.abs(plan.surfaceConservationError || 0);
        var target = Math.abs(plan.habitableTargetError || 0);
        var coverage = Math.abs(plan.surfaceCoverageError || 0);
        var violations = [];
        if (conservation > 0.01) {
          violations.push({
            entityId: 'construction', mesure: conservation, seuil: 0.01,
            message: 'L’emprise brute diffère de la somme surface habitable + murs de ' + conservation.toFixed(3) + ' m².'
          });
        }
        if (target > 0.01) {
          violations.push({
            entityId: 'project', mesure: target, seuil: 0.01,
            message: 'La surface habitable obtenue s’écarte de la demande de ' + target.toFixed(3) + ' m².'
          });
        }
        if (coverage > 0.01) {
          violations.push({ entityId: 'construction', message: 'La partition n’est pas entièrement couverte par les surfaces utiles et les cloisons.' });
        }
        return violations;
      }
    },
    {
      id: 'TH2D-WALL-005', level: 'HARD', label: 'Ouvertures contenues dans leurs murs',
      evaluate: function (plan) {
        if (!plan.walls) return [];
        var clearance = root.TechnoHabConstruction && root.TechnoHabConstruction.openingJunctionClearance || 0.08;
        var walls = {};
        plan.walls.forEach(function (wall) { walls[wall.id] = wall; });
        var reservations = {};
        (plan.reservations || []).forEach(function (reservation) { reservations[reservation.id] = reservation; });
        var openings = (plan.portes || []).concat(plan.entree ? [plan.entree] : [], plan.fenetres || []);
        var violations = [];
        openings.forEach(function (opening) {
          var wall = walls[opening.wallId];
          var reservation = reservations[opening.reservationId];
          if (!wall || !reservation) {
            violations.push({ entityId: opening.id, message: 'L’ouverture ' + opening.id + ' ne référence pas un mur et une réservation valides.' });
            return;
          }
          if (reservation.wallId !== wall.id || reservation.openingId !== opening.id) {
            violations.push({ entityId: opening.id, message: 'La réservation ' + reservation.id + ' ne correspond pas à son ouverture et à son mur.' });
            return;
          }
          var start = wall.orientation === 'vertical' ? wall.axis.y0 : wall.axis.x0;
          var end = wall.orientation === 'vertical' ? wall.axis.y1 : wall.axis.x1;
          var measured = Math.min(reservation.start - start, end - reservation.end);
          if (measured < clearance - 0.001) {
            violations.push({
              entityId: opening.id, mesure: measured, seuil: clearance,
              message: 'L’ouverture ' + opening.id + ' ne conserve que ' + measured.toFixed(2) + ' m avant une jonction.'
            });
          }
          if (wall.openings.indexOf(opening.id) < 0) {
            violations.push({ entityId: opening.id, message: 'Le mur ' + wall.id + ' ne référence pas l’ouverture ' + opening.id + '.' });
          }
          if (!wall.reservations.some(function (wallReservation) { return wallReservation.id === reservation.id; })) {
            violations.push({ entityId: opening.id, message: 'Le mur ' + wall.id + ' ne référence pas la réservation ' + reservation.id + '.' });
          }
        });
        (plan.wallDiagnostics && plan.wallDiagnostics.rejectedOpenings || []).forEach(function (rejected) {
          violations.push({
            entityId: rejected.openingId,
            message: 'La réservation de ' + rejected.openingId + ' a été refusée (' + rejected.reason + ').'
          });
        });
        return violations;
      }
    },
    {
      id: 'TH2D-WALL-006', level: 'HARD', label: 'Équipements ancrés sur une face intérieure',
      evaluate: function (plan) {
        var violations = [];
        (plan.rooms || []).forEach(function (room) {
          if (!Array.isArray(room.placements)) return;
          var faces = {};
          (room.wallFaces || []).forEach(function (face) { faces[face.id] = face; });
          room.placements.forEach(function (placement) {
            if (placement.anchor === 'free') return;
            var face = faces[placement.faceId];
            if (!face || face.wallId !== placement.wallId) {
              violations.push({
                entityId: room.id + ':' + placement.equipmentId,
                message: placement.equipmentId + ' n’est pas ancré sur une face intérieure disponible de ' + room.label + '.'
              });
            }
          });
        });
        return violations;
      }
    },
    {
      id: 'TH2D-DOOR-004', level: 'HARD', label: 'Débattement libre des équipements et zones d’usage',
      evaluate: function (plan) {
        return (plan.portes || []).concat(plan.entree ? [plan.entree] : []).filter(function (door) {
          return door.s3Passed === false;
        }).map(function (door) {
          return {
            entityId: door.id,
            message: 'Le débattement de ' + door.id + ' recouvre une emprise ou une zone d’usage requise.'
          };
        });
      }
    },
    {
      id: 'TH2D-PATH-004', level: 'HARD', label: 'Zones d’usage reliées à une porte',
      evaluate: function (plan) {
        if (!plan.s4) return [];
        var failedRooms = (plan.rooms || []).filter(function (room) {
          return room.s4 && room.s4.passes === false;
        });
        if (!failedRooms.length && plan.s4.passes === false) {
          return [{ entityId: 'plan', message: 'Le verdict S4 du plan est négatif sans pièce fautive identifiée.' }];
        }
        return failedRooms.map(function (room) {
          var missing = Math.max(0, room.s4.requiredUsageZones - room.s4.reachableUsageZones);
          return {
            entityId: room.id,
            mesure: room.s4.reachableUsageZones,
            seuil: room.s4.requiredUsageZones,
            message: missing + ' zone(s) d’usage requise(s) de ' + room.label +
              ' ne rejoignent aucune porte par un passage libre de ' +
              (room.s4.clearance || 0.60).toFixed(2).replace('.', ',') + ' m.'
          };
        });
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
      id: 'TH2D-ROOM-003', level: 'HARD', label: 'Surface contenue dans l’enveloppe du profil',
      canonicalValueId: 'VAL-WC-PROGRAM-AREA-MAX-RATIO-001',
      evaluate: function (plan) {
        var fit = root.TechnoHabFit;
        if (!fit || !fit.maxRatioOf || !fit.smallest) return [];
        return plan.rooms.reduce(function (violations, room) {
          var ratio = fit.maxRatioOf(room.type);
          var besoin = fit.smallest(room.type);
          // Une composition suit l'enveloppe de son hôte : le plafond du WC
          // séparé ne s'applique pas à une salle d'eau qui l'absorbe.
          if (!Number.isFinite(ratio) || !besoin || fit.agrementOf(room.type) !== 0 ||
              (room.composedWith || []).length) return violations;
          var plafond = besoin.w * besoin.h * ratio;
          var mesure = roomArea(room);
          if (mesure > plafond + 0.05) {
            violations.push({
              entityId: room.id, mesure: mesure, seuil: plafond,
              message: room.label + ' mesure ' + mesure.toFixed(2) + ' m² pour une enveloppe maximale de ' +
                plafond.toFixed(2) + ' m².'
            });
          }
          return violations;
        }, []);
      }
    },
    {
      id: 'TH2D-ADJ-001', level: 'HARD', label: 'Adjacences obligatoires desservies',
      evaluate: function (plan) {
        var violations = [];
        adjacencyRequirements(plan).filter(function (requested) {
          return !requested.degre || requested.degre === 'obligatoire';
        }).forEach(function (requested) {
          var minimum = Number.isFinite(requested.contact) ? requested.contact : (plan.minDesserte || 1.0);
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
      id: 'TH2D-ADJ-002', level: 'HARD', label: 'Adjacences interdites absentes',
      evaluate: function (plan) {
        return adjacencyRequirements(plan).filter(function (requested) {
          return requested.degre === 'interdite' && adjacencyRealized(plan, requested);
        }).map(function (requested) {
          return {
            entityId: requested.a + ':' + requested.b,
            mesure: 1, seuil: 0,
            message: 'L’adjacence interdite ' + requested.a + ' ↔ ' + requested.b + ' est réalisée.'
          };
        });
      }
    },
    {
      id: 'TH2D-ADJ-003', level: 'GUIDELINE', label: 'Adjacences souhaitables',
      evaluate: function (plan) {
        return adjacencyRequirements(plan).filter(function (requested) {
          return requested.degre === 'souhaitable' && !adjacencyRealized(plan, requested);
        }).map(function (requested) {
          return {
            entityId: requested.a + ':' + requested.b,
            mesure: 0, seuil: 1,
            message: 'L’adjacence souhaitable ' + requested.a + ' ↔ ' + requested.b + ' n’est pas réalisée.'
          };
        });
      }
    },
    {
      id: 'TH2D-ADJ-004', level: 'GUIDELINE', label: 'Adjacences déconseillées',
      evaluate: function (plan) {
        return adjacencyRequirements(plan).filter(function (requested) {
          return requested.degre === 'deconseillee' && adjacencyRealized(plan, requested);
        }).map(function (requested) {
          return {
            entityId: requested.a + ':' + requested.b,
            mesure: 1, seuil: 0,
            message: 'L’adjacence déconseillée ' + requested.a + ' ↔ ' + requested.b + ' est réalisée.'
          };
        });
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
         signale.

         La règle interroge le RÔLE de la pièce, plus la liste de ses types.
         Elle portait « living, bedroom, kitchen, dining, bureau » en dur, et
         il fallait l'allonger à la main à chaque pièce ajoutée — un oubli s'y
         serait lu comme une règle qui passe. Une pièce nouvelle y entre
         désormais en déclarant `role: 'principale'` dans le socle. */
      id: 'TH2D-FACADE-001', level: 'HARD', label: 'Pièce principale en façade',
      evaluate: function (plan) {
        var fit = root.TechnoHabFit;
        if (!plan.facades || !fit || !fit.roleOf) return [];
        return plan.rooms.filter(function (room) {
          if (fit.roleOf(room.type) !== 'principale') return false;
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
      canonicalValueId: 'VAL-LIVING-PROGRAM-AREA-TARGET-001',
      evaluate: function (plan) {
        var canonical = root.TechnoHabCanonicalValues && root.TechnoHabCanonicalValues.get('VAL-LIVING-PROGRAM-AREA-TARGET-001');
        var fitEntry = root.TechnoHabFit && root.TechnoHabFit.envelopes && root.TechnoHabFit.envelopes.living;
        var target = canonical && Number.isFinite(canonical.value) ? canonical.value
          : fitEntry && Number.isFinite(fitEntry.targetProgramArea) ? fitEntry.targetProgramArea : null;
        if (!Number.isFinite(target)) return [];
        return plan.rooms.filter(function (room) { return room.type === 'living' && roomArea(room) < target; }).map(function (room) {
          return { entityId: room.id, mesure: roomArea(room), seuil: target, message: 'Le séjour gagnerait à atteindre ' + target + ' m².' };
        });
      }
    },
    {
      id: 'TH2D-LIVING-001', level: 'GUIDELINE', label: 'Vide utile du séjour',
      canonicalValueId: 'VAL-LIVING-FURNITURE-RATIO-MAX-001',
      evaluate: function (plan) {
        return plan.rooms.filter(function (room) {
          return room.type === 'living' && room.furnitureOccupancy &&
            Number.isFinite(room.furnitureOccupancy.maximum) && !room.furnitureOccupancy.passes;
        }).map(function (room) {
          return {
            entityId: room.id,
            mesure: room.furnitureOccupancy.ratio,
            seuil: room.furnitureOccupancy.maximum,
            message: 'Le mobilier occupe ' + Math.round(room.furnitureOccupancy.ratio * 100) +
              ' % du séjour, au-delà de la cible de ' +
              Math.round(room.furnitureOccupancy.maximum * 100) + ' %.'
          };
        });
      }
    },
    {
      id: 'TH2D-CIRC-001', level: 'HARD', label: 'Largeur de circulation praticable',
      canonicalValueIds: ['VAL-CIRC-CLEAR-WIDTH-SIMPLE-MIN-001',
        'VAL-CIRC-CLEAR-WIDTH-CROSSING-MIN-001', 'VAL-CIRC-CROSSING-SERVICE-COUNT-001'],
      evaluate: function (plan) {
        return plan.rooms.filter(function (room) {
          var services = degree(plan, room.id);
          var threshold = plan.circulationCrossingServices || CIRCULATION_CROSSING_SERVICES;
          var minimum = services >= threshold
            ? (plan.crossingCirculationWidth || CROSSING_CIRCULATION_WIDTH)
            : (plan.minCirculationWidth || MIN_CIRCULATION_WIDTH);
          return room.type === 'circulation' && largeurCirculationMin(room) + 0.005 < minimum;
        }).map(function (room) {
          var services = degree(plan, room.id);
          var threshold = plan.circulationCrossingServices || CIRCULATION_CROSSING_SERVICES;
          var minimum = services >= threshold
            ? (plan.crossingCirculationWidth || CROSSING_CIRCULATION_WIDTH)
            : (plan.minCirculationWidth || MIN_CIRCULATION_WIDTH);
          return {
            entityId: room.id, mesure: largeurCirculationMin(room), seuil: minimum,
            message: room.label + ' ne fait que ' + largeurCirculationMin(room).toFixed(2) +
              ' m de large, pour un minimum de ' + minimum.toFixed(2) + ' m avec ' +
              services + ' espace(s) desservi(s).'
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
      canonicalValueId: 'VAL-CIRC-CLEAR-WIDTH-MAX-001',
      evaluate: function (plan) {
        var maximum = plan.maxCirculationWidth || MAX_CIRCULATION_WIDTH;
        return plan.rooms.filter(function (room) {
          return room.type === 'circulation' && largeurCirculationMax(room) > maximum + 0.005;
        }).map(function (room) {
          return {
            entityId: room.id, mesure: largeurCirculationMax(room), seuil: maximum,
            message: room.label + ' fait ' + largeurCirculationMax(room).toFixed(2) +
              ' m de large : au-delà de ' + maximum.toFixed(2) + ' m, ce n’est plus un couloir mais une pièce.'
          };
        });
      }
    },
    {
      /* M3.0 — règle explicitement suspendue le 27 août 2026.

         Son seuil 1,6 venait du 90e centile des plans du moteur : l'employer
         comme norme entérinait le défaut qu'elle devait détecter. La nouvelle
         grandeur (`plan.circulationObjective`) mesure la longueur par service
         et la part de circulation, mais aucun corpus externe ne donne encore
         de seuil de conformité. Le rapport remonte donc une LIMITATION, pas
         une violation de l'utilisateur. Le score peut minimiser une grandeur
         continue sans prétendre qu'un nombre interne est une règle. */
      id: 'TH2D-CIRC-004', level: 'GUIDELINE', label: 'Circulation contenue au regard de sa desserte',
      evaluate: function (plan) {
        var metric = plan.circulationObjective;
        if (!metric || !(metric.length > 0)) return [];
        return [{
          entityId: 'project', mesure: metric.metersPerRequestedService,
          message: 'La circulation mesure ' + metric.length.toFixed(1) + ' m de branches, soit ' +
            metric.metersPerRequestedService.toFixed(2) + ' m par desserte demandée ; aucun seuil externe ne permet encore d’en faire une conformité.'
        }];
      }
    },
    {
      id: 'TH2D-RANGEMENT-001', level: 'HARD', label: 'Proportions de la zone de rangement',
      canonicalValueIds: ['VAL-STORAGE-BAY-DEPTH-MIN-001', 'VAL-STORAGE-BAY-DEPTH-LENGTH-RATIO-MAX-001'],
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
              violations.push({ entityId: room.id, mesure: depth, seuil: minimum, message: 'La zone de rangement de ' + room.label + ' n’a que ' + depth.toFixed(2) + ' m de profondeur.' });
            } else if (depth > ratio * length + 0.005) {
              violations.push({ entityId: room.id, mesure: depth / length, seuil: ratio, message: 'La zone de rangement de ' + room.label + ' est trop profonde pour sa longueur : ce n’est plus une bande.' });
            }
          });
        });
        return violations;
      }
    },
    {
      id: 'TH2D-RANGEMENT-002', level: 'HARD', label: 'Zone de rangement rattachée à sa pièce',
      evaluate: function (plan) {
        var violations = [];
        plan.rooms.forEach(function (room) {
          var main = usable(room);
          storageParts(room).forEach(function (part) {
            if (!rattache(main, part)) {
              violations.push({ entityId: room.id, message: 'La zone de rangement de ' + room.label + ' n’est pas attenante à la pièce.' });
            }
          });
        });
        return violations;
      }
    },
    {
      id: 'TH2D-RANGEMENT-003', level: 'GUIDELINE', label: 'Équipement de rangement en chambre',
      evaluate: function (plan) {
        var bedrooms = plan.rooms.filter(function (room) { return room.type === 'bedroom'; });
        var without = bedrooms.filter(function (room) {
          return !(room.placements || []).some(function (placement) {
            return placement.equipmentId === 'wardrobe';
          });
        });
        if (!without.length) return [];
        // Un message unique plutôt qu'un par chambre : la même remarque
        // répétée quatre fois noie le reste du rapport.
        return [{
          entityId: 'project',
          mesure: bedrooms.length - without.length, seuil: bedrooms.length,
          message: without.length + ' chambre(s) sur ' + bedrooms.length + ' sans penderie réellement posée.'
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
      /* Chantier 1 — l'enveloppe n'est plus un rectangle : une pièce peut
         désormais déborder dans l'encoche d'un L ou d'un U sans que rien ne
         le signale, puisque la boîte englobante, elle, la contient. La règle
         garde l'invariant que la découpe par volumes est censée tenir. */
      id: 'TH2D-BOUNDARY-008', level: 'HARD', label: 'Pièces contenues dans l’enveloppe',
      evaluate: function (plan) {
        var volumes = plan.boundary && plan.boundary.volumes;
        if (!volumes || !volumes.length) return [];
        var violations = [];
        plan.rooms.forEach(function (room) {
          parts(room).forEach(function (part) {
            var dedans = volumes.some(function (volume) {
              return part.x0 >= volume.x0 - CONTACT && part.x1 <= volume.x1 + CONTACT &&
                part.y0 >= volume.y0 - CONTACT && part.y1 <= volume.y1 + CONTACT;
            });
            if (!dedans) {
              violations.push({
                entityId: room.id,
                message: room.label + ' déborde de l’enveloppe : une partie sort des volumes bâtis.'
              });
            }
          });
        });
        return violations;
      }
    },
    {
      /* D1 — jusqu'ici le moteur pouvait retenir un plan sans accès depuis
         l'extérieur et se contenter de le signaler dans le détail de
         l'entrée. Un logement dans lequel on n'entre pas n'est pas un
         logement : le verdict est bloquant. La pièce d'accueil doit exister,
         être éligible, et offrir de quoi poser un vantail de 0,90 m. */
      id: 'TH2D-ENTREE-001', level: 'HARD', label: 'Entrée depuis l’extérieur',
      canonicalValueIds: ['VAL-ENTRY-DOOR-BAY-WIDTH-001',
        'VAL-ENTRY-DOOR-LEAF-WIDTH-001', 'VAL-ENTRY-CLEAR-WIDTH-001'],
      evaluate: function (plan) {
        if (!plan.entree) {
          return [{ entityId: 'plan', message: 'Aucune pièce en façade ne peut recevoir l’entrée : le logement n’a pas d’accès depuis l’extérieur.' }];
        }
        if (plan.entree.mur + 0.005 < plan.entree.largeur) {
          var accueil = plan.rooms.find(function (room) {
            return (plan.entree.entre || []).indexOf(room.id) !== -1;
          });
          return [{
            entityId: accueil ? accueil.id : 'plan',
            message: 'La façade de ' + (accueil ? accueil.label : 'la pièce d’accueil') + ' ne mesure que ' +
              plan.entree.mur.toFixed(2) + ' m : trop peu pour une porte d’entrée de ' +
              plan.entree.largeur.toFixed(2) + ' m.'
          }];
        }
        return [];
      }
    },
    {
      id: 'TH2D-ENTREE-002', level: 'HARD', label: 'Zone d’arrivée intérieure libre',
      canonicalValueIds: ['VAL-ENTRY-ARRIVAL-WIDTH-MIN-001', 'VAL-ENTRY-ARRIVAL-DEPTH-MIN-001'],
      evaluate: function (plan) {
        if (!plan.entree) return [];
        var zone = plan.entree.arrivalZone;
        var minimumWidth = canonicalNumber('VAL-ENTRY-ARRIVAL-WIDTH-MIN-001', 1.2);
        var minimumDepth = canonicalNumber('VAL-ENTRY-ARRIVAL-DEPTH-MIN-001', 1.2);
        var roomId = (plan.entree.entre || []).find(function (id) { return id !== 'exterior'; });
        var room = plan.rooms.find(function (candidate) { return candidate.id === roomId; });
        if (!zone || !room) {
          return [{
            entityId: roomId || 'plan', mesure: 0, seuil: minimumWidth * minimumDepth,
            message: 'Le seuil d’entrée ne réserve aucune zone d’arrivée intérieure.'
          }];
        }
        var width = Math.abs(zone.x1 - zone.x0);
        var depth = Math.abs(zone.y1 - zone.y0);
        if (Math.min(width, depth) + 0.005 < Math.min(minimumWidth, minimumDepth) ||
            Math.max(width, depth) + 0.005 < Math.max(minimumWidth, minimumDepth)) {
          return [{
            entityId: room.id, mesure: Math.min(width, depth),
            seuil: Math.min(minimumWidth, minimumDepth),
            message: 'La zone d’arrivée de ' + room.label + ' ne mesure que ' +
              width.toFixed(2) + ' × ' + depth.toFixed(2) + ' m.'
          }];
        }
        var origin = room.usableBounds || room.usableRect || usable(room);
        var conflicts = (room.placements || []).filter(function (placement) {
          var footprint = placement.footprint;
          if (!footprint) return false;
          return rectanglesOverlap(zone, {
            x0: origin.x0 + footprint.x0, y0: origin.y0 + footprint.y0,
            x1: origin.x0 + footprint.x1, y1: origin.y0 + footprint.y1
          });
        });
        return conflicts.length ? [{
          entityId: room.id, mesure: conflicts.length, seuil: 0,
          message: 'La zone d’arrivée intérieure est occupée par ' +
            conflicts.map(function (placement) { return placement.label || placement.equipmentId; }).join(', ') + '.'
        }] : [];
      }
    },
    {
      id: 'TH2D-ROOM-002', level: 'HARD', label: 'Pièce meublable',
      evaluate: function (plan) {
        // Quand le solveur à la demande a travaillé sur le polygone utile et
        // les faces M4, son verdict est l'autorité. Avant son chargement, le
        // cache reste un repli rapide mais mesure désormais la boîte utile,
        // et non plus le rectangle de partition antérieur aux cloisons.
        var fit = root.TechnoHabFit;
        if (!fit || !fit.fits) return [];
        // Une pièce composée doit loger les deux programmes. Le cache ne
        // connaît que les types simples : faute d'une entrée « salle d'eau
        // avec WC », on exige que chacun tienne dans le rectangle et que
        // l'aire couvre au moins la somme des deux plus petits rectangles
        // meublables. Nécessaire, pas suffisant — le verdict exact demande
        // une entrée de cache dédiée aux compositions (D3, reste ouvert).
        function loge(room, largeur, hauteur) {
          if (!fit.fits(room.type, largeur, hauteur)) return false;
          var propre = fit.smallest(room.type);
          return (room.composedWith || []).every(function (absorbe) {
            if (!fit.fits(absorbe, largeur, hauteur)) return false;
            var besoin = fit.smallest(absorbe);
            return !besoin || !propre ||
              largeur * hauteur >= besoin.w * besoin.h + propre.w * propre.h;
          });
        }
        return plan.rooms.filter(function (room) {
          if (typeof room.furnishable === 'boolean') return !room.furnishable;
          // Hors rectangle, `fit.data.js` n'est qu'un index de présélection.
          // Sans verdict polygonal publié, la règle s'abstient plutôt que de
          // fabriquer un vrai ou un faux positif sur la boîte englobante.
          if (room.usablePolygon && room.usablePolygon.length) {
            var placement = root.TechnoHabPlacement;
            if (!placement || !placement.polygonIsRectangle ||
                !placement.polygonIsRectangle(room.usablePolygon)) return false;
          }
          var main = room.usableBounds || usable(room);
          return !loge(room, main.x1 - main.x0, main.y1 - main.y0);
        }).map(function (room) {
          var main = room.usableBounds || usable(room);
          var need = fit.smallest(room.type);
          return {
            entityId: room.id,
            message: room.label + ' mesure ' + (main.x1 - main.x0).toFixed(2) + ' × ' +
              (main.y1 - main.y0).toFixed(2) + ' m et ne peut pas recevoir son mobilier' +
              ((room.composedWith || []).length ? ', programme composé compris,' : '') +
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
    'TH2D-CIRC-004': {
      depuis: '2026-08-27',
      cause: 'L’ancien seuil 1,6 était le 90e centile du moteur lui-même et entérinait ses couloirs trop longs.',
      mesure: 'Longueur, mètres par desserte et part de circulation publiés par scripts/measure-m3-circulation.mjs ; seuil volontairement absent.',
      suite: 'Calibrer un seuil sur le corpus externe de M6, puis réactiver la règle sans recalcul autoréférentiel.'
    },
    'TH2D-CIRC-003': {
      depuis: '2026-08-15',
      cause: 'La cession du surplus de couloir échoue lorsqu’un de ses côtés n’est pas entièrement bordé : elle est alors refusée pour ne pas laisser de surface sans propriétaire.',
      mesure: '70 manquements sur 360 plans, 24 configurations — scripts/scan-seeds.mjs, 2026-08-17',
      suite: 'Autoriser une cession partielle, ce qui suppose un couloir non rectangulaire'
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
