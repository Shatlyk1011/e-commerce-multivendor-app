'use client'

import { useState } from 'react'

import { Lock } from 'lucide-react'

import { AuthDialog } from '@/components/layout/AuthDialog'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useCustomerProfile } from '@/features/account/api/queries'
import { AccountLayout } from '@/features/account/components/AccountLayout'
import { useAuth } from '@/features/auth/components/AuthProvider'

export default function AccountRootLayout({ children }: { children: React.ReactNode }) {
  const { customer, isAuthenticated, isLoading: isAuthLoading } = useAuth()
  const { data: storeCustomer } = useCustomerProfile()
  const [loginOpen, setLoginOpen] = useState(false)

  const displayCustomer = {
    first_name: storeCustomer?.first_name || customer?.first_name,
    last_name: storeCustomer?.last_name || customer?.last_name,
    company_name: storeCustomer?.company_name,
    phone_number: customer?.phone_number,
    phone: storeCustomer?.phone || customer?.phone_number,
    email: storeCustomer?.email || customer?.email,
  }

  if (isAuthLoading) {
    return (
      <div className="bg-apple-canvas-parchment min-h-[calc(100vh-52px)] p-6">
        <div className="mx-auto max-w-6xl space-y-6">
          <Skeleton className="rounded-apple-lg h-28 w-full" />
          <Skeleton className="rounded-apple-lg h-64 w-full" />
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !customer) {
    return (
      <div className="bg-apple-canvas-parchment flex min-h-[calc(100vh-52px)] items-center justify-center p-4">
        <Card className="rounded-apple-lg border-apple-hairline bg-apple-canvas w-full max-w-md border p-8 text-center shadow-sm">
          <div className="bg-apple-primary/10 text-apple-primary mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
            <Lock className="h-8 w-8" />
          </div>
          <h1 className="text-apple-ink text-2xl font-semibold tracking-[-0.28px]">Войдите в личный кабинет</h1>
          <p className="text-apple-ink-muted-80 text-apple-caption mt-2 mb-6 leading-relaxed">
            Чтобы просматривать свои заказы, управлять адресами и сохранять избранные товары, войдите по номеру
            телефона.
          </p>
          <Button
            onClick={() => setLoginOpen(true)}
            className="bg-apple-primary hover:bg-apple-primary-focus w-full rounded-full text-sm font-semibold transition active:scale-95"
          >
            Войти по номеру телефона
          </Button>

          {loginOpen && <AuthDialog open={loginOpen} onOpenChange={setLoginOpen} />}
        </Card>
      </div>
    )
  }

  return <AccountLayout customer={displayCustomer}>{children}</AccountLayout>
}
