'use client'

import { type ReactNode } from 'react'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { Heart, MapPin, Package, ShieldCheck, User } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export type AccountTabKey = 'orders' | 'favorites' | 'addresses' | 'personal'

interface AccountLayoutProps {
  customer: {
    first_name?: string | null
    last_name?: string | null
    phone_number?: string | null
    phone?: string | null
    email?: string | null
  } | null
  children: ReactNode
}

const NAV_ITEMS: { href: string; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { href: '/account/orders', label: 'Мои заказы', icon: Package },
  { href: '/account/favorites', label: 'Избранное', icon: Heart },
  { href: '/account/addresses', label: 'Адреса', icon: MapPin },
  { href: '/account/personal', label: 'Личные данные', icon: User },
]

export function AccountLayout({ customer, children }: AccountLayoutProps) {
  const pathname = usePathname()
  const displayName = [customer?.first_name, customer?.last_name].filter(Boolean).join(' ')
  const phone = customer?.phone_number || customer?.phone

  return (
    <div className="bg-apple-canvas-parchment min-h-[calc(100vh-52px)] pt-6 pb-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-row items-start gap-6 max-md:flex-col lg:gap-8">
          {/* Left Sidebar */}
          <aside className="sticky top-32 w-72 shrink-0 space-y-4 max-md:w-full">
            {/* User Profile Summary Card */}
            <Card className="rounded-apple-lg border-apple-hairline bg-apple-canvas mb-3 border p-5 shadow-xs">
              <CardContent className="p-0">
                <div className="flex items-center gap-3.5">
                  <div className="bg-apple-primary/10 text-apple-primary flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-lg font-bold">
                    {customer?.first_name ? customer.first_name[0].toUpperCase() : <User className="h-6 w-6" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-apple-ink truncate text-base font-semibold tracking-[-0.2px]">
                      {displayName || 'Личный кабинет'}
                    </h2>
                    <p className="text-apple-caption text-apple-ink-muted-80 truncate font-mono text-[12px]">{phone}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sidebar Navigation */}
            <nav className="border-apple-hairline bg-apple-canvas rounded-apple-lg max-md:no-scrollbar space-y-1 border p-2 shadow-xs max-md:flex max-md:gap-1.5 max-md:space-y-0 max-md:overflow-x-auto">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'rounded-apple-sm flex items-center gap-3 px-3.5 py-2.5 text-[14px] font-medium transition-all duration-150 max-md:flex-1 max-md:shrink-0 max-md:justify-center max-md:rounded-full max-md:px-4',
                      isActive
                        ? 'bg-apple-primary font-semibold text-white shadow-xs'
                        : 'text-apple-ink-muted-80 hover:bg-apple-surface-pearl hover:text-apple-ink',
                    )}
                  >
                    <Icon className={cn('h-4 w-4 shrink-0', isActive ? 'text-white' : 'text-apple-ink-muted-48')} />
                    <span className="max-md:hidden">{item.label}</span>
                  </Link>
                )
              })}
            </nav>
          </aside>

          {/* Main Content Area */}
          <main className="w-full min-w-0 flex-1">{children}</main>
        </div>
      </div>
    </div>
  )
}
