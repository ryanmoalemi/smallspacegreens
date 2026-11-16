(function(root){
 'use strict';
 const e=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const owned=new Set();
 try { for(const id of JSON.parse(sessionStorage.getItem('ssg-owned-supplies')||'[]'))owned.add(id); } catch (_) {}
 function meta(id,a,r,data){
  const p=data.products[id],qty=root.SSGFinder.purchaseQuantity(id,a,r),details=root.SSGFinder.supplyDetails(id,a,r);
  return `<div class="purchase-details"><p class="pack-size">${e(p.packLabel||p.kind)}</p><p class="order-quantity">Buy ${qty} ${qty===1?'package':'packages'}</p>${id!==r.product?`<label class="owned-supply"><input type="checkbox" data-owned="${e(id)}" ${owned.has(id)?'checked':''}> Already have this</label>`:''}${details?`<details class="growing-note"><summary>Growing notes</summary><p>${e(details)}</p></details>`:''}</div>`;
 }
 function summary(a,r){return `<p class="shopping-summary">${e(root.SSGFinder.starterScope(a,r))} <span data-shopping-count></span> Each item is sold separately.</p>`;}
 function optional(a,r,data){
  const ids=r.optional||[];if(!ids.length)return '';
  return `<details class="optional-products"><summary>Optional extras for later</summary><div>${ids.map(id=>{const p=data.products[id];return `<article class="optional-product" data-shopping-product="${e(id)}"><img src="${e(p.image)}" alt="${e(p.name)}" width="180" height="180" loading="lazy"><div><h3>${e(p.name)}</h3><p>${e(root.SSGFinder.supplyReason(id,a,r,data.products))}</p>${meta(id,a,r,data)}<a class="optional-buy" href="${e(p.url)}" target="_blank" rel="sponsored nofollow noopener" data-amazon="${e(p.asin)}">Check price on Amazon</a></div></article>`;}).join('')}</div></details>`;
 }
 function update(host,r){
  for(const card of host.querySelectorAll('[data-shopping-product]')){
   const id=card.dataset.shoppingProduct,has=owned.has(id)&&id!==r.product;
   card.classList.toggle('is-owned',has);
   const buy=card.querySelector('[data-amazon]');if(buy)buy.hidden=has;
   const qty=card.querySelector('.order-quantity');if(qty)qty.hidden=has;
   const input=card.querySelector('[data-owned]');if(input)input.checked=has;
  }
  const count=1+(r.extras||[]).filter(id=>!owned.has(id)).length;
  for(const label of host.querySelectorAll('[data-shopping-count]'))label.textContent=`${count} ${count===1?'item':'items'} on your shopping list.`;
 }
 function bind(host,getRoute,track){host.addEventListener('change',event=>{
  const input=event.target.closest('[data-owned]');if(!input)return;
  if(input.checked)owned.add(input.dataset.owned);else owned.delete(input.dataset.owned);
  try { sessionStorage.setItem('ssg-owned-supplies',JSON.stringify([...owned])); } catch (_) {}
  update(host,getRoute());track('finder_supply_owned',{product_id:input.dataset.owned,owned:input.checked});
 });}
 root.SSGShopping={meta,summary,optional,update,bind};
})(window);
