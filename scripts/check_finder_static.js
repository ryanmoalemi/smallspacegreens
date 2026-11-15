const assert=require('node:assert/strict'),fs=require('fs'),path=require('path'),core=require('../src/finder-core'),data=require('../src/finder.json');
let states=0,results=0;
const key=a=>['grow','micro','spot','setup'].filter(k=>a[k]).map(k=>k+'-'+a[k]).join('--');
for(const variant of ['a','b']){
 const base=variant==='a'?'/':'/product-finder/',prefix=variant==='a'?'/finder-steps/':'/product-finder/steps/';
 function walk(a){const url=Object.keys(a).length?prefix+key(a)+'/':base,file=path.join(__dirname,'..',url,'index.html'),s=fs.readFileSync(file,'utf8'),r=core.route(a);states++;
 assert.ok(s.includes('data-initial-answers='));assert.ok(s.includes('class="static-finder"'));assert.ok(!s.includes('Turn on JavaScript'));
 const initial=JSON.parse(s.match(/data-initial-answers="([^"]*)"/)[1].replaceAll('&quot;','"'));assert.deepEqual(initial,a);
 if(r.step==='result'){results++;const ids=[...s.matchAll(/data-product="([^"]+)"/g)].map(x=>x[1]);assert.deepEqual(ids,[r.product,...r.extras]);for(const id of ids)assert.ok(s.includes(data.products[id].url.replaceAll('&','&amp;')));return;}
 const field={grow:'grow',micro:'micro',space:'spot',setup:'setup'}[r.step],expected=core.choices(field,a);assert.equal([...s.matchAll(/data-static-value=/g)].length,expected.length);
 for(const v of expected){const next={...a,[field]:v};assert.ok(s.includes(`href="${prefix+key(next)}/"`));walk(next);}
 }walk({});
}
assert.equal(results,56);assert.equal(states,98);console.log('Static HTML: all 98 states, 56 results, allowed choices, preserved answers and affiliate products verified.');
