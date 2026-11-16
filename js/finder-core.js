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
    if (a.grow==='unsure' && ['sunny','dim'].includes(a.spot) && ['compact','roomy'].includes(input.room)) a.room=input.room;
    if (['kit','basics'].includes(input.setup)) a.setup = input.setup;
    if (input.kit === '1') a.setup = 'kit';
    if (input.kit === '0') a.setup = 'basics';
    if (a.spot==='dim' && ['lettuce','herbs'].includes(a.grow) || a.spot==='dim' && a.grow==='microgreens' && a.micro==='pea') a.setup='basics';
    if(a.grow==='unsure')delete a.setup;
    return a;
  }
  function rawRoute(input) {
    const a = normalize(input);
    if (!a.grow) return {step:'grow'};
    if (a.grow === 'microgreens' && !a.micro) return {step:'micro'};
    if (!a.spot) return {step:'space'};
    if(a.grow==='unsure') {
      if(a.spot!=='balcony'&&!a.room)return {step:'room'};
      if(a.spot==='dim'&&a.room==='compact')return {step:'result',product:'basil-kit',extras:[],guide:'basil',fit:'garden'};
      if(a.spot==='dim'||a.room==='compact')return {step:'result',product:'microkit',extras:a.spot==='dim'?['light']:[],guide:'microgreens',fit:'microkit'};
      return {step:'result',product:'lettuce',extras:['pot','soil-small'],guide:a.spot==='balcony'?'balcony':'window',fit:'pot'};
    }
    if (a.grow === 'tomato') return a.spot==='balcony' ? {step:'result',product:'tomato',extras:['bag','soil'],optional:['fertilizer'],guide:'tomato',fit:'bag',note:'Grow one Tiny Tim plant per bag in 6 to 8 hours of direct sun. Use two 16-quart bags of potting mix to fill one 5-gallon bag, with some mix left over. Check moisture daily and feed established plants with a tomato fertilizer according to its label. These are seeds, not a live plant or all-in-one kit.'} : {step:'unavailable',reason:'tomato-light'};
    if (a.grow === 'microgreens' && a.spot === 'balcony') return {step:'switch',reason:'balcony'};
    if ((a.grow === 'salad' || a.grow === 'radish') && a.spot === 'dim') return {step:'switch',reason:a.grow};
    const pea = a.grow === 'microgreens' && a.micro === 'pea';
    const needsSetup = a.spot === 'dim' || (a.grow === 'microgreens' && a.micro !== 'pea');
    if (needsSetup && !a.setup) return {step:'setup'};
    const dim = a.spot === 'dim';
    const pot = ['pot','soil-small'];
    const tray = ['microkit'];
    const lit = ids => dim ? [...ids,'light'] : ids;
    if (pea && a.setup === 'kit') return {step:'unavailable',reason:'pea-kit'};
    if (a.grow === 'microgreens') {
      if (a.setup === 'kit' && a.micro !== 'pea') return {step:'result',product:'microkit',extras:dim?['light']:[],guide:'microgreens',fit:'microkit',note:'The kit includes radish and broccoli seed. No light is included.'};
      return {step:'result',product:'micro-'+a.micro,extras:lit(tray),optional:['coir'],guide:'microgreens',fit:'microkit'};
    }
    if (dim && a.setup === 'kit') {
      if (a.grow === 'basil') return {step:'result',product:'basil-kit',extras:[],guide:'basil',fit:'garden'};
      return {step:'unavailable',reason:'unnamed'};
    }
    const extras = lit(pot);
    return {step:'result',product:a.grow,extras,optional:a.spot==='balcony'&&['lettuce','salad','herbs'].includes(a.grow)?['windowbox']:[],guide:a.spot==='balcony'?'balcony':a.spot==='sunny'?'window':'basil',fit:a.grow==='tomato'?'bag':'pot'};
  }
  // Offer only answers with at least one complete, reviewed shopping setup.
  function choices(field,input={}) {
    const a=normalize(input);
    if(field==='room')return a.grow==='unsure'&&['sunny','dim'].includes(a.spot)?['compact','roomy']:[];
    if(field==='setup' && a.spot==='dim' && (['lettuce','herbs'].includes(a.grow)||a.grow==='microgreens'&&a.micro==='pea'))return ['basics'];
    const values={grow:crops,micro:micros,spot:spots,setup:['kit','basics']}[field]||[];
    return values.filter(value=>{
      const prefix=field==='grow'?{grow:value}:field==='micro'?{grow:a.grow,micro:value}:field==='spot'?{grow:a.grow,micro:a.micro,spot:value}:{...a,setup:value};
      for(const grow of crops) for(const micro of grow==='microgreens'?micros:[undefined]) for(const spot of spots) for(const setup of ['kit','basics']) for(const room of grow==='unsure'&&spot!=='balcony'?['compact','roomy']:[undefined]) {
        const leaf={grow,micro,spot,setup,room};
        if(Object.entries(prefix).some(([k,v])=>v!==undefined&&leaf[k]!==v))continue;
        if(rawRoute(leaf).step==='result')return true;
      }
      return false;
    });
  }
  function route(input) {
    const a=normalize(input);
    if(!a.grow||!choices('grow').includes(a.grow))return {step:'grow'};
    if(a.grow==='microgreens'&&!choices('micro',a).includes(a.micro))return {step:'micro'};
    if(!choices('spot',a).includes(a.spot))return {step:'space'};
    const r=rawRoute(a);
    if(r.step==='unavailable'||r.step==='switch')return {step:'setup'};
    return r;
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
        reason: `${r.product === 'micro-pea' ? 'These are sprouting peas for edible shoots, rather than full-size pea plants. Soak the seed before sowing.' : r.product === 'micro-radish' ? 'These seeds are for peppery young radish shoots, rather than a pot of radish roots.' : 'These seeds are for mild young broccoli shoots, rather than full-size broccoli heads.'} ${light ? 'The separate lamp below supplies light your chosen spot is missing.' : 'The tray kit below includes medium for two plantings; its radish and broccoli seed packets are also included.'}`
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
  function resultCopy(input, recommendation) {
    const a=normalize(input), r=recommendation||route(a);
    const location=a.spot==='sunny'?'your sunny window':a.spot==='dim'?'your dim spot':'your balcony';
    const labels={tomato:'Tiny Tim cherry tomatoes',lettuce:'Buttercrunch lettuce',basil:'Genovese basil',herbs:'Culinary herbs',radish:'Cherry Belle radishes',salad:'Mixed salad greens','micro-pea':'Pea shoots','micro-radish':'Radish microgreens','micro-broccoli':'Broccoli microgreens','basil-kit':'Smart Garden 3 basil kit',microkit:(a.micro==='radish'?'Radish':'Broccoli')+' microgreens kit'};
    const benefits={
      tomato:'For fresh cherry tomatoes on your sunny balcony, we’d choose compact Tiny Tim seeds with a roomy grow bag and potting mix to give your first plant a comfortable start.',
      lettuce:`We’d start with Buttercrunch for fresh salad leaves, with a pot and growing mix to suit ${location}.`,
      basil:`For the fresh basil you want, we’d start with Genovese seeds and a pot setup for ${location}.`,
      herbs:`We’d choose this collection so you can grow the herbs you cook with most in separate pots for ${location}.`,
      radish:`For crunchy garden radishes, we’d start with Cherry Belle seeds and a pot with space for the roots.`,
      salad:`We’d start with this collection so you can choose a few salad crops to grow in separate pots for ${location}.`,
      'basil-kit':`Since you want basil in a dim spot, we’d choose this garden with its own light and three basil pods included.`,
      'micro-pea':`For the pea shoots you want, we’d start with sprouting seed and the reusable tray supplies below.`,
      'micro-radish':`For peppery young radish shoots, we’d pair these seeds with a reusable tray and growing medium.`,
      'micro-broccoli':`For mild young broccoli shoots, we’d start with these seeds and the tray supplies below.`,
      microkit:`Start with two small trays, coir and one packet each of radish and broccoli seed. Use the crop you selected first.`
    };
    const headline=(labels[r.product]||'Your growing setup')+' for '+location;
    const first=a.grow==='unsure'?(r.product==='basil-kit'?'For your narrow counter, start with one garden that includes its own light and three basil pods.':r.product==='microkit'?`Start with one small tray of broccoli shoots. The kit brings seeds, trays and medium together${a.spot==='dim'?'; add the standing light below':'. Use the bright window you selected'}.`:'Start with two small pots of Buttercrunch lettuce and pick a few leaves as they develop.'):null;
    return {headline,benefit:first||benefits[r.product]||explain(a,r).reason};
  }
  function questionSteps(input={}) {
    const a=normalize(input), steps=['grow'];
    if(a.grow==='microgreens')steps.push('micro');
    steps.push('space');
    if(a.grow==='unsure'&&['sunny','dim'].includes(a.spot))steps.push('room');
    if(route({...a,setup:undefined}).step==='setup')steps.push('setup');
    return steps;
  }
  function purchaseQuantity(id,input,r) { return id==='soil'&&r.product==='tomato'?2:1; }
  function starterScope(input,r) {
    if(r.product==='basil-kit')return 'Start with the three included basil pods.';
    if(r.product==='microkit'||r.product.startsWith('micro-'))return r.product==='microkit'?'Start with one tray at a time; seed and coir cover two starter plantings.':'Start with one tray at a time; the tray kit includes coir for two plantings.';
    if(r.product==='tomato')return 'Start with one tomato plant in one grow bag.';
    return 'Start with two pots, using the included saucers.';
  }
  function spaceHint(spot,input) {
    if(spot==='dim')return 'Little direct sun · a grow light is included in your picks';
    if(spot==='balcony')return input.grow==='tomato'?'6 to 8 hours direct sun · room for a 5-gallon bag':'At least 6 hours of sun · check heat and wind';
    return input.grow==='microgreens'?'Bright window · turn the tray for even growth':['lettuce','salad','unsure'].includes(input.grow)?'4 to 6 hours of direct sun · avoid hot glass':'6 to 8 hours of direct sun at plant level';
  }
  function supplyReason(id,input,r,products) {
    const crop=r.product==='lettuce'?'lettuce':input.grow;
    const pots={lettuce:'Two pots for lettuce, with one plant per pot.',basil:'Two pots for basil, with one plant per pot.',herbs:'Start two herbs in separate pots so you can water each individually.',salad:'Start two salad crops in separate pots.',radish:'Two pots let you stagger radish sowings for successive harvests.'};
    const reasons={pot:pots[crop]||'Drainage holes and saucers keep your container setup practical.',soil:'Two bags provide 32 quarts for one 5-gallon grow bag, with mix left over.','soil-small':'About 4 dry quarts per 8-inch pot. One 8-quart bag is the smaller starting purchase for two pots.',bag:'One 5-gallon fabric pot for your first Tiny Tim plant.',tray:'Use one drained 1010 tray for your first microgreen crop; keep extra trays for repeat sowings.',drip:'A solid tray to catch drainage from the growing tray.',microkit:input.micro==='pea'?'Reusable trays and coir for your pea shoots. Radish and broccoli seed packets are also included.':'Trays and coir for your first two plantings, plus radish and broccoli seed packets.',coir:'Optional refill medium for later tray sowings; the kit already includes coir for two plantings.',light:'A standing LED panel for your starter pots or tray. Allow room for its separate base and an outlet.',fertilizer:'Tomato plant food for established plants, used according to its label.',windowbox:'Seven window boxes for expanding later, beyond your two starter pots.'};
    return reasons[id]||products[id]?.benefit||products[id]?.kind||'';
  }
  function supplyDetails(id,input,r) {
    const notes={light:'Center the crop under the 13.6 × 7.7-inch panel. The stand adjusts from 4 to 72 inches. Its 2 × 2 ft rating describes light coverage, not the base size. Check the stand’s base against your floor or counter before ordering.',pot:input.grow==='radish'?'Sow directly and thin Cherry Belle seedlings to about 2 inches apart. Empty saucers after watering.':'These are starter containers. Use one plant or crop per pot; established herbs may need larger pots later. Empty saucers after watering.',soil:'Fill containers with loose potting mix, leaving watering space at the rim. Actual use varies with fill depth.','soil-small':'Espoma estimates about 4 dry quarts for a typical 8-inch pot. Actual use varies with shape and fill level; leave watering space at the rim.',bag:'The purchase is one fabric pot. Place it where drainage will not damage the surface.',coir:'Hydrate only the amount you need, following the pack instructions. Store the unused medium dry.',fertilizer:'Optional add-on for later feeding. Follow the fertilizer label for dilution and timing, and the potting-mix label before adding feed.',windowbox:'This seven-pack is optional. It replaces or expands your containers, so additional potting mix will be needed. Check its dimensions against your space before ordering.'};
    return notes[id]||'';
  }
  function resultReasons(input,r){
    const a=normalize(input);
    return [a.spot==='dim'?'Grow light included in your picks':a.spot==='balcony'?'Containers for your balcony':'A container setup for your sunny window',r.product==='basil-kit'?'Light and basil pods in one garden':r.product==='microkit'?'Seeds, trays and growing medium together':r.product.startsWith('micro-')?'Seeds paired with reusable trays and growing medium':'Seeds paired with a container and potting mix'];
  }
  function alternative(input,r){
    const a=normalize(input), dim=a.spot==='dim';
    function option(next,intro,label){return {answers:normalize(next),intro,label};}
    if(a.grow==='unsure'&&a.spot!=='balcony')return option({...a,room:a.room==='compact'?'roomy':'compact'},a.room==='compact'?'Have more room for a larger setup?':'Working with a narrower space?',a.room==='compact'?'Compare the roomier option':'Compare the compact option');
    if(r.product==='microkit')return option({...a,setup:'basics'},'Planning to keep sowing? Add a bulk bag of your chosen seed to the same starter kit. Refill growing medium later.','Compare kit + bulk seed');
    if(['micro-radish','micro-broccoli'].includes(r.product))return option({...a,setup:'kit'},`Prefer a smaller first purchase? Skip the bulk seed bag. The kit already includes one ${a.micro==='radish'?'radish':'broccoli'} seed packet, trays and medium${dim?', plus the same separate light':''}.`,'Compare the starter kit');
    if(r.product==='basil-kit')return option({...a,setup:'basics'},'One kit includes the light and pods. Separate seeds, pots, mix and a light give you more control over each component.','Compare separate supplies');
    if(r.product==='basil'&&dim)return option({...a,setup:'kit'},'Prefer one purchase? The Smart Garden 3 includes a light and three basil pods.','Compare the all-in-one kit');
    if(r.product==='herbs')return option({grow:'basil',spot:a.spot,setup:dim?'basics':undefined},'Only want one herb? Start with a single Genovese basil seed packet instead of twelve varieties.','Start with basil only');
    return null;
  }
  function roomOptions(input){return input.spot==='dim'?[
    ['compact','A narrow counter','About 12 × 5 inches, with 19 inches of height and an outlet. Basil kit with its own light.','basil-kit'],
    ['roomy','A tray plus a standing light','An 8.8 × 5.5-inch tray, with extra room for the light’s base and adjustable stand.','microkit']
  ]:[
    ['compact','A narrow windowsill','An 8.8 × 5.5-inch tray, with clear space above for shoots.','microkit'],
    ['roomy','Room for two starter pots','Two 8-inch pots plus saucers and room for leaves.','pot']
  ];}
  const api = {normalize,route,explain,resultCopy,choices,crops,spots,micros,questionSteps,supplyReason,supplyDetails,purchaseQuantity,starterScope,spaceHint,resultReasons,alternative,roomOptions};
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.SSGFinder = api;
})(typeof window === 'object' ? window : globalThis);
