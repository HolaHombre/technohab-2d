# Audit du référentiel externe — `REF-1`

**Ouvert le 24 septembre 2026.** Chantier d'analyse fermé, mené en parallèle
des autres évolutions du moteur. Ce document est la trame du chantier : il dit
ce qu'on cherche, comment on le mesure, ce qu'on s'interdit, et à quelle
condition le chantier est clos.

Documents que cet audit interroge, sans les modifier :
[`SOCLE_AGENCEMENT.md`](SOCLE_AGENCEMENT.md),
[`MODELE_EXIGENCES.md`](MODELE_EXIGENCES.md),
[`ETAT_MOTEUR_PROCEDURAL.md`](ETAT_MOTEUR_PROCEDURAL.md),
[`PLAN_SCHEMA.json`](PLAN_SCHEMA.json),
[`DATASOURCE_EQUIPEMENTS.md`](DATASOURCE_EQUIPEMENTS.md),
[`GAMMES_EQUIPEMENTS.md`](GAMMES_EQUIPEMENTS.md),
[`OUVERTURES_ET_PARCOURS.md`](OUVERTURES_ET_PARCOURS.md),
[`MURS_EPAIS.md`](MURS_EPAIS.md).

---

## 1. La question posée

Notre moteur sait-il *nommer* toutes les caractéristiques nécessaires à la
génération d'un plan de principe — ou en manque-t-il que tout éditeur de plans
a été contraint de modéliser ?

La question n'est pas « savons-nous dessiner autant de choses ». C'est
`ETAT_MOTEUR_PROCEDURAL.md` §6.4 — *le référentiel architectural est
incomplet* — reposée avec un étalon extérieur au lieu d'une intuition.

## 2. Pourquoi un éditeur manuel comme étalon

ArchiFacile (`archifacile.fr/ed/planenligne`) ne génère rien : l'utilisateur
pose tout. Il n'a donc aucun algorithme à nous apprendre, et ce n'est pas ce
qu'on lui demande.

Sa valeur est ailleurs et elle est réelle : pour qu'un plan soit dessinable,
cotable et exportable en DXF/IFC, il a fallu que chaque entité porte une liste
de caractéristiques close. Cette liste est une **borne basse de complétude** :
ce qu'un éditeur manuel doit modéliser, un générateur ne peut pas ignorer sans
le dire. C'est exactement le rôle d'un étalon.

Corollaire, à tenir : *un référentiel plus riche que le nôtre ne prouve pas
que le nôtre est pauvre.* Notre modèle porte des choses qu'ArchiFacile n'a pas
— dégagements d'usage par face, adjacences, cheminement, résolution de
programme, verdict. L'audit compare des couvertures, il ne classe pas.

## 3. Ce qu'on s'interdit

Le catalogue, les visuels, la base et le code d'ArchiFacile sont leur
propriété. Cette règle n'est pas une précaution de forme, elle borne le
livrable :

- **On extrait** une structure, une nomenclature et des dimensions d'usage.
  Ce sont des faits de métier — une porte de garage fait 2,40 m, une aire de
  rotation de fauteuil 1,50 m — que d'autres sources publient aussi.
- **On ne recopie pas** d'images ni de vignettes, pas la base d'objets telle
  quelle, pas une ligne de code, pas un identifiant propriétaire.
- **Rien de brut n'entre au dépôt.** L'index collecté vit dans le scratchpad
  de la session. Seul le différentiel raisonné — rédigé par nous, dans notre
  vocabulaire — est versionné.
- Toute cote retenue passe par [`DATASOURCE_EQUIPEMENTS.md`](DATASOURCE_EQUIPEMENTS.md)
  et reçoit un `val` **adossé à une source qui nous est propre** : norme, DTU,
  fabricant, `VEILLE_NORMATIVE.md`. Une cote dont la seule source serait cet
  audit est une convention de projet et se lit ainsi.

Ce paragraphe fait foi pour la suite du chantier. En cas de doute sur un
élément, il ne rentre pas.

## 4. La gate qui gouverne tout le reste

> **Une caractéristique n'entre au modèle que si elle change un verdict.**

Un référentiel externe compte 826 objets et 65 catégories. Les absorber serait
convertir une dette de catalogue en travail. Notre North Star est un plan de
principe qui prouve qu'un programme tient, pas un plan d'exécution.

Une caractéristique est donc retenue si — et seulement si — on peut nommer la
décision du moteur qu'elle modifie : une faisabilité, un placement, un
dégagement, un refus, une concession, un classement. À défaut, elle est
consignée comme **écartée**, avec son motif. Une ligne écartée reste une
information : c'est la trace qu'on a regardé et tranché.

## 5. Ce qui a déjà été relevé — survol du 24 septembre 2026

Premier sondage de l'éditeur, non exhaustif, servant à cadrer l'ampleur.

| Entité | Ce que l'étalon porte | Où nous en sommes |
|---|---|---|
| Objets | 826 objets, 65 catégories, emprises en mm | ~35 équipements, avec gammes de tailles et dégagements par face |
| Pièce | 27 types énumérés, drapeau non habitable, hauteur par pièce, sol | 5 rôles, profils typés, plancher de dignité et plancher de meublabilité distincts |
| Mur | 6 épaisseurs typées, 5 matériaux, décalage d'axe | murs dimensionnés, surfaces utiles (`MURS_EPAIS.md`) ; matériau absent |
| Ouverture | 11 types, largeur, hauteur, angle d'ouverture, côté du mur, 6 formes de linteau, 4 vitrages, 6 états de volet, soubassement | 4 types, largeur, passage utile, **débattement `{side, angle}` déjà modélisé** et opposable (S3, `TH2D-OUV-004`) ; hauteur et allège absentes ; coulissant et galandage non distingués |
| Accessibilité | 15 objets PMR dont l'aire de rotation 1500×1500 | PMR traité dans `SOCLE_AGENCEMENT.md`, couverture à confronter |
| Étage, toiture, structure | étages et dalles, 20 formes de toiture, bois/béton/métal | hors domaine annoncé (`ETAT_MOTEUR_PROCEDURAL.md` §6.5) |
| Réseaux, énergie | 79 symboles électriques, VMC, plomberie, bilan énergétique | hors domaine annoncé |
| Sortie | DXF, IFC/BIM, glTF, dossier permis de construire | PNG, JSON, audit humain standardisé |

Ce tableau est une **hypothèse de travail**, pas un résultat. Il est daté pour
cette raison : le livrable du §7 le remplace ou le contredit.

## 6. Les quatre familles d'écart

Ordre de coût croissant. L'audit doit confirmer ou défaire ce classement.

1. **L'ouverture.** Le débattement est déjà porté et déjà opposable — le
   survol du 24 septembre l'avait annoncé absent, à tort, et
   `OUVERTURES_ET_PARCOURS.md` §2 le contredit. Ce qui manque est plus
   étroit : les modes **coulissant et à galandage**, qui annulent le
   débattement sans annuler l'ouverture, et l'**allège**, annoncée au §5 du
   même document comme obstacle futur mais absente du modèle. Écart court,
   rendement immédiat.
2. **Le socle et la typologie.** Équipements manquants, types de pièce
   manquants, matériau et épaisseur de mur portés comme attribut.
3. **La sortie interopérable.** Un export DXF ou IFC est la preuve externe
   qu'un plan de principe est un plan. Forte valeur, coût réel, décision à part.
4. **Le hors-périmètre assumé.** Étages, toitures, structure porteuse,
   réseaux, énergie. L'audit les chiffre ; les ouvrir est une décision, pas
   une suite naturelle.

## 7. Le livrable

**Un seul document**, `DIFFERENTIEL_REFERENTIEL.md`, produit à la clôture.
Une ligne par caractéristique, trois colonnes de verdict :

- `couvert` — le modèle le porte déjà ; où, sous quel nom ;
- `à intégrer` — verdict modifié nommé, famille du §6, coût estimé ;
- `écarté` — motif, et si le motif est le périmètre assumé, le § qui le pose.

Ce document ne modifie ni le socle, ni le schéma, ni le générateur. Il ouvre
des items de roadmap ; il n'en exécute aucun. Un audit qui corrige au fil de
l'eau perd sa valeur de mesure.

## 8. La méthode

1. Relever l'index du catalogue public et les panneaux de propriétés de
   l'éditeur — entités, champs, énumérés, unités. Scratchpad uniquement.
2. Normaliser en une grille de caractéristiques dans **notre** vocabulaire.
   Cette réécriture n'est pas cosmétique : elle est ce qui sépare une analyse
   d'une copie.
3. Confronter ligne à ligne à `assets/socle.data.js`, `PLAN_SCHEMA.json`,
   `MODELE_EXIGENCES.md` et les profils de `profils/`.
4. Appliquer la gate du §4 à chaque ligne, et écrire le motif — y compris
   pour les lignes retenues.
5. Rédiger `DIFFERENTIEL_REFERENTIEL.md` et ouvrir les items qu'il justifie.

## 9. Ce qui clôt le chantier

`DIFFERENTIEL_REFERENTIEL.md` existe, chaque ligne porte un verdict et un
motif, aucune ligne `à intégrer` n'est sans verdict moteur nommé, et aucun
fichier du moteur n'a été modifié par l'audit.

L'effort visé est d'un à deux jours. S'il déborde, c'est que la gate du §4
n'est pas appliquée : la réponse est de resserrer, pas d'allonger.

## 10. Ce qui n'est pas dans ce chantier

- Toute intégration au moteur. Elle passe par un item de roadmap distinct.
- Toute comparaison de qualité entre ArchiFacile et TechnoHab. Les deux outils
  ne font pas le même métier ; les opposer n'apprendrait rien.
- Tout élargissement du domaine annoncé. `DOCTRINE.md` et
  `ETAT_MOTEUR_PROCEDURAL.md` §6.5 continuent de faire foi tant qu'une
  décision explicite ne les révise pas. **Décision du 24 septembre 2026 :**
  les domaines écartés pour cette raison sont néanmoins *décrits*, dans
  [`REFERENTIEL_ETENDU.md`](REFERENTIEL_ETENDU.md), parce qu'un domaine décrit
  quand on le rencontre coûte moins cher qu'un domaine redécouvert quand on en
  a besoin. Décrire n'est pas ouvrir : ce document ne rend aucun verdict et
  n'ouvre aucun item.
- Tout autre étalon. Un second référentiel se décidera au vu de ce livrable,
  pas avant.
