(function (root) {
  'use strict';

  var criteria = [
    {
      id: 'entry',
      label: 'Accès et seuil',
      description: 'Lisibilité de l’arrivée, protection de l’intimité et transition entre extérieur et logement.'
    },
    {
      id: 'circulation',
      label: 'Desserte et circulation',
      description: 'Utilité des parcours, absence de détour, de branche morte et de longueur sans porte desservie.'
    },
    {
      id: 'zoning',
      label: 'Organisation des fonctions',
      description: 'Cohérence des ensembles jour, nuit et service, ainsi que leur séparation lorsqu’elle est utile.'
    },
    {
      id: 'relations',
      label: 'Relations entre pièces',
      description: 'Justesse des voisinages : cuisine et repas, chambres et pièce d’eau, entrée et séjour.'
    },
    {
      id: 'usability',
      label: 'Usage et ameublement',
      description: 'Possibilité de vivre dans les pièces avec leurs meubles, leurs portes et leurs passages réels.'
    },
    {
      id: 'proportions',
      label: 'Proportions et surfaces',
      description: 'Équilibre des dimensions, absence de pièce trop étroite, trop longue, surdimensionnée ou résiduelle.'
    },
    {
      id: 'facade',
      label: 'Façades et lumière',
      description: 'Répartition de l’extérieur et des ouvertures au bénéfice des pièces qui en ont réellement besoin.'
    },
    {
      id: 'character',
      label: 'Caractère de la proposition',
      description: 'Valeur propre de cette organisation et différence utile par rapport aux autres propositions.'
    },
    {
      id: 'habitability',
      label: 'Habitabilité perçue',
      description: 'Capacité à se projeter dans le logement et importance de la première correction souhaitée.'
    }
  ];

  var ratings = [
    {
      id: 'ACQUIS',
      label: 'Acquis',
      shortLabel: 'Acquis',
      description: 'Fonctionne sans correction importante pour ce plan.'
    },
    {
      id: 'A_AFFINER',
      label: 'À affiner',
      shortLabel: 'À affiner',
      description: 'La direction est bonne, mais une correction identifiable reste nécessaire.'
    },
    {
      id: 'DEFAILLANT',
      label: 'Défaillant',
      shortLabel: 'Défaillant',
      description: 'Le point gêne l’usage ou rompt la cohérence du plan.'
    },
    {
      id: 'NON_OBSERVE',
      label: 'Non observé',
      shortLabel: 'Non observé',
      description: 'Le plan ou les informations disponibles ne permettent pas de conclure.'
    }
  ];

  criteria.forEach(Object.freeze);
  ratings.forEach(Object.freeze);

  root.TechnoHabAnalysisData = Object.freeze({
    format: 'technohab-analysis-grid-v1',
    version: '1.0',
    criteria: Object.freeze(criteria),
    ratings: Object.freeze(ratings)
  });
})(typeof globalThis !== 'undefined' ? globalThis : this);
