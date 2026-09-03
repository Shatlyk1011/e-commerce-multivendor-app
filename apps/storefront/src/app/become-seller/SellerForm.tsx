'use client'

import { useState } from 'react'

import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
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
    <form
      onSubmit={handleSubmit}
      className="border-apple-hairline rounded-apple-lg bg-apple-canvas space-y-5 border p-5 shadow-sm sm:p-7"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="seller-name">Имя</Label>
          <Input
            id="seller-name"
            required
            value={form.name}
            onChange={(event) => updateField('name', event.target.value)}
            placeholder="Ваше имя"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="brand-name">Название бренда</Label>
          <Input
            id="brand-name"
            required
            value={form.brand_name}
            onChange={(event) => updateField('brand_name', event.target.value)}
            placeholder="Название магазина или бренда"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="business-type">Тип бизнеса</Label>
        <select
          id="business-type"
          required
          value={form.business_type}
          onChange={(event) => updateField('business_type', event.target.value)}
          className="border-apple-hairline text-apple-ink focus-visible:border-apple-primary focus-visible:ring-apple-primary/20 rounded-apple-sm h-11 w-full border bg-transparent px-3.5 text-[14px] outline-none focus-visible:ring-2"
        >
          <option value="" disabled>
            Выберите вариант
          </option>
          <option value="registered">Есть ИП</option>
          <option value="in_progress">В процессе оформления</option>
          <option value="none">ИП нет</option>
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="seller-phone">Номер телефона</Label>
        <Input
          id="seller-phone"
          required
          type="tel"
          maxLength={8}
          value={form.phone}
          onChange={(event) => updateField('phone', event.target.value)}
          placeholder="6x xx xx xx"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="seller-address">Адрес магазина</Label>
        <Textarea
          id="seller-address"
          required
          value={form.address}
          onChange={(event) => updateField('address', event.target.value)}
          placeholder="Город, улица, дом"
          rows={4}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Отправка…' : 'Отправить заявку'}
      </Button>
      {error && (
        <p role="alert" className="text-destructive text-center text-[13px]">
          {error}
        </p>
      )}
      {submitted && (
        <p role="status" className="text-center text-sm font-medium tracking-tight text-green-700">
          Спасибо! Мы свяжемся с вами в ближайшее время.
        </p>
      )}
    </form>
  )
}
