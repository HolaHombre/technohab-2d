# Ouvertures en façade et parcours

Préparation de l'intégration des ouvertures — portes et baies — comme
élément validant d'un modèle, et du renforcement du cheminement qui doit les
desservir.

**Statut : étude, non implémenté.**

Documents liés : [`SOCLE_AGENCEMENT.md`](SOCLE_AGENCEMENT.md) (équipements et
placement), [`VEILLE_NORMATIVE.md`](VEILLE_NORMATIVE.md) (traçabilité des
cotes), [`ROADMAP.md`](ROADMAP.md) (pilotage).

---

## 1. Ce que la recherche apprend

Deux textes changent la conception plus qu'on ne l'attendait.

### La règle du sixième — surface vitrée

`VAL-OUV-001`, niveau N1, **à confirmer sur le texte** : la surface totale
des baies, mesurée en dimensions de dormant, doit atteindre au moins **un
sixième de la surface habitable**, soit environ 16,7 %. Posée par la RT 2012,
reprise sans modification par la RE 2020.

Conséquence pour le moteur : ce n'est **pas une règle par pièce mais une
règle de projet**. Un plan de 100 m² doit porter environ 16,7 m² de baies,
réparties. Le moteur peut donc la vérifier globalement dès qu'il sait
attribuer des baies à des façades, sans avoir à trancher pièce par pièce.

### L'aération impose une topologie

`VAL-OUV-002`, `REF-008`, arrêté du 24 mars 1982 : les entrées d'air se font
**dans toutes les pièces principales**, les sorties **dans les pièces de
service** — au minimum cuisine, salle d'eau et cabinet d'aisances. Et
surtout : *l'air doit pouvoir circuler librement des pièces principales vers
les pièces de service*.

C'est la trouvaille la plus utile de cette recherche. **La ventilation est
une contrainte de graphe, pas d'équipement.** Elle impose un second flux, de
sens opposé à celui des habitants : ceux-ci vont de l'entrée vers les pièces,
l'air va des pièces principales vers les pièces de service.

Le moteur possède déjà un graphe d'adjacences et va se doter d'un
cheminement. Le flux d'air se vérifie sur les mêmes structures — un parcours
de plus, pas un système de plus. Le détalonnage des portes, qui l'autorise
physiquement, relève de la coupe et non du plan : hors périmètre 2D, à noter
comme hypothèse.

### Conséquence croisée

Toute pièce principale doit toucher la façade — elle a besoin d'une entrée
d'air et d'un ouvrant. Les pièces de service, non : elles s'extraient par
conduit. **C'est une contrainte de placement, connue avant toute
géométrie fine**, et le moteur ne la vérifie pas aujourd'hui.

Elle explique aussi une règle du référentiel d'origine qu'on n'avait pas su
justifier : si les pièces d'eau se regroupent, c'est notamment parce que
leurs conduits d'extraction se mutualisent.

---

## 2. Modèle d'ouverture

Une ouverture est portée par un **segment de mur**, non par une pièce. Elle
relie deux côtés : deux pièces, ou une pièce et l'extérieur.

```js
{
  id: "opening_3",
  kind: "door" | "opening" | "window" | "french_window",
  between: ["living", "exterior"],
  wall: { x0: 2.4, y0: 0, x1: 3.3, y1: 0 },  // segment porteur
  width: 0.90,                                // largeur de baie
  clear: 0.83,                                // passage utile
  swing: { side: "living", angle: 90 } | null // null pour une baie
}
```

Deux exigences qui n'existent pas encore dans le moteur, et sans lesquelles
rien de tout cela ne peut s'écrire :

- **des segments de façade** portés par l'enveloppe, avec leur orientation ;
- **un nœud `exterior`** dans le graphe d'adjacences.

Ce sont les mêmes prérequis que ceux déjà notés au socle §7. Ils ne sont plus
seulement nécessaires à la règle d'entrée : ils le sont à toute la
vérification par ouvertures.

---

## 3. Le cheminement doit changer de nature

Le cheminement envisagé jusqu'ici cherchait un chemin. Ce n'est pas
suffisant : **un chemin est une ligne, et une ligne passe partout.**

Ce qu'il faut vérifier, c'est qu'un corps passe — donc qu'il existe un
couloir de largeur donnée, pas une trajectoire. La méthode est connue et peu
coûteuse : on **érode l'espace libre** de la moitié de la largeur exigée, et
on cherche un chemin dans ce qui reste. S'il en existe un, le passage réel
existe à pleine largeur ; s'il n'en existe pas, aucun chemin de cette
largeur n'existe. Le verdict devient une preuve au lieu d'une estimation.

C'est ce que recouvre l'exigence d'**atteindre chaque issue avec sa surface
de contact** : le parcours ne doit pas frôler une porte, il doit arriver
devant elle sur toute sa largeur utile.

L'espace libre à éroder est celui de l'enveloppe **moins** les emprises de
mobilier, **moins** les débattements de porte. Les zones d'usage, elles, ne
sont pas des obstacles : on les traverse, c'est même leur fonction.

### Le cheminement comme troisième couche d'affichage

Trois bascules indépendantes et superposables, dans cet ordre de tracé :

| Couche | Contenu | État |
|---|---|---|
| Pièces | contours, libellés, pictogrammes, rangements | toujours |
| Mobilier | emprises des équipements | bascule, faite |
| Parcours | espace libre érodé, chemins vers chaque pièce, issues | bascule, à faire |

Superposer mobilier et parcours est le cas le plus instructif : on voit
*pourquoi* un passage ne passe pas.

---

## 4. L'ordre de coopération

C'est la question la plus délicate, et elle a un piège : **les trois
systèmes sont mutuellement dépendants**, donc aucune passe unique ne peut
les satisfaire dans un ordre quelconque.

Le mobilier bloque les parcours. Les portes contraignent le mobilier par
leur débattement. Les parcours dépendent de la position des portes. Un ordre
naïf tourne en rond.

### Ce qui débloque : séparer contrainte et position

Toutes les décisions ne se valent pas. Certaines sont **connues tôt et
coûteuses à revenir**, d'autres **tardives et bon marché**. L'ordre juste
va des premières aux secondes.

| Rang | Décision | Pourquoi ici |
|---|---|---|
| 1 | **Façades et contacts** | Découle de l'enveloppe seule. Dit quelles pièces peuvent avoir un ouvrant, donc lesquelles peuvent être principales. Élague avant tout calcul. |
| 2 | **Portes entre pièces** | Servent le graphe d'adjacences, qui est le programme. Une porte mal placée invalide un parcours ; du mobilier mal placé se déplace. |
| 3 | **Baies en façade** | Contraintes par le sixième, réparties selon les pièces principales. Indépendantes des portes, donc parallélisables avec le rang 2. |
| 4 | **Mobilier** | Le solveur connaît alors les débattements et les allèges, et peut les traiter comme obstacles. |
| 5 | **Parcours, en vérification** | Ne place rien. Constate si l'espace libre érodé relie l'entrée à chaque pièce, et l'air des principales aux services. |

### L'ordre qui compte vraiment est celui des reculs

Le rang ci-dessus est l'ordre d'exécution. Le plus important est l'**ordre
dans lequel les contraintes cèdent** quand la vérification échoue — c'est
lui qui détermine si le moteur converge ou s'acharne.

Du moins cher au plus cher :

1. retirer un équipement facultatif ;
2. déplacer un équipement requis, ou le tourner ;
3. déplacer une porte le long de son mur ;
4. déplacer ou redimensionner une baie ;
5. changer le sens d'ouverture d'une porte ;
6. revenir à la géométrie des pièces — donc régénérer.

**Un principe à tenir** : ne jamais remonter d'un rang tant qu'un recul de
rang inférieur reste possible. Sans cette discipline, un mobilier mal posé
ferait régénérer tout le plan, et le moteur passerait son budget à refaire
ce qu'un déplacement de trente centimètres réglait.

### Ce que cela suppose du solveur

Le solveur de pose devra accepter des **obstacles préexistants** —
débattements, allèges — et non plus seulement un rectangle vide. C'est une
extension de signature, pas un changement de méthode : les obstacles se
traitent comme des emprises déjà placées.

---

## 5. Règles à prévoir

| Code | Règle | Niveau |
|---|---|---|
| `TH2D-OUV-001` | Toute pièce principale dispose d'un ouvrant sur l'extérieur | bloquant |
| `TH2D-OUV-002` | Surface totale de baies ≥ un sixième de la surface habitable | bloquant |
| `TH2D-OUV-003` | Toute ouverture est portée par un segment de mur réel, sans déborder | bloquant |
| `TH2D-OUV-004` | Le débattement d'une porte ne recouvre ni emprise ni autre débattement | bloquant |
| `TH2D-OUV-005` | Les baies sont réparties, non concentrées sur une seule façade | conseil |
| `TH2D-VENT-001` | Chaque pièce de service dispose d'une extraction | bloquant |
| `TH2D-VENT-002` | Un parcours d'air relie chaque pièce principale à une pièce de service | bloquant |
| `TH2D-PATH-001` | Chaque pièce est atteignable depuis l'entrée par un couloir à la largeur exigée, mobilier et débattements compris | bloquant |
| `TH2D-PATH-005` | Chaque issue est abordable sur toute sa largeur utile | bloquant |

`TH2D-PATH-001` reprend le code déjà réservé au socle §8, mais son sens
change : il ne s'agit plus d'un chemin mais d'un couloir.

---

## 6. Ce que cette étude ne tranche pas

**Le rapport à l'approche de génération.** Ce document décrit comment
vérifier des ouvertures, pas comment les faire naître. Si le moteur bascule
vers les typologies décrites dans `APPROCHES_GENERATION.md`, une typologie
porte ses ouvertures autant que sa disposition — et une partie de cette
étude deviendrait un contrôle plutôt qu'une génération. La décision de fond
sur la méthode devrait donc précéder l'implémentation d'ici.

**Le coût.** L'érosion de l'espace libre et la recherche de chemin sont peu
coûteuses à cette échelle, mais elles s'ajoutent à un placement de mobilier
déjà combinatoire, et la boucle de reculs du §4 les rejoue. Rien ne garantit
encore que l'ensemble tienne dans le budget d'une génération. À mesurer sur
les six types du MVP avant tout engagement.

**Les cotes.** `VAL-OUV-001` et `VAL-OUV-002` sont issues de sources
secondaires et de la lecture d'un article ; elles doivent être recontrôlées
sur les textes avant de fonder une règle bloquante. Le détalonnage des
portes, indispensable au flux d'air, ne se voit pas en plan : c'est une
hypothèse du modèle, à énoncer plutôt qu'à sous-entendre.

---

## Sources

- [Arrêté du 24 mars 1982 relatif à l'aération des logements](https://www.legifrance.gouv.fr/loda/id/JORFTEXT000000862344) — `REF-008`, article 1 et 2
- [Le Moniteur — la RT 2012 impose 17 % de baies vitrées par rapport à la surface habitable](https://www.lemoniteur.fr/article/la-rt-2012-impose-17-de-baies-vitrees-par-rapport-a-la-surface-habitable.1975391) — presse professionnelle, N2
- [Construires — calcul de la surface vitrée 1/6 (RT2012/RE2020)](https://www.construires.fr/surface-vitree-calcul-rt2012/) — source secondaire

La règle du sixième n'a **pas** été relevée sur le décret RE 2020 lui-même :
statut `à confirmer`. Les sources concordent, ce qui ne vaut pas lecture.
