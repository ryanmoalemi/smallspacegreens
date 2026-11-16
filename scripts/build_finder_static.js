/* Build every supported no-JS journey from the same routing engine as the quiz. */
const fs=require('fs'),path=require('path'),core=require('../src/finder-core');
const matcher=require('../src/review-matcher'),evidence=require('../data/reviews/evidence.json');
const root=path.resolve(__dirname,'..'),data=require('../src/finder.json');
const esc=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const labels={tomato:'Cherry tomatoes',lettuce:'Lettuce',salad:'Salad mix',basil:'Basil',herbs:'Herbs',radish:'Radishes',microgreens:'Microgreens',unsure:'Not sure',sunny:'Sunny window',dim:'Dim spot',balcony:'Balcony',broccoli:'Broccoli',pea:'Pea shoots',kit:'All-in-one kit',basics:'Build your own setup'};
const images={tomato:'/assets/finder/cherry-tomatoes.webp',lettuce:'/assets/products/supply-lettuce-leaves-600.webp',salad:'/assets/finder/salad-mix.webp',basil:'/assets/finder/basil.webp',herbs:'/assets/finder/herbs.webp',radish:'/assets/finder/radishes.webp',microgreens:'/assets/photos/trays-broccoli-radish.jpg',unsure:'/assets/finder/not-sure.webp',sunny:'/assets/photos/basil-window-personal-creations.jpg',dim:'/assets/photos/pea-shoots-counter.jpg',balcony:'/assets/photos/balcony-garden-ruth-hartnup.jpg',broccoli:'/assets/photos/broccoli-microgreens-anotherdaysjourney.jpg',pea:'/assets/photos/pea-shoots-basket-susan-slater.jpg',kit:data.products.microkit.image,basics:'/assets/photos/seedling-trays-nested-kvdp.jpg'};
const vm=require('vm'),browser={SSGFinder:core,SSGReviewMatcher:matcher,SSG_REVIEW_EVIDENCE:evidence};vm.runInNewContext(fs.readFileSync(path.join(root,'src/finder-shopping.js'),'utf8'),{window:browser});const shopping=browser.SSGShopping;
const states=[];function walk(a,parent){const r=core.route(a);states.push({a,r,parent});if(r.step==='result')return;const field={grow:'grow',micro:'micro',space:'spot',room:'room',setup:'setup'}[r.step];if(!field)throw Error('Unsupported static route '+r.step);for(const value of core.choices(field,a))walk({...a,[field]:value},a);}walk({},null);
// Refresh bookmarked URLs from before the single-option setup questions were removed.
const legacy=states.filter(x=>x.r.step==='result'&&!x.a.setup&&core.normalize(x.a).setup).map(x=>({...x,a:core.normalize(x.a)}));
states.push(...legacy);
// Keep previously published static bookmarks useful when a question or default changes.
for(const dir of fs.readdirSync(path.join(root,'finder-steps'))){
 const file=path.join(root,'finder-steps',dir,'index.html');if(!fs.existsSync(file))continue;
 const initial=fs.readFileSync(file,'utf8').match(/data-initial-answers="([^"]*)"/);if(!initial)continue;
 const a=JSON.parse(initial[1].replaceAll('&quot;','"'));if(states.some(s=>key(s.a)===key(a)))continue;
 states.push({a,r:core.route(a),parent:{grow:a.grow}});
}

function key(a){return ['grow','micro','spot','room','setup'].filter(k=>a[k]).map(k=>k+'-'+a[k]).join('--')||'start';}
const style=`<style>.static-finder{max-width:960px;margin:12px auto;padding:20px;background:#fffdf8;border-radius:22px;color:#214d3a;text-align:center}.static-finder h1{font-size:30px;line-height:1.15;margin:8px}.static-finder p{font-size:15px;line-height:1.4}.static-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}.static-choice,.static-product{border:1px solid #d8ded6;border-radius:14px;padding:8px;background:white;color:#214d3a;text-decoration:none;overflow:hidden}.static-choice img{width:100%;height:125px;object-fit:cover;border-radius:9px}.static-choice strong{display:block;padding:8px;font-size:15px}.static-products{display:flex;flex-wrap:wrap;justify-content:center;gap:14px}.static-product{flex:1 1 230px;max-width:400px}.static-product img{width:100%;height:190px;object-fit:contain}.static-buy{display:block;background:#ffd814;color:#0f1111;padding:12px;border-radius:24px;text-decoration:none}.static-back{display:block;text-align:left;margin:4px 0 12px}.static-choice:focus-visible,.static-buy:focus-visible{outline:3px solid #007185;outline-offset:3px}@media(max-width:699px){.static-finder{padding:12px;margin:8px}.static-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}.static-choice img{height:95px}.static-finder h1{font-size:25px}}</style>`;
let results=0;
for(const variant of ['a','b']){
 const base=variant==='a'?'/':'/product-finder/',prefix=variant==='a'?'/finder-steps/':'/product-finder/steps/';
 const url=a=>Object.keys(a).length?prefix+key(a)+'/':base;
 const source=fs.readFileSync(path.join(root,base,'index.html'),'utf8').replace(/<style>\.static-finder[\s\S]*?<\/style>/g,'');
 const pattern=variant==='a'?/<div id="finder"[^>]*>[\s\S]*?<\/div>\s*<\/main>/:/<div id="finder-b"[^>]*>[\s\S]*?<\/div><\/main>/;
 if(!pattern.test(source))throw Error('Missing host '+variant);
 for(const {a,r,parent} of states){
  let content=parent?`<a class="static-back" href="${url(parent)}">‹ Back</a>`:'';
  if(r.step==='result'){
   results++;const copy=core.resultCopy(a,r);
   content+=`<h1>${esc(copy.headline)}</h1><p>${esc(copy.benefit)}</p><p class="affiliate-disclosure">We earn a commission from purchases through this page. As an Amazon Associate I earn from qualifying purchases.</p>${shopping.summary(a,r).replace('<span data-shopping-count></span>',`${1+r.extras.length} items on your shopping list.`)}<div class="static-products">`;
   for(const id of [r.product,...(r.extras||[])]){const p=data.products[id];content+=`<article class="static-product" data-product="${id}"><img class="${p.image.includes('m.media-amazon.com')?'amazon-photo':'product-photo'}" src="${esc(p.image)}" alt="${esc(p.name)}" width="300" height="190"><h2>${esc(p.name)}</h2><p>${esc(core.supplyReason(id,a,r,data.products))}</p>${shopping.benefits(id,data)}<p><strong>${esc(p.packLabel||p.kind)}</strong><br>Buy ${core.purchaseQuantity(id,a,r)} ${core.purchaseQuantity(id,a,r)===1?'package':'packages'}</p>${core.supplyDetails(id,a,r)?`<details><summary>Growing notes</summary><p>${esc(core.supplyDetails(id,a,r))}</p></details>`:''}${id===r.product?shopping.proof(a,r):''}<a class="static-buy" href="${esc(p.url)}" rel="sponsored nofollow noopener" target="_blank">Check price on Amazon</a></article>`;}
   const alt=core.alternative(a,r);
   content+=`</div>${shopping.plan(a,r,data)}${(r.optional||[]).length?`<details><summary>Optional extras for later</summary>${r.optional.map(id=>{const p=data.products[id];return `<article><h3>${esc(p.name)}</h3><p>${esc(p.packLabel)}</p><p>${esc(core.supplyReason(id,a,r,data.products))}</p><a href="${esc(p.url)}" rel="sponsored nofollow noopener" target="_blank">Check price on Amazon</a></article>`;}).join('')}</details>`:''}${alt?shopping.comparison(a,r).replace(/<button[^>]*data-alternative>/,`<a class="compare-setup" href="${url(alt.answers)}">`).replace('</button>','</a>'):''}<p>Items are sold separately. Check current prices and pack sizes on Amazon.</p>${r.note?`<p>${esc(r.note)}</p>`:''}<p><a href="${base}">Start over</a></p>`;

  }else{
   const field={grow:'grow',micro:'micro',space:'spot',room:'room',setup:'setup'}[r.step];
   content+=`${r.step==='grow'?'<p>A little space. A fresh start.</p><h1>Find your small-space garden setup</h1><p>Choose what you want to grow. We’ll match seeds, kits and supplies to your space.</p>':''}<h${r.step==='grow'?'2':'1'}>${{grow:'What do you want to grow?',micro:'Which microgreens?',space:'Where will it grow?',room:'How much room can you give it?',setup:a.grow==='microgreens'?'How much seed would you like?':'Starter kit or build your own?'}[r.step]}</h${r.step==='grow'?'2':'1'}><div class="static-grid">`;
   for(const value of core.choices(field,a)){const next={...a,[field]:value};let label=labels[value],img=images[value],helper='';if(field==='room'){const opt=core.roomOptions(a).find(x=>x[0]===value);label=opt[1];helper=opt[2];img=data.products[opt[3]].image;}if(field==='setup'&&a.grow==='microgreens'){label=value==='kit'?'Starter kit':'Kit + bulk seed';helper=value==='kit'?'Seed and coir for two starter plantings.':'The same kit plus a bulk bag of your chosen seed for repeat sowings.';}if(field==='micro'&&value==='radish'){label='Radish microgreens';img='/assets/photos/radish-microgreens-apapac.jpg';}if(field==='setup'&&value==='kit')img=data.products[a.grow==='microgreens'?'microkit':'basil-kit'].image;if(a.grow==='tomato'&&field==='spot')label='Sunny balcony · 6–8 hours of direct sun';content+=`<a class="static-choice" href="${url(next)}" data-static-field="${field}" data-static-value="${value}"><img class="${img.includes('m.media-amazon.com')?'amazon-photo':'choice-photo'}" src="${esc(img)}" alt="" width="260" height="125"><strong>${esc(label)}</strong>${helper?`<p>${esc(helper)}</p>`:''}${field==='spot'?`<p>${esc(core.spaceHint(value,a))}</p>`:''}</a>`;}
   content+='</div>';
  }
  const host=`<div id="${variant==='a'?'finder':'finder-b'}" ${variant==='a'?'class="finder"':''} data-initial-answers="${esc(JSON.stringify(a))}"><section class="static-finder">${content}</section></div></main>`;
  let html=source.replace(pattern,()=>host).replace('</head>',style+'</head>');
  if(r.step==='result')html=html.replace(/<p class="finder-disclosure">[\s\S]*?<\/p>/,'');
  if(parent)html=html.replace('</head>','<meta name="robots" content="noindex,follow"></head>');
  const out=path.join(root,url(a),'index.html');fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,html);
 }
}
if(results<60)throw Error('Missing expected current and legacy results, got '+results);
console.log(`Static finder: ${states.length} states per variant; ${results} result pages generated.`);
