import express, { Request, Response } from "express";
import cors from "cors";
import crypto from "crypto";

const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const axios = require("axios");

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const BASE_URL = process.env.PUBLIC_BASE_URL || `http://localhost:${PORT}`;

const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN || "";
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || "";

app.use(cors());
app.use(express.json({ limit: "1mb" }));

type TextComponent = {
  type: "text";
  value: string;
};

type ProductItem = {
  id: string;
  name: string;
  price: number;
  description?: string;
  imageUrl?: string;
};

type ProductsComponent = {
  type: "products";
  items: ProductItem[];
};

type FormField = {
  name: string;
  label: string;
  inputType: "text" | "email" | "tel" | "number" | "textarea";
  required?: boolean;
  placeholder?: string;
};

type FormComponent = {
  type: "form";
  fields: FormField[];
};

type ButtonComponent = {
  type: "button";
  label: string;
  action: {
    type: "submit";
  };
};

type UIComponent =
  | TextComponent
  | ProductsComponent
  | FormComponent
  | ButtonComponent;

type ViewConfig = {
  title: string;
  subtitle?: string;
  brand?: string;
  successMessage?: string;
  recipientPhone?: string;
  components: UIComponent[];
};

type RuntimeLinkRecord = {
  token: string;
  config: ViewConfig;
  createdAt: number;
  expiresAt: number;
  status: "active" | "expired" | "used";
  openedAt?: number;
  submittedAt?: number;
  submissions: unknown[];
};

type CreateRuntimeLinkBody = {
  expiresInMinutes?: number;
  config: ViewConfig;
};

type SubmitBody = {
  customer?: Record<string, unknown>;
  items?: Array<{ productId: string; quantity: number }>;
  raw?: Record<string, unknown>;
};

const GENERATED_PDFS_DIR = path.join(__dirname, "generated-pdfs");

if (!fs.existsSync(GENERATED_PDFS_DIR)) {
  fs.mkdirSync(GENERATED_PDFS_DIR, { recursive: true });
}

app.use("/generated-pdfs", express.static(GENERATED_PDFS_DIR));

const runtimeLinks = new Map<string, RuntimeLinkRecord>();

function generateToken(): string {
  return crypto.randomBytes(8).toString("hex");
}

function isExpired(record: RuntimeLinkRecord): boolean {
  return Date.now() > record.expiresAt;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function validateConfig(config: unknown): config is ViewConfig {
  if (!config || typeof config !== "object") return false;

  const c = config as ViewConfig;

  if (typeof c.title !== "string" || !Array.isArray(c.components)) {
    return false;
  }

  for (const component of c.components) {
    if (!component || typeof component !== "object" || !("type" in component)) {
      return false;
    }

    switch (component.type) {
      case "text":
        if (typeof component.value !== "string") return false;
        break;

      case "products":
        if (!Array.isArray(component.items)) return false;
        for (const item of component.items) {
          if (
            !item ||
            typeof item.id !== "string" ||
            typeof item.name !== "string" ||
            typeof item.price !== "number"
          ) {
            return false;
          }
        }
        break;

      case "form":
        if (!Array.isArray(component.fields)) return false;
        for (const field of component.fields) {
          const validInputTypes = ["text", "email", "tel", "number", "textarea"];
          if (
            !field ||
            typeof field.name !== "string" ||
            typeof field.label !== "string" ||
            !validInputTypes.includes(field.inputType)
          ) {
            return false;
          }
        }
        break;

      case "button":
        if (
          typeof component.label !== "string" ||
          !component.action ||
          component.action.type !== "submit"
        ) {
          return false;
        }
        break;

      default:
        return false;
    }
  }

  return true;
}

function getRecordOrNull(token: string): RuntimeLinkRecord | null {
  const record = runtimeLinks.get(token);
  if (!record) return null;

  if (isExpired(record)) {
    record.status = "expired";
    return record;
  }

  return record;
}

function formatCurrencyCLP(value: number): string {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function getProductsFromConfig(config: ViewConfig): ProductItem[] {
  const productsComponent = config.components.find(
    (component): component is ProductsComponent => component.type === "products"
  );

  return productsComponent?.items || [];
}

function sanitizeFileName(value: string): string {
  return String(value || "")
    .replace(/[^\w\-]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 60);
}

function buildQuoteDetail(record: RuntimeLinkRecord, submitBody: SubmitBody) {
  const catalog = getProductsFromConfig(record.config);
  const selectedItems = Array.isArray(submitBody?.items) ? submitBody.items : [];
  const customer = submitBody?.customer || {};

  const lines = selectedItems
    .map((selected) => {
      const product = catalog.find((item) => item.id === selected.productId);
      if (!product) return null;

      const quantity = Number(selected.quantity || 0);
      const unitPrice = Number(product.price || 0);
      const subtotal = quantity * unitPrice;

      return {
        productId: product.id,
        name: product.name,
        quantity,
        unitPrice,
        subtotal,
        description: product.description || "",
      };
    })
    .filter(Boolean) as Array<{
      productId: string;
      name: string;
      quantity: number;
      unitPrice: number;
      subtotal: number;
      description: string;
    }>;

  const total = lines.reduce((acc, line) => acc + line.subtotal, 0);

  return {
    customer,
    lines,
    total,
  };
}

function generateQuotePdf(record: RuntimeLinkRecord, submitBody: SubmitBody) {
  return new Promise<{ fileName: string; filePath: string }>((resolve, reject) => {
    try {
      const quote = buildQuoteDetail(record, submitBody);
      const timestamp = Date.now();
      const safeToken = sanitizeFileName(record.token);
      const fileName = `cotizacion_${safeToken}_${timestamp}.pdf`;
      const filePath = path.join(GENERATED_PDFS_DIR, fileName);

      const doc = new PDFDocument({
        margin: 50,
        size: "A4",
      });

      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      doc
        .fontSize(22)
        .font("Helvetica-Bold")
        .text(record.config.brand || "Automatiza Fácil", { align: "left" });

      doc
        .moveDown(0.3)
        .fontSize(18)
        .font("Helvetica-Bold")
        .text(record.config.title || "Cotización");

      doc
        .moveDown(0.2)
        .fontSize(10)
        .font("Helvetica")
        .fillColor("#666666")
        .text(`Fecha: ${new Date().toLocaleString("es-CL")}`)
        .text(`Token: ${record.token}`);

      doc.fillColor("#000000");
      doc.moveDown();

      doc.fontSize(14).font("Helvetica-Bold").text("Datos del cliente");
      doc.moveDown(0.4);
      doc.fontSize(11).font("Helvetica");

      const customerName =
        typeof quote.customer.name === "string" ? quote.customer.name : "-";
      const customerEmail =
        typeof quote.customer.email === "string" ? quote.customer.email : "-";
      const customerPhone =
        typeof quote.customer.phone === "string" ? quote.customer.phone : "-";
      const customerNotes =
        typeof quote.customer.notes === "string" ? quote.customer.notes : "-";

      doc.text(`Nombre: ${customerName}`);
      doc.text(`Correo: ${customerEmail}`);
      doc.text(`Teléfono: ${customerPhone}`);
      doc.text(`Mensaje: ${customerNotes}`);

      doc.moveDown();
      doc.fontSize(14).font("Helvetica-Bold").text("Detalle de cotización");
      doc.moveDown(0.5);

      if (quote.lines.length === 0) {
        doc.fontSize(11).font("Helvetica").text("No se seleccionaron productos.");
      } else {
        quote.lines.forEach((line, index) => {
          doc
            .fontSize(12)
            .font("Helvetica-Bold")
            .text(`${index + 1}. ${line.name}`);

          doc
            .fontSize(11)
            .font("Helvetica")
            .text(`Cantidad: ${line.quantity}`)
            .text(`Precio unitario: ${formatCurrencyCLP(line.unitPrice)}`)
            .text(`Subtotal: ${formatCurrencyCLP(line.subtotal)}`);

          if (line.description) {
            doc.text(`Descripción: ${line.description}`);
          }

          doc.moveDown(0.7);
        });
      }

      doc.moveDown(0.5);
      doc
        .fontSize(15)
        .font("Helvetica-Bold")
        .text(`Total: ${formatCurrencyCLP(quote.total)}`, {
          align: "right",
        });

      doc.moveDown(1.5);
      doc
        .fontSize(10)
        .font("Helvetica")
        .fillColor("#666666")
        .text("Documento generado automáticamente por Automatiza Fácil.", {
          align: "center",
        });

      doc.end();

      stream.on("finish", () => {
        resolve({
          fileName,
          filePath,
        });
      });

      stream.on("error", reject);
    } catch (error) {
      reject(error);
    }
  });
}

async function sendWhatsAppTextMessage(
  recipientPhone: string,
  messageText: string
) {
  if (!WHATSAPP_ACCESS_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
    console.warn("Faltan variables de WhatsApp para enviar mensaje.");
    return;
  }

  await axios.post(
    `https://graph.facebook.com/v23.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
    {
      messaging_product: "whatsapp",
      to: recipientPhone,
      type: "text",
      text: {
        preview_url: true,
        body: messageText,
      },
    },
    {
      headers: {
        Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
    }
  );
}

async function sendWhatsAppDocumentMessage(
  recipientPhone: string,
  documentUrl: string,
  filename: string,
  caption?: string
) {
  if (!WHATSAPP_ACCESS_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
    console.warn("Faltan variables de WhatsApp para enviar documento.");
    return;
  }

  await axios.post(
    `https://graph.facebook.com/v23.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
    {
      messaging_product: "whatsapp",
      to: recipientPhone,
      type: "document",
      document: {
        link: documentUrl,
        filename,
        caption: caption || "Aquí tienes tu cotización en PDF.",
      },
    },
    {
      headers: {
        Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
    }
  );
}

function renderViewHtml(record: RuntimeLinkRecord): string {
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
      --panel-soft: #fafafa;
      --text: #0f172a;
      --muted: #667085;
      --border: #dfe3ea;
      --primary: #0f172a;
      --primary-strong: #020617;
      --shadow: 0 14px 40px rgba(15, 23, 42, 0.10);
      --radius-xl: 24px;
      --radius-lg: 18px;
      --radius-md: 14px;
    }

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      font-family: Inter, Arial, Helvetica, sans-serif;
      background: var(--bg);
      color: var(--text);
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    .page {
      min-height: 100vh;
      padding: 40px 20px 56px;
    }

    .shell {
      max-width: 1000px;
      margin: 0 auto;
    }

    .hero {
      text-align: center;
      margin-bottom: 26px;
    }

    .brand-row {
      display: inline-flex;
      align-items: center;
      gap: 18px;
      color: #6b7280;
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 10px;
    }

    .brand-line {
      width: 68px;
      height: 1px;
      background: #b8c0cc;
    }

    h1 {
      margin: 0;
      font-size: 56px;
      line-height: 1.05;
      letter-spacing: -0.03em;
      color: var(--primary);
    }

    .hero-subtitle {
      margin: 14px auto 0;
      max-width: 760px;
      font-size: 17px;
      line-height: 1.5;
      color: var(--muted);
    }

    .card {
      background: var(--panel);
      border: 1px solid rgba(15, 23, 42, 0.05);
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow);
      padding: 28px;
    }

    .message {
      display: none;
      margin-top: 18px;
      padding: 14px 16px;
      border-radius: 14px;
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

    .content-flow > * + * {
      margin-top: 22px;
    }

    .text-block {
      font-size: 16px;
      line-height: 1.6;
      color: #334155;
    }

    .section {
      border: 1px solid var(--border);
      border-radius: 18px;
      padding: 20px;
      background: #fff;
    }

    .section-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 8px;
    }

    .section-icon {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: #f3f4f6;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      flex-shrink: 0;
    }

    .section-title {
      font-size: 18px;
      font-weight: 800;
      color: var(--primary);
    }

    .section-subtitle {
      margin: 6px 0 0 48px;
      color: var(--muted);
      font-size: 14px;
      line-height: 1.5;
    }

    .products-list {
      margin-top: 18px;
      display: grid;
      gap: 14px;
    }

    .product-row {
      display: grid;
      grid-template-columns: 120px minmax(0, 1fr) 184px;
      gap: 18px;
      align-items: center;
      border: 1px solid var(--border);
      border-radius: 18px;
      padding: 18px;
      background: var(--panel-soft);
    }

    .product-media {
      width: 120px;
      height: 120px;
      border-radius: 16px;
      border: 1px solid var(--border);
      background: linear-gradient(180deg, #f8fafc 0%, #eef2f7 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      flex-shrink: 0;
    }

    .product-media img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .product-placeholder {
      font-size: 42px;
      color: #94a3b8;
    }

    .product-info {
      min-width: 0;
    }

    .product-name {
      margin: 0 0 8px;
      font-size: 20px;
      font-weight: 800;
      color: var(--primary);
      word-break: break-word;
    }

    .product-price {
      font-size: 18px;
      font-weight: 700;
      color: #111827;
      margin-bottom: 8px;
    }

    .product-description {
      margin: 0;
      font-size: 14px;
      line-height: 1.5;
      color: var(--muted);
      word-break: break-word;
    }

    .qty-box {
      justify-self: end;
      display: inline-grid;
      grid-template-columns: 54px 68px 54px;
      border: 1px solid #cfd6df;
      border-radius: 14px;
      overflow: hidden;
      background: #fff;
      align-self: center;
    }

    .qty-btn {
      appearance: none;
      border: none;
      background: #fff;
      color: var(--primary);
      font-size: 28px;
      line-height: 1;
      height: 56px;
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
      font-size: 24px;
      font-weight: 700;
      color: var(--primary);
      background: #fff;
    }

    .qty-hidden {
      display: none;
    }

    .total-card {
      margin-top: 12px;
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 18px 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #fff;
      gap: 16px;
    }

    .total-label-wrap {
      display: flex;
      align-items: center;
      gap: 12px;
      min-width: 0;
    }

    .total-icon {
      width: 40px;
      height: 40px;
      border-radius: 12px;
      background: #f3f4f6;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      flex-shrink: 0;
    }

    .total-label {
      font-size: 15px;
      color: var(--muted);
    }

    .total-title {
      font-size: 16px;
      font-weight: 800;
      color: var(--primary);
      margin-bottom: 4px;
    }

    .total-value {
      font-size: 26px;
      font-weight: 900;
      color: var(--primary);
      letter-spacing: -0.02em;
      text-align: right;
      white-space: nowrap;
    }

    .form-grid {
      margin-top: 18px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 18px;
    }

    .field {
      display: flex;
      flex-direction: column;
      gap: 10px;
      min-width: 0;
    }

    .field.full {
      grid-column: 1 / -1;
    }

    .label {
      font-size: 14px;
      font-weight: 700;
      color: var(--primary);
    }

    .input-wrap {
      position: relative;
      min-width: 0;
    }

    input,
    textarea {
      width: 100%;
      border: 1px solid var(--border);
      border-radius: 14px;
      padding: 16px 16px;
      font-size: 15px;
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
      min-height: 120px;
      resize: vertical;
    }

    .submit-btn {
      width: 100%;
      border: none;
      border-radius: 18px;
      background: linear-gradient(180deg, #0f172a 0%, #111827 100%);
      color: #fff;
      padding: 18px 22px;
      font-size: 18px;
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
      margin-top: 18px;
      text-align: center;
      color: var(--muted);
      font-size: 13px;
      line-height: 1.5;
    }

    @media (max-width: 860px) {
      h1 {
        font-size: 42px;
      }

      .product-row {
        grid-template-columns: 100px minmax(0, 1fr);
        align-items: start;
      }

      .qty-box {
        justify-self: start;
        grid-column: 2;
        grid-row: 2;
        margin-top: 8px;
      }

      .product-media {
        width: 100px;
        height: 100px;
      }
    }

    @media (max-width: 640px) {
      .page {
        padding: 24px 14px 40px;
      }

      .card {
        padding: 18px;
        border-radius: 20px;
      }

      h1 {
        font-size: 34px;
      }

      .hero-subtitle {
        font-size: 15px;
      }

      .brand-row {
        gap: 12px;
        font-size: 14px;
      }

      .brand-line {
        width: 42px;
      }

      .section {
        padding: 16px;
      }

      .section-subtitle {
        margin-left: 0;
        margin-top: 10px;
      }

      .form-grid {
        grid-template-columns: 1fr;
      }

      .product-row {
        grid-template-columns: 72px minmax(0, 1fr);
        gap: 12px;
        align-items: start;
        padding: 14px;
      }

      .product-media {
        width: 72px;
        height: 72px;
        border-radius: 12px;
      }

      .product-placeholder {
        font-size: 26px;
      }

      .product-name {
        font-size: 17px;
        margin-bottom: 6px;
      }

      .product-price {
        font-size: 15px;
        margin-bottom: 6px;
      }

      .product-description {
        font-size: 13px;
      }

      .qty-box {
        justify-self: start;
        grid-column: 2;
        grid-row: 2;
        margin-top: 10px;
        width: 150px;
        grid-template-columns: 44px 62px 44px;
      }

      .qty-btn {
        height: 44px;
        font-size: 22px;
      }

      .qty-value {
        font-size: 18px;
      }

      .total-card {
        align-items: flex-start;
        flex-direction: column;
      }

      .total-value {
        font-size: 22px;
        text-align: left;
      }

      input,
      textarea {
        padding: 14px 14px;
        font-size: 14px;
      }

      .submit-btn {
        padding: 16px 18px;
        font-size: 16px;
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

        const media = document.createElement("div");
        media.className = "product-media";

        if (item.imageUrl) {
          const img = document.createElement("img");
          img.src = item.imageUrl;
          img.alt = item.name;
          media.appendChild(img);
        } else {
          const placeholder = document.createElement("div");
          placeholder.className = "product-placeholder";
          placeholder.textContent = "⬛";
          media.appendChild(placeholder);
        }

        const info = document.createElement("div");
        info.className = "product-info";

        const name = document.createElement("h3");
        name.className = "product-name";
        name.textContent = item.name;

        const price = document.createElement("div");
        price.className = "product-price";
        price.textContent = formatCurrency(Number(item.price));

        const description = document.createElement("p");
        description.className = "product-description";
        description.textContent = item.description || "Descripción opcional del producto.";

        info.appendChild(name);
        info.appendChild(price);
        info.appendChild(description);

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

        row.appendChild(media);
        row.appendChild(info);
        row.appendChild(qtyBox);

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

setInterval(() => {
  for (const [token, record] of runtimeLinks.entries()) {
    const expiredLongAgo = Date.now() > record.expiresAt + 1000 * 60 * 30;
    if (expiredLongAgo) {
      runtimeLinks.delete(token);
    }
  }
}, 1000 * 60 * 5);

app.post(
  "/api/runtime-links",
  (req: Request<{}, {}, CreateRuntimeLinkBody>, res: Response) => {
    const { expiresInMinutes = 10, config } = req.body;

    if (!validateConfig(config)) {
      return res.status(400).json({
        ok: false,
        message: "Config inválida.",
      });
    }

    if (
      typeof expiresInMinutes !== "number" ||
      expiresInMinutes <= 0 ||
      expiresInMinutes > 120
    ) {
      return res.status(400).json({
        ok: false,
        message: "expiresInMinutes debe ser un número entre 1 y 120.",
      });
    }

    const token = generateToken();
    const now = Date.now();

    const record: RuntimeLinkRecord = {
      token,
      config,
      createdAt: now,
      expiresAt: now + expiresInMinutes * 60 * 1000,
      status: "active",
      submissions: [],
    };

    runtimeLinks.set(token, record);

    return res.status(201).json({
      ok: true,
      token,
      url: `${BASE_URL}/v/${token}`,
      expiresAt: new Date(record.expiresAt).toISOString(),
    });
  }
);

app.get(
  "/api/runtime-links/:token",
  (req: Request<{ token: string }>, res: Response) => {
    const { token } = req.params;
    const record = getRecordOrNull(token);

    if (!record) {
      return res.status(404).json({
        ok: false,
        message: "Link no encontrado.",
      });
    }

    if (record.status === "expired") {
      return res.status(410).json({
        ok: false,
        status: "expired",
        message: "Este enlace expiró.",
      });
    }

    return res.json({
      ok: true,
      token: record.token,
      status: record.status,
      expiresAt: new Date(record.expiresAt).toISOString(),
      config: record.config,
    });
  }
);

app.post(
  "/api/runtime-links/:token/submit",
  async (req: Request<{ token: string }, {}, SubmitBody>, res: Response) => {
    try {
      const { token } = req.params;
      const record = getRecordOrNull(token);

      if (!record) {
        return res.status(404).json({
          ok: false,
          message: "Link no encontrado.",
        });
      }

      if (record.status === "expired") {
        return res.status(410).json({
          ok: false,
          message: "Este enlace expiró.",
        });
      }

      const body = req.body || {};
      const pdfResult = await generateQuotePdf(record, body);
      const pdfUrl = `${BASE_URL}/generated-pdfs/${pdfResult.fileName}`;

      record.submissions.push({
        ...body,
        submittedAt: new Date().toISOString(),
        pdfUrl,
      });

      record.submittedAt = Date.now();
      record.status = "used";

      const recipientPhone =
        typeof record.config.recipientPhone === "string"
          ? record.config.recipientPhone
          : "";

      if (recipientPhone) {
        try {
          await sendWhatsAppTextMessage(
            recipientPhone,
            `📄 Tu cotización está lista:\n👉 ${pdfUrl}`
          );
        } catch (whatsAppError) {
          console.error("Error enviando link a WhatsApp:", whatsAppError);
        }
      }

      return res.json({
        ok: true,
        message: "📄 Tu cotización está lista:",
        pdfUrl,
      });
    } catch (error) {
      console.error("Error al generar PDF:", error);

      return res.status(500).json({
        ok: false,
        message: "No se pudo generar el PDF.",
      });
    }
  }
);

app.get(
  "/api/runtime-links/:token/submissions",
  (req: Request<{ token: string }>, res: Response) => {
    const { token } = req.params;
    const record = runtimeLinks.get(token);

    if (!record) {
      return res.status(404).json({
        ok: false,
        message: "Link no encontrado.",
      });
    }

    return res.json({
      ok: true,
      token,
      status: record.status,
      submissions: record.submissions,
    });
  }
);

app.get("/debug/tokens", (_req: Request, res: Response) => {
  return res.json({
    ok: true,
    tokens: Array.from(runtimeLinks.keys()),
  });
});

app.get("/v/:token", (req: Request<{ token: string }>, res: Response) => {
  const { token } = req.params;
  const record = getRecordOrNull(token);

  if (!record) {
    return res.status(404).send("<h1>404</h1><p>Link no encontrado.</p>");
  }

  if (record.status === "expired") {
    return res
      .status(410)
      .send("<h1>Link expirado</h1><p>Este enlace ya no está disponible.</p>");
  }

  record.openedAt = Date.now();
  return res.send(renderViewHtml(record));
});

app.get("/demo/create", (_req: Request, res: Response) => {
  const demoConfig: ViewConfig = {
    brand: "Automatiza Fácil",
    title: "Cotización Inteligente",
    subtitle: "Selecciona productos y envía tu solicitud.",
    successMessage: "Solicitud enviada correctamente.",
    recipientPhone: "56900000000",
    components: [
      {
        type: "products",
        items: [
          {
            id: "p1",
            name: "Producto A",
            price: 50000,
            description: "Descripción opcional del producto."
          },
          {
            id: "p2",
            name: "Producto B",
            price: 50000,
            description: "Descripción opcional del producto."
          },
          {
            id: "p3",
            name: "Producto C",
            price: 50000,
            description: "Descripción opcional del producto."
          }
        ]
      },
      {
        type: "form",
        fields: [
          {
            name: "name",
            label: "Nombre completo",
            inputType: "text",
            required: true,
            placeholder: "Ej: Juan Pérez"
          },
          {
            name: "email",
            label: "Correo electrónico",
            inputType: "email",
            required: true,
            placeholder: "Ej: juan@correo.com"
          },
          {
            name: "notes",
            label: "Mensaje (opcional)",
            inputType: "textarea",
            required: false,
            placeholder: "Escribe aquí cualquier detalle adicional..."
          }
        ]
      },
      {
        type: "button",
        label: "Enviar Cotización",
        action: { type: "submit" }
      }
    ]
  };

  const token = generateToken();
  const now = Date.now();

  runtimeLinks.set(token, {
    token,
    config: demoConfig,
    createdAt: now,
    expiresAt: now + 15 * 60 * 1000,
    status: "active",
    submissions: [],
  });

  return res.json({
    ok: true,
    token,
    url: `${BASE_URL}/v/${token}`,
    expiresAt: new Date(now + 15 * 60 * 1000).toISOString(),
  });
});

function createRuntimeRecord(config: ViewConfig, expiresInMinutes = 15): RuntimeLinkRecord {
  const token = generateToken();
  const now = Date.now();

  const record: RuntimeLinkRecord = {
    token,
    config,
    createdAt: now,
    expiresAt: now + expiresInMinutes * 60 * 1000,
    status: "active",
    submissions: [],
  };

  runtimeLinks.set(token, record);
  return record;
}

function buildCotizadorConfig(leadId: string): ViewConfig {
  return {
    brand: "Automatiza Fácil",
    title: "Cotización Inteligente",
    subtitle: "Selecciona productos y envía tu solicitud.",
    successMessage: "Solicitud enviada correctamente.",
    recipientPhone: leadId,
    components: [
      {
        type: "products",
        items: [
          {
            id: "p1",
            name: "Bot de Cotización",
            price: 120000,
            description: "Automatiza cotizaciones por chat y genera propuestas.",
          },
          {
            id: "p2",
            name: "Generación de PDF",
            price: 60000,
            description: "Crea cotizaciones en PDF listas para enviar.",
          },
          {
            id: "p3",
            name: "Integración WhatsApp",
            price: 80000,
            description: "Conecta el flujo de cotización con WhatsApp.",
          },
        ],
      },
      {
        type: "form",
        fields: [
          {
            name: "name",
            label: "Nombre completo",
            inputType: "text",
            required: true,
            placeholder: "Ej: Juan Pérez",
          },
          {
            name: "email",
            label: "Correo electrónico",
            inputType: "email",
            required: true,
            placeholder: "Ej: juan@correo.com",
          },
          {
            name: "phone",
            label: "Teléfono",
            inputType: "tel",
            required: false,
            placeholder: "Ej: +56 9 1234 5678",
          },
          {
            name: "notes",
            label: "Mensaje (opcional)",
            inputType: "textarea",
            required: false,
            placeholder: `Lead: ${leadId}`,
          },
        ],
      },
      {
        type: "button",
        label: "Enviar Cotización",
        action: { type: "submit" },
      },
    ],
  };
}

function buildReservasConfig(leadId: string): ViewConfig {
  return {
    brand: "Automatiza Fácil",
    title: "Toma de Horas",
    subtitle: "Prueba una experiencia de reservas por WhatsApp.",
    successMessage: "Solicitud enviada correctamente.",
    recipientPhone: leadId,
    components: [
      {
        type: "products",
        items: [
          {
            id: "r1",
            name: "Agenda Básica",
            price: 90000,
            description: "Sistema de reservas para tomar horas.",
          },
          {
            id: "r2",
            name: "Recordatorios",
            price: 40000,
            description: "Reduce inasistencias con recordatorios automáticos.",
          },
          {
            id: "r3",
            name: "Reservas por WhatsApp",
            price: 70000,
            description: "Tus clientes reservan directamente desde el chat.",
          },
        ],
      },
      {
        type: "form",
        fields: [
          {
            name: "name",
            label: "Nombre completo",
            inputType: "text",
            required: true,
            placeholder: "Ej: María González",
          },
          {
            name: "email",
            label: "Correo electrónico",
            inputType: "email",
            required: true,
            placeholder: "Ej: maria@correo.com",
          },
          {
            name: "notes",
            label: "Mensaje (opcional)",
            inputType: "textarea",
            required: false,
            placeholder: `Lead: ${leadId}`,
          },
        ],
      },
      {
        type: "button",
        label: "Solicitar Demo",
        action: { type: "submit" },
      },
    ],
  };
}

function buildChatbotConfig(leadId: string): ViewConfig {
  return {
    brand: "Automatiza Fácil",
    title: "Chatbot Inteligente",
    subtitle: "Descubre cómo automatizar respuestas y atención.",
    successMessage: "Solicitud enviada correctamente.",
    recipientPhone: leadId,
    components: [
      {
        type: "products",
        items: [
          {
            id: "c1",
            name: "Chatbot Base",
            price: 100000,
            description: "Responde consultas frecuentes automáticamente.",
          },
          {
            id: "c2",
            name: "Captura de Leads",
            price: 50000,
            description: "Recoge datos de clientes dentro del chat.",
          },
          {
            id: "c3",
            name: "Soporte Automatizado",
            price: 85000,
            description: "Ordena consultas y mejora la atención.",
          },
        ],
      },
      {
        type: "form",
        fields: [
          {
            name: "name",
            label: "Nombre completo",
            inputType: "text",
            required: true,
            placeholder: "Ej: Pedro Soto",
          },
          {
            name: "email",
            label: "Correo electrónico",
            inputType: "email",
            required: true,
            placeholder: "Ej: pedro@correo.com",
          },
          {
            name: "notes",
            label: "Mensaje (opcional)",
            inputType: "textarea",
            required: false,
            placeholder: `Lead: ${leadId}`,
          },
        ],
      },
      {
        type: "button",
        label: "Solicitar Información",
        action: { type: "submit" },
      },
    ],
  };
}

app.get("/open/cotizador/:leadId", (req: Request<{ leadId: string }>, res: Response) => {
  const { leadId } = req.params;
  const record = createRuntimeRecord(buildCotizadorConfig(leadId), 15);
  return res.redirect(`/v/${record.token}`);
});

app.get("/open/reservas/:leadId", (req: Request<{ leadId: string }>, res: Response) => {
  const { leadId } = req.params;
  const record = createRuntimeRecord(buildReservasConfig(leadId), 15);
  return res.redirect(`/v/${record.token}`);
});

app.get("/open/chatbot/:leadId", (req: Request<{ leadId: string }>, res: Response) => {
  const { leadId } = req.params;
  const record = createRuntimeRecord(buildChatbotConfig(leadId), 15);
  return res.redirect(`/v/${record.token}`);
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en ${BASE_URL}`);
  console.log(`Demo disponible en: ${BASE_URL}/demo/create`);
});