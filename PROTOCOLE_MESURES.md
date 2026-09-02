# Protocole des quatre mesures — pré-enregistrement

**Chantier 6 §6.2. Écrit le 19 août 2026, avant toute mesure.**

Ce document fixe les critères *avant* de mesurer. C'est sa seule raison
d'être. Un seuil choisi après coup se règle sur le résultat qu'on espérait,
et une mesure dont on ajuste la règle de lecture ne mesure plus rien.

Toute modification postérieure à la première mesure doit être **datée et
justifiée en fin de document**, sans réécrire ce qui précède.

---

## Ce que ces mesures existent pour corriger

Le banc (`scripts/scan-capacites.mjs`) mesure conformité, diversité,
meublabilité, écart de surface et durée. Aucune de ces grandeurs ne décrit ce
qu'un habitant ressent devant un plan. Deux angles morts, déjà nommés au
§6.1 de la roadmap :

- `TH2D-ROOM-002` dit **meublable**, pas **agréable** ;
- la diversité comptée en signatures mesure la **variation**, pas la
  **qualité**.

Le banc reste le témoin de la conformité. Il ne devient pas juge de la
qualité, et il n'est pas modifié pour prétendre l'être.

---

## Mesure 1 — Discrimination à l'aveugle

**La seule qui ne se triche pas.** C'est elle qui conditionne l'ouverture de
la phase 12 b (chantier 7).

### Dispositif

- **20 plans** : 10 produits par le moteur, 10 dessinés par des humains, de
  même surface (± 5 %) et même programme.
- **5 juges**, dont 2 architectes si le recrutement le permet. Chaque juge
  voit les 20 plans, dans un ordre tiré au sort et différent pour chacun.
- Consigne unique : *« ce plan a-t-il été dessiné par une personne ou produit
  par un programme ? »* Réponse forcée, pas de « je ne sais pas ».

### Le piège à neutraliser, et il est décisif

Si les plans générés arrivent en SVG TechnoHab et les plans humains en scan
de plan d'architecte, **les juges discriminent le trait, pas le plan**. La
mesure serait alors sans valeur, et elle aurait l'air d'avoir marché.

Les 10 plans humains sont donc **redessinés dans le rendu du moteur**, par le
même chemin : `assemblerPlan()` puis export SVG. Aucun label de pièce
n'est retouché, aucune cote n'est arrondie différemment. Ce chemin existe
déjà — c'est celui du test de l'instrument (§6.3).

### Sélection, fixée d'avance

- Les 10 graines des plans générés sont **tirées et écrites avant** de
  regarder les plans qu'elles produisent. Aucun rejet, aucun remplacement :
  choisir les plus jolis mesurerait le trieur, pas le moteur.
- Les plans humains proviennent de sources publiées, identifiées dans le
  fichier de mesure, et sont choisis avant d'avoir vu les plans générés.

### Lecture, pré-spécifiée

- **Taux de confusion** = part des 50 jugements portant sur des plans
  *générés* qui les déclarent dessinés par une personne. 50 % = indiscernable.
- **Taux symétrique de contrôle** = part des 50 jugements portant sur des
  plans *humains* qui les déclarent produits par un programme. S'il approche
  lui aussi 50 %, les juges devinent : la mesure est nulle et non avenue,
  quel que soit le taux de confusion. Ce contrôle n'est pas facultatif.

### Décision, arrêtée avant la mesure

| Taux de confusion | Conséquence |
|---|---|
| **≥ 25 %** | la phase 12 b s'ouvre |
| 10 – 25 % | la phase 12 b reste fermée ; les défauts les plus cités par les juges deviennent le chantier suivant |
| **< 10 %** | les plans sont immédiatement reconnaissables ; ajouter sept types de pièces ne ferait que multiplier ce qui les trahit |

**Règle d'arrêt** : une seule passe. Pas de seconde série de juges parce que
la première a mal tourné. Une mesure refaite jusqu'à convenir n'est plus une
mesure.

**Ce que cette mesure ne dit pas** : qu'un plan est bon. Un plan
indiscernable d'un plan humain médiocre est indiscernable.

---

## Mesure 2 — Préférence par paires

Plus stable qu'une note absolue, et elle donne une courbe entre versions —
c'est ce qui en fait l'instrument de suivi du moteur.

- **Dispositif** : un plan généré contre un plan de référence, même
  programme, présentés deux à deux. Question unique : *« dans lequel
  préféreriez-vous vivre ? »*
- **Volume** : 20 paires minimum par version comparée.
- **Lecture** : pourcentage de victoires du plan généré, avec son intervalle
  de confiance à 95 %. Un pourcentage sans intervalle sur 20 paires est un
  chiffre décoratif.
- **Décision** : aucune conclusion tirée d'une version isolée. Ce qui compte
  est le **sens de la variation** entre deux versions du moteur, chacune
  mesurée sur les mêmes paires.
- **Rattachement obligatoire** : chaque comparaison porte la version du
  moteur. Deux séries mesurées sur des versions différentes ne se comparent
  pas — c'est la même raison qui impose `versionMoteur` au journal du §6.4.

---

## Mesure 3 — Conservation

Observe un **comportement** au lieu de demander un avis. C'est sa force :
personne ne sauvegarde un plan par politesse.

- **Signaux** : plan exporté (JSON ou SVG), graine rejouée depuis le journal
  des générations, plan montré à quelqu'un.
- **Ce qui est déjà instrumenté** : l'export et le rejeu de graine passent
  par l'interface, donc sont observables sans rien ajouter.
- **Ce qui ne l'est pas, et le restera** : « montré à quelqu'un » ne
  s'instrumente pas sans traçage. Le projet interdit toute collecte externe ;
  ce signal se recueille en le demandant, ou pas du tout.
- **Lecture** : taux de conservation = plans exportés ou rejoués / plans
  générés, par session.
- **Réserve à porter avec le chiffre** : sur un outil qu'on développe
  soi-même, on exporte pour déboguer autant que par intérêt. Ce taux n'est
  interprétable que sur des sessions d'utilisateurs qui ne développent pas le
  moteur.

---

## Mesure 4 — Surprise utile

**Définition opérationnelle de l'inspiration retenue par le projet** : un
plan est inspirant quand la réponse est *non* à « y auriez-vous pensé ? » et
*oui* à « y habiteriez-vous ? ». Les deux questions séparées sont
indispensables : chacune seule ne mesure rien de tel.

- **Recueil** : le quiz embarqué du §6.4, déjà en place.
- **Lecture** : part des avis répondant *non* / *oui*, calculée par
  `scripts/correlation-avis.mjs`.
- **Les trois autres combinaisons ont chacune un sens**, et il faut les lire :

| y auriez-vous pensé | y habiteriez-vous | lecture |
|---|---|---|
| non | oui | **inspirant** — l'objectif |
| oui | oui | correct et attendu — le moteur fait le travail, sans surprendre |
| non | non | bizarre — la nouveauté n'est pas de la qualité |
| oui | non | mauvais et prévisible — le pire cas |

- **Biais, à rappeler à chaque usage** : ce quiz est rempli par qui développe
  le moteur, ou par des proches. Ce n'est **pas** une mesure à l'aveugle. Il
  donne une tendance longitudinale — est-ce que ça s'améliore ? — pas une
  vérité sur la qualité. La mesure 1 étalonne, celle-ci suit. L'avertissement
  voyage dans le fichier exporté pour qu'une relecture tardive ne s'y trompe
  pas.

---

## Ordre et dépendances

1. **Test de l'instrument (§6.3)** — fait le 19 août 2026. Il valide l'outil
   avec lequel les mesures suivantes sont pilotées, et il a immédiatement
   servi : voir `SUIVI_REGLES_PIECES.md`.
2. **Mesure 1** — conditionne la phase 12 b.
3. **Mesures 2, 3, 4** — continues, sans effet de seuil sur la roadmap.

Les mesures 2 à 4 peuvent commencer à tout moment ; aucune ne remplace la
mesure 1, et aucune n'ouvre la phase 12 b à sa place.

---

## Modifications postérieures

*Aucune à ce jour. Toute entrée ici doit porter sa date et sa raison.*
