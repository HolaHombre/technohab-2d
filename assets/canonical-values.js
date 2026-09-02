(function (root) {
  'use strict';

  var data = root.TechnoHabCanonicalValueData;
  if (!data) throw new Error('TechnoHabCanonicalValues exige canonical-values.data.js.');

  var LEVELS = ['N1', 'N2', 'N3', 'UNRESOLVED'];
  var KINDS = ['regulatory', 'normative', 'professional', 'doctrinal', 'unresolved'];
  var STATUSES = ['ADOPTED', 'PROVISIONAL', 'UNRESOLVED', 'RETIRED'];
  var RULE_LEVELS = ['HARD', 'GUIDELINE', 'PREFERENCE'];
  var QUANTITIES = ['length', 'area', 'dimensions-2d', 'ratio', 'count', 'score-weight'];
  var UNITS = ['m', 'm2', 'ratio', 'spaces', 'points-per-meter', 'points-per-requirement'];

  function isNonEmptyString(value) {
    return typeof value === 'string' && value.trim().length > 0;
  }

  function validateScope(scope, path, errors) {
    if (!scope || typeof scope !== 'object') {
      errors.push(path + '.scope est requise');
      return;
    }
    if (!Array.isArray(scope.roomProfiles) || !scope.roomProfiles.length) errors.push(path + '.scope.roomProfiles doit être non vide');
    if (!isNonEmptyString(scope.jurisdiction)) errors.push(path + '.scope.jurisdiction est requis');
    if (!Array.isArray(scope.buildingContext) || !scope.buildingContext.length) errors.push(path + '.scope.buildingContext doit être non vide');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(scope.validFrom || '')) errors.push(path + '.scope.validFrom doit être une date ISO');
  }

  function validateValue(value, index) {
    var path = 'values[' + index + ']';
    var errors = [];
    if (!/^VAL-[A-Z0-9-]+$/.test(value.id || '')) errors.push(path + '.id est invalide');
    if (!/^\d+\.\d+\.\d+$/.test(value.version || '')) errors.push(path + '.version est invalide');
    if (!isNonEmptyString(value.label)) errors.push(path + '.label est requis');
    if (QUANTITIES.indexOf(value.quantity) === -1) errors.push(path + '.quantity est inconnue');
    if (UNITS.indexOf(value.unit) === -1) errors.push(path + '.unit est inconnue');
    if (STATUSES.indexOf(value.status) === -1) errors.push(path + '.status est inconnu');
    if (RULE_LEVELS.indexOf(value.ruleLevel) === -1) errors.push(path + '.ruleLevel est inconnu');

    var dimensions = value.value && typeof value.value === 'object' && !Array.isArray(value.value);
    if (value.quantity === 'dimensions-2d') {
      if (!dimensions || !(value.value.width > 0) || !(value.value.depth > 0) || value.unit !== 'm') {
        errors.push(path + ' dimensions-2d exige {width, depth} positifs en m');
      }
    } else if (!(typeof value.value === 'number' && Number.isFinite(value.value) && value.value > 0)) {
      errors.push(path + '.value doit être un nombre positif');
    }
    if (value.quantity === 'area' && value.unit !== 'm2') errors.push(path + ' une aire exige l’unité m2');
    if (value.quantity === 'length' && value.unit !== 'm') errors.push(path + ' une longueur exige l’unité m');
    if (value.quantity === 'ratio' && value.unit !== 'ratio') errors.push(path + ' un ratio exige l’unité ratio');
    if (value.quantity === 'count' && value.unit !== 'spaces') errors.push(path + ' un compte exige une unité dénombrable');
    if (value.quantity === 'score-weight' && ['points-per-meter', 'points-per-requirement'].indexOf(value.unit) < 0) {
      errors.push(path + ' un poids de score exige une unité points-per-* connue');
    }

    var source = value.source || {};
    if (LEVELS.indexOf(source.level) === -1) errors.push(path + '.source.level est inconnu');
    if (KINDS.indexOf(source.kind) === -1) errors.push(path + '.source.kind est inconnu');
    if (!isNonEmptyString(source.reference)) errors.push(path + '.source.reference est requise');
    validateScope(value.scope, path, errors);

    if ((value.status === 'UNRESOLVED') !== (source.level === 'UNRESOLVED')) {
      errors.push(path + ' statut et source UNRESOLVED doivent coïncider');
    }
    if (value.ruleLevel === 'HARD' && (value.status === 'UNRESOLVED' || source.level === 'UNRESOLVED')) {
      errors.push(path + ' une valeur UNRESOLVED ne peut pas être HARD');
    }
    if (value.ruleLevel === 'HARD' && source.level === 'N3') {
      if (source.kind !== 'doctrinal') errors.push(path + ' une valeur HARD N3 doit être doctrinale');
      if (!isNonEmptyString(source.rationale)) errors.push(path + ' une valeur HARD N3 exige une justification');
    }
    return errors;
  }

  function validateRegistry(registry) {
    var errors = [];
    if (!registry || registry.schemaVersion !== '1.0') errors.push('schemaVersion doit valoir 1.0');
    if (!registry || !/^\d{4}-\d{2}-\d{2}$/.test(registry.version || '')) errors.push('version doit être une date ISO');
    if (!registry || !Array.isArray(registry.values)) return errors.concat(['values doit être une liste']);
    var seen = {};
    registry.values.forEach(function (value, index) {
      errors = errors.concat(validateValue(value, index));
      if (seen[value.id]) errors.push('identifiant dupliqué : ' + value.id);
      seen[value.id] = true;
    });
    return errors;
  }

  var validationErrors = validateRegistry(data);
  if (validationErrors.length) throw new Error('Registre canonique invalide :\n' + validationErrors.join('\n'));

  var byId = {};
  data.values.forEach(function (value) { byId[value.id] = value; });

  function get(id) {
    return byId[id] || null;
  }

  function forProfiles(profiles) {
    var selected = {};
    (profiles || []).forEach(function (profile) { selected[typeof profile === 'string' ? profile : profile.id] = true; });
    return data.values.filter(function (value) {
      return value.status !== 'RETIRED' && value.scope.roomProfiles.some(function (profile) { return selected[profile]; });
    });
  }

  function referencesForProfiles(profiles) {
    return forProfiles(profiles).map(function (value) {
      return Object.freeze({ id: value.id, version: value.version });
    });
  }

  root.TechnoHabCanonicalValues = Object.freeze({
    schemaVersion: data.schemaVersion,
    version: data.version,
    values: Object.freeze(data.values.slice()),
    get: get,
    forProfiles: forProfiles,
    referencesForProfiles: referencesForProfiles,
    validate: validateRegistry
  });
})(typeof globalThis !== 'undefined' ? globalThis : this);
