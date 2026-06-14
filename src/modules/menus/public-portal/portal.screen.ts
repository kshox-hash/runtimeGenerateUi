import { escapeHtml } from "../../../utils/html";

export type PortalViewData = {
  businessName: string;
  publicSlug: string;
  productCount: number;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
};

export function renderPortalHtml(data: PortalViewData): string {
  const { businessName, publicSlug, productCount, phone, address, city } = data;

  const safe = {
    name:    escapeHtml(businessName),
    slug:    escapeHtml(publicSlug),
    phone:   phone   ? escapeHtml(phone)   : null,
    address: address ? escapeHtml(address) : null,
    city:    city    ? escapeHtml(city)    : null,
  };

  const initials = businessName.split(" ").slice(0, 2)
    .map(w => w[0] ?? "").join("").toUpperCase() || "?";

  const locationLine = [safe.address, safe.city].filter(Boolean).join(", ");

  return `<!doctype html>
<html lang="es">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"/>
<meta name="theme-color" content="#0a0b0f"/>
<title>${safe.name}</title>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"/>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#0a0b0f;
  --s1:#111318;
  --s2:#191c24;
  --s3:#20242f;
  --border:rgba(255,255,255,.065);
  --primary:#5b9cf6;
  --primary-dim:rgba(91,156,246,.12);
  --primary-glow:rgba(91,156,246,.2);
  --accent:#a78bfa;
  --text:#e2e4ea;
  --muted:#565e75;
  --muted2:#8891a8;
  --green:#34d399;
  --hdr:56px;
  --nav:60px;
  --r:16px;
}
html,body{height:100%;background:var(--bg);color:var(--text);font-family:'Inter',system-ui,sans-serif;-webkit-font-smoothing:antialiased;overflow:hidden}

/* HEADER */
.hdr{
  position:fixed;top:0;left:0;right:0;height:var(--hdr);
  background:rgba(10,11,15,.88);border-bottom:1px solid var(--border);
  backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);
  display:flex;align-items:center;gap:11px;padding:0 16px;z-index:200;
}
.hdr-av{
  width:34px;height:34px;border-radius:50%;flex-shrink:0;
  background:linear-gradient(135deg,var(--primary),var(--accent));
  display:flex;align-items:center;justify-content:center;
  font-size:12px;font-weight:700;color:#fff;
}
.hdr-name{font-size:15px;font-weight:600;flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;letter-spacing:-.012em}
.hdr-badge{
  font-size:10.5px;font-weight:500;
  background:rgba(52,211,153,.1);color:var(--green);
  border:1px solid rgba(52,211,153,.2);border-radius:20px;padding:3px 9px;
  display:flex;align-items:center;gap:5px;flex-shrink:0;
}
.hdr-badge::before{content:'';width:5px;height:5px;border-radius:50%;background:var(--green);animation:bpulse 2.5s infinite}
@keyframes bpulse{0%,100%{opacity:1}50%{opacity:.3}}

/* LAYOUT */
.main{position:fixed;top:var(--hdr);bottom:calc(var(--nav) + env(safe-area-inset-bottom));left:0;right:0;overflow:hidden}
.panel{position:absolute;inset:0;display:none;flex-direction:column;overflow:hidden}
.panel.active{display:flex}
.panel-scroll{flex:1;overflow-y:auto;padding:20px 16px 16px;-webkit-overflow-scrolling:touch}

/* BOTTOM NAV */
.nav{
  position:fixed;bottom:0;left:0;right:0;
  height:calc(var(--nav) + env(safe-area-inset-bottom));
  padding-bottom:env(safe-area-inset-bottom);
  background:rgba(10,11,15,.94);border-top:1px solid var(--border);
  backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);
  display:grid;grid-template-columns:repeat(4,1fr);z-index:200;
}
.nb{
  background:none;border:none;color:var(--muted);
  display:flex;flex-direction:column;align-items:center;justify-content:center;
  gap:4px;cursor:pointer;font-family:inherit;
  transition:color .2s;-webkit-tap-highlight-color:transparent;
}
.nb.active{color:var(--primary)}
.nb svg{width:21px;height:21px;stroke-width:1.8;transition:transform .18s}
.nb.active svg{transform:scale(1.1)}
.nb span{font-size:10px;font-weight:500;letter-spacing:.025em}

/* CHAT — welcome state */
.chat-welcome{
  flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;
  display:flex;flex-direction:column;align-items:center;
  justify-content:center;padding:28px 24px 12px;gap:20px;
}
.welcome-icon{
  width:64px;height:64px;border-radius:22px;
  background:linear-gradient(145deg,var(--primary),var(--accent));
  display:flex;align-items:center;justify-content:center;
  font-size:28px;color:#fff;
  box-shadow:0 8px 32px var(--primary-glow),0 0 0 1px rgba(91,156,246,.18);
}
.welcome-title{font-size:22px;font-weight:700;letter-spacing:-.025em;text-align:center;line-height:1.25}
.welcome-sub{font-size:14.5px;color:var(--muted2);text-align:center;line-height:1.55;max-width:270px}
.prompts-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;width:100%;max-width:340px}
.prompt-card{
  background:var(--s1);border:1px solid var(--border);border-radius:14px;
  padding:13px 14px;text-align:left;cursor:pointer;
  transition:background .15s,border-color .15s,transform .12s;
  -webkit-tap-highlight-color:transparent;font-family:inherit;color:var(--text);
  display:flex;flex-direction:column;align-items:flex-start;gap:6px;
}
.prompt-card:hover{background:var(--s2);border-color:rgba(91,156,246,.22)}
.prompt-card:active{transform:scale(.96)}
.prompt-card-emoji{font-size:20px}
.prompt-card-text{font-size:12.5px;color:var(--muted2);line-height:1.4}

/* CHAT — messages */
.chat-msgs{
  flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;
  padding:18px 14px 6px;display:flex;flex-direction:column;gap:0;
  background:
    radial-gradient(ellipse at 8% 4%,rgba(91,156,246,.04) 0%,transparent 55%),
    radial-gradient(ellipse at 92% 96%,rgba(167,139,250,.035) 0%,transparent 55%),
    var(--bg);
}
.chat-msgs.hidden{display:none}

/* user pill */
.user-row{display:flex;justify-content:flex-end;margin:3px 0 14px;animation:msgIn .2s ease-out both}
.user-pill{
  max-width:78%;background:var(--s2);
  border:1px solid rgba(255,255,255,.08);
  border-radius:20px 20px 5px 20px;
  padding:11px 16px;font-size:15px;line-height:1.56;
  color:var(--text);word-break:break-word;
}

/* ai row */
.ai-row{display:flex;gap:10px;align-items:flex-start;margin:3px 0 18px;animation:msgIn .22s ease-out both}
@keyframes msgIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}

.ai-icon-sm{
  width:30px;height:30px;border-radius:10px;flex-shrink:0;margin-top:2px;
  background:linear-gradient(145deg,var(--primary),var(--accent));
  display:flex;align-items:center;justify-content:center;
  font-size:13px;color:#fff;
}
.ai-body{flex:1;min-width:0}
.ai-label{font-size:11.5px;font-weight:600;color:var(--primary);margin-bottom:6px;letter-spacing:.01em}
.ai-text{font-size:15.5px;line-height:1.75;color:var(--text);word-break:break-word}
.ai-text b{color:#fff;font-weight:600}

/* cursor blinking while typewriting */
.ai-text.typing::after{
  content:'▋';color:var(--primary);
  animation:blink .9s step-end infinite;font-size:12px;vertical-align:middle;margin-left:1px;
}
@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}

/* typing indicator */
.typing-row{display:flex;gap:10px;align-items:flex-start;margin:3px 0 8px;animation:msgIn .18s ease-out both}
.typing-dots{display:flex;align-items:center;gap:5px;padding:10px 2px}
.typing-dots span{
  width:7px;height:7px;border-radius:50%;background:var(--muted2);
  animation:tdot 1.4s ease-in-out infinite;
}
.typing-dots span:nth-child(2){animation-delay:.17s}
.typing-dots span:nth-child(3){animation-delay:.34s}
@keyframes tdot{0%,60%,100%{transform:translateY(0);opacity:.4}28%{transform:translateY(-7px);opacity:1}}

/* CHAT — input */
.chat-bar{
  padding:10px 14px 10px;
  background:transparent;flex-shrink:0;
}
.input-box{
  position:relative;background:var(--s1);
  border:1px solid var(--border);border-radius:18px;
  transition:border-color .2s,box-shadow .2s;
}
.input-box:focus-within{
  border-color:rgba(91,156,246,.38);
  box-shadow:0 0 0 4px rgba(91,156,246,.07);
}
.msg-input{
  display:block;width:100%;background:none;border:none;outline:none;
  padding:14px 56px 14px 18px;color:var(--text);
  font-size:15px;font-family:inherit;resize:none;line-height:1.5;
  min-height:50px;max-height:160px;
}
.msg-input::placeholder{color:var(--muted)}
.send-btn{
  position:absolute;right:7px;bottom:6px;
  width:40px;height:40px;border-radius:12px;
  background:var(--primary);border:none;cursor:pointer;
  display:flex;align-items:center;justify-content:center;
  transition:background .15s,transform .12s,opacity .15s;
  -webkit-tap-highlight-color:transparent;
}
.send-btn:hover{background:#4a8de0}
.send-btn:active{transform:scale(.86)}
.send-btn:disabled{opacity:.28;cursor:default}
.send-btn svg{width:16px;height:16px;fill:#fff;margin-left:2px}
.input-hint{font-size:11px;color:var(--muted);text-align:center;padding:5px 0 2px}

/* OTHER TABS */
.sec-label{font-size:11.5px;font-weight:600;color:var(--muted2);text-transform:uppercase;letter-spacing:.07em;padding:18px 0 10px}
.mod-card{
  background:var(--s1);border:1px solid var(--border);border-radius:var(--r);
  padding:16px 15px;display:flex;align-items:center;gap:13px;
  text-decoration:none;color:inherit;margin-bottom:8px;
  transition:background .15s,border-color .15s;
  -webkit-tap-highlight-color:transparent;cursor:pointer;
}
.mod-card:active{background:var(--s2);border-color:rgba(91,156,246,.2)}
.mod-icon{width:46px;height:46px;border-radius:13px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.mod-icon svg{width:22px;height:22px}
.mod-texts{flex:1;min-width:0}
.mod-title{font-size:15px;font-weight:600;margin-bottom:3px;letter-spacing:-.01em}
.mod-desc{font-size:13px;color:var(--muted2);line-height:1.4}
.mod-arrow svg{width:16px;height:16px;stroke:var(--muted)}

.steps-list{display:flex;flex-direction:column;gap:8px;margin-top:4px}
.step-item{display:flex;align-items:center;gap:12px;background:var(--s1);border:1px solid var(--border);border-radius:13px;padding:12px 14px}
.step-num{width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;flex-shrink:0}
.step-text{font-size:13.5px;line-height:1.4}

/* nosotros */
.biz-hero{display:flex;flex-direction:column;align-items:center;padding:24px 0 20px;text-align:center}
.biz-av{width:72px;height:72px;border-radius:22px;background:linear-gradient(145deg,var(--primary),var(--accent));display:flex;align-items:center;justify-content:center;font-size:26px;font-weight:700;color:#fff;margin-bottom:13px;box-shadow:0 8px 28px var(--primary-glow)}
.biz-name{font-size:20px;font-weight:700;letter-spacing:-.022em;margin-bottom:3px}
.biz-tag{font-size:13px;color:var(--muted2)}

.info-group{background:var(--s1);border:1px solid var(--border);border-radius:var(--r);overflow:hidden}
.info-row{display:flex;align-items:center;gap:13px;padding:14px 15px;text-decoration:none;color:inherit;border-bottom:1px solid var(--border);cursor:default;transition:background .14s}
.info-row:last-child{border-bottom:none}
a.info-row,button.info-row{cursor:pointer;background:none;border:none;width:100%;text-align:left;font-family:inherit;color:var(--text)}
a.info-row:active,button.info-row:active{background:var(--s2)}
.info-icon{width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.info-icon svg{width:17px;height:17px}
.info-label{font-size:11px;color:var(--muted2);margin-bottom:2px}
.info-val{font-size:14px;font-weight:500}

::-webkit-scrollbar{width:0;height:0}
</style>
</head>
<body>

<header class="hdr">
  <div class="hdr-av">${initials}</div>
  <div class="hdr-name">${safe.name}</div>
  <div class="hdr-badge">En línea</div>
</header>

<main class="main">

  <!-- CHAT -->
  <div id="panel-chat" class="panel active">

    <div class="chat-welcome" id="chatWelcome">
      <div class="welcome-icon">✦</div>
      <div class="welcome-title">Hola, soy el asistente<br>de ${safe.name}</div>
      <div class="welcome-sub">Puedo responder tus preguntas, ayudarte a reservar o cotizar servicios.</div>
      <div class="prompts-grid">
        <button class="prompt-card" onclick="quickAction('reservas')">
          <span class="prompt-card-emoji">📅</span>
          <span class="prompt-card-text">Quiero reservar una hora</span>
        </button>
        <button class="prompt-card" onclick="quickAction('cotizar')">
          <span class="prompt-card-emoji">🧾</span>
          <span class="prompt-card-text">Pedir una cotización</span>
        </button>
        <button class="prompt-card" onclick="quickAction('precios')">
          <span class="prompt-card-emoji">💰</span>
          <span class="prompt-card-text">¿Cuáles son los precios?</span>
        </button>
        <button class="prompt-card" onclick="quickAction('info')">
          <span class="prompt-card-emoji">💬</span>
          <span class="prompt-card-text">¿Qué servicios ofrecen?</span>
        </button>
      </div>
    </div>

    <div class="chat-msgs hidden" id="chatMsgs"></div>

    <div class="chat-bar">
      <div class="input-box">
        <textarea class="msg-input" id="chatInput" placeholder="Pregúntame lo que quieras…" rows="1"></textarea>
        <button class="send-btn" id="sendBtn" type="button">
          <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
        </button>
      </div>
      <div class="input-hint">Asistente de ${safe.name}</div>
    </div>
  </div>

  <!-- RESERVAS -->
  <div id="panel-reservas" class="panel">
    <div class="panel-scroll">
      <p class="sec-label">Agenda tu hora</p>
      <a class="mod-card" href="/open/${safe.slug}/reservas">
        <div class="mod-icon" style="background:rgba(91,156,246,.1)">
          <svg viewBox="0 0 24 24" fill="none" stroke="#5b9cf6" stroke-width="1.8"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        </div>
        <div class="mod-texts">
          <div class="mod-title">Reservar una hora</div>
          <div class="mod-desc">Elige el día y horario disponible</div>
        </div>
        <div class="mod-arrow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg></div>
      </a>
      <p class="sec-label" style="padding-top:14px">¿Cómo funciona?</p>
      <div class="steps-list">
        ${[['rgba(91,156,246,.1)','#5b9cf6','Selecciona el día disponible'],
           ['rgba(167,139,250,.1)','#a78bfa','Elige el horario que te acomode'],
           ['rgba(52,211,153,.1)','#34d399','Ingresa tus datos y confirma']
          ].map(([bg,col,txt],i) => `
        <div class="step-item">
          <div class="step-num" style="background:${bg};color:${col}">${i+1}</div>
          <div class="step-text">${txt}</div>
        </div>`).join('')}
      </div>
    </div>
  </div>

  <!-- SERVICIOS -->
  <div id="panel-cotizar" class="panel">
    <div class="panel-scroll">
      <p class="sec-label">Solicita una cotización</p>
      <a class="mod-card" href="/shop/${safe.slug}/cotizador">
        <div class="mod-icon" style="background:rgba(167,139,250,.1)">
          <svg viewBox="0 0 24 24" fill="none" stroke="#a78bfa" stroke-width="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
        </div>
        <div class="mod-texts">
          <div class="mod-title">Cotizar servicios</div>
          <div class="mod-desc">${productCount > 0 ? `${productCount} servicio${productCount !== 1 ? 's' : ''} disponible${productCount !== 1 ? 's' : ''}` : 'Selecciona y recibe tu presupuesto'}</div>
        </div>
        <div class="mod-arrow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg></div>
      </a>
      <p class="sec-label" style="padding-top:14px">¿Cómo funciona?</p>
      <div class="steps-list">
        ${[['rgba(167,139,250,.1)','#a78bfa','Selecciona los servicios que necesitas'],
           ['rgba(91,156,246,.1)','#5b9cf6','Ingresa tus datos de contacto'],
           ['rgba(52,211,153,.1)','#34d399','Recibes la cotización por correo']
          ].map(([bg,col,txt],i) => `
        <div class="step-item">
          <div class="step-num" style="background:${bg};color:${col}">${i+1}</div>
          <div class="step-text">${txt}</div>
        </div>`).join('')}
      </div>
    </div>
  </div>

  <!-- NOSOTROS -->
  <div id="panel-nosotros" class="panel">
    <div class="panel-scroll">
      <div class="biz-hero">
        <div class="biz-av">${initials}</div>
        <div class="biz-name">${safe.name}</div>
        <div class="biz-tag">Perfil del negocio</div>
      </div>
      <div class="info-group">
        ${safe.phone ? `
        <a class="info-row" href="tel:${safe.phone}">
          <div class="info-icon" style="background:rgba(52,211,153,.1)">
            <svg viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="1.8"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
          </div>
          <div>
            <div class="info-label">Teléfono</div>
            <div class="info-val">${safe.phone}</div>
          </div>
        </a>` : ''}
        ${locationLine ? `
        <div class="info-row">
          <div class="info-icon" style="background:rgba(91,156,246,.1)">
            <svg viewBox="0 0 24 24" fill="none" stroke="#5b9cf6" stroke-width="1.8"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          </div>
          <div>
            <div class="info-label">Ubicación</div>
            <div class="info-val">${locationLine}</div>
          </div>
        </div>` : ''}
        <button class="info-row" onclick="showTab('chat')">
          <div class="info-icon" style="background:rgba(91,156,246,.1)">
            <svg viewBox="0 0 24 24" fill="none" stroke="#5b9cf6" stroke-width="1.8"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          </div>
          <div>
            <div class="info-label">Atención</div>
            <div class="info-val">Chatea con nosotros</div>
          </div>
        </button>
      </div>
    </div>
  </div>

</main>

<nav class="nav">
  <button class="nb active" id="nb-chat" type="button">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
    <span>Chat</span>
  </button>
  <button class="nb" id="nb-reservas" type="button">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
    <span>Reservas</span>
  </button>
  <button class="nb" id="nb-cotizar" type="button">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/></svg>
    <span>Servicios</span>
  </button>
  <button class="nb" id="nb-nosotros" type="button">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
    <span>Nosotros</span>
  </button>
</nav>

<script>
const SLUG = '${safe.slug}';
const BIZ  = ${JSON.stringify(safe.name)};
const INIT = '${initials.slice(0,1)}';
const TABS = ['chat','reservas','cotizar','nosotros'];
let chatStarted = false;
let sending     = false;

function showTab(t){
  TABS.forEach(x=>{
    document.getElementById('panel-'+x).classList.toggle('active',x===t);
    document.getElementById('nb-'+x).classList.toggle('active',x===t);
  });
  if(t==='chat') scrollChat();
}

function scrollChat(){
  const el = chatStarted ? document.getElementById('chatMsgs') : document.getElementById('chatWelcome');
  if(el) requestAnimationFrame(()=>{ el.scrollTop=el.scrollHeight; });
}

function startChat(){
  if(chatStarted) return;
  chatStarted=true;
  document.getElementById('chatWelcome').style.display='none';
  document.getElementById('chatMsgs').classList.remove('hidden');
}

/* mini markdown: **bold** and newlines */
function renderMd(t){
  return t
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/\*\*(.+?)\*\*/g,'<b>$1</b>')
    .replace(/\n/g,'<br>');
}

/* typewriter for AI responses */
function typeWrite(el, rawText){
  el.classList.add('typing');
  const chars=[...rawText];
  let i=0;
  (function tick(){
    if(i<chars.length){
      i++;
      el.innerHTML=renderMd(chars.slice(0,i).join(''));
      setTimeout(tick, chars[i-1]==='\n'?80:12);
      scrollChat();
    } else {
      el.innerHTML=renderMd(rawText);
      el.classList.remove('typing');
      scrollChat();
    }
  })();
}

function addUser(text){
  startChat();
  const row=document.createElement('div');
  row.className='user-row';
  const pill=document.createElement('div');
  pill.className='user-pill';
  pill.textContent=text;
  row.appendChild(pill);
  document.getElementById('chatMsgs').appendChild(row);
  scrollChat();
}

function addAi(text, animate){
  startChat();
  const row=document.createElement('div');
  row.className='ai-row';
  const icon=document.createElement('div');
  icon.className='ai-icon-sm';
  icon.textContent='✦';
  const body=document.createElement('div');
  body.className='ai-body';
  const label=document.createElement('div');
  label.className='ai-label';
  label.textContent=BIZ;
  const textEl=document.createElement('div');
  textEl.className='ai-text';
  body.appendChild(label);
  body.appendChild(textEl);
  row.appendChild(icon);
  row.appendChild(body);
  document.getElementById('chatMsgs').appendChild(row);
  if(animate!==false){
    typeWrite(textEl,text);
  } else {
    textEl.innerHTML=renderMd(text);
    scrollChat();
  }
}

function showTyping(){
  startChat();
  const row=document.createElement('div');
  row.className='typing-row'; row.id='typingRow';
  const icon=document.createElement('div');
  icon.className='ai-icon-sm'; icon.textContent='✦';
  const dots=document.createElement('div');
  dots.className='typing-dots';
  dots.innerHTML='<span></span><span></span><span></span>';
  row.appendChild(icon); row.appendChild(dots);
  document.getElementById('chatMsgs').appendChild(row);
  scrollChat();
}
function hideTyping(){ const r=document.getElementById('typingRow'); if(r) r.remove(); }

async function sendMsg(){
  if(sending) return;
  const inp=document.getElementById('chatInput');
  const q=inp.value.trim();
  if(!q) return;
  inp.value=''; inp.style.height='auto';
  addUser(q);
  showTyping();
  sending=true;
  document.getElementById('sendBtn').disabled=true;
  try{
    const r=await fetch('/api/public/'+SLUG+'/chat',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({question:q})
    });
    const d=await r.json();
    hideTyping();
    addAi(d.answer||'No pude procesar tu pregunta. Intenta de nuevo.');
  }catch{
    hideTyping();
    addAi('Hubo un problema al conectar. Por favor intenta de nuevo.',false);
  }finally{
    sending=false;
    document.getElementById('sendBtn').disabled=false;
  }
}

function quickAction(a){
  if(a==='reservas'){
    addUser('Quiero reservar una hora');
    showTyping();
    setTimeout(()=>{
      hideTyping();
      addAi('Con gusto 📅 Te llevo a la sección de reservas donde puedes ver la disponibilidad y agendar tu hora.');
      setTimeout(()=>showTab('reservas'),2400);
    },900);
  } else if(a==='cotizar'){
    addUser('Quiero pedir una cotización');
    showTyping();
    setTimeout(()=>{
      hideTyping();
      addAi('Claro 🧾 En la sección Servicios puedes seleccionar lo que necesitas y recibirás el presupuesto por correo.');
      setTimeout(()=>showTab('cotizar'),2600);
    },900);
  } else if(a==='precios'){
    document.getElementById('chatInput').value='¿Cuáles son los precios?';
    sendMsg();
  } else if(a==='info'){
    document.getElementById('chatInput').value='¿Qué servicios ofrecen?';
    sendMsg();
  }
}

document.addEventListener('DOMContentLoaded',function(){

  /* send button y textarea */
  var inp = document.getElementById('chatInput');
  var btn = document.getElementById('sendBtn');

  btn.addEventListener('click', function(){ sendMsg(); });
  btn.addEventListener('touchend', function(e){ e.preventDefault(); sendMsg(); });

  inp.addEventListener('input',function(){
    this.style.height='auto';
    this.style.height=Math.min(this.scrollHeight,160)+'px';
  });
  inp.addEventListener('keydown',function(e){
    if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendMsg();}
  });

  /* nav buttons */
  document.getElementById('nb-chat').addEventListener('click',function(){ showTab('chat'); });
  document.getElementById('nb-reservas').addEventListener('click',function(){ showTab('reservas'); });
  document.getElementById('nb-cotizar').addEventListener('click',function(){ showTab('cotizar'); });
  document.getElementById('nb-nosotros').addEventListener('click',function(){ showTab('nosotros'); });

  /* prompt cards */
  var cards = document.querySelectorAll('.prompt-card');
  cards[0] && cards[0].addEventListener('click', function(){ quickAction('reservas'); });
  cards[1] && cards[1].addEventListener('click', function(){ quickAction('cotizar'); });
  cards[2] && cards[2].addEventListener('click', function(){ quickAction('precios'); });
  cards[3] && cards[3].addEventListener('click', function(){ quickAction('info'); });

  /* saludo automático al abrir */
  setTimeout(function(){
    startChat();
    addAi('¡Hola! 👋 Soy el asistente de **' + BIZ + '**. Estoy aquí para ayudarte con preguntas sobre nuestros servicios, precios y disponibilidad. ¿En qué te puedo ayudar hoy?');
  }, 600);
});
</script>
</body>
</html>`;
}
