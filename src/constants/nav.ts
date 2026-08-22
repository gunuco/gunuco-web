import type { NavItem, NavSection, Role } from '@/types';

const OA: Role[] = ['owner', 'admin'];
const OPS: Role[] = ['owner', 'admin', 'branch_manager'];
const SUPPORT: Role[] = ['owner', 'admin', 'branch_manager', 'customer_support'];

export const NAV_SECTION_LABELS: Record<NavSection, string> = {
  operations: 'Main menu',
  catalogue: 'Catalogue',
  fulfilment: 'Fulfilment',
  commerce: 'Commerce',
  support: 'Support',
  system: 'System',
};

export const NAV_SECTION_ORDER: NavSection[] = [
  'support',
  'operations',
  'catalogue',
  'fulfilment',
  'commerce',
  'system',
];

export const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', path: '/dashboard', icon: 'dashboard', section: 'operations', roles: OPS },
  { id: 'pos', label: 'Point of Sale', path: '/pos', icon: 'pos', section: 'operations', roles: OPS },
  { id: 'orders', label: 'Orders', path: '/orders', icon: 'orders', section: 'operations', roles: OPS },
  { id: 'order-cycle', label: 'Order Cycle', path: '/order-cycle', icon: 'cycle', section: 'operations', roles: OPS },
  {
    id: 'wedding',
    label: 'Occasion cakes',
    path: '/occasion-cakes',
    icon: 'wedding',
    section: 'operations',
    roles: OPS,
  },
  { id: 'support', label: 'Support inbox', path: '/support', icon: 'support', section: 'support', roles: SUPPORT },
  { id: 'customers', label: 'Customers', path: '/support/customers', icon: 'customers', section: 'support', roles: SUPPORT },
  { id: 'menu', label: 'Menu Management', path: '/menu', icon: 'catalog', section: 'catalogue', roles: OPS },
  { id: 'custom', label: 'Custom Cakes', path: '/custom-cakes', icon: 'custom', section: 'catalogue', roles: OA },
  { id: 'production', label: 'Production Queue', path: '/production', icon: 'production', section: 'fulfilment', roles: OPS },
  {
    id: 'dispatch',
    label: 'Out for Delivery',
    path: '/out-for-delivery',
    icon: 'dispatch',
    section: 'fulfilment',
    roles: OPS,
  },
  { id: 'delivery', label: 'Delivery Partners', path: '/delivery', icon: 'delivery', section: 'fulfilment', roles: OPS },
  { id: 'fulfilment-settings', label: 'Delivery & Pickup', path: '/fulfilment-settings', icon: 'settings', section: 'fulfilment', roles: OA },
  { id: 'offers', label: 'Offers & Discounts', path: '/offers', icon: 'offers', section: 'commerce', roles: OA },
  { id: 'feedback', label: 'Customer Feedback', path: '/feedback', icon: 'feedback', section: 'commerce', roles: OA },
  { id: 'testimonials', label: 'Testimonials', path: '/testimonials', icon: 'testimonials', section: 'commerce', roles: OA },
  { id: 'cancellations', label: 'Cancel Orders', path: '/cancellations', icon: 'cancel', section: 'commerce', roles: OA },
  { id: 'refunds', label: 'Refunds', path: '/refunds', icon: 'refund', section: 'commerce', roles: [...OA, 'customer_support'] },
  { id: 'returns', label: 'Returns', path: '/returns', icon: 'returns', section: 'commerce', roles: OA },
  { id: 'locations', label: 'Locations & Branches', path: '/locations', icon: 'locations', section: 'system', roles: ['owner'] },
  { id: 'access', label: 'Access', path: '/access', icon: 'access', section: 'system', roles: OA },
  { id: 'reports', label: 'Reports', path: '/reports', icon: 'reports', section: 'system', roles: OA },
  { id: 'settings', label: 'Settings', path: '/settings', section: 'system', icon: 'settings', roles: SUPPORT },
];
