# MedusaJS Configuration Reference

## medusa-config.ts (backend/medusa-config.ts)

```typescript
import { loadEnv, defineConfig } from "@medusajs/framework/utils"

loadEnv(process.env.NODE_ENV || "development", process.cwd())

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET!,
      cookieSecret: process.env.COOKIE_SECRET!,
    },
  },

  modules: [
    // ── File Storage: MinIO (S3-compatible) ────────────────────
    {
      resolve: "@medusajs/file-s3",
      options: {
        s3_url: process.env.MINIO_ENDPOINT,           // http://minio:9000
        s3_bucket: process.env.MINIO_BUCKET,           // medusa-media
        s3_access_key_id: process.env.MINIO_ACCESS_KEY,
        s3_secret_access_key: process.env.MINIO_SECRET_KEY,
        s3_region: "us-east-1",                        // required by SDK, dummy value for MinIO
        s3_force_path_style: true,                     // REQUIRED for MinIO — never set to false
        file_url: `https://files.${process.env.DOMAIN}/medusa-media`,
      },
    },

    // ── Search: Meilisearch ────────────────────────────────────
    {
      resolve: "@medusajs/search-meilisearch",
      options: {
        config: {
          host: process.env.MEILISEARCH_HOST,          // http://meilisearch:7700
          apiKey: process.env.MEILISEARCH_API_KEY,
        },
        settings: {
          products: {
            indexSettings: {
              searchableAttributes: ["title", "description", "handle", "tags.value", "collection.title", "categories.name"],
              displayedAttributes: ["id", "title", "description", "handle", "thumbnail", "variants", "collection", "categories"],
              filterableAttributes: ["categories.id", "collection.id", "tags.id"],
              sortableAttributes: ["title", "created_at"],
            },
            primaryKey: "id",
          },
        },
      },
    },

    // ── Custom Marketplace Module ──────────────────────────────
    {
      resolve: "./src/modules/marketplace",
    },
  ],

  admin: {
    backendUrl: process.env.MEDUSA_BACKEND_URL || "http://localhost:9000",
  },
})
```

## Required NPM Packages

```bash
# File storage (MinIO via S3 compat)
npm install @medusajs/file-s3

# Search
npm install @medusajs/search-meilisearch

```
