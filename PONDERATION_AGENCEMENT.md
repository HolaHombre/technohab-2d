# Pondération de l'agencement — activer la décision 3

**Ouvert le 24 septembre 2026.** Ce chantier n'invente pas un mécanisme : il
exécute une décision déjà prise et documente déjà à moitié écrite.

- `DECISIONS_REGLES.md` §3 a tranché : *compact, lumière, économie
  deviennent des préférences pondérées, lues par le score et ajustables.*
- `PLACEMENT_ET_ADJACENCES.md` §2 a déjà spécifié le gradient d'intimité,
  l'orientation et le regroupement technique, avec leurs prérequis nommés.

Ce document ne les répète pas. Il les **active**, dans l'ordre que leurs
propres prérequis imposent, et il ajoute les deux règles qui n'y étaient pas :
la taille d'équipement et le dégagement, pondérés par `compact`.

## 1. La gate

Identique à `REF-1` : **une règle n'entre au score que si elle change un
verdict ou un classement de plans candidats**, et sa source — cote, seuil,
poids — est écrite avec sa justification, jamais devinée.

Deux gardes supplémentaires, propres à ce chantier :

- **Ne pas rouvrir une ligne tombée.** `DIFFERENTIEL_REFERENTIEL.md` §2 a
  démonté six manques supposés en les confrontant au code. Toute règle ici
  doit être vérifiée de la même façon — contre `generator.js`,
  `placement.js`, `room-model.js` — avant d'être écrite comme un manque.
- **Coordination avec l'équipement lié.** Chevet, commode, îlot et dressing
  vont changer les emprises et les dégagements des pièces qu'ils meublent.
  Une règle de pondération écrite avant eux devra être revue après ; l'ordre
  d'implémentation en tient compte au §4.

## 2. Ce qui existe déjà, tel quel

| Mécanisme | État | Preuve |
|---|---|---|
| `priority` (`compact` / `light` / `economy`) | option normalisée, propagée | `generator.js:172` |
| Score additif par motif, `breakdown` | en place, extensible | `scoreCandidateDetails` |
| Valeurs canoniques `score-weight` | catégorie déjà validée par le schéma | `canonical-values.js:11`, 4 valeurs déjà déclarées |
| `services` par pièce (eau, évacuation, électricité) | **agrégé, jamais consommé** | `room-model.js:111,181,185` |
| Relations typées entre équipements | livrées (M3/O4) | `TH2D-ADJ-001` à `004` |
| Segments de façade, `cote: nord/sud/est/ouest` | réels en géométrie, **décoratifs en sens** | `generator.js:1899-1900` |

Rien de tout cela n'est à reconstruire. C'est le point de départ.

## 3. Les quatre familles de règles

### 3.1 Compact — favoriser le petit équipement — **fait le 24 septembre 2026**

Aujourd'hui, `resolveSize()` (`room-model.js §L`) choisit la plus grande
taille de gamme dont le seuil de surface est atteint, **indépendamment de la
priorité**. `compact` ne pèse sur rien de cet arbitrage.

Règle proposée : en mode `compact`, une pénalité de score croît avec l'écart
entre la taille retenue et le plancher de la gamme — au lieu de rien changer
au solveur d'emprise (qui reste correct), on pénalise au score le choix d'une
taille au-delà du plancher quand une plus petite aurait suffi.

- Valeur : `VAL-SCORE-COMPACT-OVERSIZE-001`, `score-weight`,
  `points-per-requirement`, un poids par palier de gamme dépassé.
- Ne s'applique qu'aux équipements ayant `sizes` (lit, canapé aujourd'hui).
- Compatible avec l'équipement lié : une table de chevet n'a pas de gamme,
  elle n'est pas concernée ; un futur canapé à plusieurs tailles le serait.

**Livré.** Compte les placements dont `sizeId` diffère de `equipmentId` —
signe que `resolveSize()` a retenu une taille au-delà du plancher — dans
`validatePlanUsage()`. Poids `VAL-SCORE-COMPACT-OVERSIZE-WEIGHT-001`
(6 pts/exigence, symétrique de `VAL-USAGE-TARGET-MISS-WEIGHT-001`).

### 3.2 Compact — pénaliser le dégagement généreux — **fait le 24 septembre 2026**

Les zones d'usage portent déjà trois niveaux : `min`, `target`, `comfort`
(`fit.data.js`, ex. `bed_140` : `long.min 0.6 / target 0.7 / comfort 0.9`).
Aujourd'hui rien ne lit `comfort` au score — le solveur ne vise que la
faisabilité.

Règle proposée : en mode `compact`, un plan qui alloue un dégagement proche
de `comfort` plutôt que de `min` reçoit une légère pénalité — l'inverse de ce
qu'un mode `confort` (non existant aujourd'hui, à ne pas ouvrir ici) ferait.
Cette règle rend visible, pour la première fois, l'écart de 33 % à 55 %
relevé face à l'étalon externe (`DIFFERENTIEL_REFERENTIEL.md` §4) : c'est
elle qui déciderait, in fine, si nos dégagements généreux coûtent une place
au classement en mode compact.

- Valeur : `VAL-SCORE-COMPACT-CLEARANCE-001`, `score-weight`,
  `points-per-meter`, appliqué à l'écart `(alloué − min)`.
- **Prérequis vérifié : déjà là.** `placement.assessClearanceLevels()`
  expose déjà `targetMet`/`comfortMet` par pièce, agrégés en
  `clearanceTotals` dans `validatePlanUsage()` — c'est la même donnée qui
  alimente `VAL-USAGE-COMFORT-MISS-WEIGHT-001` en mode normal (pénalité du
  confort **manqué**). Aucune extraction nouvelle n'était nécessaire.

**Décision prise en écrivant le code, pas prévue par la trame.** Ajouter un
malus « confort atteint » à côté du malus existant « confort manqué »
aurait pénalisé toute pose, quelle qu'elle soit — contradiction, pas
préférence. Le mode compact **remplace** l'objectif de confort par son
inverse (`comfortWeight` mis à 0 quand `priority === 'compact'`), il ne
s'y ajoute pas. La cible (`target`), elle, reste poursuivie normalement :
compact renonce au superflu, pas au raisonnable.

**Livré.** Poids `VAL-SCORE-COMPACT-COMFORT-WEIGHT-001`, 2 pts/exigence —
strictement symétrique de `VAL-USAGE-COMFORT-MISS-WEIGHT-001` (même valeur,
jugement inverse).

**Régression trouvée et corrigée** : `scripts/test-m5-selection.mjs`
utilisait `priority: 'compact'` pour tester le mécanisme target/comfort
*général*, sans rapport avec le compact spécifiquement — son assertion
`comfortCost === comfortMissed × 2` supposait ce poids actif en toute
circonstance. Faux depuis ce changement, à raison. Le test est passé à
`priority: 'economy'`, qui préserve son intention sans collision.

### 3.3 Regroupement technique — déjà spécifié, jamais câblé — **fait le 24 septembre 2026**

`PLACEMENT_ET_ADJACENCES.md` §2.4, sans prérequis manquant. `services` existe
déjà par pièce ; il suffit de le lire au score.

Règle proposée : bonus décroissant avec la distance entre centroïdes de
pièces partageant un service (`eau`, `evacuation`), malus croissant au-delà
d'un seuil. Symétrique à ce que `PLACEMENT_ET_ADJACENCES.md` demande déjà en
préférence, jamais en blocage.

- Valeur : `VAL-SCORE-SERVICES-PROXIMITY-001`, `score-weight`,
  `points-per-meter`, sur la distance excédentaire entre centroïdes.
- **C'est la seule des quatre familles sans aucun prérequis externe.** Elle
  passe en premier au §4.

**Livré.** `assets/generator.js` — `penaliteRegroupementTechnique()`, ajoutée
au score sous le critère `servicesProximity`. Deux valeurs canoniques
(`VAL-SCORE-SERVICES-DISTANCE-THRESHOLD-001`, seuil 3,5 m ;
`VAL-SCORE-SERVICES-DISTANCE-EXCESS-WEIGHT-001`, 10 pts/m au-delà). Le
routage passe par le **type de pièce**, pas par `services` : ce champ varie
avec le mobilier retenu et le score juge une géométrie antérieure à la
résolution d'équipement — router par lui aurait introduit une dépendance à
un ordre qui n'existe pas encore à cette étape. `PLACEMENT_ET_ADJACENCES.md`
§2.4 parle de type de pièce, pas de services résolus ; c'est ce qui est câblé.

Vérifié : le poids reste sous celui d'une adjacence de circulation demandée
(10 contre 18 pts/m) — une préférence ne peut pas peser plus qu'une
obligation. `scripts/test-ponderation-services.mjs`, 47 tests de la suite
verts (les 4 échecs préexistants, étrangers à ce chantier, sont inchangés),
40 générations sur 5 configurations × 8 graines sans exception.

### 3.4 Lumière et orientation — la façade réelle, pas les baies — **fait le 24 septembre 2026**

**Correction avant code.** Cette section affirmait que `facadeSegments()`
« connaît déjà chaque baie » — faux, vérifié en lisant le point d'appel :
`scoreCandidateDetails()` n'est appelée qu'une fois, depuis
`candidatDepuisPieces()`, sur des `boxes` nues, **avant** que
`poserFenetres()` ne place la moindre fenêtre. Un compte de baies exigerait
de déplacer le score après construction — hors périmètre de ce chantier.

Ce que `facadeSegments()` sait dire à ce stade, en revanche, c'est le mètre
linéaire de mur donnant sur l'extérieur par pièce — la matière première
d'une baie, pas la baie elle-même. C'est ce qui est câblé : le proxy binaire
« le séjour touche-t-il le nord » (28 points fixes, sans lien à une façade
réelle) est remplacé par un malus proportionnel au déficit de façade de
chaque pièce principale sous un seuil de référence.

**Livré.** `penaliteLumiere()` dans `assets/generator.js`, actif seulement en
mode `light` — une préférence demandée, pas une déduction du moteur
(`DECISIONS_REGLES.md` §3). Deux valeurs canoniques
(`VAL-SCORE-LIGHT-FACADE-REFERENCE-001`, seuil 2,0 m ;
`VAL-SCORE-LIGHT-FACADE-SHORTFALL-WEIGHT-001`, 8 pts/m de déficit) —
explicitement sans cote externe, aucune source réglementaire ni
professionnelle ne fondant ce seuil. Poids maintenu sous celui d'une
adjacence de circulation demandée (8 contre 18). Vérifié : `test-ponderation-lumiere.mjs`,
48 tests de la suite verts, et 40 générations sur 5 configurations × 8
graines en mode `light` donnent le même taux de validité (35/40) qu'avant
le changement — seul le classement des candidats bouge, pas la validité,
ce qu'on attend d'une préférence.

Le **bonus façade sud** reste bloqué, lui, pour la vraie raison :
`PLACEMENT_ET_ADJACENCES.md`
§2.3 le dit — « le nord n'existe pas ». `cote: nord/sud/est/ouest` est un
repère graphique, pas une orientation réelle. L'ouvrir exige un angle de nord
dans le questionnaire et les segments de façade que `OUVERTURES_ET_PARCOURS.md`
§2 réclame déjà pour une autre raison — c'est un chantier à part, pas une
ligne de ce document.

## 3.6 Cumul des modes — décision du 24 septembre 2026, en revue

Relu par Théo, qui a fait remarquer que rien dans les quatre règles ci-dessus
n'imposait l'exclusion mutuelle des trois priorités — c'était une limite de
l'interface (radios) et de `normalizeOptions()` (chaîne unique), pas du
modèle. Vérifié : exact. Chaque critère porte sur un axe indépendant.

**Fait.** `normalizeOptions()` accepte `priorities` (tableau) en plus de
`priority` (chaîne, conservée pour compatibilité). L'interface passe en
cases à cocher. Les quatre critères de score lisent `priorities` ;
l'enveloppe et la découpe (`envelopeAspect`, `layout`) restent sur la
priorité primaire (la première du tableau) — cumuler `light` (façade
élancée) et `economy` (forme carrée) à ce niveau trancherait une question de
géométrie contradictoire que ce chantier n'a jamais posée.

**Régression trouvée et corrigée** : `test-bureau-l1.mjs` comparait
`normalizeOptions()` à un objet exhaustif — cassé mécaniquement par le
nouveau champ, pas par une erreur de logique. Complété.

Vérifié par `test-ponderation-cumul.mjs`, construction déterministe plutôt
que graine : chercher une graine où deux critères se déclenchent « par
hasard » a révélé que la recherche du moteur n'est pas parfaitement
reproductible d'une exécution à l'autre sur un budget borné — le test direct
est la bonne méthode, pas la coïncidence.

Smoke test complémentaire : 126 générations sur les 7 combinaisons possibles
des trois priorités (dont les 4 nouvellement cumulables), 3 surfaces, 6
graines — 98/126 valides, zéro exception. Le cumul ne casse rien.

## 3.5 Vérification des quatre règles

48 → 49 tests de la suite verts (les 4 échecs préexistants inchangés), plus
`test-ponderation-services.mjs`, `test-ponderation-lumiere.mjs` et
`test-ponderation-compact.mjs`. Smoke test de non-régression : 90
générations sur 5 surfaces × 3 priorités × 6 graines, **72/90 valides avant
et après**, chiffre identique à la décimale près — seul le classement des
candidats bouge, jamais leur validité, ce qu'on attend d'une préférence.
`plan.compactObjective` expose désormais `oversizedCount`, `comfortAchieved`
et leurs coûts, au même titre que `plan.preferenceObjective` — observable
par export JSON, comme le reste du chantier.

## 4. Ordre d'implémentation

| # | Règle | Prérequis | Famille |
|---:|---|---|---|
| 1 | Regroupement technique (§3.3) | aucun | déjà spécifiée |
| 2 | Compte d'ouvertures en façade (§3.4, sans le sud) | aucun | nouvelle |
| 3 | Compact — sur-dimensionnement (§3.1) | aucun | nouvelle |
| 4 | Compact — dégagement généreux (§3.2) | usage alloué exposé par le solveur | nouvelle |
| 5 | Orientation réelle et bonus sud (§3.4, le sud) | angle de nord + segments de façade | chantier séparé |

Les lignes 1 à 3 peuvent démarrer sans rien attendre. La ligne 4 exige une
vérification d'abord. La ligne 5 n'est pas ce chantier.

## 5. Ce que ce document ne tranche pas

- Le poids exact de chaque règle — il se mesure sur banc diagnostic, à la
  manière de `DOCTRINE_AGENCEMENT.md` §5, pas décrété ici.
- L'ouverture d'un mode `confort` symétrique à `compact`. Mentionné en 3.2
  comme repoussoir, pas comme item.
- Le chantier d'orientation réelle (angle de nord, segments de façade,
  entrée). Nommé au §3.4 et §4 ligne 5, hors périmètre de celui-ci.
