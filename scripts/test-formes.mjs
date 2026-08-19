/* Chantier 1 — la forme de l'enveloppe est une donnée du projet.
   Carré et rectangle ont un volume, le L en a deux, le U trois ; la découpe
   en guillotine travaille chaque volume, inchangée. Voir ROADMAP.md §5. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
['fit.data.js', 'generator.js', 'rules.js'].forEach(function (file) {
  new Function(readFileSync(join(root, 'assets', file), 'utf8'))();
});

const generator = globalThis.TechnoHabGenerator;
const rules = globalThis.TechnoHabRules;

const FORMES = { square: 1, rectangle: 1, lShape: 2, uShape: 3 };
const base = { surface: 110, bedrooms: 3, bathrooms: 1, separateKitchen: true, includeWc: true, priority: 'compact' };

/* 1. Chaque forme produit ses volumes et rien qu'eux -------------------- */

assert.equal(generator.normalizeOptions({ shape: 'patatoide' }).shape, 'rectangle',
  'une forme inconnue retombe sur le rectangle, elle n’invente rien');

const facades = {};
Object.keys(FORMES).forEach((shape) => {
  let facade = 0, plans = 0;
  for (let variante = 0; variante < 12; variante += 1) {
    const plan = generator.generatePlan({ ...base, shape }, variante, (variante * 7919 + 700) >>> 0);
    plans += 1;

    assert.equal(plan.boundary.demandee, shape, 'le plan garde trace de la forme demandée');
    assert.equal(plan.boundary.shape, shape,
      shape + ' doit être tenable à ' + base.surface + ' m², sans repli sur le rectangle');
    assert.equal(plan.boundary.degradee, false, 'aucun repli attendu à cette surface');
    assert.equal(plan.boundary.volumes.length, FORMES[shape],
      shape + ' doit compter ' + FORMES[shape] + ' volume(s)');

    // La surface bâtie est celle du projet, pas celle du rectangle englobant.
    const bati = plan.boundary.volumes.reduce((s, v) => s + (v.x1 - v.x0) * (v.y1 - v.y0), 0);
    assert.ok(Math.abs(bati - base.surface) < 0.05,
      shape + ' : la surface bâtie doit valoir la surface demandée, mesuré ' + bati.toFixed(2));
    const occupee = plan.rooms.reduce((s, room) => s + room.area, 0);
    assert.ok(Math.abs(occupee - base.surface) < 0.05,
      shape + ' : les pièces doivent couvrir toute l’enveloppe');

    // Aucune pièce dans l'encoche.
    plan.rooms.forEach((room) => {
      room.parts.forEach((part) => {
        const dedans = plan.boundary.volumes.some((v) =>
          part.x0 >= v.x0 - 0.02 && part.x1 <= v.x1 + 0.02 &&
          part.y0 >= v.y0 - 0.02 && part.y1 <= v.y1 + 0.02);
        assert.ok(dedans, shape + ' : ' + room.id + ' sort de l’enveloppe');
      });
    });

    assert.ok(plan.entree, shape + ' : un plan doit rester accessible');
    facade += plan.facades.reduce((s, segment) => s + segment.longueur, 0);
  }
  facades[shape] = facade / plans;
});

/* 2. L'encoche est extérieure : elle donne de la façade ------------------ */

assert.ok(facades.lShape > facades.rectangle * 1.05,
  'un L doit offrir plus de façade qu’un rectangle de même surface, mesuré ' +
  facades.lShape.toFixed(1) + ' contre ' + facades.rectangle.toFixed(1));
assert.ok(facades.uShape > facades.lShape,
  'un U doit en offrir plus encore, mesuré ' + facades.uShape.toFixed(1));

/* 3. La règle d'enveloppe attrape un débordement ------------------------- */

const regle = rules.rules.find((entry) => entry.id === 'TH2D-BOUNDARY-008');
assert.ok(regle, 'TH2D-BOUNDARY-008 doit exister');
assert.equal(regle.level, 'HARD', 'bâtir dans l’encoche n’est pas un conseil');
const enveloppe = { volumes: [{ x0: 0, y0: 0, x1: 8, y1: 5 }, { x0: 0, y0: 5, x1: 4, y1: 9 }] };
assert.equal(regle.evaluate({
  boundary: enveloppe,
  rooms: [{ id: 'living', label: 'Séjour', parts: [{ role: 'main', x0: 0, y0: 0, x1: 4, y1: 5 }] }]
}).length, 0, 'une pièce contenue dans un volume ne déclenche rien');
assert.equal(regle.evaluate({
  boundary: enveloppe,
  rooms: [{ id: 'living', label: 'Séjour', parts: [{ role: 'main', x0: 5, y0: 6, x1: 7, y1: 8 }] }]
}).length, 1, 'une pièce posée dans l’encoche doit être refusée');

/* 4. Une aile trop étroite n'est jamais produite, même sur un petit
      programme : la forme est refusée et rabattue sur le rectangle, ce que
      le plan dit au lieu de le taire. */

let plusEtroite = Infinity;
for (const shape of ['lShape', 'uShape']) {
  for (let variante = 0; variante < 10; variante += 1) {
    const plan = generator.generatePlan({ ...base, surface: 45, bedrooms: 1, shape }, variante, 4200 + variante);
    assert.equal(plan.boundary.demandee, shape, 'la forme demandée est conservée même en cas de repli');
    if (plan.boundary.degradee) {
      assert.equal(plan.boundary.shape, 'rectangle', 'le repli se fait sur le rectangle, pas sur une forme tierce');
      assert.equal(plan.boundary.volumes.length, 1, 'un rectangle n’a qu’un volume');
      continue;
    }
    plan.boundary.volumes.forEach((v) => {
      const petit = Math.min(v.x1 - v.x0, v.y1 - v.y0);
      plusEtroite = Math.min(plusEtroite, petit);
      // Une aile doit loger la plus étroite des pièces qui se vivent — la
      // salle d'eau, 1,70 m. En deçà, c'est un couloir avec une fenêtre.
      assert.ok(petit >= 1.7, shape + ' : une aile de ' + petit.toFixed(2) + ' m n’est pas une aile');
    });
  }
}

console.log('Formes : 4 enveloppes vérifiées · façade moyenne ' +
  Object.entries(facades).map(([k, v]) => k + ' ' + v.toFixed(1) + ' m').join(', ') +
  ' · aile la plus étroite à 45 m² : ' + plusEtroite.toFixed(2) + ' m.');
