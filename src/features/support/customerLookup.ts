import { seedOrders } from '@/mocks/data/orders';
import type { Order } from '@/types';
import { phoneDigits } from '@/utils/phone';
import { sortOrdersLatestFirst } from '@/utils/orderNumber';

export interface CustomerProfile {
  key: string;
  name: string;
  phone: string;
  address: string;
  orderCount: number;
  lastOrderAt: string;
  orders: Order[];
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
      key,
      name: order.customerName,
      phone: order.customerPhone,
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
