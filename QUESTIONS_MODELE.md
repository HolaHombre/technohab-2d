# Trente questions sur le modèle de règles

Questions ouvertes destinées à affiner, regrouper ou supprimer des règles, et
à améliorer l'efficience du moteur. Aucune n'appelle de réponse courte ;
plusieurs n'ont peut-être pas de réponse, et le dire serait déjà un résultat.

Elles portent sur le modèle décrit dans [`MODELE_DE_CALCUL.md`](MODELE_DE_CALCUL.md).

---

## I. Ce qu'est une règle

**1.** Qu'est-ce qui distingue une règle d'un calcul ? `TH2D-ROOM-002` ne
porte plus aucun seuil : elle demande à un solveur si le mobilier tient.
Est-ce encore une règle, ou une mesure à laquelle on a donné un identifiant ?

Réponse :pour l'heure, TH2D est un artéfact, pas une doctrine, c'est l'outil qui à incarné au mieux une idée en son temps. Ni plus nu moins

**2.** Une règle jamais violée sur 720 plans mérite-t-elle d'exister ? Que
mesure-t-elle alors — la qualité des plans, ou le fait que le générateur ne
sait pas produire ce cas ?

Réponse :Bonne question, on audit mais on garde cela en présente pour débug et log mais bonne question

**3.** Trois niveaux sont déclarés — bloquant, conseil, préférence. Le
troisième n'est lu par rien. Un niveau que personne n'interprète est-il un
niveau, ou une intention restée en commentaire ?

Réponse : préférence peut-il devenir impactant si on le lie aux éléments d'affinage de certains paramètres par l'intérface utilisateur ?


**4.** Une règle doit-elle savoir dire *pourquoi* elle échoue, ou suffit-il
qu'elle échoue ? Le coût d'un diagnostic est réel ; à partir de quand
devient-il obligatoire ?

Réponse : Oui toujours. rien n'est aléatoire, on identifie toujours la cause d'un blogague (et on l'audit). Cela devient obligatoire maintenant et pour tout les calculs. Ce sera le prix d'une maintenance saine. Le meilleure moyen, la seed reproduits les erreurs et permets de les analyser à posteriori (gain de perf à l'usage continu)



**5.** Une règle qui ne peut être ni satisfaite ni réfutée par le moteur
actuel — faute de murs, de portes, de hauteurs — appartient-elle au
référentiel du moteur, ou à celui du projet ?

Réponse : elle appartient au projet. Doit être flagé en gros pour identiifer la cause et la traiter. Cela ne doit pas être possible

---

## II. Redondance et regroupement

**6.** Combien des seize règles sont des corollaires d'une autre ?
`TH2D-GEOM-001` et `TH2D-ROOM-002` posent visiblement la même question ; y
en a-t-il d'autres qu'on n'a pas vues ?

Réponse :je n'en sais rien, il faudra les reprendre une à une via une série de question fermée cette fois.


**7.** Les quatre règles de circulation sont-elles quatre règles, ou une
seule vue sous quatre angles — largeur mini, largeur maxi, desserte,
proportion ? Que gagnerait-on à les fondre, que perdrait-on ?

Réponse : à priori une seule grande règle. On ne gagne rien à les fondre, on gagne à représenter fidèlement ce que peut être un espace de circulation. On perds dans cette fusion la lecture de la granularité des echecs si il y en à. C'est dommage.

**8.** Existe-t-il une règle mère dont les autres seraient des cas
particuliers ? La couverture complète sans chevauchement est-elle ce
candidat, ou un invariant d'une autre nature que les règles ?

Réponse : oui tu n'as pas tord, so tu penses cette règles nécessaire, on l'ajoute.


**9.** Peut-on dériver les règles de surface des règles de meublabilité, ou
faut-il l'inverse ? Les deux familles coexistent aujourd'hui sans qu'on
sache laquelle est fondatrice.

Réponse : les surfaces et la meublabilité sont la même chose. On traite juste cette data à deux moments disctincs.


**10.** Regrouper des règles améliore la lisibilité du rapport mais dégrade
la précision du diagnostic. Où passe le point d'équilibre, et dépend-il du
lecteur — concepteur ou habitant ?

Réponse : Le point d'équilibre et le rapport cout/gain entre la fluidité et la fiabilité du calcul et son audit pour les échecs.


---

## III. Seuils et calibration

**11.** Comment sait-on qu'un seuil est *juste*, et non seulement plausible ?
Quelle expérience distinguerait 0,28 d'un rapport de forme de 0,32 ?

Réponse : j'en sais rien. Pourquoi cette différenciation existe au juste ?


**12.** Un seuil devrait-il être une valeur ou une fonction du contexte ? Une
chambre de 9 m² dans un studio et dans une maison de 200 m² posent-elles la
même question ?

Réponse : les seuils doivent dépendre du contexte, absolument. D'ailleurs, on aura pour chantier de les définirs (type de classe des maisons en somme) pour flécher les modifications et objectifs


**13.** Comment calibrer des poids qui n'ont pas d'unité commune ? 110 pour
une adjacence manquante et 95 pour une pièce non meublable : ce rapport
dit-il quelque chose, ou n'est-il qu'un ordre de grandeur hérité ?

Réponse : Réponse : j'en sais rien. A quoi servent ces poids au juste ?


**14.** Faut-il des seuils dégradés plutôt que binaires ? Une pièce à 8,9 m²
et une à 3 m² violent la même règle avec la même force.

Réponse : as tu une proposition à faire ?


**15.** Un seuil trop sévère est-il plus coûteux qu'un seuil trop laxiste ?
Le premier rejette des plans valides, le second en laisse passer de mauvais —
lequel nuit le plus à un outil de conception ?

Réponse : idéalement 50/50. L'équilibre entre les deux est à chercher


---

## IV. Convention et calcul

**16.** Quelles conventions restantes cachent un calcul qu'on n'a pas su
faire ? Chaque ligne marquée `convention` est suspecte par construction.

Réponse : j'en sais rien. Pourquoi cette notion de convention existe au juste ?



**17.** Le poids d'une pièce dans la répartition — 4,5 pour le séjour, 0,55
pour le WC — pourrait-il se déduire de ses équipements plutôt que d'être
décrété ?

Réponse : Brillant, c'est une excellente idée !!


**18.** La surface minimale d'une pièce est-elle encore nécessaire une fois
la meublabilité calculée ? Ou reste-t-elle utile comme raccourci bon marché
avant un calcul coûteux ?

Réponse : elle reste le racourci bon marché d'un calcul couteux.

**19.** Qu'est-ce qui, dans ce modèle, doit rester une convention assumée
parce qu'aucun calcul ne le décidera jamais — le confort, l'usage, le goût ?

Réponse : confort, gout, qualité. Usage sera mesurable à terme


**20.** Une valeur sourcée est-elle meilleure qu'une valeur calculée ? Le
socle calcule des minimums que ne prévoit aucun texte ; qui l'emporte en cas
de désaccord ?

Réponse : Source d'abord, valeur calculée en second ?

---

## V. Conflits et impossibilité

**21.** Que faire quand deux règles bloquantes s'excluent mutuellement ?
Existe-t-il une hiérarchie, et sur quoi la fonder ?

Réponse : On compile juste les deux erreurs. On verra la notion de hiérarchie mais inutile à ce stade


**22.** Certaines combinaisons de programme sont-elles intrinsèquement
insatisfiables, et sait-on les reconnaître **avant** de générer ? Le cas à
35 m² saturé à 99,8 % suggère que oui, au moins parfois.

Réponse : oui probablement, la classification des logements et la vérification des règles usuelles seront un moyen de les identifier.


**23.** Qui l'emporte entre conformité et confort ? Un plan strictement
conforme et désagréable vaut-il mieux qu'un plan agréable en défaut sur un
conseil ?

Réponse : conformité, toujours.


**24.** Un refus doit-il désigner la règle enfreinte, ou ce qu'il faudrait
changer pour ne plus l'enfreindre ? Les deux ne se déduisent pas l'un de
l'autre.

Réponse : D'abord la règle enfreinte et ensuite ce qu'il faudrait changer.


---

## VI. Générer ou vérifier

**25.** Quelles règles gagneraient à devenir des contraintes de génération
plutôt que des contrôles ? La question est mesurable : celles dont le taux
d'échec ne descend pas avec le budget.

Réponse : on se garde cette question et on l'inclus au travail de réfléxion.


**26.** Une règle garantie par construction doit-elle rester évaluée ? Le
découpage en guillotine ne produit que des angles droits ; faut-il continuer
de vérifier qu'il n'y a pas d'angle aigu ?

Réponse : Non, on allège et garde le nécessaire. Pas de travail inutile. mais on s'assure de ne supprimer que des fonctions complètement obsolète pour le moteur


**27.** Le coût de vérifier vaut-il toujours moins que celui de garantir ?
Le placement du mobilier suggère le contraire : garantir aurait été moins
cher que d'essayer puis constater.

Réponse : ok, on part pour garantir en priorité. Vérifier est arbitraire en ressource du coup ?


---

## VII. Validité et mesure

**28.** Contre quoi valider le modèle ? Existe-t-il un corpus de plans réels
sur lequel mesurer un taux d'accord, et que signifierait un désaccord —
défaut du modèle, ou défaut du plan réel ?

Réponse : On verra en deux temps : 1) c'est moi qui évalue ce qui marche ou pas. 2) dans un second temps on fera du ML mais on à le temps.


**29.** Qu'est-ce qu'un bon plan, mesurablement ? Tant que la réponse
n'existe pas, toute optimisation ne fait qu'obéir aux règles qu'on s'est
données, ce qui est circulaire.

Réponse : Le combo final, un plan réaliste, réalisable, et complet en donnée.


**30.** Si l'on repartait de zéro avec ce qu'on sait aujourd'hui, quelles
règles n'écrirait-on pas ? C'est la seule question qui puisse faire
*diminuer* le référentiel, et aucune des vingt-neuf autres ne le peut.

Réponse : Je dirais qu'on passerai plus de temps sur le meilleure moyen de théoriser le problème et d'apporter une solution pertinante et optimisé. 


---

## Comment s'en servir

Trois usages, par ordre de rendement.

**Trier avant d'approfondir.** Plusieurs de ces questions se répondent par
une mesure sur le banc existant — les 6, 25 et 26 notamment. Les traiter
d'abord évite de théoriser ce qu'un relevé tranche.

**Chercher les suppressions autant que les ajouts.** Un référentiel se juge
autant à ce qu'il refuse d'accueillir qu'à ce qu'il couvre. Les questions 2,
6, 26 et 30 vont dans ce sens, et ce sont les moins spontanément posées.

**Distinguer ce qui se décide de ce qui se mesure.** Les questions 19, 23 et
29 n'ont pas de réponse technique : elles engagent une position sur ce
qu'est un bon logement. Les traiter comme des problèmes de calcul les rendrait
insolubles ; les assumer comme des choix les rend traitables.
