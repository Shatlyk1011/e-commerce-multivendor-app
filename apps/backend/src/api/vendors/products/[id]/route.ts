import type { VendorProductResponse } from "@dtc/api-contracts";
import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http";
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils";
import { z } from "@medusajs/framework/zod";

import {
  toVendorProduct,
  vendorProductFields,
  type VendorProductGraph,
} from "../../../../lib/vendor-products";
import updateVendorProductWorkflow from "../../../../workflows/marketplace/update-vendor-product";

const nullableNonNegativeNumber = z.number().nonnegative().nullable();

export const VendorUpdateProductSchema = z.object({
  title: z.string().trim().min(1).max(255),
  handle: z.string().trim().min(1).max(255),
  thumbnail: z.string().url().nullable(),
  images: z
    .array(
      z.object({
        id: z.string().optional(),
        url: z.string().url(),
      }),
    )
    .max(10),
  categories: z.array(z.object({ id: z.string().min(1) })).min(1).max(1),
  metadata: z.object({
    keywords: z.array(z.string().trim().min(1).max(64)).max(20),
  }),
  weight: nullableNonNegativeNumber,
  length: nullableNonNegativeNumber,
  width: nullableNonNegativeNumber,
  height: nullableNonNegativeNumber,
  origin_country: z.string().trim().min(2).max(2).nullable(),
  material: z.string().trim().max(255).nullable(),
  options: z.array(
    z.object({
      id: z.string().optional(),
      title: z.string().trim().min(1),
      values: z.array(z.string().trim().min(1)).min(1),
    }),
  ),
  variants: z
    .array(
      z.object({
        id: z.string().optional(),
        title: z.string().trim().min(1).max(255),
        sku: z.string().trim().max(255).nullable(),
        barcode: z.string().trim().max(255).nullable(),
        options: z.record(z.string(), z.string()),
        price: z.number().positive(),
        price_id: z.string().optional(),
        inventory: z.number().int().nonnegative(),
      }),
    )
    .min(1),
});

export type VendorUpdateProduct = z.infer<typeof VendorUpdateProductSchema>;

const retrieveVendorProduct = async (
  req: AuthenticatedMedusaRequest,
): Promise<VendorProductGraph> => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
  const {
    data: [vendorAdmin],
  } = await query.graph({
    entity: "vendor_admin",
    fields: [...vendorProductFields],
    filters: { id: req.auth_context.actor_id },
  });
  const product = vendorAdmin?.vendor?.products?.find(
    (candidate) => candidate?.id === req.params.id,
  );

  if (!product) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      "Product not found or does not belong to this vendor.",
    );
  }

  return product as VendorProductGraph;
};

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse<VendorProductResponse>,
) => {
  const product = await retrieveVendorProduct(req);
  res.json({ product: toVendorProduct(product) });
};

export const POST = async (
  req: AuthenticatedMedusaRequest<VendorUpdateProduct>,
  res: MedusaResponse<VendorProductResponse>,
) => {
  await updateVendorProductWorkflow(req.scope).run({
    input: {
      vendor_admin_id: req.auth_context.actor_id,
      product_id: req.params.id,
      product: req.validatedBody,
    },
  });

  const product = await retrieveVendorProduct(req);
  res.json({ product: toVendorProduct(product) });
};
