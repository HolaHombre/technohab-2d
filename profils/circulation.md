# Profil de pièce — Circulation

**`CIRCULATION` · maturité `C4` · 1er septembre 2026**

Vague **C-P2**. Gabarit : [`GABARIT_PIECE.md`](../GABARIT_PIECE.md). Sources :
[`agencement/circulation.md`](../agencement/circulation.md) et
[`DOCTRINE_CIRCULATION.md`](../DOCTRINE_CIRCULATION.md), qui fait foi sur le
dimensionnement et la cession de bandes.

**C'est la seule pièce dotée d'un contrôle dédié** — trois règles de conformité,
`TH2D-CIRC-001` à `003`, tandis que `004` reste un diagnostic sans seuil externe.
C'est aussi la seule sans aucun équipement, ce qui met le gabarit à
l'épreuve : plusieurs de ses sections sont ici sans objet, et le dire est plus
utile que de les remplir.

---

## 1. Définition fonctionnelle

```text
ROOM_TYPE  CIRCULATION
FAMILY     DISTRIBUTION

PRIMARY_FUNCTIONS
- relier les pièces entre elles
- absorber les débattements de porte
- assurer l'intimité : on n'entre pas dans une pièce en traversant une autre

SECONDARY_FUNCTIONS
- ranger, si la largeur le permet
- éclairer en second jour
- accueillir un point technique — tableau, gaine, trappe
```

**La circulation ne se justifie pas par ce qu'on y fait, mais par ce qu'elle
évite.** Sans elle, les pièces se desservent l'une l'autre : la chambre s'ouvre
sur le séjour, le séjour devient un hall. Sa vraie fonction est donc
**négative** — elle protège l'usage des autres pièces — et c'est pourquoi son
agrément est faible sans être nul : 0,6 au socle, majoré par ce qu'elle
dessert.

Conséquence directe : **une circulation ne se dimensionne pas, elle se
justifie.** Son critère d'existence est un rapport — le nombre de pièces à
desservir — et le socle le porte : `trigger: { kind: 'derived', from:
'desserte', minRooms: 4 }`. En dessous de quatre pièces, un logement n'a pas
besoin de couloir, et le séjour distribue. C'est le seul `trigger` du socle qui
soit réellement dérivé plutôt que constant.

Usage simultané : oui, et c'est toute la question de la largeur — deux
personnes s'y croisent.

## 2. Équipements

**Aucun.** Et ce n'est pas un manque.

Le socle porte `equipments: []` avec un commentaire explicite : « la circulation
est contrainte par sa largeur libre, déjà tenue par `TH2D-CIRC-001` et `003` ».
C'est la seule pièce du logement dont la qualité se mesure au **vide** et non au
contenu. Lui attribuer des équipements — un meuble d'appoint, une console —
serait confondre ce qu'on peut y mettre avec ce qui la définit.

Deux objets la bordent sans lui appartenir :

| Objet | Rattachement | Effet |
|---|---|---|
| Portes des pièces desservies | à chaque pièce | consomment du linéaire, et leur débattement mord sur la largeur |
| Bandes de rangement cédées | à la pièce longée | naissent de son surplus de largeur — voir §5 |

## 3. Dimensions des équipements

**Sans objet**, faute d'équipement. La grandeur dimensionnante est la largeur
libre, traitée au §4.

Un seul gabarit mériterait d'y entrer et n'y est pas : **l'escalier**. Marche de
0,80 m minimum, 0,90 m idéale, hauteur 0,16 à 0,18 m `[S3]`. Hors modèle : le
moteur est mono-niveau, et l'escalier relève du lot C-P7, qui n'est pas une
extension mais un changement de modèle.

## 4. Enveloppes d'usage

```text
PHYSICAL_FOOTPRINT     aucun
EXCLUSIVE_USAGE_ZONE   la largeur libre elle-même
SHARED_USAGE_ZONE      —
TEMPORARY_SWING_ZONE   débattement des portes qu'elle dessert  ← le point sensible
ACCESS_ZONE            confondue avec la pièce
```

### Les trois notions de passage forment une échelle

C'est ici que la distinction du dossier `agencement/` se lit le mieux, les trois
valeurs venant de la même compilation :

| Notion | Valeur | Exemple |
|---|---:|---|
| Contournement — on longe, on ne traverse pas | 0,60 m | entre canapé et table basse |
| Passage traversant, une personne | 0,90 m | grand axe de séjour, couloir de desserte |
| Croisement, usage collectif | 1,20 m | entrée, couloir desservant plusieurs pièces |

**Ce ne sont pas trois avis divergents sur la même grandeur, c'est une
échelle** — un niveau de service. Le séjour et la cuisine réclament chacun de
leur côté cette distinction, sous le nom de `passage` ; c'est la circulation qui
en donne la graduation complète.

| Grandeur | Valeur socle | Statut |
|---|---:|---|
| Largeur simple, `TH2D-CIRC-001` `HARD` | **0,90 m** sous trois dessertes | réglementaire |
| Largeur de croisement, même règle | **1,20 m** dès trois dessertes | doctrinale, décision 7 |
| Largeur maximale, `TH2D-CIRC-003` `HARD` | 1,80 m | « au-delà, ce n'est plus un couloir mais une pièce » |
| Longueur / desserte, `TH2D-CIRC-004` | publiée, **sans seuil** | diagnostic en attente de corpus externe |
| Largeur réglementaire, `VAL-PMR-009` | 0,90 m | vérifié — arrêté du 24 décembre 2015, art. 11 |
| Demi-tour PMR, `C6` | 1,50 × 1,50 m | `[S3]`, recoupé par `VAL-PMR-001` |

### Le minimum est conditionné par la desserte

`TH2D-CIRC-001` lit désormais le graphe construit : **0,90 m** sous trois
espaces desservis, **1,20 m** à partir de trois. La règle ne confond plus le
passage unipersonnel réglementaire avec une situation de croisement probable.
Les trois paramètres sont canoniques et le banc C4 verrouille les quatre côtés
de la frontière (0,85/0,95 m et deux/trois dessertes).

## 5. Trois classes dimensionnelles

Les classes ont ici un sens différent : elles ne décrivent pas un niveau de
confort mais un **niveau de service**.

### MINIMAL — dégagement, 3 à 5 m²

Relie deux à trois pièces. Largeur 0,90 à 1,20 m. Pas de croisement attendu,
pas de rangement. `minProgramArea: 3`, `minProgramSide: 0.90` au socle.

### MOYEN — couloir de desserte, 5 à 9 m²

Quatre à cinq pièces desservies, largeur 1,20 m, croisement possible. C'est le
cas que le `trigger` déclenche à partir de quatre pièces, et le cas de référence.

### LARGE — hall ou palier, 9 à 14 m²

Au-delà, la circulation cesse d'être un couloir : `TH2D-CIRC-003` la refuse
au-delà de **1,80 m de large**, et c'est une bonne règle — une circulation plus
large est une pièce qui s'ignore, et devrait être nommée : entrée, hall, palier.

**Le plafond de cette pièce est le seul du socle qui soit mesuré.**
`maxRatio: 1.6` — 90e centile relevé sur les plans, gelé le 19 août 2026. Tous
les autres types portent `maxRatio: null`. C'est le modèle que les autres
suivront quand la mesure les aura calibrés, et ce profil confirme qu'il tient.

### Le surplus n'est pas supprimé, il est cédé

Le créneau attribué à la circulation par la découpe est délibérément généreux :
un couloir étroit longe moins de pièces, donc dessert moins bien. Le surplus est
**cédé aux pièces longées** sous forme de bandes de rangement — la surface
totale est conservée, et les pièces receveuses deviennent des L.

C'est une doctrine assumée (`ROADMAP.md` §5 ter) et mesurée : plafonner le
créneau dégraderait les adjacences plus qu'il ne réduirait la largeur. Elle a
un défaut, identifié dans les profils précédents : **la cession ignore
l'agrément de la pièce receveuse**, et un WC reçoit une bande dont il n'a aucun
usage. Le filtre est inscrit au lot O1.

## 6. Règles d'agencement

Sans équipement, il n'y a pas d'agencement interne. Les règles portent sur la
**forme** et sur les **portes**.

| Relation | Niveau |
|---|---|
| Dessert au moins deux espaces | `REQUIRED` — `TH2D-CIRC-002`, `HARD`, actif |
| Largeur libre ≥ minimum | `REQUIRED` — `TH2D-CIRC-001`, `HARD`, actif |
| Largeur libre ≤ 1,80 m | `REQUIRED` — `TH2D-CIRC-003`, `HARD`, actif |
| Longueur rapportée aux dessertes | diagnostic `TH2D-CIRC-004`, sans seuil externe |
| Débattements de porte non concurrents | `REQUIRED` — `S3`, actif |
| Sens d'ouverture résolu par la hiérarchie O3 | `REQUIRED` — extérieur de la pièce servie, coulissant, puis intérieur |
| Deux portes face à face à moins de 1,20 m | `UNDESIRABLE` |
| Branche sans porte ou accès | `UNDESIRABLE` — pénalité métrique M5 |
| Circulation traversant une pièce habitée | `FORBIDDEN` |

Le sens n'est plus déduit du nom de la pièce. O3 ouvre d'abord hors de la pièce
servie si `S3` l'autorise, essaie ensuite le coulissant, puis l'ouverture
intérieure. Chaque battant devient un obstacle réel du solveur ;
`TH2D-DOOR-004` bloque le plan lorsque mobilier, zones d'usage et porte ne
peuvent pas coexister.

## 7. Circulations

Section circulaire, au sens propre : la circulation *est* la circulation. Ce qui
mérite d'être analysé, c'est sa **topologie**.

```text
SÉJOUR → CIRCULATION → CHAMBRE      desserte normale
ENTRÉE → CIRCULATION → tout         distribution depuis le seuil
CIRCULATION → CIRCULATION           interdit — arbitrage du 21 août
```

**Aucune arête n'est demandée entre deux circulations** : arbitrage
« circulations isolées » du 21 août 2026. Quand un logement en compte
plusieurs, chacune se rattache au séjour, et l'accessibilité passe par lui.
C'est cohérent avec le graphe en étoile, et cela évite les enfilades de
couloirs — mais cela renforce le rôle distributeur du séjour, déjà relevé comme
discutable dans [`sejour.md`](sejour.md) §11.

La longueur est le vrai défaut à surveiller : **un couloir long dessert mieux
mais coûte plus**, et sa pénalité de ratio de forme le frappe injustement — voir
annexe.

## 8. Porte et accès

La circulation ne possède pas de porte : elle **reçoit** celles des autres.

| Situation | Rang |
|---|---|
| Portes réparties le long du couloir, décalées | `BEST` |
| Portes groupées à une extrémité | `ACCEPTABLE` |
| Deux portes en vis-à-vis à moins de 1,20 m | `UNDESIRABLE` — débattements concurrents |
| Porte ouvrant dans le couloir | admise seulement si `S3` conserve les usages et le parcours |
| Débattement recouvrant une emprise ou zone requise | `FORBIDDEN` — `S3`, actif |

C'est la pièce où `S3` compte le plus : les réservations, faces et battants
participent au verdict du `BuiltPlan`, et le banc C4 vérifie les portes de
desserte sur des plans générés.

Largeur de passage utile : le générateur pose 0,83 m de baie et 0,77 m de
passage libre — `VAL-PMR-007` et `008` — partout et sans exception. Sur ce
point, le moteur est déjà au niveau accessible.

## 9. Formes de la pièce

| Forme | Pertinence | Réserve |
|---|---|---|
| Barre | **excellente** | la forme canonique |
| L | **excellente** | dessert deux ailes ; le squelette la produit |
| T | bonne | trois branches, dessert davantage |
| Hall carré | acceptable | c'est une entrée, pas un couloir — à nommer |
| Peigne, ramifications multiples | à éviter | multiplie les culs-de-sac |

La circulation est **la seule pièce où l'allongement est normal**. Un couloir
est allongé par définition, et c'est précisément ce que la pénalité de ratio du
moteur ne sait pas admettre — défaut documenté, mesuré, et conservé
sciemment (annexe).

Le squelette pose des circulations en barre, L ou T et loge les pièces dans les
poches. C'est le seul générateur de forme qui raisonne d'abord sur la
circulation, et c'est l'ordre correct.

## 10. Archétypes d'implantation

**A — barre, portes décalées.**

```text
┌───┬────────────────┬───┐
│ch1│                │ch2│
├─  ┴────────────────┴  ─┤
│      couloir 1,20      │
├─  ┬────────────────┬  ─┤
│sdb│                │wc │
└───┴────────────────┴───┘
```

**B — L, deux ailes.**

```text
┌──────────────┬───────┐
│              │  ch1  │
│    séjour    ├─   ───┤
│              │couloir│
├──────  ──────┤  ┌────┤
│              │  │ch2 │
└──────────────┴──┴────┘
```

**C — mauvaise configuration : portes en vis-à-vis.**

```text
┌────  ────┐
│  ↓    ↑  │   ← deux battants sur le même
│ couloir  │      mètre carré : rien ne le
│  ↑    ↓  │      refuse aujourd'hui
└────  ────┘
```

## 11. Relations avec les autres pièces

| Relation | Niveau | Motif |
|---|---|---|
| ↔ chambres | `VERY_FAVORABLE` | c'est sa raison d'être : desservir sans traverser |
| ↔ WC, salle d'eau | `VERY_FAVORABLE` | desserte neutre des pièces de service |
| ↔ entrée | `VERY_FAVORABLE` | prolongement naturel |
| ↔ séjour | `FAVORABLE` | rattachement obligé dans le graphe actuel |
| ↔ cuisine | `NEUTRAL` | mais ne doit pas la traverser |
| ↔ autre circulation | **non demandé** | arbitrage du 21 août |
| Desserte de moins de deux espaces | `FORBIDDEN` | `TH2D-CIRC-002` |

La circulation est la pièce **la plus contrainte topologiquement et la moins
contrainte géométriquement** : son existence, sa longueur et sa largeur
découlent entièrement du graphe. C'est l'inverse de toutes les autres, et c'est
pourquoi elle est la seule dont le moteur sache déduire le besoin.

## 12. Contraintes techniques

```text
REQUIRED_SERVICES  electricite
```

Aucune contrainte humide. En revanche, c'est **le lieu naturel des gaines
verticales, du tableau électrique et des trappes de visite** : accessible sans
entrer dans une pièce privée, et sans consommer de surface habitable utile.

Le socle ne l'exprime pas — `local_technique` est un type distinct, non généré.
Rapprocher les deux serait un gain réel, et c'est le genre de relation que le
lot C-P3 devra trancher.

## 13. Réglementation française

| Point | Portée | Statut |
|---|---|---|
| Largeur des circulations intérieures ≥ 0,90 m | Arrêté du 24 décembre 2015, art. 11 — accessibilité | `VAL-PMR-009` — **vérifié** |
| Portes intérieures : 0,80 m nominal, 0,77 m utile | même arrêté | `VAL-PMR-007` / `008` — vérifié, **déjà tenu** |
| Espace de manœuvre de porte : 1,70 m en poussant, 2,20 m en tirant | même arrêté | `VAL-PMR-003` / `004` — vérifié, **non modélisé** |
| Demi-tour Ø 1,50 m | même arrêté | `VAL-PMR-001` — vérifié |
| Hauteur de seuil ≤ 0,02 m | même arrêté | `VAL-PMR-010` — hors 2D |

**Aucun texte n'impose de couloir**, ni de surface de circulation. Le plancher
simple de 0,90 m est réglementaire ; le passage à 1,20 m dès trois dessertes et
le maximum de 1,80 m sont doctrinaux, identifiés et justifiés.

Les espaces de manœuvre de porte (`VAL-PMR-003` et `004`) sont la contrainte
d'accessibilité la plus lourde de cette pièce et la plus ignorée : 1,70 m devant
une porte qu'on pousse, 2,20 m devant une porte qu'on tire. Un couloir de
1,20 m ne les offre pas.

## 14. Accessibilité

```text
SIZE_CLASS     MINIMAL | MEDIUM | LARGE
ACCESSIBILITY  STANDARD | ADAPTABLE | ACCESSIBLE
```

- `STANDARD` — 0,90 m en desserte simple, 1,20 m dès trois dessertes ;
- `ADAPTABLE` — c'est la circulation qui **porte** le statut évolutif : le
  logement évolutif se définit par un *cheminement accessible* jusqu'au séjour
  et au cabinet d'aisances (`VAL-PMR-022`). Ce cheminement passe par elle. La
  pièce est donc le support de la qualification, pas son objet ;
- `ACCESSIBLE` — largeur maintenue à 0,90 m minimum sur tout le parcours, aire
  de demi-tour Ø 1,50 m, et **espaces de manœuvre devant chaque porte**. C'est
  cette dernière exigence, pas la largeur, qui décide.

Point remarquable : la circulation est la seule pièce dont le mode `ACCESSIBLE`
demande **moins** de largeur minimale que le mode `STANDARD` du moteur — 0,90
contre 1,20. Ce n'est pas un paradoxe, c'est le signe que le seuil du moteur
n'est pas un seuil d'accessibilité mais un seuil de confort, mal nommé.

## 15. Critères de qualité spatiale

| Variable | Ce qu'elle capte ici |
|---|---|
| `service_ratio` | surface / besoin de desserte — **mesuré, gelé à 1,6** |
| `served_count` | nombre de pièces réellement desservies |
| `clear_width_min` | largeur libre minimale sur tout le parcours |
| `door_swing_conflicts` | débattements concurrents — non vérifié |
| `dead_end` | branche ne desservant rien |
| `path_length` | longueur du plus long trajet entrée → pièce |
| `natural_light` | second jour ou fenêtre en bout |

```text
dessert_moins_de_deux_espaces   = INVALID
largeur_sous_minimum            = INVALID
largeur_au_dela_de_1m80         = INVALID
longueur_par_desserte           = diagnostic         # seuil externe absent
deux_portes_en_vis_a_vis        = defavorable
couloir_aveugle_et_long         = defavorable
gaine_technique_accessible      = favorable
```

`TH2D-CIRC-004` publie la longueur, les mètres par desserte et la part de
circulation, mais n'en fabrique plus une conformité autoréférentielle. Le tri
peut minimiser cette grandeur continue ; sa réactivation comme règle attend un
corpus externe au moteur.

## 16. Synthèse

| Paramètre | Minimal | Moyen | Large |
|---|---:|---:|---:|
| Rôle | dégagement | couloir de desserte | hall, palier |
| Surface cible | 3 – 5 m² | **5 – 9 m²** | 9 – 14 m² |
| Largeur | 0,90 – 1,20 m | 1,20 m | 1,20 – 1,80 m |
| Pièces desservies | 2 – 3 | 4 – 5 | 6 + |
| Croisement | non | oui | oui |
| Rangement cédé | non | possible | oui |
| Formes | barre | barre, L | L, T |
| Plafond | 1,6 × besoin | idem | idem |
| Accessibilité | 0,90 m légal | manœuvres de porte | Ø 1,50 m + manœuvres |

## 17. Traduction TechnoHab

```text
ROOM_TYPE    CIRCULATION
FAMILY       DISTRIBUTION
ROLE         distribution
AGREMENT     0.6                 # majoré par ce qu'elle dessert
MIN_PROGRAM  3 / 0.90
CLEAR_WIDTH  0.90 simple · 1.20 dès 3 dessertes · max 1.80
TRIGGER      derived from desserte, minRooms 4      # le seul trigger réellement dérivé

REQUIRED_OBJECTS   aucun — la pièce est définie par son vide
OPTIONAL_OBJECTS   aucun

FUNCTIONAL_ZONES
- clear_path        largeur libre continue, exclusive
- door_swing        débattement de chaque porte desservie      # ACTIF, S3
- door_maneuver     1.70 en poussant / 2.20 en tirant, ACCESSIBLE  # MANQUANT

HARD_CONSTRAINTS
- dessert au moins deux espaces                     # ACTIF
- largeur libre ≥ minimum conditionné par degree()  # ACTIF
- largeur libre ≤ 1.80                              # ACTIF
- sens d'ouverture résolu par O3                    # ACTIF
- S3 : débattements compatibles avec usages         # ACTIF
SOFT_CONSTRAINTS
- longueur / desserte publiée                       # sans seuil externe
- portes décalées, jamais en vis-à-vis rapproché
- lumière naturelle en bout de parcours
- gaines et tableau accessibles depuis la circulation

PREFERRED_ADJACENCIES     bedroom, bath, wc, entree, living
FORBIDDEN_RELATIONS       desserte < 2, traversee(piece_habitee)
NOT_REQUESTED             circulation ↔ circulation   # arbitrage du 21 août

SIZE_CLASSES    MINIMAL | MEDIUM | LARGE
ACCESSIBILITY   STANDARD | ADAPTABLE | ACCESSIBLE
QUALITY_EXTRA   service_ratio, served_count, path_length
```

---

## Annexe — clôture C4 au 1er septembre 2026

La largeur conditionnée, la mesure branche par branche, les formes barre/L/T,
la terminaison à la dernière porte, les battants `S3` et l'entrée hébergée sont
branchés. Restent hors de C4 : les espaces de manœuvre accessibles, la lumière
naturelle en bout de parcours et le seuil externe de longueur par desserte.

Le banc `scripts/test-circulation-c4.mjs` prouve le canon, la frontière
0,90/1,20 m et les portes construites ; `test-circulation-coudee.mjs` prouve la
mesure par branche. Les témoins M5 continuent de couvrir la variété des formes
et les branches inutiles.

## Journal historique — audit du 26 août 2026

Les constats ci-dessous expliquent les décisions mais **ne décrivent plus
l'état courant** ; les points 1, 2, 3, 5, 6 et 7 ont été fermés entre O1 et
C-P2. Le point 4 reste différé au mode accessible.

**Ce que cette pièce fait mieux que toutes les autres.** Son plafond est
mesuré (1,6, 90e centile gelé), son critère d'existence est dérivé, sa règle de
qualité est active et calibrée, et son champ propre `clearWidth` est
effectivement lu — contrairement à `minimalRect` du WC et à `facingClearance`
de la cuisine. C'est le modèle à suivre, et il est déjà écrit.

**Audit mesuré du 26 août.** Les chiffres de cette annexe sont complétés par
[`DOCTRINE_CIRCULATION.md`](../DOCTRINE_CIRCULATION.md) §8, qui mesure 150
plans : part de circulation de **9,9 à 16,9 %**, couloir de **22,61 × 1,22 m à
250 m²**, `TH2D-CIRC-004` violée par 14 à 15 plans sur 15 au-delà de 60 m². Le
défaut n'est pas la largeur — tenue partout — mais la **longueur**, que rien ne
contraint, et le barème qui rend l'allongement rentable.

**Écarts :**

1. **le minimum `HARD` de 1,20 m rejette des plans conformes** — l'arrêté du
   24 décembre 2015 fixe 0,90 m, valeur `vérifié` dans la veille. Le moteur a
   durci le seuil P1 de 1,00 m au lieu de le conditionner. La correction est
   documentée et faisable : 0,90 m sous trois pièces desservies, 1,20 m au-delà,
   `degree()` étant déjà utilisé par `TH2D-CIRC-002`. Abaisser un seuil `HARD`
   laisse entrer des plans aujourd'hui refusés : à décider et à mesurer ;
2. **les trois niveaux de passage ne sont pas modélisés** — 0,60
   contournement, 0,90 traversant, 1,20 croisement. Le séjour et la cuisine
   réclament la même échelle de leur côté ; **trois profils, un seul
   mécanisme** : un champ `passage` gradué, et non un seuil par pièce ;
3. **les débattements de porte ne sont pas modélisés** — dans la pièce qui les
   reçoit tous. Quatre portes peuvent s'ouvrir sur le même mètre carré sans
   qu'aucune règle ne s'en émeuve. C'est `S3`, lot M2 ;
4. **les espaces de manœuvre de porte n'existent pas** — 1,70 m en poussant,
   2,20 m en tirant. C'est la contrainte d'accessibilité la plus lourde de la
   pièce, et un couloir de 1,20 m ne l'offre pas ;
5. **la pénalité de ratio frappe les couloirs à tort** — un couloir est allongé
   par définition. Le défaut est connu, mesuré et **conservé sciemment** : le
   plan de référence dessiné à la main obtient 15,05 points de pénalité,
   entièrement imputables au ratio de son dégagement de 1,30 × 5,50 m, et
   l'exemption a été écrite, mesurée, puis retirée parce qu'elle faisait passer
   les pièces non meublables de 4 à 12. La cause profonde est que
   `scoreCandidate()` s'exécute **avant** la cession de bandes ; la corriger
   demande de revoir la boucle, ce qui est l'objet du lot M2 ;
6. **l'entrée n'est pas un type généré** — `C5` fixe la largeur d'une pièce
   d'entrée à 1,20 m, inapplicable tant qu'`entree` reste `trigger: null`.
   C'est le lot C-P2, et il devra trancher : l'entrée est-elle une circulation
   qualifiée ou une pièce à part ?
7. **la cession de bandes ignore l'agrément du receveur** — écart partagé avec
   tous les profils précédents, inscrit au lot O1.
