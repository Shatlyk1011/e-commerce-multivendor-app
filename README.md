# Medusa Marketplace

A self-hosted multivendor marketplace built with Medusa v2, Next.js, and TypeScript. The buyer storefront currently uses the **Bugday** name. This monorepo contains a storefront, seller portal, and marketplace extensions for Medusa Admin.

**Status: early engineering MVP.** Suitable for local development and contributions. Customer login uses a fixed development OTP and checkout uses the system payment provider. Do not expose this stack to the Internet or use real customer data yet. See [release readiness](docs/OPEN_SOURCE_READINESS.md).

## Features and limits

These features have implementations in the repository; this is not a claim that every flow has passed end-to-end testing.

| Area | Implemented | Current limits |
| --- | --- | --- |
| Buyer catalogue | Categories, search UI, product variants, cart, favourites | Meilisearch is provisioned but indexing/search integration is absent |
| Buyer accounts | Phone sign-in, profile, addresses, order history | OTP accepts `1234`; no SMS is sent |
| Checkout | Delivery/pickup selection, vendor order grouping, order delivery metadata | System/default payment provider; no live gateway or seller payouts |
| Reviews | Product review eligibility and editing; store reviews and moderation | Review flows need broader integration coverage |
| Seller portal | Email/password sign-in, products and media, inventory, orders and fulfilment, store settings | Admin creates accounts and resets passwords; no self-service invitation flow |
| Marketplace Admin | Vendor management, seller applications, option templates, store review moderation, delivery/order operations | Production operations and audit coverage remain work in progress |
| Localization | Russian/Turkmen UI resources, Turkmenistan/TMT seed configuration | Market-specific copy, delivery locations, branding and demo content need adaptation |
| Infrastructure | PostgreSQL, MinIO media bucket, Meilisearch container | Local Compose only; no production TLS/proxy, backup or monitoring stack |

## Repository and stack

| Path | Purpose | Local URL |
| --- | --- | --- |
| `apps/backend` | Medusa 2.17.2 API, Admin, custom modules and workflows | http://localhost:9000 / http://localhost:9000/app |
| `apps/storefront` | Next.js 16 / React 19 buyer app | http://localhost:3000 |
| `apps/vendor-portal` | Next.js 16 / React 19 seller app | http://localhost:3001 |
| `packages/api-contracts` | Shared TypeScript API contracts | — |
| `patches` | Local Medusa dashboard patch used by pnpm | — |

The workspace uses pnpm **10.33.3**, Turborepo, TypeScript, Tailwind CSS 4, TanStack Query and Zustand. Use Node.js **20.9 or newer** (the Dockerfiles use Node 20). PostgreSQL 15, MinIO and Meilisearch run locally in Docker. Allow roughly 8 GB of memory for local builds.

## Local development (recommended)

Run commands from the repository root unless stated otherwise. You need Git, Node.js, pnpm and Docker Compose v2. The ports below must be free.

### 1. Install and configure

```bash
git clone https://github.com/Shatlyk1011/multivendor-app.git
cd multivendor-app
corepack enable
pnpm install --frozen-lockfile
cp .env.example .env
cp apps/backend/.env.template apps/backend/.env
cp apps/storefront/.env.example apps/storefront/.env.local
cp apps/vendor-portal/.env.example apps/vendor-portal/.env.local
```

Generate separate values with `openssl rand -hex 32` for the root `.env` database, MinIO, Meilisearch, JWT and cookie secrets. In `apps/backend/.env`, set:

- `DATABASE_URL` to `postgresql://medusa:YOUR_ROOT_POSTGRES_PASSWORD@localhost:5433/medusa_db` (adjust user/database if changed).
- `MINIO_ACCESS_KEY` and `MINIO_SECRET_KEY` to the root MinIO credentials.
- `JWT_SECRET`, `COOKIE_SECRET` and `MEILISEARCH_API_KEY` to the corresponding root values.

Use hex database passwords in this example; other passwords may need URL encoding in `DATABASE_URL`. Environment files are ignored by Git and Docker builds. Templates contain placeholders, not shared working credentials.

### 2. Start dependencies and initialize the database

```bash
docker compose up -d postgres minio minio-init meilisearch
docker compose ps
pnpm --filter @dtc/backend exec medusa db:migrate --execute-safe-links
pnpm --filter @dtc/backend exec medusa user \
  -e admin@example.test -p 'REPLACE_WITH_A_LONG_UNIQUE_PASSWORD'
pnpm backend:dev
```

Wait for PostgreSQL to accept connections before migrating. Migrations also run the repository's migration scripts, including initial store/catalogue setup. Do not manually rerun `initial-data-seed.ts` or use a legacy seed command as a reset: it creates data and is not designed to be repeated. No admin or seller credentials are seeded.

The seed creates TMT/USD regions, a Default Sales Channel, a publishable API key, shipping setup and sample products. Demo product images reference external Medusa-hosted URLs; uploaded marketplace media uses your MinIO bucket.

### 3. Connect the web apps

Open http://localhost:9000/app and sign in with the admin account you created. Under **Settings → Publishable API Keys**, copy **Default Publishable API Key** and verify that it is linked to **Default Sales Channel**. Set `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` in both web apps' `.env.local` files. Never place admin credentials or the Meilisearch master key in a `NEXT_PUBLIC_*` variable.

Start each app in a separate terminal:

```bash
pnpm storefront:dev
pnpm --filter @dtc/vendor-portal dev
```

Restart the web apps after changing environment values. For compiled Next.js apps these public values are embedded at build time, so rebuild after changes.

### 4. Try a marketplace flow

1. In Admin, create a vendor and its login credentials from **Vendors**. Seller applications are reviewed separately; submitting an application does not create a working login.
2. Sign in at http://localhost:3001. Create/publish a product with a variant, price, media and available inventory. Check its sales-channel availability in Admin if it is not visible to buyers.
3. Open http://localhost:3000, sign in with a test phone number and development code `1234`, and add the vendor product to the cart.
4. Choose delivery or pickup and complete the system-provider checkout. This does not charge a real card.
5. Inspect the resulting order in the seller portal and Admin and exercise fulfilment/status updates.

Use a seller-created product to test vendor order routing; the generic seed catalogue does not create seller accounts or vendor/product links.

## Full Docker stack (experimental)

The Compose file also builds the three apps. This path still needs a clean-machine smoke test; use the source workflow above if a build fails. Configure the root `.env` first, then:

```bash
docker compose build medusa
docker compose up -d postgres minio minio-init meilisearch
# One-off commands work before the application can start on an empty database.
docker compose run --rm medusa pnpm --filter @dtc/backend exec medusa db:migrate --execute-safe-links
docker compose run --rm medusa pnpm --filter @dtc/backend exec medusa user \
  -e admin@example.test -p 'REPLACE_WITH_A_LONG_UNIQUE_PASSWORD'
docker compose up -d medusa
```

Retrieve the publishable key from Admin as above, save it as `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` in the root `.env`, then build the web apps:

```bash
docker compose up -d --build storefront vendor-portal
docker compose logs -f medusa
```

The containers use browser-visible `http://localhost:9000` URLs. This configuration targets a browser on the Docker host, not remote clients. All published ports bind to `127.0.0.1`:

| Service | Host port |
| --- | --- |
| PostgreSQL | 5433 |
| MinIO API / console | 9010 / 9001 |
| Meilisearch | 7700 |
| API / storefront / seller portal | 9000 / 3000 / 3001 |

`minio-init` creates `medusa-media` and enables public downloads for that bucket. Do not upload private documents to it. If you change the bucket name, update the public media URL too.

```bash
docker compose stop       # Stop; preserve containers and data
docker compose down       # Remove containers/network; preserve volumes
# DESTRUCTIVE: deletes local database, media and search volumes
docker compose down -v
```

Changing PostgreSQL credentials in `.env` does not change the password in an existing database volume. Update the existing database deliberately or use a separate fresh development volume. Never delete a volume containing data you need.

## Checks and troubleshooting

```bash
pnpm lint
pnpm build
pnpm --filter @dtc/storefront check:i18n
# Requires a dedicated local PostgreSQL instance/user able to create test databases:
pnpm --filter @dtc/backend test:integration:http
```

The HTTP integration suite currently covers store reviews. There are no matching backend unit tests yet; `test:unit` is not a useful release gate. Root `pnpm test` and `backend:seed` do not currently run the HTTP suite or initial seed script. See [contributing](CONTRIBUTING.md) for validation expectations.

| Symptom | Check |
| --- | --- |
| Database connection refused | PostgreSQL ready; host apps use port 5433, containers use `postgres:5432` |
| Empty catalogue / rejected Store API calls | Publishable key belongs to this database, has the sales channel, and app was restarted/rebuilt |
| Upload fails / image missing | MinIO credentials, successful `minio-init`, bucket and `MINIO_PUBLIC_URL` |
| Browser CORS error | Backend `STORE_CORS` / `AUTH_CORS` include the actual browser origins |
| Seller cannot sign in | Admin-created vendor account; customer OTP and Admin accounts are separate |
| Full Docker build fails | Use source setup and include sanitized build logs in an issue; Docker path is experimental |

## Production and release roadmap

Production deployment needs real OTP delivery/verification and abuse protection, payment integration if charging buyers, seller payout/commission design, private data-service networking, TLS/reverse proxy, secret rotation, backups with restore tests, monitoring, and broader authorization/checkout tests. Meilisearch indexing is also unfinished. There is no committed production Caddy configuration.

Before publishing the repository, complete the separate [open-source readiness checklist](docs/OPEN_SOURCE_READINESS.md), especially history/secret scanning and third-party asset attribution. Publishing source does not require claiming production readiness.

## Contributing, security and license

Contributions are welcome; start with [CONTRIBUTING.md](CONTRIBUTING.md). Report vulnerabilities using [SECURITY.md](SECURITY.md), without posting credentials or customer data in public issues.

The repository includes the [MIT license](LICENSE), retaining the upstream Medusa copyright notice. Dependency licenses and bundled media/font permissions must be reviewed separately; see [third-party notices](THIRD_PARTY_NOTICES.md). This is an independent marketplace project built on Medusa.
