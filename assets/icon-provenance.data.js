(function (root) {
  'use strict';

  // Traçabilité des symboles de mobilier.
  //
  // Ce registre est lu par l'audit des icônes et par le catalogue. Il ne pilote
  // pas le placement : il dit d'où vient un dessin, à quelle licence il est
  // rattaché, et vers quel symbole ArchLang on pourra basculer si l'icône doit
  // être remplacée ou enrichie.
  //
  // `original`  : géométrie dessinée dans TechnoHab.
  // `mapped`    : dessin TechnoHab conservé, mais correspondance ArchLang connue.
  // `adapted`   : géométrie redessinée depuis une source tierce.
  // `imported`  : géométrie tierce reprise telle quelle.
  //
  // Une icône `adapted` ou `imported` devra toujours porter `sourceUrl`,
  // `sourceRevision`, `author`, `license` et `modifications`.

  var SOURCES = {
    technohab: {
      id: 'technohab',
      label: 'TechnoHab',
      license: 'project',
      sourceUrl: null
    },
    archlang: {
      id: 'archlang',
      label: 'ArchLang',
      license: 'MIT',
      sourceUrl: 'https://github.com/ChanMeng666/archlang',
      licenseUrl: 'https://github.com/ChanMeng666/archlang/blob/main/LICENSE',
      note: 'Source externe préférée pour les symboles architecturaux. La licence MIT autorise la reprise, avec conservation de la notice.'
    }
  };

  // Symboles dont la géométrie vient de `fixtureGlyph` d'ArchLang (id TechnoHab
  // → catégorie ArchLang), régénérée dans furniture.svg par un script hors dépôt.
  var ADAPTED = {
    sofa: 'sofa',
    sofa_3: 'sofa',
    sofa_angle: 'sofa_l',
    coffee_table: 'coffee_table',
    tv_unit: 'tv_unit',
    dining_table_2: 'dining_table',
    dining_table_4: 'dining_table',
    sideboard: 'sideboard',
    bed_90: 'bed',
    bed_140: 'double_bed',
    bed_160: 'double_bed',
    bed_180: 'double_bed',
    armchair: 'armchair',
    wardrobe: 'wardrobe',
    sink: 'kitchen_sink',
    hob: 'stove',
    oven: 'oven',
    fridge: 'fridge',
    dishwasher: 'dishwasher',
    worktop: 'counter',
    shower: 'shower',
    bathtub: 'bathtub',
    washbasin: 'basin',
    wc_pan: 'wc',
    handbasin: 'basin',
    closet: 'wardrobe',
    desk: 'desk',
    office_chair: 'office_chair',
    bookcase: 'bookshelf',
    washer: 'washer',
    dryer: 'dryer',
    water_heater: 'water_heater',
    towel_rail: 'radiator'
  };
  var ARCHLANG_REVISION = 'ec9f9f771ed1d3154b475322289c88727f79bf60';

  // Symboles propres au catalogue : équipements absents du socle, montrés dans
  // « Équipements & pièces » avec le dessin ArchLang (cotes en cm).
  var EXTRA_SYMBOLS = [
    { id: 'child_bed', label: 'Lit d’enfant', category: 'bed', w: 90, d: 140 },
    { id: 'crib', label: 'Lit de bébé', category: 'crib', w: 60, d: 120 },
    { id: 'bunk_bed', label: 'Lit superposé', category: 'bunk_bed', w: 90, d: 200 },
    { id: 'dresser', label: 'Commode', category: 'dresser', w: 80, d: 50 },
    { id: 'nightstand', label: 'Table de chevet', category: 'nightstand', w: 40, d: 35 },
    { id: 'vanity', label: 'Coiffeuse', category: 'vanity', w: 100, d: 45 },
    { id: 'bidet', label: 'Bidet', category: 'bidet', w: 40, d: 60 },
    { id: 'island', label: 'Îlot central', category: 'island', w: 200, d: 90 },
    { id: 'dining_table_6', label: 'Table 6 places', category: 'dining_table', w: 180, d: 90 }
  ];
  EXTRA_SYMBOLS.forEach(function (x) { ADAPTED[x.id] = x.category; });

  function icon(id, label, archlangKind, extra) {
    var record = {
      symbolId: 'furn-' + id,
      equipmentId: id,
      label: label,
      status: archlangKind ? 'mapped' : 'original',
      source: 'technohab',
      license: 'project',
      preferredExternalSource: 'archlang'
    };
    if (ADAPTED[id]) {
      record.status = 'adapted';
      record.source = 'archlang';
      record.license = 'MIT';
      record.archlangKind = ADAPTED[id];
      record.sourceUrl = SOURCES.archlang.sourceUrl + '/blob/' + ARCHLANG_REVISION + '/src/elements/fixtures-glyphs.ts';
      record.sourceRevision = ARCHLANG_REVISION;
      record.author = 'Chan Meng';
      record.modifications = 'Primitives fixtureGlyph(' + ADAPTED[id] + ') converties en SVG ; empreinte adaptée au viewBox en cm ; aplats retirés, trait currentColor.';
    } else if (archlangKind) {
      record.archlangKind = archlangKind;
      record.externalCandidate = 'npm:@chanmeng666/archlang@1.36.0';
    }
    Object.keys(extra || {}).forEach(function (key) { record[key] = extra[key]; });
    return record;
  }

  var ICONS = [
    icon('sofa', 'Canapé', 'sofa'),
    icon('sofa_3', 'Canapé 3 places', 'sofa'),
    icon('sofa_angle', 'Canapé d’angle', 'corner_sofa'),
    icon('coffee_table', 'Table basse', 'coffee_table'),
    icon('tv_unit', 'Meuble bas', 'tv_unit'),
    icon('dining_table_2', 'Table adossée 2 places', 'dining_table'),
    icon('sideboard', 'Buffet', 'sideboard'),
    icon('dining_table_4', 'Table 4 places', 'dining_table'),
    icon('bed_90', 'Lit simple 90', 'single_bed'),
    icon('bed_140', 'Lit double 140', 'double_bed'),
    icon('bed_160', 'Lit queen 160', 'queen_bed'),
    icon('bed_180', 'Lit king 180', 'king_bed'),
    icon('armchair', 'Fauteuil', 'armchair'),
    icon('wardrobe', 'Penderie', 'wardrobe'),
    icon('sink', 'Évier', 'kitchen_sink'),
    icon('hob', 'Plaque de cuisson', 'hob'),
    icon('oven', 'Four', 'oven', { scope: 'reserve' }),
    icon('fridge', 'Réfrigérateur', 'fridge'),
    icon('dishwasher', 'Lave-vaisselle', 'dishwasher'),
    icon('worktop', 'Plan de travail', 'counter'),
    icon('shower', 'Douche', 'shower'),
    icon('bathtub', 'Baignoire', 'bathtub'),
    icon('washbasin', 'Lavabo', 'washbasin'),
    icon('double_washbasin', 'Double lavabo', 'basin', { scope: 'reserve', limit: 'Composition TechnoHab ; correspondance ArchLang proche mais non importée.' }),
    icon('wc_pan', 'Cuvette WC', 'wc'),
    icon('handbasin', 'Lave-mains', 'handbasin'),
    icon('closet', 'Placard', 'closet'),
    icon('desk', 'Bureau', 'desk'),
    icon('office_chair', 'Chaise de bureau', 'office_chair'),
    icon('bookcase', 'Bibliothèque', 'bookcase'),
    icon('washer', 'Lave-linge', 'washer'),
    icon('dryer', 'Sèche-linge', 'dryer'),
    icon('shelving', 'Étagères', 'shelving'),
    icon('water_heater', 'Ballon d’eau chaude', 'water_heater'),
    icon('electrical_panel', 'Tableau électrique', null, { limit: 'Pas de correspondance ArchLang confirmée ; dessin TechnoHab conservé.' }),
    icon('towel_rail', 'Sèche-serviettes', 'radiator', { limit: 'Dessin TechnoHab mural ; correspondance ArchLang radiator proche mais non importée.' }),
    icon('parking_space', 'Emplacement véhicule', 'car')
  ].concat(EXTRA_SYMBOLS.map(function (x) {
    return icon(x.id, x.label, x.category, { scope: 'catalogue' });
  }));

  var SHARED_SYMBOLS = [
    { equipmentId: 'desk_140', symbolId: 'furn-desk', reason: 'Même grammaire graphique que le bureau plancher ; seule la longueur change.' },
    { equipmentId: 'desk_180', symbolId: 'furn-desk', reason: 'Même grammaire graphique que le bureau plancher ; seule la longueur change.' }
  ];

  root.TechnoHabIconProvenance = {
    sources: SOURCES,
    archlangRevision: ARCHLANG_REVISION,
    adapted: ADAPTED,
    extraSymbols: EXTRA_SYMBOLS,
    icons: ICONS,
    sharedSymbols: SHARED_SYMBOLS
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
