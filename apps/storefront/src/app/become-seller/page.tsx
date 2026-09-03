import type { Metadata } from 'next'

import { ArrowRight, BadgeCheck, Headphones, Store, Truck } from 'lucide-react'

import { Button } from '@/components/ui/button'

import { SellerForm } from './SellerForm'

export const metadata: Metadata = {
  title: 'Стать продавцом на Bugday',
  description:
    'Присоединяйтесь к Bugday в Туркменистане. Продавайте товары миллионам покупателей с быстрой доставкой и поддержкой.',
}

const benefits = [
  { icon: Store, title: 'Свой магазин', description: 'Размещайте товары и управляйте ассортиментом в одном месте.' },
  { icon: Truck, title: 'Доставка для вас', description: 'Мы поможем организовать доставку заказов покупателям.' },
  { icon: Headphones, title: 'Поддержка команды', description: 'Получайте помощь на каждом этапе работы с площадкой.' },
  {
    icon: BadgeCheck,
    title: 'Доверие покупателей',
    description: 'Привлекайте новых клиентов через знакомый маркетплейс.',
  },
]

export default function BecomeVendorPage() {
  return (
    <main className="bg-apple-canvas text-apple-ink min-h-screen antialiased">
      <section className="bg-apple-canvas-parchment border-apple-divider-soft relative z-10 flex min-h-[95vh] items-center border-b text-white">
        <div className="custom-container z-10 mx-auto px-4 text-center">
          <p className="text-apple-primary mb-3 text-[13px] font-semibold tracking-wide uppercase">Для бизнеса</p>
          <h1 className="font-heading mx-auto text-[36px] leading-tight font-bold tracking-tight sm:text-[48px]">
            Продавайте больше вместе с <br /> Bugday Market
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-[16px] leading-relaxed text-white/70">
            Откройте магазин на маркетплейсе и расскажите о своих товарах покупателям по всему Туркменистану.
          </p>
          <Button asChild size="lg" className="mt-7">
            <a href="#seller-form">
              Оставить заявку <ArrowRight className="size-4" />
            </a>
          </Button>
        </div>

        <figure className="absolute inset-0 -z-1 h-full w-full">
          <img src="/seller-bg.jpg" className="h-full w-full object-cover object-bottom" alt="" />
          <div className="absolute inset-0 bg-black/70"></div>
        </figure>
      </section>

      <section className="custom-container mx-auto px-4 py-14 sm:py-20">
        <div className="mb-8 max-w-xl">
          <h2 className="font-heading text-[28px] font-bold tracking-tight sm:text-[34px]">
            Почему продавцы выбирают нас
          </h2>
          <p className="text-apple-ink-muted-48 mt-2 text-[15px]">
            Всё необходимое, чтобы уверенно начать продавать онлайн.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map(({ icon: Icon, title, description }) => (
            <div key={title} className="border-apple-hairline rounded-apple-lg bg-apple-canvas border p-5">
              <div className="bg-apple-canvas-parchment text-apple-primary rounded-apple-md mb-5 flex size-11 items-center justify-center">
                <Icon className="size-5" />
              </div>
              <h3 className="font-heading text-[17px] font-semibold">{title}</h3>
              <p className="text-apple-ink-muted-48 mt-2 text-[14px] leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </section>

      <section
        id="seller-form"
        className="bg-apple-canvas-parchment border-apple-divider-soft border-t px-4 py-14 sm:py-20"
      >
        <div className="mx-auto flex max-w-2xl flex-col gap-4">
          <div>
            <p className="text-apple-primary mb-3 text-[13px] font-semibold tracking-wide uppercase">Заявка продавца</p>
            <h2 className="font-heading text-[30px] leading-tight font-bold tracking-tight sm:text-[36px]">
              Начните продавать уже сегодня
            </h2>
            <p className="text-apple-ink-muted-48 mt-3 max-w-lg text-[15px] leading-relaxed">
              Заполните короткую форму. Специалист свяжется с вами, ответит на вопросы и поможет зарегистрировать Ваш
              аккаунт.
            </p>
          </div>

          <SellerForm />
        </div>
      </section>
    </main>
  )
}
