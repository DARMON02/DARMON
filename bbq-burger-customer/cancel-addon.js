(()=>{
  const CANCEL_API='https://tgcmevhuxwzcmeseysax.supabase.co/functions/v1/bbq-customer-cancel';
  const reasonLabels={changed:'Fikrim o‘zgardi',wrong:'Noto‘g‘ri buyurtma',address:'Manzil xato',other:'Boshqa'};

  async function cancelCall(orderId,reason){
    const r=await fetch(CANCEL_API,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({initData,orderId,reason})});
    return r.json();
  }

  const originalLoadOrders=loadOrders;
  loadOrders=async function(){
    const r=await call('my_orders');
    if(!r.ok){$('#orders').innerHTML='<div class="profileCard">Xatolik: '+esc(r.error)+'</div>';return}
    D.orders=r.orders||[];D.orderStats=r.stats||D.orderStats;
    $('#orders').innerHTML=D.orders.map(o=>{
      const items=o.order_items||[],count=items.reduce((s,x)=>s+Number(x.quantity||0),0),preview=items.slice(0,3).map(x=>`${esc(x.product_name)} × ${x.quantity}`).join(' · ')+(items.length>3?' · …':'');
      const canCancel=o.status==='new'||o.status==='accepted';
      return `<div class="order"><div class="orderTop"><div><div class="orderNum">Buyurtma #${o.order_number}</div><div class="muted">${new Date(o.created_at).toLocaleString()}</div></div><span class="pill">${statusNames[o.status]||o.status}</span></div><div class="orderItemsPreview">${preview||'Mahsulotlar topilmadi'}</div><div class="orderBottom"><div><b>${money(o.total_uzs)}</b><br><span class="muted">${count} ta · ${esc(o.address_text||'Lokatsiya')}</span></div><button class="reorderBtn" onclick="reorderOrder('${o.id}')">🔁 Qayta buyurtma</button></div>${canCancel?`<button class="customerCancelBtn" onclick="openCustomerCancel('${o.id}',${o.order_number})">❌ Buyurtmani bekor qilish</button>`:''}</div>`
    }).join('')||'<div class="profileCard">Hozircha buyurtmalar yo‘q.</div>';
  };

  window.openCustomerCancel=function(id,num){
    $('#sheetContent').innerHTML=`<div class="cancelHead"><div class="cancelIcon">⚠️</div><h2>Buyurtma #${num}ni bekor qilish</h2><p>Bekor qilish sababini tanlang.</p></div><label>Sabab</label><select id="cancelReason" onchange="toggleCancelOther()"><option value="changed">Fikrim o‘zgardi</option><option value="wrong">Noto‘g‘ri buyurtma</option><option value="address">Manzil xato</option><option value="other">Boshqa</option></select><div id="cancelOtherWrap" class="hide"><label>Sababni yozing</label><textarea id="cancelOther" maxlength="180" placeholder="Qisqacha sabab"></textarea></div><div class="cancelWarning">Tayyorlash boshlanganidan keyin buyurtmani ilovadan bekor qilib bo‘lmaydi.</div><button class="customerCancelConfirm" id="cancelConfirm" onclick="submitCustomerCancel('${id}')">Ha, buyurtmani bekor qilish</button><button class="secondary" onclick="closeSheet()">Orqaga</button>`;
    $('#sheet').style.display='flex';
  };

  window.toggleCancelOther=function(){
    const isOther=$('#cancelReason')?.value==='other';
    $('#cancelOtherWrap')?.classList.toggle('hide',!isOther);
  };

  window.submitCustomerCancel=async function(id){
    const code=$('#cancelReason')?.value||'changed';
    const reason=code==='other'?String($('#cancelOther')?.value||'').trim():reasonLabels[code];
    if(reason.length<2){alert('Bekor qilish sababini yozing.');return}
    const btn=$('#cancelConfirm');btn.disabled=true;btn.textContent='Bekor qilinmoqda...';
    try{
      const r=await cancelCall(id,reason);
      if(!r.ok){
        const msg=String(r.error||'');
        if(msg.includes('customer_cancel_not_allowed'))throw new Error('Buyurtma tayyorlash bosqichiga o‘tgan. Endi ilovadan bekor qilib bo‘lmaydi.');
        if(msg.includes('order_not_found'))throw new Error('Buyurtma topilmadi.');
        throw new Error(msg||'Bekor qilishda xato');
      }
      closeSheet();D.orderStats=null;tg?.HapticFeedback?.notificationOccurred('success');
      await loadOrders();
      if(tg?.showAlert)tg.showAlert(`Buyurtma #${r.order.order_number} bekor qilindi.`);else alert(`Buyurtma #${r.order.order_number} bekor qilindi.`);
    }catch(e){alert(e?.message||e);btn.disabled=false;btn.textContent='Ha, buyurtmani bekor qilish'}
  };
})();