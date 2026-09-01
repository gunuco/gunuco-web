import { seedOrders } from '@/mocks/data/orders';
import type { Order } from '@/types';
import { phoneDigits } from '@/utils/phone';
import { sortOrdersLatestFirst } from '@/utils/orderNumber';

export interface CustomerProfile {
  id: string;
  key: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  orderCount: number;
  lastOrderAt: string;
  orders: Order[];
}

export function customerEmail(name: string) {
  const local = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '.')
    .replace(/^\.|\.$/g, '');
  return `${local || 'guest'}@customer.gunuco.com`;
}

export function customerIdFromPhone(phone: string, name: string) {
  const digits = phoneDigits(phone);
  if (digits.length >= 6) return `CUS-${digits.slice(-6)}`;
  const slug = name.replace(/[^A-Za-z0-9]/g, '').slice(0, 6).toUpperCase() || '000000';
  return `CUS-${slug.padStart(6, '0')}`;
}

export function customerKey(phone: string, name: string) {
  return `${phoneDigits(phone)}|${name}`;
}

export function customersFromOrders(): CustomerProfile[] {
  const map = new Map<string, CustomerProfile>();
  for (const order of sortOrdersLatestFirst(seedOrders)) {
    const key = customerKey(order.customerPhone, order.customerName);
    const existing = map.get(key);
    if (existing) {
      existing.orders.push(order);
      existing.orderCount += 1;
      continue;
    }
    map.set(key, {
      id: customerIdFromPhone(order.customerPhone, order.customerName),
      key,
      name: order.customerName,
      phone: order.customerPhone,
      email: customerEmail(order.customerName),
      address: order.customerAddress,
      orderCount: 1,
      lastOrderAt: order.createdAt,
      orders: [order],
    });
  }
  return [...map.values()];
}

export function findCustomer(phone: string, name?: string): CustomerProfile | undefined {
  const rows = customersFromOrders();
  const digits = phoneDigits(phone);
  const exact = name
    ? rows.find((row) => phoneDigits(row.phone) === digits && row.name === name)
    : undefined;
  return exact ?? rows.find((row) => phoneDigits(row.phone) === digits);
}

export function findOrder(orderId: string): Order | undefined {
  return seedOrders.find((order) => order.id === orderId);
}

export function findOrderByNumber(orderNumber: string): Order | undefined {
  return seedOrders.find((order) => order.orderNumber === orderNumber);
}
