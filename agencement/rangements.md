# Agencement — Rangements (fiche transverse)

> **Migrée le 18 août 2026 depuis le dépôt de développement `technohab`, désormais archivé.**
> Les valeurs sourcées de cette fiche (§ « valeurs de référence » et dimensionnements
> dérivés) restent valides. En revanche **toute confrontation au moteur qu'elle contient
> est périmée** : elle visait `assets/components.json`, les packs Python `P0`–`P6` et une
> copie figée de `generator.js`, tous archivés. L'état réel est porté par
> [`../assets/socle.data.js`](../assets/socle.data.js) et
> [`../VEILLE_NORMATIVE.md`](../VEILLE_NORMATIVE.md) ; les verdicts corrigés sont
> consolidés dans [README.md](README.md).


Fiche **transverse** : dressings, placards et penderies apparaissent dans la
chambre, l'entrée, le bureau et le séjour. Conventions et hiérarchie des
sources : [README.md](README.md).

- **Statut** : v1, rédigée le 17 août 2026.
- **Source** : `[S3]` compilation transmise le 17 août 2026 (fiabilité 3 ;
  liens majoritairement distributeurs et fabricants de rangement).

---

## 1. Valeurs de référence

| # | Grandeur | Valeur | Nature | Marq. |
|---|---|---|---|---|
| G1 | Profondeur de penderie | 0,60 m (0,55 strict min) | gabarit | `[S3]` |
| G2 | Profondeur d'étagère, vêtements pliés | 0,40–0,45 m | gabarit | `[S3]` |
| G3 | Profondeur d'étagère, livres | 0,30 m | gabarit | `[S3]` |
| G4 | Hauteur libre sous tringle, penderie courte | 1,00–1,10 m | hauteur | `[S3]` |
| G5 | Hauteur libre sous tringle, penderie longue | 1,60–1,70 m | hauteur | `[S3]` |
| G6 | Dégagement devant portes battantes | 1,00 m | zone de service | `[S3]` |
| G7 | Dégagement devant portes coulissantes | 0,70 m | zone de service | `[S3]` |

G6 et G7 sont la donnée la plus utile du lot : **le type d'ouvrant change
l'emprise au sol de 0,30 m**, ce qu'aucun composant du catalogue ne sait
exprimer aujourd'hui.

---

## 2. Emprise au sol par configuration

| Configuration | Emprise en profondeur | Calcul | Marq. |
|---|---|---|---|
| Penderie, portes battantes | 1,60 m | G1 + G6 | `[D]` |
| Penderie, portes coulissantes | 1,30 m | G1 + G7 | `[D]` |
| Étagères vêtements, battantes | 1,45 m | G2 + G6 | `[D]` |
| Bibliothèque ouverte (livres) | 0,30 m + passage | G3 + circulation | `[D]` |

La bibliothèque ouverte n'a **pas** de zone de service propre : on y accède
depuis le passage. C'est le seul cas du corpus où `clearance` doit valoir 0 et
où seul le `passage` compte — utile comme cas-test du futur champ.

---

## 3. Confrontation au moteur

| Référentiel | Valeur | Verdict |
|---|---|---|
| Composant `storage` (1,20 × 0,55, front 0,70) | profondeur 0,55, dégagement 0,70 | **cohérent uniquement en coulissant** — 0,55 est le minimum strict de G1, 0,70 est exactement G7 |
| Python P3 — cellier | pas de bornes | non contraint |
| Moteur JS | *pas de type `storage`* | non généré |

Le composant `storage` décrit donc, sans le dire, un **placard coulissant de
profondeur minimale**. Ce n'est pas faux, c'est non déclaré : un rangement à
portes battantes, plus courant, y est invalide.

---

## 4. Règles proposées

| id | Niveau | Énoncé | Faisabilité |
|---|---|---|---|
| `TH2D-RGT-004` | HARD | Dégagement ≥ 1,00 m devant un rangement battant, 0,70 m si coulissant | **Oui** — suppose un attribut `ouvrant` sur le composant |
| `TH2D-RGT-005` | GUIDELINE | Profondeur de penderie ≥ 0,60 m (0,55 toléré) | **Oui** — donnée de catalogue, pas de règle de plan |
| `TH2D-RGT-006` | — | Hauteurs sous tringle (G4, G5) | **Hors périmètre** — dimension verticale |

Trois règles `TH2D-RANGEMENT-001` à `003` existent déjà côté JS, hors packs
Python (cf. [technohab_rules.md §1](../SOCLE_AGENCEMENT.md)) — leur contenu
n'est pas documenté dans le référentiel. **À vérifier avant d'ajouter quoi que
ce soit** : il peut y avoir recouvrement.

---

## 5. Écarts relevés

1. **Attribut `ouvrant` absent du catalogue** — battant vs coulissant change
   l'emprise de 0,30 m. Aujourd'hui inexprimable ; c'est la deuxième
   information manquante du catalogue après `passage`, et elle est du même
   ordre (une zone de service qui dépend d'une propriété du meuble).
2. **`storage` décrit implicitement un coulissant minimal** — à déclarer, ou à
   dédoubler en deux définitions.
3. **`TH2D-RANGEMENT-001` à `003` non documentées** — trois règles en
   production dont le référentiel ne dit rien. À relever et à verser dans
   cette fiche.
4. **Type `storage` absent du moteur JS** — le composant existe au catalogue
   mais aucune pièce ne le porte.
