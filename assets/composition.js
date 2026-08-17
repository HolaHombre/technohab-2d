(function (root) {
  'use strict';

  var socle = root.TechnoHabSocle;
  var placement = root.TechnoHabPlacement;
  var form = document.getElementById('composition-form');
  if (!socle || !placement || !form) return;

  var select = document.getElementById('equipment-select');
  var addButton = document.getElementById('add-equipment');
  var list = document.getElementById('composition-list');
  var empty = document.getElementById('composition-empty');
  var verdict = document.getElementById('composition-verdict');
  var selected = [];
  var catalog = {};

  Object.keys(socle.rooms).forEach(function (type) {
    var room = socle.rooms[type];
    if (!room.equipments.length) return;
    var group = document.createElement('optgroup');
    group.label = room.label;
    room.equipments.forEach(function (equipment) {
      if (catalog[equipment.id]) return;
      catalog[equipment.id] = equipment;
      var option = document.createElement('option');
      option.value = equipment.id;
      option.textContent = equipment.label + ' — ' + equipment.footprint.w.toFixed(2) + ' × ' + equipment.footprint.d.toFixed(2) + ' m';
      group.appendChild(option);
    });
    if (group.children.length) select.appendChild(group);
  });

  function resetVerdict() {
    verdict.removeAttribute('data-state');
    verdict.textContent = 'Composition modifiée — lancez la vérification.';
  }

  function renderList() {
    list.replaceChildren();
    empty.hidden = selected.length > 0;
    selected.forEach(function (equipment, index) {
      var item = document.createElement('li');
      var description = document.createElement('span');
      var remove = document.createElement('button');
      description.textContent = equipment.label + ' · ' + equipment.footprint.w.toFixed(2) + ' × ' + equipment.footprint.d.toFixed(2) + ' m';
      remove.type = 'button';
      remove.textContent = 'Retirer';
      remove.setAttribute('aria-label', 'Retirer ' + equipment.label + ' n°' + (index + 1));
      remove.addEventListener('click', function () {
        selected.splice(index, 1);
        renderList();
        resetVerdict();
      });
      item.append(description, remove);
      list.appendChild(item);
    });
  }

  addButton.addEventListener('click', function () {
    var equipment = catalog[select.value];
    if (!equipment) return;
    selected.push(equipment);
    renderList();
    resetVerdict();
  });

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    if (!form.reportValidity()) return;
    var data = new FormData(form);
    var width = Number(data.get('width'));
    var height = Number(data.get('height'));
    var result = placement.validate(selected, { w: width, h: height });
    if (result.fits) {
      verdict.dataset.state = 'accepted';
      verdict.textContent = selected.length
        ? 'Admis — les ' + selected.length + ' équipements trouvent une disposition compatible.'
        : 'Admis — la pièce vide tient dans le rectangle déclaré.';
      return;
    }
    verdict.dataset.state = 'refused';
    verdict.textContent = 'Refus — ' + result.reason.message + ' Agrandissez la pièce ou retirez cet équipement.';
  });

  verdict.textContent = 'Solveur prêt — la pièce est vide pour l’instant.';
})(typeof globalThis !== 'undefined' ? globalThis : this);
