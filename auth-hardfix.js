/* Living India auth hard-fix: prevent the legacy React demo login from ever appearing. */
(function(){
  const LEGACY=/Enter Living India|Demo Sign In|Sign in to save discoveries|WELCOME BACK/i;
  const isAuthRoot=el=>el&&el.id==='li-auth-root';
  function kill(){
    document.querySelectorAll('.modal-overlay,.modal,[role="dialog"]').forEach(el=>{
      if(!isAuthRoot(el)&&LEGACY.test((el.textContent||'').replace(/\s+/g,' '))){
        el.remove();
      }
    });
  }
  function open(){
    kill();
    if(typeof window.LivingIndiaAuthOpen==='function') window.LivingIndiaAuthOpen('signin');
    else setTimeout(()=>window.LivingIndiaAuthOpen?.('signin'),150);
  }
  document.addEventListener('click',e=>{
    const btn=e.target?.closest?.('button');
    if(!btn) return;
    const text=(btn.textContent||'').replace(/\s+/g,' ').trim();
    if(btn.classList.contains('avatar')||/^♙?\s*Login$/i.test(text)){
      e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
      open();
    }
  },true);
  const start=()=>{
    kill();
    new MutationObserver(kill).observe(document.body,{childList:true,subtree:true});
    setInterval(kill,250);
  };
  if(document.body) start(); else document.addEventListener('DOMContentLoaded',start,{once:true});
})();
