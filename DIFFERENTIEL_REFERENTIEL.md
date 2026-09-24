# Différentiel de référentiel — livrable de `REF-1`

**Produit le 24 septembre 2026.** Trame et règles du chantier :
[`AUDIT_REFERENTIEL_EXTERNE.md`](AUDIT_REFERENTIEL_EXTERNE.md).

Ce document ne modifie aucun fichier du moteur. Il tranche ligne à ligne et
ouvre des items ; il n'en exécute aucun.

**Étalon.** Un éditeur de plans 2D/3D manuel grand public, relevé le
24 septembre 2026 : catalogue public de 826 objets sur 65 catégories, et les
panneaux de propriétés de ses entités. Rien n'en est recopié — ni visuel, ni
base, ni code. Ce qui est retenu ici est une structure, une nomenclature et
des dimensions d'usage, réécrites dans notre vocabulaire.

**Gate appliquée à chaque ligne.** *Une caractéristique n'entre au modèle que
si elle change un verdict.* Les lignes `écarté` portent leur motif : ce sont
des choix, pas des oublis.

---

## 1. Le résultat en une phrase

Notre modèle est **plus profond** que l'étalon là où il décide — ancrage,
dégagement par face, relations, débattement opposable — et **plus étroit** là
où il énumère : 29 équipements contre 285 objets dans notre seul domaine,
13 types de pièce contre 27. Après vérification contre le code (§2), les
manques que l'étalon révèle et que nous ne connaissions pas tiennent en
**trois lignes**. Le principal résultat de l'audit n'est pas une ligne de
référentiel : c'est **un mécanisme déjà identifié chez nous**, l'équipement
lié, qui en débloque quatre autres à lui seul.

## 2. Passe de vérification du 24 septembre 2026 — six lignes sur neuf tombent

**Les verdicts ci-dessous ont été repris contre le code et les profils, après
une première rédaction fondée sur les documents de haut niveau et les schémas.
Six des neuf lignes `à intégrer` n'ont pas survécu.** Elles décrivaient des
manques qui, ou bien n'existent pas, ou bien étaient déjà connus, spécifiés et
sourcés chez nous avant que cet audit ne commence.

| Ligne annoncée | Ce que le code dit | Verdict revu |
|---|---|---|
| Coulissant | `solveDoorOpening` implémente la hiérarchie **O3** complète : ouvrir dehors → coulisser → ouvrir dedans → repli coulissant non conforme | `couvert`. Seul le **galandage** resterait, et il exige une cote d'épaisseur |
| Table de chevet | `profils/chambre.md §5` la porte déjà, cotée `0,35 / 0,40 / 0,50` en `N3`, et la déclare *absente du socle* | `couvert par la doctrine`, bloqué par un mécanisme |
| Commode | `profils/chambre.md §5`, cotée `0,80 × 0,50` en `N3`, *non activée* | idem |
| Îlot de cuisine | `profils/cuisine.md §64` et `agencement/cuisine.md §78`, dégagement `1,20 m` des deux côtés, *proposé, non activé* | idem |
| Dressing | `DECISIONS_PROGRAMME.md §2.2`, arbitré, *à faire*, cote `1,50 m` à confirmer | item déjà ouvert, hors de cet audit |
| Mur porteur / cloison | `construction.js` porte déjà `exterior` → `0,30` et `interior` → `0,10` | `couvert` géométriquement ; nommer le type ne change aucun verdict tant que le galandage n'existe pas |

**Pourquoi l'erreur.** La première rédaction a lu `PLAN_SCHEMA.json`,
`SOCLE_AGENCEMENT.md` et `OUVERTURES_ET_PARCOURS.md` — qui disent ce que le
modèle *doit* porter — sans lire `generator.js`, `construction.js` et les
fiches de `profils/`, qui disent ce qu'il porte *déjà*. Un audit de complétude
qui ne lit pas le code mesure l'écart entre deux documents, pas entre deux
moteurs.

**Ce que la correction fait apparaître, et qui vaut plus que la liste
initiale.** Chevet, commode, îlot et dressing sont quatre lignes **déjà
spécifiées et déjà sourcées chez nous**, et elles sont bloquées par *une
seule et même chose* : le socle ne sait exprimer ni quantité dépendante, ni
activation conditionnelle. `profils/README.md §48` et
`GAMMES_EQUIPEMENTS.md §7` nomment déjà ce manque — **l'équipement lié**.

Ce n'est pas une ligne de référentiel. C'est un **mécanisme**, et il en
débloque quatre d'un coup. Il ne vient pas de l'étalon : il était chez nous,
écrit, et l'audit l'a remonté en cherchant ailleurs.

## 3. Ce que la confrontation a d'abord corrigé chez nous

Le survol du 24 septembre annonçait le débattement de porte absent du moteur.
**C'est faux.** `OUVERTURES_ET_PARCOURS.md` §2 porte `swing: { side, angle }`,
`construction.js` le calcule (`swingFromFace`), et il est opposable par une
règle bloquante — `S3` au socle, `TH2D-OUV-004` au référentiel. La première
valeur de cet audit aura été de défaire une croyance sur notre propre modèle,
avant d'en tirer quoi que ce soit sur celui d'un autre.

La leçon vaut pour la suite du document : chaque ligne `à intégrer` ci-dessous
a été vérifiée dans le code ou les schémas, pas déduite du survol.

## 4. La découverte principale — un dégagement caché dans l'emprise

L'étalon n'a **aucun modèle de dégagement**. Un objet y porte une largeur, une
longueur, une rotation : rien qui dise ce qu'il faut laisser libre autour de
lui. Il a pourtant fallu que ses plans restent crédibles.

La solution retenue se lit dans les cotes : **l'emprise catalogue d'un objet
est plus grande que la cote annoncée par son propre nom.** Le relevé est
régulier :

| Objet, tel que nommé | Cote nominale | Emprise catalogue | Écart |
|---|---|---|---|
| Table 4 personnes 90 × 90 | 900 × 900 | 2100 × 2100 | +1200 sur chaque axe |
| Table 6 personnes 125 × 125 | 1250 × 1250 | 2450 × 2450 | +1200 sur chaque axe |
| Table ronde 2 personnes 74 × 74 | 740 × 740 | 1940 × 1940 | +1200 sur chaque axe |
| Table 2 personnes 74 × 74 | 740 × 740 | 740 × 1940 | +1200 sur un seul axe |
| Bureau rectangulaire 140 × 80 | 1400 × 800 | 1400 × 1190 | +390 côté assise |
| Bureau rectangulaire 180 × 80 | 1800 × 800 | 1800 × 1180 | +380 côté assise |
| Coiffeuse 100 × 50 | 1000 × 500 | 1000 × 830 | +330 côté assise |

Quinze objets du domaine présentent cet écart, et il n'est pas du bruit :
**+1200 mm sur un axe, soit 600 mm de part et d'autre**, pour tout ce qui se
mange autour ; **+380 à +390 mm sur une seule face** pour tout ce qui se
travaille assis. Ce sont des reculs de chaise, cuits dans l'emprise faute de
pouvoir les exprimer.

Trois conséquences, et c'est le cœur du livrable :

1. **Nos emprises ne sont pas comparables aux leurs.** Toute reprise naïve
   d'une cote de ce catalogue importerait un dégagement en le prenant pour un
   meuble. C'est la raison pour laquelle ce document ne reprend aucune cote.
2. **Notre séparation emprise / zone d'usage est validée par l'extérieur.**
   Elle n'est pas un raffinement : c'est ce qui permet à une table de tenir
   dans une pièce où son emprise cuite ne tiendrait pas, et de le prouver.
3. **Nos valeurs sont plus généreuses que les leurs.** `dining_table_4` exige
   `around: 0.80`, contre 0,60 implicite ici ; `office_chair` exige
   `back: 0.60`, contre 0,38 à 0,39. Ce n'est pas une erreur — nos valeurs
   sont sourcées — mais c'est un écart de 33 % à 55 % sur des cotes qui
   décident de la faisabilité d'une pièce. Il mérite d'être su, et posé
   comme question à `VEILLE_NORMATIVE.md`, pas tranché ici.

## 5. Verdicts — entité par entité

### 5.1 Ouverture

| Caractéristique | Verdict | Motif |
|---|---|---|
| Débattement, côté et angle | `couvert` | `swing {side, angle}`, S3 bloquante, `TH2D-OUV-004` |
| Largeur de baie, passage utile | `couvert` | `width` / `clear`, `VAL-PMR-007` |
| Types porte / ouverture / fenêtre / porte-fenêtre | `couvert` | `kind`, 4 valeurs |
| Coulissant | `couvert` | **Corrigé au §2.** `solveDoorOpening` implémente la hiérarchie O3 : dehors → coulissant → dedans → repli. `slidingFits` arbitre |
| **Galandage** | **`à intégrer`**, sous condition | Coulisse *dans* le mur, donc sans longueur de mur libre : convertirait des `sliding-fallback` en solutions conformes. Exige une cote d'épaisseur de cloison. Famille 1 |
| **Allège** | **`à intégrer`** | Verdict changé : une allège basse interdit d'adosser un meuble sous la fenêtre. `OUVERTURES_ET_PARCOURS.md` §5 l'annonce comme obstacle futur ; le champ n'existe pas. Famille 1. |
| Hauteur d'ouverture | `à intégrer` | Prérequis de l'allège, sans verdict propre en 2D. Famille 1, avec la ligne ci-dessus. |
| Forme de linteau (6), vitrage (4), volet (6), soubassement, carreaux | `écarté` | Aucun verdict de plan de principe ne change. Relèvent du plan d'exécution et de la représentation. |

### 5.2 Pièce

| Caractéristique | Verdict | Motif |
|---|---|---|
| Rôle, plancher de dignité, plancher de meublabilité | `couvert` | Plus fin que l'étalon, qui ne porte qu'un drapeau *non habitable* |
| Hauteur sous plafond | `écarté` | Hors domaine 2D plain-pied |
| Dressing | item déjà ouvert | **Corrigé au §2.** `DECISIONS_PROGRAMME.md §2.2` l'a arbitré et le porte à faire. L'étalon le confirme, il ne l'apprend pas |
| **Débarras / placard** | **`à intégrer`** | Verdict changé : une surface de rangement non meublée absorbe du programme que le moteur impute aujourd'hui ailleurs. Famille 2. |
| Cellier, buanderie, local technique | `couvert` | Déjà au socle ; leur progression est l'item `C-P3` |
| Double séjour | `à intégrer` | Verdict changé pour les grands programmes ; à traiter après `C-P3`. Famille 2. |
| Couloir, entrée, garage, WC, salle de bain, cuisine, chambre, séjour, salle à manger, bureau | `couvert` | 10 des 27 types de l'étalon |
| Balcon, véranda, terrasse, cave, grenier, sous-sol, comble, trémie, poteau, extérieur | `écarté` | Hors domaine annoncé — plain-pied, pas de niveaux ni d'extérieur bâti (`ETAT_MOTEUR_PROCEDURAL.md` §6.5) |

### 5.3 Mur

| Caractéristique | Verdict | Motif |
|---|---|---|
| Épaisseur, surfaces utiles | `couvert` | `MURS_EPAIS.md` |
| Distinction mur porteur / cloison | `couvert` géométriquement | **Corrigé au §2.** `construction.js` porte `exterior` → `0,30` et `interior` → `0,10`. Nommer le type ne change aucun verdict tant que le galandage n'existe pas ; il le deviendrait alors |
| Matériau (parpaing, pierre, béton, ossature bois, brique) | `écarté` | Aucun verdict de plan de principe. À rouvrir si un jour le moteur chiffre. |
| Décalage d'axe, couleur | `écarté` | Édition manuelle, sans objet pour un générateur |

### 5.4 Équipement

| Caractéristique | Verdict | Motif |
|---|---|---|
| Ancrage typé (mur / angle / libre) | `couvert` | **Absent de l'étalon.** Notre avantage net |
| Zones d'usage par face | `couvert` | **Absent de l'étalon**, qui les cuit dans l'emprise (§3) |
| Relations entre équipements | `couvert` | **Absent de l'étalon** (triangle d'activité, séquence du plan de travail) |
| Gammes de tailles | `couvert` | L'étalon décline 9 variantes de lit, nous 4 ; même mécanisme, notre couverture est plus étroite |
| Table de chevet | `couvert par la doctrine` | **Corrigé au §2.** `profils/chambre.md §5` la cote déjà (`N3`) et la déclare absente du socle. Bloquée par l'équipement lié, pas par l'audit |
| Commode | `couvert par la doctrine` | **Corrigé au §2.** `profils/chambre.md §5`, `0,80 × 0,50` en `N3`, non activée. Même blocage |
| Îlot de cuisine | `couvert par la doctrine` | **Corrigé au §2.** `profils/cuisine.md §64`, dégagement `1,20 m` des deux côtés, proposé et non activé. Même blocage |
| **Hotte, four, congélateur, micro-ondes** | `écarté` | Superposés ou intégrés au linéaire : ne changent pas l'emprise au sol, donc pas le verdict |
| Chaises de table, tabourets, bar | `écarté` | Déjà portés par la zone d'usage `around` de la table. Les ajouter serait compter deux fois — c'est exactement l'erreur que l'étalon commet à l'envers. |
| Télévision, tapis, ordinateur, plante, poubelle, billard, piano | `écarté` | Décor ou usage non contraignant. Aucun verdict. |
| Mobilier tertiaire (table de réunion, ascenseur, imprimante, caisson) | `écarté` | Hors domaine : logement, pas bureau d'entreprise |
| Véhicules, remorques, tondeuse, bornes de recharge | `écarté` | `parking_space` porte déjà l'emprise qui décide du garage |

### 5.5 Accessibilité

| Caractéristique | Verdict | Motif |
|---|---|---|
| Aire de rotation de fauteuil 1500 × 1500 | `couvert` | Au socle, sourcée |
| Passages et abords PMR | `couvert` | `SOCLE_AGENCEMENT.md` |
| Rampe, élévateur, boucle magnétique, parking PMR | `écarté` | Établissement recevant du public, hors domaine |

### 5.6 Étage, toiture, structure, réseaux, énergie

`écarté` en bloc — `ETAT_MOTEUR_PROCEDURAL.md` §6.5 et `DOCTRINE.md` posent le
domaine : plain-pied, sans structure porteuse ni réseaux complets. L'étalon
porte 20 formes de toiture, 10 profils de structure, 79 symboles électriques,
VMC, plomberie, chauffage et un bilan énergétique complet. **Ce n'est pas une
dette : c'est la frontière, et elle est écrite.** L'audit la chiffre pour
qu'elle cesse d'être une impression.

### 5.7 Sortie

| Caractéristique | Verdict | Motif |
|---|---|---|
| **Export DXF** | **`à intégrer`** | Verdict changé au sens du produit, non du moteur : un plan de principe exportable en DXF cesse d'être une image et devient un plan qu'un tiers peut reprendre. Famille 3, décision à part. |
| Export IFC / BIM | `écarté` **pour l'instant** | Exige des hauteurs, des niveaux et une structure que le domaine n'a pas. À rouvrir seulement si le domaine change. |
| glTF, coupes, façades, dossier de permis | `écarté` | Hors domaine 2D non contractuel |
| Import DXF / DWG / IFC / cadastre | `écarté` | Le moteur génère, il ne relève pas |

## 6. Récapitulatif, après vérification

**Trois lignes `à intégrer` survivent**, et une seule est structurante :

| # | Ligne | Famille | Verdict changé | Cote requise |
|---:|---|---|---|---|
| 1 | **Allège**, et la hauteur d'ouverture qu'elle suppose | 1 | Un meuble est adossable, ou non, sous une fenêtre. `OUVERTURES_ET_PARCOURS.md` §5 l'annonce comme obstacle futur ; le champ n'existe pas | oui |
| 2 | **Débarras / placard comme pièce** | 2 | Une surface de rangement non meublée absorbe du programme imputé ailleurs aujourd'hui | oui |
| 3 | ~~**Export DXF**~~ | 3 | Le plan cesse d'être une image. **Écrit le 24 septembre 2026, puis gelé le même jour** — `assets/dxf.js`, R12, sept calques, `test-dxf-export.mjs` tient (structure, repère, ASCII), mais le rendu en CAO n'est pas jugé satisfaisant par Théo. Le code reste en place, hors pilotage actif, jusqu'à reprise décidée | non |

**Et un mécanisme, qui ne vient pas de l'étalon mais que l'audit a remonté** :

| Mécanisme | Ce qu'il débloque | Source |
|---|---|---|
| **L'équipement lié** — quantité dépendante d'un autre équipement, et activation conditionnelle | table de chevet, commode, îlot de cuisine, et le chemin du dressing | `profils/README.md §48`, `GAMMES_EQUIPEMENTS.md §7`, `profils/chambre.md §72` |

C'est le meilleur rapport valeur/coût de tout l'audit : **quatre lignes déjà
cotées et déjà sourcées attendent un seul mécanisme.** Aucune cote extérieure
n'y entre — elles sont toutes à nous, en `N3` ou `[D]`.

**Une nuance résiduelle sur l'ouverture** : le galandage. La hiérarchie O3
coulisse *le long* du mur (`slidingFits` exige une longueur de mur libre
égale à la baie). Un galandage coulisse *dans* le mur et n'exige aucune
longueur libre — seulement une cloison assez épaisse. Il convertirait des
`sliding-fallback` (aujourd'hui `s3Passed = false`, donc pénalisés) en
solutions conformes. Il exige une cote d'épaisseur, et c'est à cette
condition seulement que nommer `porteur` / `cloison` deviendrait utile.

**Une question ouverte, sans verdict ici** : l'écart de 33 % à 55 % entre nos
dégagements et ceux que l'étalon a cuits dans ses emprises (§4). Elle se pose
à `VEILLE_NORMATIVE.md`, qui fait foi pour les cotes. Ce document ne la
tranche pas : il constate qu'elle n'avait jamais été posée.

**Tout le reste est `écarté`**, motif écrit. C'est la moitié de la valeur du
document : 276 des 285 objets du domaine, et la totalité des 541 autres, ont
été regardés et n'entrent pas.

## 7. Ce que cet audit ne dit pas

- Il ne compare pas la qualité des deux outils. Ils ne font pas le même
  métier : l'un dessine ce qu'on lui dicte, l'autre propose et se juge.
- Il ne prouve pas que notre référentiel est complet. Il prouve qu'un étalon
  manuel grand public n'exhibe que neuf manques qui nous coûtent un verdict.
  Un étalon professionnel en exhiberait d'autres — et sera décidé, ou non, au
  vu de ce résultat.
- Il n'autorise aucune cote. Toute valeur retenue en aval devra recevoir une
  source qui nous est propre, conformément au §3 de la trame.
