// Verrous sur la définition des pièces — socle.data.js et son compilé
// fit.data.js. Trois risques, trois familles de contrôles :
//
//   1. l'énuméré cesse d'être exécutable (un rôle mal orthographié rendrait
//      une règle silencieusement inapplicable) ;
//   2. le compilé diverge de la source (un `npm run fit:build` oublié) ;
//   3. la dérivation des planchers change sans décision les plans historiques.
//
// Usage : node scripts/test-definition-pieces.mjs

import assert from 'node:assert/strict';

import '../assets/socle.data.js';
import '../assets/fit.data.js';

const socle = globalThis.TechnoHabSocle;
const fit = globalThis.TechnoHabFit;

// --------------------------------------------------- 1. énuméré exécutable

assert.deepEqual(socle.malformedRooms(), [],
  'Une pièce déclare un rôle, un trigger ou un maxRatio hors énuméré.');

for (const [type, room] of Object.entries(socle.rooms)) {
  assert.ok(socle.roles.includes(room.role), `${type} : rôle « ${room.role} » inconnu.`);
  assert.ok(Number.isFinite(room.agrement), `${type} : agrément absent.`);
  if (room.trigger) {
    assert.ok(socle.triggerKinds.includes(room.trigger.kind),
      `${type} : trigger de type « ${room.trigger.kind} » inconnu.`);
  }
  // Un plafond, s'il existe, est un multiple du besoin — jamais des m².
  if (room.maxRatio !== null) {
    assert.ok(room.maxRatio > 1,
      `${type} : maxRatio doit être un multiple du besoin, supérieur à 1.`);
  }
}

// Chaque plafond actif doit être nommé ici avec son origine. La circulation
// est mesurée ; le WC est le seuil doctrinal HARD/N3 explicitement admis par
// ROADMAP §6.6 pour O1.
assert.deepEqual(
  Object.keys(socle.rooms).filter((type) => socle.maxRatioOf(type) !== null),
  ['wc', 'circulation'],
  'Un plafond de surface est apparu sans origine explicitement instruite.');

// ------------------------------------------- 2. le compilé suit la source

for (const [type, room] of Object.entries(socle.rooms)) {
  const compile = fit.envelopes[type];
  assert.ok(compile, `${type} : absent de fit.data.js — lancer npm run fit:build.`);
  for (const champ of ['role', 'agrement', 'minProgramArea', 'minProgramSide', 'maxRatio']) {
    assert.deepEqual(compile[champ], room[champ] === undefined ? null : room[champ],
      `${type}.${champ} : fit.data.js diverge du socle — lancer npm run fit:build.`);
  }
  assert.deepEqual(compile.programFloors, room.programFloors || null,
    `${type}.programFloors : fit.data.js diverge du socle — lancer npm run fit:build.`);
  assert.deepEqual(compile.trigger, room.trigger || null,
    `${type}.trigger : fit.data.js diverge du socle — lancer npm run fit:build.`);
}

// ------------------------------------------- 3. invariance des planchers

/* La table que la dérivation remplace, conservée ici et nulle part ailleurs.
   Elle n'est plus une source : elle est l'oracle qui prouve que le passage
   d'une valeur décrétée à un plancher dérivé n'a rien déplacé. */
const TABLE_HISTORIQUE = {
  living: { area: 20, side: 3.0 },
  bedroom: { area: 9, side: 2.5 },
  bath: { area: 3, side: 1.7 },
  wc: { area: 1.5, side: 0.9 },
  // C-P1.2c assume les 5 cm qui séparent le socle historique du côté dérivé
  // 0,65 m de linéaire + 1,20 m de passage.
  kitchen: { area: 7, side: 1.85 },
  // C-P2 remplace explicitement le minimum universel de 1,20 m par un
  // plancher simple de 0,90 m ; le croisement reste exigé dès trois dessertes.
  circulation: { area: 3, side: 0.9 }
};

for (const [type, attendu] of Object.entries(TABLE_HISTORIQUE)) {
  const obtenu = fit.floorOf(type);
  assert.equal(obtenu.area, attendu.area,
    `${type} : plancher de surface ${obtenu.area} au lieu de ${attendu.area}.`);
  assert.equal(obtenu.side, attendu.side,
    `${type} : plancher de côté ${obtenu.side} au lieu de ${attendu.side}.`);
}

assert.deepEqual(fit.floorOf('bedroom', 'parentale'), { area: 11, side: 2.7 },
  'La chambre parentale doit conserver son plancher C4 distinct.');

/* Le plancher de dignité d'usage domine partout le plancher de meublabilité,
   sur les six types générés. Si l'inverse devenait vrai quelque part, c'est
   que le mobilier requis a grossi au point que la convention ne protège plus
   rien — il faudrait alors relire la convention, pas la contourner. */
for (const type of Object.keys(TABLE_HISTORIQUE)) {
  const meublable = fit.smallest(type);
  assert.ok(meublable.w * meublable.h <= socle.rooms[type].minProgramArea,
    `${type} : le mobilier requis dépasse le plancher de programme.`);
}

// ----------------------------------------------- 4. rôles et règles liées

/* Verrou de non-régression sur TH2D-FACADE-001, qui portait cette liste en
   dur avant de lire le rôle. Toute pièce ajoutée en `principale` entrera
   dans la règle de façade — ce test le rendra visible au lieu de le laisser
   passer inaperçu. */
assert.deepEqual(fit.typesByRole('principale').sort(),
  ['bedroom', 'bureau', 'dining', 'kitchen', 'living'],
  'La liste des pièces principales a changé : vérifier TH2D-FACADE-001.');

assert.equal(fit.roleOf('circulation'), 'distribution');
assert.equal(fit.roleOf('inconnu'), null, 'Un type inconnu ne doit porter aucun rôle.');

// Les six types générés déclarent tous leurs planchers ; les sept autres les
// laissent à null tant qu'aucune mesure ne les fonde.
const declares = Object.keys(socle.rooms)
  .filter((type) => socle.programFloor(type).area !== null).sort();
assert.deepEqual(declares, Object.keys(TABLE_HISTORIQUE).sort(),
  'Un plancher de programme a été posé sur une pièce non générée, ou retiré d’une pièce générée.');

console.log('definition-pieces : 13 types, 5 rôles, planchers et compilé conformes.');
