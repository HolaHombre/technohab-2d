(function (root) {
  'use strict';

  var data = root.TechnoHabAnalysisData;
  if (!data) throw new Error('TechnoHabAnalysis : analysis.data.js doit être chargé en premier.');

  var STORAGE_KEY = 'technohab:analyses:v1';
  var SVG_NS = 'http://www.w3.org/2000/svg';
  var controller = null;

  function element(name, className, text) {
    var node = document.createElement(name);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function readDrafts() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch (_) { return {}; }
  }

  function writeDrafts(drafts) {
    try {
      var entries = Object.keys(drafts).map(function (key) {
        return { key: key, updatedAt: drafts[key].updatedAt || '' };
      }).sort(function (a, b) { return b.updatedAt.localeCompare(a.updatedAt); });
      entries.slice(80).forEach(function (entry) { delete drafts[entry.key]; });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts));
    } catch (_) { /* Le stockage local reste facultatif. */ }
  }

  function emptyDraft(key, context) {
    return {
      format: data.format,
      schemaVersion: data.version,
      planKey: key,
      seed: context.result.plan.seed,
      rank: context.result.selectionIndex + 1,
      ratings: {},
      notes: {},
      mode: 'complete',
      synthesis: '',
      firstCorrection: '',
      updatedAt: new Date().toISOString()
    };
  }

  function planKey(context) {
    if (!context || !context.result) return null;
    return [context.result.plan.seed, context.result.selectionIndex + 1,
      context.result.plan.variant || 1].join(':');
  }

  function navigationPerformance() {
    if (!root.performance || !root.performance.getEntriesByType) return null;
    var entry = root.performance.getEntriesByType('navigation')[0];
    if (!entry) return null;
    return {
      domContentLoadedMs: Math.round(entry.domContentLoadedEventEnd * 10) / 10,
      loadCompleteMs: Math.round(entry.loadEventEnd * 10) / 10,
      transferredBytes: Number(entry.transferSize || 0),
      decodedBytes: Number(entry.decodedBodySize || 0)
    };
  }

  function clonePlanSvg(source) {
    var clone = source.cloneNode(true);
    clone.setAttribute('xmlns', SVG_NS);
    clone.setAttribute('aria-hidden', 'true');
    clone.removeAttribute('role');

    var defs = document.createElementNS(SVG_NS, 'defs');
    var copied = {};
    Array.prototype.forEach.call(clone.querySelectorAll('use'), function (use) {
      var href = use.getAttribute('href') || use.getAttribute('xlink:href');
      if (!href || href.charAt(0) !== '#' || copied[href]) return;
      var symbol = document.getElementById(href.slice(1));
      if (!symbol) return;
      copied[href] = true;
      defs.appendChild(symbol.cloneNode(true));
    });
    if (defs.childNodes.length) clone.insertBefore(defs, clone.firstChild);

    var sourceNodes = [source].concat(Array.prototype.slice.call(source.querySelectorAll('*')));
    var cloneNodes = [clone].concat(Array.prototype.slice.call(clone.querySelectorAll('*')).slice(defs.childNodes.length ? defs.querySelectorAll('*').length + 1 : 0));
    var properties = [
      'fill', 'stroke', 'stroke-width', 'stroke-dasharray', 'stroke-linecap',
      'stroke-linejoin', 'opacity', 'color', 'font-family', 'font-size',
      'font-weight', 'letter-spacing', 'text-transform', 'text-anchor',
      'dominant-baseline', 'shape-rendering'
    ];
    sourceNodes.forEach(function (node, index) {
      var target = cloneNodes[index];
      if (!target) return;
      var computed = root.getComputedStyle(node);
      var styles = properties.map(function (property) {
        return property + ':' + computed.getPropertyValue(property);
      }).join(';');
      target.setAttribute('style', styles);
    });

    Array.prototype.forEach.call(clone.querySelectorAll('.room-info'), function (node) {
      node.style.opacity = '1';
    });
    Array.prototype.forEach.call(clone.querySelectorAll('.room-furniture'), function (node) {
      node.style.opacity = '.48';
    });
    return clone;
  }

  function rasterizePlan(source) {
    return new Promise(function (resolve, reject) {
      if (!source || !source.getAttribute('viewBox')) {
        reject(new Error('Le plan actif ne possède pas de cadre SVG exportable.'));
        return;
      }
      var clone = clonePlanSvg(source);
      var viewBox = source.getAttribute('viewBox').trim().split(/\s+/).map(Number);
      var ratio = viewBox[3] > 0 ? viewBox[2] / viewBox[3] : 1.4;
      var width = 1800;
      var height = Math.max(900, Math.min(1800, Math.round(width / ratio)));
      clone.setAttribute('width', width);
      clone.setAttribute('height', height);
      var serialized = new XMLSerializer().serializeToString(clone);
      var svgUrl = URL.createObjectURL(new Blob([serialized], { type: 'image/svg+xml;charset=utf-8' }));
      var image = new Image();
      image.onload = function () {
        var canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        var drawing = canvas.getContext('2d');
        if (!drawing) {
          URL.revokeObjectURL(svgUrl);
          reject(new Error('Le navigateur ne fournit pas de surface de dessin 2D.'));
          return;
        }
        try {
          drawing.fillStyle = '#0B0B0B';
          drawing.fillRect(0, 0, width, height);
          drawing.drawImage(image, 0, 0, width, height);
        } catch (error) {
          URL.revokeObjectURL(svgUrl);
          reject(error);
          return;
        }
        URL.revokeObjectURL(svgUrl);
        canvas.toBlob(function (blob) {
          if (!blob) reject(new Error('Le navigateur n’a pas produit le PNG du plan.'));
          else blob.arrayBuffer().then(function (buffer) {
            resolve({ bytes: new Uint8Array(buffer), width: width, height: height });
          }, reject);
        }, 'image/png');
      };
      image.onerror = function () {
        URL.revokeObjectURL(svgUrl);
        reject(new Error('Le dessin SVG n’a pas pu être converti en PNG.'));
      };
      image.src = svgUrl;
    });
  }

  function crcTable() {
    var table = new Uint32Array(256);
    for (var index = 0; index < 256; index += 1) {
      var value = index;
      for (var bit = 0; bit < 8; bit += 1) value = value & 1 ? 0xEDB88320 ^ (value >>> 1) : value >>> 1;
      table[index] = value >>> 0;
    }
    return table;
  }

  var CRC_TABLE = crcTable();
  function crc32(bytes) {
    var crc = 0xFFFFFFFF;
    for (var index = 0; index < bytes.length; index += 1) crc = CRC_TABLE[(crc ^ bytes[index]) & 0xFF] ^ (crc >>> 8);
    return (crc ^ 0xFFFFFFFF) >>> 0;
  }

  function write16(view, offset, value) { view.setUint16(offset, value, true); }
  function write32(view, offset, value) { view.setUint32(offset, value >>> 0, true); }

  function dosDateTime(date) {
    return {
      time: (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2),
      date: ((date.getFullYear() - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate()
    };
  }

  function concatBytes(parts) {
    var length = parts.reduce(function (sum, part) { return sum + part.length; }, 0);
    var result = new Uint8Array(length);
    var offset = 0;
    parts.forEach(function (part) { result.set(part, offset); offset += part.length; });
    return result;
  }

  function zipStored(files) {
    var encoder = new TextEncoder();
    var stamp = dosDateTime(new Date());
    var localParts = [];
    var centralParts = [];
    var localOffset = 0;

    files.forEach(function (file) {
      var name = encoder.encode(file.name);
      var bytes = file.bytes;
      var checksum = crc32(bytes);
      var local = new Uint8Array(30 + name.length);
      var localView = new DataView(local.buffer);
      write32(localView, 0, 0x04034B50); write16(localView, 4, 20); write16(localView, 6, 0x0800);
      write16(localView, 8, 0); write16(localView, 10, stamp.time); write16(localView, 12, stamp.date);
      write32(localView, 14, checksum); write32(localView, 18, bytes.length); write32(localView, 22, bytes.length);
      write16(localView, 26, name.length); write16(localView, 28, 0); local.set(name, 30);
      localParts.push(local, bytes);

      var central = new Uint8Array(46 + name.length);
      var centralView = new DataView(central.buffer);
      write32(centralView, 0, 0x02014B50); write16(centralView, 4, 20); write16(centralView, 6, 20);
      write16(centralView, 8, 0x0800); write16(centralView, 10, 0); write16(centralView, 12, stamp.time);
      write16(centralView, 14, stamp.date); write32(centralView, 16, checksum);
      write32(centralView, 20, bytes.length); write32(centralView, 24, bytes.length);
      write16(centralView, 28, name.length); write16(centralView, 30, 0); write16(centralView, 32, 0);
      write16(centralView, 34, 0); write16(centralView, 36, 0); write32(centralView, 38, 0);
      write32(centralView, 42, localOffset); central.set(name, 46);
      centralParts.push(central);
      localOffset += local.length + bytes.length;
    });

    var centralBytes = concatBytes(centralParts);
    var end = new Uint8Array(22);
    var endView = new DataView(end.buffer);
    write32(endView, 0, 0x06054B50); write16(endView, 4, 0); write16(endView, 6, 0);
    write16(endView, 8, files.length); write16(endView, 10, files.length);
    write32(endView, 12, centralBytes.length); write32(endView, 16, localOffset); write16(endView, 20, 0);
    return concatBytes(localParts.concat([centralBytes, end]));
  }

  function downloadBlob(filename, blob) {
    var url = URL.createObjectURL(blob);
    var link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    root.setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  function mount(options) {
    if (controller) return controller;
    var panel = document.getElementById('analysis-panel');
    var trigger = document.getElementById('analysis-open');
    var closeButton = document.getElementById('analysis-close');
    var grid = document.getElementById('analysis-grid');
    var meta = document.getElementById('analysis-meta');
    var help = document.getElementById('analysis-cell-help');
    var progress = document.getElementById('analysis-progress');
    var status = document.getElementById('analysis-status');
    var synthesis = document.getElementById('analysis-synthesis');
    var correction = document.getElementById('analysis-first-correction');
    var panelExport = document.getElementById('analysis-export-panel');
    var modeInputs = panel.querySelectorAll('input[name="analysis-mode"]');
    var planView = document.getElementById('plan-view');
    var planSvg = document.getElementById('plan-svg');
    var drafts = readDrafts();
    var draft = null;
    var currentKey = null;
    var lastFocus = null;

    function context() { return options.getContext(); }

    function saveDraft() {
      if (!draft || !currentKey) return;
      draft.updatedAt = new Date().toISOString();
      drafts[currentKey] = draft;
      writeDrafts(drafts);
    }

    function answeredCount() {
      return data.criteria.filter(function (criterion) { return Boolean(draft && draft.ratings[criterion.id]); }).length;
    }

    function isComplete() {
      if (!draft) return false;
      if (draft.mode === 'short') return Boolean(draft.synthesis && draft.firstCorrection);
      return answeredCount() === data.criteria.length;
    }

    function updateProgress(message) {
      var count = answeredCount();
      progress.textContent = draft && draft.mode === 'short'
        ? 'Deux réponses de synthèse.' : count + '/' + data.criteria.length + ' points renseignés.';
      progress.dataset.state = isComplete() ? 'complete' : 'partial';
      panelExport.disabled = !isComplete();
      if (message !== undefined) status.textContent = message;
    }

    function setHelp(criterion, rating) {
      help.textContent = criterion.label + ' · ' + rating.label + ' — ' + rating.description;
    }

    function selectRating(criterionId, ratingId) {
      if (!draft) return;
      draft.ratings[criterionId] = ratingId;
      Array.prototype.forEach.call(grid.querySelectorAll('[data-criterion="' + criterionId + '"]'), function (button) {
        button.setAttribute('aria-checked', button.dataset.rating === ratingId ? 'true' : 'false');
        button.tabIndex = button.dataset.rating === ratingId ? 0 : -1;
      });
      saveDraft();
      updateProgress('Brouillon enregistré dans ce navigateur.');
    }

    function renderGrid() {
      grid.innerHTML = '';
      data.criteria.forEach(function (criterion) {
        var row = element('section', 'analysis-row');
        row.setAttribute('aria-labelledby', 'analysis-criterion-' + criterion.id);
        var heading = element('div', 'analysis-row-heading');
        var title = element('h4', '', criterion.label);
        title.id = 'analysis-criterion-' + criterion.id;
        heading.appendChild(title);
        heading.appendChild(element('p', '', criterion.description));
        row.appendChild(heading);

        var choices = element('div', 'analysis-choices');
        choices.setAttribute('role', 'radiogroup');
        choices.setAttribute('aria-label', 'Évaluation — ' + criterion.label);
        data.ratings.forEach(function (rating, ratingIndex) {
          var choice = element('button', 'analysis-choice', rating.shortLabel);
          choice.type = 'button';
          choice.dataset.criterion = criterion.id;
          choice.dataset.rating = rating.id;
          choice.setAttribute('role', 'radio');
          choice.setAttribute('aria-checked', 'false');
          choice.setAttribute('aria-describedby', 'analysis-cell-help');
          choice.tabIndex = ratingIndex === 0 ? 0 : -1;
          choice.addEventListener('mouseenter', function () { setHelp(criterion, rating); });
          choice.addEventListener('focus', function () { setHelp(criterion, rating); });
          choice.addEventListener('click', function () { selectRating(criterion.id, rating.id); });
          choice.addEventListener('keydown', function (event) {
            var next = null;
            if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
              next = (ratingIndex + 1) % data.ratings.length;
            } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
              next = (ratingIndex - 1 + data.ratings.length) % data.ratings.length;
            } else if (event.key === 'Home') next = 0;
            else if (event.key === 'End') next = data.ratings.length - 1;
            if (next === null) return;
            event.preventDefault();
            var nextRating = data.ratings[next];
            selectRating(criterion.id, nextRating.id);
            choices.querySelector('[data-rating="' + nextRating.id + '"]').focus();
          });
          choices.appendChild(choice);
        });
        row.appendChild(choices);

        var noteLabel = element('label', 'analysis-note-label', 'Constat concret — facultatif');
        var note = element('textarea', 'analysis-note');
        note.rows = 2;
        note.maxLength = 600;
        note.dataset.note = criterion.id;
        note.setAttribute('aria-label', 'Constat concret — ' + criterion.label);
        note.addEventListener('input', function () {
          draft.notes[criterion.id] = note.value.trim();
          saveDraft();
        });
        noteLabel.appendChild(note);
        row.appendChild(noteLabel);
        grid.appendChild(row);
      });
    }

    function applyDraft() {
      if (!draft) return;
      data.criteria.forEach(function (criterion) {
        var rating = draft.ratings[criterion.id];
        Array.prototype.forEach.call(grid.querySelectorAll('[data-criterion="' + criterion.id + '"]'), function (button, index) {
          var checked = button.dataset.rating === rating;
          button.setAttribute('aria-checked', checked ? 'true' : 'false');
          button.tabIndex = checked || (!rating && index === 0) ? 0 : -1;
        });
        var note = grid.querySelector('[data-note="' + criterion.id + '"]');
        if (note) note.value = draft.notes[criterion.id] || '';
      });
      synthesis.value = draft.synthesis || '';
      correction.value = draft.firstCorrection || '';
      draft.mode = draft.mode === 'short' ? 'short' : 'complete';
      panel.dataset.mode = draft.mode;
      Array.prototype.forEach.call(modeInputs, function (input) { input.checked = input.value === draft.mode; });
      updateProgress('Brouillon lié à ce plan.');
    }

    function setPlan() {
      var active = context();
      currentKey = planKey(active);
      if (!currentKey) {
        draft = null;
        meta.textContent = 'Aucun plan actif.';
        return;
      }
      draft = drafts[currentKey] || emptyDraft(currentKey, active);
      var result = active.result;
      var selection = result.resolvedSelection && result.resolvedSelection.selection;
      var performanceText = active.performance && Number.isFinite(active.performance.elapsedMs)
        ? ' · génération ' + Math.round(active.performance.elapsedMs) + ' ms' : '';
      meta.textContent = 'Graine ' + result.plan.seed + ' · plan ' + (result.selectionIndex + 1) + '/' +
        (selection ? selection.results.length : 1) + ' · ' + result.programResolution.status + performanceText;
      applyDraft();
    }

    function open() {
      if (!context().result) return;
      setPlan();
      if (panel.hidden) lastFocus = document.activeElement;
      panel.hidden = false;
      planView.classList.add('analysis-open');
      trigger.setAttribute('aria-expanded', 'true');
      planSvg.setAttribute('aria-hidden', 'true');
      var firstMissing = data.criteria.find(function (criterion) { return !draft.ratings[criterion.id]; });
      var focusTarget = firstMissing
        ? grid.querySelector('[data-criterion="' + firstMissing.id + '"]') : closeButton;
      if (focusTarget) focusTarget.focus();
    }

    function close() {
      if (panel.hidden) return;
      saveDraft();
      panel.hidden = true;
      planView.classList.remove('analysis-open');
      trigger.setAttribute('aria-expanded', 'false');
      planSvg.removeAttribute('aria-hidden');
      var focusTarget = lastFocus;
      lastFocus = null;
      if (focusTarget && focusTarget.focus) focusTarget.focus();
    }

    function exportData(active, exportedDraft) {
      var result = active.result;
      var selection = result.resolvedSelection && result.resolvedSelection.selection;
      var ratingLabels = {};
      data.ratings.forEach(function (rating) { ratingLabels[rating.id] = rating.label; });
      var counts = {};
      data.ratings.forEach(function (rating) { counts[rating.id] = 0; });
      var criteria = (exportedDraft.mode === 'short' ? [] : data.criteria).map(function (criterion) {
        var rating = exportedDraft.ratings[criterion.id];
        counts[rating] += 1;
        return {
          id: criterion.id,
          label: criterion.label,
          description: criterion.description,
          rating: rating,
          ratingLabel: ratingLabels[rating],
          note: exportedDraft.notes[criterion.id] || ''
        };
      });
      return {
        format: 'technohab-plan-analysis-v1',
        schemaVersion: '1.0',
        exportedAt: new Date().toISOString(),
        appVersion: active.appVersion,
        identity: {
          seed: result.plan.seed,
          rank: result.selectionIndex + 1,
          selectionSize: selection ? selection.results.length : 1,
          selectionStatus: selection ? selection.status : null,
          variant: result.plan.variant,
          topology: result.plan.topologyFamily,
          generationStatus: result.generationResult.status,
          resolutionStatus: result.programResolution.status,
          resolutionLevel: result.programResolution.level
        },
        performance: {
          generation: active.performance || null,
          navigation: navigationPerformance()
        },
        analysis: {
          mode: exportedDraft.mode || 'complete',
          complete: true,
          counts: counts,
          criteria: criteria,
          synthesis: exportedDraft.synthesis || '',
          firstCorrection: exportedDraft.firstCorrection || '',
          updatedAt: exportedDraft.updatedAt
        },
        parameters: {
          requested: result.programResolution.requestedIntent
            ? result.programResolution.requestedIntent.options : null,
          resolved: result.programResolution.resolvedIntent
            ? result.programResolution.resolvedIntent.options : null,
          plan: result.plan.options
        },
        programResolution: active.resolutionTrace,
        selection: selection ? {
          requested: selection.requested,
          status: selection.status,
          method: selection.method,
          results: selection.results.map(function (generation, index) {
            return {
              rank: index + 1,
              seed: generation.builtPlan.plan.seed,
              topology: generation.builtPlan.plan.topologyFamily,
              score: generation.builtPlan.plan.score,
              verdict: generation.verdict.report.summary
            };
          })
        } : null,
        planDocument: active.getPlanDocument(),
        logs: {
          resolutionAttempts: result.programResolution.attempts,
          currentVerdict: result.rulesReport,
          generationHistory: active.getHistory()
        },
        files: { planPng: null }
      };
    }

    function exportCurrent() {
      if (!context().result) return Promise.resolve(false);
      if (!isComplete()) {
        open();
        updateProgress(draft.mode === 'short'
          ? 'Renseignez la synthèse et la première correction avant l’export.'
          : 'Complétez les neuf points, quitte à choisir « Non observé », avant l’export.');
        var missing = draft.mode === 'short' ? null
          : data.criteria.find(function (criterion) { return !draft.ratings[criterion.id]; });
        var missingButton = missing && grid.querySelector('[data-criterion="' + missing.id + '"]');
        if (missingButton) missingButton.focus();
        else if (draft.mode === 'short') (draft.synthesis ? correction : synthesis).focus();
        return Promise.resolve(false);
      }
      panelExport.disabled = true;
      panel.setAttribute('aria-busy', 'true');
      status.textContent = 'Préparation du plan PNG et du dossier d’analyse…';
      saveDraft();
      var active = context();
      var exportedDraft = JSON.parse(JSON.stringify(draft));
      var stem = 'technohab-audit-' + active.result.plan.seed + '-p' + (active.result.selectionIndex + 1);
      return rasterizePlan(active.planSvg).then(function (png) {
        var packet = exportData(active, exportedDraft);
        packet.files.planPng = { filename: 'plan.png', width: png.width, height: png.height, mimeType: 'image/png' };
        var json = new TextEncoder().encode(JSON.stringify(packet, null, 2));
        var folder = stem + '/';
        var archive = zipStored([
          { name: folder + 'analyse.json', bytes: json },
          { name: folder + 'plan.png', bytes: png.bytes }
        ]);
        downloadBlob(stem + '.zip', new Blob([archive], { type: 'application/zip' }));
        status.textContent = 'Dossier exporté : analyse JSON et plan PNG.';
        return true;
      }).catch(function (error) {
        status.textContent = 'Export interrompu : ' + (error && error.message ? error.message : String(error));
        return false;
      }).then(function (exported) {
        panel.removeAttribute('aria-busy');
        updateProgress(status.textContent);
        return exported;
      });
    }

    renderGrid();
    synthesis.addEventListener('input', function () { if (draft) { draft.synthesis = synthesis.value.trim(); saveDraft(); updateProgress('Brouillon enregistré dans ce navigateur.'); } });
    correction.addEventListener('input', function () { if (draft) { draft.firstCorrection = correction.value.trim(); saveDraft(); updateProgress('Brouillon enregistré dans ce navigateur.'); } });
    Array.prototype.forEach.call(modeInputs, function (input) {
      input.addEventListener('change', function () {
        if (!draft || !input.checked) return;
        draft.mode = input.value;
        panel.dataset.mode = draft.mode;
        saveDraft();
        updateProgress(draft.mode === 'short' ? 'Mode court : deux réponses suffisent.' : 'Mode complet : neuf axes à renseigner.');
      });
    });
    closeButton.addEventListener('click', close);
    panelExport.addEventListener('click', exportCurrent);
    panel.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') { event.preventDefault(); close(); return; }
      if (event.key !== 'Tab') return;
      var focusable = Array.prototype.slice.call(panel.querySelectorAll('button:not(:disabled), textarea, [tabindex="0"]'))
        .filter(function (node) { return !node.hidden && node.offsetParent !== null; });
      if (!focusable.length) return;
      var first = focusable[0];
      var last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    });

    controller = { open: open, close: close, setPlan: setPlan, exportCurrent: exportCurrent };
    return controller;
  }

  root.TechnoHabAnalysis = Object.freeze({
    mount: mount,
    createArchive: zipStored
  });
})(typeof globalThis !== 'undefined' ? globalThis : this);
