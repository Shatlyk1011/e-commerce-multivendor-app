# Frontend Reference — Storefront & Vendor Portal

## Storefront (Next.js — Buyer)

### Setup
```bash
# Clone the official Medusa Next.js starter
git clone https://github.com/medusajs/nextjs-starter-medusa storefront
cd storefront
npm install
```

### Environment Variables
```env
# storefront/.env.local
NEXT_PUBLIC_MEDUSA_BACKEND_URL=https://api.yourdomain.com
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_...   # from Medusa Admin → API Keys
NEXT_PUBLIC_MEILISEARCH_HOST=https://search.yourdomain.com
NEXT_PUBLIC_MEILISEARCH_API_KEY=...         # public (search-only) key
```

### Medusa JS SDK Setup (shared utility)
```typescript
// src/lib/medusa.ts
import Medusa from "@medusajs/js-sdk"

export const medusa = new Medusa({
  baseUrl: process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL!,
  publishableKey: process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY!,
  auth: {
    type: "session",
  },
})
```

### Key Storefront Pages
```
app/
├── (main)/
│   ├── page.tsx                    # Homepage / hero + featured products
│   ├── products/
│   │   ├── page.tsx                # Product listing with Meilisearch
│   │   └── [handle]/page.tsx       # Product detail
│   ├── vendors/
│   │   ├── page.tsx                # All vendors listing
│   │   └── [handle]/page.tsx       # Single vendor storefront
│   ├── cart/page.tsx
│   └── checkout/page.tsx
└── (auth)/
    ├── login/page.tsx
    └── register/page.tsx
```

### Vendor Page (storefront)
```typescript
// app/(main)/vendors/[handle]/page.tsx
import { medusa } from "@/lib/medusa"

export default async function VendorPage({ params }) {
  // Fetch vendor info from custom API
  const vendor = await fetch(
    `${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/store/vendors/${params.handle}`
  ).then(r => r.json())

  // Fetch vendor's products
  const { products } = await medusa.store.product.list({
    // filter by vendor handle via custom query param
    vendor_handle: params.handle,
  })

  return (
    <div>
      <h1>{vendor.name}</h1>
      {/* product grid */}
    </div>
  )
}
```

---

## Vendor Portal (Next.js — Sellers)

### Setup
```bash
# Create a fresh Next.js app for the vendor portal
npx create-next-app@latest vendor-portal --typescript --app --tailwind --src-dir
cd vendor-portal
npm install @medusajs/js-sdk
```

### Environment Variables
```env
# vendor-portal/.env.local
NEXT_PUBLIC_MEDUSA_BACKEND_URL=https://api.yourdomain.com
```

### Vendor SDK Setup
```typescript
// src/lib/vendor-client.ts
import Medusa from "@medusajs/js-sdk"

export const vendorClient = new Medusa({
  baseUrl: process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL!,
  auth: {
    type: "session",    // uses cookie-based session for vendor
  },
})

// Custom vendor API calls (not in standard SDK)
export const vendorApi = {
  getProfile: () =>
    fetch(`${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/vendor/profile`, {
      credentials: "include",
    }).then(r => r.json()),

  getProducts: () =>
    fetch(`${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/vendor/products`, {
      credentials: "include",
    }).then(r => r.json()),

  getOrders: () =>
    fetch(`${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/vendor/orders`, {
      credentials: "include",
    }).then(r => r.json()),
}
```

### Key Vendor Portal Pages
```
app/
├── (auth)/
│   ├── login/page.tsx              # Vendor login
│   └── register/page.tsx           # Vendor registration
└── (dashboard)/
    ├── layout.tsx                  # Auth guard + sidebar
    ├── page.tsx                    # Dashboard overview / stats
    ├── products/
    │   ├── page.tsx                # Product list
    │   ├── new/page.tsx            # Create product
    │   └── [id]/page.tsx           # Edit product
    ├── orders/
    │   ├── page.tsx                # Order list (vendor-scoped)
    │   └── [id]/page.tsx           # Order detail + fulfillment
    └── settings/
        └── page.tsx                # Vendor profile, payout settings
```

### Auth Guard Layout
```typescript
// app/(dashboard)/layout.tsx
"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function DashboardLayout({ children }) {
  const router = useRouter()

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/vendor/profile`, {
      credentials: "include",
    }).then(r => {
      if (!r.ok) router.push("/login")
    })
  }, [])

  return <div className="flex">{/* sidebar + children */}</div>
}
```

### Image Upload to MinIO (via Medusa)
```typescript
// In vendor portal — upload product image through Medusa's file API
async function uploadImage(file: File) {
  const formData = new FormData()
  formData.append("files", file)

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/vendor/uploads`,
    {
      method: "POST",
      body: formData,
      credentials: "include",
    }
  )
  const { files } = await res.json()
  // files[0].url = "https://files.domain.com/medusa-media/..."
  return files[0].url
}
```

## Dockerfile for Next.js Apps

```dockerfile
# Use for both storefront and vendor-portal
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

Add to `next.config.js`:
```javascript
module.exports = { output: "standalone" }
```
