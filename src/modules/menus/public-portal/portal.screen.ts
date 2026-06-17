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
  enabledModules: MenuModuleItem[];
  products: { id: string | number; name: string; price: number; description?: string | null }[];
};

function sanitizeBrandColor(color: string | null | undefined): string | null {
  if (!color) return null;
  return /^#[0-9a-fA-F]{6}$/.test(color.trim()) ? color.trim() : null;
}

function formatPrice(price: number): string {
  return "$" + price.toLocaleString("es-CL");
}

export function renderPortalHtml(data: PortalViewData): string {
  const { businessName, publicSlug, phone, address, city, brandColor, description,
          welcomeMessage, instagramUrl, whatsappNumber, businessHours, enabledModules, products } = data;

  const safeColor = sanitizeBrandColor(brandColor);
  const initials = publicSlug.replace(/[^a-zA-Z0-9]/g, "").slice(0, 2).toUpperCase() || "?";

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

  const hasBooking = enabledModules.some(m => m.code === "reservas");
  const hasCotizar = enabledModules.some(m => m.code === "cotizador");

  const locationLine = [safe.address, safe.city].filter(Boolean).join(", ");

  // ── Servicios ──────────────────────────────────────────────────────────────
  const servicesHtml = products.map(p => `
    <div class="svc-card">
      <div class="svc-info">
        <div class="svc-name">${escapeHtml(String(p.name))}</div>
        ${p.description ? `<div class="svc-desc">${escapeHtml(String(p.description))}</div>` : ""}
      </div>
      ${p.price > 0 ? `<div class="svc-price">${formatPrice(p.price)}</div>` : ""}
    </div>`).join("");

  // ── CTAs ───────────────────────────────────────────────────────────────────
  const bookingBtn = hasBooking ? `
    <button class="pg-btn pg-btn-primary" id="btn-booking" type="button">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
      Reservar hora
    </button>` : "";

  const quoteBtn = hasCotizar ? `
    <button class="pg-btn pg-btn-secondary" id="btn-quote" type="button">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
      Pedir cotización
    </button>` : "";

  // ── Contacto ───────────────────────────────────────────────────────────────
  const phoneRow = safe.phone ? `
    <a class="contact-row" href="tel:${safe.phone}">
      <svg class="contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
      <span>${safe.phone}</span>
    </a>` : "";

  const waRow = safe.whatsappNumber ? `
    <a class="contact-row" href="https://wa.me/${safe.whatsappNumber}" target="_blank" rel="noopener">
      <svg class="contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
      <span>WhatsApp</span>
    </a>` : "";

  const locationRow = locationLine ? `
    <div class="contact-row">
      <svg class="contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
      <span>${locationLine}</span>
    </div>` : "";

  const hoursRow = safe.businessHours ? `
    <div class="contact-row">
      <svg class="contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
      <span>${safe.businessHours}</span>
    </div>` : "";

  const igRow = safe.instagramUrl ? `
    <a class="contact-row" href="${safe.instagramUrl}" target="_blank" rel="noopener">
      <svg class="contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/></svg>
      <span>Instagram</span>
    </a>` : "";

  const contactBlock = [phoneRow, waRow, locationRow, hoursRow, igRow].filter(Boolean).join("");

  return `<!doctype html>
<html lang="es">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<meta name="theme-color" content="#ffffff"/>
<title>${safe.name}</title>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"/>
<style>${portalStyles()}${safeColor ? `:root{--accent:${safeColor}}` : ""}</style>
</head>
<body>
<div class="page">

  <div class="pg-header">
    <div class="pg-avatar">${initials}</div>
    <div class="pg-hdr-body">
      <div class="pg-name">${safe.name}</div>
      ${safe.description ? `<div class="pg-tagline">${safe.description}</div>` : ""}
    </div>
    <div class="pg-badge"><span class="pg-dot"></span>En línea</div>
  </div>

  ${safe.welcomeMessage ? `<div class="pg-welcome">${safe.welcomeMessage}</div>` : ""}

  ${products.length > 0 ? `
  <div class="pg-section">
    <div class="pg-section-label">Servicios</div>
    <div class="svc-list">${servicesHtml}</div>
  </div>` : ""}

  ${bookingBtn || quoteBtn ? `
  <div class="pg-ctas">
    ${bookingBtn}
    ${quoteBtn}
  </div>` : ""}

  ${contactBlock ? `
  <div class="pg-section">
    <div class="pg-section-label">Contacto</div>
    <div class="contact-list">${contactBlock}</div>
  </div>` : ""}

  <div class="pg-footer">Powered by <strong>Automatiza Fácil</strong></div>

</div>

<div id="quotePanel" class="quote-panel"></div>
<div id="bookingPanel" class="quote-panel"></div>
<script>${portalScripts(publicSlug, safe.name, enabledModules, products, { phone: safe.phone, address: safe.address, city: safe.city, description: safe.description, welcomeMessage: welcomeMessage ?? null, businessHours: safe.businessHours, instagramUrl: safe.instagramUrl, whatsappNumber: safe.whatsappNumber }, initials)}</script>
</body>
</html>`;
}
