'use client'

import * as React from 'react'
import { createContext, useContext, useEffect, useState } from 'react'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

import type { Vendor, VendorAdmin, VendorMeResponse } from '@dtc/api-contracts'
import {
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Loader2,
  LogOut,
  Receipt,
  Settings,
  ShieldCheck,
  ShoppingBag,
  User,
} from 'lucide-react'
import { toast } from 'sonner'

import { medusa } from '@/lib/medusa'
import { cn } from '@/lib/utils'

interface VendorContextType {
  vendorAdmin: VendorAdmin | null
  vendor: Vendor | null
  isLoading: boolean
  updateVendorAdmin: (admin: Partial<VendorAdmin>) => void
  logout: () => Promise<void>
}

const VendorContext = createContext<VendorContextType | null>(null)

export function useVendor() {
  const context = useContext(VendorContext)
  if (!context) {
    throw new Error('useVendor must be used within a VendorProvider')
  }
  return context
}

let vendorAdminPromise: Promise<VendorMeResponse> | null = null

function fetchVendorAdmin(client: { fetch: <T>(path: string) => Promise<T> }): Promise<VendorMeResponse> {
  console.log('clientxx', client)
  if (!vendorAdminPromise) {
    vendorAdminPromise = client.fetch<VendorMeResponse>('/vendors/me').finally(() => {
      // Clear after a microtask to allow concurrent reads to reuse the promise,
      // but subsequent actions will fetch fresh data.
      setTimeout(() => {
        vendorAdminPromise = null
      }, 0)
    })
  }
  console.log('vendorAdminPromise', vendorAdminPromise)
  return vendorAdminPromise!
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [vendorAdmin, setVendorAdmin] = useState<VendorAdmin | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  const logout = async () => {
    try {
      vendorAdminPromise = null
      await medusa.auth.logout()
      toast.success('Вы вышли из системы')
      router.push('/login')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error('Ошибка выхода', {
        description: err.message || 'Не удалось выйти из системы',
      })
    }
  }

  useEffect(() => {
    let active = true

    async function checkAuth() {
      try {
        const res = await fetchVendorAdmin(medusa.client)
        console.log('res', res)
        if (active) {
          setVendorAdmin(res.vendor_admin)
          setIsLoading(false)
          if (res.vendor_admin.id) {
            toast.success(`Добро пожаловать ${res.vendor_admin.first_name}`, { duration: 1500 })
          }
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        if (active) {
          const status = err.status || err.response?.status
          const message = err.message || err.response?.data?.message || ''

          if (status === 403) {
            toast.error('Доступ заблокирован', {
              description: message || 'Ваш аккаунт продавца отключен.',
            })
            // Clear credentials/session by logging out
            try {
              await medusa.auth.logout()
            } catch (logoutErr) {
              console.error('Failed to logout after 403:', logoutErr)
            }
          } else {
            toast.error('Доступ ограничен', {
              description: 'Пожалуйста, авторизуйтесь для доступа в панель управления.',
            })
          }
          router.push('/login')
        }
      }
    }

    checkAuth()

    return () => {
      active = false
    }
  }, [router])

  if (isLoading) {
    return (
      <div className="bg-apple-canvas flex h-screen w-screen flex-col items-center justify-center">
        <Loader2 className="text-apple-primary size-8 animate-spin" />
        <p className="text-apple-ink-muted-48 mt-4 text-[15px] font-medium">Загрузка профиля продавца...</p>
      </div>
    )
  }

  const menuItems = [
    { href: '/dashboard', label: 'Обзор', icon: LayoutDashboard },
    { href: '/dashboard/products', label: 'Товары', icon: ShoppingBag },
    { href: '/dashboard/orders', label: 'Заказы', icon: Receipt },
    { href: '/dashboard/settings', label: 'Настройки', icon: Settings },
  ]

  const vendor = vendorAdmin?.vendor || null

  console.log('vendor', vendor)

  return (
    <VendorContext.Provider
      value={{
        vendorAdmin,
        vendor,
        isLoading,
        updateVendorAdmin: (admin) => setVendorAdmin((current) => (current ? { ...current, ...admin } : current)),
        logout,
      }}
    >
      <div className="bg-apple-canvas text-apple-ink flex min-h-screen">
        {/* Sidebar */}
        <aside
          className={cn(
            'border-apple-hairline bg-apple-canvas-parchment fixed top-0 bottom-0 left-0 z-20 flex flex-col border-r transition-all duration-300 ease-in-out',
            isCollapsed ? 'w-[68px]' : 'w-[240px]',
          )}
        >
          {/* Sidebar Header */}
          <div
            className={cn(
              'border-apple-hairline flex h-14 items-center border-b px-4 transition-all duration-300',
              isCollapsed ? 'justify-center' : 'justify-between',
            )}
          >
            {!isCollapsed && (
              <div className="flex items-center gap-2 overflow-hidden">
                <ShieldCheck className="text-apple-primary size-5 shrink-0" />
                <span className="font-heading text-[16px] font-semibold tracking-tight whitespace-nowrap">
                  Онлайн Магазин
                </span>
              </div>
            )}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="text-apple-ink-muted-48 hover:bg-apple-canvas hover:text-apple-ink cursor-pointer rounded-full p-1.5 transition-colors"
            >
              {isCollapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
            </button>
          </div>

          {/* Sidebar Navigation */}
          <nav className="flex-1 space-y-1.5 px-3 py-6">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'rounded-apple-sm flex items-center gap-3 py-1.5 text-[14px] font-medium transition-all active:scale-[0.98]',
                    isCollapsed ? 'mx-auto h-10 w-10 justify-center px-0' : 'px-3',
                    isActive
                      ? 'bg-apple-canvas text-apple-primary shadow-[0_1px_2px_rgba(0,0,0,0.02)]'
                      : 'text-apple-ink-muted-80 hover:bg-apple-canvas/50 hover:text-apple-ink',
                  )}
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon
                    className={cn('size-4 shrink-0', isActive ? 'text-apple-primary' : 'text-apple-ink-muted-48')}
                  />
                  {!isCollapsed && <span className="whitespace-nowrap transition-all duration-300">{item.label}</span>}
                </Link>
              )
            })}
          </nav>

          {/* Sidebar Footer */}
          <div className="border-apple-hairline flex flex-col gap-2 border-t p-4 transition-all duration-300">
            <div className={cn('flex items-center gap-3 py-1', isCollapsed ? 'justify-center' : '')}>
              <div className="bg-apple-canvas border-apple-hairline flex h-9 w-9 shrink-0 items-center justify-center rounded-full border shadow-xs">
                <User className="text-apple-ink-muted-48 size-4" />
              </div>
              {!isCollapsed && (
                <div className="min-w-0 flex-1 overflow-hidden">
                  <p className="text-apple-ink truncate text-[13px] font-semibold">
                    {vendorAdmin?.first_name} {vendorAdmin?.last_name}
                  </p>
                  <p className="text-apple-ink-muted-48 truncate text-[11px]">{vendor?.name || 'Магазин'}</p>
                </div>
              )}
            </div>

            <button
              onClick={logout}
              className={cn(
                'rounded-apple-sm text-apple-ink-muted-80 flex cursor-pointer items-center gap-3 py-2.5 text-left text-[14px] font-medium transition-all hover:bg-red-50 hover:text-red-600 active:scale-[0.98]',
                isCollapsed ? 'mx-auto h-10 w-10 justify-center px-0' : 'px-4',
              )}
              title={isCollapsed ? 'Выйти' : undefined}
            >
              <LogOut className="size-4 shrink-0 opacity-70" />
              {!isCollapsed && <span>Выйти</span>}
            </button>
          </div>
        </aside>

        {/* Content Panel */}
        <div
          className={cn(
            'flex flex-1 flex-col transition-all duration-300 ease-in-out',
            isCollapsed ? 'pl-[68px]' : 'pl-[240px]',
          )}
        >
          {/* Top Bar */}
          <header className="border-apple-hairline bg-apple-canvas sticky top-0 z-10 flex h-14 items-center justify-between border-b px-8">
            <div className="flex items-center gap-2">
              <h2 className="text-apple-ink-muted-48 text-[14px] font-medium">{vendor?.store_name}</h2>
            </div>
            {vendor?.status === 'disabled' && (
              <div className="flex items-center gap-4">
                <span className="rounded-apple-pill border border-red-200 bg-red-50 px-2.5 py-0.5 text-[11px] font-semibold text-red-700">
                  неактивный
                </span>
                {vendor.status_reason && (
                  <p className="text-[12px] text-red-800">
                    Lorem ipsum dolor sit amet consectetur adipisicing elit. A, quo.
                  </p>
                )}
              </div>
            )}
          </header>

          {/* Page Main Content */}
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </VendorContext.Provider>
  )
}
