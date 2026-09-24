# Gabarit d'analyse d'une pièce

Trame commune à toute analyse de pièce TechnoHab. Elle est le livrable de
méthode du lot **C-P0** de la vNext ([`ROADMAP_HISTORIQUE.md`](ROADMAP_HISTORIQUE.md) §6.2) : les
profils pilotes ne valent pas seulement pour eux-mêmes, ils fixent la forme que
prendront les suivants.

**Ce document fait foi sur la structure d'une analyse**, pas sur les valeurs.
`SOCLE_AGENCEMENT.md` fait foi sur les cotes du socle,
`DATASOURCE_EQUIPEMENTS.md` sur leur sourcing, `VEILLE_NORMATIVE.md` sur le
droit, `SUIVI_REGLES_PIECES.md` sur l'état d'avancement de chaque pièce.

## Ce que cette trame remplace

Les huit fiches de `agencement/` suivent un gabarit à cinq sections — valeurs
de référence, dimensionnement dérivé, confrontation au moteur, règles
proposées, écarts relevés. Ce gabarit répond à une question : *quelles cotes,
et le moteur est-il d'accord ?* Il ne répond pas à celle qui vient avant :
*quels usages, quelles enveloppes, quelles circulations et quelles relations
doivent être satisfaits pour que cette pièce fonctionne ?*

Les fiches existantes ne sont pas invalidées : leurs sections 1, 3 et 5
alimentent respectivement les §3, §12 et la relecture d'écart de la présente
trame. Elles sont **incomplètes, pas fausses**.

## Où vivent les profils

`profils/<nom>.md`, un fichier par pièce, distinct de `agencement/` qui garde
les fiches de sourcing antérieures. Chaque profil porte en tête son type, sa
**maturité C0–C6** et la date de sa dernière relecture.

**Exemplaire de référence : [`profils/wc-separe.md`](profils/wc-separe.md)**
(`TOILET_SEPARATE`, maturité `C4`). Il montre comment traiter les trois cas que
la trame ne prévoit pas : un équipement obligatoire **sans emprise 2D**, une
valeur d'apport **non vérifiée**, et un mécanisme supposé qui **n'existe pas
encore** dans le moteur.

**Cas composé : [`profils/salle-eau-wc-integre.md`](profils/salle-eau-wc-integre.md)**
(`BATHROOM_WITH_TOILET`, `C4`). Il ajoute trois cas propres aux compositions :
l'équipement du programme absorbé rendu **superflu** par celui de l'hôte, la
relation qui devrait exister **entre** les deux programmes, et le critère de
qualité **propre à un profil** — ici `wet_dry_separation`, qui ne se déduit
d'aucun critère générique.

## Doctrine

L'analyse ne cherche pas *quelle surface fait cette pièce*. Elle cherche
**quels objets, usages, enveloppes, circulations et relations doivent être
satisfaits, et quelle géométrie peut ensuite les contenir efficacement.** La
surface est une conséquence du programme fonctionnel, encadrée par des plages
Minimal / Moyen / Large. C'est la même doctrine que le chantier 9 §9.3 applique
au moteur ; ce gabarit l'applique à l'analyse qui le nourrit.

Priorités, dans cet ordre : fonctionnalité réelle, ergonomie, dimensions et
dégagements, relations géométriques, circulations, rationalité architecturale,
contraintes réglementaires réellement applicables, facilité de traduction
algorithmique.

Thermique, acoustique et renouvellement d'air sont mentionnés lorsqu'ils sont
pertinents mais restent **secondaires et non bloquants**, sauf lorsqu'un texte
impose explicitement une contrainte.

Une solution est bonne lorsqu'elle est géométriquement valide, réellement
utilisable, compacte sans être comprimée, cohérente avec les usages,
rationnelle dans ses circulations, techniquement plausible, architecturalement
crédible et interprétable par un moteur procédural. Privilégier les règles
**généralisables et calculables** aux prescriptions esthétiques.

---

## 1. Définition fonctionnelle

Fonctions principales, fonctions secondaires, usages simultanés ou successifs,
nombre typique d'utilisateurs, sous-fonctions. Proposer si nécessaire une
famille fonctionnelle générique regroupant plusieurs variantes.

```text
ROOM_TYPE
PRIMARY_FUNCTIONS
- ...
SECONDARY_FUNCTIONS
- ...
```

## 2. Équipements

Distinguer obligatoires, fortement recommandés, optionnels, exceptionnels ou
propres aux grandes versions. Tableau `Équipement | Minimal | Moyen | Large`.

Ne jamais confondre **nécessité réglementaire**, **nécessité fonctionnelle** et
**recommandation de confort** ; le préciser dès qu'il y a risque.

## 3. Dimensions des équipements

Une **plage** par équipement important, jamais une valeur unique. Distinguer
compact / standard / confortable.

> *Ancrage.* C'est la matière du mécanisme de **gamme**
> ([`GAMMES_EQUIPEMENTS.md`](GAMMES_EQUIPEMENTS.md)) : le plancher va dans
> `footprint`, les montées dans `sizes`. Le plancher engage le domaine de
> faisabilité — l'abaisser laisse entrer des pièces aujourd'hui refusées, et
> c'est une décision, jamais un effet de bord.

## 4. Enveloppes d'usage

Pour chaque objet : espace latéral, frontal, d'accès, d'ouverture,
d'utilisation, de transfert éventuel, et zone temporairement occupée pendant
l'usage.

```text
PHYSICAL_FOOTPRINT
EXCLUSIVE_USAGE_ZONE
SHARED_USAGE_ZONE
TEMPORARY_SWING_ZONE
ACCESS_ZONE
```

Classer chaque dégagement en `HARD_MIN` (sous ce seuil la solution est
inutilisable), `TARGET` (conception normale), `COMFORT` (usage nettement plus
confortable). Ne jamais présenter une valeur ergonomique comme une obligation
réglementaire.

> *Ancrage.* Le solveur distingue déjà zone partagée et zone exclusive :
> `usage: [{ face, min, comfort, exclusive }]` — deux zones ne se gênent que si
> l'une est `exclusive` ([`assets/placement.js`](assets/placement.js)). La
> mutualisation demandée au §7 est donc acquise. Manque le niveau `TARGET`,
> entre `min` et `comfort`.

## 5. Trois classes dimensionnelles

**MINIMAL** — pièce réellement utilisable dans une emprise faible : surface
cible, largeurs et profondeurs typiques, équipements conservés, équipements
supprimés, compromis acceptés, **compromis à ne jamais accepter**. Le minimal
n'est pas la plus petite géométrie où les objets entrent physiquement.

**MOYEN** — configuration standard, rationnelle et confortable pour un logement
courant. C'est le **cas de référence du moteur**.

**LARGE** — exploiter une emprise importante en améliorant l'usage, non en
produisant du vide : équipements supplémentaires, sous-zones, rangement,
usages simultanés. Indiquer **à partir de quel seuil les gains deviennent
faibles** et où la surface serait mieux attribuée.

> *Ancrage — arbitrage rendu.* Ces trois classes sont un **vocabulaire de
> doctrine**, pas un champ de donnée. Le socle exprime déjà la gradation par
> `minRoomArea` équipement par équipement, et les gammes par `from`. Créer un
> énuméré `sizeClass` en parallèle ferait décider deux endroits de la même
> chose — le défaut que `MODELE_EXIGENCES.md` §1 bis vient de corriger. Le
> seuil « au-delà duquel les gains sont faibles » alimente en revanche le
> `maxRatio`, dont l'absence est la cause mesurée du chantier 9.

## 6. Règles d'agencement

Chaque relation classée `REQUIRED`, `PREFERRED`, `NEUTRAL`, `UNDESIRABLE`,
`FORBIDDEN`. Étudier équipement contre équipement, contre mur, contre porte ;
visibilité et accès depuis l'entrée ; ordre logique des usages ; circulation
entre fonctions ; proximité des équipements complémentaires ; conflits entre
utilisateurs.

> *Ancrage.* `relations` du socle porte `between`, `same-wall`,
> `different-wall`, `near`, `faces`, aux niveaux `HARD` et `GUIDELINE`. Une
> relation `HARD` participe au retour arrière ; une `GUIDELINE` départage.

## 7. Circulations

Trajectoires d'usage (`ENTRÉE → OBJET_A`, `OBJET_A → OBJET_B`), circulation
principale et secondaire, cul-de-sac acceptable ou non, contournements,
conflits de trajectoire, zones mutualisables. **Mutualiser plutôt qu'additionner
naïvement les enveloppes.**

> *Ancrage.* C'est la règle `S4` du socle — chemin continu de la porte à chaque
> zone d'usage requise — déclarée **bloquante et non évaluée**. Rattachée au
> lot M4 de la vNext.

## 8. Porte et accès

Largeur utile, position, sens d'ouverture, battante ou coulissante, conflits
avec équipements et zones d'usage, risque de rester coincé derrière le battant,
accessibilité des équipements dès l'entrée. Hiérarchie `BEST` / `ACCEPTABLE` /
`UNDESIRABLE` / `FORBIDDEN`.

> *Ancrage.* Règle `S3` du socle — le débattement n'empiète sur aucune emprise
> ni zone d'usage requise — également bloquante et non évaluée. Rattachée au
> lot M2, qui fait de la porte un objet. Aujourd'hui `debattement: null` et le
> WC reçoit une coulissante par décret.

## 9. Formes possibles de la pièce

Rectangle longitudinal, transversal, carré, L, trapèze, polygone,
décrochement, niche. Pour chacune : pertinence, avantages, défauts, classes
concernées, conditions nécessaires. Privilégier le rectangle quand il produit
objectivement une meilleure efficacité, sans le poser en obligation.

> *Ancrage.* Le solveur est rectangulaire et sert une pièce en L par sa seule
> partie principale — limite ouverte de D2, lot M4b. Toute doctrine de forme
> écrite ici est aujourd'hui non vérifiable au-delà du rectangle.

## 10. Archétypes d'implantation

Schémas ASCII lorsqu'ils apportent quelque chose : une ou plusieurs bonnes
configurations, une mauvaise configuration typique, et pourquoi. Les schémas
révèlent des **relations spatiales**, ils ne sont pas des plans.

## 11. Relations avec les autres pièces

`VERY_FAVORABLE`, `FAVORABLE`, `NEUTRAL`, `UNDESIRABLE`, `FORBIDDEN`. Étudier
circulation, entrée, séjour, cuisine, chambres, autres pièces d'eau, locaux
techniques, extérieur, gaines. Acoustique et thermique donnent un bonus ou
malus secondaire, jamais dominant, sauf contrainte réglementaire.

> *Ancrage — contrainte de forme.* Le score du moteur ne connaît que des
> **pénalités**, et sa sortie anticipée dépend d'un plan parfait à zéro. Une
> préférence s'écrit donc en peine d'absence, jamais en prime. Et une
> préférence qui vise un objet non encore posé — tête de lit, zone repas — est
> inatteignable : le score s'exécute avant le placement du mobilier. Elle se
> réduit à une relation entre pièces, ou elle attend. Le typage des adjacences
> est le lot M3.

## 12. Contraintes techniques

Uniquement les contraintes structurantes : eau froide, eau chaude, évacuation,
électricité, extraction, gaz, réseaux spécifiques, gaines, équipements
techniques. Favoriser réseaux courts, gaines mutualisées, murs techniques
partagés, accès de maintenance. Pas d'étude thermique, acoustique ou de
ventilation détaillée à ce stade.

> *Ancrage.* `services: ['eau', 'evacuation', 'electricite', 'ventilation']`
> existe au socle, par équipement et par pièce. Les débits ne s'écrivent pas
> en dur : ils dépendent de la configuration du logement (`REF-009`).

## 13. Réglementation française

Pour chaque règle : ce qui est réellement obligatoire, dans quel contexte,
en distinguant maison individuelle pour soi, logement destiné à la vente ou à
la location, accessibilité, neuf et rénovation. Sources officielles —
Légifrance, Service-Public, textes normatifs. Signaler l'incertain.

**Ne jamais transformer une recommandation ergonomique, une habitude
architecturale ou une dimension commerciale standard en exigence
réglementaire.** `agencement/wc.md` §2 est l'exemple à ne pas répéter : un
espace d'usage d'accessibilité y avait été lu comme un gabarit de pièce.

## 14. Accessibilité

Dimension **indépendante de la taille**. Jamais `LARGE = ACCESSIBLE`.

```text
SIZE_CLASS : MINIMAL | MEDIUM | LARGE
ACCESSIBILITY : STANDARD | ADAPTABLE | ACCESSIBLE
```

Décrire les modifications qu'entraîne l'activation d'un mode accessible.

> *Ancrage.* `VEILLE_NORMATIVE.md` a déjà tranché la nature des trois valeurs :
> `VAL-PMR-022` définit le logement **évolutif** — cheminement accessible
> jusqu'au séjour et au cabinet d'aisances — distinct de l'accessible. C'est
> l'équivalent d'`ADAPTABLE`, et il est sourcé.

## 15. Critères de qualité spatiale

Les variables permettant de comparer deux implantations toutes deux valides :
`spatial_efficiency`, `circulation_efficiency`, `equipment_accessibility`,
`functional_overlap`, `privacy`, `door_conflicts`, `dead_space`,
`network_complexity`, `shape_complexity`. Proposer des bonus/malus
**conceptuels**, sans figer de pondération.

> *Ancrage.* C'est la matière de l'instrument du lot M0 — le banc mesure
> conformité, diversité, meublabilité et durée, jamais la qualité d'usage. Une
> pondération se calibre contre cet instrument, jamais avant lui.

## 16. Synthèse Minimal / Moyen / Large

| Paramètre | Minimal | Moyen | Large |
|---|---:|---:|---:|
| Surface cible | | | |
| Dimensions préférées | | | |
| Équipements | | | |
| Dégagements | | | |
| Formes privilégiées | | | |
| Niveau de confort | | | |
| Options | | | |

## 17. Traduction TechnoHab

```text
ROOM_TYPE
REQUIRED_OBJECTS
OPTIONAL_OBJECTS
FUNCTIONAL_ZONES
HARD_CONSTRAINTS
SOFT_CONSTRAINTS
PREFERRED_ADJACENCIES
UNDESIRABLE_ADJACENCIES
FORBIDDEN_RELATIONS
SIZE_CLASSES : MINIMAL | MEDIUM | LARGE
ACCESSIBILITY : STANDARD | ADAPTABLE | ACCESSIBLE
```

Ajouter les propriétés propres à la pièce lorsqu'elles existent.

---

## Règle d'usage

Une section sans matière se remplit par **« non traité, et pourquoi »**, jamais
par du plausible. Un manque déclaré se retrouve ; un manque comblé par
convention se fond dans le reste et devient indiscernable d'une valeur sourcée.
C'est la même exigence que le statut `N3` impose aux cotes.
