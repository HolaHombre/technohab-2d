/* Chantier 6 §6.4 — le quiz embarqué et son journal.
   ------------------------------------------------------------------------
   Recueille un signal continu sur la qualité perçue, au moment où le plan
   est sous les yeux. Le banc mesure la conformité et ne peut pas juger la
   qualité : `TH2D-ROOM-002` dit « meublable », pas « agréable ».

   L'architecture est décidée par une contrainte du projet, pas par un goût :
   zéro dépendance, zéro service externe, le site doit fonctionner en
   `file://`. Le journal ne part donc nulle part. Il s'accumule dans le
   navigateur et s'exporte par un bouton, en un fichier que l'on classe à la
   main. Pas de collecte silencieuse, pas de serveur, pas de compte.

   Deux questions, pas plus, et c'est délibéré : un quiz long sur un moteur
   qui produit encore des plans faux récolte du bruit et fatigue le
   répondant. Le défaut principal reste un mot libre — la liste fermée ne
   viendra qu'alimentée par les mots les plus fréquents, ce qui est la façon
   la moins arbitraire de construire des options.

   La paire de questions n'est pas redondante : « inspirant » est défini
   dans ce projet comme *non* à « y auriez-vous pensé ? » et *oui* à « y
   habiteriez-vous ? ». Une seule des deux ne mesurerait rien de tel.

   BIAIS, à ne jamais perdre de vue : ce quiz est rempli par qui développe le
   moteur, ou par des proches. Ce n'est pas une mesure à l'aveugle. Il donne
   une tendance longitudinale — est-ce que ça s'améliore ? — pas une vérité
   sur la qualité. Le panel du §6.2 étalonne, ce journal suit. */
(function (root) {
  'use strict';

  var CLE = 'technohab:eval:v1';
  // Le schéma est versionné à part du moteur : une entrée relue dans six
  // mois doit dire d'elle-même si ses champs sont ceux qu'on attend.
  var SCHEMA = 1;
  var MAX = 500;

  /* Les plans déjà jugés sont retenus d'une visite à l'autre, et ce n'est pas
     un détail de confort : sans graine explicite, `generate()` tire la même
     graine déterministe des mêmes options. Rouvrir la page redonne donc le
     même plan, et le quiz redemanderait un avis déjà donné — on compterait
     deux fois le même jugement. */
  var CLE_JUGES = 'technohab:eval:juges:v1';
  var MAX_JUGES = 200;

  var journal = [];
  var contexteCourant = null;
  var racine = null;
  var repondu = {};

  function charger() {
    try { journal = JSON.parse(localStorage.getItem(CLE)) || []; } catch (_) { journal = []; }
    if (!Array.isArray(journal)) journal = [];
    try {
      (JSON.parse(localStorage.getItem(CLE_JUGES)) || []).forEach(function (cle) { repondu[cle] = true; });
    } catch (_) { /* facultatif */ }
  }
  function sauver() {
    try { localStorage.setItem(CLE, JSON.stringify(journal.slice(0, MAX))); } catch (_) { /* facultatif */ }
  }
  function marquerJuge(cle) {
    repondu[cle] = true;
    try {
      localStorage.setItem(CLE_JUGES, JSON.stringify(Object.keys(repondu).slice(-MAX_JUGES)));
    } catch (_) { /* facultatif */ }
  }

  /* Les métriques sont recalculées ici et non reprises de l'affichage : ce
     qui est montré est mis en forme, ce qui est journalisé doit être
     comparable d'une version à l'autre. */
  function mesures(plan, rapport) {
    var fit = root.TechnoHabFit;
    var meublables = 0, total = 0, nonRect = 0;
    plan.rooms.forEach(function (piece) {
      total += 1;
      if (piece.edgeCount > 4) nonRect += 1;
      if (piece.furnishable === true) meublables += 1;
      else if (typeof piece.furnishable !== 'boolean' && fit && fit.fits) {
        var u = piece.usableBounds || piece.usableRect;
        var rectangle = !piece.usablePolygon || !piece.usablePolygon.length ||
          (root.TechnoHabPlacement && root.TechnoHabPlacement.polygonIsRectangle(piece.usablePolygon));
        if (rectangle && fit.fits(piece.type, u.x1 - u.x0, u.y1 - u.y0)) meublables += 1;
      }
    });
    var circulation = plan.rooms.filter(function (p) { return p.type === 'circulation'; })
      .reduce(function (somme, p) { return somme + p.area; }, 0);
    var attribuee = plan.rooms.reduce(function (somme, p) { return somme + p.area; }, 0);
    return {
      // Le score interne : c'est lui dont on veut savoir s'il a un rapport
      // avec le jugement humain. Sans lui dans l'entrée, la corrélation qui
      // justifie ce journal ne se calcule pas.
      scoreInterne: plan.score,
      candidat: plan.candidate, budget: plan.budget,
      pieces: total,
      partMeublable: total ? Math.round(meublables / total * 1000) / 1000 : null,
      partNonRectangulaire: total ? Math.round(nonRect / total * 1000) / 1000 : null,
      partCirculation: plan.boundary.area ? Math.round(circulation / plan.boundary.area * 1000) / 1000 : null,
      ecartSurface: Math.round(Math.abs(attribuee - plan.boundary.area) * 1000) / 1000,
      bloquantes: rapport.summary.hard,
      conseils: rapport.summary.guideline,
      limitesMoteur: rapport.summary.limites,
      violations: rapport.violations.length,
      reglesDeclenchees: rapport.violations.map(function (v) { return v.ruleId; })
    };
  }

  /* Appelé par `app.js` à chaque génération. Le contexte est retenu tel quel :
     si la personne répond trois plans plus tard, c'est le plan affiché au
     moment de la réponse qui compte, pas le dernier généré. */
  function contexte(plan, rapport, versionMoteur) {
    contexteCourant = {
      schema: SCHEMA,
      // Sans la graine, le jugement n'est pas rejouable, donc perdu.
      graine: plan.seed || null,
      graineValeur: typeof plan.seedValue === 'number' ? plan.seedValue : null,
      variante: plan.variant,
      // Sans la version, on mélangera des avis portant sur des plans que le
      // même code ne produit plus.
      versionMoteur: versionMoteur || null,
      versionSchemaPlan: plan.schemaVersion,
      moteur: plan.generator,
      forme: plan.boundary.shape,
      formeDemandee: plan.boundary.demandee,
      formeDegradee: Boolean(plan.boundary.degradee),
      enveloppe: { largeur: plan.boundary.width, hauteur: plan.boundary.height, surface: plan.boundary.area },
      options: plan.options,
      metriques: mesures(plan, rapport)
    };
    // Une clé par plan : le quiz ne se repose pas pour un plan déjà jugé, et
    // rejouer une graine n'écrase pas l'avis précédent.
    var cle = (contexteCourant.graine || 'v' + plan.variant) + ':' + (versionMoteur || '');
    contexteCourant.cle = cle;
    rendre(!repondu[cle]);
  }

  function enregistrer(reponses) {
    if (!contexteCourant) return;
    var entree = Object.assign({}, contexteCourant, {
      horodatage: new Date().toISOString(),
      reponses: reponses
    });
    delete entree.cle;
    journal.unshift(entree);
    journal = journal.slice(0, MAX);
    sauver();
    marquerJuge(contexteCourant.cle);
  }

  // --- Interface -----------------------------------------------------------
  // Le quiz ne bloque rien : il s'affiche sous le plan, se refuse d'un
  // bouton, et son refus vaut pour ce plan seulement.

  function bouton(texte, valeur, nom) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'quiz-choice';
    b.textContent = texte;
    b.dataset.champ = nom;
    b.dataset.valeur = valeur;
    b.setAttribute('aria-pressed', 'false');
    return b;
  }

  function question(texte, nom, etat) {
    var bloc = document.createElement('div');
    bloc.className = 'quiz-question';
    var libelle = document.createElement('p');
    libelle.className = 'quiz-label';
    libelle.id = 'quiz-' + nom + '-label';
    libelle.textContent = texte;
    bloc.appendChild(libelle);
    var groupe = document.createElement('div');
    groupe.className = 'quiz-choices';
    groupe.setAttribute('role', 'group');
    groupe.setAttribute('aria-labelledby', libelle.id);
    [['Oui', 'oui'], ['Non', 'non']].forEach(function (paire) {
      var b = bouton(paire[0], paire[1], nom);
      b.addEventListener('click', function () {
        etat[nom] = etat[nom] === paire[1] ? null : paire[1];
        Array.prototype.forEach.call(groupe.children, function (autre) {
          autre.setAttribute('aria-pressed', autre.dataset.valeur === etat[nom] ? 'true' : 'false');
        });
      });
      groupe.appendChild(b);
    });
    bloc.appendChild(groupe);
    return bloc;
  }

  function rendre(visible) {
    if (!racine) return;
    racine.innerHTML = '';
    racine.hidden = !visible;
    if (!visible) return;

    var etat = { habiterais: null, pense: null };

    var titre = document.createElement('p');
    titre.className = 'quiz-title';
    titre.textContent = 'Deux questions sur ce plan';
    racine.appendChild(titre);

    var note = document.createElement('p');
    note.className = 'quiz-note';
    note.textContent = 'Facultatif. Les réponses restent dans ce navigateur et ne sont transmises à personne.';
    racine.appendChild(note);

    racine.appendChild(question('Y habiteriez-vous ?', 'habiterais', etat));
    racine.appendChild(question('Y auriez-vous pensé ?', 'pense', etat));

    var champBloc = document.createElement('div');
    champBloc.className = 'quiz-question';
    var champLabel = document.createElement('label');
    champLabel.className = 'quiz-label';
    champLabel.setAttribute('for', 'quiz-defaut');
    champLabel.textContent = 'Le défaut principal, en un mot';
    var champ = document.createElement('input');
    champ.type = 'text';
    champ.id = 'quiz-defaut';
    champ.className = 'quiz-input';
    champ.maxLength = 24;
    champ.autocomplete = 'off';
    champ.placeholder = 'couloir, sombre, exigu…';
    champBloc.appendChild(champLabel);
    champBloc.appendChild(champ);
    racine.appendChild(champBloc);

    var actions = document.createElement('div');
    actions.className = 'quiz-actions';

    var valider = document.createElement('button');
    valider.type = 'button';
    valider.className = 'secondary-button';
    valider.textContent = 'Enregistrer mon avis';
    valider.addEventListener('click', function () {
      // Un mot, et vraiment un mot : le champ est libre pour ne pas imposer
      // de vocabulaire, pas pour recueillir des phrases qu'on ne saurait
      // pas dépouiller.
      var mot = (champ.value || '').trim().split(/\s+/)[0] || null;
      enregistrer({ habiterais: etat.habiterais, pense: etat.pense, defaut: mot ? mot.toLowerCase() : null });
      accuse('Avis enregistré. ' + journal.length + ' dans le journal.');
    });

    var passer = document.createElement('button');
    passer.type = 'button';
    passer.className = 'quiz-skip';
    passer.textContent = 'Passer';
    passer.addEventListener('click', function () {
      // Un refus vaut pour ce plan, et il tient : redemander à chaque
      // rechargement transformerait un dispositif facultatif en insistance.
      if (contexteCourant) marquerJuge(contexteCourant.cle);
      rendre(false);
    });

    actions.appendChild(valider);
    actions.appendChild(passer);
    racine.appendChild(actions);
  }

  function accuse(texte) {
    if (!racine) return;
    racine.innerHTML = '';
    var p = document.createElement('p');
    p.className = 'quiz-note';
    p.setAttribute('role', 'status');
    p.textContent = texte;
    racine.appendChild(p);
  }

  function exporter() {
    return {
      schema: SCHEMA,
      exporteLe: new Date().toISOString(),
      // Le biais voyage avec les données : un fichier relu plus tard sans
      // cette phrase pourrait passer pour une mesure à l'aveugle.
      avertissement: 'Journal d’auto-évaluation, non aveugle. Tendance longitudinale, pas mesure de qualité absolue (ROADMAP §6.4).',
      entrees: journal
    };
  }

  charger();

  root.TechnoHabEvaluation = {
    contexte: contexte,
    exporter: exporter,
    journal: function () { return journal.slice(); },
    vider: function () {
      journal = []; repondu = {}; sauver();
      try { localStorage.removeItem(CLE_JUGES); } catch (_) { /* facultatif */ }
    },
    monter: function (element) { racine = element; if (racine) racine.hidden = true; }
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
