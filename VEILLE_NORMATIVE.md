# Veille normative et traçabilité des cotes

Adosse le modèle de calcul de TechnoHab à des sources identifiées. Chaque
valeur employée par le moteur porte un identifiant, un statut et une source,
de façon à pouvoir être rattachée plus tard à une matrice de contrôle sans
avoir à refaire la recherche.

**Consulté le 15 août 2026.** Toute valeur réglementaire se périme : la date
de consultation fait partie de la donnée.

Documents liés : [`SOCLE_AGENCEMENT.md`](SOCLE_AGENCEMENT.md) (usage des
cotes), [`ROADMAP.md`](ROADMAP.md) (pilotage).

---

## 1. Méthode

### Ce qui compte comme source

Trois niveaux, jamais mélangés dans un même calcul sans le dire.

| Niveau | Nature | Exemple | Opposable |
|---|---|---|---|
| **N1 — Réglementaire** | Texte publié, consulté sur Légifrance | Arrêté du 24 décembre 2015 | oui |
| **N2 — Normatif ou professionnel** | Norme, DTU, référence de conception | Neufert, DTU | non, mais reconnu |
| **N3 — Convention projet** | Valeur assumée par TechnoHab | seuil de couloir à 1,20 m | non |

Une valeur N3 n'est pas moins légitime, elle est simplement **nôtre**. Le
défaut à éviter n'est pas d'employer une convention, c'est de la présenter
comme une obligation.

### Statuts de vérification

| Statut | Sens |
|---|---|
| `vérifié` | Valeur relevée sur le texte officiel, référence et article identifiés |
| `à confirmer` | Valeur trouvée mais non recoupée sur le texte source |
| `norme identifiée` | Le bon référentiel est nommé, la valeur n'y a pas été relevée |
| `non sourcé` | Valeur employée sans source à ce jour |
| `convention` | Valeur choisie par le projet, sans prétention normative |

`norme identifiée` a été ajouté le 16 août : les cotes de cuisine et de
literie relèvent de NF EN 1116 et NF EN 1334, normes payantes qu'on a su
nommer sans pouvoir les lire. Le statut existe pour que cette situation ne
soit confondue ni avec `vérifié`, ni avec `non sourcé` — voir
`DATASOURCE_EQUIPEMENTS.md` §1.

### Réserve sur la présente collecte

Les relevés Légifrance de ce document ont été **extraits automatiquement**
des pages consultées. La probabilité d'erreur de transcription est faible
mais non nulle. Avant toute communication engageante sur la conformité,
chaque valeur `vérifié` doit être recontrôlée à l'œil sur le texte
d'origine. Ce document dit **où regarder**, il ne remplace pas la lecture.

### Modèle de traçabilité

Chaque valeur porte un identifiant stable `VAL-xxx`, chaque source un
identifiant `REF-xxx`. Le moteur devra référencer `VAL-xxx` là où il emploie
la valeur, de sorte qu'une matrice de contrôle puisse relier, sans
intervention humaine : **une règle → une valeur → une source → une date**.

```js
{
  id: "VAL-PMR-001",
  label: "Espace de manœuvre avec possibilité de demi-tour",
  value: 1.50, unit: "m", kind: "diameter",
  status: "verified",
  source: "REF-001", article: "Annexe 2",
  consultedOn: "2026-08-15",
  usedBy: ["TH2D-PMR-001"]
}
```

C'est le seul formalisme que ce document impose. Il suffit à rendre la
chaîne auditable ; tout le reste est du texte.

---

## 2. Sources

| Réf | Texte | Portée | Consulté |
|---|---|---|---|
| `REF-001` | Arrêté du 24 décembre 2015, accessibilité des bâtiments d'habitation collectifs et maisons individuelles lors de leur construction | N1 | 2026-08-15 |
| `REF-002` | Décret n° 2002-120 du 30 janvier 2002, caractéristiques du logement décent | N1 | 2026-08-15 |
| `REF-003` | Loi n° 2018-1021 du 23 novembre 2018 (ELAN), article 64 — logement évolutif | N1 | 2026-08-15 |
| `REF-004` | Décret du 11 avril 2019 — proportion de logements accessibles | N1 | 2026-08-15, via source secondaire |
| `REF-005` | Code de la construction et de l'habitation, art. R. 156-1 — surface et volume habitables | N1 | non consulté |
| `REF-006` | Neufert, *Les éléments des projets de construction* — dimensions du mobilier et dégagements | N2 | non consulté |
| `REF-007` | Convention TechnoHab | N3 | — |

Liens en fin de document.

---

## 3. Cotes d'accessibilité — `REF-001`

Relevées sur le texte, articles et annexe indiqués.

| Val | Grandeur | Valeur | Article | Statut |
|---|---|---|---|---|
| `VAL-PMR-001` | Espace de manœuvre avec possibilité de demi-tour | Ø 1,50 m | Annexe 2 | vérifié |
| `VAL-PMR-002` | Espace d'usage devant un équipement | 0,80 × 1,30 m | Annexe 2 | vérifié |
| `VAL-PMR-003` | Espace de manœuvre de porte, en poussant | 1,70 m | Annexe 2 | vérifié |
| `VAL-PMR-004` | Espace de manœuvre de porte, en tirant | 2,20 m | Annexe 2 | vérifié |
| `VAL-PMR-005` | Porte d'entrée du logement, largeur nominale | 0,90 m | art. 11 | vérifié |
| `VAL-PMR-006` | Porte d'entrée, largeur de passage utile | 0,83 m | art. 11 | vérifié |
| `VAL-PMR-007` | Portes intérieures, largeur nominale | 0,80 m | art. 11 | vérifié |
| `VAL-PMR-008` | Portes intérieures, largeur de passage utile | 0,77 m | art. 11 | vérifié |
| `VAL-PMR-009` | Largeur minimale des circulations intérieures | 0,90 m | art. 11 | vérifié |
| `VAL-PMR-010` | Hauteur maximale de seuil | 0,02 m | art. 11 | vérifié |
| `VAL-PMR-011` | Hauteur des dispositifs de commande | 0,90 à 1,30 m | art. 11 | vérifié |
| `VAL-PMR-012` | Espace libre latéral à la cuvette de WC, hors débattement de porte | 0,80 × 1,30 m | annexe | à confirmer |
| `VAL-PMR-013` | Accès balcon, terrasse, loggia — largeur | 0,80 m | art. 14 | vérifié |

### Composition de l'unité de vie

`VAL-PMR-020`, statut **vérifié** via `REF-003` et `REF-004` : la cuisine,
le séjour, une chambre, la salle d'eau et les sanitaires.

C'est exactement la composition posée par intuition dans le socle. Elle est
désormais adossée à une source.

### Répartition accessible / évolutif

`VAL-PMR-021`, statut **à confirmer**, source secondaire `REF-004` : 20 %
des logements accessibles, et au moins un, calculés sur les logements situés
en rez-de-chaussée ou desservis par ascenseur ; les autres sont évolutifs.

`VAL-PMR-022`, `REF-003` : est évolutif le logement où une personne en
situation de handicap peut accéder, se rendre par un cheminement accessible
**dans le séjour et le cabinet d'aisances**, et en ressortir ; la mise en
accessibilité des autres pièces de l'unité de vie devant être réalisable
ultérieurement par des travaux simples.

Cette distinction n'existe pas dans le socle et devra y entrer : elle
définit **deux profils PMR**, pas un seul.

---

## 4. Cotes de décence — `REF-002`

| Val | Grandeur | Valeur | Article | Statut |
|---|---|---|---|---|
| `VAL-DEC-001` | Pièce principale, surface habitable minimale | 9 m² | art. 4 | vérifié |
| `VAL-DEC-002` | Pièce principale, hauteur sous plafond minimale | 2,20 m | art. 4 | vérifié |
| `VAL-DEC-003` | Pièce principale, volume habitable minimal, en alternative | 20 m³ | art. 4 | vérifié |

Le texte pose une **alternative** : soit 9 m² avec 2,20 m sous plafond, soit
20 m³ de volume habitable. Le moteur ne connaît que des surfaces ; il
applique donc la première branche et ignore la seconde. À signaler comme
limite plutôt qu'à masquer.

La définition de la surface habitable renvoie au CCH `REF-005`, non
consulté : la question des surfaces déduites — sous-pente, embrasures — reste
ouverte et n'a aucune incidence tant que le moteur travaille en 2D sans
hauteurs.

---

## 5. Corrections à apporter au socle

La recherche invalide trois points de `SOCLE_AGENCEMENT.md`. Ils doivent y
être repris.

**La largeur de porte intérieure était fausse.** Le socle retenait 0,83 m de
passage utile pour les portes de pièces. C'est la valeur de la **porte
d'entrée** (`VAL-PMR-006`). Les portes intérieures sont à 0,77 m
(`VAL-PMR-008`). Le socle était donc plus sévère que le texte, ce qui aurait
rejeté des plans conformes.

**Les espaces de manœuvre de porte manquaient entièrement.** 1,70 m en
poussant, 2,20 m en tirant (`VAL-PMR-003`, `VAL-PMR-004`). Ce sont des
contraintes lourdes, très supérieures au simple débattement que le socle
prévoyait en `S3`. Leur portée exacte — cheminement extérieur, parties
communes, intérieur du logement — doit être précisée avant application.

**Le profil PMR est double, pas simple.** Le socle ne prévoit que le logement
accessible. Le logement **évolutif** est un second profil, nettement moins
exigeant, et c'est le régime de la majorité des logements neufs depuis la loi
ELAN. Un moteur qui n'implémenterait que le profil accessible se tromperait
de cible sur la plupart des programmes.

---

## 6. Ce qui reste sans source

Point le plus important de ce document.

**Aucune dimension de mobilier n'est réglementaire.** Ni le lit 140 × 190, ni
le plan de travail à 0,60, ni le dégagement de 0,60 au long d'un lit. Ces
valeurs relèvent de l'usage, des catalogues de fabricants et des ouvrages de
conception. Elles sont aujourd'hui en statut `non sourcé` dans le socle.

| Famille | Statut | Adossement visé |
|---|---|---|
| Emprises de mobilier | non sourcé | `REF-006` Neufert, catalogues fabricants |
| Zones d'usage hors PMR | non sourcé | `REF-006` |
| Dégagement de cuisine entre linéaires | non sourcé | `REF-006`, DTU à identifier |
| Réseaux et emplacements techniques | non sourcé | NF C 15-100, DTU plomberie, à identifier |
| Largeur de couloir 1,20 m | convention | `REF-007`, plus exigeant que `VAL-PMR-009` |
| Rangement : 0,45 m mini, 0,6 × longueur maxi | convention | `REF-007` |
| Rapport de forme minimal des pièces | convention retirée | remplacé par `TH2D-ROOM-002` et la table d'enveloppes meublables du socle |

Deux remarques.

Le seuil de couloir à 1,20 m retenu par le moteur est **plus exigeant** que
les 0,90 m réglementaires. C'est un choix défendable, mais il doit être
présenté comme tel — un parti pris de confort, pas une obligation.

Le rapport de forme minimal a été **retiré** : le placement du mobilier
fonctionne, et la proportion acceptable se déduit désormais du contenu à
loger via `TH2D-ROOM-002`. La règle est exacte sur les pièces rectangulaires
et conservatrice sur leur `usableRect` lorsqu'elles sont en L. Une convention
remplacée par un calcul, c'est le mouvement que vise tout ce travail.

---

## 7. Raccordement à la matrice de contrôle

Ce document ne construit pas la matrice, il la rend possible. Trois
conditions à tenir dès maintenant, pour ne pas avoir à tout reprendre.

1. **Toute valeur employée par le moteur porte un `VAL-xxx`.** Une constante
   nue dans le code est une valeur non auditable.
2. **Toute règle déclare les valeurs qu'elle consomme.** C'est ce qui permet
   de répondre à « sur quoi repose ce refus ? » sans lire le code.
3. **Le statut voyage avec la valeur.** Une règle qui s'appuie sur une
   convention ne peut pas produire le même discours qu'une règle adossée à un
   texte. L'interface doit pouvoir le dire.

La matrice se réduit alors à une jointure : `règle × valeur × source ×
statut × date`. Elle répond à trois questions, qui sont exactement celles
d'un audit.

- Sur quoi repose ce refus ?
- Quelles règles s'appuient sur une valeur non vérifiée ?
- Qu'est-ce qui se périme si ce texte change ?

La dernière est la vraie raison de faire ce travail maintenant : le jour où
un arrêté est modifié, la question n'est pas *que dit le nouveau texte*, mais
*qu'est-ce que cela casse chez nous*. Sans traçabilité, la réponse demande
une relecture complète du moteur.

---

## 8. Prochaine étape

1. Reprendre les trois corrections du §5 dans `SOCLE_AGENCEMENT.md`.
2. Ajouter le profil **logement évolutif** au socle, distinct du profil
   accessible.
3. Faire recontrôler à l'œil les valeurs `vérifié` sur les textes d'origine.
4. Adosser les dimensions de mobilier à `REF-006` ou décider de les assumer
   comme conventions.
5. Écrire le socle en donnée, chaque cote portant son `VAL-xxx`.

Rien de tout cela ne demande de coder. C'est la condition pour que le code
qui suivra soit défendable.

---

## Sources

- [Arrêté du 24 décembre 2015 relatif à l'accessibilité aux personnes handicapées des bâtiments d'habitation collectifs et des maisons individuelles lors de leur construction](https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000031692481) — `REF-001`
- [Arrêté du 24 décembre 2015, article 11](https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000031830907) — largeurs de portes, circulations, seuils
- [Arrêté du 24 décembre 2015, article 14](https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000039239991) — balcons, terrasses, loggias
- [Arrêté du 24 décembre 2015, annexe 2](https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000042338836) — espaces de manœuvre et d'usage
- [Décret n° 2002-120 du 30 janvier 2002, article 4](https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000043842463) — `REF-002`
- [Loi n° 2018-1021 du 23 novembre 2018 (ELAN), article 64](https://www.legifrance.gouv.fr/jorf/article_jo/JORFARTI000037639567) — `REF-003`
- [Cerema — Le logement évolutif : une réponse pour l'accessibilité universelle des logements ?](https://www.cerema.fr/fr/actualites/logement-evolutif-reponse-accessibilite-universelle) — lecture d'appui
- [Socotec — Loi ELAN : logements accessibles, évolutifs et TMA](https://www.socotec.fr/media/news/loi-elan-logements-accessibles-evolutifs-et-tma) — source secondaire pour `REF-004`
