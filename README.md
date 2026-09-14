# TechnoHab — générateur local de plans de principe 2D

**Version de travail : 3.3.0-alpha.1 · 2 septembre 2026**  
**Démonstration : <https://wonderland-4fi.pages.dev/technohab/>**

TechnoHab transforme un programme domestique borné en plusieurs organisations
2D mesurées, meublées et contrôlées. Le moteur fonctionne localement, sans
dépendance d'exécution et sans transmission de données.

La formulation exacte de son état actuel est :

> **générateur procédural de plans de principe 2D sous contraintes, dans un
> domaine domestique borné.**

Il ne constitue pas encore un moteur de conception architecturale validé. La
différence, les preuves disponibles et les limites sont exposées dans
[`ETAT_MOTEUR_PROCEDURAL.md`](ETAT_MOTEUR_PROCEDURAL.md).

## Lire la documentation

| Besoin | Document d'entrée |
|---|---|
| Comprendre ce que le moteur sait réellement faire | [`ETAT_MOTEUR_PROCEDURAL.md`](ETAT_MOTEUR_PROCEDURAL.md) |
| Suivre la chaîne de calcul actuelle | [`CARTOGRAPHIE_MOTEUR.md`](CARTOGRAPHIE_MOTEUR.md) |
| Connaître l'ordre des prochains travaux | [`ROADMAP.md`](ROADMAP.md) |
| Comprendre les objets et statuts échangés | [`CONTRATS_MOTEUR.md`](CONTRATS_MOTEUR.md) |
| Comprendre les replis quand une demande n'aboutit pas | [`RESOLUTION_PROGRAMME.md`](RESOLUTION_PROGRAMME.md) |
| Lire les règles de conception générales | [`DOCTRINE.md`](DOCTRINE.md) |
| Vérifier la maturité de chaque pièce | [`profils/README.md`](profils/README.md) |
| Rejouer les mesures | [`PROTOCOLE_MESURES.md`](PROTOCOLE_MESURES.md) |
| Auditer humainement un plan et exporter le dossier | [`AUDIT_QUALITE_PLANS.md`](AUDIT_QUALITE_PLANS.md) |

## Domaine actuellement couvert

- logement de plain-pied, orthogonal, de 35 à 250 m² ;
- zéro à cinq chambres et une à deux salles d'eau ;
- cuisine ouverte ou séparée, WC intégré ou indépendant ;
- enveloppe carrée, rectangulaire, en L ou en U ;
- plusieurs organisations comparables par demande ;
- murs, portes, fenêtres, mobilier, zones d'usage et cheminements représentés ;
- résultat rejouable à partir de sa graine ;
- audit humain standardisé par graine et par rang, exporté avec le PNG, les paramètres et les journaux ;
- refus, échec de recherche et repli de programme explicitement distingués.

Le plan produit est un **plan de principe non contractuel**. Il n'intègre pas
encore le site, l'orientation solaire, la structure porteuse, les réseaux
complets, les niveaux, un référentiel réglementaire territorial complet ni la
validation d'un architecte.

## Validation

La commande de référence est :

```text
npm run technohab:validate
```

La photographie de travail comprend 45 tests ciblés et 49 étapes : schéma 3.1,
allocation O0, bancs de circulation et de topologies, puis 360 tentatives
historiques. Les essais produit interdisent la présentation d'un plan portant
une violation bloquante.
