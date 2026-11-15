(function(root){
 'use strict';
 function match(answers,route,records){
  const crop=answers.grow==='unsure'?(route.product==='micro-broccoli'?'microgreens':'lettuce'):answers.grow;
  const ids=[route.product,...(route.extras||[])];
  return records.filter(r=>r.status==='reviewed'&&r.crops.includes(crop)&&r.spaces.includes(answers.spot)&&(r.platform!=='amazon'||r.productIds.some(id=>ids.includes(id))));
 }
 function finalLine(a){const crop={tomato:'tomato',lettuce:'lettuce',salad:'salad',basil:'basil',herbs:'herb',radish:'radish',microgreens:'microgreen',unsure:'little garden'}[a.grow]||'garden';const space={balcony:'balcony',sunny:'windowsill',dim:'indoor'}[a.spot]||'small-space';return `Picking your ${space} ${crop} setup…`;}
 function sequence(answers,route,records){
  if(!route.product)return [];
  const crop=answers.grow==='unsure'?(route.product==='micro-broccoli'?'microgreens':'lettuce'):answers.grow;
  const names={tomato:'tomatoes',lettuce:'lettuce',salad:'salad greens',basil:'basil',herbs:'herbs',radish:'radishes',microgreens:'microgreens'};
  const name=names[crop]||'your crop';
  const candidates=records.filter(r=>r.status==='reviewed'&&r.platform==='reddit'&&r.crops.includes(crop));
  const matches=match(answers,route,candidates);
  const reddit=matches.find(r=>r.angle!=='lessons')||candidates.find(r=>r.angle!=='lessons');
  const angle=matches.find(r=>r.angle==='lessons')||candidates.find(r=>r.angle==='lessons')||candidates.find(r=>r.id!==reddit?.id);
  if(!reddit||!angle)return [];
  const place=answers.spot==='balcony'?'balcony':answers.spot==='dim'?'indoor':'windowsill';
  const item=route.product==='basil-kit'?'a compact herb garden':route.product==='microkit'?'a starter kit':crop==='microgreens'?'seeds and trays':'seeds and planters';
  return [{...reddit,label:'REDDIT',question:matches.includes(reddit)?reddit.question:`What are Reddit growers saying about growing ${name}?`},
   {platform:'catalog',label:'YOUR AMAZON SHORTLIST',question:`Matching Amazon-listed ${item} to your ${place} ${name}`,url:null},
   {...angle,label:'THE LITTLE THINGS THAT MATTER',question:angle.question}];
 }
 const api={match,finalLine,sequence};root.SSGReviewMatcher=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
