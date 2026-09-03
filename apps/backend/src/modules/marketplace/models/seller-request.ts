import { model } from "@medusajs/framework/utils";

const SellerRequest = model.define("seller_request", {
  id: model.id().primaryKey(),
  name: model.text(),
  brand_name: model.text(),
  business_type: model.enum(["registered", "in_progress", "none"]),
  phone: model.text(),
  address: model.text(),
  status: model.enum(["new", "in_review", "approved", "rejected"]).default("new"),
});

export default SellerRequest;
