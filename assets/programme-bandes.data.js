(function (root) {
  'use strict';

  /* Table de programme par bande de surface — TABLE_PROGRAMME_BANDES.md.

     DONNÉE PROVISOIRE. Transcrite le 26 septembre
     2026 de la table de Théo (v0), validée par lui le même jour. Depuis
     l'étape 4, `appliquerPlanchersParBande()` (generator.js) en lit trois
     lignes — chambre, salle à manger, séjour ; le moniteur
     (`scripts/compare-table.mjs`) mesure l'écart de tout le reste.

     SENS D'UNE CELLULE, précisé par Théo le 26 septembre 2026 : la surface
     minimale CIBLE d'une pièce *lorsqu'elle est activée* — pas une part du
     total, donc pas une somme. Les colonnes n'ont pas à s'additionner à la
     surface du logement.

     Sources : `n3` — convention de projet, table de Théo. L'ancrage
     réglementaire (pièce principale ≥ 9 m², décret 2002-120 art. 4) est un
     autre objet : VAL-REG-MAIN-ROOM-AREA-MIN-001 du registre canonique. */

  var BANDS = [12, 20, 25, 35, 50, 80];

  // null = « non définie à cette bande » (cellule vide de la table).
  var ROOMS = {
    salle_de_bain_totale: { label: 'Salle de bain (avec WC)', engine: 'bath', values: [4, 4, 4, 4, 4, 4] },
    salle_de_bain_sans_wc: { label: 'Salle de bain sans WC', engine: 'bath', values: [null, null, 3.5, 3.5, 3.5, 3.5] },
    wc: { label: 'WC', engine: 'wc', values: [null, null, 1.5, 1.5, 1.5, 1.5] },
    sejour: { label: 'Séjour', engine: 'living', values: [9, 7, 9, 15, 20, 20] },
    chambre: { label: 'Chambre', engine: 'bedroom', values: [null, 9, 10, 11, 12, 12] },
    cuisine: { label: 'Cuisine', engine: 'kitchen', values: [null, 5, 5, 5, 5, 5] },
    bureau: { label: 'Bureau', engine: 'bureau', values: [null, 7, 7, 7, 7, 7] },
    cellier: { label: 'Cellier', engine: 'cellier', values: [null, null, 4, 5, 6, 7] },
    local_technique: { label: 'Local technique', engine: 'local_technique', values: [null, null, 4, 5, 6, 7] },
    salle_a_manger: { label: 'Salle à manger', engine: 'dining', values: [null, null, 7, 7, 10, 10] },
    buanderie: { label: 'Buanderie', engine: 'buanderie', values: [null, null, null, null, 7, 8] },
    garage: { label: 'Garage', engine: 'garage', values: [null, null, null, null, null, 15] }
  };

  /* Seuils d'apparition annoncés par Théo. Ils sont distincts des cellules :
     la table donne la taille *si* la pièce existe, ces seuils disent *quand*
     elle peut exister. Une contradiction reste ouverte et écrite ici plutôt
     que tranchée en silence : la salle à manger a une taille dès 25 m² mais ne
     se sépare qu'à 35 m². */
  var UNLOCKS = [
    { id: 'wc_separe', from: 25 },
    { id: 'cuisine_separee', from: 25 },
    { id: 'bureau', from: 25 },
    { id: 'cellier', from: 25, note: 'fusionné avec le local technique avant 25 m²' },
    { id: 'local_technique', from: 25, note: 'fusionné avec le cellier avant 25 m²' },
    { id: 'salle_a_manger_separee', from: 35, note: 'la table donne une taille dès 25 m² : contradiction ouverte' },
    { id: 'couloirs', from: 35 },
    { id: 'buanderie', from: 50 },
    { id: 'garage', from: 80 }
  ];

  /* Marches : la valeur d'une bande vaut jusqu'à la suivante. Hypothèse de
     lecture, non tranchée par Théo (TABLE_PROGRAMME_BANDES.md §2.5) — une
     interpolation resterait possible. Au-delà de 80 m², la dernière valeur. */
  function bandIndex(surface) {
    var index = -1;
    for (var i = 0; i < BANDS.length; i += 1) if (surface >= BANDS[i]) index = i;
    return index;
  }

  function target(roomId, surface) {
    var room = ROOMS[roomId];
    if (!room) return null;
    var index = bandIndex(surface);
    for (var i = index; i >= 0; i -= 1) if (room.values[i] !== null) return room.values[i];
    return null;
  }

  function unlocked(unlockId, surface) {
    for (var i = 0; i < UNLOCKS.length; i += 1) {
      if (UNLOCKS[i].id === unlockId) return surface >= UNLOCKS[i].from;
    }
    return false;
  }

  root.TechnoHabProgrammeBandes = {
    version: 'v0-2026-09-26',
    status: 'PROVISIONAL',
    consumedByEngine: true, // étape 4 : chambre, salle à manger, séjour (repas hébergé)
    semantics: 'surface minimale cible d’une pièce lorsqu’elle est activée',
    minimumSurface: 12,
    bands: BANDS.slice(),
    rooms: ROOMS,
    unlocks: UNLOCKS,
    target: target,
    unlocked: unlocked
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
