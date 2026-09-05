'use client'

import Link from 'next/link'

import { Heart, ShoppingBag, Trash2 } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useCustomerFavorites, useDeleteCustomerFavorite } from '@/features/account/api/queries'

function formatPrice(amount: number) {
  return new Intl.NumberFormat('ru-RU').format(amount)
}

export function FavoritesTab() {
  const { data: favorites = [], isLoading, isError } = useCustomerFavorites()
  const removeFavorite = useDeleteCustomerFavorite()

  if (isLoading) {
    return <div className="text-apple-ink-muted-48 py-12 text-center text-sm">Загрузка избранных товаров…</div>
  }

  if (isError) {
    return (
      <div className="text-apple-ink-muted-48 py-12 text-center text-sm">Не удалось загрузить избранные товары.</div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-apple-ink flex items-center gap-2 text-xl font-semibold tracking-[-0.28px]">
          <Heart className="h-5 w-5 fill-rose-500 text-rose-500" /> Избранные товары
        </h2>
        <p className="text-apple-ink-muted-48 text-apple-caption mt-0.5">
          Сохраненные товары для быстрых покупок ({favorites.length})
        </p>
      </div>

      {favorites.length === 0 ? (
        <Card className="rounded-apple-lg border-apple-hairline bg-apple-canvas border p-12 text-center">
          <Heart className="mx-auto mb-3 h-12 w-12 text-neutral-300" />
          <h3 className="text-apple-ink text-base font-semibold">Список избранного пуст</h3>
          <p className="text-apple-ink-muted-48 text-apple-caption mt-1 mb-4">
            Добавляйте понравившиеся товары в избранное, нажав на иконку сердечка в каталоге.
          </p>
          <Button asChild className="bg-apple-primary rounded-full px-6 text-xs font-semibold text-white">
            <Link href="/">Перейти в каталог</Link>
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {favorites.map(({ id, product }) => {
            const variant =
              product.variants?.find((item) => item.calculated_price?.calculated_amount != null) ??
              product.variants?.[0]
            const amount = variant?.calculated_price?.calculated_amount
            const originalAmount = variant?.calculated_price?.original_amount
            const price = typeof amount === 'number' ? `${formatPrice(amount)} тмт` : 'Цена уточняется'
            const originalPrice =
              typeof amount === 'number' && typeof originalAmount === 'number' && originalAmount > amount
                ? `${formatPrice(originalAmount)} тмт`
                : null
            const inStock = variant ? variant.manage_inventory === false || (variant.inventory_quantity ?? 0) > 0 : true
            const category = product.categories?.[0]?.name

            return (
              <Card
                key={id}
                className="group rounded-apple-lg border-apple-hairline bg-apple-canvas flex flex-col overflow-hidden border"
              >
                <CardContent className="space-y-3 p-4">
                  <div className="rounded-apple-sm bg-apple-surface-pearl border-apple-hairline relative aspect-square w-full overflow-hidden border">
                    {product.thumbnail ? (
                      <img
                        src={product.thumbnail}
                        alt={product.title}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="h-full w-full bg-neutral-100" />
                    )}
                    <button
                      type="button"
                      onClick={() => removeFavorite.mutate(id)}
                      disabled={removeFavorite.isPending}
                      aria-label={`Удалить ${product.title} из избранного`}
                      className="border-apple-hairline absolute top-2.5 right-2.5 flex h-8 w-8 items-center justify-center rounded-full border bg-white/90 text-rose-500 shadow-sm backdrop-blur transition hover:scale-110 hover:bg-rose-50 disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div>
                    {category && (
                      <Badge
                        variant="outline"
                        className="text-apple-ink-muted-48 border-apple-hairline mb-1 text-[10px]"
                      >
                        {category}
                      </Badge>
                    )}
                    <h3 className="text-apple-ink hover:text-apple-primary line-clamp-2 text-[14px] font-semibold transition-colors">
                      <Link href={`/product/${product.handle}`}>{product.title}</Link>
                    </h3>
                  </div>
                  <div className="border-apple-divider-soft flex items-center justify-between border-t pt-2">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-apple-ink font-sans text-[16px] font-bold">{price}</span>
                      {originalPrice && (
                        <span className="text-apple-ink-muted-48 font-sans text-[13px] line-through">
                          {originalPrice}
                        </span>
                      )}
                    </div>
                    {inStock ? (
                      <Badge className="border-emerald-200 bg-emerald-50 text-[10px] text-emerald-700">В наличии</Badge>
                    ) : (
                      <Badge variant="outline" className="text-apple-ink-muted-48 border-apple-hairline text-[10px]">
                        Нет в наличии
                      </Badge>
                    )}
                  </div>
                </CardContent>
                <div className="p-4 pt-0">
                  <Button
                    asChild
                    disabled={!inStock}
                    className="bg-apple-primary hover:bg-apple-primary-focus w-full gap-1.5 rounded-full text-xs font-semibold text-white"
                  >
                    <Link href={`/product/${product.handle}`}>
                      <ShoppingBag className="h-3.5 w-3.5" /> В магазин
                    </Link>
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
