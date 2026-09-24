# Icônes de pièces — DA du plan TechnoHab

**Statut au 3 septembre 2026 : assets livrés, couverture produit à auditer en
M5.4.** Le sprite contient 18 symboles de pièces et le mobilier dispose de son
propre jeu de 34 symboles. Les 32 identifiants d'équipements ou de gammes du
socle courant ont tous un dessin ; `oven` et `double_washbasin` sont deux
réserves sans entrée de catalogue active. Les passages ci-dessous formulés au
futur documentent la fabrication initiale ; ils ne sont plus une liste de
travail active.

Objectif : donner à chaque type d'espace affiché sur le plan un pictogramme
cohérent avec la direction artistique de Wonderland (voir
[`../DA_GRAPHIQUE.md`](../DA_GRAPHIQUE.md)), au lieu du simple libellé texte
actuel. Le label de nom de pièce est déjà réduit
([`assets/styles.css`](assets/styles.css) `.room-label`, passé de `.27px` à
`.19px` de viewBox) pour laisser la place à l'icône.

Ce document ne produit pas les fichiers SVG finaux — la génération d'image
et le tracé sont une étape manuelle/outillée séparée (section 3). Il fixe
la liste des types à couvrir et le prompt à utiliser.

---

## 1. Types d'espaces à couvrir

### 1.1 Actuellement affichables (moteur JS déployé, `assets/generator.js::DEFINITIONS`)

Ces 6 icônes sont la priorité — ce sont les seules réellement rendues sur
`#plan-svg` aujourd'hui.

| `type` (id JS) | Libellé affiché | Concept d'icône |
|---|---|---|
| `living` | Séjour | Canapé de trois-quarts + table basse, silhouette simple |
| `bedroom` | Chambre | Lit vu de dessus (matelas + oreiller) |
| `bath` | Salle d'eau | Douche ou baignoire stylisée + pomme de douche |
| `wc` | WC | Cuvette vue de dessus, forme ovale simple |
| `kitchen` | Cuisine | Plaque de cuisson (deux ronds) + évier |
| `circulation` | Circulation | Flèche ou trait de cheminement, pointillé fin |

### 1.2 Catalogue cible (référentiel complet, `technohab_rules.md` §1, pack P3)

Non affichables aujourd'hui (le moteur JS n'a pas ces fonctions), mais à
prévoir pour ne pas repasser un cycle de génération d'image à chaque
extension du moteur. Traiter en un seul lot maintenant.

| Fonction (id Python) | Libellé | Concept d'icône |
|---|---|---|
| `entree` | Entrée | Porte ouverte à 45°, vue de dessus |
| `bureau` | Bureau | Plan de travail + chaise, vue de dessus |
| `buanderie` | Buanderie | Lave-linge (hublot rond) |
| `local_technique` | Local technique | Écrou/clé, ou compteur stylisé |
| `garage` | Garage | Silhouette de véhicule simplifiée, vue de dessus |
| `cellier` | Cellier | Étagère à trois niveaux |
| `salle_a_manger` | Salle à manger | Table + assise, vue de dessus |
| `exterior` | Extérieur | Non représenté par icône (hors volume bâti) |

18 icônes au total (6 prioritaires + 8 catalogue cible + `chambre_enfant`/
`chambre_parentale` qui partagent l'icône `bedroom`, `salle_de_bain` =
`bath`, `salon` = `living`, `cuisine` = `kitchen`).

---

## 2. Prompt de génération

À utiliser tel quel, un rendu par planche (une planche = tous les
pictogrammes disposés en grille, pour garantir une cohérence de trait entre
eux — c'est ainsi que la planche `assets/habiter/plan-src.png` a été
produite). Reprend le bloc DA obligatoire de
[`DA_GRAPHIQUE.md` §8](../DA_GRAPHIQUE.md#8-bloc-pour-la-génération-dimages),
étendu aux contraintes propres à un jeu d'icônes.

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

ICON SET SPECIFICS — this image is a grid of architectural pictograms, not
a scene:
- top-down (plan view) silhouette for every icon, exactly as a floor-plan
  furniture symbol would be drawn — never a 3/4 or perspective view
- one icon = one glyph = one clearly readable shape at 24×24 px; discard
  any detail that would disappear at that size
- every icon sits in its own equal-sized cell of an evenly spaced grid,
  no cell touches another, no grid lines drawn
- identical stroke weight across all icons in the set — this is a single
  typeface of symbols, not 18 unrelated drawings
- label each cell in small caps gold text below the glyph, using the
  French room-function name (see list below)
- render at high resolution (at least 2400 px wide) so the trace/vector
  step keeps clean edges

Icons to draw, one per cell, in this order:
séjour (canapé + table basse, dessus), chambre (lit, dessus), salle d'eau
(douche/pomme de douche, dessus), wc (cuvette ovale, dessus), cuisine
(plaque deux feux + évier, dessus), circulation (flèche de cheminement,
trait fin pointillé), entrée (porte ouverte à 45°, dessus), bureau (plan de
travail + chaise, dessus), buanderie (lave-linge, hublot rond), local
technique (clé/écrou stylisé), garage (silhouette de véhicule simplifiée,
dessus), cellier (étagère à trois niveaux), salle à manger (table + assises,
dessus)
```

Réserves d'usage (héritées de `DA_GRAPHIQUE.md`) : prévoir plusieurs
tirages, les générateurs tiennent mal les comptages exacts et la
cohérence de style peut dériver d'une case à l'autre sur une grille dense —
vérifier visuellement avant de lancer le tracé.

---

## 3. Extraction en SVG — même traitement que l'image de la ferme

> **Écart assumé, 15 août 2026.** Le pipeline décrit ci-dessous a été
> abandonné à l'étape 3. `potrace` trace des *contours*, pas des traits :
> sur un glyphe au trait fin, chaque segment ressort en polygone fermé de
> deux bords, ce qui double le nombre de points, empêche de régler
> l'épaisseur après coup et interdit `currentColor` par famille de pièce.
> La planche a donc servi de **référence de dessin** et chaque glyphe a été
> retracé en géométrie directe (`path`/`circle`/`rect` en coordonnées
> entières sur un `viewBox 0 0 64 64`). Résultat : 18 symboles pour 6,2 Ko,
> relisibles et modifiables à la main, là où un tracé `potrace` du même jeu
> dépassait l'ordre de grandeur. Le reste de la section est conservé pour
> mémoire du chemin envisagé.

La planche d'icônes issue de l'étape 2 est une image matricielle (PNG),
trait doré sur fond noir. Le passage en SVG propre suit exactement le
pipeline déjà utilisé pour `assets/habiter/plan-src.png` → `plan.svg`
(`Wonderland/scripts/plan-habiter/01_analyse.py` → `05_variante.py`) :

1. **`01_analyse.py`** — suréchantillonnage (×3, bicubique) puis seuillage
   du niveau de gris (seuil ~52/255, calé entre halo d'antialiasing et
   trait plein), étiquetage des composantes connexes
   (`scipy.ndimage.label`), filtrage des poussières de compression
   (`TAILLE_MIN`). Pour la planche d'icônes, ce script sert à repérer
   automatiquement les 18 cellules de la grille (une composante = un
   glyphe, sauf glyphes à plusieurs traits disjoints comme "plaque deux
   feux" → regroupement manuel par bounding box de cellule).
2. **`02_zones.py`** / **`03_chemins.py`** — non pertinents tels quels
   (pensés pour le réseau de chemins de la ferme) ; à remplacer par un
   découpage en grille fixe (position de cellule connue puisque générée
   avec un pas régulier au prompt).
3. **`04_build.py`** — trace chaque masque de cellule avec `potrace`
   (`-b svg -t 22 -a 1.334 -O 2.0 -u 2 --flat`), recompose un chemin SVG
   unique par icône en coordonnées absolues compactées au dixième. Sortie
   attendue : un `<symbol id="icon-{type}">` par pièce, viewBox commun
   (ex. `0 0 24 24`), regroupés dans un seul fichier
   `assets/icons/room-icons.svg`.
4. **`05_variante.py`** — non applicable (pas de variante géométrique pour
   des icônes fixes) ; à ignorer.
5. **`svgo.config.mjs`** — réutiliser tel quel pour la compaction finale
   (déjà réglé pour ce style de trait, cf. dossier `scripts/plan-habiter/`).

Sortie finale attendue : `assets/icons/room-icons.svg`,
un seul fichier avec 18 `<symbol>`, chargé une fois et référencé par
`<use href="#icon-living">` etc. dans chaque groupe `.room` de
`app.js::renderPlan`. Ce câblage (ajout du `<use>`, positionnement
au-dessus du label déjà réduit) est la seule partie qui reste à coder une
fois les SVG produits — volontairement pas fait dans cette passe pour ne
pas référencer des symboles qui n'existent pas encore.

---

## 4. État — fait le 15 août 2026

- `assets/icons/room-icons.svg` : 18 `<symbol>` (13 glyphes + 5 fonctions du
  référentiel qui en partagent un), `viewBox 0 0 64 64` commun, trait en
  `currentColor`. Source de vérité éditable.
- `assets/icons/furniture.svg` : 34 `<symbol>` à l'échelle, dont 32 raccordés
  aux identifiants du socle et 2 en réserve. Aucun identifiant du catalogue
  courant n'est dépourvu de symbole.
- Le sprite est **recopié inline dans `index.html`** entre les marqueurs
  `room-icons:start/end` : `<use href="fichier.svg#id">` ne résout pas en
  `file://`, et la page doit rester consultable sans serveur
  (`CLAUDE.md` §1). Propagation par
  `node scripts/inline-sprite.mjs` ; le même script en
  `--check` échoue si la page a divergé du fichier.
- `app.js::renderPlan` compose le bloc central de chaque pièce
  (`composeRoomContent`) : il est masqué au repos pour laisser lire les
  équipements, affichés par défaut. Au survol, le mobilier de cette seule
  pièce s'efface et le bloc révèle pictogramme, nom, dimensions `L × l` et
  surface. Taille du glyphe = 44 % du côté court, bornée à [0,5 m ; 1,5 m],
  seuil d'apparition à 1,20 m de côté court.
- Rotation d'un quart de tour quand `data-orient` du symbole contredit
  l'orientation de la pièce et que `data-rotatable` l'autorise — un lit, un
  canapé ou une voiture se posent dans le sens de la pièce.
- Vérifié sans débordement de glyphe ni de texte hors du rectangle de pièce
  sur 35, 45, 75, 90, 120, 180 et 250 m².

Reste ouvert : les 12 fonctions du catalogue `technohab_rules.md` §1 autres
que les 6 du moteur JS ne sont pas encore atteignables depuis l'interface —
leurs symboles existent et se câbleront seuls dès que `DEFINITIONS` les
exposera, l'`id` du symbole étant l'`id` de fonction.

Un symbole disponible n'est toutefois pas nécessairement visible dans le
produit. Le bilan M5.4 distingue désormais cinq états : présence au catalogue,
présence dans le sprite source, copie inline compatible `file://`, raccord au
rendu et apparition observée sur un plan. Son point zéro du 3 septembre est
consigné dans `ROADMAP_HISTORIQUE.md` §6.1 nonies.
