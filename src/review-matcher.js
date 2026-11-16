(function(root){
 'use strict';
 function match(answers,route,records){
  const crop=answers.grow==='unsure'?(route.product==='basil-kit'?'basil':route.product==='microkit'||route.product==='micro-broccoli'?'microgreens':'lettuce'):answers.grow;
  const ids=[route.product,...(route.extras||[])];
  return records.filter(r=>r.status==='reviewed'&&r.crops.includes(crop)&&r.spaces.includes(answers.spot)&&(r.platform!=='amazon'||r.productIds.some(id=>ids.includes(id))));
 }
 function finalLine(a){const crop={tomato:'tomato',lettuce:'lettuce',salad:'salad',basil:'basil',herbs:'herb',radish:'radish',microgreens:'microgreen',unsure:'little garden'}[a.grow]||'garden';const space={balcony:'balcony',sunny:'windowsill',dim:'indoor'}[a.spot]||'small-space';return `Picking your ${space} ${crop} setup…`;}
 function sequence(answers,route,records){
  if(!route.product)return [];
  const crop=answers.grow==='unsure'?(route.product==='basil-kit'?'basil':route.product==='microkit'||route.product==='micro-broccoli'?'microgreens':'lettuce'):answers.grow;
  const names={tomato:'tomatoes',lettuce:'lettuce',salad:'salad greens',basil:'basil',herbs:'herbs',radish:'radishes',microgreens:'microgreens'};
  const name=names[crop]||'your crop';
  const candidates=records.filter(r=>r.status==='reviewed'&&r.platform==='reddit'&&r.crops.includes(crop));
  const matches=match(answers,route,candidates);
  const reddit=matches.find(r=>r.angle!=='lessons')||candidates.find(r=>r.angle!=='lessons')||candidates[0];
  const angle=matches.find(r=>r.angle==='lessons')||candidates.find(r=>r.angle==='lessons')||candidates.find(r=>r.id!==reddit?.id)||reddit;
  if(!reddit||!angle)return [];
  const place=answers.spot==='balcony'?'balcony':answers.spot==='dim'?'indoor':'windowsill';
  const item=route.product==='basil-kit'?'starter kits':route.product==='microkit'?'starter kits':crop==='microgreens'?'seeds and trays':'seeds and planters';
  const productCrop=crop==='microgreens'&&answers.micro?({radish:'radish microgreens',broccoli:'broccoli microgreens',pea:'pea shoot'}[answers.micro]||'microgreens'):{tomato:'tomato',herbs:'herb',radish:'radish',salad:'salad greens',microgreens:'microgreens',basil:'basil',lettuce:'lettuce'}[crop]||name;

  return [{...reddit,label:'REDDIT GROWER EXPERIENCES',question:`Reviewing Reddit for the best advice on your ${place} ${productCrop} setup`},
   {platform:'catalog',label:'OUR AMAZON PICKS',question:`Comparing ${place} ${productCrop} ${item} on Amazon.`,url:null},
   {...angle,label:'TIPS FROM REAL GROWERS',question:'Using real growers’ advice to pick the right setup for your space.'}];
 }
 function proof(a,r,records){
  const micro=a.micro||(r.product?.startsWith('micro-')?r.product.slice(6):r.product==='microkit'?'broccoli':undefined);
  const item=match(a,r,records).find(x=>x.proofApproved===true&&x.platform==='reddit'&&x.excerpt&&/^https:\/\/(www\.)?reddit\.com\//.test(x.url)&&(!x.microTypes||x.microTypes.includes(micro))&&!(x.excludeProducts||[]).includes(r.product)&&(!x.proofProducts||x.proofProducts.includes(r.product)));
  return item?{...item,excerpt:item.proofExcerpt||item.excerpt}:null;
 }
 const api={match,finalLine,sequence,proof};root.SSGReviewMatcher=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
