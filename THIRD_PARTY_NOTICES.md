# Third-party notices and asset inventory

The root MIT license retains the upstream Medusa notice. Keep that notice when redistributing derived code. This inventory is incomplete and is a release-review aid, not a claim that every asset has been cleared.

| Component / asset | Location | Required release review |
| --- | --- | --- |
| Medusa-derived starter and dashboard patch | `apps/backend`, `patches/@medusajs__dashboard.patch` | Retain upstream notices and review the patched package's distributed license |
| Geist font binaries | Both web apps' `public/fonts/Geist-*` | Verify exact source/version and include the applicable font license text |
| Inter font binaries | Both web apps' `public/fonts/Inter-*` | Verify exact source/version and include the applicable font license text |
| Seller background image | `apps/storefront/public/seller-bg.jpg` | Record origin and redistribution permission, or replace with an owned asset |
| Favicons, branding, product fixtures and marketing copy | Web app assets/source, including Bugday naming | Confirm ownership/permission and replace third-party/demo material where needed |
| Seed catalogue images | URLs in `apps/backend/src/migration-scripts/initial-data-seed.ts` | External Medusa-hosted demo images; availability and reuse permission are not established here |
| npm dependencies | `pnpm-lock.yaml` and workspace manifests | Review resolved package licenses/notices before distribution |

Do not infer permission to redistribute an asset solely from the code repository's MIT license. Add verified attribution and license files alongside the assets before completing the public-release checklist.
