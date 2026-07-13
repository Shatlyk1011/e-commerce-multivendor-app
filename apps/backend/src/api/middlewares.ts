import { 
  defineMiddlewares, 
  authenticate, 
  validateAndTransformBody,
} from "@medusajs/framework/http"
import { PostVendorCreateSchema } from "./vendors/route"
import { AdminCreateProduct } from "@medusajs/medusa/api/admin/products/validators"

export default defineMiddlewares({
  routes: [
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