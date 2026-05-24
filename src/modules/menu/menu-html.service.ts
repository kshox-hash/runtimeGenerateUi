import { RuntimeLinkRecord } from "../../types/runtime";
import { escapeHtml } from "../../utils/html";

export function renderMenuHtml(record: RuntimeLinkRecord): string {
  const safeTitle = escapeHtml(record.config.title || "Menú de servicios");

  const safeBrand = escapeHtml(
    record.config.brand || "amaru electric"
  );

  const safeSubtitle = escapeHtml(
    record.config.subtitle ||
      "Selecciona el módulo que quieres utilizar."
  );

  const modules = record.config.modules || [];

  const cardsHtml = modules
    .map((module, index) => {
      const title = escapeHtml(module.title || "Módulo");
      const description = escapeHtml(module.description || "");
      const icon = escapeHtml(module.icon || "•");
      const url = escapeHtml(module.url || "#");
      const enabled = Boolean(module.enabled);

      return `
        <a
          class="module-card animate ${!enabled ? "module-card-disabled" : ""}"
          style="animation-delay:${0.18 + index * 0.06}s"
          href="${enabled ? url : "#"}"
          aria-disabled="${!enabled}"
        >
          <div class="module-card-top">

            <div class="module-icon" aria-hidden="true">
              ${icon}
            </div>

            <div class="module-status ${enabled ? "active" : "inactive"}">
              <span></span>
              ${enabled ? "Activo" : "No disponible"}
            </div>

          </div>

          <div class="module-content">

            <div class="module-title">
              ${title}
            </div>

            <div class="module-description">
              ${description}
            </div>

          </div>

          <div class="module-footer">

            <span>
              ${enabled ? "Ingresar" : "Próximamente"}
            </span>

            <div class="module-arrow" aria-hidden="true">
              →
            </div>

          </div>
        </a>
      `;
    })
    .join("");

  return `
<!doctype html>

<html lang="es">

<head>
<meta charset="UTF-8" />

<meta
  name="viewport"
  content="width=device-width, initial-scale=1.0, viewport-fit=cover"
/>

<title>${safeTitle}</title>

<link rel="preconnect" href="https://fonts.googleapis.com" />

<link
  rel="preconnect"
  href="https://fonts.gstatic.com"
  crossorigin
/>

<link
  href="https://fonts.googleapis.com/css2?family=Google+Sans:wght@400;500&family=Google+Sans+Display:wght@400;500&family=Inter:wght@400;500;600&display=swap"
  rel="stylesheet"
/>

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

*,
*::before,
*::after {
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

a {
  color: inherit;
}

button {
  font: inherit;
}

/* ANIMATION */

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

.page {
  min-height: 100vh;
}

.shell {
  width: 100%;
  max-width: var(--page-max);
  margin: 0 auto;
  padding: 0 16px 28px;
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
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.logo-icon svg {
  width: 24px;
  height: 24px;
  display: block;
}

.brand-name {
  font-size: 15px;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: var(--on-surface);
  text-transform: lowercase;
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
  letter-spacing: -0.04em;
  text-wrap: balance;
}

.hero-sub {
  max-width: 500px;
  font-size: 15px;
  color: var(--muted);
  line-height: 1.5;
  text-wrap: balance;
}

/* SECTION */

.section-head {
  margin-bottom: 16px;
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 12px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--on-surface);
  letter-spacing: -0.02em;
}

.section-pill {
  padding: 6px 12px;
  border-radius: 999px;
  background: var(--primary-bg);
  color: var(--primary);
  font-size: 11.5px;
  font-weight: 600;
  white-space: nowrap;
}

/* MODULES */

.modules {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

/* CARD */

.module-card {
  min-height: 176px;
  padding: 18px;
  border-radius: var(--radius-xl);
  background: var(--surface-1);
  text-decoration: none;
  color: inherit;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow: hidden;
  transition:
    background 160ms ease,
    transform 120ms ease,
    opacity 120ms ease;
}

.module-card:hover {
  background: var(--surface-2);
  transform: translateY(-2px);
}

.module-card:active {
  transform: scale(0.985);
}

.module-card-disabled {
  opacity: 0.52;
  pointer-events: none;
}

/* CARD HEADER */

.module-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 20px;
}

.module-icon {
  width: 48px;
  height: 48px;
  border-radius: 16px;
  background: var(--primary-bg);
  color: var(--primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
}

.module-status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 9px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
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
  background: var(--green-bg);
}

.module-status.active span {
  background: var(--green);
}

.module-status.inactive {
  color: var(--red);
  background: var(--red-bg);
}

.module-status.inactive span {
  background: var(--red);
}

/* CARD CONTENT */

.module-content {
  flex: 1;
  min-width: 0;
}

.module-title {
  font-size: 16px;
  line-height: 1.18;
  letter-spacing: -0.025em;
  font-weight: 600;
  color: var(--on-surface);
  margin-bottom: 10px;
}

.module-description {
  font-size: 13.5px;
  font-weight: 400;
  line-height: 1.42;
  color: var(--muted);
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* CARD FOOTER */

.module-footer {
  margin-top: 22px;
  color: var(--primary);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-size: 14px;
  font-weight: 600;
}

.module-arrow {
  width: 34px;
  height: 34px;
  border-radius: 999px;
  background: var(--surface-3);
  color: var(--primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 500;
  flex-shrink: 0;
}

/* NOTICE */

.notice-card {
  margin-top: 16px;
  padding: 18px;
  border-radius: var(--radius-xl);
  background: var(--surface-1);
  display: flex;
  align-items: center;
  gap: 14px;
}

.notice-icon {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  background: var(--primary-bg);
  color: var(--primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.notice-title {
  font-size: 15px;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: var(--on-surface);
  margin-bottom: 4px;
}

.notice-text {
  font-size: 13px;
  line-height: 1.4;
  color: var(--muted);
}

/* EMPTY */

.empty {
  grid-column: 1 / -1;
  padding: 24px 18px;
  border-radius: var(--radius-xl);
  background: var(--surface-1);
  color: var(--muted);
  font-size: 14px;
  text-align: center;
}

/* FOOTER */

.footer {
  margin-top: 24px;
  padding-bottom: 12px;
  text-align: center;
  color: var(--muted-2);
  font-size: 12px;
  line-height: 1.45;
}

.footer strong {
  color: var(--primary);
  font-weight: 600;
}

/* RESPONSIVE */

@media (max-width: 560px) {
  .shell {
    padding: 0 14px 28px;
  }

  .hero-title {
    font-size: 30px;
  }

  .hero-sub {
    font-size: 14px;
  }

  .section-head {
    align-items: flex-start;
    flex-direction: column;
  }

  .modules {
    gap: 14px;
  }

  .module-card {
    min-height: 164px;
    padding: 16px;
  }

  .module-title {
    font-size: 15.5px;
  }

  .module-description {
    font-size: 13px;
  }
}

@media (max-width: 390px) {
  .modules {
    grid-template-columns: 1fr;
  }

  .hero-title {
    font-size: 28px;
  }
}
</style>
</head>

<body>

<main class="page">

  <div class="shell">

    <header class="topbar animate">

      <div class="logo-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
        </svg>
      </div>

      <span class="brand-name">
        ${safeBrand}
      </span>

    </header>

    <section class="hero animate" style="animation-delay: 0.08s">

      <h1 class="hero-title">
        ${safeTitle}
      </h1>

      <p class="hero-sub">
        ${safeSubtitle}
      </p>

    </section>

    <div class="section-head animate" style="animation-delay: 0.14s">

      <h2 class="section-title">
        Elige un servicio
      </h2>

      <div class="section-pill">
        Módulos disponibles
      </div>

    </div>

    <section class="modules">

      ${
        cardsHtml ||
        `
        <div class="empty animate" style="animation-delay:0.18s">
          No hay módulos disponibles.
        </div>
        `
      }

    </section>

    <section class="notice-card animate" style="animation-delay: 0.32s">

      <div class="notice-icon" aria-hidden="true">
        🔒
      </div>

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
      Desarrollado por
      <strong>Automatiza Fácil</strong>
    </footer>

  </div>

</main>

</body>
</html>
`;
}
