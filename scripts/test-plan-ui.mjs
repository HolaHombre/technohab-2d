import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const technohabRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const appSource = readFileSync(join(technohabRoot, 'assets/app.js'), 'utf8');
const stylesSource = readFileSync(join(technohabRoot, 'assets/styles.css'), 'utf8');
const indexSource = readFileSync(join(technohabRoot, 'index.html'), 'utf8');

assert.match(appSource, /var afficherMobilier = true;/,
  'le mobilier doit être actif en l’absence de préférence enregistrée');
assert.match(appSource, /modele\.designate\(room\.type/,
  'le modèle doit désigner les exigences avant le placement');
assert.match(appSource, /solveur\.validate\(equipements/,
  'la faisabilité doit être validée avant l’optimisation');
assert.match(appSource, /solveur\.optimize\(equipements/,
  'le rendu doit choisir ensuite une disposition optimisée et ensemencée');
assert.match(appSource, /class: 'room-info'/,
  'les informations de pièce doivent être regroupées pour le survol');
assert.match(appSource, /tabindex: '0'/,
  'chaque pièce doit proposer le même détail au focus clavier');
assert.match(appSource, /'L × l '/,
  'le détail doit annoncer les dimensions L × l');
assert.match(stylesSource, /\.room:hover \.room-info, \.room:focus \.room-info \{ opacity: 1; \}/,
  'le survol doit révéler les informations de la pièce');
assert.match(stylesSource, /\.room:hover \.room-furniture, \.room:focus \.room-furniture \{ opacity: 0; \}/,
  'le survol doit masquer uniquement le mobilier de la pièce');
assert.match(indexSource, /Survol : nom · L × l · surface/,
  'la légende doit annoncer l’interaction contextuelle');

const renderPlanSource = appSource.slice(appSource.indexOf('function renderPlan'), appSource.indexOf('function fitText'));
assert.ok(renderPlanSource.indexOf("class: part.role === 'storage'") < renderPlanSource.indexOf('var pose = renderFurniture'),
  'les surfaces des pièces doivent être dessinées avant le mobilier');
assert.match(appSource, /room\.id === 'bedroom_1'[\s\S]*\? 'parentale'/,
  'la première chambre doit recevoir la variante parentale');
assert.match(renderPlanSource, /\(plan\.fenetres \|\| \[\]\)\.forEach/,
  'les fenêtres calculées doivent être rendues');
assert.match(stylesSource, /\.plan-window \{ stroke: var\(--marble\)/,
  'les fenêtres doivent suivre la palette structurelle');
assert.ok(renderPlanSource.indexOf('cheminementAvecObstacles') < renderPlanSource.indexOf('if (afficherParcours)'),
  'le cheminement meublé doit être recalculé avant son diagnostic visuel');
assert.ok(renderPlanSource.indexOf("class: 'plan-door'") < renderPlanSource.indexOf('if (afficherParcours)'),
  'les portes doivent rester visibles sans activer le diagnostic de parcours');

console.log('Interface du plan : calques, ouvertures, chambre parentale et détail contextuel vérifiés.');
