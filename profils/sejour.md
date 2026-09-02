# Profil de pièce — Séjour

**`LIVING` · composition possible avec `kitchen` · maturité `C4` · 31 août 2026**

Vague **C-P1**. Gabarit : [`GABARIT_PIECE.md`](../GABARIT_PIECE.md). Source de
valeurs : [`agencement/salon.md`](../agencement/salon.md).

> **Avertissement de sourcing, repris de la fiche.** Les deux sources du salon
> sont **éditoriales et commerciales** — conseil décoration, vente de mobilier.
> Elles décrivent l'usage professionnel courant, non une norme. Aucune valeur
> de ce profil ne fonde une règle `HARD` qu'en tant que doctrine N3, avec
> identifiant, portée, statut provisoire ou adopté et justification explicite.
> C'est la
> pièce la moins bien sourcée du logement, et c'est aussi la plus grande.

---

## 1. Définition fonctionnelle

```text
ROOM_TYPE  LIVING
FAMILY     DAY_ROOM
COMPOSITION  + kitchen  (cuisine ouverte)  ·  + dining  (coin repas, non tranché)

PRIMARY_FUNCTIONS
- se réunir, converser
- se détendre assis ou allongé
- recevoir
- regarder un écran, écouter

SECONDARY_FUNCTIONS
- prendre les repas, si le coin repas y est
- lire, jouer, travailler ponctuellement
- ranger livres, médias, objets
- distribuer les autres pièces  ← voir §11, et c'est un problème
```

**La seule pièce réellement multifonctionnelle et réellement simultanée.**
Plusieurs personnes y font plusieurs choses en même temps, et c'est sa
définition. Toutes les autres pièces du logement ont un usage dominant ; le
séjour a un usage *composé*, ce qui explique pourquoi sa surface se justifie
mal par addition d'emprises : ce qu'on y achète, c'est de la **surface libre
entre les meubles**, pas de la surface meublée.

C'est la raison pour laquelle il porte l'agrément le plus élevé du socle —
`1.4`, contre 0,6 pour la chambre et 0,5 pour le WC — et pourquoi il est
légitime qu'il reçoive le résidu de surface du plan. Contrairement au WC, un
séjour plus grand **apporte** vraiment quelque chose.

Nombre d'utilisateurs : de un à l'effectif complet du logement, plus les
invités. C'est la seule pièce dimensionnée par un usage exceptionnel — recevoir
— et non par l'usage courant.

## 2. Équipements

| Équipement | Minimal | Moyen | Large | Nature | Emprise 2D |
|---|---|---|---|---|---|
| Canapé | obligatoire | obligatoire | obligatoire | fonctionnel | **oui**, gamme livrée |
| Table basse | obligatoire | obligatoire | obligatoire | fonctionnel | oui — requise dès le programme minimal |
| Meuble média | recommandé | oui | oui | confort | oui — seuil 22 m² |
| Éclairage en trois couches | obligatoire | obligatoire | obligatoire | confort | non |
| Fauteuil | — | option dès 22 m² | oui | confort | oui — activé pour éprouver la conversation |
| Bibliothèque, rangement bas | — | oui | oui | confort | oui — non activé |
| Coin repas | option | oui | oui | fonctionnel | **oui** — non tranché, §5 |
| Buffet, meuble de séparation | — | — | oui | confort | oui |
| Coin bureau | — | — | option | fonctionnel | relève de C-P4 |
| Point focal — cheminée, baie | — | option | oui | confort | non modélisable |

**Le socle porte quatre équipements** : canapé et table basse requis, meuble
média et fauteuil optionnels à partir de 22 m². La bibliothèque reste proposée
par `GAMMES_EQUIPEMENTS.md` §7 et non activée. Pour la plus grande pièce du logement, c'est peu — et cela
explique le §5 : le moteur ne sait pas *remplir* un grand séjour, il sait
seulement lui donner de la surface.

## 3. Dimensions des équipements

| Objet | Compact | Standard | Grand | Statut |
|---|---|---|---|---|
| Canapé | 1,80 × 0,90 *(2 pl.)* | 2,20 × 0,90 *(3 pl., dès 24 m²)* | 2,20 × 2,20 *(angle, dès 30 m²)* | **non sourcé** |
| Table basse | 0,90 × 0,50 | 1,10 × 0,60 | 1,20 × 0,70 | non sourcé |
| Meuble média | 1,20 × 0,40 | 1,60 × 0,45 | 2,00 × 0,45 | non sourcé |
| Fauteuil | — | 0,90 × 0,85 | — | non sourcé, optionnel dès 22 m² |
| Table de repas | 1,40 × 0,80 *(4 pl.)* | 1,80 × 0,90 *(6 pl.)* | 2,20 × 1,00 *(8 pl.)* | non sourcé |

**Aucune de ces cotes n'est sourcée.** `DATASOURCE_EQUIPEMENTS.md` classe déjà
le canapé en « non sourcé », et la gamme livrée en G1 n'a pas amélioré cela —
elle a rendu la dette visible, ce qui est le but. La gamme du canapé est
livrée ; celles de la table basse, du meuble média et de la table de repas ne
le sont pas.

## 4. Enveloppes d'usage

```text
PHYSICAL_FOOTPRINT     canapé, table basse, meuble média, rangements
EXCLUSIVE_USAGE_ZONE   aucune
SHARED_USAGE_ZONE      devant le canapé, autour de la table basse, circulation
TEMPORARY_SWING_ZONE   débattement de porte
ACCESS_ZONE            porte → assises, porte → autres pièces  ← le problème du §11
CONVERSATION_ZONE      entre assises en vis-à-vis : 1,00 à 3,00 m
```

| Dégagement | `HARD_MIN` | `TARGET` | `COMFORT` | Statut |
|---|---:|---:|---:|---|
| Passage traversant | 0,70 | 0,80 | 1,00 | `[S2]` / `[D]`, arbitré |
| Espacement entre meubles contournés | 0,60 | 0,70 | 0,80 | `[S1]` |
| Canapé → table basse | 0,50 | 0,50 | 0,60 | `[S2]` |
| Entre assises en vis-à-vis | 1,00 | 1,80 | ≤ 3,00 | `[S2]` — **maximum**, cas unique |
| Devant le canapé, socle | — | 0,90 | — | socle |
| Recul de chaise, coin repas | 1,20 | 1,20 | 1,50 | `[S2]` |
| Recul de banc ou tabouret | 0,45 | 0,60 | — | `[S2]` |

**Le seul dégagement du socle qui soit un maximum.** `L3` borne la distance
entre assises à 3,00 m : au-delà, on ne converse plus. Toutes les autres cotes
du socle sont des minima. Un moteur qui ne connaît que des planchers ne peut
pas exprimer cette contrainte, et c'est pourtant la seule qui dise ce qu'est
réellement un séjour — un dispositif de conversation, pas une surface.

### La règle des 50 % est la vraie contrainte dimensionnante

`L6` : l'emprise du mobilier ne dépasse pas la moitié de la surface de la
pièce. La fiche de sourcing en tire un plancher de **11 m²** pour un coin salon
de 5,52 m² d'emprise.

C'est la règle la plus utile de tout ce profil, pour trois raisons : elle est
**calculable** — le solveur connaît les emprises et l'aire ; elle exprime
directement ce que la pièce vend, du vide ; et elle **monte avec le
programme**, donc elle discrimine un grand séjour bien meublé d'un grand séjour
vide. Aucune règle du moteur ne fait cela aujourd'hui.

Elle a un défaut à signaler : dans une pièce composée avec la cuisine, le
linéaire de cuisine est de l'emprise, et il ferait basculer le ratio. Elle doit
donc porter sur la **zone séjour**, pas sur la pièce — ce qui suppose la zone
désignée, capacité attendue au lot L2 du chantier 7.

## 5. Trois classes dimensionnelles

Domaines **mesurés** le 26 août :

| Programme | Plus petit rectangle meublable |
|---|---|
| Canapé seul *(requis au socle)* | 1,80 × 1,80 = **3,24 m²** |
| + table basse, dès 18 m² | 2,10 × 2,90 = 6,09 m² |
| + meuble média et canapé 3 places, dès 24 m² | 2,20 × 3,40 = 7,48 m² |
| Canapé d'angle, dès 30 m² | 2,20 × 4,70 = 10,34 m² |

**Le rapport entre meublabilité et plancher est de 1 à 6** — 3,24 m² contre
20 m². C'est l'exemple que `MODELE_EXIGENCES.md` cite pour justifier la
distinction des deux planchers : « un séjour se meuble dès 3,24 m² et reste
absurde à cette taille ». Pour cette pièce et pour elle seule, la convention
`N3` fait donc **tout** le travail de dimensionnement, et elle l'assume.

### MINIMAL — 18 à 22 m²

Canapé, table basse, meuble média. En dessous de 18 m², le socle retire la
table basse : à ne jamais laisser arriver, car un salon sans table basse n'est
pas un salon compact, c'est un salon incomplet. Or **la compression le permet**
— quand le programme sature la surface, `targetArea = minArea × compression`
peut passer sous 18 m². C'est un défaut silencieux, listé en annexe.

### MOYEN — 22 à 30 m² · **cas de référence**

Canapé 3 places dès 24 m², table basse, meuble média, un fauteuil, un
rangement bas. Coin repas possible s'il reste 10 m² pour lui (`[D]`, deux côtés
contre mur).

### LARGE — 30 à 45 m²

**30 m² est le seuil de zonage** (`L8`) : au-delà, la pièce ne doit plus être
meublée, elle doit être **zonée** — coin conversation, coin repas, coin lecture,
séparés par des meubles bas ou des tapis. C'est le seul seuil de tout le socle
qui change la *nature* de la réponse et pas seulement sa taille.

**Au-delà d'environ 45 m², les gains deviennent faibles** : la conversation est
bornée à 3,00 m (`L3`), donc un séjour plus grand ne fait pas mieux converser.
Il faut alors des zones distinctes, c'est-à-dire des pièces — ou assumer un
volume de représentation, ce qui n'est plus un besoin fonctionnel.

### Les seuils ont désormais des rôles distincts

| Source | Valeur | Statut |
|---|---|---|
| P3, référentiel Python archivé | 8 m² `HARD` | périmé |
| `VAL-LIVING-PROGRAM-AREA-MIN-001` | **20 m²** | minimum `HARD` doctrinal N3 justifié |
| `VAL-LIVING-PROGRAM-AREA-TARGET-001` | **24 m²** | cible `GUIDELINE` provisoire |
| zonage `[S2]` | **30 m²** | question F3, pas minimum de pièce |

`TH2D-SIZING-001` consomme la cible canonique de 24 m², également compilée
dans `fit.data.js` pour rester disponible en chargement paresseux. Le seuil de
30 m² ne change pas le verdict de pièce : il attend l'objet `ZONE` de F3.

## 6. Règles d'agencement

| Relation | Niveau |
|---|---|
| Canapé face au meuble média | `PREFERRED` — `LIVING-FOCAL-001`, actif, poids 1,8 |
| Écart canapé-table basse de 0,45 à 0,65 m | `GUIDELINE` — `LIVING-TABLE-001`, actif, poids 1,8 |
| Canapé adossé à un mur ou à un meuble bas | `PREFERRED` |
| Assises en conversation entre 1,00 et 3,00 m, cible 1,80 m | `GUIDELINE` — `LIVING-CONVERSATION-001` |
| Aucun siège dos à la pièce | `UNDESIRABLE` |
| Mobilier haut devant une fenêtre | `UNDESIRABLE` |
| Mobilier aligné dans la longueur d'une pièce allongée | `UNDESIRABLE` — effet couloir |
| Emprise mobilier > 50 % de la zone séjour | `UNDESIRABLE` — `L6` |
| Passage traversant sous 0,70 m | `FORBIDDEN` |
| Débattement de porte sur une assise | `FORBIDDEN` (`S3`) |

Le séjour porte trois relations actives : la liaison canapé-table est toujours
applicable, la focalité média et la conversation avec fauteuil ne le sont qu'à
partir de 22 m², lorsque leurs équipements optionnels sont présents.

## 7. Circulations

```text
PORTE → ASSISES              principale
ASSISES → ASSISES            conversation, pas circulation
PORTE → PORTE                traversée : à minimiser  ← §11
ZONE SALON → ZONE REPAS      si coin repas
```

**La distinction entre passage et espacement est le point technique de cette
pièce**, et la fiche de sourcing l'a arbitrée : 0,70 m dès qu'une circulation
traverse, 0,60 m pour un simple espacement entre meubles que l'on contourne.
C'est la même distinction qu'en cuisine entre dégagement de service et passage.
Le socle la porte désormais séparément : dégagements d'équipement d'un côté,
`accessClearance: 0.70` transmis à S4 de l'autre.

Défaut à détecter, propre à cette pièce : **l'effet couloir**. Une pièce
allongée dont le mobilier est aligné dans la longueur. Il est calculable — ratio
de la boîte, et orientation du mobilier posé — et c'est ce que visaient les
règles `TH2D-SALON-003` et `004` proposées par la fiche, jamais écrites.

## 8. Porte et accès

| Solution | Rang |
|---|---|
| Une seule porte, en angle de pièce | `BEST` |
| Deux portes proches, laissant une zone continue | `ACCEPTABLE` |
| Portes opposées créant une traversée diagonale | `UNDESIRABLE` |
| Trois portes ou plus | `UNDESIRABLE` — le séjour devient un hall |
| Débattement sur une assise | `FORBIDDEN` (`S3`) |

Le séjour est la seule pièce où **le nombre de portes** est un critère de
qualité en soi. Chaque porte supplémentaire retranche un pan de mur — donc une
possibilité d'adosser un canapé — et ajoute une traversée. C'est mesurable
immédiatement : le moteur connaît le nombre d'ouvertures par pièce.

## 9. Formes de la pièce

| Forme | Pertinence | Classes | Réserve |
|---|---|---|---|
| Rectangle proche du carré | **excellente** | toutes | ratio > 0,6 |
| Carré | excellente | Moyen, Large | symétrie autour d'un point focal |
| L | **bonne** | Large | seule pièce où le L sert vraiment : deux zones liées visuellement |
| Rectangle allongé | mauvaise | — | effet couloir ; le moteur le pénalise déjà, à raison |
| Trapèze, polygone | tolérée | Large | si le décrochement fait zone |

Le séjour est, avec la salle d'eau, la pièce où un décrochement est un **gain**
et non un défaut : il matérialise une zone. Encore faut-il que le solveur sache
meubler autre chose que la partie principale — lot M4b.

## 10. Archétypes d'implantation

**A — conversation adossée, une porte en angle.**

```text
┌────────────────────────┐
│  ▬▬▬▬ canapé ▬▬▬▬      │
│                        │
│      ▭ table basse     │
│                        │
│  ▬▬ média ▬▬           │
└──────────────   ───────┘
              porte
```

**B — zonage, classe Large, > 30 m².**

```text
┌──────────────────────────────────┐
│ ▬▬ canapé ▬▬        ┌──────────┐ │
│                     │  table   │ │
│    ▭                │  repas   │ │
│                     └──────────┘ │
│ ▬▬ média ▬▬   ▬buffet▬           │
└────   ───────────────────────────┘
    porte      ← le buffet sépare les deux zones
```

**C — mauvaise configuration : le séjour distributeur.**

```text
    porte ch.1   porte ch.2
┌──────  ─────────  ───────┐
│                          │
│   ▬▬ canapé ▬▬           │   ← trois traversées,
│                          │      aucun pan de mur continu,
└────  ──────────────  ────┘      aucune intimité
   porte cuis.      porte entrée
```

La configuration C n'est pas théorique : c'est **la topologie que le moteur
produit** quand le programme ne justifie pas de circulation. Voir §11.

## 11. Relations avec les autres pièces

| Relation | Niveau | Motif |
|---|---|---|
| ↔ cuisine | `VERY_FAVORABLE` | service des repas ; composition possible |
| ↔ coin repas | `VERY_FAVORABLE` | continuité d'usage |
| ↔ entrée, par une circulation | `FAVORABLE` | accueil sans exposition |
| ↔ extérieur, terrasse | `FAVORABLE` | prolongement d'usage, hors V1 |
| ↔ circulation | `FAVORABLE` | mais voir ci-dessous |
| ↔ chambre | `UNDESIRABLE` | bruit, rupture jour/nuit |
| ↔ WC, accès direct | `UNDESIRABLE` | `REF-008` si repas dans la pièce |
| Entrée débouchant directement dans le séjour | `UNDESIRABLE` | pas de sas, exposition |
| **Séjour desservant les chambres** | `UNDESIRABLE` | et c'est ce que fait le moteur |

### Le séjour est le centre topologique par construction — et c'est discutable

`buildProgram()` construit un graphe en **étoile centrée sur le séjour** :
chaque circulation se rattache au séjour, et **en l'absence de circulation,
toutes les pièces s'y rattachent directement** (`generator.js`). Un plan sans
couloir fait donc du séjour le distributeur du logement — chambres comprises.

C'est un choix de moteur défendable pour la robustesse — il garantit la
connexité — mais il produit un défaut d'usage réel : une chambre desservie
depuis le séjour n'a aucune intimité, et un séjour traversé n'est plus un
séjour. La règle du §8 — « trois portes ou plus, le séjour devient un hall » —
est précisément ce que cette topologie déclenche.

Ce n'est pas un écart d'agencement, c'est une **question de doctrine
topologique**, à poser au lot M3 : le séjour doit-il pouvoir desservir une
chambre ? Ce profil dit que non, hors très petits logements. Il ne peut pas le
trancher seul.

## 12. Contraintes techniques

```text
REQUIRED_SERVICES  electricite
```

Aucune contrainte humide, aucune extraction. Comme la chambre, le séjour n'a
aucune raison technique d'être près du noyau — sauf s'il absorbe la cuisine,
auquel cas il en hérite toutes les contraintes.

C'est la pièce qui appelle le plus de **façade** : ouverture, lumière,
prolongement extérieur. `TH2D-FACADE-001` la couvre déjà via son rôle
`principale`.

## 13. Réglementation française

| Point | Portée | Statut |
|---|---|---|
| Pièce principale ≥ 9 m², ou 20 m³ | Décret n° 2002-120, art. 4 — logement **mis en location** | `VAL-DEC-001` / `003` — vérifié |
| Hauteur sous plafond ≥ 2,20 m | même article | `VAL-DEC-002` — hors 2D |
| Séjour dans l'unité de vie accessible | `VAL-PMR-020` | vérifié |
| Cheminement accessible jusqu'au séjour, logement évolutif | `VAL-PMR-022` | vérifié |

**Aucun texte n'impose une surface de séjour** au-delà des 9 m² de la pièce
principale. Les 20 m² du socle et les 24 m² de `rules.js` sont des conventions,
et doivent être présentées comme telles. C'est important ici plus qu'ailleurs :
c'est la pièce où l'écart entre le minimum légal (9) et le minimum retenu (20)
est le plus grand du logement.

Le séjour est en revanche **la pièce pivot de l'accessibilité** : `VAL-PMR-022`
définit le logement évolutif par le cheminement accessible jusqu'au séjour et
au cabinet d'aisances. Ces deux pièces, et elles seules, décident du statut
évolutif.

## 14. Accessibilité

```text
SIZE_CLASS     MINIMAL | MEDIUM | LARGE
ACCESSIBILITY  STANDARD | ADAPTABLE | ACCESSIBLE
```

- `STANDARD` — rien de plus ;
- `ADAPTABLE` — le séjour est **l'une des deux pièces qui définissent le
  statut évolutif** (`VAL-PMR-022`), avec le cabinet d'aisances. Le cheminement
  jusqu'à lui doit être accessible, ce qui porte sur la circulation et les
  portes, pas sur la pièce elle-même ;
- `ACCESSIBLE` — aire de rotation Ø 1,50 m libre, passages portés à 0,90 m,
  et surtout **un cheminement continu de 0,90 m entre les meubles**. Dans une
  pièce de 20 m² correctement meublée, c'est atteignable ; c'est le zonage qui
  devient contraint, pas la surface.

La surface n'est jamais le facteur limitant ici. C'est l'**implantation du
mobilier**, donc quelque chose que seul le solveur peut vérifier — et il ne le
vérifie pas aujourd'hui, puisque `optimize()` ne s'exécute qu'une fois, après
la sélection du plan.

## 15. Critères de qualité spatiale

| Variable | Ce qu'elle capte ici |
|---|---|
| `furniture_ratio` | emprise / surface, la règle des 50 % — **le critère central** |
| `corridor_effect` | pièce allongée + mobilier aligné dans la longueur |
| `conversation_quality` | distances entre assises dans [1,00 ; 3,00] |
| `door_count` | nombre d'ouvertures ; au-delà de deux, la pièce devient un hall |
| `wall_continuity` | plus long pan de mur libre, pour adosser le canapé |
| `through_traffic` | traversées porte → porte franchissant la zone d'assises |
| `focal_alignment` | canapé face au média ou à la baie — `LIVING-FOCAL-001` |
| `dead_space` | surface au-delà de 45 m² sans zone attribuée |

```text
emprise_mobilier_au_dela_50pct   = defavorable
effet_couloir                    = defavorable, fort
traversee_de_la_zone_assises     = defavorable, fort
plus_de_deux_portes              = defavorable
canape_sans_pan_de_mur           = defavorable
assises_au_dela_de_3m            = defavorable
door_fixture_conflict            = INVALID
surface_au_dela_de_45m2          = defavorable, croissant
```

`wall_continuity` est propre à cette pièce et remarquablement simple à
calculer : le plus long segment de mur sans ouverture. Il relie directement la
topologie — nombre et position des portes — à la qualité d'agencement, ce
qu'aucun critère du moteur ne fait actuellement.

## 16. Synthèse

| Paramètre | Minimal | Moyen | Large |
|---|---:|---:|---:|
| Surface cible | 20 – 22 m² | **22 – 30 m²** | 30 – 45 m² |
| Plus petit rectangle meublable | 1,80 × 2,00 *(avant dignité 20 m² / côté 3 m)* | à éprouver avec options | attend le zonage |
| Ratio de forme | > 0,5 | > 0,6 | > 0,6 |
| Canapé | 2 places | 3 places dès 24 | angle dès 30 |
| Table basse | ✓ | ✓ | ✓ |
| Meuble média | dès 22 m² | ✓ | ✓ |
| Fauteuil, rangement | non | option | ✓ |
| Coin repas | non | possible | ✓ zoné |
| Zonage | non | non | **✓ dès 30 m²** |
| Portes | 1 | 1 – 2 | 2 |
| Formes | rectangle | rectangle, carré | toutes, L utile |

## 17. Traduction TechnoHab

```text
ROOM_TYPE    LIVING
FAMILY       DAY_ROOM
COMPOSITION  + kitchen (openKitchen) · + dining (non tranché)
ROLE         principale
AGREMENT     1.4                      # le plus élevé : reçoit le résidu, à raison
MIN_PROGRAM  20 / 3.00                # convention N3 assumée, rapport 1:6 à la meublabilité
MAX_RATIO    null                     # grande surface à traiter par zones F3

REQUIRED_OBJECTS
- sofa          gamme livrée : 2 pl. · 3 pl.@24 · angle@30
- coffee_table  requis dès le programme minimal
OPTIONAL_OBJECTS
- tv_unit       minRoomArea 22
- armchair      minRoomArea 22        # actif, optionnel
- bookcase      minRoomArea 26        # proposé, non activé
- dining_table  si coin repas         # non tranché : pièce, zone ou équipement

FUNCTIONAL_ZONES
- sofa_front        0.50 min / 0.50 cible / 0.60 confort
- table_front       0.45 min / 0.50 cible / 0.60 confort, non-destination S4
- conversation      1.00 min / 1.80 cible / 3.00 max entre assises
- through_passage   0.70 HARD, transmis à S4
- door_swing        exclusif si battante, porté par S3

HARD_CONSTRAINTS
- canapé et table basse logés
- passage traversant ≥ 0.70
- S3, S4
SOFT_CONSTRAINTS
- emprise mobilier ≤ 50 % du séjour autonome             # active ; suspendue sans ZONE en cuisine ouverte
- canapé adossé à un pan de mur continu
- canapé face au point focal
- pas d'effet couloir
- au plus deux portes
- façade et lumière naturelle

PREFERRED_ADJACENCIES     kitchen, dining, circulation, entree, exterieur
UNDESIRABLE_ADJACENCIES   bedroom, wc
FORBIDDEN_RELATIONS       —
DOCTRINE_QUESTION         le séjour peut-il desservir une chambre ?   # §11, lot M3

SIZE_CLASSES    MINIMAL | MEDIUM | LARGE
ACCESSIBILITY   STANDARD | ADAPTABLE | ACCESSIBLE
QUALITY_EXTRA   furniture_ratio, corridor_effect, wall_continuity, door_count
```

---

## Annexe A — photographie des écarts avant C-P1.2b, au 26 août 2026

Cette annexe est conservée comme diagnostic historique. Les points 1, 3, 5,
6, 7 et 8 sont fermés par C-P1.2b ci-dessous ; les points liés aux zones,
aux grandes surfaces et à la topologie restent ouverts et attribués.

**Écarts de donnée :**

1. **trois seuils de surface coexistent** — 8 m² (périmé), 20 m²
   (`minProgramArea`), 24 m² (`TH2D-SIZING-001`, **écrit en dur dans
   `rules.js` sans source**). Aucun n'est dérivé d'une donnée d'agencement. Le
   seul seuil documenté est celui de `[S2]` : 30 m², et il concerne le
   **zonage**, pas le minimum ;
2. **`maxRatio: null`** — rien ne borne le séjour par le haut. Moins grave
   qu'au WC, puisque l'agrément est réel, mais le plafond existe : la
   conversation est bornée à 3,00 m ;
3. **trois équipements seulement** pour la plus grande pièce du logement ;
   fauteuil et bibliothèque sont proposés et non activés ;
4. **aucune cote du séjour n'est sourcée**, et ses deux sources sont
   éditoriales.

**Écarts de mécanisme :**

5. **le maximum n'est pas exprimable** — `L3` borne la distance entre assises à
   3,00 m. Le socle ne connaît que des minima. C'est le seul dégagement-maximum
   de tout le référentiel, et il porte la définition même de la pièce ;
6. **passage traversant et espacement ne sont pas distingués** — 0,70 contre
   0,60, arbitré par la fiche de sourcing, inexprimable au socle qui n'a qu'une
   valeur par équipement ;
7. **la règle des 50 % n'est pas implémentée** alors qu'elle est calculable et
   qu'elle est la contrainte réellement dimensionnante. Elle suppose la **zone
   désignée** pour survivre à la composition avec la cuisine — capacité
   attendue au lot L2 du chantier 7 ;
8. **la compression peut retirer la table basse** — sous 18 m²,
   `selectedEquipments()` ne la retient plus, et `targetArea = minArea ×
   compression` peut y descendre sur un programme saturé. Le séjour perd alors
   un équipement sans que rien ne le signale. Même famille de défaut que D3 :
   une fonction qui disparaît en silence ;
9. **l'étoile topologique fait du séjour un distributeur** — en l'absence de
   circulation, toutes les pièces s'y rattachent, chambres comprises. Question
   de doctrine pour le lot M3, pas écart d'agencement ;
10. **le coin repas n'est pas tranché** — pièce, zone ou équipement. C'est l'un
    des trois arbitrages d'entrée du chantier 7, toujours ouvert, et il bloque
    la règle des 50 % autant que le profil `dining`.

---

## Annexe B — consolidation C-P1.2b, au 31 août 2026

### Programme effectivement éprouvé

Le séjour minimal est désormais une fonction complète et non un canapé seul :
il exige `sofa` et `coffee_table`. La table réserve une face d'usage de 0,45 m
au verdict HARD ; son écart au canapé cible 0,45 à 0,65 m en `GUIDELINE`. Le
plancher doctrinal reste 20 m² et 3,00 m de côté
court ; 24 m² devient une cible `GUIDELINE` identifiée
`VAL-LIVING-PROGRAM-AREA-TARGET-001`, consommée par `TH2D-SIZING-001` au lieu
d'un nombre écrit en dur.

À partir de 22 m², `tv_unit` et `armchair` sont optionnels. Le canapé fait face
au média lorsqu'il est présent. Le fauteuil rend la relation de conversation
mesurable : distance centre à centre comprise entre 1,00 et 3,00 m, cible
1,80 m. Ces bornes classent les poses et ne transforment pas le fauteuil en
obligation du séjour minimal.

### Vide utile, accès et composition

Le solveur expose maintenant deux capacités génériques :

- `assessOccupancy()` mesure le rapport entre les emprises physiques du
  mobilier et la surface utile ; le séjour autonome déclare une limite souple
  de 50 % ;
- S4 accepte un `accessClearance` par programme. Pour le séjour, chaque porte,
  chaque autre porte et les zones d'usage requises doivent appartenir au même
  chemin libre de 0,70 m. Une fenêtre réserve sa baie mais n'est pas comptée
  comme accès. La face d'usage de la table n'est pas une destination S4
  autonome (`accessRequired: false`) ; son emprise reste bien un obstacle.

La limite de 50 % est volontairement suspendue lorsque le séjour absorbe une
cuisine : sans objet `ZONE`, appliquer ce ratio à toute la boîte ouverte serait
un faux verdict. F3 devra mesurer séparément la zone `LIVING`. Cette suspension
est explicite dans `compiledRoomProgram()`, pas simulée par une cloison.

### Fonctions différées, sans disparition silencieuse

- **repas** : attend la décision pièce/zone et `ZONE` F3 ; aucune table à manger
  n'est injectée artificiellement dans le séjour C4 ;
- **bureau** : reste au profil C-P4 et attend lui aussi une zone ou une pièce
  désignée ;
- **bibliothèque et grand séjour** : équipement et remplissage attendent une
  gamme consolidée ;
- **limite haute de surface** : ne se déduit pas de la portée conversationnelle
  locale ; elle attend le zonage des grandes pièces ;
- **séjour distributeur, nombre de portes, adjacences chambre/WC** : restent des
  décisions de topologie et de graphe, non des règles de mobilier C4 ;
- **accessibilité** : reste une variante ultérieure nommée, non couverte par le
  témoin standard.

### Preuve C4

`scripts/test-living-c4.mjs` prouve deux proportions (5 × 4 m et
3,20 × 6,25 m), un refus à 1,50 × 1,50 m, la relation canapé-table, le témoin
média/fauteuil avec focalité et conversation, le ratio d'occupation, deux
portes opposées, une fenêtre et la traversée S4 à 0,70 m. Toutes les valeurs
actives sont enregistrées dans `assets/canonical-values.data.js`. La maturité
du contrat `LIVING` passe donc de C2 à C4 ; C5 attend encore un trajet de plan
complet qualifié et les dettes transverses ci-dessus.
