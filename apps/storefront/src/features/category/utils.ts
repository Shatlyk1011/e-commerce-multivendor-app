import { CategoryTreeNode } from "./api";

// Helper to find a category by ID in the tree
export function findCategoryInTree(categories: CategoryTreeNode[], id: string): CategoryTreeNode | null {
  for (const cat of categories) {
    if (cat.id === id) return cat;
    if (cat.category_children && cat.category_children.length > 0) {
      const found = findCategoryInTree(cat.category_children, id);
      if (found) return found;
    }
  }
  return null;
}

// Helper to find the path of categories from root to the target category
export function findCategoryPath(
  categories: CategoryTreeNode[],
  targetId: string,
  currentPath: CategoryTreeNode[] = []
): CategoryTreeNode[] | null {
  for (const cat of categories) {
    const path = [...currentPath, cat];
    if (cat.id === targetId) {
      return path;
    }
    if (cat.category_children && cat.category_children.length > 0) {
      const result = findCategoryPath(cat.category_children, targetId, path);
      if (result) return result;
    }
  }
  return null;
}

// Helper for Russian pluralization of products count
export function getProductWord(count: number) {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod100 >= 11 && mod100 <= 19) {
    return "товаров";
  }
  if (mod10 === 1) {
    return "товар";
  }
  if (mod10 >= 2 && mod10 <= 4) {
    return "товара";
  }
  return "товаров";
}

// Helper to format large numbers with space separators
export function formatPrice(amount: number) {
  return new Intl.NumberFormat("ru-RU").format(amount);
}
