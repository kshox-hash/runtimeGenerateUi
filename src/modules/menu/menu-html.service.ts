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
    .map((module, index) => {
      const title = escapeHtml(module.title);
      const description = escapeHtml(module.description);
      const icon = escapeHtml(module.icon || "🔹");
      const url = escapeHtml(module.url || "#");

      return `
        <a class="module-card" href="${url}" style="--delay: ${index * 90}ms;">
          <div class="module-glow"></div>

          <div class="module-icon-wrap">
            <div class="module-icon">${icon}</div>
          </div>

          <div class="module-content">
            <div class="module-kicker">Módulo disponible</div>
            <div class="module-title">${title}</div>
            <div class="module-description">${description}</div>
          </div>

          <div class="module-action">
            <span>Entrar</span>
            <div class="module-arrow">›</div>
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

  <style>
    :root {
      --bg: #eef2f7;
      --panel: rgba(255, 255, 255, 0.82);
      --panel-solid: #ffffff;
      --text: #0f172a;
      --muted: #64748b;
      --muted-soft: #94a3b8;
      --border: rgba(148, 163, 184, 0.28);
      --accent: #2563eb;
      --accent-dark: #1e40af;
      --accent-soft: #dbeafe;
      --shadow: 0 24px 70px rgba(15, 23, 42, 0.14);
      --shadow-card: 0 16px 34px rgba(15, 23, 42, 0.08);
      --radius-xl: 28px;
      --radius-lg: 22px;
      --radius-md: 16px;
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

    .page {
      position: relative;
      min-height: 100vh;
      padding: 30px 14px 42px;
    }

    .shell {
      max-width: 620px;
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
      max-width: 470px;
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

    .modules {
      position: relative;
      z-index: 1;
      display: grid;
      gap: 12px;
    }

    .module-card {
      position: relative;
      display: grid;
      grid-template-columns: 58px minmax(0, 1fr);
      gap: 13px;
      align-items: center;
      min-height: 112px;
      padding: 16px;
      border-radius: var(--radius-lg);
      border: 1px solid var(--border);
      background:
        linear-gradient(180deg, rgba(255,255,255,0.96), rgba(248,250,252,0.90));
      color: inherit;
      text-decoration: none;
      box-shadow: var(--shadow-card);
      overflow: hidden;
      opacity: 0;
      transform: translateY(14px) scale(0.985);
      animation: cardIn 520ms cubic-bezier(.2,.8,.2,1) both;
      animation-delay: var(--delay);
      transition:
        transform 180ms ease,
        box-shadow 180ms ease,
        border-color 180ms ease,
        background 180ms ease;
    }

    .module-card:hover {
      transform: translateY(-3px) scale(1.005);
      border-color: rgba(37, 99, 235, 0.34);
      box-shadow: 0 22px 44px rgba(15, 23, 42, 0.13);
      background:
        linear-gradient(180deg, rgba(255,255,255,1), rgba(248,250,252,0.98));
    }

    .module-card:active {
      transform: translateY(-1px) scale(0.995);
    }

    .module-glow {
      position: absolute;
      top: -45px;
      right: -45px;
      width: 120px;
      height: 120px;
      border-radius: 999px;
      background: radial-gradient(circle, rgba(37,99,235,0.16), transparent 65%);
      opacity: 0;
      transition: opacity 180ms ease;
    }

    .module-card:hover .module-glow {
      opacity: 1;
    }

    .module-icon-wrap {
      position: relative;
      width: 58px;
      height: 58px;
      border-radius: 18px;
      background:
        linear-gradient(145deg, #eaf1ff, #ffffff);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow:
        inset 0 1px 0 rgba(255,255,255,0.9),
        0 10px 22px rgba(37, 99, 235, 0.13);
    }

    .module-icon {
      font-size: 28px;
      transform: translateY(1px);
    }

    .module-content {
      min-width: 0;
      padding-right: 74px;
    }

    .module-kicker {
      display: inline-flex;
      margin-bottom: 5px;
      padding: 3px 8px;
      border-radius: 999px;
      background: var(--accent-soft);
      color: var(--accent-dark);
      font-size: 10px;
      font-weight: 850;
      letter-spacing: 0.02em;
      text-transform: uppercase;
    }

    .module-title {
      font-size: 17px;
      font-weight: 900;
      letter-spacing: -0.025em;
      margin-bottom: 5px;
      color: var(--text);
    }

    .module-description {
      font-size: 13px;
      line-height: 1.38;
      color: var(--muted);
    }

    .module-action {
      position: absolute;
      right: 14px;
      top: 50%;
      transform: translateY(-50%);
      display: inline-flex;
      align-items: center;
      gap: 7px;
      color: var(--accent);
      font-size: 12px;
      font-weight: 850;
    }

    .module-arrow {
      width: 30px;
      height: 30px;
      border-radius: 999px;
      background: var(--accent);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 26px;
      line-height: 1;
      padding-bottom: 3px;
      box-shadow: 0 10px 20px rgba(37, 99, 235, 0.28);
      transition: transform 180ms ease;
    }

    .module-card:hover .module-arrow {
      transform: translateX(2px);
    }

    .empty {
      padding: 28px 18px;
      text-align: center;
      color: var(--muted);
      font-size: 14px;
      line-height: 1.45;
    }

    .footer {
      margin-top: 15px;
      text-align: center;
      font-size: 12px;
      line-height: 1.45;
      color: var(--muted);
      animation: fadeUp 700ms ease both;
      animation-delay: 260ms;
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

    @keyframes pageIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
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

    @media (max-width: 520px) {
      .page {
        padding: 22px 8px 30px;
      }

      h1 {
        font-size: 32px;
      }

      .subtitle {
        font-size: 14px;
      }

      .panel {
        padding: 11px;
        border-radius: 22px;
      }

      .module-card {
        grid-template-columns: 52px minmax(0, 1fr);
        min-height: 108px;
        padding: 14px;
        gap: 11px;
      }

      .module-icon-wrap {
        width: 52px;
        height: 52px;
        border-radius: 16px;
      }

      .module-icon {
        font-size: 25px;
      }

      .module-content {
        padding-right: 52px;
      }

      .module-action span {
        display: none;
      }

      .module-arrow {
        width: 28px;
        height: 28px;
      }

      .module-title {
        font-size: 16px;
      }

      .module-description {
        font-size: 12.5px;
      }
    }
  </style>
</head>

<body>
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
        <div class="modules">
          ${
            cardsHtml ||
            `<div class="empty">No hay módulos disponibles por el momento.</div>`
          }
        </div>
      </section>

      <div class="footer">
        <div class="secure-row">
          <span>🔒</span>
          <span>Acceso seguro generado para tu atención</span>
        </div>
      </div>
    </div>
  </main>
</body>
</html>`;
}