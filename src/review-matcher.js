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
  const item=route.product==='basil-kit'?'starter kits':route.product==='microkit'?'starter kits':crop==='microgreens'?'seeds and trays':'seeds and planters';
  const productCrop=crop==='microgreens'&&answers.micro?({radish:'radish microgreens',broccoli:'broccoli microgreens',pea:'pea shoot'}[answers.micro]||'microgreens'):{tomato:'tomato',herbs:'herb',radish:'radish',salad:'salad greens',microgreens:'microgreens',basil:'basil',lettuce:'lettuce'}[crop]||name;
  const lessons={
   tomato:'Using growers’ advice to choose pots and supports for your tomatoes.',
   lettuce:'Using growers’ advice to choose a setup for repeat lettuce harvests.',
   salad:'Using growers’ advice to choose a setup for fresh salad leaves.',
   basil:'Using growers’ advice to choose a setup for healthy, leafy basil.',
   herbs:'Using growers’ advice to give your herbs room to grow.',
   radish:'Using growers’ advice to choose containers deep enough for your radishes.',
   microgreens:answers.micro==='pea'?'Using growers’ advice to choose trays for your pea shoots.':answers.micro==='radish'?'Using growers’ advice to choose trays for your radish microgreens.':'Using growers’ advice to choose trays for your broccoli microgreens.'
  };
  return [{...reddit,label:'REDDIT GROWER EXPERIENCES',question:`Reviewing Reddit comments to help choose your ${({tomato:"tomato",herbs:"herb",radish:"radish",microgreens:"microgreen"}[crop]||name)} setup`},
   {platform:'catalog',label:'OUR AMAZON PICKS',question:`Our picks for the best ${place} ${productCrop} ${item} on Amazon.`,url:null},
   {...angle,label:'TIPS FROM REAL GROWERS',question:lessons[crop]||'Using growers’ advice to choose a setup for your space.'}];
 }
 const api={match,finalLine,sequence};root.SSGReviewMatcher=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
