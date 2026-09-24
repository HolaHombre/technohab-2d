(function (root) {
  'use strict';

  /* Export DXF — REF-1, ligne 3.
     Le plan de principe cesse d'être une image : un tiers peut le reprendre.

     Format retenu : **R12 (AC1009)**, en ASCII. C'est le plus ancien des
     formats encore universellement lus, et c'est exactement pour cela qu'il
     est choisi : il n'exige ni poignées (`handles`), ni table d'objets, ni
     classes, et aucun logiciel de CAO ne le refuse. Les formats plus récents
     apporteraient la LWPOLYLINE et les hachures ; ils apporteraient surtout
     des occasions d'être illisible quelque part.

     Ce que l'export N'EST PAS. Un plan de principe reste non contractuel
     (DOCTRINE.md) : ni site, ni structure porteuse, ni réseaux, ni niveaux.
     Le DXF ne change pas cela — il change qui peut ouvrir le fichier. Le
     calque `TH_AVERTISSEMENT` porte cette limite DANS le fichier, pour
     qu'elle voyage avec lui.

     Repère. Le plan travaille en mètres, Y vers le bas (convention écran,
     héritée du SVG). La CAO travaille Y vers le haut. Toutes les ordonnées
     sont donc retournées une fois, ici et nulle part ailleurs : `flip()` est
     le seul endroit du fichier qui connaisse cette différence. */

  var UNIT_METRE = 6;              // $INSUNITS
  var TEXT_HEIGHT_LABEL = 0.22;    // m
  var TEXT_HEIGHT_META = 0.15;     // m

  /* Calques. Le nom et la couleur sont un contrat de lecture : quiconque
     ouvre le fichier doit pouvoir éteindre le mobilier sans éteindre les
     murs. Couleurs en index ACI, universelles en R12. */
  var LAYERS = [
    { name: 'TH_MURS', color: 7, note: 'Murs — emprise réelle, épaisseur comprise' },
    { name: 'TH_PIECES', color: 3, note: 'Contour utile des pièces' },
    { name: 'TH_OUVERTURES', color: 5, note: 'Baies, et débattement des portes' },
    { name: 'TH_MOBILIER', color: 8, note: 'Emprises du mobilier requis' },
    { name: 'TH_DEGAGEMENTS', color: 9, note: 'Zones d’usage — ce qui doit rester libre' },
    { name: 'TH_TEXTES', color: 2, note: 'Noms de pièces et surfaces' },
    { name: 'TH_AVERTISSEMENT', color: 1, note: 'Portée du document' }
  ];

  function g(code, value) { return code + '\n' + value + '\n'; }

  /* R12 ne déclare aucun encodage : un octet non ASCII y est illisible, et
     illisible différemment selon le logiciel. Les libellés du moteur portent
     des accents et des apostrophes typographiques — « Salle d'eau », « Séjour ».
     Ils sont donc translittérés, une fois, ici. Perdre un accent est un
     moindre mal ; livrer un fichier qui s'ouvre de travers n'en est pas un. */
  var ASCII = {
    'à': 'a', 'â': 'a', 'ä': 'a', 'á': 'a', 'ã': 'a', 'å': 'a',
    'é': 'e', 'è': 'e', 'ê': 'e', 'ë': 'e',
    'î': 'i', 'ï': 'i', 'í': 'i', 'ì': 'i',
    'ô': 'o', 'ö': 'o', 'ó': 'o', 'ò': 'o', 'õ': 'o',
    'ù': 'u', 'û': 'u', 'ü': 'u', 'ú': 'u',
    'ç': 'c', 'ñ': 'n', 'ÿ': 'y', 'œ': 'oe', 'æ': 'ae',
    '’': "'", '‘': "'", '“': '"', '”': '"', '–': '-', '—': '-',
    '…': '...', '²': '2', '³': '3', '°': 'deg', '«': '"', '»': '"', ' ': ' '
  };

  function ascii(value) {
    var text = String(value === null || value === undefined ? '' : value);
    var out = '';
    for (var i = 0; i < text.length; i += 1) {
      var char = text[i];
      var lower = char.toLowerCase();
      if (char.charCodeAt(0) < 128) { out += char; continue; }
      if (ASCII[char]) { out += ASCII[char]; continue; }
      if (ASCII[lower]) {
        out += char === lower ? ASCII[lower] : ASCII[lower].toUpperCase();
        continue;
      }
      out += '?';
    }
    return out;
  }

  function num(value) {
    /* Le millimètre est la précision du moteur ; trois décimales de mètre
       la restituent exactement, et rien au-delà n'aurait de sens. */
    return (Math.round(value * 1000) / 1000).toFixed(3);
  }

  function section(name, body) {
    return g(0, 'SECTION') + g(2, name) + body + g(0, 'ENDSEC');
  }

  function header() {
    return section('HEADER',
      g(9, '$ACADVER') + g(1, 'AC1009') +
      g(9, '$INSUNITS') + g(70, UNIT_METRE) +
      g(9, '$MEASUREMENT') + g(70, 1));
  }

  function tables() {
    var body = g(0, 'TABLE') + g(2, 'LAYER') + g(70, LAYERS.length);
    LAYERS.forEach(function (layer) {
      body += g(0, 'LAYER') + g(2, layer.name) + g(70, 0) +
        g(62, layer.color) + g(6, 'CONTINUOUS');
    });
    body += g(0, 'ENDTAB');
    return section('TABLES', body);
  }

  function line(layer, x0, y0, x1, y1) {
    return g(0, 'LINE') + g(8, layer) +
      g(10, num(x0)) + g(20, num(y0)) + g(30, '0.0') +
      g(11, num(x1)) + g(21, num(y1)) + g(31, '0.0');
  }

  /* R12 n'a pas la LWPOLYLINE : une polyligne s'écrit en POLYLINE, autant de
     VERTEX que de sommets, puis SEQEND. Verbeux, mais lu partout. */
  function polyline(layer, points, closed) {
    var body = g(0, 'POLYLINE') + g(8, layer) + g(66, 1) +
      g(10, '0.0') + g(20, '0.0') + g(30, '0.0') + g(70, closed ? 1 : 0);
    points.forEach(function (point) {
      body += g(0, 'VERTEX') + g(8, layer) +
        g(10, num(point.x)) + g(20, num(point.y)) + g(30, '0.0');
    });
    return body + g(0, 'SEQEND') + g(8, layer);
  }

  function rectangle(layer, box) {
    return polyline(layer, [
      { x: box.x0, y: box.y0 }, { x: box.x1, y: box.y0 },
      { x: box.x1, y: box.y1 }, { x: box.x0, y: box.y1 }
    ], true);
  }

  function text(layer, x, y, height, value) {
    return g(0, 'TEXT') + g(8, layer) +
      g(10, num(x)) + g(20, num(y)) + g(30, '0.0') +
      g(40, num(height)) + g(1, ascii(value)) + g(72, 1) + g(11, num(x)) + g(21, num(y)) + g(31, '0.0');
  }

  root.TechnoHabDxf = {
    layers: LAYERS,

    /* `build(plan)` rend une chaîne DXF complète. Rien n'est écrit sur le
       disque ici : l'appelant décide quoi en faire. */
    build: function (plan) {
      if (!plan || !plan.boundary) {
        throw new TypeError('Export DXF : plan ou emprise absents.');
      }
      var H = plan.boundary.height;
      /* Le seul endroit qui connaît le sens de l'axe Y. */
      function flip(y) { return H - y; }
      function box(b) { return { x0: b.x0, y0: flip(b.y1), x1: b.x1, y1: flip(b.y0) }; }

      var out = '';

      (plan.walls || []).forEach(function (wall) {
        if (wall.volume) out += rectangle('TH_MURS', box(wall.volume));
      });

      (plan.rooms || []).forEach(function (room) {
        (room.usablePolygon || []).forEach(function (ring) {
          if (!ring || ring.length < 3) return;
          out += polyline('TH_PIECES', ring.map(function (p) {
            return { x: p.x, y: flip(p.y) };
          }), true);
        });
      });

      /* Une ouverture se lit à deux choses : la baie, et ce qu'elle coûte en
         place. La seconde est la seule qui décide d'un agencement, donc elle
         est tracée — c'est `debattement`, déjà calculé par le moteur. */
      function opening(o) {
        var half = (o.bayWidth || o.largeur || 0) / 2;
        if (o.axe === 'vertical') {
          out += line('TH_OUVERTURES', o.x, flip(o.y - half), o.x, flip(o.y + half));
        } else {
          out += line('TH_OUVERTURES', o.x - half, flip(o.y), o.x + half, flip(o.y));
        }
        if (o.debattement) out += rectangle('TH_OUVERTURES', box(o.debattement));
      }
      (plan.portes || []).forEach(opening);
      (plan.fenetres || []).forEach(opening);

      (plan.rooms || []).forEach(function (room) {
        (room.placements || []).forEach(function (placement) {
          if (placement.footprint) out += rectangle('TH_MOBILIER', box(placement.footprint));
          (placement.usage || []).forEach(function (zone) {
            out += rectangle('TH_DEGAGEMENTS', box(zone));
          });
        });
      });

      (plan.rooms || []).forEach(function (room) {
        var bounds = room.usableBounds;
        if (!bounds) return;
        var cx = (bounds.x0 + bounds.x1) / 2;
        var cy = flip((bounds.y0 + bounds.y1) / 2);
        out += text('TH_TEXTES', cx, cy, TEXT_HEIGHT_LABEL, room.label || room.type || '');
        if (typeof room.area === 'number') {
          out += text('TH_TEXTES', cx, cy - TEXT_HEIGHT_LABEL * 1.6, TEXT_HEIGHT_META,
            (Math.round(room.area * 100) / 100).toFixed(2) + ' m2');
        }
      });

      /* L'avertissement voyage avec le fichier. Un DXF se transmet, se
         renomme et se rouvre des mois plus tard : la portée du document ne
         peut pas rester dans la page qui l'a produit. */
      out += text('TH_AVERTISSEMENT', 0, flip(H) - 0.6, TEXT_HEIGHT_META,
        'TechnoHab — plan de principe NON CONTRACTUEL. Sans site, structure porteuse, reseaux ni niveaux.');
      if (plan.seed) {
        out += text('TH_AVERTISSEMENT', 0, flip(H) - 0.95, TEXT_HEIGHT_META,
          'Graine ' + plan.seed + ' — le plan se rejoue a l identique depuis cette seule valeur.');
      }

      return header() + tables() + section('ENTITIES', out) + g(0, 'EOF');
    }
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
