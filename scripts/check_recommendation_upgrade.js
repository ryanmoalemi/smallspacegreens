'use strict';
const assert=require('node:assert/strict'),fs=require('fs'),vm=require('vm');
const core=require('../src/finder-core'),adapter=require('../src/finder-b-core'),data=require('../src/finder.json'),matcher=require('../src/review-matcher'),evidence=require('../data/reviews/evidence.json');
const leaves=[];
function walk(a){const r=core.route(a);if(r.step==='result'){leaves.push({a,r});return;}const field={grow:'grow',micro:'micro',space:'spot',room:'room',setup:'setup'}[r.step];for(const value of core.choices(field,a))walk({...a,[field]:value});}walk({});
assert.equal(leaves.length,30);
for(const [spot,room,product,extraCount] of [['sunny','compact','microkit',0],['sunny','roomy','lettuce',2],['dim','compact','basil-kit',0],['dim','roomy','microkit',1]]){
 const r=core.route({grow:'unsure',spot,room});assert.equal(r.product,product);assert.equal(r.extras.length,extraCount);
 assert.deepEqual(adapter.choose({grow:'unsure',spot,room},'spot',spot==='dim'?'sunny':'dim'),{grow:'unsure',spot:spot==='dim'?'sunny':'dim'});
}
assert.equal(core.route({grow:'unsure',spot:'dim',room:'invalid'}).step,'room');
assert.equal(core.route({grow:'unsure',spot:'dim',setup:'basics'}).step,'room');
assert.equal(data.products.bag.asin,'B002JUOWB2');assert.equal(data.products['soil-small'].asin,'B002Y04TK6');
let scenarios=0;
for(const {a,r} of leaves){
 const alt=core.alternative(a,r);
 if(alt){const other=core.route(alt.answers);assert.equal(other.step,'result');assert.notDeepEqual([other.product,...other.extras],[r.product,...r.extras]);const key=['grow','micro','spot','room','setup'].filter(k=>alt.answers[k]).map(k=>k+'-'+alt.answers[k]).join('--');for(const prefix of ['finder-steps','product-finder/steps'])assert.ok(fs.existsSync(`${prefix}/${key}/index.html`),'Missing no-JS alternative '+key);}
 for(const id of [r.product,...r.extras]){
  const p=data.products[id];assert.equal(p.status,'reviewed');assert.ok(p.benefits.length>=2&&p.benefits.length<=3);assert.ok(!/select.*pack/i.test(p.packLabel));assert.ok(!/B07MYNVP8G|B07NKSKMCN/.test(p.url));
 }
 assert.ok(!r.extras.includes('coir'),'Kit already includes starter coir');
 const planKey=r.product==='micro-pea'?'pea':r.product==='microkit'||r.product.startsWith('micro-')?'micro':r.product;
 assert.equal(data.growingPlans[planKey].start.length,3);assert.ok(data.growingPlans[planKey].sources.length);assert.ok(data.fitProfiles[r.fit].source);
 // Exercise every route with no supplies, one supply, all supplies, and unrelated supplies owned.
 for(const owned of [[],r.extras.slice(0,1),r.extras,['unrelated']]){
  const w={SSGFinder:core,SSGReviewMatcher:matcher,SSG_REVIEW_EVIDENCE:evidence},storage={'ssg-owned-supplies':JSON.stringify(owned)};
  vm.runInNewContext(fs.readFileSync('src/finder-shopping.js','utf8'),{window:w,sessionStorage:{getItem:k=>storage[k],setItem:(k,v)=>storage[k]=v}});
  const cards=[r.product,...r.extras].map(id=>({dataset:{shoppingProduct:id},classList:{toggle(){}},buy:{},qty:{},input:{},querySelector(s){return s==='[data-amazon]'?this.buy:s==='.order-quantity'?this.qty:this.input;}}));
  const count={},current={},alternative={},host={querySelectorAll:s=>s==='[data-shopping-product]'?cards:s==='[data-shopping-count]'?[count]:s==='[data-current-count]'?[current]:s==='[data-alternative-count]'?[alternative]:[]};
  w.SSGShopping.update(host,r,a);const needed=1+r.extras.filter(id=>!owned.includes(id)).length;
  assert.equal(count.textContent,`${needed} ${needed===1?'item':'items'} on your shopping list.`);assert.equal(cards[0].buy.hidden,false);
  for(const c of cards.slice(1))assert.equal(c.buy.hidden,owned.includes(c.dataset.shoppingProduct));
  if(alt){const other=core.route(alt.answers),n=1+other.extras.filter(id=>!owned.includes(id)).length;assert.equal(alternative.textContent,`${n} ${n===1?'item':'items'}`);}
  assert.ok(w.SSGShopping.proof(a,r).includes('Reddit source'));
  assert.ok(!/href=".*\/guides\//.test(w.SSGShopping.plan(a,r,data)));
  scenarios++;
 }
}
for(const f of ['src/finder.js','src/finder-b.js']){
 const s=fs.readFileSync(f,'utf8');assert.ok(s.includes('shopping.proof(answers,r)'));assert.ok(s.includes('data-alternative'));assert.ok(s.includes('room'));assert.ok(s.includes('const duration=reduced?200:3200;'));assert.ok(!s.includes('Just the basics'));
}
console.log(`Recommendation upgrade: ${scenarios} shopping/ownership scenarios; 30 matched plans; valid alternatives; exact smaller packs; fit and timing evidence; no duplicate coir; unchanged reveal passed.`);
