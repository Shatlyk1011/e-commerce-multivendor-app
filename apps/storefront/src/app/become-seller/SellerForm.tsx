'use client'

import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

const initialForm = { name: '', brandName: '', businessType: '', phone: '', address: '' }

export function SellerForm() {
  const [form, setForm] = useState(initialForm)
  const [submitted, setSubmitted] = useState(false)

  const updateField = (field: keyof typeof initialForm, value: string) => {
    setSubmitted(false)
    setForm((current) => ({ ...current, [field]: value }))
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitted(true)
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
            value={form.brandName}
            onChange={(event) => updateField('brandName', event.target.value)}
            placeholder="Название магазина или бренда"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="business-type">Тип бизнеса</Label>
        <select
          id="business-type"
          required
          value={form.businessType}
          onChange={(event) => updateField('businessType', event.target.value)}
          className="border-apple-hairline text-apple-ink focus-visible:border-apple-primary focus-visible:ring-apple-primary/20 rounded-apple-sm h-11 w-full border bg-transparent px-3.5 text-[14px] outline-none focus-visible:ring-2"
        >
          <option value="" disabled>
            Выберите вариант
          </option>
          <option value="registered">Есть ИП</option>
          <option value="in-progress">В процессе оформления</option>
          <option value="none">ИП нет</option>
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="seller-phone">Номер телефона</Label>
        <Input
          id="seller-phone"
          required
          type="tel"
          value={form.phone}
          onChange={(event) => updateField('phone', event.target.value)}
          placeholder="+993 6X XX XX XX"
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

      <Button type="submit" size="lg" className="w-full">
        Отправить заявку
      </Button>
      {submitted && (
        <p role="status" className="text-apple-primary text-center text-[13px]">
          Спасибо! Мы свяжемся с вами в ближайшее время.
        </p>
      )}
    </form>
  )
}
