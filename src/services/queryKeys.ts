export const queryKeys = {
  dashboard: {
    root: ['dashboard'] as const,
    controls: ['dashboard', 'controls'] as const,
  },
  orders: {
    all: ['orders'] as const,
    list: (filters: unknown) => ['orders', 'list', filters] as const,
    detail: (id: string) => ['orders', 'detail', id] as const,
  },
  categories: ['categories'] as const,
  products: (filters?: unknown) => ['products', filters] as const,
  addons: ['addons'] as const,
  deliveryPartners: ['delivery-partners'] as const,
  locations: ['locations'] as const,
  customCakes: ['custom-cakes'] as const,
  offers: ['offers'] as const,
  feedback: ['feedback'] as const,
  testimonials: ['testimonials'] as const,
  reports: ['reports'] as const,
};
