# Roadmap — TechnoHab

Document de pilotage du générateur de plans 2D.

**Mise à jour : 24 septembre 2026**

**Statut : M0 à M5.2, dont M5.1 produit, M4c limité, C-P1.2 et C-P2 sont
livrés et branchés. M5.3 est un prototype gelé, non accepté comme lot terminé.
Le parcours visuel est accepté sur ordinateur et sa revue mobile continue.
M5.4 est clos sur huit plans et les matrices statiques du produit. **I1 est le
chantier actif : sa première tranche ajoute le bureau comme équipement d'une
chambre enfant assez grande, avant de consolider la pièce bureau autonome.**
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
`AUDIT_REFERENTIEL_EXTERNE.md` (REF-1, trame de l'audit de complétude du référentiel),
`DIFFERENTIEL_REFERENTIEL.md` (REF-1, livrable : verdicts ligne à ligne),
`REFERENTIEL_ETENDU.md` (REF-1, domaines reportés décrits sans être ouverts),
`PONDERATION_AGENCEMENT.md` (activation de la décision 3 — score pondéré par priorité, cumulable),
`DA_ICONES_PLAN.md` (icônes de pièces),
`DA_CHEMINEMENT_PLAN.md` (parcours de desserte et accès),
`DA_FORMES_ENVELOPPE.md` (vignettes de choix de forme),
`../Wonderland/DA_GRAPHIQUE.md` (direction artistique historique de Wonderland).

*Depuis le 14 septembre 2026, TechnoHab possède son dépôt autonome dans
`~/Developpement/TechnoHab`. Wonderland ne conserve aucune dépendance
technique ; son futur lien public relève du jalon J3.1 de MetaProjet.*

---

*Ce document ne porte plus l'historique des chantiers. Le pilotage courant
(ci-dessous) et cinq sections de doctrine encore vraies aujourd'hui —
Objectif, Horizons de release, Principes non négociables, Trois flux
parallèles et Définition d'une génération valide — sont seuls actifs ici.
L'état constaté au 3 septembre, le catalogue cible du questionnaire, les
neuf chantiers numérotés, la roadmap vNext, l'ancien découpage technique, le
journal des décisions et l'ancienne « prochaine action » vivent dans*
[`ROADMAP_HISTORIQUE.md`](ROADMAP_HISTORIQUE.md)*, copiés tels quels, dans
leur numérotation d'origine.*

## Pilotage

Format et cycle : [`../MetaProjet/METHODE.md`](../MetaProjet/METHODE.md) (D-020).
Le détail historique des jalons reste dans les sections numérotées ci-dessous ;
seuls le travail actif et le todo immédiat suivent ce format.

| Item courant | État | Gate de validation | Vérification | Documentation | Mis à jour |
|---|---|---|---|---|---|
| `I1/C-P4a — bureau et chaise optionnels dans la chambre enfant` | `needs_review` | À partir de 11 m², une chambre enfant demande le couple plateau + chaise ; il n'est affiché que si le solveur place les deux et le recul propre de la chaise ; les chambres plus petites et parentales restent inchangées | Banc diagnostic de 8 graines : couple demandé 16 fois et conservé 7 fois, les 9 replis étant dus à la place réellement requise ; restitution visuelle du nouveau couple à confirmer par Théo | `ROADMAP.md` ; `SUIVI_REGLES_PIECES.md` ; socle, compilé, générateur et sprite | 2026-09-24 |
| `I1/L1-bureau — bureau autonome activé` | `done` | Choix absent/compact/convertible → trigger déclaratif → plan complet avec plateau, chaise et recul propre → profil et export | `test-bureau-l1.mjs` : absence, deux variantes, refus surfacique et trois graines complètes ; tests C4 et définition verts | questionnaire, socle, compilé, générateur, profil et suivi | 2026-09-24 |
| `CAT-1 — catalogue local` | `needs_review` | Le footer ouvre une page listant les équipements et pièces depuis le compilé, avec icônes, dimensions, circulation et disponibilité | Navigation par `#catalogue`, retour atelier, `test-catalog-ui.mjs` ; contrôle visuel attendu | `index.html`, `app.js`, `styles.css` | 2026-09-24 |

## Todo

| Ordre | ID | Résultat attendu | Gate de validation | État |
|---:|---|---|---|---|
| 1 | `V-REV-mobile` | Le parcours validé sur ordinateur reste utilisable sur mobile | La revue mobile produit une décision explicite et route chaque défaut bloquant vers le lot visuel | `in_progress` — validation ordinateur acquise |
| 2 | `I1/C-P4a` | Une chambre enfant assez grande peut recevoir plateau et chaise | Témoin avec couple placé et recul accessible ; repli honnête si le couple ne tient pas ; chambre parentale sans bureau ; validation minimale verte | `needs_review` — chaise et recul propres ajoutés ; 7/16 couples tiennent sur le banc diagnostic, contrôle visuel attendu |
| 3 | `I1/L1-bureau` | Le bureau C4 devient une pièce demandable et générable sans branche spéciale | Questionnaire → programme → topologie → plan meublé → verdict → icône → export ; cas passant, refus et plusieurs graines | `done` — interpréteur `count` générique, variantes compact/convertible et trois graines complètes |
| 4 | `F1` | Le socle porte les annotations `capabilities[]` / `requiredCapabilities` | `npm run technohab:validate` rend le même verdict qu'avant l'annotation : zéro changement de génération | `todo` |
| 5 | `REF-1` | Le différentiel de complétude du référentiel existe et est tranché ligne à ligne, **contre le code** | `DIFFERENTIEL_REFERENTIEL.md` produit et repassé contre `generator.js`, `construction.js` et `profils/` ; chaque ligne porte un verdict et son motif ; aucun fichier du moteur modifié | `needs_review` — six des neuf lignes annoncées sont tombées à la vérification ; l'export DXF a été fait puis **gelé le 24 septembre 2026** (qualité de rendu insuffisante, hors ordre de priorité) ; restent l'allège, le débarras, et **l'équipement lié**, qui débloque quatre lignes déjà sourcées — chantier retenu ensuite |
| 6 | `PONDERATION` | Le score lit réellement `compact` / `light` / `economy`, au lieu d'agir sur l'enveloppe seule | Regroupement technique câblé, façade réelle en mode lumineux, sur-dimensionnement et dégagement pénalisés en compact ; poids mesurés sur banc diagnostic ; aucune ligne du différentiel rouverte | `needs_review` — les quatre règles du §3 sont livrées le 24 septembre 2026 ; §3.4 corrigée en cours de route (pas de compte de baies, la façade réelle) ; §3.2 a révélé et corrigé une régression sur `test-m5-selection.mjs` (priorité arbitraire en collision avec l'inversion du confort) ; 49 tests verts, 90 générations sur 5 surfaces × 3 priorités × 6 graines, 72/90 valides avant et après — détail dans `PONDERATION_AGENCEMENT.md` §3.5 ; lecture par Théo attendue |

**Séquencement décidé le 24 septembre 2026.** La refonte documentaire du
dépôt — sortir l'historique de `ROADMAP.md` (chantiers 1 à 9, journal des
décisions) vers un fichier archive séparé et versionné, homogénéiser les
fichiers structurants — est retenue mais **après** `PONDERATION`, pas avant :
on ne réorganise pas un fichier qu'on va immédiatement rouvrir. Destination
de l'archive : un fichier dédié dans ce même dépôt public, pas un sous-dossier
ni une sortie de Git — ce contenu est diffusable. La visibilité de l'état
roadmap dans la vue `#catalogue` (« Équipements et pièces disponibles ») est
retenue comme un **item séparé**, à ouvrir après le mécanisme d'équipement
lié dont elle dépend partiellement pour l'activation conditionnelle — pas
dans le chantier documentaire lui-même.
| 7 | `C-P3` | Salle d'eau sans WC, cellier, buanderie et local technique progressent profil par profil | Chaque profil retenu expose canon, variantes ou proportions et preuves isolées avant intégration | `todo` |

**Décision de séquencement — 24 septembre 2026.** La revue ordinateur de
`V-REV` est acceptée ; la revue mobile reste en cours. Le pilote M5.4 retient
les huit exports transmis comme corpus suffisant pour ouvrir les décisions de
travail, sans prétendre à une estimation statistique. La priorité exprimée est
de rendre davantage de fonctions générables pour améliorer la couverture et
la qualité utile ; les défauts observés sont consignés comme témoins à protéger
et lots à ordonner, sans correction opportuniste avant la fin de l'audit.

### Audit du référentiel externe — `REF-1`

**Décision du 24 septembre 2026.** Un chantier d'analyse **fermé** est ouvert
en parallèle : confronter les caractéristiques que notre modèle nomme à celles
qu'un éditeur de plans manuel a été contraint de modéliser, pour reposer la
limite écrite en `ETAT_MOTEUR_PROCEDURAL.md` §6.4 avec un étalon extérieur.

Il ne produit **aucune modification du moteur** : son unique livrable est un
différentiel tranché ligne à ligne. Sa gate gouverne tout le reste — *une
caractéristique n'entre au modèle que si elle change un verdict* — sans quoi un
catalogue de plusieurs centaines d'objets deviendrait une dette de travail.

Rien du référentiel étudié n'est recopié : ni visuel, ni base, ni code. On en
tire une structure, une nomenclature et des dimensions d'usage, réécrites dans
notre vocabulaire ; toute cote retenue reçoit une source qui nous est propre.
La trame fait foi : [`AUDIT_REFERENTIEL_EXTERNE.md`](AUDIT_REFERENTIEL_EXTERNE.md) ;
le livrable est [`DIFFERENTIEL_REFERENTIEL.md`](DIFFERENTIEL_REFERENTIEL.md).

### Reprise visuelle — `V-MVP` puis `V-REV`

**Décision du 24 septembre 2026.** La reprise cherche d'abord un produit qui
fonctionne clairement en usage. Le polish, la finition graphique et le
nettoyage exhaustif viennent après la preuve du parcours. Les concessions sont
admises lorsqu'elles permettent de livrer cette tranche sans modifier le
moteur ni ouvrir un chantier secondaire. Le résultat reste révisable : la
revue `V-REV` peut conserver, adapter, réduire ou retirer une solution.

**Périmètre du MVP.** Une seule tranche verticale :

1. ouvrir sans ambiguïté la version locale en cours depuis le poste de pilotage,
   distincte de `technohab.theoseguret.fr`, qui reste le dernier déploiement ;
2. saisir le programme essentiel sans détour par les outils avancés ;
3. générer et afficher un plan sans régression du moteur ;
4. parcourir les propositions et comprendre leur compromis principal ;
5. rendre visibles les concessions, l'impossibilité et l'échec de recherche ;
6. activer les calques utiles et exporter le résultat ;
7. laisser le compositeur, l'audit détaillé, les règles et les journaux
   accessibles comme couches secondaires.

**Concessions admises pour démarrer.** Le MVP peut conserver les composants,
le vocabulaire visuel et la structure JavaScript existants. Il n'exige ni
design system, ni animation, ni refonte du moteur, ni nettoyage complet du CSS,
ni identité graphique définitive. Le mobile doit rester utilisable, sans viser
la même densité que l'atelier sur ordinateur.

**Point de départ technique.** Le worktree du 24 septembre porte déjà le
prototype dans `index.html`, `assets/styles.css`, `assets/app.js` et
`assets/evaluation.js` : plan agrandi, informations secondaires repliables,
avis escamotable et cadrage SVG resserré sur le dessin. Ce travail est la base
à stabiliser. La direction visuelle et l'organisation de cet écran sont
validées le 24 septembre ; cette validation autorise les corrections ciblées,
sans ouvrir encore le polish.

**Ordre d'exécution immédiat.** Rejouer d'abord le parcours actuel et relever
uniquement les ruptures bloquantes. Fermer ensuite ces ruptures dans l'ordre
programme → génération → comparaison → inspection → export. Faire enfin la
revue `V-REV`. Le nettoyage structurel et la finition deviennent un lot séparé
seulement si la revue confirme l'organisation retenue.

**Chargement à la demande retenu dans `V-MVP`.** Le 24 septembre, le banc
M5.2f mesure 30 demandes : la résolution du premier plan coûte en moyenne
4,23 appels générateur et 5,7 s, tandis que la comparaison mesurée porte le
total à 14,25 appels et ajoute 11,0 s en moyenne. L'écran attendait jusque-là la
fin de ces deux étapes avant tout affichage. Le chargement automatique est
retiré : aucun plan n'est calculé avant une action explicite de l'utilisateur.
Deux modes explicites sont proposés : un plan, retenu par défaut pour la
vitesse, ou trois propositions pour comparer. Pendant le calcul, un unique
listener global intercepte les clics, y compris ceux restés dans la file du
navigateur, afin d'empêcher toute relance multiple. Le mode unitaire réemploie
strictement le résultat de résolution et ne calcule aucun candidat masqué.
Un simple calcul différé automatique n'est pas retenu comme optimisation : le
générateur est synchrone et bloquerait encore le fil principal après le premier
affichage. Un Web Worker reste une évolution possible si la comparaison à la
demande ne suffit pas. Gate : mesurer séparément temps jusqu'au premier plan,
temps de comparaison et absence de recalcul du premier résultat.

**Hors périmètre.** Aucun changement de règles, de profils, de génération ou
de promesse produit. M5.4 reste l'autorité pour transformer l'observation des
plans en conséquences métier et réordonner la suite moteur.

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
meilleur candidat du budget, y compris en violation `HARD` — voir
`ROADMAP_HISTORIQUE.md` §3.1 (« Le moteur ne garantit pas le graphe, il le
favorise »). Cette
section décrit donc une cible, pas l'état du code, et le lever suppose de
trancher entre filtre dur, synthèse guidée et reclassement des niveaux.

