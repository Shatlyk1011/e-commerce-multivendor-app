'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

import Link from 'next/link'

import type { StoreCustomerAddress } from '@medusajs/types'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { LucideIcon } from 'lucide-react'
import {
  CalendarDays,
  Check,
  ChevronLeft,
  Clock3,
  CreditCard,
  Loader2,
  LockKeyhole,
  LogIn,
  MapPin,
  Package,
  Plus,
  Truck,
  UserRoundCheck,
} from 'lucide-react'
import { toast } from 'sonner'

import { AuthDialog } from '@/components/layout/AuthDialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useCustomerAddresses } from '@/features/account/api/queries'
import { AddressModal } from '@/features/account/components/AddressModal'
import { useAuth } from '@/features/auth/components/AuthProvider'
import { cartKeys, useCart } from '@/features/cart/api/queries'
import { formatPrice, getCartItemCount, getCartSubtotal } from '@/features/cart/utils'
import { medusa } from '@/lib/medusa'

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

type DeliveryMethod = 'pickup' | 'courier'
type DeliveryDate = 1 | 2

const COURIER_DELIVERY_FEE = 10
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

const deliveryMethods: Array<{
  id: DeliveryMethod
  title: string
  description: string
}> = [
  {
    id: 'pickup',
    title: 'Самовывоз из пункта выдачи',
    description: 'Заберите заказ в удобном пункте выдачи.',
  },
  {
    id: 'courier',
    title: 'Курьерская доставка',
    description: 'Курьер доставит заказ по указанному адресу.',
  },
]

const pickupPoints = [
  { id: 'central', title: 'Центральный пункт выдачи', area: 'Центральный район', hours: 'Ежедневно, 10:00–20:00' },
  { id: 'east', title: 'Восточный пункт выдачи', area: 'Восточный район', hours: 'Ежедневно, 10:00–20:00' },
  { id: 'north', title: 'Северный пункт выдачи', area: 'Северный район', hours: 'Ежедневно, 10:00–20:00' },
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
  const initialAddressAppliedRef = useRef<string | null>(null)

  const selectedAddress = useMemo(
    () => addresses.find((address) => address.id === selectedAddressId) ?? null,
    [addresses, selectedAddressId],
  )

  useEffect(() => {
    if (selectedAddressId || addresses.length === 0) return
    const defaultAddress = addresses.find((address) => address.is_default_shipping) ?? addresses[0]
    setSelectedAddressId(defaultAddress.id)
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

  const isPickup = selectedDeliveryMethod === 'pickup'
  const requiresAddress = selectedDeliveryMethod === 'courier'
  const deliveryDates = useMemo(getDeliveryDates, [])
  const timeSlots = selectedDeliveryDate === 1 ? tomorrowTimeSlots : laterTimeSlots

  useEffect(() => {
    if (
      !requiresAddress ||
      !selectedAddress ||
      addressMutation.isPending ||
      initialAddressAppliedRef.current === selectedAddress.id
    ) {
      return
    }

    initialAddressAppliedRef.current = selectedAddress.id
    addressMutation.mutate(selectedAddress)
  }, [addressMutation.isPending, addressMutation.mutate, requiresAddress, selectedAddress])

  const completeMutation = useMutation({
    mutationFn: async () => {
      if (!cart || !selectedDeliveryMethod) throw new Error('Выберите способ доставки')
      if (isPickup && !selectedPickupPoint) throw new Error('Выберите пункт выдачи')
      if (!isPickup && (!selectedDeliveryDate || !selectedTimeSlot)) throw new Error('Выберите дату и время доставки')
      if (requiresAddress && !selectedAddress) throw new Error('Выберите адрес доставки')
      throw new Error('Оформление заказа станет доступно после подключения доставки к Medusa.')
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
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <Button asChild variant="ghost" size="sm" className="-ml-2">
            <Link href="/">
              <ChevronLeft /> Продолжить покупки
            </Link>
          </Button>
          <span className="text-apple-ink-muted-48 hidden items-center gap-1.5 text-xs font-medium sm:flex">
            <LockKeyhole className="size-3.5" /> Защищённое оформление
          </span>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-5 py-7 sm:py-10 lg:px-8">
        <div className="mb-7">
          <p className="text-apple-primary text-xs font-semibold tracking-[0.08em] uppercase">Оформление заказа</p>
          <h1 className="text-apple-ink font-heading mt-1 text-3xl font-bold tracking-[-0.6px]">Почти готово</h1>
          <p className="text-apple-ink-muted-48 mt-1 text-sm">Проверьте доставку и выберите удобный способ оплаты.</p>
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="flex flex-col gap-4">
            <Card className="order-1">
              <CardHeader className="border-apple-divider-soft border-b">
                <SectionTitle number="1" icon={UserRoundCheck}>
                  Вход в аккаунт
                </SectionTitle>
              </CardHeader>
              <CardContent className="pt-5">
                {isAuthenticated ? (
                  <div className="border-apple-primary bg-apple-primary/5 rounded-apple-md flex items-center gap-3 border p-4">
                    <span className="bg-apple-primary flex size-8 shrink-0 items-center justify-center rounded-full">
                      <Check className="size-4 text-white" />
                    </span>
                    <span>
                      <span className="text-apple-ink block text-sm font-semibold">Вы вошли в аккаунт</span>
                      <span className="text-apple-ink-muted-48 block text-xs">
                        {customer?.phone_number ?? 'Данные профиля защищены'}
                      </span>
                    </span>
                  </div>
                ) : (
                  <div className="bg-apple-canvas-parchment rounded-apple-md p-5">
                    <p className="text-apple-ink text-sm font-semibold">Войдите, чтобы продолжить оформление</p>
                    <p className="text-apple-ink-muted-48 mt-1 text-[13px]">
                      После входа мы покажем сохранённые адреса и варианты доставки.
                    </p>
                    <Button size="sm" className="mt-4" onClick={() => setAuthDialogOpen(true)}>
                      <LogIn /> Войти по номеру
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {isAuthenticated && (
              <>
                <Card className="order-2">
                  <CardHeader className="border-apple-divider-soft border-b">
                    <SectionTitle number="2" icon={Truck}>
                      Способ доставки
                    </SectionTitle>
                  </CardHeader>
                  <CardContent className="pt-5">
                    <div className="space-y-2.5">
                      {deliveryMethods.map((method) => (
                        <button
                          key={method.id}
                          type="button"
                          onClick={() => {
                            setSelectedDeliveryMethod(method.id)
                            setSelectedPickupPoint(null)
                            setSelectedDeliveryDate(null)
                            setSelectedTimeSlot(null)
                          }}
                          className={`rounded-apple-md flex w-full items-center gap-3 border p-4 text-left transition-colors ${selectedDeliveryMethod === method.id ? 'border-apple-primary bg-apple-primary/5 ring-apple-primary/20 ring-1' : 'border-apple-hairline hover:border-apple-ink-muted-48'}`}
                        >
                          <span
                            className={`flex size-4 shrink-0 items-center justify-center rounded-full border ${selectedDeliveryMethod === method.id ? 'border-apple-primary bg-apple-primary' : 'border-apple-ink-muted-48'}`}
                          >
                            {selectedDeliveryMethod === method.id && <Check className="size-3 text-white" />}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="text-apple-ink block text-sm font-semibold">{method.title}</span>
                            <span className="text-apple-ink-muted-48 block text-xs">{method.description}</span>
                          </span>
                          {method.id === 'courier' && (
                            <span className="text-apple-ink text-sm font-semibold">10 TMT</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {isPickup && (
                  <Card className="order-3">
                    <CardHeader className="border-apple-divider-soft border-b">
                      <SectionTitle number="3" icon={MapPin}>
                        Пункт выдачи
                      </SectionTitle>
                    </CardHeader>
                    <CardContent className="pt-5">
                      <div className="bg-apple-canvas-parchment rounded-apple-md mb-4 p-4">
                        <p className="text-apple-ink text-sm font-semibold">Как работает самовывоз</p>
                        <p className="text-apple-ink-muted-48 mt-1 text-[13px] leading-relaxed">
                          Выберите удобный пункт, дождитесь сообщения о готовности и заберите заказ, оплатив его
                          наличными на месте.
                        </p>
                      </div>
                      <p className="text-apple-ink mb-3 text-sm font-semibold">Выберите пункт</p>
                      <div className="space-y-2.5">
                        {pickupPoints.map((point) => {
                          const isSelected = selectedPickupPoint === point.id
                          return (
                            <button
                              key={point.id}
                              type="button"
                              onClick={() => setSelectedPickupPoint(point.id)}
                              className={`rounded-apple-md flex w-full items-center gap-3 border p-4 text-left transition-colors ${isSelected ? 'border-apple-primary bg-apple-primary/5 ring-apple-primary/20 ring-1' : 'border-apple-hairline hover:border-apple-ink-muted-48'}`}
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
                            </button>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {requiresAddress && (
                  <Card className="order-3">
                    <CardHeader className="border-apple-divider-soft border-b">
                      <SectionTitle number="3" icon={MapPin}>
                        Адрес доставки
                      </SectionTitle>
                    </CardHeader>
                    <CardContent className="pt-5">
                      {addresses.length > 0 ? (
                        <div className="grid gap-3 sm:grid-cols-2">
                          {addresses.map((address) => {
                            const isSelected = selectedAddressId === address.id
                            return (
                              <button
                                key={address.id}
                                type="button"
                                onClick={() => addressMutation.mutate(address)}
                                disabled={addressMutation.isPending}
                                className={`rounded-apple-md focus-visible:ring-apple-primary-focus relative min-h-32 border p-4 text-left transition-colors focus-visible:ring-2 disabled:opacity-60 ${isSelected ? 'border-apple-primary bg-apple-primary/5 ring-apple-primary/20 ring-1' : 'border-apple-hairline hover:border-apple-ink-muted-48'}`}
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
                                {address.phone && (
                                  <p className="text-apple-ink-muted-48 mt-1 text-xs">{address.phone}</p>
                                )}
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
                        onClick={() => setAddressDialogOpen(true)}
                      >
                        <Plus /> Новый адрес
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {requiresAddress && (
                  <Card className="order-4">
                    <CardHeader className="border-apple-divider-soft border-b">
                      <SectionTitle number="4" icon={CalendarDays}>
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
                            className={`rounded-apple-md border p-3 text-left transition-colors ${selectedDeliveryDate === date.id ? 'border-apple-primary bg-apple-primary/5 ring-apple-primary/20 ring-1' : 'border-apple-hairline hover:border-apple-ink-muted-48'}`}
                          >
                            <span className="text-apple-ink block text-sm font-semibold">{date.label}</span>
                            <span className="text-apple-ink-muted-48 mt-0.5 block text-xs capitalize">{date.date}</span>
                          </button>
                        ))}
                      </div>
                      {selectedDeliveryDate && (
                        <>
                          <p className="text-apple-ink mt-5 mb-3 text-sm font-semibold">
                            <Clock3 className="text-apple-primary mr-1.5 inline size-4" /> Удобное время
                          </p>
                          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                            {timeSlots.map((slot) => (
                              <button
                                key={slot}
                                type="button"
                                onClick={() => setSelectedTimeSlot(slot)}
                                className={`rounded-apple-sm border px-3 py-2.5 text-sm font-medium transition-colors ${selectedTimeSlot === slot ? 'border-apple-primary bg-apple-primary text-white' : 'border-apple-hairline text-apple-ink hover:border-apple-ink-muted-48'}`}
                              >
                                {slot}
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                )}

                {(isPickup ? selectedPickupPoint : selectedTimeSlot) && (
                  <Card className="order-5">
                    <CardHeader className="border-apple-divider-soft border-b">
                      <SectionTitle number={requiresAddress ? '5' : '4'} icon={CreditCard}>
                        Оплата
                      </SectionTitle>
                    </CardHeader>
                    <CardContent className="pt-5">
                      <div className="border-apple-primary bg-apple-primary/5 rounded-apple-md flex items-center gap-3 border p-4">
                        <span className="bg-apple-primary flex size-4 shrink-0 items-center justify-center rounded-full">
                          <Check className="size-3 text-white" />
                        </span>
                        <span>
                          <span className="text-apple-ink block text-sm font-semibold">Оплата наличными</span>
                          <span className="text-apple-ink-muted-48 block text-xs">
                            {isPickup ? 'Оплатите заказ в пункте выдачи.' : 'Оплатите заказ курьеру при получении.'}
                          </span>
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>

          <aside className="lg:sticky lg:top-5">
            <Card variant="parchment">
              <CardHeader className="border-apple-divider-soft border-b">
                <CardTitle>Ваш заказ</CardTitle>
              </CardHeader>
              <CardContent className="pt-5">
                <div className="space-y-4">
                  {cart.items?.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="bg-apple-surface-pearl rounded-apple-sm size-12 shrink-0 overflow-hidden">
                        {item.thumbnail && <img src={item.thumbnail} alt="" className="size-full object-cover" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-apple-ink line-clamp-1 text-[13px] font-semibold">{item.title}</p>
                        <p className="text-apple-ink-muted-48 mt-0.5 text-xs">{item.quantity} шт.</p>
                      </div>
                      <span className="text-apple-ink text-[13px] font-semibold">
                        {formatPrice((item.unit_price ?? 0) * (item.quantity ?? 0), currencyCode)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="border-apple-divider-soft mt-5 space-y-2.5 border-t pt-4 text-[13px]">
                  <div className="text-apple-ink-muted-80 flex justify-between">
                    <span>Товары</span>
                    <span>{formatPrice(subtotal, currencyCode)}</span>
                  </div>
                  <div className="text-apple-ink-muted-80 flex justify-between">
                    <span>Доставка</span>
                    <span>{!selectedDeliveryMethod ? 'Выберите способ' : deliveryFee ? '10 TMT' : 'Бесплатно'}</span>
                  </div>
                  <div className="text-apple-ink border-apple-divider-soft mt-3 flex justify-between border-t pt-3 text-base font-bold">
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
                    `Оформить заказ · ${formatPrice(total, currencyCode)}`
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
                <p className="text-apple-ink-muted-48 mt-4 flex items-start gap-2 text-[11px] leading-relaxed">
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
