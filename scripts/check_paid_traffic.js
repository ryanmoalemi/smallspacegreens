const assert=require('node:assert/strict'),fs=require('fs'),vm=require('vm');
const core=require('../src/finder-core'),data=require('../src/finder.json'),matcher=require('../src/review-matcher'),evidence=require('../data/reviews/evidence.json').records;
const cases=[];
function walk(a){const r=core.route(a);if(r.step==='result'){cases.push({a,r});return;}const f={grow:'grow',micro:'micro',space:'spot',setup:'setup'}[r.step];for(const v of core.choices(f,a))walk({...a,[f]:v});}walk({});
for(const {a,r} of cases){
 const proof=matcher.proof(a,r,evidence);
 if(proof){assert.ok(proof.proofApproved);assert.ok(proof.crops.includes(a.grow==='unsure'?(r.product==='lettuce'?'lettuce':'microgreens'):a.grow));assert.ok(proof.spaces.includes(a.spot));}
 if(['lettuce','salad'].includes(r.product))assert.ok(!proof?.excerpt.toLowerCase().includes('radish'));
 assert.ok(proof,'Missing relevant quote for '+JSON.stringify(a));
 if(r.product==='micro-pea')assert.ok(proof.microTypes.includes('pea'));
 if(r.product==='basil-kit')assert.deepEqual(proof.proofProducts,['basil-kit']);
 if(proof.proofProducts)assert.ok(proof.proofProducts.includes(r.product));
 if(a.spot==='dim'&&r.product!=='basil-kit')assert.ok(r.extras.includes('light'));
 assert.ok(!(proof.excludeProducts||[]).includes(r.product));
 for(const id of [r.product,...r.extras,...(r.optional||[])]){assert.ok(data.products[id].packLabel,id);assert.equal(core.purchaseQuantity(id,a,r),id==='soil'&&r.product==='tomato'?2:1);}
 if(r.extras.includes('pot'))assert.ok(!core.supplyReason('pot',a,r,data.products).includes('three'));
 if(r.extras.includes('coir'))assert.equal(data.products.coir.asin,'B093CKN811');
 if(r.extras.includes('light'))assert.equal(data.products.light.asin,'B0D7CMRZT8');
 for(const variant of ['a','b']){
  const prefix=variant==='a'?'finder-steps/':'product-finder/steps/';
  const key=['grow','micro','spot','setup'].filter(k=>a[k]).map(k=>k+'-'+a[k]).join('--');
  const html=fs.readFileSync(prefix+key+'/index.html','utf8');
  assert.ok(!/href="(?:https:\/\/smallspacegreens.com)?\/guides\//.test(html),'Guide exit in '+prefix+key);
  assert.ok(html.includes('finder-shopping.js'));
 }
}
for(const path of ['index.html','product-finder/index.html'])assert.ok(!/href="(?:https:\/\/smallspacegreens.com)?\/guides\//.test(fs.readFileSync(path,'utf8')));
for(const file of ['src/finder.js','src/finder-b.js']){
 const s=fs.readFileSync(file,'utf8');assert.ok(s.includes('const duration=reduced?200:3200;'));
 for(const event of ['finder_start','finder_variant_entry','finder_reveal_start','finder_reveal_complete','finder_result_view','finder_amazon_click'])assert.ok(s.includes(event),file+' '+event);
 assert.ok(s.includes("has('qa')"));
}
// Exercise the owned-supply event with a DOM stub, including persistence and undo.
const values={},window={SSGFinder:core},ctx={window,sessionStorage:{getItem:k=>values[k],setItem:(k,v)=>values[k]=v}};
vm.runInNewContext(fs.readFileSync('src/finder-shopping.js','utf8'),ctx);
const cards=['tomato','bag','soil'].map(id=>({dataset:{shoppingProduct:id},classList:{toggle(){}},buy:{},qty:{},input:{},querySelector(s){return s==='[data-amazon]'?this.buy:s==='.order-quantity'?this.qty:this.input;}}));
const label={},handlers={},host={addEventListener:(event,fn)=>handlers[event]=fn,querySelectorAll:s=>s==='[data-shopping-product]'?cards:[label]},route=core.route({grow:'tomato',spot:'balcony'}),events=[];
window.SSGShopping.bind(host,()=>route,(...e)=>events.push(e));
const input={dataset:{owned:'soil'},checked:true};handlers.change({target:{closest:()=>input}});
assert.equal(cards[2].buy.hidden,true);assert.equal(label.textContent,'2 items on your shopping list.');assert.equal(values['ssg-owned-supplies'],'["soil"]');
input.checked=false;handlers.change({target:{closest:()=>input}});assert.equal(cards[2].buy.hidden,false);assert.equal(label.textContent,'3 items on your shopping list.');assert.equal(events.length,2);
console.log('Paid traffic fixes: 28 routes, both static variants, quote relevance, quantities, affiliate products, unchanged reveal timing and owned-supply persistence passed.');
