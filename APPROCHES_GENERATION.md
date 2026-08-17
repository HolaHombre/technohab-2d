# Approches de génération de plan sous contraintes

Revue large des méthodes possibles, avant de choisir. Écrit pour sortir de
l'effet tunnel : le moteur actuel est une approche parmi d'autres, et pas
nécessairement la bonne.

**Statut : document de décision, aucune implémentation.**

---

## 1. Le problème, posé sans présupposé

À partir d'un programme — des pièces, leurs surfaces cibles, leurs
encombrements minimaux — et d'un graphe de relations souhaitées, produire
une partition d'une enveloppe en pièces qui satisfait :

- couverture complète, sans chevauchement ni vide ;
- surfaces proches des cibles, dans une tolérance ;
- chaque pièce meublable, au sens du socle ;
- les adjacences demandées réalisées ;
- plusieurs solutions distinctes, pour proposer des variantes ;
- un verdict d'impossibilité quand il n'y a pas de solution.

Le dernier point est le plus souvent oublié, et c'est celui qui distingue un
générateur d'un solveur.

---

## 2. Les familles

### A. Découpe récursive en guillotine — *l'existant*

Coupes binaires successives ; les pièces sont les feuilles de l'arbre.

**Pour** : trivial à écrire, rapide, couverture et non-chevauchement
garantis par construction, formes rectangulaires immédiates.

**Contre** : **limite structurelle** — les partitions atteignables par
guillotine sont un sous-ensemble strict des partitions rectangulaires. Il
existe des configurations d'adjacence qu'aucune suite de coupes ne peut
produire, quel que soit le budget. L'adjacence est un sous-produit, jamais
une contrainte.

Mesuré sur le projet : 264 adjacences ratées sur 720 plans, et le guidage
de la coupe n'a fait gagner que 13 %.

### B. Représentations non-guillotine — *couple de séquences, arbre B\**

Issues du placement de circuits. Un couple de permutations encode les
relations gauche-droite et haut-bas ; un décodeur en tire les positions par
plus longs chemins.

**Pour** : couvre **toutes** les partitions rectangulaires, pas seulement
les guillotines. Encodage compact, exploration par recuit simulé efficace.

**Contre** : ne garantit ni couverture complète ni absence de vides — il
faut une passe de rattrapage. L'adjacence reste indirecte.

### C. Dual rectangulaire — *partir du graphe, pas de la géométrie*

L'approche mathématiquement adaptée au problème posé. Un graphe planaire
admet un *dual rectangulaire* — une partition d'un rectangle dont le graphe
d'adjacence est exactement le graphe donné — sous conditions bien
caractérisées, essentiellement : planarité, faces internes triangulées,
absence de triangle séparateur, quatre sommets sur le contour.

**Pour** : **l'adjacence est satisfaite par construction, pas par tirage.**
C'est précisément ce que le moteur actuel échoue à faire. Le dimensionnement
vient ensuite, comme problème séparé et bien posé.

**Contre** : le graphe doit remplir les conditions ; sinon il faut le
modifier — ajouter des pièces tampons, retirer des arêtes — et savoir
expliquer pourquoi. Implémentation nettement plus exigeante. Les surfaces ne
sont pas libres : une fois la topologie fixée, les aires atteignables
forment un domaine contraint.

### D. Programmation par contraintes ou programme linéaire mixte

Chaque pièce devient des variables de position et de dimension ; toutes les
exigences deviennent des contraintes ; un solveur cherche.

**Pour** : toutes les contraintes au même rang, déclaratives. Surtout,
**l'infaisabilité est démontrée**, pas constatée après épuisement d'un
budget — ce qui répond enfin au §7 de la feuille de route. Ajouter une règle
ne demande pas de réécrire une heuristique.

**Contre** : la surface est un produit de deux variables, donc non linéaire ;
il faut linéariser ou fixer des proportions. Le non-chevauchement est
disjonctif, donc coûteux. Un solveur embarqué reste à écrire ou à intégrer,
sous la contrainte `file://` sans dépendance. Diversité des solutions non
naturelle : un solveur donne *une* réponse, pas des variantes.

### E. Pavage sur grille

Discrétiser l'enveloppe au pas de 10 cm, attribuer les cellules aux pièces
par croissance de régions ou couverture exacte.

**Pour** : formes rectilignes quelconques sans effort, adjacence facile à
contrôler cellule par cellule, couverture complète par construction.

**Contre** : explosion combinatoire, et surtout des contours en escalier
qu'il faut régulariser — l'étape de régularisation est plus difficile que le
pavage lui-même.

### F. Relaxation par forces

Partir du diagramme de bulles, laisser les pièces se repousser, puis
rectangulariser.

**Pour** : intuitif, gère bien les préférences molles, produit de la
diversité naturellement.

**Contre** : aucune garantie, ni de couverture, ni d'adjacence, ni de
surface. La rectangularisation finale casse ce que la relaxation avait
obtenu.

### G. Typologies paramétrées

Une bibliothèque de dispositions éprouvées — couloir central desservi des
deux côtés, plan en L, hall distributeur, traversant — instanciées puis
dimensionnées.

**Pour** : résultats **architecturalement justes par construction**, parce
qu'ils viennent de plans qui existent. Rapide, explicable, toujours
produisant quelque chose de crédible. L'adjacence est une propriété de la
typologie, donc acquise.

**Contre** : ne crée rien qui ne soit dans la bibliothèque. Il faut écrire
les typologies à la main. La diversité vient du dimensionnement et du
choix de typologie, pas d'une exploration.

### H. Modèle appris

Graph2Plan, réseaux génératifs. L'approche du dépôt d'origine.

**Pour** : produit des plans plausibles, apprend des régularités qu'on ne
sait pas formuler.

**Contre** : incompatible avec les principes non négociables — poids,
exécution, dépendances. Et un modèle appris ne *garantit* rien : il
ressemble. Sur un projet qui se revendique normé, c'est un mauvais échange.

---

## 3. Ce que les contraintes du projet éliminent

Les principes non négociables — aucune dépendance, `file://`, aucun service
externe — écartent **H** immédiatement, et rendent **D** difficile sans
écrire soi-même un solveur.

La taille du problème, trois à douze pièces, est en revanche minuscule pour
n'importe laquelle des autres méthodes. Ce n'est pas la performance qui
décide ici.

---

## 4. Le fait qu'on n'a pas regardé en face

**Le graphe demandé est presque toujours le même.** Une circulation reliée à
toutes les pièces, plus la cuisine reliée au séjour. C'est une étoile, et
sa traduction spatiale est connue depuis un siècle : le **couloir desservant
de part et d'autre**.

Autrement dit, on emploie une méthode généraliste et stochastique pour
résoudre un problème dont **on connaît déjà la forme de la réponse**. Le
moteur redécouvre à chaque tirage, avec un budget de six mille essais, une
disposition qu'un architecte pose en trois traits.

C'est le vrai diagnostic de l'effet tunnel : le débat porte depuis le début
sur *comment mieux tirer au hasard*, alors que la question est *pourquoi
tirer au hasard*.

---

## 5. Les combinaisons qui tiennent debout

Les méthodes ne s'excluent pas. Trois assemblages crédibles.

### G + dimensionnement — *typologie choisie, dimensions calculées*

Choisir une typologie compatible avec le programme, puis résoudre les
dimensions pour approcher les surfaces cibles. Le dimensionnement d'une
typologie fixée est un petit problème bien posé, résoluble par ajustement
itératif ou par un programme linéaire minuscule.

Adjacence garantie, résultat crédible, explication immédiate. La diversité
vient du choix de typologie, de l'affectation des pièces aux emplacements,
et des proportions.

### C + dimensionnement — *graphe d'abord, géométrie déduite*

Construire le dual rectangulaire du graphe demandé, puis dimensionner. Plus
général que la typologie : accepte n'importe quel graphe admissible, donc
ouvre la porte aux relations sur mesure du chantier « graphe éditable ».

Plus exigeant, mais c'est la seule voie qui reste vraie quand l'utilisateur
dessinera lui-même ses relations.

### A ou B + filtre — *l'existant, assumé pour ce qu'il est*

Garder l'exploration stochastique comme **générateur de variantes**, mais
cesser de lui demander des garanties. Elle produit de la diversité ; c'est
sa qualité réelle et la seule.

---

## 6. Lecture croisée

| | Adjacence garantie | Surfaces tenues | Diversité | Dit l'impossible | Coût d'écriture |
|---|---|---|---|---|---|
| A. Guillotine | non | approché | forte | non | fait |
| B. Non-guillotine | non | approché | forte | non | moyen |
| C. Dual rectangulaire | **oui** | contraint | moyenne | partiellement | élevé |
| D. Contraintes | **oui** | **oui** | faible | **oui** | élevé |
| E. Grille | oui | oui | forte | non | élevé |
| F. Forces | non | non | forte | non | faible |
| G. Typologies | **oui** | **oui** | moyenne | **oui** | moyen |

---

## 7. Ce que je recommanderais

**Commencer par G, viser C.**

La typologie donne tout de suite ce que six semaines de réglage stochastique
n'ont pas donné : des plans dont les adjacences sont justes parce que la
disposition est juste. Elle est explicable — « ce plan est un couloir
desservant, voici pourquoi votre programme n'y entre pas » — ce qu'aucune
méthode de tirage ne sait dire.

Le dual rectangulaire reste la cible, parce qu'il est la seule approche qui
survivra au moment où l'utilisateur composera lui-même son graphe.

Et l'existant ne se jette pas : il devient le producteur de variantes autour
d'une typologie retenue, ce qu'il fait bien.

**Ce que cela remet en cause.** Le chantier 1, formes libres d'enveloppe,
change de sens : une typologie porte sa propre enveloppe. Il faudrait le
reprendre après, pas avant.

---

## 8. Comment trancher — protocole de décision

Le choix ne se déduit pas du tableau §6 : celui-ci décrit des propriétés
connues des méthodes, pas leur comportement sur ce programme, dans ce
moteur, avec ces règles. Il oriente, il ne décide pas.

Ce projet a une règle empirique qu'il vaut mieux respecter : **ce qui a été
tranché par la mesure a tenu, ce qui a été tranché par le raisonnement s'est
révélé faux.** La largeur minimale inventée était deux fois trop sévère ; le
guidage de découpe promis comme décisif n'a rendu que 13 %. Les deux
paraissaient solides sur le papier.

### Le banc d'essai existe déjà

`scripts/scan-capacites.mjs` couvre 24 configurations, de 35 à 250 m², et
produit taux de conformité, diversité, meublabilité, écart de surface et
durée. Le moteur actuel y est mesuré : **il est le témoin.** Toute méthode
candidate se juge sur le même banc, sans le modifier.

### Fixer les critères avant de mesurer

Le piège de ce genre de comparaison est de découvrir les résultats puis de
choisir les critères qui donnent raison à ce qu'on a construit. Les critères
et leur ordre doivent donc être arrêtés **avant** le premier essai.

| Critère | Mesuré par | Pourquoi il compte |
|---|---|---|
| Adjacences réalisées | `TH2D-GRAPH-001` sur le banc | c'est le défaut qu'on cherche à corriger |
| Diversité des variantes | signatures distinctes sur 30 tirages | un plan unique n'est pas un générateur |
| Meublabilité | `TH2D-ROOM-002` | le plan doit rester habitable |
| Sait dire l'impossible | test dédié sur programme saturé | le §7 l'exige |
| Durée | millisecondes par génération | budget actuel : moins de 110 ms |
| Coût d'écriture | estimation, non mesurable | seul critère subjectif, à assumer |

### Prototyper au plus court, pas au propre

Un prototype n'est pas une implémentation : il répond à une question et se
jette. Deux essais, bornés dans le temps, sur le banc, contre le témoin.

**Essai typologies.** Une seule disposition — le couloir desservant de part
et d'autre — instanciée pour le programme, dimensionnée par simple mise à
l'échelle. Pas d'enveloppe libre, pas de choix de typologie, pas d'interface.
Il répond à une question et une seule : **les adjacences passent-elles à
100 % ?** Si oui, la question du graphe est réglée ; si non, la méthode
n'apportait pas ce qu'on croyait.

**Essai dual rectangulaire.** Nettement plus coûteux, et à ne lancer que si
le premier échoue ou si l'on découvre que le graphe éditable est prioritaire.
Il faut d'abord vérifier les conditions d'existence énoncées au §2.C, qui
décident de ce que le moteur pourra accepter comme graphe — ce contrôle est
lui-même un préalable bon marché.

### Écrire la règle de décision avant de connaître le résultat

Pré-enregistrer ce que chaque issue déclenche évite de délibérer après coup :

- **Adjacences à 100 % et diversité au-dessus de vingt signatures sur
  trente** → la typologie devient la méthode, le tirage actuel devient le
  producteur de variantes à l'intérieur d'une typologie.
- **Adjacences à 100 % mais diversité effondrée** → la typologie ne suffit
  pas seule ; elle fixe la topologie, le tirage reprend la dimension. Victoire
  partielle, à ne pas confondre avec une victoire.
- **Adjacences toujours en défaut** → la typologie n'était pas la réponse,
  et le dual rectangulaire devient la piste sérieuse.

Le second cas est le plus probable et le plus facile à mal lire : une
typologie garantit la topologie, donc les adjacences, mais elle produit
naturellement peu de formes. La diversité devra venir d'ailleurs, et ce
n'est pas un échec de la méthode.

### Le test de non-regret

Une méthode qui gagne aujourd'hui peut fermer demain. Avant de trancher,
une seule question : **le choix interdit-il les autres ?**

La typologie et le tirage **cohabitent** — l'une fixe la disposition, l'autre
l'habille. Le dual rectangulaire **remplace** les deux. Adopter la typologie
n'interdit donc pas d'aller vers le dual plus tard ; l'inverse est faux.

À qualité comparable, c'est ce qui doit départager.

### Ce qui ne se mesurera pas

Le graphe éditable — laisser l'utilisateur composer ses relations — est une
exigence **future**, absente du banc. La typologie y répondra mal par
construction : elle ne connaît que les graphes qu'on a écrits d'avance.

C'est le seul argument sérieux en faveur du dual rectangulaire, et il ne
sortira d'aucune mesure faite aujourd'hui. Il doit donc être pesé
explicitement, comme un pari sur la feuille de route, et non passé sous
silence parce qu'il ne se chiffre pas.

## 9. Réserve d'honnêteté

Ce document décrit des familles de méthodes, pas des implémentations
éprouvées dans ce projet. Les caractéristiques du tableau §6 sont des
propriétés connues de ces approches, pas des mesures faites ici — à la
différence de tout ce qui est chiffré dans la feuille de route, qui vient de
relevés.

Les conditions d'existence du dual rectangulaire sont énoncées de mémoire et
demandent vérification avant tout engagement : elles décident de ce que le
moteur pourra accepter comme graphe.
