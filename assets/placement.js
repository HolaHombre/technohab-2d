(function (root) {
  'use strict';

  var STEP = 10;
  /* Plafond de nœuds par résolution quand l'appelant n'en fixe pas. Mesuré le
     25 septembre 2026 sur 3 884 résolutions du banc : 99 % aboutissent en moins
     de 750 nœuds, le maximum observé sous plafond est ~12 000. Un cas de 45 m²
     en a demandé 30 millions (3 équipements, acceptation finale presque
     jamais satisfaite) — 45 s, interface figée. Au-delà, la pose est déclarée
     « ne tient pas » et `searchLimitReached` le dit : un refus borné plutôt
     qu'un calcul sans fin. */
  var DEFAULT_MAX_NODES = 250000;
  var MIN_SIDE = 70;
  var MAX_SIDE = 600;
  var S4_STEP = 0.05;
  var S4_CLEARANCE = 0.60;
  var S4_APPROACH = 0.75;
  /* La réservation empêche l'emprise de mordre la baie ; la largeur de
     circulation de 60 cm est, elle, vérifiée par S4. Les confondre élimine
     les WC peu profonds alors que leur sol reste effectivement traversable. */
  var OPENING_RESERVATION_DEPTH = 0.10;

  function cm(meters) {
    return Math.round(meters * 100);
  }

  function overlaps(a, b) {
    return a.x0 < b.x1 - 0.5 && b.x0 < a.x1 - 0.5 &&
      a.y0 < b.y1 - 0.5 && b.y0 < a.y1 - 0.5;
  }

  function inside(rectangle, width, height) {
    return rectangle.x0 >= -0.5 && rectangle.y0 >= -0.5 &&
      rectangle.x1 <= width + 0.5 && rectangle.y1 <= height + 0.5;
  }

  // Une direction SVG naturelle regarde vers le bas (+y). Les quatre poses
  // cardinales portent donc explicitement l'angle qui transforme ce repère
  // vers l'intérieur de la pièce. L'ordre de préférence dépend de l'identité
  // de l'équipement : le solveur reste déterministe sans rabattre tous les
  // premiers choix sur le même mur.
  function orientationOffset(equipment) {
    var key = String(equipment.id || equipment.label || '');
    var hash = 0;
    for (var index = 0; index < key.length; index += 1) {
      hash = ((hash * 31) + key.charCodeAt(index)) >>> 0;
    }
    return hash % 4;
  }

  function oriented(list, equipment) {
    var offset = orientationOffset(equipment);
    return list.slice(offset).concat(list.slice(0, offset));
  }

  function seedValue(value) {
    if (Number.isFinite(value)) return value >>> 0;
    var key = String(value === undefined ? 'technohab' : value);
    var hash = 2166136261;
    for (var index = 0; index < key.length; index += 1) {
      hash ^= key.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }

  function randomFrom(seed) {
    var state = seedValue(seed) || 0x6D2B79F5;
    return function () {
      state ^= state << 13;
      state ^= state >>> 17;
      state ^= state << 5;
      return (state >>> 0) / 4294967296;
    };
  }

  function shuffle(list, random) {
    for (var index = list.length - 1; index > 0; index -= 1) {
      var other = Math.floor(random() * (index + 1));
      var current = list[index];
      list[index] = list[other];
      list[other] = current;
    }
    return list;
  }

  function centimetersRectangle(rectangle) {
    return Object.assign({}, rectangle, {
      x0: cm(rectangle.x0), y0: cm(rectangle.y0), x1: cm(rectangle.x1), y1: cm(rectangle.y1)
    });
  }

  function centimetersContext(context) {
    context = context || {};
    return {
      openings: (context.openings || []).map(function (opening) {
        return Object.assign({}, opening, { x: cm(opening.x), y: cm(opening.y), width: cm(opening.width || 0.8) });
      }),
      blocked: (context.blocked || []).map(centimetersRectangle),
      usablePolygon: (context.usablePolygon || []).map(function (ring) {
        return ring.map(function (point) { return { x: point.x * 100, y: point.y * 100 }; });
      }),
      faces: (context.faces || []).map(function (face) {
        return Object.assign({}, face, {
          axis: {
            x0: face.axis.x0 * 100, y0: face.axis.y0 * 100,
            x1: face.axis.x1 * 100, y1: face.axis.y1 * 100
          },
          length: face.length * 100
        });
      })
    };
  }

  function roomContext(room, plan) {
    var rectangle = room.usableBounds || room.usableRect || room;
    var width = rectangle.x1 - rectangle.x0, height = rectangle.y1 - rectangle.y0;
    var openings = [], blocked = [];
    function addOpening(opening, kind) {
      if (!opening) return;
      var x = opening.x - rectangle.x0, y = opening.y - rectangle.y0;
      var span = opening.bayWidth || opening.largeur || 0.8;
      /* L'axe d'une baie vit au milieu du mur, donc à 5 ou 15 cm du contour
         utile selon qu'il s'agit d'une cloison ou d'une façade. On reconnaît
         cette épaisseur puis on projette l'ancre sur la limite de la pièce. */
      if (x < -0.35 || y < -0.35 || x > width + 0.35 || y > height + 0.35) return;
      x = Math.max(0, Math.min(width, x));
      y = Math.max(0, Math.min(height, y));
      openings.push({ x: x, y: y, width: span, axis: opening.axe, kind: kind });
      var half = span / 2;
      var reservationDepth = kind === 'window' ? 0.60 : OPENING_RESERVATION_DEPTH;
      if (opening.axe === 'vertical') {
        var horizontalDirection = x <= width / 2 ? 1 : -1;
        blocked.push({
          x0: Math.max(0, Math.min(x, x + horizontalDirection * reservationDepth)),
          y0: Math.max(0, y - half),
          x1: Math.min(width, Math.max(x, x + horizontalDirection * reservationDepth)),
          y1: Math.min(height, y + half),
          footprintOnly: true
        });
      } else {
        var verticalDirection = y <= height / 2 ? 1 : -1;
        blocked.push({
          x0: Math.max(0, x - half),
          y0: Math.max(0, Math.min(y, y + verticalDirection * reservationDepth)),
          x1: Math.min(width, x + half),
          y1: Math.min(height, Math.max(y, y + verticalDirection * reservationDepth)),
          footprintOnly: true
        });
      }
      if (kind !== 'window' && opening.debattement && opening.ouvreVers === room.id) {
        blocked.push({
          x0: Math.max(0, opening.debattement.x0 - rectangle.x0),
          y0: Math.max(0, opening.debattement.y0 - rectangle.y0),
          x1: Math.min(width, opening.debattement.x1 - rectangle.x0),
          y1: Math.min(height, opening.debattement.y1 - rectangle.y0)
        });
      }
      if (kind === 'entry' && opening.arrivalZone) {
        blocked.push({
          x0: Math.max(0, opening.arrivalZone.x0 - rectangle.x0),
          y0: Math.max(0, opening.arrivalZone.y0 - rectangle.y0),
          x1: Math.min(width, opening.arrivalZone.x1 - rectangle.x0),
          y1: Math.min(height, opening.arrivalZone.y1 - rectangle.y0),
          // La zone doit rester libre de mobilier ; les zones d'usage et le
          // passage peuvent en revanche la partager, puisqu'elle est leur hôte.
          footprintOnly: true
        });
      }
    }
    (plan.portes || []).forEach(function (opening) {
      if ((opening.entre || []).indexOf(room.id) !== -1) addOpening(opening, 'door');
    });
    if (plan.entree && (plan.entree.entre || []).indexOf(room.id) !== -1) addOpening(plan.entree, 'entry');
    (plan.fenetres || []).forEach(function (opening) {
      if ((opening.entre || []).indexOf(room.id) !== -1) addOpening(opening, 'window');
    });
    return {
      rectangle: { w: width, h: height },
      origin: { x: rectangle.x0, y: rectangle.y0 },
      context: {
        openings: openings,
        blocked: blocked,
        usablePolygon: (room.usablePolygon || []).map(function (ring) {
          return ring.map(function (point) {
            return { x: point.x - rectangle.x0, y: point.y - rectangle.y0 };
          });
        }),
        faces: (room.wallFaces || []).map(function (face) {
          return {
            id: face.id, faceId: face.faceId, wallId: face.wallId,
            orientation: face.orientation, side: face.side, length: face.length,
            normal: { x: face.normal.x, y: face.normal.y },
            axis: {
              x0: face.axis.x0 - rectangle.x0, y0: face.axis.y0 - rectangle.y0,
              x1: face.axis.x1 - rectangle.x0, y1: face.axis.y1 - rectangle.y0
            }
          };
        })
      }
    };
  }

  function pointInRing(point, ring) {
    var inside = false;
    for (var index = 0, previous = ring.length - 1; index < ring.length; previous = index, index += 1) {
      var a = ring[index], b = ring[previous];
      if ((a.y > point.y) !== (b.y > point.y) &&
        point.x < (b.x - a.x) * (point.y - a.y) / (b.y - a.y) + a.x) inside = !inside;
    }
    return inside;
  }

  function pointInPolygon(point, polygon) {
    if (!polygon || !polygon.length) return true;
    return polygon.reduce(function (inside, ring) {
      return pointInRing(point, ring) ? !inside : inside;
    }, false);
  }

  function polygonIsRectangle(polygon) {
    if (!polygon || !polygon.length) return true;
    if (polygon.length !== 1) return false;
    var ring = polygon[0] || [];
    var points = ring.filter(function (point, index) {
      var previous = ring[(index + ring.length - 1) % ring.length];
      return !previous || Math.abs(point.x - previous.x) > 1e-9 || Math.abs(point.y - previous.y) > 1e-9;
    });
    var xs = Array.from(new Set(points.map(function (point) { return Math.round(point.x * 1000); })));
    var ys = Array.from(new Set(points.map(function (point) { return Math.round(point.y * 1000); })));
    if (xs.length !== 2 || ys.length !== 2) return false;
    return xs.every(function (x) {
      return ys.every(function (y) {
        return points.some(function (point) {
          return Math.round(point.x * 1000) === x && Math.round(point.y * 1000) === y;
        });
      });
    });
  }

  function s4DistanceTransform(free, nx, ny, width, height) {
    var infinity = 1e9, straight = S4_STEP, diagonal = S4_STEP * Math.SQRT2;
    var distances = new Float64Array(nx * ny);
    for (var index = 0; index < nx * ny; index += 1) {
      if (!free[index]) {
        distances[index] = 0;
        continue;
      }
      var column = index % nx, row = (index - column) / nx;
      var x = (column + 0.5) * S4_STEP, y = (row + 0.5) * S4_STEP;
      distances[index] = Math.min(infinity, x, y, Math.max(0, width - x), Math.max(0, height - y));
    }
    for (var row = 0; row < ny; row += 1) for (var column = 0; column < nx; column += 1) {
      var cell = row * nx + column;
      if (!distances[cell]) continue;
      if (column > 0) distances[cell] = Math.min(distances[cell], distances[cell - 1] + straight);
      if (row > 0) distances[cell] = Math.min(distances[cell], distances[cell - nx] + straight);
      if (column > 0 && row > 0) distances[cell] = Math.min(distances[cell], distances[cell - nx - 1] + diagonal);
      if (column < nx - 1 && row > 0) distances[cell] = Math.min(distances[cell], distances[cell - nx + 1] + diagonal);
    }
    for (var backwardRow = ny - 1; backwardRow >= 0; backwardRow -= 1) {
      for (var backwardColumn = nx - 1; backwardColumn >= 0; backwardColumn -= 1) {
        var backwardCell = backwardRow * nx + backwardColumn;
        if (!distances[backwardCell]) continue;
        if (backwardColumn < nx - 1) distances[backwardCell] = Math.min(distances[backwardCell], distances[backwardCell + 1] + straight);
        if (backwardRow < ny - 1) distances[backwardCell] = Math.min(distances[backwardCell], distances[backwardCell + nx] + straight);
        if (backwardColumn < nx - 1 && backwardRow < ny - 1) distances[backwardCell] = Math.min(distances[backwardCell], distances[backwardCell + nx + 1] + diagonal);
        if (backwardColumn > 0 && backwardRow < ny - 1) distances[backwardCell] = Math.min(distances[backwardCell], distances[backwardCell + nx - 1] + diagonal);
      }
    }
    return distances;
  }

  function s4Components(passable, nx, ny) {
    var labels = new Int32Array(nx * ny);
    labels.fill(-1);
    var count = 0, sizes = [];
    for (var start = 0; start < nx * ny; start += 1) {
      if (!passable[start] || labels[start] >= 0) continue;
      var stack = [start], size = 0;
      labels[start] = count;
      while (stack.length) {
        var cell = stack.pop(), column = cell % nx, row = (cell - column) / nx;
        size += 1;
        if (column > 0 && passable[cell - 1] && labels[cell - 1] < 0) { labels[cell - 1] = count; stack.push(cell - 1); }
        if (column < nx - 1 && passable[cell + 1] && labels[cell + 1] < 0) { labels[cell + 1] = count; stack.push(cell + 1); }
        if (row > 0 && passable[cell - nx] && labels[cell - nx] < 0) { labels[cell - nx] = count; stack.push(cell - nx); }
        if (row < ny - 1 && passable[cell + nx] && labels[cell + nx] < 0) { labels[cell + nx] = count; stack.push(cell + nx); }
      }
      sizes.push(size);
      count += 1;
    }
    return { labels: labels, count: count, sizes: sizes };
  }

  function s4Anchor(field, x, y, radius) {
    var best = -1, bestDistance = Infinity;
    var firstColumn = Math.max(0, Math.floor((x - radius) / S4_STEP));
    var lastColumn = Math.min(field.nx - 1, Math.ceil((x + radius) / S4_STEP));
    var firstRow = Math.max(0, Math.floor((y - radius) / S4_STEP));
    var lastRow = Math.min(field.ny - 1, Math.ceil((y + radius) / S4_STEP));
    for (var column = firstColumn; column <= lastColumn; column += 1) {
      for (var row = firstRow; row <= lastRow; row += 1) {
        var cell = row * field.nx + column;
        if (!field.passable[cell]) continue;
        var distanceToPoint = Math.hypot((column + 0.5) * S4_STEP - x, (row + 0.5) * S4_STEP - y);
        if (distanceToPoint <= radius && distanceToPoint < bestDistance) {
          bestDistance = distanceToPoint;
          best = cell;
        }
      }
    }
    return best;
  }

  function assessS4(placements, rectangle, context) {
    context = context || {};
    var width = rectangle.w, height = rectangle.h;
    var nx = Math.max(1, Math.ceil(width / S4_STEP));
    var ny = Math.max(1, Math.ceil(height / S4_STEP));
    var polygon = context.usablePolygon || [];
    var polygonal = !polygonIsRectangle(polygon);
    var free = new Uint8Array(nx * ny);
    for (var column = 0; column < nx; column += 1) {
      for (var row = 0; row < ny; row += 1) {
        var x = (column + 0.5) * S4_STEP, y = (row + 0.5) * S4_STEP;
        if (x > width || y > height || (polygonal && !pointInPolygon({ x: x, y: y }, polygon))) continue;
        free[row * nx + column] = 1;
      }
    }
    /* Les emprises occupent quelques rectangles compacts. Les rasteriser une
       fois évite de reparcourir tous les équipements pour chaque cellule S4. */
    placements.forEach(function (placement) {
      var footprint = placement.footprint;
      var firstColumn = Math.max(0, Math.floor(footprint.x0 / S4_STEP));
      var lastColumn = Math.min(nx - 1, Math.ceil(footprint.x1 / S4_STEP));
      var firstRow = Math.max(0, Math.floor(footprint.y0 / S4_STEP));
      var lastRow = Math.min(ny - 1, Math.ceil(footprint.y1 / S4_STEP));
      for (var occupiedColumn = firstColumn; occupiedColumn <= lastColumn; occupiedColumn += 1) {
        for (var occupiedRow = firstRow; occupiedRow <= lastRow; occupiedRow += 1) {
          var occupiedX = (occupiedColumn + 0.5) * S4_STEP;
          var occupiedY = (occupiedRow + 0.5) * S4_STEP;
          if (occupiedX > footprint.x0 && occupiedX < footprint.x1 &&
              occupiedY > footprint.y0 && occupiedY < footprint.y1) {
            free[occupiedRow * nx + occupiedColumn] = 0;
          }
        }
      }
    });
    var clearance = Number.isFinite(context.accessClearance) && context.accessClearance > 0
      ? context.accessClearance : S4_CLEARANCE;
    var distances = s4DistanceTransform(free, nx, ny, width, height);
    var passable = new Uint8Array(nx * ny);
    for (var index = 0; index < nx * ny; index += 1) {
      if (distances[index] + 1e-9 >= clearance / 2) passable[index] = 1;
    }
    var components = s4Components(passable, nx, ny);
    var field = { nx: nx, ny: ny, passable: passable };
    var accesses = (context.openings || []).filter(function (opening) { return opening.kind !== 'window'; });
    var accessCells = accesses.map(function (opening) {
      return s4Anchor(field, opening.x, opening.y, S4_APPROACH);
    }).filter(function (cell) { return cell >= 0; });
    var accessibleComponents = new Set(accessCells.map(function (cell) { return components.labels[cell]; }));
    var referenceComponent = accessCells.length ? components.labels[accessCells[0]] : null;
    var requiredZones = [];
    placements.forEach(function (placement) {
      if (placement.equipment && placement.equipment.required === false) return;
      (placement.usage || []).forEach(function (usage, usageIndex) {
        var declaredUsage = placement.equipment && placement.equipment.usage && placement.equipment.usage[usageIndex];
        if (declaredUsage && declaredUsage.accessRequired === false) return;
        requiredZones.push({ placement: placement, usage: usage, usageIndex: usageIndex });
      });
    });
    var disconnected = [];
    requiredZones.forEach(function (entry) {
      var usage = entry.usage;
      var centerX = (usage.x0 + usage.x1) / 2, centerY = (usage.y0 + usage.y1) / 2;
      var radius = Math.max(S4_APPROACH, Math.hypot(usage.x1 - usage.x0, usage.y1 - usage.y0) / 2 + 0.3);
      var cell = s4Anchor(field, centerX, centerY, radius);
      if (cell < 0 || components.labels[cell] !== referenceComponent) {
        disconnected.push({
          equipmentId: entry.placement.equipment && entry.placement.equipment.id || null,
          usageIndex: entry.usageIndex
        });
      }
    });
    var accessibleCells = 0;
    components.sizes.forEach(function (size, component) {
      if (component === referenceComponent) accessibleCells += size;
    });
    return {
      passes: accessCells.length === accesses.length && accessCells.length > 0 &&
        accessibleComponents.size === 1 && disconnected.length === 0,
      method: 'chamfer-grid-v1',
      resolution: S4_STEP,
      clearance: clearance,
      accessCount: accesses.length,
      anchoredAccessCount: accessCells.length,
      requiredUsageZones: requiredZones.length,
      reachableUsageZones: requiredZones.length - disconnected.length,
      disconnected: disconnected,
      componentCount: components.count,
      accessibleArea: Math.round(accessibleCells * S4_STEP * S4_STEP * 1000) / 1000
    };
  }

  function rectangleInPolygon(rectangle, polygon) {
    if (!polygon || !polygon.length) return true;
    var inset = Math.min(0.25,
      Math.max(0.01, (rectangle.x1 - rectangle.x0) / 4),
      Math.max(0.01, (rectangle.y1 - rectangle.y0) / 4));
    var inner = {
      x0: rectangle.x0 + inset, y0: rectangle.y0 + inset,
      x1: rectangle.x1 - inset, y1: rectangle.y1 - inset
    };
    var points = [
      { x: inner.x0, y: inner.y0 },
      { x: inner.x1, y: inner.y0 },
      { x: inner.x1, y: inner.y1 },
      { x: inner.x0, y: inner.y1 },
      { x: (rectangle.x0 + rectangle.x1) / 2, y: (rectangle.y0 + rectangle.y1) / 2 }
    ];
    if (!points.every(function (point) { return pointInPolygon(point, polygon); })) return false;
    /* Les coins et le centre ne suffisent pas : une encoche étroite peut
       traverser l'emprise sans contenir aucun de ces cinq points. Le contour
       utile construit par TechnoHab est orthogonal ; toute arête qui traverse
       l'intérieur du rectangle prouve donc qu'une part de l'emprise sort du
       sol utile. Une arête confondue avec le bord reste admise. */
    return !polygon.some(function (ring) {
      return ring.some(function (point, index) {
        var next = ring[(index + 1) % ring.length];
        if (Math.abs(point.y - next.y) < 0.01) {
          return point.y > inner.y0 && point.y < inner.y1 &&
            Math.max(Math.min(point.x, next.x), inner.x0) <
              Math.min(Math.max(point.x, next.x), inner.x1);
        }
        if (Math.abs(point.x - next.x) < 0.01) {
          return point.x > inner.x0 && point.x < inner.x1 &&
            Math.max(Math.min(point.y, next.y), inner.y0) <
              Math.min(Math.max(point.y, next.y), inner.y1);
        }
        return point.x > inner.x0 && point.x < inner.x1 &&
          point.y > inner.y0 && point.y < inner.y1;
      });
    });
  }

  function poseCenter(pose) {
    return { x: (pose.foot.x0 + pose.foot.x1) / 2, y: (pose.foot.y0 + pose.foot.y1) / 2 };
  }

  function candidatePreference(pose, width, height, family, context, equipment) {
    var center = poseCenter(pose);
    var distanceToCenter = Math.hypot(center.x - width / 2, center.y - height / 2);
    var cornerDistance = Math.min(center.x, center.y, width - center.x, height - center.y);
    var openingDistance = (context.openings || []).reduce(function (minimum, opening) {
      return Math.min(minimum, Math.hypot(center.x - opening.x, center.y - opening.y));
    }, Math.max(width, height));
    var preferredWall = equipment && equipment.program === 'kitchen' ? 'S'
      : equipment && equipment.program === 'living' ? 'N'
      : ['S', 'E', 'N', 'W'][seedValue(family) % 4];
    if (family === 'linear') return ((pose.side || pose.wall) === preferredWall ? 4 : pose.wall ? 2 : 0) + cornerDistance / 300;
    if (family === 'focal') return (pose.wall ? 2 : 1) + distanceToCenter / Math.max(width, height);
    if (family === 'compact') return 3 - cornerDistance / Math.max(width, height);
    if (family === 'central') return 3 - distanceToCenter / Math.max(width, height);
    if (family === 'access') return openingDistance / Math.max(width, height) + cornerDistance / 500;
    return cornerDistance / 300 - distanceToCenter / Math.max(width, height);
  }

  function wallPose(face, offset, equipmentWidth, equipmentDepth) {
    var horizontal = face.orientation === 'horizontal';
    var start = horizontal ? Math.min(face.axis.x0, face.axis.x1) : Math.min(face.axis.y0, face.axis.y1);
    var along = start + offset;
    if (horizontal && face.normal.y > 0) {
      return { foot: { x0: along, y0: face.axis.y0, x1: along + equipmentWidth, y1: face.axis.y0 + equipmentDepth }, rotation: 0 };
    }
    if (horizontal) {
      return { foot: { x0: along, y0: face.axis.y0 - equipmentDepth, x1: along + equipmentWidth, y1: face.axis.y0 }, rotation: 180 };
    }
    if (face.normal.x > 0) {
      return { foot: { x0: face.axis.x0, y0: along, x1: face.axis.x0 + equipmentDepth, y1: along + equipmentWidth }, rotation: 270 };
    }
    return { foot: { x0: face.axis.x0 - equipmentDepth, y0: along, x1: face.axis.x0, y1: along + equipmentWidth }, rotation: 90 };
  }

  function poseTouchesPolygonCorner(pose, polygon) {
    if (!polygon || !polygon.length) return true;
    var tolerance = 6;
    var corners = [
      { x: pose.foot.x0, y: pose.foot.y0 }, { x: pose.foot.x1, y: pose.foot.y0 },
      { x: pose.foot.x1, y: pose.foot.y1 }, { x: pose.foot.x0, y: pose.foot.y1 }
    ];
    return polygon.some(function (ring) {
      return ring.some(function (point) {
        return corners.some(function (corner) {
          return Math.abs(point.x - corner.x) <= tolerance && Math.abs(point.y - corner.y) <= tolerance;
        });
      });
    });
  }

  function offsetsOnSpan(span, cornersOnly) {
    if (cornersOnly) return span > 0 ? [0, span] : [0];
    var offsets = [];
    for (var offset = 0; offset <= span; offset += STEP) offsets.push(offset);
    // La grille n'atteint presque jamais la fin exacte du mur. L'ajouter rend
    // les deux extrémités disponibles sans changer le pas des poses internes.
    if (!offsets.length || Math.abs(offsets[offsets.length - 1] - span) > 0.5) offsets.push(span);
    return offsets;
  }

  function* poses(equipment, width, height, context) {
    var equipmentWidth = cm(equipment.footprint.w);
    var equipmentDepth = cm(equipment.footprint.d);
    var anchor = equipment.anchor || 'free';
    var walls = oriented([
      { id: 'S', rotation: 0, foot: function (offset) { return { x0: offset, y0: 0, x1: offset + equipmentWidth, y1: equipmentDepth }; }, span: width - equipmentWidth, inward: { x: 0, y: 1 } },
      { id: 'E', rotation: 90, foot: function (offset) { return { x0: width - equipmentDepth, y0: offset, x1: width, y1: offset + equipmentWidth }; }, span: height - equipmentWidth, inward: { x: -1, y: 0 } },
      { id: 'N', rotation: 180, foot: function (offset) { return { x0: offset, y0: height - equipmentDepth, x1: offset + equipmentWidth, y1: height }; }, span: width - equipmentWidth, inward: { x: 0, y: -1 } },
      { id: 'W', rotation: 270, foot: function (offset) { return { x0: 0, y0: offset, x1: equipmentDepth, y1: offset + equipmentWidth }; }, span: height - equipmentWidth, inward: { x: 1, y: 0 } }
    ], equipment);

    if (anchor === 'free') {
      var freeOrientations = oriented([
        { rotation: 0, w: equipmentWidth, d: equipmentDepth, inward: { x: 0, y: 1 } },
        { rotation: 90, w: equipmentDepth, d: equipmentWidth, inward: { x: -1, y: 0 } },
        { rotation: 180, w: equipmentWidth, d: equipmentDepth, inward: { x: 0, y: -1 } },
        { rotation: 270, w: equipmentDepth, d: equipmentWidth, inward: { x: 1, y: 0 } }
      ], equipment);
      for (var freeOrientation of freeOrientations) {
        for (var x = 0; x + freeOrientation.w <= width; x += STEP) {
          for (var y = 0; y + freeOrientation.d <= height; y += STEP) {
            var foot = { x0: x, y0: y, x1: x + freeOrientation.w, y1: y + freeOrientation.d };
            for (var usage of usageSets(equipment, foot, freeOrientation.inward, width, height)) {
              if (!rectangleInPolygon(foot, context.usablePolygon)) continue;
              if (!usage.every(function (rectangle) { return rectangleInPolygon(rectangle, context.usablePolygon); })) continue;
              yield {
                foot: foot, usage: usage, rotation: freeOrientation.rotation,
                wall: null, inward: freeOrientation.inward
              };
            }
          }
        }
      }
      return;
    }

    if (context.faces && context.faces.length) {
      for (var face of oriented(context.faces, equipment)) {
        var span = face.length - equipmentWidth;
        if (span < 0) continue;
        for (var faceOffset of offsetsOnSpan(span, anchor === 'corner')) {
          var candidate = wallPose(face, faceOffset, equipmentWidth, equipmentDepth);
          if (anchor === 'corner' && !poseTouchesPolygonCorner(candidate, context.usablePolygon)) continue;
          if (!rectangleInPolygon(candidate.foot, context.usablePolygon)) continue;
          for (var faceUsage of usageSets(equipment, candidate.foot, face.normal, width, height)) {
            if (!faceUsage.every(function (rectangle) { return rectangleInPolygon(rectangle, context.usablePolygon); })) continue;
            yield {
              foot: candidate.foot, usage: faceUsage, rotation: candidate.rotation,
              wall: face.wallId, faceId: face.id, wallFaceId: face.faceId,
              wallAxis: face.orientation === 'horizontal' ? 'x' : 'y',
              wallSpan: face.length, wallOffset: faceOffset + equipmentWidth / 2,
              side: face.side || null, inward: face.normal
            };
          }
        }
      }
      return;
    }

    for (var wall of walls) {
      if (wall.span < 0) continue;
      for (var offset of offsetsOnSpan(wall.span, anchor === 'corner')) {
        var wallFoot = wall.foot(offset);
        if (!rectangleInPolygon(wallFoot, context.usablePolygon)) continue;
        for (var wallUsage of usageSets(equipment, wallFoot, wall.inward, width, height)) {
          if (!wallUsage.every(function (rectangle) {
            return rectangleInPolygon(rectangle, context.usablePolygon);
          })) continue;
          yield {
            foot: wallFoot, usage: wallUsage, rotation: wall.rotation,
            wall: wall.id, inward: wall.inward
          };
        }
      }
    }
  }

  function* usageSets(equipment, foot, inward, width, height) {
    var specs = equipment.usage || [];
    var fixed = [];
    var choices = [];

    specs.forEach(function (spec) {
      var minimum = cm(spec.min);
      if (spec.face === 'front' || spec.face === 'foot') {
        /* Pour un équipement mural, `inward` part du mur d'ancrage vers la
           pièce. Le bord frontal est donc le pied d'un lit ancré par sa tête.
           `foot` garde un vocabulaire métier explicite tout en partageant la
           même géométrie que `front`. */
        fixed.push(front(foot, inward, minimum, spec.width ? cm(spec.width) : null));
      } else if (spec.face === 'back') {
        // Un siège regarde son poste de travail ; son recul de circulation se
        // trouve donc derrière lui, à l'opposé de son vecteur d'orientation.
        fixed.push(front(foot, { x: -inward.x, y: -inward.y }, minimum,
          spec.width ? cm(spec.width) : null));
      } else if (spec.face === 'long') {
        var bands = longSides(foot, inward, minimum);
        if ((spec.sides || 1) >= 2) fixed.push.apply(fixed, bands);
        else choices.push(bands);
      } else if (spec.face === 'around') {
        fixed.push({ x0: foot.x0 - minimum, y0: foot.y0 - minimum, x1: foot.x1 + minimum, y1: foot.y1 + minimum });
      }
    });

    var combinations = choices.reduce(function (sets, options) {
      return sets.reduce(function (result, set) {
        return result.concat(options.map(function (option) { return set.concat([option]); }));
      }, []);
    }, [[]]);

    for (var combination of combinations) {
      var exclusive = specs.some(function (spec) { return spec.exclusive; });
      var usage = fixed.concat(combination).map(function (rectangle) {
        return Object.assign({}, rectangle, { exclusive: exclusive });
      });
      if (usage.every(function (rectangle) { return inside(rectangle, width, height); })) yield usage;
    }
  }

  function front(foot, inward, minimum, width) {
    if (inward.y === 1) return band(foot.x0, foot.y1, foot.x1, foot.y1 + minimum, width, 'x');
    if (inward.y === -1) return band(foot.x0, foot.y0 - minimum, foot.x1, foot.y0, width, 'x');
    if (inward.x === 1) return band(foot.x1, foot.y0, foot.x1 + minimum, foot.y1, width, 'y');
    return band(foot.x0 - minimum, foot.y0, foot.x0, foot.y1, width, 'y');
  }

  function band(x0, y0, x1, y1, width, axis) {
    if (!width) return { x0: x0, y0: y0, x1: x1, y1: y1 };
    if (axis === 'x') {
      var horizontalCenter = (x0 + x1) / 2;
      return { x0: horizontalCenter - width / 2, y0: y0, x1: horizontalCenter + width / 2, y1: y1 };
    }
    var verticalCenter = (y0 + y1) / 2;
    return { x0: x0, y0: verticalCenter - width / 2, x1: x1, y1: verticalCenter + width / 2 };
  }

  function longSides(foot, inward, minimum) {
    if (inward.y !== 0) {
      return [
        { x0: foot.x0 - minimum, y0: foot.y0, x1: foot.x0, y1: foot.y1 },
        { x0: foot.x1, y0: foot.y0, x1: foot.x1 + minimum, y1: foot.y1 }
      ];
    }
    return [
      { x0: foot.x0, y0: foot.y0 - minimum, x1: foot.x1, y1: foot.y0 },
      { x0: foot.x0, y0: foot.y1, x1: foot.x1, y1: foot.y1 + minimum }
    ];
  }

  function solveCentimeters(equipments, width, height, options) {
    options = options || {};
    options.context = options.context || { openings: [], blocked: [] };
    var placed = [];
    var deepestFailure = null;
    var relationRejected = false;
    var candidateSets = [];
    var visited = 0;
    var partialAbort = false;
    var partialRejections = 0;

    /* Les poses d'un équipement ne dépendent ni des poses déjà posées ni de
       la profondeur : elles ne changent pas d'un nœud à l'autre. Recalculées à
       chaque visite (générateur relancé), elles dominaient le coût — mesuré
       le 25 septembre 2026 : `usageSets` et `poses` = 40 s sur 45 s d'un cas
       de 45 m² qui ne se terminait pas. Le tampon est rempli à la demande,
       dans le MÊME ordre que le générateur : le premier échec ou succès de la
       recherche est inchangé, seul son coût l'est. */
    var lazyPoses = [];
    function cachedPoses(index) {
      if (!lazyPoses[index]) {
        var buffer = [], source = null, exhausted = false;
        lazyPoses[index] = {
          [Symbol.iterator]: function () {
            var position = 0;
            return {
              next: function () {
                if (position < buffer.length) return { value: buffer[position++], done: false };
                if (exhausted) return { value: undefined, done: true };
                if (!source) source = poses(equipments[index], width, height, options.context);
                var step = source.next();
                if (step.done) { exhausted = true; return step; }
                buffer.push(step.value);
                position += 1;
                return { value: step.value, done: false };
              }
            };
          }
        };
      }
      return lazyPoses[index];
    }

    function candidates(index) {
      if (!options.random && !options.family) return cachedPoses(index);
      if (!candidateSets[index]) {
        candidateSets[index] = Array.from(poses(equipments[index], width, height, options.context));
        if (options.family) {
          candidateSets[index] = candidateSets[index].map(function (pose) {
            return { pose: pose, rank: candidatePreference(pose, width, height, options.family, options.context, equipments[index]) + (options.random ? options.random() * 0.12 : 0) };
          }).sort(function (a, b) { return b.rank - a.rank; }).slice(0, options.candidateLimit || 80).map(function (entry) { return entry.pose; });
        } else {
          candidateSets[index] = shuffle(candidateSets[index], options.random);
        }
      }
      return candidateSets[index];
    }

    function attempt(index) {
      if (index === equipments.length) {
        if (!options.accept || options.accept(placed)) return true;
        relationRejected = true;
        return false;
      }
      for (var pose of candidates(index)) {
        visited += 1;
        if (visited > (options.maxNodes || DEFAULT_MAX_NODES)) return false;
        if (!inside(pose.foot, width, height)) continue;
        if (!rectangleInPolygon(pose.foot, options.context.usablePolygon)) continue;
        if (!pose.usage.every(function (usage) {
          return rectangleInPolygon(usage, options.context.usablePolygon);
        })) continue;
        if ((options.context.blocked || []).some(function (blocked) { return overlaps(blocked, pose.foot); })) continue;
        if ((options.context.blocked || []).some(function (blocked) {
          if (blocked.footprintOnly) return false;
          return pose.usage.some(function (usage) { return overlaps(blocked, usage); });
        })) continue;
        if (placed.some(function (entry) { return overlaps(entry.foot, pose.foot); })) continue;
        if (placed.some(function (entry) { return pose.usage.some(function (usage) { return overlaps(usage, entry.foot); }); })) continue;
        if (placed.some(function (entry) { return entry.usage.some(function (usage) { return overlaps(usage, pose.foot); }); })) continue;
        var clash = placed.some(function (entry) {
          return entry.usage.some(function (placedUsage) {
            return pose.usage.some(function (newUsage) {
              return (placedUsage.exclusive || newUsage.exclusive) && overlaps(placedUsage, newUsage);
            });
          });
        });
        if (clash) continue;
        placed.push(pose);
        if (options.acceptPartial && !options.acceptPartial(placed)) {
          placed.pop();
          partialRejections += 1;
          if (options.maxPartialRejections && partialRejections >= options.maxPartialRejections) {
            partialAbort = true;
            return false;
          }
          continue;
        }
        if (attempt(index + 1)) return true;
        placed.pop();
        if (partialAbort) return false;
      }
      if (!deepestFailure || index >= deepestFailure.index) {
        deepestFailure = { index: index, equipment: equipments[index] };
      }
      return false;
    }

    var success = attempt(0);
    return {
      fits: success, placed: success ? placed.slice() : [], failure: deepestFailure,
      relationRejected: relationRejected, searchLimitReached: visited > (options.maxNodes || DEFAULT_MAX_NODES),
      visitedNodes: visited
    };
  }

  function fits(equipments, width, height) {
    return solveCentimeters(equipments, width, height).fits;
  }

  function envelope(equipments) {
    var pairs = [];
    var ceiling = MAX_SIDE;
    for (var width = MIN_SIDE; width <= MAX_SIDE; width += STEP) {
      var found = null;
      for (var height = MIN_SIDE; height <= ceiling; height += STEP) {
        if (fits(equipments, width, height)) {
          found = height;
          break;
        }
      }
      if (found === null) continue;
      ceiling = found;
      if (!pairs.length || found < pairs[pairs.length - 1][1]) pairs.push([width, found]);
      if (found === MIN_SIDE) break;
    }
    return pairs;
  }

  function meters(rectangle) {
    return {
      x0: rectangle.x0 / 100,
      y0: rectangle.y0 / 100,
      x1: rectangle.x1 / 100,
      y1: rectangle.y1 / 100
    };
  }

  function publicPlacements(placed, equipments) {
    return placed.map(function (pose, index) {
      return {
        equipment: equipments[index],
        footprint: meters(pose.foot),
        usage: pose.usage.map(meters),
        rotation: pose.rotation,
        wall: pose.wall,
        wallId: pose.wall,
        faceId: pose.faceId || null,
        wallFaceId: pose.wallFaceId || null,
        wallAxis: pose.wallAxis || null,
        wallSpan: pose.wallSpan === undefined ? null : pose.wallSpan / 100,
        wallOffset: pose.wallOffset === undefined ? null : pose.wallOffset / 100,
        side: pose.side || null,
        inward: { x: pose.inward.x, y: pose.inward.y }
      };
    });
  }

  function placementCenter(placement) {
    return {
      x: (placement.footprint.x0 + placement.footprint.x1) / 2,
      y: (placement.footprint.y0 + placement.footprint.y1) / 2
    };
  }

  function placementIndex(placements) {
    var indexed = {};
    placements.forEach(function (placement) {
      if (!indexed[placement.equipment.id]) indexed[placement.equipment.id] = placement;
    });
    return indexed;
  }

  function placementWall(placement) {
    return placement && (placement.wallId || placement.wall);
  }

  function relationMembers(relation, indexed) {
    return {
      subject: indexed[relation.subject],
      target: relation.target ? indexed[relation.target] : null,
      targets: (relation.targets || []).map(function (id) { return indexed[id]; })
    };
  }

  function distance(a, b) {
    var dx = a.x - b.x, dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  function footprintGap(a, b) {
    var dx = Math.max(a.footprint.x0 - b.footprint.x1, b.footprint.x0 - a.footprint.x1, 0);
    var dy = Math.max(a.footprint.y0 - b.footprint.y1, b.footprint.y0 - a.footprint.y1, 0);
    return Math.sqrt(dx * dx + dy * dy);
  }

  function rangeSatisfied(value, relation) {
    return (!Number.isFinite(relation.min) || value + 0.005 >= relation.min) &&
      (!Number.isFinite(relation.max) || value <= relation.max + 0.005);
  }

  function rangeQuality(value, relation) {
    var target = Number.isFinite(relation.targetDistance) ? relation.targetDistance
      : (Number.isFinite(relation.min) && Number.isFinite(relation.max) ? (relation.min + relation.max) / 2 : value);
    var lowerSpan = Math.max(0.01, Number.isFinite(relation.min) ? target - relation.min : Math.abs(target) || 1);
    var upperSpan = Math.max(0.01, Number.isFinite(relation.max) ? relation.max - target : Math.abs(target) || 1);
    if (value < target) return Math.max(0, 1 - Math.abs(value - target) / (lowerSpan * 2));
    return Math.max(0, 1 - Math.abs(value - target) / (upperSpan * 2));
  }

  function pointRectangleDistance(point, rectangle) {
    var dx = Math.max(rectangle.x0 - point.x, 0, point.x - rectangle.x1);
    var dy = Math.max(rectangle.y0 - point.y, 0, point.y - rectangle.y1);
    return Math.sqrt(dx * dx + dy * dy);
  }

  /* Deux équipements muraux se font face lorsque leurs directions intérieures
     sont opposées et que leurs emprises se recouvrent sur l'axe transversal.
     Le dégagement entre leurs façades est une contrainte du programme. */
  function facingClearanceSatisfied(placements, minimum) {
    if (!Number.isFinite(minimum) || minimum <= 0) return true;
    for (var first = 0; first < placements.length; first += 1) {
      for (var second = first + 1; second < placements.length; second += 1) {
        var a = placements[first], b = placements[second];
        if (!a.inward || !b.inward || a.inward.x * b.inward.x + a.inward.y * b.inward.y > -0.9) continue;
        var horizontalFacing = Math.abs(a.inward.x) > 0.9;
        var transverseOverlap = horizontalFacing
          ? Math.min(a.footprint.y1, b.footprint.y1) - Math.max(a.footprint.y0, b.footprint.y0)
          : Math.min(a.footprint.x1, b.footprint.x1) - Math.max(a.footprint.x0, b.footprint.x0);
        if (transverseOverlap <= 0.01) continue;
        var gap = horizontalFacing
          ? Math.max(0, Math.max(a.footprint.x0, b.footprint.x0) - Math.min(a.footprint.x1, b.footprint.x1))
          : Math.max(0, Math.max(a.footprint.y0, b.footprint.y0) - Math.min(a.footprint.y1, b.footprint.y1));
        if (gap + 0.005 < minimum) return false;
      }
    }
    return true;
  }

  function betweenOnWall(subject, first, second) {
    var wall = placementWall(subject);
    if (!subject || !first || !second || !wall || wall !== placementWall(first) || wall !== placementWall(second)) return false;
    var axis = subject.wallAxis || (subject.wall === 'S' || subject.wall === 'N' ? 'x' : 'y');
    var subjectValue = placementCenter(subject)[axis];
    var firstValue = placementCenter(first)[axis];
    var secondValue = placementCenter(second)[axis];
    return subjectValue >= Math.min(firstValue, secondValue) && subjectValue <= Math.max(firstValue, secondValue);
  }

  function relationSatisfied(relation, indexed) {
    var members = relationMembers(relation, indexed);
    if (!members.subject) return false;
    if (relation.kind === 'between') return betweenOnWall(members.subject, members.targets[0], members.targets[1]);
    if (relation.kind === 'perimeter-max') {
      if (members.targets.length !== 2 || !members.targets[0] || !members.targets[1]) return false;
      var subjectCenter = placementCenter(members.subject);
      var firstCenter = placementCenter(members.targets[0]);
      var secondCenter = placementCenter(members.targets[1]);
      return distance(subjectCenter, firstCenter) + distance(firstCenter, secondCenter) +
        distance(secondCenter, subjectCenter) <= relation.max + 0.005;
    }
    if (!members.target) return false;
    if (relation.kind === 'same-wall') return Boolean(placementWall(members.subject) && placementWall(members.subject) === placementWall(members.target));
    if (relation.kind === 'different-wall') return Boolean(placementWall(members.subject) && placementWall(members.target) && placementWall(members.subject) !== placementWall(members.target));
    if (relation.kind === 'near') return distance(placementCenter(members.subject), placementCenter(members.target)) <= relation.max;
    if (relation.kind === 'distance-range') return rangeSatisfied(distance(placementCenter(members.subject), placementCenter(members.target)), relation);
    if (relation.kind === 'gap-range') return rangeSatisfied(footprintGap(members.subject, members.target), relation);
    if (relation.kind === 'workstation') {
      var chairCenter = placementCenter(members.subject);
      var deskCenter = placementCenter(members.target);
      var deskInward = members.target.inward;
      var chairInward = members.subject.inward;
      if (!deskInward || !chairInward) return false;
      var along = (chairCenter.x - deskCenter.x) * deskInward.x +
        (chairCenter.y - deskCenter.y) * deskInward.y;
      var across = Math.abs((chairCenter.x - deskCenter.x) * -deskInward.y +
        (chairCenter.y - deskCenter.y) * deskInward.x);
      var facesDesk = chairInward.x * -deskInward.x + chairInward.y * -deskInward.y >= 0.99;
      return along > 0 && across <= (relation.maxOffset || 0.15) + 0.005 &&
        facesDesk && rangeSatisfied(footprintGap(members.subject, members.target), relation);
    }
    if (relation.kind === 'faces') {
      var from = placementCenter(members.subject), to = placementCenter(members.target);
      var length = distance(from, to) || 1;
      return (members.subject.inward.x * (to.x - from.x) + members.subject.inward.y * (to.y - from.y)) / length >= 0.5;
    }
    return false;
  }

  function relationQuality(relation, indexed, rectangle) {
    var members = relationMembers(relation, indexed);
    if (!members.subject) return 0;
    if (relation.kind === 'between') return betweenOnWall(members.subject, members.targets[0], members.targets[1]) ? 1 : 0;
    if (relation.kind === 'perimeter-max') {
      if (members.targets.length !== 2 || !members.targets[0] || !members.targets[1]) return 0;
      var subjectCenter = placementCenter(members.subject);
      var firstCenter = placementCenter(members.targets[0]);
      var secondCenter = placementCenter(members.targets[1]);
      var perimeter = distance(subjectCenter, firstCenter) + distance(firstCenter, secondCenter) +
        distance(secondCenter, subjectCenter);
      return perimeter <= relation.max ? 1 : Math.max(0, relation.max / perimeter);
    }
    if (!members.target) return 0;
    if (relation.kind === 'same-wall') return placementWall(members.subject) && placementWall(members.subject) === placementWall(members.target) ? 1 : 0;
    if (relation.kind === 'different-wall') return placementWall(members.subject) && placementWall(members.target) && placementWall(members.subject) !== placementWall(members.target) ? 1 : 0;
    if (relation.kind === 'near') {
      var maximum = relation.max || Math.sqrt(rectangle.w * rectangle.w + rectangle.h * rectangle.h);
      return Math.max(0, 1 - distance(placementCenter(members.subject), placementCenter(members.target)) / maximum);
    }
    if (relation.kind === 'distance-range') return rangeQuality(distance(placementCenter(members.subject), placementCenter(members.target)), relation);
    if (relation.kind === 'gap-range') return rangeQuality(footprintGap(members.subject, members.target), relation);
    if (relation.kind === 'workstation') return relationSatisfied(relation, indexed) ? 1 : 0;
    if (relation.kind === 'faces') {
      var from = placementCenter(members.subject), to = placementCenter(members.target);
      var length = distance(from, to) || 1;
      var dot = (members.subject.inward.x * (to.x - from.x) + members.subject.inward.y * (to.y - from.y)) / length;
      return Math.max(0, Math.min(1, (dot + 1) / 2));
    }
    return 0;
  }

  function assessPlacements(placements, rectangle, relations, context, s4Assessment) {
    var indexed = placementIndex(placements);
    context = context || {};
    var weightedRelations = 0;
    var relationWeights = 0;
    (relations || []).forEach(function (relation) {
      var weight = relation.weight || 1;
      weightedRelations += relationQuality(relation, indexed, rectangle) * weight;
      relationWeights += weight;
    });
    var relationScore = relationWeights ? weightedRelations / relationWeights : 0.65;
    var accessOpenings = (context.openings || []).filter(function (opening) { return opening.kind !== 'window'; });
    var accessScore = accessOpenings.length ? placements.reduce(function (sum, placement) {
      var clearance = accessOpenings.reduce(function (minimum, opening) {
        return Math.min(minimum, pointRectangleDistance(opening, placement.footprint));
      }, Infinity);
      return sum + Math.max(0, Math.min(1, clearance / 0.9));
    }, 0) / Math.max(1, placements.length) : 0.8;
    var anchored = placements.filter(function (placement) { return placementWall(placement); });
    var connectivity = s4Assessment || assessS4(placements, rectangle, context);
    var connectivityScore = connectivity.requiredUsageZones
      ? connectivity.reachableUsageZones / connectivity.requiredUsageZones
      : (connectivity.anchoredAccessCount ? 1 : 0);
    var roomCenter = { x: rectangle.w / 2, y: rectangle.h / 2 };
    var diagonal = Math.sqrt(rectangle.w * rectangle.w + rectangle.h * rectangle.h) || 1;
    var free = placements.filter(function (placement) { return !placement.wall; });
    var centralScore = free.length ? free.reduce(function (sum, placement) {
      return sum + Math.max(0, 1 - distance(placementCenter(placement), roomCenter) / (diagonal * 0.55));
    }, 0) / free.length : 0.75;
    var walls = new Set(anchored.map(placementWall));
    var distributionScore = anchored.length > 1 ? walls.size / Math.min(4, anchored.length) : 0.7;
    var spatialScore = centralScore * 0.45 + distributionScore * 0.55;
    var score = relationScore * 35 + accessScore * 30 + connectivityScore * 20 + spatialScore * 15;
    return {
      score: Math.round(score * 10) / 10,
      breakdown: {
        relations: Math.round(relationScore * 100),
        access: Math.round(accessScore * 100),
        connectivity: Math.round(connectivityScore * 100),
        spatial: Math.round(spatialScore * 100)
      }
    };
  }

  function scorePlacements(placements, rectangle, relations, context) {
    return assessPlacements(placements, rectangle, relations, context).score;
  }

  function assessOccupancy(placements, rectangle, maximum) {
    var roomArea = rectangle.w * rectangle.h;
    var furnitureArea = (placements || []).reduce(function (sum, placement) {
      var foot = placement.footprint;
      return sum + Math.max(0, foot.x1 - foot.x0) * Math.max(0, foot.y1 - foot.y0);
    }, 0);
    var ratio = roomArea > 0 ? furnitureArea / roomArea : 1;
    return {
      passes: !Number.isFinite(maximum) || ratio <= maximum + 0.0005,
      ratio: Math.round(ratio * 1000) / 1000,
      maximum: Number.isFinite(maximum) ? maximum : null,
      furnitureArea: Math.round(furnitureArea * 1000) / 1000,
      roomArea: Math.round(roomArea * 1000) / 1000
    };
  }

  /* M5 — les dégagements `target` et `comfort` décrivent une préférence
     graduée, pas une nouvelle faisabilité. On juge la pose minimale réellement
     retenue : pour chaque exigence déclarée, la zone agrandie doit rester dans
     le polygone, hors réservations et hors emprises des autres équipements.
     Les zones d'usage non exclusives peuvent se recouvrir entre elles, comme
     au solveur minimal. */
  function assessClearanceLevels(placements, rectangle, context) {
    context = centimetersContext(context || {});
    var width = cm(rectangle.w), height = cm(rectangle.h);
    var centimeterPlacements = (placements || []).map(function (placement) {
      return {
        equipment: placement.equipment,
        foot: centimetersRectangle(placement.footprint),
        inward: placement.inward || { x: 0, y: 1 }
      };
    });

    function requirementFits(entry, spec, level) {
      if (!Number.isFinite(spec[level])) return null;
      var expandedEquipment = Object.assign({}, entry.equipment, {
        usage: [Object.assign({}, spec, { min: spec[level] })]
      });
      for (var usageSet of usageSets(expandedEquipment, entry.foot,
        entry.inward, width, height)) {
        if (!usageSet.every(function (usage) {
          return rectangleInPolygon(usage, context.usablePolygon);
        })) continue;
        if ((context.blocked || []).some(function (blocked) {
          return !blocked.footprintOnly && usageSet.some(function (usage) {
            return overlaps(blocked, usage);
          });
        })) continue;
        if (!centimeterPlacements.some(function (other) {
          return other !== entry && usageSet.some(function (usage) {
            return overlaps(usage, other.foot);
          });
        })) return true;
      }
      return false;
    }

    var result = {
      method: 'declared-clearance-fixed-placement-v1',
      targetRequired: 0, targetMet: 0,
      comfortRequired: 0, comfortMet: 0,
      equipments: []
    };
    centimeterPlacements.forEach(function (entry) {
      var equipmentResult = {
        id: entry.equipment.id,
        targetRequired: 0, targetMet: 0,
        comfortRequired: 0, comfortMet: 0
      };
      (entry.equipment.usage || []).forEach(function (spec) {
        ['target', 'comfort'].forEach(function (level) {
          var fits = requirementFits(entry, spec, level);
          if (fits === null) return;
          var requiredKey = level + 'Required', metKey = level + 'Met';
          result[requiredKey] += 1;
          equipmentResult[requiredKey] += 1;
          if (fits) { result[metKey] += 1; equipmentResult[metKey] += 1; }
        });
      });
      if (equipmentResult.targetRequired || equipmentResult.comfortRequired) {
        result.equipments.push(equipmentResult);
      }
    });
    result.targetMissed = result.targetRequired - result.targetMet;
    result.comfortMissed = result.comfortRequired - result.comfortMet;
    return result;
  }

  function solve(equipments, rectangle, options) {
    if (!Array.isArray(equipments)) throw new TypeError('La liste d’équipements doit être un tableau.');
    if (!rectangle || !Number.isFinite(rectangle.w) || !Number.isFinite(rectangle.h) || rectangle.w <= 0 || rectangle.h <= 0) {
      throw new TypeError('Le rectangle doit fournir des dimensions w et h positives, en mètres.');
    }
    var ordered = equipments.slice().sort(function (a, b) {
      var freeDifference = (a.anchor === 'free' ? 1 : 0) - (b.anchor === 'free' ? 1 : 0);
      if (freeDifference) return freeDifference;
      return (b.footprint.w * b.footprint.d) - (a.footprint.w * a.footprint.d);
    });
    options = options || {};
    var relations = options.relations || [];
    var publicContext = options.context || {};
    var polygonal = !polygonIsRectangle(publicContext.usablePolygon);
    var geometry = {
      kind: polygonal ? 'polygon' : 'rectangle',
      method: polygonal ? 'orthogonal-polygon-v1' : 'rectangle-v1',
      cacheAuthority: polygonal ? 'none' : 'fit.data.js'
    };
    var context = centimetersContext(publicContext);
    var hardRelations = relations.filter(function (relation) { return relation.level === 'HARD'; });
    var s4Enabled = options.s4 === true || (options.s4 !== false &&
      (publicContext.openings || []).some(function (opening) { return opening.kind !== 'window'; }));
    var finalS4 = null;
    var accept = (hardRelations.length || Number.isFinite(options.facingClearance)) ? function (placed) {
      var indexed = placementIndex(publicPlacements(placed, ordered));
      return hardRelations.every(function (relation) { return relationSatisfied(relation, indexed); }) &&
        facingClearanceSatisfied(publicPlacements(placed, ordered), options.facingClearance);
    } : null;
    var acceptPartial = hardRelations.length ? function (placed) {
      var indexed = placementIndex(publicPlacements(placed, ordered));
      return hardRelations.every(function (relation) {
        var ids = [relation.subject, relation.target].concat(relation.targets || []).filter(Boolean);
        if (!ids.every(function (id) { return Boolean(indexed[id]); })) return true;
        return relationSatisfied(relation, indexed);
      });
    } : null;
    var result = solveCentimeters(ordered, cm(rectangle.w), cm(rectangle.h), {
      random: options.seed === undefined ? null : randomFrom(options.seed),
      accept: accept,
      acceptPartial: acceptPartial,
      family: options.family,
      candidateLimit: options.candidateLimit,
      maxNodes: options.maxNodes,
      context: context
    });
    if (result.fits) {
      var placements = publicPlacements(result.placed, ordered);
      finalS4 = s4Enabled ? assessS4(placements, rectangle, publicContext) : null;
      /* S4 juge la disposition complète avant qu'elle puisse devenir un
         candidat de l'optimiseur. Un échec change donc `fits`, il ne devient
         jamais une pénalité tardive appliquée au plan déjà choisi. */
      if (finalS4 && !finalS4.passes) {
        return {
          fits: false,
          placements: [],
          s4: finalS4,
          geometry: geometry,
          reason: {
            code: 'S4_CANNOT_BE_SATISFIED', equipmentId: null, equipmentLabel: null,
            message: 'Cette disposition ne relie pas chaque zone d’usage requise à une porte par un passage de ' +
              Math.round(((options.context && options.context.accessClearance) || S4_CLEARANCE) * 100) + ' cm.'
          }
        };
      }
      return {
        fits: true,
        placements: placements,
        s4: s4Enabled ? (finalS4 || assessS4(placements, rectangle, publicContext)) : null,
        geometry: geometry
      };
    }
    var equipment = result.failure && result.failure.equipment;
    return {
      fits: false,
      placements: [],
      geometry: geometry,
      reason: {
        code: result.relationRejected ? 'RELATION_CANNOT_BE_SATISFIED' : 'EQUIPMENT_CANNOT_BE_PLACED',
        equipmentId: equipment && equipment.id ? equipment.id : null,
        equipmentLabel: equipment && equipment.label ? equipment.label : null,
        message: result.relationRejected
          ? 'Les équipements tiennent, mais aucune pose ne respecte toutes les relations obligatoires.'
          : equipment && equipment.label
          ? equipment.label + ' ne trouve aucune pose compatible dans la géométrie utile.'
          : 'Les équipements ne trouvent aucune disposition compatible dans la géométrie utile.'
      }
    };
  }

  function validate(equipments, rectangle, options) {
    options = options || {};
    /* Quatre éléments de cuisine suffisent déjà à rendre l'exhaustif très
       coûteux dès que la contrainte entre linéaires intervient. Les familles
       bornées gardent trois ordres indépendants et le cache de Pareto reste
       l'oracle exhaustif de faisabilité en amont. */
    var families = options.fast ? ['linear']
      : equipments.length >= 4 || Number.isFinite(options.facingClearance)
      ? ['linear', 'access', 'balanced'] : [null];
    var result = null;
    for (var index = 0; index < families.length; index += 1) {
      result = solve(equipments, rectangle, {
        relations: options.relations || [], context: options.context || null,
        facingClearance: options.facingClearance,
        s4: options.s4,
        family: families[index], seed: families[index] ? 'validation:' + families[index] : undefined,
        candidateLimit: options.candidateLimit || (options.fast ? 32 : 80),
        maxNodes: families[index] ? (options.maxNodes || (options.fast ? 3000 : 12000)) : undefined
      });
      if (result.fits) break;
    }
    result.stage = 'validation';
    return result;
  }

  function optimize(equipments, rectangle, options) {
    options = options || {};
    var relations = options.relations || [];
    var validation = options.validation && options.validation.fits
      ? options.validation
      : validate(equipments, rectangle, {
        relations: relations, context: options.context,
        facingClearance: options.facingClearance, s4: options.s4
      });
    if (!validation.fits && (!validation.reason || validation.reason.code !== 'S4_CANNOT_BE_SATISFIED')) return validation;

    var attempts = Math.max(4, Math.min(24, Math.round(options.attempts || 12)));
    var families = options.families || ['access', 'linear', 'focal', 'central', 'balanced', 'compact'];
    var baseSeed = seedValue(options.seed);
    var best = null, bestRank = -Infinity;
    for (var index = 0; index < attempts; index += 1) {
      var candidateSeed = (baseSeed + Math.imul(index + 1, 0x9E3779B9)) >>> 0;
      var family = families[index % families.length];
      var candidate = solve(equipments, rectangle, {
        seed: candidateSeed, relations: relations, context: options.context, family: family,
        facingClearance: options.facingClearance,
        s4: options.s4,
        candidateLimit: 70, maxNodes: 8000
      });
      if (!candidate.fits) continue;
      var assessment = assessPlacements(candidate.placements, rectangle, relations, options.context, candidate.s4);
      var score = assessment.score;
      var rank = score + randomFrom(candidateSeed ^ 0x85EBCA6B)() * 0.001;
      if (rank > bestRank) {
        best = candidate;
        bestRank = rank;
        best.optimization = {
          score: score, breakdown: assessment.breakdown, family: family,
          attempts: attempts, seed: candidateSeed
        };
      }
    }
    if (!best) return validation;
    best.stage = 'optimization';
    best.validation = { fits: true };
    return best;
  }

  root.TechnoHabPlacement = {
    solve: solve,
    validate: validate,
    optimize: optimize,
    score: scorePlacements,
    assess: assessPlacements,
    assessClearanceLevels: assessClearanceLevels,
    assessS4: assessS4,
    assessOccupancy: assessOccupancy,
    relationSatisfied: relationSatisfied,
    facingClearanceSatisfied: facingClearanceSatisfied,
    roomContext: roomContext,
    pointInPolygon: pointInPolygon,
    polygonIsRectangle: polygonIsRectangle,
    rectangleInPolygon: function (rectangle, polygon) {
      return rectangleInPolygon(centimetersRectangle(rectangle),
        (polygon || []).map(function (ring) {
          return ring.map(function (point) { return { x: point.x * 100, y: point.y * 100 }; });
        }));
    },
    fitsCentimeters: fits,
    envelope: envelope,
    stepCentimeters: STEP,
    minimumSideCentimeters: MIN_SIDE,
    maximumSideCentimeters: MAX_SIDE
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
