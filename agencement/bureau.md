# Agencement — Bureau

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
- **Source** : `[S3]` compilation transmise le 17 août 2026 (fiabilité 3 ;
  liens majoritairement distributeurs de mobilier de bureau).

---

## 1. Valeurs de référence

| # | Grandeur | Valeur | Nature | Marq. |
|---|---|---|---|---|
| O1 | Plateau de bureau | ≥ 1,20 m (l) × 0,60 m (p) | gabarit | `[S3]` |
| O2 | Recul derrière le bureau (reculer la chaise, se lever) | 0,90–1,10 m | recul d'usage | `[S3]` |
| O3 | Hauteur du plateau | 0,72–0,75 m | hauteur | `[S3]` |
| O4 | Distance œil ↔ écran | 0,50–0,70 m | ergonomie | `[S3]` |
| O5 | Orientation du poste | perpendiculaire à la fenêtre | règle qualitative | `[S3]` |

O5 est la seule règle d'orientation **géométriquement exprimable** de toutes
les fiches : elle lie un composant à une baie. Elle reste hors de portée tant
que le moteur ne modélise pas les ouvertures.

---

## 2. Dimensionnement dérivé

Poste de travail seul, recul haut (O2 à 1,10 m) :
**1,20 × (0,60 + 1,10) = 1,20 × 1,70 = 2,04 m²** `[D]`.

Avec le composant du catalogue (1,40 × 0,70) : 1,40 × 1,80 = **2,52 m²** `[D]`.

Un poste avec rangement bas derrière (profondeur 0,40 m, cf.
[rangements.md](rangements.md)) : 1,40 × 2,20 = **3,08 m²** `[D]`.

---

## 3. Confrontation au moteur

| Référentiel | Valeur | Verdict |
|---|---|---|
| Python P3 | min 9 m², max 25 m² | **très haut** — 2,52 m² d'emprise pour un poste complet, 3,08 m² avec rangement |
| Moteur JS | *absent* — pas de type `office` dans `DEFINITIONS` | non généré |
| Composant `office` (1,40 × 0,70, front 0,80) | recul 0,80 m | **légèrement sous** O2 (0,90 min) |

Le minimum P3 de 9 m² est le plus éloigné du calcul de toutes les typologies :
un facteur 3 par rapport à l'emprise réelle. Il est vraisemblablement décalqué
de la chambre — ce qui se défend si le bureau doit rester convertible en
chambre, mais alors c'est cette raison qu'il faut écrire, pas la surface.

---

## 4. Règles proposées

| id | Niveau | Énoncé | Faisabilité |
|---|---|---|---|
| `TH2D-BUR-001` | HARD | Recul ≥ 0,90 m derrière le plateau | **Oui** — `clearance.front` de 0,80 à 0,90 |
| `TH2D-BUR-002` | HARD | Le rectangle accepte un plateau 1,20 × 0,60 m avec son recul | **Oui** |
| `TH2D-BUR-003` | GUIDELINE | Poste perpendiculaire à une baie | **Non** — pas d'ouvertures dans le modèle |
| `TH2D-BUR-004` | — | Hauteurs et distances écran (O3, O4) | **Hors périmètre** |

---

## 5. Écarts relevés

1. **Minimum P3 de 9 m² non dérivé** — facteur 3 par rapport à l'emprise
   calculée. Deux issues : le justifier par la convertibilité en chambre (et
   l'écrire), ou l'abaisser vers 5–6 m².
2. **`office.clearance.front` à 0,80 m** — sous la borne basse de O2 (0,90 m).
3. **Type `office` absent du moteur JS** — présent en P3, jamais généré. Même
   situation que buanderie, local technique, garage et cellier (cf.
   [technohab_rules.md §3](../SOCLE_AGENCEMENT.md)).
4. **O5 (perpendiculaire à la fenêtre)** — première règle du corpus qui
   demande la géométrie des baies. À verser au dossier « évolution
   structurelle » avec les portes et seuils de P1/P6.
