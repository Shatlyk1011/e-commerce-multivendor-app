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
      <div className="bg-apple-canvas-parchment flex min-h-[calc(100vh-140px)] items-center justify-center p-6">
        <div className="w-full max-w-[380px] space-y-4">
          <Skeleton className="rounded-apple-lg h-12 w-full" />
          <Skeleton className="rounded-apple-lg h-48 w-full" />
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !customer) {
    return (
      <div className="bg-apple-canvas-parchment flex min-h-[calc(100vh-140px)] items-center justify-center p-4 py-12">
        <Card className="border-apple-hairline bg-apple-canvas rounded-apple-lg w-full max-w-[380px] border p-6 text-center shadow-xs max-sm:p-5">
          <div className="bg-apple-primary/10 text-apple-primary mx-auto mb-4 flex size-12 items-center justify-center rounded-full">
            <Lock className="size-6" />
          </div>
          <h1 className="text-apple-ink font-heading text-xl font-bold tracking-[-0.3px]">Войдите в личный кабинет</h1>
          <p className="text-apple-ink-muted-48 mt-2 mb-6 text-[13px] leading-relaxed">
            Чтобы просматривать свои заказы, управлять адресами и сохранять избранные товары, войдите по номеру
            телефона.
          </p>
          <Button
            onClick={() => setLoginOpen(true)}
            className="bg-apple-primary hover:bg-apple-primary-focus h-11 w-full rounded-full text-sm font-semibold text-white transition-transform active:scale-[0.98]"
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
