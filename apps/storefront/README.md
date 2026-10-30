# Buyer storefront

Next.js 16 App Router buyer application: catalogue, categories/search UI, product variants, cart, checkout, phone-based accounts, favourites, orders and reviews.

Copy `.env.example` to `.env.local`. Set the backend URL and the publishable API key from your own seeded database, linked to its sales channel. Never use an admin token here. Set `NEXT_PUBLIC_STOREFRONT_URL` for canonical URLs. Restart dev/rebuild production after changing public environment variables.

From the repository root: `pnpm storefront:dev`. Open http://localhost:3000. Backend and MinIO must be available. Development phone login accepts `1234` and checkout does not process real card payments. The UI includes market-specific branding/copy and fixture content; audit it before adapting the app.

Follow the [root setup guide](../../README.md) for dependency startup, migrations and the first marketplace flow. See [contributing](../../CONTRIBUTING.md) and [security limitations](../../SECURITY.md).
