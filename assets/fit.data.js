(function (root) {
  'use strict';

  // Fichier généré par scripts/build-envelopes.mjs.
  // Ne pas éditer : modifier socle.data.js puis relancer npm run fit:build.
  //
  // Pour chaque type de pièce et chaque variante, la liste des plus petits
  // rectangles admissibles, en CENTIMÈTRES, triée par largeur croissante.
  // Un rectangle convient s'il domine l'un de ces couples, dans un sens ou
  // dans l'autre — une pièce n'a pas d'orientation imposée. M4b borne ce
  // cache aux rectangles : pour une pièce en L/U, seul `placement.validate`
  // sur `usablePolygon` peut porter le verdict.
  //
  // Chaque entrée porte aussi la déclaration de la pièce recopiée du socle :
  // `role`, `agrement`, `minProgramArea`, `minProgramSide`, `maxRatio` et
  // `trigger`. Voir les commentaires de socle.data.js, qui en fait foi.
  //
  // Deux planchers coexistent et ne disent pas la même chose :
  //   - `smallest`/`narrowest` — le plancher de MEUBLABILITÉ, calculé ici par
  //     le solveur. Il suit toute évolution des équipements.
  //   - `minProgramArea`/`minProgramSide` — le plancher de DIGNITÉ D'USAGE,
  //     convention N3 assumée. Un séjour se meuble dès 3,24 m² et reste
  //     absurde à cette taille.
  // Le générateur retient le plus exigeant des deux.

  var ENVELOPES = {
    living: {
      label: "Séjour", mvp: true, role: "principale", agrement: 1.4,
      minProgramArea: 20, minProgramSide: 3, targetProgramArea: 24, maxRatio: null,
      programFloors: null,
      trigger: {"kind":"always"},
      facingClearance: null,
      accessClearance: 0.7,
      maxFurnitureRatio: 0.5,
      variants: {
        base: [[140, 290], [180, 200], [200, 180], [290, 140]]
      },
      programs: {"base":{"equipments":[{"id":"sofa","label":"Canapé","required":true,"canonicalValues":{"footprint":"VAL-LIVING-SOFA-FOOTPRINT-001","usageMin":"VAL-LIVING-SOFA-CLEARANCE-MIN-001","usageTarget":"VAL-LIVING-SOFA-CLEARANCE-TARGET-001","usageComfort":"VAL-LIVING-SOFA-CLEARANCE-COMFORT-001"},"footprint":{"w":1.8,"d":0.9},"anchor":"wall","usage":[{"face":"front","min":0.5,"target":0.5,"comfort":0.6}],"sizes":[{"id":"sofa_3","label":"Canapé 3 places","from":24,"footprint":{"w":2.2,"d":0.9}},{"id":"sofa_angle","label":"Canapé d’angle","from":30,"footprint":{"w":2.2,"d":2.2},"anchor":"corner"}],"program":"living"},{"id":"coffee_table","label":"Table basse","required":true,"canonicalValues":{"footprint":"VAL-LIVING-COFFEE-TABLE-FOOTPRINT-001","usageMin":"VAL-LIVING-COFFEE-TABLE-CLEARANCE-MIN-001","usageTarget":"VAL-LIVING-COFFEE-TABLE-CLEARANCE-TARGET-001","usageComfort":"VAL-LIVING-COFFEE-TABLE-CLEARANCE-COMFORT-001"},"footprint":{"w":1.1,"d":0.6},"anchor":"free","usage":[{"face":"front","min":0.45,"target":0.5,"comfort":0.6,"accessRequired":false}],"program":"living"}],"relations":[{"code":"LIVING-TABLE-001","kind":"gap-range","subject":"coffee_table","target":"sofa","min":0.45,"max":0.65,"canonicalValues":{"min":"VAL-LIVING-TABLE-GAP-MIN-001","max":"VAL-LIVING-TABLE-GAP-MAX-001"},"level":"GUIDELINE","weight":1.8,"label":"La table basse reste à portée du canapé"}]}},
      catalogs: {"base":{"equipments":[{"id":"sofa","label":"Canapé","required":true,"canonicalValues":{"footprint":"VAL-LIVING-SOFA-FOOTPRINT-001","usageMin":"VAL-LIVING-SOFA-CLEARANCE-MIN-001","usageTarget":"VAL-LIVING-SOFA-CLEARANCE-TARGET-001","usageComfort":"VAL-LIVING-SOFA-CLEARANCE-COMFORT-001"},"footprint":{"w":1.8,"d":0.9},"anchor":"wall","usage":[{"face":"front","min":0.5,"target":0.5,"comfort":0.6}],"sizes":[{"id":"sofa_3","label":"Canapé 3 places","from":24,"footprint":{"w":2.2,"d":0.9}},{"id":"sofa_angle","label":"Canapé d’angle","from":30,"footprint":{"w":2.2,"d":2.2},"anchor":"corner"}],"program":"living"},{"id":"coffee_table","label":"Table basse","required":true,"canonicalValues":{"footprint":"VAL-LIVING-COFFEE-TABLE-FOOTPRINT-001","usageMin":"VAL-LIVING-COFFEE-TABLE-CLEARANCE-MIN-001","usageTarget":"VAL-LIVING-COFFEE-TABLE-CLEARANCE-TARGET-001","usageComfort":"VAL-LIVING-COFFEE-TABLE-CLEARANCE-COMFORT-001"},"footprint":{"w":1.1,"d":0.6},"anchor":"free","usage":[{"face":"front","min":0.45,"target":0.5,"comfort":0.6,"accessRequired":false}],"program":"living"},{"id":"tv_unit","label":"Meuble bas","required":false,"minRoomArea":22,"canonicalValues":{"activationArea":"VAL-LIVING-MEDIA-ACTIVATION-AREA-001","footprint":"VAL-LIVING-TV-FOOTPRINT-001","usageMin":"VAL-LIVING-TV-CLEARANCE-MIN-001"},"footprint":{"w":1.2,"d":0.4},"anchor":"wall","usage":[{"face":"front","min":0.6}],"program":"living"},{"id":"armchair","label":"Fauteuil","required":false,"minRoomArea":22,"canonicalValues":{"activationArea":"VAL-LIVING-ARMCHAIR-ACTIVATION-AREA-001","footprint":"VAL-LIVING-ARMCHAIR-FOOTPRINT-001"},"footprint":{"w":0.9,"d":0.85},"anchor":"free","usage":[],"program":"living"}],"relations":[{"code":"LIVING-FOCAL-001","kind":"faces","subject":"sofa","target":"tv_unit","optional":true,"level":"GUIDELINE","weight":1.8,"label":"Le canapé fait face au meuble média"},{"code":"LIVING-TABLE-001","kind":"gap-range","subject":"coffee_table","target":"sofa","min":0.45,"max":0.65,"canonicalValues":{"min":"VAL-LIVING-TABLE-GAP-MIN-001","max":"VAL-LIVING-TABLE-GAP-MAX-001"},"level":"GUIDELINE","weight":1.8,"label":"La table basse reste à portée du canapé"},{"code":"LIVING-CONVERSATION-001","kind":"distance-range","subject":"armchair","target":"sofa","min":1,"targetDistance":1.8,"max":3,"optional":true,"canonicalValues":{"min":"VAL-LIVING-CONVERSATION-MIN-001","target":"VAL-LIVING-CONVERSATION-TARGET-001","max":"VAL-LIVING-CONVERSATION-MAX-001"},"level":"GUIDELINE","weight":1.5,"label":"Les assises restent à distance de conversation"}]}}
    },
    dining: {
      label: "Salle à manger", mvp: false, role: "principale", agrement: 0.6,
      minProgramArea: null, minProgramSide: null, targetProgramArea: null, maxRatio: null,
      programFloors: null,
      trigger: null,
      facingClearance: null,
      accessClearance: null,
      maxFurnitureRatio: null,
      variants: {
        base: [[240, 300], [300, 240]]
      },
      programs: {"base":{"equipments":[{"id":"dining_table_4","label":"Table 4 places","required":true,"footprint":{"w":1.4,"d":0.8},"anchor":"free","usage":[{"face":"around","min":0.8}],"program":"dining"}],"relations":[]}},
      catalogs: {"base":{"equipments":[{"id":"dining_table_4","label":"Table 4 places","required":true,"footprint":{"w":1.4,"d":0.8},"anchor":"free","usage":[{"face":"around","min":0.8}],"program":"dining"}],"relations":[]}}
    },
    bedroom: {
      label: "Chambre", mvp: true, role: "principale", agrement: 0.6,
      minProgramArea: 9, minProgramSide: 2.5, targetProgramArea: null, maxRatio: null,
      programFloors: {"enfant":{"area":9,"side":2.5},"parentale":{"area":11,"side":2.7}},
      trigger: {"kind":"count","from":"bedrooms"},
      facingClearance: null,
      accessClearance: null,
      maxFurnitureRatio: null,
      variants: {
        enfant: [[150, 310], [210, 250], [250, 210], [310, 150]],
        parentale: [[250, 320], [260, 310], [310, 260], [320, 250]]
      },
      programs: {"enfant":{"equipments":[{"id":"bed_90","label":"Lit simple 90","val":"VAL-EQ-001","canonicalValues":{"footprint":"VAL-EQ-001","sideMin":"VAL-BED-SIDE-MIN-001","sideTarget":"VAL-BED-SIDE-TARGET-CHILD-001","sideComfort":"VAL-BED-SIDE-COMFORT-CHILD-001","footMin":"VAL-BED-FOOT-MIN-001","footTarget":"VAL-BED-FOOT-TARGET-001","footComfort":"VAL-BED-FOOT-COMFORT-001"},"required":true,"variant":"enfant","footprint":{"w":0.9,"d":1.9},"anchor":"wall","usage":[{"face":"long","min":0.6,"target":0.6,"comfort":0.7,"sides":1},{"face":"foot","min":0.6,"target":0.7,"comfort":0.9}],"program":"bedroom"},{"id":"wardrobe","label":"Penderie coulissante","opening":"sliding","canonicalValues":{"footprint":"VAL-BED-WARDROBE-FOOTPRINT-001","usageMin":"VAL-BED-WARDROBE-CLEARANCE-MIN-001","usageTarget":"VAL-BED-WARDROBE-CLEARANCE-TARGET-001","usageComfort":"VAL-BED-WARDROBE-CLEARANCE-COMFORT-001"},"required":true,"assumed":true,"footprint":{"w":1.2,"d":0.6},"anchor":"wall","usage":[{"face":"front","min":0.7,"target":0.7,"comfort":0.9}],"program":"bedroom"}],"relations":[{"code":"BED-STORAGE-001","kind":"different-wall","subject":"wardrobe","level":"GUIDELINE","weight":1.4,"label":"Le rangement libère le mur de tête du lit","target":"bed_90"}]},"parentale":{"equipments":[{"id":"bed_140","label":"Lit double 140","val":"VAL-EQ-002","canonicalValues":{"footprint":"VAL-EQ-002","sideMin":"VAL-BED-SIDE-MIN-001","sideTarget":"VAL-BED-SIDE-TARGET-PARENT-001","sideComfort":"VAL-BED-SIDE-COMFORT-PARENT-001","footMin":"VAL-BED-FOOT-MIN-001","footTarget":"VAL-BED-FOOT-TARGET-001","footComfort":"VAL-BED-FOOT-COMFORT-001"},"required":true,"variant":"parentale","footprint":{"w":1.4,"d":1.9},"anchor":"wall","usage":[{"face":"long","min":0.6,"target":0.7,"comfort":0.9,"sides":2},{"face":"foot","min":0.6,"target":0.7,"comfort":0.9}],"sizes":[{"id":"bed_160","label":"Lit queen 160","val":"VAL-EQ-003","from":12,"footprint":{"w":1.6,"d":2}},{"id":"bed_180","label":"Lit king 180","val":"VAL-EQ-004","from":16,"footprint":{"w":1.8,"d":2}}],"program":"bedroom"},{"id":"wardrobe","label":"Penderie coulissante","opening":"sliding","canonicalValues":{"footprint":"VAL-BED-WARDROBE-FOOTPRINT-001","usageMin":"VAL-BED-WARDROBE-CLEARANCE-MIN-001","usageTarget":"VAL-BED-WARDROBE-CLEARANCE-TARGET-001","usageComfort":"VAL-BED-WARDROBE-CLEARANCE-COMFORT-001"},"required":true,"assumed":true,"footprint":{"w":1.2,"d":0.6},"anchor":"wall","usage":[{"face":"front","min":0.7,"target":0.7,"comfort":0.9}],"program":"bedroom"}],"relations":[{"code":"BED-STORAGE-001","kind":"different-wall","subject":"wardrobe","level":"GUIDELINE","weight":1.4,"label":"Le rangement libère le mur de tête du lit","target":"bed_140"}]}},
      catalogs: {"enfant":{"equipments":[{"id":"bed_90","label":"Lit simple 90","val":"VAL-EQ-001","canonicalValues":{"footprint":"VAL-EQ-001","sideMin":"VAL-BED-SIDE-MIN-001","sideTarget":"VAL-BED-SIDE-TARGET-CHILD-001","sideComfort":"VAL-BED-SIDE-COMFORT-CHILD-001","footMin":"VAL-BED-FOOT-MIN-001","footTarget":"VAL-BED-FOOT-TARGET-001","footComfort":"VAL-BED-FOOT-COMFORT-001"},"required":true,"variant":"enfant","footprint":{"w":0.9,"d":1.9},"anchor":"wall","usage":[{"face":"long","min":0.6,"target":0.6,"comfort":0.7,"sides":1},{"face":"foot","min":0.6,"target":0.7,"comfort":0.9}],"program":"bedroom"},{"id":"wardrobe","label":"Penderie coulissante","opening":"sliding","canonicalValues":{"footprint":"VAL-BED-WARDROBE-FOOTPRINT-001","usageMin":"VAL-BED-WARDROBE-CLEARANCE-MIN-001","usageTarget":"VAL-BED-WARDROBE-CLEARANCE-TARGET-001","usageComfort":"VAL-BED-WARDROBE-CLEARANCE-COMFORT-001"},"required":true,"assumed":true,"footprint":{"w":1.2,"d":0.6},"anchor":"wall","usage":[{"face":"front","min":0.7,"target":0.7,"comfort":0.9}],"program":"bedroom"},{"id":"desk","label":"Bureau","required":false,"variant":"enfant","minRoomArea":11,"footprint":{"w":1.2,"d":0.6},"anchor":"wall","usage":[],"program":"bedroom"},{"id":"office_chair","label":"Chaise de bureau","required":false,"variant":"enfant","minRoomArea":11,"footprint":{"w":0.5,"d":0.5},"anchor":"free","usage":[{"face":"back","min":0.6,"target":0.8,"comfort":0.9}],"program":"bedroom"}],"relations":[{"code":"BED-STORAGE-001","kind":"different-wall","subject":"wardrobe","level":"GUIDELINE","weight":1.4,"label":"Le rangement libère le mur de tête du lit","target":"bed_90"},{"code":"BED-OFFICE-STATION-001","kind":"workstation","subject":"office_chair","target":"desk","min":0,"max":0.2,"maxOffset":0.15,"optional":true,"level":"HARD","weight":2,"label":"La chaise forme un poste avec le plateau"}]},"parentale":{"equipments":[{"id":"bed_140","label":"Lit double 140","val":"VAL-EQ-002","canonicalValues":{"footprint":"VAL-EQ-002","sideMin":"VAL-BED-SIDE-MIN-001","sideTarget":"VAL-BED-SIDE-TARGET-PARENT-001","sideComfort":"VAL-BED-SIDE-COMFORT-PARENT-001","footMin":"VAL-BED-FOOT-MIN-001","footTarget":"VAL-BED-FOOT-TARGET-001","footComfort":"VAL-BED-FOOT-COMFORT-001"},"required":true,"variant":"parentale","footprint":{"w":1.4,"d":1.9},"anchor":"wall","usage":[{"face":"long","min":0.6,"target":0.7,"comfort":0.9,"sides":2},{"face":"foot","min":0.6,"target":0.7,"comfort":0.9}],"sizes":[{"id":"bed_160","label":"Lit queen 160","val":"VAL-EQ-003","from":12,"footprint":{"w":1.6,"d":2}},{"id":"bed_180","label":"Lit king 180","val":"VAL-EQ-004","from":16,"footprint":{"w":1.8,"d":2}}],"program":"bedroom"},{"id":"wardrobe","label":"Penderie coulissante","opening":"sliding","canonicalValues":{"footprint":"VAL-BED-WARDROBE-FOOTPRINT-001","usageMin":"VAL-BED-WARDROBE-CLEARANCE-MIN-001","usageTarget":"VAL-BED-WARDROBE-CLEARANCE-TARGET-001","usageComfort":"VAL-BED-WARDROBE-CLEARANCE-COMFORT-001"},"required":true,"assumed":true,"footprint":{"w":1.2,"d":0.6},"anchor":"wall","usage":[{"face":"front","min":0.7,"target":0.7,"comfort":0.9}],"program":"bedroom"}],"relations":[{"code":"BED-STORAGE-001","kind":"different-wall","subject":"wardrobe","level":"GUIDELINE","weight":1.4,"label":"Le rangement libère le mur de tête du lit","target":"bed_140"}]}}
    },
    kitchen: {
      label: "Cuisine", mvp: true, role: "principale", agrement: 0.6,
      minProgramArea: 7, minProgramSide: 1.85, targetProgramArea: null, maxRatio: null,
      programFloors: null,
      trigger: {"kind":"always","standaloneIf":"separateKitchen","otherwiseInto":"living"},
      facingClearance: 1.2,
      accessClearance: null,
      maxFurnitureRatio: null,
      variants: {
        base: [[120, 210], [180, 180], [210, 120]]
      },
      programs: {"base":{"equipments":[{"id":"sink","label":"Évier","val":"VAL-EQ-010","required":true,"canonicalValues":{"footprint":"VAL-KITCHEN-SINK-FOOTPRINT-001","usageMin":"VAL-KITCHEN-APPLIANCE-CLEARANCE-MIN-001"},"footprint":{"w":0.6,"d":0.6},"anchor":"wall","usage":[{"face":"front","min":0.9}],"services":["eau","evacuation"],"program":"kitchen"},{"id":"hob","label":"Plaque de cuisson","val":"VAL-EQ-010","required":true,"canonicalValues":{"footprint":"VAL-KITCHEN-HOB-FOOTPRINT-001","usageMin":"VAL-KITCHEN-APPLIANCE-CLEARANCE-MIN-001"},"footprint":{"w":0.6,"d":0.6},"anchor":"wall","usage":[{"face":"front","min":0.9}],"services":["electricite"],"program":"kitchen"},{"id":"worktop","label":"Plan de travail","val":"VAL-EQ-012","required":true,"canonicalValues":{"footprint":"VAL-KITCHEN-WORKTOP-FOOTPRINT-MIN-001","usageMin":"VAL-KITCHEN-APPLIANCE-CLEARANCE-MIN-001"},"footprint":{"w":0.6,"d":0.6},"anchor":"wall","usage":[{"face":"front","min":0.9}],"between":["sink","hob"],"program":"kitchen"},{"id":"fridge","label":"Réfrigérateur","val":"VAL-EQ-016","required":true,"canonicalValues":{"footprint":"VAL-KITCHEN-FRIDGE-FOOTPRINT-001","usageMin":"VAL-KITCHEN-APPLIANCE-CLEARANCE-MIN-001"},"footprint":{"w":0.6,"d":0.6},"anchor":"wall","usage":[{"face":"front","min":0.9}],"program":"kitchen"}],"relations":[{"code":"KITCHEN-SEQUENCE-001","kind":"between","subject":"worktop","targets":["sink","hob"],"level":"HARD","weight":4,"label":"Le plan de travail sépare l’évier de la plaque"},{"code":"KITCHEN-ALIGN-001","kind":"same-wall","subject":"sink","target":"worktop","level":"GUIDELINE","weight":1.5,"label":"L’évier et la préparation forment un linéaire"},{"code":"KITCHEN-ALIGN-002","kind":"same-wall","subject":"hob","target":"worktop","level":"GUIDELINE","weight":1.5,"label":"La plaque et la préparation forment un linéaire"},{"code":"KITCHEN-COLD-001","kind":"near","subject":"fridge","target":"worktop","max":2.4,"level":"GUIDELINE","weight":1,"label":"Le froid reste proche de la zone de préparation"},{"code":"KITCHEN-TRIANGLE-001","kind":"perimeter-max","subject":"sink","targets":["hob","fridge"],"max":6.5,"canonicalValues":{"max":"VAL-KITCHEN-TRIANGLE-PERIMETER-MAX-001"},"level":"GUIDELINE","weight":1.4,"label":"Le triangle d’activité reste compact"}]}},
      catalogs: {"base":{"equipments":[{"id":"sink","label":"Évier","val":"VAL-EQ-010","required":true,"canonicalValues":{"footprint":"VAL-KITCHEN-SINK-FOOTPRINT-001","usageMin":"VAL-KITCHEN-APPLIANCE-CLEARANCE-MIN-001"},"footprint":{"w":0.6,"d":0.6},"anchor":"wall","usage":[{"face":"front","min":0.9}],"services":["eau","evacuation"],"program":"kitchen"},{"id":"hob","label":"Plaque de cuisson","val":"VAL-EQ-010","required":true,"canonicalValues":{"footprint":"VAL-KITCHEN-HOB-FOOTPRINT-001","usageMin":"VAL-KITCHEN-APPLIANCE-CLEARANCE-MIN-001"},"footprint":{"w":0.6,"d":0.6},"anchor":"wall","usage":[{"face":"front","min":0.9}],"services":["electricite"],"program":"kitchen"},{"id":"worktop","label":"Plan de travail","val":"VAL-EQ-012","required":true,"canonicalValues":{"footprint":"VAL-KITCHEN-WORKTOP-FOOTPRINT-MIN-001","usageMin":"VAL-KITCHEN-APPLIANCE-CLEARANCE-MIN-001"},"footprint":{"w":0.6,"d":0.6},"anchor":"wall","usage":[{"face":"front","min":0.9}],"between":["sink","hob"],"program":"kitchen"},{"id":"fridge","label":"Réfrigérateur","val":"VAL-EQ-016","required":true,"canonicalValues":{"footprint":"VAL-KITCHEN-FRIDGE-FOOTPRINT-001","usageMin":"VAL-KITCHEN-APPLIANCE-CLEARANCE-MIN-001"},"footprint":{"w":0.6,"d":0.6},"anchor":"wall","usage":[{"face":"front","min":0.9}],"program":"kitchen"},{"id":"dishwasher","label":"Lave-vaisselle","val":"VAL-EQ-015","required":false,"minRoomArea":9,"canonicalValues":{"activationArea":"VAL-KITCHEN-DISHWASHER-ACTIVATION-AREA-001","footprint":"VAL-KITCHEN-DISHWASHER-FOOTPRINT-001","usageMin":"VAL-KITCHEN-DISHWASHER-SWING-CLEARANCE-MIN-001"},"footprint":{"w":0.6,"d":0.6},"anchor":"wall","usage":[{"face":"front","min":1.2}],"services":["eau","evacuation"],"program":"kitchen"}],"relations":[{"code":"KITCHEN-SEQUENCE-001","kind":"between","subject":"worktop","targets":["sink","hob"],"level":"HARD","weight":4,"label":"Le plan de travail sépare l’évier de la plaque"},{"code":"KITCHEN-ALIGN-001","kind":"same-wall","subject":"sink","target":"worktop","level":"GUIDELINE","weight":1.5,"label":"L’évier et la préparation forment un linéaire"},{"code":"KITCHEN-ALIGN-002","kind":"same-wall","subject":"hob","target":"worktop","level":"GUIDELINE","weight":1.5,"label":"La plaque et la préparation forment un linéaire"},{"code":"KITCHEN-COLD-001","kind":"near","subject":"fridge","target":"worktop","max":2.4,"level":"GUIDELINE","weight":1,"label":"Le froid reste proche de la zone de préparation"},{"code":"KITCHEN-TRIANGLE-001","kind":"perimeter-max","subject":"sink","targets":["hob","fridge"],"max":6.5,"canonicalValues":{"max":"VAL-KITCHEN-TRIANGLE-PERIMETER-MAX-001"},"level":"GUIDELINE","weight":1.4,"label":"Le triangle d’activité reste compact"}]}}
    },
    bath: {
      label: "Salle d’eau", mvp: true, role: "service", agrement: 0.6,
      minProgramArea: 3, minProgramSide: 1.7, targetProgramArea: null, maxRatio: null,
      programFloors: null,
      trigger: {"kind":"count","from":"bathrooms"},
      facingClearance: null,
      accessClearance: null,
      maxFurnitureRatio: null,
      variants: {
        eau: [[90, 210], [140, 150], [150, 140], [210, 90]],
        bain: [[140, 220], [170, 190], [190, 170], [220, 140]]
      },
      programs: {"eau":{"equipments":[{"id":"shower","label":"Douche","val":"VAL-EQ-031","canonicalValues":{"footprint":"VAL-EQ-031","usageMin":"VAL-BATH-SHOWER-CLEARANCE-MIN-001","usageTarget":"VAL-BATH-SHOWER-CLEARANCE-TARGET-001","usageComfort":"VAL-BATH-SHOWER-CLEARANCE-COMFORT-001"},"required":true,"variant":"eau","footprint":{"w":0.9,"d":0.9},"anchor":"corner","usage":[{"face":"front","min":0.6,"target":0.7,"comfort":0.8}],"services":["eau","evacuation"],"program":"bath"},{"id":"washbasin","label":"Lavabo","canonicalValues":{"footprint":"VAL-BATH-WASHBASIN-FOOTPRINT-001","usageMin":"VAL-BATH-WASHBASIN-CLEARANCE-MIN-001","usageTarget":"VAL-BATH-WASHBASIN-CLEARANCE-TARGET-001","usageComfort":"VAL-EQ-033"},"required":true,"footprint":{"w":0.6,"d":0.5},"anchor":"wall","usage":[{"face":"front","min":0.7,"target":0.8,"comfort":1.1}],"services":["eau","evacuation"],"program":"bath"}],"relations":[{"code":"BATH-USE-001","kind":"different-wall","subject":"washbasin","level":"GUIDELINE","weight":1,"label":"Le lavabo préserve la façade de l’équipement humide principal","target":"shower"}]},"bain":{"equipments":[{"id":"bathtub","label":"Baignoire","val":"VAL-EQ-030","canonicalValues":{"footprint":"VAL-EQ-030","usageMin":"VAL-BATH-TUB-CLEARANCE-MIN-001","usageTarget":"VAL-BATH-TUB-CLEARANCE-TARGET-001","usageComfort":"VAL-BATH-TUB-CLEARANCE-COMFORT-001"},"required":true,"variant":"bain","footprint":{"w":1.7,"d":0.7},"anchor":"wall","usage":[{"face":"front","min":0.7,"target":0.8,"comfort":1}],"services":["eau","evacuation"],"program":"bath"},{"id":"washbasin","label":"Lavabo","canonicalValues":{"footprint":"VAL-BATH-WASHBASIN-FOOTPRINT-001","usageMin":"VAL-BATH-WASHBASIN-CLEARANCE-MIN-001","usageTarget":"VAL-BATH-WASHBASIN-CLEARANCE-TARGET-001","usageComfort":"VAL-EQ-033"},"required":true,"footprint":{"w":0.6,"d":0.5},"anchor":"wall","usage":[{"face":"front","min":0.7,"target":0.8,"comfort":1.1}],"services":["eau","evacuation"],"program":"bath"}],"relations":[{"code":"BATH-USE-001","kind":"different-wall","subject":"washbasin","level":"GUIDELINE","weight":1,"label":"Le lavabo préserve la façade de l’équipement humide principal","target":"bathtub"}]}},
      catalogs: {"eau":{"equipments":[{"id":"shower","label":"Douche","val":"VAL-EQ-031","canonicalValues":{"footprint":"VAL-EQ-031","usageMin":"VAL-BATH-SHOWER-CLEARANCE-MIN-001","usageTarget":"VAL-BATH-SHOWER-CLEARANCE-TARGET-001","usageComfort":"VAL-BATH-SHOWER-CLEARANCE-COMFORT-001"},"required":true,"variant":"eau","footprint":{"w":0.9,"d":0.9},"anchor":"corner","usage":[{"face":"front","min":0.6,"target":0.7,"comfort":0.8}],"services":["eau","evacuation"],"program":"bath"},{"id":"washbasin","label":"Lavabo","canonicalValues":{"footprint":"VAL-BATH-WASHBASIN-FOOTPRINT-001","usageMin":"VAL-BATH-WASHBASIN-CLEARANCE-MIN-001","usageTarget":"VAL-BATH-WASHBASIN-CLEARANCE-TARGET-001","usageComfort":"VAL-EQ-033"},"required":true,"footprint":{"w":0.6,"d":0.5},"anchor":"wall","usage":[{"face":"front","min":0.7,"target":0.8,"comfort":1.1}],"services":["eau","evacuation"],"program":"bath"},{"id":"towel_rail","label":"Sèche-serviettes","canonicalValues":{"footprint":"VAL-BATH-TOWEL-RAIL-FOOTPRINT-001"},"required":false,"minRoomArea":4,"footprint":{"w":0.6,"d":0.15},"anchor":"wall","usage":[],"program":"bath"}],"relations":[{"code":"BATH-USE-001","kind":"different-wall","subject":"washbasin","level":"GUIDELINE","weight":1,"label":"Le lavabo préserve la façade de l’équipement humide principal","target":"shower"}]},"bain":{"equipments":[{"id":"bathtub","label":"Baignoire","val":"VAL-EQ-030","canonicalValues":{"footprint":"VAL-EQ-030","usageMin":"VAL-BATH-TUB-CLEARANCE-MIN-001","usageTarget":"VAL-BATH-TUB-CLEARANCE-TARGET-001","usageComfort":"VAL-BATH-TUB-CLEARANCE-COMFORT-001"},"required":true,"variant":"bain","footprint":{"w":1.7,"d":0.7},"anchor":"wall","usage":[{"face":"front","min":0.7,"target":0.8,"comfort":1}],"services":["eau","evacuation"],"program":"bath"},{"id":"washbasin","label":"Lavabo","canonicalValues":{"footprint":"VAL-BATH-WASHBASIN-FOOTPRINT-001","usageMin":"VAL-BATH-WASHBASIN-CLEARANCE-MIN-001","usageTarget":"VAL-BATH-WASHBASIN-CLEARANCE-TARGET-001","usageComfort":"VAL-EQ-033"},"required":true,"footprint":{"w":0.6,"d":0.5},"anchor":"wall","usage":[{"face":"front","min":0.7,"target":0.8,"comfort":1.1}],"services":["eau","evacuation"],"program":"bath"},{"id":"towel_rail","label":"Sèche-serviettes","canonicalValues":{"footprint":"VAL-BATH-TOWEL-RAIL-FOOTPRINT-001"},"required":false,"minRoomArea":4,"footprint":{"w":0.6,"d":0.15},"anchor":"wall","usage":[],"program":"bath"}],"relations":[{"code":"BATH-USE-001","kind":"different-wall","subject":"washbasin","level":"GUIDELINE","weight":1,"label":"Le lavabo préserve la façade de l’équipement humide principal","target":"bathtub"}]}}
    },
    wc: {
      label: "WC", mvp: true, role: "service", agrement: 0,
      minProgramArea: 1.5, minProgramSide: 0.9, targetProgramArea: null, maxRatio: 3.5,
      programFloors: null,
      trigger: {"kind":"always","standaloneIf":"includeWc","otherwiseInto":"bath_1"},
      facingClearance: null,
      accessClearance: null,
      maxFurnitureRatio: null,
      variants: {
        base: [[80, 130], [130, 80]]
      },
      programs: {"base":{"equipments":[{"id":"wc_pan","label":"Cuvette","canonicalValues":{"footprint":"VAL-WC-PAN-FOOTPRINT-001","usageMin":"VAL-WC-PAN-CLEARANCE-FRONT-001","usageTarget":"VAL-WC-PAN-CLEARANCE-FRONT-TARGET-001","usageComfort":"VAL-WC-PAN-CLEARANCE-FRONT-COMFORT-001","usageWidth":"VAL-WC-PAN-CLEARANCE-WIDTH-001","sideMin":"VAL-WC-PAN-CLEARANCE-SIDE-MIN-001","sideTarget":"VAL-WC-PAN-CLEARANCE-SIDE-TARGET-001"},"required":true,"footprint":{"w":0.4,"d":0.7},"anchor":"wall","usage":[{"face":"front","min":0.6,"target":0.7,"comfort":0.8,"width":0.6},{"face":"long","min":0.2,"target":0.25,"sides":2}],"services":["eau","evacuation"],"program":"wc"}],"relations":[]}},
      catalogs: {"base":{"equipments":[{"id":"wc_pan","label":"Cuvette","canonicalValues":{"footprint":"VAL-WC-PAN-FOOTPRINT-001","usageMin":"VAL-WC-PAN-CLEARANCE-FRONT-001","usageTarget":"VAL-WC-PAN-CLEARANCE-FRONT-TARGET-001","usageComfort":"VAL-WC-PAN-CLEARANCE-FRONT-COMFORT-001","usageWidth":"VAL-WC-PAN-CLEARANCE-WIDTH-001","sideMin":"VAL-WC-PAN-CLEARANCE-SIDE-MIN-001","sideTarget":"VAL-WC-PAN-CLEARANCE-SIDE-TARGET-001"},"required":true,"footprint":{"w":0.4,"d":0.7},"anchor":"wall","usage":[{"face":"front","min":0.6,"target":0.7,"comfort":0.8,"width":0.6},{"face":"long","min":0.2,"target":0.25,"sides":2}],"services":["eau","evacuation"],"program":"wc"},{"id":"handbasin","label":"Lave-mains","canonicalValues":{"activationArea":"VAL-WC-HANDBASIN-ACTIVATION-AREA-001","footprint":"VAL-WC-HANDBASIN-FOOTPRINT-001","usageMin":"VAL-WC-HANDBASIN-CLEARANCE-FRONT-001","usageTarget":"VAL-WC-HANDBASIN-CLEARANCE-FRONT-TARGET-001","usageComfort":"VAL-WC-HANDBASIN-CLEARANCE-FRONT-COMFORT-001"},"required":false,"minRoomArea":1.3,"footprint":{"w":0.4,"d":0.3},"anchor":"corner","usage":[{"face":"front","min":0.5,"target":0.6,"comfort":0.7}],"services":["eau","evacuation"],"program":"wc"}],"relations":[]}}
    },
    circulation: {
      label: "Circulation", mvp: true, role: "distribution", agrement: 0.6,
      minProgramArea: 3, minProgramSide: 0.9, targetProgramArea: null, maxRatio: 1.6,
      programFloors: null,
      trigger: {"kind":"derived","from":"desserte","minRooms":4},
      facingClearance: null,
      accessClearance: null,
      maxFurnitureRatio: null,
      variants: {
        base: [[70, 70]]
      },
      programs: {"base":{"equipments":[],"relations":[]}},
      catalogs: {"base":{"equipments":[],"relations":[]}}
    },
    entree: {
      label: "Entrée", mvp: false, role: "distribution", agrement: 0.6,
      minProgramArea: null, minProgramSide: null, targetProgramArea: null, maxRatio: null,
      programFloors: null,
      trigger: null,
      facingClearance: null,
      accessClearance: null,
      maxFurnitureRatio: null,
      variants: {
        base: [[70, 70]]
      },
      programs: {"base":{"equipments":[],"relations":[]}},
      catalogs: {"base":{"equipments":[{"id":"closet","label":"Placard","required":false,"assumed":true,"minRoomArea":3,"footprint":{"w":1.2,"d":0.6},"anchor":"wall","usage":[{"face":"front","min":0.6}],"program":"entree"}],"relations":[]}}
    },
    bureau: {
      label: "Bureau", mvp: false, role: "principale", agrement: 0.6,
      minProgramArea: 5, minProgramSide: 1.8, targetProgramArea: null, maxRatio: null,
      programFloors: {"compact":{"area":5,"side":1.8},"convertible":{"area":9,"side":2.5}},
      trigger: {"kind":"count","from":"offices","variantFrom":"officeVariant"},
      facingClearance: null,
      accessClearance: null,
      maxFurnitureRatio: null,
      variants: {
        compact: [[70, 230], [110, 120], [120, 110], [230, 70]],
        convertible: [[70, 230], [110, 120], [120, 110], [230, 70]]
      },
      programs: {"compact":{"equipments":[{"id":"desk","label":"Plan de travail","required":true,"canonicalValues":{"footprint":"VAL-OFFICE-DESK-FOOTPRINT-001"},"footprint":{"w":1.2,"d":0.6},"anchor":"wall","usage":[],"sizes":[{"id":"desk_140","label":"Bureau standard 140","from":7,"footprint":{"w":1.4,"d":0.7}},{"id":"desk_180","label":"Grand bureau 180","from":10,"footprint":{"w":1.8,"d":0.8}}],"program":"bureau"},{"id":"office_chair","label":"Chaise de bureau","required":true,"canonicalValues":{"footprint":"VAL-OFFICE-CHAIR-FOOTPRINT-001","usageMin":"VAL-OFFICE-CHAIR-CLEARANCE-BACK-MIN-001","usageTarget":"VAL-OFFICE-CHAIR-CLEARANCE-BACK-TARGET-001","usageComfort":"VAL-OFFICE-CHAIR-CLEARANCE-BACK-COMFORT-001"},"footprint":{"w":0.5,"d":0.5},"anchor":"free","usage":[{"face":"back","min":0.6,"target":0.8,"comfort":0.9}],"program":"bureau"}],"relations":[{"code":"OFFICE-STATION-001","kind":"workstation","subject":"office_chair","target":"desk","min":0,"max":0.2,"maxOffset":0.15,"level":"HARD","weight":2,"label":"La chaise forme un poste avec le plateau"}]},"convertible":{"equipments":[{"id":"desk","label":"Plan de travail","required":true,"canonicalValues":{"footprint":"VAL-OFFICE-DESK-FOOTPRINT-001"},"footprint":{"w":1.2,"d":0.6},"anchor":"wall","usage":[],"sizes":[{"id":"desk_140","label":"Bureau standard 140","from":7,"footprint":{"w":1.4,"d":0.7}},{"id":"desk_180","label":"Grand bureau 180","from":10,"footprint":{"w":1.8,"d":0.8}}],"program":"bureau"},{"id":"office_chair","label":"Chaise de bureau","required":true,"canonicalValues":{"footprint":"VAL-OFFICE-CHAIR-FOOTPRINT-001","usageMin":"VAL-OFFICE-CHAIR-CLEARANCE-BACK-MIN-001","usageTarget":"VAL-OFFICE-CHAIR-CLEARANCE-BACK-TARGET-001","usageComfort":"VAL-OFFICE-CHAIR-CLEARANCE-BACK-COMFORT-001"},"footprint":{"w":0.5,"d":0.5},"anchor":"free","usage":[{"face":"back","min":0.6,"target":0.8,"comfort":0.9}],"program":"bureau"}],"relations":[{"code":"OFFICE-STATION-001","kind":"workstation","subject":"office_chair","target":"desk","min":0,"max":0.2,"maxOffset":0.15,"level":"HARD","weight":2,"label":"La chaise forme un poste avec le plateau"}]}},
      catalogs: {"compact":{"equipments":[{"id":"desk","label":"Plan de travail","required":true,"canonicalValues":{"footprint":"VAL-OFFICE-DESK-FOOTPRINT-001"},"footprint":{"w":1.2,"d":0.6},"anchor":"wall","usage":[],"sizes":[{"id":"desk_140","label":"Bureau standard 140","from":7,"footprint":{"w":1.4,"d":0.7}},{"id":"desk_180","label":"Grand bureau 180","from":10,"footprint":{"w":1.8,"d":0.8}}],"program":"bureau"},{"id":"office_chair","label":"Chaise de bureau","required":true,"canonicalValues":{"footprint":"VAL-OFFICE-CHAIR-FOOTPRINT-001","usageMin":"VAL-OFFICE-CHAIR-CLEARANCE-BACK-MIN-001","usageTarget":"VAL-OFFICE-CHAIR-CLEARANCE-BACK-TARGET-001","usageComfort":"VAL-OFFICE-CHAIR-CLEARANCE-BACK-COMFORT-001"},"footprint":{"w":0.5,"d":0.5},"anchor":"free","usage":[{"face":"back","min":0.6,"target":0.8,"comfort":0.9}],"program":"bureau"},{"id":"bookcase","label":"Bibliothèque","required":false,"assumed":true,"minRoomArea":7,"canonicalValues":{"activationArea":"VAL-OFFICE-BOOKCASE-ACTIVATION-AREA-001","footprint":"VAL-OFFICE-BOOKCASE-FOOTPRINT-001","usageMin":"VAL-OFFICE-BOOKCASE-PASSAGE-MIN-001"},"footprint":{"w":1.2,"d":0.35},"anchor":"wall","usage":[{"face":"front","min":0.6}],"program":"bureau"}],"relations":[{"code":"OFFICE-STATION-001","kind":"workstation","subject":"office_chair","target":"desk","min":0,"max":0.2,"maxOffset":0.15,"level":"HARD","weight":2,"label":"La chaise forme un poste avec le plateau"}]},"convertible":{"equipments":[{"id":"desk","label":"Plan de travail","required":true,"canonicalValues":{"footprint":"VAL-OFFICE-DESK-FOOTPRINT-001"},"footprint":{"w":1.2,"d":0.6},"anchor":"wall","usage":[],"sizes":[{"id":"desk_140","label":"Bureau standard 140","from":7,"footprint":{"w":1.4,"d":0.7}},{"id":"desk_180","label":"Grand bureau 180","from":10,"footprint":{"w":1.8,"d":0.8}}],"program":"bureau"},{"id":"office_chair","label":"Chaise de bureau","required":true,"canonicalValues":{"footprint":"VAL-OFFICE-CHAIR-FOOTPRINT-001","usageMin":"VAL-OFFICE-CHAIR-CLEARANCE-BACK-MIN-001","usageTarget":"VAL-OFFICE-CHAIR-CLEARANCE-BACK-TARGET-001","usageComfort":"VAL-OFFICE-CHAIR-CLEARANCE-BACK-COMFORT-001"},"footprint":{"w":0.5,"d":0.5},"anchor":"free","usage":[{"face":"back","min":0.6,"target":0.8,"comfort":0.9}],"program":"bureau"},{"id":"bookcase","label":"Bibliothèque","required":false,"assumed":true,"minRoomArea":7,"canonicalValues":{"activationArea":"VAL-OFFICE-BOOKCASE-ACTIVATION-AREA-001","footprint":"VAL-OFFICE-BOOKCASE-FOOTPRINT-001","usageMin":"VAL-OFFICE-BOOKCASE-PASSAGE-MIN-001"},"footprint":{"w":1.2,"d":0.35},"anchor":"wall","usage":[{"face":"front","min":0.6}],"program":"bureau"}],"relations":[{"code":"OFFICE-STATION-001","kind":"workstation","subject":"office_chair","target":"desk","min":0,"max":0.2,"maxOffset":0.15,"level":"HARD","weight":2,"label":"La chaise forme un poste avec le plateau"}]}}
    },
    buanderie: {
      label: "Buanderie", mvp: false, role: "service", agrement: 0.6,
      minProgramArea: null, minProgramSide: null, targetProgramArea: null, maxRatio: null,
      programFloors: null,
      trigger: null,
      facingClearance: null,
      accessClearance: null,
      maxFurnitureRatio: null,
      variants: {
        base: [[70, 150], [150, 70]]
      },
      programs: {"base":{"equipments":[{"id":"washer","label":"Lave-linge","required":true,"footprint":{"w":0.6,"d":0.6},"anchor":"wall","usage":[{"face":"front","min":0.9}],"services":["eau","evacuation"],"program":"buanderie"}],"relations":[]}},
      catalogs: {"base":{"equipments":[{"id":"washer","label":"Lave-linge","required":true,"footprint":{"w":0.6,"d":0.6},"anchor":"wall","usage":[{"face":"front","min":0.9}],"services":["eau","evacuation"],"program":"buanderie"},{"id":"dryer","label":"Sèche-linge","required":false,"minRoomArea":4,"footprint":{"w":0.6,"d":0.6},"anchor":"wall","usage":[{"face":"front","min":0.9}],"services":["electricite","evacuation"],"program":"buanderie"}],"relations":[]}}
    },
    cellier: {
      label: "Cellier", mvp: false, role: "annexe", agrement: 0.6,
      minProgramArea: null, minProgramSide: null, targetProgramArea: null, maxRatio: null,
      programFloors: null,
      trigger: null,
      facingClearance: null,
      accessClearance: null,
      maxFurnitureRatio: null,
      variants: {
        base: [[110, 120], [120, 110]]
      },
      programs: {"base":{"equipments":[{"id":"shelving","label":"Étagères","required":true,"assumed":true,"footprint":{"w":1.2,"d":0.45},"anchor":"wall","usage":[{"face":"front","min":0.6}],"program":"cellier"}],"relations":[]}},
      catalogs: {"base":{"equipments":[{"id":"shelving","label":"Étagères","required":true,"assumed":true,"footprint":{"w":1.2,"d":0.45},"anchor":"wall","usage":[{"face":"front","min":0.6}],"program":"cellier"}],"relations":[]}}
    },
    local_technique: {
      label: "Local technique", mvp: false, role: "service", agrement: 0.6,
      minProgramArea: null, minProgramSide: null, targetProgramArea: null, maxRatio: null,
      programFloors: null,
      trigger: null,
      facingClearance: null,
      accessClearance: null,
      maxFurnitureRatio: null,
      variants: {
        base: [[70, 230], [90, 200], [130, 140], [140, 130], [200, 90], [230, 70]]
      },
      programs: {"base":{"equipments":[{"id":"water_heater","label":"Production d’eau chaude","required":true,"footprint":{"w":0.7,"d":0.7},"anchor":"wall","usage":[{"face":"front","min":0.7,"exclusive":true}],"services":["eau","electricite"],"program":"local_technique"},{"id":"electrical_panel","label":"Tableau électrique","required":true,"footprint":{"w":0.6,"d":0.15},"anchor":"wall","usage":[{"face":"front","min":0.7,"exclusive":true}],"services":["electricite"],"program":"local_technique"}],"relations":[]}},
      catalogs: {"base":{"equipments":[{"id":"water_heater","label":"Production d’eau chaude","required":true,"footprint":{"w":0.7,"d":0.7},"anchor":"wall","usage":[{"face":"front","min":0.7,"exclusive":true}],"services":["eau","electricite"],"program":"local_technique"},{"id":"electrical_panel","label":"Tableau électrique","required":true,"footprint":{"w":0.6,"d":0.15},"anchor":"wall","usage":[{"face":"front","min":0.7,"exclusive":true}],"services":["electricite"],"program":"local_technique"}],"relations":[]}}
    },
    garage: {
      label: "Garage", mvp: false, role: "annexe", agrement: 0.6,
      minProgramArea: null, minProgramSide: null, targetProgramArea: null, maxRatio: null,
      programFloors: null,
      trigger: null,
      facingClearance: null,
      accessClearance: null,
      maxFurnitureRatio: null,
      variants: {
        base: [[310, 500], [500, 310]]
      },
      programs: {"base":{"equipments":[{"id":"parking_space","label":"Emplacement véhicule","required":true,"footprint":{"w":2.5,"d":5},"anchor":"free","usage":[{"face":"long","min":0.6,"sides":1}],"program":"garage"}],"relations":[]}},
      catalogs: {"base":{"equipments":[{"id":"parking_space","label":"Emplacement véhicule","required":true,"footprint":{"w":2.5,"d":5},"anchor":"free","usage":[{"face":"long","min":0.6,"sides":1}],"program":"garage"}],"relations":[]}}
    }
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

  /** Le côté court le plus petit que le domaine admette, en mètres. */
  function narrowest(type, variant) {
    var entry = ENVELOPES[type];
    if (!entry) return null;
    var names = variant ? [variant] : Object.keys(entry.variants);
    var best = null;
    names.forEach(function (name) {
      (entry.variants[name] || []).forEach(function (pair) {
        var side = Math.min(pair[0], pair[1]) / 100;
        if (best === null || side < best) best = side;
      });
    });
    return best;
  }

  function roleOf(type) {
    return ENVELOPES[type] ? ENVELOPES[type].role : null;
  }

  /** Les types portant ce rôle. Évite aux règles de tenir des listes en dur. */
  function typesByRole(role) {
    return Object.keys(ENVELOPES).filter(function (type) { return ENVELOPES[type].role === role; });
  }

  function agrementOf(type) {
    var entry = ENVELOPES[type];
    return entry && Number.isFinite(entry.agrement) ? entry.agrement : 0.6;
  }

  function maxRatioOf(type) {
    var entry = ENVELOPES[type];
    return entry && Number.isFinite(entry.maxRatio) ? entry.maxRatio : null;
  }

  /* Programme minimal compilé : le générateur peut appeler le même solveur
     que l'outil hors ligne sans charger le socle éditorial différé. */
  function programOf(type, variant) {
    var entry = ENVELOPES[type];
    if (!entry) return { equipments: [], relations: [], facingClearance: null, accessClearance: null, maxFurnitureRatio: null };
    var name = variant || Object.keys(entry.programs)[0];
    var program = entry.programs[name] || entry.programs[Object.keys(entry.programs)[0]];
    return {
      equipments: program.equipments,
      relations: program.relations,
      facingClearance: entry.facingClearance,
      accessClearance: entry.accessClearance,
      maxFurnitureRatio: entry.maxFurnitureRatio
    };
  }

  function resolveSize(equipment, context) {
    if (!Array.isArray(equipment.sizes) || !equipment.sizes.length ||
        context.upgradeSizes === false || !Number.isFinite(context.area)) return equipment;
    var chosen = null;
    equipment.sizes.forEach(function (size) {
      if (!Number.isFinite(size.from) || context.area < size.from) return;
      if (!chosen || size.from > chosen.from) chosen = size;
    });
    if (!chosen) return equipment;
    return Object.assign({}, equipment, {
      size: chosen.id,
      label: chosen.label || equipment.label,
      val: chosen.val || equipment.val,
      footprint: Object.assign({}, chosen.footprint),
      anchor: chosen.anchor || equipment.anchor,
      usage: chosen.usage || equipment.usage,
      sizes: undefined
    });
  }

  /* Programme canonique résolu au runtime. Contrairement à `programOf`, il
     peut activer un optionnel et une montée de gamme ; l'appelant reste libre
     de demander les replis dans l'ordre M4c. */
  function resolveProgram(type, variant, context) {
    context = context || {};
    var entry = ENVELOPES[type];
    if (!entry || !entry.catalogs) return programOf(type, variant);
    var name = variant || Object.keys(entry.catalogs)[0];
    var catalog = entry.catalogs[name] || entry.catalogs[Object.keys(entry.catalogs)[0]];
    var equipments = catalog.equipments.filter(function (equipment) {
      if (equipment.required) return true;
      return context.includeOptional !== false && Number.isFinite(context.area) &&
        Number.isFinite(equipment.minRoomArea) && context.area >= equipment.minRoomArea;
    }).map(function (equipment) { return resolveSize(equipment, context); });
    var ids = equipments.map(function (equipment) { return equipment.id; });
    var relations = catalog.relations.filter(function (relation) {
      var references = [relation.subject, relation.target].concat(relation.targets || []).filter(Boolean);
      if (relation.optional && !references.every(function (id) { return ids.indexOf(id) !== -1; })) return false;
      return references.length >= 2 && references.every(function (id) { return ids.indexOf(id) !== -1; });
    });
    return {
      equipments: equipments,
      relations: relations,
      facingClearance: entry.facingClearance,
      accessClearance: entry.accessClearance,
      maxFurnitureRatio: entry.maxFurnitureRatio,
      resolution: {
        method: 'canonical-catalog-v1', area: Number.isFinite(context.area) ? context.area : null,
        upgradeSizes: context.upgradeSizes !== false,
        includeOptional: context.includeOptional !== false
      }
    };
  }

  /* Le plancher effectif : le plus exigeant du calculé et du convenu. C'est
     le seul endroit où les deux se rencontrent, et la raison pour laquelle
     aucune surface minimale n'est plus écrite à la main dans le moteur. */
  function floorOf(type, variant) {
    var entry = ENVELOPES[type];
    if (!entry) return { area: 0, side: 0 };
    var petit = smallest(type, variant);
    var etroit = narrowest(type, variant);
    var variantFloor = variant && entry.programFloors && entry.programFloors[variant];
    return {
      area: Math.max(petit ? petit.w * petit.h : 0,
        variantFloor && Number.isFinite(variantFloor.area) ? variantFloor.area : entry.minProgramArea || 0),
      side: Math.max(etroit || 0,
        variantFloor && Number.isFinite(variantFloor.side) ? variantFloor.side : entry.minProgramSide || 0)
    };
  }

  root.TechnoHabFit = {
    envelopes: ENVELOPES, fits: fits, smallest: smallest, narrowest: narrowest,
    roleOf: roleOf, typesByRole: typesByRole, agrementOf: agrementOf,
    maxRatioOf: maxRatioOf, floorOf: floorOf, programOf: programOf,
    resolveProgram: resolveProgram,
    geometryScope: 'rectangle-only'
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
