import Link from 'next/link'

import { ArrowLeft, House, Search } from 'lucide-react'

import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <main className="bg-apple-canvas relative isolate flex min-h-[calc(100vh-13rem)] items-center overflow-hidden px-4 py-16 sm:px-6 lg:px-8">
      <div className="not-found-gradient pointer-events-none absolute inset-0 -z-10" aria-hidden="true" />
      <div
        className="pointer-events-none absolute inset-0 -z-10 [background-image:linear-gradient(to_right,rgb(29_29_31_/_0.045)_1px,transparent_1px),linear-gradient(to_bottom,rgb(29_29_31_/_0.045)_1px,transparent_1px)] [background-size:32px_32px] opacity-45"
        aria-hidden="true"
      />

      <section className="mx-auto w-full max-w-3xl text-center" aria-labelledby="not-found-title">
        <p className="text-apple-primary mb-5 text-[13px] font-semibold tracking-[0.18em] uppercase">Ошибка 404</p>
        <div className="mb-2 select-none" aria-hidden="true">
          <span className="not-found-number font-heading text-[clamp(7rem,25vw,15rem)] leading-[0.8] font-semibold tracking-[-0.1em]">
            404
          </span>
        </div>
        <h1
          id="not-found-title"
          className="font-heading text-apple-ink mx-auto max-w-xl text-3xl leading-tight font-semibold tracking-[-0.7px] text-balance sm:text-[40px]"
        >
          Эта страница потерялась
        </h1>
        <p className="text-apple-ink-muted-48 mx-auto mt-4 max-w-md text-[17px] leading-[1.55] tracking-[-0.374px] text-pretty">
          Возможно, ссылка устарела или страница была перемещена. Попробуйте начать поиск с главной.
        </p>

        <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/">
              <House className="size-4" aria-hidden="true" />
              На главную
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/search">
              <Search className="size-4" aria-hidden="true" />
              Найти товар
            </Link>
          </Button>
        </div>

        <Button asChild variant="link" size="sm" className="mt-5">
          <Link href="/category">
            <ArrowLeft className="size-3.5" aria-hidden="true" />
            Открыть каталог
          </Link>
        </Button>
      </section>
    </main>
  )
}
