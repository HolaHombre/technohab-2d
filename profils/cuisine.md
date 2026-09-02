# Profil de pièce — Cuisine

**`KITCHEN` · composition possible dans `living` · maturité `C4` · 1er septembre 2026**

Vague **C-P1**. Gabarit : [`GABARIT_PIECE.md`](../GABARIT_PIECE.md). Source de
valeurs : [`agencement/cuisine.md`](../agencement/cuisine.md), la mieux sourcée
du dossier — adossée à un guide technique d'éditeur CAO, et non à des sources
éditoriales comme le séjour.

**C'est la pièce la mieux modélisée du socle** : cinq équipements
individualisés, cinq relations dont **la seule relation `HARD` de tout le
référentiel**. Ce profil relève donc moins d'écarts que les précédents, et
davantage de capacités devenues disponibles sans que personne les ait
utilisées.

---

## 1. Définition fonctionnelle

```text
ROOM_TYPE    KITCHEN
FAMILY       SERVICE_ROOM
COMPOSITION  versée dans living si la cuisine est ouverte

PRIMARY_FUNCTIONS
- stocker : sec, froid, ménager
- laver : denrées, vaisselle
- préparer
- cuire
- déposer et servir

SECONDARY_FUNCTIONS
- prendre un repas rapide
- trier les déchets
- ranger l'électroménager et le nécessaire d'entretien
- parfois : laver le linge
```

**La cuisine est la seule pièce dont la fonction est une séquence, pas une
liste.** Stockage → lavage → préparation → cuisson → dépose. L'ordre n'est pas
une préférence d'agencement : inverser deux postes oblige à traverser la pièce
à chaque geste, avec les mains pleines et parfois brûlantes. C'est ce qui
justifie qu'elle porte la seule relation `HARD` du socle.

Un à deux utilisateurs actifs, davantage en présence. La simultanéité est
partielle : deux personnes peuvent cuisiner ensemble, mais elles se croisent —
d'où l'importance du passage entre linéaires opposés, et non seulement du
dégagement devant chaque appareil.

## 2. Équipements

| Équipement | Minimal | Moyen | Large | Nature | Emprise 2D |
|---|---|---|---|---|---|
| Évier | obligatoire | obligatoire | obligatoire | fonctionnel | **oui** |
| Plaque de cuisson | obligatoire | obligatoire | obligatoire | fonctionnel | **oui** |
| Plan de travail | obligatoire | obligatoire | obligatoire | fonctionnel | **oui**, voir §3 |
| Réfrigérateur | obligatoire | obligatoire | obligatoire | fonctionnel | **oui** |
| Hotte ou extraction | obligatoire | obligatoire | obligatoire | **réglementaire** `REF-009` | non — `service` |
| Rangements hauts et bas | obligatoire | obligatoire | obligatoire | fonctionnel | inclus dans le linéaire |
| Four | recommandé | oui | oui | confort | inclus sous le plan |
| Lave-vaisselle | — | oui, dès 9 m² | oui | confort | **oui** |
| Poubelle de tri | oui | oui | oui | fonctionnel | négligeable |
| Micro-ondes | option | oui | oui | confort | sur plan |
| Îlot | — | — | option | confort | **oui** — proposé, non activé |
| Péninsule, coin repas | — | option | oui | confort | oui |
| Cellier attenant | — | option | oui | fonctionnel | pièce distincte, C-P3 |
| Lave-linge | option | option | option | fonctionnel | à trancher avec la buanderie |

**L'éclatement en pôles individualisés, réclamé par la fiche de sourcing, est
fait.** Elle notait que le triangle d'activité et l'ordre des zones resteraient
« inaccessibles tant que la cuisine est un composant monolithique », avec pour
prérequis d'« éclater `kitchen` en `sink`, `cooktop`, `fridge` ». Le socle porte
aujourd'hui cinq équipements distincts. Le prérequis est levé : le triangle
d'activité est écrit depuis C-P1.2c ; l'ordre fonctionnel complet au-delà de
la séquence évier–plan–plaque reste à instruire — voir §15.

## 3. Dimensions des équipements

| Objet | Compact | Standard | Grand | Statut |
|---|---|---|---|---|
| Évier | 0,60 × 0,60 | 0,60 × 0,60 | 1,20 × 0,60 *(double bac)* | `VAL-EQ-010` |
| Plaque | 0,60 × 0,60 | 0,60 × 0,60 | 0,90 × 0,60 | `VAL-EQ-010` |
| Réfrigérateur | 0,60 × 0,60 | 0,60 × 0,60 | 0,90 × 0,70 *(américain)* | `VAL-EQ-016` |
| Lave-vaisselle | 0,45 × 0,60 | 0,60 × 0,60 | 0,60 × 0,60 | `VAL-EQ-015` |
| Profondeur de plan | 0,60 | 0,65 | 0,70 | `C1` `[S]` |
| Linéaire minimal | **2,40 m** | 3,00 m | 4,00 m + | `[D]` = 4 × 0,60 |

### Le plan de travail n'est pas un meuble de 0,60 × 0,60

Le socle lui donne une emprise carrée fixe. Or `SOCLE_AGENCEMENT.md` le décrit
comme « 0,60 **minimum** entre évier et plaque » : une **longueur minimale**,
pas une emprise. Sa vraie nature est un **linéaire dont la longueur résulte de
la pose** — il joint l'évier à la plaque, quelle que soit leur distance.

`GAMMES_EQUIPEMENTS.md` §6 a tranché : ce n'est pas une gamme, c'est un
mécanisme distinct (`extent: { min, max, depth }`), et c'est une extension du
**solveur**, pas de la donnée — `placement.js` pose des emprises connues avant
la pose, et un équipement dont l'emprise est un *résultat* de la pose n'est
traité ni par `validate()`, ni par `envelope()`, ni par le cache. À traiter
après les gammes, jamais dans le même lot.

Conséquence pratique aujourd'hui : la cuisine est dimensionnée comme si son
plan de travail faisait 60 cm de long. La longueur de 2,40 m dérivée de la
séquence — quatre modules de 0,60 — n'est vérifiée nulle part.

## 4. Enveloppes d'usage

```text
PHYSICAL_FOOTPRINT     évier, plaque, plan, réfrigérateur, lave-vaisselle
EXCLUSIVE_USAGE_ZONE   aucune déclarée
SHARED_USAGE_ZONE      devant chaque appareil, et la circulation
TEMPORARY_SWING_ZONE   porte de four, de lave-vaisselle, de réfrigérateur
ACCESS_ZONE            porte → chacun des cinq pôles
FACING_ZONE            entre deux linéaires opposés     ← consommé par placement.js
```

| Dégagement | `HARD_MIN` | `TARGET` | `COMFORT` | Statut |
|---|---:|---:|---:|---|
| Devant un appareil — **service** | 0,75 | 0,90 | 1,00 | `[S]`/`[D]` ; socle : **0,90** |
| Passage traversant — **circulation** | 1,20 | 1,20 | 1,50 | `C7` `[S]` |
| Entre deux linéaires opposés | 1,20 | 1,20 | 1,50 | `C7` ; **`facingClearance: 1.20` au socle** |
| Retrait réfrigérateur / mur | 0,05 | 0,20 | 0,20 | `C6` `[S]` — ventilation, hors 2D |
| Triangle d'activité, somme des côtés | — | ≤ 6,50 m | — | `C8` `[S]` — **maximum** |

### Service et passage ne s'additionnent pas — et le socle ne les distingue pas

L'arbitrage du 17 août est net : la zone de service (ouvrir un four, s'accroupir
devant un caisson) et le passage (transiter) **occupent le même sol**. Le
passage englobe le service, il ne s'y ajoute pas. D'où une largeur de pièce de
`max(0,65 + 0,75 ; 0,65 + 1,20) = 1,85 m`, jamais leur somme.

Le socle porte une valeur unique de 0,90 m devant chaque appareil — **entre**
les deux notions, et ne correspondant à aucune. La conséquence est double :
la zone de service est surévaluée de 15 cm, le passage sous-évalué de 30 cm.
L'arbitrage prescrivait d'ajouter « un champ `passage`, distinct de
`clearance` » ; il n'a pas été fait.

### `facingClearance` existe et personne ne le lit

Le type `kitchen` déclare **`facingClearance: 1.20`** (`socle.data.js:165`).
Vérifié le 26 août : **c'est la seule occurrence du mot dans tout le dépôt.**
Aucun code ne le consulte.

C'est le troisième champ mort découvert dans le socle, après `minimalRect` du
WC et les `trigger` sans interpréteur. Il mérite mieux que les deux autres : la
donnée est juste, sourcée `C7`, et c'est exactement la grandeur que la vNext a
rattachée au lot M2 sous le nom de « passage libre entre deux équipements qui
se font face ». **Le mécanisme manque, pas la valeur.**

## 5. Trois classes dimensionnelles

Domaine **mesuré** : le plus petit rectangle meublable est **1,20 × 2,10 =
2,52 m²** avec les quatre équipements requis. C'est très en dessous des 4,44 m²
que la fiche dérive du linéaire — parce que le plan de travail y est un carré
de 0,60 et non un linéaire de 2,40, et parce que le passage de 1,20 n'est pas
vérifié.

### MINIMAL — 4,5 à 7 m²

Linéaire simple ou en L, largeur libre ≥ 1,85 m. Évier, plaque, plan,
réfrigérateur. Ni lave-vaisselle, ni coin repas.

**Le seuil de 4,5 m² n'est pas décrété, il est calculé** : 2,40 × 1,85 = 4,44,
arrondi. C'est le plus bel exemple du projet d'un seuil `HARD` dérivé plutôt
que convenu — et **il n'est codé nulle part**.

### MOYEN — 7 à 11 m² · **cas de référence**

Implantation en L ou parallèle, largeur ≥ 2,50 m si deux linéaires se font
face. Lave-vaisselle dès 9 m². C'est la classe où `facingClearance` commence à
mordre.

### LARGE — 11 à 20 m²

En U, ou avec îlot ou péninsule. L'îlot demande 1,20 m de dégagement **sur tout
son pourtour**, ce qui en fait l'équipement le plus contraignant du socle après
l'emplacement de véhicule — d'où sa non-activation, prudente.

**Au-delà de 20 m², les gains deviennent faibles** : le triangle d'activité est
borné à 6,50 m, donc une cuisine plus grande fait *marcher davantage* pour
cuisiner autant. La surface est mieux placée en cellier attenant ou en coin
repas.

### Le plancher du socle diverge, et c'est assumé

`minProgramArea: 7` n'est pas la règle de validité (4,5) mais une **cible
d'allocation**, volontairement plus stricte, qui pilote la génération. La fiche
le dit : « divergence assumée et documentée, pas une dette ». Ce profil la
confirme — c'est le bon usage de la distinction entre meublabilité et dignité
d'usage posée par `MODELE_EXIGENCES.md` §1 bis.

`minProgramSide` vaut désormais **1,85 m** au socle, égal au seuil dérivé.

## 6. Règles d'agencement

| Relation | Niveau |
|---|---|
| Plan de travail entre évier et plaque | `REQUIRED` — `KITCHEN-SEQUENCE-001`, **`HARD`, actif** |
| Évier et plan sur le même mur | `PREFERRED` — `KITCHEN-ALIGN-001`, actif |
| Plaque et plan sur le même mur | `PREFERRED` — `KITCHEN-ALIGN-002`, actif |
| Réfrigérateur à moins de 2,40 m du plan | `PREFERRED` — `KITCHEN-COLD-001`, actif |
| Ordre stockage → lavage → préparation → cuisson | `PREFERRED` — non écrit |
| Triangle d'activité ≤ 6,50 m | `GUIDELINE` — `KITCHEN-TRIANGLE-001`, **actif** |
| Plaque en extrémité de linéaire | `UNDESIRABLE` — pas de zone de dépose |
| Plaque adjacente au réfrigérateur | `UNDESIRABLE` — chaud contre froid |
| Plaque sous une fenêtre | `UNDESIRABLE` |
| Évier loin de l'évacuation | `UNDESIRABLE` — réseau |
| Débattement de four ou de lave-vaisselle sur le passage | `FORBIDDEN` — non vérifiable |

**Cinq relations actives, dont la seule `HARD` du socle.** C'est le meilleur
banc d'essai du mécanisme de relations, et il fonctionne : la séquence est
vérifiée par le retour arrière du solveur, pas seulement par un score.

Le triangle d'activité (`C8`) est un **maximum** exprimé par la relation
générique `perimeter-max`. Il reste `GUIDELINE` : le moteur le mesure et le
préfère sans inventer une interdiction. L'ordre complet stockage → lavage →
préparation → cuisson reste à écrire ; le noyau évier–plan–plaque est déjà
tenu par `KITCHEN-SEQUENCE-001`.

## 7. Circulations

```text
RÉFRIGÉRATEUR → PLAN      sortir les denrées
ÉVIER → PLAN              laver puis préparer
PLAN → PLAQUE             cuire
PLAQUE → DÉPOSE           servir
PORTE → chacun des pôles
CUISINE → COIN REPAS      service
```

La circulation interne d'une cuisine n'est pas un accès, c'est un **cycle**.
C'est ce que mesure le triangle d'activité : la somme des trajets répétés des
dizaines de fois par repas. Aucune autre pièce n'a cette propriété — ailleurs,
on va à l'objet et on revient.

Deux personnes qui cuisinent se croisent : c'est le passage de 1,20 m qui le
permet, pas les 0,90 m de service. Une cuisine traversée par la circulation
générale du logement — vers un cellier, un garage, un extérieur — voit ce
cycle coupé à chaque passage. À pénaliser.

## 8. Porte et accès

| Solution | Rang |
|---|---|
| Une porte, hors du linéaire | `BEST` |
| Passage ouvert sur le séjour | `BEST` en cuisine ouverte |
| Porte coulissante | `ACCEPTABLE` |
| Porte battante empiétant sur le passage de service | `UNDESIRABLE` |
| Cuisine traversée vers cellier, garage ou extérieur | `UNDESIRABLE` — coupe le cycle |
| **Porte vers un WC ou un cabinet d'aisances** | `FORBIDDEN` — `REF-008` |
| Débattement sur un appareil | `FORBIDDEN` (`S3`) |

Chaque porte retranche du **linéaire**, qui est la ressource rare de cette
pièce. Une cuisine de 8 m² avec trois ouvertures peut être moins fonctionnelle
qu'une cuisine de 6 m² avec une seule : c'est le même critère que
`wall_continuity` au séjour, appliqué à une ressource différente.

## 9. Formes de la pièce

| Forme | Implantation permise | Largeur libre requise | Pertinence |
|---|---|---|---|
| Rectangle étroit | linéaire, 1 mur | 1,85 m | **excellente** en Minimal |
| Rectangle | parallèle, 2 murs opposés | 2,50 m | excellente en Moyen |
| Carré | en L, 2 murs adjacents | 1,85 m par côté | excellente |
| Carré large | en U, 3 côtés | 2,50 m | Large |
| Avec îlot | — | 0,65 + 1,20 + îlot + 1,20 + 0,65 | Large seulement |
| L | subie | — | acceptable si le décrochement fait cellier |

**La cuisine est la pièce dont la forme détermine le plus directement le
programme** : la largeur libre décide de l'implantation, donc du linéaire
disponible, donc des équipements. C'est l'inverse de la démarche du moteur, qui
alloue une surface puis meuble. Ici, la chaîne correcte est visible et
courte — largeur → implantation → linéaire → surface.

## 10. Archétypes d'implantation

**A — linéaire, classe Minimal.** Largeur libre 1,85 m.

```text
┌────────────────────────┐
│ frigo│plan│évier│plaque│
│                        │
│      passage 1,20      │
└──────────   ───────────┘
          porte
```

**B — en L, classe Moyenne.** Le linéaire tourne, le cycle raccourcit.

```text
┌──────────────────┐
│ frigo│plan│évier │
│                  │─┐
│                  │p│
│                  │l│
│                  │aq│
└────   ───────────┴─┘
    porte
```

**C — parallèle, classe Moyenne.** Largeur 2,50 m, `facingClearance` s'applique.

```text
┌──────────────────────┐
│ évier │ plan │ plaque│
│                      │
│   ← 1,20 min →       │
│ frigo │   rangements │
└─────────   ──────────┘
         porte
```

**D — mauvaise configuration : la séquence rompue.**

```text
┌────────────────────────┐
│ évier│plaque│plan│frigo│  ← plan de travail après la
│                        │     cuisson, froid à l'extrémité
└──────────   ───────────┘
```

La configuration D est **refusée par le socle** : `KITCHEN-SEQUENCE-001` est
`HARD` et le retour arrière la rejette. C'est le seul archétype fautif de tous
les profils écrits jusqu'ici que le moteur sache déjà refuser.

## 11. Relations avec les autres pièces

| Relation | Niveau | Motif |
|---|---|---|
| ↔ séjour ou coin repas | `VERY_FAVORABLE` | service des repas ; composition possible |
| ↔ cellier | `VERY_FAVORABLE` | stockage déporté ; attendu au lot C-P3 |
| ↔ gaine technique, buanderie | `FAVORABLE` | eau, évacuation, extraction mutualisées |
| ↔ extérieur, poubelles | `FAVORABLE` | sortie des déchets, hors V1 |
| ↔ entrée | `NEUTRAL` | courses |
| ↔ chambre | `UNDESIRABLE` | bruit, odeurs |
| **Communication directe avec un WC** | `FORBIDDEN` | `REF-008` |
| Traversée par la circulation générale | `UNDESIRABLE` | coupe le cycle d'usage |

L'interdiction `REF-008` est **la seule interdiction d'adjacence réglementaire
du logement**, et elle concerne cette pièce et le WC. Elle n'est tenue
aujourd'hui que par la forme en étoile du graphe, qui ne demande jamais une
arête `wc ↔ kitchen` — un effet de bord, pas une règle. Voir
[`wc-separe.md`](wc-separe.md) §11.

## 12. Contraintes techniques

```text
REQUIRED_SERVICES  eau_froide, eau_chaude, evacuation, ventilation, electricite (force)
```

Après la salle d'eau, la pièce la plus chargée : arrivée et évacuation d'eau,
circuit de force pour la plaque et le four, extraction au-dessus de la cuisson,
et éventuellement gaz.

Le type `kitchen` déclare désormais `services: ['ventilation']`. Les autres
services restent portés par les équipements (`sink` → eau et évacuation,
`hob` → électricité). Le regroupement technique entre pièces humides reste un
sujet de plan complet, pas une propriété prouvée par ce C4 isolé.

L'évier commande la position de l'évacuation ; regrouper cuisine, salle d'eau
et buanderie sur une colonne commune est le gain technique le plus net du plan.

## 13. Réglementation française

| Point | Portée | Statut |
|---|---|---|
| Sortie d'air permanente, débit majoré en cuisine | Arrêté du 24 mars 1982 | `REF-009` — **retenu** ; débits selon configuration |
| Le cabinet d'aisances ne communique pas directement avec la cuisine | RSD type | `REF-008` — **retenu** |
| Hauteur hotte / plaque 0,65 m | `C5`, donnée `[S]` marquée « obligatoire » | **à confirmer** — hors 2D, et l'obligation reste à sourcer |
| Cuisine dans l'unité de vie accessible | `VAL-PMR-020` | vérifié |
| 1,50 m de passage entre appareils en logement accessible | Arrêté du 24 décembre 2015, art. 13 | vérifié — largeur 2,15 m, surface 5,2 m² |
| Alimentation gaz, ventilation associée | — | **non traité** — hors périmètre |

**Aucun texte ne fixe de surface minimale de cuisine.** Les 4,5 m² sont
calculés, les 7 m² sont une cible d'allocation. La seule contrainte
dimensionnelle réglementaire est celle de l'accessibilité — 1,50 m entre
appareils — et elle ne s'applique qu'aux logements concernés par le CCH.

La mention « obligatoire » portée par `C5` sur la hauteur de hotte vient de la
source technique, pas d'un texte identifié. À ne pas propager comme obligation
réglementaire tant qu'elle n'est pas sourcée — c'est exactement le piège que le
gabarit demande d'éviter.

## 14. Accessibilité

```text
SIZE_CLASS     MINIMAL | MEDIUM | LARGE
ACCESSIBILITY  STANDARD | ADAPTABLE | ACCESSIBLE
```

- `STANDARD` — passage 1,20 m ;
- `ADAPTABLE` — réserver la possibilité de retirer un caisson sous l'évier et
  sous le plan, pour dégager les genoux. Non représentable aujourd'hui ;
- `ACCESSIBLE` — **1,50 m de passage entre appareils**, ce qui porte la largeur
  de pièce à 2,15 m et la surface minimale à 5,2 m². Plan et évier accessibles
  assis, donc dégagés en dessous ; aire de rotation Ø 1,50 m.

Fait notable : **la cuisine accessible n'est pas beaucoup plus grande** — 5,2
contre 4,5 m². Ce qui change est la **largeur libre** (2,15 contre 1,85), donc
la forme. Une fois de plus, l'accessibilité est une affaire de proportion et
non de surface, et une allocation qui raisonne en mètres carrés ne peut pas la
servir.

## 15. Critères de qualité spatiale

| Variable | Ce qu'elle capte ici |
|---|---|
| `work_triangle` | somme des trois côtés ≤ 6,50 m — `KITCHEN-TRIANGLE-001`, actif |
| `sequence_order` | stockage → lavage → préparation → cuisson le long du linéaire |
| `worktop_length` | longueur réelle de plan libre entre évier et plaque |
| `facing_clearance` | passage entre linéaires opposés — mécanisme générique actif |
| `linear_continuity` | linéaire total disponible, amputé par chaque ouverture |
| `through_traffic` | circulation générale traversant le cycle de travail |
| `network_complexity` | nombre de murs porteurs de réseaux |
| `door_conflicts` | four ou lave-vaisselle ouvrant sur le passage |

```text
triangle_au_dela_de_6m50        = defavorable
sequence_rompue                 = INVALID          # déjà tenu, KITCHEN-SEQUENCE-001
plan_de_travail_sous_2m40       = defavorable, fort
passage_entre_lineaires_sous_1m20 = INVALID        # facingClearance actif
plaque_en_extremite             = defavorable
plaque_contre_frigo             = defavorable
cuisine_traversee               = defavorable
appareils_sur_un_seul_mur_technique = favorable
```

**`work_triangle` est désormais calculé et `sequence_order` est tenu dans son
noyau fonctionnel.** Le premier est une préférence mesurée ; le second reste
bloquant pour la séquence évier–préparation–plaque. L'extension de l'ordre au
stockage et à la dépose reste différée.

## 16. Synthèse

| Paramètre | Minimal | Moyen | Large |
|---|---:|---:|---:|
| Surface cible | 4,5 – 7 m² | **7 – 11 m²** | 11 – 20 m² |
| Largeur libre | 1,85 m | 1,85 – 2,50 m | 2,50 m + |
| Implantation | linéaire, L | L, parallèle | U, îlot, péninsule |
| Linéaire | 2,40 m | 3,00 m | 4,00 m + |
| Lave-vaisselle | non | dès 9 m² | ✓ |
| Coin repas | non | option | ✓ |
| Cellier | non | option | ✓ |
| Passage | 1,20 m | 1,20 m | 1,20 – 1,50 m |
| Triangle | ≤ 6,50 m | ≤ 6,50 m | ≤ 6,50 m |
| Accessibilité | non | adaptable — 5,2 m², largeur 2,15 | intégrable |

## 17. Traduction TechnoHab

```text
ROOM_TYPE    KITCHEN
FAMILY       SERVICE_ROOM
COMPOSITION  versée dans living si openKitchen
ROLE         principale
AGREMENT     0.6
MIN_PROGRAM  7 / 1.85            # cible d'allocation ; validité HARD = 4.5, dérivée
MAX_RATIO    ~2.5 × besoin       # plafond doctrinal N3, ≈ 20 m²
SERVICES     eau, eau_chaude, evacuation, ventilation, electricite   # ventilation MANQUANTE

REQUIRED_OBJECTS
- sink, hob, fridge
- worktop        extent min 2.40, depth 0.65      # MANQUANT : linéaire, pas emprise fixe
OPTIONAL_OBJECTS
- dishwasher     minRoomArea 9
- island         minRoomArea 14, dégagement 1.20 sur tout le pourtour   # non activé
- oven, microwave                                  # sans emprise propre

FUNCTIONAL_ZONES
- appliance_service   0.75 HARD / 0.90 TARGET, shared    # distinct du passage
- through_passage     1.20 HARD / 1.50 ACCESSIBLE        # MANQUANT
- facing_clearance    1.20                               # DÉCLARÉ, JAMAIS LU
- appliance_swing     four, lave-vaisselle, réfrigérateur # MANQUANT

HARD_CONSTRAINTS
- les quatre pôles logés
- KITCHEN-SEQUENCE-001 : plan entre évier et plaque        # ACTIF
- largeur libre ≥ 1.85 (linéaire)                          # allocation active
- passage entre linéaires opposés ≥ 1.20                   # mécanisme actif
- extraction et évacuation raccordables
- S3, S4

SOFT_CONSTRAINTS
- triangle d'activité ≤ 6.50 m                             # GUIDELINE active
- ordre stockage → lavage → préparation → cuisson
- évier et plaque alignés au plan
- froid à moins de 2.40 m du plan
- appareils sur un ou deux murs techniques
- non traversée par la circulation générale

PREFERRED_ADJACENCIES     living, dining, cellier, buanderie, technical_core
UNDESIRABLE_ADJACENCIES   bedroom
FORBIDDEN_RELATIONS       door(kitchen, wc)                # REF-008

SIZE_CLASSES    MINIMAL | MEDIUM | LARGE
ACCESSIBILITY   STANDARD | ADAPTABLE | ACCESSIBLE
QUALITY_EXTRA   work_triangle, sequence_order, linear_continuity
```

---

## Annexe — état d'intégration au 1er septembre 2026

**Fermé par C-P1.2c.** L'éclatement en pôles, la séquence `HARD`, le passage
face-à-face, le maximum générique du triangle, la ventilation, le côté minimal
de 1,85 m et l'ouvrant du lave-vaisselle sont maintenant des données
consommées et testées. Douze identifiants du registre canonique relient les
valeurs aux usages. Cuisine séparée et composition ouverte sont éprouvées sans
perdre la fonction `COOK`.

**Écarts conservés après C4 :**

1. **le plan de travail reste une emprise fixe** là où sa longueur devrait
   résulter de la pose. C'est l'extension G4 du solveur, pas une nouvelle
   constante de donnée ;
2. **le four et le réfrigérateur n'ont pas encore d'ouvrant lié**. Le
   lave-vaisselle réserve correctement 1,20 m devant lui, mais son dégagement
   est encore porté comme zone d'usage plutôt que comme objet cinématique ;
3. **l'ordre fonctionnel complet** stockage → lavage → préparation → cuisson →
   dépose dépasse le noyau `KITCHEN-SEQUENCE-001` ;
4. **les réseaux sont déclarés mais non regroupés au plan complet** avec les
   autres pièces de service ;
5. **l'accessibilité et la preuve C5** restent hors de cette consolidation ;
6. **M4c ne couvre pas encore la cuisine** : son optionnel lave-vaisselle est
   validé en isolation, tandis que le générateur final conserve pour elle le
   programme minimal jusqu'à un enrôlement explicitement mesuré.
