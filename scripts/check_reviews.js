const assert=require('node:assert/strict'),fs=require('fs');
const matcher=require('../src/review-matcher.js');
const records=JSON.parse(fs.readFileSync('data/reviews/evidence.json')).records;
const r={product:'tomato',extras:['bag','soil']};
assert.ok(matcher.match({grow:'tomato',spot:'balcony'},r,records).length>=4);
assert.equal(matcher.match({grow:'tomato',spot:'sunny'},r,records).length,0);
assert.equal(matcher.match({grow:'basil',spot:'sunny'},r,records).every(x=>x.crops.includes('basil')),true);
const fake={...records.find(x=>x.crops.includes('tomato')&&x.spaces.includes('balcony')),platform:'amazon',productIds:['unrelated']};
assert.equal(matcher.match({grow:'tomato',spot:'balcony'},r,[fake]).length,0);
assert.equal(matcher.match({grow:'tomato',spot:'balcony'},r,[{...fake,productIds:['bag']}]).length,1);
assert.equal(matcher.match({grow:'tomato',spot:'balcony'},r,[{...records[0],status:'removed'}]).length,0);
assert.ok(records.every(x=>x.platform!=='amazon'));
console.log('Review matching: crop, space, exact product, empty coverage and removal checks passed.');

const steps=matcher.sequence({grow:'tomato',spot:'balcony'},r,records);
assert.equal(steps.length,3);
assert.equal(steps[1].platform,'catalog');
assert.equal(steps[1].url,null);
assert.ok(steps.every(x=>x.platform!=='amazon'));
assert.deepEqual(matcher.sequence({}, {}, records),[]);
const core=require('../src/finder-core.js');
let journeys=0;
function walk(answers){
 const route=core.route(answers);
 if(route.step==='result'){
  const sequence=matcher.sequence(answers,route,records);
  assert.equal(sequence.length,3,JSON.stringify(answers));
  assert.equal(sequence[1].platform,'catalog');
  assert.ok(sequence.filter(x=>x.url).every(x=>x.platform==='reddit'));
  journeys++;return;
 }
 const field={grow:'grow',micro:'micro',space:'spot',setup:'setup'}[route.step];
 for(const value of core.choices(field,answers))walk({...answers,[field]:value});
}
walk({});assert.equal(journeys,28);
console.log('Personalized reveal: all 28 paths have sourced discussion steps and a catalog matching step.');
