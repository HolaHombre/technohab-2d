(function (root) {
  'use strict';

  // Socle d'agencement — transcription exécutable de SOCLE_AGENCEMENT.md §5.
  // Le document fait foi : toute divergence de cote est un défaut de ce
  // fichier, pas une variante.
  //
  // footprint  { w, d } emprise en mètres, w le long du mur d'ancrage
  // anchor     wall | corner | free
  // usage      dégagements requis, exprimés par face
  //              face  : front (devant, côté w) | long | foot | around
  //              min   : profondeur libre en mètres
  // variant    l'équipement n'est requis que dans cette variante de la pièce
  // assumed    longueur non fixée par le socle, retenue par convention
  // relations  préférences ou règles dures entre équipements requis ; elles
  //            qualifient une solution, sans modifier leurs dimensions
  //
  // val        identifiant de traçabilité, voir DATASOURCE_EQUIPEMENTS.md.
  //            Une cote sans `val` n'est adossée à aucune source connue :
  //            c'est une convention du projet, et elle doit se lire ainsi.
  //
  // Aucune emprise de ce fichier n'est réglementaire : ce sont des valeurs
  // d'usage, cf. l'avertissement en tête de SOCLE_AGENCEMENT.md.

  var MODULE = 1.20; // longueur retenue pour les linéaires à longueur libre

  var ROOMS = {
    living: {
      label: 'Séjour', mvp: true, freeRect: { w: 1.20, d: 1.20 },
      equipments: [
        { id: 'sofa', label: 'Canapé', required: true, footprint: { w: 1.80, d: 0.90 }, anchor: 'wall', usage: [{ face: 'front', min: 0.90 }] },
        { id: 'coffee_table', label: 'Table basse', required: false, minRoomArea: 18, footprint: { w: 1.10, d: 0.60 }, anchor: 'free', usage: [{ face: 'around', min: 0.45 }] },
        { id: 'tv_unit', label: 'Meuble bas', required: false, minRoomArea: 22, footprint: { w: MODULE, d: 0.40 }, anchor: 'wall', usage: [{ face: 'front', min: 0.60 }] }
      ],
      relations: [
        { code: 'LIVING-FOCAL-001', kind: 'faces', subject: 'sofa', target: 'tv_unit', optional: true, level: 'GUIDELINE', weight: 1.8, label: 'Le canapé fait face au meuble média' },
        { code: 'LIVING-TABLE-001', kind: 'near', subject: 'coffee_table', target: 'sofa', max: 1.80, optional: true, level: 'GUIDELINE', weight: 1.2, label: 'La table basse reste liée au canapé' }
      ]
    },

    dining: {
      label: 'Salle à manger', mvp: false,
      equipments: [
        // Les assises sont portées par la zone d'usage : c'est elle qui
        // dimensionne la pièce, pas la table.
        { id: 'dining_table_4', label: 'Table 4 places', required: true, footprint: { w: 1.40, d: 0.80 }, anchor: 'free', usage: [{ face: 'around', min: 0.80 }] }
      ]
    },

    bedroom: {
      label: 'Chambre', mvp: true, variants: ['enfant', 'parentale'],
      equipments: [
        { id: 'bed_90', label: 'Lit simple 90', val: 'VAL-EQ-001', required: true, variant: 'enfant', footprint: { w: 0.90, d: 1.90 }, anchor: 'wall', usage: [{ face: 'long', min: 0.60, sides: 1 }] },
        { id: 'bed_140', label: 'Lit double 140', val: 'VAL-EQ-002', required: true, variant: 'parentale', footprint: { w: 1.40, d: 1.90 }, anchor: 'wall', usage: [{ face: 'long', min: 0.60, sides: 2 }] },
        // Le marché bascule du 140×190 vers le 160×200 : variante offerte,
        // non requise, pour ne pas surdimensionner le programme courant.
        { id: 'bed_160', label: 'Lit queen 160', val: 'VAL-EQ-003', required: false, variant: 'parentale', footprint: { w: 1.60, d: 2.00 }, anchor: 'wall', usage: [{ face: 'long', min: 0.60, sides: 2 }] },
        { id: 'wardrobe', label: 'Penderie', required: true, assumed: true, footprint: { w: MODULE, d: 0.60 }, anchor: 'wall', usage: [{ face: 'front', min: 0.60 }] }
      ],
      relations: [
        { code: 'BED-STORAGE-001', kind: 'different-wall', subject: 'wardrobe', targetAny: ['bed_90', 'bed_140'], level: 'GUIDELINE', weight: 1.4, label: 'Le rangement libère le mur de tête du lit' }
      ]
    },

    kitchen: {
      label: 'Cuisine', mvp: true, facingClearance: 1.20,
      equipments: [
        { id: 'sink', label: 'Évier', val: 'VAL-EQ-010', required: true, footprint: { w: 0.60, d: 0.60 }, anchor: 'wall', usage: [{ face: 'front', min: 0.90 }], services: ['eau', 'evacuation'] },
        { id: 'hob', label: 'Plaque de cuisson', val: 'VAL-EQ-010', required: true, footprint: { w: 0.60, d: 0.60 }, anchor: 'wall', usage: [{ face: 'front', min: 0.90 }], services: ['electricite'] },
        // Le plan de travail entre évier et plaque n'est pas négociable :
        // sans lui la cuisine est géométriquement valide et inutilisable.
        { id: 'worktop', label: 'Plan de travail', val: 'VAL-EQ-012', required: true, footprint: { w: 0.60, d: 0.60 }, anchor: 'wall', usage: [{ face: 'front', min: 0.90 }], between: ['sink', 'hob'] },
        // Un réfrigérateur encastrable s'aligne sur le plan de travail : la
        // profondeur de 0,65 relevée auparavant surdimensionnait la cuisine.
        { id: 'fridge', label: 'Réfrigérateur', val: 'VAL-EQ-016', required: true, footprint: { w: 0.60, d: 0.60 }, anchor: 'wall', usage: [{ face: 'front', min: 0.90 }] },
        { id: 'dishwasher', label: 'Lave-vaisselle', val: 'VAL-EQ-015', required: false, minRoomArea: 9, footprint: { w: 0.60, d: 0.60 }, anchor: 'wall', usage: [{ face: 'front', min: 0.90 }], services: ['eau', 'evacuation'] }
      ],
      relations: [
        { code: 'KITCHEN-SEQUENCE-001', kind: 'between', subject: 'worktop', targets: ['sink', 'hob'], level: 'HARD', weight: 4, label: 'Le plan de travail sépare l’évier de la plaque' },
        { code: 'KITCHEN-ALIGN-001', kind: 'same-wall', subject: 'sink', target: 'worktop', level: 'GUIDELINE', weight: 1.5, label: 'L’évier et la préparation forment un linéaire' },
        { code: 'KITCHEN-ALIGN-002', kind: 'same-wall', subject: 'hob', target: 'worktop', level: 'GUIDELINE', weight: 1.5, label: 'La plaque et la préparation forment un linéaire' },
        { code: 'KITCHEN-COLD-001', kind: 'near', subject: 'fridge', target: 'worktop', max: 2.40, level: 'GUIDELINE', weight: 1, label: 'Le froid reste proche de la zone de préparation' }
      ]
    },

    bath: {
      label: 'Salle d’eau', mvp: true, variants: ['eau', 'bain'], services: ['ventilation'],
      equipments: [
        { id: 'shower', label: 'Douche', val: 'VAL-EQ-031', required: true, variant: 'eau', footprint: { w: 0.90, d: 0.90 }, anchor: 'corner', usage: [{ face: 'front', min: 0.80 }], services: ['eau', 'evacuation'] },
        { id: 'bathtub', label: 'Baignoire', val: 'VAL-EQ-030', required: true, variant: 'bain', footprint: { w: 1.70, d: 0.70 }, anchor: 'wall', usage: [{ face: 'front', min: 0.80 }], services: ['eau', 'evacuation'] },
        // Le dégagement de 0,80 est un minimum, cohérent avec l'espace
        // d'usage réglementaire ; 1,10 est la valeur de confort relevée.
        { id: 'washbasin', label: 'Lavabo', required: true, footprint: { w: 0.60, d: 0.50 }, anchor: 'wall', usage: [{ face: 'front', min: 0.80, comfort: 1.10 }], services: ['eau', 'evacuation'] },
        { id: 'towel_rail', label: 'Sèche-serviettes', required: false, minRoomArea: 4, footprint: { w: 0.60, d: 0.15 }, anchor: 'wall', usage: [] }
      ],
      relations: [
        { code: 'BATH-USE-001', kind: 'different-wall', subject: 'washbasin', targetAny: ['shower', 'bathtub'], level: 'GUIDELINE', weight: 1, label: 'Le lavabo préserve la façade de l’équipement humide principal' }
      ]
    },

    wc: {
      label: 'WC', mvp: true, minimalRect: { w: 0.90, d: 1.30 },
      equipments: [
        { id: 'wc_pan', label: 'Cuvette', required: true, footprint: { w: 0.40, d: 0.70 }, anchor: 'wall', usage: [{ face: 'front', min: 0.80, width: 0.60 }], services: ['eau', 'evacuation'] },
        { id: 'handbasin', label: 'Lave-mains', required: false, minRoomArea: 2, footprint: { w: 0.40, d: 0.30 }, anchor: 'corner', usage: [{ face: 'front', min: 0.50 }], services: ['eau', 'evacuation'] }
      ]
    },

    // Pas d'équipement : la circulation est contrainte par sa largeur libre,
    // déjà tenue par TH2D-CIRC-001 et 003.
    circulation: { label: 'Circulation', mvp: true, equipments: [], clearWidth: { min: 1.20, max: 1.80 } },

    entree: {
      label: 'Entrée', mvp: false,
      equipments: [
        { id: 'closet', label: 'Placard', required: false, assumed: true, footprint: { w: MODULE, d: 0.60 }, anchor: 'wall', usage: [{ face: 'front', min: 0.60 }] }
      ]
    },

    bureau: {
      label: 'Bureau', mvp: false,
      equipments: [
        { id: 'desk', label: 'Plan de travail', required: true, footprint: { w: 1.20, d: 0.60 }, anchor: 'wall', usage: [{ face: 'front', min: 0.90 }] },
        { id: 'bookcase', label: 'Bibliothèque', required: false, assumed: true, footprint: { w: MODULE, d: 0.35 }, anchor: 'wall', usage: [{ face: 'front', min: 0.60 }] }
      ]
    },

    buanderie: {
      label: 'Buanderie', mvp: false,
      equipments: [
        { id: 'washer', label: 'Lave-linge', required: true, footprint: { w: 0.60, d: 0.60 }, anchor: 'wall', usage: [{ face: 'front', min: 0.90 }], services: ['eau', 'evacuation'] },
        { id: 'dryer', label: 'Sèche-linge', required: false, footprint: { w: 0.60, d: 0.60 }, anchor: 'wall', usage: [{ face: 'front', min: 0.90 }], services: ['electricite', 'evacuation'] }
      ]
    },

    cellier: {
      label: 'Cellier', mvp: false,
      equipments: [
        { id: 'shelving', label: 'Étagères', required: true, assumed: true, footprint: { w: MODULE, d: 0.45 }, anchor: 'wall', usage: [{ face: 'front', min: 0.60 }] }
      ]
    },

    local_technique: {
      label: 'Local technique', mvp: false,
      equipments: [
        // Zone d'entretien : elle existe pour le technicien et ne se partage
        // avec rien.
        { id: 'water_heater', label: 'Production d’eau chaude', required: true, footprint: { w: 0.70, d: 0.70 }, anchor: 'wall', usage: [{ face: 'front', min: 0.70, exclusive: true }], services: ['eau', 'electricite'] },
        { id: 'electrical_panel', label: 'Tableau électrique', required: true, footprint: { w: 0.60, d: 0.15 }, anchor: 'wall', usage: [{ face: 'front', min: 0.70, exclusive: true }], services: ['electricite'] }
      ]
    },

    garage: {
      label: 'Garage', mvp: false,
      equipments: [
        { id: 'parking_space', label: 'Emplacement véhicule', required: true, footprint: { w: 2.50, d: 5.00 }, anchor: 'free', usage: [{ face: 'long', min: 0.60, sides: 1 }] }
      ]
    }
  };

  // Critères de placement du socle §6. Portés ici pour que le contrôle et le
  // document ne puissent pas diverger silencieusement.
  var PLACEMENT_RULES = [
    { code: 'S1', level: 'HARD', label: 'Équipements requis posés sans chevauchement d’emprises' },
    { code: 'S2', level: 'HARD', label: 'Aucune zone d’usage ne recouvre une emprise' },
    { code: 'S3', level: 'HARD', label: 'Le débattement de porte épargne emprises et zones d’usage requises' },
    { code: 'S4', level: 'HARD', label: 'Chemin continu de la porte à chaque zone d’usage requise' },
    { code: 'S5', level: 'HARD', label: 'Ancrages mur et angle respectés' },
    { code: 'S6', level: 'GUIDELINE', label: 'Rectangle libre résiduel respecté' }
  ];

  function requiredEquipments(type, variant) {
    var room = ROOMS[type];
    if (!room) return [];
    return room.equipments.filter(function (equipment) {
      if (!equipment.required) return false;
      return !equipment.variant || equipment.variant === variant;
    });
  }

  function variantsOf(type) {
    var room = ROOMS[type];
    return room && room.variants ? room.variants.slice() : [null];
  }

  root.TechnoHabSocle = {
    rooms: ROOMS,
    placementRules: PLACEMENT_RULES,
    requiredEquipments: requiredEquipments,
    variantsOf: variantsOf,
    module: MODULE
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
