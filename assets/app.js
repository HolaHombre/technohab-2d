(function (root) {
  'use strict';

  /* Chantier 6 §6.4 — cette version est journalisée avec chaque avis. Toute
     modification du moteur — `scoreCandidate`, la découpe, les enveloppes —
     doit la faire monter, sans quoi le journal mélangera des jugements
     portant sur des plans que le code ne produit plus. */
  var APP_VERSION = '3.3.0-alpha.1';
  var STORAGE_KEY = 'technohab:mvp-2d:v2';
  var HISTORY_KEY = 'technohab:mvp-2d:history:v1';
  var HISTORY_MAX = 20;
  var SVG_NS = 'http://www.w3.org/2000/svg';
  var form = document.getElementById('plan-form');
  var generationButton = form.querySelector('button[type="submit"]');
  var planSvg = document.getElementById('plan-svg');
  var rulesList = document.getElementById('rules-list');
  var rulesMeta = document.getElementById('rules-meta');
  var rulesHistory = document.getElementById('rules-history');
  var statusElement = document.getElementById('generation-status');
  var resolutionNotice = document.getElementById('resolution-notice');
  var resolutionRequested = document.getElementById('resolution-requested');
  var resolutionProposed = document.getElementById('resolution-proposed');
  var resolutionChanges = document.getElementById('resolution-changes');
  var resolutionConsent = document.getElementById('resolution-consent');
  var resolutionConsentCheck = document.getElementById('resolution-consent-check');
  var resolutionActivate = document.getElementById('resolution-activate');
  var resolutionConsentStatus = document.getElementById('resolution-consent-status');
  var planSelection = document.getElementById('plan-selection');
  var planSelectionTabs = document.getElementById('plan-selection-tabs');
  var planSelectionSummary = document.getElementById('plan-selection-summary');
  var planSelectionCompromise = document.getElementById('plan-selection-compromise');
  var planView = document.getElementById('plan-view');
  var jsonExportButton = document.getElementById('download-json');
  var analysisOpenButton = document.getElementById('analysis-open');
  var analysisExportButton = document.getElementById('download-analysis');
  var svgExportButton = document.getElementById('download-svg');
  var latestResult = null;
  var pendingResolution = null;
  var activeResolvedSelection = null;
  var activeSelectionConsent = null;
  var activeSelectionIndex = 0;
  var activeSelectionVisited = {};
  var generationRequest = 0;
  var variant = 1;
  var history = [];
  var pendingSeed;
  var analysisController = null;
  var analysisLoading = null;
  var generationStartedAt = null;
  var latestGenerationPerformance = null;
  var generationBusy = false;
  var clickLockUntil = 0;
  var PATHS_KEY = 'technohab:parcours:v1';
  var pathsToggle = document.getElementById('show-paths');
  var afficherParcours = false;
  try { afficherParcours = localStorage.getItem(PATHS_KEY) === '1'; } catch (_) { /* facultatif */ }
  var FURNITURE_KEY = 'technohab:mobilier:v2';
  var furnitureToggle = document.getElementById('show-furniture');
  var afficherMobilier = true;
  try {
    var furniturePreference = localStorage.getItem(FURNITURE_KEY);
    if (furniturePreference !== null) afficherMobilier = furniturePreference === '1';
  } catch (_) { /* facultatif */ }

  // Signature grossière du plan : position des pièces principales, arrondie au
  // mètre. Deux plans de même signature ne sont pas deux variantes.
  function planSignature(plan) {
    return plan.rooms.filter(function (room) { return room.type === 'living' || room.type === 'bedroom'; })
      .map(function (room) { return room.id + '@' + Math.round(room.x0) + ',' + Math.round(room.y0); })
      .sort().join('|');
  }

  function loadHistory() {
    try { history = JSON.parse(localStorage.getItem(HISTORY_KEY)) || []; } catch (_) { history = []; }
  }
  function saveHistory() {
    try { localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, HISTORY_MAX))); } catch (_) { /* facultatif */ }
  }
  function renderHistory() {
    rulesHistory.innerHTML = '';
    history.forEach(function (entry) {
      var item = document.createElement('li');
      item.className = 'history-item';
      if (entry.seed) { item.dataset.seed = entry.seed; item.title = 'Rejouer la graine ' + entry.seed; }
      var time = new Date(entry.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      item.innerHTML = '<strong>' + (entry.seed || 'v' + entry.variant) + '</strong>' +
        '<span>' + time + ' · ' + entry.evaluatedRules + ' règle(s) évaluée(s), ' +
        entry.hard + ' bloquante(s), ' + entry.guideline + ' conseil(s)' +
        (entry.limites ? ', ' + entry.limites + ' limite(s) moteur' : '') + ' · candidat ' +
        entry.candidate + '/' + (entry.budget || '—') +
        (entry.selectionRank ? ' · plan ' + entry.selectionRank + '/' + entry.selectionSize : '') +
        (entry.repeated ? ' · disposition déjà vue' : '') + '</span>';
      rulesHistory.appendChild(item);
    });
  }

  document.getElementById('app-version').textContent = 'v' + APP_VERSION;
  function readForm() {
    var data = new FormData(form);
    return root.TechnoHabGenerator.normalizeOptions({
      surface: data.get('surface'), bedrooms: data.get('bedrooms'), bathrooms: data.get('bathrooms'),
      separateKitchen: data.get('separateKitchen') === 'on', includeWc: data.get('includeWc') === 'on',
      officeType: data.get('officeType'), priority: data.get('priority'), shape: data.get('shape')
    });
  }
  function restoreForm() {
    try {
      var saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (!saved) return;
      Object.keys(saved).forEach(function (key) {
        var field = form.elements.namedItem(key);
        if (!field) return;
        if (field.type === 'checkbox') field.checked = Boolean(saved[key]);
        else field.value = String(saved[key]);
      });
    } catch (_) { /* stockage facultatif */ }
  }
  function svgElement(name, attributes) {
    var element = document.createElementNS(SVG_NS, name);
    Object.keys(attributes || {}).forEach(function (key) { element.setAttribute(key, String(attributes[key])); });
    return element;
  }
  var LABEL_HEIGHT = 0.22;
  var META_HEIGHT = 0.18;
  var ICON_GAP = 0.14;
  var ICON_MIN = 0.5;
  var ICON_MAX = 1.5;

  function iconSymbol(type) {
    return document.getElementById('icon-' + type);
  }

  function iconRotation(symbol, width, height) {
    if (symbol.dataset.rotatable !== 'true') return 0;
    var drawn = symbol.dataset.orient;
    if (drawn === 'square') return 0;
    var room = width >= height * 1.25 ? 'landscape' : height >= width * 1.25 ? 'portrait' : 'square';
    if (room === 'square' || room === drawn) return 0;
    return 90;
  }

  // Le bloc central n'apparaît qu'au survol. Sa composition reste adaptative :
  // le pictogramme disparaît avant le nom et les mesures.
  function composeRoomContent(room, symbol) {
    var width = room.x1 - room.x0;
    var height = room.y1 - room.y0;
    var shortSide = Math.min(width, height);
    var textHeight = LABEL_HEIGHT + META_HEIGHT;
    var iconSize = 0;

    if (symbol && shortSide >= 1.2) {
      iconSize = Math.min(ICON_MAX, shortSide * 0.44, (height - textHeight - ICON_GAP) * 0.8);
      if (iconSize < ICON_MIN || iconSize + ICON_GAP + textHeight > height * 0.94) iconSize = 0;
    }

    var offset = iconSize ? iconSize + ICON_GAP : 0;
    var top = (room.y0 + room.y1) / 2 - (textHeight + offset) / 2;
    return {
      width: width, height: height, iconSize: iconSize,
      centerX: (room.x0 + room.x1) / 2,
      iconY: top,
      labelY: top + offset + LABEL_HEIGHT / 2,
      metaY: top + offset + LABEL_HEIGHT + META_HEIGHT / 2
    };
  }

  function formatMeasure(value, decimals) {
    return Number(value).toFixed(decimals).replace(/0+$/, '').replace(/\.$/, '').replace('.', ',');
  }

  function polygonPath(polygon) {
    return (polygon || []).map(function (ring) {
      if (!ring.length) return '';
      return 'M' + ring.map(function (point) { return point.x + ' ' + point.y; }).join('L') + 'Z';
    }).join(' ');
  }

  function renderWalls(plan) {
    if (!plan.walls || !plan.walls.length) return;
    var group = svgElement('g', { class: 'plan-walls', 'aria-hidden': 'true' });
    plan.walls.forEach(function (wall) {
      var caps = wall.caps || { start: 0, end: 0 };
      var solids = wall.solidSegments || [];
      solids.forEach(function (segment, index) {
        // Les prolongements d'angle appartiennent aux abouts du mur : ils ne
        // s'appliquent qu'au premier et au dernier plein, jamais de part et
        // d'autre d'une baie.
        var start = segment.start - (index === 0 ? caps.start : 0);
        var end = segment.end + (index === solids.length - 1 ? caps.end : 0);
        var rectangle = wall.orientation === 'vertical'
          ? { x: wall.volume.x0, y: start, width: wall.volume.x1 - wall.volume.x0, height: end - start }
          : { x: start, y: wall.volume.y0, width: end - start, height: wall.volume.y1 - wall.volume.y0 };
        group.appendChild(svgElement('rect', {
          x: rectangle.x, y: rectangle.y, width: rectangle.width, height: rectangle.height,
          class: 'plan-wall plan-wall--' + wall.kind,
          'data-wall-id': wall.id, 'vector-effect': 'non-scaling-stroke'
        }));
      });
    });

    // La frontière extérieure ne se déduit pas des rectangles de murs : leur
    // bordure ferait apparaître chaque about et chaque raccord. On épaissit
    // plutôt les volumes de l'enveloppe, puis on trace le contour de leur
    // union. Rectangle, L et U produisent ainsi une boucle extérieure unique,
    // sans aucune arête intérieure au mur.
    var contour = root.TechnoHabGenerator && root.TechnoHabGenerator.cheminContour;
    var volumes = plan.boundary && plan.boundary.volumes;
    var epaisseur = plan.construction && plan.construction.exteriorWallThickness;
    if (contour && volumes && volumes.length && epaisseur) {
      var masqueId = 'plan-envelope-openings';
      var defs = svgElement('defs');
      var masque = svgElement('mask', {
        id: masqueId,
        x: '-1000', y: '-1000', width: '10000', height: '10000',
        maskUnits: 'userSpaceOnUse'
      });
      masque.appendChild(svgElement('rect', {
        x: '-1000', y: '-1000', width: '10000', height: '10000', fill: 'white'
      }));
      plan.walls.filter(function (wall) { return wall.kind === 'exterior'; })
        .forEach(function (wall) {
          var dehorsNegatif = wall.between && wall.between[0] === 'exterior';
          (wall.reservations || []).forEach(function (reservation) {
            var marge = 0.025;
            var segment = wall.orientation === 'vertical'
              ? {
                  x1: dehorsNegatif ? wall.volume.x0 : wall.volume.x1,
                  y1: reservation.start - marge,
                  x2: dehorsNegatif ? wall.volume.x0 : wall.volume.x1,
                  y2: reservation.end + marge
                }
              : {
                  x1: reservation.start - marge,
                  y1: dehorsNegatif ? wall.volume.y0 : wall.volume.y1,
                  x2: reservation.end + marge,
                  y2: dehorsNegatif ? wall.volume.y0 : wall.volume.y1
                };
            masque.appendChild(svgElement('line', {
              x1: segment.x1, y1: segment.y1, x2: segment.x2, y2: segment.y2,
              stroke: 'black', 'stroke-width': Math.max(0.08, epaisseur * 0.6),
              'stroke-linecap': 'butt'
            }));
          });
        });
      defs.appendChild(masque);
      group.appendChild(defs);

      var volumesExterieurs = volumes.map(function (volume) {
        return {
          x0: volume.x0 - epaisseur,
          y0: volume.y0 - epaisseur,
          x1: volume.x1 + epaisseur,
          y1: volume.y1 + epaisseur
        };
      });
      group.appendChild(svgElement('path', {
        d: contour(volumesExterieurs),
        class: 'plan-envelope-outline',
        mask: 'url(#' + masqueId + ')',
        'vector-effect': 'non-scaling-stroke'
      }));

      // Chaque réservation extérieure possède deux tableaux : ils relient
      // la face dehors à la face dedans du mur. Sans eux, les lignes de
      // fenêtre sont proches de l'enveloppe mais flottent sans jamais la
      // toucher, et la largeur de la baie reste graphiquement ouverte.
      plan.walls.filter(function (wall) { return wall.kind === 'exterior'; })
        .forEach(function (wall) {
          (wall.reservations || []).forEach(function (reservation) {
            [reservation.start, reservation.end].forEach(function (position) {
              var tableau = wall.orientation === 'vertical'
                ? {
                    x1: wall.volume.x0, y1: position,
                    x2: wall.volume.x1, y2: position
                  }
                : {
                    x1: position, y1: wall.volume.y0,
                    x2: position, y2: wall.volume.y1
                  };
              group.appendChild(svgElement('line', {
                x1: tableau.x1, y1: tableau.y1,
                x2: tableau.x2, y2: tableau.y2,
                class: 'plan-opening-jamb',
                'vector-effect': 'non-scaling-stroke'
              }));
            });
          });
        });
    }
    planSvg.appendChild(group);
  }

  function roomMeta(room, content) {
    var length = Math.max(content.width, content.height);
    var width = Math.min(content.width, content.height);
    return 'L × l ' + formatMeasure(length, 2) + ' × ' + formatMeasure(width, 2) +
      ' m · ' + formatMeasure(room.area || room.targetArea, 1) + ' m²';
  }

  function placementContext(room, plan) {
    if (root.TechnoHabPlacement && root.TechnoHabPlacement.roomContext) {
      return root.TechnoHabPlacement.roomContext(room, plan).context;
    }
    var rect = room.usableBounds || room.usableRect || room;
    var width = rect.x1 - rect.x0, height = rect.y1 - rect.y0;
    var openings = [];
    var blocked = [];

    function addOpening(opening, kind) {
      if (!opening) return;
      var x = opening.x - rect.x0, y = opening.y - rect.y0;
      var span = opening.largeur || 0.8;
      if (x < -0.02 || y < -0.02 || x > width + 0.02 || y > height + 0.02) return;
      openings.push({ x: x, y: y, width: span, axis: opening.axe, kind: kind });
      if (kind === 'window') return;
      if (opening.debattement && opening.ouvreVers === room.id) {
        blocked.push({
          x0: Math.max(0, opening.debattement.x0 - rect.x0),
          y0: Math.max(0, opening.debattement.y0 - rect.y0),
          x1: Math.min(width, opening.debattement.x1 - rect.x0),
          y1: Math.min(height, opening.debattement.y1 - rect.y0)
        });
        return;
      }
      var depth = kind === 'entry' ? 1 : 0.25;
      if (opening.axe === 'vertical') {
        blocked.push({
          x0: x <= width / 2 ? 0 : Math.max(0, width - depth),
          x1: x <= width / 2 ? Math.min(width, depth) : width,
          y0: Math.max(0, y - span / 2), y1: Math.min(height, y + span / 2)
        });
      } else {
        blocked.push({
          x0: Math.max(0, x - span / 2), x1: Math.min(width, x + span / 2),
          y0: y <= height / 2 ? 0 : Math.max(0, height - depth),
          y1: y <= height / 2 ? Math.min(height, depth) : height
        });
      }
    }

    (plan.portes || []).forEach(function (door) {
      if ((door.entre || []).indexOf(room.id) !== -1) addOpening(door, 'door');
    });
    if (plan.entree && (plan.entree.entre || []).indexOf(room.id) !== -1) addOpening(plan.entree, 'entry');
    (plan.fenetres || []).forEach(function (windowOpening) {
      if (windowOpening.room === room.id) addOpening(windowOpening, 'window');
    });
    var usablePolygon = (room.usablePolygon || []).map(function (ring) {
      return ring.map(function (point) { return { x: point.x - rect.x0, y: point.y - rect.y0 }; });
    });
    var faces = (room.wallFaces || []).map(function (face) {
      return {
        id: face.id, faceId: face.faceId, wallId: face.wallId,
        orientation: face.orientation, side: face.side, length: face.length,
        normal: { x: face.normal.x, y: face.normal.y },
        axis: {
          x0: face.axis.x0 - rect.x0, y0: face.axis.y0 - rect.y0,
          x1: face.axis.x1 - rect.x0, y1: face.axis.y1 - rect.y0
        }
      };
    });
    return { openings: openings, blocked: blocked, usablePolygon: usablePolygon, faces: faces };
  }

  /* --- Le mobilier ---------------------------------------------------------
     Le solveur calculait déjà les poses pour rendre son verdict, mais elles
     étaient jetées : seul « cette pièce est meublable » remontait. On les
     dessine, ce qui transforme une affirmation en démonstration.

     Les emprises seules. Les zones d'usage doubleraient la densité du dessin
     alors que le pointillé sert déjà aux rangements ; elles restent
     calculées, et pourront s'afficher plus tard sous leur propre bascule.

     Le repère du symbole suit l'emprise naturelle. Le solveur fournit la
     translation et la rotation cardinale ; le rendu conserve les dimensions
     naturelles puis tourne le symbole autour du centre de l'emprise calculée. */
  function renderFurniture(room, group, plan, equipmentList) {
    var usingCanonical = false;
    var designation, equipements, resultat;
    var manifest = room.equipmentProgram;
    var manifestEquipments = manifest && Array.isArray(manifest.resolved) ? manifest.resolved : [];
    var manifestById = manifestEquipments.reduce(function (index, equipment) {
      index[equipment.id] = equipment;
      return index;
    }, {});
    var hasCanonicalPlacements = manifest && manifest.authority === 'BuiltPlan' &&
      Array.isArray(room.placements);
    if (hasCanonicalPlacements && room.placements.length === 0) return null;
    var canonicalPlacements = hasCanonicalPlacements ? room.placements.map(function (pose) {
      var record = manifestById[pose.equipmentId];
      if (!record) return null;
      return Object.assign({}, pose, {
        equipment: {
          id: record.id,
          size: record.sizeId !== record.id ? record.sizeId : undefined,
          label: record.label,
          required: record.required,
          program: record.program,
          footprint: Object.assign({}, record.footprint),
          anchor: pose.anchor
        },
        wall: pose.wallId || null
      });
    }).filter(Boolean) : [];
    if (hasCanonicalPlacements && canonicalPlacements.length === room.placements.length) {
      usingCanonical = true;
      equipements = manifestEquipments;
      designation = { programs: manifest.programs || [room.type] };
      resultat = {
        fits: true,
        placements: canonicalPlacements,
        s4: room.s4 || null,
        optimization: room.usageValidation && room.usageValidation.optimization || null
      };
    }

    /* Les exports antérieurs à M4c restent lisibles. Eux seuls réclament le
       socle différé et peuvent recalculer une pose de présentation. Un plan
       courant ne fabrique plus jamais une deuxième vérité dans l'interface. */
    var socle = root.TechnoHabSocle;
    var modele = root.TechnoHabRoomModel;
    var solveur = root.TechnoHabPlacement;
    if (!usingCanonical && (!socle || !modele || !solveur)) return null;
    var definition = !usingCanonical && socle.rooms[room.type];
    if (!usingCanonical && !definition) return null;
    var variante = !usingCanonical && room.type === 'bedroom' && room.id === 'bedroom_1' &&
      (definition.variants || []).indexOf('parentale') !== -1
      ? 'parentale'
      : !usingCanonical ? (definition.variants || [null])[0] : null;
    var programmeContext = {
      area: room.area || room.targetArea,
      openKitchen: room.type === 'living' && plan.options && !plan.options.separateKitchen,
      // Le WC intégré rejoint la première salle d'eau, celle que le programme
      // a effectivement composée (generator.js, composeInto).
      integratedWc: room.id === 'bath_1' && plan.options && !plan.options.includeWc,
      includeOptional: true
    };
    if (!usingCanonical) designation = modele.designate(room.type, room.variant || variante, programmeContext);
    if (!usingCanonical && !designation.valid) {
      room.furnishable = false;
      return { fits: false, stage: 'designation', reason: { code: 'ROOM_REQUIREMENTS_INVALID', message: 'Les exigences minimales de la pièce sont incohérentes.' } };
    }
    if (!usingCanonical) equipements = designation.equipments;
    if (!equipements || !equipements.length) return null;

    var rect = room.usableBounds || room.usableRect || room;
    var largeur = rect.x1 - rect.x0, hauteur = rect.y1 - rect.y0;
    var validation;
    var contexte = placementContext(room, plan);
    if (!usingCanonical) try {
      validation = solveur.validate(equipements, { w: largeur, h: hauteur }, {
        relations: designation.relations, context: contexte
      });
      /* Deux replis, du moins destructeur au plus. Rabattre une gamme sur son
         plancher rend à la pièce l'équipement qu'elle avait avant les gammes ;
         retirer les non requis lui ôte du mobilier. Dans cet ordre, une montée
         en gamme ne peut pas rendre non meublable une pièce qui l'était. */
      var replis = [
        { champ: 'upgradeSizes', utile: function () { return equipements.some(function (e) { return e.size; }); } },
        { champ: 'includeOptional', utile: function () { return equipements.some(function (e) { return !e.required; }); } }
      ];
      replis.forEach(function (repli) {
        if (validation.fits || !repli.utile()) return;
        programmeContext[repli.champ] = false;
        designation = modele.designate(room.type, room.variant || variante, programmeContext);
        equipements = designation.equipments;
        validation = solveur.validate(equipements, { w: largeur, h: hauteur }, {
          relations: designation.relations, context: contexte
        });
      });
      if (!validation.fits) {
        room.furnishable = false;
        return validation;
      }
      resultat = solveur.optimize(equipements, { w: largeur, h: hauteur }, {
        relations: designation.relations,
        context: contexte,
        validation: validation,
        seed: String(plan.seed || plan.seedValue || plan.variant) + ':' + room.id,
        attempts: 18
      });
    } catch (_) { return null; }
    // Si rien ne tient, on ne dessine rien : une pose partielle donnerait à
    // voir un agencement que le solveur n'a pas validé.
    if (!resultat || !resultat.fits) {
      room.furnishable = false;
      return resultat || null;
    }
    room.furnishable = true;

    if (!usingCanonical) {
      room.composition = {
        programs: designation.programs,
        equipments: equipements.map(function (equipment) { return equipment.id; }),
        optimization: resultat.optimization || null
      };
      room.placements = resultat.placements.map(function (pose) {
        return {
          equipmentId: pose.equipment.id,
          anchor: pose.equipment.anchor || 'free',
          wallId: pose.wallId || pose.wall || null,
          faceId: pose.faceId || null,
          footprint: pose.footprint,
          usage: pose.usage,
          rotation: pose.rotation,
          inward: pose.inward
        };
      });
    }
    resultat.placements.forEach(function (pose) {
      var f = pose.footprint;
      /* Une montée en gamme garde l'identifiant de l'équipement — c'est ce qui
         maintient ses relations. Le dessin, lui, doit suivre la taille retenue
         quand elle a son propre symbole ; à défaut, on retombe sur celui de la
         gamme, dont le viewBox vaut l'emprise du plancher et sera donc étiré.
         Voir ROADMAP §8.4, limite connue de G1. */
      var nomSymbole = 'furn-' + (pose.equipment.size || pose.equipment.id);
      var symbole = document.getElementById(nomSymbole) ||
        document.getElementById('furn-' + pose.equipment.id);
      if (symbole) nomSymbole = symbole.id;
      var footprintWidth = f.x1 - f.x0, footprintHeight = f.y1 - f.y0;
      var footprintAttrs = {
        x: rect.x0 + f.x0, y: rect.y0 + f.y0,
        width: footprintWidth, height: footprintHeight,
        class: 'room-furniture', 'aria-hidden': 'true'
      };
      if (symbole) {
        var rotation = Number.isFinite(pose.rotation) ? ((pose.rotation % 360) + 360) % 360 : 0;
        var rotatable = symbole.dataset.rotatable === 'true';
        var visualRotation = rotatable ? rotation : 0;
        var visualWidth = rotatable ? pose.equipment.footprint.w : footprintWidth;
        var visualHeight = rotatable ? pose.equipment.footprint.d : footprintHeight;
        var centerX = rect.x0 + (f.x0 + f.x1) / 2;
        var centerY = rect.y0 + (f.y0 + f.y1) / 2;
        var attrs = Object.assign({}, footprintAttrs, {
          href: '#' + nomSymbole,
          x: centerX - visualWidth / 2,
          y: centerY - visualHeight / 2,
          width: visualWidth,
          height: visualHeight,
          'data-rotation': visualRotation,
          'data-wall': pose.wall || 'free'
        });
        if (visualRotation) {
          attrs.transform = 'rotate(' + visualRotation + ' ' + centerX + ' ' + centerY + ')';
        }
        group.appendChild(svgElement('use', attrs));

        // Collecte l'équipement pour la légende (sans doublon)
        if (equipmentList && !equipmentList.some(function (item) { return item.symbolId === nomSymbole; })) {
          equipmentList.push({
            symbolId: nomSymbole,
            label: symbole.dataset.label || pose.equipment.id
          });
        }
      } else {
        // Pas de dessin pour cet équipement : l'emprise nue vaut mieux que rien.
        group.appendChild(svgElement('rect', footprintAttrs));
      }
    });
    return resultat;
  }

  /* --- La légende du mobilier ----------------------------------------------
     Le plan montre des emprises meublées sans dire ce qu'elles sont : le
     survol d'une pièce donne son nom, jamais celui de ses équipements. La
     légende comble cela en marge droite du dessin, dans le repère du plan
     (donc en mètres), pour qu'elle suive l'export SVG sans traitement à part.

     Sa largeur est une constante du module, et non un nombre choisi ici : le
     viewBox doit réserver exactement la même bande, sinon la légende se pose
     sur le logement. */
  var LEGEND_MARGIN = 0.35;      // distance entre le mur droit et le cadre
  var LEGEND_WIDTH = 2.4;        // largeur utile, icône et libellé compris
  var LEGEND_PADDING = 0.15;
  var LEGEND_ICON = 0.4;
  var LEGEND_GAP = 0.06;
  // Bande totale à réserver à droite du plan, cadre et marge compris.
  var LEGEND_BAND = LEGEND_MARGIN + LEGEND_WIDTH + LEGEND_PADDING * 2;

  function renderEquipmentLegend(entrees, bounds) {
    if (!entrees || !entrees.length) return null;
    // Ordre alphabétique : l'ordre de pose dépend du parcours des pièces et
    // changerait d'une variante à l'autre pour un même mobilier.
    var equipmentList = entrees.slice().sort(function (a, b) {
      return a.label.localeCompare(b.label, 'fr');
    });

    var planHeight = bounds.y1 - bounds.y0;
    var iconSize = LEGEND_ICON;
    var itemHeight = iconSize + LEGEND_GAP;
    /* Une légende plus haute que le plan qu'elle commente sortirait du cadre :
       on resserre les lignes plutôt que de déborder, jusqu'à la moitié de la
       hauteur nominale — en deçà, le dessin cesse d'être lisible et il vaut
       mieux assumer un léger dépassement. */
    var available = planHeight - LEGEND_PADDING * 2;
    var needed = itemHeight * equipmentList.length;
    if (needed > available) {
      var facteur = Math.max(0.5, available / needed);
      itemHeight *= facteur;
      iconSize *= facteur;
    }

    var legendHeight = itemHeight * equipmentList.length + LEGEND_PADDING * 2;
    var legendX = bounds.x1 + LEGEND_MARGIN;
    var legendY = bounds.y0;

    var legendGroup = svgElement('g', { class: 'equipment-legend', role: 'img' });
    var titre = svgElement('title');
    titre.textContent = 'Légende du mobilier, ' + equipmentList.length + ' équipements';
    legendGroup.appendChild(titre);

    legendGroup.appendChild(svgElement('rect', {
      x: legendX, y: legendY,
      width: LEGEND_WIDTH + LEGEND_PADDING * 2, height: legendHeight,
      class: 'legend-frame', 'vector-effect': 'non-scaling-stroke'
    }));

    var yOffset = legendY + LEGEND_PADDING;
    equipmentList.forEach(function (item) {
      var g = svgElement('g', { class: 'legend-item' });
      /* Le symbole garde son rapport naturel dans une case carrée : un canapé
         reste couché, un lit reste debout. */
      g.appendChild(svgElement('use', {
        href: '#' + item.symbolId,
        x: legendX + LEGEND_PADDING, y: yOffset,
        width: iconSize, height: iconSize,
        class: 'legend-equipment-icon'
      }));

      var text = svgElement('text', {
        x: legendX + LEGEND_PADDING + iconSize + LEGEND_PADDING,
        y: yOffset + iconSize / 2,
        class: 'legend-equipment-label',
        'text-anchor': 'start', 'dominant-baseline': 'central'
      });
      text.textContent = item.label;
      g.appendChild(text);

      legendGroup.appendChild(g);
      yOffset += itemHeight;
    });

    planSvg.appendChild(legendGroup);
    // Un libellé trop long empiéterait sur le plan : il est resserré, comme
    // celui d'une pièce étroite.
    Array.prototype.forEach.call(legendGroup.querySelectorAll('.legend-equipment-label'), function (node) {
      fitText(node, LEGEND_WIDTH - iconSize - LEGEND_PADDING);
    });
    return legendGroup;
  }

  function renderPlan(plan) {
    planSvg.innerHTML = '';
    /* Les emprises de mobilier, collectées pendant le tracé, servent à
       rejouer le cheminement : le générateur l’a calculé sur un logement
       vide, ce qui ne prouve pas qu’on y circule une fois meublé. */
    var emprises = [];
    var equipmentList = []; // Collecte les équipements affichés pour la légende
    var bounds = plan.constructionBounds || { x0: 0, y0: 0, x1: plan.boundary.width, y1: plan.boundary.height };
    var viewPadding = Math.max(0.18, (plan.construction && plan.construction.exteriorWallThickness || 0.3) * 0.55);
    /* La bande de légende n'est réservée que lorsqu'il y a du mobilier à
       légender : sans elle, le plan doit occuper toute la largeur. */
    // La légende détaillée n'entre plus dans le cadrage du dessin : elle
    // réduisait le logement pour commenter du mobilier déjà reconnaissable.
    var bandeLegende = 0;
    planSvg.setAttribute('viewBox', (bounds.x0 - viewPadding) + ' ' + (bounds.y0 - viewPadding) + ' ' +
      (bounds.x1 - bounds.x0 + viewPadding * 2 + bandeLegende) + ' ' + (bounds.y1 - bounds.y0 + viewPadding * 2));
    planSvg.setAttribute('role', 'img');
    planSvg.setAttribute('aria-label', 'Variante ' + plan.variant + ', ' + formatMeasure(plan.habitableArea || plan.boundary.area, 1) +
      ' mètres carrés habitables, ' + formatMeasure(plan.wallArea || 0, 1) + ' mètres carrés de murs et ' +
      formatMeasure(plan.grossFloorArea || plan.boundary.area, 1) + ' mètres carrés d’emprise, comprenant ' + plan.rooms.length + ' espaces');
    /* Le fond du plan épouse l'enveloppe, pas sa boîte englobante : sur un L
       ou un U, peindre le rectangle reviendrait à bâtir l'encoche. */
    var volumes = plan.boundary.volumes;
    var contourEnveloppe = root.TechnoHabGenerator && root.TechnoHabGenerator.cheminContour;
    if (volumes && volumes.length && contourEnveloppe) {
      planSvg.appendChild(svgElement('path', {
        d: contourEnveloppe(volumes), class: 'plan-background', 'aria-hidden': 'true'
      }));
    } else {
      planSvg.appendChild(svgElement('rect', { x: 0, y: 0, width: plan.boundary.width, height: plan.boundary.height, class: 'plan-background', 'aria-hidden': 'true' }));
    }
    plan.rooms.forEach(function (room) {
      var group = svgElement('g', {
        class: 'room room--' + room.type,
        tabindex: '0', focusable: 'true', role: 'group'
      });
      var roomRect = room.usableBounds || room.usableRect || room;
      var roomWidth = roomRect.x1 - roomRect.x0;
      var roomHeight = roomRect.y1 - roomRect.y0;
      var title = svgElement('title');
      title.textContent = room.label + ' — ' + formatMeasure(Math.max(roomWidth, roomHeight), 2) +
        ' × ' + formatMeasure(Math.min(roomWidth, roomHeight), 2) + ' m — ' +
        formatMeasure(room.area || room.targetArea, 1) + ' m²' +
        (room.storageArea ? ', dont ' + room.storageArea.toFixed(1) + ' m² de rangement' : '');
      group.setAttribute('aria-label', title.textContent);
      group.appendChild(title);
      /* Une pièce se trace d'un seul contour, même née de plusieurs parties :
         le refend entre deux parties n'est pas un mur (D2). Le rangement
         garde sa teinte propre, mais en remplissage seul — il indique une
         vocation, il ne découpe pas la pièce. */
      var parties = room.parts && room.parts.length ? room.parts : [room];
      var contour = root.TechnoHabGenerator && root.TechnoHabGenerator.cheminContour;
      if (room.usablePolygon && room.usablePolygon.length) {
        group.appendChild(svgElement('path', {
          d: polygonPath(room.usablePolygon), class: 'room-shape',
          'fill-rule': 'evenodd', 'vector-effect': 'non-scaling-stroke'
        }));
      } else if (contour) {
        group.appendChild(svgElement('path', {
          d: contour(parties), class: 'room-shape', 'vector-effect': 'non-scaling-stroke'
        }));
      } else {
        parties.forEach(function (part) {
          group.appendChild(svgElement('rect', {
            x: part.x0, y: part.y0, width: part.x1 - part.x0, height: part.y1 - part.y0,
            class: 'room-shape', 'vector-effect': 'non-scaling-stroke'
          }));
        });
      }
      // Le rangement se signale par-dessus, en pointillé : il dit une
      // vocation à l'intérieur de la pièce, il ne la coupe pas en deux.
      parties.filter(function (part) { return part.role === 'storage'; }).forEach(function (part) {
        group.appendChild(svgElement('rect', {
          x: part.x0, y: part.y0, width: part.x1 - part.x0, height: part.y1 - part.y0,
          class: 'room-shape room-storage', 'vector-effect': 'non-scaling-stroke', 'aria-hidden': 'true'
        }));
      });
      if (afficherMobilier) {
        var pose = renderFurniture(room, group, plan, equipmentList);
        if (pose && pose.fits && pose.placements) pose.placements.forEach(function (item) {
          var f = item.footprint, base = room.usableBounds || room.usableRect || room;
          emprises.push({ x0: base.x0 + f.x0, y0: base.y0 + f.y0, x1: base.x0 + f.x1, y1: base.y0 + f.y1 });
        });
      }

      var symbol = iconSymbol(room.type);
      // Libellé et pictogramme se placent dans le rectangle utile, jamais
      // dans la boîte englobante d'un L. Leur groupe reste masqué tant que
      // la pièce n'est pas survolée.
      var content = composeRoomContent(roomRect, symbol);
      var info = svgElement('g', { class: 'room-info', 'aria-hidden': 'true' });
      if (content.iconSize) {
        var rotation = iconRotation(symbol, content.width, content.height);
        var use = svgElement('use', {
          href: '#icon-' + room.type, class: 'room-icon', 'aria-hidden': 'true',
          x: content.centerX - content.iconSize / 2, y: content.iconY,
          width: content.iconSize, height: content.iconSize
        });
        if (rotation) {
          use.setAttribute('transform', 'rotate(' + rotation + ' ' + content.centerX + ' ' + (content.iconY + content.iconSize / 2) + ')');
        }
        info.appendChild(use);
      }
      var label = svgElement('text', { x: content.centerX, y: content.labelY, class: 'room-label', 'text-anchor': 'middle', 'dominant-baseline': 'central' }); label.textContent = room.label;
      info.appendChild(label);
      var meta = svgElement('text', { x: content.centerX, y: content.metaY, class: 'room-meta', 'text-anchor': 'middle', 'dominant-baseline': 'central' });
      meta.textContent = roomMeta(room, content);
      info.appendChild(meta);
      group.appendChild(info);
      planSvg.appendChild(group);
      fitText(label, content.width * 0.9);
      fitText(meta, content.width * 0.9);
    });

    // La structure vient au-dessus des surfaces et sous ce qui la traverse :
    // les murs restent lisibles, puis portes et fenêtres découpent leur baie.
    renderWalls(plan);

    // La légende se pose une fois le mobilier connu : elle ne liste que les
    // équipements réellement dessinés, jamais le catalogue.
    // Les symboles restent accessibles dans chaque pièce et dans l'export ;
    // aucune colonne de texte ne vient désormais rapetisser le plan.

    /* M4 : le parcours meublé appartient au BuiltPlan. Le rendu consomme les
       poses et le verdict du moteur ; il ne fabrique plus une seconde vérité. */

    // Les ouvertures appartiennent au plan, pas au calque de diagnostic :
    // elles restent visibles même lorsque le cheminement est masqué.
    (plan.portes || []).forEach(function (porte) {
      var demi = porte.largeur / 2;
      planSvg.appendChild(svgElement('line', {
        x1: porte.axe === 'vertical' ? porte.x : porte.x - demi,
        y1: porte.axe === 'vertical' ? porte.y - demi : porte.y,
        x2: porte.axe === 'vertical' ? porte.x : porte.x + demi,
        y2: porte.axe === 'vertical' ? porte.y + demi : porte.y,
        class: 'plan-door', 'aria-hidden': 'true'
      }));
      if (afficherParcours && porte.debattement) {
        var d = porte.debattement;
        planSvg.appendChild(svgElement('rect', {
          x: d.x0, y: d.y0, width: d.x1 - d.x0, height: d.y1 - d.y0,
          class: 'plan-swing', 'aria-hidden': 'true'
        }));
      }
    });
    if (plan.entree) {
      var e = plan.entree, de = e.largeur / 2;
      planSvg.appendChild(svgElement('line', {
        x1: e.axe === 'vertical' ? e.x : e.x - de,
        y1: e.axe === 'vertical' ? e.y - de : e.y,
        x2: e.axe === 'vertical' ? e.x : e.x + de,
        y2: e.axe === 'vertical' ? e.y + de : e.y,
        class: 'plan-door plan-door--entry', 'aria-hidden': 'true'
      }));
    }
    (plan.fenetres || []).forEach(function (fenetre) {
      var demiFenetre = fenetre.largeur / 2;
      var offset = 0.035;
      [-offset, offset].forEach(function (ecart) {
        planSvg.appendChild(svgElement('line', {
          x1: fenetre.axe === 'vertical' ? fenetre.x + ecart : fenetre.x - demiFenetre,
          y1: fenetre.axe === 'vertical' ? fenetre.y - demiFenetre : fenetre.y + ecart,
          x2: fenetre.axe === 'vertical' ? fenetre.x + ecart : fenetre.x + demiFenetre,
          y2: fenetre.axe === 'vertical' ? fenetre.y + demiFenetre : fenetre.y + ecart,
          class: 'plan-window', 'aria-hidden': 'true'
        }));
      });
    });

    /* Le diagnostic de parcours est évalué après le mobilier, puis affiché. */
    if (afficherParcours) {
      // Les pièces que le parcours n'atteint pas, hachurées : c'est le
      // constat le plus utile de la couche.
      var atteintes = (plan.parcoursMeuble || plan.parcours || {}).atteintes || {};
      var contourNonAtteinte = root.TechnoHabGenerator && root.TechnoHabGenerator.cheminContour;
      plan.rooms.forEach(function (room) {
        if (atteintes[room.id]) return;
        var parties = room.parts && room.parts.length ? room.parts : [room];
        if (contourNonAtteinte) {
          planSvg.appendChild(svgElement('path', {
            d: room.usablePolygon && room.usablePolygon.length
              ? polygonPath(room.usablePolygon) : contourNonAtteinte(parties),
            class: 'plan-unreached', 'fill-rule': 'evenodd', 'aria-hidden': 'true'
          }));
          return;
        }
        parties.forEach(function (part) {
          planSvg.appendChild(svgElement('rect', {
            x: part.x0, y: part.y0, width: part.x1 - part.x0, height: part.y1 - part.y0,
            class: 'plan-unreached', 'aria-hidden': 'true'
          }));
        });
      });
    }

    // Le contrat géométrique du plan reste la source du calcul, mais le cadre
    // d'affichage se cale sur ce qui a réellement été dessiné. Cela absorbe
    // les débords de murs, de mobilier ou de formes composées sans jamais
    // rogner une pièce au bord du SVG.
    try {
      var dessin = planSvg.getBBox();
      var margeDessin = Math.max(0.28, (plan.construction && plan.construction.exteriorWallThickness || 0.3));
      if (dessin.width > 0 && dessin.height > 0) {
        planSvg.setAttribute('viewBox',
          (dessin.x - margeDessin) + ' ' + (dessin.y - margeDessin) + ' ' +
          (dessin.width + margeDessin * 2) + ' ' + (dessin.height + margeDessin * 2));
      }
    } catch (_) { /* le viewBox contractuel posé plus haut reste le repli */ }

  }

  // Une pièce étroite ne doit pas laisser son libellé déborder sur la voisine.
  function fitText(element, maxWidth) {
    var measured = element.getComputedTextLength();
    if (measured > maxWidth) {
      element.setAttribute('textLength', maxWidth);
      element.setAttribute('lengthAdjust', 'spacingAndGlyphs');
    }
  }
  // La gravité rapporte l'écart au seuil : un dépassement de 1 % et un de
  // 70 % cessent de se lire à égalité. Les règles sans mesure chiffrable n'en
  // portent pas, et n'affichent rien plutôt qu'un nombre inventé.
  function graviteTexte(entry) {
    if (typeof entry.gravite !== 'number') return '';
    if (entry.gravite < 0.05) return ' · écart minime';
    return ' · écart de ' + Math.round(entry.gravite * 100) + ' %';
  }

  function ruleItem(entry, prefix) {
    var item = document.createElement('li');
    item.className = 'rule-item rule-item--' + entry.level.toLowerCase();
    var heading = document.createElement('strong');
    heading.textContent = prefix + entry.label + graviteTexte(entry);
    var message = document.createElement('span');
    message.textContent = entry.message;
    item.appendChild(heading); item.appendChild(message);
    return item;
  }

  // Ce que le plan viole d'un côté, ce que le moteur ne sait pas encore tenir
  // de l'autre. Mêlés, les premiers se noient dans les seconds et la dette
  // d'implémentation passe pour un défaut du plan proposé.
  function renderRules(report) {
    rulesList.innerHTML = '';
    var limites = report.limites || [];

    /* Un préalable rompu arrête l'évaluation : les autres règles perdraient
       leur sens sur un plan troué ou dont deux pièces se recouvrent. Il faut
       le dire, sinon un rapport tronqué se lit comme un rapport complet. */
    if (report.prealableRompu) {
      var alerte = document.createElement('li');
      alerte.className = 'rule-item rule-item--intertitre';
      alerte.innerHTML = '<strong>Évaluation interrompue</strong>' +
        '<span>L’intégrité du plan n’est pas acquise : les ' + report.skippedRules +
        ' autres règles n’ont pas été évaluées, elles n’auraient rien voulu dire.</span>';
      rulesList.appendChild(alerte);
    }

    if (!report.violations.length) {
      var success = document.createElement('li');
      success.className = 'rule-item rule-item--success';
      success.innerHTML = '<strong>Profil local validé</strong>' +
        '<span>Aucune règle que le moteur sait tenir n’est enfreinte.</span>';
      rulesList.appendChild(success);
    } else {
      report.violations.forEach(function (violation) {
        rulesList.appendChild(ruleItem(violation, violation.level === 'HARD' ? 'À corriger · ' : 'Conseil · '));
      });
    }

    if (!limites.length) return;

    var titre = document.createElement('li');
    titre.className = 'rule-item rule-item--intertitre';
    titre.innerHTML = '<strong>Limites connues du moteur</strong>' +
      '<span>Ces exigences restent valides ; c’est la génération qui ne sait pas encore les garantir. ' +
      'Elles ne comptent pas dans les blocages du plan.</span>';
    rulesList.appendChild(titre);

    // Une ligne par règle, non par occurrence : dix adjacences ratées sont un
    // seul manquement du moteur.
    var parRegle = {};
    limites.forEach(function (entry) {
      if (!parRegle[entry.ruleId]) parRegle[entry.ruleId] = { entry: entry, count: 0 };
      parRegle[entry.ruleId].count += 1;
    });
    Object.keys(parRegle).forEach(function (id) {
      var groupe = parRegle[id];
      var item = document.createElement('li');
      item.className = 'rule-item rule-item--limite';
      var heading = document.createElement('strong');
      heading.textContent = groupe.entry.label + (groupe.count > 1 ? ' · ' + groupe.count + ' cas' : '');
      var message = document.createElement('span');
      message.textContent = groupe.entry.limite.cause + ' Relevé : ' + groupe.entry.limite.mesure + '.';
      item.appendChild(heading); item.appendChild(message);
      rulesList.appendChild(item);
    });
  }
  function setText(id, text) { document.getElementById(id).textContent = text; }
  function renderMeta(report) {
    rulesMeta.textContent = report.profile + ' · ' + report.evaluatedRules + ' règle(s) évaluée(s)' +
      (report.skippedRules ? ', ' + report.skippedRules + ' non applicable(s)' : '') +
      ' · ' + report.summary.hard + ' bloquante(s), ' + report.summary.guideline + ' conseil(s)' +
      (report.summary.limites ? ' · ' + report.summary.limites + ' relevant d’une limite du moteur' : '');
  }

  function plural(value, singular, pluralForm) {
    return value + ' ' + (value > 1 ? pluralForm : singular);
  }

  function programSummary(program) {
    var options = program && program.options ? program.options : {};
    var bedrooms = Number(options.bedrooms || 0);
    return [
      bedrooms ? plural(bedrooms, 'chambre', 'chambres') : 'studio',
      plural(Number(options.bathrooms || 1), 'salle d’eau', 'salles d’eau'),
      Number(options.offices || 0) ? 'bureau ' + (options.officeVariant === 'convertible' ? 'convertible' : 'compact') : 'sans bureau indépendant',
      options.separateKitchen ? 'cuisine séparée' : 'cuisine ouverte',
      options.includeWc ? 'WC indépendant' : 'WC intégré'
    ].join(' · ');
  }

  function changeLabel(item) {
    if (item.field === 'separateKitchen') return 'Cuisine ouverte au lieu d’une cuisine séparée.';
    if (item.field === 'includeWc') return 'WC intégré à la pièce d’eau au lieu d’un WC indépendant.';
    if (item.field === 'bathrooms') return plural(item.to, 'salle d’eau', 'salles d’eau') +
      ' au lieu de ' + item.from + '.';
    if (item.field === 'bedrooms') return plural(item.to, 'chambre', 'chambres') +
      ' au lieu de ' + item.from + '.';
    return 'Fonction « ' + item.field + ' » retirée du programme.';
  }

  function requiresConsent(resolution) {
    return resolution.changes.some(function (item) { return item.severity === 'FUNCTION_REMOVED'; });
  }

  function renderResolutionNotice(resolution, consentRequired) {
    resolutionConsentCheck.checked = false;
    resolutionConsentCheck.disabled = false;
    resolutionActivate.disabled = true;
    resolutionActivate.hidden = false;
    resolutionConsentStatus.textContent = '';
    if (resolution.status === 'EXACT') {
      resolutionNotice.hidden = true;
      resolutionConsent.hidden = true;
      return;
    }
    resolutionRequested.textContent = programSummary(resolution.requestedProgram);
    resolutionProposed.textContent = programSummary(resolution.resolvedProgram);
    resolutionChanges.innerHTML = '';
    resolution.changes.forEach(function (item) {
      var line = document.createElement('li');
      line.textContent = changeLabel(item);
      resolutionChanges.appendChild(line);
    });
    resolutionConsent.hidden = !consentRequired;
    resolutionNotice.hidden = false;
  }

  function topologyLabel(value) {
    var labels = {
      'barre': 'Barre', 'barre-L': 'Barre avec retour', 'L': 'L',
      'L-decroche': 'L avec décroché', 'L-interieur': 'L intérieur', 'T': 'T',
      'desserte-integree': 'Desserte intégrée',
      'desserte-integree-L': 'Desserte intégrée en L',
      'desserte-integree-U': 'Desserte intégrée en U', 'bandes': 'Bandes'
    };
    return labels[value] || String(value || 'Organisation non renseignée').replace(/-/g, ' ');
  }

  function selectionStatusText(selection) {
    var count = selection.results.length;
    if (selection.status === 'COMPLETE') {
      return plural(count, 'proposition distincte disponible', 'propositions distinctes disponibles') + '.';
    }
    if (selection.status === 'PARTIAL') {
      return plural(count, 'proposition distincte', 'propositions distinctes') +
        ' sur ' + selection.requested + ' demandées.';
    }
    return 'Aucune proposition distincte n’a pu être retenue.';
  }

  function compromiseText(generation) {
    var plan = generation.builtPlan.plan;
    var preference = plan.preferenceObjective || {};
    var circulation = plan.circulationObjective || {};
    var target = Number(preference.targetMissed || 0);
    var comfort = Number(preference.comfortMissed || 0);
    var parts = [topologyLabel(plan.topologyFamily)];
    parts.push(target
      ? plural(target, 'exigence cible non atteinte', 'exigences cibles non atteintes')
      : 'toutes les exigences cibles tenues');
    parts.push(comfort
      ? plural(comfort, 'marge de confort non atteinte', 'marges de confort non atteintes')
      : 'toutes les marges de confort atteintes');
    if (Number.isFinite(circulation.share)) {
      parts.push(formatMeasure(circulation.share * 100, 1) + ' % de circulation');
    }
    return parts.join(' · ') + '.';
  }

  function clearPlanSelection() {
    activeResolvedSelection = null;
    activeSelectionConsent = null;
    activeSelectionIndex = 0;
    activeSelectionVisited = {};
    planSelectionTabs.innerHTML = '';
    planSelectionSummary.textContent = '';
    planSelectionCompromise.textContent = '';
    planSelection.hidden = true;
    planView.removeAttribute('aria-labelledby');
  }

  function updateSelectionTabs(index) {
    Array.prototype.forEach.call(planSelectionTabs.querySelectorAll('[role="tab"]'), function (tab, tabIndex) {
      var selected = tabIndex === index;
      tab.setAttribute('aria-selected', selected ? 'true' : 'false');
      tab.tabIndex = selected ? 0 : -1;
    });
    var activeTab = planSelectionTabs.querySelector('[aria-selected="true"]');
    if (activeTab) planView.setAttribute('aria-labelledby', activeTab.id);
  }

  function activateSelectionPlan(index, focusTab) {
    if (!activeResolvedSelection || !activeResolvedSelection.selection) return;
    var results = activeResolvedSelection.selection.results;
    if (index < 0 || index >= results.length) return;
    activeSelectionIndex = index;
    updateSelectionTabs(index);
    planSelectionCompromise.textContent = 'Plan ' + (index + 1) + ' · ' + compromiseText(results[index]);
    var firstVisit = !activeSelectionVisited[index];
    activeSelectionVisited[index] = true;
    activateResolution(activeResolvedSelection.resolution, activeSelectionConsent,
      results[index], activeResolvedSelection, index, firstVisit);
    if (focusTab) {
      var tab = planSelectionTabs.querySelector('[aria-selected="true"]');
      if (tab) tab.focus();
    }
  }

  function renderSelectionNavigation(resolvedSelection) {
    var selection = resolvedSelection.selection;
    planSelectionTabs.innerHTML = '';
    planSelectionSummary.textContent = selectionStatusText(selection);
    planSelectionSummary.dataset.state = selection.status.toLowerCase();
    selection.results.forEach(function (generation, index) {
      var plan = generation.builtPlan.plan;
      var tab = document.createElement('button');
      var title = document.createElement('strong');
      var meta = document.createElement('span');
      tab.type = 'button';
      tab.id = 'plan-selection-tab-' + (index + 1);
      tab.className = 'plan-selection-tab';
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-controls', 'plan-view');
      tab.setAttribute('aria-selected', index === 0 ? 'true' : 'false');
      tab.tabIndex = index === 0 ? 0 : -1;
      tab.dataset.index = String(index);
      title.textContent = 'Plan ' + (index + 1);
      meta.textContent = topologyLabel(plan.topologyFamily) + ' · ' + plan.seed;
      tab.appendChild(title);
      tab.appendChild(meta);
      planSelectionTabs.appendChild(tab);
    });
    planSelection.hidden = selection.results.length === 1;
  }

  function activateResolvedSelection(resolvedSelection, consent) {
    if (!resolvedSelection.selection || !resolvedSelection.selection.results.length) {
      throw new Error('La résolution a abouti, mais aucune proposition distincte n’est disponible.');
    }
    activeResolvedSelection = resolvedSelection;
    activeSelectionConsent = consent;
    activeSelectionVisited = {};
    renderSelectionNavigation(resolvedSelection);
    activateSelectionPlan(0, false);
  }

  function renderEmptySelection(resolvedSelection) {
    var selection = resolvedSelection && resolvedSelection.selection;
    if (!selection) return;
    planSelectionTabs.innerHTML = '';
    planSelectionSummary.textContent = selectionStatusText(selection);
    planSelectionSummary.dataset.state = 'empty';
    planSelectionCompromise.textContent =
      'Modifiez le programme ou générez une autre variante pour relancer la comparaison.';
    planSelection.hidden = false;
  }

  function setPlanAvailable(available) {
    jsonExportButton.disabled = !available;
    analysisOpenButton.disabled = !available;
    analysisExportButton.disabled = !available;
    svgExportButton.disabled = !available;
  }

  function clearActivePlan(message) {
    if (analysisController) analysisController.close();
    latestResult = null;
    clearPlanSelection();
    while (planSvg.firstChild) planSvg.removeChild(planSvg.firstChild);
    planSvg.removeAttribute('aria-label');
    ['stat-habitable', 'stat-walls', 'stat-gross', 'stat-rooms', 'stat-seed', 'stat-alerts']
      .forEach(function (id) { setText(id, '—'); });
    rulesList.innerHTML = '';
    rulesMeta.textContent = message || '';
    setPlanAvailable(false);
  }

  function resolutionExportTrace(resolution, consent) {
    if (!resolution) return null;
    return {
      status: resolution.status,
      level: resolution.level,
      requestedProgram: resolution.requestedProgram,
      resolvedProgram: resolution.resolvedProgram,
      changes: resolution.changes,
      attempts: resolution.attempts,
      consent: consent
    };
  }

  function beginGenerationPerformance() {
    generationStartedAt = {
      wallClock: new Date().toISOString(),
      monotonic: root.performance && root.performance.now ? root.performance.now() : Date.now()
    };
    latestGenerationPerformance = {
      status: 'RUNNING',
      startedAt: generationStartedAt.wallClock
    };
  }

  function setGenerationBusy(busy) {
    generationBusy = busy;
    document.body.setAttribute('aria-busy', busy ? 'true' : 'false');
    form.setAttribute('aria-busy', busy ? 'true' : 'false');
    generationButton.disabled = busy;
    generationButton.innerHTML = busy
      ? 'Calcul en cours <span aria-hidden="true">…</span>'
      : generationButtonLabel();
  }

  function generationButtonLabel() {
    var count = Number(new FormData(form).get('planCount')) === 3 ? 3 : 1;
    return (count === 3 ? 'Générer 3 propositions' : 'Générer un plan') +
      ' <span aria-hidden="true">→</span>';
  }

  function blockGenerationClick(event) {
    var now = root.performance && root.performance.now ? root.performance.now() : Date.now();
    if (!generationBusy && now >= clickLockUntil) return;
    event.preventDefault();
    event.stopImmediatePropagation();
  }
  document.addEventListener('click', blockGenerationClick, true);

  function releaseGenerationLock() {
    var now = root.performance && root.performance.now ? root.performance.now() : Date.now();
    clickLockUntil = now + 250;
    setGenerationBusy(false);
  }

  function completeGenerationPerformance(resolvedSelection, status, error) {
    var now = root.performance && root.performance.now ? root.performance.now() : Date.now();
    var resolution = resolvedSelection && resolvedSelection.resolution || error && error.programResolution || null;
    var resolutionAttempts = resolution && Array.isArray(resolution.attempts) ? resolution.attempts.length : 0;
    var selectionAttempts = resolvedSelection && Number.isFinite(resolvedSelection.generatedAttempts)
      ? resolvedSelection.generatedAttempts : 0;
    latestGenerationPerformance = {
      status: status,
      startedAt: generationStartedAt ? generationStartedAt.wallClock : null,
      completedAt: new Date().toISOString(),
      elapsedMs: generationStartedAt ? Math.round((now - generationStartedAt.monotonic) * 10) / 10 : null,
      resolutionStatus: resolution ? resolution.status : null,
      selectionStatus: resolvedSelection && resolvedSelection.selection
        ? resolvedSelection.selection.status : null,
      resolutionAttempts: resolutionAttempts,
      selectionAttempts: selectionAttempts,
      totalGeneratorCalls: resolutionAttempts + selectionAttempts,
      failure: error ? {
        name: error.name || 'Error',
        message: error.message || String(error),
        selectionStatus: error.selectionStatus || null
      } : null
    };
    generationStartedAt = null;
  }

  function activateResolution(resolution, consent, generation, resolvedSelection, selectionIndex, recordHistory) {
    generation = generation || resolution.result;
    var plan = generation.builtPlan.plan;
    var report = generation.verdict && generation.verdict.report
      ? generation.verdict.report
      : root.TechnoHabRules.evaluatePlan(plan);
    latestResult = {
      plan: plan,
      rulesReport: report,
      generationResult: generation,
      programResolution: resolution,
      resolvedSelection: resolvedSelection || null,
      selectionIndex: Number.isFinite(selectionIndex) ? selectionIndex : 0,
      consent: consent,
      performance: latestGenerationPerformance
    };
    renderPlan(plan);
    renderRules(report); renderMeta(report);
    setText('stat-habitable', formatMeasure(plan.habitableArea, 1) + ' m²');
    setText('stat-walls', formatMeasure(plan.wallArea, 1) + ' m²');
    setText('stat-gross', formatMeasure(plan.grossFloorArea, 1) + ' m²');
    setText('stat-rooms', String(plan.rooms.length));
    setText('stat-seed', plan.seed); setText('stat-alerts', String(report.summary.hard));
    var position = resolvedSelection && resolvedSelection.selection
      ? ' · plan ' + (selectionIndex + 1) + '/' + resolvedSelection.selection.results.length : '';
    var partialSelection = resolvedSelection && resolvedSelection.selection &&
      resolvedSelection.selection.status === 'PARTIAL';
    statusElement.textContent = (resolution.status === 'RELAXED'
      ? 'Proposition de repli' : 'Plan cohérent') + position +
      (partialSelection ? ' · comparaison partielle' : '');
    statusElement.dataset.state = resolution.status === 'RELAXED' || partialSelection ? 'warning' : 'success';
    setPlanAvailable(true);
    var signature = planSignature(plan);
    var repeated = history.some(function (entry) { return entry.signature === signature; });
    if (repeated) {
      var notice = document.createElement('li');
      notice.className = 'rule-item rule-item--guideline';
      notice.innerHTML = '<strong>Conseil · Diversité des variantes</strong>' +
        '<span>Cette proposition reprend une disposition déjà obtenue. Régénérez pour en obtenir une autre.</span>';
      rulesList.appendChild(notice);
    }
    if (recordHistory !== false) {
      history.unshift({
        timestamp: Date.now(), variant: plan.variant, candidate: plan.candidate,
        seed: plan.seed, budget: plan.budget, signature: signature, repeated: repeated,
        generationStatus: generation.status,
        resolutionStatus: resolution.status,
        resolutionLevel: resolution.level,
        resolutionChanges: resolution.changes,
        selectionStatus: resolvedSelection && resolvedSelection.selection
          ? resolvedSelection.selection.status : null,
        selectionRank: Number.isFinite(selectionIndex) ? selectionIndex + 1 : null,
        selectionSize: resolvedSelection && resolvedSelection.selection
          ? resolvedSelection.selection.results.length : null,
        options: plan.options,
        evaluatedRules: report.evaluatedRules, hard: report.summary.hard,
        guideline: report.summary.guideline, limites: report.summary.limites,
        prealableRompu: report.prealableRompu, graviteMax: report.summary.graviteMax,
        performance: latestGenerationPerformance,
        echecs: report.violations.map(function (item) {
          return { regle: item.ruleId, niveau: item.level, entite: item.entityId,
            mesure: item.mesure, seuil: item.seuil, gravite: item.gravite, message: item.message };
        })
      });
      history = history.slice(0, HISTORY_MAX);
      saveHistory(); renderHistory();
    }
    if (analysisController) analysisController.setPlan();
    if (root.TechnoHabEvaluation) root.TechnoHabEvaluation.contexte(plan, report, APP_VERSION);
  }

  function queueGeneration() {
    if (generationBusy) return;
    var request = ++generationRequest;
    pendingResolution = null;
    setPlanAvailable(false);
    beginGenerationPerformance();
    setGenerationBusy(true);
    statusElement.textContent = 'Exploration des propositions…';
    statusElement.dataset.state = 'warning';
    var launch = function () {
      setTimeout(function () {
        if (request === generationRequest) generate();
        else setGenerationBusy(false);
      }, 0);
    };
    // Une frame complète laisse le navigateur peindre le curseur d'attente
    // avant que le calcul synchrone ne monopolise le fil principal.
    if (root.requestAnimationFrame) root.requestAnimationFrame(launch);
    else launch();
  }

  function generate() {
    try {
      var options = readForm();
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(options)); } catch (_) { /* facultatif */ }
      pendingResolution = null;
      var requestedCount = Number(new FormData(form).get('planCount')) === 3 ? 3 : 1;
      var resolvedSelection = root.TechnoHabGenerator.resolveSelection(
        options, variant, pendingSeed, requestedCount);
      var resolution = resolvedSelection.resolution;
      completeGenerationPerformance(resolvedSelection,
        resolution.status === 'UNRESOLVED' ? 'UNRESOLVED' : 'DONE', null);
      pendingSeed = undefined;
      if (resolution.status === 'UNRESOLVED' || !resolution.result || !resolution.result.builtPlan) {
        var resolutionError = new Error('Aucune proposition valide n’a été construite après les replis autorisés.');
        resolutionError.programResolution = resolution;
        resolutionError.resolvedSelection = resolvedSelection;
        throw resolutionError;
      }
      if (!resolvedSelection.selection || resolvedSelection.selection.status === 'EMPTY' ||
          !resolvedSelection.selection.results.length) {
        var selectionError = new Error('Le programme a été résolu, mais aucune organisation distincte n’a pu être retenue.');
        selectionError.programResolution = resolution;
        selectionError.resolvedSelection = resolvedSelection;
        selectionError.selectionStatus = 'EMPTY';
        throw selectionError;
      }
      var consentRequired = requiresConsent(resolution);
      renderResolutionNotice(resolution, consentRequired);
      if (consentRequired) {
        pendingResolution = resolvedSelection;
        clearActivePlan('La proposition attend votre accord avant affichage et export.');
        statusElement.textContent = 'Proposition à confirmer';
        statusElement.dataset.state = 'warning';
        resolutionConsentCheck.focus();
        return;
      }
      activateResolvedSelection(resolvedSelection, {
        required: false,
        accepted: true,
        method: 'not-required',
        acceptedAt: null
      });
    } catch (error) {
      var failedSelection = error && error.resolvedSelection;
      var failedResolution = error && error.programResolution || failedSelection && failedSelection.resolution;
      var lastAttempt = failedResolution && failedResolution.attempts.length
        ? failedResolution.attempts[failedResolution.attempts.length - 1] : null;
      if (!latestGenerationPerformance || latestGenerationPerformance.status === 'RUNNING') {
        completeGenerationPerformance(failedSelection, 'FAILED', error);
      } else if (latestGenerationPerformance && !latestGenerationPerformance.failure) {
        latestGenerationPerformance.status = 'FAILED';
        latestGenerationPerformance.failure = {
          name: error.name || 'Error', message: error.message || String(error),
          selectionStatus: error.selectionStatus || null
        };
      }
      pendingResolution = null;
      resolutionNotice.hidden = true;
      clearActivePlan('Une erreur a interrompu la résolution : ' +
        (error && error.message ? error.message : String(error)));
      if (error && error.selectionStatus === 'EMPTY') renderEmptySelection(failedSelection);
      statusElement.textContent = error && error.selectionStatus === 'EMPTY'
        ? 'Aucune comparaison disponible'
        : lastAttempt && lastAttempt.status === 'IMPOSSIBLE'
        ? 'Programme sans solution après replis'
        : lastAttempt && lastAttempt.status === 'NON_TROUVE'
          ? 'Aucune disposition trouvée'
          : 'Échec de la génération';
      statusElement.dataset.state = 'warning';
    } finally {
      releaseGenerationLock();
    }
  }
  function download(filename, content, type) {
    var url = URL.createObjectURL(new Blob([content], { type: type }));
    var link = document.createElement('a'); link.href = url; link.download = filename; link.click(); URL.revokeObjectURL(url);
  }

  function loadDeferredScript(source) {
    return new Promise(function (resolve, reject) {
      var existing = document.querySelector('script[data-deferred-source="' + source + '"]');
      if (existing) {
        if (existing.dataset.loaded === 'true') resolve();
        else {
          existing.addEventListener('load', resolve, { once: true });
          existing.addEventListener('error', reject, { once: true });
        }
        return;
      }
      var script = document.createElement('script');
      script.src = source;
      script.dataset.deferredSource = source;
      script.addEventListener('load', function () { script.dataset.loaded = 'true'; resolve(); }, { once: true });
      script.addEventListener('error', function () {
        script.remove();
        reject(new Error('Le module d’analyse n’a pas pu être chargé.'));
      }, { once: true });
      document.head.appendChild(script);
    });
  }

  function analysisContext() {
    var resultSnapshot = latestResult;
    var historySnapshot = history.slice();
    return {
      result: resultSnapshot,
      performance: resultSnapshot ? resultSnapshot.performance : latestGenerationPerformance,
      appVersion: APP_VERSION,
      planSvg: planSvg,
      resolutionTrace: resultSnapshot
        ? resolutionExportTrace(resultSnapshot.programResolution, resultSnapshot.consent) : null,
      getPlanDocument: function () {
        return resultSnapshot ? root.TechnoHabGenerator.exportDocument(
          resultSnapshot.plan, resultSnapshot.rulesReport, APP_VERSION,
          resolutionExportTrace(resultSnapshot.programResolution, resultSnapshot.consent)
        ) : null;
      },
      getHistory: function () { return historySnapshot; }
    };
  }

  function loadAnalysis() {
    if (analysisController) return Promise.resolve(analysisController);
    if (analysisLoading) return analysisLoading;
    analysisOpenButton.setAttribute('aria-busy', 'true');
    analysisExportButton.setAttribute('aria-busy', 'true');
    analysisOpenButton.disabled = true;
    analysisExportButton.disabled = true;
    analysisOpenButton.querySelector('span').textContent = 'Chargement…';
    analysisExportButton.textContent = 'Chargement de l’analyse…';
    analysisLoading = loadDeferredScript('./assets/analysis.data.js')
      .then(function () { return loadDeferredScript('./assets/analysis.js'); })
      .then(function () {
        analysisController = root.TechnoHabAnalysis.mount({ getContext: analysisContext });
        return analysisController;
      }).catch(function (error) {
        analysisLoading = null;
        throw error;
      }).then(function (loaded) {
        analysisOpenButton.removeAttribute('aria-busy');
        analysisExportButton.removeAttribute('aria-busy');
        analysisOpenButton.disabled = !latestResult;
        analysisExportButton.disabled = !latestResult;
        analysisOpenButton.querySelector('span').textContent = 'Analyse';
        analysisExportButton.textContent = 'Exporter l’analyse';
        return loaded;
      }, function (error) {
        analysisOpenButton.removeAttribute('aria-busy');
        analysisExportButton.removeAttribute('aria-busy');
        analysisOpenButton.disabled = !latestResult;
        analysisExportButton.disabled = !latestResult;
        analysisOpenButton.querySelector('span').textContent = 'Analyse';
        analysisExportButton.textContent = 'Exporter l’analyse';
        throw error;
      });
    return analysisLoading;
  }
  // Chaque génération tire sa propre graine : elle devient la référence du
  // plan, recopiable et rejouable, plutôt qu'un numéro de variante opaque.
  form.addEventListener('submit', function (event) {
    event.preventDefault();
    if (generationBusy) return;
    variant += 1;
    pendingSeed = (Math.random() * 4294967296) >>> 0;
    queueGeneration();
  });
  form.addEventListener('change', function () {
    variant = 1;
    pendingSeed = undefined;
    generationRequest += 1;
    pendingResolution = null;
    clearActivePlan('Paramètres modifiés. Lancez la génération pour construire une nouvelle proposition.');
    resolutionNotice.hidden = true;
    statusElement.textContent = 'Prêt à générer';
    statusElement.dataset.state = '';
    generationButton.innerHTML = generationButtonLabel();
  });
  resolutionConsentCheck.addEventListener('change', function () {
    resolutionActivate.disabled = !resolutionConsentCheck.checked;
    resolutionConsentStatus.textContent = resolutionConsentCheck.checked
      ? 'Accord prêt à être confirmé.' : '';
  });
  resolutionActivate.addEventListener('click', function () {
    if (!pendingResolution || !resolutionConsentCheck.checked) return;
    var accepted = pendingResolution;
    pendingResolution = null;
    activateResolvedSelection(accepted, {
      required: true,
      accepted: true,
      method: 'explicit-checkbox',
      acceptedAt: new Date().toISOString()
    });
    resolutionConsentCheck.disabled = true;
    resolutionActivate.hidden = true;
    resolutionConsentStatus.textContent = 'Proposition acceptée pour cet affichage et cet export.';
  });
  planSelectionTabs.addEventListener('click', function (event) {
    var tab = event.target.closest('[role="tab"]');
    if (!tab) return;
    activateSelectionPlan(Number(tab.dataset.index), false);
  });
  planSelectionTabs.addEventListener('keydown', function (event) {
    var tab = event.target.closest('[role="tab"]');
    if (!tab || !activeResolvedSelection || !activeResolvedSelection.selection) return;
    var count = activeResolvedSelection.selection.results.length;
    var index = Number(tab.dataset.index);
    var next = null;
    if (event.key === 'ArrowRight') next = (index + 1) % count;
    else if (event.key === 'ArrowLeft') next = (index - 1 + count) % count;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = count - 1;
    if (next === null) return;
    event.preventDefault();
    activateSelectionPlan(next, true);
  });
  rulesHistory.addEventListener('click', function (event) {
    var item = event.target.closest('.history-item');
    if (!item || !item.dataset.seed) return;
    pendingSeed = root.TechnoHabGenerator.decodeSeed(item.dataset.seed);
    if (pendingSeed !== null) queueGeneration();
  });
  jsonExportButton.addEventListener('click', function () {
    if (!latestResult) return;
    var exported = root.TechnoHabGenerator.exportDocument(
      latestResult.plan, latestResult.rulesReport, APP_VERSION,
      resolutionExportTrace(latestResult.programResolution, latestResult.consent)
    );
    download('technohab-plan-v' + variant + '-p' + (latestResult.selectionIndex + 1) + '.json',
      JSON.stringify(exported, null, 2), 'application/json');
  });
  analysisOpenButton.addEventListener('click', function () {
    if (!latestResult) return;
    loadAnalysis().then(function (loaded) {
      loaded.open();
    }).catch(function (error) {
      rulesMeta.textContent = error && error.message
        ? error.message : 'Le module d’analyse n’a pas pu être ouvert.';
    });
  });
  analysisExportButton.addEventListener('click', function () {
    if (!latestResult) return;
    analysisExportButton.disabled = true;
    analysisExportButton.setAttribute('aria-busy', 'true');
    analysisExportButton.textContent = 'Préparation du dossier…';
    loadAnalysis().then(function (loaded) {
      analysisExportButton.disabled = true;
      analysisExportButton.setAttribute('aria-busy', 'true');
      analysisExportButton.textContent = 'Préparation du dossier…';
      return loaded.exportCurrent();
    }).catch(function (error) {
      rulesMeta.textContent = error && error.message
        ? error.message : 'Le dossier d’analyse n’a pas pu être exporté.';
    }).then(function () {
      analysisExportButton.disabled = !latestResult;
      analysisExportButton.removeAttribute('aria-busy');
      analysisExportButton.textContent = 'Exporter l’analyse';
    });
  });
  svgExportButton.addEventListener('click', function () {
    if (!latestResult) return;
    var clone = planSvg.cloneNode(true); clone.setAttribute('xmlns', SVG_NS);
    var metadata = document.createElementNS(SVG_NS, 'metadata');
    metadata.setAttribute('data-technohab', 'program-resolution');
    metadata.textContent = JSON.stringify(
      resolutionExportTrace(latestResult.programResolution, latestResult.consent)
    );
    clone.insertBefore(metadata, clone.firstChild);
    if (latestResult.resolvedSelection && latestResult.resolvedSelection.selection) {
      var selectionMetadata = document.createElementNS(SVG_NS, 'metadata');
      selectionMetadata.setAttribute('data-technohab', 'plan-selection');
      selectionMetadata.textContent = JSON.stringify({
        status: latestResult.resolvedSelection.selection.status,
        requested: latestResult.resolvedSelection.selection.requested,
        activeRank: latestResult.selectionIndex + 1,
        available: latestResult.resolvedSelection.selection.results.length,
        seed: latestResult.plan.seed,
        comparison: latestResult.plan.comparison || null,
        verdict: latestResult.rulesReport.summary
      });
      clone.insertBefore(selectionMetadata, clone.firstChild);
    }
    download('technohab-plan-v' + variant + '-p' + (latestResult.selectionIndex + 1) + '.svg',
      new XMLSerializer().serializeToString(clone), 'image/svg+xml');
  });
  /* Le journal complet, échecs compris, pour analyse hors ligne. Chaque
     entrée porte sa graine : n'importe quel échec de la liste se rejoue
     sans avoir rien conservé d'autre que ce fichier. */
  var journalButton = document.getElementById('download-log');
  if (journalButton) {
    journalButton.addEventListener('click', function () {
      download('technohab-journal.json', JSON.stringify({
        profil: latestResult ? latestResult.rulesReport.profile : null,
        version: APP_VERSION,
        exporteLe: new Date().toISOString(),
        generations: history
      }, null, 2), 'application/json');
    });
  }
  /* Chantier 6 §6.4 — les avis s'exportent à part du journal des
     générations : ils n'ont ni le même rythme, ni le même usage, ni la même
     durée de vie. Le fichier est ignoré par git (`*.eval.json`). */
  var quizRacine = document.getElementById('quiz-eval');
  if (root.TechnoHabEvaluation && quizRacine) root.TechnoHabEvaluation.monter(quizRacine);
  var evalButton = document.getElementById('download-eval');
  if (evalButton && root.TechnoHabEvaluation) {
    evalButton.addEventListener('click', function () {
      var contenu = root.TechnoHabEvaluation.exporter();
      if (!contenu.entrees.length) {
        rulesMeta.textContent = 'Aucun avis enregistré pour l’instant : le journal d’évaluation est vide.';
        return;
      }
      download('technohab-avis.eval.json', JSON.stringify(contenu, null, 2), 'application/json');
    });
  }

  /* Le mobilier ne change pas le plan, seulement ce qu'on en voit : on
     redessine sans régénérer, donc sans changer de graine.

     Le socle n'est pas chargé avec la page — il ne pèse que sur les visites
     qui s'en servent. La bascule le réclame donc au chargeur partagé avant de
     redessiner, et l'attente est dite plutôt que subie. */
  function planHasCanonicalFurniture(plan) {
    return Boolean(plan && Array.isArray(plan.rooms) && plan.rooms.every(function (room) {
      return room.equipmentProgram && room.equipmentProgram.authority === 'BuiltPlan' &&
        Array.isArray(room.placements);
    }));
  }

  function montrerMobilier(actif) {
    afficherMobilier = actif;
    try { localStorage.setItem(FURNITURE_KEY, actif ? '1' : '0'); } catch (_) { /* facultatif */ }
    function redrawAndEvaluate() {
      if (!latestResult) return;
      renderPlan(latestResult.plan);
      latestResult.rulesReport = root.TechnoHabRules.evaluatePlan(latestResult.plan);
      renderRules(latestResult.rulesReport); renderMeta(latestResult.rulesReport);
    }
    if (!actif) {
      redrawAndEvaluate();
      return;
    }

    var chargeur = root.TechnoHabSocleLoader;
    if (!chargeur) return;
    if (planHasCanonicalFurniture(latestResult && latestResult.plan) ||
        (root.TechnoHabSocle && root.TechnoHabRoomModel && root.TechnoHabPlacement)) {
      redrawAndEvaluate();
      return;
    }
    if (furnitureToggle) furnitureToggle.disabled = true;
    chargeur.charger().then(function () {
      redrawAndEvaluate();
    }).catch(function () {
      afficherMobilier = false;
      if (furnitureToggle) furnitureToggle.checked = false;
      rulesMeta.textContent = 'Le solveur du socle n’a pas pu être chargé : le mobilier reste masqué.';
    }).then(function () {
      if (furnitureToggle) furnitureToggle.disabled = false;
    });
  }

  if (pathsToggle) {
    pathsToggle.checked = afficherParcours;
    pathsToggle.addEventListener('change', function () {
      afficherParcours = pathsToggle.checked;
      try { localStorage.setItem(PATHS_KEY, afficherParcours ? '1' : '0'); } catch (_) { /* facultatif */ }
      if (latestResult) renderPlan(latestResult.plan);
    });
  }
  if (furnitureToggle) {
    furnitureToggle.checked = afficherMobilier;
    furnitureToggle.addEventListener('change', function () { montrerMobilier(furnitureToggle.checked); });
  }

  /* Catalogue — une seconde vue locale, alimentée par le compilé du socle.
     Elle reste en lecture seule aujourd'hui ; sa structure en cartes prépare
     l'édition future sans dupliquer les caractéristiques dans le HTML. */
  var workspace = document.querySelector('.workspace');
  var catalogPage = document.getElementById('catalog-page');
  var catalogOpen = document.getElementById('catalog-open');
  var catalogRendered = false;

  function catalogElement(name, className, textValue) {
    var element = document.createElement(name);
    if (className) element.className = className;
    if (textValue !== undefined) element.textContent = textValue;
    return element;
  }

  function catalogIcon(symbolId, className) {
    var svg = svgElement('svg', { viewBox: '0 0 64 64', class: className, 'aria-hidden': 'true' });
    if (document.getElementById(symbolId)) svg.appendChild(svgElement('use', { href: '#' + symbolId }));
    else svg.appendChild(svgElement('rect', { x: 12, y: 12, width: 40, height: 40, rx: 2 }));
    return svg;
  }

  function formatMeters(value) {
    return Number(value).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' m';
  }

  function renderCatalog() {
    if (catalogRendered || !root.TechnoHabFit) return;
    var envelopes = root.TechnoHabFit.envelopes || {};
    var equipmentList = document.getElementById('catalog-equipment-list');
    var roomList = document.getElementById('catalog-room-list');
    var equipments = {};
    var resolvedCatalogTypes = { living: true, bedroom: true, bureau: true };
    var statusRank = { planned: 1, progress: 2, implemented: 3 };

    function equipmentDevelopmentStatus(type, entry, equipment) {
      if (!entry.trigger) return 'planned';
      if (resolvedCatalogTypes[type]) return 'implemented';
      var firstVariant = Object.keys(entry.programs || {})[0];
      var minimum = firstVariant && entry.programs[firstVariant];
      return minimum && (minimum.equipments || []).some(function (item) { return item.id === equipment.id; })
        ? 'implemented' : 'progress';
    }

    Object.keys(envelopes).forEach(function (type) {
      var entry = envelopes[type];
      Object.keys(entry.catalogs || {}).forEach(function (variant) {
        (entry.catalogs[variant].equipments || []).forEach(function (equipment) {
          var developmentStatus = equipmentDevelopmentStatus(type, entry, equipment);
          if (!equipments[equipment.id]) {
            equipments[equipment.id] = { equipment: equipment, rooms: [], variants: [], status: developmentStatus };
          }
          if (statusRank[developmentStatus] > statusRank[equipments[equipment.id].status]) {
            equipments[equipment.id].status = developmentStatus;
          }
          if (equipments[equipment.id].rooms.indexOf(entry.label) === -1) equipments[equipment.id].rooms.push(entry.label);
          (equipment.sizes || []).forEach(function (size) {
            if (equipments[equipment.id].variants.indexOf(size.label) === -1) equipments[equipment.id].variants.push(size.label);
          });
        });
      });
    });

    Object.keys(equipments).sort(function (left, right) {
      return equipments[left].equipment.label.localeCompare(equipments[right].equipment.label, 'fr');
    }).forEach(function (id) {
      var record = equipments[id], equipment = record.equipment;
      var card = catalogElement('article', 'catalog-card');
      card.appendChild(catalogIcon('furn-' + id, 'catalog-icon catalog-icon--equipment'));
      var body = catalogElement('div', 'catalog-card-body');
      body.appendChild(catalogElement('h4', '', equipment.label));
      var statusLabels = { implemented: 'Implémenté', progress: 'En cours', planned: 'Prévu' };
      var status = catalogElement('p', 'catalog-card-status', statusLabels[record.status]);
      status.dataset.status = record.status;
      body.appendChild(status);
      body.appendChild(catalogElement('p', 'catalog-card-meta',
        formatMeters(equipment.footprint.w) + ' × ' + formatMeters(equipment.footprint.d) +
        ' · ' + (equipment.required ? 'requis' : 'optionnel') +
        ' · pose ' + (equipment.anchor === 'wall' ? 'murale' : equipment.anchor === 'corner' ? 'en angle' : 'libre')));
      var clearance = (equipment.usage || []).map(function (usage) {
        return formatMeters(usage.min) + ' libre (' + usage.face + ')';
      }).join(' · ');
      if (clearance) body.appendChild(catalogElement('p', '', 'Circulation : ' + clearance));
      body.appendChild(catalogElement('p', '', 'Pièces : ' + record.rooms.join(', ')));
      if (record.variants.length) body.appendChild(catalogElement('p', '', 'Tailles : ' + record.variants.join(', ')));
      card.appendChild(body); equipmentList.appendChild(card);
    });

    Object.keys(envelopes).sort(function (left, right) {
      return envelopes[left].label.localeCompare(envelopes[right].label, 'fr');
    }).forEach(function (type) {
      var entry = envelopes[type];
      var card = catalogElement('article', 'catalog-card catalog-card--room');
      card.appendChild(catalogIcon('icon-' + type, 'catalog-icon catalog-icon--room'));
      var body = catalogElement('div', 'catalog-card-body');
      body.appendChild(catalogElement('h4', '', entry.label));
      var variants = Object.keys(entry.variants || {}).map(function (variant) {
        return variant === 'base' ? 'standard' : variant;
      });
      var available = entry.trigger ? 'Disponible dans le moteur' : 'Défini, pas encore activable';
      body.appendChild(catalogElement('p', 'catalog-card-status', available));
      body.appendChild(catalogElement('p', 'catalog-card-meta',
        'Rôle : ' + entry.role + ' · variante' + (variants.length > 1 ? 's' : '') + ' : ' + variants.join(', ')));
      if (Number.isFinite(entry.minProgramArea)) {
        body.appendChild(catalogElement('p', '', 'Plancher : ' + entry.minProgramArea.toLocaleString('fr-FR') +
          ' m² · côté court ' + formatMeters(entry.minProgramSide)));
      }
      card.appendChild(body); roomList.appendChild(card);
    });
    catalogRendered = true;
  }

  function routePage() {
    var catalogActive = location.hash === '#catalogue';
    var appShell = document.getElementById('technohab-app');
    document.documentElement.classList.toggle('catalog-route', catalogActive);
    if (appShell) appShell.classList.toggle('catalog-mode', catalogActive);
    if (workspace) workspace.hidden = catalogActive;
    if (catalogPage) catalogPage.hidden = !catalogActive;
    if (catalogOpen) catalogOpen.setAttribute('aria-current', catalogActive ? 'page' : 'false');
    document.getElementById('page-title').textContent = catalogActive
      ? 'Catalogue du moteur' : 'Laboratoire de plan';
    if (catalogActive) renderCatalog();
  }
  window.addEventListener('hashchange', routePage);

  loadHistory(); restoreForm();
  clearActivePlan('Choisissez les paramètres du lieu, puis lancez la génération.');
  statusElement.textContent = 'Prêt à générer';
  statusElement.dataset.state = '';
  routePage();

  /* Le chargeur est défini par un script qui suit celui-ci : on attend la fin
     de l'analyse du document pour honorer un choix retenu d'une visite
     précédente. */
  if (afficherMobilier) {
    document.addEventListener('DOMContentLoaded', function () { montrerMobilier(true); });
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
