/* D3 — la fusion de pièces est une composition, jamais une suppression.
   Une option du questionnaire qui retire une pièce du programme doit verser
   sa fonction à la pièce qui l'absorbe : équipements, surface, étiquette.
   Voir ROADMAP.md §5.3. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
['fit.data.js', 'contracts.js', 'construction.js', 'typologie.js', 'squelette.js', 'generator.js', 'socle.data.js', 'room-model.js', 'placement.js', 'rules.js'].forEach(function (file) {
  new Function(readFileSync(join(root, 'assets', file), 'utf8'))();
});

const generator = globalThis.TechnoHabGenerator;
const model = globalThis.TechnoHabRoomModel;
const placement = globalThis.TechnoHabPlacement;
const rules = globalThis.TechnoHabRules;

const base = { surface: 75, bedrooms: 2, bathrooms: 1, priority: 'compact' };

/* 1. Aucune option ne fait disparaître une fonction ---------------------- */

const separe = generator.buildProgram({ ...base, separateKitchen: true, includeWc: true });
assert.ok(separe.rooms.some((room) => room.type === 'kitchen'),
  'cuisine séparée : la cuisine est une pièce du programme');
assert.ok(separe.rooms.some((room) => room.type === 'wc'),
  'WC indépendant : le WC est une pièce du programme');

const fusionne = generator.buildProgram({ ...base, separateKitchen: false, includeWc: false });
assert.ok(!fusionne.rooms.some((room) => room.type === 'kitchen'),
  'cuisine ouverte : plus de pièce cuisine autonome');
assert.ok(!fusionne.rooms.some((room) => room.type === 'wc'),
  'WC intégré : plus de pièce WC autonome');

const sejour = fusionne.rooms.find((room) => room.id === 'living');
const salleDEau = fusionne.rooms.find((room) => room.id === 'bath_1');
// DIVERS-1 (25 septembre 2026) : au-dessus de la classe « petit », le séjour
// héberge aussi le coin repas — décision « obligatoire dans tout plan »
// (DECISIONS_PROGRAMME.md §2.1), tenue dès 55 m². 75 m² est « moyen ».
assert.deepEqual(sejour.composedWith, ['kitchen', 'dining'],
  'la cuisine ouverte est absorbée par le séjour, pas supprimée, et le repas y est hébergé');
assert.deepEqual(salleDEau.composedWith, ['wc'],
  'le WC intégré est absorbé par la salle d’eau, pas supprimé');
assert.match(sejour.label, /cuisine/i, 'l’étiquette du séjour annonce la cuisine ouverte');
assert.match(salleDEau.label, /WC/, 'l’étiquette de la salle d’eau annonce le WC');

/* 2. La composition se paie en surface, sans additionner les conforts ---- */

const sejourSeul = separe.rooms.find((room) => room.id === 'living');
const salleDEauSeule = separe.rooms.find((room) => room.id === 'bath_1');
assert.equal(sejour.minArea, sejourSeul.minArea,
  'le séjour est déjà assez grand : son plancher ne bouge pas');
assert.equal(salleDEau.minArea, salleDEauSeule.minArea,
  'après absorption, le plancher de 3 m² couvre encore la composition compacte');

/* 3. Les équipements suivent la composition ------------------------------ */

const avecWc = model.designate('bath', 'eau', { area: 5, integratedWc: true, includeOptional: true });
assert.ok(avecWc.programs.includes('wc'), 'la salle d’eau composée porte le programme WC');
assert.ok(avecWc.equipments.some((equipment) => equipment.id === 'wc_pan'),
  'la cuvette figure parmi les équipements de la salle d’eau composée');
assert.ok(!avecWc.equipments.some((equipment) => equipment.id === 'handbasin'),
  'le lavabo de la salle d’eau absorbe le lave-mains du programme WC');
assert.deepEqual(avecWc.absorptions, [{ guest: 'handbasin', by: 'washbasin' }],
  'l’absorption reste explicable dans la désignation');
assert.ok(avecWc.relations.some((relation) => relation.code === 'BATH-WC-WET-001'),
  'la composition peut déclarer une relation entre ses deux programmes');

const sansWc = model.designate('bath', 'eau', { area: 5, includeOptional: true });
assert.ok(!sansWc.equipments.some((equipment) => equipment.id === 'wc_pan'),
  'sans composition, aucune cuvette ne s’invite dans la salle d’eau');

const avecCuisine = model.designate('living', undefined, { area: 30, openKitchen: true, includeOptional: true });
assert.ok(avecCuisine.programs.includes('kitchen'), 'le séjour composé porte le programme cuisine');
assert.ok(avecCuisine.equipments.some((equipment) => equipment.id === 'sink'),
  'l’évier figure parmi les équipements du séjour composé');

/* 4. La pièce composée reste meublable sur des graines fixes ------------- */

let poses = 0;
for (const surface of [60, 75, 95, 120]) {
  for (let variante = 1; variante <= 4; variante += 1) {
    const plan = generator.generatePlan(
      { ...base, surface, separateKitchen: false, includeWc: false }, variante, 7300 + variante);
    const piece = plan.rooms.find((room) => room.id === 'bath_1');
    assert.deepEqual(piece.composedWith, ['wc'],
      'la composition voyage jusqu’au plan rendu');
    const rect = piece.usableRect || piece;
    const dimensions = { w: rect.x1 - rect.x0, h: rect.y1 - rect.y0 };
    const contexte = { area: piece.area || piece.targetArea, integratedWc: true, includeOptional: true };
    let designation = model.designate('bath', 'eau', contexte);
    let validation = placement.validate(designation.equipments, dimensions, { relations: designation.relations });
    if (!validation.fits) {
      contexte.includeOptional = false;
      designation = model.designate('bath', 'eau', contexte);
      validation = placement.validate(designation.equipments, dimensions, { relations: designation.relations });
    }
    assert.equal(validation.fits, true,
      plan.seed + '/bath_1 doit loger douche, lavabo et cuvette');
    poses += 1;
  }
}

/* 5. La règle de meublabilité juge la pièce sur son programme composé ----
   Le contrôle est nécessaire, pas suffisant : le cache ne connaît que les
   types simples, donc la règle vérifie que chaque programme tient et que
   l'aire couvre la somme des deux plus petits rectangles. Une salle d'eau
   de 1,70 × 1,70 m est en dessous et doit être signalée ; le verdict exact
   pour les cas limites demande une entrée de cache dédiée. */

{
  const regle = rules.rules.find((entry) => entry.id === 'TH2D-ROOM-002');
  assert.ok(regle, 'TH2D-ROOM-002 doit exister');
  const etroite = {
    rooms: [{
      id: 'bath_1', type: 'bath', label: 'Salle d’eau avec WC', composedWith: ['wc'],
      x0: 0, y0: 0, x1: 1.7, y1: 1.7,
      usableRect: { x0: 0, y0: 0, x1: 1.7, y1: 1.7 },
      parts: [{ role: 'main', x0: 0, y0: 0, x1: 1.7, y1: 1.7 }]
    }]
  };
  assert.equal(regle.evaluate(etroite).length, 1,
    'une salle d’eau trop petite pour son WC doit être signalée, pas validée');
}

console.log('Fusion : programmes composés, surfaces, équipements et ' + poses +
  ' poses de salle d’eau avec WC vérifiés.');
