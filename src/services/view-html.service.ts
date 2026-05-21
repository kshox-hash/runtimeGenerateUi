import { RuntimeLinkRecord } from "../types/runtime";
import { escapeHtml } from "../utils/html";

export function renderViewHtml(record: RuntimeLinkRecord): string {
  const safeTitle = escapeHtml(
    record.config.title || "Cotización"
  );

  const safeSubtitle = escapeHtml(
    record.config.subtitle ||
      "Selecciona productos y envía tu solicitud."
  );

  const safeSuccessMessage = escapeHtml(
    record.config.successMessage ||
      "Solicitud enviada correctamente."
  );

  const configJson = JSON.stringify(record.config);

  return `<!doctype html>
<html lang="es">
<head>

<meta charset="UTF-8" />

<meta
  name="viewport"
  content="width=device-width, initial-scale=1.0"
/>

<title>${safeTitle}</title>

<style>

:root {

  --bg: #0f0f10;

  --surface: #171718;
  --surface-2: #1f1f21;
  --surface-3: #262629;
  --surface-hover: #2d2d31;

  --text: #f4f4f5;
  --muted: #a1a1aa;
  --muted-2: #71717a;

  --white: #ffffff;
  --black: #0a0a0a;

  --success-bg: #132016;
  --success-text: #bbf7d0;

  --error-bg: #261717;
  --error-text: #fecaca;

  --radius-sm: 10px;
  --radius-md: 14px;
  --radius-lg: 18px;
  --radius-xl: 24px;

  --page-max: 760px;
}

* {
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
}

html,
body {
  margin: 0;
  padding: 0;
}

body {

  min-height: 100vh;

  background: var(--bg);

  color: var(--text);

  font-family:
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
}

.page {
  min-height: 100vh;
  padding: 16px 10px 22px;
}

.shell {
  width: 100%;
  max-width: var(--page-max);
  margin: 0 auto;
}

/* HERO */

.hero {
  margin-bottom: 18px;
}

h1 {

  margin: 0;

  color: white;

  font-size: clamp(34px, 6vw, 52px);

  line-height: 0.95;

  letter-spacing: -0.065em;

  font-weight: 950;
}

.subtitle {

  margin-top: 10px;

  max-width: 520px;

  color: var(--muted);

  font-size: 14px;

  line-height: 1.45;
}

/* PANEL */

.panel {

  background: var(--surface);

  border-radius: var(--radius-xl);

  padding: 12px;
}

.content-flow {
  display: grid;
  gap: 12px;
}

/* PRODUCTS */

.products-section {
  display: grid;
  gap: 10px;
}

.products-top {

  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 12px;
}

.products-title-wrap {
  min-width: 0;
}

.products-title {

  font-size: 15px;
  font-weight: 900;

  letter-spacing: -0.025em;

  color: white;
}

.products-subtitle {

  margin-top: 3px;

  color: var(--muted-2);

  font-size: 12px;
}

.products-selected {

  flex-shrink: 0;

  padding: 7px 10px;

  border-radius: 999px;

  background: var(--surface-2);

  color: var(--text);

  font-size: 12px;

  font-weight: 800;
}

/* SEARCH */

.search-wrap {
  position: relative;
}

.search-input {

  width: 100%;

  border: none;
  outline: none;

  background: var(--surface-2);

  color: white;

  border-radius: 16px;

  height: 46px;

  padding: 0 16px;

  font-size: 14px;
}

.search-input::placeholder {
  color: #666;
}

/* LIST */

.products-list {

  display: grid;

  gap: 8px;

  max-height: 58vh;

  overflow-y: auto;

  padding-right: 2px;

  scrollbar-width: thin;

  scrollbar-color: #3f3f46 transparent;
}

.products-list::-webkit-scrollbar {
  width: 6px;
}

.products-list::-webkit-scrollbar-thumb {
  background: #3f3f46;
  border-radius: 999px;
}

/* PRODUCT CARD */

.product-card {

  display: grid;

  grid-template-columns:
    minmax(0, 1fr)
    auto;

  align-items: center;

  gap: 12px;

  min-height: 78px;

  padding: 14px;

  border-radius: var(--radius-lg);

  background: var(--surface-2);

  transition:
    background 140ms ease,
    transform 140ms ease;
}

.product-card:hover {
  background: var(--surface-hover);
}

.product-main {
  min-width: 0;
}

.product-top {

  display: grid;

  grid-template-columns:
    minmax(0, 1fr)
    auto;

  align-items: baseline;

  gap: 12px;

  margin-bottom: 4px;
}

.product-name {

  margin: 0;

  color: white;

  font-size: 15px;

  line-height: 1.25;

  font-weight: 850;

  letter-spacing: -0.025em;

  white-space: nowrap;

  overflow: hidden;

  text-overflow: ellipsis;
}

.product-price {

  color: #d4d4d8;

  font-size: 14px;

  font-weight: 900;

  white-space: nowrap;
}

.product-description {

  margin: 0;

  color: var(--muted);

  font-size: 12px;

  line-height: 1.35;

  display: -webkit-box;

  -webkit-line-clamp: 1;

  -webkit-box-orient: vertical;

  overflow: hidden;
}

/* QTY */

.qty-box {

  display: grid;

  grid-template-columns:
    34px 38px 34px;

  height: 36px;

  border-radius: 14px;

  overflow: hidden;

  background: #101011;
}

.qty-btn {

  border: none;

  background: transparent;

  color: white;

  font-size: 16px;

  cursor: pointer;
}

.qty-btn:hover {
  background: var(--surface-3);
}

.qty-value {

  display: flex;

  align-items: center;
  justify-content: center;

  color: white;

  font-size: 13px;

  font-weight: 900;
}

.qty-hidden {
  display: none;
}

/* TOTAL */

.total-card {

  min-height: 68px;

  padding: 16px;

  border-radius: var(--radius-lg);

  background: #121213;

  display: flex;

  align-items: center;
  justify-content: space-between;

  gap: 12px;
}

.total-title {

  color: var(--muted);

  font-size: 13px;

  font-weight: 800;
}

.total-value {

  color: white;

  font-size: clamp(24px, 4vw, 30px);

  font-weight: 950;

  letter-spacing: -0.055em;
}

/* FORM */

.form-collapse {

  border-radius: var(--radius-lg);

  background: var(--surface-2);

  overflow: hidden;
}

.form-toggle {

  width: 100%;

  border: none;

  background: transparent;

  color: white;

  min-height: 66px;

  padding: 14px 16px;

  display: flex;

  align-items: center;
  justify-content: space-between;

  cursor: pointer;
}

.form-toggle-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.form-icon {

  width: 34px;
  height: 34px;

  border-radius: 10px;

  background: var(--surface-3);

  display: flex;

  align-items: center;
  justify-content: center;
}

.form-title {

  font-size: 15px;

  font-weight: 900;
}

.form-subtitle {

  margin-top: 3px;

  color: var(--muted);

  font-size: 12px;
}

.form-arrow {

  font-size: 22px;

  color: var(--muted);

  transition: transform 160ms ease;
}

.form-collapse.open .form-arrow {
  transform: rotate(180deg);
}

.form-content {

  display: none;

  padding:
    0 16px 16px;
}

.form-collapse.open .form-content {
  display: block;
}

.form-grid {

  display: grid;

  grid-template-columns:
    1fr 1fr;

  gap: 12px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field.full {
  grid-column: 1 / -1;
}

.label {

  color: var(--muted);

  font-size: 12px;

  font-weight: 750;
}

input,
textarea {

  width: 100%;

  border: none;
  outline: none;

  background: var(--surface-3);

  color: white;

  border-radius: 14px;

  padding: 12px;

  font-size: 14px;
}

input::placeholder,
textarea::placeholder {
  color: #666;
}

textarea {
  min-height: 86px;
  resize: vertical;
}

/* BUTTON */

.submit-wrap {
  display: grid;
  gap: 8px;
}

.submit-btn {

  width: 100%;

  min-height: 56px;

  border: none;

  border-radius: var(--radius-lg);

  background: white;

  color: black;

  font-size: 15px;

  font-weight: 950;

  cursor: pointer;

  transition:
    opacity 140ms ease,
    transform 140ms ease;
}

.submit-btn:hover {
  opacity: 0.92;
}

.submit-btn:active {
  transform: scale(0.99);
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* MESSAGE */

.message {

  display: none;

  padding: 14px;

  border-radius: 16px;

  font-size: 13px;

  line-height: 1.45;

  white-space: pre-wrap;
}

.message.success {
  display: block;
  background: var(--success-bg);
  color: var(--success-text);
}

.message.error {
  display: block;
  background: var(--error-bg);
  color: var(--error-text);
}

.expires {

  margin-top: 10px;

  text-align: center;

  color: var(--muted-2);

  font-size: 10px;
}

/* MOBILE */

@media (max-width: 640px) {

  .page {
    padding: 10px 8px 16px;
  }

  .products-list {
    max-height: 54vh;
  }

  .product-card {
    min-height: 72px;
    padding: 12px;
  }

  .product-name {
    font-size: 14px;
  }

  .product-description {
    font-size: 11px;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .submit-btn {
    min-height: 52px;
  }
}

</style>
</head>

<body>

<main class="page">

<div class="shell">

<section class="hero">

<h1>${safeTitle}</h1>

<p class="subtitle">
${safeSubtitle}
</p>

</section>

<section class="panel">

<div
  id="content"
  class="content-flow"
></div>

<div
  id="message"
  class="message"
></div>

<div class="expires">
Este enlace expira el
<span id="expiresAt"></span>
</div>

</section>

</div>

</main>

<script>

const token = ${JSON.stringify(record.token)};

const config = ${configJson};

const successMessage = ${JSON.stringify(
  safeSuccessMessage
)};

const expiresAt = ${JSON.stringify(
  new Date(record.expiresAt)
    .toLocaleString("es-CL")
)};

const contentEl =
  document.getElementById("content");

const messageEl =
  document.getElementById("message");

document.getElementById(
  "expiresAt"
).textContent = expiresAt;

/* FORMAT */

function formatCurrency(value) {

  return new Intl.NumberFormat(
    "es-CL",
    {
      style: "currency",
      currency: "CLP",
      maximumFractionDigits: 0
    }
  ).format(Number(value || 0));
}

/* MESSAGE */

function showMessage(type, text) {

  messageEl.className =
    "message " + type;

  messageEl.textContent = text;

  messageEl.style.display =
    "block";
}

/* TOTAL */

function updateSelectedCount() {

  const inputs =
    document.querySelectorAll(
      '[data-kind="product-quantity"]'
    );

  let selected = 0;

  inputs.forEach((input) => {
    if (
      Number(input.value || 0) > 0
    ) {
      selected++;
    }
  });

  const badge =
    document.getElementById(
      "productsSelected"
    );

  if (badge) {

    badge.textContent =
      selected === 1
        ? "1 seleccionado"
        : selected +
          " seleccionados";
  }
}

function updateTotal() {

  const inputs =
    document.querySelectorAll(
      '[data-kind="product-quantity"]'
    );

  let total = 0;

  inputs.forEach((input) => {

    total +=
      Number(input.value || 0) *
      Number(
        input.dataset.productPrice || 0
      );
  });

  const totalValue =
    document.getElementById(
      "totalValue"
    );

  if (totalValue) {
    totalValue.textContent =
      formatCurrency(total);
  }

  updateSelectedCount();
}

/* PRODUCTS */

function renderProducts(component) {

  const section =
    document.createElement("section");

  section.className =
    "products-section";

  section.innerHTML = \`
    <div class="products-top">

      <div class="products-title-wrap">

        <div class="products-title">
          Productos
        </div>

        <div class="products-subtitle">
          Busca y selecciona productos
        </div>

      </div>

      <div
        class="products-selected"
        id="productsSelected"
      >
        0 seleccionados
      </div>

    </div>

    <div class="search-wrap">

      <input
        class="search-input"
        id="productsSearch"
        type="text"
        placeholder="Buscar productos..."
      />

    </div>

    <div
      class="products-list"
      id="productsList"
    ></div>

    <div class="total-card">

      <div class="total-title">
        Total estimado
      </div>

      <div
        class="total-value"
        id="totalValue"
      >
        \${formatCurrency(0)}
      </div>

    </div>
  \`;

  const list =
    section.querySelector(
      "#productsList"
    );

  component.items.forEach((item) => {

    const card =
      document.createElement("div");

    card.className =
      "product-card";

    card.dataset.search =
      (
        item.name +
        " " +
        (
          item.description || ""
        )
      ).toLowerCase();

    const main =
      document.createElement("div");

    main.className =
      "product-main";

    const top =
      document.createElement("div");

    top.className =
      "product-top";

    const name =
      document.createElement("h3");

    name.className =
      "product-name";

    name.textContent =
      item.name || "Producto";

    const price =
      document.createElement("div");

    price.className =
      "product-price";

    price.textContent =
      formatCurrency(
        item.price || 0
      );

    top.appendChild(name);
    top.appendChild(price);

    const description =
      document.createElement("p");

    description.className =
      "product-description";

    description.textContent =
      item.description ||
      "Selecciona cantidad.";

    main.appendChild(top);
    main.appendChild(description);

    /* QTY */

    const qtyBox =
      document.createElement("div");

    qtyBox.className =
      "qty-box";

    const minusBtn =
      document.createElement("button");

    minusBtn.className =
      "qty-btn";

    minusBtn.type = "button";

    minusBtn.textContent =
      "−";

    const valueEl =
      document.createElement("div");

    valueEl.className =
      "qty-value";

    valueEl.textContent =
      "0";

    const plusBtn =
      document.createElement("button");

    plusBtn.className =
      "qty-btn";

    plusBtn.type = "button";

    plusBtn.textContent =
      "+";

    const hiddenInput =
      document.createElement("input");

    hiddenInput.type =
      "number";

    hiddenInput.min =
      "0";

    hiddenInput.value =
      "0";

    hiddenInput.className =
      "qty-hidden";

    hiddenInput.dataset.productId =
      item.id;

    hiddenInput.dataset.productPrice =
      String(item.price || 0);

    hiddenInput.dataset.kind =
      "product-quantity";

    function syncQty(value) {

      const safe =
        Math.max(
          0,
          Number(value) || 0
        );

      hiddenInput.value =
        String(safe);

      valueEl.textContent =
        String(safe);

      updateTotal();
    }

    minusBtn.addEventListener(
      "click",
      () => {
        syncQty(
          Number(
            hiddenInput.value
          ) - 1
        );
      }
    );

    plusBtn.addEventListener(
      "click",
      () => {
        syncQty(
          Number(
            hiddenInput.value
          ) + 1
        );
      }
    );

    qtyBox.appendChild(minusBtn);
    qtyBox.appendChild(valueEl);
    qtyBox.appendChild(plusBtn);
    qtyBox.appendChild(hiddenInput);

    card.appendChild(main);
    card.appendChild(qtyBox);

    list.appendChild(card);
  });

  /* SEARCH */

  const searchInput =
    section.querySelector(
      "#productsSearch"
    );

  searchInput.addEventListener(
    "input",
    (e) => {

      const value =
        e.target.value
          .toLowerCase()
          .trim();

      list
        .querySelectorAll(
          ".product-card"
        )
        .forEach((card) => {

          const match =
            card.dataset.search.includes(
              value
            );

          card.style.display =
            match
              ? "grid"
              : "none";
        });
    }
  );

  return section;
}

/* FORM */

function renderForm(component) {

  const wrap =
    document.createElement("div");

  wrap.className =
    "form-collapse";

  wrap.innerHTML = \`
    <button
      class="form-toggle"
      type="button"
    >

      <div class="form-toggle-left">

        <div class="form-icon">
          👤
        </div>

        <div>

          <div class="form-title">
            Mis datos
          </div>

          <div class="form-subtitle">
            Completa tu información
          </div>

        </div>

      </div>

      <div class="form-arrow">
        ⌄
      </div>

    </button>

    <div class="form-content">

      <div class="form-grid"></div>

    </div>
  \`;

  const toggle =
    wrap.querySelector(
      ".form-toggle"
    );

  toggle.addEventListener(
    "click",
    () => {
      wrap.classList.toggle(
        "open"
      );
    }
  );

  const grid =
    wrap.querySelector(
      ".form-grid"
    );

  component.fields.forEach((field) => {

    const fieldWrap =
      document.createElement("div");

    fieldWrap.className =
      "field";

    if (
      field.inputType ===
      "textarea"
    ) {
      fieldWrap.classList.add(
        "full"
      );
    }

    const label =
      document.createElement("label");

    label.className =
      "label";

    label.textContent =
      field.label +
      (
        field.required
          ? " *"
          : ""
      );

    const input =
      field.inputType ===
      "textarea"
        ? document.createElement(
            "textarea"
          )
        : document.createElement(
            "input"
          );

    if (
      field.inputType !==
      "textarea"
    ) {
      input.type =
        field.inputType ||
        "text";
    }

    input.name =
      field.name;

    input.dataset.kind =
      "form-field";

    input.placeholder =
      field.placeholder || "";

    if (field.required) {
      input.required = true;
    }

    fieldWrap.appendChild(label);
    fieldWrap.appendChild(input);

    grid.appendChild(fieldWrap);
  });

  return wrap;
}

/* BUTTON */

function renderButton(component) {

  const wrap =
    document.createElement("div");

  wrap.className =
    "submit-wrap";

  const btn =
    document.createElement("button");

  btn.type =
    "button";

  btn.className =
    "submit-btn";

  btn.textContent =
    component.label ||
    "Enviar solicitud";

  btn.addEventListener(
    "click",
    () => {
      onSubmit(btn);
    }
  );

  wrap.appendChild(btn);

  return wrap;
}

/* RENDER */

function renderComponent(component) {

  switch (component.type) {

    case "products":
      return renderProducts(
        component
      );

    case "form":
      return renderForm(
        component
      );

    case "button":
      return renderButton(
        component
      );

    default:
      return document.createElement(
        "div"
      );
  }
}

/* SUBMIT */

async function onSubmit(btn) {

  const selectedItems = [];

  document
    .querySelectorAll(
      '[data-kind="product-quantity"]'
    )
    .forEach((input) => {

      const quantity =
        Number(
          input.value || 0
        );

      const productId =
        input.dataset.productId;

      if (
        quantity > 0 &&
        productId
      ) {

        selectedItems.push({
          productId,
          quantity
        });
      }
    });

  if (
    selectedItems.length === 0
  ) {

    showMessage(
      "error",
      "Selecciona al menos un producto."
    );

    return;
  }

  const customer = {};

  const formFields =
    document.querySelectorAll(
      '[data-kind="form-field"]'
    );

  for (const field of formFields) {

    const value =
      String(
        field.value || ""
      ).trim();

    if (
      field.required &&
      !value
    ) {

      document
        .querySelector(
          ".form-collapse"
        )
        ?.classList.add(
          "open"
        );

      showMessage(
        "error",
        "Completa los campos obligatorios."
      );

      return;
    }

    customer[field.name] =
      value;
  }

  try {

    btn.disabled = true;

    btn.textContent =
      "Enviando...";

    const response =
      await fetch(
        "/api/runtime-links/" +
          token +
          "/submit",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({
            customer,
            items:
              selectedItems,
            raw: {
              submittedAtClient:
                new Date()
                  .toISOString()
            }
          })
        }
      );

    const data =
      await response.json();

    if (!response.ok) {

      showMessage(
        "error",
        data.message ||
          "No se pudo enviar la solicitud."
      );

      btn.disabled = false;

      btn.textContent =
        "Enviar solicitud";

      return;
    }

    showMessage(
      "success",
      data.message ||
        successMessage
    );

  } catch (_) {

    showMessage(
      "error",
      "Ocurrió un error al enviar la solicitud."
    );

    btn.disabled = false;

    btn.textContent =
      "Enviar solicitud";
  }
}

/* INIT */

config.components.forEach(
  (component) => {

    const el =
      renderComponent(
        component
      );

    contentEl.appendChild(el);
  }
);

updateTotal();

</script>

</body>
</html>`;
}