(function (root) {
  'use strict';

  var WC = ['TOILET_SEPARATE', 'BATHROOM_WITH_TOILET'];
  var BATH = ['BATHROOM', 'BATHROOM_WITH_TOILET'];
  var CIRCULATION = ['CIRCULATION'];
  var ENTRY = ['ENTRY_THRESHOLD'];
  var STORAGE = ['STORAGE'];
  var OFFICE = ['BUREAU'];
  var ALL_ROOMS = ['LIVING', 'KITCHEN', 'BEDROOM', 'BATHROOM',
    'BATHROOM_WITH_TOILET', 'TOILET_SEPARATE', 'CIRCULATION', 'ENTRY_THRESHOLD', 'STORAGE', 'BUREAU'];
  var CONTEXT = ['logement-collectif', 'maison-individuelle'];

  function scope(roomProfiles, variants) {
    var value = {
      roomProfiles: roomProfiles,
      jurisdiction: 'FR',
      buildingContext: CONTEXT,
      validFrom: '2026-08-26'
    };
    if (variants) value.variants = variants;
    return value;
  }

  function doctrine(reference, rationale) {
    return { level: 'N3', kind: 'doctrinal', reference: reference, rationale: rationale };
  }

  function compilation(locator) {
    return {
      level: 'N2', kind: 'professional', reference: 'DATASOURCE_EQUIPEMENTS.md',
      locator: locator
    };
  }

  function professional(reference, locator) {
    return { level: 'N2', kind: 'professional', reference: reference, locator: locator };
  }

  function regulatory(reference, locator) {
    return { level: 'N1', kind: 'regulatory', reference: reference, locator: locator };
  }

  root.TechnoHabCanonicalValueData = {
    schemaVersion: '1.0',
    version: '2026-09-24',
    values: [
      {
        id: 'VAL-USAGE-TARGET-MISS-WEIGHT-001', version: '1.0.0',
        label: 'Coût d’une cible de dégagement non atteinte',
        quantity: 'score-weight', value: 6, unit: 'points-per-requirement',
        status: 'PROVISIONAL', ruleLevel: 'PREFERENCE',
        source: doctrine('ROADMAP_HISTORIQUE.md §6.1 septies', 'Une pose qui tient le minimum mais manque une cible déclarée reste valide ; elle doit toutefois être classée après une pose qui atteint cette cible. Six points rendent ce manque visible sans permettre à une préférence de compenser une violation HARD. M6 devra étalonner ce poids.'),
        scope: scope(ALL_ROOMS)
      },
      {
        id: 'VAL-USAGE-COMFORT-MISS-WEIGHT-001', version: '1.0.0',
        label: 'Coût d’un dégagement de confort non atteint',
        quantity: 'score-weight', value: 2, unit: 'points-per-requirement',
        status: 'PROVISIONAL', ruleLevel: 'PREFERENCE',
        source: doctrine('ROADMAP_HISTORIQUE.md §6.1 septies', 'Le confort déclaré départage deux poses déjà valides et vient après la cible : deux points par exigence manquée maintiennent cette hiérarchie sans créer de seuil de conformité ni de prime par type de pièce. M6 devra étalonner ce poids.'),
        scope: scope(ALL_ROOMS)
      },
      {
        id: 'VAL-CIRC-DEAD-LENGTH-WEIGHT-001', version: '1.0.0',
        label: 'Coût du linéaire de circulation sans desserte',
        quantity: 'score-weight', value: 18, unit: 'points-per-meter',
        status: 'PROVISIONAL', ruleLevel: 'PREFERENCE',
        source: doctrine('ROADMAP_HISTORIQUE.md §6.1 sexies', 'Une branche n’est justifiée que jusqu’à sa dernière porte ou son accès extérieur. Le reliquat sans desserte reçoit provisoirement le même coût métrique que la façade consommée : 18 points par mètre, sans seuil de conformité ni prime de famille. M6 devra étalonner ce poids.'),
        scope: scope(CIRCULATION)
      },
      {
        id: 'VAL-CIRC-FACADE-EXCESS-WEIGHT-001', version: '1.0.0',
        label: 'Coût de façade excédentaire consommée par la circulation',
        quantity: 'score-weight', value: 18, unit: 'points-per-meter',
        status: 'PROVISIONAL', ruleLevel: 'PREFERENCE',
        source: doctrine('ROADMAP_HISTORIQUE.md §6.1 quinquies', 'La façade est réservée en priorité aux pièces principales. Une circulation peut en consommer 0,90 m lorsqu’elle accueille l’entrée ; chaque mètre supplémentaire reçoit provisoirement 18 points de peine, assez pour départager deux topologies sans sacrifier une adjacence obligatoire. Ce coefficient N3 classe les candidats et ne constitue jamais un seuil de conformité.'),
        scope: scope(CIRCULATION)
      },
      {
        // PONDERATION — famille 3.3 : regroupement technique. Spécifié en
        // préférence dans le référentiel d'origine, jamais implémenté
        // (PLACEMENT_ET_ADJACENCES.md §2.4), câblé le 24 septembre 2026.
        id: 'VAL-SCORE-SERVICES-DISTANCE-THRESHOLD-001', version: '1.0.0',
        label: 'Distance de centroïdes en deçà de laquelle deux pièces humides sont jugées groupées',
        quantity: 'length', value: 3.5, unit: 'm',
        status: 'PROVISIONAL', ruleLevel: 'PREFERENCE',
        source: doctrine('PLACEMENT_ET_ADJACENCES.md §2.4', 'Les pièces partageant un réseau (eau, évacuation, ventilation) gagnent à se toucher — colonnes mutualisées. Faute de mesure sur corpus, 3,5 m couvre deux pièces humides de gabarit courant (3 à 4 m² chacune) directement voisines, mur commun compris. Convention N3, à étalonner comme les autres poids de ce fichier.'),
        scope: scope(ALL_ROOMS)
      },
      {
        id: 'VAL-SCORE-SERVICES-DISTANCE-EXCESS-WEIGHT-001', version: '1.0.0',
        label: 'Coût de l’excédent de distance entre deux pièces humides',
        quantity: 'score-weight', value: 10, unit: 'points-per-meter',
        status: 'PROVISIONAL', ruleLevel: 'PREFERENCE',
        source: doctrine('PLACEMENT_ET_ADJACENCES.md §2.4', 'Préférence, jamais un blocage : le poids doit départager deux topologies sans jamais peser autant qu’une adjacence demandée (VAL-CIRC-FACADE-EXCESS-WEIGHT-001 = 18). 10 points par mètre au-delà du seuil de groupement tient cet ordre pour l’écart usuel sur un plan de 35 à 250 m². Convention N3, à étalonner sur corpus.'),
        scope: scope(ALL_ROOMS)
      },
      {
        // PONDERATION — famille 3.4 : lumière, sans orientation réelle.
        // Remplace le 24 septembre 2026 un proxy binaire (le séjour touche-t-il
        // le nord du plan) par la longueur de façade réellement obtenue,
        // seule donnée disponible à ce stade du calcul — voir la note dans
        // penaliteLumiere() sur ce que le score ne connaît pas encore.
        id: 'VAL-SCORE-LIGHT-FACADE-REFERENCE-001', version: '1.0.0',
        label: 'Longueur de façade en deçà de laquelle une pièce principale est jugée peu éclairée en mode lumineux',
        quantity: 'length', value: 2.0, unit: 'm',
        status: 'PROVISIONAL', ruleLevel: 'PREFERENCE',
        source: doctrine('PONDERATION_AGENCEMENT.md §3.4', 'Convention pure, sans cote externe : une pièce en façade satisfait déjà TH2D-FACADE-001 dès un contact minimal. Le mode lumineux doit distinguer ce minimum d’une façade généreuse ; 2,0 m est une valeur ronde de départ, sans source réglementaire ni professionnelle, à étalonner sur corpus comme les autres poids de ce fichier.'),
        scope: scope(ALL_ROOMS)
      },
      {
        id: 'VAL-SCORE-LIGHT-FACADE-SHORTFALL-WEIGHT-001', version: '1.0.0',
        label: 'Coût du déficit de façade d’une pièce principale en mode lumineux',
        quantity: 'score-weight', value: 8, unit: 'points-per-meter',
        status: 'PROVISIONAL', ruleLevel: 'PREFERENCE',
        source: doctrine('PONDERATION_AGENCEMENT.md §3.4', 'Préférence explicitement choisie par l’utilisateur (mode lumineux) : le poids reste sous celui d’une adjacence de circulation (18) mais au-dessus du regroupement technique implicite (10), puisque c’est ici un choix demandé et non une déduction du moteur. Convention N3, à étalonner sur corpus.'),
        scope: scope(ALL_ROOMS)
      },
      {
        // PONDERATION — famille 3.1 : compact favorise le petit équipement.
        // `resolveSize()` (room-model.js) choisit déjà la plus grande taille
        // de gamme dont le seuil de surface est atteint, sans lire la
        // priorité. Ce poids ne change pas ce choix géométrique — il classe
        // les candidats après coup, comme tous les critères de ce fichier.
        id: 'VAL-SCORE-COMPACT-OVERSIZE-WEIGHT-001', version: '1.0.0',
        label: 'Coût d’un équipement monté en gamme au-delà de son plancher, en mode compact',
        quantity: 'score-weight', value: 6, unit: 'points-per-requirement',
        status: 'PROVISIONAL', ruleLevel: 'PREFERENCE',
        source: doctrine('PONDERATION_AGENCEMENT.md §3.1', 'Un équipement dont resolveSize() retient une taille au-delà du plancher (ex. bed_140 → bed_160/180) représente le même ordre d’événement qu’une cible de dégagement manquée : même poids que VAL-USAGE-TARGET-MISS-WEIGHT-001 (6), par symétrie plutôt que par mesure. Convention N3, à étalonner sur corpus.'),
        scope: scope(ALL_ROOMS)
      },
      {
        // PONDERATION — famille 3.2 : compact pénalise le dégagement
        // généreux. Symétrique de VAL-USAGE-COMFORT-MISS-WEIGHT-001 : ce
        // que ce poids-là facture quand le confort déclaré n’est PAS atteint,
        // celui-ci le facture quand il L’EST, mais seulement en mode compact.
        // Le solveur expose déjà l’usage réellement alloué par pose —
        // `placement.assessClearanceLevels()`, vérifié avant d’écrire cette
        // règle — donc rien de nouveau n’est demandé au moteur.
        id: 'VAL-SCORE-COMPACT-COMFORT-WEIGHT-001', version: '1.0.0',
        label: 'Coût d’un dégagement de confort atteint, en mode compact',
        quantity: 'score-weight', value: 2, unit: 'points-per-requirement',
        status: 'PROVISIONAL', ruleLevel: 'PREFERENCE',
        source: doctrine('PONDERATION_AGENCEMENT.md §3.2', 'Symétrique exact de VAL-USAGE-COMFORT-MISS-WEIGHT-001 : même poids (2 points-par-exigence) pour le même phénomène jugé en sens inverse — le confort n’est ni bon ni mauvais en soi, seulement désirable ou non selon la préférence exprimée. Convention N3, à étalonner sur corpus.'),
        scope: scope(ALL_ROOMS)
      },
      {
        // TABLE_PROGRAMME_BANDES §4 — ancrage réglementaire de la pièce
        // principale, vérifié sur Légifrance le 26 septembre 2026 et pris par
        // Théo. GUIDELINE et non HARD : le décret définit la décence d'un
        // logement loué, pas une contrainte de conception d'un plan de principe.
        id: 'VAL-REG-MAIN-ROOM-AREA-MIN-001', version: '1.0.0',
        label: 'Surface habitable minimale d’au moins une pièce principale (logement décent)',
        quantity: 'area', value: 9, unit: 'm2', status: 'ADOPTED', ruleLevel: 'GUIDELINE',
        source: regulatory('Décret n° 2002-120 du 30 janvier 2002, article 4',
          'Légifrance LEGIARTI000043842463 — 9 m² et 2,20 m sous plafond, ou 20 m³ ; mesures au sens de l’article R. 156-1 du CCH'),
        scope: scope(['LIVING', 'BEDROOM', 'BUREAU'])
      },
      {
        id: 'VAL-REG-MAIN-ROOM-HEIGHT-MIN-001', version: '1.0.0',
        label: 'Hauteur sous plafond minimale de la pièce principale de 9 m² (logement décent)',
        quantity: 'length', value: 2.2, unit: 'm', status: 'ADOPTED', ruleLevel: 'GUIDELINE',
        source: regulatory('Décret n° 2002-120 du 30 janvier 2002, article 4',
          'Légifrance LEGIARTI000043842463 — couplée à la surface de 9 m² ; à défaut, volume habitable ≥ 20 m³'),
        scope: scope(['LIVING', 'BEDROOM', 'BUREAU'])
      },
      {
        // CLASSIFICATION_LOGEMENT §2.2 — bandes de classe de taille.
        // Explicitement non sourcées : DATASOURCE_EQUIPEMENTS.md a déjà
        // renoncé à sourcer sa Table B pour la même raison. Publiées comme
        // convention N3, comme les poids de PONDERATION_AGENCEMENT.md, pas
        // comme un fait. Aucun poids de score n'en dépend à ce jour.
        id: 'VAL-CLASSE-PETIT-MIN-001', version: '1.0.0',
        label: 'Surface à partir de laquelle un logement quitte la classe « petit »',
        quantity: 'area', value: 55, unit: 'm2',
        status: 'PROVISIONAL', ruleLevel: 'PREFERENCE',
        source: doctrine('CLASSIFICATION_LOGEMENT.md §2.2', 'Convention pure, faute de Table B sourcée (DATASOURCE_EQUIPEMENTS.md). Aucun poids n’en dépend encore ; publiée pour que la classe soit lisible sur le plan avant d’être exploitée.'),
        scope: scope(ALL_ROOMS)
      },
      {
        id: 'VAL-CLASSE-MOYEN-MIN-001', version: '1.0.0',
        label: 'Surface à partir de laquelle un logement quitte la classe « moyen »',
        quantity: 'area', value: 90, unit: 'm2',
        status: 'PROVISIONAL', ruleLevel: 'PREFERENCE',
        source: doctrine('CLASSIFICATION_LOGEMENT.md §2.2', 'Convention pure, même statut que le seuil « petit ».'),
        scope: scope(ALL_ROOMS)
      },
      {
        id: 'VAL-CLASSE-GRAND-MIN-001', version: '1.0.0',
        label: 'Surface à partir de laquelle un logement quitte la classe « grand »',
        quantity: 'area', value: 140, unit: 'm2',
        status: 'PROVISIONAL', ruleLevel: 'PREFERENCE',
        source: doctrine('CLASSIFICATION_LOGEMENT.md §2.2', 'Convention pure, même statut que les deux seuils précédents. Au-delà : « très grand », jusqu’au plafond du moteur (250 m²).'),
        scope: scope(ALL_ROOMS)
      },
      {
        id: 'VAL-CIRC-PROGRAM-AREA-MIN-001', version: '1.0.0',
        label: 'Surface minimale de programme d’une circulation',
        quantity: 'area', value: 3, unit: 'm2', status: 'PROVISIONAL', ruleLevel: 'HARD',
        source: doctrine('profils/circulation.md §5', 'Trois mètres carrés constituent le plancher d’allocation du premier volume de distribution ; la largeur conditionnée et la desserte réelle restent les autorités de validité.'),
        scope: scope(CIRCULATION)
      },
      {
        id: 'VAL-CIRC-CLEAR-WIDTH-SIMPLE-MIN-001', version: '1.0.0',
        label: 'Largeur libre minimale d’une circulation simple',
        quantity: 'length', value: 0.9, unit: 'm', status: 'ADOPTED', ruleLevel: 'HARD',
        source: regulatory('Arrêté du 24 décembre 2015, article 11', 'VEILLE_NORMATIVE.md — VAL-PMR-009'),
        scope: scope(CIRCULATION)
      },
      {
        id: 'VAL-CIRC-CLEAR-WIDTH-CROSSING-MIN-001', version: '1.0.0',
        label: 'Largeur libre minimale d’une circulation à croisement probable',
        quantity: 'length', value: 1.2, unit: 'm', status: 'ADOPTED', ruleLevel: 'HARD',
        source: doctrine('DECISIONS_PROGRAMME.md décision 7', 'À partir de trois espaces desservis, la probabilité de croisement transforme le passage unipersonnel de 0,90 m en circulation collective ; 1,20 m est la largeur de croisement retenue par la compilation C4.'),
        scope: scope(CIRCULATION)
      },
      {
        id: 'VAL-CIRC-CROSSING-SERVICE-COUNT-001', version: '1.0.0',
        label: 'Nombre de dessertes déclenchant la largeur de croisement',
        quantity: 'count', value: 3, unit: 'spaces', status: 'ADOPTED', ruleLevel: 'HARD',
        source: doctrine('DECISIONS_PROGRAMME.md décision 7', 'Le seuil compte des espaces desservis et non des mètres carrés : sous trois dessertes la circulation reste un passage simple, à partir de trois elle doit permettre le croisement.'),
        scope: scope(CIRCULATION)
      },
      {
        id: 'VAL-CIRC-CLEAR-WIDTH-MAX-001', version: '1.0.0',
        label: 'Largeur maximale d’un volume encore qualifié de circulation',
        quantity: 'length', value: 1.8, unit: 'm', status: 'ADOPTED', ruleLevel: 'HARD',
        source: doctrine('profils/circulation.md §5', 'Au-delà de 1,80 m, le volume n’est plus un couloir mais un hall ou une entrée qui doit être nommé et jugé selon sa fonction plutôt que conservé comme surface de distribution anonyme.'),
        scope: scope(CIRCULATION)
      },
      {
        id: 'VAL-ENTRY-DOOR-BAY-WIDTH-001', version: '1.0.0',
        label: 'Largeur de baie de la porte d’entrée', quantity: 'length', value: 0.9, unit: 'm',
        status: 'ADOPTED', ruleLevel: 'HARD',
        source: regulatory('Arrêté du 24 décembre 2015, article 10', 'VEILLE_NORMATIVE.md — VAL-PMR-005'),
        scope: scope(ENTRY)
      },
      {
        id: 'VAL-ENTRY-DOOR-LEAF-WIDTH-001', version: '1.0.0',
        label: 'Largeur nominale du vantail d’entrée', quantity: 'length', value: 0.83, unit: 'm',
        status: 'ADOPTED', ruleLevel: 'HARD',
        source: regulatory('Arrêté du 24 décembre 2015, article 10', 'VEILLE_NORMATIVE.md — VAL-PMR-006'),
        scope: scope(ENTRY)
      },
      {
        id: 'VAL-ENTRY-CLEAR-WIDTH-001', version: '1.0.0',
        label: 'Passage utile de la porte d’entrée', quantity: 'length', value: 0.83, unit: 'm',
        status: 'ADOPTED', ruleLevel: 'HARD',
        source: regulatory('Arrêté du 24 décembre 2015, article 10', 'VEILLE_NORMATIVE.md — passage utile de la porte d’entrée'),
        scope: scope(ENTRY)
      },
      {
        id: 'VAL-ENTRY-ARRIVAL-WIDTH-MIN-001', version: '1.0.0',
        label: 'Largeur minimale de la zone d’arrivée intérieure', quantity: 'length', value: 1.2, unit: 'm',
        status: 'PROVISIONAL', ruleLevel: 'HARD',
        source: doctrine('profils/entree.md §4', 'Le seuil doit permettre de franchir la porte, se retourner et quitter son axe sans placer immédiatement l’usager dans le mobilier de la pièce hôte ; la largeur collective de 1,20 m est réservée dans le plan construit.'),
        scope: scope(ENTRY)
      },
      {
        id: 'VAL-ENTRY-ARRIVAL-DEPTH-MIN-001', version: '1.0.0',
        label: 'Profondeur minimale de la zone d’arrivée intérieure', quantity: 'length', value: 1.2, unit: 'm',
        status: 'PROVISIONAL', ruleLevel: 'HARD',
        source: doctrine('profils/entree.md §4', 'Une profondeur égale à la largeur de croisement empêche que le seuil débouche directement contre une emprise ; elle décrit une zone hébergée et non une pièce d’entrée autonome.'),
        scope: scope(ENTRY)
      },
      {
        id: 'VAL-STORAGE-BAY-DEPTH-MIN-001', version: '1.0.0',
        label: 'Profondeur minimale d’une zone de rangement cédée', quantity: 'length', value: 0.45, unit: 'm',
        status: 'ADOPTED', ruleLevel: 'HARD',
        source: professional('agencement/rangements.md', 'G2 — profondeur d’étagère pour vêtements pliés'),
        scope: scope(STORAGE)
      },
      {
        id: 'VAL-STORAGE-BAY-DEPTH-LENGTH-RATIO-MAX-001', version: '1.0.0',
        label: 'Rapport maximal profondeur sur longueur d’une zone de rangement', quantity: 'ratio', value: 0.6, unit: 'ratio',
        status: 'ADOPTED', ruleLevel: 'HARD',
        source: doctrine('profils/rangements.md §9', 'Une zone plus profonde que 60 % de sa longueur cesse d’être une bande exploitable et devient un carré résiduel ; cette borne distingue le zonage de rangement d’une pièce ou d’une réserve anonyme.'),
        scope: scope(STORAGE)
      },
      {
        id: 'VAL-WC-PROGRAM-AREA-MIN-001', version: '1.0.0',
        label: 'Surface minimale de programme du WC', quantity: 'area', value: 1.5, unit: 'm2',
        status: 'ADOPTED', ruleLevel: 'HARD',
        source: doctrine('profils/wc-separe.md §5', 'Le plancher de dignité d’usage évite qu’une simple faisabilité géométrique soit présentée comme un WC acceptable.'),
        scope: scope(WC)
      },
      {
        id: 'VAL-WC-PROGRAM-SIDE-MIN-001', version: '1.0.0',
        label: 'Côté court minimal de programme du WC', quantity: 'length', value: 0.9, unit: 'm',
        status: 'ADOPTED', ruleLevel: 'HARD',
        source: doctrine('profils/wc-separe.md §5', 'Le côté court de 0,90 m est la convention de dignité actuellement retenue par le socle, au-dessus de la seule emprise calculée.'),
        scope: scope(WC)
      },
      {
        id: 'VAL-WC-PROGRAM-AREA-MAX-RATIO-001', version: '1.0.0',
        label: 'Plafond de surface du WC rapporté au besoin meublable',
        quantity: 'ratio', value: 3.5, unit: 'ratio', status: 'ADOPTED', ruleLevel: 'HARD',
        source: doctrine('ROADMAP_HISTORIQUE.md §6.6 et §9.7', 'Le plafond correspond à environ 3,6 m² avec le besoin meublable pilote de 1,04 m² : borne haute du profil WC courant incluant la tolérance de matérialisation, mais fermée avant que la pièce ne redevienne variable d’ajustement. Un centile observé entérinerait précisément le défaut que O1 corrige.'),
        scope: scope(WC)
      },
      {
        id: 'VAL-WC-PAN-FOOTPRINT-001', version: '1.0.0',
        label: 'Emprise de la cuvette du socle', quantity: 'dimensions-2d',
        value: { width: 0.4, depth: 0.7 }, unit: 'm', status: 'PROVISIONAL', ruleLevel: 'HARD',
        source: doctrine('profils/wc-separe.md §3', 'Cette emprise correspond au composant actif et à un standard de marché plausible, mais son ancien recoupement a été invalidé ; elle reste provisoire jusqu’à sourcing direct.'),
        scope: scope(WC)
      },
      {
        id: 'VAL-WC-PAN-CLEARANCE-FRONT-001', version: '2.0.0',
        label: 'Dégagement frontal minimal de la cuvette', quantity: 'length', value: 0.6, unit: 'm',
        status: 'PROVISIONAL', ruleLevel: 'HARD',
        source: doctrine('profils/wc-separe.md §4', 'Le minimum ergonomique de 0,60 m de la compilation S3 borne la faisabilité ; 0,70 m et 0,80 m restent des objectifs distincts.'),
        scope: scope(WC)
      },
      {
        id: 'VAL-WC-PAN-CLEARANCE-FRONT-TARGET-001', version: '1.0.0',
        label: 'Dégagement frontal cible de la cuvette', quantity: 'length', value: 0.7, unit: 'm',
        status: 'ADOPTED', ruleLevel: 'GUIDELINE',
        source: doctrine('profils/wc-separe.md §4', 'La cible de 0,70 m distingue une conception courante du minimum encore utilisable.'), scope: scope(WC)
      },
      {
        id: 'VAL-WC-PAN-CLEARANCE-FRONT-COMFORT-001', version: '1.0.0',
        label: 'Dégagement frontal confortable de la cuvette', quantity: 'length', value: 0.8, unit: 'm',
        status: 'ADOPTED', ruleLevel: 'PREFERENCE',
        source: doctrine('profils/wc-separe.md §4', 'Le recul de 0,80 m est réservé au confort et ne doit plus durcir le domaine de faisabilité.'), scope: scope(WC)
      },
      {
        id: 'VAL-WC-PAN-CLEARANCE-WIDTH-001', version: '1.0.0',
        label: 'Largeur de la zone d’usage devant la cuvette', quantity: 'length', value: 0.6, unit: 'm',
        status: 'PROVISIONAL', ruleLevel: 'HARD',
        source: doctrine('assets/socle.data.js — wc_pan.usage.width', 'La largeur borne la zone frontale réellement testée par le solveur et reste distincte des deux bandes latérales.'),
        scope: scope(WC)
      },
      {
        id: 'VAL-WC-PAN-CLEARANCE-SIDE-MIN-001', version: '1.0.0',
        label: 'Dégagement latéral minimal de la cuvette', quantity: 'length', value: 0.2, unit: 'm',
        status: 'PROVISIONAL', ruleLevel: 'HARD',
        source: doctrine('profils/wc-separe.md §4', 'Les 0,20 m issus de la compilation S3 deviennent deux zones latérales explicites plutôt qu’une largeur implicite de pièce.'), scope: scope(WC)
      },
      {
        id: 'VAL-WC-PAN-CLEARANCE-SIDE-TARGET-001', version: '1.0.0',
        label: 'Dégagement latéral cible de la cuvette', quantity: 'length', value: 0.25, unit: 'm',
        status: 'ADOPTED', ruleLevel: 'GUIDELINE',
        source: doctrine('profils/wc-separe.md §4', 'La cible ajoute 5 cm de chaque côté sans transformer ce confort en minimum.'), scope: scope(WC)
      },
      {
        id: 'VAL-WC-HANDBASIN-FOOTPRINT-001', version: '1.0.0',
        label: 'Emprise du lave-mains standard', quantity: 'dimensions-2d',
        value: { width: 0.4, depth: 0.3 }, unit: 'm', status: 'ADOPTED', ruleLevel: 'HARD',
        source: doctrine('profils/wc-separe.md §3', 'Le format standard du profil pilote est retenu comme valeur par défaut modifiable lorsque le lave-mains optionnel est activé.'),
        scope: scope(WC)
      },
      {
        id: 'VAL-WC-HANDBASIN-ACTIVATION-AREA-001', version: '1.0.0',
        label: 'Surface d’activation du lave-mains', quantity: 'area', value: 1.3, unit: 'm2',
        status: 'ADOPTED', ruleLevel: 'GUIDELINE',
        source: doctrine('profils/wc-separe.md §17', 'À partir de 1,30 m², le cas moyen du profil doit proposer le lave-mains sans le transformer en obligation réglementaire.'), scope: scope(WC)
      },
      {
        id: 'VAL-WC-HANDBASIN-CLEARANCE-FRONT-001', version: '1.0.0',
        label: 'Dégagement frontal du lave-mains', quantity: 'length', value: 0.5, unit: 'm',
        status: 'PROVISIONAL', ruleLevel: 'HARD',
        source: doctrine('profils/wc-separe.md §4', 'Le dégagement est celui du socle actif ; il reste provisoire faute de source ergonomique vérifiée.'),
        scope: scope(WC)
      },
      {
        id: 'VAL-WC-HANDBASIN-CLEARANCE-FRONT-TARGET-001', version: '1.0.0',
        label: 'Dégagement frontal cible du lave-mains', quantity: 'length', value: 0.6, unit: 'm',
        status: 'ADOPTED', ruleLevel: 'GUIDELINE',
        source: doctrine('profils/wc-separe.md §4', 'La cible de 0,60 m qualifie le cas moyen sans modifier le minimum géométrique.'), scope: scope(WC)
      },
      {
        id: 'VAL-WC-HANDBASIN-CLEARANCE-FRONT-COMFORT-001', version: '1.0.0',
        label: 'Dégagement frontal confortable du lave-mains', quantity: 'length', value: 0.7, unit: 'm',
        status: 'ADOPTED', ruleLevel: 'PREFERENCE',
        source: doctrine('profils/wc-separe.md §4', 'Le confort de 0,70 m reste un critère de classement, non une condition de faisabilité.'), scope: scope(WC)
      },
      {
        id: 'VAL-BED-PROGRAM-AREA-MIN-CHILD-001', version: '1.0.0',
        label: 'Surface minimale de programme de la chambre enfant', quantity: 'area', value: 9, unit: 'm2',
        status: 'ADOPTED', ruleLevel: 'HARD',
        source: doctrine('profils/chambre.md §5', 'Neuf mètres carrés maintiennent une chambre simple digne d’usage au-delà de sa seule meublabilité ; la portée réglementaire plus étroite du décret décence est explicitement distinguée de cette doctrine de projet.'),
        scope: scope(['BEDROOM'], ['enfant'])
      },
      {
        id: 'VAL-BED-PROGRAM-SIDE-MIN-CHILD-001', version: '1.0.0',
        label: 'Côté court minimal de la chambre enfant', quantity: 'length', value: 2.5, unit: 'm',
        status: 'ADOPTED', ruleLevel: 'HARD',
        source: doctrine('profils/chambre.md §5', 'Le côté court de 2,50 m évite qu’une chambre simple soit réduite à un rectangle meublable très allongé et préserve lit, rangement et passage.'),
        scope: scope(['BEDROOM'], ['enfant'])
      },
      {
        id: 'VAL-BED-PROGRAM-AREA-MIN-PARENT-001', version: '1.0.0',
        label: 'Surface minimale de programme de la chambre parentale', quantity: 'area', value: 11, unit: 'm2',
        status: 'ADOPTED', ruleLevel: 'HARD',
        source: doctrine('profils/chambre.md §5', 'Deux dormeurs indépendants imposent deux accès latéraux et le passage au pied ; onze mètres carrés distinguent cette fonction du minimum enfant sans la confondre avec une chambre accessible ou une suite.'),
        scope: scope(['BEDROOM'], ['parentale'])
      },
      {
        id: 'VAL-BED-PROGRAM-SIDE-MIN-PARENT-001', version: '1.0.0',
        label: 'Côté court minimal de la chambre parentale', quantity: 'length', value: 2.7, unit: 'm',
        status: 'ADOPTED', ruleLevel: 'HARD',
        source: doctrine('profils/chambre.md §5', 'Le côté court de 2,70 m protège l’accès bilatéral au lit double et écarte les proportions où le programme ne tient que par une orientation extrême.'),
        scope: scope(['BEDROOM'], ['parentale'])
      },
      {
        id: 'VAL-EQ-001', version: '1.0.0', label: 'Lit simple compact',
        quantity: 'dimensions-2d', value: { width: 0.9, depth: 1.9 }, unit: 'm',
        status: 'ADOPTED', ruleLevel: 'HARD', source: compilation('§3 — Chambre, lit simple compact'),
        scope: scope(['BEDROOM'], ['enfant'])
      },
      {
        id: 'VAL-EQ-002', version: '1.0.0', label: 'Lit double compact',
        quantity: 'dimensions-2d', value: { width: 1.4, depth: 1.9 }, unit: 'm',
        status: 'ADOPTED', ruleLevel: 'HARD', source: compilation('§3 — Chambre, lit double compact'),
        scope: scope(['BEDROOM'], ['parentale'])
      },
      {
        id: 'VAL-EQ-003', version: '1.0.0', label: 'Lit double standard',
        quantity: 'dimensions-2d', value: { width: 1.6, depth: 2 }, unit: 'm',
        status: 'ADOPTED', ruleLevel: 'GUIDELINE', source: compilation('§3 — Chambre, lit double standard'),
        scope: scope(['BEDROOM'], ['parentale'])
      },
      {
        id: 'VAL-EQ-004', version: '1.0.0', label: 'Lit double grand',
        quantity: 'dimensions-2d', value: { width: 1.8, depth: 2 }, unit: 'm',
        status: 'ADOPTED', ruleLevel: 'PREFERENCE', source: compilation('§3 — Chambre, lit double grand'),
        scope: scope(['BEDROOM'], ['parentale'])
      },
      {
        id: 'VAL-BED-SIDE-MIN-001', version: '1.0.0', label: 'Passage latéral minimal du lit',
        quantity: 'length', value: 0.6, unit: 'm', status: 'PROVISIONAL', ruleLevel: 'HARD',
        source: doctrine('profils/chambre.md §4', 'Le passage de 0,60 m borne la faisabilité d’un accès au lit ; la variante enfant en exige un et la parentale deux.'), scope: scope(['BEDROOM'])
      },
      {
        id: 'VAL-BED-SIDE-TARGET-CHILD-001', version: '1.0.0', label: 'Passage latéral cible du lit simple',
        quantity: 'length', value: 0.6, unit: 'm', status: 'ADOPTED', ruleLevel: 'GUIDELINE',
        source: doctrine('profils/chambre.md §4', 'Pour un dormeur, l’unique accès latéral de 0,60 m constitue aussi la cible courante.'), scope: scope(['BEDROOM'], ['enfant'])
      },
      {
        id: 'VAL-BED-SIDE-COMFORT-CHILD-001', version: '1.0.0', label: 'Passage latéral confortable du lit simple',
        quantity: 'length', value: 0.7, unit: 'm', status: 'ADOPTED', ruleLevel: 'PREFERENCE',
        source: doctrine('profils/chambre.md §4', 'Dix centimètres supplémentaires qualifient le confort sans durcir le minimum enfant.'), scope: scope(['BEDROOM'], ['enfant'])
      },
      {
        id: 'VAL-BED-SIDE-TARGET-PARENT-001', version: '1.0.0', label: 'Passage latéral cible du lit double',
        quantity: 'length', value: 0.7, unit: 'm', status: 'ADOPTED', ruleLevel: 'GUIDELINE',
        source: doctrine('profils/chambre.md §4', 'La cible de 0,70 m de chaque côté distingue l’accès courant des deux dormeurs du minimum à 0,60 m.'), scope: scope(['BEDROOM'], ['parentale'])
      },
      {
        id: 'VAL-BED-SIDE-COMFORT-PARENT-001', version: '1.0.0', label: 'Passage latéral confortable du lit double',
        quantity: 'length', value: 0.9, unit: 'm', status: 'ADOPTED', ruleLevel: 'PREFERENCE',
        source: doctrine('profils/chambre.md §4', 'Le passage de 0,90 m est réservé au confort et prépare le profil accessible sans lui être assimilé.'), scope: scope(['BEDROOM'], ['parentale'])
      },
      {
        id: 'VAL-BED-FOOT-MIN-001', version: '1.0.0', label: 'Passage minimal au pied du lit',
        quantity: 'length', value: 0.6, unit: 'm', status: 'PROVISIONAL', ruleLevel: 'HARD',
        source: doctrine('profils/chambre.md §4', 'Le passage au pied est une zone requise distincte des côtés et ferme une omission historique du solveur.'), scope: scope(['BEDROOM'])
      },
      {
        id: 'VAL-BED-FOOT-TARGET-001', version: '1.0.0', label: 'Passage cible au pied du lit',
        quantity: 'length', value: 0.7, unit: 'm', status: 'ADOPTED', ruleLevel: 'GUIDELINE',
        source: doctrine('profils/chambre.md §4', 'La cible de 0,70 m permet un passage courant sans transformer ce confort en condition de faisabilité.'), scope: scope(['BEDROOM'])
      },
      {
        id: 'VAL-BED-FOOT-COMFORT-001', version: '1.0.0', label: 'Passage confortable au pied du lit',
        quantity: 'length', value: 0.9, unit: 'm', status: 'ADOPTED', ruleLevel: 'PREFERENCE',
        source: doctrine('profils/chambre.md §4', 'Le recul de 0,90 m reste un critère de classement des chambres généreuses.'), scope: scope(['BEDROOM'])
      },
      {
        id: 'VAL-BED-WARDROBE-FOOTPRINT-001', version: '1.0.0', label: 'Penderie minimale de chambre',
        quantity: 'dimensions-2d', value: { width: 1.2, depth: 0.6 }, unit: 'm',
        status: 'PROVISIONAL', ruleLevel: 'HARD',
        source: doctrine('profils/chambre.md §3', 'La profondeur est issue de la compilation professionnelle ; la longueur d’un module de 1,20 m reste la convention minimale du projet.'), scope: scope(['BEDROOM'])
      },
      {
        id: 'VAL-BED-WARDROBE-CLEARANCE-MIN-001', version: '1.0.0', label: 'Dégagement minimal devant la penderie coulissante',
        quantity: 'length', value: 0.7, unit: 'm', status: 'PROVISIONAL', ruleLevel: 'HARD',
        source: doctrine('profils/chambre.md §4', 'La variante C4 retient une façade coulissante : elle supprime le débattement battant mais conserve 0,70 m d’usage devant le rangement.'), scope: scope(['BEDROOM'])
      },
      {
        id: 'VAL-BED-WARDROBE-CLEARANCE-TARGET-001', version: '1.0.0', label: 'Dégagement cible devant la penderie coulissante',
        quantity: 'length', value: 0.7, unit: 'm', status: 'ADOPTED', ruleLevel: 'GUIDELINE',
        source: doctrine('profils/chambre.md §4', 'Le minimum de la façade coulissante est aussi la cible du cas courant.'), scope: scope(['BEDROOM'])
      },
      {
        id: 'VAL-BED-WARDROBE-CLEARANCE-COMFORT-001', version: '1.0.0', label: 'Dégagement confortable devant la penderie coulissante',
        quantity: 'length', value: 0.9, unit: 'm', status: 'ADOPTED', ruleLevel: 'PREFERENCE',
        source: doctrine('profils/chambre.md §4', 'Le recul de 0,90 m permet de consulter le rangement sans gêner le passage et reste une préférence.'), scope: scope(['BEDROOM'])
      },
      {
        id: 'VAL-KITCHEN-PROGRAM-AREA-MIN-001', version: '1.0.0', label: 'Surface minimale de programme de la cuisine',
        quantity: 'area', value: 7, unit: 'm2', status: 'ADOPTED', ruleLevel: 'HARD',
        source: doctrine('profils/cuisine.md §5', 'Sept mètres carrés sont le plancher de dignité du programme courant, volontairement distinct du seul minimum géométrique calculé à 4,5 m².'), scope: scope(['KITCHEN'])
      },
      {
        id: 'VAL-KITCHEN-PROGRAM-SIDE-MIN-001', version: '1.0.0', label: 'Côté court minimal de programme de la cuisine',
        quantity: 'length', value: 1.85, unit: 'm', status: 'ADOPTED', ruleLevel: 'HARD',
        source: doctrine('profils/cuisine.md §4', 'Le côté court additionne une profondeur de linéaire de 0,65 m et le passage traversant de 1,20 m ; il borne la fonction, pas une surface réglementaire.'), scope: scope(['KITCHEN'])
      },
      {
        id: 'VAL-KITCHEN-FACING-CLEARANCE-MIN-001', version: '1.0.0', label: 'Passage minimal entre linéaires opposés',
        quantity: 'length', value: 1.2, unit: 'm', status: 'ADOPTED', ruleLevel: 'HARD',
        source: { level: 'N2', kind: 'professional', reference: 'agencement/cuisine.md', locator: '§1 C7 et §2' }, scope: scope(['KITCHEN'])
      },
      {
        id: 'VAL-KITCHEN-SINK-FOOTPRINT-001', version: '1.0.0', label: 'Emprise minimale de l’évier',
        quantity: 'dimensions-2d', value: { width: 0.6, depth: 0.6 }, unit: 'm', status: 'ADOPTED', ruleLevel: 'HARD',
        source: compilation('§4 — Cuisine, VAL-EQ-010'), scope: scope(['KITCHEN'])
      },
      {
        id: 'VAL-KITCHEN-HOB-FOOTPRINT-001', version: '1.0.0', label: 'Emprise minimale de la plaque de cuisson',
        quantity: 'dimensions-2d', value: { width: 0.6, depth: 0.6 }, unit: 'm', status: 'ADOPTED', ruleLevel: 'HARD',
        source: compilation('§4 — Cuisine, VAL-EQ-010'), scope: scope(['KITCHEN'])
      },
      {
        id: 'VAL-KITCHEN-WORKTOP-FOOTPRINT-MIN-001', version: '1.0.0', label: 'Module minimal du plan de travail avant G4',
        quantity: 'dimensions-2d', value: { width: 0.6, depth: 0.6 }, unit: 'm', status: 'PROVISIONAL', ruleLevel: 'HARD',
        source: doctrine('profils/cuisine.md §3', 'Le module de 0,60 m maintient la préparation entre évier et plaque ; sa longueur variable reste explicitement différée au solveur G4.'), scope: scope(['KITCHEN'])
      },
      {
        id: 'VAL-KITCHEN-FRIDGE-FOOTPRINT-001', version: '1.0.0', label: 'Emprise minimale du réfrigérateur encastrable',
        quantity: 'dimensions-2d', value: { width: 0.6, depth: 0.6 }, unit: 'm', status: 'ADOPTED', ruleLevel: 'HARD',
        source: compilation('§4 — Cuisine, VAL-EQ-016'), scope: scope(['KITCHEN'])
      },
      {
        id: 'VAL-KITCHEN-APPLIANCE-CLEARANCE-MIN-001', version: '1.0.0', label: 'Dégagement minimal devant les appareils de cuisine',
        quantity: 'length', value: 0.9, unit: 'm', status: 'ADOPTED', ruleLevel: 'HARD',
        source: { level: 'N2', kind: 'professional', reference: 'profils/cuisine.md', locator: '§4 — service devant appareil' }, scope: scope(['KITCHEN'])
      },
      {
        id: 'VAL-KITCHEN-DISHWASHER-ACTIVATION-AREA-001', version: '1.0.0', label: 'Seuil d’activation du lave-vaisselle',
        quantity: 'area', value: 9, unit: 'm2', status: 'PROVISIONAL', ruleLevel: 'GUIDELINE',
        source: doctrine('profils/cuisine.md §2 et §5', 'Le lave-vaisselle devient l’équipement optionnel du programme moyen à partir de 9 m² ; ce seuil reste une convention de profil.'), scope: scope(['KITCHEN'])
      },
      {
        id: 'VAL-KITCHEN-DISHWASHER-FOOTPRINT-001', version: '1.0.0', label: 'Emprise du lave-vaisselle standard',
        quantity: 'dimensions-2d', value: { width: 0.6, depth: 0.6 }, unit: 'm', status: 'ADOPTED', ruleLevel: 'HARD',
        source: compilation('§4 — Cuisine, VAL-EQ-015'), scope: scope(['KITCHEN'])
      },
      {
        id: 'VAL-KITCHEN-DISHWASHER-SWING-CLEARANCE-MIN-001', version: '1.0.0', label: 'Dégagement du lave-vaisselle ouvert',
        quantity: 'length', value: 1.2, unit: 'm', status: 'ADOPTED', ruleLevel: 'HARD',
        source: { level: 'N2', kind: 'professional', reference: 'profils/cuisine.md', locator: '§4 — appareil ouvert' }, scope: scope(['KITCHEN'])
      },
      {
        id: 'VAL-KITCHEN-TRIANGLE-PERIMETER-MAX-001', version: '1.0.0', label: 'Périmètre cible maximal du triangle d’activité',
        quantity: 'length', value: 6.5, unit: 'm', status: 'ADOPTED', ruleLevel: 'GUIDELINE',
        source: { level: 'N2', kind: 'professional', reference: 'agencement/cuisine.md', locator: '§1 C8' }, scope: scope(['KITCHEN'])
      },
      {
        id: 'VAL-BATH-PROGRAM-AREA-MIN-001', version: '1.0.0',
        label: 'Surface minimale de programme de la salle d’eau', quantity: 'area', value: 3, unit: 'm2',
        status: 'ADOPTED', ruleLevel: 'HARD',
        source: doctrine('profils/salle-eau-wc-integre.md §5', 'Trois mètres carrés constituent le plancher fonctionnel retenu pour la variante eau compacte, avant ajout éventuel du WC.'),
        scope: scope(BATH)
      },
      {
        id: 'VAL-BATH-PROGRAM-SIDE-MIN-001', version: '1.0.0',
        label: 'Côté court minimal de programme de la salle d’eau', quantity: 'length', value: 1.7, unit: 'm',
        status: 'PROVISIONAL', ruleLevel: 'HARD',
        source: doctrine('profils/salle-eau-wc-integre.md §5', 'Le socle impose 1,70 m par dignité d’usage, tout en sachant qu’une composition mesurée fonctionne dès 1,50 m ; l’arbitrage reste à consolider.'),
        scope: scope(BATH)
      },
      {
        id: 'VAL-EQ-031', version: '1.0.0', label: 'Receveur de douche confortable',
        quantity: 'dimensions-2d', value: { width: 0.9, depth: 0.9 }, unit: 'm',
        status: 'ADOPTED', ruleLevel: 'HARD', source: compilation('§4 — Salle d’eau'), scope: scope(BATH, ['eau'])
      },
      {
        id: 'VAL-EQ-030', version: '1.0.0', label: 'Baignoire droite standard',
        quantity: 'dimensions-2d', value: { width: 1.7, depth: 0.7 }, unit: 'm',
        status: 'ADOPTED', ruleLevel: 'HARD', source: compilation('§4 — Salle d’eau'), scope: scope(BATH, ['bain'])
      },
      {
        id: 'VAL-BATH-SHOWER-CLEARANCE-MIN-001', version: '1.0.0', label: 'Dégagement minimal devant la douche',
        quantity: 'length', value: 0.6, unit: 'm', status: 'PROVISIONAL', ruleLevel: 'HARD',
        source: doctrine('profils/salle-eau-wc-integre.md §4', 'Le minimum de 0,60 m borne la sortie de douche sans confondre faisabilité et confort.'), scope: scope(BATH, ['eau'])
      },
      {
        id: 'VAL-BATH-SHOWER-CLEARANCE-TARGET-001', version: '1.0.0', label: 'Dégagement cible devant la douche',
        quantity: 'length', value: 0.7, unit: 'm', status: 'ADOPTED', ruleLevel: 'GUIDELINE',
        source: doctrine('profils/salle-eau-wc-integre.md §4', 'La cible de 0,70 m décrit la conception courante du profil.'), scope: scope(BATH, ['eau'])
      },
      {
        id: 'VAL-BATH-SHOWER-CLEARANCE-COMFORT-001', version: '1.0.0', label: 'Dégagement confortable devant la douche',
        quantity: 'length', value: 0.8, unit: 'm', status: 'ADOPTED', ruleLevel: 'PREFERENCE',
        source: doctrine('profils/salle-eau-wc-integre.md §4', 'Le recul de 0,80 m reste une préférence de confort.'), scope: scope(BATH, ['eau'])
      },
      {
        id: 'VAL-BATH-TUB-CLEARANCE-MIN-001', version: '1.0.0', label: 'Dégagement minimal devant la baignoire',
        quantity: 'length', value: 0.7, unit: 'm', status: 'PROVISIONAL', ruleLevel: 'HARD',
        source: doctrine('profils/salle-eau-wc-integre.md §4', 'Le minimum de 0,70 m tient compte de l’entrée et de la sortie latérales de la baignoire.'), scope: scope(BATH, ['bain'])
      },
      {
        id: 'VAL-BATH-TUB-CLEARANCE-TARGET-001', version: '1.0.0', label: 'Dégagement cible devant la baignoire',
        quantity: 'length', value: 0.8, unit: 'm', status: 'ADOPTED', ruleLevel: 'GUIDELINE',
        source: doctrine('profils/salle-eau-wc-integre.md §4', 'La cible de 0,80 m décrit le cas moyen.'), scope: scope(BATH, ['bain'])
      },
      {
        id: 'VAL-BATH-TUB-CLEARANCE-COMFORT-001', version: '1.0.0', label: 'Dégagement confortable devant la baignoire',
        quantity: 'length', value: 1, unit: 'm', status: 'ADOPTED', ruleLevel: 'PREFERENCE',
        source: doctrine('profils/salle-eau-wc-integre.md §4', 'Un mètre est réservé au confort et au classement des grandes versions.'), scope: scope(BATH, ['bain'])
      },
      {
        id: 'VAL-BATH-WASHBASIN-FOOTPRINT-001', version: '1.0.0',
        label: 'Emprise du lavabo simple', quantity: 'dimensions-2d',
        value: { width: 0.6, depth: 0.5 }, unit: 'm', status: 'PROVISIONAL', ruleLevel: 'HARD',
        source: doctrine('assets/socle.data.js — washbasin.footprint', 'Cette emprise est la valeur active du socle et reste une convention de projet faute de source vérifiée.'),
        scope: scope(BATH)
      },
      {
        id: 'VAL-BATH-WASHBASIN-CLEARANCE-MIN-001', version: '2.0.0',
        label: 'Dégagement minimal devant le lavabo', quantity: 'length', value: 0.7, unit: 'm',
        status: 'ADOPTED', ruleLevel: 'HARD',
        source: doctrine('profils/salle-eau-wc-integre.md §4', 'Le minimum projet de 0,70 m gouverne la faisabilité ; 0,80 m devient explicitement la cible.'),
        scope: scope(BATH)
      },
      {
        id: 'VAL-BATH-WASHBASIN-CLEARANCE-TARGET-001', version: '1.0.0',
        label: 'Dégagement cible devant le lavabo', quantity: 'length', value: 0.8, unit: 'm',
        status: 'ADOPTED', ruleLevel: 'GUIDELINE',
        source: doctrine('profils/salle-eau-wc-integre.md §4', 'La cible de 0,80 m distingue le cas courant du minimum de 0,70 m.'), scope: scope(BATH)
      },
      {
        id: 'VAL-EQ-033', version: '1.0.0', label: 'Dégagement confortable devant le lavabo',
        quantity: 'length', value: 1.1, unit: 'm', status: 'ADOPTED', ruleLevel: 'GUIDELINE',
        source: compilation('§4 — Salle d’eau'), scope: scope(BATH)
      },
      {
        id: 'VAL-BATH-TOWEL-RAIL-FOOTPRINT-001', version: '1.0.0',
        label: 'Emprise du sèche-serviettes', quantity: 'dimensions-2d',
        value: { width: 0.6, depth: 0.15 }, unit: 'm', status: 'PROVISIONAL', ruleLevel: 'HARD',
        source: doctrine('assets/socle.data.js — towel_rail.footprint', 'L’emprise est celle du composant optionnel actif ; elle reste une valeur par défaut modifiable, non une norme.'),
        scope: scope(BATH)
      },
      {
        id: 'VAL-LIVING-PROGRAM-AREA-MIN-001', version: '1.0.0', label: 'Surface minimale de programme du séjour',
        quantity: 'area', value: 20, unit: 'm2', status: 'ADOPTED', ruleLevel: 'HARD',
        source: doctrine('profils/sejour.md §5', 'Le séjour minimal doit accueillir le groupe canapé-table basse, ses usages et une traversée sans être réduit à la seule emprise meublable.'), scope: scope(['LIVING'])
      },
      {
        id: 'VAL-LIVING-PROGRAM-SIDE-MIN-001', version: '1.0.0', label: 'Côté court minimal du séjour',
        quantity: 'length', value: 3, unit: 'm', status: 'ADOPTED', ruleLevel: 'HARD',
        source: doctrine('profils/sejour.md §5', 'Trois mètres empêchent qu’une surface suffisante soit obtenue par un séjour-couloir impropre à la conversation et à la traversée.'), scope: scope(['LIVING'])
      },
      {
        id: 'VAL-LIVING-PROGRAM-AREA-TARGET-001', version: '1.0.0', label: 'Surface cible de confort du séjour',
        quantity: 'area', value: 24, unit: 'm2', status: 'PROVISIONAL', ruleLevel: 'GUIDELINE',
        source: doctrine('profils/sejour.md §5', 'La cible historique de 24 m² est conservée comme préférence nommée, jamais comme minimum silencieux ; son étalonnage reste à instruire.'), scope: scope(['LIVING'])
      },
      {
        id: 'VAL-LIVING-ACCESS-CLEARANCE-MIN-001', version: '1.0.0', label: 'Largeur minimale de traversée du séjour',
        quantity: 'length', value: 0.7, unit: 'm', status: 'ADOPTED', ruleLevel: 'HARD',
        source: doctrine('profils/sejour.md §4', 'Le séjour distribue fréquemment plusieurs pièces : une continuité de 0,70 m doit relier ses accès et ses usages requis.'), scope: scope(['LIVING'])
      },
      {
        id: 'VAL-LIVING-FURNITURE-RATIO-MAX-001', version: '1.0.0', label: 'Occupation maximale du séjour par les emprises de mobilier',
        quantity: 'ratio', value: 0.5, unit: 'ratio', status: 'PROVISIONAL', ruleLevel: 'GUIDELINE',
        source: doctrine('profils/sejour.md §8', 'Au-delà de la moitié de la zone de séjour occupée par les seules emprises, le vide d’usage et de traversée devient résiduel ; la limite reste souple et attend l’étalonnage corpus.'), scope: scope(['LIVING'])
      },
      {
        id: 'VAL-LIVING-SOFA-FOOTPRINT-001', version: '1.0.0', label: 'Emprise du canapé minimal', quantity: 'dimensions-2d',
        value: { width: 1.8, depth: 0.9 }, unit: 'm', status: 'PROVISIONAL', ruleLevel: 'HARD',
        source: doctrine('profils/sejour.md §3', 'L’emprise active constitue le canapé deux places minimal du programme ; elle reste modifiable faute de source produit consolidée.'), scope: scope(['LIVING'])
      },
      {
        id: 'VAL-LIVING-SOFA-CLEARANCE-MIN-001', version: '1.0.0', label: 'Dégagement minimal devant le canapé', quantity: 'length', value: 0.5, unit: 'm', status: 'PROVISIONAL', ruleLevel: 'HARD',
        source: doctrine('profils/sejour.md §4', 'Cinquante centimètres permettent l’usage immédiat de l’assise et concordent avec l’écart minimal à la table basse.'), scope: scope(['LIVING'])
      },
      {
        id: 'VAL-LIVING-SOFA-CLEARANCE-TARGET-001', version: '1.0.0', label: 'Dégagement cible devant le canapé', quantity: 'length', value: 0.5, unit: 'm', status: 'PROVISIONAL', ruleLevel: 'GUIDELINE', source: doctrine('profils/sejour.md §4', 'La cible reste égale au minimum tant qu’aucune mesure plus fine ne justifie de les séparer.'), scope: scope(['LIVING'])
      },
      {
        id: 'VAL-LIVING-SOFA-CLEARANCE-COMFORT-001', version: '1.0.0', label: 'Dégagement confortable devant le canapé', quantity: 'length', value: 0.6, unit: 'm', status: 'PROVISIONAL', ruleLevel: 'PREFERENCE', source: doctrine('profils/sejour.md §4', 'Dix centimètres supplémentaires départagent les poses sans durcir leur faisabilité.'), scope: scope(['LIVING'])
      },
      {
        id: 'VAL-LIVING-COFFEE-TABLE-FOOTPRINT-001', version: '1.0.0', label: 'Emprise de la table basse', quantity: 'dimensions-2d', value: { width: 1.1, depth: 0.6 }, unit: 'm', status: 'PROVISIONAL', ruleLevel: 'HARD', source: doctrine('profils/sejour.md §3', 'L’emprise active représente une table basse courante mais reste provisoire faute de gamme produit consolidée.'), scope: scope(['LIVING'])
      },
      {
        id: 'VAL-LIVING-COFFEE-TABLE-CLEARANCE-MIN-001', version: '1.0.0', label: 'Dégagement minimal sur la face d’usage de la table basse', quantity: 'length', value: 0.45, unit: 'm', status: 'PROVISIONAL', ruleLevel: 'HARD', source: doctrine('profils/sejour.md §4', 'Une face d’usage suffit à atteindre le meuble bas ; quatre bandes autour simuleraient à tort quatre circulations principales.'), scope: scope(['LIVING'])
      },
      {
        id: 'VAL-LIVING-COFFEE-TABLE-CLEARANCE-TARGET-001', version: '1.0.0', label: 'Dégagement cible sur la face d’usage de la table basse', quantity: 'length', value: 0.5, unit: 'm', status: 'PROVISIONAL', ruleLevel: 'GUIDELINE', source: doctrine('profils/sejour.md §4', 'La cible qualifie l’usage courant sans devenir une condition de faisabilité.'), scope: scope(['LIVING'])
      },
      {
        id: 'VAL-LIVING-COFFEE-TABLE-CLEARANCE-COMFORT-001', version: '1.0.0', label: 'Dégagement confortable sur la face d’usage de la table basse', quantity: 'length', value: 0.6, unit: 'm', status: 'PROVISIONAL', ruleLevel: 'PREFERENCE', source: doctrine('profils/sejour.md §4', 'Le confort de 0,60 m sert uniquement au classement des poses.'), scope: scope(['LIVING'])
      },
      {
        id: 'VAL-LIVING-TABLE-GAP-MIN-001', version: '1.0.0', label: 'Écart minimal canapé-table basse', quantity: 'length', value: 0.45, unit: 'm', status: 'PROVISIONAL', ruleLevel: 'GUIDELINE', source: doctrine('profils/sejour.md §7', 'La zone d’usage de la table protège déjà ce recul au verdict HARD ; la relation nommée sert au classement du groupe.'), scope: scope(['LIVING'])
      },
      {
        id: 'VAL-LIVING-TABLE-GAP-MAX-001', version: '1.0.0', label: 'Écart maximal canapé-table basse', quantity: 'length', value: 0.65, unit: 'm', status: 'PROVISIONAL', ruleLevel: 'GUIDELINE', source: doctrine('profils/sejour.md §7', 'Au-delà de 0,65 m, la table basse cesse d’être naturellement à portée ; cette convention classe les poses sans invalider une pièce autrement utilisable.'), scope: scope(['LIVING'])
      },
      {
        id: 'VAL-LIVING-MEDIA-ACTIVATION-AREA-001', version: '1.0.0', label: 'Surface d’activation du meuble média', quantity: 'area', value: 22, unit: 'm2', status: 'PROVISIONAL', ruleLevel: 'GUIDELINE', source: doctrine('profils/sejour.md §3', 'Le média reste une fonction optionnelle activée seulement après le séjour minimal.'), scope: scope(['LIVING'])
      },
      {
        id: 'VAL-LIVING-TV-FOOTPRINT-001', version: '1.0.0', label: 'Emprise du meuble média', quantity: 'dimensions-2d', value: { width: 1.2, depth: 0.4 }, unit: 'm', status: 'PROVISIONAL', ruleLevel: 'HARD', source: doctrine('profils/sejour.md §3', 'L’emprise active attend une gamme produit consolidée.'), scope: scope(['LIVING'])
      },
      {
        id: 'VAL-LIVING-TV-CLEARANCE-MIN-001', version: '1.0.0', label: 'Dégagement minimal devant le meuble média', quantity: 'length', value: 0.6, unit: 'm', status: 'PROVISIONAL', ruleLevel: 'HARD', source: doctrine('profils/sejour.md §4', 'Le dégagement protège l’accès au meuble optionnel sans fixer une distance de visionnage non sourcée.'), scope: scope(['LIVING'])
      },
      {
        id: 'VAL-LIVING-ARMCHAIR-ACTIVATION-AREA-001', version: '1.0.0', label: 'Surface d’activation du fauteuil', quantity: 'area', value: 22, unit: 'm2', status: 'PROVISIONAL', ruleLevel: 'GUIDELINE', source: doctrine('profils/sejour.md §3', 'Le fauteuil rend testable une relation de conversation sans appartenir au programme minimal.'), scope: scope(['LIVING'])
      },
      {
        id: 'VAL-LIVING-ARMCHAIR-FOOTPRINT-001', version: '1.0.0', label: 'Emprise du fauteuil', quantity: 'dimensions-2d', value: { width: 0.9, depth: 0.85 }, unit: 'm', status: 'PROVISIONAL', ruleLevel: 'HARD', source: doctrine('profils/sejour.md §3', 'L’emprise est une hypothèse de projet explicite en attente de gamme produit.'), scope: scope(['LIVING'])
      },
      {
        id: 'VAL-LIVING-CONVERSATION-MIN-001', version: '1.0.0', label: 'Distance minimale de conversation entre assises', quantity: 'length', value: 1, unit: 'm', status: 'PROVISIONAL', ruleLevel: 'GUIDELINE', source: doctrine('profils/sejour.md §7', 'La borne évite que deux assises distinctes se tassent en un seul obstacle.'), scope: scope(['LIVING'])
      },
      {
        id: 'VAL-LIVING-CONVERSATION-TARGET-001', version: '1.0.0', label: 'Distance cible de conversation entre assises', quantity: 'length', value: 1.8, unit: 'm', status: 'PROVISIONAL', ruleLevel: 'GUIDELINE', source: doctrine('profils/sejour.md §7', 'La cible organise le classement à l’intérieur de la plage admissible.'), scope: scope(['LIVING'])
      },
      {
        id: 'VAL-LIVING-CONVERSATION-MAX-001', version: '1.0.0', label: 'Distance maximale de conversation entre assises', quantity: 'length', value: 3, unit: 'm', status: 'PROVISIONAL', ruleLevel: 'GUIDELINE', source: doctrine('profils/sejour.md §7', 'Au-delà de trois mètres, les assises ne composent plus un groupe de conversation crédible.'), scope: scope(['LIVING'])
      },
      {
        id: 'VAL-OFFICE-PROGRAM-AREA-MIN-COMPACT-001', version: '1.0.0', label: 'Surface minimale du bureau compact', quantity: 'area', value: 5, unit: 'm2', status: 'PROVISIONAL', ruleLevel: 'HARD', source: doctrine('profils/bureau.md §5', 'Le plancher compact est dérivé du poste minimal et de son recul, puis arrondi pour préserver une circulation d’accès ; il ne promet aucune convertibilité en chambre.'), scope: scope(OFFICE, ['compact'])
      },
      {
        id: 'VAL-OFFICE-PROGRAM-SIDE-MIN-COMPACT-001', version: '1.0.0', label: 'Côté court minimal du bureau compact', quantity: 'length', value: 1.8, unit: 'm', status: 'PROVISIONAL', ruleLevel: 'HARD', source: doctrine('profils/bureau.md §5', 'Un côté court de 1,80 m reçoit la profondeur de plateau de 0,60 m et le recul d’usage de 0,90 m sans réduire le local à cette seule bande.'), scope: scope(OFFICE, ['compact'])
      },
      {
        id: 'VAL-OFFICE-PROGRAM-AREA-MIN-CONVERTIBLE-001', version: '1.0.0', label: 'Surface minimale du bureau convertible', quantity: 'area', value: 9, unit: 'm2', status: 'PROVISIONAL', ruleLevel: 'HARD', source: doctrine('profils/bureau.md §5', 'La variante convertible reprend explicitement le plancher de la chambre enfant ; ce nombre qualifie la convertibilité et non le seul travail au bureau.'), scope: scope(OFFICE, ['convertible'])
      },
      {
        id: 'VAL-OFFICE-PROGRAM-SIDE-MIN-CONVERTIBLE-001', version: '1.0.0', label: 'Côté court minimal du bureau convertible', quantity: 'length', value: 2.5, unit: 'm', status: 'PROVISIONAL', ruleLevel: 'HARD', source: doctrine('profils/bureau.md §5', 'La variante convertible reprend le côté court minimal de la chambre enfant afin de ne pas revendiquer une future chambre sur la seule surface.'), scope: scope(OFFICE, ['convertible'])
      },
      {
        id: 'VAL-OFFICE-DESK-FOOTPRINT-001', version: '1.0.0', label: 'Emprise du plateau de bureau compact', quantity: 'dimensions-2d', value: { width: 1.2, depth: 0.6 }, unit: 'm', status: 'PROVISIONAL', ruleLevel: 'HARD', source: professional('Compilation de catalogues de mobilier de bureau', 'DATASOURCE_EQUIPEMENTS.md — desk/office'), scope: scope(OFFICE)
      },
      {
        id: 'VAL-OFFICE-CHAIR-FOOTPRINT-001', version: '1.0.0', label: 'Emprise de la chaise de bureau', quantity: 'dimensions-2d', value: { width: 0.5, depth: 0.5 }, unit: 'm', status: 'PROVISIONAL', ruleLevel: 'HARD', source: doctrine('profils/bureau.md §3', 'L’emprise rectangulaire rend la chaise visible et distincte du recul nécessaire pour la déplacer.'), scope: scope(OFFICE)
      },
      {
        id: 'VAL-OFFICE-CHAIR-CLEARANCE-BACK-MIN-001', version: '1.0.0', label: 'Recul minimal derrière la chaise de bureau', quantity: 'length', value: 0.6, unit: 'm', status: 'PROVISIONAL', ruleLevel: 'HARD', source: doctrine('profils/bureau.md §4', 'La chaise possède sa propre emprise ; soixante centimètres derrière elle protègent le retrait minimal et la circulation immédiate.'), scope: scope(OFFICE)
      },
      {
        id: 'VAL-OFFICE-CHAIR-CLEARANCE-BACK-TARGET-001', version: '1.0.0', label: 'Recul cible derrière la chaise de bureau', quantity: 'length', value: 0.8, unit: 'm', status: 'PROVISIONAL', ruleLevel: 'GUIDELINE', source: doctrine('profils/bureau.md §4', 'La cible permet de reculer le siège sans rendre ce confort obligatoire à la faisabilité.'), scope: scope(OFFICE)
      },
      {
        id: 'VAL-OFFICE-CHAIR-CLEARANCE-BACK-COMFORT-001', version: '1.0.0', label: 'Recul confortable derrière la chaise de bureau', quantity: 'length', value: 0.9, unit: 'm', status: 'PROVISIONAL', ruleLevel: 'PREFERENCE', source: doctrine('profils/bureau.md §4', 'La borne de confort rejoint le recul historique du poste complet et sert uniquement au classement.'), scope: scope(OFFICE)
      },
      {
        id: 'VAL-OFFICE-BOOKCASE-ACTIVATION-AREA-001', version: '1.0.0', label: 'Surface d’activation de la bibliothèque du bureau', quantity: 'area', value: 7, unit: 'm2', status: 'PROVISIONAL', ruleLevel: 'GUIDELINE', source: doctrine('profils/bureau.md §2', 'La bibliothèque complète le poste à partir du cas moyen ; elle reste optionnelle et peut être retirée par repli.'), scope: scope(OFFICE)
      },
      {
        id: 'VAL-OFFICE-BOOKCASE-FOOTPRINT-001', version: '1.0.0', label: 'Emprise de la bibliothèque du bureau', quantity: 'dimensions-2d', value: { width: 1.2, depth: 0.35 }, unit: 'm', status: 'PROVISIONAL', ruleLevel: 'HARD', source: professional('Compilation de catalogues de rangement', 'DATASOURCE_EQUIPEMENTS.md — bureau/bookcase'), scope: scope(OFFICE)
      },
      {
        id: 'VAL-OFFICE-BOOKCASE-PASSAGE-MIN-001', version: '1.0.0', label: 'Passage minimal devant la bibliothèque', quantity: 'length', value: 0.6, unit: 'm', status: 'PROVISIONAL', ruleLevel: 'HARD', source: doctrine('profils/bureau.md §4', 'La valeur représente le passage nécessaire devant le rangement ouvert ; le modèle courant l’exprime encore comme zone frontale.'), scope: scope(OFFICE)
      }
    ]
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
