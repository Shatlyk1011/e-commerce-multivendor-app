import type { StoreCart } from '@medusajs/types'

import { type Locale, intlLocale } from '@/lib/i18n'

export function getCartItemCount(cart: StoreCart | null | undefined): number {
  if (!cart?.items?.length) return 0
  return cart.items.reduce((sum, item) => sum + (item.quantity ?? 0), 0)
}

export function getCartSubtotal(cart: StoreCart | null | undefined): number {
  if (!cart?.items?.length) return 0
  return cart.items.reduce((sum, item) => {
    const unit = item.unit_price ?? 0
    return sum + unit * (item.quantity ?? 0)
  }, 0)
}

export function formatPrice(amount: number, currencyCode = 'TMT', locale: Locale = 'ru'): string {
  return `${new Intl.NumberFormat(intlLocale(locale), { maximumFractionDigits: 2 }).format(amount)} ${currencyCode}`
}
