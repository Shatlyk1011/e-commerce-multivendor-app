import { model } from "@medusajs/framework/utils";
import VendorAdmin from "./vendor-admin";

const Vendor = model.define("vendor", {
  id: model.id().primaryKey(),
  handle: model.text().unique(),
  name: model.text(),
  logo: model.text().nullable(),
  status: model.enum(["active", "disabled"]).default("active"),
  status_reason: model.text().nullable(),
  store_name: model.text().nullable(),
  store_description: model.text().nullable(),
  address: model.text().nullable(),
  city: model.text().nullable(),
  stock_location_id: model.text().nullable(),
  admins: model.hasMany(() => VendorAdmin, {
    mappedBy: "vendor",
  }),
});

export default Vendor;
