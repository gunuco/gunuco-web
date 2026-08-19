import { APP_CONFIG } from '@/config/app.config';
import type { Addon, Product } from '@/types';

export interface PriceBreakdown {
  base: number;
  addOns: number;
  tax: number;
  deliveryFee: number;
  discount: number;
  total: number;
}

function matchTier(product: Product, attributes: Record<string, string | number | boolean | string[]>) {
  const weight = Number(attributes.weightKg ?? attributes.packSize ?? attributes.size ?? NaN);
  if (!Number.isNaN(weight)) {
    const exact = product.priceTiers.find((t) => t.amount === weight);
    if (exact) return exact;
  }
  return product.priceTiers[0];
}

export function quoteProduct(
  product: Product,
  attributes: Record<string, string | number | boolean | string[]>,
  selectedAddOns: Addon[] = [],
  options?: { includeDelivery?: boolean; discount?: number },
): PriceBreakdown {
  const tier = matchTier(product, attributes);
  const base = tier?.price ?? 0;
  const addOns = selectedAddOns.reduce((sum, a) => sum + a.price, 0);
  const discount = options?.discount ?? 0;
  const taxable = Math.max(0, base + addOns - discount);
  const tax = Math.round(taxable * APP_CONFIG.taxRate);
  const deliveryFee = options?.includeDelivery
    ? APP_CONFIG.deliveryBands.find((band) => band.fee > 0)?.fee ?? 0
    : 0;
  return {
    base,
    addOns,
    tax,
    deliveryFee,
    discount,
    total: taxable + tax + deliveryFee,
  };
}

export function lineTotal(unitPrice: number, quantity: number): number {
  return unitPrice * quantity;
}
