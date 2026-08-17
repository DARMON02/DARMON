(()=>{
  function settingsMap(){
    const m={};
    try{(D.settings||[]).forEach(x=>m[x.key]=x.value)}catch{}
    return m;
  }

  function mount(){
    const fee=document.querySelector('#fee');
    if(!fee||document.querySelector('#freeThreshold'))return;
    const card=fee.closest('.card');
    if(!card)return;
    const m=settingsMap();
    const box=document.createElement('div');
    box.className='card';
    box.style.marginTop='10px';
    box.innerHTML=`<label>🎁 Bepul yetkazib berish chegarasi</label>
      <input id="freeThreshold" type="number" min="0" step="1000" value="${Number(m.free_delivery_threshold_uzs||0)}" placeholder="Masalan: 100000">
      <div class="muted" style="margin:-4px 0 10px;line-height:1.4">0 = o‘chiq. Masalan 100000 kiritsangiz, 100 000 so‘mdan boshlab yetkazib berish bepul bo‘ladi.</div>
      <button class="primary" id="saveFreeThreshold">Saqlash</button>`;
    card.insertAdjacentElement('afterend',box);
    document.querySelector('#saveFreeThreshold').onclick=saveFreeThreshold;
  }

  async function saveFreeThreshold(){
    const input=document.querySelector('#freeThreshold');
    const btn=document.querySelector('#saveFreeThreshold');
    const value=Math.max(0,Number(input?.value||0));
    if(!Number.isFinite(value)){alert('To‘g‘ri summa kiriting');return}
    btn.disabled=true;btn.textContent='Saqlanmoqda...';
    try{
      const r=await call('setting',{key:'free_delivery_threshold_uzs',value});
      if(!r.ok)throw new Error(r.error||'save_failed');
      await loadCatalog();
      tg?.HapticFeedback?.notificationOccurred('success');
      alert(value>0?`Bepul yetkazish ${value.toLocaleString('ru-RU')} so‘mdan boshlandi`:'Bepul yetkazish chegarasi o‘chirildi');
    }catch(e){alert(e?.message||e)}
    finally{btn.disabled=false;btn.textContent='Saqlash'}
  }

  const obs=new MutationObserver(mount);
  obs.observe(document.documentElement,{childList:true,subtree:true});
  mount();
})();