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
<meta name="theme-color" content="#07090c"/>
<title>${safe.name}</title>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,400;0,14..32,500;0,14..32,600;0,14..32,700&display=swap" rel="stylesheet"/>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#07090c;
  --s1:#0d1017;
  --s2:#141920;
  --s3:#1b2230;
  --border:rgba(255,255,255,.07);
  --border-focus:rgba(74,158,255,.45);
  --primary:#4a9eff;
  --primary-dark:#3479d4;
  --primary-glow:rgba(74,158,255,.25);
  --accent:#7c5cfc;
  --text:#e4e8f0;
  --muted:#5a6478;
  --muted2:#8492a8;
  --green:#22c55e;
  --hdr:58px;
  --nav:62px;
  --r:20px;
}
html,body{height:100%;background:var(--bg);color:var(--text);font-family:'Inter',system-ui,sans-serif;-webkit-font-smoothing:antialiased;overflow:hidden}

/* ══ HEADER ══════════════════════════════════════════ */
.hdr{
  position:fixed;top:0;left:0;right:0;height:var(--hdr);
  background:rgba(13,16,23,.92);
  border-bottom:1px solid var(--border);
  backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);
  display:flex;align-items:center;gap:12px;padding:0 16px;z-index:200;
}
.hdr-avatar{
  width:38px;height:38px;border-radius:50%;flex-shrink:0;
  background:linear-gradient(135deg,var(--primary),var(--accent));
  display:flex;align-items:center;justify-content:center;
  font-size:13px;font-weight:700;color:#fff;letter-spacing:.02em;
}
.hdr-info{flex:1;min-width:0}
.hdr-name{font-size:15px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;letter-spacing:-.01em}
.hdr-online{font-size:11.5px;color:var(--green);display:flex;align-items:center;gap:5px;margin-top:1px}
.hdr-online::before{content:'';width:6px;height:6px;border-radius:50%;background:var(--green);animation:pulse 2.5s ease-in-out infinite}
@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.55;transform:scale(.85)}}

/* ══ LAYOUT ══════════════════════════════════════════ */
.main{position:fixed;top:var(--hdr);bottom:var(--nav);left:0;right:0;overflow:hidden}
.panel{position:absolute;inset:0;overflow:hidden;display:none;flex-direction:column}
.panel.active{display:flex}
.panel-scroll{flex:1;overflow-y:auto;overflow-x:hidden;padding:16px 14px 12px;-webkit-overflow-scrolling:touch}

/* ══ BOTTOM NAV ══════════════════════════════════════ */
.nav{
  position:fixed;bottom:0;left:0;right:0;
  height:calc(var(--nav) + env(safe-area-inset-bottom));
  padding-bottom:env(safe-area-inset-bottom);
  background:rgba(13,16,23,.96);border-top:1px solid var(--border);
  backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);
  display:grid;grid-template-columns:repeat(4,1fr);z-index:200;
}
.nb{
  background:none;border:none;color:var(--muted);
  display:flex;flex-direction:column;align-items:center;justify-content:center;
  gap:4px;cursor:pointer;padding:8px 0;
  transition:color .2s;-webkit-tap-highlight-color:transparent;
  font-family:inherit;position:relative;
}
.nb.active{color:var(--primary)}
.nb svg{width:22px;height:22px;stroke-width:1.8;transition:transform .2s}
.nb.active svg{transform:scale(1.08)}
.nb span{font-size:10.5px;font-weight:500;letter-spacing:.02em}
.nb-dot{
  position:absolute;top:6px;right:calc(50% - 18px);
  width:7px;height:7px;border-radius:50%;
  background:var(--primary);border:2px solid var(--bg);
  display:none;
}

/* ══ CHAT ════════════════════════════════════════════ */
.chat-body{
  flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;
  padding:14px 12px 6px;
  display:flex;flex-direction:column;gap:3px;
  background:
    radial-gradient(ellipse at 0% 0%,rgba(74,158,255,.04) 0%,transparent 60%),
    radial-gradient(ellipse at 100% 100%,rgba(124,92,252,.04) 0%,transparent 60%),
    var(--bg);
}

/* message row */
.mrow{display:flex;align-items:flex-end;gap:8px;animation:msgIn .22s ease-out both}
.mrow.user{flex-direction:row-reverse}
@keyframes msgIn{from{opacity:0;transform:translateY(9px)}to{opacity:1;transform:translateY(0)}}

/* small AI avatar per row */
.ai-dot{
  width:28px;height:28px;border-radius:50%;flex-shrink:0;
  background:linear-gradient(135deg,var(--primary),var(--accent));
  display:flex;align-items:center;justify-content:center;
  font-size:12px;color:#fff;font-weight:700;
}
.ai-dot.ghost{opacity:0;pointer-events:none} /* hidden on consecutive messages */

/* bubbles */
.bubble{
  max-width:76%;padding:10px 14px;
  font-size:14.5px;line-height:1.58;word-break:break-word;white-space:pre-wrap;
  position:relative;
}
.bubble.ai{
  background:var(--s2);border:1px solid var(--border);
  border-radius:18px 18px 18px 5px;
  color:var(--text);
}
.bubble.user{
  background:linear-gradient(140deg,var(--primary),var(--primary-dark));
  border-radius:18px 18px 5px 18px;
  color:#fff;
  box-shadow:0 4px 18px rgba(74,158,255,.22);
}
.bubble.ai .ai-header{
  font-size:11px;color:var(--primary);font-weight:600;
  margin-bottom:5px;display:flex;align-items:center;gap:5px;
}
.bubble.ai .ai-header::before{content:'✦';font-size:9px}

/* spacing between consecutive bubbles from same sender */
.mrow+.mrow.ai{margin-top:2px}
.mrow+.mrow.user{margin-top:2px}
.mrow.ai+.mrow.user,.mrow.user+.mrow.ai{margin-top:10px}

/* typing indicator */
.typing-row{display:flex;align-items:flex-end;gap:8px;animation:msgIn .2s ease-out both}
.typing-dots{
  background:var(--s2);border:1px solid var(--border);
  border-radius:18px 18px 18px 5px;
  padding:13px 17px;display:flex;gap:5px;align-items:center;
}
.typing-dots span{
  width:7px;height:7px;border-radius:50%;
  background:var(--muted2);
  animation:tdot 1.3s ease-in-out infinite;
}
.typing-dots span:nth-child(2){animation-delay:.17s}
.typing-dots span:nth-child(3){animation-delay:.34s}
@keyframes tdot{0%,60%,100%{transform:translateY(0);opacity:.5}30%{transform:translateY(-6px);opacity:1}}

/* quick action chips */
.chips-strip{
  display:flex;gap:8px;overflow-x:auto;
  padding:8px 12px 10px;scrollbar-width:none;flex-shrink:0;
}
.chips-strip::-webkit-scrollbar{display:none}
.chip{
  flex-shrink:0;
  background:var(--s2);border:1px solid var(--border);
  border-radius:22px;padding:9px 16px;
  color:var(--text);font-size:13.5px;font-family:inherit;
  cursor:pointer;display:flex;align-items:center;gap:7px;
  transition:background .15s,border-color .18s,transform .12s;
  white-space:nowrap;-webkit-tap-highlight-color:transparent;
}
.chip:hover{background:var(--s3);border-color:rgba(74,158,255,.3)}
.chip:active{transform:scale(.95)}
.chip-emoji{font-size:16px}

/* chat input bar */
.chat-bar{
  padding:10px 12px calc(10px + env(safe-area-inset-bottom));
  background:rgba(13,16,23,.97);
  border-top:1px solid var(--border);
  display:flex;align-items:flex-end;gap:10px;flex-shrink:0;
}
.msg-input{
  flex:1;min-height:42px;max-height:130px;
  background:var(--s2);border:1.5px solid var(--border);
  border-radius:22px;padding:11px 16px;
  color:var(--text);font-size:15px;font-family:inherit;
  resize:none;outline:none;line-height:1.45;
  transition:border-color .2s,box-shadow .2s;
}
.msg-input::placeholder{color:var(--muted)}
.msg-input:focus{
  border-color:var(--border-focus);
  box-shadow:0 0 0 4px var(--primary-glow);
}
.send-btn{
  width:44px;height:44px;border-radius:50%;flex-shrink:0;
  background:linear-gradient(135deg,var(--primary),var(--primary-dark));
  border:none;cursor:pointer;
  display:flex;align-items:center;justify-content:center;
  box-shadow:0 4px 16px var(--primary-glow);
  transition:transform .15s,opacity .15s,box-shadow .15s;
  -webkit-tap-highlight-color:transparent;
}
.send-btn:hover{box-shadow:0 6px 20px rgba(74,158,255,.4)}
.send-btn:active{transform:scale(.88)}
.send-btn:disabled{opacity:.38;box-shadow:none;cursor:default}
.send-btn svg{width:19px;height:19px;fill:#fff;margin-left:2px}

/* ══ MODULE CARDS ════════════════════════════════════ */
.sec-label{
  font-size:11.5px;font-weight:600;color:var(--muted2);
  text-transform:uppercase;letter-spacing:.07em;
  padding:18px 0 10px;
}
.mod-card{
  background:var(--s1);border:1px solid var(--border);
  border-radius:var(--r);padding:18px 16px;
  display:flex;align-items:center;gap:14px;
  text-decoration:none;color:inherit;
  transition:background .18s,border-color .18s;
  -webkit-tap-highlight-color:transparent;cursor:pointer;
}
.mod-card:active{background:var(--s2);border-color:rgba(74,158,255,.2)}
.mod-icon{
  width:50px;height:50px;border-radius:15px;
  display:flex;align-items:center;justify-content:center;flex-shrink:0;
}
.mod-icon svg{width:24px;height:24px}
.mod-texts{flex:1;min-width:0}
.mod-title{font-size:15px;font-weight:600;margin-bottom:3px;letter-spacing:-.01em}
.mod-desc{font-size:13px;color:var(--muted2);line-height:1.4}
.mod-arrow{color:var(--muted);flex-shrink:0}
.mod-arrow svg{width:17px;height:17px}

.steps-list{display:flex;flex-direction:column;gap:10px;margin-top:6px}
.step-item{
  display:flex;align-items:center;gap:12px;
  background:var(--s1);border:1px solid var(--border);
  border-radius:14px;padding:13px 14px;
}
.step-num{
  width:28px;height:28px;border-radius:50%;
  display:flex;align-items:center;justify-content:center;
  font-size:12px;font-weight:700;flex-shrink:0;
}
.step-text{font-size:13.5px;line-height:1.4}

/* ══ NOSOTROS ════════════════════════════════════════ */
.biz-hero{
  display:flex;flex-direction:column;align-items:center;
  padding:28px 16px 22px;text-align:center;
}
.biz-avatar{
  width:78px;height:78px;border-radius:50%;
  background:linear-gradient(135deg,var(--primary),var(--accent));
  display:flex;align-items:center;justify-content:center;
  font-size:28px;font-weight:700;color:#fff;margin-bottom:14px;
  box-shadow:0 8px 30px rgba(74,158,255,.25);
}
.biz-name{font-size:21px;font-weight:700;letter-spacing:-.02em;margin-bottom:4px}
.biz-tag{font-size:13px;color:var(--muted2)}

.info-group{
  background:var(--s1);border:1px solid var(--border);
  border-radius:var(--r);overflow:hidden;
}
.info-row{
  display:flex;align-items:center;gap:14px;padding:14px 16px;
  text-decoration:none;color:inherit;
  border-bottom:1px solid var(--border);cursor:default;
  transition:background .15s;
}
.info-row:last-child{border-bottom:none}
a.info-row{cursor:pointer}
a.info-row:active{background:var(--s2)}
.info-icon{
  width:38px;height:38px;border-radius:11px;
  display:flex;align-items:center;justify-content:center;flex-shrink:0;
}
.info-icon svg{width:18px;height:18px}
.info-label{font-size:11.5px;color:var(--muted2);margin-bottom:2px}
.info-val{font-size:14px;font-weight:500}

/* ══ UTILS ═══════════════════════════════════════════ */
::-webkit-scrollbar{width:0;height:0}
</style>
</head>
<body>

<!-- HEADER -->
<header class="hdr">
  <div class="hdr-avatar">${initials}</div>
  <div class="hdr-info">
    <div class="hdr-name">${safe.name}</div>
    <div class="hdr-online">En línea ahora</div>
  </div>
</header>

<!-- MAIN -->
<main class="main">

  <!-- ─── TAB: CHAT ─── -->
  <div id="panel-chat" class="panel active">
    <div class="chat-body" id="chatBody">
      <!-- welcome bubble -->
      <div class="mrow ai">
        <div class="ai-dot">${initials.slice(0,1)}</div>
        <div class="bubble ai">
          <div class="ai-header">${safe.name}</div>
          ¡Hola! Soy el asistente de <strong>${safe.name}</strong>. Puedo responder tus preguntas, ayudarte a reservar una hora o enviarte una cotización. ¿En qué te puedo ayudar?
        </div>
      </div>
    </div>

    <!-- quick chips -->
    <div class="chips-strip" id="chipsStrip">
      <button class="chip" onclick="quickAction('reservas')">
        <span class="chip-emoji">📅</span> Reservar hora
      </button>
      <button class="chip" onclick="quickAction('cotizar')">
        <span class="chip-emoji">🧾</span> Pedir cotización
      </button>
      <button class="chip" onclick="quickAction('precios')">
        <span class="chip-emoji">💰</span> Ver precios
      </button>
      <button class="chip" onclick="quickAction('info')">
        <span class="chip-emoji">ℹ️</span> Más información
      </button>
    </div>

    <!-- input bar -->
    <div class="chat-bar">
      <textarea class="msg-input" id="chatInput" placeholder="Escribe tu pregunta…" rows="1"></textarea>
      <button class="send-btn" id="sendBtn" onclick="sendMsg()">
        <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
      </button>
    </div>
  </div>

  <!-- ─── TAB: RESERVAS ─── -->
  <div id="panel-reservas" class="panel">
    <div class="panel-scroll">
      <p class="sec-label">Agenda tu hora</p>
      <a class="mod-card" href="/open/${safe.slug}/reservas">
        <div class="mod-icon" style="background:rgba(74,158,255,.12)">
          <svg viewBox="0 0 24 24" fill="none" stroke="#4a9eff" stroke-width="1.8"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        </div>
        <div class="mod-texts">
          <div class="mod-title">Reservar una hora</div>
          <div class="mod-desc">Elige el día y horario disponible</div>
        </div>
        <div class="mod-arrow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg></div>
      </a>

      <p class="sec-label" style="padding-top:22px">¿Cómo funciona?</p>
      <div class="steps-list">
        ${[
          ['rgba(74,158,255,.12)','#4a9eff','Selecciona el día disponible'],
          ['rgba(124,92,252,.12)','#7c5cfc','Elige el horario que te acomode'],
          ['rgba(34,197,94,.12)','#22c55e','Ingresa tus datos y confirma'],
        ].map(([bg,col,txt],i) => `
        <div class="step-item">
          <div class="step-num" style="background:${bg};color:${col}">${i+1}</div>
          <div class="step-text">${txt}</div>
        </div>`).join('')}
      </div>
    </div>
  </div>

  <!-- ─── TAB: COTIZAR ─── -->
  <div id="panel-cotizar" class="panel">
    <div class="panel-scroll">
      <p class="sec-label">Solicita una cotización</p>
      <a class="mod-card" href="/shop/${safe.slug}/cotizador">
        <div class="mod-icon" style="background:rgba(124,92,252,.12)">
          <svg viewBox="0 0 24 24" fill="none" stroke="#7c5cfc" stroke-width="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
        </div>
        <div class="mod-texts">
          <div class="mod-title">Cotizar servicios</div>
          <div class="mod-desc">${productCount > 0 ? `${productCount} servicio${productCount !== 1 ? 's' : ''} disponible${productCount !== 1 ? 's' : ''}` : 'Selecciona y recibe un presupuesto'}</div>
        </div>
        <div class="mod-arrow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg></div>
      </a>

      <p class="sec-label" style="padding-top:22px">¿Cómo funciona?</p>
      <div class="steps-list">
        ${[
          ['rgba(124,92,252,.12)','#7c5cfc','Selecciona los servicios que necesitas'],
          ['rgba(74,158,255,.12)','#4a9eff','Ingresa tus datos de contacto'],
          ['rgba(34,197,94,.12)','#22c55e','Recibes la cotización en PDF por correo'],
        ].map(([bg,col,txt],i) => `
        <div class="step-item">
          <div class="step-num" style="background:${bg};color:${col}">${i+1}</div>
          <div class="step-text">${txt}</div>
        </div>`).join('')}
      </div>
    </div>
  </div>

  <!-- ─── TAB: NOSOTROS ─── -->
  <div id="panel-nosotros" class="panel">
    <div class="panel-scroll">
      <div class="biz-hero">
        <div class="biz-avatar">${initials}</div>
        <div class="biz-name">${safe.name}</div>
        <div class="biz-tag">Perfil del negocio</div>
      </div>

      <div class="info-group">
        ${safe.phone ? `
        <a class="info-row" href="tel:${safe.phone}">
          <div class="info-icon" style="background:rgba(34,197,94,.12)">
            <svg viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="1.8"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
          </div>
          <div>
            <div class="info-label">Teléfono</div>
            <div class="info-val">${safe.phone}</div>
          </div>
        </a>` : ''}
        ${locationLine ? `
        <div class="info-row">
          <div class="info-icon" style="background:rgba(74,158,255,.12)">
            <svg viewBox="0 0 24 24" fill="none" stroke="#4a9eff" stroke-width="1.8"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          </div>
          <div>
            <div class="info-label">Ubicación</div>
            <div class="info-val">${locationLine}</div>
          </div>
        </div>` : ''}
        <div class="info-row" style="cursor:pointer" onclick="showTab('chat')">
          <div class="info-icon" style="background:rgba(74,158,255,.12)">
            <svg viewBox="0 0 24 24" fill="none" stroke="#4a9eff" stroke-width="1.8"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          </div>
          <div>
            <div class="info-label">Atención</div>
            <div class="info-val">Chatea con nosotros</div>
          </div>
        </div>
      </div>
    </div>
  </div>

</main>

<!-- BOTTOM NAV -->
<nav class="nav">
  <button class="nb active" id="nb-chat" onclick="showTab('chat')">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
    <span>Chat</span>
  </button>
  <button class="nb" id="nb-reservas" onclick="showTab('reservas')">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
    <span>Reservas</span>
  </button>
  <button class="nb" id="nb-cotizar" onclick="showTab('cotizar')">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/></svg>
    <span>Servicios</span>
  </button>
  <button class="nb" id="nb-nosotros" onclick="showTab('nosotros')">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
    <span>Nosotros</span>
  </button>
</nav>

<script>
const SLUG   = '${safe.slug}';
const INIT   = '${initials.slice(0,1)}';
const BIZ    = ${JSON.stringify(safe.name)};
const TABS   = ['chat','reservas','cotizar','nosotros'];
let   sending = false;
let   chipsHidden = false;

/* ── navigation ───────────────────────── */
function showTab(t) {
  TABS.forEach(x => {
    document.getElementById('panel-'+x).classList.toggle('active', x===t);
    document.getElementById('nb-'+x).classList.toggle('active', x===t);
  });
  if (t==='chat') scrollChat();
}

/* ── chat helpers ─────────────────────── */
function scrollChat(){
  const b = document.getElementById('chatBody');
  b.scrollTop = b.scrollHeight;
}

function hideChips(){
  if(chipsHidden) return;
  chipsHidden = true;
  const s = document.getElementById('chipsStrip');
  s.style.transition = 'opacity .25s,max-height .3s';
  s.style.opacity = '0';
  setTimeout(()=>{ s.style.display='none'; },300);
}

function esc(s){ return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br>'); }

function addBubble(role, text, showAvatar){
  const body = document.getElementById('chatBody');
  const row  = document.createElement('div');
  row.className = 'mrow '+role;

  if(role==='ai'){
    const av = document.createElement('div');
    av.className = 'ai-dot'+(showAvatar===false?' ghost':'');
    av.textContent = INIT;
    row.appendChild(av);
  }

  const bbl = document.createElement('div');
  bbl.className = 'bubble '+role;
  if(role==='ai'){
    bbl.innerHTML = '<div class="ai-header">'+esc(BIZ)+'</div>'+esc(text);
  } else {
    bbl.textContent = text;
  }
  row.appendChild(bbl);
  body.appendChild(row);
  scrollChat();
}

function showTyping(){
  const body = document.getElementById('chatBody');
  const row  = document.createElement('div');
  row.className = 'typing-row'; row.id = 'typingRow';
  const av = document.createElement('div'); av.className='ai-dot'; av.textContent=INIT;
  const dots = document.createElement('div'); dots.className='typing-dots';
  dots.innerHTML='<span></span><span></span><span></span>';
  row.appendChild(av); row.appendChild(dots);
  body.appendChild(row);
  scrollChat();
}

function hideTyping(){
  const r = document.getElementById('typingRow');
  if(r) r.remove();
}

/* ── send message ─────────────────────── */
async function sendMsg(){
  if(sending) return;
  const inp = document.getElementById('chatInput');
  const q   = inp.value.trim();
  if(!q) return;

  inp.value=''; inp.style.height='auto';
  hideChips();
  addBubble('user', q);
  showTyping();
  sending=true;
  document.getElementById('sendBtn').disabled=true;

  try{
    const r = await fetch('/api/public/'+SLUG+'/chat',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({question:q})
    });
    const d = await r.json();
    hideTyping();
    addBubble('ai', d.answer||'No pude procesar tu pregunta. Intenta de nuevo.');
  }catch{
    hideTyping();
    addBubble('ai','Hubo un problema al conectar. Por favor intenta de nuevo.');
  }finally{
    sending=false;
    document.getElementById('sendBtn').disabled=false;
  }
}

/* ── quick actions ────────────────────── */
function quickAction(a){
  hideChips();
  if(a==='reservas'){
    addBubble('user','Quiero reservar una hora');
    setTimeout(()=>{
      addBubble('ai','Con gusto te ayudo 📅 Puedes ver la disponibilidad y agendar tu hora en la sección Reservas.');
      setTimeout(()=>showTab('reservas'),1400);
    },600);
  } else if(a==='cotizar'){
    addBubble('user','Quiero pedir una cotización');
    setTimeout(()=>{
      addBubble('ai','Claro 🧾 Te llevo al cotizador donde puedes seleccionar los servicios y te enviamos el presupuesto por correo.');
      setTimeout(()=>showTab('cotizar'),1400);
    },600);
  } else if(a==='precios'){
    document.getElementById('chatInput').value='¿Cuáles son los precios?';
    sendMsg();
  } else if(a==='info'){
    document.getElementById('chatInput').value='¿Qué servicios ofrecen?';
    sendMsg();
  }
}

/* ── textarea auto-resize ─────────────── */
document.addEventListener('DOMContentLoaded', function(){
  const inp = document.getElementById('chatInput');
  inp.addEventListener('input', function(){
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 130)+'px';
  });
  inp.addEventListener('keydown', function(e){
    if(e.key==='Enter' && !e.shiftKey){ e.preventDefault(); sendMsg(); }
  });
});
</script>
</body>
</html>`;
}
