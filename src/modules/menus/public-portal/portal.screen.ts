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
  enabledModules: MenuModuleItem[];
  products: { id: string | number; name: string; price: number; description?: string | null }[];
};

export function renderPortalHtml(data: PortalViewData): string {
  const { businessName, publicSlug, productCount, phone, address, city, enabledModules, products } = data;

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
<style>${portalStyles()}</style>
</head>
<body>

<header class="hdr">
  <div class="hdr-av">${initials}</div>
  <div class="hdr-name">${safe.name}</div>
  <div class="hdr-badge">En línea</div>
</header>

<main class="main">
  ${chatTabHtml(safe, initials)}
  ${reservasTabHtml(safe)}
  ${serviciosTabHtml(safe, productCount)}
  ${nosotrosTabHtml(safe, locationLine, initials)}
</main>

<button class="btn-back-chat" id="btnBackChat" type="button">
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="15 18 9 12 15 6"/></svg>
  Volver al chat
</button>

<div id="quotePanel" class="quote-panel"></div>
<div id="bookingPanel" class="quote-panel"></div>
<script>${portalScripts(publicSlug, safe.name, enabledModules, products)}</script>
</body>
</html>`;
}
