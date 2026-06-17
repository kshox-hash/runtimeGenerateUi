type ProductData = { id: string | number; name: string; price: number; description?: string | null };

export function portalScripts(
  slug: string,
  _bizName: string,
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
const SLUG=${JSON.stringify(slug)};
const PRODUCTS=${JSON.stringify(safeProducts)};

// ── Estado compartido ─────────────────────────────────────────────────────────
var S={flow:null,date:null,time:null,slots:{},cart:{},providerId:null,providerName:null,providers:[]};

// ── Utilidades ────────────────────────────────────────────────────────────────
function renderMd(t){
  return t
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/\\*\\*([^]+?)\\*\\*/g,'<b>$1</b>').replace(/\\n/g,'<br>');
}
function escH(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function formatPrice(n){ return '$'+Number(n||0).toLocaleString('es-CL'); }
function formatDate(d){
  var dt=new Date(d+'T12:00:00');
  var DAYS=['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
  var MON=['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
  return DAYS[dt.getDay()]+' '+dt.getDate()+' de '+MON[dt.getMonth()];
}
function parseSlotsResponse(data){
  // API returns { slots: [{date, times}] }
  var result={};
  if(!data||!Array.isArray(data.slots)) return result;
  data.slots.forEach(function(s){ if(s.date&&s.times&&s.times.length) result[s.date]=s.times; });
  return result;
}


// ── PANEL DE RESERVAS (slide-in) ──────────────────────────────────────────────
function makeBPHeader(title,onBack){
  var hdr=document.createElement('div'); hdr.className='qp-header';
  var back=document.createElement('button'); back.type='button'; back.className='qp-back';
  back.innerHTML='<svg viewBox="0 0 24 24" fill="none"><polyline points="15 18 9 12 15 6"/></svg>'+(arguments[2]||(onBack===closeBookingPanel?'Volver':'Atrás'));
  back.addEventListener('click',onBack);
  var ttl=document.createElement('div'); ttl.className='qp-title'; ttl.textContent=title;
  var spc=document.createElement('div'); spc.className='qp-spacer';
  hdr.appendChild(back); hdr.appendChild(ttl); hdr.appendChild(spc);
  return hdr;
}

function closeBookingPanelWithRecovery(){
  closeBookingPanel();
}

function fetchAndRenderDates(){
  var url='/api/public/'+SLUG+'/slots'+(S.providerId?'?providerId='+encodeURIComponent(S.providerId):'');
  fetch(url)
    .then(function(r){ return r.json(); })
    .then(function(data){
      S.slots=parseSlotsResponse(data);
      var dates=Object.keys(S.slots);
      if(!dates.length){ renderBPEmpty('No hay horarios disponibles en este momento.'); return; }
      renderBPDates(dates);
    })
    .catch(function(){ renderBPEmpty('No se pudo cargar la disponibilidad. Verifica tu conexión.'); });
}

function openBookingPanel(){
  S.flow='reservas'; S.date=null; S.time=null; S.providerId=null; S.providerName=null;
  renderBPLoading();
  document.getElementById('bookingPanel').classList.add('open');
  fetch('/api/public/'+SLUG+'/providers')
    .then(function(r){ return r.json(); })
    .then(function(data){
      S.providers=(data&&Array.isArray(data.providers))?data.providers:[];
      if(S.providers.length>=2){ renderBPProviders(); }
      else {
        if(S.providers.length===1){ S.providerId=S.providers[0].id; S.providerName=S.providers[0].name; }
        fetchAndRenderDates();
      }
    })
    .catch(function(){ S.providers=[]; fetchAndRenderDates(); });
}

function renderBPProviders(){
  var panel=document.getElementById('bookingPanel');
  panel.innerHTML='';
  panel.appendChild(makeBPHeader('Reservar hora',closeBookingPanel,'Volver'));
  var body=document.createElement('div'); body.className='qp-body';
  var lbl=document.createElement('p'); lbl.className='qp-section-title'; lbl.textContent='¿Con quién quieres agendar?';
  body.appendChild(lbl);
  var list=document.createElement('div'); list.className='bp-dates';

  function pickProvider(id,name){
    S.providerId=id; S.providerName=name;
    renderBPLoading();
    fetchAndRenderDates();
  }

  // "Cualquiera disponible" card
  var anyCard=document.createElement('div'); anyCard.className='bp-date-card';
  anyCard.innerHTML='<div class="bp-provider-avatar" style="background:rgba(99,172,241,.15);color:#63ACF1">✦</div>'
    +'<div class="bp-date-info"><div class="bp-date-label">Cualquiera disponible</div>'
    +'<div class="bp-date-slots">Ver todos los horarios</div></div>'
    +'<svg class="bp-date-arrow" viewBox="0 0 24 24" fill="none"><polyline points="9 18 15 12 9 6"/></svg>';
  anyCard.addEventListener('click',function(){ pickProvider(null,null); });
  list.appendChild(anyCard);

  S.providers.forEach(function(p){
    var color=p.color||'#63ACF1';
    var card=document.createElement('div'); card.className='bp-date-card';
    var hex=color.replace('#','');
    var r=parseInt(hex.substring(0,2),16); var g=parseInt(hex.substring(2,4),16); var b=parseInt(hex.substring(4,6),16);
    card.innerHTML='<div class="bp-provider-avatar" style="background:rgba('+r+','+g+','+b+',.15);color:'+color+'">'+escH(p.avatar_initials||p.name.charAt(0).toUpperCase())+'</div>'
      +'<div class="bp-date-info"><div class="bp-date-label">'+escH(p.name)+'</div>'
      +'<div class="bp-date-slots">Ver disponibilidad</div></div>'
      +'<svg class="bp-date-arrow" viewBox="0 0 24 24" fill="none"><polyline points="9 18 15 12 9 6"/></svg>';
    (function(id,name){ card.addEventListener('click',function(){ pickProvider(id,name); }); })(p.id,p.name);
    list.appendChild(card);
  });

  body.appendChild(list);
  panel.appendChild(body);
}

function closeBookingPanel(){
  document.getElementById('bookingPanel').classList.remove('open');
  setTimeout(function(){ var p=document.getElementById('bookingPanel'); if(p) p.innerHTML=''; },360);
}

function renderBPLoading(){
  var panel=document.getElementById('bookingPanel');
  panel.innerHTML='';
  panel.appendChild(makeBPHeader('Reservar hora',closeBookingPanelWithRecovery,'Volver'));
  var body=document.createElement('div'); body.className='qp-body';
  var loading=document.createElement('div'); loading.className='qp-loading';
  loading.innerHTML='<div class="qp-loading-spinner"></div><span>Buscando disponibilidad...</span>';
  body.appendChild(loading);
  panel.appendChild(body);
}

function renderBPEmpty(msg){
  var panel=document.getElementById('bookingPanel');
  panel.innerHTML='';
  panel.appendChild(makeBPHeader('Reservar hora',closeBookingPanelWithRecovery,'Volver'));
  var body=document.createElement('div'); body.className='qp-body';
  var empty=document.createElement('div'); empty.className='qp-empty';
  var icon=document.createElement('div'); icon.className='qp-empty-icon'; icon.textContent='📅';
  var msgEl=document.createElement('div'); msgEl.className='qp-empty-msg'; msgEl.textContent=msg;
  var actions=document.createElement('div'); actions.className='qp-empty-actions';
  var retryBtn=document.createElement('button'); retryBtn.type='button'; retryBtn.className='qp-btn'; retryBtn.textContent='🔄 Intentar de nuevo';
  retryBtn.addEventListener('click',function(){ renderBPLoading(); fetchAndRenderDates(); });
  actions.appendChild(retryBtn);
  empty.appendChild(icon); empty.appendChild(msgEl); empty.appendChild(actions);
  body.appendChild(empty);
  panel.appendChild(body);
}

function renderBPDates(dates){
  var panel=document.getElementById('bookingPanel');
  panel.innerHTML='';
  panel.appendChild(makeBPHeader('Reservar hora',closeBookingPanelWithRecovery,'Volver'));
  var body=document.createElement('div'); body.className='qp-body';
  var lbl=document.createElement('p'); lbl.className='qp-section-title'; lbl.textContent='Elige un día';
  body.appendChild(lbl);
  var list=document.createElement('div'); list.className='bp-dates';
  var DAYS=['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
  dates.slice(0,14).forEach(function(date){
    var times=S.slots[date]||[];
    var dt=new Date(date+'T12:00:00');
    var card=document.createElement('div'); card.className='bp-date-card';
    var iconEl=document.createElement('div'); iconEl.className='bp-date-icon';
    iconEl.innerHTML='<div class="bp-date-day">'+DAYS[dt.getDay()]+'</div><div class="bp-date-num">'+dt.getDate()+'</div>';
    var info=document.createElement('div'); info.className='bp-date-info';
    info.innerHTML='<div class="bp-date-label">'+escH(formatDate(date))+'</div>'
      +'<div class="bp-date-slots">'+times.length+' horario'+(times.length!==1?'s':'')+' disponible'+(times.length!==1?'s':'')+'</div>';
    var arrow=document.createElement('svg'); arrow.setAttribute('viewBox','0 0 24 24'); arrow.setAttribute('fill','none'); arrow.className='bp-date-arrow';
    arrow.innerHTML='<polyline points="9 18 15 12 9 6"/>';
    card.appendChild(iconEl); card.appendChild(info); card.appendChild(arrow);
    (function(d){ card.addEventListener('click',function(){ S.date=d; renderBPTimes(d,S.slots[d]||[]); }); })(date);
    list.appendChild(card);
  });
  body.appendChild(list);
  panel.appendChild(body);
}

function renderBPTimes(date,times){
  if(!times||!times.length){ renderBPEmpty('No hay horarios disponibles para ese día. Elige otro.'); return; }
  var panel=document.getElementById('bookingPanel');
  panel.innerHTML='';
  var allDates=Object.keys(S.slots);
  panel.appendChild(makeBPHeader('Reservar hora',function(){ renderBPDates(allDates); }));
  var body=document.createElement('div'); body.className='qp-body';
  var lbl=document.createElement('p'); lbl.className='qp-section-title'; lbl.textContent='Elige un horario';
  var dateEl=document.createElement('div'); dateEl.style.cssText='font-size:14px;color:var(--muted2);margin-bottom:14px';
  dateEl.textContent=formatDate(date);
  body.appendChild(lbl); body.appendChild(dateEl);
  var grid=document.createElement('div'); grid.className='bp-times';
  times.forEach(function(t){
    var chip=document.createElement('button'); chip.type='button'; chip.className='bp-time-chip'; chip.textContent=t;
    (function(time){ chip.addEventListener('click',function(){ S.time=time; renderBPForm(); }); })(t);
    grid.appendChild(chip);
  });
  body.appendChild(grid);
  panel.appendChild(body);
}

function renderBPForm(){
  var panel=document.getElementById('bookingPanel');
  panel.innerHTML='';
  var savedDate=S.date; var savedTimes=S.slots[savedDate]||[];
  panel.appendChild(makeBPHeader('Tus datos',function(){ renderBPTimes(savedDate,savedTimes); }));
  var body=document.createElement('div'); body.className='qp-body';
  // Resumen de la reserva
  var sumLbl=document.createElement('p'); sumLbl.className='qp-section-title'; sumLbl.textContent='Tu reserva';
  body.appendChild(sumLbl);
  var sumBox=document.createElement('div'); sumBox.className='qp-summary';
  sumBox.innerHTML='<div class="cart-line"><span>Fecha</span><span>'+escH(formatDate(S.date))+'</span></div>'
    +'<div class="cart-line" style="margin-bottom:0"><span>Hora</span><span>'+escH(S.time)+'</span></div>'
    +(S.providerName?'<div class="cart-line" style="margin-bottom:0"><span>Con</span><span>'+escH(S.providerName)+'</span></div>':'');
  body.appendChild(sumBox);
  // Formulario
  var formLbl=document.createElement('p'); formLbl.className='qp-section-title'; formLbl.textContent='Tus datos de contacto';
  body.appendChild(formLbl);
  var nameInp=document.createElement('input'); nameInp.type='text'; nameInp.placeholder='Nombre completo'; nameInp.className='qp-input'; nameInp.setAttribute('autocomplete','name');
  var phoneInp=document.createElement('input'); phoneInp.type='tel'; phoneInp.placeholder='Teléfono'; phoneInp.className='qp-input'; phoneInp.setAttribute('autocomplete','tel');
  var emailInp=document.createElement('input'); emailInp.type='email'; emailInp.placeholder='Email'; emailInp.className='qp-input'; emailInp.setAttribute('autocomplete','email');
  var errEl=document.createElement('div'); errEl.className='qp-error';
  body.appendChild(nameInp); body.appendChild(phoneInp); body.appendChild(emailInp); body.appendChild(errEl);
  // Footer
  var footer=document.createElement('div'); footer.className='qp-footer';
  var confirmBtn=document.createElement('button'); confirmBtn.type='button'; confirmBtn.className='qp-btn'; confirmBtn.textContent='Confirmar reserva';
  confirmBtn.addEventListener('click',function(){
    var name=nameInp.value.trim(); var phone=phoneInp.value.trim(); var email=emailInp.value.trim();
    if(!name||!phone||!email){ errEl.textContent='Nombre, teléfono y email son obligatorios.'; errEl.style.display='block'; return; }
    errEl.style.display='none';
    nameInp.disabled=true; phoneInp.disabled=true; emailInp.disabled=true;
    confirmBtn.disabled=true; confirmBtn.textContent='Confirmando...';
    fetch('/api/public/'+SLUG+'/bookings',{
      method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({customer:{name:name,phone:phone,email:email,notes:''},slot:{date:S.date,time:S.time},providerId:S.providerId||undefined})
    })
    .then(function(r){ return r.json(); })
    .then(function(d){
      if(d.ok&&d.checkoutUrl){
        window.location.href=d.checkoutUrl;
      } else if(d.ok&&d.booking){
        renderBPPayment(d.booking.id,name);
      } else {
        nameInp.disabled=false; phoneInp.disabled=false; emailInp.disabled=false;
        confirmBtn.disabled=false; confirmBtn.textContent='Confirmar reserva';
        errEl.textContent=d.message||'No se pudo crear la reserva. Intenta de nuevo.'; errEl.style.display='block';
      }
    })
    .catch(function(){
      nameInp.disabled=false; phoneInp.disabled=false; emailInp.disabled=false;
      confirmBtn.disabled=false; confirmBtn.textContent='Confirmar reserva';
      errEl.textContent='Error de conexión. Intenta de nuevo.'; errEl.style.display='block';
    });
  });
  footer.appendChild(confirmBtn);
  panel.appendChild(body); panel.appendChild(footer);
  setTimeout(function(){ nameInp.focus(); },200);
}

function renderBPPayment(bookingId,name){
  var panel=document.getElementById('bookingPanel');
  panel.innerHTML='';
  var _bpDate=S.date; var _bpTime=S.time;
  panel.appendChild(makeBPHeader('Reserva lista',closeBookingPanel,'Cerrar'));
  // Body
  var body=document.createElement('div'); body.className='qp-body';
  // Indicador de éxito
  var successWrap=document.createElement('div'); successWrap.className='qp-empty'; successWrap.style.paddingTop='28px';
  var successIcon=document.createElement('div');
  successIcon.style.cssText='width:60px;height:60px;border-radius:18px;background:rgba(52,211,153,.12);display:flex;align-items:center;justify-content:center;font-size:30px;margin-bottom:6px';
  successIcon.textContent='✅';
  var successTitle=document.createElement('div'); successTitle.style.cssText='font-size:17px;font-weight:700;color:var(--text);margin-bottom:4px'; successTitle.textContent='Reserva creada';
  var successMsg=document.createElement('div'); successMsg.style.cssText='font-size:14px;color:var(--muted2);text-align:center;line-height:1.55'; successMsg.textContent='Para confirmar tu hora, completa el pago con MercadoPago.';
  successWrap.appendChild(successIcon); successWrap.appendChild(successTitle); successWrap.appendChild(successMsg);
  body.appendChild(successWrap);
  // Resumen
  var sumLbl=document.createElement('p'); sumLbl.className='qp-section-title'; sumLbl.textContent='Detalle de tu reserva';
  body.appendChild(sumLbl);
  var sumBox=document.createElement('div'); sumBox.className='qp-summary';
  sumBox.innerHTML='<div class="cart-line"><span>Nombre</span><span>'+escH(name)+'</span></div>'
    +'<div class="cart-line"><span>Fecha</span><span>'+escH(formatDate(S.date))+'</span></div>'
    +(S.providerName?'<div class="cart-line"><span>Con</span><span>'+escH(S.providerName)+'</span></div>':'')
    +'<div class="cart-line" style="margin-bottom:0"><span>Hora</span><span>'+escH(S.time)+'</span></div>';
  body.appendChild(sumBox);
  // Footer
  var footer=document.createElement('div'); footer.className='qp-footer';
  var errEl=document.createElement('div'); errEl.className='qp-error'; errEl.style.marginBottom='8px';
  var payBtn=document.createElement('button'); payBtn.type='button'; payBtn.className='qp-btn';
  payBtn.textContent='Pagar con MercadoPago →';
  payBtn.addEventListener('click',function(){
    payBtn.disabled=true; payBtn.textContent='Generando enlace...'; errEl.style.display='none';
    fetch('/api/public/'+SLUG+'/bookings/'+encodeURIComponent(bookingId)+'/pay',{
      method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({})
    })
    .then(function(r){ return r.json(); })
    .then(function(d){
      if(d.ok&&d.checkoutUrl){
        window.location.href=d.checkoutUrl;
      } else {
        payBtn.disabled=false; payBtn.textContent='Pagar con MercadoPago →';
        errEl.textContent=d.message||'No se pudo generar el enlace de pago.'; errEl.style.display='block';
      }
    })
    .catch(function(){
      payBtn.disabled=false; payBtn.textContent='Pagar con MercadoPago →';
      errEl.textContent='Error de conexión. Intenta de nuevo.'; errEl.style.display='block';
    });
  });
  var laterBtn=document.createElement('button'); laterBtn.type='button'; laterBtn.className='qp-empty-btn'; laterBtn.style.marginTop='8px';
  laterBtn.textContent='Pagar después';
  laterBtn.addEventListener('click',closeBookingPanel);
  footer.appendChild(errEl); footer.appendChild(payBtn); footer.appendChild(laterBtn);
  panel.appendChild(body); panel.appendChild(footer);
}

// ── PANEL DE COTIZACIÓN (slide-in) ────────────────────────────────────────────
function openQuotePanel(){
  S.cart={};
  renderQPStep1();
  document.getElementById('quotePanel').classList.add('open');
}
function closeQuotePanel(){
  document.getElementById('quotePanel').classList.remove('open');
  setTimeout(function(){ var p=document.getElementById('quotePanel'); if(p) p.innerHTML=''; },360);
}

function renderQPStep1(){
  var panel=document.getElementById('quotePanel');
  panel.innerHTML='';
  // Header
  var hdr=document.createElement('div'); hdr.className='qp-header';
  var back=document.createElement('button'); back.type='button'; back.className='qp-back';
  back.innerHTML='<svg viewBox="0 0 24 24" fill="none"><polyline points="15 18 9 12 15 6"/></svg>Volver';
  back.addEventListener('click',closeQuotePanel);
  var ttl=document.createElement('div'); ttl.className='qp-title'; ttl.textContent='Cotización';
  var spc=document.createElement('div'); spc.className='qp-spacer';
  hdr.appendChild(back); hdr.appendChild(ttl); hdr.appendChild(spc);
  // Footer
  var footer=document.createElement('div'); footer.className='qp-footer';
  var cartBar=document.createElement('div'); cartBar.className='qp-cart-bar'; cartBar.style.display='none';
  var cartInfo=document.createElement('span'); cartInfo.className='qp-cart-info';
  var cartTot=document.createElement('span'); cartTot.className='qp-cart-total';
  cartBar.appendChild(cartInfo); cartBar.appendChild(cartTot);
  var contBtn=document.createElement('button'); contBtn.type='button'; contBtn.className='qp-btn'; contBtn.textContent='Continuar →';
  function refreshFooter(){
    var total=0; var count=0;
    PRODUCTS.forEach(function(p){ var q=S.cart[p.id]||0; count+=q; total+=p.price*q; });
    if(count>0){
      cartBar.style.display='flex';
      cartInfo.textContent=count+(count!==1?' servicios':' servicio');
      cartTot.textContent=formatPrice(total);
    } else { cartBar.style.display='none'; }
  }
  // Body
  var body=document.createElement('div'); body.className='qp-body';
  var secLbl=document.createElement('p'); secLbl.className='qp-section-title'; secLbl.textContent='Elige tus servicios';
  body.appendChild(secLbl);
  if(!PRODUCTS||!PRODUCTS.length){
    var empty=document.createElement('div');
    empty.style.cssText='text-align:center;color:var(--muted2);padding:48px 0;font-size:14px';
    empty.textContent='No hay servicios disponibles por el momento.';
    body.appendChild(empty); contBtn.disabled=true;
  } else {
    var cardList=document.createElement('div'); cardList.className='product-cards';
    PRODUCTS.forEach(function(p){
      var card=document.createElement('div'); card.className='product-card';
      var info=document.createElement('div'); info.className='product-info';
      info.innerHTML='<div class="product-name">'+escH(p.name)+'</div>'
        +(p.description?'<div class="product-desc">'+escH(p.description)+'</div>':'')
        +'<div class="product-price">'+formatPrice(p.price)+'</div>';
      var qc=document.createElement('div'); qc.className='qty-ctrl';
      var minus=document.createElement('button'); minus.type='button'; minus.className='qty-btn'; minus.textContent='−';
      var num=document.createElement('span'); num.className='qty-num';
      var plus=document.createElement('button'); plus.type='button'; plus.className='qty-btn'; plus.textContent='+';
      var initQ=S.cart[p.id]||0; num.textContent=String(initQ); minus.disabled=initQ===0;
      (function(pid,numEl,minusEl){
        plus.addEventListener('click',function(){ S.cart[pid]=(S.cart[pid]||0)+1; numEl.textContent=String(S.cart[pid]); minusEl.disabled=false; refreshFooter(); });
        minusEl.addEventListener('click',function(){ S.cart[pid]=Math.max(0,(S.cart[pid]||0)-1); numEl.textContent=String(S.cart[pid]); if(!S.cart[pid]) minusEl.disabled=true; refreshFooter(); });
      })(p.id,num,minus);
      qc.appendChild(minus); qc.appendChild(num); qc.appendChild(plus);
      card.appendChild(info); card.appendChild(qc); cardList.appendChild(card);
    });
    body.appendChild(cardList);
    refreshFooter();
  }
  contBtn.addEventListener('click',function(){
    var hasItems=PRODUCTS.some(function(p){ return (S.cart[p.id]||0)>0; });
    if(!hasItems){ cartBar.style.display='flex'; cartInfo.textContent='Selecciona al menos un servicio.'; cartTot.textContent=''; return; }
    renderQPStep2();
  });
  footer.appendChild(cartBar); footer.appendChild(contBtn);
  panel.appendChild(hdr); panel.appendChild(body); panel.appendChild(footer);
}

function renderQPStep2(){
  var panel=document.getElementById('quotePanel');
  panel.innerHTML='';
  // Header
  var hdr=document.createElement('div'); hdr.className='qp-header';
  var back=document.createElement('button'); back.type='button'; back.className='qp-back';
  back.innerHTML='<svg viewBox="0 0 24 24" fill="none"><polyline points="15 18 9 12 15 6"/></svg>Atrás';
  back.addEventListener('click',renderQPStep1);
  var ttl=document.createElement('div'); ttl.className='qp-title'; ttl.textContent='Tus datos';
  var spc=document.createElement('div'); spc.className='qp-spacer';
  hdr.appendChild(back); hdr.appendChild(ttl); hdr.appendChild(spc);
  // Body
  var body=document.createElement('div'); body.className='qp-body';
  // Resumen del pedido
  var sumLbl=document.createElement('p'); sumLbl.className='qp-section-title'; sumLbl.textContent='Resumen del pedido';
  body.appendChild(sumLbl);
  var sumBox=document.createElement('div'); sumBox.className='qp-summary';
  var totalAmt=0;
  PRODUCTS.forEach(function(p){
    var q=S.cart[p.id]||0; if(!q) return;
    var sub=p.price*q; totalAmt+=sub;
    var row=document.createElement('div'); row.className='cart-line';
    row.innerHTML='<span>'+escH(p.name)+' ×'+q+'</span><span>'+formatPrice(sub)+'</span>';
    sumBox.appendChild(row);
  });
  var totRow=document.createElement('div'); totRow.className='cart-total';
  totRow.innerHTML='<span>Total estimado</span><span>'+formatPrice(totalAmt)+'</span>';
  sumBox.appendChild(totRow);
  body.appendChild(sumBox);
  // Formulario
  var formLbl=document.createElement('p'); formLbl.className='qp-section-title'; formLbl.textContent='¿A dónde enviamos la cotización?';
  body.appendChild(formLbl);
  var nameInp=document.createElement('input'); nameInp.type='text'; nameInp.placeholder='Nombre completo'; nameInp.className='qp-input'; nameInp.setAttribute('autocomplete','name');
  var phoneInp=document.createElement('input'); phoneInp.type='tel'; phoneInp.placeholder='Teléfono'; phoneInp.className='qp-input'; phoneInp.setAttribute('autocomplete','tel');
  var emailInp=document.createElement('input'); emailInp.type='email'; emailInp.placeholder='Email (opcional)'; emailInp.className='qp-input'; emailInp.setAttribute('autocomplete','email');
  var errEl=document.createElement('div'); errEl.className='qp-error';
  body.appendChild(nameInp); body.appendChild(phoneInp); body.appendChild(emailInp); body.appendChild(errEl);
  // Footer
  var footer=document.createElement('div'); footer.className='qp-footer';
  var sendBtn=document.createElement('button'); sendBtn.type='button'; sendBtn.className='qp-btn'; sendBtn.textContent='Enviar cotización';
  sendBtn.addEventListener('click',function(){
    var name=nameInp.value.trim(); var phone=phoneInp.value.trim(); var email=emailInp.value.trim();
    if(!name||!phone){ errEl.textContent='El nombre y teléfono son obligatorios.'; errEl.style.display='block'; return; }
    errEl.style.display='none';
    nameInp.disabled=true; phoneInp.disabled=true; emailInp.disabled=true;
    sendBtn.disabled=true; sendBtn.textContent='Enviando...';
    var items=PRODUCTS.filter(function(p){ return (S.cart[p.id]||0)>0; }).map(function(p){ return {productId:p.id,quantity:S.cart[p.id]}; });
    fetch('/shop/'+SLUG+'/quotes/submit',{
      method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({customer:{name:name,phone:phone,email:email||'',message:''},items:items})
    })
    .then(function(r){ return r.json(); })
    .then(function(d){
      if(d.ok){
        renderQPSuccess(name);
      } else {
        nameInp.disabled=false; phoneInp.disabled=false; emailInp.disabled=false;
        sendBtn.disabled=false; sendBtn.textContent='Enviar cotización';
        errEl.textContent=d.message||'No se pudo enviar. Intenta de nuevo.'; errEl.style.display='block';
      }
    })
    .catch(function(){
      nameInp.disabled=false; phoneInp.disabled=false; emailInp.disabled=false;
      sendBtn.disabled=false; sendBtn.textContent='Enviar cotización';
      errEl.textContent='Error de conexión. Intenta de nuevo.'; errEl.style.display='block';
    });
  });
  footer.appendChild(sendBtn);
  panel.appendChild(hdr); panel.appendChild(body); panel.appendChild(footer);
  setTimeout(function(){ nameInp.focus(); },200);
}

// ── Pantalla de éxito cotización ──────────────────────────────────────────────
function renderQPSuccess(name){
  var panel=document.getElementById('quotePanel');
  panel.innerHTML='';
  var hdr=document.createElement('div'); hdr.className='qp-header';
  var closeBtn=document.createElement('button'); closeBtn.type='button'; closeBtn.className='qp-back';
  closeBtn.innerHTML='<svg viewBox="0 0 24 24" fill="none"><polyline points="15 18 9 12 15 6"/></svg>Cerrar';
  closeBtn.addEventListener('click',closeQuotePanel);
  var ttl=document.createElement('div'); ttl.className='qp-title'; ttl.textContent='Cotización';
  var spc=document.createElement('div'); spc.className='qp-spacer';
  hdr.appendChild(closeBtn); hdr.appendChild(ttl); hdr.appendChild(spc);
  var body=document.createElement('div'); body.className='qp-body';
  var wrap=document.createElement('div'); wrap.className='qp-empty'; wrap.style.paddingTop='48px';
  var icon=document.createElement('div');
  icon.style.cssText='width:64px;height:64px;border-radius:18px;background:rgba(22,163,74,.1);display:flex;align-items:center;justify-content:center;font-size:32px;margin-bottom:16px';
  icon.textContent='✅';
  var title=document.createElement('div'); title.style.cssText='font-size:18px;font-weight:700;color:var(--text);margin-bottom:6px'; title.textContent='Cotización enviada';
  var msg=document.createElement('div'); msg.style.cssText='font-size:14px;color:var(--muted);text-align:center;line-height:1.6;max-width:240px'; msg.textContent='Te contactaremos pronto con el presupuesto, '+escH(name)+'.';
  var homeBtn=document.createElement('button'); homeBtn.type='button'; homeBtn.className='qp-btn'; homeBtn.style.marginTop='28px'; homeBtn.textContent='Volver al inicio';
  homeBtn.addEventListener('click',closeQuotePanel);
  wrap.appendChild(icon); wrap.appendChild(title); wrap.appendChild(msg); wrap.appendChild(homeBtn);
  body.appendChild(wrap);
  panel.appendChild(hdr); panel.appendChild(body);
}

// ── Init ──────────────────────────────────────────────────────────────────────
(function init(){
  var bookingBtn=document.getElementById('btn-booking');
  var quoteBtn=document.getElementById('btn-quote');
  if(bookingBtn) bookingBtn.addEventListener('click',openBookingPanel);
  if(quoteBtn)   quoteBtn.addEventListener('click',openQuotePanel);
})();
`;
}
