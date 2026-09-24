# Décisions sur le programme de pièces

**Rendues le 26 août 2026.** Elles ferment dix-neuf questions issues de la
relecture des neuf [profils de pièce](profils/README.md) et des arbitrages
d'entrée du chantier 7, ouverts depuis le 18 août.

**Complétées le 27 août 2026** : le principe du §1 est devenu la doctrine
globale du logiciel — voir [`DOCTRINE.md`](DOCTRINE.md). Ce fichier reste
l’autorité sur les **quatre cas** (repas, dressing, rangement, bureau) et
sur les quinze autres décisions tabulées ; la doctrine globale fait foi sur
le vocabulaire, la chaîne cible et le flux F de la roadmap.

Ce document fait foi sur ces décisions. `ROADMAP.md` fait foi sur l'ordre
d'exécution, `profils/` sur la conception de chaque pièce, `socle.data.js` sur
les valeurs.

---

## 1. Le principe qui les tient toutes — l'émergence fonctionnelle

Quatre questions ont été posées séparément : la salle à manger, le dressing, le
rangement et le bureau sont-ils une pièce, une zone ou un équipement ? Les
quatre réponses sont la même, et elle change le modèle plus qu'aucun de ces
quatre cas pris isolément.

> **La fonction est l'unité primaire. La pièce est une dénomination qui
> apparaît quand les conditions le permettent.**

Ce que cela veut dire, formulé pour le moteur :

```text
FUNCTION <nom>
  REQUIRED_EQUIPMENT   invariants, quel que soit l'hôte
  MIN_ENVELOPE         dérivée des équipements et de leurs zones d'usage
  EXISTENCE            la fonction est remplie AU MOINS UNE FOIS dans le plan
  HOST_FALLBACK        la pièce qui l'absorbe si elle n'émerge pas
  EMERGENCE            condition sous laquelle elle devient une pièce autonome
  DENOMINATION         change avec l'émergence ; les fonctions, non
```

Trois conséquences, toutes énoncées par l'arbitrage :

**« Si c'est dans une pièce à part, c'est la dénomination qui change, pas les
fonctions. »** Une salle à manger et un coin repas ont le même programme
d'équipements, les mêmes enveloppes, les mêmes exigences de circulation. Seul
le nom diffère, et le fait d'avoir une porte. Le moteur ne doit donc pas porter
deux définitions.

**« Doit au moins être remplie une fois par le plan. »** L'existence de la
fonction est un invariant dur, indépendant de son hébergement. C'est la
généralisation du défaut D3 : une option qui retire une pièce du programme doit
verser ses équipements à celle qui l'absorbe, jamais les faire disparaître.

**L'émergence est dérivée, pas décrétée.** Une fonction devient pièce quand la
surface le permet **et** que les pièces requises sont déjà satisfaites. Ce n'est
pas un seuil unique mais une condition à deux termes — suffisance et
disponibilité — plus une priorité entre fonctions candidates (§4).

### Le patron existe déjà, pour deux fonctions

`trigger: { kind: 'always', standaloneIf: 'separateKitchen', otherwiseInto:
'living' }` — la cuisine. Et le même pour le WC, avec `includeWc` et `bath_1`.

**Six fonctions relèvent du même patron**, dont deux sont implémentées :

| Fonction | Hôte de repli | Émergence | État |
|---|---|---|---|
| cuisine | séjour | option `separateKitchen` | **fait** |
| WC | salle d'eau | option `includeWc` | **fait** |
| repas | séjour, sinon cuisine | dérivée | à faire |
| bureau | séjour, sinon chambre | dérivée | à faire |
| rangement | pièce hôte | dérivée, ≥ 80 m² | à faire |
| dressing | chambre | dérivée, profondeur | à faire |

La seule extension nécessaire : `standaloneIf` doit accepter **une condition
dérivée** en plus d'un drapeau d'option. C'est le lot L1 du chantier 7 —
l'interpréteur de `trigger` — dont le périmètre s'élargit d'autant.

---

## 2. Les quatre cas, décidés

### 2.1 Repas — `dining`

**Fonction, hébergée par défaut, émergente sous conditions.**

- équipements : table dimensionnée au nombre de convives, assises comprises
  dans la zone d'usage — pas de double comptage ;
- **au moins une occurrence obligatoire dans tout plan**, y compris T1 et
  studio ;
- en T1 et studio : la table peut être adossée à la cuisine, **à condition
  qu'au moins deux places assises soient réellement praticables** — recul de
  chaise compris. C'est le critère minimal, et il est calculable ;
- hôte de repli : séjour, puis cuisine ;
- dénomination : « salle à manger » si autonome, « coin repas » sinon.

Ce qui doit être satisfait dans tous les cas, quel que soit l'hôte : **les
équipements, le zoning et les circulations**. C'est là que porte le contrôle,
pas sur la dénomination.

### 2.2 Dressing

**Les deux, avec un critère de bascule dimensionnel.**

- **équipement** : un rangement, au minimum ;
- **zone** : un grand rangement sur mesure adapté aux dimensions d'une partie de
  la chambre est déjà une forme de dressing, **si la profondeur minimale est
  atteinte** ;
- **annexe** : quand il remplit une pièce annexe, c'est un vrai dressing.

Le critère de bascule est la **profondeur praticable** — celle qui permet
d'entrer plutôt que d'atteindre depuis l'extérieur. Valeur proposée `N3`, à
confirmer : 1,50 m pour un dressing à un seul linéaire (0,60 + 0,90 de
passage), 2,10 m pour deux linéaires en vis-à-vis (0,60 + 0,90 + 0,60). En
dessous, c'est une penderie.

### 2.3 Rangement

**Idéalement annexe d'une pièce, pièce autonome dans les grandes
configurations.**

Seuil retenu : **au-delà de 80 m² de logement**, un rangement peut émerger comme
pièce. En dessous, il reste une annexe rattachée à un hôte.

C'est le premier critère d'émergence portant sur la **surface totale du
logement** et non sur celle de la pièce hôte. Le mécanisme de `trigger` devra
pouvoir lire cette grandeur.

### 2.4 Bureau

**Même patron que le repas.** Fonction remplie par ses caractéristiques
minimales lorsqu'elle est intégrée à une autre pièce ; vraie pièce dédiée
lorsque la configuration le permet.

L'émergence est facilitée au-delà d'une certaine surface **et** lorsque les
critères des autres pièces requises sont remplis — c'est-à-dire jamais au
détriment d'une pièce obligatoire.

La convertibilité en chambre, proposée par le profil, devient une **conséquence
des surfaces d'équipements** et non un seuil hérité : une pièce accepte un
couchage si son enveloppe reçoit le programme minimal de la chambre. Le 9 m²
disparaît comme nombre et réapparaît comme résultat.

### 2.5 Rangement — l'homonymie, levée

Le mot désignait deux choses. Il en désigne désormais deux, **nommées** :

- l'**équipement** devient `étagère` — c'est le meuble, il porte la fonction
  rangement ;
- la **bande de surface cédée** devient un **zonage** : soit une zone d'une
  pièce possiblement émergente, soit une fonction *bonus* d'une pièce lorsque
  les conditions le permettent.

Conséquence immédiate : `TH2D-RANGEMENT-003`, qui annonce « chambre sans
rangement » en comptant des bandes et non des meubles, dit aujourd'hui autre
chose que ce qu'il paraît. Son message doit être réécrit avec le vocabulaire
ci-dessus.

---

## 3. Les quinze autres décisions

| # | Question | Décision |
|---|---|---|
| 6 | `sizeClass` : champ de donnée ou vocabulaire ? | **vocabulaire** — la gradation reste portée par `minRoomArea` et `from` |
| 7 | Minimum de circulation, 1,20 `HARD` contre 0,90 légal | **conditionner à la desserte** : 0,90 sous trois pièces, 1,20 au-delà. `degree()` existe déjà |
| 8 | Planchers de chambre confondus | **distinguer par variante** `enfant` / `parentale` |
| 9 | Trois seuils de séjour, 20 / 24 / 30 | **supprimer le 24** de `rules.js`, garder 20 comme plancher, documenter 30 comme seuil de zonage |
| 10 | Les huit plafonds `maxRatio` | **les poser en `N3` assumés** — un centile mesuré entérinerait le défaut |
| 11 | Abaisser le plancher du WC à ~1,05 m² | **non**, tant que `VAL-PMR-012` reste « à confirmer » |
| 12 | `minProgramSide` cuisine, 1,80 ou 1,85 | **1,85**, la valeur dérivée |
| 13 | Le 9 m² du bureau | **convertibilité, fonction des surfaces d'équipements** — voir §2.4 |
| 14 | L'ouvrant — porte, penderie, appareils, rangements | **à prendre en premier** parmi les mécanismes |
| 15 | Le passage gradué, deux niveaux ou trois | **trois** : 0,60 contournement · 0,90 traversant · 1,20 croisement |
| 16 | Le maximum de dégagement — conversation ≤ 3,00 m, triangle ≤ 6,50 m | **mécanisme**, pas renoncement |
| 17 | Le critère de qualité propre au profil | **oui** — une pièce peut apporter sa variable |
| 18 | La composition — absorption, relations inter-programmes, cache dédié | **le système d'un coup** : « une composition par fonction, pas une addition » |
| 19 | L'équipement lié — chevets, chaises | **différer** |

La décision 18 mérite d'être citée telle qu'elle a été rendue : **une
composition par fonction, pas une addition.** Elle généralise ce que les mesures
avaient montré au cas par cas — la salle d'eau recevant un lave-mains superflu,
la règle de composition se trompant dans les deux sens, la recherche aveugle à
la composition. Les trois défauts venaient de la même cause : le moteur
additionne des programmes au lieu de composer des fonctions.

---

## 4. Ce que ces décisions ouvrent

### 4.1 L'ordre de priorité d'émergence — non tranché

Si plusieurs fonctions sont candidates et que la surface ne suffit pas pour
toutes, laquelle émerge ? La condition « les pièces requises sont satisfaites »
départage les pièces obligatoires des fonctions bonus, mais pas les fonctions
bonus entre elles.

Ordre proposé, à valider — fondé sur la fréquence et le caractère collectif de
l'usage :

```text
repas  >  rangement  >  bureau  >  dressing
```

Sans cet ordre, l'émergence dépendrait de l'ordre d'itération du code, c'est-à-
dire du hasard.

### 4.2 Les profils sont à compléter

Les neuf profils décrivent des `ROOM_TYPE`. Le principe du §1 en fait des
**fonctions**. Chacun doit recevoir trois lignes de plus : sa fonction, son hôte
de repli, sa condition d'émergence. Cela concerne au premier chef le séjour, la
cuisine, le bureau et les rangements.

### 4.3 Le périmètre du lot L1 s'élargit

L'interpréteur de `trigger` devait lire `always`, `count` et `derived`. Il doit
désormais lire aussi une **condition d'émergence** — surface disponible,
satisfaction des pièces requises, priorité — et une condition portant sur la
**surface totale du logement** (§2.3). C'est plus que prévu, et cela mérite
d'être dit avant que le lot soit engagé.

**Depuis le 27 août**, ce lot L1 converge avec le lot **F2** de la roadmap
([`DOCTRINE.md`](DOCTRINE.md), `ROADMAP_HISTORIQUE.md` §6.2 bis) : l’interpréteur active
des **fonctions**, pas seulement des types de pièce déjà présents au socle.

### 4.4 Trois questions de séquence, reformulées et en attente

Elles portent sur l'ordre d'exécution, non sur le modèle. Voir la reformulation
dans `ROADMAP_HISTORIQUE.md` §6.1 et §9.5 ; elles restent à trancher.

---

## 5. Ce que ces décisions ne couvrent pas

- les deux questions de doctrine topologique — le séjour peut-il desservir une
  chambre, et le groupe jour / nuit est-il exprimable — qui relèvent du lot M3 ;
- les six points à instruire : champ d'application du CCH, qualification du
  cabinet d'aisances, définition de surface retenue, portée du décret décence,
  profils PMR, sourcing de la cuvette. Ce sont des recherches, pas des
  arbitrages.
