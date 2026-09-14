# Modèle d’exigences des pièces

Sépare ce qu’une pièce **doit contenir** de l’endroit où ce contenu sera
finalement posé. Cette séparation évite de faire dépendre la cohérence d’une
pièce d’un premier placement arbitraire.

## 1. Chaîne de décision

1. `room-model.js::designate(type, variant)` sélectionne les équipements
   requis actifs et construit leurs exigences minimales.
2. Le modèle valide quatre règles génériques d’existence : type/variante,
   unicité des requis, description minimale d’usage et références des
   relations.
3. `placement.js::validate()` cherche exhaustivement une pose qui respecte
   emprises, zones d’usage, ancrages et relations `HARD`.
4. `placement.js::optimize()` explore plusieurs autres poses valides dans un
   ordre déterminé par la graine du plan et classe les préférences.
5. Le rendu ne reçoit que la pose optimisée après validation.

Le cache `fit.data.js` reste le contrôle rapide pour les enveloppes
rectangulaires. Depuis M4, la chaîne de pose s'exécute aussi dans la boucle de
construction des candidats destinés au verdict ; le plan rendu relit les poses
du `BuiltPlan` au lieu de calculer un mobilier indépendant.

## 1 bis. Définition d’une pièce

*Ajouté le 20 août 2026.* Une pièce était décrite à quatre endroits, et rien
ne garantissait que les quatre parlaient de la même : `generator.js` tenait
`minArea`, `minSide` et `weight` en dur, `socle.data.js` les équipements,
`fit.data.js` les enveloppes calculées, `rules.js` des listes de types
écrites à la main. Une seule source les décrit désormais.

**`socle.data.js` fait foi.** `npm run fit:build` la compile dans
`fit.data.js` avec les enveloppes. Le moteur ne lit que le compilé — motif :
`index.html` charge `fit.data.js` au premier octet tandis que `socle.data.js`
reste différé jusqu’au premier usage du solveur ; lire le socle depuis le
générateur casserait le chargement paresseux (`CLAUDE.md` §1 et §2).

| Champ | Nature | Lu par |
|---|---|---|
| `role` | énuméré : `principale`, `service`, `distribution`, `annexe`, `zone` | `rules.js` |
| `agrement` | ce qu’un m² **de plus** apporte — convention assumée | `generator.js`, poids de répartition |
| `minProgramArea` / `minProgramSide` | plancher de **dignité d’usage**, convention N3 | `generator.js`, via `floorOf` |
| `maxRatio` | plafond, en multiple du besoin calculé — jamais en m² | allocation, poseurs et `TH2D-ROOM-003` pour l'agrément nul |
| `trigger` | critère d’existence de la pièce | personne encore |

### Les deux planchers

Un seul nombre confondait jusqu’ici deux grandeurs sans rapport :

- **meublabilité** — `fit.smallest()` / `fit.narrowest()`, calculées par le
  solveur hors ligne. Elles suivent toute évolution des équipements ;
- **dignité d’usage** — `minProgramArea` / `minProgramSide`, convention
  assumée. Un séjour se meuble dès 3,24 m² et reste absurde à cette taille.

`fit.floorOf(type)` retient le plus exigeant des deux. La dérivation a été
calibrée pour reproduire à l’identique la table décrétée qu’elle remplace
— 20/3,00 · 9/2,50 · 7/1,80 · 3/1,70 · 1,5/0,90 · 3/1,20 — et
`test-definition-pieces.mjs` en fait un verrou. Les plans n’ont pas bougé :
empreinte du banc `520b8ebb` avant et après.

La distinction n’était pas seulement cosmétique. `minSideOf()`, qui borne la
cession d’une bande de rangement, vise la **meublabilité seule** : une pièce
a le droit de descendre jusque-là pour céder un rangement, ce qu’un plancher
unique interdisait d’exprimer.

### Le rôle remplace les listes de types

`TH2D-FACADE-001` portait `['living', 'bedroom', 'kitchen', 'dining',
'bureau']` en dur, à rallonger à la main à chaque pièce ajoutée — un oubli
s’y serait lu comme une règle qui passe. Elle interroge désormais
`fit.roleOf(type) === 'principale'`. Une pièce nouvelle entre dans la règle
en déclarant son rôle.

### Ce qui est défini sans être actif

`trigger` transcrit de façon déclarative ce que `buildProgram()` fait
aujourd’hui en dur (`{ kind: 'always' }`, `{ kind: 'count', from: 'bedrooms' }`,
`standaloneIf` / `otherwiseInto` pour la cuisine ouverte et le WC intégré).
**Aucun interpréteur ne le lit** : écrire cet interpréteur est le lot pilote
L1 du chantier 7. Les sept types non générés portent `trigger: null` et des
planchers `null` — aucune mesure ne les fonde, et les poser d’avance aurait
été décréter sept nombres de plus.

Deux plafonds sont actifs et leur origine diffère : circulation `1,6`, gelée
au 90e centile mesuré, et WC `3,5`, seuil doctrinal `N3` identifié par
`VAL-WC-PROGRAM-AREA-MAX-RATIO-001`. Le second est relatif au besoin meublable
calculé (1,04 m²), soit 3,64 m² avant la tolérance constructive de 0,05 m².
Tout autre type reste à `null` jusqu'à instruction explicite de son origine.

## 2. Exigence minimale d’un équipement

Tout équipement requis doit déclarer :

```js
{
  id: 'washbasin',
  footprint: { w: 0.60, d: 0.50 },
  anchor: 'wall',
  usage: [{ face: 'front', min: 0.80 }]
}
```

`footprint` est l’emprise physique. `anchor` vaut `wall`, `corner` ou
`free`. `usage` est un tableau explicite, éventuellement vide lorsque
l’objet ne demande aucun dégagement supplémentaire. Les besoins de réseaux
restent transportés avec la désignation pour les futurs contrôles de
distribution.

## 3. Relations entre équipements

Les relations vivent sur le type de pièce, car leur sens dépend de la
fonction de la pièce et non du dessin SVG. Types actuellement compris :

- `between` : un objet se trouve entre deux autres sur un même mur ;
- `same-wall` et `different-wall` : continuité ou répartition de linéaire ;
- `near` : proximité maximale ;
- `faces` : la face d’usage regarde un autre équipement.

Une relation `HARD` participe au retour arrière exhaustif. Une relation
`GUIDELINE` produit un score et départage les solutions valides. La séquence
évier–plan de travail–plaque est dure ; les répartitions chambre et salle
d’eau sont des préférences, donc ne peuvent pas créer de faux refus.

## 4. Aléatoire rejouable

L’optimiseur mélange les poses candidates avec une graine composée de la
graine du plan et de l’identifiant de pièce. Il évalue six solutions par
pièce. Une même graine rend exactement la même disposition ; une autre
graine peut changer murs, offsets et rotations tout en conservant les règles
dures.

## 5. Limites actuelles

Les portes, leurs débattements et le cheminement interne sont désormais des
objets du plan construit. `S3` contrôle les conflits avec le battant et `S4`
prouve qu'une porte rejoint les zones d'usage requises. Restent hors de cette
preuve générique les ouvrants propres à certains équipements — penderie, four,
lave-vaisselle —, plusieurs relations fines de profil et la représentation
fidèle de toutes les rotations calculées. Leur ajout doit continuer d'étendre
la validation dure lorsque l'usage l'exige, jamais le seul score de
l'optimiseur.
