type ProductData = { id: string|number; name: string; price: number; description?: string|null };

export function portalScripts(
  slug: string,
  _bizName: string,
  userId: number,
  _modules: unknown[],
  products: ProductData[],
  _bizInfo: unknown,
  _initials: string
): string {
  const safeProducts = products.map(p => ({
    id:          String(p.id),
    name:        p.name,
    price:       Number(p.price || 0),
    description: p.description || "",
  }));

  return `
var SLUG=${JSON.stringify(slug)};
var USER_ID=${JSON.stringify(userId)};
var PRODUCTS=${JSON.stringify(safeProducts)};
var TABS=['chat','reservas','nosotros','cotizar','resenas'];
var svcsLoaded=false;
var svcsCache=[];
var QCart={};
var reviewsLoaded=false;

// ── helpers ───────────────────────────────────────────────────────────────────
function escH(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function fmtPrice(n){if(n===0)return 'Gratis';return '$'+Number(n||0).toLocaleString('es-CL');}

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
var bk={date:null,svc:null,time:null,step:null};

function setBkHeader(title,showBack){
  var t=document.getElementById('bkTitle');
  var b=document.getElementById('bkBack');
  if(t) t.textContent=title;
  if(b) b.style.display=showBack?'flex':'none';
}

// Entry: click on a calendar day
function openBookingFromDay(dateStr){
  bk.date=dateStr; bk.svc=null; bk.time=null; bk.step='svc';
  openPanel('bookingPanel');
  renderBkSvcStep();
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
  fetch('/api/public/'+SLUG+'/bookings',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({
      serviceId:bk.svc?bk.svc.id:null,
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
    if(bk.step==='time') renderBkSvcStep();
    else if(bk.step==='form') renderBkTimeStep();
    else closePanel('bookingPanel');
    return;
  }

  // booking panel step interactions
  var svcItem=t.closest('[data-bk-svc-i]');
  if(svcItem){
    var idx=parseInt(svcItem.getAttribute('data-bk-svc-i')||'0',10);
    bk.svc=svcsCache[idx]||null;
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
  if(t.closest('#slideOverlay')){ closePanel('bookingPanel'); closePanel('quotePanel'); return; }
});

// ── services ──────────────────────────────────────────────────────────────────
var CARD_PALETTES=['#5A67F2','#F97316','#22C55E','#EC4899','#14B8A6','#8B5CF6'];

function ensureServices(){
  if(svcsLoaded){applyServices(svcsCache);return;}
  loadServices();
}

function loadServices(){
  fetch('/api/public/'+SLUG+'/booking-services')
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
  renderHomeGrid(svcs);
  renderSvcRows('svcList', svcs);
  renderSvcRows('mobileServiceList', svcs);
}

// Desktop home — proj-grid cards
function renderHomeGrid(svcs){
  var el=document.getElementById('homeServiceGrid');
  if(!el) return;
  if(!svcs.length){
    el.innerHTML='<div style="grid-column:1/-1;text-align:center;padding:28px 0;color:var(--dim);font-size:13.5px">No hay servicios configurados aún.</div>';
    return;
  }
  var html='';
  svcs.slice(0,4).forEach(function(s,i){
    var bg=s.color&&/^#[0-9a-fA-F]{6}$/.test(s.color)?s.color:CARD_PALETTES[i%CARD_PALETTES.length];
    var price=s.price!=null?fmtPrice(Number(s.price)):'Consultar';
    var dur=s.duration_minutes?s.duration_minutes+' min':'';
    html+='<div class="proj-card" data-action="reservas">'
      +'<div class="proj-card-top" style="background:'+escH(bg)+'">'
      +(dur?'<span class="proj-card-top-badge">'+escH(dur)+'</span>':'<span></span>')
      +'<span class="proj-card-price">'+escH(price)+'</span>'
      +'</div>'
      +'<div class="proj-card-body">'
      +'<div class="proj-card-name">'+escH(s.name)+'</div>'
      +'<div class="proj-card-meta">'
      +(dur?'<span class="proj-tag" style="background:var(--primary-dim);color:var(--primary)">'+escH(dur)+'</span>':'')
      +(Number(s.price)===0?'<span class="proj-tag" style="background:var(--green-dim);color:var(--green)">Gratis</span>':'')
      +'</div>'
      +'<div class="proj-card-footer"><button class="proj-btn" type="button" tabindex="-1">Ver disponibilidad</button></div>'
      +'</div></div>';
  });
  el.innerHTML=html;
}

// Row list (reservas tab + mobile home)
function renderSvcRows(id,svcs){
  var el=document.getElementById(id);if(!el) return;
  if(!svcs.length){
    el.innerHTML='<div class="svc-empty">No hay servicios configurados aún.</div>';
    return;
  }
  var html='';
  svcs.forEach(function(s){
    var color=s.color&&/^#[0-9a-fA-F]{6}$/.test(s.color)?s.color:'#5A67F2';
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
  fetch('/api/public/'+SLUG+'/slots')
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
    fetch('/shop/'+SLUG+'/quotes/submit',{method:'POST',headers:{'Content-Type':'application/json'},
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
function renderStars(avg,size){
  var full=Math.floor(avg);
  var empty=5-Math.round(avg);
  if(empty<0) empty=0;
  var html='';
  for(var i=0;i<Math.round(avg);i++) html+='<span style="color:#F59E0B">★</span>';
  for(var i=0;i<empty;i++) html+='<span style="color:var(--dim)">★</span>';
  return html;
}

function ensureReviews(){
  if(reviewsLoaded) return;
  reviewsLoaded=true;
  fetch('/public/reviews/'+USER_ID)
    .then(function(r){return r.json();})
    .then(function(data){
      renderReviewsTab(data);
      updateProfileRating(data);
    })
    .catch(function(){
      var el=document.getElementById('reviewsContent');
      if(el) el.innerHTML='<div class="bk-empty">No se pudieron cargar las reseñas.</div>';
    });
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
      try{
        date=new Date(r.created_at).toLocaleDateString('es-CL',{day:'numeric',month:'short',year:'numeric'});
      }catch(e){}
    }
    return '<div class="rv-card">'
      +'<div class="rv-card-top">'
      +'<div class="rv-card-stars">'+stars+'</div>'
      +'<div class="rv-card-meta">'
      +(r.client_name?'<span class="rv-name">'+escH(r.client_name)+'</span>':'<span class="rv-name">Cliente</span>')
      +(date?'<span class="rv-date"> · '+escH(date)+'</span>':'')
      +'</div>'
      +'</div>'
      +(r.comment?'<div class="rv-comment">'+escH(r.comment)+'</div>':'')
      +'</div>';
  }).join('');

  el.innerHTML=summaryHtml
    +(cards?'<div class="sec-hdr" style="margin-top:20px"><span class="sec-title">Últimas reseñas</span><span class="sec-sub" style="margin-top:2px">Opiniones de nuestros clientes</span></div>'+cards:'');
}

// ── init ─────────────────────────────────────────────────────────────────────
(function init(){
  loadServices();
  renderHomeProducts();
  loadCalendar();
  ensureReviews();
})();
`;
}
