# Project Rules — Medusa E-Commerce Marketplace

## Architecture Mandate

This project is a **multivendor e-commerce marketplace** (Ozon-like) built with:
- **Backend**: MedusaJS v2 (Node.js)
- **Frontend**: Next.js 14+ (App Router)
- **Infrastructure**: Single VDS, fully self-hosted via Docker Compose

**ALWAYS trigger the `medusa-marketplace` skill** when working on any feature in this project.

## Strict Rules

### 1. Self-Hosted Only
- **NEVER** recommend or use AWS S3, Cloudflare R2, Supabase, Upstash, Algolia, SendGrid, Resend, or any other third-party cloud service.
- All storage → **MinIO** (self-hosted, S3-compatible)
- All search → **Meilisearch** (self-hosted)
- All email → **self-hosted SMTP** (Mailpit for dev, Postal for prod)
- Database → **PostgreSQL** in Docker
- Cache/Queue → **Redis** in Docker
- SSL/Proxy → **Caddy** (auto Let's Encrypt)
- **ONLY exception**: Stripe for payment processing

### 2. Infrastructure Pattern
- All services run in **Docker Compose** on a single VDS
- Port structure: Caddy on 80/443 proxies to internal services
- MinIO at `minio:9000` (internal), exposed via `files.domain.com`
- Medusa API at `api.domain.com`
- Buyer storefront at `shop.domain.com`
- Vendor portal at `vendors.domain.com`

### 3. Code Structure
```
medusa-e-commerce/
├── backend/          # MedusaJS v2 application
├── storefront/       # Next.js buyer storefront
├── vendor-portal/    # Next.js vendor dashboard
├── docker-compose.yml
├── Caddyfile
└── .env
```

### 4. MedusaJS Patterns
- Use **Module Links** to connect Vendor ↔ Product and Vendor ↔ Order
- Use **Workflows** for any multi-step business logic (commissions, payouts, order routing)
- Extend the Medusa Admin with **widgets** for vendor management
- Use the **Auth Module** with a custom `vendor` actor type for seller authentication
- File uploads always use `@medusajs/file-s3` pointing to MinIO with `s3_force_path_style: true`

### 5. Tech Versions
- MedusaJS: v2 (2.16+)
- Next.js: 14+ with App Router (NOT Pages Router)
- Node.js: 20+
- PostgreSQL: 15+
- Redis: 7+
- TypeScript: strict mode

### 6. TypeScript Types — MikroORM Entity Classes
- **NEVER** use Drizzle ORM (`drizzle-orm`) for module models — it is fundamentally incompatible with MedusaJS v2 (uses MikroORM internally, Drizzle would break migrations, query engine, and workflow transactions)
- Define **backend module models** using **MikroORM entity classes with decorators** (`@Entity`, `@Property`, `@OneToMany`, etc.) from `@mikro-orm/core`
- Types for **backend module data** come directly from the entity class itself — `Vendor`, `VendorAdmin`, etc. — no extra utility needed
- Export input/update types as `type CreateVendorInput = Pick<Vendor, ...>` in a `types/index.ts` file per module
- For types shared with **frontend** → define explicit `interface` / `type` in a `shared/types/` directory
- Drizzle may only be used as a **read-only secondary query client** for a completely isolated analytics microservice (not for any Medusa module data)

### 7. UI Design Mandate
- **ALWAYS** refer to and follow the specifications, colors, typography, and styling principles outlined in [.agents/DESIGN.md](file:///Users/shatlyk1011/Documents/GitHub/medusa-e-commerce/.agents/DESIGN.md) before writing or modifying any storefront or vendor portal UI components.

### 8. Desktop-First Responsive Design
- **ALWAYS** use a **desktop-first** approach for styling and layouts in Tailwind / CSS.
- For responsive media queries/modifiers, use max-width breakpoints (e.g., `max-xl:`, `max-lg:`, `max-md:`, `max-sm:`, `max-xs:`) to override desktop styles down for mobile/tablet screens.
- Avoid using `sm:`, `md:`, `lg:`, etc., which are mobile-first (min-width) breakpoints, unless explicitly required.
