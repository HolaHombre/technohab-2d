(function (root) {
  'use strict';

  /* M5.2a — ordre canonique des concessions.

     Ce fichier ne contient que de la donnée. Le moteur de politique applique
     ces opérations sans connaître la géométrie ni les types de pièces. */

  function deepFreeze(value) {
    if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
    Object.keys(value).forEach(function (key) { deepFreeze(value[key]); });
    return Object.freeze(value);
  }

  root.TechnoHabRelaxationData = deepFreeze({
    version: '1.0',
    attemptsPerLevel: 3,
    changeSeverities: {
      FUNCTION_PRESERVED: 'FUNCTION_PRESERVED',
      FUNCTION_REDUCED: 'FUNCTION_REDUCED',
      FUNCTION_REMOVED: 'FUNCTION_REMOVED'
    },
    levels: [
      {
        id: 'R0_EXACT',
        mutations: []
      },
      {
        id: 'R1_FUSION',
        mutations: [
          {
            operation: 'set-when-true',
            field: 'separateKitchen',
            value: false,
            reason: 'Ouvrir la cuisine tout en conservant la fonction COOK.',
            severity: 'FUNCTION_PRESERVED'
          },
          {
            operation: 'set-when-true',
            field: 'includeWc',
            value: false,
            reason: 'Intégrer le WC à la pièce d’eau tout en conservant la fonction TOILET.',
            severity: 'FUNCTION_PRESERVED'
          }
        ]
      },
      {
        id: 'R2_BATHROOMS',
        mutations: [
          {
            operation: 'cap-number',
            field: 'bathrooms',
            value: 1,
            reason: 'Conserver une pièce d’eau et retirer les exemplaires supplémentaires.',
            severity: 'FUNCTION_REDUCED'
          }
        ]
      },
      {
        id: 'R3_OPTIONAL_ROOM',
        mutations: [
          {
            operation: 'remove-first-relaxable',
            reason: 'Retirer une seule fonction explicitement déclarée relaxable.',
            severity: 'FUNCTION_REMOVED'
          }
        ]
      },
      {
        id: 'R4_BEDROOM',
        mutations: [
          {
            operation: 'decrement-number',
            field: 'bedrooms',
            amount: 1,
            minimum: 0,
            reason: 'Retirer une chambre en dernier recours.',
            severity: 'FUNCTION_REMOVED'
          }
        ]
      }
    ]
  });
})(typeof globalThis !== 'undefined' ? globalThis : this);
