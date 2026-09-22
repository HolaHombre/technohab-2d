# AGENTS.md — TechnoHab

TechnoHab est un projet autonome. Les règles de Wonderland ne s'appliquent
pas à ce dépôt.

## Sources de vérité

- `ROADMAP.md` : pilotage et ordre des travaux ;
- `DOCTRINE.md` : promesse et limites du moteur ;
- `ETAT_MOTEUR_PROCEDURAL.md` : capacités réellement démontrées ;
- `CONTRATS_MOTEUR.md` et les schémas JSON : contrats techniques ;
- `README.md` : point d'entrée humain et commandes de validation.

## Invariants

- Préserver le fonctionnement local, en `file://`, sans dépendance d'exécution
  ni transmission de données.
- Ne pas présenter un plan comme contractuel ni étendre le domaine annoncé
  sans preuve et décision explicites.
- Modifier les sources avant les fichiers générés. `assets/fit.data.js` est
  produit par `npm run fit:build`; les sprites inline par `npm run icons:inline`.
- Ne pas versionner `.claude/`, `eval/` ni `House 2D plans dataset/`.
- Suivre la méthode commune de `../MetaProjet/METHODE.md` pour tout nouvel item.

## Vérification minimale

Exécuter les commandes proportionnées au changement, puis au minimum :

```sh
npm run serve:test
npm run icons:check
npm run test:analysis
npm run technohab:validate
```

Toute validation interrompue ou expirée reste inconnue ; elle n'est jamais
présentée comme réussie.

## Niveaux de diffusion (J1.1)

Un dépôt n'a pas un niveau, il a une carte. Le classement se fait **avant le
premier commit d'un fichier** : un historique Git ne s'oublie pas, il se
réécrit, ce qui coûte toujours plus cher.

| Zone | Niveau | Où elle vit |
|---|---|---|
| Moteur, `scripts/`, `agencement/`, `profils/`, `assets/`, doctrine | `diffusable` | versionné, **distant public** |
| `dist-public/` | `diffusable` | non versionné, servi publiquement par allowlist (D-032) |
| Évaluations — `eval/`, `*.eval.json` | `personnel` | ignorées, sauvegardées |
| Jeu de plans — `House 2D plans dataset/` | `personnel` | **hors Git** : volume et droits, pas confidentialité |
| — | `secret` | aucune zone |

Seul dépôt **public** du portefeuille. Tout ce qui y entre est lisible par
quiconque, immédiatement et définitivement.
