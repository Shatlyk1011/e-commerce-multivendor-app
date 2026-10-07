# Docker instructions

The authoritative Docker setup and VDS hardening guidance is in the root [README](README.md#quick-start-with-docker).

The commands below are the local development lifecycle:

```bash
docker compose up -d --build
docker compose ps
docker compose logs -f
docker compose stop
docker compose down
```

For a first run, apply migrations and create an Admin account as described in the README. Do not use this Compose file unchanged on a public VDS: it currently exposes data services on host ports and includes development credentials.
