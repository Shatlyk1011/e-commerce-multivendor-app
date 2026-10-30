FROM node:20-alpine AS builder

RUN apk add --no-cache libc6-compat

WORKDIR /app

RUN npm install -g pnpm@10.33.3

# Copy monorepo settings and package configs
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY patches ./patches
COPY packages/api-contracts/package.json ./packages/api-contracts/
COPY apps/storefront/package.json ./apps/storefront/

RUN pnpm install --frozen-lockfile

# Copy workspace and storefront source code
COPY packages/api-contracts ./packages/api-contracts
COPY apps/storefront ./apps/storefront

# Build Next.js storefront
ARG NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000
ARG NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_STOREFRONT_URL=http://localhost:3000
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm --filter @dtc/storefront run build

# --- Runner Stage ---
FROM node:20-alpine AS runner

WORKDIR /app

RUN npm install -g pnpm@10.33.3

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY patches ./patches
COPY packages/api-contracts/package.json ./packages/api-contracts/
COPY apps/storefront/package.json ./apps/storefront/

# Skip workspace prepare hooks: Husky is a dev dependency, absent in this stage.
RUN pnpm install --prod --frozen-lockfile --ignore-scripts

# Copy Next.js build artifacts
COPY --from=builder /app/apps/storefront/.next ./apps/storefront/.next
COPY --from=builder /app/apps/storefront/public ./apps/storefront/public

EXPOSE 3000

CMD ["pnpm", "--filter", "@dtc/storefront", "run", "start"]
