# Cheminement et accès — DA du plan TechnoHab

**Statut au 2 septembre 2026 :** spécification graphique historique ; le
cheminement orthogonal, les accès, les portes et le calque de parcours sont
désormais calculés et rendus. Les listes « à spécifier » plus bas conservent le
raisonnement d'origine et ne décrivent plus toutes des dettes actives. État du
moteur : [`CARTOGRAPHIE_MOTEUR.md`](CARTOGRAPHIE_MOTEUR.md) §5.

Objectif : tracer sur le plan le **parcours réel** qui dessert le logement —
depuis l'entrée, à travers chaque accès franchi, jusqu'à chaque pièce — et
donner à ce parcours un vocabulaire graphique cohérent avec la direction
artistique de Wonderland (voir [`../DA_GRAPHIQUE.md`](../DA_GRAPHIQUE.md)).

Ce parcours a deux vies successives, et cette distinction commande tout le
reste du document :

1. **A posteriori** — le chemin est calculé sur un plan déjà généré, comme un
   contrôle : le layout est-il traversable, chaque pièce est-elle atteinte,
   par quel accès, sur quelle longueur ?
2. **A priori** — le chemin devient une contrainte de génération : le layout
   est retenu parce qu'il porte un cheminement acceptable, et non l'inverse.

L'étape 1 est un révélateur : elle montre où le découpage en guillotine
produit des desserte absurdes. L'étape 2 est la correction. Le vocabulaire
graphique décrit ici doit servir aux deux sans changer.

---

## 1. Inventaire — ce qu'il faut pouvoir montrer

### 1.1 Ce qui ne doit **pas** être généré comme image

C'est la différence de fond avec [`DA_ICONES_PLAN.md`](DA_ICONES_PLAN.md).
Un pictogramme de pièce est une **forme libre** — un canapé, un lit — qu'un
générateur d'images dessine mieux qu'une main pressée, et qui reste identique
d'un plan à l'autre. Le cheminement, lui, est **paramétrique** : chaque
élément ci-dessous est une fonction du plan calculé, pas un glyphe.

| Élément | Pourquoi il est tracé par le moteur |
|---|---|
| Polyligne du chemin | longueur, direction et nombre de coudes dépendent du layout |
| Coude, embranchement en T ou en croix | l'angle est calculé, pas choisi dans un catalogue |
| Arc d'ouverture de porte | le rayon **est** la largeur de la baie ; un arc figé mentirait sur la cote |
| Cote de largeur libre | valeur numérique variable, texte inclus |
| Cercle de giration 1,50 m | c'est un gabarit à l'échelle du plan, jamais un glyphe |
| Épaisseur du trait de chemin | doit rester constante à l'écran quel que soit le zoom |

Vouloir ces éléments en SVG figé produirait des symboles qu'il faudrait
étirer — donc des arcs de porte déformés et des cotes fausses. Ils relèvent
d'une **spécification de tracé**, écrite au §4, pas d'un prompt d'image.

### 1.2 Ce qui est généré — 13 marqueurs ponctuels

Ne restent générables que les glyphes **invariants d'échelle** : des
marqueurs posés en un point du chemin, et les vignettes de la légende sous le
plan. Ceux-là ne s'étirent jamais, ils se posent.

| `id` du symbole | Libellé | Concept |
|---|---|---|
| `depart` | Départ | Point d'entrée du logement, amorce du parcours |
| `jalon` | Jalon | Point de passage simple sur le chemin |
| `distribution` | Distribution | Nœud où le parcours se divise vers plusieurs pièces |
| `arrivee` | Arrivée | Terminaison du parcours dans une pièce desservie |
| `franchissement` | Franchissement | Marqueur posé sur un accès effectivement traversé |
| `giration` | Giration | Repère de manœuvre, aire de demi-tour |
| `passage_contraint` | Passage contraint | Largeur libre insuffisante à cet endroit |
| `impasse` | Impasse | Pièce non desservie, ou parcours sans issue |
| `porte_simple` | Porte simple | Vignette de légende, un vantail |
| `porte_double` | Porte double | Vignette de légende, deux vantaux |
| `baie_libre` | Baie libre | Vignette de légende, ouverture sans menuiserie |
| `porte_coulissante` | Porte coulissante | Vignette de légende, vantail à galandage |
| `porte_entree` | Porte d'entrée | Vignette de légende, accès extérieur |

Les cinq dernières servent la **légende**, pas le plan : sur le plan, chaque
accès est tracé à sa cote réelle (§1.1). Une vignette de légende peut être un
glyphe fixe puisqu'elle n'est jamais à l'échelle.

---

## 2. Prompt de génération

Une seule planche, tous les marqueurs en grille, pour garantir la cohérence
de trait — même méthode que la planche de pictogrammes de pièces. Le bloc
d'ouverture est celui de
[`DA_GRAPHIQUE.md` §8](../DA_GRAPHIQUE.md#8-bloc-pour-la-génération-dimages),
repris sans modification.

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

MARKER SET SPECIFICS — this image is a grid of wayfinding markers for an
architectural floor plan, not a scene:
- top-down (plan view) only, as drawn on a survey drawing — never a 3/4 or
  perspective view, never an isometric hint
- one marker = one glyph = one clearly readable shape at 20x20 px; discard
  any detail that would vanish at that size
- these are point markers, not path segments: each glyph must read correctly
  when dropped at a single coordinate, and must never look like it needs to
  be stretched, tiled or repeated to make sense
- every glyph sits in its own equal-sized cell of an evenly spaced grid,
  no cell touches another, no grid lines drawn
- identical stroke weight across all glyphs — this is a single typeface of
  symbols, not 13 unrelated drawings
- geometric construction only: circles, squares, triangles, right angles and
  45 degree angles; no organic or freehand curve anywhere in this set
- the eight route markers must form a visibly coherent family, built from
  the same base circle diameter, so that a plan carrying several of them
  reads as one notation system
- the five door vignettes share one convention: wall shown as two short
  parallel segments, opening shown as a gap, leaf shown as a straight line,
  swing shown as a quarter-circle arc
- label each cell in small caps gold text below the glyph, using the French
  name given below
- render at high resolution (at least 2400 px wide) so the trace step keeps
  clean edges

Glyphs to draw, one per cell, in this order:

départ (filled circle inside an open ring, the start of a route),
jalon (small hollow circle, a plain waypoint),
distribution (hollow circle with three short strokes radiating at 120
degrees, a branching node),
arrivée (hollow circle enclosing a smaller filled square, the end of a
route),
franchissement (two short parallel wall segments with a gap between them,
crossed by a single perpendicular stroke — a threshold actually walked
through),
giration (a hollow circle drawn with a fine dashed stroke, a turning
allowance),
passage contraint (two short parallel wall segments with a narrow gap,
flanked by two opposed arrowheads pressing inward),
impasse (a hollow circle struck through by a single diagonal bar),
porte simple (plan-view door: wall, gap, one straight leaf and one
quarter-circle swing arc),
porte double (plan-view door: wall, wide gap, two straight leaves opening
symmetrically, two quarter-circle swing arcs),
baie libre (plan-view opening: wall, wide gap, no leaf and no arc),
porte coulissante (plan-view sliding door: wall, gap, one straight leaf
drawn parallel to the wall, offset, with a short double-headed arrow along
the wall axis),
porte d'entrée (plan-view door as porte simple, with an additional short
stroke outside the wall marking the exterior side)
```

Réserves d'usage, héritées de `DA_GRAPHIQUE.md` et confirmées sur la planche
de pièces : prévoir plusieurs tirages, vérifier visuellement avant de tracer.
Deux points de vigilance propres à ce jeu :

- **la cohérence de famille est le critère d'acceptation**, plus que la
  beauté d'un glyphe isolé — si les huit marqueurs de parcours n'ont pas le
  même diamètre de base, la planche est à refaire ;
- les générateurs dérivent vite vers l'**icône d'interface** (épingle de
  carte, coche, panneau d'alerte). Ces glyphes sont des notations de plan
  technique ; tout ce qui évoque une application est à rejeter.

---

## 2 bis. Relance — premier tirage et ce qu'il manque

Le premier tirage a livré douze glyphes. Bilan :

| Livré | Suite |
|---|---|
| Rétrécissement, Traversée de seuil, Départ de parcours, Arrivée de parcours | **acquis**, à vectoriser |
| Ligne droite, Coude 90°, Coude 45°, Courbe douce, Décalage en S, Jonction T, Croisement, Bifurcation Y | **écartés comme assets** — ce sont les éléments paramétriques du §1.1 ; conservés comme référence de style pour le tracé calculé |
| Jalon, Distribution, Giration, Impasse, et les cinq vignettes de porte | **manquants**, objet de la relance |

Deux défauts de forme à corriger dans la relance : le trait était trois à
quatre fois plus épais que celui des cloisons, et les terminaisons en pastille
donnaient au jeu une allure de plan de transport. Superposé aux pièces, ce
graphisme masquerait le plan qu'il annote.

**Décision de tracé prise au passage** : le cheminement se trace en polyligne
**orthogonale**, pas en courbe. Une courbe douce dit « trajet de marche réel »
là où l'angle droit dit « graphe de desserte » ; la phase 9 a est un
instrument de mesure, elle doit dire le second. Les glyphes de courbe et de
décalage en S restent donc sans emploi tant que le tracé n'est pas un objet
de présentation.

Prompt de relance, sur les neuf glyphes manquants uniquement :

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

MARKER SET SPECIFICS — a grid of nine annotation glyphs for an architectural
floor plan, in plan view only:

CRITICAL — stroke weight: these glyphs are drawn ON TOP of a floor plan whose
walls are already hairlines. The stroke must be as thin as an engraved survey
line — the same weight as a wall. Do NOT draw thick rounded strokes, do NOT
use large filled dots or lollipop terminals, do NOT make this look like a
transit map or a subway diagram. Thin, dry, technical.

CRITICAL — do NOT draw any path segment: no straight lines, no 90 or 45
degree elbows, no curves, no S-offsets, no T-junctions, no crossings, no
Y-forks. Those are computed by software and are not part of this set. Every
glyph here is a POINT MARKER or a DOOR VIGNETTE, complete in itself.

- one glyph = one clearly readable shape at 20x20 px
- the first four glyphs are route markers and must form one visible family:
  same base circle diameter, same construction logic, so that a plan carrying
  several of them reads as a single notation system
- the last five are door vignettes and share one convention: wall drawn as
  two short parallel segments, opening as a gap between them, leaf as a
  straight line, swing as a quarter-circle arc
- geometric construction only: circles, squares, straight segments, right
  angles, quarter-circle arcs; no organic or freehand curve
- every glyph in its own equal-sized cell of an evenly spaced grid, no cell
  touching another, no grid lines drawn
- label each cell in small caps gold text below the glyph, using the French
  name given below
- render at least 2400 px wide

The nine glyphs, one per cell, in this order:

jalon — a small hollow circle, nothing inside, a plain waypoint

distribution — a hollow circle of the same diameter with three short strokes
radiating outward at 120 degrees, stopping short of the circle, a branching
node

giration — a hollow circle of larger diameter drawn with a fine dashed
stroke, empty inside, a turning allowance

impasse — a hollow circle of the base diameter struck through by one straight
diagonal bar that extends slightly beyond it

porte simple — plan view: two short collinear wall segments with a gap
between them, one straight leaf standing perpendicular in the gap, and one
quarter-circle arc from the tip of the leaf back to the wall

porte double — plan view: two wall segments with a wide gap, two straight
leaves opening symmetrically from each side, two mirrored quarter-circle arcs

baie libre — plan view: two wall segments with a wide gap between them, no
leaf and no arc, nothing in the opening

porte coulissante — plan view: two wall segments with a gap, one straight
leaf drawn parallel to the wall and slightly offset from it, plus one short
double-headed arrow along the wall axis showing the slide

porte d'entrée — plan view identical to porte simple, plus one short stroke
outside the wall on the far side, marking the exterior
```

---

## 3. Reprise en SVG

Même conclusion que `DA_ICONES_PLAN.md` §3, et pour la même raison :
`potrace` trace des contours et non des traits. La planche sert de
**référence de dessin** ; les glyphes sont ensuite retracés en géométrie
directe.

Ici l'argument est encore plus net — ces formes sont des cercles, des carrés
et des arcs à angle droit. Une vectorisation automatique produirait des
polygones approchants là où deux nombres suffisent, et `passage_contraint`
doit pouvoir passer en rouge sans que le reste du jeu bouge.

Sortie attendue : `assets/icons/route-markers.svg`, mêmes conventions que
`room-icons.svg` — `<symbol id="mark-{id}">`, `viewBox 0 0 64 64` commun,
trait en `currentColor` — recopié inline dans `index.html` pour la même
raison que le sprite de pièces : `<use href="fichier.svg#id">` ne résout pas
en `file://`. `scripts/inline-sprite.mjs` est aujourd'hui
codé sur un seul couple source/marqueurs ; il devra être généralisé à une
liste de sprites, ou dupliqué, avant d'accueillir celui-ci.

---

## 4. Ce qui reste à spécifier avant de coder le tracé

Le prompt du §2 ne couvre que les marqueurs. Le chemin lui-même demande des
décisions qui ne sont pas graphiques :

1. **Quel graphe** — le cheminement s'appuie-t-il sur les `edges` d'adjacence
   déjà calculés, ou sur un graphe d'accès distinct où une adjacence sans
   porte n'est pas un passage ? La seconde réponse est la bonne, et elle
   implique de modéliser les portes avant de tracer quoi que ce soit.
2. **Quel point dans la pièce** — centroïde, ou point le plus proche de
   l'accès ? Le centroïde donne un tracé lisible, le second un tracé juste.
3. **Quelle métrique** — plus court chemin en distance, ou en nombre de
   franchissements ? Un plan qui dessert une chambre en traversant une autre
   chambre est fautif même s'il est court.
4. **Traversées interdites** — traverser une chambre, une salle d'eau ou un
   WC pour desservir une autre pièce doit être une violation, pas un détour
   plus coûteux.

Ces quatre points sont portés en Phase 9 de `ROADMAP.md`.
