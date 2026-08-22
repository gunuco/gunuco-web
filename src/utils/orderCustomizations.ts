import type { Category, Order, OrderItem } from '@/types';
import { getAttributeSchema, getCategoryById, resolveAttributeLabel } from '@/utils/category';

function itemCustomizations(item: OrderItem, categories: Category[]): string[] {
  const category =
    getCategoryById(categories, item.subcategoryId) ?? getCategoryById(categories, item.categoryId);
  const schema = getAttributeSchema(category);
  const attrs = Object.entries(item.attributes ?? {}).flatMap(([key, value]) => {
    if (value === '' || value === null || value === undefined) return [];
    if (Array.isArray(value) && value.length === 0) return [];
    return [resolveAttributeLabel(schema, key, value)];
  });
  const addOns = (item.addOns ?? []).map((addon) => addon.name);
  return [...attrs, ...addOns];
}

/** Attributes + add-ons for an order. Empty string when the customer chose nothing extra. */
export function formatOrderCustomizations(order: Order, categories: Category[]): string {
  return order.items.flatMap((item) => itemCustomizations(item, categories)).join(' · ');
}
