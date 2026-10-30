# Open-source readiness review

Reviewed 2026-10-28. Scope: repository documentation, tracked file inventory, application structure, environment configuration and container definitions. This was not a penetration test, comprehensive dependency/license audit or full Git-history secret scan.

## Assessment

The project has a useful open-source MVP foundation: an MIT license, separated apps, shared contracts, custom marketplace workflows, migrations and one HTTP integration suite. It should be presented as an experimental development project. Publication still needs the owner checks below; production readiness is a separate, larger milestone.

## Addressed in this review

- Replaced starter app READMEs with project-specific setup pointers and architecture summaries.
- Documented fresh database setup, publishable API keys, seller onboarding, seed limits and supported checks.
- Added contribution/security guidance and an asset attribution inventory.
- Replaced committed Compose credentials with required environment settings and removed the public Meilisearch master-key variable and database-specific publishable key.
- Bound local ports to loopback; excluded local env files and generated Medusa output from Docker build contexts.
- Corrected the backend Docker artifact path, seller container port and Next.js public build arguments.

These changes do not rotate credentials already in use or remove old values from Git history. They also change local connection behavior: remote clients can no longer reach published Docker ports directly.

## Before making the repository public

- [ ] Rotate every previously committed credential that was ever used, including database/storage/search credentials and JWT/cookie secrets. Invalidate affected sessions/tokens where appropriate.
- [ ] Run a secret scanner over **all Git history and refs**, then review findings, branches, tags, large files, fixtures and personal information. Coordinate any required history rewrite with collaborators. No history rewrite was performed in this review.
- [ ] Confirm ownership and redistribution rights for contributions and assets. Complete `THIRD_PARTY_NOTICES.md`, especially bundled font license texts, seller imagery and branding. Preserve the existing upstream MIT notice.
- [ ] Audit resolved dependency vulnerabilities and license compatibility, and triage findings. No clean dependency audit is claimed here.
- [ ] Enable GitHub private vulnerability reporting or publish a real private security contact; update `SECURITY.md` with that route and the support policy.
- [ ] Reproduce README setup on a clean checkout and fresh disposable database. Verify Admin login, seller creation, product upload/listing, buyer login, cart, checkout and seller fulfilment.
- [ ] Add passing CI for meaningful lint/build/integration checks; there was no `.github` CI configuration at review time. Establish baseline failures first rather than adding a nominal green gate.
- [ ] Publish a clearly labeled MVP release with limitations and contribution priorities. Review repository description, topics and issue/PR templates as desired.

No tracked `.env`, app `.env.local`, or backend `.env` was found in the current index. A targeted history lookup of those exact paths returned no commits; this does **not** clear renamed files, other secret-bearing files or full history. Known earlier credentials were in Compose, not these env files.

## Before hosting real customers

- Replace fixed OTP authentication with real verification, expiration, rate limits and abuse prevention.
- Validate vendor/customer authorization boundaries with integration tests, including cross-vendor access.
- Validate cart completion, stock, cancellation/refund behavior and multi-vendor order consistency.
- Integrate real payment processing if required and design seller commission/settlement/payout workflows; these are not complete marketplace finance features.
- Add a production reverse proxy/TLS stack, private service network, secret management, monitoring and tested backups/restores.
- Pin/review infrastructure image versions (MinIO and Meilisearch currently use `latest`).
- Implement search indexing before advertising Meilisearch-backed search.
- Replace market-specific placeholder content and verify privacy, retention and operational requirements for the intended deployment.

## Validation limits

Docker was installed but its daemon was unavailable during this review, so no images, databases or end-to-end flows were started. The Docker setup remains experimental pending a clean-stack smoke test. Existing local environment files and databases were not changed. Validation results:

| Check | Result |
| --- | --- |
| `pnpm build` | Passed for backend, storefront and seller portal using existing installed dependencies/local configuration |
| `docker compose --env-file .env.example config --quiet` | Passed; validates configuration, not runtime behavior |
| `git diff --check` | Passed |
| `pnpm lint` | Failed: 3 existing storefront errors; backend and seller lint completed with warnings |
| `pnpm --filter @dtc/storefront check:i18n` | Failed: 117 strings missing Turkmen translations |
| Jest test discovery | One HTTP integration file: `store-reviews.spec.ts`; integration tests not executed |
| Docker build / fresh database smoke test | Not run: Docker daemon unavailable |

The build is not proof of a fresh frozen-lockfile installation or container startup. Docker runner dependency installation skips lifecycle scripts so the dev-only Husky prepare hook is not invoked; validate native runtime dependencies during the clean-image smoke test.
