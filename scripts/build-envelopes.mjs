#!/usr/bin/env node
// Calcule, pour chaque type de pièce, le domaine des rectangles capables de
// recevoir son mobilier obligatoire — dégagements compris.
//
// Ce runner hors ligne exerce le même solveur que le navigateur. Il produit
// l'oracle de non-régression des treize préréglages et leur cache chaud ; les
// compositions libres, elles, sont résolues directement dans le navigateur.
//
// Conséquence importante : parce que la recherche est exhaustive et que la
// faisabilité est monotone — un rectangle plus grand qu'un rectangle
// admissible l'est aussi —, le résultat n'est pas une heuristique. Un
// refus valide ne dépend donc pas d'une heuristique différente selon le
// runner : l'algorithmique vit uniquement dans assets/placement.js.
//
// Usage : node scripts/technohab-fit/build-envelopes.mjs [--verbose]

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import '../../technohab/assets/placement.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const placement = globalThis.TechnoHabPlacement;
const MIN_SIDE = placement.minimumSideCentimeters;

// socle.data.js est un script classique qui s'attache à globalThis.
new Function(readFileSync(join(root, 'technohab/assets/socle.data.js'), 'utf8'))();
const socle = globalThis.TechnoHabSocle;

// -------------------------------------------------------------------- sortie

const verbose = process.argv.includes('--verbose');
const result = {};
const started = Date.now();

for (const [type, room] of Object.entries(socle.rooms)) {
  const variants = socle.variantsOf(type);
  const perVariant = {};
  const programs = {};
  const catalogs = {};
  for (const variant of variants) {
    const required = socle.requiredEquipments(type, variant)
      .map((equipment) => ({ ...equipment, program: type }))
      .slice()
      .sort((a, b) => (b.footprint.w * b.footprint.d) - (a.footprint.w * a.footprint.d));
    perVariant[variant || 'base'] = required.length ? placement.envelope(required) : [[MIN_SIDE, MIN_SIDE]];
    const ids = required.map((equipment) => equipment.id);
    const relations = (room.relations || []).map((relation) => {
      const resolved = { ...relation };
      if (resolved.targetAny) {
        resolved.target = resolved.targetAny.find((id) => ids.includes(id)) || null;
        delete resolved.targetAny;
      }
      return resolved;
    }).filter((relation) => {
      const references = [relation.subject, relation.target].concat(relation.targets || []).filter(Boolean);
      return references.length >= 2 && references.every((id) => ids.includes(id));
    });
    programs[variant || 'base'] = { equipments: required, relations };
    /* M4c — le cache d'enveloppe reste calculé sur le programme minimal,
       mais le runtime doit pouvoir résoudre les gammes et les optionnels sans
       charger le socle éditorial. Le catalogue complet voyage donc à côté du
       cache ; il n'entre jamais dans `placement.envelope()`. */
    const catalogEquipments = (room.equipments || [])
      .filter((equipment) => !equipment.variant || equipment.variant === variant)
      .map((equipment) => ({ ...equipment, program: type }));
    const catalogIds = catalogEquipments.map((equipment) => equipment.id);
    const catalogRelations = (room.relations || []).map((relation) => {
      const resolved = { ...relation };
      if (resolved.targetAny) {
        resolved.target = resolved.targetAny.find((id) => catalogIds.includes(id)) || null;
        delete resolved.targetAny;
      }
      return resolved;
    }).filter((relation) => {
      const references = [relation.subject, relation.target].concat(relation.targets || []).filter(Boolean);
      return references.length >= 2 && references.every((id) => catalogIds.includes(id));
    });
    catalogs[variant || 'base'] = { equipments: catalogEquipments, relations: catalogRelations };
    if (verbose) {
      console.log(`${type}/${variant || 'base'} :`,
        perVariant[variant || 'base'].map(([w, h]) => `${(w / 100).toFixed(2)}x${(h / 100).toFixed(2)}`).join('  '));
    }
  }
  /* La déclaration de la pièce voyage avec ses enveloppes. Raison : le
     navigateur charge fit.data.js au premier octet (index.html) tandis que
     socle.data.js reste différé jusqu'au premier usage du solveur. Sans cette
     recopie, generator.js et rules.js ne pourraient pas lire le rôle ni
     l'agrément sans casser le chargement paresseux (CLAUDE.md §2). */
  result[type] = {
    label: room.label, mvp: Boolean(room.mvp),
    role: room.role, agrement: room.agrement,
    minProgramArea: room.minProgramArea, minProgramSide: room.minProgramSide,
    targetProgramArea: room.targetProgramArea,
    programFloors: room.programFloors || null,
    maxRatio: room.maxRatio, trigger: room.trigger,
    facingClearance: room.facingClearance,
    accessClearance: room.accessClearance,
    maxFurnitureRatio: room.maxFurnitureRatio,
    variants: perVariant, programs, catalogs
  };
}

const nombre = (value) => (Number.isFinite(value) ? String(value) : 'null');

const body = Object.entries(result).map(([type, data]) =>
  `    ${type}: {\n` +
  `      label: ${JSON.stringify(data.label)}, mvp: ${data.mvp},` +
  ` role: ${JSON.stringify(data.role)}, agrement: ${nombre(data.agrement)},\n` +
  `      minProgramArea: ${nombre(data.minProgramArea)},` +
  ` minProgramSide: ${nombre(data.minProgramSide)},` +
  ` targetProgramArea: ${nombre(data.targetProgramArea)},` +
  ` maxRatio: ${nombre(data.maxRatio)},\n` +
  `      programFloors: ${data.programFloors ? JSON.stringify(data.programFloors) : 'null'},\n` +
  `      trigger: ${data.trigger ? JSON.stringify(data.trigger) : 'null'},\n` +
  `      facingClearance: ${nombre(data.facingClearance)},\n` +
  `      accessClearance: ${nombre(data.accessClearance)},\n` +
  `      maxFurnitureRatio: ${nombre(data.maxFurnitureRatio)},\n` +
  `      variants: {\n` +
  Object.entries(data.variants).map(([v, pairs]) =>
    `        ${v}: [${pairs.map(([w, h]) => `[${w}, ${h}]`).join(', ')}]`).join(',\n') +
  '\n      },\n' +
  `      programs: ${JSON.stringify(data.programs)},\n` +
  `      catalogs: ${JSON.stringify(data.catalogs)}\n    }`).join(',\n');

const out = `(function (root) {
  'use strict';

  // Fichier généré par scripts/technohab-fit/build-envelopes.mjs.
  // Ne pas éditer : modifier socle.data.js puis relancer npm run fit:build.
  //
  // Pour chaque type de pièce et chaque variante, la liste des plus petits
  // rectangles admissibles, en CENTIMÈTRES, triée par largeur croissante.
  // Un rectangle convient s'il domine l'un de ces couples, dans un sens ou
  // dans l'autre — une pièce n'a pas d'orientation imposée. M4b borne ce
  // cache aux rectangles : pour une pièce en L/U, seul \`placement.validate\`
  // sur \`usablePolygon\` peut porter le verdict.
  //
  // Chaque entrée porte aussi la déclaration de la pièce recopiée du socle :
  // \`role\`, \`agrement\`, \`minProgramArea\`, \`minProgramSide\`, \`maxRatio\` et
  // \`trigger\`. Voir les commentaires de socle.data.js, qui en fait foi.
  //
  // Deux planchers coexistent et ne disent pas la même chose :
  //   - \`smallest\`/\`narrowest\` — le plancher de MEUBLABILITÉ, calculé ici par
  //     le solveur. Il suit toute évolution des équipements.
  //   - \`minProgramArea\`/\`minProgramSide\` — le plancher de DIGNITÉ D'USAGE,
  //     convention N3 assumée. Un séjour se meuble dès 3,24 m² et reste
  //     absurde à cette taille.
  // Le générateur retient le plus exigeant des deux.

  var ENVELOPES = {
${body}
  };

  function fits(type, widthMeters, heightMeters, variant) {
    var entry = ENVELOPES[type];
    if (!entry) return true; // type sans exigence connue : ne rien interdire
    var w = Math.round(widthMeters * 100);
    var h = Math.round(heightMeters * 100);
    var names = variant ? [variant] : Object.keys(entry.variants);
    return names.some(function (name) {
      var pairs = entry.variants[name] || [];
      return pairs.some(function (pair) {
        return (w >= pair[0] && h >= pair[1]) || (h >= pair[0] && w >= pair[1]);
      });
    });
  }

  /** Le plus petit rectangle admissible, pour expliquer un refus. */
  function smallest(type, variant) {
    var entry = ENVELOPES[type];
    if (!entry) return null;
    var names = variant ? [variant] : Object.keys(entry.variants);
    var best = null;
    names.forEach(function (name) {
      (entry.variants[name] || []).forEach(function (pair) {
        var area = pair[0] * pair[1];
        if (!best || area < best.area) best = { w: pair[0] / 100, h: pair[1] / 100, area: area, variant: name };
      });
    });
    return best;
  }

  /** Le côté court le plus petit que le domaine admette, en mètres. */
  function narrowest(type, variant) {
    var entry = ENVELOPES[type];
    if (!entry) return null;
    var names = variant ? [variant] : Object.keys(entry.variants);
    var best = null;
    names.forEach(function (name) {
      (entry.variants[name] || []).forEach(function (pair) {
        var side = Math.min(pair[0], pair[1]) / 100;
        if (best === null || side < best) best = side;
      });
    });
    return best;
  }

  function roleOf(type) {
    return ENVELOPES[type] ? ENVELOPES[type].role : null;
  }

  /** Les types portant ce rôle. Évite aux règles de tenir des listes en dur. */
  function typesByRole(role) {
    return Object.keys(ENVELOPES).filter(function (type) { return ENVELOPES[type].role === role; });
  }

  function agrementOf(type) {
    var entry = ENVELOPES[type];
    return entry && Number.isFinite(entry.agrement) ? entry.agrement : 0.6;
  }

  function maxRatioOf(type) {
    var entry = ENVELOPES[type];
    return entry && Number.isFinite(entry.maxRatio) ? entry.maxRatio : null;
  }

  /* Programme minimal compilé : le générateur peut appeler le même solveur
     que l'outil hors ligne sans charger le socle éditorial différé. */
  function programOf(type, variant) {
    var entry = ENVELOPES[type];
    if (!entry) return { equipments: [], relations: [], facingClearance: null, accessClearance: null, maxFurnitureRatio: null };
    var name = variant || Object.keys(entry.programs)[0];
    var program = entry.programs[name] || entry.programs[Object.keys(entry.programs)[0]];
    return {
      equipments: program.equipments,
      relations: program.relations,
      facingClearance: entry.facingClearance,
      accessClearance: entry.accessClearance,
      maxFurnitureRatio: entry.maxFurnitureRatio
    };
  }

  function resolveSize(equipment, context) {
    if (!Array.isArray(equipment.sizes) || !equipment.sizes.length ||
        context.upgradeSizes === false || !Number.isFinite(context.area)) return equipment;
    var chosen = null;
    equipment.sizes.forEach(function (size) {
      if (!Number.isFinite(size.from) || context.area < size.from) return;
      if (!chosen || size.from > chosen.from) chosen = size;
    });
    if (!chosen) return equipment;
    return Object.assign({}, equipment, {
      size: chosen.id,
      label: chosen.label || equipment.label,
      val: chosen.val || equipment.val,
      footprint: Object.assign({}, chosen.footprint),
      anchor: chosen.anchor || equipment.anchor,
      usage: chosen.usage || equipment.usage,
      sizes: undefined
    });
  }

  /* Programme canonique résolu au runtime. Contrairement à \`programOf\`, il
     peut activer un optionnel et une montée de gamme ; l'appelant reste libre
     de demander les replis dans l'ordre M4c. */
  function resolveProgram(type, variant, context) {
    context = context || {};
    var entry = ENVELOPES[type];
    if (!entry || !entry.catalogs) return programOf(type, variant);
    var name = variant || Object.keys(entry.catalogs)[0];
    var catalog = entry.catalogs[name] || entry.catalogs[Object.keys(entry.catalogs)[0]];
    var equipments = catalog.equipments.filter(function (equipment) {
      if (equipment.required) return true;
      return context.includeOptional !== false && Number.isFinite(context.area) &&
        Number.isFinite(equipment.minRoomArea) && context.area >= equipment.minRoomArea;
    }).map(function (equipment) { return resolveSize(equipment, context); });
    var ids = equipments.map(function (equipment) { return equipment.id; });
    var relations = catalog.relations.filter(function (relation) {
      var references = [relation.subject, relation.target].concat(relation.targets || []).filter(Boolean);
      if (relation.optional && !references.every(function (id) { return ids.indexOf(id) !== -1; })) return false;
      return references.length >= 2 && references.every(function (id) { return ids.indexOf(id) !== -1; });
    });
    return {
      equipments: equipments,
      relations: relations,
      facingClearance: entry.facingClearance,
      accessClearance: entry.accessClearance,
      maxFurnitureRatio: entry.maxFurnitureRatio,
      resolution: {
        method: 'canonical-catalog-v1', area: Number.isFinite(context.area) ? context.area : null,
        upgradeSizes: context.upgradeSizes !== false,
        includeOptional: context.includeOptional !== false
      }
    };
  }

  /* Le plancher effectif : le plus exigeant du calculé et du convenu. C'est
     le seul endroit où les deux se rencontrent, et la raison pour laquelle
     aucune surface minimale n'est plus écrite à la main dans le moteur. */
  function floorOf(type, variant) {
    var entry = ENVELOPES[type];
    if (!entry) return { area: 0, side: 0 };
    var petit = smallest(type, variant);
    var etroit = narrowest(type, variant);
    var variantFloor = variant && entry.programFloors && entry.programFloors[variant];
    return {
      area: Math.max(petit ? petit.w * petit.h : 0,
        variantFloor && Number.isFinite(variantFloor.area) ? variantFloor.area : entry.minProgramArea || 0),
      side: Math.max(etroit || 0,
        variantFloor && Number.isFinite(variantFloor.side) ? variantFloor.side : entry.minProgramSide || 0)
    };
  }

  root.TechnoHabFit = {
    envelopes: ENVELOPES, fits: fits, smallest: smallest, narrowest: narrowest,
    roleOf: roleOf, typesByRole: typesByRole, agrementOf: agrementOf,
    maxRatioOf: maxRatioOf, floorOf: floorOf, programOf: programOf,
    resolveProgram: resolveProgram,
    geometryScope: 'rectangle-only'
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
`;

mkdirSync(join(root, 'technohab/assets'), { recursive: true });
writeFileSync(join(root, 'technohab/assets/fit.data.js'), out, 'utf8');
console.log(`${Object.keys(result).length} types calculés en ${((Date.now() - started) / 1000).toFixed(1)} s → technohab/assets/fit.data.js`);
