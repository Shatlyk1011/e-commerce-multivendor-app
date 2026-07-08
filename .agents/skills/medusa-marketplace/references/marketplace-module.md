# Marketplace Module Reference — Vendor Data Models & Links

> [!NOTE]
> MedusaJS v2 supports **two ways** to define module models:
> 1. **DML** (`model.define()`) — Medusa's abstraction, use `InferTypeOf<>` for types
> 2. **MikroORM entities** (decorators) — gives TypeScript types **directly from class properties**
>
> This project uses **MikroORM entities with decorators** for full, explicit type annotations.
> Types come from the entity class itself — no extra utility needed.

## Vendor Data Model

```typescript
// backend/src/modules/marketplace/models/vendor.ts
import {
  Entity,
  Property,
  PrimaryKey,
  OneToMany,
  Collection,
  BeforeCreate,
} from "@mikro-orm/core"
import { generateEntityId } from "@medusajs/framework/utils"
import { VendorAdmin } from "./vendor-admin"

@Entity()
export class Vendor {
  @PrimaryKey({ columnType: "text" })
  id: string

  @Property({ columnType: "text" })
  name: string

  @Property({ columnType: "text", unique: true })
  handle: string                       // URL slug: vendors.domain.com/my-shop

  @Property({ columnType: "text", nullable: true })
  description: string | null = null

  @Property({ columnType: "text", nullable: true })
  logo_url: string | null = null

  @Property({ columnType: "boolean", default: false })
  is_approved: boolean = false

  @Property({ columnType: "real", default: 10 })
  commission_rate: number = 10         // platform % cut per sale

  @Property({ columnType: "text", nullable: true })
  stripe_account_id: string | null = null   // Stripe Connect

  @OneToMany(() => VendorAdmin, (admin) => admin.vendor, { cascade: ["persist", "soft-remove"] })
  admins = new Collection<VendorAdmin>(this)

  @Property({ columnType: "timestamptz", onCreate: () => new Date() })
  created_at: Date = new Date()

  @Property({ columnType: "timestamptz", onUpdate: () => new Date() })
  updated_at: Date = new Date()

  @BeforeCreate()
  onCreate() {
    this.id = generateEntityId(this.id, "vendor")
  }
}
```

```typescript
// backend/src/modules/marketplace/models/vendor-admin.ts
import {
  Entity,
  Property,
  PrimaryKey,
  ManyToOne,
  BeforeCreate,
} from "@mikro-orm/core"
import { generateEntityId } from "@medusajs/framework/utils"
import { Vendor } from "./vendor"

@Entity()
export class VendorAdmin {
  @PrimaryKey({ columnType: "text" })
  id: string

  @Property({ columnType: "text", unique: true })
  email: string

  @Property({ columnType: "text", nullable: true })
  first_name: string | null = null

  @Property({ columnType: "text", nullable: true })
  last_name: string | null = null

  @Property({ columnType: "text", nullable: true })
  password_hash: string | null = null

  @ManyToOne(() => Vendor, { columnType: "text", mapToPk: true })
  vendor_id: string

  @ManyToOne(() => Vendor, { persist: false })
  vendor: Vendor

  @Property({ columnType: "text", nullable: true })
  auth_identity_id: string | null = null   // links to Medusa Auth identity

  @Property({ columnType: "timestamptz", onCreate: () => new Date() })
  created_at: Date = new Date()

  @Property({ columnType: "timestamptz", onUpdate: () => new Date() })
  updated_at: Date = new Date()

  @BeforeCreate()
  onCreate() {
    this.id = generateEntityId(this.id, "vndradm")
  }
}
```

## TypeScript Types — Directly from Entity Classes

Because models are decorated MikroORM classes, their TypeScript types are the **classes themselves**. No extra utility needed.

```typescript
// backend/src/modules/marketplace/types/index.ts
// Re-export entity classes as the canonical DTO types
export type { Vendor } from "../models/vendor"
export type { VendorAdmin } from "../models/vendor-admin"

// Partial types for create/update inputs
export type CreateVendorInput = Pick<Vendor, "name" | "handle"> & Partial<Pick<Vendor, "description" | "logo_url" | "commission_rate">>
export type UpdateVendorInput = { id: string } & Partial<Pick<Vendor, "name" | "description" | "logo_url" | "is_approved" | "commission_rate" | "stripe_account_id">>

export type CreateVendorAdminInput = Pick<VendorAdmin, "email" | "vendor_id"> & Partial<Pick<VendorAdmin, "first_name" | "last_name">>
```

Use anywhere in the backend:
```typescript
import type { Vendor, CreateVendorInput } from "../modules/marketplace/types"

// Fully typed — IDE autocomplete works on all fields
function buildVendorResponse(vendor: Vendor) {
  return {
    id: vendor.id,                     // string
    name: vendor.name,                 // string
    handle: vendor.handle,             // string
    is_approved: vendor.is_approved,   // boolean
    commission_rate: vendor.commission_rate, // number
    created_at: vendor.created_at,     // Date
  }
}
```

## Module Service

```typescript
// backend/src/modules/marketplace/service.ts
import { MedusaService } from "@medusajs/framework/utils"
import { Vendor } from "./models/vendor"
import { VendorAdmin } from "./models/vendor-admin"

// MedusaService generates CRUD methods typed to your entity classes:
// createVendors(data): Promise<Vendor>
// updateVendors(data): Promise<Vendor>
// listVendors(filters): Promise<Vendor[]>
// deleteVendors(ids): Promise<void>
// ... same for VendorAdmin
class MarketplaceModuleService extends MedusaService({ Vendor, VendorAdmin }) {
  // Add custom methods here with full type safety:
  async approveVendor(vendorId: string): Promise<Vendor> {
    return this.updateVendors({ id: vendorId, is_approved: true })
  }

  async getVendorByHandle(handle: string): Promise<Vendor | null> {
    const [vendor] = await this.listVendors({ handle })
    return vendor ?? null
  }
}

export default MarketplaceModuleService
```


## Module Index

```typescript
// backend/src/modules/marketplace/index.ts
import { Module } from "@medusajs/framework/utils"
import MarketplaceModuleService from "./service"

export const MARKETPLACE_MODULE = "marketplaceModuleService"

export default Module(MARKETPLACE_MODULE, {
  service: MarketplaceModuleService,
})
```

## Module Links

```typescript
// backend/src/links/vendor-product.ts
import { defineLink } from "@medusajs/framework/utils"
import MarketplaceModule from "../modules/marketplace"
import ProductModule from "@medusajs/product"

export default defineLink(
  MarketplaceModule.linkable.vendor,
  ProductModule.linkable.product
)
```

```typescript
// backend/src/links/vendor-order.ts
import { defineLink } from "@medusajs/framework/utils"
import MarketplaceModule from "../modules/marketplace"
import OrderModule from "@medusajs/order"

export default defineLink(
  MarketplaceModule.linkable.vendor,
  OrderModule.linkable.order
)
```

```typescript
// backend/src/links/vendor-admin-user.ts
// Links VendorAdmin to Medusa's Auth identity
import { defineLink } from "@medusajs/framework/utils"
import MarketplaceModule from "../modules/marketplace"
import AuthModule from "@medusajs/auth"

export default defineLink(
  MarketplaceModule.linkable.vendorAdmin,
  AuthModule.linkable.authIdentity
)
```

## Key Workflows

### Create Vendor Workflow

```typescript
// backend/src/workflows/create-vendor.ts
import { createWorkflow, createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { MARKETPLACE_MODULE } from "../modules/marketplace"

const createVendorStep = createStep(
  "create-vendor-step",
  async (input: { name: string; handle: string; email: string }, { container }) => {
    const marketplaceService = container.resolve(MARKETPLACE_MODULE)

    const vendor = await marketplaceService.createVendors({ name: input.name, handle: input.handle })
    const admin = await marketplaceService.createVendorAdmins({ email: input.email, vendor_id: vendor.id })

    return new StepResponse({ vendor, admin }, { vendorId: vendor.id, adminId: admin.id })
  },
  // Compensation: roll back on failure
  async (ids, { container }) => {
    const svc = container.resolve(MARKETPLACE_MODULE)
    await svc.deleteVendors(ids.vendorId)
    await svc.deleteVendorAdmins(ids.adminId)
  }
)

export const createVendorWorkflow = createWorkflow("create-vendor", (input) => {
  return createVendorStep(input)
})
```

### Approve Vendor Workflow

```typescript
// backend/src/workflows/approve-vendor.ts
import { createWorkflow, createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { MARKETPLACE_MODULE } from "../modules/marketplace"

const approveVendorStep = createStep(
  "approve-vendor-step",
  async ({ vendorId }: { vendorId: string }, { container }) => {
    const svc = container.resolve(MARKETPLACE_MODULE)
    const vendor = await svc.updateVendors({ id: vendorId, is_approved: true })
    return new StepResponse(vendor, vendorId)
  },
  async (vendorId, { container }) => {
    const svc = container.resolve(MARKETPLACE_MODULE)
    await svc.updateVendors({ id: vendorId, is_approved: false })
  }
)

export const approveVendorWorkflow = createWorkflow("approve-vendor", (input) => {
  return approveVendorStep(input)
})
```

## Querying Linked Data

```typescript
// Example: get products with their vendor
const { data: products } = await query.graph({
  entity: "product",
  fields: ["id", "title", "vendor.*"],
})

// Example: get vendor's orders
const { data: orders } = await query.graph({
  entity: "order",
  fields: ["id", "status", "vendor.*"],
  filters: { "vendor.id": vendorId },
})
```

---

## TypeScript Types (InferTypeOf — NOT Drizzle)

MedusaJS v2 provides `InferTypeOf` to derive fully typed interfaces directly from your DML model definitions. This covers everything Drizzle would be used for in terms of type safety.

### Deriving Types from Models

```typescript
// backend/src/modules/marketplace/types/index.ts
import { InferTypeOf } from "@medusajs/framework/types"
import Vendor from "../models/vendor"
import VendorAdmin from "../models/vendor-admin"

// Full entity type (all fields + relations resolved)
export type VendorDTO = InferTypeOf<typeof Vendor>
export type VendorAdminDTO = InferTypeOf<typeof VendorAdmin>

// Use in service methods, API routes, and workflows
```

### Using Types in API Routes

```typescript
// backend/src/api/vendor/profile/route.ts
import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { VendorDTO } from "../../../modules/marketplace/types"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const vendor = req.vendor as VendorDTO   // fully typed

  res.json({
    vendor: {
      id: vendor.id,           // string
      name: vendor.name,       // string
      handle: vendor.handle,   // string
      is_approved: vendor.is_approved,  // boolean
      commission_rate: vendor.commission_rate, // number
    },
  })
}
```

### Using Types in Workflows

```typescript
import { InferTypeOf } from "@medusajs/framework/types"
import Vendor from "../modules/marketplace/models/vendor"

type VendorDTO = InferTypeOf<typeof Vendor>

const approveVendorStep = createStep(
  "approve-vendor-step",
  async ({ vendorId }: { vendorId: string }, { container }) => {
    const svc = container.resolve(MARKETPLACE_MODULE)
    const vendor: VendorDTO = await svc.updateVendors({ id: vendorId, is_approved: true })
    return new StepResponse(vendor, vendorId)
  }
)
```

### Shared Types for Frontend (vendor-portal)

```typescript
// shared/types/vendor.ts — share between backend and frontend via a shared package
export interface Vendor {
  id: string
  name: string
  handle: string
  description: string | null
  logo_url: string | null
  is_approved: boolean
  commission_rate: number
  stripe_account_id: string | null
  created_at: string
  updated_at: string
}

export interface VendorAdmin {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  vendor_id: string
}

// In vendor-portal, import and use these for fetch response typing
const res = await fetch("/vendor/profile")
const { vendor }: { vendor: Vendor } = await res.json()
```

### Why NOT Drizzle for Types

| Concern | Drizzle approach | Medusa DML approach |
|---|---|---|
| Type generation | `pgTable()` definitions | `model.define()` + `InferTypeOf<>` |
| ORM compatibility | Breaks MikroORM internals | Native, no conflicts |
| Migrations | Drizzle Kit (separate) | `npx medusa db:migrate` |
| Remote query | ❌ Not supported | ✅ Built-in `query.graph()` |
| Workflow transactions | ❌ Manual | ✅ Automatic compensation |
| Module Links | ❌ Not supported | ✅ `defineLink()` |
