import type { Category, Offer, Product } from '@/types';
import { getCategoryById } from '@/utils/category';
import { formatCurrency } from '@/utils/format';

export function formatOfferReward(offer: Pick<Offer, 'reward' | 'value' | 'maxDiscount'>): string {
  if (offer.reward === 'percent') {
    const cap = offer.maxDiscount != null ? ` · cap ${formatCurrency(offer.maxDiscount)}` : '';
    return `${offer.value}% off${cap}`;
  }
  return `${formatCurrency(offer.value)} off`;
}

export function formatMinOrder(amount: number): string {
  return amount > 0 ? `Min ${formatCurrency(amount)}` : 'No min';
}

export function formatAppliesTo(offer: Offer, categories: Category[], products: Product[]): string {
  if (offer.appliesTo === 'all') return 'Entire cart';
  if (offer.appliesTo === 'category') {
    const names = offer.categoryIds
      .map((id) => getCategoryById(categories, id)?.name)
      .filter(Boolean);
    return names.join(', ') || 'Categories';
  }
  const names = offer.productIds.map((id) => products.find((p) => p.id === id)?.name).filter(Boolean);
  return names.join(', ') || 'Products';
}

export function formatUsage(offer: Offer): string {
  return offer.usageLimit == null ? `${offer.used} · unlimited` : `${offer.used}/${offer.usageLimit}`;
}

export function toDateInput(iso: string): string {
  return iso.slice(0, 10);
}

export function fromDateStart(date: string): string {
  return `${date}T00:00:00.000Z`;
}

export function fromDateEnd(date: string): string {
  return `${date}T23:59:59.000Z`;
}

export function todayDateInput(): string {
  return new Date().toISOString().slice(0, 10);
}

export function plusDaysDateInput(days: number): string {
  const next = new Date();
  next.setDate(next.getDate() + days);
  return next.toISOString().slice(0, 10);
}
