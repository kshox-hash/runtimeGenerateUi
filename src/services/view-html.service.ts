import { RuntimeLinkRecord } from "../types/runtime";
import { escapeHtml } from "../utils/html";

export function renderViewHtml(record: RuntimeLinkRecord): string {
  const safeSuccessMessage = escapeHtml(
    record.config.successMessage || "Solicitud enviada correctamente."
  );

  const safeTitle = escapeHtml(record.config.title || "Amaru Electric - Cotizador");
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
:root {

  --bg: #0f1011;

  --surface-1: #20242d;
  --surface-2: #22263a;
  --surface-3: #1b1c25;

  --on-bg: #d8dbe2;
  --on-surface: #e8eaed;
  --on-surface-v: #b0b4be;

  --primary: #bfc7ff;

  --primary-bg: #22263a;
  --primary-bg-2: #2b3150;

  --muted: #b0b4be;
  --muted-2: #858a96;

  --green: #81c995;
  --green-bg: #1d3428;

  --red: #f28b82;
  --red-bg: #34201f;

  --radius-m: 16px;
  --radius-l: 20px;
  --radius-xl: 24px;

  --safe-b: env(safe-area-inset-bottom, 0px);
}
}

*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  -webkit-tap-highlight-color: transparent;
}

html,
body {
  min-height: 100vh;
}

body {
  background: var(--bg);
  color: var(--on-bg);
  font-family: "Inter", system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
  padding-bottom: calc(40px + var(--safe-b));
  overflow-x: hidden;
}

button,
input,
textarea {
  font: inherit;
  color: inherit;
}

button {
  cursor: pointer;
  touch-action: manipulation;
}

.shell {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  padding: 0 16px;
}

@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(12px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate {
  opacity: 0;
  animation: fadeUp 400ms cubic-bezier(.2, .6, .4, 1) forwards;
}

.topbar {
  height: 72px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  width: 40px;
  height: 40px;
  background: var(--primary);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.brand-name {
  font-weight: 600;
  letter-spacing: -0.02em;
  color: var(--on-surface);
}

.hero {
  padding: 24px 0 32px;
}

.hero-title {
  font-family: "Google Sans Display", "Google Sans", "Inter", sans-serif;
  font-size: 32px;
  font-weight: 500;
  line-height: 1.1;
  margin-bottom: 12px;
  color: var(--on-surface);
  letter-spacing: -0.035em;
}

.hero-sub {
  font-size: 15px;
  color: var(--muted);
  line-height: 1.5;
}

.content-flow {
  display: grid;
  gap: 16px;
}

.card {
  background: var(--surface-1);
  border-radius: var(--radius-xl);
  overflow: hidden;
}

.form-header {
  padding: 24px 20px 16px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--on-surface);
}

.section-sub {
  font-size: 13px;
  color: var(--muted);
  margin-top: 4px;
  line-height: 1.35;
}

.form-body {
  padding: 0 20px 24px;
  display: grid;
  gap: 16px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.label {
  font-size: 12px;
  font-weight: 600;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

input,
textarea {
  width: 100%;
  background: var(--surface-2);
  border-radius: 12px;
  padding: 14px;
  color: var(--on-surface);
  font-size: 15px;
  outline: none;
  transition: border-color 0.2s, background 0.2s;
}

input::placeholder,
textarea::placeholder {
  color: var(--muted-2);
}

input:focus,
textarea:focus {
  background: var(--surface-3);
}

textarea {
  min-height: 92px;
  resize: vertical;
}

.search-box {
  padding: 0 20px 16px;
}

.search-input {
  width: 100%;
  background: var(--surface-2);
  border-radius: 99px;
  padding: 12px 20px;
  font-size: 14px;
}

.scroll-container {
  max-height: 52vh;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 0 12px 12px;
  scrollbar-width: thin;
  scrollbar-color: var(--surface-3) transparent;
}

.scroll-container::-webkit-scrollbar {
  width: 4px;
}

.scroll-container::-webkit-scrollbar-track {
  background: transparent;
}

.scroll-container::-webkit-scrollbar-thumb {
  background: var(--surface-3);
  border-radius: 10px;
}

.product-list {
  display: grid;
  gap: 4px;
}

.product-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px;
  border-radius: var(--radius-m);
  transition: background 0.2s;
}

.product-item:hover {
  background: var(--surface-2);
}

.product-item.is-selected {
  background: #252b3f;
}

.product-info {
  flex: 1;
  margin-right: 12px;
  min-width: 0;
}

.p-name {
  font-weight: 500;
  font-size: 15px;
  color: var(--on-surface);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.p-desc {
  font-size: 12px;
  color: var(--muted);
  margin: 4px 0;
  line-height: 1.35;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.p-price {
  font-size: 14px;
  font-weight: 600;
  color: var(--primary);
}

.stepper {
  display: flex;
  align-items: center;
  background: var(--surface-2);
  border-radius: 99px;
  padding: 4px;
  flex-shrink: 0;
}

.stepper.has-qty {
  background: var(--primary-bg-2);
}

.step-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: var(--on-surface);
  display: flex;
  align-items: center;
  justify-content: center;
}

.step-btn:active {
  background: var(--surface-3);
}

.step-val {
  width: 28px;
  text-align: center;
  font-weight: 600;
  font-size: 14px;
  user-select: none;
}

.qty-hidden {
  display: none;
}

.total-bar {
  background: var(--primary-bg);
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 12px;
}

.total-label {
  color: var(--primary);
}

.total-val {
  font-size: 24px;
  font-weight: 600;
  font-family: "Google Sans Display", "Google Sans", "Inter", sans-serif;
  color: var(--on-surface);
  font-variant-numeric: tabular-nums;
  text-align: right;
}

.btn-submit {
  width: 100%;
  padding: 18px;
  border-radius: 99px;
  background: var(--primary);
  border: none;
  color: white;
  font-size: 16px;
  font-weight: 600;
  margin-top: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.btn-submit:active {
  transform: scale(0.98);
  opacity: 0.9;
}

.btn-submit:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  transform: none;
}

.message {
  display: none;
  padding: 16px;
  border-radius: 12px;
  text-align: center;
  margin-top: 16px;
  font-size: 14px;
  line-height: 1.45;
}

.message.success {
  display: block;
  background: var(--green-bg);
  color: var(--green);
}

.message.error {
  display: block;
  background: var(--red-bg);
  color: var(--red);
}

.empty-state {
  padding: 24px 16px;
  color: var(--muted);
  font-size: 13px;
  text-align: center;
  line-height: 1.4;
}

@keyframes bump {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

.bump {
  animation: bump 0.2s ease-out;
}

.expires {
  margin-top: 18px;
  text-align: center;
  color: var(--muted-2);
  font-size: 11px;
}

@media (min-width: 560px) {
  .form-grid {
    grid-template-columns: 1fr 1fr;
  }

  .field.full {
    grid-column: 1 / -1;
  }
}
</style>
</head>

<body>
<div class="shell">
  <header class="topbar animate">
    <div class="logo-icon">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
      </svg>
    </div>
    <span class="brand-name">Amaru Electric</span>
  </header>

  <section class="hero animate" style="animation-delay: 0.1s">
    <h1 class="hero-title">Solicita tu cotización</h1>
    <p class="hero-sub">Ingresa tus datos y selecciona los productos para recibir un presupuesto personalizado.</p>
  </section>

  <div id="content" class="content-flow"></div>
  <div id="message" class="message"></div>

  <p class="expires">
    Este enlace expira el <span id="expiresAt"></span>
  </p>
</div>

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

  if (totalValue) {
    totalValue.textContent = formatCurrency(total);
    totalValue.classList.remove("bump");
    void totalValue.offsetWidth;
    totalValue.classList.add("bump");
  }

  updateSelectedCount();
}

function renderText(component) {
  const card = document.createElement("div");
  card.className = "card animate";

  const body = document.createElement("div");
  body.className = "form-body";
  body.textContent = component.value || "";

  card.appendChild(body);
  return card;
}

function renderForm(component) {
  const card = document.createElement("div");
  card.className = "card animate";
  card.style.animationDelay = "0.2s";

  const header = document.createElement("div");
  header.className = "form-header";
  header.innerHTML = \`
    <div class="section-title">Mis Datos</div>
    <div class="section-sub">Completa la información para contactarte.</div>
  \`;

  const body = document.createElement("div");
  body.className = "form-body";

  const grid = document.createElement("div");
  grid.className = "form-grid";

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

    if (field.required) input.required = true;

    fieldWrap.appendChild(label);
    fieldWrap.appendChild(input);
    grid.appendChild(fieldWrap);
  });

  body.appendChild(grid);
  card.appendChild(header);
  card.appendChild(body);

  return card;
}

function renderProducts(component) {
  const card = document.createElement("div");
  card.className = "card animate";
  card.style.animationDelay = "0.3s";

  card.innerHTML = \`
    <div class="form-header">
      <div class="section-title">Catálogo</div>
      <div class="section-sub">Busca y selecciona productos</div>
    </div>

    <div class="search-box">
      <input type="text" class="search-input" placeholder="Buscar componentes..." id="pSearch" autocomplete="off" />
    </div>

    <div class="scroll-container" id="pList"></div>

    <div class="total-bar">
      <div class="label total-label">Total Estimado</div>
      <div class="total-val" id="totalValue">\${formatCurrency(0)}</div>
    </div>
  \`;

  const list = card.querySelector("#pList");

  if (!Array.isArray(component.items) || component.items.length === 0) {
    list.innerHTML = "<div class='empty-state'>No hay productos disponibles.</div>";
    return card;
  }

  const productList = document.createElement("div");
  productList.className = "product-list";

  component.items.forEach((item) => {
    const row = document.createElement("div");
    row.className = "product-item";
    row.dataset.search = String((item.name || "") + " " + (item.description || "")).toLowerCase();

    const info = document.createElement("div");
    info.className = "product-info";

    const name = document.createElement("div");
    name.className = "p-name";
    name.textContent = item.name || "Producto";

    const desc = document.createElement("div");
    desc.className = "p-desc";
    desc.textContent = item.description || "";

    const price = document.createElement("div");
    price.className = "p-price";
    price.textContent = formatCurrency(item.price || 0);

    info.appendChild(name);
    if (item.description) info.appendChild(desc);
    info.appendChild(price);

    const stepper = document.createElement("div");
    stepper.className = "stepper";

    const minusBtn = document.createElement("button");
    minusBtn.className = "step-btn";
    minusBtn.type = "button";
    minusBtn.setAttribute("aria-label", "Disminuir cantidad");
    minusBtn.textContent = "−";

    const valueEl = document.createElement("div");
    valueEl.className = "step-val";
    valueEl.textContent = "0";

    const plusBtn = document.createElement("button");
    plusBtn.className = "step-btn";
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

      valueEl.classList.remove("bump");
      void valueEl.offsetWidth;
      valueEl.classList.add("bump");

      row.classList.toggle("is-selected", safe > 0);
      stepper.classList.toggle("has-qty", safe > 0);
      updateTotal();
    }

    minusBtn.addEventListener("click", () => syncQty(Number(hiddenInput.value) - 1));
    plusBtn.addEventListener("click", () => syncQty(Number(hiddenInput.value) + 1));

    stepper.appendChild(minusBtn);
    stepper.appendChild(valueEl);
    stepper.appendChild(plusBtn);
    stepper.appendChild(hiddenInput);

    row.appendChild(info);
    row.appendChild(stepper);
    productList.appendChild(row);
  });

  list.appendChild(productList);

  const searchInput = card.querySelector("#pSearch");

  searchInput.addEventListener("input", (event) => {
    const value = event.target.value.toLowerCase().trim();

    productList.querySelectorAll(".product-item").forEach((row) => {
      row.style.display = row.dataset.search.includes(value) ? "flex" : "none";
    });
  });

  return card;
}

function renderButton(component) {
  const btn = document.createElement("button");
  btn.className = "btn-submit animate";
  btn.type = "button";
  btn.style.animationDelay = "0.4s";
  btn.innerHTML = \`
    <span>\${component.label || "Enviar cotización"}</span>
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
    </svg>
  \`;

  btn.addEventListener("click", () => {
    onSubmit(btn, component.label || "Enviar cotización");
  });

  return btn;
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
      btn.innerHTML = \`
        <span>\${originalLabel}</span>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
        </svg>
      \`;
      return;
    }

    showMessage("success", data.message || successMessage);
  } catch (_) {
    showMessage("error", "Ocurrió un error al enviar la solicitud.");
    btn.disabled = false;
    btn.innerHTML = \`
      <span>\${originalLabel}</span>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
      </svg>
    \`;
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
