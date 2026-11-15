'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs');
const a=require('../src/finder-core.js'),b=require('../src/finder-b-core.js'),data=require('../src/finder.json');
const fields={grow:'grow',micro:'micro',space:'spot',setup:'setup'},leaves=[];
function visit(x,path=[]){
 const ar=a.route(x),br=b.route(x);assert.deepEqual({...br,answers:undefined},{...ar,answers:undefined});
 if(ar.step==='result'){leaves.push({answers:x,product:ar.product,extras:ar.extras,path,asins:[ar.product,...ar.extras].map(id=>data.products[id].asin)});return;}
 const field=fields[ar.step],offered=a.choices(field,x);assert.deepEqual(b.choices(field,x),offered);assert.ok(offered.length);
 for(const value of offered)visit(b.choose(x,field,value),[...path,{field,value,offered}]);
}
visit({});assert.equal(leaves.length,28);
let invalid=0;
for(const grow of [undefined,'invalid',...a.crops])for(const micro of [undefined,'invalid',...a.micros])for(const spot of [undefined,'invalid',...a.spots])for(const setup of [undefined,'invalid','kit','basics']){const x={grow,micro,spot,setup};assert.deepEqual(b.normalize(x),a.normalize(x));assert.deepEqual({...b.route(x),answers:undefined},{...a.route(x),answers:undefined});invalid++;}
assert.deepEqual(b.choose({grow:'microgreens',micro:'radish',spot:'dim',setup:'kit'},'grow','tomato'),{grow:'tomato'});
assert.deepEqual(b.choose({grow:'basil',spot:'dim',setup:'kit'},'spot','sunny'),{grow:'basil',spot:'sunny'});
if(process.argv.includes('--export'))fs.writeFileSync('/workspace/shared/ssg-b-journeys.json',JSON.stringify(leaves));
console.log(`A/B parity: ${leaves.length} identical shopping paths and ${invalid} recovery states passed.`);
