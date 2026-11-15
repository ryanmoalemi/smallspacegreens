'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const b=require('../src/finder-b-core.js'),a=require('../src/finder-core.js'),data=require('../src/finder.json');
let leaves=[];
const available=(field,x)=>({light:()=>b.lights,space:()=>b.places(x),grow:()=>b.candidates(x),micro:()=>b.micros(x),setup:()=>b.setups(x)})[field]();
function visit(x,steps=[]){
 const r=b.route(x);
 if(r.step==='result'){
  const shared=a.route(b.mapped(x));assert.equal(shared.step,'result');assert.equal(r.product,shared.product);assert.deepEqual(r.extras,shared.extras);
  for(const id of [r.product,...r.extras]){assert.equal(data.products[id].status,'reviewed');assert.ok(data.products[id].image);assert.ok(data.products[id].url.endsWith('tag=smallspaceg04-20'));}
  if(r.product==='tomato')assert.ok(x.light==='lots'&&x.space==='balcony');
  if(x.space==='sill')assert.ok(!r.extras.includes('tray')&&!r.extras.includes('bag')&&r.product!=='basil-kit');
  if(x.light!=='lots'&&x.space!=='balcony'&&r.product!=='basil-kit')assert.ok(r.extras.includes('light'));
  leaves.push({answers:x,product:r.product,extras:r.extras,path:steps,asins:[r.product,...r.extras].map(id=>data.products[id].asin)});return;
 }
 const field={light:'light',space:'space',food:'grow',micro:'micro',setup:'setup'}[r.step];assert.ok(field,'Unexpected state '+r.step);
 const options=available(field,x);assert.ok(options.length,'Dead end '+JSON.stringify(x));
 for(const value of options)visit(b.choose(x,field,value),[...steps,{field,value,offered:options}]);
}
visit({});assert.equal(leaves.length,51);
assert.deepEqual(b.choose({light:'lots',space:'balcony',grow:'tomato'},'light','low'),{light:'low'});
assert.deepEqual(b.choose({light:'lots',space:'balcony',grow:'tomato'},'space','indoor'),{light:'lots',space:'indoor'});
assert.ok(!b.candidates({light:'some',space:'balcony'}).includes('tomato'));
assert.ok(!b.places({light:'low'}).includes('balcony'));
assert.ok(!b.candidates({light:'low',space:'sill'}).includes('unsure'));
assert.deepEqual(b.setups({light:'low',space:'sill',grow:'basil'}),['basics']);
let recovery=0;
for(const light of [undefined,'invalid',...b.lights])for(const space of [undefined,'invalid',...b.spaces])for(const grow of [undefined,'invalid',...a.crops])for(const micro of [undefined,'invalid',...a.micros])for(const setup of [undefined,'invalid','kit','basics']){
 const x={light,space,grow,micro,setup},r=b.route(x);recovery++;
 if(r.step==='result')assert.equal(data.products[r.product].status,'reviewed');
 else{const field={light:'light',space:'space',food:'grow',micro:'micro',setup:'setup'}[r.step];assert.ok(field);assert.ok(available(field,x).length);}
}
const script=fs.readFileSync(path.join(__dirname,'../src/finder-b.js'),'utf8');assert.ok(!script.includes('setTimeout'));assert.ok(!script.includes('setInterval'));assert.ok(script.includes('variant:\'B\''));
if(process.argv.includes('--export'))fs.writeFileSync('/workspace/shared/ssg-b-journeys.json',JSON.stringify(leaves));
console.log(`Version B: ${leaves.length} complete shopping paths, shared-product parity, dependent-answer resets and ${recovery} recovery cases passed.`);
