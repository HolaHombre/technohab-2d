# Doctrine d'agencement — pré-calculer le possible, placer une fois

Comment le moteur vérifie qu'une pièce est meublable, sans payer ce contrôle
à chaque candidat.

**Place dans la doctrine globale.** [`DOCTRINE.md`](DOCTRINE.md) fait foi sur
l’unité de conception (la fonction) et sur la chaîne cible. Le présent
document reste l’autorité sur le **pré-calcul des gabarits** tant que le
programme d’équipements d’une résolution est fixé. Dès qu’une fonction
admet plusieurs résolutions (`BED` ∨ `SOFA_BED`), le cache compile une
frontière **par résolution** — pas un rectangle moyen
([`DOCTRINE.md`](DOCTRINE.md) §8).

Documents liés : [`DOCTRINE.md`](DOCTRINE.md) — doctrine globale ;
[`SOCLE_AGENCEMENT.md`](SOCLE_AGENCEMENT.md) — les
équipements et leurs dégagements, qui font foi ;
[`DA_CHEMINEMENT_PLAN.md`](DA_CHEMINEMENT_PLAN.md) — le parcours, dont la
règle `S4` du socle est la version à l'échelle de la pièce.

---

## 1. Le problème

Une génération explore quelques centaines de candidats sous budget adaptatif.
Résoudre un placement de mobilier pour chacun serait impraticable : le
placement est un problème de rangement sous contraintes, il se compte en
millisecondes par pièce, et il y a dix pièces par candidat.

Un contrôle qui ne peut pas entrer dans la boucle ne sert à rien : il
arriverait après la sélection, pour condamner un plan déjà retenu.

## 2. La doctrine

**Ce qui est cher se calcule hors ligne et une fois ; ce qui est fréquent se
lit.**

Trois temps distincts :

| Temps | Ce qui se passe | Coût |
|---|---|---|
| **Hors ligne**, à la construction | Pour chaque type de pièce et chaque variante, on cherche exhaustivement les plus petits rectangles capables de recevoir le mobilier obligatoire, dégagements compris. Résultat : une frontière de quelques couples. | quelques secondes, payées une fois |
| **Dans la boucle**, sur les deux meilleurs candidats géométriques | `fits()` filtre, puis le programme minimal compilé appelle `placement.validate()` ; `assess()` rend une peine graduée de qualité d’usage. | borné et mémoïsé par classe de proportion |
| **Une seule fois**, sur le plan retenu | `validate()` rejoue le polygone utile exact avec les faces, les portes et leurs débattements ; `optimize()` cherche une autre pose si `S4` refuse la première. | une fois par plan construit |

Le placement coûteux n'est calculé que pour les meilleurs candidats issus du
filtre géométrique, jamais pour toute la population explorée.

La graine ne participe jamais au verdict de faisabilité. Elle ne change que
l'ordre d'exploration du second temps, après validation exhaustive. Le hasard
ne peut donc ni rendre possible une pièce impossible, ni contourner une
relation de niveau `HARD`.

## 3. Pourquoi le pré-calcul supprime le faux négatif sur un rectangle

C'est la conséquence la plus importante, et elle n'était pas acquise
d'avance.

Un solveur glouton en ligne — poser les meubles un par un le long des murs —
échoue parfois là où une solution existe. Sur une règle bloquante, un tel
faux négatif **refuse un plan valide**, ce qui est plus grave que d'accepter
un plan médiocre.

Le pré-calcul lève l'objection pour deux raisons :

1. **La recherche hors ligne est exhaustive.** On peut s'offrir un retour
   arrière complet puisqu'on ne le paie qu'une fois.
2. **La faisabilité est monotone.** Si le mobilier tient dans un rectangle,
   il tient dans tout rectangle plus grand — on ne fait qu'ajouter de la
   place. La frontière des plus petits rectangles admissibles décrit donc
   exactement le domaine, sans approximation.

La table n'est pas une heuristique : **sur un rectangle**, elle est exacte.
M4b borne explicitement cette affirmation. Une pièce en L/U n'est pas
ré-indexée par sa boîte : `fit.data.js` peut la présélectionner, mais seul le
solveur sur `usablePolygon` porte son verdict.

### Les trois limites, à connaître

- **Les pièces en L/U** sont résolues sur leur polygone utile entier. Chaque
  emprise et chaque zone d'usage est contenue dans le contour ; une encoche
  traversante est un obstacle, même si les coins et le centre du rectangle
  testé restent dans la pièce. Le cache publie `geometryScope:
  'rectangle-only'` et n'est jamais l'autorité de `TH2D-ROOM-002` hors de ce
  domaine.
- **Le passage entre linéaires opposés de cuisine** est désormais vérifié par
  le solveur à 1,20 m dès que deux équipements muraux se font face.
- **Les portes existent et `S3` est évaluée.** `S4` relie désormais chaque
  porte à chaque zone d'usage requise avant publication du plan.

## 4. Niveaux de règles

La doctrine du projet est arrêtée : **mieux vaut afficher un plan médiocre
qu'en refuser un valide.**

- `TH2D-FURN-001` — le mobilier obligatoire du socle tient dans la pièce.
  **Bloquant** : la table est exacte sur un rectangle et le solveur exact fait
  foi sur un polygone. Sans verdict polygonal publié, la règle s'abstient au
  lieu d'interroger la boîte englobante.
- Le niveau bloquant est légitime parce que chaque géométrie possède une
  autorité explicite. Le cache seul ne suffirait pas hors rectangle.

## 5. Mesures du 15 août — un pronostic démenti

L'attente était que le contrôle échoue souvent, comme les adjacences du
`ROADMAP_HISTORIQUE.md` §3.2. Relevé sur 40 variantes par configuration, en comparant
le rectangle utile de chaque pièce à la table :

| Configuration | Pièces | Hors gabarit |
|---|---|---|
| 35 m², studio | 120 | 0 |
| 45 m², 1 chambre | 240 | 0 |
| 60 m², 2 chambres | 280 | 2 — WC |
| 75 m², 2 chambres | 240 | 0 |
| 110 m², 3 chambres | 320 | 0 |
| 150 m², 5 chambres | 440 | 1 — WC |

**Le moteur produit déjà des pièces meublables dans plus de 99,8 % des cas.**
Sur 1 640 pièces, trois échecs, tous des WC.

La cause de ce succès est identifiable : `minSide` par type et la règle
`TH2D-ROOM-002` sur la largeur exploitable, introduites au chantier 3,
écartent déjà les pièces en couloir — celles-là mêmes que l'ameublement
aurait recalées. Le travail avait donc été fait en amont, sous une autre
forme.

Deux conséquences pour la suite :

- le contrôle d'agencement n'est pas le révélateur attendu, c'est un **filet
  de sécurité** peu coûteux : il faut l'ajouter, sans en attendre une refonte
  du dimensionnement ;
- la valeur se déplace vers le **placement effectif**, c'est-à-dire le
  dessin, et vers l'instant où les portes viendront contraindre ce placement.

Contrôle complémentaire : sur un programme de 90 m² à trois chambres, 98 %
des chambres acceptent un lit 140 et non un simple lit 90.

## 6. Une incohérence relevée dans le socle

`SOCLE_AGENCEMENT.md` §5.6 annonce un gabarit minimal de WC de
**0,90 × 1,30**. Ses propres cotes donnent une autre valeur : une cuvette de
0,70 de profondeur plus 0,80 de dégagement en façade imposent **1,50** de
profondeur, pas 1,30. Le calcul d'enveloppe retient 0,70 × 1,50.

Les deux valeurs ne peuvent pas coexister. Soit le dégagement de la cuvette
descend à 0,60 — ce qui est courant et redonne 1,30 —, soit le gabarit
minimal annoncé passe à 1,50. À trancher dans le socle, qui fait foi.

## 7. Chaîne d'artefacts

| Fichier | Rôle | Nature |
|---|---|---|
| `SOCLE_AGENCEMENT.md` | équipements, emprises, dégagements, ancrages, règles `S1`–`S6` | **source, fait foi** |
| `assets/socle.data.js` | transcription exécutable du §5 | source, à garder aligné |
| `assets/placement.js` | algorithmique unique de placement et API navigateur `solve` | **autorité exécutable** |
| `scripts/build-envelopes.mjs` | runner hors ligne, oracle de test et générateur du cache | outil |
| `assets/fit.data.js` | cache chaud, programmes minimaux compilés, API `fits`, `smallest`, `programOf` | **généré**, ne pas éditer |
| `scripts/test-placement.mjs` | comparaison du solveur en ligne aux treize préréglages | test |
| `assets/icons/furniture.svg` | 28 équipements dessinés, `viewBox` en centimètres | source |
| `assets/icons/preview.html` | planche de contrôle à échelle commune | outil |

```bash
npm run fit:build
npm run fit:test
```

À relancer après toute modification de `socle.data.js` — sans quoi la table
et le socle divergent en silence.

## 8. Ce qui reste après M4b

1. Étendre les relations de préférence à mesure que leurs justifications sont
   documentées, sans transformer une convention d'usage en règle bloquante.
2. Mesurer le coût des résolutions polygonales à mesure que M4a.2 augmente le
   nombre de terminaisons intérieures, sans réintroduire une autorité de boîte.
3. Reprendre dans M5 la fragmentation résiduelle du sol et les fenêtres hors
   composant principal, propriétés distinctes du minimum `S4`.
