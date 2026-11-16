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
// Invalid bookmarked combinations return to the relevant question, never a dead end.
assert.equal(route({grow:'tomato',spot:'sunny'}).step,'space');
assert.deepEqual(core.choices('spot',{grow:'tomato'}),['balcony']);
assert.deepEqual(route({grow:'tomato',spot:'balcony'}).extras,['bag','soil']);
assert.equal(route({grow:'tomato',spot:'balcony'}).product,'tomato');
assert.equal(route({grow:'tomato',spot:'dim'}).step,'space');
assert.equal(route({grow:'salad',spot:'dim'}).step,'space');
assert.equal(route({grow:'microgreens',micro:'pea',spot:'dim',setup:'kit'}).step,'result');
assert.ok(core.choices('grow').includes('tomato'));
assert.deepEqual(core.choices('spot',{grow:'radish'}),['sunny','balcony']);
assert.deepEqual(core.choices('spot',{grow:'microgreens',micro:'broccoli'}),['sunny','dim']);
assert.deepEqual(core.choices('setup',{grow:'lettuce',spot:'dim'}),['basics']);
assert.deepEqual(core.choices('setup',{grow:'microgreens',micro:'pea',spot:'dim'}),['basics']);
let total=0,products=0,unsupported=0;
function visit(a) {
 const r=route(a);
 assert.ok(!['switch','unavailable'].includes(r.step),JSON.stringify(a));
 if(r.step==='result'){
  total++;products++;
  assert.equal(data.products[r.product]?.status,'reviewed');
  assert.ok(r.extras.every(x=>data.products[x]?.status==='reviewed'));
  assert.ok(!r.extras.includes(r.product));
  assert.equal(new Set(r.extras).size,r.extras.length);
  if(a.spot==='dim'&&r.product!=='basil-kit')assert.ok(r.extras.includes('light'),JSON.stringify(a));
  if(r.product.startsWith('micro-'))for(const x of ['microkit'])assert.ok(r.extras.includes(x));
  assert.ok(data.guides[r.guide]);
  return;
 }
 const field={grow:'grow',micro:'micro',space:'spot',room:'room',setup:'setup'}[r.step];
 assert.ok(field,'Unexpected question '+r.step);
 const choices=core.choices(field,a);assert.ok(choices.length,'No shopping choices '+JSON.stringify(a));
 for(const value of choices)visit({...a,[field]:value});
}
visit({});
// Stale URLs for every formerly exposed combination must also avoid dead-end pages.
for(const grow of core.crops)for(const micro of grow==='microgreens'?core.micros:[undefined])for(const spot of core.spots)for(const setup of ['kit','basics'])assert.ok(!['switch','unavailable'].includes(route({grow,micro,spot,setup}).step));
// Exercise malformed and outdated URL combinations as well as exposed choices.
let recoveryCases=0;
for(const grow of [undefined,'invalid',...core.crops])for(const micro of [undefined,'invalid',...core.micros])for(const spot of [undefined,'invalid',...core.spots])for(const setup of [undefined,'invalid','kit','basics']){
 const a={grow,micro,spot,setup},r=route(a);recoveryCases++;
 if(r.step==='result'){
  assert.equal(data.products[r.product]?.status,'reviewed');
  assert.ok(r.extras.every(id=>data.products[id]?.status==='reviewed'));
 }else{
  const field={grow:'grow',micro:'micro',space:'spot',room:'room',setup:'setup'}[r.step];
  assert.ok(field,'Dead-end recovery state '+JSON.stringify(a));
  assert.ok(core.choices(field,a).length,'Recovery has no valid answer '+JSON.stringify(a));
 }
}
console.log(`Finder recovery: ${recoveryCases} incomplete, invalid and saved URL combinations checked.`);
for(const [id,p] of Object.entries(data.products)){
 const u=new URL(p.url);assert.equal(u.hostname,'www.amazon.com');assert.equal(u.pathname,'/dp/'+p.asin);assert.equal(u.searchParams.get('tag'),'smallspaceg04-20');
 assert.ok(!('price' in p)&&!('rating' in p)&&!('reviewCount' in p));
 if(p.status!=='unverified')assert.ok(p.image,id+' needs its own real photo');
}
const js=fs.readFileSync(root+'/src/finder.js','utf8');
for(const m of js.matchAll(/['"](\/assets\/[^'"]+)['"]/g))assert.ok(fs.existsSync(root+m[1]),'Missing image '+m[1]);
assert.ok(!js.includes('data-skip-reveal'), 'Reveal advances automatically without a skip button');
assert.ok(js.includes('reveal-progress'));
assert.ok(js.includes('advance(index+1)'));
assert.ok(js.includes('clearTimeout(revealTimer)'));
assert.ok(js.includes('sponsored nofollow noopener'));
assert.ok(fs.readFileSync(root+'/src/finder.css','utf8').includes('prefers-reduced-motion:reduce'));
console.log(`Finder: ${total} selectable shopping journeys checked (all end in reviewed products; no dead ends); affiliate, image, light and tray checks passed.`);
if(process.argv.includes('--release')){
 const active=new Set();
 for(const grow of core.crops) for(const micro of grow==='microgreens'?core.micros:[undefined]) for(const spot of core.spots) for(const setup of ['kit','basics']){
  const r=route({grow,micro,spot,setup});
  if(r.step==='result') for(const id of [r.product,...r.extras])active.add(id);
 }
 const credit=fs.readFileSync(root+'/photo-credits/index.html','utf8');
 for(const id of active){
  const p=data.products[id];
  assert.equal(p.status,'reviewed',id+' is not reviewed');
  assert.ok(p.identityEvidence?.reviewedAt,id+' has no identity evidence');
  assert.equal(p.identityEvidence.stockClaim,false,id+' must not claim stock');
  assert.equal(p.imageRole,'product',id+' must use the selected product photo');
  assert.ok(p.imageUseApproved,id+' photo lacks owner demo approval');
  assert.ok(p.image.startsWith('/assets/finder-products/') || ['m.media-amazon.com','ugc.production.linktr.ee','www.organic-heirloom-seed.com','alpaslife.com','cdn11.bigcommerce.com','cdn.shopify.com'].includes(new URL(p.image).hostname),id+' photo host is unexpected');
  assert.ok(data.demoPhotoApproval?.approvedAt,'Demo photo approval must be recorded');
  assert.equal(data.demoPhotoApproval.licenseVerified,false,'Do not imply independent license clearance');
 }
 assert.equal(data.products.cage.status,'unverified');
 assert.equal(data.releaseReady,true,'Release has not been approved');
 assert.ok(fs.readFileSync(root+'/src/pages/home.html','utf8').includes('As an Amazon Associate I earn from qualifying purchases.'));
 console.log('Release: '+active.size+' active products have identity evidence and owner-approved demo photos (license not independently verified). Tomatoes are limited to the full-sun balcony setup; no stock claims.');
}
// Conversion regressions: skipped choices, distinct reasons and valid alternatives.
for(const a of [{grow:'lettuce',spot:'dim'},{grow:'herbs',spot:'dim'},{grow:'unsure',spot:'dim',room:'roomy'},{grow:'microgreens',micro:'pea',spot:'dim'}]){assert.equal(core.route(a).step,'result');assert.ok(!core.questionSteps(a).includes('setup'));}
assert.notEqual(core.supplyReason('pot',{grow:'herbs'},{product:'herbs'},data.products),core.supplyReason('pot',{grow:'radish'},{product:'radish'},data.products));
for(const a of [{grow:'basil',spot:'dim',setup:'kit'},{grow:'microgreens',micro:'radish',spot:'sunny',setup:'kit'}]){const r=core.route(a),alt=core.alternative(a,r);assert.equal(core.route(alt.answers).step,'result');assert.notEqual(core.route(alt.answers).product,r.product);}
for(const file of ['src/finder.js','src/finder-b.js','scripts/build_finder_static.js'])assert.ok(!fs.readFileSync(file,'utf8').includes('Read the growing guide'));
