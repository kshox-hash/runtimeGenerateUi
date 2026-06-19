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
const S_SVC  = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>`;
const S_CLOCK= `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`;

export function chatTabHtml(d: ChatData): string {
  const hasBooking = d.enabledModules.some(m => m.code === "reservas");
  const hasCotizar = d.enabledModules.some(m => m.code === "cotizador");
  const firstName  = d.portalUser?.name?.split(" ")[0] ?? "Bienvenido";

  return `
  <div id="panel-chat" class="panel active hm-panel">

    <!-- ROW 1 — Stats -->
    <div class="hm-stats">
      <div class="hm-stat" style="background:rgba(59,118,237,.07)">
        <div class="hm-stat-icon" style="background:rgba(59,118,237,.15);color:#3B76ED">${S_SVC}</div>
        <div class="hm-stat-body">
          <div class="hm-stat-lbl">Servicios</div>
          <div class="hm-stat-val" id="hmStatSvcs">—</div>
        </div>
        <svg class="hm-stat-spark" style="color:#3B76ED" viewBox="0 0 56 24" width="56" height="24" fill="none"><polyline points="0,20 8,14 16,17 24,9 32,12 40,5 48,8 56,4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </div>
      <div class="hm-stat" style="background:rgba(212,163,0,.07)">
        <div class="hm-stat-icon" style="background:rgba(212,163,0,.15);color:#C9A000">${S_STAR}</div>
        <div class="hm-stat-body">
          <div class="hm-stat-lbl">Calificación</div>
          <div class="hm-stat-val" id="hmStatRating">—</div>
        </div>
        <svg class="hm-stat-spark" style="color:#C9A000" viewBox="0 0 56 24" width="56" height="24" fill="none"><polyline points="0,16 8,18 16,12 24,14 32,8 40,11 48,6 56,9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </div>
      <div class="hm-stat" style="background:rgba(59,118,237,.07)">
        <div class="hm-stat-icon" style="background:rgba(59,118,237,.15);color:#3B76ED">${S_CAL}</div>
        <div class="hm-stat-body">
          <div class="hm-stat-lbl">Próximo turno</div>
          <div class="hm-stat-val" id="hmStatNext">—</div>
        </div>
        <svg class="hm-stat-spark" style="color:#3B76ED" viewBox="0 0 56 24" width="56" height="24" fill="none"><polyline points="0,22 8,16 16,19 24,10 32,13 40,7 48,10 56,3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </div>
      <div class="hm-stat" style="background:rgba(212,163,0,.07)">
        <div class="hm-stat-icon" style="background:rgba(212,163,0,.15);color:#C9A000">${S_CLOCK}</div>
        <div class="hm-stat-body">
          <div class="hm-stat-lbl">Reseñas</div>
          <div class="hm-stat-val" id="hmStatReviews">—</div>
        </div>
        <svg class="hm-stat-spark" style="color:#C9A000" viewBox="0 0 56 24" width="56" height="24" fill="none"><polyline points="0,18 8,14 16,10 24,12 32,6 40,8 48,4 56,6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </div>
    </div>

    <!-- ROW 3 — Main content -->
    <div class="hm-main">

      <!-- LEFT: Calendar (espacio grande) -->
      ${hasBooking ? `
      <div class="hm-card hm-card--green hm-card-left">
        <div class="hm-card-hdr">
          <div class="hm-card-title">Disponibilidad</div>
          <button class="sec-link" type="button" data-action="reservas">Reservar →</button>
        </div>
        <div class="cal-widget hm-cal-inner" id="calHome">
          <div class="cal-loading"><div class="spinner"></div>Cargando…</div>
        </div>
        <div class="hm-cal-footer">
          <img src="/assets/cardbottom.png" alt="" style="width:100%;height:100%;object-fit:cover;display:block"/>
        </div>
      </div>` : `<div id="calHome" style="display:none"></div>`}

      <!-- RIGHT col: Services + Reviews -->
      <div class="hm-right-col">

        <div class="hm-card hm-card--blue">
          <div class="hm-card-hdr">
            <div class="hm-card-title">Servicios</div>
            ${hasBooking ? `<button class="sec-link" type="button" data-action="reservas">Ver todos →</button>` : ""}
          </div>
          <div class="svc-proj-grid" id="homeServiceGrid">
            <div class="svc-empty" style="grid-column:1/-1"><div class="spinner" style="margin:0 auto 8px"></div>Cargando…</div>
          </div>
        </div>

        <div class="hm-card hm-card--purple">
          <div class="hm-card-hdr">
            <div class="hm-card-title">Opiniones</div>
            <button class="sec-link" type="button" data-action="resenas">Ver todas →</button>
          </div>
          <div id="homeInbox">
            <div class="inbox-empty" style="padding:20px 14px;text-align:center">
              <div class="spinner" style="margin:0 auto 8px"></div>Cargando…
            </div>
          </div>
        </div>

      </div>
    </div>


    <!-- JS compat stubs -->
    <div id="mobilePerfil" style="display:none"></div>
    <div id="desktopHome" style="display:none"></div>
    <div id="mobileServiceList" style="display:none"></div>
    <div id="homeInboxMobile" style="display:none"></div>
    <div id="prAvailSection" style="display:none"><span id="prNextSlot"></span></div>
    <div id="prStatSvcs" style="display:none"></div>

  </div>`;
}
