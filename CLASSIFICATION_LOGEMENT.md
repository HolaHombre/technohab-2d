# Classification des logements — et rendre la qualité mesurable

**Ouvert le 24 septembre 2026**, en réponse à `DECISIONS_REGLES.md` décision 8
(seuils contextuels) et aux questions 12 et 22 de `QUESTIONS_MODELE.md`,
toutes deux répondues « ce sera un chantier » plutôt que tranchées sur le
moment.

## 1. Ce que ce chantier peut honnêtement livrer aujourd'hui

Deux choses très différentes se cachent derrière la demande, et les
confondre serait le premier défaut à éviter :

1. **Classer un logement** — lui donner un type (T1 à T6) et une bande de
   taille. C'est mécanique, ça se code, ça se vérifie.
2. **Étalonner un poids N3** — savoir si `VAL-SCORE-SERVICES-DISTANCE-EXCESS-WEIGHT-001`
   vaut vraiment 10 points par mètre plutôt que 6 ou 20. Ça demande un
   jugement humain sur des plans, et `PROTOCOLE_MESURES.md` le dit sans
   détour : ses quatre mesures exigent toutes un humain — cinq juges
   architectes, des plans dessinés à la main, ou une personne qui remplit un
   quiz devant un plan.

Ce document construit la **classification** (§2) et **l'instrumentation qui
recueillera l'étalonnage** (§3) — le tuyau, pas l'eau qui doit y couler. Le
jugement lui-même n'est pas un livrable de code.

## 2. La classification

### 2.1 Typologie T1–T6 — sourcée, sans risque

`DECISIONS_REGLES.md` décision 8 a coché deux options à la fois, chose rare :
classes de logement **et** typologie T1–T6 « alignée sur les statistiques
publiées ». La seconde ne s'invente pas — c'est la convention immobilière
française standard, un nombre de pièces principales :

| Typologie | Chambres | Déjà couvert par |
|---|---:|---|
| T1 | 0 | `bedrooms === 0`, déjà la condition du studio dans `TYPOLOGIES_LOGEMENT` |
| T2 | 1 | — |
| T3 | 2 | — |
| T4 | 3 | — |
| T5 | 4 | — |
| T6 | 5 | plafond déjà imposé par `normalizeOptions` (`Math.min(5, …)`) |

`T = bedrooms + 1` couvre exactement la plage 0–5 déjà bornée par le
moteur : ce n'est pas une coïncidence, c'est la même donnée vue par deux
bouts. Source : `professional`, convention d'usage du secteur (décret
n° 87-713, et l'usage notarial qui s'y aligne), pas une invention du projet.

### 2.2 Classe de taille — provisoire, et il faut le dire

`DATASOURCE_EQUIPEMENTS.md` a déjà tenté de sourcer des bandes de surface et
s'est arrêté : « les documenter vides est préférable à les remplir de
moyennes non sourcées ». Ce chantier ne contredit pas cette prudence — il
propose des bandes **explicitement conventionnelles**, à étalonner comme
tout le reste :

| Classe | Surface | Statut |
|---|---|---|
| Petit | 35–55 m² | convention N3 ; 35 m² est déjà le plancher du moteur (`normalizeOptions`), pas une convention en soi |
| Moyen | 55–90 m² | convention N3 |
| Grand | 90–140 m² | convention N3 |
| Très grand | ≥ 140 m² | convention N3 ; 250 m² est déjà le plafond du moteur |

Aucune de ces bandes ne pilote encore un seuil de PONDERATION. Les faire
piloter un poids serait fabriquer la Table B/C que `DATASOURCE_EQUIPEMENTS.md`
refuse déjà de fabriquer. La classification est publiée sur le plan ;
**rien n'en dépend encore**.

### 2.3 Ce que ça débloque, et ce que ça ne débloque pas encore

- **Débloqué** : un plan porte désormais son type et sa classe, lisibles à
  l'export. C'est la donnée que la question 22 réclamait pour instruire, un
  jour, la détection d'un programme insatisfiable avant génération — ce
  chantier-là reste à ouvrir, il a besoin de sa propre mesure sur plusieurs
  configurations, pas d'une déduction depuis la classe seule.
- **Non débloqué** : aucun poids de `PONDERATION_AGENCEMENT.md` ne varie
  encore par classe. Ce serait le pas suivant, et il attend la Table B/C.

> **Décision du 24 septembre 2026 — le §3 est gelé.** L'étalonnage de la
> qualité perçue (mesures humaines de `PROTOCOLE_MESURES.md`) n'aura lieu
> qu'**avant la release** : le moteur n'est pas encore assez complet ni
> diversifié pour que ce jugement porte sur autre chose que ses manques. Le
> travail se concentre sur **l'ajout de mobilier et de pièces** et sur la
> classification, avec des chiffres essayés, posés comme hypothèses et
> surveillés (§5 et §6). L'instrumentation du journal reste à faire, sans
> urgence.

## 3. Rendre la qualité mesurable — l'instrumentation, pas la mesure (gelé)

Aujourd'hui, `assets/evaluation.js` n'enregistre que `plan.score`, le total.
Aucune trace du détail par critère, ni de la priorité choisie. Un avis donné
sur un plan ne peut donc jamais dire *lequel* des 61 poids `PROVISIONAL`
comptait dans ce cas précis — seulement si le total, en bloc, corrèle.

**Ajouté** : `scoreBreakdown`, `options.priorities` et la classification du
§2 rejoignent chaque entrée du journal. `scripts/correlation-avis.mjs`
apprend à corréler *par critère* quand le volume le permet, avec la même
garde que l'existant — aucune conclusion sous le seuil de plans nécessaire.

**Ce que ça ne fait pas** : remplir le journal. Les 61 valeurs
`PROVISIONAL` de `assets/canonical-values.data.js` restent à étalonner par
un jugement humain — celui de Théo via le quiz embarqué (mesure 4, biaisée
mais immédiate), ou celui de juges recrutés (mesure 1, à l'aveugle, seule
non biaisée, non recrutée à ce jour). Ce document construit le tuyau ; le
remplir n'est pas un choix de code.

## 4. Ce que ce chantier ne tranche pas

- La détection d'impossibilité avant génération (question 22, second usage
  de la classification) — chantier séparé, sa propre mesure.
- Toute valeur de Table B ou C — restent explicitement non sourcées.
- Le recrutement des cinq juges de la mesure 1 — décision humaine, pas de
  code.

## 5. Ce que le moteur produit aujourd'hui — baseline du 24 septembre 2026

Relevé par `scripts/monitor-diversite.mjs` (graine de base 20260924, 6
tirages × 20 configurations, empreinte `6fb0ed60`). Des fréquences mesurées,
pas des cotes sourcées.

| Constat | Mesure | Ce que ça dit |
|---|---|---|
| Aucune diversification par la taille | de 60 à 250 m², **6 types de pièce** (7 avec bureau), 14 équipements distincts (17 avec bureau) | un T6 de 250 m² reçoit les mêmes pièces qu'un T2 de 60 m² : la Table C est vide **dans le code aussi** |
| Types du socle jamais générés | `dining`, `entree`, `buanderie`, `cellier`, `local_technique`, `garage` | six types sur treize sont décrits et inertes |
| Équipements posés | 17 ids sur ~29 du socle ; `wardrobe` domine (294), `bookcase` 23 | la moitié du mobilier décrit n'apparaît jamais |
| Fragilité aux extrêmes | 35 m² sans bureau : 0/6 ; 45 m² avec bureau : 0/6 | à surveiller, non instruit — un studio échoue *sans* bureau et réussit *avec* (5/6), ce qui n'a pas d'explication évidente |

## 6. Les questions à se poser, avec les chiffres déjà décidés

Chiffres **déjà rendus** (`DECISIONS_PROGRAMME.md`) — à réutiliser, pas à
réinventer : rangement comme pièce au-delà de **80 m²** ; dressing si
profondeur praticable ≥ **1,50 m** (un linéaire) ou **2,10 m** (deux) ;
repas **obligatoire dans tout plan**, y compris T1 (deux places praticables).
Ce dernier n'est **pas tenu** : `dining` n'est jamais généré.

Questions ouvertes, chacune à essayer sur le moniteur avant de figer :

1. **Repas.** Zone du séjour ou pièce ? La décision dit « hébergée par défaut,
   émergente sous conditions » : quelles conditions, à partir de quelle classe ?
2. **Entrée.** Pièce autonome à partir de quelle classe, ou reste-t-elle un
   seuil hébergé (état C4 actuel) ?
3. **Buanderie / cellier / local technique.** Émergent-ils par la surface
   (classe), par une option utilisateur, ou par un besoin dérivé (second
   sanitaire, réseaux) ? Hypothèse à tester : buanderie dès « grand »,
   local technique dès « très grand ».
4. **Garage.** Programme de logement ou hors périmètre ? `parking_space` existe.
5. **Second sanitaire.** À partir de quelle typologie ? (`bathrooms` est déjà
   une option ; la question est celle du défaut.)
6. **Mobilier.** Quels équipements du socle ne sont jamais posés, et pourquoi :
   optionnels jamais activés, ou jamais atteints par une pièce ?
7. **Les bandes de classe elles-mêmes** (55/90/140 m²) : le moniteur montrera
   si la composition change réellement à ces seuils, ou ailleurs.

Méthode : une question à la fois, un essai borné, le moniteur avant/après à
graine égale, une empreinte comparée. Un chiffre reste `PROVISIONAL` tant
qu'il n'a pas tenu sur le banc.

## 7. Premier essai — le repas (25 septembre 2026)

`DECISIONS_PROGRAMME.md` §2.1 : repas obligatoire dans tout plan. Essais
successifs, chacun mesuré par `scripts/monitor-diversite.mjs` (graine 20260924,
6 tirages × 20 configurations).

| Essai | Changement | Résultat mesuré |
|---|---|---|
| 1 | le séjour héberge toujours une table à 4 places | table posée dans tous les plans valides ; **35 m² avec bureau 5/6 → 0/6**, 45 m² 3/6 → 2/6 |
| 2 | recul de chaise 0,60 / 0,80 / 1,20 (sourcé, `agencement/salon.md`) | plus bas aux petites tailles (45 m² 0/6) |
| 3 | plancher 2 places, 4 places dès 24 m² | **le solveur de placement diverge : plus de 45 s** sur un cas de 45 m² (graine 20260959) — l'interface serait figée |
| 4 | hébergé seulement au-dessus de la classe « petit » (≥ 55 m²) | classes petites **inchangées** (3/6, 5/6) ; dès 60 m² tout est valide, plus long tirage 2,2 s |
| 5 | `dining` ajouté aux types résolus par gamme (M4c) | la table monte à 4 places, mais **seulement là où la place existe** : ≥ 140 m² avec le canapé d'angle |

**Suite du même jour — essais 6 à 11**, après instruction du solveur (§8).

| Essai | Changement | Résultat mesuré |
|---|---|---|
| 6 | repas hébergé partout, solveur borné | plus de divergence (plus long tirage 7 s), mais 35 m² avec bureau 1/6 |
| 7 | plancher = table **adossée** 2 places (1,20 × 0,60, contre un mur, recul de chaise en façade) | 35 m² avec bureau 2/6 ; `tv_unit` et `armchair` reviennent à 83 |
| 8 | table **non requise** (repli honnête) | fingerprint = baseline : une option sans `minRoomArea` n'est jamais retenue |
| 9 | idem avec `minRoomArea: 0` | **validité identique à la baseline partout** ; table posée dans 100 % des plans valides dès 45 m², **sauf le studio de 35 m²** (0/5) |
| 10 | salle autonome, adjacence séjour **obligatoire** | validité effondrée dès 90 m² (0/3) : le séjour ne peut pas toucher circulation, cuisine et salle |
| 11 | salle autonome desservie par la circulation, ouverture sur le séjour **souhaitée** | **validité identique partout**, 7 types de pièce dès 90 m² (8 avec bureau) |

**Retenu : essai 9 pour le coin repas, essai 11 pour la salle.** Décisions de
Théo (25 septembre 2026) : coin repas **adossé à la cuisine** pour les petits
logements ; salle à manger autonome **dès la classe « grand » (90 m²)**, par
une case du questionnaire (Automatique / Séparée / Dans le séjour) dont le
défaut suit la classe ; bandes de classe **conservées et surveillées**.

**Ce que ça coûte, mesuré.** Sur une enveloppe en L, la salle dédiée rend la
forme intenable à 110 m² (`test-formes`, repli sur le rectangle) : le seuil
automatique monte à 140 m² pour les L et U — hypothèse de la classe × la forme,
à confirmer. À 120 m² en L, un coin repas hébergé fait retomber le canapé
d'angle en canapé simple.

**Écarts nommés, non résolus.**
1. Studio de 35 m² : aucune table posée (0/5). Le repli est honnête (le plan
   reste valide, sans repas) mais la décision « obligatoire, T1 compris »
   n'est pas tenue à cette taille.
2. `dining` n'apparaît comme pièce qu'en salle autonome ; l'adjacence avec le
   séjour est **souhaitée**, jamais imposée (essai 10). Le taux de contact réel
   n'est pas encore mesuré.
3. Cinq types du socle restent inertes : `entree`, `buanderie`, `cellier`,
   `local_technique`, `garage`.

## 8. Robustesse du solveur de placement (instruit le 25 septembre 2026)

**Le défaut.** Un cas de 45 m² (graine 20260959) demandait plus de 45 s, sans
fin observée : l'interface, synchrone, serait figée. Profilé (`--cpu-prof`) :
`usageSets` et `poses` de `placement.js` = 40 s sur 45 s.

**Deux causes distinctes, deux corrections mesurées.**
1. **Les poses d'un équipement étaient recalculées à chaque nœud** (le
   générateur relancé) alors qu'elles ne dépendent ni des poses posées ni de
   la profondeur. Mémoïsées, remplies à la demande **dans le même ordre** : la
   recherche visite les mêmes nœuds, seul le coût change. 45 s+ → 12 s.
2. **Aucune borne sur la dernière tentative.** Trois équipements et une
   acceptation finale presque jamais satisfaite : **30 millions de nœuds** pour
   une seule résolution. Sur 3 884 résolutions du banc, 99 % tiennent en moins
   de 750 nœuds, le maximum sous plafond est ~12 000. Plafond par défaut :
   **250 000** (`DEFAULT_MAX_NODES`), un refus borné signalé par
   `searchLimitReached`. 12 s → **1,5 s**.

**Ce qui n'est pas réglé.** Les échecs de petits plans restent lents (35 m² :
jusqu'à 5 s pour ne rien trouver). Le plafond borne le pire cas, il ne rend
pas la recherche intelligente ; un élagage sur l'acceptation finale reste à
instruire. Le test `test-repas.mjs` garde la borne.

## 9. Ce que la classification pilote maintenant

Décidé le 25 septembre 2026 : en premier **l'émergence des pièces** (Table C)
puis **les poids de PONDERATION**. Premier acquis : le moniteur montre une
composition qui dépend de la classe.

| Classe | Types générés (hors bureau) | Repas |
|---|---|---|
| petit (< 55) | séjour, chambre, cuisine, salle d'eau, WC, circulation | coin adossé, quand la place existe |
| moyen (55–90) | idem | coin adossé, table 4 places si la place le permet |
| grand / très grand (≥ 90) | + **salle à manger** | pièce dédiée, table 4 places, buffet dès 12 m² |

Table C observée : une pièce de plus, à partir de 90 m². C'est peu ; la suite
(entrée, buanderie, cellier, local technique, garage) est ce qui la remplira.

## 10. Suite

La table de programme par bande transmise par Théo (26 septembre 2026) reprend
et dépasse ce document : ses colonnes (12/20/25/35/50/80 m²) remplacent à terme
les bandes 55/90/140. Voir `TABLE_PROGRAMME_BANDES.md`.
