/* C-P0 — preuve C4 isolée des deux profils pilotes. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
['socle.data.js', 'room-model.js', 'placement.js'].forEach((file) => {
  new Function(readFileSync(join(root, 'assets', file), 'utf8'))();
});

const reference = JSON.parse(readFileSync(join(root, 'scripts/references/C_P0_ENVELOPES.json'), 'utf8'));
const model = globalThis.TechnoHabRoomModel;
const placement = globalThis.TechnoHabPlacement;

function validate(designation, rectangle, blocked = []) {
  return placement.validate(designation.equipments, rectangle, {
    relations: designation.relations,
    // C-P0 versionne le domaine géométrique des équipements. La connexité
    // porte → usages est le contrat d'intégration M4, testé sur le BuiltPlan.
    s4: false,
    context: {
      openings: [{ x: 0.4, y: 0, width: 0.8, axis: 'horizontal', kind: 'door' }],
      blocked
    }
  });
}

/* 1. WC séparé : zones, seuils, extraction et limites ------------------- */

const wc = model.designate('wc', null, { area: 1.5, includeOptional: false });
assert.equal(wc.valid, true);
assert.ok(wc.services.includes('ventilation'), 'le WC déclare son extraction');
const pan = wc.equipments.find((equipment) => equipment.id === 'wc_pan');
assert.deepEqual(pan.usage, [
  { face: 'front', min: 0.6, target: 0.7, comfort: 0.8, width: 0.6 },
  { face: 'long', min: 0.2, target: 0.25, sides: 2 }
]);
assert.deepEqual(placement.envelope(wc.equipments), reference.profiles.TOILET_SEPARATE.base,
  'le domaine WC doit rester versionné');
assert.equal(validate(wc, { w: 0.8, h: 1.3 }).fits, true, '0,80 × 1,30 reçoit la cuvette et ses zones');
assert.equal(validate(wc, { w: 0.7, h: 1.3 }).fits, false, '0,70 m refuse les deux dégagements latéraux');
assert.equal(validate(wc, { w: 0.8, h: 1.2 }).fits, false, '1,20 m refuse le dégagement frontal minimal');

const inwardSwing = [{ x0: 0, y0: 0, x1: 0.8, y1: 0.8 }];
assert.equal(validate(wc, { w: 0.8, h: 1.3 }, inwardSwing).fits, false,
  'un battant intérieur qui condamne le WC est refusé');
assert.equal(validate(wc, { w: 0.8, h: 1.3 }).fits, true,
  'la même pièce reste accessible avec porte extérieure ou coulissante');

const wcMedium = model.designate('wc', null, { area: 1.3, includeOptional: true });
assert.ok(wcMedium.equipments.some((equipment) => equipment.id === 'handbasin'),
  'le cas moyen active le lave-mains à partir de 1,30 m²');

/* 2. Composition : absorption, relations, variantes et portes ----------- */

const composed = model.designate('bath', 'eau', { area: 5, integratedWc: true, includeOptional: true });
assert.deepEqual(composed.programs, ['bath', 'wc']);
assert.ok(composed.equipments.some((equipment) => equipment.id === 'wc_pan'));
assert.ok(!composed.equipments.some((equipment) => equipment.id === 'handbasin'),
  'le lavabo absorbe le lave-mains sans supprimer la fonction de lavage');
assert.deepEqual(composed.absorptions, [{ guest: 'handbasin', by: 'washbasin' }]);
assert.ok(composed.relations.some((relation) => relation.code === 'BATH-WC-WET-001'),
  'une relation peut traverser les deux programmes composés');

for (const variant of ['eau', 'bain']) {
  const designation = model.designate('bath', variant, {
    area: variant === 'eau' ? 3.4 : 4.2,
    integratedWc: true,
    includeOptional: false
  });
  const expected = reference.profiles.BATHROOM_WITH_TOILET[variant];
  assert.deepEqual(placement.envelope(designation.equipments), expected,
    'le domaine composé ' + variant + ' doit rester versionné');
}

const eau = model.designate('bath', 'eau', { area: 3.4, integratedWc: true, includeOptional: false });
assert.equal(validate(eau, { w: 1.4, h: 2.2 }).fits, true, 'la variante eau compacte doit passer');
assert.equal(validate(eau, { w: 1.1, h: 2.8 }).fits, false, 'la variante eau trop étroite doit être refusée');
assert.equal(validate(eau, { w: 1.4, h: 2.2 }, inwardSwing).fits, false,
  'le battant intérieur ne peut pas recouvrir les usages de la variante eau');

const bain = model.designate('bath', 'bain', { area: 4.2, integratedWc: true, includeOptional: false });
assert.equal(validate(bain, { w: 1.7, h: 2.1 }).fits, true, 'la variante bain compacte doit passer');
assert.equal(validate(bain, { w: 1.6, h: 2.1 }).fits, false, 'la variante bain sous son domaine doit être refusée');
assert.equal(validate(bain, { w: 1.7, h: 2.1 }, inwardSwing).fits, false,
  'le battant intérieur ne peut pas recouvrir les usages de la variante bain');

console.log('Profils C-P0 : WC et salle d’eau + WC éprouvés isolément · variantes, refus, ouvrant et accès vérifiés.');
