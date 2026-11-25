(function () {
  'use strict';
  var header = document.querySelector('.site-header');
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('primary-nav');
  if (header && toggle && nav) {
    header.classList.add('js-nav');
    toggle.hidden = false;
    function setMenu(open) {
      header.classList.toggle('menu-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.querySelector('span').textContent = open ? '−' : '+';
    }
    toggle.addEventListener('click', function () {
      setMenu(toggle.getAttribute('aria-expanded') !== 'true');
    });
    header.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setMenu(false);
        toggle.focus();
      }
    });
    nav.addEventListener('click', function (event) {
      if (event.target.closest('a')) setMenu(false);
    });
  }
  document.querySelectorAll('a[data-journey]').forEach(function (link) {
    link.addEventListener('click', function () {
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'setup_journey_click', { journey_step: link.getAttribute('data-journey') });
      }
    });
  });
  function linkType(href) {
    var url;
    try { url = new URL(href, window.location.href); } catch (e) { return 'non_affiliate'; }
    var host = url.hostname.replace(/^www\./, '');
    if (/(^|\.)amazon\.com$/.test(host) && url.searchParams.get('tag')) return 'amazon_affiliate';
    if (host === 'awin1.com' && url.searchParams.get('awinaffid')) return 'awin_affiliate';
    return 'non_affiliate';
  }
  document.querySelectorAll('a[data-product-id]').forEach(function (link) {
    link.addEventListener('click', function () {
      if (typeof window.gtag === 'function') {
        var href = link.getAttribute('href') || '';
        var domain = '';
        try { domain = new URL(href, window.location.href).hostname; } catch (e) {}
        window.gtag('event', 'merchant_click', {
          product_id: link.getAttribute('data-product-id'),
          merchant: link.getAttribute('data-merchant'),
          link_type: linkType(href),
          link_domain: domain,
          transport_type: 'beacon'
        });
      }
    });
  });
  // Engagement signals that do not depend on the page-hide beacon, which in-app
  // browsers (Pinterest, Instagram) often drop: one event after about 10 seconds
  // of visible time, and one event each at 25% and 50% scroll depth.
  if (typeof window.gtag === 'function') {
    var visibleMs = 0;
    var visibleSince = document.visibilityState === 'visible' ? Date.now() : 0;
    var engagedSent = false;
    var engagedTimer = null;
    function sendEngaged() {
      if (engagedSent) return;
      engagedSent = true;
      window.gtag('event', 'engaged_10s', { engagement_time_msec: 10000, transport_type: 'beacon' });
    }
    function armEngaged() {
      if (engagedSent || engagedTimer || document.visibilityState !== 'visible') return;
      engagedTimer = window.setTimeout(sendEngaged, Math.max(0, 10000 - visibleMs));
    }
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'visible') {
        visibleSince = Date.now();
        armEngaged();
      } else {
        if (visibleSince) visibleMs += Date.now() - visibleSince;
        visibleSince = 0;
        if (engagedTimer) { window.clearTimeout(engagedTimer); engagedTimer = null; }
      }
    });
    armEngaged();
    var depths = [25, 50];
    var depthSent = {};
    var scrollQueued = false;
    function checkDepth() {
      scrollQueued = false;
      var doc = document.documentElement;
      var scrollable = Math.max(doc.scrollHeight, document.body ? document.body.scrollHeight : 0) - window.innerHeight;
      if (scrollable <= 0) return;
      var pct = (window.scrollY || doc.scrollTop || 0) / scrollable * 100;
      depths.forEach(function (depth) {
        if (!depthSent[depth] && pct >= depth) {
          depthSent[depth] = true;
          window.gtag('event', 'scroll_depth', { percent_scrolled: depth, transport_type: 'beacon' });
        }
      });
      if (depthSent[25] && depthSent[50]) window.removeEventListener('scroll', onScroll);
    }
    function onScroll() {
      if (scrollQueued) return;
      scrollQueued = true;
      window.requestAnimationFrame(checkDepth);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
  }
})();
