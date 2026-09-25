# Différentiel de mobilier — suite de `REF-1`

**Produit le 25 septembre 2026.** Complète
[`DIFFERENTIEL_REFERENTIEL.md`](DIFFERENTIEL_REFERENTIEL.md), qui tranchait le
mobilier au niveau des familles, par un croisement **objet par objet** du
catalogue « mobilier » de l'étalon avec notre socle. Règles du chantier :
[`AUDIT_REFERENTIEL_EXTERNE.md`](AUDIT_REFERENTIEL_EXTERNE.md) §3.

Ce document ne modifie aucun fichier du moteur. Il ne recopie ni la liste
d'objets, ni leurs cotes : le croisement ligne à ligne vit dans le scratchpad de
la session, hors dépôt. Rien de ce qui suit n'autorise une cote — toute valeur
proposée ici est une **question** à sourcer, pas une décision.

**Périmètre.** Sous-menu « Meubles » de l'étalon : 7 rubriques, 375 entrées, soit
**196 objets distincts** (un objet figure dans plusieurs rubriques). Les autres
sous-menus d'« Aménager » — extérieurs, électricité, plomberie, symboles — ne
sont pas relevés ici.

**Notre côté.** `assets/socle.data.js` : 33 déclarations d'équipement (31
identifiants) et 7 tailles de gamme, dans 12 pièces équipées. Le relevé des zones
d'usage est lu dans le code, pas dans la doctrine.

---

## 1. Le résultat en une phrase

Sur 196 objets, **139 ne réclament rien** (86 couverts, 53 écartés avec motif) et
**39 sont couverts en partie** ; il reste **18 lignes** qui ne sont pas au socle
— 9 déjà spécifiées en doctrine mais non activées, 9 absentes de tout document.
Et surtout : **la faiblesse n'est pas la nomenclature, c'est la zone d'usage.**
Parmi les objets qui s'utilisent depuis une face, **24 n'ont aucune zone chez
nous** (ou une zone spécifiée mais non portée) et 7 n'en ont que par
l'intermédiaire d'un autre équipement — voir §4.

## 2. Verdicts, par famille

| Famille | Objets | Couvert | Partiel | Doctrine, non activé | Écarté | Manque |
|---|---:|---:|---:|---:|---:|---:|
| Cuisine | 50 | 33 | 6 | 1 | 10 | — |
| Sanitaire | 35 | 10 | 20 | 2 | 2 | 1 |
| Assise, média | 27 | 14 | 5 | — | 8 | — |
| Décor, loisir, hors domaine, événementiel, réseaux | 30 | — | — | — | 30 | — |
| Bureau, technique, buanderie | 15 | 13 | 1 | — | 1 | — |
| Rangement | 10 | 4 | 6 | — | — | — |
| Repas | 12 | 7 | 1 | 3 | 1 | — |
| Couchage | 10 | 5 | — | — | — | 5 |
| Chambre (chevet, commode, coiffeuse, langer) | 6 | — | — | 3 | — | 3 |
| Accessibilité | 1 | — | — | — | 1 | — |
| **Total** | **196** | **86** | **39** | **9** | **53** | **9** |

**Lecture.**

- **Couvert (86).** Un équipement du socle porte l'objet. Les emprises de notre
  socle tombent dans les fourchettes de l'étalon pour tous les équipements
  comparables ; les rares dépassements se jouent à quelques centimètres sur
  des objets uniques (chauffe-eau, sèche-linge, lave-vaisselle). **Aucun écart de
  dimension ne change un verdict.**
- **Partiel (39).** L'équipement existe mais pas la variante : la forme
  (angle, îlot, quart de cercle), le mode d'ouverture d'un rangement, la
  gamme de tailles (douche, évier, piano de cuisson), l'ancrage d'angle du
  bureau et de la cuvette. Le mécanisme de gamme
  ([`GAMMES_EQUIPEMENTS.md`](GAMMES_EQUIPEMENTS.md)) suffit à les porter ; c'est
  de la couverture, pas de la structure.
- **Doctrine, non activé (9).** Table de chevet, commode, îlot de cuisine,
  tables de 6 places et plus, rangement de salle d'eau. Déjà cotés en `N3` ou
  `[D]` dans `profils/`, bloqués par le même mécanisme : **l'équipement lié**
  (`DIFFERENTIEL_REFERENTIEL.md` §2). Rien de nouveau ici.
- **Manque (9).** Aucun équipement, aucune doctrine : coiffeuse, lit d'enfant,
  lit de bébé, lit superposé, table à langer, bidet.
- **Écarté (53).** Motif écrit ligne à ligne dans le croisement, repris de
  `DIFFERENTIEL_REFERENTIEL.md` §5.4 : ce qui est superposé ou intégré au
  linéaire (four, hotte, congélateur, micro-ondes, meubles hauts), déjà compté
  par une zone d'usage (chaises, tabourets), décor sans verdict, mobilier
  tertiaire, réseaux, plans de table événementiels.

## 3. Ce qui, dans les manques, passerait la gate

> Une caractéristique n'entre au modèle que si elle change un verdict.

Proposition de tri — à trancher, pas tranchée :

| Manque | Change un verdict ? | Pourquoi |
|---|---|---|
| Lit d'enfant, lit superposé | **oui, plausible** | La chambre d'enfant n'a aujourd'hui que le lit simple ; son plancher de meublabilité en dépend |
| Coiffeuse | non | Optionnelle, hors programme minimal |
| Lit de bébé, table à langer | non | Fonction d'usage temporaire, sans plancher propre |
| Bidet | non | Optionnel, n'apparaît dans aucun profil |

Le tri n'est pas un jugement de valeur sur ces objets : c'est la même règle
qui a écarté 53 lignes. Un manque qui ne passe pas la gate reste **consigné**.

## 4. Les équipements sans zone de circulation associée

Ce que l'on appelle ici *zone* est le champ `usage` de l'équipement : le
dégagement requis par face (`front`, `long`, `foot`, `back`, `around`), que
le placement et les règles bloquantes opposent. Ce n'est pas la circulation
de la pièce (`accessClearance`), qui est un autre mécanisme.

### 4.1 Dans notre socle : quatre déclarations sur 33, trois équipements

| Équipement | Où | Zone déclarée | Constat | Verdict proposé |
|---|---|---|---|---|
| **Fauteuil** `armchair` | séjour, dès 22 m² | **aucune** | Seul équipement de séjour sans zone ; il n'a que deux relations (distance de conversation au canapé) qui parlent de *placement*, pas d'*accès*. Rien n'empêche de poser son assise face à un mur | **Écart réel** |
| Bureau `desk` | chambre enfant, bureau | aucune sur lui | Le recul est porté par la **chaise** (`office_chair`, `back` 0,60) et relié au bureau par `OFFICE-STATION-001` (zone partagée, `SHARED_USAGE_ZONE`). Bureau et chaise s'activent aux mêmes seuils | `couvert par un autre équipement` — à surveiller si l'un est un jour activé sans l'autre |
| Sèche-serviettes `towel_rail` | salle d'eau, dès 4 m² | aucune | Mural, 0,15 m de profondeur : il ne s'utilise pas depuis une face au sens du plancher. Sa cote est elle-même « non sourcée » | `écarté` — sans verdict |

Un cas voisin, qui n'est pas un manque : la **table basse** déclare bien une
zone (`front` 0,45), mais **non bloquante** (`accessRequired: false`), par
choix : on la contourne, on n'y accède pas.

### 4.2 Hors socle : équipements que l'étalon porte et pour lesquels nous n'avons **aucune** zone

C'est le plus important, et c'est ce que le croisement objet par objet
fait apparaître. Deux situations, qu'il ne faut pas confondre.

**a) Spécifiés en doctrine, mais leur dégagement ne l'est pas.**

| Équipement | Emprise doctrinale | Zone doctrinale | Constat |
|---|---|---|---|
| Table de chevet | `N3`, `profils/chambre.md` §3 | **aucune** | Le chevet se pose *le long du lit*, donc dans la zone `long` (0,60) du lit. Qu'il l'occupe ou s'y ajoute est **une question sans réponse dans aucun document** |
| Commode | `N3`, non activée | **aucune** | Un meuble à tiroirs exige un `front` ; aucune doctrine ne le chiffre |
| Îlot de cuisine | `profils/cuisine.md` | **1,20 m des deux côtés**, `[D]` | Zone **spécifiée** mais non portée : c'est l'équipement lié qui manque, pas la cote |
| Tables de 6 places et plus | `profils/sejour.md` §3, non sourcée | zone `around` de la table de 4 | Le recul de 0,60 est celui d'une table de 4 ; à étendre avec l'emprise |
| Rangement de salle d'eau | absent du socle | **aucune** | Meuble à portes ou tiroirs : `front` attendu |

**b) Ni équipement, ni doctrine, ni zone.** Coiffeuse (assise, donc `front`),
lit d'enfant, lit de bébé et lit superposé (accès `long`, `foot`), table à
langer (accès frontal), bidet (accès frontal, entre cuvette et lavabo).

### 4.3 Ce qu'on en retire

1. **Une seule lacune est un défaut de notre socle actuel : le fauteuil.** Elle
   est petite, et une cote existe déjà chez nous — `agencement/salon.md` L4,
   0,50 m entre fauteuil et table basse `[S2]` — qui est un *écart* entre deux
   équipements, pas une zone d'accès. La question à poser est : L4 vaut-elle
   `front` du fauteuil ?
2. **La lacune de fond est le lien chevet ↔ lit.** C'est là que la zone
   d'usage est le plus mal définie : deux équipements *liés* dont l'un se
   pose dans la zone de l'autre. À traiter avec l'équipement lié, pas avant.
3. **Chevet, commode, îlot, table de 6 : 4 lignes, un seul verrou.** Elles
   n'entreront pas au socle avec leur zone tant que le mécanisme de
   l'équipement lié n'existe pas. Il faut alors **leur donner une zone en
   même temps que leur emprise** — l'ajouter après recrée l'écart que ce
   document mesure.
4. **Aucune zone n'est proposée ici en valeur.** Les seules cotes disponibles
   sont celles de la doctrine (îlot 1,20 `[D]`, L4 0,50 `[S2]`). Le reste est
   à sourcer via [`DATASOURCE_EQUIPEMENTS.md`](DATASOURCE_EQUIPEMENTS.md) et
   [`VEILLE_NORMATIVE.md`](VEILLE_NORMATIVE.md).

## 5. Ce que ce document ne dit pas

- Il ne prouve pas que nos zones sont *justes*, seulement lesquelles
  **existent**. L'écart de 33 % à 55 % entre nos dégagements et ceux que
  l'étalon a cuits dans ses emprises reste la question ouverte de
  `DIFFERENTIEL_REFERENTIEL.md` §6.
- Il ne compte que les équipements que le **catalogue de mobilier** de
  l'étalon nomme. Nos équipements sans pendant dans ce sous-menu — placard
  d'entrée, tableau électrique, emplacement de véhicule — ne sont pas jugés ici.
- Le classement « zone attendue » de §4 est une lecture d'usage : un objet est
  dit *appeler une zone* s'il s'utilise depuis une face. Il est discutable
  ligne à ligne, et le croisement indique le motif de chaque ligne.

## 6. Où le lire

Ce croisement est rendu visible, en continu, dans la page **Équipements &
pièces** (`#catalogue`), alimentée par `assets/catalogue.data.js` :

- **Vue d'ensemble** — l'avancement par état et par rubrique, et trois jauges de
  complétude : icône, cote, zone d'usage ;
- **Par pièce** — les mêmes 83 types rangés en sept rubriques, avec leurs
  vignettes ; un équipement sans icône y figure sur un gabarit vide, un
  équipement sans cote affiche « Cote à sourcer » ;
- **Zones d'usage** — ce qui n'a pas de zone de circulation associée, du plus
  grave au plus bénin ;
- **Moteur** et **Pièces** — les vues d'origine, inchangées.

Le registre regroupe les 196 objets du croisement en 83 types, dans notre
nomenclature : il ne porte ni cote, ni image, ni identifiant de l'étalon
(§3 de la trame). Il ne pilote aucun verdict ; `test-catalogue-mobilier.mjs`
garde sa cohérence avec le socle. Quand un manque est comblé, on change son
`statut` dans ce fichier, et la page suit.
