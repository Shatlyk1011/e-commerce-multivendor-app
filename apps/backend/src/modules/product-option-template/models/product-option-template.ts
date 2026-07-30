import { model } from "@medusajs/framework/utils";

import ProductOptionValue from "./product-option-value";

const ProductOptionTemplate = model.define("vendor_product_option_template", {
  id: model.id().primaryKey(),
  title: model.text().unique(),
  is_active: model.boolean().default(true),
  values: model.hasMany(() => ProductOptionValue, {
    mappedBy: "template",
  }),
});

export default ProductOptionTemplate;
