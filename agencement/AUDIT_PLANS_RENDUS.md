# Audit Plans et Rendus

## Vue d'ensemble
Ce fichier centralise les observations et problèmes identifiés dans les plans et rendus du projet TechnoHab. Chaque observation est structurée selon le format : **Observation visuelle → Problème → Correction**.

---

## Observations

### Observation N°1 : Unicité du couloir par construction
**Statut** : À étudier — évolution topologique, hors quick win
**Seed** : 1HAP2IB

**Observation visuelle**
- Une seule et unique zone de circulation (couloir) est générée par construction, peu importe la configuration

**En quoi c'est un problème**
- Les bâtiments réels ont souvent plusieurs axes de circulation ou ramifications  
- Limite la flexibilité spatiale et crédibilité du plan
- Restreint les variantes topologiques possibles

**Comment corriger**
- *(À construire lors des discussions futures)*

---

### Observation N°2 : Absence d'affichage des portes et circulations intérieures
**Statut** : Corrigé le 2026-08-17
**Seed** : 1HAP2IB

**Observation visuelle**
- Les portes ne sont pas rendues/affichées sur le plan
- La circulation intérieure aux pièces (accès, passages) n'est pas visible

**En quoi c'est un problème**
- Impossible de valider la logique d'accès aux espaces
- Les plans ne reflètent pas les connexions réelles entre pièces
- Rend difficile l'évaluation de la fonctionnalité du plan

**Comment corriger**
- Les portes et l'entrée sont désormais toujours visibles.
- Le débattement et le diagnostic des pièces non atteintes restent contrôlés par la bascule de cheminement.

---

### Observation N°3 : Placements obstruant le cheminement
**Statut** : Corrigé le 2026-08-17
**Seed** : 1HAP2IB

**Observation visuelle**
- Les éléments placés à l'intérieur des pièces (mobilier, installations) peuvent bloquer un cheminement/passage requis

**En quoi c'est un problème**
- Crée des impasses ou obstacles au flux circulatoire
- Produit des plans non-fonctionnels où la circulation est entravée
- Viole les principes d'ergonomie et d'accessibilité

**Comment corriger**
- Les seuils et débattements sont transmis au solveur comme zones interdites.
- Le cheminement est recalculé avec les emprises retenues avant l'affichage de son diagnostic.

---

### Observation N°4 : Surfaces annexes séparées de leur pièce mère
**Statut** : À étudier — nécessite une union propre des contours
**Seed** : 1HAP2IB

**Observation visuelle**
- Des surfaces rajoutées aux pièces (extensions, annexes) restent visiblement séparées par des traits de séparation (murs)
- L'élément annexe est dessiné comme une entité distincte bien qu'il fasse partie de la pièce

**En quoi c'est un problème**
- Ambiguïté sur la continuité spatiale : confusion entre séparation logique et séparation physique
- Les surfaces ne sont pas intégrées de manière cohérente au plan
- Peut indiquer un manque de fusion ou d'agrégation lors de la construction

**Comment corriger**
- *(À construire lors des discussions futures)*

---

### Observation N°5 : Absence de légende des pièces et du mobilier
**Statut** : Partiellement corrigé
**Seed** : 1HAP2IB

**Observation visuelle**
- Aucune légende n'accompagne le plan
- Les pièces ne sont pas identifiées/étiquetées
- Le mobilier n'est pas légendé

**En quoi c'est un problème**
- Impossible d'interpréter le plan sans documentation
- Ambiguïté sur la nature de chaque espace (chambre, cuisine, etc.)
- Manque de clarté sur les types et dimensions du mobilier
- Limite l'utilisabilité et la professionnalité du rendu

**Comment corriger**
- Une légende compacte décrit les catégories du plan.
- Le nom, les dimensions et la surface apparaissent au survol ou au focus clavier, sans masquer durablement le mobilier.
- Une nomenclature détaillée du mobilier reste à construire si elle devient nécessaire.

---

### Observation N°6 : Absence de fenêtres extérieures
**Statut** : Corrigé le 2026-08-17
**Seed** : 1HAP2IB

**Observation visuelle**
- Aucune fenêtre n'est représentée sur les façades externes
- L'interface bâtiment/extérieur ne montre aucune ouverture

**En quoi c'est un problème**
- Les plans manquent de réalisme et de fonctionnalité
- Pas d'indication d'éclairage naturel ou de vues
- Viole les standards de construction (toute habitation doit avoir des ouvertures)
- Rend difficile l'évaluation de l'habitabilité

**Comment corriger**
- Une fenêtre est calculée sur la meilleure façade de chaque pièce habitable.
- Elle est transmise au solveur et représentée par un double trait sur le plan.

---

### Observation N°7 : Absence de mobilier en versions larges
**Statut** : Partiellement corrigé le 2026-08-17
**Seed** : 1HAP2IB

**Observation visuelle**
- Seules des versions standard/petites de mobilier sont générées
- Pas de lit double, ni de doubles portes
- Pas de variantes dimensionnelles du mobilier

**En quoi c'est un problème**
- Les plans générés ne reflètent pas la variété réelle des aménagements
- Limite la diversité des configurations possibles
- Réduit la crédibilité des rendus (manque de variété dimensionnelle)
- Peut induire des erreurs d'espace (un lit simple ne reflète pas la même occupation qu'un lit double)

**Comment corriger**
- La première chambre reçoit automatiquement la variante parentale et son lit double.
- Les chambres suivantes conservent la variante enfant.
- Les doubles portes et d'autres variantes dimensionnelles restent à modéliser.

---

### Observation N°8 : Équipements de toilette/salle d'eau absent
**Statut** : Corrigé le 2026-08-17
**Seed** : 0PN9RZJ

**Observation visuelle**
- Les sanitaires (toilettes, baignoire, lavabo, etc.) ne sont pas représentés sur les plans
- Les salles d'eau/salles de bain existent mais sans équipements visibles

**En quoi c'est un problème**
- Les pièces destinées aux sanitaires sont non-fonctionnelles sans équipements
- Impossible de valider qu'une pièce est réellement une salle d'eau
- Manque de clarté sur l'aménagement réel de ces espaces critiques
- Rend difficile l'évaluation de la conformité et de la fonctionnalité du logement

**Comment corriger**
- Les surfaces des pièces sont désormais tracées avant le mobilier : elles ne recouvrent plus les équipements.
- Les sanitaires sont désignés, optimisés puis rendus au-dessus du fond de leur pièce.

---

## Statistiques
- **Observations enregistrées** : 8
- **Seeds analysées** : 1HAP2IB, 0PN9RZJ
- **Dernière mise à jour** : 2026-08-17

---

## Index des corrections en cours de construction
- **Corrigées** : N°2, N°3, N°6, N°8
- **Partiellement corrigées** : N°5, N°7
- **Structurelles à étudier** : N°1, N°4
