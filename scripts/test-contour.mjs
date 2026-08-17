/* D2 — une pièce est une pièce : un seul contour, un seul volume à meubler.
   La découpe en parties est un moyen de production, pas une entité de plan.
   Voir ROADMAP.md §5.2. */
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
const sommets = (d) => (d.match(/[ML]/g) || []).length;

/* 1. Le contour ne montre que le pourtour ---------------------------------- */

assert.equal(sommets(generator.cheminContour([{ x0: 0, y0: 0, x1: 4, y1: 3 }])), 4,
  'un rectangle a quatre sommets');

const pavage = [{ x0: 0, y0: 0, x1: 4, y1: 3 }, { x0: 4, y0: 0, x1: 5, y1: 3, role: 'storage' }];
assert.equal(sommets(generator.cheminContour(pavage)), 4,
  'deux parties qui pavent un rectangle donnent un rectangle : pas de refend');

const enL = [{ x0: 0, y0: 0, x1: 4, y1: 3 }, { x0: 0, y0: 3, x1: 1.5, y1: 5, role: 'storage' }];
assert.equal(sommets(generator.cheminContour(enL)), 6, 'une forme en L a six sommets');
assert.equal((generator.cheminContour(enL).match(/M/g) || []).length, 1,
  'le contour d’une pièce est une boucle unique');

/* 2. Le volume servi au solveur est celui de la pièce ---------------------- */

let multiParties = 0, unionRecuperee = 0, gain = 0;
for (const surface of [45, 60, 75, 110, 150, 220]) {
  for (let variante = 0; variante < 12; variante += 1) {
    const plan = generator.generatePlan(
      { surface, bedrooms: 2, bathrooms: 1, separateKitchen: true, includeWc: true, priority: 'compact' },
      variante, (surface * 977 + variante * 31 + 3300) >>> 0);
    plan.rooms.forEach((room) => {
      const contour = generator.cheminContour(room.parts);
      assert.equal((contour.match(/M/g) || []).length, 1,
        room.id + ' doit se tracer d’un seul contour');
      const aire = room.parts.reduce((s, p) => s + (p.x1 - p.x0) * (p.y1 - p.y0), 0);
      assert.ok(Math.abs(aire - room.area) < 0.02, 'le contour couvre toute la surface de la pièce');
      if (room.parts.length < 2) return;
      multiParties += 1;
      const u = room.usableRect;
      const aireUtile = (u.x1 - u.x0) * (u.y1 - u.y0);
      const aireMain = (room.parts[0].x1 - room.parts[0].x0) * (room.parts[0].y1 - room.parts[0].y0);
      // Le rectangle utile ne descend jamais sous la partie principale, et
      // remonte à la boîte englobante dès que les parties la pavent.
      assert.ok(aireUtile + 0.005 >= aireMain, room.id + ' ne doit pas perdre de surface utile');
      assert.ok(aireUtile <= room.area + 0.02, room.id + ' ne doit pas en gagner d’inexistante');
      if (aireUtile > aireMain + 0.005) { unionRecuperee += 1; gain += aireUtile - aireMain; }
    });
  }
}
assert.ok(unionRecuperee > 0,
  'des pièces rectangulaires nées de plusieurs parties doivent retrouver leur volume');

/* 3. Une bande de rangement incluse reste rattachée ------------------------ */

const regle = rules.rules.find((entry) => entry.id === 'TH2D-RANGEMENT-002');
const inclus = {
  rooms: [{
    id: 'bedroom_1', type: 'bedroom', label: 'Chambre 1',
    usableRect: { x0: 0, y0: 0, x1: 5, y1: 3 },
    parts: [
      { role: 'main', x0: 0, y0: 0, x1: 4, y1: 3 },
      { role: 'storage', x0: 4, y0: 0, x1: 5, y1: 3 }
    ]
  }]
};
assert.equal(regle.evaluate(inclus).length, 0,
  'une bande incluse dans le rectangle utile est rattachée, pas détachée');

const detache = JSON.parse(JSON.stringify(inclus));
detache.rooms[0].parts[1] = { role: 'storage', x0: 7, y0: 0, x1: 8, y1: 3 };
assert.equal(regle.evaluate(detache).length, 1,
  'une bande réellement détachée doit toujours être signalée');

console.log('Contour : ' + multiParties + ' pièces en plusieurs parties, ' +
  unionRecuperee + ' unions rectangulaires récupérées (+' + gain.toFixed(1) + ' m² utiles).');
