import { model } from "@medusajs/framework/utils"

const Review = model.define("product_review", {
  id: model.id().primaryKey(),
  product_id: model.text(),
  customer_id: model.text(),
  order_id: model.text(),
  author_name: model.text(),
  rating: model.number(),
  comment: model.text(),
  status: model.enum(["published", "hidden"]).default("published"),
  verified_purchase: model.boolean().default(true),
})

export default Review
