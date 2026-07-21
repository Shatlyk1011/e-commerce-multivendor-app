'use client'

import * as React from 'react'
import { useEffect, useState } from 'react'

import Link from 'next/link'

import type {
  StorefrontAuthErrorResponse,
  StorefrontPhoneAuthRequest,
  StorefrontPhoneAuthResponse,
} from '@dtc/api-contracts'
import { PencilIcon } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'

interface AuthDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const PHONE_LENGTH = 8
const OTP_LENGTH = 4

export function AuthDialog({ open, onOpenChange }: AuthDialogProps) {
  const [phone, setPhone] = useState('')
  const [smsSent, setSmsSent] = useState(false)
  const [smsCode, setSmsCode] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [timer, setTimer] = useState(0)

  const handleOpenChange = (newOpen: boolean) => {
    onOpenChange(newOpen)
    if (!newOpen) {
      // Reset state when closing the dialog
      setPhone('')
      setSmsCode('')
      setSmsSent(false)
      setTimer(0)
    }
  }

  // Manage countdown timer
  useEffect(() => {
    if (timer > 0 && smsSent) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1)
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [timer, smsSent])

  const handleSendCode = (e: React.FormEvent) => {
    e.preventDefault()
    if (phone.length === PHONE_LENGTH) {
      setSmsSent(true)
      setTimer(60)
      toast.success('СМС-код отправлен')
    }
  }

  const handleResend = () => {
    setSmsCode('')
    setTimer(60)
    toast.success('СМС-код отправлен повторно')
  }

  const triggerVerify = async (codeToVerify: string) => {
    if (isVerifying) return

    try {
      setIsVerifying(true)

      const response = await fetch('/api/auth/phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp: codeToVerify } satisfies StorefrontPhoneAuthRequest),
      })

      const result = (await response.json()) as StorefrontPhoneAuthResponse | StorefrontAuthErrorResponse
      if (!response.ok) {
        throw new Error('message' in result ? result.message : 'Не удалось выполнить вход.')
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
      // Clean OTP input on error
      setSmsCode('')
    } finally {
      setIsVerifying(false)
    }
  }

  const handleOtpChange = (value: string) => {
    const cleanValue = value.replace(/\D/g, '')
    setSmsCode(cleanValue)
    if (cleanValue.length === OTP_LENGTH) {
      triggerVerify(cleanValue)
    }
  }

  const handleChangePhone = () => {
    setSmsSent(false)
    setSmsCode('')
    setTimer(0)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-[360px] gap-6 shadow-none">
        <DialogHeader className="gap-2 pr-7">
          <DialogTitle className="text-apple-tagline">
            {smsSent ? 'Подтверждение входа' : 'Введите номер телефона'}
          </DialogTitle>
          <DialogDescription className="text-apple-caption">
            {smsSent ? (
              <span className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
                <span>
                  Мы отправили код на <span className="text-apple-ink font-semibold">+993 {phone}</span>
                </span>
                <Button
                  type="button"
                  size="xs"
                  variant="link"
                  className="text-apple-caption h-auto gap-1 p-0"
                  onClick={handleChangePhone}
                >
                  <PencilIcon className="size-3" aria-hidden="true" />
                  Изменить
                </Button>
              </span>
            ) : (
              'Отправим СМС-код для подтверждения входа'
            )}
          </DialogDescription>
        </DialogHeader>

        {!smsSent ? (
          <form onSubmit={handleSendCode} className="space-y-6">
            <label className="border-apple-hairline rounded-apple-sm bg-apple-canvas focus-within:border-apple-primary-focus focus-within:ring-apple-primary-focus flex h-11 items-center overflow-hidden border px-3 transition-colors focus-within:ring-1">
              <span className="text-apple-ink-muted-48 border-apple-hairline text-apple-caption-strong mr-2 border-r pr-2">
                +993
              </span>
              <Input
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                aria-label="Номер телефона без кода страны"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, PHONE_LENGTH))}
                className="text-apple-ink placeholder:text-apple-ink-muted-48 h-full w-full border-none bg-transparent p-0 text-[15px] shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                placeholder="61 415926"
                required
              />
            </label>
            <Button type="submit" disabled={phone.length !== PHONE_LENGTH} className="w-full">
              Получить код
            </Button>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="flex w-full justify-center">
              <InputOTP
                maxLength={OTP_LENGTH}
                value={smsCode}
                disabled={isVerifying}
                autoFocus
                aria-label="Код из СМС"
                onChange={handleOtpChange}
                className="w-full"
                containerClassName="w-full"
              >
                <InputOTPGroup className="mx-auto justify-center gap-3">
                  {Array.from({ length: OTP_LENGTH }).map((_, index) => (
                    <InputOTPSlot
                      key={index}
                      index={index}
                      className="rounded-apple-sm border-apple-hairline bg-apple-canvas text-apple-body-strong first:rounded-l-apple-sm last:rounded-r-apple-sm data-[active=true]:border-apple-primary-focus data-[active=true]:ring-apple-primary-focus/20 size-14 first:border-l"
                    />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>

            <div className="flex w-full justify-center">
              {timer > 0 ? (
                <p className="text-apple-caption text-apple-ink-muted-48 text-center">
                  Новый код можно запросить через <span className="text-apple-ink font-semibold">{timer} сек.</span>
                </p>
              ) : (
                <Button
                  type="button"
                  variant="link"
                  onClick={handleResend}
                  disabled={isVerifying}
                  className="text-apple-caption-strong h-auto p-0"
                >
                  Отправить код повторно
                </Button>
              )}
            </div>
          </div>
        )}

        <p className="text-apple-fine-print text-apple-ink-muted-48 mt-2 text-center leading-[1.4]">
          Авторизуясь, вы согласяетесь с{' '}
          <Link
            href="/terms"
            className="text-apple-primary hover:text-apple-primary-focus underline underline-offset-3"
          >
            Пользовательским соглашением
          </Link>{' '}
          и{' '}
          <Link
            href="/privacy"
            className="text-apple-primary hover:text-apple-primary-focus underline underline-offset-3"
          >
            Политикой конфиденциальности
          </Link>
        </p>
      </DialogContent>
    </Dialog>
  )
}
