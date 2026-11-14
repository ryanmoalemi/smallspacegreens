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
    if (a.grow === 'tomato' && a.spot !== 'dim') return {step:'unavailable',reason:'tomato-support'};
    if (a.grow === 'tomato' && a.spot === 'dim') return {step:'switch',reason:'tomato'};
    if (a.grow === 'microgreens' && a.spot === 'balcony') return {step:'switch',reason:'balcony'};
    if ((a.grow === 'salad' || a.grow === 'radish') && a.spot === 'dim') return {step:'switch',reason:a.grow};
    const pea = a.grow === 'microgreens' && a.micro === 'pea';
    const needsSetup = !pea && (a.spot === 'dim' || (a.grow === 'microgreens' && a.micro !== 'pea'));
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
  function explain(input, recommendation) {
    const a = normalize(input), r = recommendation || route(a);
    const place = a.spot === 'balcony' ? 'on your balcony' : a.spot === 'sunny' ? 'by your sunny window' : 'in your dim indoor spot';
    const location = a.spot === 'balcony' ? 'your balcony' : a.spot === 'sunny' ? 'your windowsill' : 'your indoor space';
    const light = a.spot === 'dim';
    if (a.grow === 'unsure') return r.product === 'micro-broccoli' ? {
      heading: 'A small tray is a lovely place to start',
      intro: 'Not sure what to grow yet? For your dim indoor spot, we’d start with a tray of mild broccoli microgreens and a separate grow light.',
      reason: 'These are seeds for young, edible shoots. Pair them with the trays, growing medium and light below, so you have a starting setup rather than a seed bag on its own.'
    } : {
      heading: 'Let’s start with a little pot of lettuce',
      intro: `Since you’re still choosing a crop for ${location}, we’d begin with Buttercrunch lettuce in a pot. You can keep your first grow small and add other crops later.`,
      reason: 'This packet is for tender salad lettuce. We’ve paired it with a container and potting mix below; choose a spot with suitable light and keep an eye on heat.'
    };
    if (r.product === 'basil-kit') return {
      heading: 'A little basil garden for your counter',
      intro: 'You chose basil, a dim spot and an all-in-one kit, so we’d recommend a countertop garden that brings its own light.',
      reason: 'The Smart Garden 3 includes a grow light and three basil pods, which makes it a closer fit for your choices than a seed packet that still needs pots, growing medium and a separate lamp.'
    };
    if (r.product === 'microkit') {
      const crop = a.micro === 'radish' ? 'radish microgreens' : 'broccoli microgreens';
      return {
        heading: `Your first ${a.micro === 'radish' ? 'radish' : 'broccoli'} tray, together in one kit`,
        intro: `You’d like to grow ${crop} ${place} and prefer a kit, so we’d start with the seeds, growing medium and trays together.`,
        reason: `This kit includes both radish and broccoli seed, so it covers the crop you picked. ${light ? 'Because your spot is dim, you’ll also need the separate light listed below.' : 'Use a suitably bright spot for the tray; no grow light is included in the kit.'}`
      };
    }
    if (r.product && r.product.startsWith('micro-')) {
      const crop = r.product === 'micro-pea' ? 'pea shoots' : r.product === 'micro-radish' ? 'radish microgreens' : 'broccoli microgreens';
      return {
        heading: `A little tray of ${crop} for ${location}`,
        intro: `For the ${crop} you want to grow ${place}, we’d start with these seeds and a reusable tray setup.`,
        reason: `${r.product === 'micro-pea' ? 'These are sprouting peas for edible shoots, rather than full-size pea plants. Soak the seed before sowing.' : r.product === 'micro-radish' ? 'These seeds are for peppery young radish shoots, rather than a pot of radish roots.' : 'These seeds are for mild young broccoli shoots, rather than full-size broccoli heads.'} ${light ? 'The separate lamp below supplies light your chosen spot is missing.' : 'The trays and growing medium below give the seeds somewhere to grow.'}`
      };
    }
    const copy = {
      herbs: {
        heading: `Fresh herbs for ${location}`,
        intro: `For the herbs you’d like to grow ${place}, we’d start with a few favorites you’ll enjoy using in the kitchen.`,
        reason: `This culinary seed collection lets you choose the herbs you cook with most, rather than commit to just one. Start them in separate pots so you can give each variety the room and care it needs. ${light ? 'We’ve included a separate grow light for your dim spot.' : 'Check the sun each variety needs before choosing its place.'}`
      },
      basil: {
        heading: `Your own little basil patch`,
        intro: `You’d like fresh basil ${place}, so we’d start with Genovese basil seeds and a simple pot setup.`,
        reason: `Genovese is a culinary basil you can use in pesto and salads. ${light ? 'Because your spot is dim, we’ve paired the seeds with a separate light as well as a pot and growing medium.' : 'The pots and growing mix below help turn this seed packet into a setup for your chosen space.'}`
      },
      lettuce: {
        heading: `A pot of fresh lettuce for ${location}`,
        intro: `For the lettuce you’d like to grow ${place}, we’d start with Buttercrunch and a container setup you can keep small.`,
        reason: `This is a seed packet for tender salad lettuce, so we’ve included a pot and growing mix below. ${light ? 'Your dim spot also needs the separate grow light.' : 'Give it suitable light and a cool growing spot, especially as the weather warms.'}`
      },
      salad: {
        heading: `A little salad garden for ${location}`,
        intro: `You’d like a mix of salad greens ${place}, so we’d choose a seed collection that gives you some variety.`,
        reason: 'This collection lets you start different salad crops in separate pots, rather than grow just one type of lettuce. Pick a few to begin with and check each crop’s light and spacing needs.'
      },
      radish: {
        heading: `Fresh radishes for ${location}`,
        intro: `For the crunchy radishes you’d like to grow ${place}, we’d start with Cherry Belle seeds in a container.`,
        reason: 'These grow garden radish roots, rather than microgreens. The pot and growing mix below are the starting supplies; leave space between seedlings so the roots have room to develop.'
      }
    };
    return copy[r.product] || {heading:'Here’s where we’d start',intro:`We’ve put together a starting setup for ${location}.`,reason:'Check the included items and growing requirements before you begin.'};
  }
  const api = {normalize,route,explain,crops,spots,micros};
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.SSGFinder = api;
})(typeof window === 'object' ? window : globalThis);
