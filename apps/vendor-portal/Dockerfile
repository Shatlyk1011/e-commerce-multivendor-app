FROM node:20-alpine AS builder

RUN apk add --no-cache libc6-compat

WORKDIR /app

RUN npm install -g pnpm@10.33.3

# Copy monorepo settings and package configs
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/vendor-portal/package.json ./apps/vendor-portal/

RUN pnpm install --frozen-lockfile

# Copy vendor-portal source code
COPY apps/vendor-portal ./apps/vendor-portal

# Build Next.js vendor-portal
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm --filter @dtc/vendor-portal run build

# --- Runner Stage ---
FROM node:20-alpine AS runner

WORKDIR /app

RUN npm install -g pnpm@10.33.3

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/vendor-portal/package.json ./apps/vendor-portal/

RUN pnpm install --prod --frozen-lockfile

# Copy Next.js build artifacts
COPY --from=builder /app/apps/vendor-portal/.next ./apps/vendor-portal/.next
COPY --from=builder /app/apps/vendor-portal/public ./apps/vendor-portal/public

EXPOSE 3001

CMD ["pnpm", "--filter", "@dtc/vendor-portal", "run", "start"]
