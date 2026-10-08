'use client'

import { type FormEvent, useState } from 'react'

import type { VendorMeResponse } from '@dtc/api-contracts'
import { Check, Laptop, Moon, Sun, UserRound } from 'lucide-react'
import { toast } from 'sonner'

import { useVendor } from '@/app/dashboard/layout'
import { useTheme } from '@/components/providers/ThemeProvider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { medusa } from '@/lib/medusa'
import { cn } from '@/lib/utils'

const themeOptions = [
  { value: 'light', label: 'Светлая', description: 'Светлый интерфейс', icon: Sun },
  { value: 'dark', label: 'Тёмная', description: 'Тёмный интерфейс', icon: Moon },
  { value: 'system', label: 'Системная', description: 'Как на устройстве', icon: Laptop },
] as const

export default function SettingsPage() {
  const { vendorAdmin, vendor, updateVendorAdmin } = useVendor()
  const { theme, setTheme } = useTheme()
  const [firstName, setFirstName] = useState(vendorAdmin?.first_name ?? '')
  const [lastName, setLastName] = useState(vendorAdmin?.last_name ?? '')
  const [isSaving, setIsSaving] = useState(false)
  const [nameError, setNameError] = useState('')

  const hasChanges =
    firstName.trim() !== (vendorAdmin?.first_name ?? '') || lastName.trim() !== (vendorAdmin?.last_name ?? '')

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextFirstName = firstName.trim()
    const nextLastName = lastName.trim()
    if (!nextFirstName) {
      setNameError('Укажите имя')
      return
    }

    setIsSaving(true)
    try {
      const response = await medusa.client.fetch<VendorMeResponse>('/vendors/me', {
        method: 'POST',
        body: { first_name: nextFirstName, last_name: nextLastName },
      })
      updateVendorAdmin(response.vendor_admin)
      setNameError('')
      toast.success('Данные профиля сохранены')
    } catch (error) {
      toast.error('Не удалось сохранить профиль', {
        description: error instanceof Error ? error.message : undefined,
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="w-full px-5 py-8 sm:px-8">
      <div className="mx-auto max-w-3xl space-y-7">
        <div>
          <h1 className="text-apple-display-md text-apple-ink">Настройки</h1>
          <p className="text-apple-caption text-apple-ink-muted-48 mt-1">
            Управляйте данными профиля и оформлением панели.
          </p>
        </div>

        <section
          className="border-apple-hairline bg-apple-canvas rounded-apple-md overflow-hidden border"
          aria-labelledby="profile-heading"
        >
          <div className="border-apple-hairline flex items-center gap-3 border-b px-6 py-5">
            <div className="bg-apple-canvas-parchment text-apple-primary flex size-10 shrink-0 items-center justify-center rounded-full">
              <UserRound className="size-5" />
            </div>
            <div>
              <h2 id="profile-heading" className="text-apple-body-strong text-apple-ink">
                Личная информация
              </h2>
              <p className="text-apple-caption text-apple-ink-muted-48">Данные вашей учётной записи продавца</p>
            </div>
          </div>

          <form onSubmit={saveProfile} className="space-y-5 px-6 py-6">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="settings-first-name">Имя</Label>
                <Input
                  id="settings-first-name"
                  value={firstName}
                  maxLength={100}
                  autoComplete="given-name"
                  aria-invalid={!!nameError}
                  aria-describedby={nameError ? 'settings-name-error' : undefined}
                  onChange={(event) => {
                    setFirstName(event.target.value)
                    setNameError('')
                  }}
                />
                {nameError && (
                  <p id="settings-name-error" className="text-destructive text-xs">
                    {nameError}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="settings-last-name">Фамилия</Label>
                <Input
                  id="settings-last-name"
                  value={lastName}
                  maxLength={100}
                  autoComplete="family-name"
                  onChange={(event) => setLastName(event.target.value)}
                />
              </div>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="settings-email">Электронная почта</Label>
                <Input
                  id="settings-email"
                  type="email"
                  value={vendorAdmin?.email ?? ''}
                  readOnly
                  className="text-apple-ink-muted-80"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="settings-store">Магазин</Label>
                <Input
                  id="settings-store"
                  value={vendor?.store_name || vendor?.name || ''}
                  readOnly
                  className="text-apple-ink-muted-80"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={!hasChanges || isSaving}>
                {isSaving ? 'Сохранение…' : 'Сохранить изменения'}
              </Button>
            </div>
          </form>
        </section>

        <section
          className="border-apple-hairline bg-apple-canvas rounded-apple-md overflow-hidden border"
          aria-labelledby="theme-heading"
        >
          <div className="border-apple-hairline border-b px-6 py-5">
            <h2 id="theme-heading" className="text-apple-body-strong text-apple-ink">
              Оформление
            </h2>
            <p className="text-apple-caption text-apple-ink-muted-48 mt-1">
              Выберите удобную тему для панели управления.
            </p>
          </div>
          <div className="grid gap-3 px-6 py-6 sm:grid-cols-3" role="group" aria-labelledby="theme-heading">
            {themeOptions.map((option) => {
              const Icon = option.icon
              const selected = theme === option.value
              return (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setTheme(option.value)}
                  className={cn(
                    'border-apple-hairline bg-apple-surface-pearl text-apple-ink rounded-apple-sm focus-visible:ring-apple-primary flex cursor-pointer items-start gap-3 border p-4 text-left transition-colors focus-visible:ring-2 focus-visible:outline-none',
                    selected ? 'border-apple-primary bg-apple-primary/10' : 'hover:border-apple-primary/50',
                  )}
                >
                  <Icon className="text-apple-primary mt-0.5 size-5 shrink-0" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[14px] font-semibold">{option.label}</span>
                    <span className="text-apple-ink-muted-48 mt-1 block text-xs">{option.description}</span>
                  </span>
                  {selected && <Check className="text-apple-primary size-4 shrink-0" aria-hidden="true" />}
                </button>
              )
            })}
          </div>
        </section>
      </div>
    </div>
  )
}
