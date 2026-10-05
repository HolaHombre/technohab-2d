# Table de programme par bande de surface — transcription et préparation

**Ouvert le 26 septembre 2026.** Chantier `PROGRAMME-BANDES`, issu de la refonte
décrite par Théo : le moteur descend à 12 m² (le studio), et le programme d'un
logement se déduit de sa surface par une table, plutôt que par des règles
écrites fonction par fonction.

**Statut au 26 septembre 2026 : étapes 1 à 4 faites (§9, §11). La table est lue par le
moteur pour trois lignes : chambre, salle à manger, séjour (repas hébergé).** La table est en cours de complétion chez Théo (fichier de données
hors dépôt, dernière sauvegarde le 25 septembre 2026 à 15 h 24, encore des
lignes vides) et plusieurs cellules se contredisent (§2). Ce document fixe ce
qu'on a compris, ce que le moteur fait aujourd'hui, ce qui manque, et l'ordre
de travail — pour qu'à la validation des données, l'intégration soit une
formalité mesurée et non une découverte.

Décisions déjà rendues (26 septembre 2026) : les fonctions passent en cases à
trois états (§5) ; **le studio coexiste** avec le programme actuel jusqu'à ce
qu'il soit prêt ; la forme en U est gelée.

## 1. La table, telle que transmise (v0, non validée)

Tailles en m², par surface totale du logement.

| | Studio 12 | Studio 20 | Studio/T1 25 | T1 35 | T2 50 | T3 80 |
|---|---:|---:|---:|---:|---:|---:|
| Salle de bain (total, avec WC) | 4 | 4 | 4 | 4 | 4 | 4 |
| Salle de bain sans WC | — | — | 3,5 | 3,5 | 3,5 | 3,5 |
| WC | — | — | 1,5 | 1,5 | 1,5 | 1,5 |
| Séjour | 9 | 7 | 9 | 15 | 20 | 20 |
| Chambre | | 9 | 10 | 11 | 12 | 12 |
| Cuisine | | 5 | 5 | 5 | 5 | 5 |
| Bureau | | 7 | 7 | 7 | 7 | 7 |
| Cellier | | | 4 | 5 | 6 | 7 |
| Local technique | | | 4 | 5 | 6 | 7 |
| Salle à manger | | | 7 | 7 | 10 | 10 |
| Buanderie | | | | | 7 | 8 |
| Garage | | | | | | 15 |

Règles de déblocage annoncées : entre 20 et 25 m², séparation possible des WC,
de la cuisine, apparition du bureau, du cellier et du local technique (fusionnés
avant 25 m², cumulables au-delà) ; à 35 m², salle à manger séparée et couloirs.

## 2. Ce qui ne se lit pas encore (à lever avec Théo)

1. **12 m² : séjour 9 + salle de bain 4 = 13 m².** Les surfaces sont-elles
   habitables (murs exclus) ? La salle de bain est-elle *dans* les 12 m² ?
2. **Colonne 20 m² : séjour 7 + chambre 9 + cuisine 5 + bureau 7 = 28 m²** —
   plus que le logement. Lecture retenue : chaque cellule est la taille de la
   pièce *si elle existe*, pas une part du total. À confirmer, avec la
   question voisine : le séjour à 20 m² (7) est plus petit que celui du studio
   à 12 m² (9) — un minimum de séjour *séparé* d'une chambre ?
3. **Salle de bain :** total 4 contre sans WC 3,5 + WC 1,5 = 5. Séparer coûte
   1 m² de plus ; c'est cohérent, mais à écrire comme une règle.
4. **Bandes :** les colonnes (12/20/25/35/50/80) ne sont pas les bandes de
   classe actuelles (55/90/140, `CLASSIFICATION_LOGEMENT.md` §2.2). Garage et
   buanderie dès 50–80 m² contre « grand » dès 90 m² aujourd'hui.
5. **Interpolation :** entre deux colonnes, la valeur d'une pièce est-elle
   celle de la colonne inférieure (marches) ou interpolée ?
6. **Cellier / local technique fusionnés avant 25 m² :** une pièce unique de
   quelle taille (4 ? la somme ?) et de quel nom ?
7. **Lignes absentes :** entrée, circulation, rangement/dressing (dressing :
   1,50 m de profondeur déjà décidée, `DECISIONS_PROGRAMME.md` §2.2).

## 3. Ce que le moteur fait aujourd'hui, face à la table

Mesuré le 26 septembre 2026 sur `fit.floorOf` (plancher) et `fit.smallest` (plus
petit rectangle meublable calculé par le solveur).

| Pièce | Plancher actuel (aire / côté) | Plus petit rectangle meublable | Table (m²) |
|---|---|---|---|
| Séjour | 20 / 3,0 | 3,6 (1,8 × 2,0) | 7 à 20 |
| Chambre | 9 / 2,5 | 4,7 | 9 à 12 |
| Cuisine | 7 / 1,85 | 2,5 | 5 |
| Salle d'eau | 3 / 1,7 | 1,9 | 4 (3,5 sans WC) |
| WC | 1,5 / 0,9 | 1,0 | 1,5 |
| Bureau | 5 (compact) · 9 (convertible) | 1,3 | 7 |
| Salle à manger | 9 / 2,6 (salle) | 5,2 | 7 à 10 |
| Cellier | 1,3 | 1,3 | 4 à 7 |
| Local technique | 1,6 | 1,6 | 4 à 7 |
| Buanderie | 1,05 | 1,0 | 7 à 8 |
| Garage | 15,5 / 3,1 | 15,5 | 15 |

Lectures :
- Le moteur a **un plancher unique par pièce**, quelle que soit la taille du
  logement. La table en propose un *par bande* — c'est exactement ce qui
  manquait (`DATASOURCE_EQUIPEMENTS.md`, Tables B et C).
- **Le plus petit studio que le moteur sait produire est de 23 m²** (séjour 20 +
  salle d'eau 3), sous un plancher de surface totale de 35 m². La cible de 12 m²
  est donc à la fois un changement de données et de mécanisme.
- Cellier, local technique et buanderie n'ont aujourd'hui que le plancher de
  meublabilité ; la table leur donne pour la première fois une taille de
  *pièce* (4 à 8 m²).
- Convergences : WC 1,5, garage 15, chambre 9, salle d'eau ~3 à 4.

## 4. Ancrage réglementaire vérifié

Décret n° 2002-120 du 30 janvier 2002, **article 4** (logement décent),
consulté le 26 septembre 2026 sur
[Légifrance](https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000043842463) :
*le logement dispose au moins d'une pièce principale ayant soit une surface
habitable au moins égale à 9 mètres carrés et une hauteur sous plafond au moins
égale à 2,20 mètres, soit un volume habitable au moins égal à 20 mètres cubes.*
Mesures au sens de l'article R. 156-1 du CCH.

Ce que ça pose : **9 m² est le plancher réglementaire d'une pièce principale**,
pas le plancher d'un studio. 12 m² tient donc une pièce de 9 m² plus 3 m² de
service, mais ne peut pas contenir la salle de bain de 4 m² *en plus* du séjour
de 9 m² si les surfaces sont habitables : à trancher (§2.1). Le décret vise un
logement *loué* — un statut, pas une contrainte de conception ; à qualifier
comme `regulatory` seulement pour cette borne, le reste restant N3.

**Non vérifié, à ne pas écrire tant qu'il ne l'est pas :** un éventuel plancher
de 14 m² ou de 33 m³ pour un logement d'une personne (autre texte, autre
champ). À rechercher avant d'écrire « 12 m² » comme minimum du moteur.

## 5. Le mécanisme visé

**Programme = minimum garanti + remplissage progressif.** Le moteur pose
d'abord le strict minimum en respectant le *contrat chambre* en priorité, puis
ajoute les autres fonctions possibles, au hasard mais de façon équilibrée, dans
la surface restante. Deux conséquences à tenir dès le départ :

- **Le programme dépend de la graine.** Il ne suffit plus de rejouer la
  géométrie : la graine doit reproduire le *choix des fonctions ajoutées*. La
  révision du moteur (`engineRevision`, posée le 26 septembre 2026) et
  l'instantané d'archive existent pour ça.
- **Trois états par fonction** dans le bloc « Composition » : *jamais* / *peut
  apparaître* / *obligatoire*. « Obligatoire » est le contrat ; « peut
  apparaître » est ce que le remplissage aléatoire est autorisé à ajouter.

## 6. Le studio (mode lit) — ce qui est nouveau

Équipements : canapé convertible, espace repas (table 2 chaises), kitchenette,
salle d'eau ; pas de couloir. Règle : pour le calcul du mode lit, les
dégagements de la cuisine et du repas sont désactivés, à condition qu'**un accès
au lit reste libre**.

C'est un équipement à **deux états**. La doctrine le nomme (`TIME_MODE`,
`SHARED_ZONE`, `DOCTRINE.md` §2) sans l'avoir jamais construit. Forme proposée,
à instruire : un équipement déclare des `modes` ; chaque mode porte son
emprise et ses zones d'usage actives ; le solveur valide **chaque mode
séparément** sur la même pose. Le mode lit exige au moins un accès libre ; le
mode jour exige les dégagements habituels.

## 7. Ordre de travail

1. **Valider la table** (§2) — décision de Théo, en cours.
2. **La table devient une donnée canonique**, sans changer le moteur : valeurs
   `PROVISIONAL` par (pièce, bande), source « table de Théo, v0 ».
3. **Le moniteur compare** : `scripts/monitor-diversite.mjs` affichera, par
   bande, l'écart entre ce que le moteur produit et ce que la table demande.
   Critère de sortie de l'étape : l'écart est *mesuré* sur les bandes que le
   moteur sait déjà servir (≥ 35 m²).
4. **Planchers par bande** dans le programme (≥ 35 m²) : mesuré avant/après,
   empreinte comparée, aucune régression de la suite.
5. **Studio sous 25 m²**, en coexistence : nouveau type de programme, mode lit,
   plancher de surface abaissé *pour lui seul*.
6. **Remplissage progressif** aléatoire et équilibré.
7. **Bloc UI « Composition »**.

Chaque étape ne démarre qu'avec la précédente mesurée. Le rejeu des graines
archivées ne sera pas garanti à travers l'étape 4 : c'est ce que la révision du
moteur signale.

## 8. Ce qui reste à préparer sans attendre les données

- Rechercher le texte réglementaire d'un éventuel plancher de surface pour un
  logement d'une personne (§4, non vérifié).
- Recenser les données du solveur qui supposent 35 m² ou 1,7 m de côté
  (`normalizeOptions`, zone d'arrivée C-P2, murs 0,30 / 0,10 m) — ce qui casse
  en descendant à 12 m².
- **Fait le 26 septembre 2026 — le solveur de pose tient un studio de 12 m².**
  Sur un rectangle utile de 3 × 4 m (12 m²), `placement.validate` pose lit 140
  (ou lit 90) + table adossée 2 places + kitchenette complète (évier, plaque,
  plan de travail, réfrigérateur) ; il pose aussi canapé + table basse + table
  + kitchenette. À 3 × 3 m (9 m²) : non. Sans mode lit ni salle d'eau, mais la
  brique de placement n'est donc **pas** ce qui bloque : le plancher de 35 m²,
  le plancher de 20 m² du séjour, la typologie et la construction le sont.
- Prototyper le double état du canapé hors moteur (deux poses, deux jeux de
  dégagements) sur un rectangle de 3 × 4 m, pour savoir si le solveur actuel
  tient un studio de 12 m² avant de toucher au reste.

## 9. Étapes 1 à 3 — faites le 26 septembre 2026

**Étape 1 — la table est validée.** Théo accepte les sept points et précise le
sens des cellules : *la surface minimale cible d'une pièce lorsqu'elle est
activée* — pas une part du total. Les colonnes n'ont donc pas à s'additionner
(§2.1 et §2.2 levés) ; une cellule plus grande que la surface d'un studio ne
signifie rien tant que la pièce n'est pas activée. Hypothèses de lecture
retenues, à corriger si elles sont fausses : valeur **en marches** entre deux
bandes (§2.5) ; cellier et local technique fusionnés avant 25 m² sans valeur
propre (§2.6). Il prend l'ancrage réglementaire (§4) ; l'équipement exhaustif
arrive de son côté et servira la logique du studio.
Une contradiction reste écrite, non tranchée : la salle à manger a une taille
dès 25 m² et ne se sépare qu'à 35 m².

**Étape 2 — donnée canonique, sans changer le moteur.**
`assets/programme-bandes.data.js` (12 pièces × 6 bandes, déblocages, marches,
`consumedByEngine: false`) ; deux valeurs réglementaires `ADOPTED` au registre
(`VAL-REG-MAIN-ROOM-AREA-MIN-001` 9 m², `VAL-REG-MAIN-ROOM-HEIGHT-MIN-001`
2,20 m, décret 2002-120 art. 4, en `GUIDELINE` : le décret définit la décence
d'un logement loué, pas une contrainte de conception).
`scripts/test-programme-bandes.mjs` : forme de la table, marches, déblocages, et
— l'ancrage tenu — à chaque bande une pièce principale atteint 9 m².

**Étape 3 — le moniteur compare.** `scripts/compare-table.mjs` (graine 20260926,
4 tirages, empreinte `d01c9546`) : surface utile produite contre cible de la
table, de 45 à 250 m².

| Constat | Mesure |
|---|---|
| Le moteur **dépasse** la table presque partout | à 250 m², séjour 49 contre 20, chambre 25 contre 12, cuisine 15 contre 5 : le moteur distribue le surplus au prorata ; la table n'est qu'un plancher |
| WC | 2,8 à 3,3 m² produits contre 1,5 de cible : le plancher est tenu, la pièce est presque doublée |
| Salle de bain | 4,6 à 9,5 m² contre 3,5 |
| **Chambre sous la cible** | 75 m² et 90 m² : 4 chambres sur 8 sous 12 m² (min 10,6) ; 45 m² : 1 sur 2 sous 11 |
| **Salle à manger sous la cible** | 90 à 160 m² : 4/4 sous 10 m² (moyenne 8,8 à 9,4) — son plancher est 9, la table 10 |
| Pièces de la table jamais générées | salle de bain totale (le WC séparé domine), **bureau** (non demandé dans ce banc), cellier, local technique, buanderie, garage |

Lecture : le désaccord n'est pas « le moteur fait trop petit », il est *aux
extrémités basses* — deux cellules (chambre à 12 m² et salle à manger à 10 m²)
que la table exige et que le moteur ne tient pas aujourd'hui. C'est le premier
écart réel à fermer à l'étape 4.

## 10. Étape 4 — planchers par bande (26 septembre 2026, mesurée)

Réponse de Théo à la lecture du repas hébergé : la zone de la table à 4 places
et de ses chaises *est requise* quand cet espace est inclus dans le séjour
(studio / T1) ; la liste d'équipements du studio est déjà connue (canapé
convertible, espace repas à 2 chaises, kitchenette).

`appliquerPlanchersParBande()` (`generator.js`) relève les planchers de trois
lignes, jamais ne les abaisse. Chaque choix a été **essayé puis tranché par la
mesure** :

| Essai | Résultat | Retenu |
|---|---|---|
| Zone du repas **additionnée** au séjour (15 + 7, 20 + 10…) | 45 m² : 0/6 ; chambres écrasées à 10 m² à 75 m² | **écarté** |
| Zone portée par une **table 4 places requise** (variante `coin4`) | 100 % de tables posées et 8/8 valides de 50 à 75 m² ; **studio 35 m² : 8/8 → 0/8** | **retenue dès 50 m² seulement** |
| Salle à manger au plancher exact de la table (10) | 7/8 plans sous 10 m² utiles : elle perd ~20 % entre cible et surface utile | **marge ×1,2** (0/8 sous la cible) |
| Chambre au plancher de la table | 0 sous la cible sans marge | plancher seul |
| Salle dédiée en mode automatique, sans condition | 90 m², 3 chambres à 97 % de minima : 3/6 valides | **repli sur repas hébergé au-delà de 92 %** des minima |

Résultats (`compare-table.mjs`, graine 20260926, empreinte `2d6ddee5` ;
`monitor-diversite.mjs`) : **plus aucune chambre ni salle à manger sous sa cible**
de 60 à 250 m² ; 60 m² avec bureau passe de 4/6 à 6/6 ; aucune configuration
ne régresse (35 m² avec bureau 5/6, 45 m² 3/6 inchangés). Reste une chambre à
10,8 m² pour 11 à 45 m² (marge à appliquer comme pour la salle).

`test-bandes-integration.mjs` éprouve le moteur **avec** la table, comme dans le
produit (`index.html` la charge). Les autres tests de la suite ne la chargent
pas : ils éprouvent des mécanismes.

**Dette, écrite.** Préchargée, la table fait échouer cinq tests de mécanisme :
`test-bedroom-c4` (les planchers de variante deviennent 12), `test-m4c-canonical-program`
(le repas 4 places apparaît au programme du séjour), `test-formes` (le gain de
façade du L tombe de 3,6 % à 2 %), `test-composition-model` et
`test-m5-circulation-utility` (chemin historique `designate` et graines-témoins
choisies avant la table — à recalibrer). Aucun n'est une régression du produit
mesurée ; ce sont des attendus à réaligner.

**Écarts nommés, non fermés.**
1. **Studio et T1 (≤ 45 m²)** : la zone à 4 places n'est pas tenue ; elle attend
   le mode studio (canapé convertible à deux états).
2. Chambre à 45 m² : 10,8 pour 11.
3. Les seuils 50 m² (table 4 places), ×1,2 (salle) et 92 % (repli) sont des
   mesures d'un banc de 8 tirages : provisoires.

## 11. Étape 5 — le studio (25 septembre 2026, mesuré)

Fait : mode lit à deux états dans le solveur (`modes` d'un équipement), séjour
en variante `studio` (canapé convertible, kitchenette, table 2 places),
programme studio dans le générateur (`studioMode` : `bedrooms:0` sous 35 m²,
plancher de surface 12 m²), champ de surface de l'interface abaissé à 12 m²,
`test-studio.mjs`.

Trois causes ont fait échouer la génération sous 18 m², toutes corrigées :

1. **La typologie posait une bande de 1,9 m.** Sans couloir, rien ne départageait
   les dimensionnements admissibles et le premier — le plus étroit — l'emportait.
   Pour un séjour studio, on préfère l'enveloppe la plus proche du carré
   (`typologie.js`, `poserEnBandes`).
2. **Le cache d'enveloppes ignorait le mode nuit** : `fits` n'appelait pas
   `solve`. Il le fait dès qu'un équipement porte des `modes`.
3. **Les minima sans variante nommée comptaient le studio** : le plus petit
   séjour de tous les séjours devenait celui du studio, et les logements
   ordinaires perdaient leur plancher (`test-formes`, `test-m5-circulation-utility`).
   `optInVariants` (socle) exclut les variantes qu'il faut demander.

Relevé, 6 graines par surface : 12 à 14 m² → 0/6 ; 15 m² → 2/6 ; 16 à 34 m² → 6/6.
Le plancher réglementaire de 12 m² n'est donc pas encore atteignable par le
générateur : la fiabilité commence à 16 m² (à instruire : murs, zone d'arrivée,
salle d'eau de 3 m²). `test-studio.mjs` ne parie pas sur la limite et part de 18 m².

### Correction de forme du studio (25 septembre 2026, `moteur-2026-09-25.2`)

Constat de Théo : le mode « carré » ne résolvait aucun carré, tous les studios
étaient des rectangles très fins (2,4 × 8 m). Causes mesurées :

- la typologie en bandes ignorait la forme demandée, et le squelette (tenté
  d'abord) ne produisait que des lanières sans circulation à organiser ;
- deux bandes empilées bornent la largeur commune par la plus petite pièce
  (W ≤ aire / profondeur minimale ≈ 2,2 m), une bande unique gonfle la salle
  d'eau : aucune de ces deux dispositions ne peut donner un carré.

Correction : le studio a sa pose propre (`poserStudio`, `typologie.js`) — salle
d'eau étroite dans un coin, séjour en L, rôle `main` pour les deux parties (un
`notch` serait mesuré comme zone de rangement par TH2D-RANGEMENT-001), forme
demandée lue, allongement toléré croissant avec la surface (1 à 16 m², 1,7 à
24 m²). Le squelette est court-circuité, le repli en bandes interdit (un refus
vaut mieux qu'une lanière), et le coin se retente avec des graines voisines.

Mesuré : carré 20 m² → 4,5 × 4,5 m, 30 m² → 5,5 × 5,5 m ; rectangle 20 m² →
4,8 × 4,2 m ; plus aucune lanière. Fiabilité : 16 m² 5 à 6 graines sur 6, 17 m²
et au-dessus 6/6, 15 m² et moins 0/6 — le côté minimal du séjour (2,2 m) ne
laisse plus de place à un coin d'eau de 1,8 m sous 3,9 m de côté. Le biais est
générique : les autres programmes passent encore par le squelette et les
bandes (rectangle à 1,4 visé, pesé faiblement).

### Essai : plafonner la salle d'eau (25 septembre 2026, abandonné)

Constat : une salle d'eau prend toute la profondeur de sa poche (1,7 × 7,4 m,
12,5 m² pour 7,4 m² de cible, à 160 m²). Essai : `maxRatio` sur `bath` avec
`agrement: 0`, pour que `transfererSurplusPlafonne` rende le surplus au voisin.
Mesure sur 60 plans (5 surfaces × 3 nombres de chambres × 1-2 salles d'eau,
2 graines), salle d'eau :

| | Aire moy. / max | Longueur max | Allongement max | Plans générés |
|---|---|---|---|---|
| Sans plafond | 6,5 / 12,2 m² | 5,5 m | 2,8 | 45/60 |
| Plafond 2,0 × besoin | 3,5 / 3,7 m² | 2,2 m | 1,2 | 27/60 |
| Plafond 3,5 × besoin | 5,7 / 6,5 m² | 3,8 m | 2,0 | 44/60 |

Le plafond règle la forme, mais au ratio 3,5 il fait tomber `test-formes` (le L
de 110 m² se replie en rectangle), `test-composition-model` et
`test-m4c-canonical-program` ; 4,0 et 5,0 échouent aussi, de façon non
monotone (la recherche est bornée par budget). Il rend aussi la salle d'eau
juste à son plancher, ce qui fait apparaître un plancher trop bas pour la salle
d'eau avec WC (1,77 × 1,77 m ne reçoit pas cuvette et douche) ; le corriger
seul dégrade le studio. **Rien n'est retenu.** Le WC, déjà plafonné à 3,5, reste
une cabine de 0,9 × 3,6 m (26 plans sur 44 à 3:1 ou plus) : son plafond en m²
ne borne pas l'allongement.

Piste retenue pour la suite : borner l'allongement d'une pièce de service
(rapport longueur / largeur) plutôt que sa surface, ou empiler bain et WC dans
une colonne (empilement des poches du squelette).

### Allongement maximal des pièces de service (25 septembre 2026, `moteur-2026-09-25.3`)

Suite de l'essai précédent : la contrainte porte sur le rapport
longueur / largeur, pas sur la surface. `maxAspect` (socle, `VAL-SERVICE-ASPECT-MAX-001`,
PROVISIONAL, 3,0) pour `bath` et `wc` ; le générateur en tire une aire
(côté minimal² × allongement) que `transfererSurplusPlafonne` applique, au plus
strict de ce plafond et du plafond O1. C'est un mécanisme souple : il rend le
surplus à la pièce voisine quand une disposition existe, et n'invalide aucun
plan ni ne touche à l'allocation des cibles.

Correction liée : un receveur déjà décroché (rangement ou réserve) passait à 8
arêtes et faisait tomber TH2D-FORME-001 ; le transfert ne cible plus que les
pièces à une seule partie.

Mesuré sur les mêmes 60 plans :

| WC | Avant | Après |
|---|---|---|
| Aire moy. / max | 3,2 / 3,5 m² | 2,2 / 2,3 m² |
| Allongement moy. / max | 3,2 / 3,6 | 2,2 / 2,4 |
| WC à 3:1 ou plus | 34 sur 45 | 0 sur 44 |
| Plans générés | 45/60 | 44/60 |

Suite complète verte. `test-m4c-canonical-program` : graine du témoin passée de
55 à 40 (la parentale de la graine 55 n'avait plus la proportion qui refuse le
lit king ; 40 tient la même propriété).

**Limite** : la salle d'eau n'est presque pas touchée (allongement max 2,8, aire
max 13,4 m² dans les grandes maisons à deux salles d'eau) — le surplus n'y
trouve souvent aucun voisin à une seule partie qui borde la bonne arête. Un plan
sur 60 est perdu (45 → 44).

## 12. Prochaine étape

Bloc « Composition » de l'interface, remplissage progressif aléatoire (le
programme dépendra de la graine : `engineRevision` indispensable), zone à
4 places pour T1 / studio ≤ 45 m², et instruction des 12 à 15 m².
