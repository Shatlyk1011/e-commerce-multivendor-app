import { MedusaService } from "@medusajs/framework/utils"

import ProductOptionTemplate from "./models/product-option-template"
import ProductOptionValue from "./models/product-option-value"

class ProductOptionTemplateModuleService extends MedusaService({
  ProductOptionTemplate,
  ProductOptionValue,
}) {}

export default ProductOptionTemplateModuleService
