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
      --bg: #08090b;
      --panel: #111317;
      --panel-2: #151820;
      --surface: #181b22;
      --surface-soft: #1f232c;
      --surface-hover: #252a34;
      --text: #f3f4f6;
      --muted: #a1a1aa;
      --muted-soft: #71717a;
      --border: rgba(255, 255, 255, 0.09);
      --border-strong: rgba(255, 255, 255, 0.15);
      --accent: #e5e7eb;
      --accent-dark: #ffffff;
      --accent-soft: rgba(255, 255, 255, 0.08);
      --success: #d4d4d8;
      --shadow: 0 18px 42px rgba(0, 0, 0, 0.34);
      --shadow-card: none;
      --radius-xl: 20px;
      --radius-lg: 14px;
    }

    * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
    html, body { margin: 0; padding: 0; }

    body {
      min-height: 100vh;
      font-family: Inter, Arial, Helvetica, sans-serif;
      background: var(--bg);
      color: var(--text);
      -webkit-font-smoothing: antialiased;
      overflow-x: hidden;
    }

    body::before {
      content: "";
      position: fixed;
      inset: 0;
      pointer-events: none;
      background:
        linear-gradient(180deg, rgba(255,255,255,0.035), transparent 220px),
        radial-gradient(circle at top, rgba(255,255,255,0.035), transparent 360px);
    }

    /* ── Loader ── */
    .page-loader {
      position: fixed;
      inset: 0;
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--bg);
      transition: opacity 180ms ease, visibility 180ms ease;
    }

    .page-loader.hidden { opacity: 0; visibility: hidden; pointer-events: none; }

    .loader-card {
      width: min(240px, calc(100vw - 44px));
      padding: 18px 16px;
      border-radius: 18px;
      background: var(--panel);
      border: 1px solid var(--border);
      box-shadow: var(--shadow);
      text-align: center;
      animation: loaderIn 260ms ease both;
    }

    .spinner {
      width: 28px;
      height: 28px;
      margin: 0 auto 10px;
      border-radius: 50%;
      border: 2px solid rgba(255,255,255,0.12);
      border-top-color: #f4f4f5;
      animation: spin 760ms linear infinite;
    }

    .loader-title { font-size: 13px; font-weight: 850; color: var(--text); margin-bottom: 3px; }
    .loader-text { font-size: 11px; color: var(--muted); line-height: 1.35; }

    /* ── Layout ── */
    .page { position: relative; min-height: 100vh; padding: 10px 10px 16px; }

    .shell {
      width: min(980px, 100%);
      min-height: calc(100vh - 26px);
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      animation: pageIn 360ms ease both;
    }

    /* ── Hero ── */
    .hero { text-align: center; margin-bottom: 7px; padding-top: 0; flex: 0 0 auto; }

    .brand-pill {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      padding: 5px 10px;
      border: 1px solid var(--border);
      border-radius: 999px;
      background: rgba(255,255,255,0.045);
      color: #d4d4d8;
      font-size: 11px;
      font-weight: 800;
      animation: fadeUp 360ms ease both;
    }

    .brand-dot {
      width: 7px;
      height: 7px;
      border-radius: 99px;
      background: #f4f4f5;
      box-shadow: 0 0 0 4px rgba(255,255,255,0.06);
    }

    h1 {
      margin: 7px 0 0;
      font-size: 24px;
      line-height: 1;
      letter-spacing: -0.055em;
      color: var(--text);
      animation: fadeUp 380ms ease both;
      animation-delay: 35ms;
    }

    .subtitle {
      margin: 5px auto 0;
      max-width: 640px;
      color: var(--muted);
      font-size: 11.5px;
      line-height: 1.25;
      animation: fadeUp 400ms ease both;
      animation-delay: 70ms;
    }

    /* ── Panel ── */
    .panel {
      position: relative;
      flex: 1 1 auto;
      min-height: 0;
      margin-top: 7px;
      padding: 8px;
      border: 1px solid var(--border);
      border-radius: var(--radius-xl);
      background: var(--panel);
      box-shadow: var(--shadow);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      animation: fadeUp 420ms ease both;
      animation-delay: 90ms;
    }

    .panel::before { display: none; }

    .content-flow {
      position: relative;
      z-index: 1;
      flex: 1 1 auto;
      min-height: 0;
      display: grid;
      grid-template-rows: minmax(0, 1fr) auto auto;
      gap: 8px;
    }

    /* ── Section container ── */
    .section {
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      background: var(--panel-2);
      box-shadow: var(--shadow-card);
      overflow: hidden;
      animation: cardIn 360ms cubic-bezier(.2,.8,.2,1) both;
    }

    .section-inner { padding: 8px; }

    .section-head {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
    }

    .section-icon {
      width: 28px;
      height: 28px;
      border-radius: 10px;
      background: var(--accent-soft);
      border: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      flex-shrink: 0;
      filter: grayscale(1);
    }

    .section-title {
      font-size: 13px;
      font-weight: 900;
      letter-spacing: -0.025em;
      color: var(--text);
      margin-bottom: 1px;
    }

    .section-subtitle { font-size: 10.5px; line-height: 1.3; color: var(--muted); }

    /* ── Products viewport ── */
    .products-section {
      display: flex;
      flex-direction: column;
      min-height: 0;
    }

    .products-section .section-inner {
      flex: 1 1 auto;
      min-height: 0;
      display: flex;
      flex-direction: column;
    }

    .products-scroll-wrap {
      position: relative;
      flex: 1 1 auto;
      min-height: 0;
    }

    .products-list {
      display: grid;
      gap: 6px;
      max-height: clamp(430px, 66vh, 820px);
      min-height: 370px;
      overflow-y: auto;
      overscroll-behavior: contain;
      padding-right: 3px;
      scrollbar-width: thin;
      scrollbar-color: rgba(255,255,255,0.24) transparent;
    }

    .products-list::-webkit-scrollbar { width: 4px; }
    .products-list::-webkit-scrollbar-track { background: transparent; }
    .products-list::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.22); border-radius: 4px; }

    .products-scroll-wrap::after {
      content: "";
      position: absolute;
      left: 0;
      right: 4px;
      bottom: 0;
      height: 28px;
      background: linear-gradient(to bottom, transparent, var(--panel-2));
      pointer-events: none;
      transition: opacity 160ms;
    }

    .products-scroll-wrap.at-bottom::after { opacity: 0; }

    /* ── Product card ── */
    .product-card {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 8px;
      align-items: center;
      min-height: 52px;
      padding: 7px 8px;
      border: 1px solid var(--border);
      border-radius: 12px;
      background: var(--surface);
      transition: background 130ms ease, border-color 130ms ease, transform 130ms ease;
    }

    .product-card:hover { background: var(--surface-hover); border-color: var(--border-strong); transform: translateY(-1px); }

    .product-main { min-width: 0; }

    .product-top {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      align-items: baseline;
      gap: 8px;
      margin-bottom: 2px;
    }

    .product-name {
      margin: 0;
      font-size: 12.5px;
      font-weight: 850;
      letter-spacing: -0.02em;
      color: var(--text);
      line-height: 1.15;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .product-price { font-size: 12px; font-weight: 900; color: #fafafa; white-space: nowrap; flex-shrink: 0; }

    .product-description {
      margin: 0;
      font-size: 10.5px;
      line-height: 1.25;
      color: var(--muted);
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    /* ── Qty ── */
    .qty-box {
      display: grid;
      grid-template-columns: 26px 32px 26px;
      border: 1px solid var(--border-strong);
      border-radius: 10px;
      overflow: hidden;
      background: #0c0d10;
      flex-shrink: 0;
    }

    .qty-btn {
      appearance: none;
      border: none;
      background: transparent;
      color: var(--text);
      font-size: 15px;
      height: 28px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 120ms;
    }

    .qty-btn:hover { background: rgba(255,255,255,0.08); }

    .qty-value {
      border-left: 1px solid var(--border);
      border-right: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 900;
      color: var(--text);
      background: rgba(255,255,255,0.04);
    }

    .qty-hidden { display: none; }

    /* ── Total ── */
    .total-card {
      margin-top: 8px;
      padding: 8px 10px;
      border: 1px solid var(--border-strong);
      border-radius: 12px;
      background: #0c0d10;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
    }

    .total-left { display: flex; align-items: center; gap: 8px; min-width: 0; }
    .total-icon { display: none; }
    .total-title { font-size: 11.5px; font-weight: 900; color: var(--text); margin-bottom: 0; }
    .total-subtitle { display: none; }
    .total-value { font-size: 17px; font-weight: 950; letter-spacing: -0.04em; color: var(--text); white-space: nowrap; }

    /* ── Form as compact disclosure ── */
    .form-section { flex: 0 0 auto; background: #101216; }

    .form-section summary {
      list-style: none;
      cursor: pointer;
      padding: 8px 9px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      user-select: none;
    }

    .form-section summary::-webkit-details-marker { display: none; }

    .form-summary-left { display: flex; align-items: center; gap: 8px; min-width: 0; }
    .form-summary-text { min-width: 0; }

    .form-toggle-pill {
      flex-shrink: 0;
      border: 1px solid var(--border);
      border-radius: 999px;
      padding: 4px 8px;
      font-size: 10.5px;
      font-weight: 850;
      color: var(--text);
      background: rgba(255,255,255,0.045);
    }

    .form-toggle-pill::after { content: "Completar"; }
    .form-section[open] .form-toggle-pill::after { content: "Cerrar"; }

    .form-section .section-inner {
      border-top: 1px solid var(--border);
      padding: 8px;
      max-height: 240px;
      overflow-y: auto;
    }

    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 7px; }
    .field { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
    .field.full { grid-column: 1 / -1; }
    .label { font-size: 10.5px; font-weight: 800; color: #d4d4d8; }

    input, textarea {
      width: 100%;
      border: 1px solid var(--border-strong);
      border-radius: 10px;
      padding: 8px 9px;
      font-size: 12px;
      color: var(--text);
      background: #0c0d10;
      outline: none;
      font-family: inherit;
      transition: border-color 140ms, background 140ms;
    }

    input::placeholder, textarea::placeholder { color: #52525b; }
    input:focus, textarea:focus { border-color: rgba(255,255,255,0.34); background: #090a0c; }
    textarea { min-height: 58px; resize: vertical; }

    /* ── Submit ── */
    .submit-wrap { flex: 0 0 auto; display: grid; gap: 6px; }

    .submit-btn {
      width: 100%;
      border: 1px solid rgba(255,255,255,0.18);
      border-radius: 13px;
      background: #f4f4f5;
      color: #09090b;
      padding: 11px 14px;
      font-size: 13px;
      font-weight: 950;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: transform 140ms ease, background 140ms ease;
    }

    .submit-btn:hover { transform: translateY(-1px); background: #ffffff; }
    .submit-btn:disabled { opacity: 0.72; cursor: not-allowed; transform: none; }
    .submit-hint { text-align: center; color: var(--muted-soft); font-size: 10.5px; line-height: 1.3; }

    /* ── Messages ── */
    .message {
      display: none;
      padding: 10px 12px;
      border-radius: 12px;
      font-size: 12px;
      line-height: 1.4;
      white-space: pre-wrap;
      word-break: break-word;
      animation: fadeUp 220ms ease both;
      position: relative;
      z-index: 1;
    }

    .message.success { display: block; background: #18181b; color: #f4f4f5; border: 1px solid rgba(255,255,255,0.16); }
    .message.error { display: block; background: #1c1414; color: #fecaca; border: 1px solid rgba(248,113,113,0.28); }

    /* ── Footer ── */
    .footer { margin-top: 9px; text-align: center; font-size: 11px; line-height: 1.35; color: var(--muted); }

    .secure-row {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 5px 9px;
      border-radius: 999px;
      background: rgba(255,255,255,0.04);
      border: 1px solid var(--border);
      filter: grayscale(1);
    }

    .expires { margin-top: 7px; text-align: center; color: var(--muted-soft); font-size: 10.5px; position: relative; z-index: 1; }
    .empty { padding: 22px 14px; text-align: center; color: var(--muted); font-size: 12px; }

    /* ── Animations ── */
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes loaderIn { from { opacity: 0; transform: translateY(8px) scale(0.985); } to { opacity: 1; transform: translateY(0) scale(1); } }
    @keyframes pageIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes cardIn { from { opacity: 0; transform: translateY(10px) scale(0.99); } to { opacity: 1; transform: translateY(0) scale(1); } }

    /* ── Responsive ── */
    @media (max-width: 640px) {
      .page { padding: 8px 6px 14px; }
      .shell { width: 100%; min-height: calc(100vh - 22px); }
      .brand-pill { font-size: 10.5px; padding: 4px 9px; }
      h1 { font-size: 21px; }
      .subtitle { font-size: 10.8px; }
      .panel { padding: 6px; border-radius: 18px; }
      .section-inner { padding: 7px; }
      .section-head { margin-bottom: 6px; }
      .products-list { max-height: clamp(410px, 64vh, 760px); min-height: 340px; }
      .product-card { grid-template-columns: minmax(0, 1fr) auto; padding: 7px; gap: 7px; }
      .product-top { grid-template-columns: minmax(0, 1fr) auto; }
      .product-name { font-size: 12px; }
      .product-price { font-size: 11.5px; }
      .product-description { font-size: 10px; }
      .qty-box { grid-template-columns: 24px 28px 24px; }
      .qty-btn { height: 25px; }
      .form-grid { grid-template-columns: 1fr 1fr; gap: 6px; }
      .field.full { grid-column: 1 / -1; }
      .total-card { flex-direction: row; align-items: center; }
      .total-value { font-size: 15px; }
      .form-section .section-inner { max-height: 210px; }
    }

    @media (max-width: 390px) {
      .product-card { grid-template-columns: 1fr; }
      .qty-box { width: 100%; grid-template-columns: 1fr 32px 1fr; }
      .form-grid { grid-template-columns: 1fr; }
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
        total += Number(input.value || 0) * Number(input.dataset.productPrice || 0);
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
        "Productos",
        "Cantidad, precio y total en vista compacta."
      );
      section.classList.add("products-section");

      if (!Array.isArray(component.items) || component.items.length === 0) {
        const empty = document.createElement("div");
        empty.className = "empty";
        empty.textContent = "No hay productos disponibles por el momento.";
        inner.appendChild(empty);
        return section;
      }

      /* Scrollable wrapper */
      const scrollWrap = document.createElement("div");
      scrollWrap.className = "products-scroll-wrap";

      const list = document.createElement("div");
      list.className = "products-list";

      /* Track scroll position to hide fade hint at bottom */
      list.addEventListener("scroll", () => {
        const atBottom = list.scrollHeight - list.scrollTop <= list.clientHeight + 4;
        scrollWrap.classList.toggle("at-bottom", atBottom);
      });

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

      scrollWrap.appendChild(list);
      inner.appendChild(scrollWrap);

      /* Only show fade hint if there are enough items to scroll */
      if (component.items.length <= 7) {
        scrollWrap.classList.add("at-bottom");
      }

      /* Total */
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
      totalTitle.textContent = "Total";

      const totalSubtitle = document.createElement("div");
      totalSubtitle.className = "total-subtitle";
      totalSubtitle.textContent = "";

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
      const section = document.createElement("details");
      section.className = "section form-section";
      section.id = "customerDetailsSection";

      const summary = document.createElement("summary");

      const summaryLeft = document.createElement("div");
      summaryLeft.className = "form-summary-left";

      const iconEl = document.createElement("div");
      iconEl.className = "section-icon";
      iconEl.textContent = "👤";

      const textWrap = document.createElement("div");
      textWrap.className = "form-summary-text";

      const titleEl = document.createElement("div");
      titleEl.className = "section-title";
      titleEl.textContent = "Mis datos";

      const subtitleEl = document.createElement("div");
      subtitleEl.className = "section-subtitle";
      subtitleEl.textContent = "Abrir solo para completar contacto.";

      textWrap.appendChild(titleEl);
      textWrap.appendChild(subtitleEl);
      summaryLeft.appendChild(iconEl);
      summaryLeft.appendChild(textWrap);

      const toggle = document.createElement("div");
      toggle.className = "form-toggle-pill";

      summary.appendChild(summaryLeft);
      summary.appendChild(toggle);
      section.appendChild(summary);

      const inner = document.createElement("div");
      inner.className = "section-inner";

      const grid = document.createElement("div");
      grid.className = "form-grid";

      component.fields.forEach((field) => {
        const fieldWrap = document.createElement("div");
        fieldWrap.className = "field";
        if (field.inputType === "textarea") fieldWrap.classList.add("full");

        const label = document.createElement("label");
        label.className = "label";
        label.textContent = field.label + (field.required ? " *" : "");

        const input =
          field.inputType === "textarea"
            ? document.createElement("textarea")
            : document.createElement("input");

        if (field.inputType !== "textarea") input.type = field.inputType || "text";
        input.name = field.name;
        input.dataset.kind = "form-field";
        input.placeholder = field.placeholder || "";
        if (field.required) input.required = true;

        fieldWrap.appendChild(label);
        fieldWrap.appendChild(input);
        grid.appendChild(fieldWrap);
      });

      inner.appendChild(grid);
      section.appendChild(inner);
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
      hint.textContent = "Te contactaremos por WhatsApp.";

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
      document.querySelectorAll('[data-kind="product-quantity"]').forEach((input) => {
        const quantity = Number(input.value || 0);
        const productId = input.dataset.productId;
        if (quantity > 0 && productId) selectedItems.push({ productId, quantity });
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
          const details = document.getElementById("customerDetailsSection");
          if (details) details.setAttribute("open", "open");
          field.focus();
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
            raw: { submittedAtClient: new Date().toISOString() }
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
      el.style.animationDelay = String(index * 80) + "ms";
      contentEl.appendChild(el);
    });

    updateTotal();
  </script>
</body>
</html>`;
}