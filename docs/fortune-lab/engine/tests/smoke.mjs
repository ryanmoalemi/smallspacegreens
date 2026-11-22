import assert from 'node:assert/strict';
import { generateProfile, getNumerologyProfile } from '../dist/chart-engine.js';

let checks=0;
function check(name,fn){fn();checks++;console.log('PASS '+name);}
const base={date:'1990-06-15',time:'14:30',gender:'female'};
check('Pinned reference chart retains all 12 palaces and Ju Men Life Palace',()=>{
  const p=generateProfile(base);
  assert.equal(p.mode,'ziwei');assert.equal(p.starKey,'jumen');assert.equal(p.lifePalace.branch,11);
  assert.equal(p.chart.palaces.length,12);
  assert.equal(p.chart.palaces.flatMap(p=>p.stars.filter(s=>s.type==='major')).length,14);
});
check('No birth time produces numerology only, not a fabricated natal chart',()=>{
  const p=generateProfile({date:base.date,unknownTime:true});
  assert.equal(p.mode,'numerology');assert.equal(p.chart,null);assert.equal(p.lifePalace,null);assert.equal(p.lifePath,4);
  assert.equal(p.calculation.sum,31);
});
check('Invalid dates, times, gender and branch indices are rejected',()=>{
  for(const date of ['1990-02-29','2000-02-30','2000-04-31','2026-13-01','0001-01-01','abc']) assert.throws(()=>generateProfile({...base,date}),RangeError);
  for(const time of ['24:00','12:60','9:30','-1:00']) assert.throws(()=>generateProfile({...base,time}),RangeError);
  assert.throws(()=>generateProfile({...base,gender:'other'}),RangeError);
  for(const hourBranch of [-1,12,2.5]) assert.throws(()=>generateProfile({date:base.date,hourBranch,gender:'male'}),RangeError);
});
check('Valid leap day is accepted',()=>{
  const p=generateProfile({...base,date:'2000-02-29'});assert.equal(p.chart.palaces.length,12);
});
check('23:00 rolls to next chart day while 00:00 remains on entered date',()=>{
  const late=generateProfile({...base,time:'23:30'});
  const early=generateProfile({...base,date:'1990-06-16',time:'00:30'});
  assert.equal(late.calculation.chartDate,'1990-06-16');assert.equal(late.calculation.rolledToNextDay,true);
  assert.equal(early.calculation.rolledToNextDay,false);
  assert.deepEqual(late.chart.palaces,early.chart.palaces);
});
check('Two-hour boundary changes branch at 01:00',()=>{
  const before=generateProfile({...base,time:'00:59'}),after=generateProfile({...base,time:'01:00'});
  assert.equal(before.calculation.hourBranch,0);assert.equal(after.calculation.hourBranch,1);
  assert.notEqual(before.lifePalace.branch,after.lifePalace.branch);
});
check('Every branch and both traditional gender settings return complete charts',()=>{
  for(const gender of ['male','female']) for(let hourBranch=0;hourBranch<12;hourBranch++) {
    const p=generateProfile({date:'1982-05-12',hourBranch,gender});
    assert.equal(p.chart.palaces.length,12);assert.ok(p.starKey);assert.equal(p.lifePalace.majorStars.length===0,p.lifePalace.isEmpty);
  }
});
check('Empty Life Palace uses explicitly identified opposite-palace stars',()=>{
  let match;
  for(let hourBranch=0;hourBranch<12;hourBranch++){
    const p=generateProfile({date:'1982-05-12',hourBranch,gender:'male'});
    if(p.lifePalace.isEmpty){match=p;break;}
  }
  assert.ok(match);assert.equal(match.lifePalace.majorStars.length,0);assert.ok(match.lifePalace.borrowedStars.length>0);
  assert.match(match.calculation.primaryStarSource,/Opposite palace/);
});
check('Numerology preserves master numbers using documented sum-all-digits method',()=>{
  const p=getNumerologyProfile('1990-01-09',2026);assert.equal(p.lifePath,11);
  assert.deepEqual(p.calculation.reduction,[29,11]);
});
console.log(`${checks} meaningful checks passed.`);
