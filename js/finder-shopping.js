(function(root){
 'use strict';
 const e=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function meta(id,a,r,data){
  const p=data.products[id],qty=root.SSGFinder.purchaseQuantity(id,a,r);
  return `<div class="purchase-details"><p class="pack-size">${e(p.packLabel||p.kind)}</p><p class="order-quantity">Buy ${qty} ${qty===1?'package':'packages'}</p></div>`;
 }
 function notes(id,a,r){const details=root.SSGFinder.supplyDetails(id,a,r);return details?`<details class="growing-note"><summary>Growing notes</summary><p>${e(details)}</p></details>`:'';}
 function summary(a,r){return `<div class="shopping-summary"><div><strong>Your starter list</strong><span data-shopping-count></span></div><p>${e(root.SSGFinder.starterScope(a,r))}</p></div>`;}
 function benefits(id,data){return `<ul class="product-benefits">${(data.products[id].benefits||[]).map(b=>`<li>${e(b)}</li>`).join('')}</ul>`;}
 function proof(a,r){
  const ev=root.SSGReviewMatcher.proof(a,r,root.SSG_REVIEW_EVIDENCE.records);
  return ev?`<aside class="recommendation-proof"><span class="proof-label">${ev.proofProducts?'About this garden':'From the growing community'}</span><blockquote>“${e(ev.excerpt)}”</blockquote><p>${e(ev.proofContext||'A grower’s experience with this crop and growing method.')} <a href="${e(ev.url)}" target="_blank" rel="nofollow noopener">Reddit source</a></p></aside>`:'';
 }
 function plan(a,r,data){
  const key=r.product==='micro-pea'?'pea':r.product==='microkit'||r.product.startsWith('micro-')?'micro':r.product;
  const p=data.growingPlans[key],fit=data.fitProfiles[r.fit];
  return `<section class="starter-plan" aria-label="Your growing plan"><div class="plan-facts"><div><span>Space to allow</span><strong>${e(fit.summary)}</strong>${r.extras.includes('light')?'<small>Plus a standing light and nearby outlet</small>':''}</div><div><span>What to expect</span><strong>${e(p.harvest)}</strong><small>${e(p.scale)}</small></div></div><details class="plan-details"><summary>Fit, daily care &amp; your first 3 steps</summary><p><strong>Measure first:</strong> ${e(fit.detail)}${r.extras.includes('light')?' The lamp panel is 13.6 × 7.7 in with an adjustable stand; check its base dimensions before ordering.':''}</p><p><strong>Timing:</strong> ${e(p.timingNote)}</p><p><strong>Care:</strong> ${e(p.care)}</p><ol>${p.start.map(s=>`<li>${e(s)}</li>`).join('')}</ol></details></section>`;
 }
 function comparison(a,r){
  const alt=root.SSGFinder.alternative(a,r);if(!alt)return '';
  const other=root.SSGFinder.route(alt.answers);if(other.step!=='result')return '';
  return `<aside class="setup-comparison"><h3>One useful alternative</h3><p>${e(alt.intro)}</p><p class="comparison-count"><span data-current-count>${1+r.extras.length} items</span> in this list · <span data-alternative-count>${1+other.extras.length} items</span> in the alternative</p><button type="button" class="compare-setup" data-alternative>${e(alt.label)}</button></aside>`;
 }
 function optional(a,r,data){
  const ids=r.optional||[];if(!ids.length)return '';
  return `<section class="optional-products" aria-label="Optional extras for later"><h2>Optional extras for later</h2><div>${ids.map(id=>{const p=data.products[id];return `<article class="optional-product" data-shopping-product="${e(id)}"><img src="${e(p.image)}" alt="${e(p.name)}" width="180" height="180" loading="lazy"><div><h3>${e(p.name)}</h3><p>${e(root.SSGFinder.supplyReason(id,a,r,data.products))}</p>${meta(id,a,r,data)}<a class="optional-buy" href="${e(p.url)}" target="_blank" rel="sponsored nofollow noopener" data-amazon="${e(p.asin)}">Check price on Amazon</a>${notes(id,a,r)}</div></article>`;}).join('')}</div></section>`;
 }
 function update(host,r,a){
  const count=1+(r.extras||[]).length;
  for(const label of host.querySelectorAll('[data-shopping-count]'))label.textContent=`${count} ${count===1?'item':'items'}`;
  for(const label of host.querySelectorAll('[data-current-count]'))label.textContent=`${count} ${count===1?'item':'items'}`;
  const alt=a&&root.SSGFinder.alternative(a,r),other=alt&&root.SSGFinder.route(alt.answers);
  if(other?.step==='result'){const n=1+other.extras.length;for(const label of host.querySelectorAll('[data-alternative-count]'))label.textContent=`${n} ${n===1?'item':'items'}`;}
 }
 root.SSGShopping={meta,summary,optional,update,benefits,proof,plan,comparison,notes};
})(window);
