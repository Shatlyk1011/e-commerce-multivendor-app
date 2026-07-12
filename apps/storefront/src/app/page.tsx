"use client";

import { ChevronRight } from "lucide-react";
import { ProductCard } from "@/features/home/components/ProductCard";
import { useProducts } from "@/features/home/API";

export default function Home() {
  const { data, isLoading, isError } = useProducts({ limit: 12 });

  return (
    <main className="min-h-screen bg-apple-canvas text-apple-ink antialiased px-4 w-full custom-container py-8 ">
      {/* Title Header Section */}
      <div className="flex items-center gap-2 mb-6 select-none group w-fit cursor-pointer">
        <h2 className="text-[22px] font-heading font-bold text-apple-ink tracking-tight hover:text-apple-primary transition-colors">
          Популярное
        </h2>
        <ChevronRight className="size-5.5 text-apple-ink-muted-48 group-hover:text-apple-primary transition-colors" strokeWidth={2.5} />
      </div>

      {/* Loading state placeholders */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-80 animate-pulse rounded-apple-lg bg-apple-canvas-parchment border border-apple-hairline"
            />
          ))}
        </div>
      ) : isError ? (
        <p className="text-apple-ink-muted-48 text-sm">Не удалось загрузить товары.</p>
      ) : (
        <div className="grid grid-cols-5 gap-4 w-full ">
          {data?.products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}
        </div>
      )}
    </main>
  );
}
