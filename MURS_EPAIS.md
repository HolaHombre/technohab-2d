# Murs dimensionnés — du trait à la géométrie constructive

Document de cadrage du chantier « murs épais » de TechnoHab.

**Statut :** planifié, non commencé  
**Priorité :** après stabilisation des ouvertures, du parcours et de l'union
géométrique des parties de pièce  
**Principe :** livrer d'abord un MVP géométriquement vrai, sans prétendre
modéliser tous les systèmes constructifs.

## 1. Problème

Le moteur représente aujourd'hui une limite de pièce par une ligne sans
épaisseur. Cette même ligne sert de séparation, de support de porte, de mur
d'ancrage du mobilier et de frontière du cheminement. La somme des surfaces
des pièces reste donc égale à l'emprise entière du bâtiment : aucun mur ne
consomme de surface.

Cette simplification produit quatre écarts :

- les surfaces utiles sont surestimées ;
- les largeurs intérieures ne tiennent pas compte des cloisons ;
- portes et fenêtres sont dessinées sur une ligne, sans réservation ;
- mobilier et parcours raisonnent sur une limite abstraite, pas sur la face
  intérieure d'un mur.

## 2. Objectif du MVP

À partir de la partition actuelle, produire une couche constructive capable
de répondre sans ambiguïté à ces questions :

1. où sont les murs intérieurs et extérieurs ?
2. quelle est leur épaisseur ?
3. quelle surface intérieure reste réellement à chaque pièce ?
4. où une porte ou une fenêtre perce-t-elle le mur ?
5. sur quelle face intérieure le mobilier s'ancre-t-il ?
6. quelle surface le cheminement peut-il réellement emprunter ?

Le MVP doit rester compatible avec le générateur actuel : la partition des
pièces reste la source de vérité de la génération, puis une étape
déterministe en dérive les murs et les surfaces utiles.

## 3. Décisions du MVP

### 3.1 Deux épaisseurs configurables

Valeurs initiales de convention, modifiables au niveau du plan :

```js
construction: {
  exteriorWallThickness: 0.30,
  interiorWallThickness: 0.10
}
```

Ces valeurs ne deviennent réglementaires qu'après rattachement à une source
ou à un système constructif. Le moteur doit accepter une plage validée, et
non disperser ces constantes dans le code.

### 3.2 Surface demandée

Dans le MVP, la surface saisie reste la **surface habitable cible**. Le moteur
calcule l'emprise extérieure nécessaire pour contenir cette surface, les murs
venant en supplément. Le résultat expose séparément :

- `targetHabitableArea` : demande utilisateur ;
- `habitableArea` : somme des surfaces intérieures utiles ;
- `wallArea` : emprise horizontale des murs ;
- `grossFloorArea` : emprise extérieure totale.

La relation contrôlée devient :

```text
grossFloorArea = habitableArea + wallArea
```

à la tolérance numérique près.

### 3.3 Convention de retrait

- un mur extérieur se développe vers l'extérieur de la partition habitable ;
- une cloison intérieure est centrée sur la séparation et retire une
  demi-épaisseur à chacune des deux pièces ;
- un bord entre deux parties d'une même pièce ne produit aucun mur ;
- un mur partagé est un objet unique, référencé par ses deux pièces.

Cette convention évite de favoriser arbitrairement une pièce lors de la
création d'une cloison.

### 3.4 Représentation minimale

```js
wall: {
  id: 'wall_12',
  kind: 'interior',
  thickness: 0.10,
  between: ['bedroom_1', 'circulation'],
  axis: { x0: 4.2, y0: 1.8, x1: 4.2, y1: 5.1 },
  faces: {
    bedroom_1: { x0, y0, x1, y1 },
    circulation: { x0, y0, x1, y1 }
  },
  openings: ['door_3']
}
```

Chaque pièce reçoit en complément un `usablePolygon`, une `usableArea` et
les identifiants de ses faces murales. Les rectangles historiques restent
disponibles pendant la migration, mais cessent progressivement de faire foi
pour les calculs d'usage.

## 4. Méthode de résolution

La chaîne du MVP est la suivante :

```text
partition des pièces
  → union des parties de chaque pièce
  → extraction des segments frontières
  → appariement des segments partagés
  → classification intérieur / extérieur
  → construction des volumes de murs
  → calcul des faces et contours intérieurs
  → réservation des ouvertures
  → placement et cheminement sur la géométrie utile
```

### Étape A — Extraire un référentiel de murs

- unifier les parties rectangulaires de chaque pièce avant extraction ;
- supprimer les frontières internes à une même pièce ;
- découper les segments colinéaires aux points de jonction ;
- créer un seul mur pour chaque contact entre deux pièces ;
- créer un mur extérieur pour chaque frontière sans voisin ;
- stabiliser les identifiants afin que portes et fenêtres les référencent.

### Étape B — Calculer la surface utile

- décaler chaque face selon la convention du §3.3 ;
- construire le contour intérieur de chaque pièce ;
- calculer `usableArea`, largeur locale minimale et boîte utile ;
- recalculer la meublabilité sur cette géométrie ;
- contrôler l'invariant surface brute = surface utile + murs.

Le premier algorithme peut rester limité aux polygones orthogonaux produits
par le moteur actuel. Une structure générale de demi-arêtes n'est pas exigée
pour le MVP.

### Étape C — Percer les murs

- rattacher chaque porte et fenêtre à `wallId` ;
- vérifier que la réservation tient entre les jonctions ;
- distinguer largeur de baie, passage utile et épaisseur traversée ;
- retirer graphiquement et logiquement la réservation du volume du mur ;
- recalculer le débattement depuis la bonne face intérieure.

### Étape D — Migrer les usages

- ancrer les équipements sur les faces intérieures ;
- exclure les réservations de portes et fenêtres des portions ancrables ;
- utiliser `usablePolygon` pour les emprises et zones d'usage ;
- considérer les murs comme obstacles du cheminement ;
- autoriser un changement de pièce uniquement par une ouverture.

### Étape E — Restituer et exporter

- dessiner les murs comme surfaces, non comme simples traits épaissis ;
- différencier murs extérieurs et cloisons ;
- conserver les ouvertures lisibles à toute échelle ;
- afficher surface habitable et emprise extérieure sans les confondre ;
- versionner le schéma JSON et préserver la lecture des exports antérieurs.

## 5. Lots du MVP

### M1 — Données et extraction

- [ ] ajouter la configuration constructive au plan ;
- [ ] produire des murs intérieurs et extérieurs uniques ;
- [ ] éliminer les faux murs entre parties d'une même pièce ;
- [ ] tester rectangles, pièces en L, angles et jonctions en T.

**Livrable :** un tableau `walls` stable, exporté mais pas encore utilisé par
les autres calculs.

### M2 — Surfaces utiles

- [ ] produire `usablePolygon` et `usableArea` par pièce ;
- [ ] distinguer surface habitable, surface de murs et emprise extérieure ;
- [ ] préserver la surface habitable demandée en ajustant l'enveloppe ;
- [ ] ajouter les invariants de couverture et de non-chevauchement.

**Livrable :** des surfaces et dimensions intérieures cohérentes.

### M3 — Ouvertures

- [ ] rattacher portes et fenêtres à un mur ;
- [ ] réserver leur baie dans le volume du mur ;
- [ ] refuser une ouverture qui touche une jonction ou déborde ;
- [ ] recalculer sens, face et débattement des portes.

**Livrable :** des murs réellement percés par les ouvertures.

### M4 — Mobilier et parcours

- [ ] transmettre les faces intérieures au solveur ;
- [ ] migrer `wall`, `corner`, `same-wall` et `different-wall` ;
- [ ] recalculer `TH2D-ROOM-002` sur la surface utile ;
- [ ] bloquer le parcours sur les murs, sauf aux ouvertures.

**Livrable :** un plan dont l'usage est validé dans l'espace réellement
disponible.

### M5 — Rendu, export et régression

- [ ] tracer les volumes de murs et leurs réservations ;
- [ ] afficher les deux familles de surfaces et dimensions ;
- [ ] publier un schéma JSON versionné ;
- [ ] comparer au moins 24 configurations avant/après ;
- [ ] couvrir petites pièces, grandes distributions et plusieurs graines.

**Livrable :** MVP activable dans l'interface et exportable.

## 6. Règles nouvelles

| Identifiant | Niveau | Contrôle MVP |
|---|---|---|
| `TH2D-WALL-001` | HARD | Chaque frontière de partition appartient à exactement un mur ou à une union interne supprimée |
| `TH2D-WALL-002` | HARD | Épaisseurs intérieure et extérieure dans les plages admises |
| `TH2D-WALL-003` | HARD | Aucun volume de mur ne chevauche une surface utile |
| `TH2D-WALL-004` | HARD | Surface brute = surfaces utiles + murs, dans la tolérance |
| `TH2D-WALL-005` | HARD | Chaque ouverture est contenue dans un mur et respecte les distances aux jonctions |
| `TH2D-WALL-006` | HARD | Chaque équipement mural référence une face intérieure disponible |

Les seuils d'épaisseur et de distance aux jonctions restent des conventions
explicites tant qu'ils ne sont pas associés à un système constructif sourcé.

## 7. Critères d'acceptation du MVP

Le MVP est terminé lorsque :

1. toute variante générée possède un référentiel de murs sans doublon ;
2. aucun mur n'est créé entre deux parties d'une même pièce ;
3. la conservation des surfaces est tenue à moins de `0,01 m²` ;
4. la surface habitable cible reste dans la tolérance du questionnaire ;
5. toutes les portes et fenêtres référencent un mur et une réservation valide ;
6. le mobilier est placé sur les faces intérieures et non sur les axes ;
7. le parcours ne traverse aucun mur hors ouverture ;
8. les 24 configurations de référence passent sur plusieurs graines ;
9. le JSON expose séparément surfaces utiles, murs et emprise extérieure ;
10. le rendu reste lisible aux dimensions minimales de l'interface.

## 8. Hors MVP

Sont volontairement reportés :

- composition multicouche détaillée des parois ;
- isolation, résistance thermique, acoustique et coupe-feu ;
- murs porteurs, poteaux, poutres et descentes de charges ;
- gaines incorporées et réservations techniques complexes ;
- doublages variables d'une pièce à l'autre ;
- murs courbes ou non orthogonaux ;
- détails de tableaux, linteaux, appuis et seuils ;
- quantitatif, coût travaux et bilan carbone ;
- étages et continuité verticale des murs.

Ces extensions ne doivent pas complexifier le schéma du MVP avant qu'un
besoin mesuré ne les justifie.

## 9. Dépendances et coût

**Dépendances :** union géométrique des parties de pièce, ouvertures stables,
schéma de surface explicite et banc de régression à graines fixes.

Ordre recommandé dans le produit :

1. terminer les défauts géométriques bloquants actuels ;
2. stabiliser portes, fenêtres et parcours ;
3. réaliser M1 et M2 ;
4. brancher M3 et M4 ;
5. livrer M5 avant toute extension constructive.

Estimation indicative pour une personne connaissant le moteur : **10 à 18
jours ouvrés** pour le MVP complet, dont environ 4 à 7 jours pour M1–M2. Une
modélisation constructive robuste au-delà du MVP représente plutôt **3 à 5
semaines**.

## 10. Risques à surveiller

- petites pièces rendues non meublables après retrait des demi-cloisons ;
- changement silencieux de la signification de la surface demandée ;
- doubles murs aux jonctions ou aux décrochements ;
- ouverture valide sur l'axe mais invalide sur la face intérieure ;
- anciens exports interprétés avec la nouvelle convention ;
- inflation de l'emprise extérieure sur les programmes très cloisonnés ;
- incohérence entre géométrie calculée et simple effet de trait SVG.

Le dernier risque est une règle de conception : un mur épais ne doit jamais
être simulé uniquement avec `stroke-width`. Sa surface doit exister dans les
données avant d'exister dans le dessin.
