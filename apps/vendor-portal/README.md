# Seller portal

Next.js 16 App Router seller application: email/password login, catalogue and media, product variants/inventory, order operations and store settings.

Copy `.env.example` to `.env.local`, set the backend URL and your database’s publishable API key. Create a vendor account from Medusa Admin before logging in; customer OTP and Admin credentials are separate. Restart dev/rebuild production after changing public environment variables.

From the repository root: `pnpm --filter @dtc/vendor-portal dev`. Open http://localhost:3001. When running a production build directly, use `pnpm --filter @dtc/vendor-portal start --port 3001`; the default Next.js start port is 3000.

Follow the [root setup guide](../../README.md) for dependency startup, migrations and the first marketplace flow. See [contributing](../../CONTRIBUTING.md) and [security limitations](../../SECURITY.md).
