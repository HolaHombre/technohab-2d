# Profil de pièce — Bureau

**`BUREAU` · pièce générable · maturité `C4` · 24 septembre 2026**

Vague **C-P4**, et lot pilote **L1** du chantier 7. Gabarit :
[`GABARIT_PIECE.md`](../GABARIT_PIECE.md). Source :
[`agencement/bureau.md`](../agencement/bureau.md).

Le socle décrit son rôle, son agrément et ses équipements. L1 interprète son
`trigger: count` et le questionnaire permet de demander une variante compacte
ou convertible. La principale difficulté n'est pas dimensionnelle.

---

## 1. Définition fonctionnelle

```text
ROOM_TYPE  BUREAU
FAMILY     DAY_ROOM
VARIANTS   compact | convertible

PRIMARY_FUNCTIONS
- travailler assis à un poste fixe
- se concentrer : isolement visuel et sonore
- ranger documents et matériel

SECONDARY_FUNCTIONS
- recevoir en visioconférence
- accueillir ponctuellement un couchage d'appoint
- lire, étudier
```

### Le vrai problème de cette pièce est son identité, pas sa taille

Le bureau existe sous au moins quatre formes, et elles n'ont ni la même
géométrie, ni le même statut dans le programme :

| Forme | Nature | Statut TechnoHab |
|---|---|---|
| Bureau fermé | pièce autonome | ce profil |
| Coin bureau dans le séjour | **zone** d'une pièce hôte | lot L2, capacité manquante |
| Bureau dans une chambre | **équipement** de la chambre | `desk`, actif en chambre enfant dès 11 m² |
| Chambre d'amis convertible | pièce **bivalente** | aucun mécanisme |

La décision du 26 août est appliquée : le bureau est une fonction. Elle peut
être hébergée comme équipement d'une chambre, devenir plus tard une zone du
séjour, ou émerger comme pièce autonome. Le présent profil C4 éprouve cette
dernière forme, désormais activée dans le questionnaire et le générateur.
La bivalence reste une variante d'enveloppe : les programmes travail et
chambre sont vérifiés séparément, sans additionner simultanément leurs meubles.

Un ou deux utilisateurs, rarement simultanés. Occupation longue et immobile,
comme la chambre — d'où le poids de la lumière et de l'acoustique, que le plan
2D capte mal.

## 2. Équipements

| Équipement | Minimal | Moyen | Large | Nature | Emprise 2D |
|---|---|---|---|---|---|
| Plateau de travail | obligatoire | obligatoire | obligatoire | fonctionnel | **oui** |
| Chaise de bureau | obligatoire | obligatoire | obligatoire | fonctionnel | **oui** — 0,50 × 0,50 |
| Rangement documents | recommandé | oui | oui | fonctionnel | **oui**, dès 7 m² |
| Éclairage de poste | obligatoire | obligatoire | obligatoire | confort | non |
| Prises et réseau | obligatoire | obligatoire | obligatoire | fonctionnel | non |
| Second poste | — | option | oui | fonctionnel | oui — non prévu |
| Fauteuil de lecture | — | — | option | confort | oui |
| Couchage d'appoint | — | option | oui | fonctionnel | oui — voir §5 |
| Fenêtre | souhaitable | souhaitable | souhaitable | confort | **contrainte de baie** |

Le socle porte trois équipements : `desk` et `office_chair` requis,
`bookcase` optionnel dès 7 m². Le dernier est `assumed: true` — sa longueur est
la convention `MODULE = 1,20`.

**Décision du 24 septembre : la chaise a sa propre emprise.** Le plateau ne
porte plus une bande fictive contenant siège et mouvement. `office_chair`
occupe 0,50 × 0,50 m et protège derrière elle 0,60 m au minimum, 0,80 m en
cible et 0,90 m en confort. La chaise et le plateau forment un poste de travail
indivisible : la chaise reste dans l'axe du plateau, lui fait face et conserve
un écart maximal de 0,20 m. Cette relation et son recul arrière sont des
contraintes dures.

## 3. Dimensions des équipements

| Objet | Compact | Standard | Grand | Statut |
|---|---|---|---|---|
| Plateau | 1,20 × 0,60 | 1,40 × 0,70 | 1,80 × 0,80 | `O1` `[S3]` pour le minimum |
| Bibliothèque | 0,80 × 0,35 | **1,20 × 0,35** | 2,00 × 0,35 | profondeur `[S3]` `G3` ; longueur `N3` |
| Caisson bas | — | 0,45 × 0,60 | 0,60 × 0,60 | `N3`, non prévu |

Trois cotes de la source sont **hors périmètre 2D** et méritent d'être notées
pour ne pas passer pour oubliées : hauteur de plateau 0,72–0,75 m (`O3`),
distance œil–écran 0,50–0,70 m (`O4`), et la hauteur des rangements.

## 4. Enveloppes d'usage

```text
PHYSICAL_FOOTPRINT     plateau, chaise, rangements
EXCLUSIVE_USAGE_ZONE   aucune
SHARED_USAGE_ZONE      recul derrière la chaise, devant les rangements
TEMPORARY_SWING_ZONE   débattement de porte
ACCESS_ZONE            porte → poste
```

| Dégagement | `HARD_MIN` | `TARGET` | `COMFORT` | Statut |
|---|---:|---:|---:|---|
| Recul derrière la chaise | **0,60** | 0,80 | 0,90 | décision C-P4b du 24 septembre |
| Devant la bibliothèque | 0,60 | 0,70 | 1,00 | socle : 0,60 ; `G7` demande 0,70 |
| Passage résiduel | 0,60 | 0,70 | 0,90 | `N3` |

**L'écart de la fiche de sourcing est explicité.** Elle relevait un recul de
0,80 m et demandait 0,90. Le socle distingue désormais 0,60 m comme minimum
dur, 0,80 m comme cible et 0,90 m comme confort. Ces trois niveaux sont portés
par la chaise elle-même.

Reste le dégagement de bibliothèque à 0,60 m, sous les 0,70 du coulissant — mais
une bibliothèque **ouverte** n'a pas de zone de service propre du tout : on y
accède depuis le passage. C'est le cas-test signalé par
[`rangements.md`](rangements.md) §4, et le socle lui donne une valeur là où il
faudrait zéro plus un passage.

## 5. Trois classes dimensionnelles

Emprises **dérivées** de la source, puis contrôlées dans le domaine compilé :

| Configuration | Emprise | Calcul |
|---|---|---|
| Poste seul, recul haut | 1,20 × 1,70 = **2,04 m²** | `O1` + `O2` à 1,10 |
| Poste standard | 1,40 × 1,80 = 2,52 m² | plateau 1,40 × 0,70 |
| Poste + rangement derrière | 1,40 × 2,20 = 3,08 m² | + 0,40 de rangement |

### MINIMAL — 5 à 7 m²

Poste, siège, une bibliothèque. Pas de second poste, pas de couchage.

### MOYEN — 7 à 10 m² · **cas de référence**

Poste, bibliothèque dès 7 m², caisson, éventuellement un couchage d'appoint.

### LARGE — 10 à 14 m²

Deux postes, rangement fermé, fauteuil. **Au-delà de 14 m², les gains sont
faibles** : un bureau plus grand ne fait pas mieux travailler, il devient une
pièce polyvalente — et c'est alors une autre pièce qu'il faut nommer.

### Le 9 m² hérité, et ce qu'il faut en faire

Le référentiel Python posait 9 m² en minimum. La fiche de sourcing note que
c'est « le plus éloigné du calcul de toutes les typologies : un facteur 3 par
rapport à l'emprise réelle », et propose l'explication juste : **il est
vraisemblablement décalqué de la chambre** — ce qui se défend si le bureau doit
rester convertible, « mais alors c'est cette raison qu'il faut écrire, pas la
surface ».

Ce profil tranche dans ce sens. Le plancher du bureau ne doit pas être un
nombre hérité, mais l'expression d'une **contrainte de convertibilité** :

```text
convertible_en_chambre : true | false
si true  → plancher = plancher chambre enfant (9 m²)
si false → plancher = 5 m², dérivé de l'emprise du poste
```

C'est plus honnête et plus utile qu'un seuil unique : la convertibilité est un
vrai besoin — une chambre d'amis qui sert de bureau — et l'exprimer permet au
moteur de la servir au lieu de la subir. Elle rejoint la variante « pièce
bivalente » du §1, qu'aucun mécanisme ne porte aujourd'hui.

## 6. Règles d'agencement

| Relation | Niveau |
|---|---|
| Plateau contre un mur | `REQUIRED` — `anchor: 'wall'` |
| **Poste perpendiculaire à une baie** | `PREFERRED` — `O5`, voir ci-dessous |
| Poste dos à la porte | `UNDESIRABLE` |
| Poste face à un mur aveugle | `UNDESIRABLE` |
| Écran face à une fenêtre | `UNDESIRABLE` — contre-jour |
| Bibliothèque accessible sans quitter le siège | `PREFERRED` |
| Débattement de porte sur le siège reculé | `FORBIDDEN` (`S3`) |
| Couchage d'appoint empiétant sur le recul | `FORBIDDEN` |

### `O5` est devenue faisable, et personne ne l'a remarqué

La fiche de sourcing écrivait : `O5` est « la seule règle d'orientation
géométriquement exprimable de toutes les fiches : elle lie un composant à une
baie. Elle reste hors de portée tant que le moteur ne modélise pas les
ouvertures. » Et l'écart n° 4 la renvoyait au dossier « évolution
structurelle ».

**Vérifié le 26 août : le moteur pose des fenêtres.** `generator.js` produit des
ouvertures `fenetre_N` portant leur pièce, leur côté extérieur, leur position et
leur réservation dans le mur. La condition posée par la fiche est remplie.

C'est le **second cas** rencontré dans ce dossier d'une règle déclarée
infaisable devenue faisable sans que personne l'écrive — après le triangle
d'activité de la cuisine, débloqué par l'éclatement des pôles. Le motif est
constant : le moteur progresse plus vite que la relecture des fiches.

## 7. Circulations

```text
PORTE → SIÈGE           principale, unique
SIÈGE → BIBLIOTHÈQUE    secondaire, idéalement sans se lever
```

La circulation la plus pauvre du logement : une pièce, un poste, un trajet. Le
seul conflit possible est le **recul du siège** — 0,90 m derrière le plateau —
qui croise l'accès à la porte ou aux rangements. C'est peu, mais c'est la
totalité du sujet.

Cul-de-sac non seulement acceptable mais souhaitable : un bureau traversé perd
sa fonction primaire d'isolement.

## 8. Porte et accès

| Solution | Rang |
|---|---|
| Battante vers l'intérieur, contre un mur libre | `BEST` |
| Coulissante | `ACCEPTABLE` — réserve acoustique |
| Battante recouvrant le recul du siège | `FORBIDDEN` (`S3`) |
| Poste visible depuis la porte, dos tourné | `UNDESIRABLE` |

Une seule porte. Le bureau est, avec la chambre, une pièce dont la fermeture
fait partie de la fonction : l'isolement acoustique n'est pas un confort, c'est
la condition du travail.

## 9. Formes de la pièce

| Forme | Pertinence | Réserve |
|---|---|---|
| Rectangle | **excellente** | poste sur un petit côté, baie en face ou de côté |
| Carré | excellente | ≥ 2,50 × 2,50 |
| Rectangle allongé | acceptable | le poste s'accommode d'une pièce étroite mieux qu'aucune autre |
| L | acceptable | le décrochement fait rangement |
| Sous rampant | acceptable | hauteur non modélisée |

Le bureau est la pièce la **plus tolérante à la forme** de tout le logement :
un poste occupe 1,40 × 1,80 et se pose dans presque n'importe quel rectangle.
C'est précisément ce qui en fait un bon candidat aux surfaces résiduelles — et
un mauvais candidat au surdimensionnement.

## 10. Archétypes

**A — poste perpendiculaire à la baie, classe Moyenne.**

```text
        fenêtre
┌────  ══════  ────┐
│ ▬▬▬▬▬▬▬        │ │  ← plateau perpendiculaire :
│ plateau        │ │     lumière latérale, pas de
│                │b│     contre-jour ni de reflet
│                │i│
└──────   ───────┴─┘
      porte           b = bibliothèque
```

**B — mauvaise configuration : écran face à la baie.**

```text
        fenêtre
┌────  ══════  ────┐
│    ▬▬▬▬▬▬▬       │  ← contre-jour permanent :
│    plateau       │     la source décrit exactement
│                  │     ce défaut
└──────   ─────────┘
```

**C — mauvaise configuration : porte sur le recul.**

```text
┌──────────────────┐
│ ▬▬▬▬ plateau ▬▬▬ │
│      ↓ recul     │
└───  ─────────────┘
   porte  ← le battant balaie le siège reculé
```

Les configurations B et C sont l'une et l'autre **calculables aujourd'hui** :
les fenêtres existent, les débattements attendent `S3`.

## 11. Relations avec les autres pièces

| Relation | Niveau | Motif |
|---|---|---|
| ↔ circulation | `FAVORABLE` | desserte neutre |
| ↔ entrée | `FAVORABLE` | accueil professionnel sans traverser le logement |
| ↔ chambre | `NEUTRAL` | zone calme commune |
| ↔ séjour | `UNDESIRABLE` | bruit — sauf si le bureau est une **zone** du séjour |
| ↔ cuisine | `UNDESIRABLE` | bruit, odeurs |
| ↔ pièce d'eau | `UNDESIRABLE` | bruit d'écoulement |
| Traversée par une circulation | `FORBIDDEN` | détruit l'isolement |

Le bureau appartient à la **zone calme**, avec les chambres, alors que sa
fonction est diurne. C'est la seule pièce du logement qui échappe au partage
jour / nuit — et cela suffit à montrer que ce partage, réclamé par plusieurs
profils, n'est pas une bipartition simple mais une classification par nuisance.

Si le logement accueille une activité recevant du public, l'adjacence à
l'entrée cesse d'être un confort et devient structurante. Hors périmètre V1.

## 12. Contraintes techniques

```text
REQUIRED_SERVICES  electricite, reseau
```

Aucune contrainte humide. Une exigence propre : **le réseau de données**, filaire
ou non, et un nombre de prises supérieur à la moyenne des pièces. Le socle n'a
pas de service `reseau` ; l'ajouter serait cohérent avec la granularité
existante (`eau`, `evacuation`, `electricite`, `ventilation`), et cette pièce
est la seule qui le réclame vraiment.

## 13. Réglementation française

| Point | Portée | Statut |
|---|---|---|
| Pièce principale ≥ 9 m², ou 20 m³ | Décret n° 2002-120 — **location** | `VAL-DEC-001` — s'applique **si** la pièce est comptée comme principale |
| Hauteur sous plafond ≥ 2,20 m | même article | hors 2D |
| Local professionnel dans un logement | changement d'usage, règles locales | **non traité** — hors périmètre |

**Aucune obligation propre au bureau.** Sa qualification juridique dépend de ce
qu'on en fait : pièce principale s'il est compté comme tel, annexe sinon. C'est
une raison de plus de trancher son statut avant de le générer — le nombre de
pièces principales change le calcul de décence, et donc les débits de
ventilation de tout le logement (`REF-009`).

Cette dépendance mérite d'être signalée : **ajouter un bureau modifie une
grandeur qui concerne d'autres pièces.** Aucun autre type du socle n'a cet
effet.

## 14. Accessibilité

```text
SIZE_CLASS     MINIMAL | MEDIUM | LARGE
ACCESSIBILITY  STANDARD | ADAPTABLE | ACCESSIBLE
```

Le bureau ne figure **pas** dans l'unité de vie accessible : `VAL-PMR-020` la
compose d'une cuisine, d'un séjour, d'une chambre, d'une salle d'eau et des
sanitaires. Aucune exigence ne s'y applique donc, sauf à le compter comme la
chambre de l'unité de vie — ce que la convertibilité du §5 rendrait possible.

En mode `ACCESSIBLE`, deux effets : plateau dégagé en dessous pour les genoux —
donc pas de caisson fixe — et aire de rotation Ø 1,50 m, qui porte la pièce
autour de 9 m². On retombe sur le seuil hérité, cette fois pour une raison
écrite.

## 15. Critères de qualité spatiale

| Variable | Ce qu'elle capte ici |
|---|---|
| `daylight_orientation` | poste perpendiculaire à la baie — **désormais calculable** |
| `screen_backlight` | écran face à une fenêtre |
| `desk_clearance` | recul réel derrière le plateau |
| `door_conflicts` | battant sur le siège reculé |
| `acoustic_isolation` | distance aux pièces bruyantes |
| `convertibility` | la pièce accepte-t-elle un lit ? |
| `dead_space` | surface au-delà de 14 m² sans usage |

```text
poste_perpendiculaire_a_la_baie  = favorable     # CALCULABLE, non calculé
ecran_face_a_la_baie             = defavorable   # CALCULABLE, non calculé
door_fixture_conflict            = INVALID
bureau_traverse                  = INVALID
bureau_adjacent_piece_bruyante   = defavorable
surface_au_dela_de_14m2          = defavorable, croissant
```

`convertibility` est un critère d'un genre nouveau : il ne mesure pas la qualité
de l'usage présent mais la **capacité à en accueillir un autre**. Aucun autre
profil n'en a eu besoin, et il est le seul moyen d'exprimer proprement le
9 m² hérité.

## 16. Synthèse

| Paramètre | Minimal | Moyen | Large |
|---|---:|---:|---:|
| Surface cible | 5 – 7 m² | **7 – 10 m²** | 10 – 14 m² |
| Si convertible en chambre | 9 m² | 9 – 12 m² | 12 – 16 m² |
| Emprise du poste | 1,20 × 1,70 | 1,40 × 1,80 | 1,40 × 2,20 |
| Recul | 0,90 m | 1,00 m | 1,10 m |
| Postes | 1 | 1 | 2 |
| Bibliothèque | option | dès 7 m² | ✓ |
| Couchage d'appoint | non | option | ✓ |
| Baie | souhaitable | souhaitable | souhaitable |
| Formes | toutes | rectangle, carré | rectangle, carré |

## 17. Traduction TechnoHab

```text
ROOM_TYPE    BUREAU
FAMILY       DAY_ROOM · zone calme
ROLE         principale
AGREMENT     0.6
MIN_PROGRAM  5.00 / 1.80  ·  9.00 / 2.50 si convertible_en_chambre
MAX_RATIO    ~2.0 × besoin                       # plafond doctrinal N3, ≈ 14 m²
TRIGGER      count(from: offices, variantFrom: officeVariant)
SERVICES     electricite, reseau                 # `reseau` MANQUANT au socle

REQUIRED_OBJECTS
- desk        1.20 × 0.60 min · gamme 1.20 / 1.40 / 1.80
- office_chair 0.50 × 0.50, requis avec le plateau
OPTIONAL_OBJECTS
- bookcase    minRoomArea 7, assumed
- drawer_unit minRoomArea 9
- sofa_bed    si convertible

FUNCTIONAL_ZONES
- chair_back     0.60 HARD / 0.80 TARGET / 0.90 COMFORT, shared
- shelf_front    0 propre + passage                 # cas-test du champ `passage`
- door_swing     exclusive si battante              # MANQUANT

HARD_CONSTRAINTS
- plateau, chaise et recul propre de la chaise logés
- S3 : le battant ne balaie ni la chaise ni son recul
- S4
- non traversée par une circulation
SOFT_CONSTRAINTS
- poste perpendiculaire à une baie                  # CALCULABLE depuis les fenêtres
- écran non face à la fenêtre
- poste non dos à la porte
- éloigné des pièces bruyantes
- convertibilité, si demandée

PREFERRED_ADJACENCIES     circulation, entree, bedroom
UNDESIRABLE_ADJACENCIES   living, kitchen, bath, wc
FORBIDDEN_RELATIONS       traversee(bureau)

DECISIONS
- fonction hébergée ou émergente selon `DECISIONS_PROGRAMME.md`
- pièce autonome classée principale ; activation produit livrée par L1

SIZE_CLASSES    MINIMAL | MEDIUM | LARGE
ACCESSIBILITY   STANDARD | ADAPTABLE | ACCESSIBLE
QUALITY_EXTRA   daylight_orientation, convertibility, acoustic_isolation
```

---

## Annexe — écarts au moteur, au 26 août 2026

**Corrigé depuis la fiche de sourcing :** le recul est maintenant gradué en
minimum 0,60 m, cible 0,80 m et confort 0,90 m, chacun attaché à la chaise.

**Caduc :** l'écart n° 4 — « `O5` demande la géométrie des baies, à verser au
dossier évolution structurelle » — **ne tient plus.** Le moteur pose des
fenêtres avec leur côté, leur position et leur réservation. La règle
d'orientation du poste est calculable dès aujourd'hui. C'est le second cas du
dossier, après le triangle d'activité de la cuisine.

**Restent après C-P4b :**

1. **la zone de séjour n'est pas activée** — elle attend toujours F3 ;
2. **la convertibilité reste une alternance de programmes** — le témoin C4
   vérifie que la même enveloppe accepte séparément travail et chambre ; la
   composition temporelle complète appartient à C-P5 ;
3. **le dégagement de bibliothèque à 0,60 m** — une bibliothèque ouverte ne
   demande aucun dégagement propre, seulement un passage. Le socle lui donne une
   valeur là où il faudrait zéro ;
4. **le service `reseau` n'existe pas** — seule pièce à le réclamer vraiment ;
5. **compter le bureau comme pièce principale change les débits de ventilation
   de tout le logement** (`REF-009`) et le calcul de décence. Aucun autre type
   du socle n'a d'effet hors de lui-même ; ce couplage devra être explicite
   avant l'activation.
