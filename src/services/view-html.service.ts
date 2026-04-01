import { RuntimeLinkRecord } from "../types/runtime";
import { escapeHtml } from "../utils/html";

export function renderViewHtml(record: RuntimeLinkRecord): string {
  const safeTitle = escapeHtml(record.config.title);
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
      --bg: #f3f4f6;
      --panel: #ffffff;
      --panel-soft: #fbfbfc;
      --text: #0f172a;
      --muted: #667085;
      --border: #dde3ea;
      --primary: #0f172a;
      --shadow: 0 10px 28px rgba(15, 23, 42, 0.08);
      --radius-xl: 22px;
      --radius-lg: 16px;
      --radius-md: 12px;
    }

    * {
      box-sizing: border-box;
    }

    html,
    body {
      margin: 0;
      padding: 0;
    }

    body {
      font-family: Inter, Arial, Helvetica, sans-serif;
      background: var(--bg);
      color: var(--text);
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    .page {
      min-height: 100vh;
      padding: 24px 12px 36px;
    }

    .shell {
      max-width: 920px;
      margin: 0 auto;
    }

    .hero {
      text-align: center;
      margin-bottom: 14px;
    }

    .brand-row {
      display: inline-flex;
      align-items: center;
      gap: 12px;
      color: #6b7280;
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 8px;
    }

    .brand-line {
      width: 42px;
      height: 1px;
      background: #b8c0cc;
    }

    h1 {
      margin: 0;
      font-size: 42px;
      line-height: 1.04;
      letter-spacing: -0.03em;
      color: var(--primary);
    }

    .hero-subtitle {
      margin: 10px auto 0;
      max-width: 720px;
      font-size: 16px;
      line-height: 1.45;
      color: var(--muted);
    }

    .card {
      background: var(--panel);
      border: 1px solid rgba(15, 23, 42, 0.05);
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow);
      padding: 14px;
    }

    .content-flow > * + * {
      margin-top: 12px;
    }

    .message {
      display: none;
      margin-top: 14px;
      padding: 12px 14px;
      border-radius: 12px;
      font-size: 14px;
      white-space: pre-wrap;
      word-break: break-word;
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

    .text-block {
      font-size: 16px;
      line-height: 1.55;
      color: #334155;
    }

    .section {
      border: 1px solid var(--border);
      border-radius: 14px;
      padding: 12px;
      background: #fff;
    }

    .section-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 4px;
    }

    .section-icon {
      width: 30px;
      height: 30px;
      border-radius: 9px;
      background: #f3f4f6;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      flex-shrink: 0;
    }

    .section-title {
      font-size: 18px;
      font-weight: 800;
      color: var(--primary);
      line-height: 1.1;
    }

    .section-subtitle {
      margin: 4px 0 0 38px;
      color: var(--muted);
      font-size: 13px;
      line-height: 1.4;
    }

    .products-list {
      margin-top: 10px;
      display: grid;
      gap: 6px;
    }

    .product-row {
      display: grid;
      grid-template-columns: minmax(0, 1fr) 118px;
      gap: 8px;
      align-items: center;
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 8px 10px;
      background: var(--panel-soft);
    }

    .product-info {
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .product-top {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 8px;
    }

    .product-name {
      margin: 0;
      font-size: 15px;
      font-weight: 800;
      color: var(--primary);
      line-height: 1.2;
      word-break: break-word;
    }

    .product-price {
      font-size: 14px;
      font-weight: 800;
      color: #111827;
      line-height: 1.1;
      white-space: nowrap;
      flex-shrink: 0;
    }

    .product-description {
      margin: 0;
      font-size: 12px;
      line-height: 1.35;
      color: var(--muted);
      word-break: break-word;
    }

    .qty-col {
      justify-self: end;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      width: 100%;
    }

    .qty-box {
      display: inline-grid;
      grid-template-columns: 32px 40px 32px;
      border: 1px solid #cfd6df;
      border-radius: 8px;
      overflow: hidden;
      background: #fff;
      min-width: 104px;
    }

    .qty-btn {
      appearance: none;
      border: none;
      background: #fff;
      color: var(--primary);
      font-size: 18px;
      line-height: 1;
      height: 32px;
      cursor: pointer;
    }

    .qty-btn:hover {
      background: #f8fafc;
    }

    .qty-value {
      border-left: 1px solid #cfd6df;
      border-right: 1px solid #cfd6df;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      font-weight: 800;
      color: var(--primary);
      background: #fff;
    }

    .qty-hidden {
      display: none;
    }

    .total-card {
      margin-top: 8px;
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 10px 12px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #fff;
      gap: 10px;
    }

    .total-label-wrap {
      display: flex;
      align-items: center;
      gap: 10px;
      min-width: 0;
    }

    .total-icon {
      width: 30px;
      height: 30px;
      border-radius: 9px;
      background: #f3f4f6;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      flex-shrink: 0;
    }

    .total-title {
      font-size: 14px;
      font-weight: 800;
      color: var(--primary);
      margin-bottom: 1px;
      line-height: 1.1;
    }

    .total-label {
      font-size: 12px;
      color: var(--muted);
      line-height: 1.35;
    }

    .total-value {
      font-size: 20px;
      font-weight: 900;
      color: var(--primary);
      letter-spacing: -0.02em;
      text-align: right;
      white-space: nowrap;
      line-height: 1;
    }

    .form-grid {
      margin-top: 12px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }

    .field {
      display: flex;
      flex-direction: column;
      gap: 6px;
      min-width: 0;
    }

    .field.full {
      grid-column: 1 / -1;
    }

    .label {
      font-size: 14px;
      font-weight: 700;
      color: var(--primary);
      line-height: 1.2;
    }

    .input-wrap {
      position: relative;
      min-width: 0;
    }

    input,
    textarea {
      width: 100%;
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 10px 12px;
      font-size: 14px;
      color: var(--text);
      background: #fff;
      outline: none;
    }

    input::placeholder,
    textarea::placeholder {
      color: #98a2b3;
    }

    input:focus,
    textarea:focus {
      border-color: #94a3b8;
      box-shadow: 0 0 0 3px rgba(148, 163, 184, 0.16);
    }

    textarea {
      min-height: 92px;
      resize: vertical;
    }

    .submit-btn {
      width: 100%;
      border: none;
      border-radius: 12px;
      background: linear-gradient(180deg, #0f172a 0%, #111827 100%);
      color: #fff;
      padding: 12px 16px;
      font-size: 15px;
      font-weight: 800;
      cursor: pointer;
      box-shadow: 0 10px 24px rgba(15, 23, 42, 0.16);
      transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
    }

    .submit-btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 14px 28px rgba(15, 23, 42, 0.18);
      background: linear-gradient(180deg, #0b1220 0%, #0f172a 100%);
    }

    .meta {
      margin-top: 14px;
      text-align: center;
      color: var(--muted);
      font-size: 12px;
      line-height: 1.4;
    }

    @media (max-width: 860px) {
      h1 {
        font-size: 36px;
      }

      .hero-subtitle {
        font-size: 15px;
      }

      .product-row {
        grid-template-columns: minmax(0, 1fr) 112px;
      }

      .product-name {
        font-size: 14px;
      }

      .product-price {
        font-size: 13px;
      }
    }

    @media (max-width: 640px) {
      .page {
        padding: 18px 8px 28px;
      }

      .card {
        padding: 12px;
        border-radius: 16px;
      }

      h1 {
        font-size: 29px;
      }

      .hero-subtitle {
        font-size: 14px;
      }

      .brand-row {
        gap: 8px;
        font-size: 12px;
      }

      .brand-line {
        width: 24px;
      }

      .section {
        padding: 10px;
      }

      .section-title {
        font-size: 16px;
      }

      .section-subtitle {
        margin-left: 0;
        margin-top: 6px;
        font-size: 12px;
      }

      .form-grid {
        grid-template-columns: 1fr;
      }

      .product-row {
        grid-template-columns: 1fr;
        gap: 8px;
        padding: 8px;
      }

      .product-top {
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;
      }

      .product-name {
        font-size: 14px;
      }

      .product-price {
        font-size: 13px;
      }

      .product-description {
        font-size: 12px;
      }

      .qty-col {
        justify-self: start;
      }

      .qty-box {
        grid-template-columns: 32px 40px 32px;
        min-width: 104px;
      }

      .qty-btn {
        height: 32px;
        font-size: 18px;
      }

      .qty-value {
        font-size: 14px;
      }

      .total-card {
        flex-direction: column;
        align-items: flex-start;
      }

      .total-value {
        font-size: 20px;
        text-align: left;
      }

      input,
      textarea {
        font-size: 14px;
      }

      .submit-btn {
        font-size: 15px;
      }
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="shell">
      <div class="hero">
        <div class="brand-row">
          <span class="brand-line"></span>
          <span>${safeBrand}</span>
          <span class="brand-line"></span>
        </div>
        <h1>${safeTitle}</h1>
        <p class="hero-subtitle">${safeSubtitle}</p>
      </div>

      <div class="card">
        <div id="content" class="content-flow"></div>
        <div id="message" class="message"></div>
        <div class="meta">
          Este enlace temporal expira el <span id="expiresAt"></span>
        </div>
      </div>
    </div>
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
    const expiresAtEl = document.getElementById("expiresAt");

    expiresAtEl.textContent = expiresAt;

    function formatCurrency(value) {
      return new Intl.NumberFormat("es-CL", {
        style: "currency",
        currency: "CLP",
        maximumFractionDigits: 0
      }).format(value);
    }

    function showMessage(type, text) {
      messageEl.className = "message " + type;
      messageEl.textContent = text;
      messageEl.style.display = "block";
      messageEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }

    function createSection(title, icon, subtitle) {
      const section = document.createElement("section");
      section.className = "section";

      const header = document.createElement("div");
      header.className = "section-header";

      const iconEl = document.createElement("div");
      iconEl.className = "section-icon";
      iconEl.textContent = icon;

      const titleEl = document.createElement("div");
      titleEl.className = "section-title";
      titleEl.textContent = title;

      header.appendChild(iconEl);
      header.appendChild(titleEl);
      section.appendChild(header);

      if (subtitle) {
        const subtitleEl = document.createElement("div");
        subtitleEl.className = "section-subtitle";
        subtitleEl.textContent = subtitle;
        section.appendChild(subtitleEl);
      }

      return section;
    }

    function renderText(component) {
      const el = document.createElement("div");
      el.className = "text-block";
      el.textContent = component.value;
      return el;
    }

    function renderProducts(component) {
      const section = createSection(
        "Productos",
        "🛍️",
        "Elige los productos que te interesan."
      );

      const list = document.createElement("div");
      list.className = "products-list";

      component.items.forEach((item) => {
        const row = document.createElement("div");
        row.className = "product-row";

        const info = document.createElement("div");
        info.className = "product-info";

        const top = document.createElement("div");
        top.className = "product-top";

        const name = document.createElement("h3");
        name.className = "product-name";
        name.textContent = item.name;

        const price = document.createElement("div");
        price.className = "product-price";
        price.textContent = formatCurrency(Number(item.price));

        top.appendChild(name);
        top.appendChild(price);

        const description = document.createElement("p");
        description.className = "product-description";
        description.textContent =
          item.description || "Descripción opcional del producto.";

        info.appendChild(top);
        info.appendChild(description);

        const qtyCol = document.createElement("div");
        qtyCol.className = "qty-col";

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
        hiddenInput.dataset.productPrice = String(item.price);
        hiddenInput.dataset.kind = "product-quantity";
        hiddenInput.className = "qty-hidden";

        function syncQty(nextValue) {
          const safeValue = Math.max(0, Number(nextValue) || 0);
          hiddenInput.value = String(safeValue);
          valueEl.textContent = String(safeValue);
          updateTotal();
        }

        minusBtn.addEventListener("click", () => {
          syncQty(Number(hiddenInput.value) - 1);
        });

        plusBtn.addEventListener("click", () => {
          syncQty(Number(hiddenInput.value) + 1);
        });

        qtyBox.appendChild(minusBtn);
        qtyBox.appendChild(valueEl);
        qtyBox.appendChild(plusBtn);
        qtyBox.appendChild(hiddenInput);
        qtyCol.appendChild(qtyBox);

        row.appendChild(info);
        row.appendChild(qtyCol);

        list.appendChild(row);
      });

      section.appendChild(list);

      const totalCard = document.createElement("div");
      totalCard.className = "total-card";

      const totalLeft = document.createElement("div");
      totalLeft.className = "total-label-wrap";

      const totalIcon = document.createElement("div");
      totalIcon.className = "total-icon";
      totalIcon.textContent = "🧾";

      const totalTextWrap = document.createElement("div");

      const totalTitle = document.createElement("div");
      totalTitle.className = "total-title";
      totalTitle.textContent = "Total estimado";

      const totalLabel = document.createElement("div");
      totalLabel.className = "total-label";
      totalLabel.textContent = "Suma de los productos seleccionados";

      totalTextWrap.appendChild(totalTitle);
      totalTextWrap.appendChild(totalLabel);

      totalLeft.appendChild(totalIcon);
      totalLeft.appendChild(totalTextWrap);

      const totalValue = document.createElement("div");
      totalValue.className = "total-value";
      totalValue.id = "totalValue";
      totalValue.textContent = formatCurrency(0);

      totalCard.appendChild(totalLeft);
      totalCard.appendChild(totalValue);

      section.appendChild(totalCard);

      return section;
    }

    function renderForm(component) {
      const section = createSection(
        "Tus datos",
        "👤",
        "Completa el formulario para enviar tu solicitud."
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

        const inputWrap = document.createElement("div");
        inputWrap.className = "input-wrap";

        const input =
          field.inputType === "textarea"
            ? document.createElement("textarea")
            : document.createElement("input");

        if (field.inputType !== "textarea") {
          input.type = field.inputType;
        }

        input.name = field.name;
        input.dataset.kind = "form-field";
        input.placeholder = field.placeholder || "";

        if (field.required) {
          input.required = true;
        }

        inputWrap.appendChild(input);
        fieldWrap.appendChild(label);
        fieldWrap.appendChild(inputWrap);
        grid.appendChild(fieldWrap);
      });

      section.appendChild(grid);
      return section;
    }

    function renderButton(component) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "submit-btn";
      btn.textContent = component.label;
      btn.addEventListener("click", onSubmit);
      return btn;
    }

    function renderComponent(component) {
      switch (component.type) {
        case "text":
          return renderText(component);
        case "products":
          return renderProducts(component);
        case "form":
          return renderForm(component);
        case "button":
          return renderButton(component);
        default:
          return document.createElement("div");
      }
    }

    function updateTotal() {
      const qtyInputs = document.querySelectorAll('[data-kind="product-quantity"]');
      let total = 0;

      qtyInputs.forEach((input) => {
        const quantity = Number(input.value || 0);
        const price = Number(input.dataset.productPrice || 0);
        total += quantity * price;
      });

      const totalEl = document.getElementById("totalValue");
      if (totalEl) {
        totalEl.textContent = formatCurrency(total);
      }
    }

    async function onSubmit() {
      try {
        const customer = {};
        const formFields = document.querySelectorAll('[data-kind="form-field"]');

        for (const field of formFields) {
          if (field.required && !field.value.trim()) {
            showMessage("error", "Completa los campos obligatorios.");
            return;
          }
          customer[field.name] = field.value;
        }

        const qtyInputs = document.querySelectorAll('[data-kind="product-quantity"]');
        const items = [];

        for (const input of qtyInputs) {
          const quantity = Number(input.value || 0);
          if (quantity > 0) {
            items.push({
              productId: input.dataset.productId,
              quantity
            });
          }
        }

        const response = await fetch('/api/runtime-links/' + token + '/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            customer,
            items,
            raw: {
              submittedAtClient: new Date().toISOString()
            }
          })
        });

        const data = await response.json();

        if (!response.ok) {
          showMessage("error", data.message || "No se pudo enviar.");
          return;
        }

        if (data.pdfUrl) {
          showMessage("success", \`📄 Tu cotización está lista:\\n👉 \${data.pdfUrl}\`);
          return;
        }

        showMessage("success", data.message || successMessage);
      } catch (_error) {
        showMessage("error", "Ocurrió un error al enviar.");
      }
    }

    config.components.forEach((component) => {
      contentEl.appendChild(renderComponent(component));
    });

    updateTotal();
  </script>
</body>
</html>`;
}