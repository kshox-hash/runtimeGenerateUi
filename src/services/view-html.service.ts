import { RuntimeLinkRecord } from "../types/runtime";
import { escapeHtml } from "../utils/html";

export function renderViewHtml(record: RuntimeLinkRecord): string {
  const safeTitle = escapeHtml(record.config.title || "Cotización Inteligente");
  const safeBrand = escapeHtml(record.config.brand ?? "Automatiza Fácil");
  const safeSubtitle = escapeHtml(
    record.config.subtitle ?? "Selecciona productos y envía tu solicitud."
  );
  const safeSuccessMessage = escapeHtml(
    record.config.successMessage ?? "Solicitud enviada correctamente."
  );

  const configJson = JSON.stringify(record.config);

  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${safeTitle}</title>

  <style>
    :root {
      --bg: #eef2f7;
      --panel: rgba(255, 255, 255, 0.84);
      --text: #0f172a;
      --muted: #64748b;
      --muted-soft: #94a3b8;
      --border: rgba(148, 163, 184, 0.30);
      --accent: #2563eb;
      --accent-dark: #1e40af;
      --accent-soft: #dbeafe;
      --shadow: 0 24px 70px rgba(15, 23, 42, 0.14);
      --shadow-card: 0 16px 34px rgba(15, 23, 42, 0.08);
      --radius-xl: 28px;
      --radius-lg: 22px;
    }

    * {
      box-sizing: border-box;
      -webkit-tap-highlight-color: transparent;
    }

    html, body {
      margin: 0;
      padding: 0;
    }

    body {
      min-height: 100vh;
      font-family: Inter, Arial, Helvetica, sans-serif;
      background:
        radial-gradient(circle at top left, rgba(37, 99, 235, 0.20), transparent 34%),
        radial-gradient(circle at top right, rgba(14, 165, 233, 0.16), transparent 32%),
        linear-gradient(180deg, #f8fafc 0%, var(--bg) 100%);
      color: var(--text);
      -webkit-font-smoothing: antialiased;
      overflow-x: hidden;
    }

    body::before {
      content: "";
      position: fixed;
      inset: 0;
      pointer-events: none;
      background-image:
        linear-gradient(rgba(15, 23, 42, 0.035) 1px, transparent 1px),
        linear-gradient(90deg, rgba(15, 23, 42, 0.035) 1px, transparent 1px);
      background-size: 34px 34px;
      mask-image: linear-gradient(to bottom, black, transparent 78%);
    }

    .page-loader {
      position: fixed;
      inset: 0;
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      background:
        radial-gradient(circle at top left, rgba(37, 99, 235, 0.18), transparent 34%),
        linear-gradient(180deg, #f8fafc 0%, #eef2f7 100%);
      transition: opacity 220ms ease, visibility 220ms ease;
    }

    .page-loader.hidden {
      opacity: 0;
      visibility: hidden;
      pointer-events: none;
    }

    .loader-card {
      width: min(280px, calc(100vw - 48px));
      padding: 22px 20px;
      border-radius: 24px;
      background: rgba(255, 255, 255, 0.78);
      border: 1px solid rgba(148, 163, 184, 0.28);
      box-shadow: var(--shadow);
      backdrop-filter: blur(18px);
      text-align: center;
      animation: loaderIn 360ms ease both;
    }

    .spinner {
      width: 34px;
      height: 34px;
      margin: 0 auto 14px;
      border-radius: 50%;
      border: 3px solid rgba(37, 99, 235, 0.14);
      border-top-color: #2563eb;
      animation: spin 800ms linear infinite;
    }

    .loader-title {
      font-size: 15px;
      font-weight: 900;
      color: var(--text);
      margin-bottom: 4px;
    }

    .loader-text {
      font-size: 12px;
      color: var(--muted);
      line-height: 1.4;
    }

    .page {
      position: relative;
      min-height: 100vh;
      padding: 30px 14px 42px;
    }

    .shell {
      max-width: 720px;
      margin: 0 auto;
      animation: pageIn 520ms ease both;
    }

    .hero {
      text-align: center;
      margin-bottom: 20px;
      padding-top: 6px;
    }

    .brand-pill {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 13px;
      border: 1px solid rgba(148, 163, 184, 0.28);
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.66);
      backdrop-filter: blur(14px);
      color: #475569;
      font-size: 13px;
      font-weight: 800;
      box-shadow: 0 10px 24px rgba(15, 23, 42, 0.06);
      animation: fadeUp 520ms ease both;
    }

    .brand-dot {
      width: 8px;
      height: 8px;
      border-radius: 99px;
      background: var(--accent);
      box-shadow: 0 0 0 5px rgba(37, 99, 235, 0.12);
    }

    h1 {
      margin: 16px 0 0;
      font-size: 42px;
      line-height: 1;
      letter-spacing: -0.055em;
      color: var(--text);
      animation: fadeUp 580ms ease both;
      animation-delay: 60ms;
    }

    .subtitle {
      margin: 12px auto 0;
      max-width: 520px;
      color: var(--muted);
      font-size: 15px;
      line-height: 1.52;
      animation: fadeUp 620ms ease both;
      animation-delay: 120ms;
    }

    .panel {
      position: relative;
      margin-top: 20px;
      padding: 14px;
      border: 1px solid rgba(255, 255, 255, 0.72);
      border-radius: var(--radius-xl);
      background: var(--panel);
      backdrop-filter: blur(18px);
      box-shadow: var(--shadow);
      overflow: hidden;
      animation: fadeUp 660ms ease both;
      animation-delay: 170ms;
    }

    .panel::before {
      content: "";
      position: absolute;
      inset: 0;
      pointer-events: none;
      border-radius: inherit;
      background:
        linear-gradient(135deg, rgba(255,255,255,0.72), transparent 42%),
        radial-gradient(circle at top left, rgba(37,99,235,0.10), transparent 38%);
    }

    .content-flow {
      position: relative;
      z-index: 1;
      display: grid;
      gap: 13px;
    }

    .section {
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      background:
        linear-gradient(180deg, rgba(255,255,255,0.96), rgba(248,250,252,0.90));
      box-shadow: var(--shadow-card);
      overflow: hidden;
      animation: cardIn 520ms cubic-bezier(.2,.8,.2,1) both;
    }

    .section-inner {
      padding: 16px;
    }

    .section-head {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      margin-bottom: 14px;
    }

    .section-icon {
      width: 42px;
      height: 42px;
      border-radius: 14px;
      background: linear-gradient(145deg, #eaf1ff, #ffffff);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 21px;
      flex-shrink: 0;
      box-shadow:
        inset 0 1px 0 rgba(255,255,255,0.9),
        0 10px 22px rgba(37, 99, 235, 0.13);
    }

    .section-title {
      font-size: 18px;
      font-weight: 900;
      letter-spacing: -0.03em;
      color: var(--text);
      margin-bottom: 4px;
    }

    .section-subtitle {
      font-size: 13px;
      line-height: 1.42;
      color: var(--muted);
    }

    .products-list {
      display: grid;
      gap: 10px;
    }

    .product-card {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 12px;
      align-items: center;
      padding: 14px;
      border: 1px solid rgba(148, 163, 184, 0.28);
      border-radius: 18px;
      background: rgba(255,255,255,0.86);
      transition: transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease;
    }

    .product-card:hover {
      transform: translateY(-2px);
      border-color: rgba(37, 99, 235, 0.34);
      box-shadow: 0 16px 30px rgba(15, 23, 42, 0.10);
      background: #ffffff;
    }

    .product-main {
      min-width: 0;
    }

    .product-top {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 10px;
      margin-bottom: 5px;
    }

    .product-name {
      margin: 0;
      font-size: 15px;
      font-weight: 900;
      letter-spacing: -0.02em;
      color: var(--text);
      line-height: 1.2;
    }

    .product-price {
      font-size: 14px;
      font-weight: 900;
      color: var(--accent-dark);
      white-space: nowrap;
    }

    .product-description {
      margin: 0;
      font-size: 12.5px;
      line-height: 1.38;
      color: var(--muted);
    }

    .qty-box {
      display: grid;
      grid-template-columns: 34px 42px 34px;
      border: 1px solid rgba(148, 163, 184, 0.42);
      border-radius: 12px;
      overflow: hidden;
      background: #fff;
      box-shadow: 0 8px 18px rgba(15, 23, 42, 0.05);
    }

    .qty-btn {
      appearance: none;
      border: none;
      background: #fff;
      color: var(--text);
      font-size: 19px;
      height: 36px;
      cursor: pointer;
    }

    .qty-btn:hover {
      background: var(--accent-soft);
      color: var(--accent-dark);
    }

    .qty-value {
      border-left: 1px solid rgba(148, 163, 184, 0.36);
      border-right: 1px solid rgba(148, 163, 184, 0.36);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      font-weight: 900;
      color: var(--text);
      background: #fff;
    }

    .qty-hidden {
      display: none;
    }

    .total-card {
      margin-top: 12px;
      padding: 14px;
      border: 1px solid rgba(37, 99, 235, 0.18);
      border-radius: 18px;
      background:
        radial-gradient(circle at top right, rgba(37, 99, 235, 0.12), transparent 46%),
        linear-gradient(180deg, #ffffff, #f8fafc);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 14px;
    }

    .total-left {
      display: flex;
      align-items: center;
      gap: 12px;
      min-width: 0;
    }

    .total-icon {
      width: 42px;
      height: 42px;
      border-radius: 14px;
      background: var(--accent-soft);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      flex-shrink: 0;
    }

    .total-title {
      font-size: 14px;
      font-weight: 900;
      color: var(--text);
      margin-bottom: 2px;
    }

    .total-subtitle {
      font-size: 12px;
      color: var(--muted);
      line-height: 1.35;
    }

    .total-value {
      font-size: 24px;
      font-weight: 950;
      letter-spacing: -0.04em;
      color: var(--text);
      white-space: nowrap;
    }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    .field {
      display: flex;
      flex-direction: column;
      gap: 7px;
      min-width: 0;
    }

    .field.full {
      grid-column: 1 / -1;
    }

    .label {
      font-size: 13px;
      font-weight: 850;
      color: var(--text);
    }

    input,
    textarea {
      width: 100%;
      border: 1px solid rgba(148, 163, 184, 0.38);
      border-radius: 14px;
      padding: 12px 13px;
      font-size: 14px;
      color: var(--text);
      background: rgba(255,255,255,0.92);
      outline: none;
      font-family: inherit;
    }

    input:focus,
    textarea:focus {
      border-color: rgba(37, 99, 235, 0.62);
      box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.12);
      background: #fff;
    }

    textarea {
      min-height: 96px;
      resize: vertical;
    }

    .submit-wrap {
      display: grid;
      gap: 8px;
    }

    .submit-btn {
      width: 100%;
      border: none;
      border-radius: 18px;
      background:
        radial-gradient(circle at top left, rgba(255,255,255,0.26), transparent 30%),
        linear-gradient(180deg, #2563eb 0%, #1d4ed8 100%);
      color: #fff;
      padding: 15px 18px;
      font-size: 15px;
      font-weight: 900;
      cursor: pointer;
      box-shadow: 0 16px 32px rgba(37, 99, 235, 0.28);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 9px;
    }

    .submit-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 22px 42px rgba(37, 99, 235, 0.34);
    }

    .submit-btn:disabled {
      opacity: 0.7;
      cursor: not-allowed;
      transform: none;
    }

    .submit-hint {
      text-align: center;
      color: var(--muted);
      font-size: 12px;
      line-height: 1.4;
    }

    .message {
      display: none;
      padding: 13px 14px;
      border-radius: 16px;
      font-size: 14px;
      line-height: 1.42;
      white-space: pre-wrap;
      word-break: break-word;
      animation: fadeUp 260ms ease both;
    }

    .message.success {
      display: block;
      background: #ecfdf3;
      color: #166534;
      border: 1px solid #bbf7d0;
    }

    .message.error {
      display: block;
      background: #fef2f2;
      color: #991b1b;
      border: 1px solid #fecaca;
    }

    .footer {
      margin-top: 15px;
      text-align: center;
      font-size: 12px;
      line-height: 1.45;
      color: var(--muted);
    }

    .secure-row {
      margin-top: 14px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 7px;
      padding: 7px 10px;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.62);
      border: 1px solid rgba(148, 163, 184, 0.24);
      backdrop-filter: blur(12px);
    }

    .expires {
      margin-top: 10px;
      text-align: center;
      color: var(--muted-soft);
      font-size: 11px;
    }

    .empty {
      padding: 28px 18px;
      text-align: center;
      color: var(--muted);
      font-size: 14px;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    @keyframes loaderIn {
      from {
        opacity: 0;
        transform: translateY(10px) scale(0.98);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    @keyframes pageIn {
      from { opacity: 0; }
      to { opacity: 1; }
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

    @keyframes cardIn {
      from {
        opacity: 0;
        transform: translateY(16px) scale(0.985);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    @media (max-width: 640px) {
      .page {
        padding: 22px 8px 30px;
      }

      h1 {
        font-size: 32px;
      }

      .panel {
        padding: 11px;
        border-radius: 22px;
      }

      .section-inner {
        padding: 14px;
      }

      .product-card {
        grid-template-columns: 1fr;
      }

      .product-top {
        flex-direction: column;
        gap: 4px;
      }

      .qty-box {
        width: 100%;
        grid-template-columns: 1fr 48px 1fr;
      }

      .form-grid {
        grid-template-columns: 1fr;
      }

      .total-card {
        flex-direction: column;
        align-items: flex-start;
      }
    }
  </style>
</head>

<body>
  <div id="pageLoader" class="page-loader">
    <div class="loader-card">
      <div class="spinner"></div>
      <div class="loader-title">Preparando tu experiencia</div>
      <div class="loader-text">Estamos cargando la información...</div>
    </div>
  </div>

  <main class="page">
    <div class="shell">
      <section class="hero">
        <div class="brand-pill">
          <span class="brand-dot"></span>
          <span>${safeBrand}</span>
        </div>

        <h1>${safeTitle}</h1>
        <p class="subtitle">${safeSubtitle}</p>
      </section>

      <section class="panel">
        <div id="content" class="content-flow"></div>
        <div id="message" class="message"></div>
        <div class="expires">
          Este enlace temporal expira el <span id="expiresAt"></span>
        </div>
      </section>

      <div class="footer">
        <div class="secure-row">
          <span>🔒</span>
          <span>Solicitud protegida y enviada de forma segura</span>
        </div>
      </div>
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
    const expiresAtEl = document.getElementById("expiresAt");

    expiresAtEl.textContent = expiresAt;

    function hideLoader() {
      const loader = document.getElementById("pageLoader");
      window.setTimeout(() => {
        if (loader) loader.classList.add("hidden");
      }, 350);
    }

    window.addEventListener("load", hideLoader);
    window.setTimeout(hideLoader, 1200);

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

    function createSection(icon, title, subtitle) {
      const section = document.createElement("section");
      section.className = "section";

      const inner = document.createElement("div");
      inner.className = "section-inner";

      const head = document.createElement("div");
      head.className = "section-head";

      const iconEl = document.createElement("div");
      iconEl.className = "section-icon";
      iconEl.textContent = icon;

      const textWrap = document.createElement("div");

      const titleEl = document.createElement("div");
      titleEl.className = "section-title";
      titleEl.textContent = title;

      const subtitleEl = document.createElement("div");
      subtitleEl.className = "section-subtitle";
      subtitleEl.textContent = subtitle;

      textWrap.appendChild(titleEl);
      textWrap.appendChild(subtitleEl);

      head.appendChild(iconEl);
      head.appendChild(textWrap);

      inner.appendChild(head);
      section.appendChild(inner);

      return { section, inner };
    }

    function updateTotal() {
      const inputs = document.querySelectorAll('[data-kind="product-quantity"]');
      let total = 0;

      inputs.forEach((input) => {
        const quantity = Number(input.value || 0);
        const price = Number(input.dataset.productPrice || 0);
        total += quantity * price;
      });

      const totalValue = document.getElementById("totalValue");
      if (totalValue) totalValue.textContent = formatCurrency(total);
    }

    function renderText(component) {
      const box = document.createElement("section");
      box.className = "section";
      const inner = document.createElement("div");
      inner.className = "section-inner";
      inner.textContent = component.value || "";
      box.appendChild(inner);
      return box;
    }

    function renderProducts(component) {
      const { section, inner } = createSection(
        "🧾",
        "Selecciona productos",
        "Agrega cantidades y revisa el total estimado antes de enviar."
      );

      const list = document.createElement("div");
      list.className = "products-list";

      if (!Array.isArray(component.items) || component.items.length === 0) {
        const empty = document.createElement("div");
        empty.className = "empty";
        empty.textContent = "No hay productos disponibles por el momento.";
        inner.appendChild(empty);
        return section;
      }

      component.items.forEach((item) => {
        const card = document.createElement("div");
        card.className = "product-card";

        const main = document.createElement("div");
        main.className = "product-main";

        const top = document.createElement("div");
        top.className = "product-top";

        const name = document.createElement("h3");
        name.className = "product-name";
        name.textContent = item.name || "Producto";

        const price = document.createElement("div");
        price.className = "product-price";
        price.textContent = formatCurrency(Number(item.price || 0));

        top.appendChild(name);
        top.appendChild(price);

        const description = document.createElement("p");
        description.className = "product-description";
        description.textContent =
          item.description || "Selecciona la cantidad que deseas cotizar.";

        main.appendChild(top);
        main.appendChild(description);

        const qtyBox = document.createElement("div");
        qtyBox.className = "qty-box";

        const minusBtn = document.createElement("button");
        minusBtn.type = "button";
        minusBtn.className = "qty-btn";
        minusBtn.textContent = "−";

        const valueEl = document.createElement("div");
        valueEl.className = "qty-value";
        valueEl.textContent = "0";

        const plusBtn = document.createElement("button");
        plusBtn.type = "button";
        plusBtn.className = "qty-btn";
        plusBtn.textContent = "+";

        const hiddenInput = document.createElement("input");
        hiddenInput.type = "number";
        hiddenInput.min = "0";
        hiddenInput.value = "0";
        hiddenInput.dataset.productId = item.id;
        hiddenInput.dataset.productPrice = String(item.price || 0);
        hiddenInput.dataset.kind = "product-quantity";
        hiddenInput.className = "qty-hidden";

        function syncQty(nextValue) {
          const safeValue = Math.max(0, Number(nextValue) || 0);
          hiddenInput.value = String(safeValue);
          valueEl.textContent = String(safeValue);
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

      inner.appendChild(list);

      const totalCard = document.createElement("div");
      totalCard.className = "total-card";

      const totalLeft = document.createElement("div");
      totalLeft.className = "total-left";

      const totalIcon = document.createElement("div");
      totalIcon.className = "total-icon";
      totalIcon.textContent = "💰";

      const totalText = document.createElement("div");

      const totalTitle = document.createElement("div");
      totalTitle.className = "total-title";
      totalTitle.textContent = "Total estimado";

      const totalSubtitle = document.createElement("div");
      totalSubtitle.className = "total-subtitle";
      totalSubtitle.textContent = "Puedes ajustar cantidades antes de enviar.";

      totalText.appendChild(totalTitle);
      totalText.appendChild(totalSubtitle);

      totalLeft.appendChild(totalIcon);
      totalLeft.appendChild(totalText);

      const totalValue = document.createElement("div");
      totalValue.className = "total-value";
      totalValue.id = "totalValue";
      totalValue.textContent = formatCurrency(0);

      totalCard.appendChild(totalLeft);
      totalCard.appendChild(totalValue);
      inner.appendChild(totalCard);

      return section;
    }

    function renderForm(component) {
      const { section, inner } = createSection(
        "👤",
        "Tus datos",
        "Completa esta información para que podamos contactarte."
      );

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

      inner.appendChild(grid);
      return section;
    }

    function renderButton(component) {
      const wrap = document.createElement("div");
      wrap.className = "submit-wrap";

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "submit-btn";
      btn.innerHTML = "<span>" + (component.label || "Enviar solicitud") + "</span><span>→</span>";
      btn.addEventListener("click", () => onSubmit(btn));

      const hint = document.createElement("div");
      hint.className = "submit-hint";
      hint.textContent = "Revisaremos tu solicitud y te contactaremos por WhatsApp.";

      wrap.appendChild(btn);
      wrap.appendChild(hint);

      return wrap;
    }

    function renderComponent(component) {
      switch (component.type) {
        case "text": return renderText(component);
        case "products": return renderProducts(component);
        case "form": return renderForm(component);
        case "button": return renderButton(component);
        default: return document.createElement("div");
      }
    }

    async function onSubmit(btn) {
      const selectedItems = [];
      const quantityInputs = document.querySelectorAll('[data-kind="product-quantity"]');

      quantityInputs.forEach((input) => {
        const quantity = Number(input.value || 0);
        const productId = input.dataset.productId;

        if (quantity > 0 && productId) {
          selectedItems.push({ productId, quantity });
        }
      });

      if (selectedItems.length === 0) {
        showMessage("error", "Selecciona al menos un producto o servicio.");
        return;
      }

      const customer = {};
      const formFields = document.querySelectorAll('[data-kind="form-field"]');

      for (const field of formFields) {
        const value = String(field.value || "").trim();

        if (field.required && !value) {
          showMessage("error", "Completa los campos obligatorios.");
          return;
        }

        customer[field.name] = value;
      }

      try {
        btn.disabled = true;
        btn.innerHTML = "<span>Enviando solicitud...</span>";

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
          btn.disabled = false;
          btn.innerHTML = "<span>Enviar solicitud</span><span>→</span>";
          return;
        }

        if (data.pdfUrl) {
          showMessage(
            "success",
            "Solicitud enviada correctamente. Tu cotización fue generada y enviada al chat.\\n" + data.pdfUrl
          );
          return;
        }

        showMessage("success", data.message || successMessage);
      } catch (_) {
        showMessage("error", "Ocurrió un error al enviar la solicitud.");
        btn.disabled = false;
        btn.innerHTML = "<span>Enviar solicitud</span><span>→</span>";
      }
    }

    config.components.forEach((component, index) => {
      const el = renderComponent(component);
      el.style.animationDelay = String(index * 90) + "ms";
      contentEl.appendChild(el);
    });

    updateTotal();
  </script>
</body>
</html>`;
}