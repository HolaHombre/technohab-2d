# Gammes d'équipements — plages de dimensions et mobilier manquant

Le socle donne à chaque équipement **une** emprise. Ce document propose de lui
donner une **gamme** : plusieurs tailles mutuellement exclusives, dont une
seule est retenue selon la pièce qui la reçoit.

Document de conception. Il fait foi sur le mécanisme et sur les tailles
proposées ; [`SOCLE_AGENCEMENT.md`](SOCLE_AGENCEMENT.md) fait foi sur les
cotes existantes, [`DATASOURCE_EQUIPEMENTS.md`](DATASOURCE_EQUIPEMENTS.md) sur
leur sourcing, [`ROADMAP.md`](ROADMAP.md) §5 octies sur l'ordre des travaux.

---

## 1. Le constat

Un lit fait 1,40 × 1,90, un canapé 1,80 × 0,90, une douche 0,90 × 0,90. Ces
nombres sont des conventions défendables, et le socle les présente comme des
faits. Trois conséquences se sont accumulées.

**Une chambre de 18 m² reçoit le même lit qu'une chambre de 9 m².** Le moteur
sait refuser une pièce trop petite ; il ne sait pas se servir d'une pièce
grande. La surface excédentaire est comptée en agrément, jamais en usage.

**Quatre équipements sur vingt-huit sont inatteignables.** Relevé le 21 août
2026 sur `selectedEquipments()` :

| Équipement | Déclaration | Effet |
|---|---|---|
| `bedroom/bed_160` | `required: false`, pas de `minRoomArea` | jamais désigné |
| `entree/closet` | idem | jamais désigné |
| `bureau/bookcase` | idem | jamais désigné |
| `buanderie/dryer` | idem | jamais désigné |

`bed_160` avait été ajouté sur la recommandation de `DATASOURCE_EQUIPEMENTS.md`
§7.2 — le marché ayant basculé du 140 × 190 vers le 160 × 200. Il n'a jamais
été posé dans un plan : il n'existe que dans le catalogue du compositeur, où
l'utilisateur peut l'ajouter à la main. Ce n'est pas un oubli de câblage, c'est
l'absence du concept — le socle n'a pas de mot pour « autre taille du même
équipement ».

*Corrigé en G1 : `bed_160` et `bed_180` sont devenus des membres de la gamme du
lit ; `closet`, `bookcase` et `dryer` ont reçu le `minRoomArea` qui leur
manquait. Ces trois pièces n'étant pas générées, l'empreinte du banc le
confirme — elle n'a pas bougé.*

**Le plan de travail est un carré de 0,60.** Or `SOCLE_AGENCEMENT.md` §5.4 le
décrit comme « 0,60 **min** entre évier et plaque » : une longueur minimale, pas
une emprise. Le socle a transcrit un minimum en dimension fixe, ce qui interdit
au moteur de faire ce que fait toute cuisine réelle — dérouler un linéaire d'un
mur à l'autre.

## 2. Ce que le modèle sait dire aujourd'hui

`selectedEquipments()` ([`assets/room-model.js:35`](assets/room-model.js)) n'a
que trois branches :

```js
if (equipment.variant && equipment.variant !== variant) return false;  // variante de PIÈCE
if (equipment.required) return true;                                    // toujours
return … Number.isFinite(equipment.minRoomArea) && context.area >= equipment.minRoomArea;
```

Soit trois mécanismes : la **variante de pièce** (`enfant` / `parentale`,
`eau` / `bain`), le **requis inconditionnel**, et le **seuil de surface** pour
un optionnel. Aucun n'exprime un choix exclusif entre tailles.

Le contourner avec les mécanismes existants ne marche pas :

- quatre tailles en `required: true` seraient **toutes** posées ;
- quatre tailles en `required: false` avec des seuils croissants seraient
  **cumulées** dès que la pièce est grande — trois canapés dans un séjour ;
- multiplier les variantes de pièce (`parentale_140`, `parentale_160`…) ferait
  exploser `fit.data.js` et mélangerait deux notions distinctes : ce que la
  pièce **est** et ce qu'on **y met**.

Il manque un quatrième mécanisme. C'est tout l'objet de ce document.

## 3. La gamme

Une gamme est une famille de tailles d'un même équipement, dont **exactement
une** est retenue. Elle porte ce qui ne dépend pas de la taille — ancrage,
dégagements, réseaux, identité — et délègue à ses membres ce qui en dépend.

```js
{
  id: 'sofa', label: 'Canapé', required: true,
  footprint: { w: 1.80, d: 0.90 },          // le plancher reste ici
  anchor: 'wall', usage: [{ face: 'front', min: 0.90 }],
  sizes: [                                   // les montées, et elles seules
    { id: 'sofa_3', label: 'Canapé 3 places', from: 24, footprint: { w: 2.20, d: 0.90 } },
    { id: 'sofa_angle', label: 'Canapé d’angle', from: 30, footprint: { w: 2.20, d: 2.20 }, anchor: 'corner' }
  ]
}
```

Quatre règles de lecture.

**Le plancher reste dans `footprint`, jamais dans `sizes[0]`.** C'est la décision
qui porte tout le reste. `requiredEquipments()` et `build-envelopes.mjs`
continuent de lire la plus petite taille sans rien connaître des gammes : ils ne
voient même pas le champ `sizes`. Ajouter une taille ne peut donc pas déplacer un
domaine de faisabilité — l'invariant du §4 est tenu par construction, et le test
ne fait plus que le confirmer.

**Le membre retenu est le plus grand dont le seuil est atteint**, le plancher à
défaut. Le choix est déterministe et ne dépend que de la surface : la graine fait
varier la pose, jamais le programme.

**`id` ne change jamais.** Une montée en gamme change l'emprise, pas l'identité :
`LIVING-FOCAL-001` nomme `sofa` et doit continuer de s'appliquer quand le séjour
reçoit un trois-places. La taille retenue se relit dans `size`. Donner au membre
son propre identifiant aurait désactivé en silence toutes les relations de la
pièce dès la première montée.

**Un membre peut redéfinir `anchor`, `usage`, `label` et `val`.** Le canapé
d'angle change d'ancrage ; le lit de 1,60 change de longueur et de source. Ce qui
n'est pas redéfini est hérité.

### Le repli, sans lequel le mécanisme est faux

Une montée en gamme peut rendre non meublable une pièce qui l'était : un séjour
de 30 m² mais large de 2,00 m accepte le canapé plancher et refuse l'angle.

`app.js` pose donc deux replis, **du moins destructeur au plus** : rabattre la
gamme sur son plancher, puis seulement retirer les équipements non requis. Dans
cet ordre, une montée en gamme ne peut jamais laisser une pièce moins meublée
qu'avant les gammes. L'ordre inverse aurait retiré la table basse pour garder le
canapé d'angle — un mauvais échange, et silencieux.

Ce défaut n'a été trouvé qu'à l'exécution : le banc mesure la géométrie du plan
et non son ameublement, et serait resté muet.

### Ce que la gamme dissout

`DATASOURCE_EQUIPEMENTS.md` §1 énonce le levier le plus structurant du sourcing :
*cesser d'affirmer*. Tant que le socle porte une taille unique, il soutient
qu'un lit fait 1,40 × 1,90. Avec une gamme, il dit : voici les tailles du
marché, voici celle que votre pièce reçoit, et vous pouvez en changer. Les
cotes redeviennent des valeurs par défaut modifiables — ce qu'elles auraient
toujours dû être. La gamme n'est pas qu'une commodité de dimensionnement :
c'est la structure de donnée qui rend l'aveu de non-opposabilité tenable.

## 4. L'invariant à tenir

Le plancher de meublabilité de `fit.data.js` est calculé sur les équipements
**requis** ([`build-envelopes.mjs`](scripts/build-envelopes.mjs)).
Avec une gamme, il se calcule sur son **membre plancher**.

Donc : **ajouter des tailles au-dessus du plancher ne change aucune enveloppe.**
C'est la propriété qui rend le chantier sûr, et elle est vérifiable au bit près
— comme l'a été le chantier 1, en comparant l'empreinte du banc à graine égale.

Abaisser un plancher, en revanche, abaisse le seuil de meublabilité de la pièce
et laisse passer des pièces aujourd'hui refusées. Ce n'est pas interdit, c'est
une décision : elle se prend gamme par gamme, avec sa justification, jamais
comme effet de bord d'un ajout de taille. Deux abaissements sont proposés plus
bas ; les deux sont sourcés.

## 5. Gammes proposées

Statut de source repris de `DATASOURCE_EQUIPEMENTS.md` : `N2` standard de fait
vérifiable, `N3` convention TechnoHab, `—` non sourcé. Le seuil `from` est en
m² de la pièce hôte.

### 5.1 Lit — `bedroom`

**Livré en G1**, sans le 0,80.

| Variante | Taille | Emprise | `from` | Source |
|---|---|---|---:|---|
| enfant | 90 | 0,90 × 1,90 | plancher | `VAL-EQ-001` N2 |
| parentale | 140 | 1,40 × 1,90 | plancher | `VAL-EQ-002` N2 |
| parentale | 160 | 1,60 × 2,00 | 12 | `VAL-EQ-003` N2 |
| parentale | 180 | 1,80 × 2,00 | 16 | `VAL-EQ-004` N2 |

**Abaissement du plancher enfant, 0,90 → 0,80 : écarté.** Non sourcé, et il
ferait passer l'enveloppe `enfant` sous 1,50 × 3,10, laissant entrer des chambres
aujourd'hui refusées. Le plancher reste à 0,90 ; seuls le 160 et le 180 ont été
ajoutés, ce qui laisse l'enveloppe intacte. À rouvrir si une source paraît.

**Le passage de 1,90 à 2,00 m de longueur est la vraie valeur du lot.**
`DATASOURCE` le signale : une chambre calée au plus juste sur 1,90 ne recevra
pas un lit de 2,00. La gamme le rend sûr — le 160 n'apparaît que dans une pièce
qui peut l'absorber.

### 5.2 Canapé — `living`

**Livré en G1.**

| Taille | Emprise | `from` | Ancrage | Source |
|---|---|---:|---|---|
| 2 places | 1,80 × 0,90 | plancher | mur | — |
| 3 places | 2,20 × 0,90 | 24 | mur | — |
| Angle | 2,20 × 2,20 | 30 | angle | — |

Aucune de ces cotes n'est sourcée, la première pas davantage que les autres :
le canapé figure déjà en « non sourcé » au §5 de `DATASOURCE`. La gamme
n'aggrave pas la dette, elle la rend visible.

Le **fauteuil** (0,90 × 0,85) n'entre pas dans cette gamme : un fauteuil n'est
pas un petit canapé, c'est un autre meuble. Il relève du §7.

### 5.3 Douche et baignoire — `bath`

| Équipement | Taille | Emprise | `from` | Source |
|---|---|---|---:|---|
| Douche | compacte | 0,80 × 0,80 | plancher | `VAL-EQ-032` N2 |
| Douche | confort | 0,90 × 0,90 | 4 | `VAL-EQ-031` N2 |
| Douche | spacieuse | 1,00 × 1,00 | 5,5 | — |
| Baignoire | droite | 1,70 × 0,70 | plancher | `VAL-EQ-030` N2 |
| Baignoire | grande | 1,80 × 0,80 | 6,5 | — |

**Abaissement du plancher douche, 0,90 → 0,80, sourcé.** `VAL-EQ-032` porte le
receveur compact comme « admis en petite surface », et `VAL-EQ-031` le 0,90
comme « minimum **confortable** » — deux cotes distinctes que le socle avait
réduites à une. C'est l'abaissement le mieux fondé du chantier, et il modifie
l'enveloppe `bath/eau` : conséquence attendue, à mesurer au banc.

La baignoire garde son plancher : le 1,60 existe sur le marché mais n'a pas été
relevé ici.

### 5.4 Lavabo — `bath`

| Taille | Emprise | `from` | Source |
|---|---|---:|---|
| simple | 0,60 × 0,50 | plancher | — |
| double | 1,20 × 0,55 | 6 | — |

Le dégagement reste celui du socle : 0,80 minimum, 1,10 en confort
(`VAL-EQ-033`).

### 5.5 Table à manger — `dining`

| Taille | Emprise | `from` | Source |
|---|---|---:|---|
| 4 places | 1,40 × 0,80 | plancher | — |
| 6 places | 1,80 × 0,90 | 14 | — |
| 8 places | 2,20 × 1,00 | 18 | — |

La table 2 places et la table ronde sont écartées de cette passe : la première
ne sert qu'au studio, qui relève du lot L6 du chantier 7 ; la seconde n'est pas
une taille mais une forme, et le solveur ne raisonne que sur des rectangles.

Le dégagement `around: 0.80` porte le recul de chaise et dimensionne la pièce
— `SOCLE_AGENCEMENT.md` §5.2. Il monte avec la table : 0,80 / 0,85 / 0,90.

### 5.6 Linéaires de rangement

Quatre équipements portent déjà `assumed: true` dans le socle, ce qui signale
exactement ceci : **le socle ne fixe pas leur longueur.**

| Équipement | Pièce | Emprise actuelle |
|---|---|---|
| `wardrobe` | chambre | `MODULE` × 0,60 |
| `closet` | entrée | `MODULE` × 0,60 |
| `bookcase` | bureau | `MODULE` × 0,35 |
| `shelving` | cellier | `MODULE` × 0,45 |

`MODULE = 1,20` est une convention N3 explicitement assumée. La gamme la
remplace par une échelle — 0,80 / 1,20 / 1,60 / 2,00 — sans rien décider de
nouveau : la longueur restait libre, elle devient choisie.

Ces quatre-là sont aussi les premiers candidats au linéaire du §6, s'il voit le
jour. La gamme est le pas praticable maintenant ; le linéaire est le pas juste.

## 6. Le plan de travail — un mécanisme distinct

Le plan de travail n'est pas une gamme. Sa longueur ne se choisit pas dans une
échelle : elle est **déterminée par la pose**, puisqu'elle joint l'évier à la
plaque, quelle que soit la distance entre eux.

```js
{
  id: 'worktop', label: 'Plan de travail', required: true,
  extent: { min: 0.60, max: 4.00, depth: 0.60 },
  anchor: 'wall', between: ['sink', 'hob'],
  usage: [{ face: 'front', min: 0.90 }]
}
```

C'est une extension réelle du solveur, pas une extension de donnée :
`placement.js` pose aujourd'hui des emprises **connues avant la pose**, en
essayant quatre rotations. Un équipement dont l'emprise est un résultat de la
pose est un cas que ni `validate()`, ni `envelope()`, ni le cache de
`fit.data.js` ne savent traiter. La relation `between` existe déjà
([`placement.js:538`](assets/placement.js)) mais vérifie une pose, elle ne la
dimensionne pas.

**À traiter après les gammes, jamais dans le même lot.** Le confondre avec elles
est le plus sûr moyen de faire échouer les deux : les gammes sont une passe de
donnée à mécanisme constant, le linéaire est un changement de solveur.

## 7. Mobilier manquant

Distinct des gammes, et de moindre priorité. Deux catégories, dont une seule
soulève une question de modèle.

**Les équipements liés** — leur nombre dépend d'un autre équipement :

| Équipement | Pièce | Lié à | Quantité |
|---|---|---|---|
| Table de nuit | chambre | le lit | 1 si simple, 2 si double |
| Chaises | salle à manger | la table | 4 / 6 / 8 |

Le socle ne sait pas exprimer une quantité, ni une dépendance entre équipements.
C'est un cinquième mécanisme, distinct de la gamme. Les chaises ont de plus une
particularité : `SOCLE_AGENCEMENT.md` §5.2 les porte **déjà**, dans la zone
d'usage de la table — « les assises sont comprises dans la zone d'usage ». Les
matérialiser en emprises serait un double comptage, sauf à retirer le
dégagement. À trancher avant de les ajouter.

**Les équipements simples** — un ajout de donnée, sans mécanisme nouveau :

| Équipement | Pièce | Emprise proposée | `from` |
|---|---|---|---:|
| Fauteuil | séjour | 0,90 × 0,85 | 22 |
| Commode | chambre | 0,80 × 0,50 | 12 |
| Meuble sous-vasque | salle d'eau | 0,60 × 0,50 | 4 |
| Îlot de cuisine | cuisine | 1,20 × 0,75 | 14 |
| Banc | entrée | 1,00 × 0,40 | 3 |

Aucune n'est sourcée. L'îlot mérite une réserve : il exige 1,00 m de dégagement
sur tout son pourtour et se pose en ancrage libre, ce qui en fait l'équipement
le plus contraignant du socle après l'emplacement de véhicule. À mesurer avant
de l'activer.

## 8. Ce qui reste ouvert

- **Le plancher enfant à 0,80 m** — non sourcé, et il abaisse une enveloppe.
- **Le double comptage des assises** — emprise ou zone d'usage, pas les deux.
- **La montée en gamme est-elle un droit ou une préférence ?** Un lit de 1,80
  dans une chambre de 16 m² est proposé par défaut ; rien ne dit que
  l'utilisateur le veut. La gamme décide aujourd'hui à sa place. Le jour où le
  questionnaire expose le choix, `from` devient une valeur par défaut et non une
  règle.
- **Les seuils `from` sont des conventions N3.** Ils ne sont adossés à rien —
  ni mesure, ni source. C'est le même défaut que ce chantier corrige par
  ailleurs, déplacé d'un cran : on remplace une cote décrétée par un seuil
  décrété. La table B de `DATASOURCE` §6, non renseignée à ce jour, est
  exactement ce qui les fonderait.
