import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { MARKETPLACE_MODULE } from "../../../../modules/marketplace"
import MarketplaceModuleService from "../../../../modules/marketplace/service"

type LinkVendorStockLocationInput = {
  vendor_id: string
  stock_location_id: string
}

/**
 * Persists the stock location ID on the vendor record so the
 * create-vendor-product workflow can resolve the correct location
 * without querying all global stock locations.
 */
const linkVendorStockLocationStep = createStep(
  "link-vendor-stock-location",
  async (input: LinkVendorStockLocationInput, { container }) => {
    const marketplaceService: MarketplaceModuleService =
      container.resolve(MARKETPLACE_MODULE)

    // Store previous value for rollback
    const original = await marketplaceService.retrieveVendor(input.vendor_id)

    await marketplaceService.updateVendors({
      id: input.vendor_id,
      stock_location_id: input.stock_location_id,
    })

    return new StepResponse(
      { vendor_id: input.vendor_id, stock_location_id: input.stock_location_id },
      { vendor_id: input.vendor_id, previous_stock_location_id: original.stock_location_id ?? null }
    )
  },
  // Compensation: restore the previous stock_location_id on rollback
  async (rollbackData, { container }) => {
    if (!rollbackData) return

    const marketplaceService: MarketplaceModuleService =
      container.resolve(MARKETPLACE_MODULE)

    await marketplaceService.updateVendors({
      id: rollbackData.vendor_id,
      stock_location_id: rollbackData.previous_stock_location_id,
    })
  }
)

export default linkVendorStockLocationStep
