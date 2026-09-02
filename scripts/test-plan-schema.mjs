/* M0 — le schéma d'export est exécutable sans dépendance de validation. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const schema = JSON.parse(readFileSync(join(root, 'PLAN_SCHEMA.json'), 'utf8'));
['canonical-values.data.js', 'canonical-values.js', 'fit.data.js', 'placement.js', 'contracts.js', 'construction.js', 'typologie.js', 'squelette.js', 'generator.js', 'rules.js']
  .forEach((file) => new Function(readFileSync(join(root, 'assets', file), 'utf8'))());

function resolve(reference) {
  assert.ok(reference.startsWith('#/'), 'seules les références locales sont admises dans PLAN_SCHEMA.json');
  return reference.slice(2).split('/').reduce((value, key) => value[key], schema);
}

function typeMatches(value, expected) {
  if (expected === 'null') return value === null;
  if (expected === 'array') return Array.isArray(value);
  if (expected === 'object') return value !== null && typeof value === 'object' && !Array.isArray(value);
  if (expected === 'number') return typeof value === 'number' && Number.isFinite(value);
  return typeof value === expected;
}

function validate(value, rule, path = '$', errors = []) {
  if (rule.$ref) return validate(value, resolve(rule.$ref), path, errors);
  if (rule.const !== undefined && value !== rule.const) errors.push(path + ' doit valoir ' + JSON.stringify(rule.const));
  if (rule.enum && !rule.enum.includes(value)) errors.push(path + ' doit appartenir à ' + JSON.stringify(rule.enum));
  if (rule.type) {
    const types = Array.isArray(rule.type) ? rule.type : [rule.type];
    if (!types.some((type) => typeMatches(value, type))) {
      errors.push(path + ' doit être de type ' + types.join('|'));
      return errors;
    }
  }
  if (typeof value === 'number') {
    if (rule.minimum !== undefined && value < rule.minimum) errors.push(path + ' est sous son minimum');
    if (rule.exclusiveMinimum !== undefined && value <= rule.exclusiveMinimum) errors.push(path + ' est sous son minimum exclusif');
  }
  if (typeof value === 'string' && rule.format === 'date-time' && Number.isNaN(Date.parse(value))) {
    errors.push(path + ' n’est pas une date ISO valide');
  }
  if (Array.isArray(value)) {
    if (rule.minItems !== undefined && value.length < rule.minItems) errors.push(path + ' contient trop peu d’éléments');
    if (rule.maxItems !== undefined && value.length > rule.maxItems) errors.push(path + ' contient trop d’éléments');
    if (rule.items) value.forEach((item, index) => validate(item, rule.items, path + '[' + index + ']', errors));
  } else if (value !== null && typeof value === 'object') {
    for (const key of rule.required || []) {
      if (!Object.prototype.hasOwnProperty.call(value, key)) errors.push(path + '.' + key + ' est requis');
    }
    for (const [key, child] of Object.entries(rule.properties || {})) {
      if (Object.prototype.hasOwnProperty.call(value, key)) validate(value[key], child, path + '.' + key, errors);
    }
    if (rule.additionalProperties === false) {
      for (const key of Object.keys(value)) {
        if (!Object.prototype.hasOwnProperty.call(rule.properties || {}, key)) errors.push(path + '.' + key + ' est interdit');
      }
    }
  }
  return errors;
}

assert.equal(schema.$schema, 'https://json-schema.org/draft/2020-12/schema');
const generator = globalThis.TechnoHabGenerator;
const rules = globalThis.TechnoHabRules;
const generation = generator.generateResult({
  surface: 90, bedrooms: 3, bathrooms: 1,
  separateKitchen: true, includeWc: true, shape: 'lShape'
}, 1, 0x5EED1234);
assert.ok(generation.builtPlan, 'le scénario du schéma doit produire un BuiltPlan');
const plan = generation.builtPlan.plan;
assert.ok(plan.profiles.length > 0, 'un export M1 annonce la maturité de ses profils');
assert.ok(plan.canonicalValues.length > 0, 'un export annonce les valeurs canoniques consommées');
const resolutionTrace = {
  status: 'EXACT',
  level: 'R0_EXACT',
  requestedProgram: generation.program,
  resolvedProgram: generation.program,
  changes: [],
  attempts: [{
    level: 'R0_EXACT', variant: generation.intent.variant, seed: generation.intent.seed,
    status: 'VALID', failureCode: null
  }],
  consent: { required: false, accepted: true, method: 'not-required', acceptedAt: null }
};
const document = generator.exportDocument(plan, rules.evaluatePlan(plan), 'm0', resolutionTrace);
const errors = validate(document, schema);
assert.deepEqual(errors, [], 'l’export généré doit satisfaire PLAN_SCHEMA.json :\n' + errors.join('\n'));
assert.equal(document.programResolution.status, 'EXACT');
assert.equal(document.programResolution.consent.accepted, true);

const broken = structuredClone(document);
delete broken.plan.rooms[0].usablePolygon;
assert.ok(validate(broken, schema).some((error) => error.includes('usablePolygon')),
  'le validateur doit détecter un champ requis absent');

const refused = structuredClone(document);
refused.programResolution.consent.accepted = false;
assert.ok(validate(refused, schema).some((error) => error.includes('accepted')),
  'un export actif ne peut pas porter un consentement refusé');

console.log('Schéma : PLAN_SCHEMA 3.1 valide, résolution et consentement exportés.');
