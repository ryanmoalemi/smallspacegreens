const assert=require('node:assert/strict'),fs=require('fs'),path=require('path'),core=require('../src/finder-core'),data=require('../src/finder.json');
let states=0,results=0;
const key=a=>['grow','micro','spot','room','setup'].filter(k=>a[k]).map(k=>k+'-'+a[k]).join('--');
for(const variant of ['a','b']){
 const base=variant==='a'?'/':'/product-finder/',prefix=variant==='a'?'/finder-steps/':'/product-finder/steps/';
 function walk(a){const url=Object.keys(a).length?prefix+key(a)+'/':base,file=path.join(__dirname,'..',url,'index.html'),s=fs.readFileSync(file,'utf8'),r=core.route(a);states++;
 assert.ok(s.includes('data-initial-answers='));assert.ok(s.includes('class="static-finder"'));assert.ok(!s.includes('Turn on JavaScript'));
 const initial=JSON.parse(s.match(/data-initial-answers="([^"]*)"/)[1].replaceAll('&quot;','"'));assert.deepEqual(initial,a);
 if(r.step==='result'){results++;const ids=[...s.matchAll(/data-product="([^"]+)"/g)].map(x=>x[1]);assert.deepEqual(ids,[r.product,...r.extras]);for(const id of ids)assert.ok(s.includes(data.products[id].url.replaceAll('&','&amp;')));return;}
 const field={grow:'grow',micro:'micro',space:'spot',room:'room',setup:'setup'}[r.step],expected=core.choices(field,a);assert.equal([...s.matchAll(/data-static-value=/g)].length,expected.length);
 for(const v of expected){const next={...a,[field]:v};assert.ok(s.includes(`href="${prefix+key(next)}/"`));walk(next);}
 }walk({});
}
assert.equal(results,60);
for(const folder of ['finder-steps','product-finder/steps']){for(const dir of fs.readdirSync(path.join(__dirname,'..',folder))){const html=fs.readFileSync(path.join(__dirname,'..',folder,dir,'index.html'),'utf8');assert.ok(!html.includes('Read the growing guide'));if(html.includes('data-product='))assert.ok(html.includes('Check current prices and pack sizes on Amazon'));}}
assert.equal(states,98);console.log(`Static HTML: all ${states} states, ${results} results, allowed choices, preserved answers and affiliate products verified.`);
