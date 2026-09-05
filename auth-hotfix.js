/* Living India auth trigger hotfix v2 — kill the legacy demo auth UI and always open real Supabase auth. */
(function(){
  const LEGACY_RE=/Demo Sign In|Enter Living India|Sign in to save discoveries|WELCOME BACK/i;
  function isLegacy(el){
    if(!el||el.id==='li-auth-root') return false;
    const t=(el.textContent||'').replace(/\s+/g,' ').trim();
    return t && t.length<5000 && LEGACY_RE.test(t);
  }
  function hideLegacyAuth(){
    document.querySelectorAll('[role="dialog"],.modal-overlay,.modal').forEach(el=>{
      if(isLegacy(el)){
        el.style.setProperty('display','none','important');
        el.setAttribute('aria-hidden','true');
        el.classList.add('li-legacy-auth-hidden');
      }
    });
  }
  function openAuth(){
    hideLegacyAuth();
    if(typeof window.LivingIndiaAuthOpen==='function') window.LivingIndiaAuthOpen('signin');
    else setTimeout(()=>window.LivingIndiaAuthOpen?.('signin'),100);
  }
  document.addEventListener('click',function(e){
    const btn=e.target.closest?.('button');
    if(!btn) return;
    const text=(btn.textContent||'').replace(/\s+/g,' ').trim();
    const isAvatar=btn.classList.contains('avatar');
    const isLogin=/^♙?\s*Login$/i.test(text);
    if(isAvatar||isLogin){
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      openAuth();
    }
  },true);
  const obs=new MutationObserver(()=>hideLegacyAuth());
  function start(){hideLegacyAuth();obs.observe(document.body,{childList:true,subtree:true});}
  if(document.body) start(); else document.addEventListener('DOMContentLoaded',start,{once:true});
})();
