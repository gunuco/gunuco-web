import type { User } from '@/types';

export const DEMO_PASSWORD = 'gunuco123';

export const seedUsers: User[] = [
  {
    id: 'usr_owner',
    name: 'Dileep Reddy',
    email: 'owner@gunuco.com',
    role: 'owner',
    avatarInitials: 'DR',
    locationIds: ['loc_production'],
  },
  {
    id: 'usr_admin',
    name: 'Ananya Rao',
    email: 'admin@gunuco.com',
    role: 'admin',
    avatarInitials: 'AR',
    locationIds: ['loc_production'],
  },
  {
    id: 'usr_bm',
    name: 'Vikram Shah',
    email: 'manager@gunuco.com',
    role: 'branch_manager',
    avatarInitials: 'VS',
    locationIds: ['loc_production'],
  },
];
