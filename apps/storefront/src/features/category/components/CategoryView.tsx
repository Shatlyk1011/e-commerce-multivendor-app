"use client";
import { Fragment, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { ProductCard } from "@/features/home/components/ProductCard";
import { CategorySidebar } from "./CategorySidebar";
import Link from "next/link";
import {
  findCategoryInTree,
  findCategoryPath,
  getProductWord,
  formatPrice,
} from "../utils";
import { useCategories, useProductsByCategory } from "../api/queries";
import { CategoryTreeNode } from "../api/types";

const PAGE_SIZE = 20;

interface CategoryViewProps {
  categoryId?: string;
}

export function CategoryView({ categoryId }: CategoryViewProps) {
  const router = useRouter();
  const [page, setPage] = useState(0);
  const [priceRange, setPriceRange] = useState<{ min?: string; max?: string }>({});

  // Fetch all root categories with full tree
  const { data: categoriesData, isLoading: categoriesLoading } = useCategories({
    parent_category_id: null,
  });

  const categories = categoriesData ?? [];

  // Derive selected category from the full tree using props category ID
  const selectedCategory = useMemo(() => {
    if (!categoriesData || !categoryId) return null;
    return findCategoryInTree(categoriesData, categoryId);
  }, [categoriesData, categoryId]);

  // Fetch products for the derived category ID
  const { data: productsData, isLoading: productsLoading } = useProductsByCategory({
    limit: PAGE_SIZE,
    offset: page * PAGE_SIZE,
    category_id: selectedCategory?.id,
    min_price: priceRange.min ? Number(priceRange.min) : undefined,
    max_price: priceRange.max ? Number(priceRange.max) : undefined,
  });

  const products = productsData?.products ?? [];
  const totalCount = productsData?.count ?? 0;
  const hasMore = (page + 1) * PAGE_SIZE < totalCount;

  // Build the path from tree root down to selected category
  const categoryPath = useMemo(() => {
    if (!categoriesData || !categoryId) return [];
    return findCategoryPath(categoriesData, categoryId) ?? [];
  }, [categoriesData, categoryId]);

  const handleCategorySelect = (category: CategoryTreeNode) => {
    setPage(0);
    setPriceRange({});
    if (!category.id) {
      router.push("/category", { scroll: false });
    } else {
      router.push(`/category/${category.id}`, { scroll: false });
    }
  };

  const handlePriceChange = (min: string, max: string) => {
    setPage(0);
    setPriceRange({ min: min || undefined, max: max || undefined });
  };

  return (
    <main className="min-h-screen bg-apple-canvas text-apple-ink antialiased">
      <div className="custom-container py-6">
        
        {/* Breadcrumb Row */}
        <div className="flex items-center flex-wrap gap-1.5 mb-6 text-[13px] text-apple-ink-muted-48">
          <Link
            href="/"
            className="hover:text-apple-primary transition-colors cursor-pointer"
          >
            Главная
          </Link>
          <ChevronRight className="size-3.5 flex-shrink-0" strokeWidth={2.5} />
          
          <Link
            href="/category"
            className="hover:text-apple-primary transition-colors cursor-pointer"
          >
            Все категории
          </Link>

          {categoryPath.map((crumb, idx) => {
            const isLast = idx === categoryPath.length - 1;
            return (
              <Fragment key={crumb.id}>
                <ChevronRight className="size-3.5 flex-shrink-0" strokeWidth={2.5} />
                {isLast ? (
                  <span className="text-apple-ink font-semibold">{crumb.name}</span>
                ) : (
                  <Link
                    href={`/category/${crumb.id}`}
                    className="hover:text-apple-primary transition-colors cursor-pointer"
                  >
                    {crumb.name}
                  </Link>
                )}
              </Fragment>
            );
          })}
        </div>

        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="w-56 flex-shrink-0 hidden md:block">
            <div className="sticky top-4">
              {categoriesLoading ? (
                <div className="space-y-2 animate-pulse">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-7 rounded-apple-sm bg-apple-canvas-parchment"
                    />
                  ))}
                </div>
              ) : (
                <CategorySidebar
                  categories={categories}
                  selectedId={selectedCategory?.id}
                  onSelect={handleCategorySelect}
                  minPrice={priceRange.min}
                  maxPrice={priceRange.max}
                  onPriceChange={handlePriceChange}
                />
              )}
            </div>
          </aside>

          {/* Product Grid & Main Area */}
          <div className="flex-1 min-w-0">
            {/* Page Title */}
            <h1 className="text-[28px] font-heading font-bold tracking-tight text-apple-ink">
              {selectedCategory?.name ?? "Каталог"}
            </h1>

            {/* Total Count */}
            {!productsLoading && products.length > 0 && (
              <p className="text-[13px] text-apple-ink-muted-48 mt-1 mb-4 select-none">
                {formatPrice(totalCount)} {getProductWord(totalCount)}
              </p>
            )}

            {/* Horizontal Subcategory Chips */}
            {/* {selectedCategory?.category_children && selectedCategory.category_children.length > 0 && (
              <div className="flex gap-2 overflow-x-auto scrollbar-hide py-2 mb-6 -mx-4 px-4 md:mx-0 md:px-0">
                {selectedCategory.category_children.map((child) => (
                  <Link
                    key={child.id}
                    href={`/category/${child.id}`}
                    className="bg-apple-canvas-parchment text-apple-ink-muted-80 hover:bg-apple-hairline/60 hover:text-apple-ink px-4 py-2 text-[13px] font-normal rounded-apple-sm transition-all cursor-pointer whitespace-nowrap border border-apple-divider-soft"
                  >
                    {child.name}12123123
                  </Link>
                ))}
              </div>
            )} */}

            {/* Sort Dropdown */}
            {!productsLoading && products.length > 0 && (
              <div className="flex items-center gap-1.5 text-[13px] text-apple-ink-muted-80 font-normal mb-6 select-none">
                <span>Сначала показывать:</span>
                <button className="font-semibold text-apple-ink hover:text-apple-primary transition-colors cursor-pointer flex items-center gap-0.5 focus:outline-none">
                  Популярные
                  <svg className="size-3.5 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>
              </div>
            )}

            {/* Content States */}
            {productsLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                  <div
                    key={i}
                    className="h-80 animate-pulse rounded-apple-lg bg-apple-canvas-parchment border border-apple-hairline"
                  />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-apple-ink-muted-48">
                <span className="text-4xl mb-3">📦</span>
                <p className="text-[15px]">Товары не найдены</p>
                <p className="text-[13px] mt-1">
                  {selectedCategory
                    ? "В этой категории пока нет товаров"
                    : "Выберите категорию слева"}
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {totalCount > PAGE_SIZE && (
                  <div className="flex items-center justify-center gap-3 mt-8">
                    <button
                      onClick={() => setPage((p) => Math.max(0, p - 1))}
                      disabled={page === 0}
                      className="px-4 py-2 rounded-apple-sm border border-apple-hairline text-[13px] font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-apple-canvas-parchment transition-colors cursor-pointer"
                    >
                      Назад
                    </button>
                    <span className="text-[13px] text-apple-ink-muted-48">
                      {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, totalCount)} из{" "}
                      {totalCount}
                    </span>
                    <button
                      onClick={() => setPage((p) => p + 1)}
                      disabled={!hasMore}
                      className="px-4 py-2 rounded-apple-sm border border-apple-hairline text-[13px] font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-apple-canvas-parchment transition-colors cursor-pointer"
                    >
                      Далее
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
