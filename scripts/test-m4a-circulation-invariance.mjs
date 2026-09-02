/* M4a — invariance du repère des squelettes de circulation. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
for (const file of ['fit.data.js', 'contracts.js', 'construction.js', 'typologie.js',
  'squelette.js', 'placement.js', 'generator.js', 'rules.js']) {
  vm.runInThisContext(fs.readFileSync(join(root, 'assets', file), 'utf8'));
}

const G = globalThis.TechnoHabGenerator;
const S = globalThis.TechnoHabSquelette;
const R = globalThis.TechnoHabRules;
/* Témoin M4a : M5.0 élimine justement les T dont le troisième bras n'est pas
   desservi. On neutralise ce levier ultérieur pour continuer à prouver les
   quatre orientations du producteur, sans exiger qu'un T gagne M5. */
globalThis.TechnoHabAblations = { disableM5BranchUtility: true };
const options = {
  surface: 130, bedrooms: 4, bathrooms: 2, separateKitchen: true,
  includeWc: true, priority: 'compact', shape: 'rectangle'
};
const program = G.buildProgram(options);

let pose = null;
for (let seed = 1; seed <= 80 && !pose; seed += 1) {
  const candidate = S.produire(program, options.surface, seed, 'jour-nuit');
  if (candidate && candidate.pieces) pose = candidate;
}
assert.ok(pose, 'le squelette T pilote doit être productible');

const views = S.transformations(pose);
assert.ok(views.length > 1 && views.length <= 8,
  'une topologie doit exposer ses vues D4 uniques, sans doublons exacts');
assert.equal(new Set(views.map((view) => view.equivalenceClass)).size, 1,
  'les symétries globales restent une seule classe de diversité');
assert.ok(views.some((view) => view.transformation === 'r90'));
assert.ok(views.some((view) => view.largeur === pose.hauteur && view.hauteur === pose.largeur));

const area = (candidate) => candidate.pieces.reduce((sum, piece) =>
  sum + piece.parts.reduce((partSum, part) =>
    partSum + (part.x1 - part.x0) * (part.y1 - part.y0), 0), 0);
for (const view of views) {
  assert.ok(Math.abs(area(view) - area(pose)) < 1e-6,
    'une transformation ne change aucune surface de partition');
  assert.deepEqual(view.pieces.map((piece) => piece.id).sort(),
    pose.pieces.map((piece) => piece.id).sort());
}

let quarterTurn = pose;
for (let turn = 0; turn < 4; turn += 1) quarterTurn = S.transformer(quarterTurn, 'r90');
assert.ok(Math.abs(quarterTurn.largeur - pose.largeur) < 1e-9);
assert.ok(Math.abs(quarterTurn.hauteur - pose.hauteur) < 1e-9);
assert.ok(Math.abs(area(quarterTurn) - area(pose)) < 1e-6);

const transforms = new Set();
const axes = new Set();
const tOrientations = new Set();
for (let variant = 0; variant < 80; variant += 1) {
  const seed = (20260829 + variant) >>> 0;
  const plan = G.generatePlan(options, variant, seed);
  transforms.add(plan.topologyTransform);
  assert.ok(plan.topologyEquivalenceClass);
  assert.ok(plan.topologyTransformationsAvailable >= 1 && plan.topologyTransformationsAvailable <= 8);
  assert.equal(R.evaluatePlan(plan).summary.hard, 0,
    'le changement de repère ne doit pas changer le verdict HARD');
  const corridor = plan.rooms.find((room) => room.type === 'circulation');
  const horizontal = corridor.parts.some((part) => part.x1 - part.x0 > part.y1 - part.y0 + 0.05);
  const vertical = corridor.parts.some((part) => part.y1 - part.y0 > part.x1 - part.x0 + 0.05);
  axes.add(horizontal && vertical ? 'ramifie' : horizontal ? 'horizontal' : 'vertical');
  if (plan.topologyFamily === 'T') {
    const sides = Array.from(new Set(corridor.wallFaces
      .filter((face) => face.wallKind === 'exterior' && face.length > 0.08)
      .map((face) => face.side))).sort().join('-');
    tOrientations.add(sides);
  }
}

assert.ok(transforms.size >= 4, 'les graines doivent atteindre plusieurs vues canoniques');
assert.ok(axes.has('ramifie') && (axes.has('horizontal') || axes.has('vertical')),
  'axes observés : ' + Array.from(axes).join(', '));
assert.ok(tOrientations.size >= 3, 'un T publié ne doit plus garder une orientation unique');

console.log('M4a : D4 canonique, équivalence, surfaces et orientations ensemencées vérifiées.');
