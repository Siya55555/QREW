// Simple prototype logic for tabs and password gate
(function(){
  const tabs = document.querySelectorAll('.sidebar nav li');
  const sections = document.querySelectorAll('.tab');
  const body = document.body;
  // set default theme
  body.classList.add('font-mono','theme-lavender');

  // theme switcher
  const themeButtons = document.querySelectorAll('.theme-btn');
  themeButtons.forEach(btn=>btn.addEventListener('click', ()=>{
    const t = btn.getAttribute('data-theme');
    body.classList.remove('theme-lavender','theme-brown','theme-charcoal');
    body.classList.add('theme-'+t);
  }));
  // keyboard shortcut: T cycles themes
  let themeOrder=['lavender','brown','charcoal'];
  document.addEventListener('keydown', (e)=>{
    if(e.key.toLowerCase()==='t'){
      let cur = themeOrder.findIndex(x=>body.classList.contains('theme-'+x));
      cur = (cur+1) % themeOrder.length;
      body.classList.remove('theme-lavender','theme-brown','theme-charcoal');
      body.classList.add('theme-'+themeOrder[cur]);
    }
  });
  tabs.forEach(t=>t.addEventListener('click',()=>{
    tabs.forEach(x=>x.classList.remove('active'));
    t.classList.add('active');
    const name = t.getAttribute('data-tab');
    sections.forEach(s=>s.classList.toggle('active', s.id===name));
  }));

  // client will call server API for auth (Node/Express)
  const pwInput = document.getElementById('passwordInput');
  const pwSubmit = document.getElementById('pwSubmit');
  const pwFeedback = document.getElementById('pwFeedback');
  const exclusiveContent = document.getElementById('exclusiveContent');
  const loader = document.getElementById('loader');
  let sessionToken = null;

  function deny(){
    pwFeedback.textContent = 'Access Denied';
    pwFeedback.style.color = '#ff6b6b';
    pwFeedback.classList.add('shake');
    setTimeout(()=>{pwFeedback.textContent='';pwFeedback.classList.remove('shake');},1400);
  }

  function grant(){
    // subtle loading then reveal
    pwFeedback.textContent = '';
    loader.classList.remove('hidden');
    pwInput.disabled = true; pwSubmit.disabled = true;
    setTimeout(()=>{
      loader.classList.add('hidden');
      pwFeedback.textContent = 'Access Granted';
      pwFeedback.style.color = '#b4ffb4';
      exclusiveContent.classList.remove('hidden');
      pwInput.disabled = false; pwSubmit.disabled = false;
    }, 900);
  }

  pwSubmit.addEventListener('click', async ()=>{
    const val = pwInput.value.trim();
    if(!val){deny();return}
    // call server
    try{
      loader.classList.remove('hidden');
      pwSubmit.disabled = true; pwInput.disabled = true;
      const r = await fetch('/api/auth', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password:val})});
      const json = await r.json();
      if(r.ok && json.token){
        sessionToken = json.token;
        // fetch exclusive content
        const res = await fetch('/api/exclusive',{headers:{'Authorization':'Bearer '+sessionToken}});
        if(res.ok){
          const data = await res.json();
          renderExclusiveProducts(data.products);
          grant();
        }else{
          deny();
        }
      }else{ deny(); }
    }catch(e){ console.error(e); deny(); }
    finally{ loader.classList.add('hidden'); pwSubmit.disabled = false; pwInput.disabled = false; pwInput.value=''; }
  });

  // quick keyboard enter support
  pwInput.addEventListener('keydown', (e)=>{ if(e.key==='Enter'){ pwSubmit.click(); } });

  // demo preorder buttons
  document.addEventListener('click', (e)=>{
    if(e.target.matches('.preorder')){
      const card = e.target.closest('.card');
      const pid = card && card.getAttribute('data-id');
      startCheckout(pid);
    }
  });

  function renderExclusiveProducts(products){
    const container = document.getElementById('exclusiveContent');
    const list = container.querySelector('.cards');
    if(!list) return;
    list.innerHTML = '';
    products.forEach(p=>{
      const el = document.createElement('div'); el.className='card'; el.setAttribute('data-id', p.id);
      el.innerHTML = `<div class="card-title">${p.title}</div><div class="card-desc">${p.desc}</div><div class="muted">Price: $${((p.priceCents||2000)/100).toFixed(2)}</div><button class="btn preorder">Preorder (QREW)</button>`;
      list.appendChild(el);
    });
  }

  // Create Checkout Session and redirect using Stripe.js
  async function startCheckout(productId){
    if(!productId){ alert('No product selected'); return; }
    try{
      // create session
      const r = await fetch('/api/create-checkout-session', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ productId, quantity:1 }) });
      const j = await r.json();
      if(!r.ok) return alert('Checkout error: '+(j.error||'unknown'));
      // ensure Stripe is initialized with publishable key
      const cfg = await fetch('/api/config').then(r=>r.json());
      if(!cfg.stripePublishableKey) return alert('Stripe not configured');
      const stripe = Stripe(cfg.stripePublishableKey);
      const { sessionId } = j;
      const { error } = await stripe.redirectToCheckout({ sessionId });
      if(error) alert(error.message);
    }catch(e){ console.error(e); alert('Checkout failure'); }
  }
})();
