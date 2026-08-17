(()=>{
  const style=document.createElement('style');
  style.textContent='.cancelReasonBox{margin:9px 0 2px;background:#fff0f0;border:1px solid #f2caca;border-radius:12px;padding:10px;font-size:12px;line-height:1.45;color:#8d1f1f}.cancelReasonBox b{display:block;margin-bottom:3px}.cancelWho{font-size:10px;color:#777;margin-top:4px}';
  document.head.appendChild(style);

  function decorate(){
    if(tab!=='orders')return;
    const cards=[...document.querySelectorAll('#content .order')];
    cards.forEach((card,i)=>{
      const o=D.orders?.[i];
      if(!o||o.status!=='cancelled'||!o.cancellation_reason||card.querySelector('.cancelReasonBox'))return;
      const box=document.createElement('div');
      box.className='cancelReasonBox';
      const who=o.cancelled_by==='customer'?'Mijoz tomonidan':o.cancelled_by==='admin'?'Admin tomonidan':'Bekor qilingan';
      box.innerHTML=`<b>❌ Bekor qilish sababi</b>${esc(o.cancellation_reason)}<div class="cancelWho">${who}${o.cancelled_at?' · '+new Date(o.cancelled_at).toLocaleString():''}</div>`;
      const items=card.querySelector('.order-items');
      if(items)items.insertAdjacentElement('beforebegin',box);else card.appendChild(box);
    });
  }

  const baseRenderOrders=renderOrders;
  renderOrders=function(){baseRenderOrders();decorate()};
  const obs=new MutationObserver(decorate);
  const root=document.querySelector('#content');if(root)obs.observe(root,{childList:true,subtree:true});
  decorate();
})();