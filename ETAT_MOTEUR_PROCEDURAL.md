# État du moteur procédural TechnoHab

**Référence : version de travail 3.3.0-alpha.1 du 2 septembre 2026**  
**Périmètre : moteur local de plans de principe domestiques 2D**

## 1. Conclusion en une phrase

TechnoHab est déjà un **générateur procédural sous contraintes** : une même
méthode calcule des plans différents à partir d'un programme et d'une graine,
puis élimine les résultats qui rompent ses règles bloquantes. Il n'est pas
encore un **moteur de conception architecturale démontré**, car son espace de
solutions, son référentiel de pièces et sa validation externe restent trop
bornés.

La nuance n'est pas terminologique. Un générateur procédural sait produire et
faire varier. Un moteur architectural doit en plus couvrir le problème réel,
prouver ses refus et démontrer sur des références indépendantes que ses choix
sont crédibles et utiles.

## 2. Positionnement actuel

On peut distinguer quatre niveaux.

| Niveau | Définition | Situation de TechnoHab |
|---|---|---|
| 1. Dessinateur paramétrique | redimensionne une disposition préexistante | dépassé |
| 2. Générateur procédural | construit plusieurs géométries rejouables à partir de règles | **tenu dans le domaine déclaré** |
| 3. Résolveur architectural | explore un espace général de solutions et prouve contraintes et impossibilités | **amorcé, non tenu** |
| 4. Moteur de conception validé | qualité comparée à des plans humains et confirmée par des évaluateurs indépendants | **non démontré** |

La revendication honnête est donc :

> **Générateur procédural de plans de principe 2D sous contraintes, pour un
> programme domestique borné.**

Les expressions « moteur architectural crédible », « plans agréables » ou
« concepteur automatique » restent prématurées.

## 3. Ce que les dernières évolutions ont réellement apporté

### 3.1 La demande est devenue un programme calculable

Le moteur ne répartit plus seulement une surface entre des étiquettes de
pièces. Il construit un programme comprenant :

- les fonctions demandées et leurs compositions, par exemple cuisine ouverte
  dans le séjour ou WC intégré à la salle d'eau ;
- un plancher de surface lié à la possibilité de meubler la pièce ;
- une enveloppe cible et un plafond assumé pour l'allocation ;
- des relations obligatoires, souhaitables, déconseillées ou interdites ;
- les profils et valeurs canoniques qui ont servi au calcul.

L'allocation O1 distribue le surplus par enveloppes plutôt que par simple
proportion. Une pièce dont le besoin est satisfait cesse d'absorber de la
surface au détriment des autres.

**Apport procédural :** le plan dépend désormais d'un programme structuré et
non d'une juxtaposition de rectangles arbitraires.

### 3.2 La disposition n'est plus limitée à une découpe unique

Le moteur compare plusieurs familles : barre, barre avec retour, L intérieur,
T, desserte intégrée et pose en bandes de repli. Huit transformations
orthogonales permettent de changer l'orientation sans compter une simple
rotation comme une nouvelle invention.

Les circulations ont reçu trois corrections importantes :

- terminaisons intérieures possibles, afin de ne plus consommer
  systématiquement toute la façade ;
- suppression ou pénalisation des branches qui ne desservent aucune porte ;
- mesure du reliquat de couloir après la dernière porte.

**Apport procédural :** la graine agit sur une recherche parmi des familles,
des affectations et des dimensions ; elle ne se contente pas de recolorer un
gabarit fixe.

### 3.3 Le mobilier participe au verdict

Les murs, portes et fenêtres sont construits avant le verdict final. Le
programme d'équipements est ensuite posé dans la géométrie utile de chaque
pièce, y compris dans les pièces en L. Les emprises, zones d'usage, débattements
de porte et cheminements sont examinés ensemble.

La preuve S4 vérifie qu'une porte peut rejoindre les zones d'usage requises.
Le séjour et la chambre peuvent en plus recevoir des gammes et équipements
optionnels selon leur surface ; des replis retirent d'abord la gamme supérieure,
puis les optionnels, avant de refuser la pièce.

**Apport procédural :** la meublabilité n'est plus une décoration ajoutée après
la génération. Elle peut faire perdre un candidat.

### 3.4 Le moteur sépare construction, contrôle et classement

Chaque tentative traverse des états distincts : intention, programme,
organisation candidate, plan construit et verdict. Le contrôleur final examine
32 règles. Les exigences bloquantes invalident le candidat ; les conseils et
préférences servent à comprendre ou classer, sans transformer une faiblesse en
conformité.

Le résultat distingue quatre situations :

- `VALID` : un plan construit satisfait les règles bloquantes évaluables ;
- `IMPOSSIBLE` : une contradiction est prouvée avant la recherche ;
- `NON_TROUVE` : les stratégies disponibles n'ont rien trouvé ;
- `INVALIDE_DEBUG` : le calcul ou son contrôle est incohérent.

**Apport procédural :** l'échec fait partie du procédé. Il n'est plus masqué
par un plan dégradé présenté comme réussi.

### 3.5 Le produit présente plusieurs solutions comparables

La sélection M5 retient jusqu'à trois plans valides, distincts par leur
organisation et leur géométrie. L'interface M5.1 permet de les parcourir sans
perdre leur graine, leur verdict ni leur évaluation. Elle indique les objectifs
de surface ou de confort non atteints et la part de circulation du plan actif.

**Apport procédural :** le moteur ne donne plus une réponse unique qui ferait
croire à un optimum. Il expose plusieurs compromis issus de la même demande.

### 3.6 Une demande trop comprimée peut être résolue sans être falsifiée

Après trois échecs exacts, la résolution M5.2 applique des concessions dans un
ordre explicite : fusion des séparations, réduction des salles d'eau
supplémentaires, retrait d'une fonction déclarée facultative, puis retrait
d'une chambre en dernier recours.

La demande et le programme réellement servi restent côte à côte. Le retrait
d'une fonction exige un accord avant affichage et export.

**Apport procédural :** le moteur peut continuer à chercher tout en conservant
la différence entre « résoudre » et « changer la question ».

## 4. Pourquoi il s'agit bien de génération procédurale

TechnoHab satisfait les propriétés essentielles suivantes.

1. **Entrée paramétrique.** Surface, programme, forme et priorité modifient le
   calcul, pas seulement le dessin.
2. **Construction algorithmique.** Les pièces, circulations, murs et ouvertures
   sont dérivés par étapes ; ils ne proviennent pas d'un plan enregistré.
3. **Variabilité maîtrisée.** Une graine produit une variante déterministe et
   rejouable ; plusieurs graines explorent d'autres organisations.
4. **Composition.** Une cuisine ou un WC peuvent devenir une fonction intégrée
   sans perdre leurs équipements requis.
5. **Boucle de contrôle.** Les candidats sont construits, meublés, contrôlés et
   éventuellement rejetés avant présentation.
6. **Sélection multi-critère.** Conformité, usage, surface, circulation et
   diversité interviennent à des niveaux distincts.
7. **Traçabilité.** Le plan exporté conserve ses hypothèses, profils, valeurs,
   graine, concessions et verdict. Un audit humain standardisé peut désormais
   lui être joint avec son image, ses paramètres, ses journaux et son coût de
   génération.

Ce socle est sensiblement plus proche d'un moteur procédural que le prototype
initial : les variations touchent désormais la structure du plan et leurs
conséquences sont relues sur le résultat construit.

## 5. Les preuves disponibles

La porte de validation actuelle exécute 45 tests ciblés et 49 étapes. Elle
contrôle notamment le schéma d'export, les profils consolidés, les formes, les
murs, les ouvertures, la pose du mobilier, les chemins, les topologies et trois
photographies génératives.

Les mesures M5.2 portent sur 30 demandes fixes :

- 6 demandes témoins résolues exactement ;
- 24 demandes comprimées résolues avec concessions ;
- aucune demande encore irrésolue après les concessions autorisées ;
- aucune violation bloquante dans les plans publiés par ce banc ;
- quatre sélections comparatives complètes sur quatre, avec trois signatures
  distinctes chacune.

Ces résultats prouvent la cohérence interne et la rejouabilité. Ils ne prouvent
pas encore la qualité architecturale : le moteur est en partie évalué avec les
règles et poids écrits par le projet lui-même.

## 6. Ce qui empêche encore de parler d'un véritable moteur architectural

### 6.1 L'espace des solutions reste une bibliothèque bornée

Le moteur explore plusieurs familles, mais celles-ci sont écrites à l'avance.
Il ne sait pas encore déduire une organisation générale d'un graphe de relations
arbitraire. Une disposition absente de la bibliothèque ne peut pas émerger,
même si elle serait la meilleure réponse.

Le résultat est procédural, mais la grammaire spatiale reste courte.

### 6.2 Les adjacences ne sont pas toutes garanties par construction

Le graphe obligatoire est contrôlé et tenu sur les bancs courants, mais le
poseur ne dispose pas d'une méthode générale garantissant n'importe quel graphe
admissible. Certaines relations restent obtenues par choix de typologie,
classement et rejet.

Il manque soit un générateur topologique plus général, soit une méthode capable
de prouver qu'un graphe donné n'est pas réalisable dans l'enveloppe.

### 6.3 L'impossibilité n'est prouvée que dans peu de cas

TechnoHab sait prouver qu'un programme dont les planchers de surface dépassent
l'enveloppe est impossible. Dans la plupart des autres cas, il sait seulement
dire que ses stratégies n'ont rien trouvé.

Cette distinction est honnête, mais elle montre que le moteur reste un
explorateur heuristique plutôt qu'un résolveur complet.

### 6.4 Le référentiel architectural est incomplet

Chambre, séjour, cuisine, WC, circulation, entrée, rangement et bureau autonome
sont consolidés à C4 sur une portée déclarée. Le bureau est générable en
variante compacte ou convertible depuis L1. La salle d'eau autonome reste à C2 et
d'autres fonctions domestiques ne sont pas encore instruites une à une.

Même pour les profils C4, certaines relations fines restent ouvertes : ouvrants
des équipements, réseaux, lumière, ventilation, mobilier dépendant, usages
simultanés ou évolution dans le temps.

Le moteur sait donc bien résoudre **son référentiel actuel**, mais ce
référentiel ne représente pas encore toute la conception d'une maison.

### 6.5 Le bâtiment et son site sont très simplifiés

Le calcul reste limité au plain-pied orthogonal. Il ne traite pas encore :

- orientation solaire, vues, vents, voisinage et accès à la parcelle ;
- structure porteuse, trames, portées et descentes de charges ;
- réseaux complets, gaines, évacuations et compatibilité technique ;
- escaliers, superposition des niveaux et accessibilité verticale ;
- réglementation territoriale complète ;
- coût de construction, matériaux et performance environnementale.

Un plan cohérent dans TechnoHab peut donc rester inadapté à un terrain ou
irréalisable comme bâtiment.

### 6.6 La qualité perçue n'a pas encore d'étalon indépendant

Les poids de circulation, de surface et d'usage sont utiles pour trier les
candidats, mais certains restent doctrinaux. Améliorer un score interne ne
prouve pas que le plan paraît meilleur à un habitant ou à un architecte.

Il manque encore un corpus licencié, séparé entre mise au point et évaluation,
un protocole gelé et une comparaison à l'aveugle. C'est la fonction de M6.

### 6.7 Quelques défauts géométriques et de représentation subsistent

- S4 prouve l'accès aux zones d'usage, mais pas l'absence de fragmentation de
  tout le sol libre ;
- la rotation calculée de certains meubles n'est pas encore correctement
  dessinée ;
- les pièces complexes restent orthogonales et bornées à peu d'arêtes ;
- les ouvertures et façades sont cohérentes avec le modèle, mais ne résultent
  pas encore d'une étude complète de lumière, de vues et de technique.

Ces défauts ne nient pas le caractère procédural ; ils limitent la fidélité du
modèle architectural.

### 6.8 La résolution graduée améliore le taux de réponse, pas la demande

Une proposition obtenue après retrait d'une salle d'eau ou d'une chambre est
une réponse utile au problème voisin, pas une résolution du programme initial.
La trace et le consentement empêchent la confusion, mais les taux de succès
exacts et relaxés doivent toujours rester séparés.

## 7. Ce qui rapprocherait réellement le moteur du niveau suivant

Les prochains progrès décisifs ne consistent pas à ajouter davantage de
tirages. Ils consistent à élargir et à valider la connaissance du moteur.

1. **Geler le protocole M6.0** avant de consulter l'étalon humain.
2. **Licencier et séparer le corpus M6.1** entre atelier et évaluation.
3. **Comparer avec un instrument commun M6.2**, sans révéler l'origine des
   plans.
4. **Consolider les profils restants**, une pièce et une composition à la fois.
5. **Généraliser la topologie**, afin que le graphe puisse engendrer la
   disposition plutôt que seulement la contrôler.
6. **Étendre les preuves d'impossibilité**, pour réduire la zone grise
   `NON_TROUVE`.
7. **Introduire progressivement le site, la structure et les réseaux**, en
   conservant la séparation entre règles bloquantes et préférences.

## 8. Verdict d'ingénierie

TechnoHab a franchi le seuil du prototype qui « dessine des pièces ». Il
produit maintenant des objets spatiaux rejouables, compare plusieurs
organisations, construit leurs murs et ouvertures, vérifie leur équipement et
explique ses concessions. C'est bien un moteur procédural.

Ce qui lui manque n'est plus principalement une mécanique de génération. Il
lui manque une **couverture architecturale plus large**, une **résolution
topologique générale** et une **preuve externe de qualité**. Tant que ces trois
conditions ne sont pas réunies, TechnoHab doit rester présenté comme un
proposeur de plans de principe sous contraintes, non comme un architecte
automatique.
