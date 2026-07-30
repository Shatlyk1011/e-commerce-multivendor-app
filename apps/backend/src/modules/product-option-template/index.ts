import { Module } from "@medusajs/framework/utils";

import ProductOptionTemplateModuleService from "./service";

export const PRODUCT_OPTION_TEMPLATE_MODULE = "productOptionTemplate";

export default Module(PRODUCT_OPTION_TEMPLATE_MODULE, {
  service: ProductOptionTemplateModuleService,
});
