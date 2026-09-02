/* M5.2e — présentation et consentement explicite des concessions. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(join(root, 'index.html'), 'utf8');
const app = readFileSync(join(root, 'assets/app.js'), 'utf8');
const css = readFileSync(join(root, 'assets/styles.css'), 'utf8');

for (const id of [
  'resolution-notice', 'resolution-requested', 'resolution-proposed',
  'resolution-changes', 'resolution-consent', 'resolution-consent-check',
  'resolution-activate', 'resolution-consent-status'
]) assert.match(html, new RegExp('id="' + id + '"'), id + ' doit appartenir au document');

assert.match(html, /aria-labelledby="resolution-title"/,
  'la proposition de repli doit être nommée pour les technologies d’assistance');
assert.match(html, /resolution-consent-check[\s\S]*aria-describedby="resolution-consent-note"/,
  'le consentement doit annoncer la conséquence qu’il autorise');
assert.match(html, /id="resolution-activate"[\s\S]*disabled/,
  'l’activation majeure doit être impossible avant consentement');

assert.match(app, /severity === 'FUNCTION_REMOVED'/,
  'seul le retrait d’une fonction doit exiger un accord bloquant');
assert.match(app, /clearActivePlan\('La proposition attend votre accord avant affichage et export\.'/,
  'un plan majeur ne doit pas devenir actif avant accord');
assert.match(app, /resolutionActivate\.disabled = !resolutionConsentCheck\.checked/,
  'la case explicite doit gouverner l’activation');
assert.match(app, /method: 'explicit-checkbox'/,
  'la trace doit distinguer un accord explicite d’un accord non requis');
assert.match(app, /programResolution: resolution/,
  'le plan actif doit conserver la résolution qui l’a produit');
assert.match(app, /resolutionExportTrace\(latestResult\.programResolution, latestResult\.consent\)/,
  'l’export JSON doit conserver demande, résolution et consentement');
assert.match(app, /data-technohab', 'program-resolution'/,
  'l’export SVG doit embarquer la même trace dans ses métadonnées');

assert.match(css, /\.resolution-notice \{[^}]*border-top: 1px solid var\(--gold-dim\)/,
  'la proposition suit la grammaire du filet plutôt qu’une carte');
assert.doesNotMatch(css, /\.resolution-notice \{[^}]*(box-shadow|border-radius)/,
  'la proposition ne doit recevoir ni carte ni ombre');
assert.match(css, /@media \(max-width: 560px\)[\s\S]*\.resolution-comparison \{ grid-template-columns: 1fr;/,
  'la comparaison doit rester lisible sur petit écran');
assert.match(css, /\.primary-button:disabled, \.secondary-button:disabled/,
  'les actions bloquées doivent avoir un état visuel explicite');

console.log('M5.2e UI : comparaison, consentement majeur, exports traçables et responsive vérifiés.');
