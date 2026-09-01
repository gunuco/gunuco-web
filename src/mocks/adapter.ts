import { APP_CONFIG } from '@/config/app.config';
import { db, nextId, nowIso } from '@/mocks/db';
import { DEMO_PASSWORD } from '@/mocks/data/users';
import { nextOrderNumber, sortOrdersLatestFirst } from '@/utils/orderNumber';
import type {
  Addon,
  ApiMeta,
  ApiResponse,
  Category,
  CustomCakeRequest,
  DashboardPayload,
  FeedbackItem,
  Offer,
  FulfillmentMode,
  Order,
  OrderFilters,
  OrderStatus,
  Product,
  Testimonial,
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

function delay(config: InternalAxiosRequestConfig): Promise<void> {
  const method = (config.method ?? 'get').toLowerCase();
  if (method === 'get') return Promise.resolve();
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

function asStringArray(value: unknown, fallback: string[]): string[] {
  return Array.isArray(value) ? value.map(String) : fallback;
}

function couponClash(code: string, kind: Offer['kind'], excludeId?: string): string | null {
  if (kind !== 'coupon' || !code) return null;
  const taken = db.offers.some(
    (row) => row.kind === 'coupon' && row.id !== excludeId && row.code.toUpperCase() === code.toUpperCase(),
  );
  return taken ? 'That coupon code is already in use' : null;
}

function scopedTargets(
  appliesTo: Offer['appliesTo'],
  categoryIds: string[],
  productIds: string[],
): Pick<Offer, 'categoryIds' | 'productIds'> {
  if (appliesTo === 'all') return { categoryIds: [], productIds: [] };
  if (appliesTo === 'category') return { categoryIds, productIds: [] };
  return { categoryIds: [], productIds };
}

function buildOffer(body: Record<string, unknown>): Offer {
  const kind: Offer['kind'] = body.kind === 'coupon' ? 'coupon' : 'automatic';
  const reward: Offer['reward'] = body.reward === 'flat' ? 'flat' : 'percent';
  const appliesTo: Offer['appliesTo'] =
    body.appliesTo === 'category' || body.appliesTo === 'product' ? body.appliesTo : 'all';
  return {
    id: nextId('off'),
    name: String(body.name ?? '').trim(),
    description: String(body.description ?? '').trim(),
    kind,
    code: kind === 'coupon' ? String(body.code ?? '').trim().toUpperCase() : '',
    reward,
    value: Number(body.value ?? 0),
    minOrderAmount: Math.max(0, Number(body.minOrderAmount ?? 0)),
    maxDiscount:
      reward === 'percent' && body.maxDiscount != null && body.maxDiscount !== ''
        ? Number(body.maxDiscount)
        : null,
    appliesTo,
    ...scopedTargets(appliesTo, asStringArray(body.categoryIds, []), asStringArray(body.productIds, [])),
    startsAt: String(body.startsAt ?? nowIso()),
    endsAt: String(body.endsAt ?? nowIso()),
    usageLimit: body.usageLimit == null || body.usageLimit === '' ? null : Number(body.usageLimit),
    used: 0,
    active: body.active !== false,
  };
}

function buildOfferPatch(body: Record<string, unknown>, found: Offer): Partial<Offer> {
  const kind = (body.kind ?? found.kind) as Offer['kind'];
  const reward = (body.reward ?? found.reward) as Offer['reward'];
  const appliesTo = (body.appliesTo ?? found.appliesTo) as Offer['appliesTo'];
  const maxDiscount =
    body.maxDiscount === undefined
      ? found.maxDiscount
      : body.maxDiscount == null || body.maxDiscount === ''
        ? null
        : Number(body.maxDiscount);
  return {
    name: body.name !== undefined ? String(body.name).trim() : found.name,
    description: body.description !== undefined ? String(body.description) : found.description,
    kind,
    code: kind === 'coupon' ? String(body.code ?? found.code).trim().toUpperCase() : '',
    reward,
    value: body.value !== undefined ? Number(body.value) : found.value,
    minOrderAmount:
      body.minOrderAmount !== undefined ? Math.max(0, Number(body.minOrderAmount)) : found.minOrderAmount,
    maxDiscount: reward === 'percent' ? maxDiscount : null,
    appliesTo,
    ...scopedTargets(
      appliesTo,
      asStringArray(body.categoryIds, found.categoryIds),
      asStringArray(body.productIds, found.productIds),
    ),
    startsAt: body.startsAt !== undefined ? String(body.startsAt) : found.startsAt,
    endsAt: body.endsAt !== undefined ? String(body.endsAt) : found.endsAt,
    usageLimit:
      body.usageLimit === undefined
        ? found.usageLimit
        : body.usageLimit == null || body.usageLimit === ''
          ? null
          : Number(body.usageLimit),
    active: body.active !== undefined ? Boolean(body.active) : found.active,
  };
}

function publicQuoteName(fullName: string): string {
  const parts = String(fullName).trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return 'Guest';
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1].charAt(0).toUpperCase()}.`;
}

function hueFrom(id: string): number {
  let n = 0;
  for (const ch of id) n = (n + ch.charCodeAt(0) * 13) % 360;
  return n;
}

function upsertTestimonialFromFeedback(item: FeedbackItem) {
  if (!item.consent) return;
  const existing = db.testimonials.find((row) => row.sourceFeedbackId === item.id);
  if (existing) {
    existing.quote = item.message;
    existing.active = true;
    return existing;
  }
  const created: Testimonial = {
    id: nextId('tm'),
    displayName: publicQuoteName(item.customerName),
    quote: item.message,
    imageHue: hueFrom(item.id),
    channels: ['app', 'website'],
    displayOrder: db.testimonials.reduce((max, row) => Math.max(max, row.displayOrder), 0) + 1,
    active: true,
    sourceFeedbackId: item.id,
  };
  db.testimonials.push(created);
  return created;
}

function hideTestimonialsForFeedback(feedbackId: string) {
  db.testimonials.forEach((row) => {
    if (row.sourceFeedbackId === feedbackId) row.active = false;
  });
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
      { categoryId: 'cat_wedding', categoryName: 'Occasion cakes', value: 14695 },
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
      imageUrl: body.imageUrl ?? body.imageUrls?.[0],
      imageUrls: body.imageUrls ?? (body.imageUrl ? [body.imageUrl] : []),
      basePrice: body.basePrice,
      active: body.active ?? true,
      featured: body.featured,
      attributes: body.attributes ?? {},
      priceTiers: body.priceTiers ?? [],
      customizationEnabled: body.customizationEnabled ?? Boolean(body.customizationGroups?.length),
      customizationGroups: body.customizationGroups ?? [],
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
      name: body.title?.trim() || body.name,
      title: body.title?.trim() || body.name,
      description: body.description ?? '',
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
    const title = (body.title ?? body.name ?? found.title ?? found.name) as string;
    Object.assign(found, body, {
      name: title,
      title,
      description: body.description ?? found.description ?? '',
    });
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
  if (method === 'post' && match(path, '/custom-cakes')) {
    const created: CustomCakeRequest = {
      id: nextId('cc'),
      customerName: body.customerName ?? '',
      phone: body.phone ?? '',
      occasion: body.occasion ?? '',
      flavour: body.flavour ?? '',
      weightKg: Number(body.weightKg ?? 1),
      notes: body.notes ?? '',
      status: body.status ?? 'new',
      quotedPrice: body.quotedPrice === '' || body.quotedPrice == null ? null : Number(body.quotedPrice),
      createdAt: nowIso(),
    };
    db.customCakes.unshift(created);
    return ok(config, created, 201, 'Enquiry created');
  }
  const cc = match(path, '/custom-cakes/:id');
  if (cc && method === 'patch') {
    const found = db.customCakes.find((c) => c.id === cc.id);
    if (!found) return fail(config, 'Request not found', 404);
    Object.assign(found, body, {
      quotedPrice:
        body.quotedPrice === '' || body.quotedPrice === undefined
          ? found.quotedPrice
          : body.quotedPrice == null
            ? null
            : Number(body.quotedPrice),
      weightKg: body.weightKg != null ? Number(body.weightKg) : found.weightKg,
    });
    return ok(config, found);
  }
  if (cc && method === 'delete') {
    const index = db.customCakes.findIndex((c) => c.id === cc.id);
    if (index < 0) return fail(config, 'Request not found', 404);
    const [removed] = db.customCakes.splice(index, 1);
    return ok(config, removed, 200, 'Enquiry deleted');
  }

  if (method === 'get' && match(path, '/offers')) return ok(config, db.offers);
  if (method === 'post' && match(path, '/offers')) {
    const created = buildOffer(body);
    const clash = couponClash(created.code, created.kind);
    if (clash) return fail(config, clash);
    if (!created.name) return fail(config, 'Name is required');
    if (created.kind === 'coupon' && !created.code) return fail(config, 'Coupon code is required');
    db.offers.unshift(created);
    return ok(config, created, 201, 'Offer created');
  }
  const offerId = match(path, '/offers/:id');
  if (offerId && method === 'patch') {
    const found = db.offers.find((o) => o.id === offerId.id);
    if (!found) return fail(config, 'Offer not found', 404);
    const next = { ...found, ...buildOfferPatch(body, found), id: found.id, used: found.used };
    const clash = couponClash(next.code, next.kind, found.id);
    if (clash) return fail(config, clash);
    Object.assign(found, next);
    return ok(config, found);
  }
  if (offerId && method === 'delete') {
    const index = db.offers.findIndex((o) => o.id === offerId.id);
    if (index < 0) return fail(config, 'Offer not found', 404);
    const [removed] = db.offers.splice(index, 1);
    return ok(config, removed, 200, 'Offer deleted');
  }

  if (method === 'get' && match(path, '/feedback')) {
    return ok(
      config,
      [...db.feedback].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    );
  }
  const feedbackApprove = match(path, '/feedback/:id/approve');
  if (feedbackApprove && method === 'post') {
    const found = db.feedback.find((row) => row.id === feedbackApprove.id);
    if (!found) return fail(config, 'Feedback not found', 404);
    if (found.status === 'withdrawn') return fail(config, 'Withdrawn feedback cannot be approved');
    found.status = 'approved';
    found.moderator = body.moderator || found.moderator;
    const published = found.consent ? upsertTestimonialFromFeedback(found) : null;
    return ok(config, { feedback: found, testimonial: published ?? null }, 200, 'Feedback approved');
  }
  const feedbackReject = match(path, '/feedback/:id/reject');
  if (feedbackReject && method === 'post') {
    const found = db.feedback.find((row) => row.id === feedbackReject.id);
    if (!found) return fail(config, 'Feedback not found', 404);
    if (found.status === 'withdrawn') return fail(config, 'Withdrawn feedback cannot be rejected');
    found.status = 'rejected';
    found.moderator = body.moderator || found.moderator;
    hideTestimonialsForFeedback(found.id);
    return ok(config, found, 200, 'Feedback rejected');
  }

  if (method === 'get' && match(path, '/testimonials')) {
    return ok(
      config,
      [...db.testimonials].sort((a, b) => a.displayOrder - b.displayOrder),
    );
  }
  const testimonialId = match(path, '/testimonials/:id');
  if (testimonialId && method === 'patch') {
    const found = db.testimonials.find((row) => row.id === testimonialId.id);
    if (!found) return fail(config, 'Testimonial not found', 404);
    if (body.displayName !== undefined) found.displayName = String(body.displayName).trim();
    if (body.quote !== undefined) found.quote = String(body.quote).trim();
    if (body.active !== undefined) found.active = Boolean(body.active);
    if (Array.isArray(body.channels)) {
      found.channels = body.channels.filter((c: string) => c === 'app' || c === 'website');
    }
    if (body.displayOrder !== undefined) found.displayOrder = Number(body.displayOrder);
    if (!found.displayName || !found.quote) return fail(config, 'Display name and quote are required');
    return ok(config, found);
  }
  if (testimonialId && method === 'delete') {
    const index = db.testimonials.findIndex((row) => row.id === testimonialId.id);
    if (index < 0) return fail(config, 'Testimonial not found', 404);
    const [removed] = db.testimonials.splice(index, 1);
    return ok(config, removed, 200, 'Testimonial deleted');
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
  await delay(config);
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
