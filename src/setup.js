(function () {
  'use strict';
  var builder = document.querySelector('.setup-builder');
  if (!builder) return;
  var radios = Array.from(builder.querySelectorAll('input[name="setup-route"]'));
  var panels = Array.from(builder.querySelectorAll('[data-setup-panel]'));
  var tools = builder.querySelector('.supply-tools');
  var count = document.getElementById('supply-count');
  var status = document.getElementById('supply-status');
  var fallback = document.getElementById('supply-copy-fallback');
  var current = 'kit';

  function activePanel() {
    return panels.find(function (panel) { return panel.dataset.setupPanel === current; });
  }
  function clearStatus() {
    status.hidden = true;
    fallback.hidden = true;
  }
  function updateCount() {
    var missing = activePanel().querySelectorAll('[data-supply]:not(:checked)').length;
    count.textContent = missing ? missing + ' essential' + (missing === 1 ? '' : 's') + ' left to gather' : 'You have the essentials on this list.';
  }
  function selectRoute(route, updateUrl) {
    if (!radios.some(function (radio) { return radio.value === route; })) route = 'kit';
    current = route;
    radios.forEach(function (radio) { radio.checked = radio.value === route; });
    panels.forEach(function (panel) { panel.hidden = panel.dataset.setupPanel !== route; });
    clearStatus();
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
    if (event.target.matches('[data-supply]')) { clearStatus(); updateCount(); }
  });
  window.addEventListener('hashchange', function () {
    var route = routeFromLocation();
    if (route && route !== current) selectRoute(route, false);
  });
  document.getElementById('copy-supplies').addEventListener('click', async function () {
    var panel = activePanel();
    var missing = Array.from(panel.querySelectorAll('[data-supply]:not(:checked)'));
    var lines = ['Small Space Greens | ' + panel.querySelector('h3').textContent];
    lines.push(missing.length ? 'Still to gather:' : 'All listed essentials are ready.');
    missing.forEach(function (input) { lines.push('- ' + input.dataset.supply); });
    lines.push('', panel.querySelector('.supply-optional').textContent, '', 'https://smallspacegreens.com/gear/?setup=' + current + '#setup-list');
    var text = lines.join('\n');
    clearStatus();
    try {
      if (!navigator.clipboard || !navigator.clipboard.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(text);
      status.textContent = 'Your supply list is copied.';
    } catch (error) {
      fallback.value = text;
      fallback.hidden = false;
      fallback.focus();
      fallback.select();
      status.textContent = 'Select and copy your supply list below.';
    }
    status.hidden = false;
    if (typeof window.gtag === 'function') window.gtag('event', 'supply_list_copy', { setup_route: current });
  });
  document.getElementById('print-supplies').addEventListener('click', function () {
    document.body.classList.add('printing-supply-list');
    window.print();
  });
  window.addEventListener('afterprint', function () { document.body.classList.remove('printing-supply-list'); });
  selectRoute(routeFromLocation(), false);
  tools.hidden = false;
})();
