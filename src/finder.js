(function () {
 'use strict';
 const host = document.getElementById('finder');
 if (!host || !window.SSGFinder || !window.SSG_FINDER_DATA) return;
 const core = window.SSGFinder, data = window.SSG_FINDER_DATA;
 const crops = [
  ['tomato','Cherry tomatoes','/assets/finder/cherry-tomatoes.webp'],
  ['lettuce','Lettuce','/assets/products/supply-lettuce-leaves-600.webp'],
  ['salad','Salad mix','/assets/finder/salad-mix.webp'],
  ['basil','Basil','/assets/finder/basil.webp'],
  ['herbs','Herbs','/assets/finder/herbs.webp'],
  ['radish','Radishes','/assets/finder/radishes.webp'],
  ['microgreens','Microgreens','/assets/photos/trays-broccoli-radish.jpg'],
  ['unsure','Not sure','/assets/finder/not-sure.webp']
 ];
 const spaces = [
  ['sunny','Sunny window','/assets/photos/basil-by-window.jpg','Direct sun at the window'],
  ['dim','Dim spot','/assets/photos/pea-shoots-counter.jpg','Little or no direct sun'],
  ['balcony','Balcony','/assets/photos/balcony-garden-ruth-hartnup.jpg','An outdoor growing space']
 ];
 const micros = [
  ['radish','Radish','/assets/photos/radish-microgreens-apapac.jpg','Peppery leaves'],
  ['broccoli','Broccoli','/assets/photos/broccoli-microgreens-anotherdaysjourney.jpg','Mild and fresh'],
  ['pea','Pea shoots','/assets/photos/pea-shoots-basket-susan-slater.jpg','Sweet shoots']
 ];
 const e = s => String(s || '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 let answers = core.normalize(Object.fromEntries(new URLSearchParams(location.search)));
 let view = core.route(answers).step;
 function track(event, params) { if (typeof window.gtag === 'function') window.gtag('event',event,params); }
 function label(id,list=crops) { return (list.find(x=>x[0]===id)||[])[1] || ''; }
 function photo(src,alt='',cls='') { return `<img class="${e(cls)}" ${src.startsWith('/assets/finder/')?`srcset="${e(src.replace('.webp','-360.webp'))} 360w, ${e(src)} 720w" sizes="(max-width:699px) 173px, 264px"`:''} src="${e(src)}" width="800" height="600" alt="${e(alt)}" decoding="async">`; }
 function garden() {
  const light = answers.spot==='dim' && (answers.setup || view==='result');
  const sun = answers.spot==='sunny'||answers.spot==='balcony';
  return `<svg class="garden" viewBox="0 0 120 140" aria-hidden="true" focusable="false"><path d="M15 128h90" stroke="#d8ded6" stroke-width="2"/>${sun?'<circle cx="91" cy="25" r="12" fill="#ebddad"/>':''}${answers.spot==='sunny'?'<path d="M8 14h50v65H8zM33 14v65M8 47h50" fill="none" stroke="#d8ded6" stroke-width="3"/>':''}${answers.spot==='balcony'?'<path d="M8 88h104M17 88v40M39 88v40M82 88v40M104 88v40" stroke="#d8ded6" stroke-width="3"/>':''}<path d="M59 107V52" stroke="#214d3a" stroke-width="2"/><path d="M59 83Q32 84 30 61q27 0 29 22" fill="#214d3a"/><path d="M59 68Q84 64 80 39 60 45 59 68" fill="#738d52"/><path d="M38 107h43l-7 22H44z" fill="#b85e43"/><path d="M36 104h47v7H36z" fill="#d68467"/>${light?'<path d="M97 129V16H59" fill="none" stroke="#214d3a" stroke-width="2"/><path d="M52 16h28" stroke="#214d3a" stroke-width="5" stroke-linecap="round"/>':''}</svg>`;
 }
 function chips() {
  return `<div class="finder-chips">${answers.grow?`<button class="finder-chip" data-edit="grow" aria-label="Change crop: ${e(label(answers.grow))}">${e(label(answers.grow))}</button>`:''}${answers.micro?`<button class="finder-chip" data-edit="micro" aria-label="Change microgreens: ${e(label(answers.micro,micros))}">${e(label(answers.micro,micros))}</button>`:''}${answers.spot?`<button class="finder-chip" data-edit="space" aria-label="Change space: ${e(label(answers.spot,spaces))}">${e(label(answers.spot,spaces))}</button>`:''}${answers.setup && core.route({...answers,setup:undefined}).step==='setup'?`<button class="finder-chip" data-edit="setup" aria-label="Change setup">${answers.setup==='kit'?'Kit':'Basics'}</button>`:''}</div>`;
 }
 function rail() {
  const i = view==='grow'||view==='micro'?0:view==='space'?1:2;
  return `<ol class="finder-stages" aria-label="Your growing setup">${['Grow','Space','Setup'].map((s,n)=>`<li${n===i?' aria-current="step"':''} class="${n<i?'is-complete':''}">${s}</li>`).join('')}</ol>`;
 }
 function back() { return '<button class="finder-back" data-back><svg viewBox="0 0 20 20" aria-hidden="true"><path d="m12 5-5 5 5 5" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>Back</button>'; }
 function option(item,field,row=false,selected=false) {
  return `<button type="button" class="finder-choice ${row?'finder-row':''} ${item[0]==='unsure'?'not-sure':''}" data-answer="${field}" data-value="${item[0]}" aria-pressed="${selected}">${photo(item[2])}<span class="choice-label">${e(item[1])}${item[3]?`<span class="choice-helper">${e(item[3])}</span>`:''}</span></button>`;
 }
 function credits(){return '<p class="finder-credits"><a href="/photo-credits/#finder-photography">Photo credits</a></p>';}
 function fit(kind) {
  const title = kind==='microkit'?'8.8 × 5.5 in tray':kind==='tray'?'1010 tray pair':kind==='bag'?'5-gallon grow bag':kind==='garden'?'Smart Garden 3':'8 in pot';
  const shape = ['tray','microkit'].includes(kind)?'<path d="M164 80h175l-12 29H176z" fill="#214d3a"/><path d="M162 78h179" stroke="#24372c" stroke-width="4"/>':kind==='garden'?'<rect x="174" y="72" width="130" height="36" rx="10" fill="#e7eddf"/><path d="M295 74V26H183" fill="none" stroke="#214d3a" stroke-width="5"/>':`<path d="M196 46h95l-12 63h-69z" fill="${kind==='bag'?'#58645a':'#b85e43'}"/>`;
  return `<details class="finder-detail"><summary>Will it fit?</summary><svg class="finder-size" viewBox="0 0 400 160" role="img" aria-label="Illustrative size comparison of a coffee cup and ${e(title)}"><path d="M18 111h350" stroke="#d8ded6"/><path d="M56 60h44l-5 49H61z" fill="#ebddad"/><path d="M99 68q25 0 20 24h-22" fill="none" stroke="#a78d56" stroke-width="3"/>${shape}<text x="52" y="139" font-size="13" fill="#24372c">12 oz cup</text><text x="186" y="139" font-size="13" fill="#24372c">${e(title)}</text></svg><p>Illustrative size comparison. ${kind==='garden'?'Allow room above the lamp and check the exact model dimensions before ordering.':kind==='microkit'?'Alpas Life lists the kit trays at 8.8 × 5.5 in. Allow extra space for watering and the separate lamp, if needed.':kind==='tray'?'1010 is a tray format, not a 10 × 20 in tray. Check the outside dimensions and that the drained tray nests inside its solid drip tray.':kind==='bag'?'Bag capacity is not an outside dimension. Allow space for the cage and a full-size tomato plant.':'The pot diameter is nominal. Check its outside width, depth and saucer footprint before ordering.'}</p></details>`;
 }
 function amazon(p,text,primary=false){return `<a class="${primary?'finder-primary':'finder-link'}" href="${e(p.url)}" rel="sponsored nofollow noopener" target="_blank" data-amazon="${e(p.asin)}">${text}<span class="sr-only"> (opens Amazon in a new tab)</span></a>`;}
 function message(reason) {
  const cases={
   tomato:['This spot is not a fit for our tomato setup.','Tomatoes need strong direct sun and room to grow. A dim counter with a small clip-on lamp is not our recommended tomato setup.','Try lettuce instead','lettuce','/assets/finder/cherry-tomatoes.webp'],
   balcony:['Let’s find a better balcony crop.','Our first-tray microgreen setups are for indoors. Try garden lettuce outside, or choose an indoor growing spot.','Try lettuce instead','lettuce','/assets/photos/balcony-garden-ruth-hartnup.jpg'],
   radish:['Radish roots need more light.','You chose garden radishes. For this dim spot, you could grow peppery radish microgreens instead, with a grow light.','Try radish microgreens','microgreens','/assets/finder/radishes.webp'],
   salad:['A different kind of salad for this spot.','A dim counter needs added light. A microgreen tray grows young leaves, rather than the mature salad greens you selected.','Choose microgreens','microgreens','/assets/finder/salad-mix.webp'],
   unnamed:['Let’s choose a crop-matched setup.','We could not confirm that the suggested countertop kit includes the seeds you chose. You can use seeds and a separate light, or choose a basil kit with named basil pods.','See seeds and a light','basics','/assets/photos/basil-by-window.jpg'],
   product:['This setup needs another check.','We have not confirmed every exact product and photo for this combination. Choose another setup, or use the growing guide while we check it.','Change growing spot','space','/assets/photos/trays-broccoli-radish.jpg']
  };
  const c=cases[reason]||cases.product;
  return `${rail()}<section class="finder-message"><h1 tabindex="-1">${c[0]}</h1>${chips()}${photo(c[4],'','message-photo')}<p>${c[1]}</p><button class="finder-primary" data-adjust="${c[3]}">${c[2]}</button>${reason==='unnamed'?'<button class="finder-link" data-adjust="basil">Try the basil kit instead</button>':''}<button class="finder-link" data-edit="space">Change growing spot</button><a class="finder-link" href="/guides/${reason==='balcony'?'balcony-salad-garden':'first-tray-checklist'}/">Read the growing guide</a>${back()}</section>${credits()}`;
 }
 function result(r) {
  const p=data.products[r.product];
  if (!p || p.status==='unverified' || !p.image || r.extras.some(id=>!data.products[id]?.image || data.products[id].status==='unverified')) return message('product');
  const pendingExtras=r.extras.some(id=>data.products[id].status==='unverified');
  const note=(pendingExtras?'One supporting item still needs confirmation. Use the guide before buying this setup. ': '')+(r.note || (answers.spot==='balcony' && ['lettuce','salad'].includes(r.product)?'Lettuce and salad greens prefer cool weather. Check your balcony’s direct sun and summer heat before sowing.':r.extras.includes('light')?'This setup needs the separate grow light listed below.':''));
  return `<section class="finder-result">${chips()}<div class="result-head"><h1 tabindex="-1">Your match</h1>${garden()}</div>${note?`<p class="finder-note">${e(note)}</p>`:''}<div class="result-layout"><figure class="result-photo">${photo(p.image,p.name+', '+p.kind)}</figure><div class="result-copy"><p class="product-kind">${e(p.kind)}</p><h2>${e(p.name)}</h2><p class="benefit">${e(p.benefit)}</p>${amazon(p,'Check it on Amazon',true)}</div></div>${r.extras.length?`<section class="finder-extras"><h2>You’ll also need</h2><div class="finder-extra-grid">${r.extras.map(id=>{const x=data.products[id];return `<article class="finder-extra">${x.image&&x.status!=='unverified'?photo(x.image,x.name):''}<div><h3>${e(x.name)}</h3>${x.image&&x.status!=='unverified'?amazon(x,'View on Amazon'):'<p>Exact item photo not yet confirmed. Check the guide before buying.</p>'}</div></article>`;}).join('')}</div></section>`:''}${fit(r.fit)}<div class="finder-result-links"><a class="finder-link" href="${e(data.guides[r.guide])}">Read the growing guide</a><button class="finder-link" data-edit="grow">Change answers</button></div></section>${credits()}`;
 }
 function sync(push=true) {
  const u=new URL(location.href);
  ['grow','micro','spot','setup','kit'].forEach(k=>u.searchParams.delete(k));
  Object.entries(answers).forEach(([k,v])=>u.searchParams.set(k,v));
  if (push) history.pushState({answers,view},'',u); else history.replaceState({answers,view},'',u);
 }
 function render(focus=true) {
  const r=core.route(answers);
  if (view==='result') host.innerHTML=result(r);
  else if (view==='switch'||view==='unavailable') host.innerHTML=message(r.reason);
  else if(view==='grow') host.innerHTML=`${rail()}<h1 tabindex="-1">What do you want<br class="mobile-break"> to grow?</h1><div class="finder-grid">${crops.map(x=>option(x,'grow',false,answers.grow===x[0])).join('')}</div>${credits()}`;
  else if(view==='space') host.innerHTML=`${rail()}<h1 tabindex="-1">Where will it grow?</h1><div class="finder-split"><aside class="finder-summary">${chips()}${garden()}</aside><div><div class="finder-options">${spaces.map(x=>option(x,'spot',true,answers.spot===x[0])).join('')}</div><div class="finder-bottom">${back()}</div></div></div>${credits()}`;
  else if(view==='micro') host.innerHTML=`${rail()}<h1 tabindex="-1">Which microgreens?</h1><div class="finder-split"><aside class="finder-summary">${chips()}${garden()}</aside><div><div class="finder-options">${micros.map(x=>option(x,'micro',true,answers.micro===x[0])).join('')}</div><button class="finder-link" data-answer="micro" data-value="broccoli">Not sure? Try broccoli</button>${back()}</div></div>${credits()}`;
  else if(view==='setup') {
   const micro=answers.grow==='microgreens';
   const kitPhoto=micro?data.products.microkit.image:data.products['basil-kit'].image;
   host.innerHTML=`${rail()}<h1 tabindex="-1">All-in-one kit or<br> just the basics?</h1><div class="finder-split"><aside class="finder-summary">${chips()}${garden()}</aside><div><div class="finder-options finder-setup">${option(['kit',micro?'Tray kit':'All-in-one kit',kitPhoto,micro?'Seeds and tray supplies. Add a light in a dim spot.':answers.grow==='basil'?'Light and basil pods included':'Basil garden shown. Crop contents need confirmation.'],'setup',false,answers.setup==='kit')}${option(['basics','Just the basics','/assets/photos/seedling-trays-nested-kvdp.jpg',answers.spot==='dim'?'Seeds + containers + a separate light':'Seeds + containers + growing medium'],'setup',false,answers.setup==='basics')}</div><div class="finder-bottom">${back()}${garden()}</div></div></div>${credits()}`;
  }
  host.querySelectorAll('img').forEach(img=>img.addEventListener('error',()=>{
   const frame=img.closest('.result-photo');
   if (frame){const p=document.createElement('p');p.className='image-fallback';p.textContent='The product photo is unavailable. Confirm the exact item on Amazon before buying.';img.replaceWith(p);}
   else {img.hidden=true;}
  },{once:true}));
  if (focus) {host.querySelector('h1')?.focus({preventScroll:true});window.scrollTo({top:0,behavior:'instant'});}
  if(view==='result') track('finder_result_view',{...answers,product:r.product});
 }
 host.addEventListener('click',event=>{
  const b=event.target.closest('button,a');if(!b)return;
  if(b.dataset.amazon){track('finder_amazon_click',{asin:b.dataset.amazon,...answers});return;}
  if(b.dataset.answer){
   const k=b.dataset.answer,v=b.dataset.value;
   if(answers[k]!==v){
    if(k==='grow'){answers={grow:v};}
    else if(k==='micro'){answers.micro=v;delete answers.setup;}
    else if(k==='spot'){answers.spot=v;delete answers.setup;}
    else answers[k]=v;
   }
   view=k==='grow'?(v==='microgreens'?'micro':'space'):k==='micro'?'space':core.route(answers).step;track('finder_answer',{field:k,value:v});sync();render();return;
  }
  if(b.dataset.edit){view=b.dataset.edit;sync();render();return;}
  if(b.hasAttribute('data-back')){
   view=view==='micro'?'grow':view==='space'?(answers.grow==='microgreens'?'micro':'grow'):view==='setup'||view==='switch'||view==='unavailable'?'space':'grow';sync();render();return;
  }
  if(b.dataset.adjust){
   const x=b.dataset.adjust; const wasSalad=answers.grow==='salad';
   if(x==='space'){view='space';sync();render();return;}
   if(x==='basics'){answers.setup='basics';}
   else {answers.grow=x;delete answers.micro;delete answers.setup;if(x==='microgreens'&&!wasSalad)answers.micro='radish';if(x==='basil')answers.setup='kit';}
   view=core.route(answers).step;sync();render();
  }
 });
 window.addEventListener('popstate',event=>{answers=core.normalize(Object.fromEntries(new URLSearchParams(location.search)));view=event.state?.view||core.route(answers).step;render();});
 sync(false);render(false);
})();
