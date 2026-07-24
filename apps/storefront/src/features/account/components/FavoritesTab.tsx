'use client'

import { useState } from 'react'

import Link from 'next/link'

import { Heart, ShoppingBag, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface FavoriteItem {
  id: string
  handle: string
  title: string
  category: string
  price: number
  currency: string
  image: string
  inStock: boolean
}

const INITIAL_MOCK_FAVORITES: FavoriteItem[] = [
  {
    id: 'fav_1',
    handle: 'wireless-noise-canceling-headphones',
    title: 'Беспроводные наушники Pro Max Silver',
    category: 'Электроника',
    price: 3499,
    currency: 'TMT',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80',
    inStock: true,
  },
  {
    id: 'fav_2',
    handle: 'smart-fitness-watch-v2',
    title: 'Смарт-часы Ultra Sport Edition Black',
    category: 'Гаджеты',
    price: 1899,
    currency: 'TMT',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80',
    inStock: true,
  },
  {
    id: 'fav_3',
    handle: 'leather-laptop-backpack',
    title: 'Кожаный рюкзак для ноутбука Urban Craft',
    category: 'Аксессуары',
    price: 850,
    currency: 'TMT',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&q=80',
    inStock: false,
  },
]

export function FavoritesTab() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>(INITIAL_MOCK_FAVORITES)

  const handleRemove = (id: string, title: string) => {
    setFavorites((prev) => prev.filter((item) => item.id !== id))
    toast.success(`«${title}» удален из избранного`)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-apple-ink flex items-center gap-2 text-xl font-semibold tracking-[-0.28px]">
            <Heart className="h-5 w-5 fill-rose-500 text-rose-500" /> Избранные товары
          </h2>
          <p className="text-apple-ink-muted-48 text-apple-caption mt-0.5">
            Сохраненные товары для быстрых покупок ({favorites.length})
          </p>
        </div>
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
          {favorites.map((item) => (
            <Card
              key={item.id}
              className="group rounded-apple-lg border-apple-hairline bg-apple-canvas flex flex-col justify-between overflow-hidden border transition-all hover:border-neutral-300"
            >
              <CardContent className="space-y-3 p-4">
                {/* Image Container with Shadow */}
                <div className="rounded-apple-sm bg-apple-surface-pearl border-apple-hairline relative aspect-square w-full overflow-hidden border">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemove(item.id, item.title)}
                    className="border-apple-hairline absolute top-2.5 right-2.5 flex h-8 w-8 items-center justify-center rounded-full border bg-white/90 text-rose-500 shadow-sm backdrop-blur transition hover:scale-110 hover:bg-rose-50"
                    title="Удалить из избранного"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div>
                  <Badge variant="outline" className="text-apple-ink-muted-48 border-apple-hairline mb-1 text-[10px]">
                    {item.category}
                  </Badge>
                  <h3 className="text-apple-ink hover:text-apple-primary line-clamp-2 text-[14px] font-semibold transition-colors">
                    <Link href={`/product/${item.handle}`}>{item.title}</Link>
                  </h3>
                </div>

                <div className="border-apple-divider-soft flex items-center justify-between border-t pt-2">
                  <span className="text-apple-ink text-base font-bold">
                    {item.price} {item.currency}
                  </span>
                  {item.inStock ? (
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
                  disabled={!item.inStock}
                  className="bg-apple-primary hover:bg-apple-primary-focus w-full gap-1.5 rounded-full text-xs font-semibold text-white"
                >
                  <Link href={`/product/${item.handle}`}>
                    <ShoppingBag className="h-3.5 w-3.5" /> В магазин
                  </Link>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
