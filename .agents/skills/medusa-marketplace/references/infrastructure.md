# Infrastructure Reference — Docker Compose & Caddyfile

## docker-compose.yml

```yaml
version: '3.9'

services:

  # ── Database ──────────────────────────────────────────────────
  postgres:
    image: postgres:15-alpine
    restart: always
    environment:
      POSTGRES_DB: medusa_db
      POSTGRES_USER: medusa
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - internal

  # ── Object Storage (S3-compatible) ───────────────────────────
  minio:
    image: minio/minio
    restart: always
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: ${MINIO_ROOT_USER}
      MINIO_ROOT_PASSWORD: ${MINIO_ROOT_PASSWORD}
    volumes:
      - minio_data:/data
    networks:
      - internal
      - web   # exposed via Caddy for public file access

  # ── Full-text Search ──────────────────────────────────────────
  meilisearch:
    image: getmeili/meilisearch:latest
    restart: always
    environment:
      MEILI_MASTER_KEY: ${MEILI_MASTER_KEY}
    volumes:
      - meilisearch_data:/meili_data
    networks:
      - internal

  # ── Medusa Backend ────────────────────────────────────────────
  medusa:
    build:
      context: ./backend
      dockerfile: Dockerfile
    restart: always
    depends_on:
      - postgres
      - minio
      - meilisearch
    env_file: .env
    environment:
      DATABASE_URL: postgres://medusa:${POSTGRES_PASSWORD}@postgres:5432/medusa_db
      MINIO_ENDPOINT: http://minio:9000
      MINIO_ACCESS_KEY: ${MINIO_ROOT_USER}
      MINIO_SECRET_KEY: ${MINIO_ROOT_PASSWORD}
      MINIO_BUCKET: medusa-media
      MEILISEARCH_HOST: http://meilisearch:7700
      MEILISEARCH_API_KEY: ${MEILI_MASTER_KEY}
      JWT_SECRET: ${JWT_SECRET}
      COOKIE_SECRET: ${COOKIE_SECRET}
      STORE_CORS: https://shop.${DOMAIN}
      ADMIN_CORS: https://admin.${DOMAIN}
      AUTH_CORS: https://shop.${DOMAIN},https://vendors.${DOMAIN}
    networks:
      - internal
      - web

  # ── Storefront (Next.js — Buyer) ──────────────────────────────
  storefront:
    build:
      context: ./storefront
      dockerfile: Dockerfile
    restart: always
    environment:
      NEXT_PUBLIC_MEDUSA_BACKEND_URL: https://api.${DOMAIN}
      NEXT_PUBLIC_MEILISEARCH_HOST: http://meilisearch:7700
      NEXT_PUBLIC_MEILISEARCH_API_KEY: ${MEILI_PUBLIC_KEY}
    depends_on:
      - medusa
    networks:
      - internal
      - web

  # ── Vendor Portal (Next.js — Sellers) ─────────────────────────
  vendor-portal:
    build:
      context: ./vendor-portal
      dockerfile: Dockerfile
    restart: always
    environment:
      NEXT_PUBLIC_MEDUSA_BACKEND_URL: https://api.${DOMAIN}
    depends_on:
      - medusa
    networks:
      - internal
      - web

  # ── Reverse Proxy + SSL ───────────────────────────────────────
  caddy:
    image: caddy:alpine
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile:ro
      - caddy_data:/data
      - caddy_config:/config
    depends_on:
      - medusa
      - storefront
      - vendor-portal
      - minio
    networks:
      - web

networks:
  internal:
    driver: bridge
  web:
    driver: bridge

volumes:
  postgres_data:
  minio_data:
  meilisearch_data:
  caddy_data:
  caddy_config:
```

## .env Template

```env
# Domain
DOMAIN=yourdomain.com

# Database
POSTGRES_PASSWORD=change_me_strong_password

# MinIO
MINIO_ROOT_USER=minio_admin
MINIO_ROOT_PASSWORD=change_me_strong_password

# Meilisearch
MEILI_MASTER_KEY=change_me_master_key_32_chars_min
MEILI_PUBLIC_KEY=change_me_public_search_key

# Medusa
JWT_SECRET=change_me_jwt_secret_32_chars_min
COOKIE_SECRET=change_me_cookie_secret_32_chars
```

## Caddyfile

```caddy
# Buyer storefront
shop.{$DOMAIN} {
  reverse_proxy storefront:3000
}

# Vendor / Seller portal
vendors.{$DOMAIN} {
  reverse_proxy vendor-portal:3001
}

# Medusa API + Admin
api.{$DOMAIN} {
  reverse_proxy medusa:9000
}

# MinIO — public read for product images
files.{$DOMAIN} {
  reverse_proxy minio:9000
}
```

## First-Run Setup Commands

```bash
# 1. SSH into VDS and install Docker
curl -fsSL https://get.docker.com | sh
usermod -aG docker $USER

# 2. Clone the project
git clone https://github.com/your-org/medusa-e-commerce.git
cd medusa-e-commerce

# 3. Copy and fill in .env
cp .env.example .env
nano .env

# 4. Start all services
docker compose up -d

# 5. Create MinIO bucket (run once)
docker compose exec minio mc alias set local http://localhost:9000 $MINIO_ROOT_USER $MINIO_ROOT_PASSWORD
docker compose exec minio mc mb local/medusa-media
docker compose exec minio mc anonymous set public local/medusa-media

# 6. Run Medusa migrations
docker compose exec medusa npx medusa db:migrate
```
