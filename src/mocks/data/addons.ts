import type { Addon } from '@/types';

export const seedAddons: Addon[] = [
  {
    id: 'add_candles',
    name: 'Sparkler candles',
    price: 49,
    active: true,
    applicableCategoryIds: ['cat_premium', 'cat_wedding', 'cat_cakes'],
  },
  {
    id: 'add_message',
    name: 'Custom message plaque',
    price: 79,
    active: true,
    applicableCategoryIds: ['cat_premium', 'cat_wedding', 'cat_cakes'],
  },
  {
    id: 'add_gold',
    name: 'Edible gold leaf',
    price: 249,
    active: true,
    applicableCategoryIds: ['cat_premium', 'cat_wedding'],
  },
  {
    id: 'add_flowers',
    name: 'Fresh bloom garnish',
    price: 199,
    active: true,
    applicableCategoryIds: ['cat_premium', 'cat_wedding'],
  },
  {
    id: 'add_knife',
    name: 'Cake knife set',
    price: 149,
    active: true,
    applicableCategoryIds: ['cat_wedding'],
  },
  {
    id: 'add_giftwrap',
    name: 'Premium gift wrap',
    price: 89,
    active: true,
    applicableCategoryIds: ['cat_nyc_cookies', 'cat_premium'],
  },
  {
    id: 'add_jar',
    name: 'Cookie jar upgrade',
    price: 129,
    active: true,
    applicableCategoryIds: ['cat_nyc_cookies'],
  },
  {
    id: 'add_stand',
    name: 'Acrylic cake stand (rental)',
    price: 399,
    active: false,
    applicableCategoryIds: ['cat_wedding'],
  },
];
