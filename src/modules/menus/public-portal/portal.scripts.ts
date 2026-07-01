export function portalScripts(
  slug: string,
  bizName: string,
  userId: number,
  _modules: unknown[],
  productsRenderedCount: number,
  productCount: number,
  _bizInfo: unknown,
  initials: string,
): string {
  const safeBizName   = bizName.replace(/`/g, "'");
  const safeInitials  = initials.replace(/`/g, "'");

  return `
var SLUG=${JSON.stringify(slug)};
var USER_ID=${JSON.stringify(userId)};
var BIZ_NAME=${JSON.stringify(safeBizName)};
var BIZ_INITIALS=${JSON.stringify(safeInitials)};
var TABS=['chat','reservas','nosotros','cotizar','resenas'];
var svcsLoaded=false;
var svcsCache=[];
var svcsTotal=0;
var QCart={};
var reviewsLoaded=false;
var rvPage=1;
var prdOffset=${productsRenderedCount};
var prdTotal=${productCount};
var qpProds=[];
var qpOffset=0;
var qpTotalProds=0;
var qpLoadingProds=false;
var rvTotal=0;

// ── helpers ───────────────────────────────────────────────────────────────────
function escH(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function fmtPrice(n){if(n===0)return 'Gratis';return '$'+Number(n||0).toLocaleString('es-CL');}

// ── mobile drawer ─────────────────────────────────────────────────────────────
function openMobileDrawer(){
  var dr=document.getElementById('mobileDrawer');
  var ov=document.getElementById('slideOverlay');
  if(dr) dr.classList.add('open');
  if(ov) ov.classList.add('open');
}
function closeMobileDrawer(){
  var dr=document.getElementById('mobileDrawer');
  if(dr) dr.classList.remove('open');
  var anyPanel=document.querySelector('.slide-panel.open');
  if(!anyPanel){var ov=document.getElementById('slideOverlay');if(ov) ov.classList.remove('open');}
}
(function(){
  var btn=document.getElementById('mobileMenuBtn');
  if(btn) btn.addEventListener('click',openMobileDrawer);
  var cls=document.getElementById('mobileDrawerClose');
  if(cls) cls.addEventListener('click',closeMobileDrawer);
})();

// ── tab switching ─────────────────────────────────────────────────────────────
function setActive(t){
  document.querySelectorAll('.bn-item,.ir-btn,.cn-tab,.mdr-item').forEach(function(el){
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
  if(t==='cotizar'){var b=document.getElementById('cotizarBody');if(b&&!b.innerHTML.trim())renderQPStep1();}
}

function openGalleryFolder(fid){
  showTab('nosotros');
  var fbody=document.getElementById('folder-body-'+fid);
  if(!fbody) return;
  var fitems=Array.from(fbody.querySelectorAll('[data-gal-idx]'));
  if(!fitems.length) return;
  galPanelTitle=fbody.getAttribute('data-folder-name')||'';
  galItems=fitems;
  galCurrentIdx=0;
  renderGalPanel();
  openPanel('galPanel');
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
function openQuotePanel(){
  showTab('cotizar');
  var b=document.getElementById('cotizarBody');
  if(b&&!b.innerHTML.trim()) renderQPStep1();
}

// ── Booking flow state ────────────────────────────────────────────────────────
var bk={date:null,svc:null,time:null,step:null,provider:null,entry:null};
var bkCalYear=new Date().getFullYear();
var bkCalMonth=new Date().getMonth();
var bkProvSlots={}; // slots filtrados por el profesional elegido en la sesión actual

// ── Providers (team members) ──────────────────────────────────────────────────
var providersCache=[];
var providersLoaded=false;

// Returns providers that have availability on bk.date's weekday.
// Providers without a custom schedule (custom_weekdays=[]) use the global calendar → always included.
function getAvailableProviders(){
  if(!bk.date||!providersCache.length) return providersCache;
  var jsDay=new Date(bk.date+'T00:00:00').getDay();
  var weekday=jsDay===0?7:jsDay; // 1=Mon … 7=Sun, matches calendar_availability.weekday
  return providersCache.filter(function(p){
    if(!p.custom_weekdays||!p.custom_weekdays.length) return true;
    return p.custom_weekdays.indexOf(weekday)!==-1;
  });
}

function loadProviders(){
  if(providersLoaded) return;
  fetch('/api/public/'+SLUG+'/providers')
    .then(function(r){return r.json();})
    .then(function(d){
      providersLoaded=true;
      providersCache=Array.isArray(d.providers)?d.providers:[];
    })
    .catch(function(){providersLoaded=true;providersCache=[];});
}

// Carga los slots de un profesional específico para la sesión de reserva actual
function loadBkProvSlots(providerId,cb){
  var body=document.getElementById('bkBody');
  if(body) body.innerHTML='<div class="bk-scroll"><div class="cal-loading"><div class="spinner"></div>Cargando horarios…</div></div>';
  fetch('/api/public/'+SLUG+'/slots?providerId='+encodeURIComponent(providerId))
    .then(function(r){return r.json();})
    .then(function(data){
      bkProvSlots={};
      if(data&&Array.isArray(data.slots)){
        data.slots.forEach(function(s){ if(s.date&&s.times&&s.times.length) bkProvSlots[s.date]=s.times; });
      }
      cb();
    })
    .catch(function(){bkProvSlots={};cb();});
}

function setBkHeader(title,showBack){
  var t=document.getElementById('bkTitle');
  var b=document.getElementById('bkBack');
  if(t) t.textContent=title;
  if(b) b.style.display=showBack?'flex':'none';
}

// Entry: click on a calendar day (time unknown)
function openBookingFromDay(dateStr){
  hideCalTip();
  bk.date=dateStr; bk.time=null; bk.provider=null; bk.svc=null; bk.entry='calendar';
  openPanel('bookingPanel');
  renderBkSvcStep();
}

// Entry: click on a time slot chip (day + time known)
function openBookingFromSlot(dateStr,time){
  hideCalTip();
  bk.date=dateStr; bk.time=time; bk.provider=null; bk.svc=null; bk.entry='calendar';
  openPanel('bookingPanel');
  renderBkSvcStep();
}

// Entry: click "Reservar" from a service card
function openBookingFromService(svc){
  if(!svc) return;
  bk.svc=svc; bk.date=null; bk.time=null; bk.provider=null; bk.entry='service';
  bkCalYear=calYear; bkCalMonth=calMonth;
  ensureServices();
  if(!calLoaded) loadCalendar();
  closePanel('svcDetailPanel');
  renderBkDateStep();
  openPanel('bookingPanel');
}

function renderBkDateStep(){
  bk.step='date';
  setBkHeader(bk.svc?escH(bk.svc.name):'Selecciona una fecha',true);
  var body=document.getElementById('bkBody'); if(!body) return;
  if(!calLoaded){
    body.innerHTML='<div class="bk-scroll"><div class="cal-loading"><div class="spinner"></div>Cargando calendario…</div></div>';
    setTimeout(function(){if(bk.step==='date') renderBkDateStep();},1200);
    return;
  }
  var today=new Date();
  var todayStr=today.getFullYear()+'-'+pad2(today.getMonth()+1)+'-'+pad2(today.getDate());
  var year=bkCalYear; var month=bkCalMonth;
  var MONTHS_LBL=['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  var firstDay=new Date(year,month,1);
  var daysInMonth=new Date(year,month+1,0).getDate();
  var startDow=firstDay.getDay();
  var dayNames=DAYS_SHORT.map(function(d){return '<div class="cal-day-name">'+d+'</div>';}).join('');
  var cells='';
  for(var i=0;i<startDow;i++) cells+='<div class="cal-cell cal-empty"></div>';
  for(var d=1;d<=daysInMonth;d++){
    var dStr=year+'-'+pad2(month+1)+'-'+pad2(d);
    var dd=new Date(year,month,d);
    var isPast=dd<new Date(today.getFullYear(),today.getMonth(),today.getDate());
    var isToday=dStr===todayStr;
    var hasSlots=!!(calSlots[dStr]&&calSlots[dStr].length);
    var cls='cal-cell';
    if(isToday)       cls+=' cal-today';
    else if(isPast)   cls+=' cal-past';
    else if(hasSlots) cls+=(calSlots[dStr].length>calMaxSlots*0.5?' cal-avail-good':' cal-avail-few');
    else              cls+=' cal-taken';
    cells+='<div class="'+cls+'" data-bk-date="'+dStr+'">'+d+'</div>';
  }
  var isPrevDisabled=(year===today.getFullYear()&&month<=today.getMonth());
  var navArrowL='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="15 18 9 12 15 6"/></svg>';
  var navArrowR='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="9 6 15 12 9 18"/></svg>';
  body.innerHTML='<div class="bk-scroll">'
    +'<div class="bk-cal-nav-row">'
    +'<button class="bk-cal-nav-btn" id="bkDatePrev"'+(isPrevDisabled?' disabled':'')+'>'+navArrowL+'</button>'
    +'<span class="bk-cal-month-lbl">'+MONTHS_LBL[month]+' '+year+'</span>'
    +'<button class="bk-cal-nav-btn" id="bkDateNext">'+navArrowR+'</button>'
    +'</div>'
    +'<div class="cal-grid" style="margin-bottom:14px">'+dayNames+cells+'</div>'
    +'<div class="cal-legend">'
    +'<span class="cal-leg-item"><span class="cal-leg-dot" style="background:#16A34A"></span>Disponible</span>'
    +'<span class="cal-leg-item"><span class="cal-leg-dot" style="background:#EA580C"></span>Pocas horas</span>'
    +'<span class="cal-leg-item"><span class="cal-leg-dot" style="background:var(--border)"></span>Sin horarios</span>'
    +'</div>'
    +'</div>';
  body.querySelectorAll('.cal-cell[data-bk-date]').forEach(function(cell){
    if(!cell.classList.contains('cal-avail-good')&&!cell.classList.contains('cal-avail-few')&&!cell.classList.contains('cal-today')) return;
    cell.style.cursor='pointer';
    cell.addEventListener('click',function(){
      var dateStr=cell.getAttribute('data-bk-date');
      if(!dateStr||!(calSlots[dateStr]&&calSlots[dateStr].length)) return;
      bk.date=dateStr; bk.time=null;
      if(getAvailableProviders().length>0) renderBkProviderStep();
      else renderBkTimeStep();
    });
  });
  var prev=body.querySelector('#bkDatePrev');
  var next=body.querySelector('#bkDateNext');
  if(prev) prev.addEventListener('click',function(){
    if(prev.hasAttribute('disabled')) return;
    bkCalMonth--;if(bkCalMonth<0){bkCalMonth=11;bkCalYear--;}
    renderBkDateStep();
  });
  if(next) next.addEventListener('click',function(){
    bkCalMonth++;if(bkCalMonth>11){bkCalMonth=0;bkCalYear++;}
    renderBkDateStep();
  });
}

function renderBkProviderStep(){
  bk.step='provider';
  setBkHeader('Selecciona un profesional',true);
  var body=document.getElementById('bkBody'); if(!body) return;
  var label=fmtDateLabel(bk.date);
  var calIco='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:12px;height:12px"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/></svg>';
  var dateBadge='<div class="bk-date-badge">'+calIco+escH(label)+'</div>';
  var svcBadge=bk.svc?'<div class="bk-date-badge" style="background:var(--bg);border:1px solid var(--border);color:var(--soft)">'+escH(bk.svc.name)+'</div>':'';
  var availProviders=getAvailableProviders();
  var rows=availProviders.map(function(p,i){
    var initials=p.avatar_initials||(p.name.trim().charAt(0)||'?').toUpperCase();
    var color=p.color&&/^#[0-9a-fA-F]{6}$/.test(p.color)?p.color:CARD_PALETTES[i%CARD_PALETTES.length];
    return '<div class="bk-svc-item" data-bk-prov-id="'+escH(p.id)+'">'
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
    +'<div class="bk-sec-title">Selecciona un profesional</div>'
    +rows+anyRow+'</div>';
}

// Generic "Reservar" → go to Reservas tab (calendar is the entry)
function openBookingPanel(){ showTab('reservas'); }

function renderBkSvcStep(){
  bk.step='svc';
  var label=bk.date?fmtDateLabel(bk.date):'Selecciona un servicio';
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
  var dateBadge=bk.date?('<div class="bk-date-badge">'
    +'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:12px;height:12px"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/></svg>'
    +escH(fmtDateLabel(bk.date))+'</div>'):'';
  body.innerHTML='<div class="bk-scroll">'+dateBadge
    +'<div class="bk-sec-title">Selecciona un servicio</div>'+rows+'</div>';
}

function renderBkTimeStep(){
  bk.step='time';
  setBkHeader(escH(bk.svc?bk.svc.name:'Horarios'),true);
  var body=document.getElementById('bkBody'); if(!body) return;
  var times=(bk.date&&(bk.provider?bkProvSlots[bk.date]:calSlots[bk.date]))||[];
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
    +'<div class="bk-sec-title">Selecciona un horario</div>'
    +'<div class="bk-times-grid">'+chips+'</div></div>';
}

function renderBkFormStep(){
  if(!bk.svc){ renderBkSvcStep(); return; }
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
      providerId:bk.provider?bk.provider.id:null,
      slot:{date:bk.date,time:bk.time},
      customer:{name:name,phone:phone,email:email}
    })
  })
  .then(function(r){return r.json();})
  .then(function(d){
    if(d.ok||d.id||d.booking_id||d.bookingId) renderBkSuccess(d.checkoutUrl||null,d.booking&&d.booking.id?d.booking.id:null);
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

function renderBkSuccess(checkoutUrl,bookingId){
  bk.step='success';
  setBkHeader('¡Confirmado!',false);
  var body=document.getElementById('bkBody'); if(!body) return;
  var subMsg=checkoutUrl
    ?'Falta un paso: completa el pago para confirmar tu hora.<br>También te enviamos el link a tu correo.'
    :'Tu cita quedó confirmada.<br>Recibirás la confirmación en tu correo.';
  var payBtn=checkoutUrl
    ?'<button class="btn-primary" type="button" id="bkPayNow" style="width:100%;margin-top:28px">Pagar ahora</button>'
    :'';
  var doneBtnClass=checkoutUrl?'btn-outline':'btn-primary';
  body.innerHTML='<div class="bk-success">'
    +'<div class="bk-success-icon">'
    +'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>'
    +'</div>'
    +'<div class="bk-success-title">¡Reserva confirmada!</div>'
    +'<div class="bk-success-sub">'+subMsg+'</div>'
    +payBtn
    +'<button class="'+doneBtnClass+'" type="button" id="bkDone" style="width:100%;margin-top:10px">Listo</button>'
    +'</div>';
  var payNow=document.getElementById('bkPayNow');
  if(payNow) payNow.addEventListener('click',function(){
    window.open(checkoutUrl,'_blank','noopener');
  });
  var done=document.getElementById('bkDone');
  if(done) done.addEventListener('click',function(){
    closePanel('bookingPanel');
    bk.svc=null;bk.date=null;bk.time=null;bk.provider=null;bk.entry=null;bkProvSlots={};
  });
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
  if(tabBtn&&(tabBtn.classList.contains('bn-item')||tabBtn.classList.contains('ir-btn')||tabBtn.classList.contains('cn-tab')||tabBtn.classList.contains('mdr-item'))){
    if(tabBtn.classList.contains('mdr-item')) closeMobileDrawer();
    var tabName=tabBtn.getAttribute('data-tab');
    showTab(tabName);
    return;
  }

  // action buttons (data-action)
  var actBtn=t.closest('[data-action]');
  if(actBtn){
    var a=actBtn.getAttribute('data-action');
    if(a==='reservas')      showTab('reservas');
    else if(a==='cotizar')  showTab('cotizar');
    else if(a==='nosotros') showTab('nosotros');
    else if(a==='productos')showTab('nosotros');
    else if(a==='resenas')  showTab('resenas');
    return;
  }

  // booking openers
  if(t.closest('[data-open-booking]')){
    openBookingPanel();
    return;
  }

  // quote opener
  if(t.closest('[data-open-quote]')){
    openQuotePanel();
    return;
  }

  // close / back booking panel
  if(t.closest('#closeBooking')){ closePanel('bookingPanel'); return; }
  if(t.closest('#bkBack')){
    if(bk.step==='svc')      closePanel('bookingPanel');
    else if(bk.step==='date') renderBkSvcStep();
    else if(bk.step==='provider'){
      if(bk.entry==='service') renderBkDateStep(); else renderBkSvcStep();
    }
    else if(bk.step==='time'){
      if(getAvailableProviders().length>0) renderBkProviderStep();
      else if(bk.entry==='service') renderBkDateStep();
      else renderBkSvcStep();
    }
    else if(bk.step==='form') renderBkTimeStep();
    else closePanel('bookingPanel');
    return;
  }

  // home service card / grid → booking
  var homeSvcCard=t.closest('[data-bk-svc-home]');
  if(homeSvcCard){
    var hidx=parseInt(homeSvcCard.getAttribute('data-bk-svc-home')||'0',10);
    openBookingFromService(svcsCache[hidx]||null);
    return;
  }

  // booking panel step interactions
  var svcItem=t.closest('[data-bk-svc-i]');
  if(svcItem){
    var idx=parseInt(svcItem.getAttribute('data-bk-svc-i')||'0',10);
    bk.svc=svcsCache[idx]||null;
    if(!bk.date){
      bk.entry='service'; bkCalYear=calYear; bkCalMonth=calMonth;
      renderBkDateStep();
    } else if(getAvailableProviders().length>0) renderBkProviderStep();
    else if(bk.time) renderBkFormStep();
    else renderBkTimeStep();
    return;
  }
  var provItem=t.closest('[data-bk-prov-id]');
  if(provItem){
    var pid=provItem.getAttribute('data-bk-prov-id')||'';
    bk.provider=providersCache.find(function(p){return p.id===pid;})||null;
    if(bk.provider) loadBkProvSlots(bk.provider.id, function(){
      // Si había un tiempo pre-seleccionado pero no está en los slots de este doctor, limpiarlo
      if(bk.time && bk.date && (!bkProvSlots[bk.date] || bkProvSlots[bk.date].indexOf(bk.time)===-1)){
        bk.time=null;
      }
      if(bk.time) renderBkFormStep(); else renderBkTimeStep();
    });
    else { if(bk.time) renderBkFormStep(); else renderBkTimeStep(); }
    return;
  }
  var provAny=t.closest('[data-bk-prov-any]');
  if(provAny){
    bk.provider=null;
    bkProvSlots={};
    if(bk.time) renderBkFormStep();
    else renderBkTimeStep();
    return;
  }
  var timeChip=t.closest('[data-bk-time]');
  if(timeChip){
    bk.time=timeChip.getAttribute('data-bk-time');
    renderBkFormStep();
    return;
  }

  if(t.closest('#closeReview')){      closePanel('reviewPanel');      return; }
  if(t.closest('#closeDayDetail')){   closePanel('dayDetailPanel');   return; }
  if(t.closest('#closeSvcDetail')){   closePanel('svcDetailPanel');   return; }
  if(t.closest('#closeProdDetail')){  closePanel('prodDetailPanel');  return; }
  if(t.closest('#closeGal')){         closePanel('galPanel');         return; }
  if(t.closest('#openReviewBtn')){ openReviewPanel(); return; }
  if(t.closest('#slideOverlay')){ closeMobileDrawer(); closePanel('bookingPanel'); closePanel('reviewPanel'); closePanel('dayDetailPanel'); closePanel('svcDetailPanel'); closePanel('prodDetailPanel'); closePanel('galPanel'); return; }

  var folderBtn=t.closest('[data-folder-id]');
  if(folderBtn){
    var fid=folderBtn.getAttribute('data-folder-id')||'';
    var fbody=document.getElementById('folder-body-'+fid);
    if(!fbody) return;
    var fitems=Array.from(fbody.querySelectorAll('[data-gal-idx]'));
    if(!fitems.length) return;
    galPanelTitle=fbody.getAttribute('data-folder-name')||'';
    galItems=fitems;
    galCurrentIdx=0;
    renderGalPanel();
    openPanel('galPanel');
    return;
  }

  var prdCard=t.closest('[data-prod-id]');
  if(prdCard){
    var jsonStr=prdCard.getAttribute('data-prod-json');
    if(jsonStr){try{var prod=JSON.parse(jsonStr);if(prod&&prod.id)openProdDetailPanel(prod);}catch(e){}}
    return;
  }

  var galItem=t.closest('[data-gal-idx]');
  if(galItem){
    // Only orphan photos (.gal-item) are clickable; folder-body items are hidden data containers
    if(galItem.closest('.gal-item')){
      openGalPanel(parseInt(galItem.getAttribute('data-gal-idx')||'0',10));
    }
    return;
  }
});

// ── services ──────────────────────────────────────────────────────────────────
var CARD_PALETTES=['#DBEAFE','#BAE6FD','#C7D2FE','#CFFAFE','#BFD7FF','#D1E8FF'];
var CARD_GRADIENTS=[
  'linear-gradient(135deg,#6366F1,#818CF8)',
  'linear-gradient(135deg,#EC4899,#F472B6)',
  'linear-gradient(135deg,#0EA5E9,#38BDF8)',
  'linear-gradient(135deg,#10B981,#34D399)',
  'linear-gradient(135deg,#F59E0B,#FCD34D)',
  'linear-gradient(135deg,#EF4444,#F87171)'
];

function ensureServices(){
  if(svcsLoaded){applyServices(svcsCache,svcsTotal);return;}
  loadServices();
}

function loadServices(){
  fetch('/api/public/'+SLUG+'/booking-services?limit=50')
    .then(function(r){return r.json();})
    .then(function(d){
      var list=Array.isArray(d)?d:Array.isArray(d.services)?d.services:[];
      var total=d.total||list.length;
      svcsLoaded=true;svcsCache=list;svcsTotal=total;
      applyServices(list,total);
    })
    .catch(function(){
      svcsLoaded=true;svcsCache=[];svcsTotal=0;
      applyServices([],0);
    });
}

function applyServices(svcs,total){
  renderSvcHomeList('homeServiceGrid', svcs.slice(0,5));
  renderSvcGrid('svcGrid', svcs);
  renderSvcRows('mobileServiceList', svcs);
  var count=total||svcs.length;
  var statEl=document.getElementById('prStatSvcs');
  if(statEl) statEl.textContent=String(count);
  var hmSvcs=document.getElementById('hmStatSvcs');
  if(hmSvcs) hmSvcs.textContent=String(count);
}

function openProdDetailPanel(prod){
  var titleEl=document.getElementById('pdpTitle');
  if(titleEl) titleEl.textContent=prod.name||'Producto';
  var hdr=document.getElementById('pdpHdr');
  if(hdr) hdr.style.borderBottom='3px solid '+(prod.color||'var(--primary)');
  var body=document.getElementById('pdpBody'); if(!body) return;

  var photos=Array.isArray(prod.photos)&&prod.photos.length>0?prod.photos:[];
  var price=prod.price&&Number(prod.price)>0?fmtPrice(Number(prod.price)):'Consultar';

  var photosHtml='';
  if(photos.length===1){
    photosHtml='<div class="pdp-photo-single"><img src="'+escH(photos[0])+'" alt="" loading="lazy"></div>';
  } else if(photos.length>1){
    photosHtml='<div class="pdp-gallery">';
    photos.forEach(function(url,i){
      photosHtml+='<img class="pdp-gallery-img'+(i===0?' pdp-gallery-main':'')+'" src="'+escH(url)+'" alt="" loading="lazy" data-pdp-img="'+i+'">';
    });
    photosHtml+='</div>';
    photosHtml+='<div class="pdp-thumbs">';
    photos.forEach(function(url,i){
      photosHtml+='<img class="pdp-thumb'+(i===0?' active':'')+'" src="'+escH(url)+'" alt="" loading="lazy" data-pdp-thumb="'+i+'">';
    });
    photosHtml+='</div>';
  } else {
    photosHtml='<div class="pdp-no-photo" style="background:'+(prod.color||'#63ACF1')+'"></div>';
  }

  var html=photosHtml
    +'<div class="sdp-hero" style="border-left:4px solid '+(prod.color||'var(--primary)')+';">'
    +'<div class="sdp-hero-name">'+escH(prod.name||'Producto')+'</div>'
    +'<div class="sdp-hero-price">'+price+'</div>'
    +'</div>';

  if(prod.description){
    html+='<div class="ddp-section">'
      +'<div class="ddp-section-lbl">Descripción</div>'
      +'<p class="sdp-desc">'+escH(prod.description)+'</p>'
      +'</div>';
  }

  body.innerHTML=html;

  if(photos.length>1){
    var mainImg=body.querySelector('.pdp-gallery-main');
    body.querySelectorAll('[data-pdp-thumb]').forEach(function(thumb){
      thumb.addEventListener('click',function(){
        var idx=parseInt(thumb.getAttribute('data-pdp-thumb')||'0',10);
        if(mainImg) mainImg.src=photos[idx];
        body.querySelectorAll('[data-pdp-thumb]').forEach(function(t2){t2.classList.remove('active');});
        thumb.classList.add('active');
      });
    });
  }

  openPanel('prodDetailPanel');
}

function openSvcDetailPanel(svc,color){
  var titleEl=document.getElementById('sdpTitle');
  if(titleEl) titleEl.textContent=svc.name||'Servicio';
  var hdr=document.getElementById('sdpHdr');
  if(hdr) hdr.style.borderBottom='3px solid '+(color||'var(--primary)');
  var body=document.getElementById('sdpBody');if(!body)return;

  var price=svc.price!=null&&Number(svc.price)>0?fmtPrice(Number(svc.price)):'Consultar';
  var dur=svc.duration_minutes?(svc.duration_minutes+' min'):'';
  var cat=escH(svc.category||svc.type||'');

  // Galería de fotos si existen
  var photos=Array.isArray(svc.photos)&&svc.photos.length>0?svc.photos:[];
  var photosHtml='';
  if(photos.length>0){
    photosHtml='<div class="sdp-photos">';
    photos.forEach(function(url){
      photosHtml+='<img class="sdp-photo" src="'+escH(url)+'" alt="" loading="lazy">';
    });
    photosHtml+='</div>';
  }

  var html=photosHtml
    +'<div class="sdp-hero" style="border-left:4px solid '+(color||'var(--primary)')+';">'
    +'<div class="sdp-hero-name">'+escH(svc.name||'Servicio')+'</div>'
    +'<div class="sdp-hero-badges">'
    +(cat?'<span class="sdp-badge sdp-badge-cat">'+cat+'</span>':'')
    +(dur?'<span class="sdp-badge sdp-badge-dur">⏱ '+dur+'</span>':'')
    +'</div>'
    +'<div class="sdp-hero-price">'+price+'</div>'
    +'</div>';

  if(svc.description){
    html+='<div class="ddp-section">'
      +'<div class="ddp-section-lbl">Descripción</div>'
      +'<p class="sdp-desc">'+escH(svc.description)+'</p>'
      +'</div>';
  }

  if(providersCache&&providersCache.length>0){
    html+='<div class="ddp-section">'
      +'<div class="ddp-section-lbl">Atiende</div>'
      +'<div class="ddp-people">';
    providersCache.forEach(function(p){
      var initials=((p.name||'?').trim().split(' ').map(function(w){return w[0]||'';}).join('').slice(0,2)).toUpperCase();
      html+='<div class="ddp-person">'
        +'<div class="ddp-avatar">'
        +(p.picture||p.avatar?'<img src="'+escH(p.picture||p.avatar)+'" alt="">':initials)
        +'</div>'
        +'<span class="ddp-person-name">'+escH(p.name||'Profesional')+'</span>'
        +'</div>';
    });
    html+='</div></div>';
  }

  html+='<div class="ddp-cta">'
    +'<button class="btn-primary ddp-book-btn" id="sdpBookBtn">Reservar</button>'
    +'</div>';

  body.innerHTML=html;
  var bookBtn=body.querySelector('#sdpBookBtn');
  if(bookBtn) bookBtn.addEventListener('click',function(){ openBookingFromService(svc); });
  openPanel('svcDetailPanel');
}

function renderSvcHomeList(id,svcs){
  var el=document.getElementById(id);if(!el) return;
  if(!svcs.length){
    el.innerHTML='<div style="padding:20px 16px;text-align:center;font-size:12px;color:var(--dim)">Sin servicios configurados aún.</div>';
    return;
  }
  var SVC_DOTS=['#3B76ED','#D97706','#22C55E','#8B5CF6','#EC4899','#14B8A6'];
  var html='';
  svcs.forEach(function(s,i){
    var dot=SVC_DOTS[i%SVC_DOTS.length];
    var price=s.price!=null&&Number(s.price)>0?fmtPrice(Number(s.price)):'Consultar';
    var cat=escH(s.category||s.type||'Servicio');
    var thumb=Array.isArray(s.photos)&&s.photos.length>0
      ?'<img class="hm-svc-thumb" src="'+escH(s.photos[0])+'" alt="" loading="lazy">'
      :'<span class="hm-svc-thumb hm-svc-thumb-dot" style="background:'+dot+'"></span>';
    html+='<div class="hm-svc-row" data-hm-svc="'+i+'">'
      +thumb
      +'<div class="hm-svc-row-body">'
      +'<div class="hm-svc-row-name">'+escH(s.name)+'</div>'
      +'<div class="hm-svc-row-cat">'+cat+'</div>'
      +'</div>'
      +'<div class="hm-svc-row-right">'
      +'<span class="hm-svc-row-price">'+price+'</span>'
      +'<svg class="hm-svc-row-arr" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="9 18 15 12 9 6"/></svg>'
      +'</div>'
      +'</div>';
  });
  el.innerHTML=html;
  var isTouch=window.matchMedia('(hover:none)').matches;
  el.querySelectorAll('.hm-svc-row').forEach(function(row){
    var idx=parseInt(row.getAttribute('data-hm-svc')||'0',10);
    var svc=svcs[idx];
    var color=SVC_DOTS[idx%SVC_DOTS.length];
    row.addEventListener('click',function(){ openSvcDetailPanel(svc,color); });
    if(!isTouch){
      row.addEventListener('mouseenter',function(){ showSvcTip(row,svc,color); });
      row.addEventListener('mouseleave',hideSvcTip);
    }
  });
}

function updateHomeDashStats(){
  // Next available slot
  var today=new Date();
  var todayStr=today.getFullYear()+'-'+pad2(today.getMonth()+1)+'-'+pad2(today.getDate());
  var dates=Object.keys(calSlots).filter(function(d){return d>=todayStr&&calSlots[d]&&calSlots[d].length>0;}).sort();
  var hmNext=document.getElementById('hmStatNext');
  if(hmNext) hmNext.textContent=dates.length?fmtDateShort(dates[0]):'—';
  var strip=document.getElementById('calNextStrip');
  if(strip&&dates.length) strip.style.display='flex';
}

function renderSvcGrid(id,svcs){
  var el=document.getElementById(id);if(!el) return;
  if(!svcs.length){
    el.innerHTML='<div class="svc-empty" style="grid-column:1/-1">No hay servicios configurados aún.</div>';
    return;
  }
  var html='';
  svcs.forEach(function(s,i){
    var color=s.color&&/^#[0-9a-fA-F]{6}$/.test(s.color)?s.color:CARD_PALETTES[i%CARD_PALETTES.length];
    var price=s.price!=null?fmtPrice(Number(s.price)):'Consultar';
    var dur=s.duration_minutes?s.duration_minutes+' min':'';
    var firstPhoto=Array.isArray(s.photos)&&s.photos.length>0?s.photos[0]:null;
    var thumbInner=firstPhoto
      ?'<img class="svc-grid-img" src="'+escH(firstPhoto)+'" alt="" loading="lazy">'
      :'<div class="svc-grid-dot" style="background:'+escH(color)+'"></div>';
    html+='<div class="svc-grid-item" data-bk-svc="'+i+'">'
      +'<div class="svc-grid-thumb">'+thumbInner+'</div>'
      +'<div class="svc-grid-info">'
      +'<div class="svc-grid-name">'+escH(s.name)+'</div>'
      +(dur?'<div class="svc-grid-dur">'+escH(dur)+'</div>':'')
      +'<div class="svc-grid-price">'+escH(price)+'</div>'
      +'</div>'
      +'</div>';
  });
  el.innerHTML=html;
  el.querySelectorAll('.svc-grid-item').forEach(function(item){
    item.addEventListener('click',function(){
      var idx=parseInt(item.getAttribute('data-bk-svc')||'0',10);
      var svc=svcsCache[idx];
      if(!svc) return;
      openBookingFromService(svc);
    });
  });
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

function renderSvcCards(id,svcs){
  var el=document.getElementById(id);if(!el) return;
  if(!svcs.length){
    el.innerHTML='<div class="svc-empty" style="grid-column:1/-1">No hay servicios configurados aún.</div>';
    return;
  }
  var html='';
  svcs.forEach(function(s,i){
    var bg=CARD_PALETTES[i%CARD_PALETTES.length];
    var price=s.price!=null?fmtPrice(Number(s.price)):'Consultar';
    var dur=s.duration_minutes?s.duration_minutes+' min':'';
    var provHtml='';
    if(providersCache.length>0){
      provHtml='<div class="svc-card-provs">';
      providersCache.slice(0,3).forEach(function(p,pi){
        var pc=p.color&&/^#[0-9a-fA-F]{6}$/.test(p.color)?p.color:CARD_PALETTES[pi%CARD_PALETTES.length];
        var ini=(p.avatar_initials||(p.name||'?').trim().charAt(0)).toUpperCase();
        provHtml+='<div class="svc-card-prov" style="background:'+pc+';color:rgba(0,0,0,.6)">'+escH(ini)+'</div>';
      });
      provHtml+='</div>';
    }
    html+='<div class="svc-proj-card" style="background:'+bg+'" data-svc-card="'+i+'">'
      +'<div class="svc-proj-top"><span class="svc-proj-price-lbl">'+escH(price)+'</span></div>'
      +'<div class="svc-proj-name">'+escH(s.name)+'</div>'
      +'<div class="svc-proj-tags">'
      +(dur?'<span class="svc-tag">'+escH(dur)+'</span>':'')
      +'</div>'
      +'<div class="svc-proj-foot">'+provHtml+'</div>'
      +'</div>';
  });
  el.innerHTML=html;
  el.querySelectorAll('.svc-proj-card').forEach(function(card){
    card.addEventListener('click',function(){ showTab('reservas'); });
  });
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

// ── product search ────────────────────────────────────────────────────────────
function filterPrd(q){
  var list=document.getElementById('prd-list');
  var empty=document.getElementById('prd-empty-search');
  if(!list) return;
  var term=(q||'').toLowerCase().trim();
  var cards=list.querySelectorAll('.prd-card');
  var visible=0;
  cards.forEach(function(c){
    var match=!term||c.getAttribute('data-name').indexOf(term)!==-1;
    c.style.display=match?'':'none';
    if(match) visible++;
  });
  if(empty) empty.style.display=visible===0?'':'none';
}

// ── nosotros: lazy load more products ─────────────────────────────────────────
function buildNosotrosPrdCard(p){
  var name=escH(p.name||'');
  var desc=p.description?escH(p.description):'';
  var price=Number(p.price||0)===0?'Consultar':'$'+Number(p.price||0).toLocaleString('es-CL');
  var color=escH(p.color||'#63ACF1');
  var firstPhoto=Array.isArray(p.photos)&&p.photos.length>0?p.photos[0]:null;
  var jsonStr=escH(JSON.stringify({id:String(p.id),name:p.name||'',price:Number(p.price||0),description:p.description||null,color:p.color||'#63ACF1',photos:Array.isArray(p.photos)?p.photos:[]}));
  var thumb=firstPhoto
    ?'<img class="prd-thumb" src="'+escH(firstPhoto)+'" alt="" loading="lazy">'
    :'<div class="prd-thumb prd-thumb-dot" style="background:'+color+'"></div>';
  return '<div class="prd-card" data-name="'+name.toLowerCase()+'" data-prod-id="'+escH(String(p.id))+'" data-prod-json="'+jsonStr+'">'
    +thumb+'<div class="prd-info"><div class="prd-name">'+name+'</div>'+(desc?'<div class="prd-desc">'+desc+'</div>':'')+'</div>'
    +'<div class="prd-price">'+price+'</div></div>';
}
function loadMorePrd(){
  if(prdOffset>=prdTotal) return;
  var btn=document.getElementById('prdLoadMoreBtn');
  if(btn){btn.textContent='Cargando...';btn.disabled=true;}
  fetch('/api/public/'+SLUG+'/booking-services?limit=20&offset='+prdOffset)
    .then(function(r){return r.json();})
    .then(function(d){
      var list=Array.isArray(d.services)?d.services:[];
      prdTotal=d.total||prdTotal;
      prdOffset+=list.length;
      var listEl=document.getElementById('prd-list');
      if(listEl){
        list.forEach(function(p){
          var div=document.createElement('div');
          div.innerHTML=buildNosotrosPrdCard(p);
          if(div.firstElementChild) listEl.appendChild(div.firstElementChild);
        });
      }
      var wrap=document.getElementById('prdLoadMoreWrap');
      if(prdOffset>=prdTotal){if(wrap)wrap.style.display='none';}
      else if(btn){btn.textContent='Cargar más';btn.disabled=false;}
    })
    .catch(function(){
      if(btn){btn.textContent='Cargar más';btn.disabled=false;}
    });
}


// ── Calendar widget ───────────────────────────────────────────────────────────
var calSlots={};      // { 'YYYY-MM-DD': ['09:00',...] }
var calMaxSlots=1;    // máximo de slots en cualquier día — para calcular "pocas horas"
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
        var mx=1;
        Object.keys(calSlots).forEach(function(d){if(calSlots[d].length>mx) mx=calSlots[d].length;});
        calMaxSlots=mx;
      }
      renderAllCals();
      renderUpcomingSlots();
    })
    .catch(function(){calLoaded=true;renderAllCals();renderUpcomingSlots();});
}

function renderAllCals(){
  renderCalWidget('calHome');
  renderReservasDash();
  updateProfileNextSlot();
  updateHomeDashStats();
}

// ── Reservas Dashboard ────────────────────────────────────────────────────────
var dashMonthOffset=0; // 0 = current month, 1 = next, etc.
var dashSelectedDate=null;

function renderReservasDash(){
  var today=new Date();
  var todayStr=today.getFullYear()+'-'+pad2(today.getMonth()+1)+'-'+pad2(today.getDate());

  // Target month
  var target=new Date(today.getFullYear(),today.getMonth()+dashMonthOffset,1);
  var tYear=target.getFullYear();
  var tMonth=target.getMonth();
  var tMonthStr=tYear+'-'+pad2(tMonth+1);

  // Stats — current displayed month
  var availDatesMonth=Object.keys(calSlots).filter(function(d){
    return d>=todayStr&&calSlots[d]&&calSlots[d].length>0&&d.slice(0,7)===tMonthStr;
  }).sort();
  var totalSlotsMonth=availDatesMonth.reduce(function(acc,d){return acc+(calSlots[d]?calSlots[d].length:0);},0);
  var allFuture=Object.keys(calSlots).filter(function(d){return d>=todayStr&&calSlots[d]&&calSlots[d].length>0;}).sort();
  var nextDate=allFuture[0]||null;

  var el=document.getElementById('rstatDays');
  if(el) el.textContent=String(availDatesMonth.length);
  el=document.getElementById('rstatSlots');
  if(el) el.textContent=String(totalSlotsMonth);
  el=document.getElementById('rstatNext');
  if(el) el.textContent=nextDate?fmtDateShort(nextDate):'—';

  // Month label
  var labelEl=document.getElementById('rdashMonthLbl');
  if(labelEl) labelEl.textContent=MONTHS[tMonth]+' '+tYear;

  // Calendar grid
  renderMonthCal(today,todayStr,tYear,tMonth);

  // Prev/next nav
  var prev=document.getElementById('rdashPrev');
  var next=document.getElementById('rdashNext');
  if(prev){
    prev.disabled=(dashMonthOffset<=0);
    prev.onclick=function(){if(dashMonthOffset>0){dashMonthOffset--;dashSelectedDate=null;renderReservasDash();}};
  }
  if(next){
    next.onclick=function(){dashMonthOffset++;dashSelectedDate=null;renderReservasDash();};
  }

  hideSlots();
}

function renderMonthCal(today,todayStr,tYear,tMonth){
  var el=document.getElementById('monthCal');
  if(!el) return;

  var firstDay=new Date(tYear,tMonth,1);
  var daysInMonth=new Date(tYear,tMonth+1,0).getDate();
  var startDow=firstDay.getDay(); // 0=Sun, same as renderCalWidget

  var dayNames=DAYS_SHORT.map(function(d){return '<div class="cal-day-name">'+d+'</div>';}).join('');

  var cells='';
  for(var i=0;i<startDow;i++) cells+='<div class="cal-cell cal-empty"></div>';

  for(var d=1;d<=daysInMonth;d++){
    var dStr=tYear+'-'+pad2(tMonth+1)+'-'+pad2(d);
    var dayDate=new Date(tYear,tMonth,d);
    var isPast=dayDate<new Date(today.getFullYear(),today.getMonth(),today.getDate());
    var isToday=dStr===todayStr;
    var hasSlots=!!(calSlots[dStr]&&calSlots[dStr].length);

    var cls='cal-cell';
    if(isToday)       cls+=' cal-today';
    else if(isPast)   cls+=' cal-past';
    else if(hasSlots) cls+=(calSlots[dStr].length>calMaxSlots*0.5?' cal-avail-good':' cal-avail-few');
    else              cls+=' cal-taken';

    cells+='<div class="'+cls+'" data-cal-date="'+dStr+'">'+d+'</div>';
  }

  el.innerHTML='<div class="cal-grid">'+dayNames+cells+'</div>';
  setupCalTooltips(el);
}

function showDaySlots(dateStr,todayStr){
  var area=document.getElementById('slotsArea');
  var lbl=document.getElementById('slotsDateLbl');
  var grid=document.getElementById('slotsGrid');
  if(!area||!lbl||!grid) return;
  var times=calSlots[dateStr]||[];
  lbl.textContent=fmtDateLabel(dateStr);
  if(times.length===0){
    grid.innerHTML='<div style="color:var(--dim);font-size:13px">Sin horarios disponibles</div>';
  } else {
    grid.innerHTML=times.map(function(t){
      return '<button class="slot-chip" type="button" data-slot-time="'+escH(t)+'">'+escH(t)+'</button>';
    }).join('');
    grid.querySelectorAll('.slot-chip').forEach(function(btn){
      btn.addEventListener('click',function(){
        var time=btn.getAttribute('data-slot-time');
        if(time) openBookingFromSlot(dateStr,time);
      });
    });
  }
  area.style.display='block';
  var closeBtn=document.getElementById('slotsClose');
  if(closeBtn) closeBtn.onclick=function(){dashSelectedDate=null;hideSlots();};
}

function hideSlots(){
  var area=document.getElementById('slotsArea');
  if(area) area.style.display='none';
}

function fmtDateShort(dateStr){
  if(!dateStr) return '';
  var parts=dateStr.split('-');
  if(parts.length<3) return dateStr;
  var months_short=['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  return parseInt(parts[2],10)+' '+months_short[parseInt(parts[1],10)-1];
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
    slot.innerHTML='<div class="pr-avail-none">Sin horarios disponibles por ahora</div>';
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
      extra=' data-cal-date="'+dateStr+'"';
    } else if(isPast){
      cls+=' cal-past';
    } else if(hasSlots){
      cls+=(calSlots[dateStr].length>calMaxSlots*0.5?' cal-avail-good':' cal-avail-few');
      extra=' data-cal-date="'+dateStr+'"';
    } else {
      cls+=' cal-taken';
      extra=' data-cal-date="'+dateStr+'"';
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
    +'<div class="cal-leg-item"><div class="cal-leg-dot" style="background:var(--red);opacity:.5"></div>Sin horarios</div>'
    +'<div class="cal-leg-item"><div class="cal-leg-dot" style="background:#3B82F6"></div>Hoy</div>'
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
  // Click / hover handled by setupCalTooltips (panel + tooltip)
  setupCalTooltips(el);
}

// ── Calendar day tooltip ──────────────────────────────────────────────────────
var _calTipEl=null;
var _calTipTimer=null;

function getCalTipEl(){
  if(!_calTipEl){
    _calTipEl=document.createElement('div');
    _calTipEl.className='cal-tip';
    document.body.appendChild(_calTipEl);
    _calTipEl.addEventListener('mouseenter',function(){clearTimeout(_calTipTimer);});
    _calTipEl.addEventListener('mouseleave',hideCalTip);
  }
  return _calTipEl;
}

function hideCalTip(){
  _calTipTimer=setTimeout(function(){
    var t=getCalTipEl();t.classList.remove('ct-visible');
  },150);
}

function showCalTip(cell,date){
  clearTimeout(_calTipTimer);
  var tip=getCalTipEl();
  var DAY=['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
  var MON=['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  var d=new Date(date+'T12:00');
  var today=new Date();today.setHours(0,0,0,0);
  var dDay=new Date(date+'T00:00');
  var isToday=dDay.getTime()===today.getTime();
  var slots=calSlots[date]||[];
  var hasSlots=slots.length>0;
  var svcDotColors=['#F97316','#FB923C','#059669','#D97706','#EC4899','#14B8A6'];

  var html='<div class="cal-tip-date">'
    +DAY[d.getDay()]+' '+d.getDate()+' '+MON[d.getMonth()]
    +(isToday?'<span class="cal-tip-date-badge">Hoy</span>':hasSlots?'<span class="cal-tip-date-badge" style="background:#ECFDF5;color:#059669">Disponible</span>':'<span class="cal-tip-date-badge" style="background:#FEF3C7;color:#D97706">Sin horarios</span>')
    +'</div>'
    +'<div class="cal-tip-divider"></div>';

  if(hasSlots){
    html+='<div class="cal-tip-section">Horarios disponibles</div>'
      +'<div class="cal-tip-slots">';
    slots.slice(0,4).forEach(function(t){
      html+='<span class="cal-tip-slot" data-tip-slot-date="'+date+'" data-tip-slot-time="'+t+'">'+t+'</span>';
    });
    if(slots.length>4) html+='<span class="cal-tip-more">+'+( slots.length-4)+'</span>';
    html+='</div><div class="cal-tip-divider"></div>';
  }

  if(svcsCache&&svcsCache.length>0){
    html+='<div class="cal-tip-section">Servicios</div>'
      +'<div class="cal-tip-svcs">';
    svcsCache.slice(0,3).forEach(function(s,i){
      html+='<div class="cal-tip-svc-item">'
        +'<div class="cal-tip-dot" style="background:'+svcDotColors[i%svcDotColors.length]+'"></div>'
        +(s.name||s.title||'Servicio')
        +'</div>';
    });
    html+='</div><div class="cal-tip-divider"></div>';
  }

  if(providersCache&&providersCache.length>0){
    html+='<div class="cal-tip-section">Atiende</div>'
      +'<div class="cal-tip-people">';
    providersCache.slice(0,3).forEach(function(p){
      var initials=((p.name||'?').trim().split(' ').map(function(w){return w[0]||'';}).join('').slice(0,2)).toUpperCase();
      html+='<div class="cal-tip-person">'
        +'<div class="cal-tip-avatar">'
        +(p.picture||p.avatar?'<img src="'+escH(p.picture||p.avatar)+'" alt="">':initials)
        +'</div>'
        +escH(p.name||'Profesional')
        +'</div>';
    });
    html+='</div><div class="cal-tip-divider"></div>';
  }

  if(hasSlots){
    html+='<button class="cal-tip-btn" data-tip-day="'+date+'">Reservar este día →</button>';
  } else {
    html+='<div class="cal-tip-empty">Sin disponibilidad este día</div>';
  }

  tip.innerHTML=html;

  // Position
  var rect=cell.getBoundingClientRect();
  var TW=230,TH=tip.offsetHeight||260;
  var left=rect.left+rect.width/2-TW/2;
  var top=rect.bottom+8;
  if(left+TW>window.innerWidth-8) left=window.innerWidth-TW-8;
  if(left<8) left=8;
  if(top+TH>window.innerHeight-8) top=rect.top-TH-8;
  tip.style.left=left+'px';tip.style.top=top+'px';
  tip.classList.add('ct-visible');

  tip.querySelectorAll('[data-tip-slot-date]').forEach(function(btn){
    btn.addEventListener('click',function(){
      openBookingFromSlot(btn.getAttribute('data-tip-slot-date'),btn.getAttribute('data-tip-slot-time'));
      hideCalTip();
    });
  });
  var dayBtn=tip.querySelector('[data-tip-day]');
  if(dayBtn) dayBtn.addEventListener('click',function(){
    openBookingFromDay(dayBtn.getAttribute('data-tip-day'));
    hideCalTip();
  });
}

// ── Service tooltip (desktop hover) ──────────────────────────────────────────
var _svcTipEl=null;var _svcTipTimer=null;
function getSvcTipEl(){
  if(!_svcTipEl){
    _svcTipEl=document.createElement('div');
    _svcTipEl.className='cal-tip';
    document.body.appendChild(_svcTipEl);
    _svcTipEl.addEventListener('mouseenter',function(){clearTimeout(_svcTipTimer);});
    _svcTipEl.addEventListener('mouseleave',hideSvcTip);
  }
  return _svcTipEl;
}
function hideSvcTip(){
  _svcTipTimer=setTimeout(function(){
    var t=getSvcTipEl();t.classList.remove('ct-visible');
  },150);
}
function showSvcTip(row,svc,color){
  clearTimeout(_svcTipTimer);
  var tip=getSvcTipEl();
  var price=svc.price!=null&&Number(svc.price)>0?fmtPrice(Number(svc.price)):'Consultar';
  var dur=svc.duration_minutes?(svc.duration_minutes+' min'):'';
  var cat=escH(svc.category||svc.type||'Servicio');
  var html='<div class="cal-tip-date" style="border-left:3px solid '+color+';padding-left:12px">'+escH(svc.name||'Servicio')+'</div>'
    +'<div class="cal-tip-divider"></div>'
    +'<div class="cal-tip-slots" style="padding-top:10px">'
    +(dur?'<span class="cal-tip-slot" style="background:#F5F3FF;color:#7C3AED;border:none">⏱ '+dur+'</span>':'')
    +'<span class="cal-tip-slot" style="background:#ECFDF5;color:#059669;border:none">'+price+'</span>'
    +(cat?'<span class="cal-tip-more">'+cat+'</span>':'')
    +'</div>'
    +(svc.description?'<div class="cal-tip-divider"></div><div class="cal-tip-empty" style="font-style:normal;color:var(--soft)">'+escH(svc.description.slice(0,80))+(svc.description.length>80?'…':'')+'</div>':'')
    +'<div class="cal-tip-divider"></div>'
    +'<button class="cal-tip-btn">Ver detalle →</button>';
  tip.innerHTML=html;
  var rect=row.getBoundingClientRect();
  var TW=230;
  var left=rect.right+10;
  var top=rect.top;
  if(left+TW>window.innerWidth-8) left=rect.left-TW-10;
  if(top+200>window.innerHeight-8) top=window.innerHeight-210;
  tip.style.left=left+'px';tip.style.top=top+'px';
  tip.classList.add('ct-visible');
  var btn=tip.querySelector('.cal-tip-btn');
  if(btn) btn.addEventListener('click',function(){hideSvcTip();openSvcDetailPanel(svc,color);});
}

function openDayDetailPanel(date){
  var DAY=['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
  var MON=['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  var d=new Date(date+'T12:00');
  var today=new Date();today.setHours(0,0,0,0);
  var isToday=new Date(date+'T00:00').getTime()===today.getTime();
  var slots=calSlots[date]||[];
  var hasSlots=slots.length>0;
  var svcDotColors=['#F97316','#FB923C','#059669','#D97706','#EC4899','#14B8A6'];
  var dateLabel=(isToday?'Hoy — ':'')+DAY[d.getDay()]+' '+d.getDate()+' de '+MON[d.getMonth()];

  var titleEl=document.getElementById('ddpTitle');
  if(titleEl) titleEl.textContent=dateLabel;

  var body=document.getElementById('ddpBody');if(!body)return;

  var html='';

  // Slots section
  html+='<div class="ddp-section">'
    +'<div class="ddp-section-lbl">'+( hasSlots?'Horarios disponibles':'Sin horarios este día')+'</div>';
  if(hasSlots){
    html+='<div class="ddp-slots">';
    slots.forEach(function(t){
      html+='<button class="ddp-slot" data-ddp-date="'+date+'" data-ddp-time="'+t+'">'+t+'</button>';
    });
    html+='</div>';
  } else {
    html+='<p class="ddp-empty-note">No hay horarios disponibles para este día.</p>';
  }
  html+='</div>';

  // Services section
  if(svcsCache&&svcsCache.length>0){
    html+='<div class="ddp-section">'
      +'<div class="ddp-section-lbl">Servicios</div>'
      +'<div class="ddp-svc-list">';
    svcsCache.slice(0,6).forEach(function(s,i){
      var price=s.price!=null?'$'+Number(s.price).toLocaleString('es'):'';
      html+='<div class="ddp-svc-row">'
        +'<div class="ddp-svc-dot" style="background:'+svcDotColors[i%svcDotColors.length]+'"></div>'
        +'<span class="ddp-svc-name">'+(s.name||s.title||'Servicio')+'</span>'
        +(price?'<span class="ddp-svc-price">'+price+'</span>':'')
        +'</div>';
    });
    html+='</div></div>';
  }

  // Providers section
  if(providersCache&&providersCache.length>0){
    html+='<div class="ddp-section">'
      +'<div class="ddp-section-lbl">Atiende</div>'
      +'<div class="ddp-people">';
    providersCache.forEach(function(p){
      var initials=((p.name||'?').trim().split(' ').map(function(w){return w[0]||'';}).join('').slice(0,2)).toUpperCase();
      html+='<div class="ddp-person">'
        +'<div class="ddp-avatar">'
        +(p.picture||p.avatar?'<img src="'+escH(p.picture||p.avatar)+'" alt="">':initials)
        +'</div>'
        +'<span class="ddp-person-name">'+escH(p.name||'Profesional')+'</span>'
        +'</div>';
    });
    html+='</div></div>';
  }

  // CTA
  if(hasSlots){
    html+='<div class="ddp-cta">'
      +'<button class="btn-primary ddp-book-btn" type="button" data-ddp-book="'+date+'">Reservar este día</button>'
      +'</div>';
  }

  body.innerHTML=html;

  body.querySelectorAll('[data-ddp-date]').forEach(function(btn){
    btn.addEventListener('click',function(){
      closePanel('dayDetailPanel');
      openBookingFromSlot(btn.getAttribute('data-ddp-date'),btn.getAttribute('data-ddp-time'));
    });
  });
  var bookBtn=body.querySelector('[data-ddp-book]');
  if(bookBtn) bookBtn.addEventListener('click',function(){
    closePanel('dayDetailPanel');
    openBookingFromDay(bookBtn.getAttribute('data-ddp-book'));
  });

  openPanel('dayDetailPanel');
}

function setupCalTooltips(el){
  var isTouch=window.matchMedia('(hover:none)').matches;
  el.querySelectorAll('.cal-cell[data-cal-date]').forEach(function(cell){
    var date=cell.getAttribute('data-cal-date');
    // Desktop hover → tooltip
    if(!isTouch){
      cell.addEventListener('mouseenter',function(){showCalTip(cell,date);});
      cell.addEventListener('mouseleave',hideCalTip);
    }
    // Click on ANY day → day detail panel (overrides the direct booking)
    cell.addEventListener('click',function(e){
      e.stopPropagation();
      hideCalTip();
      openDayDetailPanel(date);
    });
  });
}

function pad2(n){return n<10?'0'+n:String(n);}

// ── Quote tab ─────────────────────────────────────────────────────────────────
function loadQPProducts(reset){
  if(qpLoadingProds) return;
  if(reset){qpProds=[];qpOffset=0;qpTotalProds=0;}
  if(!reset&&qpProds.length>=qpTotalProds&&qpTotalProds>0) return;
  qpLoadingProds=true;
  var body=document.getElementById('cotizarBody');
  if(reset&&body) body.innerHTML='<div style="text-align:center;color:var(--dim);padding:40px 20px;font-size:14px">Cargando...</div>';
  fetch('/api/public/'+SLUG+'/booking-services?limit=20&offset='+qpOffset)
    .then(function(r){return r.json();})
    .then(function(d){
      var list=Array.isArray(d.services)?d.services:(Array.isArray(d)?d:[]);
      qpProds=qpProds.concat(list);
      qpOffset+=list.length;
      qpTotalProds=d.total||qpProds.length;
      qpLoadingProds=false;
      renderQPCards();
    })
    .catch(function(){
      qpLoadingProds=false;
      var b=document.getElementById('cotizarBody');
      if(b) b.innerHTML='<div style="text-align:center;color:var(--dim);padding:40px 20px;font-size:14px">Error cargando productos.</div>';
    });
}
function renderQPCards(){
  var body=document.getElementById('cotizarBody');if(!body)return;
  if(!qpProds.length&&!qpLoadingProds){
    body.innerHTML='<div style="text-align:center;color:var(--dim);padding:48px 20px;font-size:14px">No hay productos disponibles.</div>';return;
  }
  var cards=qpProds.map(function(p){
    var pid=String(p.id);
    return '<div class="qp-prod-card">'
      +'<div class="qp-prod-info">'
      +'<div class="qp-prod-name">'+escH(p.name)+'</div>'
      +(p.description?'<div class="qp-prod-desc">'+escH(p.description)+'</div>':'')
      +'<div class="qp-prod-price">'+fmtPrice(p.price)+'</div>'
      +'</div>'
      +'<div class="qp-qty" data-id="'+escH(pid)+'">'
      +'<button class="qp-qty-btn" data-op="minus" type="button">−</button>'
      +'<span class="qp-qty-num">'+(QCart[pid]||0)+'</span>'
      +'<button class="qp-qty-btn" data-op="plus" type="button">+</button>'
      +'</div></div>';
  }).join('');
  var loadMore=qpProds.length<qpTotalProds
    ?'<div style="padding:12px;text-align:center"><button class="btn-outline" id="qpLoadMoreBtn" type="button">Cargar más</button></div>'
    :'';
  body.innerHTML='<div style="padding:16px 20px">'
    +'<p style="font-size:11px;font-weight:700;color:var(--dim);text-transform:uppercase;letter-spacing:.07em;margin-bottom:12px">Selecciona productos</p>'
    +'<div>'+cards+'</div>'
    +loadMore
    +'<div id="qpBar" style="display:none;margin-top:14px;padding:10px 14px;background:var(--bg);border:1.5px solid var(--border);border-radius:10px;align-items:center;justify-content:space-between">'
    +'<span id="qpBarInfo" style="font-size:13px;color:var(--soft)"></span>'
    +'<span id="qpBarTot" style="font-size:13px;font-weight:700;color:var(--primary)"></span></div>'
    +'<button class="btn-primary" id="qpContBtn" type="button" style="width:100%;margin-top:14px">Continuar →</button>'
    +'</div>';
  qpRefreshBar();
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
    if(!qpProds.some(function(p){return (QCart[String(p.id)]||0)>0;})){alert('Selecciona al menos un producto.');return;}
    renderQPStep2();
  });
  var lmBtn=document.getElementById('qpLoadMoreBtn');
  if(lmBtn) lmBtn.addEventListener('click',function(){
    lmBtn.textContent='Cargando...';lmBtn.disabled=true;
    loadQPProducts(false);
  });
}
function renderQPStep1(){
  QCart={};
  if(qpProds.length>0){renderQPCards();}
  else{loadQPProducts(true);}
}
function qpRefreshBar(){
  var bar=document.getElementById('qpBar'),info=document.getElementById('qpBarInfo'),tot=document.getElementById('qpBarTot');
  if(!bar)return;
  var c=0,t=0;qpProds.forEach(function(p){var q=QCart[String(p.id)]||0;c+=q;t+=p.price*q;});
  if(c>0){bar.style.display='flex';info.textContent=c+(c!==1?' productos':' producto');tot.textContent=fmtPrice(t);}
  else bar.style.display='none';
}
function renderQPStep2(){
  var body=document.getElementById('cotizarBody');if(!body)return;
  var rows='',total=0;
  qpProds.forEach(function(p){var q=QCart[String(p.id)]||0;if(!q)return;var sub=p.price*q;total+=sub;
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
    var items=qpProds.filter(function(p){return (QCart[String(p.id)]||0)>0;}).map(function(p){return {productId:String(p.id),quantity:QCart[String(p.id)]};});
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
  var body=document.getElementById('cotizarBody');if(!body)return;
  body.innerHTML='<div style="display:flex;flex-direction:column;align-items:center;text-align:center;padding:60px 24px">'
    +'<div style="width:60px;height:60px;border-radius:18px;background:var(--green-dim);display:flex;align-items:center;justify-content:center;font-size:28px;margin-bottom:14px">✅</div>'
    +'<div style="font-size:18px;font-weight:700;color:var(--text);margin-bottom:6px">¡Cotización enviada!</div>'
    +'<div style="font-size:14px;color:var(--soft);line-height:1.6;max-width:240px">Te contactamos pronto, '+escH(name)+'.</div>'
    +'<button class="btn-primary" id="qpDoneBtn" type="button" style="margin-top:28px">Volver al inicio</button>'
    +'</div>';
  var doneBtn=document.getElementById('qpDoneBtn');
  if(doneBtn) doneBtn.addEventListener('click',function(){
    showTab('chat');
    var b=document.getElementById('cotizarBody');if(b)b.innerHTML='';
    QCart={};
  });
}

// ── Gallery lightbox ──────────────────────────────────────────────────────────
var galItems=[];
var galCurrentIdx=0;
var galPanelTitle='';

function openGalPanel(idx){
  var items=document.querySelectorAll('.gal-item');
  galItems=Array.from(items);
  galCurrentIdx=idx;
  galPanelTitle='';
  renderGalPanel();
  openPanel('galPanel');
}

function renderGalPanel(){
  var item=galItems[galCurrentIdx];
  if(!item) return;
  var url=item.getAttribute('data-gal-url')||'';
  var desc=item.getAttribute('data-gal-desc')||'';
  var counter=document.getElementById('galPanelCounter');
  if(counter){
    var prefix=galPanelTitle?galPanelTitle+' · ':'';
    counter.textContent=prefix+(galCurrentIdx+1)+' / '+galItems.length;
  }
  var body=document.getElementById('galPanelBody');
  if(!body) return;
  body.innerHTML='<div style="padding:16px 20px">'
    +'<img src="'+escH(url)+'" alt="" style="width:100%;border-radius:12px;display:block;background:var(--bg)">'
    +(desc?'<p style="margin:12px 0 0;font-size:14px;color:var(--soft);line-height:1.6">'+escH(desc)+'</p>':'')
    +'<div style="display:flex;gap:8px;margin-top:16px">'
    +(galCurrentIdx>0?'<button class="btn-outline" id="galPrev" type="button" style="flex:1">← Anterior</button>':'')
    +(galCurrentIdx<galItems.length-1?'<button class="btn-outline" id="galNext" type="button" style="flex:1">Siguiente →</button>':'')
    +'</div>'
    +'</div>';
  var prev=document.getElementById('galPrev');
  var next=document.getElementById('galNext');
  if(prev) prev.addEventListener('click',function(){galCurrentIdx--;renderGalPanel();});
  if(next) next.addEventListener('click',function(){galCurrentIdx++;renderGalPanel();});
}

// ── Reviews ───────────────────────────────────────────────────────────────────
function renderStars(avg){
  var full=Math.round(avg||0);
  if(full>5) full=5;
  if(full<0) full=0;
  var empty=5-full;
  var html='';
  for(var i=0;i<full;i++) html+='<span style="color:#FACC15">★</span>';
  for(var i=0;i<empty;i++) html+='<span style="color:var(--dim)">★</span>';
  return html;
}

function ensureReviews(){
  if(reviewsLoaded) return;
  reviewsLoaded=true;
  rvPage=1;
  fetch('/api/public/reviews/'+USER_ID)
    .then(function(r){return r.json();})
    .then(function(data){
      rvTotal=parseInt((data&&data.summary&&data.summary.total)||'0',10)||0;
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
  renderInboxCard('homeInbox',data,2);
  renderInboxCard('homeInboxMobile',data);
  // update home dashboard stats
  var summary=(data&&data.summary)||{};
  var reviews2=(data&&data.reviews)||[];
  var avg=parseFloat(summary.average||'0');
  var total=parseInt(summary.total||'0',10);
  // stat cards
  var hmRating=document.getElementById('hmStatRating');
  if(hmRating) hmRating.textContent=avg>0?avg.toFixed(1):total?'—':'—';
  var hmRev=document.getElementById('hmStatReviews');
  if(hmRev) hmRev.textContent=String(total);
  // reviews panel: big avg + count
  var hmRatingBig=document.getElementById('hmStatRatingBig');
  if(hmRatingBig) hmRatingBig.textContent=avg>0?avg.toFixed(1):'—';
  var hmRevBig=document.getElementById('hmStatReviewsBig');
  if(hmRevBig) hmRevBig.textContent=String(total);
  var heroRating=document.getElementById('heroRating');
  if(heroRating) heroRating.textContent=avg>0?avg.toFixed(1):'—';
  var heroReviews=document.getElementById('heroReviews');
  if(heroReviews) heroReviews.textContent=String(total);
  // si no hay reseñas, mostrar empty state compacto
  var reviewsPanel=document.getElementById('hmReviewsPanel');
  if(total===0 && reviewsPanel){
    reviewsPanel.innerHTML='<div class="hm-empty-row">'
      +'<div class="hm-empty-icon" style="background:rgba(250,204,21,.1);color:#FACC15">'
      +'<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>'
      +'</div>'
      +'<div class="hm-empty-body">'
      +'<div class="hm-empty-title">Sin reseñas aún</div>'
      +'<div class="hm-empty-sub">Las opiniones de tus clientes aparecerán aquí</div>'
      +'</div>'
      +'</div>';
    return;
  }
  // bar chart distribution
  var dist={5:0,4:0,3:0,2:0,1:0};
  reviews2.forEach(function(r){
    var s=Math.round(parseFloat(r.rating||r.score||'0'));
    if(s>=1&&s<=5) dist[s]++;
  });
  var maxD=Math.max(dist[5],dist[4],dist[3],dist[2],dist[1],1);
  var barsEl=document.getElementById('hmReviewBars');
  if(barsEl){
    var bHtml='';
    [5,4,3,2,1].forEach(function(s){
      var w=Math.round(dist[s]/maxD*100);
      bHtml+='<div class="rv-bar-row">'
        +'<span class="rv-bar-star">'+s+'★</span>'
        +'<div class="rv-bar-track"><div class="rv-bar-fill" style="width:'+w+'%"></div></div>'
        +'<span class="rv-bar-count">'+dist[s]+'</span>'
        +'</div>';
    });
    barsEl.innerHTML=bHtml;
  }
}
function renderInboxCard(id,data,maxItems){
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
    +'<div style="font-size:12px;color:#FACC15;letter-spacing:1px">'+renderStars(avg)+'</div>'
    +'<div style="font-size:10.5px;color:var(--dim);margin-top:1px">'+total+' reseña'+(total!==1?'s':'')+'</div>'
    +'</div>'
    +'</div>':'';
  var items=reviews.slice(0,maxItems||4).map(function(r,i){
    var name=r.google_name||r.client_name||'Cliente';
    var initLetter=(name.trim().charAt(0)||'?').toUpperCase();
    var color=INBOX_COLORS[i%INBOX_COLORS.length];
    var stars='';for(var s=1;s<=5;s++) stars+='<span style="color:'+(s<=(r.rating||0)?'#FACC15':'var(--dim)')+'">★</span>';
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

function buildRvCard(r){
  var stars='';
  for(var i=1;i<=5;i++) stars+='<span style="color:'+(i<=(r.rating||0)?'#FACC15':'var(--dim)')+'">★</span>';
  var date='';
  if(r.created_at){try{date=new Date(r.created_at).toLocaleDateString('es-CL',{day:'numeric',month:'short',year:'numeric'});}catch(e){}}
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

  var cards=reviews.map(buildRvCard).join('');
  var hasMore=total>reviews.length;
  var loadMoreBtn=hasMore?'<button class="rv-load-more" type="button" id="rvLoadMore">Ver más reseñas</button>':'';

  el.innerHTML=summaryHtml
    +(cards?'<div class="sec-hdr" style="margin-top:20px"><span class="sec-title">Últimas reseñas</span><span class="sec-sub" style="margin-top:2px">Opiniones de nuestros clientes</span></div>'
      +'<div id="rvCardsList">'+cards+'</div>'+loadMoreBtn:'');

  var btn=document.getElementById('rvLoadMore');
  if(btn) btn.addEventListener('click',loadMoreReviews);
}

function loadMoreReviews(){
  var btn=document.getElementById('rvLoadMore');
  if(btn){btn.textContent='Cargando…';btn.disabled=true;}
  rvPage++;
  fetch('/api/public/reviews/'+USER_ID+'?page='+rvPage)
    .then(function(r){return r.json();})
    .then(function(data){
      var reviews=(data&&data.reviews)||[];
      var pagination=(data&&data.pagination)||{};
      var list=document.getElementById('rvCardsList');
      if(list) list.insertAdjacentHTML('beforeend',reviews.map(buildRvCard).join(''));
      var btn2=document.getElementById('rvLoadMore');
      if(btn2){
        if(pagination.hasNextPage){btn2.textContent='Ver más reseñas';btn2.disabled=false;}
        else btn2.remove();
      }
    })
    .catch(function(){
      var btn2=document.getElementById('rvLoadMore');
      if(btn2){btn2.textContent='Ver más reseñas';btn2.disabled=false;}
    });
}

// ── Review panel ─────────────────────────────────────────────────────────────
var rvRating=0;

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
      +(n<=rvRating?'#FACC15':'#D1D5DB')+'">★</button>';
  }).join('');
  body.innerHTML='<div style="padding:24px 20px">'
    +'<div style="font-size:13px;font-weight:600;color:var(--soft);margin-bottom:14px">¿Cómo calificarías tu experiencia?</div>'
    +'<div style="display:flex;gap:2px;margin-bottom:22px">'+starsHtml+'</div>'
    +'<div class="bk-inp-wrap"><div class="bk-inp-lbl">Comentario (opcional)</div>'
    +'<textarea class="bk-inp" id="rvComment" rows="3" placeholder="Contanos tu experiencia…" style="resize:none;font-family:inherit"></textarea></div>'
    +(err?'<div class="bk-inp-err" style="margin-bottom:10px">'+escH(err)+'</div>':'')
    +'<button class="btn-primary" type="button" id="rvSubmit" style="width:100%;font-size:14px;margin-top:4px">Enviar reseña</button>'
    +'</div>';
  body.querySelectorAll('[data-rv-star]').forEach(function(btn){
    btn.addEventListener('click',function(){
      rvRating=parseInt(btn.getAttribute('data-rv-star')||'0',10);
      renderReviewForm();
    });
  });
  var sub=document.getElementById('rvSubmit');
  if(sub) sub.addEventListener('click',submitReview);
}

function submitReview(){
  if(!rvRating){ renderReviewForm('Selecciona una calificación.'); return; }
  var commentEl=document.getElementById('rvComment');
  var comment=commentEl?(commentEl.value||'').trim():'';
  var btn=document.getElementById('rvSubmit');
  if(btn){btn.textContent='Enviando…';btn.disabled=true;}
  fetch('/api/public/'+SLUG+'/reviews',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({rating:rvRating,comment:comment||null})
  })
  .then(function(r){return r.json();})
  .then(function(d){
    if(d.ok){
      reviewsLoaded=false;
      ensureReviews();
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
      });
    } else {
      renderReviewForm(d.message||'Error al enviar. Intentá de nuevo.');
    }
  })
  .catch(function(){ renderReviewForm('Error de conexión. Intentá de nuevo.'); });
}

// ── init ─────────────────────────────────────────────────────────────────────
function initUpcoming(){
  var el=document.getElementById('hmUpcoming');if(!el) return;
  el.innerHTML='<div style="padding:14px 16px;display:flex;align-items:center;gap:8px;color:var(--dim);font-size:12.5px">'
    +'<div class="spinner"></div>Cargando disponibilidad…</div>';
}

function renderUpcomingSlots(){
  var el=document.getElementById('hmUpcoming');if(!el) return;
  var DAY_NAMES=['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
  var MON_NAMES=['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  var today=new Date();today.setHours(0,0,0,0);
  var upcoming=[];
  for(var i=0;i<60&&upcoming.length<5;i++){
    var d=new Date(today);d.setDate(d.getDate()+i);
    var ds=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
    if(calSlots[ds]&&calSlots[ds].length>0) upcoming.push({date:ds,times:calSlots[ds],d:d});
  }
  if(upcoming.length===0){
    el.innerHTML='<div class="hm-empty-row">'
      +'<div class="hm-empty-icon" style="background:#EEF4FF;color:var(--primary)">'
      +'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="16" y1="2" x2="16" y2="6"/></svg>'
      +'</div>'
      +'<div class="hm-empty-body">'
      +'<div class="hm-empty-title">Sin disponibilidad próxima</div>'
      +'<div class="hm-empty-sub">No hay horarios disponibles en los próximos días</div>'
      +'</div>'
      +'</div>';
    return;
  }
  var html='';
  upcoming.forEach(function(u){
    var lbl=DAY_NAMES[u.d.getDay()]+' '+u.d.getDate()+' '+MON_NAMES[u.d.getMonth()];
    var show=u.times.slice(0,3);
    var extra=u.times.length-show.length;
    html+='<div class="hm-avail-row" data-date="'+u.date+'">'
      +'<div class="hm-avail-date">'+lbl+'</div>'
      +'<div class="hm-avail-chips">';
    show.forEach(function(t){
      html+='<button class="hm-avail-chip" data-date="'+u.date+'" data-time="'+t+'">'+t+'</button>';
    });
    if(extra>0) html+='<span class="hm-avail-more">+'+extra+'</span>';
    html+='</div></div>';
  });
  el.innerHTML=html;
  el.querySelectorAll('.hm-avail-chip').forEach(function(btn){
    btn.addEventListener('click',function(e){
      e.stopPropagation();
      var date=btn.getAttribute('data-date');
      var time=btn.getAttribute('data-time');
      if(date&&time) openBookingFromSlot(date,time);
    });
  });
  el.querySelectorAll('.hm-avail-row').forEach(function(row){
    row.addEventListener('click',function(){
      var date=row.getAttribute('data-date');
      if(date) openBookingFromDay(date);
    });
  });
}

(function init(){
  loadServices();
  loadProviders();
  loadCalendar();
  ensureReviews();
  initUpcoming();
})();

// ── Orphan photos infinite scroll ─────────────────────────────────────────────
(function(){
  var sentinel=document.getElementById('orphanSentinel');
  if(!sentinel) return;
  var loading=false;
  var obs=new IntersectionObserver(function(entries){
    if(!entries[0].isIntersecting||loading) return;
    var total=parseInt(sentinel.getAttribute('data-total')||'0',10);
    var loaded=parseInt(sentinel.getAttribute('data-loaded')||'0',10);
    if(loaded>=total){obs.disconnect();return;}
    loading=true;
    fetch('/api/public/'+SLUG+'/gallery?limit=20&offset='+loaded)
      .then(function(r){return r.json();})
      .then(function(data){
        if(!data.ok||!Array.isArray(data.photos)){loading=false;return;}
        var grid=document.getElementById('orphan-grid');
        if(!grid){loading=false;return;}
        var newLoaded=loaded+data.photos.length;
        sentinel.setAttribute('data-loaded',String(newLoaded));
        data.photos.forEach(function(p,i){
          var div=document.createElement('div');
          div.className='gal-item';
          div.setAttribute('data-gal-idx',String(loaded+i));
          div.setAttribute('data-gal-url',p.url||'');
          div.setAttribute('data-gal-desc',p.description||'');
          var img=document.createElement('img');
          img.src=p.url||'';
          img.alt='';
          img.loading='lazy';
          div.appendChild(img);
          grid.appendChild(div);
        });
        loading=false;
        if(newLoaded>=total)obs.disconnect();
      })
      .catch(function(){loading=false;});
  },{rootMargin:'300px'});
  obs.observe(sentinel);
})();
`;
}
