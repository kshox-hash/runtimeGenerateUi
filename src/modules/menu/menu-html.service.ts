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
    .map((module) => {
      const title = escapeHtml(module.title);
      const description = escapeHtml(module.description);
      const icon = escapeHtml(module.icon || "•");
      const url = escapeHtml(module.url || "#");
      const enabled = Boolean(module.enabled);

      return `
        <a
          class="module-card ${
            !enabled ? "module-card-disabled" : ""
          }"
          href="${enabled ? url : "#"}"
        >
          <div class="module-header">

            <div class="module-icon">
              ${icon}
            </div>

            <div class="module-status ${
              enabled ? "active" : "inactive"
            }">
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

            <div class="module-arrow">
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
  content="width=device-width, initial-scale=1.0"
/>

<title>${safeTitle}</title>

<link
  rel="preconnect"
  href="https://fonts.googleapis.com"
/>

<link
  rel="preconnect"
  href="https://fonts.gstatic.com"
  crossorigin
/>

<link
  href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap"
  rel="stylesheet"
/>

<style>

:root {

  --bg: #0f1011;

  --surface: #16191f;
  --surface-hover: #20242d;

  --text: #d8dbe2;
  --text-strong: #e8eaed;

  --muted: #b0b4be;
  --muted-soft: #858a96;

  --link: #bfc7ff;
  --link-soft: #22263a;

  --green: #81c995;
  --green-soft: #1d3428;

  --red: #f28b82;
  --red-soft: #34201f;

  --radius-xl: 32px;
  --radius-lg: 24px;
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
    "Google Sans",
    "Inter",
    "Segoe UI",
    sans-serif;

  -webkit-font-smoothing: antialiased;

  overflow-x: hidden;
}

/* PAGE */

.page {
  min-height: 100vh;
  padding: 18px 14px 32px;
}

.shell {
  width: 100%;
  max-width: 620px;
  margin: 0 auto;
}

/* BRAND */

.brand-header {

  min-height: 64px;

  display: flex;
  align-items: center;
  justify-content: center;

  margin-bottom: 14px;
}

.brand-name {

  color: var(--text-strong);

  font-size: 20px;
  line-height: 1;

  font-weight: 500;
  letter-spacing: -0.05em;

  opacity: 0.92;

  text-align: center;
  text-transform: lowercase;
}

/* HERO */

.hero {

  text-align: center;

  padding: 12px 8px 30px;
}

.hero h1 {

  margin: 0 auto;

  max-width: 520px;

  font-size: 34px;
  line-height: 1.08;

  letter-spacing: -0.055em;
  font-weight: 500;

  color: var(--text-strong);

  text-wrap: balance;
}

.subtitle {

  margin: 16px auto 0;

  max-width: 500px;

  color: var(--muted);

  font-size: 15px;
  font-weight: 400;

  line-height: 1.5;

  text-wrap: balance;
}

/* SECTION TITLE */

.section-title {

  margin: 0 4px 16px;

  font-size: 24px;
  line-height: 1.1;

  letter-spacing: -0.045em;
  font-weight: 500;

  color: var(--text-strong);
}

/* MODULES */

.modules {

  display: grid;

  grid-template-columns:
    repeat(2, minmax(0, 1fr));

  gap: 14px;
}

/* CARD */

.module-card {

  min-height: 176px;

  display: flex;
  flex-direction: column;
  justify-content: space-between;

  padding: 18px;

  border-radius: var(--radius-lg);

  background: var(--surface);

  color: inherit;
  text-decoration: none;

  transition:
    transform 160ms ease,
    background 160ms ease;
}

.module-card:hover {

  transform: translateY(-2px);

  background: var(--surface-hover);
}

.module-card-disabled {

  opacity: 0.55;

  pointer-events: none;
}

/* CARD HEADER */

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

  color: var(--link);

  background: var(--link-soft);
}

/* STATUS */

.module-status {

  display: inline-flex;
  align-items: center;

  gap: 6px;

  padding: 6px 9px;

  border-radius: 999px;

  font-size: 11px;
  font-weight: 500;

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
}

.module-status.active span {
  background: var(--green);
}

.module-status.inactive {

  color: var(--red);

  background: var(--red-soft);
}

.module-status.inactive span {
  background: var(--red);
}

/* CONTENT */

.module-content {
  flex: 1;
}

.module-title {

  font-size: 17px;
  line-height: 1.16;

  letter-spacing: -0.03em;
  font-weight: 500;

  color: var(--text-strong);

  margin-bottom: 10px;
}

.module-description {

  font-size: 14px;

  font-weight: 400;
  line-height: 1.4;

  color: var(--muted);

  display: -webkit-box;

  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;

  overflow: hidden;
}

/* FOOTER */

.module-footer {

  display: flex;
  align-items: center;
  justify-content: space-between;

  margin-top: 22px;

  color: var(--link);

  font-size: 14px;
  font-weight: 500;
}

.module-arrow {

  width: 34px;
  height: 34px;

  border-radius: 999px;

  display: flex;
  align-items: center;
  justify-content: center;

  font-size: 20px;
  font-weight: 500;

  color: var(--link);

  background: #1b1c25;
}

/* NOTICE */

.notice-card {

  margin-top: 18px;

  padding: 18px;

  border-radius: var(--radius-lg);

  background: var(--surface);

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

  font-size: 20px;

  color: var(--link);

  background: var(--link-soft);
}

.notice-title {

  font-size: 16px;

  font-weight: 500;

  letter-spacing: -0.03em;

  color: var(--text-strong);

  margin-bottom: 4px;
}

.notice-text {

  font-size: 14px;

  line-height: 1.35;

  color: var(--muted-soft);
}

/* FOOTER */

.footer {

  margin-top: 28px;

  padding-bottom: 12px;

  text-align: center;

  color: var(--muted-soft);

  font-size: 13px;
}

.footer strong {

  color: var(--link);

  font-weight: 500;
}

/* MOBILE */

@media (max-width: 560px) {

  .page {
    padding: 14px 12px 28px;
  }

  .brand-name {
    font-size: 19px;
  }

  .hero h1 {
    font-size: 31px;
  }

  .subtitle {
    font-size: 14px;
  }

  .section-title {
    font-size: 22px;
  }

  .module-card {

    min-height: 164px;

    padding: 16px;
  }

  .module-title {
    font-size: 16px;
  }

  .module-description {
    font-size: 13.5px;
  }
}

@media (max-width: 390px) {

  .modules {
    grid-template-columns: 1fr;
  }

  .hero h1 {
    font-size: 29px;
  }
}

</style>
</head>

<body>

<main class="page">

  <div class="shell">

    <header class="brand-header">

      <div class="brand-name">
        ${safeBrand}
      </div>

    </header>

    <section class="hero">

      <h1>
        ${safeTitle}
      </h1>

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
        `
        <div class="empty">
          No hay módulos disponibles.
        </div>
        `
      }

    </section>

    <section class="notice-card">

      <div class="notice-icon">
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