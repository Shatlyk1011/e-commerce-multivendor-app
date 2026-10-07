'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

import type { StoreCustomerAddress } from '@medusajs/types'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { LucideIcon } from 'lucide-react'
import {
  Banknote,
  CalendarDays,
  Check,
  ChevronLeft,
  Clock3,
  Loader2,
  LockKeyhole,
  LogIn,
  MapPin,
  Package,
  Plus,
  Truck,
} from 'lucide-react'
import { toast } from 'sonner'

import { AuthDialog } from '@/components/layout/AuthDialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { useCustomerAddresses } from '@/features/account/api/queries'
import { AddressModal } from '@/features/account/components/AddressModal'
import { useAuth } from '@/features/auth/components/AuthProvider'
import { cartKeys, useCart } from '@/features/cart/api/queries'
import { CartItem } from '@/features/cart/components/CartItem'
import { formatPrice, getCartItemCount, getCartSubtotal } from '@/features/cart/utils'
import { removeCartId } from '@/lib/cart-cookies'
import { medusa } from '@/lib/medusa'

import { type DeliveryMethod, completeVendorOrder } from '../api/client'

function addressToCartAddress(address: StoreCustomerAddress) {
  return {
    first_name: address.first_name,
    last_name: address.last_name,
    company: address.company,
    address_1: address.address_1,
    address_2: address.address_2,
    city: address.city,
    country_code: address.country_code,
    province: address.province,
    postal_code: address.postal_code,
    phone: address.phone,
  }
}

function formatAddress(address: StoreCustomerAddress) {
  return [address.city, address.address_1, address.address_2].filter(Boolean).join(', ')
}

type DeliveryDate = 1 | 2

const COURIER_DELIVERY_FEE = 10
const deliveryMethods: Array<{ id: DeliveryMethod; title: string; description: string }> = [
  { id: 'pickup', title: 'Самовывоз из пункта выдачи', description: 'Заберите заказ в удобном пункте выдачи.' },
  { id: 'courier', title: 'Курьерская доставка', description: 'Курьер доставит заказ по указанному адресу.' },
]
const pickupPoints = [
  { id: 'central', title: 'Центральный пункт выдачи', area: 'Центральный район', hours: 'Ежедневно, 10:00–20:00' },
  { id: 'east', title: 'Восточный пункт выдачи', area: 'Восточный район', hours: 'Ежедневно, 10:00–20:00' },
  { id: 'north', title: 'Северный пункт выдачи', area: 'Северный район', hours: 'Ежедневно, 10:00–20:00' },
]

const tomorrowTimeSlots = ['14:00–15:00', '15:00–16:00', '16:00–17:00', '17:00–18:00', '18:00–19:00', '19:00–20:00']
const laterTimeSlots = [
  '11:00–12:00',
  '12:00–13:00',
  '13:00–14:00',
  '14:00–15:00',
  '15:00–16:00',
  '16:00–17:00',
  '17:00–18:00',
  '18:00–19:00',
  '19:00–20:00',
]

function getDeliveryDates(): Array<{ id: DeliveryDate; label: string; date: string }> {
  return ([1, 2] as DeliveryDate[]).map((offset) => {
    const date = new Date()
    date.setDate(date.getDate() + offset)

    return {
      id: offset,
      label: offset === 1 ? 'Завтра' : 'Послезавтра',
      date: new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', weekday: 'short' }).format(date),
    }
  })
}

function SectionTitle({
  number,
  icon: Icon,
  children,
}: {
  number: string
  icon: LucideIcon
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="bg-apple-primary/10 text-apple-primary flex size-7 items-center justify-center rounded-full text-xs font-bold">
        {number}
      </span>
      <Icon className="text-apple-primary size-4" aria-hidden="true" />
      <h2 className="text-apple-ink text-[17px] font-semibold tracking-[-0.2px]">{children}</h2>
    </div>
  )
}

export function CheckoutPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { customer, isAuthenticated } = useAuth()
  const { data: cart, isLoading: cartLoading } = useCart()
  const { data: addresses = [], isLoading: addressesLoading } = useCustomerAddresses()
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)
  const [addressDialogOpen, setAddressDialogOpen] = useState(false)
  const [authDialogOpen, setAuthDialogOpen] = useState(false)
  const [selectedDeliveryMethod, setSelectedDeliveryMethod] = useState<DeliveryMethod | null>(null)
  const [selectedPickupPoint, setSelectedPickupPoint] = useState<string | null>(null)
  const [selectedDeliveryDate, setSelectedDeliveryDate] = useState<DeliveryDate | null>(null)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null)
  const [customerNote, setCustomerNote] = useState('')
  const initialAddressAppliedRef = useRef<string | null>(null)

  const selectedAddress = useMemo(() => {
    if (selectedAddressId) {
      return addresses.find((address) => address.id === selectedAddressId) ?? null
    }

    return addresses.find((address) => address.is_default_shipping) ?? addresses[0] ?? null
  }, [addresses, selectedAddressId])

  const addressMutation = useMutation({
    mutationFn: async (address: StoreCustomerAddress) => {
      if (!cart) throw new Error('Корзина не найдена')
      const { cart: updatedCart } = await medusa.store.cart.update(cart.id, {
        shipping_address: addressToCartAddress(address),
      })
      return updatedCart
    },
    onSuccess: (updatedCart, address) => {
      setSelectedAddressId(address.id)
      queryClient.setQueryData(cartKeys.all, updatedCart)
    },
    onError: () => toast.error('Не удалось сохранить адрес доставки. Попробуйте ещё раз.'),
  })

  const { isPending: isAddressMutationPending, mutate: mutateAddress } = addressMutation
  const isPickup = selectedDeliveryMethod === 'pickup'
  const requiresAddress = selectedDeliveryMethod === 'courier'
  const deliveryDates = useMemo(() => getDeliveryDates(), [])
  const timeSlots = selectedDeliveryDate === 1 ? tomorrowTimeSlots : laterTimeSlots

  useEffect(() => {
    if (
      !requiresAddress ||
      !selectedAddress ||
      isAddressMutationPending ||
      initialAddressAppliedRef.current === selectedAddress.id
    ) {
      return
    }

    initialAddressAppliedRef.current = selectedAddress.id
    mutateAddress(selectedAddress)
  }, [isAddressMutationPending, mutateAddress, requiresAddress, selectedAddress])

  const completeMutation = useMutation({
    mutationFn: async () => {
      if (!cart || !selectedDeliveryMethod) throw new Error('Выберите способ доставки')
      if (isPickup && !selectedPickupPoint) throw new Error('Выберите пункт выдачи')
      if (!isPickup && (!selectedDeliveryDate || !selectedTimeSlot)) throw new Error('Выберите дату и время доставки')
      if (requiresAddress && !selectedAddress) throw new Error('Выберите адрес доставки')

      const deliveryDate = selectedDeliveryDate
        ? new Date(Date.now() + selectedDeliveryDate * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
        : undefined
      const payload = {
        delivery_method: selectedDeliveryMethod,
        payment_method: 'cash' as const,
        pickup_point_id: isPickup ? (selectedPickupPoint ?? undefined) : undefined,
        delivery_date: deliveryDate,
        time_slot: isPickup ? undefined : (selectedTimeSlot ?? undefined),
        recipient_phone: selectedAddress?.phone || customer?.phone_number,
        customer_note: customerNote.trim() || undefined,
      }

      return completeVendorOrder(cart.id, payload)
    },
    onSuccess: (result) => {
      removeCartId()
      queryClient.setQueryData(cartKeys.all, null)
      toast.success(`Заказ #${result.order.display_id ?? result.order.id.slice(-6)} оформлен`)
      router.push('/account/orders')
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Не удалось оформить заказ. Попробуйте ещё раз.'
      toast.error(message)
    },
  })

  if (cartLoading || addressesLoading) {
    return (
      <main className="bg-apple-canvas min-h-[70vh]">
        <div className="mx-auto flex max-w-7xl items-center justify-center px-5 py-32">
          <Loader2 className="text-apple-primary size-6 animate-spin" />
        </div>
      </main>
    )
  }

  if (!cart || getCartItemCount(cart) === 0) {
    return (
      <main className="bg-apple-canvas min-h-[70vh] py-12 sm:py-20">
        <section className="mx-auto max-w-xl px-5 text-center">
          <Package className="text-apple-ink-muted-48 mx-auto size-12" strokeWidth={1.4} />
          <h1 className="text-apple-ink font-heading mt-5 text-2xl font-bold">Корзина пока пуста</h1>
          <p className="text-apple-ink-muted-48 mt-2">Добавьте товары, чтобы перейти к оформлению заказа.</p>
          <Button asChild className="mt-6">
            <Link href="/">В каталог</Link>
          </Button>
        </section>
      </main>
    )
  }

  const currencyCode = cart.currency_code ?? 'TMT'
  const subtotal = cart.subtotal ?? getCartSubtotal(cart)
  const shippingTotal = cart.shipping_total ?? 0
  const total = cart.total ?? subtotal + shippingTotal
  const deliveryFee = selectedDeliveryMethod === 'courier' ? COURIER_DELIVERY_FEE : 0
  const canComplete = Boolean(
    isAuthenticated &&
    selectedDeliveryMethod &&
    (isPickup ? selectedPickupPoint : selectedDeliveryDate && selectedTimeSlot && selectedAddress),
  )

  return (
    <main className="bg-apple-canvas min-h-screen pb-28 sm:pb-12">
      <div className="border-apple-divider-soft border-b">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <Button asChild variant="ghost" size="sm" className="-ml-[15px]">
            <Link href="/">
              <ChevronLeft /> Продолжить покупки
            </Link>
          </Button>
          <span className="text-apple-ink-muted-48 hidden items-center gap-1.5 text-xs font-medium sm:flex">
            <LockKeyhole className="size-3.5" /> Защищённое оформление
          </span>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-7">
          <p className="text-apple-primary text-xs font-semibold tracking-[0.08em] uppercase">Оформление заказа</p>
          <h1 className="text-apple-ink font-heading mt-1 text-3xl font-bold tracking-[-0.6px]">Почти готово</h1>
          <p className="text-apple-ink-muted-48 mt-1 text-sm">
            Проверьте Ваш заказ и выберите удобный способ доставки.
          </p>
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="flex flex-col gap-4">
            {!isAuthenticated && (
              <div className="rounded-apple-md flex items-center justify-between gap-4 border border-amber-500/20 bg-amber-500/10 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-amber-700">
                    <LogIn className="size-4" />
                  </div>
                  <div>
                    <p className="text-apple-ink text-sm font-semibold">Необходима авторизация</p>
                    <p className="text-apple-ink-muted-48 mt-0.5 text-xs">
                      Войдите в аккаунт, чтобы завершить оформление заказа.
                    </p>
                  </div>
                </div>
                <Button size="sm" onClick={() => setAuthDialogOpen(true)} className="shrink-0">
                  Войти
                </Button>
              </div>
            )}

            <Card className="order-1 gap-0">
              <CardHeader className="border-apple-divider-soft border-b">
                <SectionTitle number="1" icon={Truck}>
                  Способ доставки
                </SectionTitle>
              </CardHeader>
              <CardContent className="pt-5">
                <div className="space-y-2.5">
                  {deliveryMethods.map((method) => (
                    <Button
                      key={method.id}
                      type="button"
                      variant={'secondaryPill'}
                      onClick={() => {
                        setSelectedDeliveryMethod(method.id)
                        setSelectedPickupPoint(null)
                        setSelectedDeliveryDate(null)
                        setSelectedTimeSlot(null)
                      }}
                      className={`flex h-full w-full justify-start gap-4 px-4 py-2 text-left ${selectedDeliveryMethod === method.id ? 'border-apple-primary bg-apple-primary/5 ring-apple-primary/20 ring-1' : 'border-apple-hairline hover:border-apple-primary/50 hover:bg-transparent'}`}
                    >
                      <span
                        className={`flex size-4 shrink-0 items-center justify-center rounded-full border ${selectedDeliveryMethod === method.id ? 'border-apple-primary bg-apple-primary' : 'border-apple-ink-muted-48'}`}
                      >
                        {selectedDeliveryMethod === method.id && <Check className="size-3 text-white" />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="text-apple-ink mb-1 block text-sm font-semibold">{method.title}</span>
                        <span className="text-apple-ink-muted-48 block text-xs">{method.description}</span>
                      </span>
                      {method.id === 'courier' && <span className="text-apple-ink text-sm font-semibold">+10 TMT</span>}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {isPickup && (
              <Card className="order-2 gap-0">
                <CardHeader className="border-apple-divider-soft border-b">
                  <SectionTitle number="2" icon={MapPin}>
                    Пункт выдачи
                  </SectionTitle>
                </CardHeader>
                <CardContent className="pt-5">
                  <div className="bg-apple-canvas-parchment rounded-apple-md mb-4 p-4">
                    <p className="text-apple-ink text-sm font-semibold">Как работает самовывоз</p>
                    <p className="text-apple-ink-muted-48 mt-1 text-[13px] leading-relaxed text-balance">
                      Выберите удобный пункт, дождитесь сообщения о готовности и заберите заказ, оплатив его{' '}
                      <b>наличными на месте</b>.
                    </p>
                  </div>
                  <p className="text-apple-ink mb-3 text-sm font-semibold">Выберите пункт</p>
                  <div className="space-y-2.5">
                    {pickupPoints.map((point) => {
                      const isSelected = selectedPickupPoint === point.id
                      return (
                        <Button
                          key={point.id}
                          type="button"
                          variant={'secondaryPill'}
                          onClick={() => setSelectedPickupPoint(point.id)}
                          className={`flex h-full w-full justify-start gap-4 px-4 py-2 text-left ${isSelected ? 'border-apple-primary bg-apple-primary/5 ring-apple-primary/20 ring-1' : 'border-apple-hairline hover:border-apple-primary/50 hover:bg-transparent'}`}
                        >
                          <span
                            className={`flex size-4 shrink-0 items-center justify-center rounded-full border ${isSelected ? 'border-apple-primary bg-apple-primary' : 'border-apple-ink-muted-48'}`}
                          >
                            {isSelected && <Check className="size-3 text-white" />}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="text-apple-ink block text-sm font-semibold">{point.title}</span>
                            <span className="text-apple-ink-muted-48 block text-xs">
                              {point.area} · {point.hours}
                            </span>
                          </span>
                        </Button>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {requiresAddress && (
              <Card className="order-2 gap-0">
                <CardHeader className="border-apple-divider-soft border-b">
                  <SectionTitle number="2" icon={MapPin}>
                    Адрес доставки
                  </SectionTitle>
                </CardHeader>
                <CardContent className="pt-5">
                  {addresses.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3">
                      {addresses.map((address) => {
                        const isSelected = selectedAddress?.id === address.id
                        return (
                          <button
                            key={address.id}
                            type="button"
                            onClick={() => addressMutation.mutate(address)}
                            disabled={addressMutation.isPending}
                            className={`rounded-apple-lg focus-visible:ring-apple-primary-focus relative min-h-24 border p-4 text-left transition-colors focus-visible:ring-2 disabled:opacity-60 ${isSelected ? 'border-apple-primary bg-apple-primary/5 ring-apple-primary/20 ring-1' : 'border-apple-hairline hover:border-apple-primary/50 hover:bg-transparent'}`}
                          >
                            {isSelected && (
                              <Check className="bg-apple-primary absolute top-3 right-3 size-4 rounded-full p-0.5 text-white" />
                            )}
                            <p className="text-apple-ink pr-5 text-sm font-semibold">
                              {address.address_name || 'Адрес доставки'}
                            </p>
                            <p className="text-apple-ink-muted-80 mt-2 text-[13px] leading-relaxed">
                              {formatAddress(address)}
                            </p>
                            {address.phone && <p className="text-apple-ink-muted-48 mt-1 text-xs">{address.phone}</p>}
                          </button>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="bg-apple-canvas-parchment rounded-apple-md p-5">
                      <p className="text-apple-ink text-sm font-medium">Добавьте адрес для курьерской доставки.</p>
                      <p className="text-apple-ink-muted-48 mt-1 text-[13px]">
                        Он сохранится в вашем профиле для следующего заказа.
                      </p>
                    </div>
                  )}
                  <Button
                    variant="secondaryPill"
                    size="sm"
                    className="mt-4"
                    onClick={() => {
                      if (!isAuthenticated) {
                        setAuthDialogOpen(true)
                      } else {
                        setAddressDialogOpen(true)
                      }
                    }}
                  >
                    <Plus /> Новый адрес
                  </Button>
                </CardContent>
              </Card>
            )}

            {requiresAddress && (
              <Card className="order-3 gap-0">
                <CardHeader className="border-apple-divider-soft border-b">
                  <SectionTitle number="3" icon={CalendarDays}>
                    Дата и время доставки
                  </SectionTitle>
                </CardHeader>
                <CardContent className="pt-5">
                  <p className="text-apple-ink-muted-48 mb-3 text-[13px]">
                    Выберите день, затем удобный часовой интервал получения.
                  </p>
                  <div className="grid gap-2 sm:grid-cols-3">
                    {deliveryDates.map((date) => (
                      <button
                        key={date.id}
                        type="button"
                        onClick={() => {
                          setSelectedDeliveryDate(date.id)
                          setSelectedTimeSlot(null)
                        }}
                        className={`rounded-apple-lg border p-3 text-left transition-colors ${selectedDeliveryDate === date.id ? 'border-apple-primary bg-apple-primary/5 ring-apple-primary/20 ring-1' : 'border-apple-hairline hover:border-apple-primary/50 hover:bg-transparent'}`}
                      >
                        <span className="text-apple-ink block text-sm font-semibold">{date.label}</span>
                        <span className="text-apple-ink-muted-48 mt-0.5 block text-xs capitalize">{date.date}</span>
                      </button>
                    ))}
                  </div>
                  {selectedDeliveryDate && (
                    <>
                      <p className="text-apple-ink mt-5 mb-3 text-sm font-semibold">
                        <Clock3 className="text-apple-primary mr-1.5 inline size-4" /> Удобное время для доставки
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        {timeSlots.map((slot) => (
                          <Button
                            variant={'secondaryPill'}
                            key={slot}
                            type="button"
                            onClick={() => setSelectedTimeSlot(slot)}
                            className={`rounded-apple-md border px-3 py-2.5 text-sm font-medium transition-all ${selectedTimeSlot === slot ? 'border-apple-primary bg-apple-primary/5 ring-apple-primary/20 ring-1' : 'border-apple-hairline hover:border-apple-primary/50 text-foreground hover:bg-transparent'}`}
                          >
                            {slot}
                          </Button>
                        ))}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            <Card className="order-4 gap-0">
              <CardHeader className="border-apple-divider-soft border-b">
                <SectionTitle number="4" icon={Banknote}>
                  Оплата
                </SectionTitle>
              </CardHeader>
              <CardContent className="pt-5">
                <div className="border-apple-primary bg-apple-primary/5 ring-apple-primary/20 rounded-apple-md flex items-center gap-3 border p-4 ring-1">
                  <Banknote className="text-apple-primary size-5 shrink-0" aria-hidden="true" />
                  <div>
                    <p className="text-apple-ink text-sm font-semibold">Оплата наличными</p>
                    <p className="text-apple-ink-muted-48 mt-0.5 text-xs">
                      Оплатите заказ наличными при получении. Банковские карты пока не поддерживаются.
                    </p>
                  </div>
                </div>
                <div className="mt-5">
                  <label htmlFor="customer-note" className="text-apple-ink mb-2 block text-sm font-semibold">
                    Комментарий к заказу <span className="text-apple-ink-muted-48 font-normal">(необязательно)</span>
                  </label>
                  <Textarea
                    id="customer-note"
                    value={customerNote}
                    onChange={(event) => setCustomerNote(event.target.value.slice(0, 500))}
                    placeholder="Например, позвоните перед доставкой"
                    maxLength={500}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <aside className="sticky top-20">
            <Card variant="parchment" className="bg-accent text-accent-foreground gap-0">
              <CardHeader className="border-apple-divider-soft border-b">
                <CardTitle>Ваш заказ</CardTitle>
              </CardHeader>
              <CardContent className="pt-5">
                <ul className="space-y-3 font-normal">
                  {cart.items?.map((item) => (
                    <CartItem key={item.id} item={item} />
                  ))}
                </ul>
                <div className="border-apple-divider-soft mt-5 space-y-2.5 border-t pt-4 text-[13px]">
                  <div className="text-apple-ink-muted-80 flex justify-between">
                    <span>Товары ({cart.items?.length})</span>
                    <span>{formatPrice(subtotal, currencyCode)}</span>
                  </div>
                  <div className="text-apple-ink-muted-80 flex justify-between">
                    <span>Доставка</span>
                    <span>
                      {!selectedDeliveryMethod
                        ? 'Выберите способ'
                        : deliveryFee
                          ? '10 TMT'
                          : 'Бесплатно в пункт выдачи'}
                    </span>
                  </div>
                  <div className="border-apple-divider-soft mt-3 flex justify-between border-t pt-3 text-base font-bold">
                    <span>Итого</span>
                    <span>{formatPrice(total + deliveryFee, currencyCode)}</span>
                  </div>
                </div>
                <Button
                  className="mt-5 w-full"
                  size="lg"
                  disabled={!canComplete || completeMutation.isPending}
                  onClick={() => completeMutation.mutate()}
                >
                  {completeMutation.isPending ? (
                    <>
                      <Loader2 className="animate-spin" /> Оформляем…
                    </>
                  ) : (
                    `Оформить заказ`
                  )}
                </Button>
                {!canComplete && (
                  <p className="text-apple-ink-muted-48 mt-2 text-center text-[11px]">
                    {!isAuthenticated
                      ? 'Войдите, чтобы продолжить оформление.'
                      : isPickup
                        ? 'Выберите пункт выдачи.'
                        : requiresAddress
                          ? 'Выберите адрес, дату и время доставки.'
                          : 'Выберите способ доставки.'}
                  </p>
                )}
                <p className="text-apple-ink-muted-48 mt-4 flex items-start justify-start gap-2 text-[11px] leading-relaxed">
                  <LockKeyhole className="mt-0.5 size-3 shrink-0" /> Нажимая «Оформить заказ», вы подтверждаете данные
                  заказа.
                </p>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>

      <div className="border-apple-divider-soft bg-apple-canvas fixed right-0 bottom-0 left-0 z-20 border-t p-3 lg:hidden">
        <div className="mx-auto flex max-w-lg items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-apple-ink-muted-48 text-[11px]">Итого</p>
            <p className="text-apple-ink text-sm font-bold">{formatPrice(total + deliveryFee, currencyCode)}</p>
          </div>
          <Button disabled={!canComplete || completeMutation.isPending} onClick={() => completeMutation.mutate()}>
            {completeMutation.isPending ? <Loader2 className="animate-spin" /> : 'Оформить'}
          </Button>
        </div>
      </div>

      <AddressModal address={null} open={addressDialogOpen} onOpenChange={setAddressDialogOpen} />
      <AuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} />
    </main>
  )
}
