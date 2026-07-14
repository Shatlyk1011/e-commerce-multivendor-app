'use client'

import * as React from 'react'
import { useState } from 'react'

import dynamic from 'next/dynamic'
import Link from 'next/link'

import { Check, ChevronDown, Grid2x2, Heart, MapPin, Search, User } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Spinner } from '@/components/ui/spinner'
import { CartSheet } from '@/features/cart/components/CartSheet'
import { cn } from '@/lib/utils'
import { useUIStore } from '@/store/use-ui-store'

const AuthDialog = dynamic(() => import('./AuthDialog').then((mod) => mod.AuthDialog), {
  ssr: false,
  loading: () => <Spinner fullPage size="lg" />,
})

// Cities list in Uzbekistan
const CITIES = ['Туркменабад', 'Ашхабад']

export function Header() {
  const storeCity = useUIStore((state) => state.selectedCity)
  const setSelectedCity = useUIStore((state) => state.setSelectedCity)

  const selectedCity = storeCity || CITIES[0]
  const [selectedLang, setSelectedLang] = useState('ru') // 'ru' or 'tk'
  const [searchQuery, setSearchQuery] = useState('')

  // Authentication Dialog states
  const [loginOpen, setLoginOpen] = useState(false)

  return (
    <header className="bg-apple-canvas border-apple-divider-soft sticky top-0 z-40 w-full border-b select-none">
      {/* ROW 1: TOP BAR */}
      <div className="bg-apple-canvas-parchment text-apple-ink-muted-80 w-full px-4 py-1.5 text-[13px]">
        <div className="mx-auto flex max-w-[1240px] items-center justify-between">
          {/* Top Bar Left: Location & Pick-up points */}
          <div className="flex items-center gap-6">
            {/* City Selector */}
            <Popover>
              <PopoverTrigger asChild>
                <button className="hover:text-apple-primary flex cursor-pointer items-center gap-1 outline-hidden transition-colors">
                  <MapPin className="text-apple-ink-muted-48 size-4" />
                  <span className="text-apple-ink-muted-48">Город:</span>
                  <span className="text-apple-ink hover:text-apple-primary decoration-apple-ink-muted-48 font-medium underline decoration-dotted underline-offset-4 transition-colors">
                    {selectedCity}
                  </span>
                  <ChevronDown className="text-apple-ink-muted-48 size-3.5" />
                </button>
              </PopoverTrigger>
              <PopoverContent
                className="bg-apple-canvas border-apple-hairline rounded-apple-sm w-48 border p-1 shadow-xs"
                align="start"
              >
                <div className="text-apple-ink-muted-48 px-3 py-1 text-[13px] font-medium">Выберите город</div>
                <div className="max-h-60 overflow-y-auto">
                  {CITIES.map((city) => (
                    <button
                      key={city}
                      disabled={city === 'Ашхабад'}
                      onClick={() => setSelectedCity(city)}
                      className={cn(
                        'rounded-apple-sm hover:bg-apple-canvas-parchment flex w-full items-center justify-between px-3 py-2 text-left transition-colors disabled:opacity-50',
                        selectedCity === city
                          ? 'text-apple-primary bg-apple-canvas-parchment font-semibold'
                          : 'text-apple-ink-muted-80',
                      )}
                    >
                      <span>{city}</span>
                      {selectedCity === city && <Check className="text-apple-primary size-4" />}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            {/* Pick-up points */}
            <Link
              href="/pickup-points"
              className="text-apple-ink-muted-80 hover:text-apple-primary font-medium transition-colors"
            >
              Пункты выдачи
            </Link>
          </div>

          {/* Top Bar Right: Vendor Links & Lang Selector */}
          <div className="flex items-center gap-6">
            <Link
              href="/become-vendor"
              className="text-apple-primary hover:text-apple-primary-focus font-semibold transition-colors"
            >
              Стать продавцом
            </Link>
            <Link
              href="/open-pickup"
              className="text-apple-primary hover:text-apple-primary-focus font-semibold transition-colors"
            >
              Открыть пункт выдачи
            </Link>
            <Link href="/faq" className="text-apple-ink-muted-80 hover:text-apple-primary transition-colors">
              Вопрос-ответ
            </Link>
            <Link
              href="/orders"
              className="text-apple-ink-muted-80 hover:text-apple-primary font-medium transition-colors"
            >
              Мои заказы
            </Link>

            {/* Language Selector */}
            <Popover>
              <PopoverTrigger asChild>
                <button className="text-apple-ink-muted-80 hover:text-apple-primary flex cursor-pointer items-center gap-1.5 outline-hidden transition-colors">
                  <span className="font-medium">{selectedLang === 'ru' ? 'Русский' : 'Turkmen'}</span>
                  <ChevronDown className="text-apple-ink-muted-48 size-3.5" />
                </button>
              </PopoverTrigger>
              <PopoverContent
                className="bg-apple-canvas border-apple-hairline rounded-apple-sm w-36 border p-1 shadow-xs"
                align="end"
              >
                <button
                  onClick={() => setSelectedLang('ru')}
                  className={cn(
                    'rounded-apple-sm hover:bg-apple-canvas-parchment flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] transition-colors',
                    selectedLang === 'ru'
                      ? 'text-apple-ink bg-apple-canvas-parchment font-semibold'
                      : 'text-apple-ink-muted-80',
                  )}
                >
                  <span>Русский</span>
                  {selectedLang === 'ru' && <Check className="text-apple-primary ml-auto size-3.5" />}
                </button>
                <button
                  onClick={() => setSelectedLang('tk')}
                  className={cn(
                    'rounded-apple-sm hover:bg-apple-canvas-parchment flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] transition-colors',
                    selectedLang === 'uz'
                      ? 'text-apple-ink bg-apple-canvas-parchment font-semibold'
                      : 'text-apple-ink-muted-80',
                  )}
                >
                  <span>Turkmen</span>
                  {selectedLang === 'tk' && <Check className="text-apple-primary ml-auto size-3.5" />}
                </button>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      {/* ROW 2: MAIN HEADER */}
      <div className="bg-apple-canvas w-full px-4 py-4">
        <div className="custom-container mx-auto flex items-center gap-6">
          {/* Logo Brand */}
          <Link href="/" className="group flex shrink-0 items-center gap-2 select-none">
            logo
          </Link>

          {/* Catalog Button */}
          <Button variant="secondary" size="sm" className="shrink-0 cursor-pointer px-4 font-semibold">
            <Grid2x2 className="" />
            <span>Каталог</span>
          </Button>

          {/* Wide Search Bar */}
          <div className="max-w-2xl flex-1">
            <div className="border-apple-hairline rounded-apple-pill focus-within:border-apple-primary-focus focus-within:ring-apple-primary-focus bg-apple-canvas flex h-11 items-center overflow-hidden border transition-all focus-within:ring-1">
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="placeholder:text-apple-ink-muted-48 text-apple-ink h-full flex-1 border-none px-4 text-[14px] shadow-none outline-hidden focus-visible:ring-0 focus-visible:ring-offset-0"
                placeholder="Искать товары и категории"
              />
              <button className="bg-apple-canvas-parchment border-apple-hairline hover:bg-apple-surface-pearl text-apple-ink-muted-80 flex h-full w-18 shrink-0 cursor-pointer items-center justify-center border-l transition-all duration-150 active:scale-95">
                <Search className="size-5" />
              </button>
            </div>
          </div>

          {/* Right Controls: Actions */}
          <div className="flex shrink-0 items-center gap-2">
            {/* Login Dialog */}
            <Button
              variant="ghost"
              size="sm"
              className="cursor-pointer gap-2.5 px-4 font-semibold"
              onClick={() => setLoginOpen(true)}
            >
              <User />
              <span>Войти</span>
            </Button>
            {loginOpen && <AuthDialog open={loginOpen} onOpenChange={setLoginOpen} />}

            {/* Favorites Button */}
            <Button variant="ghost" size="sm" className="cursor-pointer px-3 font-medium" asChild>
              <Link href="/favorites">
                <Heart className="text-apple-ink-muted-80" />
                <span>Избранное</span>
              </Link>
            </Button>

            {/* Cart Sheet Drawer */}
            <CartSheet />
          </div>
        </div>
      </div>
    </header>
  )
}
