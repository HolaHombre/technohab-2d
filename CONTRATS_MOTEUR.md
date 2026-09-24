# Contrats du moteur — v1.1

État au 2 septembre 2026. Ce document décrit les frontières introduites par M1
et étendues par M5.2a–f ;
[`GENERATION_CONTRACTS.json`](./GENERATION_CONTRACTS.json) en est le manifeste
lisible par les tests, et `assets/contracts.js` l'implémentation sans dépendance.

`CANONICAL_VALUE_SCHEMA.json` définit en parallèle le contrat 1.0 des valeurs,
`assets/canonical-values.data.js` porte le registre de données pures, et
`assets/canonical-values.js` le valide au chargement. `Program`, `BuiltPlan`,
le plan et l'export transportent des références `{id, version}` résolubles dans
ce registre.

Le vocabulaire de source est `N1`, `N2`, `N3`, `UNRESOLVED`. Une valeur
`HARD/N3` est admise uniquement si sa source est `doctrinal`, sa justification
est non vide et sa portée nomme au moins les profils, le territoire, le contexte
de bâtiment et la date d'effet. `UNRESOLVED` est interdit en `HARD`.

M3 a rendu les producteurs de `squelette.js` explicites et interchangeables ;
`typologie.js` reste le repli. Les contrats empêchent que demande, programme,
proposition topologique, plan construit et verdict restent cinq sens différents
du mot « plan ».

## 1. Pipeline

```text
Intent
  → Program
    → TopologyCandidate
      → BuiltPlan
        → Verdict
          → GenerationResult
            → PlanSelection (1 à 5 résultats VALID)
              → ResolvedSelection (résolution + comparaison)
```

`TechnoHabGenerator.generateResult(options, variant, seed)` est l'entrée
versionnée unitaire ; `generateSelection(options, variant, seed, 3)` est
l'entrée comparative de M5. `generatePlan()` reste disponible pour les scripts historiques : il
rend directement le plan ou lève une exception, et ne doit plus servir à une
nouvelle intégration produit.

M5.2a–f ajoutent **autour** de ce pipeline une enveloppe
`ProgramResolution` sans modifier les quatre statuts M1. La politique pure, le
contrat et l'API explicite `resolveProgram()` sont disponibles ; depuis M5.1,
l'interface consomme `resolveSelection()` afin de conserver résolution et
comparaison dans une seule sortie.
L'échelle de concessions est définie dans
[`RESOLUTION_PROGRAMME.md`](RESOLUTION_PROGRAMME.md).

## 2. Les neuf objets

### `Intent`

La demande normalisée de l'utilisateur, avant toute règle de typologie :
options, numéro de variante et graine demandée. Une graine absente vaut `null` ;
elle n'est pas inventée par le contrat.

### `Program`

Ce que le logement doit contenir après application des compositions : options,
système constructif, pièces et enveloppes de surface (`minArea`, `targetArea`,
`maxArea`), registre de relations typées et somme des planchers. Chaque relation
porte `nature`, `degre` et `contact`; `requiredAdjacencies` conserve l'alias des
relations obligatoires. O1 rend le plafond
relatif au besoin meublable et ferme à son plancher toute pièce à agrément nul.
Il porte aussi les profils canoniques consommés et la maturité du plus faible.

Il ne contient aucune coordonnée. Une impossibilité dont la preuve est déjà
dans le programme doit être déclarée ici, avant la recherche.

### `TopologyCandidate`

Une proposition de disposition : stratégie, famille, nombre de branches,
stratégies comparées, tentative, score, emprise, rectangles des pièces et
adjacences réalisées. Elle ne porte ni murs, ni baies, ni verdict. Barre, L, T,
hall et jour/nuit produisent le même candidat interne ; le contrat public garde
la provenance du candidat retenu. M4a ajoute la transformation D4, la classe
d'équivalence et les vues disponibles. M4a.2 publie en outre
`terminationMethod` et `terminations` : chaque terminaison nomme la branche,
son extrémité, la pièce receveuse et la longueur transférée. Ces champs
décrivent la topologie avant construction ; la conformité géométrique reste la
responsabilité du `BuiltPlan`.

### `BuiltPlan`

Le plan matérialisé par `construction.js`, conforme au contrat d'export
[`PLAN_SCHEMA.json`](./PLAN_SCHEMA.json) : surfaces utiles, murs, réservations,
portes, fenêtres et parcours. Il transporte les profils utilisés et leur
maturité agrégée. Son `circulationObjective` sépare le linéaire de façade, la
largeur réservée à l'entrée, l'excédent classé, le coût canonique et les
terminaisons. M5.0 y ajoute les bras logiques, le nombre de portes attribuées,
les bras vides, le reliquat après la dernière ouverture et son coût canonique
`VAL-CIRC-DEAD-LENGTH-WEIGHT-001`. `branchSearchFallback`, lorsqu'il existe,
nomme le repli `legacy-ranking-v1` utilisé après épuisement de la recherche
M5. Les coûts sont des `PREFERENCE` N3 ; ils ne participent jamais au booléen
de conformité du verdict.

M5 ajoute `preferenceObjective` : exigences `target` et `comfort` atteintes,
manquées et coûts canoniques séparés. `hardCandidatesRejected` compte les
BuiltPlan refusés par le juge pendant la recherche ; il ne transforme jamais
un échec de recherche en impossibilité prouvée.

Un `BuiltPlan` n'est pas synonyme de plan présentable. Il doit encore recevoir
un `Verdict`.

### `Verdict`

La lecture du plan construit par `rules.js` : violations, limites consignées,
compteurs et booléen `valid`. Dans M1, `valid` signifie exactement « juge chargé
et zéro violation `HARD` ». Une limite documentée n'est pas silencieusement
transformée en conformité.

### `GenerationResult`

L'enveloppe terminale. Elle conserve les objets réellement atteints et porte
un seul des quatre statuts ci-dessous. Le résultat est figé en tête : un
appelant ne peut pas changer son statut après coup.

### `PlanSelection`

Une comparaison explicite de un à cinq `GenerationResult`, trois par défaut.
Elle ne transporte que des résultats `VALID`, déduplique les classes D4 et
publie `COMPLETE`, `PARTIAL` ou `EMPTY`. Le premier plan est le meilleur score
global ; les suivants préservent famille puis stratégie avant le score. Cette
politique reste hors du score architectural et porte le nom
`score-then-family-strategy-diversity-v1`.

### `ProgramResolution` — contrat et orchestration M5.2a–c

L'enveloppe conserve l'`Intent` et le `Program` demandés, le programme
effectivement résolu, la différence structurée et toutes les tentatives. Elle
porte `EXACT`, `RELAXED` ou `UNRESOLVED`. Son `GenerationResult` reste `VALID`
pour le programme réellement servi : `RELAXED` n'est volontairement pas ajouté
aux statuts M1 et `PlanSelection` continue de ne recevoir que des résultats
`VALID`.

La version 1.1 publie aussi les vocabulaires fermés des trois statuts de
résolution, des cinq niveaux `R0…R4` et des trois sévérités de concession. Les
listes `changes` et `attempts` sont figées en profondeur. Le produit consomme
ce contrat pour présenter la demande et la proposition ; un changement
`FUNCTION_REMOVED` exige son consentement avant activation et export. Les
consommateurs historiques qui conservent `generateResult()` ne changent pas de
comportement. `resolveProgram()` essaie au plus trois
couples variante/graine par niveau applicable, reconstruit le programme à
chaque concession et rend l'enveloppe au premier résultat `VALID`.

### `ResolvedSelection` — réemploi M5.2d

La sortie de `resolveSelection()` associe le `ProgramResolution` à une
`PlanSelection` portant exclusivement le programme résolu. Le premier
`GenerationResult VALID` entre directement dans le pool ; `reusedResult` et
`generatedAttempts` rendent ce réemploi et son coût inspectables. Une
résolution `UNRESOLVED` impose `selection: null` et zéro nouvelle tentative.

### Mesure M5.2f

La photographie versionnée sépare le coût de résolution du coût de sélection.
Une tentative compte un appel à `generateResult()` ; les durées machine ne font
pas partie du contrat stable. Sur trente demandes fixes, le témoin porte 6
`EXACT`, 24 `RELAXED`, zéro `UNRESOLVED` et zéro violation `HARD`. Les niveaux
observés sont R1 × 4, R2 × 11 et R4 × 9 ; R3 reste inapplicable en l'absence de
fonction déclarée relaxable. Référence :
`scripts/references/M5_2_RESOLUTION_REFERENCE.json`.

## 3. Statuts

| Statut | Sens | Plan construit |
|---|---|---|
| `VALID` | le programme a produit un plan et le verdict ne porte aucun `HARD` | requis |
| `IMPOSSIBLE` | une contrainte prouvée interdit le programme avant recherche | interdit |
| `NON_TROUVE` | le programme n'est pas prouvé impossible, mais les stratégies disponibles sont épuisées | interdit |
| `INVALIDE_DEBUG` | panne interne, juge indisponible, ou plan construit avec violation `HARD` | facultatif, diagnostic seulement |

La distinction est volontairement asymétrique : **ne pas trouver ne prouve pas
que rien n'existe**. M1 ne déclare `IMPOSSIBLE` que lorsque la somme des
planchers fonctionnels dépasse même la borne haute de la marge de surface
annoncée. D'autres preuves pourront
être ajoutées, identifiées une par une ; jamais déduites d'un simple épuisement
du budget.

## 4. Profils et maturité

Chaque profil transporte :

- son identifiant canonique ;
- sa maturité `C0` à `C6` ;
- la version datée du canon ;
- le fichier source.

Le plan prend la maturité minimale de la liste. WC séparé, salle d'eau avec WC
intégré, chambre, séjour, cuisine, circulation, seuil d'entrée, noyau rangement
et bureau autonome sont C4 sur leur portée déclarée ; le bureau n'est pas
encore activé dans un programme généré et la salle d'eau autonome reste C2.
Un plan courant peut donc encore annoncer `profileMaturity: "C2"`. Le contrat
empêche qu'un profil éprouvé masque la maturité plus faible d'un autre profil.

## 5. Compatibilité et prochain déplacement

- `generatePlan()` reste stable pour les bancs et les consommateurs anciens ;
- l'interface utilise `resolveSelection()` et affiche séparément demande
  exacte, proposition de repli, impossible, non trouvé et panne ;
- `COMPLETE`, `PARTIAL` et `EMPTY` sont annoncés dans le produit ; les rangs
  disponibles commandent un panneau de plan unique au clavier et chaque
  activation rattache affichage, verdict, graine, évaluation et export au même
  `GenerationResult` ;
- l'export 3.1 conserve dans `plan` la version de contrat, les profils et leur
  maturité ; il ajoute la résolution compacte et son consentement, ou `null`
  pour les consommateurs historiques ;
- le consentement M5.2 précède toujours l'activation de la sélection : changer
  de rang ne peut pas contourner l'accord requis pour un retrait de fonction.
