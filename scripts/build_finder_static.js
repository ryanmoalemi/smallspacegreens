/* Build every supported no-JS journey from the same routing engine as the quiz. */
const fs=require('fs'),path=require('path'),core=require('../src/finder-core');
const root=path.resolve(__dirname,'..'),data=require('../src/finder.json');
const esc=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const labels={tomato:'Cherry tomatoes',lettuce:'Lettuce',salad:'Salad mix',basil:'Basil',herbs:'Herbs',radish:'Radishes',microgreens:'Microgreens',unsure:'Not sure',sunny:'Sunny window',dim:'Dim spot',balcony:'Balcony',broccoli:'Broccoli',pea:'Pea shoots',kit:'All-in-one kit',basics:'Just the basics'};
const images={tomato:'/assets/finder/cherry-tomatoes.webp',lettuce:'/assets/products/supply-lettuce-leaves-600.webp',salad:'/assets/finder/salad-mix.webp',basil:'/assets/finder/basil.webp',herbs:'/assets/finder/herbs.webp',radish:'/assets/finder/radishes.webp',microgreens:'/assets/photos/trays-broccoli-radish.jpg',unsure:'/assets/finder/not-sure.webp',sunny:'/assets/photos/basil-window-personal-creations.jpg',dim:'/assets/photos/pea-shoots-counter.jpg',balcony:'/assets/photos/balcony-garden-ruth-hartnup.jpg',broccoli:'/assets/photos/broccoli-microgreens-anotherdaysjourney.jpg',pea:'/assets/photos/pea-shoots-basket-susan-slater.jpg',kit:data.products.microkit.image,basics:'/assets/photos/seedling-trays-nested-kvdp.jpg'};
const states=[];function walk(a,parent){const r=core.route(a);states.push({a,r,parent});if(r.step==='result')return;const field={grow:'grow',micro:'micro',space:'spot',setup:'setup'}[r.step];if(!field)throw Error('Unsupported static route '+r.step);for(const value of core.choices(field,a))walk({...a,[field]:value},a);}walk({},null);
function key(a){return ['grow','micro','spot','setup'].filter(k=>a[k]).map(k=>k+'-'+a[k]).join('--')||'start';}
const style=`<style>.static-finder{max-width:960px;margin:12px auto;padding:20px;background:#fffdf8;border-radius:22px;color:#214d3a;text-align:center}.static-finder h1{font-size:30px;line-height:1.15;margin:8px}.static-finder p{font-size:15px;line-height:1.4}.static-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}.static-choice,.static-product{border:1px solid #d8ded6;border-radius:14px;padding:8px;background:white;color:#214d3a;text-decoration:none;overflow:hidden}.static-choice img{width:100%;height:125px;object-fit:cover;border-radius:9px}.static-choice strong{display:block;padding:8px;font-size:15px}.static-products{display:flex;flex-wrap:wrap;justify-content:center;gap:14px}.static-product{flex:1 1 230px;max-width:400px}.static-product img{width:100%;height:190px;object-fit:contain}.static-buy{display:block;background:#ffd814;color:#0f1111;padding:12px;border-radius:24px;text-decoration:none}.static-back{display:block;text-align:left;margin:4px 0 12px}.static-choice:focus-visible,.static-buy:focus-visible{outline:3px solid #007185;outline-offset:3px}@media(max-width:699px){.static-finder{padding:12px;margin:8px}.static-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}.static-choice img{height:95px}.static-finder h1{font-size:25px}}</style>`;
let results=0;
for(const variant of ['a','b']){
 const base=variant==='a'?'/':'/product-finder/',prefix=variant==='a'?'/finder-steps/':'/product-finder/steps/';
 const url=a=>Object.keys(a).length?prefix+key(a)+'/':base;
 const source=fs.readFileSync(path.join(root,base,'index.html'),'utf8');
 const pattern=variant==='a'?/<div id="finder"[^>]*>[\s\S]*?<\/div>\s*<\/main>/:/<div id="finder-b"[^>]*>[\s\S]*?<\/div><\/main>/;
 if(!pattern.test(source))throw Error('Missing host '+variant);
 for(const {a,r,parent} of states){
  let content=parent?`<a class="static-back" href="${url(parent)}">‹ Back</a>`:'';
  if(r.step==='result'){
   results++;const copy=core.resultCopy(a,r);
   content+=`<h1>${esc(copy.headline)}</h1><p>${esc(copy.benefit)}</p><p class="affiliate-disclosure">We earn a commission from purchases through this page. As an Amazon Associate I earn from qualifying purchases.</p><div class="static-products">`;
   for(const id of [r.product,...(r.extras||[])]){const p=data.products[id];content+=`<article class="static-product" data-product="${id}"><img class="${p.image.includes('m.media-amazon.com')?'amazon-photo':'product-photo'}" src="${esc(p.image)}" alt="${esc(p.name)}" width="300" height="190"><h2>${esc(p.name)}</h2><a class="static-buy" href="${esc(p.url)}" rel="sponsored nofollow noopener" target="_blank">Buy on Amazon</a></article>`;}
   content+=`</div>${r.note?`<p>${esc(r.note)}</p>`:''}<p><a href="${base}">Start over</a></p>`;
  }else{
   const field={grow:'grow',micro:'micro',space:'spot',setup:'setup'}[r.step];
   content+=`${r.step==='grow'?'<p>A little space. A fresh start.</p><h1>Find your small-space garden setup</h1><p>Choose what you want to grow. We’ll match seeds, kits and supplies to your space.</p>':''}<h${r.step==='grow'?'2':'1'}>${{grow:'What do you want to grow?',micro:'Which microgreens?',space:'Where will it grow?',setup:'All-in-one kit or just the basics?'}[r.step]}</h${r.step==='grow'?'2':'1'}><div class="static-grid">`;
   for(const value of core.choices(field,a)){const next={...a,[field]:value};let label=labels[value],img=images[value];if(field==='micro'&&value==='radish'){label='Radish microgreens';img='/assets/photos/radish-microgreens-apapac.jpg';}if(field==='setup'&&value==='kit')img=data.products[a.grow==='microgreens'?'microkit':'basil-kit'].image;if(a.grow==='tomato'&&field==='spot')label='Sunny balcony · 6–8 hours of direct sun';content+=`<a class="static-choice" href="${url(next)}" data-static-field="${field}" data-static-value="${value}"><img class="${img.includes('m.media-amazon.com')?'amazon-photo':'choice-photo'}" src="${esc(img)}" alt="" width="260" height="125"><strong>${esc(label)}</strong></a>`;}
   content+='</div>';
  }
  const host=`<div id="${variant==='a'?'finder':'finder-b'}" ${variant==='a'?'class="finder"':''} data-initial-answers="${esc(JSON.stringify(a))}"><section class="static-finder">${content}</section></div></main>`;
  let html=source.replace(pattern,()=>host).replace('</head>',style+'</head>');
  if(r.step==='result')html=html.replace(/<p class="finder-disclosure">[\s\S]*?<\/p>/,'');
  if(parent)html=html.replace('</head>','<meta name="robots" content="noindex,follow"></head>');
  const out=path.join(root,url(a),'index.html');fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,html);
 }
}
if(results!==56)throw Error('Expected 28 results per variant, got '+results);
console.log(`Static finder: ${states.length} states per variant; ${results} result pages generated.`);
