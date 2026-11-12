(function () {
  'use strict';
  var builder = document.querySelector('.setup-builder');
  if (!builder) return;
  var radios = Array.from(builder.querySelectorAll('input[name="setup-route"]'));
  var panels = Array.from(builder.querySelectorAll('[data-setup-panel]'));
  var tools = builder.querySelector('.supply-tools');
  var count = document.getElementById('supply-count');
  var current = 'kit';
  var owned = {};
  var crops = window.SSG_CROPS || {};
  var grow = typeof ssgParseGrow === 'function' ? ssgParseGrow(window.location.search) : { ok: false };
  var growResult = (grow.ok && typeof ssgComputeGrow === 'function') ? ssgComputeGrow(grow, crops) : null;
  var match = (grow.ok && typeof ssgMatchSupplies === 'function') ? ssgMatchSupplies(grow, growResult) : null;

  function activePanel() {
    return panels.find(function (panel) { return panel.dataset.setupPanel === current; });
  }
  function cardRole(card) {
    return card.dataset.role || '';
  }
  function cardGroup(card) {
    if (!match) {
      if (card.dataset.optional === '1' || (card.dataset.role || '').indexOf('optional-') === 0) return 'optional';
      var role = card.dataset.role || '';
      if ((role === 'growing-holes' || role === 'catch-solid') && card.dataset.nominal && card.dataset.nominal !== '10x20') return 'alternative';
      if (role === 'seed' && card.dataset.crop && card.dataset.crop !== 'mixed') return 'alternative';
      return 'essential';
    }
    return match.recommend({
      role: card.dataset.role || '',
      nominal: card.dataset.nominal || '',
      crop: card.dataset.crop || '',
      id: card.dataset.product || ''
    });
  }
  function isOwnedRole(role) {
    if (!role) return false;
    if (owned[role]) return true;
    if ((role === 'growing-holes' || role === 'catch-solid') && owned['trays']) return true;
    if ((role === 'seed' || role === 'seed-collection') && owned['seed']) return true;
    if (role === 'medium-mix' || role === 'medium-coir') return !!owned['medium-mix'] || !!owned['medium-coir'];
    return false;
  }
  function essentialCards(route) {
    return Array.from(builder.querySelectorAll('[data-routes]')).filter(function (card) {
      if (card.dataset.routes.split(' ').indexOf(route) === -1) return false;
      var group = cardGroup(card);
      return group === 'essential';
    });
  }
  function updateCount() {
    var still = document.querySelectorAll('.supply-group-needed .pick:not([hidden])').length;
    if (!document.querySelector('.supply-groups')) {
      still = essentialCards(current).filter(function (card) { return !isOwnedRole(cardRole(card)); }).length;
    }
    if (count) count.textContent = still ? still + ' essential' + (still === 1 ? '' : 's') + ' left to gather' : 'You have the essentials on this list.';
  }
  var routePicks = Array.from(builder.querySelectorAll('[data-routes]'));
  var routeStatus = document.getElementById('route-picks-status');
  var routeNames = { kit: 'kit', tray: 'reusable-tray', reuse: 'reused-container' };

  function readOwnership() {
    owned = {};
    panels.forEach(function (panel) {
      if (panel.dataset.setupPanel !== current) return;
      Array.from(panel.querySelectorAll('[data-supply]')).forEach(function (box) {
        var role = box.getAttribute('data-role');
        if (role && box.checked) owned[role] = true;
      });
    });
  }
  function applyOwnershipToBoxes() {
    panels.forEach(function (panel) {
      Array.from(panel.querySelectorAll('[data-supply]')).forEach(function (box) {
        var role = box.getAttribute('data-role');
        if (!role) return;
        var should = isOwnedRole(role) || !!owned[role];
        if (box.checked !== should) box.checked = should;
      });
    });
  }
  function ensureGroups() {
    var list = document.getElementById('matching-supplies');
    if (!list) return null;
    var existing = list.querySelector('.supply-groups');
    if (existing) return existing;
    var wrap = document.createElement('div');
    wrap.className = 'supply-groups';
    function section(id, title) {
      var sec = document.createElement('section');
      sec.className = 'supply-group supply-group-' + id;
      sec.id = 'supply-group-' + id;
      var h = document.createElement('h4');
      h.id = 'supply-group-' + id + '-title';
      h.textContent = title;
      sec.setAttribute('aria-labelledby', h.id);
      var ul = document.createElement('ul');
      ul.className = 'pick-grid';
      ul.setAttribute('role', 'list');
      sec.appendChild(h);
      sec.appendChild(ul);
      wrap.appendChild(sec);
      return ul;
    }
    section('needed', 'Still needed');
    section('owned', 'Already have');
    section('optional', 'Optional after your first grow');
    section('alternative', 'Alternatives');
    var grid = list.querySelector('.pick-grid');
    if (grid) list.insertBefore(wrap, grid);
    else list.appendChild(wrap);
    return wrap;
  }
  function placeCards(route) {
    var groups = ensureGroups();
    var original = document.querySelector('#matching-supplies > ul.pick-grid');
    var shown = 0;
    routePicks.forEach(function (card) {
      var onRoute = card.dataset.routes.split(' ').indexOf(route) !== -1;
      var group = onRoute ? cardGroup(card) : 'hide';
      if (group === 'hide' || !onRoute) {
        card.hidden = true;
        if (original && card.parentElement !== original) original.appendChild(card);
        return;
      }
      card.hidden = false;
      shown += 1;
      Array.from(card.querySelectorAll('img[loading="lazy"]')).forEach(function (img) { img.loading = 'eager'; });
      var ownedCard = isOwnedRole(cardRole(card)) && group === 'essential';
      var bucket = ownedCard ? 'owned' : (group === 'optional' ? 'optional' : (group === 'alternative' ? 'alternative' : 'needed'));
      if (groups) {
        var ul = groups.querySelector('.supply-group-' + bucket + ' .pick-grid');
        if (ul) ul.appendChild(card);
      }
    });
    if (groups) {
      Array.from(groups.querySelectorAll('.supply-group')).forEach(function (sec) {
        var has = sec.querySelector('.pick:not([hidden])');
        sec.hidden = !has;
      });
    }
    if (routeStatus && routePicks.length) {
      routeStatus.textContent = shown + ' supplies for your ' + routeNames[route] + ' list.';
      routeStatus.hidden = false;
    }
  }
  function renderHandoff() {
    var box = document.getElementById('grow-handoff');
    if (!box) return;
    if (!grow.ok || !grow.crop && !grow.tray) {
      box.hidden = true;
      return;
    }
    var label = (typeof ssgFormatGrowLabel === 'function') ? ssgFormatGrowLabel(grow, growResult, crops) : '';
    var summary = box.querySelector('[data-grow-summary]');
    var setup = box.querySelector('[data-grow-setup]');
    var note = box.querySelector('[data-grow-note]');
    var edit = box.querySelector('[data-grow-edit]');
    if (summary) summary.textContent = label || 'Your selected grow';
    if (setup && match && typeof ssgSetupCopy === 'function') setup.textContent = ssgSetupCopy(grow, growResult, match, crops);
    if (note) {
      if (match && match.trayNote) {
        note.hidden = false;
        note.textContent = match.trayNote;
      } else {
        note.hidden = true;
      }
    }
    if (edit && typeof ssgCalculatorHref === 'function') {
      edit.href = ssgCalculatorHref(grow);
      edit.hidden = false;
    }
    box.hidden = false;
  }
  function showRoutePicks(route) {
    placeCards(route);
  }
  function selectRoute(route, updateUrl) {
    if (!radios.some(function (radio) { return radio.value === route; })) route = 'kit';
    current = route;
    radios.forEach(function (radio) { radio.checked = radio.value === route; });
    panels.forEach(function (panel) { panel.hidden = panel.dataset.setupPanel !== route; });
    applyOwnershipToBoxes();
    readOwnership();
    showRoutePicks(route);
    updateCount();
    if (updateUrl && window.history && window.history.replaceState) {
      var url = new URL(window.location.href);
      url.searchParams.set('setup', route);
      if (['#kit', '#tray', '#reuse'].indexOf(url.hash) !== -1) url.hash = '#setup-list';
      window.history.replaceState(null, '', url.pathname + url.search + url.hash);
    }
  }
  function routeFromLocation() {
    if (grow.setup) return grow.setup;
    var anchor = window.location.hash.slice(1);
    return ['kit', 'tray', 'reuse'].indexOf(anchor) !== -1 ? anchor : new URLSearchParams(window.location.search).get('setup');
  }
  radios.forEach(function (radio) {
    radio.addEventListener('change', function () {
      selectRoute(radio.value, true);
      if (typeof window.gtag === 'function') window.gtag('event', 'setup_select', { setup_route: current });
    });
  });
  builder.addEventListener('change', function (event) {
    if (event.target.matches('[data-supply]')) {
      var role = event.target.getAttribute('data-role');
      if (role) owned[role] = event.target.checked;
      applyOwnershipToBoxes();
      showRoutePicks(current);
      updateCount();
    }
  });
  window.addEventListener('hashchange', function () {
    var route = routeFromLocation();
    if (route && route !== current) selectRoute(route, false);
  });
  renderHandoff();
  selectRoute(routeFromLocation(), false);
  if (tools) tools.hidden = false;
})();
