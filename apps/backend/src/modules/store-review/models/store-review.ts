import { model } from "@medusajs/framework/utils";

const StoreReview = model
  .define("store_review", {
    id: model.id().primaryKey(),
    customer_id: model.text(),
    vendor_id: model.text(),
    checkout_order_id: model.text(),
    order_id: model.text(),
    author_name: model.text(),
    rating: model.number(),
    comment: model.text(),
    status: model.enum(["pending", "approved", "rejected"]).default("pending"),
  })
  .indexes([
    {
      name: "IDX_store_review_customer_vendor_checkout",
      on: ["customer_id", "vendor_id", "checkout_order_id"],
      unique: true,
    },
    { name: "IDX_store_review_vendor", on: ["vendor_id"] },
    { name: "IDX_store_review_status_created", on: ["status", "created_at"] },
  ]);

export default StoreReview;
