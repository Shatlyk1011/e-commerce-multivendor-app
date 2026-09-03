import { MedusaService } from "@medusajs/framework/utils";
import Vendor from "./models/vendor";
import VendorAdmin from "./models/vendor-admin";
import VendorOrderOperation from "./models/vendor-order-operation";
import SellerRequest from "./models/seller-request";

class MarketplaceModuleService extends MedusaService({
  Vendor,
  VendorAdmin,
  VendorOrderOperation,
  SellerRequest,
}) {}

export default MarketplaceModuleService;
