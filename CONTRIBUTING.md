# Contributing

Follow the root [README](README.md) to configure the workspace. Use pnpm 10.33.3 and the committed lockfile; do not add another package-manager lockfile.

## Proposing changes

Use this repository's Issues for reproducible bugs and feature proposals. Include the affected app, reproduction steps, expected/actual behavior, and sanitized logs. Discuss changes to payments, authentication, storage, or marketplace architecture before a large implementation.

Create a focused branch and pull request describing the problem, resulting behavior, and checks performed. Include screenshots for UI changes and document environment variables, API changes, migration requirements and known limitations. Never include local environment files, customer data, generated builds or working credentials.

## Architecture

- Keep marketplace business logic in backend workflows/modules and enforce vendor ownership at the API boundary.
- Keep API types shared through `packages/api-contracts` where applicable.
- Use self-hosted PostgreSQL, MinIO and Meilisearch; do not introduce hosted service dependencies without discussing the architecture.
- Preserve the Medusa dashboard patch in `patches/` and explain changes to it.
- Follow scoped `AGENTS.md` instructions when using coding assistants; local assistant settings are not prerequisites for human contributors.

## Validation

Run `pnpm lint`, `pnpm build`, and, for storefront translations, `pnpm --filter @dtc/storefront check:i18n`. Report existing failures separately from new failures rather than claiming a clean suite.

For backend changes, run `pnpm --filter @dtc/backend test:integration:http` against a disposable local PostgreSQL service. The test runner derives connection credentials from backend configuration and creates/drops isolated test databases; its user needs that permission. Never use a production database server for tests. The current HTTP suite covers store reviews, not every marketplace flow. No unit tests currently match the configured unit-test pattern.

For setup changes, verify a fresh database and follow the README through creating a vendor product and completing an order. Keep existing personal databases intact. Do not rerun the initial seed manually to reset a populated database.

## Licensing and conduct

Submit only code and assets you have permission to contribute under the repository's MIT license; preserve third-party notices. Keep discussion respectful and focused on the work. Use the [security reporting process](SECURITY.md) for vulnerabilities.
