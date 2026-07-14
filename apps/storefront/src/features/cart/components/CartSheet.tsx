'use client'

import { ShoppingBag } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'

import { useCart } from '../api/queries'
import { formatPrice, getCartItemCount, getCartSubtotal } from '../utils'
import { CartItem } from './CartItem'

export function CartSheet() {
  const { data: cart } = useCart()
  const count = getCartItemCount(cart)

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="cursor-pointer px-3 font-medium">
          <div className="relative">
            <ShoppingBag className="text-apple-ink-muted-80" />
            <span className="bg-apple-primary rounded-apple-full absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center px-1 text-[9px] font-bold text-white">
              {count}
            </span>
          </div>
          <span>Корзина</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="bg-apple-canvas border-apple-hairline flex w-full flex-col gap-0 overflow-hidden border-l p-0 sm:max-w-md">
        <SheetHeader className="border-apple-divider-soft mb-4 shrink-0 border-b p-6">
          <SheetTitle className="font-heading text-apple-ink text-xl font-bold">Корзина</SheetTitle>
          <CartDescription />
        </SheetHeader>
        <CartBody />
        <CartFooter />
      </SheetContent>
    </Sheet>
  )
}

function CartDescription() {
  const { data: cart } = useCart()
  const count = getCartItemCount(cart)
  return (
    <SheetDescription className="text-apple-ink-muted-48 text-[13px]">
      {count ? `У вас ${count} ${count > 1 ? 'товаров' : 'товар'}` : 'У вас пока нет товаров в корзине'}
    </SheetDescription>
  )
}

function CartBody() {
  const { data: cart, isLoading } = useCart()
  const count = getCartItemCount(cart)

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <span className="text-apple-ink-muted-80 text-[13px]">Загрузка...</span>
      </div>
    )
  }

  if (!count) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
        <div className="rounded-apple-full bg-apple-canvas-parchment mb-4 flex size-16 items-center justify-center">
          <ShoppingBag className="text-apple-ink-muted-48 size-8" strokeWidth={1.5} />
        </div>
        <h3 className="text-apple-ink font-heading text-base font-semibold">В вашей корзине пусто</h3>
        <p className="text-apple-ink-muted-48 mt-1 max-w-[240px] text-[13px]">
          Перейдите в каталог и добавьте интересующие вас товары
        </p>
      </div>
    )
  }

  const items = cart!.items!

  return (
    <div className="flex-1 scrollbar-thin overflow-y-auto p-6">
      <ul className="flex flex-col gap-4">
        {items.map((item) => (
          <CartItem key={item.id} item={item} />
        ))}
      </ul>
    </div>
  )
}

function CartFooter() {
  const { data: cart } = useCart()
  const subtotal = getCartSubtotal(cart)
  const count = getCartItemCount(cart)
  return (
    <div className="border-apple-divider-soft bg-apple-canvas-parchment shrink-0 border-t p-6">
      <div className="mb-4 flex w-full items-center justify-between">
        <span className="text-apple-ink text-[14px] font-medium">Итого:</span>
        <span className="text-apple-ink font-sans text-[16px] font-bold">{formatPrice(subtotal)}</span>
      </div>
      <Button variant="default" className="w-full cursor-pointer font-semibold" disabled={!count}>
        Перейти к оформлению
      </Button>
    </div>
  )
}
