/* M5.1 — contrat produit de la comparaison de plans. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(join(root, 'index.html'), 'utf8');
const app = readFileSync(join(root, 'assets/app.js'), 'utf8');
const css = readFileSync(join(root, 'assets/styles.css'), 'utf8');

for (const id of [
  'plan-selection', 'plan-selection-title', 'plan-selection-summary',
  'plan-selection-tabs', 'plan-selection-compromise', 'plan-view'
]) assert.match(html, new RegExp('id="' + id + '"'), id + ' doit appartenir au document');

assert.match(html, /id="plan-selection-tabs"[^>]*role="tablist"/,
  'la liste des propositions doit exposer sa sémantique comparative');
assert.match(html, /id="plan-view"[^>]*role="tabpanel"/,
  'le plan actif doit être le panneau contrôlé par les rangs');
assert.match(app, /resolveSelection\(\s*options, variant, pendingSeed, requestedCount\)/,
  'M5.1 doit demander le nombre de propositions choisi (1 ou 3) au programme effectivement résolu');
assert.match(app, /selection\.status === 'COMPLETE'/);
assert.match(app, /selection\.status === 'PARTIAL'/);
assert.match(app, /selectionStatus === 'EMPTY'/,
  'l’état EMPTY doit être distingué d’une panne de génération');
assert.match(app, /renderEmptySelection\(failedSelection\)/,
  'EMPTY doit rester visible dans l’interface');

assert.match(app, /tab\.setAttribute\('role', 'tab'\)/);
assert.match(app, /tab\.setAttribute\('aria-controls', 'plan-view'\)/);
assert.match(app, /tab\.tabIndex = index === 0 \? 0 : -1/,
  'les propositions doivent utiliser un tabindex itinérant');
for (const key of ['ArrowRight', 'ArrowLeft', 'Home', 'End']) {
  assert.match(app, new RegExp("event\\.key === '" + key + "'"),
    key + ' doit naviguer entre les propositions');
}

assert.match(app, /preference\.targetMissed/,
  'le compromis doit annoncer les exigences cibles manquées');
assert.match(app, /preference\.comfortMissed/,
  'le compromis doit annoncer les marges de confort manquées');
assert.match(app, /circulation\.share/,
  'le compromis doit annoncer la part de circulation');
assert.doesNotMatch(app, /agrément/i,
  'M5.1 ne doit pas présenter une préférence comme un agrément garanti');

assert.match(app, /resolvedSelection: resolvedSelection \|\| null/,
  'le plan actif doit conserver sa sélection');
assert.match(app, /selectionIndex: Number\.isFinite\(selectionIndex\)/,
  'le rang actif doit suivre le plan affiché');
assert.match(app, /root\.TechnoHabEvaluation\.contexte\(plan, report, APP_VERSION\)/,
  'l’évaluation doit être rattachée au plan actif');
assert.match(app, /data-technohab', 'plan-selection'/,
  'le SVG doit conserver le rang, la graine et le verdict de comparaison');
assert.match(app, /'-p' \+ \(latestResult\.selectionIndex \+ 1\) \+ '\.json'/,
  'l’export JSON doit nommer le rang actif');

assert.match(css, /\.plan-selection \{[^}]*border-top: 1px solid var\(--gold-dim\)/,
  'la comparaison doit suivre la grammaire du filet');
assert.doesNotMatch(css, /\.plan-selection \{[^}]*(box-shadow|border-radius)/,
  'la comparaison ne doit devenir ni carte ni encadré');
assert.match(css, /\.plan-selection-tab \{[^}]*min-height: 56px/,
  'les cibles des propositions doivent dépasser 44 px');
assert.match(css, /\.plan-selection-tab:focus-visible/,
  'les rangs doivent avoir un focus clavier visible');
assert.match(css, /@media \(max-width: 560px\)[\s\S]*\.plan-selection-tab \{[^}]*min-height: 64px/,
  'la comparaison doit rester actionnable sur petit écran');

console.log('M5.1 UI : trois rangs, états, compromis, clavier, plan actif et exports vérifiés.');
