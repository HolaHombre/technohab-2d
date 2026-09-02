# Profil transverse — Rangements

**`STORAGE` · profil transverse, pas un type de pièce · maturité `C4` limitée · 1er septembre 2026**

Vague **C-P2**. Gabarit : [`GABARIT_PIECE.md`](../GABARIT_PIECE.md). Source :
[`agencement/rangements.md`](../agencement/rangements.md).

**Ce profil ne décrit pas une pièce.** Il décrit une famille d'objets présents
dans presque toutes les pièces, et — c'est la découverte de cette relecture —
**une seconde notion, homonyme et sans rapport**, que le moteur appelle du même
nom. Les sections du gabarit sont donc lues sous cet angle : ce qui vaut pour
une famille d'équipements, et ce qui vaut pour la surface architecturale.

---

## 0. Deux « rangements » sans rapport, et c'est un piège

| | Le meuble | La bande |
|---|---|---|
| Ce que c'est | penderie, placard, bibliothèque, étagères | une part de surface cédée à une pièce |
| Où c'est défini | `equipments` du socle | `carveCirculation()` et `shapeRooms()` |
| Ce qui le contrôle | `TH2D-RANGEMENT-003` pour la penderie | `TH2D-RANGEMENT-001` et `002` |
| Ce qui le dimensionne | emprise + zone de service | profondeur ≥ 0,45 m, ratio ≤ 0,6 |
| Doctrine | ce profil | `ROADMAP.md` §5 ter |

La fiche de sourcing s'interrogeait : trois règles `TH2D-RANGEMENT-*` existent
en production, leur contenu n'est pas documenté, « il peut y avoir
recouvrement ». **Vérifié le 26 août : il n'y a aucun recouvrement.** Ces trois
règles ne parlent pas de meubles :

- **`TH2D-RANGEMENT-001`** `HARD` — une bande cédée fait au moins **0,45 m** de
  profondeur, et sa profondeur ne dépasse pas **0,6 fois** sa longueur : « ce
  n'est plus une bande » ;
- **`TH2D-RANGEMENT-002`** `HARD` — la bande est attenante à la pièce qui la
  reçoit ;
- **`TH2D-RANGEMENT-003`** `GUIDELINE` — compte les chambres dépourvues de
  penderie **réellement posée**, en un message unique.

La séparation est maintenant explicite : **`storage_bay`** désigne la bande et
**`storage_unit`** le meuble. La règle `003`, corrigée en C-P2, lit les
placements canoniques du `BuiltPlan` ; elle n'est plus classée comme limite
d'implémentation.

## 1. Définition fonctionnelle

```text
OBJECT_FAMILY  STORAGE_UNIT
HOSTS          bedroom · entree · bureau · cellier · living · bath · wc

PRIMARY_FUNCTIONS
- ranger hors de vue
- rendre accessible ce qui sert souvent
- absorber le désordre courant

SECONDARY_FUNCTIONS
- séparer visuellement deux zones (meuble haut)
- amortir le bruit d'une cloison
```

Le rangement est la seule famille du socle dont **le manque ne se voit pas sur
un plan**. Une pièce sans rangement est géométriquement valide, meublable,
conforme — et invivable à l'usage. C'est pourquoi `TH2D-RANGEMENT-003` existe
malgré sa formulation trompeuse : quelqu'un a vu le problème.

## 2. Équipements

| Type | Pièce hôte | Emprise socle | Dégagement socle | Statut |
|---|---|---|---|---|
| Penderie `wardrobe` | chambre | 1,20 × 0,60 | 0,70 cible 0,70 confort 0,90 | requis, coulissant, C4 |
| Placard `closet` | entrée | 1,20 × 0,60 | 0,60 | optionnel, dès 3 m² |
| Bibliothèque `bookcase` | bureau | 1,20 × 0,35 | 0,60 | optionnel, dès 7 m² |
| Étagères `shelving` | cellier | 1,20 × 0,45 | 0,60 | requis, `assumed` |
| Rangement de salle d'eau | salle d'eau | — | — | **absent** |
| Rangement de WC | WC | — | — | **absent** |
| Buffet, bibliothèque de séjour | séjour | — | — | **proposé, non activé** |
| Dressing | chambre | — | — | **non tranché** : équipement, annexe ou pièce |

Les quatre premiers portent `assumed: true` ou une longueur `MODULE = 1,20`,
convention `N3` explicitement assumée : **le socle ne fixe pas leur longueur**,
il en propose une. `GAMMES_EQUIPEMENTS.md` §5.6 propose de la remplacer par une
échelle 0,80 / 1,20 / 1,60 / 2,00 — sans rien décider de nouveau, puisque la
longueur était déjà libre.

## 3. Dimensions

| Grandeur | Valeur | Statut |
|---|---|---|
| Profondeur de penderie | **0,60 m**, 0,55 strict minimum | `G1` `[S3]` |
| Profondeur d'étagère, vêtements pliés | 0,40 – 0,45 m | `G2` `[S3]` |
| Profondeur d'étagère, livres | **0,30 m** | `G3` `[S3]` |
| Hauteur sous tringle, penderie courte | 1,00 – 1,10 m | `G4` `[S3]` — hors 2D |
| Hauteur sous tringle, penderie longue | 1,60 – 1,70 m | `G5` `[S3]` — hors 2D |
| Longueur | libre, `MODULE = 1,20` par convention | `N3` |

La profondeur est la seule dimension qui compte en plan, et elle est **entièrement
déterminée par ce qu'on range** : 0,60 pour un cintre, 0,45 pour du pliage, 0,30
pour un livre. C'est une des rares grandeurs du socle où la valeur se déduit de
la fonction sans convention.

Le socle porte 0,35 pour la bibliothèque contre 0,30 en source : écart mineur et
prudent, à laisser.

## 4. Enveloppes d'usage

```text
PHYSICAL_FOOTPRINT     longueur × profondeur
EXCLUSIVE_USAGE_ZONE   aucune
SHARED_USAGE_ZONE      le dégagement frontal
TEMPORARY_SWING_ZONE   le battant, s'il y en a       ← toute la question
ACCESS_ZONE            confondue avec le passage pour un meuble ouvert
```

| Dégagement | `HARD_MIN` | `TARGET` | `COMFORT` | Statut |
|---|---:|---:|---:|---|
| Devant portes **battantes** | **1,00** | 1,00 | 1,20 | `G6` `[S3]` |
| Devant portes **coulissantes** | **0,70** | 0,70 | 0,90 | `G7` `[S3]` |
| Devant un meuble ouvert | **0** | 0 | 0 | `[D]` — seul le passage compte |
| Penderie C4 du socle | **0,70** | 0,70 | 0,90 | coulissante, active |

### Le type d'ouvrant est actif sur la penderie C4

C'est la donnée la plus utile du lot, et la fiche de sourcing le disait déjà :
« le type d'ouvrant change l'emprise au sol de 0,30 m, ce qu'aucun composant du
catalogue ne sait exprimer ».

La penderie de chambre déclare `opening: 'sliding'` et ses trois niveaux de
dégagement. Le solveur les consomme et publie la pose retenue. Cette
consolidation ne prétend pas avoir résolu les placards d'entrée, bibliothèque
et étagères : leur ouvrant reste à typer lorsque leurs pièces hôtes entreront
dans M4c.

**Quatre profils ont maintenant réclamé le même mécanisme.** La porte de la
pièce (`S3`), la penderie de la chambre, les appareils de cuisine — four,
lave-vaisselle, réfrigérateur — et les rangements ici. Ce n'est pas quatre
demandes, c'est une : **un ouvrant occupe temporairement une zone**. Traité une
fois, avec un attribut `opening: 'hinged' | 'sliding' | 'none'` et la zone
temporaire correspondante, il sert les quatre.

### Le meuble ouvert est le cas-test du champ `passage`

Une bibliothèque ouverte n'a **pas** de zone de service : on y accède depuis le
passage. C'est le seul cas du corpus où le dégagement propre vaut zéro et où
seul le passage compte. Il vaut d'être conservé comme cas-test : un mécanisme
de `passage` qui ne saurait pas traiter la bibliothèque serait mal conçu.

## 5. Trois classes dimensionnelles

Les classes portent ici sur le **volume rangé**, pas sur une pièce.

### MINIMAL — le linéaire seul, 0,80 à 1,20 m

Une penderie par chambre, un placard à l'entrée. C'est le socle actuel.

### MOYEN — 1,20 à 2,00 m, plus un rangement de service

Ajoute le rangement de salle d'eau et de WC, aujourd'hui absents du socle, et
un buffet ou une bibliothèque au séjour.

### LARGE — le rangement devient un volume

Dressing, cellier, placard de ménage. À ce stade, le rangement cesse d'être un
meuble et devient une **annexe ou une pièce** — et c'est là que l'arbitrage
manquant mord.

### L'arbitrage est rendu, l'émergence reste différée

`DECISIONS_PROGRAMME.md` tranche : sous 80 m², le rangement reste un équipement
ou une zone rattachée à une pièce hôte ; au-delà, un grand rangement **peut**
émerger comme annexe. C-P2 consolide le premier cas. L'interpréteur d'émergence
F2/L1 et le dressing autonome restent différés sans empêcher ce noyau de passer
C4.

## 6. Règles d'agencement

| Relation | Niveau |
|---|---|
| Rangement contre un mur | `REQUIRED` — `anchor: 'wall'` |
| Penderie et lit sur des murs différents | `PREFERRED` — `BED-STORAGE-001`, actif |
| Dégagement frontal de la penderie coulissante | `REQUIRED` — 0,70 m, actif |
| Rangement empiétant sur une zone d'usage | `FORBIDDEN` |
| Meuble haut devant une fenêtre | `UNDESIRABLE` |
| Rangement bas en séparation de zones | `PREFERRED` — séjour Large |
| Bande cédée attenante à sa pièce | `REQUIRED` — `TH2D-RANGEMENT-002`, actif |
| Bande de profondeur ≥ 0,45 m et ratio ≤ 0,6 | `REQUIRED` — `TH2D-RANGEMENT-001`, actif |

`BED-STORAGE-001` est la seule relation du socle qui concerne un rangement, et
elle est correcte : elle empêche la penderie de manger le passage latéral du
lit.

## 7. Circulations

Un rangement ne crée pas de trajectoire, il en **consomme** : sa zone de service
se superpose au passage. C'est le cas le plus favorable de mutualisation, et le
solveur le traite déjà correctement — les zones se recouvrent sauf mention
`exclusive`.

Le seul conflit réel est le **battant qui s'ouvre sur un passage traversant**.
Il est aujourd'hui invisible, faute de zone temporaire.

## 8. Porte et accès

Sans objet pour le meuble ; son « ouvrant » est traité au §4. La bande cédée n'a
ni porte ni accès propre : elle est par définition attenante à sa pièce, ce que
`TH2D-RANGEMENT-002` vérifie.

## 9. Formes

| Forme | Pertinence |
|---|---|
| Linéaire contre un mur | **excellente** — le cas normal |
| Angle | bonne — exploite un retour perdu |
| Bande cédée en décrochement | acceptable — profondeur ≥ 0,45, ratio ≤ 0,6 |
| Niche | bonne — mais suppose une épaisseur de mur exploitable |
| Volume traversant | à éviter — coupe la pièce |

La règle de ratio de `TH2D-RANGEMENT-001` — profondeur ≤ 0,6 × longueur —
mérite d'être notée : c'est **la seule règle de forme du moteur qui soit
positive**, au sens où elle définit ce qu'est une bande plutôt que d'interdire
un défaut. Bien formulée, mesurable, et elle empêche exactement ce qu'il faut :
le carré perdu au fond d'une pièce.

## 10. Archétypes

**A — penderie linéaire, chambre.**

```text
┌────────────────────┐
│▬▬▬▬ penderie ▬▬▬▬  │  ← 0,60 de profondeur
│                    │     + 1,00 si battante
│        lit         │
└────────  ──────────┘
```

**B — bande cédée par la circulation.**

```text
┌──────────┬─────────┐
│  chambre │▓▓▓▓▓▓▓▓ │  ▓ = bande, profondeur ≥ 0,45
│          │         │      longueur ≥ profondeur / 0,6
├──────────┴─  ──────┤
│      couloir       │
└────────────────────┘
```

**C — mauvaise configuration : la bande trop profonde.**

```text
┌──────────┬────────┐
│ chambre  │▓▓▓▓▓▓▓▓│  ← profondeur > 0,6 × longueur :
│          │▓▓▓▓▓▓▓▓│     ce n'est plus une bande,
└──────────┴─  ─────┘     c'est un carré perdu
```

La configuration C est **refusée** par `TH2D-RANGEMENT-001`.

## 11. Relations avec les autres pièces

Sans objet : le rangement n'est pas une pièce. Deux remarques valent toutefois
pour son placement dans le plan :

- un rangement **entre deux pièces** fait office d'isolant acoustique. C'est le
  seul usage où sa profondeur sert deux fois. Non exprimable aujourd'hui ;
- un placard de ménage se rattache naturellement à la circulation ou à la salle
  d'eau, jamais à une chambre. Cela relève du lot C-P3.

## 12. Contraintes techniques

```text
REQUIRED_SERVICES  aucun
```

Sauf un cas : le placard technique — tableau électrique, gaines, trappe. Il
n'est pas un rangement, c'est un `local_technique` déguisé, et le confondre avec
un placard ordinaire ferait perdre ses contraintes d'accès de maintenance.

## 13. Réglementation française

**Aucune obligation** relative aux rangements dans le logement individuel.

Une nuance utile : la surface d'un placard **compte dans la surface habitable**
si sa hauteur sous plafond dépasse 1,80 m, et les combles non aménageables en
sont exclus. Cela relève du calcul de surface, pas de l'agencement, et **le
moteur ne fait pas ce calcul** — il travaille en surface géométrique. À noter
avant que quelqu'un compare une surface générée à une surface Carrez.

Statut : **apport non vérifié**, à instruire dans `VEILLE_NORMATIVE.md` en même
temps que la définition de surface retenue par le projet.

## 14. Accessibilité

```text
ACCESSIBILITY  STANDARD | ADAPTABLE | ACCESSIBLE
```

En mode `ACCESSIBLE`, deux effets, tous deux hors du plan 2D actuel :

- **hauteur de préhension** 0,90 à 1,30 m (`VAL-PMR-011`), ce qui condamne les
  rangements hauts et impose davantage de linéaire à volume égal — donc **plus
  de mur**, ce qui est bien une contrainte de plan, par ricochet ;
- **coulissant obligatoire en pratique** : un battant demande de reculer un
  fauteuil pour l'ouvrir. Le type d'ouvrant redevient dimensionnant, une
  troisième fois.

## 15. Critères de qualité spatiale

| Variable | Ce qu'elle capte |
|---|---|
| `storage_per_room` | linéaire de rangement rapporté à la pièce |
| `storage_reachability` | dégagement réel selon l'ouvrant |
| `bay_proportion` | profondeur / longueur d'une bande — **actif**, `RANGEMENT-001` |
| `bay_attachment` | bande attenante — **actif**, `RANGEMENT-002` |
| `rooms_without_storage` | **actif**, `RANGEMENT-003`, compte les penderies réellement posées |
| `wall_consumption` | linéaire de mur consommé, au détriment d'autres usages |

```text
bande_trop_profonde        = INVALID          # ACTIF
bande_detachee             = INVALID          # ACTIF
chambre_sans_rangement     = defavorable      # ACTIF, STORAGE_UNIT réel
degagement_penderie        = INVALID          # ACTIF via le solveur C4
rangement_entre_deux_pieces = favorable       # non exprimable
```

## 16. Synthèse

| Paramètre | Minimal | Moyen | Large |
|---|---:|---:|---:|
| Linéaire par chambre | 1,20 m | 1,60 m | 2,00 m ou dressing |
| Profondeur penderie | 0,55 m | 0,60 m | 0,60 m |
| Profondeur étagère | 0,30 m | 0,40 m | 0,45 m |
| Dégagement, coulissant | 0,70 m | 0,70 m | 0,90 m |
| Dégagement, battant | 1,00 m | 1,00 m | 1,20 m |
| Rangement de service | non | salle d'eau, WC | + placard de ménage |
| Séjour | non | buffet | bibliothèque |
| Bande cédée | profondeur ≥ 0,45, ratio ≤ 0,6 | idem | idem |

## 17. Traduction TechnoHab

```text
OBJECT_FAMILY  STORAGE_UNIT              # le meuble
DISTINCT_FROM  STORAGE_BAY               # la bande cédée — séparation active

OBJECTS
- wardrobe   chambre · gamme 0.80 / 1.20 / 1.60 / 2.00 × 0.60
- closet     entrée   · idem
- bookcase   bureau   · gamme × 0.30–0.35
- shelving   cellier  · gamme × 0.45
- bath_storage, wc_storage, sideboard      # MANQUANTS

ATTRIBUTES
- opening : sliding                        # ACTIF sur wardrobe C4
FUNCTIONAL_ZONES
- front_clearance  1.00 hinged · 0.70 sliding · 0 none
- swing_zone       si hinged, temporaire, exclusive   # différé hors wardrobe

HARD_CONSTRAINTS
- ancré à un mur
- dégagement de la penderie coulissante ≥ 0.70         # ACTIF
- n'empiète sur aucune zone d'usage requise
SOFT_CONSTRAINTS
- sur un mur différent du lit                          # ACTIF, BED-STORAGE-001
- pas de meuble haut devant une fenêtre
- rangement en séparation de zones, séjour Large

STORAGE_BAY                                # la bande, pour mémoire
- profondeur ≥ 0.45 · ratio ≤ 0.6 × longueur           # ACTIF, RANGEMENT-001
- attenante à sa pièce                                 # ACTIF, RANGEMENT-002
- cédée par la circulation, jamais aux pièces à agrément nul   # lot O1

DEFERRED_SCOPE
- émergence d'une annexe de rangement au-delà de 80 m² (F2/L1)
- dressing autonome et équipements de service
```

---

## Annexe — clôture C4 au 1er septembre 2026

Le noyau consolidé couvre deux objets sans les confondre : penderie de chambre
(`STORAGE_UNIT`) et bande géométrique (`STORAGE_BAY`). Les profondeurs et le
ratio des baies sont canoniques ; la penderie coulissante participe au verdict
M4c et `TH2D-RANGEMENT-003` inspecte sa pose réelle. Le manifeste `STORAGE C4`
est enrôlé dès qu'une chambre existe, avant toute cession de bande.

`scripts/test-storage-c4.mjs` prouve séparément baie valide, baie trop mince,
baie détachée, chambre avec et sans penderie, puis rejoue un plan de trois
chambres. Restent différés les unités des pièces non encore consolidées et
l'émergence d'une annexe de rangement.

## Journal historique — audit du 26 août 2026

Les écarts ci-dessous sont conservés comme trace de décision et **ne décrivent
plus l'état courant** pour la penderie et la règle `RANGEMENT-003`. Les unités
de salle d'eau, WC, entrée et séjour restent en revanche hors de la portée C4
limitée.

1. **Homonymie « rangement »** — le meuble et la bande portent le même nom, et
   les trois règles `TH2D-RANGEMENT-*` ne concernent que la seconde. Le rapport
   de plan est donc trompeur : `RANGEMENT-003` annonce « chambre sans
   rangement » alors qu'il compte les décrochements, pas les penderies. La
   fiche de sourcing soupçonnait un recouvrement ; il n'y en a pas, **il y a
   deux sujets distincts** ;
2. **le type d'ouvrant n'existe pas** — 0,30 m d'emprise en jeu. Quatrième
   profil à réclamer le même mécanisme, après la porte de pièce, la penderie de
   chambre et les appareils de cuisine. Une seule extension les sert tous ;
3. **les quatre rangements du socle portent 0,60 m de dégagement** — sous le
   coulissant (0,70) et très sous le battant (1,00). Aucun n'est déclaré
   coulissant, mais tous sont dimensionnés comme s'ils l'étaient, et à un
   niveau encore inférieur ;
4. **trois rangements manquent au socle** — salle d'eau, WC, séjour. Les deux
   premiers sont exigés par leurs propres profils en classe Moyenne ;
5. **la longueur est une convention `MODULE = 1,20`**, assumée, que
   `GAMMES_EQUIPEMENTS.md` §5.6 propose de remplacer par une échelle. Rien à
   décider de neuf : la longueur était déjà libre ;
6. **deux arbitrages ouverts depuis le 18 août** — dressing et rangement comme
   pièce. Ce sont des décisions, pas des développements, et elles bloquent les
   lots C-P2 et C-P4 ;
7. **la surface de placard et le calcul de surface habitable** — le moteur
   travaille en surface géométrique et ne connaît pas la définition Carrez. À
   instruire avant toute comparaison à des surfaces réelles.
