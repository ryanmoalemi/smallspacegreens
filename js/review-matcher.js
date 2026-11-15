(function(root){
 'use strict';
 function match(answers,route,records){
  const crop=answers.grow==='unsure'?(route.product==='micro-broccoli'?'microgreens':'lettuce'):answers.grow;
  const ids=[route.product,...(route.extras||[])];
  return records.filter(r=>r.status==='reviewed'&&r.crops.includes(crop)&&r.spaces.includes(answers.spot)&&(r.platform!=='amazon'||r.productIds.some(id=>ids.includes(id))));
 }
 function finalLine(a){const crop={tomato:'tomato',lettuce:'lettuce',salad:'salad',basil:'basil',herbs:'herb',radish:'radish',microgreens:'microgreen',unsure:'little garden'}[a.grow]||'garden';const space={balcony:'balcony',sunny:'windowsill',dim:'indoor'}[a.spot]||'small-space';return `Picking your ${space} ${crop} setup…`;}
 function sequence(answers,route,records){
  const matches=match(answers,route,records);
  const reddit=matches.find(r=>r.platform==='reddit'&&r.angle!=='lessons');
  const amazon=matches.find(r=>r.platform==='amazon');
  const angle=matches.find(r=>r.angle==='lessons');
  // Do not substitute extra Reddit questions for missing Amazon evidence.
  return reddit&&amazon&&angle?[reddit,amazon,angle]:[];
 }
 const api={match,finalLine,sequence};root.SSGReviewMatcher=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
