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

const S_CAL  = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`;
const S_COT  = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`;
const S_WA   = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>`;
const S_STAR = `<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
const S_SVC  = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`;
const S_CLOCK= `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`;

export function chatTabHtml(d: ChatData): string {
  const hasBooking = d.enabledModules.some(m => m.code === "reservas");
  const hasCotizar = d.enabledModules.some(m => m.code === "cotizador");

  const firstName = d.portalUser?.name?.split(" ")[0] ?? "Bienvenido";

  return `
  <div id="panel-chat" class="panel active">
    <div class="pscroll">

      <!-- Greeting -->
      <div class="hm-greeting">
        <div class="hm-greet-text">
          <div class="hm-greet-hi">¡Hola, ${firstName}! 👋</div>
          <div class="hm-greet-sub">${d.name}</div>
        </div>
        <div class="hm-greet-actions">
          ${hasBooking ? `<button class="hm-action-btn hm-action-primary" type="button" data-action="reservas">${S_CAL} Reservar</button>` : ""}
          ${d.waHref ? `<a class="hm-action-btn hm-action-wa" href="${d.waHref}" target="_blank" rel="noopener">${S_WA} WhatsApp</a>` : ""}
        </div>
      </div>

      <!-- Stat cards -->
      <div class="hm-stats">
        <div class="hm-stat">
          <div class="hm-stat-icon" style="background:rgba(79,127,232,.12);color:#4F7FE8">${S_SVC}</div>
          <div class="hm-stat-body">
            <div class="hm-stat-val" id="hmStatSvcs">—</div>
            <div class="hm-stat-lbl">Servicios</div>
          </div>
        </div>
        <div class="hm-stat">
          <div class="hm-stat-icon" style="background:rgba(251,191,36,.12);color:#F59E0B">${S_STAR}</div>
          <div class="hm-stat-body">
            <div class="hm-stat-val" id="hmStatRating">—</div>
            <div class="hm-stat-lbl">Calificación</div>
          </div>
        </div>
        <div class="hm-stat">
          <div class="hm-stat-icon" style="background:rgba(34,197,94,.12);color:#22c55e">${S_CAL}</div>
          <div class="hm-stat-body">
            <div class="hm-stat-val" id="hmStatNext">—</div>
            <div class="hm-stat-lbl">Próximo turno</div>
          </div>
        </div>
        <div class="hm-stat">
          <div class="hm-stat-icon" style="background:rgba(168,85,247,.12);color:#a855f7">${S_CLOCK}</div>
          <div class="hm-stat-body">
            <div class="hm-stat-val" id="hmStatReviews">—</div>
            <div class="hm-stat-lbl">Reseñas</div>
          </div>
        </div>
      </div>

      <!-- Services -->
      <div class="hm-sec-hdr">
        <div class="hm-sec-title">Servicios</div>
        ${hasBooking ? `<button class="sec-link" type="button" data-action="reservas">Ver todos</button>` : ""}
      </div>
      <div class="svc-cards-grid" id="homeServiceGrid">
        <div class="svc-empty" style="grid-column:1/-1"><div class="spinner" style="margin:0 auto 8px"></div>Cargando servicios…</div>
      </div>

      ${hasCotizar ? `<button class="hm-cot-btn" type="button" data-action="cotizar">${S_COT} Pedir cotización</button>` : ""}

      <!-- Reviews -->
      <div class="hm-sec-hdr" style="margin-top:24px">
        <div class="hm-sec-title">Opiniones</div>
        <button class="sec-link" type="button" data-action="resenas">Ver todas</button>
      </div>
      <div class="inbox-card" id="homeInbox">
        <div class="inbox-empty"><div class="spinner" style="margin:0 auto 8px"></div>Cargando…</div>
      </div>

      <!-- hidden elements kept for JS compat -->
      <div id="mobilePerfil" style="display:none"></div>
      <div id="desktopHome" style="display:none"></div>
      <div id="mobileServiceList" style="display:none"></div>
      <div id="homeInboxMobile" style="display:none"></div>
      <div id="calHome" style="display:none"></div>
      <div id="prAvailSection" style="display:none"><span id="prNextSlot"></span></div>
      <div id="prStatSvcs" style="display:none"></div>

    </div>
  </div>`;
}
