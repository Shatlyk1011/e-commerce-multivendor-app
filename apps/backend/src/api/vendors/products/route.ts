import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http";
import type { HttpTypes } from "@medusajs/framework/types";
import createVendorProductWorkflow from "../../../workflows/marketplace/create-vendor-product";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import type { VendorProduct, VendorProductsResponse } from "@dtc/api-contracts";

type VendorCreateProduct = Omit<HttpTypes.AdminCreateProduct, "description">;

const toVendorProduct = (product: {
  id: string;
  title: string;
  handle: string;
  thumbnail: string | null;
  status: string;
  categories?: Array<{ id: string; name: string }> | null;
  metadata?: Record<string, unknown> | null;
  images?: Array<{ url: string }> | null;
  weight?: number | null;
  length?: number | null;
  width?: number | null;
  height?: number | null;
  origin_country?: string | null;
  material?: string | null;
  variants?: Array<{
    id: string;
    title: string;
    sku?: string | null;
    inventory_quantity?: number | null;
    metadata?: Record<string, unknown> | null;
    options?: Array<{ value: string; option?: { title: string } }> | null;
    prices?: Array<{
      amount: number;
      currency_code: string;
    }>;
  }>;
}): VendorProduct => ({
  id: product.id,
  title: product.title,
  handle: product.handle,
  thumbnail: product.thumbnail,
  status: product.status,
  categories: product.categories?.map((c) => ({ id: c.id, name: c.name })),
  metadata: product.metadata
    ? {
        keywords: Array.isArray(product.metadata.keywords)
          ? (product.metadata.keywords as string[])
          : undefined,
      }
    : null,
  images: product.images?.map((img) => ({ url: img.url })),
  weight: product.weight,
  length: product.length,
  width: product.width,
  height: product.height,
  origin_country: product.origin_country,
  material: product.material,
  variants: product.variants?.map((variant) => ({
    id: variant.id,
    title: variant.title,
    sku: variant.sku,
    inventory_quantity:
      variant.inventory_quantity ??
      (typeof variant.metadata?.inventory_quantity === 'number'
        ? variant.metadata.inventory_quantity
        : typeof variant.metadata?.inventory_quantity === 'string'
          ? parseInt(variant.metadata.inventory_quantity, 10)
          : null),
    options: variant.options?.map((opt) => ({
      value: opt.value,
      option: opt.option ? { title: opt.option.title } : undefined,
    })),
    prices: variant.prices?.map((price) => ({
      amount: price.amount,
      currency_code: price.currency_code,
    })),
  })),
});

export const POST = async (
  req: AuthenticatedMedusaRequest<VendorCreateProduct>,
  res: MedusaResponse,
) => {
  const { result } = await createVendorProductWorkflow(req.scope).run({
    input: {
      vendor_admin_id: req.auth_context.actor_id,
      product: req.validatedBody,
    },
  });

  res.json({
    product: result.product,
  });
};

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

  const {
    data: [vendorAdmin],
  } = await query.graph({
    entity: "vendor_admin",
    fields: [
      "vendor.products.id",
      "vendor.products.title",
      "vendor.products.handle",
      "vendor.products.thumbnail",
      "vendor.products.status",
      "vendor.products.metadata",
      "vendor.products.weight",
      "vendor.products.length",
      "vendor.products.width",
      "vendor.products.height",
      "vendor.products.origin_country",
      "vendor.products.material",
      "vendor.products.categories.id",
      "vendor.products.categories.name",
      "vendor.products.images.url",
      "vendor.products.variants.id",
      "vendor.products.variants.title",
      "vendor.products.variants.sku",
      "vendor.products.variants.inventory_quantity",
      "vendor.products.variants.metadata",
      "vendor.products.variants.options.value",
      "vendor.products.variants.options.option.title",
      "vendor.products.variants.prices.amount",
      "vendor.products.variants.prices.currency_code",
    ],
    filters: {
      id: [
        // ID of the authenticated vendor admin
        req.auth_context.actor_id,
      ],
    },
  });

  const response: VendorProductsResponse = {
    products: (vendorAdmin?.vendor?.products ?? [])
      .filter(
        (product): product is NonNullable<typeof product> => product !== null,
      )
      .map((p) => toVendorProduct(p as Parameters<typeof toVendorProduct>[0])),
  };

  res.json(response);
};
