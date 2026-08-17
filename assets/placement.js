(function (root) {
  'use strict';

  var STEP = 10;
  var MIN_SIDE = 70;
  var MAX_SIDE = 600;

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
    return { x0: cm(rectangle.x0), y0: cm(rectangle.y0), x1: cm(rectangle.x1), y1: cm(rectangle.y1) };
  }

  function centimetersContext(context) {
    context = context || {};
    return {
      openings: (context.openings || []).map(function (opening) {
        return Object.assign({}, opening, { x: cm(opening.x), y: cm(opening.y), width: cm(opening.width || 0.8) });
      }),
      blocked: (context.blocked || []).map(centimetersRectangle)
    };
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
    if (family === 'linear') return (pose.wall === preferredWall ? 4 : pose.wall ? 2 : 0) + cornerDistance / 300;
    if (family === 'focal') return (pose.wall ? 2 : 1) + distanceToCenter / Math.max(width, height);
    if (family === 'compact') return 3 - cornerDistance / Math.max(width, height);
    if (family === 'central') return 3 - distanceToCenter / Math.max(width, height);
    if (family === 'access') return openingDistance / Math.max(width, height) + cornerDistance / 500;
    return cornerDistance / 300 - distanceToCenter / Math.max(width, height);
  }

  function* poses(equipment, width, height) {
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

    for (var wall of walls) {
      if (wall.span < 0) continue;
      for (var offset = 0; offset <= wall.span; offset += STEP) {
        var wallFoot = wall.foot(offset);
        if (anchor === 'corner' && offset !== 0 && offset !== wall.span) continue;
        for (var wallUsage of usageSets(equipment, wallFoot, wall.inward, width, height)) {
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
      if (spec.face === 'front') {
        fixed.push(front(foot, inward, minimum, spec.width ? cm(spec.width) : null));
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

    function candidates(index) {
      if (!options.random && !options.family) return poses(equipments[index], width, height);
      if (!candidateSets[index]) {
        candidateSets[index] = Array.from(poses(equipments[index], width, height));
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
        if (visited > (options.maxNodes || Infinity)) return false;
        if (!inside(pose.foot, width, height)) continue;
        if ((options.context.blocked || []).some(function (blocked) { return overlaps(blocked, pose.foot); })) continue;
        if ((options.context.blocked || []).some(function (blocked) {
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
          continue;
        }
        if (attempt(index + 1)) return true;
        placed.pop();
      }
      if (!deepestFailure || index >= deepestFailure.index) {
        deepestFailure = { index: index, equipment: equipments[index] };
      }
      return false;
    }

    var success = attempt(0);
    return {
      fits: success, placed: success ? placed.slice() : [], failure: deepestFailure,
      relationRejected: relationRejected, searchLimitReached: visited > (options.maxNodes || Infinity)
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

  function pointRectangleDistance(point, rectangle) {
    var dx = Math.max(rectangle.x0 - point.x, 0, point.x - rectangle.x1);
    var dy = Math.max(rectangle.y0 - point.y, 0, point.y - rectangle.y1);
    return Math.sqrt(dx * dx + dy * dy);
  }

  function betweenOnWall(subject, first, second) {
    if (!subject || !first || !second || !subject.wall || subject.wall !== first.wall || subject.wall !== second.wall) return false;
    var axis = subject.wall === 'S' || subject.wall === 'N' ? 'x' : 'y';
    var subjectValue = placementCenter(subject)[axis];
    var firstValue = placementCenter(first)[axis];
    var secondValue = placementCenter(second)[axis];
    return subjectValue >= Math.min(firstValue, secondValue) && subjectValue <= Math.max(firstValue, secondValue);
  }

  function relationSatisfied(relation, indexed) {
    var members = relationMembers(relation, indexed);
    if (!members.subject) return false;
    if (relation.kind === 'between') return betweenOnWall(members.subject, members.targets[0], members.targets[1]);
    if (!members.target) return false;
    if (relation.kind === 'same-wall') return Boolean(members.subject.wall && members.subject.wall === members.target.wall);
    if (relation.kind === 'different-wall') return Boolean(members.subject.wall && members.target.wall && members.subject.wall !== members.target.wall);
    if (relation.kind === 'near') return distance(placementCenter(members.subject), placementCenter(members.target)) <= relation.max;
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
    if (!members.target) return 0;
    if (relation.kind === 'same-wall') return members.subject.wall && members.subject.wall === members.target.wall ? 1 : 0;
    if (relation.kind === 'different-wall') return members.subject.wall && members.target.wall && members.subject.wall !== members.target.wall ? 1 : 0;
    if (relation.kind === 'near') {
      var maximum = relation.max || Math.sqrt(rectangle.w * rectangle.w + rectangle.h * rectangle.h);
      return Math.max(0, 1 - distance(placementCenter(members.subject), placementCenter(members.target)) / maximum);
    }
    if (relation.kind === 'faces') {
      var from = placementCenter(members.subject), to = placementCenter(members.target);
      var length = distance(from, to) || 1;
      var dot = (members.subject.inward.x * (to.x - from.x) + members.subject.inward.y * (to.y - from.y)) / length;
      return Math.max(0, Math.min(1, (dot + 1) / 2));
    }
    return 0;
  }

  function assessPlacements(placements, rectangle, relations, context) {
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
    var anchored = placements.filter(function (placement) { return placement.wall; });
    var cornerScore = anchored.length ? anchored.reduce(function (sum, placement) {
      var center = placementCenter(placement);
      var along = placement.wall === 'S' || placement.wall === 'N' ? center.x : center.y;
      var span = placement.wall === 'S' || placement.wall === 'N' ? rectangle.w : rectangle.h;
      return sum + Math.max(0, Math.min(1, Math.min(along, span - along) / 0.6));
    }, 0) / anchored.length : 1;
    var roomCenter = { x: rectangle.w / 2, y: rectangle.h / 2 };
    var diagonal = Math.sqrt(rectangle.w * rectangle.w + rectangle.h * rectangle.h) || 1;
    var free = placements.filter(function (placement) { return !placement.wall; });
    var centralScore = free.length ? free.reduce(function (sum, placement) {
      return sum + Math.max(0, 1 - distance(placementCenter(placement), roomCenter) / (diagonal * 0.55));
    }, 0) / free.length : 0.75;
    var walls = new Set(anchored.map(function (placement) { return placement.wall; }));
    var distributionScore = anchored.length > 1 ? walls.size / Math.min(4, anchored.length) : 0.7;
    var spatialScore = centralScore * 0.45 + distributionScore * 0.55;
    var score = relationScore * 35 + accessScore * 30 + cornerScore * 20 + spatialScore * 15;
    return {
      score: Math.round(score * 10) / 10,
      breakdown: {
        relations: Math.round(relationScore * 100),
        access: Math.round(accessScore * 100),
        corners: Math.round(cornerScore * 100),
        spatial: Math.round(spatialScore * 100)
      }
    };
  }

  function scorePlacements(placements, rectangle, relations, context) {
    return assessPlacements(placements, rectangle, relations, context).score;
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
    var context = centimetersContext(options.context);
    var hardRelations = relations.filter(function (relation) { return relation.level === 'HARD'; });
    var accept = hardRelations.length ? function (placed) {
      var indexed = placementIndex(publicPlacements(placed, ordered));
      return hardRelations.every(function (relation) { return relationSatisfied(relation, indexed); });
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
      return {
        fits: true,
        placements: publicPlacements(result.placed, ordered)
      };
    }
    var equipment = result.failure && result.failure.equipment;
    return {
      fits: false,
      placements: [],
      reason: {
        code: result.relationRejected ? 'RELATION_CANNOT_BE_SATISFIED' : 'EQUIPMENT_CANNOT_BE_PLACED',
        equipmentId: equipment && equipment.id ? equipment.id : null,
        equipmentLabel: equipment && equipment.label ? equipment.label : null,
        message: result.relationRejected
          ? 'Les équipements tiennent, mais aucune pose ne respecte toutes les relations obligatoires.'
          : equipment && equipment.label
          ? equipment.label + ' ne trouve aucune pose compatible dans ce rectangle.'
          : 'Les équipements ne trouvent aucune disposition compatible dans ce rectangle.'
      }
    };
  }

  function validate(equipments, rectangle, options) {
    options = options || {};
    var families = equipments.length > 4 ? ['linear', 'access', 'balanced'] : [null];
    var result = null;
    for (var index = 0; index < families.length; index += 1) {
      result = solve(equipments, rectangle, {
        relations: options.relations || [], context: options.context || null,
        family: families[index], seed: families[index] ? 'validation:' + families[index] : undefined,
        candidateLimit: 80, maxNodes: families[index] ? 12000 : undefined
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
      : validate(equipments, rectangle, { relations: relations, context: options.context });
    if (!validation.fits) return validation;

    var attempts = Math.max(4, Math.min(24, Math.round(options.attempts || 12)));
    var families = options.families || ['access', 'linear', 'focal', 'central', 'balanced', 'compact'];
    var baseSeed = seedValue(options.seed);
    var best = null, bestRank = -Infinity;
    for (var index = 0; index < attempts; index += 1) {
      var candidateSeed = (baseSeed + Math.imul(index + 1, 0x9E3779B9)) >>> 0;
      var family = families[index % families.length];
      var candidate = solve(equipments, rectangle, {
        seed: candidateSeed, relations: relations, context: options.context, family: family,
        candidateLimit: 70, maxNodes: 8000
      });
      if (!candidate.fits) continue;
      var assessment = assessPlacements(candidate.placements, rectangle, relations, options.context);
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
    fitsCentimeters: fits,
    envelope: envelope,
    stepCentimeters: STEP,
    minimumSideCentimeters: MIN_SIDE,
    maximumSideCentimeters: MAX_SIDE
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
