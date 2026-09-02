# Corpus de référence — plans dessinés par des humains

**Écrit le 21 août 2026, avant toute mesure de fond.** Ce document dit ce que
le corpus est, ce qu'il autorise, ce qu'il interdit, et dans quel ordre s'en
servir. Il suit la même règle que `PROTOCOLE_MESURES.md` : les critères
d'abord, les chiffres ensuite.

---

## 1. Ce que le corpus est réellement

`House 2D plans dataset/` — 4 003 plans d'appartements, chacun sous deux
formes : une image annotée de 256 × 256 et une description en anglais rédigée
par une personne. C'est le jeu **Tell2Design**, dont les plans proviennent de
**RPLAN** : des appartements chinois réellement construits, pas des exercices.

Ce qui a été vérifié sur les images, et pas supposé :

| Fait | Vérification |
|---|---|
| **Échelle fixe, 7,03 cm/pixel** (18 m sur 256) | les épaisseurs de murs sont les mêmes partout : 5 px et 3 px, soit 35 cm en façade et 21 cm en refend. Une échelle normalisée par plan les ferait varier. |
| **8 couleurs de pièce**, palette close | 11 couleurs distinctes sur 200 plans, dont le blanc (dehors), le noir (murs) et le rouge |
| **Un unique repère rouge par plan = la porte d'entrée** | 300 plans sur 300, une seule composante connexe rouge, toujours en façade |
| **Les cotes du texte sont approximatives** | la surface annoncée s'écarte de la surface mesurée de ±30 % (p10–p90) |

**Conséquence de méthode, décisive** : la géométrie se lit dans l'image, jamais
dans le texte. Le texte sert à la typologie, au vocabulaire, et — plus tard —
de matière d'entrée à un « décrire puis générer ». Il ne fournit aucune cote.

### Le programme du corpus, mesuré sur 300 plans

Surfaces hors murs, en m². Le « séjour » y comprend la circulation : rien ne
l'en distingue (voir §5).

| | p10 | médiane | p90 | n |
|---|---|---|---|---|
| logement entier | 62,4 | 73,6 | 95,1 | 300 |
| séjour | 24,2 | 31,3 | 39,8 | 300 |
| chambre principale | 11,3 | 13,6 | 17,9 | 298 |
| chambre | 7,7 | 10,2 | 13,9 | 421 |
| cuisine | 4,0 | 5,5 | 7,8 | 283 |
| salle d'eau | 2,7 | 3,9 | 5,5 | 362 |
| balcon | 1,9 | 4,0 | 6,7 | 310 |

Nombre de chambres : 1 (8 plans), 2 (167), 3 (123), 4 (2).

---

## 2. La règle qui précède tout usage : scinder le corpus maintenant

Vérifier le moteur et le calibrer sur les **mêmes** plans, c'est le juger sur
ce qu'on lui a appris. Le corpus se scinde donc **avant la première mesure**,
par tirage écrit ici :

- **moitié étalon** — scellée. Elle ne sert qu'à juger. Aucun seuil du moteur
  n'en sort, jamais. La mesure 1 du protocole y pioche ses plans humains.
- **moitié atelier** — elle peut servir à calibrer, à explorer, à se tromper.

Le tirage est déterministe (graine à inscrire au premier lot) et la liste des
deux moitiés est versionnée. Un plan ne change pas de moitié.

S'y ajoute la contrainte déjà posée par `PROTOCOLE_MESURES.md` : **un seuil
choisi après avoir vu le résultat ne mesure rien**. Toute calibration issue du
corpus dit d'avance quelle statistique, quel quantile, sur quel sous-ensemble.

---

## 3. La chaîne d'extraction

Une seule traversée, hors ligne, qui produit un corpus en JSON :

```
image 256×256
  → masque par couleur (palette close, aucune tolérance : les couleurs sont exactes)
  → composantes connexes  → une pièce
  → décomposition en rectangles → parts[]
  → bandes noires → murs, avec leur épaisseur réelle
  → composante rouge → entrée, sa position et sa largeur
  → contacts entre pièces → graphe d'adjacence
  → boîte du non-blanc → enveloppe
  → JSON, sous-ensemble de PLAN_SCHEMA.json
```

L'extraction se fait en Python — le fichier d'annotations est un `pickle`
pandas, et la lecture d'images demande une bibliothèque. **Elle ne tourne
qu'une fois.** Les scripts du projet ne lisent ensuite que le JSON produit :
la règle « zéro dépendance runtime » (`CLAUDE.md` §1) reste intacte, au même
titre que `media-convert.mjs`.

Le JSON produit doit passer par `assemblerPlan()` comme n'importe quel plan du
moteur. C'est la condition de la mesure 1, et c'est aussi le test de
l'extraction elle-même : un plan qui ne s'assemble pas est un plan mal extrait,
ou une forme que le moteur ne sait pas représenter — les deux méritent d'être
sus.

---

## 4. Usage 1 — vérifier le moteur

### 4.1 Passer `rules.js` sur les plans humains

Le contrôle le moins cher et le plus dur. **Une règle HARD qui condamne une
majorité de plans réellement construits est une accusation contre la règle,
pas contre les plans.** C'est le seul dispositif du projet qui puisse
invalider une règle de l'extérieur ; tout le reste la mesure de l'intérieur.

Trois écarts sont déjà visibles sans écrire une ligne, en confrontant les
planchers de `socle.data.js` au tableau du §1 :

| Plancher du moteur | Corpus | Lecture |
|---|---|---|
| cuisine, 7 m² | médiane 5,5 m² | le moteur **refuse la cuisine médiane** du corpus |
| chambre, 9 m² | p10 7,7 m² | environ un quart des chambres réelles passent dessous |
| séjour, 24 m² (`TH2D-SIZING-001`) | médiane 31,3 m², circulation comprise | le seuil est au bon endroit |

Aucun de ces trois écarts n'est un verdict : voir les limites du §6. Ce sont
trois questions que le corpus pose et auxquelles la doctrine doit répondre —
par un chiffre révisé, ou par un « nous assumons plus exigeant que le réel »
écrit noir sur blanc.

Attendus techniques de ce passage : `TH2D-FORME-001` (six arêtes) va parler,
les pièces réelles étant plus découpées ; `TH2D-CIRC-001` n'aura rien à
mesurer, faute de circulation étiquetée ; `TH2D-ROOM-002` (meublabilité) est
le résultat le plus intéressant du lot, puisqu'il confronte le socle
d'agencement à des pièces qui sont habitées.

### 4.2 Comparer les distributions, pas les moyennes

Surfaces par type, rapports de forme, part de circulation, degré du graphe
d'adjacence, position de l'entrée. Le moteur doit tomber **dans** la
distribution du corpus, pas sur sa médiane : un générateur qui ne produit que
la médiane a perdu la diversité que le banc de capacités mesure par ailleurs.

Lecture pré-spécifiée : pour chaque grandeur, la part des plans générés
comprise entre le p10 et le p90 du corpus, à programme comparable. Le corpus
ne couvrant que 62–95 m² et 1–3 chambres, la comparaison ne porte que sur les
configurations du banc qui tombent dans cette fenêtre.

### 4.3 Fournir les plans humains de la mesure 1

`PROTOCOLE_MESURES.md` attendait « 10 plans humains, redessinés dans le rendu
du moteur ». Le corpus les fournit **déjà sous forme de données**, donc
redessinables par le chemin normal. Le piège nommé dans le protocole — les
juges discriminent le trait et non le plan — est alors neutralisé par
construction et non par précaution.

Conditions inchangées : sélection dans la moitié étalon, avant d'avoir vu les
plans générés, graines écrites d'avance, une seule passe.

---

## 5. Usage 2 — améliorer le modèle

Ce que le corpus peut légitimement alimenter, par ordre de solidité :

1. **La position de l'entrée.** 4 003 exemples, un par plan, non ambigus.
   C'est la grandeur la mieux fondée du corpus. `TH2D-ENTREE-001` ne vérifie
   aujourd'hui qu'une largeur de façade suffisante ; le corpus dit *où* une
   entrée se pose et sur quelle pièce elle donne.
2. **Le graphe d'adjacence a priori.** Quelles adjacences existent réellement,
   à quelle fréquence, et lesquelles n'existent jamais. `TH2D-GRAPH-001` compte
   206 manquements sur 360 plans : il se peut que le moteur exige des arêtes
   que le réel n'a pas.
3. **Les plafonds `maxRatio: null`.** Même méthode que la circulation — 90e
   centile mesuré, gelé, daté. Le socle réclame explicitement une mesure pour
   les peupler ; c'est celle-là.
4. **La circulation.** Elle n'est pas étiquetée, mais elle s'extrait : une
   ouverture morphologique du séjour par un disque de 1,80 m sépare le cœur
   des appendices de couloir. Mesuré sur 150 plans : **appendice médian de
   2,9 m², au-delà de 4 m² dans 28 % des plans**. De quoi confronter
   `CIRCULATION_MAX_RATIO = 1,6` à du réel plutôt qu'à lui-même.
5. **La fréquence des formes non rectangulaires** — combien de pièces réelles
   sont en L, avec quelle ampleur de décrochement. C'est la borne à six arêtes
   de `TH2D-FORME-001` qui est en jeu.

Ce que le corpus **ne peut pas** fournir, et qu'il ne faut pas lui demander :

- les planchers de dignité d'usage — convention assumée, culturelle, et le
  corpus est d'une autre culture ;
- les cotes du socle d'agencement — rien n'est meublé dans ces images ;
- quoi que ce soit sur les portes intérieures et leurs débattements — seule
  l'entrée est marquée.

---

## 6. Limites, à porter avec chaque chiffre

- **Ce sont des appartements chinois.** Balcon quasi systématique, cuisine
  petite et fermée, pas de WC séparé, pas de couloir désigné. Transposer un
  quantile mesuré ici en règle française, c'est importer une norme sans le
  dire. Tout seuil issu du corpus porte donc sa marque d'origine dans le code,
  comme le `val` du socle marque les cotes sourcées.
- **La fenêtre est étroite** : 62–95 m², 1 à 3 chambres. Le corpus ne dit rien
  des configurations 150–250 m² du banc de capacités.
- **Les plans ne sont pas indépendants** : mêmes promoteurs, mêmes trames
  structurelles. 4 003 plans ne valent pas 4 003 observations libres.
- **Les annotations sont approximatives** (±30 % sur les surfaces). Elles ne
  servent jamais de mesure.
- **La quantification est de 7 cm.** Suffisante pour des surfaces, juste pour
  des largeurs de couloir, insuffisante pour un jeu de porte.

---

## 7. Ordre des lots

1. **Extraction et scellement.** L'extracteur, le tirage étalon/atelier écrit
   et versionné, le passage de 100 plans par `assemblerPlan()` pour vérifier
   l'extraction elle-même.
2. **Passage de `rules.js`** sur la moitié atelier, et publication du tableau
   des règles que le réel enfreint. C'est le résultat qui oriente la suite.
3. **Comparaison de distributions** moteur / corpus, sur la fenêtre commune.
4. **Mesure 1**, avec des plans humains tirés de l'étalon.

Les calibrations du §5 ne commencent qu'après le lot 2 : tant qu'on ne sait
pas quelles règles le réel enfreint, on ne sait pas lesquelles méritent d'être
recalibrées.

---

## 8. Deux précautions matérielles

- **Le dossier pèse 41 Mo et n'est pas exclu du déploiement.** `.assetsignore`
  écarte `technohab/eval/` mais pas `technohab/House 2D plans dataset/` : il
  partirait sur Cloudflare tel quel. À exclure avant le prochain envoi,
  vérification par `npx wrangler deploy --dry-run`.
- **La licence du jeu de données n'a pas été vérifiée.** Elle doit l'être
  avant que le moindre plan extrait, ou une figure qui en dérive, ne soit
  publié sur le site.

---

## Modifications postérieures

*Aucune à ce jour. Toute entrée ici doit porter sa date et sa raison.*
