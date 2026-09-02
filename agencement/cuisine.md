# Agencement — Cuisine

> **Superseded le 26 août 2026 par [`../profils/cuisine.md`](../profils/cuisine.md)**,
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


Fiche support par typologie de pièce. Elle sert de **source de vérité
métier** pour les règles d'agencement de la cuisine, en amont du référentiel
moteur ([technohab_rules.md](../SOCLE_AGENCEMENT.md)) et du catalogue de
composants ([assets/components.json](../assets/socle.data.js)).

- **Statut** : v1, rédigée le 17 août 2026.
- **Portée** : dimensionnement de la pièce, dégagements, ergonomie du plan de
  travail, implantations types, réseaux.
- **Source principale** : ACCA / Biblus, *Comment concevoir une cuisine —
  guide technique*
  <https://biblus.accasoftware.com/fr/comment-concevoir-une-cuisine-guide-technique/>
  (consulté le 17 août 2026).
- **Convention de traçabilité** : chaque valeur porte un marqueur —
  `[S]` issue de la source, `[D]` dérivée par calcul depuis des valeurs `[S]`,
  `[H]` hypothèse projet à valider (aucune source, à trancher avant codage).

Les autres typologies (chambre, salle de bain, WC, séjour, entrée…) feront
l'objet d'une fiche jumelle dans ce même dossier.

---

## 1. Valeurs de référence (mobilier et plan de travail)

| # | Grandeur | Mini | Recommandé | Marq. |
|---|---|---|---|---|
| C1 | Profondeur du plan de travail | 0,60 m | 0,65 m | `[S]` |
| C2 | Hauteur sol → plan de travail | 0,85 m | 0,90 m | `[S]` |
| C3 | Hauteur libre plan de travail → meubles hauts | 0,50 m | 0,55 m | `[S]` |
| C4 | Profondeur des meubles hauts | 0,35 m | 0,35 m | `[S]` |
| C5 | Hauteur plan de cuisson → hotte | 0,65 m | 0,65 m | `[S]` (obligatoire) |
| C6 | Retrait réfrigérateur / mur (ventilation) | 0,05 m | 0,20 m | `[S]` |
| C7 | Passage libre pour circuler (ex. table ↔ mur) | 1,20 m | 1,20 m | `[S]` |
| C8 | Somme des trois côtés du triangle d'activité | — | ≤ 6,50 m | `[S]` |

Le **triangle d'activité** relie les trois pôles évier / cuisson /
réfrigérateur. La source ne borne que la somme des trois côtés (6,50 m) ;
aucune borne basse par côté n'est donnée — la borne basse pratique est
imposée par l'encombrement des appareils eux-mêmes `[H]`.

### Zones fonctionnelles

Séquence d'usage à respecter le long du linéaire : **stockage (frigo) →
lavage (évier) → préparation (plan libre) → cuisson → dépose**. Le segment de
préparation est le seul plan de travail réellement libre ; il se place entre
évier et cuisson.

---

## 2. Dimensionnement de la pièce par implantation

Valeurs `[D]` obtenues en composant C1 (profondeur 0,65 m) et C7 (passage
1,20 m). Elles ne figurent pas telles quelles dans la source : ce sont les
largeurs de pièce qu'imposent mécaniquement les dégagements ci-dessus.

| Implantation | Largeur mini de pièce | Calcul | Marq. |
|---|---|---|---|
| Linéaire (1 mur) | 1,85 m | 0,65 + 1,20 | `[D]` |
| En angle / en L (2 murs adjacents) | 1,85 m par côté | idem | `[D]` |
| Parallèle (2 murs opposés) | 2,50 m | 0,65 + 1,20 + 0,65 | `[D]` |
| En C / en U (3 côtés) | 2,50 m | idem, + retour en fond | `[D]` |
| Avec îlot | 0,65 + 1,20 + îlot + 1,20 + 0,65 | dégagement des deux côtés | `[D]` |
| Avec péninsule | 2,50 m + longueur de péninsule | `[D]` |

Les six implantations reconnues par la source sont : linéaire, parallèle,
en C, avec îlot, avec péninsule, en angle `[S]`.

**Longueur minimale de linéaire** : le composant `kitchen` du catalogue vaut
2,40 m de large × 0,65 m de profondeur, avec 0,75 m de dégagement frontal.
Cette valeur de 2,40 m se dérive de la séquence d'usage : **4 × 0,60 m**, un
module par zone fonctionnelle (stockage, lavage, préparation, cuisson) `[D]`
— voir §5.3.

### Conséquence directe sur la surface minimale

Emprise du seul linéaire de base, dégagement compris :
**2,40 × (0,65 + 1,20) = 4,44 m²** `[D]`, soit **1,85 m** de largeur libre.

À confronter aux seuils actuels du moteur :

| Référentiel | Surface mini cuisine | Verdict |
|---|---|---|
| Python P3 ([P3_surfaces_minmax.yaml](../SOCLE_AGENCEMENT.md)) | 4,5 m² (HARD) | aligné sur l'emprise calculée — relevé depuis 3 m², cf. §5.1 |
| JS `DEFINITIONS.kitchen.minArea` ([generator.js:9](../assets/generator.js)) | 7 m² | cible d'allocation, volontairement plus stricte que la règle |
| Catalogue `components.json` | dégagement frontal 0,75 m | zone de service, distincte du passage 1,20 m — cf. §5.2 |

Arbitrages détaillés en §5.

---

## 3. Réseaux techniques (hauteurs depuis le sol)

| Réseau | Point | Hauteur / longueur | Marq. |
|---|---|---|---|
| Électricité | Prises appareils puissants | 0,30 m | `[S]` |
| Électricité | Prises complémentaires, interrupteurs | 1,10 m | `[S]` |
| Plomberie | Arrivées eau chaude / froide | 0,45 m | `[S]` |
| Plomberie | Évacuation | 0,30 m | `[S]` |
| Gaz | Raccordement | 0,45 m | `[S]` |
| Gaz | Flexible caoutchouc | ≤ 1,50 m | `[S]` |
| Gaz | Tube acier | ≤ 2,00 m | `[S]` |
| Gaz | Cuivre rigide | sans limitation | `[S]` |

Ces valeurs sont **hors périmètre du moteur 2D** (dimension verticale, non
modélisée). Elles sont consignées ici pour la documentation métier et pour un
éventuel export vers un modèle 3D / BIM.

---

## 4. Traduction en règles moteur

Identifiants proposés, non encore codés. Le préfixe suit la nomenclature
existante (`TH2D-<THÈME>-<NNN>`).

| id proposé | Niveau | Énoncé | Faisabilité moteur JS |
|---|---|---|---|
| `TH2D-CUIS-001` | HARD | Le rectangle de la cuisine accepte un linéaire de 2,40 × 0,65 m avec 1,20 m de dégagement frontal | **Oui** — étend le solveur de pose de `TH2D-ROOM-002` |
| `TH2D-CUIS-002` | HARD | Largeur libre de la pièce ≥ 1,85 m (linéaire) ou ≥ 2,50 m (implantation double) | **Oui** — test sur la boîte rectangulaire |
| `TH2D-CUIS-003` | GUIDELINE | Somme des trois côtés du triangle évier/cuisson/frigo ≤ 6,50 m | **Non en l'état** — suppose des pôles équipements individualisés, aujourd'hui agrégés dans un composant unique |
| `TH2D-CUIS-004` | GUIDELINE | Surface cuisine ∈ [7 ; 20] m² | **Oui** — borne max P3 déjà listée au backlog (technohab_rules.md §4.1) |
| `TH2D-CUIS-005` | GUIDELINE | Ordre des zones frigo → évier → préparation → cuisson respecté le long du linéaire | **Non** — même prérequis que `TH2D-CUIS-003` |
| `TH2D-CUIS-006` | HARD | Cuisine connectée au séjour | **Déjà couvert** par `TH2D-GRAPH-001` / P4 |
| `TH2D-CUIS-007` | — | Hauteurs de réseaux (§3) | **Hors périmètre** — pas de dimension verticale |

`TH2D-CUIS-001/002/004` sont le lot réellement portable à court terme : ils ne
demandent que des tests sur le rectangle de pièce et le composant du
catalogue, briques déjà présentes.

---

## 5. Écarts arbitrés (17 août 2026)

> **Complété par [normes.md §3.3](../VEILLE_NORMATIVE.md).** En logement accessible,
> l'arrêté du 24 décembre 2015 (art. 13) impose **1,50 m de passage entre
> appareils**, portant la largeur de pièce à 2,15 m et la surface minimale à
> **5,2 m²**. Les arbitrages ci-dessous restent ceux du socle confort.

### 5.1 Surface minimale de la cuisine — **tranché : 4,5 m² en HARD**

Le seuil HARD n'est pas décrété, il est **calculé** : c'est l'emprise du
linéaire de base avec son passage, 2,40 × 1,85 = 4,44 m², arrondi à
**4,5 m²**. Même logique que `TH2D-ROOM-002`, dont le verdict vient d'un
solveur de pose et non d'une valeur conventionnelle.

- `TH_P3_001_AREA_MIN_KITCHEN` : 3 m² → **4,5 m² (HARD)**. Les 3 m² d'origine
  ne pouvaient loger aucun linéaire conforme.
- Le confort réel reste au-dessus : **7 m² conservés en GUIDELINE**
  (`TH2D-CUIS-004`), valeur déjà portée par le moteur JS.
- Le `minArea: 7` du moteur JS n'est **pas** aligné à 4,5 m² : c'est une
  **cible d'allocation** de surface, plus stricte que la règle de validité, et
  elle pilote la génération. La toucher dégraderait les plans produits sans
  gain de conformité. Divergence assumée et documentée, pas une dette.

### 5.2 Dégagement frontal vs passage — **tranché : deux notions distinctes, non additives**

Les 0,75 m du catalogue et les 1,20 m de la source ne mesurent pas la même
chose et l'écart n'est pas une erreur :

- `clearance.front = 0,75 m` — **zone de service** : ouverture de porte de
  four, de tiroir, position accroupie devant un caisson bas. C'est une
  contrainte de **pose du composant** ; elle reste à 0,75 m.
- `passage = 1,20 m` — **circulation** : largeur pour qu'une personne
  transite. C'est une contrainte de **dimensionnement de la pièce**, portée
  par `TH2D-CUIS-002`.

Les deux se superposent au même endroit du sol : le passage **englobe** la
zone de service, il ne s'y ajoute pas. La largeur de pièce retenue est donc
`max(0,65 + 0,75 ; 0,65 + 1,20) = 1,85 m`, jamais leur somme.

**Conséquence à coder** : ajouter un champ `passage` (optionnel, défaut 0)
distinct de `clearance` dans [components.json](../assets/socle.data.js)
et [schemas.py](../SOCLE_AGENCEMENT.md) — voir §5.4.

### 5.3 Longueur minimale de linéaire (2,40 m) — **tranché : conservée, désormais dérivée**

Ce n'était pas une convention arbitraire : 2,40 m = **4 × 0,60 m**, soit un
module standard par zone fonctionnelle de la séquence d'usage — stockage,
lavage, préparation, cuisson. La séquence étant `[S]`, la longueur devient
`[D]` et non plus `[H]`. Valeur inchangée, justification acquise.

### 5.4 Reste ouvert (hors périmètre de cet arbitrage)

- **Champ `passage`** — décision prise en §5.2, implémentation à faire
  (catalogue, schéma Pydantic, exposition dans `component_geometry`).
- **Dégagement autour d'un îlot** — non fourni par la source ; retenu à
  1,20 m par cohérence avec C7 `[H]`, à confirmer.
- **Pôles équipements individualisés** — le triangle d'activité et l'ordre
  des zones (§4, règles 003 et 005) restent inaccessibles tant que la cuisine
  est un composant monolithique. Prérequis commun : éclater `kitchen` en
  `sink`, `cooktop`, `fridge` dans le catalogue.

---

## 6. Apports de la source `[S3]` (17 août 2026)

Compilation transmise le 17 août 2026 (fiabilité 3, cf.
[README.md](README.md)). Elle recoupe la source ACCA sur six valeurs.

| Grandeur | ACCA `[S]` | Compilation `[S3]` | Traitement |
|---|---|---|---|
| Hauteur du plan de travail | 0,85 min / 0,90 rec | 0,85–0,95 | **Compatible** — `[S3]` élargit la plage haute |
| Hauteur de crédence (plan ↔ meubles hauts) | 0,50 min / 0,55 rec | 0,60 | **Conflit** — `[S3]` plus exigeante ; ACCA fait foi (fiabilité 1), 0,60 noté comme confort |
| Hotte au-dessus des plaques | 0,65 (obligatoire) | 0,65 vitrocéramique / **0,75 gaz** | **`[S3]` plus riche** — la distinction gaz relève de la sécurité ; retenir 0,75 en gaz |
| Dégagement devant les meubles bas | — | 0,90 | **Nouveau** — confirme que les 0,75 m du catalogue sont bas |
| Dégagement devant lave-vaisselle / four | — | 1,20 | **Nouveau** — appareil ouvert = un passage complet |
| Triangle d'activité | somme ≤ 6,50 m | « réduire les distances » | Qualitatif, sans valeur ajoutée |

**Effet sur les arbitrages du §5 : aucun.** Le dégagement de 0,90 m devant les
meubles bas s'insère entre la zone de service (0,75 m) et le passage (1,20 m),
et la largeur de pièce reste `max(0,65 + 0,90 ; 0,65 + 1,20) = 1,85 m` `[D]`.
Le minimum de 4,5 m² tient donc inchangé.

Deux conséquences pour le catalogue, à traiter avec le champ `passage` :

- `kitchen.clearance.front` : **0,75 → 0,90 m**, la valeur `[S3]` étant la
  seule sourcée pour cette notion précise ;
- le dégagement de 1,20 m devant un lave-vaisselle ou un four ne se distingue
  plus du passage — c'est un argument de plus pour une **échelle** de passage
  (0,60 / 0,90 / 1,20) plutôt qu'une valeur unique, cf.
  [circulation.md §3](circulation.md).

---

## 7. Fichiers liés

- [technohab_rules.md](../SOCLE_AGENCEMENT.md) — référentiel moteur (P0–P6 et
  règles JS) ; cette fiche l'alimente, elle ne le remplace pas.
- [assets/components.json](../assets/socle.data.js) — composant `kitchen`
  (gabarit et dégagements).
- [g2p_service/wrapper_api/component_geometry.py](../SOCLE_AGENCEMENT.md)
  — pose et emprise des composants (`footprint`, `clearance`, `ports`).
- [wonderland-integration/technohab/assets/generator.js](../assets/generator.js)
  — `DEFINITIONS.kitchen` (surface mini, poids d'allocation).
- [g2p_service/rules/packs/P4_topologie_usage_hierarchie.yaml](../SOCLE_AGENCEMENT.md)
  — adjacences cuisine ↔ séjour / salle à manger.

Toute évolution d'une valeur de cette fiche doit être répercutée dans le
référentiel moteur et, le cas échéant, dans le catalogue de composants.
