import { loadEnv, defineConfig } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET,
      cookieSecret: process.env.COOKIE_SECRET,
    },
  },
  featureFlags: {
    translation: true,
  },
  modules: [
    {
      resolve: "@medusajs/translation",
    },
    {
      resolve: "@medusajs/file",
      options: {
        providers: [
          {
            resolve: "@medusajs/file-s3",
            id: "minio",
            options: {
              bucket: process.env.MINIO_BUCKET || "medusa-media",
              region: process.env.MINIO_REGION || "us-east-1",
              endpoint: process.env.MINIO_ENDPOINT || "http://localhost:9010",
              access_key_id: process.env.MINIO_ACCESS_KEY || process.env.MINIO_ROOT_USER,
              secret_access_key: process.env.MINIO_SECRET_KEY || process.env.MINIO_ROOT_PASSWORD,
              file_url: process.env.MINIO_PUBLIC_URL || "http://localhost:9010/medusa-media",
              additional_client_config: {
                forcePathStyle: true,
              },
            },
          },
        ],
      },
    },
    {
      resolve: "@medusajs/medusa/auth",
      options: {
        providers: [
          {
            resolve: "@medusajs/auth-emailpass",
            id: "emailpass",
          },
          {
            resolve: "./src/providers/phone-otp",
            id: "phoneotp",
          },
        ],
      },
    },
    {
      resolve: "./src/modules/marketplace/",
    },
  ],
});
