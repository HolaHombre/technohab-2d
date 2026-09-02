(function (root) {
  'use strict';

  /* M5.2a — politique pure de rétrogradation du programme.

     Le module produit des options candidates cumulatives et leur trace. Il ne
     construit aucun Program et ne lance aucune recherche géométrique. */

  var data = root.TechnoHabRelaxationData;
  if (!data) throw new Error('relaxation.js exige relaxation.data.js.');

  function clone(value) {
    if (Array.isArray(value)) return value.map(clone);
    if (!value || typeof value !== 'object') return value;
    var output = {};
    Object.keys(value).forEach(function (key) { output[key] = clone(value[key]); });
    return output;
  }

  function deepFreeze(value) {
    if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
    Object.keys(value).forEach(function (key) { deepFreeze(value[key]); });
    return Object.freeze(value);
  }

  function sameValue(left, right) {
    return left === right || (Number.isNaN(left) && Number.isNaN(right));
  }

  function change(field, from, to, mutation) {
    return {
      field: field,
      from: clone(from),
      to: clone(to),
      reason: mutation.reason,
      severity: mutation.severity
    };
  }

  function applyDeclaredMutation(options, mutation) {
    var before = options[mutation.field];
    var after;

    if (mutation.operation === 'set-when-true') {
      if (before !== true) return null;
      after = mutation.value;
    } else if (mutation.operation === 'cap-number') {
      if (!Number.isFinite(before) || before <= mutation.value) return null;
      after = mutation.value;
    } else if (mutation.operation === 'decrement-number') {
      if (!Number.isFinite(before) || before <= mutation.minimum) return null;
      after = Math.max(mutation.minimum, before - mutation.amount);
    } else {
      return null;
    }

    if (sameValue(before, after)) return null;
    options[mutation.field] = after;
    return change(mutation.field, before, after, mutation);
  }

  function firstRelaxable(options, context) {
    var declared = context && Array.isArray(context.relaxableFunctions)
      ? context.relaxableFunctions : [];
    return declared.filter(function (item) {
      if (!item || item.relaxable !== true || typeof item.field !== 'string') return false;
      var activeValue = Object.prototype.hasOwnProperty.call(item, 'activeValue')
        ? item.activeValue : true;
      return sameValue(options[item.field], activeValue);
    }).slice().sort(function (left, right) {
      var leftPriority = Number.isFinite(left.relaxationPriority) ? left.relaxationPriority : Infinity;
      var rightPriority = Number.isFinite(right.relaxationPriority) ? right.relaxationPriority : Infinity;
      if (leftPriority !== rightPriority) return leftPriority - rightPriority;
      return String(left.id || left.field).localeCompare(String(right.id || right.field));
    })[0] || null;
  }

  function applyRelaxableMutation(options, mutation, context) {
    var selected = firstRelaxable(options, context);
    if (!selected) return null;
    var before = options[selected.field];
    var after = Object.prototype.hasOwnProperty.call(selected, 'inactiveValue')
      ? selected.inactiveValue : false;
    if (sameValue(before, after)) return null;
    options[selected.field] = clone(after);
    return change(selected.field, before, after, {
      reason: selected.reason || mutation.reason,
      severity: mutation.severity
    });
  }

  function candidates(rawOptions, context) {
    var currentOptions = clone(rawOptions || {});
    var cumulativeChanges = [];
    var output = [];

    data.levels.forEach(function (level) {
      if (level.id === 'R0_EXACT') {
        output.push({
          level: level.id,
          options: clone(currentOptions),
          changes: []
        });
        return;
      }

      var levelChanges = [];
      level.mutations.forEach(function (mutation) {
        var applied = mutation.operation === 'remove-first-relaxable'
          ? applyRelaxableMutation(currentOptions, mutation, context)
          : applyDeclaredMutation(currentOptions, mutation);
        if (applied) levelChanges.push(applied);
      });
      if (!levelChanges.length) return;

      cumulativeChanges = cumulativeChanges.concat(levelChanges);
      output.push({
        level: level.id,
        options: clone(currentOptions),
        changes: clone(cumulativeChanges)
      });
    });

    return deepFreeze(output);
  }

  root.TechnoHabRelaxation = Object.freeze({
    version: data.version,
    attemptsPerLevel: data.attemptsPerLevel,
    levels: Object.freeze(data.levels.map(function (level) { return level.id; })),
    changeSeverities: data.changeSeverities,
    candidates: candidates
  });
})(typeof globalThis !== 'undefined' ? globalThis : this);
