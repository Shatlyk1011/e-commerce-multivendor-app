import type { Metadata } from 'next'
import Link from 'next/link'

import type { LucideIcon } from 'lucide-react'
import {
  ArrowRight,
  Banknote,
  CircleHelp,
  PackageCheck,
  RotateCcw,
  ShoppingBag,
  Store,
  Truck,
  UserRound,
} from 'lucide-react'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Вопросы и ответы',
  description:
    'Ответы на частые вопросы о заказах, оплате, доставке, возвратах, аккаунте и продажах на маркетплейсе Bugday.',
}

type FaqItem = {
  id: string
  question: string
  answer: string
}

type FaqCategory = {
  id: string
  title: string
  description: string
  icon: LucideIcon
  items: FaqItem[]
}

const faqCategories: FaqCategory[] = [
  {
    id: 'orders',
    title: 'Заказы',
    description: 'Оформление, изменение и статус заказа',
    icon: ShoppingBag,
    items: [
      {
        id: 'place-order',
        question: 'Как оформить заказ?',
        answer:
          'Добавьте нужные товары в корзину и перейдите к оформлению. Войдите в аккаунт, выберите способ получения, укажите необходимые данные и подтвердите заказ. После оформления он появится в разделе «Мои заказы».',
      },
      {
        id: 'order-status',
        question: 'Где посмотреть статус заказа?',
        answer:
          'Откройте раздел «Мои заказы» в личном кабинете. Там отображается текущий статус каждого заказа и отдельных магазинов, если товары отправляют разные продавцы.',
      },
      {
        id: 'multi-seller-order',
        question: 'Почему товары из одного заказа могут прийти отдельно?',
        answer:
          'Bugday объединяет товары разных продавцов в одной корзине. Каждый магазин самостоятельно подтверждает и готовит свою часть заказа, поэтому сроки и статусы отдельных отправлений могут отличаться.',
      },
      {
        id: 'change-order',
        question: 'Можно ли изменить или отменить заказ после оформления?',
        answer:
          'Возможность изменения зависит от текущего статуса заказа. Откройте заказ в личном кабинете и проверьте его состояние. Если сборка уже началась, изменить состав может быть невозможно.',
      },
    ],
  },
  {
    id: 'payment',
    title: 'Оплата',
    description: 'Способ оплаты и итоговая стоимость',
    icon: Banknote,
    items: [
      {
        id: 'payment-methods',
        question: 'Как можно оплатить заказ?',
        answer:
          'Сейчас при оформлении доступна оплата наличными при получении. Выбранный способ оплаты всегда показывается на странице оформления до подтверждения заказа.',
      },
      {
        id: 'final-price',
        question: 'Где увидеть итоговую стоимость?',
        answer:
          'Полная сумма заказа отображается в корзине и на странице оформления. Стоимость доставки добавляется после выбора способа получения, поэтому вы увидите итог до подтверждения заказа.',
      },
      {
        id: 'receipt',
        question: 'Сохраняется ли информация об оплате?',
        answer:
          'Состав заказа, итоговая сумма и статус оплаты сохраняются в истории заказов вашего аккаунта. Для вопросов по конкретной покупке откройте соответствующий заказ.',
      },
    ],
  },
  {
    id: 'delivery',
    title: 'Доставка и получение',
    description: 'Курьер, пункты выдачи и сроки',
    icon: Truck,
    items: [
      {
        id: 'delivery-options',
        question: 'Какие способы получения доступны?',
        answer:
          'При оформлении можно выбрать самовывоз из доступного пункта выдачи или курьерскую доставку. Конкретные варианты зависят от адреса и конфигурации доставки для вашего заказа.',
      },
      {
        id: 'delivery-time',
        question: 'Когда доставят заказ?',
        answer:
          'Доступные дата и временной интервал показываются во время оформления. После подтверждения следите за статусом в разделе «Мои заказы» — он обновляется по мере подготовки и передачи заказа.',
      },
      {
        id: 'delivery-cost',
        question: 'Сколько стоит доставка?',
        answer:
          'Стоимость рассчитывается на этапе оформления и зависит от выбранного способа получения. Итоговая сумма с учётом доставки отображается до подтверждения заказа.',
      },
      {
        id: 'pickup-order',
        question: 'Как получить заказ в пункте выдачи?',
        answer:
          'Выберите удобный пункт при оформлении и дождитесь статуса «Готов к выдаче». Адреса доступных пунктов также можно посмотреть на отдельной странице пунктов выдачи.',
      },
    ],
  },
  {
    id: 'returns',
    title: 'Возвраты и проблемы',
    description: 'Повреждения, комплектация и возврат',
    icon: RotateCcw,
    items: [
      {
        id: 'return-item',
        question: 'Как оформить возврат товара?',
        answer:
          'Проверьте товар, его состояние и комплектацию до того, как уйдёте из пункта выдачи. Если заметили проблему, сразу сообщите об этом сотруднику пункта. Если возврат требуется позже, откройте покупку в разделе «Мои заказы» и подготовьте номер заказа, фотографии товара и упаковки.',
      },
      {
        id: 'damaged-item',
        question: 'Что делать, если товар повреждён или не соответствует описанию?',
        answer:
          'Осмотрите товар до выхода из пункта выдачи. Если он повреждён, не соответствует описанию или имеет другую проблему, сразу сообщите сотруднику пункта и не используйте товар. Сохраните упаковку и при необходимости зафиксируйте проблему на фото.',
      },
    ],
  },
  {
    id: 'account',
    title: 'Аккаунт',
    description: 'Вход, адреса, избранное и история',
    icon: UserRound,
    items: [
      {
        id: 'account-required',
        question: 'Нужен ли аккаунт для оформления заказа?',
        answer:
          'Да, перед подтверждением заказа нужно войти в аккаунт. Это позволяет сохранить адрес доставки, показать историю покупок и связать заказ с вашим номером телефона.',
      },
      {
        id: 'sign-in',
        question: 'Как войти в аккаунт?',
        answer:
          'Нажмите кнопку входа в верхней части сайта, укажите номер телефона и введите одноразовый код подтверждения. Отдельный пароль запоминать не нужно.',
      },
      {
        id: 'saved-data',
        question: 'Что можно сохранить в личном кабинете?',
        answer:
          'В аккаунте доступны личные данные, адреса доставки, избранные товары и история заказов. Сохранённые адреса можно использовать при следующих покупках.',
      },
    ],
  },
  {
    id: 'sellers',
    title: 'Продавцам',
    description: 'Заявка и начало работы на Bugday',
    icon: Store,
    items: [
      {
        id: 'become-seller',
        question: 'Как начать продавать на Bugday?',
        answer:
          'Заполните короткую заявку на странице «Стать продавцом». Специалист свяжется с вами, ответит на вопросы и объяснит дальнейшие шаги подключения магазина.',
      },
      {
        id: 'seller-documents',
        question: 'Можно ли подать заявку, если ИП ещё не оформлено?',
        answer:
          'Да, в заявке можно указать, что оформление находится в процессе или что ИП пока нет. Команда уточнит вашу ситуацию и расскажет, какие условия потребуются перед запуском продаж.',
      },
      {
        id: 'seller-products',
        question: 'Какие товары можно размещать?',
        answer:
          'Возможность размещения зависит от категории товара и требований площадки. Расскажите об ассортименте в заявке — специалист уточнит условия и ограничения для вашей категории.',
      },
    ],
  },
]

const allFaqItems = faqCategories.flatMap((category) => category.items)

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: allFaqItems.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.answer,
    },
  })),
}

export default function FaqPage() {
  return (
    <main className="bg-apple-canvas text-apple-ink min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema).replace(/</g, '\\u003c') }}
      />

      <div className="custom-container mx-auto px-4 pt-5 sm:pt-7">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Главная</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Вопросы и ответы</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <section className="custom-container mx-auto px-4 pt-8 pb-16 sm:pt-12 sm:pb-20" aria-labelledby="faq-title">
        <div className="rounded-apple-lg border-apple-hairline grid overflow-hidden border lg:grid-cols-2">
          <div className="bg-apple-canvas-parchment flex min-h-[420px] flex-col justify-between p-7 sm:p-12 lg:min-h-[520px] lg:p-16">
            <div>
              <Badge variant="outline" size="lg" className="bg-apple-canvas">
                Центр помощи
              </Badge>
              <h1
                id="faq-title"
                className="font-heading mt-7 max-w-lg text-[42px] leading-[1.02] font-semibold tracking-[-1.2px] sm:text-[56px]"
              >
                Есть вопрос?
                <br />
                Начните здесь.
              </h1>
            </div>
            <p className="text-apple-ink-muted-80 mt-12 max-w-md text-[17px] leading-[1.55] tracking-[-0.374px]">
              Короткие и понятные ответы о покупках, доставке, возвратах и работе с Bugday.
            </p>
          </div>

          <div className="bg-apple-surface-tile-1 text-apple-on-dark flex min-h-[420px] flex-col justify-between p-7 sm:p-12 lg:min-h-[520px] lg:p-16">
            <div className="flex size-12 items-center justify-center rounded-full border border-white/15">
              <CircleHelp className="text-apple-primary-on-dark size-6" aria-hidden="true" />
            </div>
            <div className="mt-14">
              <p className="text-apple-body-muted text-[13px] font-semibold tracking-wide uppercase">Популярные темы</p>
              <div className="mt-5 divide-y divide-white/15 border-y border-white/15">
                <a href="#orders" className="group flex min-h-14 items-center justify-between gap-4 py-4">
                  <span className="text-[17px] font-semibold tracking-tight">Как оформить заказ</span>
                  <ArrowRight className="text-apple-primary-on-dark size-4 transition-transform group-hover:translate-x-1" />
                </a>
                <a href="#delivery" className="group flex min-h-14 items-center justify-between gap-4 py-4">
                  <span className="text-[17px] font-semibold tracking-tight">Доставка и получение</span>
                  <ArrowRight className="text-apple-primary-on-dark size-4 transition-transform group-hover:translate-x-1" />
                </a>
                <a href="#sellers" className="group flex min-h-14 items-center justify-between gap-4 py-4">
                  <span className="text-[17px] font-semibold tracking-tight">Начать продавать</span>
                  <ArrowRight className="text-apple-primary-on-dark size-4 transition-transform group-hover:translate-x-1" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-apple-divider-soft border-t" aria-labelledby="faq-index-title">
        <div className="custom-container mx-auto grid gap-12 px-4 py-16 sm:py-20 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-20 lg:py-24">
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <p id="faq-index-title" className="font-heading text-[21px] font-semibold tracking-tight">
              Все темы
            </p>
            <nav className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-1" aria-label="Разделы вопросов">
              {faqCategories.map(({ id, title, icon: Icon, items }) => (
                <a
                  key={id}
                  href={`#${id}`}
                  className="border-apple-hairline hover:border-apple-primary hover:text-apple-primary focus-visible:ring-apple-primary-focus rounded-apple-md flex min-h-12 items-center gap-3 border px-3.5 py-2.5 text-[13px] font-semibold transition-colors outline-none focus-visible:ring-2 lg:border-transparent"
                >
                  <Icon className="size-4 shrink-0" aria-hidden="true" />
                  <span className="min-w-0 flex-1">{title}</span>
                  <span className="text-apple-ink-muted-48 text-[11px] font-normal">{items.length}</span>
                </a>
              ))}
            </nav>
          </aside>

          <div className="min-w-0">
            {faqCategories.map(({ id, title, description, icon: Icon, items }, categoryIndex) => (
              <section
                key={id}
                id={id}
                className="border-apple-divider-soft scroll-mt-28 border-b py-12 first:pt-0 last:border-b-0 last:pb-0"
                aria-labelledby={`${id}-title`}
              >
                <div className="mb-6 flex items-start gap-4">
                  <div className="bg-apple-canvas-parchment text-apple-primary rounded-apple-md flex size-11 shrink-0 items-center justify-center">
                    <Icon className="size-5" aria-hidden="true" />
                  </div>
                  <div>
                    <h2
                      id={`${id}-title`}
                      className="font-heading text-[28px] leading-tight font-semibold tracking-[-0.5px]"
                    >
                      {title}
                    </h2>
                    <p className="text-apple-ink-muted-48 mt-1 text-[14px] leading-relaxed">{description}</p>
                  </div>
                </div>

                <Accordion type="single" collapsible defaultValue={categoryIndex === 0 ? items[0]?.id : undefined}>
                  {items.map((item) => (
                    <AccordionItem key={item.id} value={item.id}>
                      <AccordionTrigger>{item.question}</AccordionTrigger>
                      <AccordionContent>{item.answer}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </section>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-apple-canvas-parchment border-apple-divider-soft border-t px-4 py-16 sm:py-20">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <div className="bg-apple-canvas text-apple-primary border-apple-hairline flex size-12 items-center justify-center rounded-full border">
            <PackageCheck className="size-5" aria-hidden="true" />
          </div>
          <h2 className="font-heading mt-5 text-[30px] leading-tight font-semibold tracking-[-0.5px] sm:text-[36px]">
            Вопрос о конкретном заказе?
          </h2>
          <p className="text-apple-ink-muted-48 mt-3 max-w-xl text-[17px] leading-[1.55] tracking-[-0.374px]">
            Откройте историю покупок: там собраны состав заказа, суммы и актуальные статусы каждого продавца.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="md">
              <Link href="/account/orders">
                Мои заказы
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="md">
              <Link href="/">Продолжить покупки</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  )
}
