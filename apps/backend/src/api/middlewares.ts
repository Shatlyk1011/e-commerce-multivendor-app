import { 
  defineMiddlewares, 
  authenticate, 
  validateAndTransformBody,
} from "@medusajs/framework/http"
import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { PostVendorCreateSchema } from "./vendors/route"
import { AdminCreateProduct } from "@medusajs/medusa/api/admin/products/validators"
import { AdminCreateVendorSchema } from "./admin/vendors/route"
import { AdminUpdateVendorSchema } from "./admin/vendors/[id]/route"
import { AdminResetVendorPasswordSchema } from "./admin/vendors/[id]/reset-password/route"


const vendorCorsMiddleware = (req: MedusaRequest, res: MedusaResponse, next: any) => {
  const origin = req.headers.origin
  const allowedOrigins = process.env.AUTH_CORS ? process.env.AUTH_CORS.split(",") : ["http://localhost:3001"]

  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin)
    res.setHeader("Access-Control-Allow-Credentials", "true")
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
    
    // Dynamically echo requested headers back, or fallback to standard ones
    const requestHeaders = req.headers["access-control-request-headers"]
    if (requestHeaders) {
      res.setHeader("Access-Control-Allow-Headers", requestHeaders)
    } else {
      res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, Cookie, x-publishable-key, x-medusa-locale")
    }
  }

  if (req.method === "OPTIONS") {
    res.status(200).end()
    return
  }

  next()
}

export default defineMiddlewares({
  routes: [
    // Admin vendor routes
    {
      matcher: "/admin/vendors",
      method: ["POST"],
      middlewares: [
        validateAndTransformBody(AdminCreateVendorSchema),
      ],
    },
    {
      matcher: "/admin/vendors/*",
      method: ["PATCH"],
      middlewares: [
        validateAndTransformBody(AdminUpdateVendorSchema),
      ],
    },
    {
      matcher: "/admin/vendors/*/reset-password",
      method: ["POST"],
      middlewares: [
        validateAndTransformBody(AdminResetVendorPasswordSchema),
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