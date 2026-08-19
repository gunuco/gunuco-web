import { seedAddons } from '@/mocks/data/addons';
import { seedCategories } from '@/mocks/data/categories';
import { seedCustomCakes } from '@/mocks/data/customCakes';
import { seedLocations } from '@/mocks/data/locations';
import { seedOrders } from '@/mocks/data/orders';
import { seedProducts } from '@/mocks/data/products';
import { seedRiders } from '@/mocks/data/riders';
import { seedUsers } from '@/mocks/data/users';
import type {
  Addon,
  Category,
  CustomCakeRequest,
  DeliveryPartner,
  Location,
  Order,
  Product,
  User,
} from '@/types';

function clone<T>(value: T): T {
  return structuredClone(value);
}

export const db = {
  categories: clone(seedCategories) as Category[],
  products: clone(seedProducts) as Product[],
  orders: clone(seedOrders) as Order[],
  riders: clone(seedRiders) as DeliveryPartner[],
  users: clone(seedUsers) as User[],
  locations: clone(seedLocations) as Location[],
  addons: clone(seedAddons) as Addon[],
  customCakes: clone(seedCustomCakes) as CustomCakeRequest[],
  acceptOrders: true,
  deliveryAssignmentMode: 'manual' as const,
  customCakesMode: 'manual' as const,
  globalDailyLimit: 120,
};

export function nowIso(): string {
  return new Date().toISOString();
}

export function nextId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}`;
}
