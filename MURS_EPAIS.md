# Murs dimensionnés — du trait à la géométrie constructive

Document de cadrage du chantier « murs épais » de TechnoHab.

**Statut :** MVP M1 à M5 livré les 19–20 août 2026
**Priorité :** après stabilisation des ouvertures, du parcours et de l'union
géométrique des parties de pièce  
**Principe :** livrer d'abord un MVP géométriquement vrai, sans prétendre
modéliser tous les systèmes constructifs.

**Lecture actuelle :** le « problème » ci-dessous décrit l'état antérieur au
chantier. Le moteur publié construit désormais les murs, leurs faces et leurs
réservations avant la pose finale et le verdict. La chaîne courante est décrite
dans [`CARTOGRAPHIE_MOTEUR.md`](CARTOGRAPHIE_MOTEUR.md) §5.

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

- [x] ajouter la configuration constructive au plan ;
- [x] produire des murs intérieurs et extérieurs uniques ;
- [x] éliminer les faux murs entre parties d'une même pièce ;
- [x] tester rectangles, pièces en L, angles et jonctions en T.

**Livrable M1 à l'époque :** un tableau `walls` stable. Il est désormais
utilisé par les ouvertures, l'ancrage du mobilier, les surfaces utiles et le
cheminement.

Implémentation : `assets/construction.js` dérive ce tableau après la fusion et
la mise en forme finales des pièces. Les identifiants dépendent de la géométrie
et des espaces séparés, pas de l'ordre des pièces. Les plages admises restent
des conventions explicites du MVP : 0,10–1,00 m pour un mur extérieur et
0,04–0,50 m pour une cloison intérieure.

### M2 — Surfaces utiles

- [x] produire `usablePolygon` et `usableArea` par pièce ;
- [x] distinguer surface habitable, surface de murs et emprise extérieure ;
- [x] préserver la surface habitable demandée en ajustant l'enveloppe ;
- [x] ajouter les invariants de couverture et de non-chevauchement.

**Livrable :** des surfaces et dimensions intérieures cohérentes.

Implémentation : la partition finale est agrandie par homothétie, sans changer
sa topologie, jusqu'à ce que la somme des surfaces utiles retrouve la demande
habitable. `room.area` et `room.usableArea` portent désormais cette surface
utile ; `room.partitionArea` conserve la surface avant retrait des cloisons.
`usablePolygon` suit la convention d'un Polygon GeoJSON — tableau d'anneaux —
et `usableBounds` en donne la boîte englobante. Le plan expose séparément
`targetHabitableArea`, `habitableArea`, `partitionArea`, `wallArea` et
`grossFloorArea`, avec une tolérance de conservation de 0,01 m².

### M3 — Ouvertures

- [x] rattacher portes et fenêtres à un mur ;
- [x] réserver leur baie dans le volume du mur ;
- [x] refuser une ouverture qui touche une jonction ou déborde ;
- [x] recalculer sens, face et débattement des portes.

**Livrable :** des murs réellement percés par les ouvertures.

Implémentation : chaque mur expose ses deux faces, ses réservations et les
segments pleins qui subsistent. Portes, entrée et fenêtres portent un
`wallId` et un `reservationId` ; la réservation traverse l'épaisseur complète
du mur et conserve un tableau minimal de 0,08 m aux jonctions. Le placement
écarte les baies entre elles, tandis que la couche constructive refuse encore
explicitement un débordement, un chevauchement ou un mur absent. Le sens et le
débattement des portes partent désormais de la face intérieure choisie.
`TH2D-WALL-005` contrôle ces références dans le plan exporté et
`scripts/test-ouvertures-murs.mjs` couvre les refus ainsi que 24 configurations
sur deux systèmes d'épaisseurs.

### M4 — Mobilier et parcours

- [x] transmettre les faces intérieures au solveur ;
- [x] migrer `wall`, `corner`, `same-wall` et `different-wall` ;
- [x] recalculer `TH2D-ROOM-002` sur la surface utile ;
- [x] bloquer le parcours sur les murs, sauf aux ouvertures.

**Livrable :** un plan dont l'usage est validé dans l'espace réellement
disponible.

Implémentation : chaque pièce expose `wallFaces`, soit les portions de faces
intérieures encore pleines après retrait des réservations. Le solveur balaie
ces segments, conserve le véritable `wallId` et le `faceId`, vérifie les
emprises et zones d'usage dans `usablePolygon`, et traite les coins depuis le
contour utile. Les relations `same-wall`, `different-wall` et `between`
comparent donc des murs constructifs plutôt que les quatre côtés d'une boîte.
`TH2D-ROOM-002` prend la géométrie utile comme référence et
`TH2D-WALL-006` contrôle chaque équipement mural effectivement posé. Enfin,
le maillage du parcours est construit sur les surfaces utiles : les volumes
de murs restent vides et seules les réservations M3 les rendent traversables.
`scripts/test-mobilier-parcours.mjs` couvre 12 plans, les ancrages muraux et
en angle, les relations, les deux règles et le franchissement d'une baie.

### M5 — Rendu, export et régression

- [x] tracer les volumes de murs et leurs réservations ;
- [x] afficher les deux familles de surfaces et dimensions ;
- [x] publier un schéma JSON versionné ;
- [x] comparer au moins 24 configurations avant/après ;
- [x] couvrir petites pièces, grandes distributions et plusieurs graines.

**Livrable :** MVP activable dans l'interface et exportable.

Implémentation : `assets/app.js` dessine chaque `solidSegment` comme une
surface SVG, après les surfaces utiles et avant les portes et fenêtres. Les
réservations apparaissent donc comme de véritables interruptions du volume,
sans masque graphique. La légende distingue textuellement surface utile, mur
extérieur, cloison et baie ; les métriques affichent séparément habitable,
murs et emprise. Le dessin reste dans la palette fermée de Wonderland, avec
des filets d'un pixel et sans encadré supplémentaire.

Le contrat d'export passe en `3.0` et est publié dans `PLAN_SCHEMA.json`.
`exportDocument()` produit l'enveloppe versionnée ; `readExportDocument()`
accepte aussi l'ancienne enveloppe `{ plan, rulesReport }` et les anciens
plans directs. Le banc `scripts/test-livraison-murs.mjs` couvre 24
configurations, deux épaisseurs, trois formes, quatre surfaces et deux graines
par configuration, soit 48 plans. Résultat du 20 août 2026 : 0 violation
bloquante ; 360 pièces meublables dans l'ancien rectangle contre 353 dans la
géométrie constructive ; 295 pièces atteintes dans les deux modèles de
parcours. Les surfaces cumulées sont 4 955,1 m² de partition, 4 740 m²
habitables, 1 045,3 m² de murs et 5 785,3 m² d'emprise extérieure.

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
4. exploiter les faces et réservations dans le mobilier et le parcours ;
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
