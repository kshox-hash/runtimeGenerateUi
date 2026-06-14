import { MenuModuleItem } from "../user-modules.repository";

type FlowStep = {
  text: string;
  chips: { label: string; next: string }[];
  tab?: string;
  delay?: number;
};

type ModuleCard = { emoji: string; title: string; desc: string; action: string };

function buildFlows(modules: MenuModuleItem[]): Record<string, { steps: Record<string, FlowStep> }> {
  const flows: Record<string, { steps: Record<string, FlowStep> }> = {};

  if (modules.some((m) => m.code === "reservas")) {
    flows.reservas = {
      steps: {
        start: {
          text: "¡Perfecto! ¿Tienes alguna preferencia para la reserva?",
          chips: [
            { label: "🚀 Lo antes posible", next: "now" },
            { label: "📅 Quiero elegir fecha", next: "date" },
            { label: "💬 Tengo una pregunta primero", next: "doubt" },
          ],
        },
        now: {
          text: "¡Entendido! Te llevo a los horarios disponibles. Elige el que más te acomode.",
          chips: [],
          tab: "reservas",
          delay: 1800,
        },
        date: {
          text: "Perfecto. En reservas puedes seleccionar exactamente el día y hora que prefieras.",
          chips: [],
          tab: "reservas",
          delay: 2000,
        },
        doubt: {
          text: "¡Sin problema! ¿Cuál es tu duda? Escríbela abajo y te ayudo.",
          chips: [],
        },
      },
    };
  }

  if (modules.some((m) => m.code === "cotizador")) {
    flows.cotizar = {
      steps: {
        start: {
          text: "¡Con gusto! ¿Sabes qué servicio necesitas cotizar?",
          chips: [
            { label: "✅ Sí, sé qué necesito", next: "knows" },
            { label: "📋 Quiero ver las opciones", next: "browse" },
            { label: "🤔 No estoy seguro/a", next: "unsure" },
          ],
        },
        knows: {
          text: "Perfecto. En Servicios seleccionas lo que necesitas y recibes el presupuesto por correo.",
          chips: [],
          tab: "cotizar",
          delay: 2200,
        },
        browse: {
          text: "Te muestro todo lo que ofrecemos para que elijas lo que necesitas.",
          chips: [],
          tab: "cotizar",
          delay: 1800,
        },
        unsure: {
          text: "Sin problema. Cuéntame qué necesitas y te oriento con las mejores opciones.",
          chips: [],
        },
      },
    };
  }

  return flows;
}

function buildModuleCards(modules: MenuModuleItem[]): ModuleCard[] {
  const cards: ModuleCard[] = [];

  if (modules.some((m) => m.code === "reservas")) {
    cards.push({ emoji: "📅", title: "Reservar una hora", desc: "Agenda tu cita disponible", action: "reservas" });
  }

  if (modules.some((m) => m.code === "cotizador")) {
    cards.push({ emoji: "🧾", title: "Pedir cotización", desc: "Recibe un presupuesto por correo", action: "cotizar" });
  }

  cards.push({ emoji: "💰", title: "Consultar precios", desc: "Conoce nuestras tarifas", action: "precios" });
  cards.push({ emoji: "💬", title: "¿Qué servicios ofrecen?", desc: "Descubre lo que hacemos", action: "info" });

  return cards;
}

export function portalScripts(slug: string, bizName: string, modules: MenuModuleItem[]): string {
  const flows = buildFlows(modules);
  const moduleCards = buildModuleCards(modules);

  return `
const SLUG='${slug}';
const BIZ=${JSON.stringify(bizName)};
const FLOWS=${JSON.stringify(flows)};
const MODULE_CARDS=${JSON.stringify(moduleCards)};
const TABS=['chat','reservas','cotizar','nosotros'];
let sending=false;

function showTab(t){
  TABS.forEach(function(x){
    document.getElementById('panel-'+x).classList.toggle('active',x===t);
  });
  var back=document.getElementById('btnBackChat');
  if(back) back.classList.toggle('visible',t!=='chat');
  if(t==='chat') scrollChat();
}

function scrollChat(){
  var el=document.getElementById('chatMsgs');
  if(el) requestAnimationFrame(function(){ el.scrollTop=el.scrollHeight; });
}

function renderMd(t){
  return t
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/\\*\\*([^]+?)\\*\\*/g,'<b>$1</b>')
    .replace(/\\n/g,'<br>');
}

function typeWrite(el,rawText){
  el.classList.add('typing');
  var chars=Array.from(rawText);
  var i=0;
  (function tick(){
    if(i<chars.length){
      var c=chars[i]; i++;
      el.innerHTML=renderMd(chars.slice(0,i).join(''));
      setTimeout(tick,c==='\\n'?80:11);
      scrollChat();
    } else {
      el.innerHTML=renderMd(rawText);
      el.classList.remove('typing');
      scrollChat();
    }
  })();
}

function addUser(text){
  var row=document.createElement('div');
  row.className='user-row';
  var pill=document.createElement('div');
  pill.className='user-pill';
  pill.textContent=text;
  row.appendChild(pill);
  document.getElementById('chatMsgs').appendChild(row);
  scrollChat();
}

function addAi(text,animate){
  var row=document.createElement('div');
  row.className='ai-row';
  var icon=document.createElement('div');
  icon.className='ai-icon-sm';
  icon.textContent='\\u2726';
  var body=document.createElement('div');
  body.className='ai-body';
  var lbl=document.createElement('div');
  lbl.className='ai-label';
  lbl.textContent=BIZ;
  var textEl=document.createElement('div');
  textEl.className='ai-text';
  body.appendChild(lbl);
  body.appendChild(textEl);
  row.appendChild(icon);
  row.appendChild(body);
  document.getElementById('chatMsgs').appendChild(row);
  if(animate!==false){ typeWrite(textEl,text); }
  else { textEl.innerHTML=renderMd(text); scrollChat(); }
}

function addAiWithChips(text,chips){
  var row=document.createElement('div');
  row.className='ai-row';
  var icon=document.createElement('div');
  icon.className='ai-icon-sm';
  icon.textContent='\\u2726';
  var body=document.createElement('div');
  body.className='ai-body';
  var lbl=document.createElement('div');
  lbl.className='ai-label';
  lbl.textContent=BIZ;
  var textEl=document.createElement('div');
  textEl.className='ai-text';
  textEl.innerHTML=renderMd(text);
  body.appendChild(lbl);
  body.appendChild(textEl);
  if(chips&&chips.length){
    var chipsEl=document.createElement('div');
    chipsEl.className='ai-chips';
    chips.forEach(function(chip){
      var btn=document.createElement('button');
      btn.type='button';
      btn.className='ai-chip';
      btn.textContent=chip.label;
      btn.addEventListener('click',function(){
        chipsEl.querySelectorAll('.ai-chip').forEach(function(x){ x.classList.add('used'); });
        addUser(chip.label);
        chip.onClick();
      });
      chipsEl.appendChild(btn);
    });
    body.appendChild(chipsEl);
  }
  row.appendChild(icon);
  row.appendChild(body);
  document.getElementById('chatMsgs').appendChild(row);
  scrollChat();
}

function runFlowStep(flowName,stepId){
  var flow=FLOWS[flowName];
  if(!flow) return;
  var step=flow.steps[stepId];
  if(!step) return;
  showTyping();
  setTimeout(function(){
    hideTyping();
    var chips=(step.chips||[]).map(function(c){
      return {
        label:c.label,
        onClick:(function(n){ return function(){ runFlowStep(flowName,n); }; })(c.next)
      };
    });
    addAiWithChips(step.text,chips);
    if(step.tab){
      setTimeout(function(){ showTab(step.tab); },step.delay||2000);
    }
  },900);
}

function showTyping(){
  var row=document.createElement('div');
  row.className='typing-row';
  row.id='typingRow';
  var icon=document.createElement('div');
  icon.className='ai-icon-sm';
  icon.textContent='\\u2726';
  var dots=document.createElement('div');
  dots.className='typing-dots';
  dots.innerHTML='<span></span><span></span><span></span>';
  row.appendChild(icon);
  row.appendChild(dots);
  document.getElementById('chatMsgs').appendChild(row);
  scrollChat();
}

function hideTyping(){
  var r=document.getElementById('typingRow');
  if(r) r.remove();
}

function addAiWithModules(){
  var row=document.createElement('div');
  row.className='ai-row ai-row--intro';
  var icon=document.createElement('div');
  icon.className='ai-icon-sm';
  icon.textContent='\\u2726';
  var body=document.createElement('div');
  body.className='ai-body';
  var lbl=document.createElement('div');
  lbl.className='ai-label';
  lbl.textContent=BIZ;
  var textEl=document.createElement('div');
  textEl.className='ai-text ai-greeting';
  textEl.innerHTML='Hola! Soy el asistente de <b>'+BIZ+'</b>. \\u00bfEn qu\\u00e9 te puedo ayudar hoy?';
  var mods=document.createElement('div');
  mods.className='ai-modules';
  MODULE_CARDS.forEach(function(m){
    var card=document.createElement('button');
    card.type='button';
    card.className='ai-mod-card';
    card.innerHTML='<span class="ai-mod-emoji">'+m.emoji+'</span><div class="ai-mod-texts"><div class="ai-mod-title">'+m.title+'</div><div class="ai-mod-desc">'+m.desc+'</div></div><svg class="ai-mod-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>';
    card.addEventListener('click',(function(action,modsEl){
      return function(){
        modsEl.querySelectorAll('.ai-mod-card').forEach(function(c){ c.classList.add('used'); });
        quickAction(action);
      };
    })(m.action,mods));
    mods.appendChild(card);
  });
  body.appendChild(lbl);
  body.appendChild(textEl);
  body.appendChild(mods);
  row.appendChild(icon);
  row.appendChild(body);
  document.getElementById('chatMsgs').appendChild(row);
  scrollChat();
}

async function sendMsg(){
  if(sending) return;
  var inp=document.getElementById('chatInput');
  var q=inp.value.trim();
  if(!q) return;
  inp.value=''; inp.style.height='auto';
  addUser(q);
  showTyping();
  sending=true;
  document.getElementById('sendBtn').disabled=true;
  try{
    var r=await fetch('/api/public/'+SLUG+'/chat',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({question:q})
    });
    var d=await r.json();
    hideTyping();
    if(d.answer){
      addAi(d.answer);
    } else {
      addAi(d.message||'No encontr\\u00e9 informaci\\u00f3n sobre eso. \\u00bfPuedes reformular tu pregunta?',false);
    }
  }catch(e){
    hideTyping();
    addAi('Hubo un problema al conectar. Intenta de nuevo.',false);
  }finally{
    sending=false;
    document.getElementById('sendBtn').disabled=false;
  }
}

function quickAction(a){
  if(a==='reservas'){
    addUser('Quiero reservar una hora');
    runFlowStep('reservas','start');
  } else if(a==='cotizar'){
    addUser('Quiero pedir una cotizaci\\u00f3n');
    runFlowStep('cotizar','start');
  } else if(a==='precios'){
    document.getElementById('chatInput').value='\\u00bfCu\\u00e1les son los precios?';
    sendMsg();
  } else if(a==='info'){
    document.getElementById('chatInput').value='\\u00bfQu\\u00e9 servicios ofrecen?';
    sendMsg();
  }
}

(function init(){
  var inp=document.getElementById('chatInput');
  var btn=document.getElementById('sendBtn');

  btn.addEventListener('click',function(){ sendMsg(); });
  btn.addEventListener('touchend',function(e){ e.preventDefault(); sendMsg(); });

  inp.addEventListener('input',function(){
    this.style.height='auto';
    this.style.height=Math.min(this.scrollHeight,160)+'px';
  });
  inp.addEventListener('keydown',function(e){
    if(e.key==='Enter'&&!e.shiftKey){ e.preventDefault(); sendMsg(); }
  });

  var backBtn=document.getElementById('btnBackChat');
  if(backBtn) backBtn.addEventListener('click',function(){ showTab('chat'); });

  setTimeout(function(){ addAiWithModules(); },600);
})();
`;
}
