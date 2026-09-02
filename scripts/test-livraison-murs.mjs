/* M5 — rendu, contrat d’export et comparaison finale du chantier murs. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
['fit.data.js', 'contracts.js', 'construction.js', 'typologie.js', 'squelette.js', 'generator.js', 'socle.data.js', 'room-model.js', 'placement.js', 'rules.js']
  .forEach(function (file) { new Function(readFileSync(join(root, 'assets', file), 'utf8'))(); });

const generator = globalThis.TechnoHabGenerator;
const model = globalThis.TechnoHabRoomModel;
const placement = globalThis.TechnoHabPlacement;
const rules = globalThis.TechnoHabRules;
const appSource = readFileSync(join(root, 'assets', 'app.js'), 'utf8');
const cssSource = readFileSync(join(root, 'assets', 'styles.css'), 'utf8');
const htmlSource = readFileSync(join(root, 'index.html'), 'utf8');
const schema = JSON.parse(readFileSync(join(root, 'PLAN_SCHEMA.json'), 'utf8'));

/* 1. Le rendu utilise les volumes, les pleins et les surfaces utiles ------ */

assert.match(appSource, /function renderWalls\(plan\)/, 'le rendu possède une couche constructive dédiée');
assert.match(appSource, /wall\.solidSegments/, 'les baies interrompent réellement les rectangles de murs');
assert.match(appSource, /polygonPath\(room\.usablePolygon\)/, 'les pièces sont tracées depuis leur surface utile');
assert.match(cssSource, /\.plan-wall--exterior/, 'les murs extérieurs ont un vocabulaire visuel');
assert.match(cssSource, /\.plan-wall--interior/, 'les cloisons ont un vocabulaire visuel distinct');
['stat-habitable', 'stat-walls', 'stat-gross'].forEach((id) => {
  assert.match(htmlSource, new RegExp('id="' + id + '"'), id + ' est visible dans les métriques');
});
assert.match(htmlSource, /Mur extérieur/, 'la légende nomme les murs sans dépendre de la couleur seule');
assert.match(htmlSource, /Cloison/, 'la légende distingue textuellement les cloisons');
assert.match(htmlSource, /Baie/, 'la légende nomme les interruptions de murs');

/* 2. Le schéma 3.1 et les anciennes enveloppes restent lisibles ---------- */

assert.equal(schema.$id, 'https://wonderland.local/technohab/plan/3.1/schema');
assert.equal(schema.properties.schemaVersion.const, '3.1');
const schemaPlan = generator.generatePlan({ surface: 75, bedrooms: 2, bathrooms: 1 }, 1, 505001);
const report = rules.evaluatePlan(schemaPlan);
const exported = generator.exportDocument(schemaPlan, report, 'test');
assert.equal(exported.$schema, './PLAN_SCHEMA.json');
assert.equal(exported.schemaVersion, '3.1');
assert.equal(exported.plan.schemaVersion, '3.1');
assert.equal(exported.programResolution, null);
assert.equal(generator.readExportDocument(exported).plan, schemaPlan, 'le lecteur relit le contrat 3.1');

const legacyPlan = structuredClone(schemaPlan);
delete legacyPlan.schemaVersion;
delete legacyPlan.schema;
delete legacyPlan.constructionBounds;
const legacy = generator.readExportDocument({ plan: legacyPlan, rulesReport: report });
assert.equal(legacy.legacy, true, 'une enveloppe historique sans version est reconnue');
assert.equal(legacy.plan.rooms.length, schemaPlan.rooms.length, 'les pièces historiques restent accessibles');
assert.equal(generator.readExportDocument(legacyPlan).legacy, true, 'un ancien plan direct reste lisible');

/* 3. Banc fixe : 24 configurations, deux graines chacune ----------------- */

const surfaces = [60, 75, 110, 150];
const shapes = ['rectangle', 'lShape', 'uShape'];
const thicknesses = [
  { exteriorWallThickness: 0.30, interiorWallThickness: 0.10 },
  { exteriorWallThickness: 0.42, interiorWallThickness: 0.16 }
];
const configurations = [];
for (const shape of shapes) for (const surface of surfaces) for (const construction of thicknesses) {
  configurations.push({
    surface,
    bedrooms: surface < 100 ? 2 : surface < 140 ? 3 : 4,
    bathrooms: surface >= 140 ? 2 : 1,
    separateKitchen: surface !== 60,
    includeWc: surface >= 75,
    priority: surface === 110 ? 'light' : 'compact',
    shape,
    construction
  });
}
assert.equal(configurations.length, 24, 'le banc final contient exactement 24 configurations');

const totals = {
  plans: 0, partitionArea: 0, habitableArea: 0, wallArea: 0, grossFloorArea: 0,
  oldFits: 0, newFits: 0, oldReachable: 0, newReachable: 0, hard: 0
};

function requiredFit(room, plan, constructive) {
  const context = {
    area: room.usableArea,
    openKitchen: room.type === 'living' && !plan.options.separateKitchen,
    integratedWc: room.id === 'bath_1' && !plan.options.includeWc,
    includeOptional: false
  };
  const designation = model.designate(room.type, room.variant, context);
  if (!designation.equipments.length) return true;
  if (!constructive) {
    const rectangle = room.usableRect || room;
    return placement.validate(designation.equipments, {
      w: rectangle.x1 - rectangle.x0, h: rectangle.y1 - rectangle.y0
    }, { relations: designation.relations }).fits;
  }
  const spatial = placement.roomContext(room, plan);
  return placement.validate(designation.equipments, spatial.rectangle, {
    relations: designation.relations, context: spatial.context
  }).fits;
}

function doorReachable(plan) {
  const reached = {};
  if (!plan.entree) return reached;
  const start = plan.entree.entre.find((id) => id !== 'exterior');
  const neighbors = {};
  plan.rooms.forEach((room) => { neighbors[room.id] = []; });
  plan.portes.forEach((door) => {
    const [a, b] = door.entre;
    if (!neighbors[a] || !neighbors[b]) return;
    neighbors[a].push(b); neighbors[b].push(a);
  });
  const queue = start ? [start] : [];
  if (start) reached[start] = true;
  while (queue.length) {
    const current = queue.shift();
    neighbors[current].forEach((next) => {
      if (!reached[next]) { reached[next] = true; queue.push(next); }
    });
  }
  return reached;
}

for (let configIndex = 0; configIndex < configurations.length; configIndex += 1) {
  for (const seedOffset of [0, 1]) {
    let plan = null;
    for (let retry = 0; retry < 8 && !plan; retry += 1) {
      try {
        plan = generator.generatePlan(configurations[configIndex], seedOffset + retry + 1,
          505100 + configIndex * 17 + seedOffset + retry);
      } catch (error) {
        if (!error || error.code !== 'NON_TROUVE') throw error;
      }
    }
    assert.ok(plan, 'M4 doit trouver deux plans construits valides en huit graines par configuration');
    assert.equal(plan.schemaVersion, '3.1');
    assert.ok(plan.constructionBounds, 'l’emprise constructive est exportée');
    plan.walls.forEach((wall) => {
      assert.ok(wall.volume.x0 >= plan.constructionBounds.x0 - 0.001 && wall.volume.x1 <= plan.constructionBounds.x1 + 0.001 &&
        wall.volume.y0 >= plan.constructionBounds.y0 - 0.001 && wall.volume.y1 <= plan.constructionBounds.y1 + 0.001,
      wall.id + ' reste dans l’emprise constructive');
    });
    plan.rooms.forEach((room) => {
      if (requiredFit(room, plan, false)) totals.oldFits += 1;
      if (requiredFit(room, plan, true)) totals.newFits += 1;
    });
    totals.oldReachable += Object.keys(doorReachable(plan)).length;
    totals.newReachable += Object.keys((plan.parcours || {}).atteintes || {}).length;
    totals.partitionArea += plan.partitionArea;
    totals.habitableArea += plan.habitableArea;
    totals.wallArea += plan.wallArea;
    totals.grossFloorArea += plan.grossFloorArea;
    totals.hard += rules.evaluatePlan(plan).summary.hard;
    totals.plans += 1;
  }
}

assert.equal(totals.plans, 48, 'deux graines couvrent chacune des 24 configurations');
assert.ok(totals.partitionArea > totals.habitableArea, 'la comparaison mesure le retrait des cloisons');
assert.ok(totals.grossFloorArea > totals.partitionArea, 'la comparaison mesure l’ajout des murs extérieurs');
assert.ok(totals.newFits > 0 && totals.oldFits > 0, 'les deux modèles de meublabilité sont effectivement exercés');
assert.ok(totals.newReachable <= totals.oldReachable,
  'le parcours constructif ne prétend jamais atteindre plus que le graphe de portes');

const round = (value) => Math.round(value * 10) / 10;
console.log('M5 : 24 configurations × 2 graines = ' + totals.plans + ' plans · ' +
  'surfaces cumulées partition ' + round(totals.partitionArea) + ' / habitable ' + round(totals.habitableArea) +
  ' / murs ' + round(totals.wallArea) + ' / emprise ' + round(totals.grossFloorArea) + ' m² · ' +
  'pièces meublables ancien/nouveau ' + totals.oldFits + '/' + totals.newFits + ' · ' +
  'pièces atteintes graphe/parcours ' + totals.oldReachable + '/' + totals.newReachable + ' · ' +
  totals.hard + ' violation(s) bloquante(s).');
