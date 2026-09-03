const DEFAULT_SITE_URL = 'http://localhost:3000'
export const siteUrl = (process.env.NEXT_PUBLIC_STOREFRONT_URL ?? DEFAULT_SITE_URL).replace(/\/$/, '')
export const siteName = 'Bugday'
export function absoluteUrl(path = '/') {
  return new URL(path, `${siteUrl}/`).toString()
}
export function jsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, '\\u003c')
}
