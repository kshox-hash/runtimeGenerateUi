import { RuntimeLinkRecord } from "../../types/runtime";
import { escapeHtml } from "../../utils/html";

export function renderMenuHtml(record: RuntimeLinkRecord): string {
  const safeTitle = escapeHtml(record.config.title || "Menú de servicios");
  const safeBrand = escapeHtml(record.config.brand || "Automatiza Fácil");
  const safeSubtitle = escapeHtml(
    record.config.subtitle || "Selecciona el módulo que quieres utilizar."
  );

  const modules = record.config.modules || [];

  const cardsHtml = modules
    .filter((module) => module.enabled)
    .map((module) => {
      const title = escapeHtml(module.title);
      const description = escapeHtml(module.description);
      const icon = escapeHtml(module.icon || "🔹");
      const url = escapeHtml(module.url || "#");

      return `
        <a class="module-card" href="${url}">
          <div class="module-icon">${icon}</div>
          <div class="module-content">
            <div class="module-title">${title}</div>
            <div class="module-description">${description}</div>
          </div>
          <div class="module-arrow">›</div>
        </a>
      `;
    })
    .join("");

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
      --text: #0f172a;
      --muted: #667085;
      --border: #dde3ea;
      --shadow: 0 10px 28px rgba(15, 23, 42, 0.08);
      --radius-xl: 22px;
      --radius-lg: 16px;
      --accent: #1a6fe8;
      --accent-soft: #e8f0fd;
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
      min-height: 100vh;
      font-family: Inter, Arial, Helvetica, sans-serif;
      background: var(--bg);
      color: var(--text);
      -webkit-font-smoothing: antialiased;
    }

    .page {
      min-height: 100vh;
      padding: 26px 12px 36px;
    }

    .shell {
      max-width: 560px;
      margin: 0 auto;
    }

    .hero {
      text-align: center;
      margin-bottom: 18px;
    }

    .brand-row {
      display: inline-flex;
      align-items: center;
      gap: 12px;
      color: #6b7280;
      font-size: 14px;
      font-weight: 700;
      margin-bottom: 10px;
    }

    .brand-line {
      width: 34px;
      height: 1px;
      background: #b8c0cc;
    }

    h1 {
      margin: 0;
      font-size: 34px;
      line-height: 1.05;
      letter-spacing: -0.03em;
      color: var(--text);
    }

    .subtitle {
      margin: 10px auto 0;
      max-width: 440px;
      color: var(--muted);
      font-size: 15px;
      line-height: 1.45;
    }

    .card {
      background: var(--panel);
      border: 1px solid rgba(15, 23, 42, 0.05);
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow);
      padding: 14px;
    }

    .modules {
      display: grid;
      gap: 12px;
    }

    .module-card {
      display: grid;
      grid-template-columns: 48px minmax(0, 1fr) 28px;
      align-items: center;
      gap: 12px;
      padding: 14px;
      border-radius: var(--radius-lg);
      border: 1px solid var(--border);
      background: #fff;
      color: inherit;
      text-decoration: none;
      transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
    }

    .module-card:hover {
      transform: translateY(-1px);
      border-color: #b8c0cc;
      box-shadow: 0 8px 20px rgba(15, 23, 42, 0.08);
    }

    .module-icon {
      width: 48px;
      height: 48px;
      border-radius: 14px;
      background: var(--accent-soft);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
    }

    .module-content {
      min-width: 0;
    }

    .module-title {
      font-size: 16px;
      font-weight: 850;
      margin-bottom: 4px;
      color: var(--text);
    }

    .module-description {
      font-size: 13px;
      line-height: 1.35;
      color: var(--muted);
    }

    .module-arrow {
      width: 28px;
      height: 28px;
      border-radius: 999px;
      background: var(--accent);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 26px;
      line-height: 1;
      padding-bottom: 3px;
    }

    .footer {
      margin-top: 14px;
      text-align: center;
      font-size: 12px;
      line-height: 1.45;
      color: var(--muted);
    }

    @media (max-width: 480px) {
      .page {
        padding: 20px 8px 28px;
      }

      h1 {
        font-size: 28px;
      }

      .subtitle {
        font-size: 14px;
      }

      .card {
        padding: 12px;
        border-radius: 18px;
      }

      .module-card {
        grid-template-columns: 44px minmax(0, 1fr) 26px;
        padding: 12px;
      }

      .module-icon {
        width: 44px;
        height: 44px;
        font-size: 22px;
      }
    }
  </style>
</head>

<body>
  <main class="page">
    <div class="shell">
      <section class="hero">
        <div class="brand-row">
          <span class="brand-line"></span>
          <span>${safeBrand}</span>
          <span class="brand-line"></span>
        </div>

        <h1>${safeTitle}</h1>
        <p class="subtitle">${safeSubtitle}</p>
      </section>

      <section class="card">
        <div class="modules">
          ${
            cardsHtml ||
            `<div class="footer">No hay módulos disponibles por el momento.</div>`
          }
        </div>
      </section>

      <div class="footer">
        Acceso seguro generado para tu atención.
      </div>
    </div>
  </main>
</body>
</html>`;
}