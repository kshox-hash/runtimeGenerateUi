export type CompanyProfile = {
  id: string;
  user_id: string;
  business_name: string;
  public_slug: string | null;
  is_public_enabled: boolean;
  rut: string | null;
  city: string;
  address: string;
  phone: string;
  brand_color: string | null;
  created_at: Date;
  updated_at: Date;
};

export type CompanyProfileInput = {
  user_id: string;
  business_name: string;
  rut?: string | null;
  city?: string;
  address?: string;
  phone?: string;
  brand_color?: string | null;
};