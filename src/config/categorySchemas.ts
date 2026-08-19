import type { CategoryAttributeSchema } from '@/types';

/**
 * Attribute schemas are data, not UI branches.
 * Adding Coffee / Pizza / Burgers later means registering a schema here
 * (or from the API) — screens already render from this config.
 */
export const CAKE_ATTRIBUTE_SCHEMA: CategoryAttributeSchema[] = [
  {
    key: 'flavour',
    label: 'Flavour',
    type: 'select',
    required: true,
    options: [
      { value: 'chocolate_truffle', label: 'Belgian Chocolate Truffle' },
      { value: 'red_velvet', label: 'Red Velvet' },
      { value: 'vanilla_bean', label: 'Vanilla Bean' },
      { value: 'black_forest', label: 'Black Forest' },
      { value: 'pineapple', label: 'Pineapple' },
      { value: 'butterscotch', label: 'Butterscotch' },
      { value: 'mango', label: 'Alphonso Mango' },
      { value: 'pistachio', label: 'Pista Rose' },
    ],
  },
  {
    key: 'eggType',
    label: 'Egg / Eggless',
    type: 'select',
    required: true,
    options: [
      { value: 'egg', label: 'With egg' },
      { value: 'eggless', label: 'Eggless' },
    ],
  },
  {
    key: 'sugarType',
    label: 'Sugar type',
    type: 'select',
    required: true,
    options: [
      { value: 'regular', label: 'Regular' },
      { value: 'brown', label: 'Brown sugar' },
      { value: 'jaggery', label: 'Jaggery' },
      { value: 'sugar_free', label: 'Sugar-free' },
    ],
  },
  {
    key: 'flourType',
    label: 'Flour type',
    type: 'select',
    required: true,
    options: [
      { value: 'maida', label: 'Refined wheat (maida)' },
      { value: 'whole_wheat', label: 'Whole wheat' },
      { value: 'almond', label: 'Almond flour' },
      { value: 'gluten_free', label: 'Gluten-free blend' },
    ],
  },
  {
    key: 'weightKg',
    label: 'Weight',
    type: 'select',
    required: true,
    unit: 'kg',
    options: [
      { value: '0.5', label: '0.5 kg' },
      { value: '1', label: '1 kg' },
      { value: '1.5', label: '1.5 kg' },
      { value: '2', label: '2 kg' },
      { value: '2.5', label: '2.5 kg' },
      { value: '3', label: '3 kg' },
    ],
  },
];

export const PREMIUM_ATTRIBUTE_SCHEMA: CategoryAttributeSchema[] = [
  ...CAKE_ATTRIBUTE_SCHEMA,
  {
    key: 'finish',
    label: 'Finish',
    type: 'select',
    required: true,
    options: [
      { value: 'ganache', label: 'Dark ganache' },
      { value: 'mirror', label: 'Mirror glaze' },
      { value: 'gold_leaf', label: 'Gold leaf' },
      { value: 'fresh_bloom', label: 'Fresh blooms' },
    ],
  },
];

export const WEDDING_ATTRIBUTE_SCHEMA: CategoryAttributeSchema[] = [
  ...CAKE_ATTRIBUTE_SCHEMA,
  {
    key: 'tiers',
    label: 'Tiers',
    type: 'select',
    required: true,
    options: [
      { value: '1', label: 'Single tier' },
      { value: '2', label: 'Two tier' },
      { value: '3', label: 'Three tier' },
      { value: '4', label: 'Four tier' },
    ],
  },
  {
    key: 'occasion',
    label: 'Occasion',
    type: 'select',
    options: [
      { value: 'wedding', label: 'Wedding' },
      { value: 'engagement', label: 'Engagement' },
      { value: 'reception', label: 'Reception' },
      { value: 'anniversary', label: 'Anniversary' },
    ],
  },
];

export const COOKIE_ATTRIBUTE_SCHEMA: CategoryAttributeSchema[] = [
  {
    key: 'flavour',
    label: 'Flavour',
    type: 'select',
    required: true,
    options: [
      { value: 'choc_chip', label: 'Chocolate chip' },
      { value: 'butter', label: 'Butter' },
      { value: 'oatmeal', label: 'Oatmeal raisin' },
      { value: 'double_choc', label: 'Double chocolate' },
      { value: 'pistachio', label: 'Pistachio' },
    ],
  },
  {
    key: 'eggType',
    label: 'Egg / Eggless',
    type: 'select',
    required: true,
    options: [
      { value: 'egg', label: 'With egg' },
      { value: 'eggless', label: 'Eggless' },
    ],
  },
  {
    key: 'sugarType',
    label: 'Sugar type',
    type: 'select',
    required: true,
    options: [
      { value: 'regular', label: 'Regular' },
      { value: 'brown', label: 'Brown sugar' },
      { value: 'jaggery', label: 'Jaggery' },
    ],
  },
  {
    key: 'flourType',
    label: 'Flour type',
    type: 'select',
    required: true,
    options: [
      { value: 'maida', label: 'Refined wheat (maida)' },
      { value: 'whole_wheat', label: 'Whole wheat' },
      { value: 'almond', label: 'Almond flour' },
    ],
  },
  {
    key: 'packSize',
    label: 'Pack size',
    type: 'select',
    required: true,
    options: [
      { value: '6', label: 'Box of 6' },
      { value: '12', label: 'Box of 12' },
      { value: '24', label: 'Box of 24' },
    ],
  },
];

export const COFFEE_ATTRIBUTE_SCHEMA: CategoryAttributeSchema[] = [
  {
    key: 'roast',
    label: 'Roast',
    type: 'select',
    required: true,
    options: [
      { value: 'light', label: 'Light' },
      { value: 'medium', label: 'Medium' },
      { value: 'dark', label: 'Dark' },
    ],
  },
  {
    key: 'size',
    label: 'Size',
    type: 'select',
    required: true,
    options: [
      { value: 's', label: 'Small' },
      { value: 'm', label: 'Medium' },
      { value: 'l', label: 'Large' },
    ],
  },
  {
    key: 'milkType',
    label: 'Milk',
    type: 'select',
    options: [
      { value: 'dairy', label: 'Dairy' },
      { value: 'oat', label: 'Oat' },
      { value: 'almond', label: 'Almond' },
      { value: 'none', label: 'None' },
    ],
  },
];

export const PIZZA_ATTRIBUTE_SCHEMA: CategoryAttributeSchema[] = [
  {
    key: 'size',
    label: 'Size',
    type: 'select',
    required: true,
    options: [
      { value: 'regular', label: 'Regular' },
      { value: 'medium', label: 'Medium' },
      { value: 'large', label: 'Large' },
    ],
  },
  {
    key: 'crust',
    label: 'Crust',
    type: 'select',
    required: true,
    options: [
      { value: 'thin', label: 'Thin' },
      { value: 'hand_tossed', label: 'Hand tossed' },
      { value: 'cheese_burst', label: 'Cheese burst' },
    ],
  },
];

export const BURGER_ATTRIBUTE_SCHEMA: CategoryAttributeSchema[] = [
  {
    key: 'patty',
    label: 'Patty',
    type: 'select',
    required: true,
    options: [
      { value: 'chicken', label: 'Chicken' },
      { value: 'veg', label: 'Veg' },
      { value: 'mutton', label: 'Mutton' },
    ],
  },
  {
    key: 'bun',
    label: 'Bun',
    type: 'select',
    required: true,
    options: [
      { value: 'brioche', label: 'Brioche' },
      { value: 'sesame', label: 'Sesame' },
      { value: 'potato', label: 'Potato' },
    ],
  },
];

export const SCHEMA_LIBRARY: Record<string, CategoryAttributeSchema[]> = {
  cake: CAKE_ATTRIBUTE_SCHEMA,
  premium: PREMIUM_ATTRIBUTE_SCHEMA,
  wedding: WEDDING_ATTRIBUTE_SCHEMA,
  cookie: COOKIE_ATTRIBUTE_SCHEMA,
  coffee: COFFEE_ATTRIBUTE_SCHEMA,
  pizza: PIZZA_ATTRIBUTE_SCHEMA,
  burger: BURGER_ATTRIBUTE_SCHEMA,
};
