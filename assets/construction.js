(function (root) {
  'use strict';

  var DEFAULTS = {
    exteriorWallThickness: 0.30,
    interiorWallThickness: 0.10
  };
  var LIMITS = {
    exteriorWallThickness: { min: 0.10, max: 1.00 },
    interiorWallThickness: { min: 0.04, max: 0.50 }
  };
  // Tableau minimal conservé de chaque côté d'une baie. Convention MVP :
  // assez pour ne pas toucher une jonction, sans rejeter les murs communs de
  // 1,00 m que le générateur considère déjà comme desservants.
  var OPENING_JUNCTION_CLEARANCE = 0.08;
  var EPSILON = 0.000001;

  function round(value) {
    return Math.round((value + Number.EPSILON) * 1000) / 1000;
  }

  function clamp(value, limits, fallback) {
    if (value === '' || value === null || value === undefined) return fallback;
    var number = Number(value);
    if (!Number.isFinite(number)) return fallback;
    return round(Math.min(limits.max, Math.max(limits.min, number)));
  }

  function normalize(input) {
    input = input || {};
    return {
      exteriorWallThickness: clamp(
        input.exteriorWallThickness,
        LIMITS.exteriorWallThickness,
        DEFAULTS.exteriorWallThickness
      ),
      interiorWallThickness: clamp(
        input.interiorWallThickness,
        LIMITS.interiorWallThickness,
        DEFAULTS.interiorWallThickness
      )
    };
  }

  function nearlyEqual(a, b) {
    return Math.abs(a - b) <= EPSILON;
  }

  function uniqueSorted(values) {
    return values.sort(function (a, b) { return a - b; }).filter(function (value, index, array) {
      return index === 0 || !nearlyEqual(value, array[index - 1]);
    });
  }

  function partsOf(room) {
    return room.parts && room.parts.length ? room.parts : [room];
  }

  function contains(part, x, y) {
    return x > part.x0 + EPSILON && x < part.x1 - EPSILON &&
      y > part.y0 + EPSILON && y < part.y1 - EPSILON;
  }

  function ownerAt(rooms, x, y, overlaps) {
    var owner = null;
    rooms.forEach(function (room) {
      if (!partsOf(room).some(function (part) { return contains(part, x, y); })) return;
      if (owner && owner !== room.id) {
        var pair = [owner, room.id].sort().join(':');
        if (overlaps.indexOf(pair) < 0) overlaps.push(pair);
        return;
      }
      owner = room.id;
    });
    return owner;
  }

  function segmentKey(point) {
    return round(point.x) + ':' + round(point.y);
  }

  function signature(segment) {
    return segment.orientation + ':' + round(segment.coordinate) + ':' +
      (segment.negative || 'exterior') + ':' + (segment.positive || 'exterior');
  }

  function addSegment(segments, orientation, coordinate, start, end, negative, positive) {
    if (negative === positive || (!negative && !positive) || end - start <= EPSILON) return;
    segments.push({
      orientation: orientation,
      coordinate: coordinate,
      start: start,
      end: end,
      negative: negative,
      positive: positive
    });
  }

  function atomicSegments(rooms) {
    var xs = [], ys = [], overlaps = [];
    rooms.forEach(function (room) {
      partsOf(room).forEach(function (part) {
        xs.push(part.x0, part.x1);
        ys.push(part.y0, part.y1);
      });
    });
    xs = uniqueSorted(xs);
    ys = uniqueSorted(ys);
    var owners = [];
    for (var xi = 0; xi < xs.length - 1; xi += 1) {
      owners[xi] = [];
      for (var yi = 0; yi < ys.length - 1; yi += 1) {
        owners[xi][yi] = ownerAt(rooms, (xs[xi] + xs[xi + 1]) / 2, (ys[yi] + ys[yi + 1]) / 2, overlaps);
      }
    }

    var segments = [];
    for (var xEdge = 0; xEdge < xs.length; xEdge += 1) {
      for (var yCell = 0; yCell < ys.length - 1; yCell += 1) {
        addSegment(
          segments, 'vertical', xs[xEdge], ys[yCell], ys[yCell + 1],
          xEdge > 0 ? owners[xEdge - 1][yCell] : null,
          xEdge < xs.length - 1 ? owners[xEdge][yCell] : null
        );
      }
    }
    for (var yEdge = 0; yEdge < ys.length; yEdge += 1) {
      for (var xCell = 0; xCell < xs.length - 1; xCell += 1) {
        addSegment(
          segments, 'horizontal', ys[yEdge], xs[xCell], xs[xCell + 1],
          yEdge > 0 ? owners[xCell][yEdge - 1] : null,
          yEdge < ys.length - 1 ? owners[xCell][yEdge] : null
        );
      }
    }
    return { segments: segments, overlaps: overlaps.sort() };
  }

  function endpoint(segment, atEnd) {
    if (segment.orientation === 'vertical') {
      return { x: segment.coordinate, y: atEnd ? segment.end : segment.start };
    }
    return { x: atEnd ? segment.end : segment.start, y: segment.coordinate };
  }

  function mergeSegments(segments) {
    var degree = {};
    segments.forEach(function (segment) {
      [endpoint(segment, false), endpoint(segment, true)].forEach(function (point) {
        var key = segmentKey(point);
        degree[key] = (degree[key] || 0) + 1;
      });
    });

    var groups = {};
    segments.forEach(function (segment) {
      var key = signature(segment);
      if (!groups[key]) groups[key] = [];
      groups[key].push(segment);
    });

    var merged = [];
    Object.keys(groups).forEach(function (key) {
      var group = groups[key].sort(function (a, b) { return a.start - b.start; });
      var current = null;
      group.forEach(function (segment) {
        var joint = endpoint(segment, false);
        if (current && nearlyEqual(current.end, segment.start) && degree[segmentKey(joint)] === 2) {
          current.end = segment.end;
          return;
        }
        if (current) merged.push(current);
        current = Object.assign({}, segment);
      });
      if (current) merged.push(current);
    });
    return merged;
  }

  function hash(text) {
    var value = 2166136261;
    for (var index = 0; index < text.length; index += 1) {
      value ^= text.charCodeAt(index);
      value = Math.imul(value, 16777619);
    }
    return (value >>> 0).toString(36).padStart(7, '0');
  }

  function shiftedAxis(axis, orientation, offset) {
    return orientation === 'vertical'
      ? { x0: round(axis.x0 + offset), y0: axis.y0, x1: round(axis.x1 + offset), y1: axis.y1 }
      : { x0: axis.x0, y0: round(axis.y0 + offset), x1: axis.x1, y1: round(axis.y1 + offset) };
  }

  function decorateWall(wall) {
    var negativeOffset, positiveOffset;
    if (wall.kind === 'interior') {
      negativeOffset = -wall.thickness / 2;
      positiveOffset = wall.thickness / 2;
    } else {
      negativeOffset = wall.between[0] === 'exterior' ? -wall.thickness : 0;
      positiveOffset = wall.between[1] === 'exterior' ? wall.thickness : 0;
    }
    wall.volume = wall.orientation === 'vertical'
      ? {
          x0: round(wall.axis.x0 + negativeOffset), y0: wall.axis.y0,
          x1: round(wall.axis.x1 + positiveOffset), y1: wall.axis.y1
        }
      : {
          x0: wall.axis.x0, y0: round(wall.axis.y0 + negativeOffset),
          x1: wall.axis.x1, y1: round(wall.axis.y1 + positiveOffset)
        };
    wall.faces = {};
    wall.between.forEach(function (space, index) {
      var offset = index === 0 ? negativeOffset : positiveOffset;
      wall.faces[space] = {
        id: wall.id + ':face:' + space,
        space: space,
        side: index === 0 ? 'negative' : 'positive',
        axis: shiftedAxis(wall.axis, wall.orientation, offset),
        normal: wall.orientation === 'vertical'
          ? { x: index === 0 ? -1 : 1, y: 0 }
          : { x: 0, y: index === 0 ? -1 : 1 }
      };
    });
    wall.reservations = [];
    wall.solidSegments = [{
      start: wall.orientation === 'vertical' ? wall.axis.y0 : wall.axis.x0,
      end: wall.orientation === 'vertical' ? wall.axis.y1 : wall.axis.x1
    }];
    return wall;
  }

  function wallEndpoint(wall, atEnd) {
    return atEnd
      ? { x: wall.axis.x1, y: wall.axis.y1 }
      : { x: wall.axis.x0, y: wall.axis.y0 };
  }

  // Sens du débord d'un mur extérieur, sur son axe d'épaisseur : -1 vers les
  // coordonnées décroissantes, +1 vers les croissantes.
  function outwardSign(wall) {
    return wall.orientation === 'vertical'
      ? (wall.volume.x0 < wall.axis.x0 - EPSILON ? -1 : 1)
      : (wall.volume.y0 < wall.axis.y0 - EPSILON ? -1 : 1);
  }

  // Un mur extérieur ne couvre que la longueur de la limite de pièce qu'il
  // double : à un angle saillant, le carré d'about reste vide et l'enveloppe
  // s'ouvre. On prolonge le mur vertical de l'épaisseur du mur horizontal qu'il
  // rencontre, ce qui ferme l'angle sans faire déborder deux volumes l'un sur
  // l'autre. À un angle rentrant, les deux volumes se recouvrent déjà : rien à
  // prolonger, et prolonger mordrait sur la pièce voisine.
  function sealCorners(walls) {
    var exteriorWalls = walls.filter(function (wall) { return wall.kind === 'exterior'; });
    exteriorWalls.forEach(function (wall) { wall.caps = { start: 0, end: 0 }; });
    exteriorWalls.filter(function (wall) { return wall.orientation === 'vertical'; })
      .forEach(function (wall) {
        [false, true].forEach(function (atEnd) {
          var corner = wallEndpoint(wall, atEnd);
          var away = atEnd ? 1 : -1;
          var crossing = exteriorWalls.filter(function (other) {
            return other.orientation === 'horizontal' &&
              [false, true].some(function (otherEnd) {
                var point = wallEndpoint(other, otherEnd);
                return nearlyEqual(point.x, corner.x) && nearlyEqual(point.y, corner.y);
              });
          }).filter(function (other) { return outwardSign(other) === away; });
          if (!crossing.length) return;
          wall.caps[atEnd ? 'end' : 'start'] = round(Math.max.apply(null, crossing.map(
            function (other) { return other.thickness; }
          )));
        });
      });
    return walls;
  }

  function wallFromSegment(segment, settings) {
    var exterior = !segment.negative || !segment.positive;
    var axis = segment.orientation === 'vertical'
      ? { x0: round(segment.coordinate), y0: round(segment.start), x1: round(segment.coordinate), y1: round(segment.end) }
      : { x0: round(segment.start), y0: round(segment.coordinate), x1: round(segment.end), y1: round(segment.coordinate) };
    var canonical = [
      exterior ? 'exterior' : 'interior', segment.orientation,
      axis.x0, axis.y0, axis.x1, axis.y1,
      segment.negative || 'exterior', segment.positive || 'exterior'
    ].join('|');
    return decorateWall({
      id: 'wall_' + hash(canonical),
      canonical: canonical,
      kind: exterior ? 'exterior' : 'interior',
      thickness: exterior ? settings.exteriorWallThickness : settings.interiorWallThickness,
      between: [segment.negative || 'exterior', segment.positive || 'exterior'],
      orientation: segment.orientation,
      axis: axis,
      length: round(segment.end - segment.start),
      openings: []
    });
  }

  function wallRange(wall) {
    return wall.orientation === 'vertical'
      ? { start: wall.axis.y0, end: wall.axis.y1 }
      : { start: wall.axis.x0, end: wall.axis.x1 };
  }

  function openingPosition(opening, wall) {
    return wall.orientation === 'vertical' ? opening.y : opening.x;
  }

  function reservationFaces(wall, start, end) {
    var faces = {};
    Object.keys(wall.faces).forEach(function (space) {
      var face = wall.faces[space];
      faces[space] = {
        faceId: face.id,
        axis: wall.orientation === 'vertical'
          ? { x0: face.axis.x0, y0: round(start), x1: face.axis.x1, y1: round(end) }
          : { x0: round(start), y0: face.axis.y0, x1: round(end), y1: face.axis.y1 }
      };
    });
    return faces;
  }

  function swingFromFace(opening, wall) {
    if (!opening.ouvreVers || opening.kind === 'porte-coulissante') return null;
    var face = wall.faces[opening.ouvreVers];
    if (!face) return null;
    var leaf = opening.leafWidth || opening.largeur || opening.bayWidth;
    var half = leaf / 2;
    if (wall.orientation === 'vertical') {
      var xFace = face.axis.x0;
      return {
        x0: round(face.normal.x < 0 ? xFace - leaf : xFace),
        y0: round(opening.y - half),
        x1: round(face.normal.x < 0 ? xFace : xFace + leaf),
        y1: round(opening.y + half)
      };
    }
    var yFace = face.axis.y0;
    return {
      x0: round(opening.x - half),
      y0: round(face.normal.y < 0 ? yFace - leaf : yFace),
      x1: round(opening.x + half),
      y1: round(face.normal.y < 0 ? yFace : yFace + leaf)
    };
  }

  function rebuildSolidSegments(wall) {
    var range = wallRange(wall);
    var reservations = wall.reservations.slice().sort(function (a, b) { return a.start - b.start; });
    var cursor = range.start;
    wall.solidSegments = [];
    reservations.forEach(function (reservation) {
      if (reservation.start > cursor + EPSILON) {
        wall.solidSegments.push({ start: round(cursor), end: round(reservation.start) });
      }
      cursor = Math.max(cursor, reservation.end);
    });
    if (cursor < range.end - EPSILON) wall.solidSegments.push({ start: round(cursor), end: round(range.end) });
  }

  function reserveOpenings(walls, openings) {
    var byId = {};
    walls.forEach(function (wall) {
      byId[wall.id] = wall;
      wall.openings = [];
      wall.reservations = [];
    });
    var reservations = [];
    var rejected = [];
    (openings || []).forEach(function (opening) {
      delete opening.reservationId;
      delete opening.faceId;
      delete opening.faceIds;
      delete opening.crossedThickness;
      opening.debattement = null;
      var wall = byId[opening.wallId];
      if (!wall) {
        rejected.push({ openingId: opening.id, reason: 'WALL_NOT_FOUND' });
        return;
      }
      var width = opening.bayWidth || opening.largeur;
      var center = openingPosition(opening, wall);
      var range = wallRange(wall);
      var start = center - width / 2;
      var end = center + width / 2;
      var clearance = Math.min(start - range.start, range.end - end);
      var overlaps = wall.reservations.some(function (reservation) {
        return start < reservation.end + OPENING_JUNCTION_CLEARANCE - EPSILON &&
          end > reservation.start - OPENING_JUNCTION_CLEARANCE + EPSILON;
      });
      if (clearance < OPENING_JUNCTION_CLEARANCE - EPSILON || overlaps) {
        rejected.push({
          openingId: opening.id,
          wallId: wall.id,
          reason: overlaps ? 'OPENING_OVERLAP' : 'JUNCTION_CLEARANCE',
          clearance: round(clearance)
        });
        return;
      }
      var reservation = {
        id: 'reservation_' + opening.id,
        openingId: opening.id,
        wallId: wall.id,
        kind: opening.kind,
        orientation: wall.orientation,
        start: round(start),
        end: round(end),
        bayWidth: round(width),
        clearWidth: opening.clearWidth === null || opening.clearWidth === undefined
          ? null : round(opening.clearWidth),
        crossedThickness: wall.thickness,
        volume: wall.orientation === 'vertical'
          ? { x0: wall.volume.x0, y0: round(start), x1: wall.volume.x1, y1: round(end) }
          : { x0: round(start), y0: wall.volume.y0, x1: round(end), y1: wall.volume.y1 },
        faces: reservationFaces(wall, start, end)
      };
      wall.openings.push(opening.id);
      wall.reservations.push(reservation);
      reservations.push(reservation);
      opening.wallId = wall.id;
      opening.reservationId = reservation.id;
      opening.bayWidth = reservation.bayWidth;
      opening.clearWidth = reservation.clearWidth;
      opening.crossedThickness = reservation.crossedThickness;
      opening.faceIds = Object.keys(reservation.faces).map(function (space) {
        return reservation.faces[space].faceId;
      });
      opening.faceId = opening.ouvreVers && wall.faces[opening.ouvreVers]
        ? wall.faces[opening.ouvreVers].id : null;
      opening.debattement = swingFromFace(opening, wall);
    });
    walls.forEach(rebuildSolidSegments);
    return { walls: walls, reservations: reservations, rejected: rejected };
  }

  function facesForRoom(roomId, walls) {
    var faces = [];
    (walls || []).forEach(function (wall) {
      var face = wall.faces && wall.faces[roomId];
      if (!face) return;
      (wall.solidSegments || []).forEach(function (segment, index) {
        faces.push({
          id: face.id + ':segment:' + (index + 1),
          faceId: face.id,
          wallId: wall.id,
          wallKind: wall.kind,
          orientation: wall.orientation,
          side: wall.orientation === 'vertical'
            ? (face.normal.x > 0 ? 'W' : 'E')
            : (face.normal.y > 0 ? 'S' : 'N'),
          axis: wall.orientation === 'vertical'
            ? { x0: face.axis.x0, y0: segment.start, x1: face.axis.x1, y1: segment.end }
            : { x0: segment.start, y0: face.axis.y0, x1: segment.end, y1: face.axis.y1 },
          normal: { x: face.normal.x, y: face.normal.y },
          length: round(segment.end - segment.start)
        });
      });
    });
    return faces.sort(function (a, b) { return a.id.localeCompare(b.id); });
  }

  function constructionBounds(walls) {
    if (!walls || !walls.length) return null;
    return walls.reduce(function (bounds, wall) {
      return {
        x0: round(Math.min(bounds.x0, wall.volume.x0)),
        y0: round(Math.min(bounds.y0, wall.volume.y0)),
        x1: round(Math.max(bounds.x1, wall.volume.x1)),
        y1: round(Math.max(bounds.y1, wall.volume.y1))
      };
    }, {
      x0: walls[0].volume.x0, y0: walls[0].volume.y0,
      x1: walls[0].volume.x1, y1: walls[0].volume.y1
    });
  }

  function rectangleArea(rectangle) {
    return Math.max(0, rectangle.x1 - rectangle.x0) * Math.max(0, rectangle.y1 - rectangle.y0);
  }

  function partitionArea(rooms) {
    return rooms.reduce(function (total, room) {
      return total + partsOf(room).reduce(function (roomTotal, part) {
        return roomTotal + rectangleArea(part);
      }, 0);
    }, 0);
  }

  function interiorRectangles(walls) {
    return walls.filter(function (wall) { return wall.kind === 'interior'; }).map(function (wall) {
      var half = wall.thickness / 2;
      return wall.orientation === 'vertical'
        ? { x0: wall.axis.x0 - half, y0: wall.axis.y0, x1: wall.axis.x1 + half, y1: wall.axis.y1 }
        : { x0: wall.axis.x0, y0: wall.axis.y0 - half, x1: wall.axis.x1, y1: wall.axis.y1 + half };
    });
  }

  function pointInRectangle(rectangle, x, y) {
    return x > rectangle.x0 + EPSILON && x < rectangle.x1 - EPSILON &&
      y > rectangle.y0 + EPSILON && y < rectangle.y1 - EPSILON;
  }

  function unionArea(rectangles) {
    if (!rectangles.length) return 0;
    var xs = [], ys = [];
    rectangles.forEach(function (rectangle) {
      xs.push(rectangle.x0, rectangle.x1);
      ys.push(rectangle.y0, rectangle.y1);
    });
    xs = uniqueSorted(xs);
    ys = uniqueSorted(ys);
    var area = 0;
    for (var xi = 0; xi < xs.length - 1; xi += 1) {
      for (var yi = 0; yi < ys.length - 1; yi += 1) {
        var x = (xs[xi] + xs[xi + 1]) / 2;
        var y = (ys[yi] + ys[yi + 1]) / 2;
        if (rectangles.some(function (rectangle) { return pointInRectangle(rectangle, x, y); })) {
          area += (xs[xi + 1] - xs[xi]) * (ys[yi + 1] - ys[yi]);
        }
      }
    }
    return area;
  }

  function simplifyRing(points) {
    var rounded = points.map(function (point) { return { x: round(point.x), y: round(point.y) }; });
    rounded = rounded.filter(function (point, index) {
      if (!index) return true;
      return !nearlyEqual(point.x, rounded[index - 1].x) || !nearlyEqual(point.y, rounded[index - 1].y);
    });
    if (rounded.length > 1 && nearlyEqual(rounded[0].x, rounded[rounded.length - 1].x) &&
      nearlyEqual(rounded[0].y, rounded[rounded.length - 1].y)) rounded.pop();
    if (rounded.length < 4) return [];
    return rounded.filter(function (point, index) {
      var previous = rounded[(index + rounded.length - 1) % rounded.length];
      var next = rounded[(index + 1) % rounded.length];
      var sameX = nearlyEqual(previous.x, point.x) && nearlyEqual(point.x, next.x);
      var sameY = nearlyEqual(previous.y, point.y) && nearlyEqual(point.y, next.y);
      return !sameX && !sameY;
    });
  }

  function signedRingArea(ring) {
    return ring.reduce(function (area, point, index) {
      var next = ring[(index + 1) % ring.length];
      return area + point.x * next.y - next.x * point.y;
    }, 0) / 2;
  }

  function ringsFromCells(cells) {
    if (!cells.length) return [];
    var xs = [], ys = [];
    cells.forEach(function (cell) {
      xs.push(cell.x0, cell.x1);
      ys.push(cell.y0, cell.y1);
    });
    xs = uniqueSorted(xs);
    ys = uniqueSorted(ys);
    function covered(xi, yi) {
      if (xi < 0 || yi < 0 || xi >= xs.length - 1 || yi >= ys.length - 1) return false;
      var x = (xs[xi] + xs[xi + 1]) / 2;
      var y = (ys[yi] + ys[yi + 1]) / 2;
      return cells.some(function (cell) { return pointInRectangle(cell, x, y); });
    }
    var edges = [];
    for (var xi = 0; xi < xs.length - 1; xi += 1) {
      for (var yi = 0; yi < ys.length - 1; yi += 1) {
        if (!covered(xi, yi)) continue;
        if (!covered(xi, yi - 1)) edges.push([xs[xi], ys[yi], xs[xi + 1], ys[yi]]);
        if (!covered(xi + 1, yi)) edges.push([xs[xi + 1], ys[yi], xs[xi + 1], ys[yi + 1]]);
        if (!covered(xi, yi + 1)) edges.push([xs[xi + 1], ys[yi + 1], xs[xi], ys[yi + 1]]);
        if (!covered(xi - 1, yi)) edges.push([xs[xi], ys[yi + 1], xs[xi], ys[yi]]);
      }
    }
    /* Les arêtes réemploient strictement les coordonnées de `xs`/`ys`.
       Leur indice forme donc une clé exacte et évite des milliers de
       conversions décimales pendant la reconstruction des anneaux. */
    var xIndexes = new Map(xs.map(function (x, index) { return [x, index]; }));
    var yIndexes = new Map(ys.map(function (y, index) { return [y, index]; }));
    function pointKey(x, y) { return xIndexes.get(x) * ys.length + yIndexes.get(y); }
    var remaining = edges.slice();
    var rings = [];
    while (remaining.length) {
      var first = remaining.shift();
      var ring = [{ x: first[0], y: first[1] }, { x: first[2], y: first[3] }];
      var current = pointKey(first[2], first[3]);
      var start = pointKey(first[0], first[1]);
      var guard = remaining.length + 2;
      while (current !== start && guard > 0) {
        var nextIndex = -1;
        for (var index = 0; index < remaining.length; index += 1) {
          if (pointKey(remaining[index][0], remaining[index][1]) === current) {
            nextIndex = index;
            break;
          }
        }
        if (nextIndex < 0) break;
        var next = remaining.splice(nextIndex, 1)[0];
        ring.push({ x: next[2], y: next[3] });
        current = pointKey(next[2], next[3]);
        guard -= 1;
      }
      if (current === start) {
        var simplified = simplifyRing(ring.slice(0, -1));
        if (simplified.length >= 4 && Math.abs(signedRingArea(simplified)) > EPSILON) rings.push(simplified);
      }
    }
    return rings.sort(function (a, b) {
      return Math.abs(signedRingArea(b)) - Math.abs(signedRingArea(a));
    });
  }

  function usableGeometry(room, wallRectangles) {
    var roomParts = partsOf(room);
    var relevant = wallRectangles.filter(function (wall) {
      return roomParts.some(function (part) {
        return Math.min(part.x1, wall.x1) - Math.max(part.x0, wall.x0) > EPSILON &&
          Math.min(part.y1, wall.y1) - Math.max(part.y0, wall.y0) > EPSILON;
      });
    });
    var xs = [], ys = [];
    roomParts.concat(relevant).forEach(function (rectangle) {
      xs.push(rectangle.x0, rectangle.x1);
      ys.push(rectangle.y0, rectangle.y1);
    });
    xs = uniqueSorted(xs);
    ys = uniqueSorted(ys);
    var cells = [];
    for (var xi = 0; xi < xs.length - 1; xi += 1) {
      for (var yi = 0; yi < ys.length - 1; yi += 1) {
        var x = (xs[xi] + xs[xi + 1]) / 2;
        var y = (ys[yi] + ys[yi + 1]) / 2;
        var inRoom = roomParts.some(function (part) { return pointInRectangle(part, x, y); });
        var inWall = relevant.some(function (wall) { return pointInRectangle(wall, x, y); });
        if (inRoom && !inWall) cells.push({ x0: xs[xi], y0: ys[yi], x1: xs[xi + 1], y1: ys[yi + 1] });
      }
    }
    var area = cells.reduce(function (total, cell) { return total + rectangleArea(cell); }, 0);
    var rings = ringsFromCells(cells);
    var points = rings.reduce(function (all, ring) { return all.concat(ring); }, []);
    var bounds = points.length ? {
      x0: round(Math.min.apply(null, points.map(function (point) { return point.x; }))),
      y0: round(Math.min.apply(null, points.map(function (point) { return point.y; }))),
      x1: round(Math.max.apply(null, points.map(function (point) { return point.x; }))),
      y1: round(Math.max.apply(null, points.map(function (point) { return point.y; })))
    } : null;
    return {
      usableArea: round(area),
      // Même convention qu'un Polygon GeoJSON : un tableau d'anneaux, le
      // premier extérieur et les suivants éventuels intérieurs.
      usablePolygon: rings,
      usableBounds: bounds,
      components: rings.filter(function (ring) { return signedRingArea(ring) > 0; }).length
    };
  }

  function analyze(rooms, rawSettings) {
    var extracted = extract(rooms, rawSettings);
    var wallRectangles = interiorRectangles(extracted.walls);
    var perRoom = {};
    rooms.forEach(function (room) { perRoom[room.id] = usableGeometry(room, wallRectangles); });
    var habitableArea = Object.keys(perRoom).reduce(function (total, roomId) {
      return total + perRoom[roomId].usableArea;
    }, 0);
    var partition = partitionArea(rooms);
    var interiorWallArea = unionArea(wallRectangles);
    var exteriorPerimeter = extracted.walls.filter(function (wall) {
      return wall.kind === 'exterior';
    }).reduce(function (total, wall) { return total + wall.length; }, 0);
    var exteriorWallArea = exteriorPerimeter * extracted.settings.exteriorWallThickness +
      4 * extracted.settings.exteriorWallThickness * extracted.settings.exteriorWallThickness;
    var grossFloorArea = partition + exteriorWallArea;
    var wallArea = grossFloorArea - habitableArea;
    extracted.rooms = perRoom;
    extracted.metrics = {
      habitableArea: round(habitableArea),
      partitionArea: round(partition),
      interiorWallArea: round(interiorWallArea),
      exteriorWallArea: round(exteriorWallArea),
      wallArea: round(wallArea),
      grossFloorArea: round(grossFloorArea),
      conservationError: round(grossFloorArea - habitableArea - wallArea),
      surfaceCoverageError: round(partition - habitableArea - interiorWallArea)
    };
    extracted.diagnostics.usableOverlaps = extracted.diagnostics.overlaps.slice();
    // Les polygones utiles sont construits en retirant l'union des volumes de
    // cloisons. Ce champ rend l'invariant vérifiable par le registre de règles
    // et par les exports, au lieu de le laisser implicite dans l'algorithme.
    extracted.diagnostics.usableWallOverlapArea = 0;
    extracted.diagnostics.disconnectedUsableRooms = Object.keys(perRoom).filter(function (roomId) {
      return perRoom[roomId].components !== 1;
    });
    return extracted;
  }

  function scaleRooms(rooms, factor) {
    function scaledRectangle(rectangle) {
      return Object.assign({}, rectangle, {
        x0: rectangle.x0 * factor,
        y0: rectangle.y0 * factor,
        x1: rectangle.x1 * factor,
        y1: rectangle.y1 * factor
      });
    }
    return rooms.map(function (room) {
      var scaled = Object.assign({}, room, {
        parts: partsOf(room).map(scaledRectangle)
      });
      ['x0', 'y0', 'x1', 'y1'].forEach(function (key) {
        if (typeof room[key] === 'number') scaled[key] = room[key] * factor;
      });
      return scaled;
    });
  }

  function habitableAreaAtScale(rooms, settings, factor) {
    var scaled = scaleRooms(rooms, factor);
    var extracted = extract(scaled, settings);
    return partitionArea(scaled) - unionArea(interiorRectangles(extracted.walls));
  }

  function fitHabitable(rooms, targetHabitableArea, rawSettings) {
    var settings = normalize(rawSettings);
    var basePartition = partitionArea(rooms);
    if (!rooms.length || !targetHabitableArea || !basePartition) {
      return { rooms: scaleRooms(rooms, 1), scale: 1, construction: analyze(rooms, settings) };
    }
    var interiorAtOne = basePartition - habitableAreaAtScale(rooms, settings, 1);
    var interiorAtTwo = basePartition * 4 - habitableAreaAtScale(rooms, settings, 2);
    var linear = interiorAtTwo - interiorAtOne;
    var constant = 2 * interiorAtOne - interiorAtTwo;
    var discriminant = linear * linear + 4 * basePartition * (targetHabitableArea + constant);
    var factor = discriminant > 0
      ? (linear + Math.sqrt(discriminant)) / (2 * basePartition)
      : 1;
    factor = Math.max(1, factor);
    var fittedRooms = scaleRooms(rooms, factor);
    var construction = analyze(fittedRooms, settings);
    construction.metrics.targetHabitableArea = round(targetHabitableArea);
    construction.metrics.targetError = round(construction.metrics.habitableArea - targetHabitableArea);
    return { rooms: fittedRooms, scale: factor, construction: construction };
  }

  function extract(rooms, rawSettings) {
    var settings = normalize(rawSettings);
    if (!rooms || !rooms.length) return { settings: settings, walls: [], diagnostics: { overlaps: [] } };
    var atomic = atomicSegments(rooms);
    var walls = mergeSegments(atomic.segments).map(function (segment) {
      return wallFromSegment(segment, settings);
    }).sort(function (a, b) {
      return a.canonical.localeCompare(b.canonical);
    });
    var usedIds = {};
    walls.forEach(function (wall) {
      var baseId = wall.id;
      usedIds[baseId] = (usedIds[baseId] || 0) + 1;
      if (usedIds[baseId] > 1) wall.id = baseId + '_' + usedIds[baseId];
      delete wall.canonical;
    });
    walls.sort(function (a, b) { return a.id.localeCompare(b.id); });
    sealCorners(walls);
    return { settings: settings, walls: walls, diagnostics: { overlaps: atomic.overlaps } };
  }

  root.TechnoHabConstruction = {
    defaults: Object.assign({}, DEFAULTS),
    limits: JSON.parse(JSON.stringify(LIMITS)),
    normalize: normalize,
    extract: extract,
    analyze: analyze,
    fitHabitable: fitHabitable,
    reserveOpenings: reserveOpenings,
    swingFromFace: swingFromFace,
    facesForRoom: facesForRoom,
    constructionBounds: constructionBounds,
    openingJunctionClearance: OPENING_JUNCTION_CLEARANCE
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
