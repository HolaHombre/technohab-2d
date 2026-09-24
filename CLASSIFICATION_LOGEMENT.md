# Classification des logements — et rendre la qualité mesurable

**Ouvert le 24 septembre 2026**, en réponse à `DECISIONS_REGLES.md` décision 8
(seuils contextuels) et aux questions 12 et 22 de `QUESTIONS_MODELE.md`,
toutes deux répondues « ce sera un chantier » plutôt que tranchées sur le
moment.

## 1. Ce que ce chantier peut honnêtement livrer aujourd'hui

Deux choses très différentes se cachent derrière la demande, et les
confondre serait le premier défaut à éviter :

1. **Classer un logement** — lui donner un type (T1 à T6) et une bande de
   taille. C'est mécanique, ça se code, ça se vérifie.
2. **Étalonner un poids N3** — savoir si `VAL-SCORE-SERVICES-DISTANCE-EXCESS-WEIGHT-001`
   vaut vraiment 10 points par mètre plutôt que 6 ou 20. Ça demande un
   jugement humain sur des plans, et `PROTOCOLE_MESURES.md` le dit sans
   détour : ses quatre mesures exigent toutes un humain — cinq juges
   architectes, des plans dessinés à la main, ou une personne qui remplit un
   quiz devant un plan.

Ce document construit la **classification** (§2) et **l'instrumentation qui
recueillera l'étalonnage** (§3) — le tuyau, pas l'eau qui doit y couler. Le
jugement lui-même n'est pas un livrable de code.

## 2. La classification

### 2.1 Typologie T1–T6 — sourcée, sans risque

`DECISIONS_REGLES.md` décision 8 a coché deux options à la fois, chose rare :
classes de logement **et** typologie T1–T6 « alignée sur les statistiques
publiées ». La seconde ne s'invente pas — c'est la convention immobilière
française standard, un nombre de pièces principales :

| Typologie | Chambres | Déjà couvert par |
|---|---:|---|
| T1 | 0 | `bedrooms === 0`, déjà la condition du studio dans `TYPOLOGIES_LOGEMENT` |
| T2 | 1 | — |
| T3 | 2 | — |
| T4 | 3 | — |
| T5 | 4 | — |
| T6 | 5 | plafond déjà imposé par `normalizeOptions` (`Math.min(5, …)`) |

`T = bedrooms + 1` couvre exactement la plage 0–5 déjà bornée par le
moteur : ce n'est pas une coïncidence, c'est la même donnée vue par deux
bouts. Source : `professional`, convention d'usage du secteur (décret
n° 87-713, et l'usage notarial qui s'y aligne), pas une invention du projet.

### 2.2 Classe de taille — provisoire, et il faut le dire

`DATASOURCE_EQUIPEMENTS.md` a déjà tenté de sourcer des bandes de surface et
s'est arrêté : « les documenter vides est préférable à les remplir de
moyennes non sourcées ». Ce chantier ne contredit pas cette prudence — il
propose des bandes **explicitement conventionnelles**, à étalonner comme
tout le reste :

| Classe | Surface | Statut |
|---|---|---|
| Petit | 35–55 m² | convention N3 ; 35 m² est déjà le plancher du moteur (`normalizeOptions`), pas une convention en soi |
| Moyen | 55–90 m² | convention N3 |
| Grand | 90–140 m² | convention N3 |
| Très grand | ≥ 140 m² | convention N3 ; 250 m² est déjà le plafond du moteur |

Aucune de ces bandes ne pilote encore un seuil de PONDERATION. Les faire
piloter un poids serait fabriquer la Table B/C que `DATASOURCE_EQUIPEMENTS.md`
refuse déjà de fabriquer. La classification est publiée sur le plan ;
**rien n'en dépend encore**.

### 2.3 Ce que ça débloque, et ce que ça ne débloque pas encore

- **Débloqué** : un plan porte désormais son type et sa classe, lisibles à
  l'export. C'est la donnée que la question 22 réclamait pour instruire, un
  jour, la détection d'un programme insatisfiable avant génération — ce
  chantier-là reste à ouvrir, il a besoin de sa propre mesure sur plusieurs
  configurations, pas d'une déduction depuis la classe seule.
- **Non débloqué** : aucun poids de `PONDERATION_AGENCEMENT.md` ne varie
  encore par classe. Ce serait le pas suivant, et il attend la Table B/C.

## 3. Rendre la qualité mesurable — l'instrumentation, pas la mesure

Aujourd'hui, `assets/evaluation.js` n'enregistre que `plan.score`, le total.
Aucune trace du détail par critère, ni de la priorité choisie. Un avis donné
sur un plan ne peut donc jamais dire *lequel* des 61 poids `PROVISIONAL`
comptait dans ce cas précis — seulement si le total, en bloc, corrèle.

**Ajouté** : `scoreBreakdown`, `options.priorities` et la classification du
§2 rejoignent chaque entrée du journal. `scripts/correlation-avis.mjs`
apprend à corréler *par critère* quand le volume le permet, avec la même
garde que l'existant — aucune conclusion sous le seuil de plans nécessaire.

**Ce que ça ne fait pas** : remplir le journal. Les 61 valeurs
`PROVISIONAL` de `assets/canonical-values.data.js` restent à étalonner par
un jugement humain — celui de Théo via le quiz embarqué (mesure 4, biaisée
mais immédiate), ou celui de juges recrutés (mesure 1, à l'aveugle, seule
non biaisée, non recrutée à ce jour). Ce document construit le tuyau ; le
remplir n'est pas un choix de code.

## 4. Ce que ce chantier ne tranche pas

- La détection d'impossibilité avant génération (question 22, second usage
  de la classification) — chantier séparé, sa propre mesure.
- Toute valeur de Table B ou C — restent explicitement non sourcées.
- Le recrutement des cinq juges de la mesure 1 — décision humaine, pas de
  code.
