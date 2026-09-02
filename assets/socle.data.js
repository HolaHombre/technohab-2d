(function (root) {
  'use strict';

  // Socle d'agencement — transcription exécutable de SOCLE_AGENCEMENT.md §5.
  // Le document fait foi : toute divergence de cote est un défaut de ce
  // fichier, pas une variante.
  //
  // footprint  { w, d } emprise en mètres, w le long du mur d'ancrage.
  //            C'est le PLANCHER de la gamme : la plus petite taille, celle
  //            qui détermine si la pièce est meublable.
  // sizes      montées en gamme — les tailles plus grandes du même équipement,
  //            chacune avec le seuil `from` (m² de la pièce) au-delà duquel
  //            elle est retenue. La plus grande dont le seuil est atteint
  //            l'emporte ; à défaut, le plancher. Voir GAMMES_EQUIPEMENTS.md.
  //
  //            Le plancher reste dans `footprint` et non dans `sizes[0]` : ainsi
  //            `requiredEquipments()` et le calcul d'enveloppes continuent de
  //            lire la plus petite taille sans rien connaître des gammes, et
  //            ajouter une taille ne peut PAS déplacer un domaine de
  //            faisabilité. L'invariant est tenu par construction, pas par test.
  //
  //            Un membre peut redéfinir `anchor`, `usage` et `label` ; `id` ne
  //            change jamais, sans quoi les relations qui le nomment cesseraient
  //            de s'appliquer. La taille retenue se relit dans `size`.
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
  //
  // --- Champs de PIÈCE ------------------------------------------------------
  //
  // role            énuméré, voir ROLES. Il remplace les listes de types
  //                 écrites en dur dans les règles : TH2D-FACADE-001 demandait
  //                 « living, bedroom, kitchen, dining, bureau », qu'il fallait
  //                 rallonger à la main à chaque pièce nouvelle. La pièce
  //                 déclare ce qu'elle est, la règle interroge le rôle.
  //
  // agrement        ce qu'un mètre carré *supplémentaire* apporte à la pièce.
  //                 Rapatrié depuis generator.js. C'est la tolérance à la
  //                 surface : le séjour en tire de l'usage, le WC rien.
  //                 Convention assumée — aucun calcul ne la tranchera.
  //
  // minProgramArea  plancher de **dignité d'usage**, en m². À ne pas confondre
  //                 avec le plancher de meublabilité, qui lui se calcule
  //                 (fit.data.js, plus petit rectangle recevant le mobilier
  //                 requis). Les deux étaient confondus dans un seul nombre
  //                 décrété ; l'écart est considérable — un séjour se meuble
  //                 dès 3,24 m² et reste absurde à cette taille. Le premier
  //                 est une convention N3, le second un résultat. Le
  //                 générateur retient le plus exigeant des deux.
  // minProgramSide  même nature, sur le côté court, en mètres.
  //                 `null` sur les types non générés : aucune mesure ne les
  //                 fonde encore, et rien ne les réclame tant que le
  //                 chantier 7 ne les active pas.
  // programFloors   surcharge ces deux valeurs par variante lorsque leurs
  //                 fonctions imposent réellement des planchers différents.
  //                 Le scalaire reste le repli pour les consommateurs anciens.
  //
  // maxRatio        plafond de surface, exprimé en multiple du besoin calculé
  //                 — jamais en m² absolus, qui ne survivraient pas au
  //                 changement de programme. Une valeur peut être mesurée
  //                 (circulation) ou doctrinale N3, identifiée, justifiée et
  //                 bornée à un profil (WC, O1). Pas de nombre muet.
  //
  // trigger         critère d'existence de la PIÈCE — à quelle condition elle
  //                 apparaît au programme. Transcription déclarative de ce que
  //                 generator.js::buildProgram fait aujourd'hui en dur. Voir
  //                 TRIGGER_KINDS. `null` = pièce non activable, en attente du
  //                 chantier 7. Aucun interpréteur ne le lit encore : ce
  //                 fichier décrit, il n'active pas.

  var MODULE = 1.20; // longueur retenue pour les linéaires à longueur libre
  var STORAGE_BAY = {
    minDepth: 0.45,
    maxDepthLengthRatio: 0.60,
    canonicalValues: {
      minDepth: 'VAL-STORAGE-BAY-DEPTH-MIN-001',
      maxDepthLengthRatio: 'VAL-STORAGE-BAY-DEPTH-LENGTH-RATIO-MAX-001'
    }
  };

  /* Rôles. Quatre disent ce que la pièce est pour le bâtiment ; `zone` dit
     qu'elle n'est pas une pièce mais une part désignée d'une pièce hôte.
     Cette dernière valeur existe avant son usage, pour que l'arbitrage
     « salle à manger : pièce ou zone » (chantier 7, lot L2) se règle en
     changeant un mot et non la forme de la table. */
  var ROLES = ['principale', 'service', 'distribution', 'annexe', 'zone'];

  /* Formes de déclenchement.
       always   la pièce est au programme dès qu'un logement existe
       count    autant d'exemplaires que l'option nommée le demande
       derived  le moteur décide seul, sur un besoin qu'il calcule
     `standaloneIf` / `otherwiseInto` décrivent le cas d'une fonction toujours
     présente, mais qui n'est une pièce que si l'option le demande — sans quoi
     elle est versée à une autre. C'est la composition déjà implémentée
     (cuisine ouverte, WC intégré), pas une intention nouvelle. */
  var TRIGGER_KINDS = ['always', 'count', 'derived'];

  var ROOMS = {
    living: {
      label: 'Séjour', mvp: true, freeRect: { w: 1.20, d: 1.20 },
      role: 'principale', agrement: 1.4,
      minProgramArea: 20, minProgramSide: 3.00, targetProgramArea: 24, maxRatio: null,
      accessClearance: 0.70, maxFurnitureRatio: 0.50,
      canonicalValues: {
        minProgramArea: 'VAL-LIVING-PROGRAM-AREA-MIN-001',
        minProgramSide: 'VAL-LIVING-PROGRAM-SIDE-MIN-001',
        targetProgramArea: 'VAL-LIVING-PROGRAM-AREA-TARGET-001',
        accessClearance: 'VAL-LIVING-ACCESS-CLEARANCE-MIN-001',
        maxFurnitureRatio: 'VAL-LIVING-FURNITURE-RATIO-MAX-001'
      },
      trigger: { kind: 'always' },
      equipments: [
        { id: 'sofa', label: 'Canapé', required: true,
          canonicalValues: { footprint: 'VAL-LIVING-SOFA-FOOTPRINT-001', usageMin: 'VAL-LIVING-SOFA-CLEARANCE-MIN-001', usageTarget: 'VAL-LIVING-SOFA-CLEARANCE-TARGET-001', usageComfort: 'VAL-LIVING-SOFA-CLEARANCE-COMFORT-001' },
          footprint: { w: 1.80, d: 0.90 }, anchor: 'wall', usage: [{ face: 'front', min: 0.50, target: 0.50, comfort: 0.60 }],
          sizes: [
            { id: 'sofa_3', label: 'Canapé 3 places', from: 24, footprint: { w: 2.20, d: 0.90 } },
            // L'angle change d'ancrage : c'est la seule montée de gamme qui ne
            // soit pas qu'un allongement.
            { id: 'sofa_angle', label: 'Canapé d’angle', from: 30, footprint: { w: 2.20, d: 2.20 }, anchor: 'corner' }
          ] },
        { id: 'coffee_table', label: 'Table basse', required: true,
          canonicalValues: { footprint: 'VAL-LIVING-COFFEE-TABLE-FOOTPRINT-001', usageMin: 'VAL-LIVING-COFFEE-TABLE-CLEARANCE-MIN-001', usageTarget: 'VAL-LIVING-COFFEE-TABLE-CLEARANCE-TARGET-001', usageComfort: 'VAL-LIVING-COFFEE-TABLE-CLEARANCE-COMFORT-001' },
          footprint: { w: 1.10, d: 0.60 }, anchor: 'free', usage: [{ face: 'front', min: 0.45, target: 0.50, comfort: 0.60, accessRequired: false }] },
        { id: 'tv_unit', label: 'Meuble bas', required: false, minRoomArea: 22,
          canonicalValues: { activationArea: 'VAL-LIVING-MEDIA-ACTIVATION-AREA-001', footprint: 'VAL-LIVING-TV-FOOTPRINT-001', usageMin: 'VAL-LIVING-TV-CLEARANCE-MIN-001' },
          footprint: { w: MODULE, d: 0.40 }, anchor: 'wall', usage: [{ face: 'front', min: 0.60 }] },
        { id: 'armchair', label: 'Fauteuil', required: false, minRoomArea: 22,
          canonicalValues: { activationArea: 'VAL-LIVING-ARMCHAIR-ACTIVATION-AREA-001', footprint: 'VAL-LIVING-ARMCHAIR-FOOTPRINT-001' },
          footprint: { w: 0.90, d: 0.85 }, anchor: 'free', usage: [] }
      ],
      relations: [
        { code: 'LIVING-FOCAL-001', kind: 'faces', subject: 'sofa', target: 'tv_unit', optional: true, level: 'GUIDELINE', weight: 1.8, label: 'Le canapé fait face au meuble média' },
        { code: 'LIVING-TABLE-001', kind: 'gap-range', subject: 'coffee_table', target: 'sofa', min: 0.45, max: 0.65,
          canonicalValues: { min: 'VAL-LIVING-TABLE-GAP-MIN-001', max: 'VAL-LIVING-TABLE-GAP-MAX-001' },
          level: 'GUIDELINE', weight: 1.8, label: 'La table basse reste à portée du canapé' },
        { code: 'LIVING-CONVERSATION-001', kind: 'distance-range', subject: 'armchair', target: 'sofa', min: 1.00, targetDistance: 1.80, max: 3.00, optional: true,
          canonicalValues: { min: 'VAL-LIVING-CONVERSATION-MIN-001', target: 'VAL-LIVING-CONVERSATION-TARGET-001', max: 'VAL-LIVING-CONVERSATION-MAX-001' },
          level: 'GUIDELINE', weight: 1.5, label: 'Les assises restent à distance de conversation' }
      ]
    },

    dining: {
      label: 'Salle à manger', mvp: false,
      /* `principale` reproduit exactement le comportement actuel de
         TH2D-FACADE-001, qui la comptait déjà parmi les pièces à façade. Le
         lot L2 tranchera « pièce ou zone » ; le jour où il choisit la zone,
         c'est ce seul mot qui change. */
      role: 'principale', agrement: 0.6,
      minProgramArea: null, minProgramSide: null, maxRatio: null,
      trigger: null,
      equipments: [
        // Les assises sont portées par la zone d'usage : c'est elle qui
        // dimensionne la pièce, pas la table.
        { id: 'dining_table_4', label: 'Table 4 places', required: true, footprint: { w: 1.40, d: 0.80 }, anchor: 'free', usage: [{ face: 'around', min: 0.80 }] }
      ]
    },

    bedroom: {
      label: 'Chambre', mvp: true, variants: ['enfant', 'parentale'],
      role: 'principale', agrement: 0.6,
      minProgramArea: 9, minProgramSide: 2.50, maxRatio: null,
      programFloors: {
        enfant: { area: 9, side: 2.50 },
        parentale: { area: 11, side: 2.70 }
      },
      canonicalValues: {
        enfantArea: 'VAL-BED-PROGRAM-AREA-MIN-CHILD-001',
        enfantSide: 'VAL-BED-PROGRAM-SIDE-MIN-CHILD-001',
        parentaleArea: 'VAL-BED-PROGRAM-AREA-MIN-PARENT-001',
        parentaleSide: 'VAL-BED-PROGRAM-SIDE-MIN-PARENT-001'
      },
      trigger: { kind: 'count', from: 'bedrooms' },
      equipments: [
        { id: 'bed_90', label: 'Lit simple 90', val: 'VAL-EQ-001', canonicalValues: { footprint: 'VAL-EQ-001', sideMin: 'VAL-BED-SIDE-MIN-001', sideTarget: 'VAL-BED-SIDE-TARGET-CHILD-001', sideComfort: 'VAL-BED-SIDE-COMFORT-CHILD-001', footMin: 'VAL-BED-FOOT-MIN-001', footTarget: 'VAL-BED-FOOT-TARGET-001', footComfort: 'VAL-BED-FOOT-COMFORT-001' }, required: true, variant: 'enfant', footprint: { w: 0.90, d: 1.90 }, anchor: 'wall', usage: [{ face: 'long', min: 0.60, target: 0.60, comfort: 0.70, sides: 1 }, { face: 'foot', min: 0.60, target: 0.70, comfort: 0.90 }] },
        /* Le marché bascule du 140×190 vers le 160×200. Ces tailles étaient
           déclarées comme des équipements distincts, non requis et sans seuil
           de surface : `selectedEquipments()` ne les retenait donc jamais, et
           `bed_160` n'a été posé dans aucun plan depuis son ajout. En gamme,
           elles deviennent atteignables sans surdimensionner le programme
           courant — la chambre qui ne peut pas les absorber garde le 140. */
        { id: 'bed_140', label: 'Lit double 140', val: 'VAL-EQ-002', canonicalValues: { footprint: 'VAL-EQ-002', sideMin: 'VAL-BED-SIDE-MIN-001', sideTarget: 'VAL-BED-SIDE-TARGET-PARENT-001', sideComfort: 'VAL-BED-SIDE-COMFORT-PARENT-001', footMin: 'VAL-BED-FOOT-MIN-001', footTarget: 'VAL-BED-FOOT-TARGET-001', footComfort: 'VAL-BED-FOOT-COMFORT-001' }, required: true, variant: 'parentale', footprint: { w: 1.40, d: 1.90 }, anchor: 'wall', usage: [{ face: 'long', min: 0.60, target: 0.70, comfort: 0.90, sides: 2 }, { face: 'foot', min: 0.60, target: 0.70, comfort: 0.90 }],
          sizes: [
            { id: 'bed_160', label: 'Lit queen 160', val: 'VAL-EQ-003', from: 12, footprint: { w: 1.60, d: 2.00 } },
            { id: 'bed_180', label: 'Lit king 180', val: 'VAL-EQ-004', from: 16, footprint: { w: 1.80, d: 2.00 } }
          ] },
        { id: 'wardrobe', label: 'Penderie coulissante', opening: 'sliding', canonicalValues: { footprint: 'VAL-BED-WARDROBE-FOOTPRINT-001', usageMin: 'VAL-BED-WARDROBE-CLEARANCE-MIN-001', usageTarget: 'VAL-BED-WARDROBE-CLEARANCE-TARGET-001', usageComfort: 'VAL-BED-WARDROBE-CLEARANCE-COMFORT-001' }, required: true, assumed: true, footprint: { w: MODULE, d: 0.60 }, anchor: 'wall', usage: [{ face: 'front', min: 0.70, target: 0.70, comfort: 0.90 }] }
      ],
      relations: [
        { code: 'BED-STORAGE-001', kind: 'different-wall', subject: 'wardrobe', targetAny: ['bed_90', 'bed_140'], level: 'GUIDELINE', weight: 1.4, label: 'Le rangement libère le mur de tête du lit' }
      ]
    },

    kitchen: {
      label: 'Cuisine', mvp: true, facingClearance: 1.20,
      services: ['ventilation'],
      role: 'principale', agrement: 0.6,
      minProgramArea: 7, minProgramSide: 1.85, maxRatio: null,
      canonicalValues: {
        minProgramArea: 'VAL-KITCHEN-PROGRAM-AREA-MIN-001',
        minProgramSide: 'VAL-KITCHEN-PROGRAM-SIDE-MIN-001',
        facingClearance: 'VAL-KITCHEN-FACING-CLEARANCE-MIN-001'
      },
      // Toujours au programme ; pièce à part entière seulement si l'option le
      // demande, sinon versée au séjour — c'est la cuisine ouverte.
      trigger: { kind: 'always', standaloneIf: 'separateKitchen', otherwiseInto: 'living' },
      equipments: [
        { id: 'sink', label: 'Évier', val: 'VAL-EQ-010', required: true,
          canonicalValues: { footprint: 'VAL-KITCHEN-SINK-FOOTPRINT-001', usageMin: 'VAL-KITCHEN-APPLIANCE-CLEARANCE-MIN-001' },
          footprint: { w: 0.60, d: 0.60 }, anchor: 'wall', usage: [{ face: 'front', min: 0.90 }], services: ['eau', 'evacuation'] },
        { id: 'hob', label: 'Plaque de cuisson', val: 'VAL-EQ-010', required: true,
          canonicalValues: { footprint: 'VAL-KITCHEN-HOB-FOOTPRINT-001', usageMin: 'VAL-KITCHEN-APPLIANCE-CLEARANCE-MIN-001' },
          footprint: { w: 0.60, d: 0.60 }, anchor: 'wall', usage: [{ face: 'front', min: 0.90 }], services: ['electricite'] },
        // Le plan de travail entre évier et plaque n'est pas négociable :
        // sans lui la cuisine est géométriquement valide et inutilisable.
        { id: 'worktop', label: 'Plan de travail', val: 'VAL-EQ-012', required: true,
          canonicalValues: { footprint: 'VAL-KITCHEN-WORKTOP-FOOTPRINT-MIN-001', usageMin: 'VAL-KITCHEN-APPLIANCE-CLEARANCE-MIN-001' },
          footprint: { w: 0.60, d: 0.60 }, anchor: 'wall', usage: [{ face: 'front', min: 0.90 }], between: ['sink', 'hob'] },
        // Un réfrigérateur encastrable s'aligne sur le plan de travail : la
        // profondeur de 0,65 relevée auparavant surdimensionnait la cuisine.
        { id: 'fridge', label: 'Réfrigérateur', val: 'VAL-EQ-016', required: true,
          canonicalValues: { footprint: 'VAL-KITCHEN-FRIDGE-FOOTPRINT-001', usageMin: 'VAL-KITCHEN-APPLIANCE-CLEARANCE-MIN-001' },
          footprint: { w: 0.60, d: 0.60 }, anchor: 'wall', usage: [{ face: 'front', min: 0.90 }] },
        { id: 'dishwasher', label: 'Lave-vaisselle', val: 'VAL-EQ-015', required: false, minRoomArea: 9,
          canonicalValues: { activationArea: 'VAL-KITCHEN-DISHWASHER-ACTIVATION-AREA-001', footprint: 'VAL-KITCHEN-DISHWASHER-FOOTPRINT-001', usageMin: 'VAL-KITCHEN-DISHWASHER-SWING-CLEARANCE-MIN-001' },
          footprint: { w: 0.60, d: 0.60 }, anchor: 'wall', usage: [{ face: 'front', min: 1.20 }], services: ['eau', 'evacuation'] }
      ],
      relations: [
        { code: 'KITCHEN-SEQUENCE-001', kind: 'between', subject: 'worktop', targets: ['sink', 'hob'], level: 'HARD', weight: 4, label: 'Le plan de travail sépare l’évier de la plaque' },
        { code: 'KITCHEN-ALIGN-001', kind: 'same-wall', subject: 'sink', target: 'worktop', level: 'GUIDELINE', weight: 1.5, label: 'L’évier et la préparation forment un linéaire' },
        { code: 'KITCHEN-ALIGN-002', kind: 'same-wall', subject: 'hob', target: 'worktop', level: 'GUIDELINE', weight: 1.5, label: 'La plaque et la préparation forment un linéaire' },
        { code: 'KITCHEN-COLD-001', kind: 'near', subject: 'fridge', target: 'worktop', max: 2.40, level: 'GUIDELINE', weight: 1, label: 'Le froid reste proche de la zone de préparation' },
        { code: 'KITCHEN-TRIANGLE-001', kind: 'perimeter-max', subject: 'sink', targets: ['hob', 'fridge'], max: 6.50,
          canonicalValues: { max: 'VAL-KITCHEN-TRIANGLE-PERIMETER-MAX-001' },
          level: 'GUIDELINE', weight: 1.4, label: 'Le triangle d’activité reste compact' }
      ]
    },

    bath: {
      label: 'Salle d’eau', mvp: true, variants: ['eau', 'bain'], services: ['ventilation'],
      role: 'service', agrement: 0.6,
      minProgramArea: 3, minProgramSide: 1.70, maxRatio: null,
      canonicalValues: { minProgramArea: 'VAL-BATH-PROGRAM-AREA-MIN-001', minProgramSide: 'VAL-BATH-PROGRAM-SIDE-MIN-001' },
      trigger: { kind: 'count', from: 'bathrooms' },
      equipments: [
        { id: 'shower', label: 'Douche', val: 'VAL-EQ-031', canonicalValues: { footprint: 'VAL-EQ-031', usageMin: 'VAL-BATH-SHOWER-CLEARANCE-MIN-001', usageTarget: 'VAL-BATH-SHOWER-CLEARANCE-TARGET-001', usageComfort: 'VAL-BATH-SHOWER-CLEARANCE-COMFORT-001' }, required: true, variant: 'eau', footprint: { w: 0.90, d: 0.90 }, anchor: 'corner', usage: [{ face: 'front', min: 0.60, target: 0.70, comfort: 0.80 }], services: ['eau', 'evacuation'] },
        { id: 'bathtub', label: 'Baignoire', val: 'VAL-EQ-030', canonicalValues: { footprint: 'VAL-EQ-030', usageMin: 'VAL-BATH-TUB-CLEARANCE-MIN-001', usageTarget: 'VAL-BATH-TUB-CLEARANCE-TARGET-001', usageComfort: 'VAL-BATH-TUB-CLEARANCE-COMFORT-001' }, required: true, variant: 'bain', footprint: { w: 1.70, d: 0.70 }, anchor: 'wall', usage: [{ face: 'front', min: 0.70, target: 0.80, comfort: 1.00 }], services: ['eau', 'evacuation'] },
        // Le dégagement de 0,80 est un minimum, cohérent avec l'espace
        // d'usage réglementaire ; 1,10 est la valeur de confort relevée.
        { id: 'washbasin', label: 'Lavabo', canonicalValues: { footprint: 'VAL-BATH-WASHBASIN-FOOTPRINT-001', usageMin: 'VAL-BATH-WASHBASIN-CLEARANCE-MIN-001', usageTarget: 'VAL-BATH-WASHBASIN-CLEARANCE-TARGET-001', usageComfort: 'VAL-EQ-033' }, required: true, footprint: { w: 0.60, d: 0.50 }, anchor: 'wall', usage: [{ face: 'front', min: 0.70, target: 0.80, comfort: 1.10 }], services: ['eau', 'evacuation'] },
        { id: 'towel_rail', label: 'Sèche-serviettes', canonicalValues: { footprint: 'VAL-BATH-TOWEL-RAIL-FOOTPRINT-001' }, required: false, minRoomArea: 4, footprint: { w: 0.60, d: 0.15 }, anchor: 'wall', usage: [] }
      ],
      relations: [
        { code: 'BATH-USE-001', kind: 'different-wall', subject: 'washbasin', targetAny: ['shower', 'bathtub'], level: 'GUIDELINE', weight: 1, label: 'Le lavabo préserve la façade de l’équipement humide principal' }
      ]
    },

    wc: {
      label: 'WC', mvp: true, services: ['ventilation'],
      role: 'service', agrement: 0,   // servi au plancher puis fermé : O1
      minProgramArea: 1.5, minProgramSide: 0.90, maxRatio: 3.5,
      canonicalValues: {
        minProgramArea: 'VAL-WC-PROGRAM-AREA-MIN-001',
        minProgramSide: 'VAL-WC-PROGRAM-SIDE-MIN-001',
        maxRatio: 'VAL-WC-PROGRAM-AREA-MAX-RATIO-001'
      },
      trigger: { kind: 'always', standaloneIf: 'includeWc', otherwiseInto: 'bath_1' },
      equipments: [
        { id: 'wc_pan', label: 'Cuvette', canonicalValues: { footprint: 'VAL-WC-PAN-FOOTPRINT-001', usageMin: 'VAL-WC-PAN-CLEARANCE-FRONT-001', usageTarget: 'VAL-WC-PAN-CLEARANCE-FRONT-TARGET-001', usageComfort: 'VAL-WC-PAN-CLEARANCE-FRONT-COMFORT-001', usageWidth: 'VAL-WC-PAN-CLEARANCE-WIDTH-001', sideMin: 'VAL-WC-PAN-CLEARANCE-SIDE-MIN-001', sideTarget: 'VAL-WC-PAN-CLEARANCE-SIDE-TARGET-001' }, required: true, footprint: { w: 0.40, d: 0.70 }, anchor: 'wall', usage: [{ face: 'front', min: 0.60, target: 0.70, comfort: 0.80, width: 0.60 }, { face: 'long', min: 0.20, target: 0.25, sides: 2 }], services: ['eau', 'evacuation'] },
        { id: 'handbasin', label: 'Lave-mains', canonicalValues: { activationArea: 'VAL-WC-HANDBASIN-ACTIVATION-AREA-001', footprint: 'VAL-WC-HANDBASIN-FOOTPRINT-001', usageMin: 'VAL-WC-HANDBASIN-CLEARANCE-FRONT-001', usageTarget: 'VAL-WC-HANDBASIN-CLEARANCE-FRONT-TARGET-001', usageComfort: 'VAL-WC-HANDBASIN-CLEARANCE-FRONT-COMFORT-001' }, required: false, minRoomArea: 1.3, footprint: { w: 0.40, d: 0.30 }, anchor: 'corner', usage: [{ face: 'front', min: 0.50, target: 0.60, comfort: 0.70 }], services: ['eau', 'evacuation'] }
      ]
    },

    // Pas d'équipement : la circulation est contrainte par sa largeur libre,
    // déjà tenue par TH2D-CIRC-001 et 003.
    circulation: {
      label: 'Circulation', mvp: true, equipments: [],
      clearWidth: { simple: 0.90, crossing: 1.20, crossingFromServices: 3, max: 1.80 },
      role: 'distribution', agrement: 0.6,   // majoré ensuite par ce qu'il dessert
      minProgramArea: 3, minProgramSide: 0.90,
      canonicalValues: {
        minProgramArea: 'VAL-CIRC-PROGRAM-AREA-MIN-001',
        minProgramSide: 'VAL-CIRC-CLEAR-WIDTH-SIMPLE-MIN-001',
        crossingWidth: 'VAL-CIRC-CLEAR-WIDTH-CROSSING-MIN-001',
        crossingFromServices: 'VAL-CIRC-CROSSING-SERVICE-COUNT-001',
        maxWidth: 'VAL-CIRC-CLEAR-WIDTH-MAX-001'
      },
      /* Le seul maxRatio mesuré : 90e centile relevé, gelé le 19 août 2026,
         porté à l'identique par generator.js et rules.js. Voir
         DOCTRINE_CIRCULATION.md. C'est le modèle que les autres pièces
         suivront quand la mesure du chantier 6 les aura calibrées. */
      maxRatio: 1.6,
      trigger: { kind: 'derived', from: 'desserte', minRooms: 4 }
    },

    /* Les six types qui suivent ne sont pas générés. Leur rôle et leur
       agrément sont déclarés parce qu'ils se lisent de la fonction ; leurs
       planchers de programme restent `null` parce qu'aucune mesure ne les
       fonde — les poser maintenant serait décréter six nombres de plus, et
       personne ne saurait d'où ils viennent. Le lot qui active la pièce les
       pose, mesure à l'appui. */

    entree: {
      label: 'Entrée', mvp: false,
      role: 'distribution', agrement: 0.6,
      minProgramArea: null, minProgramSide: null, maxRatio: null, trigger: null,
      equipments: [
        /* Sans `minRoomArea`, un équipement non requis n'est jamais retenu :
           la troisième branche de `selectedEquipments()` exige un seuil fini.
           Le placard, la bibliothèque et le sèche-linge étaient dans ce cas. */
        { id: 'closet', label: 'Placard', required: false, assumed: true, minRoomArea: 3, footprint: { w: MODULE, d: 0.60 }, anchor: 'wall', usage: [{ face: 'front', min: 0.60 }] }
      ]
    },

    bureau: {
      label: 'Bureau', mvp: false,
      role: 'principale', agrement: 0.6,
      minProgramArea: null, minProgramSide: null, maxRatio: null, trigger: null,
      equipments: [
        { id: 'desk', label: 'Plan de travail', required: true, footprint: { w: 1.20, d: 0.60 }, anchor: 'wall', usage: [{ face: 'front', min: 0.90 }] },
        { id: 'bookcase', label: 'Bibliothèque', required: false, assumed: true, minRoomArea: 7, footprint: { w: MODULE, d: 0.35 }, anchor: 'wall', usage: [{ face: 'front', min: 0.60 }] }
      ]
    },

    buanderie: {
      label: 'Buanderie', mvp: false,
      role: 'service', agrement: 0.6,
      minProgramArea: null, minProgramSide: null, maxRatio: null, trigger: null,
      equipments: [
        { id: 'washer', label: 'Lave-linge', required: true, footprint: { w: 0.60, d: 0.60 }, anchor: 'wall', usage: [{ face: 'front', min: 0.90 }], services: ['eau', 'evacuation'] },
        { id: 'dryer', label: 'Sèche-linge', required: false, minRoomArea: 4, footprint: { w: 0.60, d: 0.60 }, anchor: 'wall', usage: [{ face: 'front', min: 0.90 }], services: ['electricite', 'evacuation'] }
      ]
    },

    cellier: {
      label: 'Cellier', mvp: false,
      // Stockage, non raccordé : `annexe` et non `service`, qui vaut pour les
      // pièces que l'arrêté du 24 mars 1982 oblige à extraire.
      role: 'annexe', agrement: 0.6,
      minProgramArea: null, minProgramSide: null, maxRatio: null, trigger: null,
      equipments: [
        { id: 'shelving', label: 'Étagères', required: true, assumed: true, footprint: { w: MODULE, d: 0.45 }, anchor: 'wall', usage: [{ face: 'front', min: 0.60 }] }
      ]
    },

    local_technique: {
      label: 'Local technique', mvp: false,
      role: 'service', agrement: 0.6,
      minProgramArea: null, minProgramSide: null, maxRatio: null, trigger: null,
      equipments: [
        // Zone d'entretien : elle existe pour le technicien et ne se partage
        // avec rien.
        { id: 'water_heater', label: 'Production d’eau chaude', required: true, footprint: { w: 0.70, d: 0.70 }, anchor: 'wall', usage: [{ face: 'front', min: 0.70, exclusive: true }], services: ['eau', 'electricite'] },
        { id: 'electrical_panel', label: 'Tableau électrique', required: true, footprint: { w: 0.60, d: 0.15 }, anchor: 'wall', usage: [{ face: 'front', min: 0.70, exclusive: true }], services: ['electricite'] }
      ]
    },

    garage: {
      label: 'Garage', mvp: false,
      role: 'annexe', agrement: 0.6,
      minProgramArea: null, minProgramSide: null, maxRatio: null, trigger: null,
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

  function roleOf(type) {
    var room = ROOMS[type];
    return room && ROLES.indexOf(room.role) !== -1 ? room.role : null;
  }

  /* L'intérêt de l'énuméré est là : une règle nomme le rôle qu'elle vise, et
     n'a plus à tenir la liste des types qui l'ont. Toute pièce future entre
     dans la règle en déclarant son rôle, sans y toucher. */
  function typesByRole(role) {
    return Object.keys(ROOMS).filter(function (type) { return ROOMS[type].role === role; });
  }

  function agrementOf(type) {
    var room = ROOMS[type];
    return room && Number.isFinite(room.agrement) ? room.agrement : 0.6;
  }

  // Plancher de dignité d'usage seul. Le plancher de meublabilité se lit dans
  // fit.data.js ; c'est le générateur qui retient le plus exigeant des deux.
  function programFloor(type, variant) {
    var room = ROOMS[type];
    if (!room) return null;
    var variantFloor = variant && room.programFloors && room.programFloors[variant];
    return {
      area: variantFloor && Number.isFinite(variantFloor.area) ? variantFloor.area
        : Number.isFinite(room.minProgramArea) ? room.minProgramArea : null,
      side: variantFloor && Number.isFinite(variantFloor.side) ? variantFloor.side
        : Number.isFinite(room.minProgramSide) ? room.minProgramSide : null
    };
  }

  function maxRatioOf(type) {
    var room = ROOMS[type];
    return room && Number.isFinite(room.maxRatio) ? room.maxRatio : null;
  }

  // Une déclaration mal formée doit se voir au chargement, pas se propager en
  // silence jusqu'à une règle qui cesserait discrètement de s'appliquer.
  function malformedRooms() {
    return Object.keys(ROOMS).filter(function (type) {
      var room = ROOMS[type];
      if (ROLES.indexOf(room.role) === -1) return true;
      if (room.trigger && TRIGGER_KINDS.indexOf(room.trigger.kind) === -1) return true;
      return room.maxRatio !== null && !Number.isFinite(room.maxRatio);
    });
  }

  root.TechnoHabSocle = {
    rooms: ROOMS,
    placementRules: PLACEMENT_RULES,
    requiredEquipments: requiredEquipments,
    variantsOf: variantsOf,
    roles: ROLES.slice(),
    triggerKinds: TRIGGER_KINDS.slice(),
    roleOf: roleOf,
    typesByRole: typesByRole,
    agrementOf: agrementOf,
    programFloor: programFloor,
    maxRatioOf: maxRatioOf,
    malformedRooms: malformedRooms,
    storageBay: STORAGE_BAY,
    module: MODULE
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
