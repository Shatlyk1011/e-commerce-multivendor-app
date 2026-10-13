---
name: medusa-marketplace
description: |
  Architecture and implementation guide for the Ozon-like multivendor e-commerce marketplace.
  Trigger this skill for ANY task in this project: backend features, frontend components,
  Docker/infra changes, new modules, API routes, vendor logic, payments, search, file uploads,
  or email. This skill enforces the self-hosted single-VDS architecture and correct MedusaJS v2 patterns.

  Trigger immediately for:
  - Any MedusaJS backend work (modules, workflows, API routes, admin extensions)
  - Any Next.js storefront or vendor portal work
  - Docker Compose / infrastructure changes
  - File upload / storage implementation (always MinIO)
  - Search implementation (always Meilisearch)
  - Authentication (vendor auth, customer auth, admin auth)
  - Database migrations or data model changes
  - Vendor/seller management features
  - Order routing or commission logic

  DO NOT use:
  - AWS S3, Cloudflare R2, or any hosted object storage
  - Algolia, Typesense (cloud), or any hosted search
  - SendGrid, Resend, Postmark, or any cloud email service
  - Supabase, PlanetScale, or any hosted database
  - Upstash or any hosted Redis
  - Any third-party service
---

# Medusa Marketplace Skill

This skill contains the complete architecture decisions, patterns, and implementation guidance
for the multivendor e-commerce marketplace project. Read the reference files for detailed specs.

## Quick Reference

### Tech Stack (All Self-Hosted on Single VDS)
| Layer | Technology |
|---|---|
| Commerce Backend | MedusaJS v2 (2.16+) |
| Buyer Storefront | Next.js 14+ (App Router) |
| Vendor Portal | Next.js 14+ (App Router) |
| Database | PostgreSQL 15 (Docker) |
| Cache + Events | Redis 7 (Docker) |
| Object Storage | MinIO (S3-compatible) |
| Search | Meilisearch |
| SSL + Proxy | Caddy (auto Let's Encrypt) |
| Payments | Medusa system/default provider |
| Container Orchestration | Docker Compose |

### Project Directory Layout
```
medusa-e-commerce/
├── backend/                        # MedusaJS v2 app
│   ├── src/
│   │   ├── modules/
│   │   │   └── marketplace/        # Custom Vendor module
│   │   │       ├── models/
│   │   │       │   ├── vendor.ts
│   │   │       │   └── vendor-admin.ts
│   │   │       ├── service.ts
│   │   │       └── index.ts
│   │   ├── links/
│   │   │   ├── vendor-product.ts   # Vendor ↔ Product link
│   │   │   └── vendor-order.ts     # Vendor ↔ Order link
│   │   ├── api/
│   │   │   ├── vendor/             # Vendor-facing routes
│   │   │   └── store/              # Storefront-facing routes
│   │   ├── workflows/
│   │   │   ├── create-vendor.ts
│   │   │   ├── approve-vendor.ts
│   │   │   └── calculate-commission.ts
│   │   └── admin/                  # Admin UI extensions
│   │       └── widgets/
│   └── medusa-config.ts
├── storefront/                     # Next.js buyer app
├── vendor-portal/                  # Next.js vendor dashboard
├── docker-compose.yml
├── Caddyfile
└── .env
```

## Step 1: Read Reference Files

Before implementing any feature, read the relevant reference file:

- **Architecture & Infrastructure**: `references/architecture.md`
- **Marketplace Module (Vendor data models)**: `references/marketplace-module.md`
- **Docker Compose & Caddyfile**: `references/infrastructure.md`
- **MedusaJS config (MinIO, Redis, Meilisearch)**: `references/medusa-config.md`
- **Authentication patterns**: `references/auth-patterns.md`
- **Storefront & Vendor Portal**: `references/frontend.md`

## Step 2: Key Implementation Rules

### MinIO (File Storage)
- ALWAYS use `@medusajs/file-s3` with `s3_force_path_style: true`
- Internal endpoint: `http://minio:9000`
- Public URL via Caddy: `https://files.yourdomain.com/medusa-media`
- Bucket: `medusa-media` with public read access

### Meilisearch (Search)
- Use the `@medusajs/search-meilisearch` plugin
- Internal host: `http://meilisearch:7700`
- Index products on create/update via event subscriber

### Vendor Authentication
- Use Medusa's Auth Module with a custom `vendor` actor type
- Vendors authenticate separately from customers and admins
- Protect vendor routes with vendor JWT middleware

### Module Links Pattern
```typescript
// src/links/vendor-product.ts
import { defineLink } from "@medusajs/framework/utils"
import MarketplaceModule from "../modules/marketplace"
import ProductModule from "@medusajs/product"

export default defineLink(
  MarketplaceModule.linkable.vendor,
  ProductModule.linkable.product
)
```

### Workflow Pattern
```typescript
// Always use workflows for multi-step logic
import { createWorkflow, createStep } from "@medusajs/framework/workflows-sdk"

const createVendorStep = createStep("create-vendor-step", async (input, { container }) => {
  const marketplaceService = container.resolve("marketplaceModuleService")
  return await marketplaceService.createVendor(input)
})

export const createVendorWorkflow = createWorkflow("create-vendor", (input) => {
  return createVendorStep(input)
})
```

### Docker Environment Variables
Always reference `.env` for secrets. Never hardcode:
```
POSTGRES_PASSWORD=
MINIO_ROOT_USER=
MINIO_ROOT_PASSWORD=
MEILI_MASTER_KEY=
MEILI_PUBLIC_KEY=
MEDUSA_BACKEND_URL=
JWT_SECRET=
COOKIE_SECRET=
```

## Step 3: Domain Subdomain Map

| Subdomain | Service | Docker container |
|---|---|---|
| `shop.domain.com` | Buyer storefront | `storefront:3000` |
| `vendors.domain.com` | Vendor portal | `vendor-portal:3001` |
| `api.domain.com` | Medusa backend | `medusa:9000` |
| `admin.domain.com` | Medusa admin dashboard | `medusa:9000/app` |
| `files.domain.com` | MinIO public assets | `minio:9000` |

## Step 4: Common Mistakes to Avoid

1. **Do NOT** use `s3_force_path_style: false` with MinIO — it will break
2. **Do NOT** run Next.js in `next build` during development — use `next dev`
3. **Do NOT** expose PostgreSQL or Redis ports publicly — keep them internal
4. **Do NOT** use the Pages Router in Next.js — only App Router
5. **Do NOT** store vendor products without linking them via Module Links
6. **Do NOT** use `any` type in TypeScript — strict mode is enforced
7. **Do NOT** create API routes without proper authentication middleware for vendor/admin routes
