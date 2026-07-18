'use client'

import * as React from 'react'
import { useEffect, useState } from 'react'

import { useRouter } from 'next/navigation'

import type { VendorMeResponse } from '@dtc/api-contracts'
import { Eye, EyeOff, Loader2, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { medusa } from '@/lib/medusa'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  const router = useRouter()

  useEffect(() => {
    let active = true
    async function checkAuth() {
      try {
        const res = await medusa.client.fetch<VendorMeResponse>('/vendors/me')
        if (active && res?.vendor_admin?.id) {
          router.push('/dashboard')
          return
        }
      } catch (err) {
        // Not authenticated
      }
      if (active) {
        setIsChecking(false)
      }
    }
    checkAuth()
    return () => {
      active = false
    }
  }, [router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return

    try {
      setIsLoading(true)
      await medusa.auth.login('vendor', 'emailpass', {
        email,
        password,
      })

      router.push('/dashboard')
      router.refresh()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Login error:', error)
      toast.error('Ошибка авторизации', {
        description: error.message || 'Неверный адрес почты или пароль',
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isChecking) {
    return (
      <div className="bg-apple-canvas flex h-screen w-screen flex-col items-center justify-center">
        <Loader2 className="text-apple-primary size-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="bg-apple-canvas-parchment flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-[400px] text-center select-none">
        {/* Apple icon style or portal branding */}
        <div className="bg-apple-canvas border-apple-hairline rounded-apple-lg border p-8 shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
          <div className="mb-6 flex flex-col items-center">
            <div className="bg-apple-canvas-parchment flex h-14 w-14 items-center justify-center rounded-full">
              <ShieldCheck className="text-apple-primary size-7" />
            </div>
            <h1 className="text-apple-ink font-heading mt-4 text-[24px] font-semibold tracking-tight">
              Панель продавца
            </h1>
            <p className="text-apple-ink-muted-48 mt-1 text-[14px]">Войдите в личный кабинет Medusa Marketplace</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div>
              <label className="text-apple-ink mb-1.5 block font-sans text-[13px] font-semibold">
                Электронная почта
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seller@example.com"
                required
                className="h-11"
                disabled={isLoading}
              />
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-apple-ink block font-sans text-[13px] font-semibold">Пароль</label>
              </div>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="h-11 pr-10"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-apple-ink-muted-48 hover:text-apple-ink absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer rounded-full p-1 transition-colors focus:outline-none"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" disabled={isLoading} className="w-full" size={'md'}>
              {isLoading ? 'Загрузка...' : 'Войти'}
            </Button>
          </form>
        </div>

        <div className="text-apple-ink-muted-48 mt-6 text-[12px] leading-relaxed">
          Управление вашим магазином, товарами и заказами. <br />
          Возникли проблемы со входом? Обратитесь в{' '}
          <a href="#" className="text-apple-primary hover:underline">
            Службу поддержки
          </a>
        </div>
      </div>
    </div>
  )
}
