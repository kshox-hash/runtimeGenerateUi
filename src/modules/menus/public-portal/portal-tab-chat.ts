import { MenuModuleItem } from "../user-modules.repository";

type ChatData = {
  name: string;
  slug: string;
  desc?: string | null;
  welcome?: string | null;
  enabledModules: MenuModuleItem[];
  phone?: string | null;
  ig?: string | null;
  wa?: string | null;
  hours?: string | null;
  locationLine?: string;
  waHref?: string | null;
  initials: string;
  productCount: number;
  portalUser?: { name?: string; email?: string; picture?: string } | null;
};

const S_CAL   = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`;
const S_COT   = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`;
const S_WA    = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>`;
const S_STAR  = `<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
const S_SVC   = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>`;
const S_CLOCK = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`;
const S_BELL  = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>`;
const S_SEARCH= `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`;
const S_CHAT  = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>`;
const S_ARR   = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="9 18 15 12 9 6"/></svg>`;

const SPARK_BLUE   = `<svg class="hm-stat-spark" style="color:#3B76ED" viewBox="0 0 56 24" width="56" height="24" fill="none"><polyline points="0,20 8,14 16,17 24,9 32,12 40,5 48,8 56,4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const SPARK_GOLD   = `<svg class="hm-stat-spark" style="color:#D97706" viewBox="0 0 56 24" width="56" height="24" fill="none"><polyline points="0,16 8,18 16,12 24,14 32,8 40,11 48,6 56,9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const SPARK_GREEN  = `<svg class="hm-stat-spark" style="color:#22C55E" viewBox="0 0 56 24" width="56" height="24" fill="none"><polyline points="0,22 8,16 16,19 24,10 32,13 40,7 48,10 56,3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const SPARK_PURPLE = `<svg class="hm-stat-spark" style="color:#8B5CF6" viewBox="0 0 56 24" width="56" height="24" fill="none"><polyline points="0,18 8,14 16,10 24,12 32,6 40,8 48,4 56,6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

export function chatTabHtml(d: ChatData): string {
  const hasBooking = d.enabledModules.some(m => m.code === "reservas");
  const hasCotizar = d.enabledModules.some(m => m.code === "cotizador");
  const firstName  = d.portalUser?.name?.split(" ")[0] ?? "Bienvenido";

  return `
  <div id="panel-chat" class="panel active hm-panel">

    <!-- stubs para JS (stats data) -->
    <div style="display:none">
      <span id="hmStatSvcs"></span>
      <span id="hmStatRating"></span>
      <span id="hmStatNext"></span>
      <span id="hmStatReviews"></span>
    </div>

    <!-- MAIN -->
    <div class="hm-main">

      <!-- COLUMNA IZQUIERDA -->
      <div class="hm-left-col">

        <!-- Bienvenida desktop (oculta en móvil) -->
        <div class="hm-welcome-desk">Bienvenido a <span>${d.name}</span></div>

        <!-- Calendario -->
        ${hasBooking ? `
        <div class="hm-card hm-card-cal">
          <div class="hm-card-hdr">
            <div class="hm-card-title-row">
              <span class="hm-card-title-icon" style="color:#3B76ED">${S_CAL}</span>
              <span class="hm-card-title">Disponibilidad</span>
            </div>
            ${hasBooking ? `<button class="sec-link" type="button" data-action="reservas">Reservar →</button>` : ""}
          </div>
          <div class="cal-widget hm-cal-inner" id="calHome">
            <div class="cal-loading"><div class="spinner"></div>Cargando…</div>
          </div>
        </div>` : `<div id="calHome" style="display:none"></div>`}

        <!-- Próximas reservas -->
        <div class="hm-card">
          <div class="hm-card-hdr">
            <div class="hm-card-title">Próximas reservas</div>
            ${hasBooking ? `<button class="sec-link" type="button" data-action="reservas">Ver todas →</button>` : ""}
          </div>
          <div id="hmUpcoming" class="hm-upcoming-list">
            <div class="inbox-empty" style="padding:18px 16px;text-align:center">
              <div class="spinner" style="margin:0 auto 8px"></div>Cargando…
            </div>
          </div>
        </div>

      </div>

      <!-- COLUMNA DERECHA -->
      <div class="hm-right-col">

        <!-- Servicios recientes -->
        <div class="hm-card hm-card-svc">
          <div class="hm-card-hdr">
            <div class="hm-card-title">Servicios recientes</div>
            <button class="sec-link" type="button" data-action="reservas">Ver todos →</button>
          </div>
          <div id="homeServiceGrid" class="hm-svc-list-home">
            <div class="inbox-empty" style="padding:16px;text-align:center">
              <div class="spinner" style="margin:0 auto 8px"></div>Cargando…
            </div>
          </div>
          ${hasCotizar ? `
          <div class="hm-svc-cot-row">
            <button class="hm-svc-cot-btn" type="button" data-action="cotizar">${S_COT} Pedir cotización</button>
          </div>` : ""}
        </div>

        <!-- Opiniones -->
        <div class="hm-card hm-card-reviews">
          <div class="hm-card-hdr">
            <div class="hm-card-title">Opiniones</div>
            <button class="sec-link" type="button" data-action="resenas">Ver todas →</button>
          </div>
          <div class="hm-reviews-panel">
            <div class="hm-reviews-left">
              <div class="hm-reviews-avg" id="hmStatRatingBig">—</div>
              <div class="hm-reviews-stars" style="color:#F59E0B">★★★★★</div>
              <div class="hm-reviews-count">(<span id="hmStatReviewsBig">0</span> reseñas)</div>
            </div>
            <div class="hm-reviews-chat-icon" style="color:#3B76ED">${S_CHAT}</div>
            <div class="hm-reviews-bars" id="hmReviewBars">
              ${[5,4,3,2,1].map(s=>`
              <div class="rv-bar-row">
                <span class="rv-bar-star">${s}★</span>
                <div class="rv-bar-track"><div class="rv-bar-fill" style="width:0%"></div></div>
                <span class="rv-bar-count">0</span>
              </div>`).join("")}
            </div>
          </div>
        </div>

        <!-- CTA Azul -->
        <div class="hm-cta-card">
          <div class="hm-cta-body">
            <div class="hm-cta-title">Organiza tus servicios y crece tu negocio</div>
            ${hasBooking ? `<button class="hm-cta-btn" type="button" data-action="reservas">Crear nueva reserva</button>` : ""}
          </div>
        </div>

      </div>
    </div>

    <!-- JS compat stubs -->
    <div id="mobilePerfil" style="display:none"></div>
    <div id="desktopHome" style="display:none"></div>
    <div id="mobileServiceList" style="display:none"></div>
    <div id="homeInbox" style="display:none"></div>
    <div id="homeInboxMobile" style="display:none"></div>
    <div id="prAvailSection" style="display:none"><span id="prNextSlot"></span></div>
    <div id="prStatSvcs" style="display:none"></div>
    <div id="calNextStrip" style="display:none"></div>

  </div>`;
}
