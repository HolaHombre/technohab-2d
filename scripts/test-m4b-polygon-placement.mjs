import assert from 'node:assert/strict';

import '../assets/placement.js';
import '../assets/fit.data.js';
import '../assets/rules.js';

const placement = globalThis.TechnoHabPlacement;
const fit = globalThis.TechnoHabFit;
const rules = globalThis.TechnoHabRules;

const rectangle = [[
  { x: 0, y: 0 }, { x: 4, y: 0 }, { x: 4, y: 4 }, { x: 0, y: 4 }
]];
const enL = [[
  { x: 0, y: 0 }, { x: 4, y: 0 }, { x: 4, y: 1.5 },
  { x: 1.5, y: 1.5 }, { x: 1.5, y: 4 }, { x: 0, y: 4 }
]];
const encocheTraversante = [[
  { x: 0, y: 0 }, { x: 4, y: 0 }, { x: 4, y: 4 }, { x: 0, y: 4 },
  { x: 0, y: 1.9 }, { x: 3, y: 1.9 }, { x: 3, y: 1.7 }, { x: 0, y: 1.7 }
]];

assert.equal(placement.polygonIsRectangle(rectangle), true,
  'un contour rectangulaire conserve le chemin rapide');
assert.equal(placement.polygonIsRectangle(enL), false,
  'un L doit désactiver l’autorité du cache rectangulaire');
assert.equal(fit.geometryScope, 'rectangle-only',
  'fit.data.js doit publier explicitement sa portée');

assert.equal(placement.rectangleInPolygon({ x0: 1, y0: 1, x1: 2, y1: 3 }, encocheTraversante), false,
  'une emprise traversée par une encoche doit être refusée même si coins et centre restent dedans');
assert.equal(placement.rectangleInPolygon({ x0: 3.1, y0: 1, x1: 3.8, y1: 3 }, encocheTraversante), true,
  'une emprise réellement contenue doit rester admise');

function meuble(id, side) {
  return {
    id, label: id, required: true, footprint: { w: side, d: side },
    anchor: 'free', usage: []
  };
}

const cacheOptimiste = placement.solve([meuble('grand', 2)], { w: 4, h: 4 });
const polygoneRefuse = placement.solve([meuble('grand', 2)], { w: 4, h: 4 }, {
  context: { usablePolygon: enL }
});
assert.equal(cacheOptimiste.fits, true, 'la boîte englobante seule accepte le grand meuble');
assert.equal(polygoneRefuse.fits, false, 'le L doit refuser le meuble qui ne tient dans aucune branche');
assert.equal(polygoneRefuse.geometry.cacheAuthority, 'none');

const polygoneComplet = placement.solve([meuble('module_retour', 1.2)], { w: 4, h: 4 }, {
  context: {
    usablePolygon: enL,
    blocked: [{ x0: 0, y0: 0, x1: 1.5, y1: 4 }]
  }
});
assert.equal(polygoneComplet.fits, true,
  'le solveur doit exploiter le retour du L quand la branche principale est indisponible');
assert.equal(polygoneComplet.geometry.method, 'orthogonal-polygon-v1');
polygoneComplet.placements.forEach(function (pose) {
  assert.ok(pose.footprint.x0 >= 1.5,
    pose.equipment.id + ' doit avoir été posé dans le retour du L');
  assert.equal(placement.rectangleInPolygon(pose.footprint, enL), true,
    pose.equipment.id + ' doit rester dans le polygone utile');
});

const roomRule = rules.rules.find((rule) => rule.id === 'TH2D-ROOM-002');
const roomWithoutVerdict = {
  id: 'l_sans_solveur', type: 'bedroom', label: 'Chambre en L',
  usableBounds: { x0: 0, y0: 0, x1: 4, y1: 4 },
  usableRect: { x0: 0, y0: 0, x1: 1.5, y1: 4 },
  usablePolygon: enL, parts: []
};
assert.equal(roomRule.evaluate({ rooms: [roomWithoutVerdict] }).length, 0,
  'la règle doit s’abstenir hors rectangle si le solveur exact n’a pas publié de verdict');
assert.equal(roomRule.evaluate({ rooms: [{ ...roomWithoutVerdict, furnishable: false }] }).length, 1,
  'un refus polygonal publié doit rester HARD');

console.log('M4b : rectangle rapide conservé, encoche refusée et retour du L exploité.');
