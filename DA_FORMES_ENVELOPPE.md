# Formes d'enveloppe — DA des vignettes de choix

Objectif : donner au champ « forme de la maison » du questionnaire six
options représentées chacune par un **logo d'emprise au sol** accompagné de
son libellé, plutôt que par une liste de mots. Direction artistique :
[`../DA_GRAPHIQUE.md`](../DA_GRAPHIQUE.md).

Ces vignettes ne sont pas des éléments du plan : elles vivent dans le
formulaire, à taille fixe, à côté d'un libellé. Contrairement au vocabulaire
de cheminement ([`DA_CHEMINEMENT_PLAN.md`](DA_CHEMINEMENT_PLAN.md) §1.1),
rien ici n'est à l'échelle ni paramétrique — ce sont bien des glyphes fixes,
légitimement générables en planche.

---

## 1. Les six formes

Trois familles, et cette classification commande le dessin autant que le
moteur : une forme **primitive** est un socle seul, une forme **soustractive**
retire un quartier à son rectangle englobant, une forme **additive** ajoute
des volumes qui en débordent.

| `shape` (id) | Libellé | Famille | Définition géométrique |
|---|---|---|---|
| `square` | Carrée | primitive | Côtés égaux, déduits de la surface |
| `rectangle` | Rectangulaire | primitive | Quatre angles droits, plusieurs rapports explorés |
| `lShape` | L | soustractive | Un quartier retiré à un angle du rectangle englobant |
| `uShape` | U | soustractive | Un quartier retiré au milieu d'un côté, deux ailes symétriques |
| `freeOrthogonal` | Souple | additive | Un socle rectangulaire majoritaire, plus une ou deux portions en saillie qui débordent de son emprise |
| `random` | Aléatoire | tirage | Une composition orthogonale tirée au sort parmi les familles ci-dessus, sous contrainte des règles `BOUNDARY` |

**Souple, précisément.** C'est la seule forme dont l'emprise n'est pas
contenue dans le rectangle englobant du socle : le socle porte au moins 60 %
de la surface, et une ou deux portions plus petites viennent s'y accoler en
débordant. C'est ce qui la distingue d'un L, qui est le même volume vu comme
un retrait. Les deux peuvent produire des silhouettes voisines ; la
différence est dans la génération, pas dans le résultat, et les vignettes
doivent la rendre lisible — le socle de « Souple » doit se lire comme un
corps principal auquel on a ajouté, pas comme un rectangle entamé.

**Aléatoire, précisément.** Deux sources de hasard coexistent désormais et ne
doivent pas être confondues : la **graine** (§5 bis de `ROADMAP_HISTORIQUE.md`) fait
varier la géométrie à forme donnée ; `random` fait varier la **famille de
forme** elle-même. Choisir `random` puis rejouer une graine doit redonner la
même forme — sans quoi la graine cesse d'être une donnée du plan.

La forme retenue comme représentative pour la vignette `random` est la
**baïonnette**, deux corps de bâtiment de tailles voisines décalés de part et
d'autre d'un joint commun. C'est la silhouette orthogonale crédible que la
liste ne couvre pas encore — ni angle franc comme le L, ni symétrie comme le
U — et elle se lit immédiatement comme « autre chose que les cinq
précédentes ». La vignette la montre doublée d'une silhouette fantôme, pour
dire « une forme parmi d'autres » plutôt que « cette forme-là ».

---

## 2. Prompt de génération

Une seule planche, six cellules, grille 3 × 2.

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
- lines may fade into transparency at their ends, never stop abruptly
- no frames, no boxes, no cards, no containers around any element
- no drop shadows, no glow, no bevel, no ambient occlusion
- no texture, no grain, no paper fibre, no photorealism
- no radial gradient behind subjects — it always reads as a visible rectangle
- generous negative space; the black must dominate the composition

Mood: sober, restrained, confident. Nothing decorative that does not carry
meaning. Clarity over spectacle.

SHAPE SET SPECIFICS — this image is a grid of building footprint outlines,
not a scene and not a set of interface icons:
- top-down plan view of a building footprint only: the outer outline of the
  ground floor, nothing else
- no interior walls, no rooms, no furniture, no doors, no windows, no roof
  lines, no dimensions, no north arrow, no ground, no landscape
- each footprint is a closed orthogonal outline: every corner is exactly 90
  or 270 degrees, every edge strictly horizontal or vertical, no diagonal
  and no curve anywhere in this set
- all six footprints must read as covering the SAME floor area — a square
  and an L of equal area, not a large square next to a small L; the eye must
  compare shapes, never sizes
- all six sit in cells of identical size, each footprint occupying about the
  same share of its cell, centred, same visual weight
- identical stroke weight across all six — this is one family of six
  variations, not six separate drawings
- same reading orientation for all: the longer dimension horizontal wherever
  the shape allows
- no cell touches another, no grid lines drawn
- label each cell in small caps gold text below the footprint, using the
  French name given below
- render at high resolution (at least 2400 px wide) so the trace step keeps
  clean edges

The six footprints, one per cell, in this order:

carrée — a plain square outline

rectangulaire — a plain rectangle outline, roughly 3 wide by 2 tall

L — a rectangle with one corner quarter removed, forming two perpendicular
wings of comparable width meeting at a right angle

U — a rectangle with a notch cut into the middle of one long side, forming
two symmetrical parallel wings joined by a spine; the notch opens outward
and is roughly one third of the width

souple — one dominant rectangular base carrying two smaller rectangular
volumes that project OUTWARD from two different sides, each clearly smaller
than the base and clearly attached to it, so the whole reads as a main body
with added parts rather than as a rectangle with pieces taken away; the two
projections must not be symmetrical to each other

aléatoire — a staggered footprint: two rectangular bodies of similar size
offset from one another along a shared joint, like two blocks slid apart in
opposite directions; behind it, the same footprint repeated once as a faint
dashed outline, slightly offset, suggesting one possibility among several
```

Réserves d'usage, confirmées sur les planches précédentes : prévoir plusieurs
tirages, vérifier avant de tracer. Trois vigilances propres à ce jeu :

- **l'égalité des aires perçues est le critère d'acceptation.** Un générateur
  dessinera spontanément un petit L à côté d'un grand carré ; la planche est
  alors à refaire, car la vignette ferait croire que choisir un L réduit la
  maison ;
- le glissement vers l'**icône d'interface** est ici très probable — maison
  avec toit en triangle, pictogramme immobilier. Ce sont des emprises au sol
  vues de dessus, jamais des maisons vues de face ;
- « Souple » et « L » risquent de se ressembler. Si les deux vignettes sont
  interchangeables, la distinction additive/soustractive du §1 n'est pas
  passée et il faut relancer sur ce seul glyphe.

---

## 3. Reprise en SVG

Même chaîne que `room-icons.svg`, et l'argument est encore plus net : ces
formes sont des polygones orthogonaux de six à douze sommets. La planche sert
de référence de composition ; le tracé final est écrit à la main en
coordonnées entières.

Sortie attendue : `assets/icons/shape-options.svg`, `<symbol id="shape-{id}">`,
`viewBox 0 0 64 64` commun, trait en `currentColor`, recopié inline dans
`index.html` — voir la réserve de `DA_CHEMINEMENT_PLAN.md` §3 sur la
généralisation du script d'injection.

Un contrôle mérite d'être automatisé au moment du tracé : **calculer l'aire
de chaque polygone** et vérifier qu'elles sont égales à quelques pour cent
près. C'est la promesse visuelle du jeu, et c'est vérifiable.

---

## 4. Conséquence sur le moteur

Le Chantier 1 de `ROADMAP_HISTORIQUE.md` ne prévoyait que trois valeurs de `shape`. Les
six vignettes en font six, dont deux sont des sous-cas nommés de l'ancien
`freeOrthogonal` et une est un tirage. Le §5 de la roadmap est mis à jour en
conséquence ; `freeOrthogonal` conserve son nom et devient « Souple ».

Points à trancher au moment de coder :

1. `random` tire-t-il uniformément parmi les cinq formes, ou pondère-t-il
   selon la surface ? Un U à 40 m² n'a pas de sens : les ailes passeraient
   sous la largeur minimale de `TH2D-BOUNDARY-007`.
2. Une forme devenue impossible à la surface demandée doit-elle être
   **désactivée dans le questionnaire** plutôt que proposée puis refusée. La
   première réponse est la bonne : une option affichée qui échoue toujours
   est une option qui ment.
