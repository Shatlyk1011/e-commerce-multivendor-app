import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

const FOOTER_COLUMNS = [
  {
    title: 'О нас',
    links: [
      { label: 'Пункты выдачи', href: '/pickup-points' },
      { label: 'Вакансии', href: '#' },
    ],
  },
  {
    title: 'Пользователям',
    links: [
      { label: 'Связаться с нами', href: '#' },
      { label: 'Вопросы и ответы', href: '/faq' },
    ],
  },
  {
    title: 'Для предпринимателей',
    links: [
      { label: 'Продавайте с нами', href: '/become-seller' },
      { label: 'Вход для продавцов', href: '#' },
      { label: 'Открыть пункт выдачи', href: '#' },
    ],
  },
]

export function Footer() {
  return (
    <footer className="bg-apple-canvas-parchment text-apple-ink-muted-80 border-apple-divider-soft mt-auto w-full border-t py-12">
      <div className="mx-auto max-w-[1240px] px-4">
        {/* LINK COLUMNS GRID */}
        <div className="grid grid-cols-1 gap-8 font-sans md:grid-cols-2 lg:grid-cols-4">
          {/* Columns 1-3 */}
          {FOOTER_COLUMNS.map((column, idx) => (
            <div key={idx} className="flex flex-col">
              <h4 className="font-heading text-apple-ink mb-3 text-[12px] leading-[1.29] font-semibold tracking-wider uppercase">
                {column.title}
              </h4>
              <div className="text-apple-ink-muted-80 flex flex-col text-[12px] leading-[2.2] font-normal">
                {column.links.map((link, linkIdx) => (
                  <Link key={linkIdx} href={link.href} className="hover:text-apple-primary w-fit transition-colors">
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}

          {/* Column 4: Скачать приложение */}
          <div className="flex flex-col gap-4">
            <h4 className="font-heading text-apple-ink mb-2 text-[13px] leading-[1.29] font-semibold tracking-wider uppercase">
              Скачать приложение
            </h4>
            <div className="flex flex-row flex-wrap items-center gap-3">
              {/* App Store button using shadcn Button */}
              <Button
                variant="dark"
                asChild
                className="hover:bg-apple-ink/90 inline-flex h-10 cursor-pointer items-center gap-2 rounded-[8px] px-3 py-1.5 shadow-xs transition-all active:scale-95"
              >
                <a href="#">
                  <svg className="h-4 w-4 fill-white" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.21.67-2.93 1.49-.62.69-1.16 1.84-1.01 2.96 1.12.09 2.27-.57 2.95-1.39z" />
                  </svg>
                  <div className="text-left leading-none">
                    <span className="block text-[8px] tracking-wider text-neutral-300 uppercase">Загрузите в</span>
                    <span className="mt-0.5 block font-sans text-[11px] font-semibold text-white">App Store</span>
                  </div>
                </a>
              </Button>

              {/* Google Play button using shadcn Button */}
              <Button
                variant="dark"
                asChild
                className="hover:bg-apple-ink/90 inline-flex h-10 cursor-pointer items-center gap-2 rounded-[8px] px-3 py-1.5 shadow-xs transition-all active:scale-95"
              >
                <a href="#">
                  <svg className="h-4 w-4 fill-white" viewBox="0 0 24 24">
                    <path d="M3 5.277c0-.987.77-1.777 1.745-1.777.29 0 .567.072.813.2l12.837 7.426c.49.283.805.812.805 1.386s-.315 1.103-.805 1.386l-12.837 7.426a1.642 1.642 0 0 1-.813.2c-.975 0-1.745-.79-1.745-1.777V5.277z" />
                  </svg>
                  <div className="text-left leading-none">
                    <span className="block text-[8px] tracking-wider text-neutral-300 uppercase">Доступно в</span>
                    <span className="mt-0.5 block font-sans text-[11px] font-semibold text-white">Google Play</span>
                  </div>
                </a>
              </Button>
            </div>
          </div>
        </div>

        {/* BOTTOM DIVIDER */}
        <Separator className="bg-apple-divider-soft my-6" />

        {/* BOTTOM LEGAL ROW */}
        <div className="text-apple-ink-muted-48 flex flex-col items-start justify-between gap-4 font-sans text-[12px] font-normal lg:flex-row lg:items-center">
          {/* Legal Links */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
            <Link href="#" className="hover:text-apple-primary transition-colors">
              Соглашение о конфиденциальности
            </Link>
            <Link href="#" className="hover:text-apple-primary transition-colors">
              Пользовательское соглашение
            </Link>
            <Link href="#" className="hover:text-apple-primary transition-colors">
              Положение по обработке персональных данных
            </Link>
          </div>

          {/* Copyright details */}
          <div className="select-text">© 2026 Bugday</div>
        </div>
      </div>
    </footer>
  )
}
