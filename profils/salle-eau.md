# Profil de pièce — Salle d'eau sans WC

**`BATHROOM` · variantes `eau` | `bain` · maturité `C2` · 26 août 2026**

Vague **C-P3**. Gabarit : [`GABARIT_PIECE.md`](../GABARIT_PIECE.md). Source :
[`agencement/salle-de-bain.md`](../agencement/salle-de-bain.md).

**Profil frère : [`salle-eau-wc-integre.md`](salle-eau-wc-integre.md)**, qui
traite la même pièce **avec** cuvette et fait foi sur tout ce qu'elles
partagent — enveloppes des appareils, séparation humide/sec, circulations,
technique, accessibilité. Ce profil-ci ne reprend pas ces sections : il traite
**ce qui change quand le WC n'y est pas**, et ce n'est pas seulement un appareil
en moins.

---

## 1. Définition fonctionnelle

```text
ROOM_TYPE  BATHROOM
FAMILY     WET_ROOM
VARIANTS   eau (douche) | bain (baignoire)
EXISTENCE  compte, from bathrooms — une par salle d'eau demandée

PRIMARY_FUNCTIONS
- se laver : douche ou bain
- se laver les mains, le visage, les dents
- se sécher et s'habiller après la toilette

SECONDARY_FUNCTIONS
- faire sécher le linge de toilette
- ranger produits et linge
- soigner, coiffer, se préparer
```

**Ce que l'absence de WC change.** Une salle d'eau sans cuvette est une pièce
**simultanée** : deux personnes peuvent s'y trouver — l'une à la douche,
l'autre au lavabo — sans conflit d'intimité comparable. C'est l'exact
complément du raisonnement tenu au profil composé : intégrer le WC supprime
cette simultanéité.

Elle suppose donc **un WC séparé ailleurs dans le logement**, et cette
dépendance est réelle : une salle d'eau sans WC dans un logement sans WC
séparé produit un plan invivable. Le moteur exprime ce couple par deux options
indépendantes — `bathrooms` et `includeWc` — dont rien ne vérifie la
cohérence. Voir §11.

Deuxième différence, plus discrète : sans cuvette, la pièce échappe à
l'interdiction de communication avec la cuisine (`REF-008`). Ses adjacences
sont plus libres.

## 2. Équipements

Voir [`salle-eau-wc-integre.md`](salle-eau-wc-integre.md) §2 pour le tableau
complet, cuvette et lave-mains exceptés.

| Équipement | Minimal | Moyen | Large | Emprise 2D |
|---|---|---|---|---|
| Douche `eau` ou baignoire `bain` | obligatoire | obligatoire | obligatoire | **oui** |
| Lavabo | obligatoire | obligatoire | obligatoire | **oui** |
| Extraction | obligatoire | obligatoire | obligatoire | non — `service`, **déclaré** |
| Sèche-serviettes | option | oui, dès 4 m² | oui | oui |
| Rangement | — | option | oui | **absent du socle** |
| Douche **et** baignoire | — | — | oui | oui |
| Double vasque | — | — | oui | gamme non livrée |
| Machine à laver | option | option | option | à trancher, C-P3 |

Le socle porte quatre équipements — `shower`, `bathtub`, `washbasin`,
`towel_rail` — les deux premiers étant mutuellement exclusifs par variante.
**C'est le seul type du socle dont les équipements requis dépendent d'une
variante de pièce**, et le mécanisme fonctionne : `selectedEquipments()` filtre
sur `equipment.variant`.

## 3. Dimensions des équipements

| Objet | Valeur socle | Statut | Gamme proposée |
|---|---|---|---|
| Douche | 0,90 × 0,90 | `VAL-EQ-031` N2 | 0,80 / 0,90 / 1,00 — **non livrée** |
| Baignoire | 1,70 × 0,70 | `VAL-EQ-030` N2 | 1,60 / 1,70 / 1,80 — non livrée |
| Lavabo | 0,60 × 0,50 | non sourcé | simple / double — non livrée |
| Sèche-serviettes | 0,60 × 0,15 | non sourcé | — |

**Le sourcing de cette pièce a nettement progressé depuis la fiche.** Celle-ci
notait : « trois valeurs seulement, la compilation est pauvre », et retenait les
gabarits d'appareils comme des `[H]` — hypothèses de marché non sourcées.
Depuis, `VAL-EQ-030`, `031` et `032` les portent en `N2`. Il reste que **le
lavabo n'est toujours pas sourcé**, alors qu'il est le seul appareil présent
dans les deux variantes.

## 4. Enveloppes d'usage

Voir le profil composé §4 pour la typologie complète des zones. Les valeurs
propres à cette pièce :

| Dégagement | `HARD_MIN` | `TARGET` | `COMFORT` | Statut |
|---|---:|---:|---:|---|
| Devant la douche | 0,60 | 0,70 | 0,80 | `B1` `[S3]` ; **socle : 0,80** |
| Devant le lavabo | 0,70 | 0,80 | 1,10 | `B2` `[S3]` ; socle : 0,80, `comfort` 1,10 |
| Devant la baignoire | 0,70 | 0,80 | 1,00 | non sourcé ; socle : 0,80 |

**L'écart principal de la fiche de sourcing est corrigé, et dépassé.** Elle
relevait un dégagement de 0,50 m, « sous `B1` et `B2` », et demandait de le
relever à 0,70. Le socle porte aujourd'hui **0,80 m** devant tous les
appareils — au-dessus des deux valeurs sourcées. Le second écart — un composant
monolithique de 1,20 × 0,90 agrégeant douche et lavabo — est corrigé lui aussi :
les appareils sont individualisés.

Deux des quatre écarts de cette fiche sont donc résorbés. C'est, avec la
chambre, le meilleur taux de correction du dossier.

## 5. Trois classes dimensionnelles

Domaines **mesurés**, appareils requis seuls :

| Variante | Plus petit rectangle | Plancher `floorOf` |
|---|---|---|
| `eau` — douche + lavabo | 0,90 × 2,20 = **1,98 m²** | 3,00 m² / 1,70 m |
| `bain` — baignoire + lavabo | 1,50 × 2,20 = **3,30 m²** | **3,30 m²** / 1,70 m |

### `bain` est le seul programme du socle dont le plancher soit mesuré

`floorOf` retient le plus exigeant de la meublabilité calculée et de la
convention `minProgramArea`. Pour `bain`, la meublabilité vaut 3,30 m² et la
convention 3,00 : **c'est le calcul qui l'emporte**. Partout ailleurs dans le
socle — séjour, chambre, cuisine, WC, `eau` — c'est la convention.

Cela mérite d'être noté parce que c'est le seul cas où le mécanisme des deux
planchers de `MODELE_EXIGENCES.md` §1 bis produit un effet visible. Ailleurs,
il documente une intention ; ici, il décide.

### MINIMAL — `eau` 3,0 à 4,0 m² · `bain` 3,3 à 4,5 m²

Douche ou baignoire, lavabo, extraction. La largeur libre de 1,50 m est la
contrainte réelle en `eau` — c'est ce que visait `TH2D-SDB-002`, jamais écrite.

### MOYEN — 4,0 à 6,0 m² · **cas de référence**

Ajoute sèche-serviettes dès 4 m² et un rangement — absent du socle. En variante
`eau`, c'est la classe où une seconde personne peut utiliser le lavabo pendant
qu'on se douche.

### LARGE — 6,0 à 9,0 m²

Douche **et** baignoire, double vasque, rangement fermé, machine à laver
éventuelle. **Au-delà de 9 m², les gains s'effondrent** : mieux vaut deux
salles d'eau qu'une grande, puisque ce qu'on cherche est la simultanéité, et
qu'elle se gagne en dédoublant, pas en agrandissant.

C'est le raisonnement le plus net de tout le dossier sur les rendements
décroissants, et il est propre aux pièces d'eau : leur valeur est un **débit**
— combien de personnes servies à l'heure de pointe — et non une surface.

## 6. Règles d'agencement

Identiques au profil composé, cuvette exceptée. Une seule est active :

| Relation | Niveau |
|---|---|
| Lavabo et appareil humide sur des murs différents | `PREFERRED` — `BATH-USE-001`, **actif** |
| Lavabo atteignable sans traverser la zone de douche | `REQUIRED` — non vérifié |
| Douche en angle | `PREFERRED` — `anchor: 'corner'`, tenu |
| Baignoire le long d'un mur | `PREFERRED` — `anchor: 'wall'`, tenu |
| Sortie humide ne traversant pas les zones sèches | `PREFERRED` — non exprimable |
| Débattement de porte sur un appareil | `FORBIDDEN` (`S3`) — non vérifié |

`BATH-USE-001` mérite un mot : elle demande que le lavabo occupe un mur
différent de la douche ou de la baignoire, « pour préserver la façade de
l'équipement humide principal ». C'est une relation `different-wall` en
`GUIDELINE`, correctement classée — un refus dur ici interdirait des petites
salles d'eau parfaitement viables.

## 7. Circulations · 8. Porte et accès · 9. Formes

Voir [`salle-eau-wc-integre.md`](salle-eau-wc-integre.md) §7 à §9. Trois
différences seulement :

- **la trajectoire cuvette → lavabo disparaît**, ce qui libère l'implantation :
  le lavabo n'a plus à être sur le trajet de sortie ;
- **la porte peut ouvrir vers l'intérieur dès la classe Minimal** en `eau` :
  sans cuvette, le mur porteur de la porte reste libre ;
- **le L perd son intérêt.** Dans le profil composé, un décrochement sert à
  isoler la cuvette. Ici il n'isole rien, et redevient un défaut ordinaire.

## 10. Archétypes

**A — `eau`, classe Minimal, largeur 1,50 m.**

```text
┌──────────────┐
│ douche       │
│              │
│       lavabo │
└─────   ──────┘
     porte
```

**B — `bain`, classe Moyenne.**

```text
┌──────────────────┐
│   baignoire      │
│                  │
│ lavabo    sèche- │
│           serv.  │
└────────   ───────┘
        porte
```

**C — mauvaise configuration : le lavabo derrière la douche.**

```text
┌──────────────┐
│ douche       │
│   ↓          │  ← pour atteindre le lavabo,
│       lavabo │     on traverse la zone humide
└───   ────────┘
   porte
```

Rien ne refuse aujourd'hui la configuration C : c'est une règle `REQUIRED` du
§6 qui n'a pas d'implémentation.

## 11. Relations avec les autres pièces

| Relation | Niveau | Motif |
|---|---|---|
| ↔ chambres | `VERY_FAVORABLE` | trajet nocturne, suite parentale |
| ↔ buanderie, gaine technique | `VERY_FAVORABLE` | réseaux mutualisés |
| ↔ WC séparé | `FAVORABLE` | mur humide commun, et la fonction est complémentaire |
| ↔ circulation | `FAVORABLE` | desserte neutre |
| ↔ cuisine | `NEUTRAL` | **et non interdit** — sans cuvette, `REF-008` ne s'applique pas |
| ↔ séjour, accès direct | `UNDESIRABLE` | intimité |

### La dépendance non vérifiée : salle d'eau sans WC, logement sans WC

Le questionnaire expose `bathrooms` et `includeWc` comme deux options
indépendantes. Rien n'empêche de demander deux salles d'eau **sans** WC
séparé — auquel cas `composeInto()` verse la cuvette dans `bath_1`, et la
seconde salle d'eau n'en a pas. C'est correct.

Mais l'inverse mérite attention : **une salle d'eau sans WC n'a de sens que si
un WC existe ailleurs**, et c'est aujourd'hui garanti par construction — le
`trigger` du WC est `always`, avec versement dans `bath_1` si l'option est
décochée. La cohérence est donc tenue, **par le mécanisme de composition et non
par une règle**. Elle tomberait au premier changement de ce mécanisme, sans que
rien ne le signale.

C'est le genre d'invariant qu'il faudrait écrire comme règle plutôt que
constater comme propriété — exactement ce qu'a montré le défaut D3, où une
option faisait disparaître une fonction en silence.

## 12. Contraintes techniques

Voir le profil composé §12. Une différence : le type `bath` **déclare bien**
`services: ['ventilation']`. C'est la seule des trois pièces à extraction —
cuisine, salle d'eau, WC — à le faire. Les deux autres ne le déclarent pas.

## 13. Réglementation française

| Point | Portée | Statut |
|---|---|---|
| Sortie d'air permanente en pièce de service | Arrêté du 24 mars 1982 | `REF-009` — **retenu** |
| Le logement décent comporte une installation sanitaire intérieure | Décret n° 2002-120 — **location** | `REF-002` — à préciser |
| Salle d'eau dans l'unité de vie accessible | `VAL-PMR-020` | vérifié |
| Volumes de protection électrique | NF C 15-100 | non traité, hors 2D |
| Douche accessible sans ressaut, Ø 1,50 m | accessibilité | à confirmer |

**Aucune surface minimale réglementaire.** Les 3 m² du socle sont une
convention, et les 3,30 m² de la variante `bain` sont un **calcul**. La seule
obligation est l'existence d'une installation sanitaire, et elle relève de la
décence — donc du logement mis en location.

`REF-008` — l'interdiction de communiquer avec la cuisine — **ne s'applique pas
ici** : elle vise le cabinet d'aisances. C'est la différence réglementaire
concrète entre ce profil et son frère composé, et elle mérite d'être portée
explicitement, sous peine que le moteur applique par excès de prudence une
interdiction qui n'existe pas.

## 14. Accessibilité

Voir le profil composé §14, moins l'espace de transfert latéral à la cuvette.
Restent : douche sans ressaut, aire de rotation Ø 1,50 m, lavabo dégagé en
dessous.

**Il n'existe toujours aucun profil PMR dans le moteur** — quatrième écart de
la fiche de sourcing, non résorbé. C'est la seule des quatre à ne pas l'être, et
c'est la plus structurante : `VAL-PMR-021` et `022` définissent **deux** profils
distincts, accessible et évolutif, et le socle n'en porte aucun.

## 15. Critères de qualité spatiale

Voir le profil composé §15. Deux variables disparaissent avec la cuvette —
`privacy` et le conflit sortie de douche / cuvette — et une prend plus de
poids :

```text
simultaneite_lavabo_douche   = favorable     # propre à la pièce sans WC
wet_dry_separation           = defavorable si rompue
lavabo_derriere_la_douche    = INVALID
appareils_sur_un_mur_technique = favorable
surface_au_dela_de_9m2       = defavorable, croissant
```

`simultaneite_lavabo_douche` est la contrepartie exacte de ce que le profil
composé perd. Deux profils frères, deux critères opposés sur la même géométrie :
c'est la preuve la plus nette que **le critère de qualité appartient au profil**,
et non au moteur.

## 16. Synthèse

| Paramètre | Minimal | Moyen | Large |
|---|---:|---:|---:|
| Surface `eau` | 3,0 – 4,0 m² | **4,0 – 6,0 m²** | 6,0 – 9,0 m² |
| Surface `bain` | 3,3 – 4,5 m² | 4,5 – 6,5 m² | 6,5 – 9,0 m² |
| Plus petit rectangle mesuré | 0,90 × 2,20 `eau` · 1,50 × 2,20 `bain` | — | — |
| Largeur libre | 1,50 m | 1,70 m | 2,00 m + |
| Sèche-serviettes | option | dès 4 m² | ✓ |
| Rangement | non | option | ✓ |
| Simultanéité | non | partielle | oui |
| Formes | rectangle | rectangle, carré | rectangle, carré |
| Accessibilité | non | adaptable | intégrable |

## 17. Traduction TechnoHab

```text
ROOM_TYPE    BATHROOM
FAMILY       WET_ROOM
VARIANTS     eau | bain
ROLE         service
AGREMENT     0.6
MIN_PROGRAM  eau 3.00 / 1.70 · bain 3.30 / 1.70    # bain : plancher MESURÉ
MAX_RATIO    ~2.0 × besoin                          # plafond doctrinal N3, ≈ 9 m²
SERVICES     eau, eau_chaude, evacuation, ventilation, electricite   # DÉCLARÉ

REQUIRED_OBJECTS
- shower   variante eau  · gamme 0.80 / 0.90 / 1.00     # non livrée
- bathtub  variante bain · gamme 1.60 / 1.70 / 1.80     # non livrée
- washbasin              · gamme simple / double        # non livrée, non sourcé
OPTIONAL_OBJECTS
- towel_rail    minRoomArea 4
- storage       minRoomArea 5                           # MANQUANT au socle
- washing_machine                                       # à trancher, C-P3

HARD_CONSTRAINTS
- appareil humide et lavabo logés
- largeur libre ≥ 1.50
- lavabo atteignable sans traverser la zone de douche   # non vérifié
- extraction et évacuation raccordables
- S3, S4
SOFT_CONSTRAINTS
- lavabo sur un mur différent de l'appareil humide      # ACTIF, BATH-USE-001
- appareils groupés sur un ou deux murs techniques
- sortie humide ne traversant pas les zones sèches
- lumière naturelle

PREFERRED_ADJACENCIES     bedroom, wc, buanderie, technical_core, circulation
NEUTRAL_ADJACENCIES       kitchen        # REF-008 ne s'applique PAS ici
UNDESIRABLE_ADJACENCIES   living
INVARIANT                 un WC existe ailleurs dans le logement   # tenu par construction

SIZE_CLASSES    MINIMAL | MEDIUM | LARGE
ACCESSIBILITY   STANDARD | ADAPTABLE | ACCESSIBLE
QUALITY_EXTRA   wet_dry_separation, simultaneite_lavabo_douche
```

---

## Annexe — écarts au moteur, au 26 août 2026

**Deux écarts sur quatre sont corrigés** depuis la fiche de sourcing, le
meilleur taux du dossier avec la chambre :

- le dégagement de 0,50 m est passé à **0,80 m**, au-dessus des deux valeurs
  sourcées `B1` et `B2` ;
- le composant monolithique de 1,20 × 0,90 est **éclaté** en appareils
  individualisés, ce qui rend `BATH-USE-001` possible — et elle est active.

**Restent :**

1. **le lavabo n'est pas sourcé** — seul appareil présent dans les deux
   variantes, et la seule cote de la pièce encore sans source ;
2. **aucun profil PMR n'existe** — quatrième écart de la fiche, non résorbé.
   `VAL-PMR-021` et `022` en définissent **deux**, accessible et évolutif ;
3. **aucun rangement au socle** pour cette pièce, alors que la classe Moyenne
   l'exige — écart partagé avec le WC, voir [`rangements.md`](rangements.md) ;
4. **les gammes douche, baignoire et lavabo ne sont pas livrées** — vérifié :
   seuls le lit et le canapé portent `sizes`. L'abaissement sourcé de la douche
   à 0,80 m attend le lot G2 ;
5. **`maxRatio: null`** ;
6. **la cohérence salle d'eau / WC est tenue par construction, pas par règle** —
   elle tomberait au premier changement du mécanisme de composition, en
   silence. C'est la forme même du défaut D3 ;
7. **les écarts hérités** — `S3`, `S4`, débattements, adjacences non typées,
   solveur rectangulaire. Voir [`wc-separe.md`](wc-separe.md).
