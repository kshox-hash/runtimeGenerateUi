import { MenuModuleItem } from "../user-modules.repository";

type HomeData = {
  name: string;
  slug: string;
  description?: string | null;
  welcomeMessage?: string | null;
  enabledModules: MenuModuleItem[];
};

function tile(emoji: string, title: string, desc: string, action: string): string {
  return `<button type="button" class="home-tile" data-action="${action}">
      <div class="home-tile-emoji">${emoji}</div>
      <div class="home-tile-title">${title}</div>
      <div class="home-tile-desc">${desc}</div>
    </button>`;
}

export function chatTabHtml(safe: HomeData, initials: string): string {
  const hasBooking = safe.enabledModules.some(m => m.code === "reservas");
  const hasCotizar = safe.enabledModules.some(m => m.code === "cotizador");

  const tiles = [
    hasBooking ? tile("📅", "Reservar hora",     "Agenda tu cita disponible",    "reservas") : "",
    hasCotizar ? tile("🧾", "Pedir cotización",   "Recibe un presupuesto",        "cotizar")  : "",
    tile("💰", "Ver precios",          "Conoce nuestras tarifas",      "precios"),
    tile("ℹ️", "Nosotros",             "Teléfono, dirección y más",    "info"),
  ].join("");

  return `
  <div id="panel-chat" class="panel active">
    <div class="home-scroll">
      <div class="home-banner">
        <div class="home-banner-name">${safe.name}</div>
        ${safe.description ? `<div class="home-banner-desc">${safe.description}</div>` : ""}
      </div>
      <div class="home-status">
        <div class="home-badge"><span class="home-badge-dot"></span>En línea</div>
      </div>
      ${safe.welcomeMessage ? `<div class="home-welcome">${safe.welcomeMessage}</div>` : ""}
      <p class="home-section">¿Qué necesitas?</p>
      <div class="home-tiles">${tiles}</div>
    </div>
  </div>`;
}
