# Running the Medusa E-Commerce Marketplace with Docker

This guide details how to build, run, configure, and manage the entire multivendor marketplace application stack using Docker Compose.

---

## 1. Services & Credentials

Below are the secure, auto-generated credentials configured in your [docker-compose.yml](file:///Users/shatlyk1011/Documents/GitHub/medusa-e-commerce/docker-compose.yml):

| Service | Container Port (Internal) | Host Port (External) | Credentials / Settings |
| :--- | :--- | :--- | :--- |
| **PostgreSQL** | `5432` | `5433` | **Database:** `medusa_db`<br>**User:** `medusa`<br>**Password:** `pg_pass_secure_dtc_839` |
| **Redis** | `6379` | `6379` | *Internal networking, no password* |
| **MinIO API** | `9000` | `9010` | **Access Key:** `medusa_admin`<br>**Secret Key:** `minio_secret_pass_7291` |
| **MinIO Console** | `9001` | `9001` | **Access Key:** `medusa_admin`<br>**Secret Key:** `minio_secret_pass_7291` |
| **Meilisearch** | `7700` | `7700` | **Master Key:** `meili_master_key_secure_92018374` |
| **Mailpit SMTP** | `1025` | `1025` | *Internal SMTP, no authentication* |
| **Mailpit Web UI** | `8025` | `8025` | *Web inbox access* |
| **Medusa API** | `9000` | `9000` | **Admin Dashboard:** `http://localhost:9000/app` |
| **Storefront** | `3000` | `3000` | **Next.js Buyer Front** |
| **Vendor Portal** | `3001` | `3001` | **Next.js Seller Front** |

---

## 2. Getting Started Instructions

### Prerequisites
Make sure you have [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running on your machine.

### Step 1: Start all containers
Run the following command from the project root to build the Next.js and Medusa images, then start all services in detached mode:
```bash
docker compose up -d --build
```

### Step 2: Initialize the Medusa Database (First-time run only)
Once the containers are running, execute database migrations and seed the initial store setup:
```bash
# 1. Run migrations and sync database links
docker compose exec medusa npx medusa db:migrate

# 2. Run the migration and data seed scripts
docker compose exec medusa npx medusa db:migrate:scripts
```

### Step 3: Create an Admin User (First-time run only)
Create a super admin account to access the Medusa Admin panel:
```bash
docker compose exec medusa npx medusa user -e admin@test.com -p supersecret
```
*You can now log in at [http://localhost:9000/app](http://localhost:9000/app) with `admin@test.com` and `supersecret`.*

### Step 4: Setup the MinIO Bucket (First-time run only)
MinIO requires the media bucket `medusa-media` to be created and set to public read access for product images:
```bash
# Configure the local alias
docker compose exec minio mc alias set local http://localhost:9000 medusa_admin minio_secret_pass_7291

# Create the bucket
docker compose exec minio mc mb local/medusa-media

# Set bucket policy to public read
docker compose exec minio mc anonymous set public local/medusa-media
```

---

## 3. URLs to Access the Applications

*   **Buyer Storefront:** [http://localhost:3000](http://localhost:3000)
*   **Vendor / Seller Portal:** [http://localhost:3001](http://localhost:3001)
*   **Medusa Admin Dashboard:** [http://localhost:9000/app](http://localhost:9000/app)
*   **MinIO Storage Console:** [http://localhost:9001](http://localhost:9001)
*   **Mailpit SMTP Inbox:** [http://localhost:8025](http://localhost:8025)

---

## 4. Maintenance & Stop Commands

*   **View live application logs:**
    ```bash
    docker compose logs -f
    ```
*   **Stop the application stack:**
    ```bash
    docker compose stop
    ```
*   **Stop and remove containers, networks, and configurations:**
    ```bash
    docker compose down
    ```
*   **Clean volumes / wipe databases to start completely fresh:**
    ```bash
    docker compose down -v
    ```
