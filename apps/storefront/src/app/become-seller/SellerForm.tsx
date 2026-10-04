'use client'

import { useState } from 'react'

import { AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { medusa } from '@/lib/medusa'

const initialForm = { name: '', brand_name: '', business_type: '', phone: '', address: '' }

export function SellerForm() {
  const [form, setForm] = useState(initialForm)
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const updateField = (field: keyof typeof initialForm, value: string) => {
    setSubmitted(false)
    setError('')
    setForm((current) => ({ ...current, [field]: value }))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setError('')
    try {
      await medusa.client.fetch('/store/seller-requests', {
        method: 'POST',
        body: form,
      })
      setSubmitted(true)
      setForm(initialForm)
      toast.success('Успешно! Мы свяжемся с вами в ближайшее время')
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Не удалось отправить заявку')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="bg-apple-canvas border-0">
      <CardContent className="p-5 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="seller-name">
                Имя <span className="text-apple-ink-muted-48 font-normal">*</span>
              </Label>
              <Input
                id="seller-name"
                required
                autoComplete="name"
                value={form.name}
                onChange={(event) => updateField('name', event.target.value)}
                placeholder="Ваше имя"
                className="bg-apple-canvas"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="brand-name">
                Название бренда <span className="text-apple-ink-muted-48 font-normal">*</span>
              </Label>
              <Input
                id="brand-name"
                required
                autoComplete="organization"
                value={form.brand_name}
                onChange={(event) => updateField('brand_name', event.target.value)}
                placeholder="Магазин или бренд"
                className="bg-apple-canvas"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="business-type">
              Статус бизнеса <span className="text-apple-ink-muted-48 font-normal">*</span>
            </Label>
            <div className="relative">
              <select
                id="business-type"
                required
                value={form.business_type}
                onChange={(event) => updateField('business_type', event.target.value)}
                className="border-apple-hairline text-apple-ink focus-visible:border-apple-primary focus-visible:ring-apple-primary/20 rounded-apple-sm h-11 w-full appearance-none border bg-transparent px-3.5 pr-10 text-[14px] transition-all outline-none focus-visible:ring-2"
              >
                <option value="" disabled>
                  Выберите вариант
                </option>
                <option value="registered">Есть ИП</option>
                <option value="in_progress">В процессе оформления</option>
                <option value="none">ИП нет</option>
              </select>
              <svg
                aria-hidden="true"
                viewBox="0 0 20 20"
                fill="none"
                className="text-apple-ink-muted-48 pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2"
              >
                <path
                  d="m6 8 4 4 4-4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="seller-phone">
              Номер телефона <span className="text-apple-ink-muted-48 font-normal">*</span>
            </Label>
            <div className="border-apple-hairline focus-within:border-apple-primary focus-within:ring-apple-primary/20 rounded-apple-sm flex h-11 overflow-hidden border transition-all focus-within:ring-2">
              <span className="bg-apple-canvas-parchment text-apple-ink-muted-80 border-apple-hairline flex items-center border-r px-3.5 text-[14px]">
                +993
              </span>
              <Input
                id="seller-phone"
                required
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                maxLength={8}
                value={form.phone}
                onChange={(event) => updateField('phone', event.target.value)}
                placeholder="6x xx xx xx"
                aria-describedby="seller-phone-hint"
                className="bg-apple-canvas h-full rounded-none border-0 focus-visible:ring-0"
              />
            </div>
            <p id="seller-phone-hint" className="text-apple-ink-muted-48 text-[12px] leading-relaxed">
              Укажите 8 цифр без кода страны
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="seller-address">
              Адрес магазина <span className="text-apple-ink-muted-48 font-normal">*</span>
            </Label>
            <Textarea
              id="seller-address"
              required
              autoComplete="street-address"
              value={form.address}
              onChange={(event) => updateField('address', event.target.value)}
              placeholder="Город, улица, дом"
              rows={4}
              className="bg-apple-canvas"
            />
          </div>

          {error && (
            <div
              role="alert"
              className="border-destructive/20 bg-destructive/5 text-destructive rounded-apple-sm flex items-start gap-3 border px-4 py-3 text-[13px] leading-relaxed"
            >
              <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <p>{error}</p>
            </div>
          )}
          {submitted && (
            <div
              role="status"
              className="rounded-apple-sm flex items-start gap-3 border border-emerald-600/20 bg-emerald-600/5 px-4 py-3 text-[13px] leading-relaxed text-emerald-700"
            >
              <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <p>Спасибо! Заявка отправлена. Мы свяжемся с вами в ближайшее время.</p>
            </div>
          )}

          <div className="space-y-3 pt-1">
            <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Отправка…' : 'Отправить заявку'}
              {!isSubmitting && <ArrowRight className="size-4" aria-hidden="true" />}
            </Button>
            <p className="text-apple-ink-muted-48 text-center text-[11px] leading-relaxed">
              Отправляя заявку, вы соглашаетесь на обработку указанных данных.
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
