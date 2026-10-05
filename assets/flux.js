/* Adaptateur de données uniquement ; le moteur géométrique reste dans Flux. */
(function (global) {
  'use strict';
  function isLocal(location) {
    return location.protocol === 'file:' ||
      ((location.protocol === 'http:' || location.protocol === 'https:') &&
       ['127.0.0.1', 'localhost', '[::1]'].indexOf(location.hostname) !== -1);
  }
  function proposalFromPlan(plan, appVersion) {
    return {
      format: 'flux-geometry-v1',
      source: 'technohab-' + appVersion,
      units: 'm',
      ringConvention: 'ccw-shell-cw-hole',
      // Les contours exportés et les surfaces sont arrondis : précision déclarée,
      // sans l'assimiler à une tolérance de construction.
      toleranceM2: 0.02,
      rooms: (plan.rooms || []).map(function (room) {
        var result = {
          id: room.id,
          usableRings: (room.usablePolygon || []).map(function (ring) {
            return ring.map(function (point) { return [point.x, point.y]; });
          })
        };
        if (typeof room.usableArea === 'number') result.declaredUsableAreaM2 = room.usableArea;
        return result;
      })
    };
  }
  global.TechnoHabFlux = Object.freeze({ isLocal: isLocal, proposalFromPlan: proposalFromPlan });
})(typeof globalThis !== 'undefined' ? globalThis : window);
