'use client'

import * as React from 'react'
import { useEffect, useState } from 'react'

import Link from 'next/link'

import { Loader2, LockKeyhole, PencilIcon, ShieldCheck, Smartphone } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { useAuth } from '@/features/auth/components/AuthProvider'

interface AuthDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const PHONE_LENGTH = 8
const OTP_LENGTH = 4

export function AuthDialog({ open, onOpenChange }: AuthDialogProps) {
  const { login, requestOtp } = useAuth()
  const [phone, setPhone] = useState('')
  const [smsSent, setSmsSent] = useState(false)
  const [smsCode, setSmsCode] = useState('')
  const [timer, setTimer] = useState(0)
  const [isSending, setIsSending] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fullPhone = `+993${phone}`

  const handleOpenChange = (newOpen: boolean) => {
    onOpenChange(newOpen)
    if (!newOpen) {
      setPhone('')
      setSmsCode('')
      setSmsSent(false)
      setTimer(0)
      setError(null)
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

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()

    if (phone.length !== PHONE_LENGTH || isSending) {
      return
    }

    try {
      setIsSending(true)
      setError(null)
      await requestOtp(fullPhone)
      setSmsSent(true)
      setTimer(60)
      toast.success('СМС-код отправлен')
    } catch (sendError) {
      const message = sendError instanceof Error ? sendError.message : 'Не удалось отправить код.'
      setError(message)
      toast.error('Не удалось отправить код')
    } finally {
      setIsSending(false)
    }
  }

  const handleResend = async () => {
    if (isSending) {
      return
    }

    try {
      setIsSending(true)
      setError(null)
      await requestOtp(fullPhone)
      setSmsCode('')
      setTimer(60)
      toast.success('СМС-код отправлен повторно')
    } catch (sendError) {
      const message = sendError instanceof Error ? sendError.message : 'Не удалось отправить код.'
      setError(message)
      toast.error('Не удалось отправить код')
    } finally {
      setIsSending(false)
    }
  }

  const handleOtpChange = (value: string) => {
    const cleanValue = value.replace(/\D/g, '')
    setSmsCode(cleanValue)
  }

  const handleChangePhone = () => {
    setSmsSent(false)
    setSmsCode('')
    setTimer(0)
    setError(null)
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()

    if (smsCode.length !== OTP_LENGTH || isVerifying) {
      return
    }

    try {
      setIsVerifying(true)
      setError(null)
      await login(fullPhone, smsCode)
      toast.success('Вход выполнен успешно')
      handleOpenChange(false)
    } catch (verifyError) {
      const message = verifyError instanceof Error ? verifyError.message : 'Не удалось выполнить вход.'
      const displayMessage = message === 'Invalid OTP' ? 'Неверный код подтверждения' : message
      setError(displayMessage)
      setSmsCode('')
    } finally {
      setIsVerifying(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="border-apple-hairline bg-apple-canvas rounded-apple-lg max-w-[380px] gap-5 p-6 shadow-xl">
        <DialogHeader className="flex flex-col items-center gap-1.5 pr-0 text-center">
          <div className="bg-apple-primary/10 text-apple-primary mb-1 flex size-12 items-center justify-center rounded-full">
            {smsSent ? <LockKeyhole className="size-6" /> : <Smartphone className="size-6" />}
          </div>

          <DialogTitle className="text-apple-ink font-heading text-xl font-bold tracking-[-0.3px]">
            {smsSent ? 'Подтверждение входа' : 'Вход в аккаунт'}
          </DialogTitle>

          <DialogDescription className="text-apple-ink-muted-48 text-[13px] leading-relaxed">
            {smsSent ? (
              <span>Введите 4-значный код подтверждения</span>
            ) : (
              'Укажите номер телефона для получения СМС-кода'
            )}
          </DialogDescription>
        </DialogHeader>

        {!smsSent ? (
          <form onSubmit={handleSendCode} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="phone-input" className="text-apple-ink block text-xs font-semibold">
                Номер телефона
              </label>
              <div className="border-apple-hairline bg-apple-canvas focus-within:border-apple-primary focus-within:ring-apple-primary/20 rounded-apple-md flex h-12 items-center overflow-hidden border px-3.5 transition-all focus-within:ring-2">
                <div className="text-apple-ink-muted-80 border-apple-hairline flex items-center gap-1.5 border-r pr-3 text-sm font-bold select-none">
                  <span>+993</span>
                </div>
                <Input
                  id="phone-input"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel-national"
                  aria-label="Номер телефона без кода страны"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, PHONE_LENGTH))}
                  className="text-apple-ink placeholder:text-apple-ink-muted-48 h-full w-full border-none bg-transparent pr-0 pl-3 text-[15px] font-medium shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                  placeholder="61 415926"
                  required
                  autoFocus
                />
              </div>
              <p className="text-apple-ink-muted-48 text-[11px]">Введите 8-значный номер без +993</p>
            </div>

            {error && (
              <div className="rounded-apple-sm border border-rose-500/20 bg-rose-500/10 p-3 text-center text-xs font-medium text-rose-600">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={phone.length !== PHONE_LENGTH || isSending}
              className="h-11 w-full cursor-pointer rounded-full font-semibold transition-transform active:scale-[0.98]"
            >
              {isSending ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" /> Отправляем…
                </>
              ) : (
                'Получить код'
              )}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="space-y-5">
            <div className="rounded-apple-md mx-auto flex max-w-max items-center justify-center gap-2 px-3.5 py-1.5">
              <div className="flex items-center gap-2">
                <span className="text-apple-ink text-sm font-semibold">+993 {phone}</span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={handleChangePhone}
                className="h-auto gap-0.5 p-0 text-xs font-semibold"
              >
                <PencilIcon className="mr-1 size-3" aria-hidden="true" />
              </Button>
            </div>

            <div className="space-y-2">
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
                        className="rounded-apple-md border-apple-hairline bg-apple-canvas text-apple-ink data-[active=true]:border-apple-primary data-[active=true]:ring-apple-primary/20 size-13 border text-lg font-bold transition-all first:border-l data-[active=true]:ring-2"
                      />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
              </div>
            </div>

            <div className="flex w-full justify-center">
              {timer > 0 ? (
                <p className="text-apple-ink-muted-48 text-center text-xs">
                  Повторный код через <span className="text-apple-ink font-semibold">{timer} сек.</span>
                </p>
              ) : (
                <Button
                  type="button"
                  variant="link"
                  onClick={handleResend}
                  disabled={isSending || isVerifying}
                  className="text-apple-primary hover:text-apple-primary-focus h-auto p-0 text-xs font-semibold"
                >
                  {isSending ? 'Отправляем…' : 'Отправить код повторно'}
                </Button>
              )}
            </div>

            {error && (
              <div className="rounded-apple-sm border border-rose-500/20 bg-rose-500/10 p-3 text-center text-xs font-medium text-rose-600">
                {error}
              </div>
            )}

            <Button
              type="submit"
              size="md"
              disabled={smsCode.length !== OTP_LENGTH || isVerifying}
              className="w-full cursor-pointer rounded-full font-semibold transition-transform active:scale-[0.98]"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" /> Подтверждаем…
                </>
              ) : (
                'Подтвердить и войти'
              )}
            </Button>
          </form>
        )}

        <div className="border-apple-divider-soft border-t pt-4 text-center">
          <p className="text-apple-ink-muted-48 text-[11px] leading-relaxed">
            Нажимая «Получить код», вы принимаете{' '}
            <Link
              href="/terms"
              className="text-apple-primary hover:text-apple-primary-focus underline underline-offset-2"
            >
              Условия сервиса
            </Link>{' '}
            и{' '}
            <Link
              href="/privacy"
              className="text-apple-primary hover:text-apple-primary-focus underline underline-offset-2"
            >
              Политику конфиденциальности
            </Link>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
