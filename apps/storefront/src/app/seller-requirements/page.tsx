import type { Metadata } from 'next'
import Link from 'next/link'

import {
  ArrowRight,
  BadgeCheck,
  Ban,
  Box,
  Check,
  ClipboardCheck,
  Clock3,
  FileCheck2,
  Mail,
  PackageCheck,
  PackageX,
  Scale,
  ShieldCheck,
  Store,
} from 'lucide-react'

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
  title: 'Требования к продавцам и товарам',
  description:
    'Условия для продавцов Bugday в Туркменистане: требования к товарам, упаковке, документам и срокам годности.',
  alternates: { canonical: '/seller-requirements' },
}

const pageSections = [
  { id: 'seller', label: 'Кто может продавать', icon: Store },
  { id: 'dimensions', label: 'Размеры и упаковка', icon: Box },
  { id: 'prohibited', label: 'Запрещённые товары', icon: Ban },
  { id: 'documents', label: 'Товары с документами', icon: FileCheck2 },
  { id: 'expiry', label: 'Срок годности', icon: Clock3 },
  { id: 'checklist', label: 'Проверка перед заявкой', icon: ClipboardCheck },
]

const prohibitedGroups = [
  {
    title: 'Опасные товары',
    items: [
      'Оружие, боеприпасы, взрывчатые вещества и пиротехника',
      'Наркотические, психотропные, токсичные и радиоактивные вещества',
      'Товары, которые могут причинить вред человеку, животным или окружающей среде',
    ],
  },
  {
    title: 'Незаконные и поддельные товары',
    items: [
      'Контрафактные товары, реплики и пиратская продукция',
      'Поддельные документы, деньги, ценные бумаги, марки и государственные знаки',
      'Товары, оборот которых запрещён или ограничен в Туркменистане',
    ],
  },
  {
    title: 'Непригодные товары',
    items: [
      'Товары с истёкшим сроком годности или без обязательной маркировки',
      'Бывшие в употреблении, повреждённые или восстановленные товары без согласования',
      'Товары без понятного состава, назначения или достоверного описания',
    ],
  },
  {
    title: 'Защищённые категории',
    items: [
      'Объекты культурного наследия и государственные награды',
      'Редкие животные, растения и продукция, полученная браконьерским способом',
      'Материалы, нарушающие права, безопасность или достоинство других людей',
    ],
  },
]

const documentCategories = [
  'Медицинские изделия, товары для здоровья и ветеринарная продукция',
  'Ювелирные изделия, драгоценные металлы и камни',
  'Продукты питания, косметика, бытовая химия и детские товары',
  'Радиооборудование, беспилотные устройства и другие регулируемые технические товары',
  'Товары известных брендов, если нужно подтвердить право продажи и происхождение',
]

const checklist = [
  'Бизнес зарегистрирован в Туркменистане и может вести торговую деятельность.',
  'У товара есть точное название, состав, производитель и страна происхождения.',
  'Упаковка выдержит хранение, перевозку и выдачу покупателю.',
  'Размеры и вес каждой упаковки измерены в транспортном положении.',
  'Для регулируемой категории подготовлены сертификаты, лицензии или разрешения.',
  'Срок годности и обязательная маркировка читаются и не были изменены.',
]

function SectionHeading({
  id,
  eyebrow,
  title,
  description,
}: {
  id: string
  eyebrow: string
  title: string
  description: string
}) {
  return (
    <div className="mb-8 max-w-3xl">
      <p className="text-apple-primary text-[12px] font-semibold tracking-[0.08em] uppercase">{eyebrow}</p>
      <h2
        id={id}
        className="font-heading mt-3 text-[28px] leading-tight font-semibold tracking-[-0.5px] sm:text-[36px]"
      >
        {title}
      </h2>
      <p className="text-apple-ink-muted-80 mt-3 text-[16px] leading-[1.65]">{description}</p>
    </div>
  )
}

export default function SellerRequirementsPage() {
  return (
    <main className="bg-apple-canvas text-apple-ink min-h-screen">
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
              <BreadcrumbLink asChild>
                <Link href="/become-seller">Продавцам</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Требования</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <section className="custom-container mx-auto px-4 pt-10 pb-12 sm:pt-14 sm:pb-16" aria-labelledby="page-title">
        <div className="bg-apple-surface-tile-1 text-apple-on-dark rounded-apple-lg overflow-hidden">
          <div className="grid lg:grid-cols-[minmax(0,1fr)_380px]">
            <div className="px-6 py-10 sm:px-10 sm:py-14 lg:px-14 lg:py-16">
              <Badge variant="pearl" size="lg">
                Правила площадки
              </Badge>
              <h1
                id="page-title"
                className="font-heading mt-6 max-w-3xl text-[38px] leading-[1.08] font-semibold tracking-[-1px] text-balance sm:text-[52px]"
              >
                Проверьте товар до подачи заявки
              </h1>
              <p className="text-apple-body-muted mt-5 max-w-2xl text-[17px] leading-[1.6]">
                Здесь собраны базовые условия для продавцов Bugday в Туркменистане: кто может подключиться, какие товары
                принимаются и когда нужны подтверждающие документы.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg">
                  <Link href="/become-seller#seller-form">
                    Оставить заявку
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white"
                >
                  <a href="#checklist">Проверить готовность</a>
                </Button>
              </div>
            </div>

            <div className="bg-apple-surface-tile-2 border-t border-white/10 px-6 py-8 sm:px-10 lg:border-t-0 lg:border-l lg:px-8 lg:py-14">
              <p className="text-apple-body-muted text-[12px] font-semibold tracking-[0.08em] uppercase">
                Быстрая проверка
              </p>
              <ol className="mt-6 space-y-5">
                {[
                  ['01', 'Статус продавца', 'Бизнес зарегистрирован в Туркменистане'],
                  ['02', 'Товар и документы', 'Категория разрешена, документы готовы'],
                  ['03', 'Упаковка', 'Вес, размеры и маркировка соответствуют правилам'],
                ].map(([number, title, description]) => (
                  <li key={number} className="grid grid-cols-[38px_1fr] gap-4">
                    <span className="text-apple-primary-on-dark flex size-9 items-center justify-center rounded-full border border-white/15 text-[11px] font-semibold">
                      {number}
                    </span>
                    <div>
                      <p className="text-[14px] font-semibold">{title}</p>
                      <p className="text-apple-body-muted mt-1 text-[12px] leading-relaxed">{description}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      <section className="border-apple-divider-soft border-t" aria-label="Требования к продавцам и товарам">
        <div className="custom-container mx-auto grid gap-12 px-4 py-14 sm:py-20 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-20 lg:py-24">
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <p className="font-heading text-[19px] font-semibold tracking-tight">На этой странице</p>
            <nav className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-1" aria-label="Разделы требований">
              {pageSections.map(({ id, label, icon: Icon }) => (
                <a
                  key={id}
                  href={`#${id}`}
                  className="border-apple-hairline hover:border-apple-primary hover:text-apple-primary focus-visible:ring-apple-primary-focus rounded-apple-md flex min-h-12 items-center gap-3 border px-3.5 py-2.5 text-[13px] font-semibold transition-colors outline-none focus-visible:ring-2 lg:border-transparent"
                >
                  <Icon className="size-4 shrink-0" aria-hidden="true" />
                  <span>{label}</span>
                </a>
              ))}
            </nav>
          </aside>

          <div className="min-w-0">
            <section id="seller" className="scroll-mt-28 pb-14 sm:pb-16" aria-labelledby="seller-title">
              <SectionHeading
                id="seller-title"
                eyebrow="Для продавца"
                title="Кто может продавать"
                description="Подать заявку могут компании и предприниматели, зарегистрированные в Туркменистане и имеющие право продавать заявленный ассортимент."
              />
              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  ['Юридические лица', 'Компании с действующей регистрацией и банковскими реквизитами.'],
                  ['Предприниматели', 'Индивидуальные предприниматели с разрешённым видом деятельности.'],
                  [
                    'Производители и дилеры',
                    'Владельцы брендов и официальные поставщики с подтверждением происхождения товара.',
                  ],
                ].map(([title, description]) => (
                  <article key={title} className="border-apple-hairline rounded-apple-md border p-5">
                    <BadgeCheck className="text-apple-primary size-5" aria-hidden="true" />
                    <h3 className="font-heading mt-5 text-[17px] font-semibold">{title}</h3>
                    <p className="text-apple-ink-muted-48 mt-2 text-[13px] leading-[1.6]">{description}</p>
                  </article>
                ))}
              </div>
              <div className="bg-apple-canvas-parchment rounded-apple-md mt-5 flex gap-4 p-5">
                <Scale className="text-apple-primary mt-0.5 size-5 shrink-0" aria-hidden="true" />
                <p className="text-apple-ink-muted-80 text-[14px] leading-[1.65]">
                  Продавец самостоятельно проверяет налоговые, разрешительные и отраслевые требования для своей
                  деятельности. Команда Bugday проверяет документы для подключения, но не заменяет юридическую или
                  налоговую консультацию.
                </p>
              </div>
            </section>

            <section
              id="dimensions"
              className="border-apple-divider-soft scroll-mt-28 border-t py-14 sm:py-16"
              aria-labelledby="dimensions-title"
            >
              <SectionHeading
                id="dimensions-title"
                eyebrow="Логистика"
                title="Размеры, вес и упаковка"
                description="Указывайте параметры товара в транспортной упаковке. Финальное решение о приёмке зависит от категории, способа доставки и возможностей склада."
              />
              <div className="rounded-apple-md border-apple-hairline overflow-hidden border">
                <div className="bg-apple-canvas-parchment grid px-5 py-3 text-[12px] font-semibold tracking-wide uppercase sm:grid-cols-[1.15fr_1fr]">
                  <span>Тип товара</span>
                  <span className="hidden sm:block">Ограничения</span>
                </div>
                <div className="divide-apple-divider-soft divide-y">
                  <div className="grid gap-3 px-5 py-5 sm:grid-cols-[1.15fr_1fr]">
                    <div>
                      <p className="font-heading text-[16px] font-semibold">Малые и средние товары</p>
                      <p className="text-apple-ink-muted-48 mt-1 text-[13px]">Обычное полочное хранение</p>
                    </div>
                    <ul className="text-apple-ink-muted-80 space-y-1 text-[14px] leading-relaxed">
                      <li>Высота — до 50 см</li>
                      <li>Длина и ширина — не более 120 × 80 см</li>
                      <li>Вес одной упаковки — до 50 кг</li>
                    </ul>
                  </div>
                  <div className="grid gap-3 px-5 py-5 sm:grid-cols-[1.15fr_1fr]">
                    <div>
                      <p className="font-heading text-[16px] font-semibold">Крупногабаритные товары</p>
                      <p className="text-apple-ink-muted-48 mt-1 text-[13px]">Отдельное согласование хранения</p>
                    </div>
                    <ul className="text-apple-ink-muted-80 space-y-1 text-[14px] leading-relaxed">
                      <li>Высота — от 50 до 200 см</li>
                      <li>Разборные товары поставляются в коробке</li>
                      <li>Крупная бытовая техника рассматривается отдельно</li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="border-apple-hairline rounded-apple-md mt-5 flex gap-4 border border-dashed p-5">
                <PackageCheck className="text-apple-primary mt-0.5 size-5 shrink-0" aria-hidden="true" />
                <div>
                  <p className="text-[14px] font-semibold">Требование к упаковке</p>
                  <p className="text-apple-ink-muted-48 mt-1 text-[13px] leading-[1.6]">
                    Упаковка должна защищать товар при перевозке и хранении, иметь читаемую маркировку и не менять форму
                    товара в транспортном положении.
                  </p>
                </div>
              </div>
            </section>

            <section
              id="prohibited"
              className="border-apple-divider-soft scroll-mt-28 border-t py-14 sm:py-16"
              aria-labelledby="prohibited-title"
            >
              <SectionHeading
                id="prohibited-title"
                eyebrow="Безопасность площадки"
                title="Что нельзя продавать"
                description="Bugday не размещает товары, которые запрещены законом, опасны, имеют сомнительное происхождение или не соответствуют заявленному качеству."
              />
              <div className="grid gap-4 md:grid-cols-2">
                {prohibitedGroups.map((group) => (
                  <article key={group.title} className="bg-apple-canvas-parchment rounded-apple-md p-5 sm:p-6">
                    <PackageX className="text-apple-primary size-5" aria-hidden="true" />
                    <h3 className="font-heading mt-5 text-[18px] font-semibold">{group.title}</h3>
                    <ul className="mt-4 space-y-3">
                      {group.items.map((item) => (
                        <li key={item} className="text-apple-ink-muted-80 flex gap-3 text-[13px] leading-[1.6]">
                          <span className="bg-apple-ink-muted-48 mt-[9px] size-1 shrink-0 rounded-full" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
            </section>

            <section
              id="documents"
              className="border-apple-divider-soft scroll-mt-28 border-t py-14 sm:py-16"
              aria-labelledby="documents-title"
            >
              <SectionHeading
                id="documents-title"
                eyebrow="Предварительная проверка"
                title="Какие товары требуют документов"
                description="Для регулируемых категорий менеджер запросит документы до публикации. Точный комплект зависит от товара и действующих требований в Туркменистане."
              />
              <div className="border-apple-hairline rounded-apple-md overflow-hidden border">
                {documentCategories.map((category, index) => (
                  <div
                    key={category}
                    className="border-apple-divider-soft flex gap-4 border-b px-5 py-4 last:border-b-0 sm:px-6"
                  >
                    <span className="text-apple-primary flex size-7 shrink-0 items-center justify-center text-[12px] font-semibold">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <p className="text-apple-ink-muted-80 pt-1 text-[14px] leading-[1.55]">{category}</p>
                  </div>
                ))}
              </div>
              <div className="bg-apple-surface-tile-1 text-apple-on-dark rounded-apple-md mt-5 p-6">
                <div className="flex items-start gap-4">
                  <FileCheck2 className="text-apple-primary-on-dark mt-0.5 size-5 shrink-0" aria-hidden="true" />
                  <div>
                    <h3 className="font-heading text-[17px] font-semibold">Подготовьте подтверждения заранее</h3>
                    <p className="text-apple-body-muted mt-2 text-[13px] leading-[1.65]">
                      Это могут быть сертификаты соответствия, лицензии, декларации, инвойсы, документы о происхождении
                      и разрешение правообладателя. Отправьте копии менеджеру до создания карточек.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section
              id="expiry"
              className="border-apple-divider-soft scroll-mt-28 border-t py-14 sm:py-16"
              aria-labelledby="expiry-title"
            >
              <SectionHeading
                id="expiry-title"
                eyebrow="Качество товара"
                title="Срок годности и маркировка"
                description="Для продуктов, косметики, бытовой химии, средств гигиены и других товаров со сроком годности действуют дополнительные условия."
              />
              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  ['Не менее 60%', 'На момент приёмки должно оставаться не менее 60% общего срока годности.'],
                  ['Не менее 6 месяцев', 'Этот порог применяется в зависимости от категории и общего срока годности.'],
                  ['Заводская маркировка', 'Производитель, состав и срок годности должны быть видны и легко читаться.'],
                ].map(([title, description]) => (
                  <article key={title} className="bg-apple-canvas-parchment rounded-apple-md p-5">
                    <p className="font-heading text-apple-primary text-[19px] font-semibold">{title}</p>
                    <p className="text-apple-ink-muted-48 mt-2 text-[13px] leading-[1.6]">{description}</p>
                  </article>
                ))}
              </div>
              <p className="text-apple-ink-muted-80 border-apple-hairline mt-5 border-l-2 pl-4 text-[14px] leading-[1.65]">
                Товары без заводской упаковки, со стёртым, вырезанным или переклеенным сроком годности к поставке не
                принимаются.
              </p>
            </section>

            <section
              id="checklist"
              className="border-apple-divider-soft scroll-mt-28 border-t pt-14 sm:pt-16"
              aria-labelledby="checklist-title"
            >
              <SectionHeading
                id="checklist-title"
                eyebrow="Перед отправкой"
                title="Проверка готовности"
                description="Если все пункты выполнены, можно подавать заявку. Для спорной категории сначала свяжитесь с командой продавцов."
              />
              <div className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
                {checklist.map((item) => (
                  <div key={item} className="flex gap-3">
                    <span className="bg-apple-primary text-apple-on-primary mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full">
                      <Check className="size-3" aria-hidden="true" />
                    </span>
                    <p className="text-apple-ink-muted-80 text-[14px] leading-[1.6]">{item}</p>
                  </div>
                ))}
              </div>

              <div className="bg-apple-canvas-parchment rounded-apple-lg mt-10 grid gap-8 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center lg:p-10">
                <div>
                  <ShieldCheck className="text-apple-primary size-6" aria-hidden="true" />
                  <h2 className="font-heading mt-5 text-[26px] leading-tight font-semibold tracking-[-0.4px]">
                    Остались вопросы о категории?
                  </h2>
                  <p className="text-apple-ink-muted-48 mt-3 max-w-2xl text-[14px] leading-[1.65]">
                    Отправьте название товара, фотографии упаковки и имеющиеся документы. Контактные данные будут
                    добавлены перед запуском страницы.
                  </p>
                  <div className="mt-5 flex flex-col gap-2 text-[13px] sm:flex-row sm:gap-6">
                    <span className="flex items-center gap-2">
                      <Mail className="text-apple-primary size-4" aria-hidden="true" />
                      <span>[email продавцов]</span>
                    </span>
                    <span className="flex items-center gap-2">
                      <Store className="text-apple-primary size-4" aria-hidden="true" />
                      <span>[телефон / мессенджер]</span>
                    </span>
                  </div>
                </div>
                <Button asChild size="lg">
                  <Link href="/become-seller#seller-form">
                    Подать заявку
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </div>
            </section>
          </div>
        </div>
      </section>
    </main>
  )
}
