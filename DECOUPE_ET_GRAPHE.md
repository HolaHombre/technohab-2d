# Piloter la découpe par le graphe — dossier d'instruction

**Ouvert le 21 août 2026.** `DOCTRINE_CIRCULATION.md` §5 ter désigne ce
chantier comme « le verrou de tout le reste ». Ce dossier ne le résout pas :
il établit les faits qui manquaient pour le trancher, corrige trois énoncés
périmés, et reformule le problème là où il était mal posé.

Il ne rend aucun arbitrage. Le protocole de décision, lui, est déjà écrit —
[`APPROCHES_GENERATION.md` §8](APPROCHES_GENERATION.md), critères et règle de
décision pré-enregistrés. Ce dossier alimente ce protocole, il ne le remplace
pas.

**Mesures rejouables** :

```bash
node scripts/diagnostic-desserte.mjs
node scripts/ablation-peigne.mjs
node scripts/capacite-desserte.mjs
```

Banc commun aux trois : 14 configurations × 4 formes d'enveloppe × 15 graines
= **840 plans**, graine de base `20260820`.

---

## 1. Ce que la mesure établit

### 1.1 — Le graphe demandé est toujours une étoile. Toujours.

`APPROCHES_GENERATION.md` §4 l'affirmait — « le graphe demandé est presque
toujours le même » — sans l'avoir mesuré, et le §9 le reconnaissait. C'est
désormais fait :

| Structure du graphe demandé | Plans |
|---|---:|
| Étoile pure | 420 / 840 |
| Étoile + une corde (`living–kitchen`) | 420 / 840 |
| Autre | **0 / 840** |

Zéro exception, sur quatre formes d'enveloppe et quatorze programmes. Ce
n'est pas « presque toujours », c'est **toujours** — et la corde est
exactement le cas `separateKitchen`, soit sept configurations sur quatorze.

La portée est considérable : **on connaît la forme de la réponse**. La
traduction spatiale d'une étoile est le couloir desservant de part et
d'autre, et elle est toujours réalisable. Le moteur consacre un budget de
recherche à redécouvrir par tirage une disposition qu'aucun tirage n'était
nécessaire pour trouver.

### 1.2 — L'échec est heuristique, pas géométrique

C'est le fait qui oriente tout le reste. Si le couloir manquait de longueur,
il faudrait revoir l'allocation de surface ; s'il en avait assez, c'est la
méthode de partition qui est en cause.

Capacité de bordure du couloir — ses deux grands côtés, borne **optimiste** —
comparée aux dessertes dues :

| | Plans | Dessertes dues | Manquées | Plans complets |
|---|---:|---:|---:|---:|
| Capacité suffisante | 825 | 5 516 | 1 018 (18,5 %) | 292 (35 %) |
| Capacité insuffisante | 15 | 124 | 53 (42,7 %) | 0 (0 %) |

**98,2 % des plans disposaient de la longueur de couloir nécessaire**, et
seuls 35 % d'entre eux réalisent toutes leurs dessertes. La découpe
n'exploite pas une capacité dont elle dispose. Les 15 plans réellement
sous-dimensionnés sont une queue négligeable, et non le sujet.

> Note de lecture : 18,5 % porte sur les **arêtes demandées vers la
> circulation**, quand le 12,1 % du §1.3 porte sur les **pièces sans
> dégagement**, séjour compris. Les deux ne se comparent pas directement —
> le séjour rattrape une partie des dessertes que le couloir rate.

### 1.3 — L'échec se concentre sur deux facteurs

Pièces sans contact ni avec une circulation ni avec le séjour, et sans porte
vers l'un des deux :

| Forme d'enveloppe | Sans contact | Sans porte |
|---|---:|---:|
| lShape | 8,0 % | 10,9 % |
| square | 9,3 % | 12,4 % |
| rectangle | 9,6 % | 11,9 % |
| **uShape** | **21,7 %** | **27,0 %** |

| Taille du programme | Sans contact | Sans porte |
|---|---:|---:|
| 3–5 pièces | 0,3 % | 5,8 % |
| 6–7 pièces | 4,9 % | 7,4 % |
| 8–9 pièces | 10,9 % | 14,8 % |
| **10 pièces et plus** | **17,9 %** | **21,2 %** |

Deux lectures. Le **U triple le défaut** : ses trois volumes se partagent un
programme dont une seule circulation, donc au moins un volume n'a aucun
dégagement propre. Et la dégradation est **monotone avec la taille** — un
couloir unique ne passe pas à l'échelle, ce que `ROADMAP.md` §965 annonçait
déjà sans le chiffrer.

Par type : chambres 13,8 % et WC 13,6 % sans contact, contre 7,3 % pour les
salles d'eau. Ce sont les pièces les plus nombreuses qui trinquent.

### 1.4 — Le peigne dégrade ce qu'il était censé garantir

`layout()` porte deux mécanismes destinés à satisfaire l'étoile par
construction : `hubSplit()`, qui isole la circulation contre une frontière,
et le peigne (`comb`), qui recoupe perpendiculairement tout groupe déjà
séparé du couloir pour que chacune de ses pièces le borde.

Ablation à graines fixes, dans le même processus — seule méthode qui
établisse une causalité ici :

| Variante | Sans contact | Sans porte | Signatures | ms/plan |
|---|---:|---:|---:|---:|
| témoin | 12,1 % | 15,6 % | 815 | 281 |
| **sans peigne** | **10,0 %** | **13,0 %** | 815 | **241** |
| sans `hubSplit` | 15,8 % | 18,5 % | 822 | 266 |
| sans les deux | 13,9 % | 16,7 % | 822 | 279 |

- **`hubSplit` rend service** : le retirer coûte 3,7 points. À conserver.
- **Le peigne nuit** : le retirer *gagne* 2,1 points sur le contact et 2,6
  sur la porte, pour **exactement la même diversité** (815 signatures) et
  14 % de temps en moins.
- Les effets sont **additifs et indépendants** : 12,1 − 2,1 + 3,7 = 13,7,
  pour 13,9 mesuré.

Pourquoi le peigne nuit, alors que son raisonnement paraît juste : il impose
`vertical = !parentVertical` dès que la coupe perpendiculaire est praticable,
et confisque ainsi à `layout()` le choix de direction que le reste de la
fonction calcule en fonction des largeurs disponibles. Il achète une
adjacence locale au prix de tranches mal proportionnées, qui en font perdre
davantage plus bas dans la récursion.

---

## 2. Trois énoncés à corriger

Ce dossier applique la règle du §P0 de `SUIVI_REGLES_PIECES.md` : le code
fait autorité sur l'état.

**`DOCTRINE_CIRCULATION.md` §7** — « le mécanisme des circulations multiples
est écrit mais inactif ». Faux, et déjà corrigé le 20 août : `buildProgram()`
appelle `createRoom('circulation')` une fois, sans boucle ni drapeau.

**`DOCTRINE_CIRCULATION.md` §5 bis** — « `CIRCULATIONS_MULTIPLES = false`. Le
mécanisme reste en place, mesuré, avec ses chiffres inscrits à côté du
drapeau. » Ce drapeau **n'existe plus** dans le code (vérifié : aucune
occurrence). La phrase décrivait l'état au 19 août ; le §5 ter dit le retrait
au 20. Le compte rendu reste valable comme historique, sa dernière phrase
non.

**`ROADMAP.md` §3.1** — « `layout()` découpe l'espace en guillotine sans
jamais consulter les adjacences demandées ». Littéralement exact —
`layout()` ne lit jamais `requestedEdges` — mais trompeur dans sa
conclusion : la fonction consulte le **programme** (`item.type ===
'circulation'`) et code en dur l'hypothèse que la circulation est le hub.
Elle n'ignore donc pas le graphe, elle en encode une version figée. La
nuance compte, puisque c'est précisément cet encodage en dur qui, mesuré,
dégrade le résultat.

---

## 3. Le problème était mal posé

`APPROCHES_GENERATION.md` §2.C définit le dual rectangulaire comme « une
partition d'un rectangle dont le graphe d'adjacence est **exactement** le
graphe donné », et en tire des conditions d'existence exigeantes — faces
internes triangulées, absence de triangle séparateur.

**Ce n'est pas le problème de ce projet, et c'est heureux.** Dans un couloir
desservant, deux chambres voisines partagent forcément un mur : le graphe
réalisé contient toujours strictement plus que l'étoile demandée. Exiger
l'égalité rendrait le problème insoluble dès quatre ou cinq pièces — et une
étoile n'étant pas triangulée, les conditions du §2.C ne s'y appliquent tout
simplement pas.

Ce que le moteur exige réellement est un **sur-graphe** : toute arête
demandée est réalisée, les autres sont tolérées. `TH2D-GRAPH-001` ne vérifie
rien d'autre. Pour une étoile, cette exigence se réduit à une condition de
capacité, vérifiable par le calcul avant toute géométrie :

```
longueur de bordure offerte par le couloir  >=  somme des dessertes dues
```

Deux conséquences pour l'arbitrage :

1. **Le §2.C surestime la difficulté du dual rectangulaire** pour le graphe
   d'aujourd'hui, et le §9 avait raison de se méfier de conditions énoncées
   de mémoire. La réserve est levée : elles ne sont pas fausses, elles sont
   hors sujet.
2. Le moteur gagne au passage **la capacité de dire l'impossible** — critère
   explicite du protocole §8 — sans changer de méthode de génération : la
   condition ci-dessus se teste sur le programme, pas sur le plan.

---

## 4. Le peigne est retiré — fait le 21 août 2026

La règle de décision avait été écrite avant la mesure : *« si aucune règle
`HARD` ne se dégrade, le retrait se justifie seul »*. Banc complet, 24
configurations × 30 graines, graine 20260818 :

| Règle | Témoin | Sans peigne | |
|---|---:|---:|---|
| `TH2D-ROOM-002` **(HARD)** | 49 | **45** | améliorée |
| `TH2D-FACADE-001` **(HARD)** | 1 | **0** | améliorée |
| `TH2D-PROJECT-001` (HARD) | 30 | 30 | inchangée |
| `TH2D-ROOM-001` (conseil) | 489 | **456** | améliorée |
| `TH2D-SIZING-001` (conseil) | 168 | 169 | stable |
| `TH2D-CIRC-004` (conseil) | 50 | **74** | **dégradée** |

Aucune règle bloquante dégradée, deux améliorées : quatre pièces de plus
reçoivent leur mobilier, et la dernière pièce principale sans façade
disparaît. La condition est remplie, le retrait est appliqué.

**La contrepartie est réelle et assumée** : `TH2D-CIRC-004` — circulation
contenue au regard de sa desserte — se dégrade de 24 signalements. C'est un
conseil, non bloquant, et il dit que le couloir garde plus de surplus qu'il
n'en dessert. À surveiller quand la typologie reprendra la distribution :
c'est exactement la grandeur qu'elle est censée corriger.

Empreinte du banc : **`520b8ebb` → `5bd33591`**. C'est la première fois
qu'elle bouge depuis son établissement, et c'est voulu — le moteur ne produit
plus les mêmes plans. Toute comparaison antérieure doit être refaite.

`parentVertical` et `hasHub` ne servaient qu'au peigne et disparaissent avec
lui ; `layout()` perd un paramètre. Le mécanisme n'est pas laissé derrière un
drapeau : le projet a déjà payé le coût d'un drapeau éteint qu'un document
continuait d'annoncer (§2). Ce qui reste est un commentaire, et le moyen de
refaire la mesure :

```bash
node scripts/scan-capacites.mjs --sans-peigne
```

Ce drapeau du banc a été conservé : il permet de rejouer l'ablation sans
toucher au moteur. Sans lui, la source est chargée telle quelle.

---

## 5. Ce que ces faits font au choix de méthode

Le protocole `APPROCHES_GENERATION.md` §8 recommandait « commencer par G,
viser C ». Les mesures ne le contredisent pas — elles le renforcent, et
déplacent un argument.

**En faveur de la typologie (G)** : le §1.1 est décisif. Une typologie ne vaut
que si l'on connaît la forme de la réponse ; on la connaît, sur 840 plans sur
840. Et le §1.2 dit que la capacité est là — une typologie n'aurait donc pas
à réclamer plus de surface, seulement à mieux la disposer.

**Contre la cible C, au moins pour l'instant** : le §3 retire au dual
rectangulaire sa justification technique sur le graphe actuel. Il en reste
une, intacte et non mesurable : le **graphe éditable**, où l'utilisateur
composerait ses propres relations. Le §8 le disait déjà — « le seul argument
sérieux, et il ne sortira d'aucune mesure faite aujourd'hui ». Il faut le
peser comme un pari sur la feuille de route, pas comme un résultat.

**Ce que les faits ajoutent au protocole** : l'essai typologie doit être
mesuré **par forme d'enveloppe et par taille de programme**, pas seulement en
moyenne. C'est là que le moteur actuel se casse — U et gros programmes — et
une moyenne globale masquerait une victoire partielle. Le §7
d'`APPROCHES_GENERATION.md` avertissait déjà qu'« une typologie porte sa
propre enveloppe » et que le chantier 1 changerait de sens : le §1.3 chiffre
ce que cela coûterait, puisque c'est précisément sur le U que l'existant
échoue le plus.

---

## 6. Arbitrages rendus le 21 août

La demande est explicite : **le moteur doit pouvoir produire plusieurs
espaces de circulation.** Elle est fondée — mesurée sur les quinze programmes
du banc, **dix dépassent les cinq dessertes** qu'un couloir unique sait
porter, et cela commence dès 80 m² / 3 chambres :

| Programme | Pièces | Desservies par la circulation |
|---|---:|---:|
| 75 m² 2ch | 6 | 5 |
| 80 m² 3ch | 7 | **6** |
| 120 m² 4ch | 10 | **8** |
| 150 m² et au-delà, 5ch | 11 | **9** |

Le seuil de cinq n'est pas une convention : il vient du plan de référence
dessiné à la main, qui dessert cinq espaces avec un seul dégagement
(`test-instrument.mjs`).

### 6.1 — Les circulations multiples passeront par la typologie

**Elles ne sont pas un chantier séparé.** Les obtenir dans la guillotine a
échoué deux fois, pour une cause qui n'a pas bougé : cette découpe ne sait
pas tenir une adjacence entre deux pièces désignées. Une typologie place
couloirs, séjour et pièces par construction ; la question ne se pose plus.

Une mesure a d'ailleurs retourné l'intuition contraire, qui était de router
les nouveaux couloirs par le séjour :

| Adjacence demandée | Demandées | Réalisées |
|---|---:|---:|
| séjour ↔ circulation | 360 | **60,6 %** |
| circulation ↔ autre pièce | 2 520 | 81,3 % |

**L'adjacence la plus ratée du moteur est déjà celle qui relie le couloir au
séjour** — `hubSplit()` plaque la circulation contre une frontière, donc loin
du séjour. S'appuyer dessus pour distribuer plusieurs couloirs aurait
reproduit les 42,5 % de circulations disjointes de la tentative 1.

### 6.2 — Trois choix rendus

**Topologie : circulations isolées, sans exigence mutuelle.** Aucune
adjacence couloir↔couloir n'est demandée ; chaque dégagement doit être
atteignable, sans plus. C'est la topologie la moins contrainte, donc celle
qui laisse le prototype répondre à sa question sans en porter deux.
*Conséquence à tenir* : `TH2D-GRAPH-002` — toutes les pièces accessibles —
devient la **seule** garantie contre un dégagement orphelin. Elle doit être
vérifiée explicitement sur le prototype, pas supposée.

**Enveloppe : la typologie porte la sienne.** C'est ce que recommandait
`APPROCHES_GENERATION.md` §7. Le chantier 1 — quatre formes livrées et
testées — est **suspendu, pas annulé** : il reprendra une fois connue la
forme que les typologies réclament. `test-formes.mjs` reste au vert et garde
l'existant.

**Périmètre : mono et bi-couloir mesurés en parallèle.** Sur le même banc et
les mêmes graines, pour obtenir l'effet propre de la seconde circulation —
la méthode d'ablation employée au §1.4, et la seule qui établisse une
causalité ici. Coût d'écriture doublé, assumé pour ne pas confondre l'échec
de la typologie avec celui de la seconde circulation.

### 6.3 — Reste ouvert

**Le graphe éditable est-il une exigence de la feuille de route ?** C'est la
seule question dont la réponse commanderait le dual rectangulaire plutôt que
la typologie, et elle ne sortira d'aucune mesure. Elle n'a pas à être
tranchée pour démarrer : la typologie n'interdit pas d'aller vers le dual
ensuite, l'inverse est faux (§8, test de non-regret).

## 7. Essai typologie — résultats, 21 août 2026

Prototype jetable dans `scripts/proto/`. Il ne tire pas la disposition : il
pose le couloir desservant et calcule ses dimensions. Deux variantes, mesurées
en parallèle comme l'arbitrage le demandait.

### 7.1 — Conformité, contre le moteur actuel

Quatorze programmes. Le témoin est mesuré au **meilleur de trois graines**,
donc avantagé.

| Méthode | Plans | Adjacences | Plans sans `HARD` | ms/plan |
|---|---:|---:|---:|---:|
| témoin | 42 | 93,8 % | 37/42 (88 %) | 424 |
| mono-couloir | 14 | **100 %** | 13/14 (93 %) | **60** |
| bi-couloir | 13 | **100 %** | **13/13 (100 %)** | 62 |

Sept fois plus rapide, sans budget de recherche — il n'y a rien à chercher.

Un programme (45 m²) est **refusé avec un motif** au lieu d'être bâclé :
c'est le critère « sait dire l'impossible » du §8, qu'aucune méthode par
tirage ne sait honorer.

### 7.2 — Diversité : le cas n°1, pas le n°2

Le protocole pré-enregistrait trois issues. La deuxième — « adjacences à
100 % mais diversité effondrée » — était annoncée comme la plus probable. Une
typologie est déterministe : un programme, un plan.

Elle se répare sans changer de méthode, en faisant varier ce que la topologie
laisse libre : répartition des pièces entre bandes, ordre dans une bande,
échange des deux bandes, transposition du plan. **Aucune ne touche aux
adjacences** — une pièce borde son couloir quelle que soit sa place.

Trente graines par programme, signature du banc (`id:x0,y0`) :

| Programme | Mono | Bi |
|---|---:|---:|
| 55–75 m² | 21–24 | 8–14 |
| 90–100 m² | 30 | 22–30 |
| 150 m² et plus | 30 | 30 |

Adjacences **100 %** partout, **270 plans sur 270 sans violation bloquante**.

Le seuil du §8 est vingt signatures sur trente. Il est franchi partout au
mono, et au bi dès 90 m². **La règle de décision applicable est donc la
première** : *« adjacences à 100 % et diversité au-dessus de vingt signatures
→ la typologie devient la méthode, le tirage devient le producteur de
variantes à l'intérieur d'une typologie »*.

Réserve honnête : sous 90 m², le bi-couloir descend à 8–14 signatures. Deux
couloirs dans un petit logement laissent peu de jeu — ce qui est aussi une
raison de ne pas les y imposer.

### 7.3 — Le défaut qui reste : `TH2D-CIRC-004`, systématique

Le conseil se déclenche sur **tous** les plans bi-couloir et sur douze plans
mono. Cause connue et structurelle : mes couloirs **traversent** toute la
largeur, donc ils sont plus longs que leur desserte ne l'exige. Le plan de
référence dessiné à la main ne fait pas cela — son dégagement s'arrête, et
c'est ce qui lui donne cinq dessertes pour 1,30 × 5,50 m.

Un couloir non traversant est la correction due. Elle n'est pas faite.

### 7.4 — Trois erreurs que la mesure a rattrapées

Aucune n'aurait été trouvée par le raisonnement, et chacune dit quelque chose
sur le moteur :

**Une pièce a deux minima, pas un.** Le WC a 0,90 m de côté minimal — assez
pour le meubler, pas pour le desservir : `minDesserte` exige 1,00 m de mur
commun. Posé à sa largeur minimale il touche le couloir sans qu'aucune porte
n'y entre. Le moteur actuel ne fait pas cette distinction, faute de placer
les pièces en connaissance du graphe.

**Une largeur réglementaire ne se met pas à l'échelle.** La première
correction de surface homothétiait le plan entier, et rétrécissait le couloir
sous 1,20 m — `TH2D-CIRC-001` sur trois programmes. Il fallait corriger la
cible, pas le dessin.

**Deux endroits décidant séparément d'une même chose se désaccordent.** La
répartition des pièces entre les deux couloirs était calculée d'un côté par le
graphe, de l'autre par la géométrie. Tant que les deux suivaient la même règle
déterministe, elles coïncidaient ; dès que le tirage a perturbé l'une, les
adjacences sont tombées de 100 % à 63 %. C'est exactement le défaut reproché à
la guillotine, reproduit à l'identique. Le graphe fait autorité, la
disposition l'exécute.

### 7.5 — `CIRC-004` corrigé : les couloirs ne traversent plus

Le défaut du §7.3 est traité. Trois dispositions ont été essayées, et les deux
premières ont échoué pour des raisons qui valent d'être gardées.

**Couloirs traversants** (v1). Adjacences à 100 %, mais un couloir sur toute
la largeur est plus long que sa desserte ne l'exige : `TH2D-CIRC-004` sur
tous les plans bi-couloir.

**Bandes empilées, colonne du séjour à droite** (v2a). Avec deux couloirs,
trois bandes portent la hauteur à près de dix mètres ; la colonne du séjour
tombe alors sous ses 3,00 m de côté. **Trente refus sur trente**, sur tous les
programmes sauf le plus grand.

**Ailes autour d'une colonne centrale** (v2b) — l'idée écartée au départ comme
« trop de domaines à faire coïncider », et c'était la bonne :

```
┌──────┬──────┬────────┬──────┬──────┐
│  bande nord │        │ bande nord  │
├─────────────┤ SÉJOUR ├─────────────┤
│  COULOIR 1  │        │  COULOIR 2  │
├─────────────┤        ├─────────────┤
│  bande sud  │        │ bande sud   │
└──────┴──────┴────────┴──────┴──────┘
```

Chaque couloir ne fait que la largeur de son aile et bute contre la colonne,
qu'il touche sur 1,20 m. Les couloirs ne se touchent pas — arbitrage
« circulations isolées » — et l'accessibilité passe par le séjour, jamais par
une pièce privative.

Mesure finale, nombre de couloirs **déduit du besoin** (cinq dessertes par
dégagement, seuil du plan de référence), 14 programmes × 30 graines :

| | Témoin | Typologie |
|---|---:|---:|
| Adjacences réalisées | 93,8 % | **99,9 %** |
| Plans sans violation bloquante | 88 % | **92,4 %** |
| Refus non motivés | — | **0** |
| Durée | 424 ms | **136 ms** |

Les 32 plans en défaut sont **le seul programme de 45 m²**, que
`TH2D-PROJECT-001` déclare incompatible avec sa surface — une chambre, cuisine
séparée, WC et salle d'eau ne tiennent pas dans 45 m², et le témoin ne s'en
sort pas mieux. Hors ce programme, le score est de **388 plans sur 390**.

`TH2D-CIRC-004` ne subsiste qu'à 220 et 250 m², où la surface disponible
étire les ailes. Un couloir ne dessert plus que ce qu'il borde.

Quatre corrections ont été nécessaires, chacune trouvée par la mesure :

1. **La cuisine change de côté selon l'aile.** Posée en fin de bande, elle
   touche la colonne depuis l'aile gauche mais s'en éloigne depuis la droite —
   88 à 93 % d'adjacences au lieu de 100.
2. **Minimiser la circulation à surface égale.** Plusieurs hauteurs donnent la
   surface demandée ; rien ne départageait celle qui étire les ailes de celle
   qui les resserre. Deux passes : la surface d'abord, la circulation ensuite.
3. **Huit répartitions au lieu d'une.** Les deux ailes doivent partager une
   hauteur, et l'intersection de leurs intervalles peut être vide pour un
   découpage et pleine pour un autre — vingt et un refus sur trente à 100 m²,
   pour un programme qui tenait.
4. **Un repli qui passe devant n'est plus un repli.** La disposition en bandes,
   prévue pour les petits logements sans distribution centrale, se déclenchait
   dès le premier découpage malheureux et servait des plans en bandes là où une
   colonne était possible : 96,9 % d'adjacences au lieu de 99,9 %.

## 8. La typologie remplace le tirage — 21 août 2026

**Décision rendue** : la typologie devient la méthode, et le nombre de
dégagements devient une donnée du programme.

`assets/typologie.js` porte la disposition ; `generatePlan()` pose au lieu de
chercher ; `buildProgram()` crée autant de circulations que le besoin en
demande, au seuil de cinq dessertes. `faconner` vaut désormais `false` :
cession de circulation et décrochements rattrapaient une découpe qui ne visait
pas juste, et une disposition posée n'a rien à rattraper.

### 8.1 — Ce que le banc dit

Empreinte `5bd33591` → **`e911ecff`**. Comparaison à graine égale :

| Règle | Guillotine | Typologie | |
|---|---:|---:|---|
| `TH2D-ROOM-001` (conseil) | 456 | **291** | −165 |
| `TH2D-SIZING-001` (conseil) | 169 | **130** | −39 |
| `TH2D-CIRC-004` (conseil) | 74 | **56** | −18 |
| `TH2D-ROOM-002` **(HARD)** | 45 | **80** | +35 |
| `TH2D-FACADE-001` **(HARD)** | 0 | **9** | +9 |

**Vingt-deux configurations sur vingt-quatre ne produisent plus aucune
violation bloquante** — `0/30` sur toute la série. Les deux qui restent sont
`35 m² 0ch KW` et `45 m² 1ch KW`, saturées à 100 % : leurs minima cumulés
dépassent la surface demandée, et `TH2D-PROJECT-001` les refuse déjà. Ce sont
elles qui portent la quasi-totalité des +35 et des +9.

### 8.2 — Trois régressions, dont une non anticipée

**Les rangements ont disparu.** Ils naissaient de `carveCirculation()`, qui
cédait le surplus du couloir aux pièces bordières sous forme de bandes
`storage`. Avec `faconner: false`, cette cession ne s'exécute plus : aucune
pièce n'a plus de partie de rangement, `test-contour.mjs` échoue sur ce point
et les règles `TH2D-RANGEMENT-*` n'ont plus rien à contrôler. **Ce n'était pas
prévu, et c'est une perte de fonction réelle** — le plan de référence dessiné
à la main porte des placards toute largeur en fond de chambre. La typologie
devra les poser elle-même.

**La diversité chute sous 80 m².** De 2 à 15 signatures sur 30, contre 26 à 30
au-dessus. Un petit logement laisse peu de jeu à la disposition ; le seuil de
vingt du protocole n'est plus tenu sur cette moitié de la série.

**Les programmes saturés sont servis dégradés.** La typologie relâche ses
contraintes en deux paliers plutôt que de refuser — d'abord la largeur de
desserte, puis les côtés minimaux. C'est délibéré : l'interface accepte ces
programmes, quelque chose doit s'afficher, et les règles le signalent. Mais le
relâchement produit des pièces non meublables là où l'ancien moteur en
produisait de conformes.

**Les formes d'enveloppe ne sont plus servies.** `test-formes.mjs` échoue, et
c'est la conséquence assumée de « la typologie porte sa propre enveloppe » :
le chantier 1 est suspendu, pas annulé.

### 8.3 — Ce que la bascule rend

Deux circulations à partir de 80 m², les adjacences réalisées, le séjour
central au contact de chaque dégagement, un plan posé en quelques dizaines de
millisecondes au lieu de six mille tirages — et, pour la première fois, un
moteur qui peut dire pourquoi un programme ne tient pas.

### 7.6 — Ce qui n'est pas fait

Le prototype vit dans `scripts/proto/` et **rien n'est branché** :
`generator.js` produit toujours une circulation unique, et l'interface
n'affiche donc qu'un couloir. C'est délibéré — brancher une typologie sans
sa diversité aurait fait chuter le produit à un plan par programme.

La diversité étant acquise, le branchement devient un choix d'engagement :
transformer un prototype jetable en méthode de production. Il reste à
trancher, avec `CIRC-004` pour préalable.

## 8. Réserve

Les cinq faits du §1 sont des mesures faites sur ce moteur, ce banc, ces
graines. Le §3 est un raisonnement, pas une mesure : il énonce que
l'exigence réelle est un sur-graphe, ce qui se vérifie dans `rules.js`
(`TH2D-GRAPH-001` ne teste que la présence des arêtes demandées), mais la
conclusion qu'on en tire sur le dual rectangulaire reste une déduction.

Ce projet a une règle empirique qu'il vaut mieux respecter : ce qui a été
tranché par la mesure a tenu, ce qui a été tranché par le raisonnement s'est
révélé faux. Le §3 est du raisonnement. Il mérite d'être contredit avant
d'être suivi.
