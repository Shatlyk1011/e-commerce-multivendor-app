# Security

This project is an experimental development MVP. No release currently has a production security support commitment. Fixes are developed on the maintained development branch; no historical version support is promised.

## Reporting a vulnerability

Do not open a public issue containing exploit details, secrets or personal data. If enabled, use this repository's GitHub **Security → Report a vulnerability** private reporting flow. If that option is unavailable, ask the repository owner to enable private reporting using an issue with no vulnerability details. A dedicated private contact and response policy still need to be established before public release.

Include affected revision, reproduction steps, impact and a suggested fix in the private report. Use synthetic accounts and data. Do not test on someone else's deployment without permission.

## Known development restrictions

- Customer phone authentication accepts fixed OTP `1234` and does not send SMS. It is unsuitable for public deployment.
- Checkout uses the system/default payment provider, not real payment processing.
- Compose is local-only and binds published ports to loopback. It does not configure TLS, production network isolation or backups.
- The media bucket allows public download; do not store private documents there.
- Credentials appeared in earlier Compose revisions. Removing them from the working tree does not revoke them or remove them from history. Rotate any reused values before sharing the repository.

See the [release checklist](docs/OPEN_SOURCE_READINESS.md) for remaining publication checks. This document is not evidence of a completed security audit.
