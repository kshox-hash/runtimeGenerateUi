import { MenuModuleItem } from "../user-modules.repository";

type HomeData = {
  name: string;
  slug: string;
  description?: string | null;
  welcomeMessage?: string | null;
  enabledModules: MenuModuleItem[];
};

const ICONS: Record<string, string> = {
  reservas: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
  cotizar:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`,
  precios:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`,
  info:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>`,
};

const ARROW = `<svg class="h-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>`;

function card(iconKey: string, title: string, desc: string, action: string): string {
  return `
  <button type="button" class="home-tile h-card" data-action="${action}">
    <div class="h-card-icon">${ICONS[iconKey]}</div>
    <div class="h-card-body">
      <div class="h-card-title">${title}</div>
      <div class="h-card-desc">${desc}</div>
    </div>
    ${ARROW}
  </button>`;
}

export function chatTabHtml(safe: HomeData, initials: string): string {
  const hasBooking = safe.enabledModules.some(m => m.code === "reservas");
  const hasCotizar = safe.enabledModules.some(m => m.code === "cotizador");

  const cards = [
    hasBooking ? card("reservas", "Reservar hora",    "Agenda tu cita disponible",  "reservas") : "",
    hasCotizar ? card("cotizar",  "Pedir cotización", "Recibe un presupuesto",       "cotizar")  : "",
    card("precios", "Ver precios",        "Conoce nuestras tarifas",    "precios"),
    card("info",    "Nosotros",            "Teléfono, dirección y más",  "info"),
  ].join("");

  return `
  <div id="panel-chat" class="panel active">
    <div class="home-scroll">

      <div class="h-hero">
        <div class="h-glow"></div>
        <div class="h-avatar">${initials}</div>
        <div class="h-badge"><span class="h-dot"></span>En línea</div>
        <h1 class="h-name">${safe.name}</h1>
        ${safe.description ? `<p class="h-desc">${safe.description}</p>` : ""}
      </div>

      ${safe.welcomeMessage ? `
      <div class="h-welcome">
        <span class="h-welcome-icon">👋</span>
        <p class="h-welcome-text">${safe.welcomeMessage}</p>
      </div>` : ""}

      <p class="h-label">¿Cómo podemos ayudarte?</p>
      <div class="h-list">${cards}</div>

    </div>
  </div>`;
}
