/* Audit M3 — orientations et ancrage extérieur des réseaux de circulation.
 *
 * Mesure le plan effectivement publié, pas les producteurs isolés : forme du
 * réseau, direction de ses branches, côtés extérieurs touchés, hôte de
 * l'entrée et nombre de pièces desservies par une porte.
 *
 *   node scripts/audit-circulation-orientations.mjs [--seeds=25]
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
['fit.data.js', 'contracts.js', 'construction.js', 'typologie.js', 'squelette.js',
  'placement.js', 'generator.js', 'rules.js'].forEach((file) => {
  new Function(readFileSync(join(root, 'assets', file), 'utf8'))();
});

const G = globalThis.TechnoHabGenerator;
const S = globalThis.TechnoHabSquelette;
const R = globalThis.TechnoHabRules;
const canonicalOnly = process.argv.includes('--canonical-only');
const withoutBranchCost = process.argv.includes('--without-branch-cost');
if (withoutBranchCost) {
  globalThis.TechnoHabAblations = Object.assign({}, globalThis.TechnoHabAblations, {
    disableM5BranchUtility: true
  });
}
if (canonicalOnly) {
  S.transformations = (pose) => [Object.assign({}, pose, {
    transformation: 'r0', equivalenceClass: 'ablation-canonical-r0'
  })];
}
const surfaces = [90, 130, 180, 250];
const seeds = Number((process.argv.find((arg) => arg.startsWith('--seeds=')) || '').split('=')[1]) || 25;
const increment = (record, key) => { record[key] = (record[key] || 0) + 1; };
const equivalenceClasses = new Set();

function orientation(parts) {
  const horizontal = parts.filter((part) => part.x1 - part.x0 > part.y1 - part.y0 + 0.05);
  const vertical = parts.filter((part) => part.y1 - part.y0 > part.x1 - part.x0 + 0.05);
  if (horizontal.length && !vertical.length) return 'E-W';
  if (vertical.length && !horizontal.length) return 'N-S';
  if (horizontal.length !== 1 || vertical.length !== 1) return 'complexe';

  const h = horizontal[0], v = vertical[0];
  const directions = [];
  if (h.x0 < v.x0 - 0.08) directions.push('W');
  if (h.x1 > v.x1 + 0.08) directions.push('E');
  if (v.y0 < h.y0 - 0.08) directions.push('N');
  if (v.y1 > h.y1 + 0.08) directions.push('S');
  return ['N', 'E', 'S', 'W'].filter((side) => directions.includes(side)).join('-');
}

const result = {
  measuredAt: '2026-08-30',
  method: `${surfaces.length} surfaces × ${seeds} graines fixes` +
    (canonicalOnly ? ' · ablation M4a, pose r0 seule' : ' · transformations M4a actives') +
    (withoutBranchCost ? ' · ablation coût des bras M5.0' : ''),
  attempted: surfaces.length * seeds,
  generated: 0,
  nonFound: 0,
  families: {},
  familiesBySurface: {},
  orientations: {},
  transforms: {},
  exteriorContactPlans: 0,
  exteriorContactLength: 0,
  exteriorSideSets: {},
  entranceHostedByCirculation: 0,
  entranceHosts: {},
  terminationPlans: 0,
  interiorTerminationPlans: 0,
  terminationCount: 0,
  terminationReceivers: {},
  facadeExcess: 0,
  facadeCost: 0,
  logicalArms: 0,
  emptyArms: 0,
  plansWithEmptyArm: 0,
  deadLength: 0,
  deadLengthCost: 0,
  branchSearchFallbackPlans: 0,
  hardCandidatesRejected: 0,
  plansWithHardRejection: 0,
  publishedHardPlans: 0,
  targetRequired: 0,
  targetMet: 0,
  targetCost: 0,
  comfortRequired: 0,
  comfortMet: 0,
  comfortCost: 0,
  roomsServedByDoor: 0
};

for (const surface of surfaces) {
  for (let variant = 0; variant < seeds; variant += 1) {
    const options = {
      surface,
      bedrooms: surface < 120 ? 3 : surface < 160 ? 4 : 5,
      bathrooms: surface >= 130 ? 2 : 1,
      separateKitchen: variant % 2 === 0,
      includeWc: true,
      priority: ['compact', 'light', 'economy'][variant % 3],
      shape: 'rectangle'
    };
    const seed = (20260829 + Math.imul(surface, 0x9E3779B1) + variant) >>> 0;
    let plan;
    try {
      plan = G.generatePlan(options, variant, seed);
    } catch (error) {
      if (error && error.code === 'NON_TROUVE') { result.nonFound += 1; continue; }
      throw error;
    }
    const circulation = plan.rooms.find((room) => room.type === 'circulation');
    if (!circulation) continue;
    result.generated += 1;
    increment(result.families, plan.topologyFamily || 'non-renseignee');
    result.familiesBySurface[surface] = result.familiesBySurface[surface] || {};
    increment(result.familiesBySurface[surface], plan.topologyFamily || 'non-renseignee');
    increment(result.transforms, plan.topologyTransform || 'non-renseignee');
    equivalenceClasses.add(plan.topologyEquivalenceClass || 'non-renseignee');
    const token = orientation(circulation.parts || [circulation]);
    increment(result.orientations, `${plan.topologyFamily || 'inconnue'}:${token}`);

    const exteriorSides = Array.from(new Set((circulation.wallFaces || [])
      .filter((face) => face.wallKind === 'exterior' && face.length > 0.08)
      .map((face) => face.side))).sort();
    if (exteriorSides.length) result.exteriorContactPlans += 1;
    result.exteriorContactLength += (circulation.wallFaces || [])
      .filter((face) => face.wallKind === 'exterior')
      .reduce((sum, face) => sum + face.length, 0);
    increment(result.exteriorSideSets, exteriorSides.join('-') || 'aucun');

    if (plan.entree && (plan.entree.entre || []).includes(circulation.id)) {
      result.entranceHostedByCirculation += 1;
    }
    const entranceRoom = plan.entree && (plan.entree.entre || []).find((id) => id !== 'exterior');
    const entranceHost = plan.rooms.find((room) => room.id === entranceRoom);
    increment(result.entranceHosts, entranceHost ? entranceHost.type : 'aucun');
    if (plan.topologyTerminationMethod === 'interior-room-cap-v1') {
      result.terminationPlans += 1;
      result.terminationCount += plan.topologyTerminations.length;
      if (!exteriorSides.length) result.interiorTerminationPlans += 1;
      plan.topologyTerminations.forEach((termination) => {
        const receiver = plan.rooms.find((room) => room.id === termination.receiver);
        increment(result.terminationReceivers, receiver ? receiver.type : termination.receiver);
      });
    }
    result.facadeExcess += plan.circulationObjective.facadeExcess || 0;
    result.facadeCost += plan.circulationObjective.facadeCost || 0;
    result.logicalArms += plan.circulationObjective.armCount || 0;
    result.emptyArms += plan.circulationObjective.emptyArmCount || 0;
    if (plan.circulationObjective.emptyArmCount) result.plansWithEmptyArm += 1;
    result.deadLength += plan.circulationObjective.deadLength || 0;
    result.deadLengthCost += plan.circulationObjective.deadLengthCost || 0;
    if (plan.circulationObjective.branchSearchFallback) result.branchSearchFallbackPlans += 1;
    result.hardCandidatesRejected += plan.hardCandidatesRejected || 0;
    if (plan.hardCandidatesRejected) result.plansWithHardRejection += 1;
    if (R.evaluatePlan(plan).summary.hard) result.publishedHardPlans += 1;
    if (plan.preferenceObjective) {
      result.targetRequired += plan.preferenceObjective.targetRequired || 0;
      result.targetMet += plan.preferenceObjective.targetMet || 0;
      result.targetCost += plan.preferenceObjective.targetCost || 0;
      result.comfortRequired += plan.preferenceObjective.comfortRequired || 0;
      result.comfortMet += plan.preferenceObjective.comfortMet || 0;
      result.comfortCost += plan.preferenceObjective.comfortCost || 0;
    }
    result.roomsServedByDoor += (plan.portes || []).filter((door) =>
      (door.entre || []).includes(circulation.id) &&
      (door.entre || []).some((id) => id !== circulation.id && id !== 'exterior')).length;
  }
}

result.meanRoomsServedByDoor = result.generated
  ? Number((result.roomsServedByDoor / result.generated).toFixed(2))
  : 0;
result.meanExteriorContactLength = result.generated
  ? Number((result.exteriorContactLength / result.generated).toFixed(2))
  : 0;
result.exteriorContactLength = Number(result.exteriorContactLength.toFixed(2));
result.meanFacadeExcess = result.generated
  ? Number((result.facadeExcess / result.generated).toFixed(2)) : 0;
result.meanFacadeCost = result.generated
  ? Number((result.facadeCost / result.generated).toFixed(2)) : 0;
result.meanDeadLength = result.generated
  ? Number((result.deadLength / result.generated).toFixed(2)) : 0;
result.meanDeadLengthCost = result.generated
  ? Number((result.deadLengthCost / result.generated).toFixed(2)) : 0;
result.facadeExcess = Number(result.facadeExcess.toFixed(2));
result.facadeCost = Number(result.facadeCost.toFixed(2));
result.deadLength = Number(result.deadLength.toFixed(2));
result.deadLengthCost = Number(result.deadLengthCost.toFixed(2));
result.equivalenceClassCount = equivalenceClasses.size;

console.log(JSON.stringify(result, null, 2));
