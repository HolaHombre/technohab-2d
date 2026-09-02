# Agencement — Chambre

> **Superseded le 26 août 2026 par [`../profils/chambre.md`](../profils/chambre.md)**,
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
- **Sources** : `[S3]` compilation transmise le 17 août 2026 (fiabilité 3) ;
  les valeurs de rangement viennent de [rangements.md](rangements.md).

---

## 1. Valeurs de référence

| # | Grandeur | Valeur | Nature | Marq. |
|---|---|---|---|---|
| D1 | Passage sur les côtés et au pied du lit | 0,60 m | passage | `[S3]` |
| D2 | Dégagement devant une armoire à portes battantes | 1,00 m | zone de service | `[S3]` |
| D3 | Dégagement devant un placard à portes coulissantes | 0,70 m | zone de service | `[S3]` |
| D4 | Profondeur de penderie | 0,60 m (0,55 strict min) | gabarit | `[S3]` |
| D5 | Hauteur des tables de chevet | = hauteur du matelas | hauteur | `[S3]` |

Le lit double du catalogue mesure 1,60 × 2,00 m — cohérent avec le standard.

---

## 2. Dimensionnement dérivé

> **Complété le 17 août 2026 par [normes.md §3.2](../VEILLE_NORMATIVE.md).** En logement
> accessible, l'arrêté du 24 décembre 2015 (art. 13) exige **0,90 m sur les
> deux grands côtés du lit et 1,20 m au pied**, plus un espace libre de
> Ø 1,50 m — contre 0,60 m ici. Emprise correspondante : **9,92 m²**. Les
> valeurs ci-dessous restent celles du socle confort.

### 2.1 Lit seul

Lit accessible **des deux côtés et au pied** (D1) :
**(1,60 + 2 × 0,60) × (2,00 + 0,60) = 2,80 × 2,60 = 7,28 m²** `[D]`.

Lit accessible **d'un seul côté** (configuration chambre d'enfant, lit contre
un mur) : (1,60 + 0,60) × 2,60 = **5,72 m²** `[D]`.

### 2.2 Lit + armoire

L'armoire s'implante sur un mur latéral, sa zone de service (D2) empiétant sur
le passage du lit — les deux se superposent, elles ne s'additionnent pas :

- portes battantes : profondeur 0,60 + 1,00 = **1,60 m** d'emprise, dont
  0,60 m déjà comptés dans le passage latéral → **+1,00 m** sur la largeur ;
- portes coulissantes : 0,60 + 0,70 = 1,30 m → **+0,70 m** `[D]`.

D'où, pour une chambre avec armoire battante des deux côtés desservis :
**3,80 × 2,60 = 9,88 m²** `[D]`. Avec coulissantes : 3,50 × 2,60 = 9,10 m².

---

## 3. Confrontation au moteur

| Référentiel | Valeur | Verdict |
|---|---|---|
| Python P3 — chambre enfant | min 9 m², max 12 m² | **cohérent** — 7,28 m² (lit seul) + rangement ≈ 9 m² |
| Python P3 — chambre parentale | min 12 m², max 20 m² | **cohérent** — marge au-delà des 9,88 m² calculés |
| JS `DEFINITIONS.bedroom.minArea` | 9 m² | aligné sur la chambre enfant ; ne distingue pas la parentale |
| Composant `bedroom` (1,60 × 2,00) | latéral 0,15 m, front 0,40 m | **très sous** D1 (0,60 m sur les deux) |

C'est la typologie où les seuils P3 tiennent le mieux face au calcul. En
revanche le composant est franchement sous-doté : 0,15 m de dégagement
latéral ne permet pas de longer un lit.

---

## 4. Règles proposées

| id | Niveau | Énoncé | Faisabilité |
|---|---|---|---|
| `TH2D-CHBR-001` | HARD | Passage ≥ 0,60 m sur au moins un côté long et au pied du lit | **Oui** — `clearance` latéral et front à relever |
| `TH2D-CHBR-002` | GUIDELINE | Lit accessible des deux côtés en chambre parentale | **Oui** — test sur la boîte, largeur ≥ 2,80 m |
| `TH2D-CHBR-003` | GUIDELINE | Dégagement ≥ 1,00 m devant une armoire battante, 0,70 m si coulissante | **Non en l'état** — suppose un composant `armoire` distinct du lit |
| `TH2D-CHBR-004` | HARD | Chambre jamais accessible directement depuis l'extérieur | **Déjà en P6** |
| `TH2D-CHBR-005` | PREFERENCE | Chambre éloignée des fonctions bruyantes (zone nuit / zone jour) | **Partiellement** — P4.009, calculable sur centroïdes |

---

## 5. Écarts relevés

1. **`bedroom.clearance` latéral à 0,15 m** — contre 0,60 m requis. C'est
   l'écart le plus important relevé sur l'ensemble des fiches : il fait passer
   l'emprise du lit de 7,28 m² calculés à 5,72 m² dans le moteur, soit une
   chambre validée alors qu'on ne peut pas en faire le tour.
2. **`bedroom.clearance.front` à 0,40 m** — contre 0,60 m.
3. **Chambre parentale non distinguée côté JS** — `minArea` unique à 9 m², là
   où P3 sépare enfant (9) et parentale (12).
4. **Armoire absente du catalogue** — la chambre est mono-composant (le lit).
   `TH2D-CHBR-003` reste inatteignable, même prérequis structurel que la
   cuisine et le salon.
5. **Zone jour / zone nuit** — principe transverse `[S3]` non formalisé :
   il recoupe P4.009 (bruyant/calme) sans lui être identique. À trancher :
   une seule règle ou deux.
