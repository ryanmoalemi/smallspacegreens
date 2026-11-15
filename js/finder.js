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
  ['sunny','Sunny window','/assets/photos/basil-window-personal-creations.jpg','Direct sun at the window'],
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
  const done=view==='result';
  const i=view==='grow'||view==='micro'?0:view==='space'?1:2;
  const percent=done?100:[33,67,90][i];
  return `<div class="finder-navigation">${view==='grow'?'<span></span>':back()}<div class="finder-progress"><p class="stage-count">${done?'Your match is ready':`${i+1} of 3 <span>${['Grow','Space','Setup'][i]}</span>`}</p><div class="finder-progress-track" role="progressbar" aria-label="Finder progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${percent}"><span style="width:${percent}%"></span></div><ol class="finder-stages" aria-label="Your growing setup">${['Grow','Space','Setup'].map((label,n)=>`<li${!done&&n===i?' aria-current="step"':''} class="${done||n<i?'is-complete':''}">${label}</li>`).join('')}</ol></div></div>`;
 }
 function spaceChoices() {
  return spaces.map((x,i)=>[x[0],answers.grow==='tomato'&&x[0]==='balcony'?'Sunny balcony':x[1],x[2],answers.grow==='tomato'&&x[0]==='balcony'?'6 to 8 hours direct sun · space for a 5-gallon bag':x[3]]).filter(x=>core.choices('spot',answers).includes(x[0]));
 }
 function completion() {
  return `<aside class="completion-banner" aria-label="Your choices are ready"><div class="completion-plant">${garden()}</div><div><strong>Your match is ready.</strong><p>Based on the choices you made.</p><div class="completion-chips"><span>Light</span><span>Space</span><span>What you want to eat</span></div></div></aside>`;
 }
 function back() { return '<button class="finder-back" data-back><svg viewBox="0 0 20 20" aria-hidden="true"><path d="m12 5-5 5 5 5" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>Back</button>'; }
 function option(item,field,row=false,selected=false) {
  return `<button type="button" class="finder-choice ${row?'finder-row':''} ${item[0]==='unsure'?'not-sure':''}" data-answer="${field}" data-value="${item[0]}" aria-pressed="${selected}">${photo(item[2])}<span class="choice-label">${e(item[1])}${item[3]?`<span class="choice-helper">${e(item[3])}</span>`:''}</span></button>`;
 }
 function credits(){return '<p class="finder-credits"><a href="/photo-credits/#finder-photography">Photo credits</a></p>';}

 function amazon(p,text,primary=false){return `<a class="amazon-button ${primary?'finder-primary':'finder-link'}" href="${e(p.url)}" rel="sponsored nofollow noopener" target="_blank" data-amazon="${e(p.asin)}">Buy on Amazon<span class="sr-only"> (opens Amazon in a new tab)</span></a>`;}
 function message(reason) {
  const cases={
   tomato:['This spot is not a fit for our tomato setup.','Tomatoes need strong direct sun and room to grow. A dim counter with a small clip-on lamp is not our recommended tomato setup.','Try lettuce instead','lettuce','/assets/finder/cherry-tomatoes.webp'],
   balcony:['Let’s find a better balcony crop.','Our first-tray microgreen setups are for indoors. Try garden lettuce outside, or choose an indoor growing spot.','Try lettuce instead','lettuce','/assets/photos/balcony-garden-ruth-hartnup.jpg'],
   radish:['Radish roots need more light.','You chose garden radishes. For this dim spot, you could grow peppery radish microgreens instead, with a grow light.','Try radish microgreens','microgreens','/assets/finder/radishes.webp'],
   salad:['A different kind of salad for this spot.','A dim counter needs added light. A microgreen tray grows young leaves, rather than the mature salad greens you selected.','Choose microgreens','microgreens','/assets/finder/salad-mix.webp'],
   'pea-kit':['Let’s build your pea-shoot setup.','We haven’t confirmed a complete kit containing the pea seed you chose. You can start with pea seed and separate tray supplies instead.','Show me the basics','basics','/assets/photos/pea-shoots-basket-susan-slater.jpg'],
   unnamed:['Let’s choose a crop-matched setup.','We could not confirm that the suggested countertop kit includes the seeds you chose. You can use seeds and a separate light, or choose a basil kit with named basil pods.','See seeds and a light','basics','/assets/photos/basil-window-personal-creations.jpg'],
   'tomato-support':['A tomato setup needs more room and support.','Our selected tomato is a full-size climbing plant. It needs 6 to 8 hours of direct sun, a large container and suitable support. Use the tomato-growing guidance before buying, or try lettuce in a smaller pot.','Try lettuce instead','lettuce','/assets/finder/cherry-tomatoes.webp'],
   product:['This setup needs another check.','We have not confirmed every exact product and photo for this combination. Choose another setup, or use the growing guide while we check it.','Change growing spot','space','/assets/photos/trays-broccoli-radish.jpg']
  };
  const c=cases[reason]||cases.product;
  return `${rail()}<section class="finder-message"><h1 tabindex="-1">${c[0]}</h1>${chips()}${photo(c[4],'','message-photo')}<p>${c[1]}</p><button class="finder-primary" data-adjust="${c[3]}">${c[2]}</button>${reason==='unnamed'?'<button class="finder-link" data-adjust="basil">Try the basil kit instead</button>':''}<button class="finder-link" data-edit="space">Change growing spot</button><a class="finder-link" href="/guides/${reason==='balcony'?'balcony-salad-garden':'first-tray-checklist'}/">Read the growing guide</a></section>${credits()}`;
 }
 function result(r) {
  const p=data.products[r.product];
  if(!p||p.status==='unverified'||!p.image||r.extras.some(id=>!data.products[id]?.image||data.products[id].status==='unverified'))return message('product');
  const copy=core.resultCopy(answers,r);
  const light=r.extras.includes('light')?'Add a grow light for your dim spot. The separate lamp is listed below.':'';
  const caution=answers.spot==='balcony'&&['lettuce','salad'].includes(r.product)?'Salad greens prefer cooler conditions. Check the direct sun and heat on your balcony.':'';
  const cropPhoto=answers.grow==='microgreens'?(micros.find(x=>x[0]===answers.micro)||micros[1])[2]:answers.grow==='unsure'?(r.product==='micro-broccoli'?micros[1][2]:crops[1][2]):(crops.find(x=>x[0]===answers.grow)||crops[1])[2];
  const matchFacts=[r.product==='basil-kit'?'Grow light included':r.extras.includes('light')?'Separate light below':'Natural light setup',r.product==='basil-kit'?'Basil pods included':r.product==='microkit'?'Seeds + trays + medium':'Seeds + supplies below'];
  const extras=r.extras.length?`<section class="finder-extras"><h2>Make it a growing setup</h2><p class="extras-intro">A few useful companions for your new grow. Sold separately.</p><div class="finder-extra-grid count-${r.extras.length}">${r.extras.map(id=>{const x=data.products[id];return `<article class="finder-extra">${photo(x.image,x.name)}<div><h3>${e(x.name)}</h3>${r.product==='tomato'&&id==='bag'?'<p>Use one bag per plant; this listing is a multipack.</p>':r.product==='tomato'&&id==='soil'?'<p>Allow about 20 US quarts for one 5-gallon bag. Check pack volume.</p>':''}${amazon(x,'View on Amazon')}</div></article>`;}).join('')}</div></section>`:'';
  return `${rail()}<section class="finder-result"><header class="match-welcome"><div><p class="match-kicker">YOUR MATCH · A FRESH START</p><h2>Your little garden starts here.</h2><p>Small space. Something lovely to grow.</p></div><span class="welcome-sprout" aria-hidden="true">${garden()}</span></header><div class="answer-echo">${chips()}</div>${light?`<p class="match-light">${e(light)}</p>`:''}<div class="result-layout"><figure class="result-photo"><span class="photo-sun" aria-hidden="true"></span><span class="grow-sticker">LET’S GROW</span>${photo(p.image,p.name)}<span class="crop-peek">${photo(cropPhoto,'')}<span>A little inspiration</span></span></figure><div class="result-copy"><p class="product-kind"><span class="match-check" aria-hidden="true">✓</span> Picked for you · ${e(p.kind)}</p><h1 tabindex="-1">${e(copy.headline)}</h1><p class="product-brand">${e(p.name)}</p><p class="benefit">${e(copy.benefit)}</p><ul class="match-facts">${matchFacts.map(x=>`<li><span aria-hidden="true">✓</span>${e(x)}</li>`).join('')}</ul>${amazon(p,'Buy on Amazon',true)}</div></div>${r.note?`<p class="result-context">${e(r.note)}</p>`:''}${caution?`<p class="result-context">${e(caution)}</p>`:''}${extras}<div class="finder-result-links"><a class="finder-link" href="${e(data.guides[r.guide])}">Read the growing guide</a><button class="finder-link" data-reset>Start over</button></div></section>${credits()}`;
 }
 function sync(push=true) {
  const u=new URL(location.href);
  ['grow','micro','spot','setup','kit'].forEach(k=>u.searchParams.delete(k));
  Object.entries(answers).forEach(([k,v])=>u.searchParams.set(k,v));
  if (push) history.pushState({answers,view},'',u); else history.replaceState({answers,view},'',u);
 }

 let revealTimer;
 function reveal(){
  clearTimeout(revealTimer);
  const evidence=window.SSGReviewMatcher.sequence(answers,core.route(answers),window.SSG_REVIEW_EVIDENCE.records);
  if(!evidence.length){render(true);return;}
  const final=window.SSGReviewMatcher.finalLine(answers);
  host.innerHTML=`<section class="garden-reveal" aria-labelledby="reveal-title"><div class="reveal-art" aria-hidden="true"><span class="reveal-sun">☀</span><span class="reveal-sprout">🌱</span><span class="reveal-spark">✦</span></div><p class="reveal-eyebrow">FROM OTHER GROWERS TO YOUR LITTLE GARDEN</p><h1 id="reveal-title" tabindex="-1">Let’s see what other growers say.</h1><p>Checking saved discussions against your choices.</p><ol class="reveal-checks">${evidence.map((r,i)=>`<li style="animation-delay:${i*.6}s"><a href="${e(r.url)}" target="_blank" rel="noopener">${e(r.question)}</a></li>`).join('')}<li style="animation-delay:${evidence.length*.6}s"><strong>${e(final)}</strong></li></ol><p class="review-date">Saved source excerpts · checked November 15, 2026</p><button class="reveal-skip" data-skip-reveal>Show my picks now</button></section>`;
  host.querySelector('h1').focus({preventScroll:true});host.scrollIntoView({block:'start',behavior:'instant'});
  const finish=()=>{clearTimeout(revealTimer);render(true);};
  host.querySelector('[data-skip-reveal]').addEventListener('click',finish,{once:true});
  revealTimer=setTimeout(finish,window.matchMedia('(prefers-reduced-motion: reduce)').matches?350:(evidence.length+1)*1000+500);
 }

 function render(focus=true) {
  clearTimeout(revealTimer);
  const r=core.route(answers);
  if (view==='result') host.innerHTML=result(r);
  else if (view==='switch'||view==='unavailable') host.innerHTML=message(r.reason);
  else if(view==='grow') host.innerHTML=`${rail()}<h1 tabindex="-1">What do you want<br class="mobile-break"> to grow?</h1><div class="finder-grid">${crops.filter(x=>core.choices('grow').includes(x[0])).map(x=>option(x,'grow',false,answers.grow===x[0])).join('')}</div>${credits()}`;
  else if(view==='space') host.innerHTML=`${rail()}<h1 tabindex="-1">Where will it grow?</h1><div class="space-selection">${chips()}</div><div class="finder-space-grid count-${spaceChoices().length}">${spaceChoices().map(x=>option(x,'spot',false,answers.spot===x[0])).join('')}</div><div class="finder-bottom"></div>${credits()}`;
  else if(view==='micro') host.innerHTML=`${rail()}<h1 tabindex="-1">Which microgreens?</h1><div class="finder-split"><aside class="finder-summary">${chips()}</aside><div><div class="finder-options">${micros.filter(x=>core.choices('micro',answers).includes(x[0])).map(x=>option(x,'micro',true,answers.micro===x[0])).join('')}</div><div class="micro-controls"><button class="finder-link micro-skip" data-answer="micro" data-value="broccoli">Not sure? Try broccoli</button></div></div></div>${credits()}`;
  else if(view==='setup') {
   const micro=answers.grow==='microgreens';
   const kitPhoto=micro?data.products.microkit.image:data.products['basil-kit'].image;
   const switchKit=false;
   host.innerHTML=`${rail()}<h1 tabindex="-1">All-in-one kit or<br> just the basics?</h1><div class="finder-split"><aside class="finder-summary">${chips()}</aside><div><div class="finder-options finder-setup">${!core.choices('setup',answers).includes('kit')?'':switchKit?`<button class="finder-choice" data-adjust="basil">${photo(kitPhoto)}<span class="choice-label">Switch to a basil kit</span><span class="choice-helper">Basil shown. The recommended garden includes basil pods and a light.</span></button>`:option(['kit',micro?'Tray kit':'All-in-one kit',kitPhoto,micro?'Seeds, trays and medium. Add a separate light in a dim spot.':answers.grow==='basil'?'Light and three basil pods included':'Check crop-matched kit options'],'setup',false,answers.setup==='kit')}${option(['basics','Just the basics','/assets/photos/seedling-trays-nested-kvdp.jpg',answers.spot==='dim'?'Seeds + containers + a separate light':'Seeds + containers + growing medium'],'setup',false,answers.setup==='basics')}</div><div class="finder-bottom">${garden()}</div></div></div>${credits()}`;
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
  if(b.hasAttribute('data-reset')){answers={};view='grow';sync();render();return;}
  if(b.dataset.amazon){track('finder_amazon_click',{asin:b.dataset.amazon,...answers});return;}
  if(b.dataset.answer){
   const k=b.dataset.answer,v=b.dataset.value;
   if(answers[k]!==v){
    if(k==='grow'){answers={grow:v};}
    else if(k==='micro'){answers.micro=v;delete answers.setup;}
    else if(k==='spot'){answers.spot=v;delete answers.setup;}
    else answers[k]=v;
   }
   view=k==='grow'?(v==='microgreens'?'micro':'space'):k==='micro'?'space':core.route(answers).step;track('finder_answer',{field:k,value:v});sync();if(view==='result'){reveal();return;}render();return;
  }
  if(b.dataset.edit){view=b.dataset.edit;sync();render();return;}
  if(b.hasAttribute('data-back')){
   view=view==='micro'?'grow':view==='space'?(answers.grow==='microgreens'?'micro':'grow'):view==='result'?(core.route({...answers,setup:undefined}).step==='setup'?'setup':'space'):view==='setup'||view==='switch'||view==='unavailable'?'space':'grow';sync();render();return;
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
