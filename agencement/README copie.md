# technohab

> **Dépôt archivé le 18 août 2026.** Le développement se poursuit dans
> `Wonderland/technohab`, versionné avec le dépôt `wonderland`. Le moteur JS
> présent ici (`wonderland-integration/`, `dist/`) est une copie figée au
> 16 août, dépassée : 248 lignes de `generator.js` contre 1132 côté Wonderland,
> sans façades, entrée, portes, cheminement ni solveur de pose. Les fiches
> `docs/agencement/` ont été migrées vers `Wonderland/technohab/agencement/`.
> Le service Python (`g2p_service`, `core_api`, packs `P0`–`P6`) n'a pas été
> migré et reste ici en l'état.

🏗️ Technohab — MVP de génération procédurale d’habitats normés
📌 Présentation générale

Technohab est un projet open-source visant à développer un système de conception assistée d’habitats écologiques, fondé sur :

la formalisation des intentions utilisateur (questionnaire),

la traduction de ces intentions en règles explicites,

la génération procédurale de plans,

et la vérification progressive de leur conformité technique.

Ce dépôt contient le MVP fonctionnel validant la faisabilité complète du pipeline suivant :

Intentions utilisateur → Données structurées → Graphe spatial → Plan généré (image)

Ce MVP n’est pas un simple démonstrateur graphique :
il constitue une preuve d’architecture, montrant qu’un moteur de règles, des algorithmes spatiaux et une interface interactive peuvent cohabiter dans un système extensible.

🎯 Objectifs du MVP

Le MVP a trois objectifs principaux :

1. Valider la chaîne technique complète (end-to-end)

Le MVP démontre qu’il est possible de :

collecter des intentions utilisateur via une interface simple,

les transformer en une structure de données exploitable,

appeler un moteur de génération spatial externe,

récupérer un résultat géométrique,

et l’afficher en temps quasi réel dans une interface web.

👉 Aucune brique n’est simulée : chaque étape est réellement exécutée.

2. Définir une base formelle pour les futures règles de construction

Le MVP introduit volontairement une séparation claire entre :

les données d’entrée (intentions, contraintes),

les règles (actuellement simples, mais explicites),

le moteur de génération,

et les représentations de sortie.

Cette séparation est essentielle pour :

intégrer ultérieurement des normes (RE2020, DTU, Eurocodes),

rendre les règles auditables, modifiables et versionnées,

permettre des raisonnements incrémentaux.

3. Préparer un système éditable en temps réel

Le MVP a été conçu dès le départ pour évoluer vers :

une édition live des règles,

une re-génération partielle du plan,

un retour utilisateur immédiat (feedback visuel et métrique).

Même si ce comportement n’est pas encore implémenté, l’architecture actuelle ne l’empêche pas.

🧠 Architecture générale

Le projet est volontairement structuré en trois services distincts, chacun ayant un rôle précis.

┌──────────────┐
│  Interface   │  (UI utilisateur)
│  (Core API)  │
└──────┬───────┘
       │ JSON structuré
       ▼
┌──────────────┐
│   Wrapper    │  (Adaptateur moteur spatial)
│  Graph2Plan  │
└──────┬───────┘
       │ JSON normalisé
       ▼
┌──────────────┐
│   Django +   │  (Moteur spatial lourd)
│   MATLAB     │
│  Graph2Plan  │
└──────────────┘

🔹 Core API (FastAPI)

Responsabilités :

Interface utilisateur (formulaire web)

Centralisation des entrées utilisateur

Orchestration des appels aux services

Agrégation des résultats

Préfiguration du futur TechnoManager

Le Core ne fait aucun calcul spatial lourd.
Il est conçu comme un cerveau décisionnel, pas comme un moteur.

🔹 Wrapper Graph2Plan (FastAPI)

Responsabilités :

Traduire le format interne Technohab vers le format attendu par Graph2Plan

Appeler le moteur Django/Graph2Plan

Normaliser la réponse

Gérer les previews (image mémoire)

Le wrapper agit comme une couche d’isolation :

le Core n’est pas couplé à MATLAB,

Graph2Plan peut être remplacé plus tard.

🔹 Moteur spatial (Django + Graph2Plan + MATLAB)

Responsabilités :

Génération spatiale réelle des plans

Application d’algorithmes de placement et d’alignement

Production de géométries exploitables

Ce moteur est considéré comme :

coûteux (temps, dépendances),

non interactif,

mais robuste spatialement.

C’est volontairement une “boîte lourde” derrière une API claire.

📥 Données d’entrée (Intentions utilisateur)

Le MVP accepte actuellement des intentions simples, par exemple :

{
  "boundary_area": 60,
  "rooms": [
    {"id": "living", "type": "living", "target_area": 30},
    {"id": "bedroom_1", "type": "bedroom", "target_area": 12},
    {"id": "bath", "type": "bath", "target_area": 6}
  ],
  "edges": [
    {"u": "living", "v": "bedroom_1"},
    {"u": "bedroom_1", "v": "bath"}
  ]
}


Ces données ne sont pas encore normatives, mais elles sont :

structurées,

explicites,

transformables en règles.

🧩 Représentation intermédiaire : le graphe spatial

Le cœur conceptuel du MVP repose sur une idée clé :

Un bâtiment est d’abord un graphe avant d’être une géométrie.

Dans le MVP :

les nœuds représentent des pièces,

les arêtes représentent des relations (adjacence, proximité),

les surfaces deviennent des contraintes quantitatives.

Cette abstraction est fondamentale pour :

intégrer des règles de circulation,

raisonner sur l’accessibilité,

introduire des contraintes normatives futures.

🖼️ Sorties du MVP

Le MVP produit actuellement :

1. Un JSON structuré

liste des pièces,

boîtes spatiales (x0, y0, x1, y1),

types associés.

2. Une image de plan (PNG)

générée automatiquement,

affichée dans l’UI,

issue soit du moteur Graph2Plan,

soit d’un fallback procédural robuste.

👉 Il n’y a jamais d’état “sans image”.

🎨 Pictogrammes de pièces

Chaque type de pièce dispose d’un pictogramme vectoriel affiché au centre de la pièce dans le plan 2D.

- Source de vérité : `assets/icons/*.svg` (13 pictogrammes, `viewBox 0 0 64 64`, tracés en `currentColor`, vectorisés depuis `assets/generated/architectural-pictograms.png` ; les découpes de référence sont dans `assets/generated/icons-source/`).
- Compilation : `python3 scripts/build_icons.py` génère l’API `TechnoHabIcons` dans `wonderland-integration/technohab/assets/icons.js` et dans la build distribuée `dist/technohab/assets/icons.js`.
- Planche de contrôle : ouvrir `assets/icons/preview.html` via un serveur statique.

Le rendu est adaptatif : lorsqu’aucune géométrie de composant n’est fournie, le pictogramme décoratif n’apparaît que si la pièce est assez grande et pivote de 90° selon la forme disponible. Les pièces trop étroites retombent sur le libellé seul.

Ajouter un pictogramme : déposer un SVG dans `assets/icons/`, renseigner `data-technohab-icon`, `data-label`, `data-orient`, `data-rotatable` et `data-room-types` sur la balise `<svg>`, puis relancer le script de compilation.

### Composants orientables

Les pictogrammes peuvent également représenter des composants géométriques utilisés à la fois par le calcul et par le rendu.

- Source de vérité : `assets/components.json` définit les dimensions réelles, le dégagement fonctionnel, le pictogramme et le point d’accès de chaque composant.
- Transformations : `rotation` accepte `0`, `90`, `180` ou `270` degrés ; `flip_x` et `flip_y` couvrent les deux symétries. La version navigateur emploie les propriétés équivalentes `flipX` et `flipY`.
- Géométrie calculée : chaque résultat contient l’empreinte, le polygone de dégagement, la boîte englobante et les points fonctionnels transformés dans le repère du plan.
- Placement automatique : le composant est adossé à une paroi compatible et sa façade d’accès est orientée vers l’intérieur du plan ; les quatre directions sont donc réellement départagées.
- Contrôles : le moteur signale les composants hors de leur pièce, les dégagements insuffisants et les chevauchements.
- Compatibilité : si la requête API ne contient aucun composant, le wrapper en place automatiquement un par pièce compatible après le calcul Graph2Plan. Une requête existante sans champ `components` reste donc valide.

Exemple de composant fourni à l’API :

```json
{
  "id": "bedroom-1:bedroom:1",
  "type": "bedroom",
  "room_id": "bedroom-1",
  "x": 2.4,
  "y": 1.8,
  "width": 1.6,
  "depth": 2.0,
  "rotation": 270,
  "flip_x": true,
  "flip_y": false
}
```

Après une modification du catalogue ou des SVG, reconstruire les modules embarqués puis lancer les tests locaux :

```bash
python3 scripts/build_components.py
python3 scripts/build_icons.py
node --test wonderland-integration/test-generator.mjs
node --test dist/technohab/test-generator.mjs
PYTHONDONTWRITEBYTECODE=1 python3 -m unittest g2p_service.tests.test_component_geometry
```

Les deux points d’entrée chargent ces modules avec un identifiant de version dans l’URL. Une nouvelle version doit modifier cet identifiant afin qu’une ancienne implémentation SVG ne reste pas en cache dans le navigateur.
