export function serviciosTabHtml(): string {
  return `
  <div id="panel-cotizar" class="panel">
    <div class="pscroll">
      <div class="sec-hdr">
        <div>
          <div class="sec-title">Cotizador</div>
          <div class="sec-sub">Seleccioná los productos y recibí tu presupuesto por email</div>
        </div>
      </div>
      <div style="background:var(--panel);border-radius:var(--r);overflow:hidden">
        <div id="cotizarBody"></div>
      </div>
    </div>
  </div>`;
}
