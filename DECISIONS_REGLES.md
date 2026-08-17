# Quinze décisions sur les règles

Questions fermées, issues des réponses à [`QUESTIONS_MODELE.md`](QUESTIONS_MODELE.md).
Chacune tranche un point du référentiel décrit dans
[`MODELE_DE_CALCUL.md`](MODELE_DE_CALCUL.md).

Cocher une option par question. Les conséquences annoncées sont réelles :
ce qui est coché sera implémenté tel quel.

---

## 1. Les quatre règles de circulation

Tu les vois comme une seule grande règle, en regrettant la perte de
granularité au diagnostic. Il existe une voie qui évite ce choix.

- [ ] **A. Fusionner en une règle unique.** Un seul verdict « circulation
  conforme ». Lisible, mais on perd de savoir *laquelle* des quatre
  conditions a échoué.
- [X] **B. Une règle mère, quatre sous-codes.** `TH2D-CIRC` échoue en
  désignant son sous-motif — largeur mini, largeur maxi, desserte,
  proportion. Une ligne au rapport, la granularité conservée.
- [ ] **C. Laisser les quatre séparées.** Statu quo.

*Recommandation : B. Elle donne exactement ce que tu décris — représenter
fidèlement ce qu'est un espace de circulation, sans perdre la lecture des
échecs.*

---

## 2. Les règles jamais violées

`TH2D-GRAPH-002` et `TH2D-RANGEMENT-002` n'ont jamais échoué sur 720 plans.
Tu veux les garder pour le débogage.

- [ ] **A. Garder telles quelles**, évaluées à chaque génération.
- [ ] **B. Garder, mais marquées `invariant`** — évaluées, et leur succès
  silencieux ; seul un échec apparaît, comme une alarme.
- [X] **C. Ne les évaluer qu'en mode diagnostic**, désactivées en usage
  courant pour économiser le calcul.

---

## 3. Le niveau « préférence »

Tu demandes s'il peut devenir agissant en le liant aux réglages de
l'interface. Oui, et c'est même son emploi naturel.

- [ ] **A. Le supprimer.** Deux niveaux suffisent : bloquant, conseil.
- [X] **B. En faire le niveau des priorités utilisateur.** Compact, lumière,
  économie deviennent des préférences pondérées, lues par le score et
  ajustables. Le niveau cesse d'être décoratif.
- [ ] **C. Le garder inerte** en attendant un usage.

*Recommandation : B. C'est la seule option qui réponde à ta question par
autre chose qu'un renoncement.*

---

## 4. Le diagnostic obligatoire

Tu l'imposes pour tout calcul, désormais, avec la graine comme moyen de
rejouer une erreur.

- [ ] **A. Toute règle qui échoue expose sa cause et l'écart mesuré.**
- [ ] **B. Idem, plus la graine et le questionnaire attachés à chaque
  échec**, pour rejouer sans rien noter à la main.
- [X] **C. Idem B, plus un journal des échecs exportable** pour analyse
  hors ligne.

*Le coût croît de A à C, mais reste faible : tout est déjà calculé, il
s'agit de ne plus le jeter.*

---

## 5. Les règles hors de portée du moteur

Tu dis : elles appartiennent au projet, doivent être signalées en grand, et
cela ne devrait pas être possible.

- [ ] **A. Interdire à la déclaration.** Une règle qui référence une notion
  absente du moteur — mur, porte, hauteur — refuse de se charger, et le dit
  au démarrage.
- [X] **B. Les tolérer, marquées `hors périmètre`**, jamais évaluées, mais
  listées à part pour mémoire.
- [ ] **C. Les déplacer dans le référentiel cible** et les retirer du moteur.

---

## 6. La règle mère

La couverture complète sans chevauchement. Elle existe déjà sous
`TH2D-RESERVE-001` mais n'est vérifiée que par la surface.

- [X] **A. La renforcer en invariant géométrique** : ni trou, ni
  chevauchement, vérifié sur les rectangles et non sur la somme des aires.
- [ ] **B. La garder telle quelle**, contrôle de surface seulement.
- [X] **C. La promouvoir en préalable** : un plan qui la viole n'est même
  pas évalué par les autres règles, car elles n'auraient plus de sens.

*Recommandation : A puis C. Un plan troué n'est pas un plan un peu faux,
c'est un plan qui n'existe pas.*

---

## 7. Surface et meublabilité

Tu dis que c'est la même donnée traitée à deux moments. Reste à décider
laquelle fait foi en cas de désaccord.

- [X] **A. La meublabilité fait foi.** La surface minimale devient un simple
  filtre bon marché, et son échec n'est plus un verdict mais un signal
  d'accélération.
- [ ] **B. Les deux font foi**, indépendamment. Statu quo.
- [ ] **C. La surface fait foi**, la meublabilité devient un conseil.

*Cohérent avec ta réponse 18 : le raccourci reste, mais il ne juge pas.*

---

## 8. Les seuils contextuels

Tu veux qu'ils dépendent du contexte, et évoques des classes de logement.

- [X] **A. Par classe de logement** — studio, petit, moyen, grand, très
  grand. Chaque classe porte ses seuils.
- [ ] **B. Par fonction continue de la surface.** Pas de classes, une
  interpolation.
- [X] **C. Par typologie T1–T6**, alignée sur les statistiques publiées.

*Les classes se documentent et s'expliquent ; une fonction continue est plus
juste mais indéfendable devant un utilisateur.*

---

## 9. Les poids déduits des équipements

Tu as retenu l'idée. Reste la formule.

- [ ] **A. Poids = surface des équipements requis + leurs zones d'usage.**
  Direct, entièrement dérivé du socle.
- [X] **B. Idem, majoré d'un coefficient d'agrément par type** — le séjour
  mérite plus que son mobilier strict.
- [ ] **C. Garder les poids décrétés** jusqu'à ce que le socle couvre tous
  les types.

*A supprime six conventions d'un coup. B en garde une par type, mais assumée
et nommée pour ce qu'elle est : de l'agrément, pas du besoin.*

---

## 10. Les seuils dégradés

Proposition détaillée : chaque violation porte un écart et une gravité,
gravité = écart / seuil.

- [ ] **A. Adopter la gravité**, afficher les violations triées par gravité
  décroissante.
- [X] **B. Idem, et pondérer le score par la gravité** plutôt que par un
  forfait.
- [ ] **C. Rester binaire.**

*B rend le score plus fin sans ajouter de convention : la gravité se déduit
du seuil déjà posé.*

---

## 11. Source contre calcul

Tu penches pour la source d'abord. Un cas concret : le socle exige 1,50 m
de large pour une chambre là où aucun texte ne l'impose.

- [ ] **A. La source l'emporte toujours.** Le calcul ne peut qu'ajouter là
  où le texte est muet, jamais contredire.
- [X] **B. La plus exigeante l'emporte**, quelle que soit son origine, avec
  mention de laquelle a tranché.
- [ ] **C. Le calcul l'emporte**, la source devient un plancher.

*B est le comportement réel aujourd'hui, sans l'avoir décidé. A est plus
défendable juridiquement, et plus permissif.*

---

## 12. Garantir plutôt que vérifier

Tu retiens garantir en priorité, et demandes si vérifier devient arbitraire
en ressources. Non : vérifier reste nécessaire, mais change de rôle.

- [X] **A. Garantir ce qu'on peut, vérifier le reste**, la vérification
  servant de filet et de preuve.
- [ ] **B. Garantir ce qu'on peut, et ne plus vérifier ce qui est garanti**
  — plus rapide, mais plus rien ne détecte une régression du garant.
- [X] **C. Tout vérifier**, y compris le garanti, en mode test seulement.

*Recommandation : A en usage courant, C au banc d'essai. Un garant non
vérifié se dérègle sans bruit.*

---

## 13. Alléger les règles garanties par construction

Tu veux alléger, en ne supprimant que le complètement obsolète.

- [ ] **A. Supprimer `TH2D-FORME-001`** — la parité des arêtes est garantie
  par la construction des décrochements.
- [X] **B. La déclasser en test** : vérifiée au banc, pas en production.
  *Retenu le 16 août : la garantie tient à la construction actuelle des
  décrochements et disparaîtrait avec un changement de méthode. Le filet
  coûte presque rien ; le retirer coûterait cher au mauvais moment.*
- [ ] **C. La garder.**

*Même question à reposer pour chaque règle dont le taux d'échec est nul
depuis sa création — c'est la liste de la question 2.*

---

## 14. Conformité contre confort

Tu tranches : conformité toujours. Reste à décider ce qu'on montre.

- [X] **A. Afficher le plan conforme**, en signalant l'inconfort en conseil.
- [ ] **B. Afficher les deux** quand ils diffèrent, et laisser choisir.
- [ ] **C. N'afficher que le conforme**, sans mention de l'alternative.

---

## 15. L'ordre d'un refus

Tu veux la règle enfreinte d'abord, puis ce qu'il faudrait changer.

- [ ] **A. Règle, puis suggestion textuelle** — « la chambre 2 est trop
  étroite ; élargissez-la de 30 cm ou retirez la penderie ».
- [X] **B. Règle, puis suggestion actionnable** — la même, avec un bouton
  qui applique le changement et régénère.
- [ ] **C. Règle seule.**

*B suppose que le moteur sache modifier un plan sans le régénérer, ce qu'il
ne sait pas faire aujourd'hui. À traiter comme un objectif, pas comme un
choix immédiat.*

---

## Ce que ces quinze décisions ne couvrent pas

Trois de tes réponses ouvrent des chantiers qui dépassent le référentiel et
ne se tranchent pas par une case à cocher.

**La classification des logements** (réponses 12 et 22). Elle conditionne
les seuils contextuels et la détection d'un programme insatisfiable avant
génération. C'est un chantier à part entière, à instruire avec des données.

**« Un plan réaliste, réalisable, complet en donnée »** (réponse 29). C'est
la seule définition de qualité dont dispose le projet. Les trois termes sont
justes et aucun n'est encore mesurable — les rendre mesurables vaut mieux
que d'ajouter des règles.

**Théoriser avant de coder** (réponse 30). C'est le regret exprimé, et il
porte sur la méthode plus que sur les règles. Le protocole de décision de
`APPROCHES_GENERATION.md` §8 est la réponse la plus directe qu'on ait à ce
regret : trancher la méthode de génération avant d'affiner davantage ce qui
la vérifie.
