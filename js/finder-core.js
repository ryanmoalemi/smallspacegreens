/* Pure route decisions. No network, timers, tracking, or DOM. */
(function (root) {
  'use strict';
  const crops = ['tomato','lettuce','salad','basil','herbs','radish','microgreens','unsure'];
  const spots = ['sunny','dim','balcony'];
  const micros = ['radish','broccoli','pea'];
  function normalize(input) {
    const a = {};
    if (!crops.includes(input.grow)) return a;
    a.grow = input.grow;
    if (a.grow === 'microgreens' && micros.includes(input.micro)) a.micro = input.micro;
    if (spots.includes(input.spot)) a.spot = input.spot;
    if (['kit','basics'].includes(input.setup)) a.setup = input.setup;
    if (input.kit === '1') a.setup = 'kit';
    if (input.kit === '0') a.setup = 'basics';
    return a;
  }
  function route(input) {
    const a = normalize(input);
    if (!a.grow) return {step:'grow'};
    if (a.grow === 'microgreens' && !a.micro) return {step:'micro'};
    if (!a.spot) return {step:'space'};
    if (a.grow === 'tomato' && a.spot === 'dim') return {step:'switch',reason:'tomato'};
    if (a.grow === 'microgreens' && a.spot === 'balcony') return {step:'switch',reason:'balcony'};
    if ((a.grow === 'salad' || a.grow === 'radish') && a.spot === 'dim') return {step:'switch',reason:a.grow};
    const needsSetup = a.spot === 'dim' || (a.grow === 'microgreens' && a.micro !== 'pea');
    if (needsSetup && !a.setup) return {step:'setup'};
    const dim = a.spot === 'dim';
    const pot = ['pot','soil'];
    const tray = ['tray','drip','coir'];
    const lit = ids => dim ? [...ids,'light'] : ids;
    if (a.grow === 'microgreens') {
      if (a.setup === 'kit' && a.micro !== 'pea') return {step:'result',product:'microkit',extras:dim?['light']:[],guide:'microgreens',fit:'microkit',note:'The kit includes radish and broccoli seed. No light is included.'};
      return {step:'result',product:'micro-'+a.micro,extras:lit(tray),guide:'microgreens',fit:'tray'};
    }
    if (a.grow === 'unsure') {
      if (!dim) return {step:'result',product:'lettuce',extras:pot,guide:a.spot==='balcony'?'balcony':'window',fit:'pot',note:'We suggest starting with lettuce for this space.'};
      if (a.setup === 'basics') return {step:'result',product:'micro-broccoli',extras:lit(tray),guide:'microgreens',fit:'tray',note:'We suggest a tray of broccoli microgreens for this space.'};
      return {step:'unavailable',reason:'unnamed',alternate:'basil'};
    }
    if (dim && a.setup === 'kit') {
      if (a.grow === 'basil') return {step:'result',product:'basil-kit',extras:[],guide:'basil',fit:'garden'};
      return {step:'unavailable',reason:'unnamed'};
    }
    const extras = a.grow === 'tomato' ? ['bag','soil','cage'] : lit(pot);
    return {step:'result',product:a.grow,extras,guide:a.spot==='balcony'?'balcony':a.grow==='tomato'?'tomato':a.grow==='basil'||a.grow==='herbs'?'basil':'window',fit:a.grow==='tomato'?'bag':'pot'};
  }
  const api = {normalize,route,crops,spots,micros};
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.SSGFinder = api;
})(typeof window === 'object' ? window : globalThis);
