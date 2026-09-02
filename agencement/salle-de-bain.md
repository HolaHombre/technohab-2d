# Agencement — Salle de bain / salle d'eau

> **Superseded le 26 août 2026 par [`../profils/salle-eau.md`](../profils/salle-eau.md)**,
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


Fiche support par typologie. Conventions et hiérarchie des sources :
[README.md](README.md).

- **Statut** : v1, rédigée le 17 août 2026.
- **Source** : `[S3]` compilation transmise le 17 août 2026 (agrégat de liens
  hétérogènes : blogs, distributeurs, sites d'accessibilité PMR). Fiabilité
  de niveau 3 — à recouper avant tout codage `HARD`.

> **Avertissement PMR.** Plusieurs liens de la compilation portent sur la
> salle de bain adaptée. Les valeurs ci-dessous sont retenues comme valeurs de
> **confort standard** ; l'accessibilité appelle un profil séparé, avec ses
> propres reculs et un demi-tour de 1,50 × 1,50 m (cf.
> [circulation.md](circulation.md)).

---

## 1. Valeurs de référence

| # | Grandeur | Valeur | Nature | Marq. |
|---|---|---|---|---|
| B1 | Recul devant la douche | 0,60 m | recul d'usage | `[S3]` |
| B2 | Recul devant le lavabo | 0,70 m | recul d'usage | `[S3]` |
| B3 | Hauteur du plan vasque | 0,85 m | hauteur | `[S3]` |

Trois valeurs seulement : la compilation est pauvre sur cette pièce. Manquent
notamment la largeur de douche, l'encombrement de la baignoire, le recul
devant une baignoire, et l'entraxe entre deux vasques — à sourcer.

---

## 2. Dimensionnement dérivé

Gabarits d'appareils retenus `[H]` (valeurs de marché courantes, non
sourcées) : douche 0,90 × 0,90 m, lavabo 0,60 × 0,55 m, baignoire
1,70 × 0,70 m.

| Configuration | Emprise | Calcul | Marq. |
|---|---|---|---|
| Douche seule | 0,90 × 1,50 = 1,35 m² | 0,90 + B1 | `[D]` |
| Lavabo seul | 0,60 × 1,25 = 0,75 m² | 0,55 + B2 | `[D]` |
| Douche + lavabo alignés | 1,50 × 1,60 = 2,40 m² | largeurs cumulées × max(B1+0,90 ; B2+0,55) | `[D]` |
| Baignoire + lavabo alignés | 2,30 × 1,25 = 2,88 m² | idem, recul B2 dominant | `[D]` |

Le minimum P3 de **3 m²** couvre ces deux configurations avec une marge
faible mais réelle. C'est, avec le WC, le seul seuil P3 qui résiste au calcul
sans être relevé.

---

## 3. Confrontation au moteur

| Référentiel | Valeur | Verdict |
|---|---|---|
| Python P3 | min 3 m², max 15 m² | **cohérent** — 2,40 m² d'emprise pour la configuration de base |
| JS `DEFINITIONS.bath.minArea` | 3 m² | aligné |
| Composant `bath` (1,20 × 0,90, front 0,50) | dégagement 0,50 m | **sous** B1 (0,60) et B2 (0,70) — à relever à 0,70 |

Le composant `bath` agrège douche et lavabo dans un bloc de 1,20 × 0,90 m,
plus étroit que les 1,50 m calculés au §2. Sous-dimensionné sur les deux axes.

---

## 4. Règles proposées

| id | Niveau | Énoncé | Faisabilité |
|---|---|---|---|
| `TH2D-SDB-001` | HARD | Recul libre ≥ 0,70 m devant le bloc sanitaire | **Oui** — relèvement de `clearance.front` du composant |
| `TH2D-SDB-002` | HARD | Largeur de pièce ≥ 1,50 m pour loger douche + lavabo | **Oui** — test sur la boîte |
| `TH2D-SDB-003` | GUIDELINE | Profil PMR : demi-tour 1,50 × 1,50 m libre | **Oui**, si un profil PMR existe — il n'y en a pas aujourd'hui |
| `TH2D-SDB-004` | — | Hauteur de vasque (0,85 m) | **Hors périmètre** — dimension verticale |

---

## 5. Écarts relevés

1. **`bath.clearance.front` à 0,50 m** — sous le recul lavabo de 0,70 m.
   Correction attendue, indépendante du champ `passage`.
2. **Gabarit du composant `bath` (1,20 m)** — inférieur à la largeur cumulée
   douche + lavabo (1,50 m). Soit le composant représente un seul appareil et
   son label est trompeur, soit il est sous-dimensionné.
3. **Source pauvre** — trois valeurs pour une pièce qui en demande une
   dizaine. Les gabarits d'appareils du §2 sont des `[H]` assumées.
4. **Aucun profil PMR dans le moteur** — les valeurs d'accessibilité de la
   compilation n'ont nulle part où se ranger.
