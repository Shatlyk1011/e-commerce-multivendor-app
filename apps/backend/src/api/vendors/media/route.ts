import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http";
import {
  ContainerRegistrationKeys,
  MedusaError,
} from "@medusajs/framework/utils";
import uploadVendorMediaWorkflow from "../../../workflows/marketplace/upload-vendor-media";
import type { VendorMediaResponse } from "@dtc/api-contracts";

const transliteration: Record<string, string> = {
  а: "a",
  б: "b",
  в: "v",
  г: "g",
  д: "d",
  е: "e",
  ё: "yo",
  ж: "zh",
  з: "z",
  и: "i",
  й: "y",
  к: "k",
  л: "l",
  м: "m",
  н: "n",
  о: "o",
  п: "p",
  р: "r",
  с: "s",
  т: "t",
  у: "u",
  ф: "f",
  х: "h",
  ц: "ts",
  ч: "ch",
  ш: "sh",
  щ: "sch",
  ъ: "",
  ы: "y",
  ь: "",
  э: "e",
  ю: "yu",
  я: "ya",
};

const toVendorFolder = (value: string) =>
  value
    .toLowerCase()
    .split("")
    .map((character) => transliteration[character] ?? character)
    .join("")
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const POST = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) => {
  const files = req.files as Express.Multer.File[] | undefined;

  if (!files?.length) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "At least one image is required",
    );
  }

  if (files.some((file) => !file.mimetype.startsWith("image/"))) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Only image files can be uploaded",
    );
  }

  // memoryStorage is intentional here: the workflow writes these buffers to
  // MinIO. Keep the uploaded bytes binary instead of persisting a base64/data
  // URL representation as the object body.
  if (
    files.some(
      (file) => !Buffer.isBuffer(file.buffer) || file.buffer.length === 0,
    )
  ) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Uploaded image data is empty",
    );
  }

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
  const {
    data: [vendorAdmin],
  } = await query.graph({
    entity: "vendor_admin",
    fields: ["vendor.id", "vendor.handle", "vendor.store_name"],
    filters: {
      id: req.auth_context.actor_id,
    },
  });

  if (!vendorAdmin?.vendor) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      "Vendor account was not found",
    );
  }

  const folder =
    toVendorFolder(
      vendorAdmin.vendor.store_name ||
        vendorAdmin.vendor.handle ||
        vendorAdmin.vendor.id,
    ) || vendorAdmin.vendor.id;

  const { result: filesUploaded } = await uploadVendorMediaWorkflow(
    req.scope,
  ).run({
    input: {
      folder,
      files: files.map((file) => ({
        buffer: file.buffer,
        filename: file.originalname,
        mimeType: file.mimetype,
      })),
    },
  });

  const response: VendorMediaResponse = {
    files: filesUploaded,
    folder,
  };

  res.status(200).json(response);
};
