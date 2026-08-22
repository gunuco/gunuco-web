import { NAV_ITEMS } from '@/constants/nav';
import type { NavItem, Role } from '@/types';
import { isSupportHost } from '@/utils/supportHost';

export function canAccess(role: Role, item: NavItem): boolean {
  return item.roles.includes(role);
}

export function navForRole(role: Role): NavItem[] {
  return NAV_ITEMS.filter((item) => canAccess(role, item));
}

export function canMutateOrders(role: Role): boolean {
  return role === 'owner' || role === 'admin' || role === 'branch_manager';
}

export function canManageCatalog(role: Role): boolean {
  return role === 'owner' || role === 'admin';
}

export function canAssignDelivery(role: Role): boolean {
  return role === 'owner' || role === 'admin' || role === 'branch_manager';
}

export function canAdvanceProduction(role: Role): boolean {
  return role === 'owner' || role === 'admin' || role === 'branch_manager';
}

export function canEditGlobalControls(role: Role): boolean {
  return role === 'owner';
}

export function canManageUsers(role: Role): boolean {
  return role === 'owner' || role === 'admin';
}

export function canWorkSupport(role: Role): boolean {
  return role === 'owner' || role === 'admin' || role === 'branch_manager' || role === 'customer_support';
}

export function isCustomerSupport(role?: Role | null): boolean {
  return role === 'customer_support';
}

export function homePathForRole(role: Role): string {
  if (isSupportHost()) return '/support';
  return role === 'customer_support' ? '/support' : '/dashboard';
}

export function isOwner(role?: Role | null): boolean {
  return role === 'owner';
}
