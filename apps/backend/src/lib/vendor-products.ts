import type { VendorProduct } from "@dtc/api-contracts";

export const vendorProductFields = [
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
  "vendor.products.images.id",
  "vendor.products.images.url",
  "vendor.products.options.id",
  "vendor.products.options.title",
  "vendor.products.options.values.id",
  "vendor.products.options.values.value",
  "vendor.products.variants.id",
  "vendor.products.variants.title",
  "vendor.products.variants.sku",
  "vendor.products.variants.barcode",
  "vendor.products.variants.inventory_quantity",
  "vendor.products.variants.metadata",
  "vendor.products.variants.options.value",
  "vendor.products.variants.options.option.title",
  "vendor.products.variants.prices.id",
  "vendor.products.variants.prices.amount",
  "vendor.products.variants.prices.currency_code",
] as const;

type VendorProductGraph = {
  id: string;
  title: string;
  handle: string;
  thumbnail: string | null;
  status: string;
  categories?: Array<{ id: string; name: string }> | null;
  metadata?: Record<string, unknown> | null;
  images?: Array<{ id: string; url: string }> | null;
  weight?: number | null;
  length?: number | null;
  width?: number | null;
  height?: number | null;
  origin_country?: string | null;
  material?: string | null;
  options?: Array<{
    id: string;
    title: string;
    values?: Array<{ id: string; value: string }> | null;
  }> | null;
  variants?: Array<{
    id: string;
    title: string;
    sku?: string | null;
    barcode?: string | null;
    inventory_quantity?: number | null;
    metadata?: Record<string, unknown> | null;
    options?: Array<{ value: string; option?: { title: string } }> | null;
    prices?: Array<{
      id: string;
      amount: number;
      currency_code: string;
    }>;
  }>;
};

export const toVendorProduct = (product: VendorProductGraph): VendorProduct => ({
  id: product.id,
  title: product.title,
  handle: product.handle,
  thumbnail: product.thumbnail,
  status: product.status,
  categories: product.categories?.map((category) => ({
    id: category.id,
    name: category.name,
  })),
  metadata: product.metadata
    ? {
        keywords: Array.isArray(product.metadata.keywords)
          ? (product.metadata.keywords as string[])
          : undefined,
      }
    : null,
  images: product.images?.map((image) => ({ id: image.id, url: image.url })),
  weight: product.weight,
  length: product.length,
  width: product.width,
  height: product.height,
  origin_country: product.origin_country,
  material: product.material,
  options: product.options?.map((option) => ({
    id: option.id,
    title: option.title,
    values: option.values?.map((value) => ({ id: value.id, value: value.value })) ?? [],
  })),
  variants: product.variants?.map((variant) => ({
    id: variant.id,
    title: variant.title,
    sku: variant.sku,
    barcode: variant.barcode,
    inventory_quantity:
      variant.inventory_quantity ??
      (typeof variant.metadata?.inventory_quantity === "number"
        ? variant.metadata.inventory_quantity
        : typeof variant.metadata?.inventory_quantity === "string"
          ? parseInt(variant.metadata.inventory_quantity, 10)
          : null),
    options: variant.options?.map((option) => ({
      value: option.value,
      option: option.option ? { title: option.option.title } : undefined,
    })),
    prices: variant.prices?.map((price) => ({
      id: price.id,
      amount: price.amount,
      currency_code: price.currency_code,
    })),
  })),
});

export type { VendorProductGraph };
