import type { Role } from '@/types';

export const ROLE_LABELS: Record<Role, string> = {
  owner: 'Owner',
  admin: 'Admin',
  branch_manager: 'Branch Manager',
  customer_support: 'Customer Support',
};

export const ALL_ROLES: Role[] = ['owner', 'admin', 'branch_manager', 'customer_support'];
