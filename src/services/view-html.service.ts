import { RuntimeLinkRecord } from "../types/runtime";
import { escapeHtml } from "../utils/html";

export function renderViewHtml(record: RuntimeLinkRecord): string {
  const safeSuccessMessage = escapeHtml(
    record.config.successMessage || "Solicitud enviada correctamente."
  );

  const configJson = JSON.stringify(record.config);

  return `<!doctype html>
<html lang="es">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
<title>Cotizador online</title>

<style>
:root {
  /* =========================
     PALETA PROFESIONAL DARK
  ========================= */
  --bg: #1b1d23;

  --surface: #20242d;
  --surface-hover: #282d38;
  --surface-soft: #29313d;

  --field: #191c24;
  --field-focus: #232836;


  --item: #111821;
  --item-hover: #172131;

  --text: #d2d7e2;
  --text-strong: #f5f7fb;
  --text-soft: #afb6c5;
  --muted: #838b9c;
  --muted-soft: #636b7a;

  --accent: #9db7ff;
  --accent-strong: #d9e2ff;
  --accent-bg: #1c1f27;

  --accent-btn: #516da8;
  --accent-btn-hover: #5f7bbb;
  --accent-btn-active: #456196;

  --green: #7bd6a3;
  --green-soft: #1b3527;
  --red: #f0948d;
  --red-soft: #3a2020;

  --line: rgba(255,255,255,0.055);

  --radius-md: 18px;
  --radius-lg: 24px;
  --page-max: 860px;
}

* {
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
  margin: 0;
  padding: 0;
}

html,
body {
  min-height: 100vh;
}

body {
  background: var(--bg);
  color: var(--text);
  font-family:
    "Google Sans",
    Inter,
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;
  overflow-x: hidden;
  -webkit-font-smoothing: antialiased;
}

button,
input,
textarea {
  font: inherit;
  color: inherit;
}

button {
  touch-action: manipulation;
}

.page {
  min-height: 100vh;
  padding: 14px 10px 34px;
}

.shell {
  width: 100%;
  max-width: var(--page-max);
  margin: 0 auto;
}

.module-shell {
  min-height: calc(100vh - 48px);
  background: var(--bg);
}

.module-head {
  padding: 4px 2px 18px;
}

.module-title-row {
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.module-kicker {
  color: var(--accent);
  font-size: 12px;
  font-weight: 650;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.module-body,
.content-flow {
  display: grid;
  gap: 18px;
}

.module-body {
  padding: 0;
}

.section-wrap {
  background: transparent;
}

.section-header {
  padding: 0 2px 14px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: start;
  gap: 12px;
}

.section-title {
  color: var(--text-strong);
  font-size: 18px;
  font-weight: 650;
  letter-spacing: -0.03em;
  line-height: 1.1;
}

.section-sub {
  color: var(--muted-soft);
  font-size: 12px;
  margin-top: 5px;
}

.badge-count {
  padding: 8px 11px;
  border-radius: 999px;
  background: var(--accent-bg);
  color: var(--accent);
  font-size: 11.5px;
  font-weight: 650;
  white-space: nowrap;
}

.search-wrap {
  padding: 0 0 12px;
}

.search-shell {
  height: 48px;
  display: grid;
  grid-template-columns: 1fr 36px;
  align-items: center;
  border-radius: 999px;
  background: var(--surface);
  padding: 0 6px 0 16px;
}

.search-input {
  min-width: 0;
  border: none;
  outline: none;
  background: transparent;
  color: var(--text);
  font-size: 14px;
}

.search-input::placeholder {
  color: var(--muted-soft);
}

.search-icon {
  width: 34px;
  height: 34px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--surface-soft);
  color: var(--muted);
  font-size: 15px;
}

.products-scroll {
  padding: 10px;
  border-radius: var(--radius-lg);
  background: var(--surface);
}

.products-scroll.is-scrollable {
  max-height: min(54vh, 620px);
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-width: thin;
  scrollbar-color: #3b4658 transparent;
}

.products-scroll.is-scrollable::-webkit-scrollbar {
  width: 6px;
}

.products-scroll.is-scrollable::-webkit-scrollbar-track {
  background: transparent;
}

.products-scroll.is-scrollable::-webkit-scrollbar-thumb {
  background: #3b4658;
  border-radius: 999px;
}

.products-list {
  display: grid;
  gap: 10px;
}

.product-card {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px;
  min-height: 60px;
  padding: 13px 14px;
  border-radius: var(--radius-md);
  background: var(--item);
  border: 1px solid rgba(255,255,255,0.055);
}

.product-card:hover {
  background: var(--item-hover);
}

.product-main {
  min-width: 0;
}

.product-top {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: baseline;
  gap: 10px;
  margin-bottom: 4px;
}

.product-name {
  color: var(--text-strong);
  font-size: 14px;
  line-height: 1.25;
  font-weight: 560;
  letter-spacing: -0.02em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.product-price {
  color: var(--accent);
  font-size: 13px;
  font-weight: 620;
  white-space: nowrap;
}

.product-description {
  color: var(--muted-soft);
  font-size: 12px;
  line-height: 1.35;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.qty-box {
  display: grid;
  grid-template-columns: 30px 34px 30px;
  height: 34px;
  border-radius: 999px;
  overflow: hidden;
  background: var(--surface-soft);
}

.qty-btn {
  border: none;
  background: transparent;
  color: var(--text-soft);
  font-size: 15px;
  cursor: pointer;
}

.qty-btn:hover {
  background: var(--surface-hover);
}

.qty-value {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-strong);
  font-size: 13px;
  font-weight: 620;
}

.qty-hidden {
  display: none;
}

.total-row {
  margin-top: 12px;
  padding: 18px;
  border-radius: var(--radius-lg);
  background: var(--accent-bg);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
}

.total-title {
  color: var(--accent-strong);
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
}

.total-value {
  color: var(--text-strong);
  font-size: clamp(24px, 7vw, 32px);
  font-weight: 650;
  letter-spacing: 0.04em;
  line-height: 1.05;
  text-align: right;
  font-variant-numeric: tabular-nums;
  font-feature-settings: "tnum" 1;
  overflow-wrap: anywhere;
}

.text-block {
  padding: 16px;
  border-radius: var(--radius-lg);
  background: var(--surface);
  color: var(--muted);
  font-size: 13.5px;
  line-height: 1.5;
}

.form-collapse {
  border-radius: var(--radius-lg);
  background: var(--surface);
  overflow: hidden;
}

.form-head {
  min-height: 72px;
  padding: 16px;
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr) 42px;
  align-items: center;
  gap: 14px;
}

.form-icon {
  width: 42px;
  height: 42px;
  border-radius: 16px;
  background: var(--accent-bg);
  color: var(--accent);
  display: flex;
  align-items: center;
  justify-content: center;
}

.form-copy {
  min-width: 0;
  text-align: center;
}

.form-title {
  color: var(--text-strong);
  font-size: 15px;
  font-weight: 650;
  letter-spacing: -0.02em;
}

.form-sub {
  color: var(--muted-soft);
  font-size: 12px;
  margin-top: 4px;
}

.form-content {
  padding: 0 16px 16px;
}

.form-divider {
  height: 1px;
  background: var(--line);
  margin-bottom: 16px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field.full {
  grid-column: 1 / -1;
}

.label {
  color: var(--muted);
  font-size: 12px;
}

input,
textarea {
  width: 100%;
  border: none;
  outline: none;
  background: var(--field);
  color: var(--text);
  border-radius: var(--radius-md);
  padding: 14px 15px;
  font-size: 14px;
}

input::placeholder,
textarea::placeholder {
  color: var(--muted-soft);
}

input:focus,
textarea:focus {
  background: var(--field-focus);
}

textarea {
  min-height: 96px;
  resize: vertical;
}

.submit-wrap {
  display: grid;
}

.submit-btn {
  width: 100%;
  min-height: 56px;
  border: none;
  border-radius: 999px;
  background: var(--accent-btn);
  color: #f5f7fb;
  font-size: 15px;
  font-weight: 650;
  cursor: pointer;
}

.submit-btn:hover {
  background: var(--accent-btn-hover);
}

.submit-btn:active {
  background: var(--accent-btn-active);
}

.submit-btn:disabled {
  opacity: 0.48;
  cursor: not-allowed;
}

.message {
  display: none;
  padding: 16px;
  border-radius: var(--radius-lg);
  font-size: 13px;
  line-height: 1.5;
  white-space: pre-wrap;
  text-align: center;
}

.message.success {
  display: block;
  background: var(--green-soft);
  color: var(--green);
}

.message.error {
  display: block;
  background: var(--red-soft);
  color: var(--red);
}

.expires {
  margin-top: 16px;
  text-align: center;
  color: var(--muted-soft);
  font-size: 11px;
}

@media (min-width: 640px) {
  .page {
    padding: 18px 16px 42px;
  }

  .content-flow {
    gap: 20px;
  }
}

@media (max-width: 520px) {
  .products-scroll.is-scrollable {
    max-height: 52vh;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 390px) {
  .page {
    padding: 12px 8px 30px;
  }

  .section-header {
    grid-template-columns: 1fr;
  }

  .badge-count {
    width: max-content;
  }

  .product-card {
    grid-template-columns: 1fr;
    align-items: start;
  }

  .qty-box {
    justify-self: start;
  }

  .product-top {
    grid-template-columns: 1fr;
    gap: 3px;
  }

  .product-price {
    justify-self: start;
  }

  .total-row {
    align-items: flex-start;
    flex-direction: column;
    gap: 8px;
  }

  .total-value {
    text-align: left;
    font-size: 24px;
  }
}
</style>
</head>

<body>
<main class="page">
  <div class="shell">

    <section class="module-shell">
      <header class="module-head">
        <div class="module-title-row">
          <div class="module-kicker">Cotizador online</div>
        </div>
      </header>

      <div class="module-body">
        <div id="content" class="content-flow"></div>
        <div id="message" class="message"></div>
      </div>
    </section>

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

function updateSelectedCount() {
  const inputs = document.querySelectorAll('[data-kind="product-quantity"]');
  let selected = 0;

  inputs.forEach((input) => {
    if (Number(input.value || 0) > 0) selected++;
  });

  const badge = document.getElementById("productsSelected");

  if (badge) {
    badge.textContent =
      selected === 1 ? "1 seleccionado" : selected + " seleccionados";
  }
}

function updateTotal() {
  const inputs = document.querySelectorAll('[data-kind="product-quantity"]');
  let total = 0;

  inputs.forEach((input) => {
    total += Number(input.value || 0) * Number(input.dataset.productPrice || 0);
  });

  const totalValue = document.getElementById("totalValue");

  if (totalValue) totalValue.textContent = formatCurrency(total);

  updateSelectedCount();
}

function renderText(component) {
  const box = document.createElement("div");
  box.className = "text-block";
  box.textContent = component.value || "";
  return box;
}

function renderProducts(component) {
  const wrap = document.createElement("div");
  wrap.className = "section-wrap";

  const header = document.createElement("div");
  header.className = "section-header";
  header.innerHTML = \`
    <div>
      <div class="section-title">Productos</div>
      <div class="section-sub">Busca y selecciona productos</div>
    </div>
    <div class="badge-count" id="productsSelected">0 seleccionados</div>
  \`;
  wrap.appendChild(header);

  const searchWrap = document.createElement("div");
  searchWrap.className = "search-wrap";
  searchWrap.innerHTML = \`
    <div class="search-shell">
      <input class="search-input" id="productsSearch" type="text" placeholder="Buscar productos" autocomplete="off" />
      <div class="search-icon">⌕</div>
    </div>
  \`;
  wrap.appendChild(searchWrap);

  const scrollBox = document.createElement("div");
  scrollBox.className = "products-scroll";

  const list = document.createElement("div");
  list.className = "products-list";
  list.id = "productsList";

  if (!Array.isArray(component.items) || component.items.length === 0) {
    list.innerHTML = "<div style='padding:16px;color:var(--muted);font-size:13px;text-align:center'>No hay productos disponibles.</div>";
    scrollBox.appendChild(list);
    wrap.appendChild(scrollBox);
    return wrap;
  }

  if (component.items.length >= 20) {
    scrollBox.classList.add("is-scrollable");
  }

  component.items.forEach((item) => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.dataset.search = String((item.name || "") + " " + (item.description || "")).toLowerCase();

    const main = document.createElement("div");
    main.className = "product-main";

    const top = document.createElement("div");
    top.className = "product-top";

    const name = document.createElement("div");
    name.className = "product-name";
    name.textContent = item.name || "Producto";

    const price = document.createElement("div");
    price.className = "product-price";
    price.textContent = formatCurrency(item.price || 0);

    top.appendChild(name);
    top.appendChild(price);

    const desc = document.createElement("div");
    desc.className = "product-description";
    desc.textContent = item.description || "";

    main.appendChild(top);
    main.appendChild(desc);

    const qtyBox = document.createElement("div");
    qtyBox.className = "qty-box";

    const minusBtn = document.createElement("button");
    minusBtn.className = "qty-btn";
    minusBtn.type = "button";
    minusBtn.setAttribute("aria-label", "Disminuir cantidad");
    minusBtn.textContent = "−";

    const valueEl = document.createElement("div");
    valueEl.className = "qty-value";
    valueEl.textContent = "0";

    const plusBtn = document.createElement("button");
    plusBtn.className = "qty-btn";
    plusBtn.type = "button";
    plusBtn.setAttribute("aria-label", "Aumentar cantidad");
    plusBtn.textContent = "+";

    const hiddenInput = document.createElement("input");
    hiddenInput.type = "number";
    hiddenInput.min = "0";
    hiddenInput.value = "0";
    hiddenInput.className = "qty-hidden";
    hiddenInput.dataset.productId = item.id;
    hiddenInput.dataset.productPrice = String(item.price || 0);
    hiddenInput.dataset.kind = "product-quantity";

    function syncQty(value) {
      const safe = Math.max(0, Number(value) || 0);
      hiddenInput.value = String(safe);
      valueEl.textContent = String(safe);
      updateTotal();
    }

    minusBtn.addEventListener("click", () => syncQty(Number(hiddenInput.value) - 1));
    plusBtn.addEventListener("click", () => syncQty(Number(hiddenInput.value) + 1));

    qtyBox.appendChild(minusBtn);
    qtyBox.appendChild(valueEl);
    qtyBox.appendChild(plusBtn);
    qtyBox.appendChild(hiddenInput);

    card.appendChild(main);
    card.appendChild(qtyBox);
    list.appendChild(card);
  });

  scrollBox.appendChild(list);
  wrap.appendChild(scrollBox);

  const totalRow = document.createElement("div");
  totalRow.className = "total-row";
  totalRow.innerHTML = \`
    <div class="total-title">Total estimado</div>
    <div class="total-value" id="totalValue">\${formatCurrency(0)}</div>
  \`;
  wrap.appendChild(totalRow);

  const searchInput = searchWrap.querySelector("#productsSearch");

  searchInput.addEventListener("input", (e) => {
    const value = e.target.value.toLowerCase().trim();

    list.querySelectorAll(".product-card").forEach((card) => {
      card.style.display = card.dataset.search.includes(value) ? "grid" : "none";
    });
  });

  return wrap;
}

function renderForm(component) {
  const wrap = document.createElement("div");
  wrap.className = "form-collapse";

  wrap.innerHTML = \`
    <div class="form-head">
      <div class="form-icon" aria-hidden="true">👤</div>

      <div class="form-copy">
        <div class="form-title">Mis datos</div>
        <div class="form-sub">Completa tu información</div>
      </div>

      <div></div>
    </div>

    <div class="form-content">
      <div class="form-divider"></div>
      <div class="form-grid"></div>
    </div>
  \`;

  const grid = wrap.querySelector(".form-grid");

  component.fields.forEach((field) => {
    const fieldWrap = document.createElement("div");
    fieldWrap.className = "field";

    if (field.inputType === "textarea") {
      fieldWrap.classList.add("full");
    }

    const label = document.createElement("label");
    label.className = "label";
    label.textContent = field.label + (field.required ? " *" : "");

    const input =
      field.inputType === "textarea"
        ? document.createElement("textarea")
        : document.createElement("input");

    if (field.inputType !== "textarea") {
      input.type = field.inputType || "text";
    }

    input.name = field.name;
    input.dataset.kind = "form-field";
    input.placeholder = field.placeholder || "";

    if (field.required) {
      input.required = true;
    }

    fieldWrap.appendChild(label);
    fieldWrap.appendChild(input);
    grid.appendChild(fieldWrap);
  });

  return wrap;
}

function renderButton(component) {
  const wrap = document.createElement("div");
  wrap.className = "submit-wrap";

  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "submit-btn";
  btn.textContent = component.label || "Enviar solicitud";

  btn.addEventListener("click", () => {
    onSubmit(btn, component.label || "Enviar solicitud");
  });

  wrap.appendChild(btn);

  return wrap;
}

function renderComponent(component) {
  switch (component.type) {
    case "form":
      return renderForm(component);

    case "products":
      return renderProducts(component);

    case "text":
      return renderText(component);

    case "button":
      return renderButton(component);

    default:
      return document.createElement("div");
  }
}

function getComponentPriority(component) {
  switch (component.type) {
    case "form":
      return 1;

    case "products":
      return 2;

    case "text":
      return 3;

    case "button":
      return 4;

    default:
      return 9;
  }
}

async function onSubmit(btn, originalLabel) {
  const selectedItems = [];

  document.querySelectorAll('[data-kind="product-quantity"]').forEach((input) => {
    const quantity = Number(input.value || 0);
    const productId = input.dataset.productId;

    if (quantity > 0 && productId) {
      selectedItems.push({ productId, quantity });
    }
  });

  if (selectedItems.length === 0) {
    showMessage("error", "Selecciona al menos un producto.");
    return;
  }

  const customer = {};
  const formFields = document.querySelectorAll('[data-kind="form-field"]');

  for (const field of formFields) {
    const value = String(field.value || "").trim();

    if (field.required && !value) {
      field.focus();
      showMessage("error", "Completa los campos obligatorios.");
      return;
    }

    customer[field.name] = value;
  }

  try {
    btn.disabled = true;
    btn.textContent = "Enviando...";

    const response = await fetch("/api/runtime-links/" + token + "/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customer,
        items: selectedItems,
        raw: { submittedAtClient: new Date().toISOString() }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      showMessage("error", data.message || "No se pudo enviar la solicitud.");
      btn.disabled = false;
      btn.textContent = originalLabel;
      return;
    }

    showMessage("success", data.message || successMessage);
  } catch (_) {
    showMessage("error", "Ocurrió un error al enviar la solicitud.");
    btn.disabled = false;
    btn.textContent = originalLabel;
  }
}

[...config.components]
  .sort((a, b) => getComponentPriority(a) - getComponentPriority(b))
  .forEach((component) => {
    contentEl.appendChild(renderComponent(component));
  });

updateTotal();
</script>

</body>
</html>`;
}
