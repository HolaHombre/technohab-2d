# Agencement — Circulation (fiche transverse)

> **Superseded le 26 août 2026 par [`../profils/circulation.md`](../profils/circulation.md)**,
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


Fiche **transverse** : ses valeurs s'appliquent à toutes les typologies, pas à
une pièce. Conventions et hiérarchie des sources : [README.md](README.md).

- **Statut** : v1, rédigée le 17 août 2026.
- **Sources** : `[S3]` compilation transmise le 17 août 2026 (fiabilité 3,
  incluant des liens PMR) ; `[S1]`/`[S2]` reprises de [salon.md](salon.md).

C'est la fiche la plus critique du lot : la circulation est le seul thème déjà
massivement codé (P1, 11 règles) **et** le seul où les sources contredisent
directement une valeur `HARD` en production.

---

## 1. Valeurs de référence

| # | Grandeur | Valeur | Nature | Marq. |
|---|---|---|---|---|
| C1 | Passage libre autour du mobilier | 0,60–0,90 m | passage | `[S3]` |
| C2 | Grands axes de passage (séjour) | 0,90 m | passage | `[S3]` |
| C3 | Couloir simple, une personne | 0,90 m | largeur de pièce | `[S3]` |
| C4 | Croisement de deux personnes | 1,20 m | largeur de pièce | `[S3]` |
| C5 | Entrée | 1,20 m | largeur de pièce | `[S3]` |
| C6 | Demi-tour complet | 1,50 × 1,50 m | **PMR** | `[S3]` |
| C7 | Largeur de marche d'escalier | 0,80 m min, 0,90 m idéal | gabarit | `[S3]` |
| C8 | Hauteur de marche | 0,16–0,18 m | gabarit | `[S3]` |
| C9 | Accès aux fenêtres et débattement des portes | à dégager | qualitatif | `[S3]` |

---

## 2. Le conflit avec P1 — tranché le 17 août 2026

> **Arbitré par [normes.md §3.4](../VEILLE_NORMATIVE.md).** L'arrêté du 24 décembre 2015
> (art. 11) fixe la largeur des circulations intérieures à **0,90 m**. Le
> seuil P1 de 1,00 m n'est donc pas seulement non sourcé : il **rejette des
> plans légaux**. Proposition retenue : 0,90 m HARD (normatif) + 1,20 m
> GUIDELINE (croisement). L'analyse ci-dessous reste valable, sa conclusion
> est confirmée par un texte opposable.

| Règle en production | Valeur | Source `[S3]` | Écart |
|---|---|---|---|
| P1 — largeur mini circulation (HARD) | **1,00 m** | 0,90 m (C3) simple / 1,20 m (C4) croisement | Le seuil unique de 1,00 m ne correspond à **aucune** des deux valeurs d'usage |
| P1 — largeur mini d'entrée (HARD) | 0,90 m (porte) | 1,20 m (C5) pièce d'entrée | Notions différentes : ouvrant vs pièce |

Le 1,00 m de P1 tombe entre les deux valeurs de la source : trop large pour un
couloir de desserte simple, trop étroit pour un croisement. C'est le symptôme
d'un seuil moyen décrété plutôt que dérivé d'un usage.

**Proposition** `[D]` : remplacer le seuil unique par un seuil **conditionné à
la desserte** — 0,90 m si le couloir dessert moins de trois pièces,
1,20 m au-delà, la probabilité de croisement croissant avec le nombre de
portes. À trancher ; ce n'est pas un arbitrage que je rends ici, la source
étant de fiabilité 3 face à une règle HARD déjà en production.

---

## 3. Les trois notions de passage, chiffrées

La distinction posée en [README.md](README.md) se lit particulièrement bien
ici, les trois valeurs coexistant dans la même compilation :

| Notion | Valeur | Exemple |
|---|---|---|
| Contournement (on longe, on ne traverse pas) | 0,60 m | entre canapé et table basse |
| Passage traversant, une personne | 0,90 m | grand axe de séjour, couloir |
| Croisement / usage collectif | 1,20 m | entrée, couloir desservant |

Ces trois valeurs ne sont pas trois avis divergents sur la même grandeur —
c'est une **échelle**, et c'est elle qui devrait structurer le champ `passage`
du catalogue : non pas un booléen, mais un niveau de service.

---

## 4. Règles proposées

| id | Niveau | Énoncé | Faisabilité |
|---|---|---|---|
| `TH2D-CIRC-005` | HARD | Largeur de circulation conditionnée à la desserte (0,90 / 1,20 m) | **Oui** — le moteur connaît déjà le graphe de contact |
| `TH2D-CIRC-006` | HARD | Entrée : largeur ≥ 1,20 m | **Oui** — mais `entry` n'est pas un type de pièce JS |
| `TH2D-CIRC-007` | GUIDELINE | Profil PMR : carré libre 1,50 × 1,50 m dans chaque pièce desservie | **Oui**, si un profil PMR existe |
| `TH2D-CIRC-008` | HARD | Débattement des portes non entravé | **Non** — pas d'ouvrants dans le modèle (déjà P6.003) |
| `TH2D-CIRC-009` | GUIDELINE | Fenêtres non obstruées par du mobilier haut | **Non** — pas de baies dans le modèle |
| `TH2D-ESC-001` | HARD | Escalier : marche ≥ 0,80 m de large, hauteur 0,16–0,18 m | **Non** — pas d'escaliers dans le modèle (mono-niveau) |

Les quatre règles déjà implémentées côté JS (`TH2D-CIRC-001` à `004`) ne sont
pas touchées par cette fiche.

---

## 5. Principes transverses non métrables

- **Zone jour / zone nuit** — séparer les fonctions bruyantes (salon, cuisine)
  des fonctions calmes (chambres) `[S3]`. Recoupe P4.009 sans coïncider :
  P4.009 raisonne par paires de fonctions, la zone raisonne par **groupes**.
  Une implémentation en zones donnerait un résultat plus lisible.
- **Plus longue diagonale** — dégager la vue sur la plus grande diagonale
  d'une pièce pour l'agrandir visuellement `[S3]`. Calculable en PREFERENCE
  sur un rectangle (aucun composant n'intercepte la diagonale), mais l'intérêt
  est faible tant que les pièces sont mono-composant.
- **Miroirs face aux fenêtres** — décoratif, hors périmètre.

---

## 6. Écarts relevés

1. **P1 largeur circulation 1,00 m** — ne correspond à aucun usage sourcé.
   Conflit ouvert, arbitrage non rendu (§2).
2. **Champ `passage` à trois niveaux** — la décision prise en
   [cuisine.md §5.2](cuisine.md) prévoyait une valeur unique ; cette fiche
   montre qu'il faut une **échelle** (0,60 / 0,90 / 1,20). À intégrer avant
   implémentation — la tâche en attente doit être mise à jour.
3. **Type `entry` absent du moteur JS** — présent au catalogue et en P2
   (entrée obligatoire hors studio), jamais généré.
4. **Aucun profil PMR** — C6 et les valeurs d'accessibilité n'ont pas de
   support. Même constat que [salle-de-bain.md](salle-de-bain.md) et
   [wc.md](wc.md) : trois fiches réclament désormais ce profil.
5. **Escaliers hors modèle** — C7/C8 sans objet en mono-niveau ; à conserver
   pour une éventuelle V2 multi-niveaux.
