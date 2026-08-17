(function (root) {
  'use strict';

  // Fichier généré par scripts/technohab-fit/build-envelopes.mjs.
  // Ne pas éditer : modifier socle.data.js puis relancer npm run fit:build.
  //
  // Pour chaque type de pièce et chaque variante, la liste des plus petits
  // rectangles admissibles, en CENTIMÈTRES, triée par largeur croissante.
  // Un rectangle convient s'il domine l'un de ces couples, dans un sens ou
  // dans l'autre — une pièce n'a pas d'orientation imposée.

  var ENVELOPES = {
    living: { label: "Séjour", mvp: true, variants: {
      base: [[180, 180]]
    } },
    dining: { label: "Salle à manger", mvp: false, variants: {
      base: [[240, 300], [300, 240]]
    } },
    bedroom: { label: "Chambre", mvp: true, variants: {
      enfant: [[150, 310], [190, 210], [210, 190], [310, 150]],
      parentale: [[190, 320], [260, 310], [310, 260], [320, 190]]
    } },
    kitchen: { label: "Cuisine", mvp: true, variants: {
      base: [[120, 210], [180, 180], [210, 120]]
    } },
    bath: { label: "Salle d’eau", mvp: true, variants: {
      eau: [[90, 220], [140, 170], [170, 140], [220, 90]],
      bain: [[150, 220], [170, 200], [200, 170], [220, 150]]
    } },
    wc: { label: "WC", mvp: true, variants: {
      base: [[70, 150], [150, 70]]
    } },
    circulation: { label: "Circulation", mvp: true, variants: {
      base: [[70, 70]]
    } },
    entree: { label: "Entrée", mvp: false, variants: {
      base: [[70, 70]]
    } },
    bureau: { label: "Bureau", mvp: false, variants: {
      base: [[120, 150], [150, 120]]
    } },
    buanderie: { label: "Buanderie", mvp: false, variants: {
      base: [[70, 150], [150, 70]]
    } },
    cellier: { label: "Cellier", mvp: false, variants: {
      base: [[110, 120], [120, 110]]
    } },
    local_technique: { label: "Local technique", mvp: false, variants: {
      base: [[70, 230], [90, 200], [130, 140], [140, 130], [200, 90], [230, 70]]
    } },
    garage: { label: "Garage", mvp: false, variants: {
      base: [[310, 500], [500, 310]]
    } }
  };

  function fits(type, widthMeters, heightMeters, variant) {
    var entry = ENVELOPES[type];
    if (!entry) return true; // type sans exigence connue : ne rien interdire
    var w = Math.round(widthMeters * 100);
    var h = Math.round(heightMeters * 100);
    var names = variant ? [variant] : Object.keys(entry.variants);
    return names.some(function (name) {
      var pairs = entry.variants[name] || [];
      return pairs.some(function (pair) {
        return (w >= pair[0] && h >= pair[1]) || (h >= pair[0] && w >= pair[1]);
      });
    });
  }

  /** Le plus petit rectangle admissible, pour expliquer un refus. */
  function smallest(type, variant) {
    var entry = ENVELOPES[type];
    if (!entry) return null;
    var names = variant ? [variant] : Object.keys(entry.variants);
    var best = null;
    names.forEach(function (name) {
      (entry.variants[name] || []).forEach(function (pair) {
        var area = pair[0] * pair[1];
        if (!best || area < best.area) best = { w: pair[0] / 100, h: pair[1] / 100, area: area, variant: name };
      });
    });
    return best;
  }

  root.TechnoHabFit = { envelopes: ENVELOPES, fits: fits, smallest: smallest };
})(typeof globalThis !== 'undefined' ? globalThis : this);
