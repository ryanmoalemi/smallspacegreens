/**
 * Expected-value planning model; percentage inputs are numbers from 0 to 100.
 * Fees and per-order costs remain payable on modeled refunded report orders.
 * Affiliate reversals, fixed costs and tax are excluded from this model.
 */
export function calculateEconomics(v){
  const completed=v.visitors*v.completion/100;
  const orders=v.price>0?completed*v.purchase/100:0;
  const gross=orders*v.price;
  const fees=orders*(v.price*.029+.30);
  const refunds=gross*v.refund/100;
  const cost=orders*v.otherCost;
  const report=gross-fees-refunds-cost;
  const affiliate=completed*v.click/100*v.merchant/100*v.basket*v.commission/100;
  const contribution=report+affiliate;
  const adSpend=v.visitors*v.costVisitor;
  return{completed,orders,gross,fees,refunds,cost,report,affiliate,contribution,
    breakeven:v.visitors?contribution/v.visitors:0,
    adSpend,afterAds:contribution-adSpend};
}

function init(){
  const form=document.getElementById('calculator');
  if(!form)return;
  const $=id=>document.getElementById(id);
  const money=n=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:2}).format(n);
  const n=(id,max=100)=>{const value=Number($(id).value);return Number.isFinite(value)?Math.max(0,Math.min(max,value)):0;};
  function update(){
    const x=calculateEconomics({
      visitors:n('visitors',1e7),completion:n('completion'),purchase:n('purchase'),
      price:n('report-price',1000),click:n('click-rate'),merchant:n('merchant-cvr'),
      basket:n('basket',1e5),commission:n('commission'),costVisitor:n('cost-visitor',1000),
      refund:n('refund'),otherCost:n('other-cost',1000)
    });
    $('report-output').textContent=money(x.report);
    $('affiliate-output').textContent=money(x.affiliate);
    $('breakeven-output').textContent=x.breakeven<0?'Not possible':money(x.breakeven);
    $('profit-output').textContent=money(x.afterAds);
    $('profit-output').style.color=x.afterAds<0?'#f1a1ac':'var(--accent)';
    $('calc-description').textContent=`This models ${x.completed.toLocaleString('en-US',{maximumFractionDigits:1})} completed quizzes and ${x.orders.toLocaleString('en-US',{maximumFractionDigits:1})} report purchases. Gross report sales: ${money(x.gross)}. Ad spend: ${money(x.adSpend)}.${x.contribution<0?' At these inputs, costs exceed revenue even with free traffic.':''}`;
    window.FortuneEconomics.last=x;
  }
  window.FortuneEconomics={calculateEconomics};
  form.addEventListener('input',update);
  form.addEventListener('submit',e=>e.preventDefault());
  $('scenario').addEventListener('change',()=>{$('report-price').value=$('scenario').value;update();});
  $('reset-calculator').onclick=()=>{form.reset();update();};
  update();
}

if(typeof document!=='undefined')init();
