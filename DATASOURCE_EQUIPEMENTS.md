# Sourcing des équipements et des dégagements

Adosse à des sources chaque cote employée par `assets/socle.data.js`, donc
par le solveur. Prolonge [`VEILLE_NORMATIVE.md`](VEILLE_NORMATIVE.md), qui
couvre les cotes réglementaires ; celui-ci couvre **le mobilier et les
dégagements d'usage**, qui n'en relèvent pas.

**Consulté le 15 août 2026.**

---

## 1. Le point à ne pas perdre de vue

**Aucune cote de ce document n'est opposable.** Le mobilier et
l'électroménager ne sont régis par aucun texte : ce sont des standards de
fabricants, des usages de conception et des habitudes de marché.

Cela ne les rend pas arbitraires — un lave-vaisselle fait 60 cm de large
partout en Europe, et ce fait est plus stable que bien des règlements. Mais
la nature de la source change ce qu'on peut en dire : *« c'est la dimension
du marché »*, jamais *« c'est la norme »*.

Trois niveaux, repris de la veille :

| Niveau | Nature | Opposable |
|---|---|---|
| **N1** | Réglementaire, consulté sur Légifrance | oui |
| **N2** | Norme publiée, standard de fait, conception | non, mais stable et vérifiable |
| **N3** | Convention TechnoHab | non |

Tout ce document est N2 ou N3.

### Corriger l'avertissement plutôt que le répéter

Dire « rien n'est opposable » et s'arrêter là est un constat, pas une
méthode. Trois leviers, du plus immédiat au plus structurant.

**1. Remplacer les sources marchandes par des normes publiées.** Il en
existe, et elles portent exactement sur ces cotes :

| Norme | Objet |
|---|---|
| **NF EN 1116** | Meubles de cuisine — dimensions de coordination entre meubles, plans de travail et appareils ménagers |
| **NF EN 1334** | Ameublement domestique — lits et matelas, méthodes de mesure et tolérances |

Ce sont de vraies normes européennes reprises par l'AFNOR, pas des pages
commerciales. Elles font passer les cotes de cuisine et de literie d'un
« usage constaté » à un « référentiel identifié ».

**Réserve immédiate** : ces normes sont payantes. Je les ai **identifiées,
pas lues**. D'où un quatrième statut, qui manquait :

| Statut | Sens |
|---|---|
| `norme identifiée` | Le bon référentiel est nommé, la valeur n'y a pas été relevée |

C'est un cran au-dessus de `non sourcé`, un cran en dessous de `vérifié`.
Le confondre avec `vérifié` reproduirait exactement le défaut qu'on cherche
à éviter.

**Enseignement utile de NF EN 1334** : les dimensions de literie sont
**nominales**, et le produit réel mesure environ 2 cm de moins — un
matelas annoncé 140 × 190 fait près de 138 × 188. Le socle dimensionne sur
le nominal, donc avec une marge : c'est le bon sens de l'erreur.

**2. Cesser d'affirmer — le levier structurel.** Dès lors que l'utilisateur
compose ses équipements et peut en modifier les cotes, TechnoHab n'a plus à
soutenir qu'un lit fait 140 × 190. Il dit : *vous avez déclaré 140 × 190,
voici ce qui entre*. L'outil devient un **calculateur sur des entrées
déclarées**, non une autorité sur les dimensions.

Cela **dissout** le problème au lieu de le documenter. Les valeurs du socle
redeviennent ce qu'elles auraient toujours dû être : des **valeurs par
défaut modifiables**, jamais des normes.

**3. Faire voyager le statut jusqu'à l'écran.** Une règle adossée à un texte
et une règle adossée à une convention ne peuvent pas tenir le même discours.
Le statut doit remonter au rapport et à l'export : un plan doit pouvoir dire
de quoi il a été calculé. C'est la condition pour que la matrice de contrôle
serve à quelque chose.

---

## 2. Literie

Le lit dimensionne la chambre : c'est l'équipement le plus structurant du
socle.

| Val | Équipement | Emprise | Niveau | Observation |
|---|---|---|---|---|
| `VAL-EQ-001` | Lit simple | 0,90 × 1,90 | N2 | standard une place |
| `VAL-EQ-002` | Lit double « historique » | 1,40 × 1,90 | N2 | dimension la plus vendue en France |
| `VAL-EQ-003` | Lit queen | 1,60 × 2,00 | N2 | en train de devenir le standard |
| `VAL-EQ-004` | Lit king | 1,80 × 2,00 | N2 | hors programme courant |

Deux constats de la recherche qui comptent pour le moteur.

**La longueur bascule de 1,90 à 2,00 m.** L'augmentation de la taille
moyenne pousse le marché vers 200 cm. Le socle retient 1,90 aujourd'hui ;
c'est défendable mais déjà daté, et une chambre dimensionnée au plus juste
sur 1,90 ne recevra pas un lit de 2,00.

**Le 160 × 200 supplante le 140 × 190** en chambre parentale. Le socle
dimensionne sur 140 × 190, donc **sous-estime la chambre parentale
d'environ 20 cm en largeur et 10 en longueur**.

Une tolérance de ±1 à 2 cm est admise sur ces dimensions.

**Décision proposée** : garder 140 × 190 comme minimum de dimensionnement,
mais exposer 160 × 200 comme variante de chambre parentale, puisque
l'utilisateur pourra composer ses équipements.

---

## 3. Électroménager et cuisine

| Val | Équipement | Emprise | Niveau | Observation |
|---|---|---|---|---|
| `VAL-EQ-010` | Largeur d'appareil encastrable | 0,60 | N2 | format de référence européen |
| `VAL-EQ-011` | Profondeur de niche | 0,55 | N2 | + ~2 cm de ventilation arrière |
| `VAL-EQ-012` | Profondeur de plan de travail | 0,60 | N2 | portée de bras d'un adulte |
| `VAL-EQ-013` | Hauteur de plan de travail | 0,90 à 0,93 | N2 | hors périmètre 2D |
| `VAL-EQ-014` | Four encastrable | 0,60 × 0,55 | N2 | 59-60 réels |
| `VAL-EQ-015` | Lave-vaisselle | 0,60 × 0,60 | N2 | 12 à 15 couverts |
| `VAL-EQ-016` | Réfrigérateur encastrable | 0,60 × 0,60 | N2 | aligné sur le plan de travail |

**Correction à porter au socle** : le réfrigérateur y figure à 0,65 m de
profondeur. Un appareil encastrable s'aligne sur le plan de travail, donc
0,60. La valeur actuelle surdimensionne la cuisine sans raison.

### Dégagements de cuisine

| Val | Grandeur | Valeur | Niveau |
|---|---|---|---|
| `VAL-EQ-020` | Passage devant un linéaire, minimum | 0,90 | N2 |
| `VAL-EQ-021` | Passage devant un linéaire, confort | 1,20 | N2 |
| `VAL-EQ-022` | Entre deux linéaires en vis-à-vis | 1,20 | N2 |

`VAL-EQ-022` confirme la valeur `facingClearance: 1.20` déjà retenue par le
socle — c'est la cote qui permet d'ouvrir une porte de four ou un
lave-vaisselle sans bloquer le passage.

---

## 4. Salle d'eau

| Val | Équipement | Emprise | Niveau | Observation |
|---|---|---|---|---|
| `VAL-EQ-030` | Baignoire droite | 1,70 × 0,70 | N2 | **42 % des ventes en France** |
| `VAL-EQ-031` | Receveur de douche, confort | 0,90 × 0,90 | N2 | minimum confortable |
| `VAL-EQ-032` | Receveur de douche, compact | 0,80 × 0,80 | N2 | admis en petite surface |
| `VAL-EQ-033` | Dégagement devant un lavabo | 1,10 | N2 | valeur de **confort**, pas un minimum |

`VAL-EQ-030` et `VAL-EQ-031` confirment exactement les cotes du socle.

**Nuance importante sur `VAL-EQ-033`.** Les 1,10 m relevés sont une valeur
de confort. Le socle retient 0,80, qui reste cohérent avec l'espace d'usage
réglementaire de 0,80 × 1,30 (`VAL-PMR-002`, N1). Garder 0,80 comme
minimum, et traiter 1,10 comme préférence — pas comme une correction.

---

## 5. Ce que la recherche n'a pas permis d'établir

Honnêteté sur les trous, qui restent nombreux.

| Cote du socle | Statut | Remarque |
|---|---|---|
| Penderie, profondeur 0,60 | non sourcé | cohérent avec une épaule sur cintre, mais non vérifié |
| Canapé 1,80 × 0,90 | non sourcé | très variable selon modèle ; convention défendable |
| Table basse 1,10 × 0,60 | non sourcé | aucun standard |
| Meuble bas 1,20 × 0,40 | non sourcé | longueur de convention (`MODULE`) |
| Table 4 places 1,40 × 0,80 | non sourcé | valeur d'usage courante |
| Dégagement de 0,80 autour d'une table | non sourcé | doit couvrir le recul de chaise |
| Cuvette de WC 0,40 × 0,70 | non sourcé | à recouper |
| Étagères, profondeur 0,45 | non sourcé | convention |
| Emplacement véhicule 2,50 × 5,00 | non sourcé | souvent cité, jamais vérifié ici |
| `MODULE = 1,20` | **convention N3** | longueur retenue pour les linéaires libres |

Les longueurs marquées `assumed` dans `socle.data.js` sont des conventions
assumées : le socle ne fixe pas la longueur d'une penderie ou d'un meuble
bas, qui dépendent de la pièce.

---

## 6. Les trois tables demandées

Le cadrage retenu sépare ce qui ne dépend pas de la taille du logement de
ce qui en dépend. La confusion des deux est ce qui rendait la recherche
initiale mal posée.

### Table A — minimums absolus, **déduits et non relevés**

Ils ne dépendent pas de la surface du logement mais du contenu de la pièce.
Ils sont **calculés** par le solveur à partir des équipements et de leurs
dégagements — il n'y a donc rien à chercher, et surtout rien à inventer.
C'est déjà ce que produit `fit.data.js`.

### Table B — fourchettes usuelles par bande de surface

Ce qui varie réellement avec la taille du logement : la surface *typique*
d'une pièce, pas son minimum. **Non renseignée à ce jour** — les données
publiées sont organisées par typologie T1–T6 et non par tranche de surface,
et rien de fiable n'a été relevé dans cette passe.

### Table C — composition de programme par bande

Quelles pièces apparaissent à partir de quelle taille : pas de circulation
sous quatre pièces, buanderie et cellier au-delà d'un certain seuil, second
sanitaire, bureau. **Non renseignée à ce jour**, et c'est celle qui manque
le plus au moteur : c'est elle qui devrait piloter `buildProgram`, aujourd'hui
gouverné par des seuils écrits à la main.

**Les tables B et C restent à faire.** Les documenter vides est préférable
à les remplir de moyennes non sourcées.

---

## 7. Corrections à porter au code

1. `fridge.footprint.d` : 0,65 → **0,60** (`VAL-EQ-016`).
2. Ajouter la variante `bed_160` en 1,60 × 2,00 (`VAL-EQ-003`), le marché
   ayant basculé.
3. Porter chaque cote de `socle.data.js` avec son identifiant `VAL-EQ-xxx`,
   pour que la matrice de contrôle puisse remonter du refus à la source.
4. Documenter dans le fichier que le dégagement de lavabo à 0,80 est un
   minimum, 1,10 étant la valeur de confort.

---

## 8. Conséquence architecturale — le solveur passe dans le navigateur

> **Fait le 15 août 2026.** `assets/placement.js` est le solveur de pose
> exécuté au navigateur. `assets/socle.data.js` porte les équipements, et les
> deux sont chargés **à la demande** par `TechnoHabSocleLoader.charger()` —
> ils ne pèsent que sur les visites qui s'en servent. Le mobilier est dessiné
> sur le plan sous bascule, emprises seules. Le reste de la section décrit la
> décision et garde sa valeur de justification.

Dès lors qu'une pièce se compose librement — une pièce vide à laquelle on
ajoute deux lits, une armoire, un lave-linge — **il n'y a plus de types à
précalculer**. La combinatoire des jeux d'équipements possibles est ouverte.

`fit.data.js` ne peut donc plus rester une table précalculée hors ligne : il
doit devenir un **moteur exécuté à la génération**, prenant en entrée une
liste d'équipements et un rectangle, et rendant un verdict.

Le calcul reste petit — poser trois à huit rectangles avec dégagements dans
un rectangle — et tient largement dans le budget de génération actuel.

### Le travail hors ligne n'est pas perdu, il change de rôle

Le solveur exhaustif de `build-envelopes.mjs` ne devient pas obsolète : il
cesse d'être **l'autorité** pour devenir **le vérificateur**. C'est un
meilleur emploi.

| | Avant | Après |
|---|---|---|
| Solveur navigateur | n'existe pas | **fait autorité**, sur les équipements réels |
| `build-envelopes.mjs` | produit la table | produit l'**oracle de test** et le cache |
| `fit.data.js` | table de vérité | **cache chaud** des préréglages |

Trois bénéfices concrets.

**Un oracle de non-régression.** Le calcul hors ligne, exhaustif et avec
retour arrière, est plus fiable qu'un solveur en ligne écrit pour la
vitesse. Le faire tourner sur les treize préréglages et exiger que le
solveur navigateur rende les mêmes verdicts donne au projet **la suite de
tests qu'il n'a jamais eue** — celle que l'audit réclame depuis le début.

**Un chemin courant instantané.** Les préréglages restent servis par la
table ; seule une pièce composée à la main déclenche le calcul.

**Une seule algorithmique.** Condition pour que l'oracle ait un sens : les
deux runners doivent partager le **même code de résolution**, extrait dans
un module sans dépendance, exécutable en Node comme dans le navigateur. Deux
implémentations parallèles divergeraient, et le test ne vérifierait plus
rien.

### Ordre de travail proposé

1. Extraire l'algorithme de placement dans un module commun.
2. Faire consommer ce module par `build-envelopes.mjs`, sans changer sa
   sortie — la table produite doit rester identique, ce qui prouve
   l'extraction.
3. Exposer le même module au navigateur, pour les jeux d'équipements libres.
4. Ajouter la comparaison table / solveur en ligne comme test.
5. Alors seulement, ouvrir la composition libre dans l'interface.

L'étape 2 est celle qui sécurise tout le reste : tant que la table produite
est inchangée, on sait que l'extraction n'a rien cassé.

---

## Sources

**Literie** — [Les Matelas, dimensions des lits en France](https://www.les-matelas.fr/dimensions-lit/) · [Kipli, guide des tailles](https://kipli.com/fr/guide/literie/quelle-taille-lit-choisir/) · [Dodo, taille de lit](https://www.dodo.fr/blog/taille-de-lit-quelles-dimensions-choisir.html)

**Électroménager** — [MediaMarkt, niches et dimensions d'appareils encastrables](https://www.mediamarkt.be/fr/content/cuisine/dimensions-appareils-encastrables) · [Haier Europe, dimensions des fours encastrables](https://www.haier-europe.com/fr_FR/blogs/news/guide-des-dimensions-pour-fours-encastrables)

**Cuisine** — [Veneta Cucine, dimensions standard pour une cuisine](https://venetacucine.fr/dimensions-standard-pour-une-cuisine/) · [Micado, plan de travail dimensions](https://micado-france.fr/plan-de-travail-de-cuisine-dimensions-materiaux/)

**Salle d'eau** — [Atelier Colette, taille standard d'une baignoire](https://www.atelier-colette.fr/dimensions-standard-baignoire/) · [Batinea, quelle taille de receveur de douche](https://www.batinea.com/quel-est-bonne-taille-receveur-de-douche) · [Sawiday, quelle surface pour la salle de bain](https://www.sawiday.fr/conseil/astuces/quelle-surface-pour-la-salle-de-bain/)

**Normes identifiées, non lues** — [NF EN 1116, meubles de cuisine, dimensions de coordination](https://norminfo.afnor.org/norme/nf-en-1116/ameublement-meubles-de-cuisine-dimensions-de-coordination-pour-meubles-de-cuisine-et-appareils-menagers/114616) · [NF EN 1334, lits et matelas, méthodes de mesure et tolérances](https://norminfo.afnor.org/norme/nf-en-1334/ameublement-domestique-lits-et-matelas-methode-de-mesure-et-tolerances-recommandees/101110)

Les sources marchandes ci-dessus restent utiles pour connaître l'usage réel
du marché, mais elles ne sont pas des textes normatifs et ne doivent jamais
être présentées comme tels. Les deux normes AFNOR sont le référentiel à
consulter pour passer les cotes de cuisine et de literie en statut
`vérifié` — elles sont payantes, et cette consultation reste à faire.
