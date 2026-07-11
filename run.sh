#!/bin/bash

# Set text colors
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${CYAN}===================================================${NC}"
echo -e "${CYAN}   Starting Medusa Marketplace Stack in Docker      ${NC}"
echo -e "${CYAN}===================================================${NC}"

# Check if docker is running
if ! docker info >/dev/null 2>&1; then
    echo -e "${YELLOW}Warning: Docker daemon is not running. Attempting to open Docker...${NC}"
    open -a Docker
    echo -e "Waiting for Docker daemon to start..."
    until docker info >/dev/null 2>&1; do
        sleep 2
    done
fi

# Start docker compose services
echo -e "${GREEN}Building and starting services...${NC}"
docker compose up -d --build

echo -e "\n${GREEN}Services successfully started!${NC}"
echo -e "${YELLOW}If this is your first run, make sure to execute the setup commands:${NC}"
echo -e "  1. Run migrations: ${CYAN}docker compose exec medusa npx medusa db:migrate${NC}"
echo -e "  2. Seed data:       ${CYAN}docker compose exec medusa npx medusa db:migrate:scripts${NC}"
echo -e "  3. Create Admin:    ${CYAN}docker compose exec medusa npx medusa user -e admin@test.com -p supersecret${NC}"
echo -e "  4. Setup MinIO:     ${CYAN}docker compose exec minio mc alias set local http://localhost:9000 medusa_admin minio_secret_pass_7291 && docker compose exec minio mc mb local/medusa-media && docker compose exec minio mc anonymous set public local/medusa-media${NC}"

echo -e "\n${YELLOW}Access URLs:${NC}"
echo -e "  - Buyer Storefront:       ${CYAN}http://localhost:3000${NC}"
echo -e "  - Vendor / Seller Portal: ${CYAN}http://localhost:3001${NC}"
echo -e "  - Medusa Admin Panel:     ${CYAN}http://localhost:9000/app${NC}"
echo -e "  - MinIO Storage Console:  ${CYAN}http://localhost:9001${NC}"
echo -e "  - Mailpit Sandbox Inbox:   ${CYAN}http://localhost:8025${NC}"
echo -e "${CYAN}===================================================${NC}"
