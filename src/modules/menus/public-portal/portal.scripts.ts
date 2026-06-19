type ProductData = { id: string|number; name: string; price: number; description?: string|null };

export function portalScripts(
  slug: string,
  bizName: string,
  userId: number,
  _modules: unknown[],
  products: ProductData[],
  _bizInfo: unknown,
  initials: string,
  googleClientId: string | null,
): string {
  const safeProducts = products.map(p => ({
    id:          String(p.id),
    name:        p.name,
    price:       Number(p.price || 0),
    description: p.description || "",
  }));

  const safeBizName   = bizName.replace(/`/g, "'");
  const safeInitials  = initials.replace(/`/g, "'");

  return `
var SLUG=${JSON.stringify(slug)};
var USER_ID=${JSON.stringify(userId)};
var PRODUCTS=${JSON.stringify(safeProducts)};
var GOOGLE_CLIENT_ID=${JSON.stringify(googleClientId || '')};
var BIZ_NAME=${JSON.stringify(safeBizName)};
var BIZ_INITIALS=${JSON.stringify(safeInitials)};
var PGU_KEY='pgPortalUser_'+SLUG;
var TABS=['chat','reservas','nosotros','cotizar','resenas'];
var svcsLoaded=false;
var svcsCache=[];
var QCart={};
var reviewsLoaded=false;
var portalGoogleUser=null; // {name,email,picture,credential}
var portalToken=null;
var PGT_KEY='pgPortalToken_'+SLUG;

// ── helpers ───────────────────────────────────────────────────────────────────
function escH(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function fmtPrice(n){if(n===0)return 'Gratis';return '$'+Number(n||0).toLocaleString('es-CL');}
function pfetch(url,opts){
  opts=opts||{};
  if(portalToken){
    opts.headers=Object.assign({},opts.headers||{},{'Authorization':'Bearer '+portalToken});
  }
  return fetch(url,opts).then(function(r){
    if(r.status===401){signOut();throw new Error('session_expired');}
    return r;
  });
}

// ── gate (login screen) ───────────────────────────────────────────────────────
function showGate(){
  var g=document.getElementById('portalGate');
  if(g) g.style.display='flex';
  if(GOOGLE_CLIENT_ID){
    function tryRenderGateBtn(){
      if(window.google && window.google.accounts){
        window.google.accounts.id.initialize({
          client_id:GOOGLE_CLIENT_ID,
          callback:handleGoogleSignIn,
          auto_select:false
        });
        var el=document.getElementById('gateGoogleBtn');
        if(el) window.google.accounts.id.renderButton(el,{
          type:'standard',theme:'outline',size:'large',
          text:'signin_with',shape:'rectangular',width:260
        });
      } else {
        setTimeout(tryRenderGateBtn,300);
      }
    }
    tryRenderGateBtn();
  }
}

function hideGate(){
  var g=document.getElementById('portalGate');
  if(g){g.style.opacity='0';g.style.pointerEvents='none';setTimeout(function(){g.style.display='none';g.style.opacity='';},350);}
}

function renderUserChip(user){
  // desktop icon rail chip
  var chip=document.getElementById('irUserChip');
  var avEl=document.getElementById('irUserAv');
  var emailEl=document.getElementById('irUserEmail');
  if(chip && avEl && emailEl){
    avEl.innerHTML=user.picture
      ?'<img src="'+escH(user.picture)+'" style="width:32px;height:32px;border-radius:50%;object-fit:cover" referrerpolicy="no-referrer">'
      :'<div style="width:32px;height:32px;border-radius:50%;background:var(--primary);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:#fff">'+escH((user.name||'?').charAt(0).toUpperCase())+'</div>';
    emailEl.textContent=user.email||user.name||'';
    chip.style.display='flex';
  }
  // mobile header chip
  var mhdr=document.getElementById('mhdrUser');
  var mhdrAv=document.getElementById('mhdrUserAv');
  if(mhdr && mhdrAv){
    mhdrAv.innerHTML=user.picture
      ?'<img src="'+escH(user.picture)+'" style="width:28px;height:28px;border-radius:50%;object-fit:cover" referrerpolicy="no-referrer">'
      :'<div style="width:28px;height:28px;border-radius:50%;background:var(--primary);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:#fff">'+escH((user.name||'?').charAt(0).toUpperCase())+'</div>';
    mhdr.style.display='flex';
  }
  // wire logout buttons
  ['irUserOut','mhdrUserOut'].forEach(function(id){
    var btn=document.getElementById(id);
    if(btn) btn.onclick=signOut;
  });
}

function signOut(){
  portalGoogleUser=null;
  portalToken=null;
  try{localStorage.removeItem(PGU_KEY);localStorage.removeItem(PGT_KEY);}catch(e){}
  if(window.google && window.google.accounts) window.google.accounts.id.disableAutoSelect();
  var chip=document.getElementById('irUserChip');
  if(chip) chip.style.display='none';
  var mhdr=document.getElementById('mhdrUser');
  if(mhdr) mhdr.style.display='none';
  showGate();
}

// ── tab switching ─────────────────────────────────────────────────────────────
function setActive(t){
  document.querySelectorAll('.bn-item,.ir-btn,.cn-tab').forEach(function(el){
    el.classList.toggle('active',el.getAttribute('data-tab')===t);
  });
}
function showTab(t){
  if(!t||TABS.indexOf(t)===-1) return;
  TABS.forEach(function(x){
    var p=document.getElementById('panel-'+x);
    if(p) p.classList.toggle('active',x===t);
  });
  setActive(t);
  if(t==='reservas'){ensureServices();loadCalendar();}
  if(t==='resenas') ensureReviews();
}

// ── slide panels ──────────────────────────────────────────────────────────────
function openPanel(id){
  var el=document.getElementById(id);
  var ov=document.getElementById('slideOverlay');
  if(el) el.classList.add('open');
  if(ov) ov.classList.add('open');
}
function closePanel(id){
  var el=document.getElementById(id);
  var ov=document.getElementById('slideOverlay');
  if(el) el.classList.remove('open');
  if(ov) ov.classList.remove('open');
}
function openQuotePanel(){renderQPStep1();openPanel('quotePanel');}

// ── Booking flow state ────────────────────────────────────────────────────────
var bk={date:null,svc:null,time:null,step:null,provider:null};

// ── Providers (team members) ──────────────────────────────────────────────────
var providersCache=[];
var providersLoaded=false;

function loadProviders(){
  if(providersLoaded) return;
  pfetch('/api/public/'+SLUG+'/providers')
    .then(function(r){return r.json();})
    .then(function(d){
      providersLoaded=true;
      providersCache=Array.isArray(d.providers)?d.providers:[];
    })
    .catch(function(){providersLoaded=true;providersCache=[];});
}

function setBkHeader(title,showBack){
  var t=document.getElementById('bkTitle');
  var b=document.getElementById('bkBack');
  if(t) t.textContent=title;
  if(b) b.style.display=showBack?'flex':'none';
}

// Entry: click on a calendar day
function openBookingFromDay(dateStr){
  bk.date=dateStr; bk.time=null; bk.provider=null;
  openPanel('bookingPanel');
  if(bk.svc){
    // service pre-selected from home card — skip straight to provider/time
    if(providersCache.length>0) renderBkProviderStep();
    else renderBkTimeStep();
  } else {
    bk.step='svc';
    renderBkSvcStep();
  }
}

function renderBkProviderStep(){
  bk.step='provider';
  setBkHeader('Elegí un profesional',true);
  var body=document.getElementById('bkBody'); if(!body) return;
  var label=fmtDateLabel(bk.date);
  var calIco='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:12px;height:12px"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/></svg>';
  var dateBadge='<div class="bk-date-badge">'+calIco+escH(label)+'</div>';
  var svcBadge=bk.svc?'<div class="bk-date-badge" style="background:var(--bg);border:1px solid var(--border);color:var(--soft)">'+escH(bk.svc.name)+'</div>':'';
  var rows=providersCache.map(function(p,i){
    var initials=p.avatar_initials||(p.name.trim().charAt(0)||'?').toUpperCase();
    var color=p.color&&/^#[0-9a-fA-F]{6}$/.test(p.color)?p.color:CARD_PALETTES[i%CARD_PALETTES.length];
    return '<div class="bk-svc-item" data-bk-prov-i="'+i+'">'
      +'<div style="width:36px;height:36px;border-radius:50%;background:'+color+';display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:#fff;flex-shrink:0">'+escH(initials)+'</div>'
      +'<div class="bk-svc-info"><div class="bk-svc-name">'+escH(p.name)+'</div></div>'
      +'<div class="bk-svc-arr"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><polyline points="9 18 15 12 9 6"/></svg></div>'
      +'</div>';
  }).join('');
  var anyRow='<div class="bk-svc-item" data-bk-prov-any="1">'
    +'<div style="width:36px;height:36px;border-radius:50%;background:var(--bg);border:1.5px solid var(--border);display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0">👤</div>'
    +'<div class="bk-svc-info"><div class="bk-svc-name">Sin preferencia</div><div class="bk-svc-meta">Cualquier profesional disponible</div></div>'
    +'<div class="bk-svc-arr"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><polyline points="9 18 15 12 9 6"/></svg></div>'
    +'</div>';
  body.innerHTML='<div class="bk-scroll">'+dateBadge+svcBadge
    +'<div class="bk-sec-title">Seleccioná el profesional</div>'
    +rows+anyRow+'</div>';
}

// Generic "Reservar" → go to Reservas tab (calendar is the entry)
function openBookingPanel(){ showTab('reservas'); }

function renderBkSvcStep(){
  bk.step='svc';
  var label=fmtDateLabel(bk.date);
  setBkHeader(label,false);
  var body=document.getElementById('bkBody'); if(!body) return;
  if(!svcsLoaded){
    body.innerHTML='<div class="bk-scroll"><div class="cal-loading"><div class="spinner"></div>Cargando…</div></div>';
    ensureServices();
    setTimeout(function(){if(svcsLoaded) renderBkSvcStep();},1200);
    return;
  }
  var svcs=svcsCache;
  if(!svcs.length){
    body.innerHTML='<div class="bk-scroll"><div class="bk-empty">No hay servicios disponibles en este momento.</div></div>';
    return;
  }
  var rows=svcs.map(function(s,i){
    var color=s.color&&/^#[0-9a-fA-F]{6}$/.test(s.color)?s.color:CARD_PALETTES[i%CARD_PALETTES.length];
    var price=s.price!=null?fmtPrice(Number(s.price)):'Consultar';
    var dur=s.duration_minutes?s.duration_minutes+' min':'';
    return '<div class="bk-svc-item" data-bk-svc-i="'+i+'">'
      +'<div class="bk-svc-dot" style="background:'+color+'"></div>'
      +'<div class="bk-svc-info"><div class="bk-svc-name">'+escH(s.name)+'</div>'
      +(dur?'<div class="bk-svc-meta">'+escH(dur)+'</div>':'')
      +'</div>'
      +'<div class="bk-svc-price">'+escH(price)+'</div>'
      +'<div class="bk-svc-arr"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><polyline points="9 18 15 12 9 6"/></svg></div>'
      +'</div>';
  }).join('');
  var dateBadge='<div class="bk-date-badge">'
    +'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:12px;height:12px"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/></svg>'
    +escH(label)+'</div>';
  body.innerHTML='<div class="bk-scroll">'+dateBadge
    +'<div class="bk-sec-title">Elegí un servicio</div>'+rows+'</div>';
}

function renderBkTimeStep(){
  bk.step='time';
  setBkHeader(escH(bk.svc?bk.svc.name:'Horarios'),true);
  var body=document.getElementById('bkBody'); if(!body) return;
  var times=(bk.date&&calSlots[bk.date])||[];
  var label=fmtDateLabel(bk.date);
  var badge='<div class="bk-date-badge">'
    +'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:12px;height:12px"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/></svg>'
    +escH(label)+'</div>';
  if(!times.length){
    body.innerHTML='<div class="bk-scroll">'+badge
      +'<div class="bk-empty">No hay horarios disponibles para este día.<br><br>'
      +'<button class="btn-primary" type="button" id="bkChangeDay" style="font-size:13px">Cambiar fecha</button></div></div>';
    var cd=document.getElementById('bkChangeDay');
    if(cd) cd.addEventListener('click',function(){closePanel('bookingPanel');showTab('reservas');});
    return;
  }
  var chips=times.map(function(t){
    return '<button class="bk-time-chip" type="button" data-bk-time="'+escH(t)+'">'+escH(t)+'</button>';
  }).join('');
  body.innerHTML='<div class="bk-scroll">'+badge
    +'<div class="bk-sec-title">Elegí un horario</div>'
    +'<div class="bk-times-grid">'+chips+'</div></div>';
}

function renderBkFormStep(){
  bk.step='form';
  setBkHeader('Tus datos',true);
  var body=document.getElementById('bkBody'); if(!body) return;
  var label=fmtDateLabel(bk.date);
  var svcIcon='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>';
  var calIcon='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/></svg>';
  body.innerHTML='<div class="bk-scroll">'
    +'<div class="bk-summary-card">'
    +'<div class="bk-summary-row">'+svcIcon+escH(bk.svc?bk.svc.name:'')+'</div>'
    +'<div class="bk-summary-row">'+calIcon+escH(label)+' — '+escH(bk.time||'')+'</div>'
    +'</div>'
    +'<div class="bk-inp-wrap"><div class="bk-inp-lbl">Nombre completo</div>'
    +'<input class="bk-inp" id="bkName" type="text" placeholder="Tu nombre" autocomplete="name"></div>'
    +'<div class="bk-inp-wrap"><div class="bk-inp-lbl">Teléfono</div>'
    +'<input class="bk-inp" id="bkPhone" type="tel" placeholder="+54911..." autocomplete="tel"></div>'
    +'<div class="bk-inp-wrap"><div class="bk-inp-lbl">Email</div>'
    +'<input class="bk-inp" id="bkEmail" type="email" placeholder="tu@email.com" autocomplete="email"></div>'
    +'<div id="bkFormErr" class="bk-inp-err" style="margin-bottom:10px"></div>'
    +'<button class="btn-primary" type="button" id="bkSubmit" style="width:100%;font-size:14px">Confirmar reserva</button>'
    +'</div>';
  var btn=document.getElementById('bkSubmit');
  if(btn) btn.addEventListener('click',submitBooking);
}

function submitBooking(){
  var name=((document.getElementById('bkName')||{}).value||'').trim();
  var phone=((document.getElementById('bkPhone')||{}).value||'').trim();
  var email=((document.getElementById('bkEmail')||{}).value||'').trim();
  var errEl=document.getElementById('bkFormErr');
  if(!name||!phone||!email){if(errEl)errEl.textContent='Completá todos los campos.';return;}
  if(errEl) errEl.textContent='';
  var btn=document.getElementById('bkSubmit');
  if(btn){btn.textContent='Enviando…';btn.disabled=true;}
  pfetch('/api/public/'+SLUG+'/bookings',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({
      serviceId:bk.svc?bk.svc.id:null,
      providerId:bk.provider?bk.provider.id:null,
      slot:{date:bk.date,time:bk.time},
      customer:{name:name,phone:phone,email:email}
    })
  })
  .then(function(r){return r.json();})
  .then(function(d){
    if(d.ok||d.id||d.booking_id||d.bookingId) renderBkSuccess();
    else{
      if(errEl) errEl.textContent=d.message||'Error al confirmar. Intentá de nuevo.';
      if(btn){btn.textContent='Confirmar reserva';btn.disabled=false;}
    }
  })
  .catch(function(){
    if(errEl) errEl.textContent='Error de conexión. Intentá de nuevo.';
    if(btn){btn.textContent='Confirmar reserva';btn.disabled=false;}
  });
}

function renderBkSuccess(){
  bk.step='success';
  setBkHeader('¡Confirmado!',false);
  var body=document.getElementById('bkBody'); if(!body) return;
  body.innerHTML='<div class="bk-success">'
    +'<div class="bk-success-icon">'
    +'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>'
    +'</div>'
    +'<div class="bk-success-title">¡Reserva confirmada!</div>'
    +'<div class="bk-success-sub">Tu turno quedó registrado.<br>Recibirás una confirmación a tu email.</div>'
    +'<button class="btn-primary" type="button" id="bkDone" style="width:100%;margin-top:28px">Listo</button>'
    +'</div>';
  var done=document.getElementById('bkDone');
  if(done) done.addEventListener('click',function(){closePanel('bookingPanel');});
}

function fmtDateLabel(dateStr){
  if(!dateStr) return '';
  var parts=dateStr.split('-');
  if(parts.length!==3) return dateStr;
  var d=new Date(parseInt(parts[0]),parseInt(parts[1])-1,parseInt(parts[2]));
  var days=['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
  var ms=['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  return days[d.getDay()]+' '+d.getDate()+' de '+ms[d.getMonth()];
}

// ── click handler (safe for text nodes & SVG children) ────────────────────────
document.addEventListener('click',function(e){
  var t=e.target;
  // text nodes & non-elements don't have closest()
  if(!t||typeof t.closest!=='function') return;

  // nav tabs (data-tab)
  var tabBtn=t.closest('[data-tab]');
  if(tabBtn&&(tabBtn.classList.contains('bn-item')||tabBtn.classList.contains('ir-btn')||tabBtn.classList.contains('cn-tab'))){
    showTab(tabBtn.getAttribute('data-tab'));
    return;
  }

  // action buttons (data-action)
  var actBtn=t.closest('[data-action]');
  if(actBtn){
    var a=actBtn.getAttribute('data-action');
    if(a==='reservas')      showTab('reservas');
    else if(a==='cotizar')  showTab('cotizar');
    else if(a==='productos')showTab('nosotros');
    else if(a==='resenas')  showTab('resenas');
    return;
  }

  // booking openers
  if(t.closest('[data-open-booking]')){
    openBookingPanel();
    return;
  }

  // close / back booking panel
  if(t.closest('#closeBooking')){ closePanel('bookingPanel'); return; }
  if(t.closest('#bkBack')){
    if(bk.step==='provider') renderBkSvcStep();
    else if(bk.step==='time'){ if(providersCache.length>0) renderBkProviderStep(); else renderBkSvcStep(); }
    else if(bk.step==='form') renderBkTimeStep();
    else closePanel('bookingPanel');
    return;
  }

  // home service card → booking
  var homeSvcCard=t.closest('[data-bk-svc-home]');
  if(homeSvcCard){
    var hidx=parseInt(homeSvcCard.getAttribute('data-bk-svc-home')||'0',10);
    bk.date=null;bk.svc=svcsCache[hidx]||null;bk.time=null;bk.provider=null;
    showTab('reservas');
    return;
  }

  // booking panel step interactions
  var svcItem=t.closest('[data-bk-svc-i]');
  if(svcItem){
    var idx=parseInt(svcItem.getAttribute('data-bk-svc-i')||'0',10);
    bk.svc=svcsCache[idx]||null;
    if(providersCache.length>0) renderBkProviderStep();
    else renderBkTimeStep();
    return;
  }
  var provItem=t.closest('[data-bk-prov-i]');
  if(provItem){
    var pidx=parseInt(provItem.getAttribute('data-bk-prov-i')||'0',10);
    bk.provider=providersCache[pidx]||null;
    renderBkTimeStep();
    return;
  }
  var provAny=t.closest('[data-bk-prov-any]');
  if(provAny){
    bk.provider=null;
    renderBkTimeStep();
    return;
  }
  var timeChip=t.closest('[data-bk-time]');
  if(timeChip){
    bk.time=timeChip.getAttribute('data-bk-time');
    renderBkFormStep();
    return;
  }

  if(t.closest('#closeQuote')){   closePanel('quotePanel');   return; }
  if(t.closest('#closeReview')){  closePanel('reviewPanel');  return; }
  if(t.closest('#openReviewBtn')){ openReviewPanel(); return; }
  if(t.closest('#slideOverlay')){ closePanel('bookingPanel'); closePanel('quotePanel'); closePanel('reviewPanel'); return; }
});

// ── services ──────────────────────────────────────────────────────────────────
var CARD_PALETTES=['#FBBDC7','#93C5FD','#FDE68A','#6EE7B7','#C4B5FD','#FCA5A5'];
var CARD_GRADIENTS=[
  'linear-gradient(135deg,#6366F1,#818CF8)',
  'linear-gradient(135deg,#EC4899,#F472B6)',
  'linear-gradient(135deg,#0EA5E9,#38BDF8)',
  'linear-gradient(135deg,#10B981,#34D399)',
  'linear-gradient(135deg,#F59E0B,#FCD34D)',
  'linear-gradient(135deg,#EF4444,#F87171)'
];

function ensureServices(){
  if(svcsLoaded){applyServices(svcsCache);return;}
  loadServices();
}

function loadServices(){
  pfetch('/api/public/'+SLUG+'/booking-services')
    .then(function(r){return r.json();})
    .then(function(d){
      var list=Array.isArray(d)?d:Array.isArray(d.services)?d.services:[];
      svcsLoaded=true;svcsCache=list;
      applyServices(list);
    })
    .catch(function(){
      svcsLoaded=true;svcsCache=[];
      applyServices([]);
    });
}

function applyServices(svcs){
  renderHomeGrid('homeServiceGrid', svcs);
  renderSvcRows('svcList', svcs);
  renderSvcRows('mobileServiceList', svcs);
  var statEl=document.getElementById('prStatSvcs');
  if(statEl) statEl.textContent=String(svcs.length);
}

function renderHomeGrid(id,svcs){
  var el=document.getElementById(id);if(!el) return;
  if(!svcs.length){
    el.innerHTML='<div class="svc-empty" style="grid-column:1/-1">No hay servicios configurados aún.</div>';
    return;
  }
  var html='';
  svcs.forEach(function(s,i){
    var grad=CARD_GRADIENTS[i%CARD_GRADIENTS.length];
    var price=s.price!=null?fmtPrice(Number(s.price)):'Consultar';
    var priceColor=s.price!=null&&Number(s.price)>0?'#fff':'rgba(255,255,255,.7)';
    var dur=s.duration_minutes?s.duration_minutes+' min':'';
    var ltr=(s.name||'?').trim().charAt(0).toUpperCase();
    // provider avatars (up to 3)
    var provHtml='';
    if(providersCache.length>0){
      var shown=providersCache.slice(0,3);
      provHtml='<div class="svc-card-provs">';
      shown.forEach(function(p,pi){
        var pc=p.color&&/^#[0-9a-fA-F]{6}$/.test(p.color)?p.color:CARD_PALETTES[pi%CARD_PALETTES.length];
        var ini=(p.avatar_initials||(p.name||'?').trim().charAt(0)).toUpperCase();
        provHtml+='<div class="svc-card-prov" style="background:'+pc+'">'+escH(ini)+'</div>';
      });
      provHtml+='</div>';
    }
    html+='<div class="svc-card" data-bk-svc-home="'+i+'">'
      +'<div class="svc-card-top" style="background:'+grad+'">'
      +'<div class="svc-card-ltr">'+escH(ltr)+'</div>'
      +provHtml
      +'</div>'
      +'<div class="svc-card-body">'
      +'<div class="svc-card-name">'+escH(s.name)+'</div>'
      +'<div class="svc-card-meta">'+escH(dur||'Servicio profesional')+'</div>'
      +'<div class="svc-card-foot">'
      +'<span class="svc-card-price" style="color:var(--primary)">'+escH(price)+'</span>'
      +'<button class="svc-card-btn" type="button" style="background:'+grad+'" data-bk-svc-home="'+i+'">Reservar</button>'
      +'</div>'
      +'</div>'
      +'</div>';
  });
  el.innerHTML=html;
}

// Row list (reservas tab + mobile home + desktop home)
function renderSvcRows(id,svcs){
  var el=document.getElementById(id);if(!el) return;
  if(!svcs.length){
    el.innerHTML='<div class="svc-empty">No hay servicios configurados aún.</div>';
    return;
  }
  var html='';
  svcs.forEach(function(s,i){
    var color=s.color&&/^#[0-9a-fA-F]{6}$/.test(s.color)?s.color:CARD_PALETTES[i%CARD_PALETTES.length];
    var price=s.price!=null?fmtPrice(Number(s.price)):'Consultar';
    var dur=s.duration_minutes?s.duration_minutes+' min':'';
    html+='<div class="svc-row">'
      +'<div class="svc-dot" style="background:'+escH(color)+'"></div>'
      +'<div class="svc-body">'
      +'<div class="svc-name">'+escH(s.name)+'</div>'
      +(dur?'<div class="svc-meta">'+escH(dur)+'</div>':'')
      +'</div>'
      +'<div class="svc-price">'+escH(price)+'</div>'
      +'<div class="svc-arr"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><polyline points="9 18 15 12 9 6"/></svg></div>'
      +'</div>';
  });
  el.innerHTML=html;
}

// ── products (home, runs on init independently) ────────────────────────────────
function renderHomeProducts(){
  var el=document.getElementById('homeProductList');if(!el) return;
  if(!PRODUCTS.length){
    el.innerHTML='<div class="prod-empty">Sin productos disponibles aún.</div>';return;
  }
  var html='<div class="prod-card-hdr" style="font-size:11px;font-weight:700;color:var(--dim);text-transform:uppercase;letter-spacing:.07em">Productos</div>';
  PRODUCTS.slice(0,6).forEach(function(p){
    html+='<div class="prod-item">'
      +'<div class="prod-item-left">'
      +'<div class="prod-item-name">'+escH(p.name)+'</div>'
      +(p.description?'<div class="prod-item-desc">'+escH(p.description)+'</div>':'')
      +'</div>'
      +'<div class="prod-item-price">'+fmtPrice(p.price)+'</div>'
      +'</div>';
  });
  el.innerHTML=html;
}

// ── Calendar widget ───────────────────────────────────────────────────────────
var calSlots={};      // { 'YYYY-MM-DD': ['09:00',...] }
var calLoaded=false;
var calYear=new Date().getFullYear();
var calMonth=new Date().getMonth(); // 0-based
var MONTHS=['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
var DAYS_SHORT=['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];

function loadCalendar(){
  if(calLoaded){renderAllCals();return;}
  pfetch('/api/public/'+SLUG+'/slots')
    .then(function(r){return r.json();})
    .then(function(data){
      calLoaded=true;calSlots={};
      if(data&&Array.isArray(data.slots)){
        data.slots.forEach(function(s){
          if(s.date&&s.times&&s.times.length) calSlots[s.date]=s.times;
        });
      }
      renderAllCals();
    })
    .catch(function(){calLoaded=true;renderAllCals();});
}

function renderAllCals(){
  renderCalWidget('calHome');
  renderCalWidget('calReservas');
  updateProfileNextSlot();
}

function updateProfileNextSlot(){
  var section=document.getElementById('prAvailSection');
  var slot=document.getElementById('prNextSlot');
  if(!section||!slot) return;
  var today=new Date();
  var todayStr=today.getFullYear()+'-'+pad2(today.getMonth()+1)+'-'+pad2(today.getDate());
  var dates=Object.keys(calSlots).sort();
  var next=null;
  for(var i=0;i<dates.length;i++){
    if(dates[i]>=todayStr&&calSlots[dates[i]]&&calSlots[dates[i]].length>0){next=dates[i];break;}
  }
  section.style.display='block';
  var calIco='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/></svg>';
  if(next){
    var cnt=calSlots[next].length;
    slot.innerHTML='<div class="pr-avail-pill">'+calIco+escH(fmtDateLabel(next))+'<span style="font-weight:400;font-size:11px;opacity:.8">'+cnt+' horario'+(cnt!==1?'s':'')+'</span></div>';
  } else {
    slot.innerHTML='<div class="pr-avail-none">Sin turnos disponibles por ahora</div>';
  }
}

function renderCalWidget(id){
  var el=document.getElementById(id);if(!el)return;
  var today=new Date();
  var todayStr=today.getFullYear()+'-'+pad2(today.getMonth()+1)+'-'+pad2(today.getDate());

  // Month grid
  var firstDay=new Date(calYear,calMonth,1);
  var lastDay=new Date(calYear,calMonth+1,0);
  var startDow=firstDay.getDay(); // 0=Sun
  var totalDays=lastDay.getDate();

  // Day name headers (starting Sunday)
  var dayNames=DAYS_SHORT.map(function(d){return '<div class="cal-day-name">'+d+'</div>';}).join('');

  // Empty cells before first day
  var cells='';
  for(var i=0;i<startDow;i++) cells+='<div class="cal-cell cal-empty"></div>';

  for(var d=1;d<=totalDays;d++){
    var dateStr=calYear+'-'+pad2(calMonth+1)+'-'+pad2(d);
    var dayDate=new Date(calYear,calMonth,d);
    var isPast=dayDate<new Date(today.getFullYear(),today.getMonth(),today.getDate());
    var isToday=dateStr===todayStr;
    var hasSlots=!!(calSlots[dateStr]&&calSlots[dateStr].length);

    var cls='cal-cell';
    var extra='';
    if(isToday){
      cls+=' cal-today';
    } else if(isPast){
      cls+=' cal-past';
    } else if(hasSlots){
      cls+=' cal-avail';
      extra=' data-cal-date="'+dateStr+'" title="'+calSlots[dateStr].length+' horarios disponibles"';
    } else {
      cls+=' cal-taken';
    }
    cells+='<div class="'+cls+'"'+extra+'>'+d+'</div>';
  }

  var isPrevDisabled=(calYear===today.getFullYear()&&calMonth<=today.getMonth());
  var html='<div class="cal-hdr">'
    +'<span class="cal-title">'+MONTHS[calMonth]+' '+calYear+'</span>'
    +'<div class="cal-nav">'
    +'<button class="cal-nav-btn" id="'+id+'Prev" type="button"'+(isPrevDisabled?' disabled style="opacity:.35;cursor:default"':'')+'>'
    +'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="15 18 9 12 15 6"/></svg>'
    +'</button>'
    +'<button class="cal-nav-btn" id="'+id+'Next" type="button">'
    +'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="9 18 15 12 9 6"/></svg>'
    +'</button>'
    +'</div>'
    +'</div>'
    +'<div class="cal-grid">'+dayNames+cells+'</div>'
    +'<div class="cal-legend">'
    +'<div class="cal-leg-item"><div class="cal-leg-dot" style="background:var(--green)"></div>Disponible</div>'
    +'<div class="cal-leg-item"><div class="cal-leg-dot" style="background:var(--red);opacity:.5"></div>Sin turnos</div>'
    +'<div class="cal-leg-item"><div class="cal-leg-dot" style="background:var(--primary)"></div>Hoy</div>'
    +'</div>';

  el.innerHTML=html;

  // Nav buttons
  var prevBtn=document.getElementById(id+'Prev');
  var nextBtn=document.getElementById(id+'Next');
  if(prevBtn&&!isPrevDisabled){
    prevBtn.addEventListener('click',function(){
      calMonth--;if(calMonth<0){calMonth=11;calYear--;}
      renderAllCals();
    });
  }
  if(nextBtn){
    nextBtn.addEventListener('click',function(){
      calMonth++;if(calMonth>11){calMonth=0;calYear++;}
      renderAllCals();
    });
  }
  // Click on available day → booking flow (day → svc → time → form)
  el.querySelectorAll('.cal-avail').forEach(function(cell){
    cell.addEventListener('click',function(){
      var dateStr=cell.getAttribute('data-cal-date');
      if(dateStr) openBookingFromDay(dateStr);
    });
  });
}

function pad2(n){return n<10?'0'+n:String(n);}

// ── Quote panel ───────────────────────────────────────────────────────────────
function renderQPStep1(){
  QCart={};
  var body=document.getElementById('quotePanelBody');if(!body)return;
  if(!PRODUCTS.length){
    body.innerHTML='<div style="text-align:center;color:var(--dim);padding:48px 20px;font-size:14px">No hay productos disponibles.</div>';return;
  }
  var cards=PRODUCTS.map(function(p){
    return '<div class="qp-prod-card">'
      +'<div class="qp-prod-info">'
      +'<div class="qp-prod-name">'+escH(p.name)+'</div>'
      +(p.description?'<div class="qp-prod-desc">'+escH(p.description)+'</div>':'')
      +'<div class="qp-prod-price">'+fmtPrice(p.price)+'</div>'
      +'</div>'
      +'<div class="qp-qty" data-id="'+escH(String(p.id))+'">'
      +'<button class="qp-qty-btn" data-op="minus" type="button">−</button>'
      +'<span class="qp-qty-num">0</span>'
      +'<button class="qp-qty-btn" data-op="plus" type="button">+</button>'
      +'</div></div>';
  }).join('');
  body.innerHTML='<div style="padding:16px 20px">'
    +'<p style="font-size:11px;font-weight:700;color:var(--dim);text-transform:uppercase;letter-spacing:.07em;margin-bottom:12px">Selecciona productos</p>'
    +'<div>'+cards+'</div>'
    +'<div id="qpBar" style="display:none;margin-top:14px;padding:10px 14px;background:var(--bg);border:1.5px solid var(--border);border-radius:10px;align-items:center;justify-content:space-between">'
    +'<span id="qpBarInfo" style="font-size:13px;color:var(--soft)"></span>'
    +'<span id="qpBarTot" style="font-size:13px;font-weight:700;color:var(--primary)"></span></div>'
    +'<button class="btn-primary" id="qpContBtn" type="button" style="width:100%;margin-top:14px">Continuar →</button>'
    +'</div>';
  body.querySelectorAll('.qp-qty').forEach(function(qc){
    var pid=qc.getAttribute('data-id');
    var numEl=qc.querySelector('.qp-qty-num');
    qc.querySelectorAll('.qp-qty-btn').forEach(function(btn){
      btn.addEventListener('click',function(){
        var op=btn.getAttribute('data-op');
        QCart[pid]=(QCart[pid]||0)+(op==='plus'?1:-1);
        if(QCart[pid]<0)QCart[pid]=0;
        numEl.textContent=String(QCart[pid]);qpRefreshBar();
      });
    });
  });
  var contBtn=document.getElementById('qpContBtn');
  if(contBtn) contBtn.addEventListener('click',function(){
    if(!PRODUCTS.some(function(p){return (QCart[p.id]||0)>0;})){alert('Selecciona al menos un producto.');return;}
    renderQPStep2();
  });
}
function qpRefreshBar(){
  var bar=document.getElementById('qpBar'),info=document.getElementById('qpBarInfo'),tot=document.getElementById('qpBarTot');
  if(!bar)return;
  var c=0,t=0;PRODUCTS.forEach(function(p){var q=QCart[p.id]||0;c+=q;t+=p.price*q;});
  if(c>0){bar.style.display='flex';info.textContent=c+(c!==1?' productos':' producto');tot.textContent=fmtPrice(t);}
  else bar.style.display='none';
}
function renderQPStep2(){
  var body=document.getElementById('quotePanelBody');if(!body)return;
  var rows='',total=0;
  PRODUCTS.forEach(function(p){var q=QCart[p.id]||0;if(!q)return;var sub=p.price*q;total+=sub;
    rows+='<div style="display:flex;justify-content:space-between;padding:9px 0;border-bottom:1px solid var(--border-inner);font-size:13.5px">'
    +'<span style="color:var(--soft)">'+escH(p.name)+' \xd7'+q+'</span><span style="font-weight:600">'+fmtPrice(sub)+'</span></div>';
  });
  body.innerHTML='<div style="padding:16px 20px">'
    +'<button class="btn-outline" id="qpBack" type="button" style="margin-bottom:16px;font-size:12.5px;padding:8px 13px">← Atrás</button>'
    +'<p style="font-size:11px;font-weight:700;color:var(--dim);text-transform:uppercase;letter-spacing:.07em;margin-bottom:10px">Resumen</p>'
    +'<div style="background:var(--bg);border:1px solid var(--border);border-radius:12px;padding:4px 14px;margin-bottom:16px">'+rows
    +'<div style="display:flex;justify-content:space-between;padding:10px 0;font-size:14px;font-weight:700"><span>Total estimado</span><span style="color:var(--primary)">'+fmtPrice(total)+'</span></div></div>'
    +'<p style="font-size:11px;font-weight:700;color:var(--dim);text-transform:uppercase;letter-spacing:.07em;margin-bottom:10px">Tus datos</p>'
    +'<input class="qp-inp" type="text" id="qpName" placeholder="Nombre completo" autocomplete="name"/>'
    +'<input class="qp-inp" type="tel" id="qpPhone" placeholder="Teléfono" autocomplete="tel"/>'
    +'<input class="qp-inp" type="email" id="qpEmail" placeholder="Email (opcional)" autocomplete="email"/>'
    +'<div id="qpErr" style="display:none;color:var(--red);font-size:13px;margin:8px 0;padding:10px 12px;background:var(--red-dim);border-radius:8px"></div>'
    +'<button class="btn-primary" id="qpSend" type="button" style="width:100%;margin-top:8px">Enviar cotización</button>'
    +'</div>';
  var backBtn=document.getElementById('qpBack');
  if(backBtn) backBtn.addEventListener('click',renderQPStep1);
  var sendBtn=document.getElementById('qpSend'),errEl=document.getElementById('qpErr');
  if(sendBtn) sendBtn.addEventListener('click',function(){
    var name=document.getElementById('qpName').value.trim();
    var phone=document.getElementById('qpPhone').value.trim();
    var email=document.getElementById('qpEmail').value.trim();
    if(!name||!phone){errEl.textContent='Nombre y teléfono son obligatorios.';errEl.style.display='block';return;}
    errEl.style.display='none';sendBtn.disabled=true;sendBtn.textContent='Enviando...';
    var items=PRODUCTS.filter(function(p){return (QCart[p.id]||0)>0;}).map(function(p){return {productId:p.id,quantity:QCart[p.id]};});
    pfetch('/shop/'+SLUG+'/quotes/submit',{method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({customer:{name:name,phone:phone,email:email||'',message:''},items:items})})
    .then(function(r){return r.json();})
    .then(function(d){
      if(d.ok){renderQPSuccess(name);}
      else{sendBtn.disabled=false;sendBtn.textContent='Enviar cotización';errEl.textContent=d.message||'Error al enviar.';errEl.style.display='block';}
    })
    .catch(function(){sendBtn.disabled=false;sendBtn.textContent='Enviar cotización';errEl.textContent='Error de conexión. Intenta de nuevo.';errEl.style.display='block';});
  });
  setTimeout(function(){var el=document.getElementById('qpName');if(el)el.focus();},180);
}
function renderQPSuccess(name){
  var body=document.getElementById('quotePanelBody');if(!body)return;
  body.innerHTML='<div style="display:flex;flex-direction:column;align-items:center;text-align:center;padding:60px 24px">'
    +'<div style="width:60px;height:60px;border-radius:18px;background:var(--green-dim);display:flex;align-items:center;justify-content:center;font-size:28px;margin-bottom:14px">✅</div>'
    +'<div style="font-size:18px;font-weight:700;color:var(--text);margin-bottom:6px">¡Cotización enviada!</div>'
    +'<div style="font-size:14px;color:var(--soft);line-height:1.6;max-width:240px">Te contactamos pronto, '+escH(name)+'.</div>'
    +'<button class="btn-primary" id="qpDoneBtn" type="button" style="margin-top:28px">Volver al inicio</button>'
    +'</div>';
  var doneBtn=document.getElementById('qpDoneBtn');
  if(doneBtn) doneBtn.addEventListener('click',function(){closePanel('quotePanel');showTab('chat');});
}

// ── Reviews ───────────────────────────────────────────────────────────────────
function renderStars(avg){
  var full=Math.round(avg||0);
  if(full>5) full=5;
  if(full<0) full=0;
  var empty=5-full;
  var html='';
  for(var i=0;i<full;i++) html+='<span style="color:#F59E0B">★</span>';
  for(var i=0;i<empty;i++) html+='<span style="color:var(--dim)">★</span>';
  return html;
}

function ensureReviews(){
  if(reviewsLoaded) return;
  reviewsLoaded=true;
  pfetch('/api/public/reviews/'+USER_ID)
    .then(function(r){return r.json();})
    .then(function(data){
      renderReviewsTab(data);
      updateProfileRating(data);
      renderHomeInbox(data);
    })
    .catch(function(){
      var el=document.getElementById('reviewsContent');
      if(el) el.innerHTML='<div class="bk-empty">No se pudieron cargar las reseñas.</div>';
      var inb=document.getElementById('homeInbox');
      if(inb) inb.innerHTML='<div class="inbox-empty">No se pudieron cargar las reseñas.</div>';
      var inbM=document.getElementById('homeInboxMobile');
      if(inbM) inbM.innerHTML='<div class="inbox-empty">No se pudieron cargar las reseñas.</div>';
    });
}

var INBOX_COLORS=['#5A67F2','#F97316','#22C55E','#EC4899','#14B8A6','#8B5CF6','#F59E0B','#EF4444'];

function renderHomeInbox(data){
  renderInboxCard('homeInbox',data);
  renderInboxCard('homeInboxMobile',data);
}
function renderInboxCard(id,data){
  var el=document.getElementById(id); if(!el) return;
  var reviews=(data&&data.reviews)||[];
  var summary=(data&&data.summary)||{};
  var avg=parseFloat(summary.average||'0');
  var total=parseInt(summary.total||'0',10);
  if(!reviews.length){
    el.innerHTML='<div class="inbox-empty" style="padding:32px 20px">'
      +'<div style="font-size:28px;margin-bottom:8px">💬</div>'
      +'<div style="font-size:13px;font-weight:600;color:var(--soft);margin-bottom:4px">Sin reseñas aún</div>'
      +'<div style="font-size:12px;color:var(--dim)">Tus clientes podrán dejarte opiniones pronto.</div>'
      +'</div>';
    return;
  }
  var avgBar=avg?'<div style="display:flex;align-items:center;gap:8px;padding:14px 18px;border-bottom:1px solid var(--border-inner)">'
    +'<span style="font-size:22px;font-weight:800;color:var(--text);letter-spacing:-.04em">'+avg.toFixed(1)+'</span>'
    +'<div>'
    +'<div style="font-size:12px;color:#F59E0B;letter-spacing:1px">'+renderStars(avg)+'</div>'
    +'<div style="font-size:10.5px;color:var(--dim);margin-top:1px">'+total+' reseña'+(total!==1?'s':'')+'</div>'
    +'</div>'
    +'</div>':'';
  var items=reviews.slice(0,4).map(function(r,i){
    var name=r.google_name||r.client_name||'Cliente';
    var initLetter=(name.trim().charAt(0)||'?').toUpperCase();
    var color=INBOX_COLORS[i%INBOX_COLORS.length];
    var stars='';for(var s=1;s<=5;s++) stars+='<span style="color:'+(s<=(r.rating||0)?'#F59E0B':'var(--dim)')+'">★</span>';
    var date='';
    if(r.created_at){try{date=new Date(r.created_at).toLocaleDateString('es-CL',{day:'numeric',month:'short'});}catch(e){}}
    var avHtml=r.google_avatar_url
      ?'<img src="'+escH(r.google_avatar_url)+'" class="inbox-av" style="object-fit:cover" referrerpolicy="no-referrer">'
      :'<div class="inbox-av" style="background:'+color+'">'+escH(initLetter)+'</div>';
    return '<div class="inbox-item">'
      +avHtml
      +'<div class="inbox-body">'
      +'<div class="inbox-name-row">'
      +'<span class="inbox-name">'+escH(name)+'</span>'
      +(date?'<span class="inbox-date">'+escH(date)+'</span>':'')
      +'</div>'
      +'<div class="inbox-stars">'+stars+'</div>'
      +(r.comment?'<div class="inbox-preview">'+escH(r.comment)+'</div>':'')
      +'</div>'
      +'</div>';
  }).join('');
  el.innerHTML=avgBar+items;
}

function updateProfileRating(data){
  var el=document.getElementById('prRating');
  if(!el) return;
  var summary=data&&data.summary?data.summary:{};
  var avg=parseFloat(summary.average||'0');
  var total=parseInt(summary.total||'0',10);
  if(!total||!avg) return;
  el.style.display='flex';
  el.innerHTML=renderStars(avg)
    +'<span style="font-weight:700;color:var(--text)">'+avg.toFixed(1)+'</span>'
    +'<span class="pr-rating-count">('+total+' reseña'+(total!==1?'s':'')+')</span>';
}

function renderReviewsTab(data){
  var el=document.getElementById('reviewsContent'); if(!el) return;
  var summary=(data&&data.summary)||{};
  var reviews=(data&&data.reviews)||[];
  var avg=parseFloat(summary.average||'0');
  var total=parseInt(summary.total||'0',10);

  if(!total){
    el.innerHTML='<div class="bk-empty" style="margin-top:8px">Aún no hay reseñas.<br>¡Los clientes podrán dejarte su opinión pronto!</div>';
    return;
  }

  var dist=summary.distribution||{};
  var bars=[5,4,3,2,1].map(function(star){
    var count=parseInt(dist[star]||'0',10);
    var pct=total>0?Math.round((count/total)*100):0;
    return '<div class="rv-bar-row">'
      +'<span class="rv-bar-lbl">'+star+'★</span>'
      +'<div class="rv-bar-track"><div class="rv-bar-fill" style="width:'+pct+'%"></div></div>'
      +'<span class="rv-bar-count">'+count+'</span>'
      +'</div>';
  }).join('');

  var summaryHtml='<div class="rv-layout">'
    +'<div class="rv-summary">'
    +'<div class="rv-avg-big">'+avg.toFixed(1)+'</div>'
    +'<div class="rv-stars-big">'+renderStars(avg)+'</div>'
    +'<div class="rv-total">'+total+' reseña'+(total!==1?'s':'')+'</div>'
    +'</div>'
    +'<div class="rv-bars">'+bars+'</div>'
    +'</div>';

  var cards=reviews.map(function(r){
    var stars='';
    for(var i=1;i<=5;i++) stars+='<span style="color:'+(i<=(r.rating||0)?'#F59E0B':'var(--dim)')+'">★</span>';
    var date='';
    if(r.created_at){
      try{ date=new Date(r.created_at).toLocaleDateString('es-CL',{day:'numeric',month:'short',year:'numeric'}); }catch(e){}
    }
    var displayName=r.google_name||r.client_name||'Cliente';
    var avatarHtml=r.google_avatar_url
      ?'<img src="'+escH(r.google_avatar_url)+'" style="width:36px;height:36px;border-radius:50%;object-fit:cover;flex-shrink:0" referrerpolicy="no-referrer">'
      :'';
    return '<div class="rv-card">'
      +'<div class="rv-card-top">'
      +(avatarHtml?'<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">'+avatarHtml
        +'<div><div class="rv-card-stars" style="margin-bottom:1px">'+stars+'</div>'
        +'<div class="rv-card-meta"><span class="rv-name">'+escH(displayName)+'</span>'
        +(date?'<span class="rv-date"> · '+escH(date)+'</span>':'')+'</div></div></div>'
        :'<div class="rv-card-stars">'+stars+'</div>'
        +'<div class="rv-card-meta"><span class="rv-name">'+escH(displayName)+'</span>'
        +(date?'<span class="rv-date"> · '+escH(date)+'</span>':'')+'</div>')
      +'</div>'
      +(r.comment?'<div class="rv-comment">'+escH(r.comment)+'</div>':'')
      +'</div>';
  }).join('');

  el.innerHTML=summaryHtml
    +(cards?'<div class="sec-hdr" style="margin-top:20px"><span class="sec-title">Últimas reseñas</span><span class="sec-sub" style="margin-top:2px">Opiniones de nuestros clientes</span></div>'+cards:'');
}

// ── Review panel ─────────────────────────────────────────────────────────────
var rvRating=0;

function handleGoogleSignIn(response){
  if(!response||!response.credential) return;
  fetch('/api/public/'+SLUG+'/auth',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({googleCredential:response.credential})
  })
  .then(function(r){return r.json();})
  .then(function(d){
    if(!d.ok||!d.token) return; // auth falló, gate queda visible
    try{
      var parts=response.credential.split('.');
      var pl=JSON.parse(atob(parts[1].replace(/-/g,'+').replace(/_/g,'/')));
      portalGoogleUser={name:pl.name||'',email:pl.email||'',picture:pl.picture||'',credential:response.credential};
    }catch(e){ portalGoogleUser={name:d.name||'',email:d.email||'',picture:'',credential:null}; }
    portalToken=d.token;
    try{
      localStorage.setItem(PGU_KEY,JSON.stringify({name:portalGoogleUser.name,email:portalGoogleUser.email,picture:portalGoogleUser.picture}));
      localStorage.setItem(PGT_KEY,d.token);
    }catch(e){}
    hideGate();
    renderUserChip(portalGoogleUser);
  })
  .catch(function(){}); // error de red — gate queda visible
}

function openReviewPanel(){
  rvRating=0;
  renderReviewForm();
  openPanel('reviewPanel');
}

function renderReviewForm(err){
  var body=document.getElementById('reviewPanelBody'); if(!body) return;
  var starsHtml=[1,2,3,4,5].map(function(n){
    return '<button class="rv-star-btn" type="button" data-rv-star="'+n
      +'" style="font-size:34px;background:none;border:none;cursor:pointer;padding:0 2px;color:'
      +(n<=rvRating?'#F59E0B':'#D1D5DB')+'">★</button>';
  }).join('');

  var authHtml='';
  if(GOOGLE_CLIENT_ID){
    if(portalGoogleUser){
      authHtml='<div style="display:flex;align-items:center;gap:10px;'
        +'background:var(--bg);border:1px solid var(--border);border-radius:12px;'
        +'padding:10px 14px;margin-bottom:20px">'
        +(portalGoogleUser.picture
          ?'<img src="'+escH(portalGoogleUser.picture)+'" style="width:34px;height:34px;border-radius:50%;object-fit:cover" referrerpolicy="no-referrer">'
          :'<div style="width:34px;height:34px;border-radius:50%;background:var(--primary);display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:#fff">'+escH((portalGoogleUser.name||'?').charAt(0).toUpperCase())+'</div>')
        +'<div style="flex:1;min-width:0">'
        +'<div style="font-size:13px;font-weight:600;color:var(--text)">'+escH(portalGoogleUser.name)+'</div>'
        +'<div style="font-size:11.5px;color:var(--soft);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+escH(portalGoogleUser.email)+'</div>'
        +'</div>'
        +'<button type="button" id="rvGoogleOut" style="font-size:11px;color:var(--soft);background:none;border:none;cursor:pointer">Salir</button>'
        +'</div>';
    } else {
      authHtml='<div style="margin-bottom:20px">'
        +'<div id="rvGoogleBtn"></div>'
        +'<div style="text-align:center;font-size:11.5px;color:var(--dim);margin-top:8px">o dejá tu nombre abajo</div>'
        +'</div>';
    }
  }

  var nameField=portalGoogleUser?''
    :'<div class="bk-inp-wrap"><div class="bk-inp-lbl">Tu nombre (opcional)</div>'
    +'<input class="bk-inp" id="rvName" type="text" placeholder="¿Cómo te llamás?" autocomplete="name"></div>';

  body.innerHTML='<div style="padding:24px 20px">'
    +authHtml
    +'<div style="font-size:13px;font-weight:600;color:var(--soft);margin-bottom:14px">¿Cómo calificarías tu experiencia?</div>'
    +'<div style="display:flex;gap:2px;margin-bottom:22px">'+starsHtml+'</div>'
    +nameField
    +'<div class="bk-inp-wrap"><div class="bk-inp-lbl">Comentario (opcional)</div>'
    +'<textarea class="bk-inp" id="rvComment" rows="3" placeholder="Contanos tu experiencia…" style="resize:none;font-family:inherit"></textarea></div>'
    +(err?'<div class="bk-inp-err" style="margin-bottom:10px">'+escH(err)+'</div>':'')
    +'<button class="btn-primary" type="button" id="rvSubmit" style="width:100%;font-size:14px;margin-top:4px">Enviar reseña</button>'
    +'</div>';

  // render Google button if needed
  if(GOOGLE_CLIENT_ID && !portalGoogleUser){
    var gbEl=document.getElementById('rvGoogleBtn');
    if(gbEl && window.google && window.google.accounts){
      window.google.accounts.id.renderButton(gbEl,{
        type:'standard',theme:'outline',size:'large',
        text:'signin_with',shape:'rectangular',width:280
      });
    }
  }

  body.querySelectorAll('[data-rv-star]').forEach(function(btn){
    btn.addEventListener('click',function(){
      rvRating=parseInt(btn.getAttribute('data-rv-star')||'0',10);
      renderReviewForm();
    });
  });
  var out=document.getElementById('rvGoogleOut');
  if(out) out.addEventListener('click',function(){portalGoogleUser=null;renderReviewForm();});
  var sub=document.getElementById('rvSubmit');
  if(sub) sub.addEventListener('click',submitReview);
}

function submitReview(){
  if(!rvRating){ renderReviewForm('Elegí una calificación.'); return; }
  var nameEl=document.getElementById('rvName');
  var name=nameEl?(nameEl.value||'').trim():'';
  var commentEl=document.getElementById('rvComment');
  var comment=commentEl?(commentEl.value||'').trim():'';
  var btn=document.getElementById('rvSubmit');
  if(btn){btn.textContent='Enviando…';btn.disabled=true;}
  pfetch('/api/public/'+SLUG+'/reviews',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({
      rating:rvRating,
      clientName:name||null,
      comment:comment||null,
      googleCredential:portalGoogleUser?portalGoogleUser.credential:null
    })
  })
  .then(function(r){return r.json();})
  .then(function(d){
    if(d.ok){
      var body=document.getElementById('reviewPanelBody'); if(!body) return;
      body.innerHTML='<div class="bk-success">'
        +'<div class="bk-success-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></div>'
        +'<div class="bk-success-title">¡Gracias por tu reseña!</div>'
        +'<div class="bk-success-sub">Tu opinión ayuda a otros clientes.</div>'
        +'<button class="btn-primary" type="button" id="rvDone" style="width:100%;margin-top:28px">Listo</button>'
        +'</div>';
      var done=document.getElementById('rvDone');
      if(done) done.addEventListener('click',function(){
        closePanel('reviewPanel');
        reviewsLoaded=false;
        ensureReviews();
      });
    } else {
      renderReviewForm(d.message||'Error al enviar. Intentá de nuevo.');
    }
  })
  .catch(function(){ renderReviewForm('Error de conexión. Intentá de nuevo.'); });
}

// ── init ─────────────────────────────────────────────────────────────────────
(function init(){
  loadServices();
  loadProviders();
  loadCalendar();
  ensureReviews();

  if(!GOOGLE_CLIENT_ID){
    // sin Google configurado — portal abierto sin login
    hideGate();
    return;
  }

  // intentar restaurar sesión desde localStorage
  try{
    var stored=localStorage.getItem(PGU_KEY);
    var storedToken=localStorage.getItem(PGT_KEY);
    if(stored && storedToken){
      var parsed=JSON.parse(stored);
      if(parsed && parsed.email){
        portalGoogleUser={name:parsed.name||'',email:parsed.email,picture:parsed.picture||'',credential:null};
        portalToken=storedToken;
        hideGate();
        renderUserChip(portalGoogleUser);
        // renovar credential en background (token JWT caduca en 7d; GIS lo puede refrescar silenciosamente)
        function tryInitSilent(){
          if(window.google && window.google.accounts){
            window.google.accounts.id.initialize({client_id:GOOGLE_CLIENT_ID,callback:handleGoogleSignIn,auto_select:true});
            window.google.accounts.id.prompt(function(n){void n;});
          } else { setTimeout(tryInitSilent,400); }
        }
        tryInitSilent();
        return;
      }
    }
  }catch(e){}

  // sin sesión guardada — mostrar gate
  showGate();
})();
`;
}
