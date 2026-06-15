import { escapeHtml } from "../../../utils/html";
import { portalStyles }       from "./portal.styles";
import { portalScripts }      from "./portal.scripts";
import { chatTabHtml }        from "./portal-tab-chat";
import { reservasTabHtml }    from "./portal-tab-reservas";
import { serviciosTabHtml }   from "./portal-tab-servicios";
import { nosotrosTabHtml }    from "./portal-tab-nosotros";
import { MenuModuleItem }     from "../user-modules.repository";

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

export function renderPortalHtml(data: PortalViewData): string {
  const { businessName, publicSlug, productCount, phone, address, city, brandColor, description, welcomeMessage, instagramUrl, whatsappNumber, businessHours, enabledModules, products } = data;
  const safeColor = sanitizeBrandColor(brandColor);

  const safe = {
    name:           escapeHtml(businessName),
    slug:           escapeHtml(publicSlug),
    phone:          phone          ? escapeHtml(phone)          : null,
    address:        address        ? escapeHtml(address)        : null,
    city:           city           ? escapeHtml(city)           : null,
    description:    description    ? escapeHtml(description)    : null,
    welcomeMessage: welcomeMessage ? escapeHtml(welcomeMessage) : null,
    instagramUrl:   instagramUrl   ? escapeHtml(instagramUrl)   : null,
    whatsappNumber: whatsappNumber ? escapeHtml(whatsappNumber) : null,
    businessHours:  businessHours  ? escapeHtml(businessHours)  : null,
  };

  const initials = publicSlug.replace(/[^a-zA-Z0-9]/g, "").slice(0, 2).toUpperCase() || "?";

  const locationLine = [safe.address, safe.city].filter(Boolean).join(", ");

  return `<!doctype html>
<html lang="es">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"/>
<meta name="theme-color" content="#F7F6F2"/>
<title>${safe.name}</title>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"/>
<style>${portalStyles()}${safeColor ? `:root{--primary:${safeColor}}` : ""}</style>
</head>
<body>

<header class="hdr">
  <div class="hdr-avatar">${initials}</div>
  <div class="hdr-info">
    <div class="hdr-name">${safe.name}</div>
    ${safe.description ? `<div class="hdr-desc">${safe.description}</div>` : ''}
  </div>
  <div class="hdr-badge">En línea</div>
</header>

<main class="main">
  ${chatTabHtml({ name: safe.name, slug: safe.slug, description: safe.description, welcomeMessage: safe.welcomeMessage, enabledModules }, initials)}
  ${reservasTabHtml(safe)}
  ${serviciosTabHtml(safe, productCount)}
  ${nosotrosTabHtml({ ...safe, description: safe.description, instagramUrl: safe.instagramUrl, whatsappNumber: safe.whatsappNumber, businessHours: safe.businessHours }, locationLine, initials)}
</main>

<nav class="bottom-nav" id="bottomNav">
  <button class="bn-item active" data-tab="chat" type="button">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
    <span>Inicio</span>
  </button>
  <button class="bn-item" data-tab="reservas" type="button">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
    <span>Reservas</span>
  </button>
  <button class="bn-item" data-tab="cotizar" type="button">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
    <span>Cotizar</span>
  </button>
  <button class="bn-item" data-tab="nosotros" type="button">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
    <span>Nosotros</span>
  </button>
</nav>

<div id="quotePanel" class="quote-panel"></div>
<div id="bookingPanel" class="quote-panel"></div>
<script>${portalScripts(publicSlug, safe.name, enabledModules, products, { phone: safe.phone, address: safe.address, city: safe.city, description: safe.description, welcomeMessage: welcomeMessage ?? null, businessHours: safe.businessHours, instagramUrl: safe.instagramUrl, whatsappNumber: safe.whatsappNumber }, initials)}</script>
</body>
</html>`;
}
