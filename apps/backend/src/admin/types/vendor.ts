// Vendor types matching the marketplace module models
export type VendorAdmin = {
  id: string
  first_name: string | null
  last_name: string | null
  email: string
}

export type Vendor = {
  id: string
  handle: string
  name: string
  logo: string | null
  admins?: VendorAdmin[]
  created_at?: string
  updated_at?: string
}

export type VendorListResponse = {
  vendors: Vendor[]
  count: number
  limit: number
  offset: number
}

export type VendorResponse = {
  vendor: Vendor
}

export type CreateVendorInput = {
  name: string
  handle: string
  logo?: string
}

export type UpdateVendorInput = {
  name?: string
  handle?: string
  logo?: string | null
}
