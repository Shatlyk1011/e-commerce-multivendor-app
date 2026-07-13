'use client'

import * as React from 'react'
import { useState } from 'react'

import Link from 'next/link'

import { Check, ChevronDown, Grid2x2, Heart, MapPin, Search, User } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CartSheet } from '@/features/cart/components/CartSheet'
import { cn } from '@/lib/utils'

// Cities list in Uzbekistan
const CITIES = ['Туркменабад', 'Ашхабад']

export function Header() {
  const [selectedCity, setSelectedCity] = useState(CITIES[0])
  const [selectedLang, setSelectedLang] = useState('ru') // 'ru' or 'uz'
  const [cityOpen, setCityOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Authentication Dialog states
  const [loginOpen, setLoginOpen] = useState(false)
  const [phone, setPhone] = useState('')
  const [smsSent, setSmsSent] = useState(false)
  const [smsCode, setSmsCode] = useState('')

  const handleSendCode = (e: React.FormEvent) => {
    e.preventDefault()
    if (phone.length >= 9) {
      setSmsSent(true)
    }
  }

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault()
    if (smsCode.length === 4) {
      // Simulate successful login
      setLoginOpen(false)
      setPhone('')
      setSmsCode('')
      setSmsSent(false)
      alert('Вход выполнен успешно!')
    }
  }

  return (
    <header className="bg-apple-canvas border-apple-divider-soft sticky top-0 z-40 w-full border-b select-none">
      {/* ROW 1: TOP BAR */}
      <div className="bg-apple-canvas-parchment text-apple-ink-muted-80 w-full px-4 py-1.5 text-[13px]">
        <div className="mx-auto flex max-w-[1240px] items-center justify-between">
          {/* Top Bar Left: Location & Pick-up points */}
          <div className="flex items-center gap-6">
            {/* City Selector */}
            <Popover open={cityOpen} onOpenChange={setCityOpen}>
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
                      onClick={() => {
                        setSelectedCity(city)
                        setCityOpen(false)
                      }}
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
            <Popover open={langOpen} onOpenChange={setLangOpen}>
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
                  onClick={() => {
                    setSelectedLang('ru')
                    setLangOpen(false)
                  }}
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
                  onClick={() => {
                    setSelectedLang('uz')
                    setLangOpen(false)
                  }}
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
            <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="cursor-pointer gap-2.5 px-4 font-semibold">
                  <User />
                  <span>Войти</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-apple-canvas rounded-apple-lg border-apple-hairline max-w-[360px] border p-6 shadow-lg">
                <DialogHeader className="mb-4">
                  <DialogTitle className="font-heading text-apple-ink text-xl font-bold">
                    {smsSent ? 'Подтверждение входа' : 'Введите номер телефона'}
                  </DialogTitle>
                  <div className="text-apple-ink-muted-48 mt-1 text-[13px]">
                    {smsSent ? `Мы отправили код на номер +993 ${phone}` : 'Отправим СМС-код для подтверждения входа'}
                  </div>
                </DialogHeader>

                {!smsSent ? (
                  <form onSubmit={handleSendCode} className="space-y-4">
                    <div className="border-apple-hairline rounded-apple-sm bg-apple-canvas focus-within:border-apple-primary-focus focus-within:ring-apple-primary-focus flex items-center overflow-hidden border px-3 transition-all focus-within:ring-1">
                      <span className="text-apple-ink-muted-48 border-apple-hairline mr-2 border-r pr-2 text-[14px] font-semibold">
                        +993
                      </span>
                      <Input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 9))}
                        className="text-apple-ink placeholder:text-apple-ink-muted-48 h-10 w-full border-none bg-transparent p-0 text-[15px] shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                        placeholder="61 415926"
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={phone.length < 9}
                      size="sm"
                      className="w-full cursor-pointer font-semibold"
                    >
                      Получить код
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyCode} className="space-y-4">
                    <div className="flex justify-center py-2">
                      <InputOTP
                        maxLength={4}
                        value={smsCode}
                        onChange={(value) => setSmsCode(value.replace(/\D/g, ''))}
                      >
                        <InputOTPGroup className="gap-3">
                          <InputOTPSlot
                            index={0}
                            className="border-apple-hairline rounded-apple-sm bg-apple-canvas text-apple-ink first:rounded-l-apple-sm last:rounded-r-apple-sm first:border-l-apple-hairline h-12 w-12 border text-[17px] font-semibold"
                          />
                          <InputOTPSlot
                            index={1}
                            className="border-apple-hairline rounded-apple-sm bg-apple-canvas text-apple-ink first:rounded-l-apple-sm last:rounded-r-apple-sm first:border-l-apple-hairline h-12 w-12 border text-[17px] font-semibold"
                          />
                          <InputOTPSlot
                            index={2}
                            className="border-apple-hairline rounded-apple-sm bg-apple-canvas text-apple-ink first:rounded-l-apple-sm last:rounded-r-apple-sm first:border-l-apple-hairline h-12 w-12 border text-[17px] font-semibold"
                          />
                          <InputOTPSlot
                            index={3}
                            className="border-apple-hairline rounded-apple-sm bg-apple-canvas text-apple-ink first:rounded-l-apple-sm last:rounded-r-apple-sm first:border-l-apple-hairline h-12 w-12 border text-[17px] font-semibold"
                          />
                        </InputOTPGroup>
                      </InputOTP>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size={'md'}
                        onClick={() => setSmsSent(false)}
                        className="text-apple-ink-muted-80 w-1/2 cursor-pointer font-semibold"
                      >
                        Назад
                      </Button>
                      <Button
                        type="submit"
                        disabled={smsCode.length < 4}
                        className="w-1/2 cursor-pointer font-semibold"
                      >
                        Войти
                      </Button>
                    </div>
                  </form>
                )}

                <div className="text-apple-ink-muted-48 mt-4 text-center text-[12px] leading-relaxed">
                  Авторизуясь, вы согласяетесь с{' '}
                  <Link href="/terms" className="text-apple-primary hover:underline">
                    Пользовательским соглашением
                  </Link>{' '}
                  и{' '}
                  <Link href="/privacy" className="text-apple-primary hover:underline">
                    Политикой конфиденциальности
                  </Link>
                </div>
              </DialogContent>
            </Dialog>

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
