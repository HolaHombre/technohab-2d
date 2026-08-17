# Roadmap — TechnoHab dans Wonderland

Document de pilotage de l'intégration de TechnoHab et de l'évolution du
générateur de plans 2D.

**Mise à jour : 16 août 2026**  
**Statut : prototype local intégré, audité, moteur à consolider**

Documents liés : `SOCLE_AGENCEMENT.md` (équipements, placement, PMR),
`DOCTRINE_AGENCEMENT.md` (pré-calcul des gabarits, niveaux de règles),
`APPROCHES_GENERATION.md` (revue des méthodes de génération, choix de fond),
`DATASOURCE_EQUIPEMENTS.md` (sourcing du mobilier et des dégagements),
`OUVERTURES_ET_PARCOURS.md` (ouvertures en façade, cheminement, ordre de coopération),
`PLACEMENT_ET_ADJACENCES.md` (nature des adjacences, placement des pièces),
`VEILLE_NORMATIVE.md` (sources, cotes tracées, matrice de contrôle),
`DA_ICONES_PLAN.md` (icônes de pièces),
`DA_CHEMINEMENT_PLAN.md` (parcours de desserte et accès),
`DA_FORMES_ENVELOPPE.md` (vignettes de choix de forme),
`technohab_rules.md` dans le dépôt de développement (référentiel de règles
comparé), `../DA_GRAPHIQUE.md` (direction artistique de Wonderland).

---

## 1. Objectif

Publier dans Wonderland une application 2D autonome qui transforme un
questionnaire d'intention en plusieurs plans de principe explicables,
comparables et contrôlés.

Le générateur doit suivre cette chaîne sans raccourci :

1. recueillir les caractéristiques du projet ;
2. refuser les programmes impossibles ou incomplets ;
3. construire un programme de pièces et un graphe de relations ;
4. produire plusieurs enveloppes et organisations candidates ;
5. contrôler chaque proposition avec des règles identifiées ;
6. classer les propositions valides selon les priorités de l'utilisateur ;
7. restituer le plan, ses hypothèses et ses limites.

TechnoHab reste chargé indépendamment du reste de Wonderland depuis
`technohab/index.html`. Il ne doit ajouter aucune dépendance au chargement de
la page principale.

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
  (`assets/icons/furniture.svg`, 28 symboles, `viewBox` en centimètres) ;
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

- l'enveloppe est toujours rectangulaire ;
- la priorité choisie modifie implicitement la proportion de l'enveloppe ;
- les pièces partent d'une découpe récursive rectangulaire puis peuvent
  recevoir un décrochement à six arêtes ;
- les portes, fenêtres, murs et accès extérieur ne sont pas encore modélisés ;
- les équipements sont décrits, dessinés, résolus et **rendus sur le plan**
  sous bascule ; leurs zones d'usage restent calculées mais non dessinées, et
  une pièce dont la pose échoue n'affiche aucun mobilier — le solveur ne
  renvoie pas de pose partielle, si bien que le refus se lit dans le rapport
  et non sur le dessin ;
- **la rotation d'un équipement est calculée mais non dessinée** : le solveur
  essaie bien les poses tournées, mais `solve()` ne dit pas lesquelles le
  sont, et le rendu étire le symbole au lieu de le pivoter — deux causes
  distinctes, détaillées dans `SOCLE_AGENCEMENT.md` §4 ;
- les règles actuelles sont un profil de prototype, pas un référentiel
  architectural ou réglementaire complet : 16 règles évaluées face aux 71 du
  référentiel cible, sans registre de données commun entre les deux ;
- le graphe d'adjacences n'est pas une contrainte de génération mais un
  critère de score — voir §3.1, c'est la limite structurante du moteur, et
  §3.1 bis pour la façon dont le rapport en rend compte sans l'imputer à
  l'utilisateur ;
- trois règles sont déclarées limitées, c'est-à-dire valides mais non tenues
  par la génération : `TH2D-GRAPH-001`, `TH2D-CIRC-003`, `TH2D-RANGEMENT-003` ;
- la suite JavaScript couvre le solveur d'agencement ; la génération, les
  règles et le rendu n'ont toujours pas de tests de non-régression dédiés ;
- le code, les données et le service Graph2Plan/MATLAB d'origine ne sont pas
  présents dans le projet.

### 3.1 — Le moteur ne garantit pas le graphe, il le favorise

Constat d'audit à porter avant toute décision sur les phases 4 et 5.

`layout()` découpe l'espace en guillotine **sans jamais consulter les
adjacences demandées** ; celles-ci ne sont lues qu'après coup, par
`scoreCandidate()`, pour pénaliser les candidats qui les ratent. Le moteur
est donc un *generate-and-score* par échantillonnage, pas une synthèse guidée
par contraintes comme l'est vraisemblablement Graph2Plan.

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

## 6. Roadmap technique

### Phase 0 — Intégration autonome ✅

- [x] intégrer l'application dans Wonderland ;
- [x] isoler ses scripts et ses styles ;
- [x] restaurer une régénération effective ;
- [x] fournir une première couche de règles et d'exports.

### Phase 1 — Formes d'enveloppe

- [ ] ajouter `shape` au questionnaire et au schéma ;
- [ ] séparer forme, orientation et priorité ;
- [ ] remplacer la frontière largeur / hauteur par un polygone ;
- [ ] adapter le rendu SVG ;
- [ ] générer et contrôler carré, rectangle et libre orthogonale ;
- [ ] ajouter les tests et messages d'impossibilité.

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
- [ ] intégrer le coût d'agencement à `scoreCandidate()`, pour qu'une pièce
  largement meublable soit préférée à une pièce tout juste suffisante ;
- [ ] trancher l'incohérence du gabarit WC relevée au §6 de la doctrine :
  0,90 × 1,30 annoncé, 0,70 × 1,50 imposé par les cotes du socle lui-même ;
- [ ] prendre en compte le passage de 1,20 m entre linéaires opposés de
  cuisine, aujourd'hui absent du solveur.

**11 b — le placement effectif**

- [x] faire rendre au solveur navigateur les coordonnées, les zones d'usage
  et l'équipement expliquant un refus ;
- [ ] raccorder ces coordonnées à chaque pièce du plan retenu ; le volet de
  composition libre rend aujourd'hui un verdict textuel mais ne modifie pas
  le programme généré ;
- [ ] choisir la variante et le schéma d'aménagement par la graine, pour
  qu'un même plan rejoué donne le même ameublement ;
- [ ] inliner `furniture.svg` et tracer les emprises, option d'affichage
  désactivée par défaut — **les 28 assets existent mais aucun code de rendu
  ne les consomme encore** ;
- [ ] effacer le pictogramme de pièce dès que le mobilier est posé, les deux
  faisant doublon — `composeRoomContent()` gère déjà cette dégradation ;
- [ ] afficher la réserve tant que les portes n'existent pas : le mobilier
  est posé sans savoir où arrivera la porte.

**11 c — après les portes**

- [ ] `S3` du socle — le débattement épargne emprises et dégagements requis ;
- [ ] `S4` du socle — chemin continu de la porte à chaque zone d'usage, ce
  qui est le cheminement de la phase 9 à l'échelle de la pièce.

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

## Prochaine action

Quatre temps, dans cet ordre. Chacun rend le suivant mesurable.

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
