export interface Vendor {
  id: string
  name: string
  handle: string
  logo: string | null
  city: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface VendorAdmin {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  vendor_id: string
  vendor?: Vendor
  created_at: string
  updated_at: string
  deleted_at: string | null
  status: 'active' | 'disabled'
}
