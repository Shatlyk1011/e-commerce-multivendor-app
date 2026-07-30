import type { Metadata } from 'next'

import { Briefcase, Building2, ChevronDown, MapPin, TrendingUp, User, Users, Warehouse } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Стать продавцом на Uzum Market',
  description:
    'Присоединяйтесь к Uzum Market в Туркменистане. Продавайте товары миллионам покупателей с быстрой доставкой и поддержкой.',
}

const VENDOR_PORTAL_URL = process.env.NEXT_PUBLIC_VENDOR_PORTAL_URL || 'http://localhost:3001'

export default function BecomeVendorPage() {
  return (
    <div className="bg-apple-canvas text-apple-ink antialiased">
      {/* Hero Section */}
      <section className="bg-apple-canvas-parchment py-24 max-sm:py-16">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <span className="text-apple-tagline text-apple-primary mb-4 block tracking-wider uppercase">
            Uzum Market Sellers
          </span>
          <h1 className="text-apple-hero-display text-apple-ink mb-6 font-bold tracking-tight max-lg:text-5xl max-md:text-4xl max-sm:text-3xl">
            Продавайте по всему Туркменистану на Uzum Market!
          </h1>
          <p className="text-apple-lead text-apple-ink-muted-48 mx-auto mb-10 max-w-2xl max-sm:text-lg">
            С нами уже тысячи продавцов. Присоединяйтесь — и получайте доступ к миллионам покупателей по всей стране.
          </p>
          <a
            href={`${VENDOR_PORTAL_URL}/signup`}
            className="rounded-apple-pill bg-apple-primary text-apple-on-primary hover:bg-apple-primary-focus inline-flex h-14 items-center justify-center px-8 text-lg font-medium transition-all duration-100 active:scale-95"
            id="cta-hero-register"
          >
            Стать продавцом
          </a>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-apple-canvas py-24 max-sm:py-16">
        <div className="custom-container px-4">
          <h2 className="text-apple-display-lg text-apple-ink mb-16 text-center max-md:text-3xl max-sm:text-2xl">
            Продавать на Uzum Market — это просто!
          </h2>
          <div className="grid grid-cols-3 gap-6 max-lg:grid-cols-2 max-sm:grid-cols-1">
            {/* Benefit 1 */}
            <div className="bg-apple-canvas border-apple-hairline rounded-apple-lg hover:border-apple-ink-muted-48 flex flex-col items-start border p-8 transition-colors">
              <div className="bg-apple-canvas-parchment rounded-apple-md mb-6 p-4">
                <Users className="text-apple-primary h-8 w-8" />
              </div>
              <h3 className="text-apple-body-strong mb-3 text-xl">Привлекаем клиентов</h3>
              <p className="text-apple-body text-apple-ink-muted-48">
                Забудьте о расходах на рекламу — на Uzum Market покупатели уже ищут ваш товар.
              </p>
            </div>

            {/* Benefit 2 */}
            <div className="bg-apple-canvas border-apple-hairline rounded-apple-lg hover:border-apple-ink-muted-48 flex flex-col items-start border p-8 transition-colors">
              <div className="bg-apple-canvas-parchment rounded-apple-md mb-6 p-4">
                <TrendingUp className="text-apple-primary h-8 w-8" />
              </div>
              <h3 className="text-apple-body-strong mb-3 text-xl">Помогаем с продвижением</h3>
              <p className="text-apple-body text-apple-ink-muted-48">
                Акции, скидки, размещение в топе — делаем ваши товары заметнее и выгоднее.
              </p>
            </div>

            {/* Benefit 3 */}
            <div className="bg-apple-canvas border-apple-hairline rounded-apple-lg hover:border-apple-ink-muted-48 flex flex-col items-start border p-8 transition-colors">
              <div className="bg-apple-canvas-parchment rounded-apple-md mb-6 p-4">
                <MapPin className="text-apple-primary h-8 w-8" />
              </div>
              <h3 className="text-apple-body-strong mb-3 text-xl">Работаем по всей стране</h3>
              <p className="text-apple-body text-apple-ink-muted-48">
                Зона покрытия Uzum Market постоянно расширяется, гарантируя быструю доставку в любые регионы.
              </p>
            </div>

            {/* Benefit 4 */}
            <div className="bg-apple-canvas border-apple-hairline rounded-apple-lg hover:border-apple-ink-muted-48 flex flex-col items-start border p-8 transition-colors">
              <div className="bg-apple-canvas-parchment rounded-apple-md mb-6 p-4">
                <Warehouse className="text-apple-primary h-8 w-8" />
              </div>
              <h3 className="text-apple-body-strong mb-3 text-xl">Храним ваши товары</h3>
              <p className="text-apple-body text-apple-ink-muted-48">
                Современный складской логистический комплекс — бережно сохранит все ваши товары.
              </p>
            </div>

            {/* Benefit 5 */}
            <div className="bg-apple-canvas border-apple-hairline rounded-apple-lg hover:border-apple-ink-muted-48 flex flex-col items-start border p-8 transition-colors">
              <div className="bg-apple-canvas-parchment rounded-apple-md mb-6 p-4">
                <Briefcase className="text-apple-primary h-8 w-8" />
              </div>
              <h3 className="text-apple-body-strong mb-3 text-xl">Помощь в подготовке</h3>
              <p className="text-apple-body text-apple-ink-muted-48">
                Профессионально сфотографируем и упакуем, чтобы сберечь ваше драгоценное время для бизнеса.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Onboarding Path Section */}
      <section className="bg-apple-canvas-parchment py-24 max-sm:py-16">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="text-apple-display-lg text-apple-ink mb-16 text-center max-md:text-3xl max-sm:text-2xl">
            С чего начать?
          </h2>
          <div className="grid grid-cols-2 gap-8 max-sm:grid-cols-1">
            {/* Step 1 */}
            <div className="bg-apple-canvas border-apple-hairline rounded-apple-lg relative flex flex-col items-start border p-8">
              <span className="text-apple-hero-display text-apple-primary absolute top-4 right-6 font-bold opacity-25 select-none">
                01
              </span>
              <h3 className="text-apple-body-strong mt-4 mb-3 text-xl">Зарегистрируйте бизнес</h3>
              <p className="text-apple-body text-apple-ink-muted-48">
                Откройте ООО, ИП или оформите самозанятость, если у вас ещё нет зарегистрированного бизнеса.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-apple-canvas border-apple-hairline rounded-apple-lg relative flex flex-col items-start border p-8">
              <span className="text-apple-hero-display text-apple-primary absolute top-4 right-6 font-bold opacity-25 select-none">
                02
              </span>
              <h3 className="text-apple-body-strong mt-4 mb-3 text-xl">Зарегистрируйтесь на Sellers</h3>
              <p className="text-apple-body text-apple-ink-muted-48">
                Создайте аккаунт, заполните простую форму, и можно начинать зарабатывать вместе с нами.
              </p>
            </div>
          </div>
          <div className="mt-12 text-center">
            <a
              href={`${VENDOR_PORTAL_URL}/signup`}
              className="rounded-apple-pill bg-apple-primary text-apple-on-primary hover:bg-apple-primary-focus inline-flex h-12 items-center justify-center px-6 text-base font-medium transition-all duration-100 active:scale-95"
              id="cta-steps-register"
            >
              Зарегистрироваться
            </a>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-apple-canvas py-24 max-sm:py-16">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="text-apple-display-lg text-apple-ink mb-12 text-center max-md:text-3xl max-sm:text-2xl">
            Часто задаваемые вопросы
          </h2>
          <div className="border-apple-hairline border-t">
            {/* FAQ 1 */}
            <details className="group border-apple-hairline border-b py-6" id="faq-documents">
              <summary className="text-apple-body-strong hover:text-apple-primary flex cursor-pointer list-none items-center justify-between text-lg transition-colors select-none">
                <span>Какие документы нужны для регистрации?</span>
                <ChevronDown className="text-apple-ink-muted-48 h-5 w-5 transition-transform duration-200 group-open:rotate-180" />
              </summary>
              <div className="text-apple-body text-apple-ink-muted-48 mt-4 space-y-4 leading-relaxed">
                <p>Набор документов зависит от выбранного типа регистрации на площадке.</p>
                <div className="grid grid-cols-3 gap-4 pt-2 max-sm:grid-cols-1">
                  <div className="bg-apple-canvas-parchment rounded-apple-sm border-apple-hairline border p-4">
                    <div className="text-apple-body-strong text-apple-ink mb-2 flex items-center gap-2">
                      <Briefcase className="text-apple-primary h-4 w-4" />
                      <span>Для ИП:</span>
                    </div>
                    <ul className="list-disc space-y-1 pl-4 text-sm">
                      <li>Свидетельство о регистрации ИП</li>
                      <li>Паспорт</li>
                    </ul>
                  </div>
                  <div className="bg-apple-canvas-parchment rounded-apple-sm border-apple-hairline border p-4">
                    <div className="text-apple-body-strong text-apple-ink mb-2 flex items-center gap-2">
                      <Building2 className="text-apple-primary h-4 w-4" />
                      <span>Для ООО:</span>
                    </div>
                    <ul className="list-disc space-y-1 pl-4 text-sm">
                      <li>Свидетельство о регистрации юр. лица</li>
                      <li>Приказ о назначении директора</li>
                      <li>Паспорт директора</li>
                    </ul>
                  </div>
                  <div className="bg-apple-canvas-parchment rounded-apple-sm border-apple-hairline border p-4">
                    <div className="text-apple-body-strong text-apple-ink mb-2 flex items-center gap-2">
                      <User className="text-apple-primary h-4 w-4" />
                      <span>Для самозанятых:</span>
                    </div>
                    <ul className="list-disc space-y-1 pl-4 text-sm">
                      <li>Справка о регистрации</li>
                      <li>Паспорт</li>
                    </ul>
                  </div>
                </div>
              </div>
            </details>

            {/* FAQ 2 */}
            <details className="group border-apple-hairline border-b py-6" id="faq-commission">
              <summary className="text-apple-body-strong hover:text-apple-primary flex cursor-pointer list-none items-center justify-between text-lg transition-colors select-none">
                <span>Какая комиссия на Uzum Market?</span>
                <ChevronDown className="text-apple-ink-muted-48 h-5 w-5 transition-transform duration-200 group-open:rotate-180" />
              </summary>
              <div className="text-apple-body text-apple-ink-muted-48 mt-4 leading-relaxed">
                <p>
                  Комиссия зависит от категории товара и его габаритов. Ознакомиться с тарифами маркетплейса можно в
                  справочном руководстве в личном кабинете продавца.
                </p>
              </div>
            </details>

            {/* FAQ 3 */}
            <details className="group border-apple-hairline border-b py-6" id="faq-warehouse">
              <summary className="text-apple-body-strong hover:text-apple-primary flex cursor-pointer list-none items-center justify-between text-lg transition-colors select-none">
                <span>Нужно ли сдавать товары на склад?</span>
                <ChevronDown className="text-apple-ink-muted-48 h-5 w-5 transition-transform duration-200 group-open:rotate-180" />
              </summary>
              <div className="text-apple-body text-apple-ink-muted-48 mt-4 space-y-3 leading-relaxed">
                <p>Это зависит от схемы работы — сейчас партнёры Uzum Market могут выбрать:</p>
                <ul className="list-disc space-y-2 pl-5">
                  <li>
                    <strong className="text-apple-ink">FBO (Fulfillment by Operator)</strong> — торговля со склада
                    маркетплейса. Мы полностью берем на себя хранение, упаковку и доставку ваших товаров.
                  </li>
                  <li>
                    <strong className="text-apple-ink">FBS (Fulfillment by Seller)</strong> — торговля со склада
                    продавца. Вы храните товары на своем складе и передаете их нам для доставки покупателю при
                    поступлении заказа.
                  </li>
                </ul>
              </div>
            </details>

            {/* FAQ 4 */}
            <details className="group border-apple-hairline border-b py-6" id="faq-prohibited">
              <summary className="text-apple-body-strong hover:text-apple-primary flex cursor-pointer list-none items-center justify-between text-lg transition-colors select-none">
                <span>Можно ли продавать товары 18+?</span>
                <ChevronDown className="text-apple-ink-muted-48 h-5 w-5 transition-transform duration-200 group-open:rotate-180" />
              </summary>
              <div className="text-apple-body text-apple-ink-muted-48 mt-4 leading-relaxed">
                <p>Продажа товаров данной категории строго запрещена на Uzum Market.</p>
              </div>
            </details>
          </div>
        </div>
      </section>
    </div>
  )
}
