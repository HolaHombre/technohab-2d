(function (root) {
  'use strict';

  // Registre du mobilier — l'inventaire complet des équipements qu'un plan de
  // logement peut porter, ce que le moteur en couvre et ce qui lui manque.
  //
  // Il ne pilote RIEN : ni le socle, ni le générateur, ni le placement ne le
  // lisent. Seule la page « Équipements & pièces » le consomme, pour rendre le
  // progrès visible. Ajouter une ligne ici ne change aucun verdict de plan.
  //
  // Provenance : croisement de REF-1, voir DIFFERENTIEL_MEUBLES.md. La
  // nomenclature est la nôtre — des noms d'objets courants regroupés par
  // type ; aucune cote, aucune image et aucun identifiant de l'étalon n'entre
  // ici (AUDIT_REFERENTIEL_EXTERNE.md §3). Une cote absente se lit « à sourcer »,
  // jamais « inconnue de nous » : c'est un travail ouvert, pas un oubli.
  //
  // Champs d'une entrée
  //   id         identifiant stable du registre
  //   label      nom courant, éventuellement les variantes entre parenthèses
  //   rubriques  où l'équipement se range dans les vues (voir RUBRIQUES)
  //   statut     couverture du moteur (voir STATUTS)
  //   moteur     identifiant(s) du socle qui portent l'équipement. La cote et
  //              la zone d'usage affichées en sont LUES à l'exécution : le
  //              registre ne les redouble pas.
  //   dims       { w, d, niveau } seulement pour un équipement absent du socle
  //              dont la doctrine chiffre déjà l'emprise (niveau N3).
  //   zone       'portee' | 'specifiee' | 'absente' | 'sans-objet'. Ne se
  //              renseigne que si elle ne se lit pas du socle : un équipement
  //              du socle a une zone dès qu'il déclare un `usage`.
  //   icone      symbole `furn-<icone>` à montrer quand le socle n'en porte pas
  //              (dessin ArchLang, voir icon-provenance.data.js).
  //   note       ce qui reste à faire, ou le motif de l'écart.

  var RUBRIQUES = [
    { id: 'bureau', label: 'Bureau' },
    { id: 'chambre', label: 'Chambre' },
    { id: 'cuisine', label: 'Cuisine' },
    { id: 'repas', label: 'Salle à manger' },
    { id: 'salon', label: 'Salon' },
    { id: 'bain', label: 'Salle de bain / WC' },
    { id: 'autres', label: 'Technique & collectif' }
  ];

  // Ordre = avancement décroissant.
  //   implemente  un équipement du socle porte l'objet
  //   partiel     l'équipement existe, pas la variante (forme, gamme, ancrage)
  //   doctrine    spécifié et coté dans profils/, pas au socle
  //   manquant    ni équipement, ni doctrine
  //   ecarte      regardé et écarté par la gate de REF-1 — le motif est écrit
  var STATUTS = [
    { id: 'implemente', label: 'Implémenté', court: 'Couvert' },
    { id: 'partiel', label: 'Partiel', court: 'Partiel' },
    { id: 'doctrine', label: 'Spécifié, non activé', court: 'Spécifié' },
    { id: 'manquant', label: 'Manquant', court: 'Manquant' },
    { id: 'ecarte', label: 'Écarté', court: 'Écarté' }
  ];

  var B = 'bureau', C = 'chambre', K = 'cuisine', R = 'repas', S = 'salon', W = 'bain', A = 'autres';

  function e(id, label, rubriques, statut, extra) {
    var entree = { id: id, label: label, rubriques: rubriques, statut: statut };
    Object.keys(extra || {}).forEach(function (key) { entree[key] = extra[key]; });
    return entree;
  }

  var ENTREES = [
    // --- Couchage -----------------------------------------------------------
    e('lit-simple', 'Lit simple', [C], 'implemente', { moteur: ['bed_90'] }),
    e('lit-double', 'Lit double (140, 160, 180)', [C], 'implemente', { moteur: ['bed_140'] }),
    e('lit-enfant', 'Lit d’enfant', [C], 'manquant', { zone: 'absente', note: 'La chambre d’enfant n’a que le lit simple ; candidat à la gate (plancher de meublabilité).', icone: 'child_bed' }),
    e('lit-bebe', 'Lit de bébé', [C], 'manquant', { zone: 'absente', note: 'Sans plancher propre ; consigné.', icone: 'crib' }),
    e('lit-superpose', 'Lit superposé', [C], 'manquant', { zone: 'absente', note: 'Candidat à la gate, avec le lit d’enfant.', icone: 'bunk_bed' }),
    e('table-langer', 'Table à langer', [C, W], 'manquant', { zone: 'absente', note: 'Usage temporaire, sans plancher propre ; consigné.' }),

    // --- Rangement ----------------------------------------------------------
    e('armoire-penderie', 'Armoire, penderie', [C, R], 'implemente', { moteur: ['wardrobe'], note: 'Gamme de longueurs décrite en doctrine, non livrée.' }),
    e('armoire-portes', 'Armoire à portes (battantes, coulissantes, pliantes, rideau)', [B], 'partiel', { moteur: ['wardrobe'], note: 'Le mode d’ouverture n’est pas distingué.' }),
    e('commode', 'Commode', [C], 'doctrine', { dims: { w: 0.80, d: 0.50, niveau: 'N3' }, zone: 'absente', note: 'Cotée et non activée (équipement lié). Aucun dégagement écrit.', icone: 'dresser' }),
    e('chevet', 'Table de chevet', [C], 'doctrine', { dims: { w: 0.40, d: 0.35, niveau: 'N3' }, zone: 'absente', note: 'Une par dormeur, donc équipement lié. Sa place dans la zone longitudinale du lit reste une question ouverte.', icone: 'nightstand' }),
    e('coiffeuse', 'Coiffeuse', [C], 'manquant', { zone: 'absente', note: 'Optionnelle, hors programme minimal ; consignée.', icone: 'vanity' }),
    e('bibliotheque', 'Bibliothèque', [B, C, R, S], 'implemente', { moteur: ['bookcase'], note: 'Activée en bureau dès 7 m² ; proposée, non activée au séjour.' }),
    e('etagere', 'Étagère redimensionnable', [B, C, K, R, S], 'partiel', { moteur: ['bookcase', 'shelving'], note: 'La longueur libre n’est pas paramétrée.' }),
    e('buffet', 'Buffet', [R, S], 'implemente', { moteur: ['sideboard'] }),
    e('meuble-rangement-sdb', 'Meuble de rangement de salle d’eau (colonne, tiroirs)', [W], 'doctrine', { zone: 'absente', note: 'profils/salle-eau.md : rangement absent du socle. Cote à sourcer.' }),
    e('caisson', 'Caisson à tiroirs', [B], 'ecarte', { note: 'Mobilier tertiaire.' }),
    e('placard-entree', 'Placard d’entrée', [A], 'implemente', { moteur: ['closet'], note: 'Propre au moteur : absent du sous-menu de mobilier de l’étalon.' }),
    e('etageres-cellier', 'Étagères de cellier', [A], 'implemente', { moteur: ['shelving'], note: 'Propre au moteur.' }),

    // --- Assise et média ----------------------------------------------------
    e('canape', 'Canapé (2 et 3 places)', [B, S], 'implemente', { moteur: ['sofa'] }),
    e('canape-angle', 'Canapé d’angle', [S], 'implemente', { moteur: ['sofa'], note: 'Dès 30 m² ; la latéralité (droit, gauche) n’est pas distinguée.' }),
    e('canape-meridienne', 'Canapé avec méridienne, canapé modulable', [S], 'partiel', { moteur: ['sofa'], note: 'Au-delà de la gamme d’angle.' }),
    e('banquette-convertible', 'Banquette convertible', [S], 'partiel', { moteur: ['sofa'], note: 'Le couchage d’appoint et son déploiement ne sont pas modélisés.' }),
    e('fauteuil', 'Fauteuil (club, crapaud, rond)', [B, C, S], 'implemente', { moteur: ['armchair'], note: 'Seul équipement de séjour sans zone d’usage.' }),
    e('siege-bureau', 'Chaise et fauteuil de bureau', [B], 'implemente', { moteur: ['office_chair'] }),
    e('chaise-table', 'Chaise de table', [B, K, R], 'implemente', { moteur: ['dining_table_2', 'dining_table_4'], zone: 'portee', note: 'Portée par l’équipement table : les assises sont dessinées avec le symbole ArchLang et leur recul vit dans la zone `front` ou `around` de la table.' }),
    e('chaise-bar', 'Chaise de bar', [K, S], 'ecarte', { note: 'Idem : déjà portée par la zone d’usage.' }),
    e('tabouret', 'Tabouret (carré, rond)', [K], 'ecarte', { note: 'Idem.' }),
    e('fauteuil-roulant', 'Fauteuil roulant', [B, C, S, W], 'ecarte', { note: 'Porté par l’aire de rotation Ø 1,50 m, pas par un meuble.' }),
    e('table-basse', 'Table basse', [B, S], 'implemente', { moteur: ['coffee_table'], note: 'Zone déclarée, non bloquante par choix.' }),
    e('meuble-tv', 'Téléviseur avec meuble bas', [C, R, S], 'implemente', { moteur: ['tv_unit'], note: 'Dès 22 m².' }),
    e('televiseur', 'Téléviseur', [C, K, R, S], 'ecarte', { note: 'Décor sans verdict.' }),
    e('tapis', 'Tapis', [B, R, S], 'ecarte', { note: 'Décor sans verdict.' }),
    e('piano', 'Piano, clavier', [C, S], 'ecarte', { note: 'Décor sans verdict.' }),
    e('billard', 'Billard', [B, R, S], 'ecarte', { note: 'Décor sans verdict.' }),
    e('plante', 'Plante', [B], 'ecarte', { note: 'Décor sans verdict.' }),

    // --- Repas --------------------------------------------------------------
    e('table-repas', 'Table de repas 2 à 4 places (carrée, rectangulaire, ronde)', [K, R, S], 'implemente', { moteur: ['dining_table_2', 'dining_table_4'], note: 'Le recul de chaise est porté par la zone d’usage, non cuit dans l’emprise.' }),
    e('table-repas-fauteuils', 'Table 2 places avec fauteuils', [C, S], 'partiel', { moteur: ['dining_table_2'], note: 'Les assises confortables ne sont pas modélisées.' }),
    e('table-repas-6', 'Table de repas 6 places et plus', [K, R], 'doctrine', { zone: 'specifiee', dims: { w: 1.80, d: 0.90, niveau: 'N3' }, note: 'profils/sejour.md §3 : non sourcée, non activée. La zone `around` est celle de la table de 4 ; à étendre avec l’emprise.', icone: 'dining_table_6' }),
    e('ilot', 'Îlot central', [K], 'doctrine', { zone: 'specifiee', note: 'Dégagement de 1,20 m des deux côtés spécifié en doctrine ; équipement lié.', icone: 'island' }),
    e('bar', 'Bar, comptoir', [K, R, S], 'ecarte', { note: 'Décor, compté par la zone d’usage.' }),

    // --- Bureau -------------------------------------------------------------
    e('bureau', 'Bureau (droit, rectangulaire, table de bureau)', [B, C], 'implemente', { moteur: ['desk'], zone: 'portee', note: 'Le recul est porté par la chaise (`SHARED_USAGE_ZONE`).' }),
    e('bureau-angle', 'Bureau d’angle', [B, C], 'partiel', { moteur: ['desk'], zone: 'portee', note: 'L’ancrage d’angle n’existe pas pour `desk`.' }),
    e('ordinateur', 'Ordinateur, ordinateur portable', [B, S], 'ecarte', { note: 'Usage non contraignant.' }),
    e('imprimante', 'Imprimante', [B], 'ecarte', { note: 'Usage non contraignant.' }),
    e('videoprojecteur', 'Vidéoprojecteur', [B, S], 'ecarte', { note: 'Usage non contraignant.' }),
    e('table-reunion', 'Table de réunion', [B], 'ecarte', { note: 'Mobilier tertiaire : logement, pas bureau d’entreprise.' }),

    // --- Cuisine ------------------------------------------------------------
    e('evier', 'Évier (1 ou 2 bacs, avec meuble, vasque)', [K], 'implemente', { moteur: ['sink'], note: 'Les bacs multiples ne sont pas dans la gamme.' }),
    e('plaque', 'Plaque de cuisson (gaz, induction, électrique)', [K], 'implemente', { moteur: ['hob'], note: 'La plaque à 2 foyers, plus étroite, n’est pas dans la gamme.' }),
    e('piano-cuisson', 'Piano de cuisson', [K], 'partiel', { moteur: ['hob'], note: 'Plus large que la plaque ; hors gamme.' }),
    e('four', 'Four', [K], 'ecarte', { note: 'Intégré sous le plan : aucune emprise propre.' }),
    e('micro-ondes', 'Four micro-ondes', [K], 'ecarte', { note: 'Posé sur le plan.' }),
    e('hotte', 'Hotte (murale, îlot)', [K], 'ecarte', { note: 'Superposée à la cuisson.' }),
    e('refrigerateur', 'Réfrigérateur (simple, combiné, américain)', [K], 'implemente', { moteur: ['fridge'], note: 'Le modèle américain, plus large, est hors gamme.' }),
    e('congelateur', 'Congélateur (armoire, coffre)', [K], 'ecarte', { note: 'Aucune emprise décisive.' }),
    e('lave-vaisselle', 'Lave-vaisselle', [K], 'implemente', { moteur: ['dishwasher'], note: 'Dès 9 m².' }),
    e('meuble-bas-cuisine', 'Meuble bas de cuisine (portes, tiroirs, angle)', [K], 'implemente', { moteur: ['worktop'], note: 'Linéaire générique ; les modules d’angle ne sont pas distingués.' }),
    e('plan-travail', 'Plan de travail (droit, sifflet, chaussette, bout arrondi)', [K, W], 'implemente', { moteur: ['worktop'], note: 'Les formes ne sont pas distinguées.' }),
    e('colonne-cuisine', 'Colonne de cuisine', [K], 'partiel', { moteur: ['worktop'], note: 'Module au sol couvert par le linéaire générique.' }),
    e('meuble-haut', 'Meuble haut de cuisine', [K], 'ecarte', { note: 'Aucune emprise au sol.' }),
    e('kitchenette', 'Kitchenette compacte', [K], 'partiel', { moteur: ['sink', 'hob', 'fridge'], note: 'Bloc composite : ses trois fonctions sont couvertes une à une.' }),
    e('poubelle', 'Poubelle', [B, K, W, C, S], 'ecarte', { note: 'Usage non contraignant.' }),
    e('vmc-bouche', 'Bouche d’extraction VMC', [K], 'ecarte', { note: 'Hors domaine : réseaux.' }),

    // --- Salle de bain et WC -----------------------------------------------
    e('baignoire', 'Baignoire rectangulaire', [W], 'implemente', { moteur: ['bathtub'] }),
    e('baignoire-forme', 'Baignoire d’angle, îlot, balnéo', [W], 'partiel', { moteur: ['bathtub'], note: 'Ancrage `corner` ou `free` et emprise absents.' }),
    e('spa', 'Spa', [W], 'ecarte', { note: 'Équipement de loisir hors programme.' }),
    e('douche', 'Douche (cabine, receveur carré, extra-plat)', [W], 'partiel', { moteur: ['shower'], note: 'Douche 0,90 × 0,90 seule ; pas de gamme.' }),
    e('douche-quart', 'Douche quart de cercle', [W], 'partiel', { moteur: ['shower'], note: 'Forme non modélisée.' }),
    e('lavabo', 'Lavabo', [W], 'implemente', { moteur: ['washbasin'] }),
    e('meuble-vasque', 'Meuble vasque (simple, double)', [W], 'partiel', { moteur: ['washbasin'], note: 'La double vasque est une gamme du lavabo, absente.' }),
    e('lave-mains', 'Lave-mains (dont d’angle)', [W], 'implemente', { moteur: ['handbasin'] }),
    e('wc', 'WC (standard, suspendu, petite taille)', [W], 'implemente', { moteur: ['wc_pan'] }),
    e('wc-angle', 'WC d’angle', [W], 'partiel', { moteur: ['wc_pan'], note: 'L’ancrage d’angle n’existe pas pour la cuvette.' }),
    e('bidet', 'Bidet', [W], 'manquant', { zone: 'absente', note: 'Optionnel, dans aucun profil ; consigné.', icone: 'bidet' }),
    e('urinoir', 'Urinoir', [W], 'ecarte', { note: 'Sanitaire collectif.' }),
    e('seche-serviettes', 'Sèche-serviettes', [W], 'implemente', { moteur: ['towel_rail'], note: 'Mural et peu profond : l’absence de zone est sans conséquence.' }),
    e('robinetterie', 'Robinetterie de douche ou de bain', [W], 'ecarte', { note: 'Accessoire sans emprise.' }),
    e('chauffe-eau', 'Chauffe-eau', [K, W], 'implemente', { moteur: ['water_heater'] }),
    e('lave-linge', 'Lave-linge (hublot, ouverture dessus)', [K, W], 'implemente', { moteur: ['washer'] }),
    e('seche-linge', 'Sèche-linge', [K], 'implemente', { moteur: ['dryer'] }),

    // --- Technique et collectif --------------------------------------------
    e('tableau-electrique', 'Tableau électrique', [A], 'implemente', { moteur: ['electrical_panel'], note: 'Propre au moteur.' }),
    e('place-vehicule', 'Emplacement de véhicule', [A], 'implemente', { moteur: ['parking_space'], note: 'Propre au moteur.' }),
    e('ascenseur', 'Ascenseur', [A], 'ecarte', { note: 'Équipement de bâtiment collectif.' }),
    e('table-collective', 'Tables et rangées de sièges de salle collective', [A], 'ecarte', { note: 'Plan de table événementiel, hors logement.' })
  ];

  root.TechnoHabCatalogue = {
    rubriques: RUBRIQUES,
    statuts: STATUTS,
    entrees: ENTREES
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
