# Résolution graduée du programme — dossier M5.2

**Statut : M5.2a–f livrés · 2 septembre 2026**

Ce dossier encadre le repli demandé lorsqu'un programme n'aboutit pas. La
politique, son contrat, l'orchestration, le consentement produit et leur mesure
sont implémentés. Depuis M5.1, l'interface appelle `resolveSelection()`,
distingue demande et proposition, puis rend les plans comparables seulement
après l'accord explicite exigé par une suppression de fonction. Ce dossier fixe
l'ordre, les interdictions et les preuves afin qu'une demande ne soit jamais
transformée sans le dire.

## 1. Principe

Le moteur essaie d'abord le programme exact **trois fois**, avec trois graines
dérivées et rejouables. Trois `NON_TROUVE` autorisent le passage au niveau de
repli suivant. Le compteur appartient à une exécution de résolution : il ne
dépend ni de trois clics de l'utilisateur ni d'un état caché conservé entre
deux sessions.

Une impossibilité prouvée (`IMPOSSIBLE`) autorise le niveau suivant sans payer
deux essais identiques supplémentaires. `INVALIDE_DEBUG` arrête immédiatement
la résolution : une panne ou une violation produite par le moteur ne doit
jamais être maquillée en demande trop exigeante.

Chaque niveau reconstruit un `Program` complet depuis les options résolues. Il
est interdit de supprimer directement un nœud d'un plan déjà construit : les
adjacences, profils, valeurs canoniques et minimums doivent être recalculés par
le chemin normal.

## 2. Échelle de repli

Les concessions sont **cumulatives** et déterministes.

| Niveau | Mutation autorisée | Détail |
|---|---|---|
| `R0_EXACT` | aucune | demande originale, trois essais |
| `R1_FUSION` | retirer les séparations | `separateKitchen: true → false`, puis `includeWc: true → false` lorsque ces options existent ; cuisine ouverte et WC intégré conservent les fonctions |
| `R2_BATHROOMS` | réduire les salles d'eau supplémentaires | `bathrooms → 1`, jamais zéro |
| `R3_OPTIONAL_ROOM` | retirer une pièce déclarée relaxable | une seule fonction par niveau, par `relaxationPriority` croissante portée par la donnée ; aucune liste de types cachée dans l'orchestrateur |
| `R4_BEDROOM` | réduire les chambres | `bedrooms: n → n - 1`, une chambre à la fois ; concession majeure et dernier recours |

Un niveau sans effet est sauté. Par exemple, une cuisine déjà ouverte ne
fabrique pas un faux passage `R1`. Tant qu'aucun type optionnel ne déclare
`relaxable: true`, `R3` est vide et le moteur passe de `R2` à `R4`.

Ne sont **jamais** relaxables : dimensions `HARD`, accessibilité demandée,
construction, forme de parcelle, épaisseurs, règles de sécurité, équipements
requis d'une fonction conservée et valeurs canoniques. Le repli porte sur le
programme, pas sur la vérité de son verdict.

## 3. Contrat proposé

M5.2 n'ajoute pas `VALID_RELAXED` à `GenerationResult`. Un plan reste `VALID`
pour le programme qu'il a réellement servi ; c'est l'enveloppe suivante qui
dit que ce programme diffère de la demande initiale.

```text
ProgramResolution
  kind                 "ProgramResolution"
  contractVersion      version des contrats moteur
  status               EXACT | RELAXED | UNRESOLVED
  requestedIntent      Intent immuable d'origine
  requestedProgram     Program construit à R0
  resolvedIntent       Intent effectivement servi, ou null
  resolvedProgram      Program effectivement servi, ou null
  level                R0_EXACT | R1_FUSION | R2_BATHROOMS |
                       R3_OPTIONAL_ROOM | R4_BEDROOM | null
  changes[]            différences structurées avant/après
  attempts[]           niveau, graine, variante, statut et failure.code
  result               premier GenerationResult VALID, ou null
```

Une différence porte au minimum :

```text
{ field, from, to, reason, severity }
```

`severity` vaut `FUNCTION_PRESERVED` pour une fusion, `FUNCTION_REDUCED` pour
une salle d'eau supplémentaire retirée et `FUNCTION_REMOVED` pour une pièce ou
une chambre supprimée.

Après résolution, `PlanSelection` travaille sur le `resolvedIntent`. Le premier
résultat déjà calculé est réutilisé dans son pool afin de ne pas repayer la
recherche. Les invariants actuels de `GenerationResult` et `PlanSelection`
restent donc valides.

M5.2d nomme la sortie composée `ResolvedSelection`. Elle conserve côte à côte
le `ProgramResolution`, la `PlanSelection`, le booléen de réemploi et le nombre
de nouvelles générations payées. Pour trois propositions, le budget reste de
douze candidats : un résultat réemployé et onze nouvelles tentatives.

## 4. Algorithme borné

```text
pour chaque niveau réellement applicable :
  reconstruire Intent + Program
  si Program est IMPOSSIBLE : tracer, passer au niveau suivant
  sinon essayer au plus 3 couples variante/graine déterministes
    VALID          → rendre EXACT ou RELAXED
    NON_TROUVE     → continuer
    IMPOSSIBLE     → passer au niveau suivant
    INVALIDE_DEBUG → arrêter UNRESOLVED, sans relaxer
si aucun niveau ne réussit : rendre UNRESOLVED
```

Le maximum initial est de quinze recherches (`R0` à `R4`, trois chacune),
moins les niveaux inapplicables et les impossibilités prouvées. Les graines se
dérivent de la graine d'origine, du niveau et de l'index d'essai ; le même
appel doit rendre la même trace.

## 5. Présentation et consentement

Une résolution `RELAXED` peut être montrée comme **proposition de repli**, mais
jamais comme réponse exacte. L'interface affiche avant le plan :

```text
Demande : 3 chambres · 2 salles d'eau · cuisine séparée
Proposition : 3 chambres · 1 salle d'eau · cuisine ouverte
Concessions : cuisine ouverte ; une salle d'eau en moins
```

Le retrait d'une pièce ou d'une chambre demande une confirmation explicite
avant d'en faire le plan actif ou de l'exporter sans avertissement. Le document
exporté conserve `requestedProgram`, `resolvedProgram` et `changes[]`.

## 6. Découpage d'implémentation

1. **[x] M5.2a — politique pure** : `relaxation.data.js`, niveaux, mutations et
   tests sans géométrie ; ajout futur de `relaxable` / `relaxationPriority` au
   socle pour les fonctions optionnelles. Livré sans chargement runtime : les
   options candidates sont cumulatives, profondément immuables et les niveaux
   sans effet sont sautés.
2. **[x] M5.2b — contrat** : `ProgramResolution` dans `contracts.js` et
   `GENERATION_CONTRACTS.json`, invariants et sérialisation. Livré en contrat
   moteur 1.1 avec vocabulaires fermés et traces immuables.
3. **[x] M5.2c — orchestration** : `resolveProgram()` autour de
   `generateResult()`, trois essais déterministes par niveau, saut immédiat
   d'un niveau prouvé `IMPOSSIBLE` et arrêt honnête sur debug. Livré sous forme
   d'API explicite ; `generateResult()` est resté compatible. L'interface a
   ensuite adopté la sortie composée au lot M5.1.
4. **[x] M5.2d — sélection** : réemploi du premier résultat puis
   `PlanSelection` sur le programme résolu. Livré par `resolveSelection()` et
   le contrat `ResolvedSelection` ; aucune recherche de diversité n'est lancée
   après `UNRESOLVED`.
5. **[x] M5.2e — produit** : comparaison demande/proposition, confirmation des
   concessions majeures, accessibilité clavier et export traçable. Livré dans
   l'interface : les retraits `FUNCTION_REMOVED` laissent plan et exports
   inactifs jusqu'à la case d'accord ; JSON et SVG conservent la trace.
6. **[x] M5.2f — mesure** : rejeu des bancs exacts et banc dédié de programmes
   comprimés ; publication du coût, de la couverture et des concessions.
   Livré par `measure-program-resolution.mjs`, sa référence stable et son test
   d'invariants. Le banc étendu reste séparé de la porte A en raison de son coût.

## 7. Cas de preuve obligatoires

- un programme résolu au premier ou troisième essai reste `EXACT` et ne porte
  aucune concession ;
- deux `NON_TROUVE` ne déclenchent pas le repli ; le troisième le déclenche ;
- une cuisine séparée devient ouverte sans perdre `COOK` ;
- un WC séparé devient une composition salle d'eau + WC sans perdre `TOILET` ;
- deux salles d'eau deviennent une, jamais zéro ;
- une fonction non déclarée `relaxable` ne peut pas être supprimée par R3 ;
- une chambre n'est retirée qu'à R4, une à la fois ;
- `INVALIDE_DEBUG` arrête la chaîne ;
- chaque résultat présenté possède zéro violation `HARD` ;
- options d'origine, trace et résolution restent immuables et rejouables ;
- le même appel rend les mêmes niveaux, graines et concessions ;
- le banc historique exact reste inchangé quand la résolution graduée n'est
  pas appelée.

## 8. Mesures de sortie

Le point de départ versionné est de **11 `NON_TROUVE` sur 360 tentatives** au
banc M0 et de **13 sur 96 demandes** au banc d'entrée C-P2. M5.2 publie, sans
objectif artificiel de zéro :

- taux de résolution exact et relaxé ;
- distribution par niveau `R1…R4` ;
- fonctions fusionnées, réduites ou retirées ;
- coût moyen, p90 et maximum ;
- nombre de propositions relaxées encore `NON_TROUVE` ;
- zéro plan relaxé avec violation `HARD` ;
- effet sur diversité et `PlanSelection`.

Le lot est terminé lorsque chaque concession est traçable et compréhensible,
pas lorsque le moteur force coûte que coûte une réponse.

### Photographie M5.2f — 2 septembre 2026

Commande rejouable :

```text
node scripts/measure-program-resolution.mjs --check scripts/references/M5_2_RESOLUTION_REFERENCE.json
```

Le banc comprend huit programmes comprimés et deux témoins exacts, chacun joué
sur trois graines fixes, soit **30 demandes**. Les six témoins restent `EXACT`.
Les vingt-quatre demandes comprimées deviennent `RELAXED` et aboutissent :
**4 à R1**, **11 à R2** et **9 à R4**. `R3` est honnêtement absent tant
qu'aucune fonction optionnelle du socle ne déclare `relaxable: true`.

La résolution coûte **4,23 appels en moyenne**, **7 au p90** et **8 au
maximum**. Elle traverse 64 tentatives relaxées `NON_TROUVE`, mais ne laisse
aucune demande irrésolue après repli. Les concessions cumulées sont 48 fusions
préservant les fonctions (cuisine et WC), 20 réductions de salles d'eau et 9
retraits de chambre. Aucun plan publié ne porte de violation `HARD`.

La tri-sélection est mesurée sur quatre demandes représentatives : **4/4
`COMPLETE`**, trois plans et trois signatures distinctes à chaque fois, avec
1,75 famille et 1,75 stratégie en moyenne. Elle ajoute onze générations ; le
coût résolution comprise vaut 14,25 appels en moyenne, p90 et maximum à 17.
La durée observée de 281,7 s décrit cette machine et reste exclue du témoin.
