(function (root) {
  'use strict';

  /* M1 — contrats nommés du pipeline de génération.

     Les poseurs restent inchangés. Ce module nomme leurs frontières, porte la
     maturité des profils consommés et rend les échecs inspectables. Il ne
     dépend d'aucun autre module et reste utilisable en file://. */

  var CONTRACT_VERSION = '1.1';
  var STATUSES = Object.freeze({
    VALID: 'VALID',
    IMPOSSIBLE: 'IMPOSSIBLE',
    NON_TROUVE: 'NON_TROUVE',
    INVALIDE_DEBUG: 'INVALIDE_DEBUG'
  });
  var RESOLUTION_STATUSES = Object.freeze({
    EXACT: 'EXACT',
    RELAXED: 'RELAXED',
    UNRESOLVED: 'UNRESOLVED'
  });
  var RESOLUTION_LEVELS = Object.freeze([
    'R0_EXACT',
    'R1_FUSION',
    'R2_BATHROOMS',
    'R3_OPTIONAL_ROOM',
    'R4_BEDROOM'
  ]);
  var CHANGE_SEVERITIES = Object.freeze([
    'FUNCTION_PRESERVED',
    'FUNCTION_REDUCED',
    'FUNCTION_REMOVED'
  ]);

  var PROFILE_REGISTRY = Object.freeze({
    living: { id: 'LIVING', maturity: 'C4', version: '2026-08-31', source: 'profils/sejour.md' },
    kitchen: { id: 'KITCHEN', maturity: 'C4', version: '2026-09-01', source: 'profils/cuisine.md' },
    bedroom: { id: 'BEDROOM', maturity: 'C4', version: '2026-08-31', source: 'profils/chambre.md' },
    bath: { id: 'BATHROOM', maturity: 'C2', version: '2026-08-26', source: 'profils/salle-eau.md' },
    wc: { id: 'TOILET_SEPARATE', maturity: 'C4', version: '2026-08-26', source: 'profils/wc-separe.md' },
    circulation: { id: 'CIRCULATION', maturity: 'C4', version: '2026-09-01', source: 'profils/circulation.md' },
    entry: { id: 'ENTRY_THRESHOLD', maturity: 'C4', version: '2026-09-01', source: 'profils/entree.md' },
    storage: { id: 'STORAGE', maturity: 'C4', version: '2026-09-01', source: 'profils/rangements.md' },
    bureau: { id: 'BUREAU', maturity: 'C4', version: '2026-09-24', source: 'profils/bureau.md' },
    bath_wc: { id: 'BATHROOM_WITH_TOILET', maturity: 'C4', version: '2026-08-26', source: 'profils/salle-eau-wc-integre.md' }
  });

  function clone(value) {
    if (Array.isArray(value)) return value.map(clone);
    if (!value || typeof value !== 'object') return value;
    var output = {};
    Object.keys(value).forEach(function (key) { output[key] = clone(value[key]); });
    return output;
  }

  function freezeRecord(kind, fields) {
    return Object.freeze(Object.assign({ kind: kind, contractVersion: CONTRACT_VERSION }, fields));
  }

  function deepFreezeClone(value) {
    if (Array.isArray(value)) return Object.freeze(value.map(deepFreezeClone));
    if (!value || typeof value !== 'object') return value;
    var output = {};
    Object.keys(value).forEach(function (key) { output[key] = deepFreezeClone(value[key]); });
    return Object.freeze(output);
  }

  function profileManifest(program, plan) {
    var selected = {};
    function add(key) {
      var profile = PROFILE_REGISTRY[key];
      if (profile) selected[profile.id] = clone(profile);
    }
    var programRooms = (program && program.rooms) || [];
    programRooms.forEach(function (room) {
      add(room.type);
      (room.composedWith || []).forEach(function (type) {
        if (room.type === 'bath' && type === 'wc') add('bath_wc');
        else add(type);
      });
    });
    // Tout logement généré possède un seuil d'entrée, même lorsque cette
    // fonction est hébergée par le séjour et ne devient pas une pièce.
    if (programRooms.length) add('entry');
    // La penderie requise de chaque chambre est un STORAGE_UNIT ; une
    // circulation peut céder une STORAGE_BAY. Le manifeste doit donc enrôler
    // le profil avant la géométrie et non découvrir ses règles après coup.
    if (programRooms.some(function (room) {
      return room.type === 'bedroom' || room.type === 'circulation';
    })) add('storage');
    ((plan && plan.rooms) || []).forEach(function (room) {
      if ((room.parts || []).some(function (part) { return part.role === 'storage'; })) add('storage');
    });
    return Object.freeze(Object.keys(selected).sort().map(function (id) {
      return Object.freeze(selected[id]);
    }));
  }

  function profileMaturity(profiles) {
    if (!profiles || !profiles.length) return 'C0';
    return profiles.reduce(function (lowest, profile) {
      return Number(profile.maturity.slice(1)) < Number(lowest.slice(1)) ? profile.maturity : lowest;
    }, 'C6');
  }

  function canonicalValueManifest(profiles) {
    var registry = root.TechnoHabCanonicalValues;
    if (!registry) return Object.freeze([]);
    return Object.freeze(registry.referencesForProfiles(profiles || []));
  }

  function intent(options, variant, seed) {
    return freezeRecord('Intent', {
      options: Object.freeze(clone(options || {})),
      variant: Number.isFinite(variant) ? variant : 1,
      seed: Number.isFinite(seed) ? seed >>> 0 : null
    });
  }

  function program(rawProgram, profiles) {
    if (!rawProgram || !Array.isArray(rawProgram.rooms)) throw new TypeError('Program exige une liste de pièces.');
    var usedProfiles = profiles || profileManifest(rawProgram);
    return freezeRecord('Program', {
      options: Object.freeze(clone(rawProgram.options || {})),
      construction: Object.freeze(clone(rawProgram.construction || {})),
      rooms: Object.freeze(clone(rawProgram.rooms)),
      requiredAdjacencies: Object.freeze(clone(rawProgram.desiredEdges || [])),
      adjacencyRequirements: Object.freeze(clone(rawProgram.adjacencies || rawProgram.desiredEdges || [])),
      minimumArea: rawProgram.minimumTotal,
      profiles: usedProfiles,
      maturity: profileMaturity(usedProfiles),
      canonicalValueSchemaVersion: root.TechnoHabCanonicalValues ? root.TechnoHabCanonicalValues.schemaVersion : null,
      canonicalValues: canonicalValueManifest(usedProfiles)
    });
  }

  function topologyCandidate(plan, strategy) {
    if (!plan || !Array.isArray(plan.rooms)) throw new TypeError('TopologyCandidate exige une géométrie de pièces.');
    return freezeRecord('TopologyCandidate', {
      strategy: strategy || plan.topologyStrategy || 'non-renseignee',
      attempt: plan.candidate || 1,
      score: Number.isFinite(plan.score) ? plan.score : null,
      family: plan.topologyFamily || null,
      branches: Number.isFinite(plan.topologyBranches) ? plan.topologyBranches : null,
      transform: plan.topologyTransform || null,
      equivalenceClass: plan.topologyEquivalenceClass || null,
      transformationsAvailable: Number.isFinite(plan.topologyTransformationsAvailable)
        ? plan.topologyTransformationsAvailable : null,
      terminationMethod: plan.topologyTerminationMethod || 'none',
      terminations: Object.freeze(clone(plan.topologyTerminations || [])),
      candidatesCompared: Number.isFinite(plan.topologyCandidatesCompared) ? plan.topologyCandidatesCompared : null,
      strategiesCompared: Object.freeze(clone(plan.topologyStrategiesCompared || [])),
      boundary: Object.freeze(clone(plan.boundary || {})),
      rooms: Object.freeze(plan.rooms.map(function (room) {
        return Object.freeze({ id: room.id, type: room.type, parts: clone(room.parts || []) });
      })),
      adjacencies: Object.freeze(clone(plan.edges || []))
    });
  }

  function builtPlan(plan, profiles) {
    if (!plan || !Array.isArray(plan.rooms) || !plan.boundary) {
      throw new TypeError('BuiltPlan exige un plan construit complet.');
    }
    var usedProfiles = profiles || Object.freeze([]);
    return freezeRecord('BuiltPlan', {
      plan: plan,
      profiles: usedProfiles,
      maturity: profileMaturity(usedProfiles),
      canonicalValueSchemaVersion: root.TechnoHabCanonicalValues ? root.TechnoHabCanonicalValues.schemaVersion : null,
      canonicalValues: canonicalValueManifest(usedProfiles)
    });
  }

  function verdict(report) {
    var summary = report && report.summary ? report.summary : {};
    var hard = Number(summary.hard || 0);
    return freezeRecord('Verdict', {
      evaluated: Boolean(report),
      valid: Boolean(report) && hard === 0,
      hard: hard,
      guideline: Number(summary.guideline || 0),
      violations: Object.freeze(clone((report && report.violations) || [])),
      limits: Object.freeze(clone((report && report.limites) || [])),
      report: report || null
    });
  }

  function failure(code, stage, message, details) {
    return Object.freeze({
      code: code,
      stage: stage,
      message: message,
      details: details ? Object.freeze(clone(details)) : null
    });
  }

  function generationResult(fields) {
    if (!fields || Object.values(STATUSES).indexOf(fields.status) === -1) {
      throw new TypeError('GenerationResult porte un statut M1 connu.');
    }
    if (fields.status === STATUSES.VALID && (!fields.builtPlan || !fields.verdict || !fields.verdict.valid)) {
      throw new TypeError('VALID exige un BuiltPlan et un Verdict valide.');
    }
    if ((fields.status === STATUSES.IMPOSSIBLE || fields.status === STATUSES.NON_TROUVE) && fields.builtPlan) {
      throw new TypeError(fields.status + ' ne peut pas transporter de BuiltPlan.');
    }
    return freezeRecord('GenerationResult', {
      status: fields.status,
      intent: fields.intent,
      program: fields.program || null,
      topologyCandidate: fields.topologyCandidate || null,
      builtPlan: fields.builtPlan || null,
      verdict: fields.verdict || null,
      failure: fields.failure || null
    });
  }

  function planSelection(fields) {
    if (!fields || !Number.isFinite(fields.requested) || !Array.isArray(fields.results)) {
      throw new TypeError('PlanSelection exige un nombre demandé et une liste de résultats.');
    }
    if (['COMPLETE', 'PARTIAL', 'EMPTY'].indexOf(fields.status) < 0) {
      throw new TypeError('PlanSelection porte un statut connu.');
    }
    if (fields.results.some(function (result) {
      return !result || result.status !== STATUSES.VALID || !result.builtPlan || !result.verdict.valid;
    })) throw new TypeError('PlanSelection ne transporte que des GenerationResult VALID.');
    return freezeRecord('PlanSelection', {
      status: fields.status,
      requested: fields.requested,
      complete: fields.status === 'COMPLETE',
      method: fields.method,
      attempts: fields.attempts,
      results: Object.freeze(fields.results.slice()),
      rejected: Object.freeze(clone(fields.rejected || {})),
      diversity: Object.freeze(clone(fields.diversity || {}))
    });
  }

  function programResolution(fields) {
    if (!fields || Object.values(RESOLUTION_STATUSES).indexOf(fields.status) < 0) {
      throw new TypeError('ProgramResolution porte un statut connu.');
    }
    if (!fields.requestedIntent || fields.requestedIntent.kind !== 'Intent'
      || !fields.requestedProgram || fields.requestedProgram.kind !== 'Program') {
      throw new TypeError('ProgramResolution exige la demande Intent + Program d’origine.');
    }
    if (!Array.isArray(fields.changes) || !Array.isArray(fields.attempts)) {
      throw new TypeError('ProgramResolution exige les listes changes et attempts.');
    }
    fields.changes.forEach(function (item) {
      if (!item || typeof item.field !== 'string'
        || !Object.prototype.hasOwnProperty.call(item, 'from')
        || !Object.prototype.hasOwnProperty.call(item, 'to')
        || typeof item.reason !== 'string'
        || CHANGE_SEVERITIES.indexOf(item.severity) < 0) {
        throw new TypeError('Chaque concession doit être structurée et qualifiée.');
      }
    });
    fields.attempts.forEach(function (attempt) {
      if (!attempt || RESOLUTION_LEVELS.indexOf(attempt.level) < 0
        || !Number.isFinite(attempt.variant)
        || !(attempt.seed === null || Number.isFinite(attempt.seed))
        || Object.values(STATUSES).indexOf(attempt.status) < 0
        || !(attempt.failureCode === null || typeof attempt.failureCode === 'string')) {
        throw new TypeError('Chaque tentative de résolution doit être rejouable et porter un statut M1.');
      }
    });

    var resolvedIntent = fields.resolvedIntent || null;
    var resolvedProgram = fields.resolvedProgram || null;
    var result = fields.result || null;
    var level = fields.level || null;

    if (fields.status === RESOLUTION_STATUSES.EXACT) {
      if (level !== 'R0_EXACT' || fields.changes.length !== 0
        || !resolvedIntent || resolvedIntent.kind !== 'Intent'
        || !resolvedProgram || resolvedProgram.kind !== 'Program'
        || !result || result.status !== STATUSES.VALID) {
        throw new TypeError('EXACT exige R0, zéro concession et un résultat VALID pour le programme demandé.');
      }
    } else if (fields.status === RESOLUTION_STATUSES.RELAXED) {
      if (RESOLUTION_LEVELS.indexOf(level) < 1 || fields.changes.length === 0
        || !resolvedIntent || resolvedIntent.kind !== 'Intent'
        || !resolvedProgram || resolvedProgram.kind !== 'Program'
        || !result || result.status !== STATUSES.VALID) {
        throw new TypeError('RELAXED exige un niveau de repli, des concessions et un résultat VALID.');
      }
    } else if (level !== null || fields.changes.length !== 0
      || resolvedIntent !== null || resolvedProgram !== null || result !== null) {
      throw new TypeError('UNRESOLVED ne présente ni programme résolu, ni concession, ni résultat.');
    }

    if (result && (result.intent !== resolvedIntent || result.program !== resolvedProgram)) {
      throw new TypeError('Le résultat doit servir exactement l’Intent et le Program résolus.');
    }

    return freezeRecord('ProgramResolution', {
      status: fields.status,
      requestedIntent: fields.requestedIntent,
      requestedProgram: fields.requestedProgram,
      resolvedIntent: resolvedIntent,
      resolvedProgram: resolvedProgram,
      level: level,
      changes: deepFreezeClone(fields.changes),
      attempts: deepFreezeClone(fields.attempts),
      result: result
    });
  }

  function resolvedSelection(fields) {
    if (!fields || !fields.resolution || fields.resolution.kind !== 'ProgramResolution') {
      throw new TypeError('ResolvedSelection exige un ProgramResolution.');
    }
    if (!Number.isInteger(fields.generatedAttempts) || fields.generatedAttempts < 0
      || typeof fields.reusedResult !== 'boolean') {
      throw new TypeError('ResolvedSelection doit publier son coût et le réemploi du résultat résolu.');
    }
    var selection = fields.selection || null;
    if (fields.resolution.status === RESOLUTION_STATUSES.UNRESOLVED) {
      if (selection !== null || fields.reusedResult || fields.generatedAttempts !== 0) {
        throw new TypeError('Une résolution UNRESOLVED ne peut produire de sélection.');
      }
    } else {
      if (!selection || selection.kind !== 'PlanSelection' || !fields.reusedResult
        || selection.attempts !== fields.generatedAttempts + 1) {
        throw new TypeError('Une résolution servie exige une PlanSelection qui réemploie son premier résultat.');
      }
      var resolvedProgram = JSON.stringify(fields.resolution.resolvedProgram);
      if (selection.results.some(function (result) {
        return !result.program || JSON.stringify(result.program) !== resolvedProgram;
      })) {
        throw new TypeError('Tous les plans sélectionnés doivent servir le Program résolu.');
      }
    }
    return freezeRecord('ResolvedSelection', {
      resolution: fields.resolution,
      selection: selection,
      reusedResult: fields.reusedResult,
      generatedAttempts: fields.generatedAttempts
    });
  }

  root.TechnoHabContracts = Object.freeze({
    version: CONTRACT_VERSION,
    statuses: STATUSES,
    resolutionStatuses: RESOLUTION_STATUSES,
    resolutionLevels: RESOLUTION_LEVELS,
    changeSeverities: CHANGE_SEVERITIES,
    profiles: PROFILE_REGISTRY,
    profileManifest: profileManifest,
    profileMaturity: profileMaturity,
    canonicalValueManifest: canonicalValueManifest,
    intent: intent,
    program: program,
    topologyCandidate: topologyCandidate,
    builtPlan: builtPlan,
    verdict: verdict,
    failure: failure,
    generationResult: generationResult,
    planSelection: planSelection,
    programResolution: programResolution,
    resolvedSelection: resolvedSelection
  });
})(typeof globalThis !== 'undefined' ? globalThis : this);
