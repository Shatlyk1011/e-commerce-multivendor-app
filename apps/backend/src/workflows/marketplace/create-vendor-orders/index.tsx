import { 
  createWorkflow,
  transform,
  when,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { 
  useQueryGraphStep,
  createRemoteLinkStep,
  createOrderWorkflow,
  getOrderDetailWorkflow,
  acquireLockStep,
  releaseLockStep,
} from "@medusajs/medusa/core-flows"
import groupVendorItemsStep, { GroupVendorItemsStepInput } from "./steps/group-vendor-items"
import createVendorOrdersStep from "./steps/create-vendor-orders"
import validateCartDeliveryCityStep from "./steps/validate-cart-delivery-city"
import vendorOrderLink from "../../../links/vendor-order"
import type { DeliveryDetails } from "../../../lib/delivery"
import storeOrderDeliveryDetailsStep from "./steps/store-order-delivery-details"

type WorkflowInput = {
  cart_id: string
  delivery: DeliveryDetails
}

const createVendorOrdersWorkflow = createWorkflow(
  "create-vendor-order",
  function (input: WorkflowInput) {
    const { data: carts } = useQueryGraphStep({
      entity: "cart",
      fields: [
        "id",
        "customer_id",
        "region_id",
        "sales_channel_id",
        "email",
        "currency_code",
        "items.*",
        "shipping_address.*",
        "billing_address.*",
      ],
      filters: { id: input.cart_id },
      options: {
        throwIfKeyNotFound: true,
      },
    })

    acquireLockStep({
      key: input.cart_id,
      timeout: 2,
      ttl: 10,
    })

    validateCartDeliveryCityStep({
      cart: carts[0],
      delivery: input.delivery,
    })

    const parentOrderInput = transform({ carts, input }, (data) => {
      const cart = data.carts[0]
      const toOrderAddress = (address: typeof cart.shipping_address) => address
        ? {
            first_name: address.first_name,
            last_name: address.last_name,
            company: address.company,
            address_1: address.address_1,
            address_2: address.address_2,
            city: address.city,
            country_code: address.country_code,
            province: address.province,
            postal_code: address.postal_code,
            phone: address.phone,
          }
        : undefined

      return {
        items: (cart.items ?? [])
          .filter((item): item is NonNullable<typeof item> => Boolean(item))
          .map((item) => ({
            variant_id: item.variant_id ?? undefined,
            product_id: item.product_id ?? undefined,
            quantity: item.quantity,
            title: item.title ?? "Item",
            subtitle: item.subtitle ?? undefined,
            thumbnail: item.thumbnail ?? undefined,
            unit_price: item.unit_price ?? 0,
            is_tax_inclusive: item.is_tax_inclusive ?? false,
          })),
        metadata: { delivery: data.input.delivery },
        region_id: cart.region_id ?? undefined,
        customer_id: cart.customer_id ?? undefined,
        sales_channel_id: cart.sales_channel_id ?? undefined,
        email: cart.email ?? undefined,
        currency_code: cart.currency_code,
        shipping_address: toOrderAddress(cart.shipping_address),
        billing_address: toOrderAddress(cart.billing_address),
      }
    })

    const { id: orderId } = createOrderWorkflow.runAsStep({
      input: parentOrderInput,
    })

    const { data: existingLinks } = useQueryGraphStep({
      entity: vendorOrderLink.entryPoint,
      fields: ["vendor.id"],
      filters: { order_id: orderId },
    }).config({ name: "retrieve-existing-links" })
      
    const order = getOrderDetailWorkflow.runAsStep({
      input: {
        order_id: orderId,
        fields: [
          "region_id",
          "customer_id",
          "sales_channel_id",
          "email",
          "currency_code",
          "metadata",
          "shipping_address.*",
          "billing_address.*",
        ],
      },
    })

    storeOrderDeliveryDetailsStep({
      order_id: order.id,
      delivery: input.delivery,
    })

    const vendorOrders = when(
      "create-vendor-order-links",
      { existingLinks },
      (data) => data.existingLinks.length === 0
    ).then(() => {

      const { vendorsItems } = groupVendorItemsStep({
        cart: carts[0],
      } as unknown as GroupVendorItemsStepInput)
  
      const { 
        orders: vendorOrders, 
        linkDefs,
      } = createVendorOrdersStep({
        parentOrder: order,
        vendorsItems,
        delivery: input.delivery,
      })
  
      createRemoteLinkStep(linkDefs)

      return vendorOrders
    })

    releaseLockStep({
      key: input.cart_id,
    })

    return new WorkflowResponse({
      order,
      vendorOrders,
    })
  }
)

export default createVendorOrdersWorkflow
