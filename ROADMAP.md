# Roadmap — TechnoHab

Document de pilotage du générateur de plans 2D.

**Mise à jour : 3 septembre 2026**

**Statut : M0 à M5.2, dont M5.1 produit, M4c limité, C-P1.2 et C-P2 sont
livrés et branchés. M5.3 est un prototype gelé, non accepté comme lot terminé.
M5.4 — audit amont piloté et refonte de la roadmap — précède désormais la
décision I1 d'intégration des autres pièces, puis M6.**
Le mobilier, la porte, le passage
face-à-face, la longueur de desserte, les topologies explicites et le parcours meublé participent désormais à la génération. Trois audits techniques
(26–27 août) sont au §6.1 bis ; l’audit d’émergence fonctionnelle du même jour
est au §6.1 ter et a produit [`DOCTRINE.md`](DOCTRINE.md). Les **trois leviers
d’agrément** sont tranchés au §6.0. Horizons produit tranchés au §1 bis :
**V1 = proposeur honnête (porte C)** ; **cap post-V1 = co-auteur (porte E)** —
sans prétendre à l’auteur au sens plein. **M4 est livré et son témoin a été
rejoué : la porte A est rouverte** (§6.1 quater et §6.4). Suite en **trois
flux** : M, C, F.**

Documents liés : [`README.md`](README.md) (point d'entrée),
[`ETAT_MOTEUR_PROCEDURAL.md`](ETAT_MOTEUR_PROCEDURAL.md) (état d'ingénierie,
preuves et limites), [`CARTOGRAPHIE_MOTEUR.md`](CARTOGRAPHIE_MOTEUR.md)
(chaîne réellement publiée), [`DOCTRINE.md`](DOCTRINE.md) (doctrine globale — fait foi),
`DECISIONS_PROGRAMME.md` (émergence repas / bureau / dressing / rangement),
`SUIVI_REGLES_PIECES.md` (état consolidé pièce par pièce,
défauts localisés), `agencement/` (valeurs d'usage sourcées par typologie),
`SOCLE_AGENCEMENT.md` (équipements, placement, PMR),
`DOCTRINE_AGENCEMENT.md` (pré-calcul des gabarits, niveaux de règles),
`DOCTRINE_CIRCULATION.md` (la circulation, ses mesures et les audits §8 à §10),
`APPROCHES_GENERATION.md` (revue des méthodes de génération, choix de fond),
`DATASOURCE_EQUIPEMENTS.md` (sourcing du mobilier et des dégagements),
`GAMMES_EQUIPEMENTS.md` (plages de tailles d'équipements, mobilier manquant),
`RESOLUTION_PROGRAMME.md` (M5.2, replis de programme traçables),
`AUDIT_QUALITE_PLANS.md` (spécification du prototype M5.3 gelé ; l'audit M5.4
n'en dépend pas),
`OUVERTURES_ET_PARCOURS.md` (ouvertures en façade, cheminement, ordre de coopération),
`PLACEMENT_ET_ADJACENCES.md` (nature des adjacences, placement des pièces),
`MURS_EPAIS.md` (murs dimensionnés, surfaces utiles et méthode MVP),
`VEILLE_NORMATIVE.md` (sources, cotes tracées, matrice de contrôle),
`DA_ICONES_PLAN.md` (icônes de pièces),
`DA_CHEMINEMENT_PLAN.md` (parcours de desserte et accès),
`DA_FORMES_ENVELOPPE.md` (vignettes de choix de forme),
`../Wonderland/DA_GRAPHIQUE.md` (direction artistique historique de Wonderland).

*Depuis le 14 septembre 2026, TechnoHab possède son dépôt autonome dans
`~/Developpement/TechnoHab`. Wonderland ne conserve aucune dépendance
technique ; son futur lien public relève du jalon J3.1 de MetaProjet.*

---

## 1. Objectif

Publier une application 2D autonome qui transforme un
questionnaire d'intention en plusieurs plans de principe explicables,
comparables et contrôlés.

Le générateur doit suivre cette chaîne sans raccourci (forme cible ; le
runtime reste en partie room-first — voir [`DOCTRINE.md`](DOCTRINE.md) §7) :

1. recueillir l’intention et les contraintes du projet ;
2. refuser les programmes impossibles ou incomplets ;
3. dériver les **exigences fonctionnelles**, puis les résoudre en pièces,
   zones ou équipements ;
4. produire plusieurs enveloppes et organisations candidates ;
5. contrôler chaque proposition avec des règles identifiées ;
6. classer les propositions valides selon les priorités de l'utilisateur ;
7. restituer le plan, sa typologie (décrite ou contrainte), ses hypothèses
   et ses limites.

TechnoHab est servi depuis `index.html` et ne dépend pas de Wonderland.

## 1 bis. Horizons de release — MVP, V1, cap (tranchés le 27 août 2026)

Décision de produit. Autorité de vocabulaire :
[`DOCTRINE.md`](DOCTRINE.md) §1 bis. Ici : mapping aux portes et lots.

| Horizon | Définition opérationnelle | Lots / portes | Statut |
|---|---|---|---|
| **MVP** | Application autonome ; contrats ; génération locale ; murs ; mobilier dans la boucle ; échecs honnêtes | M0–M2, porte B ; amorce porte C | **largement tenu** (M3.0 livré ; C pas encore ouverte) |
| **V1** | **Proposeur honnête** — plans de principe tenables, explicables, comparables, sans HARD ; domaine domestique 2D borné ; **sans** prétention d’agrément | Porte **C** obligatoire ; porte **D** cible V1 « utile » ; **E hors V1** | **cible de release** |
| **Cap post-V1** | Auteur statistique puis **co-auteur** (moteur propose, humain signe) | Leviers L1–L3 complets ; porte **E** ; F4–F6 sur micro-surfaces | **cap**, pas promesse V1 |

### Ce que la V1 s’engage à être

1. Produire **plusieurs** plans de principe pour une intention donnée.
2. Refuser honnêtement (`IMPOSSIBLE` / `NON_TROUVE`) plutôt que d’afficher un
   plan `HARD`.
3. Montrer hypothèses, maturité des profils, et limites connues.
4. Rester en `file://`, sans dépendance runtime, sans donnée transmise.

### Ce que la V1 s’interdit d’être (et de dire)

1. Un moteur « agréable » ou « architectural » — réserve porte E.
2. Un auteur / concepteur créatif — hors cap même long terme au sens plein.
3. Un substitut au jugement humain sur un projet réel.
4. Une couverture hors domaine (multi-niveaux, extérieurs riches, BIM).

### Critère de sortie V1

La release V1 est déclarable lorsque **la porte C est ouverte** et que
l’interface / le texte produit n’emploient aucun terme de la liste interdite
du §1 bis de `DOCTRINE.md`. La porte D, si ouverte, améliore la V1 (« outil
utile ») sans changer la promesse. La porte E **ouvre le post-V1**, pas la
V1.

### Critère d’entrée dans le cap (post-V1)

On ne parle d’*auteur statistique* / *co-auteur* dans le pilotage produit
qu’après **porte E**. Jusque-là, le cap oriente les lots (M5, M6, F4–F6) ;
il ne figure pas sur l’emballage.

## 2. Principes non négociables

- version 2D uniquement jusqu'à validation du moteur et du questionnaire ;
- fonctionnement local et sur hébergement statique, sans donnée transmise ;
- compatibilité `file://` conservée tant qu'aucun backend n'est requis ;
- séparation stricte entre questionnaire, programme, graphe, géométrie,
  règles et interface ;
- aucune proposition affichée si une règle bloquante n'est pas satisfaite ;
- les préférences améliorent le classement mais ne masquent jamais une
  non-conformité ;
- chaque option du questionnaire doit avoir un effet documenté sur le moteur ;
- chaque règle doit posséder un identifiant stable, un niveau et un message ;
- le plan reste un plan de principe non contractuel.

## 2 bis. Trois flux parallèles, une seule exigence de preuve

La refonte du moteur ne doit pas attendre que toutes les pièces soient
parfaitement documentées. L'inverse serait tout aussi faux : consolider les
pièces dans le modèle actuel les obligerait à épouser des défauts
d'orchestration que le chantier 9 cherche précisément à retirer. La doctrine
fonctionnelle, elle, ne doit ni attendre la perfection du canon, ni
réécrire le poseur avant que les portes M soient tenues.

La suite avance donc sur **trois** flux explicitement séparés :

- **flux M — moteur** : contrat de génération, ordre des décisions,
  topologies, géométrie construite, contrôle, classement et restitution ;
- **flux C — canon des pièces** : usages, équipements, cotes, dégagements,
  relations, variantes, sources et tests, repris pièce par pièce ;
- **flux F — doctrine fonctionnelle** : capacités, fonctions, zones,
  pression spatiale, séparation, résolution multi-candidats — couche
  au-dessus du room-first, définie par [`DOCTRINE.md`](DOCTRINE.md).

Ils avancent en parallèle mais se rencontrent par des contrats versionnés. Le
flux C ne modifie pas une heuristique de génération pour faire passer une
pièce. Le flux M ne décrète pas une cote ou un équipement manquant pour faire
avancer un lot. Le flux F n’ajoute pas de cas spéciaux `if (studio)` : il
généralise. Quand une pièce révèle une capacité absente — porte comme
objet, polygone utile, réseau humide, zone composée — cette capacité devient
un besoin générique du moteur, avec son propre test, jamais une exception au
nom de la pièce.

### Niveaux de maturité d'un profil de pièce

Les statuts `Couvert`, `Partiel`, `Socle seul` et `Absent` de
`SUIVI_REGLES_PIECES.md` décrivent l'implémentation. Ils ne disent pas si les
valeurs sont suffisamment fondées. La roadmap ajoute donc une maturité de
preuve indépendante :

| Niveau | État | Preuve attendue |
|---|---|---|
| **C0 — inventorié** | usages et variantes nommés | périmètre de la pièce et hypothèses d'occupation |
| **C1 — documenté** | équipements et relations recensés | fiche dédiée, contradictions et questions ouvertes visibles |
| **C2 — sourcé** | chaque valeur porte une provenance | statut N1, N2, N3, `norme identifiée` ou `non sourcé` ; aucune source implicite |
| **C3 — modélisé** | exigences exprimées en données | équipements, gammes, zones d'usage, relations et niveaux HARD/GUIDELINE/PREFERENCE |
| **C4 — éprouvé isolément** | le profil résiste à ses cas limites | cas passant, refus attendu, variantes, portes et accès testés hors plan complet |
| **C5 — intégré** | le moteur sait l'employer sans branche spéciale | génération, rapport, export et banc de non-régression |
| **C6 — étalonné** | le profil a rencontré le réel | confrontation au corpus pertinent et/ou revue humaine documentée |

`C2` ne signifie pas « réglementaire » : il signifie que la nature de la
valeur est honnête et transportable jusqu'au rapport. Une convention N3 peut
être meilleure qu'une norme seulement identifiée, si elle est assumée comme
telle et modifiable.

### Règles de coopération

1. Le moteur peut être développé avec un profil à partir de **C3**, à
   condition que le plan et l'export signalent son caractère provisoire.
2. Un plan peut être qualifié de **crédible expérimental** si toutes les
   pièces et tous les équipements structurants qu'il emploie sont au moins
   **C4**, et s'il ne contient aucune violation `HARD`. La mention
   `expérimental` ne disparaît qu'en C5.
3. Une pièce n'atteint **C5** qu'après intégration par un mécanisme générique ;
   une condition `if (type === ...)` ajoutée pour la faire passer maintient le
   profil en C4 et ouvre une dette de moteur.
4. Toute modification d'une valeur relance les tests isolés de la pièce ;
   toute modification d'un mécanisme commun relance le banc complet.
5. Le canon vit dans les fiches, `socle.data.js` et les identifiants de
   valeurs ; le moteur consomme ce canon mais n'en devient jamais l'autorité.
6. À partir du lot C-P0, `SUIVI_REGLES_PIECES.md` doit porter, pour chaque
   pièce, deux statuts : couverture technique et maturité C0–C6.

Le WC séparé et la salle d'eau avec WC intégré servent de **profils pilotes**
pour stabiliser cette méthode. Ils sont les plus affinés, pas déclarés
définitifs. Leur reprise livre le gabarit documentaire, le format de données et
la suite de tests que les autres pièces réutilisent.

## 3. État actuel

### Réalisé

- [x] application autonome intégrée dans `Créer > Numérique` ;
- [x] génération et régénération locales ;
- [x] exploration de découpes rectangulaires par variante, sous budget
  adaptatif à la taille du programme ;
- [x] programme minimal : surface, chambres, salles d'eau, cuisine et WC ;
- [x] graphe d'adjacences élémentaire ;
- [x] contrôle des surfaces minimales, adjacences et accessibilité ;
- [x] export JSON et SVG ;
- [ ] audit humain standardisé lié à la graine et au rang — prototype M5.3
  implémenté et testé, puis **gelé avant acceptation** ; l'audit amont M5.4
  peut être mené avec des relevés manuels et les exports existants ;
- [x] validation structurelle Wonderland et test navigateur sans erreur ;
- [x] journal des générations affiché et persistant : profil, nombre de règles
  évaluées, bloquantes et conseils, candidat retenu sur le budget ;
- [x] référentiel de règles documenté et comparé au dépôt d'origine
  (`technohab/technohab_rules.md` dans le dépôt de développement) ;
- [x] spécification de la direction artistique des icônes de pièces
  (`DA_ICONES_PLAN.md`) et réduction des libellés pour leur faire place ;
- [x] graine explicite par génération, affichée, exportée, rejouable d'un clic
  depuis le journal ;
- [x] cession du surplus de circulation en rangements, et décrochements entre
  pièces mitoyennes : les pièces ne sont plus toutes des rectangles ;
- [x] règle « pièce meublable » adossée au solveur, premier seuil du projet
  qui soit calculé et non décrété ;
- [x] mobilier dessiné sur le plan, sous bascule, emprises seules ;
- [x] socle et solveur chargés à la demande par un chargeur partagé
  (`TechnoHabSocleLoader`), commun au compositeur et à la bascule mobilier ;
- [x] compositeur de pièces : ajout et retrait d'équipements ;
- [x] séparation des violations et des limites connues du moteur, avec cause,
  mesure et suite pour chacune (§3.1 bis) ;
- [x] balayage de capacités sur 24 configurations
  (`scripts/scan-capacites.mjs`).
- [x] pictogrammes de pièces tracés, câblés au rendu et adaptatifs
  (`assets/icons/room-icons.svg`, 18 symboles) ;
- [x] mobilier et équipements tracés à l'échelle, cotes alignées sur le socle
  (`assets/icons/furniture.svg`, 34 symboles, `viewBox` en centimètres : les
  32 identifiants du catalogue courant et 2 symboles en réserve) ;
- [x] socle d'agencement transcrit en donnée exécutable
  (`assets/socle.data.js`) ;
- [x] domaines de faisabilité pré-calculés hors ligne et mesurés
  (`assets/fit.data.js`, `DOCTRINE_AGENCEMENT.md` §5) ;
- [x] algorithmique unique extraite dans `assets/placement.js`, exécutable
  dans Node et dans le navigateur ; `fit.data.js` est désormais le cache
  chaud des préréglages et non l'autorité des compositions libres ;
- [x] première suite de tests : 13 préréglages, 15 variantes et comparaison
  des verdicts du solveur au cache (`npm run fit:test`) ;
- [x] premiers correctifs de fiabilité issus de l'audit du 15 août.

### Limites connues

*Liste révisée le 27 août 2026. Quatre limites de la version du 15 août sont
levées et conservées barrées : elles disent d'où le moteur vient, et évitent
qu'un lecteur les reprenne pour des contraintes actives.*

- ~~l'enveloppe est toujours rectangulaire~~ — **levée par le chantier 1** :
  carré, rectangle, L et U, livrés le 18 août ;
- ~~les portes, fenêtres, murs et accès extérieur ne sont pas modélisés~~ —
  **levée** : murs épais et faces (`MURS_EPAIS.md`), entrée comme critère
  de génération (D1), fenêtre par pièce habitable, et depuis O3 la porte est un
  équipement dont le battant est une zone exclusive ;
- ~~la suite JavaScript ne couvre que le solveur d'agencement~~ — **levée** :
  45 tests ciblés, un schéma versionné, le témoin O0, le banc M3.0 et un banc fixe de 360 tentatives,
  enchaînés par `npm run technohab:validate` ;
- ~~16 règles évaluées~~ — **32 règles aujourd'hui** (les quatre `TH2D-ADJ`,
  `TH2D-PATH-004` et les deux règles d'entrée sont incluses),
  face aux 71 du référentiel cible, et
  toujours sans registre de données commun entre les deux ;
- la priorité choisie modifie implicitement la proportion de l'enveloppe ;
- les pièces partent d'une découpe récursive rectangulaire puis peuvent
  recevoir un décrochement à six arêtes ;
- ~~le solveur d'équipements est rectangulaire~~ — **levée par M4b** : emprises,
  zones d'usage et `S4` sont jugés sur `usablePolygon` ; `fit.data.js` reste un
  cache `rectangle-only`, sans autorité hors rectangle ;
- ~~`S4` est déclarée bloquante par le socle et n'est évaluée nulle part~~ —
  **levée, puis intégrée au BuiltPlan par M4** : connexité dans le solveur,
  refus de la disposition complète (`S4_CANNOT_BE_SATISFIED`) avant sélection
  et règle `TH2D-PATH-004` en `HARD`. Le parcours global meublé et la preuve
  locale partagent désormais le même plan exporté ;
- le sol d'une pièce meublée reste fragmenté dans **15,3 %** des cas — `S4`
  garantit qu'on atteint chaque zone d'usage, pas que le sol tienne d'un seul
  tenant. Les deux propriétés ne se confondent pas ;
- ~~le témoin de la porte A est rouge depuis O3~~ — **levée le 30 août après
  rejeu M4c/C-P2** : 45 tests ciblés et les quatre photographies versionnées
  passent, soit 49 étapes dans la commande unique ;
- les équipements sont décrits, dessinés, résolus et **rendus sur le plan**
  sous bascule ; leurs zones d'usage restent calculées mais non dessinées, et
  une pièce dont la pose échoue n'affiche aucun mobilier — le solveur ne
  renvoie pas de pose partielle, si bien que le refus se lit dans le rapport
  et non sur le dessin ;
- ~~la rotation d'un équipement est calculée mais non dessinée~~ — **mécanisme
  levé par le rendu courant** : la pose transporte la rotation et
  `renderFurniture()` l'applique aux symboles rotatables. La justesse visuelle
  de l'orientation, de l'échelle et des symboles non rotatables reste à
  contrôler sur les plans dans M5.4 ;
- les règles actuelles sont un profil de prototype, pas un référentiel
  architectural ou réglementaire complet ;
- le graphe d'adjacences n'est pas une contrainte de génération mais un
  critère de score — voir §3.1, c'est la limite structurante du moteur, et
  §3.1 bis pour la façon dont le rapport en rend compte sans l'imputer à
  l'utilisateur ;
- trois règles sont déclarées limitées, c'est-à-dire valides mais non tenues
  par la génération : `TH2D-GRAPH-001`, `TH2D-CIRC-003`, `TH2D-RANGEMENT-003` ;
- le code, les données et le service Graph2Plan/MATLAB d'origine ne sont pas
  présents dans le projet.

### 3.1 — Le moteur ne garantit pas le graphe, il le favorise

Constat d'audit à porter avant toute décision sur les phases 4 et 5.

`layout()` découpe l'espace en guillotine **sans jamais consulter les
adjacences demandées** ; celles-ci ne sont lues qu'après coup, par
`scoreCandidate()`, pour pénaliser les candidats qui les ratent. Le moteur
est donc un *generate-and-score* par échantillonnage, pas une synthèse guidée
par contraintes comme l'est vraisemblablement Graph2Plan.

> **Nuance, 21 août 2026.** Exact sur la lettre — `layout()` ne lit jamais
> `requestedEdges` — mais il ne faut pas en conclure qu'elle ignore le
> graphe : elle consulte le **programme** (`item.type === 'circulation'`) et
> code en dur l'hypothèse que la circulation est le hub, par `hubSplit()` et
> par le peigne. La distinction compte, car cet encodage figé a été mesuré :
> `hubSplit()` rend 3,7 points de desserte, **le peigne en coûte 2,1**. Et
> l'échec n'est pas géométrique — 98,2 % des plans avaient la longueur de
> couloir nécessaire. Voir
> [`DECOUPE_ET_GRAPHE.md`](DECOUPE_ET_GRAPHE.md).

Conséquence directe : `TH2D-GRAPH-001` est déclarée `HARD` mais n'est
jamais garantie — si aucun tirage du budget ne réalise une adjacence
demandée, le plan est affiché malgré la violation. Cela **contredit
frontalement le §7**, qui interdit d'afficher une proposition en échec
`HARD`.

Trois issues possibles, à trancher avant la phase 4 :

1. **Filtre dur** — rejeter les candidats en violation `HARD` et n'afficher
   que les valides ; si aucun ne l'est, expliquer l'impossibilité plutôt que
   de montrer le moins mauvais. Conforme au §7, mais peut ne rien produire.
2. **Synthèse guidée** — faire consulter le graphe par `chooseSplit()` pour
   que les adjacences soient satisfaites par construction. Coûteux, c'est un
   changement de moteur, mais c'est la seule voie vers une vraie garantie.
3. **Honnêteté du niveau** — reclasser `TH2D-GRAPH-001` en `GUIDELINE` tant
   que le moteur ne peut pas garantir mieux, et le dire dans l'interface.

L'option 1 est le minimum pour lever la contradiction ; l'option 2 est la
cible ; l'option 3 est le repli provisoire acceptable, à condition d'être
explicite.

### 3.1 bis — Violation et limite connue sont séparées — fait le 15 août

Décision du §3.1, appliquée. Une règle que la génération ne sait pas tenir
**n'est pas rétrogradée** : son exigence reste réelle, et une pièce
injoignable reste un défaut bloquant quoi qu'en dise le moteur. Mais son
manquement n'est pas de même nature qu'une violation ordinaire — c'est une
dette d'implémentation, pas un défaut du plan proposé.

Les confondre avait deux effets, tous deux mauvais : imputer à l'utilisateur
un échec qui n'est pas le sien, ou masquer la dette en déclassant la règle.

Trois règles sont déclarées limitées dans `rules.js`, chacune avec sa cause,
sa mesure et la suite envisagée : `TH2D-GRAPH-001`, `TH2D-CIRC-003`,
`TH2D-RANGEMENT-003`. Une limite sans mesure n'a pas le droit d'y figurer.

**Ce que la séparation révèle** — les plans étaient bien meilleurs que le
rapport mêlé ne le laissait croire :

| Configuration | Plans en violation, avant | En violation réelle | Relevant d'une limite |
|---|---|---|---|
| 75 m², 2 ch | 4 à 13 / 40 | **0 / 40** | 55 signalements |
| 150 m², 5 ch | 32 à 37 / 40 | **13 / 40** | 86 signalements |

L'essentiel de ce qu'on lisait comme des défauts de plan était de la dette
de moteur. Le §7 reste contredit sur les grands programmes, mais dans une
proportion bien moindre que ce que les mesures précédentes suggéraient.

Le rapport affiche deux listes séparées par un intertitre, la seconde
groupée par règle et non par occurrence — dix adjacences ratées sont un seul
manquement du moteur. Le journal des générations trace la distinction, pour
que la dette ait un historique.

### 3.2 — Mesures du 15 août

Relevé sur 40 variantes par configuration, priorité compacte, cuisine
séparée et WC indépendant. Ces chiffres remplacent les impressions.

| Configuration | Variantes en violation `HARD` | Adjacences ratées |
|---|---|---|
| 75 m², 2 chambres | 20 / 40 | 21 |
| 110 m², 3 chambres | 32 / 40 | 42 |
| 150 m², 5 chambres | 40 / 40 | 111 |

**La conformité se dégrade avec la taille du programme, jusqu'à disparaître.**
À 150 m² et cinq chambres, aucune variante n'est conforme et chaque plan rate
en moyenne près de trois adjacences demandées. Le §7 n'est donc pas seulement
contredit à la marge : il l'est presque toujours dès que le programme dépasse
quelques pièces.

Quatre causes distinctes, mesurées séparément.

**Le séjour est ancré, il ne se déplace jamais.** Sur 40 variantes, une seule
position relevée : l'angle supérieur gauche, dans 40 cas sur 40. La cause est
structurelle et non aléatoire — le séjour est placé en tête du tableau des
pièces, or la découpe coupe toujours à un index supérieur ou égal à un, donc
le séjour appartient à la première tranche à chaque niveau de récursion. Il
est mathématiquement contraint au même coin. Comme il occupe à lui seul près
de la moitié de la surface, la moitié du plan est identique d'une variante à
l'autre, ce qui explique l'impression de répétition bien plus que la
permutation des petites pièces.

**L'enveloppe est entièrement déterministe.** Une seule enveloppe distincte
par configuration : à surface et priorité données, les proportions sont
calculées, jamais tirées. La variation ne porte que sur l'intérieur.

**La direction de coupe est presque fixe.** Le choix entre coupe verticale et
horizontale suit l'allongement des limites courantes dans environ trois cas
sur quatre ; le tirage ne l'inverse qu'un quart du temps. À cela s'ajoute une
perturbation du point de coupe toujours positive, donc incapable de déplacer
la coupe des deux côtés de l'équilibre. La géométrie compte 33 signatures
distinctes sur 40, mais faiblement dispersées.

**Les circulations n'ont aucune contrainte de largeur.** Seule une surface
minimale de 3 m² est imposée. Résultat : largeur minimale relevée à 0,58 m,
et **14 générations sur 40 produisent un couloir plus étroit que 1,20 m**.
Aucune règle ne le détecte — le contrôle de proportion existant ne se
déclenche qu'en deçà d'un rapport de 0,28 et ne vaut que comme conseil. Un
couloir de 0,58 m est infranchissable, et le moteur le déclare conforme.

### 3.3 — Après le chantier 2

Même protocole, 40 variantes par configuration, après application des
corrections. La cause première n'était aucune de celles envisagées au
départ : **la circulation gardait une surface fixe quel que soit le nombre de
pièces à desservir**. Une circulation de 5,9 m² à laquelle on demandait de
toucher huit pièces offrait 0,61 m de contact par pièce — le graphe demandé
était géométriquement irréalisable, et aucune quantité de tirages ne pouvait
le satisfaire. Dimensionner la circulation par ce qu'elle dessert a produit
l'essentiel du gain.

| Configuration | Pièces | Violations avant | Violations après |
|---|---|---|---|
| 35 m², studio | 3 | — | 0 / 40 |
| 75 m², 2 ch | 6 | 20 / 40 | **0 / 40** |
| 110 m², 3 ch | 8 | 32 / 40 | **0 / 40** |
| 150 m², 5 ch, 1 sdb | 10 | 40 / 40 | 20 / 40 |
| 150 m², 5 ch, 2 sdb | 11 | 40 / 40 | 37 / 40 |

Autres relevés : plus aucune circulation sous 1,20 m sur l'ensemble des
configurations ; le séjour occupe de 20 à 39 positions distinctes sur 40
variantes, contre une seule auparavant ; durée de génération de 3 ms à
216 ms selon la taille du programme.

**Ce qui reste ouvert.** Au-delà de neuf ou dix pièces, la conformité se
dégrade toujours. La cause est identifiée et n'est pas un défaut de
recherche — augmenter le budget vingt fois fait passer le cas à onze pièces
de 38 à 9 échecs sur 40, donc les solutions existent mais sont rares. Ce que
le moteur atteint difficilement, c'est une circulation unique desservant dix
pièces : une découpe en guillotine y parvient rarement, et l'architecture
réelle ne le fait pas non plus. La réponse n'est pas un budget plus grand
mais **plusieurs circulations** pour les grands programmes, typiquement une
distribution jour et une distribution nuit. Ce point rejoint la phase 3
(enrichir le catalogue de pièces) et la phase 4 (pavage orthogonal).

## 4. Catalogue cible du questionnaire

Ce catalogue est une cible de conception. Une option n'entre dans l'interface
que lorsque son effet sur les données, la génération et les règles est défini.

### A — Projet et enveloppe

- [x] surface totale souhaitée ;
- [ ] forme de la maison : carrée, rectangulaire ou libre orthogonale ;
- [ ] tolérance de surface ;
- [ ] orientation du nord ;
- [ ] position ou façade souhaitée pour l'entrée ;
- [ ] nombre de niveaux — hors périmètre de la première version 2D ;
- [ ] dimensions ou emprise imposées par une parcelle ;
- [ ] espaces extérieurs à connecter : terrasse, jardin, stationnement.

### B — Composition du logement

- [x] nombre de chambres ;
- [x] nombre de salles d'eau ;
- [x] cuisine ouverte ou séparée ;
- [x] WC indépendant ;
- [ ] entrée ou sas ;
- [ ] salle de bains et salle d'eau distinguées ;
- [ ] cellier, buanderie et local technique ;
- [ ] bureau ;
- [ ] salle à manger distincte ;
- [ ] dressing et rangements ;
- [ ] chambre d'amis ou chambre évolutive ;
- [ ] garage ou atelier relié au logement ;
- [ ] surface minimale ou cible personnalisée par pièce.

### C — Relations entre les espaces

- [ ] adjacence obligatoire entre deux pièces ;
- [ ] adjacence souhaitée ;
- [ ] séparation obligatoire ;
- [ ] accès direct ou accès par circulation ;
- [ ] organisation jour / nuit ;
- [ ] regroupement des pièces d'eau ;
- [ ] relation avec l'entrée ;
- [ ] relation avec une façade ou un espace extérieur ;
- [ ] position relative souhaitée : nord, sud, est ou ouest.

### D — Usages et contraintes

- [ ] nombre et profil des occupants ;
- [ ] accessibilité et rayon de giration ;
- [ ] télétravail ;
- [ ] accueil ponctuel ou indépendant ;
- [ ] animaux ou usages salissants nécessitant un accès dédié ;
- [ ] évolutivité, extension ou division future ;
- [ ] traversées à éviter et degré d'intimité attendu ;
- [ ] largeur minimale des circulations.

### E — Priorités de classement

- [x] compacité ;
- [x] lumière — à redéfinir sans modifier silencieusement l'enveloppe ;
- [x] économie constructive — à redéfinir par des métriques explicites ;
- [ ] simplicité des circulations ;
- [ ] intimité ;
- [ ] évolutivité ;
- [ ] exposition des pièces principales ;
- [ ] réduction des longueurs de réseaux ;
- [ ] choix de plusieurs priorités pondérées plutôt qu'une priorité unique.

## 5. Chantier 1 — Forme de la maison

### Décision fonctionnelle

Le questionnaire propose un champ obligatoire placé après la surface, six
options présentées en vignette d'emprise au sol plus libellé — direction
artistique et prompt de génération dans
[`DA_FORMES_ENVELOPPE.md`](DA_FORMES_ENVELOPPE.md) :

- **Carrée** (`square`) — enveloppe régulière dont les côtés sont déduits de
  la surface ;
- **Rectangulaire** (`rectangle`) — enveloppe à quatre angles droits dont le
  moteur explore plusieurs rapports largeur / longueur ;
- **L** (`lShape`) — un quartier retiré à un angle du rectangle englobant ;
- **U** (`uShape`) — un quartier retiré au milieu d'un côté, deux ailes
  symétriques ;
- **Souple** (`freeOrthogonal`) — un socle rectangulaire portant au moins
  60 % de la surface, plus une ou deux portions en saillie qui débordent de
  son emprise ;
- **Aléatoire** (`random`) — la famille de forme est tirée au sort sous
  contrainte des règles `BOUNDARY`.

`freeOrthogonal` conserve son nom de code afin de ne pas laisser entendre que
les diagonales ou les courbes sont acceptées.

Cette liste remplace le triplet `square` / `rectangle` / `freeOrthogonal`
décidé initialement : L et U étaient des sous-cas anonymes de la forme libre,
les nommer les rend choisissables et contrôlables séparément. La distinction
qui structure le moteur est celle des trois familles — primitive, soustractive
(L, U), additive (Souple) : les deux premières se construisent dans le
rectangle englobant, la troisième en déborde.

**Deux hasards à ne pas confondre.** La graine du §5 bis fait varier la
géométrie à forme donnée ; `random` fait varier la forme. Choisir `random`
puis rejouer une graine doit redonner la même forme, sans quoi la graine
cesse d'être une donnée du plan.

### Périmètre de la première version libre

- enveloppe extérieure orthogonale, avec angles de 90° ou 270° ;
- formes en L et T possibles ; forme en U seulement si les règles de largeur
  et d'accès sont satisfaites ;
- enveloppe continue, sans trou ni patio intérieur ;
- pièces rectangulaires dans un premier temps ;
- plusieurs volumes peuvent émerger et cohabiter ;
- aucune aile étroite ou surface résiduelle inutilisable ;
- surface finale comprise dans la tolérance demandée.

Les pièces en L, T ou autres formes rectilignes constituent un chantier
ultérieur distinct.

### Modèle de données cible

```js
{
  shape: "square" | "rectangle" | "lShape" | "uShape" | "freeOrthogonal" | "random",
  resolvedShape: "square",  // forme effectivement tirée lorsque shape vaut "random"
  boundary: {
    mode: "freeOrthogonal",
    polygon: [{ x: 0, y: 0 }, { x: 8, y: 0 }],
    area: 75,
    boundingBox: { width: 10, height: 9 },
    entrance: { edge: 0, position: 0.5 }
  }
}
```

Le polygone devient la source de vérité. `width` et `height` ne décrivent plus
que sa boîte englobante. Cette structure pourra être convertie plus tard en
masque raster compatible avec un moteur Graph2Plan.

### Règles bloquantes de l'enveloppe

- `TH2D-BOUNDARY-001` — forme demandée reconnue ;
- `TH2D-BOUNDARY-002` — segments horizontaux ou verticaux ;
- `TH2D-BOUNDARY-003` — polygone simple, sans auto-intersection ;
- `TH2D-BOUNDARY-004` — volume unique et connecté ;
- `TH2D-BOUNDARY-005` — aucun trou intérieur dans la première version ;
- `TH2D-BOUNDARY-006` — aire dans la tolérance du projet ;
- `TH2D-BOUNDARY-007` — largeur minimale de toute aile respectée ;
- `TH2D-BOUNDARY-008` — toutes les pièces contenues dans l'enveloppe ;
- `TH2D-BOUNDARY-009` — couverture complète, sans chevauchement ni vide ;
- `TH2D-BOUNDARY-010` — entrée positionnée sur un segment extérieur valide.

### Critères de classement

- écart à la surface cible ;
- rapport largeur / longueur ;
- périmètre rapporté à la surface ;
- nombre d'angles rentrants ;
- profondeur et largeur des ailes ;
- quantité de façade utile aux pièces principales ;
- longueur de circulation ;
- longueur estimée des murs et cloisons ;
- qualité du graphe d'adjacences obtenu.

### Critères d'acceptation du chantier 1

- [ ] produire la planche de vignettes (prompt `DA_FORMES_ENVELOPPE.md` §2)
  puis `assets/icons/shape-options.svg`, aires des polygones vérifiées égales ;
- [ ] le questionnaire expose les six choix en vignette plus libellé, avec
  une explication courte ;
- [ ] `shape` est conservé dans le stockage local et l'export JSON, ainsi que
  `resolvedShape` lorsque le choix est `random` ;
- [ ] une forme impossible à la surface demandée est désactivée dans le
  questionnaire, jamais proposée puis refusée ;
- [ ] la priorité ne détermine plus la forme de l'enveloppe ;
- [ ] le carré produit une enveloppe carrée à tolérance numérique près ;
- [ ] le rectangle produit plusieurs proportions réellement différentes ;
- [ ] L et U produisent des enveloppes conformes à leur définition, ailes
  au-dessus de la largeur minimale de `TH2D-BOUNDARY-007` ;
- [ ] Souple produit un socle majoritaire et une ou deux saillies qui
  débordent de son emprise, jamais une simple forme soustractive ;
- [ ] `random` rejoué à graine égale redonne la même forme ;
- [ ] toutes les enveloppes libres passent les dix règles `BOUNDARY` ;
- [ ] une régénération modifie la géométrie sans modifier le questionnaire ;
- [ ] le SVG affiche correctement les polygones concaves ;
- [ ] les exports conservent le polygone et la forme choisie ;
- [ ] les tests couvrent les six modes, les petites surfaces et les cas
  impossibles ;
- [ ] aucune régression sur le chargement autonome dans Wonderland.

### Premier lot livré — 18 août 2026

Quatre formes au questionnaire : **rectangle, carré, L, U**. La forme
« Souple » (additive) et le tirage `random` restent à faire.

Une enveloppe est désormais une **liste de volumes rectangulaires jointifs**
qui pavent exactement la surface demandée — un pour le carré et le rectangle,
deux pour le L, trois pour le U. La découpe en guillotine n'a pas été
remplacée : elle travaille chaque volume comme elle travaillait l'enveloppe
entière. Le moteur gagne des formes sans changer d'algorithme.

Trois généralisations l'ont accompagnée :

- `facadeSegments()` ne teste plus l'appartenance aux quatre bords d'un
  rectangle mais l'absence de volume au-delà du mur — sans quoi l'encoche d'un
  L ou d'un U, pourtant extérieure, ne compterait pas. Mesuré à surface égale :
  42 m de façade en rectangle, 47 m en L, 60 m en U ;
- le fond du plan est un contour, non plus un rectangle : peindre la boîte
  englobante reviendrait à bâtir l'encoche. Il réutilise le `cheminContour()`
  de D2 ;
- `TH2D-BOUNDARY-008` (HARD) garde l'invariant qu'aucune pièce ne déborde dans
  l'encoche, que la boîte englobante contiendrait sans rien dire.

**Deux exigences de largeur, et les confondre stérilisait les formes.** Le
corps de bâtiment doit loger la pièce la plus large du programme — le séjour,
3,00 m. Une aile n'a qu'à loger la plus étroite des pièces qui se vivent — la
salle d'eau, 1,70 m ; une aile large comme un WC est un couloir avec une
fenêtre. Exiger partout la largeur du séjour rendait le L et le U impossibles
avant 130 m² ; avec la distinction, les deux tiennent dès 45 m².

**Un volume sans pièce est une part d'enveloppe sans propriétaire.** Le banc
l'a montré : 60 plans sur 720 déclenchaient `TH2D-RESERVE-001`. Deux
garde-fous en sont sortis — une forme ne peut pas avoir plus de volumes que le
programme n'a de pièces, et surtout chaque volume secondaire doit pouvoir
recevoir une pièce **distincte**, vérifié par appariement avant de retenir la
forme. Vérifier qu'il existe une pièce assez étroite ne suffisait pas : il en
faut autant que d'ailes.

**Quand la forme est intenable**, le moteur essaie huit proportions puis
rabat sur le rectangle et le dit : `boundary.demandee` garde le choix de
l'utilisateur, `boundary.degradee` signale le repli. Un plan faux serait pire
qu'un plan honnête sur sa forme.

**Non-régression prouvée au bit près** : à graine égale, l'empreinte du banc
en rectangle est inchangée. Deux écarts d'un millimètre ont été traqués
jusqu'à leur cause — un rééchelonnage inutile des surfaces cibles sur une
enveloppe à volume unique, et un arrondi des dimensions d'enveloppe entré dans
le calcul au lieu de rester en sortie.

Reste ouvert : forme « Souple » et tirage `random` ; `TH2D-BOUNDARY-001` à
`007`, `009`, `010` non écrites ; l'orientation, qui n'est pas une forme mais
commande le rendu autant qu'elle.

## 5 bis. Chantier 2 — Diversité, graine et largeur des circulations

Ouvert par les mesures du §3.2. Ce chantier ne dépend pas du chantier 1 et
devrait le précéder : il corrige des défauts déjà présents sur l'enveloppe
rectangulaire, qu'une enveloppe libre ne ferait qu'amplifier.

### Décision — la graine devient une donnée du plan

Chaque génération tire une graine explicite, affichée dans l'interface et
conservée dans l'export. Elle remplace le couple opaque questionnaire plus
numéro de variante utilisé aujourd'hui pour dériver le hasard.

Trois effets recherchés :

- **mémoriser une génération** — une graine suffit à retrouver un plan à
  l'identique, sans conserver le plan lui-même ;
- **réduire le coût** — on ne recalcule que si la graine ou le questionnaire
  changent, et l'on peut rejouer une variante retenue sans réexplorer ;
- **rendre le hasard inspectable** — deux graines proches doivent donner deux
  plans différents ; c'est vérifiable, donc testable.

La graine est présentée comme une référence courte à recopier, pas comme un
réglage à comprendre.

### Décision — budget de génération plutôt que nombre fixe

Le nombre de tentatives cesse d'être figé à 96. Le moteur explore jusqu'à
épuisement d'un budget, exprimé en temps ou en nombre de candidats, et
s'arrête plus tôt s'il a trouvé assez de solutions conformes et distinctes.
Un programme de trois pièces n'a pas besoin du même effort qu'un programme
de douze, et les enveloppes libres du chantier 1 rendraient un nombre fixe
soit insuffisant, soit ruineux.

### Décision — la diversité devient un critère mesuré

Une variante qui ne diffère pas de la précédente n'est pas une variante. Le
moteur mesure l'écart entre candidats retenus et refuse de présenter comme
nouvelle une proposition trop proche d'une précédente. La mesure porte sur
la position des pièces principales, pas sur des écarts numériques mineurs.

### Corrections identifiées

- **Désancrer le séjour** — il ne doit plus être placé en tête du tableau des
  pièces, sans quoi aucune quantité de tirages ne le déplacera. C'est la
  correction au plus fort effet sur la diversité perçue.
- **Faire varier l'enveloppe** — à surface donnée, explorer plusieurs
  proportions plutôt qu'une seule valeur calculée, dans les limites de la
  forme demandée au chantier 1.
- **Rééquilibrer la coupe** — rendre la direction de coupe réellement
  aléatoire plutôt que dictée par l'allongement courant, et rendre la
  perturbation du point de coupe symétrique afin qu'elle puisse déplacer la
  coupe des deux côtés de l'équilibre.
- **Contraindre la largeur des circulations** — imposer une largeur libre
  minimale de 1,20 m, contrôlée par une règle bloquante dédiée, et refuser
  les candidats qui ne la respectent pas plutôt que de les signaler après
  coup. La valeur retenue est plus exigeante que le référentiel d'origine,
  qui s'arrête à 1 m.
- **Garantir la desserte** — une circulation qui ne relie pas les pièces
  qu'elle est censée desservir n'a pas de raison d'être ; c'est le cas le
  plus visible du problème général du §3.1.

### Règles à ajouter

- `TH2D-CIRC-001` — largeur libre minimale de 1,20 m pour toute circulation,
  niveau bloquant ;
- `TH2D-CIRC-002` — toute circulation dessert au moins deux espaces ;
- `TH2D-VARIANT-001` — une variante présentée diffère suffisamment des
  précédentes, niveau conseil.

### Critères d'acceptation du chantier 2

- [x] la graine est affichée, exportée et permet de rejouer un plan
  à l'identique — vérifié, deux générations de même graine sont identiques ;
- [x] une entrée du journal se rejoue d'un clic ;
- [x] le séjour occupe des positions différentes selon les variantes ;
- [x] l'enveloppe varie à surface constante, dans les limites de la forme ;
- [x] aucune génération ne produit de circulation sous 1,20 m ;
- [x] le budget de génération s'adapte à la taille du programme ;
- [x] une disposition déjà obtenue est signalée comme telle ;
- [~] le taux de variantes en violation bloquante s'effondre — atteint
  jusqu'à neuf pièces, partiel au-delà, voir §3.3 ;
- [ ] les tests couvrent les configurations du §3.2 et interdisent toute
  régression sur ces taux — les mesures existent mais ne sont pas encore
  automatisées.

## 5 ter. Chantier 3 — Doctrine du rangement et de la réserve

**Statut : implémenté le 15 août 2026.** Résultats au §3.4, un point reste
ouvert sur la largeur de circulation.

### Le problème

La circulation a désormais une largeur minimale mais aucun maximum. Mesuré
sur 40 variantes avant correction : largeur médiane de 2,56 m à 2,86 m,
maximum à 4,06 m. À cette largeur ce n'est plus un couloir, c'est une pièce
sans fonction. La surface de circulation représente 11 à 13 % du total,
au-delà des 10 % que fixe déjà le référentiel d'origine.

Une largeur maximale de 1,80 m a été posée à titre conservatoire : la
médiane est retombée à 1,67-1,78 m et le maximum à 2,44 m. Mais la surface
occupée n'a pas bougé — le couloir est devenu long et fin au lieu de large
et court. **Le volume excédentaire n'a pas disparu, il a changé de forme.**

Il faut donc décider ce que devient ce surplus, plutôt que le contraindre.

### Le principe

Le surplus ne se supprime pas, il **se cède**. La bande excédentaire du
couloir est transférée aux pièces qu'il longe, sous forme de rangement.

C'est une cession et non une création : la surface totale est conservée, la
couverture du plan reste complète, et les règles d'intégrité du pack P0
restent valides sans modification. C'est ce qui rend la doctrine tenable.

Conséquence assumée : **une pièce cesse d'être un rectangle**. Elle devient
un rectangle de base augmenté d'une bande de rangement, soit une forme en L,
négatif de l'emboîtement avec le couloir.

### Ce qui rend la chose faisable

Un rangement est lui-même un rectangle. Une pièce est donc modélisée comme
une **liste de rectangles** — un seul le plus souvent, deux lorsqu'il y a
emboîtement. Tout reste de l'arithmétique de rectangles :

- surface : somme des parties ;
- contacts : double boucle sur les parties de chaque paire de pièces ;
- largeur libre : minimum sur les parties ;
- rendu : un tracé unique, ou deux rectangles groupés.

Aucune découpe polygonale, aucune structure de demi-arêtes, aucune
bibliothèque de géométrie. C'est ce choix qui fait passer le chantier de
« refonte du moteur » à « passe de post-traitement ».

### Dimensions du rangement

- profondeur minimale : **0,45 m** — en deçà, un rangement n'est pas
  utilisable ;
- profondeur maximale : **0,6 × la longueur du rangement** — au-delà, ce
  n'est plus une bande mais une pièce ;
- ces deux bornes impliquent une longueur minimale de 0,75 m ; une bande
  plus courte ne peut pas devenir un rangement.

### La réserve ajustable

Une chute qui ne satisfait pas ces bornes n'est pas perdue et n'est pas non
plus arbitrairement absorbée : elle devient une **réserve**, portée au plan
comme une surface disponible que le moteur peut attribuer à l'une ou l'autre
des pièces qui la bordent, selon les besoins du programme.

La réserve est donc une **variable d'ajustement** : lorsqu'une pièce est
sous son minimum de surface, le moteur lui attribue la réserve adjacente
plutôt que de rejeter le candidat. Lorsqu'aucune pièce n'en a besoin, la
réserve reste attribuée à la pièce la plus grande des deux, ou au couloir
si elle n'est bordée que par lui.

Règles d'attribution, dans cet ordre :

1. à une pièce bordante en dessous de sa surface minimale, s'il y en a une ;
2. à défaut, à une pièce bordante en dessous de sa surface cible ;
3. à défaut, à la pièce bordante dont le rapport de forme s'améliore le plus ;
4. à défaut, au couloir, qui reprend la bande.

Une réserve n'est jamais laissée non attribuée : à la fin de la passe, toute
surface appartient à une pièce. C'est la condition pour que la couverture
reste complète.

### Modèle de données cible

```js
{
  id: "bedroom_1",
  type: "bedroom",
  parts: [
    { role: "main",    x0: 0, y0: 0, x1: 3.4, y1: 3.6 },
    { role: "storage", x0: 3.4, y0: 0, x1: 3.95, y1: 2.2 }
  ],
  area: 13.45,
  usableRect: { x0: 0, y0: 0, x1: 3.4, y1: 3.6 },
  storageArea: 1.21
}
```

`parts` devient la source de vérité. `usableRect` est la partie principale,
et sert de base à tout contrôle de proportion — un rapport de forme n'a pas
de sens sur une forme en L, il doit se mesurer sur le rectangle utile. Les
champs `x0`/`y0`/`x1`/`y1` de la pièce ne décrivent plus que la boîte
englobante.

### Point de vigilance

**Un rangement n'est jamais un nœud du graphe.** Il reste un attribut de la
pièce qui le porte. Le transformer en nœud obligerait la circulation à le
desservir, ce qui aggraverait le problème de degré identifié au §3.3 —
précisément celui qui bloque encore les grands programmes.

Même règle pour la réserve tant qu'elle n'est pas attribuée.

### Règles à ajouter

- `TH2D-CIRC-003` — largeur libre maximale de circulation, niveau bloquant ;
- `TH2D-RANGEMENT-001` — profondeur d'un rangement comprise entre 0,45 m et
  0,6 fois sa longueur, niveau bloquant ;
- `TH2D-RANGEMENT-002` — un rangement est adjacent à la pièce qu'il sert et
  ne coupe aucune circulation, niveau bloquant ;
- `TH2D-RANGEMENT-003` — chaque chambre dispose d'un rangement, niveau
  conseil ;
- `TH2D-RESERVE-001` — aucune réserve ne reste non attribuée en fin de
  génération, niveau bloquant ;
- `TH2D-CIRC-004` — surface de circulation inférieure à 10 % du total,
  niveau conseil, alignée sur le référentiel d'origine.

### Critères d'acceptation du chantier 3

- [~] aucune circulation au-delà de la largeur maximale — la cession n'y
  parvient pas toujours, voir « ce qui reste ouvert » ;
- [x] la surface de circulation repasse sous 10 % du total — mesurée entre
  6,3 % et 7,9 % selon la configuration, contre 11 à 13 % avant ;
- [x] les rangements produits respectent les deux bornes de profondeur —
  aucune violation de `TH2D-RANGEMENT-001` sur l'ensemble des relevés ;
- [x] la somme des surfaces de pièces égale toujours la surface de
  l'enveloppe — écart maximal de 0,012 m², soit l'arrondi au millimètre
  cumulé sur onze pièces ;
- [x] aucune réserve non attribuée — aucune violation de
  `TH2D-RESERVE-001` ;
- [x] les contrôles de proportion s'appliquent au rectangle utile ;
- [x] le rendu affiche les pièces en L, rangement en trait tireté distinct ;
- [x] les exports conservent `parts`, `usableRect`, `area` et `storageArea` ;
- [x] aucune régression sur les taux de conformité du §3.3 ;
- [ ] les tests couvrent une pièce sans rangement, une pièce avec rangement,
  une réserve attribuée par manque de surface et une réserve sans preneur.

### 3.4 — Mesures après le chantier 3

Même protocole, 40 variantes par configuration.

| Configuration | Part de circulation | Rangements créés | Violations `HARD` |
|---|---|---|---|
| 35 m², studio | — | — | 0 / 40 |
| 75 m², 2 ch | 7,6 % | 17 | 4 / 40 |
| 110 m², 3 ch | 6,3 % | 55 | 13 / 40 |
| 150 m², 5 ch, 1 sdb | 7,4 % | 33 | 27 / 40 |
| 150 m², 5 ch, 2 sdb | 7,9 % | 53 | 39 / 40 |

Le rangement, jusqu'ici absent du programme, apparaît dans presque toutes
les générations. La circulation est repassée sous les 10 % du référentiel.
Les trois règles géométriques neuves ne relèvent aucune violation, ce qui
confirme que la cession est correcte : profondeurs dans les bornes,
rangements attenants, aucune surface orpheline.

Une fausse piste vaut d'être notée : plafonner la surface allouée à la
circulation dès le programme, plutôt que de la céder géométriquement,
dégrade nettement les adjacences — un couloir étroit dès l'allocation touche
moins de pièces, donc dessert moins bien. La cession après découpe fait
mieux le travail et a été conservée.

### Ce qui reste ouvert

**La cession ne peut pas toujours avoir lieu.** Elle exige que les pièces
bordant un côté du couloir en couvrent toute la longueur : sinon une part de
la bande resterait sans propriétaire et la couverture du plan cesserait
d'être complète. Lorsque le couloir longe la façade ou qu'un voisin ne le
borde que partiellement, la cession est refusée et le couloir reste large —
`TH2D-CIRC-003` se déclenche alors dans 8 à 68 % des cas selon la taille du
programme.

Deux réponses possibles, aucune tranchée :

1. **Couloir en L** — autoriser la circulation à être elle-même une liste de
   rectangles, ce qui permettrait de céder la portion bordée et de garder le
   reste. Le modèle `parts` le supporte déjà ; c'est le référentiel d'origine
   qui demande une circulation rectangulaire.
2. **Plusieurs circulations** — la réponse déjà identifiée au §3.3 pour les
   grands programmes ; elle réduirait mécaniquement la largeur de chacune.

La seconde traite aussi le verrou d'adjacence, et reste donc prioritaire.

### 3.5 — Audit consolidé des règles et du placement du WC

Relevé déterministe du 15 août 2026 : 20 graines par configuration sur les
24 configurations de `scripts/scan-capacites.mjs`, soit **480 plans**. Une
règle est comptée une fois par plan touché dans les taux ci-dessous, même si
elle produit plusieurs messages.

**236 plans sur 480, soit 49,2 %, portent au moins une violation `HARD`.**
Ce taux ne signifie pas que la moitié des programmes sont impossibles : le
moteur affiche aujourd'hui le meilleur candidat de son budget même lorsqu'il
reste non conforme. Il mesure donc d'abord la dette du generate-and-score.

| Règle | Niveau | Plans touchés | Lecture |
|---|---|---:|---|
| `TH2D-RANGEMENT-003` | `GUIDELINE` | 425 / 480 · 88,5 % | signal le plus fréquent, mais **non bloquant** : les chambres reçoivent rarement un rangement issu de la cession du couloir |
| `TH2D-GEOM-001` | `GUIDELINE`, retirée | 147 / 480 · 30,6 % | mesure historique ; convention de ratio remplacée par `TH2D-ROOM-002`, fondée sur le mobilier réellement plaçable |
| `TH2D-GRAPH-001` | `HARD` | 139 / 480 · 29,0 % | premier verrou générationnel : des adjacences demandées manquent au candidat retenu |
| `TH2D-CIRC-003` | `HARD` | 128 / 480 · 26,7 % | second verrou générationnel : le surplus du couloir ne peut pas toujours être cédé |
| `TH2D-CIRC-004` | `GUIDELINE` | 125 / 480 · 26,0 % | conséquence surfacique du même surplus de circulation |
| `TH2D-SIZING-001` | `GUIDELINE` | 120 / 480 · 25,0 % | séjour sous la cible de confort de 24 m² |
| `TH2D-ROOM-001` | `HARD` | 51 / 480 · 10,6 % | programme comprimé sous les minima de pièces ; relève d'abord du refus d'entrée |
| `TH2D-PROJECT-001` | `HARD` | 20 / 480 · 4,2 % | programme globalement impossible ; doit être refusé avant génération |
| `TH2D-ROOM-002` | `HARD` | 2 / 480 · 0,4 % | gabarit mobilier hors enveloppe, désormais marginal |

Deux catégories ne doivent plus être mélangées dans le suivi :

1. `TH2D-PROJECT-001` et une partie de `TH2D-ROOM-001` signalent une entrée
   impossible ou comprimée. La réponse correcte est un refus avant de lancer
   le moteur, pas davantage de tentatives.
2. `TH2D-GRAPH-001` et `TH2D-CIRC-003` sont les règles que la génération
   devrait tenir et ne tient pas. Elles concentrent la priorité moteur :
   synthèse guidée par le graphe, puis plusieurs circulations sur les grands
   programmes. Tant qu'elles restent `HARD`, un candidat qui les viole ne
   devrait pas être affiché comme proposition valide.

#### Le WC en façade est un biais mesuré

Sur les **400 plans comportant un WC**, 380 placent son emprise contre au
moins un bord extérieur, soit **95,0 %**. La répartition est équilibrée entre
les quatre côtés — 109 ouest, 108 est, 119 nord, 120 sud — : il ne s'agit pas
d'un coin codé en dur mais d'un biais de la découpe récursive. Le WC touche la
circulation dans 381 cas sur 400, ce qui satisfait bien la relation demandée,
mais il touche aussi directement le séjour dans 93 cas, soit **23,3 %**.

Le générateur ne connaît aujourd'hui ni façade utile, ni pièce intérieure,
ni ordre de priorité des locaux sur l'enveloppe. `scoreCandidate()` pénalise
les adjacences manquantes, les pièces non meublables et la circulation, mais
ne valorise jamais la façade pour les pièces de vie et ne pénalise jamais le
WC en rive. Le résultat observé est donc structurel.

Suivi proposé :

- [ ] `TH2D-ADJ-WC-001` — interdire l'adjacence directe WC / séjour, déjà
  identifiée en phase 5 ; niveau à sourcer avant de la déclarer `HARD` ;
- [ ] `TH2D-WC-PLACEMENT-001` — préférer un WC intérieur ou sur une façade de
  second rang quand une solution existe ; niveau `PREFERENCE`, car un WC en
  façade n'est pas en soi un plan invalide ;
- [ ] introduire dans le score une valeur de façade par type de pièce avant
  d'ajouter cette préférence : séjour et chambres prioritaires, locaux de
  service secondaires ;
- [ ] mesurer en régression le taux de WC en façade et l'adjacence WC / séjour
  sur les 24 configurations ; ne pas considérer le bug clos sur une seule
  graine visuellement satisfaisante.

## 5 ter bis. Décrochements entre pièces — fait le 15 août

Prolongement direct du chantier 3. La découpe en guillotine ne produisait que
des rectangles ; un **échange de coin** entre deux pièces mitoyennes les fait
passer toutes deux à six arêtes, la première cédant un bloc d'angle que la
seconde reçoit.

### La contrainte de parité

Un polygone à angles droits a **toujours un nombre pair d'arêtes** : la
relation *coins convexes moins coins rentrants égale quatre* l'impose. Les
formes atteignables sont donc 4 (rectangle), 6 (L), 8 (T, Z, U) — jamais 5
ni 7. Le paramètre de complexité maximale ne peut prendre que des valeurs
paires.

Retenu pour cette passe : **6 arêtes au maximum**, soit un seul coin
rentrant par pièce.

### Ce qui garde la chose tenable

Le bloc échangé doit être calé sur un angle **commun aux deux pièces**. Calé
sur le seul angle du donneur, il creuserait le receveur en son milieu et y
produirait une forme à huit arêtes. Cette exigence d'alignement réduit le
nombre d'échanges possibles, mais garantit que les deux pièces restent des L
propres, décomposables en deux rectangles — le moteur reste en arithmétique
de rectangles.

Les bornes du rangement s'appliquent telles quelles au décrochement, et au
reliquat laissé au donneur, qui est lui aussi un décrochement. Un garde-fou
de surface refuse tout échange qui ne conserverait pas exactement l'aire.

### Résultat mesuré

| Configuration | Pièces non rectangulaires | Arêtes max | Écart de surface |
|---|---|---|---|
| 75 m², 2 ch | 41 % | 6 | 0,008 m² |
| 110 m², 3 ch | 57 % | 6 | 0,009 m² |
| 150 m², 5 ch | 58 % | 6 | 0,009 m² |

Effet de bord favorable : la conformité s'est **améliorée** sur les petits
programmes — 75 m² passe de 6 à 4 variantes en violation, 110 m² de 16 à 12.
Les décrochements créent des contacts supplémentaires, donc satisfont des
adjacences que le rectangle ratait.

Deux règles ajoutées : `TH2D-FORME-001` (nombre d'arêtes pair et borné,
bloquant) et `TH2D-FORME-002` (la partie principale reste une pièce et non
une lame, conseil). Seize règles évaluées au total.

### Le vrai défaut était en amont

Un plan signalé à l'usage a mis au jour un défaut que les mesures
précédentes ne voyaient pas : un séjour de 24,8 m² mesurant **9,93 × 1,86 m**.
Une pièce de cette forme n'est pas un séjour mal proportionné, c'est un
couloir. Et elle l'était déjà avant l'échange de coin — la découpe la
produisait à 9,93 × 2,62. Le décrochement ne créait pas le défaut, il le
rendait visible.

Cause : le garde-fou de largeur minimale était **uniforme**, à 1,80 m. Or
1,80 m peut convenir à une salle d'eau et jamais à un séjour.

Correction : la largeur minimale est désormais **tirée du contenu**, comme
le prescrit le socle d'agencement — 3,00 m pour un séjour, 2,50 m pour une
chambre (1,90 m de lit plus 0,60 m de dégagement), 1,70 m pour une salle
d'eau, 1,20 m pour une circulation. Elle intervient à trois endroits : au
score, aux décrochements, et — c'est le point nouveau — **dans le choix de
la direction de coupe**, qui consulte désormais le programme au lieu de le
subir. C'est la première incursion de l'option 2 du §3.1, la synthèse
guidée, appliquée localement.

Effet sur la même graine : le séjour passe de 9,93 × 1,86 à 6,96 × 3,17.
Les violations de largeur passent de 83 à 3 sur quarante variantes en
priorité lumière, et à zéro jusqu'à 110 m² en priorité compacte.

Règle ajoutée : `TH2D-ROOM-002`, largeur exploitable, bloquante.

### Reste ouvert

`TH2D-ROOM-002` n'est **pas tenue sur les grands programmes** : 26 et 15
violations sur quarante variantes à 150 m². C'est une nouvelle occurrence du
défaut du §3.1 — une règle bloquante que le moteur ne garantit pas — et elle
s'ajoute à `TH2D-GRAPH-001` et `TH2D-CIRC-003`. La dette de règles non
tenues s'accumule plus vite qu'elle ne se résorbe : trancher le §3.1 devient
la priorité devant tout ajout de règle.

Les formes à huit arêtes — T, Z, U — supposent de lever l'exigence
d'alignement et de compter les arêtes réellement plutôt que par la formule
`4 + 2 × (parties − 1)`, valable seulement pour des parties accolées en
angle. À décider en paramètre du questionnaire plutôt qu'en dur.

## 5 ter ter. Chantier 3 quater — Gestion des multiples espaces de circulation

**Statut : identifié, non implémenté.** Verrou structurant pour les programmes au-delà de neuf pièces.

### Le problème

Aujourd'hui, le moteur produit **un seul espace de circulation** qui doit desservir toutes les pièces du programme. Au-delà de neuf ou dix pièces, une découpe en guillotine réussit rarement à réaliser une circulation unique reliant tous les accès demandés. L'architecture réelle fait différemment : elle distribue les flux en **plusieurs circulations** — typiquement une distribution jour et une distribution nuit — éventuellement **connectées ou isolées**.

**Mesure du §3.3** : à 150 m², cinq chambres et deux salles d'eau, le moteur produit 40 variantes dont **37 violant** `TH2D-GRAPH-001` (adjacences manquantes). La cause identifiée n'est pas un budget insuffisant — l'augmenter vingt fois ne ramène l'échec qu'à neuf variantes — mais un **verrou topologique** : une seule circulation ne peut pas toucher dix pièces au-delà d'une certaine densité.

### Enjeu

Les trois règles bloquantes non tenues (`TH2D-GRAPH-001`, `TH2D-CIRC-003`, `TH2D-ROOM-002` sur les grands programmes) restent concentrées sur ce phénomène. **Tant qu'une circulation unique est imposée, aucune quantité de tirage ne produira une conformité acceptable au-delà de 110–120 m².** Ce chantier débloquerait la génération pour les programmes familiaux complets.

### Modèle cible — plusieurs volumes de circulation

```js
{
  id: "circulation_day",        // jour
  type: "circulation",
  parts: [{ role: "main", ... }],
  area: 12.5
},
{
  id: "circulation_night",      // nuit, isolée
  type: "circulation",
  parts: [{ role: "main", ... }],
  area: 8.3
}
```

Chaque circulation est une **pièce autonome** du programme, dotée d'un identifiant distinct et traitée en génération comme les autres. Le graphe d'adjacences devient un **graphe dirigé** — jour accède à jour + pièces de vie, nuit accède à nuit + chambres — permettant au moteur de ne demander qu'une connexion partielle plutôt qu'une couverture complète.

### Conséquences attendues

- **Adjacences satisfaites** : le graphe reste partiel — jour n'a pas besoin de toucher les chambres, nuit n'a pas besoin d'atteindre la cuisine — ce qui rend la synthèse faisable ;
- **Conformité** : passer du régime de 37/40 à <5/40 violations sur 150 m², 5 ch, 2 sdb ;
- **Coût computationnel** : découpe plus facile (chaque circulation dessert moins de cibles), compensée par la durée d'évaluation de plusieurs graphes — à mesurer ;
- **Contrôle** : deux nouvelles règles — toute pièce est accessible depuis son entrée via une circulation, et aucune circulation ne reste isolée (sauf partition jour/nuit explicite).

### Trois décisions préalables

1. **Est-ce que jour et nuit doivent être **connectés** (un seul graphe, deux nœuds) ou **isolés** (deux graphes disjoints) ?**
   - Connectés : c'est une simplification pour la génération et pour l'usage (changer de pièce l'après-midi), mais suppose un tiers-lieux (dégagement central) ou une pièce servant de trait d'union.
   - Isolés : c'est plus contraignant pour le moteur mais plus simple en modèle — deux circulations indépendantes, aucune obligation de lien.
   - Décision : retenir la **connexion** dans un tiers-lieux — entrée, séjour, ou un dégagement volontaire — plutôt que l'isolement complet.

2. **Combien de circulations au maximum ?**
   - Deux (jour / nuit) est le cas le plus courant.
   - Trois (jour + nuit + service) existe mais rarement en logement individuel.
   - Quatre+ est hors programme de première version.
   - Décision : **deux circulations maximum**, nommées `circulation_day` et `circulation_night`, avec connexion explicite.

3. **Quand passer de une à deux circulations ?**
   - Décision du questionnaire (case à cocher « distribution jour/nuit ») ?
   - Décision du moteur (ajouter une seconde circulation dès que le programme dépasse 8 pièces) ?
   - Décision hybride (suggestion du moteur, choix de l'utilisateur) ?
   - Décision : **activation par option du questionnaire**, jamais imposée — l'utilisateur peut vouloir une circulation unique même avec huit pièces, pour intimité ou compacité.

### Règles à ajouter

- `TH2D-CIRCULATION-DESIGN-001` — deux circulations maximum, niveau bloquant ;
- `TH2D-CIRCULATION-DESIGN-002` — toute circulation touche au moins deux espaces (si une n'en touche qu'un, elle est orpheline), niveau bloquant ;
- `TH2D-CIRCULATION-CONNECTIVITY-001` — les deux circulations sont reliées si la partition jour/nuit est active, niveau conseil (permet la coexistence d'isolement et de connectivité) ;
- `TH2D-GRAPH-DAY-001` — jour relie les pièces de vie et l'entrée, niveau bloquant ;
- `TH2D-GRAPH-NIGHT-001` — nuit relie les chambres si présentes, niveau bloquant.

### Critères d'acceptation

- [ ] le questionnaire expose une option « distribution jour / nuit », visible seulement si le programme en justifie (> 7 pièces ou logement > 100 m²) ;
- [ ] une génération avec partition crée deux circulations distinctes avec identifiants uniques ;
- [ ] chaque circulation porte ses propres adjacences et ne vise qu'un sous-graphe ;
- [ ] le graphe global demeure connexe par un chemin jour → tiers-lieux → nuit ;
- [ ] une variante sans partition reste une circulation unique, comportement inchangé ;
- [ ] les taux de conformité mesurés sur les configurations du §3.2 augmentent significativement (objectif : <5/40 violations pour 150 m²) ;
- [ ] aucune régression sur les programmes simples (<6 pièces) avec ou sans partition ;
- [ ] les règles de connectivité et de distribution sont testées exhaustivement (`test-circuits.mjs`) ;
- [ ] l'export conserve l'identifiant et le rôle de chaque circulation (day/night).

### Ce qui reste ouvert

- **Trois circulations et plus** — hors scope de cette version ; le moteur et l'interface s'y prêteront si la partition jour/nuit est générique ;
- **Isolement complet des circulations** — deux graphes vraiment indépendants — rend l'entrée ambiguë (laquelle circulation servir ?) et est reporté à une révision future ;
- **Formes complexes des circulations** — aujourd'hui rectangulaires, une circulation peut devenir un L ou un T en dessous du chantier 1bis si deux accès non adjacents doivent coexister. Non dimensionné ici.

---

## 5 quater. Chantier 4 — Socle d'agencement, entrée et cheminement

**Statut : spécifié dans [`SOCLE_AGENCEMENT.md`](SOCLE_AGENCEMENT.md), non
implémenté.** C'est la direction longue du moteur.

Le socle remplace une contrainte de surface par une contrainte de forme et
de contenu : une chambre n'est plus valide parce qu'elle fait 9 m², mais
parce qu'un lit, son dégagement et le débattement de la porte y tiennent. Il
donne au passage une base rationnelle aux seuils de proportion, aujourd'hui
posés sans justification.

Trois prérequis conditionnent la règle d'entrée principale, et n'existent
pas dans le moteur : les segments de façade, les portes comme objets
dimensionnés, et un nœud `exterior` dans le graphe. Aucune règle d'accès
extérieur n'est écrivable avant eux.

Le cheminement doit être calculé dans le moteur : les principes non
négociables interdisent tout service externe et imposent `file://`.

Stratégie d'intégration retenue pour démarrer — validation après coup, sur
le seul candidat retenu — parce qu'elle borne le coût, produit des
contre-exemples exploitables et reste réversible. La bascule vers une
contrainte de découpe ne sera décidée qu'au vu des taux d'échec mesurés.

Séquence, critères d'acceptation et grille de comparaison des trois
stratégies : voir le document.

## 5 quinquies. Chantier 5 — Trois défauts bloquants de génération

**Ouvert le 18 août 2026. Prioritaire sur tout le reste de la roadmap.**
Défauts localisés dans le code : voir
[`SUIVI_REGLES_PIECES.md`](SUIVI_REGLES_PIECES.md).

La différence avec les chantiers précédents tient en une phrase : ceux-là
amélioraient un moteur qui produisait des plans justes ; celui-ci répare un
moteur qui, sur trois points, **produit un plan faux**. Deux options du
questionnaire donnent aujourd'hui un résultat que l'utilisateur ne peut pas
interpréter autrement que comme un bug.

### 5.1 — D1, l'entrée n'est pas une contrainte de génération — **corrigé le 18 août**

Livré : pénalité d'entrée dans `scoreCandidate()`, règle `TH2D-ENTREE-001`
(HARD), `test-entree.mjs`. La circulation atteint la façade dans 55,2 % des
plans contre 31,9 %, et l'entrée y est accueillie 116 fois contre 67.

La mesure a révélé un second défaut de même nature : `TH2D-FACADE-001` est
HARD mais n'était pas non plus dans le score, si bien que pousser l'entrée
vers l'enveloppe prenait la façade des chambres — 39 → 53 violations. Une
pénalité de 100 points par pièce principale enclavée la ramène à **2**.
Détail et tableau : `SUIVI_REGLES_PIECES.md`.

Énoncé d'origine, conservé :

`poserEntree()` s'exécute après que les candidats ont été notés et le
meilleur retenu ; `scoreCandidate()` ne regarde ni la façade ni l'entrée. La
circulation n'a donc aucune raison d'atteindre l'enveloppe : elle finit
enclavée, et l'entrée redescend la chaîne `ENTREE_ORDRE` vers le séjour ou la
cuisine — quand elle ne renvoie pas `null`.

Le chantier 4 disait vrai en 2026 : sans segments de façade ni nœud
`exterior`, aucune règle d'accès n'était écrivable. **Ces trois prérequis
existent désormais** — `facadeSegments()`, `edgesToExterior()`, `poserEntree()`.
Il ne manque plus que de les faire peser sur la sélection.

- [ ] porter le contact façade de la pièce éligible dans `scoreCandidate()` ;
- [ ] pénaliser lourdement le plan sans entrée, au lieu de le retenir puis de
  le signaler ;
- [ ] `TH2D-ENTREE-001` : la pièce d'accueil de l'entrée touche l'enveloppe
  sur au moins 0,90 m de linéaire ;
- [ ] mesurer, sur graines fixes, la part de plans où la circulation atteint
  la façade avant et après.

### 5.2 — D2, une pièce fusionnée reste dessinée en parties — **corrigé le 18 août**

Livré : `cheminContour()` trace le pourtour d'un ensemble de rectangles, le
rendu n'émet plus qu'un `path` par pièce, et le rectangle utile devient la
boîte englobante dès que les parties la pavent — 176 pièces sur 530 y
retrouvent 623 m² meublables que le solveur ne voyait pas. `test-contour.mjs`
tient l'invariant.

**Fermé par M4b le 29 août.** `placement.js` travaille sur le polygone utile
entier et refuse toute emprise ou zone d'usage traversant une encoche. Le cache
`fit.data.js` demeure indexé par rectangle, mais publie cette portée et ne
porte plus de verdict hors rectangle.

Énoncé d'origine, conservé :

`app.js` trace chaque `part` séparément : une pièce en L montre le trait de
refend entre ses parties, et le solveur de pose raisonne lui aussi sur les
parties plutôt que sur leur union. C'est l'inverse du comportement attendu —
**le contour extérieur seul, et l'agencement travaille ce volume unifié**.

Reprend l'observation N°4 de l'audit des plans rendus, jamais traitée.

- [ ] union des parties d'une pièce en un contour unique au dessin ;
- [ ] transmettre au solveur le polygone unifié, non la liste des parties ;
- [ ] conserver les parties comme donnée interne de découpe, non comme
  entité de plan.

### 5.3 — D3, la fusion est implémentée comme une suppression — **corrigé le 18 août**

Livré : table `COMPOSITIONS` dans `room-model.js`, `composeInto()` dans
`generator.js`, contexte `integratedWc` dans `app.js`, `TH2D-ROOM-002`
étendue aux programmes composés, et `scripts/test-fusion.mjs` qui tient
l'invariant « aucune option ne fait disparaître une fonction ».

Trois enseignements, détaillés dans `SUIVI_REGLES_PIECES.md` : le minimum
composé n'est pas la somme des minima — mesuré, cela rendait la salle d'eau
non meublable à 75 m² ; le poids ne s'additionne pas davantage ; et le cache
de faisabilité ne connaissant que les types simples, le contrôle reste
nécessaire sans être suffisant.

Énoncé d'origine, conservé :

Décocher « WC indépendant » ne fusionne pas le WC dans la salle d'eau : il
disparaît. Aucune pièce n'est créée, et `socle.data.js` ne prévoit pas de
`wc_pan` parmi les équipements de `bath`, sous aucune variante. Décocher
« Cuisine séparée » fait de même : la pièce part sans que ses équipements
rejoignent le séjour.

C'est le point « programmes composés » du modèle commun, qui cesse d'être un
enrichissement pour devenir une réparation.

- [ ] variante `bath` « avec WC » portant `wc_pan` et ses dégagements ;
- [ ] variante `living` « avec cuisine ouverte » portant le linéaire ;
- [ ] `room-model.js` désigne la variante selon les options du questionnaire ;
- [ ] une pièce fusionnée porte un programme réuni, un contour, une étiquette
  composée — jamais deux entités.

### 5.4 — Couverture des pièces *(déplacée)*

L'inventaire et l'exécution de l'extension du programme font désormais l'objet
d'un chantier dédié : **§5 septies, chantier 7**. Ce qui reste ici est le seul
constat qui commande l'ordre du chantier 5.

Le générateur produit six types ; le socle en décrit treize. **Le manque
immédiat est de sept pièces déjà modélisées mais jamais générées.** Elles ne
seront pas activées avant D1, D2 et D3 : générer sept typologies de plus dans
un moteur qui dessine mal les fusions et place l'entrée au hasard
multiplierait le défaut par sept.

<details>
<summary>Inventaire détaillé — conservé pour mémoire, repris au chantier 7</summary>


Le générateur produit six types : séjour, cuisine, chambre, salle d'eau, WC,
circulation. Le socle en décrit treize. **Le manque immédiat est donc de sept
pièces déjà modélisées mais jamais générées**, ce qui est le meilleur rapport
valeur/coût de la roadmap : le socle est fait, il manque l'activation.

**Déjà modélisées, non générées**

| Pièce | Ce qui manque |
|---|---|
| Bureau | activation dans le programme et le générateur ; fiche et équipements prêts |
| Entrée | la pièce elle-même — la porte d'entrée existe déjà |
| Salle à manger | décision préalable : pièce autonome ou zone du séjour |
| Cellier | règles d'adjacence cuisine, stockage, circulation |
| Buanderie | règles de réseaux et d'usage, relation cellier / local technique |
| Local technique | règles de maintenance, réseaux, éloignement des pièces sensibles |
| Garage | gabarit véhicule, accès, porte, sas, liaison au logement |

**Fonctions partiellement couvertes**

| Fonction | État |
|---|---|
| Rangements | produits comme annexes, pas comme pièce |
| Dressing | composant possible, sans programme de pièce autonome |
| Cuisine ouverte | composition partielle, sans statut distinct — cf. 5.3 |
| Coin repas | absorbé dans le séjour, sans désignation autonome |
| Coin bureau | non géré comme zone optionnelle du séjour ou d'une chambre |

**Programmes composés manquants** — suite parentale (chambre + rangement ou
dressing + salle d'eau), chambre d'enfant comme variante fonctionnelle
distincte, chambre d'amis éventuellement combinée à un bureau, studio avec
ses règles de fusion, sas d'entrée reliant extérieur, garage et logement,
arrière-cuisine à distinguer du cellier et de la buanderie.

**Hors modèle actuel** — escalier, palier, étage, mezzanine, terrasse,
balcon, loggia, véranda, jardin ou cour, cave, grenier, combles, atelier,
local vélo, local poubelles. Deux évolutions structurelles les commandent :
le multi-niveaux et une famille d'espaces extérieurs avec leurs seuils.
Aucune n'est un ajout de règle.

</details>

### 5.5 — Ordre retenu

1. **D1, D2, D3** — les trois défauts, et rien d'autre dans ce chantier.
2. Première mesure à l'aveugle — chantier 6.
3. Extension du programme de pièces — chantier 7.

L'ordre n'est pas discutable : 5.3 livre le mécanisme de composition dont
dépendent tous les programmes composés du chantier 7, et 5.2 livre le contour
unifié sans lequel une pièce fusionnée ne peut ni se dessiner ni se meubler.
Les défauts ne sont pas seulement urgents, ils sont **en amont**.

### Critères d'acceptation du chantier 5

- aucune option du questionnaire ne fait disparaître une fonction du plan ;
- une pièce fusionnée se dessine d'un seul contour et se meuble comme un
  volume unique ;
- la part de plans dont la circulation atteint la façade est mesurée avant et
  après D1, sur graines fixes ;
- chaque pièce nouvellement générée satisfait les sept points de la
  définition de « terminé » de `SUIVI_REGLES_PIECES.md`.

**Critère de sortie ajouté le 18 août** : la phase 12 b ne démarre pas avant
la première mesure à l'aveugle du chantier 6. Ajouter sept pièces à un plan
de base médiocre produit un plan médiocre à sept pièces de plus.

## 5 sexies. Chantier 6 — Mesure de la qualité perçue

**Ouvert le 18 août 2026.** Répond à une question que ni le banc ni les
règles ne savent traiter : les plans produits sont-ils *utilisables et
inspirants*, et pas seulement conformes.

### 6.1 — Pourquoi le banc actuel ne peut pas y répondre

`scripts/scan-capacites.mjs` mesure conformité, diversité, meublabilité,
écart de surface et durée. Aucune de ces grandeurs ne décrit ce qu'un
habitant ressent devant un plan.

Deux angles morts, à nommer avant de construire quoi que ce soit :

- `TH2D-ROOM-002` dit **meublable**, pas **agréable**. Une pièce où le lit
  entre au millimètre passe la règle ;
- la diversité comptée en signatures distinctes mesure la **variation**, pas
  la **qualité**. Un générateur peut être très divers et uniformément
  médiocre — c'est le résultat attendu si l'on augmente le tirage sans
  changer le modèle.

Le banc reste le témoin de la conformité. Il ne devient pas un juge de la
qualité, et il ne doit pas être modifié pour prétendre l'être.

### 6.2 — Quatre mesures, pré-enregistrées

**Pré-enregistrées le 19 août 2026 dans
[`PROTOCOLE_MESURES.md`](PROTOCOLE_MESURES.md)** : seuils, taille
d'échantillon, règle d'arrêt et règle de lecture y sont fixés avant la
première mesure, et le seuil de décision qui ouvre la phase 12 b y est écrit
noir sur blanc. Le tableau ci-dessous en reste le résumé.


| Mesure | Protocole | Ce qu'elle établit |
|---|---|---|
| **Discrimination** | 10 plans générés mêlés à 10 plans réels de même surface et même programme, 5 juges à l'aveugle dont 2 architectes si possible | taux de confusion ; 50 % = indiscernable. La seule qui ne se triche pas |
| **Préférence par paires** | généré contre référence, deux à deux | % de victoires, plus stable qu'une note absolue, donne une courbe entre versions |
| **Conservation** | sur utilisateurs réels : plans sauvegardés, rejoués, montrés | observe un comportement au lieu de demander un avis |
| **Surprise utile** | deux questions distinctes : « y auriez-vous pensé ? » et « y habiteriez-vous ? » | inspirant = *non* à la première, *oui* à la seconde. C'est la définition opérationnelle de l'inspiration retenue par le projet |

### 6.3 — Tester l'instrument avant de s'en servir

Faire dessiner par un architecte le plan d'un des programmes du banc, puis
passer ce plan dans le banc. **S'il obtient un mauvais score, ce sont les
critères qui sont faux, pas le plan.**

Une heure de travail, et elle valide — ou invalide — l'instrument avec lequel
on pilotera le reste de la feuille de route. À faire avant la première mesure
à l'aveugle.

### 6.4 — Le quiz embarqué et le journal d'évaluation

Les mesures du §6.2 sont justes mais rares et coûteuses. Il manque un signal
**continu**, recueilli à chaque génération, au moment où le plan est sous les
yeux.

**Le dispositif.** Un mini-quiz dans la page, proposé après l'affichage du
plan — jamais bloquant, toujours refusable. Chaque réponse est jointe aux
caractéristiques de la génération et versée à un journal local exporté en
JSON.

**Contrainte non négociable, et elle décide de l'architecture** : les
principes du projet interdisent tout service externe et imposent `file://`.
Le journal ne part donc nulle part. Il s'accumule dans le navigateur et
s'exporte par un bouton, en un fichier que l'on classe à la main. Pas de
collecte silencieuse, pas de serveur, pas de compte.

**Ce qu'une entrée doit contenir** pour rester exploitable dans six mois :

- la **graine** et les options du questionnaire — sans elles le jugement
  n'est pas rejouable, donc perdu ;
- la **version du moteur**, sans quoi on mélangera des avis portant sur des
  plans que le même code ne produit plus ;
- les métriques déjà calculées : score, conformité, violations, meublabilité,
  diversité de la série, durée ;
- les réponses du quiz, horodatées ;
- rien qui identifie la personne.

**Progression du quiz**, calée sur la crédibilité du moteur :

1. *Aujourd'hui* — deux questions, pas plus : « y habiteriez-vous ? » et
   « y auriez-vous pensé ? », plus un champ libre d'un mot pour le principal
   défaut. Un quiz long sur un moteur qui produit encore des plans faux
   récolte du bruit et fatigue le répondant.
2. *Après le chantier 5* — le défaut cité devient une liste fermée, alimentée
   par les mots libres les plus fréquents. C'est la façon la moins arbitraire
   de construire les options.
3. *Quand la génération sera crédible* — jugement pièce par pièce,
   comparaison par paires entre deux variantes de la même graine, et note de
   surprise séparée de la note d'habitabilité.

**Ce que le journal permettra, et dans quel ordre.** L'objectif immédiat
n'est pas d'apprendre : c'est de **vérifier que `scoreCandidate()` a un
rapport avec le jugement humain**. Corrélation entre score interne et note
d'habitabilité — si elle est nulle, le moteur optimise du bruit depuis le
début, et c'est le résultat le plus utile que ce chantier puisse produire.
Ensuite seulement, et à condition d'avoir des centaines d'entrées, on pourra
re-pondérer les critères de score. Quelques dizaines d'avis ne permettent
d'entraîner quoi que ce soit, et prétendre le contraire ferait de ce journal
un ornement.

**Le biais à ne jamais oublier** : ce quiz est rempli par qui développe le
moteur, ou par des proches. Ce n'est pas une mesure à l'aveugle. Il donne une
**tendance longitudinale** — est-ce que ça s'améliore ? — pas une vérité sur
la qualité. Les deux dispositifs sont complémentaires et ne se remplacent
pas : le panel du §6.2 étalonne, le quiz suit.

- [x] quiz deux questions dans `index.html`, refusable, non bloquant ;
- [x] journal accumulé en `localStorage`, schéma ci-dessus ;
- [x] export JSON par bouton, fichier ignoré par git ;
- [x] corrélation score interne / note d'habitabilité — `scripts/correlation-avis.mjs`,
      refuse de conclure sous 50 avis ;
- [x] test de l'instrument (§6.3) avant la première mesure à l'aveugle ;
- [ ] première mesure de discrimination (§6.2), qui ouvre la phase 12 b.

### 6.5 — Ce que le test de l'instrument a trouvé, le 19 août 2026

**Fait avant tout le reste, comme prévu, et il a servi immédiatement.**
Le plan de référence dessiné à la main — un T3 de 75 m², configuration du
banc — obtient **zéro violation** et pourtant **15,05 points de score**,
quand les trente plans générés du même programme obtiennent tous **0**. Le
moteur classait donc un plan de promoteur strictement derrière chacun des
siens.

La cause est unique et entièrement décomposable : la peine de proportion
(`ratio < 0,32`) frappait un dégagement de 1,30 × 5,50 m. **Un couloir est
allongé par définition.** Le critère a été corrigé, pas le plan — c'est la
règle du §6.3, et elle est à sens unique.

**La correction évidente — exempter la circulation — a été écrite, mesurée,
puis retirée.** Sur 600 pièces meublées, les pièces que le solveur complet ne
sait plus meubler passent de **4 à 12** ; au banc, `TH2D-CIRC-004` passe de
298 à 449 en rectangle quand `TH2D-ROOM-001` tombe de 55 à 17. Le critère est
faux, mais le corriger ainsi dégrade les plans. La peine reste donc en place,
en sachant qu'elle est fausse, et `test-instrument.mjs` porte l'écart de
15,05 comme **limite consignée** — il échoue si l'écart s'aggrave, pas s'il
persiste. Empreintes du banc inchangées : `f3ed28a2`, `11de3c85`, `e21f110e`.

**Trois résultats, dont deux qui n'étaient pas cherchés :**

1. la cause profonde n'est pas dans le critère : `scoreCandidate()` s'exécute
   **avant** la cession de circulation et ne peut pas arbitrer sur ses
   conséquences. Un couloir libéré s'allonge, longe plus de pièces, leur cède
   plus de bandes — et le solveur, encore rectangulaire, sert une pièce en L
   par sa seule partie principale. Tant que la recherche ne voit pas la
   cession, toute correction déplacera le problème ;
2. **22 configurations du banc sur 23 se voient allouer par `buildProgram()`
   une circulation qui dépasse déjà le seuil de `TH2D-CIRC-004`**, avant
   toute géométrie. Le programme demande ce que la règle réprouve. La peine
   de proportion masquait cette contradiction par accident, en poussant vers
   des couloirs plus petits pour une raison sans rapport avec leur surface.
   **Dossier instruit le 19 août dans
   [`DOCTRINE_CIRCULATION.md`](DOCTRINE_CIRCULATION.md)** : le seuil n'a pas
   de source, les seuls chiffres disponibles portent sur les circulations
   *communes d'immeuble* ; la règle est infaisable sous 55 m² et sans effet
   au-dessus de 150 ; le moteur, lui, ramène la circulation à son minimum de
   desserte une fois sur deux. Proposition posée, **non appliquée** : plafond
   relatif au besoin calculé plutôt que fraction de la surface. Trois points
   restent à trancher ;
3. la recherche s'arrête au premier candidat de score nul. Sur les
   programmes peu contraints, tous les plans retenus valent 0 : **le score ne
   discrimine rien parmi eux, et la corrélation avec l'habitabilité y est
   structurellement impossible à calculer.** L'outil du §6.4 le dit au lieu
   d'afficher un zéro trompeur.

Le troisième point est le plus lourd pour la suite : il signifie que la
question « `scoreCandidate()` a-t-il un rapport avec le jugement humain ? »
ne pourra recevoir de réponse que sur les programmes contraints, tant que la
recherche s'arrêtera au premier plan parfait selon ses propres critères.

## 5 septies. Chantier 7 — Extension du programme de pièces

**Ouvert le 18 août 2026.** Porte l'exécution de ce que le §5.4 ne faisait
que constater : passer de six types générés aux treize décrits par le socle,
puis aux programmes composés, puis aux espaces que le modèle ne sait pas
encore représenter.

État de référence pièce par pièce :
[`SUIVI_REGLES_PIECES.md`](SUIVI_REGLES_PIECES.md), qui fait foi sur le
statut ; ce chantier fait foi sur l'ordre et les conditions.

### 7.0 — Conditions d'entrée

Aucun lot ne démarre tant que les trois ne sont pas vraies :

1. **D1, D2, D3 corrigés** (chantier 5). D3 livre le mécanisme de
   composition, D2 le contour unifié : sans eux, les lots L4 et L5 n'ont pas
   de fondation. **Fait (18 août).**
2. **Périmètre d'activation décidé par M5.4.** L'ancienne condition demandait
   une première mesure à l'aveugle avant toute activation produit ; elle est
   retirée car elle ferait dépendre les pièces nécessaires à la version de la
   validation M6 de cette même version. M5.4 autorise uniquement les vagues I1
   nommées ; M6 évalue ensuite ce périmètre figé.
3. **Trois arbitrages rendus** — **clos le 26 août** dans
   [`DECISIONS_PROGRAMME.md`](DECISIONS_PROGRAMME.md), généralisés le 27 août
   par [`DOCTRINE.md`](DOCTRINE.md) :
   - **salle à manger** : fonction émergente ; zone du séjour par défaut ;
   - **dressing** : équipement → zone → annexe selon profondeur ;
   - **rangement** : annexe sous 80 m² ; pièce possible au-delà.

La documentation L1 reste autorisée avec les conditions 1 et 3. Son activation
produit attend désormais la décision M5.4 et l'ouverture de la vague I1 qui la
porte, pas une mesure M6 encore impossible à conduire sur cette version.

### 7.1 — Lots

Chaque lot est livrable seul, testable seul, et n'ouvre le suivant que
lorsqu'il est terminé au sens du §7.4.

| Lot | Contenu | Dépend de | Livre |
|---|---|---|---|
| **L1** | Bureau, entrée | 7.0 + F1 | le mécanisme d'activation **et** l’interpréteur FUNCTION / `trigger` (avec F2) |
| **L2** | Salle à manger, cellier | L1 + F2 | la désignation d'une zone dans une pièce hôte (avec F3) |
| **L3** | Buanderie, local technique | L2 | les règles de réseaux et de regroupement humide |
| **L4** | Suite parentale | L1, D3 | le premier programme **composé** réel |
| **L5** | Garage, sas d'entrée | L4 | la relation au non-habité et le seuil extérieur |
| **L6** | Studio, cuisine ouverte, coin repas, coin bureau, chambres enfant/amis | L4 | les variantes fonctionnelles et la fusion complète |
| **L7** | Espaces extérieurs, multi-niveaux, annexes | tout ce qui précède | deux évolutions structurelles du modèle |

**L1 est le lot pilote** : deux pièces sans difficulté propre, dont le seul
enjeu est de faire apparaître la mécanique d'activation — programme,
désignation de variante, génération, pose, règles, tests. Les lots suivants
la réutilisent ; s'il faut trois jours pour L1 et trois jours pour L2, c'est
que L1 n'a pas livré de mécanique réutilisable et il faut s'arrêter.

**L7 n'est pas une extension, c'est un changement de modèle.** Le moteur est
mono-niveau et sans extérieur ; escalier, terrasse et cave ne s'ajoutent pas
comme une pièce de plus. Ce lot reste dans ce chantier pour être visible, pas
pour être traité à la suite des autres.

### 7.2 — Dépendances transverses

Trois capacités manquent et sont réclamées par plusieurs lots. Les traiter
dans le lot qui les réclame en premier, pas à part :

| Capacité | Réclamée par | Traitée dans |
|---|---|---|
| Zone désignée à l'intérieur d'une pièce hôte | salle à manger, coin repas, coin bureau | **L2** |
| Réseaux humides et regroupement technique | buanderie, local technique, arrière-cuisine | **L3** |
| Adjacences typées — obligatoire, interdite, souhaitable, déconseillée | cellier ↔ cuisine, garage ↔ logement, WC ↔ repas | **L2**, étendu en L5 |

L'adjacence typée mérite d'être signalée : elle est aujourd'hui binaire
(demandée / obtenue). Le cellier attend « souhaitable près de la cuisine », le
garage « obligatoirement relié par un sas », le WC « interdit ouvrant sur les
repas » (`REF-008`, cf. `agencement/README.md` §2). Trois besoins, une seule
évolution.

### 7.3 — Tests exigés par lot

Aucun lot n'est terminé sans ces quatre preuves. Elles existent déjà comme
outils : ce chantier ne crée pas de banc, il l'étend.

1. **Modèle** — `scripts/test-room-model.mjs` : le nouveau type est désigné
   avec ses exigences et ses variantes, cas passant et cas refusé.
2. **Pose** — `npm run fit:test` (`scripts/test-placement.mjs`) : les
   équipements requis tiennent dans le gabarit annoncé, et un gabarit trop
   petit est refusé pour la bonne raison.
3. **Cache de faisabilité** — `npm run fit:build` régénéré : tout nouveau
   type change le domaine de faisabilité. Un lot qui ne régénère pas
   `fit.data.js` livre un cache faux.
4. **Non-régression sur le banc** — `scripts/scan-capacites.mjs` sur les 24
   configurations, plus `scan-seeds.mjs`. Le banc est rejouable depuis D4 :
   comparer l'**empreinte** affichée en fin de tableau avant et après le lot,
   à graine égale, suffit à trancher. Conformité, diversité,
   meublabilité et durée ne se dégradent pas sur les programmes qui
   n'utilisent pas la pièce ajoutée. C'est le test le plus important du lot,
   et le seul qui détecte le coût caché d'une pièce nouvelle sur toutes les
   autres.

Deux seuils à tenir, hérités du budget existant : la durée de génération
reste sous 110 ms, et la diversité au-dessus de vingt signatures distinctes
sur trente tirages.

### 7.4 — Définition de terminé

Un lot est terminé quand **chacune** de ses pièces satisfait les sept points
de `SUIVI_REGLES_PIECES.md` — fiche, socle, désignation, génération,
validation par le solveur, verdicts identifiés dans le rapport, tests — et
quand les quatre conditions de lot sont vraies :

- les quatre tests du §7.3 passent, cache régénéré ;
- le banc ne régresse sur aucune des 24 configurations ;
- `SUIVI_REGLES_PIECES.md` est mis à jour : ligne de matrice, journal, et
  passage de « Socle seul » à « Couvert » ou « Partiel » avec le manque
  résiduel nommé ;
- aucune option du questionnaire ne fait disparaître une fonction — invariant
  hérité de D3, à revérifier à chaque lot puisque chaque pièce nouvelle ajoute
  une option.

### 7.5 — Ce qui ferait échouer ce chantier

Deux façons de le rater, à surveiller explicitement :

- **La dérive par accumulation** — chaque pièce ajoutée élargit le programme,
  donc contraint la découpe, donc dégrade les adjacences des programmes
  existants. Le §7.3.4 est là pour l'attraper tôt ; si la dégradation apparaît
  dès L2, ce n'est pas un défaut du lot, c'est le signe que la méthode de
  génération est à bout — et l'essai typologie devient prioritaire sur la
  suite du chantier.
- **La pièce décorative** — un type généré, jamais meublé, sans règle propre,
  qui gonfle le catalogue sans rien apporter. Le §7.4 l'interdit en exigeant
  les sept points, pas seulement la génération.

## 5 octies. Chantier 8 — Gammes de tailles d'équipements

**Ouvert le 21 août 2026.** Le chantier 7 élargit le catalogue de **pièces** ;
celui-ci élargit le catalogue de **tailles** à l'intérieur d'une pièce. Les
deux sont orthogonaux et ne se disputent aucun fichier.

Conception détaillée, tables de tailles et sourcing :
[`GAMMES_EQUIPEMENTS.md`](GAMMES_EQUIPEMENTS.md).

### 8.1 — Le constat

Le socle donne à chaque équipement une emprise unique. Une chambre de 18 m²
reçoit donc le même lit qu'une chambre de 9 m² : le moteur sait refuser une
pièce trop petite, il ne sait pas se servir d'une pièce grande. La surface
excédentaire est comptée en agrément, jamais en usage.

**Quatre équipements sur vingt-huit sont inatteignables**, mesuré le 21 août sur
`selectedEquipments()` : `bed_160`, `closet`, `bookcase`, `dryer`. Tous portent
`required: false` sans `minRoomArea`, et la troisième branche de la sélection les
écarte toujours. `bed_160` avait été ajouté sur la recommandation de
`DATASOURCE_EQUIPEMENTS.md` §7.2 — le marché ayant basculé du 140 × 190 vers le
160 × 200 — et n'a jamais été posé dans un plan.

Ce n'est pas un défaut de câblage, c'est l'absence du concept : le socle n'a pas
de mot pour « autre taille du même équipement ». Le contourner avec les
mécanismes existants échoue de trois façons — quatre tailles requises seraient
toutes posées, quatre tailles optionnelles à seuils croissants seraient cumulées,
et multiplier les variantes de pièce mélangerait ce que la pièce **est** avec ce
qu'on **y met**.

### 8.2 — Le principe

Une **gamme** est une famille de tailles d'un même équipement, dont exactement
une est retenue. Elle porte ce qui ne dépend pas de la taille — ancrage,
dégagements, réseaux — et délègue à ses membres l'emprise.

```js
{
  id: 'sofa', label: 'Canapé', required: true,
  footprint: { w: 1.80, d: 0.90 },          // le plancher reste ici
  anchor: 'wall', usage: [{ face: 'front', min: 0.90 }],
  sizes: [                                   // les montées, et elles seules
    { id: 'sofa_3', from: 24, footprint: { w: 2.20, d: 0.90 } },
    { id: 'sofa_angle', from: 30, footprint: { w: 2.20, d: 2.20 }, anchor: 'corner' }
  ]
}
```

Le membre retenu est le plus grand dont le seuil est atteint, le plancher à
défaut — le choix est déterministe, la graine fait varier la pose et jamais le
programme.

**Le plancher reste dans `footprint`, pas dans `sizes[0]`.** C'est la décision
de conception qui porte tout le reste : `requiredEquipments()` et
`build-envelopes.mjs` continuent de lire la plus petite taille sans rien
connaître des gammes, et ajouter une taille **ne peut pas** déplacer un domaine
de faisabilité. L'invariant du §8.3 est alors tenu par construction et non par
test — le test ne fait plus que le confirmer.

**`id` ne change jamais.** Une montée en gamme change l'emprise, pas l'identité :
`LIVING-FOCAL-001` nomme `sofa`, et doit continuer de s'appliquer quand le séjour
reçoit un trois-places. La taille retenue se relit dans `size`. Faire porter au
membre son propre identifiant aurait silencieusement désactivé toutes les
relations dès la première montée.

**Ce que la gamme dissout.** `DATASOURCE_EQUIPEMENTS.md` §1 énonce le levier le
plus structurant du sourcing : cesser d'affirmer. Tant que le socle porte une
taille unique, il soutient qu'un lit fait 1,40 × 1,90. Avec une gamme, il dit :
voici les tailles du marché, voici celle que votre pièce reçoit. Les cotes
redeviennent des valeurs par défaut modifiables. La gamme n'est pas une commodité
de dimensionnement, c'est la structure qui rend l'aveu de non-opposabilité
tenable.

### 8.3 — L'invariant, et la seule façon de le rompre

Le plancher de meublabilité de `fit.data.js` est calculé sur les équipements
requis, donc sur leur `footprint`, donc sur le plancher de la gamme. **Ajouter
des tailles au-dessus du plancher ne change aucune enveloppe** — et le §8.2 fait
que c'est vrai par construction, `build-envelopes.mjs` ne voyant même pas le
champ `sizes`. Vérifié au bit près après G1 : `fit.data.js` régénéré est
identique.

Abaisser un plancher abaisse le seuil de meublabilité de la pièce et laisse
passer des pièces aujourd'hui refusées. Ce n'est pas interdit : c'est une
décision, prise gamme par gamme avec sa justification, jamais subie comme effet
de bord. Deux abaissements sont proposés, de statut inégal :

| Abaissement | Fondement | Décision |
|---|---|---|
| Douche 0,90 → 0,80 | `VAL-EQ-032` porte le receveur compact comme « admis en petite surface », `VAL-EQ-031` le 0,90 comme minimum **confortable** — deux cotes que le socle avait réduites à une | retenu, effet à mesurer sur `bath/eau` |
| Lit enfant 0,90 → 0,80 | aucun | **écarté de ce chantier** tant qu'aucune source ne le porte |

### 8.4 — Lots

| Lot | Contenu | Touche | Livre |
|---|---|---|---|
| **G1** ✅ | Le mécanisme, plus deux gammes témoins — lit et canapé | `socle.data.js`, `room-model.js`, `app.js`, `composition.js` | la résolution de gamme et son repli |
| **G2** | Douche, baignoire, lavabo, table | `socle.data.js` seul | les tailles restantes, dont le seul abaissement retenu |
| **G3** | Linéaires de rangement — penderie, placard, bibliothèque, étagères | `socle.data.js` seul | la fin de `MODULE` comme longueur unique |
| **G4** | Plan de travail à longueur déterminée par la pose | `placement.js` | un équipement dimensionné par le solveur |

**G1 devait être un non-événement pour le plan, et l'a été.** Livré le 21 août :

- `fit.data.js` régénéré **identique octet pour octet** ;
- **empreinte du banc inchangée**, `5bd33591` sur les 24 configurations, avec et
  sans résolution de gamme — mesuré en neutralisant la seule porte
  comportementale, pas en argumentant ;
- aucune pièce non meublable relevée au banc ; les quinze fichiers de test
  passent ;
- les quatre équipements inatteignables du §8.1 le sont désormais : `bed_160` et
  `bed_180` sont devenus des membres de la gamme du lit, `closet`, `bookcase` et
  `dryer` ont reçu le `minRoomArea` qui leur manquait — trois pièces non
  générées, donc sans effet sur le banc, ce que l'empreinte confirme.

**Ce que G1 a appris et que la conception ne prévoyait pas.** Une montée en
gamme peut rendre non meublable une pièce qui l'était : un séjour de 30 m² mais
large de 2,00 m accepte le canapé plancher et refuse l'angle. Le mécanisme est
donc incomplet sans un **repli**, et l'ordre des replis compte. `app.js` en pose
deux, du moins destructeur au plus : rabattre la gamme sur son plancher, puis
seulement retirer les équipements non requis. Dans cet ordre, une montée en
gamme ne peut pas retirer de mobilier à une pièce. Sans lui, G1 aurait introduit
une régression que le banc ne voit pas, puisqu'il mesure la géométrie du plan et
non son ameublement.

**Limite à la livraison de G1 — fermée par M4c.** `furniture.svg` indexait ses
symboles par identifiant d'équipement, et son `viewBox` vaut l'emprise
(`SOCLE_AGENCEMENT.md` §4). L'identifiant étant conservé par la gamme, un
`sofa_3` était dessiné avec le symbole du deux-places, étiré de 1,80 à 2,20 m, soit
**22 %** ; un `bed_160`, de 1,40 à 1,60 m, soit **14 %**. L'emprise reste juste,
mais le dessin mentait sur la forme.

`renderFurniture()` cherche désormais `#furn-{size}` avant `#furn-{id}`. Les
quatre symboles alors manquants — `sofa_3`, `sofa_angle`, `bed_160`, `bed_180`
— ont été livrés avec M4c. `double_washbasin` et `oven` existent aujourd'hui
sans équipement de catalogue pour les porter ; ils restent des réserves, pas
des équipements intégrés.

**G4 n'est pas une gamme et ne doit jamais être traité avec elles.** Le plan de
travail joint l'évier à la plaque : sa longueur est un **résultat de la pose**,
pas un choix dans une échelle. Or `placement.js` pose des emprises connues avant
la pose. La relation `between` existe déjà mais vérifie une pose, elle ne la
dimensionne pas. G1 à G3 sont des passes de donnée à mécanisme constant ; G4 est
un changement de solveur. Les confondre est le plus sûr moyen de faire échouer
les deux.

`SOCLE_AGENCEMENT.md` §5.4 décrit d'ailleurs le plan de travail comme « 0,60
**min** entre évier et plaque » : le socle a transcrit un minimum en dimension
fixe. G4 ne fait que rendre au socle ce qu'il disait.

### 8.5 — Ce que ce chantier ne fait pas

Le **mobilier lié** — table de nuit dont le nombre suit le lit, chaises dont le
nombre suit la table — n'entre pas ici. C'est un cinquième mécanisme, distinct
de la gamme : une quantité et une dépendance entre équipements. Les chaises
portent en plus un piège, `SOCLE_AGENCEMENT.md` §5.2 les comptant déjà dans la
zone d'usage de la table ; les matérialiser en emprises serait un double
comptage. À trancher séparément, après G2.

### 8.6 — Règles à ajouter

**Aucune, finalement.** `TH2D-GAMME-001` — « un équipement à gamme désigne
exactement un membre » — était prévue bloquante. Elle est sans objet : la
résolution retourne un objet, jamais une liste, et conserve l'identifiant de la
gamme. Un doublon est donc impossible à construire, et `EX2` continue de le
vérifier sans modification puisqu'elle compte les identifiants distincts.

Écrire la règle quand même aurait produit exactement ce que le §7.5 appelle une
pièce décorative, transposé aux règles : un contrôle qui ne peut pas se
déclencher, gonflant le référentiel sans rien garantir. La garantie est
structurelle et se teste — même traitement que `TH2D-FORME-001`, déclassée en
test le 16 août pour la même raison. Elle redeviendrait une règle si la
résolution changeait de forme.

### 8.7 — Critères d'acceptation

- [x] G1 ne modifie aucune enveloppe de `fit.data.js` et laisse l'empreinte du
  banc inchangée — `5bd33591` de part et d'autre ;
- [x] aucun équipement du socle n'est inatteignable — les quatre du §8.1 sont
  désignés ;
- [x] `npm run fit:build` régénéré, `npm run fit:test` au vert, quinze fichiers
  de test au vert ;
- [x] un seuil `from` franchi change la taille retenue, et le choix ne dépend que
  de la surface ;
- [x] une montée en gamme ne rend jamais une pièce moins meublée qu'avant —
  garanti par l'ordre des replis, cas témoin du séjour étroit ;
- [x] le compositeur expose chaque membre comme un choix, la désignation n'en
  retient qu'un ;
- [ ] **le mécanisme n'a pas de test dédié** — il est prouvé par mesure, pas
  protégé contre la régression. Une gamme cassée ne serait signalée par aucun
  banc, puisque l'empreinte ignore l'ameublement. À écrire dans G2, avec le cas
  du repli et celui de la relation qui survit à la montée ;
- [ ] G2 : l'abaissement du plancher douche est mesuré séparément, son effet sur
  `bath/eau` chiffré et non seulement constaté ;
- [ ] G2 : le banc ne régresse ni en conformité, ni en diversité, ni en durée —
  seuils hérités du §7.3, génération sous 110 ms et vingt signatures sur trente ;
- [x] les quatre symboles de gamme manquants dans G1 sont tracés et raccordés
  par M4c ;
- [ ] G2 : `double_washbasin` est porté par une gamme de lavabo instruite et
  non par le seul fait que son dessin existe.

### 8.8 — Ce qui ferait échouer ce chantier

- **Le seuil décrété.** Les `from` sont des conventions N3, adossées à rien. On
  remplacerait une cote décrétée par un seuil décrété — le défaut même que le
  projet combat, déplacé d'un cran. La table B de `DATASOURCE` §6, non
  renseignée à ce jour, est ce qui les fonderait. À défaut, les assumer et le
  dire, jamais les présenter comme mesurés.
- **La gamme qui décide à la place de l'utilisateur.** Un lit de 1,80 dans une
  chambre de 16 m² est proposé sans que rien ne dise qu'il est voulu. Tant que le
  questionnaire n'expose pas le choix, `from` est une valeur par défaut qui se
  comporte comme une règle.
- **L'abaissement subi.** Un plancher qui descend sans décision explicite fait
  passer des pièces jusque-là refusées, et le banc ne le dira qu'en fin de
  chantier, quand la cause sera noyée dans dix autres changements.

## 5 nonies. Chantier 9 — La surface comme conséquence

**Ouvert le 26 août 2026. Prioritaire — il passe devant les lots restants des
chantiers 7 et 8.**

Ce chantier ne vient pas d'une intention d'extension, mais d'une confrontation.
Une doctrine détaillée du WC séparé — programme, enveloppes, dégagements,
topologie, formes admises — a été confrontée au moteur pour décider si elle
méritait d'entrer dans `SUIVI_REGLES_PIECES.md`. La confrontation a montré que
l'écart n'était pas dans la fiche de la pièce : il est dans l'ordre dans lequel
le moteur décide. Corriger le WC seul aurait déplacé le défaut sur la pièce
suivante.

### 9.0 — Pourquoi il passe devant

Le chantier 7 multiplie les types de pièces, le chantier 8 les tailles
d'équipements. Les deux amplifient ce que fait l'allocation de surface. Tant
qu'elle attribue le résidu du plan au prorata de poids, chaque type ajouté
hérite du défaut, et chaque gamme ajoutée se règle sur des surfaces qui ne
veulent rien dire. L'ordre est donc : réparer l'orchestration, puis étendre.

Le lot G1 du chantier 8 étant livré et neutre à l'empreinte, il n'est pas
repris ici. Les lots G2 et suivants, ainsi que le lot pilote L1 du chantier 7,
attendent la fin du lot O2.

### 9.1 — Le constat, mesuré

Mesures prises le 26 août 2026 sur `main`, forme rectangle, `includeWc`,
graines fixes. **Elles ont été obtenues par instrumentation temporaire : le lot
O0 les rejoue depuis un script versionné, et c'est ce script qui fera foi.**

**Le WC est la variable d'ajustement du plan.** Trente tirages par
configuration. ⚠️ **Ce tableau est le relevé du matin du 26 août ; il a été
périmé le soir même par des correctifs apportés au moteur dans la journée. Il
est conservé parce qu'il a motivé le lot — les chiffres qui font foi sont ceux
du rejeu O0, en fin de section.**

| Logement | Surface programmée | Surface réalisée (moy. / max) | Non rectangulaires |
|---|---:|---:|---:|
| 45 m² | 1,50 m² | 2,85 / 3,11 | 27/30 |
| 90 m² | 2,28 m² | 3,88 / 7,37 | 18/30 |
| 250 m² | 7,31 m² | 7,47 / **14,86** | 23/30 |

Le pire tirage produit un WC de 14,86 m² en L, dont le rectangle utile mesure
1,00 × 8,31 m — un couloir étiqueté WC. Le défaut a deux étages : la
répartition par agrément n'a aucun plafond (`maxRatio: null`), puis la découpe
verse encore au WC le résidu géométrique.

**Le budget de génération est presque intact.** 28,7 ms par plan sur 100 plans
(4 surfaces × 25 tirages), pour un plafond de 110 ms fixé au §7.3. **74 % de la
marge n'est pas utilisée.**

**Il n'y a presque plus de recherche.** En instrumentant `scoreCandidate()` :
**1 à 5 candidats scorés par plan** — 5 à 90 m², 1 à 250 m². Le squelette pose
une fois et rend la main, ce que le code dit déjà de la typologie : « elle ne
cherche plus — elle pose une seule fois » (`generator.js`). La fonction de
score existe, mais elle n'a presque rien à départager.

**Le solveur d'équipements est bon marché en validation, ruineux en
optimisation :**

| Pièce | `validate()` | `optimize()` |
|---|---:|---:|
| WC | 0,08 ms | 1,1 ms |
| Salle d'eau | 0,10 ms | 3,2 ms |
| Chambre | 0,10 ms | 3,6 ms |
| Cuisine | 0,75 ms | 29,1 ms |
| Séjour | 0,30 ms | 88,1 ms |

Valider le mobilier d'un plan entier coûte donc **environ 1,5 ms**. C'est le
chiffre qui rend ce chantier finançable : le solveur peut entrer dans la boucle
de recherche en validation. En optimisation, jamais — il reste en fin de
chaîne.

**Conclusion.** Le moteur n'est pas trop lent pour bien faire. Il décide de la
surface avant de savoir si elle sert à quelque chose, et ne se donne pas les
moyens de comparer deux réponses.

**Rejeu O0 après M0, le 26 août 2026.** Le script versionné
`scripts/measure-o0.mjs` et sa référence
`scripts/references/O0_REFERENCE.json` remplacent
désormais l'instrumentation temporaire comme témoin courant. Sur trente graines
fixes, le WC mesure 2,33 m² en moyenne à 45 m², 2,87 m² à 90 m² et 6,35 m² à
250 m² ; les maxima sont 2,33, 3,68 et 8,96 m². Les décrochements subis du WC
tombent à zéro depuis que le squelette ne reçoit plus un second façonnage
correctif, mais le pire WC reste un rectangle utile de 1,00 × 9,48 m. Le
symptôme a diminué, pas la cause : O1 reste requis. Les chiffres précédents,
dont 14,86 m², restent ci-dessus comme état historique qui a motivé le lot.

**Rejeu O1, le 27 août 2026.** Le WC est programmé à 1,50 m² sur les trois
configurations (1,498 m² dans le cas comprimé de 45 m²). Les surfaces utiles
moyennes deviennent 2,33, 3,25 et 3,26 m² ; les maxima 2,33, 3,48 et 3,37 m².
Le pire rectangle à 250 m² mesure 1,00 × 3,64 m, toujours sans WC en L. Le
plafond doctrinal `VAL-WC-PROGRAM-AREA-MAX-RATIO-001` vaut 3,5 fois le besoin
meublable, soit 3,64 m², avec 0,05 m² de tolérance constructive. Le banc de
360 plans conserve 8 plans HARD historiques, zéro dette, zéro adjacence
manquante, zéro échec de meublabilité et 0,004 m² d'écart maximal. O1 est livré.

### 9.2 — Ce qui n'est pas en cause

Trois briques sont bonnes, coûteuses à refaire, et sortent indemnes du
diagnostic. Les nommer évite qu'un chantier d'orchestration devienne une
réécriture.

- **Le solveur d'équipements** (`assets/placement.js`) : retour arrière sur
  grille de 10 cm, quatre orientations, familles de stratégie, relations
  `HARD`/`GUIDELINE`, budget de nœuds. Il traite **déjà** le chevauchement des
  zones d'usage — deux zones ne se gênent que si l'une est déclarée
  `exclusive`. C'est la propriété que la doctrine du WC réclamait comme
  « importante pour le moteur » : elle est acquise.
- **Le compilateur d'enveloppes** : `envelope()` produit le front de Pareto des
  rectangles meublables, compilé dans `fit.data.js`. Ce sont déjà les deux
  premières étapes de l'ordre visé — objets, puis enveloppes d'utilisation.
- **Le moteur de règles et le banc rejouable** (D4).

Ce qui est faible, c'est l'**orchestration** : l'allocation de surface et la
boucle de recherche. Une réécriture jetterait le bon pour reconstruire le
faible.

### 9.3 — Les cinq changements

**C1 — La surface devient une conséquence.** Aujourd'hui
`targetArea = minArea + distributable × (weight / totalWeight)`, puis le
résidu entier versé à la pièce la plus lourde. C'est ce qui programme 7,3 m² de
WC dans une maison de 250 m². Cible : chaque type porte une enveloppe cible —
plancher fonctionnel, cible, plafond — le surplus ne se répartit qu'entre les
pièces dont l'agrément est réel, et une pièce à agrément nul est servie puis
fermée. Les champs existent (`agrement`, `maxRatio`) ; l'allocation ne les
consulte pas.

**C2 — Le mobilier entre dans la fonction objectif.** `scoreCandidate()`
consulte `roomFits()`, c'est-à-dire le cache de Pareto : rectangle seul, sans
relations, verdict binaire à 95 points. Cible : `placement.validate()` sur les
k meilleurs candidats, et une peine graduée sur la qualité d'usage obtenue
plutôt qu'un binaire. Obstacle non évident : la boucle devrait lire le socle,
or `socle.data.js` est délibérément différé et seul `fit.data.js` est chargé au
premier octet (`CLAUDE.md` §1 et §2). Il faut donc **compiler les programmes
d'équipements dans `fit.data.js`**, pas seulement les enveloppes — extension du
compilateur existant, pas rupture.

**C3 — Le solveur accepte des polygones — livré par M4b.** Le retour arrière change peu :
`inside()` et `overlaps()` opèrent sur une union de rectangles au lieu d'un
rectangle. Ce qui casse, c'est le cache : `envelope()` rend des paires (w, h) et
`fits(type, w, h)` interroge par dimensions, or une pièce en L n'a pas deux
dimensions. Il faut ré-indexer sur d'autres grandeurs, ou renoncer au cache
hors rectangle et payer le solveur. C'est le seul chemin vers la levée de la
limite ouverte de D2. M4b a retenu la seconde option : abandon explicite de
l'autorité du cache hors rectangle et résolution sur `usablePolygon`.

**C4 — La porte devient un objet.** Aujourd'hui `debattement: null`, et le WC
reçoit une porte coulissante par décret. Cible : la porte est un équipement,
son débattement une zone d'usage `exclusive` — exactement ce que le solveur
sait déjà représenter, comme le local technique. La hiérarchie ouvrant vers
l'extérieur, puis coulissant, puis ouvrant vers l'intérieur devient un
résultat, non une décision arbitraire.

**C5 — Adjacences typées et scoring topologique.** Déjà réclamé par le §7.2 du
chantier 7 — cellier ↔ cuisine, garage ↔ sas, WC ↔ repas (`REF-008`). Ce
chantier livre le **mécanisme** ; le chantier 7 en reste l'utilisateur. Deux
contraintes de forme : les préférences s'écrivent en **peines d'absence**,
jamais en primes, faute de quoi la sortie anticipée à score nul disparaît ; et
une préférence qui vise un objet non encore posé — la tête de lit, la zone
repas — est inatteignable, puisque `scoreCandidate()` s'exécute avant
`placement.js`. Elle se réduit à une relation entre pièces, ou elle attend.

| Changement | Valeur | Coût | Risque principal |
|---|---|---|---|
| C1 — surface conséquence | très élevée | faible en code, élevé en re-calibration | tous les plans changent |
| C2 — mobilier dans l'objectif | élevée | moyen | perf, maîtrisée : ~12 ms mesurés |
| C4 — porte objet | élevée | moyen | limité, réutilise `exclusive` |
| C5 — adjacences typées | moyenne | faible une fois C1 et C4 faits | nul |
| C3 — polygones | élevée | **élevé** | invalide le cache de faisabilité |

### 9.4 — Le lot zéro, non négociable

Le banc mesure conformité, diversité, meublabilité et durée. **Il ne mesure pas
la qualité d'usage.** Changer l'objectif du moteur sans changer l'instrument
rend le chantier non falsifiable : on saura que le plan est différent, pas
qu'il est meilleur. C1 modifie toutes les surfaces ; l'empreinte du banc dira
qu'elle a bougé, et rien d'autre.

`scripts/test-instrument.mjs` est la bonne base : il compare déjà les plans
générés à un plan de référence dessiné à la main et porte l'écart de 15,05
points comme limite consignée. Le lot zéro l'étend et **verse au dépôt le
script qui a produit les mesures du §9.1**, faute de quoi elles ne valent rien
— c'est la règle posée par D4 et elle vaut pour ce chantier comme pour les
autres.

### 9.5 — Lots

| Lot | Contenu | Dépend de | Livre |
|---|---|---|---|
| **O0** | Instrument de qualité d'usage, script de mesure versionné | — | la possibilité de juger les lots suivants |
| **O1** | C1 — allocation par enveloppe cible et plafond | O0 | la surface comme conséquence du programme |
| **O2** | C2 — validation du mobilier dans la boucle, programmes compilés dans `fit.data.js` | O1 | un objectif qui parle d'usage |
| **O3** | C4 — la porte et son débattement comme objets | O2 | la fin des décrets d'ouverture |
| **O4** | C5 — adjacences typées | O3 | le mécanisme attendu par le §7.2 |
| **O5** | C3 — polygones dans le solveur | O4, et **conditionnel** | la levée de la limite ouverte de D2 |

**Le lot O5 est conditionnel, et c'est délibéré.** Une part des formes en L
subies vient des cessions de bande consenties à des pièces qui n'en tirent
aucun agrément. Refuser la cession aux pièces à agrément nul est un filtre
d'une ligne, inclus dans le lot O1. La condition posée était de mesurer ce qu'il
reste de pièces non rectangulaires **avant** d'engager le seul lot coûteux du
chantier.

**Cette mesure existe depuis M0, et elle maintient le lot.** Deux résultats
distincts, à ne pas confondre :

- **les WC en L ont disparu** — 0 sur 30 aux trois configurations du témoin O0,
  contre 18 à 27 sur 30 avant les correctifs du 26 août après-midi ;
- **les pièces en L subsistent dans le plan général** — colonne « L formes » du
  banc M0 : nulle entre 40 et 60 m², **jusqu'à 100 % des pièces à 35 m²** selon
  la graine, 57 % à 70 m², puis 9 à 20 % au-delà de 65 m².

Le besoin qui fondait O5 tenait donc toujours : une part réelle des plans
comportait des pièces polygonales. **M4b l'a fermé le 29 août** en faisant du
polygone utile l'autorité du verdict ; la pièce la plus pénalisée — le WC —
n'est plus concernée.

**Mesure après O1, le 27 août.** Le banc compte 188 pièces non rectangulaires,
contre 127 au témoin M0. Le WC reste rectangulaire dans les 90 rejeux O0 ; la
hausse vient du transfert de son excédent géométrique vers une pièce voisine à
agrément positif lorsque la profondeur commune d'une poche dépasse son
plafond. La surface utile n'est donc plus perdue dans le WC, mais le receveur
peut devenir un L. O1 atteint son objet ; cette mesure confirme que M4b ne doit
pas être réduit à un simple cas marginal.

*Ordre d'exécution : il est fixé par la vNext du §6, non par ce tableau. O0
rejoint M0, O1 à O3 forment M2, O4 est tenu par M3, O5 devient M4b. Les lots
ci-dessus restent la décomposition technique du problème ; ils ne prescrivent
plus le calendrier.*

### 9.6 — Tests exigés

Les quatre preuves du §7.3 s'appliquent, avec deux différences qui tiennent à
la nature du chantier.

1. **L'empreinte du banc va bouger, et ce n'est pas une régression.** Elle
   cesse donc d'être le juge à partir du lot O1 ; elle redevient un contrôle
   de non-régression **à l'intérieur** de chaque lot, une fois la nouvelle
   référence prise et datée.
2. **L'instrument du lot O0 devient le juge.** Un lot qui dégrade l'écart au
   plan de référence est refusé, quelle que soit sa valeur théorique.
3. `npm run fit:build` régénéré à chaque lot qui touche au compilateur — 9.2 et
   9.5.
4. Budget tenu : génération sous 110 ms, vingt signatures distinctes sur trente
   tirages. La marge mesurée est de 81 ms ; le lot O2 en consomme environ 12.

### 9.7 — Définition de terminé

- l'instrument du §9.4 est versé au dépôt et rejoue les mesures du §9.1 ;
- aucune pièce à agrément nul ne reçoit de surface au-delà de son plafond, et
  le plafond de chaque type est **justifié**, non décrété. Justifié n'est pas
  synonyme de mesuré : un plafond doctrinal est recevable s'il porte
  identifiant de valeur, statut `N3` et portée, comme l'exige le §6.6. Ce qui
  est proscrit, c'est le nombre muet sur son origine ;
- la validation du mobilier participe au classement des candidats, et son coût
  est mesuré, pas estimé ;
- la porte est posée par le solveur, avec son débattement, sans décret par type
  de pièce ;
- une adjacence peut être déclarée interdite, souhaitable ou déconseillée, et
  le chantier 7 peut s'en servir sans nouveau mécanisme ;
- l'écart au plan de référence a diminué, et on sait de combien.

### 9.8 — Ce qui ferait échouer ce chantier

- **Re-calibrer sans instrument.** Prendre la nouvelle empreinte du banc pour
  une amélioration parce qu'elle est nouvelle. C'est le risque principal, et le
  lot O0 n'existe que pour lui.
- **Le plafond pris au 90e centile mesuré.** La méthode a fait ses preuves pour
  la circulation, où le comportement observé était sain. Ici, elle
  entérinerait le défaut : le 90e centile actuel du WC avoisine 10 m². Le
  plafond du WC est doctrinal, il doit être assumé comme tel.
- **Les primes dans le score.** Un barème à bonus supprime la condition d'arrêt
  à score nul et transforme la recherche en optimisation sans sortie.
- **Le socle lu depuis la boucle.** Il casserait le chargement paresseux, qui
  n'est pas une préférence mais un principe non négociable du §2.
- **C3 pris trop tôt.** C'est le seul lot qui invalide un mécanisme central. Le
  prendre avant d'avoir mesuré ce qui reste de formes subies après le lot O1,
  c'est payer cher pour un besoin qu'on n'a pas chiffré.

## 6. Roadmap vNext — trois flux et des portes de convergence

Cette section est la vue de pilotage. Les chantiers 1 à 9 restent les dossiers
d'instruction et l'historique des décisions ; ils ne dictent plus seuls
l'ordre d'exécution. La vNext se juge à des **portes de preuve** communes aux
flux, pas au nombre de fonctionnalités ajoutées. La doctrine globale vit dans
[`DOCTRINE.md`](DOCTRINE.md).

### 6.0 — Trois leviers d’agrément (tranchés le 27 août 2026)

Diagnostiqués dans l’audit fonctionnel et dans les audits circulation /
score (§6.1 bis, `DOCTRINE_CIRCULATION.md` §8.7). **Érigés ici en décisions
de pilotage**, pas en intentions. Détail doctrinal :
[`DOCTRINE.md`](DOCTRINE.md) §2 bis.

| Levier | État avant ce point | Décision | Lot porteur | Preuve de terminé |
|---|---|---|---|---|
| **L1 — stratégie × pression** | Envisagé (F4–F6), seuils non tranchés | Le moteur **change de stratégie** selon `SPACE_PRESSURE`. Seuils N3 provisoires, calibrés en F4 sur banc — pas décrétés hors mesure. `ROOM_FIRST` reste le défaut tant que F4 n’est pas livré. | **F4** (bascule) · **F6** (branche critique) | Sur un même programme, 18 m² et 80 m² n’empruntent pas le même chemin de pose ; l’empreinte banc des T3–T4 `ROOM_FIRST` ne régresse pas |
| **L2 — score honnête** | Diagnostiqué (« allonger est toujours rentable »), hérité de M2 **sans lot nommé** alors que M2 est clos | **Prérequis explicite de M3.** Pénaliser la longueur de circulation *rapportée au besoin de desserte* ; une adjacence manquée ne doit plus être rachetée à bon marché par un couloir plus long. Pas de barème à primes. | **M3.0** (ci-dessous) puis raffiné en **M5** | Sur le banc de référence circulation : pire longueur et part de circulation publiées ; famille `T` retenue plus souvent sur grands programmes *sans* l’imposer ; `scoreCandidate` documenté critère par critère |
| **L3 — preuve externe** | Planifié (M6, porte E, chantier 6) mais pas posé comme condition d’« agréable » | **Aucune prétention d’agrément** avant porte E. La corrélation `correlation-avis` = test d’instrument, **pas** substitut à la discrimination à l’aveugle. Licence corpus atelier/étalon tranchée **avant** la première mesure qui compte pour E. | **M6** + chantier 6 §6.2 | Porte E ouverte : confusion mesurée, préférences par paires, règles rejouées sur plans humains |

**Conséquence d’ordre :** porte A → **M3.0 (L2)** → M3 topologies → S4 / M4 → F4 (L1) → M5 → **M5.4** → **I1** → M6 (L3). On ne met pas en concurrence des topologies avec un barème qui préfère encore le couloir-tuyau ; on ne bascule pas la pression spatiale avant d’avoir un score qui distingue le laid du tenable ; on ne fige pas le protocole externe avant l'audit amont et la décision d'intégration des pièces ; on ne dit pas « agréable » sans aveugle.

#### M3.0 — Barème de circulation (levier L2)

Lot intercalaire, **avant** les stratégies interchangeables de M3.

| | |
|---|---|
| **Objet** | Recaler `scoreCandidate()` pour que la longueur de desserte (ou son proxy publié au plan) soit pénalisée relativement au besoin ; recalibrer ou suspendre `TH2D-CIRC-004` selon `DOCTRINE_CIRCULATION.md` §8.7 ; publier la part de circulation au banc |
| **Dépend de** | Porte A rouverte ; calque / longueur de parcours exploitable (suite §9–§10 de la doctrine circulation — pas 1 au minimum) |
| **Livre** | Un barème où allonger n’est plus toujours rentable ; chiffres datés de part de circulation |
| **Ne livre pas** | Les topologies T/L/hall (c’est M3) ; la discrimination humaine (c’est M6) |

*M2 avait « hérité » de ce recalibrage (§6.1) sans le livrer. M3.0 le sort de l’implicite.*

### 6.1 — Flux M : refonte du moteur

| Lot | Objet | Livre | Dépend de |
|---|---|---|---|
| **M0 — témoin fiable** | corriger les tests rouges, unifier la commande de validation, figer le banc et la photographie de l'état | une base qui permet d'attribuer une régression | — |
| **M1 — contrats** | séparer `Intent`, `Program`, `TopologyCandidate`, `BuiltPlan`, `Verdict` et `GenerationResult` ; définir `VALID`, `IMPOSSIBLE`, `NON_TROUVE`, `INVALIDE_DEBUG` | des étapes testables et des échecs honnêtes | M0 |
| **M2 — orchestration** | chantier 9 O0 à O3 : instrument, allocation, mobilier dans la boucle, porte comme objet ; phase 11 a : coût d'agencement dans le classement, et le mécanisme de **passage libre entre deux équipements qui se font face** ; **`S3`** du socle : le débattement n'empiète sur aucune emprise ni zone d'usage requise | un candidat jugé après ses contraintes d'usage | M1 |
| **M3.0 — barème (levier L2)** | pénalité de longueur de desserte ; recalibrage / suspension de `TH2D-CIRC-004` ; part de circulation publiée | un score qui n’aime plus le couloir-tuyau | porte A, amorçage doctrine circulation §10.5 |
| **M3 — topologies** | stratégies interchangeables : barre, L, T, hall, distribution jour/nuit ; graphe obligatoire tenu par construction ; chantier 9 O4 : adjacences typées — obligatoire, interdite, souhaitable, déconseillée, réclamées par le §7.2 | plusieurs organisations valides sans heuristique monolithique | **M3.0**, profils pilotes C4 |
| **M4 — plan construit** | faire coopérer dimensions, murs, ouvertures, mobilier et parcours avant la sélection ; **`S4`** du socle : chemin continu de la porte à chaque zone d'usage requise — c'est le nom de ce « parcours » | aucune invalidation tardive du candidat retenu | M2, M3 |
| **M4a — invariance et ancrage des circulations** | corriger le biais de repère des squelettes M3 ; produire les rotations / réflexions canoniques sans fabriquer de fausse diversité ; distinguer façade d'entrée et terminaison de couloir ; proposer des terminaisons intérieures vers hall, pièce distributrice ou dégagement | une famille barre/L/T réellement équivariante et des façades rendues aux pièces quand la circulation n'a pas de raison fonctionnelle d'y aboutir | M3, M4 ; audit §6.1 quinquies |
| **M4b — géométrie non rectangulaire** | chantier 9 O5 : polygones dans le solveur d'équipements, ré-indexation ou abandon du cache hors rectangle | une pièce en L jugée sur toute son emprise, et non sur sa seule partie principale | M4, **et la mesure du §9.5** |
| **M4c — programme canonique résolu, portée limitée** | faire participer gammes et équipements optionnels au verdict final, sans élargir le coût de recherche à toutes les topologies ; première portée : **séjour et chambre C4** | le `BuiltPlan` porte le programme demandé, le repli effectivement résolu et les vraies emprises ; l'interface rend ce manifeste sans redésigner le mobilier | M4, M4b, C-P1.2a–b |
| **M5.0 — utilité topologique des circulations** | préambule M5 : mesurer chaque bras par les portes qu'il dessert et son reliquat après la dernière porte ; ajouter un vrai L intérieur ; préserver une famille avant le classement d'usage, sans quota ni prime de forme | aucun bras vide sur le banc M5, L/barre émergents et coût canonique décomposé dans le plan | M4a, M4b ; audit §6.1 sexies |
| **M5 — classement et comparaison (affine L2)** | filtrer `HARD`, préserver la diversité, décomposer les préférences, conserver trois variantes comparables ; intégrer peines de confort (`target` / `comfort`) sans primes | une décision utile plutôt qu'un plan unique | M4a, M4b, M3.0 |
| **M5.1 — comparaison dans le produit** | rendre les trois propositions réellement consultables sans perdre leur graine, leur verdict ni leurs compromis | navigation entre trois rangs, états `COMPLETE` / `PARTIAL` / `EMPTY`, export et évaluation rattachés au plan actif | M5 |
| **M5.2 — résolution graduée du programme** | après trois `NON_TROUVE` rejouables sur la demande exacte, essayer des programmes explicitement dégradés : fusion des séparations, réduction des salles d'eau supplémentaires, retrait d'une fonction relaxable, puis d'une chambre en dernier recours | **livré** : politique, contrats, orchestration, sélection réemployée, consentement et mesure versionnée | M1, M5, C-P2 ; F1 pour les fonctions optionnelles R3 |
| **M5.3 — instrument d'audit atelier, prototype gelé** | conserver le prototype de grille et d'archive sans le présenter comme une capacité acceptée | code et tests conservés ; aucun travail supplémentaire tant que l'ergonomie et l'utilité ne sont pas réinstruites | M5.1, M5.2 |
| **M5.4 — audit amont piloté et refonte de la roadmap** | examiner des plans réels avant de décider la suite : réussites, qualités inabouties, défauts, coûts, icônes et lacunes du modèle | dossier de constats rejouables, bilan `catalogue → symbole → page → rendu → plan`, conséquences métier, lots fermés ou rouverts, ordre et critères de sortie réécrits | M5.1, M5.2 ; profils et témoins courants ; **ne dépend pas de M5.3** |
| **I1 — intégration produit des autres pièces prévues** | faire converger les profils C-P3 à C-P6, les capacités F et les lots L sans ajouter de branche spéciale par pièce | pour chaque pièce retenue : demande → programme → topologie → plan construit → équipements et icônes → verdict → interface et export | périmètre décidé par M5.4 ; profil C4 ; capacité F/L requise ; témoin vert |
| **M6 — validation externe (levier L3)** | corpus atelier/étalon, distributions, discrimination à l'aveugle, préférence par paires | une mesure de crédibilité extérieure au moteur — **seule** base pour parler d’agrément | **M5.4 clos et décision I1 exécutée ou différée explicitement**, premiers profils C5, licence corpus |

**Statut au 3 septembre 2026 : M0 à M5.2, avec M4c limité, sont livrés ; M5.3
est gelé et M5.4 devient le prochain jalon.** La commande
`node scripts/validate-m0.mjs` exécute la suite ciblée, valide un export
contre `PLAN_SCHEMA.json`, rejoue l'instrument O0 et compare les 360 plans du
banc fixe à leur photographie. La porte B est ouverte. L'orchestration sert
désormais les planchers, ferme les pièces à agrément nul, redistribue le
reliquat utile et fait respecter leur plafond aux poseurs comme au verdict.
O2 compile en outre les programmes minimaux dans `fit.data.js` et fait classer
les deux meilleurs candidats par `placement.validate()` avec une peine graduée.
O3 pose chaque porte comme un équipement et résout ouverture extérieure,
coulissement puis ouverture intérieure ; son débattement exclusif alimente la
règle HARD `TH2D-DOOR-004` (`S3`). Le passage de 1,20 m entre linéaires opposés
est une contrainte générique du solveur. Sur trente T4 de 90 m² : 30
signatures ; `scripts/test-m2-performance.mjs` publie moyenne, p90 et maximum.
Le budget actif de 300 ms inclut depuis M4c la résolution finale des gammes du
séjour et de la chambre. L'instrument passe de 15,05 à 4,18 points d'écart résiduel.
M3 met en concurrence barre, L, T, hall et jour/nuit au même contrat ; une
circulation unique porte désormais ses branches, et les relations O4 ont une
nature, un degré et un contact requis. Sur le banc fixe M3 de 48 plans, aucune
adjacence obligatoire ne manque, aucun plan n'est HARD et la famille T gagne
13 fois sur les grands programmes sans prime de stratégie. Lorsqu'une
matérialisation rend une pièce non meublable, l'orchestrateur essaie le second
candidat puis une autre répartition au lieu de publier l'échec ; le banc
historique passe ainsi de 34 à 30 plans HARD, sans manque d'adjacence.

**M4 ferme l'intégration restée incomplète après cet audit.** Les poses
retenues, leurs zones d'usage et la preuve `S4` voyagent désormais dans le
`BuiltPlan` et dans `PLAN_SCHEMA.json` ; l'interface les consomme sans relancer
le solveur. Le parcours global n'est plus calculé sur le logement vide puis
remplacé à l'affichage : il est calculé une seule fois, avec les emprises, avant
publication (`avecMobilier: true`). Toutes les portes d'une pièce et chaque
zone d'usage requise doivent appartenir au même composant praticable de 0,60 m,
maillé à 5 cm ; une disposition qui échoue est refusée avant de devenir le
candidat du plan, et `TH2D-PATH-004` porte le même verdict en `HARD`.

Le rejeu de sortie du 29 août mesure, sur 46 pièces meublées : **0/59 seuil
muet, 0/34 fenêtre masquée, 0/138 zone d'usage séparée et 0 pièce à baies de
porte séparées**. Le banc constructif reste à 0 HARD sur 48 plans ; le banc
performance tient 62,3 ms de moyenne sur son rejeu de porte. Les îlots de sol
secondaires (26,1 % sur ce petit échantillon) et les fenêtres coupées du
composant principal (11,8 %) restent mesurés mais ne sont pas `S4` : ils
rejoignent l'instruction polygonale et le classement de M4b/M5.

**Dette rendue visible, non classée : 34 plans sur 360 sont invalidés après
construction par `TH2D-ROOM-002`.** Ils se concentrent sur les programmes les
plus comprimés ; le cas 45 m², chambre parentale, cuisine et WC séparés échoue
15 fois sur 15. Le cache ancien les disait meublables parce qu'il choisissait
la variante la plus facile et ignorait la perte utile des cloisons. M2 ne crée
pas ces impossibilités : il cesse de les masquer. Les faire participer avant
la sélection du plan construit est précisément l'objet de M4 ; la
photographie M2 les conserve pour interdire qu'elles redeviennent silencieuses.

**Statut au 26 août 2026 : M1 livré.** Les six frontières sont versionnées
dans `GENERATION_CONTRACTS.json`, implémentées par `assets/contracts.js` et
décrites dans `CONTRATS_MOTEUR.md`. `generateResult()` porte les quatre statuts
et l'interface le consomme ; `generatePlan()` reste l'adaptateur compatible des
scripts historiques. Les poseurs n'ont pas été remplacés. Chaque plan M1 porte
la version et la maturité de ses profils ; les deux pilotes sont C4, les autres
restent C2.

**Trois audits, deux lots concernés.** Les audits des 26 et 27 août sont
consignés au **§6.1 bis** ; ils ne sont pas repris ici pour n'avoir qu'une
écriture. Ce qu'ils versent directement à cette table :

- **M2** hérite du recalibrage de la circulation — pénaliser la longueur
  rapportée au besoin de desserte plutôt que la surface, et rejouer la mesure
  du §5 bis sur la découpe actuelle ; le seuil `k = 1,6` a été calibré le
  19 août sur une découpe qui n'existe plus. **Ce recalibrage n’a pas été
  livré dans M2** : il est sorti de l’implicite et nommé **M3.0** (levier L2,
  §6.0) ;
- **M3** hérite de la ramification — la famille `T` existe et n'est retenue
  qu'une fois sur quinze à 180 et 250 m². Rendre les stratégies réellement
  interchangeables suppose que la barre cesse d'être toujours gagnante, ce qui
  dépend du point précédent (**M3.0**, pas un vœu pieux dans M3).

**Cinq points remontés de la phase 11.** « Agencement : du gabarit au meuble
posé » vit désormais dans l'annexe A, avec le reste de l'ancien découpage. Cinq
de ses cases non cochées ne sont pas de l'historique : elles décrivent le même
travail que la vNext désigne par les mots « mobilier », « zones d'usage » et
« parcours », mais elles le nomment — coût d'agencement, gabarit WC, passage
entre linéaires opposés, `S3`, `S4`. Elles sont rattachées ci-dessus à M2, M4,
C-P0 et C-P1 pour qu'aucune ne dépende d'une relecture de l'annexe.

`S3` et `S4` méritaient d'être signalées à part : le socle les déclare
**bloquantes** (`SOCLE_AGENCEMENT.md` §311). **`S3` est fermée depuis O3** —
le débattement est un équipement à zone exclusive, `TH2D-DOOR-004` le remonte
en `HARD`. **Au 28 août, `S4` ne l'était pas** : aucun verdict construit ne
garantissait encore qu'un chemin continu relie la porte d'une pièce à chacune
de ses zones d'usage requises. Cet écart, désigné par les trois audits du
§6.1 bis, est **fermé par M4 le 29 août** : le solveur refuse la disposition,
le BuiltPlan conserve la preuve et `TH2D-PATH-004` la remonte en `HARD`.

**M4b était conditionnel, et adossé à M4 plutôt que reporté en fin de vNext.**
La porte C exige que le mobilier ait participé au verdict ; le risque était de
servir une pièce en L par sa seule partie principale. Le lot est fermé le
29 août : `placement.validate()` reçoit le polygone utile et ses faces, puis
recontrôle chaque emprise et chaque zone d'usage contre le contour entier. Le
test d'inclusion refuse aussi une encoche qui traverse un rectangle sans en
prendre les coins ni le centre. `fit.data.js` publie désormais sa portée
`rectangle-only` ; hors rectangle il présélectionne, mais ne porte jamais le
verdict `TH2D-ROOM-002`. `test-m4b-polygon-placement.mjs` couvre rectangle, L
et encoche de U, y compris l'exploitation du retour absent de l'ancien
`usableRect`.

**M4c limité est livré le 1er septembre.** Le cache minimal de M2 reste
inchangé et continue de filtrer les topologies à coût borné. Une seconde vue
compilée du socle résout seulement, au verdict final, les gammes et optionnels
du séjour et de la chambre : d'abord programme complet, puis tailles de base,
puis requis seuls. Le repli n'est jamais silencieux ; la pièce exporte
`equipmentProgram` avec demande, résolution, méthode et emprises nominales.
Le rendu consomme cette autorité du `BuiltPlan` et choisit `furn-{sizeId}`
lorsque le symbole existe, avec repli vers le symbole de famille puis le
rectangle générique. Le chantier d'icônes peut ainsi avancer en parallèle sans
modifier le contrat moteur. Les symboles livrés en parallèle (`sofa_3`,
`sofa_angle`, `bed_160`, `bed_180`, `armchair`, `towel_rail`) sont synchronisés
dans le sprite inline `file://` par `icons:inline`. Cuisine et autres pièces ne sont volontairement
pas enrôlées dans M4c : leur programme minimal reste l'autorité du plan tant
qu'un lot d'extension n'est pas instruit.

Le coût naïf — résoudre ce catalogue dans O2 pour chaque candidat — dépassait
1,3 s de moyenne et a été refusé. La portée finale bornée mesure **154,5 ms de
moyenne, 245,2 ms au p90 et 425,8 ms au maximum** sur le dernier rejeu actif de
trente T4 ; les 30 signatures restent distinctes. Le banc apparié
`measure-m4c-impact.mjs`, plus lent car isolé en contextes VM, compare le même
moteur avec et sans M4c sur 90/130/180 m² : **+180,2 ms de moyenne dans ce
harnais (+24,6 %), 48 optionnels posés, 39 gammes supérieures, 20 replis et
zéro topologie modifiée**. Les temps absolus des deux harnais ne se mélangent
pas ; le premier porte le budget produit, le second attribue le delta.

**Mesure rendue le 26 août, après M0 : le lot tient.** Les WC en L ont disparu
— 0 sur 30 au témoin O0 — mais les pièces en L subsistent dans le plan général,
jusqu'à 100 % à 35 m² selon la graine et 9 à 20 % au-delà de 65 m² (banc M0,
colonne « L formes »). Le volume du lot diminue, son objet demeure. Détail au
§9.5.

**Mesure de sortie M4b, 29 août.** `audit-m4b-polygons.mjs` trouve 37 pièces
polygonales sur 312 pièces publiées (**11,9 %**) dans 42 plans obtenus sur 48
tentatives. Onze portent un programme mobilier et sont toutes résolues sur le
polygone exact ; deux emploient effectivement le retour que l'ancien rectangle
principal ne couvrait pas. Le cache de boîte ne diverge pas sur ce petit banc,
mais le témoin synthétique prouve les deux sens d'erreur possibles et interdit
donc de conclure à son autorité à partir de cette seule absence observée.

*~~Repli de O1, si M1 s'allonge.~~ Question close : M1 est resté court et O1 a
été porté dans M2. Le prix qui avait été accepté en attendant — jusqu'à
8,96 m² de WC pour 5,39 programmés, et un pire rectangle utile de
1,00 × 9,48 m — n'est plus payé. Conservé pour mémoire de l'arbitrage.*

M1 ne constitue pas une réécriture générale. Les modules existants deviennent
des producteurs ou validateurs derrière les nouveaux contrats :
`squelette.js` et `typologie.js` proposent des topologies,
`construction.js` matérialise, `placement.js` prouve l'usage, `rules.js`
contrôle. `generator.js` cesse progressivement d'être l'endroit où toutes les
décisions se mélangent.

### 6.1 bis — Trois audits, un seul diagnostic (26 et 27 août 2026)

Trois audits ont été rendus en deux jours, sur trois objets qui n'avaient pas
été commandés ensemble : la circulation, la pose du mobilier, la chaîne des
équipements. Ils ne se citent pas. Ils décrivent pourtant le même défaut de
structure. Ce point les consigne en un seul endroit — ce que chacun vaut, ce
qu'ils établissent ensemble, ce qu'il en reste après M2 — pour qu'aucune
décision ne dépende de la relecture de trois documents séparés.

#### Les trois pièces au dossier

| # | Audit | Où | Méthode | Rejouable |
|---|---|---|---|---|
| **1** | Circulation | [`DOCTRINE_CIRCULATION.md`](DOCTRINE_CIRCULATION.md) §8 (26 août) et §9 (27 août) | §8 : banc de 15 plans. §9 : **lecture de code, sans banc** — l'audit le déclare lui-même au §9.7 | §8 en partie (`diagnostic-circulation.mjs`) ; §9 non |
| **2** | Pose du mobilier | §10 (27 août) | 48 plans, 269 pièces meublées, **ablation à processus unique** de `cornerScore` | oui — `npm run technohab:audit-circulation` |
| **3** | Chaîne d'équipements | rapport hors dépôt, 27 août 11 h 30 | lecture d'absence, sensibilité par mutation du socle, rejeu du chemin d'exécution réel sur 60 plans | non — à porter en script |

Le troisième n'est pas dans le dépôt : c'est une page publiée
(`claude.ai/code/artifact/e60ec70c-86eb-4b9b-bf89-8cd86106180b`). Sa substance
est reprise ici ; sa forme n'engage rien tant qu'elle n'est pas versionnée.

#### Le diagnostic commun

Les trois prennent une jonction différente de la même chaîne — catalogue →
programme → géométrie → pose → parcours → verdict — et trouvent la même chose :
**le moteur décide avec un substitut, et vérifie avec la réalité trop tard, ou
jamais.**

| Jonction | Ce qui décide | Ce qui saurait | Audit |
|---|---|---|---|
| catalogue → géométrie | un domaine de rectangles compilé hors ligne | le solveur d'équipements | 3 |
| géométrie → pose | un barème — `cornerScore`, 20 points sur 100 | la connexité du sol restant | 2 |
| pose → verdict | la topologie, `plan.edges` | le calque de cheminement, jeté à la sortie de `cheminement()` | 1 |

Ce ne sont pas trois listes de défauts, c'est une caractérisation convergente —
trois méthodes indépendantes, un seul mécanisme. C'est ce qui lui donne son
poids.

#### Les chiffres, datés

- **5,8 %** des pièces — 23 sur 390 — passent le contrôle rectangulaire du
  générateur puis se révèlent impossibles à meubler ; 52 plans sur 60 déclarés
  valides à la génération, 48 après passage du solveur réel *(audit 3, état à
  11 h 30)* ;
- **16,7 %** des pièces meublées ont un sol praticable en plusieurs îlots —
  24 % en salle d'eau ; **8,0 %** des fenêtres sont masquées par une emprise,
  et 31 % des séjours sont concernés *(audit 2)* ;
- couloir de **22,61 × 1,22 m à 250 m²**, `TH2D-CIRC-004` violée par 14 à 15
  plans sur 15, parce que le score paie une adjacence manquée 110 et un mètre
  carré de couloir 8 — **allonger est toujours rentable** *(audit 1, §8)*.

#### Ce que M2 a déjà fermé

Les deux P0 de l'audit 3 sont tombés dans les heures qui ont suivi sa
publication — il le signale lui-même comme « chantier concurrent ». Vérifié
dans l'arbre du 27 août au soir :

- `generator.js` appelle `placement.validate()` en trois points — score de
  candidat, test de faisabilité et `finaliserPlan()` — avec le contexte réel
  des portes issu de `roomContext()` et le `facingClearance` compilé ;
- `finaliserPlan()` pose `room.furnishable` et `room.usageValidation` : le
  verdict de meublabilité ne dépend plus d'abord de la bascule d'affichage et
  de `localStorage`.

La preuve de sensibilité de l'audit 3 — tripler les emprises de la chambre dans
`socle.data.js` laissait le plan identique au centième — n'est donc plus le
constat courant. **Elle reste la méthode à rejouer** : c'est elle, et non un
raisonnement, qui dira ce que le branchement a réellement changé.

#### Ce qui reste ouvert, et où c'est rattaché

*États revérifiés le 28 août au soir, après M3 — détail et mesures au
**§6.1 quater**.*

| Constat | Origine | Lot | État vérifié le 28 août |
|---|---|---|---|
| `roomContext()` ne réserve rien devant une fenêtre, rien du côté couloir, rien devant une coulissante | audit 2, §10.5 pas 1 | M2 | **fermé et rejoué par M4** — 0,60 m devant les fenêtres ; bande anti-emprise de 0,10 m devant les portes, dont coulissantes ; 0/34 fenêtre masquée au rejeu court |
| `S4` n'est évaluée nulle part ; `cornerScore` protège les ouvertures par accident | audits 1, 2 et 3 | M4, §10.5 pas 2 et 3 | **fermé et intégré par M4** — refus avant sélection, preuve dans le BuiltPlan, `TH2D-PATH-004` en `HARD` ; 0/138 zone séparée au rejeu court |
| face `foot` acceptée par `USAGE_FACES`, non traduite par `usageSets()` : la contrainte disparaît en silence | audit 3, P1 | **C-P1.2a** | **fermé le 31 août 2026** — traduction géométrique et test chambre C4 |
| variante `bain` jamais sélectionnée : aucun plan livré ne peut contenir de baignoire | audit 3, P1 | **C-P1** | ouvert |
| aucune cardinalité, `min: 1` écrit en dur : deux lits, deux vasques, n chaises inexprimables | audit 3, P1 | **M3** ou chantier 8 | ouvert |
| `services` agrégés puis jetés : aucun regroupement des points d'eau, aucun mur technique | audit 3, P2 | **M4** | ouvert — 0 lecture hors `room-model.js` |
| `target` et `comfort` déclarés, jamais lus : le confort n'est ni recherché ni mesuré | audit 3, P2 | **M5**, comme terme de score | **fermé par M5** — les poses retenues sont relues ; les manques `target` et `comfort` alimentent deux préférences N3 séparées dans `scoreBreakdown`, jamais un `HARD` |
| `trigger` déclaratif doublé par un `buildProgram()` impératif | audit 3, P2 | **chantier 7** | ouvert |
| trois écritures pour 1,20 / 1,80 ; deux pour les pièces à façade ; deux pour la séquence de cuisine | audit 3, P2 | **M3** | **partiel** — le plan porte `minCirculationWidth` / `maxCirculationWidth` et `rules.js` les lit en priorité ; `socle.clearWidth` reste mort |
| le calque de cheminement n'est ni rendu, ni au schéma, ni consulté par une règle | audit 1, §9.6 | **M3 / M4** | **partiel** — rendu et au schéma (`parcours.calque`, `grid-shortest-path-v1`) ; `TH2D-PATH-004` juge S4 dans chaque pièce, mais aucune règle ne juge encore la continuité du sol à l'échelle du logement ni sa fragmentation résiduelle |

#### Ce que les trois désignent ensemble

`S4`. L'audit 3 le relève comme non implémenté, l'audit 1 le déduit du code,
l'audit 2 le chiffre. Quand trois mesures faites pour d'autres raisons
désignent le même trou, c'est le meilleur signal de priorité que le projet
puisse produire — et c'est le dernier verrou de la porte C.

#### Trois corrections que ces audits interdisent

Leur apport le plus immédiat n'est pas ce qu'ils demandent de faire, c'est ce
qu'ils empêchent :

1. **supprimer `cornerScore`** — l'ablation montre que les fenêtres masquées
   doublent, de 16 à 30, et que les seuils sans sol praticable passent de 3 à 7.
   Il faut d'abord poser la règle qui protège les ouvertures exprès ;
2. **supprimer la pièce `circulation`** — `TH2D-CIRC-001` à `004` filtrent sur
   `room.type === 'circulation'` : sans pièce de ce type, elles rendent `[]`.
   Pas une violation, *rien* ;
3. **enrichir le catalogue** — neuf `target`, six `comfort`, seize `services`,
   treize `trigger` et six règles de placement attendent un lecteur. La donnée
   n'est pas ce qui manque à TechnoHab.

#### Réserves communes aux trois

- **Ce sont trois audits d'auto-cohérence.** Aucun ne dit si les cotes sont
  justes. La table B de `DATASOURCE_EQUIPEMENTS.md` §6 reste vide, les seuils
  `from` des gammes restent des conventions N3. Un moteur parfaitement cohérent
  avec des cotes décrétées est parfaitement cohérent et faux — c'est M6.
- **Aucun ne mesure à l'échelle du logement.** Débattements concurrents sur un
  couloir, colonnes humides, murs techniques : le trou est signalé par §8.6,
  §9.3, §10.6 et par le P2 `services`, et traité par aucun.
- **Un audit sans script périme en heures.** L'audit 3 a été dépassé le jour
  même de sa rédaction. La discipline du §8.8 vaut pour les trois : *tout
  constat opposable finit dans un script versionné avant d'être invoqué.* Deux
  des trois n'en ont pas.

#### Ordre retenu

*Avancement initial au 28 août au soir, complété par le verdict M4 du
29 août.*

1. **[x]** **rouvrir la porte A** — rouverte au témoin courant le 29 août,
   après M4 et republication des quatre photographies (§6.4) ;
2. **[x]** **§10.5 pas 1** — réserver les ouvertures dans le contour utile,
   coulissantes comprises : 0,10 m anti-emprise devant les portes et 0,60 m
   devant les fenêtres. Livré et rejoué par M4 ; 0/34 fenêtre masquée au banc
   court indépendant ;
3. **[ ]** **porter l'audit 3 en script** et le rejouer sur l'arbre courant,
   pour savoir ce qui reste de ses treize priorités après M2 ;
4. **[ ]** **les trois P1 de l'audit 3 en un lot** — `foot`, variante `bain`,
   cardinalité : trois fausses promesses du catalogue, chacune petite, chacune
   supprimant une chose que le moteur dit de lui-même sans la tenir ;
5. **[x]** **`S4`** — §10.5 pas 2 et 3, intégrés par M4 **à l'échelle de la
   pièce et du BuiltPlan** (`TH2D-PATH-004`, `HARD`) ; le parcours global est
   recalculé avec le mobilier. La fragmentation complète du sol, propriété
   plus forte, reste une mesure distincte ;
6. **[ ]** **le calque** (§9.6) — rendu et au schéma par M3, mais son étape 2
   — doubler `TH2D-GRAPH-002` d'une règle géométrique en `GUIDELINE` et
   mesurer l'écart — reste le préalable non négociable à tout chantier de
   remplacement.

### 6.1 ter — Audit d’émergence fonctionnelle (27 août 2026)

Audit doctrinal rendu le 27 août : confrontant l’état runtime (room-first,
fusions, studio prescrit) à une proposition d’architecture où **la fonction
d’usage** est l’invariant, et où pièces, zones et équipements multifonctions
en sont des résolutions. Livrable : [`DOCTRINE.md`](DOCTRINE.md). Canvas
d’accompagnement : audit doctrine fonctionnelle (session Cursor du même jour).

#### Verdict retenu

| Critère | Note | Conséquence roadmap |
|---|---|---|
| Faisabilité | Oui, **par couches** rétrocompatibles | flux F, pas rewrite M |
| Nécessité (&lt; 25 m² / studios) | Haute | F2–F6 débloquent sans cas spéciaux |
| Nécessité (T2–T5 classiques) | Moyenne | S4, M3, cardinalité restent prioritaires côté M |
| Difficulté | Élevée dès résolution multi-candidats | fit cache = une frontière **par** résolution |
| Risque | Bas en F0–F1 ; critique en F4–F6 | F4+ après porte A, S4, amorçage M3 |
| Bénéfice | Transformateur | organisation spatiale choisie, pas seulement découpe |

#### Ce qui était déjà décidé (ne pas réouvrir)

`DECISIONS_PROGRAMME.md` (26 août) a déjà posé : fonction = unité primaire ;
`HOST_FALLBACK` + `EMERGENCE` ; composition par fonction (décision 18) ;
existence ≥ 1 fois. Cuisine ouverte et WC intégré en sont les patrons
implémentés. Les arbitrages salle à manger / dressing / rangement / bureau
sont **clos**.

#### Ce que l’audit ajoute (flux F)

- registre **CAPABILITY** entre équipement et fonction ;
- **ZONE** / **SHARED_ZONE** comme conteneurs spatiaux (distincts de la
  *zone d’usage* d’un équipement) ;
- **SEPARATION** en continuum (`NONE` → `FULL_WITH_DOOR`) ;
- **SPACE_PRESSURE** et bascule de stratégie (`ROOM_FIRST` / `HYBRID` /
  `ZONE_FIRST` / critique) ;
- **TIME_MODE** léger + équipements transformables multi-empreinte ;
- typologie **descriptive** (`classify`) **et** contrainte
  (`TYPOLOGY_CONSTRAINT`) ;
- partition **après** placement, **bornée** aux programmes à pression haute
  — ne remplace pas le poseur corridor-first.

#### Piège nommé

Ne pas confondre (a) l’émergence déjà décidée, qui s’intègre dans L1–L2 /
F2–F3, avec (b) l’inversion place-then-partition, qui contredit
`DOCTRINE_AGENCEMENT.md` si elle n’est pas limitée à la stratégie critique.
Quatre sens du mot « zone » coexistent déjà : le glossaire de
[`DOCTRINE.md`](DOCTRINE.md) §4 est obligatoire avant L2.

#### Décisions prises à cette occasion

1. **[`DOCTRINE.md`](DOCTRINE.md) fait foi** sur l’unité de conception et la
   chaîne cible.
2. Un **troisième flux F** est ouvert (§6.2 bis), distinct de M et C.
3. **F0–F1** (doctrine + annotation du socle) peuvent avancer **sans**
   attendre la réouverture de la porte A — aucun comportement de génération.
4. **F2–F3** convergent avec L1–L2 ; L1 porte désormais l’interpréteur de
   `trigger` *et* le catalogue FUNCTION.
5. **F4–F6** sont explicitement **après** porte A rouverte, `S4`, et
   démarrage M3.
6. Le studio runtime (`TYPOLOGIES_LOGEMENT`) reste l’approximation ; son
   remplacement par `TYPOLOGY_CONSTRAINT` est un livrable F2/F5, pas un lot
   L6 isolé qui réécrirait une fusion déjà correcte.

### 6.1 quater — Audit de la livraison M3 (28 août 2026, soir)

Audit de la progression, mené sur l'arbre de travail par lecture du code et
par mesure. Aucun fichier du projet n'a été modifié.

**Réserve de méthode, à lire d'abord.** L'arbre a bougé pendant l'audit :
`squelette.js` 14:07, `app.js` et `rules.js` 14:29, `placement.js` 14:37,
`generator.js` 14:44 — et les quatre photographies de référence datent de
14:04 à 14:13, donc **toutes antérieures aux dernières touches au moteur**.
Les premières mesures, prises pendant ces modifications, ont été **jetées**.
Tout ce qui suit a été rejoué à empreinte constante : `md5` identique de
`generator`, `placement`, `squelette` et `rules` à 14:54:30 et 14:55:58.

#### Ce que le lot livre, vérifié dans le code

| Annoncé | État |
|---|---|
| cinq producteurs au même contrat | livré — `barre`, `l`, `t`, `hall`, `jour-nuit`, filtrés par `mandatoryAdjacenciesHeld` **avant** le score |
| graphe obligatoire tenu par construction | livré |
| O4 — adjacences typées | livré — `nature` × `degre` × `contact`, règles `TH2D-ADJ-001` à `004` |
| M3.0 — barème de longueur | livré — `(mètres par desserte)² × 30` ; `TH2D-CIRC-004` **suspendue en limite** avec cause, mesure et suite datées |

**Et, hors périmètre annoncé, quatre recommandations des audits du §6.1 bis
sont fermées sans que la roadmap le dise :**

- **`S4` est fermée à l'échelle de la pièce.** `placement.js` porte une
  transformée de distance, des composantes connexes et un refus en
  `acceptPartial` (`S4_CANNOT_BE_SATISFIED`) ; `rules.js` porte
  **`TH2D-PATH-004`, niveau `HARD`**. C'est le pas 2 **et** le pas 3 du
  §10.5 de `DOCTRINE_CIRCULATION.md`.
- **`cornerScore` est supprimé** — le §10.3.
- **La réservation de seuil est posée devant chaque baie, des deux côtés du
  mur, fenêtres et coulissantes comprises** — le pas 1. L'arbitrage 0,25 m
  plutôt que 0,60 est argumenté dans le code : confondre la réservation avec
  la largeur de circulation éliminerait les WC peu profonds, dont le sol
  reste traversable. C'est une réponse à la question laissée ouverte, pas un
  raccourci.
- **Le calque est rendu et au schéma** — étape 1 du §9.6.

#### Mesures, rejeu de `npm run technohab:audit-circulation`

Populations comparables : 275 pièces programmées et 242 meublées (88,0 %),
contre 306 et 269 (87,9 %) le 27 août.

| | 27 août | 28 août |
|---|---|---|
| zones d'usage séparées de la porte (`S4`) | 2,9 % — 18/631 | **0,0 % — 0/712** |
| seuils de porte sans sol praticable | 1,2 % | **0,0 % — 0/314** |
| fenêtres masquées par une emprise | 8,0 % — 16 | **0,5 % — 1/184** |
| sol praticable en plusieurs îlots | 16,7 % — 45 | 15,3 % — 37 |
| lits décollés des deux angles | 81,2 % | 65,1 % |
| marge médiane du lit à l'angle | 0,70 m | 0,90 m |
| fenêtres coupées de la porte | 4,0 % | 6,0 % |
| sol échoué hors du grand îlot | 1,8 % | 2,5 % |

Les trois défauts que l'audit 2 avait nommés et chiffrés — `S4`, seuils
condamnés, fenêtres masquées — **sont à zéro ou presque**.

Banc de contrôle indépendant, 100 plans (4 surfaces × 25 graines, graines
hors banc officiel) : **0 violation `HARD`**, 200 violations `TH2D-ADJ-004`,
4 `TH2D-SIZING-001`, 3,91 candidats comparés en moyenne (minimum 2).

#### Les constats

1. **Le témoin est rouge, pour la deuxième livraison consécutive.** Détail et
   preuve au §6.4. C'est le point à corriger en premier, parce qu'il conditionne
   l'attribution de tout ce qui suivra.
2. **La fragmentation n'a presque pas bougé : 16,7 % → 15,3 %.** L'ablation du
   §10.3 promettait 12,6 % par le seul retrait de `cornerScore` ; il a été
   retiré, `S4` est bloquante, et une pièce meublée sur sept garde un sol en
   plusieurs îlots — salle d'eau : 10 sur 48. `S4` garantit qu'on **atteint**
   chaque zone d'usage, pas que le sol reste d'un seul tenant ; c'est la
   première propriété qui a été implémentée, et il faut cesser de les
   confondre.
3. **Le lit flottant n'a pas suivi son ablation.** Prédiction sans
   `cornerScore` : 42 % de lits décollés, marge médiane 0,15 m. Réalité après
   suppression : **65,1 % et 0,90 m** — la marge a *augmenté*. La cause
   désignée n'était donc pas la bonne, ou pas la seule, et plus rien ne
   cherche la vraie.
4. **« Cinq stratégies interchangeables » est vrai au contrat, faux à la
   sélection.** Sur 100 plans : `jour-nuit` 58, `barre` 21, `hall` 14, `t` 5,
   **`l` 2**. Familles : `T` 77 %, `barre` 21 %, `L` 2 %. La barre n'est plus
   toujours gagnante — une autre dominante l'a remplacée. Et trois des cinq
   stratégies partagent la même géométrie de famille `T` en ne différant que
   par la politique de répartition : « la famille T gagne 13 fois » additionne
   trois producteurs dont deux ne sont pas des formes.
5. **Le levier L2 optimise sa propre métrique — et le banc du projet le dit.**
   L'ablation versionnée dans `M3_CIRCULATION_REFERENCE.json` : pénalité
   active, `scoringLength` **−9,5 %**, mais `branchLength` **+0,9 %**, part de
   circulation **+3,5 %**, longueur réelle des chemins **−0,8 %**. La grandeur
   notée s'améliore, la grandeur vécue ne bouge pas. C'est le motif des trois
   audits du §6.1 bis — décider sur un substitut — reproduit dans le lot
   chargé de le corriger. Il a été mesuré et publié ; il n'a pas été commenté,
   et la porte C inscrit malgré tout « levier L2 tenu ».
6. **`TH2D-ADJ-004` produit deux violations par plan, structurellement.**
   Toutes les paires de chambres sont déclarées déconseillées entre elles
   (`generator.js`, construction du programme) et le score paie 18 points
   chaque mitoyenneté réalisée — alors que `jour-nuit`, qui gagne 58 % des
   plans, regroupe précisément les chambres. Le lot introduit d'un même
   mouvement une stratégie et une pénalité qui se contredisent. Et une règle
   qui se déclenche partout ne discrimine plus : c'est le diagnostic du §8.4,
   corrigé pour `CIRC-004`, reproduit ici.
7. **La ramification plafonne à deux branches et recule là où elle servirait**
   — 1,96 / 1,92 / 1,88 branches à 90, 130 et 180 m², **1,40 à 250 m²**,
   maximum 2 partout. Le grand programme, celui du couloir de 22 m qui a
   ouvert le dossier, reste servi par une barre.
8. **Les assertions des tests M3 sont posées aux bornes triviales** :
   `topologyCandidatesCompared >= 1`, `topologyStrategiesCompared.length >= 1`,
   `tFamilyOnLargePrograms > 0`, et `topologyStrategy` accepté parmi six
   valeurs dont le repli `typologie`. Un moteur qui cesserait de comparer les
   stratégies passerait au vert. Le seul garde-fou réel est la photographie —
   c'est-à-dire l'élément qui vient de diverger.
9. **Deux poids muets de plus, une donnée morte de plus.**
   `scoringLength = 0,25 × somme + 0,75 × plus longue branche`, sans source ni
   valeur canonique ; `servedServices` calculé et jamais lu ; et
   `topologyBranches` a deux définitions selon la branche de code — parts de
   circulation dans le squelette, pièces de circulation dans le repli — que le
   banc moyenne ensemble.
10. **La documentation est en retard sur son propre code.** Le §6.1 bis disait
    « ouvert » sur quatre points fermés, la « Prochaine action » annonçait
    `S4` comme le prochain chantier de M4, `SUIVI_REGLES_PIECES.md` ignore
    `TH2D-PATH-004`, et le compte de règles était resté à 26 pour 30. L'écart
    va dans le sens inverse de l'habituel — le moteur tient plus qu'il ne
    promet — mais il coûte quand même : le lot suivant était planifié pour
    livrer ce qui existe déjà. *Corrigé par la présente révision.*

#### Verdict

M3 est le lot le mieux instruit du projet : cinq producteurs explicites, deux
bancs versionnés, une ablation publiée, une règle suspendue avec cause, mesure
et suite datées, et trois recommandations d'audit fermées sans qu'on les lui
ait demandées. Sur les défauts qu'il visait nommément — `S4`, seuils,
fenêtres — il livre des zéros.

Ce qu'il n'a pas fait : changer ce que le moteur produit **là où le barème
décide**. La circulation n'est pas plus courte, les chemins réels ne
raccourcissent pas, la ramification recule sur les grands programmes, une
stratégie dominante en remplace une autre, la fragmentation cède 1,4 point et
le lit flottant reste à 65 %.

#### Ordre retenu

1. **Traiter le `NON_TROUVE` du banc circulation** — régression de couverture
   sur les petites surfaces, apparue le jour même. C'est le seul point qui
   touche à ce que l'utilisateur obtient.
2. **Rejouer et republier les quatre photographies**, et faire du rejeu la
   dernière étape de tout lot.
3. **Arbitrer `TH2D-ADJ-004`** : ou la mitoyenneté de chambres cesse d'être
   déconseillée par défaut, ou `jour-nuit` cesse de la payer.
4. **Rouvrir la question du lit flottant et de la fragmentation résiduelle** :
   la cause désignée a été retirée, l'effet est resté.
5. **Durcir les assertions M3** aux valeurs mesurées, pour que la photographie
   ne soit pas le seul filet.
6. **`S4` à l'échelle du logement**, puis l'étape 2 du §9.6 — une règle
   géométrique en `GUIDELINE` qui double `TH2D-GRAPH-002` et lit enfin le
   calque.

### 6.1 quinquies — Audit d'invariance des circulations (29 août 2026)

Le défaut signalé visuellement est **confirmé**, avec une nuance importante :
la circulation dessert bien les pièces — huit portes vers une pièce en moyenne
sur le banc — mais son **squelette est figé dans le repère du générateur** et
ses extrémités aboutissent systématiquement à l'enveloppe. La variété de
répartition des pièces masque donc une absence de variété de transformation et
de terminaison du réseau.

Preuve rejouable avant M4a :
`node scripts/audit-circulation-orientations.mjs --canonical-only`. Sur **100 plans fixes**
(90, 130, 180 et 250 m² × 25 graines, aucun `NON_TROUVE`) :

- **100/100** circulations touchent au moins un mur extérieur ;
- **100/100** accueillent directement la porte d'entrée ;
- les **23 barres** sont toutes orientées **Est–Ouest** ;
- les **76 T** portent tous la signature **Nord–Est–Ouest** ;
- l'unique **L** porte la signature **Nord–Est** ;
- les contacts extérieurs se réduisent à deux signatures : Est–Ouest pour les
  barres, Est–Sud–Ouest pour les L/T.

**Cause localisée.** `squelette.js` construit chaque famille dans une seule
pose canonique : barre horizontale de `x = 0` à la largeur totale ; L avec
retour vertical à gauche ; T avec retour vertical dans une seule direction et
barre sur toute la largeur. Contrairement à l'ancien producteur
`typologie.js`, il n'applique ensuite ni transposition, ni rotation, ni miroir.
Les poches sont posées le long des branches mais aucun producteur ne propose
une extrémité intérieure. Enfin, la peine d'entrée favorise légitimement la
circulation comme hôte, sans distinguer le **seul seuil d'entrée utile** de
deux ou trois extrémités de couloir consommant la façade.

**Qualification.** Faire tourner le plan entier ne constitue pas une nouvelle
variante en l'absence de nord, de parcelle ou d'accès imposé : ce serait une
fausse diversité. Le correctif doit appliquer les symétries au
`TopologyCandidate` **avant construction et score**, dédupliquer les isomorphes,
puis laisser façade, entrée, programme et forme d'enveloppe départager les
poses. Il doit surtout ajouter de vraies terminaisons intérieures : hall court,
pièce distributrice ou dégagement, sans imposer que chaque branche traverse
l'enveloppe.

**Lot ouvert : M4a**, préalable à M5 :

1. produire les rotations et réflexions admissibles des barre/L/T, avec une
   signature canonique qui retire les doublons ;
2. écrire un test métamorphique : tourner ou réfléchir intention, enveloppe et
   contraintes doit tourner ou réfléchir le verdict, sans changer les HARD ;
3. séparer dans le score `façade nécessaire à l'entrée` et `façade consommée
   par une circulation`, avec identifiant, statut N3 et justification tant que
   la règle n'est pas sourcée ;
4. ajouter au moins une famille de terminaison intérieure et mesurer, à
   programme constant, façade touchée, hôte d'entrée, orientations et
   signatures topologiques ;
5. ne pas accepter comme diversité trois plans qui ne diffèrent que par une
   symétrie globale sans contexte de site.

Critère de sortie : chaque orientation admissible est atteinte sur le banc ou
explicitement éliminée comme isomorphe ; la part de circulations en façade et
le linéaire extérieur qu'elles consomment sont publiés ; au moins une variante
valide termine son réseau à l'intérieur ; aucune régression de graphe
obligatoire, de porte, de `S4` ou de meublabilité.

**Tranche M4a.1 livrée le 29 août.** `squelette.js` expose les huit isométries
du rectangle, déduplique les poses identiques et donne à toutes les vues d'une
même organisation une `topologyEquivalenceClass`. Tant qu'aucun contexte de
site ne les départage, le générateur classe la classe dans sa vue canonique,
puis matérialise une vue ensemencée **avant construction**, sans la compter
comme une stratégie supplémentaire. Le plan, le contrat et le schéma transportent
`topologyTransform`, la classe d'équivalence et le nombre de vues disponibles.
`test-m4a-circulation-invariance.mjs` vérifie surfaces, quatre quarts de tour,
équivalence, diversité d'axes et invariance du verdict HARD.

Rejeu courant : `node scripts/audit-circulation-orientations.mjs`. Sur les
mêmes 100 plans, les huit transformations apparaissent ; les T couvrent les
quatre orientations, les barres les deux axes, sans `NON_TROUVE`. **Le contact
extérieur reste 100/100**, à 2,50 m en moyenne : la rotation
ferme le biais de repère, pas l'ancrage. Le classement canonique puis la
matérialisation de la seule vue retenue maintiennent le banc performance à
101,6 ms de moyenne pour un budget de 110 ms ; p90 et maximum restent publiés.

**Dépendance précisée par l'implémentation.** Raccourcir une branche et donner
son extrémité à une pièce distributrice transforme cette pièce en polygone.
Le faire avant M4b ferait juger cette nouvelle emprise par son seul rectangle
principal — exactement le mensonge que M4b doit retirer. L'ordre sûr devient
donc **M4a.1 → M4b → M4a.2 (terminaisons intérieures et coût de façade)**.
Ce n'est pas un report de M4a : son contrat et son témoin sont en place ; c'est
la dépendance géométrique rendue explicite avant la mutation des pièces.

**Tranche M4a.2 livrée le 30 août.** La stratégie `hall` peut désormais
raccourcir une extrémité extérieure et en transférer le capuchon à une pièce
distributrice (`interior-room-cap-v1`). Un même receveur ne reçoit jamais deux
terminaisons ; chaque voisin conserve au moins 1 m de contact avec le réseau.
Le polygone complet est transmis au solveur M4b avant le verdict mobilier.

Le score distingue maintenant la largeur de façade nécessaire à la porte
d'entrée (0,90 m neutralisé lorsque la circulation l'accueille) du linéaire
extérieur restant. Ce dernier reçoit le coût provisoire
`VAL-CIRC-FACADE-EXCESS-WEIGHT-001` : **18 points/m**, `PREFERENCE`, statut
`PROVISIONAL`, source doctrinale N3 et portée circulation. Il classe les
candidats ; il ne crée aucune conformité et ne peut produire un `HARD`.

Rejeu sur les mêmes 100 plans : **100 générés**, les huit transformations, les
quatre orientations de T et les deux axes de barre restent atteints ; **27**
plans portent au moins une terminaison intérieure, soit **67 terminaisons**, et
**13/100** ferment tout le réseau à l'intérieur. La circulation ne touche donc
plus la façade que dans **87/100** plans, contre 100/100 avant M4a.2. Son
linéaire extérieur hors seuil d'entrée vaut **169,85 m** au total, soit
**1,70 m/plan** et 30,57 points/plan. Les 100 plans conservent huit pièces
desservies en moyenne, sans `NON_TROUVE`. Le banc performance reste sous son
budget en moyenne : **79,8 ms**, p90 116,3 ms, 30/30 signatures.

`test-m4a2-interior-terminations.mjs` vérifie conservation de surface,
receveurs distincts, invariance D4, coût canonique, plan totalement intérieur,
graphe, porte, S4, meublabilité et zéro `HARD`. Les témoins O0/M3 neutralisent
explicitement M4a.2 afin de ne pas réécrire rétroactivement leurs références.

### 6.1 sexies — Préambule M5 : une branche doit desservir (30 août 2026)

Le défaut observé est confirmé : le score global de longueur savait préférer
un réseau court, mais ne savait pas dire qu'un de ses bras ne menait à aucune
porte ou se prolongeait bien après la dernière. Sur le banc fixe de 100 plans,
l'ablation M5 reproduit la structure reçue de M4a.2 : **72 T, 28 barres,
34 bras vides dans 29 plans**, 281,91 m de reliquat sans desserte et 87 réseaux
en façade. Le T n'était donc pas seulement fréquent ; ses trois stratégies
occupaient le budget de validation et le verdict ne connaissait pas
l'incidence branche→porte.

**M5.0 livré.** `door-incidence-logical-arms-v1` découpe barre, L et T en bras
logiques, attribue chaque porte et l'entrée au bras le plus proche, puis mesure
le linéaire restant après la dernière ouverture. Le coût
`VAL-CIRC-DEAD-LENGTH-WEIGHT-001` vaut provisoirement **18 points/m**,
`PREFERENCE`, `PROVISIONAL`, doctrinal N3 : il classe, ne crée aucun `HARD`, et
M6 devra l'étalonner. Un bras sans porte reste prioritairement éliminé avant le
score ; deux répartitions au maximum sont explorées pour conserver le budget.

Un producteur `coude` construit en outre un **L intérieur jointif** : une
branche entre deux poches, un retour vers la bande publique, avec les huit
transformations D4. La première articulation se recouvrait sur 1,44 m² et
déclenchait `TH2D-RESERVE-001` contre la circulation elle-même ; le test M5
interdit désormais ce faux L. Les familles sont préservées à l'entrée de la
validation d'usage, mais aucune n'obtient de prime ni de quota.

Rejeu actif sur les mêmes 100 plans : **100 générés, 0 bras vide, 133,64 m de
reliquat (1,34 m/plan), 49 L et 51 barres**. Le contact extérieur tombe à
**69/100**, avec 31 réseaux entièrement intérieurs. Aucun T ne gagne ce corpus :
il reste un producteur admissible, mais son troisième bras n'est pas justifié
par les portes de ces programmes. Deux plans emploient le repli de classement
historique, mesure et coût M5 toujours actifs, afin que le nouveau levier ne
transforme pas un programme servi en `NON_TROUVE`. Performance au rejeu de la
porte complète : **103,6 ms** de moyenne, 30/30 signatures, budget 110 ms tenu.

`test-m5-circulation-utility.mjs` couvre articulation jointive, L orientable,
champs exportés, coût canonique, graphe construit, S4, meublabilité et zéro
`HARD`. Les témoins O0/M3 neutralisent l'objet complet de M5.0 : cinq
stratégies, deux candidats d'usage et jusqu'à six répartitions, ce qui conserve
exactement leurs photographies au lieu de les régénérer.

### 6.1 septies — M5 : filtrer, préférer, comparer (30 août 2026)

**M5 est livré dans le moteur.** Le filtre porte sur le BuiltPlan, après murs,
portes, mobilier et `S4` : `rules.evaluatePlan()` intervient avant que le plan
rejoigne les candidats publiables. Un candidat avec au moins un `HARD` est
écarté et la recherche continue ; `hardCandidatesRejected` rend ce travail
visible. Sur les 48 plans du banc constructif, les violations bloquantes
publiées passent de **1 à 0**. Sur l'audit fixe de 100 plans, un BuiltPlan HARD
est remplacé et **0 plan HARD** est publié, sans `NON_TROUVE`.

Les dégagements `target` et `comfort` sont désormais lus sur la pose réellement
retenue par `declared-clearance-fixed-placement-v1`. Agrandir une zone ne doit
ni sortir du polygone utile, ni rencontrer une réservation ou l'emprise d'un
autre équipement. Le minimum reste la faisabilité ; manquer `target` coûte
provisoirement **6 points/exigence**
(`VAL-USAGE-TARGET-MISS-WEIGHT-001`), manquer `comfort` **2 points/exigence**
(`VAL-USAGE-COMFORT-MISS-WEIGHT-001`). Ce sont deux `PREFERENCE` N3,
`PROVISIONAL`, décomposées dans `scoreBreakdown`, jamais des règles. Sur 100
plans : **507/550 target** et **430/450 comfort** atteints, pour 258 et 40
points cumulés.

`generateSelection(options, variant, seed, 3)` rend enfin un
`PlanSelection`. Douze tentatives déterministes au maximum alimentent un pool
de `GenerationResult VALID`, dédupliqué par famille, classe D4 et graphe. Le
premier rang reste le meilleur score global ; les suivants cherchent d'abord
une famille puis une stratégie absentes avant de revenir au score. Cette
diversité est une politique de présentation nommée, pas une prime de forme.
L'état `COMPLETE`, `PARTIAL` ou `EMPTY` interdit de prétendre avoir trois choix
quand le moteur n'en possède pas.

Audit de 12 demandes sur quatre surfaces : **12/12 sélections complètes, 36
plans VALID, 0 HARD, 0 doublon** ; neuf sélections emploient plusieurs familles
et plusieurs stratégies. Distribution : 18 L, 15 barres, 3 T. Le banc moteur
reste sous son budget : **102,2 ms** de moyenne, 30/30 signatures. La sélection
explicite est plus coûteuse — elle construit son pool à la demande — et ne se
substitue pas silencieusement à `generateResult()`.

Effet croisé assumé : le rejeu M5 complet porte **un bras vide sur 152** dans
un plan, contre 34/244 à l'ablation. Le filtre HARD et les préférences priment
sur ce défaut non bloquant lorsque les deux répartitions budgétées n'offrent
pas de meilleur BuiltPlan. Le transformer en HARD ou payer une troisième
répartition ferait mentir soit la doctrine, soit le budget ; M6 devra aider à
arbitrer son poids.

### 6.1 septies bis — M5.2 : résolution graduée, sans falsifier la demande

Le mécanisme est instruit dans
[`RESOLUTION_PROGRAMME.md`](RESOLUTION_PROGRAMME.md). Trois essais exacts
`NON_TROUVE` déclenchent une échelle cumulative : `R1` fusionne cuisine et WC
séparés dans leurs pièces hôtes, `R2` ramène les salles d'eau supplémentaires
à une, `R3` retire une fonction explicitement déclarée relaxable, `R4` retire
une chambre à la fois en dernier recours. `IMPOSSIBLE` saute les essais devenus
inutiles ; `INVALIDE_DEBUG` arrête la chaîne et ne devient jamais une
concession utilisateur.

Le contrat 1.1 livré est `ProgramResolution`, enveloppe distincte des statuts M1.
Le `GenerationResult` retenu reste `VALID` pour le programme réellement servi ;
la résolution transporte `requestedProgram`, `resolvedProgram`, le niveau, les
changements avant/après et chaque tentative. Ainsi `PlanSelection` conserve son
invariant — uniquement des résultats `VALID` — sans prétendre que le programme
résolu est identique à l'intention initiale.

**État interne :** M5.2a politique pure, M5.2b contrat, M5.2c orchestration,
M5.2d réemploi dans `PlanSelection`, M5.2e consentement produit et M5.2f mesure
versionnée sont livrés et testés. Depuis M5.1, l'interface appelle
`resolveSelection()` et présente la tri-sélection sur le programme résolu. Le
maximum initial est de quinze recherches, réduit par les
niveaux inapplicables et les impossibilités prouvées. Une chambre ou une pièce
retirée demande confirmation avant activation/export. Les dimensions `HARD`,
l'accessibilité, la construction et les équipements requis d'une fonction
conservée ne sont jamais relaxés.

**Sortie mesurée :** 30 demandes fixes, dont 6/6 témoins `EXACT` et 24/24
programmes comprimés `RELAXED` : R1 × 4, R2 × 11, R4 × 9, zéro `UNRESOLVED` et
zéro plan `HARD`. R3 reste inapplicable avant F1. Le coût de résolution vaut
4,23 appels en moyenne, 7 au p90 et 8 au maximum. Quatre tri-sélections sur
quatre sont complètes et portent chacune trois signatures. Le banc exact reste
inchangé lorsque l'API de résolution n'est pas appelée : 11 `NON_TROUVE` sur
360 tentatives M0 et 13 sur 96 demandes d'entrée C-P2. Référence :
`scripts/references/M5_2_RESOLUTION_REFERENCE.json`.

### 6.1 octies — Après M5 : audit amont, puis tranche exécutable vers M6

M6 n'est pas un nouveau poseur. C'est le lot qui empêche le moteur de se noter
lui-même avec ses propres conventions. Son exécution est découpée pour que la
constitution du corpus, la consolidation des profils et l'intégration produit
puissent avancer en parallèle sans contaminer l'étalon.

| Lot | Question fermée | Livrable vérifiable | Condition de sortie | Dépend de |
|---|---|---|---|---|
| **[x] M5.1 — comparaison dans le produit** | les trois propositions du moteur sont-elles réellement utilisables ? | `app.js` consomme `PlanSelection`, navigation clavier entre les rangs, compromis et statut PARTIAL/EMPTY visibles, une évaluation rattachée au plan effectivement affiché | trois plans distincts consultables sans perdre leur graine ni leur verdict ; aucune formulation d'agrément | M5 |
| **[x] M5.2 — résolution graduée** | peut-on proposer un repli utile sans faire passer une concession pour la demande initiale ? | `ProgramResolution`, trois essais exacts par niveau, mutations versionnées, comparaison demande/résolution, consentement avant retrait de pièce | chaque concession est visible et rejouable ; aucun debug relaxé, aucun plan HARD, programme exact inchangé hors appel explicite | M5 ; M1 ; C-P2 ; F1 pour R3 |
| **[ ] M5.3 — instrument d'audit atelier, prototype gelé** | le prototype de grille aide-t-il réellement l'observation sans alourdir ni masquer le plan ? | code et tests conservés, mais aucune revendication produit et aucun développement supplémentaire | reprise seulement après une nouvelle décision d'usage et d'ergonomie ; l'audit M5.4 ne dépend pas de cet outil | M5.1–M5.2 |
| **[ ] M5.4 — audit amont piloté et refonte de la roadmap** | que réussissent réellement les plans, qu'est-ce qui est prometteur mais inabouti, et quelles lacunes du modèle expliquent les échecs ? | corpus atelier annoncé avant lecture, constats rejouables, conséquences métier, matrice réussites/limites/échecs, bilan exhaustif des icônes, coûts complets et roadmap réordonnée | chaque constat et chaque absence d'icône visible sont attribués ; les faux « terminé » sont corrigés ; les lots indispensables sont insérés avant M6 ; la version du moteur à évaluer est nommée | M5.1–M5.2 ; témoins et profils courants ; **indépendant de M5.3** |
| **[ ] I1 — intégration produit des autres pièces prévues** | quelles pièces déjà prévues entrent dans la version évaluée, et leur chaîne est-elle complète plutôt que seulement documentée ou dessinée ? | vagues retenues parmi C-P3 à C-P6 ; activation déclarative F/L ; mobilier, icônes, règles, interface, export et tests de plan complet | chaque pièce incluse est C4, générable, meublée, contrôlée et visible ; chaque pièce différée porte une raison et un horizon ; aucun type ne devient actif par cas spécial | M5.4 ; profils C ; F1–F3 et L1–L6 selon la vague |
| **M6.0 — protocole pré-enregistré** | que va-t-on mesurer, sur qui et sans déplacer le but après résultat ? | protocole versionné : population, programmes, appariement, randomisation, métriques, seuils de décision, traitement des égalités et exclusions | protocole relu et gelé après M5.4 et la décision I1, avant toute mesure sur l'étalon ; un plan relaxé n'est comparable qu'à un plan humain portant le même programme résolu | **M5.4 clos ; périmètre I1 intégré ou différé explicitement ; lots pré-M6 fermés** ; décision d'inclusion M5.2 ; porte B |
| **M6.1 — corpus licencié et séparé** | les plans humains sont-ils comparables et légalement réutilisables ? | manifeste de provenance/licence, critères d'inclusion, normalisation minimale, séparation irréversible `atelier` / `etalon` par programme et surface | aucun plan d'étalon vu pendant le réglage ; chaque plan porte programme, surface, source et licence | M6.0 |
| **M6.2 — instrument commun** | juge-t-on moteur et humain avec le même vocabulaire ? | adaptateur vers un format d'observation commun ; règles rejouables sur les plans humains ; masquage de l'origine ; contrôle des paires réellement comparables | un plan moteur et un plan humain équivalents produisent le même dossier aveugle et les mêmes champs mesurables | M6.0 ; profils structurants C4 |
| **M6.3 — étalonnage atelier** | quels poids provisoires discriminent les défauts sans inventer de norme ? | distributions par programme, analyse des poids M3/M5, journal de chaque modification canonique et ablations avant/après | seuls les poids `PREFERENCE` N3 peuvent être ajustés ; aucun `HARD` n'est appris d'une fréquence ; témoins internes toujours verts | M6.1–M6.2 ; premiers profils C5 |
| **M6.4 — comparaison à l'aveugle** | le moteur produit-il des propositions reconnues comme crédibles face à des plans humains comparables ? | discrimination d'origine, préférences par paires, taux d'égalité, accord inter-évaluateurs et motifs qualitatifs codés | exécution unique sur l'étalon gelé ; résultats complets publiés, favorables ou non | M6.3 |
| **M6.5 — décision porte E** | que peut-on honnêtement affirmer et que faut-il reprendre ? | décision signée : ouvrir E, rester expérimental ou rouvrir un lot M/C/F ; poids retenus, limites et profils C6 consignés | aucun vocabulaire « agréable » ou « crédible au regard humain » avant ouverture explicite de E | M6.4 |

**Règle anti-fuite.** Un plan qui a servi à choisir une valeur, un poids, une
famille ou un seuil appartient à l'atelier et ne peut plus rejoindre l'étalon.
Le corpus étalon ne sert qu'une fois pour la décision M6.5 ; une itération
ultérieure exige un nouvel étalon ou reste annoncée comme analyse exploratoire.

**Ordre critique.** M5.4 précède maintenant la décision I1, puis M6. La rédaction exploratoire de
M6.0 peut avancer, mais aucune version n'est gelée avant la conclusion de
M5.4, la décision sur les pièces incluses et la fermeture des lots que cet
audit déclarera indispensables. Le
protocole décide ensuite si M5.2 appartient au moteur évalué et exclut toute
comparaison entre programmes différents. M6.1 peut avancer dès que les
questions de licence sont tranchées et que M6.0 est gelé. M6.2 attend chambre, séjour,
cuisine, WC et salle d'eau à C4. M6.3 attend au moins un trajet complet C5.
M6.4 et M6.5 restent strictement séquentiels et ne sont jamais parallélisés
avec un réglage du moteur.

**Travaux parallèles autorisés pendant M5.4, puis M6.0–M6.2.** Le flux C peut
poursuivre documentation, sourcing et tests isolés de C-P3 ; le flux F peut
livrer F1, qui n'a aucun effet sur les plans. Dès que le corpus M5.4 commence,
la version observée du moteur est figée : une correction bloquante crée une
nouvelle version et impose de reprendre les observations concernées. Après
M5.4, seuls les lots que sa décision autorise modifient le moteur avant le gel
de M6.0. Une fois l'étalon M6 engagé, toute livraison qui change les plans crée
une nouvelle version du moteur à évaluer.

### 6.1 nonies — M5.4 : audit amont piloté et refonte de la roadmap

**Autorité de l'audit.** Le pilote qualité observe et qualifie les plans. Les
assistants traduisent ces observations en conséquences métier, hypothèses de
cause, mesures et lots vérifiables. Le moteur ne se note pas lui-même, et une
hypothèse technique ne remplace jamais le constat porté sur le plan.

**Objet.** M5.4 ne cherche pas encore à améliorer le moteur. Il cherche à
comprendre, sur la version courante, ce qui fonctionne, ce qui fonctionne sans
être abouti et ce qui échoue. Sa sortie est une roadmap reconstruite à partir
des plans observés, non une accumulation de correctifs opportunistes.

Le travail suit cet ordre :

1. annoncer avant lecture le périmètre atelier : programmes, surfaces, formes,
   graines, rangs, cas exacts ou relaxés et règle d'arrêt de l'échantillon ;
2. conserver pour chaque constat le plan, la graine, le rang, la demande, le
   programme servi, les verdicts et le temps complet ; les exports JSON/SVG
   existants, une capture PNG et une note libre suffisent — M5.3 n'est pas
   requis ;
3. classer le constat en **réussite à préserver**, **qualité inaboutie** ou
   **défaut**, puis décrire son effet pour l'habitant avant de chercher sa
   cause ;
4. confronter l'observation aux données du moteur : fréquence, surfaces,
   cheminements, desserte, mobilier, concessions et coût ;
5. affecter seulement ensuite le constat à un lot fermé à protéger par un
   témoin, un lot à rouvrir, un nouveau lot ou une question sans décision ;
6. réécrire l'ordre, les dépendances et les conditions de sortie de la roadmap,
   puis nommer la version exacte qui pourra entrer dans M6.

**Dossiers corrélés à instruire dans le même audit.** Ils sont des questions,
pas des corrections présupposées :

- circulation vécue : longueur réelle plutôt que son proxy, branche après la
  dernière porte, contact de façade, variété utile des L/T/barres/halls et
  contradiction éventuelle avec `TH2D-ADJ-004` ;
- plan meublé : fragmentation du sol libre, lits flottants, fenêtres coupées
  du composant principal, continuité du parcours à l'échelle du logement ;
- programme : différence entre réussite exacte et réussite par concession,
  acceptabilité des replis M5.2 et cas où retirer une chambre change la nature
  de la demande ;
- profils : portée réelle des C4, salle d'eau autonome encore C2, résultats
  S1–S6 visibles dans le verdict, réseaux, ventilation et choix du premier
  trajet complet vers C5 ;
- autres pièces prévues : dresser pour C-P3 à C-P6 la différence entre fiche,
  données du socle, profil C4, activation dans le programme, génération,
  équipement, règles, icônes et restitution. M5.4 décide quelles vagues
  rejoignent la version évaluée et lesquelles restent explicitement après M6 ;
- représentation des pièces et équipements : pour chaque identifiant, séparer
  **symbole existant dans la source**, **symbole recopié dans la page
  `file://`**, **raccord de rendu disponible** et **apparition réellement
  observée sur un plan**. Vérifier aussi lisibilité, distinction entre
  équipements proches, orientation, échelle, déformation, légende et repli
  rectangulaire lorsqu'un symbole manque. Une icône ne doit jamais être la
  seule porteuse de sens : nom de pièce ou légende textuelle restent requis ;
- performance : poids initial des ressources, temps d'une tri-sélection exacte
  et relaxée, p90, maximum et coût des échecs. La référence actuelle est
  633 520 octets de JavaScript chargés au départ ; le témoin existant ne bloque
  que la moyenne d'une génération simple ;
- preuve et documentation : cohérence entre statut annoncé, branchement réel,
  banc, acceptation produit et état Git. Un prototype testé mais gelé, comme
  M5.3, n'est pas un lot terminé.

**Point zéro des icônes, avant corpus M5.4.** Le relevé statique du 3 septembre
donne 18 symboles de pièces — 13 dessins et 5 alias — dont les 6 types
actuellement générés sont tous raccordés. Le sprite mobilier contient 34
symboles : les 32 identifiants d'équipements et de gammes du socle courant ont
tous un dessin ; `oven` et `double_washbasin` sont deux réserves sans entrée de
catalogue active. Les deux sprites, soit 52 symboles, sont recopiés dans
`index.html` et `icons:check` passe.

Cette couverture de fichier n'est pas une couverture produit. Un balayage
exploratoire non versionné de 77 plans n'a fait apparaître que 18 des 32
symboles raccordés. Les 14 autres relèvent soit de pièces non générées
(entrée autonome, salle à manger, bureau, buanderie, cellier, local technique,
garage), soit d'optionnels non enrôlés dans le programme construit
(`dishwasher`, `handbasin`, `towel_rail`), soit de la variante bain encore
inaccessible (`bathtub`). M5.4 doit remplacer ce sondage par une mesure
versionnée sur son corpus annoncé et distinguer, pour chaque absence, manque
d'asset, manque de raccord ou fonction moteur inatteignable.

**Condition de sortie.** M5.4 est clos lorsque chaque constat retenu possède
une preuve rejouable et une conséquence métier, que les réussites importantes
sont protégées contre les régressions, que les limites sont attribuées sans
faux statut « livré », et qu'une seule séquence de lots dicte à nouveau
l'ordre. Le bilan d'icônes doit publier une matrice exhaustive
`catalogue → symbole → page → rendu → plan observé`, sans confondre couverture
des assets et couverture fonctionnelle du moteur. Le bilan des pièces doit
produire la même visibilité, de la fiche au plan affiché, et ouvrir I1 avec un
périmètre nommé. M5.4 peut insérer des lots de
consolidation entre lui et M6. M6.0 ne peut être gelé qu'après leur fermeture
ou une décision explicite de les exclure de la version évaluée.

### 6.2 — Flux C : consolidation canonique, pièce par pièce

Chaque lot porte **une pièce ou une composition**, jamais une famille entière
traitée en moyenne. Le cycle est toujours le même :

1. décrire les scénarios d'usage et les profils d'occupants retenus ;
2. inventorier équipements requis, optionnels et gammes ;
3. sourcer les emprises, dégagements et seuils, ou les marquer N3/non sourcés ;
4. formaliser les relations entre équipements, portes, fenêtres, murs,
   réseaux et pièces voisines ;
5. distinguer `HARD`, `GUIDELINE` et `PREFERENCE` ;
6. compiler les enveloppes de faisabilité et écrire les cas isolés ;
7. intégrer au plan complet, mesurer les régressions et mettre à jour
   `SUIVI_REGLES_PIECES.md`.

Ordre recommandé, qui n'interdit pas de documenter une vague suivante pendant
que la précédente s'intègre :

| Vague | Profils | Pourquoi cet ordre |
|---|---|---|
| **C-P0 — pilotes** | WC séparé ; salle d'eau avec WC intégré | méthode déjà la plus avancée ; livre le gabarit commun sans prétendre être définitive ; tranche l'incohérence du gabarit WC — 0,90 × 1,30 annoncé au socle, 0,70 × 1,50 imposé par ses propres cotes |
| **C-P1 — noyau habité** | chambre ; séjour ; cuisine | pièces présentes dans presque tous les programmes et structurantes pour surface, façade et mobilier ; la cuisine y pose la valeur du passage de 1,20 m entre linéaires opposés, dont M2 fournit le mécanisme |
| **C-P2 — distribution et réserve** | circulation ; entrée ; rangements | relie toutes les pièces et révèle portes, accès, desserte et rattachements |
| **C-P3 — services** | salle d'eau sans WC ; cellier ; buanderie ; local technique | mutualise réseaux humides, maintenance et voisinages techniques |
| **C-P4 — usages optionnels** | bureau ; salle à manger ; dressing | oblige à trancher pièce, zone ou équipement avant activation |
| **C-P5 — compositions** | cuisine ouverte ; suite parentale ; chambres enfant/amis ; studio | prouve que les profils se composent sans disparition de fonction |
| **C-P6 — seuil du logement** | garage ; sas ; relation aux extérieurs | introduit non-habité, frontière thermique et accès spécifique |
| **C-P7 — changement de modèle** | terrasse, balcon, escalier, multi-niveaux | hors vNext initiale ; demande d'autres familles spatiales |

#### Tranche C immédiate — définition des dossiers

**C-P0.2 — pilotes C4 → C5 — livré le 31 août 2026.** Sans réécrire les valeurs du WC et de la
salle d'eau intégrée. Vérifier leur transport : manifeste de profil et canon
dans l'export, composition sans disparition de fonction, variantes réellement
générées, verdicts S1–S6 rattachés à la bonne pièce, et absence de branche
spéciale qui contourne le mécanisme commun. La sortie est soit C5 avec preuves,
soit C4 accompagné d'une dette moteur nommée et testée.

La seconde issue est retenue : manifeste, canon, composition minimale, S3,
S4, ancrages et zéro `HARD` sont prouvés, mais les deux profils restent C4.
Le registre `C_P0_INTEGRATION_AUDIT.json` attribue sept blocages ; son test
empêche une promotion de maturité qui ne les aurait pas réellement fermés.

**C-P1.2a — chambre C2 → C4 — livré le 31 août 2026.** Le dossier ferme le
programme simple/double/parental, tranche chevets et rangement requis, sépare
minimum, cible et confort au pied et sur les côtés, décrit l'ouvrant du
rangement et teste façade/fenêtre, porte et chemin jusqu'au lit.
Sortie livrée : planchers enfant/parentale consommés par le générateur, lit et
penderie coulissante requis, face `foot`, niveaux minimum/cible/confort et
valeurs canoniques identifiées. `test-bedroom-c4.mjs` couvre cas passant,
refus parental à 9 m², deux proportions par variante, porte intérieure,
débattement, fenêtre et S4, sans créer de suite parentale composée. Les
chevets liés, l'ouvrant battant et l'accessibilité restent attribués au-delà C4.

Le rejeu des photographies consigne l'effet du programme renforcé sans le
confondre avec une évolution de circulation : O0 passe de 1/30 à 30/30 plans
générés à 45 m² ; le témoin M3.0 historique rend 19/21 plans, avec deux
`NON_TROUVE` à 60 m² ; le banc M0 ablaté passe de 23 à 1 `NON_TROUVE` mais de
1 à 6 plans HARD. Le moteur produit, lui, zéro HARD dans les tests actifs : les
six appartiennent au témoin qui neutralise volontairement le filtre M5.

**C-P1.2b — séjour C2 → C4 — livré le 31 août 2026.** Le groupe minimal exige
désormais canapé et table basse à portée ; média et fauteuil restent optionnels
à 22 m². Focalité, conversation 1,00–3,00 m, occupation maximale souple de 50 %
et traversée multi-accès à 0,70 m sont des données canoniques consommées et
éprouvées. `test-living-c4.mjs` couvre deux proportions, refus, ouvrants,
fenêtre et S4. Repas et bureau attendent explicitement `ZONE` F3 ; en cuisine
ouverte, l'occupation de la seule zone séjour est suspendue plutôt que simulée
sur toute la composition. Le témoin dessiné reste sans HARD ; son écart de
20,37 points au meilleur des trente plans moteur reste sous la dette historique
bornée à 37 points. Le budget M2 sur trente générations passe de 110 à 180 ms : coût borné du premier meuble libre requis,
attribué au profilage M6. Le témoin M3.0 reste à 19/21 plans et la part moyenne
de circulation à 45 m² reste stable (17,74 % → 17,66 %, maximum 22,62 %).
Sur 48 plans topologiques, les familles T des grands programmes passent de 12
à 14 et un hall rejoint les stratégies sélectionnées ; zéro HARD et zéro
adjacence obligatoire manquée. Ces mouvements sont publiés dans les deux
références M3 plutôt que cachés dans le profil séjour. Sur le banc historique
de 360 tentatives, les plans HARD reculent de 6 à 5 mais les `NON_TROUVE`
passent de 1 à 9, tous concentrés dans les programmes de 35 à 55 m² : prix
explicite du groupe canapé-table désormais indivisible. Ce refus est préféré à
la disparition silencieuse de la table ; son acceptabilité produit reste à
trancher avec les variantes studio et le corpus M6.

**C-P1.2c — cuisine C2 → C4 — livré le 1er septembre 2026.** La variante
séparée et la composition ouverte conservent `COOK` et les quatre pôles requis
évier/préparation/cuisson/froid. Le plancher d'allocation reste 7 m² et le côté
minimal passe au 1,85 m dérivé. Le mécanisme générique M2 consomme le passage
face-à-face de 1,20 m. La séquence préparation entre évier et plaque reste
`HARD` ; le triangle évier–plaque–froid devient une relation générique
`perimeter-max`, `GUIDELINE`, bornée à 6,50 m. La pièce déclare la ventilation.
Le lave-vaisselle est optionnel dès 9 m² et réserve 1,20 m devant sa porte
ouverte. Douze valeurs canoniques identifiées portent ces décisions.

`test-kitchen-c4.mjs` couvre deux proportions, un refus, porte, fenêtre, S4,
la cuisine séparée et la composition ouverte. Le linéaire de plan de travail
dont la longueur résulte de la pose, l'ouvrant lié du four et l'accessibilité
restent explicitement différés : C4 ne prétend pas les avoir résolus. M4c étant
limité au séjour et à la chambre, le programme optionnel cuisine est éprouvé
par le solveur et le dossier C4, mais n'est pas encore enrôlé dans le verdict
final du générateur.

**Rejeu conjoint M4c/C-P1.2c.** Le témoin topologique M3 reste strictement
identique : 48 plans, zéro `HARD`, zéro adjacence obligatoire manquée et 14 T
sur les grands programmes. Le banc M3.0 conserve 19 plans sur 21 ; son pire
chemin baisse de 25,60 à 21,60 m. Sur les 360 tentatives historiques, les
comptes restent à 9 `NON_TROUVE`, 5 `HARD`, zéro dette et zéro échec mobilier ;
235 pièces sont non rectangulaires contre 238, et six configurations changent
de signature. O0 conserve 90/90 générations et aucun WC non rectangulaire.

**C-P2 — circulation, entrée et rangements C2 → C4 — livré le 1er septembre
2026.** La circulation consomme désormais 0,90 m sous trois dessertes et
1,20 m à partir de trois, au lieu d'un minimum universel. Les cinq paramètres
de programme, largeur et service sont canoniques ; la mesure reste faite
branche par branche et les battants participent à `S3`. `TH2D-CIRC-004` reste
volontairement un diagnostic sans seuil externe.

L'entrée devient le profil fonctionnel `ENTRY_THRESHOLD` : elle reste
hébergée par une circulation ou le séjour, réserve 1,20 × 1,20 m sans mobilier
et porte cinq valeurs canoniques. `TH2D-ENTREE-002` bloque une zone absente,
trop petite ou occupée. Sur les 96 demandes fixes de `test-entree.mjs`, 83
plans restent valides et 13 deviennent honnêtement `NON_TROUVE`, concentrés
sur des géométries étroites ; chaque classe conserve des solutions.

Les rangements séparent enfin `STORAGE_UNIT` et `STORAGE_BAY`.
`TH2D-RANGEMENT-003` inspecte la penderie réellement posée et sort des limites
d'implémentation ; profondeur et proportion des baies sont canoniques. Le C4
est limité à la penderie de chambre et aux baies existantes. Placard d'entrée,
rangement de service, dressing et émergence d'une annexe restent des lots
ultérieurs, sans être présentés comme implicitement résolus.

**Rejeu C-P2.** O0 reste conforme, le banc M3.0 reste à 19 plans avec un pire
parcours inchangé de 21,60 m, et le banc M3 conserve ses 48 plans. Sur les 360
tentatives historiques, `NON_TROUVE` passe de 9 à 11 — deux plans de 40 m² ne
peuvent plus faire tenir le programme et la zone d'arrivée — tandis que les
327 faux signalements `TH2D-RANGEMENT-003` disparaissent. Les 5 plans HARD,
les 5 adjacences manquantes, les 235 pièces non rectangulaires et le maximum
d'erreur de surface à 0,004 m² restent inchangés.

Pour chacun des trois dossiers, le passage C3 → C4 exige le même paquet : fiche
à jour, données consommables, identifiants canoniques, un cas passant, un refus
attendu, au moins deux variantes ou proportions, portes et accès, puis mise à
jour de `SUIVI_REGLES_PIECES.md`. Le passage C5 est ultérieur et se juge dans
le plan complet par un mécanisme générique.

La documentation d'une vague peut commencer sans attendre le moteur. Son
passage en C5 dépend en revanche des capacités génériques nécessaires. Par
exemple, la cuisine peut atteindre C2 pendant M1 ; elle attend M2 ou M4 pour
prouver correctement ses portes, équipements et parcours dans le plan final.

Les vagues **C-P4** et **C-P5** (usages optionnels, compositions) ne
réouvrent plus l’arbitrage « pièce ou zone » : il est tranché par
[`DOCTRINE.md`](DOCTRINE.md) et `DECISIONS_PROGRAMME.md`. Elles
**consomment** les mécanismes F2–F3 (FUNCTION, ZONE, SEPARATION).

### 6.2 bis — Flux F : doctrine fonctionnelle

Couche au-dessus du runtime room-first. Autorité :
[`DOCTRINE.md`](DOCTRINE.md). Ne remplace ni M ni C ; fournit le vocabulaire
et les mécanismes dont L1–L6 et les micro-surfaces ont besoin pour cesser
d’être des cas spéciaux.

| Lot | Objet | Livre | Dépend de | Comportement générateur |
|---|---|---|---|---|
| **F0 — doctrine** | glossaire, registres CAPABILITY / FUNCTION, lien DECISIONS_PROGRAMME | [`DOCTRINE.md`](DOCTRINE.md) versionné | — | aucun |
| **F1 — annotation** | `capabilities[]` sur le socle ; `requiredCapabilities` en miroir des requis | socle annoté, tests de schéma | F0 | **aucun** |
| **F2 — résolution** | catalogue FUNCTION ; OR d’équipements ; interpréteur `trigger` + émergence (avec L1) | activation déclarative ; fin du double chemin pour les types couverts | F1, L1, porte B | émergence / activation |
| **F3 — zone** | `ZONE` conteneur ; `SEPARATION` minimal ; zone désignée dans hôte (avec L2) | salon/repas/bureau comme zone sans mur obligatoire | F2, L2 | zones désignées |
| **F4 — pression (levier L1)** | `SPACE_PRESSURE` ; stratégies `HYBRID` ; coût de cloison dans le score | bascule ROOM / HYBRID | F3, **M3.0**, S4 amorcé, M3 démarré | bascule de pose |
| **F5 — temps** | `TIME_MODE` ; transformables ; mutualisation dégagements ; `classify()` | DAY∧NIGHT valides ; typologie descriptive | F2–F3 | multi-états |
| **F6 — partition micro** | clusters → partition si justifiée, **seulement** pression HIGH/CRITICAL | branche `FUNCTION_FIRST` bornée | F4–F5, M3 | micro-surfaces |

**Définition de terminé — F0.** Document lu, glossaire sans homonymie
bloquante, ROADMAP et `DECISIONS_PROGRAMME` croisés. **Livré le 27 août
2026** avec ce lot.

**Définition de terminé — F1.** Chaque équipement MVP du socle porte
`capabilities[]` ; chaque type de pièce MVP porte `requiredCapabilities` ;
aucun plan du banc M0 ne change d’empreinte ; `npm run fit:build` n’est pas
requis (pas de changement d’emprise).

**Tranche F1 exécutable.** 1) geler le vocabulaire minimal de capacités depuis
`DOCTRINE.md`, sans synonymes concurrents ; 2) annoter d'abord les équipements
requis des cinq profils de la porte C ; 3) annoter les types correspondants en
miroir ; 4) valider références inconnues, doublons et capacités requises sans
candidat ; 5) étendre au reste du socle ; 6) prouver par empreinte du banc que
ces métadonnées n'ont encore aucun effet de génération. F1 ne lit pas
`trigger`, ne choisit pas d'équipement et ne crée aucune pièce : ces trois
comportements commencent en F2.

**Définition de terminé — F2.** Une fonction `SLEEP` peut être résolue par
au moins deux candidats d’équipement sans branche `if (type === 'bedroom')`
nouvelle ; `trigger` est lu pour les types qu’il décrit ; `buildProgram()`
n’a plus de chemin impératif parallèle pour ces types.

**Règle de coopération F ↔ M ↔ C**

1. F n’invente aucune cote : C reste l’autorité des emprises et dégagements.
2. F n’écrit pas de poseur parallèle avant F4 : M reste l’autorité de la
   géométrie construite.
3. Toute résolution multi-candidats qui change le programme d’équipements
   compile une frontière fit **par résolution**
   (`DOCTRINE_AGENCEMENT.md` précisée par `DOCTRINE.md` §8).
4. Un profil C-P4/C-P5 qui a besoin de ZONE attend F3 ; il peut documenter
   en C2–C3 sans l’attendre.

### 6.2 ter — I1 : intégration produit des autres pièces prévues

I1 est le point de convergence des flux existants, pas un quatrième moteur :
le flux C définit et consolide la pièce, F résout ses fonctions et ses zones,
les lots L1 à L6 fixent l'ordre d'activation, et M reste l'autorité de la
géométrie construite. I1 interdit de considérer une fiche, un symbole ou une
entrée de socle comme une pièce intégrée.

Le périmètre candidat est celui déjà prévu :

- **C-P3 / L2–L3** : salle d'eau autonome, cellier, buanderie et local
  technique ;
- **C-P4 / L1–L2** : bureau, salle à manger et dressing, comme pièce, zone ou
  équipement selon les décisions déjà prises ;
- **C-P5 / L4–L6** : cuisine ouverte, suite parentale, variantes de chambre et
  studio, comme programmes composés ;
- **C-P6 / L5** : garage, sas et relation au non-habité.

C-P7 / L7 — extérieurs et multi-niveaux — reste un changement de modèle et ne
peut pas entrer dans I1 comme une simple pièce supplémentaire.

**Définition d'une pièce intégrée.** Pour chaque type retenu par M5.4 :

1. un profil C4 porte variantes, valeurs, sources, équipements et relations ;
2. l'intention peut demander la fonction et l'interpréteur déclaratif décide
   pièce, zone, composition ou absence sans branche impérative propre au type ;
3. le générateur la place dans plusieurs programmes et plusieurs graines, ou
   explique honnêtement `IMPOSSIBLE` / `NON_TROUVE` ;
4. murs, ouvertures, équipements, zones d'usage et parcours participent au
   verdict du plan construit ;
5. ses règles sont identifiables dans le rapport et son symbole est présent,
   raccordé, lisible et accompagné d'un libellé ;
6. questionnaire, comparaison, consentement M5.2, exports et rejeu de graine
   transportent la fonction sans la perdre ;
7. un test couvre réussite, refus, composition éventuelle, plusieurs graines,
   performance et absence de régression des pièces déjà actives.

**Ordre de livraison.** M5.4 choisit une ou plusieurs vagues et nomme la
version cible. Chaque vague est intégrée et auditée avant la suivante. Les
pièces non retenues ne disparaissent pas de la roadmap : elles gardent leur
lot, leur dépendance et un horizon explicite. Après gel de M6.0, aucune nouvelle
pièce n'entre dans la version évaluée sans créer une nouvelle version et un
nouveau corpus comparable.

### 6.3 — Matrice de parallélisation

| Pendant le lot moteur | Le flux canon peut | Le flux F peut | Point de convergence |
|---|---|---|---|
| **M0** | inventaire C0–C1 ; reprise des pilotes | — | format de suivi |
| **M1** | sourcing C2–C3 des vagues P0–P2 | **F0** (doctrine) | schémas versionnés |
| **M2** | tests isolés C4 pilotes / noyau | **F1** (annotation socle) | mobilier dans la boucle |
| **porte A rouge → reprise** | C-P0 gabarit ; doc L1 | **F1** sans toucher au générateur | témoin vert |
| **M3** | relations P2–P5 | **F2–F3** avec L1–L2 | topologies × fonctions |
| **M4 / S4**, puis **M4a–M4b** | intégration C5 | **F4** amorcé | plan construit meublé, topologies invariantes et géométrie polygonale |
| **M5** | préférences par profil | **F5** classify + scores | comparaison explicite |
| **M5.4** | auditer les écarts fiche → plan et choisir les vagues C-P3 à C-P6 | préparer F1–F3 sans mutation du corpus | périmètre I1 et version cible nommés |
| **I1** | conduire à C4 puis intégrer les profils retenus | activer FUNCTION / ZONE / SEPARATION nécessaires | chaque nouvelle pièce traverse le produit complet |
| **M6** | étalonnage C6 | **F6** micro si corpus le demande | retour du réel |

### 6.4 — Portes communes

Les trois flux restent indépendants entre deux portes. Une porte ne s'ouvre que
si toutes ses conditions sont vraies.

**Porte A — base fiable**

- tous les tests ciblés passent ;
- une commande exécute tests, schéma et banc fixe — **`npm run technohab:validate`**,
  qui enchaîne trente-trois tests ciblés — dont le schéma 3.0 — puis le témoin O0,
  le banc M3.0 actif de 19 plans (`M3_CIRCULATION_REFERENCE.json`), le banc
  topologique de 48 plans et le banc historique de 360 tentatives
  (`M0_BENCHMARK.json`) ;
- les chiffres de référence sont datés et rejouables.

**Ouverte le 26 août 2026.** Preuve : `node scripts/validate-m0.mjs`, référence
O0 `scripts/references/O0_REFERENCE.json`, photographie du banc
`scripts/references/M0_BENCHMARK.json`. La photographie consigne aussi la dette observée :
8 plans sur 360 déclenchent `TH2D-PROJECT-001`, tous dans le programme saturé
de 45 m² ; l'ouverture de la porte n'en fait pas une conformité.

**Refermée le 27 août 2026, après O3.** `npm run technohab:validate` s'arrête à
l'étape 10 sur 25 : `test-generation-contracts.mjs` attend `VALID` sur la graine
505001 et reçoit `INVALIDE_DEBUG`, sur deux violations `HARD` de
`TH2D-DOOR-004`. Cause identifiée, et elle est saine : `solveDoorOpening()`
tente l'ouverture hors de la pièce desservie, puis le coulissement, puis
l'ouverture dedans ; quand aucune des trois ne passe, il pose une coulissante de
repli avec `s3Passed = false` — un aveu explicite que `S3` n'est pas satisfaite.
Sur ce plan, les portes du WC et de la salle d'eau sont dans ce cas. Le test
avait été écrit avant que `S3` soit évaluée.

Trois issues, à trancher explicitement plutôt qu'à subir : refuser le plan et
faire réessayer le générateur — le plus juste, le plus cher ; abaisser le
`sliding-fallback` en `GUIDELINE`, ce qui rendrait `S3` non bloquante et
contredirait le socle ; ou prendre acte que cette configuration n'a pas de
solution d'ouverture et changer l'attente du test. Le message de la règle doit
en outre être corrigé dans tous les cas : il parle d'un débattement qui
recouvre une emprise, alors qu'il remonte ici une porte sans battant.

**Rouverte le 27 août 2026, après consolidation de M2 et livraison de M3.0.**
Le verdict `S3` distingue désormais l'impossibilité propre à la pièce de celle
causée par le battant ; le repli n'est plus masqué. La commande unique rejoue
les tests ciblés, O0, le banc M3.0 à 84 plans et le banc fixe à 360 plans.

**Refermée le 28 août 2026, après M3. Deux bancs sur trois échouent.**

1. **`measure-m3-topologies.mjs --check` diverge de sa photographie**, sur la
   seule ligne 90 m² : obtenu `hall 6 / barre 1 / jour-nuit 5`, attendu
   `5 / 3 / 4` ; familles `T` 11 contre 9 ; `candidatesComparedMean` 2,92
   contre 3. **Ce n'est pas du non-déterminisme** — trois exécutions
   successives rendent le même résultat au caractère près. C'est la
   photographie qui est périmée : elle date de 14:05, et le moteur a été
   modifié après elle — `squelette.js` 14:07, `rules.js` 14:29,
   `placement.js` 14:37, `generator.js` 14:44.
2. **`measure-m3-circulation.mjs --check` ne termine plus** : il lève
   `NON_TROUVE` sur une des 84 configurations du banc. Un banc de contrôle de
   100 plans à 90, 130, 180 et 250 m² passe intégralement ; la régression
   porte donc sur les **petites surfaces** — 45 et 60 m² — que ce banc de
   contrôle ne couvre pas.

**Le motif est le même qu'au 27 août, et c'est le point à corriger en
priorité** : le lot est livré, puis le témoin est rejoué. Deux livraisons de
suite refermant la porte A, ce n'est plus une inattention, c'est l'ordre des
opérations. Le rejeu et la republication des photographies doivent devenir la
**dernière** étape de tout lot, après la dernière touche au moteur.

**Rouverte le 29 août 2026, après M4.** La commande unique rejoue vingt-sept
tests ciblés — dont le schéma 3.0 —, O0, le banc M3.0 actif de 21 plans, le banc topologique
de 48 plans et la photographie historique de 360 tentatives. Cette dernière
rend désormais les échecs explicites : 23 `NON_TROUVE`, au lieu de les faire
sortir du script. M4 ajoute le refus S4 avant sélection, les poses canoniques
dans le BuiltPlan et le parcours global recalculé avec ces poses. La porte A
est donc ouverte sur le comportement courant, sans transformer la couverture
difficile des petites surfaces en conformité implicite.

**Porte B — contrats stables**

- les objets M1 sont versionnés et validés ;
- une valeur canonique transporte identifiant, unité, source, statut et
  portée ;
- WC séparé et salle d'eau intégrée atteignent C4 avec le même gabarit.

**Ouverte le 26 août 2026.** Les contrats sont versionnés ; le canon 1.0 porte
identifiant, version, unité, source, statut et portée ; `HARD/N3` exige doctrine
et justification. Les deux pilotes atteignent C4 sur le même gabarit : domaines
figés dans `scripts/references/C_P0_ENVELOPES.json`, cas passant et refus,
variantes, absorption, ouvrant et accès vérifiés par
`scripts/test-profils-pilotes.mjs`. Les dettes C5 restent attribuées à M2/M4 et
ne remettent pas en cause la preuve isolée.

**Porte C — génération crédible interne** *(seuil de release **V1**)*

- aucun plan présenté ne contient de violation `HARD` ;
- `IMPOSSIBLE` est distingué de `NON_TROUVE` ;
- murs, portes, mobilier et parcours ont participé au verdict ;
- au moins chambre, séjour, cuisine, WC et salle d'eau sont C4 ;
- **levier L2 tenu** : M3.0 livré — allonger la circulation n’est plus
  toujours net-positif dans `scoreCandidate` ; part de circulation publiée
  au banc ;
- le vocabulaire produit respecte [`DOCTRINE.md`](DOCTRINE.md) §1 bis
  (proposeur, pas auteur ; pas « agréable »).

**Porte D — outil utile** *(V1 enrichie, toujours hors « agréable »)*

- trois variantes réellement distinctes sont comparables ;
- chaque compromis renvoie à une préférence ou une convention identifiée ;
- l'utilisateur peut comprendre quoi changer lorsqu'aucune solution n'est
  trouvée ;
- **levier L1 amorcé** si des programmes &lt; 25 m² sont proposés : la
  stratégie n’est plus uniquement `ROOM_FIRST` (F4 au moins sur ces
  configurations).

**Porte E — crédibilité externe (levier L3)** *(entrée **cap post-V1**)*

- licence et séparation atelier/étalon du corpus résolues ;
- les règles sont passées sur des plans humains comparables ;
- la mesure à l'aveugle et la préférence par paires sont exécutées selon le
  protocole pré-enregistré ;
- **seul franchissement qui autorise** le vocabulaire « agréable » /
  « crédible au regard humain » / « auteur statistique » / « co-auteur »
  dans le produit ou la communication.

### 6.5 — Politique d'intégration d'un profil provisoire

Le développement parallèle impose de ne pas confondre « calculable » et
« consolidé ». **Cible du contrat M1 :** chaque plan et chaque export portent
la liste des profils utilisés avec leur maturité C0–C6 et la version du canon.

- un profil C0–C2 peut servir à la documentation et aux prototypes hors
  produit ;
- un profil C3 peut entrer dans une branche d'exploration du moteur ;
- un profil C4 peut apparaître dans l'interface avec la mention
  `expérimental` ;
- un profil C5 peut participer à une proposition dite crédible ;
- C6 autorise la calibration, mais ne transforme jamais une distribution
  observée en norme implicite.

Si un programme mélange plusieurs maturités, le plan prend la maturité de son
profil le plus faible. Cette règle empêche qu'un séjour bien consolidé masque
une buanderie encore décrétée.

### 6.6 — Ce qui est suspendu pendant M0 et M1

- nouvelles formes d'enveloppe au-delà des quatre présentes ;
- activation en production de nouvelles pièces C0–C2 ;
- nouveaux seuils `HARD` sans identifiant de valeur et statut de source. Un
  seuil **doctrinal** reste recevable — le projet en vit — à condition de
  porter identifiant, statut `N3` et portée, et de dire d'où il vient. C'est
  le cas du plafond de surface que O1 demande pour les pièces à agrément nul :
  le 90e centile mesuré entérinerait le défaut au lieu de le corriger, donc la
  valeur est convenue, et elle doit le dire ;
- connexion au moteur Graph2Plan ;
- polissage d'exports qui seront modifiés par les contrats M1.

La **documentation**, le sourcing, les essais isolés et la rédaction des
profils ne sont pas suspendus. C'est précisément le travail parallèle du flux
C.

### 6.7 — Première tranche exécutable

1. **[x] M0.1** — remettre la suite actuelle au vert, en commençant par
   `test-composition-model`, `test-contour` et `test-formes` ;
2. **[x] C-P0.1** — appliquer la grille C0–C6 au WC séparé et à la salle d'eau
   intégrée, sans déclarer leurs questions ouvertes résolues ;
3. **[x] M0.2** — ajouter une commande unique de validation et enregistrer le
   témoin de 360 plans ;
4. **[x] C-P1.1** — inventorier chambre, séjour et cuisine avec le gabarit
   pilote ; les trois profils sont publiés à C2 ;
5. **[x] M1.1** — écrire les contrats vNext et le statut des résultats, sans
   remplacer encore les poseurs ;
6. **[x] ouvrir la porte B** avant toute intégration supplémentaire ;
7. **[x] C-P0.2** — auditer l'intégration générique des deux pilotes : trajet
   construit prouvé, maintien C4 décidé et sept blocages C5 attribués ;
8. **[x] C-P1.2** — chambre, séjour et cuisine consolidés de C2 à C4, données
   canoniques et essais isolés branchés ;
9. **[x] C-P2** — circulation, seuil d'entrée et noyau rangement consolidés à
   C4, contrats, canon et essais génératifs branchés ;
10. **[x] M5.1** — brancher `PlanSelection` dans le produit et rendre les trois
   compromis comparables ;
11. **[x] M5.2a–e** — livrer la politique, les contrats, l'orchestration, la
   sélection avec réemploi et le consentement selon
   [`RESOLUTION_PROGRAMME.md`](RESOLUTION_PROGRAMME.md), sans modifier les
   statuts M1 ni relâcher une règle `HARD` ;
12. **[x] M5.2f** — mesurer la résolution graduée et publier ses concessions ;
13. **[ ] M5.3** — prototype technique conservé mais gelé ; ne pas le compter
    comme capacité produit ni le reprendre avant décision explicite ;
14. **[ ] M5.4** — mener l'audit amont piloté, traduire les observations en
    conséquences métier et refondre l'ordre de la roadmap ;
15. **[ ] I1** — intégrer les vagues de pièces retenues par M5.4 jusqu'au plan
    affiché et exporté, ou consigner explicitement leur report après M6 ;
16. **[ ] M6.0** — pré-enregistrer le protocole externe après M5.4 et la
    décision I1, avant de
    collecter ou de consulter le corpus étalon.

## Annexe A — ancien découpage technique

Cette annexe conserve le découpage antérieur pour retrouver les décisions et
les cases déjà cochées. Elle n'est plus l'ordre de pilotage : en cas de
contradiction, les flux, lots et portes du §6 font foi.

### Phase 0 — Intégration autonome ✅

- [x] intégrer l'application dans Wonderland ;
- [x] isoler ses scripts et ses styles ;
- [x] restaurer une régénération effective ;
- [x] fournir une première couche de règles et d'exports.

### Phase 1 — Formes d'enveloppe

- [x] ajouter `shape` au questionnaire et au schéma *(18 août)* ;
- [ ] séparer forme, orientation et priorité — l'orientation reste absente ;
- [x] remplacer la frontière largeur / hauteur par une liste de volumes,
  pavant exactement la surface *(18 août)* ;
- [x] adapter le rendu SVG — fond en contour, façades sur polygone *(18 août)* ;
- [x] générer et contrôler carré, rectangle, L et U *(18 août)* ;
- [ ] forme « Souple » (additive) et tirage `random` ;
- [x] tests (`test-formes.mjs`) et repli explicite quand la forme est
  intenable *(18 août)* ;
- [ ] écrire `TH2D-BOUNDARY-001` à `007`, `009` et `010` — seule `008` existe.

### Phase 2 — Questionnaire piloté par un schéma

- [ ] sortir la définition des champs de `index.html` ;
- [ ] définir pour chaque option sa valeur, son aide, ses dépendances et ses
  incompatibilités ;
- [ ] séparer options simples et options avancées ;
- [ ] valider le questionnaire avant d'appeler le générateur ;
- [ ] versionner le schéma et migrer le stockage local.

### Phase 3 — Programme et graphe éditables

- [ ] enrichir le catalogue de pièces ;
- [ ] distinguer relations obligatoires, souhaitées et interdites ;
- [ ] permettre de visualiser puis modifier le graphe avant génération ;
- [ ] intégrer orientation, façade et entrée dans les relations ;
- [ ] expliquer les relations ajoutées automatiquement par le moteur.

### Phase 4 — Génération multi-stratégies

Précédée par le chantier 2, qui traite les défauts mesurés au §3.2 sur
l'enveloppe rectangulaire actuelle.

- [ ] exposer une graine explicite par génération, exportée et rejouable ;
- [ ] remplacer les 96 tentatives fixes par un budget adaptatif ;
- [ ] désancrer le séjour et rééquilibrer les tirages de coupe ;
- [ ] séparer génération d'enveloppe et placement des pièces ;
- [ ] conserver la découpe récursive pour les cas simples ;
- [ ] ajouter une stratégie de pavage orthogonal pour les enveloppes libres ;
- [ ] conserver plusieurs solutions valides et différentes ;
- [ ] mesurer la diversité réelle des variantes et refuser les doublons ;
- [ ] suivre le taux de conformité par taille de programme, en régression
  contre les valeurs du §3.2.

### Phase 5 — Référentiel de règles

Point de départ : `technohab_rules.md` (dépôt de développement) recense déjà
les 71 règles cible des packs `P0` à `P6` et les 6 réellement évaluées, avec
l'analyse de ce qui est portable vers le moteur actuel et de ce qui suppose
une géométrie de murs.

- [x] recenser et comparer les deux référentiels ;
- [ ] créer un registre unique des règles, chargé en données plutôt que codé
  en dur dans `rules.js` ;
- [ ] distinguer `HARD`, `GUIDELINE` et `PREFERENCE` ;
- [ ] documenter unité, seuil, source et portée de chaque règle ;
- [ ] trancher la contradiction du §3.1 avant d'appliquer le filtre `HARD` ;
- [ ] empêcher l'affichage d'une proposition en échec `HARD` ;
- [ ] afficher les compromis ayant départagé les candidats ;
- [ ] porter les règles identifiées comme accessibles sans modéliser les
  murs : bornes maximales de surface, adjacence interdite WC / séjour,
  regroupement des pièces d'eau, éloignement bruyant / calme ;
- [ ] documenter les règles satisfaites par construction — le découpage
  guillotine ne produit que des rectangles à angles droits, ce qui rend
  plusieurs contrôles géométriques sans objet plutôt que non implémentés.

### Phase 5 bis — Fiabilité, tests et restitution visuelle

Chantier transversal, ouvert par l'audit du 15 août. Il ne dépend d'aucune
autre phase et conditionne la confiance dans toutes les suivantes.

- [x] protéger la génération contre une exception non rattrapée : l'échec
  s'affiche désormais au lieu de figer l'interface sans message ;
- [x] protéger le parcours d'accessibilité contre l'absence de séjour ;
- [x] répartir l'écart d'arrondi des surfaces au prorata des pièces plutôt
  que de le concentrer sur le séjour ;
- [x] `role="img"` sur le plan et fond décoratif retiré du parcours lecteur ;
- [ ] créer une suite de tests : cas limites de surface, programme maximal,
  studio, contournement des bornes du formulaire, absence de `localStorage` ;
- [ ] découpler le seuil de contact `0.012` de la précision d'arrondi, ou
  documenter explicitement leur dépendance ;
- [ ] indiquer dans l'interface le périmètre réel du contrôle, pour ne pas
  laisser croire à une conformité réglementaire complète ;
- [x] produire la planche d'icônes de pièces puis la vectoriser selon
  `DA_ICONES_PLAN.md` — la planche a servi de référence de tracé, mais la
  vectorisation par `potrace` a été écartée (cf. `DA_ICONES_PLAN.md` §3) ;
- [x] câbler les symboles dans le rendu du plan, sous le libellé déjà réduit.

### Phase 6 — Comparaison et restitution

- [ ] proposer plusieurs variantes côte à côte ;
- [ ] afficher les scores par critère sans score global trompeur — le moteur
  ne produit aujourd'hui qu'un scalaire unique, où pénalité d'adjacence,
  pénalité de proportion et biais de priorité sont additionnés sans être
  distinguables, ce qui rend l'effet de chaque règle illisible ;
- [ ] afficher la graine de la variante affichée ;
- [ ] permettre de verrouiller une caractéristique puis régénérer ;
- [ ] expliquer pourquoi une demande est impossible ;
- [ ] enrichir les exports avec questionnaire, graphe, règles et métriques.

### Phase 7 — Connexion au moteur d'origine

- [ ] obtenir le dépôt, les données et les poids Graph2Plan requis ;
- [ ] documenter l'environnement Python, PyTorch et MATLAB ;
- [ ] définir un contrat d'API versionné ;
- [ ] convertir l'enveloppe vectorielle en masque d'entrée ;
- [ ] isoler le moteur distant derrière un adaptateur ;
- [ ] prévoir le repli local si le service n'est pas disponible ;
- [ ] comparer les sorties locales et Graph2Plan sur un jeu de référence.

### Phase 8 — Publication et mises à jour

- [ ] choisir l'hébergement de Wonderland et du service éventuel ;
- [ ] publier d'abord la version statique 2D ;
- [ ] conserver TechnoHab sous la même racine et dans son propre dossier ;
- [ ] ajouter une vérification automatisée avant publication ;
- [ ] documenter le processus de mise à jour et de retour arrière ;
- [ ] ajouter une version visible et un journal des changements TechnoHab.

### Phase 9 — Cheminement et accès

Tracer le parcours réel qui dessert le logement, de l'entrée à chaque pièce,
en passant par chaque accès franchi. Direction artistique et vocabulaire
graphique : [`DA_CHEMINEMENT_PLAN.md`](DA_CHEMINEMENT_PLAN.md).

En deux temps, et l'ordre importe : le chemin est d'abord un **révélateur**,
il devient ensuite une **contrainte**. Calculé a posteriori, il montre où la
découpe en guillotine produit des dessertes absurdes — c'est le même
mouvement que le §3.2, mesurer avant de corriger. Ce n'est qu'ensuite qu'il
peut entrer dans la génération.

**9 a — a posteriori, sur un plan déjà généré**

- [ ] produire la planche de marqueurs (prompt `DA_CHEMINEMENT_PLAN.md` §2)
  puis `assets/icons/route-markers.svg` ;
- [ ] trancher les quatre questions de `DA_CHEMINEMENT_PLAN.md` §4 : graphe
  d'appui, point d'ancrage dans la pièce, métrique, traversées interdites ;
- [ ] calculer l'arbre de desserte depuis l'entrée et le tracer sur
  `#plan-svg`, marqueurs posés aux nœuds et aux franchissements ;
- [ ] mesurer sur les configurations du §3.2 : pièces non desservies,
  longueur du parcours, nombre de franchissements, traversées de pièces
  privatives — publier les chiffres avant toute correction du moteur ;
- [ ] `TH2D-PATH-001` — toute pièce est atteinte depuis l'entrée, bloquant ;
- [ ] `TH2D-PATH-002` — aucune desserte ne traverse une chambre, une salle
  d'eau ou un WC, bloquant.

**9 b — a priori, dans la génération**

- [ ] intégrer le coût de cheminement à `scoreCandidate()` ;
- [ ] puis, selon l'issue retenue au §3.1, en faire une contrainte de
  construction plutôt qu'un critère de score — un layout dont le parcours
  est fautif n'est pas un layout moins bon, c'est un layout faux.

**Dépendance à la Phase 10.** Tant que les portes ne sont pas modélisées, le
cheminement s'appuie sur les adjacences, donc sur l'hypothèse que toute
mitoyenneté est franchissable. C'est faux et cela sera relevé dans les
mesures de 9 a. La phase 9 a reste utile sous cette réserve, à condition de
l'écrire dans l'interface plutôt que de laisser croire à un parcours réel.

### Phase 10 — Dynamique des portes

Modéliser l'accès comme un objet du plan, directement dans le moteur, et non
comme un simple contact entre deux rectangles. Un accès porte une largeur,
un type et un sens ; c'est ce qui rend le cheminement de la phase 9 véritable.

**Cotes — proposition initiale et ajustement**

La proposition de départ était : simple 0,90–1,10 m, double 2,00–3,00 m.
Confrontée aux blocs-portes du marché français et aux minima
d'accessibilité, elle demande trois corrections.

| | Proposé | Retenu | Motif |
|---|---|---|---|
| Simple, mini | 0,90 | **0,83** | baie de 0,83 = vantail 0,73, le bloc courant des chambres et pièces d'eau ; 0,90 l'aurait interdit |
| Simple, maxi | 1,10 | **1,05** | le plus large bloc-porte standard est un vantail 0,93, soit une baie de 1,03 ; au-delà, plus rien au catalogue |
| Double, mini | 2,00 | **1,46** | une double 2 × 0,73 fait 1,46 de baie ; entre 1,05 et 2,00 la proposition laissait un trou où tombent toutes les portes à deux vantaux réelles |
| Double, maxi | 3,00 | **3,00** | conservé : au-delà de ~2,40 il s'agit d'une baie libre ou d'une menuiserie coulissante, pas d'une porte — d'où le type distinct |

Deux points à trancher explicitement, la proposition initiale ne les
distinguant pas :

- **Baie ou passage utile.** Les cotes ci-dessus sont des **largeurs de baie**
  — ce que le moteur perce dans le mur. La réglementation, elle, porte sur le
  **passage utile**, mesuré vantail ouvert : environ 6 cm de moins. Une baie
  de 0,83 donne 0,77 utile, ce qui est le minimum admis pour les pièces de
  l'unité de vie ; la porte d'entrée demande 0,83 utile, donc une baie de
  0,90. Les deux valeurs doivent coexister dans le modèle : l'une se dessine,
  l'autre se contrôle.
- **« 2 places » comme gabarit ou comme menuiserie.** Si l'intention est de
  laisser passer deux personnes de front, 1,20 m suffit — c'est déjà la
  largeur libre imposée aux circulations par `TH2D-CIRC-001`, et 2,00 m
  serait très surdimensionné. Si l'intention est la baie de séjour ou la
  porte-fenêtre, alors 1,46–3,00 est la bonne plage. Ce sont deux besoins
  différents ; les confondre dans un seul couple de bornes produirait des
  plans où chaque passage est traité comme une baie.

**Travaux**

- [ ] modéliser l'accès : `{ id, entre deux pièces, type, largeur de baie,
  passage utile, sens et côté d'ouverture }` ;
- [ ] cinq types alignés sur la légende de `DA_CHEMINEMENT_PLAN.md` : porte
  simple, porte double, baie libre, porte coulissante, porte d'entrée ;
- [ ] placer les accès sur les murs mitoyens, la position devenant une
  variable de génération et non un centre par défaut ;
- [ ] `TH2D-DOOR-001` — passage utile ≥ 0,77 m, et ≥ 0,83 m pour la porte
  d'entrée, bloquant ;
- [ ] `TH2D-DOOR-002` — le débattement du vantail ne bute sur aucun mur ni
  sur un autre vantail, bloquant ;
- [ ] `TH2D-DOOR-003` — largeur de baie prise dans les cotes retenues
  ci-dessus, conseil, pour signaler le sur-mesure sans l'interdire ;
- [ ] tracer les accès sur `#plan-svg` à leur cote réelle, arc de débattement
  compris — jamais depuis un symbole étiré, cf. `DA_CHEMINEMENT_PLAN.md` §1.1 ;
- [ ] reprendre le cheminement de la phase 9 sur ce graphe d'accès, une
  mitoyenneté sans porte cessant alors d'être un passage.

### Phase 11 — Agencement : du gabarit au meuble posé

Doctrine, chaîne d'artefacts et mesures :
[`DOCTRINE_AGENCEMENT.md`](DOCTRINE_AGENCEMENT.md). Le principe tient en une
ligne — **ce qui est cher se calcule hors ligne et une fois, ce qui est
fréquent se lit** — et il conditionne l'ordre des travaux ci-dessous.

**11 a — le gabarit dans la boucle** *(socle, solveur et cache déjà produits)*

- [x] socle transcrit en donnée exécutable, `assets/socle.data.js` ;
- [x] algorithmique de placement unique dans `assets/placement.js`, consommée
  par le navigateur et par le runner hors ligne ;
- [x] cache chaud des domaines de faisabilité,
  `npm run fit:build` → `assets/fit.data.js`, régénéré sans changement d'octet
  lors de l'extraction ;
- [x] oracle de non-régression des 13 préréglages, `npm run fit:test` ;
- [x] mesure de référence sur 1 640 pièces : moins de 0,2 % hors gabarit,
  ce qui infirme le pronostic initial — voir `DOCTRINE_AGENCEMENT.md` §5 ;
- [x] le mobilier obligatoire tient dans le rectangle utile via
  `TH2D-ROOM-002` ; conserver `TH2D-FURN-001` comme nom cible créerait un
  doublon de règle, donc le registre futur devra trancher l'identifiant ;
- [x] intégrer le coût d'agencement à `scoreCandidate()`, pour qu'une pièce
  largement meublable soit préférée à une pièce tout juste suffisante ;
- [ ] trancher l'incohérence du gabarit WC relevée au §6 de la doctrine :
  0,90 × 1,30 annoncé, 0,70 × 1,50 imposé par les cotes du socle lui-même ;
- [x] prendre en compte le passage de 1,20 m entre linéaires opposés de
  cuisine, aujourd'hui absent du solveur.

**11 b — le placement effectif**

- [x] faire rendre au solveur navigateur les coordonnées, les zones d'usage
  et l'équipement expliquant un refus ;
- [x] raccorder ces coordonnées à chaque pièce du plan retenu ; les poses
  canoniques voyagent dans le BuiltPlan et sont consommées par le rendu ;
- [x] choisir la variante et le schéma d'aménagement par la graine, pour
  qu'un même plan rejoué donne le même ameublement ;
- [ ] inliner `furniture.svg` et tracer les emprises, option d'affichage
  désactivée par défaut — **les 28 assets existent mais aucun code de rendu
  ne les consomme encore** ;
- [ ] effacer le pictogramme de pièce dès que le mobilier est posé, les deux
  faisant doublon — `composeRoomContent()` gère déjà cette dégradation ;
- [ ] afficher la réserve tant que les portes n'existent pas : le mobilier
  est posé sans savoir où arrivera la porte.

**11 c — après les portes**

- [x] `S3` du socle — le débattement épargne emprises et dégagements requis ;
- [x] `S4` du socle — chemin continu de la porte à chaque zone d'usage, ce
  qui est le cheminement de la phase 9 à l'échelle de la pièce.

### Phase 12 — Défauts bloquants, mesure, extension du programme

Suivi d'exécution des chantiers 5, 6 et 7. Le détail — lots, dépendances,
tests, définition de terminé — vit dans ces chantiers ; cette phase n'en est
que la case à cocher.

**12 a — les trois défauts** *(chantier 5)*

- [x] D1 — contact façade dans `scoreCandidate()`, règle `TH2D-ENTREE-001`,
  et pénalité de façade des pièces principales, découverte en mesurant D1 :
  `TH2D-FACADE-001` passe de 39 à 2 violations sur 720 plans *(18 août)* ;
- [x] D2 — contour unifié au dessin, rectangle utile = union quand les parties
  la pavent : 176 pièces sur 530 retrouvent 623 m² meublables *(18 août)* ;
- [x] D3 — fusion traitée comme composition, `room-model.js` + `composeInto()`
  + `TH2D-ROOM-002` étendue + `test-fusion.mjs` *(18 août)* ;
- [x] D4 — banc rejouable : graine fixe par défaut, `--seed=<n>`, `--random`
  étiqueté comme non rejouable, et empreinte des résultats hors durées
  *(18 août)*.

**12 b — mesure de la qualité perçue** *(chantier 6)*

- [ ] quiz embarqué et journal local exporté ;
- [ ] test de l'instrument par un plan d'architecte passé au banc ;
- [ ] première mesure de discrimination à l'aveugle — **elle ouvre 12 c**.

**12 c — extension du programme** *(chantier 7, lots L1 à L7)*

- [x] arbitrages d'entrée : salle à manger, dressing, rangement, bureau —
  **clos le 26 août** dans `DECISIONS_PROGRAMME.md` ; généralisés le 27 août
  par [`DOCTRINE.md`](DOCTRINE.md) ;
- [ ] L1 — bureau, entrée *(lot pilote : livre la mécanique d'activation —
  désormais aussi l’interpréteur `trigger` / FUNCTION, avec F2)* ;
- [ ] L2 — salle à manger, cellier *(livre la zone désignée et l'adjacence
  typée — avec F3)* ;
- [ ] L3 — buanderie, local technique *(livre les réseaux)* ;
- [ ] L4 — suite parentale *(premier programme composé)* ;
- [ ] L5 — garage, sas d'entrée ;
- [ ] L6 — studio, cuisine ouverte, coin repas, coin bureau, variantes de chambre
  *(réutilise F2–F5 ; ne réécrit pas la fusion studio déjà correcte)* ;
- [ ] L7 — extérieurs, multi-niveaux, annexes *(changement de modèle, pas
  extension)*.

**12 d — flux F** *([`DOCTRINE.md`](DOCTRINE.md), §6.2 bis)*

- [x] F0 — doctrine globale + glossaire + intégration roadmap (§6.1 ter) ;
- [x] trois leviers d’agrément tranchés (§6.0, `DOCTRINE.md` §2 bis) ;
- [ ] F1 — annotation `capabilities[]` / `requiredCapabilities` (sans
  changement de génération) ;
- [ ] F2 — résolution FUNCTION + OR d’équipements (avec L1) ;
- [ ] F3 — ZONE + SEPARATION minimal (avec L2) ;
- [ ] F4 — SPACE_PRESSURE + stratégies (**levier L1**, après M3.0 / S4 / M3) ;
- [ ] F5 — TIME_MODE, transformables, `classify()` ;
- [ ] F6 — partition post-placement bornée aux programmes critiques.

**12 e — levier L2 (barème)**

- [x] M3.0 — pénalité de longueur de desserte ; recalibrage ou suspension de
  `TH2D-CIRC-004` ; part de circulation publiée au banc *(prérequis M3)*.
- [x] M3 — cinq stratégies interchangeables ; réseau de circulation ramifié ;
  graphe obligatoire tenu par construction ; relations typées O4.
- [x] M4 — poses canoniques, `S4` HARD et parcours meublé dans le BuiltPlan.
- [x] M4a — symétries D4 canoniques, classes d'équivalence, contrat et test
  métamorphique ; coût N3 de façade distinct de l'entrée et première famille
  de terminaison intérieure après M4b (§6.1 quinquies).

### Phase 13 — Murs dimensionnés et surfaces utiles

Transformer les séparations sans épaisseur en objets constructifs mesurables.
Le cadrage, les décisions, le schéma cible, les règles et les critères de
réception vivent dans [`MURS_EPAIS.md`](MURS_EPAIS.md).

Le MVP conserve la partition actuelle comme source de génération. Il en
dérive ensuite les murs, leurs faces intérieures et les surfaces utiles : il
ne commence ni par une réécriture du générateur ni par un modèle BIM complet.

**Dépendances :** D2 (union réelle des parties), portes et fenêtres stables,
parcours rejouable et banc de tests à graines fixes.

**13 a — MVP géométrique**

- [x] M1 — référentiel unique des murs intérieurs et extérieurs, avec
  épaisseurs configurables ;
- [x] M2 — contours intérieurs, surfaces utiles et conservation explicite
  `emprise brute = surfaces utiles + murs` ;
- [x] préserver la surface habitable demandée en calculant séparément
  l'emprise extérieure ;
- [x] règles `TH2D-WALL-001` à `TH2D-WALL-004` et tests des rectangles,
  pièces en L, angles et jonctions en T.

**13 b — MVP fonctionnel**

- [x] M3 — portes et fenêtres rattachées à un mur et à une réservation ;
- [x] M4 — mobilier ancré sur les faces intérieures, parcours bloqué par les
  murs hors ouvertures et recalculé avec les emprises avant publication ;
- [x] règle `TH2D-WALL-005` sur le confinement des ouvertures ;
- [x] règle `TH2D-WALL-006` sur les équipements muraux ;
- [x] recalculer `TH2D-ROOM-002` sur la géométrie intérieure utile.

**13 c — livraison**

- [x] M5 — murs rendus comme surfaces, ouvertures découpées, distinction des
  surfaces dans l'interface et l'export ;
- [x] versionner le schéma JSON et préserver la lecture des anciens exports ;
- [x] valider les 24 configurations de référence sur plusieurs graines ;
- [x] publier les écarts avant/après : surface utile, meublabilité,
  cheminement, violations et emprise extérieure.

**Après le MVP seulement :** systèmes constructifs détaillés, murs porteurs,
performances thermique/acoustique/feu, quantitatifs, coût, carbone et
continuité verticale. Ces sujets ne doivent pas ralentir les lots M1 à M5.

## 7. Définition d'une génération valide

Une proposition peut être affichée uniquement lorsque :

- le questionnaire est complet et cohérent ;
- la surface disponible accepte les minima du programme ;
- l'enveloppe satisfait toutes les règles `BOUNDARY` ;
- chaque pièce respecte sa surface et ses dimensions minimales ;
- toutes les pièces sont contenues, accessibles et sans chevauchement ;
- toutes les adjacences obligatoires sont réalisées ;
- aucun espace résiduel inexpliqué ne subsiste ;
- le rapport de contrôle ne contient aucune violation `HARD`.

Si aucun candidat n'est valide, le moteur n'affiche pas « le moins mauvais » :
il explique quelles contraintes empêchent la génération et quelles réponses du
questionnaire peuvent être ajustées.

**Cette définition n'est pas encore tenue.** Le moteur affiche aujourd'hui le
meilleur candidat du budget, y compris en violation `HARD` — voir §3.1. Cette
section décrit donc une cible, pas l'état du code, et le lever suppose de
trancher entre filtre dur, synthèse guidée et reclassement des niveaux.

## 8. Journal des décisions

### 15 août 2026 — Forme de la maison

- trois modes retenus : `square`, `rectangle`, `freeOrthogonal` ;
- la liberté concerne d'abord l'enveloppe extérieure ;
- les pièces restent rectangulaires dans la première version libre ;
- les trous et patios sont reportés ;
- forme et priorité deviennent deux dimensions indépendantes ;
- le polygone orthogonal devient la représentation commune des enveloppes.

### 15 août 2026 — Moteur d'origine

Le prototype ne doit pas se présenter comme Graph2Plan. La connexion au moteur
d'origine reste un chantier séparé tant que son code, ses données et son
environnement d'exécution ne sont pas fournis.

### 15 août 2026 — Audit du moteur et nature du générateur

Le moteur JavaScript n'est ni un portage du dépôt Python, ni le « repli
procédural » annoncé par celui-ci : c'est une réinvention parallèle, plus
simple, qui respecte la chaîne programme / graphe / géométrie / règles mais
remplace la synthèse sous contraintes par un échantillonnage noté. Le nommer
correctement évite de surestimer ses garanties.

Décisions prises :

- le respect du graphe est un critère de score, pas une garantie, et cela
  doit être écrit partout où le niveau `HARD` pourrait le laisser croire ;
- les correctifs de fiabilité sans effet fonctionnel sont appliqués
  immédiatement, sans attendre une phase ;
- l'écart initial entre 6 règles évaluées et 71 règles cible est documenté
  plutôt que masqué ; le profil en évalue désormais 16, sans prétendre que
  l'écart au référentiel est refermé.

### 15 août 2026 — Restitution du contrôle et icônes

Le rapport de règles devient traçable : chaque génération inscrit au journal
son profil, le nombre de règles évaluées, les bloquantes, les conseils et le
candidat retenu. Un contrôle qui ne laisse pas de trace ne peut pas être
audité.

Les libellés de pièces sont réduits pour laisser place à un pictogramme par
fonction, tracé selon la même chaîne que l'illustration de la micro-ferme —
génération d'une planche unique, seuillage, vectorisation, compaction.

La chaîne a été suivie jusqu'au seuillage puis abandonnée : `potrace` trace
des contours et non des traits, ce qui aurait figé l'épaisseur et interdit la
teinte par famille de pièce. La planche reste la référence de dessin, les
18 symboles sont retracés en géométrie directe, et le pictogramme s'efface
avant la surface quand la pièce ne peut plus le porter — un plan illisible
serait un moins bon plan qu'un plan sans symbole.

### 15 août 2026 — Diversité, graine et circulations

Les mesures du §3.2 ont établi que l'impression de répétition ne venait pas
du tirage aléatoire mais d'un ancrage structurel du séjour, et que les
circulations pouvaient descendre à 0,58 m de large sans qu'aucune règle ne
s'en émeuve.

Décisions prises :

- la graine devient une donnée visible et exportable du plan, ce qui rend
  une génération mémorisable et rejouable sans la stocker ;
- le nombre de tentatives devient un budget adaptatif, la taille du
  programme ne justifiant pas un effort constant ;
- la diversité entre variantes devient un critère mesuré, une variante trop
  proche d'une précédente n'étant pas une variante ;
- la largeur libre minimale des circulations est fixée à 1,20 m et contrôlée
  par une règle bloquante, au-delà du mètre du référentiel d'origine ;
- le chantier 2 passe avant le chantier 1, ces défauts existant déjà sur
  l'enveloppe rectangulaire et une enveloppe libre ne pouvant que les
  amplifier.

### 15 août 2026 — Rangement, réserve et forme des pièces

La circulation restait surdimensionnée : une largeur maximale la ramène à
des proportions de couloir mais ne libère pas la surface, qui se contente de
changer de forme. Le surplus doit donc être cédé, pas contraint.

Décisions prises :

- le surplus de circulation devient du rangement attribué aux pièces
  longées, par cession et non par création, ce qui conserve la couverture
  complète du plan ;
- une pièce cesse d'être un rectangle et devient une liste de rectangles,
  ce qui maintient tout le moteur en arithmétique de rectangles plutôt que
  d'imposer une géométrie polygonale ;
- un rangement a une profondeur comprise entre 0,45 m et 0,6 fois sa
  longueur, ce qui garantit qu'il reste une bande et jamais une pièce ;
- une chute hors bornes devient une réserve, attribuée selon les besoins de
  surface du programme, jamais laissée orpheline ;
- ni le rangement ni la réserve ne sont des nœuds du graphe, sous peine
  d'aggraver le problème de degré du §3.3 ;
- les contrôles de proportion se mesurent désormais sur le rectangle utile
  et non sur la boîte englobante, un rapport de forme n'ayant pas de sens
  sur une forme en L.

### 15 août 2026 — Socle d'agencement

Le moteur doit tendre vers la vérification par le contenu : un plan n'est
plus plausible ou non, il est meublable ou non, parcourable ou non.

Décisions prises :

- l'accessibilité se traite en **unité de vie partielle** — un noyau adapté
  plutôt qu'un logement entier, ce qui garde les petits programmes viables ;
- le mobilier est **dessiné, avec bascule d'affichage** : le plan reste
  lisible nu et prouve son ameublement quand on le demande ;
- les cotes sont portées en **deux colonnes**, la valeur assumée par le
  projet et la source réglementaire présumée à confirmer — aucune valeur
  réglementaire n'est citée comme vérifiée ;
- le socle couvre le **catalogue complet**, les six types du MVP y étant
  marqués, pour ne pas reprendre le document à chaque extension ;
- le socle est une **donnée**, chargée en JavaScript ou JSON, jamais en
  YAML : le moteur tourne en `file://` sans analyseur externe ;
- l'intégration démarre en **validation après coup**, la contrainte de
  découpe n'étant décidée qu'au vu des taux d'échec mesurés.

### 15 août 2026 — Solveur navigateur et audit consolidé

L'algorithmique de placement vit désormais dans un seul script classique,
consommé par Node et par le navigateur. L'extraction conserve `fit.data.js`
octet pour octet ; le cache n'est plus confondu avec l'autorité. La première
suite compare 13 préréglages et 15 variantes au solveur partagé.

Le raccord graphique n'est en revanche pas fait : `furniture.svg` reste une
planche d'assets sans consommateur dans le rendu du plan. Un verdict de
composition libre n'est pas encore un plan meublé.

L'audit déterministe du §3.5 fixe les priorités :

- distinguer les refus de programme (`PROJECT-001`, `ROOM-001`) des échecs
  de synthèse (`GRAPH-001`, `CIRC-003`) ;
- ne pas confondre la fréquence de `RANGEMENT-003` avec un blocage, puisque
  cette règle est un conseil ;
- traiter le WC en façade comme un biais générationnel mesuré à 95 %, sans
  inventer une interdiction architecturale non sourcée ;
- suivre séparément l'adjacence directe WC / séjour, relevée dans 23,3 % des
  plans comportant un WC.

### 16 août 2026 — Quinze décisions sur les règles

Les réponses à `QUESTIONS_MODELE.md` puis à `DECISIONS_REGLES.md` arrêtent le
traitement du référentiel. Elles sont **indépendantes de la méthode de
génération** — douze des quatorze survivent à un changement de moteur, ce
qui autorise à les traiter sans attendre la décision de fond.

Décisions retenues :

- la circulation devient **une règle mère à quatre sous-codes**, gardant la
  lecture du motif d'échec sans quatre lignes au rapport ;
- les règles jamais violées passent en **mode diagnostic**, hors usage
  courant ;
- le niveau **préférence devient agissant** : il porte les priorités
  utilisateur, lues et pondérées par le score ;
- tout échec expose **cause, écart, graine et questionnaire**, dans un
  journal exportable — un échec devient une donnée rejouable ;
- les règles hors de portée du moteur sont **tolérées et marquées**, jamais
  évaluées ;
- la couverture complète devient un **invariant géométrique préalable** : un
  plan troué n'est pas évalué, car les autres règles n'auraient plus de sens ;
- **la meublabilité fait foi**, la surface minimale n'étant plus qu'un filtre
  bon marché ;
- les seuils deviennent **contextuels par classe de logement**, alignées sur
  les typologies ;
- les **poids se déduisent des équipements**, majorés d'un coefficient
  d'agrément assumé et nommé ;
- chaque violation porte une **gravité**, qui trie le rapport et pondère le
  score ;
- en cas de désaccord entre source et calcul, **la plus exigeante l'emporte**,
  en disant laquelle ;
- **garantir en usage courant, tout vérifier au banc** : un garant non
  vérifié se dérègle sans bruit ;
- `TH2D-FORME-001` est **déclassée en test** et non supprimée — sa garantie
  tient à la construction actuelle des décrochements, et disparaîtrait avec
  un changement de méthode ;
- un plan conforme est affiché, l'inconfort signalé en conseil ;
- un refus désigne **la règle puis la correction actionnable**, ce qui
  suppose de savoir modifier un plan sans le régénérer — objectif, non acquis.

**Ce que ces décisions valent.** Appliquées, elles font passer le référentiel
de quatorze conventions sur quinze règles à deux ou trois. C'est le mouvement
de fond du projet : remplacer ce qui est décrété par ce qui est calculé.

### 16 août 2026 — Le biais d'adjacence

Une adjacence est déclarée réussie dès 0,24 m de mur commun. Une porte
intérieure en demande environ 1,00 m — vantail plus tableaux. **9,2 % des
adjacences comptées comme réussies ne peuvent porter aucune porte.**

Correction retenue : **deux constantes, non une**. `MIN_OVERLAP` reste à
0,24 m comme seuil géométrique de contact ; un seuil de **desserte** à
1,00 m s'y ajoute, et lui seul est consulté par `TH2D-GRAPH-001`.

Relever `MIN_OVERLAP` aurait été le remède évident et le mauvais : il sert
aussi à `borderingRooms`, qui détermine quelles pièces bordent le couloir.
Le relever aurait cassé la cession des rangements, un côté cessant d'être
entièrement bordé.

Conséquence assumée : **les taux de conformité vont se dégrader.** C'est
l'objet même de la correction — le témoin du banc d'essai est aujourd'hui
surévalué, et aucune comparaison de méthodes ne vaudrait rien sur cette base.

---

### 26 août 2026 — L'ordre de décision passe devant l'extension

Une doctrine détaillée du WC séparé a été confrontée au moteur pour décider si
elle entrait dans `SUIVI_REGLES_PIECES.md`. Elle n'y entre pas encore, et pour
une raison qui vaut décision : **l'écart mesuré n'était pas dans la fiche de la
pièce, il était dans l'ordre dans lequel le moteur décide.** Le WC est programmé
à 7,3 m² dans une maison de 250 m², et réalisé jusqu'à 14,86 m² en L. Corriger
le WC seul aurait déplacé le défaut sur la pièce suivante.

Trois mesures ont tranché l'arbitrage entre corriger et réécrire :

- la génération consomme 28,7 ms sur un plafond de 110 — **74 % de marge
  inutilisée** ;
- `scoreCandidate()` n'est appelé que 1 à 5 fois par plan : il n'y a plus de
  recherche à départager ;
- `placement.validate()` coûte 0,08 à 0,75 ms par pièce, contre 1,1 à 88 ms
  pour `optimize()`. Valider le mobilier d'un plan entier coûte ~1,5 ms.

Le moteur n'est donc pas trop lent pour bien faire : il décide de la surface
avant de savoir si elle sert à quelque chose. **Pas de réécriture.** Le solveur
d'équipements, le compilateur d'enveloppes et le moteur de règles sortent
indemnes du diagnostic ; c'est l'orchestration — allocation et boucle — qui est
faible. Le chantier 9 la reprend, dans cet ordre : instrument, allocation,
objectif, porte, adjacences, puis les polygones seulement s'ils restent
nécessaires une fois les cessions de bande refusées aux pièces sans agrément.

**Rejeu du 26 août au soir, après M0.** Les correctifs apportés au squelette et
au générateur dans la journée ont changé ces chiffres avant même que le chantier
ne démarre : le témoin versionné `measure-o0.mjs` relève désormais 8,96 m² au
pire pour 5,39 programmés, et zéro WC en L. **Le symptôme a diminué, la cause
non** — le pire WC reste un rectangle utile de 1,00 × 9,48 m, et rien ne borne
encore une pièce à agrément nul. La procédure a fonctionné comme prévu : les
mesures à la main ont motivé le lot, l'instrument versionné les a remplacées.

**Clôture O1, le 27 août.** Après réserve utile des cloisons alignée entre les
deux poseurs en M2, le pire WC du témoin vaut 3,50 m² utiles à 90 m² et
1,00 × 3,64 m à 250 m² ; `SUIVI_REGLES_PIECES.md` référence désormais la règle
HARD `TH2D-ROOM-003`. L'état du 26 août reste ci-dessus comme témoin avant lot.

### 27 août 2026 — Trois audits, un seul diagnostic

Trois audits rendus en deux jours sur trois objets distincts — circulation,
pose du mobilier, chaîne des équipements — sont consignés en un point unique,
le **§6.1 bis**. Décisions prises à cette occasion :

1. **Le diagnostic commun est retenu comme lecture du moteur** : à chacune des
   trois jonctions auditées, la décision est prise avec un substitut — un
   domaine de rectangles, un barème, la topologie — et la vérification par la
   réalité arrive après, ou jamais. Les correctifs se jugent désormais à ce
   critère, et non au défaut visible qu'ils font disparaître.
2. **`S4` devient le verrou nommé de la porte C.** Les trois audits le
   désignent par trois méthodes indépendantes. `S3`, elle, est fermée depuis O3.
3. **Les deux P0 de l'audit d'équipements sont déclarés fermés par M2** :
   `placement.validate()` est appelé depuis le générateur, `room.furnishable` et
   `room.usageValidation` sont posés à la finalisation, le verdict ne dépend
   plus d'abord d'une préférence d'affichage.
4. **Trois corrections sont explicitement interdites en l'état** : supprimer
   `cornerScore`, supprimer la pièce `circulation`, enrichir le catalogue. Motifs
   au §6.1 bis.
5. **Règle de méthode, étendue à tout le projet** : un constat ne devient
   opposable qu'une fois versé dans un script rejouable. L'audit d'équipements a
   été dépassé par le code le jour même de sa rédaction ; c'est la démonstration
   du coût d'un audit qui reste un document.

Constat annexe, mais bloquant : le témoin de la porte A est repassé au rouge
depuis O3. Diagnostic et arbitrage au §6.4.

### 27 août 2026 — Doctrine globale et flux F

Audit d’émergence fonctionnelle (§6.1 ter) et publication de
[`DOCTRINE.md`](DOCTRINE.md). Décisions :

1. **La fonction d’usage est l’unité élémentaire de conception** ; la pièce
   est une dénomination conditionnelle — généralisation de
   `DECISIONS_PROGRAMME.md`.
2. **Troisième flux F** ouvert (§6.2 bis) : F0 livré ; F1 annotatif en
   parallèle de la reprise porte A ; F2–F3 avec L1–L2 ; F4–F6 après S4 / M3.
3. **Les arbitrages d’entrée du chantier 7** (phase 12 c) sont cochés clos.
4. **Partition post-placement** autorisée seulement sous pression haute /
   critique — ne remplace pas le poseur room-first.
5. Glossaire obligatoire avant L2 : départager ZONE, zone d’usage,
   SHARED_ZONE, bande `storage`.

### 27 août 2026 — Trois leviers d’agrément tranchés

Les trois conditions d’un moteur *agréable* (pression → stratégie ; score
honnête ; preuve externe) passent du diagnostic à la décision (§6.0,
[`DOCTRINE.md`](DOCTRINE.md) §2 bis) :

1. **L1** → F4–F6 ; seuils N3 calibrés, pas décrétés.
2. **L2** → lot **M3.0** créé : le recalibrage « hérité de M2 » non livré
   devient prérequis explicite de M3 ; portes C et D en tiennent compte.
3. **L3** → M6 / porte E seules autorisent le vocabulaire « agréable » ;
   `correlation-avis` n’en est pas un substitut.
4. Ordre alors figé : porte A → M3.0 → M3 → S4/M4 → F4 → M5 → M6 ; la
   décision du 3 septembre insère désormais M5.4 puis I1 avant M6.

**Livré le même jour :** M3.0 rend la synthèse du calque, décompose le score,
pénalise la longueur par desserte et publie son banc d'ablation. La prochaine
étape de cet ordre est désormais M3.

### 27 août 2026 — Horizons MVP / V1 / cap

Décision de produit ([`DOCTRINE.md`](DOCTRINE.md) §1 bis, roadmap §1 bis) :

1. **V1 = proposeur honnête** — seuil = porte C ; vocabulaire « agréable »
   / « auteur » interdit dans le produit.
2. **Cap post-V1 = auteur statistique puis co-auteur** — seuil = porte E ;
   l’humain signe ; pas d’auteur au sens de parti architectural.
3. La porte D enrichit la V1 (« outil utile ») sans changer la promesse.
4. Le cap oriente M5–M6 et F4–F6 ; il ne figure pas sur l’emballage V1.

### 28 août 2026 — Audit de la livraison M3

Audit rendu au §6.1 quater, mesures rejouées à empreinte de code constante.
Décisions prises à cette occasion :

1. **Le rejeu des photographies devient la dernière étape de tout lot.** Deux
   livraisons consécutives — O3 puis M3 — ont refermé la porte A parce que le
   témoin a été figé avant la dernière touche au moteur. Ce n'est plus traité
   comme une inattention mais comme un ordre d'opérations à corriger.
2. **Quatre constats du §6.1 bis sont déclarés fermés par M3** : réservation
   des seuils, `S4` à l'échelle de la pièce, suppression de `cornerScore`,
   calque rendu et au schéma. La documentation les disait ouverts ; l'écart
   est corrigé dans la présente révision.
3. **`S4` est scindée en deux propriétés distinctes**, qu'on cessera de
   confondre : *atteindre* chaque zone d'usage — fermé, mesuré à 0 sur 712 —
   et *ne pas fragmenter* le sol — ouvert, 15,3 %.
4. **La cause du « lit au milieu » est rouverte.** `cornerScore` a été retiré
   comme l'ablation le demandait ; l'effet est resté à 65 % et la marge à
   l'angle a augmenté. La prédiction de l'ablation était fausse, donc la cause
   aussi.
5. **`TH2D-ADJ-004` doit être arbitrée** : elle se déclenche deux fois par
   plan sur une mitoyenneté que la stratégie dominante produit exprès.
6. **Le levier L2 reste à justifier par la grandeur vécue.** L'ablation
   publiée montre qu'il améliore `scoringLength` sans déplacer la longueur
   réelle des chemins. Tant que ce n'est pas repris, « levier L2 tenu » à la
   porte C est une affirmation sur le score, pas sur le plan.

## Prochaine action

**Révisée le 3 septembre 2026 avant l'audit amont M5.4.**

**Flux M — M0 à M5.2 livrés ; M5.3 gelé ; conduire M5.4 avant M6.** M4 publie désormais
un plan construit unique : poses canoniques, preuve `S4`, murs, ouvertures et
parcours meublé participent au verdict avant l'affichage. La porte A est
rouverte ; le `NON_TROUVE` n'est plus une exception du témoin mais un statut
compté quand le protocole historique l'autorise.

**M4a.1** a fermé le biais de repère : huit transformations canoniques, quatre
orientations de T et deux axes de barre, sans les compter comme diversité
topologique. L'ancrage reste inchangé — 100/100 circulations en façade — et sa
correction transfère nécessairement une extrémité à une pièce polygonale.
**M4b** ferme O5 : le polygone utile est l'autorité du solveur et le cache
rectangulaire est explicitement invalide hors de sa portée. La fragmentation
résiduelle du sol et les fenêtres coupées du composant principal restent des
mesures distinctes de `S4`, à reprendre dans le classement. **M4c limité**
fait désormais participer gammes et optionnels du séjour et de la chambre au
verdict final et à l'affichage, sans les injecter dans la recherche
topologique. **M4a.2** ferme
l'ancrage systématique : 27/100 plans portent une terminaison intérieure et
13/100 rendent toute la façade aux pièces ; le surplus après le seuil d'entrée
est un poste N3 identifiable du score. **M5.0 réduit fortement le défaut de
branche sans porte**, sans le fermer dans la chaîne intégrée : le rejeu M5
complet en conserve une sur 152. **M5** filtre maintenant le BuiltPlan HARD, classe séparément les
manques `target`/`comfort` et rend trois propositions VALID et dédupliquées par
`PlanSelection`. L'audit obtient 12/12 tri-sélections complètes et 36 plans sans
HARD. **M5.1 consomme maintenant `PlanSelection` dans l'interface** sans changer
le score : trois rangs commandent un panneau unique, `PARTIAL` et `EMPTY` sont
annoncés, les compromis mesurés sont lisibles et verdict, graine, évaluation et
export suivent toujours le plan actif. **M5.2 est
livré** : la politique pure produit les replis cumulatifs, le contrat 1.1
`ProgramResolution` trace demande, résolution, concessions et tentatives, et
`resolveProgram()` exécute trois essais déterministes par niveau, saute
`IMPOSSIBLE`, arrête `INVALIDE_DEBUG` et reconstruit le `Program` à chaque
concession. L'interface appelle désormais `resolveSelection()`, qui réemploie
ce premier résultat dans une
`PlanSelection` construite sur l'intention résolue, avec onze générations
nouvelles au lieu de douze pour une tri-sélection. L'interface compare
maintenant demande et proposition ; un retrait de fonction bloque affichage et
export jusqu'à l'accord explicite, conservé par le schéma d'export 3.1 et les
métadonnées SVG. Le banc M5.2f mesure 6 résultats exacts et 24 replis résolus,
zéro `HARD`, avec un coût moyen/p90/max de 4,23/7/8 appels. **M5.3 reste un
prototype technique gelé** : la grille et l'archive existent et leurs tests
passent, mais leur ergonomie et leur utilité n'ont pas été acceptées ; elles ne
font donc pas partie des capacités livrées. **M5.4 est le prochain jalon.** Le
pilote qualité examine les plans, les assistants traduisent les constats en
conséquences métier et la roadmap est réordonnée. M5.4 ouvre ensuite I1 sur
les vagues de pièces retenues ; leur intégration ou leur report explicite
précède tout gel de M6.0. La collecte licenciée, la
séparation atelier/étalon, l'étalonnage des poids provisoires et la comparaison
à l'aveugle suivent l'ordre M6.1 à M6.5 du §6.1 octies ; c'est la seule chaîne
autorisée à conclure sur la crédibilité externe.

La commande `node scripts/validate-m0.mjs` reste le témoin obligatoire. Elle
enchaîne 45 tests ciblés puis quatre bancs — 49 étapes au total — : O0, un
banc M3.0 actif ramené à 19 plans (deux `NON_TROUVE` C-P1.2a à 60 m² ; l'ablation sans
budget est archivée), le banc topologique de 48 plans et 360 tentatives du
banc historique. Les témoins de leviers antérieurs neutralisent explicitement
S4 et la pose D4 de M4a ; `test-s4-m4.mjs`,
`test-m4a-circulation-invariance.mjs`,
`test-m4a2-interior-terminations.mjs`, `test-m4b-polygon-placement.mjs`,
`test-m5-circulation-utility.mjs`, `test-m5-selection.mjs` et les
audits dédiés jugent leurs intégrations courantes.

**Flux C — C-P2 livré, préparer C-P3.** L'audit d'intégration prouve le
trajet construit des deux pilotes mais maintient honnêtement leur maturité C4 :
cinq blocages pour le WC séparé, sept pour la composition, tous attribués dans
`C_P0_INTEGRATION_AUDIT.json`. Chambre, séjour et cuisine sont désormais C4
avec canon, variantes ou proportions et preuves isolées branchés. Circulation,
seuil d'entrée et noyau rangement sont désormais C4 et consommés par le moteur.
C-P3 peut consolider salle d'eau sans WC, cellier, buanderie et local technique ;
l'extension de M4c aux autres pièces reste un lot moteur distinct, décidé
profil par profil après C4.

**Flux F — F1 en parallèle doc/données.** F0 est livré
([`DOCTRINE.md`](DOCTRINE.md), §6.1 ter, §6.2 bis, phase 12 d). **F1**
(annotation `capabilities[]` / `requiredCapabilities` sur le socle) peut
avancer **sans** attendre la porte A : zéro changement de génération, zéro
régression de banc. **F2+** attend encore l'interpréteur L1 malgré la porte B
ouverte ; **F4+** ne doit entrer dans la version soumise à M6 qu'avant le gel
du protocole, ou être évalué comme une version distincte.

Le lot O1 — allocation par enveloppe cible — est livré. Les lots G2 du
chantier 8 et L1 du
chantier 7 ne sont plus bloqués comme travaux de **documentation** : ils
peuvent progresser jusqu'à C2 ou C3. Leur activation dans le produit attend en
revanche la porte B et les capacités génériques dont ils dépendent — désormais
nommées dans le flux F.

*La révision du 18 août est conservée ci-dessous : elle reste exacte pour tout
ce qui suit le chantier 9.*

**Révisée le 18 août 2026.** Les trois défauts du chantier 5 passent devant :
tant qu'une option du questionnaire fait disparaître une fonction du plan,
aucune mesure faite sur ce moteur ne décrit ce que l'utilisateur voit.

**0. Réparer avant de mesurer.** D3 d'abord — le plus circonscrit, et il
livre le mécanisme de composition dont dépendent la suite parentale et le
studio. Puis D1, qui ne touche qu'à `scoreCandidate()`. Puis D2, le plus
profond, qui change ce que le solveur reçoit.

**0 bis. Mesurer avant d'étendre.** Première mesure à l'aveugle (chantier 6),
puis les trois arbitrages d'entrée du chantier 7 — salle à manger, dressing,
rangement — avant le lot pilote L1.

**0 ter. Les gammes de tailles (chantier 8) n'attendent pas ce verrou.** Elles
n'ajoutent aucun type de pièce, donc n'élargissent aucun programme et ne
contraignent aucune découpe — la dérive par accumulation du §7.5 ne les
concerne pas. Le lot G1 est de surcroît conçu pour ne rien changer au plan :
il se valide sur l'empreinte du banc, pas sur un jugement de qualité, et ne
dépend donc pas de la mesure à l'aveugle. Le faire pendant que le chantier 6
mesure évite d'attendre pour rien. Les lots G2 et suivants, eux, modifient ce
que l'utilisateur voit et repassent sous la règle commune.

Les quatre temps ci-dessous restent valides et suivent immédiatement. Chacun
rend le suivant mesurable.

**1. Rendre observable.** Diagnostic exportable avec graine, gravité des
violations, invariant de couverture en préalable. Ne change aucun résultat,
rend visible ce que le moteur fait.

**2. Supprimer les conventions.** Poids déduits des équipements, meublabilité
faisant foi. Douze conventions retirées ; c'est le plus gros gain disponible.

**3. Corriger le biais d'adjacence.** Seuil de desserte à 1,00 m. Une heure
de travail, et elle conditionne la décision la plus importante du projet.

**4. Lancer l'essai typologie.** Protocole en `APPROCHES_GENERATION.md` §8,
critères et règle de décision pré-enregistrés avant le premier essai.

L'audit du §3.5 nourrit ces quatre temps ; il ne les précède plus.

1. **Refuser les entrées impossibles avant génération** — traiter
   `TH2D-PROJECT-001` et les compressions sous minima comme une validation du
   questionnaire, avec une explication actionnable.
2. **Trancher puis appliquer la politique `HARD`** — ne plus présenter comme
   valide le meilleur candidat du budget lorsqu'il viole encore une règle
   bloquante.
3. **Résorber les deux verrous de synthèse** — guider davantage la découpe
   par le graphe, puis introduire plusieurs circulations sur les grands
   programmes pour réduire `TH2D-GRAPH-001` et `TH2D-CIRC-003`.
4. **Corriger le biais de placement du WC** — ajouter la préférence de
   façade et le contrôle WC / séjour, puis mesurer leur effet sur les 24
   configurations avec des graines fixes.
5. **Raccorder et afficher le mobilier** — associer le placement retourné
   par `assets/placement.js` aux pièces du plan, inliner `furniture.svg` et
   offrir la bascule d'affichage annoncée. Tant que ce point n'est pas fait,
   les assets d'équipements ne figurent pas dans le produit.
6. **Reprendre les enveloppes libres** seulement après stabilisation de ces
   régressions sur l'enveloppe rectangulaire.
