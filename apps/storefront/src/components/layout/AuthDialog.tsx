'use client'

import * as React from 'react'
import { useState } from 'react'

import Link from 'next/link'

import { FetchError } from '@medusajs/js-sdk'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { medusa } from '@/lib/medusa'

interface AuthDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AuthDialog({ open, onOpenChange }: AuthDialogProps) {
  const [phone, setPhone] = useState('')
  const [smsSent, setSmsSent] = useState(false)
  const [smsCode, setSmsCode] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)

  const handleOpenChange = (newOpen: boolean) => {
    onOpenChange(newOpen)
    if (!newOpen) {
      // Reset state when closing the dialog
      setPhone('')
      setSmsCode('')
      setSmsSent(false)
    }
  }

  const handleSendCode = (e: React.FormEvent) => {
    e.preventDefault()
    if (phone.length === 8) {
      setSmsSent(true)
    }
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    if (smsCode.length !== 4) return

    try {
      setIsVerifying(true)

      const email = `${phone}@phone.local`
      const password = `test123123`

      // Step 1: Attempt registration (creates auth_identity)
      try {
        await medusa.auth.register('customer', 'emailpass', {
          email,
          password,
        })
      } catch (error) {
        const fetchError = error as FetchError

        if (fetchError.statusText !== 'Unauthorized' && fetchError.message !== 'Identity with email already exists') {
          toast.error('Ошибка при создании аккаунта', {
            description: fetchError.message || String(fetchError),
          })
          return
        }

        // Step 2: If identity already exists, attempt login
        const loginResponse = await medusa.auth
          .login('customer', 'emailpass', {
            email,
            password,
          })
          .catch((err) => {
            toast.error('Ошибка авторизации', {
              description: err.message || String(err),
            })
          })

        if (!loginResponse) {
          return
        }

        if (typeof loginResponse !== 'string') {
          toast.error('Ошибка авторизации', {
            description: 'Требуются дополнительные действия, которые не поддерживаются в этом интерфейсе.',
          })
          return
        }
      }

      // Step 3: Register / Link Customer Profile
      try {
        try {
          await medusa.store.customer.retrieve()
        } catch (meError) {
          // Profile doesn't exist, create it
          await medusa.store.customer.create({
            email,
            phone: `+993${phone}`,
            first_name: 'Покупатель',
          })
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (custError: any) {
        console.error('Profile creation error:', custError)
        toast.error('Ошибка профиля покупателя', {
          description: custError.message || String(custError),
        })
        return
      }

      toast.success('Вход выполнен успешно!')
      handleOpenChange(false)
      // window.location.reload()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Auth verify error:', error)
      toast.error('Ошибка входа', {
        description: error.message || 'Пожалуйста, попробуйте еще раз.',
      })
    } finally {
      setIsVerifying(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="bg-apple-canvas rounded-apple-lg border-apple-hairline max-w-[360px] border p-6 shadow-lg">
        <DialogHeader className="mb-4">
          <DialogTitle className="font-heading text-apple-ink text-xl font-bold">
            {smsSent ? 'Подтверждение входа' : 'Введите номер телефона'}
          </DialogTitle>
          <div className="text-apple-ink-muted-48 mt-1 text-[13px]">
            {smsSent ? `Мы отправили код на номер +993 ${phone}` : 'Отправим СМС-код для подтверждения входа'}
          </div>
        </DialogHeader>

        {!smsSent ? (
          <form onSubmit={handleSendCode} className="space-y-4">
            <div className="border-apple-hairline rounded-apple-sm bg-apple-canvas focus-within:border-apple-primary-focus focus-within:ring-apple-primary-focus flex items-center overflow-hidden border px-3 transition-all focus-within:ring-1">
              <span className="text-apple-ink-muted-48 border-apple-hairline mr-2 border-r pr-2 text-[14px] font-semibold">
                +993
              </span>
              <Input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 8))}
                className="text-apple-ink placeholder:text-apple-ink-muted-48 h-10 w-full border-none bg-transparent p-0 text-[15px] shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                placeholder="61 415926"
                required
              />
            </div>
            <Button type="submit" disabled={phone.length < 8} size="sm" className="w-full cursor-pointer font-semibold">
              Получить код
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyCode} className="space-y-4">
            <div className="flex justify-center py-2">
              <InputOTP
                maxLength={4}
                value={smsCode}
                disabled={isVerifying}
                onChange={(value) => setSmsCode(value.replace(/\D/g, ''))}
              >
                <InputOTPGroup className="gap-3">
                  <InputOTPSlot
                    index={0}
                    className="border-apple-hairline rounded-apple-sm bg-apple-canvas text-apple-ink first:rounded-l-apple-sm last:rounded-r-apple-sm first:border-l-apple-hairline h-12 w-12 border text-[17px] font-semibold"
                  />
                  <InputOTPSlot
                    index={1}
                    className="border-apple-hairline rounded-apple-sm bg-apple-canvas text-apple-ink first:rounded-l-apple-sm last:rounded-r-apple-sm first:border-l-apple-hairline h-12 w-12 border text-[17px] font-semibold"
                  />
                  <InputOTPSlot
                    index={2}
                    className="border-apple-hairline rounded-apple-sm bg-apple-canvas text-apple-ink first:rounded-l-apple-sm last:rounded-r-apple-sm first:border-l-apple-hairline h-12 w-12 border text-[17px] font-semibold"
                  />
                  <InputOTPSlot
                    index={3}
                    className="border-apple-hairline rounded-apple-sm bg-apple-canvas text-apple-ink first:rounded-l-apple-sm last:rounded-r-apple-sm first:border-l-apple-hairline h-12 w-12 border text-[17px] font-semibold"
                  />
                </InputOTPGroup>
              </InputOTP>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size={'sm'}
                disabled={isVerifying}
                onClick={() => setSmsSent(false)}
                className="text-apple-ink-muted-80 w-1/2 cursor-pointer font-semibold"
              >
                Назад
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={smsCode.length < 4 || isVerifying}
                className="w-1/2 cursor-pointer font-semibold"
              >
                {isVerifying ? 'Вход...' : 'Войти'}
              </Button>
            </div>
          </form>
        )}

        <div className="text-apple-ink-muted-48 mt-2 text-center text-[12px] leading-relaxed">
          Авторизуясь, вы согласяетесь с{' '}
          <Link href="/terms" className="text-apple-primary hover:underline">
            Пользовательским соглашением
          </Link>{' '}
          и{' '}
          <Link href="/privacy" className="text-apple-primary hover:underline">
            Политикой конфиденциальности
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  )
}
