import { ProductsComponent, ProductItem, RuntimeLinkRecord, SubmitBody, ViewConfig } from "../types/runtime";

export function formatCurrencyCLP(value: number): string {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

export function getProductsFromConfig(config: ViewConfig): ProductItem[] {
  const productsComponent = config.components.find(
    (component): component is ProductsComponent => component.type === "products"
  );

  return productsComponent?.items || [];
}

export function buildQuoteDetail(record: RuntimeLinkRecord, submitBody: SubmitBody) {
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