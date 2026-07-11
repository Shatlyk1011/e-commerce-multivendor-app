FROM node:20-alpine AS builder

RUN apk add --no-cache libc6-compat python3 make g++

WORKDIR /app

RUN npm install -g pnpm@10.33.3

# Copy monorepo settings and package configs
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/backend/package.json ./apps/backend/

# Install all dependencies (development + production)
RUN pnpm install --frozen-lockfile

# Copy backend source code
COPY apps/backend ./apps/backend

# Build the Medusa application
RUN pnpm --filter @dtc/backend run build

# --- Runner Stage ---
FROM node:20-alpine AS runner

WORKDIR /app

RUN npm install -g pnpm@10.33.3

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/backend/package.json ./apps/backend/

# Install only production dependencies
RUN pnpm install --prod --frozen-lockfile

# Copy the built output from builder
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist

EXPOSE 9000

# Set production environment variable
ENV NODE_ENV=production

CMD ["pnpm", "--filter", "@dtc/backend", "run", "start"]
