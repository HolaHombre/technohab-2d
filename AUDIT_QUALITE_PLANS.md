# Audit humain standardisé des plans

**Version de l'instrument : 1.0 · moteur 3.3.0-alpha.1**

Cet instrument sert à transformer une lecture de plan en constats comparables,
rejouables et directement exploitables pour la suite de la roadmap. Il ne
remplace ni les règles du moteur ni la future comparaison externe M6 : il
documente ce que l'œil humain comprend, accepte ou refuse dans les plans de
l'atelier.

## Un audit, un plan précis

Le bouton **Analyse**, placé à droite du dessin, ouvre la grille au-dessus du
plan. Le dessin n'y subsiste que comme une masse floue sous un voile à 90 %.
Le brouillon est rattaché à
la graine, au rang dans la sélection et à la variante : passer du plan 1 au
plan 2 ne mélange donc pas les constats.

Chaque axe reçoit l'un des quatre constats suivants :

- **Acquis** : le point fonctionne sans correction notable ;
- **À affiner** : l'intention est juste mais son exécution reste inaboutie ;
- **Défaillant** : le point compromet la crédibilité ou l'usage du plan ;
- **Non observé** : le plan ne permet pas de conclure sur ce point.

Une explication apparaît au survol et au focus clavier. Un constat libre peut
être ajouté à chaque axe. L'export exige que les neuf axes soient renseignés ;
« Non observé » permet de conserver cette exhaustivité sans inventer un avis.

## Les neuf axes

1. accès et seuil ;
2. desserte et circulation ;
3. organisation des fonctions ;
4. relations entre pièces ;
5. usage et ameublement ;
6. proportions et surfaces ;
7. façades et lumière ;
8. caractère de la proposition ;
9. habitabilité perçue.

La synthèse finale nomme ce qui marche, ce qui est presque abouti et ce qui ne
fonctionne pas. Le champ « première correction » oblige à désigner le levier
prioritaire plutôt qu'à accumuler des remarques de même poids.

## Dossier exporté

« Exporter l'analyse » produit une archive unique nommée à partir de la graine
et du rang. Elle contient :

- `analyse.json`, avec les neuf constats, leurs notes, la synthèse et la
  première correction ;
- `plan.png`, image du plan actif avec ses cotes, ses pièces et son mobilier.

Le JSON contient aussi la demande initiale, le programme effectivement résolu,
les concessions éventuelles, la graine, le rang, le verdict des règles, les
autres propositions de la sélection, le document complet du plan et le journal
des générations conservé dans le navigateur.

Les mesures de vigilance sur les performances y sont jointes : durée de la
génération, nombre d'essais de résolution, nombre d'essais consacrés aux autres
propositions et coût total en appels du générateur. Les temps de chargement du
navigateur sont également consignés lorsqu'ils sont disponibles.

## Règles d'usage pour l'atelier

- auditer le plan affiché avant d'en changer le rang ;
- décrire un fait visible plutôt qu'une solution supposée ;
- réserver « Défaillant » à un défaut qui change réellement l'usage ou la
  crédibilité ;
- employer « Non observé » lorsqu'une information manque ;
- conserver les archives brutes : leur regroupement et leur codage viendront
  après plusieurs plans, pas pendant la première lecture.

Les plans et critères utilisés pour régler le moteur appartiennent au corpus
**atelier**. Ils ne pourront pas être réintroduits dans l'étalon aveugle M6.
