# Medusa Marketplace

An early-stage, self-hosted multivendor marketplace built on Medusa. It includes a buyer-facing storefront, a seller portal, and custom Medusa Admin extensions for marketplace operations.

> **Project status:** engineering MVP / development environment. The local Docker stack is useful for development and demos. It is **not yet safe to expose directly on a public VDS**; see [VDS deployment](#vds-deployment) before deploying it.

## What is included

- **Buyer storefront** — catalogue browsing, product variants, cart and checkout, phone-based customer sign-in, delivery or pickup, favourites, orders, and product/store reviews.
- **Seller portal** — seller sign-in, product creation with media uploads and option templates, inventory-aware catalogue management, and order fulfilment/status updates.
- **Marketplace backend** — Medusa API and Admin dashboard, seller applications and vendor administration, vendor/product and vendor/order links, vendor order workflows, reviews, and custom delivery data.
- **Local platform services** — PostgreSQL, Redis, MinIO-compatible file storage, and Meilisearch.

## Applications and services

| Component            | Path / image           | Local address                                     | Purpose                                    |
| -------------------- | ---------------------- | ------------------------------------------------- | ------------------------------------------ |
| Storefront           | `apps/storefront`      | http://localhost:3000                             | Buyer experience                           |
| Seller portal        | `apps/vendor-portal`   | http://localhost:3001                             | Seller dashboard                           |
| Medusa API and Admin | `apps/backend`         | http://localhost:9000 / http://localhost:9000/app | Marketplace API and operations dashboard   |
| PostgreSQL 15        | `postgres:15-alpine`   | `localhost:5433`                                  | Primary database                           |
| Redis 7              | `redis:7-alpine`       | `localhost:6379`                                  | Cache and event infrastructure             |
| MinIO                | `minio/minio`          | http://localhost:9010 / http://localhost:9001     | Product and seller media / storage console |
| Meilisearch          | `getmeili/meilisearch` | http://localhost:7700                             | Search service provisioned for the stack   |

## Technology

- **Commerce:** Medusa v2.17 and custom TypeScript modules/workflows
- **Web apps:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4
- **Client state/data:** TanStack Query and Zustand
- **Platform:** Node.js 20, pnpm 10, Turborepo, Docker Compose
- **Data services:** PostgreSQL, Redis, MinIO, Meilisearch

The repo is a pnpm workspace. Shared API types live in `packages/api-contracts`.

## Quick start with Docker

### Prerequisites

- Docker Engine / Docker Desktop with Docker Compose v2
- At least 8 GB of available memory for a comfortable local build
- Ports `3000`, `3001`, `5433`, `6379`, `7700`, `9000`, `9001`, and `9010` available on the host

### First run

```bash
git clone <your-fork-url> medusa-e-commerce
cd medusa-e-commerce

# Keep local configuration out of Git. Change every placeholder before a real deployment.
cp .env.example .env

# Build and start the full local stack.
docker compose up -d --build

# Follow startup progress if needed.
docker compose logs -f medusa
```

On the first run, apply database migrations (including the repository's migration scripts) and create an administrator:

```bash
docker compose exec medusa pnpm --filter @dtc/backend exec medusa db:migrate --execute-safe-links

# Replace the email and password before running this command.
docker compose exec medusa pnpm --filter @dtc/backend exec medusa user \
  -e admin@example.test -p 'REPLACE_WITH_A_LONG_UNIQUE_PASSWORD'
```

The migration command runs migration scripts by default. Do **not** run the legacy `db:migrate:scripts` command a second time unless you understand that a script is idempotent; the initial catalogue/setup script is not designed as a repeatable demo reset.

Open the storefront at http://localhost:3000 and sign in to Admin at http://localhost:9000/app. Create seller accounts from the Admin dashboard, then use those credentials at http://localhost:3001.

### Useful Docker commands

```bash
# Container status and logs
docker compose ps
docker compose logs -f

# Stop the stack while preserving data
docker compose stop

# Stop and remove containers and network while preserving volumes
docker compose down

# Delete all local database, search, cache, and media data (irreversible)
docker compose down -v
```

The `minio-init` container creates the `medusa-media` bucket and allows public download access for media URLs. This is convenient locally; restrict storage access and publish only the necessary bucket paths in production.

## Credentials and development defaults

| Area                                               | Current behavior                                                                                                                 | What to do before production                                                                                               |
| -------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Customer sign-in                                   | The development OTP service accepts code `1234`; it does not send an SMS. This is **not** an email/password login.               | Replace `apps/backend/src/services/otp.ts` with a real OTP delivery and verification provider.                             |
| Medusa Admin                                       | No account is seeded. The email and password are the values supplied to `medusa user` above.                                     | Create a unique, strong account and protect `/app`.                                                                        |
| Seller portal                                      | No seller account is seeded. An administrator creates sellers and chooses their password; the UI requires at least 8 characters. | Use a proper invitation/reset flow and strong, unique passwords.                                                           |
| PostgreSQL, MinIO, Meilisearch, JWT/cookie secrets | The committed Compose file currently contains development values, and several service ports are published to the host.           | Move every secret to uncommitted environment/secret storage, rotate existing values, and remove public data-service ports. |

Never publish the development OTP code, example password, or current Compose credentials as production access details. If this repository has already been shared outside a trusted team, rotate every committed secret before making it public.

## Run from source

Docker is the recommended way to bring up dependencies locally. To run the three apps in watch mode instead:

```bash
corepack enable
pnpm install

# Configure a local backend database, Redis, MinIO, and CORS values first.
cp apps/backend/.env.template apps/backend/.env

pnpm backend:dev       # Medusa on :9000
pnpm storefront:dev    # Storefront on :3000
pnpm --filter @dtc/vendor-portal dev  # Seller portal on :3001
```

Common workspace commands:

```bash
pnpm build
pnpm lint
pnpm --filter @dtc/backend test:unit
```

## VDS deployment

### Recommended server baseline

For a small production deployment, start with Ubuntu 22.04 LTS, Docker 24+ and Docker Compose v2:

| Resource | Minimum | Recommended |
| -------- | ------: | ----------: |
| CPU      |  4 vCPU |      8 vCPU |
| Memory   |    8 GB |       16 GB |
| SSD      |   80 GB |      200 GB |

The extra disk capacity matters because MinIO stores catalogue and seller media.

### Important: the committed Compose file is development-only

`docker-compose.yml` currently publishes PostgreSQL, Redis, MinIO, Meilisearch, and application ports directly to the host. It also uses development secrets in the file and contains no reverse proxy/TLS configuration. **Do not run it unchanged on an Internet-facing VDS.**

Before a production VDS rollout, create and review a production Compose configuration that:

1. Uses uncommitted secret storage for database, MinIO, Meilisearch, JWT, and cookie credentials; rotate the values that have appeared in Git.
2. Removes `ports` from PostgreSQL, Redis, and Meilisearch so they are reachable only on the Docker network.
3. Adds a reverse proxy such as Caddy or Nginx that is the only public entry point (ports 80/443), terminates TLS, and routes distinct hostnames to the storefront, seller portal, API/Admin, and public media as appropriate.
4. Sets production CORS origins and public backend/media URLs, restricts MinIO bucket permissions, and uses a real SMS/OTP provider.
5. Sets up backups for the PostgreSQL and MinIO volumes, monitoring/log rotation, firewall rules, and a tested migration/rollback procedure.

`DOMAIN` and Caddy-related placeholders in `.env.example` describe an intended deployment shape, but the currently committed Compose file does not yet implement that production configuration. Treat a production deployment as a separate hardening task rather than following those placeholders as a working VDS guide.

## Known MVP gaps

- Customer authentication uses a fixed development OTP rather than real SMS delivery.
- The checkout uses Medusa's system/default payment provider; no live payment gateway is wired.
- Meilisearch is included in Docker but the backend configuration does not yet register a Medusa search/indexing integration.
- Production reverse proxy, TLS, secret management, backups, monitoring, and private networking are not committed.
