import type { Metadata } from 'next'

import { Briefcase, Building2, ChevronDown, MapPin, TrendingUp, User, Users, Warehouse } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Стать продавцом на Uzum Market',
  description:
    'Присоединяйтесь к Uzum Market в Туркменистане. Продавайте товары миллионам покупателей с быстрой доставкой и поддержкой.',
}

const VENDOR_PORTAL_URL = process.env.NEXT_PUBLIC_VENDOR_PORTAL_URL || 'http://localhost:3001'

export default function BecomeVendorPage() {
  return <main>hello world</main>
}
