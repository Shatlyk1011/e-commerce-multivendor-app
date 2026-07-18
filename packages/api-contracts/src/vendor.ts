/**
 * Public contracts for the backend's `/vendors/*` API.
 *
 * These are deliberately DTOs rather than Medusa module entities: only fields
 * returned by the API belong here. The backend owns changes to this package.
 */
export type VendorStatus = "active" | "disabled"

export type Vendor = {
  id: string
  name: string
  handle: string
  logo: string | null
  status: VendorStatus
  status_reason: string | null
  store_name: string | null
  store_description: string | null
  address: string | null
  city: string | null
}

export type VendorAdmin = {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  last_login?: string | null
  vendor?: Vendor
}

export type VendorMeResponse = {
  vendor_admin: VendorAdmin
}

export type VendorOrderItem = {
  id: string
  quantity: number
  title?: string
  variant?: {
    title?: string
    product?: {
      title?: string
    }
  }
}

export type VendorOrder = {
  id: string
  display_id?: number | string
  status?: string
  fulfillment_status?: string
  payment_status?: string
  created_at: string
  currency_code: string
  total?: number
  items?: VendorOrderItem[]
  metadata?: {
    parent_order_id?: string
  }
}

export type VendorOrdersResponse = {
  orders: VendorOrder[]
  count: number
  offset: number
  limit: number
}

export type VendorProduct = {
  id: string
  title: string
  handle: string
  description: string | null
  thumbnail: string | null
  status: string
  variants?: Array<{
    id: string
    title: string
    prices?: Array<{
      amount: number
      currency_code: string
    }>
  }>
}

export type VendorProductsResponse = {
  products: VendorProduct[]
}

export type VendorProductCreateResponse = {
  product: VendorProduct
}

export type UploadedVendorMedia = {
  key: string
  url: string
}

export type VendorMediaResponse = {
  files: UploadedVendorMedia[]
  folder: string
}
