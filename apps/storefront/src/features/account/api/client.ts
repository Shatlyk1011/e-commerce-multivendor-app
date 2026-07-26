import type { StoreCustomer, StoreCustomerAddress, StoreOrder } from '@medusajs/types'

import { medusa } from '@/lib/medusa'

export type UpdateCustomerInput = {
  first_name?: string
  last_name?: string
  company_name?: string
}

export type CreateAddressInput = {
  address_name?: string
  first_name?: string
  last_name?: string
  company?: string
  address_1: string
  address_2?: string
  city?: string
  country_code?: string
  province?: string
  postal_code?: string
  phone?: string
  is_default_shipping?: boolean
  is_default_billing?: boolean
}

export type UpdateAddressInput = Partial<CreateAddressInput>

export async function getCustomerProfile(): Promise<StoreCustomer | null> {
  try {
    const { customer } = await medusa.client.fetch<{ customer: StoreCustomer }>('/store/customers/me')
    return customer
  } catch {
    return null
  }
}

export async function updateCustomerProfile(body: UpdateCustomerInput): Promise<StoreCustomer> {
  const { customer } = await medusa.client.fetch<{ customer: StoreCustomer }>('/store/customers/me', {
    method: 'POST',
    body,
  })
  return customer
}

export async function getCustomerAddresses(): Promise<StoreCustomerAddress[]> {
  try {
    const { addresses } = await medusa.client.fetch<{ addresses: StoreCustomerAddress[] }>(
      '/store/customers/me/addresses',
    )
    return addresses ?? []
  } catch {
    return []
  }
}

export async function createCustomerAddress(body: CreateAddressInput): Promise<StoreCustomerAddress> {
  const { address } = await medusa.client.fetch<{ address: StoreCustomerAddress }>('/store/customers/me/addresses', {
    method: 'POST',
    body,
  })
  return address
}

export async function updateCustomerAddress(
  addressId: string,
  body: UpdateAddressInput,
): Promise<StoreCustomerAddress> {
  const { address } = await medusa.client.fetch<{ address: StoreCustomerAddress }>(
    `/store/customers/me/addresses/${addressId}`,
    {
      method: 'POST',
      body,
    },
  )
  return address
}

export async function deleteCustomerAddress(addressId: string): Promise<void> {
  await medusa.client.fetch(`/store/customers/me/addresses/${addressId}`, {
    method: 'DELETE',
  })
}

export async function getCustomerOrders(): Promise<StoreOrder[]> {
  try {
    const { orders } = await medusa.client.fetch<{ orders: StoreOrder[] }>('/store/orders', {
      query: {
        fields:
          'id,display_id,status,fulfillment_status,payment_status,created_at,currency_code,total,subtotal,shipping_total,tax_total,discount_total,items.*,items.variant.product.id,items.variant.product.title,items.variant.product.handle,items.variant.product.thumbnail,shipping_address.*,billing_address.*,shipping_methods.*',
      },
    })
    return orders ?? []
  } catch {
    return []
  }
}

export async function getCustomerOrder(orderId: string): Promise<StoreOrder | null> {
  try {
    const { order } = await medusa.client.fetch<{ order: StoreOrder }>(`/store/orders/${orderId}`, {
      query: {
        fields:
          'id,display_id,status,fulfillment_status,payment_status,created_at,currency_code,total,subtotal,shipping_total,tax_total,discount_total,items.*,items.variant.product.id,items.variant.product.title,items.variant.product.handle,items.variant.product.thumbnail,shipping_address.*,billing_address.*,shipping_methods.*',
      },
    })
    return order
  } catch {
    return null
  }
}
