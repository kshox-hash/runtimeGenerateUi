import { MenuModuleItem } from "../../../runtime/runtime.types";

type PublicPortalRenderData = {
  businessName: string;
  title: string;
  subtitle: string;
  modules: MenuModuleItem[];
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function renderPublicPortalHtml(data: PublicPortalRenderData): string {
  const title = escapeHtml(data.title);
  const subtitle = escapeHtml(data.subtitle);
  const modules = data.modules ?? [];

  const moduleCards = modules
    .map((module) => {
      const moduleTitle = escapeHtml(module.title);
      const description = escapeHtml(module.description);
      const icon = escapeHtml(module.icon || "");
      const url = module.url || "#";

      return `
        <a class="module-card" href="${url}">
          <div class="module-icon">${icon}</div>
          <div>
            <h2>${moduleTitle}</h2>
            <p>${description}</p>
          </div>
        </a>
      `;
    })
    .join("");

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <style>
    body {
      margin: 0;
      font-family: Arial, sans-serif;
      background: #f5f5f5;
      color: #111;
    }

    .page {
      max-width: 520px;
      margin: 0 auto;
      padding: 32px 20px;
    }

    .header {
      margin-bottom: 28px;
    }

    .header h1 {
      margin: 0 0 8px;
      font-size: 28px;
      font-weight: 700;
    }

    .header p {
      margin: 0;
      color: #666;
      font-size: 15px;
    }

    .modules {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .module-card {
      display: flex;
      gap: 14px;
      align-items: center;
      padding: 18px;
      border-radius: 18px;
      background: #fff;
      color: inherit;
      text-decoration: none;
      border: 1px solid #e7e7e7;
    }

    .module-icon {
      font-size: 28px;
      width: 42px;
      text-align: center;
    }

    .module-card h2 {
      margin: 0 0 4px;
      font-size: 17px;
    }

    .module-card p {
      margin: 0;
      font-size: 14px;
      color: #666;
      line-height: 1.35;
    }
  </style>
</head>
<body>
  <main class="page">
    <section class="header">
      <h1>${title}</h1>
      <p>${subtitle}</p>
    </section>

    <section class="modules">
      ${moduleCards}
    </section>
  </main>
</body>
</html>
`;
}