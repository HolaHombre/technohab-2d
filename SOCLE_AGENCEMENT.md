# Socle d'agencement — équipements, placement, accessibilité

Arborescence des pièces, de leurs équipements minimaux et des critères de
placement impérieux. Ce document est le **socle** : la base sur laquelle une
surcouche de calcul pourra valider ou refuser un plan.

**Statut au 16 août 2026 : partiellement implémenté.** Ce document reste la
référence ; le code en applique désormais une partie.

| Élément du socle | État |
|---|---|
| Arborescence et équipements (§5) | transcrits dans `assets/socle.data.js` |
| Désignation des exigences minimales | `assets/room-model.js`, règles `EX1`–`EX4` |
| Solveur de pose (§6, critères S1–S6) | `assets/placement.js`, exécuté au navigateur |
| Table des enveloppes admissibles | `assets/fit.data.js`, cache des préréglages |
| Verdict « pièce meublable » | règle `TH2D-ROOM-002`, appliquée à la génération |
| Mobilier dessiné sur le plan | fait, visible par défaut, emprises seules |
| Zones d'usage dessinées | calculées, non dessinées |
| Entrée, façades, portes (§7) | **non implémenté** — prérequis absents du moteur |
| Cheminement (§8) | **non implémenté** |
| Profils PMR (§9) | **non implémenté** |

Documents liés : [`ROADMAP.md`](ROADMAP.md) (pilotage),
[`DA_ICONES_PLAN.md`](DA_ICONES_PLAN.md) (icônes de pièces),
`technohab_rules.md` du dépôt de développement (référentiel de règles).

---

## 1. Pourquoi ce socle change la nature du moteur

Aujourd'hui une chambre vaut `minArea: 9`. Ce nombre ne dit rien : une pièce
de 1,50 × 6,00 m fait bien 9 m² et n'accueille aucun lit.

Le socle remplace une contrainte de **surface** par une contrainte de
**forme et de contenu** : la question cesse d'être « fait-elle 9 m² ? » pour
devenir « un lit, son dégagement et le débattement de la porte y
tiennent-ils ? ».

Deux conséquences.

**Les seuils de proportion ont cessé d'être arbitraires.** L'ancien rapport
minimal de 0,28 en conseil — contre 0,5 dans le référentiel d'origine — a été
retiré. La proportion acceptable se déduit désormais du contenu à loger via
`TH2D-ROOM-002` et la table d'enveloppes meublables. Elle devient une
conséquence, plus une convention.

**Le plan devient vérifiable.** Un plan n'est plus « plausible », il est
meublable ou non, parcourable ou non, accessible ou non. C'est ce qui
sépare un schéma d'intention d'un plan de principe défendable.

---

## 2. Comment lire les cotes

> **Mise à jour du 15 août 2026.** Une partie des cotes d'accessibilité est
> désormais adossée aux textes : voir [`VEILLE_NORMATIVE.md`](VEILLE_NORMATIVE.md),
> qui porte les identifiants `VAL-xxx`, les sources et les statuts de
> vérification. Les valeurs relevées sur Légifrance y sont marquées
> `vérifié`, sous réserve d'un recontrôle à l'œil sur le texte d'origine.
>
> **Ce qui reste sans source : tout le mobilier.** Aucune emprise ni zone
> d'usage du §5 n'est réglementaire — ce sont des valeurs d'usage, à adosser
> à un ouvrage de conception ou à assumer comme conventions du projet.
>
> La colonne *Projet* fait foi pour le moteur. Une valeur assumée n'est pas
> illégitime ; le défaut à éviter est de la présenter comme une obligation.
>
> Le plan reste ce que dit le pied de page de l'application : un plan de
> principe non contractuel.

Toutes les cotes sont en mètres.

---

## 3. Vocabulaire

| Terme | Définition |
|---|---|
| **Emprise** | Rectangle au sol réellement occupé par un équipement. |
| **Zone d'usage** | Rectangle libre attenant à une face, nécessaire pour se servir de l'équipement — ouvrir un four, s'asseoir, accéder à un lit. |
| **Ancrage** | Contrainte de position : contre un mur, dans un angle, ou libre. |
| **Réseau** | Besoin technique : eau, évacuation, ventilation, électricité spécialisée. Sert à regrouper les pièces humides. |
| **Rectangle libre** | Plus grand rectangle sans obstacle, une fois toutes les emprises posées. |
| **Aire de rotation** | Disque libre permettant à un fauteuil de faire demi-tour. |
| **Unité de vie** | Sous-ensemble de pièces devant être accessibles, quand le reste du logement ne l'est pas. |

Règle structurante : **deux zones d'usage peuvent se chevaucher entre elles,
jamais une emprise.** On peut partager le dégagement devant un évier et
devant un lave-vaisselle ; on ne peut pas poser une chaise dans un placard.

---

## 4. Modèle de données du socle

```js
{
  id: "bedroom",
  label: "Chambre",
  mvp: true,                       // le moteur sait produire ce type
  lifeUnit: "optional",            // rôle dans l'unité de vie PMR
  equipments: [
    {
      id: "bed_140",
      label: "Lit 140",
      required: true,
      footprint: { w: 1.40, d: 1.90 },
      anchor: "wall",              // wall | corner | free
      services: [],
      usage: [
        { side: "long", min: 0.60, required: true },
        { side: "foot", min: 0.60, required: false }
      ]
    }
  ],
  door: { minClear: 0.83, swing: "inward" },
  freeRect: { w: 0.90, d: 0.90 },  // rectangle libre résiduel exigé
  pmr: { turningCircle: 1.50, sideTransfer: { w: 0.90, d: 1.30 } }
}
```

Le socle est **une donnée, pas du code**. Il doit vivre dans un fichier
distinct, chargeable sans réseau et sans dépendance — donc en JavaScript ou
JSON embarqué, jamais en YAML : le moteur tourne en `file://` et ne peut
charger aucun analyseur externe. C'est une contrainte des principes non
négociables, pas un choix de confort.

**Dessins.** Les vingt-huit équipements sont tracés dans
[`assets/icons/furniture.svg`](assets/icons/furniture.svg), vue de dessus, à
l'échelle : le `viewBox` y est exprimé en centimètres et vaut l'emprise, si
bien que poser un équipement ne demande aucune conversion. La jointure se
fait par identifiant — `equipments[].id` du socle correspond au symbole
`furn-{id}`. Les cotes du §5 font foi et le fichier de dessin s'y aligne ;
zone d'usage, ancrage et réseaux ne sont pas dupliqués dans le SVG.
`assets/icons/preview.html` affiche la planche à échelle commune, ce qui rend
une erreur de cote immédiatement visible.

### Rotation et choix d'une pose — état au 16 août 2026

**Calcul et dessin partagent désormais la même orientation.** `placement.js`
engendre les quatre rotations cardinales et renvoie, pour chaque pose,
`rotation`, `wall` et `inward` en plus de l'emprise et des zones d'usage.
`app.js::renderFurniture()` conserve les dimensions naturelles du symbole et
le tourne autour du centre de l'emprise calculée : aucune permutation ne
déforme plus le dessin.

Le placement final est séparé en deux temps. `validate()` cherche
exhaustivement une solution respectant emprises, usages, ancrages et
relations dures. `optimize()` explore ensuite plusieurs solutions dans un
ordre pseudo-aléatoire issu de la graine du plan, note les relations de
préférence et retient la meilleure. Deux graines peuvent donc produire deux
agencements différents, mais une même graine reste rejouable et aucune règle
dure n'est relâchée.

**Une remarque sur la source de vérité.** Les pictogrammes de pièces portent
un attribut `data-orient` qui dit leur proportion naturelle ; les symboles de
mobilier ont `data-rotatable` mais **pas** `data-orient`. C'est cohérent, et
il vaut mieux ne pas l'ajouter : l'orientation naturelle d'un équipement est
déjà donnée par `footprint: { w, d }` dans `socle.data.js`, qui fait foi sur
les cotes. La dupliquer dans le SVG créerait une seconde source susceptible
de diverger — le fichier de dessin s'aligne sur le socle, jamais l'inverse.

---

## 5. Arborescence des pièces

`MVP` marque les six types que le moteur sait produire aujourd'hui. Les
autres sont spécifiés pour ne pas avoir à reprendre ce document à chaque
extension du catalogue.

### 5.1 Séjour — `living` · MVP

| Équipement | Requis | Emprise | Zone d'usage | Ancrage |
|---|---|---|---|---|
| Canapé | oui | 1,80 × 0,90 | 0,90 en façade | mur |
| Table basse | non | 1,10 × 0,60 | 0,45 pourtour | libre |
| Meuble bas / TV | non | 1,20 × 0,40 | 0,60 en façade | mur |

Rectangle libre résiduel : 1,20 × 1,20. Réseaux : électricité courante.

### 5.2 Salle à manger — `dining`

| Équipement | Requis | Emprise | Zone d'usage | Ancrage |
|---|---|---|---|---|
| Table 4 places | oui | 1,40 × 0,80 | 0,80 sur chaque côté servi | libre |
| Assises | oui | comprises dans la zone d'usage | — | libre |

La zone d'usage porte ici le recul de chaise : c'est elle qui dimensionne la
pièce, pas la table. Fusionnable avec le séjour.

### 5.3 Chambre — `bedroom` · MVP

Deux gabarits selon l'usage.

| Équipement | Requis | Emprise | Zone d'usage | Ancrage |
|---|---|---|---|---|
| Lit simple 90 | variante enfant | 0,90 × 1,90 | 0,60 sur un long côté | mur |
| Lit double 140 | variante parentale | 1,40 × 1,90 | 0,60 sur chaque long côté | mur |
| Penderie / rangement | oui | longueur × 0,60 | 0,60 en façade | mur |

Le rangement est déjà produit par le moteur sous forme de bande cédée par la
circulation — voir ROADMAP §5 ter. Le socle lui donne enfin une raison
d'être fonctionnelle plutôt que géométrique.

Interdit : que le débattement de porte recouvre l'emprise du lit.

### 5.4 Cuisine — `kitchen` · MVP

| Équipement | Requis | Emprise | Zone d'usage | Ancrage | Réseaux |
|---|---|---|---|---|---|
| Évier | oui | 0,60 × 0,60 | 0,90 en façade | mur | eau, évacuation |
| Plaque de cuisson | oui | 0,60 × 0,60 | 0,90 en façade | mur | électricité dédiée |
| Réfrigérateur | oui | 0,60 × 0,65 | 0,90 en façade | mur | — |
| Plan de travail | oui | 0,60 min entre évier et plaque | — | mur | — |
| Lave-vaisselle | non | 0,60 × 0,60 | 0,90 en façade | mur | eau, évacuation |

Deux critères propres à la cuisine :

- **le plan de travail entre évier et plaque n'est pas négociable** : c'est
  la seule surface où l'on prépare, et l'omettre produit des cuisines
  géométriquement valides et inutilisables ;
- **passage libre entre deux linéaires opposés** : 1,20 si l'on veut pouvoir
  ouvrir un four accroupi devant un autre meuble.

### 5.5 Salle d'eau / salle de bain — `bath` · MVP

| Équipement | Requis | Emprise | Zone d'usage | Ancrage | Réseaux |
|---|---|---|---|---|---|
| Douche | variante salle d'eau | 0,90 × 0,90 | 0,80 en façade | angle | eau, évacuation |
| Baignoire | variante salle de bain | 1,70 × 0,70 | 0,80 sur le long côté | mur | eau, évacuation |
| Lavabo | oui | 0,60 × 0,50 | 0,80 en façade | mur | eau, évacuation |
| Sèche-serviettes | non | 0,60 × 0,15 | — | mur | électricité |

Ventilation obligatoire. Interdit : que la zone d'usage du lavabo recouvre
l'emprise de la douche ou de la baignoire.

### 5.6 WC — `wc` · MVP

| Équipement | Requis | Emprise | Zone d'usage | Ancrage | Réseaux |
|---|---|---|---|---|---|
| Cuvette | oui | 0,40 × 0,70 | 0,60 × 0,80 en façade | mur | eau, évacuation |
| Lave-mains | non | 0,40 × 0,30 | 0,50 en façade | mur | eau, évacuation |

Gabarit minimal courant : 0,90 de large sur 1,30 de long. En deçà, la porte
ne peut plus s'ouvrir vers l'intérieur — le socle doit alors imposer une
ouverture vers l'extérieur ou coulissante.

### 5.7 Circulation — `circulation` · MVP

Pas d'équipement. Contraintes déjà tenues par le moteur : largeur libre
comprise entre 1,20 et 1,80, desserte d'au moins deux espaces.

Ajout du socle : **le débattement d'aucune porte ne doit réduire la largeur
libre sous le seuil**, et deux portes en vis-à-vis ne doivent pas battre
l'une sur l'autre.

### 5.8 Entrée — `entree`

| Équipement | Requis | Emprise | Zone d'usage | Ancrage |
|---|---|---|---|---|
| Placard | non | longueur × 0,60 | 0,60 en façade | mur |

Rôle principal : recevoir la porte d'entrée et son débattement. Voir §7.

### 5.9 Bureau — `bureau`

| Équipement | Requis | Emprise | Zone d'usage | Ancrage |
|---|---|---|---|---|
| Plan de travail | oui | 1,20 × 0,60 | 0,90 en façade | mur |
| Bibliothèque | non | longueur × 0,35 | 0,60 en façade | mur |

### 5.10 Buanderie — `buanderie`

| Équipement | Requis | Emprise | Zone d'usage | Ancrage | Réseaux |
|---|---|---|---|---|---|
| Lave-linge | oui | 0,60 × 0,60 | 0,90 en façade | mur | eau, évacuation |
| Sèche-linge | non | 0,60 × 0,60 | 0,90 en façade | mur | électricité, évacuation |

### 5.11 Cellier — `cellier`

| Équipement | Requis | Emprise | Zone d'usage | Ancrage |
|---|---|---|---|---|
| Étagères | oui | longueur × 0,45 | 0,60 de passage | mur |

### 5.12 Local technique — `local_technique`

| Équipement | Requis | Emprise | Zone d'usage | Ancrage | Réseaux |
|---|---|---|---|---|---|
| Production d'eau chaude | oui | 0,70 × 0,70 | 0,70 en façade, entretien | mur ou sol | eau, électricité |
| Tableau électrique | oui | 0,60 × 0,15 | 0,70 en façade | mur | électricité |

La zone d'usage est ici une **zone d'entretien** : elle existe pour le
technicien, pas pour l'habitant. Elle ne peut être partagée avec rien.

### 5.13 Garage — `garage`

| Équipement | Requis | Emprise | Zone d'usage | Ancrage |
|---|---|---|---|---|
| Emplacement véhicule | oui | 2,50 × 5,00 | 0,60 sur un long côté | libre |

---

## 6. Critères de placement impérieux

Les six règles du socle. Elles s'appliquent à **toute** pièce, quel que
soit son type, et conditionnent la validité d'un plan.

| Code | Règle | Niveau |
|---|---|---|
| `S1` | Tous les équipements requis sont posés sans chevauchement d'emprises. | bloquant |
| `S2` | Aucune zone d'usage ne recouvre une emprise. Deux zones d'usage peuvent se recouvrir entre elles. | bloquant |
| `S3` | Le débattement de porte ne recouvre aucune emprise ni aucune zone d'usage requise. | bloquant |
| `S4` | Un chemin continu relie la porte de la pièce à chaque zone d'usage requise. | bloquant |
| `S5` | Tout équipement d'ancrage `wall` touche un mur ; tout équipement `corner` touche deux murs perpendiculaires. | bloquant |
| `S6` | Le rectangle libre résiduel du type est respecté. | conseil |

`S4` est la porte d'entrée du calcul de parcours : c'est déjà du
cheminement, à l'échelle de la pièce.

---

## 7. Entrée principale et repli

L'extérieur n'existe pas aujourd'hui dans le moteur. Cette section est donc
**conditionnée à trois prérequis**, à traiter avant elle :

1. des segments de façade portés par l'enveloppe ;
2. des portes comme objets, avec largeur libre et sens de battement ;
3. un nœud `exterior` dans le graphe d'adjacences.

### La chaîne de repli

Le principe : la circulation reçoit l'entrée quand elle le peut, sinon une
autre pièce éligible la prend.

Ordre de préférence :

1. `entree` — pièce dédiée, cas nominal ;
2. `circulation` — acceptable et fréquent ;
3. `living` — courant dans les petits logements ;
4. `dining`, `cellier`, `buanderie` — acceptables ;
5. `kitchen` — **déconseillé**, accepté mais signalé ;
6. `garage` — refusé comme entrée principale, admis comme accès secondaire.

**Interdits absolus** : `bedroom`, `bath`, `wc`, `bureau`, `garage`. Une
chambre ou une pièce d'eau ne peut pas être le seuil du logement, quelle que
soit la géométrie.

### Règles

| Code | Règle | Niveau |
|---|---|---|
| `TH2D-ENTREE-001` | Il existe au moins une porte donnant sur l'extérieur, de largeur libre suffisante. | bloquant |
| `TH2D-ENTREE-002` | La pièce recevant l'entrée principale n'appartient pas à la liste des interdits. | bloquant |
| `TH2D-ENTREE-003` | Si la circulation n'atteint pas l'extérieur directement, l'entrée est reportée sur la pièce éligible la mieux classée. | bloquant |
| `TH2D-ENTREE-004` | L'entrée par la cuisine est signalée comme déconseillée. | conseil |
| `TH2D-ENTREE-005` | Depuis l'entrée, aucune pièce privée n'est visible en enfilade directe. | conseil |

---

## 8. Cheminement

Le calcul de parcours doit être **interne au moteur**. Les principes non
négociables interdisent toute dépendance réseau et imposent le
fonctionnement en `file://` : aucun service externe n'est envisageable.

Approche retenue : maillage régulier de la surface libre — emprises et
débattements retirés — puis recherche de plus court chemin. Un pas de 0,10 m
suffit à l'échelle d'un logement et reste calculable dans le budget de
génération actuel.

| Code | Règle | Niveau |
|---|---|---|
| `TH2D-PATH-001` | Chaque pièce est atteignable depuis la porte d'entrée par un chemin continu à la largeur de passage courante. | bloquant |
| `TH2D-PATH-002` | Aucun chemin de desserte ne traverse une salle d'eau ni un WC. | bloquant |
| `TH2D-PATH-003` | Aucun chemin de desserte ne traverse une chambre pour atteindre une autre pièce. | bloquant |
| `TH2D-PATH-004` | Les détours inutiles sont pénalisés au classement. | préférence |

`TH2D-PATH-002` et `003` reprennent des règles déjà présentes dans le
référentiel d'origine, aujourd'hui non évaluées faute de moyen de les
calculer. Le cheminement les rend enfin vérifiables.

---

## 9. Profil PMR — unité de vie

Le logement n'est pas intégralement adapté : **un noyau l'est**. C'est
l'unité de vie.

Composition : la cuisine, le séjour, une chambre, la salle d'eau et les
sanitaires — `VAL-PMR-020`, adossé à la loi ELAN et à son décret
d'application. S'y ajoutent les circulations qui les relient à l'entrée.

Cette composition avait été posée par intuition dans une première version
de ce document ; la veille l'a confirmée telle quelle.

### Cotes

| Grandeur | Projet | Réf | Statut |
|---|---|---|---|
| Aire de rotation, demi-tour | Ø 1,50 | `VAL-PMR-001` | vérifié |
| Espace d'usage devant un équipement | 0,80 × 1,30 | `VAL-PMR-002` | vérifié |
| Espace de manœuvre de porte, en poussant | 1,70 | `VAL-PMR-003` | vérifié |
| Espace de manœuvre de porte, en tirant | 2,20 | `VAL-PMR-004` | vérifié |
| Porte d'entrée, largeur nominale | 0,90 | `VAL-PMR-005` | vérifié |
| Porte d'entrée, passage utile | 0,83 | `VAL-PMR-006` | vérifié |
| Porte intérieure, largeur nominale | 0,80 | `VAL-PMR-007` | vérifié |
| Porte intérieure, passage utile | 0,77 | `VAL-PMR-008` | vérifié |
| Circulation intérieure, minimum réglementaire | 0,90 | `VAL-PMR-009` | vérifié |
| Circulation, valeur retenue par le projet | 1,20 | `REF-007` | convention, plus exigeante |
| Ressaut admissible | 0,02 | `VAL-PMR-010` | vérifié |
| Transfert latéral au WC | 0,80 × 1,30 | `VAL-PMR-012` | à confirmer |

**Trois corrections apportées par la veille.** Le passage utile de 0,83
retenu ici pour toutes les portes était une erreur : il ne vaut que pour la
porte d'entrée, les portes intérieures étant à 0,77. Le socle était donc
plus sévère que le texte et aurait rejeté des plans conformes. Les espaces
de manœuvre de porte, 1,70 et 2,20, manquaient entièrement — ce sont des
contraintes bien plus lourdes que le simple débattement prévu en `S3`, et
leur portée exacte reste à préciser. Enfin le seuil de couloir à 1,20 est
un parti pris de confort, plus exigeant que les 0,90 réglementaires : à
présenter comme tel, jamais comme une obligation.

### Deux profils, et non un seul

La loi ELAN distingue le logement **accessible** et le logement
**évolutif**, ce dernier étant le régime de la majorité des logements neufs.
Un moteur qui n'implémenterait que le profil accessible se tromperait de
cible sur la plupart des programmes.

| Profil | Exigence |
|---|---|
| **Accessible** | L'unité de vie entière est adaptée, aux cotes ci-dessus. |
| **Évolutif** | Accès au logement, cheminement accessible jusqu'au séjour et au cabinet d'aisances, sortie ; le reste de l'unité de vie doit pouvoir être adapté ultérieurement par des travaux simples. |

Le profil évolutif suppose de savoir qualifier ce que sont des « travaux
simples » — déplacement de cloison non porteuse, principalement. Le moteur
ne modélise ni murs ni porteurs : cette qualification est hors de portée
aujourd'hui et doit être posée comme telle.

### Règles

| Code | Règle | Niveau |
|---|---|---|
| `TH2D-PMR-001` | Chaque pièce de l'unité de vie contient une aire de rotation libre. | bloquant si option active |
| `TH2D-PMR-002` | Chaque porte de l'unité de vie offre la largeur de passage utile. | bloquant si option active |
| `TH2D-PMR-003` | Chaque équipement requis de l'unité de vie dispose de son espace d'usage. | bloquant si option active |
| `TH2D-PMR-004` | Un cheminement accessible relie l'entrée à chaque pièce de l'unité de vie. | bloquant si option active |
| `TH2D-PMR-005` | Le WC de l'unité de vie dispose d'un espace de transfert latéral. | bloquant si option active |

L'option se déclare au questionnaire et ne modifie jamais le référentiel
courant : elle **ajoute** un profil, elle ne remplace rien.

---

## 10. Grille de support — comment intégrer ce socle

Trois stratégies d'intégration, à étudier avant de coder. La grille sert à
trancher sur des critères comparables plutôt que sur une intuition.

| Critère | A. Validation après coup | B. Intégration au score | C. Contrainte de découpe |
|---|---|---|---|
| Principe | On génère, puis on vérifie et on rejette. | Le placement note le candidat sans le contraindre. | La découpe consulte le socle et ne produit que du plaçable. |
| Effort | faible | moyen | élevé, refonte du moteur |
| Effet sur la conformité | total, mais peut ne rien produire | partiel, jamais garanti | total et garanti |
| Coût de calcul | élevé — placement sur chaque candidat retenu | très élevé — placement sur chaque candidat exploré | modéré — l'échec est évité, pas mesuré |
| Réversibilité | forte | forte | faible |
| Risque principal | aucun plan affichable sur les grands programmes | reproduit le défaut connu du §3.1 : une règle bloquante que rien ne garantit | s'engager avant d'avoir mesuré |
| Diagnostic produit | dit précisément pourquoi un plan échoue | ne dit rien de net | ne produit pas de contre-exemple |

**Recommandation : commencer par A, sur le seul candidat retenu.**

Trois raisons. Le coût reste borné puisqu'on ne place le mobilier qu'une
fois par génération. La stratégie produit immédiatement des contre-exemples
exploitables — quelle pièce échoue, sur quel équipement — donc de la donnée
pour décider de la suite. Et elle est réversible, là où C engage le moteur
entier.

La bascule vers C ne devrait être décidée qu'au vu des taux d'échec mesurés
sous A, comme l'a été chaque décision de ce projet depuis l'audit.

**Piège à éviter, déjà rencontré.** B reproduit exactement le défaut du
§3.1 : une règle déclarée bloquante que le moteur ne fait que favoriser.
N'ajouter aucune règle bloquante sans savoir si le moteur peut la tenir.

### Séquence proposée

1. Écrire le socle en donnée, sans l'utiliser — le fichier seul, testable.
2. Implémenter le placement pour les six types MVP, hors PMR.
3. Mesurer le taux d'échec par type de pièce et par configuration.
4. Introduire façades, portes et nœud extérieur.
5. Implémenter le cheminement, puis les règles d'entrée.
6. Ajouter le profil PMR en surcouche.
7. Décider, chiffres en main, entre rester en A ou basculer vers C.

---

## 11. Prompt — icônes de mobilier

> **Réserve importante, tirée de l'expérience.** Le mobilier de plan est
> dessiné **à l'échelle** : un lit 140 doit mesurer 1,40 m sur le plan. Une
> image générée ne donne pas de cotes exactes. La planche produite par ce
> prompt sert donc de **référence de style**, et chaque symbole doit ensuite
> être retracé en géométrie directe aux dimensions du §5 — exactement la
> conclusion tirée pour les icônes de pièces, où le tracé automatique a été
> abandonné au profit d'un dessin direct.

Symboles à produire, groupés par pièce :

- **Séjour** : canapé, table basse, meuble bas
- **Salle à manger** : table quatre places avec assises
- **Chambre** : lit simple, lit double, penderie
- **Cuisine** : évier, plaque de cuisson, four, réfrigérateur, lave-vaisselle, plan de travail
- **Salle d'eau** : douche, baignoire, lavabo, double lavabo
- **WC** : cuvette, lave-mains
- **Entrée** : placard
- **Bureau** : plan de travail avec assise, bibliothèque
- **Buanderie** : lave-linge, sèche-linge
- **Cellier** : étagères
- **Local technique** : ballon d'eau chaude, tableau électrique
- **Garage** : emplacement véhicule
- **Accessibilité** : aire de rotation, espace d'usage

Vingt-huit symboles.

```
ART DIRECTION — non-negotiable, applies to the whole image:

Palette, strictly limited to four values:
- background: near-black #0B0B0B, flat, edge to edge, never a gradient
- primary line: warm gold #D4AF37, hairline weight, uniform
- secondary fill: marble cream #ECE9E2, used sparingly, small surfaces only
- accent: soft blue #6FA8DC, reserved for a single focal element or nothing

Drawing grammar:
- pure line art, engraved feel — dry, precise, lapidary, like a technical
  survey or an intaglio plate
- hairline strokes of consistent weight; no variable-width brush strokes
- no frames, no boxes, no cards, no containers around any element
- no drop shadows, no glow, no bevel, no ambient occlusion
- no texture, no grain, no paper fibre, no photorealism
- generous negative space; the black must dominate the composition

Mood: sober, restrained, confident. Nothing decorative that does not carry
meaning. Clarity over spectacle.

FURNITURE PLAN SYMBOLS — this is an architectural legend sheet, not a
decorative icon set:
- strict orthographic top-down view, as drawn on a floor plan; never a
  perspective, never a 3/4 view, never a rendered object
- each symbol is an outline of the object's real footprint, with only the
  interior lines an architect would draw: the pillow line on a bed, the
  bowl on a sink, the burner circles on a hob, the door swing arc on an
  appliance
- proportions must read as true plan proportions: a double bed is clearly
  wider than long-ish, a bathtub is a long narrow rounded rectangle, a
  toilet is a small oval on a rectangular base
- clearance zones, where shown, are drawn as a dashed outline in blue,
  never filled
- identical stroke weight across the whole sheet — one legend, one hand
- each symbol sits in its own cell of an evenly spaced grid, no cell
  touching another, no grid lines drawn
- label each cell in small caps gold text below the symbol, in French
- render at least 2400 px wide

Symbols to draw, one per cell, in this order:
canape, table basse, meuble bas, table quatre places, lit simple, lit
double, penderie, evier, plaque de cuisson, four, refrigerateur, lave
vaisselle, plan de travail, douche, baignoire, lavabo, double lavabo,
cuvette wc, lave mains, placard, bureau avec assise, bibliotheque, lave
linge, seche linge, etageres, ballon d'eau chaude, tableau electrique,
emplacement vehicule
```

---

## 12. Ce que ce document ne tranche pas

- **Les cotes de mobilier n'ont aucune source.** Toutes les emprises et
  zones d'usage du §5 sont en statut `non sourcé` : voir
  [`VEILLE_NORMATIVE.md`](VEILLE_NORMATIVE.md) §6. Les cotes
  d'accessibilité, elles, sont désormais adossées aux textes.
- **La qualification des « travaux simples »** du profil évolutif suppose
  de distinguer cloisons porteuses et non porteuses, ce que le moteur ne
  modélise pas.
- **Le placement lui-même n'est pas spécifié.** Le socle dit ce qui doit
  tenir et à quelles conditions, pas dans quel ordre poser les meubles ni
  comment chercher une solution valide. C'est le premier travail de
  conception à mener lorsque l'étape 2 de la séquence démarrera.
- **Le coût de calcul est inconnu.** Le placement de mobilier est un
  problème combinatoire ; rien ne garantit encore qu'il tienne dans le
  budget d'une génération. À mesurer avant tout engagement, sur les six
  types MVP.
