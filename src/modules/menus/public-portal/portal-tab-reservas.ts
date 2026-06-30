export function reservasTabHtml(): string {
  return `
  <div id="panel-reservas" class="panel">
    <div class="pscroll">

      <!-- Intro -->
      <div class="rsv-intro">
        <div class="rsv-intro-title">Reservá tu turno</div>
        <div class="rsv-intro-sub">Elegí el servicio, seleccioná el día disponible y confirmá el horario que más te quede.</div>
      </div>

      <!-- Calendar (card) + stats (separado) -->
      <div class="rdash-body">

        <div class="rdash-card rdash-cal-col">
          <div class="rdash-card-hdr">
            <button class="rdash-mnav-btn" id="rdashPrev" type="button" aria-label="Mes anterior">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <span class="rdash-month-lbl" id="rdashMonthLbl"></span>
            <button class="rdash-mnav-btn" id="rdashNext" type="button" aria-label="Mes siguiente">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
          <div class="month-cal-grid" id="monthCal"></div>
        </div>

        <div class="rdash-info-col">
          <div class="rdash-stats-col">
            <div class="rds-item">
              <span class="rds-val" id="rstatDays">—</span>
              <span class="rds-lbl">Días disp.</span>
            </div>
            <div class="rds-item">
              <span class="rds-val" id="rstatSlots">—</span>
              <span class="rds-lbl">Turnos</span>
            </div>
            <div class="rds-item">
              <span class="rds-val rds-next" id="rstatNext">—</span>
              <span class="rds-lbl">Próximo</span>
            </div>
          </div>
          <div class="slots-area" id="slotsArea" style="display:none">
            <div class="slots-date-lbl" id="slotsDateLbl"></div>
            <div class="slots-grid" id="slotsGrid"></div>
            <button class="slots-close" type="button" id="slotsClose">✕ Cerrar</button>
          </div>
        </div>

      </div>

      <!-- Services -->
      <div class="rdash-sec-hdr">
        <div>
          <div class="rdash-sec-title">Servicios disponibles</div>
          <div class="rdash-sec-sub">Tocá el servicio que querés reservar</div>
        </div>
      </div>
      <div class="svc-grid" id="svcGrid">
        <div class="svc-empty" style="grid-column:1/-1">
          <div class="spinner" style="margin:0 auto 10px"></div>Cargando servicios…
        </div>
      </div>

    </div>
  </div>`;
}
