import { ChevronRight } from "lucide-react"
import { ProductCard } from "@/features/home/components/ProductCard"

interface Product {
  id: number
  title: string
  price: string
  originalPrice: string | null
  installmentPrice: string
  rating: number
  reviewsCount: number
  badges: string[]
  color: string
}

const POPULAR_PRODUCTS: Product[] = [
  {
    id: 1,
    title: "Очиститель двигателя Axma Avtoproseries, 500 г",
    price: "27 000",
    originalPrice: null,
    installmentPrice: "1 912 сум/мес",
    rating: 4.7,
    reviewsCount: 511,
    badges: ["ГАРАНТИЯ НИЗКОЙ ЦЕНЫ"],
    color: "#fae8ff" // Soft pink-purple
  },
  {
    id: 2,
    title: "Подводка водостойкая для глаз Dip Eyeliner, чёрный, 5.1 мл",
    price: "37 990",
    originalPrice: "43 990",
    installmentPrice: "2 690 сум/мес",
    rating: 4.9,
    reviewsCount: 2114,
    badges: ["ОРИГИНАЛ"],
    color: "#f3f4f6" // Soft grey
  },
  {
    id: 3,
    title: "Nivea men ultra extreme, 50 мл",
    price: "31 990",
    originalPrice: "43 990",
    installmentPrice: "2 265 сум/мес",
    rating: 4.9,
    reviewsCount: 306,
    badges: ["ОРИГИНАЛ", "ГАРАНТИЯ НИЗКОЙ ЦЕНЫ"],
    color: "#e0e7ff" // Soft indigo
  },
  {
    id: 4,
    title: "Дезодорант-спрей для мужчин NIVEA MEN, невидимая защита для...",
    price: "35 990",
    originalPrice: "47 990",
    installmentPrice: "2 549 сум/мес",
    rating: 4.9,
    reviewsCount: 2170,
    badges: ["ОРИГИНАЛ"],
    color: "#e2e8f0" // Soft slate-grey
  },
  {
    id: 5,
    title: "Дезодорант-спрей для женщин Nivea Pearl Beauty, с экстрактом жемчуга",
    price: "34 990",
    originalPrice: "43 990",
    installmentPrice: "2 478 сум/мес",
    rating: 4.9,
    reviewsCount: 3266,
    badges: ["ОРИГИНАЛ", "ГАРАНТИЯ НИЗКОЙ ЦЕНЫ"],
    color: "#fdf2f8" // Soft rose-pink
  }
]

export default function Home() {
  return (
    <main className="min-h-screen bg-apple-canvas text-apple-ink antialiased px-4 py-8 max-w-[1240px] mx-auto">
      {/* Title Header Section */}
      <div className="flex items-center gap-2 mb-6 select-none group w-fit cursor-pointer">
        <h2 className="text-[22px] font-heading font-bold text-apple-ink tracking-tight hover:text-apple-primary transition-colors">
          Популярное
        </h2>
        <ChevronRight className="size-5.5 text-apple-ink-muted-48 group-hover:text-apple-primary transition-colors" strokeWidth={2.5} />
      </div>

      {/* Grid containing 5 items */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {POPULAR_PRODUCTS.map((product) => (
          <ProductCard key={product.id} {...product} />
        ))}
      </div>
    </main>
  )
}
