# Agencement — WC

> **Superseded le 26 août 2026 par [`../profils/wc-separe.md`](../profils/wc-separe.md)**,
> premier profil écrit au [`GABARIT_PIECE.md`](../GABARIT_PIECE.md). Cette fiche
> reste la **source** des valeurs `[S3]` W1–W6 et de l'invalidation de §2 ; le
> profil fait foi sur la conception, les classes, les enveloppes et les règles.


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
- **Source** : `[S3]` compilation transmise le 17 août 2026 (fiabilité 3).
  C'est la pièce la mieux couverte par cette compilation : cinq valeurs
  cohérentes entre elles, incluant une surface de pièce explicite.

---

## 1. Valeurs de référence

| # | Grandeur | Valeur | Nature | Marq. |
|---|---|---|---|---|
| W1 | Pièce WC classique | 0,80 m (l) × 1,30 m (p) | gabarit de pièce | `[S3]` |
| W2 | Dégagement devant la cuvette (passage des jambes) | ≥ 0,60 m | recul d'usage | `[S3]` |
| W3 | Dégagement latéral de chaque côté de la cuvette | ≥ 0,20 m | zone de service | `[S3]` |
| W4 | Hauteur de cuvette standard | 0,40–0,45 m | hauteur | `[S3]` |
| W5 | Hauteur de cuvette PMR | 0,50 m | hauteur, **PMR** | `[S3]` |
| W6 | Hauteur du bord supérieur du lave-mains | 0,85 m | hauteur | `[S3]` |

---

## 2. Cohérence interne de la source — ⚠️ section invalidée

> **Révisée le 17 août 2026 par [normes.md §3.1](../VEILLE_NORMATIVE.md).** Le
> 0,80 × 1,30 m de W1 n'est pas une dimension de pièce : c'est l'**espace
> d'usage** de l'annexe 2 de l'arrêté du 24 décembre 2015, qui désigne au WC
> un espace libre **latéral à la cuvette**, hors débattement de porte. La
> déduction ci-dessous recoupe donc une valeur d'accessibilité prise pour
> autre chose. Son résultat (cuvette 0,40 × 0,70 m) se trouve être le standard
> du marché, mais par coïncidence : il reste à sourcer directement, et la
> source `[S3]` n'en sort pas validée. Conservée telle quelle pour mémoire.

W1, W2 et W3 se recoupent, et ce recoupement **révèle le gabarit implicite de
la cuvette** :

- largeur : 0,80 − 2 × 0,20 = **0,40 m** `[D]` ;
- profondeur : 1,30 − 0,60 = **0,70 m** `[D]`.

Soit une cuvette de 0,40 × 0,70 m, exactement le standard du marché. La source
est donc cohérente, ce qui est un bon signe pour ses autres valeurs.

**Surface de pièce minimale : 0,80 × 1,30 = 1,04 m²** `[S3]`.

Avec lave-mains d'angle (0,35 × 0,35 m `[H]`), la largeur passe à **1,00 m**
`[D]`, soit 1,30 m².

---

## 3. Confrontation au moteur

| Référentiel | Valeur | Verdict |
|---|---|---|
| Python P3 | min 1,5 m², max 3 m² | **cohérent, légèrement haut** — 1,04 m² suffit pour un WC sec, 1,30 m² avec lave-mains |
| JS `DEFINITIONS.wc.minArea` | 1,5 m² | aligné |
| Composant `wc` (0,70 × 1,15, front 0,45, latéral 0,05) | — | **incohérent sur les trois axes** — voir ci-dessous |

Le composant `wc` mesure 0,70 m de large pour une cuvette qui en fait 0,40.
S'il faut lui appliquer W3 (0,20 m de chaque côté), on obtient une pièce de
1,10 m de large, contredisant les 0,80 m de W1. L'explication : **les 0,70 m
du composant intègrent déjà une partie du dégagement latéral**, sans le dire.
La donnée est juste, sa décomposition est fausse — et elle devient fausse dès
qu'une règle veut raisonner sur la cuvette elle-même.

Profondeur : 1,15 + 0,45 = 1,60 m contre 1,30 m attendus. Le composant est
plus exigeant que la source ; l'écart n'est pas dangereux, seulement non
justifié.

---

## 4. Règles proposées

| id | Niveau | Énoncé | Faisabilité |
|---|---|---|---|
| `TH2D-WC-001` | HARD | Rectangle libre ≥ 0,80 × 1,30 m | **Oui** — test direct sur la boîte |
| `TH2D-WC-002` | HARD | Dégagement ≥ 0,60 m devant la cuvette | **Oui** — via `clearance.front` |
| `TH2D-WC-003` | GUIDELINE | Dégagement ≥ 0,20 m de part et d'autre | **Oui**, mais suppose de redresser le gabarit du composant (§3) |
| `TH2D-WC-004` | — | Hauteurs W4–W6 | **Hors périmètre** — dimension verticale |

Rappel : `TH2D-WC-005` (adjacence WC ↔ séjour interdite) existe déjà en P4 et
figure au backlog JS de [technohab_rules.md §4.2](../SOCLE_AGENCEMENT.md).

---

## 5. Écarts relevés

1. **Gabarit du composant `wc` (0,70 m de large)** — mélange cuvette et
   dégagement latéral dans une seule cote. À décomposer : cuvette 0,40 m +
   `clearance` 0,20 m de chaque côté. Correction sans effet sur l'emprise
   totale, mais nécessaire pour que `TH2D-WC-003` ait un sens.
2. **`wc.clearance.front` à 0,45 m** — sous les 0,60 m de W2.
3. **Profondeur totale du composant (1,60 m) > W1 (1,30 m)** — surcote non
   justifiée, à réduire ou à documenter.
4. **Hauteur de cuvette PMR (W5)** — valeur d'accessibilité, à ranger dans un
   profil dédié et non dans le socle.
