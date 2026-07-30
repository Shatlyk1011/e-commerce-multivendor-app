'use client'

import { useEffect, useState } from 'react'

import type { StoreCustomerAddress } from '@medusajs/types'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

import type { CreateAddressInput } from '../api/client'
import { useCreateAddress, useUpdateAddress } from '../api/queries'

// ─── Zod schema ──────────────────────────────────────────────────────────────
const addressSchema = z.object({
  province: z.string().min(1, 'Укажите район'),
  address_1: z.string().min(1, 'Укажите адрес'),
  address_2: z.string().min(1, 'Укажите номер дома'),
  postal_code: z.string().optional(),
  address_name: z.string().optional(),
})

type AddressFormErrors = Partial<Record<keyof z.infer<typeof addressSchema>, string>>

// ─── Props ────────────────────────────────────────────────────────────────────
interface AddressModalProps {
  address: StoreCustomerAddress | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

// ─── Component ────────────────────────────────────────────────────────────────
export function AddressModal({ address, open, onOpenChange }: AddressModalProps) {
  const isEditing = Boolean(address)
  const createMutation = useCreateAddress()
  const updateMutation = useUpdateAddress()

  const [formData, setFormData] = useState<CreateAddressInput>({
    address_name: '',
    first_name: '',
    last_name: '',
    address_1: '',
    address_2: '',
    city: 'Ашхабад',
    province: '',
    postal_code: '',
    phone: '',
    is_default_shipping: false,
    is_default_billing: false,
  })

  // Per-field errors — only shown after the user has touched/submitted
  const [errors, setErrors] = useState<AddressFormErrors>({})
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (address) {
      setFormData({
        address_name: address.address_name ?? '',
        first_name: address.first_name ?? '',
        last_name: address.last_name ?? '',
        address_1: address.address_1 ?? '',
        address_2: address.address_2 ?? '',
        city: address.city ?? 'Туркменабад',
        province: address.province ?? '',
        postal_code: address.postal_code ?? '',
        phone: address.phone ?? '',
        is_default_shipping: address.is_default_shipping ?? false,
        is_default_billing: address.is_default_billing ?? false,
      })
    } else {
      setFormData({
        address_name: '',
        first_name: '',
        last_name: '',
        address_1: '',
        address_2: '',
        city: 'Туркменабад',
        province: '',
        postal_code: '',
        phone: '',
        is_default_shipping: false,
        is_default_billing: false,
      })
    }
    // Reset validation state when the modal is opened/closed
    setErrors({})
    setSubmitted(false)
  }, [address, open])

  // Live-validate a single field after the first submission attempt
  function validateField<K extends keyof z.infer<typeof addressSchema>>(
    field: K,
    value: z.infer<typeof addressSchema>[K],
  ) {
    if (!submitted) return
    const result = addressSchema.shape[field].safeParse(value)
    setErrors((prev) => ({
      ...prev,
      [field]: result.success ? undefined : result.error.issues[0]?.message,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)

    const result = addressSchema.safeParse({
      province: formData.province,
      address_1: formData.address_1,
      address_2: formData.address_2,
      postal_code: formData.postal_code,
      address_name: formData.address_name,
    })

    if (!result.success) {
      const fieldErrors: AddressFormErrors = {}
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof AddressFormErrors
        if (!fieldErrors[key]) fieldErrors[key] = issue.message
      }
      setErrors(fieldErrors)
      return
    }

    setErrors({})
    if (isEditing && address) {
      await updateMutation.mutateAsync({ addressId: address.id, data: formData })
    } else {
      await createMutation.mutateAsync(formData)
    }
    onOpenChange(false)
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-apple-lg border-apple-hairline bg-apple-canvas min-w-xl p-8 pb-5">
        <DialogHeader className="border-apple-divider-soft border-b pb-4">
          <DialogTitle className="text-apple-ink text-xl font-semibold tracking-[-0.28px]">
            {isEditing ? 'Редактировать адрес' : 'Добавить новый адрес'}
          </DialogTitle>
          <p className="text-apple-ink/50 mt-0.5 text-[13px]">
            Поля, отмеченные <span className="text-apple-primary">*</span>, обязательны для заполнения
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {/* District */}
          <div>
            <Label htmlFor="province" className="text-apple-ink mb-1.5 text-[13px] font-semibold tracking-[-0.224px]">
              Район <span className="text-apple-primary">*</span>
            </Label>
            <Input
              id="province"
              placeholder="Например: Bahar, Za most"
              value={formData.province}
              aria-invalid={!!errors.province}
              onChange={(e) => {
                const value = e.target.value
                setFormData((prev) => ({ ...prev, province: value }))
                validateField('province', value)
              }}
            />
            {errors.province && (
              <p className="text-destructive mt-1 text-[12px] tracking-[-0.12px]">{errors.province}</p>
            )}
          </div>

          {/* Address info */}
          <div>
            <Label htmlFor="address_1" className="text-apple-ink mb-1.5 text-[13px] font-semibold tracking-[-0.224px]">
              Адрес <span className="text-apple-primary">*</span>
            </Label>
            <Input
              id="address_1"
              placeholder="Улица, ориентир, название здания"
              value={formData.address_1}
              aria-invalid={!!errors.address_1}
              onChange={(e) => {
                const value = e.target.value
                setFormData((prev) => ({ ...prev, address_1: value }))
                validateField('address_1', value)
              }}
            />
            {errors.address_1 && (
              <p className="text-destructive mt-1 text-[12px] tracking-[-0.12px]">{errors.address_1}</p>
            )}
          </div>

          {/* Home number + Floor */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label
                htmlFor="address_2"
                className="text-apple-ink mb-1.5 text-[13px] font-semibold tracking-[-0.224px]"
              >
                Номер дома <span className="text-apple-primary">*</span>
              </Label>
              <Input
                id="address_2"
                placeholder="Дом / квартира"
                value={formData.address_2 ?? ''}
                aria-invalid={!!errors.address_2}
                onChange={(e) => {
                  const value = e.target.value
                  setFormData((prev) => ({ ...prev, address_2: value }))
                  validateField('address_2', value)
                }}
              />
              {errors.address_2 && (
                <p className="text-destructive mt-1 text-[12px] tracking-[-0.12px]">{errors.address_2}</p>
              )}
            </div>
            <div>
              <Label
                htmlFor="postal_code"
                className="text-apple-ink mb-1.5 text-[13px] font-semibold tracking-[-0.224px]"
              >
                Этаж
              </Label>
              <Input
                id="postal_code"
                placeholder="Например: 3"
                value={formData.postal_code ?? ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, postal_code: e.target.value }))}
              />
            </div>
          </div>

          {/* Comment for courier */}
          <div>
            <Label
              htmlFor="address_name"
              className="text-apple-ink mb-1.5 text-[13px] font-semibold tracking-[-0.224px]"
            >
              Комментарий для курьера
            </Label>
            <Textarea
              id="address_name"
              placeholder="Код домофона, время доставки, особые указания…"
              value={formData.address_name ?? ''}
              onChange={(e) => setFormData((prev) => ({ ...prev, address_name: e.target.value }))}
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Actions */}
          <div className="border-apple-divider-soft flex justify-end gap-3 border-t pt-5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="border-apple-hairline text-apple-ink hover:bg-apple-canvas-parchment rounded-full font-semibold"
            >
              Отмена
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isPending}
              className="bg-apple-primary hover:bg-apple-primary-focus rounded-full font-semibold text-white disabled:opacity-40"
            >
              {isPending ? 'Сохранение…' : isEditing ? 'Сохранить' : 'Добавить адрес'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
