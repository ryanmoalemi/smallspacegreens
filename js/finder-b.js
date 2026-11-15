(function(){
 'use strict';
 const host=document.getElementById('finder-b'),engine=window.SSGFinderB,base=window.SSGFinder,data=window.SSG_FINDER_DATA;
 if(!host||!engine||!base||!data)return;
 const e=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const spaceOptions=[['sunny','Sunny window','Direct sun at the window','/assets/photos/basil-window-personal-creations.jpg'],['dim','Dim spot','Little or no direct sun','/assets/photos/pea-shoots-counter.jpg'],['balcony','Balcony','An outdoor growing space','/assets/photos/balcony-garden-ruth-hartnup.jpg']];
 const foods=[['tomato','Cherry tomatoes','/assets/finder/cherry-tomatoes.webp'],['lettuce','Lettuce','/assets/products/supply-lettuce-leaves-600.webp'],['salad','Salad mix','/assets/finder/salad-mix.webp'],['basil','Basil','/assets/finder/basil.webp'],['herbs','Herbs','/assets/finder/herbs.webp'],['radish','Radishes','/assets/finder/radishes.webp'],['microgreens','Microgreens','/assets/photos/trays-broccoli-radish.jpg'],['unsure','Not sure','/assets/finder/not-sure.webp']];
 const microOptions=[['radish','Radish','Peppery leaves','/assets/photos/radish-microgreens-apapac.jpg'],['broccoli','Broccoli','Mild and fresh','/assets/photos/broccoli-microgreens-anotherdaysjourney.jpg'],['pea','Pea shoots','Sweet shoots','/assets/photos/pea-shoots-basket-susan-slater.jpg']];
 const icons={sprout:'<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M24 44V19" fill="none" stroke="currentColor" stroke-width="3"/><path d="M24 32C8 34 4 21 5 13c13-1 19 8 19 19Zm0-9C39 25 45 10 41 3c-13 2-17 9-17 20Z" fill="currentColor"/></svg>',sun:'<svg viewBox="0 0 48 48" aria-hidden="true"><g stroke="#d39a0b" stroke-width="3" stroke-linecap="round"><path d="M24 2v6m0 32v6M2 24h6m32 0h6M8 8l4 4m24 24 4 4M8 40l4-4M36 12l4-4"/></g><circle cx="24" cy="24" r="12" fill="#ffd448"/></svg>',food:'<svg viewBox="0 0 48 48" aria-hidden="true"><path d="m12 43 8-28 14 8Z" fill="#f5a510"/><path d="M25 19C15 5 24 0 28 14 35 0 43 6 31 19" fill="#5b9627"/></svg>',space:'<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M6 22h36L36 43H12Z" fill="#a86a3c"/><path d="M4 19h40v7H4Z" fill="#cf945d"/><path d="M17 19V8m14 11V5" stroke="#24532b" stroke-width="3"/><path d="M17 14C6 15 6 4 8 3c10 1 9 11 9 11Zm14-4C40 13 43 1 40 0c-9 0-9 10-9 10Z" fill="#5f9b3e"/></svg>',cart:'<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M3 6h7l6 27h24l5-20H12" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/><circle cx="20" cy="42" r="3" fill="currentColor"/><circle cx="37" cy="42" r="3" fill="currentColor"/></svg>'};
 const mobile=window.matchMedia('(max-width:767px)');
 let answers=engine.normalize(Object.assign(JSON.parse(host.dataset.initialAnswers||'{}'),Object.fromEntries(new URLSearchParams(location.search)))),phase='grow',revealed=false,started=false,lastResult='',completedEvents=new Set();
 const query=new URLSearchParams(location.search);
 if(answers.grow){phase=engine.route(answers).step;revealed=phase==='result';}
 function track(name,params={}){if(!['localhost','127.0.0.1'].includes(location.hostname)&&typeof window.gtag==='function')window.gtag('event',name,{variant:'B',...params});}
 function photo(src,alt='',cls=''){return `<img src="${e(src)}" alt="${e(alt)}" class="${e(cls)}" width="800" height="600" decoding="async">`;}
 function label(value,list){return (list.find(x=>x[0]===value)||[])[1]||'';}
 function chooseOptions(field){
  if(field==='grow')return foods.filter(x=>base.choices('grow',answers).includes(x[0]));
  if(field==='spot')return spaceOptions.map(x=>answers.grow==='tomato'&&x[0]==='balcony'?[x[0],'Sunny balcony','6 to 8 hours direct sun · space for a 5-gallon bag',x[3]]:x).filter(x=>base.choices('spot',answers).includes(x[0]));
  if(field==='micro')return microOptions.filter(x=>base.choices('micro',answers).includes(x[0]));
  const micro=answers.grow==='microgreens';
  return [['kit',micro?'Tray kit':'All-in-one kit',micro?'Seeds, trays and medium. Add a separate light in a dim spot.':'Light and three basil pods included',data.products[micro?'microkit':'basil-kit'].image],['basics','Just the basics',answers.spot==='dim'?'Seeds + containers + a separate light':'Seeds + containers + growing medium','/assets/photos/seedling-trays-nested-kvdp.jpg']].filter(x=>base.choices('setup',answers).includes(x[0]));
 }
 function option(item,field,compact=false){
  const selected=answers[field]===item[0],food=field==='grow',src=item[food?2:3];
  return `<button type="button" class="b-option ${food?'food-option':''} ${compact?'compact':''}${selected?' selected':''}" data-field="${field}" data-value="${e(item[0])}" aria-pressed="${selected}">${photo(src)}<span class="option-copy"><strong>${e(item[1])}</strong>${!food?`<span>${e(item[2])}</span>`:''}</span><span class="option-check" aria-hidden="true">✓</span></button>`;
 }
 function chips(){const xs=[answers.grow&&['grow',label(answers.grow,foods)],answers.micro&&['micro',label(answers.micro,microOptions)],answers.spot&&['space',label(answers.spot,spaceOptions)],answers.setup&&engine.questionSteps(answers).includes('setup')&&['setup',answers.setup==='kit'?'Kit':'Basics']].filter(Boolean);return `<div class="b-chips">${xs.map(([step,l])=>`<button data-edit="${step}" aria-label="Change ${e(l)}">${e(l)}</button>`).join('')}</div>`;}
 function rail(){const active=revealed?3:phase==='grow'||phase==='micro'||phase==='entry'?0:phase==='space'?1:2;return `<ol class="b-rail" aria-label="Your garden plan">${['Grow','Space','Setup','Your Picks'].map((x,i)=>`<li class="${i<active?'complete':i===active?'current':''}"${i===active?' aria-current="step"':''}><span>${i<active?'✓':i+1}</span><strong>${x}</strong></li>`).join('')}</ol>`;}
 function hero(){return `<section class="b-hero"><div class="hero-copy"><p class="hero-kicker">A LITTLE SPACE. A FRESH START.</p><h1><span class="desktop-heading">Find Gardening Gear <br>for Your <br><em>Small Space.</em></span><span class="mobile-heading">Grow Fresh<br>Food in<br>Small Spaces</span></h1><p>A fun, easy way to find your growing setup, from your first seed to the supplies you need.</p><button class="b-button yellow entry-start" data-start>${icons.sprout}Find My Setup <span aria-hidden="true">→</span></button><span class="no-email">A few quick questions. No email needed.</span></div><aside class="b-checklist" aria-label="Our focus"><span>✓ <b>Small spaces</b></span><span>✓ <b>Real products</b></span><span>✓ <b>Fresh food at home</b></span><i aria-hidden="true"></i></aside></section>`;}
 function ribbon(){return `<div class="b-ribbon"><span>${icons.sprout}<strong>Small Spaces</strong></span><span>${icons.food}<strong>Real Food</strong></span><span>${icons.cart}<strong>Useful Gear</strong></span></div>`;}
 function entry(){return `${hero()}${ribbon()}<div class="entry-garden">${photo('/assets/finder-b/tomato-garden.webp','')}<span>Balcony, patio,<br>indoors and more.</span></div>`;}
 function desktopForm(){
  return `<section class="b-panel b-form b-step-form" aria-label="Build your garden plan"><h2>${icons.sprout}Let’s Build Your Garden Plan</h2>${rail()}${question().replace('b-mobile-question','b-desktop-question').replace('<h1 tabindex="-1">','<h2 tabindex="-1">').replace('</span></h1>','</span></h2>')}<button class="b-text" data-reset>Start over</button></section>`;
 }
 function readyCards(r){
  const all=[r.product,...r.extras],roles={pot:'Growing container',bag:'Growing container',soil:'Potting mix',tray:'Drained growing tray',drip:'Solid drip tray',coir:'Growing medium',light:'Grow light'};
  const reasons={pot:'A pot and saucer for your chosen crop.',bag:'Use one 5-gallon bag per tomato plant. Sold as a multipack.',soil:r.product==='tomato'?'Allow about 20 US quarts for one grow bag. Check pack volume.':'Growing mix for your container.',tray:'Holes let excess water drain into the solid tray.',drip:'Pairs with the drained 1010 tray above.',coir:'A growing medium for your microgreen tray.',light:'Your indoor spot needs this separate lamp.'};
  return `<div class="b-products count-${all.length}">${all.map((id,i)=>{const p=data.products[id];return `<article class="b-product${i===0?' primary-product':''}"><div class="b-product-photo">${photo(p.image,p.name)}<span class="product-role">${i===0?(r.product==='basil-kit'||r.product==='microkit'?'Your starter kit':'Your crop'):roles[id]||'Growing supply'}</span></div><div class="b-product-copy"><h3>${e(p.name)}</h3><p>${e(i===0?(p.kind||'Selected for your grow'):reasons[id]||'A companion for your growing setup.')}</p><a class="b-button yellow" href="${e(p.url)}" target="_blank" rel="sponsored nofollow noopener" data-amazon="${e(p.asin)}">Buy on Amazon <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M11 3h6v6m-1-5-8 8M9 5H4v11h11v-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg><span class="sr-only"> (opens in a new tab)</span></a></div></article>`;}).join('')}</div>`;
 }

 function resultPanel(){
  const r=engine.route(answers),ready=revealed&&r.step==='result';
  if(!ready)return `<section class="b-panel b-results waiting" aria-label="Your garden picks"><h2>${icons.sprout}Your Garden Picks</h2><div class="b-pending"><div class="pending-photo">${photo('/assets/photos/balcony-garden-ruth-hartnup.jpg','Edible plants growing in balcony containers.')}</div><span class="pending-badge">A little space. Lots of possibility.</span><h3>Your next little grow starts here.</h3><p>Choose your light, space and favorite food. We’ll put together a crop and the supplies to get it started.</p><div class="pending-facts"><span>✓ Real product photos</span><span>✓ No email needed</span><span>✓ A setup for your choices</span></div></div></section>`;
  const copy=base.resultCopy(r.answers,r),reason=copy.benefit;
  const help=r.extras.includes('light')?'Add a grow light for your dim spot. The separate lamp is listed below.':'';
  const caution=answers.spot==='balcony'&&['lettuce','salad'].includes(r.product)?'Salad greens prefer cooler conditions. Check the direct sun and heat on your balcony.':'';

  return `<section class="b-panel b-results ready" aria-label="Your garden picks"><div class="mobile-result-photo" aria-hidden="true"></div><h2><span class="garden-surprise" aria-hidden="true"><span class="surprise-sprout">🌱</span><i style="--leaf:0"></i><i style="--leaf:1"></i><i style="--leaf:2"></i><i style="--leaf:3"></i><i style="--leaf:4"></i><i style="--leaf:5"></i><i style="--leaf:6"></i><i style="--leaf:7"></i></span>Ta-da! Your Garden Picks</h2><span class="plan-ready">✓ Your garden plan is ready</span><h1 class="mobile-result-title">Garden Picks for Your Space</h1>${chips()}<div class="b-result-intro"><h3 tabindex="-1">${e(copy.headline.replace('your dim spot','your indoor spot'))}</h3><p>${e(reason)}</p></div><p class="b-disclosure">As an Amazon Associate I earn from qualifying purchases.</p>${readyCards(r)}${caution?`<p class="b-condition">${e(caution)}</p>`:''}${r.note?`<details class="setup-note"><summary>Growing notes &amp; quantities</summary><p>${e(r.note)}</p></details>`:''}<div class="b-reason-strip"><strong>${icons.sprout}Why These Picks?</strong><span>✓ ${e(label(answers.spot,spaceOptions))}</span><span>✓ ${e(label(answers.grow,foods))}</span></div><div class="b-result-actions"><a class="b-text" href="${e(data.guides[r.guide])}">Read the growing guide</a><button class="b-text" data-edit="grow">Change answers</button><button class="b-text" data-reset>Start over</button></div></section>`;
 }
 function question(){
  const step=phase==='entry'?engine.route(answers).step:phase;
  const config={grow:['grow','What do you want to grow?','Pick the food you’d like to grow.','food'],space:['spot','Where will it grow?','Choose the space you can actually use.','space'],micro:['micro','Which microgreens?','Pick your favorite flavor.','food'],setup:['setup','All-in-one kit or just the basics?','Choose the setup you prefer.','sprout']};
  const [field,title,helper,icon]=config[step]||config.grow,opts=chooseOptions(field),selected=opts.some(x=>x[0]===answers[field]);
  const percent=step==='grow'||step==='micro'?0:step==='space'?33:67;
  return `<section class="b-mobile-question"><div class="mobile-plan-label"><strong>Your Garden Plan</strong><span>${step==='micro'?'Crop details':step==='setup'?'Setup style':{grow:'Grow',space:'Space'}[step]}</span></div><div class="b-mobile-progress" role="progressbar" aria-label="Completed garden choices" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${percent}"><span style="width:${percent}%"></span></div>${step==='grow'?'':'<button class="b-back" data-back>‹ Back</button>'}<h1 tabindex="-1">${icons[icon]}<span>${e(title)}</span></h1><p class="mobile-helper">${e(helper)}</p><div class="b-options count-${opts.length} ${field==='grow'?'b-foods':''}">${opts.map(x=>option(x,field)).join('')}</div>${step==='micro'?'<button class="b-text" data-field="micro" data-value="broccoli">Not sure? Try broccoli</button>':''}<div class="b-garden-footer" aria-hidden="true">${photo('/assets/photos/emerging-sprouts-nrcs.jpg')}</div></section>`;
 }
 function sync(push=true){const u=new URL(location.href);u.pathname='/product-finder/';['light','space','grow','micro','spot','setup','kit','step'].forEach(k=>u.searchParams.delete(k));Object.entries(answers).forEach(([k,v])=>{u.searchParams.set(k,v);});if(phase!=='entry')u.searchParams.set('step',phase);history[push?'pushState':'replaceState']({phase,revealed,answers},'',u);}

 function revealIcon(i){return '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+[`<path d="M5 5h22v15H15l-7 6v-6H5z"/><path d="M10 10h12M10 15h8"/>`, `<path d="M7 10h18l2 17H5zM11 11V8a5 5 0 0110 0v3"/><path d="M11 20q5 5 10 0"/>`, `<path d="M16 28V12M16 20C5 20 4 11 5 8c9 0 12 5 11 12M16 15C16 5 24 3 28 4c0 8-5 13-12 11"/>`][i]+'</svg>'; }
 let revealTimer;
 function reveal(){
  clearTimeout(revealTimer);
  const evidence=window.SSGReviewMatcher.sequence(answers,engine.route(answers),window.SSG_REVIEW_EVIDENCE.records);
  if(!evidence.length){render(true);return;}
  const final=window.SSGReviewMatcher.finalLine(answers);
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const duration=reduced?200:3200;
  const finaleGraphic=`<svg class="reveal-prize" viewBox="0 0 96 80" aria-hidden="true"><path class="prize-rays" d="M12 26l9 5M75 20l8-7M48 7v10M84 43h-10M18 59l-8 4" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"/><path d="M29 43h40l-6 29H35z" fill="#dc8c63"/><path d="M25 42h48v8H25z" fill="#f0b389"/><path d="M49 44V25" fill="none" stroke="#24563a" stroke-width="4"/><path class="prize-leaf" d="M49 34C29 35 27 19 28 16c16 0 23 8 21 18M49 28C48 9 65 8 70 9c-1 16-10 23-21 19" fill="#62983c"/><path d="M78 54l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z" fill="#f4ce58"/></svg>`;
  host.innerHTML=`<section class="garden-reveal" aria-labelledby="reveal-title" style="--step-duration:${duration}ms"><div class="reveal-art" aria-hidden="true"><span class="reveal-sun">☀</span><span class="reveal-sprout">🌱</span><span class="reveal-spark">✦</span></div><p class="reveal-eyebrow">YOUR GARDEN PLAN · THE FINAL STEP</p><h1 id="reveal-title" tabindex="-1">Your little garden is taking shape.</h1><p class="reveal-status" role="status" aria-live="polite">1 of 4 · A little grower wisdom</p><ol class="reveal-checks">${evidence.map((r,i)=>`<li class="reveal-stage" data-stage="${i}"><span class="reveal-step-icon icon-${i}">${revealIcon(i)}<b>${i+1}</b></span><div class="reveal-stage-copy"><small>${e(r.label)}</small><span>${e(r.question)}</span><div class="reveal-progress" aria-hidden="true"><span></span></div></div></li>`).join('')}<li class="reveal-stage reveal-finale" data-stage="3"><span class="reveal-step-icon icon-finale" aria-hidden="true">✦<b>4</b></span><div class="reveal-stage-copy"><small>MADE FOR YOUR LITTLE SPACE</small><strong>${e(final)}</strong><div class="reveal-progress" aria-hidden="true"><span></span></div></div>${finaleGraphic}</li></ol><p class="review-date">Based on saved grower discussions and our product shortlist.</p></section>`;
  host.querySelector('h1').focus({preventScroll:true});host.querySelector('.garden-reveal').scrollIntoView({block:'start',behavior:'instant'});
  const stages=Array.from(host.querySelectorAll('[data-stage]'));
  const status=host.querySelector('.reveal-status');
  const labels=['A little grower wisdom','Finding your fit','The details growers care about','Your picks are almost ready!'];
  function advance(index){
   if(index>0){stages[index-1].classList.remove('is-active');stages[index-1].classList.add('is-done');stages[index-1].removeAttribute('aria-current');}
   if(index===stages.length){render(true);return;}
   stages[index].classList.add('is-active');stages[index].setAttribute('aria-current','step');
   status.textContent=`${index+1} of 4 · ${labels[index]}`;
   host.querySelector('.garden-reveal').classList.toggle('is-finale',index===3);
   revealTimer=setTimeout(()=>advance(index+1),duration);
  }
  advance(0);
 }

 function render(focus=false){
  clearTimeout(revealTimer);
  const r=engine.route(answers);
  if(!mobile.matches&&phase==='entry')phase='grow';
  if(revealed&&r.step!=='result')revealed=false;
  document.body.dataset.screen=mobile.matches?phase:'desktop';
  host.innerHTML=mobile.matches?(phase==='entry'?entry():phase==='result'&&r.step==='result'?`<div class="mobile-results-wrap"><button class="b-back" data-back>‹ Back</button>${resultPanel()}</div>`:question()):`${hero()}<div class="b-panels b-sequential">${revealed&&r.step==='result'?`<div class="b-desktop-result"><button class="b-back" data-back>‹ Back</button>${resultPanel()}</div>`:desktopForm()}</div>`;
  host.querySelectorAll('img').forEach(img=>img.addEventListener('error',()=>{const p=document.createElement('span');p.className='b-image-fallback';p.textContent='Photo unavailable';img.replaceWith(p);},{once:true}));
  if(focus){const target=host.querySelector(mobile.matches?'.b-mobile-question h1,.b-result-intro h3':'.b-desktop-question h2,.b-result-intro h3');if(target){target.focus({preventScroll:true});if(mobile.matches)window.scrollTo({top:0,behavior:'instant'});}}
  if(revealed&&r.step==='result'){if(focus)host.querySelector('.b-results.ready')?.scrollIntoView({block:'start',behavior:'instant'});const key=JSON.stringify(answers);if(key!==lastResult){lastResult=key;track('finder_result_view',{...answers,product:r.product});}}
 }
 function start(){if(!started){started=true;track('finder_start');}phase='grow';sync();render(true);if(!mobile.matches)host.querySelector('.b-form')?.scrollIntoView({behavior:'smooth',block:'start'});}
 host.addEventListener('click',event=>{
  const el=event.target.closest('button,a');if(!el)return;
  if(el.dataset.amazon){track('finder_amazon_click',{asin:el.dataset.amazon,...answers});return;}
  if(el.hasAttribute('data-start')){start();return;}
  if(el.dataset.field){if(!started){started=true;track('finder_start');}answers=engine.choose(answers,el.dataset.field,el.dataset.value);phase=el.dataset.field==='grow'?(answers.grow==='microgreens'?'micro':'space'):el.dataset.field==='micro'?'space':engine.route(answers).step;revealed=phase==='result';track('finder_answer',{field:el.dataset.field,value:el.dataset.value});sync();if(phase==='result'){reveal();return;}render(true);if(!mobile.matches)host.querySelector('.b-sequential')?.scrollIntoView({behavior:'instant',block:'start'});return;}
  if(el.hasAttribute('data-reset')){answers={};revealed=false;lastResult='';completedEvents.clear();started=false;phase='grow';sync();render();window.scrollTo({top:0,behavior:'instant'});return;}
  if(el.dataset.edit){phase=el.dataset.edit;revealed=false;sync();render(true);if(!mobile.matches)host.querySelector('.b-form')?.scrollIntoView({behavior:'smooth',block:'start'});return;}
  if(el.hasAttribute('data-back')){if(phase==='grow'){answers={};started=false;lastResult='';completedEvents.clear();}revealed=false;const steps=engine.questionSteps(answers),index=steps.indexOf(phase);phase=phase==='result'?steps[steps.length-1]:index>0?steps[index-1]:'entry';sync();render(true);return;}

 });
 document.querySelector('.b-menu')?.addEventListener('click',event=>{const button=event.currentTarget,open=button.getAttribute('aria-expanded')!=='true';button.setAttribute('aria-expanded',String(open));document.querySelector('#b-nav').classList.toggle('open',open);});
 window.addEventListener('popstate',event=>{answers=engine.normalize(Object.fromEntries(new URLSearchParams(location.search)));phase=event.state?.phase||(answers.grow?engine.route(answers).step:'entry');revealed=event.state?.revealed??phase==='result';render(true);});
 mobile.addEventListener('change',()=>{if(phase==='entry'&&answers.grow)phase=engine.route(answers).step;render();});
 // Restore a question only when it is consistent with the saved answer prefix.
 const savedStep=query.get('step');if(answers.grow&&engine.questionSteps(answers).includes(savedStep)&&(savedStep!=='setup'||base.route({...answers,setup:undefined}).step==='setup')){phase=savedStep;revealed=false;}
 sync(false);render();track('finder_variant_entry');
})();
