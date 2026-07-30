import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http";
import { MARKETPLACE_MODULE } from "../../../modules/marketplace";
import MarketplaceModuleService from "../../../modules/marketplace/service";
import { z } from "@medusajs/framework/zod";
import adminCreateVendorWorkflow from "../../../workflows/marketplace/admin-create-vendor";

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) {
  const marketplaceService: MarketplaceModuleService =
    req.scope.resolve(MARKETPLACE_MODULE);

  const {
    q,
    limit = "20",
    offset = "0",
  } = req.query as {
    q?: string;
    limit?: string;
    offset?: string;
  };

  const [vendors, count] = await marketplaceService.listAndCountVendors(
    q ? { name: { $ilike: `%${q}%` } } : {},
    {
      take: parseInt(limit),
      skip: parseInt(offset),
      relations: ["admins"],
    },
  );

  res.json({
    vendors,
    count,
    limit: parseInt(limit),
    offset: parseInt(offset),
  });
}

export const AdminCreateVendorSchema = z.strictObject({
  name: z.string(),
  handle: z.string(),
  logo: z.string().optional(),
  status: z.enum(["active", "disabled"]).optional(),
  status_reason: z.string().nullable().optional(),
  store_name: z.string().optional().nullable(),
  store_description: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  city: z.string().trim().min(1, "City is required"),
  admin: z.strictObject({
    email: z.string().email(),
    password: z.string().min(8),
    first_name: z.string().optional(),
    last_name: z.string().optional(),
  }),
});

type RequestBody = z.infer<typeof AdminCreateVendorSchema>;

export async function POST(
  req: AuthenticatedMedusaRequest<RequestBody>,
  res: MedusaResponse,
) {
  const { result } = await adminCreateVendorWorkflow(req.scope).run({
    input: req.validatedBody,
  });

  res.status(201).json({ vendor: result.vendor });
}
