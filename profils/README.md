# Profils de pièce — index et synthèse transverse

Neuf profils de pièce et un profil fonctionnel écrits au [`GABARIT_PIECE.md`](../GABARIT_PIECE.md) entre le 25 août et
le 26 août 2026, couvrant **toutes les fiches du dossier
[`agencement/`](../agencement/)**. Chacun porte son type, sa maturité `C0–C6` et
une annexe d'écarts au moteur.

## Index

| Profil | Type | Vague | Maturité | Généré |
|---|---|---|---|---|
| [wc-separe](wc-separe.md) | `TOILET_SEPARATE` | C-P0 | `C4` | oui |
| [salle-eau-wc-integre](salle-eau-wc-integre.md) | `BATHROOM_WITH_TOILET` | C-P0 | `C4` | oui, composition |
| [chambre](chambre.md) | `BEDROOM` · enfant/parentale | C-P1 | `C4` | oui |
| [sejour](sejour.md) | `LIVING` | C-P1 | `C4` | oui |
| [cuisine](cuisine.md) | `KITCHEN` | C-P1 | `C4` | oui |
| [circulation](circulation.md) | `CIRCULATION` | C-P2 | `C4` | oui |
| [entree](entree.md) | `ENTRY_THRESHOLD` — fonction hébergée | C-P2 | `C4` | oui |
| [rangements](rangements.md) | `STORAGE` — transverse | C-P2 | `C4` limité | unités chambre + baies |
| [salle-eau](salle-eau.md) | `BATHROOM` · eau/bain | C-P3 | `C2` | oui |
| [bureau](bureau.md) | `BUREAU` | C-P4 | `C2` | **non** |

Les pilotes C-P0, C-P1.2 et C-P2 atteignent `C4` sur leur portée déclarée :
canon structuré, domaines versionnés et cas isolés de variantes, refus, porte,
accès et placements réels. Salle d'eau et bureau restent `C2`.

**Audit C-P0.2 du 31 août 2026.** Le trajet construit des deux pilotes est
prouvé par `scripts/test-profils-pilotes-integration.mjs`, mais aucun ne passe
artificiellement C5. Le WC séparé conserve cinq blocages transverses ; la
composition en conserve sept, dont la variante `bain` inaccessible et la
dépendance à `BATHROOM` C2. Le registre de décision et les propriétaires sont
versionnés dans `scripts/references/C_P0_INTEGRATION_AUDIT.json`.

## Ce que la série a montré

### 1. Cinq mécanismes manquants, réclamés chacun par plusieurs profils

C'est le résultat principal. Ce ne sont pas neuf listes de manques, c'est
**cinq extensions du socle** qui servent chacune plusieurs pièces.

| Mécanisme manquant | Réclamé par | Ce qu'il coûte |
|---|---|---|
| **L'ouvrant** — un battant occupe temporairement une zone | porte de pièce (`S3`, tous), penderie de chambre, four et lave-vaisselle en cuisine, rangements | un attribut + une zone temporaire ; sert **quatre** familles |
| **Le passage gradué** — 0,60 contournement / 0,90 traversant / 1,20 croisement | séjour, cuisine, circulation, rangements | un champ `passage` distinct de `clearance` ; l'échelle est déjà écrite dans `circulation.md` |
| **Le maximum** — un dégagement plafonné | séjour (conversation ≤ 3,00 m), cuisine (triangle ≤ 6,50 m) | le socle ne connaît que des minima ; ces deux valeurs portent la définition même des pièces |
| **Le critère propre au profil** | les neuf | `wet_dry_separation`, `night_path`, `work_triangle`, `furniture_ratio`, `convertibility` — aucun ne se déduit d'un critère générique |
| **L'équipement lié** — quantité dépendante d'un autre | chevets (chambre), chaises (séjour) | déjà identifié par `GAMMES_EQUIPEMENTS.md` §7 |

**L'ouvrant est le meilleur rapport valeur/coût de tout le dossier.** La porte
de pièce et S3 sont désormais construites et évaluées ; le même mécanisme reste
à étendre aux penderies, fours, lave-vaisselle et rangements.

### 2. Trois champs déclarés que personne ne lit

| Champ | Type | État |
|---|---|---|
| `minimalRect: 0,90 × 1,30` | `wc` | **contredit par le socle lui-même** : le solveur refuse ce rectangle |
| `facingClearance: 1.20` | `kitchen` | **lu depuis M2** par validation et classement ; sa doctrine reste à consolider en C-P1.2c |
| `trigger` | les treize types | déclaré partout, interpréteur au lot L1 |

Les deux premiers ont été découverts en écrivant les profils. La donnée est
juste dans le second cas : **c'est le mécanisme qui manque, pas la valeur.**

### 3. Deux règles déclarées infaisables qui ne le sont plus

Les fiches de sourcing d'août 2026 renvoyaient deux règles à un « prérequis
structurel ». Les deux prérequis ont été levés depuis, **sans que les règles
soient écrites** :

- **le triangle d'activité** (`C8`, cuisine) attendait l'éclatement de la
  cuisine en pôles individualisés. Le socle porte cinq équipements distincts ;
- **l'orientation du poste** (`O5`, bureau) attendait la modélisation des
  ouvertures. Le générateur pose des fenêtres avec côté, position et
  réservation.

Motif constant : **le moteur progresse plus vite que la relecture des fiches.**
C'est aussi ce qui a permis de constater que plusieurs écarts anciens étaient
déjà corrigés — le dégagement latéral du lit (0,15 → 0,60), le recul de bureau
(0,80 → 0,90), le dégagement de salle d'eau (0,50 → 0,80), l'éclatement des
composants monolithiques.

### 4. `maxRatio` est nul partout sauf à la circulation

Un seul type porte un plafond, et c'est le seul qui soit **mesuré** — 1,6, 90e
centile gelé le 19 août. Les huit autres profils proposent chacun un plafond
doctrinal `N3`, avec sa justification fonctionnelle :

| Pièce | Plafond proposé | Motif |
|---|---|---|
| WC | 3,0 – 3,5 m² | un seul utilisateur, aucun usage à ajouter |
| Salle d'eau | 9 m² | la valeur est un débit ; dédoubler vaut mieux qu'agrandir |
| Chambre | 20 m² | aucun usage supplémentaire |
| Séjour | 45 m² | la conversation est bornée à 3,00 m |
| Cuisine | 20 m² | le triangle est borné à 6,50 m |
| Bureau | 14 m² | au-delà, c'est une autre pièce |

**Aucun n'est mesuré, et aucun ne peut l'être par un centile** : le relevé
actuel entérinerait le défaut d'allocation que le chantier 9 corrige. Ces
plafonds sont doctrinaux et doivent être assumés comme tels — `ROADMAP.md` §6.6
l'autorise, à condition qu'ils portent identifiant, statut `N3` et portée.

### 5. Deux pièces sur trois ne déclarent pas la ventilation

L'arrêté du 24 mars 1982 oblige à extraire cuisine, salle d'eau et WC. **Seule
`bath` porte `services: ['ventilation']`.**

### 6. Quatre arbitrages bloquent le passage en C3

Aucun n'est un développement. Ce sont des décisions, ouvertes depuis le 18 août
pour trois d'entre elles :

1. **le dressing** — équipement, annexe ou pièce ?
2. **le rangement** — pièce générable ou annexe rattachée ?
3. **la salle à manger** — pièce autonome ou zone du séjour ?
4. **le bureau** — pièce, zone, équipement de chambre ou pièce bivalente ?

Les quatre posent la même question sous quatre formes, et le chantier 7 en fait
une condition d'entrée. Tant qu'elle est ouverte, quatre profils plafonnent.

### 7. Deux questions de doctrine topologique

Elles dépassent la pièce et relèvent du lot M3 :

- **le séjour peut-il desservir une chambre ?** Le graphe en étoile l'y oblige
  en l'absence de circulation. Le profil `sejour` dit non, hors très petits
  logements, mais ne peut pas trancher seul ;
- **le groupe jour / groupe nuit est-il exprimable ?** Ce n'est pas une somme
  d'adjacences deux à deux mais une propriété du plan entier. Le bureau montre
  d'ailleurs que ce n'est pas une bipartition : pièce diurne, zone calme.

### 8. Une homonymie à lever

« Rangement » désignait deux choses sans rapport : le **meuble** et la **bande
de surface cédée**. C-P2 les sépare en `storage_unit` et `storage_bay` ; la
règle `TH2D-RANGEMENT-003` contrôle désormais la penderie réellement posée.

## Ce que les profils ne disent pas

Aucun n'a été confronté au **plan complet**. Ils décrivent des pièces isolées et
leurs relations souhaitées ; ce que produit réellement le moteur une fois toutes
les contraintes en concurrence n'est mesuré que pour le WC.

**Et ces mesures ont déjà bougé.** Le relevé fait à la main le 26 août au matin
— 2,79 à 14,86 m², 18 à 27 pièces en L sur 30 — ne vaut plus : des correctifs
apportés au moteur dans la journée l'ont périmé avant que le chantier ne
démarre. Le témoin versionné `scripts/measure-o0.mjs`, livré avec M0, relève
désormais **8,96 m² au pire pour 5,39 programmés, et zéro WC en L**. La
disproportion demeure — 1,00 × 9,48 m de rectangle utile — mais elle a changé
de forme.

C'est la démonstration du principe que ces profils énoncent tous : **une mesure
non versionnée ne vaut rien.** Les chiffres cités dans les neuf annexes ont la
même fragilité, et seuls ceux que `measure-o0.mjs` et le banc M0 rejouent font
foi.

Aucun profil ne peut donc affirmer que ses seuils produisent de meilleurs plans.
Ils disent ce qu'il faudrait vérifier, et par quoi.
