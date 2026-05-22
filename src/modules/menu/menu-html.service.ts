import { RuntimeLinkRecord } from "../../types/runtime";
import { escapeHtml } from "../../utils/html";

export function renderMenuHtml(record: RuntimeLinkRecord): string {
  const safeTitle = escapeHtml(record.config.title || "Menú de servicios");
  const safeBrand = escapeHtml(record.config.brand || "Amaru Electric");
  const safeSubtitle = escapeHtml(
    record.config.subtitle || "Selecciona el módulo que quieres utilizar."
  );

  const modules = record.config.modules || [];

  const cardsHtml = modules
    .map((module, index) => {
      const title = escapeHtml(module.title);
      const description = escapeHtml(module.description);
      const icon = escapeHtml(module.icon || "•");
      const url = escapeHtml(module.url || "#");
      const isEnabled = Boolean(module.enabled);

      const tagText = isEnabled ? "Activo" : "No disponible";
      const cardClass = isEnabled ? "module-card" : "module-card module-card-disabled";
      const href = isEnabled ? url : "#";
      const loadingAttr = isEnabled ? `data-loading-link="true"` : `aria-disabled="true"`;

      return `
        <a
          class="${cardClass}"
          href="${href}"
          style="--delay: ${index * 55}ms;"
          ${loadingAttr}
        >
          <div class="module-header">
            <div class="module-icon">${icon}</div>
            <div class="${isEnabled ? "module-status active" : "module-status inactive"}">
              <span></span>
              ${tagText}
            </div>
          </div>

          <div class="module-content">
            <div class="module-title">${title}</div>
            <div class="module-description">${description}</div>
          </div>

          <div class="module-footer">
            <span>${isEnabled ? "Ingresar" : "Próximamente"}</span>
            <div class="module-arrow">→</div>
          </div>
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

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

  <link
    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
    rel="stylesheet"
  />

  <style>
    :root {
  --bg: #121318;
  --surface: #0f1117;
  --surface-soft: #15171d;
  --surface-muted: #1b1d24;

  --text: #f1f3f4;
  --muted: #c8cbd2;
  --muted-soft: #90949d;

  --primary: #c7d2ff;
  --primary-strong: #aebcff;
  --primary-soft: rgba(199, 210, 255, 0.12);

  --green: #81c995;
  --green-soft: rgba(129, 201, 149, 0.12);

  --red: #f28b82;
  --red-soft: rgba(242, 139, 130, 0.12);

  --border: rgba(231, 234, 240, 0.18);
  --border-hover: rgba(199, 210, 255, 0.30);

  --shadow-card: 0 20px 48px rgba(0, 0, 0, 0.26);
}
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
      font-family: "Google Sans", "Inter", "Segoe UI", sans-serif;
      color: var(--text);
      background: var(--bg);
      -webkit-font-smoothing: antialiased;
      overflow-x: hidden;
    }

    .app-loader {
      position: fixed;
      inset: 0;
      z-index: 99999;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(32, 33, 36, 0.78);
      backdrop-filter: blur(10px);
      transition: opacity 160ms ease, visibility 160ms ease;
    }

    .app-loader.hidden {
      opacity: 0;
      visibility: hidden;
      pointer-events: none;
    }

    .app-spinner {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      border: 3px solid rgba(199, 210, 255, 0.18);
      border-top-color: var(--primary);
      animation: spin 760ms linear infinite;
    }

    .page {
      min-height: 100vh;
      padding: 18px 14px 32px;
    }

    .shell {
      width: 100%;
      max-width: 620px;
      margin: 0 auto;
      animation: pageIn 360ms ease both;
    }

    .brand-header {
      min-height: 74px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 22px;
    }

    .brand-pill {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      min-height: 46px;
      padding: 10px 18px;
      border-radius: 999px;
      background: rgba(15, 17, 23, 0.72);
      border: 1px solid rgba(255, 255, 255, 0.08);
      box-shadow: 0 16px 34px rgba(0, 0, 0, 0.20);
    }

    .brand-dot {
      width: 9px;
      height: 9px;
      border-radius: 999px;
      background: var(--green);
      box-shadow: 0 0 18px rgba(129, 201, 149, 0.70);
    }

    .brand-name {
      max-width: 300px;
      color: var(--text);
      font-size: 18px;
      font-weight: 700;
      letter-spacing: -0.035em;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .hero {
      text-align: center;
      padding: 16px 10px 34px;
    }

    h1 {
      margin: 0 auto;
      max-width: 520px;
      font-size: 42px;
      line-height: 1.05;
      letter-spacing: -0.065em;
      font-weight: 700;
      color: var(--text);
      text-wrap: balance;
    }

    .subtitle {
      margin: 18px auto 0;
      max-width: 500px;
      color: var(--primary);
      font-size: 16px;
      font-weight: 500;
      line-height: 1.5;
      text-wrap: balance;
    }

    .section-title {
      margin: 0 4px 16px;
      font-size: 24px;
      line-height: 1.1;
      letter-spacing: -0.045em;
      font-weight: 700;
      color: var(--text);
    }

    .modules {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 14px;
    }

    .module-card {
      position: relative;
      min-height: 176px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 18px;
      border-radius: var(--radius-lg);
      background: var(--surface);
      border: 1px solid var(--border);
      box-shadow: var(--shadow-card);
      color: inherit;
      text-decoration: none;
      opacity: 0;
      transform: translateY(10px);
      animation: cardIn 380ms ease both;
      animation-delay: var(--delay);
      transition:
        transform 160ms ease,
        border-color 160ms ease,
        background 160ms ease,
        opacity 160ms ease;
    }

    .module-card:hover {
      transform: translateY(-2px);
      border-color: var(--border-hover);
      background: var(--surface-soft);
    }

    .module-card-disabled {
      opacity: 0.62;
      cursor: not-allowed;
    }

    .module-card-disabled:hover {
      transform: none;
      border-color: var(--border);
      background: var(--surface);
    }

    .module-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 18px;
    }

    .module-icon {
      width: 48px;
      height: 48px;
      border-radius: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 23px;
      background: var(--primary-soft);
      border: 1px solid rgba(199, 210, 255, 0.14);
    }

    .module-status {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 9px;
      border-radius: 999px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: -0.01em;
      white-space: nowrap;
    }

    .module-status span {
      width: 7px;
      height: 7px;
      border-radius: 999px;
    }

    .module-status.active {
      color: var(--green);
      background: var(--green-soft);
      border: 1px solid rgba(129, 201, 149, 0.16);
    }

    .module-status.active span {
      background: var(--green);
      box-shadow: 0 0 12px rgba(129, 201, 149, 0.72);
    }

    .module-status.inactive {
      color: var(--red);
      background: var(--red-soft);
      border: 1px solid rgba(242, 139, 130, 0.16);
    }

    .module-status.inactive span {
      background: var(--red);
    }

    .module-title {
      font-size: 18px;
      line-height: 1.12;
      font-weight: 650;
      letter-spacing: -0.04em;
      color: var(--text);
      margin-bottom: 8px;
    }

    .module-description {
      font-size: 13px;
      font-weight: 400;
      line-height: 1.4;
      color: var(--muted);
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .module-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      margin-top: 20px;
      color: var(--primary);
      font-size: 13px;
      font-weight: 700;
    }

    .module-arrow {
      width: 32px;
      height: 32px;
      border-radius: 999px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--primary);
      font-size: 20px;
      font-weight: 700;
      background: rgba(199, 210, 255, 0.08);
      border: 1px solid rgba(199, 210, 255, 0.12);
      transition: transform 160ms ease;
    }

    .module-card:hover .module-arrow {
      transform: translateX(2px);
    }

    .module-card-disabled .module-footer,
    .module-card-disabled .module-arrow {
      color: var(--muted-soft);
    }

    .empty {
      grid-column: 1 / -1;
      padding: 28px 18px;
      text-align: center;
      color: var(--muted);
      font-size: 14px;
      line-height: 1.45;
      border-radius: var(--radius-lg);
      background: var(--surface);
      border: 1px solid var(--border);
    }

    .notice-card {
      margin-top: 18px;
      padding: 18px;
      border-radius: var(--radius-lg);
      background: #1d1f27;
      border: 1px solid var(--border);
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .notice-icon {
      width: 42px;
      height: 42px;
      border-radius: 16px;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--primary);
      background: rgba(199, 210, 255, 0.10);
      border: 1px solid rgba(199, 210, 255, 0.12);
      font-size: 20px;
    }

    .notice-title {
      font-size: 14px;
      font-weight: 650;
      color: var(--text);
      margin-bottom: 4px;
    }

    .notice-text {
      font-size: 13px;
      line-height: 1.35;
      color: var(--muted-soft);
    }

    .footer {
      margin-top: 24px;
      padding-bottom: 12px;
      text-align: center;
      color: var(--muted-soft);
      font-size: 12px;
    }

    .footer strong {
      color: var(--primary);
      font-weight: 700;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    @keyframes pageIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes cardIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }

      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @media (max-width: 560px) {
      .page {
        padding: 12px 12px 28px;
      }

      .brand-header {
        min-height: 66px;
        margin-bottom: 18px;
      }

      .hero {
        padding: 14px 4px 30px;
      }

      h1 {
        font-size: 36px;
      }

      .subtitle {
        font-size: 15px;
      }

      .modules {
        gap: 12px;
      }

      .module-card {
        min-height: 168px;
        padding: 16px;
      }

      .module-title {
        font-size: 17px;
      }

      .module-description {
        font-size: 12.5px;
      }

      .module-status {
        font-size: 10.5px;
        padding: 5px 8px;
      }
    }

    @media (max-width: 390px) {
      h1 {
        font-size: 32px;
      }

      .modules {
        grid-template-columns: 1fr;
      }

      .module-card {
        min-height: 142px;
      }
    }
  </style>
</head>

<body>
  <div id="appLoader" class="app-loader hidden">
    <div class="app-spinner"></div>
  </div>

  <main class="page">
    <div class="shell">
      <header class="brand-header">
        <div class="brand-pill">
          <span class="brand-dot"></span>
          <span class="brand-name">${safeBrand}</span>
        </div>
      </header>

      <section class="hero">
        <h1>${safeTitle}</h1>

        <p class="subtitle">
          ${safeSubtitle}
        </p>
      </section>

      <h2 class="section-title">
        Elige un servicio
      </h2>

      <section class="modules">
        ${
          cardsHtml ||
          `<div class="empty">No hay módulos configurados por el momento.</div>`
        }
      </section>

      <section class="notice-card">
        <div class="notice-icon">🔒</div>

        <div>
          <div class="notice-title">
            Acceso seguro
          </div>

          <div class="notice-text">
            Este enlace fue generado para acceder rápidamente a los servicios disponibles.
          </div>
        </div>
      </section>

      <footer class="footer">
        Desarrollado por <strong>Automatiza Fácil</strong>
      </footer>
    </div>
  </main>

  <script>
    window.AppLoader = {
      show() {
        const loader = document.getElementById("appLoader");

        if (loader) {
          loader.classList.remove("hidden");
        }
      },

      hide() {
        const loader = document.getElementById("appLoader");

        if (loader) {
          loader.classList.add("hidden");
        }
      }
    };

    function bindLoadingLinks() {
      document.querySelectorAll("[data-loading-link]").forEach((link) => {
        link.addEventListener("click", () => {
          window.AppLoader.show();
        });
      });
    }

    document.addEventListener("DOMContentLoaded", () => {
      window.AppLoader.hide();
      bindLoadingLinks();
    });

    window.addEventListener("pageshow", () => {
      window.AppLoader.hide();
    });

    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        window.AppLoader.hide();
      }
    });
  </script>
</body>
</html>`;
}