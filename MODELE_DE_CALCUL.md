# Modèle de calcul

Toutes les modalités de calcul du moteur de génération : constantes,
formules, seuils, ordre des opérations. Un plan est le produit de ce
document et de rien d'autre.

**Relevé du 16 août 2026**, sur `assets/generator.js`, `assets/rules.js`,
`assets/placement.js`, `assets/room-model.js`, `assets/socle.data.js`.

Ce document décrit **ce que le code fait**. Si le code change, c'est ce
fichier qui a tort. Il ne dit pas ce que le moteur *devrait* faire — cela
relève de `SOCLE_AGENCEMENT.md` et du référentiel de règles.

Chaque valeur porte son statut : `réglementaire`, `socle` lorsqu'elle est
calculée à partir des équipements, ou `convention` lorsqu'elle est décrétée
par le projet. Les conventions ne sont pas illégitimes ; elles doivent
seulement être reconnaissables.

Documents liés : [`SOCLE_AGENCEMENT.md`](SOCLE_AGENCEMENT.md),
[`VEILLE_NORMATIVE.md`](VEILLE_NORMATIVE.md),
[`DATASOURCE_EQUIPEMENTS.md`](DATASOURCE_EQUIPEMENTS.md),
[`OUVERTURES_ET_PARCOURS.md`](OUVERTURES_ET_PARCOURS.md).

---

## 1. Chaîne de calcul

Ordre strict. Chaque étape consomme la sortie de la précédente.

| # | Étape | Fonction | Sortie |
|---|---|---|---|
| 1 | Normalisation des entrées | `normalizeOptions` | options bornées |
| 2 | Programme et surfaces | `buildProgram` | pièces, surfaces cibles, adjacences demandées |
| 3 | Budget d'exploration | `generationBudget` | nombre de tentatives |
| 4 | Enveloppe | `envelopeAspect` | largeur et hauteur |
| 5 | Découpe | `layout` | rectangles, une par pièce |
| 6 | Graphe de contact | `actualEdges` | adjacences réalisées |
| 7 | Notation | `scoreCandidate` | score, plus bas = meilleur |
| 8 | *(retour en 4 jusqu'au budget)* | | meilleur candidat |
| 9 | Cession du couloir | `carveCirculation` | rangements |
| 10 | Décrochements | `shapeRooms` | pièces en L |
| 11 | Graphe final | `edgesFromParts` | adjacences relues sur la géométrie finale |
| 12 | Pose du mobilier | `validate` puis `optimize` | agencement, ou refus motivé |
| 13 | Évaluation | `evaluatePlan` | violations et limites |

Les étapes 9 à 11 ne s'appliquent qu'au **candidat retenu**. Les exécuter
dans la boucle coûterait le budget entier sans changer le classement.

---

## 2. Normalisation des entrées

Bornes appliquées à toute entrée, quelle qu'en soit la provenance. Elles
rendent inopérant tout contournement des bornes du formulaire.

| Entrée | Borne | Défaut | Statut |
|---|---|---|---|
| `surface` | 35 à 250 m² | 75 | convention |
| `bedrooms` | 0 à 5 | 0 | convention |
| `bathrooms` | 1 à 2 | 1 | convention |
| `separateKitchen` | booléen | faux | — |
| `includeWc` | booléen | vrai | — |
| `priority` | compact, light, economy | compact | — |

Une valeur non numérique retombe sur le défaut ; une valeur hors bornes est
ramenée à la borne. Aucune entrée ne peut faire échouer le calcul.

---

## 3. Programme et répartition des surfaces

### Table des pièces

| Type | Surface min. | Largeur min. | Poids |
|---|---|---|---|
| Séjour | 20 m² | 3,00 m | 4,5 |
| Chambre | 9 m² | 2,50 m | 2,2 |
| Salle d'eau | 3 m² | 1,70 m | 1,2 |
| WC | 1,5 m² | 0,90 m | 0,55 |
| Cuisine | 7 m² | 1,80 m | 1,5 |
| Circulation | 3 m² | 1,20 m | 0,8 |

**Statut.** Les surfaces minimales sont des conventions, sauf 9 m² pour une
pièce principale, qui rejoint `VAL-DEC-001`. Les poids sont des conventions
pures. **Les largeurs minimales ne servent plus au verdict** : depuis le
branchement du socle, la meublabilité est jugée par le solveur, et ces
valeurs ne subsistent que comme repli si le socle n'est pas chargé.

### Composition

Séjour toujours. Puis cuisine si demandée, autant de chambres que demandé,
autant de salles d'eau que demandé, WC si demandé. **Une circulation est
ajoutée dès que le programme atteint quatre pièces** — convention.

### Dimensionnement de la circulation

Une circulation qui dessert huit pièces n'est pas celle qui en dessert deux.
Sa surface minimale suit ce qu'elle relie :

```
desservies   = 1 + nombre de pièces − (cuisine séparée ? 2 : 1)
surface min. = max(3 m², 1,20 × desservies × 0,95)
poids        = 0,8 + desservies × 0,22
```

Sans cette mise à l'échelle, le graphe demandé est **géométriquement
irréalisable** : une circulation de 5,9 m² à laquelle on demande de toucher
huit pièces n'offre que 0,61 m de contact par pièce. C'est le correctif qui
a produit le plus grand gain de conformité du projet.

### Répartition

```
minimumTotal  = Σ surfaces minimales
distribuable  = max(0, surface − minimumTotal)

si minimumTotal > surface :          compression
   cible = surface min. × (surface / minimumTotal)
sinon :                              distribution par poids
   cible = surface min. + distribuable × (poids / Σ poids)
```

L'écart d'arrondi est ensuite réparti **au prorata des poids**, et le
résidu final attribué à la pièce la plus lourde. Le concentrer sur le séjour,
comme le faisait une version antérieure, faussait sa surface.

### Adjacences demandées

| Relation | Condition |
|---|---|
| séjour ↔ circulation | s'il y a une circulation |
| séjour ↔ cuisine | si cuisine séparée |
| circulation ↔ chaque pièce | sauf séjour et cuisine |
| séjour ↔ chaque pièce | s'il n'y a pas de circulation |

Toutes du même type et du même poids. Le référentiel distingue porte,
ouverture et circulation, et obligatoire de souhaitable — le moteur non.
Aucune adjacence interdite n'est exprimée, alors que le référentiel proscrit
WC ↔ séjour.

---

## 4. Budget d'exploration

```
budget = max(96, min(6000, pièces² × 70))
```

Croissance quadratique : l'espace de recherche croît beaucoup plus vite que
le nombre de pièces, et un budget linéaire laissait les grands programmes
sans solution conforme. **Sortie anticipée dès qu'un candidat atteint un
score nul**, si bien que le plafond n'est atteint que par les programmes qui
en ont besoin.

Coût observé : de 2 ms à 110 ms selon le programme.

---

## 5. Enveloppe

```
base   = 1,45 (lumière) | 1,12 (économie) | 1,00 (compact)
aspect = base × (1 + (tirage − 0,5) × 0,44)
largeur = √(surface × aspect)
hauteur = surface / largeur
```

Le facteur de variation à ±22 % existe pour que l'enveloppe cesse d'être
déterministe : à surface et priorité données, elle était auparavant unique,
et toute la diversité reposait sur l'intérieur.

Toutes conventions.

---

## 6. Découpe

Découpe récursive en guillotine. Chaque coupe sépare le tableau des pièces
en deux tranches contiguës, réparties proportionnellement à leurs surfaces.

### Ordre des pièces

Tirage aléatoire complet, puis **la circulation est déplacée au milieu**.
Une pièce au milieu du tableau borde les deux moitiés, ce qui donne à la
circulation le plus de voisins possible.

Le séjour n'est plus placé en tête : il appartenait alors à la première
tranche à chaque récursion, donc mathématiquement cloué au même angle. Il
occupait une position unique sur quarante variantes.

### Point de coupe

```
distance(i) = |total / 2 − cumul(i)| + (tirage − 0,5) × total × 0,34
```

L'indice de moindre distance l'emporte. La perturbation est **centrée sur
zéro** : toujours positive, elle ne pouvait déplacer la coupe que d'un côté
de l'équilibre.

### Direction de coupe

Par ordre de priorité :

1. **Peigne** — si le groupe ne contient pas la circulation et que la
   direction perpendiculaire à la coupe parente est praticable, on coupe
   perpendiculairement. Chaque pièce du groupe borde alors la coupe qui l'a
   séparée du couloir, donc touche le couloir par construction.
2. **Priorité** — `light` impose une première coupe horizontale, `economy`
   deux coupes verticales.
3. **Praticabilité** — si une seule direction laisse aux deux tranches la
   largeur exigée par leur contenu, c'est elle.
4. **Tirage** — sinon, aléatoire, une fois sur deux selon l'allongement.

Le point 3 est le seul endroit où la découpe **consulte le programme au lieu
de le subir**. C'est ce qui a fait passer les violations de largeur de 83 à 3
sur quarante variantes.

### Isolement du couloir

Si la circulation se trouve en bout de tableau, la coupe l'isole
immédiatement. Réduit à une bande, le couloir peut être bordé par tout
groupe recoupé perpendiculairement.

---

## 7. Détection des adjacences

Deux rectangles sont adjacents si leurs bords se touchent à **0,012 m** près
et se recouvrent sur plus de **0,24 m**.

| Constante | Valeur | Rôle |
|---|---|---|
| `CONTACT` | 0,012 m | tolérance de coïncidence des bords |
| `MIN_OVERLAP` | 0,24 m | recouvrement minimal pour déclarer un contact |

**Défaut connu.** Ce seuil est géométrique, pas fonctionnel. Une porte
intérieure demande 0,80 m de vantail plus ses tableaux, soit environ 1,00 m
de mur commun. Mesuré sur 1 615 adjacences réalisées :

| Contact | Part |
|---|---|
| moins de 0,60 m | 4,5 % |
| 0,60 à 0,90 m | 4,8 % |
| 0,90 à 1,20 m | 7,6 % |
| 1,20 m et plus | 83,2 % |

**9,2 % des adjacences déclarées réussies ne peuvent porter aucune porte.**
Le taux de conformité mesuré est donc optimiste d'environ neuf points, et il
faut le corriger avant toute comparaison de méthodes de génération, sous
peine de fausser le témoin en sa faveur.

Deux notions à séparer : le **contact**, géométrique, à 0,24 m ; la
**desserte**, fonctionnelle, à 1,00 m pour une porte battante, 1,20 m pour un
passage principal, 1,50 m pour une cuisine réellement ouverte. Ces trois
dernières valeurs sont des conventions, seule la largeur de vantail étant
réglementaire.

---

## 8. Notation des candidats

Le score est une **pénalité** : plus bas vaut mieux. Un score nul arrête
l'exploration.

| Motif | Pénalité | Statut |
|---|---|---|
| Adjacence demandée non réalisée | +110 par adjacence | convention |
| Rapport de forme inférieur à 0,32 | +(0,32 − ratio) × 180 | convention |
| Pièce non meublable selon le socle | +95 | socle |
| Circulation sous 1,20 m de large | +(1,20 − largeur) × 320 | convention |
| Circulation desservant moins de deux espaces | +(2 − desservies) × 90 | convention |
| Séjour non en façade, priorité lumière | +28 | convention |
| Nombre d'arêtes, priorité économie | +0,4 par arête | convention |

**Limite structurante.** Le score n'est pas une contrainte. La découpe ne
consulte pas les adjacences demandées ; elle est notée après coup. Une règle
déclarée bloquante peut donc échouer — c'est le défaut documenté au
ROADMAP §3.1, et la raison pour laquelle le rapport sépare violations et
limites du moteur.

Aucune pondération n'a été calibrée : les rapports entre 110, 180, 95, 320,
90, 28 et 0,4 sont des choix de proportion, jamais mesurés l'un contre
l'autre.

---

## 9. Cession du couloir et rangements

Le créneau attribué à la circulation par la découpe est plus large qu'un
couloir ne le demande. Le surplus n'est pas supprimé, il est **cédé** aux
pièces longées, par transfert et non par création : la surface totale est
conservée et la couverture reste complète.

```
largeur nécessaire = min(1,80 ; max(1,20 ; surface min. couloir / longueur))
profondeur cédée   = largeur actuelle − largeur nécessaire
                     bornée par 0,6 × le plus court segment bordant
```

| Constante | Valeur | Rôle | Statut |
|---|---|---|---|
| `MIN_CIRCULATION_WIDTH` | 1,20 m | plus exigeant que les 0,90 m réglementaires | convention |
| `MAX_CIRCULATION_WIDTH` | 1,80 m | au-delà, ce n'est plus un couloir | convention |
| `MIN_STORAGE_DEPTH` | 0,45 m | en deçà, un rangement est inutilisable | convention |
| `MAX_STORAGE_DEPTH_RATIO` | 0,6 | profondeur ≤ 0,6 × longueur, pour rester une bande | convention |

La cession n'a lieu que si les pièces bordantes **couvrent tout le côté** du
couloir : sinon une portion resterait sans propriétaire. Jusqu'à trois passes,
alternant les deux côtés.

Une bande dans les bornes devient un **rangement**, qu'elle couvre toute la
façade ou non. Hors bornes, elle se fond dans la pièce. Résultat : 225
rangements et zéro fusion anonyme, contre 97 et 177 avant correction.

---

## 10. Décrochements entre pièces

Un échange de coin entre deux pièces mitoyennes les fait passer toutes deux
à six arêtes : la plus grande cède un bloc d'angle, l'autre le reçoit.

**Contrainte de parité.** Un polygone à angles droits a toujours un nombre
pair d'arêtes — coins convexes moins coins rentrants vaut toujours quatre.
Les formes atteignables sont donc 4, 6, 8 ; jamais 5 ni 7. Le maximum retenu
est **6**, soit un coin rentrant par pièce.

Le bloc doit être calé sur un angle **commun aux deux pièces**. Calé sur le
seul angle du donneur, il creuserait l'autre en son milieu et y produirait
huit arêtes.

Bornes : celles du rangement, appliquées au bloc **et au reliquat** laissé au
donneur, qui est lui aussi un décrochement. La partie principale doit rester
au-dessus de la largeur minimale de son type. Un garde-fou refuse tout
échange qui ne conserverait pas exactement la surface.

Nombre d'échanges tentés : `max(2, pièces / 1,6)`.

---

## 11. Solveur de pose

`placement.js`. Prend une liste d'équipements et un rectangle, rend un
verdict et les poses.

| Constante | Valeur | Rôle |
|---|---|---|
| pas | 10 cm | résolution du balayage |
| côté minimal | 70 cm | borne basse explorée |
| côté maximal | 600 cm | borne haute explorée |

Les équipements sont posés du plus grand au plus petit, avec retour arrière.
Chaque équipement est essayé dans les **quatre rotations cardinales**. Les
ancrages `wall` et `corner` restreignent les poses aux bords.

Chaque pose renvoie son emprise, ses zones d'usage, sa `rotation`, le `wall`
qui la porte et la direction `inward`. C'est ce contrat qui permet au rendu
de **tourner** le symbole au lieu de l'étirer : les deux moitiés partagent
enfin la même orientation.

Règle structurante : **deux zones d'usage peuvent se recouvrir entre elles,
jamais une emprise.** On partage le dégagement devant un évier et un
lave-vaisselle ; on ne pose pas une chaise dans un placard.

### Valider puis optimiser

Le placement est séparé en deux temps, et la distinction est de fond.

**`validate()`** cherche exhaustivement *une* solution respectant emprises,
zones d'usage, ancrages et relations dures. C'est le verdict : la pièce est
meublable ou non. Aucune préférence n'entre ici.

**`optimize()`** explore ensuite plusieurs solutions valides, les note, et
retient la meilleure.

```
essais = max(1, min(12, demandés))          défaut 6
graine(n) = graine + n × 0x9E3779B9         nombre d'or, 32 bits
```

Deux graines produisent donc deux agencements différents ; une même graine
reste rejouable. **Aucune règle dure n'est relâchée par l'optimisation** —
elle choisit parmi des solutions déjà valides.

### Notation d'un agencement

| Terme | Valeur | Sens |
|---|---|---|
| Relations satisfaites | qualité × poids de la relation | voir §12 |
| Diversité des murs occupés | +0,35 × murs distincts / min(4, ancrés) | éviter d'aligner tout sur un seul mur |
| Équipements libres proches du centre | +0,25 × (1 − distance au centre / diagonale) | une table basse va au milieu, pas dans un coin |

Ici le score est un **mérite** : plus haut vaut mieux. C'est l'inverse de la
notation des candidats de plan au §8, où le score est une pénalité. Les deux
échelles cohabitent sans se rencontrer, mais la confusion est facile.

Les coefficients 0,35 et 0,25 sont des conventions, non calibrées.

### Cache et autorité

`fit.data.js` est un **cache** des enveloppes admissibles pour les treize
préréglages, produit hors ligne par le même algorithme. Le solveur en ligne
fait autorité ; le cache sert de vérification croisée et de chemin rapide.

### Désignation des exigences

`room-model.js` désigne ce qu'une pièce doit contenir avant tout calcul
géométrique, et vérifie la cohérence du socle lui-même :

| Code | Exigence | Niveau |
|---|---|---|
| `EX1` | le type et sa variante existent dans le socle | bloquant |
| `EX2` | chaque équipement requis actif est désigné une fois | bloquant |
| `EX3` | chaque équipement déclare emprise, ancrage et usage minimal | bloquant |
| `EX4` | chaque relation référence des équipements désignés | bloquant |

Ces quatre règles ne portent pas sur un plan mais sur **la donnée du socle**.
Elles empêchent qu'une faute de saisie — une relation pointant vers un
équipement retiré — produise un verdict silencieusement faux. C'est le
premier contrôle du projet qui vérifie ses propres entrées plutôt que ses
sorties.

---

## 12. Relations entre équipements

Ajoutées au socle le 16 août. Elles ne modifient **aucune dimension** : elles
qualifient une solution de pose parmi celles qui tiennent géométriquement.
Une pièce peut être meublable et mal meublée.

| Genre | Sens |
|---|---|
| `between` | l'équipement s'intercale entre deux autres |
| `same-wall` | deux équipements forment un linéaire continu |
| `different-wall` | deux équipements ne partagent pas le même mur |
| `near` | distance maximale entre deux équipements |

Relations déclarées :

| Code | Pièce | Exigence | Niveau | Poids |
|---|---|---|---|---|
| `KITCHEN-SEQUENCE-001` | cuisine | le plan de travail sépare l'évier de la plaque | bloquant | 4 |
| `KITCHEN-ALIGN-001` | cuisine | évier et préparation en linéaire | conseil | 1,5 |
| `KITCHEN-ALIGN-002` | cuisine | plaque et préparation en linéaire | conseil | 1,5 |
| `KITCHEN-COLD-001` | cuisine | réfrigérateur à moins de 2,40 m de la préparation | conseil | 1 |
| `BED-STORAGE-001` | chambre | le rangement libère le mur de tête du lit | conseil | 1,4 |
| `BATH-USE-001` | salle d'eau | le lavabo n'est pas sur le mur de l'équipement humide | conseil | 1 |

Seule `KITCHEN-SEQUENCE-001` est bloquante : sans plan de travail entre
l'évier et la plaque, une cuisine est géométriquement valide et
inutilisable. C'est la seule relation dont l'absence produit un défaut, non
une maladresse.

Les poids — 4, 1,5, 1,4, 1 — sont des conventions, non calibrées, au même
titre que celles du §8.

`room-model.js` porte la désignation des exigences d'une pièce et la liste
des genres de relations ; `placement.js` les évalue sur les poses candidates.

---

## 13. Graine et tirage

```
graine   = tirée au hasard à chaque génération, ou fournie
tirage n = graine + n × 2654435761      (multiplicateur de Knuth)
décrochements : graine ⊕ 0x9E3779B9     (nombre d'or, 32 bits)
```

Générateur pseudo-aléatoire de type Mulberry32, hachage FNV-1a pour dériver
une graine d'un questionnaire. La graine est encodée en base 36 sur sept
caractères, affichée et exportée : deux générations de même graine et même
questionnaire sont identiques.

Le décalage par le nombre d'or pour les décrochements évite qu'ils soient
corrélés aux tirages de découpe.

---

## 14. Règles évaluées

**Quinze règles.** Trois sont **déclarées limitées** : leur exigence est
valide, la génération ne sait pas la tenir, et le rapport les sépare des
violations réelles plutôt que de les déclasser.

| Règle | Niveau | Seuil | Statut du seuil |
|---|---|---|---|
| `TH2D-PROJECT-001` | bloquant | surface ≥ somme des minimums | convention |
| `TH2D-ROOM-001` | bloquant | pièce ≥ sa surface minimale | convention |
| `TH2D-ROOM-002` | bloquant | pièce meublable | **socle, calculé** |
| `TH2D-GRAPH-001` | bloquant | adjacences demandées réalisées | — *limitée* |
| `TH2D-GRAPH-002` | bloquant | toute pièce reliée au séjour | — |
| `TH2D-SIZING-001` | conseil | séjour ≥ 24 m² | convention |
| `TH2D-CIRC-001` | bloquant | couloir ≥ 1,20 m | convention |
| `TH2D-CIRC-002` | bloquant | couloir desservant ≥ 2 espaces | convention |
| `TH2D-CIRC-003` | bloquant | couloir ≤ 1,80 m | convention, *limitée* |
| `TH2D-CIRC-004` | conseil | circulation ≤ 10 % du plan | référentiel d'origine |
| `TH2D-RANGEMENT-001` | bloquant | 0,45 m ≤ profondeur ≤ 0,6 × longueur | convention |
| `TH2D-RANGEMENT-002` | bloquant | rangement attenant à sa pièce | — |
| `TH2D-RANGEMENT-003` | conseil | chaque chambre a un rangement | convention, *limitée* |
| `TH2D-FORME-001` | bloquant | arêtes paires et ≤ 6 | géométrique |
| `TH2D-RESERVE-001` | bloquant | aucune surface sans propriétaire | invariant |

### Une convention remplacée par un calcul

`TH2D-GEOM-001` — rapport de forme ≥ 0,28 — **a été supprimée le 16 août**.
Son seuil n'avait aucune justification, et `TH2D-ROOM-002` répond à la même
question en la calculant : une pièce n'est plus mal proportionnée parce
qu'un nombre le dit, elle l'est parce que son contenu n'y tient pas.

C'est le premier retrait du référentiel, et il vaut d'être noté : un
référentiel se juge autant à ce qu'il sait abandonner qu'à ce qu'il couvre.
`TH2D-FORME-002`, qui contrôlait la largeur restante après décrochement, a
disparu par le même mouvement — la question est désormais posée par le
solveur.

Reste que la suppression laisse **quatorze conventions sur quinze règles**.
Une seule a un seuil calculé.

---

## 15. Ce que le modèle ne calcule pas

À énoncer, sinon les absences passent pour des choix.

- **Ni murs, ni épaisseurs.** Les pièces sont jointives ; aucune surface
  n'est perdue en cloisons, ce qui surestime la surface utile.
- **Ni portes, ni fenêtres.** Les façades existent désormais — segments
  orientés et nœud `exterior` dans le graphe — mais aucune ouverture n'y est
  encore posée, donc la règle d'entrée reste hors de portée.
- **Aucun cheminement.** L'accessibilité est jugée sur le graphe de contact,
  pas sur un passage de largeur donnée à travers le mobilier.
- **Aucune hauteur.** Le volume habitable de `VAL-DEC-003` est hors de
  portée ; seule la branche en surface de la règle de décence s'applique.
- **Aucune orientation réelle.** Les côtés de façade portent un nom — nord,
  sud, est, ouest, selon la convention du dessin — mais rien ne les relie à
  un terrain. « Lumière » n'agit toujours que sur les proportions.
- **Aucun étage.**
- **Aucune ventilation**, alors qu'elle impose une topologie — voir
  `OUVERTURES_ET_PARCOURS.md` §1.

---

## 16. Ce qui reste non calibré

Les pondérations du §8 et la plupart des seuils du §14 sont des conventions
posées à vue, jamais éprouvées l'une contre l'autre. Elles produisent des
plans acceptables, ce qui ne prouve pas qu'elles soient justes — seulement
qu'aucune n'est absurde.

La direction du projet est de **remplacer les conventions par du calcul**,
comme l'a fait `TH2D-ROOM-002` en abandonnant le rapport de forme au profit
d'un solveur de pose. Chaque ligne marquée `convention` dans ce document est
une candidate à ce traitement.
