# Doctrine d'agencement — pré-calculer le possible, placer une fois

Comment le moteur vérifie qu'une pièce est meublable, sans payer ce contrôle
à chaque candidat.

Documents liés : [`SOCLE_AGENCEMENT.md`](SOCLE_AGENCEMENT.md) — les
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
| **Dans la boucle**, à chaque candidat | `fits(type, largeur, hauteur)` compare le rectangle de la pièce aux couples de la table. Quelques comparaisons. | négligeable |
| **Une seule fois**, sur le plan retenu | `room-model.js` désigne les exigences ; `validate()` confirme leur faisabilité ; `optimize()` explore des poses ensemencées et classe les relations de préférence. | une fois par plan affiché |

Le placement n'est donc jamais calculé pour un candidat rejeté.

La graine ne participe jamais au verdict de faisabilité. Elle ne change que
l'ordre d'exploration du second temps, après validation exhaustive. Le hasard
ne peut donc ni rendre possible une pièce impossible, ni contourner une
relation de niveau `HARD`.

## 3. Pourquoi le pré-calcul supprime le faux négatif

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

La table n'est pas une heuristique : sur un rectangle, elle est exacte.

### Les trois limites, à connaître

- **Les pièces en L** sont testées sur leur rectangle utile (`usableRect`),
  jamais sur leur boîte englobante. C'est conservateur : une forme en L peut
  accueillir un aménagement sans contenir le rectangle testé. Faux négatif
  possible ici, et seulement ici.
- **Le passage entre linéaires opposés de cuisine** (1,20 m, socle §5.4)
  n'est pas encore pris en compte par le solveur : une cuisine étroite à deux
  linéaires face à face peut passer la table alors qu'elle est impraticable.
- **Les portes n'existent pas encore.** Les règles `S3` et `S4` du socle —
  débattement et desserte interne — ne sont donc pas évaluables. La table dit
  « le mobilier tient », pas « le mobilier tient une fois la porte posée ».

## 4. Niveaux de règles

La doctrine du projet est arrêtée : **mieux vaut afficher un plan médiocre
qu'en refuser un valide.**

- `TH2D-FURN-001` — le mobilier obligatoire du socle tient dans la pièce.
  **Bloquant sur les pièces rectangulaires**, où la table est exacte ;
  **conseil sur les pièces en L**, où elle est conservatrice.
- Le niveau bloquant est légitime ici précisément parce que le §3 établit
  l'absence de faux négatif. Il ne l'aurait pas été avec un solveur en ligne.

## 5. Mesures du 15 août — un pronostic démenti

L'attente était que le contrôle échoue souvent, comme les adjacences du
`ROADMAP.md` §3.2. Relevé sur 40 variantes par configuration, en comparant
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
| `scripts/technohab-fit/build-envelopes.mjs` | runner hors ligne, oracle de test et générateur du cache | outil |
| `assets/fit.data.js` | cache chaud des préréglages, API `fits` et `smallest` | **généré**, ne pas éditer |
| `scripts/test-placement.mjs` | comparaison du solveur en ligne aux treize préréglages | test |
| `assets/icons/furniture.svg` | 28 équipements dessinés, `viewBox` en centimètres | source |
| `assets/icons/preview.html` | planche de contrôle à échelle commune | outil |

```bash
npm run fit:build
npm run fit:test
```

À relancer après toute modification de `socle.data.js` — sans quoi la table
et le socle divergent en silence.

## 8. Ce qui reste

1. Faire consommer les compositions libres par le programme de génération,
   sans contourner le cache chaud des préréglages.
2. Étendre les relations de préférence à mesure que leurs justifications sont
   documentées, sans transformer une convention d'usage en règle bloquante.
3. Reprendre `S3` et `S4` quand les portes existeront.
