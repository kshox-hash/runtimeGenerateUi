import { RuntimeLinkRecord } from "../types/runtime";
import { escapeHtml } from "../utils/html";

export function renderViewHtml(record: RuntimeLinkRecord): string {
  const safeSuccessMessage = escapeHtml(
    record.config.successMessage || "Solicitud enviada correctamente."
  );
  const safeTitle = escapeHtml(record.config.title || "Cotizador online");
  const safeBrand = escapeHtml(record.config.brand || "Amaru Electric");
  const safeHeroSubtitle = escapeHtml(
    record.config.subtitle ||
      "Ingresa tus datos y selecciona los productos para recibir un presupuesto personalizado."
  );

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
  --bg: #0f1011;

  --surface-1: #16191f;
  --surface-2: #1b1f25;
  --surface-3: #1a1d24;

  --on-bg: #f3f4f6;
  --on-surface: #ffffff;
  --on-surface-v: #9ca3af;

  --primary: #63acf1;
  --primary-bg: #1e4248;
  --primary-bg-2: #2d6d7d;

  --muted: #9ca3af;
  --muted-2: #6b7280;

  --green: #10b981;
  --green-bg: #064e3b;

  --red: #ef4444;
  --red-bg: #451a1a;

  --radius-m: 16px;
  --radius-l: 20px;
  --radius-xl: 24px;

  --page-max: 600px;
  --safe-b: env(safe-area-inset-bottom, 0px);
}

*, *::before, *::after {
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
  color: var(--on-bg);
  font-family: "Inter", "Google Sans", system-ui, sans-serif;
  overflow-x: hidden;
  -webkit-font-smoothing: antialiased;
  padding-bottom: calc(40px + var(--safe-b));
}

button,
input,
textarea {
  font: inherit;
  color: inherit;
}

button {
  touch-action: manipulation;
  cursor: pointer;
}

/* ENTRANCE ANIMATION */

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

/* PAGE */

.shell {
  width: 100%;
  max-width: var(--page-max);
  margin: 0 auto;
  padding: 0 16px;
}

/* TOPBAR */

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
  color: #ffffff;
  flex-shrink: 0;
}

.logo-icon svg {
  width: 24px;
  height: 24px;
  display: block;
}

.brand-name {
  font-weight: 600;
  letter-spacing: -0.02em;
  color: var(--on-surface);
}

/* HERO */

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
  letter-spacing: -0.03em;
}

.hero-sub {
  font-size: 15px;
  color: var(--muted);
  line-height: 1.5;
}

/* CONTENT */

.content-flow {
  display: grid;
  gap: 16px;
}

/* CARDS */

.card {
  background: var(--surface-1);
  border-radius: var(--radius-xl);
  margin-bottom: 0;
  overflow: hidden;

}

/* FORM */

.form-header {
  padding: 24px 20px 16px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--on-surface);
  letter-spacing: -0.02em;
}

.section-sub {
  font-size: 13px;
  color: var(--muted);
  margin-top: 4px;
  line-height: 1.4;
}

.form-body {
  padding: 0 20px 24px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
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
  border: 1px solid transparent;
  border-radius: 12px;
  padding: 14px;
  color: var(--on-surface);
  font-size: 15px;
  outline: none;
  transition:
    border-color 0.2s ease,
    background 0.2s ease;
}

input::placeholder,
textarea::placeholder {
  color: var(--muted-2);
}

input:focus,
textarea:focus {
  border-color: var(--primary);
  background: var(--surface-3);
}

textarea {
  min-height: 96px;
  resize: vertical;
}

/* PRODUCTS */

.products-header {
  padding: 24px 20px 16px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.products-badge {
  flex-shrink: 0;
  padding: 6px 12px;
  border-radius: 999px;
  background: var(--primary-bg);
  color: var(--primary);
  font-size: 11.5px;
  font-weight: 600;
  white-space: nowrap;
}

.products-badge.has-selection {
  background: var(--primary-bg-2);
  color: #ffffff;
}

.search-box {
  padding: 0 20px 16px;
}

.search-shell {
  width: 100%;
  min-height: 46px;
  background: var(--surface-2);
  border-radius: 999px;
  padding: 0 16px;
  display: grid;
  grid-template-columns: 20px 1fr;
  align-items: center;
  gap: 10px;
  transition: background 0.2s ease;
}

.search-shell:focus-within {
  background: var(--surface-3);
}

.search-shell svg {
  width: 18px;
  height: 18px;
  color: var(--muted);
}

.search-input {
  min-width: 0;
  width: 100%;
  background: transparent;
  border: none;
  border-radius: 0;
  padding: 0;
  font-size: 14px;
}

/* SCROLL CONTAINER */

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
  gap: 6px;
}

/* PRODUCT ITEM */

.product-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 16px;
  border-radius: var(--radius-m);
  transition: background 0.2s ease;
}

.product-item:hover {
  background: var(--surface-2);
}

.product-item.is-selected {
  background: var(--primary-bg);
}

.product-info {
  flex: 1;
  margin-right: 0;
  min-width: 0;
}

.p-name {
  font-weight: 500;
  font-size: 15px;
  color: var(--on-surface);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.3;
}

.p-desc {
  font-size: 12px;
  color: var(--muted);
  margin: 4px 0;
  line-height: 1.4;
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

/* STEPPER */

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

.step-btn svg {
  width: 12px;
  height: 12px;
  display: block;
}

.step-btn:active {
  background: var(--surface-3);
}

.step-val {
  width: 28px;
  text-align: center;
  font-weight: 600;
  font-size: 14px;
  color: var(--on-surface);
  user-select: none;
}

.qty-hidden {
  display: none;
}

/* TOTAL */

.total-bar {
  background: var(--primary-bg);
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;

}

.total-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--primary);
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.total-val {
  font-size: 24px;
  font-weight: 600;
  font-family: "Google Sans Display", "Google Sans", "Inter", sans-serif;
  color: var(--on-surface);
  font-variant-numeric: tabular-nums;
  text-align: right;
}

.total-val.nonzero {
  color: #ffffff;
}

/* SUBMIT */

.btn-submit {
  width: 100%;
  padding: 18px;
  border-radius: 99px;
  background: var(--primary);
  border: none;
  color: #ffffff;
  font-size: 16px;
  font-weight: 600;
  margin-top: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.btn-submit svg {
  width: 20px;
  height: 20px;
  display: block;
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

/* MESSAGE */

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

.expires {
  margin-top: 20px;
  text-align: center;
  color: var(--muted-2);
  font-size: 11px;
  line-height: 1.4;
}

.search-empty {
  display: none;
  padding: 28px 16px;
  color: var(--muted);
  text-align: center;
  font-size: 13px;
}

/* MICRO FEEDBACK */

@keyframes bump {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

.bump {
  animation: bump 0.2s ease-out;
}

/* RESPONSIVE */

@media (max-width: 520px) {
  .shell {
    padding: 0 14px;
  }

  .form-body {
    grid-template-columns: 1fr;
  }

  .scroll-container {
    max-height: 48vh;
  }

  .hero-title {
    font-size: 30px;
  }
}

@media (max-width: 380px) {
  .product-item {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .stepper {
    align-self: flex-start;
  }

  .total-bar {
    flex-direction: column;
    align-items: flex-start;
  }

  .total-val {
    text-align: left;
    font-size: 22px;
  }
}
</style>
</head>

<body>
<main class="shell">
  <header class="topbar animate">
    <div class="logo-icon" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
      </svg>
    </div>
    <span class="brand-name">${safeBrand}</span>
  </header>

  <section class="hero animate" style="animation-delay: 0.1s">
    <p class="hero-sub">${safeHeroSubtitle}</p>
  </section>

  <div id="content" class="content-flow"></div>
  <div id="message" class="message"></div>

  <p class="expires">
    Este enlace expira el <span id="expiresAt"></span>
  </p>
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

  inputs.forEach((input) => {
    if (Number(input.value || 0) > 0) selected++;
  });

  const badge = document.getElementById("productsSelected");

  if (badge) {
    badge.textContent =
      selected === 1 ? "1 seleccionado" : selected + " seleccionados";

    badge.classList.toggle("has-selection", selected > 0);
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
    totalValue.classList.toggle("nonzero", total > 0);
    bump(totalValue);
  }

  updateSelectedCount();
}

function renderText(component) {
  const box = document.createElement("div");
  box.className = "card animate";
  box.style.padding = "18px 20px";
  box.style.color = "var(--muted)";
  box.style.fontSize = "13.5px";
  box.style.lineHeight = "1.6";
  box.textContent = component.value || "";
  return box;
}

function renderForm(component) {
  const card = document.createElement("div");
  card.className = "card animate";

  const header = document.createElement("div");
  header.className = "form-header";
  header.innerHTML = \`
    <div class="section-title">Mis datos</div>
    <div class="section-sub">Completa la información para contactarte.</div>
  \`;
  card.appendChild(header);

  const body = document.createElement("div");
  body.className = "form-body";

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
    body.appendChild(fieldWrap);
  });

  card.appendChild(body);
  return card;
}

function renderProducts(component) {
  const card = document.createElement("div");
  card.className = "card animate";

  const header = document.createElement("div");
  header.className = "products-header";
  header.innerHTML = \`
    <div>
      <div class="section-title">Catálogo</div>
      <div class="section-sub">Busca y selecciona productos.</div>
    </div>
    <div class="products-badge" id="productsSelected">0 seleccionados</div>
  \`;
  card.appendChild(header);

  const searchWrap = document.createElement("div");
  searchWrap.className = "search-box";
  searchWrap.innerHTML = \`
    <div class="search-shell">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
        <circle cx="11" cy="11" r="8"></circle>
        <path d="m21 21-4.35-4.35"></path>
      </svg>
      <input type="text" class="search-input" placeholder="Buscar componentes..." id="productsSearch" autocomplete="off" />
    </div>
  \`;
  card.appendChild(searchWrap);

  const scrollContainer = document.createElement("div");
  scrollContainer.className = "scroll-container";

  const list = document.createElement("div");
  list.className = "product-list";
  list.id = "productsList";

  const emptySearch = document.createElement("div");
  emptySearch.className = "search-empty";
  emptySearch.textContent = "Sin resultados para tu búsqueda.";

  if (!Array.isArray(component.items) || component.items.length === 0) {
    list.innerHTML =
      "<div style='padding:24px 16px;color:var(--muted);font-size:13px;text-align:center'>No hay productos disponibles.</div>";

    scrollContainer.appendChild(list);
    card.appendChild(scrollContainer);
    return card;
  }

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
    minusBtn.innerHTML =
      "<svg viewBox='0 0 24 24' fill='none'><path d='M5 12h14' stroke='currentColor' stroke-width='2' stroke-linecap='round'/></svg>";

    const valueEl = document.createElement("div");
    valueEl.className = "step-val";
    valueEl.textContent = "0";

    const plusBtn = document.createElement("button");
    plusBtn.className = "step-btn";
    plusBtn.type = "button";
    plusBtn.setAttribute("aria-label", "Aumentar cantidad");
    plusBtn.innerHTML =
      "<svg viewBox='0 0 24 24' fill='none'><path d='M12 5v14M5 12h14' stroke='currentColor' stroke-width='2' stroke-linecap='round'/></svg>";

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

      bump(valueEl);

      const active = safe > 0;
      row.classList.toggle("is-selected", active);
      stepper.classList.toggle("has-qty", active);

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
    list.appendChild(row);
  });

  scrollContainer.appendChild(list);
  scrollContainer.appendChild(emptySearch);
  card.appendChild(scrollContainer);

  const total = document.createElement("div");
  total.className = "total-bar";
  total.innerHTML = \`
    <div class="total-label">Total estimado</div>
    <div class="total-val" id="totalValue">\${formatCurrency(0)}</div>
  \`;
  card.appendChild(total);

  const searchInput = searchWrap.querySelector("#productsSearch");

  searchInput.addEventListener("input", (event) => {
    const value = event.target.value.toLowerCase().trim();
    let visible = 0;

    list.querySelectorAll(".product-item").forEach((product) => {
      const match = product.dataset.search.includes(value);
      product.style.display = match ? "flex" : "none";
      if (match) visible++;
    });

    emptySearch.style.display = visible === 0 ? "block" : "none";
  });

  return card;
}

function renderButton(component) {
  const button = document.createElement("button");
  button.className = "btn-submit animate";
  button.type = "button";
  button.innerHTML = \`
    <span>\${component.label || "Enviar cotización"}</span>
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path>
    </svg>
  \`;

  button.addEventListener("click", () => {
    onSubmit(button, component.label || "Enviar cotización");
  });

  return button;
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

async function onSubmit(button, originalLabel) {
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
    button.disabled = true;
    button.textContent = "Enviando...";

    const response = await fetch("/api/runtime-links/" + token + "/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customer,
        items: selectedItems,
        raw: {
          submittedAtClient: new Date().toISOString()
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      showMessage("error", data.message || "No se pudo enviar la solicitud.");
      button.disabled = false;
      button.innerHTML = \`
        <span>\${originalLabel}</span>
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path>
        </svg>
      \`;
      return;
    }

    showMessage("success", data.message || successMessage);
  } catch (_) {
    showMessage("error", "Ocurrió un error al enviar la solicitud.");
    button.disabled = false;
    button.innerHTML = \`
      <span>\${originalLabel}</span>
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path>
      </svg>
    \`;
  }
}

[...config.components]
  .sort((a, b) => getComponentPriority(a) - getComponentPriority(b))
  .forEach((component, index) => {
    const element = renderComponent(component);

    if (element.classList.contains("animate")) {
      element.style.animationDelay = 0.2 + index * 0.1 + "s";
    }

    contentEl.appendChild(element);
  });

updateTotal();
</script>
</body>
</html>`;
}
