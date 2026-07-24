'use client'

import { useEffect, useState } from 'react'

import type { StoreCustomer } from '@medusajs/types'
import { Info, Mail, Phone, ShieldCheck, User } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { useUpdateProfile } from '../api/queries'

interface PersonalInfoTabProps {
  customer: {
    first_name?: string | null
    last_name?: string | null
    company_name?: string | null
    phone_number?: string | null
    phone?: string | null
    email?: string | null
  } | null
}

export function PersonalInfoTab({ customer }: PersonalInfoTabProps) {
  const updateMutation = useUpdateProfile()

  const [firstName, setFirstName] = useState(customer?.first_name ?? '')
  const [lastName, setLastName] = useState(customer?.last_name ?? '')
  const [companyName, setCompanyName] = useState(customer?.company_name ?? '')

  useEffect(() => {
    if (customer) {
      setFirstName(customer.first_name ?? '')
      setLastName(customer.last_name ?? '')
      setCompanyName(customer.company_name ?? '')
    }
  }, [customer])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await updateMutation.mutateAsync({
      first_name: firstName,
      last_name: lastName,
      company_name: companyName,
    })
  }

  const phone = customer?.phone

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-apple-ink flex items-center gap-2 text-xl font-semibold tracking-[-0.28px]">
          <User className="text-apple-primary h-5 w-5" /> Личные данные
        </h2>
        <p className="text-apple-ink-muted-48 text-apple-caption mt-0.5">
          Управляйте своей личной информацией и контактными данными
        </p>
      </div>

      <Card className="rounded-apple-lg border-apple-hairline bg-apple-canvas border p-6">
        <CardContent className="p-0">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* First Name & Last Name */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="first_name" className="text-apple-caption font-semibold">
                  Имя
                </Label>
                <Input
                  id="first_name"
                  placeholder="Имя"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="rounded-apple-sm mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="last_name" className="text-apple-caption font-semibold">
                  Фамилия
                </Label>
                <Input
                  id="last_name"
                  placeholder="Фамилия"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="rounded-apple-sm mt-1.5"
                />
              </div>
            </div>

            {/* Company Name */}
            <div>
              <Label htmlFor="company_name" className="text-apple-caption font-semibold">
                Компания / Организация
              </Label>
              <Input
                id="company_name"
                placeholder="ООО Предприятие"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="rounded-apple-sm mt-1.5"
              />
            </div>

            {/* Read-Only Verified Phone */}
            <div>
              <div className="flex items-center justify-between">
                <Label className="text-apple-caption flex items-center gap-1.5 font-semibold">
                  <Phone className="text-apple-primary h-3.5 w-3.5" /> Номер телефона
                </Label>
                <Badge
                  variant="outline"
                  className="gap-1 border-emerald-200 bg-emerald-50 text-[11px] font-medium text-emerald-700"
                >
                  <ShieldCheck className="h-3 w-3" /> Подтвержден по SMS
                </Badge>
              </div>
              <Input
                disabled
                value={phone || '—'}
                className="rounded-apple-sm bg-apple-canvas-parchment text-apple-ink-muted-80 mt-1.5 cursor-not-allowed font-mono"
              />
              <p className="text-apple-fine-print text-apple-ink-muted-48 mt-1">
                Номер телефона используется для входа в аккаунт и не может быть изменен прямо здесь.
              </p>
            </div>

            {/* Email Field with Not Added State */}
            <div>
              <Label className="text-apple-caption flex items-center gap-1.5 font-semibold">
                <Mail className="text-apple-ink-muted-48 h-3.5 w-3.5" /> Электронная почта
              </Label>
              <div className="relative mt-1.5">
                <Input
                  disabled
                  value={
                    customer?.email && !customer.email.endsWith('@phone.storefront') ? customer.email : 'Не добавлен'
                  }
                  className="rounded-apple-sm bg-apple-canvas-parchment text-apple-ink-muted-48 cursor-not-allowed italic"
                />
              </div>
              <div className="text-apple-ink-muted-80 bg-apple-surface-pearl rounded-apple-sm border-apple-hairline mt-2 flex items-start gap-2 border p-2.5 text-[12px]">
                <Info className="text-apple-primary mt-0.5 h-4 w-4 shrink-0" />
                <span>
                  Подтверждение электронной почты и возможность привязки Email появятся в ближайших обновлениях.
                </span>
              </div>
            </div>

            {/* Action Button */}
            <div className="border-apple-divider-soft flex justify-end border-t pt-3">
              <Button
                type="submit"
                disabled={updateMutation.isPending}
                className="bg-apple-primary hover:bg-apple-primary-focus rounded-full px-6 text-xs font-semibold text-white transition active:scale-95"
              >
                {updateMutation.isPending ? 'Сохранение…' : 'Сохранить изменения'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
