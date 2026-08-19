/**
 * Single source of truth for REST paths.
 * Swap the host via VITE_API_BASE_URL — never hardcode URLs in UI or hooks.
 */
export const ENDPOINTS = {
  auth: {
    login: '/auth/login',
  },
  dashboard: '/dashboard',
  dashboardControls: '/dashboard/controls',
  orders: '/orders',
  order: (id: string) => `/orders/${id}`,
  orderAccept: (id: string) => `/orders/${id}/accept`,
  orderReject: (id: string) => `/orders/${id}/reject`,
  orderAssign: (id: string) => `/orders/${id}/assign`,
  categories: '/categories',
  category: (id: string) => `/categories/${id}`,
  products: '/products',
  product: (id: string) => `/products/${id}`,
  addons: '/addons',
  addon: (id: string) => `/addons/${id}`,
  deliveryPartners: '/delivery-partners',
  deliveryPartner: (id: string) => `/delivery-partners/${id}`,
  locations: '/locations',
  customCakes: '/custom-cakes',
  customCake: (id: string) => `/custom-cakes/${id}`,
  posCheckout: '/pos/checkout',
  reportsSummary: '/reports/summary',
} as const;
