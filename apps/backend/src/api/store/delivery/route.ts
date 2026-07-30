import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { getDeliveryShippingOptionCode, getPickupPoints } from "../../../lib/delivery"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { data: options } = await query.graph({
    entity: "shipping_option",
    fields: ["type.code"],
  })
  const optionCodes = new Set(
    options.map((option) => option.type?.code).filter((code): code is string => Boolean(code))
  )

  res.json({
    methods: [
      {
        id: "pickup",
        title: "Самовывоз из пункта выдачи",
        description: "Заберите заказ в удобном пункте выдачи.",
        shipping_option_code: getDeliveryShippingOptionCode("pickup", optionCodes),
      },
      {
        id: "courier",
        title: "Курьерская доставка",
        description: "Курьер доставит заказ по указанному адресу.",
        shipping_option_code: getDeliveryShippingOptionCode("courier", optionCodes),
      },
    ],
    pickup_points: getPickupPoints(),
  })
}
