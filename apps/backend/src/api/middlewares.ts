import { 
  defineMiddlewares, 
  authenticate, 
  validateAndTransformBody,
} from "@medusajs/framework/http"
import { PostVendorCreateSchema } from "./vendors/route"
import { AdminCreateProduct } from "@medusajs/medusa/api/admin/products/validators"

export default defineMiddlewares({
  routes: [
    // Admin vendor management routes (protected by admin auth)
    {
      matcher: "/admin/vendors",
      middlewares: [
        authenticate("user", ["session", "bearer", "api-key"]),
      ],
    },
    {
      matcher: "/admin/vendors/*",
      middlewares: [
        authenticate("user", ["session", "bearer", "api-key"]),
      ],
    },
    // Vendor-portal facing routes
    {
      matcher: "/vendors",
      method: ["POST"],
      middlewares: [
        authenticate("vendor", ["session", "bearer"], {
          allowUnregistered: true,
        }),
        validateAndTransformBody(PostVendorCreateSchema),
      ],
    },
    {
      matcher: "/vendors/*",
      middlewares: [
        authenticate("vendor", ["session", "bearer"]),
      ],
    },
    {
      matcher: "/vendors/products",
      method: ["POST"],
      middlewares: [
        validateAndTransformBody(AdminCreateProduct),
      ],
    },
  ],
})