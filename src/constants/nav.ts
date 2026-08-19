import type { NavItem, NavSection, Role } from '@/types';

const OA: Role[] = ['owner', 'admin'];
const ALL: Role[] = ['owner', 'admin', 'branch_manager'];

export const NAV_SECTION_LABELS: Record<NavSection, string> = {
  operations: 'Main menu',
  catalogue: 'Catalogue',
  fulfilment: 'Fulfilment',
  commerce: 'Commerce',
  system: 'System',
};

export const NAV_SECTION_ORDER: NavSection[] = [
  'operations',
  'catalogue',
  'fulfilment',
  'commerce',
  'system',
];

export const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', path: '/dashboard', icon: 'dashboard', section: 'operations', roles: ALL },
  { id: 'pos', label: 'Point of Sale', path: '/pos', icon: 'pos', section: 'operations', roles: ALL },
  { id: 'orders', label: 'Orders', path: '/orders', icon: 'orders', section: 'operations', roles: ALL },
  { id: 'order-cycle', label: 'Order Cycle', path: '/order-cycle', icon: 'cycle', section: 'operations', roles: ALL },
  {
    id: 'wedding',
    label: 'Wedding & Anniversary',
    path: '/wedding-orders',
    icon: 'wedding',
    section: 'operations',
    roles: ALL,
  },
  { id: 'support', label: 'Support Tickets', path: '/support', icon: 'support', section: 'operations', roles: ALL },
  { id: 'menu', label: 'Menu Management', path: '/menu', icon: 'catalog', section: 'catalogue', roles: ALL },
  { id: 'custom', label: 'Custom Cakes', path: '/custom-cakes', icon: 'custom', section: 'catalogue', roles: OA },
  { id: 'production', label: 'Production Queue', path: '/production', icon: 'production', section: 'fulfilment', roles: ALL },
  {
    id: 'dispatch',
    label: 'Out for Delivery',
    path: '/out-for-delivery',
    icon: 'dispatch',
    section: 'fulfilment',
    roles: ALL,
  },
  { id: 'delivery', label: 'Delivery Partners', path: '/delivery', icon: 'delivery', section: 'fulfilment', roles: ALL },
  { id: 'fulfilment-settings', label: 'Delivery & Pickup', path: '/fulfilment-settings', icon: 'settings', section: 'fulfilment', roles: OA },
  { id: 'offers', label: 'Offers & Discounts', path: '/offers', icon: 'offers', section: 'commerce', roles: OA },
  { id: 'feedback', label: 'Customer Feedback', path: '/feedback', icon: 'feedback', section: 'commerce', roles: OA },
  { id: 'testimonials', label: 'Testimonials', path: '/testimonials', icon: 'testimonials', section: 'commerce', roles: OA },
  { id: 'cancellations', label: 'Cancel Orders', path: '/cancellations', icon: 'cancel', section: 'commerce', roles: OA },
  { id: 'refunds', label: 'Refunds', path: '/refunds', icon: 'refund', section: 'commerce', roles: OA },
  { id: 'returns', label: 'Returns', path: '/returns', icon: 'returns', section: 'commerce', roles: OA },
  { id: 'locations', label: 'Locations & Branches', path: '/locations', icon: 'locations', section: 'system', roles: ['owner'] },
  { id: 'access', label: 'Access', path: '/access', icon: 'access', section: 'system', roles: OA },
  { id: 'reports', label: 'Reports', path: '/reports', icon: 'reports', section: 'system', roles: OA },
  { id: 'settings', label: 'Settings', path: '/settings', section: 'system', icon: 'settings', roles: ALL },
];
