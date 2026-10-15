import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

import { ArrowLeft, ArrowRight, BadgeCheck, Headphones, Store, Truck } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

import { SellerForm } from './SellerForm'

export const metadata: Metadata = {
  title: 'Стать продавцом на Bugday',
  description:
    'Присоединяйтесь к Bugday в Туркменистане. Откройте свой магазин, находите новых покупателей и развивайте продажи онлайн.',
}

const benefits = [
  {
    icon: Store,
    title: 'Свой магазин',
    description: 'Размещайте товары и управляйте ассортиментом в одном месте.',
  },
  {
    icon: Truck,
    title: 'Удобная доставка',
    description: 'Мы поможем организовать доставку заказов вашим покупателям.',
  },
  {
    icon: Headphones,
    title: 'Поддержка команды',
    description: 'Получайте помощь при запуске и на каждом этапе работы.',
  },
  {
    icon: BadgeCheck,
    title: 'Доверие покупателей',
    description: 'Находите новых клиентов на знакомом им маркетплейсе.',
  },
]

const steps = [
  {
    number: '01',
    title: 'Оставьте заявку',
    description: 'Расскажите немного о себе и своём магазине.',
  },
  {
    number: '02',
    title: 'Обсудите детали',
    description: 'Специалист свяжется с вами и ответит на вопросы.',
  },
  {
    number: '03',
    title: 'Откройте магазин',
    description: 'Добавьте товары и начните принимать заказы.',
  },
]

export default function BecomeVendorPage() {
  return (
    <main className="bg-apple-canvas text-apple-ink min-h-screen antialiased">
      <section className="bg-apple-canvas-parchment">
        <div className="mx-auto grid min-h-[720px] max-w-[1440px] lg:grid-cols-[0.92fr_1.08fr]">
          <div className="flex flex-col px-5 py-5 sm:px-8 sm:py-7 lg:px-12 xl:px-20">
            <nav className="flex items-center justify-between gap-4" aria-label="Навигация страницы продавцов">
              <Link
                href="/"
                className="font-heading text-apple-ink focus-visible:ring-apple-primary-focus rounded-apple-xs text-[19px] font-semibold tracking-tight outline-none focus-visible:ring-2"
              >
                Bugday
              </Link>
              <Button asChild variant="ghost" size="sm" className="-mr-3">
                <Link href="/">
                  <ArrowLeft className="size-4" />
                  <span className="hidden sm:inline">Вернуться к покупкам</span>
                  <span className="sm:hidden">В магазин</span>
                </Link>
              </Button>
            </nav>

            <div className="flex flex-1 flex-col justify-center py-16 sm:py-20 lg:py-24">
              <Badge variant="outline" size="lg" className="mb-6 w-fit bg-white">
                Для предпринимателей
              </Badge>
              <h1 className="font-heading max-w-[620px] text-[40px] leading-[1.04] font-semibold tracking-[-1.2px] text-balance sm:text-[52px] lg:text-[56px]">
                Ваши товары — для покупателей по всему Туркменистану
              </h1>
              <p className="text-apple-ink-muted-80 mt-6 max-w-[560px] text-[17px] leading-[1.55] tracking-[-0.374px]">
                Откройте магазин на Bugday, управляйте ассортиментом в одном месте и развивайте продажи с поддержкой
                нашей команды.
              </p>

              <div className="mt-9 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                <Button asChild size="lg">
                  <a href="#seller-form">
                    Оставить заявку
                    <ArrowRight className="size-4" />
                  </a>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/seller-requirements">Проверить требования</Link>
                </Button>
              </div>
              <p className="text-apple-ink-muted-48 mt-3 text-[13px] leading-relaxed">
                Заполнение заявки займёт около 2 минут
              </p>
            </div>

            <div className="border-apple-hairline text-apple-ink-muted-48 flex flex-wrap gap-x-6 gap-y-2 border-t py-5 text-[12px]">
              <span>Бесплатная заявка</span>
              <span>Помощь при подключении</span>
              <span>Без сложной регистрации</span>
            </div>
          </div>

          <figure className="relative min-h-[390px] overflow-hidden lg:min-h-full">
            <Image
              src="/seller-bg.jpg"
              alt="Витрина небольшого магазина"
              fill
              priority
              sizes="(max-width: 1023px) 100vw, 56vw"
              className="object-cover object-center"
            />
            <figcaption className="bg-apple-canvas/90 text-apple-ink rounded-apple-md absolute right-5 bottom-5 max-w-[230px] px-4 py-3 text-[12px] leading-relaxed backdrop-blur-md sm:right-8 sm:bottom-8">
              Превратите знакомую витрину в магазин, доступный покупателям каждый день.
            </figcaption>
          </figure>
        </div>
      </section>

      <section className="custom-container mx-auto px-4 py-16 sm:py-20 lg:py-24" aria-labelledby="benefits-heading">
        <div className="mb-10 max-w-2xl sm:mb-12">
          <p className="text-apple-primary mb-3 text-[13px] font-semibold tracking-wide uppercase">Всё для старта</p>
          <h2
            id="benefits-heading"
            className="font-heading text-[32px] leading-tight font-semibold tracking-[-0.6px] sm:text-[40px]"
          >
            Вы продаёте. Мы помогаем расти.
          </h2>
          <p className="text-apple-ink-muted-48 mt-4 max-w-xl text-[17px] leading-[1.55] tracking-[-0.374px]">
            Сосредоточьтесь на товарах и клиентах — основные инструменты для онлайн-продаж уже собраны на одной
            площадке.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map(({ icon: Icon, title, description }) => (
            <Card key={title} className="min-h-[220px]">
              <CardHeader className="gap-6">
                <div className="bg-apple-canvas-parchment text-apple-primary rounded-apple-md flex size-11 items-center justify-center">
                  <Icon className="size-5" aria-hidden="true" />
                </div>
                <CardTitle>{title}</CardTitle>
              </CardHeader>
              <CardContent className="text-apple-ink-muted-48 text-[14px] leading-[1.55]">{description}</CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section id="seller-form" className="bg-apple-surface-tile-1 scroll-mt-8 px-4 py-16 sm:py-20 lg:py-24">
        <div className="mx-auto grid max-w-[1120px] gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div className="text-apple-on-dark lg:sticky lg:top-8 lg:self-start">
            <p className="text-apple-primary-on-dark mb-3 text-[13px] font-semibold tracking-wide uppercase">
              Как это работает
            </p>
            <h2 className="font-heading max-w-md text-[32px] leading-tight font-semibold tracking-[-0.6px] sm:text-[40px]">
              От заявки до первой продажи
            </h2>
            <p className="text-apple-body-muted mt-4 max-w-md text-[17px] leading-[1.55] tracking-[-0.374px]">
              Мы проведём вас через подключение и поможем подготовить магазин к запуску.
            </p>

            <ol className="mt-10 space-y-0">
              {steps.map((step, index) => (
                <li key={step.number} className="grid grid-cols-[40px_1fr] gap-4">
                  <div className="flex flex-col items-center">
                    <span className="border-apple-surface-tile-2 bg-apple-surface-tile-2 text-apple-primary-on-dark flex size-10 items-center justify-center rounded-full border text-[12px] font-semibold">
                      {step.number}
                    </span>
                    {index < steps.length - 1 && (
                      <Separator orientation="vertical" className="my-2 min-h-10 bg-white/15" />
                    )}
                  </div>
                  <div className="pt-1.5 pb-8">
                    <h3 className="text-[17px] font-semibold tracking-tight">{step.title}</h3>
                    <p className="text-apple-body-muted mt-1 text-[14px] leading-relaxed">{step.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div>
            <div className="mb-6">
              <Badge variant="pearl" size="lg" className="mb-5">
                Заявка продавца
              </Badge>
              <h2 className="font-heading text-apple-on-dark text-[30px] leading-tight font-semibold tracking-[-0.5px] sm:text-[36px]">
                Расскажите о своём магазине
              </h2>
              <p className="text-apple-body-muted mt-3 max-w-xl text-[15px] leading-relaxed">
                Оставьте контакты — специалист свяжется с вами и расскажет о следующих шагах.
              </p>
            </div>

            <SellerForm />
          </div>
        </div>
      </section>
    </main>
  )
}
