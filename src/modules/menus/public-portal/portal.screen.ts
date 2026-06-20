import { escapeHtml } from "../../../utils/html";
import { portalStyles }     from "./portal.styles";
import { portalScripts }    from "./portal.scripts";
import { chatTabHtml }      from "./portal-tab-chat";
import { reservasTabHtml }  from "./portal-tab-reservas";
import { serviciosTabHtml } from "./portal-tab-servicios";
import { resenasTabHtml }   from "./portal-tab-resenas";
import { nosotrosTabHtml }  from "./portal-tab-nosotros";
import { MenuModuleItem }   from "../user-modules.repository";

export type PortalViewData = {
  businessName: string;
  publicSlug: string;
  userId: number;
  productCount: number;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  brandColor?: string | null;
  description?: string | null;
  welcomeMessage?: string | null;
  instagramUrl?: string | null;
  whatsappNumber?: string | null;
  businessHours?: string | null;
  enabledModules: MenuModuleItem[];
  products: { id: string|number; name: string; price: number; description?: string|null; code?: string|null }[];
  portalUser?: { name?: string; email?: string; picture?: string } | null;
};

function sanitizeBrandColor(c: string|null|undefined): string|null {
  if (!c) return null;
  return /^#[0-9a-fA-F]{6}$/.test(c.trim()) ? c.trim() : null;
}

const S_HOME = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`;
const S_CAL  = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`;
const S_PROD = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`;
const S_COT  = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`;
const S_WA   = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>`;
const S_PHONE= `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`;
const S_CLOCK= `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`;
const S_MAP  = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`;
const S_IG   = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".5" fill="currentColor"/></svg>`;
const S_BACK = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>`;
const S_STAR = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;

function prRow(icon: string, label: string, val: string, badge?: string): string {
  return `<div class="pr-row">
    <div class="pr-row-icon">${icon}</div>
    <div class="pr-row-body">
      <div class="pr-row-lbl">${label}</div>
      <div class="pr-row-val">${val}${badge ? `<div class="pr-row-badge">${badge}</div>` : ""}</div>
    </div>
  </div>`;
}

export function renderPortalHtml(data: PortalViewData): string {
  const {
    businessName, publicSlug, userId, productCount,
    phone, address, city, brandColor,
    description, welcomeMessage,
    instagramUrl, whatsappNumber, businessHours,
    enabledModules, products,
    portalUser,
  } = data;

  const safeColor = sanitizeBrandColor(brandColor);

  const s = {
    name:    escapeHtml(businessName),
    slug:    escapeHtml(publicSlug),
    phone:   phone          ? escapeHtml(phone)          : null,
    city:    city           ? escapeHtml(city)           : null,
    address: address        ? escapeHtml(address)        : null,
    desc:    description    ? escapeHtml(description)    : null,
    welcome: welcomeMessage ? escapeHtml(welcomeMessage) : null,
    ig:      instagramUrl   ? escapeHtml(instagramUrl)   : null,
    wa:      whatsappNumber ? escapeHtml(whatsappNumber) : null,
    hours:   businessHours  ? escapeHtml(businessHours)  : null,
  };

  const initials = businessName.replace(/[^a-zA-Z0-9À-ɏ]/g, "").slice(0, 2).toUpperCase() || "??";
  const locationLine = [s.address, s.city].filter(Boolean).join(", ");
  const waHref = s.wa ? `https://wa.me/${s.wa.replace(/\D/g, "")}` : null;

  const infoRows = [
    s.phone      ? prRow(S_PHONE, "Teléfono", s.phone, "Activo") : "",
    s.hours      ? prRow(S_CLOCK, "Horario", s.hours) : "",
    locationLine ? prRow(S_MAP, "Ubicación", locationLine) : "",
    s.ig         ? prRow(S_IG, "Instagram", `<a href="${s.ig}" target="_blank" rel="noopener" style="color:var(--primary);text-decoration:none;font-size:13px">Ver perfil</a>`) : "",
  ].filter(Boolean).join("");

  return `<!doctype html>
<html lang="es">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"/>
<meta name="theme-color" content="#EEF2F7"/>
<title>${s.name}</title>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
<style>
${portalStyles()}
${safeColor ? `:root{--primary:${safeColor};--primary-dim:${safeColor}1A;--primary-glow:${safeColor}38}` : ""}
</style>
</head>
<body>

<!-- SIDEBAR -->
<nav class="icon-rail">
  <!-- Brand -->
  <div class="ir-brand">
    <img src="/assets/linkplace.png" alt="linkplace" class="ir-brand-img">
  </div>

  <!-- Nav items -->
  <div class="ir-nav">
    <button class="ir-btn active" data-tab="chat" type="button">${S_HOME}<span class="ir-lbl">Inicio</span></button>
    <button class="ir-btn" data-tab="reservas" type="button">${S_CAL}<span class="ir-lbl">Reservas</span></button>
    <button class="ir-btn" data-tab="nosotros" type="button">${S_PROD}<span class="ir-lbl">Productos</span></button>
    <button class="ir-btn" data-tab="cotizar" type="button">${S_COT}<span class="ir-lbl">Cotizar</span></button>
    <button class="ir-btn" data-tab="resenas" type="button">${S_STAR}<span class="ir-lbl">Reseñas</span></button>
  </div>

  <!-- User chip -->
  ${portalUser ? `
  <div class="ir-user-chip">
    <div class="ir-user-av">${portalUser.picture
      ? `<img src="${escapeHtml(portalUser.picture)}" style="width:36px;height:36px;border-radius:50%;object-fit:cover" referrerpolicy="no-referrer">`
      : `<div style="width:36px;height:36px;border-radius:50%;background:var(--primary);display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:#fff">${escapeHtml((portalUser.name || "?").charAt(0).toUpperCase())}</div>`
    }</div>
    <div class="ir-user-info">
      <div class="ir-user-name">${escapeHtml(portalUser.name || "")}</div>
      <div class="ir-user-email">${escapeHtml(portalUser.email || "")}</div>
    </div>
    <a href="/auth/portal/logout?slug=${encodeURIComponent(publicSlug)}" class="ir-user-out" title="Salir">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
    </a>
  </div>` : ""}
</nav>

<div class="portal-main">
<!-- PROFILE CARD -->
<aside class="profile-rail">
  <div class="pr-top">
    <div class="pr-back">${S_BACK} Mi Perfil</div>
    <div class="pr-avatar">${initials}</div>
    <div class="pr-name">${s.name}</div>
    ${s.desc ? `<div class="pr-role">${s.desc}</div>` : ""}
    <div id="prRating" class="pr-rating" style="display:none"></div>
    <div class="pr-online-row">
      <span class="pr-online-chip">En línea</span>
    </div>
    <div class="pr-stats-row">
      <div class="pr-stat-item">
        <div class="pr-stat-val" id="prStatSvcs">—</div>
        <div class="pr-stat-lbl">Servicios</div>
      </div>
      <div class="pr-stat-div"></div>
      <div class="pr-stat-item">
        <div class="pr-stat-val">${productCount > 0 ? productCount : "—"}</div>
        <div class="pr-stat-lbl">Productos</div>
      </div>
    </div>
    <div class="pr-actions">
      ${waHref ? `<a class="pr-action-btn" href="${waHref}" target="_blank" rel="noopener" title="WhatsApp">${S_WA}</a>` : ""}
      ${s.phone ? `<a class="pr-action-btn" href="tel:${s.phone}" title="Llamar">${S_PHONE}</a>` : ""}
      ${s.ig ? `<a class="pr-action-btn" href="${s.ig}" target="_blank" rel="noopener" title="Instagram">${S_IG}</a>` : ""}
    </div>
  </div>
  <div class="pr-avail-section" id="prAvailSection" style="display:none">
    <div class="pr-avail-section-title">Próxima disponibilidad</div>
    <div id="prNextSlot"></div>
  </div>
  ${infoRows ? `<div class="pr-section"><div class="pr-section-title">Información detallada</div>${infoRows}</div>` : ""}
  ${waHref ? `<div class="pr-footer"><a class="btn-wa" href="${waHref}" target="_blank" rel="noopener">${S_WA} Escribir por WhatsApp</a></div>` : ""}
</aside>

<!-- CONTENT CARD -->
<main class="content-wrap">
  <nav class="content-nav">
    <button class="cn-tab active" data-tab="chat" type="button">${S_HOME} Inicio</button>
    <button class="cn-tab" data-tab="reservas" type="button">${S_CAL} Reservas</button>
    <button class="cn-tab" data-tab="nosotros" type="button">${S_PROD} Productos</button>
    <button class="cn-tab" data-tab="cotizar" type="button">${S_COT} Cotizar</button>
    <button class="cn-tab" data-tab="resenas" type="button">${S_STAR} Reseñas</button>
    <span class="cn-spacer"></span>
    <span class="cn-status">En línea</span>
  </nav>

  ${chatTabHtml({ name: s.name, slug: s.slug, desc: s.desc, welcome: s.welcome, enabledModules, phone: s.phone, ig: s.ig, wa: s.wa, hours: s.hours, locationLine, waHref, initials, productCount, portalUser })}
  ${reservasTabHtml()}
  ${nosotrosTabHtml(products)}
  ${serviciosTabHtml({ slug: s.slug, productCount })}
  ${resenasTabHtml()}
</main>
</div>

<!-- MOBILE HEADER -->
<header class="mobile-hdr">
  <div class="mhdr-name">Bienvenido a ${s.name}</div>
  <span class="mhdr-badge">En línea</span>
${portalUser ? `
  <div class="mhdr-user">
    <div class="mhdr-user-av">${portalUser.picture
      ? `<img src="${escapeHtml(portalUser.picture)}" style="width:28px;height:28px;border-radius:50%;object-fit:cover" referrerpolicy="no-referrer">`
      : `<div style="width:28px;height:28px;border-radius:50%;background:var(--primary);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:#fff">${escapeHtml((portalUser.name || "?").charAt(0).toUpperCase())}</div>`
    }</div>
    <a href="/auth/portal/logout?slug=${encodeURIComponent(publicSlug)}" class="mhdr-user-out">Salir</a>
  </div>` : ""}
</header>

<!-- MOBILE BOTTOM NAV -->
<nav class="bottom-nav">
  <button class="bn-item active" data-tab="chat" type="button">${S_HOME}<span>Inicio</span></button>
  <button class="bn-item" data-tab="reservas" type="button">${S_CAL}<span>Reservas</span></button>
  <button class="bn-item" data-tab="nosotros" type="button">${S_PROD}<span>Productos</span></button>
  <button class="bn-item" data-tab="cotizar" type="button">${S_COT}<span>Cotizar</span></button>
  <button class="bn-item" data-tab="resenas" type="button">${S_STAR}<span>Reseñas</span></button>
</nav>

<div class="slide-overlay" id="slideOverlay"></div>

<div class="slide-panel" id="bookingPanel">
  <div class="sp-hdr">
    <div style="display:flex;align-items:center;gap:10px">
      <button class="sp-back" id="bkBack" type="button" style="display:none">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <span class="sp-title" id="bkTitle">Reservar hora</span>
    </div>
    <button class="sp-close" id="closeBooking" type="button">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
    </button>
  </div>
  <div class="sp-body" id="bkBody"></div>
</div>

<div class="slide-panel" id="quotePanel">
  <div class="sp-hdr">
    <span class="sp-title">Cotizador</span>
    <button class="sp-close" id="closeQuote" type="button">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
    </button>
  </div>
  <div class="sp-body" id="quotePanelBody"></div>
</div>

<div class="slide-panel" id="reviewPanel">
  <div class="sp-hdr">
    <span class="sp-title">Dejar reseña</span>
    <button class="sp-close" id="closeReview" type="button">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
    </button>
  </div>
  <div class="sp-body" id="reviewPanelBody"></div>
</div>

<div class="slide-panel" id="dayDetailPanel">
  <div class="sp-hdr">
    <span class="sp-title" id="ddpTitle">Detalle del día</span>
    <button class="sp-close" id="closeDayDetail" type="button">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
    </button>
  </div>
  <div class="sp-body" id="ddpBody"></div>
</div>

<script>${portalScripts(publicSlug, businessName, userId, enabledModules, products, { phone: s.phone, address: s.address, city: s.city, description: s.desc, welcomeMessage: welcomeMessage ?? null, businessHours: s.hours, instagramUrl: s.ig, whatsappNumber: s.wa }, initials)}</script>
</body>
</html>`;
}