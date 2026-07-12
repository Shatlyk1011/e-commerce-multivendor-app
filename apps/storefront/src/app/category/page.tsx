"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { CategoryTreeNode } from "@/features/category/api/types";
import { useCategories } from "@/features/category/api/queries";

export default function CategoryRootPage() {
  const { data, isLoading } = useCategories({ parent_category_id: null });

  const categories = (data ?? []) as CategoryTreeNode[];

  return (
    <main className="min-h-screen bg-apple-canvas text-apple-ink antialiased">
      <div className="custom-container py-6">
        <h1 className="text-[28px] font-heading font-bold tracking-tight mb-6">
          Каталог
        </h1>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-32 animate-pulse rounded-apple-lg bg-apple-canvas-parchment border border-apple-hairline"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/category/${category.id}`}
                className="group flex flex-col p-4 rounded-apple-lg border border-apple-hairline bg-apple-canvas hover:border-apple-primary hover:shadow-sm transition-all duration-200"
              >
                <h2 className="text-[15px] font-semibold text-apple-ink group-hover:text-apple-primary transition-colors">
                  {category.name}
                </h2>
                {category.description && (
                  <p className="text-[12px] text-apple-ink-muted-48 mt-1 line-clamp-2">
                    {category.description}
                  </p>
                )}
                <div className="mt-auto pt-3 flex items-center justify-between">
                  {category.category_children && category.category_children.length > 0 ? (
                    <span className="text-[11px] text-apple-ink-muted-48">
                      {category.category_children.length} подкатегорий
                    </span>
                  ) : (
                    <span />
                  )}
                  <ChevronRight
                    className="size-4 text-apple-ink-muted-48 group-hover:text-apple-primary transition-colors"
                    strokeWidth={2.5}
                  />
                </div>
              </Link>
            ))}
          </div>
        )}

        {categories.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center py-20 text-apple-ink-muted-48">
            <span className="text-4xl mb-3">📂</span>
            <p className="text-[15px]">Категории не найдены</p>
          </div>
        )}
      </div>
    </main>
  );
}
