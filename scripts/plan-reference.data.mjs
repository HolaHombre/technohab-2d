// Chantier 6 §6.3 — plan de référence dessiné à la main.
//
// Un T3 de 75 m², cuisine ouverte, WC séparé : c'est la configuration
// `[75, 2, 1, false, true, 'compact']` du banc, choisie parce qu'elle est au
// milieu de la série et qu'elle sature à 64 % — assez contrainte pour que le
// dessin demande des arbitrages, assez large pour qu'il en existe de bons.
//
// Le plan n'est pas produit par le moteur et ne cherche pas à l'imiter. Il
// applique ce qu'un plan de promoteur applique : zone jour à l'ouest, zone
// nuit à l'est, dégagement court entre les deux, pièces humides regroupées
// contre une même gaine, placard toute largeur dans chaque chambre.
//
// AUCUNE cote n'a été ajustée après un passage dans le banc. C'est la
// condition du test : un plan retouché jusqu'à ce qu'il passe ne mesure plus
// les critères, il mesure la patience de qui l'a dessiné. Les cotes sont
// datées du dessin, avant la première évaluation.
//
// Les cotes ci-dessous sont celles de la partition, axes de cloisons compris.
// Depuis le chantier des murs épais, `finaliserPlan()` applique une homothétie
// pour que la surface *habitable* vaille les 75 m² demandés : le plan servi au
// banc est donc un peu plus grand que le dessin — 10,17 × 7,63 m au lieu de
// 10,00 × 7,50. Ce n'est pas une dérive, c'est le même traitement que subit
// tout plan généré, et c'est la condition pour que la comparaison porte sur le
// plan et non sur la façon dont il est arrivé.
//
// L'homothétie conserve les rapports de côtés : le verdict du test de
// l'instrument, qui porte sur un ratio, en est indépendant.
//
// Enveloppe dessinée 10,00 × 7,50 m. Pavage exact, vérifié à la main :
//   x ∈ [0,00 ; 3,00]  séjour sur toute la hauteur
//   x ∈ [3,00 ; 4,90]  séjour au sud, salle d'eau au nord
//   x ∈ [4,90 ; 6,20]  WC au sud, dégagement au nord
//   x ∈ [6,20 ; 10,00] chambre 1 au sud, chambre 2 au nord

export const OPTIONS = {
  surface: 75, bedrooms: 2, bathrooms: 1,
  separateKitchen: false, includeWc: true, priority: 'compact'
};

export const PIECES = [
  {
    // Séjour avec cuisine ouverte, en L autour du bloc humide. La cuisine
    // prend le retour est, au contact du dégagement : c'est là que passent
    // les réseaux du bloc salle d'eau / WC, et le linéaire y est adossé.
    id: 'living',
    parts: [
      { role: 'main', x0: 0.00, y0: 0.00, x1: 3.00, y1: 7.50 },
      { role: 'main', x0: 3.00, y0: 0.00, x1: 4.90, y1: 4.50 }
    ]
  },
  {
    // Salle d'eau contre le dégagement, dos à dos avec le WC : une seule
    // gaine pour les deux, et aucune pièce humide en façade — la façade est
    // rendue aux pièces qui ont besoin de lumière.
    id: 'bath_1',
    parts: [{ role: 'main', x0: 3.00, y0: 4.50, x1: 4.90, y1: 7.50 }]
  },
  {
    // WC en début de dégagement, côté séjour : accessible sans traverser la
    // zone nuit, ce qui est sa règle d'implantation la plus constante.
    id: 'wc',
    parts: [{ role: 'main', x0: 4.90, y0: 0.00, x1: 6.20, y1: 2.00 }]
  },
  {
    // Dégagement de 1,30 m, au-dessus du minimum de 1,20 sans atteindre le
    // seuil au-delà duquel ce n'est plus un couloir. Il dessert cinq espaces
    // sur 5,50 m de long et ne traverse pas le logement : le séjour n'est pas
    // desservi par un couloir, il ouvre dessus.
    id: 'circulation',
    parts: [{ role: 'main', x0: 4.90, y0: 2.00, x1: 6.20, y1: 7.50 }]
  },
  {
    // Chambres en façade est, chacune sur deux orientations. Placard toute
    // largeur en fond : 0,60 m de profondeur, la cote de penderie.
    id: 'bedroom_1',
    parts: [
      { role: 'main', x0: 6.20, y0: 0.00, x1: 10.00, y1: 3.10 },
      { role: 'storage', x0: 6.20, y0: 3.10, x1: 10.00, y1: 3.70 }
    ]
  },
  {
    id: 'bedroom_2',
    parts: [
      { role: 'main', x0: 6.20, y0: 4.30, x1: 10.00, y1: 7.50 },
      { role: 'storage', x0: 6.20, y0: 3.70, x1: 10.00, y1: 4.30 }
    ]
  }
];

export const META = { shape: 'rectangle', source: 'plan-reference-t3-75' };
