# Profil de pièce — Chambre

**`BEDROOM` · variantes `enfant` | `parentale` · maturité `C4` · 31 août 2026**

Premier profil de la vague **C-P1** ([`ROADMAP_HISTORIQUE.md`](../ROADMAP_HISTORIQUE.md) §6.2).
Gabarit : [`GABARIT_PIECE.md`](../GABARIT_PIECE.md). Source de valeurs :
[`agencement/chambre.md`](../agencement/chambre.md), dont les cotes `[S3]` sont
reprises ici et qui reste la fiche de sourcing.

**Décision C-P1.2a.** Le programme obligatoire est fermé à un lit et une
penderie coulissante de 1,20 × 0,60 m. Les chevets ne sont pas simulés : ils
restent différés jusqu'au mécanisme générique d'équipement lié. La première
chambre générée est `parentale` (11 m² / 2,70 m), les suivantes `enfant`
(9 m² / 2,50 m). Minimum, cible et confort sont consommés séparément par le
solveur ; la porte, son débattement, la fenêtre et S4 sont éprouvés dans
`scripts/test-bedroom-c4.mjs`. La suite parentale reste hors de ce dossier.

---

## 1. Définition fonctionnelle

```text
ROOM_TYPE  BEDROOM
FAMILY     NIGHT_ROOM
VARIANTS   enfant | parentale        (amis : non générée, C-P5)

PRIMARY_FUNCTIONS
- dormir
- s'habiller et se déshabiller
- ranger les vêtements
- se retirer : intimité, isolement acoustique et visuel

SECONDARY_FUNCTIONS
- lire, travailler, jouer selon la variante
- langer et surveiller un jeune enfant
- regarder un écran
- ranger le linge de saison
```

**La simultanéité commande la géométrie, comme au WC mais en sens inverse.**
Une chambre parentale accueille **deux dormeurs qui se lèvent
indépendamment** : c'est cette simultanéité, et elle seule, qui impose l'accès
au lit **des deux côtés**. Ce n'est pas une exigence de confort qu'on pourrait
rogner en petite surface — un lit double accessible d'un seul côté oblige un
dormeur à enjamber l'autre, ce qui n'est pas une gêne mais une perte de
fonction.

La chambre `enfant` n'a pas cette contrainte : un dormeur, un accès suffit, et
le lit peut être calé contre un mur. C'est la vraie différence entre les deux
variantes — pas la taille du lit, qui n'en est que la conséquence.

Durée d'occupation la plus longue du logement, et la seule en position
immobile. D'où le poids des critères que le plan 2D capte mal : lumière,
acoustique, orientation.

## 2. Équipements

| Équipement | Minimal | Moyen | Large | Nature | Emprise 2D |
|---|---|---|---|---|---|
| Lit | obligatoire | obligatoire | obligatoire | fonctionnel | **oui**, gamme livrée |
| Penderie ou armoire | obligatoire | obligatoire | obligatoire | fonctionnel | **oui** |
| Table de chevet | 1 si lit simple | **1 par dormeur** | idem | fonctionnel | oui — **absente du socle** |
| Éclairage général + liseuse | obligatoire | obligatoire | obligatoire | fonctionnel | non |
| Occultation des fenêtres | obligatoire | obligatoire | obligatoire | fonctionnel | non |
| Commode | — | option | oui | confort | oui — proposée, non activée |
| Bureau *(variante enfant)* | — | oui | oui | fonctionnel | oui — non activé |
| Fauteuil ou assise | — | — | option | confort | oui |
| Miroir en pied | — | option | oui | confort | non |
| Dressing séparé | — | — | option | confort | relève de C-P4 |
| Prise près du lit, des deux côtés | — | oui | oui | confort | non |

**La table de chevet est le cas type de l'équipement lié** : sa quantité dépend
d'un autre équipement — une par dormeur, donc une avec un lit simple et deux
avec un lit double. Le socle ne sait exprimer ni quantité, ni dépendance entre
équipements ; c'est le cinquième mécanisme manquant relevé par
`GAMMES_EQUIPEMENTS.md` §7, et cette pièce en est le meilleur exemple.

## 3. Dimensions des équipements

| Objet | Compact | Standard | Grand | Statut |
|---|---|---|---|---|
| Lit simple | 0,90 × 1,90 | 0,90 × 2,00 | — | `VAL-EQ-001` N2 |
| Lit double | 1,40 × 1,90 | 1,60 × 2,00 | 1,80 × 2,00 | `VAL-EQ-002` à `004` N2 |
| Penderie | 0,80 × 0,60 | **1,20 × 0,60** | 2,00 × 0,60 | profondeur `[S3]` ; longueur `N3` |
| Table de chevet | 0,35 × 0,30 | 0,40 × 0,35 | 0,50 × 0,40 | `N3` |
| Commode | — | 0,80 × 0,50 | 1,00 × 0,50 | `N3`, non activée |

**La gamme du lit est livrée** (chantier 8, lot G1) : `bed_140` monte en 160 à
partir de 12 m² et en 180 à partir de 16 m², sans changer d'identité — vérifié
le 26 août, `id` reste `bed_140` et `size` porte `bed_180`. C'est la seule
gamme du socle qui produise un effet mesurable sur le domaine de faisabilité,
et elle fonctionne.

La longueur de penderie est une **convention `MODULE = 1,20`**, déclarée
`assumed: true` au socle. La profondeur 0,60 est sourcée `[S3]`, avec un strict
minimum de 0,55.

## 4. Enveloppes d'usage

```text
PHYSICAL_FOOTPRINT     lit, penderie, chevets, commode
EXCLUSIVE_USAGE_ZONE   aucune
SHARED_USAGE_ZONE      côtés du lit, pied du lit, devant la penderie, circulation
TEMPORARY_SWING_ZONE   débattement de porte ; portes d'armoire battantes
ACCESS_ZONE            porte → lit, porte → penderie
TRANSFER_ZONE          mode ACCESSIBLE uniquement
```

| Dégagement | `HARD_MIN` | `TARGET` | `COMFORT` | Statut |
|---|---:|---:|---:|---|
| Côtés longs du lit, `parentale` | 0,60 | 0,70 | 0,90 | `[S3]` ; **au socle**, `sides: 2` |
| Côté long, `enfant` | 0,60 | 0,60 | 0,70 | `[S3]` ; un seul côté suffit |
| **Pied du lit** | 0,60 | 0,70 | 0,90 | `[S3]` — **actif**, face `foot` |
| Devant penderie battante | 1,00 | 1,00 | 1,20 | `[S3]` — variante différée |
| Devant penderie coulissante | 0,70 | 0,70 | 0,90 | `[S3]` — **standard C4 actif** |
| Passage résiduel | 0,60 | 0,70 | 0,90 | `N3` |

### Le pied du lit est désormais une zone d'usage — livré

`usageSets()` traduit `face: 'foot'` sur le bord opposé au mur de tête. Les
deux lits déclarent donc séparément côtés et pied ; S2, S3, S4 et le classement
`target`/`comfort` les jugent sans branche spéciale à la chambre.

### La penderie coulissante ferme le programme C4

Le socle porte désormais `opening: 'sliding'` et un dégagement frontal
0,70 / 0,70 / 0,90 m. Cette solution ferme honnêtement le programme courant :
elle n'invente aucun débattement. Une penderie battante reste une future
variante d'ouvrant générique, avec sa zone temporaire à 1,00 m.

## 5. Trois classes dimensionnelles

Domaines **recalculés** le 31 août, penderie et pied du lit compris :

| Programme | Plus petit rectangle meublable |
|---|---|
| `enfant` — lit 90 + penderie | 2,10 × 2,50 = **5,25 m²** |
| `parentale` — lit 140 + penderie | 2,50 × 3,20 = **8,00 m²** |
| `parentale` — lit 160, dès 12 m² | 2,00 × 3,40 = 6,80 m² |
| `parentale` — lit 180, dès 16 m² | 2,00 × 3,60 = 7,20 m² |

### `enfant` — MINIMAL 9 m² · MOYEN 10–12 m² · LARGE 13–16 m²

En MINIMAL, le lit est contre un mur, la penderie sur le mur opposé, aucun
bureau. En MOYEN, un bureau ou une commode entre. En LARGE, les deux, plus une
zone de jeu dégagée — c'est la seule pièce où la surface libre **est** l'usage.

### `parentale` — MINIMAL 11 m² · MOYEN 12–16 m² · LARGE 16–20 m²

MINIMAL impose déjà l'accès des deux côtés : c'est non négociable, et cela
place le plancher parental au-dessus du plancher enfant. MOYEN reçoit le lit
160 et deux chevets. LARGE reçoit le 180, une commode, une assise, et devient
le domaine de la **suite parentale** — dressing et salle d'eau attenants, qui
relèvent du lot C-P5.

**Au-delà de 20 m², les gains s'effondrent** : une chambre plus grande n'ajoute
aucun usage, elle ajoute du vide. La surface est mieux placée en dressing, en
salle d'eau privative, ou dans une autre chambre.

### Deux planchers de programme effectivement consommés

`programFloors` distingue `enfant` 9 m² / 2,50 m et `parentale` 11 m² /
2,70 m. `fit.data.js`, `floorOf()` et `buildProgram()` transportent la variante :
le premier objet chambre porte le plancher parental, les suivants le plancher
enfant. Le test C4 interdit le retour au plancher unique.

## 6. Règles d'agencement

| Relation | Niveau |
|---|---|
| Tête de lit contre un mur plein | `REQUIRED` |
| Tête de lit sous une fenêtre | `UNDESIRABLE` |
| Tête de lit contre un mur de WC ou de salle d'eau | `UNDESIRABLE` — acoustique |
| Lit accessible des deux côtés, `parentale` | `REQUIRED` |
| Lit accessible d'un côté, `enfant` | `ACCEPTABLE` |
| Débattement de porte sur le lit ou la penderie | `FORBIDDEN` (`S3`) |
| Penderie et lit sur des murs différents | `PREFERRED` — `BED-STORAGE-001`, actif |
| Penderie face au pied du lit à moins de 0,90 m | `UNDESIRABLE` |
| Chevet de chaque côté du lit double | `PREFERRED` |
| Bureau face à un mur aveugle *(enfant)* | `UNDESIRABLE` |
| Lit visible depuis la porte d'entrée du logement | `FORBIDDEN` |

**La tête de lit n'existe pas dans le moteur**, et cinq des règles ci-dessus en
dépendent. Le lit est posé par `placement.js` après la découpe, donc aucune
règle de plan ne peut savoir où elle se trouve au moment de choisir la
géométrie. Deux voies : soit la tête de lit se déduit de l'ancrage — un lit
`anchor: 'wall'` est ancré par sa tête, ce qui est vrai en pratique et
gratuit — soit ces règles attendent que le mobilier entre dans la boucle
(lot M2). La première voie est disponible tout de suite et suffit à quatre des
cinq règles.

## 7. Circulations

```text
PORTE → LIT           principale
PORTE → PENDERIE      principale
LIT → PORTE           nocturne, dans le noir
LIT → CHEVET          immédiate, des deux côtés en parentale
PENDERIE → MIROIR     secondaire
```

Le trajet **nocturne** mérite d'être nommé : il se fait dans l'obscurité, à
demi réveillé, et souvent vers la salle d'eau. Il justifie un passage libre
continu du lit à la porte, sans contournement de meuble — ce que `S4` exprimera
lorsqu'elle sera évaluée.

Cul-de-sac acceptable : la pièce est terminale et doit l'être. Une chambre
traversée par une circulation vers une autre pièce est un défaut de plan, pas
d'agencement.

## 8. Porte et accès

| Solution | Rang |
|---|---|
| Ouvrant vers l'intérieur, contre un mur libre | `BEST` — la pièce l'absorbe |
| Coulissante | `ACCEPTABLE` — réserve acoustique sérieuse ici |
| Ouvrant vers l'extérieur | `UNDESIRABLE` — gêne la circulation commune |
| Débattement sur le lit ou la penderie | `FORBIDDEN` (`S3`) |

Contrairement au WC, la chambre est assez grande pour recevoir un battant
intérieur sans conflit : c'est la solution normale. La réserve acoustique sur
la coulissante est réelle et propre à cette pièce — une chambre est la seule
pièce où l'isolement au bruit fait partie de la fonction primaire.

Porte jamais placée de façon à exposer le lit depuis une circulation commune
ouverte sur le séjour.

## 9. Formes de la pièce

| Forme | Pertinence | Variantes | Réserve |
|---|---|---|---|
| Rectangle | **excellente** | les deux | le lit occupe un petit côté |
| Carré | excellente | parentale | ≥ 3,00 × 3,00 |
| Rectangle très allongé | mauvaise | — | pénalité de ratio du moteur, justifiée ici |
| L | acceptable **si le décrochement fait dressing** | parentale | seul cas de L utile |
| Trapèze, sous rampant | tolérée | enfant | hauteur non modélisée, donc non vérifiable |

La chambre est, avec la salle d'eau, la pièce où un décrochement peut servir :
une alcôve de 1,20 m de profondeur devient une penderie. Mais le solveur ne
sert une pièce en L que par sa partie principale (lot M4b) : le gain ne serait
pas vu.

## 10. Archétypes d'implantation

**A — `parentale`, rectangle, accès des deux côtés.**

```text
┌──────────────────────┐
│ ▭      lit      ▭    │   ▭ = chevets
│                      │
│                      │
│ ▬▬▬▬ penderie ▬▬▬▬   │
└──────────   ─────────┘
          porte
```

**B — `enfant`, lit contre un mur.**

```text
┌────────────────┐
│▐ lit           │
│▐        bureau │
│                │
│▬ penderie ▬    │
└──────   ───────┘
      porte
```

**C — mauvaise configuration : lit accessible d'un seul côté en parentale.**

```text
┌──────────────────┐
│▐▐▐▐ lit          │   ← un dormeur enjambe l'autre :
│▐▐▐▐         ▬▬▬▬ │      ce n'est pas une gêne,
│              pend│      c'est une perte de fonction
└──────   ─────────┘
      porte
```

Le socle refuse aujourd'hui la configuration C par la déclaration `sides: 2` du
lit parental — c'est la règle d'usage la mieux tenue de tout le socle.

## 11. Relations avec les autres pièces

| Relation | Niveau | Motif |
|---|---|---|
| ↔ salle d'eau | `VERY_FAVORABLE` | trajet nocturne, suite parentale |
| ↔ circulation | `FAVORABLE` | desserte sans traverser une pièce habitée |
| ↔ autre chambre | `FAVORABLE` | regroupement de la zone nuit |
| ↔ dressing | `FAVORABLE` | composition C-P5 |
| ↔ séjour | `UNDESIRABLE` | bruit, et rupture jour/nuit |
| ↔ cuisine | `UNDESIRABLE` | bruit, odeurs |
| ↔ WC | `UNDESIRABLE` | acoustique — voir [`wc-separe.md`](wc-separe.md) §11 |
| ↔ garage, local technique | `UNDESIRABLE` | bruit d'équipement |
| **Accès direct depuis l'extérieur** | `FORBIDDEN` | déjà tenu : `ENTREE_INTERDITE` du générateur |
| Traversée par une circulation | `FORBIDDEN` | une chambre est terminale |

**Le regroupement jour / nuit est le principe topologique de cette pièce**, et
il n'est formalisé nulle part. Il ne se réduit pas à une somme d'adjacences
deux à deux : c'est une propriété du plan entier — les chambres d'un côté, les
pièces de vie de l'autre, la circulation entre les deux. Le moteur sait
aujourd'hui exprimer « A est adjacent à B », pas « le groupe A est séparé du
groupe B ». À poser comme question au lot M3 plutôt qu'à trancher ici.

## 12. Contraintes techniques

```text
REQUIRED_SERVICES  electricite
```

**La pièce la moins chargée du logement** : ni eau, ni évacuation, ni
extraction — la ventilation d'une chambre se fait par entrée d'air, non par
extraction. C'est un argument d'implantation à part entière : la chambre n'a
aucune raison d'être près du noyau technique, et toutes les raisons d'en être
loin. Technique et acoustique convergent, ce qui est rare.

Seule exigence réelle : des prises de part et d'autre du lit, ce qui suppose de
savoir où est la tête de lit — encore elle.

## 13. Réglementation française

| Point | Portée | Statut |
|---|---|---|
| Pièce principale ≥ 9 m² de surface habitable | Décret n° 2002-120, art. 4 — **logement mis en location** | `VAL-DEC-001` — vérifié |
| Ou 20 m³ de volume habitable, en alternative | même article | `VAL-DEC-003` — vérifié |
| Hauteur sous plafond ≥ 2,20 m | même article | `VAL-DEC-002` — vérifié, **hors périmètre 2D** |
| Lit : 0,90 m sur les deux grands côtés, 1,20 m au pied, aire de rotation Ø 1,50 m | Arrêté du 24 décembre 2015, art. 13 — accessibilité | vérifié ; emprise calculée **9,92 m²** |
| Ouvrant accessible depuis l'extérieur, occultation | — | non traité, hors 2D |

**Le 9 m² du socle vient du décret décence, et sa portée est plus étroite qu'il
n'y paraît** : il définit un logement décent **mis en location**. Une maison
qu'un propriétaire construit pour lui-même n'y est pas soumise. Le retenir
comme plancher reste défendable — c'est une bonne convention — mais il doit
être présenté comme tel, et non comme une obligation qui s'imposerait à tous
les projets du moteur.

Aucun texte ne fixe de surface minimale à une *chambre* en tant que telle : le
décret parle de **pièce principale**, catégorie qui inclut le séjour.

## 14. Accessibilité

```text
SIZE_CLASS     MINIMAL | MEDIUM | LARGE
ACCESSIBILITY  STANDARD | ADAPTABLE | ACCESSIBLE
```

L'arrêté du 24 décembre 2015 porte les dégagements de 0,60 à **0,90 m sur les
deux grands côtés et 1,20 m au pied**, plus une aire de rotation Ø 1,50 m. La
fiche de sourcing en calcule l'emprise : **9,92 m²** pour le lit seul, sans
penderie ni chevets — soit une chambre accessible autour de 12 m².

Deux conséquences pour le moteur :

- l'emprise accessible dépasse le plancher `parentale` proposé ici (11 m²), donc
  activer `ACCESSIBLE` fait changer de classe. C'est un **résultat**, jamais une
  équivalence ;
- `VAL-PMR-020` compose l'unité de vie d'une cuisine, d'un séjour, **d'une**
  chambre, d'une salle d'eau et des sanitaires. Une seule chambre est donc
  concernée, celle du rez-de-chaussée. Le moteur étant mono-niveau, il ne peut
  pas encore faire cette distinction — toutes ses chambres sont au même étage.

## 15. Critères de qualité spatiale

| Variable | Ce qu'elle capte ici |
|---|---|
| `bed_access_sides` | un ou deux côtés dégagés ; **discriminant principal en parentale** |
| `headwall_quality` | tête de lit sur mur plein, ni fenêtre, ni pièce d'eau derrière |
| `door_conflicts` | débattement sur lit ou penderie — `INVALID` |
| `noise_exposure` | distance aux pièces de jour et aux équipements |
| `wardrobe_clearance` | dégagement réel devant l'armoire, selon type d'ouvrant |
| `night_path` | trajet lit → porte sans contournement |
| `dead_space` | surface au-delà de 20 m² sans usage attribué |
| `shape_complexity` | décrochement utile — dressing — ou perdu |

```text
lit_accessible_deux_cotes_parentale  = REQUIRED
tete_de_lit_contre_piece_d_eau       = defavorable
tete_de_lit_sous_fenetre             = defavorable
door_fixture_conflict                = INVALID
chambre_adjacente_sejour             = defavorable
groupe_nuit_disperse                 = defavorable          # non calculable aujourd'hui
surface_au_dela_de_20m2              = defavorable, croissant
```

`night_path` et `headwall_quality` sont propres à cette pièce, comme
`wet_dry_separation` l'était à la salle d'eau. Deux profils, deux critères
spécifiques : le besoin d'un mécanisme de **critère propre au profil** se
confirme.

## 16. Synthèse

| Paramètre | Minimal | Moyen | Large |
|---|---:|---:|---:|
| Surface `enfant` | 9 m² | 10 – 12 m² | 13 – 16 m² |
| Surface `parentale` | 11 m² | 12 – 16 m² | 16 – 20 m² |
| Plus petit rectangle mesuré | 2,10 × 2,50 `enfant` · 2,50 × 3,20 `parentale` | — | — |
| Lit | 90 / 140 | 90 / 160 | 90 / 180 |
| Accès au lit | 1 côté `enfant`, 2 `parentale` | 2 côtés | 2 côtés + pied |
| Penderie | 1,20 | 1,20 – 1,60 | 2,00 ou dressing |
| Chevets | 1 | 1 par dormeur | idem |
| Bureau `enfant` | non | oui | oui |
| Formes | rectangle | rectangle, carré | toutes, L utile |
| Porte | battante intérieure | idem | idem |
| Accessibilité | non | adaptable | intégrable, ≈ 12 m² |

## 17. Traduction TechnoHab

```text
ROOM_TYPE    BEDROOM
FAMILY       NIGHT_ROOM
VARIANTS     enfant | parentale
ROLE         principale
AGREMENT     0.6
MIN_PROGRAM  enfant 9 / 2.50 · parentale 11 / 2.70      # actif par variante
MAX_RATIO    ~2.0 × besoin                              # plafond doctrinal N3

REQUIRED_OBJECTS
- bed          gamme livrée : 90 · 140 · 160@12 · 180@16
- wardrobe     MODULE 1.20 × 0.60, assumed
DEFERRED_LINKED_OBJECTS
- bedside      1 par dormeur, non requis avant mécanisme générique
OPTIONAL_OBJECTS
- desk         variante enfant, minRoomArea 11
- dresser      minRoomArea 12
- armchair     minRoomArea 16

FUNCTIONAL_ZONES
- bed_sides    long 0.60 HARD / 0.70 TARGET, sides 2 en parentale, shared
- bed_foot     0.60 HARD / 0.70 TARGET / 0.90 COMFORT, shared
- wardrobe_front  0.70 HARD/TARGET / 0.90 COMFORT, sliding
- door_swing   exclusive si battante, actif pour la porte de pièce
- rotation_1500  mode ACCESSIBLE uniquement             # MANQUANT

HARD_CONSTRAINTS
- lit et penderie logés
- lit accessible des deux côtés en parentale
- S3 : aucun recouvrement débattement × emprise ou zone requise
- S4 : chemin continu de la porte au lit et à la penderie
- aucun accès direct depuis l'extérieur
- non traversée par une circulation

SOFT_CONSTRAINTS
- tête de lit contre un mur plein
- tête de lit ni sous fenêtre, ni contre une pièce d'eau
- penderie et lit sur des murs différents
- appartenance au groupe nuit, séparé du groupe jour
- lumière naturelle et occultation

PREFERRED_ADJACENCIES     bath, circulation, bedroom, dressing
UNDESIRABLE_ADJACENCIES   living, kitchen, wc, garage, local_technique
FORBIDDEN_RELATIONS       door(bedroom, exterieur), traversee(bedroom)

SIZE_CLASSES    MINIMAL | MEDIUM | LARGE
ACCESSIBILITY   STANDARD | ADAPTABLE | ACCESSIBLE
QUALITY_EXTRA   bed_access_sides, headwall_quality, night_path
```

---

## Annexe — dettes restantes après C-P1.2a

Le passage C4 ferme les planchers par variante, la zone au pied du lit, les
trois niveaux de dégagement, le rangement obligatoire coulissant et les
preuves isolées de porte, fenêtre, débattement et S4. Restent volontairement
hors de ce niveau :

1. le chevet lié en quantité au nombre de dormeurs ;
2. la penderie battante et son ouvrant temporaire générique ;
3. le mode `ACCESSIBLE`, son passage de 0,90 m, son pied à 1,20 m et sa rotation ;
4. la qualité de tête de lit vis-à-vis de la fenêtre et des pièces d'eau ;
5. la séparation topologique des groupes jour et nuit ;
6. le plafond de grande chambre, qui attend l'allocation et l'étalonnage plutôt
   qu'un `maxRatio` doctrinal ajouté sans preuve d'effet ;
7. la preuve C5 dans un plan complet et les compositions de C-P5.
