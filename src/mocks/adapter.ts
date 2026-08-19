import { APP_CONFIG } from '@/config/app.config';
import { db, nextId, nowIso } from '@/mocks/db';
import { DEMO_PASSWORD } from '@/mocks/data/users';
import { nextOrderNumber, sortOrdersLatestFirst } from '@/utils/orderNumber';
import type {
  Addon,
  ApiMeta,
  ApiResponse,
  Category,
  DashboardPayload,
  FulfillmentMode,
  Order,
  OrderFilters,
  OrderStatus,
  Product,
} from '@/types';
import type { AxiosAdapter, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

function ok<T>(
  config: InternalAxiosRequestConfig,
  data: T,
  status = 200,
  message = 'Fetched successfully',
  meta?: ApiMeta,
): AxiosResponse<ApiResponse<T>> {
  return {
    data: { success: true, data, message, meta },
    status,
    statusText: 'OK',
    headers: { 'content-type': 'application/json' },
    config,
  };
}

function fail(
  config: InternalAxiosRequestConfig,
  message: string,
  status = 400,
): AxiosResponse<ApiResponse<null>> {
  return {
    data: { success: false, data: null, message },
    status,
    statusText: 'Error',
    headers: {},
    config,
  };
}

function delay(): Promise<void> {
  const ms = 500 + Math.floor(Math.random() * 500);
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function pathOf(url = ''): string {
  try {
    const u = new URL(url, 'http://local');
    return (u.pathname.replace(/^\/api/, '') || '/').replace(/\/$/, '') || '/';
  } catch {
    const raw = (url.split('?')[0] ?? '/').replace(/^\/api/, '');
    return raw.replace(/\/$/, '') || '/';
  }
}

function paramsOf(config: InternalAxiosRequestConfig): Record<string, string> {
  const result: Record<string, string> = {};
  const raw = config.params as Record<string, unknown> | undefined;
  if (raw) {
    for (const [k, v] of Object.entries(raw)) {
      if (v !== undefined && v !== null && v !== '') result[k] = String(v);
    }
  }
  const url = config.url ?? '';
  const q = url.includes('?') ? url.split('?')[1] : '';
  if (q) {
    new URLSearchParams(q).forEach((v, k) => {
      result[k] = v;
    });
  }
  return result;
}

function match(path: string, pattern: string): Record<string, string> | null {
  const a = path.split('/').filter(Boolean);
  const b = pattern.split('/').filter(Boolean);
  if (a.length !== b.length) return null;
  const params: Record<string, string> = {};
  for (let i = 0; i < b.length; i += 1) {
    if (b[i].startsWith(':')) params[b[i].slice(1)] = a[i];
    else if (a[i] !== b[i]) return null;
  }
  return params;
}

function trendFromOrders() {
  const days = ['06 Aug', '07 Aug', '08 Aug', '09 Aug', '10 Aug', '11 Aug', '12 Aug'];
  const orders = [18, 22, 19, 28, 31, 26, 34];
  const revenue = [42000, 51000, 39000, 72000, 81000, 64000, 88000];
  return days.map((date, i) => ({ date, orders: orders[i], revenue: revenue[i] }));
}

function categoryBreakdown() {
  const parents = db.categories.filter((c) => c.parentId === null);
  const fromParents = parents.map((parent) => {
    const childIds = db.categories.filter((c) => c.parentId === parent.id).map((c) => c.id);
    const value = db.orders.reduce((sum, order) => {
      const hit = order.items.some(
        (i) => i.categoryId === parent.id || childIds.includes(i.subcategoryId),
      );
      return hit ? sum + order.total : sum;
    }, 0);
    return { categoryId: parent.id, categoryName: parent.name, value };
  });
  const children = db.categories
    .filter((c) => c.parentId !== null && c.active)
    .map((child) => ({
      categoryId: child.id,
      categoryName: child.name,
      value: db.orders.reduce(
        (sum, order) =>
          sum + (order.items.some((i) => i.subcategoryId === child.id) ? order.total : 0),
        0,
      ),
    }))
    .filter((row) => row.value > 0);
  return children.length ? children : fromParents;
}

function dashboardPayload(): DashboardPayload {
  const today = db.orders.filter((o) => o.createdAt.startsWith('2026-08-12'));
  const deliveredToday = today.filter((o) => o.status === 'delivered').length;
  const outForDelivery = db.orders.filter((o) => o.status === 'out_for_delivery').length;
  const pending = db.orders.filter((o) =>
    ['ready_for_delivery', 'packed', 'pending_assignment'].includes(o.status) ||
    ['pending_assignment', 'assigned'].includes(o.deliveryState),
  ).length;
  const wedding = db.orders.filter((o) => o.items.some((i) => i.subcategoryId === 'cat_wedding'));
  return {
    totalOrders: db.orders.length,
    revenue: db.orders.reduce((s, o) => s + o.total, 0),
    ordersToday: today.length,
    revenueToday: today.reduce((s, o) => s + o.total, 0),
    ordersChange: 12.4,
    revenueChange: 8.1,
    avgPrepMinutes: 74,
    cakesOrders: db.orders.filter((o) => o.items.some((i) => i.categoryId === 'cat_cakes')).length,
    customCakesOrders: db.customCakes.length,
    weddingOrders: wedding.length,
    awaitingAcceptance: db.orders.filter((o) => o.status === 'not_accepted').length,
    preparing: db.orders.filter((o) => o.status === 'preparing').length,
    packed: db.orders.filter((o) => o.status === 'packed').length,
    readyForDelivery: db.orders.filter((o) => o.status === 'ready_for_delivery').length,
    posSalesToday: today.filter((o) => o.source === 'pos').length,
    posRevenueToday: today.filter((o) => o.source === 'pos').reduce((s, o) => s + o.total, 0),
    atRiskWedding: 2,
    delivery: { pending, outForDelivery, deliveredToday },
    categoryBreakdown: categoryBreakdown(),
    trend: trendFromOrders(),
    controls: {
      acceptOrders: db.acceptOrders,
      deliveryAssignmentMode: db.deliveryAssignmentMode,
      customCakesMode: db.customCakesMode,
      globalDailyLimit: db.globalDailyLimit,
      categoryControls: db.categories.map((c) => ({
        categoryId: c.id,
        orderMode: c.orderMode,
        dailyLimit: c.dailyLimit,
        acceptsOrders: c.acceptsOrders,
      })),
    },
    recentOrders: sortOrdersLatestFirst(db.orders).slice(0, 8),
  };
}

async function route(config: InternalAxiosRequestConfig): Promise<AxiosResponse> {
  const method = (config.method ?? 'get').toLowerCase();
  const path = pathOf(config.url ?? '');
  const query = paramsOf(config);
  const body = (typeof config.data === 'string' ? JSON.parse(config.data || '{}') : config.data) ?? {};

  if (method === 'post' && match(path, '/auth/login')) {
    const user = db.users.find((u) => u.email.toLowerCase() === String(body.email ?? '').toLowerCase());
    if (!user || body.password !== DEMO_PASSWORD) {
      return fail(config, 'Invalid email or password', 401);
    }
    return ok(config, { ...user, token: `mock.${user.id}.token` }, 200, 'Signed in');
  }

  if (method === 'get' && match(path, '/dashboard')) {
    return ok(config, dashboardPayload(), 200, 'Dashboard loaded');
  }

  if (method === 'get' && match(path, '/dashboard/kpis')) {
    const today = db.orders.filter((o) => o.createdAt.startsWith('2026-08-12'));
    const delivered = today.filter((o) => o.status === 'delivered');
      const pendingDelivery = db.orders.filter((o) =>
      ['ready_for_delivery', 'out_for_delivery'].includes(o.status),
    ).length;
    return ok(config, {
      ordersToday: today.length,
      ordersChange: 12.4,
      revenueToday: today.reduce((s, o) => s + o.total, 0),
      revenueChange: 8.1,
      pendingDelivery,
      deliveredToday: delivered.length,
      avgPrepMinutes: 74,
    });
  }

  if (method === 'get' && match(path, '/dashboard/trend')) {
    return ok(config, trendFromOrders());
  }

  if (method === 'get' && match(path, '/dashboard/breakdown')) {
    const activeParents = db.categories.filter((c) => c.parentId === null && c.active);
    const points = activeParents.map((parent) => {
      const childIds = db.categories.filter((c) => c.parentId === parent.id).map((c) => c.id);
      const value = db.orders.reduce((sum, order) => {
        const hit = order.items.some(
          (i) => i.categoryId === parent.id || childIds.includes(i.subcategoryId),
        );
        return hit ? sum + order.total : sum;
      }, 0);
      return { categoryId: parent.id, categoryName: parent.name, value };
    });
    const cookieValue = db.orders.reduce((sum, order) => {
      const hit = order.items.some((i) => i.subcategoryId === 'cat_nyc_cookies');
      return hit ? sum + order.total : sum;
    }, 0);
    return ok(config, [
      ...points,
      { categoryId: 'cat_premium', categoryName: 'GUNUCO PREMIUM CAKES', value: 9169 },
      { categoryId: 'cat_wedding', categoryName: 'Wedding or Anniversary', value: 14695 },
      { categoryId: 'cat_nyc_cookies', categoryName: 'NYC Cookies', value: cookieValue || 2543 },
    ]);
  }

  if (method === 'get' && match(path, '/dashboard/controls')) {
    return ok(config, {
      acceptOrders: db.acceptOrders,
      deliveryAssignmentMode: db.deliveryAssignmentMode,
      customCakesMode: db.customCakesMode,
      globalDailyLimit: db.globalDailyLimit,
      categoryControls: db.categories
        .filter((c) => c.parentId === null || c.active)
        .map((c) => ({
          categoryId: c.id,
          orderMode: c.orderMode,
          dailyLimit: c.dailyLimit,
          acceptsOrders: c.acceptsOrders,
        })),
    });
  }

  if (method === 'patch' && match(path, '/dashboard/controls')) {
    if (typeof body.acceptOrders === 'boolean') db.acceptOrders = body.acceptOrders;
    if (body.deliveryAssignmentMode) db.deliveryAssignmentMode = body.deliveryAssignmentMode;
    if (body.customCakesMode) db.customCakesMode = body.customCakesMode;
    if (body.globalDailyLimit !== undefined) db.globalDailyLimit = body.globalDailyLimit;
    if (Array.isArray(body.categoryControls)) {
      for (const row of body.categoryControls as Array<{
        categoryId: string;
        orderMode?: FulfillmentMode;
        dailyLimit?: number | null;
        acceptsOrders?: boolean;
      }>) {
        const cat = db.categories.find((c) => c.id === row.categoryId);
        if (!cat) continue;
        if (row.orderMode) cat.orderMode = row.orderMode;
        if (row.dailyLimit !== undefined) cat.dailyLimit = row.dailyLimit;
        if (typeof row.acceptsOrders === 'boolean') cat.acceptsOrders = row.acceptsOrders;
      }
    }
    return ok(config, { acceptOrders: db.acceptOrders });
  }

  if (method === 'get' && match(path, '/orders')) {
    const filters = query as unknown as OrderFilters;
    let rows = sortOrdersLatestFirst(db.orders);
    if (filters.status) rows = rows.filter((o) => o.status === filters.status);
    if (filters.paymentStatus) rows = rows.filter((o) => o.paymentStatus === filters.paymentStatus);
    if (filters.categoryId) {
      rows = rows.filter((o) =>
        o.items.some((i) => i.categoryId === filters.categoryId || i.subcategoryId === filters.categoryId),
      );
    }
    if (filters.subcategoryId) {
      rows = rows.filter((o) => o.items.some((i) => i.subcategoryId === filters.subcategoryId));
    }
    if (filters.from) rows = rows.filter((o) => o.createdAt.slice(0, 10) >= filters.from!);
    if (filters.to) rows = rows.filter((o) => o.createdAt.slice(0, 10) <= filters.to!);
    if (filters.search) {
      const q = filters.search.toLowerCase();
      rows = rows.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.customerPhone.includes(q),
      );
    }
    const page = Number(query.page ?? 1);
    const pageSize = Number(query.pageSize ?? 10);
    const start = (page - 1) * pageSize;
    return ok(config, rows.slice(start, start + pageSize), 200, 'Fetched successfully', {
      total: rows.length,
      page,
      pageSize,
    });
  }

  const orderId = match(path, '/orders/:id');
  if (orderId && method === 'get') {
    const found = db.orders.find((o) => o.id === orderId.id);
    return found ? ok(config, found) : fail(config, 'Order not found', 404);
  }

  const accept = match(path, '/orders/:id/accept');
  if (accept && method === 'post') {
    const found = db.orders.find((o) => o.id === accept.id);
    if (!found) return fail(config, 'Order not found', 404);
    if (found.status !== 'not_accepted') return fail(config, 'Only pending orders can be accepted', 409);
    found.status = 'accepted';
    found.updatedAt = nowIso();
    return ok(config, found, 200, 'Order accepted');
  }

  const reject = match(path, '/orders/:id/reject');
  if (reject && method === 'post') {
    const found = db.orders.find((o) => o.id === reject.id);
    if (!found) return fail(config, 'Order not found', 404);
    if (found.status !== 'not_accepted') return fail(config, 'Only pending orders can be rejected', 409);
    found.status = 'rejected';
    found.paymentStatus = found.paymentStatus === 'completed' ? 'refunded' : found.paymentStatus;
    found.notes = body.reason ? String(body.reason) : found.notes;
    found.updatedAt = nowIso();
    return ok(config, found, 200, 'Order rejected');
  }

  const assign = match(path, '/orders/:id/assign');
  if (assign && method === 'post') {
    const found = db.orders.find((o) => o.id === assign.id);
    const rider = db.riders.find((r) => r.id === body.riderId);
    if (!found) return fail(config, 'Order not found', 404);
    if (!rider) return fail(config, 'Rider not found', 404);
    if (rider.status === 'offline') return fail(config, 'Rider is offline', 409);
    if (!['ready_for_delivery', 'packed', 'accepted', 'preparing'].includes(found.status)) {
      return fail(config, 'Order is not ready to assign', 409);
    }
    found.riderId = rider.id;
    found.deliveryState = 'assigned';
    found.status = found.status === 'ready_for_delivery' ? 'out_for_delivery' : found.status;
    found.updatedAt = nowIso();
    rider.status = 'busy';
    rider.activeOrders += 1;
    return ok(config, found);
  }

  if (orderId && method === 'patch') {
    const found = db.orders.find((o) => o.id === orderId.id);
    if (!found) return fail(config, 'Order not found', 404);
    if (body.status) found.status = body.status as OrderStatus;
    if (body.deliveryState) found.deliveryState = body.deliveryState;
    if (body.paymentStatus) found.paymentStatus = body.paymentStatus;
    found.updatedAt = nowIso();
    return ok(config, found);
  }

  if (method === 'get' && match(path, '/categories')) {
    return ok(config, db.categories);
  }

  const catId = match(path, '/categories/:id');
  if (catId && method === 'patch') {
    const found = db.categories.find((c) => c.id === catId.id);
    if (!found) return fail(config, 'Category not found', 404);
    Object.assign(found, body);
    return ok(config, found);
  }

  if (method === 'post' && match(path, '/categories')) {
    const created: Category = {
      id: nextId('cat'),
      code: String(body.code ?? body.name ?? 'CATEGORY')
        .toUpperCase()
        .replace(/\s+/g, '_'),
      name: body.name,
      slug: String(body.name ?? 'category')
        .toLowerCase()
        .replace(/\s+/g, '-'),
      parentId: body.parentId ?? null,
      active: body.active ?? true,
      sortOrder: db.categories.length + 1,
      icon: body.icon ?? 'cake',
      description: body.description ?? '',
      attributeSchema: body.attributeSchema ?? [],
      pricingModel: body.pricingModel ?? 'unit',
      fulfillmentModes: body.fulfillmentModes ?? ['manual'],
      orderMode: body.orderMode ?? 'manual',
      acceptsOrders: body.acceptsOrders ?? true,
      dailyLimit: body.dailyLimit ?? null,
      dailyAccepted: 0,
      customization: body.customization ?? {
        flavour: body.parentId ? 'inherit' : 'off',
        egg: body.parentId ? 'inherit' : 'off',
        sweetener: body.parentId ? 'inherit' : 'off',
        flour: body.parentId ? 'inherit' : 'off',
        size: body.parentId ? 'inherit' : 'off',
      },
      sameDayEligible: body.sameDayEligible ?? false,
    };
    db.categories.push(created);
    return ok(config, created, 201);
  }

  if (method === 'get' && match(path, '/products')) {
    let rows = [...db.products];
    if (query.categoryId) {
      rows = rows.filter(
        (p) => p.categoryId === query.categoryId || p.subcategoryId === query.categoryId,
      );
    }
    if (query.search) {
      const q = query.search.toLowerCase();
      rows = rows.filter((p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q));
    }
    if (query.active === 'true') rows = rows.filter((p) => p.active);
    return ok(config, rows);
  }

  if (method === 'post' && match(path, '/products')) {
    const created: Product = {
      id: nextId('prd'),
      name: body.name,
      sku: body.sku ?? `GNC-${Date.now()}`,
      categoryId: body.categoryId,
      subcategoryId: body.subcategoryId,
      description: body.description ?? '',
      imageHue: body.imageHue ?? Math.floor(Math.random() * 360),
      active: body.active ?? true,
      attributes: body.attributes ?? {},
      priceTiers: body.priceTiers ?? [],
      addOnIds: body.addOnIds ?? [],
      tags: body.tags ?? [],
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    db.products.push(created);
    return ok(config, created, 201);
  }

  const prd = match(path, '/products/:id');
  if (prd && method === 'patch') {
    const found = db.products.find((p) => p.id === prd.id);
    if (!found) return fail(config, 'Product not found', 404);
    Object.assign(found, body, { updatedAt: nowIso() });
    return ok(config, found);
  }

  if (method === 'get' && match(path, '/addons')) return ok(config, db.addons);
  if (method === 'post' && match(path, '/addons')) {
    const created: Addon = {
      id: nextId('add'),
      name: body.name,
      price: Number(body.price ?? 0),
      active: body.active ?? true,
      applicableCategoryIds: body.applicableCategoryIds ?? [],
    };
    db.addons.push(created);
    return ok(config, created, 201);
  }
  const addonId = match(path, '/addons/:id');
  if (addonId && method === 'patch') {
    const found = db.addons.find((a) => a.id === addonId.id);
    if (!found) return fail(config, 'Add-on not found', 404);
    Object.assign(found, body);
    return ok(config, found);
  }

  if (method === 'get' && (match(path, '/delivery-partners') || match(path, '/riders'))) {
    return ok(config, db.riders);
  }
  const riderId = match(path, '/delivery-partners/:id') ?? match(path, '/riders/:id');
  if (riderId && method === 'patch') {
    const found = db.riders.find((r) => r.id === riderId.id);
    if (!found) return fail(config, 'Delivery partner not found', 404);
    Object.assign(found, body);
    return ok(config, found, 200, 'Delivery partner updated');
  }

  if (method === 'get' && match(path, '/locations')) return ok(config, db.locations);
  if (method === 'get' && match(path, '/custom-cakes')) return ok(config, db.customCakes);
  const cc = match(path, '/custom-cakes/:id');
  if (cc && method === 'patch') {
    const found = db.customCakes.find((c) => c.id === cc.id);
    if (!found) return fail(config, 'Request not found', 404);
    Object.assign(found, body);
    return ok(config, found);
  }

  if (method === 'post' && match(path, '/pos/checkout')) {
    if (body.failPayment) {
      return fail(config, 'Payment declined by gateway', 402);
    }
    const created: Order = {
      id: nextId('ord'),
      orderNumber: nextOrderNumber(db.orders.map((o) => o.orderNumber)),
      source: 'pos',
      locationId: APP_CONFIG.defaultLocationId,
      customerName: body.customerName || 'Walk-in',
      customerPhone: body.customerPhone || '—',
      customerAddress: 'Pickup at production house',
      items: body.items ?? [],
      subtotal: body.subtotal ?? 0,
      tax: body.tax ?? 0,
      deliveryFee: 0,
      discount: body.discount ?? 0,
      total: body.total ?? 0,
      status: 'accepted',
      paymentStatus: 'completed',
      paymentMethod: body.paymentMethod ?? 'upi',
      riderId: null,
      deliveryState: 'not_required',
      fulfillmentMethod: 'pickup_at_store',
      pickupStatus: 'pickup_scheduled',
      notes: body.notes ?? '',
      promisedAt: nowIso(),
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    db.orders.unshift(created);
    return ok(config, created, 201);
  }

  if (method === 'get' && match(path, '/reports/summary')) {
    return ok(config, {
      orders: db.orders.length,
      revenue: db.orders.reduce((s, o) => s + o.total, 0),
      aov: Math.round(db.orders.reduce((s, o) => s + o.total, 0) / Math.max(1, db.orders.length)),
      delivered: db.orders.filter((o) => o.status === 'delivered').length,
    });
  }

  return fail(config, `No mock handler for ${method.toUpperCase()} ${path}`, 404);
}

export const mockAdapter: AxiosAdapter = async (config) => {
  await delay();
  const response = await route(config);
  if (response.status >= 400) {
    const error = Object.assign(
      new Error((response.data as ApiResponse<null>).message ?? 'Request failed'),
      {
      config,
      response,
      isAxiosError: true,
    });
    throw error;
  }
  return response;
};
