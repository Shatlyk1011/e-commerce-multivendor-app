'use client'

import { useEffect, useState } from 'react'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

import { Check, ChevronDown, Grid2x2, Heart, MapPin, Search, User, X } from 'lucide-react'
import { toast } from 'sonner'

import { useI18n } from '@/components/providers/I18nProvider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Spinner } from '@/components/ui/spinner'
import { useAuth } from '@/features/auth/components/AuthProvider'
import { CartSheet } from '@/features/cart/components/CartSheet'
import { cn } from '@/lib/utils'
import { useSearchStore } from '@/store/use-search-store'
import { useUIStore } from '@/store/use-ui-store'

import OnClickOutside from './OnClickOutside'

const AuthDialog = dynamic(() => import('./AuthDialog').then((mod) => mod.AuthDialog), {
  ssr: false,
  loading: () => <Spinner fullPage size="lg" />,
})

const CatalogMenu = dynamic(() => import('./CatalogMenu'), {
  ssr: false,
  loading: () => <Spinner fullPage size="lg" />,
})

const SearchOverlay = dynamic(() => import('./SearchOverlay'), {
  ssr: false,
  loading: () => (
    <div className="bg-apple-canvas rounded-apple-lg border-apple-hairline absolute top-full left-0 z-50 mt-2 flex h-[min(70dvh,400px)] w-full items-center justify-center overflow-hidden border shadow-xl lg:left-1/2 lg:h-[400px] lg:w-[720px] lg:-translate-x-1/2">
      <Spinner size="lg" />
    </div>
  ),
})

// Cities list in Uzbekistan
const CITIES = ['Туркменабад', 'Ашхабад']

export function Header() {
  const { locale: selectedLang, setLocale: setSelectedLang } = useI18n()
  const { customer, isAuthenticated, isLoading: isAuthLoading, logout } = useAuth()
  const storeCity = useUIStore((state) => state.selectedCity)
  const setSelectedCity = useUIStore((state) => state.setSelectedCity)

  const pathname = usePathname()

  const selectedCity = storeCity || CITIES[0]
  const [searchQuery, setSearchQuery] = useState('')
  const [languageOpen, setLanguageOpen] = useState(false)

  // Catalog Menu state
  const [catalogOpen, setCatalogOpen] = useState(false)

  // Authentication Dialog states
  const [loginOpen, setLoginOpen] = useState(false)

  // Search suggestions states and handlers
  const [searchFocused, setSearchFocused] = useState(false)
  const router = useRouter()
  const addHistory = useSearchStore((state) => state.addHistory)

  const handleLogout = async () => {
    try {
      await logout()
      toast.success('Вы вышли из аккаунта')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Не удалось выйти из аккаунта')
    }
  }

  // Lock scrollbar when catalog menu or search overlay is open
  useEffect(() => {
    if (catalogOpen || searchFocused) {
      document.documentElement.style.overflow = 'hidden'
      document.documentElement.style.scrollbarGutter = window.matchMedia('(min-width: 1024px)').matches ? 'stable' : ''
    } else {
      document.documentElement.style.overflow = ''
      document.documentElement.style.scrollbarGutter = ''
    }

    return () => {
      document.documentElement.style.overflow = ''
      document.documentElement.style.scrollbarGutter = ''
    }
  }, [catalogOpen, searchFocused])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const trimmed = searchQuery.trim()
    if (!trimmed) return
    if (searchFocused) {
      setSearchFocused(false)
    }
    addHistory(trimmed)
    setSearchFocused(false)
    router.push(`/search?q=${encodeURIComponent(trimmed)}`)
  }

  const handleSelectQuery = (query: string) => {
    setSearchQuery(query)
    addHistory(query)
    setSearchFocused(false)
    if (searchFocused) {
      setSearchFocused(false)
    }
    router.push(`/search?q=${encodeURIComponent(query)}`)
  }

  const hiddenHeader = pathname === '/become-seller'

  return (
    <header
      className={cn(
        'bg-apple-canvas border-apple-divider-soft sticky top-0 z-40 w-full border-b',
        hiddenHeader && 'hidden',
      )}
    >
      {/* ROW 1: TOP BAR */}
      <div className="bg-apple-canvas-parchment text-apple-ink-muted-80 w-full px-3 text-[13px] lg:px-4 lg:py-1.5">
        <div className="custom-container mx-auto flex min-h-11 items-center justify-between max-lg:min-h-auto">
          {/* Top Bar Left: Location & Pick-up points */}
          <div className="flex min-w-0 items-center gap-6">
            {/* City Selector */}
            <Popover>
              <PopoverTrigger asChild>
                <button
                  aria-label={`Выбрать город, сейчас ${selectedCity}`}
                  className="hover:text-apple-primary flex min-h-11 min-w-0 cursor-pointer items-center gap-1 outline-hidden transition-colors lg:min-h-0"
                >
                  <MapPin className="text-apple-ink-muted-48 size-4" />
                  <span className="text-apple-ink-muted-48 hidden lg:inline">Город:</span>
                  <span className="text-apple-ink hover:text-apple-primary decoration-apple-ink-muted-48 truncate font-medium underline decoration-dotted underline-offset-4 transition-colors">
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
                        'rounded-apple-sm hover:bg-apple-canvas-parchment flex min-h-11 w-full items-center justify-between px-3 py-2 text-left transition-colors disabled:opacity-50',
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
              className="text-apple-ink-muted-80 hover:text-apple-primary hidden font-medium transition-colors lg:inline"
            >
              Пункты выдачи
            </Link>
          </div>

          {/* Top Bar Right: Vendor Links & Lang Selector */}
          <div className="flex shrink-0 items-center gap-6">
            <Link
              href="/become-seller"
              className="text-apple-primary hover:text-apple-primary-focus hidden font-semibold transition-colors lg:inline"
            >
              Стать продавцом
            </Link>
            {/* <Link
              href="/open-pickup"
              className="text-apple-primary hover:text-apple-primary-focus font-semibold transition-colors"
            >
              Открыть пункт выдачи
            </Link> */}
            <Link
              href="/faq"
              className="text-apple-ink-muted-80 hover:text-apple-primary hidden transition-colors lg:inline"
            >
              Вопрос-ответ
            </Link>
            <Link
              href="/account/orders"
              className="text-apple-ink-muted-80 hover:text-apple-primary hidden font-medium transition-colors lg:inline"
            >
              Мои заказы
            </Link>

            {/* Language Selector */}
            <Popover open={languageOpen} onOpenChange={setLanguageOpen}>
              <PopoverTrigger asChild>
                <button className="text-apple-ink-muted-80 hover:text-apple-primary flex min-h-11 cursor-pointer items-center gap-1.5 outline-hidden transition-colors lg:min-h-0">
                  <span className="font-medium" data-i18n-ignore lang={selectedLang}>
                    {selectedLang === 'ru' ? 'Русский' : 'Türkmen'}
                  </span>
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
                    setLanguageOpen(false)
                  }}
                  className={cn(
                    'rounded-apple-sm hover:bg-apple-canvas-parchment flex min-h-11 w-full items-center gap-2 px-3 py-2 text-left text-[13px] transition-colors',
                    selectedLang === 'ru'
                      ? 'text-apple-ink bg-apple-canvas-parchment font-semibold'
                      : 'text-apple-ink-muted-80',
                  )}
                >
                  <span data-i18n-ignore lang="ru">
                    Русский
                  </span>
                  {selectedLang === 'ru' && <Check className="text-apple-primary ml-auto size-3.5" />}
                </button>
                <button
                  onClick={() => {
                    setSelectedLang('tk')
                    setLanguageOpen(false)
                  }}
                  className={cn(
                    'rounded-apple-sm hover:bg-apple-canvas-parchment flex min-h-11 w-full items-center gap-2 px-3 py-2 text-left text-[13px] transition-colors',
                    selectedLang === 'tk'
                      ? 'text-apple-ink bg-apple-canvas-parchment font-semibold'
                      : 'text-apple-ink-muted-80',
                  )}
                >
                  <span data-i18n-ignore lang="tk">
                    Türkmen
                  </span>
                  {selectedLang === 'tk' && <Check className="text-apple-primary ml-auto size-3.5" />}
                </button>
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <nav
          aria-label="Дополнительные ссылки"
          className="custom-container border-apple-divider-soft flex gap-6 border-t lg:hidden"
        >
          <Link
            href="/become-seller"
            className="text-apple-primary hover:text-apple-primary-focus flex items-center py-2 font-semibold transition-colors"
          >
            Стать продавцом
          </Link>
          <Link
            href="/pickup-points"
            className="text-apple-ink-muted-80 hover:text-apple-primary flex items-center py-2 font-medium transition-colors"
          >
            Пункты выдачи
          </Link>
        </nav>
      </div>

      {/* ROW 2: MAIN HEADER */}
      <div className="bg-apple-canvas w-full px-3 py-2 lg:p-4">
        <div className="custom-container mx-auto flex flex-wrap items-center justify-between gap-x-3 gap-y-2 max-lg:justify-start lg:flex-nowrap lg:justify-normal lg:gap-6">
          {/* Logo Brand */}
          <Link
            href="/"
            className="group order-2 flex shrink-0 items-center gap-2 font-semibold select-none lg:order-none lg:text-base"
          >
            Bugday
          </Link>

          {/* Catalog Button */}
          <Button
            variant={catalogOpen ? 'default' : 'secondary'}
            size="sm"
            onClick={() => setCatalogOpen(!catalogOpen)}
            aria-label={catalogOpen ? 'Закрыть каталог' : 'Открыть каталог'}
            aria-expanded={catalogOpen}
            className="order-1 size-11 shrink-0 cursor-pointer gap-2 px-0 font-semibold transition-all lg:order-none lg:h-9 lg:w-auto lg:px-4"
          >
            {catalogOpen ? <X className="size-4" /> : <Grid2x2 className="size-4" />}
            <span className="hidden lg:inline">Каталог</span>
          </Button>

          {/* Wide Search Bar */}
          <OnClickOutside
            onClickOutside={() => setSearchFocused(false)}
            classes="relative order-4 w-full min-w-0 lg:order-none lg:w-auto lg:flex-20"
          >
            <form
              onSubmit={handleSearchSubmit}
              className="border-apple-hairline rounded-apple-pill focus-within:border-apple-primary-focus focus-within:ring-apple-primary-focus bg-apple-canvas flex h-11 items-center overflow-hidden border transition-all focus-within:ring-1"
            >
              <Input
                type="text"
                aria-label="Искать товары и категории"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => {
                  setSearchFocused(true)
                  if (catalogOpen) {
                    setCatalogOpen(false)
                  }
                }}
                className="placeholder:text-apple-ink-muted-48 text-apple-ink h-full min-w-0 flex-1 border-none px-4 text-base shadow-none outline-hidden focus-visible:ring-0 focus-visible:ring-offset-0 lg:text-[14px]"
                placeholder="Искать товары и категории"
              />
              <button
                type="submit"
                aria-label="Найти"
                className="bg-apple-canvas-parchment border-apple-hairline hover:bg-apple-surface-pearl text-apple-ink-muted-80 flex h-full w-12 shrink-0 cursor-pointer items-center justify-center border-l transition-all duration-150 active:scale-95 lg:w-18"
              >
                <Search className="size-5" />
              </button>
            </form>
            {searchFocused && (
              <SearchOverlay onSelectQuery={handleSelectQuery} onClose={() => setSearchFocused(false)} />
            )}
          </OnClickOutside>

          {/* Right Controls: Actions */}
          <div className="order-3 flex items-center justify-end gap-0 max-lg:flex-1 lg:order-none lg:flex-5 lg:gap-2">
            {/* Login Dialog */}
            {isAuthenticated && customer ? (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="default"
                    size="sm"
                    aria-label="Личный кабинет"
                    className="size-11 cursor-pointer gap-2.5 p-0 font-semibold lg:h-9 lg:w-auto lg:px-[15px]"
                  >
                    <User />
                    {/* <span>{customer.first_name || customer.phone_number}</span> */}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-56 p-2" align="end">
                  <div className="border-apple-divider-soft border-b px-2 py-1.5">
                    <p className="text-apple-fine-print mt-0.5">{customer.phone_number}</p>
                  </div>
                  <Button variant="ghost" size="xs" className="mt-1 w-full justify-start text-xs font-semibold" asChild>
                    <Link href="/account">Перейти в кабинет</Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="xs"
                    className="w-full justify-start text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-600"
                    onClick={handleLogout}
                  >
                    Выйти
                  </Button>
                </PopoverContent>
              </Popover>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                aria-label={isAuthLoading ? 'Проверяем вход' : 'Войти'}
                className="size-11 cursor-pointer gap-2.5 p-0 font-semibold lg:h-9 lg:w-auto lg:px-4"
                disabled={isAuthLoading}
                onClick={() => setLoginOpen(true)}
              >
                {isAuthLoading ? <Spinner size="sm" /> : <User />}
                <span className="hidden lg:inline">{isAuthLoading ? 'Проверяем…' : 'Войти'}</span>
              </Button>
            )}
            {!isAuthenticated && loginOpen && <AuthDialog open={loginOpen} onOpenChange={setLoginOpen} />}

            {/* Favorites Button */}
            <Button
              variant="ghost"
              size="sm"
              className="size-11 cursor-pointer p-0 font-medium lg:h-9 lg:w-auto lg:px-3"
              asChild
            >
              <Link href="/account/favorites" aria-label="Избранное">
                <Heart className="text-apple-ink-muted-80" />
                <span className="hidden lg:inline">Избранное</span>
              </Link>
            </Button>

            {/* Cart Sheet Drawer */}
            <CartSheet />
          </div>
        </div>
      </div>
      {catalogOpen && <CatalogMenu onClose={() => setCatalogOpen(false)} />}
    </header>
  )
}
