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
  unit_price?: number
  thumbnail?: string
  variant?: {
    title?: string
    product?: {
      title?: string
    }
  }
}

export type OrderDeliveryDetails = {
  method: "pickup" | "courier"
  shipping_option_id: string
  pickup_point?: {
    id: string
    title: string
    area: string
    address: string
    city: string
    hours: string
  }
  delivery_date?: string
  time_slot?: string
  recipient_phone?: string
  customer_note?: string
}

export type VendorOrderAddress = {
  first_name?: string
  last_name?: string
  address_1?: string
  address_2?: string
  city?: string
  province?: string
  postal_code?: string
  country_code?: string
  phone?: string
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
  subtotal?: number
  shipping_total?: number
  tax_total?: number
  discount_total?: number
  email?: string
  items?: VendorOrderItem[]
  shipping_address?: VendorOrderAddress
  delivery?: OrderDeliveryDetails
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

export type VendorOrderResponse = {
  order: VendorOrder
}

export type VendorProduct = {
  id: string
  title: string
  handle: string
  thumbnail: string | null
  status: string
  // Category
  categories?: Array<{ id: string; name: string }>
  // Tags / search keywords stored in metadata
  metadata?: { keywords?: string[] } | null
  // Gallery images
  images?: Array<{ url: string }>
  // Logistics & dimensions
  weight?: number | null
  length?: number | null
  width?: number | null
  height?: number | null
  origin_country?: string | null
  material?: string | null
  // Variants with full details
  variants?: Array<{
    id: string
    title: string
    sku?: string | null
    barcode?: string | null
    options?: Array<{ value: string; option?: { title: string } }>
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

export type ProductOptionTemplate = {
  id: string
  title: string
  is_active: boolean
  values: Array<{
    id: string
    value: string
  }>
}

export type VendorProductOptionTemplatesResponse = {
  product_option_templates: ProductOptionTemplate[]
}

export type UploadedVendorMedia = {
  key: string
  url: string
}

export type VendorMediaResponse = {
  files: UploadedVendorMedia[]
  folder: string
}
