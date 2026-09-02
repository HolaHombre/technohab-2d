# Profil de pièce — WC séparé

**`TOILET_SEPARATE` · maturité `C4` · audit C-P0.2 du 31 août 2026**

**Canon consommable.** Les valeurs actuellement actives de ce profil sont
enregistrées dans `assets/canonical-values.data.js` sous le schéma
`CANONICAL_VALUE_SCHEMA.json`. Les cotes non vérifiées restent `PROVISIONAL/N3` :
leur passage dans un schéma ne les transforme pas en normes. La maturité C4
prouve ici le comportement isolé du profil, pas l'origine réglementaire de ses
conventions.
Le WC séparé et la composition `BATHROOM_WITH_TOILET` résolvent les mêmes
identifiants `VAL-WC-*`.

Premier profil écrit au [`GABARIT_PIECE.md`](../GABARIT_PIECE.md), et exemplaire
de référence pour les suivants. Lot **C-P0** de la vNext
([`ROADMAP.md`](../ROADMAP.md) §6.2).

**Maturité C4** : les exigences sont exprimées dans le socle, les niveaux
minimum/cible/confort sont séparés, et `scripts/test-profils-pilotes.mjs`
éprouve cas passant, refus de largeur et de profondeur, dégagements latéraux,
porte extérieure/coulissante et conflit de battant intérieur. M2 et M4 ont
depuis intégré pose, porte et parcours avant verdict.

**Décision C-P0.2 : maintien en C4.**
`scripts/test-profils-pilotes-integration.mjs` prouve le manifeste, le canon,
la cuvette posée, S3, S4, les ancrages et zéro `HARD` sur le BuiltPlan. C5
reste refusé : le lave-mains activé par surface n'entre pas dans le programme
compilé, les résultats S1–S6 et les services ne sont pas tous transportés, les
relations interdites restent incomplètes et l'activation contourne encore le
`trigger` déclaré. Décision et propriétaires :
`scripts/references/C_P0_INTEGRATION_AUDIT.json`.

Ce profil **remplace** [`agencement/wc.md`](../agencement/wc.md) comme référence
de conception. Cette fiche-là garde sa valeur de sourcing : ses valeurs `[S3]`
sont reprises ici, sa §2 reste invalidée pour la même raison.

Statuts employés : `[S3]` source compilée de fiabilité 3 · `[D]` déduit ·
`N3` convention TechnoHab assumée · `à confirmer` · `apport non vérifié`.

---

## 1. Définition fonctionnelle

```text
ROOM_TYPE  TOILET_SEPARATE
FAMILY     SANITARY_CLOSET

PRIMARY_FUNCTIONS
- utiliser les toilettes
- entrer, fermer la porte et sortir sans conflit
- se laver les mains

SECONDARY_FUNCTIONS
- nettoyer la pièce
- évacuer odeurs et humidité
- ranger le nécessaire d'entretien immédiat
```

**Un seul utilisateur à la fois.** C'est la propriété qui distingue le plus
cette pièce de toutes les autres : aucun usage simultané, donc aucun conflit
entre occupants à modéliser, mais une **exclusivité totale** pendant l'usage
— d'où la valeur d'un WC séparé dans un logement qui compte une seule salle
d'eau, et d'où la fonction primaire « entrer, fermer, sortir », qui n'est pas
une évidence : c'est elle qui interdit la porte battant sur la cuvette.

Usage bref, très répété, avec une pointe matinale simultanée à celle de la
salle d'eau. C'est le seul argument fonctionnel réel du WC séparé, et il se
mesure en topologie, pas en surface.

**Famille et variantes.** `SANITARY_CLOSET` regroupe le WC séparé et le **WC
intégré** à la salle d'eau. Le moteur traite déjà la seconde comme une
composition (`bath` + `wc`, drapeau `integratedWc`), pas comme un type distinct
— c'est le bon modèle et il est conservé. Le profil
[« salle d'eau avec WC intégré »](salle-eau-wc-integre.md) est donc le second
pilote C-P0, et non une section de celui-ci.

## 2. Équipements

La trame demande un tableau par classe. Le moteur exige une distinction
supplémentaire, que le tableau porte en colonne « nature » : **tout équipement
n'a pas d'emprise au sol**. Un dérouleur, un abattant, un éclairage ou une
extraction sont obligatoires sans jamais être posés par le solveur. Les
confondre remplirait le socle d'objets fantômes de 0 × 0.

| Équipement | Minimal | Moyen | Large | Nature | Emprise 2D |
|---|---|---|---|---|---|
| Cuvette | obligatoire | obligatoire | obligatoire | fonctionnel | **oui** |
| Réservoir / bâti-support | obligatoire | obligatoire | obligatoire | fonctionnel | inclus dans la cuvette |
| Chasse d'eau | obligatoire | obligatoire | obligatoire | réglementaire *(à confirmer)* | non |
| Abattant + couvercle | obligatoire | obligatoire | obligatoire | réglementaire *(apport non vérifié)* | non |
| Dérouleur | obligatoire | obligatoire | obligatoire | fonctionnel | non |
| Éclairage | obligatoire | obligatoire | obligatoire | réglementaire | non |
| Extraction / VMC | obligatoire | obligatoire | obligatoire | **réglementaire** `REF-009` | non — c'est un `service` |
| Brosse | oui | oui | oui | fonctionnel | non |
| Lave-mains | optionnel faute de place | **standard** | obligatoire `N3` | confort → `N3` en Moyen | **oui** |
| Miroir | — | optionnel | oui | confort | non |
| Porte-serviette | — | si lave-mains | oui | confort | non |
| Poubelle | optionnel | oui | oui | confort | négligeable |
| Rangement | — | optionnel | oui | confort | **oui** |
| Prise électrique | — | optionnelle | optionnelle | confort | non |
| Fenêtre | optionnelle | optionnelle | souhaitable | confort | non — contrainte de façade |
| Douchette hygiénique | — | optionnel | optionnel | confort | non |
| Urinoir | — | — | exceptionnel | confort | oui, **écarté** |

**Trois natures, à ne pas confondre.** L'extraction est la seule obligation
réglementaire dure du tableau (`REF-009`). Le lave-mains en classe Moyenne est
une **convention TechnoHab `N3`**, pas une obligation : aucun texte relevé
n'impose un point d'eau dans un WC séparé lorsque le logement en comporte un
ailleurs. L'écrire « obligatoire TechnoHab » est légitime à condition de dire
que c'est nous qui l'exigeons.

**L'urinoir est écarté**, et pas seulement par rareté : il ajoute un second
appareil raccordé et une seconde zone d'usage dans la pièce la plus contrainte
du logement. Son rapport valeur/coût de modélisation est le plus mauvais du
socle.

## 3. Dimensions des équipements

| Objet | Compact | Standard | Grand | Statut |
|---|---|---|---|---|
| Cuvette posée | 0,36 × 0,60 | 0,38 × 0,68 | 0,40 × 0,72 | `N3` |
| Cuvette suspendue *(bâti compris)* | 0,36 × 0,52 | 0,38 × 0,56 | 0,40 × 0,60 | `N3` |
| Lave-mains | 0,30 × 0,20 | 0,40 × 0,30 | 0,45 × 0,35 | `N3` |
| Rangement peu profond | — | 0,40 × 0,25 | 0,60 × 0,30 | `N3` |

**Le socle porte aujourd'hui 0,40 × 0,70 pour la cuvette, et c'est une valeur
`[D]`, non `[S3]`** : elle a été *déduite* en 2026 par recoupement de W1, W2 et
W3, et `agencement/wc.md` §2 a ensuite invalidé le recoupement — W1 n'était pas
un gabarit de pièce. Le résultat se trouve être le standard du marché, mais par
coïncidence. **Cette cote n'est toujours pas sourcée directement.** C'est le
premier manque de données de ce profil.

La distinction posée / suspendue n'est pas cosmétique : elle vaut 10 à 15 cm de
profondeur de pièce, soit davantage que tous les arbitrages de dégagement
réunis. Elle relève du mécanisme de **gamme** (`sizes`), pas de deux
équipements distincts.

## 4. Enveloppes d'usage

```text
PHYSICAL_FOOTPRINT     cuvette, lave-mains, rangement
EXCLUSIVE_USAGE_ZONE   aucune — voir ci-dessous
SHARED_USAGE_ZONE      devant la cuvette, devant le lave-mains, circulation
TEMPORARY_SWING_ZONE   débattement de porte, si battante
ACCESS_ZONE            de la porte à la cuvette, de la porte au lave-mains
TRANSFER_ZONE          mode ACCESSIBLE uniquement
```

| Dégagement | `HARD_MIN` | `TARGET` | `COMFORT` | Statut |
|---|---:|---:|---:|---|
| Devant la cuvette | 0,60 | 0,70 | 0,80 | `[S3]` pour 0,60 ; `N3` au-dessus |
| Latéral, de chaque côté | 0,20 | 0,25 | 0,30 | `[S3]` pour 0,20 ; `N3` au-dessus |
| Largeur de la zone frontale | 0,60 | 0,60 | 0,70 | socle |
| Devant le lave-mains | 0,50 | 0,60 | 0,70 | socle pour 0,50 ; `N3` au-dessus |
| Axe de cuvette au mur latéral | 0,40 | 0,45 | 0,50 | `N3` |

**Aucune zone n'est exclusive dans cette pièce.** L'espace devant la cuvette,
celui devant le lave-mains et la circulation sont **le même espace**, occupé
successivement par un seul utilisateur. Les additionner produirait une pièce
deux fois trop grande. Le solveur sait déjà le faire : ses zones d'usage se
chevauchent librement sauf mention `exclusive`. C'est acquis, il suffit de ne
pas le défaire.

### Le dégagement latéral n'existe pas dans le moteur — mesuré

`wc_pan` porte une zone frontale et rien d'autre. Conséquence testée le 26 août
sur le solveur lui-même :

| Rectangle | Verdict du solveur |
|---|---|
| 0,60 × 1,50 | **tient** (cuvette seule) |
| 0,60 × 1,80 | **tient** (cuvette + lave-mains) — 1,08 m² |
| 0,90 × 1,30 | **refusé** |
| 0,80 × 1,40 | refusé |

Trois enseignements, tous exploitables :

1. **la largeur d'usage réelle est de 0,60 m**, soit la largeur de la zone
   frontale — pas celle de la cuvette. Le socle valide donc un WC large de
   60 cm, où l'on ne peut ni poser les pieds de côté, ni ouvrir une porte. Ce
   n'est pas une erreur de cote, c'est une **grandeur manquante** ;
2. **le `minimalRect: 0,90 × 1,30` déclaré au socle est refusé par le socle
   lui-même.** L'incohérence relevée en phase 11 est pire qu'annoncée : ce
   n'est pas « annoncé contre imposé », c'est contradictoire. La valeur n'étant
   lue par personne, la contradiction est restée silencieuse ;
3. **la profondeur de 1,50 m est incompressible** quelle que soit la largeur,
   parce que 0,70 de cuvette et 0,80 de dégagement frontal s'additionnent sur
   le même axe. C'est la seule cote vraiment structurante de la pièce.

### L'effet de la correction, calculé

Poser le latéral à `HARD_MIN` 0,20 et ramener le frontal de 0,80 à 0,60 change
la forme du domaine sans en changer la surface :

- aujourd'hui : 0,70 × 1,50 = **1,05 m²** (0,70 étant le plancher du balayage,
  voir Annexe) ;
- après : 0,40 + 2 × 0,20 = 0,80 de large, 0,70 + 0,60 = 1,30 de profond, soit
  **1,04 m²**.

Une surface identique à un centième près, pour une pièce plus large et moins
profonde — c'est-à-dire **utilisable**. La correction est une rotation du
domaine, pas un abaissement. À vérifier au banc, jamais à supposer.

## 5. Trois classes dimensionnelles

### MINIMAL — 0,95 à 1,25 m²

Faire fonctionner un WC dans l'emprise la plus faible raisonnablement
utilisable. Configurations : 0,80 × 1,30 acceptable, **0,90 × 1,40 retenu comme
bon minimum `N3`**.

Conservés : cuvette, chasse, dérouleur, éclairage, extraction.
Supprimés : lave-mains, rangement, miroir.
Compromis acceptés : pas de point d'eau, porte coulissante imposée, aucun
rangement.
**Compromis jamais acceptés** : largeur sous 0,80 m ; dégagement frontal sous
0,60 ; porte battant sur la cuvette ; absence d'extraction.

### MOYEN — 1,30 à 1,80 m² · **cas de référence**

`1,00 × 1,50` est l'archétype procédural. Cuvette, lave-mains, miroir,
porte-serviette, extraction, éclairage, poubelle. Le lave-mains doit être
atteignable **sans contourner la cuvette** : c'est la seule règle d'agencement
propre à cette classe, et elle est calculable.

### LARGE — 2,0 à 3,5 m²

Rangement peu profond, vraie petite vasque, éventuellement douchette. **Au-delà
de 3,0 à 3,5 m², les gains deviennent nuls** : la pièce ne peut pas accueillir
d'usage supplémentaire, un seul utilisateur y entre à la fois. La surface est
alors mieux placée ailleurs, ou la pièce doit changer de nature — WC accessible,
WC + rangement ménage, salle d'eau. O1 la traduit par un plafond relatif :
`maxRatio: 3.5` sur le besoin meublable calculé de 1,04 m², soit 3,64 m²,
identifié par `VAL-WC-PROGRAM-AREA-MAX-RATIO-001` (`HARD/N3`).

### Avertissement — le plancher

Le plancher effectif du moteur est aujourd'hui de **1,50 m²** (`minProgramArea`,
convention `N3`), au-dessus de la classe MINIMAL décrite ici. Adopter 0,95 m²
comme plancher serait un **abaissement** au sens de `GAMMES_EQUIPEMENTS.md` §4 :
il laisserait entrer des pièces aujourd'hui refusées. Cela peut se décider, à
trois conditions — le décider explicitement, le sourcer, le mesurer au banc.
Ce profil ne le propose pas : il décrit une classe, il ne déplace pas un
plancher.

## 6. Règles d'agencement

| Relation | Niveau |
|---|---|
| Cuvette ancrée à un mur | `REQUIRED` |
| Débattement de porte recouvrant la cuvette ou sa zone frontale | `FORBIDDEN` (`S3`) |
| Lave-mains atteignable sans contourner la cuvette | `PREFERRED` |
| Lave-mains entre la porte et la cuvette, sur le trajet | `PREFERRED` |
| Lave-mains derrière l'utilisateur assis | `UNDESIRABLE` |
| Cuvette face à la porte, visible depuis l'ouverture | `UNDESIRABLE` |
| Cuvette sur le mur portant la porte | `NEUTRAL` |
| Rangement empiétant sur une zone d'usage | `FORBIDDEN` |
| Lave-mains et cuvette sur le même mur | `NEUTRAL` en Moyen, `PREFERRED` en Minimal |

L'ordre d'usage à privilégier est **porte → lave-mains → circulation →
cuvette**, jamais **porte → cuvette → lave-mains derrière**. Il s'exprime avec
les relations existantes du socle : un `near` entre le lave-mains et la porte,
une fois la porte devenue un objet (lot M2). Avant cela, il n'est pas
exprimable — et le noter comme tel vaut mieux que de l'écrire dans une règle
qui ne s'évaluerait jamais.

## 7. Circulations

```text
ENTRÉE → CUVETTE          principale
ENTRÉE → LAVE-MAINS       principale
CUVETTE → LAVE-MAINS      secondaire, courte
LAVE-MAINS → SORTIE       principale
```

Cul-de-sac **acceptable** : la pièce est terminale par nature, elle ne dessert
rien. Contourner la cuvette pour atteindre le lave-mains est le seul vrai
défaut de trajectoire, et il n'apparaît qu'en classe Moyenne et Large.

**Mutualisation.** Les trois zones — devant la cuvette, devant le lave-mains,
circulation — se recouvrent et doivent le faire. C'est le point que la doctrine
signalait comme « important pour le moteur » : il est déjà tenu.

Ce que le moteur ne sait pas encore vérifier : qu'un **chemin continu** relie
la porte à chaque zone d'usage. C'est la règle `S4` du socle, déclarée
bloquante et jamais évaluée, rattachée au lot M4.

## 8. Porte et accès

| Solution | Rang | Motif |
|---|---|---|
| Ouvrant vers l'extérieur | `BEST` | libère toute l'emprise ; demande du dégagement côté circulation |
| Coulissante | `ACCEPTABLE` | neutre en emprise ; coût et étanchéité acoustique moindres |
| Ouvrant vers l'intérieur, sans conflit vérifié | `UNDESIRABLE` | tenable au-delà de ~1,60 m² seulement |
| Ouvrant vers l'intérieur, recouvrant cuvette ou zone frontale | `FORBIDDEN` | c'est `S3` |

**Largeur : la question ne se pose pas, elle est déjà tranchée.** Le moteur
pose toute porte intérieure en 0,83 m de baie, 0,80 m de vantail et 0,77 m de
passage utile (`generator.js`), soit exactement `VAL-PMR-007` et `VAL-PMR-008`.
Les portes étroites usuelles du marché en WC — 0,63 m de passage — ne sont
jamais produites. Ce profil ne propose pas de les introduire : ce serait
abaisser un niveau déjà acquis pour gagner 14 cm dans la seule pièce où la
largeur de la porte ne dimensionne rien.

**État du moteur.** Toute pièce de type `wc` reçoit aujourd'hui une porte
coulissante, par décret, et `debattement: null`. Le décret produit un résultat
acceptable pour une mauvaise raison : il évite le conflit au lieu de le
vérifier. Il devient inutile dès que la porte est un objet — la hiérarchie
ci-dessus est alors un résultat.

## 9. Formes de la pièce

| Forme | Pertinence | Classes | Réserve |
|---|---|---|---|
| Rectangle longitudinal | **excellente** | Minimal, Moyen | la forme canonique |
| Rectangle transversal | bonne | Moyen | utile si la façade est large et peu profonde |
| Carré | excellente | Moyen, Large | ≥ 1,20 × 1,20 |
| L | acceptable **si subie** | Large | jamais créée volontairement |
| Trapèze, polygone | tolérée avec pénalité | Large | résout un mur oblique, un escalier, une limite |
| Angles aigus | à proscrire | — | surface résiduelle inutilisable |

**Mesuré, puis corrigé dans la journée du 26 août.** Le relevé du matin donnait
18 à 27 WC sur 30 non rectangulaires ; le témoin versionné `measure-o0.mjs`,
passé le soir, en relève **zéro sur les trois configurations**. La cause était
la cession de bandes de rangement au WC — une pièce dont l'agrément est nul
recevant un rangement dont elle n'a aucun usage — et un second façonnage
correctif du squelette, retiré depuis.

**O1 ferme aussi le défaut de proportion.** Au rejeu du 27 août, le pire WC
mesure 3,48 m² utiles ; à 250 m², son pire rectangle est 1,00 × 3,64 m, contre
1,00 × 9,48 m et 8,96 m² avant O1. Les trente graines des trois configurations
restent à zéro WC non rectangulaire.

## 10. Archétypes d'implantation

**A — longitudinale**, classes Minimal et Moyen. La référence.

```text
┌─────────┐
│   WC    │
│         │
│         │
│ lavabo  │
└───   ───┘
    porte
```

**B — transversale**, façade large et peu profonde.

```text
┌──────────────┐
│  WC   lavabo │
│              │
└──────   ─────┘
      porte
```

**C — carrée**, classes Moyen et Large.

```text
┌───────────┐
│ WC        │
│           │
│    lavabo │
└────   ────┘
    porte
```

**D — mauvaise configuration, aujourd'hui acceptée par le socle.**

```text
┌───┐
│WC │   0,60 × 1,80 = 1,08 m²
│   │   validé par le solveur :
│   │   aucun dégagement latéral
│lav│   n'est modélisé
└─ ─┘
```

Ce dernier schéma n'est pas une hypothèse : c'est le résultat du test du §4. Un
couloir de 60 cm où l'on ne peut ni s'asseoir de biais ni ouvrir une porte, et
que rien dans le moteur ne refuse aujourd'hui.

## 11. Relations avec les autres pièces

| Relation | Niveau | Motif |
|---|---|---|
| WC ↔ gaine ou local technique | `VERY_FAVORABLE` | réseaux courts, maintenance |
| WC ↔ salle d'eau | `VERY_FAVORABLE` | mur humide partagé, évacuation mutualisée |
| WC ↔ circulation | `FAVORABLE` | desserte neutre, pas de traversée de pièce habitée |
| WC ↔ entrée | `FAVORABLE` | usage par un visiteur sans entrer dans l'intime |
| WC ↔ buanderie | `FAVORABLE` | mêmes réseaux |
| WC ↔ chambre | `UNDESIRABLE` | nuisance acoustique, non bloquante |
| WC ↔ zone de repas | `UNDESIRABLE` | et `FORBIDDEN` si communication directe |
| **Porte WC → cuisine** | `FORBIDDEN` | `REF-008` — pas de communication directe |
| **Porte WC → pièce de repas** | `FORBIDDEN` | `REF-008` |

L'interdiction porte sur la **communication**, jamais sur la mitoyenneté : un
mur commun entre WC et cuisine est licite, et même favorable pour les réseaux.
`WC → dégagement → cuisine` est valide.

**Contrainte d'écriture.** Ces niveaux s'expriment en **peines d'absence**,
jamais en primes : le score du moteur ne connaît que des pénalités, et sa
sortie anticipée dépend d'un plan parfait à zéro. Par ailleurs, une préférence
visant un objet non encore posé — la tête de lit — est inatteignable, le score
s'exécutant avant le placement du mobilier. « WC ↔ tête de lit » se réduit donc
à « WC mitoyen d'une chambre ». Le typage des adjacences est le lot M3.

## 12. Contraintes techniques

```text
REQUIRED_SERVICES  eau_froide, evacuation, ventilation, electricite
```

Évacuation en diamètre 100, la plus contraignante du logement après celle de la
cuisine : elle commande la position de la cuvette bien davantage que
l'ergonomie. Regrouper WC, salle d'eau et buanderie sur un même mur technique
est le gain le plus net de tout le profil.

`services: ['ventilation']` **manque au type `wc`** dans le socle, alors que
`bath` le porte. C'est une omission d'une ligne, sans effet géométrique, mais
elle rend la pièce invisible aux futures règles de réseaux.

Le débit d'extraction ne s'écrit pas en dur : il dépend du nombre de pièces
principales et du nombre de WC (`REF-009`). Le socle porte le **besoin**, le
calcul appartient à la configuration du logement.

## 13. Réglementation française

| Point | Portée | Statut |
|---|---|---|
| Le cabinet d'aisances ne communique pas directement avec une cuisine ni une pièce de repas | Règlement sanitaire départemental type, décliné par département | `REF-008` — **retenu**, seules les interdictions communes à toutes les déclinaisons sont exploitables |
| Sortie d'air permanente en pièce de service | Arrêté du 24 mars 1982 | `REF-009` — **retenu** ; débits variables selon configuration |
| Espace libre 0,80 × 1,30 latéral à la cuvette, hors débattement | Accessibilité, annexe de l'arrêté du 24 décembre 2015 | `VAL-PMR-012` — **à confirmer** |
| Champ d'application : logements destinés à la vente, la location ou la mise à disposition ; exclusion de la construction qu'un propriétaire entreprend pour son propre usage | CCH | **apport non vérifié** — à instruire dans `VEILLE_NORMATIVE.md` |
| Alimentation en eau, évacuation évitant remontées d'odeurs et retours d'eau, dispositif d'occlusion de la cuvette | Code de la santé publique | **apport non vérifié** |

**Trois valeurs de ce profil ne sont pas réglementaires et ne doivent jamais
être présentées comme telles** : le dégagement frontal de 0,60, le dégagement
latéral de 0,20 et la présence d'un lave-mains. Les deux premières sont
ergonomiques `[S3]`, la troisième est une convention TechnoHab.

Le champ d'application du CCH mérite d'être instruit avant tout usage : il
détermine si l'accessibilité s'applique aux maisons que ce moteur produit. Tant
qu'il n'est pas tranché, `ACCESSIBILITY` reste un choix de l'utilisateur et non
une obligation déduite.

## 14. Accessibilité

```text
SIZE_CLASS     MINIMAL | MEDIUM | LARGE
ACCESSIBILITY  STANDARD | ADAPTABLE | ACCESSIBLE
```

Les deux axes sont **indépendants**. Un WC LARGE n'est pas accessible s'il est
tout en longueur ; un WC MEDIUM bien proportionné peut être ADAPTABLE.

- `STANDARD` — aucune exigence supplémentaire ;
- `ADAPTABLE` — correspond au logement **évolutif** de `VAL-PMR-022` : un
  cheminement accessible atteint le séjour **et le cabinet d'aisances**, la
  mise en accessibilité restant réalisable par des travaux simples. Ce niveau
  est sourcé, il n'est pas une invention de gradation ;
- `ACCESSIBLE` — espace libre de 0,80 × 1,30 latéral à la cuvette hors
  débattement (`VAL-PMR-012`, à confirmer), passage utile 0,83 m à la porte
  d'entrée du logement et 0,77 m aux portes intérieures, hauteur de cuvette
  portée à 0,50 m.

Activer `ACCESSIBLE` fait passer la pièce en classe LARGE dans les faits, mais
**par conséquence, jamais par équivalence** : c'est le transfert latéral qui
impose la surface, pas la surface qui produit l'accessibilité.

## 15. Critères de qualité spatiale

Variables discriminantes pour cette pièce, par ordre d'utilité :

| Variable | Ce qu'elle capte ici |
|---|---|
| `door_conflicts` | le défaut n° 1 de la pièce ; binaire, `INVALID` |
| `equipment_accessibility` | lave-mains atteint sans contourner la cuvette |
| `dead_space` | surface résiduelle d'une pièce en L subie |
| `shape_complexity` | nombre de décrochements ; un WC ne devrait en avoir aucun |
| `functional_overlap` | **bonus** : ici le recouvrement des zones est une qualité |
| `network_complexity` | distance au mur humide le plus proche |
| `spatial_efficiency` | surface utile / surface totale |
| `privacy` | vue directe sur la cuvette depuis la porte |
| `circulation_efficiency` | peu discriminante : la pièce est terminale |

Bonus et malus **conceptuels**, sans pondération figée :

```text
door_fixture_conflict        = INVALID
mur_humide_partage           = favorable
communication_cuisine        = INVALID
surface_au_dela_de_3m2       = defavorable, croissant
decrochement_sans_cause      = defavorable
recouvrement_des_zones       = favorable
```

`functional_overlap` mérite d'être signalé : dans la plupart des pièces, un
recouvrement de zones d'usage est un défaut. Ici c'en est un **critère de
qualité** — une implantation qui n'y recourt pas gaspille la moitié de la
pièce. Une pondération globale au moteur se tromperait de signe.

## 16. Synthèse

| Paramètre | Minimal | Moyen | Large |
|---|---:|---:|---:|
| Surface cible | 0,95 – 1,25 m² | **1,30 – 1,80 m²** | 2,0 – 3,5 m² |
| Largeur préférée | 0,80 – 0,90 | 0,90 – 1,10 | 1,20 – 1,60 |
| Profondeur préférée | 1,20 – 1,40 | 1,45 – 1,70 | 1,70 – 2,20 |
| Cuvette | ✓ | ✓ | ✓ |
| Lave-mains | option | ✓ | ✓ |
| Rangement | non | option | ✓ |
| Extraction | ✓ | ✓ | ✓ |
| Dégagement frontal | ≥ 0,60 | ≥ 0,70 | ≥ 0,80 |
| Dégagement latéral | ≥ 0,20 | ≥ 0,25 | ≥ 0,25 |
| Formes | rectangle | rectangle, carré | rectangle, carré |
| Porte | coulissante ou extérieure | idem | toutes, si vérifiée |
| Accessibilité | non | adaptable possible | intégrable |

## 17. Traduction TechnoHab

```text
ROOM_TYPE  TOILET_SEPARATE
FAMILY     SANITARY_CLOSET
ROLE       service
AGREMENT   0.5           # un WC plus grand n'apporte rien
MAX_RATIO  ~2.0 × besoin # à calibrer : plafond doctrinal N3, jamais un centile mesuré

REQUIRED_OBJECTS
- toilet_pan            footprint 0.40 × 0.70, anchor wall, convention conservatrice C4
REQUIRED_SERVICES
- eau_froide, evacuation, ventilation, electricite
OPTIONAL_OBJECTS
- hand_basin            minRoomArea 1.3
- storage               minRoomArea 2.0
- window, mirror, towel_rail, hygienic_shower, outlet   # sans emprise 2D

FUNCTIONAL_ZONES
- toilet_front    front 0.60 HARD / 0.70 TARGET / 0.80 COMFORT, width 0.60, shared
- toilet_side     side  0.20 HARD / 0.25 TARGET, des deux côtés, shared
- basin_front     front 0.50 HARD / 0.60 TARGET, shared
- door_swing      exclusive, si porte battante, éprouvé isolément
- transfer_zone   0.80 × 1.30 latéral, mode ACCESSIBLE uniquement         # MANQUANT

HARD_CONSTRAINTS
- enveloppe de cuvette utilisable
- S3 : aucun recouvrement débattement × emprise ou zone requise
- S4 : chemin continu de la porte à chaque zone d'usage
- pas de communication directe avec cuisine ou pièce de repas   (REF-008)
- extraction raccordable                                        (REF-009)
- évacuation raccordable

SOFT_CONSTRAINTS
- proche du noyau technique et de la salle d'eau
- desservi depuis une circulation
- lave-mains sur le trajet porte → cuvette
- séparation acoustique des chambres
- géométrie rectangulaire
- lumière naturelle

PREFERRED_ADJACENCIES     technical_core, bath, circulation, entree, buanderie
UNDESIRABLE_ADJACENCIES   bedroom, dining
FORBIDDEN_RELATIONS       door(wc, kitchen), door(wc, dining)

SIZE_CLASSES    MINIMAL | MEDIUM | LARGE      # vocabulaire, non champ de donnée
ACCESSIBILITY   STANDARD | ADAPTABLE | ACCESSIBLE
```

---

## Annexe — écarts au moteur, au 27 août 2026

Ce que ce profil suppose et que le moteur ne fait pas. Classé par nature, parce
que le coût n'est pas le même.

**Écarts de donnée** — corrigibles dans `socle.data.js`, sans mécanisme :

1. **[résolu C4] le dégagement latéral** est deux zones de 0,20 m minimum et
   0,25 m cible ; le domaine compilé devient 0,80 × 1,30 m ;
2. **[résolu C4] `services: ['ventilation']`** est déclaré sur le type `wc` ;
3. **[résolu C4] `minimalRect`** est retiré : le domaine calculé et versionné
   par le solveur est l'unique autorité ;
4. **[résolu O1] `maxRatio: 3.5`**, canon `VAL-WC-PROGRAM-AREA-MAX-RATIO-001` :
   agrément nul, allocation fermée au plancher et plafond HARD/N3 consommé par
   les poseurs et le verdict. Pire témoin : 3,48 m² utiles, contre 8,96 m² ;
5. **la cuvette 0,40 × 0,70 n'est pas sourcée** — statut `[D]` sur un
   recoupement invalidé.

**Écarts de mécanisme** — un lot chacun, tous déjà rattachés :

6. **[résolu M2/M4]** `S3` et `S4` participent au BuiltPlan avant sélection ;
   leur preuve C-P0.2 est verte ;
7. **[résolu M2]** la porte et son débattement sont construits avant verdict ;
8. **[partiel M3]** les adjacences sont typées, mais `REF-008` — communication
   directe avec cuisine ou repas — n'est pas encore traduite par le profil ;
9. **[résolu O1] la cession et les décrochements refusent une pièce plafonnée** :
   le WC ne redevient plus variable d'ajustement après l'allocation ;
10. **[résolu M4b]** le polygone utile, et non la partie principale, fait foi.

**Note sur le cache.** Cette dette historique est fermée : depuis C4, les deux
zones latérales portent la largeur utile à 0,80 m et le domaine versionné
annonce 0,80 × 1,30 m. Le cache rectangulaire et le solveur concordent sur ce
profil ; M4b retire son autorité dès que la pièce devient polygonale.
