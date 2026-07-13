const CART_ID_COOKIE = 'cart_id'
const COOKIE_EXPIRY_DAYS = 30

export function getCartId(): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.split('; ').find((row) => row.startsWith(`${CART_ID_COOKIE}=`))
  return match ? decodeURIComponent(match.split('=')[1]) : null
}

export function setCartId(id: string): void {
  if (typeof document === 'undefined') return
  const expires = new Date(Date.now() + COOKIE_EXPIRY_DAYS * 24 * 60 * 60 * 1000).toUTCString()
  document.cookie = `${CART_ID_COOKIE}=${encodeURIComponent(id)}; expires=${expires}; path=/; SameSite=Lax`
}

export function removeCartId(): void {
  if (typeof document === 'undefined') return
  document.cookie = `${CART_ID_COOKIE}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax`
}
