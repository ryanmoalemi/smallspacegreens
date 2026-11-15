const assert=require('node:assert/strict'),fs=require('fs');
const matcher=require('../src/review-matcher.js');
const records=JSON.parse(fs.readFileSync('data/reviews/evidence.json')).records;
const r={product:'tomato',extras:['bag','soil']};
assert.equal(matcher.match({grow:'tomato',spot:'balcony'},r,records).length,4);
assert.equal(matcher.match({grow:'tomato',spot:'sunny'},r,records).length,0);
assert.equal(matcher.match({grow:'basil',spot:'sunny'},r,records).every(x=>x.crops.includes('basil')),true);
const fake={...records[0],platform:'amazon',productIds:['unrelated']};
assert.equal(matcher.match({grow:'tomato',spot:'balcony'},r,[fake]).length,0);
assert.equal(matcher.match({grow:'tomato',spot:'balcony'},r,[{...fake,productIds:['bag']}]).length,1);
assert.equal(matcher.match({grow:'tomato',spot:'balcony'},r,[{...records[0],status:'removed'}]).length,0);
assert.ok(records.every(x=>x.platform!=='amazon'));
console.log('Review matching: crop, space, exact product, empty coverage and removal checks passed.');

assert.deepEqual(matcher.sequence({grow:'tomato',spot:'balcony'},r,records),[]);
