# Fiches d'agencement par typologie

Valeurs d'**usage** par type de pièce — emprises de mobilier, dégagements,
distances ergonomiques — chacune adossée à une source identifiée.

Ces fiches ne concurrencent pas [`VEILLE_NORMATIVE.md`](../VEILLE_NORMATIVE.md),
elles la complètent exactement là où elle s'arrête. Sa section 6, « Ce qui
reste sans source », liste ce qui manque : emprises de mobilier, zones d'usage
hors PMR, dégagement de cuisine entre linéaires, rangements. **C'est ce trou
que ces fiches comblent** — et le seul motif de leur migration.

- **Migrées le 18 août 2026** depuis le dépôt de développement `technohab`,
  archivé le même jour.
- **Autorité** : `VEILLE_NORMATIVE.md` fait foi sur tout ce qui est
  réglementaire (`N1`). Ces fiches ne portent que du `N2` et du `N3`.

| Fiche | Portée |
|---|---|
| [cuisine.md](cuisine.md) | Linéaire, triangle d'activité, crédence, hotte, réseaux |
| [salon.md](salon.md) | Coin salon, zone TV, coin repas |
| [salle-de-bain.md](salle-de-bain.md) | Douche, lavabo, reculs |
| [wc.md](wc.md) | Cuvette, dégagements, lave-mains |
| [chambre.md](chambre.md) | Lit, armoire, passages |
| [bureau.md](bureau.md) | Plateau, recul, écran, lumière |
| [circulation.md](circulation.md) | Couloirs, entrée, demi-tour, escalier |
| [rangements.md](rangements.md) | Penderies, étagères, ouvrants |

---

## 1. Apport à `VEILLE_NORMATIVE.md` §6

Correspondance entre les familles déclarées sans source et ce que les fiches
apportent. Ce tableau est le mode d'emploi du dossier.

| Famille sans source (§6) | Apport | Fiche |
|---|---|---|
| Dégagement de cuisine entre linéaires | **1,20 m** entre linéaires, guide technique ACCA/Biblus (éditeur CAO) | [cuisine.md](cuisine.md) §1 |
| Emprises de mobilier | Plan de travail 0,60/0,65 ; meubles hauts 0,35 ; crédence 0,50–0,60 ; hotte 0,65 (vitro) / 0,75 (gaz) | [cuisine.md](cuisine.md) §1, §6 |
| Zones d'usage hors PMR | Canapé/table basse 0,40–0,50 ; assises en vis-à-vis 1,00–3,00 ; recul de chaise 0,60–1,20 ; recul de bureau 0,90–1,10 | [salon.md](salon.md), [bureau.md](bureau.md) |
| Rangement (convention 0,45 m) | Penderie 0,60 (0,55 min) ; étagère pliés 0,40–0,45, livres 0,30 ; **dégagement 1,00 battant / 0,70 coulissant** | [rangements.md](rangements.md) |
| Réseaux et emplacements techniques | Hauteurs élec/eau/gaz en cuisine, source ACCA | [cuisine.md](cuisine.md) §3 |

Le point le plus exploitable est le dernier de la ligne « rangement » : le
**type d'ouvrant change l'emprise au sol de 0,30 m**, ce que le socle
n'exprime pas — `wardrobe` y porte un dégagement unique de 0,60 m.

## 2. Deux sources `N1` à ajouter à la veille

Trouvées lors de la recherche du 17 août, absentes de la table `REF-…` :

| Réf proposée | Texte | Apport |
|---|---|---|
| `REF-008` | Règlement sanitaire départemental type (décliné par département) | Un cabinet d'aisances **ne communique pas directement** avec une cuisine ni une pièce où l'on prend les repas. Contrainte d'adjacence, aujourd'hui absente du moteur |
| `REF-009` | Arrêté du 24 mars 1982, aération des logements | Extraction permanente en pièces de service (ordre de 20 m³/h cuisine, 15 m³/h bain et WC). Sans effet 2D, mais impose que ces pièces soient raccordables à une gaine |

`REF-008` est le seul des deux qui produise une règle immédiatement codable.
Attention à sa portée : le RSD **varie par département**, seules ses
interdictions d'adjacence, communes à toutes les déclinaisons du règlement
type, sont exploitables.

## 3. Confrontations périmées — verdicts corrigés

Chaque fiche contient une section « confrontation au moteur » écrite contre le
dépôt archivé : `assets/components.json`, les packs Python `P3`, et une copie
figée de `generator.js` datant du 16 août. **Ces sections sont fausses ici**,
d'où le bandeau en tête de chaque fiche. Verdicts refaits contre le moteur
réel :

| Écart annoncé dans les fiches | État réel |
|---|---|
| « Cuisine monolithique, à éclater en `sink`/`cooktop`/`fridge` » | **Déjà fait** — `socle.data.js` porte `sink`, `hob`, `worktop`, `fridge`, `dishwasher`, et la relation `KITCHEN-SEQUENCE-001` impose le plan de travail entre évier et plaque |
| « `kitchen.clearance.front` à 0,75 m, trop bas » | **Sans objet** — le socle est à 0,90 m en usage `front`, exactement la valeur sourcée, et `facingClearance: 1.20` couvre le passage entre linéaires |
| « `bedroom.clearance` latéral à 0,15 m » | **Sans objet** — le socle est à 0,60 m sur les faces longues, `sides: 2` pour le lit double |
| « Séjour mono-composant, orientation incalculable » | **Déjà fait** — `sofa`, `coffee_table`, `tv_unit`, et la relation `LIVING-FOCAL-001` oriente le canapé vers le meuble média |
| « Il manque un champ `passage` distinct de `clearance` » | **Autrement résolu** — le socle sépare `footprint` et `usage[].face`, et la cuisine porte un `facingClearance` propre |
| « Minimum cuisine à 3 m², infaisable » | **Sans objet** — `DEFINITIONS.kitchen` porte `minArea: 7` et surtout `minSide: 1.8`, dérivé du socle (0,60 de plan + 1,20 de passage) |
| « Trois seuils de séjour non réconciliés (8/20/24) » | **Partiellement** — `minArea: 20` et `minSide: 3.0` sont dérivés ; le 24 m² de `TH2D-SIZING-001` reste non sourcé |
| « `dining.clearance` à 0,50 m, insuffisant » | **Corrigé côté socle** — `dining_table_4` porte 0,80 m `around`. Reste sous les 0,90–1,20 m sourcés pour circuler derrière une chaise occupée : **seul écart de cette table encore ouvert** |

Autrement dit : sur huit écarts annoncés, six étaient déjà traités par le
socle, un l'a été autrement, un seul tient encore.

## 4. Convention de traçabilité

Reprise des fiches d'origine, à harmoniser avec les identifiants `VAL-…` de la
veille lors d'un prochain passage :

- `[S…]` — issue d'une source, identifiée en tête de fiche ;
- `[D]` — dérivée par calcul depuis des valeurs sourcées ;
- `[H]` — hypothèse projet, sans source.

Hiérarchie appliquée : textes réglementaires (`N1`, dans la veille) > guides
techniques d'éditeurs CAO > sources éditoriales et commerciales > agrégats de
liens hétérogènes. Aucune valeur PMR ne doit être promue en règle générale :
elle appelle un profil dédié — et la veille en distingue **deux**, accessible
et évolutif.
