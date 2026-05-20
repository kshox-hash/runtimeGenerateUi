export type RuntimeViewType =
  | "menu"
  | "quote"
  | "appointments"
  | "generic";

export type MenuModuleItem = {
  code: string;
  title: string;
  description: string;
  icon: string;
  enabled: boolean;
  sortOrder: number;
  url?: string;
};

export type TextComponent = {
  type: "text";
  value: string;
};

export type ProductItem = {
  id: string;
  name: string;
  price: number;
  description?: string;
  imageUrl?: string;
};

export type ProductsComponent = {
  type: "products";
  items: ProductItem[];
};

export type FormField = {
  name: string;
  label: string;
  inputType: "text" | "email" | "tel" | "number" | "textarea";
  required?: boolean;
  placeholder?: string;
};

export type FormComponent = {
  type: "form";
  fields: FormField[];
};

export type ButtonComponent = {
  type: "button";
  label: string;
  action: {
    type: "submit";
  };
};

export type UIComponent =
  | TextComponent
  | ProductsComponent
  | FormComponent
  | ButtonComponent;

export type ViewConfig = {
  viewType?: RuntimeViewType;
  title: string;
  subtitle?: string;
  brand?: string;
  successMessage?: string;
  recipientPhone?: string;
  userId?: string;
  leadId?: string;
  modules?: MenuModuleItem[];
  components: UIComponent[];
};

export type RuntimeLinkRecord = {
  token: string;
  config: ViewConfig;
  createdAt: number;
  expiresAt: number;
  status: "active" | "expired" | "used";
  openedAt?: number;
  submittedAt?: number;
  submissions: unknown[];
};

export type CreateRuntimeLinkBody = {
  expiresInMinutes?: number;
  config: ViewConfig;
};

export type SubmitBody = {
  customer?: Record<string, unknown>;
  items?: Array<{ productId: string; quantity: number }>;
  appointment?: Record<string, unknown>;
  raw?: Record<string, unknown>;
};