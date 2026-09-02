# La circulation — ce qu'on en exige, et pourquoi c'est faux

**Ouvert le 19 août 2026.** Cadre l'arbitrage signalé par le chantier 6 :
`buildProgram()` alloue à la circulation une surface que `TH2D-CIRC-004`
réprouve, sur 22 configurations du banc sur 23. Ce document établit d'où
viennent les deux valeurs, ce que la mesure en dit, et ce qui reste à
trancher. **Il ne modifie rien.**

Il ne relève pas du chantier 7 : rien n'y ajoute de pièce, et la condition
d'entrée de la phase 12 b — la mesure à l'aveugle — n'est donc pas engagée.
C'est un désaccord entre deux paramètres déjà en production.

---

## 1. Les deux valeurs en conflit

| | valeur | où | origine |
|---|---|---|---|
| plafond | circulation ≤ **10 % du plan** | `TH2D-CIRC-004`, `rules.js` | « référentiel d'origine » (`MODELE_DE_CALCUL.md`) |
| plancher | **1,20 m × pièces desservies × 0,95** | `buildProgram()`, `generator.js` | calculé depuis la largeur minimale |
| allocation | plancher **+ part du surplus au prorata du poids** | `buildProgram()` | poids d'agrément 0,6 + 0,22 par pièce desservie |

La largeur, elle, est sourcée et opposable : l'arrêté du 24 décembre 2015
(art. 11) fixe 0,90 m, le moteur retient 1,20 m — le seuil de croisement de
deux personnes. Ce point est réglé, il n'est pas l'objet de ce document.

## 2. Le seuil de 10 % n'a pas de source

`MODELE_DE_CALCUL.md` le classe explicitement « référentiel d'origine », et
`agencement/technohab_rules.md` le fait remonter au jeu de règles hérité
(`P1`, en GUIDELINE). Aucune fiche d'agencement ne le justifie, aucune veille
normative ne le reprend. Il n'est adossé à rien.

**Une recherche a été menée pour lui trouver une source ; elle a trouvé autre
chose.** Les chiffres disponibles — 11 à 15 % d'un plateau, 20 % au maximum —
portent sur les **circulations communes d'un immeuble** : halls d'ascenseur,
escaliers, coursives. Pour la circulation *intérieure d'un logement*, la
littérature consultée ne donne pas de fraction ; elle raisonne en qualité de
parcours, pas en pourcentage.

L'ordre de grandeur du seuil hérité coïncide de près avec celui des parties
communes d'immeuble. **L'hypothèse la plus économique est donc qu'un ratio
d'immeuble a été appliqué à un logement.** Elle n'est pas démontrée, mais
aucune source ne vient la contredire, et le classement « référentiel
d'origine » va dans son sens.

Consulté le 19 août 2026, sans qu'aucune fraction applicable à l'intérieur
d'un logement en ressorte :

- circulations communes d'immeuble, 11–15 % d'un plateau, 20 % au maximum —
  <https://www.quora.com/How-much-circulation-percentage-should-a-residential-building-have>,
  fiabilité faible, retenu seulement pour l'ordre de grandeur et la
  **nature** de la grandeur ;
- ratio de 15 à 20 % pour estimer les circulations communes en surface utile
  — <https://ekinov.fr/comment-calculer-la-surface-dun-logement-dun-bureau-dun-commerce-et-dun-centre-medico-social/> ;
- traitement de la circulation intérieure d'une maison **en qualité de
  parcours et non en pourcentage** —
  <https://buildingadvisor.com/design/floor-plans/circulation-key-to-a-successful-floor-plan/>.

Une absence de source n'est pas une preuve que le seuil est faux. C'est la
mesure du §3 qui l'établit ; la recherche établit seulement qu'**on ne peut
pas le défendre en le sourçant**.

## 3. Ce que la mesure établit

Banc à graine fixe 20260818, 24 configurations × 30 tirages, forme rectangle,
base du 19 août (murs épais compris).

### 3.1 — La règle est infaisable sur les petits logements

Le **minimum de desserte** est ce que la circulation doit mesurer pour
desservir ce qu'elle dessert. C'est un calcul, pas une convention.

| configuration | minimum | part du plan | seuil 10 % | verdict |
|---|---|---|---|---|
| 40 m², 1 ch | 4,56 m² | **11,4 %** | 4,00 m² | infaisable |
| 55 m², 2 ch | 5,70 m² | **10,4 %** | 5,50 m² | infaisable |
| 75 m², 2 ch | 5,70 m² | 7,6 % | 7,50 m² | tenable |
| 120 m², 4 ch | 9,12 m² | 7,6 % | 12,00 m² | large |
| 250 m², 5 ch | 10,26 m² | **4,1 %** | 25,00 m² | sans effet |

Sous 55 m², **le strict nécessaire dépasse déjà le plafond**. Aucun plan, si
bien dessiné soit-il, ne peut satisfaire la règle : elle ne signale pas un
défaut, elle signale une surface. C'est ce qui explique le 30/30 de la
configuration 40 m².

À l'autre bout, à 250 m², le plafond vaut 25 m² pour un besoin de 10,26 : la
règle ne peut plus rien attraper. **Elle est simultanément trop sévère et
trop laxiste, et pour la même raison** — elle indexe sur la surface une
grandeur qui dépend du nombre de pièces.

### 3.2 — Le moteur, lui, fait déjà le bon travail

Le rapport entre la circulation **finie** et le minimum de desserte reste
proche de 1 sur toute la gamme :

| configuration | alloué | final | final / minimum |
|---|---|---|---|
| 75 m², 2 ch | 8,70 | 5,38 | **0,94** |
| 100 m², 3 ch | 11,09 | 7,79 | **0,98** |
| 110 m², 3 ch | 11,19 | 6,85 | **1,00** |
| 180 m², 5 ch | 19,10 | 15,48 | 1,51 |
| 220 m², 5 ch | 23,01 | 16,31 | 1,59 |

Sur les 690 plans du banc qui comportent une circulation :

- **médiane du rapport final / minimum : 1,00** — dans la moitié des cas, la
  circulation finie vaut exactement ce que la desserte exige ;
- **57 % des plans** sont retombés au minimum, à 5 % près ;
- étendue de 0,68 à 2,46 : la queue existe, mais elle est une queue.

L'allocation est généreuse, et `carveCirculation()` en rend l'essentiel aux
pièces longées — à 75 m², 3,3 m² repartent au logement. **La cession
fonctionne**, et le commentaire qui la justifie dans `buildProgram()` est
vérifié : le créneau large sert à produire des rangements, pas à faire un
couloir large.

Autrement dit, quand `TH2D-CIRC-004` se déclenche, ce n'est le plus souvent
pas parce que le moteur a produit un couloir superflu.

### 3.3 — La règle attrape le contraire de ce qu'elle vise

Les deux mesures se croisent, et le croisement est le cœur du dossier :

| | 40–55 m² | 180–220 m² |
|---|---|---|
| circulation au-delà du besoin (final / minimum) | **1,00 – 1,07** | **1,51 – 1,59** |
| plans épinglés par le seuil de 10 % | **28 à 30 sur 30** | 19 et 11 sur 30 |

**Là où le moteur est le plus économe, la règle sanctionne le plus.** Là où
il laisse réellement une demi-fois trop de couloir, elle en laisse passer une
bonne partie. Ce n'est pas un réglage à corriger, c'est un indicateur qui
pointe à l'envers.

Au total, 190 plans sur 690 (27,5 %) dépassent le plafond.

### 3.4 — L'allocation dérive sur les grandes surfaces

| configuration | minimum | alloué | alloué / minimum |
|---|---|---|---|
| 40 m², 1 ch | 4,56 | 4,79 | 1,05 |
| 90 m², 3 ch | 6,84 | 10,23 | 1,50 |
| 250 m², 5 ch | 10,26 | 25,95 | **2,53** |

La circulation reçoit une part du surplus proportionnelle à son poids
d'agrément, donc **croissante avec la surface** — alors que son besoin, lui,
suit le nombre de pièces. À 250 m², on lui alloue deux fois et demie ce
qu'elle demande.

C'est sans conséquence sur le plan fini, la cession reprenant le surplus.
Mais ce n'est pas gratuit : la découpe travaille sur un créneau qu'elle devra
défaire, et le poids d'agrément affirme qu'un mètre carré de couloir en plus
apporte 0,6 — davantage qu'un WC (0,5), dont le code dit pourtant qu'« un WC
plus grand n'apporte rien ». **Un couloir plus grand n'apporte rien non
plus**, en tant que couloir.

## 4. Diagnostic

**La règle mesure la mauvaise grandeur.** La question pertinente n'est pas
« quelle fraction du plan la circulation occupe-t-elle », mais « combien de
couloir au-delà de ce que la desserte exige ». La première dépend de la
surface, la seconde du programme — et c'est la seconde qui décrit un défaut.

C'est la même figure qu'au chantier 6 : un critère qui condamne des plans
corrects. Là, la peine de proportion reprochait à un couloir d'être allongé ;
ici, le plafond reproche à un petit logement d'être petit.

## 5. Proposition, à arbitrer

**Remplacer la fraction par un multiple du besoin calculé :**

> `TH2D-CIRC-004` — la circulation ne dépasse pas **k fois le minimum de
> desserte**, `minimum = 1,20 m × pièces desservies × 0,95`.

Ce que cela change :

- la règle devient **faisable partout**, puisqu'elle est relative à ce que le
  programme exige ;
- elle redevient **mordante sur les grandes surfaces**, où le plafond de 10 %
  ne servait plus à rien ;
- elle est **calculée, non décrétée** — la doctrine du projet, déjà appliquée
  aux poids et aux minimums composés.

`k` se calibre sur la distribution du §3.2, pas au jugé. Le script publie les
quantiles du rapport final/minimum, mesurés sur les 690 plans du banc :

| médiane | q75 | q90 | q95 | q99 | max |
|---|---|---|---|---|---|
| 1,00 | 1,27 | 1,59 | 1,78 | 2,17 | 2,46 |

Ce que vaudrait chaque choix, en part de plans signalés :

| `k` | quantile | plans signalés | lecture |
|---|---|---|---|
| 1,3 | ≈ q75 | un sur quatre | trop bavard pour un conseil |
| **1,6** | ≈ q90 | **un sur dix** | signale la queue sans noyer le rapport |
| 1,8 | ≈ q95 | un sur vingt | ne retient que les cas francs |

**Un avertissement qui vaut plus que le choix lui-même.** Ces quantiles
décrivent ce que le moteur produit *aujourd'hui*, pas ce qu'un habitant
tolère. Un plafond calibré ainsi est **auto-référentiel** : si le moteur
s'améliore, le quantile baisse et la règle durcit sans raison ; s'il se
dégrade, elle s'assouplit d'autant. Une règle qui suit ce qu'elle est censée
juger ne juge plus rien.

Deux conséquences, à tenir :

- `k` doit être **figé une fois** et pré-enregistré, jamais recalculé à
  chaque version — c'est la discipline déjà retenue pour les mesures du
  chantier 6 ;
- il reste un **pis-aller** en attendant une grandeur qui décrive l'usage. La
  bonne référence serait un corpus de plans réels passés au même calcul :
  quel rapport circulation/desserte présentent des logements que des gens
  habitent ? Le chemin existe déjà — `assemblerPlan()`, écrit pour le test de
  l'instrument, sait faire passer un plan dessiné à la main dans le moteur.
  Dix plans réels suffiraient à remplacer un quantile de moteur par une
  mesure de logements.

Il reste à trancher :

1. **la valeur de `k`**, avec le quantile qui la justifie écrit ici même, et
   la date de son gel ;
2. **le niveau** — conseil, comme aujourd'hui, ou bloquant ? Un couloir
   pléthorique est un défaut réel, mais deux choses l'interdisent
   aujourd'hui. La première est qu'un `k` non éprouvé ferait échouer des
   plans sur un seuil neuf. La seconde est plus dirimante, et elle a déjà été
   payée une fois :

   > **`scoreCandidate()` ne contient aucun critère sur la surface de
   > circulation.** Vérifié ligne à ligne : le score pénalise la largeur
   > insuffisante et la desserte pauvre, rien d'autre. `TH2D-CIRC-004` est
   > donc une règle que la recherche **ne voit pas**.

   C'est exactement la configuration de `TH2D-FACADE-001` avant le chantier
   5 : une règle bloquante absente du score, que la recherche ne pouvait pas
   arbitrer — 39 violations, tombées à **2** le jour où elle y est entrée.
   Rendre `TH2D-CIRC-004` bloquante sans l'inscrire d'abord au score
   reproduirait la même faute, avec le même résultat : des plans refusés que
   le moteur n'avait aucun moyen d'éviter.

   **L'ordre est donc contraint** : figer `k`, l'inscrire dans
   `scoreCandidate()`, mesurer — et seulement ensuite discuter du niveau ;
3. **le poids d'agrément de la circulation** — le ramener au niveau du WC, ou
   le rendre indépendant de la surface. Sans effet sur le plan fini, mais il
   ferait travailler la découpe sur un créneau plus juste. À mesurer
   séparément : c'est le genre de changement qui déplace l'empreinte du banc
   sans qu'on sache lequel des deux effets on observe.

## 5 bis. Arbitrages rendus le 19 août, et ce qu'ils ont donné

### `k` = 1,6, règle réécrite, critère inscrit au score

Le plafond de 10 % de la surface est remplacé par **1,6 fois le minimum de
desserte**, et `TH2D-CIRC-004` entre dans `scoreCandidate()` — elle n'y était
pas, ce qui la rendait inarbitrable par la recherche, exactement comme
`TH2D-FACADE-001` avant le chantier 5.

Ce qui est pénalisé n'est pas le créneau mais la surface **prévisible après
cession**, calculée avec la formule de `carveCirculation()`. Le créneau
généreux est préservé : c'est de lui que naissent les bandes de rangement.

Effet propre, mesuré à graines fixes en neutralisant la seule pénalité dans
le même processus — 24 configurations, 720 plans :

| | sans la pénalité | avec |
|---|---|---|
| `TH2D-CIRC-004` | 56 | **50** |
| `TH2D-FACADE-001` (HARD) | 2 | **1** |
| `TH2D-ROOM-002` (HARD) | 49 | **49** |
| pièces dotées d'un rangement | 871 | **898** |

Aucune violation bloquante créée, et les rangements **augmentent** : la
crainte que la cession pâtisse de la pénalité était infondée. Le gros du gain
vient de la règle elle-même — 190 violations sous l'ancien seuil, 56 sous le
nouveau.

Garde-fou retenu : aucune pénalité quand le programme ne tient pas dans la
surface. Sur un plan saturé toutes les pièces sont déjà compressées, et une
exigence de confort n'y déplace que la misère.

> **Une leçon de méthode, payée une fois.** Une régression de `TH2D-ROOM-002`
> — 0 à 48 — a d'abord été imputée à cette pénalité. Elle n'en venait pas :
> neutralisée dans le même processus, à graines identiques, elle donne 43
> violations comme sans elle. Elles venaient du chantier des murs épais, mené
> en parallèle sur la même base. **Comparer deux passages successifs du banc
> ne prouve rien quand un autre chantier écrit dans la même base** : seule la
> comparaison à processus unique, un changement activé puis neutralisé,
> établit une causalité.

### Le mono-bloc : le verrou est dans la découpe, pas dans le programme

Le vrai grief n'était pas la quantité de circulation mais **sa forme** : une
seule pièce, quelle que soit la surface — 250 m² et onze pièces recevaient le
couloir unique d'un 45 m². Toutes les adjacences pointaient vers ce hub : le
plan était un graphe en étoile par construction.

**Levé côté programme.** `buildProgram()` produit N circulations, le graphe
est passé d'étoile à réseau — chaîne entre circulations, pièces réparties en
tranches contiguës — et `carveCirculation()` les traite toutes. Deux
circulations apparaissent dès 100 m².

**Le seuil a été calibré par le plan de référence, pas au jugé.** La valeur de
départ — quatre dessertes par circulation — a été refusée par
`test-instrument.mjs` : le T3 dessiné à la main dessert **cinq** espaces avec
un seul dégagement. À 4, le moteur aurait exigé deux dégagements là où les
règles de l'art n'en demandent qu'un.

**Mais la géométrie ne suit pas.** Banc complet, drapeau activé :

| | 1 circulation | N circulations |
|---|---|---|
| `TH2D-CIRC-001` (HARD) | 0 | **55** |
| `TH2D-FACADE-001` (HARD) | 1 | **30** |
| `TH2D-ROOM-002` (HARD) | 49 | **58** |
| `TH2D-ROOM-001` (conseil) | 489 | 391 |
| circulations non reliées entre elles | — | **42,5 %** |

Une amélioration de conseil contre trois règles bloquantes dégradées, et près
d'un plan sur deux dont les dégagements ne communiquent pas.

**La cause est la découpe en guillotine** : elle ne sait pas garantir
l'adjacence de deux pièces désignées, ni leur conserver une largeur
praticable une fois la surface partagée. Poser les circulations consécutives
plutôt qu'à intervalles a été essayé, sur l'idée que la coupe les rendrait
mitoyennes — **71,7 % de disjonction, pire encore** : être de part et d'autre
d'une coupe ne rapproche pas deux pièces quand chaque tranche est ensuite
redécoupée pour son compte.

**Décision** : `CIRCULATIONS_MULTIPLES = false`. Empreinte du banc inchangée
— `520b8ebb`, identique à avant le lot.

> **Périmé depuis le 20 août.** Cette décision s'accompagnait de « le
> mécanisme reste en place, mesuré, avec ses chiffres inscrits à côté du
> drapeau ». Le drapeau et le mécanisme ont été **retirés** le lendemain
> (§5 ter) : vérification faite, `CIRCULATIONS_MULTIPLES` n'apparaît nulle
> part dans le code. Le compte rendu ci-dessus reste valable comme
> historique ; il ne décrit plus l'état.

**Ce qui débloquerait la suite**, et c'est un chantier de découpe, pas de
programme : savoir tenir une adjacence demandée entre deux pièces. Tant que
la guillotine ne le sait pas, multiplier les circulations produira des
réseaux rompus.

## 5 ter. La cause racine, trouvée le 20 août — et c'est là qu'il faut reprendre

Deux tentatives ont échoué à produire plusieurs circulations. La seconde a
révélé pourquoi, et la réponse ne concerne pas la circulation.

**Tentative 1 — le programme en crée N.** Trois règles bloquantes dégradées,
42,5 % de dégagements qui ne se touchent pas. Retirée.

**Tentative 2 — partager géométriquement la circulation.** Techniquement
réussie : deux espaces adjacents par construction, zéro disjoint, 480 plans
sur 720. Mais **c'était le même couloir coupé en deux** : aucune desserte
nouvelle, une cloison ajoutée là où un dégagement est continu, et une pièce
de plus au modèle pour rien. Retirée aussi.

Son effet propre, mesuré à graines fixes en l'activant puis en la neutralisant
dans le même processus — la seule méthode qui établisse une causalité ici :

| | sans | avec |
|---|---|---|
| plans à plusieurs circulations | 0 / 720 | 480 / 720 |
| `TH2D-ROOM-001` (conseil) | 489 | **708** |
| `TH2D-ROOM-002` (HARD) | 49 | 49 |
| `TH2D-FACADE-001` (HARD) | 1 | 1 |
| pièces dotées d'un rangement | 898 | 898 |

Aucune règle bloquante dégradée — la méthode était saine de ce côté, et c'est
ce qui la distinguait de la tentative 1. Mais **+219 signalements de surface
sous le minimum** : chaque moitié de couloir hérite d'une exigence que sa
part de surface ne couvre plus. Le coût était donc réel, en plus d'être
inutile.

### Ce que la seconde tentative a mis au jour

`TH2D-GRAPH-001` — « adjacences desservies » — est classée **limite connue**
depuis le 15 août, donc silencieuse au rapport. Son motif, déjà écrit dans
`rules.js` :

> « La découpe ne consulte pas le graphe : les adjacences sont favorisées par
> le score, jamais garanties par construction. » — 206 manquements sur 360
> plans.

Mesuré sur la base du 20 août, 1 170 pièces, hors séjour et circulations :

| | |
|---|---|
| pièces sans contact avec une circulation | **13,1 %** |
| pièces sans porte vers une circulation | **19,4 %** |
| dont chambres | 59 |
| dont salles d'eau et WC | 16 |

Les cuisines n'y sont pas comptées comme un défaut : elles ouvrent
légitimement sur le séjour, c'est le programme qui le demande.

**La desserte par traversée d'une autre pièce est donc la règle, pas
l'exception** — une chambre sur laquelle on débouche depuis une autre chambre
n'est pas une chambre.

### Pourquoi multiplier les circulations ne pouvait pas marcher

Tout remonte à la même cause. La découpe en guillotine ne consulte pas le
graphe : elle produit des rectangles et **espère** que les adjacences
demandées tombent juste, le score se contentant de favoriser celles qui
tombent. Elle ne peut donc ni garantir qu'une chambre borde un couloir, ni
qu'un couloir en borde un autre.

Ajouter des circulations à un moteur qui ne sait pas les faire border par ce
qu'elles desservent revient à multiplier des espaces sans desserte.

### La reprise

**Arbitrage rendu le 20 août** : l'exigence « chaque pièce touche une
circulation » est **conservée** — elle est juste, une chambre doit ouvrir sur
un dégagement. C'est la découpe qui est en faute.

Le chantier est donc : **piloter la découpe par le graphe** plutôt que de lui
faire espérer les adjacences. `APPROCHES_GENERATION.md` en décrit les pistes
— découpe pilotée par le graphe, ou typologies. C'est le verrou de tout le
reste : les circulations multiples, la desserte réelle, et la crédibilité du
plan en dépendent.

Rien n'est en attente dans le code : les deux tentatives ont été retirées, il
n'y reste ni drapeau éteint ni fonction morte.

> **Instruit le 21 août 2026** —
> [`DECOUPE_ET_GRAPHE.md`](DECOUPE_ET_GRAPHE.md). Le diagnostic ci-dessus est
> confirmé et précisé sur un point qui change l'ordre des travaux : la
> découpe n'ignore pas le graphe, elle en encode une version figée, et **la
> moitié de cet encodage dessert le résultat**. `hubSplit()` rend 3,7 points
> de desserte ; le peigne en **coûte** 2,1, à diversité identique et pour
> 14 % de temps en plus.
>
> **Le peigne a été retiré le 21 août 2026**, banc complet à l'appui : aucune
> règle bloquante dégradée, `TH2D-ROOM-002` de 49 à 45, `TH2D-FACADE-001` de
> 1 à 0. Seul `TH2D-CIRC-004` — un conseil, et précisément celui que ce
> dossier a calibré — se dégrade, de 50 à 74. Empreinte `520b8ebb` →
> **`5bd33591`** : les chiffres du présent dossier antérieurs à cette date se
> rapportent tous à l'ancienne empreinte.

## 6. Ce qu'il ne faut pas faire

- **Abaisser l'allocation pour faire passer la règle.** Déjà mesuré et
  documenté dans `buildProgram()` : plafonner le créneau dégrade les
  adjacences plus qu'il ne réduit la largeur, et la cession fait mieux le
  travail.
- **Remonter le seuil à 12 ou 15 %.** On remplacerait un chiffre sans source
  par un autre, en gardant le défaut de fond : l'indexation sur la surface.
- **Rétrograder ou retirer la règle.** Une circulation pléthorique reste un
  défaut. `rules.js` a déjà la bonne doctrine pour ce cas : nommer la limite
  plutôt que déclasser l'exigence.

## 7. État

> **Partiellement périmé — voir le §8, audit du 26 août 2026.** Le squelette et
> le passage de `faconner` à `false` ont changé la découpe depuis. Les 13,1 % de
> pièces sans contact et les 19,4 % sans porte ne se reproduisent plus ; en
> revanche `k = 1,6`, donné ci-dessous comme tenu, est aujourd'hui violé par la
> quasi-totalité des plans.

**État au 20 août.** `TH2D-CIRC-004` est réécrite (k = 1,6) et inscrite au
score. Empreinte du banc `520b8ebb`, quinze tests au vert.

**Le logement n'a qu'une circulation, et rien dans le code n'attend de
l'activer.** La phrase « le mécanisme des circulations multiples est écrit
mais inactif », portée ici jusqu'au 20 août, contredisait le §5 ter et
laissait croire à un interrupteur qu'il suffirait de basculer. Vérifié :
`buildProgram()` appelle `createRoom('circulation')` **une fois**, sans
boucle ni drapeau ; les deux tentatives ont bien été retirées. Ce qui
subsiste — le partage de tranche, la cession du surplus — est écrit au
pluriel par simple généralité et ne produit jamais de seconde circulation.

Le graphe demandé reste donc une étoile. Le verrou n'est pas là : c'est la
découpe en guillotine, qui ne consulte pas le graphe et se contente
d'espérer les adjacences (§5 ter). Tant qu'elle ne sait pas faire border une
chambre par un couloir, ajouter des couloirs ne fait qu'ajouter des espaces
sans desserte — 13,1 % des pièces sans contact avec une circulation,
19,4 % sans porte vers l'une.

Mesure rejouable :

```bash
node technohab/scripts/diagnostic-circulation.mjs
```

Suite attendue : arbitrer les trois points du §5, puis mesurer avant/après à
graine fixe, et consigner dans `SUIVI_REGLES_PIECES.md`.

**Le meilleur usage de ce dossier serait de rendre son §5 caduc** : dix plans
réels passés par `assemblerPlan()` donneraient la grandeur que ni le
référentiel d'origine ni les quantiles du moteur ne fournissent. C'est le même
corpus que réclame déjà la mesure de discrimination du
[`PROTOCOLE_MESURES.md`](PROTOCOLE_MESURES.md) — un seul travail de collecte
servirait les deux.

## 8. Audit du 26 août 2026 — la longueur, pas la largeur

**150 plans, dix configurations, quinze graines fixes chacune.** Cet audit est
postérieur au squelette et au passage de `faconner` à `false` : il décrit un
moteur que les sections 1 à 7 ne décrivent plus.

### 8.1 — Ce que le moteur fait bien, et qu'il faut cesser de discuter

| Critère | Mesure |
|---|---|
| Adjacences demandées réalisées | **100 %** — 0,0 manquante sur 10 au banc M0 |
| Pièces atteintes par le parcours | **100 %** sur les dix configurations |
| Largeur de circulation | 1,20 – 1,22 m ; jamais sous le minimum, jamais au-dessus de 1,80 |
| Portes | 0,83 m de baie, 0,77 m de passage utile — `VAL-PMR-007` et `008`, partout |
| Battant ouvrant vers la pièce desservie | tenu **par construction**, jamais violé |
| Seuil de desserte | 1,00 m de contact ; une adjacence de 24 cm ne compte plus |

Les 13,1 % de pièces sans contact avec une circulation et les 19,4 % sans porte,
relevés au §7 le 20 août, **ne se reproduisent pas** : le squelette pose la
circulation d'abord et loge les pièces dans ses poches. Il est retenu sur 15
tirages sur 15 au-delà de 60 m². C'est le seul endroit du moteur où la
géométrie découle d'une fonction plutôt que d'une surface, et il fonctionne.

### 8.2 — Le défaut a changé de nature

Le §5 discutait d'une circulation **pléthorique en surface**, indexée sur la
surface du logement. Ce n'est plus le sujet. Mesuré :

| Logement | Circulation | Besoin | Ratio | Rectangle utile |
|---|---:|---:|---:|---|
| 90 m² | 17,79 m² | 6,84 | **2,60** | en L, deux parties |
| 130 m² | 15,07 m² | 7,98 | 1,89 | **13,70 × 1,20** |
| 180 m² | 20,17 m² | 10,26 | 1,97 | **18,28 × 1,20** |
| 250 m² | 25,30 m² | 10,26 | 2,47 | **22,61 × 1,22** |

**La largeur est parfaitement tenue par deux règles `HARD`. La longueur n'est
contrainte par rien.** Un couloir de 22 mètres dans une maison de 250 m² n'est
pas une circulation surdimensionnée : c'est une circulation qui n'a jamais eu
de raison de s'arrêter.

Part de la circulation dans le plan : **9,9 à 16,9 %** selon la configuration.
C'est la grandeur que le §2 cherchait sans source, et aucun banc ne la sort
aujourd'hui.

### 8.3 — La cause racine est dans le barème, et elle est rationnelle

Le score pénalise une **adjacence manquée 110 points**, et un **mètre carré de
circulation au-delà du plafond 8 points**.

Allonger le couloir d'un mètre coûte 1,2 m² × 8 = **9,6 points**, et peut
sauver une adjacence à **110**. L'allongement est donc toujours rentable — et
il le reste onze fois de suite.

Le moteur n'a pas un défaut de circulation : **il a exactement le comportement
que son barème récompense.** Les 100 % d'adjacences du §8.1 sont *payés* par
ces 22 mètres, et rien dans le score ne dit que le prix est excessif. C'est le
même mécanisme que le §5 ter avait identifié pour la découpe, déplacé d'un
cran : ce n'est plus la géométrie qui échoue, c'est la fonction objectif qui
demande ce résultat.

### 8.4 — `TH2D-CIRC-004` est devenue du bruit

**Violée par 14 à 15 plans sur 15 au-delà de 60 m²**, jamais en dessous. Ratios
réels relevés : 1,89 à 2,94, pour un plafond fixé à 1,6.

Le `k = 1,6` du §5 bis a été calibré au 90e centile **le 19 août, sur une
découpe qui n'existe plus** : le squelette et `faconner: false` sont arrivés
depuis. La valeur était mesurée ; elle ne l'est plus, parce que ce qu'elle
mesurait a changé.

Une `GUIDELINE` violée par 100 % des plans ne départage plus rien. Elle occupe
75 % du rapport de plan sans rien trancher — **le deuxième poste de bruit du
banc**, après `TH2D-RANGEMENT-003` et ses 92 %, et pour la même raison : une
valeur gelée dont le mécanisme sous-jacent a bougé.

Le §6 interdit de « rétrograder ou retirer la règle », et cet interdit reste
juste : une circulation pléthorique est un défaut. Mais il ne dit rien du cas
présent — une règle dont le seuil a cessé d'être mesuré. **Recalibrer n'est pas
rétrograder.**

### 8.5 — Une seule circulation, et pas de ramification

`DESSERTES_PAR_COULOIR = 5` fait demander trois circulations à 250 m² ;
`poserParSquelette()` force `couloirsMax: 1`. Le programme et le poseur ne
parlent pas de la même chose, et le poseur gagne : **onze dessertes sur un
couloir unique**.

Le §7 disait « le logement n'a qu'une circulation, et rien dans le code
n'attend de l'activer ». C'est toujours vrai, et l'audit ajoute pourquoi ce
n'est plus le bon angle : le problème n'est pas le **nombre** de circulations
mais l'absence de **ramification**. La famille `T`, qui offre trois poches, est
retenue **une fois sur quinze** à 180 et à 250 m² ; la barre domine partout.
Le moteur allonge au lieu de se ramifier, parce que la barre réussit en premier
et que rien ne la pénalise.

### 8.6 — Ce que la circulation ne sait toujours pas

- **le parcours est calculé sans mobilier** — `parcours.avecMobilier: false`.
  On vérifie qu'on atteint chaque pièce **dans un plan vide** ; `S4` reste non
  évaluée ;
- **les débattements ne sont pas modélisés dans la pièce qui les reçoit tous.**
  À 250 m², dix portes s'ouvrent sur un couloir de 22 m sans aucun contrôle de
  concurrence. C'est `S3`, lot M2 ;
- **les espaces de manœuvre de porte n'existent pas** — 1,70 m en poussant,
  2,20 m en tirant (`VAL-PMR-003` et `004`). Un couloir de 1,20 m ne les offre
  pas ;
- **les trois notions de passage ne sont pas distinguées** — 0,60
  contournement, 0,90 traversant, 1,20 croisement. Le minimum `HARD` de 1,20
  rejette des plans conformes à l'arrêté du 24 décembre 2015, qui fixe 0,90 m ;
- **l'entrée n'est pas une pièce.** Elle débouche directement sur la
  circulation — correct — mais `C5`, qui fixe la largeur d'une pièce d'entrée à
  1,20 m, reste inapplicable, et aucun sas n'est possible.

### 8.7 — Ce qu'il faut faire, dans cet ordre

**Le levier n'est pas une règle de plus, c'est le barème.** Tant qu'une
adjacence vaut 110 et un mètre carré de couloir 8, aucune contrainte de
longueur ne tiendra : le moteur préférera toujours payer.

1. **Pénaliser la longueur, pas la surface.** Le ratio surface / besoin ne
   distingue pas un couloir large d'un couloir long, alors que le premier
   n'arrive jamais et le second toujours. La grandeur qui vise juste est la
   longueur rapportée au besoin de desserte.
   **Pilotage :** lot **M3.0** de [`ROADMAP.md`](ROADMAP.md) §6.0 (levier L2
   d’agrément) — prérequis de M3.
2. **Recalibrer `TH2D-CIRC-004` sur la découpe actuelle, ou la suspendre.**
   Elle ne peut pas rester dans cet état. Recalibrer suppose de rejouer la
   mesure du §5 bis sur le squelette — même méthode, nouvelle base.
3. **Faire émerger le `T` sur les grands programmes**, non en l'imposant mais
   en pénalisant la barre au-delà d'une certaine longueur — ce qui revient au
   point 1, et c'est pourquoi il vient en premier.
4. **Sortir la part de circulation au banc.** 9,9 à 16,9 % aujourd'hui, et
   personne ne le sait. C'est la mesure de qualité de cette pièce ; sans elle,
   les trois points précédents ne seront pas vérifiables.

**Ce qui rendrait ce dossier caduc reste ce que disait le §7** : dix plans
réels mesurés donneraient la part de circulation qu'aucun quantile interne ne
peut fonder. L'audit ne change pas cette conclusion — il la rend plus urgente,
puisqu'on sait désormais que le seuil actuel ne mesure plus rien.

> **Instruit le 27 août 2026 — voir le §9.** Les points 1 et 3 ci-dessus
> supposent une grandeur que le moteur ne sait pas écrire : la longueur d'un
> parcours n'est pas une cote de pièce, et la ramification n'en est pas une
> non plus. L'audit du §9 établit que le champ qui les porte est déjà calculé
> à chaque plan — puis détruit à la sortie de `cheminement()` — et pose
> l'ordre des travaux qui le rendrait mesurable.

### 8.8 — Rejouer cet audit

```bash
npm run technohab:validate     # porte A : 18 tests, O0, banc de 360 plans
node technohab/scripts/diagnostic-circulation.mjs
```

Les chiffres du §8.2 et du §8.5 ont été relevés par instrumentation temporaire.
**Ils doivent être versés dans un script de mesure versionné avant d'être
opposables**, comme l'a été le constat du chantier 9 par `measure-o0.mjs` — la
même prudence, pour la même raison : la mesure du 19 août a été périmée par un
changement de découpe sans que personne s'en aperçoive pendant six jours.

## 9. Audit du 27 août 2026 — la circulation comme calque, et non comme pièce

**Question posée** : et si la circulation n'était pas une pièce, mais **une
seule entité parcourable, posée comme un calque** — le négatif des murs, des
équipements et des règles de passage qui s'y attachent ?

Cet audit relit le code pour y répondre : `generator.js`, `squelette.js`,
`placement.js`, `rules.js`, `PLAN_SCHEMA.json`, confrontés au §8 ci-dessus et à
`SOCLE_AGENCEMENT.md` §6. **Il ne modifie rien.**

La réponse courte : **le calque existe déjà, il est calculé à chaque plan, et il
est détruit à la sortie de la fonction qui le produit.** Le travail n'est pas de
l'inventer, c'est de cesser de le jeter.

### 9.1 — « Circulation » désigne cinq choses qui ne se parlent pas

| # | Ce que c'est | Où | Ce qu'elle ignore |
|---|---|---|---|
| 1 | une **pièce du programme** — `createRoom('circulation')`, surface allouée, agrément 0,6, `minArea` = 1,20 × desservies × 0,95 | `buildProgram()`, `assets/generator.js` | la géométrie |
| 2 | une **forme posée en premier** — barre, L ou T, et ses poches | `assets/squelette.js` | le mobilier |
| 3 | quatre **règles filtrées sur `room.type === 'circulation'`** | `TH2D-CIRC-001` à `004`, `assets/rules.js` | tout ce qui n'est pas cette pièce |
| 4 | un **champ franchissable** — maillage 10 cm, murs retirés, érosion, propagation depuis l'entrée | `cheminement()`, `assets/generator.js` | rien — mais il est jeté |
| 5 | un **négatif local à l'échelle de la pièce** — emprises, zones d'usage, débattements | `assets/placement.js`, critères `S1`, `S2`, `S3`, `S5` | l'existence des autres pièces |

Le décalage le plus parlant tient en deux constantes : `DESSERTES_PAR_COULOIR`
vaut 5 et fait demander trois circulations à 250 m² ; `poserParSquelette()`
force `couloirsMax: 1`. **La pièce du programme est déjà à moitié fictive** — le
poseur ignore son compte, et c'est le poseur qui gagne (§8.5).

### 9.2 — Le calque existe, et il est détruit à la sortie

`cheminement()` fait déjà exactement ce que la question décrit : il maille la
surface au décimètre, laisse le volume des murs à `-1` — **le négatif est obtenu
sans jamais être construit** —, efface les cellules occupées par le mobilier
lorsqu'on lui en donne, érode de la moitié de la largeur exigée, puis propage
depuis l'entrée en ne franchissant les pièces qu'aux portes.

Quatre choses le rendent inerte :

- **il ne rend qu'un booléen par pièce.** Sa sortie est
  `{ largeur, atteintes, avecMobilier }` : le champ lui-même n'est jamais rendu.
  Il n'existe donc dans aucune interface, et il est reconstruit de zéro à chaque
  besoin ;
- **il n'est pas au schéma.** `parcours` est attaché à l'objet plan par
  `finaliserPlan()` et passe silencieusement parce que `PLAN_SCHEMA.json` laisse
  `additionalProperties: true` sur `plan`. Non exporté, non opposable, non
  rejouable ;
- **aucune règle ne le consulte.** `TH2D-GRAPH-002` — « toutes les pièces
  accessibles », `HARD` — appelle `reachable()`, qui parcourt `plan.edges`.
  C'est de la topologie. **Deux notions d'accessibilité coexistent dans le
  moteur, et c'est la plus faible qui est bloquante** ;
- **il arrive après la sélection.** Calculé dans `finaliserPlan()`, il ne peut
  rien refuser. Avec mobilier, il n'est recalculé qu'à l'affichage —
  `cheminementAvecObstacles()`, appelé par `assets/app.js` dans un `try/catch`
  muet — et son résultat ne repart jamais dans le verdict.

Un détail qui commande la suite : l'érosion utilise `PASSAGE_LIBRE = 0,77` m, la
largeur utile d'une porte. **Le calque atteste aujourd'hui qu'un corps franchit
une porte, pas qu'un couloir est praticable.** Il ne peut donc pas juger
`TH2D-CIRC-001` sans changer de rayon.

### 9.3 — Ce que le basculement débloque

Sept dossiers ouverts, tous bloqués **pour la même raison** : la grandeur à
mesurer est une propriété du champ, et le moteur ne sait l'écrire que comme une
cote de pièce.

- **`S4` du socle** — « un chemin continu relie la porte de la pièce à chaque
  zone d'usage requise », déclarée **bloquante** et évaluée nulle part. Vérifié
  ligne à ligne : `placement.js` applique `S1`, `S2`, `S3` et `S5` ; il n'y a
  aucune notion de connexité dans le solveur. Le socle l'écrit lui-même — « `S4`
  est la porte d'entrée du calcul de parcours : c'est déjà du cheminement, à
  l'échelle de la pièce ». **Le calque, c'est cette phrase menée à son terme** ;
- **`S3` à l'échelle du logement** — dix portes sur 22 m de couloir sans aucun
  contrôle de concurrence (§8.6). Le débattement est traité pièce par pièce ; la
  circulation, qui les reçoit tous, n'est pas cliente du solveur ;
- **les trois notions de passage** — 0,60 contournement, 0,90 traversant, 1,20
  croisement — que trois fiches réclament sans pouvoir les écrire. Inexprimables
  comme cote de pièce, **triviales sur un champ** : ce sont trois érosions du
  même calque, donc une échelle de niveau de service et non trois règles ;
- **`TH2D-CIRC-001`**, qui impose 1,20 m en bloquant et **rejette des plans
  conformes** à l'arrêté du 24 décembre 2015 (0,90 m, `vérifié` à la veille).
  Sur un calque : 0,90 partout en `HARD` normatif, 1,20 sur les axes desservants
  en conseil ;
- **`VAL-PMR-001`, `003`, `004`** — demi-tour 1,50 × 1,50, manœuvre de porte
  1,70 en poussant et 2,20 en tirant : sans support aujourd'hui, ce sont des
  érosions à rayon donné sur un champ ;
- **`TH2D-CIRC-004`**, devenue du bruit (§8.4) parce qu'elle mesure la surface
  d'une pièce. Le §8.7 demande de pénaliser **la longueur** : la longueur d'un
  chemin est une grandeur de calque, pas de rectangle ;
- **la ramification absente** (§8.5, la famille `T` retenue une fois sur quinze)
  : sur un champ, le nombre de branches et la longueur moyenne de l'entrée à
  chaque pièce se mesurent. Aujourd'hui, rien ne les nomme.

### 9.4 — Les cinq verrous, par ordre de dureté

1. **Le calque ne peut pas juger ce qui n'existe pas encore.** `socle.data.js`,
   `room-model.js` et `placement.js` sont différés au premier affichage de
   mobilier. Un calque « négatif des équipements » suppose de les remonter dans
   la boucle : **c'est le lot M2 / chantier 9 `O2`, et le calque en dépend, pas
   l'inverse.** Sans mobilier, il reste le négatif des seuls murs — utile, mais
   c'est déjà ce que le moteur produit.
2. **Le coût interdit de l'inscrire au score en l'état.** Maillage de 10 cm sur
   250 m² : environ 25 000 cellules, et l'érosion est naïve — 7 × 7 voisins par
   cellule, soit ~1,2 million de tests par appel. Le budget de génération monte
   à `min(6000, n² × 70)` candidats. Il faut une transformée de distance
   séparable, ou ne calculer le calque que sur les finalistes. **À trancher
   avant, pas pendant.**
3. **Supprimer la pièce éteindrait quatre règles en silence.** `TH2D-CIRC-001` à
   `004` filtrent sur `room.type === 'circulation'` : sans pièce de ce type,
   elles rendent `[]`. Pas une violation — **rien**. C'est le mode d'échec le
   plus dangereux du lot, et il ne se verrait pas au rapport.
4. **Le calque est polygonal, le solveur d'équipements est rectangulaire** —
   limite ouverte de D2, lot M4b. Le calque la mettrait à nu plus tôt. C'est un
   bénéfice, mais c'est un coût avancé.
5. **Un champ libre ne sait pas décider.** Le squelette a rendu 100 %
   d'adjacences et 100 % de pièces atteintes (§8.1) précisément parce qu'il
   **pose** la circulation avant les pièces. Un calque n'a aucune capacité de ce
   genre : il constate.

### 9.5 — L'objection de fond : parcourable n'est pas desservi

« Une seule entité parcourable partout » ne distingue pas un couloir d'une
**traversée de chambre**. Les deux sont franchissables ; un calque de pure
franchissabilité les confond.

Or le profil de la pièce énonce que sa fonction est négative : elle protège
l'usage des autres pièces — *on n'entre pas dans une pièce en traversant une
autre*. Un calque uniforme **légitimerait exactement le défaut que la
circulation existe pour éviter**, et c'est le défaut que le §5 ter avait mesuré
à 19,4 % de pièces sans porte vers un dégagement.

La correction est simple, mais elle doit être posée dès la première ligne :
chaque cellule porte son appartenance — `piece[]` la porte déjà — **et un statut
de servitude** : dégagement, traversée tolérée, traversée interdite. **Le calque
n'est pas un espace uniforme, c'est un champ qualifié.** Un calque qui ne
distingue pas ces trois statuts n'est pas une amélioration du modèle, c'en est
une régression doctrinale.

### 9.6 — Recommandation : le calque juge, le squelette pose

**Ne pas remplacer le squelette par le calque.** Le squelette produit, le calque
valide et mesure. C'est la répartition qui préserve les acquis du §8.1 tout en
levant les sept blocages du §9.3.

Cinq étapes, chacune livrable et mesurable seule, dans cet ordre :

1. **Rendre le calque.** Le sortir de `cheminement()` — champ ou polygone —, le
   déclarer dans `PLAN_SCHEMA.json`, l'exporter. Aucune régression possible, et
   tout le reste devient mesurable.
2. **Doubler `TH2D-GRAPH-002` d'une règle géométrique, en `GUIDELINE`**, et
   mesurer sur le banc l'écart entre accessibilité topologique et accessibilité
   réelle. **C'est cette mesure, et non un raisonnement, qui dira ce que le
   calque apporte.** Tant qu'elle n'est pas faite, la suite est une intention.
3. **Faire entrer le mobilier dans le calque** — attend M2 / `O2`. `S4` devient
   alors évaluable, et à l'échelle du logement et non de la pièce.
4. **Réexprimer les largeurs en érosions** : 0,90 m `HARD` normatif, 1,20 m sur
   les axes desservants, 1,50 × 1,50 en profil PMR. Règle du même coup le
   conflit de `TH2D-CIRC-001` avec l'arrêté du 24 décembre 2015.
5. **Remplacer `TH2D-CIRC-004` par une mesure de longueur** sur le calque —
   c'est le point 1 du §8.7, qui devient réalisable ici.

**Ne toucher au programme — la pièce `circulation` — qu'en dernier**, et
seulement si les étapes 2 à 5 établissent qu'elle n'ajoute plus rien. Le verrou
3 du §9.4 interdit de commencer par là.

### 9.7 — Ce que cet audit n'a pas mesuré

Il est fondé sur la **lecture du code**, pas sur un banc. Les deux chiffres
avancés — 25 000 cellules et ~1,2 million de tests par appel — sont calculés
depuis les constantes (`PAS = 0,1`, `PASSAGE_LIBRE = 0,77`, rayon d'érosion 3),
et non relevés. Ils doivent être **chronométrés avant d'arbitrer le verrou 2**.

Les deux disciplines déjà payées par ce dossier s'appliquent ici :

- mesurer **à processus unique**, un changement activé puis neutralisé sur les
  mêmes graines — comparer deux passages successifs du banc ne prouve rien
  (§5 bis) ;
- verser les chiffres dans un **script versionné** avant de les opposer (§8.8).
  `scripts/diagnostic-circulation.mjs` est l'endroit : l'étape 1 lui donne enfin
  une géométrie à lire.

## 10. Audit du 27 août 2026 — ce que le solveur de pose ne regarde pas

**Question posée** : les meubles — les lits surtout — se retrouvent « au milieu »
des pièces, et les passages vers les fenêtres sont coupés. Pourquoi ?

Cet audit répond par la mesure. Il ajoute
`scripts/audit-circulation-mobilier.mjs`, qui **rejoue le solveur réel**
(`placement.optimize()`, celui qu'appelle `app.js`) sur 8 configurations × 6
graines, maille chaque pièce meublée au demi-décimètre, retire les emprises,
érode de 0,60 m — le **contournement** du §9.3 — et mesure ce qui reste.

```bash
npm run technohab:audit-circulation
npm run technohab:audit-circulation -- --sans-angle   # l'ablation du §10.3
```

**306 pièces programmées, 269 meublées (87,9 %).** Il ne modifie rien.

### 10.1 — Le solveur n'a aucune notion de connexité

`solveCentimeters()` filtre chaque pose sur quatre tests, et quatre seulement :
elle tient dans le polygone utile, elle ne recouvre pas une zone `blocked`, elle
ne recouvre pas une emprise déjà posée, elle ne mord pas une zone d'usage déjà
posée (`assets/placement.js:420-435`). **Aucun ne parle du vide restant.** Le
solveur peut donc poser un meuble qui sépare la pièce en deux : rien dans son
vocabulaire ne sait dire qu'il vient de le faire.

C'est le constat du §9.3 sur `S4` — « un chemin continu relie la porte de la
pièce à chaque zone d'usage requise », déclarée bloquante et évaluée nulle part
— désormais chiffré :

| Ce qu'on mesure sur les 269 pièces meublées | Compte | Part |
|---|---|---|
| sol praticable en plusieurs îlots | 45 | **16,7 %** |
| zones d'usage séparées de la porte (`S4` violée) | 18 / 631 | 2,9 % |
| seuils de porte sans sol praticable devant | 3 / 244 | 1,2 % |
| sol praticable échoué hors du grand îlot | 42,6 m² / 2 407,7 m² | 1,8 % |
| pièces perdant plus de 10 % de leur sol | 22 | 8,2 % |

Une pièce sur six est fragmentée. La salle d'eau est la plus touchée — 13
pièces sur 54, soit **24 %** — parce que c'est là que les emprises sont grandes
devant la surface.

Le critère « pièces à baies séparées » ressort à **0 %**, et c'est un artefact
qu'il faut lire correctement : la quasi-totalité des pièces n'a qu'**une seule**
porte. Un lit qui coupe une chambre en deux ne sépare donc aucune paire de
baies. **C'est l'îlot, pas la paire de portes, qui est la bonne grandeur** —
raison pour laquelle le script mesure les deux.

### 10.2 — 85 % des pièces sont posées sans aucune zone interdite

`roomContext()` est la seule source de contraintes d'ouverture du solveur
(`assets/placement.js:98-147`). Deux lignes en décident :

```js
if (kind === 'window') return;                                    // ligne 108
if (opening.debattement && opening.ouvreVers === room.id) { … }   // ligne 109
```

Sur le banc de vérification (24 plans) :

| | |
|---|---|
| portes intérieures | 136, dont 20 coulissantes |
| portes portant un débattement | 116 (85,3 %) |
| pièces desservies par une porte | 160 |
| **dont sans aucune zone bloquée** | **136 (85,0 %)** |
| zones bloquées produites par une fenêtre | **0**, toujours |

Trois trous, par ordre de gravité :

1. **Le débattement ne protège que la pièce vers laquelle la porte ouvre.**
   `swingFromFace()` ne produit un carré que du côté `ouvreVers`
   (`assets/construction.js:325-347`). L'autre pièce ne reçoit rien : un meuble
   peut s'adosser au chambranle et condamner le passage depuis ce côté. Comme
   `poserPortes()` fait ouvrir le battant vers la pièce et jamais vers la
   circulation (`assets/generator.js:1458-1466`), **c'est systématiquement le
   côté couloir qui n'est pas protégé.**
2. **La porte coulissante ne protège personne.** `swingFromFace()` rend `null`
   dès `kind === 'porte-coulissante'` — c'est juste, il n'y a pas de battant —
   mais rien ne prend le relais pour réserver le seuil. Les 20 portes de WC du
   banc sont dans ce cas.
3. **La fenêtre ne contraint rien, nulle part.** Ni zone interdite à la pose, ni
   pénalité au barème : `accessScore` filtre explicitement
   `opening.kind !== 'window'` (`assets/placement.js:604`).

Le repli de `app.js:200-217` — une bande de 0,25 m devant toute porte, 1 m
devant l'entrée, **sans exiger de débattement** — savait faire ce que
`roomContext()` ne fait plus. Il est devenu du code mort le jour où
`placementContext()` a délégué à `roomContext()`. La régression est là.

Conséquence mesurée : **16 fenêtres sur 201 (8,0 %) sont masquées** par une
emprise dans les 0,60 m devant leur baie, et **8 (4,0 %) sont dans un îlot
distinct de celui de la porte** — la fenêtre existe, on ne peut pas l'atteindre.
Le séjour concentre le défaut : **14 pièces sur 45, soit 31 %**.

### 10.3 — La cause du « meuble au milieu » est dans le barème, et elle est nommée

`assessPlacements()` compose la note sur 100 (`assets/placement.js:593-641`) :

```
score = relations × 35 + access × 30 + corners × 20 + spatial × 15
```

Le terme `cornerScore` porte le nom de l'angle et **récompense l'inverse** :

```js
Math.max(0, Math.min(1, Math.min(along, span - along) / 0.6))   // ligne 620
```

`along` est le **centre** de l'équipement le long de sa face ; `Math.min(along,
span - along)` est donc sa distance à l'extrémité la plus proche. Divisée par
0,6 et plafonnée à 1 : **la note est maximale à partir de 0,60 m des deux bouts
du mur, et nulle dans l'angle.** Vingt points sur cent poussent chaque meuble
ancré vers le milieu de son mur.

`candidatePreference()` va dans le même sens en amont, au classement des
candidats : la famille `central` note `3 - distanceToCenter / max` et la famille
`linear` ajoute `cornerDistance / 300` (ligne 202-204). Deux des six familles
que `optimize()` fait tourner préfèrent explicitement le centre.

**Ablation** — même processus, mêmes graines, `cornerScore` neutralisé à 1 :

| | nominal | sans `cornerScore` |
|---|---|---|
| marge médiane du lit à l'angle le plus proche | **0,70 m** | **0,15 m** |
| lits décollés des deux angles (> 35 cm) | 112 / 138 — **81,2 %** | 58 / 138 — **42,0 %** |
| pièces à sol fragmenté | 45 — 16,7 % | 34 — **12,6 %** |
| sol échoué hors du grand îlot | 42,6 m² — 1,8 % | 19,7 m² — **0,8 %** |
| pièces perdant > 10 % de leur sol | 22 | **12** |
| fenêtres masquées | 16 — 8,0 % | 30 — **14,9 %** |
| seuils de porte sans sol devant | 3 — 1,2 % | 7 — **2,9 %** |

Le diagnostic est établi : **`cornerScore` est la cause directe du lit flottant**
— il divise par plus de quatre la marge médiane à l'angle — et il aggrave la
fragmentation qu'on lui reproche.

Le détail qui interdit de simplement le supprimer est dans les deux dernières
lignes : sans lui, les fenêtres masquées **doublent** et les seuils condamnés
aussi. `cornerScore` tient aujourd'hui le rôle d'un garde-fou grossier — en
éloignant tout des bouts de mur, il éloigne accessoirement des baies, qui sont
souvent près des angles. **Il protège les ouvertures par accident, faute de
règle qui les protège exprès.** Le retirer sans poser cette règle échange un
défaut contre un autre.

Il faut noter que le lit le plus souvent flottant est le `bed_90`, dont l'usage
ne demande `0,60 m` que **d'un seul côté** (`sides: 1`,
`assets/socle.data.js:144`). Rien ne l'empêche donc de prendre l'angle : ce
n'est pas la contrainte d'usage qui l'en écarte, c'est bien le barème. Le
`bed_140`, lui, exige 0,60 m des deux côtés (`sides: 2`) et ne peut
structurellement jamais toucher un angle — c'est juste, mais cela veut dire
qu'une chambre parentale a besoin de **2,60 m de mur libre** au minimum, 3,00 m
pour le `bed_180`.

### 10.4 — Le calque existe déjà, en aval, et il ne juge rien

Le §9.2 l'a établi en lecture ; l'audit le confirme en exécution.
`cheminementAvecObstacles()` est bien rejoué avec le mobilier — mais depuis
`assets/app.js:607-611`, dans un `try/catch` muet, **au dessin**, après que le
solveur a rendu ses poses et que le plan a été retenu. Sa sortie ne comporte
qu'un booléen par pièce (`atteintes`), et une pièce compte pour atteinte dès
qu'**une seule** de ses cellules l'est. **Une chambre coupée en deux par son lit
est déclarée atteinte.** Le calque ne peut donc pas voir le défaut que cet audit
mesure, même là où il tourne.

### 10.5 — Ce qu'il faut faire, dans cet ordre

Trois pas, du moins cher au plus structurant. Les deux premiers sont locaux au
solveur et ne dépendent pas du chantier « calque » du §9.6.

1. **Rendre à `roomContext()` la réservation de seuil** que le repli de
   `app.js` savait produire, et l'étendre aux trois trous du §10.2 : une bande
   devant **chaque** baie de porte, **des deux côtés** du mur, y compris
   coulissante ; une bande devant chaque **fenêtre**. Profondeur à arbitrer sur
   le banc — 0,60 m est le contournement, et c'est le candidat naturel. Coût
   nul : ce sont des rectangles de plus dans `context.blocked`, que le solveur
   sait déjà refuser.
2. **Remplacer `cornerScore` par un test de connexité**, et non le supprimer.
   Le §10.3 montre que le retirer seul dégrade les ouvertures ; le pas 1 lève
   cette objection, et la place est alors libre pour la grandeur juste : `S4`,
   c'est-à-dire **la part du sol praticable tenant dans le plus grand îlot**.
   La transformée de distance par chanfrein employée par le script d'audit — deux
   passes, coût linéaire — répond au verrou 2 du §9.4 : l'érosion naïve de
   `cheminement()` n'est pas la seule manière de faire, et celle-ci est
   abordable dans la boucle d'`optimize()`.
3. **Faire de `S4` un `acceptPartial`**, pas seulement une note. Le solveur a
   déjà le point d'accroche (`assets/placement.js:437-440`) : une pose qui
   détache une zone d'usage requise de la porte doit être refusée, pas
   pénalisée.

Le pas 3 rend `S4` réellement bloquante à l'échelle de la pièce, ce que le socle
déclare depuis le début. Il ne préempte pas le calque du §9.6 : il en est la
version locale, celle qui n'attend pas M2.

### 10.6 — Les limites de cet audit

- **48 plans, 269 pièces meublées.** Assez pour trancher un rapport de 1 à 4,
  pas pour un intervalle de confiance. Le banc est paramétrable (`--seeds=N`).
- **L'érosion à 0,60 m est un choix**, celui du contournement du §9.3. À 0,90 m
  — le traversant — les chiffres de fragmentation monteraient ; le script ne
  mesure pas cette échelle, alors que le §9.3 demande qu'elle existe.
- **Les zones d'usage sont traitées comme praticables**, ce qui est juste pour
  circuler et faux pour cohabiter : deux zones d'usage exclusives qui se
  chevauchent sont un défaut que ce script ne voit pas.
- **Rien n'est mesuré à l'échelle du logement.** La concurrence des
  débattements sur un couloir (§8.6, §9.3) reste hors champ : cet audit
  s'arrête à la pièce, parce que c'est là que le solveur s'arrête.

## 11 — Livraison M3.0 : le calque mesure, le score classe

**État au 27 août 2026.** Le lot M3.0 met en œuvre le point 1 du §9.6 sans
exporter la grille brute : `cheminement()` conserve désormais une synthèse du
calque (`grid-shortest-path-v1`), sa résolution, le nombre de cellules
atteignables et les longueurs minimales de l'entrée à chaque pièce. Le plan
publie moyenne et pire desserte dans `parcours.desserte`.

Avant construction des portes, `scoreCandidate()` emploie le proxy publié
`branch-long-axis-v1` : somme des axes longs des branches, rapportée au nombre
de dessertes demandées. Son poste `circulationLength` est séparé dans
`scoreBreakdown`; la circulation est retirée de la peine générique de
proportion, qui jugeait un couloir comme une pièce de séjour.

Le banc versionné `scripts/measure-m3-circulation.mjs` rejoue 84 plans à
graines fixes, poids actif puis neutralisé dans le même processus. Avec le
poids actif, la longueur moyenne passe de **13,07 à 12,20 m**, la part moyenne
de circulation de **12,54 à 12,03 %**, et le trajet moyen entrée→pièce de
**6,96 à 6,61 m**. La photographie datée est
`scripts/references/M3_CIRCULATION_REFERENCE.json`; elle décrit le moteur et ne
constitue pas une norme.

`TH2D-CIRC-004` est donc **suspendue explicitement**. Son ancien seuil 1,6,
issu du 90e centile du moteur, aurait consacré le défaut. La règle remonte dans
`report.limites`, avec la mesure courante mais sans seuil ni violation. Sa
réactivation attend un étalonnage externe en M6. Le nombre n'est pas remplacé
par un autre nombre muet.

Limite transmise à M3 : le proxy additionne les axes de branches et comptera
deux fois leurs recouvrements aux articulations L/T. M3 devra publier le graphe
de branches pour retrancher ces recouvrements ; le champ `method` interdit de
confondre entre-temps proxy et longueur topologique exacte.

## 12 — Livraison M4a.2 : l'entrée n'autorise pas le couloir-façade

**État au 30 août 2026.** La façade requise pour poser une porte d'entrée et la
façade consommée par le reste de la circulation sont désormais deux grandeurs.
`entry-allowance-then-excess-v1` mesure le linéaire extérieur unique du réseau,
neutralise 0,90 m quand la porte est effectivement portée par la circulation,
puis classe le surplus avec
`VAL-CIRC-FACADE-EXCESS-WEIGHT-001` (18 points/m, `PREFERENCE`, `PROVISIONAL`,
source doctrinale N3). Ce nombre ne produit ni règle ni violation : M6 devra
étalonner ou remplacer son poids.

La stratégie `hall` porte la première terminaison intérieure
`interior-room-cap-v1`. Elle raccourcit une extrémité extérieure et transfère
son capuchon à une pièce distributrice sans plafond de surface, à agrément
positif. La pièce peut devenir polygonale ; M4b juge donc toute son emprise.
Une pièce ne reçoit qu'un capuchon et tous les voisins terminaux conservent au
moins 1 m de contact avec la branche restante.

Sur le banc fixe de 100 plans, 27 plans emploient ce geste et 13 terminent tout
le réseau à l'intérieur. Le contact de circulation avec la façade passe de
100/100 à 87/100 ; le linéaire restant après retrait des 87 seuils d'entrée est
de 169,85 m, soit 1,70 m/plan. Les orientations D4, le graphe obligatoire, les
portes, S4 et la meublabilité restent tenus. La preuve rejouable est
`scripts/test-m4a2-interior-terminations.mjs`; la mesure est
`scripts/audit-circulation-orientations.mjs`.

## 13 — Livraison M5.0 : une branche existe pour desservir

**État au 30 août 2026.** La longueur globale de M3.0 ne suffit pas : un T
court peut garder un bras sans porte, ou prolonger une branche après sa dernière
ouverture. `door-incidence-logical-arms-v1` reconstruit donc les bras logiques
des parties jointives, attribue portes intérieures et entrée au bras le plus
proche, puis publie `serviceCount`, `emptyArmCount` et `deadLength`.

Le reliquat reçoit le coût canonique provisoire
`VAL-CIRC-DEAD-LENGTH-WEIGHT-001` (18 points/m, `PREFERENCE`, `PROVISIONAL`,
source doctrinale N3). Le poids est aligné sur le coût provisoire de façade :
il départage deux candidats sans prétendre définir une longueur acceptable.
M6 devra l'étalonner ; aucun seuil de conformité n'en est déduit.

Le producteur `coude` apporte un L intérieur à deux bras jointifs, indépendant
de l'ancien L de façade. Ses rotations et réflexions relèvent de D4, pas de la
diversité. Le classement conserve un représentant par famille avant la preuve
d'usage, sans prime ni quota ; un bras vide est toutefois éliminé avant le
score, car une circulation sans desserte n'a pas d'objet fonctionnel.

Sur 100 plans fixes, l'ablation porte 34 bras vides dans 29 plans et 2,82 m de
reliquat moyen ; M5.0 obtient 0 bras vide et 1,34 m. Les familles publiées
passent de 72 T / 28 barres à 49 L / 51 barres, et le contact extérieur de
87 à 69 plans. Le T reste disponible mais ne gagne pas ce corpus : son
troisième bras n'y paie pas son existence par une porte. Deux recherches
emploient le repli historique après épuisement du classement M5 ; la métrique
et son coût restent actifs et le banc conserve 100/100 plans.

## 14 — Livraison M5 : le valide précède le préférable

**État au 30 août 2026.** Le classement suit désormais un ordre non
compensatoire : construire et meubler, juger les `HARD`, puis seulement classer
les préférences. Un BuiltPlan HARD ne peut donc jamais racheter son défaut par
un couloir court ou un meilleur confort. Sur l'audit courant, un candidat HARD
est écarté et aucun des 100 plans publiés n'est bloquant.

Les dégagements déclarés par les équipements reçoivent trois niveaux. `min`
reste la condition de faisabilité ; `target` et `comfort` sont mesurés sur les
poses canoniques sans changer leur géométrie. Leurs coûts provisoires sont
respectivement 6 et 2 points par exigence manquée, identifiés par
`VAL-USAGE-TARGET-MISS-WEIGHT-001` et
`VAL-USAGE-COMFORT-MISS-WEIGHT-001`. Sur 100 plans, 507/550 cibles et 430/450
niveaux de confort sont atteints. Ces nombres classent et ne prouvent aucune
qualité vécue ; M6 doit les étalonner.

La tri-sélection ne mélange pas diversité et score. Le meilleur score vient en
premier ; les deux plans suivants privilégient une famille puis une stratégie
encore absentes. Douze demandes fixes rendent 36 plans VALID et distincts,
avec neuf sélections multi-familles. Le contrat `PlanSelection` dit
explicitement s'il est complet, partiel ou vide.
