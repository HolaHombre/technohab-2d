# Profil de pièce — Salle d'eau avec WC intégré

**`BATHROOM_WITH_TOILET` · composition `bath` + `wc` · maturité `C4` · audit C-P0.2 du 31 août 2026**

**Canon consommable.** Ce profil composé résout dans
`assets/canonical-values.data.js` les valeurs des portées `BATHROOM` et
`TOILET_SEPARATE` par son identifiant propre `BATHROOM_WITH_TOILET`. Il partage
donc exactement les `VAL-WC-*` du WC séparé et les valeurs `VAL-BATH-*` de
l’hôte. Les statuts provisoires restent visibles : C4 prouve ces conventions
isolément, sans les promouvoir en normes.

Second profil du lot **C-P0**, et premier écrit sur un **programme composé**.
Gabarit : [`GABARIT_PIECE.md`](../GABARIT_PIECE.md). Profil frère :
[`wc-separe.md`](wc-separe.md), qui fait foi sur tout ce qui concerne la
cuvette et n'est pas répété ici.

**Ce profil n'est pas un type de pièce.** Le moteur traite la salle d'eau avec
WC comme la composition de deux programmes sur une pièce unique — table
`COMPOSITIONS` de `room-model.js`, drapeau `integratedWc`. C'est le bon modèle,
et ce profil ne propose pas de le changer. Il décrit ce que la composition doit
produire, et relève ce qu'elle produit réellement.

**Maturité C4**, comme le profil frère : le programme composé possède une
absorption explicite, une relation entre ses deux programmes, deux domaines
`eau/bain` versionnés et des cas isolés de passage, refus et conflit de battant.
Le verdict exact est depuis entré dans M2/M4.

**Décision C-P0.2 : maintien en C4.** Le trajet construit de la variante
`eau` est prouvé — composition, cuvette, douche, lavabo, S3, S4, ancrages,
canon et zéro `HARD`. C5 reste refusé : `bain` n'est jamais sélectionnée en
génération, les optionnels et services ne suivent pas tout le pipeline, S1–S6
ne sont pas publiées comme une série complète, et le profil composé dépend
encore de l'hôte `BATHROOM` C2. Le registre exécutable est
`scripts/references/C_P0_INTEGRATION_AUDIT.json`.

---

## 1. Définition fonctionnelle

```text
ROOM_TYPE   BATHROOM_WITH_TOILET
FAMILY      WET_ROOM
COMPOSITION bath + wc
VARIANTS    eau (douche) | bain (baignoire)

PRIMARY_FUNCTIONS
- se laver : douche ou bain
- se laver les mains, le visage, les dents
- utiliser les toilettes
- s'habiller et se sécher après la toilette

SECONDARY_FUNCTIONS
- faire sécher le linge de toilette
- ranger produits, linge et nécessaire d'entretien
- nettoyer la pièce
- évacuer humidité et odeurs
```

**Ce que l'intégration supprime, et c'est la seule question qui compte.** Une
salle d'eau avec WC n'est pas une salle d'eau améliorée : c'est une pièce qui
**perd l'usage simultané**. Deux personnes ne peuvent plus, l'une se doucher,
l'autre utiliser les toilettes. Le WC séparé n'existe que pour restaurer cette
simultanéité, à la pointe matinale.

La décision d'intégrer n'est donc **ni dimensionnelle ni économique, elle est
topologique** : elle dépend du nombre d'occupants et du nombre de pièces d'eau,
jamais de la surface disponible. Un logement d'une personne n'a rien à gagner à
séparer ; un logement de quatre personnes avec une seule salle d'eau a tout à y
perdre. C'est ce que le moteur devrait interroger — il expose aujourd'hui une
case `includeWc` sans lier son défaut au programme.

Usage typique : un utilisateur à la fois, deux dans les variantes larges avec
double vasque ; pointe matinale ; usage long le soir en variante `bain`.

## 2. Équipements

| Équipement | Minimal | Moyen | Large | Nature | Emprise 2D |
|---|---|---|---|---|---|
| Douche *(variante `eau`)* | obligatoire | obligatoire | obligatoire | fonctionnel | **oui** |
| Baignoire *(variante `bain`)* | obligatoire | obligatoire | obligatoire | fonctionnel | **oui** |
| Lavabo ou vasque | obligatoire | obligatoire | obligatoire | fonctionnel | **oui** |
| Cuvette | obligatoire | obligatoire | obligatoire | fonctionnel | **oui** |
| Extraction / VMC | obligatoire | obligatoire | obligatoire | **réglementaire** `REF-009` | non — `service` |
| Éclairage | obligatoire | obligatoire | obligatoire | réglementaire | non |
| Miroir | obligatoire | obligatoire | obligatoire | fonctionnel | non |
| Porte-serviette ou sèche-serviettes | recommandé | oui | oui | confort | **oui** au-delà de 4 m² |
| Rangement produits | recommandé | oui | oui | confort | oui en Moyen et Large |
| Poubelle | oui | oui | oui | confort | négligeable |
| Meuble sous-vasque | — | oui | oui | confort | inclus dans le lavabo |
| Double vasque | — | — | oui | confort | gamme du lavabo |
| Douche **et** baignoire | — | — | oui | confort | oui |
| Machine à laver | — | option | option | fonctionnel | **oui**, voir §11 |
| Fenêtre | souhaitable | souhaitable | souhaitable | confort | contrainte de façade |
| Lave-mains séparé | **non** | **non** | **non** | — | — |

### Le lave-mains n'a rien à faire ici — et le moteur l'y met

`mergeProgram()` verse les équipements du programme absorbé sans se demander
si l'un d'eux fait doublon. Mesuré le 26 août :

```text
bath/eau 4 m² intégré=true → shower, washbasin, towel_rail, wc_pan, handbasin
```

La pièce reçoit **un lavabo de 0,60 × 0,50 et un lave-mains de 0,40 × 0,30**.
Personne n'installe un lave-mains dans une salle de bains qui a déjà un lavabo :
le lave-mains du profil WC n'existe que parce qu'un WC séparé n'a pas de
lavabo. Absorbé, il devient un doublon fonctionnel, un raccordement de plus, et
il coûte de la surface :

| Programme | Plus petit rectangle meublable |
|---|---|
| `eau` + WC, **état actuel** | 1,50 × 2,00 = **3,00 m²** |
| `eau` + WC, sans le lave-mains | 1,10 × 2,40 = **2,64 m²** |
| `bain` + WC, état actuel | 1,70 × 2,20 = 3,74 m² |
| `bain` + WC, sans le lave-mains | 1,70 × 2,20 = 3,74 m² |

**0,36 m² et 12 % de surface minimale** en variante `eau`, plus une largeur
imposée de 1,50 au lieu de 1,10. En variante `bain`, coût nul : la baignoire
domine le domaine, le doublon s'y loge sans rien changer — ce qui explique
qu'il soit passé inaperçu.

Le socle n'a pas de mot pour « équipement rendu superflu par un autre ». C'est
un mécanisme manquant, pas une donnée fausse : une composition a besoin d'une
règle d'**absorption**, distincte du simple cumul.

## 3. Dimensions des équipements

| Objet | Compact | Standard | Grand | Statut |
|---|---|---|---|---|
| Douche | 0,80 × 0,80 | **0,90 × 0,90** *(seule au socle)* | 1,00 × 1,00 | `VAL-EQ-032` / `VAL-EQ-031` N2 ; grand `N3` |
| Baignoire | 1,60 × 0,70 | 1,70 × 0,70 | 1,80 × 0,80 | `VAL-EQ-030` N2 ; 1,60 et 1,80 `N3` |
| Lavabo | 0,50 × 0,45 | 0,60 × 0,50 | 1,20 × 0,55 *(double)* | socle ; non sourcé |
| Cuvette | voir [`wc-separe.md`](wc-separe.md) §3 | | | |
| Sèche-serviettes | — | 0,60 × 0,15 | 0,60 × 0,20 | socle ; non sourcé |
| Meuble sous-vasque | — | 0,60 × 0,50 | 0,80 × 0,55 | `N3`, non activé |

**Aucune de ces gammes n'est livrée.** Vérifié le 26 août : seuls le canapé et
le lit portent un champ `sizes` dans le socle — le lot G1 s'est arrêté là.
Douche, baignoire et lavabo restent à **une** emprise unique : 0,90 × 0,90,
1,70 × 0,70, 0,60 × 0,50. Les plages ci-dessus sont donc celles proposées par
`GAMMES_EQUIPEMENTS.md` §5.3 et §5.4, **pas** celles que le moteur applique.

La conséquence est directe sur ce profil : la douche compacte 0,80 × 0,80 —
l'abaissement de plancher le mieux sourcé du chantier 8, `VAL-EQ-032` portant
le receveur compact comme « admis en petite surface » — **n'existe pas dans le
moteur**. Toutes les surfaces minimales mesurées ici sont donc calculées avec
une douche de 0,90, et la classe MINIMAL de ce profil descendra le jour où le
lot G2 livrera cette gamme. C'est le seul chiffre de ce profil dont on sait
d'avance qu'il va bouger, et dans quel sens.

## 4. Enveloppes d'usage

```text
PHYSICAL_FOOTPRINT     douche/baignoire, lavabo, cuvette, sèche-serviettes, rangement
EXCLUSIVE_USAGE_ZONE   aucune
SHARED_USAGE_ZONE      devant chaque appareil, et la circulation
TEMPORARY_SWING_ZONE   débattement de porte ; porte de douche si battante
ACCESS_ZONE            porte → lavabo, porte → cuvette, porte → douche/baignoire
TRANSFER_ZONE          mode ACCESSIBLE uniquement
```

| Dégagement | `HARD_MIN` | `TARGET` | `COMFORT` | Statut |
|---|---:|---:|---:|---|
| Devant la douche | 0,60 | 0,70 | 0,80 | socle : 0,80 ; `N3` en dessous |
| Devant la baignoire | 0,70 | 0,80 | 1,00 | socle : 0,80 |
| Devant le lavabo | 0,70 | 0,80 | 1,10 | socle `min` 0,80, `comfort` 1,10 `VAL-EQ-033` |
| Devant la cuvette | 0,60 | 0,70 | 0,80 | `[S3]` pour 0,60 |
| Latéral de cuvette | 0,20 | 0,25 | 0,30 | `[S3]` ; **absent du socle** |
| Passage utile résiduel | 0,60 | 0,70 | 0,90 | `N3` |

**Le recouvrement est ici la règle, comme au WC, mais il porte davantage.**
Cinq appareils, cinq zones frontales, un seul utilisateur : additionner les
enveloppes produirait une pièce de 8 m² là où 3,5 suffisent. Le solveur le fait
correctement — les zones ne se gênent que si l'une est `exclusive`, et aucune
ne l'est ici.

**Une exception mérite d'être posée : la zone de sortie de douche ou de bain.**
On en sort mouillé, debout, en se retournant. Ce n'est pas une zone frontale
ordinaire, et c'est la seule de la pièce qui gagnerait à être marquée
`exclusive` — non pour interdire le recouvrement avec la circulation, qui est
naturel, mais pour interdire qu'un rangement ou la cuvette s'y installe. Le
mécanisme existe ; la déclaration n'est pas faite. À trancher en C3, pas ici :
la poser sans mesure durcirait le domaine d'une pièce déjà contrainte.

## 5. Trois classes dimensionnelles

Les seuils ci-dessous sont calés sur les domaines **mesurés**, non décrétés.

### MINIMAL — `eau` 3,0 à 4,0 m² · `bain` 3,8 à 4,5 m²

Douche 0,80 ou 0,90, lavabo simple, cuvette. Ni sèche-serviettes, ni rangement,
ni fenêtre exigée. Les rectangles compacts de référence sont désormais
**1,40 × 2,20 en `eau`** et **1,70 × 2,10 en `bain`**. Les fronts de Pareto
complets, calculés après absorption du lave-mains et ajout des dégagements
latéraux, sont figés dans `scripts/references/C_P0_ENVELOPES.json`.

Compromis acceptés : douche compacte, pas de rangement, porte coulissante.
**Jamais acceptés** : cuvette sans dégagement latéral ; débattement de porte sur
un appareil ; sortie de douche donnant directement sur la cuvette ; lavabo
inatteignable sans traverser la zone de douche.

### MOYEN — 4,0 à 6,0 m² · **cas de référence**

Douche 0,90, lavabo avec meuble, cuvette, sèche-serviettes, rangement.
Organisation recommandée : **lavabo près de la porte, cuvette au milieu, douche
ou baignoire au fond**. La cuvette n'est jamais le premier objet vu depuis la
porte ouverte.

### LARGE — 6,0 à 9,0 m²

Double vasque, douche **et** baignoire, rangement fermé, éventuellement machine
à laver. C'est la classe où la pièce peut redevenir **simultanée** : deux
personnes au lavabo double, une cloison basse ou une niche isolant la cuvette.

**Au-delà d'environ 9 m², les gains s'effondrent.** La bonne réponse n'est plus
d'agrandir mais de scinder : WC séparé, ou salle d'eau de suite parentale plus
salle d'eau commune. C'est cette valeur qui alimente le `maxRatio`, absent du
socle pour ce type comme pour tous les autres sauf la circulation.

### Le plancher actuel interdit la forme minimale

`minProgramSide` vaut 1,70 m pour `bath`. Or le plus petit rectangle meublable
en `eau` + WC mesure **1,50** × 2,00. La forme la plus compacte qui fonctionne
est donc refusée par une convention de dignité d'usage, non par un défaut
d'usage. Ce n'est pas incohérent — le plancher est volontairement plus exigeant
que la meublabilité — mais cela doit être su : ce que le moteur refuse ici, il
le refuse par choix, et ce choix n'a jamais été confronté à la mesure.

## 6. Règles d'agencement

| Relation | Niveau |
|---|---|
| Débattement de porte sur un appareil ou sa zone d'usage | `FORBIDDEN` (`S3`) |
| Lavabo et appareil humide principal sur des murs différents | `PREFERRED` — `BATH-USE-001`, actif |
| Lavabo atteignable sans traverser la zone de douche | `REQUIRED` |
| Cuvette visible depuis la porte ouverte | `UNDESIRABLE` |
| Cuvette contre la sortie de douche ou de baignoire | `UNDESIRABLE` |
| Cuvette ancrée à un mur, dégagement latéral des deux côtés | `REQUIRED` |
| Douche en angle | `PREFERRED` — ancrage `corner`, déjà au socle |
| Baignoire le long d'un mur, extrémité contre un retour | `PREFERRED` |
| Sèche-serviettes à portée depuis douche **et** lavabo | `PREFERRED` |
| Machine à laver dans la zone de séchage du corps | `UNDESIRABLE` |
| Rangement empiétant sur une zone d'usage | `FORBIDDEN` |

La seule relation aujourd'hui **active** est `BATH-USE-001`, en `GUIDELINE`.
Aucune relation ne concerne la cuvette dans la pièce composée : le programme
absorbé apporte ses équipements, jamais de relation avec ceux de l'hôte. C'est
le second défaut de composition — le cumul porte sur les objets, pas sur les
liens.

## 7. Circulations

```text
PORTE → LAVABO            principale, la plus fréquente
PORTE → CUVETTE           principale
PORTE → DOUCHE/BAIGNOIRE  principale
DOUCHE → SERVIETTE        secondaire, courte, mouillée
CUVETTE → LAVABO          secondaire, obligatoire à l'usage
```

Deux trajectoires méritent une attention propre à cette pièce :

- **la sortie mouillée** — de la douche au sèche-serviettes puis à la zone
  d'habillage. Elle doit être courte et ne pas traverser la zone d'accès à la
  cuvette ;
- **cuvette → lavabo** — obligatoire, jamais contournante. Dans une pièce
  composée, elle est presque toujours satisfaite ; c'est le WC séparé qui a un
  problème sur ce trajet, pas celui-ci. C'est même l'argument fonctionnel le
  plus solide en faveur de l'intégration.

Cul-de-sac acceptable : la pièce est terminale. Aucune circulation ne la
traverse, et rien ne doit y aboutir.

## 8. Porte et accès

| Solution | Rang |
|---|---|
| Ouvrant vers l'extérieur | `BEST` |
| Coulissante | `ACCEPTABLE` — réserve acoustique et d'étanchéité |
| Ouvrant vers l'intérieur, conflit vérifié absent | `ACCEPTABLE` au-delà de ~5 m² |
| Ouvrant vers l'intérieur en classe Minimal | `UNDESIRABLE` |
| Débattement recouvrant un appareil ou une zone requise | `FORBIDDEN` (`S3`) |

Contrairement au WC séparé, cette pièce est assez grande pour absorber un
battant vers l'intérieur dès la classe Moyenne : c'est la solution la plus
courante et la moins coûteuse. La règle `S3` suffit à la trancher **le jour où
elle est évaluée** ; en attendant, le moteur pose une porte battante sans
vérifier quoi que ce soit, et `debattement: null`.

## 9. Formes de la pièce

| Forme | Pertinence | Classes | Réserve |
|---|---|---|---|
| Rectangle longitudinal | **excellente** | toutes | appareils sur un ou deux murs longs |
| Rectangle transversal | bonne | Moyen, Large | impose une répartition sur trois murs |
| Carré | excellente | Moyen, Large | ≥ 2,00 × 2,00 |
| L | acceptable **si subie** | Large | peut isoler la cuvette, seul cas où le L sert |
| Trapèze, polygone | tolérée avec pénalité | Large | sous rampant, mur oblique |

Cette pièce est la seule du logement où un **L peut être un gain** : le
décrochement isole la cuvette du reste, ce qui restaure une part de la
simultanéité perdue. Cela n'autorise pas à en créer un par défaut — le solveur
ne servirait la pièce que par sa partie principale (lot M4b), et le gain serait
invisible pour lui.

## 10. Archétypes d'implantation

**A — longitudinale, classe Moyenne.** Réseaux sur un seul mur.

```text
┌──────────────────┐
│ lavabo  WC       │
│                  │
│           douche │
└───   ────────────┘
   porte
```

**B — transversale, deux murs.** L'ordre d'usage est respecté depuis la porte.

```text
┌────────────────┐
│ douche      WC │
│                │
│ lavabo         │
└──────   ───────┘
      porte
```

**C — variante `bain`, classe Moyenne.**

```text
┌──────────────────┐
│    baignoire     │
│                  │
│ lavabo        WC │
└────────   ───────┘
       porte
```

**D — mauvaise configuration.** La cuvette face à la porte, la sortie de douche
sur son dégagement, le lavabo au fond.

```text
┌──────────────────┐
│ douche           │
│      ↓           │
│      WC   lavabo │
└───   ────────────┘
   porte      ← cuvette vue de la porte,
                sortie de douche sur son dégagement
```

Aucune règle active ne refuse aujourd'hui la configuration D.

## 11. Relations avec les autres pièces

| Relation | Niveau | Motif |
|---|---|---|
| ↔ gaine ou local technique | `VERY_FAVORABLE` | la pièce la plus chargée en réseaux du logement |
| ↔ buanderie | `VERY_FAVORABLE` | eau, évacuation, extraction mutualisées |
| ↔ chambre | `FAVORABLE` | inverse du WC séparé : la proximité est ici un service |
| ↔ circulation | `FAVORABLE` | desserte sans traverser une pièce habitée |
| ↔ autre pièce d'eau | `FAVORABLE` | colonne commune |
| ↔ séjour, accès direct | `UNDESIRABLE` | intimité, humidité, bruit |
| ↔ zone de repas | `UNDESIRABLE` | |
| **Porte → cuisine** | `FORBIDDEN` *(à instruire)* | voir §13 |

**Le renversement par rapport au WC séparé mérite d'être noté.** Le WC séparé
fuit les chambres — bruit, usage par les visiteurs. La salle d'eau les
recherche : c'est le trajet nuit → toilette qui commande, et il est privé. Les
deux profils tirent donc en sens opposés sur la même adjacence, ce qui est
correct et doit rester exprimable : un moteur qui ne connaîtrait qu'une règle
« pièce d'eau ↔ chambre » se tromperait pour l'une des deux.

**La machine à laver** n'est pas neutre topologiquement : la placer ici évite
une buanderie mais ajoute bruit, encombrement et un usage qui n'a rien de
sanitaire. À traiter en C-P3 avec la buanderie, pas ici.

## 12. Contraintes techniques

```text
REQUIRED_SERVICES  eau_froide, eau_chaude, evacuation, ventilation, electricite
```

La pièce la plus chargée du logement : trois à quatre appareils raccordés en
alimentation et en évacuation, dont une évacuation en diamètre 100 pour la
cuvette et un siphon de sol ou de receveur pour la douche.

Conséquence d'implantation forte : **grouper les appareils sur un ou deux murs
techniques** raccourcit le réseau, réduit le nombre de percements et concentre
l'acoustique. C'est le critère `network_complexity` du §15, et il devrait peser
davantage ici que dans toute autre pièce.

Le type `bath` porte déjà `services: ['ventilation']`. L'extraction relève de
`REF-009` ; ses débits dépendent de la configuration du logement et ne
s'écrivent pas en dur — a fortiori dans une pièce qui cumule un point de bain
et un cabinet d'aisances, cas où les textes distinguent les situations.

## 13. Réglementation française

| Point | Portée | Statut |
|---|---|---|
| Sortie d'air permanente en pièce de service | Arrêté du 24 mars 1982 | `REF-009` — **retenu** |
| Le cabinet d'aisances ne communique pas directement avec une cuisine ni une pièce de repas | RSD type | `REF-008` — **retenu pour le WC séparé**, **à instruire ici** |
| Volumes de protection électrique autour des appareils sanitaires | NF C 15-100 | **non traité** — dimension verticale et électrique, hors périmètre 2D |
| Espace libre 0,80 × 1,30 latéral à la cuvette | accessibilité | `VAL-PMR-012` — à confirmer |
| Douche accessible sans ressaut, aire de rotation Ø 1,50 m | accessibilité | `VAL-PMR-001` vérifié ; application à la douche **à confirmer** |

**Le point à instruire est important.** Le RSD interdit la communication
directe entre un *cabinet d'aisances* et une cuisine. Une salle de bains
contenant une cuvette est-elle un cabinet d'aisances au sens du texte ? La
lecture littérale le suggère, mais **ce profil ne tranche pas** : c'est une
question de qualification juridique, pas de conception. Tant qu'elle n'est pas
instruite dans `VEILLE_NORMATIVE.md`, l'interdiction est appliquée par prudence
et signalée comme interprétation, jamais présentée comme établie.

Les volumes de la NF C 15-100 sont hors périmètre — le moteur raisonne en plan.
Ils reviendront si une élévation est produite un jour ; les noter ici évite de
croire qu'ils ont été oubliés.

## 14. Accessibilité

```text
SIZE_CLASS     MINIMAL | MEDIUM | LARGE
ACCESSIBILITY  STANDARD | ADAPTABLE | ACCESSIBLE
```

C'est dans cette pièce que l'axe accessibilité coûte le plus cher, et c'est
elle qui décide de la faisabilité d'un logement adapté :

- `STANDARD` — aucune exigence supplémentaire ;
- `ADAPTABLE` — logement **évolutif** au sens de `VAL-PMR-022` : la pièce doit
  pouvoir devenir accessible par des travaux simples. Concrètement : réserver
  les renforts de cloison, prévoir une douche transformable sans ressaut, ne
  pas caler la pièce au plus juste. Aucune de ces réserves n'est aujourd'hui
  représentable dans le moteur ;
- `ACCESSIBLE` — aire de rotation Ø 1,50 m hors débattement, douche sans
  ressaut, espace de transfert latéral à la cuvette, lavabo dégagé en dessous.
  La pièce passe alors mécaniquement au-dessus de 5 m².

**Jamais `LARGE = ACCESSIBLE`.** Une salle d'eau de 7 m² tout en longueur
n'offre pas Ø 1,50 m ; une pièce de 5 m² carrée l'offre. C'est la forme qui
décide, pas la surface — et c'est précisément ce que le moteur, qui alloue par
surface, ne sait pas voir.

## 15. Critères de qualité spatiale

| Variable | Ce qu'elle capte ici |
|---|---|
| `door_conflicts` | débattement sur appareil — `INVALID` |
| `network_complexity` | nombre de murs porteurs de réseaux ; le critère le plus discriminant de cette pièce |
| `equipment_accessibility` | lavabo atteint sans traverser la zone de douche |
| `functional_overlap` | **bonus** : le recouvrement des zones est une qualité |
| `privacy` | cuvette visible depuis la porte ouverte |
| `wet_dry_separation` | propre à cette pièce : la sortie mouillée ne traverse pas les zones sèches |
| `dead_space` | angles perdus autour d'une baignoire |
| `spatial_efficiency` | surface utile / surface totale |
| `shape_complexity` | un décrochement n'est ici un défaut que s'il n'isole rien |

```text
appareils_sur_un_seul_mur_technique   = favorable, fort
sortie_humide_traversant_zone_seche   = defavorable
cuvette_face_a_la_porte               = defavorable
door_fixture_conflict                 = INVALID
lavabo_derriere_la_douche             = INVALID
surface_au_dela_de_9m2                = defavorable, croissant
recouvrement_des_zones                = favorable
```

`wet_dry_separation` n'existe dans aucune autre pièce et ne se déduit d'aucun
critère générique. C'est le premier critère **propre à un profil** rencontré :
le moteur devra accepter qu'une pièce apporte sa variable de qualité, sinon
tous les profils seront jugés sur le plus petit dénominateur commun.

## 16. Synthèse

| Paramètre | Minimal | Moyen | Large |
|---|---:|---:|---:|
| Surface cible `eau` | 3,0 – 4,0 m² | **4,0 – 6,0 m²** | 6,0 – 9,0 m² |
| Surface cible `bain` | 3,8 – 4,5 m² | 4,5 – 6,5 m² | 6,5 – 9,0 m² |
| Plus petit rectangle mesuré | 1,50 × 2,00 `eau` · 1,70 × 2,20 `bain` | — | — |
| Douche | 0,80 – 0,90 | 0,90 | 0,90 – 1,00 |
| Lavabo | simple | simple + meuble | double possible |
| Cuvette | ✓ | ✓ | ✓ + isolable |
| Sèche-serviettes | option | ✓ | ✓ |
| Rangement | non | ✓ | ✓ fermé |
| Extraction | ✓ | ✓ | ✓ |
| Formes | rectangle | rectangle, carré | toutes, L utile |
| Porte | extérieure ou coulissante | toutes si vérifiée | toutes |
| Usage simultané | non | non | possible |
| Accessibilité | non | adaptable | intégrable |

## 17. Traduction TechnoHab

```text
ROOM_TYPE    BATHROOM_WITH_TOILET
COMPOSITION  bath + wc            # mécanisme existant, conservé
VARIANTS     eau | bain
ROLE         service
AGREMENT     0.6
MAX_RATIO    ~2.0 × besoin        # plafond doctrinal N3, à calibrer

ABSORPTION_RULES
- wc.handbasin absorbé par bath.washbasin  → non désigné
- wc.mirror, wc.towel_rail absorbés        → non désignés

REQUIRED_OBJECTS
- shower | bathtub    selon variante, gammes livrées
- washbasin           gamme simple/double
- toilet_pan          voir wc-separe.md
REQUIRED_SERVICES
- eau_froide, eau_chaude, evacuation, ventilation, electricite
OPTIONAL_OBJECTS
- towel_rail          minRoomArea 4
- storage             minRoomArea 5
- washing_machine     minRoomArea 6, à trancher en C-P3
- window, mirror                                   # sans emprise 2D

FUNCTIONAL_ZONES
- shower_front    0.60 HARD / 0.70 TARGET / 0.80 COMFORT, shared
- tub_front       0.70 / 0.80 / 1.00, shared
- basin_front     0.70 / 0.80 / 1.10, shared
- toilet_front    0.60 / 0.70 / 0.80, shared
- toilet_side     0.20 / 0.25, des deux côtés
- drying_zone     sortie de douche ou de bain, exclusive ?       # À TRANCHER
- door_swing      exclusive si battante, éprouvé isolément
- rotation_1500   mode ACCESSIBLE uniquement                     # MANQUANT

HARD_CONSTRAINTS
- chaque appareil requis logé, programme composé compris
- S3 : aucun recouvrement débattement × emprise ou zone requise
- S4 : chemin continu de la porte à chaque zone d'usage
- lavabo atteignable sans traverser la zone de douche
- extraction et évacuation raccordables

SOFT_CONSTRAINTS
- appareils groupés sur un ou deux murs techniques
- lavabo près de la porte, appareil humide au fond
- cuvette non visible depuis la porte ouverte
- sortie humide ne traversant pas les zones sèches
- proche des chambres, à distance du séjour et des repas
- lumière naturelle

PREFERRED_ADJACENCIES     technical_core, buanderie, bedroom, circulation
UNDESIRABLE_ADJACENCIES   living, dining
FORBIDDEN_RELATIONS       door(bath_wc, kitchen)      # à instruire, §13

SIZE_CLASSES    MINIMAL | MEDIUM | LARGE
ACCESSIBILITY   STANDARD | ADAPTABLE | ACCESSIBLE
QUALITY_EXTRA   wet_dry_separation                   # critère propre au profil
```

---

## Annexe — écarts au moteur, au 26 août 2026

Ce profil étant le premier écrit sur une composition, ses écarts portent
surtout sur le **mécanisme de composition** lui-même. Trois d'entre eux sont
des découvertes de cette relecture.

**A. [résolu C4] L'absorption est explicite.**
`COMPOSITIONS.bath.absorptions` rend le lave-mains du programme WC superflu
lorsque le lavabo de l'hôte est présent. La désignation expose la paire
`{guest, by}` pour rendre la décision inspectable.

**B. [résolu C4] Une relation traverse les programmes.**
`BATH-WC-WET-001` relie la cuvette à la douche ou à la baignoire au niveau
`GUIDELINE`. Le mécanisme reste générique dans la déclaration de composition.

**C. [résolu M2/M4] Le cache ne porte plus le verdict composé.** La table
ci-dessous conserve le diagnostic qui a déclenché le correctif :

| Rectangle | Règle | Solveur | |
|---|---|---|---|
| 1,40 × 2,20 = 3,08 m² | accepte | **tient** | témoin passant |
| 1,60 × 1,80 = 2,88 m² | refuse | **tient** | faux négatif |
| 1,10 × 2,80 = 3,08 m² | accepte | refuse | faux positif |
| 1,70 × 2,10 = 3,57 m² | accepte | **tient en bain** | témoin variante |

Le BuiltPlan publie désormais `room.furnishable` après résolution conjointe des
programmes et `TH2D-ROOM-002` lui cède l'autorité. Ces faux verdicts du cache ne
sont donc plus publiables.

**D. [résolu M2] La validation d'usage compile la composition.** Le cache
simple reste une présélection bon marché ; `compiledRoomProgram()` réunit
ensuite `bath` et `wc` avant classement et avant publication.

**E. Écarts hérités du profil frère.** Dégagement latéral, conflit de battant,
S4, adjacences typées et polygones sont mécanisés. Restent leur restitution
complète dans le rapport de pièce, les services/réseaux, les relations de
profil et l'activation générique par `trigger`.

**Ce qu'il faut en conclure pour le moteur.** A à D sont consolidés. Le verrou
C5 n'est plus la géométrie composée : c'est la couverture fonctionnelle et la
traçabilité listées par C-P0.2.
