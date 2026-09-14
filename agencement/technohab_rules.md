# Règles du moteur TechnoHab

Référentiel unique des règles que le moteur de génération de plans 2D doit
respecter. Deux statuts coexistent dans ce dépôt :

- **Cible (Python, `g2p_service/rules/packs/*.yaml`)** — le référentiel complet
  visé, pensé pour un moteur géométrique riche (Graph2Plan/MATLAB).
- **Implémenté (JS, `assets/rules.js`)** — le sous-ensemble
  réellement évalué par le moteur autonome livré dans Wonderland
  (`Créer → Numérique → Générateur de plans 2D`).

Ce fichier fait foi pour ce que le moteur *doit* garantir. Si le code diverge,
c'est le code qui a tort — sauf mention explicite « hors périmètre V1 ».

**Fiches d'agencement par typologie** ([`docs/agencement/`](docs/agencement/README.md))
— sources métier amont, d'où sont dérivées les règles ci-dessous :
[cuisine](docs/agencement/cuisine.md), [salon](docs/agencement/salon.md),
[salle de bain](docs/agencement/salle-de-bain.md), [WC](docs/agencement/wc.md),
[chambre](docs/agencement/chambre.md), [bureau](docs/agencement/bureau.md),
plus deux fiches transverses — [circulation](docs/agencement/circulation.md)
et [rangements](docs/agencement/rangements.md).

---

## 1. Statut d'implémentation

**Relevé du 16 août 2026.** Le moteur JS est passé de 6 à 16 règles.

| Pack | Thème | Règles Python (cible) | Règles JS (implémenté) |
|---|---|---|---|
| P0 | Intégrité du plan, enveloppe, continuité | 7 | 3 (`TH2D-PROJECT-001`, `TH2D-GRAPH-002`, `TH2D-RESERVE-001`) |
| P1 | Accès, portes, circulation | 11 | 4 (`TH2D-CIRC-001` à `004`) |
| P2 | Programme minimal, fonctions, fusion | 8 | 1 (`TH2D-GRAPH-001`, adjacences demandées) |
| P3 | Surfaces min/max par fonction | 25 | 2 (`TH2D-ROOM-001` minimums, `TH2D-ROOM-002` pièce meublable) |
| P4 | Topologie, hiérarchie, adjacences/séparations | 10 | 0 |
| P5 | Qualité géométrique et formes | 5 | 3 (`TH2D-ROOM-002`, `TH2D-FORME-001`, `TH2D-FORME-002`) |
| P6 | Portes, seuils, logique d'accès | 5 | 0 |
| — | Hors packs Python | — | 3 (`TH2D-SIZING-001`, `TH2D-RANGEMENT-001` à `003`) |
| **Total** | | **71** | **16** |

Trois de ces règles sont **déclarées limitées** : leur exigence est valide,
mais la génération ne sait pas la tenir. Le rapport les sépare des violations
réelles plutôt que de les déclasser — voir ROADMAP §3.1 bis.

`TH2D-ROOM-002` mérite d'être signalée : elle ne repose sur aucune valeur
conventionnelle. Le verdict vient d'un solveur de pose qui tente réellement
de placer les équipements du socle dans le rectangle de la pièce. C'est la
première règle du projet dont le seuil est **calculé et non décrété**.

Le moteur JS n'a pas de notion de portes, de seuils, ni de géométrie de
circulation détaillée (pas de murs, pas d'angles) : son modèle est un
découpage récursif de rectangles (guillotine cuts), pas une géométrie de
plan complète. Une grande partie du référentiel Python (P1, P4, P6, et la
moitié de P0/P5) est donc **structurellement hors de portée** du moteur
actuel, pas seulement « non codée ». Section 4 détaille ce qui est
raisonnablement portable.

---

## 2. Référentiel cible complet (Python, P0–P6)

Résumé par pack ; le détail (id, sélecteur, contrainte, message, stratégie de
fix) vit dans `g2p_service/rules/packs/*.yaml`, chargé par
`g2p_service/wrapper_api/rule_engine/loader.py` et évalué par `evaluator.py`.

### P0 — Intégrité du plan (HARD)
Un plan = une seule enveloppe extérieure, aucun bloc isolé, aucun vide
interne, couverture complète de la surface intérieure, aucune surface
résiduelle inexploitable, pièces continues (pas de fragments), toute pièce
reliée à la composante principale du graphe.

### P1 — Accès, portes, circulation
Au moins une entrée sur façade (HARD), largeur mini 0,9 m (HARD), chaque
pièce reliée à une circulation (HARD), toutes les portes incidentes à une
circulation (HARD), circulation reliée à l'entrée principale (HARD),
circulation seule autorisée à se superposer à une autre pièce (HARD),
largeur mini circulation 1,0 m (HARD) ; en GUIDELINE/PREFERENCE : ratio
surface circulation ≤ 10 % du total, corridors longs non desservants
pénalisés, changements de direction et croisements inutiles minimisés.

### P2 — Programme minimal, fonctions, fusion
Chaque pièce a une fonction explicite unique (HARD), aucune pièce orpheline
(HARD, atteignable depuis `main_entry_node`), au moins un espace de vie
principal — salon ou chambre (HARD), sanitaires obligatoires — sdb + wc
(HARD), entrée obligatoire hors studio (HARD) ; pour un studio : sas
possible (≥0,5 m²) ou entrée (≥1 m²) en GUIDELINE, fusion de fonctions
interdite sauf studio <20 m² & 0 chambre (HARD), règles minimales de
présence spécifiques au studio <20 m² (HARD, ≥2 pièces au total).

### P3 — Surfaces min/max par fonction
Bornes par fonction (min = HARD, max = GUIDELINE indicatif) :

| Fonction | Min (m²) | Max indicatif (m²) |
|---|---|---|
| Cuisine | 4,5 (calculé, cf. fiche cuisine §5.1) | 20 |
| Salle de bain | 3 | 15 |
| WC | 1,5 | 3 |
| Chambre enfant | 9 | 12 |
| Chambre parentale | 12 | 20 |
| Salon | 8 | 75 |
| Entrée | 1 | 12 |
| Bureau | 9 | 25 |
| Buanderie | 6 | 18 |
| Local technique | 6 | 15 |
| Garage | 15 | 35 |
| Circulation | — | pas de limite (contrainte de ratio globale en P1.8) |
| Cellier | — | optionnel, pas de bornes |
| Extérieur | — | bornes non spécifiées |

### P4 — Topologie fonctionnelle, hiérarchie, adjacences/séparations
Cuisine toujours connectée au salon (HARD), séparation cuisine/salle à
manger si cuisine non ouverte (HARD), hiérarchie de connexions
porte > ouverture > circulation (GUIDELINE), pièces privées/semi-privées
jamais en lieu de passage (HARD), circulation ne traverse jamais sdb/wc
(HARD), classes de pièces déclarées — publiques / semi-privées / privées /
techniques (HARD), pièces techniques non visibles depuis l'entrée
(GUIDELINE), fonctions bruyantes éloignées des calmes (PREFERENCE),
fonctions humides regroupées (PREFERENCE), adjacence WC ↔ séjour interdite
(HARD).

### P5 — Qualité géométrique
Ratio longueur/largeur ≥ 0,5 pour toute pièce habitable (HARD, sauf local
technique/garage/extérieur), formes extrêmement étroites/allongées
interdites hors local technique (HARD), angles aigus proscrits dans les
espaces de vie (GUIDELINE), pièces continues — pas de fragments (HARD),
circulation de forme rectangulaire (HARD, score de rectangularité ≥ 0,95).

### P6 — Portes, seuils, logique d'accès
Chaque pièce a au moins un point d'accès clair (HARD), seuils posés sur des
parois pertinentes (GUIDELINE), aucune collision d'ouvrants de portes
(HARD), une chambre (enfant ou parentale) n'est jamais accessible
directement depuis l'extérieur (HARD, x2).

---

## 3. Référentiel implémenté (JS, moteur Wonderland)

Source : `assets/rules.js`. Six règles, évaluées à
chaque génération, avec niveaux `HARD` / `GUIDELINE`.

| id | Niveau | Contrôle |
|---|---|---|
| `TH2D-PROJECT-001` | HARD | Surface totale ≥ somme des surfaces minimales du programme |
| `TH2D-ROOM-001` | HARD | Chaque pièce ≥ sa surface minimale (`minArea`, table `DEFINITIONS` de `generator.js`) |
| `TH2D-GRAPH-001` | HARD | Chaque adjacence demandée (`desiredEdges`, construite depuis les options du formulaire) est effectivement obtenue dans la géométrie |
| `TH2D-GRAPH-002` | HARD | Toute pièce est reliée au séjour (BFS depuis `"living"` sur le graphe de contact réel) |
| `TH2D-ROOM-002` | HARD | Le rectangle utile reçoit les équipements obligatoires et leurs dégagements selon le socle d'agencement. Remplace l'ancien ratio d'aspect empirique. |
| `TH2D-SIZING-001` | GUIDELINE | Séjour ≥ 24 m² |

Le rapport (`evaluatePlan`) renvoie `profile`, `evaluatedRules`,
`skippedRules` et une liste de violations `{ruleId, level, label, entityId,
message}`, déjà affichée sur `#rules-list` dans `index.html`.

Types d'espaces gérés par le générateur (`generator.js::DEFINITIONS`) :
`living` (séjour), `bedroom` (chambre), `bath` (salle d'eau), `wc`,
`kitchen` (cuisine), `circulation`. Six types seulement — pas de bureau,
buanderie, local technique, garage, cellier (présents côté Python P3 mais
absents du moteur JS).

---

## 4. Portable vers le moteur JS (backlog de fiabilisation, par ordre de valeur/coût)

Ce qui suit est raisonnablement implémentable sans réécrire le moteur en
géométrie de murs — le moteur JS raisonne déjà en graphe de contact réel
(`actualEdges`) et en boîtes rectangulaires :

1. **Bornes max de surface (P3)** — `TH2D-ROOM-001` ne vérifie que le
   minimum ; ajouter le contrôle max (GUIDELINE) par fonction est trivial,
   la table existe déjà.
2. **Adjacence interdite WC ↔ séjour (P4.010)** — même mécanique que
   `TH2D-GRAPH-001` mais en négatif ; facile à ajouter comme
   `forbiddenEdges`.
3. **Regroupement des fonctions humides / éloignement bruyant-calme (P4.008,
   P4.009)** — calculable en PREFERENCE à partir des centroïdes de boîtes,
   déjà utilisé par `scoreCandidate`.
4. **Angles aigus / rectangularité (P5)** — non pertinent tel quel : le
   découpage guillotine ne produit que des rectangles axés, donc ces règles
   sont automatiquement satisfaites par construction. À documenter comme
   "garanti par construction", pas à coder.
5. **Portes, seuils, largeurs de passage (P1, P6)** — hors périmètre tant
   que le moteur ne modélise pas de géométrie de murs/ouvertures ; nécessite
   une évolution structurelle, pas un ajout de règle.
6. **Studio et fusion de fonctions (P2.006-008)** — le moteur n'a pas de
   notion de fusion de pièces ; `Studio` (bedrooms=0) existe déjà côté
   formulaire mais aucune règle ne vérifie les cas spécifiques.

---

## 5. Où vit quoi

- `g2p_service/rules/packs/*.yaml` — référentiel cible complet (P0–P6),
  chargé par `g2p_service/wrapper_api/rule_engine/loader.py`.
- `g2p_service/wrapper_api/rule_engine/evaluator.py` — évaluateur Python ;
  seuls 10 des ~24 `kind` du YAML y sont réellement implémentés (cf. audit
  du 2026-08-15, section « rule_engine incomplet »).
- `assets/rules.js` — moteur de règles JS autonome,
  seul moteur réellement déployé et exécuté par les utilisateurs.
- `assets/generator.js` — génération géométrique
  (découpage guillotine, 96 tirages, scoring) sur laquelle `rules.js`
  s'applique.

Ce document doit être mis à jour à chaque ajout/retrait de règle dans l'un
ou l'autre moteur.
