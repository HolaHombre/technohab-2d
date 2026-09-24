/* PONDERATION §3.1 et §3.2 — compact favorise le petit équipement et
   pénalise le dégagement généreux. Deux mécanismes, une seule donnée
   nouvelle demandée au moteur : aucune. §3.1 relit `sizeId` vs `equipmentId`,
   déjà distincts dès que resolveSize() monte en gamme. §3.2 relit
   `clearanceTotals.comfortMet`, déjà calculé pour la pénalité inverse
   (comfort manqué) que le mode normal applique. Ce test prouve :

     1. hors mode compact, aucun des deux ne coûte rien ;
     2. en mode compact, l'objectif de confort s'INVERSE : ce qui coûtait
        de le manquer coûte désormais de l'atteindre — les deux ne
        coexistent jamais, sous peine de pénaliser toute pose ;
     3. un équipement monté en gamme (ex. bed_140 → bed_160) coûte en
        compact, et pas ailleurs ;
     4. les deux poids restent des préférences, sous celui d'une adjacence
        de circulation demandée. */
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
// Surface assez grande pour garantir une montée en gamme (bed_140 → bed_160
// dès 12 m², sofa dès son propre seuil) et des dégagements confortables.
const options = {
  surface: 130, bedrooms: 2, bathrooms: 1, separateKitchen: true, includeWc: true,
  shape: 'rectangle'
};

const compact = G.generateResult(Object.assign({}, options, { priority: 'compact' }), 1);
const light = G.generateResult(Object.assign({}, options, { priority: 'light' }), 1);
assert.equal(compact.status, 'VALID');
assert.equal(light.status, 'VALID');
const planCompact = compact.builtPlan.plan;
const planLight = light.builtPlan.plan;

/* 1. Hors compact, les deux mécanismes sont inertes ---------------------- */
assert.equal(planLight.compactObjective.active, false, 'inactif hors mode compact');
assert.equal(planLight.scoreBreakdown.compactOversize, undefined,
  'aucun malus de gamme hors compact');
assert.equal(planLight.scoreBreakdown.compactComfort, undefined,
  'aucun malus de confort hors compact');

/* 2. En compact, l'objectif de confort s'inverse, jamais ne s'additionne - */
assert.equal(planCompact.compactObjective.active, true);
assert.equal(planCompact.scoreBreakdown.usageComfort, undefined,
  'le mode compact ne doit jamais porter les deux sens du même critère : ' +
  'la pénalité « confort manqué » du mode normal doit être neutralisée');
if (planCompact.compactObjective.comfortAchieved > 0) {
  assert.ok(planCompact.scoreBreakdown.compactComfort > 0,
    'du confort atteint doit coûter en mode compact');
}

/* 3. Un équipement monté en gamme coûte, et seulement en compact --------- */
const montee = planCompact.rooms.some((room) =>
  (room.placements || []).some((pose) => pose.sizeId !== pose.equipmentId));
if (montee) {
  assert.ok(planCompact.compactObjective.oversizedCount > 0);
  assert.ok(planCompact.scoreBreakdown.compactOversize > 0,
    'une montée en gamme détectée doit porter un malus en compact');
}
assert.equal(planLight.compactObjective.oversizedCount === 0
  || planLight.scoreBreakdown.compactOversize === undefined, true,
  'une montée en gamme éventuelle ne doit jamais coûter hors compact');

/* 4. Poids sous une adjacence de circulation demandée --------------------- */
const registry = globalThis.TechnoHabCanonicalValues;
const poidsOversize = registry.get('VAL-SCORE-COMPACT-OVERSIZE-WEIGHT-001').value;
const poidsComfort = registry.get('VAL-SCORE-COMPACT-COMFORT-WEIGHT-001').value;
const poidsFacadeCirculation = registry.get('VAL-CIRC-FACADE-EXCESS-WEIGHT-001').value;
assert.ok(poidsOversize < poidsFacadeCirculation);
assert.ok(poidsComfort < poidsFacadeCirculation);

console.log('PONDERATION §3.1/§3.2 : compact inverse le confort et pénalise la gamme — OK '
  + '(oversized=' + planCompact.compactObjective.oversizedCount
  + ', comfortAchieved=' + planCompact.compactObjective.comfortAchieved
  + ', compactComfortCost=' + planCompact.compactObjective.comfortCost + ')');
