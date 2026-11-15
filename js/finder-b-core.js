/* Version B changes question order, never the shared merchandise catalog. */
(function(root){
 'use strict';
 const base=typeof module==='object'&&module.exports?require('./finder-core.js'):root.SSGFinder;
 const lights=['lots','some','low'],spaces=['indoor','balcony','sill'];
 function normalize(input={}){
  const a={};
  if(lights.includes(input.light))a.light=input.light;
  if(spaces.includes(input.space))a.space=input.space;
  Object.assign(a,base.normalize(input));
  return a;
 }
 function places(input){const a=normalize(input);return !a.light?[]:a.light==='low'?['indoor','sill']:spaces.slice();}
 function mapped(input){
  const a=normalize(input);
  return {...base.normalize(a),spot:a.space==='balcony'?'balcony':a.light==='lots'?'sunny':'dim'};
 }
 function candidates(input){
  const a=normalize(input);
  if(!a.light||!places(a).includes(a.space))return [];
  return base.choices('grow').filter(grow=>{
   if(grow==='tomato'&&!(a.light==='lots'&&a.space==='balcony'))return false;
   if(a.space==='sill'&&['tomato','microgreens','herbs'].includes(grow))return false;
   if(a.space==='sill'&&a.light!=='lots'&&grow==='unsure')return false;
   // On a partially sunny balcony, keep the crop set to the leaf/root setup.
   if(a.space==='balcony'&&a.light==='some'&&['basil','herbs'].includes(grow))return false;
   const prefix={...mapped(a),grow};
   for(const micro of grow==='microgreens'?base.micros:[undefined])for(const setup of ['kit','basics']){
    if(a.space==='sill'&&setup==='kit')continue;
    if(base.route({...prefix,micro,setup}).step==='result')return true;
   }
   return false;
  });
 }
 function micros(input){return candidates(input).includes('microgreens')?base.choices('micro',mapped(input)):[];}
 function setups(input){
  const a=normalize(input);
  return base.choices('setup',mapped(a)).filter(x=>!(a.space==='sill'&&x==='kit'));
 }
 function route(input){
  const a=normalize(input);
  if(!a.light)return {step:'light'};
  if(!places(a).includes(a.space))return {step:'space'};
  if(!candidates(a).includes(a.grow))return {step:'food'};
  if(a.grow==='microgreens'&&!micros(a).includes(a.micro))return {step:'micro'};
  const r=base.route(mapped(a));
  if(r.step==='setup'||!['result'].includes(r.step)||a.space==='sill'&&a.setup==='kit')return {step:'setup'};
  return {...r,step:'result',answers:mapped(a)};
 }
 function choose(input,field,value){
  const a=normalize(input);
  const allowed=field==='light'?lights:field==='space'?places(a):field==='grow'?candidates(a):field==='micro'?micros(a):field==='setup'?setups(a):[];
  if(!allowed.includes(value))return a;
  if(a[field]===value)return a;
  if(field==='light')return {light:value};
  if(field==='space')return {light:a.light,space:value};
  if(field==='grow')return {light:a.light,space:a.space,grow:value};
  if(field==='micro'){delete a.setup;a.micro=value;return a;}
  a.setup=value;return a;
 }
 function questionSteps(input){
  const a=normalize(input),list=['light','space','food'];
  if(a.grow==='microgreens')list.push('micro');
  if(a.grow&&a.space&&base.route({...mapped(a),setup:undefined}).step==='setup')list.push('setup');
  return list;
 }
 const api={normalize,places,mapped,candidates,micros,setups,route,choose,questionSteps,lights,spaces};
 if(typeof module==='object'&&module.exports)module.exports=api;else root.SSGFinderB=api;
})(typeof window==='object'?window:globalThis);
