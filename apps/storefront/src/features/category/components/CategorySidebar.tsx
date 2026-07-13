"use client";

import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { findCategoryInTree, findCategoryPath } from "../utils";
import { CategoryTreeNode } from "../api/types";

interface CategorySidebarProps {
  categories: CategoryTreeNode[];
  selectedId?: string | null;
  onSelect: (category: CategoryTreeNode) => void;
}

export function CategorySidebar({
  categories,
  selectedId,
  onSelect,
}: CategorySidebarProps) {
  const selectedCategory = selectedId ? findCategoryInTree(categories, selectedId) : null;
  const path = selectedId ? findCategoryPath(categories, selectedId) : null;

  const hasSelection = path && path.length > 0;
  const immediateParent = hasSelection && path.length > 1 ? path[path.length - 2] : null;
  const siblings: CategoryTreeNode[] = hasSelection
    ? (immediateParent?.category_children ?? categories)
    : categories;

  return (
    <div className="w-full flex flex-col gap-6 select-none font-sans">
      {/* Category Section */}
      <div>
        <h3 className="text-[16px] font-heading font-semibold text-apple-ink mb-4">
          Категории
        </h3>

        <div className="flex flex-col gap-1.5">
          {hasSelection && (
            <>
              {/* Back to all categories */}
              <button
                onClick={() => {
                  onSelect({ id: "" } as CategoryTreeNode);
                }}
                className="w-full flex items-center gap-1.5 py-1 text-[13px] text-apple-ink-muted-48 hover:text-apple-ink transition-colors cursor-pointer group text-left"
              >
                <ChevronLeft className="size-3.5 text-apple-ink-muted-48 group-hover:text-apple-ink transition-colors" />
                <span>Все категории</span>
              </button>

              {/* Back to parents if any */}
              {path.map((parent, idx) => {
                if (idx === path.length - 1) return null;
                return (
                  <button
                    key={parent.id}
                    onClick={() => onSelect(parent)}
                    className="w-full flex items-center gap-1.5 py-1 text-[13px] text-apple-ink-muted-48 hover:text-apple-ink transition-colors cursor-pointer group text-left pl-2"
                  >
                    <ChevronLeft className="size-3.5 text-apple-ink-muted-48 group-hover:text-apple-ink transition-colors" />
                    <span>{parent.name}</span>
                  </button>
                );
              })}
            </>
          )}

          {/* List of active siblings/roots */}
          <div className={cn("flex flex-col gap-1 mt-1", hasSelection && "pl-4")}>
            {siblings.map((sibling) => {
              const isSelected = sibling.id === selectedId;
              if (isSelected) {
                return (
                  <div
                    key={sibling.id}
                    className="w-full text-left text-[13.5px] font-semibold text-apple-ink bg-apple-canvas-parchment rounded-apple-sm px-3 py-2 border border-apple-divider-soft"
                  >
                    {sibling.name}
                  </div>
                );
              }

              return (
                <button
                  key={sibling.id}
                  onClick={() => onSelect(sibling)}
                  className="w-full text-left text-[13px] text-apple-ink-muted-80 hover:text-apple-primary hover:pl-1 transition-all py-1.5 cursor-pointer font-normal"
                >
                  {sibling.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Price Filter Section */}
      <div className="border-t border-apple-divider-soft pt-5">
        <h3 className="text-[14px] font-heading font-semibold text-apple-ink mb-3">
          Цена, сум
        </h3>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[12px] text-apple-ink-muted-48 select-none">
              от
            </span>
            <input
              type="number"
              placeholder="0"
              className="w-full bg-apple-canvas border border-apple-hairline rounded-apple-sm pl-7 pr-2 py-1.5 text-[13px] text-apple-ink placeholder-apple-ink-muted-48 focus:outline-none focus:border-apple-primary transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
          <div className="relative flex-1">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[12px] text-apple-ink-muted-48 select-none">
              до
            </span>
            <input
              type="number"
              placeholder="100 000"
              className="w-full bg-apple-canvas border border-apple-hairline rounded-apple-sm pl-7 pr-2 py-1.5 text-[13px] text-apple-ink placeholder-apple-ink-muted-48 focus:outline-none focus:border-apple-primary transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
