"use client"

import * as React from "react"
import { useState } from "react"
import Link from "next/link"
import {
  MapPin,
  ChevronDown,
  Search,
  User,
  Heart,
  ShoppingBag,
  Check,
  Grid2x2,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet"

// Cities list in Uzbekistan
const CITIES = [
  "Туркменабад",
]

export function Header() {
  const [selectedCity, setSelectedCity] = useState(CITIES[0])
  const [selectedLang, setSelectedLang] = useState("ru") // 'ru' or 'uz'
  const [cityOpen, setCityOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  // Authentication Dialog states
  const [loginOpen, setLoginOpen] = useState(false)
  const [phone, setPhone] = useState("")
  const [smsSent, setSmsSent] = useState(false)
  const [smsCode, setSmsCode] = useState("")

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
      setPhone("")
      setSmsCode("")
      setSmsSent(false)
      alert("Вход выполнен успешно!")
    }
  }

  return (
    <header className="w-full bg-apple-canvas border-b border-apple-divider-soft sticky top-0 z-40 select-none">
      {/* ROW 1: TOP BAR */}
      <div className="w-full bg-apple-canvas-parchment text-[13px] text-apple-ink-muted-80 py-1.5 px-4  ">
        <div className="max-w-[1240px] mx-auto flex items-center justify-between">
          {/* Top Bar Left: Location & Pick-up points */}
          <div className="flex items-center gap-6">
            {/* City Selector */}
            <Popover open={cityOpen} onOpenChange={setCityOpen}>
              <PopoverTrigger asChild>
                <button className="flex items-center gap-1 hover:text-apple-primary cursor-pointer transition-colors outline-hidden">
                  <MapPin className="size-4 text-apple-ink-muted-48" />
                  <span className="text-apple-ink-muted-48">Город:</span>
                  <span className="font-medium text-apple-ink hover:text-apple-primary transition-colors underline decoration-dotted underline-offset-4 decoration-apple-ink-muted-48">
                    {selectedCity}
                  </span>
                  <ChevronDown className="size-3.5 text-apple-ink-muted-48" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-1 bg-apple-canvas border border-apple-hairline shadow-xs rounded-apple-sm" align="start">
                <div className="py-1 text-[13px] font-medium text-apple-ink-muted-48 px-3">
                  Выберите город
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {CITIES.map((city) => (
                    <button
                      key={city}
                      onClick={() => {
                        setSelectedCity(city)
                        setCityOpen(false)
                      }}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2 text-left rounded-apple-sm transition-colors hover:bg-apple-canvas-parchment",
                        selectedCity === city
                          ? "text-apple-primary font-semibold bg-apple-canvas-parchment"
                          : "text-apple-ink-muted-80"
                      )}
                    >
                      <span>{city}</span>
                      {selectedCity === city && (
                        <Check className="size-4 text-apple-primary" />
                      )}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            {/* Pick-up points */}
            <Link
              href="/pickup-points"
              className="text-apple-ink-muted-80 hover:text-apple-primary transition-colors font-medium"
            >
              Пункты выдачи
            </Link>
          </div>

          {/* Top Bar Right: Vendor Links & Lang Selector */}
          <div className="flex items-center gap-6">
            <Link
              href="/become-vendor"
              className="text-apple-primary font-semibold hover:text-apple-primary-focus transition-colors"
            >
              Стать продавцом
            </Link>
            <Link
              href="/open-pickup"
              className="text-apple-primary font-semibold hover:text-apple-primary-focus transition-colors"
            >
              Открыть пункт выдачи
            </Link>
            <Link href="/faq" className="text-apple-ink-muted-80 hover:text-apple-primary transition-colors">
              Вопрос-ответ
            </Link>
            <Link href="/orders" className="text-apple-ink-muted-80 hover:text-apple-primary transition-colors font-medium">
              Мои заказы
            </Link>

            {/* Language Selector */}
            <Popover open={langOpen} onOpenChange={setLangOpen}>
              <PopoverTrigger asChild>
                <button className="flex items-center gap-1.5 text-apple-ink-muted-80 hover:text-apple-primary cursor-pointer transition-colors outline-hidden">
                  <span className="font-medium">
                    {selectedLang === "ru" ? "Русский" : "Turkmen"}
                  </span>
                  <ChevronDown className="size-3.5 text-apple-ink-muted-48" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-36 p-1 bg-apple-canvas border border-apple-hairline shadow-xs rounded-apple-sm" align="end">
                <button
                  onClick={() => {
                    setSelectedLang("ru")
                    setLangOpen(false)
                  }}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-2 text-[13px] text-left rounded-apple-sm transition-colors hover:bg-apple-canvas-parchment",
                    selectedLang === "ru" ? "font-semibold text-apple-ink bg-apple-canvas-parchment" : "text-apple-ink-muted-80"
                  )}
                >
                  <span>Русский</span>
                  {selectedLang === "ru" && (
                    <Check className="size-3.5 text-apple-primary ml-auto" />
                  )}
                </button>
                <button
                  onClick={() => {
                    setSelectedLang("uz")
                    setLangOpen(false)
                  }}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-2 text-[13px] text-left rounded-apple-sm transition-colors hover:bg-apple-canvas-parchment",
                    selectedLang === "uz" ? "font-semibold text-apple-ink bg-apple-canvas-parchment" : "text-apple-ink-muted-80"
                  )}
                >
                  <span>Turkmen</span>
                  {selectedLang === "tk" && (
                    <Check className="size-3.5 text-apple-primary ml-auto" />
                  )}
                </button>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      {/* ROW 2: MAIN HEADER */}
      <div className="w-full py-4 px-4 bg-apple-canvas">
        <div className="custom-container mx-auto flex items-center gap-6">
          {/* Logo Brand */}
          <Link href="/" className="flex items-center gap-2 select-none group shrink-0">
            logo
          </Link>

          {/* Catalog Button */}
          <Button
            variant="secondary"
            size="sm"
            className="px-4   font-semibold cursor-pointer shrink-0"
          >
            <Grid2x2 className="" />
            <span>Каталог</span>
          </Button>

          {/* Wide Search Bar */}
          <div className="flex-1 max-w-2xl">
            <div className="flex items-center h-11 border border-apple-hairline rounded-apple-pill overflow-hidden focus-within:border-apple-primary-focus focus-within:ring-1 focus-within:ring-apple-primary-focus transition-all bg-apple-canvas">
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 h-full px-4 border-none shadow-none text-[14px]  outline-hidden focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-apple-ink-muted-48 text-apple-ink"
                placeholder="Искать товары и категории"
              />
              <button className="flex items-center justify-center w-18 h-full bg-apple-canvas-parchment border-l border-apple-hairline hover:bg-apple-surface-pearl active:scale-95 cursor-pointer transition-all duration-150 text-apple-ink-muted-80 shrink-0">
                <Search className="size-5" />
              </button>
            </div>
          </div>

          {/* Right Controls: Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Login Dialog */}
            <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="px-4   font-semibold gap-2.5 cursor-pointer"
                >
                  <User />
                  <span>Войти</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-[360px] p-6 bg-apple-canvas rounded-apple-lg border border-apple-hairline shadow-lg">
                <DialogHeader className="mb-4">
                  <DialogTitle className="text-xl font-bold font-heading text-apple-ink">
                    {smsSent ? "Подтверждение входа" : "Введите номер телефона"}
                  </DialogTitle>
                  <div className="text-[13px] text-apple-ink-muted-48 mt-1  ">
                    {smsSent
                      ? `Мы отправили код на номер +993 ${phone}`
                      : "Отправим СМС-код для подтверждения входа"}
                  </div>
                </DialogHeader>

                {!smsSent ? (
                  <form onSubmit={handleSendCode} className="space-y-4">
                    <div className="flex items-center border border-apple-hairline rounded-apple-sm overflow-hidden px-3 bg-apple-canvas focus-within:border-apple-primary-focus focus-within:ring-1 focus-within:ring-apple-primary-focus transition-all">
                      <span className="text-[14px] font-semibold text-apple-ink-muted-48   pr-2 border-r border-apple-hairline mr-2">
                        +993
                      </span>
                      <Input
                        type="tel"
                        value={phone}
                        onChange={(e) =>
                          setPhone(e.target.value.replace(/\D/g, "").slice(0, 9))
                        }
                        className="border-none shadow-none text-[15px] p-0 h-10 w-full focus-visible:ring-0 focus-visible:ring-offset-0   bg-transparent text-apple-ink placeholder:text-apple-ink-muted-48"
                        placeholder="90 123 45 67"
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={phone.length < 9}
                      size="sm"
                      className="w-full font-semibold cursor-pointer"
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
                          onChange={(value) => setSmsCode(value.replace(/\D/g, ""))}
                        >
                          <InputOTPGroup className="gap-3">
                            <InputOTPSlot
                              index={0}
                              className="w-12 h-12 text-[17px] font-semibold border border-apple-hairline rounded-apple-sm bg-apple-canvas text-apple-ink first:rounded-l-apple-sm last:rounded-r-apple-sm first:border-l-apple-hairline"
                            />
                            <InputOTPSlot
                              index={1}
                              className="w-12 h-12 text-[17px] font-semibold border border-apple-hairline rounded-apple-sm bg-apple-canvas text-apple-ink first:rounded-l-apple-sm last:rounded-r-apple-sm first:border-l-apple-hairline"
                            />
                            <InputOTPSlot
                              index={2}
                              className="w-12 h-12 text-[17px] font-semibold border border-apple-hairline rounded-apple-sm bg-apple-canvas text-apple-ink first:rounded-l-apple-sm last:rounded-r-apple-sm first:border-l-apple-hairline"
                            />
                            <InputOTPSlot
                              index={3}
                              className="w-12 h-12 text-[17px] font-semibold border border-apple-hairline rounded-apple-sm bg-apple-canvas text-apple-ink first:rounded-l-apple-sm last:rounded-r-apple-sm first:border-l-apple-hairline"
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
                        className="w-1/2 font-semibold text-apple-ink-muted-80 cursor-pointer"
                      >
                        Назад
                      </Button>
                      <Button
                        type="submit"
                        disabled={smsCode.length < 4}
                        className="w-1/2 font-semibold cursor-pointer"
                      >
                        Войти
                      </Button>
                    </div>
                  </form>
                )}

                <div className="text-[12px] text-apple-ink-muted-48 text-center mt-4 leading-relaxed  ">
                  Авторизуясь, вы согласяетесь с{" "}
                  <Link href="/terms" className="text-apple-primary hover:underline">
                    Пользовательским соглашением
                  </Link>{" "}
                  и{" "}
                  <Link href="/privacy" className="text-apple-primary hover:underline">
                    Политикой конфиденциальности
                  </Link>
                </div>
              </DialogContent>
            </Dialog>

            {/* Favorites Button */}
            <Button
              variant="ghost"
              size="sm"
              className="px-3   font-medium cursor-pointer"
              asChild
            >
              <Link href="/favorites">
                <Heart className="text-apple-ink-muted-80" />
                <span>Избранное</span>
              </Link>
            </Button>

            {/* Cart Sheet Drawer */}
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="px-3 font-medium cursor-pointer"
                >
                  <div className="relative">
                    <ShoppingBag className="text-apple-ink-muted-80" />
                    <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center min-w-4 h-4 px-1 text-[9px] font-bold text-white bg-apple-primary rounded-apple-full">
                      0
                    </span>
                  </div>
                  <span>Корзина</span>
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-md flex flex-col h-full bg-apple-canvas border-l border-apple-hairline p-0">
                <SheetHeader className="p-6 border-b border-apple-divider-soft">
                  <SheetTitle className="text-xl font-heading font-bold text-apple-ink">
                    Корзина
                  </SheetTitle>
                  <SheetDescription className="text-apple-ink-muted-48 text-[13px]">
                    У вас пока нет товаров в корзине
                  </SheetDescription>
                </SheetHeader>

                {/* Empty State */}
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                  <div className="size-16 rounded-apple-full bg-apple-canvas-parchment flex items-center justify-center mb-4">
                    <ShoppingBag className="size-8 text-apple-ink-muted-48" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-base font-semibold text-apple-ink font-heading">
                    В вашей корзине пусто
                  </h3>
                  <p className="text-[13px] text-apple-ink-muted-48 mt-1 max-w-[240px]">
                    Перейдите в каталог и добавьте интересующие вас товары
                  </p>
                </div>

                {/* Footer Checkout Summary */}
                <SheetFooter className="p-6 border-t border-apple-divider-soft bg-apple-canvas-parchment mt-auto">
                  <div className="flex items-center justify-between w-full mb-4">
                    <span className="text-[14px] text-apple-ink font-medium">Итого:</span>
                    <span className="text-[16px] text-apple-ink font-bold font-sans">0 тмт</span>
                  </div>
                  <Button
                    variant="default"
                    className="w-full font-semibold cursor-pointer"
                    disabled
                  >
                    Перейти к оформлению
                  </Button>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
