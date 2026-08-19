import type { Addon, Product } from '@/types';
import { quoteProduct } from '@/utils/pricing';
import { create } from 'zustand';

export interface CartLine {
  key: string;
  product: Product;
  quantity: number;
  attributes: Record<string, string | number | boolean | string[]>;
  addOns: Addon[];
}

interface PosState {
  lines: CartLine[];
  discount: number;
  addLine: (line: Omit<CartLine, 'key'> & { key?: string }) => void;
  removeLine: (key: string) => void;
  setQty: (key: string, quantity: number) => void;
  setDiscount: (value: number) => void;
  clear: () => void;
}

export const usePosStore = create<PosState>((set, get) => ({
  lines: [],
  discount: 0,
  addLine: (line) => {
    const key =
      line.key ??
      `${line.product.id}-${JSON.stringify(line.attributes)}-${line.addOns.map((a) => a.id).join(',')}`;
    const existing = get().lines.find((l) => l.key === key);
    if (existing) {
      set({
        lines: get().lines.map((l) =>
          l.key === key ? { ...l, quantity: l.quantity + line.quantity } : l,
        ),
      });
      return;
    }
    set({ lines: [...get().lines, { ...line, key }] });
  },
  removeLine: (key) => set({ lines: get().lines.filter((l) => l.key !== key) }),
  setQty: (key, quantity) => {
    if (quantity <= 0) {
      set({ lines: get().lines.filter((l) => l.key !== key) });
      return;
    }
    set({
      lines: get().lines.map((l) => (l.key === key ? { ...l, quantity } : l)),
    });
  },
  setDiscount: (value) => set({ discount: Math.max(0, value) }),
  clear: () => set({ lines: [], discount: 0 }),
}));

export function cartTotals(lines: CartLine[], discount: number) {
  const subtotal = lines.reduce((sum, line) => {
    const quote = quoteProduct(line.product, line.attributes, line.addOns);
    return sum + quote.base * line.quantity + quote.addOns * line.quantity;
  }, 0);
  const taxable = Math.max(0, subtotal - discount);
  const tax = Math.round(taxable * 0.05);
  return { subtotal, discount, tax, total: taxable + tax };
}
