(function (root) {
  'use strict';

  var socle = root.TechnoHabSocle;
  if (!socle) throw new Error('TechnoHabRoomModel exige TechnoHabSocle.');

  var ANCHORS = ['wall', 'corner', 'free'];
  var USAGE_FACES = ['front', 'back', 'long', 'foot', 'around'];
  var RELATION_KINDS = ['near', 'distance-range', 'gap-range', 'perimeter-max',
    'same-wall', 'different-wall', 'between', 'faces', 'workstation'];

  // Ces règles portent sur la désignation d'une pièce, avant toute géométrie.
  // Elles sont génériques : un nouveau type de pièce profite du même contrôle
  // dès qu'il déclare ses équipements dans le socle.
  var EXISTENCE_RULES = [
    { code: 'EX1', level: 'HARD', label: 'Le type et sa variante existent dans le socle' },
    { code: 'EX2', level: 'HARD', label: 'Chaque équipement requis actif est désigné une fois' },
    { code: 'EX3', level: 'HARD', label: 'Chaque équipement déclare emprise, ancrage et usage minimal' },
    { code: 'EX4', level: 'HARD', label: 'Chaque relation référence des équipements désignés' }
  ];

  function finitePositive(value) {
    return Number.isFinite(value) && value > 0;
  }

  function validateEquipment(equipment) {
    if (!equipment || !equipment.id || !equipment.label) return false;
    if (!equipment.footprint || !finitePositive(equipment.footprint.w) || !finitePositive(equipment.footprint.d)) return false;
    if (ANCHORS.indexOf(equipment.anchor || 'free') === -1 || !Array.isArray(equipment.usage)) return false;
    return equipment.usage.every(function (usage) {
      return usage && USAGE_FACES.indexOf(usage.face) !== -1 &&
        Number.isFinite(usage.min) && usage.min >= 0;
    });
  }

  /* Une gamme retient exactement une taille : la plus grande dont le seuil est
     atteint, le plancher à défaut. Le choix est déterministe et ne dépend que
     de la surface — la graine fait varier la pose, jamais le programme.

     `id` est conservé. La montée en gamme change l'emprise, pas l'identité :
     une relation qui nomme `sofa` doit continuer de s'appliquer quand le séjour
     reçoit un trois-places. La taille retenue se relit dans `size`. */
  function resolveSize(equipment, context) {
    if (!Array.isArray(equipment.sizes) || !equipment.sizes.length) return equipment;
    if (context.upgradeSizes === false || !Number.isFinite(context.area)) return equipment;
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

  function selectedEquipments(room, variant, context) {
    context = context || {};
    return room.equipments.filter(function (equipment) {
      if (equipment.variant && equipment.variant !== variant) return false;
      if (equipment.required) return true;
      return context.includeOptional !== false && Number.isFinite(context.area) &&
        Number.isFinite(equipment.minRoomArea) && context.area >= equipment.minRoomArea;
    }).map(function (equipment) {
      return resolveSize(equipment, context);
    });
  }

  /* Une pièce fusionnée n'est pas deux pièces : c'est une pièce qui porte
     deux programmes. Contour, étiquette et solveur restent uniques ; seuls
     les équipements s'additionnent.

     La table remplace le cas particulier du séjour : une option qui retire
     une pièce du programme doit verser ses équipements à celle qui l'absorbe,
     jamais les faire disparaître (ROADMAP §5.3, défaut D3). */
  var COMPOSITIONS = {
    living: { flag: 'openKitchen', with: 'kitchen' },
    bath: {
      flag: 'integratedWc', with: 'wc',
      absorptions: [{ guest: 'handbasin', by: 'washbasin' }],
      relations: [{
        code: 'BATH-WC-WET-001', kind: 'different-wall', subject: 'wc_pan',
        targetAny: ['shower', 'bathtub'], level: 'GUIDELINE', weight: 1.5,
        label: 'La cuvette préserve la sortie de l’équipement humide principal'
      }]
    }
  };

  function mergeProgram(type, variant, context) {
    var room = socle.rooms[type];
    if (!room) return { rooms: [], equipments: [], relations: [], services: [] };
    var programs = [{ type: type, room: room, variant: variant }];
    var composition = COMPOSITIONS[type];
    if (composition && context[composition.flag] && socle.rooms[composition.with]) {
      programs.push({ type: composition.with, room: socle.rooms[composition.with], variant: null });
    }
    var equipments = [];
    var relations = [];
    var services = [];
    programs.forEach(function (program) {
      selectedEquipments(program.room, program.variant, context).forEach(function (equipment) {
        equipments.push(Object.assign({}, equipment, { program: program.type }));
      });
      relations.push.apply(relations, program.room.relations || []);
      (program.room.services || []).forEach(function (service) {
        if (services.indexOf(service) === -1) services.push(service);
      });
    });
    var absorptions = [];
    if (programs.length > 1 && composition) {
      (composition.absorptions || []).forEach(function (rule) {
        var hostPresent = equipments.some(function (equipment) { return equipment.id === rule.by && equipment.program === type; });
        if (!hostPresent) return;
        var before = equipments.length;
        equipments = equipments.filter(function (equipment) {
          return !(equipment.id === rule.guest && equipment.program === composition.with);
        });
        if (equipments.length < before) absorptions.push({ guest: rule.guest, by: rule.by });
      });
      relations.push.apply(relations, composition.relations || []);
    }
    return { rooms: programs, equipments: equipments, relations: relations, services: services, absorptions: absorptions };
  }

  function relationReferences(relation, ids) {
    var resolved = Object.assign({}, relation);
    if (relation.targetAny) {
      resolved.target = relation.targetAny.find(function (id) { return ids.indexOf(id) !== -1; }) || null;
    }
    var references = [resolved.subject];
    if (resolved.target) references.push(resolved.target);
    if (resolved.targets) references.push.apply(references, resolved.targets);
    var validKind = RELATION_KINDS.indexOf(resolved.kind) !== -1;
    var validReferences = references.length >= 2 && references.every(function (id) { return ids.indexOf(id) !== -1; });
    return { valid: validKind && validReferences, relation: resolved };
  }

  function evaluation(rule, passed, message) {
    return { code: rule.code, level: rule.level, label: rule.label, passed: passed, message: message };
  }

  function designate(type, variant, context) {
    context = context || {};
    var room = socle.rooms[type];
    var roomExists = Boolean(room);
    var variants = room && room.variants ? room.variants : [null];
    var selectedVariant = variant === undefined ? variants[0] : variant;
    var variantExists = roomExists && variants.indexOf(selectedVariant) !== -1;
    var program = variantExists ? mergeProgram(type, selectedVariant, context) : { rooms: [], equipments: [], relations: [], services: [] };
    var equipments = program.equipments;
    var ids = equipments.map(function (equipment) { return equipment.id; });
    var uniqueIds = new Set(ids);
    var equipmentsValid = equipments.every(validateEquipment);
    var applicableRelations = program.relations.filter(function (relation) {
      if (!relation.optional) return true;
      var references = [relation.subject, relation.target].concat(relation.targets || []).filter(Boolean);
      return references.every(function (id) { return ids.indexOf(id) !== -1; });
    });
    var relationResults = variantExists ? applicableRelations.map(function (relation) {
      return relationReferences(relation, ids);
    }) : [];
    var relationsValid = relationResults.every(function (result) { return result.valid; });
    var evaluations = [
      evaluation(EXISTENCE_RULES[0], roomExists && variantExists,
        roomExists ? (variantExists ? 'Type et variante reconnus.' : 'Variante inconnue.') : 'Type de pièce inconnu.'),
      evaluation(EXISTENCE_RULES[1], uniqueIds.size === equipments.length,
        uniqueIds.size === equipments.length ? equipments.length + ' exigence(s) minimale(s) désignée(s).' : 'Un équipement requis est désigné plusieurs fois.'),
      evaluation(EXISTENCE_RULES[2], equipmentsValid,
        equipmentsValid ? 'Emprises, ancrages et usages minimaux complets.' : 'Une exigence minimale est incomplète.'),
      evaluation(EXISTENCE_RULES[3], relationsValid,
        relationsValid ? relationResults.length + ' relation(s) applicable(s).' : 'Une relation référence un équipement absent ou un type inconnu.')
    ];
    var services = [];
    equipments.forEach(function (equipment) {
      (equipment.services || []).forEach(function (service) {
        if (services.indexOf(service) === -1) services.push(service);
      });
    });
    program.services.forEach(function (service) {
      if (services.indexOf(service) === -1) services.push(service);
    });

    return {
      valid: evaluations.every(function (entry) { return entry.level !== 'HARD' || entry.passed; }),
      type: type,
      variant: selectedVariant,
      room: room || null,
      programs: program.rooms.map(function (entry) { return entry.type; }),
      absorptions: program.absorptions || [],
      equipments: equipments,
      requirements: equipments.map(function (equipment) {
        return {
          id: 'REQ-' + type + '-' + equipment.id,
          kind: 'equipment', min: 1, equipment: equipment,
          minimumUse: {
            footprint: Object.assign({}, equipment.footprint),
            anchor: equipment.anchor || 'free',
            usage: equipment.usage.map(function (usage) { return Object.assign({}, usage); })
          }
        };
      }),
      relations: relationResults.filter(function (result) { return result.valid; }).map(function (result) { return result.relation; }),
      services: services,
      evaluations: evaluations,
      violations: evaluations.filter(function (entry) { return !entry.passed; })
    };
  }

  root.TechnoHabRoomModel = {
    designate: designate,
    existenceRules: EXISTENCE_RULES,
    relationKinds: RELATION_KINDS.slice(),
    compositions: COMPOSITIONS
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
