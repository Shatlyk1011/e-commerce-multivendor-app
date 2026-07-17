import { MedusaError, ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"

type CartItem = {
  product_id?: string | null
}

type DeliveryCityCart = {
  items?: Array<CartItem | null>
  shipping_address?: {
    city?: string | null
  } | null
}

type ProductDeliveryMetadata = Record<string, unknown>

function getMetadataString(metadata: unknown, key: string): string | undefined {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return undefined
  }

  const value = (metadata as ProductDeliveryMetadata)[key]

  return typeof value === "string" ? value : undefined
}

function normalizeCity(value: string): string {
  return value.trim().toLocaleLowerCase()
}

const validateCartDeliveryCityStep = createStep(
  "validate-cart-delivery-city",
  async ({ cart }: { cart: DeliveryCityCart }, { container }) => {
    const shippingCity = cart.shipping_address?.city?.trim()

    if (!shippingCity) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "A shipping address city is required to place this order."
      )
    }

    const productIds = (cart.items || [])
      .map((item) => item?.product_id)
      .filter((productId): productId is string => Boolean(productId))

    if (productIds.length === 0) {
      return new StepResponse(undefined)
    }

    const query = container.resolve(ContainerRegistrationKeys.QUERY)
    const { data: products } = await query.graph({
      entity: "product",
      fields: ["id", "title", "metadata"],
      filters: {
        id: productIds,
      },
    })

    const productsById = new Map(products.map((product) => [product.id, product]))

    for (const productId of productIds) {
      const product = productsById.get(productId)
      const deliveryScope = getMetadataString(product?.metadata, "delivery_scope")

      if (deliveryScope !== "origin_city") {
        continue
      }

      const deliveryCity = getMetadataString(product?.metadata, "delivery_city")

      if (!deliveryCity || normalizeCity(deliveryCity) !== normalizeCity(shippingCity)) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          `${product?.title || "This product"} is only available for delivery in ${deliveryCity || "the vendor's origin city"}.`
        )
      }
    }

    return new StepResponse(undefined)
  }
)

export default validateCartDeliveryCityStep
