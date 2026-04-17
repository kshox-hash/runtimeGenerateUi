export type PdfConfigProductInput = {
  code?: string;
  name: string;
  price: number;
  description?: string;
};

export type SavePdfConfigInput = {
  userId: string;
  templateCode: string;
  businessName: string;
  businessSubtitle?: string;
  city?: string;
  footerText?: string;
  products: PdfConfigProductInput[];
};

export type PdfConfigOutput = {
  templateCode: string;
  businessName: string;
  businessSubtitle?: string | null;
  city?: string | null;
  footerText?: string | null;
  products: Array<{
    id: string;
    code?: string | null;
    name: string;
    price: number;
    description?: string | null;
  }>;
};