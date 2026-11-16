/* Presentation adapter: all eligibility and recommendations come from Version A. */
(function(root){
 'use strict';
 const base=typeof module==='object'&&module.exports?require('./finder-core.js'):root.SSGFinder;
 const questionSteps=base.questionSteps;
 function choose(input,field,value){const a=base.normalize(input);if(!base.choices(field,a).includes(value))return a;if(a[field]===value)return a;if(field==='grow')return {grow:value};if(field==='micro'){a.micro=value;delete a.setup;}else if(field==='spot'){a.spot=value;delete a.setup;delete a.room;}else a[field]=value;return a;}
 const api={normalize:base.normalize,mapped:base.normalize,route:input=>({...base.route(input),answers:base.normalize(input)}),choose,questionSteps,choices:base.choices};
 if(typeof module==='object'&&module.exports)module.exports=api;else root.SSGFinderB=api;
})(typeof window==='object'?window:globalThis);
