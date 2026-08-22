import type {
  Category,
  CategoryAttributeSchema,
  CustomizationPriceGroup,
  CustomizationSwitch,
  PriceTier,
  PricingModel,
  Product,
} from '@/types';
import { getAttributeSchema, getCategoryById } from '@/utils/category';

const VARIANT_KEYS = new Set(['weightKg', 'packSize', 'size', 'tiers']);

const DEFAULT_EXTRAS: Record<string, Record<string, number>> = {
  sugarType: { sugar_free: 60, jaggery: 40, brown: 20 },
  flourType: { almond: 80, gluten_free: 90, whole_wheat: 20 },
  finish: { gold_leaf: 199, fresh_bloom: 149, mirror: 80, ganache: 0 },
  eggType: { egg: 0, eggless: 0 },
};

const MATRIX_TO_SCHEMA: Record<string, string[]> = {
  flavour: ['flavour'],
  egg: ['eggType'],
  sweetener: ['sugarType'],
  flour: ['flourType'],
  size: ['weightKg', 'packSize', 'size'],
};

export function productBasePrice(product: Pick<Product, 'basePrice' | 'priceTiers'>): number {
  if (typeof product.basePrice === 'number') return product.basePrice;
  const kilo = product.priceTiers.find((tier) => tier.amount === 1);
  return kilo?.price ?? product.priceTiers[0]?.price ?? 0;
}

export function isVariantField(key: string) {
  return VARIANT_KEYS.has(key);
}

export function resolveCustomization(
  categories: Category[],
  category?: Category,
  key: keyof Category['customization'] = 'flavour',
): CustomizationSwitch {
  if (!category) return 'off';
  const value = category.customization[key];
  if (value !== 'inherit') return value;
  const parent = getCategoryById(categories, category.parentId ?? undefined);
  return parent ? resolveCustomization(categories, parent, key) : 'off';
}

export function schemaFieldsForPricing(schema: CategoryAttributeSchema[]) {
  return schema.filter((field) => !isVariantField(field.key));
}

export function groupsFromSchema(
  schema: CategoryAttributeSchema[],
  existing?: CustomizationPriceGroup[],
): CustomizationPriceGroup[] {
  return schemaFieldsForPricing(schema).map((field) => {
    const prev = existing?.find((group) => group.key === field.key);
    return {
      key: field.key,
      label: field.label,
      required: Boolean(field.required),
      options: (field.options ?? []).map((option) => ({
        value: option.value,
        label: option.label,
        extraPrice:
          prev?.options.find((row) => row.value === option.value)?.extraPrice ??
          DEFAULT_EXTRAS[field.key]?.[option.value] ??
          0,
      })),
    };
  });
}

export function defaultVariants(model: PricingModel, basePrice: number): PriceTier[] {
  if (model === 'pack') {
    return [
      { id: 'v1', label: 'Box of 6', amount: 6, price: Math.round(basePrice * 0.55) },
      { id: 'v2', label: 'Box of 12', amount: 12, price: basePrice },
    ];
  }
  if (model === 'size') {
    return [
      { id: 'v1', label: 'Small', amount: 1, price: Math.round(basePrice * 0.7) },
      { id: 'v2', label: 'Regular', amount: 2, price: basePrice },
      { id: 'v3', label: 'Large', amount: 3, price: Math.round(basePrice * 1.35) },
    ];
  }
  if (model === 'unit') {
    return [{ id: 'v1', label: '1 unit', amount: 1, price: basePrice }];
  }
  return [
    { id: 'v1', label: '0.5 kg', amount: 0.5, price: Math.round(basePrice * 0.58) },
    { id: 'v2', label: '1 kg', amount: 1, price: basePrice },
    { id: 'v3', label: '1.5 kg', amount: 1.5, price: Math.round(basePrice * 1.42) },
    { id: 'v4', label: '2 kg', amount: 2, price: Math.round(basePrice * 1.85) },
  ];
}

export function buildGroupsForCategory(
  categories: Category[],
  category?: Category,
  existing?: CustomizationPriceGroup[],
): CustomizationPriceGroup[] {
  const schema = getAttributeSchema(category);
  const fromSchema = groupsFromSchema(schema, existing ?? category?.customizationPricing);
  return fromSchema.filter((group) => {
    const matrixKey = (Object.keys(MATRIX_TO_SCHEMA) as Array<keyof Category['customization']>).find((key) =>
      MATRIX_TO_SCHEMA[key].includes(group.key),
    );
    if (!matrixKey) return true;
    return resolveCustomization(categories, category, matrixKey) !== 'off';
  });
}

export function previewTotal(
  basePrice: number,
  variants: PriceTier[],
  selectedAmount: number | null,
  groups: CustomizationPriceGroup[],
  selected: Record<string, string>,
  addOnTotal = 0,
) {
  const variant = variants.find((row) => row.amount === selectedAmount) ?? variants[0];
  const variantPrice = variant?.price ?? basePrice;
  const extras = groups.reduce((sum, group) => {
    const value = selected[group.key];
    const option = group.options.find((row) => row.value === value);
    return sum + (option?.extraPrice ?? 0);
  }, 0);
  return { variantPrice, extras, addOnTotal, total: variantPrice + extras + addOnTotal };
}
