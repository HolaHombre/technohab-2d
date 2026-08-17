# Suivi du développement des règles par pièce

État consolidé du moteur Wonderland au **18 août 2026**. Ce document distingue
quatre niveaux qui ne doivent plus être confondus : fiche documentaire,
équipements du socle, génération effective et règle évaluée en production.

## Légende

- **Couvert** : généré, équipé et contrôlé par le moteur.
- **Partiel** : une partie de la chaîne existe, mais il manque une règle ou une
  capacité structurante.
- **Socle seul** : équipements et exigences disponibles, pièce non générée.
- **Absent** : ni fiche dédiée ni prise en charge complète.

## État global

- **6 types générés** : séjour, chambre, salle d'eau, WC, cuisine, circulation.
- **13 types décrits dans le socle** : les 6 précédents, plus salle à manger,
  entrée, bureau, buanderie, cellier, local technique et garage.
- **6 fiches de pièce** : salon, cuisine, chambre, salle de bain, WC, bureau.
- **2 fiches transverses** : circulation et rangements.
- **16 règles de plan actives** dans `assets/rules.js`.
- **6 règles génériques de placement** (`S1` à `S6`) dans
  `assets/socle.data.js`.

## Matrice de couverture

| Pièce / fonction | Fiche | Socle | Générée | Contrôle actif | État et manque principal |
|---|---:|---:|---:|---:|---|
| Séjour / salon | oui | oui | oui | générique | **Partiel** — mobilier et relation focale présents ; règles dédiées d'occupation, de multifonction et de proportion à formaliser |
| Cuisine | oui | oui | oui | générique | **Partiel** — séquence évier/plan/plaque active dans la pose ; règles dédiées de largeur, linéaire, réseaux et triangle d'activité à exposer dans le rapport |
| Chambre | oui | oui | oui | générique | **Partiel** — lit et rangement présents ; passage au pied, type d'ouvrant et profil accessible à compléter |
| Salle d'eau / bain | oui | oui | oui | générique | **Partiel** — sanitaires et préférences de murs présents ; accessibilité, réseaux et ventilation non contrôlés |
| WC | oui | oui | oui | générique | **Partiel** — meublabilité contrôlée ; transfert latéral, lave-mains conditionnel et interdictions d'adjacence restent à implémenter |
| Circulation | transverse | oui | oui | dédié | **Couvert partiellement** — quatre règles actives et parcours calculé ; seuils contextuels et accessibilité restent à consolider |
| Salle à manger | incluse dans salon | oui | non | non | **Socle seul** — décider pièce autonome ou zone du séjour, puis définir programme et déclencheurs |
| Entrée | incluse dans circulation | oui | non | partiel | **Socle seul** — une porte d'entrée est posée, mais aucun espace `entree` n'est généré |
| Bureau | oui | oui | non | non | **Socle seul** — fiche et mobilier prêts ; manque l'activation dans le programme et le générateur |
| Buanderie | non | oui | non | non | **Socle seul** — créer fiche, règles de réseaux, dégagement de machine et relation avec cellier/local technique |
| Cellier | rangement transverse | oui | non | non | **Socle seul** — créer fiche et règles d'adjacence cuisine, stockage et circulation |
| Local technique | non | oui | non | non | **Socle seul** — créer fiche, accès de maintenance, réseaux et séparation des pièces sensibles |
| Garage | non | oui | non | non | **Socle seul** — créer fiche, gabarit véhicule, accès, porte, sas et relation au logement |
| Suite parentale | non | composition possible | non | non | **Absent comme programme composé** — définir chambre + rangement/dressing + salle d'eau et leurs relations |
| Dressing | rangement transverse | composant seulement | non | non | **Absent comme pièce** — décider s'il reste un équipement, une annexe ou une pièce autonome |
| Escalier / étage | circulation seulement | non | non | non | **Hors V1** — le moteur est mono-niveau |
| Terrasse / balcon / extérieur | non | non | non | non | **Hors V1** — prévoir une famille d'espaces extérieurs et leurs seuils |

## Règles actives aujourd'hui

Le rapport de plan évalue actuellement :

- projet et surfaces : `TH2D-PROJECT-001`, `TH2D-ROOM-001`,
  `TH2D-ROOM-002`, `TH2D-SIZING-001` ;
- graphe et façade : `TH2D-GRAPH-001`, `TH2D-GRAPH-002`,
  `TH2D-FACADE-001` ;
- circulation : `TH2D-CIRC-001` à `TH2D-CIRC-004` ;
- rangement : `TH2D-RANGEMENT-001` à `TH2D-RANGEMENT-003` ;
- forme et réserve : `TH2D-FORME-001`, `TH2D-RESERVE-001`.

Le solveur de mobilier applique séparément : présence et non-chevauchement
des requis (`S1`), protection des zones d'usage (`S2`), débattements (`S3`),
chemin d'accès aux usages (`S4`), ancrages (`S5`) et rectangle libre résiduel
(`S6`). Ces résultats doivent à terme remonter sous des identifiants stables
dans le rapport général, pièce par pièce.

## Manques transverses prioritaires

### P0 — Remettre la documentation au niveau du code

- `MODELE_EXIGENCES.md`, `MODELE_DE_CALCUL.md` et `ROADMAP.md` déclarent encore
  par endroits les portes, fenêtres ou parcours absents, alors que
  `generator.js`, `placement.js` et `app.js` les calculent et les rendent.
- Les sections historiques des fiches sont signalées comme périmées dans
  `agencement/README.md` : ne pas les utiliser comme état d'implémentation.
- Faire du code et des tests l'autorité de l'état, et des fiches l'autorité
  des valeurs sourcées et des intentions.

### P1 — Rendre les règles de pièce visibles et auditables

- Créer des identifiants dédiés par famille (`TH2D-CUIS-*`, `TH2D-CHBR-*`,
  `TH2D-SDB-*`, `TH2D-WC-*`, `TH2D-SALON-*`).
- Transmettre les verdicts `S1` à `S6` et les relations entre équipements au
  rapport général, avec pièce, équipement, mesure et seuil.
- Distinguer clairement règle bloquante, conseil et préférence de placement.

### P2 — Activer les pièces déjà prêtes dans le socle

Ordre recommandé :

1. **bureau**, déjà documenté et équipé ;
2. **entrée**, déjà impliquée par les portes et les parcours ;
3. **salle à manger**, après décision « pièce ou zone » ;
4. **cellier** puis **buanderie**, proches des capacités actuelles ;
5. **local technique** et **garage**, qui exigent davantage de règles
   techniques et d'accès.

### P3 — Compléter le modèle commun

- profil accessible/évolutif, aire de rotation et transfert WC ;
- attribut d'ouvrant pour les rangements et leurs dégagements ;
- réseaux humides, ventilation et regroupement technique ;
- relations d'adjacence typées : obligatoire, interdite, souhaitable,
  déconseillée ;
- nord et orientation réels ;
- murs et épaisseurs ;
- programmes composés : suite parentale, cuisine ouverte, séjour avec repas
  ou bureau.

## Backlog par pièce couverte

- **Séjour** : arbitrer les seuils 20/24/30 m² ; ajouter occupation mobilier,
  effet couloir et zones repas/bureau conditionnelles.
- **Cuisine** : ajouter largeur/linéaire, triangle d'activité, réseaux et
  extraction ; distinguer cuisine ouverte et fermée.
- **Chambre** : contrôler passage au pied et sur les côtés selon lit simple ou
  double ; formaliser chambre parentale et rangement obligatoire.
- **Salle d'eau** : expliciter douche ou baignoire, accès aux équipements,
  profil accessible et ventilation.
- **WC** : ajouter dégagements latéraux, transfert accessible et interdiction
  de communication directe avec cuisine ou espace repas selon le profil
  réglementaire retenu.
- **Circulation / entrée** : rendre la largeur dépendante de la desserte,
  valider les manœuvres de porte et faire de l'entrée une pièce optionnelle.
- **Rangements** : ajouter `ouvrant`, profondeur par usage et rattachement à
  la pièce servie.

## Définition de « terminé » pour une pièce

Une pièce passe à **Couvert** uniquement lorsque :

1. sa fiche contient valeurs, sources, variantes et règles candidates ;
2. son programme minimal existe dans `socle.data.js` ;
3. ses variantes sont désignables par `room-model.js` ;
4. le générateur peut la créer ou l'intégrer explicitement à une composition ;
5. le solveur valide ses équipements, usages, ouvertures et relations ;
6. ses règles produisent des verdicts identifiés dans le rapport ;
7. des tests couvrent au moins une réussite, un refus et plusieurs graines.

## Défauts signalés le 18 août, localisés dans le code

Trois défauts remontés à l'usage, vérifiés sur le moteur. Les deux derniers
n'en font qu'un : **la fusion de pièces est implémentée comme une
suppression**.

### D1 — L'entrée n'est pas une contrainte de génération

`poserEntree` (`generator.js`) s'exécute **après** que les 96 candidats ont
été notés et le meilleur retenu ; `scoreCandidate` ne contient aucun critère
de façade ni d'entrée. Rien ne pousse donc la circulation vers l'enveloppe :
elle finit enclavée, et l'entrée redescend la chaîne `ENTREE_ORDRE` vers le
séjour ou la cuisine — ou renvoie `null`, plan sans entrée.

Correction : porter le contact façade de la pièce éligible dans
`scoreCandidate`, avant sélection. La ligne « Entrée » de la matrice reste
juste, mais son manque principal est celui-ci, pas seulement l'absence d'un
espace `entree` généré.

### D2 — Une pièce fusionnée reste dessinée en parties séparées

`app.js` dessine chaque `part` indépendamment (deux boucles
`room.parts && room.parts.length ? room.parts : [room]`). Une pièce en L
affiche donc le trait de refend entre ses parties, alors qu'elle est une seule
pièce. Attendu : **le contour extérieur seul**, et c'est ce volume unifié qui
doit être soumis au solveur de pose — aujourd'hui l'agencement raisonne sur
les parties, pas sur leur union.

Recoupe l'observation N°4 de `AUDIT_PLANS_RENDUS.md` (dépôt archivé) : union
propre des contours, jamais faite.

### D3 — Le WC intégré n'existe nulle part

`buildProgram` : `if (options.includeWc) rooms.push(createRoom('wc'))`.
Case décochée — « WC indépendant » non coché, donc WC intégré à la salle
d'eau — aucune pièce n'est créée, **et** `socle.data.js` ne prévoit pas de
`wc_pan` parmi les équipements de `bath`, sous aucune variante. Le WC
disparaît du programme au lieu d'être absorbé.

Même défaut pour la cuisine non séparée : `separateKitchen` décoché supprime
la pièce sans verser ses équipements au séjour.

Correction commune : traiter la fusion comme une **composition** — une pièce
unique, un contour, un programme d'équipements réuni. `bath` reçoit `wc_pan`
en variante « avec WC », `living` reçoit le linéaire de cuisine en variante
« séjour avec cuisine ouverte ». C'est le point « programmes composés » de
P3, qui devient bloquant : il ne s'agit plus d'enrichir le modèle mais de
réparer deux options du formulaire qui produisent aujourd'hui un plan faux.

## Journal de suivi

| Date | Changement | État |
|---|---|---|
| 2026-08-18 | Inventaire initial des fiches, du socle, du générateur et des règles actives | fait |
| 2026-08-18 | Localisation des défauts D1 (entrée hors scoring), D2 (parties dessinées séparément), D3 (WC et cuisine fusionnés supprimés) | fait |
| — | D1 : contact façade porté dans `scoreCandidate` | à faire |
| — | D2 : union des contours au dessin et à la pose | à faire |
| — | D3 : fusion traitée comme composition, `wc_pan` en variante de `bath` | à faire |
| — | Réconciliation des documents devenus périmés après l'ajout des ouvertures et parcours | à faire |
| — | Activation du bureau dans le programme | à faire |
| — | Première remontée des verdicts de placement par pièce | à faire |

## Fichiers faisant autorité pour ce suivi

- `assets/generator.js` : types réellement générés et ouvertures/parcours ;
- `assets/socle.data.js` : types, équipements, usages et relations disponibles ;
- `assets/room-model.js` : désignation des exigences ;
- `assets/placement.js` : validation et optimisation des poses ;
- `assets/rules.js` : règles effectivement évaluées au niveau du plan ;
- `agencement/` et `VEILLE_NORMATIVE.md` : sources et règles candidates ;
- `scripts/test-*.mjs` : preuve de comportement et non-régression.
