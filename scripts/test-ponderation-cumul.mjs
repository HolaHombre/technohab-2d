/* Cumul des modes — décision du 24 septembre 2026, suite à la revue de
   PONDERATION_AGENCEMENT.md : compact, lumineux et économie sont des
   préférences indépendantes, portant sur des critères de score distincts.
   Rien n'imposait qu'elles s'excluent — c'était une limite de l'interface
   (radios) et de `normalizeOptions()` (chaîne unique), pas du modèle.

   Ce test prouve la non-interférence, pas la coïncidence : au lieu de
   chercher une graine où deux critères se déclenchent par hasard sur un
   même plan généré — non reproductible d'une exécution à l'autre, la
   recherche étant bornée par un budget — il construit une géométrie où le
   déclenchement est déterministe, comme les tests §3.1 à §3.4. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const assets = join(dirname(fileURLToPath(import.meta.url)), '..', 'assets');
for (const file of [
  'canonical-values.data.js', 'canonical-values.js', 'fit.data.js', 'contracts.js',
  'construction.js', 'typologie.js', 'squelette.js', 'placement.js', 'generator.js', 'rules.js'
]) {
  vm.runInThisContext(fs.readFileSync(join(assets, file), 'utf8'));
}

const G = globalThis.TechnoHabGenerator;

/* 1. normalizeOptions() accepte le nouveau tableau, l'ancienne chaîne, et
      un repli propre si rien n'est valide. --------------------------------- */
assert.deepEqual(G.buildProgram({ priorities: ['light', 'compact'] }).options.priorities,
  ['light', 'compact'], 'le tableau doit être repris tel quel, ordre compris');
assert.deepEqual(G.buildProgram({ priority: 'economy' }).options.priorities, ['economy'],
  'la chaîne historique doit rester acceptée, encapsulée dans un tableau à un élément');
assert.deepEqual(G.buildProgram({ priorities: ['inconnu'] }).options.priorities, ['compact'],
  'une liste sans valeur valide doit replier sur compact, comme avant');
assert.deepEqual(G.buildProgram({ priorities: ['compact', 'compact'] }).options.priorities,
  ['compact'], 'un doublon ne doit pas compter deux fois');
assert.equal(G.buildProgram({ priorities: ['light', 'compact'] }).options.priority, 'light',
  'la priorité primaire (enveloppe, découpe) reste la première sélectionnée');

/* 2. Deux critères de score portés par la même fonction, économie et
      lumière, s'additionnent sans s'exclure. ------------------------------- */
const program = G.buildProgram({
  surface: 90, bedrooms: 2, bathrooms: 1, separateKitchen: true, includeWc: true,
  priorities: ['light', 'economy']
});
const envelope = { width: 20, height: 20, volumes: [{ x: 0, y: 0, width: 20, height: 20 }] };
// Séjour à façade courte (déclenche light, cf. test-ponderation-lumiere.mjs)
// et trois arêtes déclarées (déclenche economy, proportionnel à edges.length).
const boxes = [{ id: 'living', type: 'living', x0: 5, y0: 0, x1: 6, y1: 1 }];
const edges = [{ a: 'living', b: 'kitchen', contact: 1 }, { a: 'living', b: 'bath_1', contact: 1 }];
const combined = G.scoreCandidateDetails(boxes, edges, program, envelope);
assert.ok(combined.breakdown.lightPriority > 0, 'lumière doit peser dans un calcul cumulé');
assert.ok(combined.breakdown.economyPriority > 0, 'économie doit peser dans le même calcul cumulé');

const lightOnlyProgram = G.buildProgram(Object.assign({}, program.options, { priorities: ['light'] }));
const lightOnly = G.scoreCandidateDetails(boxes, edges, lightOnlyProgram, envelope);
assert.equal(combined.breakdown.lightPriority, lightOnly.breakdown.lightPriority,
  'la présence d’economy ne doit rien changer au calcul de lightPriority — critères indépendants');

/* 3. Le mécanisme compact (§3.1/§3.2, dans validatePlanUsage) ne dépend
      que de sa propre présence dans `priorities`, pas de ce qui l'accompagne.
      Prouvé sur le code, pas sur une coïncidence de recherche : deux plans
      identiques par ailleurs, l'un avec `light` en plus, l'autre sans. ----- */
const options = {
  surface: 130, bedrooms: 2, bathrooms: 1, separateKitchen: true, includeWc: true,
  shape: 'rectangle'
};
const seul = G.generateResult(Object.assign({}, options, { priorities: ['compact'] }), 1);
const cumule = G.generateResult(Object.assign({}, options, { priorities: ['compact', 'light'] }), 1);
assert.equal(seul.builtPlan.plan.compactObjective.active, true);
assert.equal(cumule.builtPlan.plan.compactObjective.active, true,
  'compact doit rester actif quand il est cumulé avec light');
assert.deepEqual(cumule.builtPlan.plan.options.priorities, ['compact', 'light']);

console.log('Cumul des modes : normalizeOptions() accepte le tableau, '
  + 'les critères de score s’additionnent sans s’exclure — OK');
