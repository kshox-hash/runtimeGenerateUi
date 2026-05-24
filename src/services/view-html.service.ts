import { RuntimeLinkRecord } from "../types/runtime";
import { escapeHtml } from "../utils/html";

export function renderViewHtml(record: RuntimeLinkRecord): string {
  const safeSuccessMessage = escapeHtml(
    record.config.successMessage || "Solicitud enviada correctamente."
  );
  const safeTitle = escapeHtml(record.config.title || "Cotizador online");
  const configJson = JSON.stringify(record.config);

  return `<!doctype html>
<html lang="es">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
<title>${safeTitle}</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Google+Sans:wght@400;500&family=Google+Sans+Display:wght@400;500&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />

<style>
:root {
  /* Paleta igual al menú principal */
  --bg:           #0f1011;

  --surface-1:    #20242d;
  --surface-2:    #1b1c25;
  --surface-3:    #1b1c25;

  --on-bg:        #d8dbe2;
  --on-surface:   #e8eaed;
  --on-surface-v: #b0b4be;

  --primary:      #bfc7ff;
  --primary-c:    #111827;
  --primary-bg:   #22263a;
  --primary-bg-2: #22263a;
  --arrow-bg:    #1b1c25;

  --secondary:    #bfc7ff;
  --secondary-bg: #22263a;

  --muted:        #b0b4be;
  --muted-2:      #858a96;

  --green:        #81c995;
  --green-bg:     #1d3428;
  --red:          #f28b82;
  --red-bg:       #34201f;

  --radius-s:  12px;
  --radius-m:  16px;
  --radius-l:  20px;
  --radius-xl: 28px;

  --page-max: 840px;
  --safe-b: env(safe-area-inset-bottom, 0px);
}

*, *::before, *::after {
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
  margin: 0; padding: 0;
}

html, body { min-height: 100vh; }

body {
  background: var(--bg);
  color: var(--on-bg);
  font-family: "Google Sans", "Inter", "Segoe UI", system-ui, sans-serif;
  overflow-x: hidden;
  -webkit-font-smoothing: antialiased;
}

button, input, textarea { font: inherit; color: inherit; }
button { touch-action: manipulation; cursor: pointer; }

/* ─── ENTRANCE ANIMATION ─── */

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}

.animate {
  opacity: 0;
  animation: fadeUp 320ms cubic-bezier(.2,.6,.4,1) forwards;
}

/* ─── PAGE ─── */

.page {
  min-height: 100vh;
  padding: 0 0 calc(40px + var(--safe-b));
}

.shell {
  width: 100%;
  max-width: var(--page-max);
  margin: 0 auto;
  padding: 0 16px;
}

/* ─── TOPBAR ─── */

.topbar {
  height: 64px;
  display: flex;
  align-items: center;
  gap: 12px;
  animation: fadeUp 280ms cubic-bezier(.2,.6,.4,1) forwards;
}

.topbar-logo {
  width: 48px;
  height: 48px;
  border-radius: 18px;
  background: var(--primary-bg);
  color: var(--primary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 23px;
  line-height: 1;
}

.topbar-logo svg {
  width: 23px;
  height: 23px;
  fill: var(--primary);
}

.topbar-name {
  font-size: 15px;
  font-weight: 500;
  color: var(--on-surface);
  letter-spacing: -0.03em;
  text-transform: lowercase;
}

.topbar-chip {
  margin-left: auto;
  padding: 5px 12px;
  border-radius: 999px;
  background: var(--primary-bg);
  color: var(--primary);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

/* ─── HERO ─── */

.hero {
  padding: 20px 0 36px;
  animation: fadeUp 300ms 60ms cubic-bezier(.2,.6,.4,1) both;
}

.hero-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--primary);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: 10px;
}

.hero-title {
  font-family: "Google Sans Display", "Google Sans", sans-serif;
  font-size: clamp(28px, 6vw, 40px);
  font-weight: 400;
  letter-spacing: -0.02em;
  line-height: 1.12;
  color: var(--on-surface);
  max-width: 560px;
}

.hero-sub {
  margin-top: 12px;
  font-size: 14px;
  color: var(--muted);
  line-height: 1.6;
  max-width: 460px;
}

/* ─── CONTENT ─── */

.content-flow {
  display: grid;
  gap: 12px;
}

/* ─── CARD ─── */

.card {
  background: var(--surface-1);
  border-radius: var(--radius-xl);
  overflow: hidden;
}

/* ─── SECTION HEADER ─── */

.section-header {
  padding: 20px 20px 14px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.section-heading {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.section-icon {
  width: 48px;
  height: 48px;
  flex-shrink: 0;
  border-radius: 18px;
  background: var(--primary-bg);
  color: var(--primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 23px;
  line-height: 1;
}

.section-icon svg {
  width: 23px;
  height: 23px;
  display: block;
}

.section-label {
  font-size: 11px;
  font-weight: 500;
  color: var(--primary);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: 4px;
}

.section-title {
  font-size: 17px;
  font-weight: 500;
  color: var(--on-surface);
  letter-spacing: -0.02em;
  line-height: 1.2;
}

.badge {
  flex-shrink: 0;
  padding: 6px 12px;
  border-radius: 999px;
  background: var(--primary-bg);
  color: var(--primary);
  font-size: 11.5px;
  font-weight: 500;
  white-space: nowrap;
  margin-top: 2px;
  transition: background 200ms ease;
}

.badge.has-selection {
  background: var(--primary-bg-2);
}

/* ─── SEARCH ─── */

.search-wrap {
  padding: 0 12px 12px;
}

.search-inner {
  height: 48px;
  display: flex;
  align-items: center;
  border-radius: 999px;
  background: var(--arrow-bg);
  padding: 0 6px 0 16px;
  transition: background 150ms ease;
}

.search-inner:focus-within {
  background: var(--primary-bg);
}

.search-icon {
  width: 32px;
  height: 32px;
  border-radius: 999px;
  flex-shrink: 0;
  color: var(--primary);
  background: var(--primary-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 10px;
  font-size: 15px;
  line-height: 1;
}

.search-icon svg { width: 17px; height: 17px; display: block; }

.search-input {
  flex: 1;
  min-width: 0;
  border: none;
  outline: none;
  background: transparent;
  color: var(--on-surface);
  font-size: 14px;
}

.search-input::placeholder { color: var(--muted-2); }

/* ─── PRODUCT LIST ─── */

.products-body {
  padding: 0 12px 12px;
}

.products-body.scrollable {
  max-height: min(52vh, 560px);
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-width: thin;
  scrollbar-color: var(--surface-3) transparent;
}

.products-body.scrollable::-webkit-scrollbar { width: 4px; }
.products-body.scrollable::-webkit-scrollbar-track { background: transparent; }
.products-body.scrollable::-webkit-scrollbar-thumb {
  background: var(--surface-3);
  border-radius: 999px;
}

.product-list { display: grid; gap: 8px; }

/* ─── PRODUCT ITEM ─── */

.product-item {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 18px;
  padding: 18px 16px;
  border-radius: var(--radius-m);
  transition: background 120ms ease;
}

.product-item:hover { background: var(--surface-3); }

/* selected state */
.product-item.is-selected {
  background: var(--primary-bg);
}

.product-item.is-selected:hover {
  background: var(--primary-bg-2);
}

.product-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--on-surface);
  letter-spacing: -0.01em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.3;
  margin-bottom: 5px;
}

.product-desc {
  font-size: 12px;
  color: var(--muted);
  line-height: 1.45;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-price {
  width: max-content;
  margin-top: 7px;
  padding: 5px 9px;
  border-radius: 999px;
  background: var(--arrow-bg);
  color: var(--primary);
  font-size: 12.5px;
  font-weight: 500;
  white-space: nowrap;
}

/* ─── STEPPER ─── */

.stepper {
  display: flex;
  align-items: center;
  height: 36px;
  border-radius: 999px;
  background: var(--arrow-bg);
  overflow: hidden;
  transition: background 200ms ease;
}

.stepper.has-qty {
  background: var(--arrow-bg);
}

.step-btn {
  width: 36px;
  height: 36px;
  border: none;
  background: transparent;
  color: var(--on-surface-v);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background 100ms ease, color 100ms ease;
}

.step-btn svg {
  width: 12px;
  height: 12px;
  display: block;
}

.stepper.has-qty .step-btn {
  color: var(--primary);
}

.step-btn:hover { background: rgba(255,255,255,0.07); color: var(--on-surface); }
.step-btn:active { background: rgba(255,255,255,0.12); }

.step-val {
  width: 32px;
  text-align: center;
  font-size: 13px;
  font-weight: 500;
  color: var(--on-surface);
  user-select: none;
  transition: color 200ms ease;
}

.stepper.has-qty .step-val {
  color: var(--primary);
}

@keyframes valBounce {
  0%   { transform: scale(1); }
  40%  { transform: scale(1.25); }
  100% { transform: scale(1); }
}

.step-val.bump {
  animation: valBounce 180ms cubic-bezier(.3,1.4,.5,1);
}

.qty-hidden { display: none; }

/* ─── EMPTY SEARCH STATE ─── */

.search-empty {
  display: none;
  padding: 28px 16px;
  text-align: center;
  color: var(--muted);
  font-size: 13px;
  line-height: 1.5;
}

.search-empty-icon {
  font-size: 28px;
  margin-bottom: 8px;
  opacity: 0.5;
}

/* ─── TOTAL ─── */

.total-bar {
  margin: 8px 8px 8px;
  padding: 16px 18px;
  border-radius: var(--radius-l);
  background: var(--arrow-bg);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.total-label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 500;
  color: var(--primary);
  letter-spacing: 0.02em;
  text-transform: uppercase;
}

.total-icon {
  width: 28px;
  height: 28px;
  border-radius: 999px;
  background: var(--primary-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  line-height: 1;
}

.total-label svg {
  width: 17px;
  height: 17px;
  display: block;
}

@keyframes totalBump {
  0%   { transform: scale(1); }
  40%  { transform: scale(1.05); }
  100% { transform: scale(1); }
}

.total-amount {
  font-family: "Google Sans Display", "Google Sans", sans-serif;
  font-size: clamp(22px, 6vw, 28px);
  font-weight: 400;
  color: var(--on-surface);
  letter-spacing: -0.02em;
  line-height: 1;
  font-variant-numeric: tabular-nums;
  text-align: right;
  transition: color 200ms ease;
  transform-origin: right center;
}

.total-amount.bump {
  animation: totalBump 220ms cubic-bezier(.3,1.4,.5,1);
}

.total-amount.nonzero {
  color: var(--primary);
}

/* ─── TEXT BLOCK ─── */

.text-block {
  background: var(--surface-1);
  border-radius: var(--radius-xl);
  padding: 18px 20px;
  color: var(--muted);
  font-size: 13.5px;
  line-height: 1.6;
}

/* ─── FORM CARD ─── */

.form-card {
  background: var(--surface-1);
  border-radius: var(--radius-xl);
  overflow: hidden;
}

.form-head {
  padding: 20px 20px 18px;
  display: grid;
  grid-template-columns: 44px 1fr;
  gap: 14px;
  align-items: center;
}

.form-avatar {
  width: 44px;
  height: 44px;
  border-radius: 16px;
  background: var(--secondary-bg);
  color: var(--secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.form-avatar svg { width: 22px; height: 22px; }

.form-head-title {
  font-size: 16px;
  font-weight: 500;
  color: var(--on-surface);
  letter-spacing: -0.02em;
  line-height: 1.2;
}

.form-head-sub {
  font-size: 12px;
  color: var(--muted);
  margin-top: 2px;
}

.form-divider {
  height: 1px;
  background: rgba(255,255,255,0.07);
  margin: 0 20px 20px;
}

.form-body {
  padding: 0 20px 20px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field.full { grid-column: 1 / -1; }

.label {
  font-size: 11.5px;
  font-weight: 500;
  color: var(--muted);
  letter-spacing: 0.02em;
  text-transform: uppercase;
}

input, textarea {
  width: 100%;
  border: none;
  outline: none;
  background: var(--arrow-bg);
  color: var(--on-surface);
  border-radius: var(--radius-m);
  padding: 14px 15px;
  font-size: 14px;
  transition: background 150ms ease;
}

input::placeholder, textarea::placeholder { color: var(--muted-2); }

input:focus, textarea:focus {
  background: var(--primary-bg);
}

textarea {
  min-height: 92px;
  resize: vertical;
}

/* ─── SUBMIT ─── */

.submit-wrap {
  margin-top: 12px;
}

/* Ripple */
.submit-btn {
  position: relative;
  overflow: hidden;
  width: 100%;
  min-height: 56px;
  border: none;
  border-radius: 999px;
  background: var(--primary-bg);
  color: var(--primary);
  font-size: 15px;
  font-weight: 500;
  letter-spacing: 0.01em;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: filter 120ms ease, transform 80ms ease;
}

.submit-btn:hover {
  filter: brightness(1.06);
}

.submit-btn:active { transform: scale(0.985); filter: brightness(0.95); }
.submit-btn:disabled { opacity: 0.38; cursor: not-allowed; filter: none; transform: none; }

.submit-icon {
  width: 30px;
  height: 30px;
  border-radius: 999px;
  background: var(--arrow-bg);
  color: var(--primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  line-height: 1;
  flex-shrink: 0;
}

.submit-btn svg { width: 18px; height: 18px; flex-shrink: 0; }

.ripple-el {
  position: absolute;
  border-radius: 50%;
  background: rgba(0,46,106,0.25);
  transform: scale(0);
  animation: ripple 500ms linear;
  pointer-events: none;
}

@keyframes ripple {
  to { transform: scale(4); opacity: 0; }
}

/* ─── MESSAGE ─── */

.message {
  display: none;
  padding: 16px 18px;
  border-radius: var(--radius-l);
  font-size: 13px;
  line-height: 1.5;
  text-align: center;
}

.message.success { display: block; background: var(--green-bg); color: var(--green); }
.message.error   { display: block; background: var(--red-bg);   color: var(--red); }

/* ─── EXPIRES ─── */

.expires {
  margin-top: 20px;
  text-align: center;
  color: var(--muted-2);
  font-size: 11px;
}

/* ─── RESPONSIVE ─── */

@media (min-width: 640px) {
  .shell { padding: 0 24px; }
  .topbar { height: 72px; }
  .hero { padding: 24px 0 44px; }
  .content-flow { gap: 14px; }
}

@media (max-width: 520px) {
  .form-grid { grid-template-columns: 1fr; }
  .products-body.scrollable { max-height: 48vh; }
}

@media (max-width: 380px) {
  .hero-title { font-size: 26px; }
  .section-header { flex-direction: column; }
  .product-item { grid-template-columns: 1fr; gap: 12px; padding: 18px 16px; }
  .stepper { align-self: start; }
  .total-bar { flex-direction: column; align-items: flex-start; gap: 6px; }
  .total-amount { font-size: 24px; }
  .form-head { grid-template-columns: 1fr; }
  .form-avatar { display: none; }
}
</style>
</head>

<body>
<main class="page">
  <div class="shell">

    <header class="topbar">
      <div class="topbar-logo" aria-hidden="true">⚡</div>
      <span class="topbar-name">Amaru Electric</span>
      <span class="topbar-chip">Cotizador</span>
    </header>

    <section class="hero">
      <div class="hero-label">Cotizador online</div>
      <h1 class="hero-title">Solicita tu cotización</h1>
      <p class="hero-sub">Selecciona los productos que necesitas y envía tu solicitud en segundos.</p>
    </section>

    <div id="content" class="content-flow"></div>
    <div id="message" class="message" style="margin-top:12px"></div>

    <p class="expires">
      Este enlace expira el <span id="expiresAt"></span>
    </p>

  </div>
</main>

<script>
const token = ${JSON.stringify(record.token)};
const config = ${configJson};
const successMessage = ${JSON.stringify(safeSuccessMessage)};
const expiresAt = ${JSON.stringify(
    new Date(record.expiresAt).toLocaleString("es-CL")
  )};

const contentEl = document.getElementById("content");
const messageEl = document.getElementById("message");

document.getElementById("expiresAt").textContent = expiresAt;

function formatCurrency(value) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0
  }).format(Number(value || 0));
}

function showMessage(type, text) {
  messageEl.className = "message " + type;
  messageEl.textContent = text;
  messageEl.style.display = "block";
  messageEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function bump(el) {
  el.classList.remove("bump");
  void el.offsetWidth;
  el.classList.add("bump");
}

function updateSelectedCount() {
  const inputs = document.querySelectorAll('[data-kind="product-quantity"]');
  let selected = 0;
  inputs.forEach((inp) => { if (Number(inp.value || 0) > 0) selected++; });
  const badge = document.getElementById("productsSelected");
  if (badge) {
    badge.textContent = selected === 1 ? "1 seleccionado" : selected + " seleccionados";
    badge.classList.toggle("has-selection", selected > 0);
  }
}

function updateTotal() {
  const inputs = document.querySelectorAll('[data-kind="product-quantity"]');
  let total = 0;
  inputs.forEach((inp) => { total += Number(inp.value || 0) * Number(inp.dataset.productPrice || 0); });
  const el = document.getElementById("totalValue");
  if (el) {
    el.textContent = formatCurrency(total);
    el.classList.toggle("nonzero", total > 0);
    bump(el);
  }
  updateSelectedCount();
}

/* ── TEXT ── */
function renderText(c) {
  const d = document.createElement("div");
  d.className = "text-block animate";
  d.textContent = c.value || "";
  return d;
}

/* ── PRODUCTS ── */
function renderProducts(c) {
  const wrap = document.createElement("div");
  wrap.className = "card animate";

  /* header */
  const hdr = document.createElement("div");
  hdr.className = "section-header";
  hdr.innerHTML = \`
    <div class="section-heading">
      <div class="section-icon" aria-hidden="true">🧾</div>
      <div>
        <div class="section-label">Catálogo</div>
        <div class="section-title">Productos</div>
      </div>
    </div>
    <div class="badge" id="productsSelected">0 seleccionados</div>
  \`;
  wrap.appendChild(hdr);

  /* search */
  const sw = document.createElement("div");
  sw.className = "search-wrap";
  sw.innerHTML = \`
    <div class="search-inner">
      <div class="search-icon" aria-hidden="true">⌕</div>
      <input class="search-input" id="productsSearch" type="text" placeholder="Buscar productos" autocomplete="off" />
    </div>
  \`;
  wrap.appendChild(sw);

  /* body */
  const body = document.createElement("div");
  const isScrollable = Array.isArray(c.items) && c.items.length >= 12;
  body.className = "products-body" + (isScrollable ? " scrollable" : "");

  const list = document.createElement("div");
  list.className = "product-list";
  list.id = "productsList";

  /* empty state for search */
  const emptySearch = document.createElement("div");
  emptySearch.className = "search-empty";
  emptySearch.innerHTML = \`<div class="search-empty-icon">🔍</div>Sin resultados para tu búsqueda\`;

  if (!Array.isArray(c.items) || c.items.length === 0) {
    list.innerHTML = "<div style='padding:24px 16px;color:var(--muted);font-size:13px;text-align:center'>No hay productos disponibles.</div>";
    body.appendChild(list);
    wrap.appendChild(body);
    return wrap;
  }

  c.items.forEach((item) => {
    const row = document.createElement("div");
    row.className = "product-item";
    row.dataset.search = String((item.name || "") + " " + (item.description || "")).toLowerCase();

    const info = document.createElement("div");
    info.innerHTML = \`
      <div class="product-name">\${item.name || "Producto"}</div>
      \${item.description ? \`<div class="product-desc">\${item.description}</div>\` : ""}
      <div class="product-price">\${formatCurrency(item.price || 0)}</div>
    \`;

    const stepper = document.createElement("div");
    stepper.className = "stepper";

    const minus = document.createElement("button");
    minus.className = "step-btn";
    minus.type = "button";
    minus.setAttribute("aria-label", "Disminuir cantidad");
    minus.innerHTML = "<svg viewBox='0 0 24 24' fill='none'><path d='M5 12h14' stroke='currentColor' stroke-width='2' stroke-linecap='round'/></svg>";

    const valEl = document.createElement("div");
    valEl.className = "step-val";
    valEl.textContent = "0";

    const plus = document.createElement("button");
    plus.className = "step-btn";
    plus.type = "button";
    plus.setAttribute("aria-label", "Aumentar cantidad");
    plus.innerHTML = "<svg viewBox='0 0 24 24' fill='none'><path d='M12 5v14M5 12h14' stroke='currentColor' stroke-width='2' stroke-linecap='round'/></svg>";

    const hidden = document.createElement("input");
    hidden.type = "number";
    hidden.min = "0";
    hidden.value = "0";
    hidden.className = "qty-hidden";
    hidden.dataset.productId = item.id;
    hidden.dataset.productPrice = String(item.price || 0);
    hidden.dataset.kind = "product-quantity";

    function sync(v) {
      const s = Math.max(0, Number(v) || 0);
      hidden.value = String(s);
      valEl.textContent = String(s);
      bump(valEl);

      const active = s > 0;
      stepper.classList.toggle("has-qty", active);
      row.classList.toggle("is-selected", active);
      updateTotal();
    }

    minus.addEventListener("click", () => sync(Number(hidden.value) - 1));
    plus.addEventListener("click", () => sync(Number(hidden.value) + 1));

    stepper.appendChild(minus);
    stepper.appendChild(valEl);
    stepper.appendChild(plus);
    stepper.appendChild(hidden);

    row.appendChild(info);
    row.appendChild(stepper);
    list.appendChild(row);
  });

  body.appendChild(list);
  body.appendChild(emptySearch);
  wrap.appendChild(body);

  /* total */
  const totalRow = document.createElement("div");
  totalRow.className = "total-bar";
  totalRow.innerHTML = \`
    <div class="total-label">
      <span class="total-icon" aria-hidden="true">💰</span>
      <span>Total estimado</span>
    </div>
    <div class="total-amount" id="totalValue">\${formatCurrency(0)}</div>
  \`;
  wrap.appendChild(totalRow);

  /* search filter */
  sw.querySelector("#productsSearch").addEventListener("input", (e) => {
    const q = e.target.value.toLowerCase().trim();
    let visible = 0;
    list.querySelectorAll(".product-item").forEach((el) => {
      const match = el.dataset.search.includes(q);
      el.style.display = match ? "grid" : "none";
      if (match) visible++;
    });
    emptySearch.style.display = visible === 0 ? "block" : "none";
  });

  return wrap;
}

/* ── FORM ── */
function renderForm(c) {
  const wrap = document.createElement("div");
  wrap.className = "form-card animate";

  const head = document.createElement("div");
  head.className = "form-head";
  head.innerHTML = \`
    <div class="form-avatar" aria-hidden="true">👤</div>
    <div>
      <div class="form-head-title">Mis datos</div>
      <div class="form-head-sub">Completa tu información de contacto</div>
    </div>
  \`;
  wrap.appendChild(head);

  const divider = document.createElement("div");
  divider.className = "form-divider";
  wrap.appendChild(divider);

  const body = document.createElement("div");
  body.className = "form-body";
  const grid = document.createElement("div");
  grid.className = "form-grid";

  c.fields.forEach((field) => {
    const fw = document.createElement("div");
    fw.className = "field" + (field.inputType === "textarea" ? " full" : "");

    const lbl = document.createElement("label");
    lbl.className = "label";
    lbl.textContent = field.label + (field.required ? " *" : "");

    const inp = field.inputType === "textarea"
      ? document.createElement("textarea")
      : document.createElement("input");

    if (field.inputType !== "textarea") inp.type = field.inputType || "text";
    inp.name = field.name;
    inp.dataset.kind = "form-field";
    inp.placeholder = field.placeholder || "";
    if (field.required) inp.required = true;

    fw.appendChild(lbl);
    fw.appendChild(inp);
    grid.appendChild(fw);
  });

  body.appendChild(grid);
  wrap.appendChild(body);
  return wrap;
}

/* ── BUTTON ── */
function renderButton(c) {
  const wrap = document.createElement("div");
  wrap.className = "submit-wrap animate";

  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "submit-btn";
  btn.innerHTML = \`
    <span class="submit-icon" aria-hidden="true">→</span>
    <span>\${c.label || "Enviar cotización"}</span>
  \`;

  /* ripple */
  btn.addEventListener("click", function(e) {
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    const ripple = document.createElement("span");
    ripple.className = "ripple-el";
    ripple.style.cssText = \`width:\${size}px;height:\${size}px;left:\${x}px;top:\${y}px\`;
    btn.appendChild(ripple);
    ripple.addEventListener("animationend", () => ripple.remove());
    onSubmit(btn, c.label || "Enviar cotización");
  });

  wrap.appendChild(btn);
  return wrap;
}

function renderComponent(c) {
  switch (c.type) {
    case "text":     return renderText(c);
    case "products": return renderProducts(c);
    case "form":     return renderForm(c);
    case "button":   return renderButton(c);
    default:         return document.createElement("div");
  }
}

function getPriority(c) {
  return { form: 1, products: 2, text: 3, button: 4 }[c.type] ?? 9;
}

/* ── SUBMIT ── */
async function onSubmit(btn, originalLabel) {
  const selectedItems = [];
  document.querySelectorAll('[data-kind="product-quantity"]').forEach((inp) => {
    const qty = Number(inp.value || 0);
    if (qty > 0 && inp.dataset.productId) selectedItems.push({ productId: inp.dataset.productId, quantity: qty });
  });

  if (selectedItems.length === 0) {
    showMessage("error", "Selecciona al menos un producto.");
    return;
  }

  const customer = {};
  for (const field of document.querySelectorAll('[data-kind="form-field"]')) {
    const val = String(field.value || "").trim();
    if (field.required && !val) {
      field.focus();
      showMessage("error", "Completa los campos obligatorios.");
      return;
    }
    customer[field.name] = val;
  }

  try {
    btn.disabled = true;
    btn.innerHTML = \`
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" style="animation:spin .8s linear infinite;width:18px;height:18px">
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
      </svg>
      <span>Enviando…</span>
    \`;

    const res = await fetch("/api/runtime-links/" + token + "/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customer, items: selectedItems, raw: { submittedAtClient: new Date().toISOString() } })
    });

    const data = await res.json();

    if (!res.ok) {
      showMessage("error", data.message || "No se pudo enviar la solicitud.");
      btn.disabled = false;
      btn.innerHTML = \`<span class="submit-icon" aria-hidden="true">→</span><span>\${originalLabel}</span>\`;
      return;
    }

    showMessage("success", data.message || successMessage);
  } catch (_) {
    showMessage("error", "Ocurrió un error al enviar la solicitud.");
    btn.disabled = false;
    btn.innerHTML = \`<span class="submit-icon" aria-hidden="true">→</span><span>\${originalLabel}</span>\`;
  }
}

/* spin keyframe for loading state */
const style = document.createElement("style");
style.textContent = "@keyframes spin { to { transform: rotate(360deg); } }";
document.head.appendChild(style);

[...config.components]
  .sort((a, b) => getPriority(a) - getPriority(b))
  .forEach((c, i) => {
    const el = renderComponent(c);
    /* stagger delay per element */
    if (el.classList.contains("animate")) {
      el.style.animationDelay = (80 + i * 60) + "ms";
    }
    contentEl.appendChild(el);
  });

updateTotal();
</script>

</body>
</html>`;
}