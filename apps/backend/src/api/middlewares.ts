import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import {
  defineMiddlewares,
  authenticate,
  validateAndTransformBody,
} from "@medusajs/framework/http";
import {
  MedusaRequest,
  MedusaResponse,
  AuthenticatedMedusaRequest,
} from "@medusajs/framework/http";
import { PostVendorCreateSchema } from "./vendors/route";
import { CreateProduct } from "@medusajs/medusa/api/admin/products/validators";
import { AdminCreateVendorSchema } from "./admin/vendors/route";
import { AdminUpdateVendorSchema } from "./admin/vendors/[id]/route";
import { AdminResetVendorPasswordSchema } from "./admin/vendors/[id]/reset-password/route";
import { otpMiddlewares } from "./store/auth/otp/middlewares";
import { CreateReviewSchema } from "./store/products/[id]/reviews/middlewares";
import { AdminCreateProductOptionTemplateSchema } from "./admin/product-option-templates/route";
import { CompleteVendorOrderSchema } from "./store/carts/[id]/complete-vendor/route";
// import { CategoryTranslationsSchema } from "./admin/product-categories/translations/route";
import multer from "multer";

export const VendorCreateProductSchema = CreateProduct.omit({
  description: true,
});

const vendorMediaUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    files: 10,
    fileSize: 10 * 1024 * 1024,
  },
});

const vendorCorsMiddleware = (
  req: MedusaRequest,
  res: MedusaResponse,
  next: any,
) => {
  const origin = req.headers.origin;
  const allowedOrigins = process.env.AUTH_CORS
    ? process.env.AUTH_CORS.split(",")
    : ["http://localhost:3001"];

  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS",
    );

    // Dynamically echo requested headers back, or fallback to standard ones
    const requestHeaders = req.headers["access-control-request-headers"];
    if (requestHeaders) {
      res.setHeader("Access-Control-Allow-Headers", requestHeaders);
    } else {
      res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization, X-Requested-With, Cookie, x-publishable-key, x-medusa-locale",
      );
    }
  }

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  next();
};

const checkVendorStatusMiddleware = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
  next: any,
) => {
  if (!req.auth_context?.actor_id) {
    return next();
  }

  try {
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
    const {
      data: [vendorAdmin],
    } = await query.graph({
      entity: "vendor_admin",
      fields: ["id", "vendor.status", "vendor.status_reason"],
      filters: {
        id: [req.auth_context.actor_id],
      },
    });

    if (!vendorAdmin) {
      return res.status(404).json({ message: "Vendor admin not found" });
    }

    if (vendorAdmin.vendor?.status === "disabled") {
      const reason = vendorAdmin.vendor.status_reason
        ? `: ${vendorAdmin.vendor.status_reason}`
        : "";
      return res.status(403).json({
        message: `Аккаунт заблокирован. Причина: ${reason}`,
      });
    }
  } catch (error) {
    console.error("Error checking vendor status in middleware:", error);
    return res
      .status(500)
      .json({ message: "Internal server error during vendor status check" });
  }

  next();
};

export default defineMiddlewares({
  routes: [
    ...otpMiddlewares,
    {
      matcher: "/store/auth/me",
      method: ["GET"],
      middlewares: [
        authenticate("customer", ["session", "bearer"], {
          allowUnauthenticated: true,
        }),
      ],
    },
    {
      matcher: "/store/products/*/reviews",
      method: ["POST"],
      middlewares: [
        authenticate("customer", ["session", "bearer"]),
        validateAndTransformBody(CreateReviewSchema),
      ],
    },
    {
      matcher: "/store/products/*/reviews/eligibility",
      method: ["GET"],
      middlewares: [authenticate("customer", ["session", "bearer"])],
    },
    {
      matcher: "/store/reviews/me",
      method: ["GET"],
      middlewares: [authenticate("customer", ["session", "bearer"])],
    },
    {
      matcher: "/store/reviews/*",
      method: ["POST"],
      middlewares: [
        authenticate("customer", ["session", "bearer"]),
        validateAndTransformBody(CreateReviewSchema),
      ],
    },
    {
      matcher: "/store/carts/*/complete-vendor",
      method: ["POST"],
      middlewares: [
        authenticate("customer", ["session", "bearer"]),
        validateAndTransformBody(CompleteVendorOrderSchema),
      ],
    },
    // Admin vendor routes
    {
      matcher: "/admin/vendors",
      method: ["POST"],
      middlewares: [validateAndTransformBody(AdminCreateVendorSchema)],
    },
    {
      matcher: "/admin/vendors/*",
      method: ["PATCH"],
      middlewares: [validateAndTransformBody(AdminUpdateVendorSchema)],
    },
    {
      matcher: "/admin/vendors/*/reset-password",
      method: ["POST"],
      middlewares: [validateAndTransformBody(AdminResetVendorPasswordSchema)],
    },
    {
      matcher: "/admin/product-option-templates",
      method: ["POST"],
      middlewares: [
        validateAndTransformBody(AdminCreateProductOptionTemplateSchema),
      ],
    },

    // Vendor-portal facing routes
    {
      matcher: "/vendors",
      method: ["POST", "OPTIONS"],
      middlewares: [
        vendorCorsMiddleware,
        authenticate("vendor", ["session", "bearer"], {
          allowUnregistered: true,
        }),
        validateAndTransformBody(PostVendorCreateSchema),
      ],
    },
    {
      matcher: "/vendors/*",
      middlewares: [
        vendorCorsMiddleware,
        authenticate("vendor", ["session", "bearer"]),
        checkVendorStatusMiddleware,
      ],
    },
    {
      matcher: "/vendors/products",
      method: ["POST"],
      middlewares: [validateAndTransformBody(VendorCreateProductSchema)],
    },
    {
      matcher: "/vendors/media",
      method: ["POST"],
      // Let multer consume the multipart stream. The default JSON/urlencoded
      // parser must not run before it, otherwise req.files is empty and the
      // upload route can fail with a generic 500.
      bodyParser: false,
      middlewares: [vendorMediaUpload.array("files", 10)],
    },
  ],
});
