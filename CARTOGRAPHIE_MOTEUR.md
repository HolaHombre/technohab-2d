# Cartographie du moteur

Comment TechnoHab transforme **cinq réglages** en un **plan d'habitation dessiné,
mesuré et jugé**. Ce document n'ajoute aucune règle : il montre où vivent celles
qui existent, et dans quel ordre elles s'appliquent.

Entrée dans le code par ordre d'utilité : `assets/generator.js` (le chef
d'orchestre), `assets/squelette.js` et `assets/typologie.js` (les deux poseurs),
`assets/construction.js` (les murs), `assets/rules.js` (le juge).

Doctrine : [`DOCTRINE.md`](DOCTRINE.md) — unité de conception et chaîne cible.
Ce document cartographie le **runtime actuel** (room-first) ; il ne remplace
pas la doctrine.

---

## 1. Le trajet complet, en une image

Ce que fait le moteur entre le clic sur « Générer » et le plan à l'écran.

```mermaid
flowchart TD
    A["Formulaire<br/>surface · chambres · SdB · cuisine · WC · forme"] --> B
    B["<b>buildProgram</b><br/>generator.js<br/><i>la demande devient un programme</i>"] --> C
    C["<b>Pose</b><br/>squelette.js, sinon typologie.js<br/><i>des rectangles sans épaisseur</i>"] --> D
    D["<b>finaliserPlan</b><br/>generator.js<br/><i>façonnage, murs, portes, parcours</i>"] --> E
    E["<b>Plan</b><br/>objet conforme à PLAN_SCHEMA.json"] --> F & G
    F["<b>evaluatePlan</b><br/>rules.js — 24 règles"] --> H
    G["<b>renderPlan</b><br/>app.js — dessin SVG"] --> I
    H["Rapport de conformité"] --> J
    I["Mobilier posé pièce par pièce<br/>room-model.js + placement.js"] --> J
    J["Écran : plan, alertes, historique, quiz"]

    style B fill:#e8f0fe,stroke:#4a72c4
    style C fill:#e8f0fe,stroke:#4a72c4
    style D fill:#e8f0fe,stroke:#4a72c4
    style F fill:#fdf0e3,stroke:#c98f3a
    style I fill:#eaf5ea,stroke:#5a9e5a
```

Trois idées à retenir dès maintenant :

1. **Le moteur ne cherche plus sa disposition, il la pose.** Le graphe demandé
   est une étoile dans 840 cas sur 840 : la forme de la réponse est connue
   d'avance, c'est le couloir desservant.
2. **Les cloisons arrivent en dernier.** Toute la pose raisonne sur des
   rectangles sans épaisseur ; `construction.js` les épaissit ensuite, et c'est
   seulement là que la surface *habitable* devient connue — d'où les boucles de
   correction.
3. **Le juge est séparé du producteur.** `rules.js` ne sait pas comment le plan
   a été fait ; il ne lit que sa géométrie finale.

**Depuis M1, l'interface ne demande plus un plan nu.** Elle appelle
`generateResult()` et reçoit successivement les contrats `Intent`, `Program`,
`TopologyCandidate`, `BuiltPlan` et `Verdict`, réunis dans un
`GenerationResult`. `generatePlan()` reste l'adaptateur des scripts historiques.
Les quatre issues ne sont plus confondues : `VALID`, `IMPOSSIBLE`,
`NON_TROUVE`, `INVALIDE_DEBUG`. Voir `CONTRATS_MOTEUR.md`.

Les pilotes `TOILET_SEPARATE` et `BATHROOM_WITH_TOILET` sont C4 : leurs
domaines isolés, variantes et conflits d'ouvrant sont figés avant leur entrée
dans l'orchestration M2. Les autres profils restent C2.

---

## 2. Les modules et leur ordre de chargement

Seize fichiers, aucune dépendance externe, aucun build. Chaque module se déclare
dans `globalThis` sous un nom `TechnoHab*`, et l'ordre des `<script defer>` dans
`index.html` est l'ordre des dépendances.

```mermaid
flowchart LR
    subgraph immediat["Chargé au premier octet — index.html"]
        direction TB
        CVD["<b>canonical-values.data.js</b><br/>registre canonique 1.0<br/><i>données pures</i>"]
        CVE["<b>canonical-values.js</b><br/>validation et résolution"]
        FIT["<b>fit.data.js</b><br/>TechnoHabFit<br/>enveloppes minimales<br/><i>généré, ne pas éditer</i>"]
        CTR["<b>contracts.js</b><br/>TechnoHabContracts<br/>contrats M1 et maturité"]
        CON["<b>construction.js</b><br/>TechnoHabConstruction<br/>murs, surfaces, ouvertures"]
        TYP["<b>typologie.js</b><br/>TechnoHabTypologie<br/>poseur en bandes"]
        SQU["<b>squelette.js</b><br/>TechnoHabSquelette<br/>poseur par circulation"]
        GEN["<b>generator.js</b><br/>TechnoHabGenerator<br/>programme + orchestration + aval"]
        RUL["<b>rules.js</b><br/>TechnoHabRules<br/>24 règles"]
        EVA["<b>evaluation.js</b><br/>TechnoHabEvaluation<br/>quiz et journal local"]
        APP["<b>app.js</b><br/>interface, SVG, historique"]
        LOA["<b>composition-loader.js</b><br/>TechnoHabSocleLoader"]
    end

    subgraph differe["Chargé à la demande — au premier mobilier ou compositeur"]
        direction TB
        SOC["<b>socle.data.js</b><br/>TechnoHabSocle<br/>catalogue d'équipements"]
        RM["<b>room-model.js</b><br/>TechnoHabRoomModel<br/>désignation des exigences"]
        PLA["<b>placement.js</b><br/>TechnoHabPlacement<br/>solveur de pose"]
        COM["<b>composition.js</b><br/>compositeur libre"]
    end

    CVD --> CVE --> CTR
    FIT --> GEN
    CTR --> GEN
    CON --> GEN
    TYP --> GEN
    SQU --> GEN
    GEN --> APP
    RUL --> APP
    EVA --> APP
    APP -.->|"premier besoin"| LOA
    LOA --> SOC --> RM --> PLA --> COM
    SOC -.->|"npm run fit:build"| FIT
    SOC -.->|"identifiants VAL-*"| CVD

    style FIT fill:#f3e8fd,stroke:#8a5fc4
    style SOC fill:#f3e8fd,stroke:#8a5fc4
    style differe fill:#fafafa,stroke:#bbb,stroke-dasharray: 4 3
```

Deux points de vigilance :

- **`fit.data.js` est un produit, pas une source.** Il est compilé depuis
  `socle.data.js` par `npm run fit:build`. Le générateur le lit lui plutôt que le
  socle pour ne pas casser le chargement paresseux : le socle pèse 23 Ko et ne
  sert qu'au mobilier.
- **Le socle ne descend qu'au premier usage.** Ouvrir la page sans afficher le
  mobilier ne le télécharge jamais.
- **Le canon voyage par référence.** Le registre complet porte unité, source,
  statut et portée ; `Program`, `BuiltPlan` et l'export ne dupliquent que
  `{id, version}`. Le consommateur résout ensuite la valeur dans le registre
  validé, sans recopier sa doctrine dans le moteur.

---

## 3. De la demande au programme — `buildProgram()`

Le programme est la liste des pièces à loger, leur surface visée, et le graphe
d'adjacences *souhaité*. Rien de géométrique encore.

```mermaid
flowchart TD
    OPT["<b>normalizeOptions</b><br/>surface 35–250 · chambres 0–5 · SdB 1–2<br/>cuisine séparée · WC séparé · forme · priorité"] --> TYPO

    TYPO{"Typologie de logement ?<br/><i>0 chambre → studio</i>"}
    TYPO -->|"studio"| IMP["<b>impose</b> cuisine ouverte, WC intégré<br/><b>verse</b> le couchage au séjour"]
    TYPO -->|"sinon"| LISTE
    IMP --> LISTE

    LISTE["<b>Liste des pièces</b><br/>séjour, cuisine, chambres, salles d'eau, WC"] --> FUSION
    FUSION["<b>composeInto</b> — les fusions<br/>cuisine ouverte → dans le séjour<br/>WC intégré → dans la salle d'eau<br/><i>le minimum composé n'est pas la somme des minima</i>"] --> CIRC

    CIRC{"4 pièces ou plus ?"}
    CIRC -->|"non"| ALLOC
    CIRC -->|"oui"| NBC["<b>Combien de dégagements</b><br/>1 par tranche de 5 pièces desservies<br/>puis on retire tant que les minima<br/>ne tiennent pas dans la surface"]
    NBC --> ALLOC

    ALLOC["<b>Répartition des surfaces</b><br/>plancher de chaque pièce = max(meublable, dignité d'usage)<br/>le surplus se partage au poids<br/><i>poids = agrément déclaré dans le socle</i>"] --> GRAPHE

    GRAPHE["<b>desiredEdges — le graphe demandé</b><br/>séjour ↔ chaque dégagement<br/>chaque dégagement ↔ ses pièces, réparties par aires<br/>séjour ↔ cuisine si elle est séparée"] --> OUT

    OUT["<b>program</b><br/>options · rooms · desiredEdges · minimumTotal · construction"]

    style ALLOC fill:#e8f0fe,stroke:#4a72c4
    style GRAPHE fill:#fdf0e3,stroke:#c98f3a
```

**Le double plancher.** Chaque pièce porte deux minima qu'un seul nombre
confondait autrefois, et le moteur retient le plus exigeant :

| Plancher | D'où il vient | Ce qu'il dit |
|---|---|---|
| `smallest` / `narrowest` | calculé par le solveur de pose, compilé dans `fit.data.js` | « la pièce reçoit son mobilier » |
| `minProgramArea` / `minProgramSide` | convention assumée, déclarée dans `socle.data.js` | « la pièce mérite son nom » |

Un séjour se meuble dès 3,24 m² et reste absurde à cette taille : d'où le
plancher de 20 m².

---

## 4. La pose — deux poseurs, l'un en repli de l'autre

`generatePlan()` essaie le squelette ; s'il refuse, il descend sur la typologie
en bandes, en retirant un dégagement à chaque échec.

```mermaid
flowchart TD
    START["generatePlan"] --> SQ

    SQ["<b>poserParSquelette</b><br/>programme ramené à UNE circulation"]
    SQ --> SQOK{"une famille sert-elle<br/>ce programme ?"}
    SQOK -->|"oui"| FIN(["plan rendu"])
    SQOK -->|"non"| BOUCLE

    BOUCLE["<b>Repli sur la typologie</b><br/>on repart du nombre de dégagements voulu<br/>et on redescend jusqu'à zéro"]
    BOUCLE --> TY
    TY["<b>poserAvecTypologie</b><br/>couloirsMax = n"]
    TY --> TYOK{"pose trouvée ?"}
    TYOK -->|"oui"| FIN
    TYOK -->|"non, et n > 0"| DEC["n − 1"] --> TY
    TYOK -->|"non, et n = 0"| ERR(["erreur : aucune disposition<br/>ne sert ce programme"])

    style SQ fill:#e8f0fe,stroke:#4a72c4
    style TY fill:#fdf0e3,stroke:#c98f3a
```

Pourquoi deux poseurs : le squelette produit des organisations que les bandes ne
trouvent pas — 45 signatures distinctes sur un T4 de 100 m² contre 4 — mais il
**refuse plus souvent**. La typologie sert les studios, les programmes saturés et
tout ce que le squelette ne sait pas loger. Aucun des deux n'est « l'ancien » :
ils se complètent.

### 4a. Le squelette — la circulation d'abord, les pièces ensuite

Renversement de méthode du 25 août 2026. On pose d'abord le réseau de
circulation ; les pièces remplissent les **poches** qu'il laisse. L'adjacence
n'est jamais cherchée : elle est une propriété de la disposition.

```mermaid
flowchart TD
    P["programme + surface cible + graine"] --> FAM

    FAM["<b>Choix de la famille</b><br/>tirée au sort parmi celles qui s'appliquent"]
    FAM --> F1["<b>barre</b> · 2 poches"]
    FAM --> F2["<b>L</b> · 2 poches"]
    FAM --> F3["<b>T</b> · 3 poches"]
    FAM --> F4["<b>desserte intégrée</b> · 2 poches<br/><i>sans couloir : une pièce dessert</i>"]

    F1 & F2 & F3 & F4 --> REP
    REP["<b>Répartition en poches</b><br/>une fois sur deux au hasard, sinon par aires équilibrées<br/><i>le hasard casse un biais mesuré : l'équilibrage seul<br/>ne donnait que 2 organisations sur 100 tirages</i>"] --> CORDE

    CORDE["<b>La corde du graphe</b><br/>la cuisine est glissée à côté du séjour<br/>dans la même poche"] --> DIM

    DIM["<b>Balayage de largeur</b><br/>35 largeurs d'enveloppe essayées<br/>× un retrait tiré — c'est lui qui fait le L"] --> FILTRE

    FILTRE{"la forme obtenue est-elle<br/>celle qui a été demandée ?"}
    FILTRE -->|"rectangle demandé mais décroché"| REJ(["rejeté"])
    FILTRE -->|"L demandé mais plein"| REJ
    FILTRE -->|"conforme"| ECART

    ECART{"écart de surface<br/>dans la tolérance ?"}
    ECART -->|"non"| SUIV["famille suivante"] --> FAM
    ECART -->|"oui"| POSE["<b>pieces + volumes de l'enveloppe</b><br/>toutes les branches forment UNE circulation"]

    style CORDE fill:#fdf0e3,stroke:#c98f3a
    style POSE fill:#eaf5ea,stroke:#5a9e5a
```

Une **poche** est une bande de pièces bordant une branche sur toute sa longueur ;
sa largeur et sa profondeur lui sont propres. Deux poches de longueurs
différentes laissent un retrait — et ce retrait **est** la forme en L.

### 4b. La typologie — le couloir desservant, en bandes

Trois poseurs de sévérité décroissante, essayés sous quatre paliers de tolérance.
Le moteur ne doit jamais rester muet sur un programme que l'interface accepte.

```mermaid
flowchart TD
    T["couloirsDesservants"] --> B1

    B1["<b>Palier de tolérance</b><br/>3 % → 10 % → 25 % → 50 % sur la surface"]
    B1 --> P1["<b>poserUneFois</b><br/>colonne séjour + couloirs desservants<br/>3 tirages"]
    P1 -->|"échec"| P2["<b>poserEnBandes</b><br/>bandes parallèles<br/>3 tirages · sert aussi les studios sans couloir"]
    P2 -->|"échec"| SUIVANT["palier suivant"] --> B1
    B1 -->|"les 4 paliers épuisés"| P3["<b>poserSecours</b><br/>bandes régulières, sans garantie<br/><i>un plan imparfait signalé vaut mieux que rien</i>"]

    P1 -->|"succès"| OK(["pieces"])
    P2 -->|"succès"| OK
    P3 --> OK

    style P3 fill:#fdeaea,stroke:#c45a5a
```

Les paliers relâchent d'abord la **surface**, puis la **largeur de desserte** ;
les cotes de meublabilité, elles, ne bougent jamais. Un plan servi sans garantie
de desserte n'est pas caché : `TH2D-GRAPH-001` le signalera au rapport.

---

## 5. L'aval commun — `finaliserPlan()`

Tout ce qui suit la pose est identique pour les deux poseurs, et identique aussi
pour un plan dessiné à la main via `assemblerPlan()` — sans quoi l'instrument de
mesure ne mesurerait pas le moteur.

```mermaid
flowchart TD
    IN["boîtes posées + graphe réel"] --> C1

    C1["<b>Cession de circulation</b> — carveCirculation<br/>le couloir cède son surplus de largeur<br/>aux pièces qui le bordent → les placards"] --> C2
    C2["<b>Décrochements</b> — shapeRooms<br/>échanges de coins entre pièces mitoyennes<br/><i>bornés : au-delà un plan devient illisible</i>"] --> C3
    C3["<b>Mise à la surface</b> — fitHabitable<br/>homothétie résolue analytiquement<br/><i>l'échelle qui rend l'habitable demandé,<br/>cloisons déduites</i>"] --> C4
    C4["<b>Murs</b> — analyze<br/>extérieurs 0,30 m · intérieurs 0,10 m<br/>polygones utiles, surfaces, référentiel de murs"] --> C5
    C5["<b>Graphe relu</b> sur la géométrie finale<br/>+ façades et arêtes vers l'extérieur"] --> C6
    C6["<b>Ouvertures</b><br/>portes sur les arêtes demandées<br/>entrée · fenêtres en façade<br/>puis réservation dans les murs"] --> C7
    C7["<b>Cheminement</b><br/>grille de 10 cm, propagation depuis l'entrée<br/>franchissement seulement par les réservations"] --> OUT

    OUT["<b>plan</b><br/>rooms · walls · portes · fenêtres · parcours<br/>facades · edges · metrics · seed"]

    style C3 fill:#e8f0fe,stroke:#4a72c4
    style C4 fill:#e8f0fe,stroke:#4a72c4
```

### La boucle de surface, et pourquoi elle existe

La demande porte sur la surface **habitable**. Les poseurs raisonnent en surface
de **partition** — cloisons comprises. L'écart n'est connu qu'après
`finaliserPlan()`, donc on corrige la cible et on repose.

```mermaid
flowchart LR
    D["surface demandée"] --> V["surface visée<br/><i>tirée dans ±6 % — deux graines<br/>donnent deux tailles de logement</i>"]
    V --> C["cible de partition"]
    C --> POSE["pose"] --> FIN["finaliserPlan"] --> H["habitable obtenu"]
    H --> TEST{"écart < 0,004 m² ?"}
    TEST -->|"oui"| STOP(["plan retenu"])
    TEST -->|"non"| CORR["cible × visée / obtenu"] --> C
    TEST -.->|"16 essais au maximum"| STOP

    style V fill:#fdf0e3,stroke:#c98f3a
```

On repose plutôt que de mettre le plan à l'échelle : **une largeur réglementaire
ne s'homothétie pas.** Un couloir de 1,20 m réduit de 10 % tombe sous le seuil.

---

## 6. Le contrôle — `rules.js`

24 règles évaluées sur la géométrie finale, sans rien savoir de sa fabrication.

```mermaid
flowchart TD
    PLAN["plan"] --> PRE

    PRE["<b>Préalable</b><br/>TH2D-RESERVE-001<br/><i>aucune surface sans propriétaire</i>"]
    PRE -->|"rompu"| STOP["<b>évaluation arrêtée</b><br/>un plan troué ou recouvert n'est pas<br/>un plan un peu faux : il n'existe pas<br/><i>le rapport le dit explicitement</i>"]
    PRE -->|"tenu"| ALL

    ALL["<b>les 24 règles</b>"] --> G1 & G2 & G3 & G4 & G5 & G6

    G1["<b>Murs</b> · WALL 001→006<br/>doublons, épaisseurs, empiétement,<br/>conservation, ouvertures, ancrages"]
    G2["<b>Pièces</b> · ROOM 001–002 · SIZING · FORME<br/>surface minimale, meublabilité,<br/>complexité de forme"]
    G3["<b>Graphe</b> · GRAPH 001–002<br/>adjacences desservies,<br/>toutes les pièces accessibles"]
    G4["<b>Circulation</b> · CIRC 001→004<br/>largeur praticable, desservante,<br/>contenue, proportionnée à sa desserte"]
    G5["<b>Rangement</b> · RANGEMENT 001→003<br/>proportions, rattachement, présence"]
    G6["<b>Enveloppe</b> · BOUNDARY · FACADE · ENTREE · PROJECT<br/>contenance, façade, entrée, surface"]

    G1 & G2 & G3 & G4 & G5 & G6 --> TRI

    TRI{"la règle figure-t-elle<br/>dans LIMITES ?"}
    TRI -->|"non"| VIO["<b>violations</b><br/>ce que le plan a raté"]
    TRI -->|"oui"| LIM["<b>limites connues</b><br/>défaut documenté du moteur :<br/>cause, mesure, suite prévue"]

    VIO & LIM --> RAP["<b>rapport</b><br/>trié : bloquant d'abord, puis par gravité"]

    style PRE fill:#fdeaea,stroke:#c45a5a
    style LIM fill:#fdf0e3,stroke:#c98f3a
```

**Deux niveaux, et un troisième statut.** `HARD` bloque, `GUIDELINE` conseille.
La table `LIMITES` est le troisième : elle déclasse trois règles dont on *sait*
qu'elles échouent, avec la cause, la mesure datée et la suite envisagée. Un
manquement connu et chiffré n'est pas la même chose qu'une surprise.

---

## 7. Le mobilier — au rendu, pas à la génération

Le générateur ignore le mobilier. Il ne connaît que des surfaces, et se contente
de garantir qu'elles sont *meublables* via les enveloppes de `fit.data.js`. La
pose réelle des meubles se calcule à l'affichage.

```mermaid
flowchart TD
    R["une pièce dessinée"] --> LAZY["<b>chargement du socle</b><br/>au premier besoin, une seule fois"]
    LAZY --> DES

    DES["<b>designate</b> — room-model.js<br/>quels équipements cette pièce exige-t-elle ?<br/>variante · cuisine ouverte · WC intégré<br/>+ montée en gamme selon la surface"] --> VAL

    VAL["<b>validate</b> — placement.js<br/>backtracking sur grille de 10 cm<br/>3 familles de stratégie au-delà de 4 meubles"] --> Q

    Q{"tout tient ?"}
    Q -->|"oui"| OPT["<b>optimize</b><br/>meilleure pose parmi plusieurs graines"] --> DRAW
    Q -->|"non"| R1["<b>Repli 1</b> — rabattre les gammes<br/>sur leur plancher"] --> VAL
    R1 -.->|"toujours non"| R2["<b>Repli 2</b> — retirer<br/>les équipements non requis"] --> VAL
    R2 -.->|"toujours non"| ECHEC["pièce marquée non meublable"]

    DRAW["<b>dessin</b> : emprises + dégagements d'usage"] --> PARC
    ECHEC --> PARC
    PARC["<b>parcours recalculé</b><br/>avec les meubles comme obstacles<br/><i>un verdict sur un logement vide ne prouve rien</i>"]

    style LAZY fill:#f3e8fd,stroke:#8a5fc4
    style R1 fill:#fdf0e3,stroke:#c98f3a
    style R2 fill:#fdf0e3,stroke:#c98f3a
```

L'ordre des replis n'est pas arbitraire : rabattre une gamme rend à la pièce le
meuble qu'elle avait avant les gammes ; retirer un optionnel lui **ôte** du
mobilier. Dans cet ordre, une montée en gamme ne peut jamais rendre non meublable
une pièce qui l'était.

---

## 8. La chaîne des données

Une seule source décrit une pièce. Tout le reste en descend.

```mermaid
flowchart LR
    DOC["<b>SOCLE_AGENCEMENT.md</b><br/><i>fait foi ; une divergence de cote<br/>est un défaut du code</i>"] -.->|"transcription"| SOC

    SOC["<b>socle.data.js</b><br/>par pièce : équipements, emprises,<br/>ancrages, dégagements, relations,<br/>gammes, planchers, agrément"]

    SOC -->|"npm run fit:build<br/>le solveur cherche les plus petits<br/>rectangles admissibles"| FIT["<b>fit.data.js</b><br/>enveloppes minimales en cm<br/>+ déclaration recopiée"]

    FIT --> GEN["<b>generator.js</b><br/>planchers de surface,<br/>poids de répartition"]
    SOC --> RM["<b>room-model.js</b><br/>désignation"] --> PLA["<b>placement.js</b><br/>pose"]

    style DOC fill:#f5f5f5,stroke:#999
    style SOC fill:#f3e8fd,stroke:#8a5fc4
    style FIT fill:#f3e8fd,stroke:#8a5fc4
```

Motif : le moteur portait autrefois `minArea`, `minSide` et `weight` en dur, le
socle portait les équipements, et rien ne garantissait que les deux parlent de la
même pièce. Ajouter une pièce se fait aujourd'hui **dans le socle seul**, suivi
d'un `npm run fit:build`.

---

## 9. Le déterminisme et la graine

Tout ce qui varie passe par une seule graine, et chaque plan la porte.

```mermaid
flowchart LR
    O["options + numéro de variante"] -->|"hash"| S["<b>graine</b>"]
    SS["graine saisie<br/><i>rejouer un plan</i>"] --> S
    S --> A["surface visée<br/>graine ⊕ 0x5BD1E995"]
    S --> B["famille, répartition en poches,<br/>retrait, ordre des pièces"]
    S --> C["décrochements<br/>graine ⊕ 0x9E3779B9"]
    A & B & C --> P["plan"] --> EXP["exporté et journalisé<br/>avec sa graine"]

    style S fill:#e8f0fe,stroke:#4a72c4
```

Conséquence pratique : **un échec est rejouable**. L'historique de l'interface
conserve pour chaque génération sa graine, ses règles enfreintes, l'écart mesuré
et le seuil — on n'a pas à noter à la main ce qui s'est produit.

---

## 10. Où est quoi

| Fichier | Responsabilité | Documentation de référence |
|---|---|---|
| `assets/generator.js` | programme, orchestration, aval commun, portes, cheminement | `MODELE_DE_CALCUL.md` |
| `assets/squelette.js` | pose par squelette de circulation | `DOCTRINE_CIRCULATION.md` |
| `assets/typologie.js` | pose en bandes, couloir desservant | `DECOUPE_ET_GRAPHE.md` |
| `assets/construction.js` | murs, surfaces, ouvertures, réservations | `MURS_EPAIS.md` |
| `assets/rules.js` | les 24 règles et leurs limites connues | `SUIVI_REGLES_PIECES.md`, `MODELE_EXIGENCES.md` |
| `assets/socle.data.js` | catalogue d'équipements et de relations | `SOCLE_AGENCEMENT.md`, `GAMMES_EQUIPEMENTS.md` |
| `assets/fit.data.js` | enveloppes minimales — **généré** | `PROTOCOLE_MESURES.md` |
| `assets/room-model.js` | désignation des exigences d'une pièce | `DOCTRINE_AGENCEMENT.md` |
| `assets/placement.js` | solveur de pose du mobilier | `PLACEMENT_ET_ADJACENCES.md` |
| `assets/app.js` | interface, rendu SVG, historique, export | `DA_CHEMINEMENT_PLAN.md`, `DA_ICONES_PLAN.md` |
| `assets/evaluation.js` | quiz de qualité perçue, journal local | — |
| `PLAN_SCHEMA.json` | contrat de sortie du moteur | — |

### Les bancs de mesure

Aucun n'est un test unitaire : ce sont des instruments qui produisent des
chiffres, et les chiffres cités dans les commentaires du code viennent de là.

| Script | Ce qu'il mesure |
|---|---|
| `scripts/scan-seeds.mjs` | conformité sur un balayage de graines et de configurations |
| `scripts/scan-capacites.mjs` | quels programmes le moteur sait servir |
| `scripts/diagnostic-desserte.mjs`, `diagnostic-circulation.mjs` | qualité de la distribution |
| `scripts/test-*.mjs` | invariants ciblés — murs, formes, fusion, contour, entrée… |
| `scripts/test-instrument.mjs` | le plan de référence dessiné à la main, passé dans le même aval |
