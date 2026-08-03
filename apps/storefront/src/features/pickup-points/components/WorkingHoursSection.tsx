'use client'

import { cn } from '@/lib/utils'

import { PICKUP_STEPS, WORKING_HOURS } from '../data/working-hours'
import { getTodayStatus, useNow } from '../lib/working-hours'

export function WorkingHoursSection() {
  const now = useNow()
  const { statusText, isOpen, todayIndex } = getTodayStatus(now)
  const timeString = now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })

  return (
    <section className="bg-apple-surface-tile-1 relative py-16 max-md:py-10">
      <div className="mx-auto flex max-w-4xl gap-20 px-6">
        {/* Working hours table */}
        <div className="flex-1">
          <h2 className="text-apple-tagline mb-4 text-white">Часы работы</h2>

          {/* Current time + open/closed status */}
          <div className="mb-4 flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <span className="text-apple-body-strong text-white tabular-nums">{timeString}</span>
              <span
                className={cn(
                  'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium',
                  isOpen ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400',
                )}
              >
                <span className={cn('h-1.5 w-1.5 rounded-full', isOpen ? 'bg-green-400' : 'bg-red-400')} />
                {isOpen ? 'Открыто' : 'Закрыто'}
              </span>
            </div>
            {statusText && <p className="text-[12px] text-[#8a8a8e]">{statusText}</p>}
          </div>

          <div className="flex flex-col divide-y divide-white/10">
            {WORKING_HOURS.map(({ day, hours, open }, idx) => {
              const isToday = idx === todayIndex
              return (
                <div key={day} className={cn('flex items-center justify-between py-1.5', isToday && 'relative')}>
                  {/* Today indicator bar */}
                  {isToday && (
                    <span className="bg-apple-primary-on-dark absolute top-1/2 -left-2 h-4 w-0.5 -translate-y-1/2 rounded-full" />
                  )}
                  <span className={cn('text-apple-caption', isToday ? 'font-semibold text-white' : 'text-[#ccc]!')}>
                    {day}
                  </span>
                  <span
                    className={cn(
                      'text-apple-caption-strong tabular-nums',
                      open ? (isToday ? 'text-white' : 'text-[#ccc]!') : 'text-apple-ink-muted-48',
                    )}
                  >
                    {hours}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* How pickup works */}
        <div className="flex flex-1 flex-col gap-6 text-white">
          <div>
            <h2 className="text-apple-tagline mb-4">Как получить заказ</h2>
            <div className="flex flex-col gap-5">
              {PICKUP_STEPS.map(({ step, title, body }) => (
                <div key={step} className="text-apple-caption-strong flex gap-3">
                  <p className="text-apple-primary-on-dark w-6 shrink-0">{step}</p>
                  <div>
                    <h3 className="mb-0.5 text-white">{title}</h3>
                    <p className="text-apple-caption text-[#ccc]!">{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="text-apple-caption-strong rounded-apple-md bg-white/5 px-6 py-4">
            <h3 className="text-apple-body mb-1.5 font-bold text-white!">Нужна доставка? </h3>
            <p className="text-[#ccc]!">Доставим в удобное для Вас время!</p>
          </div>
        </div>
      </div>
    </section>
  )
}
