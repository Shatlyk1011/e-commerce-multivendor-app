import { model } from "@medusajs/framework/utils";
import Vendor from "./vendor";

const VendorOrderOperation = model.define("vendor_order_operation", {
  id: model.id().primaryKey(),
  order_id: model.text().unique(),
  status: model.enum(["new", "courier_handoff", "cancelled"]),
  cancellation_reason: model.text().nullable(),
  updated_by_vendor_admin_id: model.text(),
  vendor: model.belongsTo(() => Vendor),
});

export default VendorOrderOperation;
