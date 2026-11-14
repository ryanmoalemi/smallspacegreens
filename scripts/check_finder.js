'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const core=require('../src/finder-core.js');
const data=require('../src/finder.json');
const route=core.route;
assert.equal(route({}).step,'grow');
assert.equal(route({grow:'invalid',spot:'dim',setup:'kit'}).step,'grow');
assert.equal(route({grow:'microgreens'}).step,'micro');
assert.equal(route({grow:'basil',spot:'dim'}).step,'setup');
assert.equal(route({grow:'lettuce',spot:'sunny',setup:'kit'}).product,'lettuce');
assert.equal(route({grow:'basil',spot:'dim',kit:'1'}).product,'basil-kit');
assert.deepEqual(route({grow:'basil',spot:'dim',setup:'kit'}).extras,[]);
for(const crop of ['lettuce','herbs']) assert.equal(route({grow:crop,spot:'dim',setup:'kit'}).step,'unavailable');
for(const crop of ['tomato','salad','radish']) assert.equal(route({grow:crop,spot:'dim',setup:'basics'}).step,'switch');
for(const micro of core.micros) assert.equal(route({grow:'microgreens',micro,spot:'balcony'}).step,'switch');
for(const micro of ['radish','broccoli']) {
 assert.deepEqual(route({grow:'microgreens',micro,spot:'dim',setup:'kit'}).extras,['light']);
 assert.equal(route({grow:'microgreens',micro,spot:'sunny',setup:'kit'}).product,'microkit');
}
assert.equal(route({grow:'microgreens',micro:'pea',spot:'sunny'}).product,'micro-pea');
assert.equal(route({grow:'unsure',spot:'dim',setup:'basics'}).product,'micro-broccoli');
assert.equal(route({grow:'unsure',spot:'sunny'}).product,'lettuce');
let total=0,products=0,unsupported=0;
for(const grow of core.crops) for(const micro of grow==='microgreens'?core.micros:[undefined]) for(const spot of core.spots) for(const setup of ['kit','basics']) {
 const a={grow,micro,spot,setup}, r=route(a);total++;
 assert.ok(['result','switch','unavailable'].includes(r.step),JSON.stringify(a));
 if(r.step==='result'){
  products++;
  assert.ok(data.products[r.product],JSON.stringify(a));
  assert.ok(r.extras.every(x=>data.products[x]));
  assert.ok(!r.extras.includes(r.product));
  assert.ok(new Set(r.extras).size===r.extras.length);
  if(spot==='dim'&&r.product!=='basil-kit')assert.ok(r.extras.includes('light'),JSON.stringify(a));
  if(r.product.startsWith('micro-'))for(const x of ['tray','drip','coir'])assert.ok(r.extras.includes(x));
  assert.ok(data.guides[r.guide]);
 }else unsupported++;
}
for(const [id,p] of Object.entries(data.products)){
 const u=new URL(p.url);assert.equal(u.hostname,'www.amazon.com');assert.equal(u.pathname,'/dp/'+p.asin);assert.equal(u.searchParams.get('tag'),'smallspaceg04-20');
 assert.ok(!('price' in p)&&!('rating' in p)&&!('reviewCount' in p));
 if(p.status!=='unverified')assert.ok(p.image,id+' needs its own real photo');
}
const js=fs.readFileSync(root+'/src/finder.js','utf8');
for(const m of js.matchAll(/['"](\/assets\/[^'"]+)['"]/g))assert.ok(fs.existsSync(root+m[1]),'Missing image '+m[1]);
assert.ok(!js.includes('setTimeout'));
assert.ok(js.includes('sponsored nofollow noopener'));
assert.ok(fs.readFileSync(root+'/src/finder.css','utf8').includes('prefers-reduced-motion:reduce'));
console.log(`Finder: ${total} complete combinations checked (${products} product routes, ${unsupported} explicit switch/unavailable routes); affiliate, image, light and tray checks passed.`);
if(process.argv.includes('--release')){
 const unresolved=Object.entries(data.products).filter(([,p])=>p.status==='unverified'||!p.imageUseApproved||!p.availabilityVerified).map(([id])=>id);
 assert.equal(unresolved.length,0,'Release checks incomplete: '+unresolved.join(', '));
 assert.equal(data.releaseReady,true,'Release has not been approved');
}
