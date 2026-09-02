# Doctrine globale — TechnoHab

Ce document fait foi sur **ce que TechnoHab est**, sur **l’unité élémentaire
de conception**, et sur **l’ordre dans lequel le moteur doit décider**. Les
doctrines spécialisées (`DOCTRINE_AGENCEMENT.md`, `DOCTRINE_CIRCULATION.md`)
et les décisions de programme (`DECISIONS_PROGRAMME.md`) en sont des
déclinaisons : elles ne le contredisent pas.

**Rendue le 27 août 2026.** Elle intègre l’audit d’émergence fonctionnelle
versé à la roadmap (§6.1 ter) et ferme, au niveau doctrinal, ce que
`DECISIONS_PROGRAMME.md` avait déjà tranché pour quatre fonctions. Le même
jour : horizons **MVP / V1 / cap** (§1 bis) — V1 = proposeur honnête ;
cap = co-auteur, jamais auteur au sens plein.

---

## 1. Ce qu’est TechnoHab

TechnoHab transforme une **intention d’habiter** en **plans de principe 2D**
explicables, comparables et contrôlés.

Il ne produit pas un dessin décoratif. Il produit une proposition dont on
peut dire :

- quelles fonctions d’usage sont satisfaites ;
- par quels équipements ;
- dans quel niveau d’organisation spatiale (pièce, zone, partage) ;
- sous quelles contraintes (surface, intimité, réglementation, confort) ;
- avec quel écart au programme demandé.

**Ce que TechnoHab n’est pas** :

- un modeleur BIM ;
- un outil contractuel ou réglementaire opposable ;
- un catalogue de templates de logements ;
- un simulateur temporel complet de la vie domestique ;
- un **auteur d’architecture** au sens de parti et de signature
  (voir §1 bis — le cap est *co-auteur*, pas auteur).

Le plan reste un **plan de principe non contractuel**. Chaque règle porte un
identifiant, un niveau et un message. Aucune proposition n’est affichée si
une règle `HARD` échoue.

### 1 bis. Horizons produit — MVP, V1, cap (tranchés)

Trois horizons distincts. Les confondre produit des promesses fausses ou un
moteur qui n’ose jamais publier.

| Horizon | Rôle assumé | Ce qu’on a le droit de dire | Porte |
|---|---|---|---|
| **MVP** | Générateur *tenable* dans Wonderland | « produit un plan de principe contrôlé » | B tenue ; C en cours |
| **V1** | **Proposeur honnête** | « plusieurs plans explicables, comparables, meublables, sans violation HARD » | **C** ouverte — D souhaitée, **pas** E |
| **Cap post-V1** | **Auteur statistique / co-auteur** | « souvent jugé bon par un œil formé » — seulement après preuve | **E** ouverte |

#### V1 — promesse de release honnête

La V1 **n’est pas** un auteur de bons plans. Elle est un **proposeur de
principes tenables** sur un domaine borné :

- logement domestique, 2D, enveloppes simples ;
- programmes du studio au T4/T5 approximatif ;
- fonctions d’usage satisfaites, hypothèses et limites visibles ;
- maturité des profils affichée (`expérimental` tant que C4–C5 incomplet).

**Interdit en V1** (interface, README, communication) :

- « agréable », « architectural », « digne d’un architecte » ;
- « indiscernable d’un plan humain » ;
- « auteur » / « conçoit pour vous » au sens créatif.

**Autorisé en V1** :

- plan de principe, contrôlé, explicable, comparable ;
- conforme aux règles `HARD` du moteur ;
- proposeur / assistant de conception de principe.

#### Cap après V1 — ce vers quoi on tire

Après V1, le cap du projet n’est **pas** de remplacer un architecte. C’est
de devenir un **co-auteur** :

1. **moyen terme** — *auteur statistique* : préférences stables, mesurées
   (leviers L1–L3), plans souvent jugés bons sur le domaine borné ;
2. **long terme** — *co-auteur* : le moteur propose et nomme les
   compromis ; **l’humain signe** le parti.

Ce que le cap **exclut durablement** :

- un auteur au sens de *projet* (site, lumière fine, structure, récit) ;
- la singularité volontaire d’un parti architectural ;
- le jugement final sur un brief réel sans humain.

La roadmap porte le détail des portes et lots
([`ROADMAP.md`](ROADMAP.md) §1 bis et §6.4). Ce paragraphe fait foi sur le
**vocabulaire de promesse**.

---

## 2. Principe fondateur — l’émergence fonctionnelle

> **Une pièce n’est pas nécessairement l’unité élémentaire de conception.
> L’unité élémentaire est la fonction d’usage.**

Une fonction peut être satisfaite par un ou plusieurs équipements. Les
équipements compatibles peuvent former une zone fonctionnelle. Plusieurs
zones peuvent partager une même enveloppe spatiale lorsque leurs usages,
leurs dégagements ou leurs états sont compatibles.

Une pièce fermée n’est créée que lorsqu’une séparation physique est
nécessaire ou suffisamment avantageuse au regard des contraintes
fonctionnelles, réglementaires, spatiales et qualitatives.

La typologie finale d’un logement peut ainsi émerger de la combinaison des
fonctions satisfaites, des zones créées et du niveau de partitionnement
obtenu — ou être imposée comme contrainte quand l’utilisateur la demande.

C’est la généralisation de ce que `DECISIONS_PROGRAMME.md` §1 a déjà écrit
pour le repas, le bureau, le dressing et le rangement, et de l’invariant D3
déjà tenu en code : **aucune option ne fait disparaître une fonction**.

### 2 bis. Trois leviers d’agrément — tranchés

L’ontologie fonctionnelle ne produit pas, à elle seule, des plans
*agréables*. Trois leviers le font. Ils sont **retenus comme conditions
d’agrément** du moteur ; la roadmap les porte (§6.0). Sans eux, TechnoHab
reste un générateur de plans *tenables*.

| # | Levier | Décision | Où ça vit |
|---|---|---|---|
| **L1** | **Stratégie selon la pression spatiale** | 14 m² et 90 m² ne partagent pas la même heuristique de pose. `SPACE_PRESSURE` sélectionne `ROOM_FIRST` / `HYBRID` / `ZONE_FIRST` / critique. Les seuils numériques sont **N3 provisoires**, calibrés sur banc en F4 — pas inventés a priori. | `DOCTRINE.md` §4 · flux **F4–F6** |
| **L2** | **Le score cesse d’aimer ce qui est laid** | Tant qu’allonger un couloir reste net-positif face à une adjacence manquée, aucun catalogue de capacités ne sauve le rendu. On pénalise la **longueur rapportée au besoin de desserte**, pas seulement la surface. Interdit : barème à primes qui empêche la sortie à score nul. | `DOCTRINE_CIRCULATION.md` §8.7 · **prérequis M3** (lot nommé) · affiné en **M5** |
| **L3** | **Preuve externe avant prétention** | Aucune affirmation « plan agréable / crédible » hors porte E. La corrélation quiz / score est un **test d’instrument**, pas un substitut à la discrimination à l’aveugle ni au corpus. | chantier 6 · **M6** · porte E |

**Ordre non négociable entre leviers :** L2 avant M3 (sinon on met en
concurrence des topologies avec un barème qui préfère encore la barre
allongée) ; L1 (F4+) après que L2 et S4 aient commencé à tenir ; L3 (M6)
couronne M5, il ne la remplace pas.

### Conséquence pour le moteur


Le modèle implicite historique :

```text
HOUSE → ROOMS → EQUIPMENT → GEOMETRY
```

devient le modèle cible :

```text
USER PROGRAM
    ↓
FUNCTIONAL REQUIREMENTS
    ↓
CAPABILITY RESOLUTION
    ↓
EQUIPMENT CANDIDATES
    ↓
FUNCTIONAL CLUSTERING
    ↓
SPACE PRESSURE ANALYSIS
    ↓
ROOM / ZONE STRATEGY
    ↓
PLACEMENT
    ↓
PARTITIONING (si justifié)
    ↓
VALIDATION · SCORING
    ↓
TYPOLOGY CLASSIFICATION
```

Le runtime actuel reste room-first. La doctrine impose que **toute évolution
nouvelle** se lise dans cette chaîne, et que la couche room-first soit
traitée comme une **stratégie de résolution** parmi d’autres — pas comme
l’ontologie du projet.

---

## 3. Hiérarchie conceptuelle

```text
PROGRAM
    ↓
FUNCTION
    ↓
CAPABILITY
    ↓
EQUIPMENT
    ↓
FUNCTIONAL_CLUSTER
    ↓
        ┌────────┐
        │        │
      ZONE      ROOM
        │        │
        └───┬────┘
            ↓
        DWELLING
            ↓
        TYPOLOGY
```

`ZONE` et `ROOM` ne sont pas strictement séquentiels : ce sont **deux
solutions spatiales** possibles à un même besoin. Le cluster fonctionnel
peut se résoudre en l’une ou l’autre selon la pression spatiale, les
exigences de séparation et le score global.

---

## 4. Glossaire — vocabulaire fermé

Quatre sens du mot « zone » coexistaient déjà dans le projet. Ce glossaire
les départage. **Un seul de ces sens est une unité de conception** ; les
autres restent des termes techniques locaux.

| Terme | Sens canonique | Ne pas confondre avec |
|---|---|---|
| **PROGRAM** | Intention utilisateur : occupants, fonctions demandées, contraintes, surface | la liste impérative de pièces de `buildProgram()` |
| **FUNCTION** | Besoin d’usage invariant (`SLEEP`, `COOK`, `EAT`, …) | le type de pièce (`bedroom`, `kitchen`) |
| **CAPABILITY** | Capacité élémentaire fournie par un équipement (`STORE_FOOD_COLD`, `SIT`, …) | les « capacités » des benches moteur (`scan-capacites`) |
| **EQUIPMENT** | Objet posé : géométrie, ancrage, zones d’usage, capacités, états éventuels | la pièce qui l’héberge |
| **FUNCTIONAL_CLUSTER** | Ensemble d’équipements spatiaux proches qui satisfont ensemble une fonction | une pièce nommée |
| **ZONE** | Conteneur spatial fonctionnel **sans** cloison obligatoire | la *zone d’usage* d’un équipement (`usage[]`) |
| **SHARED_ZONE** | Surface dont l’usage change selon le moment, l’état d’un équipement ou l’occupant | une fusion de programmes (`composeInto`) — qui en est aujourd’hui l’approximation |
| **ROOM** | Conteneur spatial à identité propre, bornes physiques, accès (porte) | le rectangle de pose géométrique |
| **SEPARATION** | Niveau de cloisonnement accepté / exigé par une fonction | l’option binaire « cuisine séparée » |
| **SPACE_PRESSURE** | Rapport entre besoin fonctionnel et surface disponible | la seule `compression` actuelle sous minima |
| **TIME_MODE** | État temporel léger (`DAY`, `NIGHT`, `TRANSITION`, `ALWAYS`) | un simulateur de journée |
| **TYPOLOGY** | Classification du logement (studio, T2, …) — descriptive *ou* contrainte | un template géométrique |
| **zone d’usage** | Dégagement requis devant / autour d’un équipement (`usage`) | `ZONE` (conteneur) |
| **part.role = storage** | Bande géométrique cédée à un rangement | `ZONE` fonctionnelle |

### Capacités — registre initial

Le registre est **fermé et versionné**. L’étendre est une décision de
doctrine, pas un ajout opportuniste dans un profil.

```text
SLEEP · SIT · RELAX · WORK
COOK · PREPARE_FOOD · WASH_FOOD
STORE_FOOD_COLD · STORE_FOOD_DRY
EAT
WASH_HANDS · WASH_BODY · TOILET
STORE_CLOTHES · STORE_GENERAL
LAUNDRY
```

Un équipement déclare une ou plusieurs capacités. Plusieurs capacités
assemblées reconnaissent une fonction supérieure :

```text
fridge → STORE_FOOD_COLD
hob    → COOK
sink   → PREPARE_FOOD · WASH_FOOD
worktop→ PREPARE_FOOD
────────────────────────
       → KITCHEN_FUNCTION
```

### Fonctions — registre initial

```text
SLEEP · COOK · EAT · WASH_BODY · TOILET
STORE_CLOTHES · RELAX · WORK · LIVE
```

Chaque fonction porte au minimum :

```text
FUNCTION <nom>
  REQUIRED_CAPABILITIES   AND / OR de capacités
  REQUIRED_EQUIPMENT      (miroir de compatibilité, tant que la résolution
                           par capacités n’est pas seule autorité)
  MIN_ENVELOPE            dérivée des équipements et de leurs zones d’usage
  EXISTENCE               remplie AU MOINS UNE FOIS dans le plan
  HOST_FALLBACK           pièce / zone d’accueil si non émergente
  EMERGENCE               condition de pièce autonome
  SEPARATION              minimum / preferred / maximum
  DENOMINATION            change avec l’émergence ; la fonction, non
```

### Séparation — continuum

```text
NONE → VISUAL → PARTIAL → FULL → FULL_WITH_DOOR
```

Exemples de lecture (valeurs à calibrer, mécanisme à créer) :

| Fonction | Minimum typique | Préféré |
|---|---|---|
| cuisine | `NONE` | `NONE` ou `VISUAL` |
| sommeil | `NONE` | `VISUAL` |
| toilette | `PARTIAL` / `FULL` | `FULL_WITH_DOOR` |
| hygiène du corps | `FULL_WITH_DOOR` | `FULL_WITH_DOOR` |

### Pression spatiale — ordres de grandeur

```text
SPACE_PRESSURE ≈ required_functional_area / available_area
```

| Niveau | Stratégie |
|---|---|
| **LOW** | `ROOM_FIRST` — pièces d’abord, équipements ensuite |
| **MEDIUM** | `HYBRID` — pièces + zones |
| **HIGH** | `ZONE_FIRST` — zones, équipements multifonctions, dégagements partagés |
| **CRITICAL** | transformables, partage temporel, optimisation agressive |

Les seuils numériques se calibrent plus tard. Le principe prime : **le moteur
change de stratégie**, il n’applique pas la même heuristique à 14 m² et à
80 m².

### Résolution d’équipement

```text
RESOLUTION_TYPE = PERMANENT | TRANSFORMABLE | SHARED
```

Un canapé-lit n’est pas automatiquement meilleur parce qu’il économise de la
surface. Chaque type de résolution porte des coûts (confort, contrainte
quotidienne, efficacité spatiale) qui entrent dans le score.

---

## 5. Trois niveaux spatiaux

### ROOM

Espace physiquement séparé : bornes, porte, identité propre.

Exemples : chambre fermée, WC séparé, salle d’eau.

### ZONE

Espace fonctionnel identifiable, **non nécessairement cloisonné**.

Exemples : cuisine ouverte, coin nuit, coin bureau, coin repas.

Une zone possède une enveloppe d’usage et des objets ; elle n’impose pas de
murs ni de porte.

### SHARED_ZONE

Surface utilisée par plusieurs fonctions selon le moment, l’état d’un
équipement ou l’utilisateur.

```text
living_area
  DAY:   seating · relax
  NIGHT: sleeping   (sofa_bed déployé)
```

Le moteur ne valide pas un seul instant : il exige

```text
layout_valid(DAY) ∧ layout_valid(NIGHT)
```

quand des équipements transformables ou des partages temporels sont en jeu.
Pas de simulateur continu — trois ou quatre `TIME_MODE` suffisent.

---

## 6. Typologie : descriptive et contrainte

### Descriptive (émergente)

```text
generate(program) → classify(result)
```

Un programme « 1 occupant · sleep · cook · wash · toilet · living » peut
produire un studio ou un micro-T2 selon la surface et le partitionnement.
La typologie **décrit** le résultat.

### Contrainte (prescriptive)

```text
generate(STUDIO)  où STUDIO est une TYPOLOGY_CONSTRAINT
```

Exemple :

```text
STUDIO
  REQUIRED
    - une enveloppe habitable principale
    - sleeping · living · cooking · hygiene · toilet
  FORBIDDEN
    - chambre pleine séparée (FULL_WITH_DOOR dédiée au seul sommeil)
```

`STUDIO` n’est plus un template géométrique. C’est un filtre sur l’espace
des résolutions. Le cas spécial actuel (`bedrooms === 0` → cuisine ouverte +
WC intégré + couchage versé au séjour) en est l’approximation ; la doctrine
demande de le remplacer par cette forme dès que la couche fonctionnelle
existe.

---

## 7. Chaîne cible et chaîne actuelle

| Étape cible | État au 27 août 2026 |
|---|---|
| USER PROGRAM | formulaire (surface, chambres, options) — pas encore un programme de fonctions |
| FUNCTIONAL REQUIREMENTS | doctrine + `DECISIONS_PROGRAMME` ; runtime = types de pièce |
| CAPABILITY RESOLUTION | absent |
| EQUIPMENT CANDIDATES | socle : un équipement requis par id, pas d’OR |
| FUNCTIONAL CLUSTERING | absent |
| SPACE PRESSURE | proxy : `compression` sous minima |
| ROOM / ZONE STRATEGY | room-first ; studio / fusions = exceptions |
| PLACEMENT | `placement.js` + cache `fit.data.js` |
| PARTITIONING | murs après pose de rectangles — pas une décision de séparation |
| VALIDATION · SCORING | `rules.js` + peines d’usage |
| TYPOLOGY CLASSIFICATION | studio prescrit ; pas de `classify()` |

La compatibilité impose : **ne pas refactoriser toutes les pièces d’un coup.**
On ajoute une couche. Les `RoomDefinition` existent toujours ; un
`FunctionalProgram` peut produire `ROOM_REQUIREMENT` ou `ZONE_REQUIREMENT` ;
le moteur room-first continue de servir tant que la pression ne bascule pas.

---

## 8. Rapport aux doctrines spécialisées

| Document | Autorité sur | Rapport à cette doctrine |
|---|---|---|
| **DOCTRINE.md** (celui-ci) | unité de conception, chaîne de décision, glossaire | fait foi |
| [`DECISIONS_PROGRAMME.md`](DECISIONS_PROGRAMME.md) | émergence repas / bureau / dressing / rangement | application immédiate du §2 |
| [`DOCTRINE_AGENCEMENT.md`](DOCTRINE_AGENCEMENT.md) | pré-calcul des gabarits, `fits`, niveaux de règles mobilier | reste vraie **à programme d’équipements fixé** ; la résolution multi-candidats compile une frontière **par résolution** |
| [`DOCTRINE_CIRCULATION.md`](DOCTRINE_CIRCULATION.md) | desserte, seuils, portes | inchangée ; jour/nuit de circulation rejoint `TIME_MODE` |
| [`CONTRATS_MOTEUR.md`](CONTRATS_MOTEUR.md) | `Intent` … `Verdict` | les contrats s’étendront d’un `FunctionalProgram` sans casser M1 |
| [`MODELE_EXIGENCES.md`](MODELE_EXIGENCES.md) | désignation d’exigences pièce → équipements | gagne `requiredCapabilities` en miroir |

### Invariant d’agencement, précisé

La doctrine d’agencement (« ce qui est cher se calcule hors ligne ») **ne
s’applique pas à un programme d’équipements flottant**. Dès qu’une fonction
admet plusieurs résolutions (`BED` ∨ `SOFA_BED`), le cache compile une
frontière par résolution retenue — jamais un seul rectangle « moyen ».

L’inversion « placer les clusters puis partitionner » est autorisée
**uniquement** sous stratégie `ZONE_FIRST` / `FUNCTION_FIRST` (pression haute
ou critique). Elle ne remplace pas le poseur corridor-first des programmes
à pression faible.

---

## 9. Architecture de transition

Trois principes :

1. **Couche au-dessus, pas remplacement.** Le runtime room-first reste
   valide tant qu’une stratégie plus riche n’est pas sélectionnée.
2. **Annoter avant de changer le comportement.** Les données précèdent le
   code de génération.
3. **Un seul chemin d’autorité par concept.** Quand `trigger` devient lu,
   le chemin impératif équivalent dans `buildProgram()` disparaît pour les
   types couverts — pas de triple vérité.

### Phases (flux F de la roadmap)

| Phase | Objet | Comportement générateur |
|---|---|---|
| **F0** | Doctrine + glossaire + registre CAPABILITY | aucun |
| **F1** | `capabilities[]` sur le socle ; miroir `requiredCapabilities` | aucun |
| **F2** | Catalogue FUNCTION ; résolution OR d’équipements ; interpréteur `trigger` élargi (avec L1) | activation / émergence |
| **F3** | `ZONE` comme conteneur ; `SEPARATION` minimal (avec L2) | zones désignées |
| **F4** | `SPACE_PRESSURE` + stratégies `HYBRID` ; coût de cloison dans le score | bascule de stratégie |
| **F5** | `TIME_MODE`, transformables, mutualisation, `classify()` | multi-états |
| **F6** | Partition post-placement bornée aux programmes critiques | branche `FUNCTION_FIRST` |

F0–F1 sont des travaux de **canon**, parallèles au flux M, sans attendre M3.
F2–F3 convergent avec L1–L2 du chantier 7. F4–F6 **attendent** que la porte A
soit rouverte, que `S4` soit tenu, et que M3 ait rendu les topologies
interchangeables — sinon l’on mène deux refontes de topologie à la fois.

---

## 10. Invariants non négociables

1. **Existence des fonctions.** Toute fonction requise est satisfaite au
   moins une fois ; une option ne peut que changer son hébergement.
2. **Composition, pas addition.** Fusionner deux programmes compose une
   fonction, n’additionne pas aveuglément les équipements (décision 18).
3. **Séparation des autorités.** Le canon (flux C) ne pirate pas une
   heuristique de pose ; le moteur (flux M) ne décrète pas une cote.
4. **Preuve avant affirmation.** Une règle annoncée `HARD` est vérifiée en
   code, ou elle n’est pas `HARD` (`S4` en est l’exemple à fermer).
5. **Rétrocompatibilité de surface.** Tant qu’une stratégie `ROOM_FIRST`
   sert un programme, les plans T2–T5 existants ne régressent pas pour
   cause d’annotation fonctionnelle.
6. **Zéro dépendance runtime.** Vanilla JS, `file://`, chargement paresseux
   du socle — inchangé.
7. **Le hasard ne crée pas la faisabilité.** La graine ordonne
   l’exploration ; elle ne rend pas possible l’impossible.

---

## 11. Ce que cette doctrine n’ordonne pas encore

- les **seuils numériques** exacts de `SPACE_PRESSURE` (principe et
  calibration F4 tranchés au §2 bis ; les nombres restent N3 à mesurer) ;
- les valeurs exactes de `SEPARATION` par fonction ;
- le barème de confort des transformables ;
- l’ordre de priorité d’émergence entre fonctions bonus (proposition
  ouverte dans `DECISIONS_PROGRAMME.md` §4.1 : repas > rangement > bureau >
  dressing) ;
- le remplacement immédiat des poseurs `squelette.js` / `typologie.js` ;
- l’abandon du cache rectangulaire hors stratégie critique ;
- les **poids exacts** du barème M3.0 (la *direction* — pénaliser la
  longueur de desserte — est tranchée ; les coefficients se mesurent).

Ces points s’instruisent dans la roadmap (flux F, M3.0, M6) ; ils ne se
décrètent pas ici.

---

## 12. Lecture rapide pour un contributeur

Avant de toucher au générateur :

1. Lire ce fichier.
2. Lire [`DECISIONS_PROGRAMME.md`](DECISIONS_PROGRAMME.md) si la question
   porte sur repas, bureau, dressing, rangement.
3. Lire [`DOCTRINE_AGENCEMENT.md`](DOCTRINE_AGENCEMENT.md) avant tout
   changement de `placement.js` / `fit.data.js`.
4. Lire [`DOCTRINE_CIRCULATION.md`](DOCTRINE_CIRCULATION.md) avant toute
   desserte ou porte.
5. Vérifier dans la roadmap que le lot appartient au bon flux (M, C ou F) et
   qu’il ne franchit pas une porte fermée.

**Question-filtre avant d’ajouter quoi que ce soit :** cet élément
améliore-t-il davantage la satisfaction des fonctions, l’orientation de
l’utilisateur ou la preuve de conformité qu’il ne consomme de complexité,
d’attention ou de surface de recherche ? Sinon, ne pas l’intégrer.
