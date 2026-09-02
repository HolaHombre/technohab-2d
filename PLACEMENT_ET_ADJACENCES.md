# Placement des pièces et nature des adjacences

Ce qu'est une adjacence, et ce qui décide qu'une pièce va là plutôt
qu'ailleurs. Les deux notions que le moteur emploie sans les avoir définies.

**Statut : spécification, non implémenté.**

Ce document ne reprend pas ce qui est déjà écrit ailleurs :
[`OUVERTURES_ET_PARCOURS.md`](OUVERTURES_ET_PARCOURS.md) pour les baies, les
portes, la ventilation et le cheminement ;
[`SOCLE_AGENCEMENT.md`](SOCLE_AGENCEMENT.md) pour les aménagements et leur
pose ; [`MODELE_DE_CALCUL.md`](MODELE_DE_CALCUL.md) §7 pour le seuil de
desserte déjà en vigueur.

---

## 1. Ce qu'est une adjacence

Le moteur n'en connaît qu'une sorte : `kind: 'opening'`, même poids, même
exigence. C'est la simplification la plus coûteuse du référentiel, parce
qu'elle empêche d'exprimer ce qu'une relation *demande*.

### Les cinq natures

| Nature | Ce qu'elle exige | Contact minimal |
|---|---|---|
| **porte** | une ouverture qui **ferme** | 1,00 m |
| **ouverture** | un passage libre, sans vantail | 1,20 m |
| **ouverture large** | deux espaces qui n'en font qu'un | 1,50 m |
| **séparation** | contact autorisé, mais **paroi pleine** — aucun passage | — |
| **interdite** | aucun contact, ou contact sans conséquence d'usage | — |

Les contacts sont ceux déjà retenus : 0,80 m de vantail plus tableaux pour
une porte, une convention pour les deux autres.

La distinction porte / ouverture n'est pas cosmétique. Une chambre exige de
fermer ; un séjour ouvert sur la cuisine exige le contraire. Les deux se
disent aujourd'hui du même mot, et le moteur les traite identiquement.

### Les quatre degrés

Orthogonaux à la nature — une relation a une nature *et* un degré.

| Degré | Sens | Effet |
|---|---|---|
| **obligatoire** | son absence est un défaut | bloquant |
| **souhaitable** | son absence dégrade | conseil, pondère le score |
| **déconseillée** | sa présence dégrade | conseil |
| **interdite** | sa présence est un défaut | bloquant |

Le moteur ne sait exprimer que le premier. Les trois autres existent dans le
référentiel d'origine et n'ont jamais été traduits — c'est pourquoi
`WC ↔ séjour`, pourtant proscrit, n'est pas contrôlé.

### Modèle

```js
{ de: 'circulation', vers: 'chambre',
  nature: 'porte', degre: 'obligatoire', contact: 1.00 }

{ de: 'sejour', vers: 'cuisine',
  nature: 'ouverture_large', degre: 'obligatoire', contact: 1.50,
  condition: 'cuisine ouverte' }

{ de: 'wc', vers: 'sejour',
  nature: 'interdite', degre: 'interdite' }
```

### Le référentiel de relations

| De | Vers | Nature | Degré |
|---|---|---|---|
| circulation | chambre | porte | obligatoire |
| circulation | salle d'eau | porte | obligatoire |
| circulation | WC | porte | obligatoire |
| circulation | séjour | ouverture | obligatoire |
| circulation | entrée | ouverture | obligatoire |
| séjour | cuisine ouverte | ouverture large | obligatoire |
| séjour | cuisine fermée | porte | obligatoire |
| séjour | salle à manger | ouverture large | souhaitable |
| cuisine | cellier | porte | souhaitable |
| chambre | salle d'eau | porte | souhaitable (suite parentale) |
| WC | séjour | — | **interdite** |
| WC | cuisine | séparation | déconseillée |
| chambre | chambre | — | déconseillée |
| garage | séjour | séparation | obligatoire |

---

## 2. Quelle pièce va où

Quatre principes décident du placement. Ils ne se contredisent pas : ils se
hiérarchisent.

### 2.1 Contact avec la façade — contrainte, non préférence

Découle de la ventilation, et c'est une obligation, pas un agrément : les
entrées d'air se font **dans toutes les pièces principales**, par la façade.
Les pièces de service s'extraient par conduit et n'en ont pas besoin.

| Doit toucher la façade | N'y est pas tenu |
|---|---|
| séjour, salle à manger, chambre, bureau, cuisine | WC, salle d'eau, cellier, buanderie, local technique, circulation |

C'est la contrainte la plus structurante du placement, et **le moteur ne la
vérifie pas du tout**. Elle se calcule pourtant sans rien de neuf : une pièce
touche la façade si l'un de ses bords coïncide avec un bord de l'enveloppe.

Elle explique aussi le regroupement des pièces d'eau — leurs conduits se
mutualisent.

### 2.2 Gradient d'intimité — de l'entrée vers le fond

Une pièce est d'autant plus loin de l'entrée qu'elle est intime. Le trajet
depuis la porte traverse le public avant le privé, jamais l'inverse.

| Rang | Pièces | Distance à l'entrée |
|---|---|---|
| 1 — public | entrée, circulation, séjour, salle à manger | courte |
| 2 — commun | cuisine, cellier, buanderie, WC | moyenne |
| 3 — privé | chambre, bureau, salle d'eau | longue |
| 4 — technique | local technique, garage | indifférente, mais hors vue de l'entrée |

Mesurable dès qu'une entrée existe : longueur du plus court chemin, comparée
au rang. Un rang 3 plus proche qu'un rang 1 est une inversion, et c'est un
conseil, pas un blocage.

### 2.3 Orientation — préférence, jamais obligation

| Pièce | Orientation préférée | Raison |
|---|---|---|
| séjour, salle à manger | sud, ouest | lumière de fin de journée |
| chambre | est | lumière du matin, fraîcheur le soir |
| cuisine | nord, est | éviter la surchauffe |
| bureau | nord | lumière stable, sans éblouissement |
| salle d'eau, WC, cellier, technique | nord | aucun besoin de lumière |

**Prérequis manquant : le nord n'existe pas.** Le repère affiché sur le plan
est décoratif, et l'option « lumière » n'agit que sur les proportions de
l'enveloppe. Aucune de ces préférences n'est calculable aujourd'hui.

C'est le niveau `préférence` que ta décision 3 a rendu agissant : ces
orientations sont exactement ce qu'il doit porter — pondérées, lues par le
score, jamais bloquantes. Une parcelle réelle contraint plus qu'un manuel.

### 2.4 Regroupement technique — préférence forte

Les pièces partageant un réseau gagnent à se toucher : colonnes d'eau,
d'évacuation et de ventilation mutualisées.

- **humide** : cuisine, salle d'eau, WC, buanderie
- **bruyant loin de calme** : garage, buanderie, cuisine, séjour éloignés des
  chambres et du bureau

Déjà présent dans le référentiel d'origine en préférence, jamais implémenté.
Calculable sur les centroïdes, sans rien de nouveau.

---

## 3. Ce que cela demande au moteur

Par ordre de dépendance. Les deux premiers conditionnent tout le reste.

| # | Prérequis | Sert à | État |
|---|---|---|---|
| 1 | **Segments de façade** portés par l'enveloppe | contact façade, orientation, baies | absent |
| 2 | **Nœud extérieur** et porte d'entrée | gradient d'intimité, cheminement | absent |
| 3 | **Nord réel**, issu du questionnaire | orientation | absent, repère décoratif |
| 4 | **Relations typées** au lieu d'`opening` | natures et degrés | **livré M3 / O4** |
| 5 | Cheminement à largeur | gradient mesuré sur un vrai trajet | spécifié, non fait |

Les points 1 et 2 sont ceux que `OUVERTURES_ET_PARCOURS.md` §2 pose déjà
comme prérequis des ouvertures. Ils reviennent ici par une autre porte : ce
n'est pas une coïncidence, c'est le même manque qui bloque deux chantiers.

**Le point 4 est livré par M3 / O4.** `buildProgram()` publie des objets portant
`nature`, `degre` et `contact`; `TH2D-ADJ-001` à `004` les jugent, et le score
ne distribue aucune prime : il pénalise le souhait manqué, l'adjacence
déconseillée réalisée et, plus fortement, l'adjacence interdite réalisée.

---

## 4. Règles à prévoir

| Code | Règle | Niveau |
|---|---|---|
| `TH2D-ADJ-001` | Toute relation obligatoire est réalisée à sa nature et son contact | bloquant |
| `TH2D-ADJ-002` | Aucune relation interdite n'est réalisée | bloquant |
| `TH2D-ADJ-003` | Les relations souhaitables manquantes sont pénalisées au score | préférence |
| `TH2D-ADJ-004` | Les relations déconseillées réalisées sont signalées | conseil |
| `TH2D-FACADE-001` | Toute pièce principale touche la façade | bloquant |
| `TH2D-FACADE-002` | Les pièces de service partagent une gaine technique | préférence |
| `TH2D-INTIM-001` | Aucune inversion du gradient d'intimité | conseil |
| `TH2D-ORIENT-001` | Orientation conforme aux préférences par type | préférence |

`TH2D-FACADE-001` est la seule qui soit bloquante et immédiatement
calculable une fois les segments de façade posés. C'est probablement la
règle manquante la plus importante du référentiel : elle décide de la
structure du plan, et son absence explique qu'une chambre puisse aujourd'hui
se retrouver sans aucun mur extérieur.

---

## 5. Ce que ce document ne tranche pas

**L'orientation demande une parcelle.** Les préférences du §2.3 valent pour
un terrain libre. Une parcelle réelle, avec ses vis-à-vis et ses accès,
prime sur toute règle d'orientation. Tant que le questionnaire ne décrit pas
le terrain, ces préférences resteront théoriques — et il vaut mieux le dire
que produire des plans orientés dans le vide.

**Les contacts de 1,20 m et 1,50 m sont des conventions.** Seule la largeur
de vantail est réglementaire. La distinction ouverture / ouverture large
relève de l'usage de conception, et devrait être adossée ou assumée comme
telle au sens de `VEILLE_NORMATIVE.md`.

**Le gradient d'intimité est culturel.** Le rangement proposé décrit
l'habitat français contemporain. Il n'a rien d'universel, et le poser comme
règle plutôt que comme préférence serait une erreur de nature — c'est
pourquoi `TH2D-INTIM-001` est un conseil et non un blocage.
