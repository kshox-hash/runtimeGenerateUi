type Product = { id: string|number; name: string; price: number; description?: string|null; code?: string|null };

function fmtPrice(n: number): string {
  return n === 0 ? "Consultar" : "$" + Number(n).toLocaleString("es-CL");
}

const PALETTES = [
  { bg: "#FFF0E6", accent: "#F97316", dim: "#FED7AA", text: "#9A3412" },
  { bg: "#EFF6FF", accent: "#3B82F6", dim: "#BFDBFE", text: "#1E40AF" },
  { bg: "#F0FDF4", accent: "#22C55E", dim: "#BBF7D0", text: "#166534" },
  { bg: "#F5F3FF", accent: "#8B5CF6", dim: "#DDD6FE", text: "#4C1D95" },
  { bg: "#FDF2F8", accent: "#EC4899", dim: "#FBCFE8", text: "#831843" },
  { bg: "#FFFBEB", accent: "#F59E0B", dim: "#FDE68A", text: "#78350F" },
];

const BADGES = ["Disponible", "Popular", "Destacado", "Nuevo", "Top ventas", "Recomendado"];
const DATES  = ["Hoy", "Hace 2 días", "Hace 3 días", "Hace 5 días", "Hace 7 días", "Hace 14 días"];

export function nosotrosTabHtml(products: Product[]): string {
  if (!products || products.length === 0) {
    return `
  <div id="panel-nosotros" class="panel">
    <div class="pscroll">
      <div class="sec-hdr"><span class="sec-title">Catálogo de productos</span></div>
      <div class="prod-card-wrap"><div class="prod-empty">Sin productos disponibles aún.</div></div>
    </div>
  </div>`;
  }

  const cards = products.map((p, i) => {
    const c     = PALETTES[i % PALETTES.length];
    const badge = BADGES[i % BADGES.length];
    const date  = DATES[i % DATES.length];
    return `
    <div style="background:${c.bg};border-radius:18px;border:1.5px solid ${c.dim};overflow:hidden;display:flex;flex-direction:column;box-shadow:0 2px 12px rgba(0,0,0,.06);transition:box-shadow .2s,transform .2s" onmouseenter="this.style.boxShadow='0 8px 28px rgba(0,0,0,.12)';this.style.transform='translateY(-3px)'" onmouseleave="this.style.boxShadow='0 2px 12px rgba(0,0,0,.06)';this.style.transform='none'">
      <div style="padding:14px 15px 8px;display:flex;align-items:center;justify-content:space-between">
        <span style="font-size:10.5px;font-weight:600;color:${c.text};opacity:.75;letter-spacing:.02em">${date}</span>
        <div style="width:9px;height:9px;border-radius:50%;background:${c.accent};opacity:.85"></div>
      </div>
      <div style="padding:2px 15px 18px;flex:1">
        <div style="font-size:14.5px;font-weight:700;color:#18202F;letter-spacing:-.03em;line-height:1.3;margin-bottom:5px">${p.name}</div>
        ${p.description ? `<div style="font-size:11.5px;color:#5E7087;line-height:1.4;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical">${p.description}</div>` : ""}
      </div>
      <div style="padding:12px 15px 14px;display:flex;align-items:center;justify-content:space-between;border-top:1px solid ${c.dim}">
        <span style="font-size:9.5px;font-weight:700;background:${c.dim};color:${c.text};border-radius:20px;padding:3px 9px;letter-spacing:.02em">${badge}</span>
        <span style="font-size:14px;font-weight:800;color:${c.accent};font-variant-numeric:tabular-nums;white-space:nowrap">${fmtPrice(p.price)}</span>
      </div>
    </div>`;
  }).join("");

  return `
  <div id="panel-nosotros" class="panel">
    <div class="pscroll">
      <div class="sec-hdr" style="margin-bottom:20px">
        <div>
          <div class="sec-title">Catálogo de productos</div>
          <div class="sec-sub">${products.length} producto${products.length !== 1 ? "s" : ""} disponible${products.length !== 1 ? "s" : ""}</div>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
        ${cards}
      </div>
    </div>
  </div>`;
}