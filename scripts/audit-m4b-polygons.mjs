/* M4b — portée réelle de la géométrie polygonale.
 *
 * Mesure trois écarts sur les plans publiés : fréquence des pièces non
 * rectangulaires, divergence entre le cache de boîte et le verdict exact,
 * et poses qui exploitent une partie absente de l'ancien `usableRect`.
 *
 *   node scripts/audit-m4b-polygons.mjs [--seeds=12]
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
['fit.data.js', 'contracts.js', 'construction.js', 'typologie.js', 'squelette.js',
  'placement.js', 'generator.js', 'rules.js'].forEach((file) => {
  new Function(readFileSync(join(root, 'assets', file), 'utf8'))();
});

const generator = globalThis.TechnoHabGenerator;
const fit = globalThis.TechnoHabFit;
const surfaces = [45, 75, 110, 180];
const seeds = Number((process.argv.find((arg) => arg.startsWith('--seeds=')) || '').split('=')[1]) || 12;
const result = {
  measuredAt: '2026-08-29',
  attemptedPlans: surfaces.length * seeds,
  generatedPlans: 0,
  rooms: 0,
  polygonRooms: 0,
  evaluatedPolygonRooms: 0,
  furnishedPolygonRooms: 0,
  boundsCacheDisagreements: 0,
  mainCacheDisagreements: 0,
  placementsInReturnedArea: 0,
  polygonRoomsUsingReturnedArea: 0
};

function contained(rectangle, container) {
  return rectangle.x0 >= container.x0 - 0.005 && rectangle.y0 >= container.y0 - 0.005 &&
    rectangle.x1 <= container.x1 + 0.005 && rectangle.y1 <= container.y1 + 0.005;
}

for (const surface of surfaces) {
  for (let index = 0; index < seeds; index += 1) {
    let plan;
    try {
      plan = generator.generatePlan({
        surface,
        bedrooms: surface < 60 ? 1 : surface < 100 ? 2 : surface < 150 ? 3 : 4,
        bathrooms: surface < 130 ? 1 : 2,
        separateKitchen: index % 2 === 0,
        includeWc: true,
        priority: ['compact', 'light', 'balanced'][index % 3]
      }, index, (surface * 1009 + index * 7919 + 404) >>> 0);
    } catch (_) {
      continue;
    }
    result.generatedPlans += 1;
    plan.rooms.forEach((room) => {
      result.rooms += 1;
      if (!room.placementGeometry || room.placementGeometry.kind !== 'polygon') return;
      result.polygonRooms += 1;
      if (typeof room.furnishable !== 'boolean') return;
      result.evaluatedPolygonRooms += 1;
      if (room.furnishable) result.furnishedPolygonRooms += 1;
      const bounds = room.usableBounds;
      const old = room.usableRect;
      const boundsCache = fit.fits(room.type, bounds.x1 - bounds.x0, bounds.y1 - bounds.y0);
      const mainCache = fit.fits(room.type, old.x1 - old.x0, old.y1 - old.y0);
      if (boundsCache !== room.furnishable) result.boundsCacheDisagreements += 1;
      if (mainCache !== room.furnishable) result.mainCacheDisagreements += 1;
      const oldLocal = {
        x0: old.x0 - bounds.x0, y0: old.y0 - bounds.y0,
        x1: old.x1 - bounds.x0, y1: old.y1 - bounds.y0
      };
      let usesReturn = false;
      (room.placements || []).forEach((pose) => {
        if (!contained(pose.footprint, oldLocal)) {
          result.placementsInReturnedArea += 1;
          usesReturn = true;
        }
      });
      if (usesReturn) result.polygonRoomsUsingReturnedArea += 1;
    });
  }
}

result.polygonRoomShare = result.rooms
  ? Math.round(result.polygonRooms / result.rooms * 1000) / 1000 : 0;
console.log(JSON.stringify(result, null, 2));
