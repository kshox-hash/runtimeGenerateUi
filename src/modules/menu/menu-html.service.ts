import { RuntimeLinkRecord } from "../../types/runtime";
import { escapeHtml } from "../../utils/html";

export function renderMenuHtml(record: RuntimeLinkRecord): string {
  const safeTitle = escapeHtml(record.config.title || "Menú de servicios");
  const safeBrand = escapeHtml(record.config.brand || "Amaru Electric");
  const safeSubtitle = escapeHtml(
    record.config.subtitle || "Selecciona el módulo que quieres utilizar."
  );

  const modules = record.config.modules || [];

  const rowsHtml = modules
    .map((module, index) => {
      const title = escapeHtml(module.title);
      const description = escapeHtml(module.description);
      const url = escapeHtml(module.url || "#");
      const isEnabled = Boolean(module.enabled);

      const href = isEnabled ? url : "#";
      const rowClass = isEnabled ? "module-row" : "module-row module-row-disabled";
      const loadingAttr = isEnabled ? `data-loading-link="true"` : `aria-disabled="true"`;

      return `
        <a
          class="${rowClass}"
          href="${href}"
          style="--delay: ${index * 45}ms;"
          ${loadingAttr}
        >
          <div class="module-content">
            <div class="module-title-line">
              <span class="module-title">${title}</span>
              <span class="${isEnabled ? "status active" : "status inactive"}">
                ${isEnabled ? "Activo" : "No disponible"}
              </span>
            </div>

            <div class="module-description">
              ${description}
            </div>
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
      --bg-soft: #17181f;

      --text: #f1f3f4;
      --muted: #c8cbd2;
      --muted-soft: #90949d;

      --line: rgba(231, 234, 240, 0.34);
      --line-soft: rgba(231, 234, 240, 0.18);

      --accent: #c7d2ff;
      --accent-soft: rgba(199, 210, 255, 0.12);

      --active: #81c995;
      --inactive: #f28b82;

      --brand-shadow:
        0 1px 0 rgba(255, 255, 255, 0.14),
        0 12px 36px rgba(199, 210, 255, 0.14);

      --radius: 22px;
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
      background: rgba(18, 19, 24, 0.82);
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
      border-top-color: var(--accent);
      animation: spin 760ms linear infinite;
    }

    .page {
      min-height: 100vh;
      padding: 18px 0 36px;
    }

    .shell {
      width: 100%;
      max-width: 620px;
      margin: 0 auto;
      animation: pageIn 360ms ease both;
    }

    .brand-header {
      height: 74px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 24px;
    }

    .brand-name {
      max-width: 100%;
      color: var(--text);
      font-size: 28px;
      line-height: 1.1;
      font-weight: 650;
      letter-spacing: -0.055em;
      text-align: center;
      text-shadow: var(--brand-shadow);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .hero {
      min-height: 430px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 24px 34px 42px;
      text-align: center;
    }

    .visual {
      width: min(340px, 78vw);
      height: min(260px, 58vw);
      position: relative;
      margin-bottom: 44px;
    }

    .sun {
      position: absolute;
      left: 20px;
      top: 8px;
      width: 150px;
      height: 150px;
      border-radius: 999px;
      background: #ffd966;
    }

    .frame {
      position: absolute;
      left: 70px;
      top: 62px;
      width: 230px;
      height: 150px;
      border: 2px solid #c7cbe0;
    }

    .camera {
      position: absolute;
      right: -58px;
      top: 32px;
      width: 72px;
      height: 98px;
      border: 2px solid #c7cbe0;
      clip-path: polygon(0 35%, 100% 0, 100% 100%, 0 65%);
      opacity: 0.95;
    }

    .person {
      position: absolute;
      left: 125px;
      top: 100px;
      width: 120px;
      height: 96px;
      border-radius: 999px 999px 24px 24px;
      background: #eef1ff;
      transform: rotate(8deg);
    }

    .person::before {
      content: "";
      position: absolute;
      right: 8px;
      top: -38px;
      width: 28px;
      height: 42px;
      border-radius: 999px 999px 8px 8px;
      background: #ff8a75;
      transform: rotate(-8deg);
    }

    .legs {
      position: absolute;
      left: 86px;
      top: 175px;
      width: 180px;
      height: 34px;
      background: #ffffff;
      border-radius: 999px;
      transform: rotate(8deg);
    }

    .cat {
      position: absolute;
      right: 40px;
      top: 160px;
      width: 90px;
      height: 34px;
      border-radius: 999px 999px 10px 10px;
      background: #f8d76a;
      transform: rotate(3deg);
    }

    .cat::after {
      content: "";
      position: absolute;
      right: 4px;
      top: -18px;
      width: 26px;
      height: 26px;
      border-radius: 999px;
      background: #f8d76a;
    }

    .shape-red {
      position: absolute;
      left: 30px;
      bottom: 28px;
      width: 48px;
      height: 48px;
      border-left: 24px solid #ff8f86;
      border-bottom: 24px solid #ff8f86;
    }

    .shape-green {
      position: absolute;
      right: 108px;
      top: 48px;
      width: 28px;
      height: 28px;
      background: #81c995;
      box-shadow: 0 16px 0 #81c995;
      opacity: 0.9;
    }

    .hero-copy {
      max-width: 430px;
      color: var(--muted);
      font-size: 18px;
      font-weight: 400;
      line-height: 1.6;
      letter-spacing: -0.02em;
    }

    .hero-copy strong {
      display: block;
      margin-bottom: 12px;
      color: var(--text);
      font-size: 28px;
      line-height: 1.15;
      font-weight: 650;
      letter-spacing: -0.055em;
    }

    .subtitle {
      margin: 0;
      color: var(--muted);
    }

    .modules {
      border-top: 1px solid var(--line);
      border-bottom: 1px solid var(--line);
    }

    .module-row {
      min-height: 86px;
      display: flex;
      align-items: center;
      padding: 16px 36px;
      color: inherit;
      text-decoration: none;
      border-bottom: 1px solid var(--line);
      opacity: 0;
      transform: translateY(8px);
      animation: rowIn 340ms ease both;
      animation-delay: var(--delay);
      transition:
        background 150ms ease,
        opacity 150ms ease;
    }

    .module-row:last-child {
      border-bottom: 0;
    }

    .module-row:hover {
      background: rgba(199, 210, 255, 0.045);
    }

    .module-row-disabled {
      opacity: 0.54;
      cursor: not-allowed;
    }

    .module-row-disabled:hover {
      background: transparent;
    }

    .module-content {
      width: 100%;
      min-width: 0;
    }

    .module-title-line {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 5px;
    }

    .module-title {
      min-width: 0;
      color: var(--accent);
      font-size: 20px;
      line-height: 1.15;
      font-weight: 650;
      letter-spacing: -0.035em;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .module-description {
      color: var(--muted);
      font-size: 14px;
      line-height: 1.35;
      font-weight: 400;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .status {
      flex-shrink: 0;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 5px 9px;
      border-radius: 999px;
      font-size: 11px;
      font-weight: 650;
      letter-spacing: -0.01em;
    }

    .status::before {
      content: "";
      width: 7px;
      height: 7px;
      border-radius: 999px;
    }

    .status.active {
      color: var(--active);
      background: rgba(129, 201, 149, 0.10);
    }

    .status.active::before {
      background: var(--active);
      box-shadow: 0 0 12px rgba(129, 201, 149, 0.72);
    }

    .status.inactive {
      color: var(--inactive);
      background: rgba(242, 139, 130, 0.10);
    }

    .status.inactive::before {
      background: var(--inactive);
    }

    .empty {
      padding: 28px 36px;
      color: var(--muted);
      font-size: 14px;
      line-height: 1.45;
      text-align: center;
    }

    .footer {
      padding: 24px 36px 0;
      text-align: center;
      color: var(--muted-soft);
      font-size: 12px;
      line-height: 1.4;
    }

    .footer strong {
      color: var(--accent);
      font-weight: 650;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    @keyframes pageIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes rowIn {
      from {
        opacity: 0;
        transform: translateY(8px);
      }

      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @media (max-width: 560px) {
      .page {
        padding-top: 10px;
      }

      .brand-header {
        height: 66px;
        padding: 0 20px;
      }

      .brand-name {
        font-size: 26px;
      }

      .hero {
        min-height: 430px;
        padding: 18px 26px 38px;
      }

      .visual {
        margin-bottom: 38px;
      }

      .hero-copy {
        font-size: 17px;
      }

      .hero-copy strong {
        font-size: 27px;
      }

      .module-row {
        min-height: 82px;
        padding: 15px 28px;
      }

      .module-title {
        font-size: 19px;
      }

      .module-description {
        font-size: 13.5px;
      }

      .status {
        font-size: 10.5px;
      }
    }

    @media (max-width: 390px) {
      .brand-name {
        font-size: 24px;
      }

      .hero {
        min-height: 400px;
        padding-left: 22px;
        padding-right: 22px;
      }

      .visual {
        width: 300px;
        height: 230px;
        transform: scale(0.92);
        margin-bottom: 28px;
      }

      .hero-copy strong {
        font-size: 25px;
      }

      .module-row {
        padding-left: 22px;
        padding-right: 22px;
      }

      .module-title-line {
        align-items: flex-start;
        flex-direction: column;
        gap: 6px;
      }

      .module-description {
        white-space: normal;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
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
        <div class="brand-name">${safeBrand}</div>
      </header>

      <section class="hero">
        <div class="visual" aria-hidden="true">
          <div class="sun"></div>
          <div class="frame">
            <div class="camera"></div>
          </div>
          <div class="person"></div>
          <div class="legs"></div>
          <div class="cat"></div>
          <div class="shape-red"></div>
          <div class="shape-green"></div>
        </div>

        <div class="hero-copy">
          <strong>${safeTitle}</strong>
          <p class="subtitle">${safeSubtitle}</p>
        </div>
      </section>

      <section class="modules">
        ${
          rowsHtml ||
          `<div class="empty">No hay módulos configurados por el momento.</div>`
        }
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