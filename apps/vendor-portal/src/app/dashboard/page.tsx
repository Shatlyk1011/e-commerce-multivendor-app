'use client'

export default function DashboardPage() {
  return (
    <main className="w-full p-8">
      <div className="max-w-2xl">
        <h1 className="text-apple-display-md text-apple-ink">Аналитика</h1>
        <p className="text-apple-body text-apple-ink-muted-48 mt-2">Здесь будет сводка по работе вашего магазина.</p>

        <section className="border-apple-hairline bg-apple-surface-pearl rounded-apple-md mt-8 border px-6 py-8">
          <p className="text-apple-body-strong text-apple-ink">Аналитика появится позже</p>
          <p className="text-apple-caption text-apple-ink-muted-48 mt-2">
            (добавить историю заказов, отзывы о магазине, статистику о товарах)
          </p>
        </section>
      </div>
    </main>
  )
}
