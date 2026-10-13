# Architecture Reference

## Overview
Single VDS, all services in Docker Compose. Caddy handles SSL + reverse proxy.
No external payment gateway is integrated.

## Service Map

```
Internet
    │
    ▼
Caddy (80/443) — auto Let's Encrypt SSL
    │
    ├── shop.domain.com      → storefront:3000    (Next.js buyer)
    ├── vendors.domain.com   → vendor-portal:3001 (Next.js vendor)
    ├── api.domain.com       → medusa:9000         (Medusa API)
    ├── admin.domain.com     → medusa:9000/app     (Medusa Admin)
    └── files.domain.com     → minio:9000          (Public assets)

Internal Docker Network (not exposed):
    medusa:9000
        ├── postgres:5432    (PostgreSQL)
        ├── redis:6379       (Redis)
        ├── minio:9000       (S3 API)
        └── meilisearch:7700 (Search)
```

## VDS Requirements
- **CPU**: 8 vCPU (minimum 4)
- **RAM**: 16 GB (minimum 8 GB — MinIO + Postgres + Meilisearch + Medusa + 2×Next.js)
- **Disk**: 200 GB SSD (minimum 80 GB — MinIO needs room for product images)
- **OS**: Ubuntu 22.04 LTS
- **Docker**: 24+, Docker Compose v2+

## Port Map (internal only, not exposed to internet)
| Port | Service |
|---|---|
| 5432 | PostgreSQL |
| 6379 | Redis |
| 9000 | MinIO S3 API / Medusa API |
| 9001 | MinIO Console UI |
| 7700 | Meilisearch |
| 3000 | Next.js Storefront |
| 3001 | Next.js Vendor Portal |

> Caddy is the ONLY service that exposes ports 80 and 443 externally.
