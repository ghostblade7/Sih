/* Living India auth trigger hotfix — route every login entry point to the real Supabase auth UI. */
(function(){
  function hideLegacyAuth(){
    document.querySelectorAll('[role="dialog"],.modal-overlay,.modal').forEach(el=>{
      if(el.id==='li-auth-root') return;
      const t=(el.textContent||'').trim();
      if(/Demo Sign In|Enter Living India|Sign in to save discoveries/i.test(t)){
        el.style.display='none';
        el.setAttribute('aria-hidden','true');
      }
    });
  }
  function openAuth(){
    hideLegacyAuth();
    if(typeof window.LivingIndiaAuthOpen==='function') window.LivingIndiaAuthOpen('signin');
    else setTimeout(()=>window.LivingIndiaAuthOpen?.('signin'),50);
  }
  document.addEventListener('click',function(e){
    const btn=e.target.closest('button');
    if(!btn) return;
    const text=(btn.textContent||'').replace(/\s+/g,' ').trim();
    const isAvatar=btn.classList.contains('avatar');
    const isLogin=/^♙?\s*Login$/i.test(text);
    if(isAvatar||isLogin){
      e.preventDefault();
      e.stopImmediatePropagation();
      openAuth();
    }
  },true);
  const obs=new MutationObserver(()=>hideLegacyAuth());
  if(document.body) obs.observe(document.body,{childList:true,subtree:true});
  else document.addEventListener('DOMContentLoaded',()=>obs.observe(document.body,{childList:true,subtree:true}));
})();
