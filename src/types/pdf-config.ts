export type PdfConfigProductInput = {
  code?: string;
  name: string;
  price: number;
  description?: string;
};

export type SavePdfConfigInput = {
  userId: string;
  templateCode: string; // aquí vendrá el NOMBRE visible
  products: PdfConfigProductInput[];
};

export type PdfConfigOutput = {
  templateCode: string; // devolveremos también el nombre visible
  products: Array<{
    id: string;
    code?: string | null;
    name: string;
    price: number;
    description?: string | null;
  }>;
};