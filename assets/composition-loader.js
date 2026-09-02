(function (root) {
  'use strict';

  /* Le socle et son solveur ne sont chargés qu'à la demande : ils ne pèsent
     que sur les visites qui s'en servent. Deux usages les réclament — le
     compositeur de pièces, et l'affichage du mobilier sur le plan — et ils
     doivent partager le même chargement, sinon la seconde demande retélécharge
     ce que la première a déjà obtenu. */

  function loadScript(source) {
    return new Promise(function (resolve, reject) {
      var script = document.createElement('script');
      script.src = source;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  var socleEnCours = null;

  /* Le socle seul : de quoi désigner les exigences puis calculer une pose.
     Mémoïsé, et remis à zéro en cas d'échec pour qu'une seconde tentative
     reste possible. */
  function chargerSocle() {
    if (root.TechnoHabSocle && root.TechnoHabRoomModel && root.TechnoHabPlacement) return Promise.resolve();
    if (!socleEnCours) {
      socleEnCours = loadScript('./assets/socle.data.js')
        .then(function () { return loadScript('./assets/room-model.js'); })
        .then(function () { return root.TechnoHabPlacement ? null : loadScript('./assets/placement.js'); })
        .catch(function (erreur) { socleEnCours = null; throw erreur; });
    }
    return socleEnCours;
  }

  root.TechnoHabSocleLoader = { charger: chargerSocle };

  /* --- Le compositeur, qui demande en plus son interface ------------------ */
  var composer = document.getElementById('room-composer');
  if (!composer) return;

  var loaded = false;
  var verdict = document.getElementById('composition-verdict');

  composer.addEventListener('toggle', function () {
    if (!composer.open || loaded) return;
    loaded = true;
    verdict.textContent = 'Chargement du socle et du solveur…';
    chargerSocle()
      .then(function () { return loadScript('./assets/composition.js'); })
      .catch(function () {
        loaded = false;
        verdict.textContent = 'Le solveur n’a pas pu être chargé. Refermez puis rouvrez ce volet.';
      });
  });
})(typeof globalThis !== 'undefined' ? globalThis : this);
