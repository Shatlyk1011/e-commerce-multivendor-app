import { BellRing, PackageCheck, SearchCheck, ShoppingBag } from 'lucide-react'

import { PICKUP_STEPS } from '../data/working-hours'

const stepIcons = [ShoppingBag, BellRing, PackageCheck]

export function WorkingHoursSection() {
  return (
    <section className="bg-apple-surface-tile-1 text-apple-on-dark px-4 py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-[1120px]">
        <div className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20">
          <div>
            <p className="text-apple-primary-on-dark text-[13px] font-semibold tracking-wide uppercase">
              Получение заказа
            </p>
            <h2 className="font-heading mt-3 max-w-md text-[32px] leading-tight font-semibold tracking-[-0.6px] sm:text-[40px]">
              Три шага — и заказ у вас
            </h2>
            <p className="text-apple-body-muted mt-4 max-w-md text-[17px] leading-[1.55] tracking-[-0.374px]">
              Часы работы отличаются в каждом пункте. Проверьте их в карточке перед поездкой.
            </p>
          </div>

          <ol className="rounded-apple-lg grid gap-px overflow-hidden border border-white/10 bg-white/10 sm:grid-cols-3">
            {PICKUP_STEPS.map(({ step, title, body }, index) => {
              const Icon = stepIcons[index] ?? PackageCheck

              return (
                <li key={step} className="bg-apple-surface-tile-1 p-5 sm:min-h-[230px] sm:p-6">
                  <div className="flex items-center justify-between">
                    <span className="text-apple-primary-on-dark text-[12px] font-semibold">{step}</span>
                    <Icon className="text-apple-body-muted size-5" aria-hidden="true" />
                  </div>
                  <h3 className="mt-12 text-[17px] font-semibold tracking-tight sm:mt-16">{title}</h3>
                  <p className="text-apple-body-muted mt-2 text-[14px] leading-relaxed">{body}</p>
                </li>
              )
            })}
          </ol>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-white/15 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <SearchCheck className="text-apple-primary-on-dark mt-0.5 size-5 shrink-0" aria-hidden="true" />
            <div>
              <h3 className="text-[15px] font-semibold">Проверьте товар до выхода из пункта</h3>
              <p className="text-apple-body-muted mt-1 max-w-2xl text-[13px] leading-relaxed">
                Осмотрите товар и комплектацию на месте. Если заметили проблему, сразу сообщите сотруднику пункта
                выдачи.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
