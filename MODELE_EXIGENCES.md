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

Le cache `fit.data.js` reste le contrôle rapide dans la boucle de génération.
La chaîne ci-dessus ne s’exécute qu’une fois sur le plan retenu.

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

Les portes, leurs débattements et le cheminement interne ne sont pas encore
des objets du moteur. Les règles `S3` et `S4` restent donc hors du modèle de
pose. Leur ajout devra étendre la validation dure, jamais le seul score de
l’optimiseur.
