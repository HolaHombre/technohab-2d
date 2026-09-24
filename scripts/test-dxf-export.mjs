/* REF-1 ligne 3 — l'export DXF. On ne vérifie pas qu'un fichier sort : on
   vérifie qu'il dit la vérité géométrique du plan, et qu'il la dit dans le
   repère de la CAO, pas dans celui de l'écran. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
[
  'socle.data.js', 'canonical-values.data.js', 'canonical-values.js', 'fit.data.js',
  'contracts.js', 'construction.js', 'typologie.js', 'squelette.js',
  'relaxation.data.js', 'relaxation.js', 'analysis.data.js', 'analysis.js',
  'placement.js', 'room-model.js', 'evaluation.js', 'generator.js', 'rules.js',
  'dxf.js'
].forEach(function (file) {
  try { new Function(readFileSync(join(root, 'assets', file), 'utf8'))(); } catch (error) { void error; }
});

const dxf = globalThis.TechnoHabDxf;
const generator = globalThis.TechnoHabGenerator;

/* 1. Le plan absent est un refus, pas un fichier vide ------------------- */
assert.throws(() => dxf.build(null), TypeError, 'un plan absent doit refuser');
assert.throws(() => dxf.build({}), TypeError, 'une emprise absente doit refuser');

/* 2. Structure minimale d'un DXF R12 ------------------------------------ */
const result = generator.generateResult({ surface: 90, bedrooms: 2, seed: 12345 });
assert.equal(result.status, 'VALID', 'le plan témoin doit être valide');
/* Le témoin doit être un vrai logement, pas un plan dégénéré. Première
   version du test : l'option avait été nommée `chambres` au lieu de
   `bedrooms`, silencieusement ignorée, et le DXF était validé sur un studio
   à une porte. Un test qui ne contrôle pas son propre témoin ne contrôle
   rien. */
assert.ok(result.builtPlan.plan.rooms.filter((r) => r.type === 'bedroom').length === 2,
  'le témoin doit porter les deux chambres demandées');
assert.ok(result.builtPlan.plan.rooms.length >= 5,
  'le témoin doit être un logement composé, pas un studio');
const plan = result.builtPlan.plan;
const out = dxf.build(plan);

['SECTION', 'HEADER', 'TABLES', 'ENTITIES', 'ENDSEC', 'EOF'].forEach((marker) => {
  assert.ok(out.includes('\n' + marker + '\n'), 'le DXF doit porter ' + marker);
});
assert.ok(out.includes('AC1009'), 'la version doit être R12');
assert.ok(/\$INSUNITS\n\s*70\n6\n/.test(out), 'l’unité doit être le mètre');
assert.equal((out.match(/\nENDSEC\n/g) || []).length, 3, 'trois sections closes');

/* 3. Tous les calques annoncés existent, et rien ne se dessine ailleurs -- */
const declared = dxf.layers.map((layer) => layer.name);
declared.forEach((name) => {
  assert.ok(out.includes('\n' + name + '\n'), 'calque manquant : ' + name);
});
/* Le balayage se fait dans ENTITIES seulement : la table des calques porte
   elle aussi des couples code/valeur, et un index de couleur valant 8 s'y
   lirait comme un nom de calque. Première version du test prise au piège. */
const entities = out.slice(out.indexOf('\nENTITIES\n'));
const used = new Set();
const lines = entities.split('\n');
for (let i = 0; i < lines.length - 1; i += 1) {
  if (lines[i].trim() === '8') used.add(lines[i + 1]);
}
used.forEach((name) => {
  assert.ok(declared.includes(name), 'entité sur un calque non déclaré : ' + name);
});

/* 4. Le repère est retourné — et c'est la propriété qui casse en silence.
      Un mur au nord du plan (y petit) doit ressortir au nord en CAO
      (y GRAND). Sans ce test, une inversion passerait inaperçue : le plan
      resterait cohérent avec lui-même, et faux pour tout le monde. */
const H = plan.boundary.height;
const nord = plan.walls.reduce((a, b) => (a.volume.y0 <= b.volume.y0 ? a : b));
const sud = plan.walls.reduce((a, b) => (a.volume.y1 >= b.volume.y1 ? a : b));

/* Les ordonnées sont relevées par calque : l'avertissement est posé
   volontairement sous le plan, et il fausserait un minimum global. */
function ordonneesDe(layer) {
  const valeurs = [];
  let courant = null;
  for (let i = 0; i < lines.length - 1; i += 1) {
    if (lines[i].trim() === '8') courant = lines[i + 1];
    if (lines[i].trim() === '20' && courant === layer) valeurs.push(parseFloat(lines[i + 1]));
  }
  return valeurs;
}
const murs = ordonneesDe('TH_MURS');
assert.ok(murs.length > 0, 'des murs doivent être tracés');
assert.ok(Math.abs(Math.max(...murs) - (H - nord.volume.y0)) < 0.002,
  'le mur le plus au nord doit porter la plus grande ordonnée en CAO');
assert.ok(Math.abs(Math.min(...murs) - (H - sud.volume.y1)) < 0.002,
  'le mur le plus au sud doit porter la plus petite');

/* 5. Tout ce qui décide est présent, en nombre ---------------------------- */
const compte = (motif) => (out.match(new RegExp('\\n8\\n' + motif + '\\n', 'g')) || []).length;
assert.ok(compte('TH_MURS') >= plan.walls.length,
  'chaque mur doit être tracé');
assert.ok(compte('TH_OUVERTURES') > 0, 'les ouvertures doivent être tracées');
const placements = plan.rooms.reduce((n, room) => n + (room.placements || []).length, 0);
if (placements > 0) {
  assert.ok(compte('TH_MOBILIER') > 0, 'le mobilier placé doit être tracé');
  assert.ok(compte('TH_DEGAGEMENTS') > 0,
    'les zones d’usage doivent être tracées : c’est ce que l’export d’un éditeur manuel ne sait pas dire');
}

/* 6. Le débattement d'une porte sort, quand il existe --------------------- */
const battante = (plan.portes || []).find((porte) => porte.debattement);
if (battante) {
  assert.ok(out.includes(num(battante.debattement.x0)),
    'le débattement d’une porte battante doit être dans le fichier');
}
function num(value) { return (Math.round(value * 1000) / 1000).toFixed(3); }

/* 7. La portée non contractuelle voyage avec le fichier ------------------- */
assert.ok(out.includes('NON CONTRACTUEL'),
  'la portée du document doit être dans le fichier, pas seulement dans la page');
assert.ok(out.includes('Graine ' + plan.seed), 'la graine doit permettre de rejouer le plan');

/* 8. Le fichier est purement ASCII. R12 ne déclare aucun encodage : un
      octet non ASCII s'y lit différemment selon le logiciel. Les libellés du
      moteur en portent (« Salle d'eau », apostrophe typographique), donc la
      translittération est une condition de lisibilité, pas une coquetterie. */
const horsAscii = out.split('\n').filter((ligne) => /[^\x00-\x7F]/.test(ligne));
assert.deepEqual(horsAscii, [], 'le DXF doit être purement ASCII');
assert.ok(plan.rooms.some((room) => /[^\x00-\x7F]/.test(room.label || '')),
  'témoin : le plan doit bien contenir des libellés accentués, sans quoi le test 8 ne prouve rien');

console.log('test-dxf-export : ' + [
  plan.walls.length + ' murs',
  (plan.portes || []).length + ' portes',
  (plan.fenetres || []).length + ' fenêtres',
  placements + ' équipements',
  used.size + ' calques utilisés',
  Math.round(out.length / 1024) + ' Ko'
].join(', ') + ' — OK');
