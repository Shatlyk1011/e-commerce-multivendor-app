import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http";

import { PRODUCT_OPTION_TEMPLATE_MODULE } from "../../../modules/product-option-template";
import ProductOptionTemplateModuleService from "../../../modules/product-option-template/service";

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) {
  const service: ProductOptionTemplateModuleService = req.scope.resolve(
    PRODUCT_OPTION_TEMPLATE_MODULE,
  );
  const templates = await service.listProductOptionTemplates(
    { is_active: true },
    { relations: ["values"], order: { title: "ASC" } },
  );

  res.json({ product_option_templates: templates });
}
