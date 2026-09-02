# Suivi du développement des règles par pièce

État consolidé du moteur Wonderland au **1er septembre 2026**. Ce document distingue
quatre niveaux qui ne doivent plus être confondus : fiche documentaire,
équipements du socle, génération effective et règle évaluée en production.

## Légende

- **Couvert** : généré, équipé et contrôlé par le moteur.
- **Partiel** : une partie de la chaîne existe, mais il manque une règle ou une
  capacité structurante.
- **Socle seul** : équipements et exigences disponibles, pièce non générée.
- **Absent** : ni fiche dédiée ni prise en charge complète.

## État global

- **6 types générés** : séjour, chambre, salle d'eau, WC, cuisine, circulation.
- **13 types décrits dans le socle** : les 6 précédents, plus salle à manger,
  entrée, bureau, buanderie, cellier, local technique et garage.
- **7 fiches de pièce ou fonction** : salon, cuisine, chambre, salle de bain,
  WC, bureau et seuil d'entrée.
- **2 fiches transverses** : circulation et rangements.
- **32 règles de plan actives** dans `assets/rules.js`.
- **6 règles génériques de placement** (`S1` à `S6`) dans
  `assets/socle.data.js`.
- **13 pièces déclarant rôle, agrément, planchers, plafond et critère
  d'existence** — table unifiée dans `assets/socle.data.js` depuis le 20 août,
  compilée dans `assets/fit.data.js`. Voir
  [`MODELE_EXIGENCES.md` §1 bis](MODELE_EXIGENCES.md). Le `trigger` est
  déclaré partout où il est connu mais **lu par personne** : son interpréteur
  est le lot L1 du chantier 7.

## Matrice de couverture

| Pièce / fonction | Fiche | Socle | Générée | Contrôle actif | État et manque principal |
|---|---:|---:|---:|---:|---|
| Séjour / salon | oui | oui | oui | générique + traversée/occupation | **Couvert en isolation · C4** — groupe canapé-table requis, média/fauteuil optionnels, focalité, conversation, occupation et traversée multi-accès à 0,70 m prouvés ; zones repas/bureau et preuve C5 restent différées |
| Cuisine | oui | oui | oui | générique + relations | **Couvert en isolation · C4** — quatre pôles requis, séquence HARD, passage face-à-face 1,20 m, triangle GUIDELINE ≤ 6,50 m, ventilation et lave-vaisselle optionnel prouvés en cuisine séparée et ouverte ; linéaire résultant, four lié, accessibilité et preuve C5 restent différés |
| Chambre | oui | oui | oui | générique | **Couvert en isolation · C4** — variantes enfant/parentale, pied et côtés, penderie coulissante, porte/fenêtre/S4 prouvés ; accessibilité, chevet lié et preuve C5 restent différés |
| Salle d'eau / bain | oui | oui | oui | générique | **Partiel · C2** — sanitaires et préférences de murs présents ; accessibilité, réseaux et ventilation non contrôlés |
| WC | oui | oui | oui | générique + plafond dédié | **Partiel · C4 confirmé par C-P0.2** — BuiltPlan prouvé ; cinq blocages C5 restent attribués dans l'audit d'intégration |
| Salle d'eau avec WC | oui | composition `bath + wc` | oui | générique | **Partiel · C4 confirmé par C-P0.2** — composition minimale prouvée ; sept blocages C5, dont variante bain et dépendance à `BATHROOM` C2 |
| Circulation | transverse | oui | oui | dédié | **Couvert en isolation · C4** — largeur 0,90/1,20 m conditionnée à la desserte, mesure par branche, formes et battants S3 prouvés ; manœuvres accessibles et seuil externe de longueur restent différés |
| Salle à manger | incluse dans salon | oui | non | non | **Socle seul** — décider pièce autonome ou zone du séjour, puis définir programme et déclencheurs |
| Entrée | profil `ENTRY_THRESHOLD` | fonction hébergée | oui, sans pièce autonome | `ENTREE-001/002` | **Couvert en isolation · C4** — hôte circulation/séjour, porte extérieure et zone d'arrivée 1,20 × 1,20 m libres participent au verdict ; hall autonome et manœuvres accessibles restent différés |
| Bureau | oui | oui | non | non | **Socle seul · C2** — fiche et mobilier prêts ; manque l'activation dans le programme et le générateur |
| Buanderie | non | oui | non | non | **Socle seul** — créer fiche, règles de réseaux, dégagement de machine et relation avec cellier/local technique |
| Cellier | rangement transverse | oui | non | non | **Socle seul** — créer fiche et règles d'adjacence cuisine, stockage et circulation |
| Local technique | non | oui | non | non | **Socle seul** — créer fiche, accès de maintenance, réseaux et séparation des pièces sensibles |
| Garage | non | oui | non | non | **Socle seul** — créer fiche, gabarit véhicule, accès, porte, sas et relation au logement |
| Suite parentale | non | composition possible | non | non | **Absent comme programme composé** — définir chambre + rangement/dressing + salle d'eau et leurs relations |
| Dressing | rangement transverse | composant seulement | non | non | **Absent comme pièce** — décider s'il reste un équipement, une annexe ou une pièce autonome |
| Escalier / étage | circulation seulement | non | non | non | **Hors V1** — le moteur est mono-niveau |
| Terrasse / balcon / extérieur | non | non | non | non | **Hors V1** — prévoir une famille d'espaces extérieurs et leurs seuils |

## Règles actives aujourd'hui

Le rapport de plan évalue actuellement :

- projet et surfaces : `TH2D-PROJECT-001`, `TH2D-ROOM-001`,
  `TH2D-ROOM-002`, `TH2D-ROOM-003`, `TH2D-SIZING-001` ;
- graphe et façade : `TH2D-GRAPH-001`, `TH2D-GRAPH-002`,
  `TH2D-FACADE-001` ;
- circulation : `TH2D-CIRC-001` à `TH2D-CIRC-004` ;
- entrée : `TH2D-ENTREE-001` et `TH2D-ENTREE-002` ;
- parcours meublé : `TH2D-PATH-004` (`HARD`), alimentée par la preuve `S4`
  conservée dans le BuiltPlan ;
- rangement : `TH2D-RANGEMENT-001` à `TH2D-RANGEMENT-003` ;
- forme et réserve : `TH2D-FORME-001`, `TH2D-RESERVE-001`.

Le solveur de mobilier applique séparément : présence et non-chevauchement
des requis (`S1`), protection des zones d'usage (`S2`), débattements (`S3`),
chemin d'accès aux usages (`S4`), ancrages (`S5`) et rectangle libre résiduel
(`S6`). Ces résultats doivent à terme remonter sous des identifiants stables
dans le rapport général, pièce par pièce.

Depuis M4c limité, le séjour et la chambre exportent aussi leur programme
canonique résolu : gammes demandées, repli de taille ou d'optionnels, poses et
emprises nominales. Le `BuiltPlan` est l'autorité de l'affichage ; la cuisine
C4 reste sur le programme minimal du générateur jusqu'à une extension nommée
de M4c.

## Manques transverses prioritaires

### P0 — Remettre la documentation au niveau du code

- `MODELE_EXIGENCES.md`, `MODELE_DE_CALCUL.md` et `ROADMAP.md` déclarent encore
  par endroits les portes, fenêtres ou parcours absents, alors que
  `generator.js`, `placement.js` et `app.js` les calculent et les rendent.
- Les sections historiques des fiches sont signalées comme périmées dans
  `agencement/README.md` : ne pas les utiliser comme état d'implémentation.
- Faire du code et des tests l'autorité de l'état, et des fiches l'autorité
  des valeurs sourcées et des intentions.

### P1 — Rendre les règles de pièce visibles et auditables

- Créer des identifiants dédiés par famille (`TH2D-CUIS-*`, `TH2D-CHBR-*`,
  `TH2D-SDB-*`, `TH2D-WC-*`, `TH2D-SALON-*`).
- Transmettre les verdicts `S1` à `S6` et les relations entre équipements au
  rapport général, avec pièce, équipement, mesure et seuil.
- Distinguer clairement règle bloquante, conseil et préférence de placement.

### P2 — Activer les pièces déjà prêtes dans le socle

**Exécution portée par le chantier 7 de `ROADMAP.md` (§5 septies)** : lots
L1 à L7, dépendances, tests exigés et définition de terminé. Ce document
reste l'état de référence pièce par pièce ; la roadmap porte l'ordre et les
conditions d'entrée.

Rappel de l'ordre retenu :

1. **bureau** et **entrée** — lot pilote, il livre la mécanique d'activation ;
2. **salle à manger** et **cellier**, après décision « pièce ou zone » ;
3. **buanderie** et **local technique**, qui apportent les réseaux ;
4. **suite parentale**, premier programme composé ;
5. **garage** et **sas d'entrée** ;
6. programmes fusionnés, puis extérieurs et multi-niveaux.

Aucun lot ne démarre avant la correction de D1, D2, D3 et la première mesure
à l'aveugle.

### P3 — Compléter le modèle commun

- profil accessible/évolutif, aire de rotation et transfert WC ;
- attribut d'ouvrant pour les rangements et leurs dégagements ;
- réseaux humides, ventilation et regroupement technique ;
- relations d'adjacence typées : obligatoire, interdite, souhaitable,
  déconseillée ;
- nord et orientation réels ;
- rattachement des ouvertures, du mobilier et du parcours aux faces des murs ;
- programmes composés : suite parentale, cuisine ouverte, séjour avec repas
  ou bureau.

## Backlog par pièce couverte

- **Séjour** : C4 livré ; 20 m² est le minimum, 24 m² la cible nommée et 30 m²
  reste un seuil de zonage à instruire. Poursuivre par `ZONE` repas/bureau,
  l'effet couloir, les grandes surfaces et la preuve C5 en plan.
- **Cuisine** : C4 livré ; poursuivre par le linéaire dont la longueur résulte
  de la pose, l'ouvrant lié du four, l'accessibilité, les relations de réseaux
  au plan complet et la preuve C5. L'enrôlement de ses optionnels dans M4c est
  un lot moteur distinct.
- **Chambre** : C4 livré ; poursuivre par l'équipement lié (chevets), la
  variante de penderie battante, le profil accessible et la preuve C5 en plan.
- **Salle d'eau** : expliciter douche ou baignoire, accès aux équipements,
  profil accessible et ventilation.
- **WC** : ajouter dégagements latéraux, transfert accessible et interdiction
  de communication directe avec cuisine ou espace repas selon le profil
  réglementaire retenu.
- **Circulation** : C4 livré ; poursuivre par les manœuvres de porte
  accessibles, le seuil externe de longueur par desserte et la lumière en bout.
- **Entrée** : C4 hébergé livré ; poursuivre seulement si le programme exige
  une pièce autonome, un placard ou un sas, sans les confondre avec le seuil.
- **Rangements** : C4 limité livré pour penderie de chambre et `STORAGE_BAY` ;
  poursuivre par placard d'entrée, unités de service, dressing et émergence F2/L1.

## Définition de « terminé » pour une pièce

Une pièce passe à **Couvert** uniquement lorsque :

1. sa fiche contient valeurs, sources, variantes et règles candidates ;
2. son programme minimal existe dans `socle.data.js` ;
3. ses variantes sont désignables par `room-model.js` ;
4. le générateur peut la créer ou l'intégrer explicitement à une composition ;
5. le solveur valide ses équipements, usages, ouvertures et relations ;
6. ses règles produisent des verdicts identifiés dans le rapport ;
7. des tests couvrent au moins une réussite, un refus et plusieurs graines.

## Défauts signalés le 18 août, localisés dans le code

Trois défauts remontés à l'usage, vérifiés sur le moteur. Les deux derniers
n'en font qu'un : **la fusion de pièces est implémentée comme une
suppression**.

### D1 — L'entrée n'est pas une contrainte de génération — **corrigé le 18 août 2026**

`scoreCandidate()` porte désormais une pénalité d'entrée, calculée avant la
sélection : 220 points — deux adjacences manquées — si aucune pièce éligible
n'a 0,90 m de façade, et 18 points par rang d'écart au meilleur hôte que le
programme permet. La référence est **relative** au programme : sans cela, un
plan dépourvu de pièce d'entrée dédiée — c'est-à-dire tous aujourd'hui — ne
pourrait jamais atteindre un score nul, et la recherche perdrait sa sortie
anticipée. `facadeSegments()` accepte maintenant les rectangles bruts de la
boucle de recherche, pas seulement les pièces déjà découpées.

Règle `TH2D-ENTREE-001` (HARD) ajoutée : un logement dans lequel on n'entre
pas n'est pas un logement. Elle contrôle l'existence de l'entrée et la
longueur de façade disponible pour le vantail.

Mesuré à graines fixes, 240 plans sur 8 configurations :

| | avant | après |
|---|---|---|
| circulation en façade | 31,9 % | **55,2 %** |
| entrée accueillie par la circulation | 67 | **116** |
| entrée accueillie par le séjour | 173 | 124 |
| plans sans entrée | 0 | 0 |

Le dernier chiffre corrige l'énoncé d'origine : le cas « aucune entrée » était
**déjà rare** sur ces configurations. Le vrai défaut n'était pas l'absence
d'entrée mais son emplacement — un seuil qui ouvre directement dans le séjour
plutôt que sur un espace de distribution. Sur le banc complet, 720 plans,
`TH2D-ENTREE-001` ne se déclenche jamais.

**Le banc a rendu visible le coût de la correction, et un second défaut de
même nature.** En poussant un hôte d'entrée vers l'enveloppe, on prend de la
façade aux chambres : `TH2D-FACADE-001` — HARD, « pièce principale en
façade » — est passée de 39 à 53 violations. Cette règle non plus n'était
représentée dans `scoreCandidate()`, si bien que la recherche ne pouvait pas
arbitrer entre deux exigences qui se disputent le même bord. Elle y est
maintenant, à 100 points par pièce principale enclavée :

| règle (720 plans, graine 20260818) | référence | entrée seule | entrée + façade |
|---|---|---|---|
| `TH2D-FACADE-001` (HARD) | 39 | 53 | **2** |
| `TH2D-ROOM-001` (GUIDELINE) | 73 | 57 | **55** |
| `TH2D-CIRC-004` (GUIDELINE) | 265 | 309 | 298 |
| `TH2D-SIZING-001` | 182 | 186 | 185 |
| `TH2D-PROJECT-001` | 30 | 30 | 30 |

Bilan assumé : une règle bloquante quasi éteinte — 39 → 2 — contre une
circulation un peu plus généreuse, `TH2D-CIRC-004` restant 33 points au-dessus
de la référence. La circulation en façade est plus longue ; c'est le prix du
seuil bien placé, et c'est un conseil, pas un refus.

Empreinte du banc : `6434c9d4` → `f3ed28a2`.

### D1 — énoncé d'origine

`poserEntree` (`generator.js`) s'exécute **après** que les 96 candidats ont
été notés et le meilleur retenu ; `scoreCandidate` ne contient aucun critère
de façade ni d'entrée. Rien ne pousse donc la circulation vers l'enveloppe :
elle finit enclavée, et l'entrée redescend la chaîne `ENTREE_ORDRE` vers le
séjour ou la cuisine — ou renvoie `null`, plan sans entrée.

Correction : porter le contact façade de la pièce éligible dans
`scoreCandidate`, avant sélection. La ligne « Entrée » de la matrice reste
juste, mais son manque principal est celui-ci, pas seulement l'absence d'un
espace `entree` généré.

### D2 — Une pièce fusionnée reste dessinée en parties séparées — **corrigé le 18 août 2026**

Deux corrections, l'une visible, l'autre plus lourde de conséquences.

**Au dessin** : `cheminContour()` calcule le contour extérieur d'un ensemble
de rectangles à axes alignés — damier des abscisses et ordonnées présentes,
arêtes de cellule dont la voisine est vide, chaînage en boucle, suppression
des points alignés. Une pièce se trace d'un seul `path`, le rangement se
signalant par-dessus en pointillé : il dit une vocation à l'intérieur de la
pièce, il ne la coupe pas en deux. Vérifié dans le navigateur : 6 contours,
0 rectangle résiduel, aucune erreur console.

**À la pose** : `usableRect` valait `parts[0]`. Une pièce dont les parties
**pavent** leur boîte englobante est pourtant un rectangle entier — la
découpe est un moyen de production, pas une entité de plan. Mesuré sur 150
plans : **176 pièces sur 530** en plusieurs parties étaient dans ce cas, soit
**623 m² de surface meublable** que le solveur ne voyait pas, environ 4 m² par
pièce concernée.

Effet de bord attrapé au passage : `TH2D-RANGEMENT-002` exigeait un contact
d'arête entre la bande et le rectangle utile. La bande étant désormais
**incluse** dans ce rectangle, la règle échouait sur les pièces les plus
régulières. Une bande incluse est rattachée, et mieux qu'en contact.

**Reste ouvert** : le solveur reste rectangulaire. Une pièce en L lui est
servie par sa partie principale, faute de mieux — `placement.js` et le cache
`fit.data.js` sont indexés par rectangle, et les rendre polygonaux est un
chantier, pas un correctif.

### D2 — énoncé d'origine

`app.js` dessine chaque `part` indépendamment (deux boucles
`room.parts && room.parts.length ? room.parts : [room]`). Une pièce en L
affiche donc le trait de refend entre ses parties, alors qu'elle est une seule
pièce. Attendu : **le contour extérieur seul**, et c'est ce volume unifié qui
doit être soumis au solveur de pose — aujourd'hui l'agencement raisonne sur
les parties, pas sur leur union.

Recoupe l'observation N°4 de `AUDIT_PLANS_RENDUS.md` (dépôt archivé) : union
propre des contours, jamais faite.

### D3 — Le WC intégré n'existe nulle part — **corrigé le 18 août 2026**

Correction livrée : la fusion est traitée comme une composition.
`room-model.js` porte une table `COMPOSITIONS` — `living` absorbe `kitchen`,
`bath` absorbe `wc` — qui généralise le cas particulier du séjour ouvert déjà
présent. `generator.js` verse la surface et l'étiquette à la pièce d'accueil
(`composeInto`), `app.js` passe le contexte `integratedWc`, et
`TH2D-ROOM-002` juge désormais une pièce composée sur ses deux programmes.

Trois enseignements de la mise en œuvre, chacun mesuré :

- **le minimum composé n'est pas la somme des minima.** Additionner les
  `minArea` décrétés porte le séjour à 27 m² et rend la salle d'eau non
  meublable à 75 m² avec deux chambres : à surface totale fixe, durcir un
  minimum se paie sur les autres pièces. Le composé vaut donc le plancher de
  la pièce d'accueil, ou la somme des plus petits rectangles meublables du
  socle si elle est plus exigeante — 20 m² pour séjour + cuisine, 3,03 m²
  pour salle d'eau + WC ;
- **le poids ne s'additionne pas** non plus : il dit ce qu'un mètre carré de
  plus apporte, pas ce que la pièce doit contenir ;
- **le cache de faisabilité ne connaît que les types simples.** La règle
  contrôle donc que chaque programme tient et que l'aire couvre la somme des
  deux plus petits rectangles : nécessaire, pas suffisant. Une entrée de
  cache dédiée aux compositions reste à produire.

Reste ouvert : sous environ 3,3 m², la salle d'eau avec WC est déclarée non
meublable plutôt que dessinée sans cuvette. C'est le comportement voulu — la
fonction ne disparaît plus en silence — mais un programme trop serré produit
maintenant un refus explicite là où il produisait un plan faussement complet.

### D3 — énoncé d'origine

`buildProgram` : `if (options.includeWc) rooms.push(createRoom('wc'))`.
Case décochée — « WC indépendant » non coché, donc WC intégré à la salle
d'eau — aucune pièce n'est créée, **et** `socle.data.js` ne prévoit pas de
`wc_pan` parmi les équipements de `bath`, sous aucune variante. Le WC
disparaît du programme au lieu d'être absorbé.

Même défaut pour la cuisine non séparée : `separateKitchen` décoché supprime
la pièce sans verser ses équipements au séjour.

Correction commune : traiter la fusion comme une **composition** — une pièce
unique, un contour, un programme d'équipements réuni. `bath` reçoit `wc_pan`
en variante « avec WC », `living` reçoit le linéaire de cuisine en variante
« séjour avec cuisine ouverte ». C'est le point « programmes composés » de
P3, qui devient bloquant : il ne s'agit plus d'enrichir le modèle mais de
réparer deux options du formulaire qui produisent aujourd'hui un plan faux.

### D4 — Le banc de capacités n'est pas rejouable — **corrigé le 18 août 2026**

Correction livrée : graine de base fixe (`20260818`), `--seed=<n>` pour en
changer, `--random` pour un tirage libre — explicitement étiqueté « non
rejouable » dans l'en-tête du tableau. Les graines par configuration et par
variante dérivent de la base par multiplication impaire, pour que deux
configurations voisines ne reçoivent pas des suites voisines : sinon la
diversité mesurée serait celle des graines, pas celle du moteur.

Le tableau se termine désormais par une **empreinte** des seules colonnes de
résultat, durées exclues — la durée mesure la machine, pas le moteur.
Vérifié : deux passages à graine égale donnent `6434c9d4`, `--seed=7` donne
`f88db235`. Comparer deux empreintes remplace la lecture de 24 lignes, et
c'est la preuve n°4 exigée de chaque lot du chantier 7.

Corrigé au passage dans les deux bancs : le chemin des sources était écrit en
dur en absolu (`/Users/theoseguret/…`), ce qui les rendait inexécutables
ailleurs que sur cette machine.

### D4 — énoncé d'origine

Découvert en cherchant à prouver la non-régression de D3.
`scripts/scan-capacites.mjs` tire ses graines avec `Math.random()`. Deux
exécutions du **même code** donnent 7 puis 12 signatures distinctes sur la
même configuration, et 63 % puis 93 % de formes en L.

Conséquence directe : le banc **ne peut pas** servir de contrôle de
non-régression, alors que le chantier 7 en fait la quatrième preuve exigée
de chaque lot. Aujourd'hui, seuls les tests à graines fixes
(`test-composition-model.mjs`, `test-fusion.mjs`) tiennent ce rôle.

Correction : passer une graine de base en argument, par défaut fixe, et ne
tirer au hasard que sur demande explicite. Peu de code, et il conditionne
toute mesure d'évolution — y compris la corrélation score/jugement du
chantier 6.

## Chantier 1 — Formes d'enveloppe, premier lot livré le 18 août 2026

Le questionnaire propose quatre formes : **rectangle, carré, L, U**. La forme
« Souple » (additive, qui déborde du rectangle englobant) et le tirage
`random` restent à faire.

**Le choix de structure.** Une enveloppe est une liste de volumes
rectangulaires jointifs qui pavent exactement la surface demandée — un pour
le carré et le rectangle, deux pour le L, trois pour le U. La découpe en
guillotine n'a pas été remplacée : elle travaille chaque volume comme elle
travaillait l'enveloppe entière. Le moteur gagne des formes sans changer
d'algorithme.

**Ce qu'il a fallu généraliser** :

- `facadeSegments()` ne teste plus l'appartenance aux quatre bords d'un
  rectangle. Un mur est en façade lorsque, juste au-delà, il n'y a aucun
  volume — sinon l'encoche d'un L ou d'un U, pourtant extérieure, ne compterait
  pas. Mesuré : la façade moyenne passe de 42 m (rectangle) à 47 m (L) et
  61 m (U) à surface égale ;
- le fond du plan est un contour, plus un rectangle : peindre la boîte
  englobante reviendrait à bâtir l'encoche. Il réutilise le `cheminContour()`
  de D2 ;
- `TH2D-BOUNDARY-008` (HARD) garde l'invariant qu'aucune pièce ne déborde
  dans l'encoche — la boîte englobante, elle, la contiendrait sans rien dire.

**Deux exigences de largeur, et les confondre stérilisait les formes.** Le
corps de bâtiment doit loger la pièce la plus large du programme, le séjour
presque toujours (3,00 m). Une aile n'a qu'à loger la plus étroite des pièces
qui se vivent — la salle d'eau, 1,70 m ; les pièces servantes, WC et
circulation, ne justifient pas une aile, sans quoi on obtient un couloir avec
une fenêtre. Mesuré : exiger partout la largeur du séjour rendait le L et le U
impossibles avant 130 m². Avec la distinction, les deux formes tiennent dès
45 m², et l'aile la plus étroite mesure 1,85 m.

**Quand la forme est intenable**, le moteur essaie huit proportions puis
rabat sur le rectangle et le dit : `boundary.demandee` conserve le choix de
l'utilisateur, `boundary.degradee` signale le repli. Un plan faux serait pire
qu'un plan honnête sur sa forme.

**Ce que le banc dit des trois formes** — 720 plans chacune, graine 20260818 :

| règle | rectangle | L | U |
|---|---|---|---|
| `TH2D-PROJECT-001` (HARD, programme saturé) | 30 | 30 | 30 |
| `TH2D-FACADE-001` (HARD) | 2 | 2 | 0 |
| `TH2D-CIRC-001` (HARD) | 0 | 1 | 0 |
| `TH2D-ROOM-002` (HARD) | 0 | 0 | 2 |
| `TH2D-RESERVE-001` (HARD) | 0 | 0 | **0**, contre 60 avant l'appariement |
| `TH2D-ROOM-001` (GUIDELINE) | 55 | 293 | 285 |
| `TH2D-SIZING-001` (GUIDELINE) | 185 | 320 | 362 |
| `TH2D-CIRC-004` (GUIDELINE) | 298 | 239 | 241 |

Empreintes : rectangle `f3ed28a2`, L `11de3c85`, U `e21f110e`.

Lecture honnête : les formes soustractives tiennent les règles bloquantes
aussi bien que le rectangle, mais **découpent la même surface en volumes plus
contraints** — cinq fois plus de pièces sous leur minimum indicatif, et un
séjour plus souvent en deçà des 24 m². Ce n'est pas un défaut du code, c'est
le prix géométrique d'une aile : à surface égale, un L ou un U répartit moins
librement. La question ouverte est de savoir si ces seuils indicatifs, calés
sur le rectangle, ont encore un sens sur une forme découpée.

**Non-régression prouvée** : à graine égale, l'empreinte du banc en rectangle
reste `f3ed28a2`, identique au bit près. Deux écarts d'un millimètre ont été
traqués jusqu'à leur cause — un rééchelonnage inutile des surfaces cibles sur
une enveloppe à volume unique, et un arrondi des dimensions d'enveloppe entré
dans le calcul au lieu de rester en sortie.

**Reste ouvert** : forme « Souple » et tirage `random` ; `TH2D-BOUNDARY-001`
à `007`, `009` et `010`, encore non écrites ; l'orientation, qui n'est pas
une forme mais la commande le rendu autant qu'elle.

## Journal de suivi

| Date | Changement | État |
|---|---|---|
| 2026-08-18 | Inventaire initial des fiches, du socle, du générateur et des règles actives | fait |
| 2026-08-18 | Localisation des défauts D1 (entrée hors scoring), D2 (parties dessinées séparément), D3 (WC et cuisine fusionnés supprimés) | fait |
| 2026-08-18 | D1 corrigé : pénalité d'entrée dans le scoring, règle `TH2D-ENTREE-001`, `test-entree.mjs` | fait |
| 2026-08-18 | D2 corrigé : contour unifié au dessin, rectangle utile = union quand elle pave, `test-contour.mjs` | fait |
| 2026-08-18 | Chantier 1, premier lot : formes carré, rectangle, L et U ; `test-formes.mjs` | fait |
| — | Solveur polygonal : une pièce en L est encore servie par sa partie principale | à faire |
| — | Forme « Souple » (additive) et tirage `random` | à faire |
| 2026-08-18 | D3 corrigé : fusion traitée comme composition ; `test-fusion.mjs` ajouté | fait |
| 2026-08-18 | D4 corrigé : banc rejouable, graine en argument, empreinte des résultats | fait |
| 2026-08-19 | Chantier 6 : test de l'instrument ; il invalide la peine de proportion sur la circulation | fait |
| 2026-08-19 | Exemption de la circulation : écrite, mesurée (4 → 12 pièces non meublables), **retirée** | arbitré |
| — | Rendre la cession de circulation visible à `scoreCandidate()`, puis reprendre l'exemption | à faire |
| 2026-08-19 | Chantier 6 : quiz deux questions, journal `localStorage`, export JSON, outil de corrélation | fait |
| 2026-08-19 | Chantier 6 : `PROTOCOLE_MESURES.md`, quatre mesures pré-enregistrées | fait |
| 2026-08-19 | Circulation : dossier d'arbitrage instruit et mesuré — [`DOCTRINE_CIRCULATION.md`](DOCTRINE_CIRCULATION.md) | fait |
| 2026-08-20 | `TH2D-CIRC-004` réécrite : plafond relatif au besoin (k = 1,6, gelé) et inscrite au score | fait |
| 2026-08-20 | Circulations multiples : deux tentatives mesurées puis **retirées** — voir `DOCTRINE_CIRCULATION.md` §5 ter | classé |
| 2026-08-20 | Cause racine identifiée : la découpe ne consulte pas le graphe. 13,1 % des pièces sans contact avec une circulation, 19,4 % sans porte | mesuré |
| 2026-08-21 | Découpe et graphe : dossier d'instruction — [`DECOUPE_ET_GRAPHE.md`](DECOUPE_ET_GRAPHE.md) | fait |
| 2026-08-21 | Mesuré : le graphe demandé est une étoile sur **840 plans sur 840** ; l'échec est heuristique (98,2 % des plans avaient la capacité) ; le peigne **coûte** 2,1 points quand `hubSplit()` en rend 3,7 | mesuré |
| 2026-08-21 | **Peigne retiré** de `layout()` — aucune règle HARD dégradée, `TH2D-ROOM-002` 49→45, `TH2D-FACADE-001` 1→0, `TH2D-CIRC-004` 50→74. Empreinte **`520b8ebb` → `5bd33591`** | fait |
| 2026-08-27 | **M3.0 livré** — score de longueur par desserte, calque synthétisé au plan, part de circulation au banc ; `TH2D-CIRC-004` suspendue explicitement faute de seuil externe | fait |
| 2026-08-21 | Circulations multiples : arbitrages rendus — isolées, typologie autoportante, mono et bi mesurés en parallèle | arbitré |
| — | Prototype typologie mono + bi-couloir, protocole `APPROCHES_GENERATION.md` §8 | à faire |
| — | Chantier 1 (formes d'enveloppe) **suspendu** le temps de l'essai typologie — `test-formes.mjs` garde l'existant | suspendu |
| — | **Piloter la découpe par le graphe** — verrou des circulations multiples et de la desserte réelle | à faire |
| — | Essai typologie, protocole `APPROCHES_GENERATION.md` §8, ventilé par forme et par taille | à faire |
| 2026-08-20 | Définition des pièces unifiée dans `socle.data.js` : `role`, `agrement`, `minProgramArea`/`minProgramSide`, `maxRatio`, `trigger` ; compilée dans `fit.data.js` par `fit:build` | fait |
| 2026-08-20 | `generator.js::DEFINITIONS` et `AGREMENT` supprimés — planchers dérivés par `fit.floorOf`, empreinte `520b8ebb` inchangée | fait |
| 2026-08-20 | `TH2D-FACADE-001` interroge le rôle au lieu d'une liste de types en dur | fait |
| 2026-08-20 | `test-definition-pieces.mjs` : énuméré, synchronisation socle/compilé, invariance des planchers (`npm run fit:check`) | fait |
| 2026-08-27 | M2/O2 : programmes minimaux compilés dans `fit.data.js`, coût gradué de `placement.validate()` dans le classement | fait |
| 2026-08-27 | M2/O3 : porte objet, ouverture résolue sans décret par type, passage face-à-face et `TH2D-DOOR-004` (`S3`) | fait |
| 2026-08-27 | M2 rend visibles 34 invalidations tardives de meublabilité sur 360 plans, concentrées sur les programmes comprimés ; entrée de M4, non dette à masquer | mesuré |
| — | Écrire l'interpréteur de `trigger` — c'est la mécanique d'activation du lot L1 | à faire |
| — | Calibrer `maxRatio` hors circulation, à partir de la mesure du chantier 6 | à faire |
| — | Découpe : savoir tenir une adjacence demandée entre deux pièces — verrou des circulations multiples | à faire |
| — | Première mesure de discrimination à l'aveugle — bloque la phase 12 b | à faire |
| — | Réconciliation des documents devenus périmés après l'ajout des ouvertures et parcours | à faire |
| — | Activation du bureau dans le programme | à faire |
| — | Première remontée des verdicts de placement par pièce | à faire |

## Chantier 6 — mesure de la qualité perçue (19 août 2026)

### Le test de l'instrument a immédiatement invalidé un critère

Avant de mesurer quoi que ce soit avec le banc, on a mesuré le banc.
`scripts/plan-reference.data.mjs` porte un T3 de 75 m² **dessiné à la main**
selon les règles de l'art — zone jour à l'ouest, zone nuit à l'est,
dégagement court entre les deux, pièces humides adossées à une même gaine,
placard toute largeur dans chaque chambre. Aucune cote n'a été retouchée
après un passage dans le banc : un plan ajusté jusqu'à ce qu'il passe ne
mesure plus les critères, il mesure la patience de qui l'a dessiné.

`assemblerPlan()` lui fait subir exactement ce que subit un plan généré —
mêmes façades, mêmes portes, même cheminement, donc même rapport de règles.
Seules la cession de circulation et les décrochements sont sautés : le plan
est déjà dessiné, les lui appliquer reviendrait à mesurer le moteur.

**Résultat du premier passage** :

| | plan dessiné à la main | 30 plans générés, même programme |
|---|---|---|
| violations bloquantes | 0 | 0 |
| violations totales | **0** | 0 |
| score interne | **15,05** | 0,00 pour les trente |

Zéro violation, et pourtant le moteur le classe **strictement derrière chacun
de ses propres plans**. Les 15,05 points sont entièrement imputables à un
seul poste, et le script le décompose : la peine de proportion
(`ratio < 0,32`) frappait le dégagement de 1,30 × 5,50 m. Un couloir est
allongé par définition ; le sanctionner à ce titre revient à lui reprocher
d'être un couloir.

Le raisonnement du §6.3 est à sens unique : c'est le critère qu'il faut
corriger, jamais le plan. **La correction évidente a donc été écrite,
mesurée — puis retirée**, parce que la mesure a dit qu'elle coûtait plus
qu'elle ne rapportait.

### La correction évidente a été écrite, mesurée, retirée

Exempter la circulation de la peine de proportion. Le plan de référence
repasse alors devant les plans générés, et le test de l'instrument est vert.
Mais le banc et le solveur disent autre chose.

**Meublabilité, solveur complet, accès compris — 120 plans, 600 pièces
meublées, protocole de `test-composition-model.mjs` :**

| | sans exemption | avec exemption |
|---|---|---|
| pièces que le solveur ne sait pas meubler | **4** | **12** |

Presque toutes des salles d'eau composées. `test-composition-model.mjs`
échoue d'ailleurs sur la graine `00013CV`, ce qui a servi d'alerte avant
même la mesure d'ensemble.

**Banc complet, 720 plans par forme, graine 20260818 :**

| règle | rectangle | | L | | U | |
|---|---|---|---|---|---|---|
| | sans | avec | sans | avec | sans | avec |
| `TH2D-CIRC-004` (GUIDELINE) | 298 | 449 | 239 | 296 | 241 | 266 |
| `TH2D-ROOM-001` (GUIDELINE) | 55 | 17 | 293 | 284 | 285 | 273 |
| `TH2D-SIZING-001` (GUIDELINE) | 185 | 191 | 320 | 325 | 362 | 393 |
| `TH2D-FACADE-001` (HARD) | 2 | 3 | 2 | 3 | 0 | 0 |
| `TH2D-PROJECT-001` (HARD) | 30 | 30 | 30 | 30 | 30 | 30 |

Une guideline gagne (`ROOM-001`), deux se dégradent, une règle bloquante
recule d'un point dans deux formes sur trois — et surtout, huit pièces de plus
deviennent réellement inhabitables. **Le critère est faux, mais le corriger
ainsi dégrade les plans.** On ne livre pas ça.

### Le mécanisme, et pourquoi la correction n'est pas à cet endroit

Un couloir libéré de la peine de proportion s'allonge. Il longe alors plus de
pièces, `carveCirculation()` leur cède plus de bandes, et le solveur — encore
rectangulaire — sert une pièce en L par sa seule partie principale. C'est la
limite laissée ouverte par D2, et l'exemption la met sous tension.

**La cause profonde n'est pas dans la ligne de score** :
`scoreCandidate()` s'exécute **avant** la cession de circulation — un choix
de coût assumé et commenté dans le code, la cession n'étant appliquée qu'au
candidat retenu. La recherche ne peut donc pas arbitrer sur les conséquences
d'une opération qu'elle ne voit pas. Tant que c'est vrai, toute correction du
critère de proportion déplacera le problème au lieu de le résoudre.

### Décision, et ce qui reste dû

La peine de proportion **reste en place, en sachant qu'elle est fausse**. Le
code le dit à l'endroit exact, avec la mesure qui a fait renoncer.
`scripts/test-instrument.mjs` porte l'écart de **15,05 comme limite
consignée** : il échoue si l'écart s'aggrave, pas s'il persiste — un test qui
échouerait en permanence finirait par être ignoré, et une dette qu'on cesse
de mesurer cesse d'être une dette.

C'est la doctrine déjà retenue dans `rules.js` pour les limites du moteur :
l'exigence reste réelle, son manquement est nommé une dette d'implémentation
plutôt qu'une violation ordinaire.

**Dû, dans cet ordre** : rendre la cession visible à la recherche, ou la
sortir de l'aval ; puis reprendre l'exemption et la mesurer à nouveau.

**Empreintes du banc : inchangées.** `f3ed28a2` en rectangle, `11de3c85` en
L, `e21f110e` en U. La refactorisation qui expose `assemblerPlan()` —
extraction de `finaliserPlan()` — a été mesurée seule sur les trois formes :
elle rend les trois empreintes historiques **au bit près**. Le chantier 6
n'a donc modifié aucun plan produit.

### Le score interne ne discrimine pas partout

Mesuré sur les 24 configurations, 720 plans : la recherche s'arrête au
premier candidat de score nul (`if (best.score === 0) break`). Sur les
programmes peu contraints, **tous les plans retenus valent donc 0**, et le
score ne distingue plus rien parmi eux.

Conséquence directe pour le §6.4 : la corrélation entre `scoreCandidate()` et
la note d'habitabilité **est impossible à calculer sur ces programmes** — une
constante ne corrèle avec rien. Ce n'est pas un résultat faible, c'est une
mesure impossible. `scripts/correlation-avis.mjs` le dit explicitement au lieu
d'afficher un zéro qui aurait l'air d'une réponse.

### Livré

- `scripts/plan-reference.data.mjs` — le plan de référence, cotes datées du
  dessin ;
- `scripts/test-instrument.mjs` — test permanent, deux critères d'échec
  pré-enregistrés ;
- `assets/evaluation.js` — quiz deux questions, journal `localStorage`,
  export JSON ; graine, forme, options, version du moteur et métriques dans
  chaque entrée ;
- `scripts/correlation-avis.mjs` — corrélation score interne / habitabilité,
  refuse de conclure sous 50 avis ;
- `PROTOCOLE_MESURES.md` — les quatre mesures du §6.2, pré-enregistrées.

**Non fait, et bloquant pour la phase 12 b** : la première mesure de
discrimination à l'aveugle. Elle demande cinq juges humains et dix plans
dessinés par des personnes ; le protocole est écrit, le recrutement ne l'est
pas.

## Fichiers faisant autorité pour ce suivi

- `assets/generator.js` : types réellement générés et ouvertures/parcours ;
- `assets/socle.data.js` : types, équipements, usages et relations disponibles ;
- `assets/room-model.js` : désignation des exigences ;
- `assets/placement.js` : validation et optimisation des poses ;
- `assets/rules.js` : règles effectivement évaluées au niveau du plan ;
- `agencement/` et `VEILLE_NORMATIVE.md` : sources et règles candidates ;
- `scripts/test-*.mjs` : preuve de comportement et non-régression ;
- `scripts/test-instrument.mjs` et `scripts/plan-reference.data.mjs` : le
  contrôle des critères eux-mêmes, à ne pas confondre avec les précédents —
  ils vérifient le moteur, celui-ci vérifie ce avec quoi on juge le moteur ;
- `PROTOCOLE_MESURES.md` : les mesures de qualité perçue, pré-enregistrées ;
- `DOCTRINE_CIRCULATION.md` : le dossier du seuil de circulation, mesuré et
  non tranché — il fait autorité sur l'état de cet arbitrage, pas sur la règle
  en production, qui reste celle de `rules.js`.
