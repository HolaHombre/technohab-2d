# Cartographie actuelle du moteur TechnoHab

**Version décrite : 3.3.0-alpha.1 · 2 septembre 2026**

Ce document explique comment une demande devient plusieurs plans construits,
contrôlés et comparables. Il décrit le moteur réellement publié. Pour son
positionnement, ses preuves et ses limites, voir
[`ETAT_MOTEUR_PROCEDURAL.md`](ETAT_MOTEUR_PROCEDURAL.md).

## 1. Chaîne de décision

```text
Demande utilisateur
  → programme demandé
    → résolution exacte ou graduée
      → organisations candidates
        → plans construits et meublés
          → verdict pour chaque plan
            → sélection de trois propositions distinctes
              → consentement si une fonction a été retirée
                → affichage, audit humain et export du plan actif
```

La chaîne est volontairement découpée. Une demande, une organisation
géométrique et un plan jugé ne sont pas trois noms du même objet.

| Étape | Question traitée | Résultat |
|---|---|---|
| Intention | qu'a demandé l'utilisateur ? | options et graine rejouable |
| Programme | quelles fonctions, pièces et relations faut-il servir ? | surfaces, profils et graphe de relations |
| Résolution | le programme exact aboutit-il ? | exact, concession explicite ou échec |
| Topologie | quelle organisation spatiale essayer ? | famille, branches, affectation et enveloppe |
| Construction | que devient cette organisation avec des murs et équipements réels ? | plan utile, ouvertures, mobilier et chemins |
| Verdict | le résultat construit rompt-il une règle ? | violations, limites et validité |
| Sélection | quelles solutions différentes présenter ? | une à trois propositions valides |

## 2. Du formulaire au programme

L'interface accepte actuellement :

- 35 à 250 m² ;
- zéro à cinq chambres ;
- une ou deux salles d'eau ;
- cuisine ouverte ou séparée ;
- WC intégré ou indépendant ;
- enveloppe carrée, rectangulaire, en L ou en U ;
- priorité compacte, lumineuse ou économique.

Le programme normalise la demande, compose les fonctions intégrées et calcule
pour chaque pièce :

- un minimum lié au mobilier requis ;
- un objectif et un plafond de surface ;
- les profils et valeurs canoniques employés ;
- les relations obligatoires, souhaitables, déconseillées ou interdites.

L'allocation O1 réserve d'abord les planchers fonctionnels, puis distribue la
surface restante dans les enveloppes autorisées. Le total demandé n'est donc
plus partagé par simple proportion.

## 3. Résolution exacte et replis

Le moteur essaie le programme exact jusqu'à trois fois avec des graines
dérivées et rejouables. Si les stratégies disponibles ne trouvent rien, les
replis M5.2 sont essayés dans cet ordre :

1. fusionner cuisine séparée et WC indépendant dans leurs pièces hôtes ;
2. réduire les salles d'eau supplémentaires ;
3. retirer une fonction explicitement déclarée facultative ;
4. retirer une chambre, une à la fois, en dernier recours.

Une panne interne arrête la chaîne. Une concession ne réduit jamais une cote
bloquante, un équipement requis d'une fonction conservée ou une exigence de
sécurité. Le retrait d'une fonction doit être accepté avant affichage et
export.

Document d'autorité :
[`RESOLUTION_PROGRAMME.md`](RESOLUTION_PROGRAMME.md).

## 4. Recherche des organisations

Le moteur combine deux familles de poseurs.

### Poseur par squelette de circulation

Il construit d'abord une desserte, puis place les groupes de pièces dans les
poches disponibles. Les familles actuelles comprennent :

- barre et barre avec retour ;
- L intérieur ;
- T ;
- desserte intégrée droite, en L ou en U.

Les pièces sont affectées aux branches selon le graphe et leurs surfaces. Le
moteur balaie plusieurs proportions, affectations et dimensions. Les huit
transformations orthogonales changent l'orientation du plan sans faire passer
une simple rotation pour une nouvelle topologie.

Les terminaisons M4a.2 peuvent céder l'extrémité d'une branche à une pièce
receveuse. M5.0 mesure chaque bras, le nombre de portes qu'il dessert et la
longueur située après la dernière porte.

### Poseur en bandes

Il sert de repli lorsque le squelette ne loge pas le programme. Il produit des
bandes parallèles et accepte des programmes plus saturés, au prix d'une
diversité topologique plus faible.

Ces poseurs forment une bibliothèque procédurale bornée. Ils n'engendrent pas
encore une disposition générale à partir de n'importe quel graphe admissible.

## 5. Construction du plan réel

L'organisation retenue est encore une partition sans épaisseur. La
construction réalise ensuite, dans cet ordre :

1. façonnage éventuel des pièces, jusqu'à six arêtes orthogonales ;
2. correction d'échelle pour servir la surface habitable visée ;
3. murs extérieurs et cloisons avec leurs épaisseurs ;
4. portes intérieures, entrée et fenêtres avec réservations dans les murs ;
5. géométrie utile de chaque pièce, rectangulaire ou polygonale ;
6. programme d'équipements et poses dans la géométrie utile ;
7. débattements, zones d'usage et cheminements meublés ;
8. mesures de circulation, façade, branches et préférences.

Le mobilier qui participe au verdict provient du programme construit. Le
rendu lit les poses du plan ; il ne recalcule pas une organisation indépendante
pour faire joli.

M4c enrichit actuellement le séjour et la chambre avec gammes et optionnels.
Les autres profils consomment leur programme minimal compilé, même lorsque leur
dossier canonique est déjà C4.

## 6. Verdict et classement

Le contrôleur examine 32 règles sur le plan construit. Elles couvrent
notamment :

- conservation des surfaces et intégrité des murs ;
- ouvertures contenues dans leurs murs ;
- équipements ancrés et libres de leurs zones d'usage ;
- cheminement entre porte et usages requis ;
- surface, forme et meublabilité des pièces ;
- adjacences obligatoires ou interdites ;
- façade, entrée, accessibilité globale et circulation ;
- rangements et absence de surface sans propriétaire.

Deux règles portent encore une limite explicite du moteur. Une limite décrit
ce que la génération ne garantit pas encore ; elle ne doit pas être confondue
avec une conformité démontrée.

Les statuts sont :

- `VALID` : plan construit et aucune violation bloquante retenue ;
- `IMPOSSIBLE` : contradiction prouvée avant la recherche ;
- `NON_TROUVE` : stratégies épuisées sans preuve d'impossibilité ;
- `INVALIDE_DEBUG` : résultat impropre à la présentation.

Le classement M5 rejette d'abord les candidats bloquants. Il distingue ensuite
les objectifs de surface, les marges de confort, l'usage et les coûts de
circulation. Ces préférences choisissent entre plans valides ; elles ne rendent
jamais valide un plan bloquant.

## 7. Sélection et interface

La sélection recherche trois résultats valides et distincts. Elle favorise
d'abord la qualité globale, puis la diversité de famille et de stratégie. Une
simple rotation ou symétrie de la même organisation est dédupliquée.

L'interface publie :

- `COMPLETE` lorsque les trois propositions sont disponibles ;
- `PARTIAL` lorsqu'il existe moins de propositions distinctes que demandé ;
- `EMPTY` lorsqu'aucune comparaison ne peut être présentée.

Changer de rang met à jour ensemble le dessin, la graine, le rapport, le quiz
et les exports. Les touches gauche, droite, début et fin naviguent entre les
propositions.

L'analyse humaine est une couche d'atelier distincte du verdict automatique.
Elle relève neuf axes avec quatre constats explicites, conserve un brouillon
par graine et par rang, puis exporte dans une seule archive la grille, le plan
PNG, les paramètres, la résolution, les verdicts, les journaux et le coût de
génération. Elle est chargée seulement au premier usage.

## 8. Données, calcul et chargement

Le moteur reste sans dépendance d'exécution et fonctionne en hébergement
statique comme en `file://`.

| Autorité | Rôle |
|---|---|
| `canonical-values.data.js` | valeurs, source, statut et portée |
| `fit.data.js` | enveloppes et programmes d'équipements pré-calculés |
| `contracts.js` | objets et invariants du moteur |
| `relaxation.data.js` / `relaxation.js` | ordre et application des concessions |
| `squelette.js` / `typologie.js` | organisations spatiales candidates |
| `construction.js` | murs, surfaces utiles et réservations |
| `placement.js` | pose et validation géométrique des équipements |
| `generator.js` | programme, recherche, construction, sélection et résolution |
| `rules.js` | contrôleur indépendant du mode de fabrication |
| `app.js` | comparaison, rendu, consentement, historique et exports |
| `analysis.data.js` / `analysis.js` | grille humaine, brouillons et dossier d'audit |

Le catalogue éditorial complet du socle et le compositeur restent chargés à la
demande. Le calcul nécessaire au verdict est disponible dès la génération.

## 9. Preuves reproductibles

La porte principale est :

```text
npm run technohab:validate
```

Elle enchaîne 45 tests ciblés et quatre photographies, soit 49 étapes : O0,
19 plans de circulation M3.0, 48 plans topologiques M3 et 360 tentatives du
banc historique.

Le banc M5.2 mesure séparément les réponses exactes et les réponses obtenues
après concession. Sur 30 demandes fixes, 6 sont exactes et 24 sont relaxées ;
aucun plan publié par ce banc ne porte de violation bloquante. Quatre sélections
comparatives sur quatre contiennent trois signatures distinctes.

Ces mesures établissent la stabilité interne. La comparaison indépendante à
des plans humains reste le chantier M6.

## 10. Limites structurantes

La cartographie s'arrête où le modèle s'arrête : plain-pied, géométrie
orthogonale, programme domestique fermé, familles topologiques écrites à
l'avance, référentiel de pièces incomplet et faible capacité à prouver une
impossibilité géométrique.

Ces limites et leur conséquence sur la revendication « moteur procédural »
sont détaillées dans
[`ETAT_MOTEUR_PROCEDURAL.md`](ETAT_MOTEUR_PROCEDURAL.md).
