import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const indexSource = readFileSync(join(root, 'index.html'), 'utf8');
const appSource = readFileSync(join(root, 'assets/app.js'), 'utf8');
const stylesSource = readFileSync(join(root, 'assets/styles.css'), 'utf8');
const engineSource = readFileSync(join(root, 'assets/analysis.js'), 'utf8');

await import('../assets/analysis.data.js');
await import('../assets/analysis.js');

assert.equal(globalThis.TechnoHabAnalysisData.criteria.length, 9,
  'la grille doit conserver ses neuf axes d’analyse');
assert.equal(globalThis.TechnoHabAnalysisData.ratings.length, 4,
  'chaque axe doit proposer quatre constats explicites');
assert.match(indexSource, /id="download-json"[\s\S]*id="download-analysis"/,
  'l’export d’analyse doit suivre immédiatement l’export JSON');
assert.match(indexSource, /id="analysis-panel"[\s\S]*role="dialog" aria-modal="true"/,
  'le tableau doit être présenté comme un dialogue modal accessible');
assert.doesNotMatch(indexSource, /<script[^>]+analysis(?:\.data)?\.js/,
  'le module d’analyse ne doit pas alourdir le chargement initial');
assert.match(appSource, /loadDeferredScript\('\.\/assets\/analysis\.data\.js'\)[\s\S]*analysis\.js/,
  'les données puis le moteur d’analyse doivent être chargés au premier usage');
assert.match(appSource, /analysisOpenButton\.disabled = !available;[\s\S]*analysisExportButton\.disabled = !available;/,
  'l’analyse ne doit être disponible qu’avec un plan actif');
assert.match(appSource, /elapsedMs:[\s\S]*resolutionAttempts:[\s\S]*selectionAttempts:[\s\S]*totalGeneratorCalls:/,
  'la génération doit produire une mesure de durée et de coût de recherche');

assert.match(engineSource, /setAttribute\('role', 'radio'\)/,
  'les cellules de la grille doivent exposer leur rôle au lecteur d’écran');
assert.match(engineSource, /mouseenter[\s\S]*focus[\s\S]*setHelp/,
  'l’explication d’une cellule doit être disponible au survol et au clavier');
assert.match(engineSource, /ArrowRight'[\s\S]*ArrowDown'[\s\S]*ArrowLeft'[\s\S]*ArrowUp'/,
  'les réponses doivent être parcourables avec les quatre flèches');
assert.match(engineSource, /draft\.mode === 'short'[\s\S]*draft\.synthesis[\s\S]*draft\.firstCorrection/,
  'le mode court doit exiger uniquement les deux réponses de synthèse');
assert.match(indexSource, /id="fast-save"[\s\S]*id="fast-save-current"[\s\S]*id="fast-save-export"/,
  'le header doit proposer archivage local et export des graines');
assert.match(appSource, /technohab:fast-saves:v1[\s\S]*archiveActivePlan[\s\S]*technohab-plans-a-analyser\.json/,
  'les plans signalés doivent rester dans le navigateur et être exportables');
assert.match(engineSource, /plan\.png[\s\S]*analyse\.json|analyse\.json[\s\S]*plan\.png/,
  'l’archive doit réunir le résultat structuré et le PNG du plan');
assert.match(engineSource, /identity:[\s\S]*seed:[\s\S]*rank:/,
  'le résultat doit identifier la graine et le rang du plan');
assert.match(engineSource, /parameters:[\s\S]*logs:/,
  'le résultat doit embarquer paramètres et journaux');
assert.match(stylesSource, /\.analysis-panel \{[^}]*background: rgba\(11, 11, 11, \.90\)/,
  'le tableau doit isoler sa lecture avec une opacité de 90 %');
assert.match(stylesSource, /\.analysis-open #plan-svg \{[^}]*filter: blur\(8px\)/,
  'le plan ne doit subsister qu’en masse floue derrière le tableau');
assert.doesNotMatch(stylesSource.match(/\.analysis-open #plan-svg \{[^}]*\}/)[0], /opacity:/,
  'le flou d’écran ne doit pas affaiblir le PNG exporté par style calculé');
assert.match(stylesSource, /\.analysis-trigger \{[^}]*min-height: 44px/,
  'le déclencheur doit garder une cible tactile suffisante');
assert.match(stylesSource, /@media \(max-width: 560px\)[\s\S]*\.analysis-row \{ grid-template-columns: 1fr;/,
  'la grille doit se replier sans défilement horizontal sur petit écran');
assert.doesNotMatch(stylesSource.match(/\.analysis-trigger \{[^}]*\}/)[0], /box-shadow:/,
  'l’analyse ne doit pas introduire d’ombre hors direction artistique');

const encoder = new TextEncoder();
const archive = globalThis.TechnoHabAnalysis.createArchive([
  { name: 'audit/analyse.json', bytes: encoder.encode('{"ok":true}') },
  { name: 'audit/plan.png', bytes: new Uint8Array([137, 80, 78, 71]) }
]);
const archiveText = new TextDecoder().decode(archive);
const view = new DataView(archive.buffer, archive.byteOffset, archive.byteLength);
assert.equal(view.getUint32(0, true), 0x04034B50, 'l’archive doit commencer par une entrée ZIP valide');
assert.ok(archiveText.includes('audit/analyse.json') && archiveText.includes('audit/plan.png'),
  'les deux pièces du dossier doivent être nommées dans l’archive');
assert.equal(view.getUint32(archive.length - 22, true), 0x06054B50,
  'l’archive doit se terminer par un répertoire ZIP valide');

console.log('Analyse : grille, chargement paresseux, performance et dossier ZIP vérifiés.');
