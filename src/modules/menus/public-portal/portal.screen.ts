import { escapeHtml } from "../../../utils/html";
import { portalStyles } from "./portal.styles";
import { portalScripts } from "./portal.scripts";
import { MenuModuleItem } from "../user-modules.repository";

export type PortalViewData = {
  businessName: string;
  publicSlug: string;
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
  logoUrl?: string | null;
  enabledModules: MenuModuleItem[];
  products: { id: string | number; name: string; price: number; description?: string | null }[];
};

function sanitizeBrandColor(c: string | null | undefined): string | null {
  if (!c) return null;
  return /^#[0-9a-fA-F]{6}$/.test(c.trim()) ? c.trim() : null;
}

function sanitizeImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  return url.startsWith("https://") ? escapeHtml(url) : null;
}

function formatPrice(price: number): string {
  return "$" + price.toLocaleString("es-CL");
}

const MODULE_ICONS: Record<string, string> = {
  reservas: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
  cotizador: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`,
};
const DEFAULT_MOD_ICON = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>`;
const CHEVRON = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>`;

const MOD_ACTION: Record<string, string> = {
  reservas:  "reservas",
  cotizador: "cotizador",
};

export function renderPortalHtml(data: PortalViewData): string {
  const {
    businessName, publicSlug, brandColor, description, welcomeMessage,
    instagramUrl, whatsappNumber, businessHours, phone, address, city,
    logoUrl, enabledModules, products,
  } = data;

  const safeColor   = sanitizeBrandColor(brandColor);
  const safeLogoUrl = sanitizeImageUrl(logoUrl);
  const initials    = publicSlug.replace(/[^a-zA-Z0-9]/g, "").slice(0, 2).toUpperCase() || "?";

  const safe = {
    name:           escapeHtml(businessName),
    phone:          phone          ? escapeHtml(phone)          : null,
    address:        address        ? escapeHtml(address)        : null,
    city:           city           ? escapeHtml(city)           : null,
    description:    description    ? escapeHtml(description)    : null,
    welcomeMessage: welcomeMessage ? escapeHtml(welcomeMessage) : null,
    instagramUrl:   instagramUrl   ? escapeHtml(instagramUrl)   : null,
    whatsappNumber: whatsappNumber ? escapeHtml(whatsappNumber) : null,
    businessHours:  businessHours  ? escapeHtml(businessHours)  : null,
  };

  const locationLine = [safe.address, safe.city].filter(Boolean).join(", ");

  // ── Hero avatar ────────────────────────────────────────────────────────────
  const avatarHtml = safeLogoUrl
    ? `<img src="${safeLogoUrl}" class="hero-avatar hero-avatar-img" alt="${safe.name}"/>`
    : `<div class="hero-avatar hero-avatar-txt">${initials}</div>`;

  // ── Module cards ───────────────────────────────────────────────────────────
  const moduleCardsHtml = enabledModules.map(m => {
    const icon   = MODULE_ICONS[m.code] ?? DEFAULT_MOD_ICON;
    const action = MOD_ACTION[m.code]   ?? m.code;
    return `
    <button class="mod-card" data-action="${escapeHtml(action)}" type="button">
      <div class="mod-icon-wrap">${icon}</div>
      <div class="mod-body">
        <div class="mod-title">${escapeHtml(m.title)}</div>
        <div class="mod-desc">${escapeHtml(m.description)}</div>
      </div>
      <div class="mod-arrow">${CHEVRON}</div>
    </button>`;
  }).join("");

  // ── Contact rows ───────────────────────────────────────────────────────────
  const phoneRow = safe.phone ? `
    <a class="contact-row" href="tel:${safe.phone}">
      <div class="contact-icon-wrap">
        <svg class="contact-icon" viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
      </div>
      <span>${safe.phone}</span>
    </a>` : "";

  const waRow = safe.whatsappNumber ? `
    <a class="contact-row" href="https://wa.me/${safe.whatsappNumber}" target="_blank" rel="noopener">
      <div class="contact-icon-wrap">
        <svg class="contact-icon" viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
      </div>
      <span>WhatsApp</span>
    </a>` : "";

  const locationRow = locationLine ? `
    <div class="contact-row">
      <div class="contact-icon-wrap">
        <svg class="contact-icon" viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
      </div>
      <span>${locationLine}</span>
    </div>` : "";

  const hoursRow = safe.businessHours ? `
    <div class="contact-row">
      <div class="contact-icon-wrap">
        <svg class="contact-icon" viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
      </div>
      <span>${safe.businessHours}</span>
    </div>` : "";

  const igRow = safe.instagramUrl ? `
    <a class="contact-row" href="${safe.instagramUrl}" target="_blank" rel="noopener">
      <div class="contact-icon-wrap">
        <svg class="contact-icon" viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/></svg>
      </div>
      <span>Instagram</span>
    </a>` : "";

  const contactBlock = [phoneRow, waRow, locationRow, hoursRow, igRow].filter(Boolean).join("");

  const colorVars = safeColor
    ? `:root{--accent:${safeColor};--accent2:${safeColor}bb}`
    : "";

  return `<!doctype html>
<html lang="es">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<meta name="theme-color" content="${safeColor ?? "#2563eb"}"/>
<title>${safe.name}</title>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
<style>${portalStyles()}${colorVars}</style>
</head>
<body>

<!-- ── HERO (full-width) ── -->
<section class="hero">
  <div class="hero-glow"></div>
  <div class="hero-glow2"></div>
  <div class="hero-inner">
    ${avatarHtml}
    <div class="hero-badge"><span class="hero-dot"></span>En línea</div>
    <h1 class="hero-title">${safe.name}</h1>
    ${safe.description
      ? `<p class="hero-sub">${safe.description}</p>`
      : safe.welcomeMessage
        ? `<p class="hero-sub">${safe.welcomeMessage}</p>`
        : ""}
  </div>
</section>

<!-- ── CONTENIDO ── -->
<div class="page">

  ${moduleCardsHtml ? `
  <div class="section-card">
    <h2 class="section-title">¿Cómo podemos ayudarte?</h2>
    <div class="mod-list">${moduleCardsHtml}</div>
  </div>` : ""}

  ${contactBlock ? `
  <div class="section-card">
    <h2 class="section-title">Contáctanos</h2>
    <div class="contact-list" style="margin-top:14px">${contactBlock}</div>
  </div>` : ""}

  <div class="pg-footer">Powered by <strong>Automatiza Fácil</strong></div>

</div>

<div id="quotePanel" class="quote-panel"></div>
<div id="bookingPanel" class="quote-panel"></div>
<script>${portalScripts(publicSlug, safe.name, enabledModules, products, { phone: safe.phone, address: safe.address, city: safe.city, description: safe.description, welcomeMessage: welcomeMessage ?? null, businessHours: safe.businessHours, instagramUrl: safe.instagramUrl, whatsappNumber: safe.whatsappNumber }, initials)}</script>
</body>
</html>`;
}
