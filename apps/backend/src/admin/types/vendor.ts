// Vendor types matching the marketplace module models
export type VendorAdmin = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  last_login: string | null;
};

export type Vendor = {
  id: string;
  handle: string;
  name: string;
  logo: string | null;
  status: "active" | "disabled";
  status_reason: string | null;
  store_name: string | null;
  store_description: string | null;
  address: string | null;
  city: string | null;
  admins?: VendorAdmin[];
  created_at?: string;
  updated_at?: string;
};

export type VendorListResponse = {
  vendors: Vendor[];
  count: number;
  limit: number;
  offset: number;
};

export type VendorResponse = {
  vendor: Vendor;
};

export type CreateVendorInput = {
  name: string;
  handle: string;
  logo?: string;
  status?: "active" | "disabled";
  status_reason?: string | null;
  store_name?: string | null;
  store_description?: string | null;
  address?: string | null;
  city: string;
  admin: {
    email: string;
    password?: string;
    first_name?: string;
    last_name?: string;
  };
};

export type UpdateVendorInput = {
  name?: string;
  handle?: string;
  logo?: string | null;
  status?: "active" | "disabled";
  status_reason?: string | null;
  store_name?: string | null;
  store_description?: string | null;
  address?: string | null;
  city?: string;
  admin?: {
    id: string;
    email?: string;
    oldEmail?: string;
  };
};

export type ResetPasswordInput = {
  email: string;
  password?: string;
};
