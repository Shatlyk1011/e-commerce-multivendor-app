# Marketplace backend

Medusa 2.17.2 API and Admin. Custom modules cover marketplace vendors, product reviews, store reviews and product option templates. APIs live in `src/api`, multi-step operations in `src/workflows`, module links in `src/links`, Admin extensions in `src/admin`, and initial setup in `src/migration-scripts`.

Copy `.env.template` to `.env` and configure credentials using the root guide. Host-run PostgreSQL uses port **5433**. Migrations run initial setup scripts; do not manually repeat the initial seed. Customer OTP is a development stub.

From the repository root: `pnpm backend:dev`. The API is at http://localhost:9000 and Admin at http://localhost:9000/app. Run `pnpm --filter @dtc/backend test:integration:http` only with disposable local test infrastructure. The configured unit suite has no matching tests.

Follow the [root setup guide](../../README.md) for dependency startup, migrations and the first marketplace flow. See [contributing](../../CONTRIBUTING.md) and [security limitations](../../SECURITY.md).
