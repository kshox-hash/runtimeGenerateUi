export type CompanyProfile = {
  id: string;
  user_id: string;
  business_name: string;
  rut: string | null;
  city: string;
  address: string;
  phone: string;
  created_at: Date;
  updated_at: Date;
};

export type CompanyProfileInput = {
  user_id: string;
  business_name: string;
  rut: string | null;
  city: string;
  address: string;
  phone: string;
};