import { escapeHtml } from "../../../utils/html";

type Product = {
  id: string | number;
  name: string;
  price: number;
  description?: string | null;
  color?: string | null;
  photos?: string[];
};

function fmtPrice(n: number): string {
  return n === 0 ? "Consultar" : "$" + Number(n).toLocaleString("es-CL");
}

function buildProductCard(product: Product): string {
  const name  = escapeHtml(product.name);
  const desc  = product.description ? escapeHtml(product.description) : null;
  const price = fmtPrice(product.price);
  const color = escapeHtml(product.color || "#63ACF1");

  const firstPhoto = product.photos && product.photos.length > 0 ? product.photos[0] : null;
  const thumb = firstPhoto
    ? `<img class="prd-thumb" src="${escapeHtml(firstPhoto)}" alt="" loading="lazy">`
    : `<div class="prd-thumb prd-thumb-dot" style="background:${color}"></div>`;

  const prodJson = escapeHtml(JSON.stringify({
    id:          String(product.id),
    name:        product.name,
    price:       Number(product.price || 0),
    description: product.description || null,
    color:       product.color || "#63ACF1",
    photos:      Array.isArray(product.photos) ? product.photos : [],
  }));

  return `<div class="prd-card" data-name="${name.toLowerCase()}" data-prod-id="${escapeHtml(String(product.id))}" data-prod-json="${prodJson}">
  ${thumb}
  <div class="prd-info">
    <div class="prd-name">${name}</div>
    ${desc ? `<div class="prd-desc">${desc}</div>` : ""}
  </div>
  <div class="prd-price">${price}</div>
</div>`;
}

type GalleryPhoto = { id: string; url: string; description: string | null };

export function nosotrosTabHtml(products: Product[], total: number, galleryPhotos: GalleryPhoto[]): string {
  const hasProducts = products && products.length > 0;
  const hasMore = total > products.length;
  const hasGallery = galleryPhotos && galleryPhotos.length > 0;

  return `<div id="panel-nosotros" class="panel">
  <div class="pscroll">
    <div class="sec-hdr">
      <div>
        <div class="sec-title">Productos &amp; Servicios</div>
        <div class="sec-sub">${hasProducts ? `${total} disponible${total !== 1 ? "s" : ""}` : "Sin productos aún"}</div>
      </div>
    </div>
    ${hasProducts ? `
    <div class="prd-search-wrap">
      <svg class="prd-search-icon" viewBox="0 0 20 20" fill="none"><circle cx="9" cy="9" r="6" stroke="currentColor" stroke-width="1.8"/><path d="M14 14l3 3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
      <input id="prd-search" class="prd-search" type="text" placeholder="Buscar servicio..." oninput="filterPrd(this.value)">
    </div>
    <div id="prd-list" class="prd-list">${products.map(p => buildProductCard(p)).join("")}</div>
    <div id="prd-empty-search" class="prd-no-results" style="display:none">Sin resultados para tu búsqueda.</div>
    ${hasMore ? `<div id="prdLoadMoreWrap" style="padding:16px;text-align:center"><button class="btn-outline" id="prdLoadMoreBtn" onclick="loadMorePrd()">Cargar más</button></div>` : ""}
    ` : `<div class="prod-empty">Sin productos publicados aún.<br/><span style="font-size:12px">Agrega tus productos desde el panel de administración.</span></div>`}

    <div class="sec-hdr" style="margin-top:28px">
      <div>
        <div class="sec-title">Galería</div>
        <div class="sec-sub">${hasGallery ? `${galleryPhotos.length} foto${galleryPhotos.length !== 1 ? "s" : ""}` : "Portafolio de trabajos"}</div>
      </div>
    </div>
    ${hasGallery ? `
    <div class="gal-grid">
      ${galleryPhotos.map((p, i) => `<div class="gal-item" data-gal-idx="${i}" data-gal-url="${escapeHtml(p.url)}" data-gal-desc="${escapeHtml(p.description || "")}" onclick="openGalPanel(${i})">
        <img src="${escapeHtml(p.url)}" alt="" loading="lazy">
      </div>`).join("")}
    </div>` : `
    <div class="gal-empty">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="3" y="3" width="18" height="18" rx="4"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
      <div class="gal-empty-title">Próximamente</div>
      <div class="gal-empty-sub">Las fotos de los trabajos se mostrarán aquí</div>
    </div>`}
  </div>
</div>`;
}
