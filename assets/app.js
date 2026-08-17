(function (root) {
  'use strict';

  var APP_VERSION = '2.1.0-alpha.4';
  var STORAGE_KEY = 'technohab:mvp-2d:v2';
  var HISTORY_KEY = 'technohab:mvp-2d:history:v1';
  var HISTORY_MAX = 20;
  var SVG_NS = 'http://www.w3.org/2000/svg';
  var form = document.getElementById('plan-form');
  var planSvg = document.getElementById('plan-svg');
  var rulesList = document.getElementById('rules-list');
  var rulesMeta = document.getElementById('rules-meta');
  var rulesHistory = document.getElementById('rules-history');
  var statusElement = document.getElementById('generation-status');
  var latestResult = null;
  var variant = 1;
  var history = [];
  var pendingSeed;
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
        entry.candidate + '/' + (entry.budget || '—') + (entry.repeated ? ' · disposition déjà vue' : '') + '</span>';
      rulesHistory.appendChild(item);
    });
  }

  document.getElementById('app-version').textContent = 'v' + APP_VERSION;
  function readForm() {
    var data = new FormData(form);
    return root.TechnoHabGenerator.normalizeOptions({
      surface: data.get('surface'), bedrooms: data.get('bedrooms'), bathrooms: data.get('bathrooms'),
      separateKitchen: data.get('separateKitchen') === 'on', includeWc: data.get('includeWc') === 'on', priority: data.get('priority')
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

  function roomMeta(room, content) {
    var length = Math.max(content.width, content.height);
    var width = Math.min(content.width, content.height);
    return 'L × l ' + formatMeasure(length, 2) + ' × ' + formatMeasure(width, 2) +
      ' m · ' + formatMeasure(room.area || room.targetArea, 1) + ' m²';
  }

  function placementContext(room, plan) {
    var rect = room.usableRect || room;
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
    return { openings: openings, blocked: blocked };
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
  function renderFurniture(room, group, plan) {
    var socle = root.TechnoHabSocle;
    var modele = root.TechnoHabRoomModel;
    var solveur = root.TechnoHabPlacement;
    if (!socle || !modele || !solveur) return null;
    var definition = socle.rooms[room.type];
    if (!definition) return null;
    var variante = room.type === 'bedroom' && room.id === 'bedroom_1' &&
      (definition.variants || []).indexOf('parentale') !== -1
      ? 'parentale'
      : (definition.variants || [null])[0];
    var programmeContext = {
      area: room.area || room.targetArea,
      openKitchen: room.type === 'living' && plan.options && !plan.options.separateKitchen,
      // Le WC intégré rejoint la première salle d'eau, celle que le programme
      // a effectivement composée (generator.js, composeInto).
      integratedWc: room.id === 'bath_1' && plan.options && !plan.options.includeWc,
      includeOptional: true
    };
    var designation = modele.designate(room.type, room.variant || variante, programmeContext);
    if (!designation.valid) {
      return { fits: false, stage: 'designation', reason: { code: 'ROOM_REQUIREMENTS_INVALID', message: 'Les exigences minimales de la pièce sont incohérentes.' } };
    }
    var equipements = designation.equipments;
    if (!equipements || !equipements.length) return null;

    var rect = room.usableRect || room;
    var largeur = rect.x1 - rect.x0, hauteur = rect.y1 - rect.y0;
    var validation, resultat;
    var contexte = placementContext(room, plan);
    try {
      validation = solveur.validate(equipements, { w: largeur, h: hauteur }, {
        relations: designation.relations, context: contexte
      });
      if (!validation.fits && equipements.some(function (equipment) { return !equipment.required; })) {
        programmeContext.includeOptional = false;
        designation = modele.designate(room.type, room.variant || variante, programmeContext);
        equipements = designation.equipments;
        validation = solveur.validate(equipements, { w: largeur, h: hauteur }, {
          relations: designation.relations, context: contexte
        });
      }
      if (!validation.fits) return validation;
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
    if (!resultat || !resultat.fits) return resultat || null;

    room.composition = {
      programs: designation.programs,
      equipments: equipements.map(function (equipment) { return equipment.id; }),
      optimization: resultat.optimization || null
    };
    resultat.placements.forEach(function (pose) {
      var f = pose.footprint;
      var symbole = document.getElementById('furn-' + pose.equipment.id);
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
          href: '#furn-' + pose.equipment.id,
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
      } else {
        // Pas de dessin pour cet équipement : l'emprise nue vaut mieux que rien.
        group.appendChild(svgElement('rect', footprintAttrs));
      }
    });
    return resultat;
  }

  function renderPlan(plan) {
    planSvg.innerHTML = '';
    /* Les emprises de mobilier, collectées pendant le tracé, servent à
       rejouer le cheminement : le générateur l'a calculé sur un logement
       vide, ce qui ne prouve pas qu'on y circule une fois meublé. */
    var emprises = [];
    planSvg.setAttribute('viewBox', '0 0 ' + plan.boundary.width + ' ' + plan.boundary.height);
    planSvg.setAttribute('role', 'img');
    planSvg.setAttribute('aria-label', 'Variante ' + plan.variant + ', plan de ' + plan.boundary.area + ' mètres carrés comprenant ' + plan.rooms.length + ' espaces');
    planSvg.appendChild(svgElement('rect', { x: 0, y: 0, width: plan.boundary.width, height: plan.boundary.height, class: 'plan-background', 'aria-hidden': 'true' }));
    plan.rooms.forEach(function (room) {
      var group = svgElement('g', {
        class: 'room room--' + room.type,
        tabindex: '0', focusable: 'true', role: 'group'
      });
      var roomRect = room.usableRect || room;
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
      if (contour) {
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
        var pose = renderFurniture(room, group, plan);
        if (pose && pose.fits && pose.placements) pose.placements.forEach(function (item) {
          var f = item.footprint, base = room.usableRect || room;
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

    if (emprises.length && root.TechnoHabGenerator.cheminementAvecObstacles) {
      try {
        plan.parcoursMeuble = root.TechnoHabGenerator.cheminementAvecObstacles(plan, emprises);
      } catch (_) { /* on garde alors le parcours du logement vide */ }
    }

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
            d: contourNonAtteinte(parties), class: 'plan-unreached', 'aria-hidden': 'true'
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
  function generate() {
    try {
      var options = readForm();
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(options)); } catch (_) { /* facultatif */ }
      var plan = root.TechnoHabGenerator.generatePlan(options, variant, pendingSeed);
      pendingSeed = undefined;
      var report = root.TechnoHabRules.evaluatePlan(plan);
      latestResult = { plan: plan, rulesReport: report };
      renderPlan(plan); renderRules(report); renderMeta(report);
      setText('stat-surface', plan.boundary.area + ' m²'); setText('stat-rooms', String(plan.rooms.length));
      setText('stat-seed', plan.seed); setText('stat-alerts', String(report.summary.hard));
      statusElement.textContent = report.summary.hard ? report.summary.hard + ' point(s) à revoir' : 'Plan cohérent';
      statusElement.dataset.state = report.summary.hard ? 'warning' : 'success';
      var signature = planSignature(plan);
      var repeated = history.some(function (entry) { return entry.signature === signature; });
      if (repeated) {
        var notice = document.createElement('li');
        notice.className = 'rule-item rule-item--guideline';
        notice.innerHTML = '<strong>Conseil · Diversité des variantes</strong>' +
          '<span>Cette proposition reprend une disposition déjà obtenue. Régénérez pour en obtenir une autre.</span>';
        rulesList.appendChild(notice);
      }
      /* Chaque échec est conservé avec sa cause, son écart et la graine qui
         le reproduit. C'est ce qui transforme un message qui passe en une
         donnée rejouable : on n'a plus à noter à la main ce qui s'est
         produit, il suffit de rejouer la graine. */
      history.unshift({
        timestamp: Date.now(), variant: plan.variant, candidate: plan.candidate,
        seed: plan.seed, budget: plan.budget, signature: signature, repeated: repeated,
        options: plan.options,
        evaluatedRules: report.evaluatedRules, hard: report.summary.hard,
        guideline: report.summary.guideline, limites: report.summary.limites,
        prealableRompu: report.prealableRompu, graviteMax: report.summary.graviteMax,
        echecs: report.violations.map(function (item) {
          return { regle: item.ruleId, niveau: item.level, entite: item.entityId,
            mesure: item.mesure, seuil: item.seuil, gravite: item.gravite, message: item.message };
        })
      });
      history = history.slice(0, HISTORY_MAX);
      saveHistory(); renderHistory();
    } catch (error) {
      statusElement.textContent = 'Échec de la génération';
      statusElement.dataset.state = 'warning';
      rulesMeta.textContent = 'Une erreur a interrompu la génération : ' + (error && error.message ? error.message : String(error));
    }
  }
  function download(filename, content, type) {
    var url = URL.createObjectURL(new Blob([content], { type: type }));
    var link = document.createElement('a'); link.href = url; link.download = filename; link.click(); URL.revokeObjectURL(url);
  }
  // Chaque génération tire sa propre graine : elle devient la référence du
  // plan, recopiable et rejouable, plutôt qu'un numéro de variante opaque.
  form.addEventListener('submit', function (event) {
    event.preventDefault();
    variant += 1;
    pendingSeed = (Math.random() * 4294967296) >>> 0;
    generate();
  });
  form.addEventListener('change', function () { variant = 1; pendingSeed = undefined; generate(); });
  rulesHistory.addEventListener('click', function (event) {
    var item = event.target.closest('.history-item');
    if (!item || !item.dataset.seed) return;
    pendingSeed = root.TechnoHabGenerator.decodeSeed(item.dataset.seed);
    if (pendingSeed !== null) generate();
  });
  document.getElementById('download-json').addEventListener('click', function () {
    if (latestResult) download('technohab-plan-v' + variant + '.json', JSON.stringify(latestResult, null, 2), 'application/json');
  });
  document.getElementById('download-svg').addEventListener('click', function () {
    if (!latestResult) return;
    var clone = planSvg.cloneNode(true); clone.setAttribute('xmlns', SVG_NS);
    download('technohab-plan-v' + variant + '.svg', new XMLSerializer().serializeToString(clone), 'image/svg+xml');
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
  /* Le mobilier ne change pas le plan, seulement ce qu'on en voit : on
     redessine sans régénérer, donc sans changer de graine.

     Le socle n'est pas chargé avec la page — il ne pèse que sur les visites
     qui s'en servent. La bascule le réclame donc au chargeur partagé avant de
     redessiner, et l'attente est dite plutôt que subie. */
  function montrerMobilier(actif) {
    afficherMobilier = actif;
    try { localStorage.setItem(FURNITURE_KEY, actif ? '1' : '0'); } catch (_) { /* facultatif */ }
    if (!actif) { if (latestResult) renderPlan(latestResult.plan); return; }

    var chargeur = root.TechnoHabSocleLoader;
    if (!chargeur) return;
    if (root.TechnoHabSocle && root.TechnoHabRoomModel && root.TechnoHabPlacement) {
      if (latestResult) renderPlan(latestResult.plan);
      return;
    }
    if (furnitureToggle) furnitureToggle.disabled = true;
    chargeur.charger().then(function () {
      if (latestResult) renderPlan(latestResult.plan);
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

  loadHistory(); restoreForm(); generate();

  /* Le chargeur est défini par un script qui suit celui-ci : on attend la fin
     de l'analyse du document pour honorer un choix retenu d'une visite
     précédente. */
  if (afficherMobilier) {
    document.addEventListener('DOMContentLoaded', function () { montrerMobilier(true); });
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
