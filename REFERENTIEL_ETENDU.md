# Référentiel étendu — les domaines reportés

**Produit le 24 septembre 2026**, en extension de `REF-1`
([trame](AUDIT_REFERENTIEL_EXTERNE.md), [livrable](DIFFERENTIEL_REFERENTIEL.md)).

Le différentiel a écarté sept domaines d'un bloc, au motif qu'ils sont hors du
domaine annoncé. **Ce document les reprend et les décrit.** La raison est
simple : « hors du domaine d'aujourd'hui » n'est pas « sans intérêt demain »,
et un domaine qu'on décrit quand on le rencontre coûte moins cher qu'un
domaine qu'on redécouvre quand on en a besoin.

**Statut de ce document.** Il ne rend aucun verdict et n'ouvre aucun item. Il
ne déplace pas la frontière posée par `DOCTRINE.md` et
`ETAT_MOTEUR_PROCEDURAL.md` §6.5 : le moteur reste un générateur de plans de
principe de plain-pied. Il dit ce qu'il faudrait modéliser *le jour où* l'un
de ces domaines s'ouvrirait, et ce que cela coûterait.

**Ce qu'il contient, et ce qu'il ne contient pas.** Des structures d'entité,
des nomenclatures de métier et des plages de dimensions. Aucune ligne de
catalogue recopiée, aucun visuel, aucun identifiant tiers. Les énumérations
ci-dessous sont des faits de construction — une toiture à deux pans, une VMC
double flux, un disjoncteur différentiel — que toute source du métier publie.

---

## 1. Ce que l'élargissement représente

Rapporté aux 826 objets de l'étalon :

| Domaine | Objets | Ce que ça pèse |
|---|---:|---|
| Électricité et courants faibles | 123 | le plus gros domaine, et de loin |
| Extérieur et site | 106 | second, et entièrement hors de notre enveloppe |
| Ventilation, chauffage, fluides | 99 | troisième |
| Structure porteuse et parements | 77 | majoritairement des textures, non de la structure |
| Toiture et couverture | 64 | dont ~40 de simple parement |
| Domotique et sécurité | 43 | largement tertiaire / ERP |
| Annotation et mesure | 34 | outillage d'éditeur, sans objet pour un générateur |
| Étage, escalier, rampant | 23 | le plus petit, et le plus structurant |
| Revêtements | 23 | parement |

Lecture importante : **la masse n'est pas la difficulté.** Sur les 592 objets
de ces domaines, une large majorité sont des **parements** — 40 couvertures de
toit, 23 revêtements, une cinquantaine de textures de mur et de sol. Ils ne
demandent aucun modèle : ce sont des remplissages. Ce qui demande un modèle
tient dans les cinq sections suivantes.

## 2. Étage et niveau — le domaine le plus structurant

Le plus petit en objets, le plus lourd en conséquences : **il change la
topologie**, alors que tous les autres se posent dessus.

Entités à porter :

- **Niveau** : nom, altitude, hauteur libre, épaisseur de dalle. Le plancher
  d'un niveau est le plafond du précédent : la valeur ne peut être portée deux
  fois.
- **Trémie** : une pièce dont la surface est retirée du plancher, et qui doit
  exister aux deux niveaux qu'elle relie. L'étalon la traite comme un type de
  pièce, ce qui est le bon choix : le vide est une pièce dont la fonction est
  d'être vide.
- **Escalier** : emprise, sens de montée, et surtout **son emprise au
  niveau haut, qui n'est pas celle du niveau bas**. Cinq géométries suffisent
  au domaine résidentiel — droit, quart tournant, demi tournant, colimaçon,
  échelle. Plages relevées : de 1400 × 1400 (colimaçon) à 2800 × 1700
  (demi tournant).
- **Garde-corps** : présence et type. Aucun effet géométrique en plan, sauf
  l'épaisseur qu'il retire au passage.
- **Rampant** : la hauteur sous comble varie dans la pièce. L'étalon porte six
  configurations. C'est ce qui rend une surface non pleinement habitable —
  et donc ce qui distinguerait une surface au sol d'une surface habitable.

**Coût réel pour nous.** Élevé, mais localisé : la découpe, le graphe
d'adjacences et le cheminement devraient tous gagner une dimension. Le
cheminement, en particulier, cesserait d'être plan. C'est un changement de
nature, pas un enrichissement.

## 3. Toiture — deux choses à ne pas confondre

- **La forme** (à modéliser le jour venu) : 2 pans, 3 pans, 4 pans,
  monopente, et leurs déclinaisons sur enveloppe en L (2, 4, 5 bas, 5 haut,
  6 pans). Neuf combinaisons couvrent le résidentiel courant. Paramètres :
  pente, sens de faîtage, débord. La forme dépend de l'enveloppe — nos
  enveloppes carrée, rectangulaire, L et U y mènent directement.
- **Les percements** : fenêtre de toit, chien assis, souches de cheminée,
  sorties de VMC, panneaux photovoltaïques. Ce sont eux qui interagiraient
  avec le plan — un conduit traverse les niveaux et occupe de la surface à
  chacun.
- **La couverture** (~40 entrées) : tuile, ardoise, bac acier, zinc,
  végétalisé, étanchéité. **Pur parement.** Aucun modèle, une énumération.

**Coût.** Faible si on s'en tient aux percements ; la forme n'a de sens qu'en
3D, et la couverture ne mérite qu'une liste.

## 4. Structure porteuse — un manque réel, mal représenté chez l'étalon

L'étalon compte 77 entrées dans cette famille, mais ~65 sont des **textures de
parement** (briques, enduits, bétons, parquets). La structure réelle tient en
dix profils : chevron, demi-chevron, tasseau, bastaing, madrier, poutrelle
béton, poutre béton, poteau bois, poteau béton, poteau métal. Plages de
section relevées : 38 × 63 à 200 × 200 mm.

Ce qui compte pour un plan de principe n'est pas la section, c'est la
**portée** — donc la distinction déjà identifiée au différentiel §4.3 entre
mur porteur et cloison. Un mur porteur ne se déplace pas librement ; une
cloison si. C'est la seule part de ce domaine qui change un verdict, et elle
est déjà ouverte comme ligne 4 du différentiel.

**Coût.** Le reste du domaine : nul, parce qu'il ne nous concerne pas.

## 5. Réseaux — électricité, fluides, ventilation

Le plus gros domaine en volume (222 objets cumulés), et celui dont la
structure est la plus claire une fois les symboles mis de côté.

**Électricité.** Trois couches distinctes, que l'étalon mélange :

1. *Points d'usage* — prises (dont prises dédiées : four, plaque, lave-linge,
   lave-vaisselle, réfrigérateur, congélateur, sèche-linge, cumulus, volet),
   interrupteurs (12 variantes fonctionnelles : simple, double, va-et-vient,
   poussoir, variateur, automatique, bipolaire, volet), points lumineux.
2. *Distribution* — tableau (formats 1×6 à 4×24 modules), disjoncteurs par
   calibre (C10 à C40, mono et triphasé), différentiels par type (AC, A,
   A+6mA, B), sections de fil par usage (1,5 éclairage / 2,5 prises /
   6 cuisson), boîtes de dérivation, terre.
3. *Production et stockage* — photovoltaïque, onduleur, micro-onduleur,
   batterie.

La couche 1 est la seule qui touche le plan : **un point d'usage est ancré à
un mur et à une hauteur**, et les prises dédiées sont liées à un équipement
que notre socle porte déjà (`fridge`, `washer`, `dishwasher`, `hob`,
`water_heater`…). C'est le lien le plus direct entre ce domaine et notre
modèle actuel : nos équipements portent déjà un champ `services`
(`eau`, `evacuation`, `electricite`).

**Fluides.** Alimentation (eau froide, eau chaude, PER, multicouche, cuivre),
évacuation (eaux usées, eaux vannes, eaux pluviales), organes (vannes,
collecteurs 3 / 4 / 6 départs, clapet, compteur, détendeur, fosse). Le fait
structurant est déjà connu de nous et écrit en `OUVERTURES_ET_PARCOURS.md` §1 :
**les pièces d'eau se regroupent parce que leurs conduits se mutualisent.**
Ce domaine confirmerait cette règle, il ne l'apprendrait pas.

**Ventilation.** Cinq types — naturelle, simple flux, hygroréglable A,
hygroréglable B, double flux — plus les organes : caisson, bouches
d'extraction, conduits (9 et 16 cm, rigides ou semi-rigides), rejets et prises
d'air, silencieux, groupes par débit (150 à 600 m³/h). Une double flux impose
un volume de caisson et un réseau à deux conduits par pièce : c'est le seul
choix de ce domaine qui consommerait de la surface au plan.

**Chauffage.** Générateurs (chaudière gaz / fioul / bois, PAC, poêle bois ou
granulés, géothermie) et émetteurs (radiateurs à inertie 1000 à 2500 W,
radiants, fonte, sèche-serviettes, plancher chauffant). Un émetteur est ancré
au mur et **interdit d'y adosser un meuble** : c'est la seule interaction de
ce domaine avec l'agencement, et elle est du même ordre que l'allège déjà
identifiée au différentiel.

**Coût.** Modéré et modulaire. Aucune de ces couches n'oblige les autres.

## 6. Bilan énergétique — un modèle de calcul complet, et séparable

L'étalon porte un module thermique dont la structure est intégralement
lisible, et qui a l'intérêt de ne dépendre du plan que par trois entrées :
surfaces, orientations, et composition d'enveloppe.

- *Bâtiment* — année de construction ; traitement des ponts thermiques, en
  quatre niveaux (non traités / partiellement / traités récents / RT2012+).
- *Systèmes* — chauffage (6 : électrique, gaz, fioul, PAC, bois, granulés) ;
  ventilation (5, cf. §5) ; eau chaude sanitaire (5 : cumulus, chaudière gaz,
  chaudière fioul, thermodynamique, solaire CESI).
- *Climat* — par département, avec valeurs surchargeables : DJU, température
  de base, température moyenne, jours de chauffe, température d'eau froide.
- *Économie* — prix des cinq énergies (électricité et gaz au kWh, fioul au
  litre, bois au stère, granulés à la tonne).
- *Occupation* — nombre d'occupants, pour l'eau chaude.

**Ce que ça nous dit.** Ce module est **le mieux séparé de tout l'étalon** :
il ne touche pas la géométrie, il la consomme. Si un jour TechnoHab chiffre
quoi que ce soit, c'est la forme à viser — un calcul qui lit le plan sans le
contraindre. Et il éclaire rétroactivement une ligne du différentiel : le
matériau de mur, écarté faute de verdict, en trouverait un ici.

**Coût.** Indépendant du moteur. C'est sa qualité principale.

## 7. Site et extérieur

106 objets, dont l'essentiel est du mobilier de jardin et de la végétation —
sans modèle, purement figuratif. Ce qui aurait un sens pour nous :

- **Parcelle et limites** : emprise, limites séparatives, recul. Ce sont elles
  qui borneraient l'enveloppe, aujourd'hui libre. L'étalon les obtient par
  import cadastral IGN.
- **Orientation** : quatre boussoles au catalogue. `ETAT_MOTEUR_PROCEDURAL.md`
  §6.5 note déjà l'absence d'orientation solaire comme une limite. C'est
  l'entrée la plus légère de tout ce document, et peut-être la plus rentable :
  un angle de nord suffirait à qualifier l'exposition de chaque façade, dont
  le moteur connaît déjà les segments.
- **Accès** : portail, allée, stationnement extérieur.

**Coût.** L'orientation : faible. La parcelle : moyen, et elle changerait la
nature de la génération — d'un programme borné vers un programme *situé*.

## 8. Ce que l'élargissement ne change pas

La frontière du moteur reste celle de `DOCTRINE.md`. Rien de ce document
n'est une intention, et aucun item de roadmap n'en découle. Il est écrit pour
qu'au jour où l'une de ces portes s'ouvrira, la question posée soit
« par où commence-t-on », et non « qu'y a-t-il derrière ».

Trois choses en ressortent quand même, et elles méritent d'être sues :

1. **L'orientation est à portée immédiate** — un angle, sur des segments de
   façade que le moteur possède déjà.
2. **Les prises dédiées se branchent sur un champ existant** — nos
   équipements portent déjà `services`.
3. **Le bilan énergétique est séparable** — il consomme le plan, il ne le
   contraint pas. C'est la seule extension qui n'ajouterait aucune contrainte
   de génération.
