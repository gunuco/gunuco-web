import type { Category, CategoryAttributeSchema } from '@/types';

export function getParentCategories(categories: Category[]): Category[] {
  return categories
    .filter((c) => c.parentId === null)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export function getChildCategories(categories: Category[], parentId: string): Category[] {
  return categories
    .filter((c) => c.parentId === parentId)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export function getCategoryById(categories: Category[], id?: string): Category | undefined {
  if (!id) return undefined;
  return categories.find((c) => c.id === id);
}

export function getActiveParents(categories: Category[]): Category[] {
  return getParentCategories(categories).filter((c) => c.active);
}

export function catalogNavLabel(categories: Category[]): string {
  const active = getActiveParents(categories);
  if (active.length === 1) return `${active[0].name} Catalogue`;
  return 'Catalogue';
}

export function getAttributeSchema(category?: Category): CategoryAttributeSchema[] {
  return category?.attributeSchema ?? [];
}

export function resolveAttributeLabel(
  schema: CategoryAttributeSchema[],
  key: string,
  value: string | number | boolean | string[],
): string {
  const field = schema.find((f) => f.key === key);
  if (!field) return String(value);
  if (Array.isArray(value)) {
    return value
      .map((v) => field.options?.find((o) => o.value === String(v))?.label ?? String(v))
      .join(', ');
  }
  return field.options?.find((o) => o.value === String(value))?.label ?? String(value);
}

export function buildCategoryTree(categories: Category[]) {
  return getParentCategories(categories).map((parent) => ({
    ...parent,
    children: getChildCategories(categories, parent.id),
  }));
}

export function isDescendantOf(categories: Category[], categoryId: string, parentId: string): boolean {
  const node = getCategoryById(categories, categoryId);
  if (!node) return false;
  if (node.id === parentId || node.parentId === parentId) return true;
  return node.parentId ? isDescendantOf(categories, node.parentId, parentId) : false;
}
