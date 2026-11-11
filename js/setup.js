(function () {
  'use strict';
  var builder = document.querySelector('.setup-builder');
  if (!builder) return;
  var radios = Array.from(builder.querySelectorAll('input[name="setup-route"]'));
  var panels = Array.from(builder.querySelectorAll('[data-setup-panel]'));
  var tools = builder.querySelector('.supply-tools');
  var count = document.getElementById('supply-count');
  var current = 'kit';

  function activePanel() {
    return panels.find(function (panel) { return panel.dataset.setupPanel === current; });
  }
  function updateCount() {
    var missing = activePanel().querySelectorAll('[data-supply]:not(:checked)').length;
    count.textContent = missing ? missing + ' essential' + (missing === 1 ? '' : 's') + ' left to gather' : 'You have the essentials on this list.';
  }
  var routePicks = Array.from(builder.querySelectorAll('[data-routes]'));
  var routeStatus = document.getElementById('route-picks-status');
  var routeNames = { kit: 'kit', tray: 'reusable-tray', reuse: 'reused-container' };
  function showRoutePicks(route) {
    var shown = 0;
    routePicks.forEach(function (card) {
      var match = card.dataset.routes.split(' ').indexOf(route) !== -1;
      card.hidden = !match;
      if (match) {
        shown += 1;
        // A card that was hidden at load may still hold a deferred lazy image; fetch it now that it shows.
        Array.from(card.querySelectorAll('img[loading="lazy"]')).forEach(function (img) { img.loading = 'eager'; });
      }
    });
    if (routeStatus && routePicks.length) {
      routeStatus.textContent = shown + ' supplies for your ' + routeNames[route] + ' list.';
      routeStatus.hidden = false;
    }
  }
  function selectRoute(route, updateUrl) {
    if (!radios.some(function (radio) { return radio.value === route; })) route = 'kit';
    current = route;
    radios.forEach(function (radio) { radio.checked = radio.value === route; });
    panels.forEach(function (panel) { panel.hidden = panel.dataset.setupPanel !== route; });
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
    if (event.target.matches('[data-supply]')) updateCount();
  });
  window.addEventListener('hashchange', function () {
    var route = routeFromLocation();
    if (route && route !== current) selectRoute(route, false);
  });
  selectRoute(routeFromLocation(), false);
  tools.hidden = false;
})();
