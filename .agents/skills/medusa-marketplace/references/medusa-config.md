# MedusaJS Configuration Reference

## medusa-config.ts (backend/medusa-config.ts)

```typescript
import { loadEnv, defineConfig } from "@medusajs/framework/utils"

loadEnv(process.env.NODE_ENV || "development", process.cwd())

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    redisUrl: process.env.REDIS_URL,
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

    // ── Email: Self-hosted SMTP ────────────────────────────────
    {
      resolve: "@medusajs/notification-sendgrid",  // works with any SMTP via config
      // OR use a custom SMTP notification provider:
      // resolve: "./src/modules/smtp-notification",
      options: {
        channels: ["email"],
        from: `noreply@${process.env.DOMAIN}`,
      },
    },

    // ── Event Bus: Redis ───────────────────────────────────────
    {
      resolve: "@medusajs/event-bus-redis",
      options: {
        redisUrl: process.env.REDIS_URL,
      },
    },

    // ── Cache: Redis ───────────────────────────────────────────
    {
      resolve: "@medusajs/cache-redis",
      options: {
        redisUrl: process.env.REDIS_URL,
        ttl: 30,
      },
    },

    // ── Workflow Engine: Redis ─────────────────────────────────
    {
      resolve: "@medusajs/workflow-engine-redis",
      options: {
        redis: {
          url: process.env.REDIS_URL,
        },
      },
    },

    // ── Payments: Stripe ───────────────────────────────────────
    {
      resolve: "@medusajs/payment-stripe",
      options: {
        apiKey: process.env.STRIPE_API_KEY,
        webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
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

# Infrastructure modules (Redis-based)
npm install @medusajs/event-bus-redis @medusajs/cache-redis @medusajs/workflow-engine-redis

# Payments
npm install @medusajs/payment-stripe

# SMTP notification (if using custom module)
npm install nodemailer
```

## Custom SMTP Notification Provider (for Mailpit/Postal)

```typescript
// src/modules/smtp-notification/index.ts
import { AbstractNotificationProviderService } from "@medusajs/framework/utils"
import nodemailer from "nodemailer"

class SmtpNotificationService extends AbstractNotificationProviderService {
  private transporter: nodemailer.Transporter

  constructor(_, options: { host: string; port: number; from: string }) {
    super()
    this.transporter = nodemailer.createTransport({
      host: options.host,
      port: options.port,
      secure: false,
    })
    this.from = options.from
  }

  async send(notification) {
    const { to, template, data } = notification
    await this.transporter.sendMail({
      from: this.from,
      to,
      subject: data.subject,
      html: data.html,
    })
    return { id: `smtp-${Date.now()}` }
  }
}

export default SmtpNotificationService
```
