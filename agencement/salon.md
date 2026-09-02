# Agencement — Salon / séjour

> **Superseded le 26 août 2026 par [`../profils/sejour.md`](../profils/sejour.md)**,
> écrit au [`GABARIT_PIECE.md`](../GABARIT_PIECE.md). Cette fiche reste la
> **source** de ses valeurs marquées `[S]` ; le profil fait foi sur la
> conception, les classes, les enveloppes et les règles.

> **Migrée le 18 août 2026 depuis le dépôt de développement `technohab`, désormais archivé.**
> Les valeurs sourcées de cette fiche (§ « valeurs de référence » et dimensionnements
> dérivés) restent valides. En revanche **toute confrontation au moteur qu'elle contient
> est périmée** : elle visait `assets/components.json`, les packs Python `P0`–`P6` et une
> copie figée de `generator.js`, tous archivés. L'état réel est porté par
> [`../assets/socle.data.js`](../assets/socle.data.js) et
> [`../VEILLE_NORMATIVE.md`](../VEILLE_NORMATIVE.md) ; les verdicts corrigés sont
> consolidés dans [README.md](README.md).


Fiche support par typologie de pièce, jumelle de [cuisine.md](cuisine.md).
Elle sert de **source de vérité métier** pour les règles d'agencement du
séjour, en amont du référentiel moteur
([technohab_rules.md](../SOCLE_AGENCEMENT.md)) et du catalogue de composants
([assets/components.json](../assets/socle.data.js)).

- **Statut** : v1, rédigée le 17 août 2026.
- **Portée** : proportions du mobilier, distances de circulation, zone de
  conversation, coin repas associé, éclairage, configurations de pièce.
- **Sources** :
  - `[S1]` Ootravaux, *Les règles à connaître pour bien aménager votre salon*
    (mis à jour le 15 avril 2026).
  - `[S2]` Potiron Paris, *Aménager un salon-salle à manger, l'art des
    proportions justes*.
- **Marqueurs** : `[S1]` / `[S2]` valeur issue de la source correspondante,
  `[D]` dérivée par calcul, `[H]` hypothèse projet à valider.

> **Niveau de confiance.** Contrairement à la fiche cuisine, adossée à un
> guide technique d'éditeur CAO, les deux sources sont **éditoriales et
> commerciales** (conseil déco, vente de mobilier). Les valeurs relèvent de
> l'usage professionnel courant, non d'une norme. Elles sont exploitables en
> `GUIDELINE`, mais aucune ne devrait fonder une règle `HARD` sans
> recoupement normatif.

---

## 1. Valeurs de référence

| # | Grandeur | Mini | Recommandé | Marq. |
|---|---|---|---|---|
| L1 | Passage entre deux éléments de mobilier | 0,70 m | 1,00 m | `[S2]` |
| L2 | Espacement canapé / rangement / table basse | 0,60 m | 0,80 m | `[S1]` |
| L3 | Distance entre deux assises en vis-à-vis | 1,00 m | ≤ 3,00 m | `[S2]` |
| L4 | Table basse ↔ canapé et fauteuils | 0,50 m | 0,50 m | `[S2]` |
| L5 | Écart de hauteur assise / table basse | 0 | assise −0,05 m | `[S2]` |
| L6 | Emprise au sol du mobilier / surface de la pièce | — | ≤ 50 % | `[S2]` |
| L7 | Seuil petit / grand salon | 15 m² | — | `[S1]` |
| L8 | Seuil de zonage multi-fonctions (salon + repas + bureau) | 30 m² | — | `[S2]` |

**Conflit L1 / L2 arbitré `[D]`** : les deux sources ne mesurent pas la même
chose. Les 0,60 m de `[S1]` valent pour un **espacement entre meubles** que
l'on contourne (canapé ↔ table basse) ; les 0,70 m de `[S2]` valent pour un
**passage traversant**. Retenu : **0,70 m dès qu'une circulation traverse,
0,60 m sinon, 1,00 m recommandé**. C'est la valeur haute qui prime en cas de
doute — un passage sous-dimensionné est le défaut le plus signalé par `[S1]`
dans les six configurations du §4.

### Coin repas associé (salon–salle à manger)

| # | Grandeur | Valeur | Marq. |
|---|---|---|---|
| R1 | Largeur de table par convive | 0,60 m | `[S2]` |
| R2 | Recul derrière un tabouret ou un banc | 0,45 m | `[S2]` |
| R3 | Recul derrière une chaise (s'asseoir / se lever) | 1,20 m | `[S2]` |
| R4 | Recul pour circuler derrière une chaise occupée | 1,50 m | `[S2]` |

### Composition murale

Pour un canapé de 1,70 m : cadre ou miroir de largeur ≤ **2/3** de l'assise
(soit 1,13 m), et **0,25 m** libres au-dessus du dossier `[S2]`. Règle de
composition visuelle, sans effet sur le plan 2D — consignée pour mémoire.

---

## 2. Dimensionnement de la pièce

### 2.1 Coin salon minimal

Le composant `living` du catalogue vaut 2,40 × 1,60 m (canapé + table basse),
avec 0,40 m de dégagement frontal. En lui appliquant le passage L1 :

**2,40 × (1,60 + 0,70) = 5,52 m²** `[D]` d'emprise, soit **2,30 m** de
profondeur libre minimale pour le coin salon.

Si l'on ajoute un fauteuil en vis-à-vis (zone de conversation L3) :
0,90 (canapé) + 0,50 (L4) + 0,60 (table basse) + 0,50 (L4) + 0,90 (fauteuil)
= **3,40 m de profondeur** `[D]`, hors passage.

### 2.2 La contrainte qui mord réellement : la règle des 50 %

L6 est la contrainte dimensionnante, plus que l'emprise brute : le mobilier ne
doit pas occuper plus de la moitié de la pièce. Un coin salon de 5,52 m²
appelle donc **≥ 11 m² de séjour** `[D]` — au-delà du minimum P3 actuel
(8 m²), et cohérent avec le seuil de 15 m² de `[S1]`.

### 2.3 Coin repas

Table du catalogue 1,80 × 1,00 m, quatre côtés desservis avec le recul R3 :
**(1,80 + 2×1,20) × (1,00 + 2×1,20) = 4,20 × 3,40 = 14,28 m²** `[D]`.

Avec deux côtés seulement contre mur : (1,80 + 1,20) × (1,00 + 2×1,20) =
**10,20 m²** `[D]`.

### 2.4 Confrontation aux seuils du moteur

| Référentiel | Valeur séjour | Verdict |
|---|---|---|
| Python P3 | min 8 m² (HARD), max 75 m² | **bas** : ne garantit pas la règle des 50 % (11 m² `[D]`) |
| JS `DEFINITIONS.living.minArea` ([generator.js:5](../assets/generator.js)) | 20 m² | confortable ; supporte le zonage à partir de 30 m² `[S2]` |
| JS `TH2D-SIZING-001` ([rules.js:72](../assets/rules.js)) | 24 m² (GUIDELINE) | sans source ; à raccrocher au seuil de 30 m² de `[S2]` ou à documenter |
| Composant `living` | dégagement frontal 0,40 m | **sous** les 0,70 m de passage `[S2]` — même distinction service / passage qu'en cuisine |
| Composant `dining` | dégagement 0,50 m sur les 4 côtés | **très sous** les 1,20 m nécessaires pour s'asseoir `[S2]` — écart majeur |

Trois seuils coexistent pour le séjour (8 / 20 / 24 m²), aucun n'étant dérivé
d'une donnée d'agencement. Voir §5.

---

## 3. Principes qualitatifs (non métrables en 2D)

Consignés pour la documentation métier ; hors de portée d'un moteur qui
raisonne en rectangles.

- **Point focal** : orienter les assises vers un élément unique — cheminée,
  fenêtre, télévision, œuvre murale. Structure la pièce et évite l'effet
  « une salle, deux ambiances » `[S1]`.
- **Convivialité** : assises en vis-à-vis ou en angle autour de la table
  basse ; aucun siège isolé ni dos à la pièce `[S1]`.
- **Rangements** : meubles bas dos au mur pour libérer le sol ; étagères
  hautes et fines, ou en angle, dans les petits volumes ; volumes hauts
  (bibliothèque, buffet) utilisés comme **séparateurs de zones** dans les
  grands `[S1]`.
- **Éclairage en trois couches** `[S1]` : général (plafonnier, spots,
  suspension) + appoint localisé (coin lecture, mise en valeur) + indirect
  (appliques, bandes LED). Le seul point à effet potentiel sur le plan :
  ne pas obstruer les fenêtres par du mobilier haut — une bibliothèque trop
  proche d'une ouverture crée une zone d'ombre `[S1]`.

---

## 4. Configurations de pièce

Synthèse de la table de `[S1]`, réduite à ce qui a une traduction géométrique.

| Configuration | Principe | Défaut à détecter |
|---|---|---|
| En L | Exploiter l'angle pour deux zones distinctes, liées visuellement | Passage entre les deux zones bloqué |
| En longueur | Zoner pour casser l'effet couloir ; meuble transversal (buffet) comme rupture | Mobilier aligné dans la longueur, qui renforce l'effet couloir |
| En carré | Symétrie autour d'un point focal ; meubles contre les murs | Volumes lourds concentrés d'un seul côté (déséquilibre) |
| En rond | Organisation concentrique, formes arrondies | Meuble anguleux ; circulation entravée |
| Petit (< 15 m²) | Mobilier compact, modulable, multifonction ; jouer la hauteur | Encombrement au sol, circulation bloquée |
| Grand (> 15 m²) | Zones distinctes + éléments de transition (tapis, mobilier) | Charge concentrée d'un côté ; espace trop vide |

L'**effet couloir** et le **déséquilibre latéral** sont les deux défauts
réellement calculables sur une boîte rectangulaire — voir `TH2D-SALON-003` et
`004` ci-dessous.

---

## 5. Traduction en règles moteur

| id proposé | Niveau | Énoncé | Faisabilité moteur JS |
|---|---|---|---|
| `TH2D-SALON-001` | HARD | Le rectangle du séjour accepte le mobilier de base 2,40 × 1,60 m avec 0,70 m de passage (profondeur libre ≥ 2,30 m) | **Oui** — extension du solveur de pose de `TH2D-ROOM-002` |
| `TH2D-SALON-002` | GUIDELINE | Emprise du mobilier ≤ 50 % de la surface de la pièce | **Oui** — rapport de deux surfaces déjà connues |
| `TH2D-SALON-003` | GUIDELINE | Pas d'effet couloir : ratio longueur/largeur ≤ 2,5 pour un séjour `[H]` | **Oui** — P5 calcule déjà un ratio d'aspect ; le seuil reste à fonder |
| `TH2D-SALON-004` | PREFERENCE | Équilibre latéral : mobilier non concentré sur une moitié de la pièce | **Partiellement** — calculable sur centroïdes, mais sans objet tant que le séjour est mono-composant |
| `TH2D-SALON-005` | GUIDELINE | Séjour ≥ 30 m² si le programme y loge plusieurs fonctions (repas, bureau) | **Oui** — remplacerait le 24 m² non sourcé de `TH2D-SIZING-001` |
| `TH2D-REPAS-001` | HARD | Recul de 1,20 m autour des côtés desservis de la table | **Oui** via le catalogue — mais suppose de corriger `dining.clearance` (0,50 m aujourd'hui) |
| `TH2D-SALON-006` | — | Point focal, convivialité, éclairage, rangements (§3) | **Hors périmètre** — non métrable dans le modèle actuel |

Lot portable à court terme : `001`, `002`, `005`. `003` attend un seuil
fondé ; `004` attend l'éclatement du mobilier en composants distincts (même
prérequis que le triangle d'activité en cuisine).

---

## 6. Écarts relevés, non arbitrés

Aucune modification appliquée au code ou aux packs à ce stade.

1. **Trois seuils de surface séjour non réconciliés** — 8 m² (P3 HARD),
   20 m² (allocation JS), 24 m² (`TH2D-SIZING-001`, sans source). Les données
   ci-dessus donnent deux ancrages exploitables : **11 m²** `[D]` (règle des
   50 % appliquée au coin salon) et **30 m²** `[S2]` (seuil de zonage
   multi-fonctions).
2. **`dining.clearance` à 0,50 m** — insuffisant pour s'asseoir (1,20 m requis
   `[S2]`). C'est un écart de nature différente de celui de la cuisine :
   ici la valeur du catalogue est **fausse au regard de l'usage**, pas
   seulement d'une autre notion. Correction attendue quel que soit le sort du
   champ `passage`.
3. **`living.clearance.front` à 0,40 m** — même distinction service / passage
   qu'en cuisine (cf. [cuisine.md §5.2](cuisine.md)) ; à traiter avec le champ
   `passage`.
4. **Ratio anti-couloir (2,5)** — proposé `[H]`, sans source. `[S1]` décrit
   l'effet couloir qualitativement mais ne le chiffre pas.
5. **Séjour mono-composant** — `TH2D-SALON-004` et toute règle d'orientation
   (point focal, vis-à-vis) supposent d'éclater `living` en `canapé`,
   `fauteuil`, `table basse`, `meuble TV`. Même prérequis structurel que la
   cuisine, même arbitrage à rendre : modèle multi-composant généralisé ou cas
   particuliers.

---

## 7. Apports de la source `[S3]` (17 août 2026)

Compilation transmise le 17 août 2026 (fiabilité 3, cf.
[README.md](README.md)).

### 7.1 Valeurs nouvelles

| # | Grandeur | Valeur | Marq. |
|---|---|---|---|
| T1 | Distance œil ↔ télévision | 1,5 à 2,5 × la diagonale de l'écran | `[S3]` |
| T2 | Hauteur de l'écran | tiers supérieur à hauteur d'œil assis | `[S3]` |
| T3 | Suspension au-dessus de la table à manger | 0,75–0,80 m du plateau | `[S3]` |

T1 est la première valeur du corpus qui **dépend d'un équipement de
l'occupant** et non du bâti : elle ne peut pas devenir une règle de plan, mais
elle donne un ordre de grandeur — un écran de 140 cm de diagonale appelle
2,10 à 3,50 m de recul `[D]`, ce qui recoupe la zone de conversation L3.

### 7.2 Conflits avec `[S1]` / `[S2]`

| Grandeur | `[S1]` / `[S2]` | `[S3]` | Traitement |
|---|---|---|---|
| Table basse ↔ canapé | 0,50 m `[S2]` | 0,40–0,45 m | **Plage retenue : 0,40–0,50 m.** Le `[S3]` justifie par le passage des jambes, `[S2]` par le confort de préhension — deux critères, deux bornes |
| Circulation dans le séjour | 0,70 min / 1,00 rec `[S2]`, 0,60–0,80 `[S1]` | 0,90 sur les grands axes | **Cohérent une fois hiérarchisé** : 0,60 contournement, 0,90 axe principal, cf. [circulation.md §3](circulation.md) |
| Recul derrière une chaise (repas) | 1,20 m `[S2]` | **0,60 m** pour s'asseoir | **Conflit franc** — voir ci-dessous |
| Circuler derrière une personne assise | 1,50 m `[S2]` | 0,90–1,20 m | **Conflit** — même origine |

**Le conflit sur le coin repas est le plus sérieux du corpus** : un facteur 2
sur le recul d'assise. Lecture la plus probable `[D]` — `[S3]` mesure le recul
**depuis le bord de la chaise** (le siège est déjà sous la table), `[S2]`
mesure **depuis le bord de la table** (chaise comprise, environ 0,50 m de
profondeur). Les deux se rejoignent alors autour de 1,10–1,20 m depuis la
table. Cette lecture reste une hypothèse : aucune des deux sources ne précise
son point de mesure.

Effet sur le §2.3 : l'emprise du coin repas passe de 14,28 m² `[D]` (recul
1,20 m sur quatre côtés) à **10,08 m²** `[D]` avec les 0,90 m de `[S3]`. La
fourchette 10–14 m² est à retenir en l'état, sans trancher.

### 7.3 Effet sur les écarts du §6

Aucun arbitrage n'ayant été rendu sur cette fiche, les cinq écarts restent
ouverts. L'écart 2 (`dining.clearance` à 0,50 m) se trouve **confirmé et
aggravé** : même avec la lecture la plus permissive (`[S3]`, 0,60 m), la
valeur du catalogue reste insuffisante.

---

## 8. Fichiers liés

- [cuisine.md](cuisine.md) — fiche jumelle, même structure.
- [technohab_rules.md](../SOCLE_AGENCEMENT.md) — référentiel moteur.
- [assets/components.json](../assets/socle.data.js) — composants `living`
  et `dining`.
- [wonderland-integration/technohab/assets/generator.js](../assets/generator.js)
  — `DEFINITIONS.living`.
- [wonderland-integration/technohab/assets/rules.js](../assets/rules.js)
  — `TH2D-SIZING-001`.
- [g2p_service/rules/packs/P4_topologie_usage_hierarchie.yaml](../SOCLE_AGENCEMENT.md)
  — adjacences séjour ↔ cuisine / salle à manger.
