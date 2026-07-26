import { model } from "@medusajs/framework/utils"

import ProductOptionTemplate from "./product-option-template"

const ProductOptionValue = model.define("vendor_product_option_template_value", {
  id: model.id().primaryKey(),
  value: model.text(),
  template: model.belongsTo(() => ProductOptionTemplate, {
    mappedBy: "values",
  }),
})

export default ProductOptionValue
