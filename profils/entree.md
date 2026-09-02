# Profil fonctionnel — Entrée

**`ENTRY_THRESHOLD` · maturité `C4` · 1er septembre 2026**

Vague **C-P2**. L'entrée est ici une **fonction hébergée**, pas un type de
pièce généré : elle qualifie le seuil extérieur et la zone d'arrivée située
dans une circulation ou, à défaut, dans le séjour. Cette portée évite
d'inventer un hall sur les petits logements tout en faisant participer
l'entrée au verdict du plan.

## 1. Contrat fonctionnel

```text
PROFILE       ENTRY_THRESHOLD
HOSTS         circulation > living > dining > cellier > buanderie > kitchen
FORBIDDEN     bedroom · bath · wc · bureau · garage
OPENING       outward
ARRIVAL_ZONE  1.20 × 1.20 m, libre de toute emprise de mobilier
```

La porte doit relier une pièce admissible à `exterior`. La circulation est
préférée lorsqu'elle atteint la façade ; le séjour assure le repli crédible
d'un logement sans dégagement. La cuisine n'est qu'un dernier recours et les
pièces privées ou humides ne peuvent jamais accueillir le seuil.

## 2. Valeurs canoniques

| Identifiant | Grandeur | Valeur | Statut |
|---|---|---:|---|
| `VAL-ENTRY-DOOR-BAY-WIDTH-001` | baie | 0,90 m | `HARD N1` |
| `VAL-ENTRY-DOOR-LEAF-WIDTH-001` | vantail nominal | 0,83 m | `HARD N1` |
| `VAL-ENTRY-CLEAR-WIDTH-001` | passage utile | 0,83 m | `HARD N1` |
| `VAL-ENTRY-ARRIVAL-WIDTH-MIN-001` | largeur d'arrivée | 1,20 m | `HARD N3` |
| `VAL-ENTRY-ARRIVAL-DEPTH-MIN-001` | profondeur d'arrivée | 1,20 m | `HARD N3` |

Les deux dernières valeurs sont doctrinales et justifiées : une porte seule
n'est pas une entrée si l'usager débouche directement dans une emprise de
mobilier. Elles portent donc identifiant, statut, portée et raison, selon la
règle N3 validée pour les seuils `HARD`.

## 3. Construction et verdict

- `poserEntree()` essaie les hôtes par ordre fonctionnel et centre le seuil
  dans la plage libre afin de contenir les parcours ;
- `entryArrivalZone()` refuse un seuil dont la zone 1,20 × 1,20 m ne tient pas
  entièrement dans une partie de la pièce hôte ;
- `placement.roomContext()` interdit les emprises de mobilier dans cette zone,
  mais autorise le passage et les zones d'usage à la partager ;
- `TH2D-ENTREE-001` refuse l'absence d'accès extérieur ;
- `TH2D-ENTREE-002` refuse l'absence, le sous-dimensionnement ou l'occupation
  de la zone d'arrivée.

Le battant ouvre vers l'extérieur. Son franchissement rejoint le même graphe
de parcours et le même verdict `S3/S4` que les portes intérieures.

## 4. Classes et limites de portée

`MINIMAL` et `MEDIUM` restent une fonction hébergée. Une pièce autonome
`entree` ou un hall, le placard d'entrée, la banquette et les espaces de
manœuvre accessibles de 1,70/2,20 m sont différés : les annoncer ici ferait
passer une consolidation limitée pour une modélisation complète.

Le banc `scripts/test-entree.mjs` couvre 96 demandes fixes : **83 plans sont
valides et 13 `NON_TROUVE`** ; les refus concernent surtout des
studios en bande incapables de réserver l'arrivée sans sacrifier leur
programme. Chaque classe conserve au moins deux solutions ; aucun plan retenu
ne contourne la règle.

## 5. Preuves C4

- valeurs canoniques consommées par générateur, contrat et règles ;
- hôtes autorisés et repli circulation → séjour ;
- cas absents, trop petits et occupés refusés isolément ;
- zone réelle confrontée aux placements du `BuiltPlan` ;
- manifeste `ENTRY_THRESHOLD C4` présent dès le `Program`.
