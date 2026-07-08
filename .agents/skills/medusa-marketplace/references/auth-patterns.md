# Authentication Patterns Reference

## Actor Types in This Project

| Actor | Auth Scope | Login Route |
|---|---|---|
| Customer | `customer` | `POST /auth/customer/emailpass` |
| Admin user | `user` | `POST /auth/user/emailpass` |
| **Vendor admin** | `vendor` | `POST /auth/vendor/emailpass` *(custom)* |

## Vendor Auth Provider (Custom)

```typescript
// backend/src/modules/marketplace/auth-provider.ts
import { AbstractAuthModuleProvider } from "@medusajs/framework/utils"
import { AuthIdentityDTO, AuthenticationInput } from "@medusajs/types"
import { MARKETPLACE_MODULE } from "./index"

class VendorAuthProvider extends AbstractAuthModuleProvider {
  static identifier = "emailpass"
  static DISPLAY_NAME = "Vendor Email/Password"

  async authenticate(data: AuthenticationInput, authIdentityService) {
    const { email, password } = data.body as { email: string; password: string }

    // Look up vendor admin by email
    const marketplaceService = this.container_.resolve(MARKETPLACE_MODULE)
    const [admin] = await marketplaceService.listVendorAdmins({ email })

    if (!admin) {
      return { success: false, error: "Invalid credentials" }
    }

    // Verify password (use bcrypt)
    const isValid = await this.verifyPassword(password, admin.password_hash)
    if (!isValid) {
      return { success: false, error: "Invalid credentials" }
    }

    return {
      success: true,
      authIdentity: { id: admin.auth_identity_id, entity_id: admin.id, provider: "emailpass" },
    }
  }
}

export default VendorAuthProvider
```

## Vendor Auth Middleware

```typescript
// backend/src/api/middlewares.ts
import { defineMiddlewares, authenticate } from "@medusajs/framework/http"

export default defineMiddlewares({
  routes: [
    // Protect all /vendor routes — require vendor JWT
    {
      matcher: "/vendor/*",
      middlewares: [authenticate("vendor", ["session", "bearer"])],
    },
    // Standard customer auth
    {
      matcher: "/store/me",
      middlewares: [authenticate("customer", ["session", "bearer"])],
    },
  ],
})
```

## Vendor Registration Flow

```typescript
// backend/src/api/store/vendors/route.ts — POST /store/vendors/register
import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { createVendorWorkflow } from "../../../workflows/create-vendor"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { name, handle, email, password } = req.body as any

  const { result } = await createVendorWorkflow(req.scope).run({
    input: { name, handle, email, password },
  })

  res.json({ vendor: result.vendor })
}
```

## Getting Current Vendor in a Route

```typescript
// Inside a protected /vendor route:
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  // req.auth_context.actor_id = VendorAdmin ID (set by authenticate middleware)
  const vendorAdminId = req.auth_context.actor_id

  const query = req.scope.resolve("query")
  const { data: [vendorAdmin] } = await query.graph({
    entity: "vendor_admin",
    fields: ["id", "email", "vendor.*"],
    filters: { id: vendorAdminId },
  })

  res.json({ vendor: vendorAdmin.vendor })
}
```

## Vendor-Scoped Product Listing

```typescript
// Only return products belonging to current vendor
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const vendorId = req.vendor.id  // resolved from vendor admin → vendor link

  const query = req.scope.resolve("query")
  const { data: products } = await query.graph({
    entity: "product",
    fields: ["id", "title", "status", "thumbnail", "variants.*"],
    filters: { "vendor.id": vendorId },
  })

  res.json({ products })
}
```
