import { CheckoutPage } from '@/features/checkout/components/CheckoutPage'

export const metadata = { title: 'Оформление заказа', robots: { index: false, follow: false } }

export default function CheckoutRoute() {
  return <CheckoutPage />
}
