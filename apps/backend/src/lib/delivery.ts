import { MedusaError } from "@medusajs/framework/utils"

export const DELIVERY_METHODS = ["courier", "pickup"] as const

export type DeliveryMethod = (typeof DELIVERY_METHODS)[number]

export type DeliveryDetails = {
  method: DeliveryMethod
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

const pickupPoints = [
  {
    id: "central",
    title: "Центральный пункт выдачи",
    area: "Центральный район",
    address: "проспект Магтымгулы, 72",
    city: "Ashgabat",
    hours: "Ежедневно, 10:00–20:00",
  },
  {
    id: "east",
    title: "Восточный пункт выдачи",
    area: "Восточный район",
    address: "улица Атамурадова, 34",
    city: "Ashgabat",
    hours: "Ежедневно, 10:00–20:00",
  },
  {
    id: "north",
    title: "Северный пункт выдачи",
    area: "Северный район",
    address: "улица Бекреве, 18",
    city: "Ashgabat",
    hours: "Ежедневно, 10:00–20:00",
  },
] as const

export function getPickupPoints() {
  return pickupPoints
}

export function isDeliveryShippingOptionCode(method: DeliveryMethod, code?: string | null) {
  if (method === "courier") return code === "courier" || code === "standard"
  return code === "pickup" || code === "express"
}

export function getDeliveryShippingOptionCode(method: DeliveryMethod, availableCodes: Set<string>) {
  if (method === "courier") {
    return availableCodes.has("courier") ? "courier" : "standard"
  }

  return availableCodes.has("pickup") ? "pickup" : "express"
}

export function getPickupPoint(id: string) {
  return pickupPoints.find((point) => point.id === id)
}

export function buildDeliveryDetails(input: {
  delivery_method: DeliveryMethod
  pickup_point_id?: string
  delivery_date?: string
  time_slot?: string
  recipient_phone?: string
  customer_note?: string
}): DeliveryDetails {
  if (input.delivery_method === "pickup") {
    const pickupPoint = input.pickup_point_id ? getPickupPoint(input.pickup_point_id) : undefined

    if (!pickupPoint) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, "A valid pickup point is required.")
    }

    return {
      method: "pickup",
      pickup_point: { ...pickupPoint },
      recipient_phone: input.recipient_phone,
      customer_note: input.customer_note,
    }
  }

  if (!input.delivery_date || !input.time_slot) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "A delivery date and time slot are required for courier delivery."
    )
  }

  return {
    method: "courier",
    delivery_date: input.delivery_date,
    time_slot: input.time_slot,
    recipient_phone: input.recipient_phone,
    customer_note: input.customer_note,
  }
}
